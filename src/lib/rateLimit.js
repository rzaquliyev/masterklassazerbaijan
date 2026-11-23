// Sadə yaddaş-daxili rate limit (tək-proses üçün kifayətdir, BRIEF-in "abuse protection" bazası).
// Çox-proses/klaster quraşdırmasında Redis-əsaslı həllə keçirilməlidir (Mərhələ 6 qeydi).
const buckets = new Map();
const SWEEP_EVERY = 1000; // hər N çağırışda vaxtı keçmiş açarlar silinir (yaddaş limitsiz böyüməsin)
let calls = 0;

function sweep(now) {
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > entry.windowMs) buckets.delete(key);
  }
}

export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  if (++calls % SWEEP_EVERY === 0) sweep(now);
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, windowMs, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= maxRequests;
}
