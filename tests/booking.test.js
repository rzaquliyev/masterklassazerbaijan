import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDb, seedHouseAndMasterclass, makeBookingInput } from './helpers/testDb.js';
import { reserveSeat, cancelBooking, BookingNotCancellableError } from '../src/services/booking.js';

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

  test('5-ci təsdiqlənmiş brondan sonra loyallıq pulsuz masterklass qazandırır', async () => {
    const db = await createTestDb();
    const { sessionId } = await seedHouseAndMasterclass(db, { capacity: 10, booked: 0 });
    const phone = '0557654321';

    let customerId;
    for (let i = 0; i < 5; i++) {
      const { booking } = await reserveSeat(db, makeBookingInput({
        sessionId, idempotencyKey: `key-${i}`, parent: { fullName: 'Sabit valideyn', phone },
      }));
      customerId = booking.customer_id;
    }

    const { rows } = await db.query('SELECT * FROM loyalty_stamps WHERE customer_id = $1', [customerId]);
    assert.equal(rows[0].stamp_count, 0, '5-də sayğac sıfırlanır');
    assert.equal(rows[0].free_sessions_available, 1);
  });
});
