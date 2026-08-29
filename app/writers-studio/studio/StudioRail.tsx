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
  shellDestinations,
  visibleDestinations,
  type ShellDestination,
  type ShellGroup,
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
  state?: Extract<
    StudioState,
    'rest' | 'hover' | 'focus' | 'active' | 'selected' | 'quiet' | 'unavailable'
  >;
  /**
   * Renders a span with no href instead of a link. For the non-member-facing
   * composition fixture, which draws the full canonical grammar so it can be
   * compared against 04 — inert, so nothing unbuilt is ever clickable.
   */
  inert?: boolean;
  /** Called when an actionable item is chosen in-place rather than navigated. */
  onSelect?: () => void;
}

export function StudioRailItem({
  destination,
  state = 'rest',
  inert,
  onSelect,
}: StudioRailItemProps) {
  /* WS2-03B — active and selected are no longer the same treatment.
     The shell marks the CURRENT room active and every OPEN panel selected, so
     collapsing the two put a gold bar on four rows at once and gold stopped
     meaning anything. Gold marks where the member IS. An open panel gets the
     raised ground and nothing more. */
  const onRow = state === 'active' || state === 'selected';
  const isCurrent = state === 'active';
  /* WS2-03B — an unavailable destination is a SPAN, always.
     Not a disabled anchor (still focusable in some engines, still carries an
     href in the DOM), not a button that does nothing. The tag itself is the
     honesty: there is nothing here to take. */
  const unavailable = state === 'unavailable';
  const Tag = inert || unavailable ? 'span' : onSelect ? 'button' : 'a';
  return (
    <Tag
      {...(inert || unavailable
        ? { 'aria-disabled': unavailable ? true : undefined }
        : onSelect
          ? { type: 'button' as const, onClick: onSelect }
          : { href: destination.href })}
      data-destination={destination.id}
      data-state={state}
      data-actionable={inert || unavailable ? 'false' : 'true'}
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
        textAlign: 'left',
        width: '100%',
        border: 'none',
        cursor: unavailable || inert ? 'default' : 'pointer',
        color: onRow
          ? INK.primary
          : unavailable || state === 'quiet'
            ? INK.quiet
            : INK.secondary,
        opacity: unavailable ? 0.55 : 1,
        background: onRow ? GROUND.active : 'transparent',
        ...(isCurrent ? { boxShadow: `inset 2px 0 0 ${GOLD.DEFAULT}` } : {}),
      }}
    >
      <StudioIcon id={destination.id} />
      <StudioText
        role="navItem"
        as="span"
        tone={onRow ? 'primary' : unavailable || state === 'quiet' ? 'quiet' : 'secondary'}
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

export function StudioBand({
  group,
  inert,
  stateFor,
  onSelect,
}: {
  group: StudioGroup;
  inert?: boolean;
  /** Per-destination state. The shell uses it to mark the current room. */
  stateFor?: (d: StudioDestination) => StudioRailItemProps['state'];
  onSelect?: (d: StudioDestination) => void;
}) {
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
        {group.destinations.map((d) => {
          const state = stateFor?.(d);
          return (
            <StudioRailItem
              key={d.id}
              destination={d}
              inert={inert}
              state={state}
              onSelect={
                state !== 'unavailable' && onSelect && !d.href
                  ? () => onSelect(d)
                  : undefined
              }
            />
          );
        })}
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
  stateFor,
  onSelect,
}: {
  groups: StudioGroup[];
  inert?: boolean;
  style?: CSSProperties;
  /** Rendered above the first band. 04 puts "+ New Work" here. */
  lead?: ReactNode;
  stateFor?: (d: StudioDestination) => StudioRailItemProps['state'];
  onSelect?: (d: StudioDestination) => void;
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
        <StudioBand
          key={g.id}
          group={g}
          inert={inert}
          stateFor={stateFor}
          onSelect={onSelect}
        />
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

/**
 * THE PERSISTENT SHELL PROJECTION — WS2-03B.
 *
 * A third projection, and the reason there are now three rather than two:
 *
 *   member rail (StudioRail)   Studio Home. Drops `later`. Unchanged.
 *   fixture rail (CanonicalRail)  the whole grammar, inert, route-less.
 *   shell rail (this)          the whole grammar, in the real room, with the
 *                              unbuilt rendered as plainly unavailable.
 *
 * The shell rail is the one that meets a member AND shows sixteen. That is
 * only defensible because `shellDestinations` strips every href and every
 * map-authored count from what is not actionable — so what the member reads
 * is "the Studio has a Notes room and I cannot open it yet", never a dead
 * link and never someone else's twelve notes.
 *
 * `current` marks the room the member is standing in. `onSelect` exists for
 * destinations the shell can satisfy in place — Materials and Structure are
 * panels in this room, not separate routes, so they are chosen, not navigated.
 */
export function StudioShellRail({
  hasManuscript,
  counts,
  satisfiedInRoom,
  current,
  openPanels,
  onSelect,
  lead,
  style,
}: {
  hasManuscript: boolean;
  /** Facts the shell counted. Nothing here may be a reference figure. */
  counts?: Readonly<Record<string, number>>;
  /** Destination ids this room opens as panels rather than navigating to. */
  satisfiedInRoom?: readonly string[];
  /** Destination id of the room the member is in. */
  current?: string;
  /** Destination ids whose panel is open right now. */
  openPanels?: readonly string[];
  onSelect?: (d: StudioDestination) => void;
  lead?: ReactNode;
  style?: CSSProperties;
}) {
  const groups = shellDestinations(hasManuscript, undefined, counts, satisfiedInRoom);
  return (
    <StudioRailChrome
      groups={groups}
      style={style}
      lead={lead}
      onSelect={onSelect}
      stateFor={(d) => {
        const shell = d as ShellDestination;
        if (!shell.actionable) return 'unavailable';
        if (d.id === current) return 'active';
        if (openPanels?.includes(d.id)) return 'selected';
        return 'rest';
      }}
    />
  );
}

export type { ShellGroup };
