// JOP-01 — Operator legibility.
//
// PURE DERIVATION. This module takes the status object the mechanism already
// produces and derives the founder-facing view. It computes NOTHING about the
// world: every fact here is promoted from `jarvis:status`, never invented.
//
// Why a separate pure module rather than logic in the renderer:
//   1. it can be proven in isolation, including by sabotage — a renderer is not
//      testable in the way an assertion about a refusal needs to be;
//   2. it makes the upgrade path structurally impossible rather than merely
//      unlikely. There is exactly ONE place that maps a raw state to a founder
//      state, and it cannot promote a refusal (see `mapState` + REFUSALS).
//
// The vocabulary the founder ruling requires, and what each MEANS:
//
//   READY           observed, working, usable now
//   WORKING         observed, currently doing something
//   NEEDS_SETUP     observed, not usable, and an OPERATOR act would fix it
//   NEEDS_AUTHORITY observed, not usable, and only a GRANT would change it
//   DEGRADED        observed, partially working, named shortfall
//   BLOCKED         observed, refused by a rule — NOT a malfunction
//   FAILED          observed, attempted, did not work
//   UNVERIFIED      NOT OBSERVED. The instrument did not run or could not reach.
//
// UNVERIFIED is the load-bearing one. The old surface said UNKNOWN for six
// different situations. UNVERIFIED here always carries WHY the observation did
// not happen, because "we did not look" and "we looked and found nothing" are
// different facts. That is the same discipline the mechanism applies to
// evidence: an absence must declare the population it actually observed.

'use strict';

// Same dual-export idiom as provenance.js / capability-form.js: loaded by main,
// renderer, and proof. Deliberately NOT a tenth IPC channel — the preload
// surface is guarded at exactly nine, and a pure derivation needs no privilege.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisLegibility = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const READY = 'READY';
const WORKING = 'WORKING';
const NEEDS_SETUP = 'NEEDS_SETUP';
const NEEDS_AUTHORITY = 'NEEDS_AUTHORITY';
const DEGRADED = 'DEGRADED';
const BLOCKED = 'BLOCKED';
const FAILED = 'FAILED';
const UNVERIFIED = 'UNVERIFIED';

const STATES = Object.freeze([
  READY, WORKING, NEEDS_SETUP, NEEDS_AUTHORITY, DEGRADED, BLOCKED, FAILED, UNVERIFIED,
]);

/**
 * States that represent a refusal, an absence of observation, or a failure.
 * NOTHING in this module may map a raw refusal onto READY or WORKING. The
 * sabotage control for this unit asserts exactly that, because the failure it
 * guards against — a presentation layer quietly upgrading a governed refusal
 * into "fine" — is the one that would make the whole surface untrustworthy.
 */
const NON_OPERATIONAL = Object.freeze([
  NEEDS_SETUP, NEEDS_AUTHORITY, DEGRADED, BLOCKED, FAILED, UNVERIFIED,
]);

/** Raw mechanism vocabulary → founder vocabulary. The ONLY such mapping. */
function mapState(raw, { remediable = true } = {}) {
  switch (raw) {
    case 'AVAILABLE': return READY;
    case 'DEGRADED': return DEGRADED;
    case 'UNAVAILABLE': return remediable ? NEEDS_SETUP : NEEDS_AUTHORITY;
    case 'UNKNOWN':
    case null:
    case undefined: return UNVERIFIED;
    default: return UNVERIFIED; // an unrecognised state is NOT a healthy one
  }
}

/** True when the repo-root string is the mechanism's own not-bound sentinel. */
function isUnbound(repoRoot) {
  return !repoRoot || /^UNKNOWN\b/.test(String(repoRoot));
}

/**
 * The reason/remediation the mechanism already embedded in its own not-bound
 * sentinel. Split rather than rewritten, so the founder sees the mechanism's
 * words and not a Desktop paraphrase of them.
 */
