#!/usr/bin/env node
/**
 * JARVIS-NATIVE-PATCH-ADMISSION-01
 *
 * Bounded mutation membrane for the toolless native Ollama worker.
 *
 * The model never receives filesystem, shell, git, web, or tool-call authority.
 * It may emit only a pure git-style unified diff candidate or a governance gate.
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
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import os from "node:os";
import { derivePermissionEnvelope } from "./work-unit.mjs";
import { materializePacket } from "./jarvis-context.mjs";

const MAX_PATCH_BYTES = 512 * 1024;
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
 * Normalize only diff bookkeeping JARVIS can derive mechanically.
 * Model-authored + / - content bytes are never rewritten here.
 */
export function normalizePatchForGitDetailed(patchText) {
  const source = String(patchText ?? "").replace(/\r\n/g, "\n");
  let lines = source.split("\n").filter((line) => !line.startsWith("index "));

  while (lines.length && lines.at(-1) === "") lines.pop();
  if (lines.at(-1) === "*** End of File ***") {
    lines.pop();
    while (lines.length && lines.at(-1) === "") lines.pop();
  }

  const out = [];
  const hunks = [];
  let currentPath = null;
  let fileDelta = 0;
  const isHunkMarker = (value) => value === "@@" || value.startsWith("@@ ");

  for (let i = 0; i < lines.length;) {
    const line = lines[i];

    if (line.startsWith("diff --git ")) {
      const m = /^diff --git a\/([^\t ]+) b\/([^\t ]+)$/.exec(line);
      if (!m || m[1] !== m[2]) {
        return refusal("PATCH_PATH_HEADER_UNSUPPORTED", { header: line.slice(0, 180) });
      }
      currentPath = normalizePath(m[1]);
      fileDelta = 0;
      out.push(line);

      let hasOld = false;
      let hasNew = false;
      for (let j = i + 1; j < lines.length && !lines[j].startsWith("diff --git ") && !isHunkMarker(lines[j]); j += 1) {
        if (lines[j].startsWith("--- ")) hasOld = true;
        if (lines[j].startsWith("+++ ")) hasNew = true;
      }
      if (hasOld !== hasNew) {
        return refusal("PATCH_FILE_HEADERS_PARTIAL", { path: currentPath });
      }
      if (!hasOld) {
        out.push("--- a/" + currentPath);
        out.push("+++ b/" + currentPath);
      }
      i += 1;
      continue;
    }

    if (isHunkMarker(line)) {
      if (!currentPath) return refusal("PATCH_HUNK_WITHOUT_FILE");

      const bare = line === "@@";
      let oldStart = null;
      let suffix = "";
      if (!bare) {
        const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/.exec(line);
        if (!m) return refusal("PATCH_HUNK_HEADER_UNSUPPORTED", { header: line.slice(0, 180) });
        oldStart = Number(m[1]);
        suffix = m[5] ?? "";
      }

      const body = [];
      let j = i + 1;
      while (j < lines.length && !isHunkMarker(lines[j]) && !lines[j].startsWith("diff --git ")) {
        const bodyLine = lines[j];

        if (bodyLine.startsWith("\\ No newline at end of file")) {
          if (!bare) body.push(bodyLine);
          j += 1;
          continue;
        }

        if (bare) {
          if (bodyLine.startsWith("+") || bodyLine.startsWith("-")) {
            body.push(bodyLine);
          } else if (bodyLine === "" || bodyLine.startsWith(" ")) {
            // Bare @@ has no usable positional metadata. Context carries no
            // semantic mutation, so drop it and anchor only exact +/- bytes.
          } else {
            return refusal("PATCH_BARE_HUNK_BODY_UNSUPPORTED", {
              path: currentPath,
              line: bodyLine.slice(0, 180),
            });
          }
          j += 1;
          continue;
        }

        if (![" ", "+", "-"].includes(bodyLine.slice(0, 1))) {
          return refusal("PATCH_HUNK_BODY_UNSUPPORTED", { path: currentPath, line: bodyLine.slice(0, 180) });
        }
        body.push(bodyLine);
        j += 1;
      }

      const oldCount = body.filter((x) => x.startsWith(" ") || x.startsWith("-")).length;
      const newCount = body.filter((x) => x.startsWith(" ") || x.startsWith("+")).length;
      const contextCount = body.filter((x) => x.startsWith(" ")).length;

      if (bare && body.filter((x) => x.startsWith("-")).length === 0) {
        return refusal("PATCH_BARE_HUNK_REQUIRES_REMOVED_BYTES", { path: currentPath });
      }

      const newStart = bare ? null : oldStart + fileDelta + (oldCount === 0 ? 1 : 0);

      out.push(bare
        ? `@@ -0,${oldCount} +0,${newCount} @@`
        : `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@${suffix}`);
      out.push(...body);
      hunks.push({
        path: currentPath,
        old_start: oldStart,
        old_count: oldCount,
        new_start: newStart,
        new_count: newCount,
        context_count: contextCount,
        position_missing: bare,
        body,
      });

      if (!bare) fileDelta += newCount - oldCount;
      i = j;
      continue;
    }

    out.push(line);
    i += 1;
  }

  const zeroContext = hunks.length > 0 && hunks.every((h) => h.context_count === 0);
  const hasBare = hunks.some((h) => h.position_missing);
  const joined = out.join("\n");
  return {
    ok: true,
    patch: joined.endsWith("\n") ? joined : joined + "\n",
    hunks,
    zero_context: zeroContext,
    normalization: zeroContext
      ? "strip-index+derive-file-headers+recount+zero-context-offsets"
        + (hasBare ? "+bare-hunk-anchor" : "")
      : "strip-index+derive-file-headers+recount",
  };
}

