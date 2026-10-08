import 'dotenv/config';
import { createApp } from './app.js';
import { getDb } from './lib/db.js';
import { runMigrations } from '../scripts/migrate.js';

const port = process.env.PORT || 3000;

const db = await getDb();
await runMigrations(db);

if (process.env.NODE_ENV !== 'production') {
  const { rows } = await db.query('SELECT count(*)::int AS n FROM masterclasses');
  if (rows[0].n === 0) {
    const { default: seed } = await import('../scripts/seed-data.js');
    await seed(db);
    console.log('SAMPLE məlumat yaradıldı (boş DB aşkarlandı, yalnız development).');
  }
}

const app = await createApp();
app.listen(port, () => {
  console.log(`Server http://localhost:${port} ünvanında işləyir (${process.env.DATABASE_URL ? 'Postgres' : 'PGlite'}${process.env.PGLITE_DATA_DIR ? ', fayl: ' + process.env.PGLITE_DATA_DIR : ', yaddaşda/müvəqqəti'})`);
});
