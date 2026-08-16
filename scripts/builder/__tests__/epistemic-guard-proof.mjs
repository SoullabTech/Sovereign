#!/usr/bin/env node
/**
 * Proof — epistemic guardrails (JARVIS epistemic enforcement unit).
 *
 * The primary regression case is TODAY'S CANONICAL-ROUTE MISTAKE (2026-08-11):
 * `app/api/sovereign/app/maia/route.ts` was classified as the canonical live route carrying
 * ~99.6% of traffic on the strength of (a) a self-describing code comment, (b) a project-memory
 * assertion, and (c) an `agent_runs.origin_route` aggregate whose label is set by a DEFAULT at
 * `lib/sovereign/maiaService.ts:3489`, not by the route that mattered. The rows were `/list`
 * traffic mislabelled by a defaulting telemetry field. Every assertion below that names
 * REGRESSION exists so that this specific reasoning path cannot be walked silently again.
 *
 * The guard never decides whether an assertion is TRUE. It decides whether the evidence cited
 * can carry the status requested — so these assertions read `verdict` and `guard` ids, never prose.
 */
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, '..', 'epistemic-guard.mjs');
const TMP = mkdtempSync(path.join(os.tmpdir(), 'ain-epistemic-proof-'));
const LEDGER = path.join(TMP, 'ledger.jsonl');

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail && !cond) console.log(`          ${detail}`);
};

