// Sadə yaddaş-daxili rate limit (tək-proses üçün kifayətdir, BRIEF-in "abuse protection" bazası).
// Çox-proses/klaster quraşdırmasında Redis-əsaslı həllə keçirilməlidir (Mərhələ 6 qeydi).
const buckets = new Map();

export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= maxRequests;
}
