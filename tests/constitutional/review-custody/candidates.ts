/**
 * REVIEW CUSTODY — DEFEAT CANDIDATES  (DC-1 … DC-14)
 *
 * Each candidate is the SMALLEST COMPETENT EMBODIMENT of one named custody error:
 * a mistake a careful engineer actually makes, not a strawman. A candidate that
 * survives its named falsifier means the SUITE is repaired — never the candidate.
 *
 * ⚠️ HONEST LIMIT OF THIS CORPUS, stated rather than discovered later:
 *    each candidate replaces exactly ONE decision on an otherwise-identical
 *    mechanical substrate. The suite therefore demonstrates DECISION-LEVEL
 *    lethality. ⛔ It does NOT establish lethality against an independently
 *    authored implementation that makes the same error by a different route.
 *    Buying that would mean fourteen standalone implementations, whose accidental
 *    differences would produce unclassified collateral and weaker evidence.
 *
 * ⭐ COLLATERAL RULE (carried from the S3 Class-B freeze): collateral is CLASSIFIED
 *    when narrowing the candidate to kill only its named falsifier would require it
 *    to stop being the error it models. Anything else is UNCLASSIFIED and is an
 *    isolation defect in the corpus, not a finding about the suite.
 */
import {
  STRICT, sha256,
  type CustodyDecisions, type Severity,
} from "../../../scripts/review-custody-core";

export type Candidate = {
  id: string;
  name: string;
  /** The falsifier this candidate must die on. */
  kills: string;
  /** Why an engineer would write it this way. */
  plausibility: string;
  /** Other falsifiers it necessarily also defeats, each with the reason narrowing is impossible. */
  collateral?: { id: string; reason: string }[];
  decisions: CustodyDecisions;
};

const with_ = (o: Partial<CustodyDecisions>): CustodyDecisions => ({ ...STRICT, ...o });

export const CANDIDATES: Candidate[] = [
  {
    id: "DC-1",
    name: "mediums are nits",
    kills: "RC-F1",
    plausibility: "The commonest severity policy in real review tooling: block on high, let medium ride as advisory.",
    decisions: with_({ isMaterial: f => f.severity === "high" }),
  },
  {
    id: "DC-2",
    name: "trusts the review's own plan claim",
    kills: "RC-F2",
    plausibility: "The review states which plan it read; taking that at face value looks like respecting the reviewer rather than second-guessing it.",
    decisions: with_({ planBinding: () => "match" }),
  },
  {
    id: "DC-3",
    name: "empty output is an empty object",
    kills: "RC-F3",
    plausibility: "Defensive parsing: coerce nothing to {} and let schema validation report what is missing.",
    decisions: with_({ parseReview: raw => (raw.byteLength === 0 ? { kind: "ok", value: {} } : STRICT.parseReview(raw)) }),
  },
  {
    id: "DC-4",
    name: "lenient parse recovers the leading object",
    kills: "RC-F4",
    plausibility: "Model output is often wrapped or duplicated, so parsing the first complete JSON value and ignoring the tail looks like robustness.",
    decisions: with_({
      parseReview: raw => {
        const text = Buffer.from(raw).toString("utf8");
        if (text.length === 0) return { kind: "empty" };
        // Recover the first balanced top-level object, ignoring anything after it.
        let depth = 0, inStr = false, esc = false;
        for (let i = 0; i < text.length; i++) {
          const c = text[i] as string;
          if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
          if (c === '"') inStr = true;
          else if (c === "{") depth += 1;
          else if (c === "}") {
            depth -= 1;
            if (depth === 0) {
              try {
                const v: unknown = JSON.parse(text.slice(0, i + 1));
                if (v && typeof v === "object" && !Array.isArray(v)) return { kind: "ok", value: v as Record<string, unknown> };
              } catch { /* fall through */ }
              return { kind: "malformed" };
            }
          }
        }
        return { kind: "malformed" };
      },
    }),
  },
  {
    id: "DC-5",
    name: "coverage is informational",
    kills: "RC-F5",
    plausibility: "Coverage reads like reporting metadata, and reviewers often leave it thin; refusing on it feels like pedantry.",
    decisions: with_({ coverage: files => ({ kind: "ok", files: Array.isArray(files) ? files.map(String) : [] }) }),
  },
  {
    id: "DC-6",
    name: "de-duplicates findings by id",
    kills: "RC-F6",
    plausibility: "Keying findings into a Map by id is the natural implementation, and a repeated id looks like a harmless reviewer slip.",
    decisions: with_({ duplicateId: () => "dedupe" }),
  },
  {
    id: "DC-7",
    name: "last write wins",
    kills: "RC-F7",
    plausibility: "Upsert is the default instinct for a record keyed by one thing, and 're-run the review' feels like it should refresh the record.",
    decisions: with_({ onExistingApproval: () => "overwrite" }),
  },
  {
    id: "DC-8",
    name: "staleness IS the commit",
    kills: "RC-F8",
    plausibility: "Git already identifies a state of the tree; comparing HEAD looks like the canonical, cheapest staleness test.",
    collateral: [
      { id: "RC-F9", reason: "An implementation whose staleness notion is the commit cannot see a working-tree change of any kind. Giving it a manifest to consult would stop it being this error." },
      { id: "RC-F10", reason: "Same root: no manifest is consulted, so content movement is invisible. Narrowing to kill only RC-F8 would require adding the plan hash AND the manifest, i.e. ceasing to be 'staleness is the commit'." },
    ],
    decisions: with_({ checkSignals: ["head"] }),
  },
  {
    id: "DC-9",
    name: "tracked-only manifest",
    kills: "RC-F9",
    plausibility: "`git diff --name-only HEAD` is the obvious change list, and untracked files read as scratch noise rather than part of the change.",
    decisions: with_({ manifestPaths: paths => paths.filter(p => !p.untracked).map(p => p.path) }),
  },
  {
    id: "DC-10",
    name: "the manifest is the set of touched paths",
    kills: "RC-F10",
    plausibility: "Hashing every changed file is expensive on a large diff; the path list is cheap and 'identifies the change'.",
    decisions: with_({ manifestHash: (_env, p) => sha256(p) }),
  },
  {
    id: "DC-11",
    name: "limitations default to none",
    kills: "RC-F11",
    plausibility: "Defaulting an absent array to [] is idiomatic everywhere else in the codebase.",
    decisions: with_({ limitations: raw => ({ kind: "ok", items: Array.isArray(raw) ? raw : [] }) }),
  },
  {
    id: "DC-12",
    name: "evidence is optional prose",
    kills: "RC-F12",
    plausibility: "Severity and location are the machine-readable parts; evidence reads like a human-facing nicety that reviewers sometimes skip.",
    decisions: with_({ evidence: raw => ({ kind: "ok", text: typeof raw === "string" ? raw : "" }) }),
  },
  {
    id: "DC-13",
    name: "open severity vocabulary",
    kills: "RC-F13",
    plausibility: "Forward compatibility: accept whatever severity a future reviewer emits and treat the unrecognised as low rather than failing the run.",
    decisions: with_({
      severity: raw => {
        const s = typeof raw === "string" ? raw : "";
        return { kind: "ok", value: (["high", "medium", "low"] as string[]).includes(s) ? (s as Severity) : "low" };
      },
    }),
  },
  {
    id: "DC-14",
    name: "a review exists, therefore reviewed",
    kills: "RC-F14",
    plausibility: "The record's job is to prove a review happened; whether the verdict was APPROVED feels like a separate reporting concern.",
    decisions: with_({ checkRequiresApproved: false }),
  },
];
