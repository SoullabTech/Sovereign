/**
 * THE FOCUS SET — declared attention at several places at once.
 *
 * ⭐⭐ U4, RATIFIED:  MEMBERSHIP ≠ EDIT TARGET.
 *
 *   Declaring attention to five places is not permission to assume which one
 *   the writer intends to change.
 *
 * So a set arrives with `activeIndex: null`. The writer clicks the place they
 * actually mean. Only then is "rewrite this one so it doesn't repeat the first"
 * unambiguous — and until then it is a question no part of this system is
 * entitled to answer on their behalf.
 *
 * ── ⭐ THE TWO ANCHORS ─────────────────────────────────────────────────────
 *
 * A set seeded by `Work with this` carries coordinates from a reading of
 * version 7. Those are HISTORICAL EVIDENCE about what MAIA read then. They are
 * not current manuscript coordinates and must never quietly become them.
 *
 *   ORIGIN         stays true forever. The observation was correct about the
 *                  Work it read.
 *   CURRENT FOCUS  is resolved HERE, now, against the Work as it is.
 *
 * Each member says which of four things is true of it:
 *
 *   current      the coordinates name current text, provably
 *   unverified   they fit, but the Work has been kept at a later version since
 *                the reading, so we cannot prove they name the same words
 *   stale        they no longer fit the section at all
 *   gone         the section is no longer in the Work
 *
 * ⛔ `unverified` IS NOT `current` AND IS NOT A FAILURE. It is the honest state
 * for "these offsets land somewhere, and we have no evidence that somewhere is
 * what the writer was shown". Collapsing it upward asserts a currency nothing
 * established; collapsing it downward discards a finding that is probably still
 * exact. The writer re-anchors it, or works with it knowing.
 *
 * ⛔ NOTHING IS RELOCATED, CLAMPED OR WIDENED. A stale range is marked and left
 * where it was. Clamping it to fit would silently change what the writer is
 * looking at, and would do so most confidently in the case where the text under
 * it had changed most — the case where being wrong costs the most.
 *
 * ── UNITS, converted exactly once ──────────────────────────────────────────
 *
 * An evidence range is in Unicode CODE POINTS (evidenceRef.ts). A HeldFocus
 * offset is in UTF-16 code units, because that is what `selectionStart` and
 * `String.slice` speak. The conversion happens here and nowhere else. Handing
 * a code-point offset to a textarea would silently mis-frame every passage
 * after the first astral character — an emoji, a rare CJK glyph — and would do
 * it quietly enough to look like a rendering bug for a month.
 */

import type { FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import type { BodyOf, HeldFocus, SectionRef } from './heldFocus';

export type FocusMemberState = 'current' | 'unverified' | 'stale' | 'gone';

export interface FocusMember {
  /** What the observation cited. Historical; never rewritten by resolution. */
  anchor: FocusAnchor;
  state: FocusMemberState;
  /** Resolved against the CURRENT Work. Null when nothing can stand here. */
  focus: HeldFocus | null;
  /** 1-based position in the Work now, or null when the section is gone. */
  position: number | null;
  heading: string | null;
}

export interface FocusSet {
  /** Names the set from identity and closed vocabulary only — never prose. */
  label: string;
  members: FocusMember[];
  /** ⛔ null on arrival, always. U4. */
  activeIndex: number | null;
}

/** UTF-16 index of a code-point offset, or null when the body is shorter. */
export function utf16IndexOf(body: string, codePointOffset: number): number | null {
  if (codePointOffset < 0) return null;
  let cp = 0;
  let i = 0;
  while (cp < codePointOffset) {
    if (i >= body.length) return null;
    i += body.codePointAt(i)! > 0xffff ? 2 : 1;
    cp += 1;
  }
  return i;
}

export interface ResolveInput {
  anchors: readonly FocusAnchor[];
  /** The revision the reading froze. */
  originRevision: number;
  /** The revision the Work is kept at now, or null when unknown. */
  currentRevision: number | null;
  sections: readonly SectionRef[];
  bodyOf: BodyOf;
  label: string;
}

/**
 * The Focus Set a historical finding becomes against the Work as it is now.
 *
 * ⛔ ONE MEMBER PER DECLARED ANCHOR, in the order declared. No anchor is
 * dropped because it failed to resolve — a member that cannot stand is shown
 * as unable to stand. Dropping it would tell the writer MAIA cited fewer
 * places than it cited.
 */
export function resolveFocusSet(input: ResolveInput): FocusSet {
  const { anchors, originRevision, currentRevision, sections, bodyOf, label } = input;
  const byId = new Map(sections.map((s) => [s.id, s]));
  /* Unknown current revision cannot license a currency claim; it is not
     evidence of sameness, so it resolves to `unverified`, never to `current`. */
  const sameRevision = currentRevision !== null && currentRevision === originRevision;

  const members = anchors.map<FocusMember>((anchor) => {
    const section = byId.get(anchor.sectionId);
    if (!section) {
      return { anchor, state: 'gone', focus: null, position: null, heading: null };
    }
    const position = section.position + 1;
    const heading = section.heading;
    const body = bodyOf(anchor.sectionId) ?? '';

    if (anchor.kind === 'section') {
      /* A whole section is a whole section at any version: there are no offsets
         to have gone stale, so this is the one anchor kind a later revision
         cannot unsettle. */
      return {
        anchor, state: 'current', position, heading,
        focus: {
          scale: 'section', sectionIds: [anchor.sectionId],
          start: 0, end: body.length, capturedText: body,
        },
      };
    }

    const start = utf16IndexOf(body, anchor.range.start);
    const end = utf16IndexOf(body, anchor.range.end);
    if (start === null || end === null || end <= start) {
      return { anchor, state: 'stale', focus: null, position, heading };
    }
    return {
      anchor,
      state: sameRevision ? 'current' : 'unverified',
      position, heading,
      /* ⭐ capturedText is the CURRENT slice, deliberately. HeldFocus validates
         itself by comparing coordinates to captured text; seeding it with text
         we do not have would release the focus on its first render. The claim
         that this IS what MAIA read is carried by `state`, not smuggled in
         here — which is exactly the separation this module exists to hold. */
      focus: {
        scale: start === 0 && end === body.length ? 'section' : 'selection',
        sectionIds: [anchor.sectionId], start, end,
        capturedText: body.slice(start, end),
      },
    };
  });

  return { label, members, activeIndex: null };
}

/** The writer chooses the edit target. Out-of-range and unusable members refuse. */
export function withActive(set: FocusSet, index: number | null): FocusSet {
  if (index === null) return { ...set, activeIndex: null };
  const m = set.members[index];
  if (!m || m.focus === null) return set;
  return { ...set, activeIndex: index };
}

/** The member the writer is working on, if they have said. */
export function activeMember(set: FocusSet): FocusMember | null {
  return set.activeIndex === null ? null : set.members[set.activeIndex] ?? null;
}

export const MEMBER_STATE_NOTE: Readonly<Record<FocusMemberState, string>> = {
  current: 'this is the text MAIA read',
  unverified: 'you have kept a version since this reading — these words may have changed',
  stale: 'this passage no longer fits the section; re-frame it yourself',
  gone: 'this section is no longer in the work',
};
