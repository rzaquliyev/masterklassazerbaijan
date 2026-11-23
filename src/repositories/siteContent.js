// Sayt mətnləri (override) və bayram zolağı ayarları — bax migrations/004_site_content.sql.
export { EDITABLE_TEXT_KEYS } from '../lib/siteTextFields.js';

export async function getSiteTexts(db) {
  const { rows } = await db.query('SELECT * FROM site_texts');
  const byKey = {};
  for (const row of rows) byKey[row.key] = row;
  return byKey;
}

export async function upsertSiteText(db, key, { az, ru, en }) {
  await db.query(
    `INSERT INTO site_texts (key, az, ru, en, updated_at) VALUES ($1,$2,$3,$4, now())
     ON CONFLICT (key) DO UPDATE SET az = $2, ru = $3, en = $4, updated_at = now()`,
    [key, az || null, ru || null, en || null],
  );
}

export async function getSiteTheme(db) {
  const { rows } = await db.query('SELECT * FROM site_theme WHERE id = true');
  return rows[0];
}

export async function updateSiteTheme(db, { holidayEnabled, holidayColorToken, holidayTextAz, holidayTextRu, holidayTextEn }) {
  const { rows } = await db.query(
    `UPDATE site_theme SET holiday_enabled = $1, holiday_color_token = $2,
       holiday_text_az = $3, holiday_text_ru = $4, holiday_text_en = $5, updated_at = now()
     WHERE id = true RETURNING *`,
    [holidayEnabled, holidayColorToken, holidayTextAz || null, holidayTextRu || null, holidayTextEn || null],
  );
  return rows[0];
}
