#!/usr/bin/env node
/**
 * JARVIS-NATIVE-EDIT-ADMISSION-01
 *
 * Serialization adapter for the toolless local coding lane.
 * The worker emits exact old_text -> new_text edits or explicitly-authorized
 * new text-file creations, never filesystem actions.
 * This module validates the closed edit grammar against the SHA-bound source,
 * deterministically renders a git patch, and delegates ALL mutation authority to
 * JARVIS-NATIVE-PATCH-ADMISSION-01.
 */
import {
  appendFileSync, chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync,
  readFileSync, rmSync, writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import os from "node:os";
import { applyNativePatch, pathAllowed } from "./jarvis-native-patch-admission.mjs";

const MAX_OUTPUT_BYTES = 256 * 1024;
const MAX_EDITS = 16;
const COMMIT_SHA = /^[0-9a-f]{7,40}$/i;
const TEXT_FILE_MODES = new Set(["100644", "100755"]);
const HOME = (env = process.env) => env.AIN_DELEGATION_HOME || path.join(os.homedir(), ".claude", "ain-delegation");
const digest = (text) => "sha256:" + createHash("sha256").update(String(text), "utf8").digest("hex");
const now = () => new Date().toISOString();
const safeId = (value) => String(value || "unknown").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
const refusal = (code, detail = null) => ({ ok: false, status: "REFUSED", code, detail });

function appendEvent(workUnitId, event, { home } = {}) {
  const file = path.join(home || HOME(), "native-edit-admission", safeId(workUnitId) + ".jsonl");
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(event) + "\n", "utf8");
  return file;
}
function normalizePath(value) { return String(value ?? "").trim().replaceAll("\\", "/"); }
function unsafePath(value) {
  const p = normalizePath(value);
  return !p || p.startsWith("/") || p.startsWith("~") || p.includes("\u0000")
    || p.split("/").includes("..") || p === ".git" || p.startsWith(".git/");
}
function realGit(worktree, args) {
  return execFileSync("git", ["-C", worktree, ...args], {
    encoding: "utf8", maxBuffer: 4 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"],
  });
}
function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let offset = 0;
  while ((offset = haystack.indexOf(needle, offset)) !== -1) {
    count += 1;
    offset += needle.length;
  }
  return count;
}
function exactKeys(value, allowed) {
  const keys = Object.keys(value || {}).sort();
  return keys.length === allowed.length && keys.every((key, i) => key === [...allowed].sort()[i]);
}
function explicitlyAllowedPath(file, allowedFiles = []) {
  const target = normalizePath(file);
  return Array.isArray(allowedFiles)
    && allowedFiles.some((entry) => normalizePath(entry) === target);
}
function createParentRefusal(worktree, file) {
  const parentRel = path.dirname(file);
  const segments = parentRel === "." ? [] : parentRel.split("/").filter(Boolean);
  let cursor = worktree;
  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    let stat;
    try { stat = lstatSync(cursor); }
    catch (error) {
      if (error?.code === "ENOENT") {
        return refusal("CREATE_PARENT_NOT_FOUND", { path: file, parent: parentRel });
      }
      return refusal("CREATE_PARENT_UNREADABLE", {
        path: file, parent: parentRel, error: String(error?.message || error),
      });
    }
    if (stat.isSymbolicLink()) {
      return refusal("CREATE_PARENT_SYMLINK", { path: file, parent: path.relative(worktree, cursor) });
    }
    if (!stat.isDirectory()) {
      return refusal("CREATE_PARENT_NOT_DIRECTORY", { path: file, parent: path.relative(worktree, cursor) });
    }
  }
  return null;
}

/**
 * JSON.parse() silently keeps only the last occurrence of a duplicate object key.
 * For a mutation contract that is unsafe: two `edits` arrays can collapse into one
 * and erase part of the worker's proposed change before admission sees it. Scan the
 * JSON grammar first and fail closed on duplicate keys at ANY object depth.
 * Malformed JSON is left to JSON.parse() so it still receives EDIT_JSON_INVALID.
 */
