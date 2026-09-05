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
import { typeStyle } from './StudioType';
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
 * THREE STATES, not two. When the bar was written, Write was the only room and
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
        color: active ? INK.primary : available ? INK.secondary : INK.quiet,
        opacity: available ? 1 : 0.5,
        ...(active
          ? { background: GROUND.active, boxShadow: `inset 0 -2px 0 ${GOLD.DEFAULT}` }
          : {}),
      }}
    >
      {mode.label}
    </span>
  );
  if (!navigable) return body;
  return (
    <Link href={canvasForManuscript(mode.href!, manuscriptId)} style={{ textDecoration: 'none' }}>
      {body}
    </Link>
  );
}
