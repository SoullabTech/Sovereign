#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  mkdtempSync, mkdirSync, writeFileSync, rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { buildNativeFallbackPrompt } from "../jarvis-native-fallback-prompt.mjs";

const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-fallback-prompt-"));
try {
  const repo = path.join(tmp, "repo");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "Proof"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "proof@local.invalid"], { cwd: repo });
  writeFileSync(path.join(repo, "target.txt"), "alpha\nbeta\n");
  writeFileSync(path.join(repo, "precedent.txt"), "precedent-only\n");
  execFileSync("git", ["add", "."], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "base"], { cwd: repo });

  const packet = {
    work_unit_id: "fallback-prompt-proof",
    objective: "Change beta to gamma.",
    governing_authority: "proof",
    established_facts: ["target.txt is the target"],
    allowed_files: ["target.txt"],
    prohibited_files_actions: ["no other files"],
    acceptance_criteria: ["target contains gamma"],
    escalation_conditions: ["missing evidence"],
    expected_output: "MUST_NOT_LEAK_EXPECTED_OUTPUT",
    context_selectors: ["target.txt", "precedent.txt"],
    verification_commands: ["SECRET_VERIFIER_COMMAND"],
    verifier_notes: "SECRET_VERIFIER_NOTE",
  };

  const prompt = buildNativeFallbackPrompt(packet, repo);
  assert.match(prompt, /primary Qwen attempt was mechanically refused/i);
  assert.match(prompt, /repository is unchanged/i);
  assert.match(prompt, /SOURCE: target\.txt\nROLE: TARGET/);
  assert.match(prompt, /SOURCE: precedent\.txt\nROLE: PRECEDENT/);
  assert.match(prompt, /ZERO-CONTEXT unified diff/);
  assert.match(prompt, /absolute file positions OR positions relative/);
  assert.match(prompt, /Every - line must be byte-for-byte TARGET/);
  assert.match(prompt, /PRECEDENT may inform \+ bytes only/);
  assert.match(prompt, /derive missing ---\/\+\+\+ headers/);
  assert.match(prompt, /never change model-authored \+ or - content bytes/i);
  assert.match(prompt, /GOVERNANCE_GATE:/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_COMMAND/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_NOTE/);
  assert.doesNotMatch(prompt, /MUST_NOT_LEAK_EXPECTED_OUTPUT/);
  console.log("14 passed · 0 failed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
