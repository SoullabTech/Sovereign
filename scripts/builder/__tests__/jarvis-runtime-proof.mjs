#!/usr/bin/env node
/**
 * JARVIS Unit 11 — persistent local runtime proof (§17, 14 required cases)
 *
 * Hermetic: AIN_DELEGATION_HOME is redirected to a temp dir BEFORE the runtime
 * modules are imported, so nothing here reads or writes the real delegation
 * substrate, and Builder capacity is evaluated against an empty ledger.
 *
 * Every stage except the delegate subprocess itself runs for real: schema
 * validation, authority refusal, packet-guard leakage lint, SHA-bound selector
 * binding, context materialization + budget, result-contract validation,
 * read-only enforcement, and independent citation verification. The delegate is
 * canned so the suite does not invoke a 6-second local model 14 times — the real
 * invocation is proved by Run 004 in docs/ops/JARVIS_UNIT_11_RUN_004.md.
 */

import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { EventEmitter } from 'node:events';

const HOME = mkdtempSync(path.join(tmpdir(), 'u11-home-'));
process.env.AIN_DELEGATION_HOME = HOME;
process.env.BUILDER_MAX_CLAUDE_SESSIONS = '4';
mkdirSync(path.join(HOME, 'packets'), { recursive: true });
mkdirSync(path.join(HOME, 'results'), { recursive: true });
mkdirSync(path.join(HOME, 'logs'), { recursive: true });

const { createRuntime, assertLoopback, LOOPBACK_HOSTS, MAX_BODY_BYTES } = await import('../jarvis-runtime.mjs');
const { verifyEvidence, validatePacket, checkAuthority, isLegalTransition, LEGAL_TRANSITIONS, RUN_STATES }
  = await import('../jarvis-runtime-pipeline.mjs');
const { createClient } = await import('../jarvis-runtime-client.mjs');

let p = 0, f = 0;
const t = async (n, fn) => { try { await fn(); console.log(`  ✓ ${n}`); p++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); f++; } };
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m ?? 'expected truthy'); };

