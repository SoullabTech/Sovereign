#!/usr/bin/env node
/**
 * Native prompt builder for the toolless local coding lane.
 *
 * Reuses canonical Unit 8/10/19 mechanisms instead of duplicating them:
 * - packet answer-leakage lint + worker/verifier partition
 * - SHA-bound selector binding
 * - precision context materialization + budget
 * - governance-gate class taxonomy
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  bindSelector, headOf, lintLeakage, partitionPacket,
} from "./jarvis-packet-guard.mjs";
import {
  budget, materializePacket,
} from "./jarvis-context.mjs";
import { GATE_CLASS_NAMES } from "./jarvis-governance-gate.mjs";

function renderNativeFragments(frags, allowedFiles = []) {
  if (!frags.length) return "";
  const targetPaths = new Set((allowedFiles ?? []).map((p) => String(p).replaceAll("\\", "/")));
  const parts = frags.map((f) => {
    const role = targetPaths.has(f.source_file) ? "TARGET" : "PRECEDENT";
    return [
      `SOURCE: ${f.source_file}`,
      `ROLE:   ${role}`,
      `LINES:  ${f.start_line}-${f.end_line}   (${f.extraction_method}, @${f.source_sha})`,
      `WHY:    ${f.reason}`,
      `SHA256: ${f.content_hash.slice(0, 16)}`,
      "<<<SOURCE_BYTES>>>",
      f.content,
      "<<<END_SOURCE_BYTES>>>",
    ].join("\n");
  });
  return [
    "MATERIALIZED CONTEXT — exact repository source bytes.",
    "TARGET fragments are current bytes of files the patch may modify.",
    "PRECEDENT fragments are read-only examples and are NOT current TARGET bytes.",
    "The LINES range gives absolute old-file line numbers for the TARGET fragment.",
    "",
    parts.join("\n\n"),
  ].join("\n");
}

export function buildNativePrompt(packet, repo) {
  const lint = lintLeakage(packet);
  if (!lint.ok) {
    const error = new Error("PACKET_ANSWER_LEAKAGE");
    error.code = "PACKET_ANSWER_LEAKAGE";
    error.detail = lint;
    throw error;
  }

  const selectors = packet.context_selectors ?? [];
  if (!Array.isArray(selectors) || selectors.length === 0) {
    const error = new Error("LOCAL_NATIVE_CONTEXT_REQUIRED");
    error.code = "LOCAL_NATIVE_CONTEXT_REQUIRED";
    throw error;
  }

  const execHead = headOf(repo);
  if (!execHead) {
    const error = new Error("EXECUTION_HEAD_UNAVAILABLE");
    error.code = "EXECUTION_HEAD_UNAVAILABLE";
    throw error;
  }
  const bindings = selectors.map((selector) => bindSelector(selector, repo, execHead));
  const bad = bindings.filter((binding) => binding.error);
  if (bad.length) {
    const error = new Error(bad[0].error);
    error.code = bad[0].error;
    error.detail = bad;
    throw error;
  }

  const { worker } = partitionPacket(packet);
  const nativeContextLimit = Number(process.env.JARVIS_NUM_CTX || 32768);
  // Budget the materialized evidence against the context the native transport
  // will actually serve, not Unit 8's historical 65K Claude-wrapper setting.
  // Include conservative headroom for the non-fragment prompt wrapper too.
  const promptOverheadChars = JSON.stringify(worker).length + 8000;
  const b = budget(
    { ...packet, worker_context_limit: nativeContextLimit },
    repo,
    promptOverheadChars,
  );
  if (!b.within_budget) {
    const error = new Error("CONTEXT_BUDGET_EXCEEDED");
    error.code = "CONTEXT_BUDGET_EXCEEDED";
    error.detail = b;
    throw error;
  }

  const fragments = renderNativeFragments(materializePacket(packet, repo), worker.allowed_files);
  const list = (value, none = "(none)") => (
    Array.isArray(value) && value.length
      ? value.map((item) => "- " + String(item)).join("\n")
      : none
  );

  return [
    "You are executing ONE bounded JARVIS coding Work Unit using a TOOLLESS local model transport.",
    "You have no filesystem, shell, git, web, or tool-call access.",
    "JARVIS has materialized the only repository evidence you may use.",
    "",
    "OBJECTIVE:",
    String(worker.objective || ""),
    "",
    "GOVERNING AUTHORITY:",
    String(worker.governing_authority || ""),
    "",
    "ESTABLISHED FACTS:",
    list(worker.established_facts),
    "",
    "ALLOWED FILES — a patch may name ONLY these paths:",
    list(worker.allowed_files),
    "",
    "PROHIBITED FILES/ACTIONS:",
    list(worker.prohibited_files_actions),
    "",
    "ACCEPTANCE CRITERIA:",
    list(worker.acceptance_criteria),
    "",
    "ESCALATION CONDITIONS:",
    list(worker.escalation_conditions),
    "",
    fragments,
    "",
    "OUTPUT CONTRACT — choose EXACTLY ONE form and output nothing else:",
    "A) PATCH: emit a git-style ZERO-CONTEXT unified diff beginning exactly with diff --git.",
    "   BYTE-LEVEL RULE: the first bytes MUST be exactly diff --git ; no prose or markdown fences.",
    "   ZERO-CONTEXT V1: inside every @@ hunk, every content line MUST begin with + or -. Never emit unchanged single-space context lines.",
    "   Multiple zero-context hunks in one authorized file are allowed for separate edits.",
    "   Use exact absolute OLD-file positions from the TARGET fragment LINES range.",
    "   For an insertion after old line N, use old start N with old count 0.",
    "   For a replacement/deletion beginning on old line N, use old start N and the exact number of removed lines.",
    "   Every removed (-) line must be copied byte-for-byte from TARGET source bytes at that old-file position.",
    "   PRECEDENT may inform new (+) bytes only. Never use PRECEDENT-only bytes as removed bytes.",
    "   JARVIS may derive missing ---/+++ file headers, recount hunk lengths, and recompute NEW-file offsets from prior hunk deltas.",
    "   JARVIS will NOT alter model-authored + or - content bytes and will NOT repair wrong old-file positions.",
    "   Do not emit an index line; JARVIS derives blob identity and tracked mode independently.",
    "   Minimal valid shape example — copy only the grammar, not these names/text:",
    "diff --git a/example.txt b/example.txt",
    "--- a/example.txt",
    "+++ b/example.txt",
    "@@ -4,0 +5,1 @@",
    "+new inserted line",
    "@@ -9,1 +10,1 @@",
    "-old line",
    "+replacement line",
    "   End immediately after the final +/- patch line.",
    "   Text patches only; no rename/copy/binary/mode-change operations.",
    "B) GOVERNANCE GATE: emit exactly one line beginning GOVERNANCE_GATE: followed by one JSON object.",
    "   gate_class must be exactly one of: " + GATE_CLASS_NAMES.join(", ") + ".",
    "   A gate identifies missing authority; it never supplies authority or changes the objective.",
    "   Never include granted, approved, authorized, delegation_id, resolution_id, or similar self-grant fields.",
    "",    "If the bounded change can be produced from the materialized evidence, emit PATCH.",
    "If it cannot be truthfully produced because required authority/evidence is missing, emit GOVERNANCE GATE.",
  ].join("\n");
}

const argv = process.argv.slice(2);
if (argv[0] === "build") {
  const packetPath = argv[1];
  const repoIdx = argv.indexOf("--repo");
  const repo = repoIdx >= 0 ? argv[repoIdx + 1] : process.cwd();
  if (!packetPath) {
    console.error("usage: jarvis-native-prompt.mjs build <packet.json> [--repo <dir>]");
    process.exit(4);
  }
  try {
    const packet = JSON.parse(readFileSync(packetPath, "utf8"));
    process.stdout.write(buildNativePrompt(packet, path.resolve(repo)));
  } catch (error) {
    console.error("🛑 " + String(error?.code || error?.message || error));
    if (error?.detail) console.error(JSON.stringify(error.detail));
    process.exit(
      error?.code === "PACKET_ANSWER_LEAKAGE" ? 7
        : error?.code?.startsWith("SELECTOR_") ? 8
          : 5
    );
  }
}
