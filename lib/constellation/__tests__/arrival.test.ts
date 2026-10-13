import { writerArrivalContext, writerStudioArrivalPath } from '../arrival';

describe('Writer’s Studio Constellation arrival continuity', () => {
  it('returns a recognized audience to the same Studio with temporary arrival context', () => {
    expect(writerStudioArrivalPath('wisdom-carrier')).toBe(
      '/writers-studio?arrival=doorway&campaign=writers-discover&audience=wisdom-carrier'
    );
  });

  it('does not preserve an unknown audience as a member identity claim', () => {
    expect(writerStudioArrivalPath('invented-persona')).toBe(
      '/writers-studio?arrival=doorway&campaign=writers-discover'
    );
  });

  it('uses audience context as an opening, not a permanent categorization', () => {
    const context = writerArrivalContext('existing-author');
    expect(context.audienceId).toBe('existing-author');
    expect(context.opening).toContain('work that already exists');
    expect(context.opening).not.toContain('You are an');
  });
});
