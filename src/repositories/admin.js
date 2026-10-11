import { randomUUID } from 'node:crypto';

// ---------- Dashboard ----------
export async function dashboardStats(db) {
  const [upcoming, seats, newBookings, newInquiries] = await Promise.all([
    db.query(`SELECT count(*)::int AS n FROM sessions WHERE status = 'scheduled' AND starts_at > now()`),
    db.query(`SELECT COALESCE(sum(booked),0)::int AS booked, COALESCE(sum(capacity),0)::int AS capacity
               FROM sessions WHERE status = 'scheduled' AND starts_at > now()`),
    db.query(`SELECT count(*)::int AS n FROM bookings WHERE created_at > now() - interval '7 days'`),
    db.query(`SELECT count(*)::int AS n FROM inquiries WHERE status = 'new'`),
  ]);
  return {
    upcomingSessions: upcoming.rows[0].n,
    seatsBooked: seats.rows[0].booked,
    seatsCapacity: seats.rows[0].capacity,
    newBookings7d: newBookings.rows[0].n,
    newInquiries: newInquiries.rows[0].n,
  };
}

export async function listUpcomingSessionsAdmin(db) {
  const { rows } = await db.query(`
    SELECT s.*, m.title AS masterclass_title, m.slug AS masterclass_slug, h.name AS house_name
    FROM sessions s JOIN masterclasses m ON m.id = s.masterclass_id LEFT JOIN houses h ON h.id = m.house_id
    WHERE s.status = 'scheduled' AND s.starts_at > now()
    ORDER BY s.starts_at ASC
  `);
  return rows;
}

// ---------- Masterclasses ----------
export async function listMasterclassesAdmin(db) {
  const { rows } = await db.query(`
    SELECT m.*, h.name AS house_name, h.color_hex AS house_color,
           (SELECT count(*)::int FROM sessions s WHERE s.masterclass_id = m.id AND s.status='scheduled' AND s.starts_at > now()) AS upcoming_session_count
    FROM masterclasses m LEFT JOIN houses h ON h.id = m.house_id
    ORDER BY m.title ASC
  `);
  return rows;
}

export async function getMasterclassAdmin(db, id) {
  const { rows } = await db.query('SELECT * FROM masterclasses WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createMasterclass(db, { houseId, slug, title, description, ageMin, ageMax }) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO masterclasses (id, house_id, slug, title, description, age_min, age_max, is_published, is_sample)
     VALUES ($1,$2,$3,$4,$5,$6,$7,false,false) RETURNING *`,
    [id, houseId || null, slug, title, description || null, ageMin, ageMax],
  );
  return rows[0];
}

export async function updateMasterclass(db, id, { houseId, slug, title, description, ageMin, ageMax }) {
  const { rows } = await db.query(
    `UPDATE masterclasses SET house_id=$2, slug=$3, title=$4, description=$5, age_min=$6, age_max=$7
     WHERE id = $1 RETURNING *`,
    [id, houseId || null, slug, title, description || null, ageMin, ageMax],
  );
  return rows[0] ?? null;
}

export async function setMasterclassPublished(db, id, isPublished) {
  const { rows } = await db.query(
    'UPDATE masterclasses SET is_published = $2 WHERE id = $1 RETURNING *',
    [id, isPublished],
  );
  return rows[0] ?? null;
}

// ---------- Sessions ----------
export async function listSessionsForMasterclassAdmin(db, masterclassId) {
  const { rows } = await db.query(
    'SELECT * FROM sessions WHERE masterclass_id = $1 ORDER BY starts_at DESC',
    [masterclassId],
  );
  return rows;
}

export async function createSessionAdmin(db, {
  masterclassId, startsAt, capacity, priceAzn, earlyBirdPriceAzn, earlyBirdSlots, location,
}) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO sessions (id, masterclass_id, starts_at, capacity, booked, price_azn, early_bird_price_azn, early_bird_slots, location, status)
     VALUES ($1,$2,$3,$4,0,$5,$6,$7,$8,'scheduled') RETURNING *`,
    [id, masterclassId, startsAt, capacity, priceAzn, earlyBirdPriceAzn || null, earlyBirdSlots || 0, location],
  );
  return rows[0];
}

export class CapacityBelowBookedError extends Error {
  constructor(id) { super(`Seans "${id}" üçün tutum artıq bron olunmuş yer sayından az ola bilməz`); this.name = 'CapacityBelowBookedError'; }
}

