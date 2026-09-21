#!/usr/bin/env node
/**
 * JARVIS native OpenCode builder adapter.
 *
 * This is deliberately separate from opencode-provider.mjs, whose V1 law remains
 * read-only. This adapter may act only when the Work Unit already grants
 * repo.write:worktree, and only through local Qwen inside the claimed worktree.
 */
import {
  existsSync, mkdirSync, rmSync, writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { loadWorkUnit, derivePermissionEnvelope } from "./work-unit.mjs";

export const BUILDER_PROVIDER_ID = "qwen-local";
export const BUILDER_DEFAULT_MODEL = "qwen3-coder:30b";
export const BUILDER_MODELS = Object.freeze([
  "qwen3-coder:30b",
  "maia-coder:latest",
]);

const HOME = (env = process.env) => (
  env.AIN_DELEGATION_HOME || path.join(os.homedir(), ".claude", "ain-delegation")
);

function refused(code, detail = null) {
  return Object.freeze({ ok: false, code, detail });
}

function normalizeModel(requested = "") {
  const raw = String(requested || BUILDER_DEFAULT_MODEL).trim();
  return raw.startsWith("ollama/") ? raw.slice("ollama/".length) : raw;
}

function cleanPattern(raw) {
  return String(raw == null ? "" : raw).trim().replaceAll("\\", "/");
}

export function validateBuilderAllowedFiles(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return refused("BUILDER_FILE_SCOPE_REQUIRED");
  }
  const out = [];
  for (const entry of entries) {
    const value = cleanPattern(entry);
    if (!value || /^NO FILES\b/i.test(value)) {
      return refused("BUILDER_FILE_SCOPE_REQUIRED");
    }
    if (
      value.startsWith("/")
      || value.startsWith("~")
      || value.startsWith(":")
      || value.includes("\u0000")
      || value.split("/").includes("..")
      || value === ".git"
      || value.startsWith(".git/")
    ) {
      return refused("UNSAFE_BUILDER_FILE_SCOPE", value);
    }
    if (!out.includes(value)) out.push(value);
  }
  return Object.freeze({ ok: true, allowed_files: Object.freeze(out) });
}

export function resolveOpenCodeBuilder({ workUnit, model } = {}) {
  if (!workUnit) return refused("WORK_UNIT_NOT_FOUND");
  const envelope = derivePermissionEnvelope(workUnit);
  if (envelope.repo_read !== true) return refused("REPO_READ_NOT_AUTHORIZED");
  if (envelope.repo_write_scope !== "worktree") {
    return refused("BUILDER_WRITE_AUTHORITY_REQUIRED");
  }
  if (
    envelope.production_write === true
    || envelope.deploy === true
    || envelope.authority_change === true
  ) {
    return refused("BUILDER_AUTHORITY_TOO_BROAD");
  }

  const files = validateBuilderAllowedFiles(workUnit.allowed_files);
  if (!files.ok) return files;

  const selected = normalizeModel(model);
  if (!BUILDER_MODELS.includes(selected)) return refused("BUILDER_MODEL_NOT_REGISTERED");

  return Object.freeze({
    ok: true,
    provider_id: BUILDER_PROVIDER_ID,
    provider_standing: "local-established-builder",
    model_id: selected,
    model_ref: "ollama/" + selected,
    execution_adapter: "opencode-native-builder",
    agent: "jarvis-builder",
    allowed_files: files.allowed_files,
    external_network: false,
    provider_spend: false,
  });
}

export function resolveWorkUnitBuilder(workUnitId, model, env = process.env) {
  const workUnit = loadWorkUnit(workUnitId);
  return resolveOpenCodeBuilder({ workUnit, model, env });
}

export function builderAgentMarkdown(resolved) {
  if (!resolved || !resolved.ok) throw new Error("BUILDER_RESOLUTION_REQUIRED");
  const editRules = [
    "    \"*\": deny",
    ...resolved.allowed_files.map((entry) => "    " + JSON.stringify(entry) + ": allow"),
  ];

  return [
    "---",
    "description: JARVIS bounded native OpenCode implementation worker",
    "mode: primary",
    "model: " + resolved.model_ref,
    "permission:",
    "  read: allow",
    "  glob: allow",
    "  grep: allow",
    "  list: allow",
    "  lsp: allow",
    "  edit:",
    ...editRules,
    "  bash:",
    "    \"*\": deny",
    "    \"git status*\": allow",
    "    \"git diff*\": allow",
    "  task: deny",
    "  external_directory: deny",
    "  webfetch: deny",
    "  websearch: deny",
    "  skill: deny",
    "  question: deny",
    "  doom_loop: deny",
    "---",
    "",
    "Execute exactly one bounded JARVIS implementation Work Unit.",
    "Edit only the explicitly allowed files. Do not commit.",
    "Do not browse the web, launch subagents, access external directories, or infer new authority.",
    "Use file tools for implementation. Shell is restricted to git status/diff inspection.",
    "If the requested implementation cannot be completed inside the supplied scope,",
    "stop and state the exact blocker.",
    "",
  ].join("\n");
}

