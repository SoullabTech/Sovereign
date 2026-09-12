/**
 * THE FOCUS CURRENCY RESOLVER — server-only, and narrowly constituted.
 *
 * ⭐⭐ FOUNDER RULING 2026-09-12, Option 1:
 *
 *   Does this historical anchor still denote current Work? The SERVER answers,
 *   from the historical readState digest and the current Working Draft. The
 *   browser never receives the historical digest; MAIA never receives it; the
 *   URL never contains it; and no disclosure receipt is minted because currency
 *   was checked.
 *
 * ── ⛔ THE HOLE THIS CLOSES ────────────────────────────────────────────────
 *
 * The crossing used the CLIENT's `readable` boolean to decide which members got
 * boundaries and were read. `CurrentDraftReader` then proved those characters
 * EXIST — it could not prove they are still the passage that was focused. A
 * stale page could therefore cause the server to read current characters at
 * historical offsets and hand MAIA a passage the writer never framed.
 *
 * Same lesson as P13, applied one level up: *do not validate a field the client
 * has no authority to assert — remove the authority.*
 *
 * ── ⛔ WHY NOT A KEPT-REVISION COMPARISON ──────────────────────────────────
 *
 * Three different facts, three different clocks, and they must never be
 * compared as though they were one:
 *
 *   a KEPT REVISION   what historical state MAIA read
 *                     (working_draft_revisions.revision_number)
 *   a DRAFT VERSION   what current state exists
 *                     (manuscript_working_drafts.version)
 *   a DIGEST          whether a passage still occupies the same coordinates
 *
 * Equal revision numbers prove nothing about the live text: a writer can edit a
 * section fifty times without keeping a version. Only the digest answers this.
 *
 * ── TWO QUESTIONS ABOUT ONE DIGEST ────────────────────────────────────────
 *
 * `locateCurrent` (BUILD-07A) already compares this digest, and is deliberately
 * NOT reused for the verdict. It asks *is this observation still supported?* —
 * and a section whose text changed no longer supports the observation, for a
 * whole-section ref as much as a passage.
 *
 * Focus asks something else: *can I read this place now?* A section whose text
 * changed is still that place. So:
 *
 *   whole-section member   exists → READY, whatever the text now says.
 *                          The Focus means this section NOW.
 *   passage member         exists AND digest matches → READY
 *                          exists AND digest differs → NEEDS CONFIRMATION
 *
 * ⛔ A differing digest does NOT assert the passage changed — a sentence
 * elsewhere in the section may have. It asserts only that nothing now proves
 * those historical offsets still denote the same passage. Exactly `unverified`.
 *
 * ── ⭐ FAILURE TO ESTABLISH SAMENESS IS NOT EVIDENCE OF DIFFERENCE ─────────
 *
 * When the comparison cannot run, the answer is `not_yet_known`. Never `gone`,
 * and never `ready`.
 */

