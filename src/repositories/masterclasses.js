export async function listPublishedMasterclassesWithNextSession(db) {
  const { rows } = await db.query(`
    SELECT
      m.id, m.slug, m.title, m.description, m.age_min, m.age_max, m.house_id,
      h.name AS house_name, h.color_hex AS house_color,
      s.id AS next_session_id, s.starts_at AS next_starts_at,
      s.capacity AS next_capacity, s.booked AS next_booked, s.price_azn AS next_price_azn,
      s.location AS next_location
    FROM masterclasses m
    LEFT JOIN houses h ON h.id = m.house_id
    LEFT JOIN LATERAL (
      SELECT * FROM sessions
      WHERE masterclass_id = m.id AND status = 'scheduled' AND starts_at > now()
      ORDER BY starts_at ASC
      LIMIT 1
    ) s ON true
    WHERE m.is_published = true
    ORDER BY s.starts_at ASC NULLS LAST, m.title ASC
  `);
  return rows;
}

export async function findMasterclassBySlug(db, slug) {
  const { rows } = await db.query(
    `SELECT m.*, h.name AS house_name, h.color_hex AS house_color, h.slug AS house_slug
     FROM masterclasses m LEFT JOIN houses h ON h.id = m.house_id
     WHERE m.slug = $1 AND m.is_published = true`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function listUpcomingSessionsForMasterclass(db, masterclassId) {
  const { rows } = await db.query(
    `SELECT * FROM sessions
     WHERE masterclass_id = $1 AND status = 'scheduled' AND starts_at > now()
     ORDER BY starts_at ASC`,
    [masterclassId],
  );
  return rows;
}

export async function nextUpcomingSession(db) {
  const { rows } = await db.query(`
    SELECT s.*, m.slug AS masterclass_slug, m.title AS masterclass_title, m.age_min, m.age_max
    FROM sessions s
    JOIN masterclasses m ON m.id = s.masterclass_id
    WHERE s.status = 'scheduled' AND s.starts_at > now() AND m.is_published = true
    ORDER BY s.starts_at ASC
    LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function getSessionById(db, sessionId) {
  const { rows } = await db.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
  return rows[0] ?? null;
}

export async function listHouses(db) {
  const { rows } = await db.query('SELECT * FROM houses ORDER BY sort_order ASC');
  return rows;
}
