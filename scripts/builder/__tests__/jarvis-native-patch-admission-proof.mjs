#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import {
  applyNativePatch, inspectPatch, ledgerPath,
} from "../jarvis-native-patch-admission.mjs";

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

const packet = (allowedFiles = ["allowed.txt"], canonicalSha = null) => ({
  work_unit_id: "native-patch-proof",
  allowed_files: allowedFiles,
  canonical_sha: canonicalSha,
  authorized_acts: ["repo.read", "repo.write:worktree", "tests.run"],
  not_authorized_acts: [
    "production.read", "production.write", "deploy", "authority.change",
    "network.external", "provider.spend", "repo.disclose:external-readonly",
  ],
  integration_actor: "jarvis",
});

const patchFor = (file, before, after) => [
  "diff --git a/" + file + " b/" + file,
  "index 1111111..2222222 100644",
  "--- a/" + file,
  "+++ b/" + file,
  "@@ -1 +1 @@",
  "-" + before,
  "+" + after,
  "",
].join("\n");

console.log("\n=== NPA1: lethal unauthorized-path falsifier ===");
check("unauthorized patch is refused before any git invocation and durably recorded", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-refusal-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  writeFileSync(path.join(repo, "forbidden.txt"), "before\n");

  let gitCalls = 0;
  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: patchFor("forbidden.txt", "before", "after"),
    worktree: repo,
    home,
    runGit: () => {
      gitCalls += 1;
      throw new Error("git must not be called");
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "PATCH_PATH_NOT_AUTHORIZED");
  assert.equal(gitCalls, 0);
  assert.equal(readFileSync(path.join(repo, "forbidden.txt"), "utf8"), "before\n");

  const events = readFileSync(ledgerPath("native-patch-proof", { home }), "utf8")
    .trim().split("\n").map(JSON.parse);
  assert.equal(events.length, 1);
  assert.equal(events[0].event, "REFUSED");
  assert.equal(events[0].code, "PATCH_PATH_NOT_AUTHORIZED");
  assert.equal(events[0].applied, false);
  assert.equal(events[0].git_check_invoked, false);
  assert.equal(events[0].git_apply_invoked, false);
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA1B: overbroad authority is refused before git ===");
check("external-network authority is refused before any git invocation", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-authority-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  writeFileSync(path.join(repo, "allowed.txt"), "before\n");

  const broad = packet(["allowed.txt"]);
  broad.authorized_acts = [...broad.authorized_acts, "network.external"];
  broad.not_authorized_acts = broad.not_authorized_acts.filter((act) => act !== "network.external");

  let gitCalls = 0;
  const result = applyNativePatch({
    packet: broad,
    patchText: patchFor("allowed.txt", "before", "after"),
    worktree: repo,
    home,
    runGit: () => {
      gitCalls += 1;
      throw new Error("git must not be called");
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "PATCH_AUTHORITY_TOO_BROAD");
  assert.equal(gitCalls, 0);
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "before\n");
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA1C: integration custody is JARVIS-only ===");
check("non-JARVIS integration actor is refused before any git invocation", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-integrator-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  writeFileSync(path.join(repo, "allowed.txt"), "before\n");

  const wrongIntegrator = packet(["allowed.txt"]);
  wrongIntegrator.integration_actor = "human";

  let gitCalls = 0;
  const result = applyNativePatch({
    packet: wrongIntegrator,
    patchText: patchFor("allowed.txt", "before", "after"),
    worktree: repo,
    home,
    runGit: () => {
      gitCalls += 1;
      throw new Error("git must not be called");
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "JARVIS_INTEGRATION_ACTOR_REQUIRED");
  assert.equal(gitCalls, 0);
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "before\n");
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA1D: canonical SHA must be immutable commit syntax ===");
check("movable canonical ref is refused before any git invocation", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-sha-format-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  writeFileSync(path.join(repo, "allowed.txt"), "before\n");
  let gitCalls = 0;
  const result = applyNativePatch({
    packet: packet(["allowed.txt"], "HEAD"),
    patchText: patchFor("allowed.txt", "before", "after"),
    worktree: repo,
    home,
    runGit: () => {
      gitCalls += 1;
      throw new Error("git must not be called");
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "PACKET_CANONICAL_SHA_INVALID");
  assert.equal(gitCalls, 0);
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA1E: stale worktree SHA is refused before apply-check ===");
check("packet canonical SHA must equal the execution worktree HEAD", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-sha-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "before\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });
  const oldSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
  writeFileSync(path.join(repo, "marker.txt"), "advance\n");
  execFileSync("git", ["add", "marker.txt"], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "advance"], { cwd: repo });

  const result = applyNativePatch({
    packet: packet(["allowed.txt"], oldSha),
    patchText: patchFor("allowed.txt", "before", "after"),
    worktree: repo,
    home,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "WORKTREE_CANONICAL_SHA_MISMATCH");
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "before\n");
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA1F: non-text tracked target is refused before apply-check ===");
check("tracked symlink/submodule mode is outside native V1 text-patch authority", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-mode-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  const sha = "a".repeat(40);
  let applyCheckSeen = false;
  const result = applyNativePatch({
    packet: packet(["allowed.txt"], sha),
    patchText: patchFor("allowed.txt", "before", "after"),
    worktree: repo,
    home,
    runGit: (_worktree, args) => {
      if (args[0] === "rev-parse") return sha + "\n";
      if (args[0] === "ls-files" && args[1] === "-s") {
        return "120000 1111111111111111111111111111111111111111 0\tallowed.txt\n";
      }
      if (args[0] === "apply" && args.includes("--check")) applyCheckSeen = true;
      throw new Error("unexpected git call: " + args.join(" "));
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "PATCH_TARGET_MODE_UNSUPPORTED");
  assert.equal(applyCheckSeen, false);
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA2: structural refusals ===");
check("prose before a patch is refused", () => {
  const r = inspectPatch("Here is the patch:\n" + patchFor("allowed.txt", "before", "after"), ["allowed.txt"]);
  assert.equal(r.ok, false);
  assert.equal(r.code, "PATCH_MUST_BE_PURE_GIT_DIFF");
});
check("even leading whitespace before a patch is refused", () => {
  const r = inspectPatch("\n" + patchFor("allowed.txt", "before", "after"), ["allowed.txt"]);
  assert.equal(r.ok, false);
  assert.equal(r.code, "PATCH_MUST_BE_PURE_GIT_DIFF");
});
check("code-fenced patches are refused", () => {
  const r = inspectPatch("```diff\n" + patchFor("allowed.txt", "before", "after") + "```\n", ["allowed.txt"]);
  assert.equal(r.ok, false);
});
check("ordinary source backticks remain admissible", () => {
  const r = inspectPatch(patchFor("allowed.txt", "before", "const s = `value`;"), ["allowed.txt"]);
  assert.equal(r.ok, true, JSON.stringify(r));
});
check("trailing prose after a diff is refused", () => {
  const r = inspectPatch(patchFor("allowed.txt", "before", "after") + "Here is why this works\n", ["allowed.txt"]);
  assert.equal(r.ok, false);
  assert.equal(r.code, "PATCH_HUNK_LINE_UNSUPPORTED");
});
check("rename shapes are refused", () => {
  const p = [
    "diff --git a/allowed.txt b/other.txt",
    "similarity index 100%",
    "rename from allowed.txt",
    "rename to other.txt",
    "",
  ].join("\n");
  const r = inspectPatch(p, ["allowed.txt", "other.txt"]);
  assert.equal(r.ok, false);
});

console.log("\n=== NPA3: authorized patch checks then applies ===");
check("authorized text patch is checked, applied, scoped, and evidenced", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-apply-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "before\n");
  writeFileSync(path.join(repo, "forbidden.txt"), "untouched\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
  const result = applyNativePatch({
    packet: packet(["allowed.txt"], head),
    patchText: patchFor("allowed.txt", "before", "after"),
    worktree: repo,
    home,
  });

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.status, "APPLIED");
  assert.deepEqual(result.changed_paths, ["allowed.txt"]);
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "after\n");
  assert.equal(readFileSync(path.join(repo, "forbidden.txt"), "utf8"), "untouched\n");

  const events = readFileSync(ledgerPath("native-patch-proof", { home }), "utf8")
    .trim().split("\n").map(JSON.parse);
  assert.deepEqual(events.map((e) => e.event), ["ADMITTED", "APPLIED"]);
  assert.equal(events[0].git_check_invoked, true);
  assert.equal(events[0].git_apply_invoked, false);
  assert.equal(events[1].git_apply_invoked, true);
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n" + passed + " passed · 0 failed");
