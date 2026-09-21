#!/usr/bin/env node
/**
 * JARVIS-NATIVE-PATCH-ADMISSION-01
 *
 * Bounded mutation membrane for the toolless native Ollama worker.
 *
 * The model never receives filesystem, shell, git, web, or tool-call authority.
 * It may emit a structured exact-text edit, a pure git-style diff, or a governance gate.
 *
 * This module validates every path before invoking git, requires worktree write
 * authority, refuses unsupported patch shapes, runs git apply check, then
 * applies only inside the already-claimed worktree. Decisions are appended to
 * a durable JSONL ledger without storing patch bytes.
 */

import {
  appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync,
  rmSync, writeFileSync,
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import os from "node:os";
import { derivePermissionEnvelope } from "./work-unit.mjs";

const MAX_PATCH_BYTES = 512 * 1024;
const MAX_EDIT_SCRIPT_BYTES = 512 * 1024;
const MAX_NATIVE_EDITS = 32;
const HOME = (env = process.env) => (
  env.AIN_DELEGATION_HOME || path.join(os.homedir(), ".claude", "ain-delegation")
);
const now = () => new Date().toISOString();
const digest = (text) => "sha256:" + createHash("sha256").update(String(text), "utf8").digest("hex");

function safeId(value) {
  return String(value || "unknown").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}

export function ledgerPath(workUnitId, { home } = {}) {
  return path.join(home || HOME(), "native-patch-admission", safeId(workUnitId) + ".jsonl");
}

function appendEvent(workUnitId, event, { home } = {}) {
  const file = ledgerPath(workUnitId, { home });
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(event) + "\n", "utf8");
  return file;
}

function refusal(code, detail = null) {
  return { ok: false, status: "REFUSED", code, detail };
}

function normalizePath(value) {
  return String(value ?? "").trim().replaceAll("\\", "/");
}

