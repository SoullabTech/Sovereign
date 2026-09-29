import { nextMoveOptions } from '@/lib/writersStudio/writerNextMoves';

describe('Writer Studio choice membrane', () => {
  it('offers whole-work choices for an existing manuscript', () => {
    expect(nextMoveOptions('existing-manuscript', 'whole-work').map((x) => x.id)).toEqual([
      'whole-work-conversation',
      'see-attention-map',
      'explore-part-or-chapter',
      'trace-source-or-lineage',
      'something-else',
    ]);
  });

  it('keeps written and planned work distinct for a partial manuscript', () => {
    const options = nextMoveOptions('partial-manuscript', 'whole-work');
    expect(options.map((x) => x.id)).toContain('map-written-and-planned');
    expect(options.map((x) => x.id)).toContain('research-planned-area');
    expect(options.every((x) => x.requiresWriterGesture)).toBe(true);
  });

  it('does not pretend there is manuscript evidence before prose exists', () => {
    const ids = nextMoveOptions('pre-manuscript', 'whole-work').map((x) => x.id);
    expect(ids).toEqual([
      'explore-ideas-and-sources',
      'clarify-central-question',
      'sketch-possible-structure',
      'begin-writing',
      'something-else',
    ]);
    expect(ids).not.toContain('see-attention-map');
    expect(ids).not.toContain('develop-existing-text');
  });

  it('at local scales offers stay, descend, or another direction rather than auto-descending', () => {
    expect(nextMoveOptions('existing-manuscript', 'chapter').map((x) => x.id)).toEqual([
      'stay-at-this-scale',
      'descend-one-scale',
      'something-else',
    ]);
  });
});
