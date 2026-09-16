import { readFileSync } from 'fs';
import { join } from 'path';

const read = (rel: string) => readFileSync(join(process.cwd(), 'app/writers-studio', rel), 'utf8');

const page = read('develop/page.tsx');
const room = read('develop/DevelopRoom.tsx');
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

  it('puts the manuscript in the centre and intelligence beside it', () => {
    expect(room).toContain('data-develop-centre="manuscript"');
    expect(room).toContain('data-develop-intelligence');
    expect(room).toContain('<DevelopManuscriptSurface');
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
    expect(room).toContain("assessed?.state !== 'current'");
    expect(room).not.toContain('paragraphs 3–4');
    expect(manuscript).toContain('evidenceHighlight');
    expect(manuscript).toContain('readOnlyHighlight={evidenceHighlight}');
  });
});


describe('D4 · human-scale developmental scope and lens disclosure', () => {
  it('keeps Work and Chapter live while Passage is visibly unavailable', () => {
    expect(room).toContain('data-develop-scope-tabs');
    expect(room).toContain("setDevelopScope('work')");
    expect(room).toContain("setDevelopScope('chapter')");
    expect(room).toContain('>Passage</button>');
    expect(room).toContain('disabled aria-disabled="true"');
  });

  it('resolves Chapter from the same structural context Write uses', () => {
    expect(room).toContain('/api/writers-studio/rebuild/context?manuscriptId=');
    expect(room).toContain('chapterSpanFor(structuredSections, placeId)');
    expect(room).toContain('structureAligned');
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