function unsafePath(value) {
  const p = normalizePath(value);
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
  let p = normalizePath(pattern);
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

export function pathAllowed(file, allowedFiles = []) {
  const p = normalizePath(file);
  return Array.isArray(allowedFiles)
    && allowedFiles.some((pattern) => globRegex(pattern).test(p));
}

/**
 * Strip only untrusted diff metadata that JARVIS can derive independently.
 * Hunk contents and all path headers remain byte-for-byte model output.
 */
export function normalizePatchForGit(patchText) {
  return String(patchText ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !line.startsWith("index "))
    .join("\n");
}

export function inspectEditScript(editText, allowedFiles = []) {
  const raw = String(editText ?? "");
  if (!raw.trim()) return refusal("EDIT_SCRIPT_EMPTY");
  if (Buffer.byteLength(raw, "utf8") > MAX_EDIT_SCRIPT_BYTES) {
    return refusal("EDIT_SCRIPT_TOO_LARGE", { max_bytes: MAX_EDIT_SCRIPT_BYTES });
  }
  if (!raw.startsWith("EDIT_SCRIPT:")) {
    return refusal("EDIT_SCRIPT_PREFIX_REQUIRED");
  }
  if (/```/.test(raw)) return refusal("EDIT_SCRIPT_CODE_FENCE_UNSUPPORTED");

  let parsed;
  try {
    parsed = JSON.parse(raw.slice("EDIT_SCRIPT:".length).trim());
  } catch (error) {
    return refusal("EDIT_SCRIPT_JSON_INVALID", String(error?.message || error).slice(0, 500));
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return refusal("EDIT_SCRIPT_OBJECT_REQUIRED");
  }
  const topKeys = Object.keys(parsed).sort();
  if (topKeys.length !== 1 || topKeys[0] !== "edits") {
    return refusal("EDIT_SCRIPT_KEYS_UNSUPPORTED", { keys: topKeys });
  }
  if (!Array.isArray(parsed.edits) || parsed.edits.length < 1) {
    return refusal("EDIT_SCRIPT_EDITS_REQUIRED");
  }
  if (parsed.edits.length > MAX_NATIVE_EDITS) {
    return refusal("EDIT_SCRIPT_TOO_MANY_EDITS", { max_edits: MAX_NATIVE_EDITS });
  }

  const edits = [];
  for (let i = 0; i < parsed.edits.length; i += 1) {
    const edit = parsed.edits[i];
    if (!edit || typeof edit !== "object" || Array.isArray(edit)) {
      return refusal("EDIT_SCRIPT_EDIT_OBJECT_REQUIRED", { index: i });
    }
    const keys = Object.keys(edit).sort();
    if (keys.join(",") !== "new,old,path") {
      return refusal("EDIT_SCRIPT_EDIT_KEYS_UNSUPPORTED", { index: i, keys });
    }
    const p = normalizePath(edit.path);
    if (unsafePath(p)) return refusal("EDIT_SCRIPT_PATH_UNSAFE", { index: i, path: p });
    if (!pathAllowed(p, allowedFiles)) {
      return refusal("EDIT_SCRIPT_PATH_NOT_AUTHORIZED", { index: i, path: p });
    }
    if (typeof edit.old !== "string" || typeof edit.new !== "string") {
      return refusal("EDIT_SCRIPT_TEXT_REQUIRED", { index: i, path: p });
    }
    if (!edit.old.length) return refusal("EDIT_SCRIPT_OLD_TEXT_REQUIRED", { index: i, path: p });
    if (edit.old === edit.new) return refusal("EDIT_SCRIPT_NOOP_EDIT", { index: i, path: p });
    if (edit.old.includes("\u0000") || edit.new.includes("\u0000")) {
      return refusal("EDIT_SCRIPT_NUL_UNSUPPORTED", { index: i, path: p });
    }
    edits.push({ path: p, old: edit.old, new: edit.new });
  }

  return {
    ok: true,
    status: "EDIT_SCRIPT_STRUCTURALLY_ADMITTED",
    edit_script_digest: digest(raw),
    edit_paths: [...new Set(edits.map((edit) => edit.path))],
    edits,
  };
}

export function inspectPatch(patchText, allowedFiles = []) {
  const patch = String(patchText ?? "");
  if (!patch.trim()) return refusal("PATCH_EMPTY");
  if (Buffer.byteLength(patch, "utf8") > MAX_PATCH_BYTES) {
    return refusal("PATCH_TOO_LARGE", { max_bytes: MAX_PATCH_BYTES });
  }
  if (/^GOVERNANCE_GATE:/m.test(patch)) {
    return refusal("GOVERNANCE_GATE_IS_NOT_A_PATCH");
  }
  if (!patch.startsWith("diff --git ")) {
    return refusal("PATCH_MUST_BE_PURE_GIT_DIFF");
  }
  if (/```/.test(patch)) return refusal("PATCH_CODE_FENCE_UNSUPPORTED");
  if (/^GIT binary patch$/m.test(patch) || /^Binary files /m.test(patch)) {
    return refusal("PATCH_BINARY_UNSUPPORTED");
  }
  if (/^(rename from|rename to|copy from|copy to|similarity index|dissimilarity index) /m.test(patch)) {
    return refusal("PATCH_RENAME_COPY_UNSUPPORTED");
  }
  if (/^(old mode|new mode) /m.test(patch)) {
    return refusal("PATCH_MODE_CHANGE_UNSUPPORTED");
  }

  const lines = patch.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;
  let inHunk = false;

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      const m = /^diff --git a\/([^\t ]+) b\/([^\t ]+)$/.exec(line);
      if (!m) return refusal("PATCH_PATH_HEADER_UNSUPPORTED", { header: line.slice(0, 180) });
      const a = normalizePath(m[1]);
      const b = normalizePath(m[2]);
      if (a !== b) return refusal("PATCH_RENAME_UNSUPPORTED", { from: a, to: b });
      if (unsafePath(a)) return refusal("PATCH_PATH_UNSAFE", { path: a });
      if (!pathAllowed(a, allowedFiles)) {
        return refusal("PATCH_PATH_NOT_AUTHORIZED", { path: a });
      }
      current = { path: a, saw_hunk: false };
      sections.push(current);
      inHunk = false;
      continue;
    }

    if (!current) {
      if (line.trim()) return refusal("PATCH_PROSE_OR_PREFIX_UNSUPPORTED");
      continue;
    }

    if (line.startsWith("@@ ")) {
      current.saw_hunk = true;
      inHunk = true;
      continue;
    }

    if (!inHunk && line.startsWith("--- ")) {
      const expected = "a/" + current.path;
      if (line !== "--- " + expected && line !== "--- /dev/null") {
        return refusal("PATCH_OLD_PATH_MISMATCH", { path: current.path });
      }
      continue;
    }

    if (!inHunk && line.startsWith("+++ ")) {
      const expected = "b/" + current.path;
      if (line !== "+++ " + expected && line !== "+++ /dev/null") {
        return refusal("PATCH_NEW_PATH_MISMATCH", { path: current.path });
      }
      continue;
    }

    if (!inHunk && /^new file mode /.test(line) && line !== "new file mode 100644") {
      return refusal("PATCH_NEW_FILE_MODE_UNSUPPORTED", { mode: line.slice("new file mode ".length) });
    }
    if (!inHunk && /^deleted file mode /.test(line) && line !== "deleted file mode 100644") {
      return refusal("PATCH_DELETED_FILE_MODE_UNSUPPORTED", { mode: line.slice("deleted file mode ".length) });
    }
  }

  if (!sections.length) return refusal("PATCH_HAS_NO_FILES");
  if (sections.some((section) => !section.saw_hunk)) {
    return refusal("PATCH_SECTION_HAS_NO_TEXT_HUNK");
  }

  const paths = [...new Set(sections.map((section) => section.path))];
  return {
    ok: true,
    status: "STRUCTURALLY_ADMITTED",
    patch_digest: digest(patch),
    patch_paths: paths,
  };
}