function duplicateJsonKey(jsonText) {
  let i = 0;
  const fail = () => { throw new Error("JSON_SCAN_INVALID"); };
  const skip = () => { while (i < jsonText.length && /\s/.test(jsonText[i])) i += 1; };

  function stringValue() {
    if (jsonText[i] !== '"') fail();
    const start = i;
    i += 1;
    while (i < jsonText.length) {
      if (jsonText[i] === "\\") { i += 2; continue; }
      if (jsonText[i] === '"') {
        i += 1;
        return JSON.parse(jsonText.slice(start, i));
      }
      i += 1;
    }
    fail();
  }

  function primitive() {
    const start = i;
    while (i < jsonText.length && !/[\s,\]}]/.test(jsonText[i])) i += 1;
    if (i === start) fail();
    return null;
  }

  function arrayValue() {
    i += 1;
    skip();
    if (jsonText[i] === "]") { i += 1; return null; }
    while (i < jsonText.length) {
      const duplicate = value();
      if (duplicate) return duplicate;
      skip();
      if (jsonText[i] === ",") { i += 1; skip(); continue; }
      if (jsonText[i] === "]") { i += 1; return null; }
      fail();
    }
    fail();
  }

  function objectValue() {
    i += 1;
    const seen = new Set();
    skip();
    if (jsonText[i] === "}") { i += 1; return null; }
    while (i < jsonText.length) {
      const key = stringValue();
      if (seen.has(key)) return { key };
      seen.add(key);
      skip();
      if (jsonText[i] !== ":") fail();
      i += 1;
      skip();
      const duplicate = value();
      if (duplicate) return duplicate;
      skip();
      if (jsonText[i] === ",") { i += 1; skip(); continue; }
      if (jsonText[i] === "}") { i += 1; return null; }
      fail();
    }
    fail();
  }

  function value() {
    skip();
    if (jsonText[i] === "{") return objectValue();
    if (jsonText[i] === "[") return arrayValue();
    if (jsonText[i] === '"') { stringValue(); return null; }
    return primitive();
  }

  try {
    const duplicate = value();
    if (duplicate) return duplicate;
    skip();
    if (i !== jsonText.length) fail();
    return null;
  } catch {
    return null;
  }
}

export function parseNativeEditOutput(outputText, allowedFiles = []) {
  let raw = String(outputText ?? "").replace(/\r\n/g, "\n");
  if (raw.endsWith("\n")) raw = raw.slice(0, -1);
  if (!raw.startsWith("EDIT_JSON: ")) return refusal("EDIT_JSON_REQUIRED");
  if (raw.includes("\n")) return refusal("EDIT_JSON_MUST_BE_SINGLE_LINE");
  if (Buffer.byteLength(raw, "utf8") > MAX_OUTPUT_BYTES) return refusal("EDIT_JSON_TOO_LARGE");

  const jsonText = raw.slice("EDIT_JSON: ".length);
  const duplicate = duplicateJsonKey(jsonText);
  if (duplicate) return refusal("EDIT_JSON_DUPLICATE_KEY", duplicate);

  let body;
  try { body = JSON.parse(jsonText); }
  catch { return refusal("EDIT_JSON_INVALID"); }
  if (!Array.isArray(body)) return refusal("EDIT_JSON_ARRAY_REQUIRED");
  if (body.length < 1 || body.length > MAX_EDITS) {
    return refusal("EDIT_COUNT_INVALID", { max_edits: MAX_EDITS });
  }

  const edits = [];
  for (let index = 0; index < body.length; index += 1) {
    const edit = body[index];
    if (!edit || typeof edit !== "object" || Array.isArray(edit)) {
      return refusal("EDIT_OBJECT_CLOSED", { index });
    }

    const isReplace = exactKeys(edit, ["new_text", "old_text", "path"]);
    const isCreate = exactKeys(edit, ["new_text", "path"]);
    if (!isReplace && !isCreate) return refusal("EDIT_OBJECT_CLOSED", { index });

    const file = normalizePath(edit.path);
    if (unsafePath(file)) return refusal("EDIT_PATH_UNSAFE", { index, path: file });
    if (!pathAllowed(file, allowedFiles)) return refusal("EDIT_PATH_NOT_AUTHORIZED", { index, path: file });
    if (typeof edit.new_text !== "string" || edit.new_text.includes("\u0000")) {
      return refusal("EDIT_TEXT_INVALID", { index, path: file });
    }

    if (isCreate) {
      if (!explicitlyAllowedPath(file, allowedFiles)) {
        return refusal("CREATE_PATH_EXPLICIT_AUTHORIZATION_REQUIRED", { index, path: file });
      }
      if (!edit.new_text.length) return refusal("CREATE_TEXT_EMPTY", { index, path: file });
      edits.push({ kind: "create", path: file, new_text: edit.new_text });
      continue;
    }

    if (typeof edit.old_text !== "string" || !edit.old_text.length || edit.old_text.includes("\u0000")) {
      return refusal("EDIT_TEXT_INVALID", { index, path: file });
    }
    if (edit.old_text === edit.new_text) return refusal("EDIT_NO_EFFECT", { index, path: file });
    edits.push({ kind: "replace", path: file, old_text: edit.old_text, new_text: edit.new_text });
  }
  return { ok: true, status: "STRUCTURALLY_ADMITTED", raw, edits, output_digest: digest(raw) };
}

