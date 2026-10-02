import {
  composeMigrationGate,
  STRICT_COMPOSITION,
  type CompositionDecisions,
  type CustodyState,
  type CompatibilityObservationInput,
  type CompositionRefusalCode,
} from "../../../scripts/migration-compatibility-gate-core";
import type { CompatibilityAttestation } from "../../../scripts/migration-compatibility-core";

export type FResult = { pass: true } | { pass: false; why: string };
export type Falsifier = { id: string; law: string; run(d: CompositionDecisions): FResult };
const ok: FResult = { pass: true };
const fail = (why: string): FResult => ({ pass: false, why });

const OLD="1".repeat(40), TARGET="2".repeat(40), OTHER="3".repeat(40);
const H1="a".repeat(64), H2="b".repeat(64), E1="c".repeat(64);
const M1="database/migrations/20990101000001_a.sql";
const M2="database/migrations/20990101000002_b.sql";
const ER="lib/legacy-reader.ts";
const ET="old-reader/"+OLD+"/lib/legacy-reader.ts";

const custody = (): CustodyState => ({
  applies:true,
  targetReaderCommit:TARGET,
  pending:[{path:M1,sha256:H1},{path:M2,sha256:H2}],
  witnessedFiles:[M1,M2,ET],
});
const att = (): CompatibilityAttestation => ({
  instrument:"migration-compatibility/v1",
  verdict:"COMPATIBLE",
  old_reader_commit:OLD,
  target_reader_commit:TARGET,
  pending:[{path:M1,sha256:H1},{path:M2,sha256:H2}],
  old_reader_evidence:[{repo_path:ER,sha256:E1,trace_path:ET}],
  rationale:"old reader tolerates the exact resulting schema",
  limitations:[],
});
const obs = (): CompatibilityObservationInput => ({
  oldReaderCommit:OLD,
  targetReaderCommit:TARGET,
  pending:[{path:M1,sha256:H1},{path:M2,sha256:H2}],
  oldReaderEvidence:[{repo_path:ER,sha256:E1}],
});

function mustRefuse(
  d: CompositionDecisions,
  c: CustodyState,
  a: CompatibilityAttestation,
  source: "admitted_review" | "sidecar",
  o: CompatibilityObservationInput,
  code: CompositionRefusalCode,
  what: string,
): FResult {
  const r=composeMigrationGate(c,a,source,o,d);
  if (r.kind!=="refused") return fail(what+": expected ["+code+"], got applies");
  if (r.code!==code) return fail(what+": expected ["+code+"], got ["+r.code+"]");
  return ok;
}

export const FALSIFIERS: Falsifier[] = [
  {id:"MCG-F1",law:"Custody refusal is terminal; compatibility cannot rescue it.",
   run:d=>{const c=custody();c.applies=false;c.refusalCode="NO_APPROVED_REVIEW";
     return mustRefuse(d,c,att(),"admitted_review",obs(),"CUSTODY_REFUSED","custody refusal");}},
  {id:"MCG-F2",law:"Compatibility must inhabit the exact admitted review bytes, never a sidecar.",
   run:d=>mustRefuse(d,custody(),att(),"sidecar",obs(),"COMPATIBILITY_NOT_IN_ADMITTED_REVIEW","sidecar")},
  {id:"MCG-F3",law:"Composition target equals the target reader custody bound.",
   run:d=>{const o=obs();o.targetReaderCommit=OTHER;const a=att();a.target_reader_commit=OTHER;
     return mustRefuse(d,custody(),a,"admitted_review",o,"COMPOSITION_TARGET_MISMATCH","target mismatch");}},
  {id:"MCG-F4",law:"Composition uses the exact ordered pending paths and hashes custody gated.",
   run:d=>{const o=obs();o.pending=[o.pending[1]!,o.pending[0]!];const a=att();a.pending=[a.pending[1]!,a.pending[0]!];
     return mustRefuse(d,custody(),a,"admitted_review",o,"COMPOSITION_PENDING_MISMATCH","pending mismatch");}},
  {id:"MCG-F5",law:"Old-reader evidence must be witnessed by the custody-admitted trace, not a second corpus.",
   run:d=>{const c=custody();c.witnessedFiles=[M1,M2];const o=obs();o.candidateWitnessedFiles=[M1,M2,ET];
     return mustRefuse(d,c,att(),"admitted_review",o,"COMPATIBILITY_REFUSED","second witness corpus");}},
  {id:"MCG-F6",law:"Compatibility refusal is terminal; custody approval cannot rescue it.",
   run:d=>{const a=att();a.verdict="INCOMPATIBLE";
     return mustRefuse(d,custody(),a,"admitted_review",obs(),"COMPATIBILITY_REFUSED","compatibility refusal");}},
];

export { STRICT_COMPOSITION };
