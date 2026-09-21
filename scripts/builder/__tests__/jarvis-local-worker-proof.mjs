#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  health, isPermittedLocalHost, run,
} from "../jarvis-local-worker.mjs";

let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed += 1;
  console.log("  PASS  " + name);
};

console.log("\n=== NLW1: loopback-only transport boundary ===");

await check("exact Ollama loopback endpoint is admitted", async () => {
  assert.equal(isPermittedLocalHost("http://127.0.0.1:11434"), true);
});

for (const host of [
  "http://localhost:11434",
  "https://127.0.0.1:11434",
  "http://127.0.0.1:11435",
  "http://192.168.1.10:11434",
  "http://example.com:11434",
  "http://user:pass@127.0.0.1:11434",
  "http://127.0.0.1:11434/?x=1",
]) {
  await check("refuses non-canonical host " + host, async () => {
    assert.equal(isPermittedLocalHost(host), false);
  });
}

await check("run refuses external host before any fetch occurs", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("fetch must not be called");
  };
  try {
    const out = await run({
      prompt: "bounded task",
      model: "qwen3-coder:30b",
      host: "http://example.com:11434",
    });
    assert.equal(out.ok, false);
    assert.equal(out.failure_class, "NONLOCAL_HOST_REFUSED");
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await check("health refuses external host before any fetch occurs", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("fetch must not be called");
  };
  try {
    const out = await health("http://10.0.0.5:11434");
    assert.equal(out.ok, false);
    assert.equal(out.reason, "NONLOCAL_HOST_REFUSED");
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

console.log("\n" + passed + " passed · 0 failed");
