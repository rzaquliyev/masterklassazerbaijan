import { randomUUID } from 'node:crypto';

export async function listFaqByTab(db) {
  const { rows } = await db.query('SELECT * FROM faq_items ORDER BY tab ASC, sort_order ASC');
  const byTab = {};
  for (const row of rows) {
    if (!byTab[row.tab]) byTab[row.tab] = [];
    byTab[row.tab].push(row);
  }
  return byTab;
}

export async function listPublishedGalleryPhotos(db, houseSlug) {
  const { rows } = await db.query(
    `SELECT g.*, h.name AS house_name, h.color_hex AS house_color, h.slug AS house_slug
     FROM gallery_photos g LEFT JOIN houses h ON h.id = g.house_id
     WHERE g.is_published = true AND g.consent = true
       AND ($1::text IS NULL OR h.slug = $1)
     ORDER BY g.created_at DESC`,
    [houseSlug ?? null],
  );
  return rows;
}

export async function insertInquiry(db, { type, name, phone, email, message, birthdayPackage, birthdayGuestCount, birthdayDate }) {
  const id = randomUUID();
  await db.query(
    `INSERT INTO inquiries (id, type, name, phone, email, message, birthday_package, birthday_guest_count, birthday_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, type, name, phone ?? null, email ?? null, message ?? null, birthdayPackage ?? null, birthdayGuestCount ?? null, birthdayDate ?? null],
  );
  return id;
}

export async function getLoyaltyByPhoneAndBookingCode(db, phoneE164, bookingReference) {
  // Sadə "OTP əvəzi" yoxlama (Phase 0 qərarı): telefon + son bron kodu uyğun gəlməlidir.
  const { rows } = await db.query(
    `SELECT c.id AS customer_id, c.full_name, l.stamp_count, l.free_sessions_available
     FROM customers c
     JOIN bookings b ON b.customer_id = c.id
     LEFT JOIN loyalty_stamps l ON l.customer_id = c.id
     WHERE c.phone_e164 = $1 AND b.reference = $2
     LIMIT 1`,
    [phoneE164, bookingReference],
  );
  return rows[0] ?? null;
}

export async function createDiscountCode(db, { code, type, ownerCustomerId, percent, expiresAt }) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO discount_codes (id, code, type, owner_customer_id, percent, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [id, code, type, ownerCustomerId ?? null, percent, expiresAt ?? null],
  );
  return rows[0];
}

export async function findDiscountCodeByOwner(db, ownerCustomerId, type) {
  const { rows } = await db.query(
    'SELECT * FROM discount_codes WHERE owner_customer_id = $1 AND type = $2 AND status = $3 LIMIT 1',
    [ownerCustomerId, type, 'active'],
  );
  return rows[0] ?? null;
}

export async function findDiscountCodeByCode(db, code) {
  const { rows } = await db.query('SELECT * FROM discount_codes WHERE code = $1', [code]);
  return rows[0] ?? null;
}
