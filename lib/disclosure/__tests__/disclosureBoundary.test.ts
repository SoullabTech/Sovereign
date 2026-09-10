/**
 * REQUEST-ORDER-01 · REPAIR — the four acceptance falsifiers, R1–R4.
 *
 *   ⭐⭐ Resolve authority first. Prove it exists. Account for the disclosure.
 *       Then let the context cross.
 *
 * These bind the ORDERING at the seam. The DB-level guarantee (the FK, and that
 * an awaited insert really is visible to the next statement) is executed for real
 * by scripts/witness/context-disclosure-substrate-witness.sql — because we now
 * know better than to settle for source inspection when ordering and constraints
 * are the actual claim.
 */

const calls: { sql: string; params: unknown[] }[] = [];
let consentPresent = false;
let consentRow: Record<string, string | null> | null = null;
let receiptConflicts = false;
let dbThrows: 'none' | 'consent' | 'receipt' = 'none';

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    if (/runtime_consent_state/.test(sql)) {
      if (dbThrows === 'consent') throw new Error('consent substrate down');
      if (/INSERT INTO/.test(sql)) {
        if (consentPresent) return { rows: [], rowCount: 0 };
        consentPresent = true;
        return { rows: [{ request_id: params[0] }], rowCount: 1 };
      }
      return { rows: consentRow ? [consentRow] : [], rowCount: consentRow ? 1 : 0 };
    }
    if (/context_disclosure_receipts/.test(sql)) {
      if (dbThrows === 'receipt') throw new Error('receipt substrate down');
      // ⭐ The FK, modelled: a receipt cannot exist without its consent row.
      if (/INSERT INTO/.test(sql) && !consentPresent) {
        throw new Error('insert or update on table violates foreign key constraint');
      }
      if (/INSERT INTO/.test(sql)) {
        return receiptConflicts ? { rows: [], rowCount: 0 } : { rows: [{ id: 'r1' }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 0 };
  }),
}));

import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { isMintedAuthority } from '../disclosureAuthority';
import { establishDisclosureBoundary, mayCrossBoundary } from '../disclosureBoundary';
import { requireConsentState, consentEstablished } from '@/lib/provenance/requireConsentState';

const posture = () => TurnPosture.resolve({});
/**
 * The ratified call shape: ONE locus, from which the receipt's scope columns and
 * the capability's grant are both derived. The earlier fixture passed a
 * pre-built `disclosure` block, which is how a receipt and a capability could
 * once have described different material.
 */
const boundaryArgs = (over: Record<string, unknown> = {}) => ({
  requestId: 'req-1', posture: posture(), memberId: 'm-1', sessionId: 's-1',
  disclosureId: 'd-1',
  boundary: 'writers_studio.focus->maia_cognition' as const,
  sourceClass: 'work' as const, participationBasis: 'member_invoked' as const,
  workRef: 'work-1',
  locus: { scopeKind: 'passage' as const, sectionRef: 'sec-1', range: { start: 0, end: 10 } },
  gesture: 'ask_maia' as const,
  ...over,
}) as any;

/** The attempt the boundary derives from those args, for direct-mint cases. */
const attemptFromArgs = () => ({
  disclosureId: 'd-1', memberId: 'm-1', requestRef: 'req-1',
  boundary: 'writers_studio.focus->maia_cognition' as const,
  sourceClass: 'work' as const, participationBasis: 'member_invoked' as const,
  sourceRef: 'work-1', scopeKind: 'passage' as const, gesture: 'ask_maia' as const,
}) as any;

