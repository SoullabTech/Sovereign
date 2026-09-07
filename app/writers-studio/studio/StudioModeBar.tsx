/**
 * WS2-03B — the five modes, at the head of the persistent shell.
 *
 * WRITE · DEVELOP · EXPLORE · REVIEW · PUBLISH is the shape of the Studio in
 * reference 04, and a Studio that shows only the mode you happen to be in is
 * not a Studio — it is a page. So all five are named.
 *
 * Four of them have no room. They are rendered as spans: no href, no handler,
 * `aria-disabled`, quiet ink, and no hover treatment. Nothing about them can
 * be pressed, and nothing about them says "soon" either — a roadmap badge
 * would be the same promise in smaller type. What the member reads is the
 * shape of the Studio and where they are standing in it.
 *
 * The active mode carries the gold underline 04 gives it. Gold is permitted
 * here (GOLD_PERMITTED covers the active nav item) and is deliberately NOT
 * spent on the unavailable four: gold in this room means "live", and lending
 * it to an empty room would be the visual form of the same lie.
 */
'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { GOLD, GROUND, INK, RADIUS, SPACE } from '../studioTheme';
import { STUDIO_MODES, type StudioMode } from '../studioMap';
import { StudioText, typeStyle } from './StudioType';
import { canvasForManuscript } from '../canvasIdentity';

export interface StudioModeBarProps {
  /** The mode this room IS. */
  current: string;
  style?: CSSProperties;
  /** The Work on the table. A mode switch may never lose or guess it. */
  manuscriptId?: string | null;
}

export function StudioModeBar({ current, manuscriptId = null, style }: StudioModeBarProps) {
  return (
    <nav aria-label="Studio modes" style={{ display: 'flex', gap: SPACE.tight, ...style }}>
      {STUDIO_MODES.map((m) => (
        <StudioModeItem key={m.id} mode={m} active={m.id === current} manuscriptId={manuscriptId} />
      ))}
    </nav>
  );
}

/**
 * What an unpressable mode says about itself. Candidates under FR-C: a fact
 * about now, never a delivery promise — "Coming soon" is rejected.
 *
 * `needs-work` is not a failure and is not phrased as one. The capability
 * exists; there is simply nothing yet for it to act upon, and the sentence
 * names the member's next act rather than the system's limitation.
 */
const MODE_SAYS = {
  unavailable: 'Not available yet',
  'needs-work': 'Open a work first',
} as const;

/**
 * FOUR STATES, and all four now legible. When the bar was written, Write was the only room and
 * the writer was already standing in it, so no mode ever had to carry anyone
 * anywhere and every mode was a span. BUILD-07D built the Develop room, so an
 * available mode must now actually go there — and go there holding the same
 * Work, because a mode that arrives without one lands in a room that can only
 * say it needs one.
 *
 *   active        you are here
 *   rest          built, and there is a Work to take into it   → a link
 *   needs-work    built, but nothing is on the table yet       → unpressable
 *   unavailable   not built; promises nothing                  → unpressable
 *
 * `needs-work` is deliberately not folded into `unavailable`: "not built" and
 * "nothing to bring" are different facts, and a member is owed the difference.
 * The href is composed by canvasForManuscript, the single definition of how a
 * Work identity travels — see canvasIdentity.ts on why a link is not a binding.
 */
function StudioModeItem({
  mode, active, manuscriptId,
}: { mode: StudioMode; active: boolean; manuscriptId: string | null }) {
  const available = mode.availability === 'available';
  const navigable = available && !active && mode.href !== undefined && manuscriptId !== null;
  const state = active ? 'active' : !available ? 'unavailable' : manuscriptId === null ? 'needs-work' : 'rest';
  /* FR-C / F2 — THE DOCTRINE ABOVE, NOW ON THE SURFACE.
   *
   * This component has distinguished `needs-work` from `unavailable` since
   * BUILD-07D and said so only in `data-state`. On the screen the two were not
   * merely similar — `needs-work` and `rest` rendered IDENTICALLY: same ink,
   * same opacity, one a link and one a span. A writer with no Work on the
   * table pressed DEVELOP and received silence.
   *
   * Founder ruling, 2026-09-07, as a hard requirement:
   *
   *   A control that cannot perform its apparent action may not look
   *   actionable and then answer the writer with silence.
   *
   * So the fact the component already knew is now said, at rest, in words.
   * ⛔ Not a tooltip: this is STATE, and state may never wait to be requested
   * (FR-D, HELP ≠ STATE).
   */
  const says =
    state === 'unavailable'
      ? MODE_SAYS.unavailable
      : state === 'needs-work'
        ? MODE_SAYS['needs-work']
        : null;
  const body = (
    <span
      data-mode={mode.id}
      data-state={state}
      {...(available ? {} : { 'aria-disabled': true })}
      style={{
        ...typeStyle('navItem'),
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: `${SPACE.tight}px ${SPACE.base}px`,
        borderRadius: RADIUS.pill,
        /* The bar may scroll at compact width; a label may not be broken
           across lines or squeezed to fit, which is how a mode becomes
           unreadable rather than merely off-screen. */
        whiteSpace: 'nowrap',
        flexShrink: 0,
        /* `needs-work` no longer borrows `rest`'s treatment. A mode that
           cannot be entered reads as quiet whether the reason is "not built"
           or "nothing to bring" — the reason itself is carried in words
           below, which is where a reason belongs. */
        color: active ? INK.primary : says ? INK.quiet : available ? INK.secondary : INK.quiet,
        opacity: says ? 0.6 : 1,
        ...(active
          ? { background: GROUND.active, boxShadow: `inset 0 -2px 0 ${GOLD.DEFAULT}` }
          : {}),
      }}
    >
      {mode.label}
    </span>
  );
  if (!navigable) {
    /* The mode and its reason are one block, so the sentence cannot be read as
       belonging to a neighbouring mode. `title` is a convenience for pointer
       users only — the sentence is already visible to everyone, on every
       input, which is what makes this compliant with FR-D's cross-input rule
       rather than dependent on hover. */
    if (!says) return body;
    return (
      <span
        data-mode-block={mode.id}
        style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        {body}
        <StudioText
          role="metadata"
          as="span"
          tone="quiet"
          data-mode-says={state}
          style={{
            paddingLeft: SPACE.base,
            paddingRight: SPACE.base,
            marginTop: -2,
            whiteSpace: 'nowrap',
          }}
        >
          {says}
        </StudioText>
      </span>
    );
  }
  return (
    <Link href={canvasForManuscript(mode.href!, manuscriptId)} style={{ textDecoration: 'none' }}>
      {body}
    </Link>
  );
}
