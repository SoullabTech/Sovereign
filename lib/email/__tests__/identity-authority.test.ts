/**
 * MAIL AUTHORITY — EMAIL-IDENTITY-01.
 *
 * Proton owns people talking to people; Resend owns software talking to people.
 * This suite is what keeps that separation from decaying:
 *
 *   1. the repository names no soullab.life address the registry does not
 *      declare, and uses no human/organizational mailbox as a software sender;
 *   2. sendEmail() refuses, before any provider call, a soullab.life sender
 *      that is not authorized on the lane the message would travel.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import path from 'path';
import { adjudicateSender, MAIL_IDENTITIES, UNGOVERNED_SOULLAB_SENDERS } from '../identity';
import { censusMailIdentities } from '../identityCensus';
import { sendEmail, SENDERS } from '../sendEmail';
import { MemoryProvider } from '../providers/MemoryProvider';
import type { EmailProvider } from '../providers/types';

const REPO_ROOT = path.resolve(__dirname, '../../..');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('static census — source agrees with the registry', () => {
  it('reports zero violations', () => {
    const violations = censusMailIdentities(REPO_ROOT);
    // Printed in full on failure so the fix is obvious from CI output alone.
    expect(violations.map((v) => `${v.kind} ${v.address} @ ${v.where} — ${v.detail}`)).toEqual([]);
  });

  it('named ungoverned debt does not grow', () => {
    expect(UNGOVERNED_SOULLAB_SENDERS.length).toBeLessThanOrEqual(2);
  });

  it('every SENDERS identity is a software identity on the resend lane', () => {
    for (const from of Object.values(SENDERS)) {
      expect(adjudicateSender(from, 'resend')).toEqual({ authorized: true, governed: true });
    }
  });

  it('organizational mailboxes are never app-sendable', () => {
    for (const m of MAIL_IDENTITIES.filter((m) => m.class === 'ORGANIZATIONAL')) {
      expect(m.appSendLanes).toEqual([]);
    }
  });
});

describe('adjudicateSender', () => {
  it('refuses an organizational mailbox as a sender', () => {
    expect(adjudicateSender('Help <support@soullab.life>', 'resend'))
      .toMatchObject({ authorized: false, reason: 'not_app_sendable' });
  });

  it('refuses an undeclared soullab.life address', () => {
    expect(adjudicateSender('new@soullab.life', 'resend'))
      .toMatchObject({ authorized: false, reason: 'unregistered' });
  });

  it('keeps the alert relay off Resend and transactional mail off SMTP', () => {
    expect(adjudicateSender('Ops <messages@soullab.life>', 'resend')).toMatchObject({ reason: 'wrong_lane' });
    expect(adjudicateSender('Ops <messages@soullab.life>', 'smtp')).toEqual({ authorized: true, governed: true });
    expect(adjudicateSender(SENDERS.noreply, 'smtp')).toMatchObject({ reason: 'wrong_lane' });
  });

  it('is case-insensitive and reads the bracketed mailbox, not the display name', () => {
    expect(adjudicateSender('NOREPLY@SOULLAB.LIFE', 'resend')).toEqual({ authorized: true, governed: true });
    expect(adjudicateSender('support@soullab.life <noreply@soullab.life>', 'resend'))
      .toEqual({ authorized: true, governed: true });
  });

  it('does not speak for domains it does not govern (practitioner BYO)', () => {
    expect(adjudicateSender('Dr Lee <lee@practice.example>', 'resend')).toEqual({ authorized: true, governed: false });
  });
});

describe('sendEmail — runtime enforcement', () => {
  const base = { purpose: 'test:identity', to: 'someone@example.com', subject: 's', text: 't' };

  it('refuses before the provider is called', async () => {
    const provider = new MemoryProvider();
    const r = await sendEmail({ ...base, from: 'Soullab Support <support@soullab.life>', provider });

    expect(r.success).toBe(false);
    expect(r.failureKind).toBe('sender_not_authorized');
    expect(r.providerCode).toBe('not_app_sendable');
    expect(r.ourFault).toBe(true);
    expect(r.retryable).toBe(false);
    expect(provider.sent()).toHaveLength(0);
  });

  it('lets an authorized identity through', async () => {
    const provider = new MemoryProvider();
    const r = await sendEmail({ ...base, from: SENDERS.bookings, provider });
    expect(r.success).toBe(true);
    expect(provider.sent()).toHaveLength(1);
  });

  it('fails closed on a provider whose lane is unknown', async () => {
    const send = jest.fn<EmailProvider['send']>();
    const unknown: EmailProvider = { name: 'mystery', isConfigured: () => true, send };
    const r = await sendEmail({ ...base, from: SENDERS.noreply, provider: unknown });
    expect(r.failureKind).toBe('sender_not_authorized');
    expect(send).not.toHaveBeenCalled();
  });
});
