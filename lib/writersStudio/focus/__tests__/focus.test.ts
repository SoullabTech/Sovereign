/**
 * The falsifiers that would have killed 2026-09-16, at unit scope.
 */

import { focusOn, focusRequest, scopeLabel, composerPrompt } from '../studioFocus';
import { outlineTree, pathTo, chapterOf } from '../outlineTree';

const ch10 = {
  draftSectionId: 'd198', sourceSectionId: 's198', position: 198,
  heading: 'Chapter 10: The Living Spiral', depth: 2 as const,
};
const two = {
  draftSectionId: 'd200', sourceSectionId: 's200', position: 200,
  heading: 'II. Finding Our Place', depth: 3 as const,
};
const base = { workRef: 'w1', manuscriptId: 'm1' };

describe('X2 — focus never substitutes another section', () => {
  it('no section in view is null, not front matter', () => {
    const f = focusOn(base);
    expect(f.section).toBeNull();
    expect(f.scope).toBe('whole_work');
  });

  it('a section with no Source row refuses the boundary rather than widening', () => {
    const f = focusOn({ ...base, section: { ...two, sourceSectionId: null } });
    // ⛔ The failure mode being killed: falling back to the Work, or to 0.
    expect(focusRequest(f)).toBeNull();
  });

  it('the request carries the SOURCE id, never the draft id', () => {
    const r = focusRequest(focusOn({ ...base, section: two }));
    expect(r?.sectionRef).toBe('s200');
    expect(r?.sectionRef).not.toBe('d200');
  });
});

describe('scope is derived, visible, and never silently held', () => {
  it('selection makes it a passage', () => {
    const f = focusOn({ ...base, section: two, selection: { from: 0, to: 9, revisionNumber: 5 } });
    expect(f.scope).toBe('passage');
    expect(composerPrompt(f)).toBe('Ask MAIA about this passage…');
  });

  it('a selection without a section is dropped, not honoured', () => {
    const f = focusOn({ ...base, selection: { from: 0, to: 9, revisionNumber: 5 } });
    expect(f.selection).toBeNull();
    expect(f.scope).toBe('whole_work');
  });

  it('an override holds only for the section it was chosen against', () => {
    const held = focusOn({
      ...base, section: ch10,
      override: { scope: 'whole_work', forDraftSectionId: 'd198' },
    });
    expect(held.scope).toBe('whole_work');
    expect(held.scopeChosen).toBe(true);

    const moved = focusOn({
      ...base, section: two,
      override: { scope: 'whole_work', forDraftSectionId: 'd198' },
    });
    // ⭐ Attention moved; the choice does not follow it silently.
    expect(moved.scope).toBe('section');
    expect(moved.scopeChosen).toBe(false);
  });

  it('an override cannot manufacture a passage with no selection', () => {
    const f = focusOn({
      ...base, section: two,
      override: { scope: 'passage', forDraftSectionId: 'd200' },
    });
    expect(f.scope).toBe('section');
  });

  it('the writer can read the binding before acting', () => {
    expect(scopeLabel(focusOn({ ...base, section: ch10 }))).toBe('Reviewing entire chapter');
    expect(scopeLabel(focusOn({
      ...base, section: two, selection: { from: 0, to: 9, revisionNumber: 5 },
    }))).toBe('Focused section: II. Finding Our Place');
  });
});

describe('the outline is a book, and 198/199 are not rivals', () => {
  const rows = [
    { draftSectionId: 'dP3', position: 197, heading: 'Part Three — The Spiral', depth: 1 },
    { draftSectionId: 'd198', position: 198, heading: 'Chapter 10: The Living Spiral', depth: 2 },
    { draftSectionId: 'd199', position: 199, heading: 'I. The Living Spiral', depth: 3 },
    { draftSectionId: 'd200', position: 200, heading: 'II. Finding Our Place', depth: 3 },
    { draftSectionId: 'd221', position: 221, heading: 'Chapter 11: Emergence', depth: 2 },
  ];

  it('nests parts, chapters and sub-sections', () => {
    const t = outlineTree(rows);
    expect(t).toHaveLength(1);
    expect(t[0]!.children.map((c) => c.draftSectionId)).toEqual(['d198', 'd221']);
    expect(t[0]!.children[0]!.children.map((c) => c.draftSectionId)).toEqual(['d199', 'd200']);
  });

  it('a chapter does not adopt the previous chapter’s sub-sections', () => {
    const t = outlineTree(rows);
    expect(t[0]!.children[1]!.children).toEqual([]);
  });

  it('199 is AT 198, not instead of it', () => {
    const t = outlineTree(rows);
    expect(pathTo(t, 'd199').map((n) => n.draftSectionId)).toEqual(['dP3', 'd198', 'd199']);
    expect(chapterOf(t, 'd199')?.draftSectionId).toBe('d198');
  });

  it('a Work with no confirmed depth stays flat and loses nothing', () => {
    const flat = [
      { draftSectionId: 'a', position: 1, heading: 'One', depth: null },
      { draftSectionId: 'b', position: 2, heading: 'Two', depth: null },
    ];
    expect(outlineTree(flat).map((n) => n.draftSectionId)).toEqual(['a', 'b']);
  });
});
