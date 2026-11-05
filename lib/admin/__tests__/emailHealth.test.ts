import { describe, it, expect } from '@jest/globals';
import { deriveEmailHealth, type EmailAttemptRow } from '../emailHealth';

const row = (over: Partial<EmailAttemptRow>): EmailAttemptRow => ({
  provider: 'smtp', state: 'accepted', purpose: 'auth:email-code', failure_class: null,
  created_at: '2026-11-05T20:00:00Z', ...over,
});

describe('email health', () => {
  it('is unknown, never working, when nothing is recorded', () => {
    expect(deriveEmailHealth([]).status).toBe('unknown');
  });

  it('is working when the latest meaningful event is an accepted send', () => {
    const h = deriveEmailHealth([
      row({ created_at: '2026-11-05T20:45:00Z' }),
      row({ state: 'refused', failure_class: 'provider_auth', provider: 'resend', created_at: '2026-10-29T19:00:00Z' }),
    ]);
    expect(h.status).toBe('working');
    expect(h.lastAcceptedAt).toBe('2026-11-05T20:45:00.000Z');
    expect(h.lastAcceptedProvider).toBe('smtp');
  });

  it('is failing since the first refusal after the last accepted send', () => {
    const h = deriveEmailHealth([
      row({ state: 'refused', failure_class: 'provider_auth', purpose: 'auth:password-reset', created_at: '2026-10-03T10:00:00Z' }),
      row({ state: 'refused', failure_class: 'provider_auth', purpose: 'auth:email-code', created_at: '2026-09-30T10:00:00Z' }),
      row({ created_at: '2026-09-29T00:40:00Z', provider: 'resend' }),
    ]);
    expect(h.status).toBe('failing');
    expect(h.failingSince).toBe('2026-09-30T10:00:00.000Z');
    expect(h.failureClass).toBe('provider_auth');
    expect(h.failingPurposes.sort()).toEqual(['auth:email-code', 'auth:password-reset']);
  });

  it('one bad address is not evidence the transport is down', () => {
    const h = deriveEmailHealth([
      row({ state: 'refused', failure_class: 'invalid_recipient', created_at: '2026-11-05T21:00:00Z' }),
      row({ created_at: '2026-11-05T20:45:00Z' }),
    ]);
    expect(h.status).toBe('working');
  });

  it('only refusals recorded and no accepted send is still failing, with no last-sent time', () => {
    const h = deriveEmailHealth([row({ state: 'refused', failure_class: 'not_configured' })]);
    expect(h.status).toBe('failing');
    expect(h.lastAcceptedAt).toBeNull();
  });

  it('exposes no recipient field', () => {
    const keys = Object.keys(deriveEmailHealth([row({})])).sort();
    expect(keys).toEqual(['basis', 'failingPurposes', 'failingSince', 'failureClass', 'lastAcceptedAt', 'lastAcceptedProvider', 'status'].sort());
  });
});
