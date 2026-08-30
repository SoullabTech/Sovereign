import { diff } from '../myers';

/** This alignment is about to decide where a writer's chapters begin. It is
 *  tested before it is trusted, and every case is exact equality. */
type Ops = ReturnType<typeof diff>;
type EqOp = Extract<Ops[number], { type: 'eq' }>;

const apply = (a: string[], ops: Ops, b: string[]) => {
  const out: string[] = [];
  for (const op of ops) {
    if (op.type === 'eq') out.push(...a.slice(op.aStart, op.aEnd));
    else if (op.type === 'ins') out.push(...b.slice(op.bStart, op.bEnd));
  }
  return out;
};

describe('myers diff reconstructs the target exactly', () => {
  const cases: [string[], string[]][] = [
    [[], []],
    [['a'], []],
    [[], ['a']],
    [['a', 'b', 'c'], ['a', 'b', 'c']],
    [['a', 'b', 'c'], ['a', 'x', 'c']],
    [['a', 'b', 'c', 'd'], ['a', 'd']],
    [['a', 'd'], ['a', 'b', 'c', 'd']],
    [['x'], ['y']],
    [['a', 'b', 'a', 'b'], ['b', 'a', 'b', 'a']],
    [
      Array.from({ length: 200 }, (_, i) => `l${i}`),
      Array.from({ length: 200 }, (_, i) => (i === 7 || i === 150 ? `EDIT${i}` : `l${i}`)),
    ],
  ];

  cases.forEach(([a, b], i) => {
    it(`case ${i}`, () => {
      expect(apply(a, diff(a, b), b)).toEqual(b);
    });
  });

  it('keeps equal runs monotonic — the property boundary mapping depends on', () => {
    const a = Array.from({ length: 300 }, (_, i) => `l${i}`);
    const b = a.map((l, i) => (i % 50 === 0 ? `${l}!` : l));
    const eq = diff(a, b).filter((o): o is EqOp => o.type === 'eq');
    for (let i = 1; i < eq.length; i++) {
      expect(eq[i].aStart).toBeGreaterThanOrEqual(eq[i - 1].aEnd);
      expect(eq[i].bStart).toBeGreaterThanOrEqual(eq[i - 1].bEnd);
    }
  });

  it('scattered edits still leave the middle recoverable', () => {
    /* The exact failure Stage 1 had: edits near both ends. A line diff must
       keep the middle as unchanged runs instead of one giant changed span —
       this is the property that turns 171 ambiguous into a real number. */
    const a = Array.from({ length: 500 }, (_, i) => `line ${i}`);
    const b = [...a];
    b[3] = 'edited near the start';
    b[496] = 'edited near the end';
    const eq = diff(a, b).filter((o): o is EqOp => o.type === 'eq');
    const covered = eq.reduce((n, o) => n + (o.aEnd - o.aStart), 0);
    expect(covered).toBeGreaterThan(490);
  });
});
