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
  it('every completed review has an interactive seven-lens navigator', () => {
    expect(room).toContain('data-review-lenses');
    expect(room).toContain('DEVELOPMENTAL_LENSES.map((lens)');
    expect(room).toContain('data-review-lens={lens}');
    expect(room).toContain('aria-pressed={active}');
    expect(room).toContain('setReviewLens(lens); setReviewFindingsOpen');
    expect(room).toContain('visibleReviewFindings.map((finding, index)');
    expect(room).toContain('reviewFindingsOpen');
    expect(room).toContain("aria-expanded={active && reviewFindingsOpen}");
    expect(room).toContain("maxHeight: 'min(46vh, 520px)'");
    expect(room).toContain("overflowY: 'auto'");
    expect(room).toContain('data-review-findings-scroll');
  });

  it('keeps an unfiltered door to every frozen finding', () => {
    expect(room).toContain('data-review-all-findings');
    expect(room).toContain('Every finding · {review.findings.length}');
    expect(room).toContain("setReviewLens('all'); setReviewFindingsOpen");
    expect(room).toContain('data-review-finding={finding.id}');
    expect(room).toContain('{finding.observation}');
  });

  it('section-linked findings can return to the manuscript', () => {
    expect(room).toContain('data-open-review-finding={finding.id}');
    expect(room).toContain('Show in manuscript →');
    expect(room).toContain('setFocusId(target)');
    expect(room).toContain("scrollIntoView({ behavior: 'smooth', block: 'center' })");
    expect(room).not.toContain("openReviewFinding = useCallback((finding: ChapterReviewBundle['findings'][number]) => {\n    const target = finding.sectionIds.find((id) => context?.sections.some((section) => section.draftSectionId === id));\n    if (!target) return;\n    selectSection(target, 'section');");
  });


  it('uses authored book structure instead of presenting import order as hierarchy', () => {
    expect(room).toContain('fetchStructure(context.manuscriptId)');
    expect(room).toContain('BOOK STRUCTURE');
    expect(room).toContain('data-authored-structure');
    expect(room).toContain('data-unplaced-structure');
    expect(room).toContain('sections not organized yet');
  });

  it('visually distinguishes confirmed chapter, section, subsection, and unknown structure', () => {
    expect(room).toContain('data-canvas-heading-level="chapter"');
    expect(room).toContain('data-canvas-heading-level="section"');
    expect(room).toContain('data-canvas-heading-level="subsection"');
    expect(room).toContain('data-canvas-heading-level="unconfirmed"');
    expect(room).toContain('SECTION · STRUCTURE NOT YET CONFIRMED');
    expect(room).toContain("disabled={!chapter}");
    expect(room).toContain('Chapter Review needs a confirmed chapter boundary.');
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
