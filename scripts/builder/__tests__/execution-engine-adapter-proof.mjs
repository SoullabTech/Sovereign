#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildInvocation,
  cleanupRcliSessionState,
  DEFAULT_OPENCODE_MODEL,
  DEFAULT_RCLI_MODEL,
  openCodePermission,
  resolveRcliCommand,
} from '../jarvis-execution-engine.mjs';

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log(`PASS  ${name}`);
};

const base = {
  cwd: '/tmp/jarvis-engine-proof',
  prompt: 'bounded proof task',
};

check('OpenCode defaults to the witnessed local model', () => {
  const x = buildInvocation({ ...base, engine: 'opencode', writeScope: 'worktree' });
  assert.equal(x.model, DEFAULT_OPENCODE_MODEL);
  assert.equal(DEFAULT_OPENCODE_MODEL, 'ollama/qwen2.5:7b');
  assert.ok(x.args.includes(DEFAULT_OPENCODE_MODEL));
});
check('OpenCode is pure and never receives blanket auto approval', () => {
  const x = buildInvocation({ ...base, engine: 'opencode', writeScope: 'worktree' });
  assert.ok(x.args.includes('--pure'));
  assert.ok(!x.args.includes('--auto'));
});

check('OpenCode write authority is worktree-scoped and shell is denied', () => {
  const p = openCodePermission('worktree');
  assert.equal(p.edit, 'allow');
  assert.equal(p.external_directory, 'deny');
  assert.equal(p.bash, 'deny');
  assert.equal(p.webfetch, 'deny');
  assert.equal(p.websearch, 'deny');
  assert.equal(p.task, 'deny');
});

check('OpenCode read-only authority denies edits', () => {
  assert.equal(openCodePermission('none').edit, 'deny');
});

check('R-CLI command can be pinned to a JARVIS-specific source build', () => {
  assert.equal(
    resolveRcliCommand({ JARVIS_RCLI_BIN: '/opt/jarvis/backboard' }, '/tmp/home'),
    '/opt/jarvis/backboard',
  );
});

check('R-CLI worktree mode permits edits but removes Execute and memory', () => {
  const x = buildInvocation({ ...base, engine: 'rcli', writeScope: 'worktree' });
  assert.ok(x.args.includes('acceptEdits'));
  assert.ok(x.args.includes('off'));
  assert.ok(x.args.includes('--fresh'));
  const excluded = x.args[x.args.indexOf('--excluded-tools') + 1];
  assert.ok(excluded.includes('Execute'));
  assert.ok(!x.args.includes('bypass'));
});
check('R-CLI read-only mode stays manual', () => {
  const x = buildInvocation({ ...base, engine: 'rcli', writeScope: 'none' });
  const mode = x.args[x.args.indexOf('--permission-mode') + 1];
  assert.equal(mode, 'manual');
});

check('R-CLI defaults to the no-credential JARVIS local provider', () => {
  const x = buildInvocation({ ...base, engine: 'rcli', writeScope: 'worktree' });
  assert.equal(x.model, DEFAULT_RCLI_MODEL);
  assert.equal(DEFAULT_RCLI_MODEL, 'jarvis-local/qwen2.5:7b');
  assert.equal(x.args[x.args.indexOf('--model') + 1], DEFAULT_RCLI_MODEL);
});

check('R-CLI ephemeral sessions are removed when JARVIS created them', () => {
  const root = mkdtempSync(join(tmpdir(), 'jarvis-rcli-session-proof-'));
  const sessions = join(root, '.backboard', 'sessions');
  mkdirSync(sessions, { recursive: true });
  writeFileSync(join(sessions, 'trace.jsonl'), '{}\n');
  cleanupRcliSessionState(root, false);
  assert.equal(existsSync(sessions), false);
  rmSync(root, { recursive: true, force: true });
});

check('engine boundary reserves integration acts to JARVIS', () => {
  for (const engine of ['opencode', 'rcli']) {
    const x = buildInvocation({ ...base, engine, writeScope: 'worktree' });
    const prompt = x.args.at(-1);
    assert.match(prompt, /Do not commit, push, merge, deploy/);
    assert.match(prompt, /JARVIS owns verification and integration/);
  }
});

check('unknown engines and scopes fail closed', () => {
  assert.throws(() => buildInvocation({ ...base, engine: 'unknown' }));
  assert.throws(() => buildInvocation({ ...base, engine: 'opencode', writeScope: 'everywhere' }));
});

console.log(`\nexecution-engine-adapter-proof: ${passed}/${passed} PASS`);
