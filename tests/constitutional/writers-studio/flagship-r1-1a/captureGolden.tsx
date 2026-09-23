/** R1-1A · golden capture of the four accepted controlled Review states. ⛔ Run ONLY at the accepted base; never to bless a change. */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ReviewRoom } from '../../../../app/writers-studio/flagship/DevelopReview';
import { REVIEW } from '../../../../scripts/witness/flagship/fixtures';
export const REVIEW_STATES = {
  '7-review': () => <ReviewRoom view={REVIEW} />,
  '7b-review-acknowledged': () => <ReviewRoom view={{ ...REVIEW, changed: REVIEW.changed ? { ...REVIEW.changed, acknowledged: true } : undefined }} />,
  '8-review-not-read': () => <ReviewRoom view={REVIEW} lens="arc" />,
  '9-review-nothing-noticed': () => <ReviewRoom view={REVIEW} lens="coherence" />,
} as const;
if (require.main === module) {
  for (const [id, node] of Object.entries(REVIEW_STATES)) {
    const html = renderToStaticMarkup(node());
    writeFileSync(join(__dirname, 'golden', `${id}.html`), html);
    console.log(id, html.length);
  }
}
