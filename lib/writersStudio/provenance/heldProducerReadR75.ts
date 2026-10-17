/**
 * R75 REVIEW-ONLY SQL verifier. A row claiming author='maia' is never
 * enough: the immutable producer record must match the exact member/Work,
 * proposal bytes, current consent event and a pinned server public key.
 * No production route mounts this function. It cannot Apply or Undo.
 */
import type {KeyLike} from 'node:crypto';
import type {TransactionClient} from '@/lib/db/postgres';
import {requireR72CurrentConsent}
 from '@/lib/writersStudio/recovery/r72MemberProposalConsent';
import {R75_REAL_PRODUCER_ATTESTATION_ENABLED,
 verifyCompletedProducerR75,R75_PROTOCOL,
 type R75Scope,type R75Record,type R75Verdict,
} from './editorialModelProducerR75';
const dbRe=/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/;
const UUID=/^[a-f\d]{8}-[a-f\d]{4}-[1-8][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
type Row={
 author:string;formulation:string;member_id:string;
 work_id:string;draft_id:string;target_section_id:string;base_version:number;
 proposal_version_id:string|null;server_invocation_id:string|null;
 witness_member_id:string|null;witness_manuscript_id:string|null;
 witness_draft_id:string|null;witness_section_id:string|null;
 witness_base_version:number|null;consent_sequence:number|null;
 policy_sha256:string|null;instruction_contract_sha256:string|null;
 served_provider:'ollama'|'anthropic'|null;served_model:string|null;
 intended_provider:'ollama'|'anthropic'|null;intended_model:string|null;
 divergence:'none'|'capability'|'sovereignty'|null;
 proposal_commitment:string|null;signed_at_ms:number|null;
 signature:string|null;
};
const denied=(reason:string):R75Verdict=>({
 kind:'r75_producer_unverified',reason,releaseApproved:false,
 canApply:false,canUndo:false,
});
export type R75ReadInput={
 memberId:string;manuscriptId:string;draftId:string;sectionId:string;
 proposalVersionId:string;baseVersion:number;
 instructionContractSHA256:string;
 publicKey:KeyLike;contentSecret:Buffer;nowMs:number;
};
export async function inspectCurrentProducerR75(
 tx:TransactionClient,context:R75ReadInput,
):Promise<R75Verdict>{
 if(R75_REAL_PRODUCER_ATTESTATION_ENABLED!==false||
  process.env.NODE_ENV!=='test'||
  process.env.R75_PG_SQL_READ_FIXTURE!=='fictional-only'||
  process.env.R72_MEMBER_PROPOSALS_FIXTURE!=='fictional-only'||
  !dbRe.test(process.env.DATABASE_URL||''))
  return denied('not_approved_for_actual_writer');
 if(!context||![context.memberId,context.manuscriptId,
  context.draftId,context.sectionId,context.proposalVersionId].every(
   value=>UUID.test(value||'')))
  return denied('invalid_member_work_scope');
 try{
  // Current consent must be read inside the same writer transaction.
  const active=await requireR72CurrentConsent(tx,context.memberId);
  if(!Number.isSafeInteger(active.consentSequence)||
   active.consentSequence<=0)return denied('current_consent_missing');
  const res=await tx.query<Row>(`
   SELECT v.author,v.formulation,
     c.member_id,c.work_id,c.draft_id,c.target_section_id,c.base_version,
     w.proposal_version_id,w.server_invocation_id,
     w.member_id AS witness_member_id,
     w.manuscript_id AS witness_manuscript_id,
     w.draft_id AS witness_draft_id,
     w.section_id AS witness_section_id,
     w.base_version AS witness_base_version,w.consent_sequence,
     w.policy_sha256,w.instruction_contract_sha256,
     w.served_provider,w.served_model,w.intended_provider,w.intended_model,
     w.divergence,w.proposal_commitment,w.signed_at_ms,w.signature
   FROM proposal_versions v
   JOIN proposal_chains c ON c.id=v.chain_id
   LEFT JOIN ws_r75_fixture_producer_witness w ON w.proposal_version_id=v.id
   WHERE v.id=$1 AND c.member_id=$2 AND c.work_id=$3
     AND c.draft_id=$4 AND c.target_section_id=$5 AND c.base_version=$6
   LIMIT 1`,[
    context.proposalVersionId,context.memberId,context.manuscriptId,
    context.draftId,context.sectionId,context.baseVersion,
   ]);
  const row=res.rows[0];
  if(!row)return denied('proposal_not_owned_or_current');
  if(row.member_id!==context.memberId||
   row.work_id!==context.manuscriptId||row.draft_id!==context.draftId||
   row.target_section_id!==context.sectionId||
   Number(row.base_version)!==context.baseVersion)
   return denied('proposal_scope_changed');
  if(row.author!=='maia'||!row.proposal_version_id)
   return denied('no_verified_maia_producer');
  const scope:R75Scope={
   memberId:context.memberId,manuscriptId:context.manuscriptId,
   draftId:context.draftId,sectionId:context.sectionId,
   proposalVersionId:context.proposalVersionId,
   baseVersion:context.baseVersion,
   consentSequence:active.consentSequence,
   policySHA256:active.noticeSHA256,
   instructionContractSHA256:context.instructionContractSHA256,
  };
  const record:R75Record={
   assertion:{
    protocol:R75_PROTOCOL,
    serverInvocationId:row.server_invocation_id??'',
    scope:{
     memberId:row.witness_member_id??'',
     manuscriptId:row.witness_manuscript_id??'',
     draftId:row.witness_draft_id??'',
     sectionId:row.witness_section_id??'',
     proposalVersionId:row.proposal_version_id,
     baseVersion:Number(row.witness_base_version),
     consentSequence:Number(row.consent_sequence),
     policySHA256:row.policy_sha256??'',
     instructionContractSHA256:row.instruction_contract_sha256??'',
    },
    producer:{
     servedProvider:row.served_provider as 'ollama',
     servedModel:row.served_model??'',
     intendedProvider:row.intended_provider as 'ollama',
     intendedModel:row.intended_model??'',
     divergence:row.divergence as 'none',
    },
    proposalCommitment:row.proposal_commitment??'',
    issuedAtMs:Number(row.signed_at_ms),
   },
   signature:row.signature??'',
  };
  return verifyCompletedProducerR75(record,{
   expectedScope:scope,expectedProposal:row.formulation,
   publicKey:context.publicKey,contentSecret:context.contentSecret,
   nowMs:context.nowMs,
  });
 }catch{return denied('producer_or_consent_custody_unavailable');}
}
