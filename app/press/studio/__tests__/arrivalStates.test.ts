/**
 * Studio Home arrival — THREE states, not two.
 *
 * The defect this locks (found 2026-08-05 at deployed `f46a4fde4`, instrument
 * §0quater): Studio Home branched on `work ? … : …`, so `arrivalWork()`'s null
 * collapsed two opposite situations into one screen —
 *
 *     0 works  → nothing declared        → import threshold   ✅ correct
 *     2+ works → a living creative field → import threshold   🔴 wrong
 *
 * A practising author with several works lost "Start writing" entirely and was
 * told, in effect, to go finish something somewhere else first. The room opened
 * for a first-time writer and closed for a working one.
 *
 * ⛔ `arrivalWork()` was NOT the bug and must not be "fixed". Returning null for
 * 2+ works is correct: *"which of your works did you come back to?"* is a real
 * question and answering it by silent pick (most-recent, first-made, works[0])
 * is what both the original author and the founder ruling refused.
 *
 * FOUNDER PRINCIPLE (2026-08-05):
 *   **Uncertainty in the system must not become restriction on the writer.**
 *
 * The system may say "I know you are a writer, I know you have work, I don't
 * yet know which thread you want" — and still open the page.
 */
import { arrivalWork, type LivingWork, type LivingWorksPhase } from '../useLivingWorks';

const w = (id: string): LivingWork => ({
  id,
  title: null,
  createdAt: '2026-08-05T00:00:00Z',
  updatedAt: '2026-08-05T00:00:00Z',
});

/** The disambiguation Studio Home must perform on a null arrival work. */
type Arrival = 'import-threshold' | 'refounded' | 'several-works' | 'not-ready';

function arrivalState(phase: LivingWorksPhase, works: LivingWork[]): Arrival {
  if (phase !== 'ready') return 'not-ready';
  if (arrivalWork(phase, works)) return 'refounded';
  return works.length === 0 ? 'import-threshold' : 'several-works';
}

describe('arrivalWork — null is AMBIGUOUS by design', () => {
  it('re-founds the page on exactly one declared work', () => {
    expect(arrivalWork('ready', [w('a')])?.id).toBe('a');
  });

  it('returns null for several works — ⛔ never a silent pick', () => {
    expect(arrivalWork('ready', [w('a'), w('b')])).toBeNull();
    expect(arrivalWork('ready', [w('a'), w('b'), w('c')])).toBeNull();
  });

  it('returns null for no works', () => {
    expect(arrivalWork('ready', [])).toBeNull();
  });

  it('never picks works[0] when several exist — the regression to refuse', () => {
    const works = [w('a'), w('b')];
    expect(arrivalWork('ready', works)).not.toBe(works[0]);
  });

  it('a failed or signed-out read is not "no works declared"', () => {
    expect(arrivalWork('error', [w('a')])).toBeNull();
    expect(arrivalWork('unauthorized', [w('a')])).toBeNull();
    expect(arrivalWork('loading', [w('a')])).toBeNull();
  });
});

describe('Studio Home must disambiguate the null — three states', () => {
  it('0 works is the import threshold', () => {
    expect(arrivalState('ready', [])).toBe('import-threshold');
  });

  it('1 work re-founds the arrival', () => {
    expect(arrivalState('ready', [w('a')])).toBe('refounded');
  });

  it('🔴 2+ works is SEVERAL WORKS — ⛔ never the import threshold', () => {
    expect(arrivalState('ready', [w('a'), w('b')])).toBe('several-works');
    expect(arrivalState('ready', [w('a'), w('b'), w('c')])).toBe('several-works');
  });

  it('several works and no works are DIFFERENT states', () => {
    expect(arrivalState('ready', [w('a'), w('b')])).not.toBe(
      arrivalState('ready', []),
    );
  });

  it('every ready state offers a way to begin except the empty one', () => {
    // "Start writing" is present for 1 work and for 2+; only the true import
    // threshold (nothing declared) is import-first.
    for (const works of [[w('a')], [w('a'), w('b')], [w('a'), w('b'), w('c')]]) {
      expect(arrivalState('ready', works)).not.toBe('import-threshold');
    }
  });

  it('a not-ready read renders neither threshold', () => {
    expect(arrivalState('loading', [])).toBe('not-ready');
    expect(arrivalState('error', [w('a'), w('b')])).toBe('not-ready');
    expect(arrivalState('unauthorized', [])).toBe('not-ready');
  });
});
