// Hər test faylı üçün təzə, yaddaşda (in-memory) PGlite nümunəsi — paylaşılan vəziyyət yoxdur.
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
import { runMigrations } from '../../scripts/migrate.js';

export async function createTestDb() {
  const pglite = new PGlite();
  const db = {
    query: (text, params) => pglite.query(text, params),
    withTransaction: (fn) => pglite.transaction((tx) => fn({ query: (text, params) => tx.query(text, params) })),
  };
  await runMigrations(db);
  return db;
}

export async function seedHouseAndMasterclass(db, { capacity = 8, booked = 0, price = 25, earlyBirdPrice = null, earlyBirdSlots = 0 } = {}) {
  const houseId = randomUUID();
  await db.query(
    `INSERT INTO houses (id, slug, name, color_hex, sort_order) VALUES ($1,'gil','Gil evi','#E8682A',1)`,
    [houseId],
  );
  const masterclassId = randomUUID();
  await db.query(
    `INSERT INTO masterclasses (id, house_id, slug, title, age_min, age_max, is_published, is_sample)
     VALUES ($1,$2,'gil-boshqab','SAMPLE: Gil boşqab',6,9,true,true)`,
    [masterclassId, houseId],
  );
  const sessionId = randomUUID();
  await db.query(
    `INSERT INTO sessions (id, masterclass_id, starts_at, capacity, booked, price_azn, early_bird_price_azn, early_bird_slots, location, status)
     VALUES ($1,$2, now() + interval '1 day', $3, $4, $5, $6, $7, 'SAMPLE ünvan', 'scheduled')`,
    [sessionId, masterclassId, capacity, booked, price, earlyBirdPrice, earlyBirdSlots],
  );
  return { houseId, masterclassId, sessionId };
}

export function makeBookingInput(overrides = {}) {
  return {
    sessionId: overrides.sessionId,
    idempotencyKey: overrides.idempotencyKey ?? randomUUID(),
    child: { firstName: 'Aysu', birthYear: 2018, ...overrides.child },
    parent: { fullName: 'Aynur Məmmədova', phone: '0551234567', ...overrides.parent },
    consent: true,
    marketingConsent: false,
    ...overrides,
  };
}
