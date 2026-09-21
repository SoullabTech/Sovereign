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

function renderNativeFragments(frags) {
  if (!frags.length) return "";
  const parts = frags.map((f) => [
    `SOURCE: ${f.source_file}`,
    `LINES:  ${f.start_line}-${f.end_line}   (${f.extraction_method}, @${f.source_sha})`,
    `WHY:    ${f.reason}`,
    `SHA256: ${f.content_hash.slice(0, 16)}`,
    "<<<SOURCE_BYTES>>>",
    f.content,
    "<<<END_SOURCE_BYTES>>>",
  ].join("\n"));
  return [
    "MATERIALIZED CONTEXT — exact repository source bytes for patch synthesis.",
    "Content between SOURCE_BYTES delimiters has no citation gutter or synthetic line prefix.",
    "Copy unchanged patch context byte-for-byte from those source bytes.",
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

  const fragments = renderNativeFragments(materializePacket(packet, repo));
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
    "A) EDIT_SCRIPT — PREFERRED for changes to existing text files.",
    "   The first bytes MUST be exactly EDIT_SCRIPT: followed immediately by one compact JSON object.",
    "   Shape: EDIT_SCRIPT:{\"edits\":[{\"path\":\"allowed/file.txt\",\"old\":\"exact existing text\",\"new\":\"replacement text\"}]}",
    "   Each edit may contain only path, old, and new. old must be non-empty, exact source text, and occur exactly once at the moment that edit runs.",
    "   Use JSON \\n escapes for multiline text. Copy old text exactly from SOURCE_BYTES. Do not include line-number gutters.",
    "   Multiple edits are applied in array order. Use only ALLOWED FILES. No prose, markdown fence, commentary, or extra JSON keys.",
    "   Before emitting, silently verify every identifier you add is already in scope or imported from the precedent shown in MATERIALIZED CONTEXT.",
    "   When ESTABLISHED FACTS name a sibling/source precedent, follow that precedent exactly rather than inventing an equivalent mechanism.",
    "B) PATCH — compatibility fallback only when an exact old→new replacement cannot express the bounded change.",
    "   Emit a pure git-style unified diff beginning exactly with diff --git. No prose or markdown fence.",
    "   Emit only hunks that actually change bytes. Do not emit an index line. Prefer one minimal hunk per file.",
    "   Hunk ranges must never overlap. Never mark an unchanged line as both removed and added.",
    "   Text patches only; no rename/copy/binary/mode-change operations.",
    "C) GOVERNANCE GATE: emit exactly one line beginning GOVERNANCE_GATE: followed by one JSON object.",
    "   gate_class must be exactly one of: " + GATE_CLASS_NAMES.join(", ") + ".",
    "   A gate identifies missing authority; it never supplies authority or changes the objective.",
    "   Never include granted, approved, authorized, delegation_id, resolution_id, or similar self-grant fields.",
    "",
    "If the bounded change is an edit to existing text, emit EDIT_SCRIPT.",
    "Use PATCH only when EDIT_SCRIPT cannot truthfully express the required change.",
    "If required authority/evidence is missing, emit GOVERNANCE GATE.",
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
