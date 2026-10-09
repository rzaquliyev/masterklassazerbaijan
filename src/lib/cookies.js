// Əllə yazılmış cookie parse/serialize — layihə artıq kiçik köməkçiləri (rateLimit.js kimi)
// əlavə asılılıq olmadan yazır, burada da eyni üsul.

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(value);
  }
  return out;
}

export function serializeCookie(name, value, { maxAgeSeconds, httpOnly = true, secure, sameSite = 'Lax', path = '/' } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (maxAgeSeconds != null) parts.push(`Max-Age=${maxAgeSeconds}`);
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  return parts.join('; ');
}
