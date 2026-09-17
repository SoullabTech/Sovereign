// Explicit external frontier-reasoning seam for JARVIS Desktop.
// Receives founder-approved task text only. It never receives the repository,
// JARVIS continuity, Claude history, member data, or arbitrary filesystem paths.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');

const MODEL = 'opencode/nemotron-3-ultra-free';
const MAX_PROMPT_CHARS = 12000;

function resolveOpenCodeBinary(env = process.env, home = os.homedir()) {
  const candidates = [
    env.JARVIS_OPENCODE_BIN,
    path.join(home, '.opencode', 'bin', 'opencode'),
    '/opt/homebrew/bin/opencode',
    '/usr/local/bin/opencode',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return { path: candidate, tried: candidates };
    } catch {}
  }
  return { path: null, tried: candidates };
}

function authPathFor(home) {
  return path.join(home, '.local', 'share', 'opencode', 'auth.json');
}

function hasOpenCodeCredential(home = os.homedir()) {
  const authPath = authPathFor(home);
  try {
    const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
    return !!(auth && typeof auth === 'object' && auth.opencode);
  } catch {
    return false;
  }
}

function status(opts = {}) {
  const home = opts.home || os.homedir();
  const env = opts.env || process.env;
  const binary = resolveOpenCodeBinary(env, home);
  if (!binary.path) {
    return { state: 'NEEDS_SETUP', ready: false, model: MODEL,
      detail: 'OpenCode CLI not found.' };
  }
  if (!hasOpenCodeCredential(home)) {
    return { state: 'NEEDS_SETUP', ready: false, model: MODEL,
      detail: 'Nemotron is configured but the OpenCode provider is not connected yet.' };
  }
  return { state: 'AVAILABLE', ready: true, model: MODEL,
    detail: 'Nemotron 3 Ultra external reasoning is connected; explicit external-safe act required.',
    binary: binary.path };
}

function validate(req) {
  const prompt = typeof req?.prompt === 'string' ? req.prompt.trim() : '';
  const errors = [];
  if (req?.external_ok !== true) errors.push('external_ok must be explicitly true');
  if (!prompt) errors.push('prompt is required');
  if (prompt.length > MAX_PROMPT_CHARS) {
    errors.push(`prompt exceeds ${MAX_PROMPT_CHARS} characters`);
  }
  return { ok: errors.length === 0, prompt, errors };
}

function writeRestrictedAgent(tmp) {
  const dir = path.join(tmp, '.opencode', 'agents');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'jarvis-frontier.md'), `---
description: Bounded external JARVIS frontier reasoner
mode: primary
model: ${MODEL}
permission:
  "*": deny
  read: deny
  edit: deny
  glob: deny
  grep: deny
  list: deny
  bash: deny
  task: deny
  external_directory: deny
  webfetch: deny
---

Reason only over the text explicitly supplied in the current prompt.
You have no repository, history, continuity, member-data, implementation, merge,
deploy, or filesystem authority. Do not request those capabilities.
`);
}

function boundaryPrompt(prompt) {
  return [
    'JARVIS EXTERNAL FRONTIER BOUNDARY',
    'The following task was explicitly approved for an external trial model.',
    'Use only the supplied task text. Do not request files, repository access,',
    'history, JARVIS continuity, member data, secrets, credentials, or tools.',
    'Return reasoning/proposals only; you have no implementation authority.',
    '',
    'TASK:',
    prompt,
  ].join('\n');
}

function buildSanitizedEnv(tempHome, sourceEnv = process.env) {
  const env = {};
  for (const key of ['PATH', 'LANG', 'LC_ALL', 'LC_CTYPE', 'TMPDIR', 'SHELL', 'USER', 'LOGNAME']) {
    if (sourceEnv[key]) env[key] = sourceEnv[key];
  }
  env.HOME = tempHome;
  env.XDG_CONFIG_HOME = path.join(tempHome, '.config');
  env.XDG_DATA_HOME = path.join(tempHome, '.local', 'share');
  env.XDG_CACHE_HOME = path.join(tempHome, '.cache');
  env.OPENCODE_CONFIG_DIR = path.join(tempHome, '.opencode');
  env.OPENCODE_DISABLE_CLAUDE_CODE = '1';
  env.OPENCODE_DISABLE_DEFAULT_PLUGINS = '1';
  env.OPENCODE_ENABLE_EXA = '0';
  env.OPENCODE_ENABLE_PARALLEL = '0';
  return env;
}

function stageCredential(realHome, tempHome) {
  const source = authPathFor(realHome);
  const dest = authPathFor(tempHome);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
  fs.chmodSync(dest, 0o600);
  return dest;
}

function stripAnsi(value) {
  return String(value || '')
    .replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '')
    .trim();
}

function run(req, opts = {}) {
  const checked = validate(req);
  if (!checked.ok) {
    return Promise.resolve({
      ok: false, status: 'REFUSED', model: MODEL,
      reason: checked.errors.join('; '), output: null,
    });
  }
  const ready = status(opts);
  if (!ready.ready) {
    return Promise.resolve({
      ok: false, status: ready.state, model: MODEL,
      reason: ready.detail, output: null,
    });
  }

  const realHome = opts.home || os.homedir();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-frontier-'));
  const tempHome = path.join(tmp, 'home');
  fs.mkdirSync(tempHome, { recursive: true });
  writeRestrictedAgent(tmp);
  stageCredential(realHome, tempHome);
  const exec = opts.execFileImpl || execFile;
  const env = buildSanitizedEnv(tempHome, opts.env || process.env);
  const args = [
    'run', '--pure', '--agent', 'jarvis-frontier',
    boundaryPrompt(checked.prompt),
  ];
  const cleanup = () => {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  };

  return new Promise((resolve) => {
    try {
      exec(
        ready.binary,
        args,
        { cwd: tmp, env, timeout: 180000, maxBuffer: 4 * 1024 * 1024 },
        (error, stdout, stderr) => {
          cleanup();
          if (error) {
            const detail = stripAnsi(stderr || error.message).slice(0, 1600);
            resolve({
              ok: false, status: 'FAILED', model: MODEL,
              reason: detail || 'Nemotron execution failed.', output: null,
            });
            return;
          }
          resolve({
            ok: true,
            status: 'COMPLETED',
            model: MODEL,
            output: stripAnsi(stdout),
            authority: 'external-reasoning-only',
            repository_access: false,
            continuity_access: false,
          });
        },
      );
    } catch (error) {
      cleanup();
      resolve({
        ok: false, status: 'FAILED', model: MODEL,
        reason: stripAnsi(error.message).slice(0, 1600), output: null,
      });
    }
  });
}

module.exports = {
  MODEL,
  MAX_PROMPT_CHARS,
  resolveOpenCodeBinary,
  hasOpenCodeCredential,
  status,
  validate,
  boundaryPrompt,
  run,
};
