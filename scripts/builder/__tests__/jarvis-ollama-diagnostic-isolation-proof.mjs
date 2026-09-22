#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  acquireDiagnosticLease,
  beginGenerationActivity,
  checkGenerationAllowed,
  diagnosticLeasePath,
  endGenerationActivity,
  inspectDiagnosticLease,
  legacyGeneratorCensus,
  listGenerationActivities,
  ollamaClientCensus,
  recoverDiagnosticLease,
  releaseDiagnosticLease,
  withDiagnosticLease,
} from '../jarvis-ollama-generation-lease.mjs';
import {
  diagnosticSandboxProfile,
  runDiagnosticSandbox,
} from '../jarvis-ollama-diagnostic-sandbox.mjs';

let passed = 0;
async function check(name, fn) {
  await fn();
  passed += 1;
  console.log('  PASS  ' + name);
}

function tempEnv() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ollama-isolation-proof-'));
  return {
    home,
    env: {
      ...process.env,
      AIN_DELEGATION_HOME: home,
    },
  };
}

const fakeIdentity = (pid) => ({
  pid: Number(pid),
  process_name: 'synthetic-proof',
  start: 'synthetic-start',
  fingerprint: 'synthetic-process-' + String(pid),
});
const quietCensus = () => [];
const quietSockets = () => [];

