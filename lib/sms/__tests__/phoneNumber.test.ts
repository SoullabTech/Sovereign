/**
 * Phone normalization + masking — pure, no deps. Twilio is the authoritative
 * validator at send time; this is the cheap guard on both client and server.
 */
import { describe, it, expect } from '@jest/globals';
import { normalizePhone, isValidPhone, maskPhone } from '@/lib/sms/phoneNumber';

describe('normalizePhone → E.164', () => {
  it('bare US 10-digit defaults to +1', () => {
    expect(normalizePhone('6172165533')).toBe('+16172165533');
  });
  it('formatted US number is stripped to E.164', () => {
    expect(normalizePhone('+1 (617) 216-5533')).toBe('+16172165533');
    expect(normalizePhone('(617) 216-5533')).toBe('+16172165533');
  });
  it('11-digit with leading 1 (no +) becomes +1…', () => {
    expect(normalizePhone('16172165533')).toBe('+16172165533');
  });
  it('explicit international + prefix is honoured', () => {
    expect(normalizePhone('+447911123456')).toBe('+447911123456');
  });
  it('rejects junk / too-short / empty', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone('abc')).toBeNull();
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone('+0123456')).toBeNull(); // leading 0 after + is invalid E.164
  });
});

describe('isValidPhone', () => {
  it('mirrors normalizePhone success', () => {
    expect(isValidPhone('6172165533')).toBe(true);
    expect(isValidPhone('nope')).toBe(false);
  });
});

describe('maskPhone', () => {
  it('shows only the last 4 digits', () => {
    expect(maskPhone('+16172165533')).toBe('•••• 5533');
  });
  it('handles null / short input without leaking', () => {
    expect(maskPhone(null)).toBeNull();
    expect(maskPhone('12')).toBe('••••');
  });
});
