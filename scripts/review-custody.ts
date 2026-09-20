#!/usr/bin/env tsx
/**
 * REVIEW CUSTODY  (npm run review:custody -- <mode> [options])
 *
 * An independent review is worth what its BINDING is worth. This instrument
 * holds the binding; it does not perform the review and it confers no authority.
 *
 * Three mechanics, each closing a gap this project has already paid for:
 *
 *   1. APPROVAL IS BOUND TO THE PLAN'S SHA256. Editing the plan invalidates the
 *      approval. (The freeze-guard law, mechanized: "lawful is implementation
 *      fails suite -> repair the implementation"; forbidden is reinterpreting the
 *      contract after the fact.)
 *   2. INSPECTION IS BOUND TO A COMPLETE CHANGE MANIFEST — tracked, staged AND
 *      untracked. A file that never entered git is exactly the file an
 *      inspection silently misses.
 *   3. A REVIEW MAY NOT APPROVE ITSELF PAST ITS OWN FINDINGS. APPROVED alongside
 *      a high/medium finding is refused. Absent coverage is refused. An empty or
 *      malformed review file is a refusal, never a pass.
 *
 * WHAT IT CANNOT DO — stated here so no run is mistaken for more than it is:
 *   - It cannot establish that a reviewer's findings or coverage are TRUTHFUL.
 *     A clean structured result is not evidence the reviewer was right.
 *   - Zero findings is a lawful outcome. A large count is not a quality score.
 *   - It runs no proof command and inspects no code. The coordinating session or
 *     the founder performs the review; this instrument only adjudicates the
 *     record and refuses unlawful states.
 *   - Its refusals are custody refusals. They say a record is inadmissible,
 *     never that an implementation is correct.
 *
 * ⛔ CANDIDATE INSTRUMENT. No lane is opened by its presence and it gates
 *    nothing until a founder act wires it into a named acceptance law.
 *
 * Usage:
 *   npx tsx scripts/review-custody.ts bind   --plan PATH [--base REF] --out RECORD [--force]
 *   npx tsx scripts/review-custody.ts admit  --record RECORD --review REVIEW.json
 *   npx tsx scripts/review-custody.ts check  --record RECORD
 *
 * @see docs/programme/DEV_LANE_PROVIDER_EXPOSURE_FINDING_2026-09-20.md
 *
 * Exit codes: 0 lawful state · 1 refusal / unlawful state · 2 instrument error.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const SEVERITIES = ["high", "medium", "low"] as const;
const VERDICTS = ["APPROVED", "REVISE", "BLOCKED"] as const;
type Severity = (typeof SEVERITIES)[number];
type Verdict = (typeof VERDICTS)[number];

type Finding = { id: string; severity: Severity; path: string; evidence: string; fix: string };
type Approval = {
  admitted_at: string;
  verdict: Verdict;
  reviewer: string;
  plan_sha256: string;
  review_sha256: string;
  findings: Record<Severity, number>;
  coverage_files: number;
  limitations: number;
};
type Record_ = {
  instrument: "review-custody/v1";
  bound_at: string;
  repo_head: string;
  plan: { path: string; sha256: string; bytes: number };
  base: { ref: string; commit: string };
  tree: { fingerprint: string; paths: number };
  approval: Approval | null;
};

class Refusal extends Error {}
class Broken extends Error {}

const sha256 = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");

function git(...args: string[]): string {
  try {
    return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch (e) {
    throw new Broken(`git ${args.join(" ")} failed: ${(e as Error).message}`);
  }
}

/**
 * Complete change manifest relative to HEAD: staged, unstaged and UNTRACKED.
 * A deleted path is recorded as ABSENT rather than dropped, so a deletion cannot
 * pass as an unchanged tree.
 */
