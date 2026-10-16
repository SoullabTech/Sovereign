/**
 * R34 — unmounted, pure compatibility gate for legacy Writer Draft HTTP
 * semantics before an encrypted replacement can be reviewed.
 *
 * It NEVER writes a draft, approves real members, issues a key or creates a
 * public route. It reuses the exact legacy guard, idempotency hash and
 * section-topology validators so encrypted edits cannot silently weaken them.
 *
 * Neither the request body nor a saved idempotency response is returned:
 * either may contain private author prose.
 */
import {
  conflictBody,normalizeVersion,payloadHash,precheck,readGuard,
  type DraftGuardRow,type RequestGuard,
} from '@/lib/manuscript/draftConcurrency';
import {
  validateSectionSave, type SaveRefusal,
} from '@/lib/manuscript/draftSections';

export const R34_REAL_DRAFT_ROUTE_ENABLED = false as const;
export const R34_CONTRACT_PROTOCOL = 'soullab.ws.r34.encrypted-draft-http-compatibility' as const;
type RevisionState = Omit<DraftGuardRow,'version'> & {
  version: number|string;
  sectionAddressable: boolean;
  sectionIds: readonly string[];
};
type HeaderGuard = {baseRevision: string|null; idempotencyKey:string|null};
type SaveOperation = {kind:'save';state:RevisionState;body:unknown};
type CheckpointOperation = {kind:'checkpoint';state:RevisionState;
  headers:HeaderGuard;body?:unknown};
type RestoreOperation = {kind:'restore';state:RevisionState;
  body:unknown;revisionHasPartition:boolean};
export type R34Operation = SaveOperation|CheckpointOperation|RestoreOperation;
export type R34Review =
 | {protocol:typeof R34_CONTRACT_PROTOCOL;kind:'REFUSED';code:number;
    reason:string;canWrite:false}
 | {protocol:typeof R34_CONTRACT_PROTOCOL;kind:'REPLAY_REQUIRES_ENCRYPTED_LEDGER';
    code:200;reason:'idempotency_replay_unavailable';canWrite:false}
 | {protocol:typeof R34_CONTRACT_PROTOCOL;kind:'VALIDATED_BUT_UNMIGRATED';
    code:423;reason:'protected_writer_not_connected';canWrite:false;
    requirements:readonly string[]};

const refusal=(code:number,reason:string):R34Review=>({
  protocol:R34_CONTRACT_PROTOCOL,kind:'REFUSED',code,reason,canWrite:false,
});
const hold=(requirements:readonly string[]):R34Review=>({
  protocol:R34_CONTRACT_PROTOCOL,kind:'VALIDATED_BUT_UNMIGRATED',
  code:423,reason:'protected_writer_not_connected',canWrite:false,
  requirements,
});
const unsafe=(x:unknown):x is Record<string,unknown> =>
  !!x && typeof x==='object' && !Array.isArray(x);
function current(row:RevisionState):DraftGuardRow|null {
  if(!row || typeof row.sectionAddressable!=='boolean' ||
     !Array.isArray(row.sectionIds) ||
     row.sectionIds.some(id=>typeof id!=='string'||id.length===0))
    return null;
  try {return {version:normalizeVersion(row.version),
    last_idempotency_key:row.last_idempotency_key,
    last_idempotency_op:row.last_idempotency_op,
    last_idempotency_payload_hash:row.last_idempotency_payload_hash,
    last_idempotency_response:row.last_idempotency_response};}
  catch{return null;}
}
function guard(body:Record<string,unknown>):RequestGuard|R34Review {
  const value=readGuard(body);
  return 'error' in value?refusal(400,value.error):value;
}
function isReview(value:RequestGuard|R34Review):value is R34Review {
  return 'kind' in value;
}
function applyPrecheck(row:DraftGuardRow,g:RequestGuard,op:'save'|'restore',
  hash:string):R34Review|null {
  const choice=precheck(row,op,g.idempotencyKey,hash,g.baseRevisionId);
  if(choice.kind==='conflict'){
    // This message is structural, with only the current version—not prose.
    const structured=conflictBody(choice.reason,choice.currentRevisionId);
    return refusal(409,structured.reason);
  }
  if(choice.kind==='replay')return {
    protocol:R34_CONTRACT_PROTOCOL,kind:'REPLAY_REQUIRES_ENCRYPTED_LEDGER',
    code:200,reason:'idempotency_replay_unavailable',canWrite:false,
  };
  return null;
}
/**
 * Pure review only. It deliberately returns NO success/canWrite=true path.
 * Future operational bridge must atomically store encrypted revision state
 * AND idempotency acknowledgement under an independent Work/revocation fence.
 */
