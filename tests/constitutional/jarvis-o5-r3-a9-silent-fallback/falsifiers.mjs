import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const RR = require('../../../jarvis-desktop/src/repo-resolution.js');
export const PROV = require('../../../jarvis-desktop/src/provenance.js');
export const R = PROV.RESOLUTION;

export const DEFAULT = '/Users/soullab/MAIA-SOVEREIGN';
export const ENV = '/repo/env';
export const CONFIG = '/repo/config';
export const WALK = '/repo/walk';
const VALID = new Set([DEFAULT, ENV, CONFIG, WALK]);
export const valid = (p) => VALID.has(p);

export function packaged(input = {}) {
  return RR.resolvePackagedMode({
    envRoot: input.envRoot ?? null,
    config: input.config ?? { present: false, repo_root: null, problem: null },
    defaultCandidate: DEFAULT,
    isValidRepoRoot: valid,
    RESOLUTION: R,
  });
}

export function runScenario(s) {
  if (s.kind === 'packaged') return packaged(s.input);
  return RR.resolveDevMode({
    walk: () => s.input.walk,
    ladder: () => packaged(s.input.ladder || {}),
    launchedFrom: () => '/launch/src',
    RESOLUTION: R,
  });
}

export const SF_FALSIFIERS = Object.freeze({
  'SF-1': Object.freeze({
    name: 'valid hard-coded candidate without env/config remains unbound',
    kind: 'packaged', input: {},
    expect: { root: null, resolution: R.NONE, suggested: DEFAULT },
  }),
  'SF-2': Object.freeze({
    name: 'invalid saved config cannot silently become default authority',
    kind: 'packaged',
    input: { config: { present: true, repo_root: '/repo/gone', problem: null } },
    expect: { root: null, resolution: R.NONE, suggested: DEFAULT, problem: /configured repository no longer carries/ },
  }),
  'SF-3': Object.freeze({
    name: 'invalid env cannot silently become default authority',
    kind: 'packaged', input: { envRoot: '/repo/bad' },
    expect: { root: null, resolution: R.NONE, suggested: DEFAULT, problem: /JARVIS_REPO_ROOT does not carry/ },
  }),
  'SF-4': Object.freeze({
    name: 'suggestion stays informational rather than current root',
    kind: 'packaged', input: {},
    expect: { root: null, resolution: R.NONE, suggested: DEFAULT },
  }),
  'SF-5': Object.freeze({
    name: 'valid explicit env binding remains available',
    kind: 'packaged', input: { envRoot: ENV },
    expect: { root: ENV, resolution: R.ENV, suggested: null },
  }),
  'SF-6': Object.freeze({
    name: 'valid explicit config binding remains available',
    kind: 'packaged', input: { config: { present: true, repo_root: CONFIG, problem: null } },
    expect: { root: CONFIG, resolution: R.CONFIG, suggested: null },
  }),
  'SF-7': Object.freeze({
    name: 'dev launch walk outranks explicit ladder',
    kind: 'dev', input: { walk: WALK, ladder: { envRoot: ENV } },
    expect: { root: WALK, resolution: R.WALK },
  }),
  'SF-8': Object.freeze({
    name: 'failed dev walk does not promote suggested default',
    kind: 'dev', input: { walk: null, ladder: {} },
    expect: { root: null, resolution: R.NONE, suggested: DEFAULT },
  }),
});
