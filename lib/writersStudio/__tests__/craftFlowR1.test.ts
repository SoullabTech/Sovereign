import { adjacentCraftTarget, paragraphTargets, parseCraftCanvasCommand } from '../craftFocusR1';
import { detectCraftRereadIntent } from '../craftScopeR1';
import { appendCraftDialogue } from '../craftDialogueR1';
import type { RebuildSection } from '../rebuild/model';

const sections: RebuildSection[] = [
  { draftSectionId: 'fire', sourceSectionId: null, position: 0, heading: 'Fire', headingDepth: 2, headingSignal: null, editable: true, body: 'Fire begins.\n\nFire then moves into Amplifying.\n\nFire returns to ordinary life.' },
  { draftSectionId: 'water', sourceSectionId: null, position: 1, heading: 'Water', headingDepth: 2, headingSignal: null, editable: true, body: 'Water begins with Being.\n\nWater moves into Balancing.' },
];
const targets = paragraphTargets(sections, id => sections.find(s => s.draftSectionId === id)!.body, 2);

describe('Craft flow across the manuscript, not repeated work on one locus', () => {
  it('moves between paragraphs and crosses Fire to Water in manuscript order', () => {
    expect(adjacentCraftTarget(targets, targets[1]!, 'next')).toEqual(targets[2]);
    expect(adjacentCraftTarget(targets, targets[2]!, 'next')).toEqual(targets[3]);
    expect(adjacentCraftTarget(targets, targets[3]!, 'previous')).toEqual(targets[2]);
  });
  it('moves past a partial selection and a whole-section focus without looping inside it', () => {
    expect(adjacentCraftTarget(targets, { ...targets[1]!, start: targets[1]!.start + 3, end: targets[1]!.end - 2 }, 'next')).toEqual(targets[2]);
    expect(adjacentCraftTarget(targets, { ...targets[0]!, end: sections[0]!.body.length }, 'next')).toEqual(targets[3]);
    expect(adjacentCraftTarget(targets, targets[0]!, 'next', 'section')).toEqual(targets[3]);
  });
  it('stops truthfully at chapter boundaries and unknown targets', () => {
    expect(adjacentCraftTarget(targets, targets[0]!, 'previous')).toBeNull();
    expect(adjacentCraftTarget(targets, targets.at(-1)!, 'next')).toBeNull();
    expect(adjacentCraftTarget(targets, { ...targets[0]!, sectionId: 'missing' }, 'next')).toBeNull();
  });
  it.each(['Next passage.', 'Move us to the next paragraph.', 'Go to the next passage.'])('recognizes the explicit navigation command %s', request => {
    expect(parseCraftCanvasCommand(request)).toEqual({ kind: 'step', direction: 'next', unit: 'passage' });
  });
  it('does not execute hypothetical next commands', () => {
    expect(parseCraftCanvasCommand('Should we move to the next paragraph?')).toBeNull();
    expect(parseCraftCanvasCommand('Do not move to the next paragraph.')).toBeNull();
  });
  it.each([
    'find other areas of the chapter that need attention.',
    'Please identify another passage in this chapter to work on.',
    'Show me the next section of the chapter that needs attention.',
  ])('commissions the requested chapter attention read for %s', request => {
    expect(detectCraftRereadIntent(request)).toEqual({ zoom: 'chapter', lens: 'reader', explicit: true });
  });
  it.each([
    'Do not find other areas of the chapter.',
    'Should we find other areas of the chapter?',
    'She said "find other areas of the chapter".',
    'Find other areas of the chapter later.',
    'Find other areas of the chapter if I approve.',
    'Explain how to find other areas of the chapter.',
  ])('does not commission discussion, deferral or conditional readings: %s', request => {
    expect(detectCraftRereadIntent(request)).toBeNull();
  });
  it('collapses only identical adjacent action receipts', () => {
    const old = [{ key: 'a', speaker: 'action' as const, body: 'Working copy updated.' }];
    expect(appendCraftDialogue(old, { key: 'b', speaker: 'action', body: old[0]!.body })).toBe(old);
    expect(appendCraftDialogue(old, { key: 'b', speaker: 'writer', body: old[0]!.body })).toHaveLength(2);
  });
});
