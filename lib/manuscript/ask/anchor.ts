/**
 * WS2-05B-8B-02c-2 — what an Ask conversation is about.
 *
 * A DISCRIMINATED UNION WITH NO SHARED OPTIONAL FIELDS, for the reason
 * `StructureInterpretation` gives for `none` and `ambiguous` having no `units`
 * field at all: a shape that cannot hold a proposal cannot be filled with one by
 * a surface that forgot to check. `{ on: 'work' }` has no `proposalId` to be
 * wrong about.
 *
 * KEYED ON HOST-MINTED IDS, NEVER ON MAIA'S WORDS. A division anchor names
 * `ProposedUnit.id`. It does NOT name `editorialLabel` - that is her commentary
 * about a division, it never becomes a title, and an anchor keyed on display
 * text would let a client name a thing by describing it.
 *
 * 02c-2 SCOPE: `question` and `uncertainty` are the two anchors this slice
 * builds. The rest are declared here because the coherence rules are one rule
 * over the whole union and splitting them across units is how they drift.
 * `concern` is NOT reachable from any surface yet - author-originated
 * section-level concerns are a later slice.
 */

import type { StructureInterpretation } from '../structure/interpret';

export type AskAnchor =
  | { on: 'work' }
  | { on: 'proposal'; proposalId: string }
  | { on: 'division'; proposalId: string; unitId: string }
  | { on: 'question'; proposalId: string; questionIndex: number }
  | { on: 'uncertainty'; proposalId: string; regionIndex: number }
  | { on: 'section'; sectionId: string }
  | { on: 'concern'; sectionIds: string[]; unitId?: string };

/** Anchors that cannot exist without the reading they point into. */
const PROPOSAL_DEPENDENT = ['proposal', 'division', 'question', 'uncertainty'] as const;

export function isProposalDependent(a: AskAnchor): boolean {
  return (PROPOSAL_DEPENDENT as readonly string[]).includes(a.on);
}

export type AnchorRefusal =
  /** A proposal-dependent anchor arrived without a frozen reading. */
  | 'anchor_requires_reading'
  /** anchor.proposalId disagrees with the reading it was handed. */
  | 'anchor_reading_mismatch'
  /** The index or id does not resolve inside that frozen reading. */
  | 'anchor_unresolved'
  | 'anchor_unknown';

export type AnchorCheck =
  | { ok: true; anchor: AskAnchor }
  | { ok: false; refusal: AnchorRefusal; detail?: string };

/**
 * The coherence invariant, in one place.
 *
 *   proposal | division | question | uncertainty
 *       REQUIRE reading !== null
 *       REQUIRE anchor.proposalId === reading.proposalId
 *
 *   work | section | concern
 *       MAY have reading === null
 *
 * A MISMATCH IS REFUSED, NOT REPAIRED. Preferring either side would let one
 * reading's authority be laundered onto another reading's content - the failure
 * WS2 refuses everywhere else. The caller is told which, and nothing opens.
 *
 * `concern` IS THE ONE PARTIAL CASE, and it degrades rather than refuses: if its
 * optional `unitId` does not resolve against the reading it claims, the concern
 * still opens WITHOUT the unit relationship. The author's concern is theirs and
 * survives; only the false structural claim is dropped. Guessing at which unit
 * they meant would be the system authoring their concern for them.
 */
export function checkAnchor(
  anchor: AskAnchor,
  reading: { proposalId: string; interpretation: StructureInterpretation } | null,
): AnchorCheck {
  switch (anchor.on) {
    case 'work':
      return { ok: true, anchor };

    case 'section':
      return { ok: true, anchor };

    case 'concern': {
      if (anchor.unitId === undefined) return { ok: true, anchor };
      if (!reading || !hasUnit(reading.interpretation, anchor.unitId)) {
        /* Degrade, do not refuse. See the doc comment. */
        const { unitId: _dropped, ...withoutUnit } = anchor;
        return { ok: true, anchor: { ...withoutUnit, on: 'concern' } };
      }
      return { ok: true, anchor };
    }

    case 'proposal':
    case 'division':
    case 'question':
    case 'uncertainty': {
      if (!reading) return { ok: false, refusal: 'anchor_requires_reading' };
      if (anchor.proposalId !== reading.proposalId) {
        return { ok: false, refusal: 'anchor_reading_mismatch' };
      }
      const i = reading.interpretation;

      if (anchor.on === 'division') {
        return hasUnit(i, anchor.unitId)
          ? { ok: true, anchor }
          : { ok: false, refusal: 'anchor_unresolved', detail: 'unit' };
      }
      if (anchor.on === 'question') {
        const qs = i.editorialSynthesis?.questionsForAuthor ?? [];
        return anchor.questionIndex >= 0 && anchor.questionIndex < qs.length
          ? { ok: true, anchor }
          : { ok: false, refusal: 'anchor_unresolved', detail: 'question' };
      }
      if (anchor.on === 'uncertainty') {
        return anchor.regionIndex >= 0 && anchor.regionIndex < i.uncertainRegions.length
          ? { ok: true, anchor }
          : { ok: false, refusal: 'anchor_unresolved', detail: 'region' };
      }
      return { ok: true, anchor };
    }

    default:
      return { ok: false, refusal: 'anchor_unknown' };
  }
}

/** Units live only on the forms that have them - `none` and `ambiguous` do not. */
function hasUnit(i: StructureInterpretation, unitId: string): boolean {
  const walk = (units: readonly { id: string; children?: readonly unknown[] }[]): boolean =>
    units.some((u) =>
      u.id === unitId ||
      walk((u.children ?? []) as readonly { id: string; children?: readonly unknown[] }[]));

  if ('units' in i) return walk(i.units);
  if (i.form === 'ambiguous') return i.alternatives.some((a) => walk(a.units));
  return false;
}
