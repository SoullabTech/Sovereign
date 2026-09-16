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


describe('Work context is declared, never implied', () => {
  it('does not let manuscript fallback copy impersonate a declared Work', () => {
    expect(room).not.toContain("work?.purpose ?? 'A living manuscript in progress.'");
    expect(room).toContain('data-work-context={workContext.kind}');
    expect(room).toContain("'This manuscript is not yet declared as a Work.'");
  });

  it('keeps none and ambiguous as different member-facing states', () => {
    expect(room).toContain("workContext.kind === 'none'");
    expect(room).toContain("workContext.kind === 'ambiguous'");
    expect(room).toContain('The Studio will not choose one for you.');
    expect(room).toContain('MAIA will not guess which one you mean.');
  });

  it('offers declaration only as an explicit member gesture', () => {
    expect(room).toContain('data-make-this-a-work');
    expect(room).toContain('Make this a Work');
    expect(room).toContain("expressionType: 'manuscript'");
    expect(room).toContain('await reloadWorks()');
  });

  it('names manuscript context as manuscript context when no Work is resolved', () => {
    expect(room).toContain("In relation to {work ? 'Work' : 'manuscript'}");
  });
});