export function reviewLegacyDraftOperationR34(input:R34Operation):R34Review {
  if(!input || !['save','checkpoint','restore'].includes(input.kind))
    return refusal(400,'invalid_draft_operation');
  const row=current(input.state);
  if(!row)return refusal(503,'untrusted_revision_state');

  let g:RequestGuard|R34Review;
  let hash:string;
  let requirements:string[]=[];

  if(input.kind==='save'){
    if(!unsafe(input.body))return refusal(400,'invalid_json_body');
    const body=input.body;
    if(body.note!==undefined&&body.note!==null&&typeof body.note!=='string')
      return refusal(400,'note must be a string');
    g=guard(body);if(isReview(g))return g;
    const checkpoint=body.checkpoint===true;
    const note=typeof body.note==='string'&&body.note.trim()?body.note.trim():null;
    if(input.state.sectionAddressable){
      const result=validateSectionSave(body,input.state.sectionIds);
      if(!result.ok)return refusal(409,result.refusal);
      hash=payloadHash('save',{sections:result.value,checkpoint,note});
      requirements.push('encrypted_section_identity_order_and_derived_content');
    }else{
      if(Object.prototype.hasOwnProperty.call(body,'sections'))
        return refusal(409,'unconverted_draft_does_not_accept_sections');
      if(typeof body.content!=='string')
        return refusal(400,'content must be a string');
      hash=payloadHash('save',{content:body.content,checkpoint,note});
    }
    if(checkpoint)requirements.push('encrypted_checkpoint_notes_and_revision_count');
    else requirements.push('atomic_encrypted_autosave_and_idempotency_ack');
  }else if(input.kind==='checkpoint'){
    if(input.body!==undefined)return refusal(400,'checkpoint_must_not_send_author_body');
    if(!input.state.sectionAddressable)
      return refusal(409,'not_section_addressable');
    if(input.state.sectionIds.length===0)
      return refusal(409,'not_readable');
    const revision=Number(input.headers?.baseRevision);
    g=guard({baseRevisionId:input.headers?.baseRevision===null?NaN:revision,
      idempotencyKey:input.headers?.idempotencyKey});
    if(isReview(g))return g;
    hash=payloadHash('save',{checkpoint:true,source:'server'});
    requirements=['server_read_frozen_sections_and_encrypted_partition_checkpoint',
      'atomic_encrypted_idempotency_ack'];
  }else{
    if(!unsafe(input.body))return refusal(400,'invalid_json_body');
    const body=input.body;
    if(typeof body.revisionNumber!=='number' ||
       !Number.isInteger(body.revisionNumber)||body.revisionNumber<1)
      return refusal(400,'revisionNumber must be a positive integer');
    g=guard(body);if(isReview(g))return g;
    hash=payloadHash('restore',{revisionNumber:body.revisionNumber});
    if(input.state.sectionAddressable && input.revisionHasPartition!==true)
      return refusal(409,'revision_partition_unavailable');
    requirements=['encrypted_revision_reader_and_append_only_restore',
      ...(input.state.sectionAddressable?
        ['restore_exact_prior_section_ids_without_inference']:[]),
      'atomic_encrypted_idempotency_ack'];
  }

  const decision=applyPrecheck(row,g, input.kind==='restore'?'restore':'save',hash);
  return decision??hold(requirements);
}
