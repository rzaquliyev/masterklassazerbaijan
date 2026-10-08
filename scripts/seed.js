import 'dotenv/config';
import { getDb } from '../src/lib/db.js';
import { runMigrations } from './migrate.js';
import seedSampleData from './seed-data.js';

const db = await getDb();
await runMigrations(db);
const n = await seedSampleData(db);
console.log(`${n} SAMPLE masterklass yaradıldı.`);
process.exit(0);
