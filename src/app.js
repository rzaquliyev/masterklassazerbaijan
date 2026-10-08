import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import helmet from 'helmet';
import { getDb } from './lib/db.js';
import { createPublicRouter } from './routes/public.js';
import { dictionaries, SUPPORTED_LANGS, DEFAULT_LANG } from './i18n/index.js';
import { getBookingWithDetails } from './repositories/bookings.js';
import { buildIcsEvent } from './lib/ics.js';
import { claimHideSeekReward } from './services/codes.js';
import { InvalidPhoneError } from './lib/phone.js';
import { checkRateLimit } from './lib/rateLimit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp() {
  const app = express();
  const db = await getDb();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // 'unsafe-inline' yalnız style-src-də: Plastilin-yoğur oyunu və sürüklənən
          // elementlər `element.style.transform` ilə dinamik mövqe təyin edir. Nunjucks
          // auto-escape ilə birləşir (istifadəçi girişi heç vaxt stil kimi çıxmır).
          // script-src 'unsafe-inline'/'unsafe-eval' OLMADAN tam məhdud qalır (XSS-in əsas vektoru).
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          // 'blob:' Rəngləmə oyununun PNG export-u üçün (SVG -> Blob URL -> <img> -> canvas).
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  const env = nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV !== 'production',
  });
  env.addFilter('formatDateAz', formatDateAz);
  env.addFilter('formatDayMonthAz', (v) => formatDateParts(v).dayMonth);
  env.addFilter('formatTimeAz', (v) => formatDateParts(v).time);
  env.addFilter('formatMoney', (v) => Number(v).toFixed(2).replace('.', ',') + ' ₼');
  env.addGlobal('currentYear', new Date().getFullYear());
  env.addGlobal('assetV', process.env.NODE_ENV === 'production' ? (process.env.npm_package_version || '1') : Date.now());

  app.set('view engine', 'njk');
  app.use(
    express.static(path.join(__dirname, 'public'), {
      maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
    }),
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get('/', (req, res) => res.redirect(302, `/${DEFAULT_LANG}/`));

  app.get('/api/ics/:bookingId', async (req, res) => {
    const booking = await getBookingWithDetails(db, req.params.bookingId);
    if (!booking) return res.status(404).send('Tapılmadı');
    const ics = buildIcsEvent({
      uid: booking.id,
      title: booking.masterclass_title,
      description: `Bilet № ${booking.reference}`,
      location: booking.location,
      startsAt: booking.starts_at,
    });
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="masterklass-${booking.reference}.ics"`);
    res.send(ics);
  });

  app.post('/api/gizlenqach/mukafat', async (req, res) => {
    if (!checkRateLimit(`hunt:${req.ip}`, 5, 60_000)) {
      return res.status(429).json({ error: 'Çox cəhd edildi, bir az sonra yenidən cəhd edin.' });
    }
    try {
      const result = await claimHideSeekReward(db, req.body.phone);
      res.json(result);
    } catch (err) {
      if (err instanceof InvalidPhoneError) {
        return res.status(400).json({ error: 'Telefon nömrəsi düzgün formatda deyil.' });
      }
      throw err;
    }
  });

  app.use('/:lang', (req, res, next) => {
    const { lang } = req.params;
    if (!SUPPORTED_LANGS.includes(lang)) return next('route');
    req.lang = lang;
    req.t = dictionaries[lang];
    res.locals.lang = lang;
    res.locals.t = dictionaries[lang];
    res.locals.supportedLangs = SUPPORTED_LANGS;
    res.locals.currentPath = req.path;
    next();
  }, createPublicRouter(db));

  app.use((req, res) => {
    res.status(404);
    res.render('404.njk', {
      lang: DEFAULT_LANG,
      t: dictionaries[DEFAULT_LANG],
      supportedLangs: SUPPORTED_LANGS,
      currentPath: '/',
    });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server xətası. Bir az sonra yenidən cəhd edin.');
  });

  return app;
}

const bakuFormatter = new Intl.DateTimeFormat('az-AZ', {
  timeZone: 'Asia/Baku',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function formatDateParts(value) {
  const parts = bakuFormatter.formatToParts(new Date(value));
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    day: get('day'), month: get('month'), year: get('year'), hour: get('hour'), minute: get('minute'),
    dayMonth: `${get('day')}.${get('month')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}

function formatDateAz(value) {
  const p = formatDateParts(value);
  return `${p.day}.${p.month}.${p.year}, ${p.hour}:${p.minute}`;
}
