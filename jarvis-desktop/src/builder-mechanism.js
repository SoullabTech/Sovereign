// JARVIS Desktop — seam onto the governed Builder work-unit mechanism.
//
// AUTHORITY (founder ruling 2026-08-14, R-1B):
//   Desktop authoritative lineage ... C0 (this lineage)
//   Builder mechanism cluster ....... landed independently (334c11f92 / PR #1043)
//   Wire ............................ AUTHORIZED
//   Execution lane .................. local-native ONLY
//   C3 execution .................... NOT AUTHORIZED / remains routed
//   READ_ONLY_LANES ................. UNCHANGED
//
// WHAT THIS IS. Desktop access to the governed Builder work-unit mechanism,
// currently admitting only its authorized `local-native` read-only lane. It is
// NOT "C3 execution enabled". C3 remaining routed-but-not-executed is not an
// incomplete wire — it is the mechanism enforcing its existing authority
// boundary, which this file does not touch.
//
// WHERE AUTHORITY LIVES. In the mechanism, not here. `executeRun` runs
// `validatePacket` and `checkAuthority` before it does anything, and routes any
// worker-emitted gate through `validateWorkerGate` itself. This file therefore
// contains NO Desktop-side copy of those checks. A Desktop-local reimplementation
// would fork the authority boundary and defeat the point — the same reasoning
// C1 recorded when it refused to copy the canonical verifier.
//
// Desktop MAY preflight for UX clarity (see `advisoryLaneNote`), but a preflight
// is advisory and is labelled as such. Admission is the mechanism's answer, never
// Desktop's, and a refusal is surfaced exactly as the mechanism produced it.
//
// ── NO SUBSTITUTION ─────────────────────────────────────────────────────────
// Every module is resolved from, and ONLY from, the bound repository root.
// There is deliberately no fallback: not to a sibling checkout, not to a
// globally installed copy, not to a bundled copy inside the app, not to
// `require.resolve`, not to any nearby directory that happens to carry the same
// filenames. If the bound root does not carry the mechanism, the answer is
// "unavailable, and here is why" — never a different mechanism that answers.
//
// This is the direct lesson of the 2026-08-14 two-process referent error, where
// two builds sharing the bundle id `life.soullab.jarvis` were read as one app and
// a nearby copy was mistaken for the running one. A stale replica answers rather
// than fails, which is worse than failing. Names and nearby copies must never
// substitute for the bound object.
// ─────────────────────────────────────────────────────────────────────────────
const path = require('node:path');
const fs = require('node:fs');

/** The cluster, by exact filename. All five, or the mechanism is not present. */
const MECHANISM_MODULES = Object.freeze([
  'jarvis-runtime-pipeline.mjs',
  'jarvis-governance-gate.mjs',
  'jarvis-context.mjs',
  'jarvis-packet-guard.mjs',
  'jarvis-runtime-store.mjs',
]);

/**
 * The only lane this wire submits. Declared here so the Desktop's scope is
 * readable in one place — it is NOT an authority check. The mechanism's own
 * READ_ONLY_LANES is the boundary, and it is consulted by `checkAuthority`
 * inside `executeRun`, whatever this constant says.
 */
const AUTHORIZED_LANE = 'local-native';

const mechanismDir = (root) => path.join(root, 'scripts', 'builder');

/**
 * Is the mechanism present in the BOUND repository?
 *
 * Failure modes are named rather than collapsed into "unavailable", for the same
 * reason repo-config.js names its own: "no repository is bound" and "the bound
 * repository does not carry the mechanism" call for different actions.
 *
 * @param {string|null} root - the bound repository root, from currentRoot().
 */
function mechanismState(root) {
  if (!root) {
    return {
      available: false,
      reason: 'no execution substrate is bound — bind a repository before submitting work units',
      source: null,
      lane: AUTHORIZED_LANE,
      modules: MECHANISM_MODULES.map((name) => ({ name, present: false })),
    };
  }
  const dir = mechanismDir(root);
  const modules = MECHANISM_MODULES.map((name) => ({
    name,
    present: fs.existsSync(path.join(dir, name)),
  }));
  const missing = modules.filter((m) => !m.present).map((m) => m.name);
  if (missing.length) {
    return {
      available: false,
      // Named, not vague: this is the difference between "the wire is broken"
      // and "the bound checkout predates the cluster landing".
      reason: `the bound repository does not carry the builder execution mechanism — missing ${missing.join(', ')} in ${dir}`,
      source: dir,
      lane: AUTHORIZED_LANE,
      modules,
    };
  }
  return { available: true, reason: null, source: dir, lane: AUTHORIZED_LANE, modules };
}

/**
 * Advisory only. Lets the UI say "this lane will not be admitted" before a round
 * trip, WITHOUT deciding anything. `advisory: true` is part of the return shape
 * so no caller can mistake it for an admission decision — if a packet is
 * submitted anyway, the mechanism still answers, and its answer is the one that
 * counts.
 */
