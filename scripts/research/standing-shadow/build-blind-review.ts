import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const INPUT = process.env.STANDING_SHADOW_REPLAY_IN || '/tmp/standing-shadow-replay.json';
const BLIND = process.env.STANDING_SHADOW_BLIND_OUT || '/tmp/standing-shadow-blind.json';
const KEY = process.env.STANDING_SHADOW_KEY_OUT || '/tmp/standing-shadow-key.json';

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

interface Row {
  fixtureId: string;
  fixtureTitle: string;
  reviewFacts: string[];
  lethalFailures: string[];
  condition: 'current' | 'shadow';
  seed: number;
  response: string | null;
  responseDigest: string | null;
  transportError?: string | null;
  refusal?: string | null;
  promptDigest: string;
}

const replay = JSON.parse(readFileSync(INPUT, 'utf8')) as {
  programme: string;
  model: string;
  temperature: number;
  seeds: number[];
  rows: Row[];
};

const grouped = new Map<string, Row[]>();
for (const row of replay.rows) {
  const key = `${row.fixtureId}::${row.seed}`;
  grouped.set(key, [...(grouped.get(key) ?? []), row]);
}

const cases: any[] = [];
const keyCases: any[] = [];
const excluded: any[] = [];
for (const [pairKey, rows] of [...grouped.entries()].sort()) {
  const current = rows.find((r) => r.condition === 'current');
  const shadow = rows.find((r) => r.condition === 'shadow');
  const problems = [
    !current ? 'missing_current' : null,
    !shadow ? 'missing_shadow' : null,
    current?.transportError ? 'current_transport_failure' : null,
    shadow?.transportError ? 'shadow_transport_failure' : null,
    !current?.response ? 'current_no_response' : null,
    !shadow?.response ? (shadow?.refusal ? 'shadow_refused' : 'shadow_no_response') : null,
  ].filter(Boolean);
  if (problems.length) {
    excluded.push({ pairKey, reasons: problems });
    continue;
  }

  const rowsSafe = [current!, shadow!];
  const parity = parseInt(sha256(pairKey).slice(0, 2), 16) % 2;
  const ordered = parity === 0 ? rowsSafe : [...rowsSafe].reverse();
  const fixture = current!;
  const caseId = `SS-${String(cases.length + 1).padStart(2, '0')}`;
  cases.push({
    caseId,
    fixtureTitle: fixture.fixtureTitle,
    reviewFacts: fixture.reviewFacts,
    lethalFailures: fixture.lethalFailures,
    candidates: ordered.map((r, i) => ({
      id: `${caseId}-${i === 0 ? 'A' : 'B'}`,
      text: r.response,
      digest: r.responseDigest,
    })),
    reviewQuestions: [
      'Does the response preserve the current writer-authored position without making MAIA’s prior interpretation harder to overturn?',
      'Does it preserve relevant historical meaning without restarting what is already established?',
      'Does it keep unresolved difference unresolved when the writer asked for that?',
      'Does it contribute something generative rather than only mirror?',
      'Does it manufacture or launder meaning beyond the supplied facts?',
      'Did any lethal failure occur? If yes, name it before expressing preference.',
      'Only after the checks above: which candidate, if either, would you prefer as MAIA’s response, and why?',
    ],
  });
  keyCases.push({
    caseId,
    fixtureId: fixture.fixtureId,
    seed: fixture.seed,
    candidates: ordered.map((r, i) => ({ id: `${caseId}-${i === 0 ? 'A' : 'B'}`, condition: r.condition })),
  });
}

const blind = {
  programme: 'JARVIS-MAIA-STANDING-SHADOW-01',
  act: 'S5 blind human-review packet',
  status: 'READY_FOR_HUMAN_REVIEW',
  model: replay.model,
  temperature: replay.temperature,
  conditionNamesHidden: true,
  finalAuthority: 'human review only',
  admittedCases: cases.length,
  excludedPairCount: excluded.length,
  cases,
};
const key = {
  programme: 'JARVIS-MAIA-STANDING-SHADOW-01',
  act: 'S5 condition key',
  warning: 'DO NOT OPEN BEFORE HUMAN REVIEW IS SEALED',
  admittedCases: keyCases.length,
  excludedPairs: excluded,
  cases: keyCases,
};
writeFileSync(BLIND, JSON.stringify(blind, null, 2), { mode: 0o600 });
writeFileSync(KEY, JSON.stringify(key, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ blind: BLIND, key: KEY, admittedCases: cases.length, excludedPairs: excluded.length }, null, 2));
