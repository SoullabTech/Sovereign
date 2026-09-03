/**
 * The breakthrough participation boundary — MIPA Phase 0, P3f.
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3f
 *
 * ── THIS IS NOT A NEW POLICY ────────────────────────────────────────────────
 *
 * `breakthrough_moments` already has an adjudicated epistemic status, settled at
 * R25 (P3b):
 *
 *     machine-detected · machine-extracted · unendorsed system inference
 *         → EXCLUDED from canonical cognition
 *
 * That rule is unchanged. What P3f changes is WHERE it is applied. R25 applied
 * it inside `MemoryBundle.getBreakthroughs`, which correctly gated that path and
 * correctly scoped its claim to it. P1c then found a THIRD composer —
 * `lib/memory/MemoryOrchestrator.ts`, reading through `BreakthroughStore` and
 * emitting a `RECENT BREAKTHROUGHS` block into a live prompt — which had never
 * been wrong about R25 and had simply never passed through it.
 *
 * The lesson is structural, not about breakthroughs: a gate placed inside ONE
 * reader can be walked around by opening a second reader. So the adjudication
 * lives here, and every reader of the representation consumes the SAME certified
 * view.
 *
 * ── WHY THE EXCLUDED ARM CARRIES NO `insight` ───────────────────────────────
 *
 * Not a filter, not a flag. The excluded arm of the union simply does not have
 * the field, so a composer cannot render it — there is nothing to render. This
 * survives a rename, a reformat, a cast, and a downstream summary, because the
 * string never leaves this boundary in the first place.
 *
 * ── ACCESS IS NOT PARTICIPATION ─────────────────────────────────────────────
 *
 * P1c disposed `breakthrough_moments` as EXPORT: the member can see every
 * insight MAIA recorded about them. That closes the sovereignty covenant on the
 * access side and confers NO participation authority. The member being able to
 * read an inference is not MAIA being entitled to think with it.
 */

import { adjudicateParticipation, type ProvenanceClaim, type ExclusionReason } from '../maia/participationGate';

export interface BreakthroughBase {
  id: string;
  integrated: boolean;
  timestamp: Date;
  relatedThemes: string[];
}

export interface AdmittedBreakthrough extends BreakthroughBase {
  participation: 'admitted';
  insight: string;
  element?: string;
}

export interface ExcludedBreakthrough extends BreakthroughBase {
  participation: 'excluded';
  exclusionReason: ExclusionReason;
}

export type BreakthroughSnapshot = AdmittedBreakthrough | ExcludedBreakthrough;

/** The shape a `breakthrough_moments` read hands to the adjudicator. */
export interface BreakthroughRow {
  id?: unknown;
  insight?: unknown;
  element?: unknown;
  integrated?: unknown;
  timestamp?: unknown;
  createdAt?: unknown;
  related_themes?: unknown;
  relatedThemes?: unknown;
}

/**
 * Adjudicate one stored breakthrough row.
 *
 * PROVENANCE IS NEVER GUESSED, AND NEVER DEFAULTED TO MEMBER. The table has no
 * provenance column, so nothing here can establish authorship. Defaulting to
 * `member` would be the most dangerous possible "compatibility fix": it would
 * convert machine inference into member testimony silently, at the top of the
 * authority lattice.
 */
export function adjudicateBreakthroughRow(row: BreakthroughRow): BreakthroughSnapshot {
  const rawTime = row.timestamp ?? row.createdAt ?? null;
  const base: BreakthroughBase = {
    id: String(row.id ?? ''),
    integrated: row.integrated === true,
    timestamp: rawTime ? new Date(rawTime as string) : new Date(0),
    relatedThemes: (row.related_themes ?? row.relatedThemes ?? []) as string[],
  };

  const provenance: ProvenanceClaim = null;
  const verdict = adjudicateParticipation({ provenance, endorsement: 'none' });

  if (!verdict.admitted) {
    // No `insight`, no `element` on this arm — by type, not convention.
    return { ...base, participation: 'excluded', exclusionReason: verdict.reason };
  }
  return {
    ...base,
    participation: 'admitted',
    insight: String(row.insight ?? ''),
    ...(row.element ? { element: String(row.element) } : {}),
  };
}

/**
 * The only sanctioned way to get composable breakthroughs out of a snapshot
 * list.
 *
 * A caller that wants to compose must come through here. One that reaches past
 * it finds excluded rows with no `insight` to reach for.
 */
export function admittedBreakthroughs(
  snapshots: readonly BreakthroughSnapshot[],
): AdmittedBreakthrough[] {
  return snapshots.filter((b): b is AdmittedBreakthrough => b.participation === 'admitted');
}

/** Observability only — reported after adjudication, never an input to it. */
export function excludedBreakthroughCount(snapshots: readonly BreakthroughSnapshot[]): number {
  return snapshots.length - admittedBreakthroughs(snapshots).length;
}