function renderFilePatch(tmp, file, before, after, mode) {
  const oldFile = path.join(tmp, "a", file);
  const newFile = path.join(tmp, "b", file);
  mkdirSync(path.dirname(oldFile), { recursive: true });
  mkdirSync(path.dirname(newFile), { recursive: true });
  writeFileSync(oldFile, before, "utf8");
  writeFileSync(newFile, after, "utf8");
  const perms = mode === "100755" ? 0o755 : 0o644;
  chmodSync(oldFile, perms);
  chmodSync(newFile, perms);
  try {
    execFileSync("git", ["diff", "--no-index", "--no-prefix", "--binary", "--no-renames", "--", `a/${file}`, `b/${file}`], {
      cwd: tmp, encoding: "utf8", maxBuffer: 4 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"],
    });
    return "";
  } catch (error) {
    if (error?.status !== 1) throw error;
    return String(error.stdout || "");
  }
}

function renderCreateFilePatch(tmp, file, content) {
  const newFile = path.join(tmp, file);
  mkdirSync(path.dirname(newFile), { recursive: true });
  writeFileSync(newFile, content, "utf8");
  chmodSync(newFile, 0o644);
  try {
    execFileSync("git", [
      "diff", "--no-index", "--src-prefix=a/", "--dst-prefix=b/",
      "--binary", "--no-renames", "--", "/dev/null", file,
    ], {
      cwd: tmp, encoding: "utf8", maxBuffer: 4 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"],
    });
    return "";
  } catch (error) {
    if (error?.status !== 1) throw error;
    return String(error.stdout || "");
  }
}

