import { parseCookies } from '../lib/cookies.js';
import { SESSION_COOKIE, loadAdminSession } from '../lib/adminSession.js';

// Hər /admin sorğusuna sessiyanı (varsa) bağlayır — login səhifəsi də daxil, ona görə "artıq
// daxil olub" halını özü yoxlaya bilsin.
export function attachAdminSession(db) {
  return async (req, res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[SESSION_COOKIE];
    req.adminSession = sid ? await loadAdminSession(db, sid) : null;
    next();
  };
}

// Qorunan səhifələr üçün: sessiya yoxdursa login-ə yönləndir, rol uyğun deyilsə 403.
export function requireAdmin({ role } = {}) {
  return (req, res, next) => {
    if (!req.adminSession) {
      return res.redirect(302, `/admin/login?next=${encodeURIComponent(req.originalUrl)}`);
    }
    if (role && req.adminSession.adminUser.role !== role) {
      return res.status(403).render('admin/403.njk', { admin: req.adminSession.adminUser, csrfToken: req.adminSession.csrfToken, currentPath: req.originalUrl.split('?')[0] });
    }
    next();
  };
}

// CSRF: form-dakı gizli `_csrf` sahəsi sessiyanın öz tokeni ilə üst-üstə düşməlidir.
export function requireCsrf(req, res, next) {
  const token = req.body?._csrf;
  if (!req.adminSession || !token || token !== req.adminSession.csrfToken) {
    return res.status(403).send('CSRF token səhvdir və ya sessiya bitib. Səhifəni yeniləyib yenidən cəhd edin.');
  }
  next();
}