export function normalizePatchForGit(patchText) {
  const result = normalizePatchForGitDetailed(patchText);
  return result.ok ? result.patch : String(patchText ?? "");
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

    if (line === "@@" || line.startsWith("@@ ")) {
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
function rewriteZeroContextHunkHeaders(normalized, mappedHunks) {
  const lines = normalized.patch.split("\n");
  let hunkIndex = 0;
  const out = lines.map((line) => {
    if (!line.startsWith("@@ ")) return line;
    const h = mappedHunks[hunkIndex++];
    const suffixMatch = /^@@ [^@]+@@(.*)$/.exec(line);
    const suffix = suffixMatch?.[1] ?? "";
    return `@@ -${h.old_start},${h.old_count} +${h.new_start},${h.new_count} @@${suffix}`;
  });
  return out.join("\n");
}

function resolveAndValidateZeroContextAgainstTarget(packet, worktree, normalized) {
  let fragments;
  try {
    fragments = materializePacket(packet, worktree);
  } catch (error) {
    return refusal("PATCH_TARGET_CONTEXT_UNAVAILABLE", String(error?.message || error));
  }

  const rangesByPath = new Map();
  for (const fragment of fragments) {
    const p = normalizePath(fragment.source_file);
    if (!rangesByPath.has(p)) rangesByPath.set(p, []);
    rangesByPath.get(p).push([fragment.start_line, fragment.end_line]);
  }

  const fileLinesByPath = new Map();
  const readLines = (patchPath) => {
    if (fileLinesByPath.has(patchPath)) return fileLinesByPath.get(patchPath);
    const lines = readFileSync(path.join(worktree, patchPath), "utf8")
      .replace(/\r\n/g, "\n")
      .split("\n");
    fileLinesByPath.set(patchPath, lines);
    return lines;
  };

  if (normalized.hunks.some((h) => h.position_missing)) {
    if (!normalized.hunks.every((h) => h.position_missing)) {
      return refusal("PATCH_MIXED_POSITION_BASIS_UNSUPPORTED");
    }

    const mapped = [];
    const deltaByPath = new Map();
    const lastEndByPath = new Map();

    for (const hunk of normalized.hunks) {
      const ranges = rangesByPath.get(hunk.path) ?? [];
      if (!ranges.length) return refusal("PATCH_TARGET_CONTEXT_REQUIRED", { path: hunk.path });

      let fileLines;
      try {
        fileLines = readLines(hunk.path);
      } catch (error) {
        return refusal("PATCH_TARGET_READ_FAILED", {
          path: hunk.path,
          reason: String(error?.message || error),
        });
      }

      const removed = hunk.body.filter((x) => x.startsWith("-")).map((x) => x.slice(1));
      if (!removed.length) {
        return refusal("PATCH_BARE_HUNK_REQUIRES_REMOVED_BYTES", { path: hunk.path });
      }

      const hits = [];
      for (let i = 0; i <= fileLines.length - removed.length; i += 1) {
        if (JSON.stringify(fileLines.slice(i, i + removed.length)) !== JSON.stringify(removed)) continue;
        const oldStart = i + 1;
        const oldEnd = oldStart + removed.length - 1;
        if (ranges.some(([start, end]) => oldStart >= start && oldEnd <= end)) {
          hits.push(oldStart);
        }
      }

      if (hits.length === 0) {
        return refusal("PATCH_BARE_HUNK_ANCHOR_NOT_FOUND", {
          path: hunk.path,
          removed,
          ranges,
        });
      }
      if (hits.length > 1) {
        return refusal("PATCH_BARE_HUNK_ANCHOR_AMBIGUOUS", {
          path: hunk.path,
          removed,
          hits,
        });
      }

      const oldStart = hits[0];
      const oldEnd = oldStart + hunk.old_count - 1;
      const previousEnd = lastEndByPath.get(hunk.path);
      if (previousEnd != null && oldStart <= previousEnd) {
        return refusal("PATCH_HUNKS_OVERLAP_OR_UNSORTED", { path: hunk.path });
      }
      lastEndByPath.set(hunk.path, oldEnd);

      const delta = deltaByPath.get(hunk.path) ?? 0;
      const newStart = oldStart + delta + (hunk.old_count === 0 ? 1 : 0);
      mapped.push({ ...hunk, old_start: oldStart, new_start: newStart });
      deltaByPath.set(hunk.path, delta + hunk.new_count - hunk.old_count);
    }

    return {
      ok: true,
      status: "ZERO_CONTEXT_TARGET_VALIDATED",
      position_basis: "unique-removed-bytes",
      hunks: mapped,
      patch: rewriteZeroContextHunkHeaders(normalized, mapped),
    };
  }

  const validateBasis = (basis) => {
    const mapped = [];
    const lastEndByPath = new Map();
    const deltaByPath = new Map();

    for (const hunk of normalized.hunks) {
      const ranges = rangesByPath.get(hunk.path) ?? [];
      if (!ranges.length) return { ok: false, code: "PATCH_TARGET_CONTEXT_REQUIRED", detail: { path: hunk.path } };

      let oldStart = hunk.old_start;
      if (basis === "fragment-relative") {
        if (ranges.length !== 1) {
          return { ok: false, code: "PATCH_FRAGMENT_RELATIVE_AMBIGUOUS", detail: { path: hunk.path, ranges } };
        }
        oldStart = ranges[0][0] + hunk.old_start - 1;
      }

      const oldEnd = hunk.old_count === 0 ? oldStart : oldStart + hunk.old_count - 1;
      const inRange = ranges.some(([start, end]) => (
        hunk.old_count === 0
          ? oldStart >= start - 1 && oldStart <= end
          : oldStart >= start && oldEnd <= end
      ));
      if (!inRange) {
        return {
          ok: false,
          code: "PATCH_HUNK_OUTSIDE_MATERIALIZED_TARGET",
          detail: { path: hunk.path, old_start: oldStart, old_count: hunk.old_count, ranges, basis },
        };
      }

      const previousEnd = lastEndByPath.get(hunk.path);
      if (previousEnd != null && oldStart <= previousEnd) {
        return { ok: false, code: "PATCH_HUNKS_OVERLAP_OR_UNSORTED", detail: { path: hunk.path, basis } };
      }
      lastEndByPath.set(hunk.path, Math.max(oldStart, oldEnd));

      if (hunk.old_count > 0) {
        let fileLines;
        try {
          fileLines = readLines(hunk.path);
        } catch (error) {
          return {
            ok: false,
            code: "PATCH_TARGET_READ_FAILED",
            detail: { path: hunk.path, reason: String(error?.message || error) },
          };
        }
        const removed = hunk.body.filter((x) => x.startsWith("-")).map((x) => x.slice(1));
        const actual = fileLines.slice(oldStart - 1, oldStart - 1 + hunk.old_count);
        if (removed.length !== hunk.old_count || JSON.stringify(removed) !== JSON.stringify(actual)) {
          return {
            ok: false,
            code: "PATCH_OLD_BYTES_MISMATCH",
            detail: { path: hunk.path, old_start: oldStart, expected_removed: removed, actual, basis },
          };
        }
      }

      const delta = deltaByPath.get(hunk.path) ?? 0;
      const newStart = oldStart + delta + (hunk.old_count === 0 ? 1 : 0);
      mapped.push({ ...hunk, old_start: oldStart, new_start: newStart });
      deltaByPath.set(hunk.path, delta + hunk.new_count - hunk.old_count);
    }

    return { ok: true, mapped };
  };

  const absolute = validateBasis("absolute");
  const relative = validateBasis("fragment-relative");

  let chosen;
  let positionBasis;
  if (absolute.ok && relative.ok) {
    const same = JSON.stringify(absolute.mapped.map((h) => h.old_start))
      === JSON.stringify(relative.mapped.map((h) => h.old_start));
    if (!same) {
      return refusal("PATCH_POSITION_BASIS_AMBIGUOUS");
    }
    chosen = absolute;
    positionBasis = "absolute";
  } else if (absolute.ok) {
    chosen = absolute;
    positionBasis = "absolute";
  } else if (relative.ok) {
    chosen = relative;
    positionBasis = "fragment-relative";
  } else {
    return refusal(absolute.code ?? relative.code ?? "PATCH_ZERO_CONTEXT_POSITION_INVALID", {
      absolute: absolute.detail ?? null,
      fragment_relative: relative.detail ?? null,
    });
  }

  return {
    ok: true,
    status: "ZERO_CONTEXT_TARGET_VALIDATED",
    position_basis: positionBasis,
    hunks: chosen.mapped,
    patch: rewriteZeroContextHunkHeaders(normalized, chosen.mapped),
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
  let normalized = inspected.ok ? normalizePatchForGitDetailed(patch) : null;
  let normalizedPatch = normalized?.ok ? normalized.patch : patch;
  let normalizedPatchDigest = normalized?.ok ? digest(normalizedPatch) : null;
  let positionBasis = null;

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
  if (!normalized?.ok) return recordRefusal(normalized?.code ?? "PATCH_NORMALIZATION_FAILED", normalized?.detail);

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

  if (normalized.zero_context) {
    const targetValidation = resolveAndValidateZeroContextAgainstTarget(packet, worktree, normalized);
    if (!targetValidation.ok) {
      return recordRefusal(targetValidation.code, targetValidation.detail, {
        zero_context: true,
      });
    }
    positionBasis = targetValidation.position_basis;
    normalized = {
      ...normalized,
      patch: targetValidation.patch,
      hunks: targetValidation.hunks,
      normalization: normalized.normalization
        + (positionBasis === "fragment-relative" ? "+fragment-relative-old-lines" : ""),
    };
    normalizedPatch = normalized.patch;
    normalizedPatchDigest = digest(normalizedPatch);
  }

  const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-patch-"));
  const patchFile = path.join(tmp, "candidate.patch");
  writeFileSync(patchFile, normalizedPatch, { encoding: "utf8", mode: 0o600 });

  try {
    try {
      const checkArgs = ["apply", "--check", "--recount"];
      if (normalized.zero_context) checkArgs.push("--unidiff-zero");
      checkArgs.push("--whitespace=nowarn", patchFile);
      runGit(worktree, checkArgs);
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
      normalization: normalized.normalization,
      zero_context: normalized.zero_context,
      position_basis: positionBasis,
      git_check_invoked: true,
      git_apply_invoked: false,
    };
    const evidence_path = appendEvent(workUnitId, admitted, { home });

    try {
      const applyArgs = ["apply", "--recount"];
      if (normalized.zero_context) applyArgs.push("--unidiff-zero");
      applyArgs.push("--whitespace=nowarn", patchFile);
      runGit(worktree, applyArgs);
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
      normalization: normalized.normalization,
      zero_context: normalized.zero_context,
      position_basis: positionBasis,
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
if (argv[0] === "apply") {
  const packetPath = argv[1];
  const worktree = argv[2];
  const patchFile = argv[3];
  if (!packetPath || !worktree || !patchFile) {
    console.error("usage: jarvis-native-patch-admission.mjs apply <packet.json> <worktree> <patch-file>");
    process.exit(4);
  }
  const packet = JSON.parse(readFileSync(packetPath, "utf8"));
  const patchText = readFileSync(patchFile, "utf8");
  const result = applyNativePatch({ packet, patchText, worktree });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.ok ? 0 : 9);
}