const run = (args) => {
  try {
    const out = execFileSync('node', [GUARD, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? '').toString(), err: (e.stderr ?? '').toString() };
  }
};
const judge = (claim, extra = []) => {
  const r = run(['adjudicate', '--claim-json', JSON.stringify(claim), '--json', ...extra]);
  return { code: r.code, j: r.out ? JSON.parse(r.out) : null, raw: r.out, err: r.err };
};
const guards = (j) => (j?.refusals ?? []).map((x) => x.guard);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== REGRESSION — the 2026-08-11 canonical-route mistake is refused ===');
// ─────────────────────────────────────────────────────────────────────────────
const THE_MISTAKE = {
  id: 'claim-canonical-split',
  assertion: 'app/api/sovereign/app/maia is the canonical live route, carrying ~99.6% of live conversation traffic',
  subject: { kind: 'route', ref: 'app/api/sovereign/app/maia/route.ts' },
  status: 'PROVEN',
  proof: { proposition: 'the non-list route carries ~99.6% of conversation traffic', discriminates_against: 'the rows belong to /list' },
  evidence: [
    { kind: 'code_comment', ref: 'app/api/sovereign/app/maia/route.ts:353-356', detail: 'route asserts it carries ~99.6% of live conversation traffic' },
    { kind: 'project_memory', ref: 'prior session', detail: '3,388 vs 13 rows' },
    { kind: 'telemetry_label', ref: 'agent_runs.origin_route 30d', detail: '3,655 vs 10' },
  ],
};
{
  const { code, j } = judge(THE_MISTAKE);
  assert('REGRESSION: the claim as originally made is REFUSED', j.verdict === 'REFUSED' && code === 1, `verdict=${j.verdict} code=${code}`);
  assert('REGRESSION: G1 CANONICAL-PATH fires — no surface → request → runtime route was ever established',
    guards(j).includes('G1'), JSON.stringify(guards(j)));
  assert('REGRESSION: the telemetry aggregate is NON_PROBATIVE without a label-assignment proof',
    j.evidence_standing.find((e) => e.kind === 'telemetry_label')?.standing === 'NON_PROBATIVE',
    JSON.stringify(j.evidence_standing));
  assert('REGRESSION: the code comment is WEAK, not evidence about the running system',
    j.evidence_standing.find((e) => e.kind === 'code_comment')?.standing === 'WEAK');
  assert('REGRESSION: the refusal names the missing test, not just the failure',
    j.refusals.every((r) => typeof r.required_test === 'string' && r.required_test.length > 10));
}
{
  // The same claim after enumerating call sites — which is exactly what disconfirmed it.
  const withProvenance = JSON.parse(JSON.stringify(THE_MISTAKE));
  withProvenance.evidence[2].label_assignment_proof = {
    call_sites_enumerated: true,
    sets_dimension_explicitly: false,
    default_source: 'lib/sovereign/maiaService.ts:3489 — originRoute ?? "/api/sovereign/app/maia"',
  };
  const { j } = judge(withProvenance);
  assert('REGRESSION: proving the label DEFAULTS keeps it non-probative for the labelled route',
    j.evidence_standing.find((e) => e.kind === 'telemetry_label')?.standing === 'NON_PROBATIVE');
  assert('REGRESSION: the reason names the defaulting site so the reader can re-derive it',
    /3489/.test(j.evidence_standing.find((e) => e.kind === 'telemetry_label')?.reason ?? ''));
  assert('REGRESSION: the claim is still refused after the telemetry is understood', j.verdict === 'REFUSED');
}
{
  // The corrected claim — the one that was actually established.
  const CORRECTED = {
    id: 'claim-list-canonical',
    assertion: '/api/sovereign/app/maia/list is the canonical route the deployed UI calls for every MAIA chat turn',
    subject: { kind: 'route', ref: 'app/api/sovereign/app/maia/list/route.ts' },
    status: 'PROVEN',
    liveness_scope: 'deployed_exercised',
    proof: {
      proposition: 'the deployed member surface issues its chat turns to /list',
      discriminates_against: 'the non-list route carries the traffic (refuted: its label is a default, not an assignment)',
    },
    evidence: [
      {
        kind: 'runtime_route_trace',
        surface: 'app/maia/page.tsx:831 (+:1528, components/maia/presence/MaiaPresence.tsx:239)',
        request: 'POST /api/sovereign/app/maia/list',
        runtime_route: 'app/api/sovereign/app/maia/list/route.ts',
      },
      { kind: 'deployed_commit', sha: '04c6d6f03', detail: 'UI wiring present in the deployed commit' },
    ],
  };
  const { code, j } = judge(CORRECTED, ['--sha', '04c6d6f03']);
  assert('REGRESSION: the corrected claim, with a real runtime trace, is PERMITTED', j.verdict === 'PERMITTED' && code === 0,
    JSON.stringify(j.refusals));
  const stale = judge(CORRECTED, ['--sha', 'deadbeef']);
  assert('evidence pinned to another SHA goes STALE rather than passing silently',
    stale.j.evidence_standing.find((e) => e.kind === 'deployed_commit')?.standing === 'STALE');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G2 — endpoints are not an edge ===');
// ─────────────────────────────────────────────────────────────────────────────
const EDGE_CLAIM = {
  id: 'claim-ordering',
  assertion: 'both persistence endpoints passed, therefore turn ordering propagates from write to read',
  status: 'PROVEN',
  proof: { proposition: 'ordering survives the write→read path', discriminates_against: 'each side works but the pair is unordered' },
  edge: { from: 'write endpoint', to: 'read endpoint' },
  evidence: [
    { kind: 'endpoint_proof', endpoint: 'write endpoint' },
    { kind: 'endpoint_proof', endpoint: 'read endpoint' },
  ],
};
{
  const { j } = judge(EDGE_CLAIM);
  assert('two proven endpoints do NOT license the connection between them', j.verdict === 'REFUSED');
  assert('G2 EDGE-PROOF fires and names both endpoints', guards(j).includes('G2')
    && /write endpoint/.test(j.refusals.find((r) => r.guard === 'G2').why));
  const withEdge = { ...EDGE_CLAIM, evidence: [...EDGE_CLAIM.evidence, {
    kind: 'edge_trace', from: 'write endpoint', to: 'read endpoint',
    mechanism: 'exchange_id + seq, unique index',
    discriminating_observation: '28 rows / 14 exchanges, seq multiset {0,1} on every exchange, 0 duplicates',
  }] };
  assert('an edge_trace with a discriminating observation is accepted', judge(withEdge).j.verdict === 'PERMITTED');
  const wrongEdge = { ...EDGE_CLAIM, evidence: [{
    kind: 'edge_trace', from: 'write endpoint', to: 'a third endpoint',
    mechanism: 'x', discriminating_observation: 'y',
  }] };
  assert('an edge_trace between the wrong endpoints does not satisfy the claimed edge',
    judge(wrongEdge).j.verdict === 'REFUSED');
  const shapeless = { ...EDGE_CLAIM, evidence: [{ kind: 'edge_trace', from: 'a', to: 'b' }] };
  assert('an edge_trace missing mechanism/discriminating_observation is non-probative',
    judge(shapeless).j.verdict === 'REFUSED');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G4 — retrieval code is not an operational index ===');
// ─────────────────────────────────────────────────────────────────────────────
const IDX = {
  id: 'claim-semantic',
  assertion: 'semantic memory is operational — the vector search implementation is correct',
  subject: { kind: 'semantic_memory' },
  status: 'PROVEN',
  liveness_scope: 'deployed_exercised',
  proof: { proposition: 'a member reference resolves to a stored memory via similarity search', discriminates_against: 'the query runs but the corpus is empty' },
  evidence: [{ kind: 'architecture_doc', ref: 'SEMANTIC_MEMORY_SURFACEABILITY_DIAGNOSTIC.md' }],
};
{
  assert('implementation correctness alone cannot make semantic memory operational', judge(IDX).j.verdict === 'REFUSED');
  assert('G4 INDEX-LIVENESS fires', guards(judge(IDX).j).includes('G4'));
  const empty = { ...IDX, evidence: [{ kind: 'indexed_row_coverage', target: 'semantic_memory_vectors', indexed_rows: 0, total_rows: 39017 },
    { kind: 'known_retrieval', query: 'prior session reference', retrieved_ref: 'n/a' }] };
  assert('a zero-row index is refused even though coverage was reported', judge(empty).j.verdict === 'REFUSED');
  const coverageOnly = { ...IDX, evidence: [{ kind: 'indexed_row_coverage', target: 'semantic_memory_vectors', indexed_rows: 55760, total_rows: 55760 }] };
  assert('coverage without one known retrieval is still refused', judge(coverageOnly).j.verdict === 'REFUSED');
  const full = { ...IDX, evidence: [
    { kind: 'indexed_row_coverage', target: 'semantic_memory_vectors', indexed_rows: 55760, total_rows: 55760 },
    { kind: 'known_retrieval', query: 'member reference to a 40-turn-old exchange', retrieved_ref: 'turn 12,904' },
  ] };
  assert('coverage + one known retrieval is accepted', judge(full).j.verdict === 'PERMITTED', JSON.stringify(judge(full).j.refusals));
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G7 — "LIVE" must say which liveness it means (founder ruling 2026-08-09) ===');
// ─────────────────────────────────────────────────────────────────────────────
{
  const anchors = {
    id: 'claim-anchors', assertion: 'the Daily Anchor consent gate is live', status: 'OBSERVATION',
    evidence: [{ kind: 'db_query', query: 'select count(*) from member_daily_anchors', detail: '0 rows; schema present' }],
  };
  const { j } = judge(anchors);
  assert('an unqualified "is live" is refused', j.verdict === 'REFUSED' && guards(j).includes('G7'));
  assert('scoping it to deployed+exercised is accepted', judge({ ...anchors, liveness_scope: 'deployed_exercised' }).j.verdict === 'PERMITTED');
  const memberUse = { ...anchors, liveness_scope: 'in_use_by_members', evidence: [{ kind: 'architecture_doc', ref: 'CLAUDE.md' }] };
  assert('claiming member use with no production observation of member rows is refused',
    judge(memberUse).j.verdict === 'REFUSED');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G5 — statuses do not graduate silently ===');
// ─────────────────────────────────────────────────────────────────────────────
{
  const base = {
    id: 'claim-promo', assertion: 'the atoms loader surfaces marked atoms on the live turn path',
    liveness_scope: 'deployed_exercised',
    evidence: [{ kind: 'log_marker', marker: '[MAIA/sovereign] atoms loaded: 8' }],
  };
  const t = (args, claim = base) => {
    const r = run(['transition', '--claim-json', JSON.stringify(claim), '--ledger', LEDGER, '--json', ...args]);
    return { code: r.code, j: r.out ? JSON.parse(r.out) : null };
  };
  assert('HYPOTHESIS → OBSERVATION with runtime evidence is permitted', t(['--to', 'OBSERVATION']).j.verdict === 'PERMITTED');
  assert('re-asserting the SAME evidence one rung higher is refused — status cannot rise on rereading',
    t(['--to', 'PROVEN']).j.verdict === 'REFUSED');
  const proven = { ...base, proof: { proposition: 'marked atoms reach the prompt', discriminates_against: 'atoms load but are truncated before composition' },
    evidence: [...base.evidence, { kind: 'production_observation', ref: 'prompt block chars > 0 across 14 turns' }] };
  assert('the same promotion WITH new evidence and a discriminating proposition is permitted',
    t(['--to', 'PROVEN'], proven).j.verdict === 'PERMITTED');
  assert('OBSERVATION → INVARIANT (rung-skipping) is refused',
    t(['--to', 'INVARIANT'], { ...base, id: 'claim-skip' }).j.verdict === 'REFUSED');
  const invariant = { ...proven, evidence: [...proven.evidence, { kind: 'founder_ruling', ref: '2026-08-09 liveness vocabulary ruling' }] };
  assert('PROVEN → INVARIANT requires governance authority and is permitted with it',
    t(['--to', 'INVARIANT'], invariant).j.verdict === 'PERMITTED');
  assert('SUPERSEDED is terminal', t(['--to', 'PROVEN'], { ...proven, id: 'claim-dead', from: 'SUPERSEDED' }).j.verdict === 'REFUSED');
  const ledger = readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
  assert('every transition attempt is written to the ledger, refusals included',
    ledger.length >= 6 && ledger.some((r) => r.verdict === 'REFUSED') && ledger.some((r) => r.verdict === 'PERMITTED'),
    `ledger rows=${ledger.length}`);
  assert('the ledger records the SHA each transition was adjudicated at', ledger.every((r) => 'sha' in r));
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== G6 — correction anatomy, and doctrine stays candidate-only ===');
// ─────────────────────────────────────────────────────────────────────────────
const CORRECTION = {
  id: 'correction-canonical-route',
  corrects: 'claim-canonical-split',
  assertion: 'the 3,655 rows are /list traffic mislabelled by a defaulting telemetry field',
  status: 'CORRECTION',
  correction: {
    old_claim: 'the non-list route carries ~99.6% of live conversation traffic',
    why_we_believed_it: 'agent_runs aggregate 3,655 vs 10; the route file asserts it; project memory repeated it',
    disconfirming_evidence: '/list passes no originRoute; maiaService.ts:3489 defaults it to /api/sovereign/app/maia',
    corrected_claim: '/list is the canonical tester route; there is no canonical route split',
    general_failure_pattern: 'capability finding promoted to canonical-path claim without traffic proof; runtime telemetry trusted before proving where the label is set',
    candidate_recognition_rule: 'a runtime label is evidence about the labeller, not the labelled, until you prove where the label is assigned',
    future_test: 'before citing any telemetry-dimension aggregate, grep every call site of the emitting function and confirm which set the dimension explicitly',
  },
};
{
  const partial = JSON.parse(JSON.stringify(CORRECTION));
  delete partial.correction.candidate_recognition_rule;
  delete partial.correction.future_test;
  const r1 = run(['correction', '--claim-json', JSON.stringify(partial), '--ledger', LEDGER, '--json']);
  const j1 = JSON.parse(r1.out);
  assert('a correction missing the generalizing rungs is refused', j1.verdict === 'REFUSED' && guards(j1).includes('G6'));
  assert('the refusal names exactly which rungs are missing',
    /candidate_recognition_rule/.test(j1.refusals.find((r) => r.guard === 'G6').why));

  const r2 = run(['correction', '--claim-json', JSON.stringify(CORRECTION), '--ledger', LEDGER, '--json']);
  assert('a complete correction is accepted', r2.code === 0 && JSON.parse(r2.out).verdict === 'PERMITTED');
  const ledger = readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
  const rec = ledger.find((r) => r.type === 'correction');
  assert('the correction is recorded with its candidate rule', !!rec?.candidate_recognition_rule);
  assert('the candidate rule is recorded as CANDIDATE_ONLY — no automatic doctrine ratification',
    /CANDIDATE_ONLY/.test(rec.doctrine_status));
  assert('the corrected claim is automatically marked SUPERSEDED, not deleted',
    ledger.some((r) => r.claim_id === 'claim-canonical-split' && r.to === 'SUPERSEDED'));

  const r3 = run(['correction', '--claim-json', JSON.stringify(CORRECTION), '--ledger', LEDGER, '--ratify']);
  assert('an attempt to ratify a candidate rule into doctrine is refused', r3.code === 1 && /NOT authorized/i.test(r3.out));
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== INTERRUPTION BEHAVIOR — it stops, it does not merely log ===');
// ─────────────────────────────────────────────────────────────────────────────
{
  const r = run(['adjudicate', '--claim-json', JSON.stringify(THE_MISTAKE)]);
  assert('a refusal exits non-zero (a caller cannot ignore it by reading prose)', r.code === 1);
  assert('the refusal says the sentence out loud', /Evidence insufficient to promote this claim\./.test(r.out));
  assert('the human-readable refusal states the required test', /required:/.test(r.out));
  const bad = run(['adjudicate', '--claim-json', '{not json']);
  assert('an unparseable claim is a wrapper error (exit 2), never a silent permit', bad.code === 2);
  const unknown = judge({ id: 'x', assertion: 'a thing is fine', status: 'CERTAIN' });
  assert('an invented status is refused, not accepted by default', unknown.j.verdict === 'REFUSED');
  const hyp = judge({ id: 'h', assertion: 'this might be why continuity feels broken', status: 'HYPOTHESIS' });
  assert('a HYPOTHESIS with no evidence is permitted — the guard governs promotion, not thinking',
    hyp.j.verdict === 'PERMITTED');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== SCAN — advisory triage, explicitly weaker than adjudication ===');
// ─────────────────────────────────────────────────────────────────────────────
{
  const f = path.join(TMP, 'doc.md');
  const { writeFileSync } = await import('node:fs');
  writeFileSync(f, [
    '# Notes',                                                                    // 1
    'The oracle route is the canonical live path for all chat turns.',            // 2 — unanchored
    '', '', '', '', '', '',                                                       // 3-8 padding (window is ±3)
    'The list route is the canonical live path, verified in production at sha 04c6d6f03.', // 9 — anchored
  ].join('\n'));
  const r = run(['scan', f, '--json']);
  const { findings } = JSON.parse(r.out);
  assert('an unanchored liveness/canonical assertion is surfaced', findings.some((x) => x.line === 2),
    JSON.stringify(findings));
  assert('an assertion with a nearby evidence anchor is not surfaced', !findings.some((x) => x.line === 9));
  assert('scan alone does not fail a run unless --strict is given', r.code === 0);
  assert('--strict makes findings blocking', run(['scan', f, '--strict']).code === 1);
}

assert('the ledger file is created under the path given, not silently elsewhere', existsSync(LEDGER));
rmSync(TMP, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
