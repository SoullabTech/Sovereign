import {
  STRICT_COMPOSITION,
  type CompositionDecisions,
} from "../../../scripts/migration-compatibility-gate-core";

export type Candidate = { id:string; name:string; kills:string; decisions:CompositionDecisions };
const with_=(o:Partial<CompositionDecisions>):CompositionDecisions=>({...STRICT_COMPOSITION,...o});

export const CANDIDATES: Candidate[] = [
  {id:"MCG-DC1",name:"compatibility rescues custody",kills:"MCG-F1",
   decisions:with_({acceptCustody:()=>true})},
  {id:"MCG-DC2",name:"sidecar compatibility is equivalent",kills:"MCG-F2",
   decisions:with_({acceptCompatibilitySource:()=>true})},
  {id:"MCG-DC3",name:"target equality is implied",kills:"MCG-F3",
   decisions:with_({targetMatches:()=>true})},
  {id:"MCG-DC4",name:"custody and compatibility pending sets may differ",kills:"MCG-F4",
   decisions:with_({pendingMatches:()=>true})},
  {id:"MCG-DC5",name:"compatibility may bring its own trace",kills:"MCG-F5",
   decisions:with_({witnessCorpus:(custody,candidate)=>candidate??custody})},
  {id:"MCG-DC6",name:"custody approval rescues compatibility",kills:"MCG-F6",
   decisions:with_({acceptCompatibility:()=>true})},
];
