/**
 * REVIEW CUSTODY — PURE CORE
 *
 * Every custody decision this instrument makes is reached through `CustodyDecisions`.
 * `STRICT` is the one lawful setting; the CLI hard-codes it and accepts no override,
 * so no flag in the shipped path can select a weaker rule.
 *
 * The seam exists for ONE reason: a falsifier suite must be able to run the same
 * laws against deliberately WRONG custody implementations and prove it kills each
 * one. See tests/constitutional/review-custody/.
 *
 * ⛔ No IO here: the environment is injected. ⛔ No process.exit. ⛔ No authority —
 * this core decides whether a RECORD is admissible, never whether an implementation
 * is correct, and it cannot establish that a reviewer's findings are truthful.
 *
 * @see docs/programme/DEV_LANE_PROVIDER_EXPOSURE_FINDING_2026-09-20.md
 */
import { createHash } from "node:crypto";

export const SEVERITIES = ["high", "medium", "low"] as const;
export const VERDICTS = ["APPROVED", "REVISE", "BLOCKED"] as const;
export type Severity = (typeof SEVERITIES)[number];
export type Verdict = (typeof VERDICTS)[number];

export type Finding = { id: string; severity: Severity; path: string; evidence: string; fix: string };

export type Approval = {
  admitted_at: string;
  verdict: Verdict;
  reviewer: string;
  plan_sha256: string;
  review_sha256: string;
  findings: Record<Severity, number>;
  coverage_files: number;
  limitations: number;
};

export type CustodyRecord = {
  instrument: "review-custody/v1";
  bound_at: string;
  repo_head: string;
  plan: { path: string; sha256: string; bytes: number };
  base: { ref: string; commit: string };
  tree: { fingerprint: string; paths: number };
  approval: Approval | null;
};

export type ChangedPath = { path: string; untracked: boolean };

/** Injected environment. The CLI supplies fs + git; the suite supplies a fake. */
export interface CustodyEnv {
  readFile(p: string): Uint8Array | null;
  head(): string;
  resolveCommit(ref: string): string;
  /** Paths git reports as differing from HEAD: staged, unstaged and untracked. */
  changedPaths(): ChangedPath[];
}

export type RefusalCode =
  | "EMPTY_REVIEW" | "MALFORMED_REVIEW" | "BAD_VERDICT" | "PLAN_MISMATCH"
  | "NO_REVIEWER" | "NO_SUMMARY" | "BAD_FINDINGS" | "NO_LIMITATIONS" | "NO_COVERAGE"
  | "NO_ID" | "DUP_ID" | "BAD_SEVERITY" | "NO_EVIDENCE" | "MATERIAL_UNDER_APPROVED"
  | "CONFLICT" | "NO_APPROVAL" | "NOT_APPROVED" | "EMPTY_PLAN" | "PLAN_MISSING";

export type Refused = { kind: "refused"; code: RefusalCode; reason: string };
export type AdmitOutcome =
  | { kind: "admitted"; record: CustodyRecord; verdict: Verdict; findings: Record<Severity, number> }
  | { kind: "already"; record: CustodyRecord }
  | Refused;
export type CheckOutcome =
  | { kind: "applies"; approval: Approval; paths: number }
  | { kind: "stale"; problems: string[] }
  | Refused;

export type ParseResult =
  | { kind: "ok"; value: Record<string, unknown> }
  | { kind: "empty" }
  | { kind: "malformed" };

/**
 * Each member is one custody decision. A defeat candidate replaces exactly one.
 * Booleans appear only where a predicate would be ceremony; the record states that
 * this makes the suite decision-level, not implementation-independent.
 */
