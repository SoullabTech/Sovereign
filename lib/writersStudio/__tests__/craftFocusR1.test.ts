import {
  makeCraftTarget, craftTargetKey, targetStillMatches, paragraphTargets,
  referencedCraftTargets, parseCraftCanvasCommand, resolveNamedCraftTarget,
} from '../craftFocusR1';
import type { RebuildSection } from '../rebuild/model';

const body = 'Fire awakens. We notice a spark.\n\nFire then moves into Amplifying. We encounter other people and test an idea.\n\nFinally, Fire moves toward Actualizing.';
const section: RebuildSection = { draftSectionId: 'fire', sourceSectionId: null,
  heading: 'Fire', headingDepth: 2, headingSignal: null, position: 0, body, editable: true };

describe('Craft focus — exact targets, explicit gestures, no manuscript writes', () => {
  it('maps visible soft-wrapped text back to exact canonical code-point coordinates', () => {
    const t = makeCraftTarget(section, '🜂 Fire\nthen moves', '🜂 Fire then moves', 2, 'writer');
    expect(t).not.toBeNull();
    expect(t?.text).toBe('🜂 Fire\nthen moves');
    expect(t?.end).toBe(Array.from('🜂 Fire\nthen moves').length);
  });
  it('refuses ambiguous visible selections rather than silently using the first', () => {
    expect(makeCraftTarget(section, 'We notice.\n\nWe notice.', 'We notice.', 1, 'writer')).toBeNull();
  });
  it('rejects stale targets and revision drift before moving focus', () => {
    const t = makeCraftTarget(section, body, 'We notice a spark.', 1, 'writer')!;
    expect(targetStillMatches(t, body, 1)).toBe(true);
    expect(targetStillMatches(t, body.replace('notice', 'feel'), 1)).toBe(false);
    expect(targetStillMatches(t, body, 2)).toBe(false);
    expect(craftTargetKey(t)).not.toBe(craftTargetKey({ ...t, start: t.start + 1 }));
  });
  it('offers a referenced paragraph only when a literal quote identifies it uniquely', () => {
    const targets = paragraphTargets([section], () => body, 1);
    const refs = referencedCraftTargets(targets, 'Look at "We encounter other people and test an idea."');
    expect(refs).toHaveLength(1);
    expect(refs[0]?.label).toBe('Amplifying');
    expect(refs[0]?.text).toContain('Fire then moves into Amplifying.');
    expect(referencedCraftTargets(targets, 'There must be a more vivid paragraph somewhere.')).toEqual([]);
    const duplicate = { ...targets[1]!, sectionId: 'other' };
    expect(referencedCraftTargets([...targets, duplicate], 'Look at "We encounter other people and test an idea."')).toEqual([]);
  });
  it('can resolve a named paragraph but never treat multiple matches as one', () => {
    const targets = paragraphTargets([section], () => body, 1);
    expect(resolveNamedCraftTarget(targets, 'the Amplifying paragraph')?.label).toBe('Amplifying');
    expect(resolveNamedCraftTarget([...targets, { ...targets[1]!, sectionId: 'other' }], 'Amplifying')).toBeNull();
  });
  it('recognizes explicit keep, focus, preview and literal working-copy replacement gestures', () => {
    expect(parseCraftCanvasCommand('Keep “notice” and treat that choice as settled for this pass.')).toMatchObject({ kind: 'keep', word: 'notice' });
    expect(parseCraftCanvasCommand('Move us to the Amplifying paragraph.')).toMatchObject({ kind: 'focus', name: 'the Amplifying paragraph' });
    expect(parseCraftCanvasCommand('Stay here.')).toEqual({ kind: 'stay' });
    expect(parseCraftCanvasCommand('Show me the preview.')).toEqual({ kind: 'view', view: 'preview' });
    expect(parseCraftCanvasCommand('Replace “catch” with “notice” in my working copy.')).toMatchObject({ kind: 'replace', from: 'catch', to: 'notice' });
  });
  it.each([
    'Do not move to Amplifying.', 'Should we keep “notice”?', 'She said “Keep notice”.',
    'Keep “notice”?', 'Keep “notice” if it fits.', 'Keep “notice” only after I approve.',
    'Explain why we should keep “notice”.', 'Apply my version to the book.',
    'Delete the chapter.', 'If I say “Stay here”, what happens?',
  ])('does not execute discussion, negation, quotation or Apply: %s', request => {
    expect(parseCraftCanvasCommand(request)).toBeNull();
  });
});
