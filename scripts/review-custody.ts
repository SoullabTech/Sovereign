#!/usr/bin/env tsx
/**
 * REVIEW CUSTODY  (npm run review:custody -- <mode> [options])
 *
 * An independent review is worth what its BINDING is worth. This instrument holds
 * the binding; it does not perform the review and it confers no authority.
 *
 * Three mechanics, each closing a gap this project has already paid for:
 *
 *   1. APPROVAL IS BOUND TO THE PLAN'S SHA256. Editing the plan invalidates it.
 *   2. INSPECTION IS BOUND TO A COMPLETE CHANGE MANIFEST — tracked, staged AND
 *      untracked. A file that never entered git is exactly the file an inspection
 *      silently misses. A deleted path stays in the manifest as ABSENT.
 *   3. A REVIEW MAY NOT APPROVE ITSELF PAST ITS OWN FINDINGS. APPROVED alongside a
 *      high/medium finding is refused; absent coverage is refused; an empty or
 *      malformed review is a refusal, never a pass. Admission is monotonic.
 *
 * WHAT IT CANNOT DO — stated so no run is mistaken for more than it is:
 *   - It cannot establish that a reviewer's findings or coverage are TRUTHFUL.
 *   - Zero findings is lawful and is not evidence the reviewer was right.
 *   - It runs no proof command and inspects no code.
 *   - THREE boundaries, never merged: `witness` refuses an UNWITNESSED COVERAGE CLAIM ·
 *     `admit` refuses THE RECORD · `check` refuses THE CONTINUED APPLICABILITY of an
 *     admitted approval. A manifest movement is a `check` refusal, never an `admit`
 *     refusal — the precheck-versus-mutation distinction the S3 lane paid to learn.
 *   - Coverage is MECHANICALLY DERIVED from the reviewer's execution trace, never
 *     self-reported. It bounds coverage FROM ABOVE only: a read event proves a file was
 *     opened, never that it was understood.
 *
 * ⛔ CANDIDATE INSTRUMENT, UNWIRED. It gates nothing until a founder act wires it
 *    into a named acceptance law.
 *
 * ⭐ All custody decisions live in `STRICT` (review-custody-core.ts). This shell
 *    hard-codes it and accepts no override: no flag in the shipped path can select
 *    a weaker rule. The seam exists only so the falsifier suite can run the same
 *    laws against deliberately wrong implementations.
 *
 * Usage:
 *   npx tsx scripts/review-custody.ts bind   --plan PATH [--base REF] --out RECORD [--force]
 *   npx tsx scripts/review-custody.ts admit  --record RECORD --review REVIEW.json --trace TRACE
 *   npx tsx scripts/review-custody.ts check  --record RECORD
 *
 * Exit codes: 0 lawful state · 1 refusal / unlawful state · 2 instrument error.
 *
 * @see tests/constitutional/review-custody/  (falsifiers · defeat candidates · matrix)
 * @see docs/programme/DEV_LANE_PROVIDER_EXPOSURE_FINDING_2026-09-20.md
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  STRICT, admit, bind, check,
  type ChangedPath, type CustodyEnv, type CustodyRecord,
} from "./review-custody-core";
import { STRICT_COVERAGE, witnessCoverage } from "./review-custody-coverage";

class Broken extends Error {}

function git(...args: string[]): string {
  try {
    return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch (e) {
    throw new Broken(`git ${args.join(" ")} failed: ${(e as Error).message}`);
  }
}

const realEnv: CustodyEnv = {
  readFile: p => {
    try {
      const st = fs.statSync(p);
      if (!st.isFile()) return null;
      return fs.readFileSync(p);
    } catch {
      return null;
    }
  },
  head: () => git("rev-parse", "HEAD"),
  resolveCommit: ref => git("rev-parse", `${ref}^{commit}`),
  changedPaths: (): ChangedPath[] => {
    const out: ChangedPath[] = [];
    for (const line of git("status", "--porcelain=v1", "--untracked-files=all").split("\n")) {
      if (!line.trim()) continue;
      const untracked = line.startsWith("??");
      // Rename/copy entries read "old -> new"; both sides are part of the change.
      for (const side of line.slice(3).split(" -> ")) {
        const cleaned = side.replace(/^"(.*)"$/, "$1").trim();
        if (cleaned) out.push({ path: cleaned, untracked });
      }
    }
    return out;
  },
};

function arg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  if (v === undefined || v.startsWith("--")) throw new Broken(`--${name} requires a value`);
  return v;
}
function need(argv: string[], name: string): string {
  const v = arg(argv, name);
  if (v === undefined) throw new Broken(`--${name} is required`);
  return v;
}

function loadRecord(p: string): CustodyRecord {
  const buf = realEnv.readFile(p);
  if (buf === null) throw new Broken(`custody record not found: ${p}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(buf).toString("utf8"));
  } catch {
    throw new Broken(`custody record is not valid JSON: ${p}`);
  }
  const r = parsed as CustodyRecord;
  if (!r || r.instrument !== "review-custody/v1") throw new Broken(`not a review-custody/v1 record: ${p}`);
  return r;
}

function save(p: string, r: CustodyRecord): void {
  fs.mkdirSync(path.dirname(path.resolve(p)), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(r, null, 2)}\n`, "utf8");
}

const now = (): string => new Date().toISOString();

function main(argvAll: string[]): number {
  const [mode, ...argv] = argvAll;

  if (mode === "bind") {
    const planPath = need(argv, "plan");
    const out = need(argv, "out");
    if (fs.existsSync(out) && !argv.includes("--force")) {
      console.error(`REFUSED — custody record already exists: ${out}. Re-binding discards a recorded approval; pass --force to say so deliberately.`);
      return 1;
    }
    const r = bind(realEnv, STRICT, { planPath, baseRef: arg(argv, "base") ?? "HEAD", now: now() });
    if (r.kind === "refused") {
      console.error(`REFUSED [${r.code}] — ${r.reason}`);
      return 1;
    }
    save(out, r.record);
    console.log("BOUND");
    console.log(`  plan            ${planPath}`);
    console.log(`  plan sha256     ${r.record.plan.sha256}`);
    console.log(`  base commit     ${r.record.base.commit.slice(0, 9)} (${r.record.base.ref})`);
    console.log(`  change manifest ${r.record.tree.paths} path(s) · ${r.record.tree.fingerprint.slice(0, 16)}…`);
    console.log(`  record          ${out}`);
    console.log("\n⛔ BOUND IS NOT APPROVED. Nothing is authorized by this record alone.");
    return 0;
  }

  if (mode === "admit") {
    const recordPath = need(argv, "record");
    const reviewPath = need(argv, "review");
    const record = loadRecord(recordPath);
    const raw = realEnv.readFile(reviewPath);
    if (raw === null) throw new Broken(`review file not found: ${reviewPath}`);

    // ---- boundary 1: witness the coverage claim before admitting the record ----
    const tracePath = need(argv, "trace");
    const traceRaw = realEnv.readFile(tracePath);
    if (traceRaw === null) throw new Broken(`execution trace not found: ${tracePath}`);
    let parsedReview: Record<string, unknown>;
    try {
      parsedReview = JSON.parse(Buffer.from(raw).toString("utf8")) as Record<string, unknown>;
    } catch {
      console.error("REFUSED [MALFORMED_REVIEW] — review is not valid JSON.");
      return 1;
    }
    const repoRoot = path.resolve(arg(argv, "repo-root") ?? process.cwd()).replace(/\\/g, "/");
    const cov = (parsedReview["coverage"] as { files?: unknown } | undefined)?.files;
    const w = witnessCoverage(
      { files: cov, traceId: parsedReview["trace_id"], inlineTrace: parsedReview["trace"] },
      traceRaw, STRICT_COVERAGE, repoRoot,
    );
    if (w.kind === "refused") {
      console.error(`REFUSED [${w.code}] — ${w.reason}`);
      return 1;
    }
    console.log(`COVERAGE WITNESSED — ${w.files.length} attested file(s) carry a read event`);
    if (w.undisclosed.length > 0) {
      console.log(`  undisclosed reads (recorded, not refused): ${w.undisclosed.length}`);
    }
    if (w.scopes.length > 0) console.log(`  search scopes (witness nothing): ${w.scopes.length}`);
    console.log("  ⛔ Bounds coverage from above only: a read proves the file was opened, not understood.\n");

    // ---- boundary 2: admit the record ----
    const r = admit(record, raw, STRICT, now());
    if (r.kind === "refused") {
      console.error(`REFUSED [${r.code}] — ${r.reason}`);
      return 1;
    }
    if (r.kind === "already") {
      const a = r.record.approval;
      console.log(`ALREADY — this exact review was admitted at ${a?.admitted_at} (verdict ${a?.verdict}). Original timestamp preserved.`);
      return 0;
    }
    save(recordPath, r.record);
    const a = r.record.approval as NonNullable<CustodyRecord["approval"]>;
    console.log(`ADMITTED — verdict ${r.verdict}`);
    console.log(`  reviewer     ${a.reviewer}`);
    console.log(`  findings     high ${a.findings.high} · medium ${a.findings.medium} · low ${a.findings.low}`);
    console.log(`  coverage     ${a.coverage_files} file(s) named as inspected`);
    console.log(`  limitations  ${a.limitations} stated`);
    console.log(`  review sha   ${a.review_sha256.slice(0, 16)}…`);
    if (a.limitations === 0) {
      console.log("\n⚠️  The reviewer asserted NO limitations. That is a claim about completeness; read it as one.");
    }
    if (r.verdict === "APPROVED" && a.findings.high + a.findings.medium + a.findings.low === 0) {
      console.log("\n⚠️  Zero findings is a lawful outcome and is NOT evidence the reviewer was right.");
    }
    if (r.verdict !== "APPROVED") {
      console.log(`\n⛔ ${r.verdict} is recorded as-is. It is not converted to approval by any later step.`);
      return 1;
    }
    return 0;
  }

  if (mode === "check") {
    const record = loadRecord(need(argv, "record"));
    const r = check(record, realEnv, STRICT);
    if (r.kind === "refused") {
      console.error(`REFUSED [${r.code}] — ${r.reason}`);
      return 1;
    }
    if (r.kind === "stale") {
      console.error("APPROVAL NO LONGER APPLIES");
      for (const p of r.problems) console.error(`  ⛔ ${p}`);
      return 1;
    }
    console.log("APPROVAL APPLIES");
    console.log(`  verdict      ${r.approval.verdict} by ${r.approval.reviewer} at ${r.approval.admitted_at}`);
    console.log(`  plan         ${record.plan.path} @ ${record.plan.sha256.slice(0, 16)}…`);
    console.log(`  manifest     ${r.paths} path(s) unchanged since inspection`);
    console.log("\n⛔ This states that the record is intact — never that the implementation is correct.");
    return 0;
  }

  console.error("usage: review-custody.ts <bind|admit|check> [options]  (see file header)");
  return 2;
}

try {
  process.exit(main(process.argv.slice(2)));
} catch (e) {
  console.error(`INSTRUMENT ERROR — ${(e as Error).message}`);
  process.exit(2);
}