function splitBindingSentinel(repoRoot) {
  const s = String(repoRoot || '');
  const i = s.indexOf('—');
  const rawReason = i === -1 ? s : s.slice(0, i).trim();
  const remediation = i === -1 ? null : s.slice(i + 1).trim();
  // Packaged-walk defect (2026-08-16): the sentinel's own leading token is the
  // literal string "UNKNOWN (packaged mode)". Rendering it verbatim put a bare
  // UNKNOWN back on the founder-facing screen — the exact thing this unit
  // removes. The mode is kept; the raw token is not.
  const mode = /\(([a-z]+) mode\)/.exec(rawReason);
  const reason = /^UNKNOWN\b/.test(rawReason)
    ? `No eligible Sovereign checkout was resolved${mode ? ` (${mode[1]} build)` : ''}.`
    : rawReason;
  return { reason, remediation, raw: rawReason };
}

/**
 * What each organ IS, in a sentence a founder can read.
 *
 * Second founder-walk defect (2026-08-16): a READY row showed no reason (correct
 * — nothing is wrong) and therefore rendered with only its evidence id beneath
 * it, e.g. `jarvis:status.route_a`. A screen whose only explanation is an
 * internal identifier has not been made legible; it has been made to look
 * legible. Names like "Route A" and "Deterministic registry" are ours, not the
 * founder's, so each one says what it does.
 */
const DESCRIPTIONS = Object.freeze({
  'Builder execution mechanism': 'Runs bounded work units against this checkout, read-only.',
  'Builder OS': 'Tracks who is working on what, and stops two lanes claiming the same unit.',
  'Deterministic registry': 'The fixed set of actions JARVIS can take without a language model.',
  'Local model worker': 'A model running on this machine, used for work that stays local.',
  'Claude reasoning': 'Claude is available to think through work with you.',
  'Automatic C3 execution': 'Letting JARVIS run Claude work on its own, unattended.',
  'Desktop runtime': 'This application itself.',
  'Artifact identity': 'Which build of JARVIS this window is.',
  'Execution substrate': 'The checkout this window is actually operating on.',
});

function organ(name, raw, opts = {}) {
  const state = mapState(raw?.state, opts);
  const detail = typeof raw?.detail === 'string' ? raw.detail : null;
  return {
    name,
    describes: DESCRIPTIONS[name] || null,
    state,
    reason: state === READY ? null : (detail || opts.reason || null),
    remediation: state === READY ? null : (opts.remediation ?? null),
    evidence: opts.evidence || null,
  };
}

/**
 * Derive the whole founder-facing view from one status object.
 * @param {object} status - the `jarvis:status` result, verbatim.
 */
