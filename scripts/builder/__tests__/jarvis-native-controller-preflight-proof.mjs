#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync,
  rmSync, writeFileSync,
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
const DELEGATE = path.join(REPO, "scripts", "ain-delegate.sh");
const SHA = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: REPO,
  encoding: "utf8",
}).trim();

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log("  PASS  " + name);
};

const basePacket = (id, patch = {}) => ({
  work_unit_id: id,
  title: "native controller preflight proof",
  objective: "Bounded synthetic coding objective.",
  execution_lane: "local-native",
  task_class: "CODE_GROUNDED",
  canonical_sha: SHA,
  branch: "chore/ain-delegate-" + id,
  governing_authority: "synthetic proof",
  established_facts: [],
  allowed_files: ["scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs"],
  prohibited_files_actions: ["no other files"],
  acceptance_criteria: ["synthetic"],
  verification_commands: ["true"],
  escalation_conditions: [],
  expected_output: "synthetic",
  context_selectors: ["scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs"],
  authorized_acts: ["repo.read", "repo.write:worktree", "tests.run"],
  not_authorized_acts: [
    "production.read", "production.write", "deploy", "authority.change",
    "network.external", "provider.spend", "repo.disclose:external-readonly",
  ],
  integration_actor: "jarvis",
  ...patch,
});

function runCase(patch) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-preflight-"));
  const ain = path.join(tmp, "ain");
  const worktrees = path.join(tmp, "worktrees");
  const packets = path.join(ain, "packets");
  mkdirSync(packets, { recursive: true });
  mkdirSync(worktrees, { recursive: true });
  const id = "native-preflight-" + process.pid + "-" + Math.random().toString(36).slice(2, 8);
  const packetPath = path.join(packets, id + ".json");
  writeFileSync(packetPath, JSON.stringify(basePacket(id, patch), null, 2) + "\n");

  const out = spawnSync("bash", [DELEGATE, "local-native", id], {
    cwd: REPO,
    env: {
      ...process.env,
      AIN_DELEGATION_HOME: ain,
      AIN_WORKTREES_ROOT: worktrees,
      BUILDER_MAX_CLAUDE_SESSIONS: "2",
    },
    encoding: "utf8",
  });

  const packetAfter = JSON.parse(readFileSync(packetPath, "utf8"));
  const worktreeEntries = existsSync(worktrees) ? readdirSync(worktrees) : [];
  const result = {
    status: out.status,
    stderr: out.stderr,
    stdout: out.stdout,
    packetAfter,
    worktreeEntries,
  };
  rmSync(tmp, { recursive: true, force: true });
  return result;
}

console.log("\n=== NCP1: native coding preflight fails before workspace/model use ===");

check("verification commands are mandatory", () => {
  const r = runCase({ verification_commands: [] });
  assert.equal(r.status, 3);
  assert.match(r.stderr, /LOCAL_NATIVE_VERIFICATION_REQUIRED/);
  assert.equal(r.packetAfter.worktree ?? null, null);
  assert.equal(r.packetAfter.builder_session_id ?? null, null);
  assert.deepEqual(r.worktreeEntries, []);
});

check("allowed files are mandatory", () => {
  const r = runCase({ allowed_files: [] });
  assert.equal(r.status, 3);
  assert.match(r.stderr, /LOCAL_NATIVE_FILE_SCOPE_REQUIRED/);
  assert.equal(r.packetAfter.worktree ?? null, null);
  assert.deepEqual(r.worktreeEntries, []);
});

check("JARVIS must be the integration actor", () => {
  const r = runCase({ integration_actor: "founder" });
  assert.equal(r.status, 3);
  assert.match(r.stderr, /LOCAL_NATIVE_INTEGRATION_ACTOR_REFUSED/);
  assert.equal(r.packetAfter.worktree ?? null, null);
  assert.deepEqual(r.worktreeEntries, []);
});

check("read-only authority cannot enter the coding lane", () => {
  const r = runCase({
    authorized_acts: ["repo.read"],
    not_authorized_acts: [
      "repo.write:worktree", "production.read", "production.write",
      "deploy", "authority.change", "network.external",
      "provider.spend", "repo.disclose:external-readonly",
    ],
  });
  assert.equal(r.status, 3);
  assert.match(r.stderr, /LOCAL_NATIVE_AUTHORITY_REFUSED/);
  assert.equal(r.packetAfter.worktree ?? null, null);
  assert.deepEqual(r.worktreeEntries, []);
});

console.log("\n" + passed + " passed · 0 failed");
