import { readFileSync, writeFileSync } from 'node:fs';
import { STANDING_SHADOW_FIXTURES } from '../standing-shadow/fixtures';

const INPUT = process.env.INVISIBLE_STANDING_HYBRID_INPUT || 'docs/programme/evidence/INVISIBLE_STANDING_I5_SIDECAR_V3_2026-09-16.json';
const OUTPUT = process.env.INVISIBLE_STANDING_HYBRID_OUT || '/tmp/invisible-standing-hybrid.json';

const STOP = new Set('that this with from your have been were what into about like just does will would could should there their they them then than when where which while also more much very really still only some same take make made being because around between through without again'.split(' '));
const tokens = (text: string): Set<string> => {
  const matched: string[] = text.toLowerCase().match(/[a-z][a-z'-]+/g) ?? [];
  return new Set(matched.filter((x: string) => x.length >= 4 && !STOP.has(x)));
};
const lexicalScore = (sentence: string, evidence: string): number => {
  const a = tokens(sentence); const b = tokens(evidence);
  if (a.size === 0) return 0;
  return [...a].filter((t) => b.has(t)).length / a.size;
};

const ANCHOR: Record<string, RegExp> = {
  correction: /grief|autonomy/i,
  'partial-adoption': /endurance.*silence|silence.*endurance/i,
  reversal: /shift|help|support|receive/i,
  'long-distance-recurrence': /cedar/i,
  'unresolved-contradiction': /tension|multiple truths|both/i,
  'maia-was-wrong': /repetition|deliberate|rhythm/i,
};

const sidecar = JSON.parse(readFileSync(INPUT, 'utf8')) as any;
const rows: any[] = [];
for (const row of sidecar.rows) {
  const fixture = STANDING_SHADOW_FIXTURES.find((f) => f.id === row.fixtureId)!;
  const anchor = row.deterministicSentenceMap.find((s: any) => ANCHOR[row.fixtureId].test(s.text)) ?? row.deterministicSentenceMap[0];
  const presentId = `U:${row.fixtureId}`;
  const evidence = [
    { id: presentId, text: fixture.userInput },
    ...fixture.candidates.map((c, i) => ({ id: `C${i + 1}:${c.producerId}`, text: c.text })),
  ];
  const scores = evidence.map((e) => ({ id: e.id, score: lexicalScore(anchor.text, e.text) }));
  const presentScore = scores.find((x) => x.id === presentId)!.score;
  const bestOther = Math.max(...scores.filter((x) => x.id !== presentId).map((x) => x.score), 0);
  const lexicalPresentCandidate = presentScore > 0 && presentScore > bestOther;
  const sidecarLink = row.links.find((x: any) => x.sentenceId === anchor.id);
  const sidecarIds: string[] = sidecarLink?.candidateEvidenceIds ?? [];
  const hybridIds = [...new Set([...sidecarIds, ...(lexicalPresentCandidate ? [presentId] : [])])];
  const sidecarHasPresent = sidecarIds.includes(presentId);
  const hybridHasPresent = hybridIds.includes(presentId);
  rows.push({
    caseId: row.caseId, fixtureId: row.fixtureId, anchorSentenceId: anchor.id, anchorText: anchor.text,
    sidecarIds, presentScore, bestOtherScore: bestOther, lexicalPresentCandidate,
    hybridIds, sidecarHasPresent, hybridHasPresent,
  });
  console.log(`${row.caseId}: sidecar=${sidecarHasPresent} lexical_rescue=${lexicalPresentCandidate && !sidecarHasPresent} hybrid=${hybridHasPresent}`);
}
const result = {
  programme: 'JARVIS-MAIA-INVISIBLE-STANDING-01',
  act: 'I6 hybrid candidate-support benchmark',
  authority: 'NONE — discovery candidates only',
  cases: rows.length,
  sidecarAnchorCurrent: rows.filter((r) => r.sidecarHasPresent).length,
  lexicalRescues: rows.filter((r) => r.lexicalPresentCandidate && !r.sidecarHasPresent).length,
  hybridAnchorCurrent: rows.filter((r) => r.hybridHasPresent).length,
  rows,
};
writeFileSync(OUTPUT, JSON.stringify(result, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ output: OUTPUT, cases: result.cases, sidecarAnchorCurrent: result.sidecarAnchorCurrent, lexicalRescues: result.lexicalRescues, hybridAnchorCurrent: result.hybridAnchorCurrent }, null, 2));
