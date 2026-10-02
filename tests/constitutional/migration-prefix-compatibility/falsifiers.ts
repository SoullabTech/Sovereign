import {
  evaluatePrefixCompatibility, STRICT_PREFIX_COMPATIBILITY,
  type PrefixCompatibilityAttestation, type PrefixDecisions, type PrefixRefusalCode,
} from "../../../scripts/migration-prefix-compatibility-core";
import type { PendingMigration } from "../../../scripts/migration-compatibility-core";

export type FResult={pass:true}|{pass:false;why:string};
export type Falsifier={id:string;law:string;run(d:PrefixDecisions):FResult};
const ok:FResult={pass:true};
const fail=(why:string):FResult=>({pass:false,why});
const H1="a".repeat(64),H2="b".repeat(64);
const M1="database/migrations/a.sql",M2="database/migrations/b.sql";
const pending=():PendingMigration[]=>[{path:M1,sha256:H1},{path:M2,sha256:H2}];
const att=():PrefixCompatibilityAttestation=>({
  instrument:"migration-prefix-compatibility/v1",
  verdict:"ALL_PREFIXES_COMPATIBLE",
  prefixes:[
    {through_path:M1,through_sha256:H1,rationale:"old reader tolerates schema after prefix 1",limitations:[]},
    {through_path:M2,through_sha256:H2,rationale:"old reader tolerates schema after prefix 2",limitations:[]},
  ],
});
function mustRefuse(d:PrefixDecisions,a:PrefixCompatibilityAttestation,p:PendingMigration[],
  code:PrefixRefusalCode,what:string):FResult{
  const r=evaluatePrefixCompatibility(a,p,d);
  if(r.kind!=="refused")return fail(what+": expected ["+code+"], got applies");
  if(r.code!==code)return fail(what+": expected ["+code+"], got ["+r.code+"]");
  return ok;
}
export const FALSIFIERS:Falsifier[]=[
  {id:"MPC-F1",law:"A final-schema COMPATIBLE claim cannot substitute for all-prefix compatibility.",
   run:d=>{const a=att();a.verdict="NOT_ALL_PREFIXES_COMPATIBLE";return mustRefuse(d,a,pending(),"PREFIX_INCOMPATIBLE","verdict");}},
  {id:"MPC-F2",law:"Every committed prefix must be covered.",
   run:d=>{const a=att();a.prefixes=a.prefixes.slice(1);return mustRefuse(d,a,pending(),"PREFIX_COUNT_MISMATCH","missing prefix");}},
  {id:"MPC-F3",law:"Each prefix is bound to the exact migration bytes ending it.",
   run:d=>{const a=att();a.prefixes[0]={...a.prefixes[0]!,through_sha256:"c".repeat(64)};
     return mustRefuse(d,a,pending(),"PREFIX_IDENTITY_MISMATCH","prefix bytes");}},
  {id:"MPC-F4",law:"Prefix order/path identity is exact even when per-position bytes are held constant.",
   run:d=>{const a=att();
     a.prefixes=[
       {...a.prefixes[0]!,through_path:M2},
       {...a.prefixes[1]!,through_path:M1},
     ];
     return mustRefuse(d,a,pending(),"PREFIX_IDENTITY_MISMATCH","prefix order/path");}},
  {id:"MPC-F5",law:"Every prefix states its compatibility basis and limitations.",
   run:d=>{const a=att();a.prefixes[0]={...a.prefixes[0]!,rationale:""};
     return mustRefuse(d,a,pending(),"PREFIX_BASIS_MISSING","prefix basis");}},
];
export {STRICT_PREFIX_COMPATIBILITY};
