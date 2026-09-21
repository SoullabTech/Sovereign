/**
 * COVERAGE WITNESS — FALSIFIERS  (RC-C1 … RC-C8)
 *
 * ⭐ ADDITIVE LAW. These are a separate address from the frozen RC-F1…RC-F14 and
 *    govern a separate boundary (`witnessCoverage`, not `admit`). No frozen file is
 *    touched; FREEZE.json's blob hashes are the mechanical proof of that.
 *
 * They assert the refusal's CODE, not only its existence — the same discipline as the
 * frozen suite, and for the same reason: a refusal that cannot be diagnosed teaches an
 * operator to ignore the instrument.
 */
import {
  STRICT_COVERAGE, witnessCoverage,
  type Attestation, type CoverageDecisions, type CoverageRefusalCode,
} from "../../../../scripts/review-custody-coverage";

export type FalsifierResult = { pass: true } | { pass: false; why: string };
export type Falsifier = { id: string; law: string; run(d: CoverageDecisions): FalsifierResult };

const ROOT = "/repo";
const SID = "session-abc123";
const fail = (why: string): FalsifierResult => ({ pass: false, why });
const ok: FalsifierResult = { pass: true };

type Call = { name: string; input: Record<string, unknown> };

/** A harness-shaped NDJSON trace: assistant turns carrying tool_use entries. */
function trace(calls: Call[], sessionId = SID): Uint8Array {
  const lines = calls.map(c => JSON.stringify({
    type: "assistant", session_id: sessionId,
    message: { role: "assistant", content: [{ type: "tool_use", name: c.name, input: c.input }] },
  }));
  return Buffer.from(lines.join("\n"), "utf8");
}
const reads = (...paths: string[]): Call[] => paths.map(p => ({ name: "Read", input: { file_path: p } }));
const attest = (files: string[], extra: Partial<Attestation> = {}): Attestation =>
  ({ files, traceId: SID, ...extra });

function mustRefuse(d: CoverageDecisions, a: Attestation, t: Uint8Array | null, code: CoverageRefusalCode, what: string): FalsifierResult {
  const r = witnessCoverage(a, t, d, ROOT);
  if (r.kind !== "refused") return fail(`${what}: expected refusal [${code}], got ${r.kind}`);
  if (r.code !== code) return fail(`${what}: refused for the wrong reason — expected [${code}], got [${r.code}]`);
  return ok;
}

export const COVERAGE_FALSIFIERS: Falsifier[] = [
  {
    id: "RC-C1",
    law: "An attested file with no witnessing read event is refused. A reviewer cannot have inspected a file it never read, and the trace is a GATE, not an audit artefact.",
    run: d => mustRefuse(d, attest(["lib/a.ts", "lib/b.ts"]), trace(reads("lib/a.ts")),
      "UNVERIFIED_REVIEW_COVERAGE", "two files attested, one read"),
  },
  {
    id: "RC-C2",
    law: "A trace containing an unwitnessable read channel is REFUSED, never partially credited. A shell's reads cannot be soundly reduced to a file set, so coverage derived beside one is not a bound. Unrecognised tools are unwitnessable by default — fail closed.",
    run: d => {
      const shell = mustRefuse(d, attest(["lib/a.ts"]),
        trace([...reads("lib/a.ts"), { name: "Bash", input: { command: "sed -n '1,40p' lib/b.ts" } }]),
        "UNWITNESSABLE_READ_CHANNEL", "shell present alongside witnessed reads");
      if (!shell.pass) return shell;
      return mustRefuse(d, attest(["lib/a.ts"]),
        trace([...reads("lib/a.ts"), { name: "SomeFutureReader", input: { target: "lib/b.ts" } }]),
        "UNWITNESSABLE_READ_CHANNEL", "unrecognised tool present");
    },
  },
  {
    id: "RC-C3",
    law: "Path matching is EXACT after normalization. A read of `a.ts` may not witness a claim about `lib/a.ts` (suffix matching is not matching); and spelling — `./x`, absolute, backslashes — may never decide a coverage claim.",
    run: d => {
      const suffix = mustRefuse(d, attest(["lib/a.ts"]), trace(reads("a.ts")),
        "UNVERIFIED_REVIEW_COVERAGE", "suffix near-miss");
      if (!suffix.pass) return suffix;
      const r = witnessCoverage(attest(["./lib/a.ts"]), trace(reads("/repo/lib/a.ts")), d, ROOT);
      if (r.kind !== "witnessed") return fail(`equivalent spellings did not witness: refused [${r.code}]`);
      if (r.files.join() !== "lib/a.ts") return fail(`normalized attestation wrong: ${r.files.join()}`);
      return ok;
    },
  },
  {
    id: "RC-C4",
    law: "An empty trace against a non-empty attestation is refused, and so is no trace at all. Nothing to contradict a claim is not the same as evidence for it.",
    run: d => {
      const none = mustRefuse(d, attest(["lib/a.ts"]), null, "TRACE_EMPTY", "no trace supplied");
      if (!none.pass) return none;
      return mustRefuse(d, attest(["lib/a.ts"]),
        Buffer.from(JSON.stringify({ type: "system", session_id: SID }), "utf8"),
        "TRACE_EMPTY", "trace with records but no tool use");
    },
  },
  {
    id: "RC-C5",
    law: "An unparseable trace is TRACE_UNREADABLE, distinct from TRACE_EMPTY. Coercing malformed evidence to 'no events' converts an instrument failure into a finding about the reviewer.",
    run: d => mustRefuse(d, attest(["lib/a.ts"]), Buffer.from('{"type":"assistant" oops', "utf8"),
      "TRACE_UNREADABLE", "truncated trace"),
  },
  {
    id: "RC-C6",
    law: "Reads the review did not disclose are RECORDED, never refused. Reading more than you report is legitimate context gathering; the asymmetry is the law.",
    run: d => {
      const r = witnessCoverage(attest(["lib/a.ts"]), trace(reads("lib/a.ts", "lib/extra.ts")), d, ROOT);
      if (r.kind !== "witnessed") return fail(`undisclosed reads caused a refusal [${r.code}] instead of being recorded`);
      if (r.undisclosed.join() !== "lib/extra.ts") return fail(`undisclosed set wrong: [${r.undisclosed.join()}]`);
      return ok;
    },
  },
  {
    id: "RC-C7",
    law: "Trace provenance is EXTERNAL by construction. A review may not supply its own trace; evidence the subject produced about itself is the self-report this instrument exists to replace.",
    run: d => {
      const a = attest(["lib/a.ts"], { inlineTrace: trace(reads("lib/a.ts")).toString() });
      const r = witnessCoverage(a, null, d, ROOT);
      if (r.kind !== "refused") return fail(`an inline self-declared trace was accepted (${r.kind})`);
      if (r.code !== "TRACE_EMPTY" && r.code !== "TRACE_NOT_BOUND") {
        return fail(`refused for an unrelated reason [${r.code}]`);
      }
      return ok;
    },
  },
  {
    id: "RC-C8",
    law: "The trace must carry the review's declared identity. A trace spliced from another run witnesses nothing about this one.",
    run: d => mustRefuse(d, attest(["lib/a.ts"]), trace(reads("lib/a.ts"), "session-someone-else"),
      "TRACE_NOT_BOUND", "trace from a different session"),
  },
];

export { STRICT_COVERAGE };
