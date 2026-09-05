/**
 * WS2-04A — the seeding invariant.
 *
 * Making a Working Draft section-addressable is a REPRESENTATION change, not
 * an edit. The writer's characters must survive it exactly, and the only way
 * to know that is to reconstruct the continuous draft from the sections the
 * conversion produced and compare it to the draft that went in — byte for
 * byte, before anything is committed.
 *
 * Founder ruling, 2026-08-30:
 *
 *   When the system changes authorship or meaning, ask.
 *   When the system performs a lossless structural upgrade whose truth is
 *   mechanically established, tell.
 *
 * That licence to proceed without asking is what makes this check
 * load-bearing. A conversion the member never approved must be provably
 * lossless, so the round trip is not a sanity check to log and move past: it
 * is the evidence the member is owed and never asked to supply. There is no
 * "close enough" branch, no tolerance, no normalisation of whitespace before
 * comparing. It matches or the conversion aborts.
 *
 * This module knows nothing about databases and writes nothing. It is pure so
 * that the invariant can be exercised exhaustively without a migration
 * existing to run it.
 */

/** One section of a section-addressable draft, in document order. */
export interface DraftSection {
  /** The section's own text, exactly as it will be stored. */
  text: string;
}

/**
 * Reconstruct the continuous draft from its sections.
 *
 * The inverse of whatever partition produced them. A partition splits a string
 * at boundaries and keeps every character on one side or the other, so
 * concatenation in document order restores the original exactly — provided
 * nothing was trimmed, normalised or re-joined with a separator. Which is why
 * this joins with NOTHING: any separator here would be a character the member
 * did not write.
 */
export function flattenSections(sections: readonly DraftSection[]): string {
  return sections.map((s) => s.text).join('');
}

export interface RoundTripResult {
  ok: boolean;
  /** Character offset of the first difference, or -1 when identical. */
  divergesAt: number;
  originalLength: number;
  reconstructedLength: number;
}

/**
 * THE GATE. Reconstruct and compare byte-for-byte.
 *
 * Reports the offset of the first divergence so a failure can be investigated
 * structurally — never the text on either side of it. A failing round trip is
 * a defect in the partition, and the member's prose is not diagnostic output.
 */
export function verifyRoundTrip(
  original: string,
  sections: readonly DraftSection[],
): RoundTripResult {
  const reconstructed = flattenSections(sections);
  const n = Math.min(original.length, reconstructed.length);
  let divergesAt = -1;
  for (let i = 0; i < n; i++) {
    if (original[i] !== reconstructed[i]) { divergesAt = i; break; }
  }
  if (divergesAt === -1 && original.length !== reconstructed.length) divergesAt = n;
  return {
    ok: divergesAt === -1,
    divergesAt,
    originalLength: original.length,
    reconstructedLength: reconstructed.length,
  };
}

/** Raised when a conversion would not round-trip. Carries no member text. */
export class SeedInvariantViolation extends Error {
  constructor(readonly result: RoundTripResult) {
    super(
      `seed invariant violated: reconstruction diverges at char ${result.divergesAt} ` +
      `(original ${result.originalLength} chars, reconstructed ${result.reconstructedLength})`,
    );
    this.name = 'SeedInvariantViolation';
  }
}

/**
 * Assert the invariant, or refuse. Call this INSIDE the conversion's
 * transaction, before commit, so a violation rolls back rather than leaving a
 * draft half-converted.
 */
export function assertRoundTrip(original: string, sections: readonly DraftSection[]): void {
  const result = verifyRoundTrip(original, sections);
  if (!result.ok) throw new SeedInvariantViolation(result);
}
