import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  listPublishedMasterclassesWithNextSession, findMasterclassBySlug,
  listUpcomingSessionsForMasterclass, listHouses, getSessionById, listAllUpcomingSessions,
} from '../repositories/masterclasses.js';
import {
  listPublishedGalleryPhotos, listFaqByTab, insertInquiry, getLoyaltyByPhoneAndBookingCode,
} from '../repositories/content.js';
import { getBookingWithDetails } from '../repositories/bookings.js';
import { reserveSeat, SessionNotFoundError } from '../services/booking.js';
import { getOrCreateReferralCode } from '../services/codes.js';
import { bookingInputSchema } from '../schemas/booking.js';
import { InvalidPhoneError, normalizePhoneAz } from '../lib/phone.js';
import { checkRateLimit } from '../lib/rateLimit.js';

export function createPublicRouter(db) {
  const router = Router();

  router.get('/', async (req, res) => {
    const list = await listPublishedMasterclassesWithNextSession(db);
    const houses = await listHouses(db);
    const featured = [];
    const seenHouse = new Set();
    for (const m of list) {
      if (m.house_id && !seenHouse.has(m.house_id)) { seenHouse.add(m.house_id); featured.push(m); }
      if (featured.length >= 4) break;
    }
    const gallery = await listPublishedGalleryPhotos(db);
    res.render('home.njk', { featured, houses, gallery: gallery.slice(0, 4) });
  });

  router.get('/masterclasses', async (req, res) => {
    const list = await listPublishedMasterclassesWithNextSession(db);
    const houses = await listHouses(db);
    const ageFilter = req.query.age ? Number(req.query.age) : null;
    const filtered = ageFilter
      ? list.filter((m) => ageFilter >= m.age_min && ageFilter <= m.age_max)
      : list;
    res.render('catalog.njk', { list: filtered, houses, ageFilter });
  });

  router.get('/m/:slug', async (req, res) => {
    const masterclass = await findMasterclassBySlug(db, req.params.slug);
    if (!masterclass) return render404(req, res);
    const sessions = await listUpcomingSessionsForMasterclass(db, masterclass.id);
    const all = await listPublishedMasterclassesWithNextSession(db);
    const neighbors = all.filter((m) => m.id !== masterclass.id && m.house_id === masterclass.house_id).slice(0, 3);
    const otherNeighbors = all.filter((m) => m.id !== masterclass.id && m.house_id !== masterclass.house_id).slice(0, 3 - neighbors.length);
    res.render('detail.njk', { masterclass, sessions, neighbors: neighbors.concat(otherNeighbors) });
  });

  router.get('/kassa/:sessionId', async (req, res) => {
    const session = await getSessionById(db, req.params.sessionId);
    if (!session) return render404(req, res);
    const masterclass = await findMasterclassBySlugOrId(db, session.masterclass_id);
    res.render('kassa.njk', {
      session, masterclass, idempotencyKey: randomUUID(), errors: {}, formValues: {},
    });
  });

  router.post('/kassa/:sessionId', async (req, res) => {
    const session = await getSessionById(db, req.params.sessionId);
    if (!session) return render404(req, res);
    const masterclass = await findMasterclassBySlugOrId(db, session.masterclass_id);

    // Honeypot: gizli sahə doldurulubsa bot ehtimalı yüksəkdir — heç nə yazmadan sakitcə
    // detala geri göndəririk (bot-a "uğursuzluq" siqnalı vermirik, amma data da yaratmırıq).
    if (req.body.website) {
      return res.redirect(303, `/${req.lang}/m/${masterclass.slug}`);
    }
    if (!checkRateLimit(`kassa:${req.ip}`, 5, 60_000)) {
      return res.status(429).render('kassa.njk', {
        session, masterclass, idempotencyKey: req.body.idempotencyKey || randomUUID(),
        errors: { generic: true }, formValues: req.body,
      });
    }

    const parsed = bookingInputSchema.safeParse({
      sessionId: req.params.sessionId,
      idempotencyKey: req.body.idempotencyKey || randomUUID(),
      child: { firstName: req.body.childFirstName, birthYear: req.body.childBirthYear ? Number(req.body.childBirthYear) : undefined },
      parent: { fullName: req.body.parentFullName, phone: req.body.parentPhone },
      consent: req.body.consent === 'on',
      marketingConsent: req.body.marketing === 'on',
    });

    if (!parsed.success) {
      return res.status(400).render('kassa.njk', {
        session, masterclass, idempotencyKey: req.body.idempotencyKey || randomUUID(),
        errors: { validation: true }, formValues: req.body,
      });
    }

    try {
      const { booking } = await reserveSeat(db, parsed.data);
      return res.redirect(303, `/${req.lang}/kassa/${req.params.sessionId}/tesdiq/${booking.id}`);
    } catch (err) {
      if (err instanceof InvalidPhoneError) {
        return res.status(400).render('kassa.njk', {
          session, masterclass, idempotencyKey: parsed.data.idempotencyKey,
          errors: { phone: true }, formValues: req.body,
        });
      }
      if (err instanceof SessionNotFoundError) return render404(req, res);
      throw err;
    }
  });

  router.get('/kassa/:sessionId/tesdiq/:bookingId', async (req, res) => {
    const booking = await getBookingWithDetails(db, req.params.bookingId);
    if (!booking || booking.session_id !== req.params.sessionId) return render404(req, res);
    res.render('kassa-tesdiq.njk', { booking });
  });

  router.get('/teqvim', async (req, res) => {
    const sessions = await listAllUpcomingSessions(db);
    const houses = await listHouses(db);
    const houseFilter = req.query.ev || null;
    const filtered = houseFilter ? sessions.filter((s) => s.house_slug === houseFilter) : sessions;

    const byDate = new Map();
    for (const s of filtered) {
      const dateKey = new Date(s.starts_at).toISOString().slice(0, 10);
      if (!byDate.has(dateKey)) byDate.set(dateKey, []);
      byDate.get(dateKey).push(s);
    }
    const dates = [...byDate.keys()].sort();
    const dayFilter = dates.includes(req.query.gun) ? req.query.gun : dates[0];
    const rows = byDate.get(dayFilter) || [];

    res.render('teqvim.njk', { houses, houseFilter, dates, dayFilter, rows, hasAny: filtered.length > 0 });
  });

  router.get('/qalereya', async (req, res) => {
    const houses = await listHouses(db);
    const houseFilter = req.query.ev || null;
    const photos = await listPublishedGalleryPhotos(db, houseFilter);
    res.render('qalereya.njk', { photos, houses, houseFilter });
  });

  router.get('/suallar', async (req, res) => {
    const faqByTab = await listFaqByTab(db);
    res.render('suallar.njk', { faqByTab });
  });

  router.get('/elaqe', async (req, res) => {
    res.render('elaqe.njk', { sent: false });
  });

  router.post('/elaqe', async (req, res) => {
    if (!checkRateLimit(`contact:${req.ip}`, 5, 60_000) || req.body.website) {
      return res.render('elaqe.njk', { sent: true }); // honeypot/rate-limit: bota "uğur" göstər, yazma
    }
    if (!req.body.name || !req.body.phone || !req.body.message) {
      return res.status(400).render('elaqe.njk', { sent: false, error: true, formValues: req.body });
    }
    await insertInquiry(db, { type: 'contact', name: req.body.name, phone: req.body.phone, message: req.body.message });
    res.render('elaqe.njk', { sent: true });
  });

  router.get('/ad-gunu', async (req, res) => {
    res.render('ad-gunu.njk', { sent: false });
  });

  router.post('/ad-gunu', async (req, res) => {
    if (!checkRateLimit(`birthday:${req.ip}`, 5, 60_000) || req.body.website) {
      return res.render('ad-gunu.njk', { sent: true });
    }
    if (!req.body.phone || !req.body.package) {
      return res.status(400).render('ad-gunu.njk', { sent: false, error: true, formValues: req.body });
    }
    await insertInquiry(db, {
      type: 'birthday', name: req.body.phone, phone: req.body.phone,
      birthdayPackage: req.body.package,
      birthdayGuestCount: req.body.kids ? Number(req.body.kids) : null,
      birthdayDate: req.body.date || null,
    });
    res.render('ad-gunu.njk', { sent: true });
  });

  router.get('/kampaniyalar', async (req, res) => {
    res.render('kampaniyalar.njk', { lookup: null, lookupError: null });
  });

  router.post('/kampaniyalar/passport', async (req, res) => {
    if (!checkRateLimit(`passport:${req.ip}`, 10, 60_000)) {
      return res.status(429).render('kampaniyalar.njk', { lookup: null, lookupError: true });
    }
    try {
      const phoneE164 = normalizePhoneAz(req.body.phone || '');
      const loyalty = await getLoyaltyByPhoneAndBookingCode(db, phoneE164, (req.body.reference || '').trim().toUpperCase());
      if (!loyalty) {
        return res.render('kampaniyalar.njk', { lookup: null, lookupError: true });
      }
      const referral = await getOrCreateReferralCode(db, loyalty.customer_id);
      res.render('kampaniyalar.njk', { lookup: { ...loyalty, referralCode: referral.code, referralPercent: referral.percent }, lookupError: null });
    } catch (err) {
      if (err instanceof InvalidPhoneError) {
        return res.status(400).render('kampaniyalar.njk', { lookup: null, lookupError: true });
      }
      throw err;
    }
  });

  router.get('/oyun-parki', (req, res) => res.render('oyun-parki.njk', {}));
  router.get('/oyun-parki/yogur', (req, res) => res.render('yogur.njk', {}));
  router.get('/oyun-parki/pizza', (req, res) => res.render('pizza.njk', {}));
  router.get('/oyun-parki/rengleme', (req, res) => res.render('rengleme.njk', {}));

  router.get('/mexfilik', (req, res) => res.render('mexfilik.njk', {}));

  router.use((req, res) => render404(req, res));

  return router;

  function render404(req, res) {
    res.status(404);
    res.render('404.njk');
  }

  async function findMasterclassBySlugOrId(dbRef, masterclassId) {
    const { rows } = await dbRef.query(
      `SELECT m.*, h.name AS house_name, h.color_hex AS house_color, h.slug AS house_slug
       FROM masterclasses m LEFT JOIN houses h ON h.id = m.house_id WHERE m.id = $1`,
      [masterclassId],
    );
    return rows[0] ?? null;
  }
}
