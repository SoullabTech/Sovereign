/**
 * CLIENT REMINDER CONSENT GATE TESTS
 *
 * Governance invariant: no client-facing external reminder (SMS or WhatsApp) leaves the
 * system unless the client has practitioner_clients.reminder_consent = true — consent on
 * the actual reminder recipient (practitioner_clients.phone), NOT client_contacts (which is
 * reserved for third-party contacts and is never the recipient of a client reminder).
 *
 * 1. isClientReminderType matches CLIENT reminder prefixes only (not practitioner/booking)
 * 2. sendDualChannelNotification SKIPS (no send) when there is no practitioner_clients row
 * 3. ...SKIPS when reminder_consent is false
 * 4. ...SKIPS when reminder_consent is null
 * 5. ...PROCEEDS (send attempted) when reminder_consent is true
 * 6. ...does NOT consult reminder_consent for a non-reminder type (booking_confirmation)
 * 7. a skip records an auditable *_skipped_no_client_consent row
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock the database query function (functional style — matches safety.test.ts)
const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

// The service imports the email sender at module load; stub it so import is side-effect free.
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: jest.fn(),
  SENDERS: { noreply: 'noreply@test' },
}));

import {
  sendDualChannelNotification,
  isClientReminderType,
} from '../SessionNotificationService';

const TWILIO_ENV_KEYS = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM_NUMBER',
  'TWILIO_MESSAGING_SERVICE_SID',
  'TWILIO_WHATSAPP_NUMBER',
] as const;

const baseSession = {
  id: 'session-1',
  clientId: 'client-1',
  clientName: 'Test Client',
  clientPhone: '+15551234567',
  serviceName: 'Session',
  scheduledStart: new Date('2026-07-01T15:00:00Z'),
  scheduledEnd: new Date('2026-07-01T16:00:00Z'),
  locationType: 'video',
  practitionerName: 'Dr. Test',
  practitionerId: 'prac-1',
};

const SKIP_REASON = 'Skipped: no client consent';

describe('Client reminder consent gate (practitioner_clients.reminder_consent)', () => {
  let originalFetch: typeof global.fetch;
  let fetchSpy: jest.Mock;
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [] }); // default for any unconfigured call

    // Determinism: no ambient Twilio creds unless a test sets them.
    for (const k of TWILIO_ENV_KEYS) {
      savedEnv[k] = process.env[k];
      delete process.env[k];
    }

    originalFetch = global.fetch;
    fetchSpy = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ sid: 'SM123' }) } as any);
    (global as any).fetch = fetchSpy;

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    for (const k of TWILIO_ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
    jest.restoreAllMocks();
  });

  // --- Classifier -----------------------------------------------------------

  describe('isClientReminderType', () => {
    it('matches client reminder prefixes only', () => {
      expect(isClientReminderType('reminder_24h')).toBe(true);
      expect(isClientReminderType('reminder_1h')).toBe(true);
      expect(isClientReminderType('manual_reminder')).toBe(true);
    });

    it('does NOT match practitioner or booking types (practitioner reminders stay ungated)', () => {
      expect(isClientReminderType('practitioner_reminder_24h')).toBe(false);
      expect(isClientReminderType('booking_confirmation')).toBe(false);
      expect(isClientReminderType('')).toBe(false);
    });
  });

  // --- Skip paths (fail closed) --------------------------------------------

  it('skips the send when there is no practitioner_clients row', async () => {
    // consent lookup returns no rows (default mock)
    const result = await sendDualChannelNotification(baseSession, 'reminder_24h', 'prac-1');

    expect(result.whatsapp.error).toBe(SKIP_REASON);
    expect(result.sms.error).toBe(SKIP_REASON);
    expect(result.whatsapp.success).toBe(false);
    expect(result.sms.success).toBe(false);
    // No external message attempted
    expect(fetchSpy).not.toHaveBeenCalled();
    // Consent was looked up by client id on practitioner_clients
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('reminder_consent'),
      ['client-1']
    );
  });

  it('skips when reminder_consent is false', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ reminder_consent: false }] }); // consent lookup
    const result = await sendDualChannelNotification(baseSession, 'reminder_1h', 'prac-1');

    expect(result.whatsapp.error).toBe(SKIP_REASON);
    expect(result.sms.error).toBe(SKIP_REASON);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skips when reminder_consent is null', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ reminder_consent: null }] }); // consent lookup
    const result = await sendDualChannelNotification(baseSession, 'reminder_24h', 'prac-1');

    expect(result.whatsapp.error).toBe(SKIP_REASON);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('records an auditable *_skipped_no_client_consent row on skip', async () => {
    await sendDualChannelNotification(baseSession, 'reminder_24h', 'prac-1');

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO session_notifications'),
      ['session-1', 'reminder_24h_skipped_no_client_consent']
    );
  });

  // --- Pass path ------------------------------------------------------------

  it('proceeds with the send when reminder_consent is true', async () => {
    // Provide Twilio creds via env so the send can actually proceed past the gate.
    process.env.TWILIO_ACCOUNT_SID = 'AC_test';
    process.env.TWILIO_AUTH_TOKEN = 'tok_test';
    process.env.TWILIO_FROM_NUMBER = '+15550000000';

    mockQuery.mockResolvedValueOnce({ rows: [{ reminder_consent: true }] }); // consent lookup (first query)

    const result = await sendDualChannelNotification(baseSession, 'reminder_24h', 'prac-1');

    // Gate passed: not the consent-skip outcome, and a send was attempted.
    expect(result.whatsapp.error).not.toBe(SKIP_REASON);
    expect(fetchSpy).toHaveBeenCalled();
    expect(result.whatsapp.success).toBe(true);
  });

  // --- Scope: non-reminder types are never gated ---------------------------

  it('does NOT consult reminder_consent for a non-reminder type (booking_confirmation)', async () => {
    const result = await sendDualChannelNotification(baseSession, 'booking_confirmation', 'prac-1');

    // No consent lookup happened
    const queriedConsent = mockQuery.mock.calls.some(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('reminder_consent')
    );
    expect(queriedConsent).toBe(false);
    // It fell through to the credentials check (no creds in this test) rather than the gate.
    expect(result.whatsapp.error).toBe('No credentials');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