export interface CustodyDecisions {
  /** Which severities may not sit under APPROVED. */
  isMaterial(f: Finding): boolean;
  /** Is the review bound to the plan the record names? */
  planBinding(recordSha: string, reviewSha: string): "match" | "mismatch";
  /** Empty / malformed / parsed. */
  parseReview(raw: Uint8Array): ParseResult;
  /** Must the review name what it inspected? */
  coverage(files: unknown): { kind: "ok"; files: string[] } | { kind: "absent" };
  /** Must `limitations` be present as a claim rather than defaulted? */
  limitations(raw: unknown): { kind: "ok"; items: unknown[] } | { kind: "absent" };
  /** Must each finding carry evidence? */
  evidence(raw: unknown): { kind: "ok"; text: string } | { kind: "absent" };
  /** Closed vocabulary, or an open one that degrades the unknown to non-material. */
  severity(raw: unknown): { kind: "ok"; value: Severity } | { kind: "bad" };
  /** A repeated finding id: refuse, or silently keep one? */
  duplicateId(id: string): "reject" | "dedupe";
  /** What a second review does to an admitted record. */
  onExistingApproval(existing: Approval, incomingReviewSha: string): "already" | "conflict" | "overwrite";
  /** Which changed paths enter the manifest. */
  manifestPaths(paths: ChangedPath[]): string[];
  /** A path's manifest entry. `null` drops it from the manifest entirely. */
  manifestHash(env: CustodyEnv, p: string): string | null;
  /** Which signals `check` consults to decide an approval still applies. */
  checkSignals: ReadonlyArray<"plan" | "manifest" | "head">;
  /** Does `check` require the admitted verdict to be APPROVED? */
  checkRequiresApproved: boolean;
}

export const sha256 = (b: Uint8Array | string): string => createHash("sha256").update(b).digest("hex");

export const STRICT: CustodyDecisions = {
  isMaterial: f => f.severity === "high" || f.severity === "medium",
  planBinding: (a, b) => (a === b ? "match" : "mismatch"),
  parseReview: raw => {
    if (raw.byteLength === 0) return { kind: "empty" };
    try {
      const v: unknown = JSON.parse(Buffer.from(raw).toString("utf8"));
      if (v === null || typeof v !== "object" || Array.isArray(v)) return { kind: "malformed" };
      return { kind: "ok", value: v as Record<string, unknown> };
    } catch {
      return { kind: "malformed" };
    }
  },
  coverage: files =>
    Array.isArray(files) && files.length > 0 ? { kind: "ok", files: files.map(String) } : { kind: "absent" },
  limitations: raw => (Array.isArray(raw) ? { kind: "ok", items: raw } : { kind: "absent" }),
  evidence: raw =>
    typeof raw === "string" && raw.trim() !== "" ? { kind: "ok", text: raw } : { kind: "absent" },
  severity: raw =>
    typeof raw === "string" && (SEVERITIES as readonly string[]).includes(raw)
      ? { kind: "ok", value: raw as Severity }
      : { kind: "bad" },
  duplicateId: () => "reject",
  onExistingApproval: (existing, incoming) => (existing.review_sha256 === incoming ? "already" : "conflict"),
  manifestPaths: paths => paths.map(p => p.path),
  // A path that no longer exists stays in the manifest as ABSENT: a deletion must
  // never read as an unchanged tree.
  manifestHash: (env, p) => {
    const b = env.readFile(p);
    return b === null ? "ABSENT" : sha256(b);
  },
  checkSignals: ["plan", "manifest", "head"],
  checkRequiresApproved: true,
};

const refuse = (code: RefusalCode, reason: string): Refused => ({ kind: "refused", code, reason });

export function buildManifest(env: CustodyEnv, d: CustodyDecisions): { fingerprint: string; paths: number } {
  const selected = [...new Set(d.manifestPaths(env.changedPaths()))].sort();
  const lines: string[] = [];
  for (const p of selected) {
    const h = d.manifestHash(env, p);
    if (h === null) continue;
    lines.push(`${p}\u0000${h}`);
  }
  return { fingerprint: sha256(lines.join("\n")), paths: lines.length };
}

