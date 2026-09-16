import assert from 'node:assert/strict';

type EvidenceClass = 'E1' | 'E2' | 'E3' | 'E4' | 'SYSTEM';
type Author = 'member' | 'maia' | 'system';

type Candidate = {
  objectKey: string | null;
  sourceIndex: number;
  evidenceClass: EvidenceClass;
  sourceAuthor: Author;
  anchorAuthor: Author;
  evidenceAuthor: Author;
  evidenceIndices: number[];
  systemScore?: number;
};

type Case = {
  id: string;
  candidates: Candidate[];
  expected: number[];
};

const authority: Record<'E1' | 'E2' | 'E3', number> = {
  E1: 1,
  E2: 2,
  E3: 3,
};

function lawful(c: Candidate): c is Candidate & { evidenceClass: 'E1' | 'E2' | 'E3'; objectKey: string } {
  return c.objectKey !== null &&
    c.sourceAuthor === 'member' &&
    c.anchorAuthor === 'member' &&
    c.evidenceAuthor === 'member' &&
    c.evidenceClass in authority;
}function referenceLaw(candidates: Candidate[]): number[] {
  const admitted = candidates.filter(lawful);
  if (admitted.length === 0) return [];

  const strongest = Math.min(...admitted.map((c) => authority[c.evidenceClass]));
  const top = admitted.filter((c) => authority[c.evidenceClass] === strongest);
  const byObject = new Map<string, Candidate[]>();

  for (const c of top) {
    const key = c.objectKey.toLowerCase();
    byObject.set(key, [...(byObject.get(key) ?? []), c]);
  }

  if (byObject.size !== 1) return [];
  const only = [...byObject.values()][0];
  const sources = [...new Set(only.map((c) => c.sourceIndex))].sort((a, b) => a - b);
  return sources.length === 1 ? sources : [sources[0]];
}

const m = (
  objectKey: string | null,
  sourceIndex: number,
  evidenceClass: EvidenceClass,
  evidenceIndices: number[],
  extra: Partial<Candidate> = {},
): Candidate => ({
  objectKey, sourceIndex, evidenceClass, evidenceIndices,
  sourceAuthor: 'member', anchorAuthor: 'member', evidenceAuthor: 'member',
  ...extra,
});const cases: Case[] = [
  {
    id: 'P1 E2 silver cedar first ask',
    candidates: [m('silver cedar', 0, 'E2', [0])],
    expected: [0],
  },
  {
    id: 'P2 E1 outranks E2 competitor',
    candidates: [
      m('blue lantern', 2, 'E1', [2]),
      m('silver cedar', 0, 'E2', [0]),
    ],
    expected: [2],
  },
  {
    id: 'P3 E3 member recurrence',
    candidates: [m('winter orchard', 1, 'E3', [1, 4])],
    expected: [1],
  },
  {
    id: 'N1 assistant-only recurrence',
    candidates: [m('amber willow', 0, 'E3', [0, 4], { evidenceAuthor: 'maia' })],
    expected: [],
  },
  {
    id: 'N2 distinctive one-off is E4 only',
    candidates: [m('glass river', 0, 'E4', [0])],
    expected: [],
  },  {
    id: 'N3 system significance cannot admit',
    candidates: [m('violet gate', 0, 'SYSTEM', [0], {
      evidenceAuthor: 'system', systemScore: 0.95,
    })],
    expected: [],
  },
  {
    id: 'N4 two E2 objects are ambiguous',
    candidates: [
      m('silver cedar', 0, 'E2', [0]),
      m('blue cathedral', 3, 'E2', [3]),
    ],
    expected: [],
  },
  {
    id: 'N5 two E1 objects are ambiguous',
    candidates: [
      m('red thread', 1, 'E1', [1]),
      m('green door', 5, 'E1', [5]),
    ],
    expected: [],
  },
  {
    id: 'N6 persistence without object anchor',
    candidates: [m(null, 0, 'E2', [0])],
    expected: [],
  },
  {
    id: 'N7 assistant-authored anchor cannot qualify',
    candidates: [m('silver cedar', 0, 'E2', [0], { anchorAuthor: 'maia' })],
    expected: [],
  },
];type Rule = (candidates: Candidate[]) => number[];

function same(a: number[], b: number[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

for (const c of cases) {
  const got = referenceLaw(c.candidates);
  assert.deepEqual(got, c.expected, `${c.id}: reference law`);
  console.log(`✅ ${c.id} → [${got.join(',')}]`);
}

const mutants: Record<string, Rule> = {
  'always-abstain': () => [],

  'distinctiveness-is-eligibility': (xs) => {
    const expanded = xs.map((c) => c.evidenceClass === 'E4'
      ? { ...c, evidenceClass: 'E3' as const }
      : c);
    return referenceLaw(expanded);
  },

  'assistant-recurrence-counts': (xs) =>
    referenceLaw(xs.map((c) => ({ ...c, evidenceAuthor: 'member' as const }))),

  'assistant-anchor-counts': (xs) =>
    referenceLaw(xs.map((c) => ({ ...c, anchorAuthor: 'member' as const }))),

  'system-significance-admits': (xs) =>
    referenceLaw(xs.map((c) => c.evidenceClass === 'SYSTEM' && (c.systemScore ?? 0) >= 0.9
      ? { ...c, evidenceClass: 'E2' as const, evidenceAuthor: 'member' as const }
      : c)),
};function strongestTop(xs: Candidate[]): Candidate[] {
  const admitted = xs.filter(lawful);
  if (!admitted.length) return [];
  const strongest = Math.min(...admitted.map((c) => authority[c.evidenceClass]));
  return admitted.filter((c) => authority[c.evidenceClass] === strongest);
}

mutants['newest-breaks-ambiguity'] = (xs) => {
  const top = strongestTop(xs);
  if (!top.length) return [];
  return [top.reduce((a, b) => a.sourceIndex > b.sourceIndex ? a : b).sourceIndex];
};

mutants['oldest-breaks-ambiguity'] = (xs) => {
  const top = strongestTop(xs);
  if (!top.length) return [];
  return [top.reduce((a, b) => a.sourceIndex < b.sourceIndex ? a : b).sourceIndex];
};

mutants['explicit-only'] = (xs) =>
  referenceLaw(xs.filter((c) => c.evidenceClass === 'E1'));

mutants['no-authority-precedence'] = (xs) => {
  const admitted = xs.filter(lawful);
  const objects = new Set(admitted.map((c) => c.objectKey.toLowerCase()));
  if (objects.size !== 1) return [];
  return admitted.length ? [admitted[0].sourceIndex] : [];
};

for (const [name, rule] of Object.entries(mutants)) {
  const killedBy = cases.filter((c) => !same(rule(c.candidates), c.expected)).map((c) => c.id);
  assert.ok(killedBy.length > 0, `${name} survived the acceptance set`);
  console.log(`☠️ ${name} killed by ${killedBy.join(' | ')}`);
}

console.log(`\nFIRST-ASK-OPAQUE ACT3: ${cases.length}/${cases.length} reference oracles green; ${Object.keys(mutants).length}/${Object.keys(mutants).length} defeat candidates killed.`);