// JARVIS Desktop — environment hygiene for spawned children.
//
// WHAT THIS DOES NOT DO, stated first so the guarantee is not overread:
//
// It does NOT stop a contaminated NODE_OPTIONS from affecting THIS process.
// By the time any application code runs, Electron has already read the
// variable, printed "Most NODE_OPTIONs are not supported in packaged apps",
// and carried on. That message is a warning, not a fatal error — verified
// 2026-08-11 by launching with `env -u NODE_OPTIONS`, which produced the same
// immediate exit with an empty log. Nothing in this file would have changed
// that outcome, and it must not be cited as the fix for it.
//
// WHAT IT DOES DO, which is a real exposure:
//
// This app shells out to `node scripts/builder/session.mjs`, `router.mjs`, and
// `deterministic.mjs` — the canonical Builder OS paths. Those are plain Node
// children, and unlike Electron they honour NODE_OPTIONS in full. A developer
// shell exporting `--max_old_space_size=4096`, an inspector flag, or a
// `--require` hook would silently apply to the governor the console invokes,
// so the founder could get a different answer from the Desktop than from the
// terminal, for reasons neither surface displays. Governance answers must not
// depend on the shell that happened to launch the app.
//
// So: children get a deliberately cleaned environment, and we record what was
// removed so the Desktop can say it rather than hide it.

// Variables that alter how a Node child interprets or instruments its own
// startup. Removed for children regardless of where they came from.
const STRIPPED = [
  'NODE_OPTIONS',
  'NODE_REPL_EXTERNAL_MODULE',
  'NODE_V8_COVERAGE',
  'ELECTRON_RUN_AS_NODE',
];

/**
 * Build a child environment with startup-altering variables removed.
 *
 * @param {object} sourceEnv normally process.env
 * @returns {{env: object, removed: string[]}} removed names the caller may surface
 */
function childEnv(sourceEnv) {
  const src = sourceEnv || {};
  const env = { ...src };
  const removed = [];
  for (const key of STRIPPED) {
    if (Object.prototype.hasOwnProperty.call(env, key) && env[key] !== undefined) {
      removed.push(key);
      delete env[key];
    }
  }
  return { env, removed };
}

module.exports = { STRIPPED, childEnv };
