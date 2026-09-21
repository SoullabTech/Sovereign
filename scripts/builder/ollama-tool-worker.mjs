#!/usr/bin/env node
/**
 * JARVIS local Ollama tool worker.
 *
 * OpenCode is an optional execution surface. This worker is the sovereign local
 * fallback: JARVIS owns the tools and authority checks; the model only requests
 * bounded tool calls through Ollama's local /api/chat endpoint.
 */
import {
  existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadWorkUnit, derivePermissionEnvelope } from "./work-unit.mjs";
import {
  validateBuilderAllowedFiles, pathAllowed,
} from "./opencode-builder.mjs";
import { dispatchDirectTool } from "./jarvis-tool-permissions.mjs";

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const MAX_TURNS = 24;
const MAX_READ_BYTES = 240_000;
const MAX_WRITE_BYTES = 500_000;
const MAX_TOOL_OUTPUT = 80_000;

const MODEL_BY_MODE = Object.freeze({
  build: "qwen3-coder:30b",
  review: "gpt-oss:20b",
});

function fail(code, detail = null) {
  return { ok: false, code, detail };
}

function clamp(value, max = MAX_TOOL_OUTPUT) {
  const s = String(value ?? "");
  return s.length <= max ? s : s.slice(0, max) + "\n...[truncated by JARVIS]";
}

function safeRelative(input) {
  return String(input ?? "").trim().replaceAll("\\", "/");
}

function safePath(root, input, { directory = false } = {}) {
  const rel = safeRelative(input || ".");
  if (!rel || rel.includes("\u0000") || path.isAbsolute(rel)) {
    throw new Error("UNSAFE_PATH");
  }
  const parts = rel.split("/");
  if (parts.includes("..") || parts.includes(".git")) throw new Error("UNSAFE_PATH");
  const full = path.resolve(root, rel);
  const back = path.relative(root, full);
  if (back.startsWith("..") || path.isAbsolute(back)) throw new Error("PATH_ESCAPE");
  if (!directory && full === root) throw new Error("FILE_PATH_REQUIRED");
  return { rel: back || ".", full };
}

function git(root, args) {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
}

function readTool(root, args) {
  const { rel, full } = safePath(root, args.path);
  if (!existsSync(full)) return "NOT_FOUND: " + rel;
  const st = statSync(full);
  if (!st.isFile()) return "NOT_A_FILE: " + rel;
  if (st.size > MAX_READ_BYTES) {
    return "FILE_TOO_LARGE: " + rel + " bytes=" + st.size;
  }
  return clamp(readFileSync(full, "utf8"));
}

function listTool(root, args) {
  const { rel, full } = safePath(root, args.path || ".", { directory: true });
  if (!existsSync(full)) return "NOT_FOUND: " + rel;
  const st = statSync(full);
  if (!st.isDirectory()) return "NOT_A_DIRECTORY: " + rel;
  const entries = readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.name !== ".git")
    .slice(0, 300)
    .map((entry) => (entry.isDirectory() ? entry.name + "/" : entry.name));
  return entries.join("\n") || "(empty directory)";
}

function searchTool(root, args) {
  const needle = String(args.query ?? "").trim();
  if (!needle || needle.length > 500) return "INVALID_QUERY";
  const pathArg = safeRelative(args.path || ".");
  safePath(root, pathArg, { directory: true });
  try {
    const out = git(root, [
      "grep", "-n", "-I", "-F", "-e", needle, "--", pathArg,
    ]);
    return clamp(out);
  } catch (error) {
    const out = String(error?.stdout || "");
    if (!out) return "(no matches)";
    return clamp(out);
  }
}

function diffTool(root, mode) {
  try {
    if (mode === "review") {
      return clamp(git(root, ["diff", "--no-ext-diff", "--unified=60", "HEAD^", "HEAD", "--"]));
    }
    return clamp(git(root, ["diff", "--no-ext-diff", "--unified=60", "--"]));
  } catch (error) {
    return clamp(String(error?.stdout || error?.message || error));
  }
}

function statusTool(root) {
  try {
    return clamp(git(root, ["status", "--short"]));
  } catch (error) {
    return clamp(String(error?.message || error));
  }
}

function writeTool(root, args, allowedFiles) {
  const { rel, full } = safePath(root, args.path);
  if (!pathAllowed(rel, allowedFiles)) return "REFUSED_OUT_OF_SCOPE: " + rel;
  const content = String(args.content ?? "");
  if (Buffer.byteLength(content, "utf8") > MAX_WRITE_BYTES) {
    return "REFUSED_WRITE_TOO_LARGE: " + rel;
  }
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
  return "WROTE: " + rel + " bytes=" + Buffer.byteLength(content, "utf8");
}