function realGit(worktree, args) {
  return execFileSync("git", ["-C", worktree, ...args], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function changedPaths(worktree, runGit = realGit) {
  const tracked = String(runGit(worktree, ["diff", "--name-only", "HEAD", "--"]) || "")
    .split("\n").map((v) => v.trim()).filter(Boolean);
  const untracked = String(runGit(worktree, ["ls-files", "--others", "--exclude-standard"]) || "")
    .split("\n").map((v) => v.trim()).filter(Boolean);
  return [...new Set([...tracked, ...untracked])].sort();
}

function eventBase(workUnitId, inspected, event) {
  return {
    event_version: "NPA1.v1",
    event_id: "npa-" + randomBytes(8).toString("hex"),
    event,
    at: now(),
    work_unit_id: workUnitId,
    patch_digest: inspected?.patch_digest ?? null,
    patch_paths: inspected?.patch_paths ?? [],
  };
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let from = 0;
  while (true) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) return count;
    count += 1;
    from = at + needle.length;
  }
}

export function compileNativeEditScript({
  packet,
  editText,
  worktree,
  runGit = realGit,
} = {}) {
  const inspected = inspectEditScript(editText, packet?.allowed_files ?? []);
  if (!inspected.ok) return inspected;
  if (!worktree || !existsSync(worktree)) return refusal("WORKTREE_NOT_FOUND");

  const originals = new Map();
  const finals = new Map();
  for (let i = 0; i < inspected.edits.length; i += 1) {
    const edit = inspected.edits[i];
    if (!finals.has(edit.path)) {
      let base;
      try {
        base = String(runGit(worktree, ["show", `HEAD:${edit.path}`]) || "");
      } catch (error) {
        return refusal("EDIT_TARGET_NOT_TRACKED", {
          index: i,
          path: edit.path,
          reason: String(error?.stderr || error?.message || error).slice(0, 500),
        });
      }
      if (base.includes("\u0000")) {
        return refusal("EDIT_TARGET_BINARY_UNSUPPORTED", { index: i, path: edit.path });
      }
      originals.set(edit.path, base);
      finals.set(edit.path, base);
    }

    const current = finals.get(edit.path);
    const occurrences = countOccurrences(current, edit.old);
    if (occurrences !== 1) {
      return refusal("EDIT_OLD_TEXT_NOT_UNIQUE", {
        index: i,
        path: edit.path,
        occurrences,
      });
    }
    finals.set(edit.path, current.replace(edit.old, edit.new));
  }

  const changedPaths = [...finals.keys()].filter((p) => finals.get(p) !== originals.get(p));
  if (!changedPaths.length) return refusal("EDIT_SCRIPT_NO_NET_CHANGE");

  const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-edit-"));
  try {
    const patches = [];
    for (const p of changedPaths) {
      const oldPath = path.join(tmp, "a", p);
      const newPath = path.join(tmp, "b", p);
      mkdirSync(path.dirname(oldPath), { recursive: true });
      mkdirSync(path.dirname(newPath), { recursive: true });
      writeFileSync(oldPath, originals.get(p), "utf8");
      writeFileSync(newPath, finals.get(p), "utf8");

      const diff = spawnSync(
        "git",
        ["diff", "--no-index", "--no-prefix", "--", `a/${p}`, `b/${p}`],
        { cwd: tmp, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
      );
      if (diff.status !== 1 || !diff.stdout) {
        return refusal("EDIT_DIFF_CONSTRUCTION_FAILED", {
          path: p,
          status: diff.status,
          stderr: String(diff.stderr || "").slice(0, 500),
        });
      }
      patches.push(String(diff.stdout).trimEnd());
    }

    const patchText = patches.join("\n") + "\n";
    const patchInspection = inspectPatch(patchText, packet?.allowed_files ?? []);
    if (!patchInspection.ok) {
      return refusal("EDIT_COMPILED_PATCH_INVALID", {
        code: patchInspection.code,
        detail: patchInspection.detail,
      });
    }
    return {
      ok: true,
      status: "EDIT_SCRIPT_COMPILED",
      edit_script_digest: inspected.edit_script_digest,
      edit_paths: inspected.edit_paths,
      patch_text: patchText,
      patch_digest: patchInspection.patch_digest,
      patch_paths: patchInspection.patch_paths,
    };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export function applyNativeEditScript({
  packet,
  editText,
  worktree,
  home,
  runGit = realGit,
} = {}) {
  const workUnitId = String(packet?.work_unit_id || "");
  const compiled = compileNativeEditScript({ packet, editText, worktree, runGit });

  if (!compiled.ok) {
    const event = {
      event_version: "NPA1.v1",
      event_id: "npa-" + randomBytes(8).toString("hex"),
      event: "EDIT_REFUSED",
      at: now(),
      work_unit_id: workUnitId,
      edit_script_digest: editText ? digest(editText) : null,
      code: compiled.code,
      detail: compiled.detail ?? null,
      applied: false,
      git_check_invoked: false,
      git_apply_invoked: false,
    };
    const evidence_path = appendEvent(workUnitId, event, { home });
    return { ...compiled, evidence_path, event };
  }

  appendEvent(workUnitId, {
    event_version: "NPA1.v1",
    event_id: "npa-" + randomBytes(8).toString("hex"),
    event: "EDIT_COMPILED",
    at: now(),
    work_unit_id: workUnitId,
    edit_script_digest: compiled.edit_script_digest,
    patch_digest: compiled.patch_digest,
    edit_paths: compiled.edit_paths,
    patch_paths: compiled.patch_paths,
    code: "EDIT_SCRIPT_COMPILED",
    applied: false,
    git_check_invoked: false,
    git_apply_invoked: false,
  }, { home });

  const applied = applyNativePatch({
    packet,
    patchText: compiled.patch_text,
    worktree,
    home,
    runGit,
  });
  return {
    ...applied,
    edit_script_digest: compiled.edit_script_digest,
    compiled_patch_digest: compiled.patch_digest,
    edit_paths: compiled.edit_paths,
    compiled_from: "EDIT_SCRIPT_V1",
  };
}

export function applyNativePatch({
  packet,
  patchText,
  worktree,
  home,
  runGit = realGit,
} = {}) {
  const workUnitId = String(packet?.work_unit_id || "");
  const patch = String(patchText ?? "");
  const inspected = inspectPatch(patch, packet?.allowed_files ?? []);
  const normalizedPatch = inspected.ok ? normalizePatchForGit(patch) : patch;
  const normalizedPatchDigest = inspected.ok ? digest(normalizedPatch) : null;

  const recordRefusal = (code, detail = null, extra = {}) => {
    const base = eventBase(workUnitId, inspected.ok ? inspected : {
      patch_digest: patch ? digest(patch) : null,
      patch_paths: [],
    }, "REFUSED");
    const event = {
      ...base,
      code,
      detail,
      applied: false,
      git_check_invoked: false,
      git_apply_invoked: false,
      ...extra,
    };
    const evidence_path = appendEvent(workUnitId, event, { home });
    return { ...refusal(code, detail), evidence_path, event };
  };

  if (!workUnitId) return recordRefusal("WORK_UNIT_ID_REQUIRED");
  if (!worktree || !existsSync(worktree)) return recordRefusal("WORKTREE_NOT_FOUND");
  if (!inspected.ok) return recordRefusal(inspected.code, inspected.detail);

  const envelope = derivePermissionEnvelope(packet);
  if (envelope.repo_write_scope !== "worktree") {
    return recordRefusal("WORKTREE_WRITE_AUTHORITY_REQUIRED");
  }
  if (envelope.production_write || envelope.deploy || envelope.authority_change) {
    return recordRefusal("PATCH_AUTHORITY_TOO_BROAD");
  }

  let status;
  try {
    status = String(runGit(worktree, ["status", "--porcelain", "--untracked-files=all"]) || "").trim();
  } catch (error) {
    return recordRefusal("WORKTREE_STATUS_UNREADABLE", String(error?.message || error));
  }
  if (status) return recordRefusal("WORKTREE_NOT_CLEAN");

  // Text-patch V1 refuses tracked symlink/submodule/special-file targets even
  // when the path itself is authorized. This prevents an allowed path from
  // becoming an indirect write outside the worktree by changing a symlink target.
  for (const patchPath of inspected.patch_paths) {
    let indexLine;
    try {
      indexLine = String(runGit(worktree, ["ls-files", "-s", "--", patchPath]) || "").trim();
    } catch (error) {
      return recordRefusal("PATCH_TARGET_MODE_UNREADABLE", {
        path: patchPath,
        reason: String(error?.message || error),
      });
    }
    if (!indexLine) continue; // ordinary new text file; git apply determines creation validity.
    const mode = indexLine.split(/\s+/, 1)[0];
    if (mode !== "100644" && mode !== "100755") {
      return recordRefusal("PATCH_TARGET_MODE_UNSUPPORTED", {
        path: patchPath,
        mode,
      });
    }
  }

  const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-patch-"));
  const patchFile = path.join(tmp, "candidate.patch");
  writeFileSync(patchFile, normalizedPatch, { encoding: "utf8", mode: 0o600 });

  try {
    try {
      runGit(worktree, ["apply", "--check", "--recount", "--whitespace=nowarn", patchFile]);
    } catch (error) {
      return recordRefusal(
        "GIT_APPLY_CHECK_FAILED",
        String(error?.stderr || error?.message || error).slice(0, 2000),
        { git_check_invoked: true, git_apply_invoked: false },
      );
    }

    const admitted = {
      ...eventBase(workUnitId, inspected, "ADMITTED"),
      code: "PATCH_ADMITTED",
      applied: false,
      normalized_patch_digest: normalizedPatchDigest,
      normalization: "strip-index-metadata+git-recount",
      git_check_invoked: true,
      git_apply_invoked: false,
    };
    const evidence_path = appendEvent(workUnitId, admitted, { home });

    try {
      runGit(worktree, ["apply", "--recount", "--whitespace=nowarn", patchFile]);
    } catch (error) {
      const event = {
        ...eventBase(workUnitId, inspected, "APPLY_FAILED"),
        code: "GIT_APPLY_FAILED",
        applied: false,
        git_check_invoked: true,
        git_apply_invoked: true,
        detail: String(error?.stderr || error?.message || error).slice(0, 2000),
      };
      appendEvent(workUnitId, event, { home });
      return { ...refusal(event.code, event.detail), evidence_path, event };
    }

    const changed = changedPaths(worktree, runGit);
    const outOfScope = changed.filter((file) => !pathAllowed(file, packet?.allowed_files ?? []));
    const unexpected = changed.filter((file) => !inspected.patch_paths.includes(file));
    if (outOfScope.length || unexpected.length) {
      try { runGit(worktree, ["reset", "--hard", "HEAD"]); } catch {}
      try { runGit(worktree, ["clean", "-fd"]); } catch {}
      const event = {
        ...eventBase(workUnitId, inspected, "ROLLED_BACK"),
        code: "POST_APPLY_SCOPE_VIOLATION",
        applied: false,
        git_check_invoked: true,
        git_apply_invoked: true,
        changed_paths: changed,
        out_of_scope: outOfScope,
        unexpected_paths: unexpected,
      };
      appendEvent(workUnitId, event, { home });
      return { ...refusal(event.code, {
        out_of_scope: outOfScope,
        unexpected_paths: unexpected,
      }), evidence_path, event };
    }

    const applied = {
      ...eventBase(workUnitId, inspected, "APPLIED"),
      code: "PATCH_APPLIED",
      applied: true,
      normalized_patch_digest: normalizedPatchDigest,
      normalization: "strip-index-metadata+git-recount",
      git_check_invoked: true,
      git_apply_invoked: true,
      changed_paths: changed,
    };
    appendEvent(workUnitId, applied, { home });
    return {
      ok: true,
      status: "APPLIED",
      code: applied.code,
      patch_digest: inspected.patch_digest,
      normalized_patch_digest: normalizedPatchDigest,
      patch_paths: inspected.patch_paths,
      changed_paths: changed,
      evidence_path,
      event: applied,
    };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const argv = process.argv.slice(2);
if (argv[0] === "apply" || argv[0] === "apply-edit") {
  const mode = argv[0];
  const packetPath = argv[1];
  const worktree = argv[2];
  const candidateFile = argv[3];
  if (!packetPath || !worktree || !candidateFile) {
    console.error("usage: jarvis-native-patch-admission.mjs <apply|apply-edit> <packet.json> <worktree> <candidate-file>");
    process.exit(4);
  }
  const packet = JSON.parse(readFileSync(packetPath, "utf8"));
  const candidateText = readFileSync(candidateFile, "utf8");
  const result = mode === "apply-edit"
    ? applyNativeEditScript({ packet, editText: candidateText, worktree })
    : applyNativePatch({ packet, patchText: candidateText, worktree });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.ok ? 0 : 9);
}
