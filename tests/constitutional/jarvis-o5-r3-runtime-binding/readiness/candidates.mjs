/** O5-R3 RB-A3 — defeat candidates. */
import { RB, READY } from './falsifiers.mjs';

export const REAL = Object.freeze({
  gitState: RB.gitState,
  classify: READY.classifyBindingReadiness,
});

const noRetryGitState = (root, deps) => {
  const git = (args) => deps.execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000,
  }).trim();
  let head = null; let clean = null;
  try { head = git(['rev-parse', 'HEAD']) || null; } catch {}
  try { clean = git(['status', '--porcelain']) === ''; } catch {}
  return { head, clean };
};

const failureMeansDirty = (root, deps) => {
  const read = (args) => {
    for (const timeout of [10000, 30000]) {
      try {
        return deps.execFileSync('git', ['-C', root, ...args], {
          encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout,
        }).trim();
      } catch {}
    }
    return null;
  };
  const head = read(['rev-parse', 'HEAD']);
  const status = read(['status', '--porcelain']);
  return { head: head || null, clean: status === null ? false : status === '' };
};
const realClassify = READY.classifyBindingReadiness;
const ignoreLive = (x) => realClassify({ ...x, live: 'LIVE' });
const ignoreRoot = (x) => realClassify({
  ...x,
  expectedRoot: x.record?.binding?.repoRoot,
});
const ignoreHead = (x) => realClassify({
  ...x,
  expectedHead: x.record?.binding?.head,
});
const acceptNullClean = (x) => {
  if (x.record?.binding?.clean === null) {
    const patched = { ...x.record, binding: { ...x.record.binding, clean: true } };
    return realClassify({ ...x, record: patched });
  }
  return realClassify(x);
};
const acceptDirty = (x) => {
  if (x.record?.binding?.clean === false) {
    const patched = { ...x.record, binding: { ...x.record.binding, clean: true } };
    return realClassify({ ...x, record: patched });
  }
  return realClassify(x);
};
const neverReady = (x) => {
  const real = realClassify(x);
  return real.ready ? { ready: false, reason: 'WAIT_FOREVER' } : real;
};

const cand = (id, named, law, subject) => ({ id, named, law, subject });
export const RD_CANDIDATES = Object.freeze([
  cand('DC-RD1', 'RD-1', 'a cold status failure is accepted after one attempt',
    { ...REAL, gitState: noRetryGitState }),
  cand('DC-RD2', 'RD-2', 'an unreadable cleanliness probe is collapsed into dirty=false rather than unknown',
    { ...REAL, gitState: failureMeansDirty }),
  cand('DC-RD3', 'RD-3', 'liveness is ignored while choosing the walk specimen',
    { ...REAL, classify: ignoreLive }),
  cand('DC-RD4', 'RD-4', 'any live dev-walk root is accepted, even another worktree',
    { ...REAL, classify: ignoreRoot }),
  cand('DC-RD5', 'RD-5', 'the worktree path is checked but its exact HEAD is ignored',
    { ...REAL, classify: ignoreHead }),
  cand('DC-RD6', 'RD-6', 'clean=null is treated as clean enough to sample',
    { ...REAL, classify: acceptNullClean }),
  cand('DC-RD7', 'RD-7', 'an explicitly dirty checkout is treated as ready',
    { ...REAL, classify: acceptDirty }),
  cand('DC-RD8', 'RD-8', 'the readiness barrier can never open, even for the exact lawful binding',
    { ...REAL, classify: neverReady }),
]);
