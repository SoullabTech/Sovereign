/**
 * SMS dormancy gate. The feature must stay OFF until BOTH the master flag and the
 * required Twilio credentials are present — no partial-config sends.
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  isSmsEnabled,
  isSmsConfigured,
  isSmsSendConfigured,
  isSmsVerifyConfigured,
} from '@/lib/sms/config';

const KEYS = [
  'SMS_NOTIFICATIONS_ENABLED',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_MESSAGING_SERVICE_SID',
  'TWILIO_VERIFY_SERVICE_SID',
];
let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  saved = {};
  for (const k of KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('SMS config — dormant by default', () => {
  it('nothing set → fully dormant', () => {
    expect(isSmsEnabled()).toBe(false);
    expect(isSmsSendConfigured()).toBe(false);
    expect(isSmsVerifyConfigured()).toBe(false);
    expect(isSmsConfigured()).toBe(false);
  });

  it('flag on but no creds → still dormant', () => {
    process.env.SMS_NOTIFICATIONS_ENABLED = '1';
    expect(isSmsEnabled()).toBe(true);
    expect(isSmsConfigured()).toBe(false);
  });

  it('creds present but flag off → still dormant', () => {
    process.env.TWILIO_ACCOUNT_SID = 'ACx';
    process.env.TWILIO_AUTH_TOKEN = 'tok';
    process.env.TWILIO_MESSAGING_SERVICE_SID = 'MGx';
    process.env.TWILIO_VERIFY_SERVICE_SID = 'VAx';
    expect(isSmsConfigured()).toBe(false);
  });

  it('send needs a Messaging Service SID; verify needs a Verify SID — independently', () => {
    process.env.SMS_NOTIFICATIONS_ENABLED = '1';
    process.env.TWILIO_ACCOUNT_SID = 'ACx';
    process.env.TWILIO_AUTH_TOKEN = 'tok';
    process.env.TWILIO_MESSAGING_SERVICE_SID = 'MGx';
    expect(isSmsSendConfigured()).toBe(true);
    expect(isSmsVerifyConfigured()).toBe(false);
    expect(isSmsConfigured()).toBe(false); // needs BOTH

    process.env.TWILIO_VERIFY_SERVICE_SID = 'VAx';
    expect(isSmsVerifyConfigured()).toBe(true);
    expect(isSmsConfigured()).toBe(true);
  });
});
