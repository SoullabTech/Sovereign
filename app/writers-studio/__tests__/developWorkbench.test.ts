import { readFileSync } from 'fs';
import { join } from 'path';

const read = (rel: string) => readFileSync(join(process.cwd(), 'app/writers-studio', rel), 'utf8');

const page = read('develop/page.tsx');
const room = read('develop/DevelopRoom.tsx');
const executableRoom = room.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const manuscript = read('develop/DevelopManuscript.tsx');
const canvas = read('canvas/CanvasClient.tsx');

describe('D3 · Develop is the manuscript seen developmentally', () => {
  it('consumes the place D1 carries across the mode boundary', () => {
    expect(page).toContain('SECTION_PARAM');
    expect(page).toContain('requestedSectionId={sectionId}');
    expect(room).toContain('requestedSectionId: string | null');
  });

  it('makes the current authored locus legible without inventing hierarchy', () => {
    expect(room).toContain('data-develop-locus');
    expect(room).toContain("currentSection.heading?.trim()");
    expect(room).not.toContain('Part I ›');
  });


  it('reads the manuscript from the same rebuild context as Write', () => {
    expect(room).toContain('/api/writers-studio/rebuild/context?manuscriptId=');
    expect(executableRoom).not.toContain('fetchWriteState');
    expect(executableRoom).not.toContain('/write-state');
    expect(room).toContain("manuscriptPhase === 'error'");
  });
  it('keeps the full manuscript primary and reading tools available on request', () => {
    expect(room).toContain('data-develop-centre="manuscript"');
    expect(room).toContain('data-develop-intelligence');
    expect(room).toContain('<DevelopManuscriptSurface');
    expect(room).toContain("display: readingToolsOpen ? undefined : 'none'");
    expect(room).toContain('aria-expanded={readingToolsOpen}');
    expect(room).toContain('<InlineWorkspace anchor={noteAnchor}');
    expect(room).not.toContain('<CanvasWorkspace');
    expect(room).not.toContain('w-[390px] max-w-[42vw]');
    expect(room.indexOf('data-develop-centre="manuscript"'))
      .toBeLessThan(room.indexOf('data-develop-intelligence'));
  });

  it('reuses the same whole-manuscript surface Write already uses', () => {
    expect(manuscript).toContain('WholeManuscriptSurface');
    expect(canvas).toContain('<WholeManuscriptSurface');
    expect(manuscript).not.toContain('<textarea');
  });

  it('makes every Develop section read-only before it reaches the shared surface', () => {
    expect(manuscript).toContain('editable: false');
    expect(manuscript).toContain('edit: () => {}');
    expect(manuscript).toContain('editSection: () => {}');
    expect(manuscript).toContain('captureForUnmount: () => false');
  });

  it('allows ordinary continuous scrolling to move developmental scope', () => {
    expect(manuscript).toContain('onPlaceChange={onPlaceChange}');
    expect(room).toContain('onPlaceChange={(sectionId) => showPlace(sectionId, false)}');
    expect(room).toContain('window.history.replaceState');
    expect(room).toContain('locationForSection');
  });

  it('allows structure and observations to move the manuscript', () => {
    expect(room).toContain('onSelect={(sectionId) => showPlace(sectionId, true)}');
    expect(room).toContain('data-observation-show-in-manuscript');
    expect(room).toContain("setJumpTo(sectionId)");
  });

  it('demotes reading administration instead of making it the primary surface', () => {
    expect(room).toContain('Readings & reading focus');
    expect(room).toContain('Current reading');
    expect(room).toContain('Reading details');
    expect(room).toContain('<details');
    expect(room).toContain('aria-label="Developmental reading"');
  });

  it('does not restore the old generic Studio rail', () => {
    expect(room).not.toContain('StudioShellRail');
    expect(room).toContain('<DevelopManuscriptRail');
  });

  it('D5 carries exact passage precision without inventing paragraph labels', () => {
    expect(room).toContain('CodePointRange');
    expect(room).toContain('data-evidence-precision="passage"');
    expect(room).toContain('Show exact passage');
    expect(room).toContain("setPresentationScope('passage')");
    expect(room).toContain("assessed?.state !== 'current'");
    expect(room).not.toContain('paragraphs 3–4');
    expect(manuscript).toContain('evidenceHighlight');
    expect(manuscript).toContain('readOnlyHighlight={evidenceHighlight}');
    expect(room).toContain('evidenceAnnotations={passageAnnotations}');
    expect(room).toContain('onEvidenceAnnotationSelect={(annotation) =>');
    expect(manuscript).toContain('readOnlyAnnotations={evidenceAnnotations}');
    expect(manuscript).toContain('onReadOnlyAnnotationSelect={onEvidenceAnnotationSelect}');
  });
});


describe('D4 · human-scale developmental scope and lens disclosure', () => {
  it('keeps new-reading scope subordinate and never claims passage commissioning', () => {
    expect(room).not.toContain('data-develop-scope-tabs');
    expect(room).toContain('data-develop-reading-scope-controls');
    expect(room).toContain("setDevelopScope('work')");
    expect(room).toContain("setDevelopScope('chapter')");
    expect(room).toContain('Whole work');
    expect(room).toContain('Current chapter');
    expect(room).not.toContain('title="Exact passage focus is not available in Develop yet"');
  });

  it('presents current findings through a separate Work-to-Chapter-to-Passage hierarchy', () => {
    expect(room).toContain('data-develop-reading-presentation');
    expect(room).toContain('data-develop-presentation-hierarchy');
    expect(room).toContain('data-develop-presentation-scope="work"');
    expect(room).toContain('data-develop-presentation-scope="chapter"');
    expect(room).toContain('data-develop-presentation-scope="passage"');
    expect(room).toContain('data-develop-presentation-context');
  });

  it('keeps observations in frozen order while making their supporting detail collapsible', () => {
    expect(room).toContain('view.observations.map((o) =>');
    expect(room).toContain('data-observation-panel={o.key}');
    expect(room).toContain('data-observation-summary={o.key}');
    expect(room).toContain('Show details');
    expect(room).toContain('Hide details');
  });

  it('resolves Chapter from the same structural context Write uses', () => {
    expect(room).toContain('/api/writers-studio/rebuild/context?manuscriptId=');
    expect(room).toContain('chapterSpanFor(structuredSections, placeId)');
    expect(executableRoom).not.toContain('structureAligned');
    expect(room).toContain('const rebuilt = body.sections as RebuildSection[]');
  });

  it('foregrounds four common lenses without hiding the complete vocabulary', () => {
    expect(room).toContain("['development', 'structure', 'continuity', 'voice']");
    expect(room).toContain('data-develop-primary-lenses');
    expect(room).toContain('data-develop-all-lenses');
    expect(room).toContain('LENS_ORDER.map');
    expect(room).toContain("lens === 'development' ? 'Movement'");
  });

  it('preserves the pre-existing custom range capability', () => {
    expect(room).toContain('Custom range');
    expect(room).toContain('data-develop-custom-range');
    expect(room).toContain('fromSectionId: sections[fromIndex].id');
    expect(room).toContain('toSectionId: sections[to].id');
  });
});
