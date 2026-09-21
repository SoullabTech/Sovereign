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
import { readFileSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  bindSelector, headOf, lintLeakage, partitionPacket,
} from "./jarvis-packet-guard.mjs";
import {
  budget, materializePacket, renderFragments,
} from "./jarvis-context.mjs";
import { GATE_CLASS_NAMES } from "./jarvis-governance-gate.mjs";

const COMMIT_SHA = /^[0-9a-f]{7,40}$/i;

function selectorRef(selector) {
  return typeof selector === "string" ? selector : selector?.ref;
}

function assertSelectorContained(selector, repo) {
  const ref = String(selectorRef(selector) || "");
  const slash = ref.replaceAll("\\", "/");
  if (
    !ref
    || ref !== slash
    || path.isAbsolute(ref)
    || slash === ".git"
    || slash.startsWith(".git/")
    || slash.split("/").some((segment) => segment === "..")
  ) {
    const error = new Error("SELECTOR_PATH_UNSAFE");
    error.code = "SELECTOR_PATH_UNSAFE";
    error.detail = { ref };
    throw error;
  }

  let repoReal;
  let targetReal;
  try {
    repoReal = realpathSync(repo);
    targetReal = realpathSync(path.join(repo, ref));
  } catch {
    return; // bindSelector emits the canonical FILE_NOT_FOUND refusal.
  }
  const relative = path.relative(repoReal, targetReal);
  if (relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) {
    const error = new Error("SELECTOR_PATH_ESCAPE");
    error.code = "SELECTOR_PATH_ESCAPE";
    error.detail = { ref };
    throw error;
  }
}

export function validateNativeExecutionBoundary(packet, repo) {
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
  selectors.forEach((selector) => assertSelectorContained(selector, repo));

  const execHead = headOf(repo);
  if (!execHead) {
    const error = new Error("EXECUTION_HEAD_UNAVAILABLE");
    error.code = "EXECUTION_HEAD_UNAVAILABLE";
    throw error;
  }

  const packetCanonical = String(packet.canonical_sha || "").trim();
  if (!packetCanonical) {
    const error = new Error("PACKET_CANONICAL_SHA_REQUIRED");
    error.code = "PACKET_CANONICAL_SHA_REQUIRED";
    throw error;
  }
  if (!COMMIT_SHA.test(packetCanonical)) {
    const error = new Error("PACKET_CANONICAL_SHA_INVALID");
    error.code = "PACKET_CANONICAL_SHA_INVALID";
    throw error;
  }
  let authorizedHead;
  try {
    authorizedHead = execFileSync(
      "git", ["-C", repo, "rev-parse", packetCanonical + "^{commit}"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    const error = new Error("PACKET_CANONICAL_SHA_UNRESOLVED");
    error.code = "PACKET_CANONICAL_SHA_UNRESOLVED";
    throw error;
  }
  if (authorizedHead !== execHead) {
    const error = new Error("EXECUTION_HEAD_MISMATCH");
    error.code = "EXECUTION_HEAD_MISMATCH";
    error.detail = { packet_canonical_sha: authorizedHead, execution_head: execHead };
    throw error;
  }

  const worktreeStatus = execFileSync(
    "git", ["-C", repo, "status", "--porcelain", "--untracked-files=all"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();
  if (worktreeStatus) {
    const error = new Error("EXECUTION_WORKTREE_NOT_CLEAN");
    error.code = "EXECUTION_WORKTREE_NOT_CLEAN";
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

  return { execHead, authorizedHead, bindings };
}
export function buildNativePrompt(packet, repo) {
  validateNativeExecutionBoundary(packet, repo);
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

  const fragments = renderFragments(materializePacket(packet, repo));
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
    "A) EDIT_JSON: emit exactly one physical line beginning `EDIT_JSON: ` followed by one JSON object.",
    "   Closed shape: {\"edits\":[{\"path\":\"<allowed path>\",\"old_text\":\"<exact existing text>\",\"new_text\":\"<replacement text>\"}]}",
    "   old_text must be copied EXACTLY from MATERIALIZED CONTEXT and must identify exactly one occurrence.",
    "   Use the smallest exact replacement that completes the objective; never include a no-op edit.",
    "   JSON string escapes such as \\n are allowed; the worker response itself remains one physical line.",
    "   JARVIS, not you, renders the git patch, applies it, verifies it, and commits it.",
    "   Before emitting, silently verify every identifier you add is already in scope or is imported from the precedent shown in MATERIALIZED CONTEXT.",
    "   When ESTABLISHED FACTS name a sibling/source precedent, follow that precedent exactly rather than inventing an equivalent mechanism.",
    "   No prose. No markdown fence. No commit command. No path outside ALLOWED FILES.",
    "B) GOVERNANCE GATE: emit exactly one line beginning GOVERNANCE_GATE: followed by one JSON object.",
    "   gate_class must be exactly one of: " + GATE_CLASS_NAMES.join(", ") + ".",
    "   A gate identifies missing authority; it never supplies authority or changes the objective.",
    "   Never include granted, approved, authorized, delegation_id, resolution_id, or similar self-grant fields.",
    "",
    "If the bounded change can be produced from the materialized evidence, emit EDIT_JSON.",
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
