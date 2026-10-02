/**
 * REVIEW CUSTODY — COVERAGE WITNESS  (Step 2)
 *
 * `coverage.files` in a review is an ATTESTATION. This module turns it into a
 * bounded fact by checking it against the reviewer's own execution trace.
 *
 * ⭐⭐ IT IS A THIRD BOUNDARY, NOT A CHANGE TO `admit`. Three questions, never merged:
 *     witness  — is the coverage CLAIM supported by the reviewer's read events?
 *     admit    — is the RECORD admissible?
 *     check    — does an admitted approval STILL APPLY?
 *     `admit` and its decisions are FROZEN (FREEZE.json). Making `admit` require a
 *     trace would also refuse all fourteen frozen falsifiers before each reached
 *     its named refusal — the law would die for the wrong reason.
 *
 * ⚠️⚠️ WHAT A DERIVED COVERAGE SET IS, EXACTLY:
 *   - It bounds coverage FROM ABOVE: the reviewer cannot have inspected a file it
 *     never read. ⛔ It does NOT bound from below — a `Read` event proves a file was
 *     opened, never that it was understood, and never "thoroughness".
 *   - The trace is emitted by the reviewer's HARNESS, not by the model's prose. That
 *     is strictly stronger than self-report and ⛔ still not a kernel witness.
 *   - ⭐ THE BOUND ONLY HOLDS IF EVERY READ CHANNEL IS WITNESSABLE. A shell is an
 *     unwitnessable read channel: `cat`, `sed -n`, pipes, globs and variables cannot
 *     be soundly reduced to a file set. So a trace containing one is REFUSED rather
 *     than partially credited — and the review procedure must restrict the reviewer's
 *     tools to witnessable reads. Coverage derived from a partial view of reads is
 *     not a bound; it is a guess wearing a bound's clothes.
 *   - Classification is FAIL-CLOSED: a tool this module does not recognise is treated
 *     as an unwitnessable channel, never ignored.
 *
 * ⛔ `Grep` and `Glob` witness nothing. A search over a directory does not establish
 *    that any particular file's content was inspected; they are recorded as SCOPES.
 *
 * @see docs/programme/REVIEW-CUSTODY-01_STEP2_REVIEW_AUTHORING_PROCEDURE_2026-09-20.md
 */
import path from "node:path";

export type ReadEvent = { tool: string; path: string };
export type TraceParse =
  | { kind: "ok"; events: ReadEvent[]; scopes: string[]; channels: string[]; traceIds: string[] }
  | { kind: "empty" }
  | { kind: "malformed" };

export type CoverageRefusalCode =
  | "UNVERIFIED_REVIEW_COVERAGE" | "UNWITNESSABLE_READ_CHANNEL" | "TRACE_UNREADABLE"
  | "TRACE_EMPTY" | "TRACE_NOT_BOUND" | "NO_ATTESTATION";

export type WitnessOutcome =
  | { kind: "witnessed"; files: string[]; undisclosed: string[]; scopes: string[] }
  | { kind: "refused"; code: CoverageRefusalCode; reason: string };

/** The review's coverage attestation plus the trace identity it declares. */
export type Attestation = { files: unknown; traceId: unknown; inlineTrace?: unknown };

export interface CoverageDecisions {
  /** Raw trace bytes → events. Must distinguish empty from malformed. */
  parseTrace(raw: Uint8Array): TraceParse;
  /** Tools whose input soundly names ONE file that was read, and the field naming it. */
  witnessableTools: Readonly<Record<string, string>>;
  /** Tools that read nothing attributable: recorded as scope, never as coverage. */
  nonWitnessingTools: ReadonlySet<string>;
  /** A tool that can read content but whose target cannot be soundly extracted. */
  classifyUnknownTool(tool: string): "unwitnessable" | "ignore";
  /** Canonical form so spelling never decides a coverage claim. */
  normalize(p: string, repoRoot: string): string;
  /** Does a witnessed path satisfy an attested one? */
  matches(attested: string, witnessed: string): boolean;
  /** Which attested files the trace fails to witness. Returning [] makes the trace
   *  an audit artefact rather than a gate — a distinct error from a loose `matches`. */
  unwitnessedOf(attested: string[], witnessed: string[], matches: (a: string, w: string) => boolean): string[];
  /** Reads the review did not disclose. */
  onUndisclosed(paths: string[]): "record" | "refuse";
  /** An empty trace against a non-empty attestation. */
  onEmptyTrace(): "refuse" | "allow";
  /** May the review's own inline trace stand in for the external one? */
  traceSource(external: Uint8Array | null, inline: unknown): { kind: "external"; raw: Uint8Array } | { kind: "inline"; raw: Uint8Array } | { kind: "none" };
  /** Is this trace the declared reviewer run, or spliced from another? */
  bindTrace(declaredTraceId: string, traceIds: string[]): "bound" | "unbound";
}

