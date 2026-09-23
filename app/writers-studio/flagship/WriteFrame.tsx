/**
 * FLAGSHIP STUDIO — WRITE FRAME
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1A
 *
 * ⭐ The pure compositional seam between the accepted flagship Write geometry
 * and whatever manuscript surface a host supplies. The controlled witness
 * supplies fixture paragraphs; a live host supplies the proven authorship
 * substrate (`RebuildAuthoredBody` inside `RebuildWritingBoundary`).
 *
 * THE FRAME OWNS NOTHING BUT GEOMETRY.
 *   ⛔ fetches nothing · ⛔ persists nothing · ⛔ mints no identity
 *   ⛔ infers no Work fact · ⛔ owns no save authority
 *   ⛔ owns no manuscript mutation · ⛔ owns no model commission
 *   ⛔ renders no control of its own — every action, the trail, the status
 *      line and the contextual layer are HOST-SUPPLIED, so a live host that
 *      lacks the substrate for a control simply does not pass it.
 *
 * ⭐ Every string rendered here arrived as a prop. The frame composes no
 * label, no status ("Saved 2m ago" is the witness's fixture, not the frame's
 * opinion), no chapter label, no epigraph. Absence is rendered as absence.
 *
 * ⭐ Pure function of its props. No hooks. Renders under react-dom/server.
 */

import * as React from 'react';
import { CrumbBar } from './StudioChrome';
import type { Facet } from './flagshipTokens';

export interface WritePlace {
  /** C1B: optional — absence renders as absence, never as "Untitled". */
  readonly work?: string;
  readonly chapter?: string;
  readonly place?: string;
  readonly facet?: Facet;
}

export interface WriteHeading {
  readonly chapterLabel?: string;
  readonly chapterTitle?: string;
  readonly epigraph?: { readonly text: string; readonly attribution: string };
}

export interface WriteFoot {
  readonly chapterLabel?: string;
  readonly words?: number;
  readonly wordDelta?: number;
  /** Host-supplied footer actions (the witness passes its Focus tool). */
  readonly actions?: React.ReactNode;
}

export interface WriteFrameProps {
  readonly place: WritePlace;
  /** Truthful save/status line, VERBATIM from the host. Omit when unknown. */
  readonly status?: string;
  /** Host-supplied bar actions. Omit any that lack real substrate. */
  readonly actions?: React.ReactNode;
  /** The trail out, when the host has one to offer. */
  readonly trail?: React.ReactNode;
  readonly heading?: WriteHeading;
  /** The manuscript surface. Static paragraphs in the witness; live authorship in production. */
  readonly children: React.ReactNode;
  /** The contextual layer(s) above the manuscript: MAIA, floats, drawers. */
  readonly contextual?: React.ReactNode;
  readonly foot?: WriteFoot;
}

export function WriteFrame({ place, status, actions, trail, heading, children, contextual, foot }: WriteFrameProps) {
  return (
    <>
      {trail}
      <CrumbBar
        work={place.work} chapter={place.chapter} place={place.place} facet={place.facet}
        saved={status} actions={actions}
      />
      <div className="fs-stage" data-stage="write">
        <article className="fs-ms" data-manuscript="true">
          {heading?.chapterLabel ? <div className="fs-chlabel">{heading.chapterLabel}</div> : null}
          {heading?.chapterTitle ? <h1 className="fs-chtitle">{heading.chapterTitle}</h1> : null}
          {heading?.epigraph ? (
            <>
              <p className="fs-epi">{heading.epigraph.text}</p>
              <p className="fs-epiwho">— {heading.epigraph.attribution}</p>
            </>
          ) : null}
          {children}
        </article>
        {contextual}
      </div>
      {foot ? (
        <div className="fs-foot">
          {foot.chapterLabel !== undefined ? <span>{foot.chapterLabel}</span> : null}
          {foot.chapterLabel !== undefined && foot.words !== undefined ? <span>·</span> : null}
          {foot.words !== undefined ? (
            <span>
              {foot.words.toLocaleString('en-US')} words
              {foot.wordDelta ? <span className="fs-delta"> (+{foot.wordDelta})</span> : null}
            </span>
          ) : null}
          <span className="fs-sp" />
          {foot.actions}
        </div>
      ) : null}
    </>
  );
}
