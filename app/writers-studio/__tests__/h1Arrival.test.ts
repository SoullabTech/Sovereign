/**
 * H1-COHORT-GATE-01 · the four live semantics, as FINAL behaviour.
 *
 *   admitted       + work=A → A may govern arrival
 *   non-admitted   + work=A → exactly ordinary pre-H1 resolution
 *   unresolved     + work=A → exactly ordinary pre-H1 resolution
 *   admission fail + work=A → exactly ordinary pre-H1 resolution
 *
 * "Exactly" is asserted against the canon resolvers fed null — not merely that
 * the seam returned null — for every Studio reader shape (Home arrival and the
 * situated Work context used by Develop, Review and Write/Edit).
 */
import type { LivingWork } from '../useLivingWorks';
import {
  H1_UNRESOLVED, admittedStudioWorkParam, hasH1Authority, houseWritingHref, settleH1Admission,
  type H1Admission,
} from '../h1Arrival';
import { resolveSituatedWorkContext, resolveStudioArrival, studioArrivalFromHouse } from '../situatedWork';

const work = (id: string, manuscripts: string[]): LivingWork => ({
  id, title: `Work ${id}`, purpose: null, form: null, stage: null, manuscriptState: null,
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
  expressions: manuscripts.map((m) => ({ expressionType: 'manuscript', expressionId: m, declaredAt: '2026-09-01T00:00:00Z' })),
  materials: [],
} as LivingWork);

// M1 is declared by W1 and W2 (ambiguous without context); W3 has two manuscripts.
const W1 = work('w1', ['m1']);
const W2 = work('w2', ['m1', 'm2']);
const W3 = work('w3', ['m3', 'm4']);
const WORKS = [W1, W2, W3];
const HELD = ['m1', 'm2', 'm3', 'm4'].map((id) => ({ id, title: `Manuscript ${id}` }));

const home = (search: string, a: H1Admission) =>
  resolveStudioArrival('ready', WORKS, 'ready', HELD, admittedStudioWorkParam(search, a));
const situated = (search: string, a: H1Admission) =>
  resolveSituatedWorkContext('ready', WORKS, new URLSearchParams(search).get('m'), admittedStudioWorkParam(search, a));
const preH1Home = () => resolveStudioArrival('ready', WORKS, 'ready', HELD, null);
const preH1Situated = (search: string) =>
  resolveSituatedWorkContext('ready', WORKS, new URLSearchParams(search).get('m'), null);

const ADMITTED = settleH1Admission({ kind: 'response', ok: true, body: { admitted: true } });
const NOT_ADMITTED = settleH1Admission({ kind: 'response', ok: true, body: { admitted: false } });
const FAILURES: Array<[string, H1Admission]> = [
  ['network failure / timeout', settleH1Admission({ kind: 'failed' })],
  ['401', settleH1Admission({ kind: 'response', ok: false, body: { admitted: false } })],
  ['500 carrying an admitting body', settleH1Admission({ kind: 'response', ok: false, body: { admitted: true } })],
  ['malformed body', settleH1Admission({ kind: 'response', ok: true, body: { admitted: 'true' } })],
  ['empty body', settleH1Admission({ kind: 'response', ok: true, body: null })],
];

const HOME_A = '?from=house&work=w3';
const SITUATED_A = '?mode=develop&m=m1&work=w2';

describe('admitted + work=A → A governs arrival', () => {
  it('Home: the Work governs (multi-manuscript Work → member choice, #1538)', () => {
    const r = home(HOME_A, ADMITTED);
    expect(r.kind).toBe('several');
    expect(r).not.toEqual(preH1Home()); // non-vacuous
  });
  it('Develop / Review / Write: explicit member context', () => {
    const r = situated(SITUATED_A, ADMITTED);
    expect(r).toEqual({ kind: 'work', work: W2, authority: 'member_explicit' });
    expect(preH1Situated(SITUATED_A).kind).toBe('ambiguous'); // non-vacuous
  });
  it('an invalid claim still falls through to canon, even when admitted', () => {
    expect(situated('?m=m1&work=w3', ADMITTED)).toEqual(preH1Situated('?m=m1'));
  });
});

describe.each<[string, H1Admission]>([
  ['non-admitted', NOT_ADMITTED],
  ['unresolved', H1_UNRESOLVED],
  ...FAILURES.map(([l, a]): [string, H1Admission] => [`admission failure (${l})`, a]),
])('%s + work=A → exactly ordinary pre-H1 resolution', (_label, admission) => {
  it('has no H1 authority', () => {
    expect(hasH1Authority(admission)).toBe(false);
  });
  it('Home resolves exactly as without work=', () => {
    expect(home(HOME_A, admission)).toEqual(preH1Home());
    expect(home(HOME_A, admission)).toEqual(home('?from=house', admission));
  });
  it('Develop / Review / Write resolve exactly as without work=', () => {
    expect(situated(SITUATED_A, admission)).toEqual(preH1Situated(SITUATED_A));
    expect(situated(SITUATED_A, admission)).toEqual(situated('?mode=develop&m=m1', admission));
  });
});

describe('the seam', () => {
  it('a hand-built "admitted but unresolved" state has no authority', () => {
    expect(admittedStudioWorkParam('?work=w1', { admitted: true, resolved: false })).toBeNull();
  });
  it('never rewrites or reads anything but work=', () => {
    expect(admittedStudioWorkParam('?work=%20', ADMITTED)).toBeNull();
    expect(admittedStudioWorkParam(new URLSearchParams('work=w1&m=m1'), ADMITTED)).toBe('w1');
  });
});

describe('House doorway', () => {
  it('admitted: the governed arrival, or the House-origin link with no living Work', () => {
    expect(houseWritingHref(true, 'w1', studioArrivalFromHouse)).toBe(studioArrivalFromHouse('w1'));
    expect(houseWritingHref(true, null, studioArrivalFromHouse)).toBe('/writers-studio?from=house');
  });
  it('not admitted: exactly the ordinary crossing — no from=house, no work=', () => {
    expect(houseWritingHref(false, 'w1', studioArrivalFromHouse)).toBe('/writers-studio');
    expect(houseWritingHref(false, null, studioArrivalFromHouse)).toBe('/writers-studio');
  });
});
