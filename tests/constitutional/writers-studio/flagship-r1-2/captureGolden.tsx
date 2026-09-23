/** R1-2 · golden of the live read-only Review with return navigation, captured ON THE R1-2 CANDIDATE and frozen under FS3.
 *  ⛔ Run ONLY to establish the successor state under an authorized act; never to bless a later change. */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LiveReviewView } from '../../../../app/writers-studio/rebuild/LiveReviewView';
import { loadSelectedReading } from '../../../../app/writers-studio/rebuild/liveReview';
import { navigationFor } from '../../../../app/writers-studio/rebuild/reviewReturn';
import { ports, HOST } from '../flagship-r1-1b/laws';
async function main() {
  const r = await loadSelectedReading('rd-current', HOST, ports());
  if (r.kind !== 'ready') throw new Error('fixture reading did not mount');
  const navigation = navigationFor(r.view, { pathname: '/writers-studio/rebuild', search: '?m=ms-1&s=d-root&reading=rd-current' }, { go: () => {} });
  const html = renderToStaticMarkup(<LiveReviewView state={{ kind: 'ready', readingId: 'rd-current', gen: 1, view: r.view }} lens="all" onLens={() => {}} navigation={navigation} />);
  writeFileSync(join(__dirname, 'golden', 'review-ready-navigable.html'), html);
  console.log('review-ready-navigable', html.length);
}
void main();
