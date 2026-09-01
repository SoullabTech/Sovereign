/**
 * WS2-05B step 5c - a page that shows one proposal, so it can be witnessed.
 *
 * The review surface will eventually live inside the Canvas. It has its own
 * route first because the machine harness needs to open a proposal directly,
 * and because mounting an unproven surface into the room where members write
 * would be the wrong order: prove the instrument, then install it.
 *
 * READ AND REVIEW ONLY. Nothing reachable from here can author canonical
 * structure; there is no adoption endpoint to reach.
 */
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StructureReview from '../canvas/StructureReview';
import { GROUND, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';

function Body() {
  /* useSearchParams is nullable in the app router's types. */
  const params = useSearchParams();
  const manuscriptId = params?.get('m') ?? null;
  const proposalId = params?.get('p') ?? null;

  if (!manuscriptId || !proposalId) {
    return (
      <StudioText role="metadata" data-review-missing-params>
        This page needs a Work and a proposal: ?m=&lt;manuscript&gt;&amp;p=&lt;proposal&gt;
      </StudioText>
    );
  }
  return <StructureReview manuscriptId={manuscriptId} proposalId={proposalId} />;
}

export default function StructureReviewPage() {
  return (
    <main
      data-panel-role="structure-review"
      style={{ background: GROUND.base, minHeight: '100vh', padding: SPACE.roomy }}
    >
      <Suspense fallback={<StudioText role="metadata">reading…</StudioText>}>
        <Body />
      </Suspense>
    </main>
  );
}
