/**
 * BCS-01A · Step 3 — coverage falsification + uniformity trap.
 *
 * Partitioned execution must not be able to manufacture a recurrence observation
 * whose evidentiary coverage does not support its claim.
 */

import { admitRecurrence, type RecurrenceCandidate } from '../recurrenceAdmission';
import type { DevelopmentalCoverage } from '../../manuscript/development/readState';

const coverageOf = (
  body: readonly string[],
  position: readonly string[] = [],
): DevelopmentalCoverage => ({
  sections: {
    ...Object.fromEntries(body.map((s) => [s, 'body' as const])),
    ...Object.fromEntries(position.map((s) => [s, 'position' as const])),
  },
});

const at = (...ids: string[]) => ids.map((sectionId) => ({ sectionId }));

const SCOPE = ['s1', 's2', 's3', 's4'];

describe('W-COVERAGE · partial coverage may not become whole-scope recurrence', () => {
  const partial: RecurrenceCandidate = {
    commissionedScope: SCOPE,
    coverage: coverageOf(['s1', 's2']), // only half was actually read
    occurrences: at('s1', 's2'), // genuine local repetition
    extent: 'commissioned_scope',
  };

  it('refuses a commissioned-scope claim when the scope was not read', () => {
    expect(admitRecurrence(partial).verdict).toBe('PARTIAL_COVERAGE');
  });

  it('the refusal survives even though the completed portion does repeat', () => {
    const r = admitRecurrence(partial);
    expect(r.bodyRead).toEqual(['s1', 's2']); // the repetition is real
    expect(r.verdict).not.toBe('ADMISSIBLE'); // the whole-scope claim is not
  });

  it('LAWFUL NEIGHBOUR — the same evidence as a coverage-extent claim is not refused for coverage', () => {
    // Read three, found in two: coverage-extent claim, separated, not uniform.
    const local: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2', 's3']),
      occurrences: at('s1', 's3'),
      extent: 'coverage',
    };
    expect(admitRecurrence(local).verdict).toBe('ADMISSIBLE');
  });

  it('a commissioned-scope claim IS admissible once the whole scope was read', () => {
    const whole: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(SCOPE),
      occurrences: at('s1', 's3'),
      extent: 'commissioned_scope',
    };
    expect(admitRecurrence(whole).verdict).toBe('ADMISSIBLE');
  });
});

describe('W-COVERAGE-SOURCE · coverage comes from reads, never from bookkeeping', () => {
  it('a section known only by POSITION is not read — evidence there is outside coverage', () => {
    const c: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2'], ['s3']), // s3 scheduled/known, not read
      occurrences: at('s1', 's3'),
      extent: 'coverage',
    };
    expect(admitRecurrence(c).verdict).toBe('EVIDENCE_OUTSIDE_COVERAGE');
  });

  it('position-depth sections never enter bodyRead', () => {
    const r = admitRecurrence({
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2'], ['s3', 's4']),
      occurrences: at('s1', 's2'),
      extent: 'coverage',
    });
    expect(r.bodyRead).toEqual(['s1', 's2']);
  });

  it('a commissioned-scope claim is refused when the remainder is position-depth only', () => {
    const c: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2'], ['s3', 's4']),
      occurrences: at('s1', 's2'),
      extent: 'commissioned_scope',
    };
    expect(admitRecurrence(c).verdict).toBe('PARTIAL_COVERAGE');
  });
});

describe('W-UNIFORMITY · regularity is not recurrence', () => {
  it('X X X X — present in every unit read is REGULARITY, despite full coverage and separation', () => {
    const uniform: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(SCOPE),
      occurrences: at('s1', 's2', 's3', 's4'),
      extent: 'commissioned_scope',
    };
    const r = admitRecurrence(uniform);
    expect(r.verdict).toBe('REGULARITY');
    expect(r.verdict).not.toBe('ADMISSIBLE');
  });

  it('POSITIVE CONTROL — X . X . is candidate recurrence', () => {
    const alternating: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(SCOPE),
      occurrences: at('s1', 's3'),
      extent: 'commissioned_scope',
    };
    expect(admitRecurrence(alternating).verdict).toBe('ADMISSIBLE');
  });

  it('the three geometries are distinguished, so reject-everything cannot pass', () => {
    const verdictFor = (occ: string[], body: string[], extent: 'coverage' | 'commissioned_scope') =>
      admitRecurrence({
        commissionedScope: SCOPE,
        coverage: coverageOf(body),
        occurrences: at(...occ),
        extent,
      }).verdict;

    expect(verdictFor(['s1', 's2', 's3', 's4'], SCOPE, 'commissioned_scope')).toBe('REGULARITY');
    expect(verdictFor(['s1', 's3'], SCOPE, 'commissioned_scope')).toBe('ADMISSIBLE');
    expect(verdictFor(['s1', 's2'], ['s1', 's2'], 'commissioned_scope')).toBe('PARTIAL_COVERAGE');
  });
});

