/**
 * COVERAGE WITNESS — DEFEAT CANDIDATES  (DC-C1 … DC-C8)
 *
 * Each is the smallest competent embodiment of one coverage-witness error. Same
 * honest limit as the frozen corpus: one decision replaced on an identical
 * mechanical substrate, so lethality is DECISION-LEVEL, ⛔ not implementation-
 * independent.
 */
import {
  STRICT_COVERAGE, type CoverageDecisions, type TraceParse,
} from "../../../../scripts/review-custody-coverage";

export type Candidate = {
  id: string; name: string; kills: string; plausibility: string;
  collateral?: { id: string; reason: string }[];
  decisions: CoverageDecisions;
};

const with_ = (o: Partial<CoverageDecisions>): CoverageDecisions => ({ ...STRICT_COVERAGE, ...o });

export const COVERAGE_CANDIDATES: Candidate[] = [
  {
    id: "DC-C1",
    name: "the trace is for audit, not gating",
    kills: "RC-C1",
    plausibility: "The commonest shape of this mistake: capture the trace, attach it to the record for later inspection, and admit on the reviewer's own coverage list. It looks like evidence because the evidence is filed.",
    collateral: [{
      id: "RC-C3",
      reason: "An implementation that does not gate on the witness set cannot distinguish an exact match from a suffix near-miss — there is no comparison to be exact about. Narrowing it to kill only RC-C1 would require it to gate, i.e. to stop being 'the trace is for audit, not gating'.",
    }],
    decisions: with_({ unwitnessedOf: () => [] }),
  },
  {
    id: "DC-C2",
    name: "a shell is just another reader",
    kills: "RC-C2",
    plausibility: "Reviewers reach for `grep`/`sed` naturally, and refusing the whole trace over it feels like punishing normal work; ignoring unrecognised tools looks like forward compatibility.",
    decisions: with_({
      nonWitnessingTools: new Set([...STRICT_COVERAGE.nonWitnessingTools, "Bash"]),
      classifyUnknownTool: () => "ignore",
    }),
  },
  {
    id: "DC-C3",
    name: "suffix match is close enough",
    kills: "RC-C3",
    plausibility: "Paths arrive absolute, relative, and repo-relative from different layers; matching on the tail looks like robustness against that variety.",
    decisions: with_({ matches: (a, w) => a === w || a.endsWith(`/${w}`) || w.endsWith(`/${a}`) }),
  },
  {
    id: "DC-C4",
    name: "nothing to contradict the claim",
    kills: "RC-C4",
    plausibility: "An empty trace reads like a harness that did not emit rather than a reviewer that did not read; failing the review for the harness's silence feels wrong.",
    decisions: with_({ onEmptyTrace: () => "allow" }),
  },
  {
    id: "DC-C5",
    name: "unparseable means no events",
    kills: "RC-C5",
    plausibility: "Defensive parsing: a broken stream yields an empty event list and the normal path reports what is missing.",
    decisions: with_({
      parseTrace: (raw): TraceParse => {
        const r = STRICT_COVERAGE.parseTrace(raw);
        return r.kind === "malformed" ? { kind: "empty" } : r;
      },
    }),
  },
  {
    id: "DC-C6",
    name: "undisclosed reads are a coverage lie",
    kills: "RC-C6",
    plausibility: "Strictness instinct: if the reviewer read it, it should have said so, and a mismatch in either direction looks like the same defect.",
    decisions: with_({ onUndisclosed: () => "refuse" }),
  },
  {
    id: "DC-C7",
    name: "use the review's own trace when no other exists",
    kills: "RC-C7",
    plausibility: "The reviewer already knows what it did; letting it attach its trace looks like a graceful fallback when the harness capture is missing.",
    decisions: with_({
      traceSource: (external, inline) =>
        external !== null ? { kind: "external", raw: external }
          : typeof inline === "string" ? { kind: "inline", raw: Buffer.from(inline, "utf8") }
            : { kind: "none" },
    }),
  },
  {
    id: "DC-C8",
    name: "a trace is a trace",
    kills: "RC-C8",
    plausibility: "One reviewer run produces one trace file, so binding it by session id reads like ceremony over an obvious one-to-one.",
    decisions: with_({ bindTrace: () => "bound" }),
  },
];
