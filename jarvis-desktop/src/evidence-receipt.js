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
 * SHA equality across abbreviation widths.
 *
 * A packet may carry a short SHA while a worker reports the full 40, or the
 * reverse. Comparing them as strings would report drift on every handoff, and
 * an alarm that fires constantly is an alarm that gets switched off — so
 * prefix-equality is the correct comparison, with a floor of 7 characters
 * because shorter is not an identification.
 */
function shaEq(a, b) {
  if (!isNonEmptyString(a) || !isNonEmptyString(b)) return false;
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (x.length < 7 || y.length < 7) return x === y;
  return x.startsWith(y) || y.startsWith(x);
}

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

  // ── JARVIS-STAB-06 — base lineage ─────────────────────────────────────────
  //
  // The packet named the base the work was to be done against. If the worker
  // reports having worked from a DIFFERENT base, this receipt is not evidence
  // about the run that issued the packet — it is evidence about some other
  // state of the tree, and accepting it would silently answer a question nobody
  // asked. That is refused.
  //
  // The requirement arises from the handoff, not from the receipt: a run that
  // never issued a packet has no base to be checked against, and demanding one
  // there would be ceremony.
  const issuedBase = run && run.handoff && run.handoff.bases ? run.handoff.bases.candidate_sha : null;
  if (issuedBase) {
    if (!isNonEmptyString(receipt.base_sha)) {
      v.push({
        code: 'MISSING_BASE_SHA',
        detail: `the handoff packet named base ${issuedBase}; the receipt must state the base_sha it `
              + 'actually worked from, or there is no way to tell what state of the tree this evidence describes',
      });
    } else if (!shaEq(receipt.base_sha, issuedBase)) {
      v.push({
        code: 'BASE_MISMATCH',
        detail: `receipt reports base ${receipt.base_sha} but the packet was issued against ${issuedBase}. `
              + 'This is evidence about a different tree state than the one this run asked about.',
      });
    }
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
function applyReceipt(run, receipt, { at = null, current_base = null } = {}) {
  const check = validateReceipt(receipt, run);
  if (!check.ok) {
    return { ok: false, violations: check.violations, run };
  }

  // ── JARVIS-STAB-06 — currency, decided separately from validity ───────────
  //
  // BASE_MISMATCH above is the worker's error. THIS is the world moving: the
  // packet was issued against a base that is no longer the current head. The
  // receipt is still perfectly good evidence — about the base it was produced
  // against. What it is NOT is a current statement about the tree as it stands
  // now, and the difference is the whole point.
  //
  // So the evidence is PRESERVED and SCOPED rather than either discarded or
  // silently promoted. Promotion is the failure mode: it is how "tests passed"
  // survives a rebase and becomes "tests pass".
  const issuedBase = run && run.handoff && run.handoff.bases ? run.handoff.bases.candidate_sha : null;
  let currency = 'NOT_APPLICABLE';   // no packet was ever issued; no base to be current against
  let base_drift = null;
  if (issuedBase) {
    if (!isNonEmptyString(current_base)) {
      // We could not read the head. That is not "current" — it is unknown, and
      // saying so is the same discipline invariant 3 applies to every value.
      currency = 'UNVERIFIED';
    } else if (shaEq(issuedBase, current_base)) {
      currency = 'CURRENT';
    } else {
      currency = 'HISTORICAL';
      base_drift = {
        issued_against: issuedBase,
        current_base,
        detail: `the head moved from ${issuedBase} to ${current_base} between handoff and return; `
              + 'this evidence describes the base it was produced against, not the current tree',
      };
    }
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
      base_sha: receipt.base_sha ?? null,
      // Currency travels WITH the evidence, for the same reason freshness
      // travels with an observation: a consumer must not be able to read the
      // value without also reading what it is a statement about.
      currency,
      base_drift,
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
    currency: e.currency || 'NOT_APPLICABLE',
    base_sha: e.base_sha || null,
    base_drift: e.base_drift || null,
    proposed_next: e.next_boundary
      ? { proposed_by: 'worker', unit: e.next_boundary, note: 'Proposed, not issued. Issuing the next unit is a founder act.' }
      : null,
    // The claim is never rendered without its bound, and — once a base has
    // drifted — never without the tree state it is a statement about.
    summary: e.currency === 'HISTORICAL'
      ? `[EVIDENCE ABOUT ${e.base_drift.issued_against}, NOT THE CURRENT HEAD] ${e.claim} — NOT established: ${e.non_claim}`
      : `${e.claim} — NOT established: ${e.non_claim}`,
  };
}

/**
 * Blockers arising from evidence lineage.
 *
 * Answers the founder ruling's "preserve it, or require reconciliation" with
 * BOTH: the evidence is preserved and scoped (above), AND drift raises a
 * concrete blocker so the programme cannot advance on it as though it were
 * current. Choosing only one of the two would leave the other half available as
 * a quiet collapse — preserved-but-unflagged evidence gets read as current, and
 * reconciliation-without-preservation throws away work that was genuinely done.
 */
function reconciliationBlockers(run, PSMod) {
  const B = PSMod || PS;
  const e = run && run.evidence;
  if (!e) return [];
  if (e.currency === 'HISTORICAL') {
    return [B.blocker('evidence:base_drift',
      `Evidence for this run was produced against ${e.base_drift.issued_against}, but the head is now `
      + `${e.base_drift.current_base}. It must be reconciled before it can be treated as current.`,
      { kind: B.KIND.INDETERMINATE, detail: e.base_drift.detail,
        resolves_when: 'the work is re-verified against the current head, or the run is closed as historical' })];
  }
  if (e.currency === 'UNVERIFIED') {
    return [B.blocker('evidence:currency_unverified',
      'The current head could not be read, so it is unknown whether this evidence still describes the tree.',
      { kind: B.KIND.UNOBSERVED, resolves_when: 'the head is readable and compared against the issued base' })];
  }
  return [];
}

  return { REQUIRED_FIELDS, shaEq, validateReceipt, applyReceipt, describeEvidence, reconciliationBlockers };
});
