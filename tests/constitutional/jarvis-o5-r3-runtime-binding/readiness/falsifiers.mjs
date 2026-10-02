/** O5-R3 RB-A3 — runtime binding readiness falsifiers. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const require = createRequire(import.meta.url);
export const RB = require(path.join(ROOT, 'jarvis-desktop/src/runtime-binding.js'));
export const READY = await import(pathToFileURL(path.join(ROOT, 'scripts/witness/o5-r3-binding-readiness.mjs')).href);

const expect = (f, cond, msg) => { if (!cond) f.push(msg); };
const run = async (fn) => {
  const failures = [];
  try { await fn(failures); } catch (e) { failures.push(`threw: ${e.message}`); }
  return { pass: failures.length === 0, failures };
};
const baseRecord = (over = {}) => ({
  app: { mode: 'development', sourceRoot: '/walk' },
  binding: { selectionSource: 'dev-walk', repoRoot: '/walk', head: 'abc', clean: true },
  ...over,
});
const classify = (s, record, live = 'LIVE', expectedRoot = '/walk', expectedHead = 'abc') =>
  s.classify({ record, live, expectedRoot, expectedHead });
export const RD1 = (s) => run(async (f) => {
  let statusCalls = 0;
  const execFileSync = (_bin, argv, options) => {
    if (argv.includes('rev-parse')) return 'abc\n';
    statusCalls += 1;
    if (statusCalls === 1) throw new Error('cold status timeout');
    expect(f, options.timeout === 30000, `retry timeout was ${options.timeout}, not 30000`);
    return '';
  };
  const state = s.gitState('/walk', { fs, hostname: () => 'h', execFileSync });
  expect(f, state.head === 'abc' && state.clean === true, `transient failure did not converge: ${JSON.stringify(state)}`);
  expect(f, statusCalls === 2, `status attempts=${statusCalls}, expected 2`);
});

export const RD2 = (s) => run(async (f) => {
  let statusCalls = 0;
  const execFileSync = (_bin, argv) => {
    if (argv.includes('rev-parse')) return 'abc\n';
    statusCalls += 1; throw new Error('status unavailable');
  };
  const state = s.gitState('/walk', { fs, hostname: () => 'h', execFileSync });
  expect(f, state.clean === null, `permanent probe failure became ${state.clean}, not null`);
});
export const RD3 = (s) => run(async (f) => {
  const r = classify(s, baseRecord(), 'STALE');
  expect(f, r.ready === false, 'a stale predecessor was accepted as ready');
});
export const RD4 = (s) => run(async (f) => {
  const rec = baseRecord({ app: { mode: 'development', sourceRoot: '/other' },
    binding: { selectionSource: 'dev-walk', repoRoot: '/other', head: 'abc', clean: true } });
  const r = classify(s, rec);
  expect(f, r.ready === false, 'another worktree was accepted as the walk specimen');
});
export const RD5 = (s) => run(async (f) => {
  const rec = baseRecord({ app: { mode: 'development', sourceRoot: '/walk' },
    binding: { selectionSource: 'dev-walk', repoRoot: '/walk', head: 'def', clean: true } });
  const r = classify(s, rec);
  expect(f, r.ready === false, 'a different HEAD was accepted as current');
});
export const RD6 = (s) => run(async (f) => {
  const rec = baseRecord({ app: { mode: 'development', sourceRoot: '/walk' },
    binding: { selectionSource: 'dev-walk', repoRoot: '/walk', head: 'abc', clean: null } });
  const r = classify(s, rec);
  expect(f, r.ready === false && r.reason === 'CLEAN_INDETERMINATE', `clean=null became ${JSON.stringify(r)}`);
});
export const RD7 = (s) => run(async (f) => {
  const rec = baseRecord({ app: { mode: 'development', sourceRoot: '/walk' },
    binding: { selectionSource: 'dev-walk', repoRoot: '/walk', head: 'abc', clean: false } });
  const r = classify(s, rec);
  expect(f, r.ready === false && r.reason === 'DIRTY', `dirty checkout became ${JSON.stringify(r)}`);
});
export const RD8 = (s) => run(async (f) => {
  const r = classify(s, baseRecord());
  expect(f, r.ready === true && r.reason === 'READY', `lawful current binding did not become ready: ${JSON.stringify(r)}`);
});

export const RD_FALSIFIERS = Object.freeze({
  'RD-1': RD1, 'RD-2': RD2, 'RD-3': RD3, 'RD-4': RD4,
  'RD-5': RD5, 'RD-6': RD6, 'RD-7': RD7, 'RD-8': RD8,
});
