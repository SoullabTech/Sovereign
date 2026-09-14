/**
 * EW-F2 · STEP 2 — THE PROPOSAL WORKING SURFACE.
 *
 * ⭐⭐ THE LAW THIS FILE IS, in the founder's words:
 *
 *   The Work is the comparison surface. The proposal is rendered into it
 *   without yet becoming it.
 *
 * ── THE TWO SHAPES THAT FAILED, BOTH RECORDED ─────────────────────────────
 *
 * EW-F1 shipped a DETACHED EXCERPT: a 140-code-point window, cut mid-word, in
 * a narrow gutter, with no manuscript around it. The founder could not tell
 * what he was authorizing.
 *
 * Step 2's first build over-corrected into DUPLICATE FULL SECTIONS: CURRENT,
 * then PROPOSED, each 1334 characters, with the changed passage a thousand
 * characters down in both. "That is better yet I still don't know what was
 * changed." Comparing meant scrolling the section twice.
 *
 * ⛔ NEITHER SHOWS THE CHANGE, and the failure is not too little context versus
 * too much. It is that BOTH MAKE THE WRITER PERFORM THE COMPARISON. That is not
 * informed consent; it is visual diff work outsourced to the person whose
 * consent is being asked for.
 *
 * ── WHAT THIS RENDERS ─────────────────────────────────────────────────────
 *
 * The section body ONCE, in normal reading flow, with the proposed change
 * embedded at the exact locus. Retained text and text proposed to leave are
 * visibly distinguished. The locus is brought into view when the proposal
 * opens, so "what changes?" is answerable at a glance and the surrounding
 * prose is still there to read.
 *
 * ⛔ AND THE AUTHORITIES STAY SEPARATE. What is drawn here is PROPOSAL STATE,
 * never manuscript state. The body is read-only reference; the treatment is a
 * staged visualization; only ACCEPT crosses into the Work. That distinction
 * carries the weight at step 3, when the proposed wording becomes editable.
 *
 * ⛔ NO MIRROR. S-05: the overlay exists only because text inside a textarea
 * cannot be styled. There is no textarea here, so the mark is real spans in
 * real prose.
 *
 * ⛔ NO CONTROLS. Keep unchanged and ACCEPT CHANGES live in the panel, which
 * owns the decision. Duplicating them here would put the irreversible act in
 * two places.
 */
'use client';

