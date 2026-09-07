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
  UNAVAILABILITY_SAYS,
  shellDestinations,
  visibleDestinations,
  type ShellDestination,
  type ShellGroup,
  type StudioDestination,
  type StudioGroup,
  type StudioRegion,
  type Unavailability,
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
  /**
   * FR-C — why this cannot be taken, when it cannot. Passed in rather than
   * derived here: the shell already computed it from the same inputs that
   * decided actionability, and a second derivation is a second chance to
   * disagree.
   */
  unavailability?: Unavailability | null;
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
  unavailability = null,
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
  /* FR-C / FR-D — what sits under the label, if anything.
     STATE is said whenever the destination cannot be taken; it never waits to
     be requested, because a member cannot interpret the row without it.
     ORIENTATION (`note`) is shown where one is written — sparse by intent, and
     an empty note is a legitimate answer, not a gap (founder amendment 2). */
  const says = unavailable && unavailability ? UNAVAILABILITY_SAYS[unavailability] : null;
  const beneath = says ?? destination.note ?? null;
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
        /* The icon aligns to the LABEL, not to the block, so a two-line row
           does not float its icon into the gap between the lines. */
        alignItems: beneath ? 'flex-start' : 'center',
        gap: SPACE.snug + 2,
        /* Height comes from the MEASURED pitch rather than accumulating out of
           padding at each call site — pitch is what the eye reads as density,
           and the first composition drifted to ~37px against 04's 32px.
           A row carrying a second line keeps that pitch as a FLOOR and grows
           instead of cramming: an unreadable state is not a state.
           ⚠️ The shorthand is written FIRST so the longhand below can override
           it; the reverse order silently discards the vertical padding. */
        padding: `0 ${SPACE.base}px`,
        ...(beneath
          ? { minHeight: RAIL_RHYTHM.itemPitch - 2, paddingTop: 5, paddingBottom: 6 }
          : { height: RAIL_RHYTHM.itemPitch - 2 }),
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
      <span style={{ display: 'flex', flexShrink: 0, ...(beneath ? { marginTop: 2 } : {}) }}>
        <StudioIcon id={destination.id} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <StudioText
          role="navItem"
          as="span"
          tone={onRow ? 'primary' : unavailable || state === 'quiet' ? 'quiet' : 'secondary'}
        >
          {destination.label}
        </StudioText>
        {/* FR-C — the sentence, at rest, never waiting to be requested.
            `role="quiet"` is the design system's own answer: TYPE.quiet is
            documented as "supporting text that must not compete: notes under a
            destination". Harvested, not invented (flow §6).

            One slot carries STATE or ORIENTATION because they are never both
            present: a destination that can be taken has no state to declare,
            and one that cannot is not the place for an invitation. */}
        {beneath && (
          <StudioText
            role="quiet"
            as="span"
            tone="quiet"
            data-rail-beneath={says ? 'state' : 'orientation'}
          >
            {beneath}
          </StudioText>
        )}
      </span>
      {/* 04 right-aligns a count on Materials (24) and Notes (12). A count is
          a fact about the member's own material, never a rating. */}
      {typeof destination.count === 'number' && (
        <StudioText role="metadata" as="span" style={{ flexShrink: 0 }}>
          {destination.count}
        </StudioText>
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
              /* FR-C — a ShellDestination arrives carrying its own resolved
                 state; a plain StudioDestination (Studio Home, the fixture)
                 does not, and passes null. The rail never derives it. */
              unavailability={
                'unavailability' in d ? (d as ShellDestination).unavailability : null
              }
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
  manuscriptId,
  situatedHrefs,
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
  /** The manuscript on the table. Every manuscript-scoped link carries it. */
  manuscriptId?: string | null;
  /** WS2-03C — destinations this room can address right now. See ShellOptions. */
  situatedHrefs?: Readonly<Record<string, string>>;
  /** Destination id of the room the member is in. */
  current?: string;
  /** Destination ids whose panel is open right now. */
  openPanels?: readonly string[];
  onSelect?: (d: StudioDestination) => void;
  lead?: ReactNode;
  style?: CSSProperties;
}) {
  const groups = shellDestinations(hasManuscript, undefined, {
    counts, satisfiedInRoom, manuscriptId, situatedHrefs,
  });
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