function deriveOperatorView(status) {
  const s = status || {};
  const unbound = isUnbound(s.repo_root);
  const bindingSentinel = splitBindingSentinel(s.repo_root);

  // ── binding ───────────────────────────────────────────────────────────────
  const binding = {
    bound: !unbound,
    root: unbound ? null : s.repo_root,
    mode: s.repo_root_mode || null,
    state: unbound ? NEEDS_SETUP : READY,
    reason: unbound ? bindingSentinel.reason : null,
    remediation: unbound ? bindingSentinel.remediation : null,
    provenance: s.provenance || null,
    evidence: 'jarvis:status.repo_root',
  };

  // ── mechanism ─────────────────────────────────────────────────────────────
  // The distinction JOP-00 earned, preserved verbatim: "nothing is bound" and
  // "the bound repo cannot do this" are different states with different acts.
  const mech = organ('Builder execution mechanism', s.builder_mechanism, {
    remediation: unbound
      ? 'Bind a Sovereign checkout.'
      : 'This checkout does not carry the mechanism. Bind a checkout at or after the cluster landing.',
    evidence: 'jarvis:status.builder_mechanism',
  });

  // ── organs whose observation DEPENDS on a binding ─────────────────────────
  // When nothing is bound these were never probed. Say that, rather than
  // rendering an unobserved organ as UNKNOWN and letting it read as broken.
  const dependent = (name, raw, key) => {
    if (unbound && (!raw || raw.state === 'UNKNOWN')) {
      return {
        name,
        describes: DESCRIPTIONS[name] || null,
        state: UNVERIFIED,
        reason: 'Not observed — no repository is bound, so this was never probed.',
        remediation: 'Bind a Sovereign checkout, then re-check.',
        evidence: `not reached`,
      };
    }
    return organ(name, raw, { evidence: `jarvis:status.${key}` });
  };

  const organs = [
    dependent('Builder OS', s.builder_os, 'builder_os'),
    dependent('Deterministic registry', s.route_a, 'route_a'),
    dependent('Local model worker', s.local_worker, 'local_worker'),
  ];

  // ── Claude: two facts, never one ──────────────────────────────────────────
  // The old row said "Claude lane AVAILABLE", which conflated a reasoning
  // capability that exists with an execution authority that deliberately does
  // not. Absent-by-design must not read as broken, and a live session must not
  // read as executable.
  const claudeReasoning = {
    name: 'Claude reasoning',
    describes: DESCRIPTIONS['Claude reasoning'],
    state: mapState(s.claude_lane?.state),
    reason: null,
    remediation: null,
    evidence: null,
  };
  const claudeExecution = {
    name: 'Automatic C3 execution',
    describes: DESCRIPTIONS['Automatic C3 execution'],
    state: NEEDS_AUTHORITY,
    reason: 'Not authorized. The router may select C3; this Desktop does not execute it.',
    remediation: null, // deliberate: no operator act grants this
    by_design: true,
    evidence: null,
  };

  const runtime = organ('Desktop runtime', s.desktop_runtime, { evidence: 'jarvis:status.desktop_runtime' });

  // ── can do now ────────────────────────────────────────────────────────────
  const all = [mech, ...organs, claudeReasoning, claudeExecution, runtime];
  const capabilities = {
    available: all.filter(o => o.state === READY || o.state === WORKING),
    unverified: all.filter(o => o.state === UNVERIFIED || o.state === DEGRADED
                              || o.state === NEEDS_SETUP || o.state === FAILED || o.state === BLOCKED),
    not_authorized: all.filter(o => o.state === NEEDS_AUTHORITY),
  };

  // ── active work — observed, never inferred ────────────────────────────────
  const sessions = Array.isArray(s.sessions) ? s.sessions : [];
  const observable = !unbound && s.builder_os?.state === 'AVAILABLE';
  const activeWork = {
    observable,
    sessions,
    summary: !observable
      ? 'Not observed — the session governor could not be read.'
      : (sessions.length === 0 ? 'No active work observed.'
                              : `${sessions.length} session(s) active.`),
  };

  // ── needs founder — a technical failure is NOT a founder decision ─────────
  // Founder-walk defect (2026-08-16): these rendered as bare badges reading
  // STALE / CAPACITY. Those are nouns, not requests — a founder cannot act on a
  // claim_state they have never been told the meaning of. Every hold now
  // carries what it MEANS and what would resolve it, same contract as an organ.
  const holds = (Array.isArray(s.governance_holds) ? s.governance_holds : []).map(describeHold);
  const needsFounder = {
    items: holds,
    summary: holds.length === 0
      ? 'Nothing currently requires founder action.'
      : `${holds.length} item(s) require founder action.`,
  };

  // ── operational sentence — derived, never hard-coded optimism ─────────────
  const sentence = operationalSentence({ unbound, mech, claudeReasoning, claudeExecution });

  return {
    observed_at: s.observed_at || null,
    headline: sentence.headline,
    sentence: sentence.body,
    binding,
    capabilities,
    organs: all,
    active_work: activeWork,
    needs_founder: needsFounder,
  };
}