export async function updateSessionAdmin(db, id, { startsAt, capacity, priceAzn, earlyBirdPriceAzn, earlyBirdSlots, location }) {
  try {
    const { rows } = await db.query(
      `UPDATE sessions SET starts_at=$2, capacity=$3, price_azn=$4, early_bird_price_azn=$5, early_bird_slots=$6, location=$7
       WHERE id = $1 RETURNING *`,
      [id, startsAt, capacity, priceAzn, earlyBirdPriceAzn || null, earlyBirdSlots || 0, location],
    );
    return rows[0] ?? null;
  } catch (err) {
    if (err?.code === '23514' && err?.constraint === 'sessions_check') throw new CapacityBelowBookedError(id);
    throw err;
  }
}

export async function cancelSessionAdmin(db, id) {
  const { rows } = await db.query(
    `UPDATE sessions SET status = 'cancelled' WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}

// ---------- Bookings ----------
export async function listBookingsAdmin(db, { status, search, limit = 100 } = {}) {
  const conditions = [];
  const params = [];
  if (status) { params.push(status); conditions.push(`b.status = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(c.full_name ILIKE $${params.length} OR c.phone_e164 ILIKE $${params.length} OR b.reference ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit);
  const { rows } = await db.query(
    `SELECT b.*, c.full_name AS parent_name, c.phone_e164,
            ch.first_name AS child_first_name,
            s.starts_at, m.title AS masterclass_title
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     LEFT JOIN booking_children bc ON bc.booking_id = b.id
     LEFT JOIN children ch ON ch.id = bc.child_id
     JOIN sessions s ON s.id = b.session_id
     JOIN masterclasses m ON m.id = s.masterclass_id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT $${params.length}`,
    params,
  );
  return rows;
}

export async function updateBookingNotes(db, id, notes) {
  const { rows } = await db.query('UPDATE bookings SET admin_notes = $2 WHERE id = $1 RETURNING *', [id, notes]);
  return rows[0] ?? null;
}

export async function listAllBookingsForExport(db) {
  const { rows } = await db.query(`
    SELECT b.reference, b.status, b.price_azn, b.seats, b.was_early_bird, b.created_at,
           c.full_name AS parent_name, c.phone_e164,
           ch.first_name AS child_first_name,
           s.starts_at, m.title AS masterclass_title
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    LEFT JOIN booking_children bc ON bc.booking_id = b.id
    LEFT JOIN children ch ON ch.id = bc.child_id
    JOIN sessions s ON s.id = b.session_id
    JOIN masterclasses m ON m.id = s.masterclass_id
    ORDER BY b.created_at DESC
  `);
  return rows;
}

// ---------- Customers ----------
export async function listCustomersAdmin(db, { search } = {}) {
  const params = [];
  let where = '';
  if (search) { params.push(`%${search}%`); where = `WHERE full_name ILIKE $1 OR phone_e164 ILIKE $1`; }
  const { rows } = await db.query(
    `SELECT c.*, (SELECT count(*)::int FROM bookings b WHERE b.customer_id = c.id) AS booking_count
     FROM customers c ${where} ORDER BY c.created_at DESC LIMIT 200`,
    params,
  );
  return rows;
}

export async function getCustomerAdmin(db, id) {
  const { rows } = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function updateCustomerNotes(db, id, notes) {
  const { rows } = await db.query('UPDATE customers SET admin_notes = $2 WHERE id = $1 RETURNING *', [id, notes]);
  return rows[0] ?? null;
}

// Hard silmək əvəzinə anonimləşdirmə: bron/statistika tamlığı qalır, şəxsi məlumat itir (BRIEF məxfilik qaydası).
export async function anonymizeCustomer(db, id) {
  // phone_e164 UNIQUE olduğu üçün hələ də unikal dəyər lazımdır, amma cədvəldə oxunaqlı qalsın deyə
  // tam UUID yox, onun qısa (8 simvol) hissəsi kifayətdir.
  const { rows } = await db.query(
    `UPDATE customers SET full_name = 'Silinmiş istifadəçi', phone_e164 = concat('anon-', substring(id::text, 1, 8)),
            marketing_consent = false, admin_notes = NULL, anonymized_at = now()
     WHERE id = $1 RETURNING *`,
    [id],
  );
  await db.query(`UPDATE children SET first_name = 'Silinmiş', allergy_note = NULL WHERE customer_id = $1`, [id]);
  return rows[0] ?? null;
}

// ---------- Inquiries ----------
export async function listInquiriesAdmin(db, { type, status } = {}) {
  const conditions = [];
  const params = [];
  if (type) { params.push(type); conditions.push(`type = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(`SELECT * FROM inquiries ${where} ORDER BY created_at DESC LIMIT 200`, params);
  return rows;
}

export async function updateInquiryStatus(db, id, status) {
  const { rows } = await db.query('UPDATE inquiries SET status = $2 WHERE id = $1 RETURNING *', [id, status]);
  return rows[0] ?? null;
}

// ---------- Admin users (owner only) ----------
export async function listAdminUsers(db) {
  const { rows } = await db.query('SELECT id, email, role, created_at FROM admin_users ORDER BY created_at ASC');
  return rows;
}

export async function createAdminUserRecord(db, { email, passwordHash, role }) {
  const id = randomUUID();
  const { rows } = await db.query(
    'INSERT INTO admin_users (id, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, email, role, created_at',
    [id, email, passwordHash, role],
  );
  return rows[0];
}

export async function findAdminUserByEmail(db, email) {
  const { rows } = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
  return rows[0] ?? null;
}

// ---------- Qalereya ----------
export async function listGalleryPhotosAdmin(db) {
  const { rows } = await db.query(`
    SELECT g.*, h.name AS house_name, h.color_hex AS house_color
    FROM gallery_photos g LEFT JOIN houses h ON h.id = g.house_id
    ORDER BY g.created_at DESC
  `);
  return rows;
}

export async function getGalleryPhotoAdmin(db, id) {
  const { rows } = await db.query('SELECT * FROM gallery_photos WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function insertGalleryPhoto(db, { url, houseId, childLabel, consent }) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO gallery_photos (id, url, house_id, child_label, consent, is_published)
     VALUES ($1,$2,$3,$4,$5,false) RETURNING *`,
    [id, url, houseId || null, childLabel || null, consent],
  );
  return rows[0];
}

export async function setGalleryPhotoPublished(db, id, isPublished) {
  const { rows } = await db.query(
    'UPDATE gallery_photos SET is_published = $2 WHERE id = $1 RETURNING *',
    [id, isPublished],
  );
  return rows[0] ?? null;
}

export async function deleteGalleryPhotoRow(db, id) {
  const { rows } = await db.query('DELETE FROM gallery_photos WHERE id = $1 RETURNING *', [id]);
  return rows[0] ?? null;
}

// ---------- Evlər (houses) ----------
export async function listHousesAdmin(db) {
  const { rows } = await db.query(`
    SELECT h.*, (SELECT count(*)::int FROM masterclasses m WHERE m.house_id = h.id) AS masterclass_count
    FROM houses h ORDER BY h.sort_order ASC
  `);
  return rows;
}

export async function createHouse(db, { slug, name, colorHex, sortOrder }) {
  const id = randomUUID();
  const { rows } = await db.query(
    'INSERT INTO houses (id, slug, name, color_hex, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, slug, name, colorHex, sortOrder],
  );
  return rows[0];
}

export async function updateHouse(db, id, { slug, name, colorHex, sortOrder }) {
  const { rows } = await db.query(
    'UPDATE houses SET slug=$2, name=$3, color_hex=$4, sort_order=$5 WHERE id=$1 RETURNING *',
    [id, slug, name, colorHex, sortOrder],
  );
  return rows[0] ?? null;
}

// ---------- FAQ (suallar) ----------
export async function listFaqItemsAdmin(db) {
  const { rows } = await db.query('SELECT * FROM faq_items ORDER BY tab ASC, sort_order ASC');
  return rows;
}

export async function createFaqItem(db, { tab, question, answer, sortOrder }) {
  const id = randomUUID();
  const { rows } = await db.query(
    'INSERT INTO faq_items (id, tab, question, answer, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, tab, question, answer, sortOrder],
  );
  return rows[0];
}

export async function updateFaqItem(db, id, { tab, question, answer, sortOrder }) {
  const { rows } = await db.query(
    'UPDATE faq_items SET tab=$2, question=$3, answer=$4, sort_order=$5 WHERE id=$1 RETURNING *',
    [id, tab, question, answer, sortOrder],
  );
  return rows[0] ?? null;
}

export async function deleteFaqItemRow(db, id) {
  const { rows } = await db.query('DELETE FROM faq_items WHERE id = $1 RETURNING *', [id]);
  return rows[0] ?? null;
}

// ---------- Endirim kodları ----------
export async function listDiscountCodesAdmin(db) {
  const { rows } = await db.query(`
    SELECT d.*, co.full_name AS owner_name, co.phone_e164 AS owner_phone,
           cr.full_name AS redeemed_by_name, cr.phone_e164 AS redeemed_by_phone
    FROM discount_codes d
    LEFT JOIN customers co ON co.id = d.owner_customer_id
    LEFT JOIN customers cr ON cr.id = d.redeemed_by_customer_id
    ORDER BY d.created_at DESC LIMIT 300
  `);
  return rows;
}

export async function createManualDiscountCode(db, { code, ownerCustomerId, percent, expiresAt }) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO discount_codes (id, code, type, owner_customer_id, percent, expires_at) VALUES ($1,$2,'manual',$3,$4,$5) RETURNING *`,
    [id, code, ownerCustomerId || null, percent, expiresAt],
  );
  return rows[0];
}

export async function revokeDiscountCode(db, id) {
  const { rows } = await db.query(
    `UPDATE discount_codes SET status = 'expired' WHERE id = $1 AND status = 'active' RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}

// ---------- Həftənin tapşırığı ----------
export async function listWeeklyTasksAdmin(db) {
  const { rows } = await db.query(`
    SELECT t.*, (SELECT count(*)::int FROM task_participants p WHERE p.task_id = t.id) AS participant_count
    FROM weekly_tasks t ORDER BY t.week_number DESC
  `);
  return rows;
}

export async function getWeeklyTaskAdmin(db, id) {
  const { rows } = await db.query('SELECT * FROM weekly_tasks WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createWeeklyTask(db, { weekNumber, title, instructions, materials, referenceImageUrl, unlockDate, relatedMasterclassId }) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO weekly_tasks (id, week_number, title, instructions, materials, reference_image_url, unlock_date, related_masterclass_id, is_published, is_sample)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,false) RETURNING *`,
    [id, weekNumber, title, instructions || null, materials, referenceImageUrl || null, unlockDate, relatedMasterclassId || null],
  );
  return rows[0];
}

export async function updateWeeklyTask(db, id, { weekNumber, title, instructions, materials, unlockDate, relatedMasterclassId }) {
  const { rows } = await db.query(
    `UPDATE weekly_tasks SET week_number=$2, title=$3, instructions=$4, materials=$5, unlock_date=$6, related_masterclass_id=$7
     WHERE id = $1 RETURNING *`,
    [id, weekNumber, title, instructions || null, materials, unlockDate, relatedMasterclassId || null],
  );
  return rows[0] ?? null;
}

export async function setWeeklyTaskReferenceImage(db, id, url) {
  const { rows } = await db.query('UPDATE weekly_tasks SET reference_image_url = $2 WHERE id = $1 RETURNING *', [id, url]);
  return rows[0] ?? null;
}

export async function setWeeklyTaskPublished(db, id, isPublished) {
  const { rows } = await db.query('UPDATE weekly_tasks SET is_published = $2 WHERE id = $1 RETURNING *', [id, isPublished]);
  return rows[0] ?? null;
}

export async function listTaskParticipantsAdmin(db, taskId) {
  const { rows } = await db.query(
    `SELECT p.*, c.full_name AS parent_name, c.phone_e164
     FROM task_participants p LEFT JOIN customers c ON c.id = p.customer_id
     WHERE p.task_id = $1 ORDER BY p.created_at ASC`,
    [taskId],
  );
  return rows;
}

export async function insertTaskParticipant(db, { taskId, customerId, ageGroup, childLabel, instagramHandle, photoUrl, consentPublic }) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO task_participants (id, task_id, customer_id, age_group, child_label, instagram_handle, photo_url, consent_public, is_winner)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false) RETURNING *`,
    [id, taskId, customerId || null, ageGroup, childLabel || null, instagramHandle || null, photoUrl || null, Boolean(consentPublic)],
  );
  return rows[0];
}

export async function getTaskParticipantAdmin(db, id) {
  const { rows } = await db.query('SELECT * FROM task_participants WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function setTaskParticipantWinner(db, id, isWinner) {
  const { rows } = await db.query('UPDATE task_participants SET is_winner = $2 WHERE id = $1 RETURNING *', [id, isWinner]);
  return rows[0] ?? null;
}

export async function setTaskParticipantConsent(db, id, consentPublic) {
  const { rows } = await db.query('UPDATE task_participants SET consent_public = $2 WHERE id = $1 RETURNING *', [id, consentPublic]);
  return rows[0] ?? null;
}

export async function deleteTaskParticipantRow(db, id) {
  const { rows } = await db.query('DELETE FROM task_participants WHERE id = $1 RETURNING *', [id]);
  return rows[0] ?? null;
}

// ---------- Audit log ----------
export async function insertAuditLog(db, { adminUserId, action, targetTable, targetId }) {
  const id = randomUUID();
  await db.query(
    'INSERT INTO audit_log (id, admin_user_id, action, target_table, target_id) VALUES ($1,$2,$3,$4,$5)',
    [id, adminUserId || null, action, targetTable || null, targetId || null],
  );
}

export async function listAuditLog(db, { limit = 200 } = {}) {
  const { rows } = await db.query(
    `SELECT a.*, u.email AS admin_email FROM audit_log a LEFT JOIN admin_users u ON u.id = a.admin_user_id
     ORDER BY a.created_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
}
