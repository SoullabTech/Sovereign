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

const packet = (allowedFiles = ["allowed.txt"]) => ({
  work_unit_id: "native-patch-proof",
  allowed_files: allowedFiles,
  authorized_acts: ["repo.read", "repo.write:worktree", "tests.run"],
  not_authorized_acts: [
    "production.read", "production.write", "deploy", "authority.change",
    "network.external", "provider.spend", "repo.disclose:external-readonly",
  ],
  integration_actor: "jarvis",
  context_selectors: allowedFiles,
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
  assert.match(events[0].normalization, /^strip-index\+derive-file-headers\+recount/);
  assert.match(events[1].normalization, /^strip-index\+derive-file-headers\+recount/);
  rmSync(tmp, { recursive: true, force: true });
});

console.log("\n=== NPA2d: zero-context bookkeeping normalization ===");
check("headerless multi-hunk zero-context patch normalizes and applies without changing semantic bytes", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-zero-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), [
    "one",
    "two",
    "three",
    "four",
    "five",
    "",
  ].join("\n"));
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const candidate = [
    "diff --git a/allowed.txt b/allowed.txt",
    "@@ -2,0 +3,1 @@",
    "+inserted",
    "@@ -4,1 +4,1 @@",
    "-four",
    "+FOUR",
    "",
  ].join("\n");

  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: candidate,
    worktree: repo,
    home,
  });

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.event.zero_context, true);
  assert.match(result.event.normalization, /zero-context-offsets/);
  assert.equal(
    readFileSync(path.join(repo, "allowed.txt"), "utf8"),
    "one\ntwo\ninserted\nthree\nFOUR\nfive\n",
  );
  rmSync(tmp, { recursive: true, force: true });
});

check("fragment-relative zero-context positions are translated only after exact target validation", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-fragrel-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "one\ntwo\nthree\nfour\nfive\nsix\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const candidate = [
    "diff --git a/allowed.txt b/allowed.txt",
    "@@ -2,0 +3,1 @@",
    "+inserted",
    "@@ -3,1 +3,1 @@",
    "-five",
    "+FIVE",
  ].join("\n"); // deliberately no final newline

  const p = packet(["allowed.txt"]);
  p.context_selectors = [{
    ref: "allowed.txt",
    selector: { type: "anchor", find: "three", mode: "lines", after: 3 },
  }];

  const result = applyNativePatch({
    packet: p,
    patchText: candidate,
    worktree: repo,
    home,
  });

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.event.position_basis, "fragment-relative");
  assert.match(result.event.normalization, /fragment-relative-old-lines/);
  assert.equal(
    readFileSync(path.join(repo, "allowed.txt"), "utf8"),
    "one\ntwo\nthree\nfour\ninserted\nFIVE\nsix\n",
  );
  rmSync(tmp, { recursive: true, force: true });
});

check("bare @@ hunks anchor uniquely from removed TARGET bytes and discard non-semantic context", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-bare-live-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), [
    "import one from 'one';",
    "import path from 'node:path';",
    "import two from 'two';",
    "",
    "const REPO = '/Users/example/project';",
    "const NEXT = true;",
    "",
  ].join("\n"));
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const candidate = [
    "diff --git a/allowed.txt b/allowed.txt",
    "--- a/allowed.txt",
    "+++ b/allowed.txt",
    "@@",
    "-import path from 'node:path';",
    "+import path from 'node:path';",
    "+import { fileURLToPath } from 'node:url';",
    "@@",
    "-const REPO = '/Users/example/project';",
    "+const REPO = fileURLToPath(import.meta.url);",
    " ",
    "*** End of File ***",
  ].join("\n");

  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: candidate,
    worktree: repo,
    home,
  });

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.event.position_basis, "unique-removed-bytes");
  assert.match(result.event.normalization, /bare-hunk-anchor/);
  assert.equal(
    readFileSync(path.join(repo, "allowed.txt"), "utf8"),
    [
      "import one from 'one';",
      "import path from 'node:path';",
      "import { fileURLToPath } from 'node:url';",
      "import two from 'two';",
      "",
      "const REPO = fileURLToPath(import.meta.url);",
      "const NEXT = true;",
      "",
    ].join("\n"),
  );
  rmSync(tmp, { recursive: true, force: true });
});

check("bare @@ hunk refuses ambiguous removed bytes before git apply", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-bare-ambiguous-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "same\nx\nsame\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const candidate = [
    "diff --git a/allowed.txt b/allowed.txt",
    "@@",
    "-same",
    "+SAME",
  ].join("\n");

  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: candidate,
    worktree: repo,
    home,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "PATCH_BARE_HUNK_ANCHOR_AMBIGUOUS");
  assert.equal(result.event.git_check_invoked, false);
  assert.equal(result.event.git_apply_invoked, false);
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "same\nx\nsame\n");
  rmSync(tmp, { recursive: true, force: true });
});

check("bare insertion-only hunk refuses without a removed-byte anchor", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-bare-insert-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "one\ntwo\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const candidate = [
    "diff --git a/allowed.txt b/allowed.txt",
    "@@",
    "+inserted",
  ].join("\n");

  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: candidate,
    worktree: repo,
    home,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "PATCH_BARE_HUNK_REQUIRES_REMOVED_BYTES");
  assert.equal(result.event.git_check_invoked, false);
  assert.equal(result.event.git_apply_invoked, false);
  rmSync(tmp, { recursive: true, force: true });
});

check("zero-context removed bytes must match exact target bytes before git apply", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "npa-zero-mismatch-"));
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "ain");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "allowed.txt"), "one\ntwo\nthree\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const candidate = [
    "diff --git a/allowed.txt b/allowed.txt",
    "@@ -2,1 +2,1 @@",
    "-NOT_TWO",
    "+TWO",
    "",
  ].join("\n");

  const result = applyNativePatch({
    packet: packet(["allowed.txt"]),
    patchText: candidate,
    worktree: repo,
    home,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "PATCH_OLD_BYTES_MISMATCH");
  assert.equal(readFileSync(path.join(repo, "allowed.txt"), "utf8"), "one\ntwo\nthree\n");
  assert.equal(result.event.git_check_invoked, false);
  assert.equal(result.event.git_apply_invoked, false);
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
