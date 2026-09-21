#!/usr/bin/env tsx
/**
 * DEPLOYMENT-SAFETY-03 · STEP 2B — COMPATIBILITY GATE COMPOSITION (CLI)
 *
 * Joins two independently admitted review acts over one exact deployment:
 *
 *   migration custody      delegated to scripts/review-custody-migration-gate.ts
 *                          (run as a subprocess — never re-implemented here, so
 *                           this gate cannot drift from that gate's law)
 *   compatibility custody  checked in-process against the same frozen cores
 *
 * ⛔ Proves that two separate claims remain jointly applicable to one target.
 *    Never proves either claim is semantically true.
 * ⛔ Authorizes nothing about migrate/swap ORDERING. That is a separate act.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { STRICT, check, sha256, type ChangedPath, type CustodyEnv, type CustodyRecord } from "./review-custody-core";
import { STRICT_COVERAGE, witnessCoverage } from "./review-custody-coverage";
import { STRICT_COMPATIBILITY, evaluateCompatibility, type CompatibilityAttestation } from "./migration-compatibility-core";
import { STRICT_COMPOSITION, evaluateComposition, type AdmittedReview } from "./migration-compatibility-gate-core";

class Refusal extends Error { constructor(readonly code: string, m: string) { super(m); } }

const argAll = (a: string[], n: string): string[] => {
  const out: string[] = [];
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === `--${n}`) {
      const v = a[i + 1];
      if (!v || v.startsWith("--")) throw new Refusal("BAD_ARGUMENT", `--${n} requires a value`);
      out.push(v); i += 1;
    }
  }
  return out;
};
const arg = (a: string[], n: string): string | undefined => argAll(a, n)[0];
const need = (a: string[], n: string): string => {
  const v = arg(a, n);
  if (!v) throw new Refusal("BAD_ARGUMENT", `--${n} is required`);
  return v;
};
function readJson<T>(p: string): T {
  try { return JSON.parse(fs.readFileSync(p, "utf8")) as T; }
  catch (e) { throw new Refusal("EVIDENCE_UNREADABLE", `${p}: ${(e as Error).message}`); }
}
function git(repo: string, ...a: string[]): string {
  try { return execFileSync("git", ["-C", repo, ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim(); }
  catch (e) { throw new Refusal("GIT_UNREADABLE", `git ${a.join(" ")}: ${(e as Error).message}`); }
}
function gitBlob(repo: string, commit: string, p: string): Buffer | null {
  if (path.isAbsolute(p) || p.includes("\0")) return null;
  try { return execFileSync("git", ["-C", repo, "show", `${commit}:${p}`], { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 }) as Buffer; }
  catch { return null; }
}
function traceRoot(raw: Uint8Array, traceId: string): string {
  const text = Buffer.from(raw).toString("utf8").trim();
  const records: unknown[] = [];
  try {
    if (text.startsWith("[")) {
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed)) throw new Error("trace JSON is not an array");
      records.push(...parsed);
    } else for (const l of text.split("\n")) if (l.trim()) records.push(JSON.parse(l));
  } catch { throw new Refusal("TRACE_ROOT_UNREADABLE", "cannot derive reviewer cwd from malformed trace"); }
  const roots = new Set<string>();
  for (const rec of records) {
    if (!rec || typeof rec !== "object") continue;
    const o = rec as Record<string, unknown>;
    if (o["type"] === "system" && o["subtype"] === "init" && o["session_id"] === traceId &&
        typeof o["cwd"] === "string" && o["cwd"] !== "") roots.add((o["cwd"] as string).replace(/\\/g, "/"));
  }
  if (roots.size !== 1) throw new Refusal("TRACE_ROOT_NOT_BOUND", `expected one harness cwd for trace ${traceId}; found ${roots.size}`);
  return [...roots][0]!;
}
const norm = (p: string): string => {
  const n = p.replace(/\\/g, "/").replace(/^\.\//, "");
  if (path.posix.isAbsolute(n) || n === ".." || n.startsWith("../")) {
    throw new Refusal("BAD_MIGRATION_PATH", `path must be repository-relative: ${p}`);
  }
  return path.posix.normalize(n);
};

/** Admit one custody record and return its witnessed corpus + admission identity. */
function admitReview(
  role: AdmittedReview["role"], repo: string, target: string,
  recordPath: string, reviewPath: string, tracePath: string,
): { review: AdmittedReview; witnessed: string[] } {
  const record = readJson<CustodyRecord>(recordPath);
  if (record.instrument !== "review-custody/v1") throw new Refusal("BAD_RECORD", `${role} record is not review-custody/v1`);
  const approval = record.approval;
  if (!approval || approval.verdict !== "APPROVED") throw new Refusal("NO_APPROVED_REVIEW", `${role} record carries no admitted APPROVED review`);

  const reviewRaw = fs.readFileSync(reviewPath);
  const reviewSha256 = sha256(reviewRaw);
  if (reviewSha256 !== approval.review_sha256) {
    throw new Refusal("REVIEW_MISMATCH", `${role} review bytes are not the exact review admitted into that record`);
  }
  const review = readJson<Record<string, unknown>>(reviewPath);
  const traceId = typeof review["trace_id"] === "string" ? review["trace_id"] : "";
  if (!traceId) throw new Refusal("TRACE_NOT_BOUND", `${role} review declares no trace_id`);

  const traceRaw = fs.readFileSync(tracePath);
  const w = witnessCoverage(
    { files: (review["coverage"] as { files?: unknown } | undefined)?.files, traceId, inlineTrace: review["trace"] },
    traceRaw, STRICT_COVERAGE, traceRoot(traceRaw, traceId),
  );
  if (w.kind === "refused") throw new Refusal(w.code, `${role}: ${w.reason}`);

  const env: CustodyEnv = {
    readFile: p => gitBlob(repo, target, p),
    head: () => target,
    resolveCommit: r => git(repo, "rev-parse", `${r}^{commit}`),
    changedPaths: (): ChangedPath[] => [],
  };
  const applied = check(record, env, STRICT);
  const applicability: AdmittedReview["applicability"] =
    applied.kind === "applies" ? "applies" : applied.kind === "stale" ? "stale" : "refused";

  return {
    review: { role, reviewSha256, traceId, reviewer: approval.reviewer, boundTarget: record.repo_head, applicability },
    witnessed: w.files.map(norm),
  };
}

