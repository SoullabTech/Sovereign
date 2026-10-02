import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WUC = require('../src/work-unit-control.js');
const CE = require('../src/child-env.js');

test('F6 refuses ancestor project configuration without reading contents', () => {
  assert.deepEqual(WUC.OPENCODE_PROJECT_DISCOVERY_NAMES, [
    '.claude', '.agents', '.opencode', 'opencode.json', 'opencode.jsonc',
  ]);

  const base = process.platform === 'darwin' ? '/private/tmp' : os.tmpdir();
  const root = fs.mkdtempSync(path.join(base, 'jarvis-d2r1-f6-'));
  const ancestor = path.join(root, 'ancestor');
  const workspace = path.join(ancestor, 'child', 'workspace');
  const sentinel = path.join(ancestor, 'opencode.json');
  fs.mkdirSync(workspace, { recursive: true });
  fs.writeFileSync(sentinel, 'F6_SENTINEL_MUST_NOT_BE_READ\n');

  let sentinelRead = false;
  const originalRead = fs.readFileSync;
  fs.readFileSync = function guardedRead(file, ...args) {
    if (path.resolve(String(file)) === path.resolve(sentinel)) {
      sentinelRead = true;
      throw new Error('F6_SENTINEL_READ');
    }
    return originalRead.call(this, file, ...args);
  };

  try {
    const refused = WUC.canonicalOpenCodeAncestorPreflight(workspace);
    assert.equal(refused.ok, false);
    assert.equal(refused.status, 'REFUSED');
    assert.equal(refused.reason, 'AMBIENT_OPENCODE_PROJECT_CONFIGURATION');
    assert.equal(refused.offending_path, sentinel);
    assert.equal(refused.discovery_class, 'file:opencode.json');
    assert.equal(sentinelRead, false);

    fs.unlinkSync(sentinel);
    const admitted = WUC.canonicalOpenCodeAncestorPreflight(workspace);
    assert.deepEqual(admitted, { ok: true, status: 'ADMITTED', reason: null });
    assert.equal(sentinelRead, false);
  } finally {
    fs.readFileSync = originalRead;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('canonical OpenCode env is allowlisted while ordinary childEnv remains unchanged', () => {
  const runtime = WUC.createCanonicalOpenCodeRuntime();
  const source = {
    PATH: process.env.PATH || '/usr/bin:/bin',
    HOME: '/ambient-home',
    KEEP: 'ordinary-child-keeps-this',
    NODE_OPTIONS: '--inspect',
    TINKER_API_KEY: 'must-not-cross',
    NVIDIA_API_KEY: 'must-not-cross',
    HTTPS_PROXY: 'http://ambient.invalid',
    WS_PROXY: 'ws://ambient.invalid',
    OPENCODE_PTY_BIN: '/tmp/ambient-pty',
    OPENCODE_TEST_HOME: '/tmp/ambient-test-home',
    OPENCODE_CONFIG_CONTENT: '{"ambient":true}',
    AIN_DELEGATION_HOME: '/tmp/ambient-delegation',
  };
  const binding = {
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    adapter_id: 'opencode',
  };

  try {
    const ordinary = CE.childEnv(source).env;
    assert.equal(ordinary.KEEP, 'ordinary-child-keeps-this');
    assert.equal(ordinary.TINKER_API_KEY, 'must-not-cross');
    assert.equal(ordinary.NODE_OPTIONS, undefined);

    const canonical = WUC.canonicalLocalOpenCodeV2Env(source, runtime.runRoot, binding);
    assert.equal(canonical.HOME, path.join(runtime.runRoot, 'home'));
    assert.equal(canonical.TMPDIR, path.join(runtime.runRoot, 'tmp'));
    assert.equal(canonical.XDG_CONFIG_HOME, path.join(runtime.runRoot, 'xdg-config'));
    assert.equal(canonical.XDG_DATA_HOME, path.join(runtime.runRoot, 'xdg-data'));
    assert.equal(canonical.XDG_CACHE_HOME, path.join(runtime.runRoot, 'xdg-cache'));
    assert.equal(canonical.XDG_STATE_HOME, path.join(runtime.runRoot, 'xdg-state'));
    assert.equal(canonical.OPENCODE_CONFIG_DIR, path.join(runtime.runRoot, 'opencode-config'));
    assert.equal(canonical.OPENCODE_DISABLE_MODELS_FETCH, '1');
    assert.equal(canonical.OPENCODE_DISABLE_AUTOUPDATE, '1');

    for (const forbidden of [
      'KEEP', 'NODE_OPTIONS', 'TINKER_API_KEY', 'NVIDIA_API_KEY',
      'HTTPS_PROXY', 'WS_PROXY', 'OPENCODE_PTY_BIN', 'OPENCODE_TEST_HOME',
      'OPENCODE_CONFIG_CONTENT', 'AIN_DELEGATION_HOME',
    ]) {
      assert.equal(canonical[forbidden], undefined, forbidden + ' leaked into canonical child');
    }
  } finally {
    fs.rmSync(runtime.runRoot, { recursive: true, force: true });
  }
});

test('D2R1 keeps ancestor preflight before one-shot canonical grant claim', () => {
  const source = WUC.canonicalConfirmAuthorizedExecution.toString();
  const preflight = source.indexOf('prepareCanonicalOpenCodeContainment');
  const claim = source.indexOf('claimCanonicalExecutionGrantV1');
  assert.ok(preflight >= 0, 'canonical containment preparation is present');
  assert.ok(claim > preflight, 'grant claim occurs only after containment admission');
});
test('canonical controller has no pure fallback and non-local OpenCode is fail-closed', () => {
  const execute = WUC.executeCanonicalResolvedProvider.toString();
  assert.doesNotMatch(execute, /--pure/);
  assert.match(execute, /CANONICAL_OPENCODE_V2_PROVIDER_NOT_RECONCILED/);
  assert.match(execute, /'run', '--standalone'/);
});

test('governed config directory materializes GPT-OSS provider and readonly agent only', () => {
  const runtime = WUC.createCanonicalOpenCodeRuntime();
  const binding = {
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    adapter_id: 'opencode',
  };
  try {
    const dir = WUC.materializeCanonicalOpenCodeV2Config(runtime.runRoot, binding);
    const config = JSON.parse(fs.readFileSync(path.join(dir, 'opencode.json'), 'utf8'));
    assert.deepEqual(Object.keys(config.provider), ['ollama']);
    assert.deepEqual(Object.keys(config.provider.ollama.models), ['gpt-oss:20b']);
    assert.deepEqual(Object.keys(config.agents), ['jarvis-readonly']);
    assert.deepEqual(config.agents['jarvis-readonly'].permissions[0], {
      action: '*', resource: '*', effect: 'deny',
    });
    assert.equal(JSON.stringify(config).includes('nvidia'), false);
    assert.equal(JSON.stringify(config).includes('tinker'), false);
    assert.equal(JSON.stringify(config).includes('qwen3-coder:30b'), false);
  } finally {
    fs.rmSync(runtime.runRoot, { recursive: true, force: true });
  }
});
