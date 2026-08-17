// JOP-04b — resolving the node executable a packaged launch cannot see.
//
// The defect: a Finder/Dock launch inherits the minimal PATH and no login
// shell, so `execFileSync('node', ...)` died with `spawnSync node ENOENT` and
// System reported Builder OS DEGRADED. On this machine the ONLY node is under
// nvm, so there was no system path that would have worked.
//
// These prove the two properties that matter, and neither is "it found a node":
//   1. it never returns a path it has not proven RUNS, and
//   2. an unresolved result stays unresolved and says where it looked —
//      it never falls back to a guess.

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CE = require(path.join(HERE, '..', 'src', 'child-env.js'));

beforeEach(() => CE._resetNodeCache());

const noShell = () => { throw new Error('no login shell in this test'); };

describe('JOP-04b node resolution', () => {
  test('an explicit override wins and is not second-guessed', () => {
    const r = CE.resolveNodeBinary({
      env: { JARVIS_NODE_BIN: '/custom/node' },
      existsSync: (p) => p === '/custom/node',
      execFileSync: (bin) => (bin === '/custom/node' ? 'v22.0.0\n' : noShell()),
      cache: false,
    });
    assert.equal(r.path, '/custom/node');
    assert.equal(r.source, CE.RESOLUTION_SOURCE.OVERRIDE);
    assert.equal(r.version, 'v22.0.0');
  });

  test('THE DEFECT: with no login shell and nothing on PATH, it resolves nothing and says where it looked', () => {
    // Exactly the packaged condition: minimal PATH, no node anywhere.
    const r = CE.resolveNodeBinary({
      env: { SHELL: '/bin/zsh', PATH: '/usr/bin:/bin:/usr/sbin:/sbin' },
      existsSync: () => false,
      execFileSync: noShell,
      cache: false,
    });
    assert.equal(r.path, null, 'must NOT invent a path');
    assert.equal(r.source, CE.RESOLUTION_SOURCE.NONE);
    assert.ok(r.tried.length > 0, 'an unresolved result must name the search');
    assert.ok(r.tried.some((t) => /zsh|node/.test(t)));
  });

  test('the login shell supplies the same runtime the terminal uses', () => {
    const NVM = '/Users/soullab/.nvm/versions/node/v22.22.3/bin/node';
    const r = CE.resolveNodeBinary({
      env: { SHELL: '/bin/zsh' },
      existsSync: (p) => p === NVM,
      execFileSync: (bin, args) => {
        if (bin === '/bin/zsh') return `${NVM}\n`;
        if (bin === NVM && args[0] === '-v') return 'v22.22.3\n';
        throw new Error('unexpected spawn');
      },
      cache: false,
    });
    assert.equal(r.path, NVM);
    assert.equal(r.source, CE.RESOLUTION_SOURCE.LOGIN_SHELL);
  });

  test('a path that EXISTS but does not run is rejected, not returned', () => {
    // A dangling nvm symlink after an uninstall: the file is there and the
    // naive existence check would have accepted it.
    const DEAD = '/Users/soullab/.nvm/versions/node/v18.0.0/bin/node';
    const r = CE.resolveNodeBinary({
      env: { JARVIS_NODE_BIN: DEAD },
      existsSync: () => true,
      execFileSync: (bin) => { if (bin === DEAD) throw new Error('ENOENT'); throw new Error('no shell'); },
      cache: false,
    });
    assert.notEqual(r.path, DEAD, 'existence is not proof it runs');
    assert.equal(r.source, CE.RESOLUTION_SOURCE.NONE);
  });

  test('the shell answer is still stripped of startup-altering variables', () => {
    // The file's original guarantee must survive the addition of resolution:
    // asking the shell WHICH binary to run must not become a way for that
    // shell to inject flags INTO it.
    let sawEnv = null;
    CE.resolveNodeBinary({
      env: { SHELL: '/bin/zsh', NODE_OPTIONS: '--require /tmp/evil.js' },
      existsSync: () => false,
      execFileSync: (bin, args, opts) => { if (bin === '/bin/zsh') { sawEnv = opts.env; } throw new Error('x'); },
      cache: false,
    });
    assert.ok(sawEnv, 'the login shell must actually have been invoked');
    assert.equal(sawEnv.NODE_OPTIONS, undefined, 'NODE_OPTIONS must be stripped for the resolution shell too');
  });

  test('childEnv still strips what it always stripped', () => {
    const { env, removed } = CE.childEnv({ NODE_OPTIONS: '--inspect', PATH: '/usr/bin', KEEP: '1' });
    assert.equal(env.NODE_OPTIONS, undefined);
    assert.equal(env.KEEP, '1');
    assert.ok(removed.includes('NODE_OPTIONS'));
  });

  test('REAL RESOLUTION on this machine: a runnable node is found and reports a version', () => {
    // Not a mock. If this fails, the packaged app genuinely cannot run node.
    const r = CE.resolveNodeBinary({ cache: false });
    assert.ok(r.path, `expected to resolve a node; tried: ${r.tried.join(', ')}`);
    assert.match(r.version || '', /^v\d+\./);
  });
});
