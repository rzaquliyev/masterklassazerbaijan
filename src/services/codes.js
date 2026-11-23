import { randomInt } from 'node:crypto';
import { findDiscountCodeByOwner, createDiscountCode } from '../repositories/content.js';

const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export function randomCodeSuffix() {
  var s = '';
  for (var i = 0; i < 4; i++) s += CODE_LETTERS[randomInt(CODE_LETTERS.length)];
  return s;
}

const REFERRAL_PERCENT = 10;


export async function getOrCreateReferralCode(db, customerId) {
  const existing = await findDiscountCodeByOwner(db, customerId, 'referral');
  if (existing) return existing;
  const code = `DOST-${randomCodeSuffix()}`;
  return createDiscountCode(db, { code, type: 'referral', ownerCustomerId: customerId, percent: REFERRAL_PERCENT, expiresAt: null });
}
