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
import { GOLD, GROUND, INK, RADIUS, SPACE } from '../studioTheme';
import { STUDIO_MODES, type StudioMode } from '../studioMap';
import { typeStyle } from './StudioType';

export interface StudioModeBarProps {
  /** The mode this room IS. */
  current: string;
  style?: CSSProperties;
}

export function StudioModeBar({ current, style }: StudioModeBarProps) {
  return (
    <nav aria-label="Studio modes" style={{ display: 'flex', gap: SPACE.tight, ...style }}>
      {STUDIO_MODES.map((m) => (
        <StudioModeItem key={m.id} mode={m} active={m.id === current} />
      ))}
    </nav>
  );
}

function StudioModeItem({ mode, active }: { mode: StudioMode; active: boolean }) {
  const available = mode.availability === 'available';
  return (
    <span
      data-mode={mode.id}
      data-state={active ? 'active' : available ? 'rest' : 'unavailable'}
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
}
