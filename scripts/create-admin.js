// İlk "owner" admin istifadəçisini yaradır. Default parol YOXDUR — mühit dəyişənlərindən oxunur.
// İstifadə: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.js
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { getDb } from '../src/lib/db.js';
import { runMigrations } from './migrate.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('ADMIN_EMAIL və ADMIN_PASSWORD mühit dəyişənləri lazımdır.');
  console.error('Məsələn: ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD="güclü-parol" node scripts/create-admin.js');
  process.exit(1);
}
if (password.length < 10) {
  console.error('Parol ən azı 10 simvol olmalıdır.');
  process.exit(1);
}

const db = await getDb();
await runMigrations(db);

const { rows: existing } = await db.query('SELECT id FROM admin_users WHERE email = $1', [email]);
if (existing.length > 0) {
  console.log(`"${email}" artıq mövcuddur, heç nə edilmədi.`);
  process.exit(0);
}

const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
const id = randomUUID();
await db.query(
  'INSERT INTO admin_users (id, email, password_hash, role) VALUES ($1,$2,$3,$4)',
  [id, email, passwordHash, 'owner'],
);
console.log(`Admin yaradıldı: ${email} (owner). /admin/login ünvanından daxil olun.`);
process.exit(0);
