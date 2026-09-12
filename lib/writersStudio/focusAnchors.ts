/**
 * WORK WITH THIS — the anchors a developmental observation DECLARED.
 *
 * ⭐⭐ THE LAW THIS FILE EXISTS TO ENFORCE:
 *
 *   A Focus Set seeded from an observation contains EXACTLY the places that
 *   observation cited. Not one section more.
 *
 * ⛔ THE FAILURE IT FORBIDS. The tempting implementation reads the phenomenon
 * and gathers "the sections implicated by it" — every section of the chapter a
 * cited section sits in, the neighbours of a cited passage, everything the
 * recurrence "is probably about". That is not extraction; it is MAIA authoring
 * scope under the appearance of navigation. The observation's evidence refs are
 * the writer's only guarantee that MAIA's claim is bounded, and a door that
 * widens them turns an evidence-bound finding into an open-ended one on the way
 * through. The negative falsifier beside this file asserts that the widened
 * implementation FAILS.
 *
 * ⛔ STRUCTURAL EVIDENCE YIELDS NO ANCHOR. `structure-unit`, `structure-units`
 * and `structure-topology` name MEMBER-AUTHORED DIVISIONS, not sections. A
 * division could be expanded into the sections it holds — and that expansion is
 * exactly the widening above, performed by arithmetic instead of by opinion. An
 * observation resting only on structure has no section-level place to stand, and
 * the honest consequence is that this door is not offered for it.
 *
 * ── UNITS ──────────────────────────────────────────────────────────────────
 *
 * A `passage` range is in Unicode CODE POINTS relative to the section AS READ
 * (evidenceRef.ts). It is carried through in those units and converted only at
 * the moment it meets a current body, in focusSet.ts, which is also where the
 * conversion's honesty is adjudicated. Nothing here converts anything.
 */

import type { EvidenceRef } from '../manuscript/development/evidenceRef';
import type { SpacedRange } from '../manuscript/sections/coordinateSpace';

/**
 * One place a Focus Set member will stand. Section-addressed by construction:
 * there is no structural variant, because structure yields no anchor.
 */
export type FocusAnchor =
  | { kind: 'section'; sectionId: string }
  | { kind: 'passage'; sectionId: string; range: SpacedRange };

const keyOf = (a: FocusAnchor): string =>
  a.kind === 'section'
    ? `s:${a.sectionId}`
    /* ⭐ The space is part of the identity: the same numbers in two spaces are
       two different places, and deduplicating them together would merge them. */
    : `p:${a.sectionId}:${a.range.space}:${a.range.start}-${a.range.end}`;

/**
 * The anchors an observation declared, in the order it declared them.
 *
 * Deduplicated by identity only — the same section cited twice is one place,
 * and two different ranges in one section are two places. Order is first-seen,
 * never sorted: the observation's own sequence is how the writer will meet it.
 */
export function focusAnchorsFor(refs: readonly EvidenceRef[]): FocusAnchor[] {
  const out: FocusAnchor[] = [];
  const seen = new Set<string>();
  const push = (a: FocusAnchor) => {
    const k = keyOf(a);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(a);
  };
  for (const ref of refs) {
    switch (ref.kind) {
      case 'section':
        push({ kind: 'section', sectionId: ref.sectionId });
        break;
      case 'passage':
        /**
         * ⭐⭐ THE SPACE IS STAMPED HERE, because this is where the knowledge is.
         *
         * `PassageRef.range` is documented as code points "RELATIVE TO THE
         * SECTION AS READ" — the STORED text, heading prefix included. That
         * fact lives in the evidence contract and nowhere downstream, so the
         * lift out of evidence is the one honest place to record it.
         *
         * ⛔ FOCUS-W3 happened because this range travelled as a bare
         * `{start,end}` and was applied to the projected body. An offset is
         * meaningless without its text; from here it carries its text with it.
         */
        push({
          kind: 'passage', sectionId: ref.sectionId,
          range: { space: 'stored_section_text', start: ref.range.start, end: ref.range.end },
        });
        break;
      /* A run names the sequence from first to last AS READ. Each named id is a
         declared place; the ids BETWEEN them are not named and are not added —
         the run's ids are the evidence, not the interval they suggest. */
      case 'section-run':
        for (const id of ref.sectionIds) push({ kind: 'section', sectionId: id });
        break;
      case 'structure-unit':
      case 'structure-units':
      case 'structure-topology':
        break;
    }
  }
  return out;
}

/** Whether this observation has anywhere for a Focus Set to stand. */
export function hasFocusAnchors(refs: readonly EvidenceRef[]): boolean {
  return focusAnchorsFor(refs).length > 0;
}
