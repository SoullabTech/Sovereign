#!/usr/bin/env node
/**
 * JARVIS JSL-00 — Learning Trace
 * ═══════════════════════════════════════════════════════════════════════════
 * Units 5–11 established what a Work Unit IS (packet), what one ATTEMPT did
 * (results/<id>.json), and the history of attempts (results/<id>.attempts.jsonl).
 * All three answer "what was produced". None answers:
 *
 *     what was BELIEVED, what was TRIED, what actually HAPPENED,
 *     and what that should change about the next attempt.
 *
 * That gap is why the same dead end can be re-entered across attempts, workers
 * and contexts at full cost, every time. This module is the substrate that
 * closes it. It is a LEDGER, not an intelligence: it records, it never concludes.
 *
 * ── ADDITIVE ONLY ───────────────────────────────────────────────────────────
 * One sibling directory under the existing audit substrate:
 *
 *   $AIN_HOME/learning/traces/<work_unit_id>.jsonl   append-only, one line per step
 *
 * Nothing already on disk changes shape. A Work Unit with no trace behaves
 * exactly as it does today; ain-delegate.sh, session.mjs and work-unit.mjs are
 * untouched. Evidence is REFERENCED by path/sha, never copied — the pipeline's
 * artifacts stay the one authoritative copy, so the trace cannot drift from them.
 *
 * ── THE LOAD-BEARING BOUNDARY ───────────────────────────────────────────────
 *
 *     THE TRACE RECORDS EXPERIENCE. IT NEVER ASSIGNS EPISTEMIC STATUS.
 *
 * `epistemic-guard.mjs` already owns the status ladder — HYPOTHESIS → OBSERVATION
 * → PROVEN → INVARIANT, with G5 refusing rung-skips and refusing any status that
 * rises on rereading rather than on new evidence. JSL deliberately does NOT
 * restate that ladder here. A second ladder would be a second authority, and the
 * ratified invariant it would break is exact:
 *
 *     "No representation of the system may acquire more authority simply by
 *      being copied into a more durable or more convenient store."
 *
 * So a trace entry carries no status. Learning becomes a CLAIM only by being
 * proposed into the guard (see jarvis-experience-memory.mjs `promotion-candidate`),
 * adjudicated there, and — above HEURISTIC — ruled on by a human. Jarvis is free
 * to learn; it is not free to make its own beliefs true.
 *
 * ── INVARIANTS (fail closed — a refused write is never a silent partial one) ─
 *   J1 GROUNDING   Every OUTCOME declares VERIFIED or SELF_REPORTED. Worker
 *                  self-report is never authoritative (Unit 11), so a
 *                  SELF_REPORTED outcome is recorded but is never countable as
 *                  confirmation. This is the whole defence against an agent
 *                  learning from its own claim that something worked.
 *   J2 LINEAGE     An OUTCOME/CORRECTION must name the entry it bears on. An
 *                  outcome with no antecedent is a story, not evidence.
 *   J3 NO-STATUS   A trace entry may not carry `status`. Status is the guard's.
 *   J5 EVIDENCE    Every cited evidence kind must be one epistemic-guard.mjs can
 *                  adjudicate, checked at write time so the ledger never
 *                  accumulates evidence that is unusable when it finally matters.
 *   J4 APPEND-ONLY Corrections supersede; they never rewrite. A failed
 *                  experiment is preserved — it is the most reusable record
 *                  this system produces.
 *
 * CLI
 *   jarvis-learning-trace.mjs record <work_unit_id> --kind K [flags]
 *   jarvis-learning-trace.mjs show   <work_unit_id> [--json]
 *   jarvis-learning-trace.mjs verify <work_unit_id> [--json]
 */

import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

// Lazy, never frozen at import time — same reason work-unit.mjs does this: ESM
// hoisting would otherwise capture AIN_DELEGATION_HOME before a test sets it.
const HOME = () => process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
export const LEARNING_HOME = () => path.join(HOME(), 'learning');
export const TRACES_DIR = () => path.join(LEARNING_HOME(), 'traces');

/**
 * Closed taxonomy. A new kind is a design decision, not a convention someone
 * guesses at a call site — same rule the guard applies to its statuses.
 */
