#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import {
  applyNativeEditScript, applyNativePatch, inspectEditScript, inspectPatch, ledgerPath,
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

const packet = (allowedFiles = ["allowed.txt"]) => ({
  work_unit_id: "native-patch-proof",
  allowed_files: allowedFiles,
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

console.log("\n=== NPA2b: tracked special-file targets are refused ===");
check("tracked symlink mode is refused before git apply", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-mode-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);

  let applyCalls = 0;
  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: patchFor("allowed.txt", "before", "after"),
    worktree: repo,
    home,
    runGit: (_worktree, args) => {
      if (args[0] === "status") return "";
      if (args[0] === "ls-files") return "120000 deadbeef 0\tallowed.txt\n";
      if (args[0] === "apply") applyCalls += 1;
      return "";
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "PATCH_TARGET_MODE_UNSUPPORTED");
  assert.equal(result.detail.path, "allowed.txt");
  assert.equal(result.detail.mode, "120000");
  assert.equal(applyCalls, 0);

  const events = readFileSync(ledgerPath("native-patch-proof", { home }), "utf8")
    .trim().split("\n").map(JSON.parse);
  assert.equal(events.at(-1).code, "PATCH_TARGET_MODE_UNSUPPORTED");
  assert.equal(events.at(-1).git_check_invoked, false);
  assert.equal(events.at(-1).git_apply_invoked, false);
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA2c: diff bookkeeping is normalized without changing model hunks ===");
check("wrong index metadata and stale hunk counts are stripped/recounted", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-recount-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "before\nkeep\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const candidate = [
    "diff --git a/allowed.txt b/allowed.txt",
    "index deadbee..c0ffee0 100755",
    "--- a/allowed.txt",
    "+++ b/allowed.txt",
    "@@ -1,99 +1,99 @@",
    "-before",
    "+after",
    " keep",
    "",
  ].join("\n");

  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: candidate,
    worktree: repo,
    home,
  });

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "after\nkeep\n");
  assert.match(result.normalized_patch_digest, /^sha256:[0-9a-f]{64}$/);
  const events = readFileSync(ledgerPath("native-patch-proof", { home }), "utf8")
    .trim().split("\n").map(JSON.parse);
  assert.equal(events[0].normalization, "strip-index-metadata+git-recount");
  assert.equal(events[1].normalization, "strip-index-metadata+git-recount");
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA2d: structured edits compile to governed patches ===");
check("unauthorized structured edit is refused structurally", () => {
  const text = "EDIT_SCRIPT:" + JSON.stringify({
    edits: [{ path: "forbidden.txt", old: "before", new: "after" }],
  });
  const r = inspectEditScript(text, ["allowed.txt"]);
  assert.equal(r.ok, false);
  assert.equal(r.code, "EDIT_SCRIPT_PATH_NOT_AUTHORIZED");
});

check("ambiguous old text is refused without mutation", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-edit-ambiguous-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "same\nsame\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const editText = "EDIT_SCRIPT:" + JSON.stringify({
    edits: [{ path: "allowed.txt", old: "same", new: "changed" }],
  });
  const result = applyNativeEditScript({ packet: packet(), editText, worktree: repo, home });

  assert.equal(result.ok, false);
  assert.equal(result.code, "EDIT_OLD_TEXT_NOT_UNIQUE");
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "same\nsame\n");
  const events = readFileSync(ledgerPath("native-patch-proof", { home }), "utf8")
    .trim().split("\n").map(JSON.parse);
  assert.deepEqual(events.map((e) => e.event), ["EDIT_REFUSED"]);
  rmSync(tmp, { recursive: true, force: true });
});

check("exact structured edit is compiled, admitted, and applied", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-edit-apply-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "alpha\nbeta\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const editText = "EDIT_SCRIPT:" + JSON.stringify({
    edits: [{ path: "allowed.txt", old: "beta", new: "gamma" }],
  });
  const result = applyNativeEditScript({ packet: packet(), editText, worktree: repo, home });

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.compiled_from, "EDIT_SCRIPT_V1");
  assert.deepEqual(result.changed_paths, ["allowed.txt"]);
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "alpha\ngamma\n");
  assert.match(result.edit_script_digest, /^sha256:[0-9a-f]{64}$/);
  assert.match(result.compiled_patch_digest, /^sha256:[0-9a-f]{64}$/);
  const events = readFileSync(ledgerPath("native-patch-proof", { home }), "utf8")
    .trim().split("\n").map(JSON.parse);
  assert.deepEqual(events.map((e) => e.event), ["EDIT_COMPILED", "ADMITTED", "APPLIED"]);
  rmSync(tmp, { recursive: true, force: true });
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

  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
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
