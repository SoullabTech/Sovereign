/**
 * Gate 3 — Soul Portrait consent access helper (the permission primitive).
 *
 * Tests the PURE liveness logic (`computeConsentLiveness`) — the constitutional
 * heart — with fabricated event sequences, no DB. The DB loaders around it are
 * thin and exercised by integration coverage; this file locks the RULES.
 *
 * Rule (SPEC §4.163): consent-live iff the LATEST governing accept/set for the
 * current agreement_version has NO later refuse/revoke by that actor.
 */

import {
  computeConsentLiveness,
  CURRENT_CONSENT_AGREEMENT_VERSION,
  type ConsentEvent,
  type ConsentAction,
  type ConsentActorType,
} from '@/lib/soulPortrait/consentAccess';

const V = CURRENT_CONSENT_AGREEMENT_VERSION;

/** event helper: day `t` gives ordering; version defaults to current */
const ev = (
  action: ConsentAction,
  actor_type: ConsentActorType,
  t: number,
  version: string = V,
): ConsentEvent => ({ action, actor_type, agreement_version: version, created_at: new Date(Date.UTC(2026, 0, t)) });

const live = (args: Parameters<typeof computeConsentLiveness>[0]) => computeConsentLiveness(args).live;

describe('computeConsentLiveness — adult subject (subject governs)', () => {
  test('subject accept → live', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'subject', 1)], currentVersion: V })).toBe(true);
  });

  test('subject set → live', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('set', 'subject', 1)], currentVersion: V })).toBe(true);
  });

  test('no governing accept at all → not live', () => {
    const r = computeConsentLiveness({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [], currentVersion: V });
    expect(r.live).toBe(false);
    expect(r.reason).toBe('no_governing_accept');
  });

  test('refuse after accept → not live', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'subject', 1), ev('refuse', 'subject', 2)], currentVersion: V })).toBe(false);
  });

  test('revoke after accept → not live', () => {
    const r = computeConsentLiveness({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'subject', 1), ev('revoke', 'subject', 2)], currentVersion: V });
    expect(r.live).toBe(false);
    expect(r.reason).toBe('later_refuse_or_revoke');
  });

  test('latest-wins: accept → revoke → accept → live', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'subject', 1), ev('revoke', 'subject', 2), ev('accept', 'subject', 3)], currentVersion: V })).toBe(true);
  });

  test('out-of-order input still resolves latest correctly (revoke after accept) → not live', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('revoke', 'subject', 2), ev('accept', 'subject', 1)], currentVersion: V })).toBe(false);
  });
});

describe('computeConsentLiveness — agreement_version scoping', () => {
  test('accept under an old version only → not live (re-consent required)', () => {
    const r = computeConsentLiveness({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'subject', 1, 'path-b-v0')], currentVersion: V });
    expect(r.live).toBe(false);
    expect(r.reason).toBe('no_governing_accept');
  });

  test('an old-version revoke does not affect a current-version accept', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'subject', 1), ev('revoke', 'subject', 2, 'path-b-v0')], currentVersion: V })).toBe(true);
  });
});

describe('computeConsentLiveness — minor subject (guardian governs)', () => {
  test('no guardian on record → not live (minor hard rule)', () => {
    const r = computeConsentLiveness({ subjectIsMinor: true, hasGuardianOnRecord: false, events: [ev('accept', 'guardian', 1)], currentVersion: V });
    expect(r.live).toBe(false);
    expect(r.reason).toBe('minor_no_guardian_on_record');
  });

  test('guardian on record + guardian accept → live', () => {
    expect(live({ subjectIsMinor: true, hasGuardianOnRecord: true, events: [ev('accept', 'guardian', 1)], currentVersion: V })).toBe(true);
  });

  test('guardian revoke closes it', () => {
    expect(live({ subjectIsMinor: true, hasGuardianOnRecord: true, events: [ev('accept', 'guardian', 1), ev('revoke', 'guardian', 2)], currentVersion: V })).toBe(false);
  });

  test('a subject accept does NOT govern a minor portrait (guardian governs)', () => {
    const r = computeConsentLiveness({ subjectIsMinor: true, hasGuardianOnRecord: true, events: [ev('accept', 'subject', 1)], currentVersion: V });
    expect(r.live).toBe(false);
    expect(r.reason).toBe('no_governing_accept');
  });
});

describe('computeConsentLiveness — governing actor isolation', () => {
  test('adult portrait ignores guardian events', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'guardian', 1)], currentVersion: V })).toBe(false);
  });

  test('system events never grant liveness', () => {
    expect(live({ subjectIsMinor: false, hasGuardianOnRecord: false, events: [ev('accept', 'system', 1)], currentVersion: V })).toBe(false);
  });
});