describe('W-TWO-UNIT · founder ruling 2026-09-13 — the pinned resolution boundary', () => {
  /**
   * HOLD THE LITERAL CONTRACT. Where exactly two units are read at body depth and
   * the claimed element occurs in both, the truthful verdict is REGULARITY.
   *
   * This does NOT establish that recurrence cannot exist across two units. It
   * establishes that the current evidence geometry — sectionId occurrences over
   * section × position|body coverage — cannot distinguish recurrence from the
   * ratified exclusion "a property holding uniformly across every unit read".
   *
   * An epistemic limit, not an ontological claim about the Work.
   *
   * PINNED so that a future "fix" cannot broaden the contract by treating
   * `>= 2 separated units` as sufficient. Its neighbouring positive control sits
   * directly below, keeping both predicates independently visible:
   * separation is necessary; non-uniformity is also necessary.
   */
  it('2 body-read units, element in both → REGULARITY', () => {
    expect(
      admitRecurrence({
        commissionedScope: SCOPE,
        coverage: coverageOf(['s1', 's2']),
        occurrences: at('s1', 's2'),
        extent: 'coverage',
      }).verdict,
    ).toBe('REGULARITY');
  });

  it('NEIGHBOURING POSITIVE CONTROL — 3 body-read units, element in two → ADMISSIBLE', () => {
    expect(
      admitRecurrence({
        commissionedScope: SCOPE,
        coverage: coverageOf(['s1', 's2', 's3']),
        occurrences: at('s1', 's3'),
        extent: 'coverage',
      }).verdict,
    ).toBe('ADMISSIBLE');
  });

  it('the numerical floor is a CONSEQUENCE of the representation, not phenomenon law', () => {
    // Same two occurrence units. Only the amount READ differs — which is exactly
    // what the ruling says the verdict turns on.
    const twoRead = admitRecurrence({
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's3']),
      occurrences: at('s1', 's3'),
      extent: 'coverage',
    });
    const threeRead = admitRecurrence({
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2', 's3']),
      occurrences: at('s1', 's3'),
      extent: 'coverage',
    });
    expect(twoRead.verdict).toBe('REGULARITY');
    expect(threeRead.verdict).toBe('ADMISSIBLE');
  });

  it('no third state exists to soften the refusal', () => {
    const verdict = admitRecurrence({
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2']),
      occurrences: at('s1', 's2'),
      extent: 'coverage',
    }).verdict;
    // POSSIBLE_RECURRENCE / LIKELY_RECURRENCE / RECURRENCE_PENDING are not verdicts.
    expect(['ADMISSIBLE', 'PARTIAL_COVERAGE', 'REGULARITY', 'INSUFFICIENT_SEPARATION', 'EVIDENCE_OUTSIDE_COVERAGE'])
      .toContain(verdict);
    expect(verdict).toBe('REGULARITY');
  });
});

describe('W-SEPARATION · two refs in an array are not two separated points', () => {
  it('two occurrences inside one covered unit are INSUFFICIENT_SEPARATION', () => {
    const sameUnit: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2', 's3']),
      occurrences: at('s1', 's1'), // two passages, one section
      extent: 'coverage',
    };
    expect(admitRecurrence(sameUnit).verdict).toBe('INSUFFICIENT_SEPARATION');
  });

  it('a single occurrence is INSUFFICIENT_SEPARATION', () => {
    expect(
      admitRecurrence({
        commissionedScope: SCOPE,
        coverage: coverageOf(['s1', 's2', 's3']),
        occurrences: at('s1'),
        extent: 'coverage',
      }).verdict,
    ).toBe('INSUFFICIENT_SEPARATION');
  });
});

describe('W-EVIDENCE-MEMBERSHIP · evidence must lie inside actual coverage', () => {
  it('an occurrence in commissioned scope but outside coverage is refused', () => {
    const c: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1', 's2']),
      occurrences: at('s1', 's3'), // s3 is in scope, but was never read
      extent: 'coverage',
    };
    expect(admitRecurrence(c).verdict).toBe('EVIDENCE_OUTSIDE_COVERAGE');
  });

  it('membership is checked before every other predicate', () => {
    // Also uniform and also a partial whole-scope claim — membership still wins,
    // so the refusal names the right reason.
    const c: RecurrenceCandidate = {
      commissionedScope: SCOPE,
      coverage: coverageOf(['s1']),
      occurrences: at('s1', 's9'),
      extent: 'commissioned_scope',
    };
    expect(admitRecurrence(c).verdict).toBe('EVIDENCE_OUTSIDE_COVERAGE');
  });
});
