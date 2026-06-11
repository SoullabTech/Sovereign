/**
 * Twilio StatusCallback signature validation.
 *
 * Spec: https://www.twilio.com/docs/usage/security#validating-requests
 *
 * Rather than trust a remembered magic base64 constant, this anchors on Twilio's
 * documented "resulting string" for the canonical example (the URL followed by
 * each POST param sorted by key and concatenated with no delimiters). The
 * expected signature is then derived from that documented string with raw crypto,
 * independently of the implementation under test — so the test proves our helper
 * builds the exact string Twilio signs.
 */
import crypto from 'crypto';
import {
  computeTwilioSignature,
  validateTwilioSignature,
} from '@/lib/comms/twilioSignature';

const URL = 'https://mycompany.com/myapp.php?foo=1&bar=2';
const PARAMS = {
  CallSid: 'CA1234567890ABCDE',
  Caller: '+14158675310',
  Digits: '1234',
  From: '+14158675310',
  To: '+18005551212',
};
const AUTH_TOKEN = '12345';

// Twilio's documented "resulting string" for the canonical example: the URL with
// each param (sorted by key) appended as key+value, no delimiters.
const TWILIO_DOC_STRING =
  'https://mycompany.com/myapp.php?foo=1&bar=2' +
  'CallSidCA1234567890ABCDE' +
  'Caller+14158675310' +
  'Digits1234' +
  'From+14158675310' +
  'To+18005551212';

// Independent reference signature derived from the documented string.
const REF_SIG = crypto
  .createHmac('sha1', AUTH_TOKEN)
  .update(Buffer.from(TWILIO_DOC_STRING, 'utf-8'))
  .digest('base64');

describe('twilioSignature', () => {
  it('builds the exact string Twilio signs (URL + sorted key+value, no delimiters)', () => {
    expect(computeTwilioSignature(AUTH_TOKEN, URL, PARAMS)).toBe(REF_SIG);
  });

  it('validates a correct signature', () => {
    expect(validateTwilioSignature(AUTH_TOKEN, URL, PARAMS, REF_SIG)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    expect(validateTwilioSignature(AUTH_TOKEN, URL, PARAMS, 'AAAAAAAAAAAAAAAAAAAAAAAAAAA=')).toBe(false);
  });

  it('rejects when a param value is tampered', () => {
    const tampered = { ...PARAMS, Digits: '9999' };
    expect(validateTwilioSignature(AUTH_TOKEN, URL, tampered, REF_SIG)).toBe(false);
  });

  it('rejects with the wrong auth token', () => {
    expect(validateTwilioSignature('wrong-token', URL, PARAMS, REF_SIG)).toBe(false);
  });

  it('rejects a missing signature', () => {
    expect(validateTwilioSignature(AUTH_TOKEN, URL, PARAMS, null)).toBe(false);
    expect(validateTwilioSignature(AUTH_TOKEN, URL, PARAMS, undefined)).toBe(false);
  });

  it('rejects when no auth token is configured', () => {
    expect(validateTwilioSignature('', URL, PARAMS, REF_SIG)).toBe(false);
  });

  it('is order-independent for params (sorted by key)', () => {
    const reordered = {
      To: '+18005551212',
      From: '+14158675310',
      CallSid: 'CA1234567890ABCDE',
      Digits: '1234',
      Caller: '+14158675310',
    };
    expect(validateTwilioSignature(AUTH_TOKEN, URL, reordered, REF_SIG)).toBe(true);
  });
});
