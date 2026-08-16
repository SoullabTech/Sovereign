#!/usr/bin/env node
/**
 * jarvis epistemic-guard — enforceable evidence checks on claim promotion.
 *
 * WHY THIS EXISTS
 *   The recognition rules in [[feedback_jarvis_epistemology_learning_loop]] are ratified
 *   doctrine and entirely unenforced: every instance of the failure they name was caught by a
 *   directed human/LLM investigation, never by a running check (see
 *   docs/architecture/JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md §7). This module is
 *   the first executable form of those rules. It adjudicates ONE claim record at a time and
 *   REFUSES promotion when the cited evidence cannot carry the requested epistemic status.
 *
 * WHAT IT IS NOT
 *   Not a fact checker — it never decides whether an assertion is true. It decides whether the
 *   EVIDENCE CITED is of a class and completeness that can support the STATUS REQUESTED.
 *   Not a ratifier — correction → doctrine promotion is candidate-only here, by directive.
 *   Not a linter of code — `scan` is advisory prose triage, deliberately weaker than the rest.
 *
 * GUARDS
 *   G1 CANONICAL-PATH       live/canonical path claims need surface → request → runtime route
 *   G2 EDGE-PROOF           X-governs-Y needs edge evidence; two endpoints are not an edge
 *   G3 TELEMETRY-PROVENANCE a runtime label is evidence about the labeller until you prove
 *                           where the label is assigned
 *   G4 INDEX-LIVENESS       retrieval code ≠ operational semantic memory (coverage + one hit)
 *   G5 STATUS-PROMOTION     no silent graduation between statuses
 *   G6 CORRECTION-ANATOMY   a correction must record all seven rungs
 *   G7 LIVENESS-SCOPE       "LIVE" must name deployed+exercised vs in use by members
 *                           (founder ruling 2026-08-09 — see FOUNDER DECISIONS in the record)
 *
 * USAGE
 *   node scripts/builder/epistemic-guard.mjs adjudicate --claim <file.json> [--sha <sha>] [--json]
 *   node scripts/builder/epistemic-guard.mjs adjudicate --claim-json '<json>' [--json]
 *   node scripts/builder/epistemic-guard.mjs transition --claim <file.json> --to PROVEN [--ledger <f>]
 *   node scripts/builder/epistemic-guard.mjs correction  --claim <file.json> [--ledger <f>]
 *   node scripts/builder/epistemic-guard.mjs scan <path...> [--strict]
 *   node scripts/builder/epistemic-guard.mjs statuses
 *
 * EXIT CODES  0 permitted · 1 refused · 2 invocation/wrapper error.
 *   1 is a real verdict, not an error: the caller asked to promote a claim its evidence
 *   cannot carry. 2 means the guard could not adjudicate at all.
 */
