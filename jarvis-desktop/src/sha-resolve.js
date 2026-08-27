// JARVIS-STAB-07 — commit identity resolution.
//
// THE DEFECT THIS CLOSES. STAB-06 compared base SHAs by prefix with a 7-char
// floor. That correctly stopped false drift between a short packet base and a
// full-SHA receipt, but it quietly promoted an abbreviation to an IDENTITY:
// "these seven characters match, therefore this is the same commit." Seven hex
// characters are a presentation convenience, not a unique object id — git
// itself lengthens abbreviations as a repository grows precisely because they
// stop being unique.
//
// So identity is now decided the only way it can be decided: by resolving each
// abbreviation against the repository to its canonical 40-character object id
// and comparing those. An abbreviation that is AMBIGUOUS or UNRESOLVABLE does
// not fall back to prefix matching — falling back would reinstate exactly the
// assumption being removed. It resolves to "unknown", which is a real answer
// that the currency logic knows how to carry.
//
// ONLY OBJECT IDS ARE RESOLVED. The pattern below admits hex only, so a receipt
// claiming `base_sha: "main"` or `"HEAD~2"` cannot be resolved into whatever
// those name TODAY. A moving ref is not evidence of a base; accepting one would
// let a receipt silently re-point itself every time the branch advanced.
'use strict';

const { execFileSync } = require('node:child_process');

// Git's own minimum useful abbreviation is 4. Below that, refuse to even ask.
const OBJECT_ID = /^[0-9a-f]{4,40}$/i;

const OUTCOME = Object.freeze({
  RESOLVED: 'RESOLVED',
  AMBIGUOUS: 'AMBIGUOUS',
  UNKNOWN: 'UNKNOWN',       // not a commit in this repository
  MALFORMED: 'MALFORMED',   // not an object id at all (a ref name, prose, empty)
  NO_REPO: 'NO_REPO',       // nothing to resolve against
});

/**
 * Build a resolver bound to one repository.
 *
 * `exec` is injectable so the resolution CONTRACT can be proven without a git
 * tree — including the ambiguity and malformed paths, which are awkward to
 * produce on demand in a real repository but are exactly the cases that matter.
 */
function makeResolver(root, { exec = execFileSync, env = undefined } = {}) {
  return function resolve(sha) {
    if (!root) return { outcome: OUTCOME.NO_REPO, full: null, reason: 'no repository is bound; commit identity cannot be resolved' };
    if (typeof sha !== 'string' || !OBJECT_ID.test(sha.trim())) {
      return {
        outcome: OUTCOME.MALFORMED, full: null,
        reason: `${JSON.stringify(sha)} is not a commit object id. Refs and expressions are refused: `
              + 'a moving name is not evidence of a base.',
      };
    }
    const id = sha.trim().toLowerCase();
    try {
      // ^{commit} forces a commit (a tree or tag id is not a base), and
      // --verify makes an ambiguous or unknown abbreviation a non-zero exit
      // rather than a best guess.
      const out = exec('git', ['rev-parse', '--verify', '--end-of-options', `${id}^{commit}`], {
        cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env,
      }).trim();
      if (!/^[0-9a-f]{40}$/.test(out)) {
        return { outcome: OUTCOME.UNKNOWN, full: null, reason: `git returned an unexpected object id for ${id}` };
      }
      return { outcome: OUTCOME.RESOLVED, full: out, reason: null };
    } catch (e) {
      const err = String((e && (e.stderr || e.message)) || '');
      // Git says "short SHA1 ... is ambiguous" — a genuinely different fact from
      // "unknown revision", and the founder needs to be able to tell them apart.
      if (/ambiguous/i.test(err)) {
        return { outcome: OUTCOME.AMBIGUOUS, full: null, reason: `${id} is ambiguous in this repository — it does not identify one commit` };
      }
      return { outcome: OUTCOME.UNKNOWN, full: null, reason: `${id} does not resolve to a commit in this repository` };
    }
  };
}

/**
 * Compare two abbreviations as IDENTITIES.
 *
 * Three answers, deliberately not two: SAME, DIFFERENT, and UNKNOWN. Collapsing
 * UNKNOWN into either of the others is the whole class of error this file
 * exists to prevent — "we could not establish sameness" must never render as
 * "same", and must not render as "different" either, because that would refuse
 * a worker's real evidence over a repository we simply could not read.
 */
function compareIdentity(a, b, resolve) {
  const ra = resolve(a);
  const rb = resolve(b);
  if (ra.outcome !== OUTCOME.RESOLVED || rb.outcome !== OUTCOME.RESOLVED) {
    const bad = ra.outcome !== OUTCOME.RESOLVED ? ra : rb;
    return { verdict: 'UNKNOWN', reason: bad.reason, left: ra, right: rb };
  }
  return {
    verdict: ra.full === rb.full ? 'SAME' : 'DIFFERENT',
    reason: null, left: ra, right: rb,
  };
}

module.exports = { OBJECT_ID, OUTCOME, makeResolver, compareIdentity };
