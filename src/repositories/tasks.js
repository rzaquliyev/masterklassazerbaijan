export async function getCurrentWeeklyTask(db) {
  const { rows } = await db.query(
    `SELECT t.*, m.slug AS masterclass_slug, m.title AS masterclass_title, h.name AS house_name
     FROM weekly_tasks t LEFT JOIN masterclasses m ON m.id = t.related_masterclass_id LEFT JOIN houses h ON h.id = m.house_id
     WHERE t.is_published = true AND t.unlock_date <= CURRENT_DATE
     ORDER BY t.unlock_date DESC LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function listUpcomingWeeklyTasks(db, limit = 3) {
  const { rows } = await db.query(
    `SELECT * FROM weekly_tasks WHERE is_published = true AND unlock_date > CURRENT_DATE ORDER BY unlock_date ASC LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function listPastTaskWinners(db, limit = 6) {
  const { rows } = await db.query(
    `SELECT p.*, t.title AS task_title, t.week_number
     FROM task_participants p JOIN weekly_tasks t ON t.id = p.task_id
     WHERE p.is_winner = true AND p.consent_public = true
     ORDER BY t.unlock_date DESC, p.created_at ASC LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function getTaskParticipantPublic(db, id) {
  const { rows } = await db.query(
    `SELECT p.*, t.title AS task_title, t.week_number
     FROM task_participants p JOIN weekly_tasks t ON t.id = p.task_id
     WHERE p.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}
