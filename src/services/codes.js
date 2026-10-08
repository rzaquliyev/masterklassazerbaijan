import { randomInt } from 'node:crypto';
import { normalizePhoneAz } from '../lib/phone.js';
import { findOrCreateCustomer } from '../repositories/customers.js';
import { findDiscountCodeByOwner, createDiscountCode } from '../repositories/content.js';

const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
function randomCodeSuffix() {
  var s = '';
  for (var i = 0; i < 4; i++) s += CODE_LETTERS[randomInt(CODE_LETTERS.length)];
  return s;
}

const HIDE_SEEK_PERCENT = 10;
const REFERRAL_PERCENT = 10;

export async function claimHideSeekReward(db, rawPhone) {
  const phoneE164 = normalizePhoneAz(rawPhone);
  const customer = await findOrCreateCustomer(db, { phoneE164, fullName: 'Gizlənqaç oyunçusu' });

  const existing = await findDiscountCodeByOwner(db, customer.id, 'hide-seek');
  if (existing) return { code: existing.code, percent: existing.percent, alreadyClaimed: true };

  const code = `ULDUZ-${randomCodeSuffix()}`;
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const row = await createDiscountCode(db, { code, type: 'hide-seek', ownerCustomerId: customer.id, percent: HIDE_SEEK_PERCENT, expiresAt });
  return { code: row.code, percent: row.percent, alreadyClaimed: false };
}

export async function getOrCreateReferralCode(db, customerId) {
  const existing = await findDiscountCodeByOwner(db, customerId, 'referral');
  if (existing) return existing;
  const code = `DOST-${randomCodeSuffix()}`;
  return createDiscountCode(db, { code, type: 'referral', ownerCustomerId: customerId, percent: REFERRAL_PERCENT, expiresAt: null });
}
