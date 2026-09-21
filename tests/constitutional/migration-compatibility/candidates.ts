import { STRICT_COMPATIBILITY, type CompatibilityDecisions } from "../../../scripts/migration-compatibility-core";

export type Candidate = {
  id: string; name: string; kills: string;
  collateral?: { id: string; reason: string }[];
  decisions: CompatibilityDecisions;
};
const with_ = (o: Partial<CompatibilityDecisions>): CompatibilityDecisions =>
  ({ ...STRICT_COMPATIBILITY, ...o });

export const CANDIDATES: Candidate[] = [
  { id:"MC-DC1", name:"review happened, therefore compatible", kills:"MC-F1",
    decisions:with_({compatibleVerdict:()=>true}) },
  { id:"MC-DC2", name:"old reader identity is informational", kills:"MC-F2",
    decisions:with_({oldReaderMatches:()=>true}) },
  { id:"MC-DC3", name:"target identity is informational", kills:"MC-F3",
    decisions:with_({targetReaderMatches:()=>true}) },
  { id:"MC-DC4", name:"pending membership matters, order does not", kills:"MC-F4",
    decisions:with_({pendingPathsMatch:(a,b)=>a.length===b.length&&[...a].sort().every((x,i)=>x===[...b].sort()[i])}) },
  { id:"MC-DC5", name:"filename identity is enough", kills:"MC-F5",
    decisions:with_({hashMatches:()=>true}) },
  { id:"MC-DC6", name:"duplicate paths are harmless", kills:"MC-F6",
    decisions:with_({duplicatePaths:()=>[]}) },
  { id:"MC-DC7", name:"migration shape alone proves compatibility", kills:"MC-F7",
    decisions:with_({requireOldReaderEvidence:false}) },
  { id:"MC-DC8", name:"trace suffix matching is close enough", kills:"MC-F8",
    decisions:with_({witnessContains:(a,w)=>w.some(x=>x===a||x.endsWith("/"+a)||a.endsWith("/"+x))}) },
  { id:"MC-DC9", name:"pending migration reads are optional", kills:"MC-F9",
    decisions:with_({requirePendingWitness:false}) },
  { id:"MC-DC10", name:"basis metadata is optional", kills:"MC-F10",
    decisions:with_({requireRationale:false,requireLimitations:false}) },
];
