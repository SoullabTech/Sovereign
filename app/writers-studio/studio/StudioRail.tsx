/**
 * WS2-02B — the WORK SPACE / MAIA / TOOLS rail.
 *
 * Consumes the settled grammar through `visibleDestinations`, which is the
 * only supported way in: it drops `later` destinations at the boundary, so an
 * unbuilt room cannot reach a member through this component even if a caller
 * hands it the whole map. That is the ratified render-boundary rule, held in
 * the one place navigation is drawn.
 *
 * The rail renders bands, not ownership. A destination sitting under MAIA is
 * chrome placement and says nothing about the object model (D-019).
 */
'use client';

import type { CSSProperties } from 'react';
import { GROUND, GOLD, INK, RADIUS, RULE, SPACE, type StudioState } from '../studioTheme';
import { visibleDestinations, type StudioDestination, type StudioGroup } from '../studioMap';
import { StudioText } from './StudioType';

export interface StudioRailItemProps {
  destination: StudioDestination;
  state?: Extract<StudioState, 'rest' | 'hover' | 'focus' | 'active' | 'selected' | 'quiet'>;
}

export function StudioRailItem({ destination, state = 'rest' }: StudioRailItemProps) {
  const onRow = state === 'active' || state === 'selected';
  return (
    <a
      href={destination.href}
      data-destination={destination.id}
      data-state={state}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE.snug,
        padding: `${SPACE.snug}px ${SPACE.base}px`,
        borderRadius: RADIUS.base,
        textDecoration: 'none',
        background: onRow ? GROUND.active : 'transparent',
        ...(state === 'selected' ? { boxShadow: `inset 2px 0 0 ${GOLD.DEFAULT}` } : {}),
      }}
    >
      <StudioText
        role="navItem"
        as="span"
        tone={onRow ? 'primary' : state === 'quiet' ? 'quiet' : 'secondary'}
      >
        {destination.label}
      </StudioText>
    </a>
  );
}

export function StudioBand({ group }: { group: StudioGroup }) {
  return (
    <nav data-region={group.region} style={{ marginBottom: SPACE.roomy }}>
      {group.label && (
        <StudioText role="bandLabel" style={{ padding: `0 ${SPACE.base}px`, marginBottom: SPACE.snug }}>
          {group.label}
        </StudioText>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
        {group.destinations.map((d) => (
          <StudioRailItem key={d.id} destination={d} />
        ))}
      </div>
    </nav>
  );
}

export interface StudioRailProps {
  hasManuscript: boolean;
  style?: CSSProperties;
}

export function StudioRail({ hasManuscript, style }: StudioRailProps) {
  // visibleDestinations, never STUDIO_MAP directly — see the note above.
  const groups = visibleDestinations(hasManuscript);
  return (
    <aside
      style={{
        background: GROUND.raised,
        borderRight: `1px solid ${RULE.soft}`,
        padding: SPACE.comfortable,
        overflowY: 'auto',
        color: INK.secondary,
        ...style,
      }}
    >
      {groups.map((g) => (
        <StudioBand key={g.id} group={g} />
      ))}
    </aside>
  );
}
