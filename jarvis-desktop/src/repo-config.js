// JARVIS Desktop — persisted repository binding.
//
// The installed application must not depend on Terminal environment variables
// or on living inside a checkout. It therefore remembers, across launches and
// reboots, which repository it was told to operate against.
//
// EPISTEMIC STANCE (consistent with provenance.js): a configured root is an
// EXPLICIT binding — the founder named it — and is reported as such. It is NOT
// the same as the hard-coded default candidate, which remains DEGRADED because
// nobody chose it. This module therefore never silently invents a binding: if
// the config is missing, unreadable, malformed, or points somewhere that no
// longer carries the canonical markers, it says which of those is true and
// returns no root.
//
// Pure of Electron on purpose — the base directory is injected, so this is
// testable and reusable outside the app process.
const path = require('node:path');
const fs = require('node:fs');

const CONFIG_VERSION = 1;
const CONFIG_DIRNAME = 'JARVIS';
const CONFIG_FILENAME = 'config.json';

/** ~/Library/Application Support/JARVIS/config.json, given the OS app-support dir. */
function configDir(appSupportDir) {
  return path.join(appSupportDir, CONFIG_DIRNAME);
}
function configPath(appSupportDir) {
  return path.join(configDir(appSupportDir), CONFIG_FILENAME);
}

/**
 * Read the persisted binding.
 *
 * Every failure mode is named rather than collapsed into "no config", because
 * "you never set one" and "the one you set is corrupt" call for different
 * actions from the founder.
 *
 * @returns {{present: boolean, repo_root: string|null, set_at: string|null,
 *            set_by: string|null, problem: string|null, path: string}}
 */
function readConfig(appSupportDir) {
  const p = configPath(appSupportDir);
  const absent = { present: false, repo_root: null, set_at: null, set_by: null, topology_contract: null, problem: null, path: p };

  let raw;
  try {
    raw = fs.readFileSync(p, 'utf8');
  } catch (e) {
    if (e && e.code === 'ENOENT') return absent;
    return { ...absent, problem: `config unreadable: ${e.message}` };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ...absent, problem: `config is not valid JSON: ${e.message}` };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ...absent, problem: 'config is not an object' };
  }
  if (typeof parsed.repo_root !== 'string' || !parsed.repo_root) {
    return { ...absent, problem: 'config carries no repo_root' };
  }

  return {
    present: true,
    repo_root: parsed.repo_root,
    set_at: typeof parsed.set_at === 'string' ? parsed.set_at : null,
    set_by: typeof parsed.set_by === 'string' ? parsed.set_by : null,
    // TOPOLOGY CONTRACT (2026-08-24). A free-text founder declaration that this
    // app is INTENTIONALLY built from one worktree and operated against
    // another. Deliberately not a boolean: "yes it's fine" is not a contract,
    // and the reason has to survive the person who knew it. Absent by default,
    // so an undeclared build/operated split reads as the hazard it is rather
    // than as a configured arrangement. Only the founder can write it.
    topology_contract:
      typeof parsed.topology_contract === 'string' && parsed.topology_contract.trim()
        ? parsed.topology_contract.trim()
        : null,
    problem: null,
    path: p,
  };
}

/**
 * Persist a binding. Writes atomically (temp + rename) so an interrupted write
 * cannot leave the app with a half-written config that reads as corrupt on the
 * next launch.
 */
function writeConfig(appSupportDir, repoRoot, setBy) {
  const dir = configDir(appSupportDir);
  const p = configPath(appSupportDir);
  fs.mkdirSync(dir, { recursive: true });

  // Rebinding the repository must not silently erase a topology contract the
  // founder wrote earlier. Preserved rather than re-asked, and never invented:
  // if none was declared the field stays absent.
  const existing = readConfig(appSupportDir);

  const body = JSON.stringify(
    {
      version: CONFIG_VERSION,
      repo_root: repoRoot,
      set_at: new Date().toISOString(),
      set_by: setBy || 'unknown',
      ...(existing.topology_contract ? { topology_contract: existing.topology_contract } : {}),
    },
    null,
    2,
  );

  const tmp = `${p}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${body}\n`, 'utf8');
  fs.renameSync(tmp, p);
  return p;
}

// First-run prompt acknowledgement.
//
// Kept in its own file rather than as a field on the config, because the config
// means "this is the repository" and this means "you have been asked". Merging
// them would force a half-written config row for a founder who declined, and a
// declined prompt is not a binding.
//
// Without this the startup dialog would reappear on EVERY launch for anyone
// running on the fallback candidate — turning an informative prompt into a
// nag, which trains people to dismiss it unread. Asked once, answered, done.
const PROMPT_FILENAME = 'first-run-prompted.json';

function promptSeen(appSupportDir) {
  return fs.existsSync(path.join(configDir(appSupportDir), PROMPT_FILENAME));
}

function markPromptSeen(appSupportDir, outcome) {
  const dir = configDir(appSupportDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, PROMPT_FILENAME),
    `${JSON.stringify({ prompted_at: new Date().toISOString(), outcome: outcome || 'unknown' }, null, 2)}\n`,
    'utf8',
  );
}

function clearConfig(appSupportDir) {
  const p = configPath(appSupportDir);
  try {
    fs.unlinkSync(p);
    return true;
  } catch (e) {
    if (e && e.code === 'ENOENT') return false;
    throw e;
  }
}

module.exports = {
  CONFIG_VERSION, configDir, configPath, readConfig, writeConfig, clearConfig,
  promptSeen, markPromptSeen,
};