export function applyNativeEdits({
  packet, outputText, worktree, home, runGit = realGit,
  patchAdmission = applyNativePatch,
} = {}) {
  const workUnitId = String(packet?.work_unit_id || "");
  const parsed = parseNativeEditOutput(outputText, packet?.allowed_files ?? []);
  const baseEvent = {
    event_version: "NEA1.v1", event_id: "nea-" + randomBytes(8).toString("hex"),
    at: now(), work_unit_id: workUnitId,
    output_digest: parsed?.output_digest ?? (outputText ? digest(outputText) : null),
  };
  const recordRefusal = (code, detail = null) => {
    const event = { ...baseEvent, event: "REFUSED", code, detail, converted: false };
    const evidence_path = appendEvent(workUnitId, event, { home });
    return { ...refusal(code, detail), edit_evidence_path: evidence_path, edit_event: event };
  };

  if (!workUnitId) return recordRefusal("WORK_UNIT_ID_REQUIRED");
  if (!worktree || !existsSync(worktree)) return recordRefusal("WORKTREE_NOT_FOUND");
  if (!parsed.ok) return recordRefusal(parsed.code, parsed.detail);

  const packetCanonical = String(packet?.canonical_sha || "").trim();
  if (!packetCanonical || !COMMIT_SHA.test(packetCanonical)) return recordRefusal("PACKET_CANONICAL_SHA_INVALID");
  let executionHead;
  let authorizedHead;
  try {
    executionHead = String(runGit(worktree, ["rev-parse", "HEAD"]) || "").trim();
    authorizedHead = String(runGit(worktree, ["rev-parse", packetCanonical + "^{commit}"]) || "").trim();
  } catch (error) {
    return recordRefusal("PACKET_CANONICAL_SHA_UNRESOLVED", String(error?.message || error));
  }
  if (!executionHead || !authorizedHead || executionHead !== authorizedHead) {
    return recordRefusal("WORKTREE_CANONICAL_SHA_MISMATCH", {
      packet_canonical_sha: authorizedHead || packetCanonical, execution_head: executionHead || null,
    });
  }
  let status;
  try { status = String(runGit(worktree, ["status", "--porcelain", "--untracked-files=all"]) || "").trim(); }
  catch (error) { return recordRefusal("WORKTREE_STATUS_UNREADABLE", String(error?.message || error)); }
  if (status) return recordRefusal("WORKTREE_NOT_CLEAN");

  const states = new Map();
  for (let index = 0; index < parsed.edits.length; index += 1) {
    const edit = parsed.edits[index];

    if (edit.kind === "create") {
      if (states.has(edit.path)) {
        return recordRefusal("CREATE_PATH_DUPLICATED_OR_MIXED", { index, path: edit.path });
      }
      let tracked;
      try { tracked = String(runGit(worktree, ["ls-tree", authorizedHead, "--", edit.path]) || "").trim(); }
      catch (error) { return recordRefusal("CREATE_TARGET_UNREADABLE", { index, path: edit.path, error: String(error?.message || error) }); }
      if (tracked) return recordRefusal("CREATE_TARGET_ALREADY_TRACKED", { index, path: edit.path });

      const target = path.join(worktree, edit.path);
      try {
        lstatSync(target);
        return recordRefusal("CREATE_TARGET_EXISTS", { index, path: edit.path });
      } catch (error) {
        if (error?.code !== "ENOENT") {
          return recordRefusal("CREATE_TARGET_UNREADABLE", { index, path: edit.path, error: String(error?.message || error) });
        }
      }
      const parentFailure = createParentRefusal(worktree, edit.path);
      if (parentFailure) return recordRefusal(parentFailure.code, { index, ...parentFailure.detail });
      states.set(edit.path, { kind: "create", mode: "100644", before: null, after: edit.new_text });
      continue;
    }

    if (states.has(edit.path) && states.get(edit.path).kind !== "replace") {
      return recordRefusal("EDIT_KIND_CONFLICT", { index, path: edit.path });
    }
    if (!states.has(edit.path)) {
      let tracked;
      try { tracked = String(runGit(worktree, ["ls-tree", authorizedHead, "--", edit.path]) || "").trim(); }
      catch (error) { return recordRefusal("EDIT_TARGET_UNREADABLE", { index, path: edit.path, error: String(error?.message || error) }); }
      if (!tracked) return recordRefusal("EDIT_TARGET_NOT_TRACKED", { index, path: edit.path });
      const mode = tracked.split(/\s+/, 1)[0];
      if (!TEXT_FILE_MODES.has(mode)) return recordRefusal("EDIT_TARGET_MODE_UNSUPPORTED", { index, path: edit.path, mode });
      let content;
      try { content = String(runGit(worktree, ["show", `${authorizedHead}:${edit.path}`]) || ""); }
      catch (error) { return recordRefusal("EDIT_TARGET_UNREADABLE", { index, path: edit.path, error: String(error?.message || error) }); }
      if (content.includes("\u0000")) return recordRefusal("EDIT_BINARY_UNSUPPORTED", { index, path: edit.path });
      states.set(edit.path, { kind: "replace", mode, before: content, after: content });
    }
    const state = states.get(edit.path);
    const occurrences = countOccurrences(state.after, edit.old_text);
    if (occurrences !== 1) return recordRefusal("OLD_TEXT_NOT_UNIQUE", { index, path: edit.path, occurrences });
    state.after = state.after.replace(edit.old_text, edit.new_text);
  }

  const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-edit-"));
  try {
    let patchText = "";
    for (const [file, state] of [...states.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      if (state.kind === "create") {
        patchText += renderCreateFilePatch(tmp, file, state.after);
        continue;
      }
      if (state.before === state.after) return recordRefusal("EDIT_FILE_NO_EFFECT", { path: file });
      patchText += renderFilePatch(tmp, file, state.before, state.after, state.mode);
    }
    if (!patchText.startsWith("diff --git ")) return recordRefusal("EDIT_PATCH_RENDER_FAILED");
    const createCount = [...states.values()].filter((state) => state.kind === "create").length;
    const converted = {
      ...baseEvent, event: "CONVERTED", code: "EDIT_CONVERTED", converted: true,
      edit_count: parsed.edits.length, create_count: createCount,
      replace_count: parsed.edits.length - createCount,
      paths: [...states.keys()].sort(), patch_digest: digest(patchText),
    };
    const edit_evidence_path = appendEvent(workUnitId, converted, { home });
    const result = patchAdmission({ packet, patchText, worktree, home, runGit });
    return {
      ...result,
      input_kind: "EDIT_JSON",
      edit_count: parsed.edits.length,
      create_count: [...states.values()].filter((state) => state.kind === "create").length,
      replace_count: [...states.values()].filter((state) => state.kind === "replace").length,
      structured_output_digest: parsed.output_digest,
      generated_patch_digest: digest(patchText),
      edit_evidence_path,
      edit_event: converted,
    };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const argv = process.argv.slice(2);
if (argv[0] === "apply") {
  const packetPath = argv[1];
  const worktree = argv[2];
  const outputFile = argv[3];
  if (!packetPath || !worktree || !outputFile) {
    console.error("usage: jarvis-native-edit-admission.mjs apply <packet.json> <worktree> <output-file>");
    process.exit(4);
  }
  const packet = JSON.parse(readFileSync(packetPath, "utf8"));
  const outputText = readFileSync(outputFile, "utf8");
  const result = applyNativeEdits({ packet, outputText, worktree });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.ok ? 0 : 9);
}
