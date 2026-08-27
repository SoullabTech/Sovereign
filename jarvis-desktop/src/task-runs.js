// JARVIS-STAB-01 — durable custody for the router execution surface.
//
// THE DEFECT THIS CLOSES. `jarvis:submit-task` had no run identity and no
// persistence of any kind. A task was routed, its result was rendered into a
// DOM node, and that was the whole of its existence: close the window and the
// task, its lane, its reason and its result were gone. The founder could not
// answer "what did I ask, and what came back" without asking again — which is
// the reconstruction burden the whole programme exists to remove.
//
// WHAT THIS IS NOT. It is not a new store. Units 7–11 already established a
// canonical durable substrate — atomic per-run writes, an append-only event
// log, and orphan reconciliation — in scripts/builder/jarvis-runtime-store.mjs,
// and the governed work-unit mechanism already uses it. The router lane simply
// never did. This file is the WIRE, not a second store: a Desktop-local copy
// would fork the audit substrate for exactly the reason builder-mechanism.js
// refuses to copy checkAuthority and correctness.js refuses to copy the
// verifier.
//
// NO SUBSTITUTION. The store is resolved from, and only from, the BOUND
// repository root — never a bundled copy, never a nearby checkout. If the bound
// root does not carry it, custody is UNAVAILABLE and says so. A run that cannot
// be recorded must be visibly uncustodied, never silently ephemeral again.
//
// SHARED SUBSTRATE, SEPARATE VOCABULARY. Work-unit runs and router runs live in
// the same runs/ directory, as one audit trail. They are told apart by
// `surface`, and their state vocabularies are deliberately disjoint (this lane
// uses ROUTED/EXECUTING/…, the mechanism uses QUEUED/…), so neither can ever
// reconcile or list the other's runs by accident.
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const SURFACE = 'router';
const STORE_MODULE = 'jarvis-runtime-store.mjs';

// ── Router-lane run states ──────────────────────────────────────────────────
// ROUTED               a lane was selected; execution has not begun.
// EXECUTING            execution is under way in this process.
// COMPLETED            execution finished. Says NOTHING about correctness —
//                      that is the verification block's job, and conflating the
//                      two is the collapse correctness.js exists to prevent.
// FAILED               execution was attempted and threw.
// ROUTED_NOT_EXECUTED  C3. Routed, explained, deliberately not executed.
// REJECTED_OVERSIZED   the router refused the packet; nothing was attempted.
const STATE = Object.freeze({
  ROUTED: 'ROUTED',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  ROUTED_NOT_EXECUTED: 'ROUTED_NOT_EXECUTED',
  REJECTED_OVERSIZED: 'REJECTED_OVERSIZED',
});

// A run left in one of these when the process died was never finished. It is
// reconciled at next launch rather than left claiming to be in flight — a
// closed app is not a running worker. Both names are unique to this surface, so
// reconciliation can never touch a work-unit run.
const IN_FLIGHT = Object.freeze([STATE.ROUTED, STATE.EXECUTING]);

/**
 * Load the canonical store FROM THE BOUND ROOT.
 *
 * Returns a named unavailability rather than throwing, because "no repository
 * is bound" and "the bound repository predates the store" need different
 * founder responses and both must remain visible on the surface.
 */
async function loadStore(root) {
  if (!root) {
    return { ok: false, reason: 'no execution substrate is bound — router runs cannot be recorded', store: null, source: null };
  }
  const source = path.join(root, 'scripts', 'builder', STORE_MODULE);
  if (!fs.existsSync(source)) {
    return { ok: false, reason: `the bound repository does not carry ${STORE_MODULE} — router runs cannot be recorded`, store: null, source };
  }
  try {
    const store = await import(`file://${source}?t=${Date.now()}`);
    return { ok: true, reason: null, store, source };
  } catch (e) {
    return { ok: false, reason: `run store import failed: ${String(e.message).slice(0, 200)}`, store: null, source };
  }
}

