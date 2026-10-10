import { describe, expect, it } from 'vitest';
import { listenBetaAdmitted } from '../listenBetaAdmission';

const FOUNDER = '11111111-1111-4111-8111-111111111111';
const BETA_A = '22222222-2222-4222-8222-222222222222';
const BETA_B = '33333333-3333-4333-8333-333333333333';
const active = { eligible: true as const, basis: 'active_beta_tester' as const };
const founder = { eligible: true as const, basis: 'founder_witness' as const };
const refused = { eligible: false as const, basis: 'not_in_pilot' as const };

describe('Listen small beta: exact server-side cohort gate', () => {
  it('admits the authenticated founder for preflight without counting as a beta tester', () => {
    expect(listenBetaAdmitted(FOUNDER, founder, undefined)).toBe(true);
  });
  it('does not admit a general active beta tester without a Listen cohort', () => {
    expect(listenBetaAdmitted(BETA_A, active, undefined)).toBe(false);
    expect(listenBetaAdmitted(BETA_A, active, '')).toBe(false);
  });
  it('admits an exact active, member-linked tester on the explicitly configured Listen list', () => {
    expect(listenBetaAdmitted(BETA_A, active, BETA_B + ', ' + BETA_A)).toBe(true);
    expect(listenBetaAdmitted(BETA_B, active, BETA_A + '; ' + BETA_B)).toBe(true);
  });
  it('allows an explicitly configured witness without trusting a team-admin role alone', () => {
    expect(listenBetaAdmitted(FOUNDER, refused, undefined, FOUNDER)).toBe(true);
    expect(listenBetaAdmitted(FOUNDER, refused, undefined, BETA_A)).toBe(false);
    expect(listenBetaAdmitted(null, refused, undefined, FOUNDER)).toBe(false);
  });
  it('refuses general beta testers who are not on the exact Listen list', () => {
    expect(listenBetaAdmitted(BETA_A, active, BETA_B)).toBe(false);
  });
  it('never treats allowlisting as a substitute for active server-side tester status', () => {
    expect(listenBetaAdmitted(BETA_A, refused, BETA_A)).toBe(false);
    expect(listenBetaAdmitted(null, active, BETA_A)).toBe(false);
  });
  it('rejects wildcards, invalid IDs, and identity-prefix spoofing', () => {
    expect(listenBetaAdmitted(BETA_A, active, '*')).toBe(false);
    expect(listenBetaAdmitted(BETA_A, active, 'all')).toBe(false);
    expect(listenBetaAdmitted(BETA_A, active, BETA_A.substring(0, 8))).toBe(false);
    expect(listenBetaAdmitted('not-a-uuid', founder, undefined)).toBe(false);
  });
});
