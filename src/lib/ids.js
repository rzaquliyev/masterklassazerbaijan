// URL-dən gələn ID-lər UUID sütunlarına ötürülməzdən əvvəl yoxlanılır: səhv formatlı dəyər
// Postgres-də "invalid input syntax for type uuid" xətası atır və 500 qaytarırdı — 404 olmalıdır.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}
