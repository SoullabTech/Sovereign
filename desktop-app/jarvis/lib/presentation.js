'use strict';
/**
 * JARVIS Unit 12 — Desktop presentation contract (§6, §9, §10, §12, §13, §20)
 *
 * Pure functions. No I/O, no Electron, no DOM — so the epistemic rules below are
 * testable on their own, which is the point: this file is where the Desktop can
 * most easily lie about what JARVIS proved, so it is the file with tests.
 *
 * The governing rule (§9): the Unit 11 runtime establishes CITATION CONTAINMENT
 * — every file:line the worker cited lies inside a fragment the worker was
 * actually shown, SHA-bound. It does NOT establish that the fragment supports
 * the claim. VERIFIED must never be rendered as if it did.
 */

/** Canonical run states, in lifecycle order (§6). */
const RUN_STATES = [
  'QUEUED', 'VALIDATING', 'CONTEXT_ROUTING', 'READY_FOR_WORKER', 'RUNNING',
  'VALIDATING_RESULT', 'VERIFYING_EVIDENCE',
  'VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED',
];

const TERMINAL_STATES = ['VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED'];

const IN_FLIGHT_STATES = [
  'QUEUED', 'VALIDATING', 'CONTEXT_ROUTING', 'READY_FOR_WORKER',
  'RUNNING', 'VALIDATING_RESULT', 'VERIFYING_EVIDENCE',
];

/**
 * Human sentence per state — the canonical name is always shown alongside it,
 * never replaced by it (§6). Nothing here implies progress the runtime has not
 * reported: each sentence describes the state the runtime is IN, not what it is
 * about to do.
 */
const STATE_COPY = {
  QUEUED: 'Accepted by the runtime, waiting for a worker slot',
  VALIDATING: 'JARVIS is checking the work packet against its schema and authority',
  CONTEXT_ROUTING: 'Selecting bounded evidence',
  READY_FOR_WORKER: 'Bounded context is materialized; worker not yet started',
  RUNNING: 'maia-coder is investigating',
  VALIDATING_RESULT: 'JARVIS is checking the worker returned a valid result contract',
  VERIFYING_EVIDENCE: "JARVIS is checking the worker's citations",
  VERIFIED: 'Citations verified against the supplied source material',
  ESCALATION_REQUIRED: 'JARVIS will not sign this off — human authority required',
  FAILED: 'The run did not complete',
  CANCELLED: 'Cancelled before it reached a disposition',
};

function isTerminal(state) { return TERMINAL_STATES.includes(state); }
function isInFlight(state) { return IN_FLIGHT_STATES.includes(state); }

/** @returns {{state: string, known: boolean, human: string, terminal: boolean}} */
function stateCopy(state) {
  const known = RUN_STATES.includes(state);
  return {
    state: state ?? 'UNKNOWN',
    known,
    // An unrecognised state is surfaced verbatim rather than smoothed away — a
    // runtime the Desktop does not understand is a fact worth showing.
    human: known ? STATE_COPY[state] : 'State reported by the runtime that this Desktop does not recognise',
    terminal: isTerminal(state),
  };
}

/**
 * Terminal disposition (§10). `tone` drives styling; `label` and `mark` carry
 * the same information without colour, because status must not be colour-only
 * (§19). ESCALATION REQUIRED never borrows the success tone.
 */
function dispositionView(run) {
  const d = run?.disposition ?? null;
  if (d === 'VERIFIED') {
    return { disposition: 'VERIFIED', label: 'VERIFIED', tone: 'verified', mark: '✓',
      meaning: 'Citations contained in the supplied source material. Not a semantic proof — see Evidence.' };
  }
  if (d === 'ESCALATION_REQUIRED') {
    return { disposition: 'ESCALATION_REQUIRED', label: 'ESCALATION REQUIRED', tone: 'escalation', mark: '▲',
      meaning: 'JARVIS declined to sign this off. Human authority is required.' };
  }
  if (d === 'FAILED') {
    return { disposition: 'FAILED', label: 'FAILED', tone: 'failed', mark: '✕',
      meaning: 'The run did not reach a disposition.' };
  }
  if (d === 'CANCELLED') {
    return { disposition: 'CANCELLED', label: 'CANCELLED', tone: 'cancelled', mark: '⊘',
      meaning: 'Cancellation was accepted by the runtime.' };
  }
  return { disposition: null, label: 'IN FLIGHT', tone: 'pending', mark: '·',
    meaning: 'No terminal disposition yet. The runtime has not decided.' };
}

