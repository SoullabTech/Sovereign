/**
 * ADMISSION — the rule MAIL-03's two fixes were instances of.
 * ==========================================================
 *
 * These tests state the boundary as a property rather than as a pair of route
 * patches, so a THIRD endpoint written next month cannot reopen the hole by
 * being written carelessly.
 */
import { describe, it, expect } from '@jest/globals';
import { admit, isAuthenticated, describeAuthority } from '../admission';
import type { EmailAuthority } from '../admission';

const anon: EmailAuthority = { kind: 'anonymous' };
const member: EmailAuthority = { kind: 'member', memberId: 'm-1' };
const actor: EmailAuthority = { kind: 'actor', actorId: 'a-1', role: 'admin' };
const system: EmailAuthority = { kind: 'system', trigger: 'cron:reminders' };

describe('THE RULE — an anonymous caller may ring the doorbell, not choose the house', () => {
  it('REFUSES an anonymous send to a caller-supplied destination', () => {
    // This is the 2026-09 vulnerability, stated generally.
    const r = admit({
      purpose: 'auth:verification',
      authority: anon,
      destination: 'request-supplied',
    });

    expect(r.admitted).toBe(false);
    expect(r).toMatchObject({ reason: 'anonymous_caller_chose_destination' });
  });

  it('ADMITS an anonymous send to the address already on record', () => {
    // The legitimate half. Sign-in and recovery MUST work before authentication,
    // so refusing anonymity outright would lock out the people these serve.
    for (const purpose of ['auth:email-code', 'auth:magic-link', 'auth:passkey-recovery', 'auth:verification']) {
      const r = admit({ purpose, authority: anon, destination: 'member-record' });
      expect(r).toMatchObject({ admitted: true, lane: 'P0' });
    }
  });

  it('REFUSES an anonymous send claiming an actor-supplied destination', () => {
    const r = admit({ purpose: 'invite:team', authority: anon, destination: 'actor-supplied' });
    expect(r).toMatchObject({ admitted: false, reason: 'unauthenticated_actor_supplied' });
  });

  it('holds for EVERY purpose — the rule is not a per-route exception', () => {
    const purposes = [
      'auth:email-code', 'auth:magic-link', 'auth:verification', 'auth:password-reset',
      'invite:beta', 'invite:team', 'notify:dm', 'reminder:session', 'broadcast:update',
      'something:unregistered',
    ];
    for (const purpose of purposes) {
      expect(admit({ purpose, authority: anon, destination: 'request-supplied' }).admitted).toBe(false);
    }
  });
});

describe('purpose never licenses destination', () => {
  it('refuses a P0 identity purpose just as firmly as a bulk one', () => {
    // send-verification was vulnerable BECAUSE its purpose was legitimate and
    // that legitimacy was read as licence over the destination.
    const p0 = admit({ purpose: 'auth:verification', authority: anon, destination: 'request-supplied' });
    const p3 = admit({ purpose: 'broadcast:update', authority: anon, destination: 'request-supplied' });

    expect(p0.admitted).toBe(false);
    expect(p3.admitted).toBe(false);
  });
});

describe('a proven actor may choose a destination — that is what an invitation is', () => {
  it('admits an authenticated actor supplying an address', () => {
    expect(admit({ purpose: 'invite:team', authority: actor, destination: 'actor-supplied' }))
      .toMatchObject({ admitted: true, lane: 'P1' });
  });

  it('admits a member acting on their own record', () => {
    expect(admit({ purpose: 'notify:dm', authority: member, destination: 'member-record' }).admitted).toBe(true);
  });

  it('admits configured operational addresses', () => {
    expect(admit({ purpose: 'system:alert', authority: { kind: 'admin' }, destination: 'configured' }).admitted).toBe(true);
  });
});

describe('unattended senders have no caller to obey', () => {
  it('REFUSES a system trigger whose destination came from a request', () => {
    const r = admit({ purpose: 'reminder:session', authority: system, destination: 'request-supplied' });
    expect(r).toMatchObject({ admitted: false, reason: 'system_supplied_by_request' });
  });

  it('admits a system trigger reading from stored records', () => {
    expect(admit({ purpose: 'reminder:session', authority: system, destination: 'stored-record' }).admitted).toBe(true);
  });
});

describe('admission is a pure decision', () => {
  it('never throws, including on unregistered purposes', () => {
    expect(() => admit({ purpose: '', authority: anon, destination: 'member-record' })).not.toThrow();
    expect(() => admit({ purpose: 'nonsense', authority: system, destination: 'configured' })).not.toThrow();
  });

  it('is deterministic — the same request always returns the same answer', () => {
    const req = { purpose: 'auth:verification', authority: anon, destination: 'request-supplied' } as const;
    expect(admit(req)).toEqual(admit(req));
  });

  it('explains refusals well enough to fix the caller', () => {
    const r = admit({ purpose: 'auth:verification', authority: anon, destination: 'request-supplied' });
    if (r.admitted) throw new Error('expected refusal');
    // A refusal nobody can act on gets worked around rather than fixed.
    expect(r.detail).toContain('auth:verification');
    expect(r.detail.toLowerCase()).toContain('member record');
  });
});

describe('helpers', () => {
  it('classifies proven authority', () => {
    expect(isAuthenticated(anon)).toBe(false);
    expect(isAuthenticated(system)).toBe(false); // no human actor
    expect([member, actor, { kind: 'admin' } as EmailAuthority].every(isAuthenticated)).toBe(true);
  });

  it('describes authority without leaking identifiers', () => {
    expect(describeAuthority(member)).toBe('member');
    expect(describeAuthority(member)).not.toContain('m-1');
    expect(describeAuthority(actor)).toBe('actor:admin');
    expect(describeAuthority(system)).toBe('system:cron:reminders');
  });
});
