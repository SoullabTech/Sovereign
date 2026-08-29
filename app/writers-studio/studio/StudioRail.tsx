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
import {
  GROUND,
  GOLD,
  INK,
  RADIUS,
  RULE,
  SPACE,
  type StudioState,
} from '../studioTheme';
import {
  visibleDestinations,
  type StudioDestination,
  type StudioGroup,
  type StudioRegion,
} from '../studioMap';
import { StudioText } from './StudioType';

/**
 * The band headings the chrome carries. D-019's rail is banded by REGION —
 * that is what gives MAIA her own band rather than filing her as one owner
 * among seven — so the heading comes from the region, not from whatever a
 * group happened to be called.
 */
export const REGION_LABEL: Record<StudioRegion, string> = {
  work: 'Work space',
  maia: 'MAIA',
  tools: 'Tools',
};

export interface StudioRailItemProps {
  destination: StudioDestination;
  state?: Extract<StudioState, 'rest' | 'hover' | 'focus' | 'active' | 'selected' | 'quiet'>;
  /**
   * Renders a span with no href instead of a link. For the non-member-facing
   * composition fixture, which draws the full canonical grammar so it can be
   * compared against 04 — inert, so nothing unbuilt is ever clickable.
   */
  inert?: boolean;
}

export function StudioRailItem({ destination, state = 'rest', inert }: StudioRailItemProps) {
  const onRow = state === 'active' || state === 'selected';
  const Tag = inert ? 'span' : 'a';
  return (
    <Tag
      {...(inert ? {} : { href: destination.href })}
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
    </Tag>
  );
}

export function StudioBand({ group, inert }: { group: StudioGroup; inert?: boolean }) {
  return (
    <nav data-region={group.region} style={{ marginBottom: SPACE.roomy }}>
      <StudioText role="bandLabel" style={{ padding: `0 ${SPACE.base}px`, marginBottom: SPACE.snug }}>
        {REGION_LABEL[group.region]}
      </StudioText>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
        {group.destinations.map((d) => (
          <StudioRailItem key={d.id} destination={d} inert={inert} />
        ))}
      </div>
    </nav>
  );
}

export interface StudioRailProps {
  hasManuscript: boolean;
  style?: CSSProperties;
}

/** Shared chrome. Both projections draw the same rail; they differ in what
 *  they are handed and whether it is clickable. */
export function StudioRailChrome({
  groups,
  inert,
  style,
}: {
  groups: StudioGroup[];
  inert?: boolean;
  style?: CSSProperties;
}) {
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
        <StudioBand key={g.id} group={g} inert={inert} />
      ))}
    </aside>
  );
}

/**
 * THE MEMBER-FACING PROJECTION.
 *
 * Draws through visibleDestinations, which is the only supported way in: it
 * drops `later` destinations at the boundary, so an unbuilt room cannot reach
 * a member through this component even if a caller hands it the whole map.
 *
 * The other projection — the full canonical grammar, inert — lives in
 * __fixtures__ and is exported by no route. Two projections of one grammar:
 * the fixture can be compared against 04, the runtime stays honest.
 */
export function StudioRail({ hasManuscript, style }: StudioRailProps) {
  return <StudioRailChrome groups={visibleDestinations(hasManuscript)} style={style} />;
}
