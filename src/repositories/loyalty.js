export async function getLoyaltyAccount(db, customerId) {
  const { rows } = await db.query('SELECT * FROM loyalty_stamps WHERE customer_id = $1', [customerId]);
  return rows[0] ?? { customer_id: customerId, stamp_count: 0, free_sessions_available: 0 };
}

// Hər təsdiqlənmiş bron +1 möhür. 5-ə çatanda: sayğac sıfırlanır, 1 pulsuz masterklass əlavə olunur.
export async function addStamp(db, customerId) {
  const { rows } = await db.query(
    `INSERT INTO loyalty_stamps (customer_id, stamp_count, free_sessions_available, updated_at)
     VALUES ($1, 1, 0, now())
     ON CONFLICT (customer_id) DO UPDATE SET
       stamp_count = CASE WHEN loyalty_stamps.stamp_count + 1 >= 5 THEN 0 ELSE loyalty_stamps.stamp_count + 1 END,
       free_sessions_available = loyalty_stamps.free_sessions_available + CASE WHEN loyalty_stamps.stamp_count + 1 >= 5 THEN 1 ELSE 0 END,
       updated_at = now()
     RETURNING *`,
    [customerId],
  );
  return rows[0];
}
