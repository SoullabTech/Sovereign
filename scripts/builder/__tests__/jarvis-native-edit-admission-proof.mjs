#!/usr/bin/env node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { applyNativeEdits, parseNativeEditOutput } from "../jarvis-native-edit-admission.mjs";

let passed = 0, failed = 0;
const must = (cond, name) => { if (cond) { passed += 1; console.log(`  PASS  ${name}`); } else { failed += 1; console.log(`  FAIL  ${name}`); } };
const tmp = mkdtempSync(path.join(os.tmpdir(), "native-edit-proof-"));
try {
  const wt = path.join(tmp, "repo"); mkdirSync(wt);
  execFileSync("git", ["init", "-q"], { cwd: wt });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: wt });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: wt });
  mkdirSync(path.join(wt, "src"));
  writeFileSync(path.join(wt, "src", "a.txt"), "alpha\nbeta\nalpha\n");
  execFileSync("git", ["add", "."], { cwd: wt });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: wt });
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: wt, encoding: "utf8" }).trim();
  process.env.AIN_DELEGATION_HOME = path.join(tmp, "home");
  const packet = {
    work_unit_id: "native-edit-proof", title: "proof", objective: "change beta to gamma",
    governing_authority: "proof", execution_lane: "local-native", task_class: "CODE_GROUNDED",
    canonical_sha: sha, branch: "proof", established_facts: [], allowed_files: ["src/a.txt"],
    prohibited_files_actions: [], acceptance_criteria: [], escalation_conditions: [], expected_output: "x",
    context_selectors: ["src/a.txt"], verification_commands: [],
  };
  const out = (edits) => "EDIT_JSON: " + JSON.stringify({ edits });

  console.log("\n=== NEA1 closed serialization ===");
  must(parseNativeEditOutput("prose\n" + out([]), packet.allowed_files).code === "EDIT_JSON_REQUIRED", "prose prefix is refused");
  must(parseNativeEditOutput(out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma", extra:true }]), packet.allowed_files).code === "EDIT_OBJECT_CLOSED", "unknown edit keys are refused");

  console.log("\n=== NEA2 authorization and ambiguity ===");
  let r = applyNativeEdits({ packet, worktree: wt, outputText: out([{ path:"src/b.txt", old_text:"x", new_text:"y" }]) });
  must(!r.ok && r.code === "EDIT_PATH_NOT_AUTHORIZED", "unauthorized path is refused before mutation");
  r = applyNativeEdits({ packet, worktree: wt, outputText: out([{ path:"src/a.txt", old_text:"alpha", new_text:"omega" }]) });
  must(!r.ok && r.code === "OLD_TEXT_NOT_UNIQUE", "ambiguous old_text is refused");
  must(readFileSync(path.join(wt,"src/a.txt"),"utf8") === "alpha\nbeta\nalpha\n", "refusals leave worktree bytes untouched");

  console.log("\n=== NEA3 deterministic conversion delegates to NPA1 ===");
  r = applyNativeEdits({ packet, worktree: wt, outputText: out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma" }]) });
  must(r.ok && r.input_kind === "EDIT_JSON" && r.code === "PATCH_APPLIED", "exact edit is converted then admitted by hardened patch membrane");
  must(r.changed_paths?.length === 1 && r.changed_paths[0] === "src/a.txt", "changed path remains exactly packet-authorized path");
  must(readFileSync(path.join(wt,"src/a.txt"),"utf8") === "alpha\ngamma\nalpha\n", "only exact replacement bytes are applied");
  must(typeof r.generated_patch_digest === "string" && typeof r.structured_output_digest === "string", "structured output and generated patch have separate custody digests");

  console.log("\n=== NEA4 CLI composition does not trigger imported NPA CLI ===");
  execFileSync("git", ["reset", "--hard", sha], { cwd: wt, stdio:"ignore" });
  const packetFile = path.join(tmp, "packet.json");
  const outputFile = path.join(tmp, "output.txt");
  writeFileSync(packetFile, JSON.stringify(packet));
  writeFileSync(outputFile, out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma" }]));
  const editCli = fileURLToPath(new URL("../jarvis-native-edit-admission.mjs", import.meta.url));
  const cliResult = JSON.parse(execFileSync("node", [editCli, "apply", packetFile, wt, outputFile], { encoding:"utf8" }));
  must(cliResult.ok && cliResult.input_kind === "EDIT_JSON", "edit CLI reaches adapter instead of imported patch CLI");

  console.log("\n=== NEA5 stale SHA remains fail-closed through adapter ===");
  execFileSync("git", ["reset", "--hard", "HEAD"], { cwd: wt, stdio:"ignore" });
  writeFileSync(path.join(wt,"marker.txt"),"advance\n"); execFileSync("git",["add","marker.txt"],{cwd:wt}); execFileSync("git",["commit","-qm","advance"],{cwd:wt});
  r = applyNativeEdits({ packet, worktree: wt, outputText: out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma" }]) });
  must(!r.ok && r.code === "WORKTREE_CANONICAL_SHA_MISMATCH", "stale packet cannot be converted against advanced worktree");

  console.log(`\n${passed} passed · ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
} finally { rmSync(tmp, { recursive:true, force:true }); }
