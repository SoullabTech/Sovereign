/**
 * RC-GEN-01 · 3C-1 falsifiers.
 *
 * C5 is the load-bearing one: the same semantic request serialized differently
 * must produce the SAME digest. A known-bad that hashes JSON.stringify of the
 * request object fails it, and an idempotency key that breaks under
 * re-serialization protects nothing.
 */
import {
  invocationDigest,
  canonicalizeInvocation,
  classifyInvocation,
  INVOCATION_DIGEST_VERSION,
  type CanonicalInvocation,
} from '../lib/manuscript/revision/invocationIdentity';

const A: CanonicalInvocation = {
  contractVersion: 'RC-GEN-01/1',
  threadId: 'thread-1',
  memberId: 'member-1',
  question: 'Make this less abstract.',
  sections: [
    { sectionId: 'sec-a', text: 'The kettle clicked off.' },
    { sectionId: 'sec-b', text: 'Mara poured the water.' },
  ],
};

describe('⭐ C5 — semantic identity, not wire representation', () => {
  it('section ORDER does not change the digest', () => {
    const reordered = { ...A, sections: [A.sections[1], A.sections[0]] };
    expect(invocationDigest(reordered)).toBe(invocationDigest(A));
  });

  it('object KEY order does not change the digest', () => {
    const rebuilt: CanonicalInvocation = {
      sections: A.sections, question: A.question, memberId: A.memberId,
      threadId: A.threadId, contractVersion: A.contractVersion,
    };
    expect(invocationDigest(rebuilt)).toBe(invocationDigest(A));
  });

  it('a fresh deep copy digests identically', () => {
    expect(invocationDigest(JSON.parse(JSON.stringify(A)))).toBe(invocationDigest(A));
  });
});

describe('⭐ C3 — a materially different invocation is a different identity', () => {
  it.each<[string, CanonicalInvocation]>([
    ['a different question', { ...A, question: 'Make this longer.' }],
    ['revised section prose', { ...A, sections: [{ ...A.sections[0], text: 'The kettle clicked.' }, A.sections[1]] }],
    ['a different authorized section', { ...A, sections: [{ sectionId: 'sec-c', text: A.sections[0].text }, A.sections[1]] }],
    ['a dropped section', { ...A, sections: [A.sections[0]] }],
    ['an added section', { ...A, sections: [...A.sections, { sectionId: 'sec-c', text: 'new' }] }],
    ['a different thread', { ...A, threadId: 'thread-2' }],
    ['a different member', { ...A, memberId: 'member-2' }],
    ['a different contract version', { ...A, contractVersion: 'RC-GEN-01/2' }],
  ])('%s changes the digest', (_label, variant) => {
    expect(invocationDigest(variant)).not.toBe(invocationDigest(A));
  });

  it('⭐ the SAME question against REVISED text is a different act', () => {
    const revised = { ...A, sections: [{ ...A.sections[0], text: 'The kettle clicked off, twice.' }, A.sections[1]] };
    expect(invocationDigest(revised)).not.toBe(invocationDigest(A));
  });
});

describe('⛔ the encoding cannot be forged by prose', () => {
  it('length-prefixing prevents field-boundary collisions', () => {
    const one: CanonicalInvocation = { ...A, question: 'ab', sections: [{ sectionId: 'x', text: 'cd' }] };
    const two: CanonicalInvocation = { ...A, question: 'a', sections: [{ sectionId: 'x', text: 'bcd' }] };
    expect(invocationDigest(one)).not.toBe(invocationDigest(two));
  });

  it('the canonical form is readable, so a disagreement can be inspected', () => {
    expect(canonicalizeInvocation(A)).toContain('Make this less abstract.');
  });
});

describe('classification', () => {
  it('same digest -> replay', () => {
    const d = invocationDigest(A);
    expect(classifyInvocation(d, d)).toEqual({ kind: 'replay', digest: d });
  });

  it('⭐ different digest -> conflict, carrying both, never "completed"', () => {
    const d1 = invocationDigest(A);
    const d2 = invocationDigest({ ...A, question: 'something else' });
    const v = classifyInvocation(d1, d2);
    expect(v.kind).toBe('conflict');
    expect(JSON.stringify(v)).not.toContain('completed');
    expect(JSON.stringify(v)).not.toContain('already_consumed');
  });

  it('the digest is versioned so identity semantics are not retroactive', () => {
    expect(invocationDigest(A).startsWith(`${INVOCATION_DIGEST_VERSION}:`)).toBe(true);
  });
});
