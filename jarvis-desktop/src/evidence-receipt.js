// JARVIS-STAB-04 — evidence returns and rejoins its run.
//
// This is the half that turns a router into a conductor. STAB-03 hands a packet
// out under a run_id; this ingests what comes back and reattaches it to that
// same run, so the console can show programme state the founder did not have to
// reconstruct.
//
// A RECEIPT IS EVIDENCE, NOT TESTIMONY. It arrives from outside this process
// and is treated the way every other outside claim in this app is treated: it
// is validated, and a receipt that fails validation is REFUSED WHOLE. Partial
// ingestion is specifically rejected — a half-applied receipt produces a run
// record that is neither the old state nor the reported one, and no one can
// tell which fields are which afterwards.
//
// THREE THINGS ARE ENFORCED, AND EACH HAS A HISTORY:
//
//   1. run_id must match a run this console actually opened. A receipt naming
//      an unknown run is an orphan report, which is the reconstruction burden
//      re-entering by the back door.
//
//   2. `non_claim` is REQUIRED and may not be empty. A worker that reports what
//      it established without bounding what it did NOT establish is how
//      "execution succeeded" becomes "the answer is correct" — the exact
//      collapse correctness.js was written to stop after the 2026-08-11 founder
//      walk, where a fabricated capability read as verified. The bound is not
//      politeness; it is the load-bearing half of the claim.
//
//   3. every observation carries freshness. A receipt that reports
//      `production_sha: 64c2b7c07` with no freshness marker asserts a current
//      reading it may not have taken (invariant 3).
//
// Any programme-state block inside the receipt is audited by the SAME
// auditStateBlock the console applies to its own — so a report that says
// "HOLD ... blockers: none" is refused on the way in, not noticed later by eye.
'use strict';

(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./programme-state.js') : root.JarvisProgrammeState,
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisEvidenceReceipt = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PS) {

const REQUIRED_FIELDS = Object.freeze(['run_id', 'claim', 'non_claim']);

const isNonEmptyString = (x) => typeof x === 'string' && x.trim().length > 0;

/**
 * Validate a receipt against the run it names.
 *
 * @param {object} receipt  parsed JSON as returned by the worker
 * @param {object|null} run the durable run record, or null if not found
 * @returns {{ok: boolean, violations: Array<{code, detail}>}}
 */
function validateReceipt(receipt, run) {
  const v = [];
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return { ok: false, violations: [{ code: 'NOT_A_RECEIPT', detail: 'receipt is absent or not a JSON object' }] };
  }

  for (const f of REQUIRED_FIELDS) {
    if (!isNonEmptyString(receipt[f])) {
      v.push({
        code: 'MISSING_REQUIRED_FIELD',
        detail: f === 'non_claim'
          ? 'non_claim is required and may not be empty. A claim without its bound is how '
            + '"it ran" becomes "it is correct" — state explicitly what this run does NOT establish.'
          : `${f} is required and may not be empty`,
      });
    }
  }

  // Custody. Checked even when run_id is present-but-unknown, because those are
  // different problems: one is a malformed receipt, the other is a real report
  // about a run this console has no record of.
  if (isNonEmptyString(receipt.run_id) && !run) {
    v.push({
      code: 'UNKNOWN_RUN',
      detail: `no router run '${receipt.run_id}' exists in durable history — this receipt has no custody `
            + 'to rejoin and would be an orphan report',
    });
  }
  if (run && run.run_id !== receipt.run_id) {
    v.push({ code: 'RUN_MISMATCH', detail: `receipt names ${receipt.run_id} but was matched to ${run.run_id}` });
  }

  // Invariant 3 on everything the receipt asserts about the world.
  const obs = receipt.observations;
  if (obs !== undefined && obs !== null) {
    if (!Array.isArray(obs)) {
      v.push({ code: 'OBSERVATIONS_NOT_ARRAY', detail: 'observations must be an array when present' });
    } else {
      for (const o of obs) {
        if (!o || !isNonEmptyString(o.field)) {
          v.push({ code: 'OBSERVATION_UNNAMED', detail: 'every observation must name its field' });
          continue;
        }
        if (!Object.prototype.hasOwnProperty.call(PS.FRESHNESS, o.freshness)) {
          v.push({
            code: 'OBSERVATION_WITHOUT_FRESHNESS',
            detail: `observation '${o.field}' carries no freshness marker (${Object.keys(PS.FRESHNESS).join('/')}), `
                  + 'so a value that was not re-read would present as current',
          });
        } else if (o.freshness === PS.FRESHNESS.CARRIED && (o.value === null || o.value === undefined)) {
          v.push({
            code: 'CARRIED_WITHOUT_VALUE',
            detail: `observation '${o.field}' is CARRIED but preserves no value — that is NEVER_OBSERVED`,
          });
        }
      }
    }
  }

  // A programme-state block inside a receipt goes through the console's own audit.
  if (receipt.programme_state) {
    for (const x of PS.auditStateBlock(receipt.programme_state)) {
      v.push({ code: `PROGRAMME_STATE:${x.code}`, detail: x.detail });
    }
  }

  return { ok: v.length === 0, violations: v };
}

/**
 * Apply a VALIDATED receipt to its run, returning a new record.
 *
 * Refuses on invalid input rather than applying what it can: see the whole-or-
 * nothing note at the top. The evidence is stored under `evidence` rather than
 * spread across the run, so the worker's report can never overwrite what THIS
 * console observed — the two stay separable, and a later reader can always tell
 * which facts the console established and which the worker asserted.
 */
function applyReceipt(run, receipt, { at = null } = {}) {
  const check = validateReceipt(receipt, run);
  if (!check.ok) {
    return { ok: false, violations: check.violations, run };
  }
  const next = {
    ...run,
    evidence: {
      received_at: at,
      branch: receipt.branch ?? null,
      candidate_sha: receipt.candidate_sha ?? null,
      diff_summary: receipt.diff_summary ?? null,
      tests: receipt.tests ?? null,
      pr: receipt.pr ?? null,
      observations: Array.isArray(receipt.observations) ? receipt.observations : [],
      claim: receipt.claim,
      non_claim: receipt.non_claim,
      next_boundary: receipt.next_boundary ?? null,
      programme_state: receipt.programme_state ?? null,
    },
    // Deliberately NOT set to COMPLETED. The run's own state describes what THIS
    // console did — it routed C3 and did not execute — and that remains true no
    // matter what the worker reports. Overwriting it would let a receipt rewrite
    // the console's own history of its own acts.
    evidence_received: true,
  };
  return { ok: true, violations: [], run: next };
}

/**
 * What the founder should see next, derived from the receipt rather than
 * reconstructed. `next_boundary` is a PROPOSAL from the worker, never an
 * instruction — issuing the next unit stays a founder act, so this returns it
 * labelled as proposed.
 */
function describeEvidence(run) {
  const e = run && run.evidence;
  if (!e) return { received: false, summary: 'No evidence has returned for this run yet.', proposed_next: null };
  return {
    received: true,
    branch: e.branch,
    candidate_sha: e.candidate_sha,
    pr: e.pr,
    tests: e.tests,
    claim: e.claim,
    non_claim: e.non_claim,
    observations: (e.observations || []).map((o) => PS.describeObservation(o)),
    proposed_next: e.next_boundary
      ? { proposed_by: 'worker', unit: e.next_boundary, note: 'Proposed, not issued. Issuing the next unit is a founder act.' }
      : null,
    summary: `${e.claim} — NOT established: ${e.non_claim}`,
  };
}

  return { REQUIRED_FIELDS, validateReceipt, applyReceipt, describeEvidence };
});
