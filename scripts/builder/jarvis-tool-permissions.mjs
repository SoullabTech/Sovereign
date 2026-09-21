#!/usr/bin/env node
/**
 * JARVIS direct-model tool permission law.
 *
 * This module ports the old OpenCode-enforced permission membrane into JARVIS
 * itself so direct Ollama tool calls cannot acquire authority by adjacency.
 *
 * Source precedent:
 *   .opencode/agents/jarvis-readonly.md
 *   .opencode/agents/jarvis-local.md
 *
 * The direct lane is intentionally no broader than those envelopes. Where the
 * legacy local agent used OpenCode's interactive "ask" semantics for generic
 * shell, the unattended direct lane fails closed instead. Narrow dedicated
 * JARVIS tools are used for approved read/write acts.
 */
import { createHash } from "node:crypto";

export const TOOL_DECISION = Object.freeze({
  ALLOW: "ALLOW",
  REFUSE: "REFUSE",
});

export const POLICY_SOURCE = Object.freeze({
  readonly: ".opencode/agents/jarvis-readonly.md",
  build: ".opencode/agents/jarvis-local.md",
});

const READ_TOOLS = Object.freeze(new Set([
  "read_file",
  "list_dir",
  "search_repo",
  "git_diff",
  "git_status",
]));

const BUILD_WRITE_TOOLS = Object.freeze(new Set([
  "write_file",
  "delete_file",
]));

// These names are intentionally recognized so a hallucinated/adversarial request
// receives a named refusal instead of falling through as an unknown capability.
const EXPLICITLY_FORBIDDEN = Object.freeze(new Set([
  "edit",
  "bash",
  "webfetch",
  "websearch",
  "task",
  "external_directory",
  "skill",
  "question",
  "doom_loop",
]));

function digestArgs(args) {
  const body = JSON.stringify(args && typeof args === "object" ? args : {});
  return "sha256:" + createHash("sha256").update(body).digest("hex");
}

function cleanPath(value) {
  return String(value ?? "").trim().replaceAll("\\", "/");
}

function unsafePath(value) {
  const p = cleanPath(value);
  return (
    !p
    || p.startsWith("/")
    || p.startsWith("~")
    || p.includes("\u0000")
    || p.split("/").includes("..")
    || p === ".git"
    || p.startsWith(".git/")
  );
}

function globRegex(pattern) {
  let p = cleanPath(pattern);
  if (p.endsWith("/")) p += "**";
  let out = "^";
  const special = "\\^$.*+?()[]{}|";
  for (let i = 0; i < p.length; i += 1) {
    const ch = p[i];
    if (ch === "*") {
      if (p[i + 1] === "*") {
        i += 1;
        if (p[i + 1] === "/") {
          i += 1;
          out += "(?:.*/)?";
        } else {
          out += ".*";
        }
      } else {
        out += "[^/]*";
      }
    } else if (ch === "?") {
      out += "[^/]";
    } else if (special.includes(ch)) {
      out += "\\" + ch;
    } else {
      out += ch;
    }
  }
  return new RegExp(out + "$");
}

export function pathAllowed(file, patterns = []) {
  const normalized = cleanPath(file);
  return Array.isArray(patterns)
    && patterns.some((pattern) => globRegex(pattern).test(normalized));
}

function refusal(mode, tool, args, reason, source = POLICY_SOURCE[mode] ?? "jarvis") {
  return Object.freeze({
    decision: TOOL_DECISION.REFUSE,
    mode,
    tool,
    reason,
    executed: false,
    policy_source: source,
    args_digest: digestArgs(args),
  });
}

function allow(mode, tool, args, source = POLICY_SOURCE[mode] ?? "jarvis") {
  return Object.freeze({
    decision: TOOL_DECISION.ALLOW,
    mode,
    tool,
    reason: null,
    executed: false,
    policy_source: source,
    args_digest: digestArgs(args),
  });
}

/**
 * Pure tool decision. It performs no filesystem, shell, network, or provider act.
 */
export function decideDirectTool({
  mode,
  tool,
  args = {},
  allowedFiles = [],
} = {}) {
  const m = String(mode || "");
  const name = String(tool || "");

  if (m !== "build" && m !== "review") {
    return refusal(m || "unknown", name, args, "UNKNOWN_DIRECT_TOOL_MODE", "jarvis");
  }

  if (EXPLICITLY_FORBIDDEN.has(name)) {
    const reason = name === "bash"
      ? "GENERIC_SHELL_NOT_EXPOSED"
      : "DENIED_BY_LEGACY_PERMISSION_PORT";
    return refusal(m, name, args, reason);
  }

  if (READ_TOOLS.has(name)) return allow(m, name, args);

  if (BUILD_WRITE_TOOLS.has(name)) {
    if (m !== "build") {
      return refusal(m, name, args, "READ_ONLY_LANE");
    }
    const target = cleanPath(args?.path);
    if (unsafePath(target)) {
      return refusal(m, name, args, "UNSAFE_WRITE_PATH");
    }
    if (!pathAllowed(target, allowedFiles)) {
      return refusal(m, name, args, "WRITE_OUTSIDE_WORK_UNIT_SCOPE");
    }
    return allow(m, name, args);
  }

  return refusal(m, name, args, "TOOL_NOT_IN_DIRECT_SURFACE", "jarvis");
}

/**
 * Execute only after pure admission. Refusals never invoke the supplied executor.
 * The returned receipt is durable-safe: it contains no raw argument values.
 */
export async function dispatchDirectTool({
  mode,
  tool,
  args = {},
  allowedFiles = [],
  executor,
} = {}) {
  const decision = decideDirectTool({ mode, tool, args, allowedFiles });
  if (decision.decision !== TOOL_DECISION.ALLOW) {
    return Object.freeze({
      ok: false,
      content: "REFUSED: " + decision.reason,
      receipt: decision,
    });
  }

  if (typeof executor !== "function") {
    const blocked = refusal(mode, tool, args, "EXECUTOR_UNAVAILABLE", "jarvis");
    return Object.freeze({
      ok: false,
      content: "REFUSED: " + blocked.reason,
      receipt: blocked,
    });
  }

  const content = await executor();
  return Object.freeze({
    ok: true,
    content: String(content ?? ""),
    receipt: Object.freeze({
      ...decision,
      executed: true,
    }),
  });
}

export function isForbiddenToolName(name) {
  return EXPLICITLY_FORBIDDEN.has(String(name || ""));
}