function deleteTool(root, args, allowedFiles) {
  const { rel, full } = safePath(root, args.path);
  if (!pathAllowed(rel, allowedFiles)) return "REFUSED_OUT_OF_SCOPE: " + rel;
  if (!existsSync(full)) return "NOT_FOUND: " + rel;
  const st = statSync(full);
  if (!st.isFile()) return "REFUSED_NOT_A_FILE: " + rel;
  rmSync(full);
  return "DELETED: " + rel;
}

function toolsFor(mode) {
  const tools = [
    {
      type: "function",
      function: {
        name: "read_file",
        description: "Read one repository text file. Paths are relative to the governed worktree.",
        parameters: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_dir",
        description: "List one repository directory. Paths are relative to the governed worktree.",
        parameters: {
          type: "object",
          properties: { path: { type: "string" } },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_repo",
        description: "Literal-string search in tracked repository files.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" },
            path: { type: "string" },
          },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "git_diff",
        description: mode === "review"
          ? "Show the exact candidate commit diff (HEAD^..HEAD)."
          : "Show current uncommitted worktree diff.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "git_status",
        description: "Show current short git status.",
        parameters: { type: "object", properties: {} },
      },
    },
  ];

  if (mode === "build") {
    tools.push(
      {
        type: "function",
        function: {
          name: "write_file",
          description: "Replace or create one file. JARVIS enforces the Work Unit write allowlist.",
          parameters: {
            type: "object",
            properties: {
              path: { type: "string" },
              content: { type: "string" },
            },
            required: ["path", "content"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "delete_file",
          description: "Delete one file. JARVIS enforces the Work Unit write allowlist.",
          parameters: {
            type: "object",
            properties: { path: { type: "string" } },
            required: ["path"],
          },
        },
      },
    );
  }
  return tools;
}

function authorityFor(workUnit, mode) {
  const envelope = derivePermissionEnvelope(workUnit);
  if (envelope.repo_read !== true) return fail("REPO_READ_NOT_AUTHORIZED");
  if (envelope.production_write || envelope.deploy || envelope.authority_change) {
    return fail("WORK_UNIT_AUTHORITY_TOO_BROAD");
  }
  if (mode === "build" && envelope.repo_write_scope !== "worktree") {
    return fail("BUILDER_WRITE_AUTHORITY_REQUIRED");
  }
  if (mode === "review" && envelope.repo_write_scope !== "none") {
    return fail("REVIEW_MUST_BE_READ_ONLY");
  }
  const files = mode === "build"
    ? validateBuilderAllowedFiles(workUnit.allowed_files)
    : { ok: true, allowed_files: Object.freeze([]) };
  if (!files.ok) return files;
  return {
    ok: true,
    envelope,
    allowed_files: files.allowed_files,
  };
}

function systemPrompt(workUnit, mode, allowedFiles) {
  const acceptance = (workUnit.acceptance_criteria || []).map((v) => "- " + v).join("\n") || "(none)";
  const stops = (workUnit.escalation_conditions || []).map((v) => "- " + v).join("\n") || "(none)";
  const allowed = allowedFiles.length ? allowedFiles.map((v) => "- " + v).join("\n") : "(read-only)";
  const role = mode === "build"
    ? [
      "You are the local Qwen implementation worker inside one governed JARVIS Work Unit.",
      "Use JARVIS tools to inspect the repository and implement the objective.",
      "You may write ONLY files accepted by the write_file/delete_file tools.",
      "Do not merely describe a patch: use the tools to make the bounded implementation.",
      "Do not commit. JARVIS independently checks scope and tests after you finish.",
    ]
    : [
      "You are the independent local GPT-OSS reviewer for one governed JARVIS Work Unit.",
      "Use JARVIS read/search/diff tools. Do not write files.",
      "Inspect the exact candidate diff and relevant repository evidence.",
      "Identify concrete defects, regressions, scope violations, uncertainty, and falsifiers.",
    ];

  return [
    ...role,
    "",
    "OBJECTIVE:",
    String(workUnit.objective || ""),
    "",
    "WRITE SCOPE:",
    allowed,
    "",
    "ACCEPTANCE CRITERIA:",
    acceptance,
    "",
    "ESCALATION / STOP CONDITIONS:",
    stops,
    "",
    "Model output is evidence, never authority. Do not infer permission beyond the tools JARVIS exposes.",
  ].join("\n");
}

async function ollamaChat(payload, timeoutMs = 120_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error("OLLAMA_HTTP_" + response.status + ": " + await response.text());
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function executeTool(root, mode, call, allowedFiles) {
  const name = String(call?.function?.name || "");
  const args = call?.function?.arguments && typeof call.function.arguments === "object"
    ? call.function.arguments
    : {};

  return dispatchDirectTool({
    mode,
    tool: name,
    args,
    allowedFiles,
    executor: async () => {
      try {
        if (name === "read_file") return readTool(root, args);
        if (name === "list_dir") return listTool(root, args);
        if (name === "search_repo") return searchTool(root, args);
        if (name === "git_diff") return diffTool(root, mode);
        if (name === "git_status") return statusTool(root);
        if (mode === "build" && name === "write_file") return writeTool(root, args, allowedFiles);
        if (mode === "build" && name === "delete_file") return deleteTool(root, args, allowedFiles);
        throw new Error("ADMITTED_TOOL_HAS_NO_EXECUTOR");
      } catch (error) {
        return "TOOL_ERROR " + name + ": " + String(error?.message || error);
      }
    },
  });
}

export async function runLocalWorker({
  workUnitId, worktree, mode = "build", model = "", env = process.env,
} = {}) {
  if (!["build", "review"].includes(mode)) return fail("UNKNOWN_LOCAL_WORKER_MODE");
  const workUnit = loadWorkUnit(workUnitId);
  if (!workUnit) return fail("WORK_UNIT_NOT_FOUND");
  const authority = authorityFor(workUnit, mode);
  if (!authority.ok) return authority;

  const root = path.resolve(String(worktree || ""));
  if (!root || !existsSync(root) || !existsSync(path.join(root, ".git"))) {
    return fail("WORKTREE_NOT_FOUND", root);
  }

  const selected = String(model || MODEL_BY_MODE[mode]);
  if (mode === "build" && selected !== "qwen3-coder:30b") {
    return fail("BUILDER_MODEL_NOT_REGISTERED", selected);
  }
  if (mode === "review" && selected !== "gpt-oss:20b") {
    return fail("REVIEW_MODEL_NOT_REGISTERED", selected);
  }

  const messages = [
    {
      role: "system",
      content: systemPrompt(workUnit, mode, authority.allowed_files),
    },
    {
      role: "user",
      content: mode === "build"
        ? "Execute this Work Unit now. Inspect first, make the smallest correct bounded change, inspect the diff, then report what you changed and any remaining uncertainty."
        : "Review this candidate now. Inspect the candidate diff and relevant files, then return a concise evidence-grounded review.",
    },
  ];
  const tools = toolsFor(mode);
  const transcript = [];
  const toolEvents = [];
  let toolCallCount = 0;

  for (let turn = 0; turn < MAX_TURNS; turn += 1) {
    const response = await ollamaChat({
      model: selected,
      messages,
      tools,
      stream: false,
      options: {
        num_ctx: 32768,
        num_predict: mode === "build" ? 1024 : 2048,
        temperature: 0.1,
      },
    });

    const message = response?.message || {};
    messages.push(message);
    const calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
    transcript.push({
      turn: turn + 1,
      content: String(message.content || ""),
      tool_call_names: calls.map((call) => String(call?.function?.name || "unknown")),
    });
    if (calls.length === 0) {
      return {
        ok: true,
        status: "COMPLETED",
        mode,
        model: selected,
        output: String(message.content || ""),
        turns: turn + 1,
        tool_call_count: toolCallCount,
        tool_events: toolEvents,
        transcript,
      };
    }

    for (const call of calls) {
      toolCallCount += 1;
      if (toolCallCount > 80) return fail("TOOL_CALL_LIMIT_EXCEEDED");
      const dispatched = await executeTool(root, mode, call, authority.allowed_files);
      toolEvents.push(dispatched.receipt);
      messages.push({
        role: "tool",
        tool_name: String(call?.function?.name || "unknown"),
        content: clamp(dispatched.content),
      });
    }
  }

  return fail("TURN_LIMIT_EXCEEDED");
}

const isMain = process.argv[1] && import.meta.url === "file://" + path.resolve(process.argv[1]);
if (isMain) {
  const [command, mode, workUnitId, worktree, model = ""] = process.argv.slice(2);
  if (command !== "run" || !mode || !workUnitId || !worktree) {
    process.stderr.write(
      "usage: ollama-tool-worker.mjs run <build|review> <work_unit_id> <worktree> [model]\n",
    );
    process.exit(2);
  }
  try {
    const result = await runLocalWorker({ workUnitId, worktree, mode, model });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.ok ? 0 : 3);
  } catch (error) {
    process.stderr.write("[ollama-tool-worker] ERROR " + String(error?.stack || error) + "\n");
    process.exit(4);
  }
}
