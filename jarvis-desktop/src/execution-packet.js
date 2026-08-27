// JARVIS-STAB-03 — execution handoff packet.
//
// THE DEFECT THIS CLOSES. C3 terminated at a paragraph:
//   "Open a Claude Code session to execute this task."
// Correct about authority, useless as an act. The founder was handed prose and
// left to reconstruct, by hand, every fact the console already had on screen —
// which unit is active, what the candidate and canonical SHAs are, what the
// task may and may not touch, and what would count as done. Reconstruction is
// exactly the burden this programme exists to remove, and prose that tells you
// to go do it yourself is not a handoff.
//
// WHAT CHANGES AND WHAT DOES NOT. Authority does not change. Desktop still does
// NOT invoke Claude: auto-invocation would exercise founder identity without an
// active founder-driven session (§8), and that boundary is untouched here. What
// changes is that the boundary now ends in ONE act — a packet the founder hands
// over intact — instead of a paragraph.
//
// CUSTODY. The packet carries the run_id opened by task-runs.js. That id is the
// whole point: it is what lets the evidence come back and rejoin the run it
// came from (STAB-04), instead of arriving as an orphan report the founder has
// to match up by memory.
//
// HONESTY. Every SHA in the packet is an observation record from
// programme-state.js, so it carries its own freshness. A canonical SHA that was
// not re-read this run says so IN the packet rather than being shipped as
// current — a handoff that silently states a stale base is worse than one that
// states no base, because the worker will act on it.
'use strict';

(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./programme-state.js') : root.JarvisProgrammeState,
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisExecutionPacket = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PS) {

/**
 * Build the handoff packet.
 *
 * Nothing is invented. Every field is either supplied by the caller from
 * something already observed, or explicitly marked absent. There is no default
 * that guesses — a packet that fills in a plausible canonical SHA is the single
 * most dangerous thing this file could do.
 *
 * @param {object}  a
 * @param {string}  a.run_id        custody id from task-runs.openRun()
 * @param {string?} a.unit          active programme unit, e.g. VOICE-CAPTURE-01B-OBS
 * @param {object}  a.task          the routed task, verbatim
 * @param {object?} a.canonical_sha observation record (observed()/carried())
 * @param {object?} a.production_sha observation record
 * @param {object?} a.candidate_sha observation record
 * @param {string[]} a.allowed      files/surfaces the unit may touch
 * @param {string[]} a.forbidden    changes the unit may not make
 * @param {string[]} a.acceptance   what would count as done
 * @param {string?} a.stop_condition when to stop even if not done
 */
function buildPacket({
  run_id,
  unit = null,
  task = {},
  canonical_sha = null,
  production_sha = null,
  candidate_sha = null,
  allowed = [],
  forbidden = [],
  acceptance = [],
  stop_condition = null,
  lane = 'C3',
  reason = null,
  receipt_path = null,
} = {}) {
  if (!run_id) {
    // Refused rather than defaulted. A packet with no custody id produces an
    // orphan receipt, which is the failure mode STAB-04 exists to prevent — so
    // it must be impossible to create one, not merely discouraged.
    throw new Error('buildPacket(): run_id is required — a packet without custody cannot be rejoined to its run');
  }

  const shaField = (name, obs) => (obs ? PS.describeObservation(obs) : {
    field: name, value: '—', last_verified: 'never', freshness: PS.FRESHNESS.NEVER_OBSERVED,
    freshness_label: PS.FRESHNESS_LABEL.NEVER_OBSERVED, must_reverify_before_acting: true,
  });

  const packet = {
    run_id,
    unit,
    lane,
    routing_reason: reason,
    canonical_sha: shaField('canonical_sha', canonical_sha),
    production_sha: shaField('production_sha', production_sha),
    candidate_sha: shaField('candidate_sha', candidate_sha),
    task,
    allowed,
    forbidden,
    acceptance,
    stop_condition,
    // Stated IN the packet so the worker returns the shape STAB-04 can ingest.
    // A return format agreed only in conversation is a return format that drifts.
    return_format: RETURN_FORMAT,
    // And WHERE to return it. A return format with no agreed destination still
    // leaves the founder relaying the result by hand, which is the same
    // reconstruction burden in a smaller costume.
    receipt_path,
  };

  // A packet whose base is unknown is still issuable — some units genuinely do
  // not depend on it — but the caller must be able to SEE that it is, so the
  // condition is reported as data rather than buried in a rendered string.
  packet.unverified_bases = ['canonical_sha', 'production_sha', 'candidate_sha']
    .filter((f) => packet[f].freshness !== PS.FRESHNESS.FRESH)
    .map((f) => ({ field: f, freshness: packet[f].freshness, value: packet[f].value }));

  return packet;
}

/**
 * The shape a worker must return. Kept here, beside the packet that requests
 * it, so the request and the ingestion contract cannot drift apart.
 */
const RETURN_FORMAT = Object.freeze({
  run_id: 'the run_id from this packet, verbatim',
  branch: 'branch the work landed on',
  candidate_sha: 'head SHA produced, or null if nothing was pushed',
  diff_summary: 'files changed and why — not the diff body',
  tests: 'what was run and the actual result',
  pr: 'PR url/number, or null',
  observations: 'array of {field, value, freshness, verified_at, verified_by} — freshness is REQUIRED on every entry',
  claim: 'what this run establishes',
  non_claim: 'what this run does NOT establish — required, and it may not be empty',
  next_boundary: 'the next bounded unit, or null if the programme should hold',
});

/** Plain-text rendering for the clipboard / packet file. */
function renderPacket(p) {
  const sha = (f) => `${p[f].value}  [${p[f].freshness_label}${p[f].last_verified !== 'this run' ? `; last verified: ${p[f].last_verified}` : ''}]`;
  const list = (xs, empty) => (xs && xs.length ? xs.map((x) => `  - ${x}`).join('\n') : `  ${empty}`);
  return [
    `RUN ID            ${p.run_id}`,
    `ACTIVE UNIT       ${p.unit || '(none declared)'}`,
    `LANE              ${p.lane}${p.routing_reason ? ` — ${p.routing_reason}` : ''}`,
    '',
    `CANONICAL SHA     ${sha('canonical_sha')}`,
    `PRODUCTION SHA    ${sha('production_sha')}`,
    `CANDIDATE SHA     ${sha('candidate_sha')}`,
    '',
    'TASK',
    `  ${typeof p.task === 'string' ? p.task : JSON.stringify(p.task, null, 2).split('\n').join('\n  ')}`,
    '',
    'ALLOWED FILES / SURFACES',
    list(p.allowed, '(not constrained — treat as a defect in the packet, not as permission)'),
    '',
    'FORBIDDEN CHANGES',
    list(p.forbidden, '(none declared)'),
    '',
    'ACCEPTANCE',
    list(p.acceptance, '(none declared — this unit cannot be verified as done)'),
    '',
    `STOP CONDITION    ${p.stop_condition || '(none declared)'}`,
    '',
    `RETURN FORMAT — write this JSON to:`,
    `  ${p.receipt_path || '(no receipt path — custody cannot be rejoined; this is a defect in the packet)'}`,
    Object.entries(p.return_format).map(([k, v]) => `  ${k}: ${v}`).join('\n'),
    '',
    p.unverified_bases.length
      ? `NOTE  ${p.unverified_bases.length} base SHA(s) were not re-read this run `
        + `(${p.unverified_bases.map((u) => u.field).join(', ')}). Re-verify before acting on them.`
      : 'NOTE  all base SHAs were freshly observed this run.',
  ].join('\n');
}

  return { buildPacket, renderPacket, RETURN_FORMAT };
});
