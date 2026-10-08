// Bron və tutum qaydaları — HTTP-dən asılı olmadan test edilir (bax tests/booking.test.js).
// "Heç vaxt artıq satma" qaydası: tək atomik UPDATE (booked+n<=capacity) + yoxlama,
// idempotency key hər (session, key) üçün unikal constraint ilə ikinci müdafiə xətti kimi.
//
// Vacib qeyd: Postgres-də tranzaksiya daxilində bir sorğu xəta versə (məs. unique violation),
// bütün tranzaksiya "aborted" vəziyyətinə keçir və eyni tranzaksiyada YENİDƏN sorğu göndərmək
// mümkün deyil. Ona görə burada tranzaksiya-daxili "tut və yenidən cəhd et" APARILMIR —
// xəta `db.withTransaction`-dan çıxandan sonra (artıq ROLLBACK edilib, bağlantı təmizdir)
// idarə olunur.
import { randomUUID } from 'node:crypto';
import { normalizePhoneAz } from '../lib/phone.js';
import { findOrCreateCustomer, findOrCreateChild } from '../repositories/customers.js';
import {
  findBookingByIdempotencyKey, tryReserveSeat, releaseSeat, insertBooking, linkBookingChild,
  updateBookingStatus, earliestWaitlistBooking, generateBookingReference, findBookingById,
} from '../repositories/bookings.js';
import { getSessionById } from '../repositories/masterclasses.js';
import { addStamp } from '../repositories/loyalty.js';

export class SessionNotFoundError extends Error {
  constructor(sessionId) { super(`Seans tapılmadı: ${sessionId}`); this.name = 'SessionNotFoundError'; }
}
export class BookingNotFoundError extends Error {
  constructor(id) { super(`Bron tapılmadı: ${id}`); this.name = 'BookingNotFoundError'; }
}
export class BookingNotCancellableError extends Error {
  constructor(id, status) { super(`Bron "${id}" (status: ${status}) ləğv edilə bilməz`); this.name = 'BookingNotCancellableError'; }
}

const SEATS_PER_BOOKING = 1; // hazırkı axında hər bron 1 uşaq üçündür (BRIEF Kassa axını)

function isUniqueViolation(err) {
  return err?.code === '23505' || /duplicate key|unique constraint/i.test(String(err?.message));
}
function isIdempotencyKeyViolation(err) {
  return /idempotency_key/i.test(String(err?.message));
}

async function attemptReservation(tx, input, phoneE164) {
  const existing = await findBookingByIdempotencyKey(tx, input.sessionId, input.idempotencyKey);
  if (existing) return { booking: existing, alreadyExisted: true };

  const session = await getSessionById(tx, input.sessionId);
  if (!session) throw new SessionNotFoundError(input.sessionId);

  const customer = await findOrCreateCustomer(tx, {
    phoneE164,
    fullName: input.parent.fullName,
    marketingConsent: Boolean(input.marketingConsent),
  });

  await tx.query(
    `INSERT INTO consents (id, customer_id, policy_version, text_shown, marketing_opt_in)
     VALUES ($1,$2,'v1','Qaydalarla və şəxsi məlumatların emalı ilə razıyam',$3)`,
    [randomUUID(), customer.id, Boolean(input.marketingConsent)],
  );

  const child = await findOrCreateChild(tx, {
    customerId: customer.id,
    firstName: input.child.firstName,
    birthYear: input.child.birthYear,
    allergyNote: input.child.allergyNote,
  });

  const reserved = await tryReserveSeat(tx, input.sessionId, SEATS_PER_BOOKING);
  const status = reserved ? 'confirmed' : 'waitlist';

  let priceAzn = Number(session.price_azn);
  let wasEarlyBird = false;
  if (reserved && session.early_bird_slots > 0 && session.early_bird_price_azn != null) {
    // reserved.booked UPDATE-dən SONRAKI dəyərdir (atomik) — əvvəlki dəyəri cəbrlə çıxarırıq,
    // əlavə (racy) oxuma lazım deyil.
    const bookedBeforeThis = reserved.booked - SEATS_PER_BOOKING;
    if (bookedBeforeThis < session.early_bird_slots) {
      priceAzn = Number(session.early_bird_price_azn);
      wasEarlyBird = true;
    }
  }

  const booking = await insertBooking(tx, {
    sessionId: input.sessionId,
    customerId: customer.id,
    seats: SEATS_PER_BOOKING,
    status,
    reference: generateBookingReference(),
    idempotencyKey: input.idempotencyKey,
    priceAzn,
    wasEarlyBird,
    discountCode: input.discountCode,
  });

  await linkBookingChild(tx, booking.id, child.id);
  if (status === 'confirmed') await addStamp(tx, customer.id);

  return { booking, alreadyExisted: false };
}

export async function reserveSeat(db, input) {
  const phoneE164 = normalizePhoneAz(input.parent.phone);

  try {
    return await db.withTransaction((tx) => attemptReservation(tx, input, phoneE164));
  } catch (err) {
    if (isUniqueViolation(err) && isIdempotencyKeyViolation(err)) {
      // Paralel eyni-key sorğusu bizdən əvvəl commit etdi — tranzaksiya artıq ROLLBACK
      // edilib (db.withTransaction tərəfindən), buna görə təzə (tranzaksiyasız) sorğu ilə
      // mövcud sətri gətiririk.
      const booking = await findBookingByIdempotencyKey(db, input.sessionId, input.idempotencyKey);
      if (booking) return { booking, alreadyExisted: true };
    }
    throw err;
  }
}

export async function cancelBooking(db, bookingId) {
  return db.withTransaction(async (tx) => {
    const booking = await findBookingById(tx, bookingId);
    if (!booking) throw new BookingNotFoundError(bookingId);
    if (!['confirmed', 'pending', 'waitlist'].includes(booking.status)) {
      throw new BookingNotCancellableError(bookingId, booking.status);
    }

    const wasConfirmed = booking.status === 'confirmed';
    await updateBookingStatus(tx, bookingId, 'cancelled');
    if (wasConfirmed) await releaseSeat(tx, booking.session_id, booking.seats);

    let promoted = null;
    if (wasConfirmed) {
      const next = await earliestWaitlistBooking(tx, booking.session_id);
      if (next) {
        const reserved = await tryReserveSeat(tx, booking.session_id, next.seats);
        if (reserved) promoted = await updateBookingStatus(tx, next.id, 'confirmed');
      }
    }

    return { cancelled: await findBookingById(tx, bookingId), promoted };
  });
}
