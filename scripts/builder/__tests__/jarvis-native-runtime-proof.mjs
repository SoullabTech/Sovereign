#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-runtime-"));
const home = path.join(tmp, "ain");
const repo = path.join(tmp, "repo");
mkdirSync(home);
mkdirSync(repo);
process.env.AIN_DELEGATION_HOME = home;

const { checkAuthority, validateNativePatchResult, rollbackNativeCandidate } =
  await import("../jarvis-runtime-pipeline.mjs?native-runtime-proof=" + Date.now());

let passed = 0;
const check = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log("  PASS  " + name);
  } catch (error) {
    console.error("  FAIL  " + name);
    throw error;
  }
};

const git = (args, opts = {}) => execFileSync("git", args, {
  cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts,
}).trim();

try {
  git(["init", "-q"]);
  git(["config", "user.name", "Proof"]);
  git(["config", "user.email", "proof@local.invalid"]);
  writeFileSync(path.join(repo, "allowed.txt"), "before\n");
  git(["add", "."]);
  git(["commit", "-qm", "base"]);
  const base = git(["rev-parse", "HEAD"]);

  writeFileSync(path.join(repo, "allowed.txt"), "after\n");
  git(["add", "allowed.txt"]);
  execFileSync("git", [
    "-c", "user.name=JARVIS",
    "-c", "user.email=jarvis@local.invalid",
    "commit", "-qm", "chore(jarvis): native-runtime-proof",
  ], { cwd: repo, stdio: ["ignore", "pipe", "pipe"] });
  const head = git(["rev-parse", "HEAD"]);

  const packet = {
    work_unit_id: "native-runtime-proof",
    objective: "Change allowed.txt from before to after.",
    expected_output: "one bounded candidate",
    execution_lane: "local-native",
    canonical_sha: base,
    branch: "fix/native-runtime-proof",
    allowed_files: ["allowed.txt"],
    context_selectors: ["allowed.txt"],
    verification_commands: ["grep -q '^after$' allowed.txt"],
    authorized_acts: ["repo.read", "repo.write:worktree", "tests.run"],
    not_authorized_acts: [
      "production.read", "production.write", "deploy", "authority.change",
      "network.external", "provider.spend", "repo.disclose:external-readonly",
    ],
    integration_actor: "jarvis",
  };

  const ledger = path.join(home, "native-patch-admission", packet.work_unit_id + ".jsonl");
  mkdirSync(path.dirname(ledger), { recursive: true });
  const patchDigest = "sha256:" + "a".repeat(64);
  writeFileSync(ledger, JSON.stringify({
    event_version: "NPA1.v1",
    event: "APPLIED",
    code: "PATCH_APPLIED",
    applied: true,
    work_unit_id: packet.work_unit_id,
    patch_digest: patchDigest,
    patch_paths: ["allowed.txt"],
    changed_paths: ["allowed.txt"],
  }) + "\n");

  const result = {
    work_unit_id: packet.work_unit_id,
    lane: "local-native",
    model: "qwen3-coder:30b",
    starting_sha: base,
    ending_sha: head,
    files_changed: ["allowed.txt"],
    summary: "candidate verified",
    exit_code: 0,
    test_results: "pass",
    escalation_required: false,
    recommended_next_action: "review-diff",
    log_path: path.join(tmp, "worker.log"),
    duration_s: 1,
    patch_admission: {
      ok: true,
      status: "APPLIED",
      code: "PATCH_APPLIED",
      patch_digest: patchDigest,
      patch_paths: ["allowed.txt"],
      changed_paths: ["allowed.txt"],
      evidence_path: ledger,
      event: { applied: true },
    },
  };

  check("bounded worktree-write belongs to JARVIS while worker write knobs remain absent", () => {
    const auth = checkAuthority(packet);
    assert.equal(auth.ok, true, JSON.stringify(auth));
    assert.equal(auth.envelope.repo_write_scope, "worktree");
    assert.equal(auth.envelope.integration_actor, "jarvis");
  });

  check("legacy worker-write knob is still refused", () => {
    const auth = checkAuthority({ ...packet, permission_mode: "bypassPermissions" });
    assert.equal(auth.ok, false);
    assert.equal(auth.failure_class, "LOCAL_WORKER_WRITE_AUTHORITY_REFUSED");
  });

  check("external-network authority is refused", () => {
    const auth = checkAuthority({
      ...packet,
      authorized_acts: [...packet.authorized_acts, "network.external"],
      not_authorized_acts: packet.not_authorized_acts.filter((v) => v !== "network.external"),
    });
    assert.equal(auth.ok, false);
    assert.equal(auth.failure_class, "NATIVE_AUTHORITY_TOO_BROAD");
  });

  check("coding lane refuses an unverifiable Work Unit", () => {
    const auth = checkAuthority({ ...packet, verification_commands: [] });
    assert.equal(auth.ok, false);
    assert.equal(auth.failure_class, "NATIVE_VERIFICATION_REQUIRED");
  });

  check("exact NPA1 evidence + one JARVIS commit + verifier replay is admitted", () => {
    const verdict = validateNativePatchResult(packet, result, repo);
    assert.equal(verdict.ok, true, JSON.stringify(verdict));
    assert.equal(verdict.commit_sha, head);
    assert.deepEqual(verdict.changed_paths, ["allowed.txt"]);
    assert.equal(verdict.verification.length, 1);
  });

  check("result cannot lie about changed paths", () => {
    const verdict = validateNativePatchResult(
      packet, { ...result, files_changed: ["allowed.txt", "other.txt"] }, repo,
    );
    assert.equal(verdict.ok, false);
    assert.equal(verdict.failure_class, "NATIVE_PATH_EVIDENCE_MISMATCH");
  });

  check("runtime verifier mutation is rejected and rollback restores the exact canonical base", () => {
    const mutatingPacket = {
      ...packet,
      verification_commands: ["printf 'drift\\n' >> allowed.txt"],
    };
    const verdict = validateNativePatchResult(mutatingPacket, result, repo);
    assert.equal(verdict.ok, false);
    assert.equal(verdict.failure_class, "NATIVE_VERIFICATION_MUTATED_CANDIDATE");

    const rollback = rollbackNativeCandidate(repo, base);
    assert.equal(rollback.ok, true, JSON.stringify(rollback));
    assert.equal(git(["rev-parse", "HEAD"]), base);
    assert.equal(git(["status", "--porcelain", "--untracked-files=all"]), "");
    assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "before\n");
  });

  check("runtime admits one exact-parent JARVIS commit spanning replacement + new file", () => {
    writeFileSync(path.join(repo, "allowed.txt"), "after-multi\n");
    writeFileSync(path.join(repo, "new.txt"), "created\n");
    git(["add", "allowed.txt", "new.txt"]);
    execFileSync("git", [
      "-c", "user.name=JARVIS",
      "-c", "user.email=jarvis@local.invalid",
      "commit", "-qm", "chore(jarvis): native-runtime-multifile-newfile-proof",
    ], { cwd: repo, stdio: ["ignore", "pipe", "pipe"] });
    const multiHead = git(["rev-parse", "HEAD"]);

    const multiPacket = {
      ...packet,
      work_unit_id: "native-runtime-multifile-newfile-proof",
      objective: "Modify allowed.txt and create new.txt.",
      allowed_files: ["allowed.txt", "new.txt"],
      verification_commands: [
        "grep -q '^after-multi$' allowed.txt",
        "grep -q '^created$' new.txt",
      ],
    };
    const multiDigest = "sha256:" + "b".repeat(64);
    const multiLedger = path.join(
      home, "native-patch-admission", multiPacket.work_unit_id + ".jsonl",
    );
    writeFileSync(multiLedger, JSON.stringify({
      event_version: "NPA1.v1",
      event: "APPLIED",
      code: "PATCH_APPLIED",
      applied: true,
      work_unit_id: multiPacket.work_unit_id,
      patch_digest: multiDigest,
      patch_paths: ["allowed.txt", "new.txt"],
      changed_paths: ["allowed.txt", "new.txt"],
    }) + "\n");

    const multiResult = {
      ...result,
      work_unit_id: multiPacket.work_unit_id,
      starting_sha: base,
      ending_sha: multiHead,
      files_changed: ["allowed.txt", "new.txt"],
      patch_admission: {
        ok: true,
        status: "APPLIED",
        code: "PATCH_APPLIED",
        patch_digest: multiDigest,
        patch_paths: ["allowed.txt", "new.txt"],
        changed_paths: ["allowed.txt", "new.txt"],
        evidence_path: multiLedger,
        event: { applied: true },
      },
    };

    const verdict = validateNativePatchResult(multiPacket, multiResult, repo);
    assert.equal(verdict.ok, true, JSON.stringify(verdict));
    assert.equal(verdict.commit_sha, multiHead);
    assert.deepEqual(verdict.changed_paths, ["allowed.txt", "new.txt"]);
    assert.equal(verdict.verification.length, 2);
  });

  console.log("\n" + passed + " passed · 0 failed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
