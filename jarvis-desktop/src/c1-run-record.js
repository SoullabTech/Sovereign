// JARVIS Desktop — C1 run record.
//
// Pure, DOM-free, Electron-free, filesystem-free. It BUILDS the record; the
// canonical store persists it. Kept as its own module for the same reason
// correctness.js is: so the shape can be proven without launching Electron.
//
// ── WHY THIS EXISTS (B1, 2026-08-24) ────────────────────────────────────────
// The governed work-unit lane (`local-native`) has always persisted:
// builder-mechanism.js calls store.saveRun() before it starts and on every
// transition. The C1 lane never did. A C1 task ran, produced evidence, was
// scored by the canonical verifier, rendered into the Result panel — and
// existed nowhere else. Quitting JARVIS destroyed it.
//
// That is not a missing feature; it is a broken claim. Unit 11 §10 states
// "restarting the process must not destroy durable run history", and C1 was
// the lane where the founder actually works. A run that cannot be retrieved
// after a restart cannot carry provenance forward, and provenance that does
// not survive the process is provenance in name only.
//
// ── WHAT A C1 RECORD MUST CARRY ─────────────────────────────────────────────
// Enough to be read years later by someone who was not here. Specifically the
// topology (which repository, which checkout, which commit, which build) — a
// run that says only "it worked" is worthless once you cannot tell what "it"
// was operating on. See src/repo-topology.js.
//
// ── WHAT IT MUST NEVER DO ───────────────────────────────────────────────────
// Upgrade an outcome. `correctness` comes from the canonical verifier via
// decideCorrectness(); nothing here re-decides it, and a FAILED run is stored
// as FAILED with its failure named. Storing only successes would make the
// history a highlight reel and defeat the point.
'use strict';

/**
 * Terminal states a C1 run can end in. Deliberately a small, closed set, and
 * deliberately NOT the work-unit pipeline's state vocabulary — C1 is a
 * different lane and borrowing the other lane's states would imply it went
 * through the other lane's gates. `disposition` is carried alongside so a
 * reader never has to infer outcome from state.
 */
const C1_STATES = Object.freeze({
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

/** In-flight states, for orphan reconciliation after a hard stop. */
const C1_IN_FLIGHT = Object.freeze(['QUEUED', 'RUNNING']);

/**
 * The packet is stored as the founder submitted it, minus nothing and plus
 * nothing. Prompt text is truncated only if it would make the record
 * unreadable — and truncation is DECLARED rather than silent, because a
 * quietly shortened prompt would misrepresent what was asked.
 */
const MAX_PROMPT_CHARS = 20_000;

function normalizePacket(task) {
  const t = task && typeof task === 'object' ? task : {};
  const prompt = typeof t.prompt === 'string' ? t.prompt : '';
  const truncated = prompt.length > MAX_PROMPT_CHARS;
  return {
    lane_hint: 'c1',
    prompt: truncated ? prompt.slice(0, MAX_PROMPT_CHARS) : prompt,
    prompt_truncated: truncated,
    prompt_full_chars: prompt.length,
    context_selectors: Array.isArray(t.context_selectors) ? t.context_selectors : [],
    bounded_for_local: t.bounded_for_local === true,
  };
}

/**
 * Open a C1 run. Called BEFORE the worker is invoked, so a run that dies
 * mid-flight still leaves a record — the absence of one would be
 * indistinguishable from "no task was ever submitted".
 *
 * @param {object}   input
 * @param {string}   input.runId      from the canonical store's newRunId()
 * @param {object}   input.task       the submitted task
 * @param {string}   input.now        ISO timestamp from the canonical store
 * @param {object}   input.topology   from repo-topology.topologyRecord()
 * @param {object}   [input.provenance] artifact/substrate pair, unflattened
 */
function openRun({ runId, task, now, topology, provenance = null }) {
  return {
    run_id: runId,
    origin: 'jarvis-desktop',
    lane: 'C1',
    // Named so a reader knows which surface admitted this run. The work-unit
    // lane records `owns_packet`; C1 has no packet custody model, and saying so
    // is better than borrowing a field that would imply one.
    execution_surface: 'jarvis:submit-task',
    state: 'RUNNING',
    disposition: null,
    created_at: now,
    updated_at: now,
    packet: normalizePacket(task),
    // Provenance is embedded at OPEN time, not at close: it describes the
    // conditions the run was admitted under. Reading it at close would record
    // the state after any mid-run rebind, which is not what the run ran against.
    topology,
    provenance,
    result: null,
    verification: null,
    failure_class: null,
    failure_detail: null,
  };
}

/**
 * Close a C1 run that reached the worker.
 *
 * `verification` is the object main.js already builds from the canonical
 * verifier. It is stored verbatim. The two facts it holds — execution `pass`
 * and answer `correctness` — stay separate here exactly as they are on screen;
 * collapsing them into one stored badge would reintroduce, in the archive, the
 * precise conflation the 2026-08-11 founder walk exposed on the display.
 */
function completeRun(run, { now, result, verification }) {
  return {
    ...run,
    state: C1_STATES.COMPLETED,
    // COMPLETED means the worker ran and answered. It does NOT mean the answer
    // was right — `correctness` says that, and a completed run whose
    // correctness is `failed` is a real and common outcome.
    disposition: verification && verification.correctness ? verification.correctness : 'unverified',
    updated_at: now,
    result: result || null,
    verification: verification || null,
  };
}

/**
 * Close a C1 run that did not reach a usable answer.
 *
 * `failure_class` is required and must be specific. "failed" alone is the
 * vagueness that let a repository-resolution defect (B2) sit disguised as a
 * task failure for as long as it did — a stored run that cannot say WHY it
 * failed cannot be swept for a pattern later.
 */
function failRun(run, { now, failureClass, failureDetail, result = null }) {
  return {
    ...run,
    state: C1_STATES.FAILED,
    disposition: 'failed',
    updated_at: now,
    failure_class: failureClass || 'UNCLASSIFIED',
    failure_detail: failureDetail ? String(failureDetail).slice(0, 500) : null,
    result,
  };
}

/**
 * Classify a thrown error into a named failure class.
 *
 * The C1 branch's catch used to flatten every throw into `{ error: message }`.
 * These classes exist because the founder's response differs per class: a
 * ReferenceError is a Desktop defect to file, a connection refusal is "start
 * Ollama", and a timeout is "the model is thinking too long". One bucket
 * served none of them.
 */
function classifyFailure(err) {
  const msg = String((err && err.message) || err || '');
  if (err instanceof ReferenceError || /is not defined/.test(msg)) return 'DESKTOP_DEFECT';
  if (/ECONNREFUSED|fetch failed|Failed to fetch/i.test(msg)) return 'LOCAL_WORKER_UNREACHABLE';
  if (/timed out|TimeoutError|AbortError|The operation was aborted/i.test(msg)) return 'LOCAL_WORKER_TIMEOUT';
  if (/ENOENT|Cannot find module|ERR_MODULE_NOT_FOUND/i.test(msg)) return 'CANONICAL_MODULE_MISSING';
  return 'C1_EXECUTION_ERROR';
}

module.exports = {
  C1_STATES,
  C1_IN_FLIGHT,
  MAX_PROMPT_CHARS,
  normalizePacket,
  openRun,
  completeRun,
  failRun,
  classifyFailure,
};
