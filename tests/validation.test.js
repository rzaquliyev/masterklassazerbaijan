import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { bookingInputSchema } from '../src/schemas/booking.js';

describe('bookingInputSchema', () => {
  test('zod sxemi düzgün məlumatı qəbul edir', () => {
    const result = bookingInputSchema.safeParse({
      sessionId: randomUUID(),
      idempotencyKey: 'abcdefgh12345',
      child: { firstName: 'Aysu', birthYear: 2018 },
      parent: { fullName: 'Aynur Məmmədova', phone: '0501234567' },
      consent: true,
    });
    assert.equal(result.success, true);
    assert.equal(result.data.marketingConsent, false);
  });

  test('zod sxemi natamam/səhv məlumatı rədd edir', () => {
    const missingConsent = bookingInputSchema.safeParse({
      sessionId: randomUUID(),
      idempotencyKey: 'abcdefgh12345',
      child: { firstName: 'Aysu' },
      parent: { fullName: 'Aynur Məmmədova', phone: '0501234567' },
      consent: false,
    });
    assert.equal(missingConsent.success, false);

    const badSessionId = bookingInputSchema.safeParse({
      sessionId: 'not-a-uuid',
      idempotencyKey: 'abcdefgh12345',
      child: { firstName: 'Aysu' },
      parent: { fullName: 'Aynur Məmmədova', phone: '0501234567' },
      consent: true,
    });
    assert.equal(badSessionId.success, false);

    const emptyChildName = bookingInputSchema.safeParse({
      sessionId: randomUUID(),
      idempotencyKey: 'abcdefgh12345',
      child: { firstName: '' },
      parent: { fullName: 'Aynur Məmmədova', phone: '0501234567' },
      consent: true,
    });
    assert.equal(emptyChildName.success, false);
  });
});