function fingerprintTree(): { fingerprint: string; paths: number } {
  const changed = new Set<string>();
  for (const line of git("status", "--porcelain=v1", "--untracked-files=all").split("\n")) {
    if (!line.trim()) continue;
    const p = line.slice(3).trim();
    // Rename/copy entries read as "old -> new"; both sides are part of the change.
    for (const side of p.split(" -> ")) {
      const cleaned = side.replace(/^"(.*)"$/, "$1").trim();
      if (cleaned) changed.add(cleaned);
    }
  }
  const lines: string[] = [];
  for (const p of [...changed].sort()) {
    let hash = "ABSENT";
    try {
      const st = fs.statSync(p);
      if (st.isFile()) hash = sha256(fs.readFileSync(p));
      else if (st.isDirectory()) hash = "DIR";
    } catch {
      hash = "ABSENT";
    }
    lines.push(`${p}\u0000${hash}`);
  }
  return { fingerprint: sha256(lines.join("\n")), paths: lines.length };
}

function readPlan(planPath: string): { sha256: string; bytes: number } {
  if (!fs.existsSync(planPath)) throw new Broken(`plan not found: ${planPath}`);
  const buf = fs.readFileSync(planPath);
  if (buf.byteLength === 0) throw new Refusal(`plan is empty: ${planPath}. An empty plan cannot be reviewed.`);
  return { sha256: sha256(buf), bytes: buf.byteLength };
}

function arg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  if (v === undefined || v.startsWith("--")) throw new Broken(`--${name} requires a value`);
  return v;
}

function require_(argv: string[], name: string): string {
  const v = arg(argv, name);
  if (v === undefined) throw new Broken(`--${name} is required`);
  return v;
}

function loadRecord(p: string): Record_ {
  if (!fs.existsSync(p)) throw new Broken(`custody record not found: ${p}`);
  const raw = fs.readFileSync(p, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Broken(`custody record is not valid JSON: ${p}`);
  }
  const r = parsed as Record_;
  if (!r || r.instrument !== "review-custody/v1") throw new Broken(`not a review-custody/v1 record: ${p}`);
  return r;
}

