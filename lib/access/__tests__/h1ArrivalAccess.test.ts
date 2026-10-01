/**
 * H1-COHORT-GATE-01 · the one H1 arrival authority. Closed on any doubt, and
 * inherits nothing from any other allowlist.
 */
import { canUseH1Arrival, h1AdmissionResponse } from '../h1ArrivalAccess';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const OPEN = { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: `${A}` };

describe('canUseH1Arrival', () => {
  it('admits a listed member when enabled', () => {
    expect(canUseH1Arrival(A, OPEN)).toBe(true);
    expect(canUseH1Arrival(A.toUpperCase(), OPEN)).toBe(true);
    expect(canUseH1Arrival(A, { ...OPEN, H1_ARRIVAL_MEMBER_IDS: ` ${B} , ${A} ` })).toBe(true);
  });

  it('refuses an unlisted member', () => {
    expect(canUseH1Arrival(B, OPEN)).toBe(false);
  });

  it.each([
    ['absent config', {}],
    ['list without enable', { H1_ARRIVAL_MEMBER_IDS: A }],
    ['disabled', { H1_ARRIVAL_ENABLED: 'false', H1_ARRIVAL_MEMBER_IDS: A }],
    ['enable not exactly "true"', { H1_ARRIVAL_ENABLED: 'TRUE', H1_ARRIVAL_MEMBER_IDS: A }],
    ['enable "1"', { H1_ARRIVAL_ENABLED: '1', H1_ARRIVAL_MEMBER_IDS: A }],
    ['enabled, no list', { H1_ARRIVAL_ENABLED: 'true' }],
    ['enabled, empty list', { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: ' , ' }],
    ['one malformed id closes the whole list', { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: `${A},not-a-uuid` }],
  ])('closed: %s', (_label, env) => {
    expect(canUseH1Arrival(A, env)).toBe(false);
  });

  it('refuses missing or malformed identity', () => {
    expect(canUseH1Arrival(null, OPEN)).toBe(false);
    expect(canUseH1Arrival(undefined, OPEN)).toBe(false);
    expect(canUseH1Arrival('', OPEN)).toBe(false);
    expect(canUseH1Arrival('not-a-uuid', { ...OPEN, H1_ARRIVAL_MEMBER_IDS: 'not-a-uuid' })).toBe(false);
  });

  it('inherits no other authority (founder, lab, early field, steward)', () => {
    const env = {
      FOUNDER_MEMBER_IDS: A, LAB_ACCESS_MEMBER_IDS: A, EARLY_FIELD_MEMBER_IDS: A, STEWARD_MEMBER_IDS: A,
    } as Record<string, string>;
    expect(canUseH1Arrival(A, env)).toBe(false);
    expect(canUseH1Arrival(A, { ...env, H1_ARRIVAL_ENABLED: 'true' })).toBe(false);
  });

  it('reads process.env by default', () => {
    const saved = { ...process.env };
    try {
      process.env.H1_ARRIVAL_ENABLED = 'true';
      process.env.H1_ARRIVAL_MEMBER_IDS = A;
      expect(canUseH1Arrival(A)).toBe(true);
      delete process.env.H1_ARRIVAL_ENABLED;
      expect(canUseH1Arrival(A)).toBe(false);
    } finally {
      process.env = saved;
    }
  });
});

describe('h1AdmissionResponse — a boolean and nothing else', () => {
  it('signed out → 401 not admitted', () => {
    expect(h1AdmissionResponse(null, OPEN)).toEqual({ status: 401, body: { admitted: false } });
  });
  it('verified member → 200 with exactly { admitted }', () => {
    expect(h1AdmissionResponse(A, OPEN)).toEqual({ status: 200, body: { admitted: true } });
    expect(h1AdmissionResponse(B, OPEN)).toEqual({ status: 200, body: { admitted: false } });
    expect(Object.keys(h1AdmissionResponse(A, OPEN).body)).toEqual(['admitted']);
  });
});
