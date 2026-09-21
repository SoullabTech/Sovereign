#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  TOOL_DECISION,
  decideDirectTool,
  dispatchDirectTool,
} from "../jarvis-tool-permissions.mjs";

let passed = 0;
const check = async (name, fn) => {
  try {
    await fn();
    passed += 1;
    console.log("  PASS  " + name);
  } catch (error) {
    console.error("  FAIL  " + name);
    throw error;
  }
};

console.log("\n=== DP1: read-only port preserves denials ===");
await check("readonly edit is refused", async () => {
  const d = decideDirectTool({
    mode: "review",
    tool: "edit",
    args: { path: "x", content: "bad" },
  });
  assert.equal(d.decision, TOOL_DECISION.REFUSE);
  assert.equal(d.reason, "DENIED_BY_LEGACY_PERMISSION_PORT");
  assert.equal(d.executed, false);
});

await check("readonly bash is refused", async () => {
  const d = decideDirectTool({
    mode: "review",
    tool: "bash",
    args: { command: "rm -rf ." },
  });
  assert.equal(d.decision, TOOL_DECISION.REFUSE);
  assert.equal(d.reason, "GENERIC_SHELL_NOT_EXPOSED");
});

await check("readonly webfetch is refused", async () => {
  const d = decideDirectTool({
    mode: "review",
    tool: "webfetch",
    args: { url: "https://example.com" },
  });
  assert.equal(d.decision, TOOL_DECISION.REFUSE);
});

console.log("\n=== DP2: build lane is bounded by Work Unit scope ===");
await check("in-scope write is admitted", async () => {
  const d = decideDirectTool({
    mode: "build",
    tool: "write_file",
    args: { path: "scripts/a.mjs", content: "ok" },
    allowedFiles: ["scripts/a.mjs"],
  });
  assert.equal(d.decision, TOOL_DECISION.ALLOW);
});

await check("out-of-scope write is refused before execution", async () => {
  let executed = 0;
  const out = await dispatchDirectTool({
    mode: "build",
    tool: "write_file",
    args: { path: "outside.txt", content: "bad" },
    allowedFiles: ["scripts/a.mjs"],
    executor: async () => {
      executed += 1;
      return "SHOULD_NOT_RUN";
    },
  });
  assert.equal(out.ok, false);
  assert.equal(out.receipt.reason, "WRITE_OUTSIDE_WORK_UNIT_SCOPE");
  assert.equal(out.receipt.executed, false);
  assert.equal(executed, 0);
});

console.log("\n=== DP3: decisive forbidden-call falsifiers ===");
for (const [tool, args, expected] of [
  ["edit", { path: "scripts/a.mjs", content: "bad" }, "DENIED_BY_LEGACY_PERMISSION_PORT"],
  ["bash", { command: "rm -rf /tmp/jarvis-proof" }, "GENERIC_SHELL_NOT_EXPOSED"],
  ["webfetch", { url: "https://example.com" }, "DENIED_BY_LEGACY_PERMISSION_PORT"],
]) {
  await check(tool + " refusal records evidence and never invokes executor", async () => {
    let executed = 0;
    const out = await dispatchDirectTool({
      mode: "build",
      tool,
      args,
      allowedFiles: ["scripts/a.mjs"],
      executor: async () => {
        executed += 1;
        return "SHOULD_NOT_RUN";
      },
    });
    assert.equal(out.ok, false);
    assert.equal(out.receipt.reason, expected);
    assert.equal(out.receipt.executed, false);
    assert.match(out.receipt.args_digest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(executed, 0);
    assert.equal(JSON.stringify(out.receipt).includes("rm -rf"), false);
    assert.equal(JSON.stringify(out.receipt).includes("example.com"), false);
  });
}

console.log("\n" + passed + " passed · 0 failed");
