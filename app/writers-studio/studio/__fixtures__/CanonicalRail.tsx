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
import { STUDIO_MAP } from '../../studioMap';
import { StudioRailChrome } from '../StudioRail';

export function CanonicalRail({ style }: { style?: CSSProperties }) {
  return <StudioRailChrome groups={STUDIO_MAP} inert style={style} />;
}