import { readFileSync, existsSync, appendFileSync, mkdirSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary — the eight statuses. Never extend by convention-guessing; a new
// status is a governance act, not a code change.
// ─────────────────────────────────────────────────────────────────────────────
const STATUS = {
  OBSERVATION: 'runtime evidence showed X',
  PROVEN: 'proposition survived a defined proof',
  CORRECTION: 'previous claim X was disproven by Y',
  HEURISTIC: 'check X early because it has failed before',
  INVARIANT: 'governing rule that must be obeyed',
  HYPOTHESIS: 'plausible but not established',
  STALE: 'previously true; currentness unverified',
  SUPERSEDED: 'replaced by stronger evidence',
};
const STATUSES = Object.keys(STATUS);

// Rank governs PROMOTION only. HEURISTIC/CORRECTION/STALE/SUPERSEDED are lateral or
// terminal — they are not rungs on the same ladder and carry rank null.
const RANK = { HYPOTHESIS: 0, OBSERVATION: 1, PROVEN: 2, INVARIANT: 3 };

// Evidence whose whole content is a human assertion about the system. Never sufficient,
// alone, for a claim about what the running system does.
const WEAK_KINDS = new Set([
  'code_comment', 'filename', 'naming_convention', 'import_graph',
  'architecture_doc', 'historical_assertion', 'project_memory', 'worker_claim',
]);

const KNOWN_KINDS = new Set([
  ...WEAK_KINDS,
  'runtime_route_trace', 'edge_trace', 'endpoint_proof', 'production_observation',
  'db_query', 'log_marker', 'telemetry_label', 'indexed_row_coverage', 'known_retrieval',
  'executable_gate', 'founder_ruling', 'ratified_canon', 'deployed_commit', 'incident_record',
]);

const AUTHORITY_KINDS = new Set(['founder_ruling', 'ratified_canon']);

// ─────────────────────────────────────────────────────────────────────────────
// Assertion shape detectors. These decide WHICH guards apply when the claim record
// does not declare its own subject kind. They are deliberately over-inclusive:
// a guard that fires on an irrelevant claim costs one explicit `subject.kind`;
// a guard that fails to fire costs a false LIVE.
// ─────────────────────────────────────────────────────────────────────────────
const RX_CANONICAL = /\b(canonical|live|in production|production path|primary (route|path|entry)|entry ?point|carr(y|ies|ying)\s+[^.]*traffic|handles?\s+[^.]*traffic|is the route)\b/i;
// G1 fires on an UNDECLARED claim only when the sentence is about a concrete route/endpoint.
// Without this, every sentence containing the word "live" demands a route trace. A claim about
// path identity that names no path must declare `subject.kind` — see the FALSE NEGATIVES note
// in docs/ops/JARVIS_EPISTEMIC_GUARDRAILS_2026-08-11.md.
const RX_ROUTE_REF = /(\/api\/[\w\-/[\]]+|route\.ts|\broutes?\b|\bendpoints?\b|\bingress\b)/i;
const RX_EDGE = /\b(governs?|reaches|applies to|propagat\w+|therefore|flows? (in)?to|is visible to|feeds?|drives?|is wired (in)?to|end-to-end)\b/i;
const RX_INDEX = /\b(semantic (memory|search|recall)|vector (search|store|index)|embedding|similarity search|rag\b|retriev\w+)\b/i;
const RX_LIVE_WORD = /\b(live|LIVE|operational|in use|working end-to-end|shipped and working)\b/;

const LIVENESS_SCOPES = new Set(['deployed_exercised', 'in_use_by_members', 'neither']);

// ─────────────────────────────────────────────────────────────────────────────
// Evidence standing
// ─────────────────────────────────────────────────────────────────────────────
function evidenceStanding(ev, ctx) {
  const kind = ev?.kind;
  if (!kind || !KNOWN_KINDS.has(kind)) {
    return { standing: 'NON_PROBATIVE', reason: `unknown evidence kind '${kind}' — declare one of: ${[...KNOWN_KINDS].join(', ')}` };
  }
  if (WEAK_KINDS.has(kind)) {
    return { standing: 'WEAK', reason: `${kind} is an assertion about the system, not an observation of it` };
  }

  // G3 — telemetry provenance. A runtime label is evidence about the labeller.
  if (kind === 'telemetry_label') {
    const p = ev.label_assignment_proof;
    if (!p) {
      return {
        standing: 'NON_PROBATIVE',
        reason: 'telemetry_label cited with no label_assignment_proof — a runtime label is evidence about the labeller, not the labelled, until you prove where the label is set',
      };
    }
    if (p.call_sites_enumerated !== true) {
      return { standing: 'NON_PROBATIVE', reason: 'label_assignment_proof.call_sites_enumerated is not true — every call site of the emitting function must be enumerated' };
    }
    if (p.sets_dimension_explicitly !== true) {
      return {
        standing: 'NON_PROBATIVE',
        reason: `label_assignment_proof shows the dimension is NOT set explicitly at the site that matters${p.default_source ? ` (defaults at ${p.default_source})` : ''} — the aggregate describes the default, not the subject`,
      };
    }
    return { standing: 'PROBATIVE', reason: 'telemetry label with proven assignment site' };
  }

  // Structural completeness per kind.
  const need = {
    runtime_route_trace: ['surface', 'request', 'runtime_route'],
    edge_trace: ['from', 'to', 'mechanism', 'discriminating_observation'],
    endpoint_proof: ['endpoint'],
    indexed_row_coverage: ['target', 'indexed_rows', 'total_rows'],
    known_retrieval: ['query', 'retrieved_ref'],
    db_query: ['query'],
    log_marker: ['marker'],
    deployed_commit: ['sha'],
  }[kind];
  if (need) {
    const missing = need.filter((f) => ev[f] === undefined || ev[f] === null || ev[f] === '');
    if (missing.length) {
      return { standing: 'NON_PROBATIVE', reason: `${kind} is missing required field(s): ${missing.join(', ')}` };
    }
  }

  // Staleness — evidence pinned to a SHA that is not the SHA under adjudication.
  // Downgrades, never silently passes. (`/orient`: VERIFIED never survives a SHA change.)
  if (ev.sha && ctx.sha && !ctx.sha.startsWith(ev.sha) && !ev.sha.startsWith(ctx.sha)) {
    return { standing: 'STALE', reason: `evidence was taken at ${ev.sha}; adjudicating at ${ctx.sha} — re-derive or mark the claim STALE` };
  }
  return { standing: 'PROBATIVE', reason: `${kind} observed` };
}

const has = (evs, kind, pred = () => true) => evs.some((e) => e.ev.kind === kind && e.standing === 'PROBATIVE' && pred(e.ev));

// ─────────────────────────────────────────────────────────────────────────────
// Guards
// ─────────────────────────────────────────────────────────────────────────────
function guardCanonicalPath(claim, evs, refuse) {
  const declared = claim.subject?.kind;
  const applies = declared === 'route' || declared === 'path' || declared === 'execution_path'
    || (declared === undefined && RX_CANONICAL.test(claim.assertion || '') && RX_ROUTE_REF.test(claim.assertion || ''));
  if (!applies) return;
  if (!['OBSERVATION', 'PROVEN', 'INVARIANT'].includes(claim.status)) return;

  const trace = evs.find((e) => e.ev.kind === 'runtime_route_trace' && e.standing === 'PROBATIVE');
  if (!trace) {
    const leaned = evs.filter((e) => WEAK_KINDS.has(e.ev.kind) || e.ev.kind === 'telemetry_label')
      .map((e) => e.ev.kind);
    refuse('G1', 'CANONICAL-PATH',
      `a live/canonical execution-path claim was requested at ${claim.status} with no probative runtime_route_trace`
      + (leaned.length ? ` — the cited basis is ${[...new Set(leaned)].join(', ')}` : ''),
      'establish surface → request → runtime route empirically (deployed UI call site → the request it issues → the route that executes it) and cite it as runtime_route_trace{surface,request,runtime_route}');
  }
  const stale = evs.find((e) => e.ev.kind === 'runtime_route_trace' && e.standing === 'STALE');
  if (!trace && stale) {
    refuse('G1', 'CANONICAL-PATH', `the only runtime_route_trace is stale: ${stale.reason}`,
      're-derive the trace against the SHA now running in production');
  }
}

function guardEdgeProof(claim, evs, refuse) {
  const declared = claim.subject?.kind;
  const applies = declared === 'edge' || claim.edge
    || (declared === undefined && RX_EDGE.test(claim.assertion || ''));
  if (!applies) return;
  if (!['OBSERVATION', 'PROVEN', 'INVARIANT'].includes(claim.status)) return;

  const edge = evs.find((e) => e.ev.kind === 'edge_trace' && e.standing === 'PROBATIVE');
  if (edge) {
    // The edge must name the endpoints the claim is about, when the claim declares them.
    const from = claim.edge?.from, to = claim.edge?.to;
    if (from && to && !(String(edge.ev.from).includes(from) && String(edge.ev.to).includes(to))) {
      refuse('G2', 'EDGE-PROOF',
        `edge_trace runs ${edge.ev.from} → ${edge.ev.to}, which is not the claimed edge ${from} → ${to}`,
        'cite an edge_trace whose endpoints are the endpoints of the claim');
    }
    return;
  }
  const endpoints = evs.filter((e) => e.ev.kind === 'endpoint_proof' && e.standing === 'PROBATIVE');
  refuse('G2', 'EDGE-PROOF',
    endpoints.length >= 2
      ? `${endpoints.length} endpoints are proven (${endpoints.map((e) => e.ev.endpoint).join(', ')}) and the connection between them is not — endpoint success does not establish propagation or ordering across the edge`
      : 'a claim that one thing reaches/governs another was requested with no edge_trace',
    'state the edge proposition and supply edge_trace{from,to,mechanism,discriminating_observation} — the observation must discriminate against the rival explanation that the edge is absent');
}

function guardIndexLiveness(claim, evs, refuse) {
  const declared = claim.subject?.kind;
  const applies = declared === 'retrieval' || declared === 'semantic_memory'
    || (declared === undefined && RX_INDEX.test(claim.assertion || '') && RX_LIVE_WORD.test(claim.assertion || ''));
  if (!applies) return;
  if (!['OBSERVATION', 'PROVEN', 'INVARIANT'].includes(claim.status)) return;

  const cov = evs.find((e) => e.ev.kind === 'indexed_row_coverage' && e.standing === 'PROBATIVE');
  const hit = evs.find((e) => e.ev.kind === 'known_retrieval' && e.standing === 'PROBATIVE');
  if (!cov) {
    refuse('G4', 'INDEX-LIVENESS',
      'retrieval was claimed operational with no indexed-row coverage — query implementation does not establish corpus availability',
      'report indexed_row_coverage{target,indexed_rows,total_rows} against the corpus the live path actually reads');
  } else if (Number(cov.ev.indexed_rows) === 0) {
    refuse('G4', 'INDEX-LIVENESS',
      `indexed_row_coverage reports 0 indexed rows on ${cov.ev.target} — the index is empty; the code path is not the capability`,
      'populate and re-measure, or classify the subsystem INERT rather than operational');
  }
  if (!hit) {
    refuse('G4', 'INDEX-LIVENESS',
      'no known_retrieval was cited — coverage alone does not prove the live path can reach the corpus',
      'verify one known retrieval end-to-end and cite known_retrieval{query,retrieved_ref}');
  }
}

function guardLivenessScope(claim, evs, refuse) {
  if (!RX_LIVE_WORD.test(claim.assertion || '')) return;
  if (!['OBSERVATION', 'PROVEN', 'INVARIANT'].includes(claim.status)) return;
  if (!claim.liveness_scope) {
    refuse('G7', 'LIVENESS-SCOPE',
      '"live"/"operational" was asserted without naming which liveness is meant',
      'set liveness_scope to "deployed_exercised" (code + schema deployed and exercised) or "in_use_by_members" — founder ruling 2026-08-09: LIVE never means member use unless it says so');
    return;
  }
  if (!LIVENESS_SCOPES.has(claim.liveness_scope)) {
    refuse('G7', 'LIVENESS-SCOPE', `unknown liveness_scope '${claim.liveness_scope}'`,
      `use one of: ${[...LIVENESS_SCOPES].join(', ')}`);
    return;
  }
  if (claim.liveness_scope === 'in_use_by_members'
      && !evs.some((e) => e.standing === 'PROBATIVE' && ['db_query', 'production_observation', 'log_marker'].includes(e.ev.kind))) {
    refuse('G7', 'LIVENESS-SCOPE',
      'liveness_scope claims member use with no production observation of member rows or markers',
      'cite a db_query or production_observation showing member-authored rows — never populate a table to make a record true');
  }
}

function guardStatusEvidence(claim, evs, refuse) {
  const probative = evs.filter((e) => e.standing === 'PROBATIVE');
  switch (claim.status) {
    case 'HYPOTHESIS':
      break; // a hypothesis is allowed to be unevidenced — that is what it is for
    case 'OBSERVATION':
      if (!probative.length) {
        refuse('G5', 'STATUS-EVIDENCE', 'OBSERVATION requires at least one probative observation of the running system',
          'cite runtime evidence (production_observation, db_query, log_marker, runtime_route_trace) — not documents, comments, or imports');
      }
      break;
    case 'PROVEN': {
      if (!probative.length) {
        refuse('G5', 'STATUS-EVIDENCE', 'PROVEN requires probative evidence; none of the cited evidence survived standing checks',
          'supply runtime evidence, or request OBSERVATION/HYPOTHESIS instead');
      }
      const prop = claim.proof?.proposition;
      const disc = claim.proof?.discriminates_against;
      if (!prop) {
        refuse('G5', 'STATUS-EVIDENCE', 'PROVEN requires a defined proposition — a proof with no proposition is a story',
          'set proof.proposition to the exact statement the evidence survives');
      }
      if (!disc) {
        refuse('G5', 'STATUS-EVIDENCE', 'PROVEN requires a named rival explanation the evidence discriminates against',
          'set proof.discriminates_against — e.g. "absence of orphan rows is equally consistent with no interruption having occurred"');
      }
      break;
    }
    case 'INVARIANT':
      if (!evs.some((e) => AUTHORITY_KINDS.has(e.ev.kind))) {
        refuse('G5', 'STATUS-EVIDENCE', 'INVARIANT asserts a governing rule and requires governance authority, not measurement',
          'cite founder_ruling or ratified_canon — production has no standing on what MAY exist');
      }
      break;
    case 'HEURISTIC':
      if (!(claim.incident_refs || []).length && !evs.some((e) => e.ev.kind === 'incident_record')) {
        refuse('G5', 'STATUS-EVIDENCE', 'HEURISTIC means "this has failed before" and requires at least one prior instance',
          'cite incident_refs[] or an incident_record — a heuristic with no history is a hypothesis');
      }
      break;
    case 'STALE':
      if (!claim.last_verified_sha) {
        refuse('G5', 'STATUS-EVIDENCE', 'STALE requires the SHA at which the claim was last verified',
          'set last_verified_sha');
      }
      break;
    case 'SUPERSEDED':
      if (!claim.superseded_by) {
        refuse('G5', 'STATUS-EVIDENCE', 'SUPERSEDED requires the claim that replaced it', 'set superseded_by');
      }
      break;
    case 'CORRECTION':
      guardCorrectionAnatomy(claim, refuse);
      break;
    default:
      refuse('G5', 'STATUS-EVIDENCE', `unknown status '${claim.status}'`, `use one of: ${STATUSES.join(', ')}`);
  }
}

const CORRECTION_RUNGS = [
  'old_claim', 'why_we_believed_it', 'disconfirming_evidence', 'corrected_claim',
  'general_failure_pattern', 'candidate_recognition_rule', 'future_test',
];

function guardCorrectionAnatomy(claim, refuse) {
  const c = claim.correction || {};
  const missing = CORRECTION_RUNGS.filter((r) => !c[r] || String(c[r]).trim() === '');
  if (missing.length) {
    refuse('G6', 'CORRECTION-ANATOMY',
      `a correction is missing ${missing.length} of the seven rungs: ${missing.join(', ')}`,
      'a correction is worth more than a success only if it generalizes — record every rung through candidate_recognition_rule and future_test');
  }
  if (c.ratified === true || claim.ratified === true) {
    refuse('G6', 'CORRECTION-ANATOMY',
      'this record marks a candidate recognition rule as ratified doctrine',
      'ratification is a governed act and is NOT authorized in this unit — leave the rule candidate-only');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Adjudication
// ─────────────────────────────────────────────────────────────────────────────
function adjudicate(claim, ctx = {}) {
  const refusals = [];
  const warnings = [];
  const refuse = (guard, rule, why, required_test) => refusals.push({ guard, rule, why, required_test });

  if (!claim || typeof claim !== 'object') return { verdict: 'ERROR', refusals: [{ guard: '-', rule: 'SHAPE', why: 'claim is not an object', required_test: 'supply a JSON claim record' }], warnings };
  if (!claim.assertion) refuse('-', 'SHAPE', 'claim has no assertion', 'set assertion to the exact sentence being promoted');
  if (!claim.status) refuse('-', 'SHAPE', 'claim has no status', `set status to one of: ${STATUSES.join(', ')}`);

  const evs = (claim.evidence || []).map((ev) => ({ ev, ...evidenceStanding(ev, ctx) }));
  for (const e of evs) {
    if (e.standing !== 'PROBATIVE') {
      warnings.push(`evidence ${e.ev.kind ?? '(untyped)'} → ${e.standing}: ${e.reason}`);
    }
  }

  guardCanonicalPath(claim, evs, refuse);
  guardEdgeProof(claim, evs, refuse);
  guardIndexLiveness(claim, evs, refuse);
  guardLivenessScope(claim, evs, refuse);
  guardStatusEvidence(claim, evs, refuse);

  return {
    verdict: refusals.length ? 'REFUSED' : 'PERMITTED',
    claim_id: claim.id ?? null,
    requested_status: claim.status ?? null,
    assertion: claim.assertion ?? null,
    sha: ctx.sha ?? null,
    evidence_standing: evs.map((e) => ({ kind: e.ev.kind, standing: e.standing, reason: e.reason })),
    refusals,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ledger — statuses do not graduate silently; every transition is a written act.
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_LEDGER = '.ain/epistemic-ledger.jsonl';

function readLedger(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function appendLedger(file, record) {
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  appendFileSync(file, JSON.stringify(record) + '\n');
}

const evidenceKey = (ev) => JSON.stringify([ev.kind, ev.ref ?? ev.surface ?? ev.query ?? ev.marker ?? ev.endpoint ?? ev.detail ?? '']);

function transition(claim, to, ctx) {
  const ledger = readLedger(ctx.ledger);
  const prior = [...ledger].reverse().find((r) => r.claim_id === claim.id && r.type === 'transition');
  const from = prior?.to ?? claim.from ?? 'HYPOTHESIS';
  const refusals = [];
  const refuse = (guard, rule, why, required_test) => refusals.push({ guard, rule, why, required_test });

  if (!STATUSES.includes(to)) {
    return { verdict: 'ERROR', refusals: [{ guard: 'G5', rule: 'STATUS-PROMOTION', why: `unknown target status '${to}'`, required_test: `use one of: ${STATUSES.join(', ')}` }] };
  }
  if (from === 'SUPERSEDED') {
    refuse('G5', 'STATUS-PROMOTION', 'SUPERSEDED is terminal — a replaced claim cannot be revived',
      'promote the replacing claim instead, or open a new claim id');
  }
  const rFrom = RANK[from], rTo = RANK[to];
  const isPromotion = rFrom !== undefined && rTo !== undefined && rTo > rFrom;

  if (isPromotion) {
    if (rTo - rFrom > 1) {
      refuse('G5', 'STATUS-PROMOTION', `${from} → ${to} skips a rung — no silent promotion between statuses`,
        `promote through ${Object.keys(RANK).find((k) => RANK[k] === rFrom + 1)} first, with the evidence that rung requires`);
    }
    const priorKeys = new Set((prior?.evidence_keys ?? []));
    const nowKeys = (claim.evidence || []).map(evidenceKey);
    const delta = nowKeys.filter((k) => !priorKeys.has(k));
    if (prior && delta.length === 0) {
      refuse('G5', 'STATUS-PROMOTION', `${from} → ${to} cites no evidence that was not already on record at ${from} — a status cannot rise on rereading`,
        'supply new evidence, or leave the claim where it stands');
    }
  }
  if (from === 'STALE' && to === 'PROVEN' && !(claim.evidence || []).some((e) => e.sha && ctx.sha && (ctx.sha.startsWith(e.sha) || e.sha.startsWith(ctx.sha)))) {
    refuse('G5', 'STATUS-PROMOTION', 'STALE → PROVEN requires re-derivation at the current SHA',
      `re-run the proof at ${ctx.sha ?? 'the running SHA'} and cite evidence carrying that sha`);
  }

  const adj = adjudicate({ ...claim, status: to }, ctx);
  const all = [...refusals, ...adj.refusals];
  const verdict = all.length ? 'REFUSED' : 'PERMITTED';
  const record = {
    type: 'transition', ts: ctx.now, claim_id: claim.id ?? null, from, to, verdict,
    sha: ctx.sha ?? null, assertion: claim.assertion ?? null,
    evidence_keys: (claim.evidence || []).map(evidenceKey),
    refusals: all,
  };
  if (!ctx.dryRun) appendLedger(ctx.ledger, record);
  return { ...adj, verdict, from, to, refusals: all, ledger: ctx.ledger };
}

// ─────────────────────────────────────────────────────────────────────────────
// scan — advisory prose triage. Weakest instrument here, on purpose.
// ─────────────────────────────────────────────────────────────────────────────
const EVIDENCE_ANCHOR = /(psql|docker logs|docker exec|agent_runs|SELECT\s|GIT_COMMIT|\bsha\b|proof|evidence|runtime|`\d{7,}`|rows?\b)/i;

function scanFile(file) {
  const findings = [];
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('>') || line.trim().startsWith('|')) return;
    const canonical = RX_CANONICAL.test(line) && RX_LIVE_WORD.test(line) && RX_ROUTE_REF.test(line);
    const edge = RX_EDGE.test(line) && /\bboth\b|\band\b/.test(line) && /prove|passed|works/i.test(line);
    if (!canonical && !edge) return;
    const window = lines.slice(Math.max(0, i - 3), i + 4).join(' ');
    if (EVIDENCE_ANCHOR.test(window)) return;
    findings.push({
      file, line: i + 1, guard: canonical ? 'G1' : 'G2',
      text: line.trim().slice(0, 160),
      why: canonical
        ? 'liveness/canonical assertion with no evidence anchor within ±3 lines'
        : 'edge assertion built on endpoint results with no evidence anchor within ±3 lines',
    });
  });
  return findings;
}

function walk(target, out = []) {
  const st = statSync(target);
  if (st.isFile()) { if (/\.(md|mdx)$/.test(target)) out.push(target); return out; }
  for (const e of readdirSync(target, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.git')) continue;
    walk(path.join(target, e.name), out);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reporting — interruption, not logging. A refusal says the sentence out loud.
// ─────────────────────────────────────────────────────────────────────────────
const HEADLINE = 'Evidence insufficient to promote this claim.';

function report(result, asJson) {
  if (asJson) { console.log(JSON.stringify(result, null, 2)); return; }
  if (result.verdict === 'PERMITTED') {
    console.log(`✅ PROMOTION PERMITTED  ${result.claim_id ?? '(unnamed claim)'} → ${result.to ?? result.requested_status}`);
    if (result.from) console.log(`   from       ${result.from}`);
    console.log(`   assertion  ${result.assertion ?? ''}`);
    const probative = (result.evidence_standing ?? []).filter((e) => e.standing === 'PROBATIVE');
    console.log(`   basis      ${probative.length} probative item(s): ${probative.map((e) => e.kind).join(', ') || '—'}`);
    for (const w of result.warnings ?? []) console.log(`   ⚠️  ${w}`);
    return;
  }
  console.log(`⛔ ${HEADLINE}`);
  console.log(`   claim      ${result.claim_id ?? '(unnamed claim)'}`);
  console.log(`   assertion  ${result.assertion ?? ''}`);
  console.log(`   requested  ${result.from ? `${result.from} → ${result.to}` : result.requested_status}`);
  for (const r of result.refusals) {
    console.log(`\n   [${r.guard} ${r.rule}] ${r.why}`);
    console.log(`      required: ${r.required_test}`);
  }
  for (const w of result.warnings ?? []) console.log(`\n   ⚠️  ${w}`);
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d = null) => { const i = args.indexOf(n); return i !== -1 && args[i + 1] ? args[i + 1] : d; };
const cmd = args[0];

if (!cmd || cmd.startsWith('--') || cmd === 'help') {
  console.error('usage: epistemic-guard.mjs <adjudicate|transition|correction|scan|statuses> [options]');
  console.error('  adjudicate --claim <file.json> | --claim-json <json> [--sha <sha>] [--json]');
  console.error('  transition --claim <file.json> --to <STATUS> [--ledger <f>] [--dry-run] [--json]');
  console.error('  correction --claim <file.json> [--ledger <f>] [--json]');
  console.error('  scan <path...> [--strict]');
  process.exit(2);
}

if (cmd === 'statuses') {
  for (const s of STATUSES) console.log(`${s.padEnd(12)} ${STATUS[s]}`);
  process.exit(0);
}

if (cmd === 'scan') {
  const targets = args.slice(1).filter((a) => !a.startsWith('--'));
  if (!targets.length) { console.error('🛑 scan needs at least one path'); process.exit(2); }
  const findings = targets.flatMap((t) => {
    if (!existsSync(t)) { console.error(`🛑 no such path: ${t}`); process.exit(2); }
    return walk(t).flatMap(scanFile);
  });
  if (flag('--json')) console.log(JSON.stringify({ findings }, null, 2));
  else {
    for (const f of findings) console.log(`${f.file}:${f.line}  [${f.guard}] ${f.why}\n    ${f.text}`);
    console.log(`\n${findings.length} advisory finding(s). scan is triage, not a verdict — adjudicate the claims it surfaces.`);
  }
  process.exit(flag('--strict') && findings.length ? 1 : 0);
}

let claim;
const claimFile = opt('--claim');
const claimJson = opt('--claim-json');
try {
  if (claimJson) claim = JSON.parse(claimJson);
  else if (claimFile) claim = JSON.parse(readFileSync(claimFile, 'utf8'));
  else { console.error('🛑 --claim <file.json> or --claim-json <json> is required'); process.exit(2); }
} catch (e) {
  console.error(`🛑 could not parse claim: ${e.message}`);
  process.exit(2);
}

const ctx = {
  sha: opt('--sha') || spawnSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout?.trim() || null,
  ledger: opt('--ledger') || DEFAULT_LEDGER,
  now: opt('--now') || new Date().toISOString(),
  dryRun: flag('--dry-run'),
};

let result;
if (cmd === 'adjudicate') {
  result = adjudicate(claim, ctx);
} else if (cmd === 'transition') {
  const to = opt('--to');
  if (!to) { console.error('🛑 transition requires --to <STATUS>'); process.exit(2); }
  result = transition(claim, to, ctx);
} else if (cmd === 'correction') {
  if (flag('--ratify')) {
    console.log(`⛔ ${HEADLINE}`);
    console.log('\n   [G6 CORRECTION-ANATOMY] ratification of a candidate recognition rule into doctrine is NOT authorized in this unit.');
    console.log('      required: a separate founder authorization for correction → doctrine promotion. Until then, candidate-only.\n');
    process.exit(1);
  }
  result = adjudicate({ ...claim, status: 'CORRECTION' }, ctx);
  if (result.verdict === 'PERMITTED' && !ctx.dryRun) {
    appendLedger(ctx.ledger, {
      type: 'correction', ts: ctx.now, claim_id: claim.id ?? null, sha: ctx.sha ?? null,
      corrects: claim.corrects ?? claim.correction?.old_claim ?? null,
      candidate_recognition_rule: claim.correction.candidate_recognition_rule,
      doctrine_status: 'CANDIDATE_ONLY — ratification not authorized',
      future_test: claim.correction.future_test,
    });
    if (claim.corrects) {
      appendLedger(ctx.ledger, {
        type: 'transition', ts: ctx.now, claim_id: claim.corrects, from: null, to: 'SUPERSEDED',
        verdict: 'PERMITTED', sha: ctx.sha ?? null, superseded_by: claim.id ?? null, evidence_keys: [], refusals: [],
      });
    }
  }
} else {
  console.error(`🛑 unknown command '${cmd}'`);
  process.exit(2);
}

report(result, flag('--json'));
process.exit(result.verdict === 'PERMITTED' ? 0 : result.verdict === 'ERROR' ? 2 : 1);
