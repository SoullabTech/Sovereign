import {STRICT_PREFIX_COMPATIBILITY,type PrefixDecisions} from "../../../scripts/migration-prefix-compatibility-core";
export type Candidate={id:string;name:string;kills:string;decisions:PrefixDecisions};
const with_=(o:Partial<PrefixDecisions>):PrefixDecisions=>({...STRICT_PREFIX_COMPATIBILITY,...o});
export const CANDIDATES:Candidate[]=[
  {id:"MPC-DC1",name:"final compatibility implies failure safety",kills:"MPC-F1",
   decisions:with_({acceptVerdict:()=>true})},
  {id:"MPC-DC2",name:"only the final prefix matters",kills:"MPC-F2",
   decisions:with_({countMatches:()=>true})},
  {id:"MPC-DC3",name:"prefix filenames are enough",kills:"MPC-F3",
   decisions:with_({identityMatches:(e,p)=>e.through_path===p.path})},
  {id:"MPC-DC4",name:"prefix order is informational",kills:"MPC-F4",
   decisions:with_({identityMatches:(e,p)=>e.through_sha256===p.sha256})},
  {id:"MPC-DC5",name:"prefix basis may default",kills:"MPC-F5",
   decisions:with_({requireRationale:false,requireLimitations:false})},
];