export const TRACE_KINDS = Object.freeze({
  OBSERVATION:  'what was seen before acting — the state the attempt started from',
  HYPOTHESIS:   'a candidate explanation, explicitly not yet tested',
  ACTION:       'what was actually done, and under which strategy',
  OUTCOME:      'what measurably happened, and who says so',
  CORRECTION:   'a prior entry in this trace was wrong, and here is what showed it',
  ABANDONMENT:  'this line was dropped, and why — so it is not silently re-entered',
});
export const TRACE_KIND_NAMES = Object.freeze(Object.keys(TRACE_KINDS));

/** J1. The distinction that decides whether an outcome may ever count as confirmation. */
export const GROUNDINGS = Object.freeze(['VERIFIED', 'SELF_REPORTED']);

/** What an OUTCOME found. INCONCLUSIVE is first-class: "we still don't know" is a result. */
export const OUTCOMES = Object.freeze(['CONFIRMED', 'REFUTED', 'INCONCLUSIVE']);

/**
 * MIRROR of the evidence vocabulary in epistemic-guard.mjs (KNOWN_KINDS).
 *
 * It is duplicated rather than imported because that module has no main-module
 * guard — importing it would execute its CLI. Duplication is a drift risk, so it
 * is not left to discipline: `jarvis-learning-proof.mjs` parses the guard's
 * source and fails if these two lists ever diverge. A gate that fires, not a
 * rule someone is expected to remember.
 *
 * Validating here (J5) rather than at promotion time is deliberate. Evidence the
 * guard would reject must never reach the ledger in the first place — otherwise a
 * trace accumulates months of unusable evidence and discovers it only when a
 * claim is finally proposed.
 */
export const EVIDENCE_KINDS = Object.freeze([
  'code_comment', 'filename', 'naming_convention', 'import_graph',
  'architecture_doc', 'historical_assertion', 'project_memory', 'worker_claim',
  'runtime_route_trace', 'edge_trace', 'endpoint_proof', 'production_observation',
  'db_query', 'log_marker', 'telemetry_label', 'indexed_row_coverage', 'known_retrieval',
  'executable_gate', 'founder_ruling', 'ratified_canon', 'deployed_commit', 'incident_record',
]);

/** Kinds that must name an antecedent (J2). */
const REQUIRES_ANTECEDENT = new Set(['OUTCOME', 'CORRECTION']);

const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export const newTraceId = () => `t-${randomBytes(5).toString('hex')}`;
export const nowISO = () => new Date().toISOString();

export function tracePath(workUnitId) {
  if (!SAFE_ID.test(workUnitId) || workUnitId.includes('..')) {
    throw new Error(`learning: unsafe work_unit_id '${workUnitId}'`);
  }
  return path.join(TRACES_DIR(), `${workUnitId}.jsonl`);
}

/** Read a trace. A corrupt line is skipped, never fatal — a bad line must not blind the reader. */
export function loadTrace(workUnitId) {
  const f = tracePath(workUnitId);
  if (!existsSync(f)) return [];
  const out = [];
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* skip corrupt line, keep reading */ }
  }
  return out;
}

/**
 * Validate one entry against J1–J4. Returns refusals; the caller decides.
 * Separated from the write so the proof can exercise validation without touching disk.
 */
