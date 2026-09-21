import {
  evaluateCompatibility, STRICT_COMPATIBILITY,
  type CompatibilityAttestation, type CompatibilityDecisions,
  type CompatibilityObservation, type CompatibilityRefusalCode,
} from "../../../scripts/migration-compatibility-core";

export type FResult = { pass: true } | { pass: false; why: string };
export type Falsifier = { id: string; law: string; run(d: CompatibilityDecisions): FResult };
const ok: FResult = { pass: true };
const fail = (why: string): FResult => ({ pass: false, why });

const OLD = "1".repeat(40), TARGET = "2".repeat(40);
const H1 = "a".repeat(64), H2 = "b".repeat(64), E1 = "c".repeat(64);
const M1 = "database/migrations/20990101000001_a.sql";
const M2 = "database/migrations/20990101000002_b.sql";
const ER = "lib/legacy-reader.ts";
const ET = "old-reader/" + OLD + "/lib/legacy-reader.ts";

const att = (): CompatibilityAttestation => ({
  instrument: "migration-compatibility/v1",
  verdict: "COMPATIBLE",
  old_reader_commit: OLD,
  target_reader_commit: TARGET,
  pending: [{ path: M1, sha256: H1 }, { path: M2, sha256: H2 }],
  old_reader_evidence: [{ repo_path: ER, sha256: E1, trace_path: ET }],
  rationale: "The old reader neither reads nor is rejected by the resulting schema.",
  limitations: ["Static source review; no production timing claim."],
});
const obs = (): CompatibilityObservation => ({
  oldReaderCommit: OLD,
  targetReaderCommit: TARGET,
  pending: [{ path: M1, sha256: H1 }, { path: M2, sha256: H2 }],
  oldReaderEvidence: [{ repo_path: ER, sha256: E1 }],
  witnessedFiles: [M1, M2, ET],
});
const mustRefuse = (
  d: CompatibilityDecisions,
  a: CompatibilityAttestation,
  o: CompatibilityObservation,
  code: CompatibilityRefusalCode,
  what: string,
): FResult => {
  const r = evaluateCompatibility(a, o, d);
  if (r.kind !== "refused") return fail(what + ": expected [" + code + "], got applies");
  if (r.code !== code) return fail(what + ": expected [" + code + "], got [" + r.code + "]");
  return ok;
};

export const FALSIFIERS: Falsifier[] = [
  { id: "MC-F1", law: "INCOMPATIBLE never authorizes.",
    run: d => { const a=att(); a.verdict="INCOMPATIBLE"; return mustRefuse(d,a,obs(),"OLD_READER_INCOMPATIBLE","verdict"); }},
  { id: "MC-F2", law: "Exact old-reader commit.",
    run: d => { const o=obs(); o.oldReaderCommit="3".repeat(40); return mustRefuse(d,att(),o,"OLD_READER_MOVED","old reader"); }},
  { id: "MC-F3", law: "Exact target-reader commit.",
    run: d => { const o=obs(); o.targetReaderCommit="4".repeat(40); return mustRefuse(d,att(),o,"TARGET_READER_MOVED","target"); }},
  { id: "MC-F4", law: "Exact ordered pending set.",
    run: d => { const o=obs(); o.pending=[o.pending[1]!,o.pending[0]!]; return mustRefuse(d,att(),o,"PENDING_SET_MOVED","order"); }},
  { id: "MC-F5", law: "Exact pending bytes.",
    run: d => { const o=obs(); o.pending[0]={...o.pending[0]!,sha256:"d".repeat(64)}; return mustRefuse(d,att(),o,"PENDING_CONTENT_MOVED","bytes"); }},
  { id: "MC-F6", law: "No duplicate pending paths.",
    run: d => { const a=att(); a.pending=[a.pending[0]!,{...a.pending[0]!}]; const o=obs(); o.pending=[o.pending[0]!,{...o.pending[0]!}]; return mustRefuse(d,a,o,"DUPLICATE_PENDING_PATH","duplicate"); }},
  { id: "MC-F7", law: "Old-reader source evidence is mandatory.",
    run: d => { const a=att(); a.old_reader_evidence=[]; const o=obs(); o.oldReaderEvidence=[]; o.witnessedFiles=[M1,M2]; return mustRefuse(d,a,o,"NO_OLD_READER_EVIDENCE","evidence"); }},
  { id: "MC-F8", law: "Old-reader evidence needs an exact physical Read witness; suffix/basename near-misses do not count.",
    run: d => { const o=obs(); o.witnessedFiles=[M1,M2,ER]; return mustRefuse(d,att(),o,"OLD_READER_EVIDENCE_UNWITNESSED","old evidence witness near-miss"); }},
  { id: "MC-F9", law: "Every pending migration needs a physical Read witness.",
    run: d => { const o=obs(); o.witnessedFiles=[M1,ET]; return mustRefuse(d,att(),o,"PENDING_MIGRATION_UNWITNESSED","pending witness"); }},
  { id: "MC-F10", law: "Rationale and limitations may not silently default.",
    run: d => { const a=att(); a.rationale=""; a.limitations=undefined as unknown as unknown[]; return mustRefuse(d,a,obs(),"MISSING_COMPATIBILITY_BASIS","basis"); }},
];

export { STRICT_COMPATIBILITY };
