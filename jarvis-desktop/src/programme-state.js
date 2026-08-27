// JARVIS-STAB — Programme state consistency.
//
// PURE DERIVATION + AUDIT. No I/O, no Electron, no network. This module holds
// the four state-consistency invariants (founder ruling 2026-08-27) and is the
// ONLY place a programme state block is allowed to be constructed or accepted.
//
//   1. If STATE is HOLD, BLOCKERS must contain at least one concrete
//      unresolved condition.
//   2. If BLOCKERS is none, STATE may not be HOLD for an unresolved
//      prerequisite.
//   3. If a value was not re-read this run, preserve the last verified value
//      AND a freshness marker. Never silently present it as current, and never
//      collapse it to an apparent unknown.
//   4. If contradictory workflow runs exist, adjudicate by order/attempt/
//      authority BEFORE reducing them to PASS/FAIL.
//
// Why this exists as enforced code rather than discipline:
//
// The 2026-08-27 founder walk caught a report that said, in the same block,
//   STATE     HOLD — required check `build` in_progress
//   BLOCKERS  none
// Both lines were individually defensible ("waiting only" is operationally
// true) and together they were a lie about the programme. That class of
// internal contradiction cannot be caught reliably by reading; it has to be
// impossible to represent.
//
// So STATE is DERIVED FROM BLOCKERS — never set alongside them. A caller
// cannot author the contradiction because a caller cannot author STATE.
// `auditStateBlock` exists for the other direction: a state block arriving
// from OUTSIDE (a Claude Code evidence receipt, a prior persisted run) is
// audited against the same invariants and REFUSED rather than displayed.
//
// The same walk caught the inverse failure: `PRODUCTION  not read this turn`
// discarded a known-good last-verified value and rendered as an unknown.
// Not-re-read and never-observed are different facts about the world, and the
// cockpit must not flatten them — that is invariant 3, and it is the same
// discipline `legibility.js` applies to UNVERIFIED.

'use strict';

// Same dual-export idiom as legibility.js / provenance.js / capability-form.js:
// loaded by main, renderer, and proof alike. A pure derivation needs no
// privilege and is deliberately NOT another IPC channel.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisProgrammeState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

// ── Programme state vocabulary ──────────────────────────────────────────────
// Deliberately small. These are ACTIONS the programme may take, not moods.
const ADVANCE = 'ADVANCE';   // no unresolved blocker; the next unit may proceed
const HOLD    = 'HOLD';      // at least one unresolved condition; do nothing
const DONE    = 'DONE';      // the unit's stop condition is satisfied

const STATES = Object.freeze([ADVANCE, HOLD, DONE]);

// ── Blocker kinds ───────────────────────────────────────────────────────────
// PREREQUISITE  a condition that is expected to resolve on its own (a running
//               check). Waiting is correct; it is still a blocker.
// FAILURE       something observed to have failed. Needs work, not patience.
// AUTHORITY     only a grant/decision changes this. Waiting never resolves it.
// UNOBSERVED    a required fact was never observed at all (invariant 3's floor).
// INDETERMINATE contradictory evidence that adjudication could not decide
//               (invariant 4's refusal — never silently resolved to PASS/FAIL).
const KIND = Object.freeze({
  PREREQUISITE: 'PREREQUISITE',
  FAILURE: 'FAILURE',
  AUTHORITY: 'AUTHORITY',
  UNOBSERVED: 'UNOBSERVED',
  INDETERMINATE: 'INDETERMINATE',
});

// ── Freshness vocabulary (invariant 3) ──────────────────────────────────────
// FRESH          re-read during THIS run. Current by observation.
// CARRIED        not re-read this run; last verified value preserved verbatim,
//                with when and by what it was verified.
// NEVER_OBSERVED no value has ever been verified. This is the only case that
//                may present as absent — and it says so explicitly.
const FRESHNESS = Object.freeze({
  FRESH: 'FRESH',
  CARRIED: 'CARRIED',
  NEVER_OBSERVED: 'NEVER_OBSERVED',
});

