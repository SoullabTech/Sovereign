/**
 * F1h / F1j / F1k / F1l - ACT IDENTITY.
 *
 * The known-bad implementation is not hypothetical: until this pass the Focus
 * route minted both identifiers with `randomUUID()` per HTTP invocation. These
 * tests are written so that behaviour goes RED, and the ratified derivation goes
 * GREEN, against the same assertions.
 */

import { randomUUID } from 'crypto';
import { actIdentifiers, isUsableActId } from '../actIdentity';

/** THE KNOWN-BAD IMPLEMENTATION, preserved so the falsifier can be shown red. */
const knownBadIdentifiers = (_actId: string) => ({
  requestId: randomUUID(),
  disclosureId: randomUUID(),
});

const ACT = 'act-9f2c1b77-writer-pressed-ask';

describe('F1k - TRANSPORT REPLAY', () => {
  it('the same act yields the same identifiers, so a replay is not a second act', () => {
    const first = actIdentifiers(ACT);
    const replay = actIdentifiers(ACT);

    expect(replay.requestId).toBe(first.requestId);
    expect(replay.disclosureId).toBe(first.disclosureId);
  });

  it('RED against the known-bad randomUUID-per-invocation behaviour', () => {
    const first = knownBadIdentifiers(ACT);
    const replay = knownBadIdentifiers(ACT);

    // This is what the shipped Focus route did. Every retry looked like a fresh
    // disclosure act, so F1k was ratified law with no mechanism beneath it.
    expect(replay.requestId).not.toBe(first.requestId);
    expect(replay.disclosureId).not.toBe(first.disclosureId);
  });
});

describe('F1h / F1j - A DELIBERATE RETRY IS FRESH AT BOTH LAYERS', () => {
  it('a new act id yields a new requestId AND a new disclosureId', () => {
    const first = actIdentifiers(ACT);
    const deliberate = actIdentifiers('act-0000-writer-asked-again');

    // BOTH layers. A fresh disclosure_id sitting on an old requestId would look
    // correct from the receipt outward while remaining a resumed act underneath.
    expect(deliberate.requestId).not.toBe(first.requestId);
    expect(deliberate.disclosureId).not.toBe(first.disclosureId);
  });

  it('the two identifiers of one act never collide with each other', () => {
    // Domain separation: a request id must not be usable as a disclosure id.
    const { requestId, disclosureId } = actIdentifiers(ACT);
    expect(requestId).not.toBe(disclosureId);
  });

  it('derivation is a pure function of the act id and nothing ambient', () => {
    const a = actIdentifiers(ACT);
    const b = actIdentifiers(`  ${ACT}  `);
    // Whitespace is not identity; the surface may hand it back untrimmed.
    expect(b).toEqual(a);
  });
});

describe('F1l - THE CLASSIFICATION IS THE CALLER\'S, AND MUST ARRIVE', () => {
  it('refuses to invent an act id', () => {
    // The residual procedural risk lives at the caller. This function will not
    // paper over its absence by generating one - which is precisely how the
    // known-bad behaviour came to exist.
    expect(() => actIdentifiers('')).toThrow(/act id is required/);
    expect(() => actIdentifiers('   ')).toThrow(/act id is required/);
  });

  it.each([
    [undefined, false],
    [null, false],
    [42, false],
    ['short', false],
    ['act-1234567890', true],
  ])('rejects an unusable act id: %p -> %p', (value, usable) => {
    expect(isUsableActId(value)).toBe(usable);
  });
});