const refuse = (code: CoverageRefusalCode, reason: string): WitnessOutcome => ({ kind: "refused", code, reason });

/**
 * Claude Code emits newline-delimited JSON events; assistant turns carry
 * `message.content[]` entries of `{type:"tool_use", name, input}`. A JSON array of
 * the same events is also accepted. ⚠️ The exact CLI flag set that produces this
 * stream is NOT verified in this container — see the procedure record §Provenance.
 */
function parseClaudeTrace(raw: Uint8Array): TraceParse {
  const text = Buffer.from(raw).toString("utf8").trim();
  if (text.length === 0) return { kind: "empty" };

  const records: unknown[] = [];
  if (text.startsWith("[")) {
    try {
      const arr: unknown = JSON.parse(text);
      if (!Array.isArray(arr)) return { kind: "malformed" };
      records.push(...arr);
    } catch {
      return { kind: "malformed" };
    }
  } else {
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (t === "") continue;
      try {
        records.push(JSON.parse(t));
      } catch {
        return { kind: "malformed" };
      }
    }
  }
  if (records.length === 0) return { kind: "empty" };

  const events: ReadEvent[] = [];
  const traceIds = new Set<string>();
  const seenTools: string[] = [];
  let sawToolUse = false;

  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const n of node) visit(n);
      return;
    }
    if (node === null || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    for (const key of ["session_id", "sessionId", "trace_id", "traceId"]) {
      const v = o[key];
      if (typeof v === "string" && v !== "") traceIds.add(v);
    }
    if (o["type"] === "tool_use" && typeof o["name"] === "string") {
      sawToolUse = true;
      seenTools.push(o["name"]);
      const input = (o["input"] ?? {}) as Record<string, unknown>;
      for (const [k, v] of Object.entries(input)) {
        if (typeof v === "string") events.push({ tool: o["name"], path: `${k}\u0000${v}` });
      }
      return;
    }
    for (const v of Object.values(o)) visit(v);
  };
  for (const r of records) visit(r);

  if (!sawToolUse) return { kind: "empty" };
  return { kind: "ok", events, scopes: [], channels: seenTools, traceIds: [...traceIds] };
}

export const STRICT_COVERAGE: CoverageDecisions = {
  parseTrace: parseClaudeTrace,
  witnessableTools: { Read: "file_path", NotebookRead: "notebook_path" },
  // StructuredOutput is emitted by Claude's --json-schema response formatter.
  // The host witness proved it carries model output, not a repository read channel.
  // Classifying this one observed non-reader preserves fail-closed for every unknown tool.
  nonWitnessingTools: new Set(["Grep", "Glob", "TodoWrite", "Task", "StructuredOutput"]),
  // Fail closed: an unrecognised tool may be able to read, so it is an unwitnessable
  // channel until it is classified deliberately.
  classifyUnknownTool: () => "unwitnessable",
  normalize: (p, repoRoot) => {
    const fwd = p.replace(/\\/g, "/");
    const abs = path.posix.isAbsolute(fwd) ? fwd : path.posix.join(repoRoot, fwd);
    const rel = path.posix.relative(repoRoot, path.posix.normalize(abs));
    return rel === "" ? "." : rel;
  },
  // Exact equality after normalization. Suffix or basename matching would let a read
  // of `a.ts` witness a claim about `lib/a.ts`.
  matches: (attested, witnessed) => attested === witnessed,
  unwitnessedOf: (attested, witnessed, matches) => attested.filter(at => !witnessed.some(w => matches(at, w))),
  onUndisclosed: () => "record",
  onEmptyTrace: () => "refuse",
  // Provenance is external by construction: a review may not supply its own evidence.
  traceSource: external => (external === null ? { kind: "none" } : { kind: "external", raw: external }),
  bindTrace: (declared, traceIds) => (traceIds.includes(declared) ? "bound" : "unbound"),
};

