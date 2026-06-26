/**
 * The governing-uncertainty law, enforced over the real Field Lab registry.
 *
 * Executable form of docs/canon/THE_GOVERNING_UNCERTAINTY.md. Asserts (a) every
 * room on the shelf declares a valid governing uncertainty, and (b) the validator
 * actually catches each violation class — a room may not change phase without
 * declaring what it is leaving, what it is entering, and what evidence carries.
 *
 * jest toolchain is not installed in this environment; the runnable mirror is
 * scripts/repro/governing_uncertainty_proof.mts (node --experimental-strip-types).
 */
import type { Experiment } from '@/components/maia/field-lab/ExperimentCard';
import { EXPERIMENTS } from '@/lib/maia/fieldLab/experiments';
import {
  validateGoverningUncertainty,
  type GoverningUncertainty,
} from '@/lib/maia/fieldLab/governance';
import { partitionShelf, getShelfExperiments } from '@/lib/maia/fieldLab/shelf';

const brokenRoom = (): Experiment => ({
  slug: 'broken',
  name: 'Broken',
  oneLiner: '',
  status: [],
  exploring: '',
  phase: 'phase-1',
  governingUncertainty: { current: '', transitionState: 'admitted', admittedAt: 'nope', transitions: [] },
});

const admitted: GoverningUncertainty = {
  current: 'Does this surface reveal member pull without persistence?',
  transitionState: 'admitted',
  admittedAt: '2026-05-22',
  transitions: [],
};

const dwelling: GoverningUncertainty = {
  current: 'Can this surface persist anything without representing non-consenting third parties?',
  transitionState: 'dwelling',
  admittedAt: '2026-05-22',
  dwellBlocker: { type: 'architectural', description: 'persistence layer not yet built' },
  transitions: [
    {
      leaving: 'Does this surface reveal member pull without persistence?',
      entering: 'Can this surface persist anything without representing non-consenting third parties?',
      enteringState: 'dwelling',
      evidenceCarry: {
        carries: 'Member pull may carry.',
        mustBeNewlyProven: 'Persistence safety cannot carry; it must be newly proven.',
      },
      basis: 'U1 resolved across observed walks.',
      declaredAt: '2026-07-01',
    },
  ],
};

describe('the registry obeys the governing-uncertainty law', () => {
  it.each(EXPERIMENTS)('%s declares a valid governing uncertainty', (exp) => {
    expect(validateGoverningUncertainty(exp.slug, exp.governingUncertainty)).toEqual([]);
  });
});

describe('valid fixtures pass', () => {
  it('an admitted room with no transitions is valid', () => {
    expect(validateGoverningUncertainty('admitted', admitted)).toEqual([]);
  });
  it('a dwelling room with a declared pass and a named blocker is valid', () => {
    expect(validateGoverningUncertainty('dwelling', dwelling)).toEqual([]);
  });
});

describe('the validator enforces each invariant', () => {
  const has = (vs: string[], re: RegExp) => vs.some((s) => re.test(s));

  it('I1 — rejects an empty current uncertainty', () => {
    const vs = validateGoverningUncertainty('x', { ...admitted, current: '   ' });
    expect(has(vs, /current.*empty/i)).toBe(true);
  });

  it('I2 — rejects a non-admitted state with no declared pass', () => {
    const vs = validateGoverningUncertainty('x', { ...admitted, transitionState: 'graduated' });
    expect(has(vs, /no transition has been declared/i)).toBe(true);
  });

  it('I2 — rejects current that does not match the last declared pass', () => {
    const vs = validateGoverningUncertainty('x', { ...dwelling, current: 'a different question' });
    expect(has(vs, /does not match the last declared transition/i)).toBe(true);
  });

  it('I3 — rejects dwelling without a named blocker', () => {
    const vs = validateGoverningUncertainty('x', { ...dwelling, dwellBlocker: undefined });
    expect(has(vs, /must name its blocker/i)).toBe(true);
  });

  it('I3 — rejects a blocker while not dwelling', () => {
    const vs = validateGoverningUncertainty('x', {
      ...admitted,
      dwellBlocker: { type: 'governance', description: 'x' },
    });
    expect(has(vs, /only legal while dwelling/i)).toBe(true);
  });

  it('I4 — rejects a pass that does not declare carry-forward', () => {
    const vs = validateGoverningUncertainty('x', {
      ...dwelling,
      transitions: [
        { ...dwelling.transitions[0], evidenceCarry: { carries: 'pull', mustBeNewlyProven: '' } },
      ],
    });
    expect(has(vs, /MUST BE NEWLY PROVEN/i)).toBe(true);
  });

  it('I5 — rejects a non-ISO admittedAt', () => {
    const vs = validateGoverningUncertainty('x', { ...admitted, admittedAt: 'May 2026' });
    expect(has(vs, /admittedAt is not an ISO date/i)).toBe(true);
  });

  it('I6 — rejects a declaration dated before admission', () => {
    const vs = validateGoverningUncertainty('x', {
      ...dwelling,
      transitions: [{ ...dwelling.transitions[0], declaredAt: '2026-01-01' }],
    });
    expect(has(vs, /before a prior declaration or admittedAt/i)).toBe(true);
  });
});

describe('the shelf excludes falsely-governed rooms', () => {
  it('the real registry has no invalid rooms', () => {
    expect(partitionShelf().invalid).toEqual([]);
  });

  it('partitionShelf separates an invalid room from the valid ones', () => {
    const { valid, invalid } = partitionShelf([brokenRoom()]);
    expect(valid).toEqual([]);
    expect(invalid[0].slug).toBe('broken');
    expect(invalid[0].violations.length).toBeGreaterThan(0);
  });

  it('getShelfExperiments returns every valid room from the real registry', () => {
    expect(getShelfExperiments().map((e) => e.slug)).toEqual(EXPERIMENTS.map((e) => e.slug));
  });

  it('getShelfExperiments throws on an invalid room outside production', () => {
    expect(() => getShelfExperiments([brokenRoom()])).toThrow(/invalid governing uncertainty/i);
  });
});
