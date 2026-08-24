#!/usr/bin/env node
// JOP-05 — the C1 lane's repo-root binding is a DECLARED binding.
//
// WHY THIS EXISTS (JARVIS-00 reality binding, 2026-08-24).
// The C1 branch of jarvis:submit-task resolved its substrate through a bare
// `REPO_ROOT` identifier that was never declared anywhere in main.js — only
// `REPO_ROOT_MODE` and `currentRoot()` exist. Every C1 task therefore threw
// `ReferenceError: REPO_ROOT is not defined` on its first statement, was
// swallowed by the lane's own try/catch, and surfaced as a generic
// `status: 'failed'`. That is the dangerous shape: indistinguishable on screen
// from "Ollama is down", so the console blamed the worker for a binding fault.
//
// WHY THE EXISTING C1 TEST DID NOT CATCH IT. c1-evidence-containment.test.mjs
// proves the scope guards by reading main.js as TEXT and re-implementing the
// imports against its own test-local `REPO_ROOT` const. Against a text
// assertion the defective source reads correctly — the identifier is right
// there in the string. A binding fault is only observable by EXECUTING the
// block in a scope that does not secretly supply the missing name, which is
// what this test does. Text proves shape; only execution proves binding.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAIN = path.join(HERE, '..', 'src', 'main.js');

let failures = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); }
  catch (e) { failures++; console.log(`  FAIL ${name}\n       ${e.message}`); }
};

/**
 * Execute the shipped C1 block in a scope carrying every binding main.js's
 * module scope legitimately has — and no repo-root name of any kind. Anything
 * the block reaches for that it did not declare surfaces as a ReferenceError.
 */
async function runC1Block(src) {
  const c1 = src.slice(src.indexOf("execution_lane === 'C1'"), src.indexOf("execution_lane === 'C3'"));
  const body = c1.split('\n').map((l) =>
    l.includes('await import(')
      ? l.replace(/=.*$/, '= { materializePacket: () => [], renderFragments: () => "", verifyEvidence: () => null };')
      : l).join('\n');

  let rootCalls = 0;
  const sandbox = {
    path,
    task: { prompt: 'x', context_selectors: [] },
    response: {},
    currentRoot: () => { rootCalls++; return HERE; },
    decideCorrectness: () => ({ correctness: null, correctness_reason: null }),
    fetch: async () => ({ ok: true, json: async () => ({ response: '', model: 'qwen2.5:7b' }) }),
    AbortSignal: { timeout: () => undefined },
    Date, JSON, Array, console,
  };
  vm.createContext(sandbox);

  // The lane's own try/catch is stripped so a binding fault throws HERE instead
  // of being converted into the generic status:'failed' that hid it originally.
  const inner = body.slice(body.indexOf('try {') + 5, body.lastIndexOf('} catch (e) {'));
  let error = null;
  try { await vm.runInContext(`(async () => { ${inner} })()`, sandbox); }
  catch (e) { error = e; }
  return { error, rootCalls };
}

const src = readFileSync(MAIN, 'utf8');

console.log('C1 ROOT BINDING');
const live = await runC1Block(src);

t('A. C1 block raises no ReferenceError for an undeclared binding', () => {
  assert.equal(
    live.error && live.error.name === 'ReferenceError' ? live.error.message : null,
    null,
  );
});

t('B. C1 block executes without fault to the worker call', () => {
  assert.equal(live.error, null, live.error ? String(live.error.message) : '');
});

t('C. C1 resolves its substrate through currentRoot(), not a captured value', () => {
  assert.ok(live.rootCalls > 0, 'currentRoot() was never consulted by the C1 lane');
});

// ── negative control ────────────────────────────────────────────────────────
// A test that cannot fail proves nothing. Reintroduce the exact defect into a
// COPY of the source and require this harness to catch it. If this control ever
// goes quiet, checks A-C above have stopped being load-bearing.
console.log('\nNEGATIVE CONTROL');
const reintroduced = src
  .replace("const ctxPath = path.join(currentRoot(), 'scripts', 'builder', 'jarvis-context.mjs');",
           "const ctxPath = path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context.mjs');");
const control = await runC1Block(reintroduced);

t('D. harness detects the original undeclared-binding defect', () => {
  assert.notEqual(src, reintroduced, 'defect could not be reintroduced — the C1 source shape moved');
  assert.ok(control.error, 'reintroduced defect did not throw');
  assert.match(control.error.message, /REPO_ROOT is not defined/);
});

console.log(failures ? `\n${failures} failed` : '\nall passed');
process.exit(failures ? 1 : 0);