export function validateEntry(entry, existing = []) {
  const refusals = [];
  const refuse = (rule, why, required) => refusals.push({ rule, why, required });

  if (!entry.kind || !TRACE_KIND_NAMES.includes(entry.kind)) {
    refuse('SHAPE', `unknown kind '${entry.kind ?? '(none)'}'`, `use one of: ${TRACE_KIND_NAMES.join(', ')}`);
    return refusals; // every later check keys off kind; adjudicating further would be guessing
  }
  if (!entry.statement || !String(entry.statement).trim()) {
    refuse('SHAPE', 'entry has no statement — an unstated step is not a record', 'pass --statement');
  }
  // J3 — the trace may not assign status. Enforced by name so the failure is legible.
  if ('status' in entry) {
    refuse('J3', 'a trace entry may not carry an epistemic status',
      'record the experience here; propose the claim to epistemic-guard.mjs instead');
  }
  if (entry.kind === 'OUTCOME') {
    // J1 — the grounding declaration is mandatory, not defaulted. Defaulting it to
    // VERIFIED would launder self-report into evidence; defaulting it to
    // SELF_REPORTED would quietly discard real proof. So: state it.
    if (!GROUNDINGS.includes(entry.grounding)) {
      refuse('J1', `OUTCOME requires an explicit grounding (${GROUNDINGS.join(' |)')})`,
        'pass --grounding VERIFIED (cite evidence) or --grounding SELF_REPORTED');
    }
    if (!OUTCOMES.includes(entry.outcome)) {
      refuse('SHAPE', `OUTCOME requires outcome ∈ ${OUTCOMES.join('|')}`, 'pass --outcome');
    }
    // A VERIFIED outcome with nothing to point at is a self-report wearing a better label.
    if (entry.grounding === 'VERIFIED' && !(entry.evidence || []).length) {
      refuse('J1', 'VERIFIED outcome cites no evidence — that is a self-report with a stronger label',
        'cite --evidence <kind:ref>, or record it as SELF_REPORTED');
    }
  }
  // J5 — every cited evidence kind must be one the guard can adjudicate.
  for (const ev of entry.evidence || []) {
    if (!EVIDENCE_KINDS.includes(ev.kind)) {
      refuse('J5', `unknown evidence kind '${ev.kind}' — the epistemic guard cannot adjudicate it`,
        `use one of: ${EVIDENCE_KINDS.join(', ')}`);
    }
  }
  if (REQUIRES_ANTECEDENT.has(entry.kind)) {
    // J2 — lineage. Checked against what is already on disk, so a typo'd id is
    // caught at write time rather than becoming a dangling edge discovered later.
    if (!entry.bears_on) {
      refuse('J2', `${entry.kind} must name the entry it bears on`, 'pass --bears-on <trace_id>');
    } else if (existing.length && !existing.some((e) => e.trace_id === entry.bears_on)) {
      refuse('J2', `--bears-on '${entry.bears_on}' is not an entry in this trace`,
        'cite a trace_id from `show`');
    }
  }
  return refusals;
}

/**
 * Append one entry. Fail-closed: a refused entry is not written at all.
 * `step` is derived from what is already on disk, never supplied by the caller —
 * a caller-supplied step number is a second source of truth waiting to drift.
 */
export function record(workUnitId, entry) {
  const existing = loadTrace(workUnitId);
  const refusals = validateEntry(entry, existing);
  if (refusals.length) {
    const err = new Error(`learning: refused ${refusals.length} check(s)`);
    err.refusals = refusals;
    throw err;
  }
  mkdirSync(TRACES_DIR(), { recursive: true });
  const rec = {
    trace_id: newTraceId(),
    work_unit_id: workUnitId,
    step: existing.length + 1,
    at: nowISO(),
    ...entry,
  };
  appendFileSync(tracePath(workUnitId), JSON.stringify(rec) + '\n');
  return rec;
}

/**
 * Structural audit of a whole trace. Reports what the ledger can and cannot
 * support — deliberately including the uncomfortable numbers, because the
 * failure mode this system is built against is a trace that LOOKS conclusive.
 */
