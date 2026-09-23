/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1B — THE LIVE REVIEW VIEW (pure).
 *
 * idle → nothing · loading → one line, no data · unavailable → one calm sentence, identical for
 * every reason · ready → the R1-1A ReviewPresentation with READ_ONLY_REVIEW_CAPABILITIES.
 * ⛔ Pure: no fetch, no state, no fixture, no capability granted.
 */
import * as React from 'react';
import { ReviewPresentation, READ_ONLY_REVIEW_CAPABILITIES, type LensId } from '../flagship/DevelopReview';
import { REVIEW_COPY, type LiveReviewState } from './liveReview';

export function LiveReviewView({ state, lens, onLens }: {
  state: LiveReviewState; lens: LensId | 'all'; onLens: (lens: LensId | 'all') => void;
}) {
  if (state.kind === 'idle') return null;
  if (state.kind === 'loading') {
    return <div className="fs-pane" data-stage="review" data-review="loading"><p className="fs-obsnote">{REVIEW_COPY.loading}</p></div>;
  }
  if (state.kind === 'unavailable') {
    return (
      <div className="fs-pane" data-stage="review" data-review="unavailable">
        <section className="fs-card"><h3>Review</h3><p className="fs-obsnote">{REVIEW_COPY.unavailable}</p></section>
      </div>
    );
  }
  return (
    <div data-review="ready" data-review-reading={state.readingId}>
      <ReviewPresentation view={state.view} lens={lens} capabilities={READ_ONLY_REVIEW_CAPABILITIES} onLens={onLens} />
    </div>
  );
}
