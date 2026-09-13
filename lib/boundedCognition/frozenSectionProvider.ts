/**
 * BCS-01A · Step 7 — the authorized seam to frozen Work material.
 *
 * PREDICATE: recovers the exact frozen section material named by commission +
 * partition from the existing immutable-revision custody domain.
 * ⛔ NOT a second Work store. ⛔ NOT authority — it is invoked only after
 * `permitCrossing` passes and the claim generation is verified, and its return is
 * validated before the processor may see it.
 *
 * THE CALLER DOES NOT AUTHOR FROZEN STATE. Digest, range and revision identity
 * arrive from the provider and are checked against the commission; a caller that
 * could supply them could name its own frozen subject.
 */

import { createHash } from 'crypto';

export interface FrozenSectionRequest {
  readonly draftId: string;
  readonly revisionNumber: number;
  readonly sectionId: string;
}

/** Code-point interval, the unit `readState.ts` already fixes for section state. */
export interface CodePointRange {
  readonly start: number;
  readonly end: number;
}

export interface FrozenSectionMaterial {
  /** EPHEMERAL. Never persisted, never logged. */
  readonly text: string;
  readonly sectionId: string;
  readonly revisionDigest: string;
  readonly state: {
    readonly revisionNumber: number;
    readonly range: CodePointRange;
    readonly digest: string;
  };
}

export interface FrozenSectionProvider {
  acquire(request: FrozenSectionRequest): Promise<FrozenSectionMaterial>;
}

export type IntegrityRefusal =
  | 'revision_number_mismatch'
  | 'revision_digest_mismatch'
  | 'section_mismatch'
  | 'digest_mismatch'
  | 'range_length_mismatch';

export interface FrozenSubject {
  readonly draftId: string;
  readonly revisionNumber: number;
  readonly revisionDigest: string;
}

export const sha256 = (text: string): string =>
  createHash('sha256').update(text, 'utf8').digest('hex');

/** Unicode CODE POINTS — the unit the section partition is recorded in. */
export const codePointLength = (text: string): number => [...text].length;

/**
 * What the commission fixes may not be renegotiated by whatever bytes arrived.
 *
 * ⛔ A mismatch REFUSES. It is never repaired, and a new frozen identity is never
 * computed from the returned bytes — that would let the provider define the
 * subject the commission already fixed.
 */
export function validateFrozenMaterial(
  material: FrozenSectionMaterial,
  subject: FrozenSubject,
  requestedSectionId: string,
): { ok: true } | { ok: false; refusal: IntegrityRefusal } {
  if (material.sectionId !== requestedSectionId) {
    return { ok: false, refusal: 'section_mismatch' };
  }
  if (material.state.revisionNumber !== subject.revisionNumber) {
    return { ok: false, refusal: 'revision_number_mismatch' };
  }
  if (material.revisionDigest !== subject.revisionDigest) {
    return { ok: false, refusal: 'revision_digest_mismatch' };
  }
  if (sha256(material.text) !== material.state.digest) {
    return { ok: false, refusal: 'digest_mismatch' };
  }
  if (codePointLength(material.text) !== material.state.range.end - material.state.range.start) {
    return { ok: false, refusal: 'range_length_mismatch' };
  }
  return { ok: true };
}
