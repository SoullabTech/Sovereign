/**
 * FLAGSHIP STUDIO — PURE WRITE FRAME
 *
 * Presentation seam only. The host supplies the manuscript, live actions,
 * contextual layer, and truthful status. This component owns no state,
 * network, identity, persistence, save law, or model commission.
 */

import * as React from 'react';
import { CrumbBar } from './StudioChrome';
import type { Facet } from './flagshipTokens';

export interface WriteFrameProps {
  readonly work: string;
  readonly chapter?: string;
  readonly place?: string;
  readonly saved?: string;
  readonly facet?: Facet;
  readonly beforeBar?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly manuscript: React.ReactNode;
  readonly contextualLayer?: React.ReactNode;
  readonly floatingLayer?: React.ReactNode;
  readonly overlayLayer?: React.ReactNode;
  readonly footer?: React.ReactNode;
}

export function WriteFrame({
  work, chapter, place, saved, facet, beforeBar, actions, manuscript,
  contextualLayer, floatingLayer, overlayLayer, footer,
}: WriteFrameProps) {
  return (
    <>
      {beforeBar}
      <CrumbBar
        work={work}
        chapter={chapter}
        place={place}
        saved={saved}
        facet={facet}
        actions={actions}
      />
      <div className="fs-stage" data-stage="write" data-write-frame="true">
        <article className="fs-ms" data-manuscript="true" data-manuscript-slot="true">
          {manuscript}
        </article>
        {contextualLayer}
        {floatingLayer}
        {overlayLayer}
      </div>
      {footer ? <div className="fs-foot">{footer}</div> : null}
    </>
  );
}
