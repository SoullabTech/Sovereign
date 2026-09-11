/**
 * RC-GEN-01 · 3C-1 — binding invocation identity to substantive identity.
 *
 * THE DEFECT THIS CLOSES. `actId` is caller-minted and survives a lost response,
 * which is exactly right. But `claim(ref, actId)` never sees the payload, so:
 *
 *   same actId + a materially different member invocation
 *     -> indistinguishable from a retry
 *     -> the second invocation silently disappears
 *
 * ⭐ That is not imperfect idempotency. It makes TWO DISTINCT INTENTIONAL ACTS
 * INDISTINGUISHABLE — transport identity overruling member intention. The digest
 * exists so the substrate can tell a replay from a different act.
 *
 * ⛔ NOT "THE SHA OF THE HTTP BODY". The canonical SEMANTIC payload is defined
 * first, and only that is hashed. Hashing the wire representation would let a
 * legitimate retry acquire a new identity by accident — a reordered JSON key, a
 * re-serialized array, a different whitespace convention in the transport layer —
 * and an idempotency key that breaks under re-serialization protects nothing.
 *
 * WHAT IS IN, and why each could legitimately change MAIA's act:
 *   contract version     a different contract is a different act
 *   thread id            the conversation the act belongs to
 *   member id            whose act it is
 *   question             what was actually asked
 *   authorized sections  WHICH prose, and THE PROSE ITSELF as sent — the same
 *                        question against revised text is a different act
 *
 * ⛔ WHAT IS OUT, deliberately: timestamps · request ids · tracing metadata ·
 * user agent · JSON key order · array order · retry counters · anything a
 * transport may legitimately vary between one press and its retry.
 */

import { createHash } from 'crypto';

export const INVOCATION_DIGEST_VERSION = 'rcg1';

export interface CanonicalInvocation {
  contractVersion: string;
  threadId: string;
  memberId: string;
  question: string;
  /** Order is NOT identity — these are sorted before hashing. */
  sections: readonly { sectionId: string; text: string }[];
}

/**
 * The canonical form, as a string, so a disagreement about identity can be read
 * rather than inferred from two hashes that differ.
 *
 * ⭐ Sections are sorted by id and length-prefixed. Sorting makes array order
 * incidental; length-prefixing makes the encoding unambiguous, so no combination
 * of prose can imitate the field separators and forge a different invocation's
 * digest.
 */
export function canonicalizeInvocation(inv: CanonicalInvocation): string {
  const field = (s: string) => `${[...s].length}:${s}`;
  const sections = [...inv.sections]
    .sort((a, b) => (a.sectionId < b.sectionId ? -1 : a.sectionId > b.sectionId ? 1 : 0))
    .map((s) => `${field(s.sectionId)}${field(s.text)}`)
    .join('');
  return [
    field(INVOCATION_DIGEST_VERSION),
    field(inv.contractVersion),
    field(inv.threadId),
    field(inv.memberId),
    field(inv.question),
    field(String(inv.sections.length)),
    sections,
  ].join('');
}

/** Versioned, so a future change to what identity MEANS is not silently retroactive. */
export function invocationDigest(inv: CanonicalInvocation): string {
  return `${INVOCATION_DIGEST_VERSION}:${createHash('sha256').update(canonicalizeInvocation(inv), 'utf8').digest('hex')}`;
}

/**
 * What the substrate should conclude when an `actId` arrives that it has seen.
 *
 * ⭐ `conflict` MUST be visibly different from an ordinary replay. No `completed`,
 * no generic "already consumed": the member made a different request and it must
 * not be reported as one already handled.
 */
export type InvocationVerdict =
  | { kind: 'replay'; digest: string }
  | { kind: 'conflict'; expected: string; received: string };

export function classifyInvocation(recordedDigest: string, incomingDigest: string): InvocationVerdict {
  return recordedDigest === incomingDigest
    ? { kind: 'replay', digest: incomingDigest }
    : { kind: 'conflict', expected: recordedDigest, received: incomingDigest };
}
