// Azərbaycan telefon nömrələrini E.164 formatına (+994XXXXXXXXX) normallaşdırır.
// Qəbul edilən girişlər: "0XX XXX XX XX", "+994 XX XXX XX XX", "994XXXXXXXXX", boşluq/tire ilə.
// Naməlum operator prefiksini rədd etmir — yalnız struktur (9 rəqəm, 994 kodu) yoxlanılır.

export class InvalidPhoneError extends Error {
  constructor(input) {
    super(`Telefon nömrəsi düzgün formatda deyil: ${input}`);
    this.name = 'InvalidPhoneError';
  }
}

export function normalizePhoneAz(input) {
  if (typeof input !== 'string') throw new InvalidPhoneError(String(input));
  const digits = input.replace(/[^\d]/g, '');

  let national; // 9 rəqəm, operator kodu daxil, aparıcı 0/994 olmadan
  if (digits.length === 9) {
    national = digits;
  } else if (digits.length === 10 && digits.startsWith('0')) {
    national = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('994')) {
    national = digits.slice(3);
  } else {
    throw new InvalidPhoneError(input);
  }

  if (!/^\d{9}$/.test(national)) throw new InvalidPhoneError(input);
  return `+994${national}`;
}
