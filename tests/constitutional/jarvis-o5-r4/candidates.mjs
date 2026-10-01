import * as R from './reference.mjs';
import { CONSEQUENCE_FORBIDDEN_FIELDS } from './contract.mjs';

const base=()=>({appendEvidence:R.appendEvidence,projectProposal:R.projectProposal,projectProposalSet:R.projectProposalSet,projectConsequenceFinding:R.projectConsequenceFinding,v1RuntimeCallers:R.v1RuntimeCallers});
export const CANDIDATES=Object.freeze([
  {id:'DC-E1',kills:'R4-E1',description:'evidence append also rewrites authority',decision:{...base(),appendEvidence:(env,e)=>{const r=R.appendEvidence(env,e);if(r.ok)r.envelope.work_unit.authority.merge=true;return r;}}},
  {id:'DC-E2',kills:'R4-E2',description:'open schema preserves extra fields',decision:{...base(),appendEvidence:(env,e)=>{const clean=Object.fromEntries(Object.entries(e).filter(([k])=>!CONSEQUENCE_FORBIDDEN_FIELDS.includes(k)&&k!=='target_file'));const r=R.appendEvidence(env,clean);if(r.ok){const b=e.kind==='proposal'?'proposals':'findings';r.envelope.work_unit.evaluation[b][0]={...r.envelope.work_unit.evaluation[b][0],...e};}return r;}}},
  {id:'DC-E3',kills:'R4-E3',description:'duplicates append again',decision:{...base(),appendEvidence:(env,e)=>{const r=R.appendEvidence(env,e);if(!r.ok&&r.reason==='DUPLICATE_EVIDENCE_RECORD'){const n=structuredClone(env);const b=e.kind==='proposal'?'proposals':'findings';n.work_unit.evaluation[b].push({...e,_evidence_identity:R.evidenceIdentity(e)});return {ok:true,envelope:n};}return r;}}},
  {id:'DC-E4',kills:'R4-E4',description:'W4 append mutates O1 as a side effect',decision:{...base(),appendEvidence:(env,e,p)=>{const r=R.appendEvidence(env,e);if(p&&e.kind==='proposal')p.o1Candidates.push(R.projectProposal(e));return r;}}},
  {id:'DC-E5',kills:'R4-E5',description:'proposal is promoted to clear authority-bearing intent',decision:{...base(),projectProposal:(e)=>({standing:'CLEAR',raw_utterance:e.summary,source:'executor-proposal',source_ref:'x',authority_grants:['merge']})}},
  {id:'DC-E6',kills:'R4-E6',description:'finding is projected as candidate too',decision:{...base(),projectProposal:(e)=>e?.kind==='finding'?({standing:'CANDIDATE',raw_utterance:e.summary||e.reason,source:'executor-finding',source_ref:'x',authority_grants:[]}):R.projectProposal(e)}},
  {id:'DC-E7',kills:'R4-E7',description:'projection deduplicates by summary',decision:{...base(),projectProposalSet:(entries)=>{const seen=new Set(),out=[];for(const e of entries){if(seen.has(e.summary))continue;seen.add(e.summary);const c=R.projectProposal(e);if(c)out.push(c);}return out;}}},
  {id:'DC-E8',kills:'R4-E8',description:'a runtime caller silently reintroduces W4 v1',decision:{...base(),v1RuntimeCallers:()=>['jarvis-desktop/src/legacy-runtime.js:1: work-unit-ledger-v1.mjs']}},
  {id:'DC-E9',kills:'R4-E9',description:'consequence finding is stored locally but never projected to its affected lane',decision:{...base(),projectConsequenceFinding:()=>null}},
]);