export function verifyTrace(workUnitId) {
  const entries = loadTrace(workUnitId);
  const ids = new Set(entries.map((e) => e.trace_id));
  const dangling = entries
    .filter((e) => REQUIRES_ANTECEDENT.has(e.kind) && e.bears_on && !ids.has(e.bears_on))
    .map((e) => ({ trace_id: e.trace_id, bears_on: e.bears_on }));

  const outcomes = entries.filter((e) => e.kind === 'OUTCOME');
  const verified = outcomes.filter((e) => e.grounding === 'VERIFIED');
  const hypotheses = entries.filter((e) => e.kind === 'HYPOTHESIS');
  // A hypothesis nobody ever reported an outcome for. This is the quiet failure
  // mode of long agent runs: the belief stays in play, untested, forever.
  const untested = hypotheses
    .filter((h) => !outcomes.some((o) => o.bears_on === h.trace_id))
    .map((h) => ({ trace_id: h.trace_id, statement: h.statement }));

  return {
    work_unit_id: workUnitId,
    entries: entries.length,
    by_kind: TRACE_KIND_NAMES.reduce((a, k) => (a[k] = entries.filter((e) => e.kind === k).length, a), {}),
    outcomes_total: outcomes.length,
    outcomes_verified: verified.length,
    outcomes_self_reported: outcomes.length - verified.length,
    untested_hypotheses: untested,
    dangling_references: dangling,
    // "Structurally sound" means the LEDGER is well-formed. It is not a claim
    // that anything in it is true — that adjudication belongs to the guard.
    structurally_sound: dangling.length === 0,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const id = argv[1];
  const val = (name) => { const i = argv.indexOf(name); return i > -1 ? argv[i + 1] : undefined; };
  const flag = (name) => argv.includes(name);
  const many = (name) => argv.reduce((a, v, i) => (v === name && argv[i + 1] ? [...a, argv[i + 1]] : a), []);

  const usage = () => {
    console.error('usage: jarvis-learning-trace.mjs {record|show|verify} <work_unit_id> [flags]');
    console.error(`  record --kind {${TRACE_KIND_NAMES.join('|')}} --statement <s>`);
    console.error('         [--subsystem s] [--symptom s] [--strategy s] [--sha s]');
    console.error(`         [--outcome {${OUTCOMES.join('|')}}] [--grounding {${GROUNDINGS.join('|')}}]`);
    console.error('         [--bears-on <trace_id>] [--evidence kind:ref]... [--json]');
    process.exit(2);
  };

  if (!cmd || !id) usage();

  try {
    if (cmd === 'record') {
      const entry = {
        kind: val('--kind'),
        statement: val('--statement'),
        subsystem: val('--subsystem'),
        symptom: val('--symptom'),
        strategy: val('--strategy'),
        sha: val('--sha'),
        attempt_number: val('--attempt') ? Number(val('--attempt')) : undefined,
        bears_on: val('--bears-on'),
        outcome: val('--outcome'),
        grounding: val('--grounding'),
        evidence: many('--evidence').map((e) => {
          const i = e.indexOf(':');
          return i > 0 ? { kind: e.slice(0, i), ref: e.slice(i + 1) } : { kind: 'unspecified', ref: e };
        }),
      };
      for (const k of Object.keys(entry)) {
        if (entry[k] === undefined || (Array.isArray(entry[k]) && !entry[k].length)) delete entry[k];
      }
      const rec = record(id, entry);
      if (flag('--json')) console.log(JSON.stringify(rec, null, 2));
      else console.log(`[jsl-00] recorded ${rec.kind} step ${rec.step} as ${rec.trace_id} -> ${tracePath(id)}`);
      process.exit(0);
    }

    if (cmd === 'show') {
      const entries = loadTrace(id);
      if (flag('--json')) { console.log(JSON.stringify(entries, null, 2)); process.exit(0); }
      if (!entries.length) { console.log(`(no learning trace for '${id}')`); process.exit(0); }
      for (const e of entries) {
        const tag = e.kind === 'OUTCOME' ? ` [${e.outcome}/${e.grounding}]` : '';
        console.log(`  ${String(e.step).padStart(3)}. ${e.trace_id}  ${e.kind.padEnd(12)}${tag}`);
        console.log(`       ${e.statement}`);
        if (e.bears_on) console.log(`       bears_on: ${e.bears_on}`);
      }
      process.exit(0);
    }

    if (cmd === 'verify') {
      const v = verifyTrace(id);
      if (flag('--json')) { console.log(JSON.stringify(v, null, 2)); process.exit(v.structurally_sound ? 0 : 1); }
      console.log(`trace '${v.work_unit_id}' — ${v.entries} entries`);
      console.log(`  verified outcomes     ${v.outcomes_verified}`);
      console.log(`  self-reported only    ${v.outcomes_self_reported}`);
      console.log(`  untested hypotheses   ${v.untested_hypotheses.length}`);
      console.log(`  dangling references   ${v.dangling_references.length}`);
      process.exit(v.structurally_sound ? 0 : 1);
    }

    usage();
  } catch (e) {
    console.error(`🛑 ${e.message}`);
    for (const r of e.refusals ?? []) console.error(`   ${r.rule}: ${r.why}\n      → ${r.required}`);
    process.exit(5);
  }
}