export function witnessCoverage(
  a: Attestation, externalTrace: Uint8Array | null, d: CoverageDecisions, repoRoot = "/repo",
): WitnessOutcome {
  if (!Array.isArray(a.files) || a.files.length === 0) {
    return refuse("NO_ATTESTATION", "review carries no coverage.files to witness.");
  }
  const attested = [...new Set(a.files.map(f => d.normalize(String(f), repoRoot)))].sort();

  const src = d.traceSource(externalTrace, a.inlineTrace);
  if (src.kind === "none") {
    return refuse("TRACE_EMPTY", "no execution trace was supplied. A coverage claim with nothing to witness it is a claim, not evidence.");
  }
  // ⭐ No hard-coded block on an inline trace here, deliberately. STRICT's `traceSource`
  // ignores `inlineTrace` outright, so external provenance is enforced BY THE DECISION.
  // A structural block would make the law unfalsifiable through the seam: a candidate
  // that tried to witness a review with its own trace would be refused by the core
  // rather than by the law, and RC-C7 would pass while the error went unmodelled.

  const parsed = d.parseTrace(src.raw);
  if (parsed.kind === "malformed") {
    return refuse("TRACE_UNREADABLE", "execution trace is not parseable. An unreadable trace is a refusal, never an empty one.");
  }
  if (parsed.kind === "empty") {
    return d.onEmptyTrace() === "refuse"
      ? refuse("TRACE_EMPTY", `execution trace records no tool use, but ${attested.length} file(s) are attested as inspected.`)
      : { kind: "witnessed", files: [], undisclosed: [], scopes: [] };
  }

  const declaredTraceId = typeof a.traceId === "string" ? a.traceId : "";
  if (declaredTraceId === "") {
    return refuse("TRACE_NOT_BOUND", "review declares no trace identity, so no trace can be bound to it.");
  }
  if (d.bindTrace(declaredTraceId, parsed.traceIds) === "unbound") {
    return refuse("TRACE_NOT_BOUND", `the trace does not carry the review's declared identity (${declaredTraceId}). A trace from another run witnesses nothing about this one.`);
  }

  // Classify every channel before crediting any read.
  const unwitnessable = new Set<string>();
  for (const tool of parsed.channels) {
    if (tool in d.witnessableTools) continue;
    if (d.nonWitnessingTools.has(tool)) continue;
    if (d.classifyUnknownTool(tool) === "unwitnessable") unwitnessable.add(tool);
  }
  if (unwitnessable.size > 0) {
    return refuse("UNWITNESSABLE_READ_CHANNEL",
      `the trace contains read channel(s) whose targets cannot be soundly extracted: ${[...unwitnessable].sort().join(", ")}. ` +
      "Coverage derived from a partial view of reads is not a bound. Restrict the reviewer's tools to witnessable reads.");
  }

  const witnessed = new Set<string>();
  const scopes = new Set<string>();
  for (const e of parsed.events) {
    const sep = e.path.indexOf("\u0000");
    const field = e.path.slice(0, sep);
    const value = e.path.slice(sep + 1);
    const pathField = d.witnessableTools[e.tool];
    if (pathField !== undefined && field === pathField) witnessed.add(d.normalize(value, repoRoot));
    else if (d.nonWitnessingTools.has(e.tool) && (field === "path" || field === "pattern")) scopes.add(`${e.tool}:${value}`);
  }

  const unwitnessed = d.unwitnessedOf(attested, [...witnessed], (at, w) => d.matches(at, w));
  if (unwitnessed.length > 0) {
    return refuse("UNVERIFIED_REVIEW_COVERAGE",
      `${unwitnessed.length} attested file(s) have no witnessing read event: ${unwitnessed.slice(0, 8).join(", ")}${unwitnessed.length > 8 ? " …" : ""}. ` +
      "A reviewer cannot have inspected a file it never read.");
  }

  const undisclosed = [...witnessed].filter(w => !attested.some(at => d.matches(at, w))).sort();
  if (undisclosed.length > 0 && d.onUndisclosed(undisclosed) === "refuse") {
    return refuse("UNVERIFIED_REVIEW_COVERAGE", `reviewer read ${undisclosed.length} file(s) it did not attest.`);
  }
  return { kind: "witnessed", files: attested, undisclosed, scopes: [...scopes].sort() };
}
