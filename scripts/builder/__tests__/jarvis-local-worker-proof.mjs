#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { health, isPermittedLocalHost, run } from "../jarvis-local-worker.mjs";

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

  const delegate = readFileSync(new URL("../../ain-delegate.sh", import.meta.url), "utf8");
  await check("delegate pins local-native child to exact loopback Ollama", async () => {
    assert.match(delegate, /JARVIS_OLLAMA_HOST="http:\/\/127\.0\.0\.1:11434"/);
  });

  await check("candidate commit failure is followed by hard reset and clean", async () => {
    const marker = 'FAIL: JARVIS candidate commit\\n';
    const i = delegate.indexOf(marker);
    assert.notEqual(i, -1);
    const tail = delegate.slice(i, i + 1500);
    assert.match(tail, /reset --hard "\$starting_sha"/);
    assert.match(tail, /clean -fd/);
  });

  console.log("\n" + passed + " passed · 0 failed");
} finally {
  globalThis.fetch = originalFetch;
}
