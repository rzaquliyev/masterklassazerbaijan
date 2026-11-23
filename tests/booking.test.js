import { randomUUID } from 'node:crypto';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDb, seedHouseAndMasterclass, makeBookingInput } from './helpers/testDb.js';
import {
  reserveSeat, cancelBooking, setBookingSeatStatus, BookingNotCancellableError, SessionNotFoundError, SessionFullError, TooManyBookingsError,
} from '../src/services/booking.js';

describe('bron və tutum (services/booking.js)', () => {
  test('son yeri bron etmək uğurlu olur və seans "confirmed" statusunda qeyd olunur', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 1, booked: 0 });

    const { booking, alreadyExisted } = await reserveSeat(db, makeBookingInput({ sessionId }));

    assert.equal(alreadyExisted, false);
    assert.equal(booking.status, 'confirmed');
    const { rows } = await db.query('SELECT booked, capacity FROM sessions WHERE id = $1', [sessionId]);
    assert.equal(rows[0].booked, 1);
    assert.equal(rows[0].booked, rows[0].capacity);
  });

  test('son yer üçün eyni anda iki bron cəhdindən yalnız biri "confirmed" olur, digəri gözləmə siyahısına düşür', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 1, booked: 0 });

    const [a, b] = await Promise.all([
      reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'Valideyn A', phone: '0551111111' } })),
      reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'Valideyn B', phone: '0552222222' } })),
    ]);

    const statuses = [a.booking.status, b.booking.status].sort();
    assert.deepEqual(statuses, ['confirmed', 'waitlist']);

    const { rows } = await db.query('SELECT booked, capacity FROM sessions WHERE id = $1', [sessionId]);
    assert.equal(rows[0].booked, rows[0].capacity, 'tutum heç vaxt aşılmamalıdır');
  });

  test('eyni idempotency key ilə təkrar göndəriş ikinci bron yaratmır', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 5, booked: 0 });
    const input = makeBookingInput({ sessionId, idempotencyKey: 'sabit-acnahtar-123' });

    const first = await reserveSeat(db, input);
    const second = await reserveSeat(db, input);

    assert.equal(first.booking.id, second.booking.id);
    assert.equal(second.alreadyExisted, true);

    const { rows } = await db.query('SELECT count(*)::int AS n FROM bookings WHERE session_id = $1', [sessionId]);
    assert.equal(rows[0].n, 1);
    const { rows: s } = await db.query('SELECT booked FROM sessions WHERE id = $1', [sessionId]);
    assert.equal(s[0].booked, 1, 'yer yalnız bir dəfə azaldılmalıdır');
  });

  test('eyni telefon nömrəsi ilə iki bron — bir müştəri qeydi, iki bron qeydi', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 5, booked: 0 });
    const phone = '+994501234567';

    await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'Aynur', phone }, child: { firstName: 'Aysu' } }));
    await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'Aynur', phone }, child: { firstName: 'Orxan' } }));

    const { rows: customers } = await db.query('SELECT * FROM customers WHERE phone_e164 = $1', ['+994501234567']);
    assert.equal(customers.length, 1);
    const { rows: bookings } = await db.query('SELECT * FROM bookings WHERE customer_id = $1', [customers[0].id]);
    assert.equal(bookings.length, 2);
  });

  test('bron ləğvi yeri azad edir və gözləmə siyahısındakı bronu təsdiqləyir', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 1, booked: 0 });

    const first = await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'A', phone: '0551111111' } }));
    const waitlisted = await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'B', phone: '0552222222' } }));
    assert.equal(first.booking.status, 'confirmed');
    assert.equal(waitlisted.booking.status, 'waitlist');

    const { cancelled, promoted } = await cancelBooking(db, first.booking.id);
    assert.equal(cancelled.status, 'cancelled');
    assert.ok(promoted, 'gözləmə siyahısındakı bron təsdiqlənməlidir');
    assert.equal(promoted.id, waitlisted.booking.id);
    assert.equal(promoted.status, 'confirmed');

    const { rows } = await db.query('SELECT booked, capacity FROM sessions WHERE id = $1', [sessionId]);
    assert.equal(rows[0].booked, 1);
    assert.equal(rows[0].booked, rows[0].capacity);
  });

  test('ləğv edilmiş bron yenidən ləğv edilə bilməz', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 1, booked: 0 });
    const { booking } = await reserveSeat(db, makeBookingInput({ sessionId }));
    await cancelBooking(db, booking.id);

    await assert.rejects(() => cancelBooking(db, booking.id), BookingNotCancellableError);
  });

  test('tutum dolu olanda yeni bron "waitlist" statusu ilə yaranır, tutum aşılmır', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 2, booked: 2 });

    const { booking } = await reserveSeat(db, makeBookingInput({ sessionId }));
    assert.equal(booking.status, 'waitlist');

    const { rows } = await db.query('SELECT booked, capacity FROM sessions WHERE id = $1', [sessionId]);
    assert.equal(rows[0].booked, 2);
  });

  test('erkən-quş qiyməti yalnız ilk N yer üçün tətbiq olunur', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, {
      capacity: 5, booked: 0, price: 25, earlyBirdPrice: 18, earlyBirdSlots: 2,
    });

    const b1 = await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'A', phone: '0551111111' } }));
    const b2 = await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'B', phone: '0552222222' } }));
    const b3 = await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'C', phone: '0553333333' } }));

    assert.equal(Number(b1.booking.price_azn), 18);
    assert.equal(b1.booking.was_early_bird, true);
    assert.equal(Number(b2.booking.price_azn), 18);
    assert.equal(Number(b3.booking.price_azn), 25);
    assert.equal(b3.booking.was_early_bird, false);
  });

  test('möhür bron anında yox, "attended" qeyd ediləndə verilir; 5-ci iştirak pulsuz masterklass qazandırır', async () => {
    const db = await createTestDb();
    const { sessionId, masterclassId } = await seedHouseAndMasterclass(db, { capacity: 10, booked: 0 });
    const sessionIds = [sessionId];
    for (let i = 1; i < 5; i++) {
      const id = randomUUID();
      await db.query(
        `INSERT INTO sessions (id, masterclass_id, starts_at, capacity, booked, price_azn, location, status)
         VALUES ($1,$2, now() + ($3 || ' days')::interval, 10, 0, 25, 'SAMPLE', 'scheduled')`,
        [id, masterclassId, String(i + 1)],
      );
      sessionIds.push(id);
    }
    const phone = '0557654321';

    const bookings = [];
    for (const sid of sessionIds) {
      const { booking } = await reserveSeat(db, makeBookingInput({ sessionId: sid, parent: { fullName: 'Sabit valideyn', phone } }));
      bookings.push(booking);
    }
    const customerId = bookings[0].customer_id;
    const before = await db.query('SELECT * FROM loyalty_stamps WHERE customer_id = $1', [customerId]);
    assert.equal(before.rows.length, 0, 'bron özü möhür vermir');

    for (const b of bookings) await setBookingSeatStatus(db, b.id, 'attended');
    await setBookingSeatStatus(db, bookings[0].id, 'attended'); // təkrar "attended" ikinci möhür vermir

    const { rows } = await db.query('SELECT * FROM loyalty_stamps WHERE customer_id = $1', [customerId]);
    assert.equal(rows[0].stamp_count, 0, '5-də sayğac sıfırlanır');
    assert.equal(rows[0].free_sessions_available, 1);
  });

  test('bir telefon bir seansa ən çox 3 aktiv bron edə bilər (OTP-siz spam həddi)', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 10, booked: 0 });
    const parent = { fullName: 'Spam', phone: '0559998877' };
    for (let i = 0; i < 3; i++) await reserveSeat(db, makeBookingInput({ sessionId, parent }));
    await assert.rejects(() => reserveSeat(db, makeBookingInput({ sessionId, parent })), TooManyBookingsError);
    const { rows } = await db.query('SELECT booked FROM sessions WHERE id = $1', [sessionId]);
    assert.equal(rows[0].booked, 3);
  });

  for (const [label, sql] of [
    ['ləğv edilmiş', `UPDATE sessions SET status = 'cancelled' WHERE id = $1`],
    ['keçmiş', `UPDATE sessions SET starts_at = now() - interval '1 day' WHERE id = $1`],
    ['gizli masterklassın', `UPDATE masterclasses SET is_published = false WHERE id = (SELECT masterclass_id FROM sessions WHERE id = $1)`],
  ]) {
    test(`${label} seansa bron edilə bilmir (yer tutulmur)`, async () => {
      const db = await createTestDb();
      const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 5, booked: 0 });
      await db.query(sql, [sessionId]);

      await assert.rejects(() => reserveSeat(db, makeBookingInput({ sessionId })), SessionNotFoundError);
      const { rows } = await db.query('SELECT booked FROM sessions WHERE id = $1', [sessionId]);
      assert.equal(rows[0].booked, 0);
      const count = await db.query('SELECT count(*)::int AS n FROM bookings');
      assert.equal(count.rows[0].n, 0);
    });
  }

  test('admin gözləmə siyahısındakı bronu təsdiqləyəndə tutum aşılmır (yer yoxdursa SessionFullError)', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 1, booked: 0 });
    await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'A', phone: '0551111111' } }));
    const { booking: waiting } = await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'B', phone: '0552222222' } }));
    assert.equal(waiting.status, 'waitlist');

    await assert.rejects(() => setBookingSeatStatus(db, waiting.id, 'confirmed'), SessionFullError);
    const { rows } = await db.query(
      `SELECT booked, (SELECT count(*)::int FROM bookings WHERE session_id = $1 AND status = 'confirmed') AS confirmed
       FROM sessions WHERE id = $1`, [sessionId],
    );
    assert.equal(rows[0].booked, 1);
    assert.equal(rows[0].confirmed, 1);
  });

  test('admin təsdiqi boş yer olanda yer tutur, confirmed → attended yeri ikiqat saymır', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 2, booked: 0 });
    const { booking: a } = await reserveSeat(db, makeBookingInput({ sessionId, parent: { fullName: 'A', phone: '0551111111' } }));
    await cancelBooking(db, a.id);

    const confirmed = await setBookingSeatStatus(db, a.id, 'confirmed');
    assert.equal(confirmed.status, 'confirmed');
    await setBookingSeatStatus(db, a.id, 'attended');
    const { rows } = await db.query('SELECT booked FROM sessions WHERE id = $1', [sessionId]);
    assert.equal(rows[0].booked, 1);
  });
});
