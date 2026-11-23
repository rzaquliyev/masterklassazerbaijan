// "Sayt mətnləri" admin bölməsində hansı lüğət açarlarının (dictionaries/*.json) override
// edilə biləcəyini təsvir edir (ana səhifə + FAQ başlıqları + footer — BRIEF-dən kənar,
// ownerin kodsuz mətn dəyişikliyi tələbi üçün Mərhələ 8-də əlavə edildi).
export const LANGS = ['az', 'ru', 'en'];

export const EDITABLE_TEXT_KEYS = [
  'home.title',
  'home.lead',
  'home.roadmapTitle',
  'home.roadmapLead',
  'home.museumTitle',
  'home.tourTitle',
  'home.tourLead',
  'home.trustTitle',
  'suallar.title',
  'suallar.lead',
  'footer.title',
  'footer.cta',
];

export const TEXT_FIELD_LABELS = {
  'home.title': 'Ana səhifə başlığı',
  'home.lead': 'Ana səhifə alt mətni',
  'home.roadmapTitle': '"Yol xəritəsi" bölməsinin başlığı',
  'home.roadmapLead': '"Yol xəritəsi" bölməsinin alt mətni',
  'home.museumTitle': '"Şəhər muzeyi" bölməsinin başlığı',
  'home.tourTitle': '"Şəhəri gəz" bölməsinin başlığı',
  'home.tourLead': '"Şəhəri gəz" bölməsinin alt mətni',
  'home.trustTitle': 'Valideynlər bölməsinin başlığı (Haqqımızda)',
  'suallar.title': 'Suallar səhifəsinin başlığı',
  'suallar.lead': 'Suallar səhifəsinin alt mətni',
  'footer.title': 'Footer başlığı',
  'footer.cta': 'Footer düymə mətni',
};

export const TEXT_FIELD_MAX_LEN = {
  'home.title': 200,
  'home.lead': 400,
  'home.roadmapTitle': 120,
  'home.roadmapLead': 200,
  'home.museumTitle': 120,
  'home.tourTitle': 120,
  'home.tourLead': 200,
  'home.trustTitle': 200,
  'suallar.title': 200,
  'suallar.lead': 300,
  'footer.title': 200,
  'footer.cta': 80,
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "home.roadmapTitle" + "az" -> "homeRoadmapTitleAz" (form sahə adı; nested obyekt sintaksisi
// express.urlencoded({ extended: false }) ilə dəstəklənmədiyi üçün düz saxlanılır).
export function textFieldName(key, lang) {
  const [top, ...rest] = key.split('.');
  return `${top}${rest.map(capitalize).join('')}${capitalize(lang)}`;
}

export function getPath(obj, dottedKey) {
  return dottedKey.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
}

export function setPath(obj, dottedKey, value) {
  const parts = dottedKey.split('.');
  const top = parts[0];
  obj[top] = Array.isArray(obj[top]) ? [...obj[top]] : { ...obj[top] };
  let cur = obj[top];
  for (let i = 1; i < parts.length - 1; i += 1) {
    cur[parts[i]] = { ...cur[parts[i]] };
    cur = cur[parts[i]];
  }
  if (parts.length > 1) cur[parts[parts.length - 1]] = value;
  else obj[top] = value;
}