/**
 * Failure classes (§20). The runtime's class string is ALWAYS preserved as the
 * headline; the copy below only explains it. An unknown class is shown verbatim
 * rather than collapsed into "something went wrong".
 */
const FAILURE_CLASS_COPY = {
  PACKET_SCHEMA_INVALID: 'The work packet did not satisfy the runtime schema. Nothing was dispatched.',
  LANE_NOT_PERMITTED: 'The requested execution lane is not one the runtime will accept.',
  LOCAL_WRITE_AUTHORITY_REFUSED: 'The packet asked for write authority. The local worker lane is READ-ONLY.',
  PACKET_ANSWER_LEAKAGE: 'The packet leaked the answer to the worker. The run was refused to protect the evidence.',
  CONTEXT_BUDGET_EXCEEDED: 'The selected evidence exceeds the worker context budget. Narrow the selectors.',
  SELECTOR_SHA_MISMATCH: 'A context selector no longer binds at the execution SHA.',
  BUILDER_OWNERSHIP_REFUSED: 'Builder governance refused the lane — the work unit is already owned.',
  CONTENDED_OR_UNKNOWN_LANE: 'The delegation lane was contended or unknown.',
  WORKER_EXECUTION_FAILED: 'The local worker exited non-zero.',
  WORKER_TERMINATED: 'The local worker was terminated before it finished.',
  WORKER_OUTPUT_EMPTY: 'The worker produced no output to verify.',
  WORKER_ESCALATED: 'The worker itself asked for escalation. The runtime did not overrule it.',
  RESULT_MISSING: 'The worker returned no result contract.',
  RESULT_CONTRACT_INVALID: 'The result contract was missing required fields.',
  LOCAL_WORKER_WROTE: 'A READ-ONLY lane changed the working tree. That is a governance failure regardless of what the worker reported.',
  EVIDENCE_INSUFFICIENT: 'The worker returned no citable file:line evidence, so nothing could be verified.',
  EVIDENCE_OUT_OF_CONTEXT: 'One or more citations fall outside the material the worker was actually shown.',
  RUNTIME_ERROR: 'The runtime itself errored while governing this run.',
};

function failureClassView(run) {
  const fc = run?.failure_class ?? null;
  if (!fc) return null;
  return {
    failure_class: fc,
    known: Object.prototype.hasOwnProperty.call(FAILURE_CLASS_COPY, fc),
    explanation: FAILURE_CLASS_COPY[fc] ?? 'Failure class reported by the runtime that this Desktop does not have copy for.',
    detail: run.failure_detail ?? null,
  };
}

/** §9 — the disclosure that must accompany every VERIFIED. */
const SEMANTIC_VERIFICATION_DISCLOSURE =
  'JARVIS verified that this citation lies within the exact source material supplied ' +
  'to the worker. Full semantic claim-support checking is not yet automated.';

const CITATION_VERIFIED_LABEL = 'CITATION VERIFIED / CONTAINED';
const CITATION_UNCONTAINED_LABEL = 'CITATION NOT CONTAINED';
const SEMANTIC_STATUS_LABEL = 'CLAIM SEMANTICALLY VERIFIED — NOT ESTABLISHED';

/** Split "path/to/file.ts:253" into its parts without pretending to parse more. */
function splitCitation(citation) {
  const s = String(citation ?? '');
  const m = /^(.*):(\d+)(?:-(\d+))?$/.exec(s);
  if (!m) return { source_file: s, line: null, end_line: null };
  return { source_file: m[1], line: Number(m[2]), end_line: m[3] ? Number(m[3]) : null };
}

/**
 * One row per citation the runtime checked (§9). `status` distinguishes
 * containment from semantic support; `semantic_status` is constant and negative
 * because the runtime cannot yet establish it for ANY row.
 */