function advisoryLaneNote(lane) {
  if (lane === AUTHORIZED_LANE) return { advisory: true, expected: 'admissible', note: null };
  return {
    advisory: true,
    expected: 'refusal',
    note: `Desktop submits '${AUTHORIZED_LANE}' only; '${lane}' is expected to be refused by the mechanism's own checkAuthority. This is a preview of the mechanism's answer, not Desktop's decision.`,
  };
}

/**
 * Load the mechanism FROM THE BOUND ROOT.
 *
 * The cache-buster is applied only to the modules imported here. The pipeline's
 * own `import './jarvis-governance-gate.mjs'` resolves relative to the pipeline
 * file itself, so the gate that validates worker gates always comes from the same
 * directory as the pipeline that calls it. The gate cannot be substituted from
 * outside, including by this file.
 */
async function loadMechanism(root) {
  const state = mechanismState(root);
  if (!state.available) return { ok: false, state, pipeline: null, store: null };
  const bust = Date.now();
  const url = (name) => `file://${path.join(state.source, name)}?t=${bust}`;
  try {
    const pipeline = await import(url('jarvis-runtime-pipeline.mjs'));
    const store = await import(url('jarvis-runtime-store.mjs'));
    return { ok: true, state, pipeline, store };
  } catch (e) {
    return {
      ok: false,
      state: { ...state, available: false, reason: `mechanism import failed from ${state.source}: ${String(e.message).slice(0, 300)}` },
      pipeline: null,
      store: null,
    };
  }
}

/**
 * Drive one governed work unit through the mechanism.
 *
 * Desktop supplies the `ctx` the pipeline requires — transition/emit/cancelled/
 * registerChild — and nothing else. Every stage decision, every refusal and every
 * gate is the mechanism's.
 *
 * `hooks.spawnDelegate` exists for the proof harness only; when absent the
 * pipeline uses the real ain-delegate.sh invocation. Desktop never passes it in
 * normal operation.
 *
 * Returns the mechanism's own outcome verbatim. Nothing here upgrades a refusal,
 * retries a failure, or reinterprets a state.
 */
async function runWorkUnit(root, packet, hooks = {}) {
  const m = await loadMechanism(root);
  if (!m.ok) {
    return {
      submitted: false,
      outcome: 'MECHANISM_UNAVAILABLE',
      reason: m.state.reason,
      mechanism: m.state,
      run: null,
      events: [],
    };
  }

  const { pipeline, store } = m;
  store.initStore();

  const run = {
    run_id: store.newRunId(),
    packet,
    owns_packet: false,
    state: 'QUEUED',
    created_at: store.nowISO(),
    origin: 'jarvis-desktop',
  };
  store.saveRun(run);

  const events = [];
  const record = (ev) => {
    events.push(ev);
    try { store.appendEvent({ run_id: run.run_id, ...ev }); } catch { /* telemetry is never load-bearing */ }
    try { hooks.onEvent?.(ev); } catch { /* a UI listener must not break a run */ }
  };

  const ctx = {
    transition(r, state, patch) {
      const from = r.state;
      // Observed, not enforced. The state machine belongs to the mechanism; if a
      // transition were ever illegal that is a defect to SEE, not for Desktop to
      // veto. Preserving the evidence beats hiding it behind a Desktop guard.
      const legal = pipeline.isLegalTransition(from, state);
      Object.assign(r, patch || {}, { state, updated_at: store.nowISO() });
      store.saveRun(r);
      record({ kind: 'transition', from, to: state, legal });
      return r;
    },
    cancelled() {
      // Desktop exposes no cancel surface in this unit (#4/#5/#6 are out of
      // scope). Answering `false` honestly beats inventing a cancellation path.
      return false;
    },
    emit(name, payload) {
      record({ kind: name, payload });
    },
    registerChild() {
      // No cancel surface, so there is nothing to hold. Declared explicitly
      // rather than left undefined: the pipeline calls this unconditionally.
    },
    ...(hooks.spawnDelegate ? { spawnDelegate: hooks.spawnDelegate } : {}),
  };

  const finished = await pipeline.executeRun(run, ctx);

  return {
    submitted: true,
    outcome: finished.state,
    // A run that stopped at a governance boundary is not a failure and must not
    // read as one. The gate is surfaced exactly as the mechanism validated it.
    governance_gate: finished.governance_gate ?? null,
    failure_class: finished.failure_class ?? null,
    failure_detail: finished.failure_detail ?? null,
    verification: finished.verification ?? null,
    terminal: pipeline.TERMINAL_STATES.includes(finished.state),
    mechanism: m.state,
    run: finished,
    events,
  };
}

module.exports = {
  MECHANISM_MODULES,
  AUTHORIZED_LANE,
  mechanismDir,
  mechanismState,
  advisoryLaneNote,
  loadMechanism,
  runWorkUnit,
};