const FRESHNESS_LABEL = Object.freeze({
  FRESH: 'FRESHLY OBSERVED THIS RUN',
  CARRIED: 'NOT RE-READ THIS RUN',
  NEVER_OBSERVED: 'NEVER OBSERVED',
});

// ---------------------------------------------------------------------------
// Invariant 1's teeth: what counts as a CONCRETE unresolved condition.
//
// "Blockers: none" was the reported defect, but the same lie is available in
// costume — "unknown", "n/a", "tbd", "pending", "-", "" all assert a blocker
// while naming nothing that could ever be observed to resolve. A blocker whose
// condition cannot be checked is not a blocker; it is a mood, and it must be
// refused at construction so it can never reach a state block.
// ---------------------------------------------------------------------------
const NON_CONCRETE = Object.freeze([
  'none', 'n/a', 'na', 'tbd', 'unknown', 'pending', 'various', 'misc', '-', '—', '?',
]);

function isConcreteCondition(text) {
  if (typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < 8) return false;                       // too short to name a condition
  if (NON_CONCRETE.includes(t.toLowerCase())) return false;
  return true;
}

/**
 * Construct a blocker. Throws on a non-concrete condition rather than
 * returning a degraded object — a caller that cannot name the condition must
 * fail HERE, where the defect is, not downstream where it becomes a display.
 */
function blocker(id, condition, { kind = KIND.PREREQUISITE, detail = null, resolves_when = null } = {}) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('blocker(): id is required — a blocker must be addressable to be resolvable');
  }
  if (!isConcreteCondition(condition)) {
    throw new Error(
      `blocker(${id}): condition is not concrete (${JSON.stringify(condition)}). `
      + 'A blocker must name a condition that could be OBSERVED to resolve. '
      + 'If nothing is blocking, emit no blocker — do not emit an empty one.',
    );
  }
  if (!Object.prototype.hasOwnProperty.call(KIND, kind)) {
    throw new Error(`blocker(${id}): unknown kind ${JSON.stringify(kind)}`);
  }
  return Object.freeze({ id: id.trim(), condition: condition.trim(), kind, detail, resolves_when });
}

// ---------------------------------------------------------------------------
// Invariant 3 — observations carry their own freshness.
//
// These are the ONLY two constructors. There is no way to make a bare
// {field, value} pair, so there is no way to present a carried value as
// current: the freshness marker is not an annotation added at render time, it
// is part of the value's identity from the moment it is created.
// ---------------------------------------------------------------------------

/** A value re-read during this run. */
function observed(field, value, { at = null, by = null } = {}) {
  return Object.freeze({
    field,
    value,
    freshness: FRESHNESS.FRESH,
    verified_at: at,
    verified_by: by,
  });
}

/**
 * A value NOT re-read this run.
 *
 * `prior` is the observation record from the last run that did read it. If
 * there is none, the result is NEVER_OBSERVED with a null value — which is a
 * real fact, distinct from "we have a value but did not refresh it". The
 * defect this prevents is `PRODUCTION  not read this turn` erasing a known SHA.
 */
function carried(field, prior) {
  if (!prior || prior.value === undefined || prior.value === null) {
    return Object.freeze({
      field,
      value: null,
      freshness: FRESHNESS.NEVER_OBSERVED,
      verified_at: null,
      verified_by: null,
    });
  }
  return Object.freeze({
    field,
    value: prior.value,
    freshness: FRESHNESS.CARRIED,
    // Provenance is carried forward from the observation that actually made it,
    // never restamped with now() — restamping would forge freshness.
    verified_at: prior.verified_at || null,
    verified_by: prior.verified_by || null,
  });
}

/**
 * Cockpit rendering for one observation — the four-line block the founder
 * ruling specified. Returned as data, not a string, so the renderer owns
 * presentation and this module stays provable.
 */
