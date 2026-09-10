/**
 * THE LOG-PRIVACY LAW, AT THE TWO FOCUS SITES THAT EMIT.
 *
 *   A durable member identifier - including a directly matchable prefix of it -
 *   must not be emitted to operational logs. Where correlation is necessary, use
 *   memberRef().
 *
 * This invariant was ratified on the other Focus lineage and never crossed to
 * this one. It is proved behaviorally rather than by source scan: both logging
 * paths are actually driven, and the emitted payload is inspected for the raw id
 * AND for its prefix.
 */

const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));

import { assembleFocus } from '../assembleFocus';
import { mintDisclosureAuthority, type DisclosureLocus } from '@/lib/disclosure/disclosureAuthority';
import { memberRef } from '@/lib/privacy/memberRef';

/** A realistic durable identifier, so a prefix leak is detectable. */
const MEMBER = '3f3f3f3f-0000-4000-8000-000000000001';
const WORK = 'work-1';
const SECTION: DisclosureLocus = { scopeKind: 'section', sectionRef: 'sec-A' };

const grant = (locus: DisclosureLocus = SECTION, memberId = MEMBER, workRef = WORK) =>
  mintDisclosureAuthority({ memberId, workRef, locus });

let errors: unknown[][] = [];
beforeEach(() => {
  errors = [];
  query.mockReset();
  jest.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { errors.push(a); });
});
afterEach(() => jest.restoreAllMocks());

/** Everything the site actually emitted, as one inspectable string. */
const emitted = () => JSON.stringify(errors);

const assertNoIdentifierLeak = () => {
  expect(errors.length).toBeGreaterThan(0);
  const payload = errors[0][1] as Record<string, unknown>;
  expect(payload.memberRef).toBe(memberRef(MEMBER));
  // The derivation is a sha256 slice, so it must not BE the id or contain it.
  expect(emitted()).not.toContain(MEMBER);
  expect(emitted()).not.toContain(MEMBER.slice(0, 8));
  expect(payload).not.toHaveProperty('memberIdPrefix');
};

describe('assembly failure - the log correlates without disclosing', () => {
  it('emits memberRef, never the id and never its prefix', async () => {
    query.mockRejectedValue(new Error('relation does not exist'));
    const out = await assembleFocus({
      authority: grant(), memberId: MEMBER, workRef: WORK, locus: SECTION,
    });
    expect(out).toBeNull();
    expect(errors[0][0]).toBe('[FOCUS] assembly failed');
    assertNoIdentifierLeak();
  });
});

describe('capability refusal - the newer site, governed by the same law', () => {
  it('emits memberRef, never the id and never its prefix', async () => {
    // A genuine capability for a DIFFERENT Work: refused at the load, and the
    // refusal is logged. This site did not exist in the original repair; fixing
    // only the historically corresponding line would satisfy provenance and
    // violate the law.
    const out = await assembleFocus({
      authority: grant(SECTION, MEMBER, 'work-OTHER'), memberId: MEMBER, workRef: WORK, locus: SECTION,
    });
    expect(out).toBeNull();
    expect(errors[0][0]).toBe('[FOCUS] disclosure refused');
    expect((errors[0][1] as Record<string, unknown>).reason).toBe('work_mismatch');
    assertNoIdentifierLeak();
    // The query is never reached, so the refusal log is the ONLY emission.
    expect(query).not.toHaveBeenCalled();
  });
});

describe('the derivation itself', () => {
  it('is not a fragment of the identifier', () => {
    const ref = memberRef(MEMBER);
    expect(MEMBER).not.toContain(ref);
    expect(ref).not.toContain(MEMBER.slice(0, 8));
  });
});
