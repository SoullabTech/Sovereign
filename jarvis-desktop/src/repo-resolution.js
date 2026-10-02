// JARVIS Desktop — dev-mode substrate resolution ORDER, isolated so it can be
// tested without Electron.
//
// This module deliberately contains no filesystem access, no config reading and
// no environment reading. It owns exactly one thing: the ORDER in which dev mode
// consults the sources main.js already implements. Keeping the order here and
// the sources there means a test can prove the precedence without stubbing
// Electron, and — more importantly — there is still only ONE implementation of
// each source. A second copy of "how do I read the config" living in a test
// helper is the sibling-implementation failure this codebase keeps paying for.
//
// WHY THIS EXISTS (JOP-04, founder walk 2026-08-17).
// Dev mode's resolution used to be a single upward walk from __dirname. When the
// launching checkout did not carry the four canonical Builder OS markers — the
// ordinary case for a checkout sitting on a branch that predates the builder
// cluster, or a worktree cut from one — the walk returned null and dev mode
// stopped there. It never consulted JARVIS_REPO_ROOT and never consulted the
// persisted choice, both of which packaged mode has always honoured. The result
// on screen was "repo root not found — cannot route" from Work, and UNKNOWN on
// every System row that depends on a bound substrate, while a valid saved
// workspace sat unread in config.json. Dev was the mode WITHOUT a durable
// resolver, which is exactly backwards: dev is where checkouts get rebased,
// moved and cut into worktrees, so it is where markers actually go missing.
//
// WHY THE WALK STILL WINS. Launching from inside a checkout is an explicit,
// present-tense statement about which substrate you mean. A saved choice is a
// statement made on some earlier day. The newer, more specific statement wins —
// and because the walk is tried first, the fix cannot change the binding of any
// dev launch that was already resolving correctly.

'use strict';

/**
 * Decide packaged-mode substrate binding without granting authority to a
 * hard-coded candidate. The candidate may be surfaced as a suggestion only.
 */
function resolvePackagedMode({ envRoot, config, defaultCandidate, isValidRepoRoot, RESOLUTION }) {
  const cfg = config || { present: false, repo_root: null, problem: null };
  const validEnv = !!envRoot && isValidRepoRoot(envRoot);
  const validConfig = !!cfg.present && !!cfg.repo_root && isValidRepoRoot(cfg.repo_root);
  const suggestedRepoRoot = defaultCandidate && isValidRepoRoot(defaultCandidate)
    ? defaultCandidate
    : null;

  if (validEnv) {
    const conflictingConfigRoot = validConfig && cfg.repo_root !== envRoot ? cfg.repo_root : null;
    const configProblem = conflictingConfigRoot
      ? `JARVIS_REPO_ROOT is set in the launch environment (${envRoot}) and OVERRIDES your saved choice (${cfg.repo_root}). If it is set at the launchd level, every Finder/Dock launch inherits it. Clear it with:  launchctl unsetenv JARVIS_REPO_ROOT  (then quit and relaunch JARVIS).`
      : null;
    return { root: envRoot, resolution: RESOLUTION.ENV, configProblem, conflictingConfigRoot, suggestedRepoRoot: null };
  }

  const problems = [];
  if (envRoot) problems.push(`JARVIS_REPO_ROOT does not carry the canonical markers: ${envRoot}`);
  if (cfg.problem) problems.push(cfg.problem);
  else if (cfg.present && !validConfig) problems.push(`configured repository no longer carries the canonical markers: ${cfg.repo_root}`);

  if (validConfig) {
    return {
      root: cfg.repo_root,
      resolution: RESOLUTION.CONFIG,
      configProblem: problems.length ? problems.join(' — and ') : null,
      conflictingConfigRoot: null,
      suggestedRepoRoot: null,
    };
  }

  return {
    root: null,
    resolution: RESOLUTION.NONE,
    configProblem: problems.length ? problems.join(' — and ') : null,
    conflictingConfigRoot: null,
    suggestedRepoRoot,
  };
}

/**
 * Decide the dev-mode substrate binding.
 *
 * Every argument is a thunk supplying a source main.js already owns. Nothing is
 * read here, so the precedence is the only thing under test.
 *
 * @param {object} deps
 * @param {() => (string|null)} deps.walk         upward marker walk from the launch dir
 * @param {() => object} deps.ladder              the packaged ladder: env -> config -> default
 * @param {() => string} deps.launchedFrom        the directory the walk started at
 * @param {object} deps.RESOLUTION                provenance resolution vocabulary
 * @returns {{root: string|null, resolution: string, configProblem: string|null, conflictingConfigRoot: string|null}}
 */
function resolveDevMode({ walk, ladder, launchedFrom, RESOLUTION }) {
  const walked = walk();
  if (walked) {
    return { root: walked, resolution: RESOLUTION.WALK, configProblem: null, conflictingConfigRoot: null };
  }

  const laddered = ladder();
  if (laddered.root) return laddered;

  // Nothing resolved anywhere. Report it as ONE fact, leading with the thing the
  // founder can actually see and act on — the checkout they launched from — and
  // carrying whatever the ladder separately found wrong. Two half-explanations
  // arriving as two rows is how a screen ends up reading "broken" when it is
  // actually reporting a specific, fixable condition.
  const launchProblem =
    `the checkout this dev instance was launched from does not carry the canonical Builder OS markers (walked up from ${launchedFrom()})`;

  return {
    ...laddered,
    configProblem: [launchProblem, laddered.configProblem].filter(Boolean).join(' — and '),
  };
}

module.exports = { resolvePackagedMode, resolveDevMode };
