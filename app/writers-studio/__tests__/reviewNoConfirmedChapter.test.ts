import fs from 'node:fs';
import path from 'node:path';

// Quick reread and Deep Review both need a member-confirmed chapter. Without one
// their handlers return before doing anything, so the buttons were dead: no
// request, no message. Review must say why and point to Develop instead.
test('Review explains a Work without confirmed chapters instead of offering dead rereads', () => {
  const review = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx'),
    'utf8',
  );

  // The handlers still refuse without a chapter (that law is unchanged)...
  expect(review).toContain('if (!context || !reviewChapter?.sections.length || quickReviewBusy) return;');

  // ...so the panel must branch on the same fact before rendering the rereads.
  const noChapter = review.indexOf('{!reviewChapter ? (');
  const quick = review.indexOf("'Quick reread'");
  expect(noChapter).toBeGreaterThan(-1);
  expect(noChapter).toBeLessThan(quick);
  expect(review).toContain('data-review-no-chapter');
  expect(review).toContain("onClick={() => goMode('develop')}");

  const deep = review.indexOf('<details className="p4r1-review-deep">');
  expect(review.slice(deep - 40, deep)).toContain('{reviewChapter ? (');
});
