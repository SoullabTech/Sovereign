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
  const baseSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
  writeFileSync(path.join(repo, "marker.txt"), "second commit\n");
  execFileSync("git", ["add", "marker.txt"], { cwd: repo });
  execFileSync("git", ["commit", "-qm", "advance"], { cwd: repo });
  const currentSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();

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
    canonical_sha: currentSha,
  };

  assert.throws(
    () => buildNativePrompt({ ...packet, canonical_sha: baseSha }, repo),
    (error) => error?.code === "EXECUTION_HEAD_MISMATCH",
  );

  const prompt = buildNativePrompt(packet, repo);
  assert.match(prompt, /MATERIALIZED CONTEXT/);
  assert.match(prompt, /alpha/);
  assert.match(prompt, /diff --git/);
  assert.match(prompt, /first bytes of the response MUST be exactly `diff --git `/);
  assert.match(prompt, /never delete and re-add unchanged lines/);
  assert.match(prompt, /Do not wrap the diff in a Markdown code fence/);
  assert.match(prompt, /single backticks, are allowed when they belong to the file/);
  assert.match(prompt, /no commentary or summary may follow it/);
  assert.match(prompt, /every identifier you add is already in scope or is imported/);
  assert.match(prompt, /follow that precedent exactly/);
  assert.match(prompt, /GOVERNANCE_GATE:/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_EXPECTATION/);
  assert.doesNotMatch(prompt, /SECRET_VERIFIER_NOTE/);
  assert.doesNotMatch(prompt, /irrelevant legacy output text/);
  console.log("15 passed · 0 failed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