beforeEach(() => {
  calls.length = 0; consentPresent = false; consentRow = null;
  receiptConflicts = false; dbThrows = 'none';
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('R1 · the awaited insert completes before the disclosure mint is attempted', () => {
  it('orders consent before receipt, in that sequence', async () => {
    const out = await establishDisclosureBoundary(boundaryArgs());
    expect(mayCrossBoundary(out)).toBe(true);
    const consentIdx = calls.findIndex(c => /INSERT INTO runtime_consent_state/.test(c.sql));
    const receiptIdx = calls.findIndex(c => /INSERT INTO context_disclosure_receipts/.test(c.sql));
    expect(consentIdx).toBeGreaterThanOrEqual(0);
    expect(receiptIdx).toBeGreaterThan(consentIdx);
  });

  it('⭐ is an ORDERING, not a coincidence: without the awaited consent the FK rejects the receipt', async () => {
    // Model the pre-repair world — the consent write never lands — and confirm
    // the receipt cannot be created. This is the invisible failure F1 predicted.
    const { mintDisclosureAttempt, mayCross } = require('../contextDisclosureReceipt');
    consentPresent = false;
    const out = await mintDisclosureAttempt({
      ...attemptFromArgs(), memberId: 'm-1', requestRef: 'req-1',
    });
    expect(mayCross(out)).toBe(false);
    expect(out.kind).toBe('unavailable');
  });

  it('is awaited — the primitive returns a resolved outcome, never a fired-and-forgotten void', async () => {
    const r = requireConsentState({ requestId: 'req-1', posture: posture(), memberId: 'm-1' });
    expect(typeof (r as Promise<unknown>).then).toBe('function');
    expect(consentEstablished(await r)).toBe(true);
  });
});

describe('R2 · an exact existing consent row is accepted; a mismatched one is refused', () => {
  it('accepts an identical row — first write wins on retry', async () => {
    consentPresent = true;
    consentRow = { member_id: 'm-1', session_id: 's-1', posture: 'normal', resolved_from: 'request-meta' };
    const out = await requireConsentState({ requestId: 'req-1', posture: posture(), memberId: 'm-1', sessionId: 's-1' });
    expect(out.kind).toBe('existing_exact');
    expect(consentEstablished(out)).toBe(true);
  });

  it('⛔ refuses a row describing a different request — a different posture is the sharp case', async () => {
    consentPresent = true;
    consentRow = { member_id: 'm-1', session_id: 's-1', posture: 'sanctuary', resolved_from: 'request-meta' };
    const out = await requireConsentState({ requestId: 'req-1', posture: posture(), memberId: 'm-1', sessionId: 's-1' });
    expect(out.kind).toBe('identity_mismatch');
    expect(consentEstablished(out)).toBe(false);
    expect((out as any).differing).toContain('posture');
  });

  it('refuses a forged posture — a plain object shaped like one is not one', async () => {
    const out = await requireConsentState({ requestId: 'req-1', posture: { sanctuary: false } as any });
    expect(out.kind).toBe('unavailable');
    expect(calls).toHaveLength(0);
  });

  it('logs which FIELDS differ, never their values', async () => {
    consentPresent = true;
    consentRow = { member_id: 'm-OTHER', session_id: 's-1', posture: 'normal', resolved_from: 'request-meta' };
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    await requireConsentState({ requestId: 'req-1', posture: posture(), memberId: 'm-1', sessionId: 's-1' });
    const logged = JSON.stringify(err.mock.calls);
    expect(logged).toMatch(/member_id/);
    expect(logged).not.toMatch(/m-OTHER/);
  });
});

describe('R3 · no consent row → NO receipt and NO cognition handoff', () => {
  it('refuses before any receipt is attempted', async () => {
    dbThrows = 'consent';
    const out = await establishDisclosureBoundary(boundaryArgs());
    expect(out.kind).toBe('consent_unavailable');
    expect(mayCrossBoundary(out)).toBe(false);
    expect(calls.some(c => /context_disclosure_receipts/.test(c.sql))).toBe(false);
  });

  it('assembles nothing — the seam never receives or touches Work content', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'lib/disclosure/disclosureBoundary.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const banned of ['text', 'passage', 'excerpt', 'body', 'content']) {
      expect(src).not.toMatch(new RegExp(`\\b${banned}\\s*[:?]`));
    }
  });

  it('⛔ never calls cognition — the seam returns permission, it does not perform the crossing', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'lib/disclosure/disclosureBoundary.ts'), 'utf8');
    expect(src).not.toMatch(/getMaiaResponse|maiaService|anthropic|generate\(/i);
  });

  it('a refused receipt also yields no crossing', async () => {
    receiptConflicts = true; // conflict, and the reconciling SELECT finds nothing
    const out = await establishDisclosureBoundary(boundaryArgs());
    expect(out.kind).toBe('receipt_refused');
    expect(mayCrossBoundary(out)).toBe(false);
  });
});

