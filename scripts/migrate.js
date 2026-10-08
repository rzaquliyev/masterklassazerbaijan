import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from '../src/lib/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'migrations');

export async function runMigrations(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  const { rows: applied } = await db.query('SELECT filename FROM schema_migrations');
  const appliedSet = new Set(applied.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue;
    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    // pg Pool bir sorğuda çox statement qəbul edir, PGlite-in `.query()`-i yox (yalnız `.exec()`) —
    // hər iki backend-lə işləməsi üçün faylı statement-lərə bölüb bir-bir göndəririk.
    for (const statement of splitSqlStatements(sql)) {
      await db.query(statement);
    }
    await db.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    console.log(`Miqrasiya tətbiq olundu: ${file}`);
  }
}

function splitSqlStatements(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const db = await getDb();
  await runMigrations(db);
  console.log('Hamısı tətbiq olundu.');
  process.exit(0);
}