function evidenceRows(run) {
  const citations = run?.verification?.citations ?? [];
  return citations.map((c) => {
    const parts = splitCitation(c.citation);
    const frag = c.fragment ? splitCitation(c.fragment) : null;
    return {
      claim: c.citation ?? null,
      source_file: parts.source_file,
      line: parts.line,
      line_range: frag ? `${frag.line ?? ''}${frag.end_line ? `-${frag.end_line}` : ''}` : null,
      fragment: c.fragment ?? null,
      source_sha: c.source_sha ?? null,
      contained: c.in_context === true,
      status: c.in_context === true ? CITATION_VERIFIED_LABEL : CITATION_UNCONTAINED_LABEL,
      status_mark: c.in_context === true ? '✓' : '✕',
      reason: c.reason ?? null,
      semantic_status: SEMANTIC_STATUS_LABEL,
      disclosure: SEMANTIC_VERIFICATION_DISCLOSURE,
    };
  });
}

/** Verification summary for the run-detail surface (§8, §9). */
function verificationView(run) {
  const v = run?.verification ?? null;
  if (!v) {
    return {
      present: false,
      method: null,
      citation_status: 'NO EVIDENCE VERIFICATION RECORDED',
      semantic_status: SEMANTIC_STATUS_LABEL,
      disclosure: SEMANTIC_VERIFICATION_DISCLOSURE,
      totals: null,
      decided_by: null,
    };
  }
  return {
    present: true,
    method: v.method ?? null,
    citation_status: v.ok === true
      ? `${CITATION_VERIFIED_LABEL} — ${v.valid}/${v.total}`
      : `${CITATION_UNCONTAINED_LABEL} — ${v.invalid}/${v.total} outside supplied context`,
    citation_ok: v.ok === true,
    semantic_status: SEMANTIC_STATUS_LABEL,
    // The negative claim is stated on every run, verified or not, so the limit
    // is never something the operator has to go looking for (§9, brief §0).
    disclosure: SEMANTIC_VERIFICATION_DISCLOSURE,
    totals: { total: v.total ?? 0, valid: v.valid ?? 0, invalid: v.invalid ?? 0, fragments_offered: v.fragments_offered ?? null },
    worker_self_reported_escalation: v.worker_self_reported_escalation ?? null,
    decided_by: v.decided_by ?? null,
  };
}

/**
 * Objective (§8) with its provenance stated.
 *
 * The runtime's public run projection does not carry the packet objective, so
 * the Desktop may only be able to label a run it submitted itself. Which of
 * those two situations applies is shown, never smoothed over — an operator must
 * be able to tell a runtime fact from a Desktop label.
 */
function objectiveView(run, annotations = {}) {
  if (run?.objective) {
    return { text: run.objective, provenance: 'RUNTIME', note: null };
  }
  const annotated = annotations?.[run?.run_id];
  if (annotated) {
    return {
      text: annotated,
      provenance: 'DESKTOP_ANNOTATION',
      note: 'Recorded by this Desktop when it submitted the run. The runtime API does not publish packet objectives.',
    };
  }
  return {
    text: null,
    provenance: 'UNAVAILABLE',
    note: 'The runtime API does not publish packet objectives, and this run was not submitted from this Desktop. ' +
      'The packet is on disk at the audit path below.',
  };
}

/** Context surface (§8) — fragments, paths, line ranges, SHA. */
function contextView(run) {
  const c = run?.context ?? null;
  if (!c) return { present: false, fragments: [], execution_head: null, fragment_count: 0, tokens: null };
  return {
    present: true,
    execution_head: c.execution_head ?? null,
    fragment_count: c.fragment_count ?? (c.manifest?.length ?? 0),
    tokens: { estimated: c.estimated_input_tokens ?? null, safe_threshold: c.safe_threshold ?? null },
    fragments: (c.manifest ?? []).map((f) => ({
      source_file: f.source_file,
      start_line: f.start_line,
      end_line: f.end_line,
      line_range: `${f.start_line}-${f.end_line}`,
      source_sha: f.source_sha ?? null,
      extraction_method: f.extraction_method ?? null,
      why: f.reason ?? null,
      content_hash: f.content_hash ? String(f.content_hash).slice(0, 16) : null,
    })),
  };
}

