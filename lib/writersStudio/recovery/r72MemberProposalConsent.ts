/**
 * R72 · Fiction-only integration of existing immutable member proposal
 * succession with the real Writer beta consent/readiness gates.
 * MAIA authorship is NOT inferred from a row claiming author='maia':
 * a separately witnessed producing turn/provider run is required and this
 * module refuses those rows. No production provider or key is invoked.
 */
import {transaction,type TransactionClient} from '@/lib/db/postgres';
import {verifiedBetaConsentNotice} from '@/lib/writersStudio/betaConsentNotice';
import {explicitlyApprovedWriterMember,writersStudioBetaAccess}
 from '@/lib/writersStudio/betaAccessServer';
import {splitStoredSection} from '@/lib/manuscript/sections/sectionProjection';
export class R72Refused extends Error{
 constructor(public readonly reason:string,public readonly http=409){super('R72_'+reason);}
}

export const R72_PROTOCOL='soullab.ws.r72.member-authored-proposal-and-consent.fixture.v1';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail=(reason:string,http=409):never=>{throw new R72Refused(reason,http);};
export const enabledR72=()=>process.env.R72_MEMBER_PROPOSALS_FIXTURE==='fictional-only'&&
 process.env.R71_AUTHOR_EDITORIAL_FIXTURE==='fictional-only'&&
 process.env.NEXT_PUBLIC_R72_MEMBER_PROPOSALS_FIXTURE==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
   process.env.DATABASE_URL||'');