// ---------------------------------------------------------------------------
// JARVIS-STAB-02 — the routing fingerprint.
//
// "Same task + same state → same lane" is only a claim until it can be CHECKED
// against history. The fingerprint is a stable digest of everything the router
// actually reads (router.mjs is a pure function of exactly these three fields)
// PLUS a digest of the capability registry, because whether a capability is
// registered is genuinely part of "same state".
//
// Including the registry is what keeps the check honest in both directions: a
// task that routes C3 today and C0 tomorrow because a capability landed is NOT
// a determinism violation, and folding the registry in means it reads as a
// different fingerprint rather than as a false alarm. Anything that reports
// drift where the world legitimately changed will be ignored within a week.
// ---------------------------------------------------------------------------
function routingFingerprint(task, capabilityNames) {
  const routingInputs = {
    capability: task && task.capability ? String(task.capability) : null,
    bounded_for_local: task && task.bounded_for_local === true,
    input_chars: task && typeof task.input_chars === 'number' ? task.input_chars : 0,
  };
  const registry = Array.isArray(capabilityNames) ? [...capabilityNames].sort() : null;
  const payload = JSON.stringify({ routingInputs, registry });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 12);
}

/**
 * Audit determinism from DURABLE history: group runs by fingerprint and report
 * any fingerprint that ever produced more than one lane.
 *
 * This is a report, not an enforcement. If the router ever became
 * non-deterministic, suppressing the evidence would be the worst possible
 * response — the founder needs to SEE it.
 */
function auditRoutingDeterminism(runs) {
  const byPrint = new Map();
  for (const r of runs || []) {
    if (!r || !r.routing_fingerprint) continue;
    const seen = byPrint.get(r.routing_fingerprint) || { fingerprint: r.routing_fingerprint, lanes: new Set(), runs: [] };
    seen.lanes.add(r.lane === undefined ? null : r.lane);
    seen.runs.push(r.run_id);
    byPrint.set(r.routing_fingerprint, seen);
  }
  const violations = [];
  for (const v of byPrint.values()) {
    if (v.lanes.size > 1) {
      violations.push({ fingerprint: v.fingerprint, lanes: [...v.lanes], runs: v.runs });
    }
  }
  return {
    checked: byPrint.size,
    deterministic: violations.length === 0,
    violations,
    // An empty history proves nothing. Saying "deterministic" off zero samples
    // would be exactly the unearned confidence this console refuses elsewhere.
    basis: byPrint.size === 0
      ? 'no fingerprinted runs in durable history — determinism is UNVERIFIED, not confirmed'
      : `${byPrint.size} distinct routing input(s) observed across durable history`,
  };
}

/**
 * Open a run record BEFORE execution and persist it immediately.
 *
 * Written first so that a crash during a 30-second C1 call leaves a run that is
 * visibly in-flight and gets reconciled, rather than leaving no trace that the
 * founder ever asked. Persisting only on completion would lose exactly the runs
 * whose loss matters most.
 */
async function openRun(root, { task, decision, capabilityNames, app_build_sha = null }) {
  const s = await loadStore(root);
  if (!s.ok) return { custody: false, reason: s.reason, run: null, store: null };

  const { store } = s;
  store.initStore();
  const run = {
    run_id: store.newRunId(),
    surface: SURFACE,
    origin: 'jarvis-desktop',
    created_at: store.nowISO(),
    state: STATE.ROUTED,
    task,
    lane: decision.execution_lane,
    cost_class: decision.cost_class,
    reason: decision.reason,
    routing_status: decision.status,
    verification_required: decision.verification_required,
    routing_fingerprint: routingFingerprint(task, capabilityNames),
    result: null,
    verification: null,
    repo_root: root,
    app_build_sha,
  };
  store.saveRun(run);
  store.appendEvent({ run_id: run.run_id, surface: SURFACE, kind: 'routed', lane: run.lane, fingerprint: run.routing_fingerprint });
  return { custody: true, reason: null, run, store };
}

/** Record a state transition and persist it atomically. */
function transition(store, run, state, patch = {}) {
  const from = run.state;
  Object.assign(run, patch, { state, updated_at: store.nowISO() });
  store.saveRun(run);
  store.appendEvent({ run_id: run.run_id, surface: SURFACE, kind: 'transition', from, to: state });
  return run;
}

/**
 * Reconcile runs the app abandoned by closing.
 *
 * Called once at launch. The state names passed in are unique to this surface,
 * so the canonical reconciler cannot reach a work-unit run — the reuse is exact
 * and the scoping is structural rather than a filter that could be forgotten.
 */