export function bind(
  env: CustodyEnv, d: CustodyDecisions,
  o: { planPath: string; baseRef: string; now: string },
): { kind: "bound"; record: CustodyRecord } | Refused {
  const buf = env.readFile(o.planPath);
  if (buf === null) return refuse("PLAN_MISSING", `plan not found: ${o.planPath}`);
  if (buf.byteLength === 0) return refuse("EMPTY_PLAN", `plan is empty: ${o.planPath}. An empty plan cannot be reviewed.`);
  return {
    kind: "bound",
    record: {
      instrument: "review-custody/v1",
      bound_at: o.now,
      repo_head: env.head(),
      plan: { path: o.planPath, sha256: sha256(buf), bytes: buf.byteLength },
      base: { ref: o.baseRef, commit: env.resolveCommit(o.baseRef) },
      tree: buildManifest(env, d),
      approval: null,
    },
  };
}

type Validated = {
  verdict: Verdict; reviewer: string; findings: Finding[];
  coverageFiles: string[]; limitations: unknown[];
};

export function validateReview(raw: Uint8Array, record: CustodyRecord, d: CustodyDecisions): Validated | Refused {
  const parsed = d.parseReview(raw);
  if (parsed.kind === "empty") return refuse("EMPTY_REVIEW", "review file is empty. An empty output is never an approval.");
  if (parsed.kind === "malformed") return refuse("MALFORMED_REVIEW", "review is not a valid JSON object. A malformed review is a refusal, not a pass.");
  const r = parsed.value;

  const verdict = r["verdict"];
  if (typeof verdict !== "string" || !(VERDICTS as readonly string[]).includes(verdict)) {
    return refuse("BAD_VERDICT", `verdict must be one of ${VERDICTS.join(" | ")}; got ${JSON.stringify(verdict)}`);
  }
  const planSha = r["plan_sha256"];
  if (typeof planSha !== "string" || planSha.length === 0) {
    return refuse("PLAN_MISMATCH", "review must carry plan_sha256 — the plan it actually reviewed.");
  }
  if (d.planBinding(record.plan.sha256, planSha) === "mismatch") {
    return refuse("PLAN_MISMATCH", `review is of a DIFFERENT PLAN.\n  record  ${record.plan.sha256}\n  review  ${planSha}\nA review cannot be stapled to a plan it did not read.`);
  }
  const reviewer = r["reviewer"];
  if (typeof reviewer !== "string" || reviewer.trim() === "") {
    return refuse("NO_REVIEWER", "review must name its reviewer. An unattributed review has no custody.");
  }
  const summary = r["summary"];
  if (typeof summary !== "string" || summary.trim() === "") {
    return refuse("NO_SUMMARY", "review must carry a non-empty summary.");
  }
  const rawFindings = r["findings"];
  if (!Array.isArray(rawFindings)) return refuse("BAD_FINDINGS", "findings must be an array (may be empty).");

  const lim = d.limitations(r["limitations"]);
  if (lim.kind === "absent") {
    return refuse("NO_LIMITATIONS", "limitations must be present as an array. Asserting none is a claim; omitting it is not.");
  }
  const covRaw = (r["coverage"] as { files?: unknown } | undefined)?.files;
  const cov = d.coverage(covRaw);
  if (cov.kind === "absent") {
    return refuse("NO_COVERAGE", "coverage.files must name what was actually inspected. Absent coverage is refused: an instrument can satisfy its remaining questions by forgetting to ask the difficult ones.");
  }

  const findings: Finding[] = [];
  const seen = new Map<string, number>();
  for (const [i, raw0] of rawFindings.entries()) {
    const f = (raw0 ?? {}) as Record<string, unknown>;
    const id = f["id"];
    if (typeof id !== "string" || id.trim() === "") return refuse("NO_ID", `finding #${i + 1} has no id.`);
    if (seen.has(id)) {
      if (d.duplicateId(id) === "reject") return refuse("DUP_ID", `duplicate finding id: ${id}`);
      findings.splice(seen.get(id) as number, 1);
    }
    const sev = d.severity(f["severity"]);
    if (sev.kind === "bad") return refuse("BAD_SEVERITY", `finding ${id}: severity must be one of ${SEVERITIES.join(" | ")}`);
    const ev = d.evidence(f["evidence"]);
    if (ev.kind === "absent") {
      return refuse("NO_EVIDENCE", `finding ${id}: evidence is required. An assertion without evidence is not a finding.`);
    }
    seen.set(id, findings.length);
    findings.push({
      id, severity: sev.value,
      path: typeof f["path"] === "string" ? (f["path"] as string) : "",
      evidence: ev.text,
      fix: typeof f["fix"] === "string" ? (f["fix"] as string) : "",
    });
  }

  const material = findings.filter(f => d.isMaterial(f));
  if (verdict === "APPROVED" && material.length > 0) {
    return refuse("MATERIAL_UNDER_APPROVED",
      `APPROVED is refused alongside ${material.length} material finding(s): ${material.map(f => `${f.id}(${f.severity})`).join(", ")}.\n` +
      "A review may not approve itself past its own findings. Disposition them, then re-review.");
  }
  return { verdict: verdict as Verdict, reviewer, findings, coverageFiles: cov.files, limitations: lim.items };
}

