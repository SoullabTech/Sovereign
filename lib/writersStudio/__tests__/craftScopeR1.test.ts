import {
  craftReadingScope,
  craftZoomLabel,
  detectCraftRereadIntent,
} from '../craftScopeR1';
import type { RebuildSection } from '../rebuild/model';

const section = (
  id: string,
  heading: string,
  position: number,
  headingDepth: 1 | 2 | 3,
): RebuildSection => ({
  draftSectionId: id,
  sourceSectionId: id,
  position,
  heading,
  headingDepth,
  headingSignal: null,
  body: id + ' body',
  editable: true,
});

describe("Craftsman's Table governed zoom", () => {
  const sections = [
    section('chapter-1', 'Chapter 1: Beginning', 0, 1),
    section('c1-a', 'First movement', 1, 2),
    section('c1-b', 'Second movement', 2, 2),
    section('chapter-2', 'Chapter 2: Return', 3, 1),
    section('c2-a', 'Another movement', 4, 2),
  ];

  it('never widens an ordinary craft request by guess', () => {
    expect(detectCraftRereadIntent('Make this more embodied without over-writing it.')).toBeNull();
  });

  it('detects explicit whole-work scope and a named lens', () => {
    expect(detectCraftRereadIntent('Check this against the whole book arc.')).toEqual({
      zoom: 'whole',
      lens: 'arc',
      explicit: true,
    });
  });

  it('uses a broad multi-lens reread when scale is explicit but no lens is named', () => {
    expect(detectCraftRereadIntent('Look at this chapter as a whole before we decide.')).toEqual({
      zoom: 'chapter',
      lens: null,
      explicit: true,
    });
  });

  it('derives an exact chapter range from the authored manuscript topology', () => {
    expect(craftReadingScope('chapter', sections, 'c1-a')).toEqual({
      kind: 'range',
      fromSectionId: 'chapter-1',
      toSectionId: 'c1-b',
    });
  });

  it('keeps passage requests local to the editorial relationship', () => {
    expect(craftReadingScope('passage', sections, 'c1-a')).toBeNull();
    expect(craftZoomLabel('passage')).toBe('passage');
  });
});