function describeObservation(obs) {
  const required_before_deploy = obs.freshness !== FRESHNESS.FRESH;
  return {
    field: obs.field,
    value: obs.value === null ? '—' : String(obs.value),
    last_verified: obs.freshness === FRESHNESS.FRESH
      ? 'this run'
      : obs.verified_by
        ? `${obs.verified_by}${obs.verified_at ? ` (${obs.verified_at})` : ''}`
        : obs.freshness === FRESHNESS.NEVER_OBSERVED ? 'never' : 'unattributed prior observation',
    freshness: obs.freshness,
    freshness_label: FRESHNESS_LABEL[obs.freshness],
    // The point of preserving a carried value is to know it must be re-read
    // before it is ACTED on. Preserved ≠ current.
    must_reverify_before_acting: required_before_deploy,
  };
}

// ---------------------------------------------------------------------------
// Invariant 4 — adjudicate contradictory workflow runs before reducing them.
//
// The 2026-08-27 walk hit exactly this: a red Covenant run and a later green
// Covenant re-run for the same head. Reducing that set to "FAILED" (first
// match) or "PASSED" (any-success) are both wrong; the correct act is to
// establish which run SUPERSEDES the other and say so.
//
// Ordering authority, strongest first:
//   1. run_attempt  — a re-run of the same run is authoritative over its prior
//                     attempt by definition.
//   2. created_at   — a later run of the same workflow supersedes an earlier.
// If neither can separate two runs that DISAGREE, this refuses: the result is
// INDETERMINATE and becomes a blocker. Picking one silently is the failure.
// ---------------------------------------------------------------------------
const PENDING_STATUSES = Object.freeze(['queued', 'in_progress', 'waiting', 'requested', 'pending']);

function runConclusion(r) {
  if (r.status && PENDING_STATUSES.includes(String(r.status).toLowerCase())) return 'pending';
  const c = String(r.conclusion || '').toLowerCase();
  if (c === 'success') return 'success';
  if (!c) return 'pending';
  return 'failure';   // failure, timed_out, cancelled, action_required — all not-green
}

function adjudicateRuns(check, runs) {
  const list = Array.isArray(runs) ? runs.filter(Boolean) : [];
  if (!list.length) {
    return Object.freeze({
      check, adjudicated: true, conclusion: 'unobserved',
      authoritative: null, superseded: [], contradiction: false,
      basis: 'no runs observed for this check',
    });
  }

  // Sort weakest→strongest so the last element is authoritative.
  const ordered = [...list].sort((a, b) => {
    const at = String(a.created_at || ''), bt = String(b.created_at || '');
    if (at !== bt) return at.localeCompare(bt);
    return (a.run_attempt || 1) - (b.run_attempt || 1);
  });
  const authoritative = ordered[ordered.length - 1];
  const superseded = ordered.slice(0, -1);

  const conclusions = new Set(ordered.map(runConclusion));
  const contradiction = conclusions.size > 1;

  // Can the ordering actually SEPARATE the disagreeing runs? If the top two
  // disagree and are indistinguishable in both time and attempt, nothing here
  // has the authority to choose.
  if (contradiction && superseded.length) {
    const prev = superseded[superseded.length - 1];
    const sameTime = String(prev.created_at || '') === String(authoritative.created_at || '');
    const sameAttempt = (prev.run_attempt || 1) === (authoritative.run_attempt || 1);
    if (sameTime && sameAttempt && runConclusion(prev) !== runConclusion(authoritative)) {
      return Object.freeze({
        check, adjudicated: false, conclusion: 'indeterminate',
        authoritative: null, superseded: ordered, contradiction: true,
        basis: `two runs of '${check}' disagree and cannot be ordered `
             + `(identical created_at and run_attempt). Adjudication refuses rather than choosing.`,
      });
    }
  }

  return Object.freeze({
    check,
    adjudicated: true,
    conclusion: runConclusion(authoritative),
    authoritative,
    superseded,
    contradiction,
    basis: superseded.length
      ? `run ${authoritative.id ?? '?'} (created ${authoritative.created_at ?? '?'}, attempt `
        + `${authoritative.run_attempt ?? 1}) supersedes ${superseded.length} earlier run(s)`
        + (contradiction ? ' which reported a different conclusion' : '')
      : 'single observed run; nothing to adjudicate',
  });
}

