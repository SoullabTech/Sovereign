#!/usr/bin/env node
/**
 * Compact fallback prompt for JARVIS local-native V1.
 *
 * Used only after the primary Qwen attempt was mechanically refused before
 * mutation. It reuses the same Unit 8/10 bounded evidence and exposes no
 * verifier-only fields. No tools, filesystem, shell, git, or network authority
 * are granted to the fallback model.
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

function list(value, none = "(none)") {
  return Array.isArray(value) && value.length
    ? value.map((item) => "- " + String(item)).join("\n")
    : none;
}

function renderFragments(frags, allowedFiles = []) {
  const targets = new Set((allowedFiles ?? []).map((p) => String(p).replaceAll("\\", "/")));
  return frags.map((f) => {
    const role = targets.has(f.source_file) ? "TARGET" : "PRECEDENT";
    return [
      "SOURCE: " + f.source_file,
      "ROLE: " + role,
      "LINES: " + f.start_line + "-" + f.end_line,
      "<<<" + role + "_BYTES>>>",
      f.content,
      "<<<END_" + role + "_BYTES>>>",
    ].join("\n");
  }).join("\n\n");
}

export function buildNativeFallbackPrompt(packet, repo) {
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
  const overhead = JSON.stringify(worker).length + 5000;
  const b = budget(
    { ...packet, worker_context_limit: nativeContextLimit },
    repo,
    overhead,
  );
  if (!b.within_budget) {
    const error = new Error("CONTEXT_BUDGET_EXCEEDED");
    error.code = "CONTEXT_BUDGET_EXCEEDED";
    error.detail = b;
    throw error;
  }

  const fragments = materializePacket(packet, repo);

  return [
    "You are the TOOLLESS local fallback builder for ONE bounded JARVIS Work Unit.",
    "The primary Qwen attempt was mechanically refused BEFORE repository mutation.",
    "The repository is unchanged. MATERIALIZED TARGET bytes below are the sole current source of truth.",
    "You have no filesystem, shell, git, web, tool-call, commit, or external-network authority.",
    "",
    "OBJECTIVE:",
    String(worker.objective || ""),
    "",
    "ESTABLISHED FACTS:",
    list(worker.established_facts),
    "",
    "ALLOWED FILES:",
    list(worker.allowed_files),
    "",
    "PROHIBITED:",
    list(worker.prohibited_files_actions),
    "",
    "ACCEPTANCE CRITERIA:",
    list(worker.acceptance_criteria),
    "",
    "ESCALATE IF:",
    list(worker.escalation_conditions),
    "",
    "MATERIALIZED CONTEXT:",
    renderFragments(fragments, worker.allowed_files),
    "",
    "OUTPUT CONTRACT — choose exactly one form and output nothing else:",
    "A) PATCH: return a git-style ZERO-CONTEXT unified diff beginning exactly with diff --git.",
    "   No prose, markdown fences, index line, tools, or commands.",
    "   Inside each @@ hunk every content line begins + or -. Do not emit unchanged context lines.",
    "   Multiple hunks are allowed.",
    "   Hunk old-file positions may be absolute file positions OR positions relative to the single TARGET fragment.",
    "   JARVIS will resolve the basis only when exact removed TARGET bytes make the basis unambiguous.",
    "   Every - line must be byte-for-byte TARGET content at the resolved old-file position.",
    "   PRECEDENT may inform + bytes only.",
    "   JARVIS may derive missing ---/+++ headers, recount hunk counts, and recompute new-file offsets.",
    "   JARVIS will never change model-authored + or - content bytes or invent semantic edits.",
    "B) GOVERNANCE GATE: emit one line beginning GOVERNANCE_GATE: followed by one JSON object.",
    "   gate_class must be one of: " + GATE_CLASS_NAMES.join(", ") + ".",
    "   A gate reports missing authority/evidence; it never grants authority.",
  ].join("\n");
}

const argv = process.argv.slice(2);
if (argv[0] === "build") {
  const packetPath = argv[1];
  const repoIdx = argv.indexOf("--repo");
  const repo = repoIdx >= 0 ? argv[repoIdx + 1] : process.cwd();
  if (!packetPath) {
    console.error("usage: jarvis-native-fallback-prompt.mjs build <packet.json> [--repo <dir>]");
    process.exit(4);
  }
  try {
    const packet = JSON.parse(readFileSync(packetPath, "utf8"));
    process.stdout.write(buildNativeFallbackPrompt(packet, path.resolve(repo)));
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
