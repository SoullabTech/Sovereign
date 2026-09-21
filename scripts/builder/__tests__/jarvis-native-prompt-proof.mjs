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
  writeFileSync(path.join(repo, "precedent.txt"), "precedent-only\n");
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
    context_selectors: ["target.txt", "precedent.txt"],
    verification_commands: ["SECRET_VERIFIER_EXPECTATION"],
    verifier_notes: "SECRET_VERIFIER_NOTE",
  };

  const prompt = buildNativePrompt(packet, repo);
  assert.match(prompt, /MATERIALIZED CONTEXT/);
  assert.match(prompt, /SOURCE: target\.txt\nROLE:\s+TARGET/);
  assert.match(prompt, /SOURCE: precedent\.txt\nROLE:\s+PRECEDENT/);
  assert.match(prompt, /<<<SOURCE_BYTES>>>\nalpha\nbeta\n\n<<<END_SOURCE_BYTES>>>/);
  assert.match(prompt, /ZERO-CONTEXT unified diff/);
  assert.match(prompt, /every content line MUST begin with \+ or -/);
  assert.match(prompt, /Multiple zero-context hunks/);
  assert.match(prompt, /absolute OLD-file positions/);
  assert.match(prompt, /Every removed \(-\) line must be copied byte-for-byte from TARGET/);
  assert.match(prompt, /PRECEDENT may inform new \(\+\) bytes only/);
  assert.match(prompt, /derive missing ---\/\+\+\+ file headers/);
  assert.match(prompt, /will NOT alter model-authored \+ or - content bytes/);
  assert.match(prompt, /Do not emit an index line/);
  assert.match(prompt, /@@ -4,0 \+5,1 @@/);
  assert.match(prompt, /GOVERNANCE_GATE:/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_EXPECTATION/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_NOTE/);
  assert.doesNotMatch(prompt, /irrelevant legacy output text/);
  console.log("18 passed · 0 failed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
