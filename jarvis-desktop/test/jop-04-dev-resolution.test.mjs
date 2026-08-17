// JOP-04 — dev mode gets the same durable resolver packaged mode already had.
//
// The founder-walk defect these encode (2026-08-17): a dev launch from a
// checkout missing the canonical Builder OS markers resolved to NOTHING, while
// a valid saved workspace sat unread in config.json. Work answered "repo root
// not found — cannot route" and every dependent System row read UNKNOWN — a
// screen that reads "broken" for a condition that was specific and fixable.
//
// These prove PRECEDENCE and BEHAVIOUR, not text. The order is the whole
// contract: the walk must keep winning (so no dev launch that already resolved
// correctly can change binding), and the ladder must be reached only when the
// walk finds nothing.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { resolveDevMode } = require(path.join(HERE, '..', 'src', 'repo-resolution.js'));

// The real vocabulary, not a local invention — a test that agrees with itself
// about made-up constants proves nothing about the surface the founder sees.
const PROV = require(path.join(HERE, '..', 'src', 'provenance.js'));
const RESOLUTION = PROV.RESOLUTION;

const LAUNCH_DIR = '/Users/soullab/MAIA-SOVEREIGN/jarvis-desktop/src';
const never = () => { throw new Error('ladder must not be consulted when the walk succeeded'); };

describe('JOP-04 dev-mode resolution ladder', () => {
  test('the walk still wins — launching from inside a checkout outranks a saved choice', () => {
    const got = resolveDevMode({
      walk: () => '/Users/soullab/jarvis-runtime',
      ladder: never,
      launchedFrom: () => LAUNCH_DIR,
      RESOLUTION,
    });
    assert.equal(got.root, '/Users/soullab/jarvis-runtime');
    assert.equal(got.resolution, RESOLUTION.WALK);
    assert.equal(got.configProblem, null);
  });

  test('THE DEFECT: walk finds nothing, so the saved workspace is now honoured', () => {
    // This is the exact production shape observed on 2026-08-17: the launching
    // checkout had lost scripts/builder/{deterministic,router}.mjs, and
    // config.json held a valid /Users/soullab/jarvis-runtime.
    const got = resolveDevMode({
      walk: () => null,
      ladder: () => ({
        root: '/Users/soullab/jarvis-runtime',
        resolution: RESOLUTION.CONFIG,
        configProblem: null,
        conflictingConfigRoot: null,
      }),
      launchedFrom: () => LAUNCH_DIR,
      RESOLUTION,
    });
    // Before this unit, root was null here and Work refused with
    // "repo root not found — cannot route".
    assert.equal(got.root, '/Users/soullab/jarvis-runtime');
    assert.equal(got.resolution, RESOLUTION.CONFIG);
  });

  test('the ladder is consulted ONLY after the walk fails', () => {
    let consulted = 0;
    resolveDevMode({
      walk: () => null,
      ladder: () => { consulted++; return { root: '/x', resolution: RESOLUTION.ENV, configProblem: null, conflictingConfigRoot: null }; },
      launchedFrom: () => LAUNCH_DIR,
      RESOLUTION,
    });
    assert.equal(consulted, 1);
  });

  test('the ladder answer passes through UNCHANGED — dev mode adds no second opinion', () => {
    // Including the ENV-over-config conflict, which must keep reaching the
    // provenance surface as the structured fact, not be flattened to prose.
    const laddered = {
      root: '/Users/soullab/jarvis-runtime',
      resolution: RESOLUTION.ENV,
      configProblem: 'JARVIS_REPO_ROOT overrides your saved choice',
      conflictingConfigRoot: '/Users/soullab/somewhere-else',
    };
    const got = resolveDevMode({ walk: () => null, ladder: () => laddered, launchedFrom: () => LAUNCH_DIR, RESOLUTION });
    assert.deepEqual(got, laddered);
  });

  test('nothing resolves anywhere: ONE fact, leading with the checkout the founder can see', () => {
    const got = resolveDevMode({
      walk: () => null,
      ladder: () => ({
        root: null,
        resolution: RESOLUTION.NONE,
        configProblem: 'configured repository no longer carries the canonical markers: /Users/soullab/gone',
        conflictingConfigRoot: null,
      }),
      launchedFrom: () => LAUNCH_DIR,
      RESOLUTION,
    });
    assert.equal(got.root, null);
    assert.equal(got.resolution, RESOLUTION.NONE);
    // Names the launching checkout...
    assert.match(got.configProblem, /canonical Builder OS markers/);
    assert.match(got.configProblem, new RegExp(LAUNCH_DIR.replace(/\//g, '\\/')));
    // ...and does not discard what the ladder separately found.
    assert.match(got.configProblem, /no longer carries the canonical markers/);
  });

  test('a failing walk never fabricates a root when the ladder has none', () => {
    const got = resolveDevMode({
      walk: () => null,
      ladder: () => ({ root: null, resolution: RESOLUTION.NONE, configProblem: null, conflictingConfigRoot: null }),
      launchedFrom: () => LAUNCH_DIR,
      RESOLUTION,
    });
    assert.equal(got.root, null, 'an unbound substrate must stay unbound — a stale replica that answers is worse than one that fails');
  });
});
