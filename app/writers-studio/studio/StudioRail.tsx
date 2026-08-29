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

import type { CSSProperties, ReactNode } from 'react';
import {
  GROUND,
  GOLD,
  INK,
  RADIUS,
  RAIL_RHYTHM,
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
import { StudioIcon } from './StudioIcon';

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
        gap: SPACE.snug + 2,
        /* Height comes from the MEASURED pitch rather than accumulating out of
           padding at each call site — pitch is what the eye reads as density,
           and the first composition drifted to ~37px against 04's 32px. */
        height: RAIL_RHYTHM.itemPitch - 2,
        padding: `0 ${SPACE.base}px`,
        borderRadius: RADIUS.base,
        textDecoration: 'none',
        color: onRow ? INK.primary : state === 'quiet' ? INK.quiet : INK.secondary,
        background: onRow ? GROUND.active : 'transparent',
        ...(onRow ? { boxShadow: `inset 2px 0 0 ${GOLD.DEFAULT}` } : {}),
      }}
    >
      <StudioIcon id={destination.id} />
      <StudioText
        role="navItem"
        as="span"
        tone={onRow ? 'primary' : state === 'quiet' ? 'quiet' : 'secondary'}
      >
        {destination.label}
      </StudioText>
      {/* 04 right-aligns a count on Materials (24) and Notes (12). A count is
          a fact about the member's own material, never a rating. */}
      {typeof destination.count === 'number' && (
        <>
          <span style={{ flex: 1 }} />
          <StudioText role="metadata" as="span">
            {destination.count}
          </StudioText>
        </>
      )}
    </Tag>
  );
}

export function StudioBand({ group, inert }: { group: StudioGroup; inert?: boolean }) {
  return (
    <nav
      data-region={group.region}
      /* The measured band gap runs from the last item to the NEXT band's
         label, so the margin is that distance less the half-item and label box
         already inside it. Calibrated by re-measuring the render rather than
         by eye: margin 18 gave a 40px gap and margin 44 gave 66, so the
         relation is gap = margin + 22 and 04's ~51 wants 29. */
      style={{ marginBottom: RAIL_RHYTHM.bandGap - RAIL_RHYTHM.itemPitch / 2 - 3 }}
    >
      <StudioText
        role="bandLabel"
        style={{
          padding: `0 ${SPACE.base}px`,
          marginBottom: RAIL_RHYTHM.labelToFirstItem - RAIL_RHYTHM.itemPitch / 2 - 6,
        }}
      >
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
  lead,
}: {
  groups: StudioGroup[];
  inert?: boolean;
  style?: CSSProperties;
  /** Rendered above the first band. 04 puts "+ New Work" here. */
  lead?: ReactNode;
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
      {lead}
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
