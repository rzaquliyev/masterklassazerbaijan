import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhoneAz, InvalidPhoneError } from '../src/lib/phone.js';

describe('normalizePhoneAz', () => {
  test('müxtəlif yazılışlar eyni E.164 formatına gətirilir', () => {
    const expected = '+994501234567';
    assert.equal(normalizePhoneAz('0501234567'), expected);
    assert.equal(normalizePhoneAz('050 123 45 67'), expected);
    assert.equal(normalizePhoneAz('+994 50 123 45 67'), expected);
    assert.equal(normalizePhoneAz('994501234567'), expected);
    assert.equal(normalizePhoneAz('+994-50-123-45-67'), expected);
  });

  test('tanış olmayan operator prefiksi rədd edilmir (yalnız struktur yoxlanılır)', () => {
    // skill qaydası: "do not hard-reject unfamiliar prefixes"
    assert.equal(normalizePhoneAz('0991234567'), '+994991234567');
  });

  test('səhv formatlı nömrə xəta atır', () => {
    assert.throws(() => normalizePhoneAz('12345'), InvalidPhoneError);
    assert.throws(() => normalizePhoneAz('abc'), InvalidPhoneError);
    assert.throws(() => normalizePhoneAz('+995501234567'), InvalidPhoneError);
  });
});
