#!/usr/bin/env node
// R3-LIVE-WITNESS: existing edit admission path
import {
  existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync,
  symlinkSync, writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { applyNativeEdits, parseNativeEditOutput } from "../jarvis-native-edit-admission.mjs";

let passed = 0, failed = 0;
const must = (cond, name) => {
  if (cond) { passed += 1; console.log(`  PASS  ${name}`); }
  else { failed += 1; console.log(`  FAIL  ${name}`); }
};

const tmp = mkdtempSync(path.join(os.tmpdir(), "native-edit-proof-"));
try {
  const wt = path.join(tmp, "repo");
  mkdirSync(wt);
  execFileSync("git", ["init", "-q"], { cwd: wt });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: wt });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: wt });

  mkdirSync(path.join(wt, "src"));
  writeFileSync(path.join(wt, "src", "a.txt"), "alpha\nbeta\nalpha\n");
  writeFileSync(path.join(wt, "src", "b.txt"), "one\ntwo\n");
  symlinkSync(path.join(tmp, "outside"), path.join(wt, "src", "link"));

  execFileSync("git", ["add", "."], { cwd: wt });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: wt });
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: wt, encoding: "utf8" }).trim();

  process.env.AIN_DELEGATION_HOME = path.join(tmp, "home");
  const allowedFiles = [
    "src/a.txt",
    "src/b.txt",
    "src/new.txt",
    "src/link/new.txt",
    "src/missing/new.txt",
  ];
  const packet = {
    work_unit_id: "native-edit-proof",
    title: "proof",
    objective: "prove replacement and creation admission",
    governing_authority: "proof",
    execution_lane: "local-native",
    task_class: "CODE_GROUNDED",
    canonical_sha: sha,
    branch: "proof",
    established_facts: [],
    allowed_files: allowedFiles,
    prohibited_files_actions: [],
    acceptance_criteria: [],
    escalation_conditions: [],
    expected_output: "x",
    context_selectors: ["src/a.txt", "src/b.txt"],
    verification_commands: [],
  };
  const out = (edits) => "EDIT_JSON: " + JSON.stringify(edits);
  const reset = () => {
    execFileSync("git", ["reset", "--hard", sha], { cwd: wt, stdio: "ignore" });
    execFileSync("git", ["clean", "-fd"], { cwd: wt, stdio: "ignore" });
  };

  console.log("\n=== NEA1 closed serialization + creation grammar ===");
  must(
    parseNativeEditOutput("prose\n" + out([]), packet.allowed_files).code === "EDIT_JSON_REQUIRED",
    "prose prefix is refused",
  );
  must(
    parseNativeEditOutput(out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma", extra:true }]), packet.allowed_files).code === "EDIT_OBJECT_CLOSED",
    "unknown replacement keys are refused",
  );
  must(
    parseNativeEditOutput(out([{ path:"src/new.txt", new_text:"created\n", extra:true }]), packet.allowed_files).code === "EDIT_OBJECT_CLOSED",
    "unknown creation keys are refused",
  );
  must(
    parseNativeEditOutput('EDIT_JSON: {"edits":[]}', packet.allowed_files).code === "EDIT_JSON_ARRAY_REQUIRED",
    "object wrapper is refused; top level must be the array itself",
  );
  must(
    parseNativeEditOutput('EDIT_JSON: [{"path":"src/a.txt","path":"src/b.txt","old_text":"beta","new_text":"gamma"}]', packet.allowed_files).code === "EDIT_JSON_DUPLICATE_KEY",
    "duplicate nested keys are refused",
  );
  const createParsed = parseNativeEditOutput(
    out([{ path:"src/new.txt", new_text:"created\n" }]),
    packet.allowed_files,
  );
  must(
    createParsed.ok && createParsed.edits[0]?.kind === "create",
    "closed two-key object is recognized as create",
  );
  must(
    parseNativeEditOutput(
      out([{ path:"src/wild.txt", new_text:"created\n" }]),
      ["src/*.txt"],
    ).code === "CREATE_PATH_EXPLICIT_AUTHORIZATION_REQUIRED",
    "wildcard-only authorization cannot mint a new path",
  );
  must(
    parseNativeEditOutput(
      out([{ path:"src/new.txt", new_text:"" }]),
      packet.allowed_files,
    ).code === "CREATE_TEXT_EMPTY",
    "empty-file creation is outside V1",
  );

  console.log("\n=== NEA2 authorization, ambiguity, and creation refusals ===");
  let r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/nope.txt", old_text:"x", new_text:"y" }]),
  });
  must(!r.ok && r.code === "EDIT_PATH_NOT_AUTHORIZED", "unauthorized replacement path is refused");

  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/a.txt", old_text:"alpha", new_text:"omega" }]),
  });
  must(!r.ok && r.code === "OLD_TEXT_NOT_UNIQUE", "ambiguous old_text is refused");

  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/a.txt", new_text:"replacement contents\n" }]),
  });
  must(!r.ok && r.code === "CREATE_TARGET_ALREADY_TRACKED", "create cannot overwrite a tracked path");

  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/missing/new.txt", new_text:"created\n" }]),
  });
  must(!r.ok && r.code === "CREATE_PARENT_NOT_FOUND", "create requires an existing parent directory");

  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/link/new.txt", new_text:"created\n" }]),
  });
  must(!r.ok && r.code === "CREATE_PARENT_SYMLINK", "create refuses a symlink parent");

  must(
    readFileSync(path.join(wt, "src", "a.txt"), "utf8") === "alpha\nbeta\nalpha\n"
      && readFileSync(path.join(wt, "src", "b.txt"), "utf8") === "one\ntwo\n"
      && !existsSync(path.join(wt, "src", "new.txt")),
    "refusals leave tracked and new-file bytes untouched",
  );

  console.log("\n=== NEA3 single existing-file conversion still composes with NPA1 ===");
  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma" }]),
  });
  must(
    r.ok && r.input_kind === "EDIT_JSON" && r.code === "PATCH_APPLIED",
    "exact replacement is converted then admitted by hardened patch membrane",
  );
  must(
    r.changed_paths?.length === 1 && r.changed_paths[0] === "src/a.txt",
    "single replacement changed path remains exact",
  );
  must(
    readFileSync(path.join(wt, "src", "a.txt"), "utf8") === "alpha\ngamma\nalpha\n",
    "only exact replacement bytes are applied",
  );
  must(
    r.create_count === 0 && r.replace_count === 1,
    "single replacement records operation counts",
  );
  reset();

  console.log("\n=== NEA4 CLI composition does not trigger imported NPA CLI ===");
  const packetFile = path.join(tmp, "packet.json");
  const outputFile = path.join(tmp, "output.txt");
  writeFileSync(packetFile, JSON.stringify(packet));
  writeFileSync(outputFile, out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma" }]));
  const editCli = fileURLToPath(new URL("../jarvis-native-edit-admission.mjs", import.meta.url));
  const cliResult = JSON.parse(execFileSync(
    "node", [editCli, "apply", packetFile, wt, outputFile], { encoding:"utf8" },
  ));
  must(
    cliResult.ok && cliResult.input_kind === "EDIT_JSON",
    "edit CLI reaches adapter instead of imported patch CLI",
  );
  reset();

  console.log("\n=== NEA5 stale SHA remains fail-closed through adapter ===");
  writeFileSync(path.join(wt, "marker.txt"), "advance\n");
  execFileSync("git", ["add", "marker.txt"], { cwd: wt });
  execFileSync("git", ["commit", "-qm", "advance"], { cwd: wt });
  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/a.txt", old_text:"beta", new_text:"gamma" }]),
  });
  must(
    !r.ok && r.code === "WORKTREE_CANONICAL_SHA_MISMATCH",
    "stale packet cannot be converted against advanced worktree",
  );
  reset();

  console.log("\n=== NEA6 multi-file existing edits ===");
  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([
      { path:"src/a.txt", old_text:"beta", new_text:"gamma" },
      { path:"src/b.txt", old_text:"two", new_text:"three" },
    ]),
  });
  must(r.ok && r.code === "PATCH_APPLIED", "two-file replacement candidate is admitted");
  must(
    JSON.stringify(r.changed_paths) === JSON.stringify(["src/a.txt", "src/b.txt"]),
    "two-file candidate changes exactly both authorized paths",
  );
  must(
    readFileSync(path.join(wt, "src", "a.txt"), "utf8") === "alpha\ngamma\nalpha\n"
      && readFileSync(path.join(wt, "src", "b.txt"), "utf8") === "one\nthree\n",
    "both existing-file replacements apply exactly",
  );
  must(
    r.create_count === 0 && r.replace_count === 2,
    "multi-file replacement records two replacement operations",
  );
  reset();

  console.log("\n=== NEA7 explicitly-authorized new text file ===");
  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([{ path:"src/new.txt", new_text:"created by JARVIS\n" }]),
  });
  must(r.ok && r.code === "PATCH_APPLIED", "new text file is deterministically patched through NPA1");
  must(
    JSON.stringify(r.changed_paths) === JSON.stringify(["src/new.txt"]),
    "new-file candidate changes exactly the explicitly-authorized path",
  );
  must(
    readFileSync(path.join(wt, "src", "new.txt"), "utf8") === "created by JARVIS\n",
    "new file contains exactly proposed text",
  );
  must(
    r.create_count === 1 && r.replace_count === 0,
    "new-file candidate records one create operation",
  );
  must(
    r.edit_event?.paths?.[0] === "src/new.txt"
      && typeof r.generated_patch_digest === "string"
      && typeof r.structured_output_digest === "string",
    "new-file structured output and generated patch have separate custody evidence",
  );
  reset();

  console.log("\n=== NEA8 mixed replace + create in one candidate ===");
  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([
      { path:"src/a.txt", old_text:"beta", new_text:"gamma" },
      { path:"src/new.txt", new_text:"mixed candidate\n" },
    ]),
  });
  must(r.ok && r.code === "PATCH_APPLIED", "mixed replace+create candidate is admitted");
  must(
    JSON.stringify(r.changed_paths) === JSON.stringify(["src/a.txt", "src/new.txt"]),
    "mixed candidate changes exactly its two authorized paths",
  );
  must(
    readFileSync(path.join(wt, "src", "a.txt"), "utf8") === "alpha\ngamma\nalpha\n"
      && readFileSync(path.join(wt, "src", "new.txt"), "utf8") === "mixed candidate\n",
    "mixed candidate applies both existing and new-file bytes exactly",
  );
  must(
    r.create_count === 1 && r.replace_count === 1,
    "mixed candidate records one create and one replacement",
  );
  reset();

  console.log("\n=== NEA9 one creation object owns the final new-file bytes ===");
  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([
      { path:"src/new.txt", new_text:"first\n" },
      { path:"src/new.txt", new_text:"second\n" },
    ]),
  });
  must(
    !r.ok && r.code === "CREATE_PATH_DUPLICATED_OR_MIXED",
    "duplicate creation of one path is refused",
  );

  r = applyNativeEdits({
    packet,
    worktree: wt,
    outputText: out([
      { path:"src/new.txt", new_text:"first\n" },
      { path:"src/new.txt", old_text:"first", new_text:"second" },
    ]),
  });
  must(
    !r.ok && r.code === "EDIT_KIND_CONFLICT",
    "creation cannot be followed by replacement in the same candidate",
  );

  console.log(`\n${passed} passed · ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
} finally {
  rmSync(tmp, { recursive:true, force:true });
}