function main(argv: string[]): number {
  const repo = path.resolve(need(argv, "repo"));
  const target = git(repo, "rev-parse", `${need(argv, "target")}^{commit}`);
  const oldReaderCommit = git(repo, "rev-parse", `${need(argv, "old-reader")}^{commit}`);
  const migrations = [...new Set(argAll(argv, "migration").map(norm))].sort();

  // ---- migration custody: delegated to the real gate, never re-implemented ----
  const gate = spawnSync("npx", ["tsx", path.join(__dirname, "review-custody-migration-gate.ts"),
    "--repo", repo, "--target", target,
    "--record", need(argv, "record"), "--review", need(argv, "review"), "--trace", need(argv, "trace"),
    ...migrations.flatMap(m => ["--migration", m])], { encoding: "utf8" });
  if (gate.status === 2) throw new Refusal("MIGRATION_GATE_INSTRUMENT_ERROR", (gate.stderr || "").trim());
  const migrationApplies = gate.status === 0;

  const mig = admitReview("migration", repo, target, need(argv, "record"), need(argv, "review"), need(argv, "trace"));
  const migrationReview: AdmittedReview = {
    ...mig.review,
    applicability: migrationApplies ? mig.review.applicability : "refused",
  };

  // ---- compatibility custody: its own record, review, trace and applicability ----
  const compat = admitReview("compatibility", repo, target,
    need(argv, "compat-record"), need(argv, "compat-review"), need(argv, "compat-trace"));

  // ---- compatibility attestation over observations taken from the right trees ----
  const attestation = readJson<CompatibilityAttestation>(need(argv, "attestation"));
  const pending = migrations.map(p => {
    const blob = gitBlob(repo, target, p);
    if (blob === null) throw new Refusal("MIGRATION_NOT_IN_TARGET", `${p} does not exist at target ${target}`);
    return { path: p, sha256: sha256(blob) };
  });
  const evidence = (Array.isArray(attestation.old_reader_evidence) ? attestation.old_reader_evidence : [])
    .map(e => {
      // Bytes come from the OLD READER commit. Reading them at target would be vacuous.
      const blob = gitBlob(repo, oldReaderCommit, e.repo_path);
      if (blob === null) throw new Refusal("OLD_READER_EVIDENCE_MISSING", `${e.repo_path} does not exist at old reader ${oldReaderCommit}`);
      return { repo_path: e.repo_path, sha256: sha256(blob) };
    });

  const compatibility = evaluateCompatibility(attestation, {
    oldReaderCommit, targetReaderCommit: target, pending,
    oldReaderEvidence: evidence,
    witnessedFiles: compat.witnessed,   // the COMPATIBILITY review's own corpus
  }, STRICT_COMPATIBILITY);

  // ---- composition ----
  const outcome = evaluateComposition({
    target, oldReaderCommit,
    migrationReview, compatibilityReview: compat.review,
    gatedPending: migrations,
    compatibility: compatibility.kind === "applies" ? { kind: "applies" } : { kind: "refused", code: compatibility.code },
    oldReaderEvidenceTree: { kind: "commit", commit: oldReaderCommit },
    compatibilityWitnessSource: { kind: "review", role: "compatibility" },
  }, STRICT_COMPOSITION);

  if (outcome.kind === "refused") {
    console.error(`REFUSED [${outcome.code}] — ${outcome.reason}`);
    if (!migrationApplies && (gate.stderr || "").trim()) console.error(`  migration gate: ${(gate.stderr || "").trim()}`);
    return 1;
  }

  console.log("MIGRATION COMPATIBILITY GATE APPLIES");
  console.log(`  target           ${target}`);
  console.log(`  old reader       ${oldReaderCommit}`);
  console.log(`  migration review ${migrationReview.reviewer} · trace ${migrationReview.traceId}`);
  console.log(`  compat review    ${compat.review.reviewer} · trace ${compat.review.traceId}`);
  console.log(`  admissions       2 separately admitted claims, both applicable at this target`);
  console.log(`  migrations       ${migrations.length} pending file(s), all witnessed by both reviews`);
  for (const m of migrations) console.log(`    ✓ ${m}`);
  console.log(`  old-reader evid  ${evidence.length} file(s), bytes read at ${oldReaderCommit.slice(0, 12)}…`);
  console.log("\n⛔ Proves joint custody and continued applicability — never migration correctness,");
  console.log("⛔ and authorizes nothing about migrate/swap ordering.");
  return 0;
}

try { process.exit(main(process.argv.slice(2))); }
catch (e) {
  const code = e instanceof Refusal ? e.code : "INSTRUMENT_ERROR";
  console.error(`REFUSED [${code}] — ${(e as Error).message}`);
  process.exit(e instanceof Refusal ? 1 : 2);
}