describe('R4 · one requestId, carried — never regenerated downstream', () => {
  it('the consent row and the receipt cite the SAME id', async () => {
    await establishDisclosureBoundary(boundaryArgs({ requestId: 'req-CARRIED' }));
    const consent = calls.find(c => /INSERT INTO runtime_consent_state/.test(c.sql))!;
    const receipt = calls.find(c => /INSERT INTO context_disclosure_receipts/.test(c.sql))!;
    expect(consent.params[0]).toBe('req-CARRIED');
    expect(receipt.params[2]).toBe('req-CARRIED'); // request_ref
    expect(receipt.params[2]).toBe(consent.params[0]);
  });

  it('⭐ the seam mints no id of its own — an identifier governing downstream authority must come from upstream', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'lib/disclosure/disclosureBoundary.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(src).not.toMatch(/randomUUID|uuid\(|Date\.now\(\)/);
  });

  it('neither does the consent primitive', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'lib/provenance/requireConsentState.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(src).not.toMatch(/randomUUID|uuid\(/);
  });

  it('⛔ recordConsentState is untouched — still fire-and-forget for its four other callers', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'lib/provenance/consentState.ts'), 'utf8');
    expect(src).toMatch(/export function recordConsentState/); // not async
    expect(src).toMatch(/void query\(/);
    expect(src).not.toMatch(/export async function recordConsentState/);
  });
});

/**
 * ONE LOCUS, TWO DERIVATIONS - the ADDENDUM-01/02 vocabulary at the boundary.
 *
 * These exist because a repaired fixture that only ever passes `passage` would
 * leave the suite silent about the scopes the amendments added. The locator
 * partition is the law under test: each scope carries exactly the locator that
 * names what crossed, and `passage` and `evidence_set` carry none.
 */
describe('the locator partition - the receipt names what crossed, never where it was', () => {
  const insertParams = () => {
    const insert = calls.find(c => /INSERT INTO context_disclosure_receipts/.test(c.sql))!;
    expect(insert).toBeDefined();
    const [scopeKind, sectionRef, unitRef, rangeFrom, rangeTo] = insert.params.slice(7, 12);
    return { scopeKind, sectionRef, unitRef, rangeFrom, rangeTo };
  };

  it('a unit names its division and nothing else', async () => {
    const out = await establishDisclosureBoundary(boundaryArgs({
      locus: { scopeKind: 'unit', unitRef: 'part-2', sectionRefs: ['s1', 's2'] },
    }));
    expect(mayCrossBoundary(out)).toBe(true);
    expect(insertParams()).toEqual({
      scopeKind: 'unit', sectionRef: null, unitRef: 'part-2', rangeFrom: null, rangeTo: null,
    });
  });

  it('a range names both bounds, and they travel as a pair', async () => {
    const out = await establishDisclosureBoundary(boundaryArgs({
      locus: { scopeKind: 'range', fromSectionRef: 's1', toSectionRef: 's4', sectionRefs: ['s1', 's2', 's3', 's4'] },
    }));
    expect(mayCrossBoundary(out)).toBe(true);
    expect(insertParams()).toEqual({
      scopeKind: 'range', sectionRef: null, unitRef: null, rangeFrom: 's1', rangeTo: 's4',
    });
  });

  it('an evidence_set records that a composite crossing occurred, and no member of it', async () => {
    const out = await establishDisclosureBoundary(boundaryArgs({
      locus: { scopeKind: 'evidence_set', members: ['section a', 'passage b 0 10'] },
    }));
    expect(mayCrossBoundary(out)).toBe(true);
    expect(insertParams()).toEqual({
      scopeKind: 'evidence_set', sectionRef: null, unitRef: null, rangeFrom: null, rangeTo: null,
    });
    const insert = calls.find(c => /INSERT INTO context_disclosure_receipts/.test(c.sql))!;
    expect(JSON.stringify(insert.params)).not.toContain('passage b');
  });

  it('a passage still refuses to record its containing section', async () => {
    const out = await establishDisclosureBoundary(boundaryArgs());
    expect(mayCrossBoundary(out)).toBe(true);
    expect(insertParams().sectionRef).toBeNull();
  });

  it('may_cross carries the capability - the only thing that can load the Work', async () => {
    const out = await establishDisclosureBoundary(boundaryArgs());
    expect(mayCrossBoundary(out)).toBe(true);
    if (!mayCrossBoundary(out)) throw new Error('unreachable');
    expect(isMintedAuthority(out.authority)).toBe(true);
  });
});