/**
 * Turn adjudicated checks into blockers. A REQUIRED check that is pending or
 * failing is a concrete unresolved condition — which is precisely the line the
 * defective report rendered as "BLOCKERS none".
 */
function blockersFromChecks(adjudications, { required = [] } = {}) {
  const out = [];
  for (const a of adjudications || []) {
    const isRequired = required.includes(a.check);
    if (a.conclusion === 'indeterminate') {
      out.push(blocker(`check:${a.check}`,
        `Check '${a.check}' has contradictory runs that could not be adjudicated.`,
        { kind: KIND.INDETERMINATE, detail: a.basis, resolves_when: 'a distinguishable re-run is observed' }));
      continue;
    }
    if (!isRequired) continue;
    if (a.conclusion === 'pending') {
      out.push(blocker(`check:${a.check}`,
        `Required check '${a.check}' is still in progress.`,
        { kind: KIND.PREREQUISITE, detail: a.basis, resolves_when: `'${a.check}' reports a conclusion` }));
    } else if (a.conclusion === 'failure') {
      out.push(blocker(`check:${a.check}`,
        `Required check '${a.check}' concluded not-green.`,
        { kind: KIND.FAILURE, detail: a.basis, resolves_when: `'${a.check}' is green on the candidate head` }));
    } else if (a.conclusion === 'unobserved') {
      out.push(blocker(`check:${a.check}`,
        `Required check '${a.check}' was never observed on this head.`,
        { kind: KIND.UNOBSERVED, detail: a.basis, resolves_when: `'${a.check}' reports on the candidate head` }));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Invariants 1 + 2 — STATE is derived, never authored.
//
// There is no `state` parameter. The contradiction the founder caught is not
// rejected here; it is UNREPRESENTABLE, because the only way to obtain a
// programme state is to hand over the blockers it must be consistent with.
// ---------------------------------------------------------------------------
function deriveProgrammeState({ unit = null, blockers = [], observations = [], stop_condition_met = false } = {}) {
  const unresolved = (blockers || []).filter(Boolean);

  // A required fact that was never observed is itself an unresolved condition.
  // Without this, invariant 3 could be satisfied (the marker is present) while
  // the programme still advanced on a fact nobody ever checked.
  const unobserved = (observations || [])
    .filter((o) => o && o.required_before_advance && o.freshness === FRESHNESS.NEVER_OBSERVED)
    .map((o) => blocker(`observation:${o.field}`,
      `Required value '${o.field}' has never been observed.`,
      { kind: KIND.UNOBSERVED, resolves_when: `'${o.field}' is read at least once` }));

  const all = [...unresolved, ...unobserved];

  let state;
  if (all.length) state = HOLD;
  else if (stop_condition_met) state = DONE;
  else state = ADVANCE;

  return Object.freeze({
    unit,
    state,
    blockers: Object.freeze(all),
    observations: Object.freeze([...(observations || [])]),
    // The report line the defect got wrong, now derived from the same array the
    // state is derived from — the two cannot disagree.
    blockers_summary: all.length
      ? all.map((b) => b.condition)
      : ['none'],
    why: all.length
      ? `HOLD: ${all.length} unresolved condition(s) — ${all.map((b) => b.id).join(', ')}`
      : stop_condition_met
        ? 'DONE: the unit stop condition is satisfied.'
        : 'ADVANCE: no unresolved conditions; the next bounded unit may be issued.',
    action: all.length ? 'NO ACTION — wait or resolve the named condition(s)'
      : stop_condition_met ? 'CLOSE THE UNIT'
      : 'ISSUE THE NEXT BOUNDED UNIT',
  });
}

// ---------------------------------------------------------------------------
// The other direction: audit a state block that arrived from OUTSIDE.
//
// deriveProgrammeState() makes the contradiction unrepresentable for state we
// build. It cannot police a block that comes back in a Claude Code evidence
// receipt, or one rehydrated from a store written by an older build. Those get
// audited against the same four invariants and REFUSED — a contradictory
// programme state must never be displayed as if it were coherent.
//
// Returns violations rather than throwing: the caller needs to SHOW the
// contradiction, which means it needs it as data.
// ---------------------------------------------------------------------------
function auditStateBlock(view) {
  const v = [];
  if (!view || typeof view !== 'object') {
    return [{ code: 'NOT_A_STATE_BLOCK', detail: 'state block is absent or not an object' }];
  }

  const blockers = Array.isArray(view.blockers) ? view.blockers : [];
  const hasBlockers = blockers.length > 0;

  if (!STATES.includes(view.state)) {
    v.push({ code: 'UNKNOWN_STATE', detail: `state ${JSON.stringify(view.state)} is not one of ${STATES.join(', ')}` });
  }

  // Invariant 1.
  if (view.state === HOLD && !hasBlockers) {
    v.push({
      code: 'HOLD_WITHOUT_BLOCKER',
      detail: 'STATE is HOLD but BLOCKERS is empty. A hold must name at least one '
            + 'concrete unresolved condition; "waiting only" is still waiting on something.',
    });
  }

  // Invariant 1, in costume.
  for (const b of blockers) {
    if (!b || !isConcreteCondition(b.condition)) {
      v.push({
        code: 'BLOCKER_NOT_CONCRETE',
        detail: `blocker ${JSON.stringify(b && b.id)} does not name an observable condition: `
              + `${JSON.stringify(b && b.condition)}`,
      });
    }
  }

  // Invariant 2 — the inverse contradiction: advancing past a live blocker.
  if (view.state !== HOLD && hasBlockers) {
    v.push({
      code: 'ADVANCE_WITH_UNRESOLVED_BLOCKER',
      detail: `STATE is ${view.state} while ${blockers.length} blocker(s) remain unresolved.`,
    });
  }

  // Invariant 3.
  for (const o of Array.isArray(view.observations) ? view.observations : []) {
    if (!o || !Object.prototype.hasOwnProperty.call(FRESHNESS, o.freshness)) {
      v.push({
        code: 'OBSERVATION_WITHOUT_FRESHNESS',
        detail: `observation ${JSON.stringify(o && o.field)} carries no freshness marker, so a `
              + 'carried value would present as current.',
      });
      continue;
    }
    if (o.freshness === FRESHNESS.CARRIED && o.value === null) {
      v.push({
        code: 'CARRIED_WITHOUT_VALUE',
        detail: `observation ${JSON.stringify(o.field)} is marked CARRIED but preserves no value — `
              + 'that is NEVER_OBSERVED, and flattening the two erases a real distinction.',
      });
    }
  }

  // Invariant 4.
  for (const a of Array.isArray(view.adjudications) ? view.adjudications : []) {
    if (a && a.contradiction && !a.adjudicated) {
      v.push({
        code: 'UNADJUDICATED_CONTRADICTION',
        detail: `check '${a.check}' has contradictory runs reduced to '${a.conclusion}' without adjudication.`,
      });
    }
  }

  return v;
}

/** Convenience: a state block is displayable only if it audits clean. */
function isConsistent(view) {
  return auditStateBlock(view).length === 0;
}

  return {
    ADVANCE, HOLD, DONE, STATES, KIND, FRESHNESS, FRESHNESS_LABEL,
    isConcreteCondition, blocker,
    observed, carried, describeObservation,
    adjudicateRuns, runConclusion, blockersFromChecks,
    deriveProgrammeState, auditStateBlock, isConsistent,
  };
});