function safeId(id) {
  return String(id).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 160);
}

export function runtimeConfigDir(workUnitId, env = process.env) {
  return path.join(HOME(env), "runtime", "opencode-build", safeId(workUnitId));
}

export function prepareWorkUnitBuilder(workUnitId, model, env = process.env) {
  const resolved = resolveWorkUnitBuilder(workUnitId, model, env);
  if (!resolved.ok) return resolved;
  const configDir = runtimeConfigDir(workUnitId, env);
  const agentsDir = path.join(configDir, "agents");
  rmSync(configDir, { recursive: true, force: true });
  mkdirSync(agentsDir, { recursive: true });
  const agentPath = path.join(agentsDir, "jarvis-builder.md");
  writeFileSync(agentPath, builderAgentMarkdown(resolved), { mode: 0o600 });
  return Object.freeze({
    ...resolved,
    config_dir: configDir,
    agent_path: agentPath,
  });
}

export function cleanupWorkUnitBuilder(workUnitId, env = process.env) {
  const dir = runtimeConfigDir(workUnitId, env);
  rmSync(dir, { recursive: true, force: true });
  return { ok: true, removed: !existsSync(dir), config_dir: dir };
}

function globRegex(pattern) {
  let p = cleanPattern(pattern);
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

export function pathAllowed(file, patterns) {
  const normalized = cleanPattern(file);
  return patterns.some((pattern) => globRegex(pattern).test(normalized));
}

function lines(output) {
  return String(output || "").split("\n").map((v) => v.trim()).filter(Boolean);
}

export function changedFilesSince(worktree, baseSha) {
  const tracked = lines(execFileSync(
    "git", ["-C", worktree, "diff", "--name-only", baseSha, "--"],
    { encoding: "utf8" },
  ));
  const untracked = lines(execFileSync(
    "git", ["-C", worktree, "ls-files", "--others", "--exclude-standard"],
    { encoding: "utf8" },
  ));
  return [...new Set([...tracked, ...untracked])].sort();
}

export function verifyWorkUnitBuilderScope(workUnitId, worktree, baseSha, env = process.env) {
  const resolved = resolveWorkUnitBuilder(workUnitId, "", env);
  if (!resolved.ok) return resolved;
  const changed = changedFilesSince(worktree, baseSha);
  const outOfScope = changed.filter((file) => !pathAllowed(file, resolved.allowed_files));
  return Object.freeze({
    ok: outOfScope.length === 0,
    code: outOfScope.length ? "BUILDER_SCOPE_VIOLATION" : "BUILDER_SCOPE_OK",
    changed_files: Object.freeze(changed),
    out_of_scope: Object.freeze(outOfScope),
    allowed_files: resolved.allowed_files,
  });
}

const isMain = process.argv[1] && import.meta.url === "file://" + path.resolve(process.argv[1]);
if (isMain) {
  const [command, workUnitId, a = "", b = ""] = process.argv.slice(2);
  let result;
  if (command === "resolve" && workUnitId) {
    result = resolveWorkUnitBuilder(workUnitId, a);
  } else if (command === "prepare" && workUnitId) {
    result = prepareWorkUnitBuilder(workUnitId, a);
  } else if (command === "cleanup" && workUnitId) {
    result = cleanupWorkUnitBuilder(workUnitId);
  } else if (command === "verify-scope" && workUnitId && a && b) {
    result = verifyWorkUnitBuilderScope(workUnitId, a, b);
  } else {
    process.stderr.write(
      "usage: opencode-builder.mjs {resolve|prepare|cleanup} <work_unit_id> [model]\n"
      + "       opencode-builder.mjs verify-scope <work_unit_id> <worktree> <base_sha>\n",
    );
    process.exit(2);
  }
  if (!result.ok) {
    process.stderr.write(
      "[opencode-builder] REFUSED " + result.code
      + (result.detail ? " " + result.detail : "") + "\n",
    );
    process.stdout.write(JSON.stringify(result) + "\n");
    process.exit(3);
  }
  process.stdout.write(JSON.stringify(result) + "\n");
}
