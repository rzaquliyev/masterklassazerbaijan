// Postgres (DATABASE_URL varsa) və ya PGlite (yoxdursa, lokal/test üçün) arasında seçim.
// Hər ikisi eyni `{ query(text, params) }` interfeysini verir.
import pg from 'pg';

let cached;

export async function getDb() {
  if (cached) return cached;

  if (process.env.DATABASE_URL) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    cached = {
      query: (text, params) => pool.query(text, params),
      withTransaction: (fn) => withPgTransaction(pool, fn),
      kind: 'postgres',
    };
    return cached;
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir = process.env.PGLITE_DATA_DIR;
  const pglite = dataDir ? new PGlite(dataDir) : new PGlite();
  cached = {
    query: (text, params) => pglite.query(text, params),
    withTransaction: (fn) => pglite.transaction((tx) => fn({ query: (text, params) => tx.query(text, params) })),
    kind: 'pglite',
  };
  return cached;
}

async function withPgTransaction(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn({ query: (text, params) => client.query(text, params) });
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
