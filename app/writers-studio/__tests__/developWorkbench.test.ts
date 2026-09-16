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

  it('does not invent passage precision before D5', () => {
    expect(room).not.toContain('paragraphs 3–4');
    expect(room).not.toContain('CodePointRange');
  });
});