const writeRecord = (p: string, r: Record_): void => {
  fs.mkdirSync(path.dirname(path.resolve(p)), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(r, null, 2)}\n`, "utf8");
};

// ---------------------------------------------------------------- bind

function bind(argv: string[]): number {
  const planPath = require_(argv, "plan");
  const out = require_(argv, "out");
  const baseRef = arg(argv, "base") ?? "HEAD";
  if (fs.existsSync(out) && !argv.includes("--force")) {
    throw new Refusal(`custody record already exists: ${out}. Re-binding discards a recorded approval; pass --force to say so deliberately.`);
  }
  const plan = readPlan(planPath);
  const tree = fingerprintTree();
  const record: Record_ = {
    instrument: "review-custody/v1",
    bound_at: new Date().toISOString(),
    repo_head: git("rev-parse", "HEAD"),
    plan: { path: planPath, sha256: plan.sha256, bytes: plan.bytes },
    base: { ref: baseRef, commit: git("rev-parse", `${baseRef}^{commit}`) },
    tree,
    approval: null,
  };
  writeRecord(out, record);
  console.log("BOUND");
  console.log(`  plan            ${planPath}`);
  console.log(`  plan sha256     ${plan.sha256}`);
  console.log(`  base commit     ${record.base.commit.slice(0, 9)} (${baseRef})`);
  console.log(`  change manifest ${tree.paths} path(s) · ${tree.fingerprint.slice(0, 16)}…`);
  console.log(`  record          ${out}`);
  console.log("\n⛔ BOUND IS NOT APPROVED. Nothing is authorized by this record alone.");
  return 0;
}

// ---------------------------------------------------------------- admit

function validateReview(raw: Buffer, record: Record_): { verdict: Verdict; reviewer: string; findings: Finding[]; coverageFiles: string[]; limitations: string[] } {
  if (raw.byteLength === 0) throw new Refusal("review file is empty. An empty output is never an approval.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new Refusal("review file is not valid JSON. A malformed review is a refusal, not a pass.");
  }
  const r = parsed as {
    verdict?: unknown; plan_sha256?: unknown; reviewer?: unknown; summary?: unknown;
    findings?: unknown; coverage?: { files?: unknown }; limitations?: unknown;
  };

  if (typeof r.verdict !== "string" || !(VERDICTS as readonly string[]).includes(r.verdict)) {
    throw new Refusal(`verdict must be one of ${VERDICTS.join(" | ")}; got ${JSON.stringify(r.verdict)}`);
  }
  const verdict = r.verdict as Verdict;

  if (typeof r.plan_sha256 !== "string" || r.plan_sha256.length === 0) {
    throw new Refusal("review must carry plan_sha256 — the plan it actually reviewed.");
  }
  if (r.plan_sha256 !== record.plan.sha256) {
    throw new Refusal(`review is of a DIFFERENT PLAN.\n  record  ${record.plan.sha256}\n  review  ${r.plan_sha256}\nA review cannot be stapled to a plan it did not read.`);
  }
  if (typeof r.reviewer !== "string" || r.reviewer.trim() === "") {
    throw new Refusal("review must name its reviewer. An unattributed review has no custody.");
  }
  if (typeof r.summary !== "string" || r.summary.trim() === "") {
    throw new Refusal("review must carry a non-empty summary.");
  }
  if (!Array.isArray(r.findings)) throw new Refusal("findings must be an array (may be empty).");
  if (!Array.isArray(r.limitations)) {
    throw new Refusal("limitations must be present as an array. Asserting none is a claim; omitting it is not.");
  }
  const coverageFiles = r.coverage?.files;
  if (!Array.isArray(coverageFiles) || coverageFiles.length === 0) {
    throw new Refusal("coverage.files must name what was actually inspected. Absent coverage is refused: an instrument can satisfy its remaining questions by forgetting to ask the difficult ones.");
  }

  const findings: Finding[] = [];
  const seen = new Set<string>();
  for (const [i, f0] of (r.findings as unknown[]).entries()) {
    const f = f0 as Partial<Finding>;
    if (typeof f.id !== "string" || f.id.trim() === "") throw new Refusal(`finding #${i + 1} has no id.`);
    if (seen.has(f.id)) throw new Refusal(`duplicate finding id: ${f.id}`);
    seen.add(f.id);
    if (typeof f.severity !== "string" || !(SEVERITIES as readonly string[]).includes(f.severity)) {
      throw new Refusal(`finding ${f.id}: severity must be one of ${SEVERITIES.join(" | ")}`);
    }
    if (typeof f.evidence !== "string" || f.evidence.trim() === "") {
      throw new Refusal(`finding ${f.id}: evidence is required. An assertion without evidence is not a finding.`);
    }
    findings.push({
      id: f.id,
      severity: f.severity as Severity,
      path: typeof f.path === "string" ? f.path : "",
      evidence: f.evidence,
      fix: typeof f.fix === "string" ? f.fix : "",
    });
  }

  const material = findings.filter(f => f.severity === "high" || f.severity === "medium");
  if (verdict === "APPROVED" && material.length > 0) {
    throw new Refusal(
      `APPROVED is refused alongside ${material.length} material finding(s): ${material.map(f => `${f.id}(${f.severity})`).join(", ")}.\n` +
      "A review may not approve itself past its own findings. Disposition them, then re-review.",
    );
  }
  return { verdict, reviewer: r.reviewer, findings, coverageFiles: coverageFiles as string[], limitations: r.limitations as string[] };
}

