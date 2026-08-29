/**
 * The NON-MEMBER-FACING projection of the rail: D-019's full sixteen, inert.
 *
 * Two projections of one grammar, and both are necessary:
 *
 *   fixture rail    the whole canonical grammar, so the composition can be
 *                   compared against 04 on inventory as well as proportion.
 *                   Inert — every item is a span, nothing carries an href.
 *
 *   member rail     StudioRail, drawing through visibleDestinations, so an
 *                   unbuilt room never reaches a member.
 *
 * The earlier composition used the member rail and therefore could not be
 * compared with 04's rail at all. That was an unnecessary loss: an inert
 * fixture may represent a design element whose capability is absent, which is
 * precisely why an inert fixture was permitted. What it may never do is become
 * reachable — this file is exported by no route, and the test suite asserts
 * there is no page.tsx beside it.
 */
'use client';

import type { CSSProperties } from 'react';
import { GOLD, INK, RADIUS, SPACE, TYPE } from '../../studioTheme';
import { STUDIO_MAP } from '../../studioMap';
import { StudioRailChrome } from '../StudioRail';

/**
 * "+ New Work", as 04 draws it — and a correction to where it was thought to be.
 *
 * It is NOT beside the work identity in the header. In 04 it is the first
 * thing in the LEFT RAIL, a gold-filled pill spanning the rail's width, above
 * the WORK SPACE band label. Measured at y 104-114 in the 1024-tall reference,
 * with WORK SPACE at y 164 beneath it.
 *
 * APPEARANCE ONLY. It is a div, not a button, and carries no handler — a gold
 * affordance in a reference must not quietly relocate business logic. The
 * programme places start and import capability with Work Home / EXPLORE and
 * persistent shell navigation with WS2-03; where this lives at runtime has to
 * preserve that ownership, and this unit does not decide it.
 */
function NewWorkAffordance() {
  return (
    <div
      data-affordance="new-work"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE.snug,
        background: GOLD.fill,
        color: INK.primary,
        border: `1px solid ${GOLD.edge}`,
        borderRadius: RADIUS.base,
        height: 38,
        marginBottom: SPACE.roomy,
        fontFamily: TYPE.navItem.family,
        fontSize: `${TYPE.navItem.size}rem`,
        fontWeight: 600,
      }}
    >
      <span aria-hidden="true">+</span>
      New Work
    </div>
  );
}

export function CanonicalRail({ style }: { style?: CSSProperties }) {
  return (
    <StudioRailChrome groups={STUDIO_MAP} inert style={style} lead={<NewWorkAffordance />} />
  );
}
