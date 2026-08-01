import { shellIdentity } from '../shellIdentity';
import { arrivalWork, type LivingWork } from '../useLivingWorks';

/**
 * The room's single answer, as a table.
 *
 * The defect this guards against is not a crash — it is the shell and the
 * page saying different things about what this place is. So the cases are
 * driven through `arrivalWork`, the same function Studio Home uses, rather
 * than through hand-built work objects: if that rule ever changes, these
 * expectations move with it instead of silently disagreeing.
 */

const work = (id: string, title: string | null): LivingWork => ({
  id,
  title,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
});

const identityFor = (
  worksPhase: Parameters<typeof arrivalWork>[0],
  works: LivingWork[],
  manuscriptTitle?: string | null,
) =>
  shellIdentity({
    worksPhase,
    workCount: works.length,
    work: arrivalWork(worksPhase, works),
    manuscriptTitle,
  });

describe('shellIdentity', () => {
  it('says nothing until the works read settles', () => {
    // Not the manuscript in the meantime: the rail would name the book and
    // then take it back on every single arrival.
    expect(identityFor('loading', [], 'The Long Book')).toEqual({ kind: 'held' });
  });

  it('takes a single named work as the shell identity', () => {
    expect(identityFor('ready', [work('w1', 'Elemental Alchemy')], 'The Long Book')).toEqual({
      kind: 'work',
      label: 'Elemental Alchemy',
      named: true,
    });
  });

  it('orients toward an unnamed work without inventing a name for it', () => {
    const identity = identityFor('ready', [work('w1', null)], 'The Long Book');
    expect(identity).toEqual({ kind: 'work', label: 'Your work', named: false });
  });

  it('preserves the manuscript identity when no work is declared', () => {
    expect(identityFor('ready', [], 'The Long Book')).toEqual({
      kind: 'manuscript',
      label: 'The Long Book',
    });
  });

  it('stays neutral with several works rather than picking one', () => {
    // Most-recent, first-made, and every other silent pick are answers to a
    // question this slice is not authorized to answer.
    const identity = identityFor(
      'ready',
      [work('w1', 'Elemental Alchemy'), work('w2', 'The Second One')],
      'The Long Book',
    );
    expect(identity).toEqual({ kind: 'neutral' });
  });

  it('does not fall back to the manuscript when several works exist', () => {
    // The fallback would re-assert exactly the identity this correction removes.
    expect(identityFor('ready', [work('w1', null), work('w2', null)], 'The Long Book').kind).toBe(
      'neutral',
    );
  });

  it('treats a failed read as unknown, not as an absence of works', () => {
    expect(identityFor('error', [], 'The Long Book')).toEqual({ kind: 'neutral' });
    expect(identityFor('unauthorized', [], 'The Long Book')).toEqual({ kind: 'neutral' });
  });

  it('leaves the empty Studio empty', () => {
    expect(identityFor('ready', [], null)).toEqual({ kind: 'neutral' });
    expect(identityFor('ready', [], undefined)).toEqual({ kind: 'neutral' });
  });

  it('never names both a work and a manuscript at once', () => {
    // The shell has one line. A work and its book appearing together in it
    // would read as containment, and nothing writes living_work_expressions.
    const identity = identityFor('ready', [work('w1', 'Elemental Alchemy')], 'The Long Book');
    expect(identity.kind).toBe('work');
    expect(JSON.stringify(identity)).not.toContain('The Long Book');
  });
});
