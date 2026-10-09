import { Router } from 'express';
import argon2 from 'argon2';
import { attachAdminSession, requireAdmin, requireCsrf } from '../middleware/adminAuth.js';
import { SESSION_COOKIE, createAdminSession, destroyAdminSession } from '../lib/adminSession.js';
import { serializeCookie } from '../lib/cookies.js';
import { checkRateLimit } from '../lib/rateLimit.js';
import { listHouses } from '../repositories/masterclasses.js';
import { cancelBooking, BookingNotCancellableError, BookingNotFoundError } from '../services/booking.js';
import { listBookingsByCustomer } from '../repositories/bookings.js';
import {
  dashboardStats, listUpcomingSessionsAdmin,
  listMasterclassesAdmin, getMasterclassAdmin, createMasterclass, updateMasterclass, setMasterclassPublished,
  listSessionsForMasterclassAdmin, createSessionAdmin, updateSessionAdmin, cancelSessionAdmin, CapacityBelowBookedError,
  listBookingsAdmin, updateBookingNotes, listAllBookingsForExport,
  listCustomersAdmin, getCustomerAdmin, updateCustomerNotes, anonymizeCustomer,
  listInquiriesAdmin, updateInquiryStatus,
  listAdminUsers, createAdminUserRecord, findAdminUserByEmail,
  insertAuditLog, listAuditLog,
} from '../repositories/admin.js';
import { loginSchema, masterclassSchema, sessionSchema, notesSchema, createAdminUserSchema } from '../schemas/admin.js';

const bakuDtFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
// "YYYY-MM-DD HH:mm" (sv-SE lokalı bunu verir) -> datetime-local input üçün "YYYY-MM-DDTHH:mm"
function toBakuDatetimeLocal(value) {
  return bakuDtFormatter.format(new Date(value)).replace(' ', 'T');
}
// Admin formundan gələn "YYYY-MM-DDTHH:mm" (Bakı yerli vaxtı) -> UTC Date. Bakı DST tətbiq etmir (sabit +04:00).
function fromBakuDatetimeLocal(value) {
  return new Date(`${value}:00+04:00`);
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCsv(rows, columns) {
  const header = columns.map((c) => csvEscape(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => csvEscape(c.get(row))).join(','));
  return '﻿' + [header, ...lines].join('\r\n') + '\r\n';
}

export function createAdminRouter(db) {
  const router = Router();
  router.use(attachAdminSession(db));

  function renderLocals(req, extra = {}) {
    return {
      admin: req.adminSession?.adminUser ?? null,
      csrfToken: req.adminSession?.csrfToken ?? '',
      ...extra,
    };
  }

  // ---------- Login / logout ----------
  router.get('/login', (req, res) => {
    if (req.adminSession) return res.redirect(302, '/admin');
    res.render('admin/login.njk', renderLocals(req, { error: null, next: req.query.next || '/admin' }));
  });

  router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).render('admin/login.njk', renderLocals(req, { error: 'E-poçt və ya parol səhvdir.', next: '/admin' }));
    }
    const { email, password } = parsed.data;

    if (!checkRateLimit(`admin-login:${req.ip}`, 10, 15 * 60_000) || !checkRateLimit(`admin-login:${email}`, 10, 15 * 60_000)) {
      return res.status(429).render('admin/login.njk', renderLocals(req, { error: 'Çox cəhd edildi. Bir az sonra yenidən cəhd edin.', next: '/admin' }));
    }

    const user = await findAdminUserByEmail(db, email);
    const ok = user && (await argon2.verify(user.password_hash, password).catch(() => false));
    if (!ok) {
      return res.status(401).render('admin/login.njk', renderLocals(req, { error: 'E-poçt və ya parol səhvdir.', next: '/admin' }));
    }

    const session = await createAdminSession(db, user.id);
    res.set('Set-Cookie', serializeCookie(SESSION_COOKIE, session.id, {
      maxAgeSeconds: session.maxAgeSeconds, secure: process.env.NODE_ENV === 'production',
    }));
    await insertAuditLog(db, { adminUserId: user.id, action: 'login', targetTable: 'admin_users', targetId: user.id });
    const next = typeof req.body.next === 'string' && req.body.next.startsWith('/admin') ? req.body.next : '/admin';
    res.redirect(302, next);
  });

  router.post('/logout', requireAdmin(), requireCsrf, async (req, res) => {
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'logout' });
    await destroyAdminSession(db, req.adminSession.id);
    res.set('Set-Cookie', serializeCookie(SESSION_COOKIE, '', { maxAgeSeconds: 0, secure: process.env.NODE_ENV === 'production' }));
    res.redirect(302, '/admin/login');
  });

  // ---------- Dashboard ----------
  router.get('/', requireAdmin(), async (req, res) => {
    const stats = await dashboardStats(db);
    const upcoming = await listUpcomingSessionsAdmin(db);
    res.render('admin/dashboard.njk', renderLocals(req, { stats, upcoming: upcoming.slice(0, 10) }));
  });

  // ---------- Masterclasses ----------
  router.get('/masterclasses', requireAdmin(), async (req, res) => {
    const list = await listMasterclassesAdmin(db);
    res.render('admin/masterclasses.njk', renderLocals(req, { list }));
  });

  router.get('/masterclasses/new', requireAdmin(), async (req, res) => {
    const houses = await listHouses(db);
    res.render('admin/masterclass-form.njk', renderLocals(req, { houses, item: null, errors: null }));
  });

  router.post('/masterclasses', requireAdmin(), requireCsrf, async (req, res) => {
    const parsed = masterclassSchema.safeParse(req.body);
    if (!parsed.success) {
      const houses = await listHouses(db);
      return res.status(400).render('admin/masterclass-form.njk', renderLocals(req, { houses, item: req.body, errors: parsed.error.flatten() }));
    }
    const created = await createMasterclass(db, parsed.data);
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'masterclass.create', targetTable: 'masterclasses', targetId: created.id });
    res.redirect(302, `/admin/masterclasses/${created.id}`);
  });

  router.get('/masterclasses/:id', requireAdmin(), async (req, res) => {
    const item = await getMasterclassAdmin(db, req.params.id);
    if (!item) return res.status(404).send('Tapılmadı');
    const houses = await listHouses(db);
    const sessions = await listSessionsForMasterclassAdmin(db, item.id);
    res.render('admin/masterclass-edit.njk', renderLocals(req, {
      item, houses, sessions: sessions.map((s) => ({ ...s, startsAtLocal: toBakuDatetimeLocal(s.starts_at) })), errors: null,
      sessionError: req.query.sessionError === 'capacity' ? 'Yer tutumu artıq bron olunmuş yer sayından az ola bilməz.' : null,
    }));
  });

  router.post('/masterclasses/:id', requireAdmin(), requireCsrf, async (req, res) => {
    const parsed = masterclassSchema.safeParse(req.body);
    const houses = await listHouses(db);
    if (!parsed.success) {
      const sessions = await listSessionsForMasterclassAdmin(db, req.params.id);
      return res.status(400).render('admin/masterclass-edit.njk', renderLocals(req, {
        item: { id: req.params.id, ...req.body }, houses, sessions, errors: parsed.error.flatten(),
      }));
    }
    const updated = await updateMasterclass(db, req.params.id, parsed.data);
    if (!updated) return res.status(404).send('Tapılmadı');
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'masterclass.update', targetTable: 'masterclasses', targetId: updated.id });
    res.redirect(302, `/admin/masterclasses/${updated.id}`);
  });

  router.post('/masterclasses/:id/publish', requireAdmin(), requireCsrf, async (req, res) => {
    const published = req.body.published === '1';
    const updated = await setMasterclassPublished(db, req.params.id, published);
    if (!updated) return res.status(404).send('Tapılmadı');
    await insertAuditLog(db, {
      adminUserId: req.adminSession.adminUser.id,
      action: published ? 'masterclass.publish' : 'masterclass.unpublish',
      targetTable: 'masterclasses', targetId: updated.id,
    });
    res.redirect(302, req.get('Referer') || '/admin/masterclasses');
  });

  // ---------- Sessions ----------
  router.post('/masterclasses/:id/sessions', requireAdmin(), requireCsrf, async (req, res) => {
    const parsed = sessionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).redirect(302, `/admin/masterclasses/${req.params.id}`);
    const created = await createSessionAdmin(db, {
      masterclassId: req.params.id,
      startsAt: fromBakuDatetimeLocal(parsed.data.startsAt),
      capacity: parsed.data.capacity,
      priceAzn: parsed.data.priceAzn,
      earlyBirdPriceAzn: parsed.data.earlyBirdPriceAzn || null,
      earlyBirdSlots: parsed.data.earlyBirdSlots || 0,
      location: parsed.data.location,
    });
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'session.create', targetTable: 'sessions', targetId: created.id });
    res.redirect(302, `/admin/masterclasses/${req.params.id}`);
  });

  router.post('/sessions/:id', requireAdmin(), requireCsrf, async (req, res) => {
    const parsed = sessionSchema.safeParse(req.body);
    const masterclassId = req.body.masterclassId;
    if (!parsed.success) return res.status(400).redirect(302, `/admin/masterclasses/${masterclassId}`);
    try {
      const updated = await updateSessionAdmin(db, req.params.id, {
        startsAt: fromBakuDatetimeLocal(parsed.data.startsAt),
        capacity: parsed.data.capacity,
        priceAzn: parsed.data.priceAzn,
        earlyBirdPriceAzn: parsed.data.earlyBirdPriceAzn || null,
        earlyBirdSlots: parsed.data.earlyBirdSlots || 0,
        location: parsed.data.location,
      });
      if (!updated) return res.status(404).send('Tapılmadı');
      await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'session.update', targetTable: 'sessions', targetId: updated.id });
      res.redirect(302, `/admin/masterclasses/${masterclassId}`);
    } catch (err) {
      if (err instanceof CapacityBelowBookedError) {
        return res.redirect(302, `/admin/masterclasses/${masterclassId}?sessionError=capacity`);
      }
      throw err;
    }
  });

  router.post('/sessions/:id/cancel', requireAdmin(), requireCsrf, async (req, res) => {
    const cancelled = await cancelSessionAdmin(db, req.params.id);
    if (!cancelled) return res.status(404).send('Tapılmadı');
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'session.cancel', targetTable: 'sessions', targetId: cancelled.id });
    res.redirect(302, req.body.masterclassId ? `/admin/masterclasses/${req.body.masterclassId}` : '/admin/masterclasses');
  });

  // ---------- Bookings ----------
  router.get('/bookings', requireAdmin(), async (req, res) => {
    const list = await listBookingsAdmin(db, { status: req.query.status || null, search: req.query.q || null });
    res.render('admin/bookings.njk', renderLocals(req, { list, status: req.query.status || '', search: req.query.q || '' }));
  });

  router.post('/bookings/:id/status', requireAdmin(), requireCsrf, async (req, res) => {
    const { status } = req.body;
    try {
      if (status === 'cancelled') {
        await cancelBooking(db, req.params.id);
      } else if (['confirmed', 'attended'].includes(status)) {
        await db.query('UPDATE bookings SET status = $2 WHERE id = $1', [req.params.id, status]);
      } else {
        return res.status(400).send('Naməlum status');
      }
      await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: `booking.status.${status}`, targetTable: 'bookings', targetId: req.params.id });
    } catch (err) {
      if (err instanceof BookingNotFoundError) return res.status(404).send('Tapılmadı');
      if (err instanceof BookingNotCancellableError) return res.status(409).send('Bu bron ləğv edilə bilməz.');
      throw err;
    }
    res.redirect(302, req.get('Referer') || '/admin/bookings');
  });

  router.post('/bookings/:id/notes', requireAdmin(), requireCsrf, async (req, res) => {
    const parsed = notesSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send('Səhv qeyd');
    await updateBookingNotes(db, req.params.id, parsed.data.notes || null);
    res.redirect(302, req.get('Referer') || '/admin/bookings');
  });

  // ---------- Customers ----------
  router.get('/customers', requireAdmin(), async (req, res) => {
    const list = await listCustomersAdmin(db, { search: req.query.q || null });
    res.render('admin/customers.njk', renderLocals(req, { list, search: req.query.q || '' }));
  });

  router.get('/customers/:id', requireAdmin(), async (req, res) => {
    const item = await getCustomerAdmin(db, req.params.id);
    if (!item) return res.status(404).send('Tapılmadı');
    const bookings = await listBookingsByCustomer(db, item.id);
    res.render('admin/customer-detail.njk', renderLocals(req, { item, bookings }));
  });

  router.post('/customers/:id/notes', requireAdmin(), requireCsrf, async (req, res) => {
    const parsed = notesSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send('Səhv qeyd');
    await updateCustomerNotes(db, req.params.id, parsed.data.notes || null);
    res.redirect(302, `/admin/customers/${req.params.id}`);
  });

  router.post('/customers/:id/anonymize', requireAdmin({ role: 'owner' }), requireCsrf, async (req, res) => {
    const result = await anonymizeCustomer(db, req.params.id);
    if (!result) return res.status(404).send('Tapılmadı');
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'customer.anonymize', targetTable: 'customers', targetId: req.params.id });
    res.redirect(302, '/admin/customers');
  });

  // ---------- Inquiries ----------
  router.get('/inquiries', requireAdmin(), async (req, res) => {
    const list = await listInquiriesAdmin(db, { type: req.query.type || null, status: req.query.status || null });
    res.render('admin/inquiries.njk', renderLocals(req, { list, type: req.query.type || '', status: req.query.status || '' }));
  });

  router.post('/inquiries/:id/status', requireAdmin(), requireCsrf, async (req, res) => {
    const updated = await updateInquiryStatus(db, req.params.id, req.body.status);
    if (!updated) return res.status(404).send('Tapılmadı');
    res.redirect(302, req.get('Referer') || '/admin/inquiries');
  });

  // ---------- Export (yalnız owner) ----------
  router.get('/export/bookings.csv', requireAdmin({ role: 'owner' }), async (req, res) => {
    const rows = await listAllBookingsForExport(db);
    const csv = toCsv(rows, [
      { label: 'Bilet №', get: (r) => r.reference },
      { label: 'Status', get: (r) => r.status },
      { label: 'Masterklass', get: (r) => r.masterclass_title },
      { label: 'Tarix', get: (r) => new Date(r.starts_at).toISOString() },
      { label: 'Uşaq', get: (r) => r.child_first_name },
      { label: 'Valideyn', get: (r) => r.parent_name },
      { label: 'Telefon', get: (r) => r.phone_e164 },
      { label: 'Qiymət (₼)', get: (r) => r.price_azn },
      { label: 'Erkən quş', get: (r) => (r.was_early_bird ? 'bəli' : 'yox') },
      { label: 'Yaradılıb', get: (r) => new Date(r.created_at).toISOString() },
    ]);
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'export.bookings_csv' });
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="bronlar-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  });

  // ---------- İstifadəçilər və rollar (yalnız owner) ----------
  router.get('/users', requireAdmin({ role: 'owner' }), async (req, res) => {
    const list = await listAdminUsers(db);
    res.render('admin/users.njk', renderLocals(req, { list, errors: null }));
  });

  router.post('/users', requireAdmin({ role: 'owner' }), requireCsrf, async (req, res) => {
    const parsed = createAdminUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const list = await listAdminUsers(db);
      return res.status(400).render('admin/users.njk', renderLocals(req, { list, errors: parsed.error.flatten() }));
    }
    const existing = await findAdminUserByEmail(db, parsed.data.email);
    if (existing) {
      const list = await listAdminUsers(db);
      return res.status(409).render('admin/users.njk', renderLocals(req, { list, errors: { formErrors: ['Bu e-poçt artıq istifadə olunur.'] } }));
    }
    const passwordHash = await argon2.hash(parsed.data.password, { type: argon2.argon2id });
    const created = await createAdminUserRecord(db, { email: parsed.data.email, passwordHash, role: parsed.data.role });
    await insertAuditLog(db, { adminUserId: req.adminSession.adminUser.id, action: 'user.create', targetTable: 'admin_users', targetId: created.id });
    res.redirect(302, '/admin/users');
  });

  // ---------- Audit jurnalı (yalnız owner) ----------
  router.get('/audit', requireAdmin({ role: 'owner' }), async (req, res) => {
    const list = await listAuditLog(db);
    res.render('admin/audit.njk', renderLocals(req, { list }));
  });

  return router;
}
