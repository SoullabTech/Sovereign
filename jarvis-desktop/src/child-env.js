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

// ---------------------------------------------------------------------------
// Node executable resolution (JOP-04b).
//
// THE DEFECT. `execFileSync('node', ...)` fails with `spawnSync node ENOENT` in
// the packaged app. A Finder/Dock/Spotlight launch does not run a login shell,
// so the process inherits the minimal PATH (/usr/bin:/bin:/usr/sbin:/sbin).
// Verified on this machine 2026-08-17: there is NO node in any of those
// directories, nor in /opt/homebrew/bin or /usr/local/bin — the only node is
// under nvm at ~/.nvm/versions/node/<version>/bin. So the packaged app could
// not run session.mjs at all, and System reported Builder OS as DEGRADED with
// a raw ENOENT. Dev mode never saw this: `npm start` inherits a login shell.
//
// WHY NOT A HARDCODED CANDIDATE LIST. It would be wrong here. The node in use
// is an nvm version directory whose name changes whenever the founder upgrades
// node, so a baked-in path would work until it silently didn't — and the
// failure would look identical to this one. Worse, guessing a DIFFERENT node
// than the terminal uses reintroduces the substitution hazard this codebase
// keeps paying for: the Desktop and the terminal would answer the same
// governance question from two different runtimes.
//
// SO: ask the founder's own login shell, which is by definition the runtime the
// terminal Builder OS uses. That makes agreement between the two surfaces a
// property of the design rather than a coincidence.
//
// This does NOT contradict this file's opening guarantee. That one is about
// per-launch contamination — NODE_OPTIONS exported in whatever shell happened
// to start the app — and it still holds: STRIPPED is applied to every child
// regardless of what the resolution below finds. Asking the login shell WHICH
// BINARY to run is a different question from letting it inject flags into it.
const RESOLUTION_SOURCE = Object.freeze({
  OVERRIDE: 'explicit-override',   // JARVIS_NODE_BIN named it
  LOGIN_SHELL: 'login-shell',      // the shell the terminal uses
  INHERITED_PATH: 'inherited-path',// already on PATH (the dev-mode case)
  NONE: 'unresolved',
});

// Resolution spawns a shell, so it is cached: `jarvis:status` runs on a timer
// and must not pay for a login shell every few seconds.
let _cachedNode = null;

/**
 * Find an absolute node executable, and say HOW it was found.
 *
 * Never throws and never guesses: an unresolved result is returned as such,
 * with the places that were tried, so the surface can state the condition
 * instead of surfacing ENOENT from three layers down.
 *
 * @returns {{path: string|null, source: string, tried: string[], version: string|null}}
 */
function resolveNodeBinary(deps = {}) {
  const {
    env = process.env,
    execFileSync = require('node:child_process').execFileSync,
    existsSync = require('node:fs').existsSync,
    cache = true,
  } = deps;
  if (cache && _cachedNode) return _cachedNode;

  const tried = [];
  const probe = (candidate, source) => {
    if (!candidate) return null;
    tried.push(candidate);
    if (!existsSync(candidate)) return null;
    try {
      // Prove it RUNS, not merely that a file sits at the path. A dangling nvm
      // symlink after an uninstall exists and is executable and fails on use.
      const version = execFileSync(candidate, ['-v'], { encoding: 'utf8', timeout: 5000 }).trim();
      return { path: candidate, source, tried, version };
    } catch {
      return null;
    }
  };

  // 1. An explicit override always wins and is never second-guessed.
  const override = probe(env.JARVIS_NODE_BIN, RESOLUTION_SOURCE.OVERRIDE);
  if (override) return (_cachedNode = override);

  // 2. The founder's shell — the same runtime the terminal Builder OS uses.
  //
  //    `-lic` and not `-lc`, which is the whole reason the first attempt at
  //    this failed (verified 2026-08-17 under a simulated packaged launch).
  //    A LOGIN shell sources .zshenv and .zprofile; nvm installs itself into
  //    .zshrc, which is sourced only by an INTERACTIVE shell. So `-lc` returns
  //    nothing on exactly the machine this fix exists for, while the terminal
  //    — always interactive — finds node fine. Both spellings are tried, most
  //    likely first, because a profile that puts node on PATH the login way is
  //    equally valid and cheaper.
  //
  //    Failure here is ordinary (no shell, no node, a profile that errors) and
  //    falls through quietly to the next source.
  const shell = env.SHELL || '/bin/zsh';
  for (const flags of ['-lic', '-lc']) {
    try {
      const out = execFileSync(shell, [flags, 'command -v node'], {
        encoding: 'utf8', timeout: 10000, env: childEnv(env).env,
      });
      // LAST line, not first: an interactive shell may print profile chatter
      // before answering, and the answer is what it printed last.
      const found = String(out).trim().split('\n').map((s) => s.trim()).filter(Boolean).pop();
      const viaShell = probe(found, RESOLUTION_SOURCE.LOGIN_SHELL);
      if (viaShell) return (_cachedNode = viaShell);
    } catch {
      tried.push(`${shell} ${flags} 'command -v node'`);
    }
  }

  // 3. Already on PATH. Normal in dev mode, where a login shell started us.
  try {
    const version = execFileSync('node', ['-v'], { encoding: 'utf8', timeout: 5000 }).trim();
    return (_cachedNode = { path: 'node', source: RESOLUTION_SOURCE.INHERITED_PATH, tried, version });
  } catch {
    tried.push('node (on inherited PATH)');
  }

  // Deliberately NOT cached: an unresolved result should be retried after the
  // founder installs node, without requiring a relaunch to notice.
  return { path: null, source: RESOLUTION_SOURCE.NONE, tried, version: null };
}

/** Test seam. Resolution is cached, and a test must be able to start clean. */
function _resetNodeCache() { _cachedNode = null; }

module.exports = { STRIPPED, childEnv, resolveNodeBinary, RESOLUTION_SOURCE, _resetNodeCache };
