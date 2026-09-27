import * as React from 'react';
import {
  ReviewPresentation,
  READ_ONLY_REVIEW_CAPABILITIES,
  type LensId,
  type ReviewNavigation,
} from '../flagship/DevelopReview';
import type { ReviewDiscussionState } from '@/lib/writersStudio/rebuild/reviewDiscuss';
import { WHOLE_REVIEW_COPY, type WholeReviewState } from './wholeReview';

/** D4R1 — exact flagship presentation for one explicit saved Review run. */
export function WholeReviewView({
  state, lens, onLens, navigation, discussion,
  onDiscussFinding, onSubmitDiscuss, onCloseDiscuss,
}: {
  state: WholeReviewState;
  lens: LensId | 'all';
  onLens: (lens: LensId | 'all') => void;
  navigation?: ReviewNavigation;
  discussion?: ReviewDiscussionState | null;
  onDiscussFinding?: (findingId: string) => void;
  onSubmitDiscuss?: (findingId: string, text: string) => void;
  onCloseDiscuss?: () => void;
}) {
  if (state.kind === 'idle') return null;
  if (state.kind === 'loading') {
    return <div className="fs-pane" data-stage="review" data-review-run="loading">
      <p className="fs-obsnote">{WHOLE_REVIEW_COPY.loading}</p>
    </div>;
  }  if (state.kind === 'unavailable') {
    return <div className="fs-pane" data-stage="review" data-review-run="unavailable">
      <section className="fs-card">
        <h3>Review</h3>
        <p className="fs-obsnote">{WHOLE_REVIEW_COPY.unavailable}</p>
      </section>
    </div>;
  }
  return (
    <div data-review="ready" data-review-run={state.reviewRunId}>
      <ReviewPresentation
        view={state.view}
        lens={lens}
        themesEnabled={state.view.lenses.some((entry) => entry.id === 'themes')}
        onLens={onLens}
        navigation={navigation}
        discussion={discussion}
        onDiscuss={onDiscussFinding}
        onSubmitDiscuss={onSubmitDiscuss}
        onCloseDiscuss={onCloseDiscuss}
        capabilities={{
          ...READ_ONLY_REVIEW_CAPABILITIES,
          discuss: !!onDiscussFinding,
          navigate: !!navigation && READ_ONLY_REVIEW_CAPABILITIES.navigate,
        }}
      />
    </div>
  );
}
