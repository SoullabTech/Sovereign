#!/usr/bin/env tsx
/**
 * REVIEW-CUSTODY-01 · STEP 3 — DATABASE MIGRATION BINDING GATE
 *
 * Additive law only. The frozen Step 1 core is imported, never edited.
 *
 * This gate composes two separate questions:
 *   1. Does the exact admitted migration review still apply?
 *   2. Does that SAME admitted review carry a compatibility attestation that
 *      still applies to the exact old reader, target reader and ordered pending bytes?
 *
 * Neither law rescues the other. There is one admitted review and one custody-
 * witnessed corpus; compatibility has no independent trace input.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  STRICT, check, sha256,
  type ChangedPath, type CustodyEnv, type CustodyRecord,
} from "./review-custody-core";
import { STRICT_COVERAGE, witnessCoverage } from "./review-custody-coverage";
import { composeMigrationGate } from "./migration-compatibility-gate-core";

class GateRefusal extends Error {
  constructor(readonly code: string, message: string) { super(message); }
}

function argAll(argv: string[], name: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === `--${name}`) {
      const v = argv[i + 1];
      if (!v || v.startsWith("--")) throw new GateRefusal("BAD_ARGUMENT", `--${name} requires a value`);
      out.push(v); i += 1;
    }
  }
  return out;
}
function arg(argv: string[], name: string): string | undefined { return argAll(argv, name)[0]; }
function need(argv: string[], name: string): string {
  const v = arg(argv, name);
  if (!v) throw new GateRefusal("BAD_ARGUMENT", `--${name} is required`);
  return v;
}
function readJson<T>(p: string): T {
  try { return JSON.parse(fs.readFileSync(p, "utf8")) as T; }
  catch (e) { throw new GateRefusal("EVIDENCE_UNREADABLE", `${p}: ${(e as Error).message}`); }
}
function git(repo: string, ...args: string[]): string {
  try {
    return execFileSync("git", ["-C", repo, ...args], {
      encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    }).trim();
  } catch (e) {
    throw new GateRefusal("GIT_UNREADABLE", `git ${args.join(" ")} failed: ${(e as Error).message}`);
  }
}
function gitBlob(repo: string, commit: string, repoPath: string): Uint8Array | null {
  if (path.isAbsolute(repoPath) || repoPath.includes("\0")) return null;
  try {
    return execFileSync("git", ["-C", repo, "show", `${commit}:${repoPath}`], {
      encoding: "buffer", maxBuffer: 64 * 1024 * 1024,
    }) as Buffer;
  } catch { return null; }
}

/** Bind absolute Read paths to the harness-emitted working directory, not a self-reported root. */
function traceRoot(raw: Uint8Array, traceId: string): string {
  const text = Buffer.from(raw).toString("utf8").trim();
  const records: unknown[] = [];
  try {
    if (text.startsWith("[")) {
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed)) throw new Error("trace JSON is not an array");
      records.push(...parsed);
    } else {
      for (const line of text.split("\n")) if (line.trim()) records.push(JSON.parse(line));
    }
  } catch {
    throw new GateRefusal("TRACE_ROOT_UNREADABLE", "cannot derive reviewer cwd from malformed trace");
  }
  const roots = new Set<string>();
  for (const rec of records) {
    if (!rec || typeof rec !== "object") continue;
    const o = rec as Record<string, unknown>;
    if (o["type"] === "system" && o["subtype"] === "init" &&
        o["session_id"] === traceId && typeof o["cwd"] === "string" && o["cwd"] !== "") {
      roots.add((o["cwd"] as string).replace(/\\/g, "/"));
    }
  }
  if (roots.size !== 1) {
    throw new GateRefusal("TRACE_ROOT_NOT_BOUND",
      `expected exactly one harness cwd for trace ${traceId}; found ${roots.size}`);
  }
  return [...roots][0]!;
}