function admit(argv: string[]): number {
  const recordPath = require_(argv, "record");
  const reviewPath = require_(argv, "review");
  const record = loadRecord(recordPath);
  if (!fs.existsSync(reviewPath)) throw new Broken(`review file not found: ${reviewPath}`);
  const raw = fs.readFileSync(reviewPath);
  const reviewSha = sha256(raw);

  // Monotonic admission: same review is idempotent, a different one is a conflict.
  if (record.approval) {
    if (record.approval.review_sha256 === reviewSha) {
      console.log(`ALREADY — this exact review was admitted at ${record.approval.admitted_at} (verdict ${record.approval.verdict}). Original timestamp preserved.`);
      return 0;
    }
    throw new Refusal(`CONFLICT — this record already carries an admitted review (${record.approval.verdict}, ${record.approval.admitted_at}). A second, different review may not overwrite it. Bind a new record.`);
  }

  const v = validateReview(raw, record);
  const counts: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
  for (const f of v.findings) counts[f.severity] += 1;

  record.approval = {
    admitted_at: new Date().toISOString(),
    verdict: v.verdict,
    reviewer: v.reviewer,
    plan_sha256: record.plan.sha256,
    review_sha256: reviewSha,
    findings: counts,
    coverage_files: v.coverageFiles.length,
    limitations: v.limitations.length,
  };
  writeRecord(recordPath, record);

  console.log(`ADMITTED — verdict ${v.verdict}`);
  console.log(`  reviewer     ${v.reviewer}`);
  console.log(`  findings     high ${counts.high} · medium ${counts.medium} · low ${counts.low}`);
  console.log(`  coverage     ${v.coverageFiles.length} file(s) named as inspected`);
  console.log(`  limitations  ${v.limitations.length} stated`);
  console.log(`  review sha   ${reviewSha.slice(0, 16)}…`);
  if (v.limitations.length === 0) {
    console.log("\n⚠️  The reviewer asserted NO limitations. That is a claim about completeness; read it as one.");
  }
  if (v.verdict === "APPROVED" && v.findings.length === 0) {
    console.log("\n⚠️  Zero findings is a lawful outcome and is NOT evidence the reviewer was right.");
  }
  if (v.verdict !== "APPROVED") {
    console.log(`\n⛔ ${v.verdict} is recorded as-is. It is not converted to approval by any later step.`);
    return 1;
  }
  return 0;
}

// ---------------------------------------------------------------- check

function check(argv: string[]): number {
  const recordPath = require_(argv, "record");
  const record = loadRecord(recordPath);
  if (!record.approval) throw new Refusal(`BOUND, NOT APPROVED — ${recordPath} carries no admitted review.`);
  if (record.approval.verdict !== "APPROVED") {
    throw new Refusal(`recorded verdict is ${record.approval.verdict}, not APPROVED.`);
  }
  const problems: string[] = [];
  const plan = readPlan(record.plan.path);
  if (plan.sha256 !== record.approval.plan_sha256) {
    problems.push(`PLAN CHANGED — approval applies to ${record.approval.plan_sha256.slice(0, 16)}…, plan is now ${plan.sha256.slice(0, 16)}…. The approval is INVALID for the current plan.`);
  }
  const tree = fingerprintTree();
  if (tree.fingerprint !== record.tree.fingerprint) {
    problems.push(`TREE MOVED — the change manifest is no longer the one inspected (${record.tree.paths} path(s) → ${tree.paths}). Later code changes need another inspection.`);
  }
  const head = git("rev-parse", "HEAD");
  if (head !== record.repo_head) {
    problems.push(`HEAD MOVED — bound at ${record.repo_head.slice(0, 9)}, now ${head.slice(0, 9)}.`);
  }
  if (problems.length > 0) {
    console.error("APPROVAL NO LONGER APPLIES");
    for (const p of problems) console.error(`  ⛔ ${p}`);
    return 1;
  }
  console.log("APPROVAL APPLIES");
  console.log(`  verdict      ${record.approval.verdict} by ${record.approval.reviewer} at ${record.approval.admitted_at}`);
  console.log(`  plan         ${record.plan.path} @ ${record.plan.sha256.slice(0, 16)}…`);
  console.log(`  manifest     ${tree.paths} path(s) unchanged since inspection`);
  console.log("\n⛔ This states that the record is intact — never that the implementation is correct.");
  return 0;
}

// ---------------------------------------------------------------- main

function main(): number {
  const [mode, ...argv] = process.argv.slice(2);
  switch (mode) {
    case "bind": return bind(argv);
    case "admit": return admit(argv);
    case "check": return check(argv);
    default:
      console.error("usage: review-custody.ts <bind|admit|check> [options]  (see file header)");
      return 2;
  }
}

try {
  process.exit(main());
} catch (e) {
  if (e instanceof Refusal) {
    console.error(`REFUSED — ${e.message}`);
    process.exit(1);
  }
  console.error(`INSTRUMENT ERROR — ${(e as Error).message}`);
  process.exit(2);
}
