import {
  DEVELOPMENTAL_MOVEMENTS,
  DEVELOPMENTAL_MOVEMENT_MEANINGS,
  mayCoexist,
} from '@/lib/writersStudio/workDevelopment';
import {
  observeTextExtent,
  manuscriptClaimMode,
  type WorkMaturity,
} from '@/lib/writersStudio/workMaturity';
import { nextMoveOptions } from '@/lib/writersStudio/writerNextMoves';

describe('Writer Studio developmental process law', () => {
  it('treats developmental movements as coexisting process qualities, not stages', () => {
    expect(DEVELOPMENTAL_MOVEMENTS).toEqual([
      'emerging',
      'gathering',
      'differentiating',
      'organizing',
      'deepening',
      'integrating',
      'refining',
      'releasing',
    ]);
    expect(mayCoexist('organizing', 'deepening')).toBe(true);
    expect(mayCoexist('integrating', 'refining')).toBe(true);
    expect(DEVELOPMENTAL_MOVEMENT_MEANINGS.releasing).not.toMatch(/final|complete|finished/i);
  });

  it('keeps observed textual extent separate from writer-declared manuscript state', () => {
    const observed = observeTextExtent([
      { draftSectionId: 's1', body: 'A'.repeat(50_000) },
    ]);
    expect(observed.observedExtent).toBe('substantial');

    const maturity: WorkMaturity = {
      ...observed,
      declaredState: 'partial-manuscript',
    };
    expect(manuscriptClaimMode(maturity)).toBe('existing-text-only');
  });

  it('offers process-sensitive options without auto-commissioning them', () => {
    const options = nextMoveOptions('existing-manuscript', 'chapter', 'integrating');
    expect(options[0]?.description).toContain('integrating');
    expect(options.every((x) => x.requiresWriterGesture)).toBe(true);
  });
});
