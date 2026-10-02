/**
 * REVIEW CUSTODY — FALSIFIERS  (RC-F1 … RC-F14)
 *
 * Each falsifier states ONE custody law and is runnable against ANY implementation
 * of `CustodyDecisions`. They are authored against the contract, not against the
 * shipped decisions, so a candidate cannot pass by being the thing they were written
 * from.
 *
 * ⭐ THEY ASSERT THE REFUSAL'S IDENTITY, NOT ONLY ITS EXISTENCE. A refusal that does
 *    not name its condition is how an operator learns to ignore an instrument, so
 *    "refused for the wrong reason" is a failure here. Where a kill rests on the
 *    code rather than on the outcome, the falsifier says so in its `law`.
 *
 * ⛔ Passing this suite establishes nothing about whether a reviewer's findings are
 *    truthful. These are custody laws only.
 */
import {
  admit, bind, check,
  type ChangedPath, type CustodyDecisions, type CustodyEnv, type CustodyRecord,
  type RefusalCode,
} from "../../../scripts/review-custody-core";

export type FalsifierResult = { pass: true } | { pass: false; why: string };
export type Falsifier = { id: string; law: string; run(d: CustodyDecisions): FalsifierResult };

const enc = (s: string): Uint8Array => Buffer.from(s, "utf8");
const fail = (why: string): FalsifierResult => ({ pass: false, why });
const ok: FalsifierResult = { pass: true };

function env(o: { files: Record<string, string | null>; changed: ChangedPath[]; head?: string }): CustodyEnv {
  return {
    readFile: p => {
      const v = o.files[p];
      return typeof v === "string" ? enc(v) : null;
    },
    head: () => o.head ?? "head0000",
    resolveCommit: () => "base0000",
    changedPaths: () => o.changed,
  };
}

const PLAN = "PLAN.md";
const PLAN_BODY = "# Plan\nAcceptance: proof command is green.\n";

/** A record bound over a one-path manifest, using the candidate's own decisions. */
function bound(d: CustodyDecisions, e: CustodyEnv = env({ files: { [PLAN]: PLAN_BODY, "a.ts": "v1" }, changed: [{ path: "a.ts", untracked: false }] })): CustodyRecord | FalsifierResult {
  const r = bind(e, d, { planPath: PLAN, baseRef: "HEAD", now: "T0" });
  return r.kind === "bound" ? r.record : fail(`bind refused unexpectedly [${r.code}]`);
}

type ReviewParts = { verdict?: unknown; findings?: unknown[]; coverage?: unknown; limitations?: unknown; reviewer?: unknown; summary?: unknown; plan_sha256?: string };

function review(rec: CustodyRecord, p: ReviewParts = {}): string {
  const base: Record<string, unknown> = {
    verdict: "APPROVED",
    plan_sha256: rec.plan.sha256,
    reviewer: "reference reviewer",
    summary: "reviewed",
    findings: [],
    coverage: { files: ["a.ts"] },
    limitations: ["did not run the proof command"],
  };
  for (const [k, v] of Object.entries(p)) base[k] = v;
  return JSON.stringify(base);
}

const F = (id: string, sev: string, evidence: unknown = "observed at a.ts:1"): Record<string, unknown> => ({ id, severity: sev, path: "a.ts", evidence, fix: "fix it" });

/** admit(...) must refuse with exactly `code`. */
function mustRefuse(d: CustodyDecisions, rec: CustodyRecord, raw: Uint8Array, code: RefusalCode, what: string): FalsifierResult {
  const r = admit(rec, raw, d, "T1");
  if (r.kind !== "refused") return fail(`${what}: expected refusal [${code}], got ${r.kind}`);
  if (r.code !== code) return fail(`${what}: refused for the wrong reason — expected [${code}], got [${r.code}]`);
  return ok;
}

/** check(...) must report staleness containing `needle`. */
function mustBeStale(d: CustodyDecisions, rec: CustodyRecord, e: CustodyEnv, needle: string, what: string): FalsifierResult {
  const r = check(rec, e, d);
  if (r.kind !== "stale") return fail(`${what}: expected a stale approval, got ${r.kind}`);
  if (!r.problems.some(p => p.includes(needle))) return fail(`${what}: stale for the wrong reason — no problem named ${needle}: ${r.problems.join(" | ")}`);
  return ok;
}

