import { readFileSync } from 'fs';
import { join } from 'path';

const PANEL = readFileSync(join(__dirname, '..', 'BookProductionPanel.tsx'), 'utf8');
const PAGE = readFileSync(join(__dirname, '..', 'page.tsx'), 'utf8');

describe('HPB-04 — Book Production is an author-facing working surface', () => {
  it('mounts one focused Book Production panel in the existing Book tab', () => {
    expect(PAGE).toContain("import BookProductionPanel from './BookProductionPanel'");
    expect(PAGE).toContain("tab === 'book' && active");
    expect(PAGE).toContain('<BookProductionPanel');
    expect(PANEL).toContain('data-book-production-panel');
  });

  it('keeps front matter independently scrollable and actionable', () => {
    expect(PANEL).toContain('data-front-matter-scroll');
    expect(PANEL).toContain('max-h-[520px] overflow-y-auto overscroll-contain');
    expect(PANEL).toContain('Assign ${roleLabel(role)}');
    expect(PANEL).toContain('clearRole');
    expect(PANEL).toContain('Clear');
    expect(PANEL).toContain('Omit from book');
  });

  it('distinguishes Proof from Final rather than relabeling one download', () => {
    expect(PANEL).toContain("renderBook(format, 'proof')");
    expect(PANEL).toContain("renderBook(format, 'final')");
    expect(PANEL).toContain('Download Proof');
    expect(PANEL).toContain('Download Final');
    expect(PANEL).toContain("stage === 'final' && !finalReady");
  });

  it('never binds production choices to source-section ids from the Press page', () => {
    expect(PANEL).toContain('/publication-plan');
    expect(PANEL).not.toContain('sourceSectionId');
    expect(PANEL).not.toContain('sections: Section[]');
    expect(PAGE).not.toContain('sectionIds={sections');
  });

  it('requires contiguous selection for one multi-section publication object', () => {
    expect(PANEL).toContain('selectionIsContiguous');
    expect(PANEL).toContain('Choose neighboring sections');
    expect(PANEL).toContain('disabled={roleBusy || selected.length === 0 || !contiguous}');
  });
});
