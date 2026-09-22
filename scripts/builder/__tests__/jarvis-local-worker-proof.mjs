#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { health, isPermittedLocalHost, run } from "../jarvis-local-worker.mjs";
import {
  acquireDiagnosticLease,
  releaseDiagnosticLease,
} from "../jarvis-ollama-generation-lease.mjs";

let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed += 1;
  console.log("  PASS  " + name);
};

const originalFetch = globalThis.fetch;
let fetchCalls = 0;
globalThis.fetch = async () => {
  fetchCalls += 1;
  throw new Error("fetch must not be reached for a refused host");
};

try {
  await check("exact governed loopback endpoint is admitted", async () => {
    assert.equal(isPermittedLocalHost("http://127.0.0.1:11434"), true);
  });

  await check("localhost alias is not admitted by the exact V1 pin", async () => {
    assert.equal(isPermittedLocalHost("http://localhost:11434"), false);
  });

  await check("external host is refused before worker fetch", async () => {
    const result = await run({
      prompt: "bounded test",
      model: "qwen3-coder:30b",
      host: "https://example.com",
    });
    assert.equal(result.ok, false);
    assert.equal(result.failure_class, "NONLOCAL_HOST_REFUSED");
    assert.equal(fetchCalls, 0);
  });

  await check("health probe also refuses non-loopback before fetch", async () => {
    const result = await health("http://192.0.2.1:11434");
    assert.equal(result.ok, false);
    assert.equal(result.reason, "NONLOCAL_HOST_REFUSED");
    assert.equal(fetchCalls, 0);
  });

  await check("diagnostic lease refuses local worker before /api/generate fetch", async () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), "local-worker-lease-proof-"));
    const previous = process.env.JARVIS_OLLAMA_GENERATION_LEASE_PATH;
    process.env.JARVIS_OLLAMA_GENERATION_LEASE_PATH = path.join(tmp, "lease.json");
    try {
      const held = acquireDiagnosticLease({
        actId: "E3R3/S0R1R2-worker-proof",
        holderPid: process.pid,
        env: process.env,
        censusFn: () => [],
        socketCensusFn: () => [],
      });
      assert.equal(held.ok, true);
      const before = fetchCalls;
      const result = await run({
        prompt: "bounded test",
        model: "qwen3-coder:30b",
        host: "http://127.0.0.1:11434",
      });
      assert.equal(result.ok, false);
      assert.equal(result.failure_class, "OLLAMA_DIAGNOSTIC_LEASE_HELD");
      assert.equal(fetchCalls, before);
      assert.equal(releaseDiagnosticLease({ token: held.token, env: process.env }).ok, true);
    } finally {
      if (previous === undefined) delete process.env.JARVIS_OLLAMA_GENERATION_LEASE_PATH;
      else process.env.JARVIS_OLLAMA_GENERATION_LEASE_PATH = previous;
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  const delegate = readFileSync(new URL("../../ain-delegate.sh", import.meta.url), "utf8");
  await check("delegate pins local-native child to exact loopback Ollama", async () => {
    assert.match(delegate, /JARVIS_OLLAMA_HOST="http:\/\/127\.0\.0\.1:11434"/);
  });

  await check("delegate diagnostic gate precedes both native worker launches", async () => {
    const gates = [...delegate.matchAll(/check-consumer/g)].map((m) => m.index);
    const launches = [...delegate.matchAll(/node "\$LOCAL_WORKER_SCRIPT" run/g)].map((m) => m.index);
    assert.equal(gates.length >= 2, true);
    assert.equal(launches.length >= 2, true);
    assert.equal(gates[0] < launches[0], true);
    assert.equal(gates[1] < launches[1], true);
  });

  await check("candidate commit failure is followed by hard reset and clean", async () => {
    const marker = 'FAIL: JARVIS candidate commit\\n';
    const i = delegate.indexOf(marker);
    assert.notEqual(i, -1);
    const tail = delegate.slice(i, i + 1500);
    assert.match(tail, /reset --hard "\$starting_sha"/);
    assert.match(tail, /clean -fd/);
  });

  await check("native gate serialization requires one pure single-line claim", async () => {
    assert.match(delegate, /gate_line_count/);
    assert.match(delegate, /native GOVERNANCE_GATE output was not one pure single-line claim/);
    assert.match(delegate, /\[ "\$gate_line_count" -ne 1 \]/);
  });

  await check("verification cannot mutate the admitted native candidate", async () => {
    assert.match(delegate, /_native_worktree_fingerprint/);
    assert.match(delegate, /VERIFICATION_MUTATED_WORKTREE/);
    assert.match(delegate, /exit_code=12/);
  });

  await check("native repair is exactly one bounded post-verification retry", async () => {
    assert.match(delegate, /REPAIR TURN — ONE BOUNDED RETRY/);
    assert.match(delegate, /repair_attempted=true/);
    assert.match(delegate, /attempts=2/);
    assert.match(delegate, /\.ok \/\/ false/);
    const retryStart = delegate.indexOf("REPAIR TURN — ONE BOUNDED RETRY");
    const rollbackBefore = delegate.lastIndexOf('reset --hard "$starting_sha"', retryStart);
    assert.ok(rollbackBefore >= 0 && rollbackBefore < retryStart);
    assert.equal((delegate.match(/REPAIR TURN — ONE BOUNDED RETRY/g) || []).length, 1);
    assert.doesNotMatch(delegate.slice(retryStart), /while .*REPAIR TURN/);
  });

  await check("repair verification holds the same candidate-byte custody law", async () => {
    assert.match(delegate, /REPAIR_VERIFICATION_MUTATED_WORKTREE/);
    assert.match(delegate, /repair_verified_fingerprint/);
    assert.match(delegate, /repair_verified_head/);
  });

  await check("each native run rotates prior fixed-path logs instead of mixing evidence", async () => {
    assert.match(delegate, /_rotate_run_log/);
    assert.match(delegate, /log\.verify\.repair1/);
    assert.match(delegate, /previous\.\$\(date \+%s\)\.\$\$/);
  });

  console.log("\n" + passed + " passed · 0 failed");
} finally {
  globalThis.fetch = originalFetch;
}