/** Worker + execution surface (§8). */
function workerView(run) {
  const w = run?.worker ?? null;
  const r = run?.result ?? null;
  return {
    lane: w?.lane ?? r?.lane ?? null,
    backend: w?.transport ?? null,
    model: w?.model ?? (r?.model && r.model !== 'UNKNOWN' ? r.model : null),
    started_at: w?.started_at ?? null,
    duration_s: r?.duration_s ?? null,
    exit_summary: r?.exit_summary ?? null,
    files_changed: r?.files_changed ?? [],
    test_results: r?.test_results ?? null,
    worker_self_reported_escalation: r?.worker_self_reported_escalation ?? null,
    recommended_next_action: r?.recommended_next_action ?? null,
    unresolved_questions: run?.unresolved_questions ?? [],
  };
}

/** History as rendered transitions (§6) — the runtime's record, not a guess. */
function historyView(run) {
  return (run?.history ?? []).map((h) => ({ at: h.at, from: h.from ?? null, to: h.to, ...stateCopy(h.to) }));
}

/**
 * System state (§12). Nothing here is inferred from the filesystem.
 *
 * @param health parsed /health body, or null when it could not be read
 * @param address the loopback address being addressed
 * @param errorCode transport code when health is null — RUNTIME_OFFLINE means
 *   nothing is listening; RUNTIME_UNRESPONSIVE means the runtime is there but
 *   did not answer, which is what happens while it prepares a run. These must
 *   not be shown as the same thing (§14).
 */
function healthView(health, address, errorCode = 'RUNTIME_OFFLINE') {
  if (!health) {
    const unresponsive = errorCode === 'RUNTIME_UNRESPONSIVE';
    return {
      runtime_state: unresponsive ? 'NOT RESPONDING' : 'OFFLINE',
      unresponsive,
      reachable: false,
      address: address ?? null,
      loopback_only: true,
      worker_available: false,
      worker_host: null,
      models: 0,
      last_error: null,
      runs: { active: 0, queued: 0, in_flight: 0, total: 0 },
      runtime_id: null,
      repository: null,
      version: null,
      uptime_s: null,
    };
  }
  return {
    runtime_state: health.state ?? 'UNKNOWN',
    unresponsive: false,
    reachable: true,
    address: health.address ?? address ?? null,
    loopback_only: health.loopback_only === true,
    worker_available: health.worker?.available === true,
    worker_host: health.worker?.host ?? null,
    worker_reason: health.worker?.reason ?? null,
    worker_latency_ms: health.worker?.latency_ms ?? null,
    models: health.worker?.models ?? 0,
    last_error: health.last_error ?? null,
    runs: {
      active: health.runs?.active ?? 0,
      queued: health.runs?.queued ?? 0,
      in_flight: health.runs?.in_flight ?? 0,
      total: health.runs?.total ?? 0,
    },
    runtime_id: health.runtime_id ?? null,
    repository: health.repository ?? null,
    version: health.version ?? null,
    uptime_s: health.uptime_s ?? null,
  };
}

/** §13 — the offline experience. The Desktop instructs; it does not exec. */
const OFFLINE_INSTRUCTION = 'scripts/jarvis-runtime.sh start';

function offlineView(address, errorCode = 'RUNTIME_OFFLINE') {
  if (errorCode === 'RUNTIME_UNRESPONSIVE') {
    return {
      headline: 'JARVIS Runtime Not Responding',
      address: address ?? null,
      // Explicitly NOT a failure claim (§14): the runtime blocks its event loop
      // while preparing a run, so silence here is usually work, not death.
      detail: `The runtime at ${address ?? 'the local address'} accepted the connection but did not answer in time. ` +
        'It is running. This is expected while it prepares a run — it holds its event loop during ' +
        'worktree and context setup. No JARVIS failure has been reported.',
      instruction: OFFLINE_INSTRUCTION,
      unresponsive: true,
      can_start_from_desktop: false,
    };
  }
  return {
    headline: 'JARVIS Runtime Offline',
    address: address ?? null,
    detail: `Nothing is listening on ${address ?? 'the local runtime address'}. ` +
      'The Desktop has no authority to start processes.',
    unresponsive: false,
    // Alpha shows the operator command rather than running it: the canonical
    // start path is a shell script, and shell authority in the Desktop is out
    // of scope for this unit (§13, §24).
    instruction: OFFLINE_INSTRUCTION,
    can_start_from_desktop: false,
  };
}

