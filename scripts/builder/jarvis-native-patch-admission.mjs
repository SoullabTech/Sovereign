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

const MAX_PATCH_BYTES = 512 * 1024;
const COMMIT_SHA = /^[0-9a-f]{7,40}$/i;
const TEXT_FILE_MODES = new Set(["100644", "100755"]);
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
  // split() produces one terminal empty item for the ordinary final newline.
  // Remove only that serialization artifact; an actual unprefixed blank line
  // inside a hunk remains and is refused by the grammar below.
  if (lines.at(-1) === "") lines.pop();
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

    if (inHunk) {
      if (
        !line.startsWith(" ")
        && !line.startsWith("+")
        && !line.startsWith("-")
        && !line.startsWith("\\")
        && !line.startsWith("@@ ")
      ) {
        return refusal("PATCH_HUNK_LINE_UNSUPPORTED", { line: line.slice(0, 180) });
      }
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
  if (!envelope.repo_read || envelope.repo_write_scope !== "worktree") {
    return recordRefusal("WORKTREE_WRITE_AUTHORITY_REQUIRED");
  }
  if (envelope.integration_actor !== "jarvis") {
    return recordRefusal("JARVIS_INTEGRATION_ACTOR_REQUIRED", {
      integration_actor: envelope.integration_actor,
    });
  }
  if (
    envelope.production_read
    || envelope.production_write
    || envelope.deploy
    || envelope.authority_change
    || envelope.external_network
    || envelope.external_repo_disclosure
    || envelope.provider_spend
  ) {
    return recordRefusal("PATCH_AUTHORITY_TOO_BROAD", { envelope });
  }

  const packetCanonical = String(packet?.canonical_sha || "").trim();
  if (!packetCanonical) return recordRefusal("PACKET_CANONICAL_SHA_REQUIRED");
  if (!COMMIT_SHA.test(packetCanonical)) return recordRefusal("PACKET_CANONICAL_SHA_INVALID");
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
      packet_canonical_sha: authorizedHead || packetCanonical,
      execution_head: executionHead || null,
    });
  }

  for (const file of inspected.patch_paths) {
    let tracked = "";
    try {
      tracked = String(runGit(worktree, ["ls-files", "-s", "--", file]) || "").trim();
    } catch (error) {
      return recordRefusal("PATCH_TARGET_MODE_UNREADABLE", {
        path: file, error: String(error?.message || error),
      });
    }
    if (tracked) {
      const mode = tracked.split(/\s+/, 1)[0];
      if (!TEXT_FILE_MODES.has(mode)) {
        return recordRefusal("PATCH_TARGET_MODE_UNSUPPORTED", { path: file, mode });
      }
    }
  }

  let status;
  try {
    status = String(runGit(worktree, ["status", "--porcelain", "--untracked-files=all"]) || "").trim();
  } catch (error) {
    return recordRefusal("WORKTREE_STATUS_UNREADABLE", String(error?.message || error));
  }
  if (status) return recordRefusal("WORKTREE_NOT_CLEAN");

  const tmp = mkdtempSync(path.join(os.tmpdir(), "jarvis-native-patch-"));
  const patchFile = path.join(tmp, "candidate.patch");
  writeFileSync(patchFile, patch, { encoding: "utf8", mode: 0o600 });

  try {
    try {
      runGit(worktree, ["apply", "--check", "--whitespace=nowarn", patchFile]);
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
      git_check_invoked: true,
      git_apply_invoked: false,
    };
    const evidence_path = appendEvent(workUnitId, admitted, { home });

    try {
      runGit(worktree, ["apply", "--whitespace=nowarn", patchFile]);
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