function normalizeRepoPath(p: string): string {
  const n = p.replace(/\\/g, "/").replace(/^\.\//, "");
  if (path.posix.isAbsolute(n) || n === ".." || n.startsWith("../")) {
    throw new GateRefusal("BAD_MIGRATION_PATH", `migration path must be repository-relative: ${p}`);
  }
  return path.posix.normalize(n);
}

function main(argv: string[]): number {
  const recordPath = need(argv, "record");
  const reviewPath = need(argv, "review");
  const tracePath = need(argv, "trace");
  const repo = path.resolve(need(argv, "repo"));
  const target = git(repo, "rev-parse", `${need(argv, "target")}^{commit}`);
  const oldReader = git(repo, "rev-parse", `${need(argv, "old-reader")}^{commit}`);
  const migrations = argAll(argv, "migration").map(normalizeRepoPath);
  if (migrations.length === 0) throw new GateRefusal("NO_PENDING_MIGRATIONS", "no pending migration paths supplied");
  if (new Set(migrations).size !== migrations.length) {
    throw new GateRefusal("DUPLICATE_PENDING_PATH", "pending migration arguments contain a duplicate path");
  }

  const record = readJson<CustodyRecord>(recordPath);
  if (record.instrument !== "review-custody/v1") {
    throw new GateRefusal("BAD_RECORD", "record is not review-custody/v1");
  }
  const approval = record.approval;
  if (!approval || approval.verdict !== "APPROVED") {
    throw new GateRefusal("NO_APPROVED_REVIEW", "record carries no admitted APPROVED review");
  }
  if (record.repo_head !== target) {
    throw new GateRefusal("TARGET_MISMATCH",
      `record is bound to ${record.repo_head}; deployment target is ${target}`);
  }

  const reviewRaw = fs.readFileSync(reviewPath);
  if (sha256(reviewRaw) !== approval.review_sha256) {
    throw new GateRefusal("REVIEW_MISMATCH", "review bytes are not the exact review admitted into this record");
  }
  const review = readJson<Record<string, unknown>>(reviewPath);
  const traceId = typeof review["trace_id"] === "string" ? review["trace_id"] as string : "";
  if (!traceId) throw new GateRefusal("TRACE_NOT_BOUND", "review declares no trace_id");
  const traceRaw = fs.readFileSync(tracePath);
  const root = traceRoot(traceRaw, traceId);
  const coverage = (review["coverage"] as { files?: unknown } | undefined)?.files;
  const witnessed = witnessCoverage(
    { files: coverage, traceId, inlineTrace: review["trace"] },
    traceRaw, STRICT_COVERAGE, root,
  );
  if (witnessed.kind === "refused") {
    throw new GateRefusal(witnessed.code, witnessed.reason);
  }

  const immutableEnv: CustodyEnv = {
    readFile: p => gitBlob(repo, target, p),
    head: () => target,
    resolveCommit: ref => git(repo, "rev-parse", `${ref}^{commit}`),
    changedPaths: (): ChangedPath[] => [],
  };
  const applicability = check(record, immutableEnv, STRICT);
  if (applicability.kind === "refused") throw new GateRefusal(applicability.code, applicability.reason);
  if (applicability.kind === "stale") {
    throw new GateRefusal("APPROVAL_STALE", applicability.problems.join(" | "));
  }

  const covered = new Set(witnessed.files.map(normalizeRepoPath));
  const planPath = normalizeRepoPath(record.plan.path);
  if (!covered.has(planPath)) {
    throw new GateRefusal("PLAN_NOT_WITNESSED",
      `the admitted review did not physically witness a Read of its bound plan: ${planPath}`);
  }
  const observedPending: { path: string; sha256: string }[] = [];
  for (const migration of migrations) {
    if (!migration.startsWith("database/migrations/") || !migration.endsWith(".sql")) {
      throw new GateRefusal("BAD_MIGRATION_PATH", `outside governed migration surface: ${migration}`);
    }
    const bytes = gitBlob(repo, target, migration);
    if (bytes === null) {
      throw new GateRefusal("MIGRATION_NOT_IN_TARGET", `${migration} does not exist at target ${target}`);
    }
    if (!covered.has(migration)) {
      throw new GateRefusal("PENDING_MIGRATION_NOT_WITNESSED",
        `production would execute ${migration}, but the admitted review carries no witnessing Read event for it`);
    }
    observedPending.push({ path: migration, sha256: sha256(bytes) });
  }

  // DEPLOYMENT-SAFETY-03 / STEP 2B. Compatibility lives inside the exact
  // admitted review bytes above. It receives this SAME custody-witnessed corpus;
  // there is no second trace parameter to substitute.
  const compatibilityRaw = review["migration_compatibility"];
  const oldReaderEvidence: { repo_path: string; sha256: string }[] = [];
  if (compatibilityRaw && typeof compatibilityRaw === "object" && !Array.isArray(compatibilityRaw)) {
    const rawEvidence = (compatibilityRaw as Record<string, unknown>)["old_reader_evidence"];
    if (Array.isArray(rawEvidence)) {
      for (const item of rawEvidence) {
        if (!item || typeof item !== "object") continue;
        const rawPath = (item as Record<string, unknown>)["repo_path"];
        if (typeof rawPath !== "string" || rawPath === "") continue;
        const repoPath = normalizeRepoPath(rawPath);
        const bytes = gitBlob(repo, oldReader, repoPath);
        if (bytes !== null) oldReaderEvidence.push({ repo_path: repoPath, sha256: sha256(bytes) });
      }
    }
  }

  const composition = composeMigrationGate(
    {
      applies: true,
      targetReaderCommit: target,
      pending: observedPending,
      witnessedFiles: witnessed.files,
    },
    compatibilityRaw,
    "admitted_review",
    {
      oldReaderCommit: oldReader,
      targetReaderCommit: target,
      pending: observedPending,
      oldReaderEvidence,
    },
  );
  if (composition.kind === "refused") {
    throw new GateRefusal(composition.code, composition.reason);
  }

  console.log("MIGRATION REVIEW + COMPATIBILITY GATE APPLIES");
  console.log(`  target       ${target}`);
  console.log(`  old reader   ${oldReader}`);
  console.log(`  reviewer     ${approval.reviewer}`);
  console.log(`  review sha   ${approval.review_sha256.slice(0, 16)}…`);
  console.log(`  trace id     ${traceId}`);
  console.log(`  coverage     ${witnessed.files.length} witnessed file(s)`);
  console.log(`  migrations   ${migrations.length} pending file(s), all witnessed`);
  for (const m of migrations) console.log(`    ✓ ${m}`);
  console.log("\n⛔ This proves custody and continued applicability, never migration correctness.");
  return 0;
}

try { process.exit(main(process.argv.slice(2))); }
catch (e) {
  const err = e as Error;
  const code = e instanceof GateRefusal ? e.code : "INSTRUMENT_ERROR";
  console.error(`REFUSED [${code}] — ${err.message}`);
  process.exit(e instanceof GateRefusal ? 1 : 2);
}
