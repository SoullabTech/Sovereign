#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  mkdtempSync, mkdirSync, writeFileSync, rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { buildNativePrompt } from "../jarvis-native-prompt.mjs";

const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-prompt-"));
try {
  const repo = path.join(tmp, "repo");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "target.txt"), "alpha\nbeta\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const packet = {
    work_unit_id: "native-prompt-proof",
    objective: "Change beta to gamma.",
    governing_authority: "proof",
    established_facts: ["target.txt is the target"],
    allowed_files: ["target.txt"],
    prohibited_files_actions: ["no other files"],
    acceptance_criteria: ["target contains gamma"],
    escalation_conditions: ["missing evidence"],
    expected_output: "irrelevant legacy output text",
    context_selectors: ["target.txt"],
    verification_commands: ["SECRET_VERIFIER_EXPECTATION"],
    verifier_notes: "SECRET_VERIFIER_NOTE",
  };

  const prompt = buildNativePrompt(packet, repo);
  assert.match(prompt, /MATERIALIZED CONTEXT/);
  assert.match(prompt, /alpha/);
  assert.match(prompt, /<<<SOURCE_BYTES>>>\nalpha\nbeta\n\n<<<END_SOURCE_BYTES>>>/);
  assert.doesNotMatch(prompt, /^\\s*1\\| alpha$/m);
  assert.match(prompt, /diff --git/);
  assert.match(prompt, /first bytes MUST be exactly EDIT_SCRIPT:/);
  assert.match(prompt, /old must be non-empty/);
  assert.match(prompt, /Copy old text exactly from SOURCE_BYTES/);
  assert.match(prompt, /precedent file does NOT put it in scope/);
  assert.match(prompt, /follow that precedent exactly/);
  assert.match(prompt, /Do not emit an index line/);
  assert.match(prompt, /Hunk ranges must never overlap/);
  assert.match(prompt, /Use PATCH only when EDIT_SCRIPT cannot truthfully express/);
  assert.match(prompt, /GOVERNANCE_GATE:/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_EXPECTATION/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_NOTE/);
  assert.doesNotMatch(prompt, /irrelevant legacy output text/);
  console.log("17 passed · 0 failed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
