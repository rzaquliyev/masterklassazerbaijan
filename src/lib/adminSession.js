// Admin paneli üçün server-side sessiya (DB-də saxlanır, HttpOnly/Secure/SameSite cookie ilə bağlanır).
// BRIEF təhlükəsizlik bazası: "server-side sessions ... with expiry", CSRF token hər state-dəyişdirən formda.
import { randomBytes } from 'node:crypto';

export const SESSION_COOKIE = 'admin_sid';
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 saat

export async function createAdminSession(db, adminUserId) {
  const id = randomBytes(32).toString('hex');
  const csrfToken = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await db.query(
    'INSERT INTO admin_sessions (id, admin_user_id, csrf_token, expires_at) VALUES ($1,$2,$3,$4)',
    [id, adminUserId, csrfToken, expiresAt],
  );
  return { id, csrfToken, expiresAt, maxAgeSeconds: SESSION_TTL_SECONDS };
}

export async function loadAdminSession(db, sessionId) {
  if (!sessionId) return null;
  const { rows } = await db.query(
    `SELECT s.id, s.csrf_token, s.expires_at, u.id AS admin_user_id, u.email, u.role
     FROM admin_sessions s JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.id = $1`,
    [sessionId],
  );
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await destroyAdminSession(db, sessionId);
    return null;
  }
  return {
    id: row.id,
    csrfToken: row.csrf_token,
    adminUser: { id: row.admin_user_id, email: row.email, role: row.role },
  };
}

export async function destroyAdminSession(db, sessionId) {
  if (!sessionId) return;
  await db.query('DELETE FROM admin_sessions WHERE id = $1', [sessionId]);
}
