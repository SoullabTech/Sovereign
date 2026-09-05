'use client';

/**
 * THE WRITER'S STUDIO SHELL — what does not disappear when the mode changes.
 *
 * The Studio is one environment the writer stands in, and a mode is a stance
 * they take toward the Work inside it. So the wordmark, the Work's own name,
 * the mode bar, the rail and the lower band belong to the Studio, not to any
 * one mode; only the interior changes when the writer moves between them.
 *
 * BUILD-07D's Develop room was built while the product's presentation had
 * moved on, so it arrived as a page of its own with its own chrome and a link
 * back out. Sharing a masthead would not have fixed that — two generations
 * stitched together still read as two products. One shell implementation, two
 * interiors, is the difference.
 *
 *     <WriterStudioShell currentMode="write"  …><WriteInterior /></…>
 *     <WriterStudioShell currentMode="develop" …><DevelopInterior /></…>
 *
 * and, when their rooms exist, Explore, Review and Publish take the same seat.
 *
 * SAME ENVIRONMENT, NOT SAME LAYOUT. The shell deliberately does not impose an
 * interior composition. Write's columns are Write's; a reading is not a draft
 * and should not be forced into the shape of one. What the shell guarantees is
 * that the writer never falls out of the Studio to look at their Work.
 *
 * The rail and the lower band are passed in rather than assembled here because
 * each mode knows which of its own destinations are truthful right now — and a
 * rail that promises what a mode cannot do is the failure WS2-03B refuses.
 */

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { BREAKPOINT, GROUND, INK, RULE, SPACE } from '../studioTheme';
import { StudioText } from './StudioType';
import { StudioModeBar } from './StudioModeBar';
import { StudioScrollbars } from './StudioScrollbars';

/** One definition of the collapse point, so the modes cannot disagree on it. */
export function useCompactStudio(): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT.compact - 1}px)`);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return compact;
}

export interface WriterStudioShellProps {
  /** The Work on the table. Carried into every mode the bar can reach. */
  manuscriptId: string | null;
  /** Which stance the writer is currently taking. */
  currentMode: string;
  /** The Work's own name, in the member's words where they have given one. */
  workName: string;
  /** False when the name is a stand-in rather than the member's own. */
  workNamed?: boolean;
  /** The member's statement about this Work, only where they made one. */
  workNote?: ReactNode;
  /** Mode-specific header controls, e.g. Write's MAIA toggle and word count. */
  headerRight?: ReactNode;
  /** The Studio rail, composed by the mode from its own truthful destinations. */
  rail?: ReactNode;
  /** The lower band, when the mode has one and it is truthful for this Work. */
  lowerBand?: ReactNode;
  /** Gap and padding of the body frame; the mode's own layout arithmetic. */
  bodyGutter?: string;
  /** Callers that already compute it pass it, so one value governs the page. */
  compact?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function WriterStudioShell({
  manuscriptId, currentMode, workName, workNamed = true, workNote,
  headerRight, rail, lowerBand, bodyGutter, compact: compactProp, children, style,
}: WriterStudioShellProps) {
  const derived = useCompactStudio();
  const compact = compactProp ?? derived;
  const gutter = bodyGutter ?? `${SPACE.roomy}px`;

  return (
    <div
      data-room="writers-studio"
      data-mode={currentMode}
      style={{
        display: 'flex', flexDirection: 'column', height: '100vh',
        background: GROUND.base, color: INK.primary, overflow: 'hidden', ...style,
      }}
    >
      {/* Scoped to data-room above. See StudioScrollbars. */}
      <StudioScrollbars />

      {/* ══ HEAD OF THE STUDIO — identical in every mode ═════════════════ */}
      <header
        data-studio-header
        style={{
          display: 'flex', alignItems: 'center', gap: SPACE.roomy,
          /* At compact width the bar takes a line of its own rather than
             leaving. See the mode bar below. */
          flexWrap: compact ? 'wrap' : 'nowrap',
          padding: `${SPACE.base}px ${SPACE.roomy}px`,
          borderBottom: `1px solid ${RULE.soft}`,
          background: GROUND.raised, flexShrink: 0,
        }}
      >
        <Link href="/writers-studio" style={{ textDecoration: 'none' }}>
          <StudioText role="bandLabel" tone="muted">
            Soullab · Writer’s Studio
          </StudioText>
        </Link>
        <div style={{ minWidth: 0 }}>
          <StudioText role="workIdentity" style={{ opacity: workNamed ? 1 : 0.7 }}>
            {workName}
          </StudioText>
          {workNote ? <StudioText role="quiet">{workNote}</StudioText> : null}
        </div>
        {/* THE MODE BAR IS NOT OPTIONAL AT ANY WIDTH.

            It was previously dropped when the header got narrow, on the
            reading that five labels would not fit. What that actually cost is
            not decoration: DEVELOP is a mode, not a rail destination — the
            rail has no `develop` entry, by design — so removing the bar left a
            writer on a phone with no door from WRITE to DEVELOP at all. The
            founder walk of 2026-09-05 could not be performed at that width.

            So at compact the bar wraps onto its own line (`order` puts it
            after the identity row, `flexBasis` claims the full width) and
            scrolls horizontally if the labels outrun the viewport. A label
            that must be scrolled to is still reachable; a bar that is not
            rendered is not. */}
        <StudioModeBar
          current={currentMode}
          manuscriptId={manuscriptId}
          style={
            compact
              ? { order: 1, flexBasis: '100%', marginLeft: 0, overflowX: 'auto' }
              : { marginLeft: SPACE.roomy }
          }
        />
        <span style={{ flex: 1 }} />
        {headerRight}
      </header>

      {/* ══ BODY — the rail persists; the interior is the mode's own ═════ */}
      <div
        style={{
          display: 'flex', flexDirection: compact ? 'column' : 'row',
          flex: 1, minHeight: 0,
          gap: compact ? `${SPACE.base}px` : gutter,
          padding: compact ? `${SPACE.base}px` : gutter,
          overflow: compact ? 'auto' : 'hidden',
        }}
      >
        {rail}
        {children}
      </div>

      {lowerBand}
    </div>
  );
}