/** Admit a lawful APPROVED review and return the record carrying it. */
function approved(d: CustodyDecisions, rec: CustodyRecord, parts: ReviewParts = {}): CustodyRecord | FalsifierResult {
  const r = admit(rec, enc(review(rec, parts)), d, "T1");
  if (r.kind !== "admitted") return fail(`expected admission, got ${r.kind}${r.kind === "refused" ? ` [${r.code}]` : ""}`);
  return r.record;
}

const isResult = (v: unknown): v is FalsifierResult => typeof v === "object" && v !== null && "pass" in (v as object);

export const FALSIFIERS: Falsifier[] = [
  {
    id: "RC-F1",
    law: "APPROVED may not coexist with a material finding. BOTH high AND medium are material — a candidate that treats only high as material dies on the medium case.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      for (const sev of ["high", "medium"]) {
        const r = mustRefuse(d, rec, enc(review(rec, { findings: [F(`X-${sev}`, sev)] })), "MATERIAL_UNDER_APPROVED", `severity=${sev}`);
        if (!r.pass) return r;
      }
      return ok;
    },
  },
  {
    id: "RC-F2",
    law: "A review is bound to the plan it read: the record's plan hash governs, never the review's own claim about which plan it reviewed.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      return mustRefuse(d, rec, enc(review(rec, { plan_sha256: "0".repeat(64) })), "PLAN_MISMATCH", "review of a different plan");
    },
  },
  {
    id: "RC-F3",
    law: "An empty review is never an approval, AND is refused AS empty — a zero-byte reviewer output must be diagnosable as such, not as some downstream schema complaint.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      return mustRefuse(d, rec, new Uint8Array(0), "EMPTY_REVIEW", "zero-byte review");
    },
  },
  {
    id: "RC-F4",
    law: "A review whose bytes are not exactly one JSON object is refused. A truncated or duplicated stream that happens to contain a complete valid review must NOT be recovered and admitted.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      return mustRefuse(d, rec, enc(`${review(rec)}{"verdict":"APPROVED"`), "MALFORMED_REVIEW", "valid review plus a truncated tail");
    },
  },
  {
    id: "RC-F5",
    law: "Coverage must name what was actually inspected. Absent coverage is refused, never treated as informational metadata.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      return mustRefuse(d, rec, enc(review(rec, { coverage: { files: [] } })), "NO_COVERAGE", "empty coverage");
    },
  },
  {
    id: "RC-F6",
    law: "A repeated finding id is refused. Silently de-duplicating by id discards a finding that carries different evidence.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      const raw = enc(review(rec, { findings: [F("D1", "low", "first evidence"), F("D1", "low", "second, DIFFERENT evidence")] }));
      return mustRefuse(d, rec, raw, "DUP_ID", "duplicate finding id");
    },
  },
  {
    id: "RC-F7",
    law: "Admission is monotonic: the identical review is idempotent and PRESERVES the original timestamp; a different review is a CONFLICT and may not overwrite.",
    run: d => {
      const rec0 = bound(d);
      if (isResult(rec0)) return rec0;
      const first = approved(d, rec0);
      if (isResult(first)) return first;
      const t0 = first.approval?.admitted_at;
      const same = admit(first, enc(review(rec0)), d, "T2-LATER");
      if (same.kind !== "already") return fail(`re-admitting the identical review: expected 'already', got ${same.kind}`);
      if (same.record.approval?.admitted_at !== t0) return fail(`re-admission rewrote the timestamp (${t0} → ${same.record.approval?.admitted_at})`);
      return mustRefuse(d, first, enc(review(rec0, { summary: "a different review" })), "CONFLICT", "second, different review");
    },
  },
  {
    id: "RC-F8",
    law: "An approval does not survive an edit to the plan it approved.",
    run: d => {
      const rec0 = bound(d);
      if (isResult(rec0)) return rec0;
      const rec = approved(d, rec0);
      if (isResult(rec)) return rec;
      const after = env({ files: { [PLAN]: `${PLAN_BODY}and one more thing\n`, "a.ts": "v1" }, changed: [{ path: "a.ts", untracked: false }] });
      return mustBeStale(d, rec, after, "PLAN CHANGED", "plan edited after approval");
    },
  },
  {
    id: "RC-F9",
    law: "An approval does not survive a change to the manifest — INCLUDING the appearance of an untracked file alone. A file that never entered git is exactly the file an inspection silently misses.",
    run: d => {
      const rec0 = bound(d);
      if (isResult(rec0)) return rec0;
      const rec = approved(d, rec0);
      if (isResult(rec)) return rec;
      const after = env({
        files: { [PLAN]: PLAN_BODY, "a.ts": "v1", "new.ts": "never committed" },
        changed: [{ path: "a.ts", untracked: false }, { path: "new.ts", untracked: true }],
      });
      return mustBeStale(d, rec, after, "TREE MOVED", "untracked file appeared");
    },
  },
  {
    id: "RC-F10",
    law: "The manifest binds CONTENT, not the set of touched paths. Editing an already-changed file invalidates the approval even though the path set is identical.",
    run: d => {
      const rec0 = bound(d);
      if (isResult(rec0)) return rec0;
      const rec = approved(d, rec0);
      if (isResult(rec)) return rec;
      const after = env({ files: { [PLAN]: PLAN_BODY, "a.ts": "v2 — edited after inspection" }, changed: [{ path: "a.ts", untracked: false }] });
      return mustBeStale(d, rec, after, "TREE MOVED", "content edited, path set unchanged");
    },
  },
  {
    id: "RC-F11",
    law: "`limitations` must be PRESENT as a claim. Asserting none is a claim; omitting it is not, and defaulting the omission to none manufactures a completeness claim the reviewer never made.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      const raw = JSON.parse(review(rec)) as Record<string, unknown>;
      delete raw["limitations"];
      return mustRefuse(d, rec, enc(JSON.stringify(raw)), "NO_LIMITATIONS", "limitations omitted");
    },
  },
  {
    id: "RC-F12",
    law: "Every finding must carry evidence. An assertion without evidence is not a finding.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      // The evidence key is OMITTED outright. Passing `undefined` to F() would
      // trigger its default parameter and quietly supply evidence — the first
      // defect this matrix caught, in the falsifier rather than a candidate.
      const noEvidence = { id: "E1", severity: "low", path: "a.ts", fix: "fix it" };
      return mustRefuse(d, rec, enc(review(rec, { findings: [noEvidence] })), "NO_EVIDENCE", "finding with no evidence key");
    },
  },
  {
    id: "RC-F13",
    law: "The severity vocabulary is CLOSED. An unknown severity is refused, never degraded to a non-material value — otherwise an unrecognised word smuggles a material finding under APPROVED.",
    run: d => {
      const rec = bound(d);
      if (isResult(rec)) return rec;
      return mustRefuse(d, rec, enc(review(rec, { findings: [F("S1", "critical")] })), "BAD_SEVERITY", "severity outside the vocabulary");
    },
  },
  {
    id: "RC-F14",
    law: "`check` requires the admitted verdict to BE APPROVED. A recorded REVISE or BLOCKED is never converted to approval by the fact that a review exists.",
    run: d => {
      const rec0 = bound(d);
      if (isResult(rec0)) return rec0;
      const revised = approved(d, rec0, { verdict: "REVISE", findings: [F("R1", "high")] });
      if (isResult(revised)) return revised;
      const e = env({ files: { [PLAN]: PLAN_BODY, "a.ts": "v1" }, changed: [{ path: "a.ts", untracked: false }] });
      const r = check(revised, e, d);
      if (r.kind !== "refused") return fail(`a recorded REVISE passed check as ${r.kind}`);
      if (r.code !== "NOT_APPROVED") return fail(`refused for the wrong reason — expected [NOT_APPROVED], got [${r.code}]`);
      return ok;
    },
  },
];