import { useEffect, useRef } from 'react';
import { codePointBoundaries } from '@/lib/manuscript/draftSections';
import { revealWithin } from './revealWithin';
import type { SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';

export interface ProposalWorkSurfaceProps {
  /**
   * ⭐ Incremented by the room when the writer asks to be returned to the
   * change. A NONCE, not a flag: a boolean could not express "again".
   */
  revealToken: number;
  /** The section body, exactly as the Work holds it. */
  body: string;
  /** ⛔ Must be `projected_section_body`. */
  range: SpacedRange;
  /** Staged authored content. Empty string for a deletion. */
  replacementText: string;
  sectionLabel: string;
}

/**
 * Code points → code units, once, explicitly.
 *
 * ⛔ `range` is `projected_section_body` CODE POINTS; `String.slice` indexes
 * CODE UNITS. Unconverted this is FOCUS-W3 again — wrong only where the writer
 * used an astral character, the worst possible failure distribution.
 */
function units(body: string, range: SpacedRange): { a: number; b: number } {
  const bounds = codePointBoundaries(body);
  const last = bounds.length - 1;
  const a = bounds[Math.max(0, Math.min(range.start, last))];
  const b = bounds[Math.max(0, Math.min(range.end, last))];
  return { a, b: Math.max(a, b) };
}

const PROSE = {
  whiteSpace: 'pre-wrap' as const,
  overflowWrap: 'break-word' as const,
  font: 'inherit',
  lineHeight: 1.7,
  margin: 0,
};

/** Text proposed to leave. Struck AND tinted: strike alone reads as emphasis. */
const REMOVED = {
  textDecoration: 'line-through',
  textDecorationThickness: '1px',
  opacity: 0.75,
  background: 'rgba(190, 80, 70, 0.18)',
  borderRadius: 2,
};

/** Text proposed to arrive. Present for replacement and insertion. */
const ADDED = {
  background: 'rgba(120, 160, 110, 0.22)',
  borderRadius: 2,
};

/**
 * ⭐ THE BRACKETS · THE CHANGE HAS EDGES, AND THEY ARE VISIBLE.
 *
 * Founder-asked after seeing the marked prose: brackets around the changed area
 * "to make it a truly direct interaction". A tint and a strike say THAT
 * something changed; brackets say exactly WHERE it starts and stops. At a short
 * mid-sentence span — 23 characters inside 1334 — that boundary is the whole
 * question, and a strikethrough alone leaves the writer inferring it from
 * where the line crosses the glyphs.
 *
 * ⛔ NOT INTERACTIVE IN STEP 2. They mark the edges of an authored range that
 * the writer cannot yet move; making them draggable would be an authoring
 * gesture, and authoring arrives at step 3 with the succession substrate that
 * can record who moved what. Drawn here so the boundary is legible now.
 */
const BRACKET = {
  opacity: 0.55,
  fontWeight: 600,
  /* ⛔ Never struck. The bracket is the system speaking about the change; the
     struck text is the writer's prose. Striking the bracket would read as the
     bracket itself being removed. */
  textDecoration: 'none',
};

/**
 * The proposed change at its locus: what leaves, what arrives, and where it
 * begins and ends. One definition, so Section view and Whole view cannot drift
 * into two different visual languages for the same fact.
 */
function Locus(
  { leaving, arriving, innerRef }: {
    leaving: string;
    arriving: string;
    innerRef?: React.Ref<HTMLSpanElement>;
  },
) {
  return (
    <span ref={innerRef}>
      <span style={BRACKET}>[</span>
      {leaving ? <span style={REMOVED}>{leaving}</span> : null}
      {arriving ? <span style={ADDED}>{arriving}</span> : null}
      <span style={BRACKET}>]</span>
    </span>
  );
}

/**
 * ⭐ PW-16 · THE LOCUS COMES INTO VIEW, ONCE.
 *
 * Orientation authority, not manuscript authority — the same distinction the
 * proposal jump makes. ONCE, keyed on the locus, so a writer who then reads
 * elsewhere in the section is not dragged back: being moved around your own
 * manuscript is its own kind of dispossession.
 *
 * ⛔ THROUGH `revealWithin`, NEVER `scrollIntoView`. The first build used the
 * DOM call and broke a ban this room already carries: `scrollIntoView` scrolls
 * EVERY scrollable ancestor, the document included, and founder-witnessed on
 * 2026-09-11 that threw the Studio header and the left rail off the top of the
 * screen. `revealWithin` moves the nearest scroller and nothing else.
 *
 * ⚠️ And my own PW-16 obligation asserted `scrollIntoView` BY NAME, so it
 * pinned the violation rather than the property. The property is that opening a
 * proposal reveals the locus without moving the room around it.
 */
function useBringIntoView(key: string, revealToken: number) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const done = useRef<string | null>(null);
  const seenToken = useRef(revealToken);

  /**
   * AUTOMATIC ARRIVAL · once per locus.
   *
   * ⚠️ WHAT THIS GUARD ACTUALLY DOES, established by mutation rather than
   * assumed. Removing `done.current` alone changes nothing: the dependency
   * array already stops the effect re-running on an ordinary render, so a
   * first mutation of it was a NO-OP and passed green. The guard becomes
   * load-bearing only when the effect runs for some OTHER reason — React's
   * development double-invoke, or a dependency that recomputes to the same
   * locus — and the falsifier that proves it must remove the dependency array
   * as well (M32b). Recorded because a guard whose necessity has not been
   * demonstrated is decoration, and this one is not.
   */
  useEffect(() => {
    if (done.current === key || !ref.current) return;
    done.current = key;
    revealWithin(ref.current, 'center', 'smooth');
  }, [key]);

  /**
   * ⭐⭐ VOLUNTARY RETURN · every time the writer asks.
   *
   * FOUNDER-CAUGHT. The one-shot guard is correct for arrival and WRONG for
   * `Show change`: once the automatic reveal was spent, the writer could scroll
   * away and the control that exists to bring them back did nothing. Two
   * different acts were sharing one guard.
   *
   * ⛔ THE GUARD IS NOT WEAKENED — the two acts are separated. The automatic
   * effect keeps its key and still fires once, so an ordinary re-render never
   * drags a writer who has chosen to read elsewhere. This effect fires only on
   * a token the room increments when the writer presses the control, and never
   * on mount, where the automatic reveal already owns the arrival.
   */
  useEffect(() => {
    if (revealToken === seenToken.current) return;
    seenToken.current = revealToken;
    if (ref.current) revealWithin(ref.current, 'center', 'smooth');
  }, [revealToken]);

  return ref;
}

