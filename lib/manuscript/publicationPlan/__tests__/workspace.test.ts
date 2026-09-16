import { buildPublicationWorkspace } from '../workspace';

describe('HPB-04 publication workspace projection', () => {
  const rows = [
    { id: 'd0', position: 0, text: 'Elemental Alchemy Elemental Alchemy', heading: null, heading_depth: null, heading_signal: null, publication_role: null },
    { id: 'd1', position: 1, text: 'Elemental Alchemy\n\nThe Art of Living. Copyright � 2026 by Kelly Nezat', heading: 'Elemental Alchemy', heading_depth: 1, heading_signal: 'markdown', publication_role: null },
    { id: 'd2', position: 2, text: 'Copyright\n\nCopyright © 2026 Kelly W. Nezat. All rights reserved.', heading: 'Copyright', heading_depth: 2, heading_signal: 'markdown', publication_role: 'copyright' },
    { id: 'd3', position: 3, text: 'Part One — The Ground', heading: 'Part One — The Ground', heading_depth: 1, heading_signal: 'markdown', publication_role: null },
  ] as const;

  it('projects exact draft-section identity, excerpt, assigned role and front-matter boundary', () => {
    const view = buildPublicationWorkspace(rows, 9);
    expect(view.draftVersion).toBe(9);
    expect(view.bodyStartPosition).toBe(3);
    expect(view.sections.map((s) => [s.id, s.position, s.frontMatter])).toEqual([
      ['d0', 0, true], ['d1', 1, true], ['d2', 2, true], ['d3', 3, false],
    ]);
    expect(view.sections[1]?.preview).toBe('The Art of Living. Copyright � 2026 by Kelly Nezat');
    expect(view.sections[2]).toMatchObject({ assignedRole: 'copyright', effectiveRole: 'copyright' });
    expect(view.placements).toEqual([{ role: 'copyright', sectionIds: ['d2'] }]);
  });

  it('binds blocker locations back to exact current draft-section ids', () => {
    const view = buildPublicationWorkspace(rows, 9);
    expect(view.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'damaged_copyright_text', sectionIds: ['d1'] }),
      expect.objectContaining({ code: 'duplicate_copyright_statements', sectionIds: ['d1', 'd2'] }),
    ]));
  });

  it('lets an explicit role override an ambiguous repeated heading without changing its preview', () => {
    const governed = rows.map((row) => row.id === 'd1' ? { ...row, publication_role: 'title-page' } : row);
    const view = buildPublicationWorkspace(governed, 10);
    expect(view.sections[1]).toMatchObject({ id: 'd1', assignedRole: 'title-page', effectiveRole: 'title-page' });
    expect(view.sections[1]?.preview).toContain('Copyright � 2026');
  });
  it('keeps an omitted section visible in the production plan but removes it from final preflight and book counts', () => {
    const omitted = rows.map((row) => row.id === 'd1' ? { ...row, publication_role: 'omit' } : row);
    const view = buildPublicationWorkspace(omitted, 11);
    expect(view.sections[1]).toMatchObject({ id: 'd1', assignedRole: 'omit', effectiveRole: 'omit' });
    expect(view.placements).toEqual(expect.arrayContaining([{ role: 'omit', sectionIds: ['d1'] }]));
    expect(view.sectionCount).toBe(3);
    expect(view.issues.map((issue) => issue.code)).not.toContain('damaged_copyright_text');
    expect(view.issues.map((issue) => issue.code)).not.toContain('duplicate_copyright_statements');
  });

});
