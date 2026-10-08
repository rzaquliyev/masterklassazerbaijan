import { randomUUID } from 'node:crypto';

export async function findCustomerByPhone(db, phoneE164) {
  const { rows } = await db.query('SELECT * FROM customers WHERE phone_e164 = $1', [phoneE164]);
  return rows[0] ?? null;
}

export async function findOrCreateCustomer(db, { phoneE164, fullName, marketingConsent = false }) {
  const existing = await findCustomerByPhone(db, phoneE164);
  if (existing) return existing;

  const id = randomUUID();
  await db.query(
    `INSERT INTO customers (id, phone_e164, full_name, marketing_consent) VALUES ($1,$2,$3,$4)
     ON CONFLICT (phone_e164) DO NOTHING`,
    [id, phoneE164, fullName, marketingConsent],
  );
  // ON CONFLICT-dən sonra DO NOTHING ola bilər (paralel sorğu eyni telefonu yaratmış ola bilər) — hər iki halda mövcud sətri qaytarırıq.
  const row = await findCustomerByPhone(db, phoneE164);
  return row;
}

export async function findOrCreateChild(db, { customerId, firstName, birthYear, allergyNote }) {
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO children (id, customer_id, first_name, birth_year, allergy_note)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, customerId, firstName, birthYear ?? null, allergyNote ?? null],
  );
  return rows[0];
}