function waitReady(child) {
  return new Promise((resolve, reject) => {
    let data = '';
    const timer = setTimeout(() => reject(new Error('server ready timeout')), 3000);
    child.stdout.on('data', (chunk) => {
      data += String(chunk);
      if (data.includes('READY')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once('error', reject);
    child.once('exit', (code) => {
      if (!data.includes('READY')) reject(new Error('server exited before ready: ' + code));
    });
  });
}

function syntheticServer(port) {
  const code = [
    "const http=require('http');",
    "const p=Number(process.argv[1]);",
    "const s=http.createServer((q,r)=>{r.end('ok')});",
    "s.listen(p,'127.0.0.1',()=>process.stdout.write('READY\\n'));",
    "process.on('SIGTERM',()=>s.close(()=>process.exit(0)));",
  ].join('');
  return spawn(process.execPath, ['-e', code, String(port)], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

console.log('=== S0R1R2 lease law ===');
{
  const { home, env } = tempEnv();
  try {
    let held;
    await check('quiescent host acquires one diagnostic lease', async () => {
      held = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-proof',
        holderPid: 70001,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(held.ok, true);
      assert.equal(held.status, 'HELD');
      assert.equal(inspectDiagnosticLease({ env }).state, 'HELD');
    });

    await check('lease presence does not create generation activity or execution authority', async () => {
      const activities = listGenerationActivities({ env });
      assert.equal(activities.valid.length, 0);
      assert.equal(activities.unknown.length, 0);
    });

    await check('second diagnostic lease is refused', async () => {
      const second = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-second',
        holderPid: 70002,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(second.ok, false);
      assert.equal(second.code, 'OLLAMA_DIAGNOSTIC_LEASE_ALREADY_HELD');
    });

    await check('covered generation is refused while diagnostic lease is held', async () => {
      const gate = checkGenerationAllowed({ consumer: 'synthetic-qwen', env });
      assert.equal(gate.ok, false);
      assert.equal(gate.code, 'OLLAMA_DIAGNOSTIC_LEASE_HELD');
      const activity = beginGenerationActivity({
        consumer: 'synthetic-qwen',
        providerId: 'qwen-local',
        modelId: 'qwen3-coder:30b',
        env,
      });
      assert.equal(activity.ok, false);
      assert.equal(listGenerationActivities({ env }).valid.length, 0);
    });

    await check('wrong-token release cannot clear diagnostic isolation', async () => {
      const out = releaseDiagnosticLease({ token: 'wrong-token', env });
      assert.equal(out.ok, false);
      assert.equal(out.code, 'DIAGNOSTIC_LEASE_TOKEN_MISMATCH');
      assert.equal(inspectDiagnosticLease({ env }).state, 'HELD');
    });

    await check('exact release restores only the generation gate, without running a provider', async () => {
      const out = releaseDiagnosticLease({ token: held.token, env });
      assert.equal(out.ok, true);
      const gate = checkGenerationAllowed({ consumer: 'synthetic-qwen', env });
      assert.equal(gate.ok, true);
      assert.equal(inspectDiagnosticLease({ env }).state, 'UNHELD');
    });

    await check('active generation activity defeats diagnostic acquisition', async () => {
      const activity = beginGenerationActivity({
        consumer: 'synthetic-existing-generator',
        providerId: 'qwen-local',
        modelId: 'qwen3-coder:30b',
        env,
      });
      assert.equal(activity.ok, true);
      const attempt = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-race-proof',
        holderPid: 70003,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(attempt.ok, false);
      assert.equal(attempt.code, 'REFUSE_LEASE_ACQUISITION');
      assert.equal(inspectDiagnosticLease({ env }).state, 'UNHELD');
      assert.equal(endGenerationActivity({
        activityId: activity.activity_id,
        token: activity.token,
        env,
      }).ok, true);
    });

    await check('unknown or malformed lease state fails closed', async () => {
      const file = diagnosticLeasePath(env);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, '{"state":"mystery"}\n');
      const gate = checkGenerationAllowed({ consumer: 'synthetic-qwen', env });
      assert.equal(gate.ok, false);
      assert.equal(gate.code, 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN');
      const attempt = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-malformed',
        holderPid: 70004,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(attempt.ok, false);
      assert.equal(attempt.code, 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN');
      fs.unlinkSync(file);
    });

    await check('stale lease never auto-clears and requires explicit token plus reason', async () => {
      const stale = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-stale',
        holderPid: 70005,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(stale.ok, true);
      const noReason = recoverDiagnosticLease({
        token: stale.token,
        reason: '',
        env,
        processIdentityFn: () => null,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(noReason.ok, false);
      assert.equal(noReason.code, 'EXPLICIT_RECOVERY_EVIDENCE_REQUIRED');
      assert.equal(inspectDiagnosticLease({ env }).state, 'HELD');
      const recovered = recoverDiagnosticLease({
        token: stale.token,
        reason: 'synthetic proof of explicit stale recovery',
        env,
        processIdentityFn: () => null,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(recovered.ok, true);
      assert.equal(recovered.status, 'RECOVERED');
      assert.equal(inspectDiagnosticLease({ env }).state, 'UNHELD');
    });

    await check('stale recovery fails closed when quiescence census is unavailable', async () => {
      const stale = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-recovery-census-failure',
        holderPid: 700051,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(stale.ok, true);
      const recovery = recoverDiagnosticLease({
        token: stale.token,
        reason: 'synthetic recovery census failure',
        env,
        processIdentityFn: () => null,
        censusFn: () => { throw new Error('synthetic ps failure'); },
        socketCensusFn: quietSockets,
      });
      assert.equal(recovery.ok, false);
      assert.equal(recovery.code, 'DIAGNOSTIC_ISOLATION_CENSUS_UNAVAILABLE');
      assert.equal(inspectDiagnosticLease({ env }).state, 'HELD');
      assert.equal(releaseDiagnosticLease({ token: stale.token, env }).ok, true);
    });

    await check('live original holder prevents recovery', async () => {
      const live = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-live-holder',
        holderPid: 70006,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(live.ok, true);
      const recovery = recoverDiagnosticLease({
        token: live.token,
        reason: 'must not recover a live holder',
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: quietSockets,
      });
      assert.equal(recovery.ok, false);
      assert.equal(recovery.code, 'DIAGNOSTIC_LEASE_HOLDER_STILL_ACTIVE');
      assert.equal(releaseDiagnosticLease({ token: live.token, env }).ok, true);
    });

    await check('withDiagnosticLease releases on diagnostic exception', async () => {
      await assert.rejects(
        withDiagnosticLease({
          actId: 'E3R3/S0R1R2-finally',
          holderPid: 70007,
          env,
          processIdentityFn: fakeIdentity,
          censusFn: quietCensus,
        socketCensusFn: quietSockets,
        }, async () => {
          throw new Error('synthetic diagnostic abort');
        }),
        /synthetic diagnostic abort/,
      );
      assert.equal(inspectDiagnosticLease({ env }).state, 'UNHELD');
    });

    await check('Ollama socket census identifies only clients whose remote endpoint is :11434', async () => {
      const clients = ollamaClientCensus({
        lsofText: [
          'p111', 'cnode', 'n127.0.0.1:51000->127.0.0.1:11434',
          'p222', 'collama', 'n127.0.0.1:11434->127.0.0.1:51000',
          'p333', 'cnode', 'n127.0.0.1:51001->127.0.0.1:9999',
        ].join('\n'),
      });
      assert.deepEqual(clients, [{ pid: 111, process_name: 'node' }]);
    });

    await check('existing Ollama client socket defeats diagnostic acquisition', async () => {
      const attempt = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-socket-proof',
        holderPid: 70008,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: quietCensus,
        socketCensusFn: () => [{ pid: 444, process_name: 'legacy-client' }],
      });
      assert.equal(attempt.ok, false);
      assert.equal(attempt.code, 'REFUSE_LEASE_ACQUISITION');
      assert.equal(attempt.ollama_socket_clients.length, 1);
      assert.equal(inspectDiagnosticLease({ env }).state, 'UNHELD');
    });

    await check('census instrumentation failure refuses acquisition and removes its provisional lease', async () => {
      const attempt = acquireDiagnosticLease({
        actId: 'E3R3/S0R1R2-census-failure-proof',
        holderPid: 70009,
        env,
        processIdentityFn: fakeIdentity,
        censusFn: () => { throw new Error('synthetic ps failure'); },
        socketCensusFn: quietSockets,
      });
      assert.equal(attempt.ok, false);
      assert.equal(attempt.code, 'DIAGNOSTIC_ISOLATION_CENSUS_UNAVAILABLE');
      assert.equal(inspectDiagnosticLease({ env }).state, 'UNHELD');
    });

    await check('legacy census recognizes every pre-instrumentation local generator class', async () => {
      const rows = legacyGeneratorCensus({
        psText: [
          ' 101 1 node scripts/builder/jarvis-local-worker.mjs run --prompt-file x --model qwen3-coder:30b',
          ' 102 1 bash scripts/ain-delegate.sh local-native wu-1',
          ' 103 1 opencode run --standalone --model ollama/gpt-oss:20b prompt',
          ' 104 1 bash scripts/ain-delegate.sh local wu-legacy',
          ' 105 1 node scripts/builder/__tests__/router-alpha-proof.mjs',
          ' 106 1 sleep 99',
        ].join('\n'),
      });
      assert.deepEqual(rows.map((r) => r.kind).sort(), [
        'ain-delegate-local',
        'ain-delegate-local-native',
        'canonical-opencode-local',
        'jarvis-local-worker',
        'router-alpha-local-proof',
      ]);
      assert.equal(Object.prototype.hasOwnProperty.call(rows[0], 'command'), false);
    });
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
}

console.log('\n=== S0R1R2 covered JARVIS generation seams ===');
{
  const repo = path.resolve(import.meta.dirname, '..', '..', '..');
  const desktop = fs.readFileSync(path.join(repo, 'jarvis-desktop/src/main.js'), 'utf8');
  const delegate = fs.readFileSync(path.join(repo, 'scripts/ain-delegate.sh'), 'utf8');
  const routerProof = fs.readFileSync(
    path.join(repo, 'scripts/builder/__tests__/router-alpha-proof.mjs'), 'utf8',
  );

  await check('Desktop C1 activity marker precedes direct /api/generate and releases afterward', async () => {
    const begin = desktop.indexOf("consumer: 'jarvis-desktop:C1'");
    const fetchAt = desktop.indexOf("fetch('http://127.0.0.1:11434/api/generate'", begin);
    const end = desktop.indexOf('leaseMod.endGenerationActivity', fetchAt);
    assert.ok(begin >= 0 && fetchAt > begin && end > fetchAt);
  });

  await check('legacy ain-delegate local lane holds an activity across maia-code', async () => {
    const begin = delegate.indexOf('begin-generation');
    const worker = delegate.indexOf('maia-code -p', begin);
    const end = delegate.indexOf('end-generation', worker);
    assert.ok(begin >= 0 && worker > begin && end > worker);
  });

  await check('router-alpha direct Ollama proof holds an activity across /api/generate', async () => {
    const begin = routerProof.indexOf("consumer: 'router-alpha-proof:C1'");
    const fetchAt = routerProof.indexOf("fetch('http://127.0.0.1:11434/api/generate'", begin);
    const end = routerProof.indexOf('endGenerationActivity', fetchAt);
    assert.ok(begin >= 0 && fetchAt > begin && end > fetchAt);
  });
}

console.log('\\n=== S0R1R2 process network containment ===');
{
  const { home, env } = tempEnv();
  const allowedPort = 48231;
  const forbiddenPort = 48232;
  const allowed = syntheticServer(allowedPort);
  const forbidden = syntheticServer(forbiddenPort);
  try {
    await Promise.all([waitReady(allowed), waitReady(forbidden)]);
    const held = acquireDiagnosticLease({
      actId: 'E3R3/S0R1R2-sandbox-proof',
      holderPid: 70100,
      env,
      processIdentityFn: fakeIdentity,
      censusFn: quietCensus,
        socketCensusFn: quietSockets,
    });
    assert.equal(held.ok, true);
    const sandboxEnv = {
      ...env,
      JARVIS_OLLAMA_DIAGNOSTIC_LEASE_TOKEN: held.token,
    };

    await check('sandbox profile denies outbound by default and admits only designated stub port', async () => {
      const profile = diagnosticSandboxProfile(allowedPort);
      assert.match(profile, /\(deny network-outbound\)/);
      assert.match(profile, new RegExp('localhost:' + allowedPort));
      assert.equal(profile.includes('11434'), false);
      assert.throws(() => diagnosticSandboxProfile(11434), /DIAGNOSTIC_STUB_MAY_NOT_BE_OLLAMA_PORT/);
    });

    await check('sandboxed child can reach designated synthetic stub', async () => {
      const out = runDiagnosticSandbox({
        stubPort: allowedPort,
        command: '/usr/bin/curl',
        args: ['-fsS', '--max-time', '2', 'http://127.0.0.1:' + allowedPort + '/'],
        env: sandboxEnv,
      });
      assert.equal(out.ok, true, out.stderr);
      assert.equal(out.stdout, 'ok');
    });

    await check('sandboxed child cannot reach a different loopback port', async () => {
      const out = runDiagnosticSandbox({
        stubPort: allowedPort,
        command: '/usr/bin/curl',
        args: ['-fsS', '--max-time', '2', 'http://127.0.0.1:' + forbiddenPort + '/'],
        env: sandboxEnv,
      });
      assert.equal(out.ok, false);
      assert.notEqual(out.exit_code, 0);
    });

    assert.equal(releaseDiagnosticLease({ token: held.token, env }).ok, true);
  } finally {
    allowed.kill('SIGTERM');
    forbidden.kill('SIGTERM');
    fs.rmSync(home, { recursive: true, force: true });
  }
}

console.log('\\n' + passed + ' passed · 0 failed');
