import { readFileSync } from 'fs';
import { join } from 'path';

const room = readFileSync(
  join(process.cwd(), 'app/writers-studio/rebuild/RebuildStudioClient.tsx'),
  'utf8',
);
const css = readFileSync(
  join(process.cwd(), 'app/writers-studio/rebuild/rebuild.css'),
  'utf8',
);

describe('Writer workbench usability repair', () => {
  it('Pure Canvas always renders an explicit return to the Workbench', () => {
    expect(room).toContain('aria-label="Return to Writer’s Studio workbench"');
    expect(room).toContain('<span aria-hidden="true">←</span> Workbench');
    expect(css).toContain('.wsr-return-workspace');
    expect(css).toContain('min-height: 40px');
  });

  it('the manuscript owns vertical scrolling instead of the locked page', () => {
    expect(room).toContain('data-manuscript-scroll');
    expect(room).toContain("minHeight: 0, overflowY: 'auto'");
    expect(css).toContain('.wsr-manuscript { overflow: hidden; }');
    expect(css).toContain('.wsr-pure-scroll { height: 100%; min-height: 0; overflow-y: auto !important; }');
  });
  it('every completed review has a member-facing all-findings door', () => {
    expect(room).toContain('data-review-all-findings');
    expect(room).toContain('All findings · {review.findings.length}');
    expect(room).toContain('data-review-finding={finding.id}');
    expect(room).toContain('{finding.observation}');
  });

  it('section-linked findings can return to the manuscript', () => {
    expect(room).toContain('data-open-review-finding={finding.id}');
    expect(room).toContain('Show in manuscript →');
    expect(room).toContain("selectSection(target, 'section')");
  });

  it('Passage Work exposes all findings attached to the current section', () => {
    expect(room).toContain('passageReviewFindings.map((finding)');
    expect(room).toContain('data-section-review-finding={finding.id}');
    expect(room).not.toContain('+ {passageReviewFindings.length - 1} more finding');
  });
});
