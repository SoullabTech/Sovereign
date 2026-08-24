#!/usr/bin/env node
// Gate Zero restart witness — PHASE A: execute and persist, then DIE.
//
// Runs in its own process on purpose. A restart witness that writes and reads
// back inside one process proves only that an object stayed in memory; the
// claim under test is Unit 11 §10 — "restarting the process must not destroy
// durable run history" — and only a real process boundary can test it.
//
// This process:
//   1. loads the real main.js under the Electron stub,
//   2. drives the real C1 handler (real router, real materializer, real
//      canonical verifier, real run store — only Electron and the local worker
//      HTTP endpoint are stubbed),
//   3. prints one JSON line, and exits.
//
// Phase B is a DIFFERENT process, started after this one is confirmed dead.
import path from 'node:path';
import { loadMainProcess, stubLocalWorker, REPO } from './electron-stub.mjs';

const outcome = { ok: false, stage: 'start', pid: process.pid };

try {
  // Bind explicitly to the repository this checkout IS. The harness never
  // relies on the hard-coded default candidate — a proof that silently bound
  // somewhere else would be proving something about another repository.
  process.env.JARVIS_REPO_ROOT = REPO;

  const restore = stubLocalWorker(async (_url, init) => {
    // Answer with a citation the canonical verifier can actually check against
    // the materialized fragment, so this exercises real containment scoring
    // rather than the no-evidence path.
    const body = JSON.parse(init.body);
    outcome.prompt_chars = body.prompt.length;
    return {
      model: 'qwen2.5:7b',
      response:
        'The router exports a route() function and a C1 input ceiling. ' +
        'scripts/builder/router.mjs:23',
    };
  });

  const { invoke } = loadMainProcess({ isPackaged: false });
  outcome.stage = 'loaded';

  const res = await invoke('jarvis:submit-task', {
    bounded_for_local: true,
    input_chars: 40,
    prompt: 'What is the C1 input ceiling?',
    // A REAL selector against a real file, in the canonical object form
    // (`{ ref, selector }`), so materializePacket() and verifyEvidence() both
    // do genuine work rather than falling through the no-evidence path.
    context_selectors: [
      { ref: 'scripts/builder/router.mjs', selector: { type: 'lines', start: 15, end: 30 } },
    ],
  });
  restore();

  outcome.stage = 'executed';
  outcome.execution_lane = res.execution_lane;
  outcome.status = res.status;
  outcome.failure_class = res.failure_class || null;
  outcome.result_error = res.result && res.result.error ? String(res.result.error).slice(0, 200) : null;
  outcome.persistence = res.persistence || null;
  outcome.verification = res.verification
    ? { pass: res.verification.pass, correctness: res.verification.correctness, fragments_offered: res.verification.fragments_offered }
    : null;
  outcome.ok = true;
} catch (e) {
  outcome.error = String(e && e.stack ? e.stack : e).slice(0, 800);
}

// One machine-readable line. Phase A's job is to produce a run id and stop
// existing; interpretation belongs to the orchestrator.
console.log(`__PHASE_A__${JSON.stringify(outcome)}`);
process.exit(outcome.ok ? 0 : 1);
