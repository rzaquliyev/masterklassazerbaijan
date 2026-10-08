import { randomUUID, randomInt } from 'node:crypto';

export function generateBookingReference() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // qarışıqlıq yaradan I/O xaric
  let code = '';
  for (let i = 0; i < 4; i++) code += letters[randomInt(letters.length)];
  const digits = String(randomInt(0, 10000)).padStart(4, '0');
  return `${code}-${digits}`;
}

export async function findBookingByIdempotencyKey(db, sessionId, idempotencyKey) {
  const { rows } = await db.query(
    'SELECT * FROM bookings WHERE session_id = $1 AND idempotency_key = $2',
    [sessionId, idempotencyKey],
  );
  return rows[0] ?? null;
}

export async function findBookingById(db, id) {
  const { rows } = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return rows[0] ?? null;
}

// Atomik tutum artırımı: yalnız yer varsa uğurlu olur, sətri qaytarır; yoxdursa heç nə qaytarmır.
export async function tryReserveSeat(db, sessionId, seats) {
  const { rows } = await db.query(
    `UPDATE sessions SET booked = booked + $2
     WHERE id = $1 AND booked + $2 <= capacity
     RETURNING *`,
    [sessionId, seats],
  );
  return rows[0] ?? null;
}

export async function releaseSeat(db, sessionId, seats) {
  const { rows } = await db.query(
    `UPDATE sessions SET booked = GREATEST(0, booked - $2) WHERE id = $1 RETURNING *`,
    [sessionId, seats],
  );
  return rows[0] ?? null;
}

export async function insertBooking(db, {
  sessionId, customerId, seats, status, reference, idempotencyKey, priceAzn, wasEarlyBird, discountCode,
}) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO bookings
      (id, session_id, customer_id, seats, status, reference, idempotency_key, price_azn, was_early_bird, discount_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [id, sessionId, customerId, seats, status, reference, idempotencyKey, priceAzn, wasEarlyBird, discountCode ?? null],
  );
  return rows[0];
}

export async function linkBookingChild(db, bookingId, childId) {
  await db.query(
    'INSERT INTO booking_children (booking_id, child_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [bookingId, childId],
  );
}

export async function updateBookingStatus(db, bookingId, status) {
  const { rows } = await db.query(
    'UPDATE bookings SET status = $2 WHERE id = $1 RETURNING *',
    [bookingId, status],
  );
  return rows[0] ?? null;
}

export async function earliestWaitlistBooking(db, sessionId) {
  const { rows } = await db.query(
    `SELECT * FROM bookings WHERE session_id = $1 AND status = 'waitlist'
     ORDER BY created_at ASC LIMIT 1`,
    [sessionId],
  );
  return rows[0] ?? null;
}

export async function getBookingWithDetails(db, bookingId) {
  const { rows } = await db.query(
    `SELECT b.*, c.full_name AS parent_name, c.phone_e164,
            ch.first_name AS child_first_name,
            s.starts_at, s.location, s.capacity, s.booked,
            m.title AS masterclass_title, m.slug AS masterclass_slug
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     LEFT JOIN booking_children bc ON bc.booking_id = b.id
     LEFT JOIN children ch ON ch.id = bc.child_id
     JOIN sessions s ON s.id = b.session_id
     JOIN masterclasses m ON m.id = s.masterclass_id
     WHERE b.id = $1`,
    [bookingId],
  );
  return rows[0] ?? null;
}

export async function listBookingsByCustomer(db, customerId) {
  const { rows } = await db.query(
    'SELECT * FROM bookings WHERE customer_id = $1 ORDER BY created_at DESC',
    [customerId],
  );
  return rows;
}
