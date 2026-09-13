/**
 * EW-F2 · STEP 2 — THE PROPOSAL WORKING SURFACE.
 *
 * ⭐⭐ WHY THIS IS NOT `FocusOverlay`.
 *
 * The overlay exists for ONE reason: text inside a `<textarea>` cannot be
 * styled, so a mark has to be painted as a transparent lockstep copy behind the
 * control. Every cost it carries — matching metrics exactly, `padding: 0` on
 * the editor, the code-point/code-unit boundary that cost this programme two
 * days at FOCUS-W3 — is a cost of that constraint.
 *
 * Proposal work mode REMOVES the constraint. Here the manuscript is read-only
 * reference, there is no textarea to mirror, and the marked text can simply be
 * real spans in real prose. The census said this plainly and the founder ruled
 * it: reuse the visual language, not the workaround.
 *
 * ⛔ PW-6 · NO TEXTAREA AND NO MIRROR IN THIS FILE.
 * ⛔ PW-1 · Mounting this is how the manuscript-writing control is absent. It
 *    is not disabled, not read-only-attributed, not styled differently — the
 *    room mounts this INSTEAD, because the persistence authority is different.
 * ⛔ PW-4 · Nothing here writes. There is no save, no queue, no fetch.
 *
 * ── WHAT IS SHOWN, AND WHERE IT COMES FROM ────────────────────────────────
 *
 * CURRENT is the Work's own text, unmodified, with the proposal's range marked.
 * PROPOSED is that same text with the range replaced by the staged content.
 * Both are DERIVED here from one string — the body the Work already holds —
 * so the two panels cannot disagree with the manuscript or with each other.
 * No prose travels from the server for this; a second copy would be a second
 * thing that can be stale, which is the whole EW-F1 finding.
 *
 * ⛔ `range` is `projected_section_body` CODE POINTS. `String.slice` indexes
 * CODE UNITS. The conversion is explicit and is the only arithmetic in the
 * file — unconverted, this is FOCUS-W3 again, wrong only where the writer used
 * an astral character, which is the worst possible failure distribution.
 *
 * STEP 2 SCOPE. Read-only. The staged text is not editable here and there is no
 * Revise control: those are steps 3 and 5, and building them early would put an
 * authoring surface in front of a succession substrate that does not exist yet.
 */
'use client';

import { codePointBoundaries } from '@/lib/manuscript/draftSections';
import type { SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';

export interface ProposalWorkSurfaceProps {
  /** The section body, exactly as the Work holds it. */
  body: string;
  /** ⛔ Must be `projected_section_body`. */
  range: SpacedRange;
  /** Staged authored content. Empty string for a deletion. */
  replacementText: string;
  sectionLabel: string;
}

/** Code points → code units, once, explicitly. */
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

const REMOVED = {
  textDecoration: 'line-through',
  textDecorationThickness: '1px',
  opacity: 0.75,
  background: 'rgba(190, 80, 70, 0.18)',
  borderRadius: 2,
};

const ADDED = {
  background: 'rgba(120, 160, 110, 0.22)',
  borderRadius: 2,
};

function Panel(
  { label, children }: { label: string; children: React.ReactNode },
) {
  return (
    <div style={{ marginBottom: SPACE.base }}>
      <StudioText role="metadata" style={{ marginBottom: SPACE.snug, letterSpacing: '0.08em' }}>
        {label}
      </StudioText>
      <div style={{ ...PROSE, color: INK.primary }}>{children}</div>
    </div>
  );
}

export default function ProposalWorkSurface(
  { body, range, replacementText, sectionLabel }: ProposalWorkSurfaceProps,
) {
  /* ⛔ A surface that cannot state the space it was handed refuses to draw.
     There is no default coordinate space anywhere in this system. */
  if (range.space !== 'projected_section_body') return null;

  const { a, b } = units(body, range);
  const before = body.slice(0, a);
  const marked = body.slice(a, b);
  const after = body.slice(b);

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
      {/* ⭐ PW-5 · THE REASON IS SAID, not left to be inferred from the absence
          of a text box. "Cannot be edited" would be the one sentence most
          likely to mislead here: the writer IS working — on the proposal. */}
      <StudioText role="metadata" style={{ marginBottom: SPACE.base }}>
        You are working a proposed change here. This section of the manuscript
        is read-only while you do. Nothing is written until you accept.
      </StudioText>

      <Panel label="CURRENT">
        {before}
        <span style={REMOVED}>{marked}</span>
        {after}
      </Panel>

      <Panel label="PROPOSED">
        {before}
        {replacementText ? <span style={ADDED}>{replacementText}</span> : null}
        {after}
      </Panel>
    </section>
  );
}
