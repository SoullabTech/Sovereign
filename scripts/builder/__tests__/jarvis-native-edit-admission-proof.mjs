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
  writeFileSync(path.join(wt, "src", "b.txt"), "red\ngreen\nred\n");
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
  const packetMulti = {
    ...packet,
    work_unit_id: "native-edit-multifile-proof",
    objective: "change two tracked files atomically",
    allowed_files: ["src/a.txt", "src/b.txt"],
    context_selectors: ["src/a.txt", "src/b.txt"],
  };
  const out = (edits) => "EDIT_JSON: " + JSON.stringify(edits);
  const reset = () => execFileSync("git", ["reset", "--hard", sha], { cwd: wt, stdio:"ignore" });
  const bytes = () => ({
    a: readFileSync(path.join(wt, "src", "a.txt"), "utf8"),
    b: readFileSync(path.join(wt, "src", "b.txt"), "utf8"),
  });

  console.log("\n=== NEA1 closed serialization ===");
  must(parseNativeEditOutput("prose\n" + out([]), packet.allowed_files).code === "EDIT_JSON_REQUIRED", "prose prefix is refused");
  must(parseNativeEditOutput(out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma", extra:true }]), packet.allowed_files).code === "EDIT_OBJECT_CLOSED", "unknown edit keys are refused");
  must(parseNativeEditOutput('EDIT_JSON: {"edits":[]}', packet.allowed_files).code === "EDIT_JSON_ARRAY_REQUIRED", "object wrapper is refused; top level must be the edit array itself");
  must(parseNativeEditOutput('EDIT_JSON: {"edits":[{"path":"src/a.txt","path":"src/b.txt","old_text":"beta","new_text":"gamma"}]}', packet.allowed_files).code === "EDIT_JSON_DUPLICATE_KEY", "duplicate nested edit keys are refused");

  console.log("\n=== NEA2 authorization and ambiguity ===");
  let r = applyNativeEdits({ packet, worktree: wt, outputText: out([{ path:"src/b.txt", old_text:"x", new_text:"y" }]) });
  must(!r.ok && r.code === "EDIT_PATH_NOT_AUTHORIZED", "unauthorized path is refused before mutation");
  r = applyNativeEdits({ packet, worktree: wt, outputText: out([{ path:"src/a.txt", old_text:"alpha", new_text:"omega" }]) });
  must(!r.ok && r.code === "OLD_TEXT_NOT_UNIQUE", "ambiguous old_text is refused");
  must(readFileSync(path.join(wt,"src/a.txt"),"utf8") === "alpha\nbeta\nalpha\n", "refusals leave authorized file bytes untouched");
  must(readFileSync(path.join(wt,"src/b.txt"),"utf8") === "red\ngreen\nred\n", "refusals leave sibling file bytes untouched");

  console.log("\n=== M1 multi-file existing-text falsifiers ===");
  reset();
  r = applyNativeEdits({
    packet: packetMulti,
    worktree: wt,
    outputText: out([
      { path:"src/a.txt", old_text:"beta", new_text:"gamma" },
      { path:"src/b.txt", old_text:"green", new_text:"teal" },
    ]),
  });
  must(r.ok && r.code === "PATCH_APPLIED", "two authorized existing files are admitted as one candidate");
  must(JSON.stringify(r.changed_paths) === JSON.stringify(["src/a.txt","src/b.txt"]), "multi-file changed-path evidence is exact and sorted");
  must(bytes().a === "alpha\ngamma\nalpha\n" && bytes().b === "red\nteal\nred\n", "both existing files receive only their exact replacements");

  reset();
  r = applyNativeEdits({
    packet: packetMulti,
    worktree: wt,
    outputText: out([
      { path:"src/a.txt", old_text:"beta", new_text:"gamma" },
      { path:"src/a.txt", old_text:"alpha\ngamma", new_text:"omega\ngamma" },
      { path:"src/b.txt", old_text:"green", new_text:"teal" },
    ]),
  });
  must(r.ok, "multiple sequential edits in one file compose with an edit in a second file");
  must(bytes().a === "omega\ngamma\nalpha\n" && bytes().b === "red\nteal\nred\n", "multi-edit/multi-file composition follows declared array order");

  reset();
  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([
      { path:"src/a.txt", old_text:"beta", new_text:"gamma" },
      { path:"src/b.txt", old_text:"green", new_text:"teal" },
    ]),
  });
  must(!r.ok && r.code === "EDIT_PATH_NOT_AUTHORIZED", "an unauthorized second file refuses the whole structured candidate");
  must(bytes().a === "alpha\nbeta\nalpha\n" && bytes().b === "red\ngreen\nred\n", "unauthorized-second-file refusal is atomic with zero candidate mutation");

  reset();
  r = applyNativeEdits({
    packet: packetMulti,
    worktree: wt,
    outputText: out([
      { path:"src/a.txt", old_text:"beta", new_text:"gamma" },
      { path:"src/b.txt", old_text:"red", new_text:"blue" },
    ]),
  });
  must(!r.ok && r.code === "OLD_TEXT_NOT_UNIQUE", "ambiguity in the second file refuses the whole multi-file candidate");
  must(bytes().a === "alpha\nbeta\nalpha\n" && bytes().b === "red\ngreen\nred\n", "second-file ambiguity is atomic with zero candidate mutation");

  reset();
  const repairScopeCandidate = out([
    { path:"src/a.txt", old_text:"beta", new_text:"gamma" },
    { path:"src/c.txt", old_text:"missing", new_text:"forbidden" },
  ]);
  r = applyNativeEdits({ packet: packetMulti, worktree: wt, outputText: repairScopeCandidate });
  must(!r.ok && r.code === "EDIT_PATH_NOT_AUTHORIZED", "same packet scope refuses a repair-shaped candidate that adds a third path");
  must(bytes().a === "alpha\nbeta\nalpha\n" && bytes().b === "red\ngreen\nred\n", "repair-scope widening attempt leaves the whole candidate untouched");

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
