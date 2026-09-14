/**
 * WS-DISCLOSURE-ORIENTATION-TRANSPORT-01 — where a section SITS, derived.
 *
 * ⭐⭐ THE WHOLE POINT: a member asked to authorize the reading of named sections
 * is currently handed opaque identities. An ordinal — the section's place in the
 * FROZEN topology of the reading that governs this Ask — lets them orient
 * without a single authored character crossing the boundary.
 *
 * ⛔ WHAT AN ORDINAL IS NOT. It is not authority. `sectionRef` remains the only
 * identity that authorizes anything; the ordinal is presentation metadata and is
 * never accepted back from a client as an authorization term. Nothing in this
 * module reads a client value.
 *
 * ⭐ WHOLE-WORK, NEVER SUBSET-RELATIVE. The ordinal counts position in the whole
 * frozen topology. Three required sections sitting 2nd, 5th and 9th in the work
 * are `2, 5, 9` — ⛔ never renumbered `1, 2, 3`, which would tell the member a
 * falsehood about their own manuscript.
 *
 * ⭐ FAIL CLOSED, AND SAID PLAINLY. A required identity absent from the frozen
 * topology is not orientable. There is no `0`, no `"unknown"`, no omission, no
 * UUID-order fallback and no best effort — the derivation REFUSES, and the
 * caller must refuse with it. *A system that cannot locate the section it is
 * asking permission to read is not yet entitled to ask for permission to read
 * it.*
 *
 * ⛔ The refusal carries a COUNT and no identifier: a refusal is not an occasion
 * to disclose.
 *
 * PURE. No database, no I/O, no clock — every branch is exercisable without one.
 */

/** A section identity paired with where it sits in the frozen reading. */
export interface SectionOrientation {
  /** The authority identity. Unchanged, and the only thing that authorizes. */
  readonly sectionRef: string;
  /** 1-based position in the WHOLE frozen topology. Never subset-relative. */
  readonly ordinal: number;
}

export type OrientationDerivation =
  | { readonly kind: 'oriented'; readonly orientations: readonly SectionOrientation[] }
  /** ⛔ At least one required identity is not in the frozen topology. Count only. */
  | { readonly kind: 'unlocatable'; readonly unlocatableCount: number };

/**
 * Position of `sectionId` in the frozen topology, 1-based, or null when the id
 * was never read.
 *
 * ⚠️ This is the TRANSPORT derivation's canonical ordinal primitive — ⛔ not the
 * organism-wide sole definition of frozen position. `frozenPosition()` in
 * `lib/writersStudio/developPresentation.ts` independently computes the same
 * thing for the presentation surface, and deliberately still does: consolidating
 * the two was architecturally right but outside this lane's authorized surface,
 * and is routed to a later explicitly authorized cleanup. ⛔ Do not repair the
 * parity here; do not describe this as the only definition until it is one.
 */
export function frozenOrdinal(
  sectionTopology: readonly string[], sectionId: string,
): number | null {
  const i = sectionTopology.indexOf(sectionId);
  return i < 0 ? null : i + 1;
}

/**
 * Orientation for exactly the required identities, ordered by whole-Work
 * ordinal — ⛔ not UUID order, ⛔ not the order the caller supplied them in.
 *
 * ⚠️ The required set is the caller's DERIVED set (`deriveBodyRequirement`),
 * never a client's. This function widens nothing: an identity absent from
 * `requiredSections` never appears in the result, whatever the topology holds.
 */
export function deriveSectionOrientations(
  sectionTopology: readonly string[],
  requiredSections: readonly string[],
): OrientationDerivation {
  const oriented: SectionOrientation[] = [];
  const seen = new Set<string>();
  let unlocatableCount = 0;

  for (const sectionRef of requiredSections) {
    if (seen.has(sectionRef)) continue;
    seen.add(sectionRef);
    const ordinal = frozenOrdinal(sectionTopology, sectionRef);
    if (ordinal === null) { unlocatableCount += 1; continue; }
    oriented.push({ sectionRef, ordinal });
  }

  if (unlocatableCount > 0) return { kind: 'unlocatable', unlocatableCount };

  oriented.sort((a, b) => a.ordinal - b.ordinal);
  return { kind: 'oriented', orientations: oriented };
}