export default function ProposalWorkSurface(
  { body, range, replacementText, sectionLabel, revealToken }: ProposalWorkSurfaceProps,
) {
  /* ⛔ A surface that cannot state the space it was handed refuses to draw.
     There is no default coordinate space anywhere in this system. */
  const ok = range.space === 'projected_section_body';
  const { a, b } = units(body, ok ? range : { ...range, start: 0, end: 0 });
  const locus = useBringIntoView(`${sectionLabel}:${a}:${b}`, revealToken);
  if (!ok) return null;

  return (
    <section
      aria-label={`Proposed change · ${sectionLabel}`}
      style={{
        padding: SPACE.base,
        borderRadius: RADIUS.sm,
        background: GROUND.raised,
        border: `1px solid ${RULE.soft}`,
      }}
    >
      {/* ⭐ PW-14/PW-19 · THE BODY, ONCE, IN NORMAL READING FLOW. The prose
          above and below the change stays exactly where the writer expects it;
          there is no second copy of the section to compare against and no
          excerpt detached from it. */}
      <div style={{ ...PROSE, color: INK.primary }}>
        {body.slice(0, a)}
        {/* ⭐ PW-15/PW-17 · AT THE EXACT LOCUS, and retained text is visibly
            distinguished from text proposed to leave. */}
        <Locus
          innerRef={locus}
          leaving={body.slice(a, b)}
          arriving={replacementText}
        />
        {body.slice(b)}
      </div>

      {/* ⛔ THE COMPARISON LIVES IN THE PANEL, NOT HERE. Founder's layout:
          the Work renders the full section once with the locus marked; the
          panel shows only the affected sentence, current and as it would read.
          A "would read" block here would put a second rendering of the prose
          in the surface whose whole obligation is to render it once. */}
      {/* ⭐ PW-5 · AND IT SAYS WHAT IS TRUE. "Cannot be edited" would be the one
          sentence most likely to mislead here: the writer IS working — on the
          proposal, not on the manuscript. */}
      <StudioText role="metadata" style={{ marginTop: SPACE.base }}>
        You’re working with a proposed change. This wording is not in your
        manuscript yet, and nothing is written until you accept.
      </StudioText>
    </section>
  );
}

/**
 * ⭐⭐ WHOLE VIEW · TRUTHFUL EVIDENCE, NOT A SECOND EDITING AUTHORITY.
 *
 * FOUNDER RULING, after the runtime witness found step 2's regression:
 *
 *   Authority may differ by mode. Truth about that authority may not.
 *
 * "Do not force a mode change" never meant "evidence only exists in one mode".
 * Scoping the proposal to Section view left Whole view rendering the target as
 * bare prose — which ALSO silently retired the EW-F1 mark Whole had drawn since
 * that lane closed, because the overlay lives only in the editable branch. Two
 * cross-view obligations broke at once: EW-F1 (the writer can locate the
 * proposed change in the Work) and PW-5 (a suspended write authority says why).
 *
 * ⛔ PW-13 · NOT THE WORKING SURFACE. No accept, no staged text, no controls.
 * Whole view states what is true and offers a door; Section view is where the
 * work happens, and the door is taken only when the member asks — PW-11.
 */
export function ProposalEvidenceInWork(
  { body, range, replacementText, onWorkWithChange }: {
    body: string;
    range: SpacedRange;
    replacementText: string;
    onWorkWithChange?: () => void;
  },
) {
  if (range.space !== 'projected_section_body') return null;
  const { a, b } = units(body, range);

  return (
    <div>
      {/* ⭐ PW-9/PW-12 · THE EXACT RANGE, LOCATED IN THE WORK — not "this
          section has a proposal". For a replacement the proposed text is marked
          beside the removal, so the proposed STATE is legible here too. */}
      <div style={{ ...PROSE, color: INK.primary }}>
        {body.slice(0, a)}
        <Locus leaving={body.slice(a, b)} arriving={replacementText} />
        {body.slice(b)}
      </div>

      <div style={{
        marginTop: SPACE.snug, display: 'flex',
        gap: SPACE.base, alignItems: 'baseline', flexWrap: 'wrap',
      }}>
        {/* ⭐ PW-8 · A section that quietly stops being writable, with nothing
            saying why, is the confusion PW-5 exists to prevent. */}
        <StudioText role="metadata">
          This section is being worked as a proposed change.
        </StudioText>
        {onWorkWithChange ? (
          <button
            type="button"
            onClick={onWorkWithChange}
            style={{
              background: 'transparent', border: 'none', padding: 0,
              cursor: 'pointer', font: 'inherit', color: 'inherit',
              textDecoration: 'underline', textUnderlineOffset: 4,
            }}
          >
            <StudioText role="metadata" as="span">Work with this change</StudioText>
          </button>
        ) : null}
      </div>
    </div>
  );
}