// ── a real, clean, single-commit git tree for selectors to bind against ──────
const REPO = mkdtempSync(path.join(tmpdir(), 'u11-repo-'));
mkdirSync(path.join(REPO, 'lib'), { recursive: true });
writeFileSync(path.join(REPO, 'lib', 'modelService.ts'), [
  '// header',                                    // 1
  "import { x } from './x';",                     // 2
  '',                                             // 3
  'export const TEXT_MODEL_PROVIDER = "anthropic";', // 4
  '',                                             // 5
  'export async function generateText(prompt: string) {', // 6
  '  return call(prompt);',                       // 7
  '}',                                            // 8
].join('\n'));
for (const c of [['init', '-q'], ['add', '-A'], ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base']]) {
  execFileSync('git', ['-C', REPO, ...c], { stdio: 'ignore' });
}

const basePacket = (id) => ({
  work_unit_id: id,
  title: 'runtime proof',
  objective: 'Name the provider-selection constant and the text-generation entry point. READ-ONLY.',
  execution_lane: 'local-native',
  canonical_sha: execFileSync('git', ['-C', REPO, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(),
  branch: `chore/ain-delegate-${id}`,
  worktree: REPO,
  governing_authority: 'docs/ops/JARVIS_UNIT_11_RUNTIME_SERVICE.md',
  established_facts: ['Your authority is READ-ONLY.'],
  context_selectors: [
    { ref: 'lib/modelService.ts', why: 'provider constant',
      selector: { type: 'anchor', find: 'export const TEXT_MODEL_PROVIDER', mode: 'lines', after: 0 } },
    { ref: 'lib/modelService.ts', why: 'text generation entry',
      selector: { type: 'anchor', find: 'export async function generateText', mode: 'declaration' } },
  ],
  allowed_files: ['lib/modelService.ts'],
  acceptance_criteria: ['cites file:line for every claim'],
  expected_output: 'PROVIDER (file:line), ENTRY POINT (file:line).',
});

/** A canned delegate: writes the same artifacts ain-delegate.sh writes, then exits. */
function cannedDelegate({ output, exitCode = 0, filesChanged = [], endingSha = null, escalation = false }) {
  const calls = [];
  const fn = (args) => {
    calls.push(args);
    const id = args[1];
    writeFileSync(path.join(HOME, 'logs', `${id}.log`), output);
    writeFileSync(path.join(HOME, 'results', `${id}.json`), JSON.stringify({
      work_unit_id: id, lane: 'local-native', model: 'maia-coder:latest',
      starting_sha: 'abc1234', ending_sha: endingSha, files_changed: filesChanged,
      summary: 'canned', tests_run: [], test_results: 'not_run', typecheck_result: 'not_run',
      build_result: 'not_run', evidence: '', uncertainties: [], scope_deviations: [],
      escalation_required: escalation, unresolved_questions: [], recommended_next_action: 'review-diff',
      log_path: path.join(HOME, 'logs', `${id}.log`), duration_s: 6, attempts: 1,
    }, null, 2));
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.kill = () => { child.emit('close', null, 'SIGTERM'); };
    setImmediate(() => child.emit('close', exitCode, null));
    return child;
  };
  fn.calls = calls;
  return fn;
}

const GOOD_OUTPUT = [
  'PROVIDER: lib/modelService.ts:4 declares TEXT_MODEL_PROVIDER.',
  'ENTRY POINT: lib/modelService.ts:6 exports generateText, body through lib/modelService.ts:8.',
].join('\n');

async function withRuntime(opts, fn) {
  const rt = createRuntime({ host: '127.0.0.1', port: 0, ...opts });
  await rt.start();
  const client = createClient({ baseUrl: rt.address });
  try { return await fn(rt, client); } finally { await rt.stop(); }
}

console.log('\nJARVIS Unit 11 — persistent local runtime service\n');

// 1 ─────────────────────────────────────────────────────────────────────────
await t('1  runtime starts on loopback and reports its address', async () => {
  await withRuntime({}, async (rt) => {
    eq(rt.rt.pid, process.pid);
    ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(rt.address), `bad address ${rt.address}`);
    ok(['READY', 'DEGRADED'].includes(rt.rt.state), `unexpected state ${rt.rt.state}`);
  });
});

// 2 ─────────────────────────────────────────────────────────────────────────
await t('2  /health reports READY (or DEGRADED when the local worker is down)', async () => {
  await withRuntime({}, async (rt, client) => {
    const h = await client.health();
    ok(['READY', 'DEGRADED'].includes(h.state), `state ${h.state}`);
    eq(h.loopback_only, true);
    ok(typeof h.worker.available === 'boolean');
    ok(!JSON.stringify(h).match(/api[_-]?key|secret|token|password/i), 'health leaked a secret-shaped field');
  });
});

// 3 ─────────────────────────────────────────────────────────────────────────
await t('3  malformed packet rejected before any worker invocation', async () => {
  await withRuntime({ spawnDelegate: cannedDelegate({ output: GOOD_OUTPUT }) }, async (rt, client) => {
    for (const bad of [{}, { work_unit_id: 'x' }, { work_unit_id: 'Bad ID!', objective: 'o' },
                       { work_unit_id: 'ok-id', objective: 'o', expected_output: 'e',
                         execution_lane: 'local-native', canonical_sha: 'zzzz' }]) {
      let status = 0;
      try { await client.createRun(bad); } catch (e) { status = e.status; }
      eq(status, 400, `packet ${JSON.stringify(bad)} should be 400`);
    }
    eq(validatePacket({ work_unit_id: 'ok-id', objective: 'o', expected_output: 'e',
                        execution_lane: 'local-native', canonical_sha: 'abc1234' }).ok, true);
  });
});

// 4 ─────────────────────────────────────────────────────────────────────────
await t('4  valid run accepted with a run id (202 = runtime accepted, not worker capacity)', async () => {
  await withRuntime({ spawnDelegate: cannedDelegate({ output: GOOD_OUTPUT }) }, async (rt, client) => {
    const r = await client.createRun(basePacket('u11-proof-accept'));
    ok(/^r-[0-9a-f]{10}$/.test(r.run_id), `bad run id ${r.run_id}`);
    eq(r.state, 'QUEUED');
    const run = await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
    ok(run.run_id === r.run_id);
  });
});

// 5 ─────────────────────────────────────────────────────────────────────────
await t('5  every observed run state transition is legal, and no failure is a shortcut', async () => {
  await withRuntime({ spawnDelegate: cannedDelegate({ output: GOOD_OUTPUT }) }, async (rt, client) => {
    const r = await client.createRun(basePacket('u11-proof-transitions'));
    const run = await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
    ok(run.history.length >= 6, `only ${run.history.length} transitions recorded`);
    for (const h of run.history) {
      ok(RUN_STATES.includes(h.to), `unknown state ${h.to}`);
      if (h.from) ok(isLegalTransition(h.from, h.to), `illegal ${h.from} → ${h.to}`);
    }
    const seq = run.history.map((h) => h.to);
    for (const s of ['VALIDATING', 'CONTEXT_ROUTING', 'READY_FOR_WORKER', 'RUNNING',
                     'VALIDATING_RESULT', 'VERIFYING_EVIDENCE']) {
      ok(seq.includes(s), `stage ${s} never observed — the machine collapsed a stage`);
    }
    for (const term of ['VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED']) {
      eq(LEGAL_TRANSITIONS[term].length, 0, `${term} must be terminal`);
    }
  });
});

// 6 ─────────────────────────────────────────────────────────────────────────
await t('6  the native local pipeline is invoked — ain-delegate.sh local-native <id>', async () => {
  const del = cannedDelegate({ output: GOOD_OUTPUT });
  await withRuntime({ spawnDelegate: del }, async (rt, client) => {
    const r = await client.createRun(basePacket('u11-proof-invoke'));
    await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
    eq(del.calls.length, 1);
    eq(del.calls[0][0], 'local-native');
    eq(del.calls[0][1], 'u11-proof-invoke');
    const onDisk = JSON.parse(readFileSync(path.join(HOME, 'packets', 'u11-proof-invoke.json'), 'utf8'));
    eq(onDisk.runtime_run_id, r.run_id, 'packet was not persisted to the canonical packets dir');
  });
});

// 7 ─────────────────────────────────────────────────────────────────────────
await t('7  VERIFIED exposed correctly, decided independently of the worker self-report', async () => {
  await withRuntime({ spawnDelegate: cannedDelegate({ output: GOOD_OUTPUT }) }, async (rt, client) => {
    const r = await client.createRun(basePacket('u11-proof-verified'));
    const run = await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
    eq(run.state, 'VERIFIED');
    eq(run.disposition, 'VERIFIED');
    eq(run.verification.invalid, 0);
    ok(run.verification.valid >= 3, `only ${run.verification.valid} valid citations`);
    eq(run.verification.worker_self_reported_escalation, false);
    ok(run.audit.log_path && run.audit.result_path, 'audit references missing');
  });
});

// 8 ─────────────────────────────────────────────────────────────────────────
await t('8  ESCALATION_REQUIRED exposed correctly (fabricated citation is caught)', async () => {
  const fabricated = 'PROVIDER: lib/modelService.ts:257 declares TEXT_MODEL_PROVIDER.';
  await withRuntime({ spawnDelegate: cannedDelegate({ output: fabricated }) }, async (rt, client) => {
    const r = await client.createRun(basePacket('u11-proof-escalate'));
    const run = await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
    eq(run.state, 'ESCALATION_REQUIRED');
    eq(run.failure_class, 'EVIDENCE_OUT_OF_CONTEXT');
    eq(run.verification.invalid, 1);
  });
  // and an explicit worker escalation is honoured too
  await withRuntime({ spawnDelegate: cannedDelegate({ output: 'ESCALATE_TO_CLAUDE: ambiguous', escalation: true }) },
    async (rt, client) => {
      const r = await client.createRun(basePacket('u11-proof-escalate-explicit'));
      const run = await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
      eq(run.state, 'ESCALATION_REQUIRED');
      eq(run.failure_class, 'WORKER_ESCALATED');
    });
});

// 9 ─────────────────────────────────────────────────────────────────────────
await t('9  a completed run survives a full runtime restart, without re-executing the worker', async () => {
  const del = cannedDelegate({ output: GOOD_OUTPUT });
  let runId;
  await withRuntime({ spawnDelegate: del }, async (rt, client) => {
    const r = await client.createRun(basePacket('u11-proof-restart'));
    const run = await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
    eq(run.state, 'VERIFIED');
    runId = r.run_id;
  });
  eq(del.calls.length, 1);
  await withRuntime({ spawnDelegate: del }, async (rt2, client2) => {
    const recovered = await client2.getRun(runId);
    eq(recovered.state, 'VERIFIED');
    eq(recovered.disposition, 'VERIFIED');
    ok(recovered.audit.result_path, 'audit reference lost across restart');
    eq(del.calls.length, 1, 'worker was re-executed on restart');
    const list = await client2.listRuns({ limit: 100 });
    ok(list.runs.some((x) => x.run_id === runId), 'run missing from the restarted index');
  });
});

// 10 ────────────────────────────────────────────────────────────────────────
await t('10 non-loopback bind rejected, fail closed', async () => {
  for (const bad of ['0.0.0.0', '::', '192.168.0.104', 'soullab.life']) {
    let code = null;
    try { assertLoopback(bad); } catch (e) { code = e.code; }
    eq(code, 'NON_LOOPBACK_BIND_REFUSED', `${bad} was not refused`);
  }
  for (const good of LOOPBACK_HOSTS) eq(assertLoopback(good), good);
  let threw = false;
  try { createRuntime({ host: '0.0.0.0', port: 0 }); } catch { threw = true; }
  eq(threw, true, 'createRuntime accepted a non-loopback host');
  let clientThrew = false;
  try { createClient({ baseUrl: 'http://192.168.0.104:8787' }); } catch { clientThrew = true; }
  eq(clientThrew, true, 'client accepted a non-loopback base url');
});

// 11 ────────────────────────────────────────────────────────────────────────
await t('11 oversized request rejected (413) and wrong content-type rejected (415)', async () => {
  await withRuntime({}, async (rt) => {
    const big = JSON.stringify({ ...basePacket('u11-proof-big'), padding: 'x'.repeat(MAX_BODY_BYTES + 1024) });
    const r1 = await fetch(`${rt.address}/runs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: big })
      .catch(() => ({ status: 413 }));
    eq(r1.status, 413);
    const r2 = await fetch(`${rt.address}/runs`, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'hi' });
    eq(r2.status, 415);
  });
});

// 12 ────────────────────────────────────────────────────────────────────────
await t('12 packet requesting LOCAL WRITE authority is refused (403), fail closed', async () => {
  await withRuntime({ spawnDelegate: cannedDelegate({ output: GOOD_OUTPUT }) }, async (rt, client) => {
    for (const [k, v] of [['allow_write', true], ['permission_mode', 'bypassPermissions'],
                          ['repo_write_scope', 'worktree'], ['requested_write_authority', 'write']]) {
      let status = 0, body = null;
      try { await client.createRun({ ...basePacket('u11-proof-write'), [k]: v }); }
      catch (e) { status = e.status; body = e.body; }
      eq(status, 403, `field ${k} was not refused`);
      eq(body.error, 'LOCAL_WRITE_AUTHORITY_REFUSED');
    }
    // a non read-only lane is refused at the same boundary
    eq(checkAuthority({ ...basePacket('x-lane'), execution_lane: 'claude' }).failure_class, 'LANE_NOT_PERMITTED');
    // and a worker that writes anyway fails the run post-hoc
    const del = cannedDelegate({ output: GOOD_OUTPUT, filesChanged: ['lib/modelService.ts'], endingSha: 'deadbee' });
    await withRuntime({ spawnDelegate: del }, async (rt2, c2) => {
      const r = await c2.createRun(basePacket('u11-proof-wrote'));
      const run = await c2.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
      eq(run.state, 'FAILED');
      eq(run.failure_class, 'LOCAL_WORKER_WROTE');
    });
  });
});

// 13 ────────────────────────────────────────────────────────────────────────
await t('13 no arbitrary shell / exec / filesystem endpoint exists', async () => {
  await withRuntime({}, async (rt) => {
    for (const [method, p] of [['POST', '/exec'], ['POST', '/shell'], ['POST', '/run'], ['GET', '/files'],
                               ['GET', '/files?path=/etc/passwd'], ['POST', '/eval'], ['GET', '/../../etc/passwd']]) {
      const res = await fetch(`${rt.address}${p}`, { method,
        headers: { 'content-type': 'application/json' }, body: method === 'POST' ? '{}' : undefined });
      ok([404, 405].includes(res.status), `${method} ${p} returned ${res.status}`);
    }
    // the run surface itself refuses unknown sub-resources
    const res = await fetch(`${rt.address}/runs/r-0000000000/exec`, { method: 'POST' });
    eq(res.status, 404);
  });
});

// 14 ────────────────────────────────────────────────────────────────────────
await t('14 the event stream receives run transitions and carries no prompt content', async () => {
  await withRuntime({ spawnDelegate: cannedDelegate({ output: GOOD_OUTPUT }) }, async (rt, client) => {
    const seen = [];
    const unsub = await client.subscribe((ev) => seen.push(ev));
    const r = await client.createRun(basePacket('u11-proof-events'));
    await client.waitForRun(r.run_id, { timeoutMs: 30_000, pollMs: 100 });
    await new Promise((res) => setTimeout(res, 300));
    unsub();
    const types = new Set(seen.map((e) => e.type));
    for (const want of ['run.created', 'run.state_changed', 'context.selected', 'worker.started',
                        'worker.completed', 'verification.started', 'verification.completed', 'run.verified']) {
      ok(types.has(want), `event ${want} never emitted (saw: ${[...types].join(', ')})`);
    }
    const blob = JSON.stringify(seen);
    ok(!blob.includes('You are executing ONE bounded'), 'event stream leaked the worker prompt');
    ok(!blob.includes('TEXT_MODEL_PROVIDER'), 'event stream leaked materialized source content');
  });
});

// ── verifier unit checks (the mechanism the dispositions above depend on) ────
await t('15 verifier: citation inside a materialized fragment is valid, outside is not', async () => {
  const frags = [{ source_file: 'lib/modelService.ts', start_line: 4, end_line: 4, source_sha: 'abc' },
                 { source_file: 'lib/modelService.ts', start_line: 6, end_line: 8, source_sha: 'abc' }];
  const v = verifyEvidence('see lib/modelService.ts:4 and lib/modelService.ts:7 but not lib/modelService.ts:99', frags);
  eq(v.total, 3); eq(v.valid, 2); eq(v.invalid, 1); eq(v.ok, false);
  eq(verifyEvidence('no citations here', frags).total, 0);
  eq(verifyEvidence('lib/modelService.ts:6-8', frags).valid, 2);
});

rmSync(HOME, { recursive: true, force: true });
rmSync(REPO, { recursive: true, force: true });
console.log(`\n  ${p} passed · ${f} failed\n`);
process.exit(f ? 1 : 0);
