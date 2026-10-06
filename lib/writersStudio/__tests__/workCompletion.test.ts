import { workCompletion, type CompletionDimension } from '../workCompletion';

const dims = (overrides: Partial<Record<CompletionDimension['id'], CompletionDimension['standing']>> = {}): CompletionDimension[] => (
  ['editorial-integrity','continuity','recovery','source-provenance','permissions-rights','page-proof','front-back-matter','publication-target'] as const
).map((id) => ({ id, standing: overrides[id] ?? 'clear' }));

describe('Ready the Work', () => {
  it('distinguishes publication ready from review-copy ready', () => {
    expect(workCompletion(dims()).state).toBe('PUBLICATION_READY');
    expect(workCompletion(dims({ 'publication-target': 'open' })).state).toBe('REVIEW_COPY_READY');
  });

  it('distinguishes editorially settled from review-copy ready', () => {
    expect(workCompletion(dims({ 'source-provenance': 'open' })).state).toBe('EDITORIALLY_SETTLED');
  });

  it('keeps a review copy ready while publication rights remain open', () => {
    expect(workCompletion(dims({ 'permissions-rights': 'open' })).state).toBe('REVIEW_COPY_READY');
  });

  it('does not treat not-run as green', () => {
    expect(workCompletion(dims({ recovery: 'not-run' })).state).toBe('IN_PROGRESS');
  });

  it('a blocker governs the whole state without erasing dimension truth', () => {
    const result = workCompletion(dims({ 'source-provenance': 'blocked' }));
    expect(result.state).toBe('BLOCKED');
    expect(result.blockers.map((x) => x.id)).toContain('source-provenance');
    expect(result.dimensions.find((x) => x.id === 'editorial-integrity')?.standing).toBe('clear');
  });
});
