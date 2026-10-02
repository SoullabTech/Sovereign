import { packaged, RR, R, DEFAULT } from './falsifiers.mjs';

function oldDefault(s) {
  const out = packaged(s.input);
  if (!out.root && out.suggestedRepoRoot) {
    return { ...out, root: out.suggestedRepoRoot, resolution: R.DEFAULT };
  }
  return out;
}

export const SF_CANDIDATES = Object.freeze({
  'DC-SF1': Object.freeze({
    kills: 'SF-1', name: 'preserve the old implicit-default authority binding',
    run: (s) => oldDefault(s),
  }),
  'DC-SF2': Object.freeze({
    kills: 'SF-2', name: 'invalid config silently falls through to the default root',
    run: (s) => oldDefault(s),
  }),
  'DC-SF3': Object.freeze({
    kills: 'SF-3', name: 'invalid JARVIS_REPO_ROOT silently falls through to the default root',
    run: (s) => oldDefault(s),
  }),
  'DC-SF4': Object.freeze({
    kills: 'SF-4', name: 'a suggestion is treated as currentRoot',
    run: (s) => {
      const out = packaged(s.input);
      return { ...out, root: out.suggestedRepoRoot, resolution: R.DEFAULT };
    },
  }),
  'DC-SF5': Object.freeze({
    kills: 'SF-5', name: 'fix removes valid ENV bindings too',
    run: (s) => ({ ...packaged(s.input), root: null, resolution: R.NONE }),
  }),
  'DC-SF6': Object.freeze({
    kills: 'SF-6', name: 'fix removes valid CONFIG bindings too',
    run: (s) => ({ ...packaged(s.input), root: null, resolution: R.NONE }),
  }),
  'DC-SF7': Object.freeze({
    kills: 'SF-7', name: 'dev walk loses precedence to the packaged ladder',
    run: (s) => packaged(s.input.ladder),
  }),
  'DC-SF8': Object.freeze({
    kills: 'SF-8', name: 'failed dev walk promotes the suggested default',
    run: (s) => {
      const ladder = packaged(s.input.ladder);
      const promoted = !ladder.root && ladder.suggestedRepoRoot
        ? { ...ladder, root: DEFAULT, resolution: R.DEFAULT }
        : ladder;
      return RR.resolveDevMode({
        walk: () => s.input.walk,
        ladder: () => promoted,
        launchedFrom: () => '/launch/src',
        RESOLUTION: R,
      });
    },
  }),
});
