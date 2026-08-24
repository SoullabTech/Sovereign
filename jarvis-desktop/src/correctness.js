// Desktop C1 correctness decision.
//
// This is Desktop's OWN wiring logic, deliberately kept separate from the
// canonical verifier it consumes. It decides nothing about evidence itself —
// verifyEvidence() does that. It only maps a canonical evidence result onto the
// two facts the console displays, and it exists as its own module so the
// mapping can be tested without launching Electron.
//
// What it must never do is let execution success imply correctness. That
// collapse is exactly what allowed a fabricated capability
// ("EnumerateApiRoutes … desktop_alpha/modules/api_enumeration/
// register_capabilities.py:42" — a path that exists nowhere) to read as
// verified during the 2026-08-11 founder walk.

'use strict';

/**
 * @param {object} input
 * @param {string|null} input.materialization_error  message if selectors failed to resolve
 * @param {number}      input.fragmentCount          how many fragments were materialized
 * @param {object|null} input.evidence               canonical verifyEvidence() result
 * @param {string}      [input.contextOrigin]         'declared' | 'derived' | 'none'
 * @returns {{correctness:'verified'|'failed'|'unverified', correctness_reason:string|null}}
 */
function decideCorrectness({ materialization_error, fragmentCount, evidence, contextOrigin }) {
  // Fail closed. An unresolvable selector must not degrade into "nothing to
  // check, therefore fine" — that would turn a broken evidence request into a
  // silent pass.
  if (materialization_error) {
    return {
      correctness: 'failed',
      correctness_reason: `CONTEXT_MATERIALIZATION_FAILED — ${materialization_error}`,
    };
  }

  // No evidence context. Honest state is UNVERIFIED, never VERIFIED: there is
  // nothing for a claim to be contained by. Since selectors can now be derived
  // for an undeclared task, the reason distinguishes "nobody asked for
  // evidence" from "we looked and this repository had nothing to offer" — the
  // second is a finding about the question, not a missing field. The
  // NO_EVIDENCE_CONTEXT code is stable across both: what must never vary is
  // that neither becomes VERIFIED.
  if (!fragmentCount) {
    return {
      correctness: 'unverified',
      correctness_reason:
        contextOrigin === 'derived' || contextOrigin === 'none'
          ? 'NO_EVIDENCE_CONTEXT — no repository evidence could be derived for this task, so there is nothing to verify claims against'
          : 'NO_EVIDENCE_CONTEXT — task declared no context_selectors, so there is nothing to verify claims against',
    };
  }

  if (!evidence) {
    return {
      correctness: 'unverified',
      correctness_reason: 'NO_EVIDENCE_RESULT — verifier was not run',
    };
  }

  if (evidence.ok) {
    return {
      correctness: 'verified',
      correctness_reason: `${evidence.valid}/${evidence.total} citations contained in materialized evidence`,
    };
  }

  return {
    correctness: 'failed',
    correctness_reason:
      evidence.total === 0
        ? 'EVIDENCE_INSUFFICIENT — answer returned no citable file:line evidence'
        : `EVIDENCE_INSUFFICIENT — ${evidence.invalid}/${evidence.total} citations fall outside the materialized evidence`,
  };
}

module.exports = { decideCorrectness };