export function admit(
  record: CustodyRecord, raw: Uint8Array, d: CustodyDecisions, now: string,
): AdmitOutcome {
  const reviewSha = sha256(raw);
  if (record.approval) {
    const verdictOnExisting = d.onExistingApproval(record.approval, reviewSha);
    if (verdictOnExisting === "already") return { kind: "already", record };
    if (verdictOnExisting === "conflict") {
      return refuse("CONFLICT", `CONFLICT — this record already carries an admitted review (${record.approval.verdict}, ${record.approval.admitted_at}). A second, different review may not overwrite it. Bind a new record.`);
    }
  }
  const v = validateReview(raw, record, d);
  if ("kind" in v && v.kind === "refused") return v;
  const ok = v as Validated;
  const counts: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
  for (const f of ok.findings) counts[f.severity] += 1;
  const next: CustodyRecord = {
    ...record,
    approval: {
      admitted_at: now,
      verdict: ok.verdict,
      reviewer: ok.reviewer,
      plan_sha256: record.plan.sha256,
      review_sha256: reviewSha,
      findings: counts,
      coverage_files: ok.coverageFiles.length,
      limitations: ok.limitations.length,
    },
  };
  return { kind: "admitted", record: next, verdict: ok.verdict, findings: counts };
}

export function check(record: CustodyRecord, env: CustodyEnv, d: CustodyDecisions): CheckOutcome {
  const a = record.approval;
  if (!a) return refuse("NO_APPROVAL", "BOUND, NOT APPROVED — this record carries no admitted review.");
  if (d.checkRequiresApproved && a.verdict !== "APPROVED") {
    return refuse("NOT_APPROVED", `recorded verdict is ${a.verdict}, not APPROVED.`);
  }
  const problems: string[] = [];
  const manifest = buildManifest(env, d);
  if (d.checkSignals.includes("plan")) {
    const buf = env.readFile(record.plan.path);
    if (buf === null) return refuse("PLAN_MISSING", `plan not found: ${record.plan.path}`);
    const now = sha256(buf);
    if (now !== a.plan_sha256) {
      problems.push(`PLAN CHANGED — approval applies to ${a.plan_sha256.slice(0, 16)}…, plan is now ${now.slice(0, 16)}…. The approval is INVALID for the current plan.`);
    }
  }
  if (d.checkSignals.includes("manifest") && manifest.fingerprint !== record.tree.fingerprint) {
    problems.push(`TREE MOVED — the change manifest is no longer the one inspected (${record.tree.paths} path(s) → ${manifest.paths}). Later code changes need another inspection.`);
  }
  if (d.checkSignals.includes("head")) {
    const h = env.head();
    if (h !== record.repo_head) problems.push(`HEAD MOVED — bound at ${record.repo_head.slice(0, 9)}, now ${h.slice(0, 9)}.`);
  }
  return problems.length > 0 ? { kind: "stale", problems } : { kind: "applies", approval: a, paths: manifest.paths };
}