export async function requireR72CurrentConsent(tx:TransactionClient,memberId:string){
 if(!enabledR72())return fail('r72_disabled',404);
 const notice=verifiedBetaConsentNotice();
 if(!notice||!explicitlyApprovedWriterMember(
   memberId,process.env.WRITERS_STUDIO_BETA_MEMBER_IDS))
  return fail('unapproved_notice_or_writer',403);
 const access=await writersStudioBetaAccess(memberId);
 if(!access.eligible||access.basis!=='active_beta_tester')
  return fail('writer_beta_not_admitted',403);
 const consent=await tx.query<{
  seq:string;decision:string;policy_version:string;policy_sha256:string;
 }>(`SELECT seq,decision,policy_version,policy_sha256
        FROM writers_studio_beta_consent_events
       WHERE member_id=$1 ORDER BY seq DESC LIMIT 1`,[memberId]);
 const last=consent.rows[0];
 if(!last||last.decision!=='accept'||
  last.policy_version!==notice.version||
  last.policy_sha256!==notice.sha256)
  return fail('current_writer_consent_required',403);
 return {consentSequence:Number(last.seq),noticeSHA256:notice.sha256};
}
type ProposalRow={
 id:string;chain_id:string;author:string;formulation:string;
 member_id:string;work_id:string;draft_id:string;base_version:number;
 target_section_id:string;expected_text:string;
};
export async function resolveR72MemberVersion(tx:TransactionClient,scope:{
 memberId:string;manuscriptId:string;draftId:string;sectionId:string;
 baseVersion:number;expectedText:string;versionId:string;
}){
 if(!UUID.test(scope.versionId))return fail('invalid_proposal_id',400);
 const r=await tx.query<ProposalRow>(
 `SELECT v.id,v.chain_id,v.author,v.formulation,
         c.member_id,c.work_id,c.draft_id,c.base_version,
         c.target_section_id,c.expected_text
    FROM proposal_versions v
    JOIN proposal_chains c ON c.id=v.chain_id
   WHERE v.id=$1 AND c.member_id=$2`,[scope.versionId,scope.memberId]);
 const row=r.rows[0];
 if(!row)return fail('proposal_not_owned',404);
 if(row.work_id!==scope.manuscriptId||row.draft_id!==scope.draftId||
    row.target_section_id!==scope.sectionId||
    Number(row.base_version)!==scope.baseVersion||
    row.expected_text!==scope.expectedText)
  return fail('proposal_scope_moved');
 if(row.author!=='member')
  return fail('maia_producer_unverified');
 if(!row.formulation.trim()||Array.from(row.formulation).length>500)
  return fail('proposal_invalid');
 return {formulation:row.formulation,chainId:row.chain_id};
}
export async function getR72ProposalsForAppliedVersion(
 tx:TransactionClient,memberId:string,versionId:string){
 const r=await tx.query<{id:string;chain_id:string;author:string}>(
 `SELECT v.id,v.chain_id,v.author FROM proposal_versions v
    JOIN proposal_chains c ON c.id=v.chain_id
   WHERE v.id=$1 AND c.member_id=$2`,[versionId,memberId]);
 const chosen=r.rows[0];
 if(!chosen||chosen.author!=='member')return [];
 const rows=await tx.query<{id:string;author:string}>(
 `SELECT id,author FROM proposal_versions WHERE chain_id=$1
   ORDER BY authored_at,id`,[chosen.chain_id]);
 if(rows.rows.length!==2||rows.rows.some(x=>x.author!=='member'))return [];
 return rows.rows.map((v,i)=>({id:v.id,label:'Your formulation '+(i+1)}));
}
export async function stageR72MemberProposals(input:{
 memberId:string;manuscriptId:string;sectionId:string;
 generation:number;selected:{start:number;end:number;text:string};
 formulations:readonly string[];
}){
 if(!enabledR72())return fail('r72_disabled',404);
 if(!UUID.test(input.manuscriptId)||!UUID.test(input.sectionId)||
   !Number.isSafeInteger(input.generation)||input.generation<1||
   input.formulations.length!==2||
   input.formulations.some(x=>typeof x!=='string'||!x.trim()||
    x.length>500||x.includes('\0'))||
   input.formulations[0]===input.formulations[1]||
   !Number.isSafeInteger(input.selected.start)||
   !Number.isSafeInteger(input.selected.end)||
   input.selected.start<0||
   input.selected.end<=input.selected.start||
   !input.selected.text||input.selected.text.length>1200)
  return fail('invalid_member_formulations',400);
 return transaction(async tx=>{
  await requireR72CurrentConsent(tx,input.memberId);
  const d=await tx.query<{id:string;version:string}>(
   `SELECT d.id,d.version FROM manuscript_working_drafts d
     JOIN member_manuscripts m ON m.id=d.manuscript_id
    WHERE m.id=$1 AND m.member_id=$2 AND d.member_id=$2
      AND d.section_addressable_at IS NOT NULL FOR UPDATE OF d`,
    [input.manuscriptId,input.memberId]);
  const draft=d.rows[0];
  if(!draft)return fail('manuscript_not_owned',404);
  if(Number(draft.version)!==input.generation)return fail('stale_base');
  const s=await tx.query<{text:string;heading:string|null}>(
   `SELECT ds.text,ms.heading FROM manuscript_draft_sections ds
     LEFT JOIN manuscript_sections ms ON ms.id=ds.source_section_id
    WHERE ds.id=$1 AND ds.draft_id=$2`,[input.sectionId,draft.id]);
  const split=s.rows[0]?
   splitStoredSection(s.rows[0].text,s.rows[0].heading):null;
  if(!split||Array.from(split.body).slice(
    input.selected.start,input.selected.end).join('')!==input.selected.text)
   return fail('exact_passage_moved');
  const c=await tx.query<{id:string}>(
   `INSERT INTO proposal_chains
    (member_id,work_id,draft_id,base_version,target_section_id,expected_text)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [input.memberId,input.manuscriptId,draft.id,input.generation,
     input.sectionId,input.selected.text]);
  const chainId=c.rows[0].id;
  const ids:string[]=[];
  for(const formulation of input.formulations){
   const v=await tx.query<{id:string}>(
    `INSERT INTO proposal_versions
       (chain_id,author,formulation,supersedes)
       VALUES ($1,'member',$2,$3) RETURNING id`,
       [chainId,formulation,ids.length?ids[0]:null]);
   ids.push(v.rows[0].id);
  }
  return {kind:'r72_member_authored_versions' as const,
   alternatives:ids.map((id,i)=>({id,label:'Your formulation '+(i+1)})),
   chainId,author:'member' as const,releaseApproved:false as const};
 });
}
export async function recordR72ConsentRevoke(memberId:string){
 if(!enabledR72())return fail('r72_disabled',404);
 return transaction(async tx=>{
  await requireR72CurrentConsent(tx,memberId);
  const notice=verifiedBetaConsentNotice();
  if(!notice)return fail('notice_missing',403);
  await tx.query(
   `INSERT INTO writers_studio_beta_consent_events
     (member_id,actor_member_id,decision,policy_version,policy_sha256)
     VALUES ($1,$1,'revoke',$2,$3)`,
    [memberId,notice.version,notice.sha256]);
  return {kind:'fictional_member_consent_revoked' as const,
   releaseApproved:false as const};
 });
}
