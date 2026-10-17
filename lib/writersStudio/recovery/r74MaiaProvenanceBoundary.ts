/**
 * R74 — Strict READ-ONLY attribution admission for existing MAIA-authored
 * proposal versions. This does not call a model or create new MAIA prose.
 *
 * A version claiming 'maia' is not a verified provider response. The proof
 * chain must come from the canonical transactional editorial runtime:
 * version -> turn binding -> actual append-only MAIA turn -> persisted
 * structured-router provenance (provider-reported, agreed exact model).
 *
 * This structural check is necessary, NOT SUFFICIENT for beta Apply:
 * unsealed proposal_versions.formulation and no independent private custody
 * remain a release HOLD even when all linkage/provenance fields agree.
 */
import type {TransactionClient} from '@/lib/db/postgres';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Provenance={
 provider?:unknown; model?:unknown; reportedModel?:unknown;
 modelAgreement?:unknown; runtime?:unknown;
};
type Row={
 version_id:string; author:string;
 turn_index:number; thread_id:string;
 speaker:string; act_author:string;
 answer_provenance:unknown;
};
export type R74MaiaProvenance=
 |{kind:'refused';reason:
  'invalid_scope'|'turn_binding_missing_or_not_owned'|
  'turn_not_maia'|'provider_model_unattributable'|
  'editorial_runtime_unproven';mayApply:false;releaseApproved:false}
 |{kind:'structurally_attributed';provider:string;
  reportedModel:string;threadId:string;turnIndex:number;
  /** No plaintext persistence/cipher/cross-node consent commit established. */
  mayApply:false;releaseApproved:false;privateCustody:'unverified'};
const refusal=(reason:Extract<R74MaiaProvenance,{kind:'refused'}>['reason'])=>
 ({kind:'refused' as const,reason,mayApply:false as const,releaseApproved:false as const});
const validName=(x:unknown)=>typeof x==='string'&&
 x.length>=2&&x.length<=160&&
 !/[\x00-\x1f\x7f]/.test(x)&&!x.startsWith('unknown');
export function gradeR74ActualModelProvenance(input:unknown):
 {ok:true;provider:string;reportedModel:string}|{ok:false;reason:'provider_model_unattributable'|'editorial_runtime_unproven'}{
 if(!input||typeof input!=='object'||Array.isArray(input))
  return {ok:false,reason:'provider_model_unattributable'};
 const p=input as Provenance;
 // ER-R4 is the existing actual structured-model service, which checks
 // reportedModel + agreement BEFORE persisting an authored MAIA turn.
 if(p.runtime!=='ws-editorial-runtime-01/er-r4')
  return {ok:false,reason:'editorial_runtime_unproven'};
 if(!validName(p.provider)||!validName(p.model)||
   !validName(p.reportedModel)||p.modelAgreement!=='agreed'||
   p.model!==p.reportedModel)
  return {ok:false,reason:'provider_model_unattributable'};
 return {ok:true,provider:p.provider as string,
  reportedModel:p.reportedModel as string};
}
export async function lookupR74MaiaProvenance(
 tx:TransactionClient,scope:{
  memberId:string;manuscriptId:string;versionId:string;
 }):Promise<R74MaiaProvenance>{
 if(!UUID.test(scope.memberId)||!UUID.test(scope.manuscriptId)||
    !UUID.test(scope.versionId))return refusal('invalid_scope');
 const rows=await tx.query<Row>(
  `SELECT v.id AS version_id,v.author,b.thread_id,b.turn_index,
          b.turn_speaker AS speaker,b.act_author,t.answer_provenance
     FROM proposal_versions v
     JOIN proposal_chains c ON c.id=v.chain_id
     JOIN editorial_turn_bindings b
       ON b.version_id=v.id AND b.proposal_chain_id=c.id
     JOIN ask_threads a ON a.id=b.thread_id
       AND a.proposal_chain_id=c.id AND a.member_id=c.member_id
       AND a.manuscript_id=c.work_id
     JOIN ask_turns t ON t.thread_id=b.thread_id
       AND t.turn_index=b.turn_index AND t.speaker='maia'
    WHERE v.id=$1 AND c.member_id=$2 AND c.work_id=$3
      AND v.author='maia' AND b.act_author='maia'
      AND b.turn_speaker='maia'
    LIMIT 2`,
  [scope.versionId,scope.memberId,scope.manuscriptId]);
 if(rows.rows.length!==1)
  return refusal('turn_binding_missing_or_not_owned');
 const row=rows.rows[0];
 if(row.author!=='maia'||row.speaker!=='maia'||row.act_author!=='maia'||
    !UUID.test(row.thread_id)||!Number.isSafeInteger(Number(row.turn_index))||
    Number(row.turn_index)<0)
  return refusal('turn_not_maia');
 const attributed=gradeR74ActualModelProvenance(row.answer_provenance);
 if(!attributed.ok)return refusal(attributed.reason);
 return {kind:'structurally_attributed',provider:attributed.provider,
  reportedModel:attributed.reportedModel,threadId:row.thread_id,
  turnIndex:Number(row.turn_index),mayApply:false,
  releaseApproved:false,privateCustody:'unverified'};
}
