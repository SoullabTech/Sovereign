import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const F = require('../src/frontier-worker.js');

function test(name, fn) {
  Promise.resolve().then(fn).then(
    () => console.log('PASS', name),
    (e) => { console.error('FAIL', name, e); process.exitCode = 1; },
  );
}

test('external approval is mandatory', async () => {
  const r = await F.run({ prompt: 'public architecture question' });
  assert.equal(r.status, 'REFUSED');
});

test('missing provider credential reports setup, not execution failure', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-frontier-noauth-'));
  const binDir = path.join(home, '.opencode', 'bin');
  fs.mkdirSync(binDir, { recursive: true });
  fs.writeFileSync(path.join(binDir, 'opencode'), '#!/bin/sh\n', { mode: 0o755 });
  const s = F.status({ home, env: {} });
  assert.equal(s.ready, false);
  assert.equal(s.state, 'NEEDS_SETUP');
  fs.rmSync(home, { recursive: true, force: true });
});

test('approved run sanitizes ambient state and uses restricted temp custody', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-frontier-home-'));
  const binDir = path.join(home, '.opencode', 'bin');
  const authDir = path.join(home, '.local', 'share', 'opencode');
  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(path.join(binDir, 'opencode'), '#!/bin/sh\n', { mode: 0o755 });
  fs.writeFileSync(path.join(authDir, 'auth.json'), JSON.stringify({ opencode: { type: 'api' } }));

  let seen;
  const fakeExec = (bin, args, opts, cb) => {
    const agentPath = path.join(opts.cwd, '.opencode', 'agents', 'jarvis-frontier.md');
    const stagedAuth = path.join(opts.env.HOME, '.local', 'share', 'opencode', 'auth.json');
    seen = {
      bin,
      args,
      cwd: opts.cwd,
      env: { ...opts.env },
      agent: fs.readFileSync(agentPath, 'utf8'),
      stagedAuth: JSON.parse(fs.readFileSync(stagedAuth, 'utf8')),
      stagedAuthMode: fs.statSync(stagedAuth).mode & 0o777,
    };
    cb(null, 'NEMOTRON_OK\n', '');
  };

  const r = await F.run(
    { prompt: 'Compare these two public design alternatives.', external_ok: true },
    {
      home,
      env: {
        PATH: process.env.PATH,
        LANG: 'en_US.UTF-8',
        ANTHROPIC_API_KEY: 'must-not-cross-frontier',
        OPENAI_API_KEY: 'must-not-cross-frontier',
        OPENCODE_CONFIG: '/real/private/config.json',
      },
      execFileImpl: fakeExec,
    },
  );

  assert.equal(r.ok, true);
  assert.equal(r.output, 'NEMOTRON_OK');
  assert.equal(r.model, F.MODEL);
  assert.equal(r.repository_access, false);
  assert.equal(r.continuity_access, false);
  assert.ok(seen.cwd.startsWith(os.tmpdir()));
  assert.ok(!seen.args.join(' ').includes('/Users/soullab/MAIA-SOVEREIGN'));
  assert.deepEqual(seen.args.slice(0, 4), ['run', '--pure', '--agent', 'jarvis-frontier']);
  assert.match(seen.agent, /"\*": deny/);
  assert.match(seen.agent, /read: deny/);
  assert.match(seen.agent, /bash: deny/);
  assert.match(seen.agent, /external_directory: deny/);
  assert.notEqual(seen.env.HOME, home);
  assert.ok(seen.env.HOME.startsWith(seen.cwd));
  assert.equal(seen.env.OPENCODE_DISABLE_CLAUDE_CODE, '1');
  assert.equal(seen.env.OPENCODE_DISABLE_DEFAULT_PLUGINS, '1');
  assert.equal(seen.env.OPENCODE_CONFIG_DIR, path.join(seen.env.HOME, '.opencode'));
  assert.equal(seen.env.ANTHROPIC_API_KEY, undefined);
  assert.equal(seen.env.OPENAI_API_KEY, undefined);
  assert.equal(seen.env.OPENCODE_CONFIG, undefined);
  assert.deepEqual(seen.stagedAuth, { opencode: { type: 'api' } });
  assert.equal(seen.stagedAuthMode, 0o600);
  assert.match(seen.args.at(-1), /Use only the supplied task text/);
  assert.match(seen.args.at(-1), /Compare these two public design alternatives/);
  fs.rmSync(home, { recursive: true, force: true });
});