import { sha256 } from '@/lib/manuscript/development/readState';
import type { DevelopmentalReadState } from '@/lib/manuscript/development/readState';
import type { EditableSection } from '@/lib/manuscript/sections/saveSection';
import type { FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import { passageIsProjectable } from './focusPassage';

export type MemberCurrency =
  /** MAIA can be given this place. */
  | 'ready'
  /** The place exists; nothing proves the historical offsets still name it. */
  | 'needs_confirmation'
  /** The section is no longer in the Work. */
  | 'unavailable'
  /** ⛔ The comparison could not run. NOT an answer about the Work. */
  | 'not_yet_known';

export interface ResolvedMember {
  readonly focusMemberId: string;
  readonly sectionRef: string;
  readonly currency: MemberCurrency;
}

export interface FocusCurrency {
  readonly members: readonly ResolvedMember[];
  /**
   * ⭐ WHICH state of the Work these answers were true of.
   *
   * ⛔ NOT compared to the historical reading's revision — a different clock.
   * It says only: *these currency answers were true of Working Draft vN.* If
   * the draft advances, this resolution is stale and the surface must return to
   * "checking" rather than keep advertising 2 of 5 as current.
   */
  readonly resolvedAgainstDraftVersion: number | null;
}

export interface CurrencyInput {
  readonly anchors: readonly (FocusAnchor & { focusMemberId: string })[];
  /** The reading the anchors came from. Null when it could not be loaded. */
  readonly readState: DevelopmentalReadState | null;
  /**
   * The current sections, by id — the SAME snapshot the Ask will read bodies
   * from. ⭐ Not a second load: currency and disclosure must not be able to
   * disagree about what the Work says. Null means it could not be measured.
   */
  readonly sections: ReadonlyMap<string, EditableSection> | null;
  readonly draftVersion: number | null;
}

/**
 * ⭐ PURE. No database, no request, no clock. Every refusal this resolver makes
 * is decided here, so the law can be falsified without a Postgres and a defect
 * in it is a unit-test failure rather than a 500 a member discovers.
 */
export function resolveFocusCurrency(input: CurrencyInput): FocusCurrency {
  const { anchors, readState, sections, draftVersion } = input;

  /* ⛔ Nothing measurable → nothing claimed. `not_yet_known` for every member,
     and NO version: a resolution that names a version it did not inspect would
     be the false-currency claim in a new costume. */
  if (sections === null || readState === null || draftVersion === null) {
    return {
      members: anchors.map((a) => ({
        focusMemberId: a.focusMemberId, sectionRef: a.sectionId, currency: 'not_yet_known' as const,
      })),
      resolvedAgainstDraftVersion: null,
    };
  }

  return {
    resolvedAgainstDraftVersion: draftVersion,
    members: anchors.map((a) => ({
      focusMemberId: a.focusMemberId,
      sectionRef: a.sectionId,
      currency: currencyOf(a, readState, sections),
    })),
  };
}

function currencyOf(
  anchor: FocusAnchor,
  readState: DevelopmentalReadState,
  live: ReadonlyMap<string, EditableSection>,
): MemberCurrency {
  const section = live.get(anchor.sectionId);
  if (section === undefined) return 'unavailable';
  const text = section.storedText;

  /* ⭐ A WHOLE-SECTION MEMBER NEEDS NO DIGEST. It carries no historical
     character coordinates, so there is nothing for a text change to invalidate:
     the writer declared attention to THIS SECTION, and this section is here. */
  if (anchor.kind === 'section') return 'ready';

  const frozen = readState.sections[anchor.sectionId];
  /* ⛔ The reading holds no frozen state for this section, so the comparison
     cannot run. Not an answer about the Work — `not_yet_known`. */
  if (!frozen) return 'not_yet_known';

  /* ⭐⭐ THE DIGEST IS OVER THE STORED SECTION TEXT, not the projected body.
     `readState.ts` freezes `sha256(draft.sections[i].text)`, and
     `resolve.ts` compares `sha256(live.text)` against it. Hashing the body
     instead — the string the WRITER sees, with the heading prefix removed —
     would differ for every section that has a heading, and every passage member
     would read `needs_confirmation` forever. The algorithm and the
     representation are both reused, never recreated. */
  if (sha256(text) !== frozen.digest) return 'needs_confirmation';

  /**
   * ⭐⭐ READINESS IS TWO THINGS, AND THE WITNESS PROVED WHY.
   *
   *   CURRENCY         the historical anchor still corresponds to the current
   *                    section state — the digest above.
   *   PROJECTABILITY   those coordinates can be faithfully mapped into the body
   *                    MAIA will actually read.
   *
   * The preflight answered only the first and called §56 ready; the crossing
   * answered the second and refused it. `panel: 5 ready · actual: 4 read`.
   *
   * ⛔ SO THE SAME RESOLVER ANSWERS BOTH, HERE. If the Ask would reject this
   * passage on an unchanged snapshot, the preflight must not advertise it.
   *
   * ⛔ And an unprojectable passage is NOT `unavailable`: the section is plainly
   * still in the Work. It needs the writer's confirmation, which is exactly
   * what `needs_confirmation` means.
   */
  return passageIsProjectable({
    storedText: text, heading: section.heading, range: anchor.range,
  }) ? 'ready' : 'needs_confirmation';
}

/** Whether a resolution still describes the Work. ⛔ A stale one authorizes nothing. */
export function currencyStillDescribes(
  currency: FocusCurrency, draftVersion: number | null,
): boolean {
  return currency.resolvedAgainstDraftVersion !== null
    && draftVersion !== null
    && currency.resolvedAgainstDraftVersion === draftVersion;
}

/** ⭐ The ONLY currency that may be given a body. */
export const mayDisclose = (c: MemberCurrency): boolean => c === 'ready';