/** §11 — cancellation outcome, reported as the runtime answered it. */
function cancelOutcome(status, body) {
  if (status === 200) {
    return { outcome: 'ACCEPTED', label: 'Cancellation accepted', state: body?.state ?? null,
      detail: 'The runtime moved the run to CANCELLED.' };
  }
  if (status === 409 && body?.error === 'RUN_ALREADY_TERMINAL') {
    return { outcome: 'ALREADY_TERMINAL', label: 'Too late — run already terminal', state: body?.state ?? null,
      detail: `The run had already reached ${body?.state ?? 'a terminal state'} when cancellation was requested.` };
  }
  if (status === 409) {
    return { outcome: 'REFUSED', label: 'Cancellation refused at this stage', state: null,
      detail: body?.detail ?? 'The runtime refused the cancellation.' };
  }
  if (status === 404) {
    return { outcome: 'NOT_FOUND', label: 'Run not found', state: null,
      detail: 'The runtime has no such run.' };
  }
  if (status === 405) {
    return { outcome: 'UNSUPPORTED', label: 'Cancellation unsupported for this run', state: null,
      detail: 'The runtime does not accept cancellation on this resource.' };
  }
  return { outcome: 'REFUSED', label: `Cancellation refused (HTTP ${status})`, state: null,
    detail: body?.error ?? body?.detail ?? 'The runtime refused the cancellation.' };
}

/** §5 / §20 — how POST /runs answered. 202 is acceptance, never completion. */
function submissionOutcome(status, body) {
  if (status === 202) {
    return { accepted: true, run_id: body?.run_id ?? null, state: body?.state ?? 'QUEUED',
      label: 'Runtime accepted', detail: body?.note ?? null };
  }
  const cls = body?.error ?? `HTTP_${status}`;
  return {
    accepted: false,
    run_id: null,
    failure_class: cls,
    label: cls === 'LOCAL_WRITE_AUTHORITY_REFUSED' || cls === 'LANE_NOT_PERMITTED'
      ? 'AUTHORITY REQUIRED'
      : 'PACKET REJECTED',
    explanation: FAILURE_CLASS_COPY[cls] ?? 'The runtime refused this packet.',
    errors: body?.errors ?? (body?.detail ? [body.detail] : []),
  };
}

/** Redact anything that looks like a credential before it reaches the UI (§18). */
const SECRET_RE = /(sk-[A-Za-z0-9_-]{8,}|(?:api[_-]?key|token|secret|password|authorization)\s*[=:]\s*\S+)/gi;

function redact(text) {
  if (text == null) return text;
  return String(text).replace(SECRET_RE, '[redacted]');
}

const API = {
  RUN_STATES,
  TERMINAL_STATES,
  IN_FLIGHT_STATES,
  STATE_COPY,
  FAILURE_CLASS_COPY,
  SEMANTIC_VERIFICATION_DISCLOSURE,
  SEMANTIC_STATUS_LABEL,
  CITATION_VERIFIED_LABEL,
  CITATION_UNCONTAINED_LABEL,
  OFFLINE_INSTRUCTION,
  isTerminal,
  isInFlight,
  stateCopy,
  dispositionView,
  failureClassView,
  splitCitation,
  objectiveView,
  evidenceRows,
  verificationView,
  contextView,
  workerView,
  historyView,
  healthView,
  offlineView,
  cancelOutcome,
  submissionOutcome,
  redact,
};

// Loaded two ways on purpose: `require`d by the main process and the proof
// suite, and <script>-tagged by the sandboxed renderer, which has no module
// system. One definition, so the rendered wording and the tested wording can
// never drift apart.
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.JarvisPresentation = API;