async function reconcileOnLaunch(root) {
  const s = await loadStore(root);
  if (!s.ok) return { custody: false, reason: s.reason, reconciled: [] };
  try {
    return { custody: true, reason: null, reconciled: s.store.reconcileOrphanedRuns(IN_FLIGHT) };
  } catch (e) {
    return { custody: false, reason: `reconciliation failed: ${String(e.message).slice(0, 200)}`, reconciled: [] };
  }
}

/** Router-surface runs only, newest first, bounded. */
async function listRuns(root, { limit = 25, offset = 0 } = {}) {
  const s = await loadStore(root);
  if (!s.ok) return { custody: false, reason: s.reason, total: 0, runs: [] };
  // Over-read then filter: the store's own listing is shared with the work-unit
  // surface, and a `limit` applied before filtering would silently drop router
  // runs behind unrelated ones.
  const all = s.store.listRuns({ limit: 10_000, offset: 0 });
  const mine = all.runs.filter((r) => r && r.surface === SURFACE);
  return {
    custody: true,
    reason: null,
    total: mine.length,
    runs: mine.slice(offset, offset + limit),
    determinism: auditRoutingDeterminism(mine),
  };
}

async function getRun(root, runId) {
  const s = await loadStore(root);
  if (!s.ok) return { custody: false, reason: s.reason, run: null };
  const run = s.store.loadRun(runId);
  // A work-unit run is not this surface's to serve, and answering with one
  // would let router history quietly display a record it cannot interpret.
  if (!run || run.surface !== SURFACE) return { custody: true, reason: null, run: null };
  return { custody: true, reason: null, run };
}

/**
 * Write the handoff packet where the worker can find it, and tell the caller
 * where that is.
 *
 * Packets and receipts live beside the runs they belong to, under the store's
 * own RUNTIME_HOME, so custody is one directory tree rather than a run record
 * here and a text file somewhere the founder has to remember.
 */
async function writeHandoffPacket(root, runId, text) {
  const s = await loadStore(root);
  if (!s.ok) return { ok: false, reason: s.reason, path: null };
  const dir = path.join(s.store.RUNTIME_HOME, 'packets');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${runId}.txt`);
  fs.writeFileSync(file, text, 'utf8');
  s.store.appendEvent({ run_id: runId, surface: SURFACE, kind: 'handoff_packet_written', path: file });
  return { ok: true, reason: null, path: file };
}

/** The single agreed drop location for a run's evidence receipt. */
async function receiptPath(root, runId) {
  const s = await loadStore(root);
  if (!s.ok) return { ok: false, reason: s.reason, path: null };
  return { ok: true, reason: null, path: path.join(s.store.RUNTIME_HOME, 'receipts', `${runId}.json`) };
}

/**
 * Read a receipt the worker dropped. Absence is reported as absence, never as
 * an error: "no evidence has come back yet" is the normal state of an open
 * handoff and must not read as a fault.
 */
async function readReceipt(root, runId) {
  const r = await receiptPath(root, runId);
  if (!r.ok) return { ok: false, reason: r.reason, receipt: null, path: null };
  if (!fs.existsSync(r.path)) return { ok: true, reason: null, receipt: null, path: r.path };
  try {
    return { ok: true, reason: null, receipt: JSON.parse(fs.readFileSync(r.path, 'utf8')), path: r.path };
  } catch (e) {
    return { ok: false, reason: `receipt at ${r.path} is not valid JSON: ${String(e.message).slice(0, 160)}`, receipt: null, path: r.path };
  }
}

/** Persist a run record the caller has already validated and updated. */
async function saveRun(root, run) {
  const s = await loadStore(root);
  if (!s.ok) return { ok: false, reason: s.reason };
  s.store.saveRun(run);
  s.store.appendEvent({ run_id: run.run_id, surface: SURFACE, kind: 'evidence_received' });
  return { ok: true, reason: null };
}

module.exports = {
  SURFACE, STATE, IN_FLIGHT,
  loadStore, openRun, transition, reconcileOnLaunch, listRuns, getRun,
  writeHandoffPacket, receiptPath, readReceipt, saveRun,
  routingFingerprint, auditRoutingDeterminism,
};
