#!/usr/bin/env node
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync,
  statSync, symlinkSync, writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import {
  applyNativeEdits, parseNativeEditOutput,
} from "../jarvis-native-edit-admission.mjs";

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log("  PASS  " + name);
};
const out = (ops) => "EDIT_JSON: " + JSON.stringify(ops);
const tmp = mkdtempSync(path.join(os.tmpdir(), "native-newfile-proof-"));
const repo = path.join(tmp, "repo");
const home = path.join(tmp, "ain");
mkdirSync(repo);
const git = (args) => execFileSync("git", args, {
  cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
}).trim();
try {
  git(["init", "-q"]);
  git(["config", "user.name", "Proof"]);
  git(["config", "user.email", "proof@local.invalid"]);
  mkdirSync(path.join(repo, "src"));
  writeFileSync(path.join(repo, "src", "a.txt"), "alpha\n");
  writeFileSync(path.join(repo, "src", "b.txt"), "beta\n");
  writeFileSync(path.join(repo, ".gitignore"), "ignored/\n");
  symlinkSync(tmp, path.join(repo, "link"));
  symlinkSync("/definitely/not/a/real/jarvis-target", path.join(repo, "dangling"));
  git(["add", "."]);
  git(["commit", "-qm", "base"]);
  const sha = git(["rev-parse", "HEAD"]);

  const packet = {
    work_unit_id: "native-newfile-proof",
    canonical_sha: sha,
    allowed_files: ["src/a.txt", "src/b.txt", "src/new.txt", "ignored/new.txt", "link/new.txt", "dangling/new.txt"],
    authorized_acts: ["repo.read", "repo.write:worktree", "tests.run"],
    not_authorized_acts: [
      "production.read", "production.write", "deploy", "authority.change",
      "network.external", "provider.spend", "repo.disclose:external-readonly",
    ],
    integration_actor: "jarvis",
  };
  const reset = () => {
    git(["reset", "--hard", sha]);
    git(["clean", "-fd"]);
  };
  console.log("\n=== NMF1: closed mixed-operation grammar ===");
  check("replacement and creation shapes coexist in one array", () => {
    const r = parseNativeEditOutput(out([
      { path: "src/a.txt", old_text: "alpha", new_text: "ALPHA" },
      { path: "src/new.txt", create: true, content: "hello\n" },
    ]), packet.allowed_files);
    if (!r.ok || r.edits[0].kind !== "replace" || r.edits[1].kind !== "create") throw new Error(JSON.stringify(r));
  });
  check("unauthorized creation path is refused structurally", () => {
    const r = parseNativeEditOutput(out([{ path: "src/nope.txt", create: true, content: "x\n" }]), packet.allowed_files);
    if (r.code !== "EDIT_PATH_NOT_AUTHORIZED") throw new Error(JSON.stringify(r));
  });
  check("empty creation content is refused", () => {
    const r = parseNativeEditOutput(out([{ path: "src/new.txt", create: true, content: "" }]), packet.allowed_files);
    if (r.code !== "CREATE_TEXT_INVALID") throw new Error(JSON.stringify(r));
  });

  console.log("\n=== NMF2: multi-file existing edits are already canonical ===");
  check("two authorized tracked files change in one structured candidate", () => {
    reset();
    const r = applyNativeEdits({ packet, worktree: repo, home, outputText: out([
      { path: "src/a.txt", old_text: "alpha", new_text: "ALPHA" },
      { path: "src/b.txt", old_text: "beta", new_text: "BETA" },
    ]) });
    if (!r.ok || r.changed_paths.join(",") !== "src/a.txt,src/b.txt") throw new Error(JSON.stringify(r));
    if (readFileSync(path.join(repo, "src/a.txt"), "utf8") !== "ALPHA\n") throw new Error("a mismatch");
    if (readFileSync(path.join(repo, "src/b.txt"), "utf8") !== "BETA\n") throw new Error("b mismatch");
  });
  console.log("\n=== NMF3: authorized new-file creation ===");
  check("new text file is deterministically rendered then admitted by NPA1", () => {
    reset();
    const r = applyNativeEdits({ packet, worktree: repo, home, outputText: out([
      { path: "src/new.txt", create: true, content: "hello\nworld\n" },
    ]) });
    if (!r.ok || r.changed_paths.join(",") !== "src/new.txt") throw new Error(JSON.stringify(r));
    if (readFileSync(path.join(repo, "src/new.txt"), "utf8") !== "hello\nworld\n") throw new Error("content mismatch");
    if ((statSync(path.join(repo, "src/new.txt")).mode & 0o777) !== 0o644) throw new Error("mode mismatch");
  });
  check("existing edit and new-file creation compose atomically", () => {
    reset();
    const r = applyNativeEdits({ packet, worktree: repo, home, outputText: out([
      { path: "src/a.txt", old_text: "alpha", new_text: "ALPHA" },
      { path: "src/new.txt", create: true, content: "created\n" },
    ]) });
    if (!r.ok || r.changed_paths.join(",") !== "src/a.txt,src/new.txt") throw new Error(JSON.stringify(r));
  });

  console.log("\n=== NMF4: creation fails closed ===");
  check("create cannot overwrite a tracked file", () => {
    reset();
    const r = applyNativeEdits({ packet, worktree: repo, home, outputText: out([
      { path: "src/a.txt", create: true, content: "overwrite\n" },
    ]) });
    if (r.code !== "CREATE_TARGET_ALREADY_TRACKED") throw new Error(JSON.stringify(r));
  });
  check("create cannot overwrite an ignored file already present on disk", () => {
    reset();
    mkdirSync(path.join(repo, "ignored"), { recursive: true });
    writeFileSync(path.join(repo, "ignored/new.txt"), "ambient\n");
    const r = applyNativeEdits({ packet, worktree: repo, home, outputText: out([
      { path: "ignored/new.txt", create: true, content: "replace\n" },
    ]) });
    if (r.code !== "CREATE_TARGET_EXISTS") throw new Error(JSON.stringify(r));
    rmSync(path.join(repo, "ignored"), { recursive: true, force: true });
  });
  check("create cannot traverse a tracked symlink parent", () => {
    reset();
    const r = applyNativeEdits({ packet, worktree: repo, home, outputText: out([
      { path: "link/new.txt", create: true, content: "escape\n" },
    ]) });
    if (r.code !== "CREATE_PARENT_SYMLINK_UNSUPPORTED") throw new Error(JSON.stringify(r));
    if (existsSync(path.join(tmp, "new.txt"))) throw new Error("escaped worktree");
  });
  check("create also refuses a dangling symlink parent", () => {
    reset();
    const r = applyNativeEdits({ packet, worktree: repo, home, outputText: out([
      { path: "dangling/new.txt", create: true, content: "escape\n" },
    ]) });
    if (r.code !== "CREATE_PARENT_SYMLINK_UNSUPPORTED") throw new Error(JSON.stringify(r));
  });

  console.log("\n" + passed + " passed · 0 failed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
