import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const C = require('../src/work-unit-control.js');
const CE = require('../src/child-env.js');

test('F6 refuses ancestor project configuration without reading it', () => {
  assert.deepEqual(C.OPENCODE_PROJECT_DISCOVERY_NAMES, [
    '.claude', '.agents', '.opencode', 'opencode.json', 'opencode.jsonc',
  ]);

  const base = process.platform === 'darwin' ? '/private/tmp' : os.tmpdir();
  const root = fs.mkdtempSync(path.join(base, 'jarvis-f6-containment-'));
  const ancestor = path.join(root, 'ancestor');
  const workspace = path.join(ancestor, 'child', 'workspace');
  const sentinel = path.join(ancestor, 'opencode.json');
  fs.mkdirSync(workspace, { recursive: true });
  fs.writeFileSync(sentinel, 'F6_SENTINEL_MUST_NOT_BE_READ\n');

  let sentinelRead = false;
  const originalReadFileSync = fs.readFileSync;
  fs.readFileSync = function guardedRead(file, ...args) {
    if (path.resolve(String(file)) === path.resolve(sentinel)) {
      sentinelRead = true;
      throw new Error('F6_SENTINEL_READ');
    }
    return originalReadFileSync.call(this, file, ...args);
  };

  try {
    const refused = C.canonicalOpenCodeAncestorPreflight(workspace);
    assert.equal(refused.ok, false);
    assert.equal(refused.status, 'REFUSED');
    assert.equal(refused.reason, 'AMBIENT_OPENCODE_PROJECT_CONFIGURATION');
    assert.equal(refused.offending_path, sentinel);
    assert.equal(refused.discovery_class, 'file:opencode.json');
    assert.equal(sentinelRead, false);

    fs.unlinkSync(sentinel);
    const admitted = C.canonicalOpenCodeAncestorPreflight(workspace);
    assert.deepEqual(admitted, { ok: true, status: 'ADMITTED', reason: null });
    assert.equal(sentinelRead, false);
  } finally {
    fs.readFileSync = originalReadFileSync;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('F6 preflight remains before the canonical one-shot grant claim', () => {
  const source = C.canonicalConfirmAuthorizedExecution.toString();
  const preflight = source.indexOf('prepareCanonicalOpenCodeContainment');
  const claim = source.indexOf('claimCanonicalExecutionGrantV1');
  assert.ok(preflight >= 0, 'canonical containment preflight is present');
  assert.ok(claim > preflight, 'grant claim occurs only after containment admission');
});

test('canonical OpenCode argv owns process mode and has no dead pure flag', () => {
  const source = C.executeCanonicalResolvedProvider.toString();
  assert.match(source, /'run', '--standalone'/);
  assert.doesNotMatch(source, /--pure/);
});

test('canonical containment owns runtime, env, config, and local endpoint', () => {
  const workUnit = {
    identity: { objective: 'D2 fixture only' },
    custody: { evidence_class: 'E0_TASK_TEXT' },
    scope: { allowed_paths: [] },
  };
  const resolved = {
    model_ref: 'ollama/qwen3-coder:30b',
    model_id: 'qwen3-coder:30b',
  };
  const sourceEnv = {
    PATH: process.env.PATH,
    HOME: '/ambient-home',
    HTTP_PROXY: 'http://ambient.invalid',
    WS_PROXY: 'ws://ambient.invalid',
    OPENCODE_PTY_BIN: '/tmp/ambient-pty',
    OPENCODE_CONFIG: '{"ambient":true}',
    OLLAMA_HOST: 'http://ambient.invalid',
    JARVIS_OPENCODE_BIN: '/tmp/ambient-opencode',
    JARVIS_NODE_BIN: '/tmp/ambient-node',
    NODE_OPTIONS: '--require /tmp/ambient-hook.js',
  };
  const containment = C.prepareCanonicalOpenCodeContainment(
    process.cwd(), workUnit, resolved, sourceEnv,
  );
  assert.equal(containment.ok, true);
  const { env, runtime, sandbox } = containment;
  try {
    assert.equal(env.TMPDIR, runtime.tmp);
    assert.equal(env.HOME, runtime.home);
    assert.equal(env.OPENCODE_CONFIG_DIR, runtime.configDir);
    assert.equal(env.OPENCODE_DISABLE_MODELS_FETCH, '1');
    assert.equal(env.OPENCODE_DISABLE_AUTOUPDATE, '1');
    for (const key of [
      'HTTP_PROXY', 'WS_PROXY', 'OPENCODE_PTY_BIN',
      'OPENCODE_CONFIG', 'OLLAMA_HOST', 'JARVIS_OPENCODE_BIN',
      'JARVIS_NODE_BIN', 'NODE_OPTIONS',
    ]) assert.equal(env[key], undefined, key + ' must be absent');

    const config = JSON.parse(
      fs.readFileSync(path.join(runtime.configDir, 'opencode.json'), 'utf8'),
    );
    assert.equal(
      config.provider.ollama.options.baseURL,
      'http://127.0.0.1:11434/v1',
    );
    assert.equal(
      fs.existsSync(path.join(runtime.configDir, 'agents', 'jarvis-readonly.md')),
      true,
    );
    assert.equal(C.canonicalOpenCodeAncestorPreflight(sandbox.workspace).ok, true);
  } finally {
    fs.rmSync(runtime.runRoot, { recursive: true, force: true });
  }
});

test('D2 canonical OpenCode env is allowlisted without changing ordinary childEnv semantics', () => {
  const base = process.platform === 'darwin' ? '/private/tmp' : os.tmpdir();
  const root = fs.mkdtempSync(path.join(base, 'jarvis-d2-env-'));
  const runtime = {
    home: path.join(root, 'home'),
    tmp: path.join(root, 'tmp'),
    xdgConfig: path.join(root, 'xdg-config'),
    xdgData: path.join(root, 'xdg-data'),
    xdgCache: path.join(root, 'xdg-cache'),
    xdgState: path.join(root, 'xdg-state'),
    configDir: path.join(root, 'opencode-config'),
  };
  for (const dir of Object.values(runtime)) fs.mkdirSync(dir, { recursive: true });

  const source = {
    PATH: process.env.PATH || '/usr/bin:/bin',
    HOME: '/tmp/ambient-home',
    USER: process.env.USER || 'soullab',
    SHELL: process.env.SHELL || '/bin/zsh',
    KEEP: 'ordinary-child-keeps-this',
    NODE_OPTIONS: '--inspect',
    TINKER_API_KEY: 'must-not-reach-qwen',
    NVIDIA_API_KEY: 'must-not-reach-qwen',
    HTTPS_PROXY: 'http://ambient.invalid:9999',
    WS_PROXY: 'ws://ambient.invalid:9999',
    OPENCODE_PTY_BIN: '/tmp/ambient-pty',
    OLLAMA_HOST: 'http://ambient.invalid:11434',
    AIN_DELEGATION_HOME: '/tmp/ambient-delegation',
  };

  try {
    const ordinary = CE.childEnv(source).env;
    assert.equal(ordinary.KEEP, 'ordinary-child-keeps-this');
    assert.equal(ordinary.TINKER_API_KEY, 'must-not-reach-qwen');
    assert.equal(ordinary.NODE_OPTIONS, undefined);

    const canonical = C.canonicalOpenCodeEnv(source, runtime);
    assert.equal(canonical.HOME, runtime.home);
    assert.equal(canonical.TMPDIR, runtime.tmp);
    assert.equal(canonical.XDG_CONFIG_HOME, runtime.xdgConfig);
    assert.equal(canonical.XDG_DATA_HOME, runtime.xdgData);
    assert.equal(canonical.XDG_CACHE_HOME, runtime.xdgCache);
    assert.equal(canonical.XDG_STATE_HOME, runtime.xdgState);
    assert.equal(canonical.OPENCODE_CONFIG_DIR, runtime.configDir);
    assert.equal(canonical.OPENCODE_DISABLE_MODELS_FETCH, '1');
    assert.equal(canonical.OPENCODE_DISABLE_AUTOUPDATE, '1');

    for (const forbidden of [
      'KEEP', 'NODE_OPTIONS', 'TINKER_API_KEY', 'NVIDIA_API_KEY',
      'HTTPS_PROXY', 'WS_PROXY', 'OPENCODE_PTY_BIN', 'OLLAMA_HOST',
      'AIN_DELEGATION_HOME',
    ]) {
      assert.equal(canonical[forbidden], undefined, forbidden + ' leaked into canonical child');
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('canonical resolver inputs come from the allowlisted environment', () => {
  const source = C.canonicalOpenCodeEnv.toString();
  assert.match(source, /resolveNodeBinary\(\{ env: built \}\)/);
  assert.match(source, /resolveOpenCodeBinary\(built, os\.homedir\(\)\)/);
  assert.doesNotMatch(source, /resolveNodeBinary\(\{ env: sourceEnv \}\)/);
  assert.doesNotMatch(source, /resolveOpenCodeBinary\(sourceEnv/);
});