/**
 * Turn a governor claim_state into something a founder can act on.
 *
 * The governor's vocabulary is correct and stays authoritative — `claim_state`
 * is passed through untouched. What is added is the plain-language meaning and
 * the act, because "STALE" tells a founder nothing and "CAPACITY" is not even
 * phrased as a request. An unrecognised claim_state is described as
 * unrecognised rather than silently rendered as a bare badge again.
 */
function describeHold(h) {
  const base = { ...h };
  switch (h && h.claim_state) {
    case 'STALE':
      return { ...base,
        means: 'A work claim is still held, but its worker stopped sending heartbeats.',
        remediation: 'Recover the claim if the work should continue, or close it to release the lane.' };
    case 'AMBIGUOUS_OWNERSHIP':
      return { ...base,
        means: 'Two lanes appear to hold the same claim. Ownership cannot be decided mechanically.',
        remediation: 'Decide which lane owns this unit, then close the other.' };
    case 'CAPACITY':
      return { ...base,
        means: 'Work is queued because every execution slot is already claimed.',
        remediation: 'Nothing is broken. Close finished claims to free a slot, or let the queue drain.' };
    default:
      return { ...base,
        means: `Held with an unrecognised state${h && h.claim_state ? ` (${h.claim_state})` : ''}.`,
        remediation: 'Inspect the session governor directly — this surface cannot explain this state.' };
  }
}

/**
 * Provenance rows go through the SAME mapping as everything else.
 *
 * Founder-walk defect (2026-08-16): "Artifact identity — UNKNOWN" was left
 * rendering raw on the Home screen while this unit claimed to have removed
 * bare UNKNOWNs. It read as broken; it actually means the app is running from
 * source rather than a stamped build, which is a normal dev state. An
 * unstamped dev run is not a fault, and must not be coloured like one.
 */
function describeProvenanceRow(name, row) {
  const state = mapState(row && row.state);
  const detail = row && typeof row.detail === 'string' ? row.detail : null;
  const unstamped = state === UNVERIFIED;
  return {
    name,
    describes: DESCRIPTIONS[name] || null,
    state,
    // The mechanism's own detail already explains this. Appending a second
    // sentence produced the double-written line the walk flagged, so the detail
    // is used as-is and only the remediation is added.
    reason: state === READY ? null
      : (detail || 'No identity stamp — running from source rather than a packaged build.'),
    remediation: state === READY ? null
      : (unstamped ? 'Nothing to fix while developing. A packaged build stamps its own identity.' : null),
    by_design: unstamped,
    // READY provenance still shows its detail, so this row is never a bare badge.
    note: state === READY ? detail : null,
    evidence: null,
  };
}

function operationalSentence({ unbound, mech, claudeReasoning, claudeExecution }) {
  const parts = [];
  let headline;

  if (unbound) {
    headline = 'JARVIS cannot operate yet.';
    parts.push('No Sovereign repository is connected, so nothing about the build system has been observed.');
  } else if (mech.state !== READY) {
    headline = 'JARVIS is connected, but cannot operate the build system.';
    parts.push('A Sovereign repository is bound, but this checkout does not carry the execution mechanism.');
  } else {
    headline = 'JARVIS is operating.';
    parts.push('A Sovereign repository is bound and the governed read-only execution lane is available.');
  }

  if (claudeReasoning.state === READY) {
    parts.push('Claude reasoning is available; automatic C3 execution is not authorized.');
  } else {
    parts.push('Claude reasoning is not currently observed.');
  }

  return { headline, body: parts.join(' ') };
}

  return {
    STATES, NON_OPERATIONAL,
    READY, WORKING, NEEDS_SETUP, NEEDS_AUTHORITY, DEGRADED, BLOCKED, FAILED, UNVERIFIED,
    mapState, isUnbound, splitBindingSentinel, describeHold, describeProvenanceRow,
    deriveOperatorView,
  };
});
