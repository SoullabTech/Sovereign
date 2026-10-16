/**
 * R42 — FICTIONAL ONLY Source-to-first encrypted Draft handoff.
 *
 * R36: signed pending→Work claim + immutable encrypted original and intention
 * BEFORE any Draft. R35: first encrypted, section-addressable, idempotent
 * Draft under a DISTINCT Work-key identity. R42 immutable metadata-only
 * pre-draft intent and Source→Draft SHA link for interrupted recovery.
 *
 * This uses a single session-level PG advisory lock for a disposable Mac
 * integration test. It is NOT an independently governed revocation/commit
 * coordinator. There is NO live route, no real KMS, and no cross-backup proof.
 */
import {createHmac,timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {Client} from 'pg';
import {query,transaction} from '@/lib/db/postgres';
import {
  composeHeldOriginalR36,type R36Result,
} from './heldSourceComposerR36';
import {readHeldOriginalR32,type R32Manifest} from './heldOriginalSourceR32';
import {
  beginHeldDraftR35,reopenHeldDraftR35,
  type R35Custody,type R35View,
} from './heldProtectedDraftR35';
import {flattenSections,type DraftSectionState} from '@/lib/manuscript/draftSections';
import {WorkRecoveryRefusal} from './workEnvelopeV1';
import type {R34Input} from './heldClaimReconcilerR34';

export const R42_REAL_SOURCE_DRAFT_ENABLED=false as const;
const SHA=/^[a-f0-9]{64}$/;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const DOMAIN='soullab.ws.r42.exact-first-draft-plan.v1' as const;
type Scope={
 memberId:string;workId:string;arrivalId:string;claimId:string;
 generation:number;
};
type IntentRow={
 work_id:string;member_id:string;arrival_id:string;claim_id:string;
 source_manifest_id:string;source_pair_sha256:string;draft_key_id:string;
 draft_plan_hmac:string;
};
type DraftVersion={work_id:string;member_id:string;generation:string|number;
 key_id:string;cipher_sha256:string;action:string};
type LinkRow={
 work_id:string;member_id:string;arrival_id:string;
 source_manifest_id:string;source_pair_sha256:string;draft_plan_hmac:string;
 draft_generation:string|number;draft_cipher_sha256:string;
};
export type R42FictionalInterruptions={
 afterIntent?:()=>void|Promise<void>;
 afterDraftPersisted?:()=>void|Promise<void>;
};
export type R42Input={
 sourceClaim:R34Input;
 /** Must be a separately scoped Work key, never the pending or original key. */
 draftCustody:R35Custody;
 /** Explicit server-built section plan: its exact flattening MUST be Source. */
 sections?:readonly DraftSectionState[];
 fixtureInterruptions?:R42FictionalInterruptions;
};
export type R42Result={
 kind:'HELD_NEW_ENCRYPTED_DRAFT_LINK'|'HELD_EXISTING_ENCRYPTED_DRAFT_RECONCILED';
 sourceManifestId:string;
 initialDraftCipherSHA256:string;
 draftGeneration:1;
 sectionCount:number;
 originalRetained:true;
 pendingKeyRetirement:'NOT_PERFORMED';
 releaseApproved:false;
};
function fail(code:string):never{
 throw new WorkRecoveryRefusal('r42_'+code);
}
function uuid(x:unknown):string{
 if(typeof x!=='string'||!UUID.test(x))fail('unreviewed_identity');
 return (x as string).toLowerCase();
}
function fixture():void{
 const url=process.env.DATABASE_URL||'',vault=process.env.FILE_STORAGE_PATH||'';
 if(R42_REAL_SOURCE_DRAFT_ENABLED!==false ||
    process.env.R42_SOURCE_DRAFT_FIXTURE!=='fictional-only'||
    process.env.R36_SOURCE_COMPOSER_FIXTURE!=='fictional-only'||
    process.env.R35_INTENT_FIXTURE!=='fictional-only'||
    process.env.R34_CLAIM_RECONCILE_FIXTURE!=='fictional-only'||
    process.env.R33_PENDING_CLAIM_FIXTURE!=='fictional-only'||
    process.env.R32_HELD_SOURCE_FIXTURE!=='fictional-only'||
    process.env.R35_PROTECTED_DRAFT_FIXTURE!=='fictional-only'||
    process.env.R35_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
    !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(url)||
    path.basename(vault)!=='vault'||
    !path.basename(path.dirname(vault)).startsWith('ws-r35-physical-'))
  fail('real_source_to_draft_disabled');
}
function scope(input:R34Input):Scope{
 if(!input?.subject||input.subject.assertedBy!=='server_verified_member_session'||
   !input.signedClaim?.claim)fail('unverified_source_claim_subject');
 const claim=input.signedClaim.claim;
 if(!Number.isSafeInteger(claim.manuscriptGeneration)||claim.manuscriptGeneration!==1)
  fail('only_initial_draft_generation_supported');
 if(claim.memberId.toLowerCase()!==input.subject.memberId.toLowerCase() ||
    claim.arrivalId.toLowerCase()!==input.arrivalId.toLowerCase())
  fail('signed_claim_scope_mismatch');
 return {
  memberId:uuid(input.subject.memberId),
  workId:uuid(claim.manuscriptId),arrivalId:uuid(claim.arrivalId),
  claimId:uuid(claim.claimId),generation:claim.manuscriptGeneration,
 };
}
function distinctKeys(input:R42Input):void{
 // Pending import, immutable original and mutable Draft have separate key
 // domains. Different UUIDs alone cannot disguise the same raw key bytes.
 const pending=input.sourceClaim.pendingAuthority?.key?.keyBytes,
  source=input.sourceClaim.workAuthority?.key?.keyBytes,
  draft=input.draftCustody?.key?.keyBytes;
 const pendingId=input.sourceClaim.pendingAuthority?.key?.keyId,
  sourceId=input.sourceClaim.workAuthority?.key?.keyId,
  draftId=input.draftCustody?.key?.keyId;
 if(!Buffer.isBuffer(pending)||pending.length!==32||
    !Buffer.isBuffer(source)||source.length!==32||
    !Buffer.isBuffer(draft)||draft.length!==32||
    uuid(pendingId)===uuid(draftId)||
    uuid(sourceId)===uuid(draftId)||
    timingSafeEqual(pending,draft)||timingSafeEqual(source,draft))
  fail('distinct_original_and_draft_keys_required');
}
function plan(
 sourceText:string,sections:readonly DraftSectionState[]|undefined,
 c:Scope,key:Buffer,source:R32Manifest,
):{kind:'plain'|'sections';ids:string[];hash:string;sections?:DraftSectionState[]}{
 let kind:'plain'|'sections'='plain',ids:string[]=[],segment:DraftSectionState[]|undefined;
 if(sections!==undefined){
  if(!Array.isArray(sections)||sections.length===0||sections.length>5000)
    fail('unreviewed_section_plan');
  const seen=new Set<string>();
  segment=sections.map(s=>{
   if(!s||typeof s.text!=='string')fail('unreviewed_section_payload');
   const id=uuid(s.id);
   if(seen.has(id))fail('duplicate_section_identity');
   seen.add(id);return {id,text:s.text};
  });
  if(flattenSections(segment)!==sourceText)fail('source_section_text_substitution');
  ids=segment.map(x=>x.id);kind='sections';
 }
 // HMAC, not raw SHA256 of guessed/common manuscript words, stored in SQL.
 const payload=JSON.stringify([DOMAIN,c.memberId,c.workId,c.arrivalId,
  c.claimId,source.id,source.pairSHA256,kind,
  segment?.map(s=>[s.id,s.text])??[sourceText]]);
 const hash=createHmac('sha256',key).update(payload).digest('hex');
 return {kind,ids,hash,sections:segment};
}
function equalIntent(row:IntentRow,x:IntentRow):boolean{
 return Object.keys(x).every(k=>
  (row as unknown as Record<string,unknown>)[k]===
  (x as unknown as Record<string,unknown>)[k]);
}
async function verifyDraft(
 c:Scope,custody:R35Custody,sourceText:string,
 structure:ReturnType<typeof plan>,
):Promise<R35View>{
 const view=await reopenHeldDraftR35({
  subject:{memberId:c.memberId,assertedBy:'server_verified_member_session'},
  workId:c.workId,custody,generation:1,
 });
 if(view.generation!==1||view.action!=='start'||view.content!==sourceText ||
    view.kind!==structure.kind||
    JSON.stringify(view.sections)!==JSON.stringify(structure.sections??[]))
  fail('existing_draft_differs_from_verified_source');
 return view;
}
/**
 * R42 ensures Source custody is COMPLETED and authenticated before recording
 * an initial Draft intention. A failure after R35 ciphertext publication but
 * before link finalization retries through the SAME earlier intent and
 * exact initial encrypted Draft — it never silently starts a second Work.
 */
export async function beginHeldDraftFromOriginalR42(input:R42Input):Promise<R42Result>{
 fixture();
 if(!input||!input.sourceClaim||!input.draftCustody)
  fail('missing_work_custody');
 const c=scope(input.sourceClaim);
 distinctKeys(input);
 const sourcePhase:R36Result=await composeHeldOriginalR36(input.sourceClaim);
 if(sourcePhase.releaseApproved!==false)fail('unexpected_source_promotion');
 const source=await readHeldOriginalR32({
  subject:input.sourceClaim.subject,workId:c.workId,
  arrivalId:c.arrivalId,generation:1,authority:input.sourceClaim.workAuthority,
 });
 if(source.manifest.id!==sourcePhase.workManifestId)
  fail('source_manifest_not_observed');
 const section=plan(source.source.sourceText,input.sections,c,
   input.draftCustody.key.keyBytes,source.manifest);

 // Session-advisory lock survives committed intention, nested R35 draft
 // transaction and final link; not an actual distributed Work revocation lock.
 const client=new Client({connectionString:process.env.DATABASE_URL});
 const lockKey=JSON.stringify(['r42-fictional-source-to-draft',
  c.memberId,c.workId]);
 await client.connect();
 let locked=false;
 try{
  await client.query('SELECT pg_advisory_lock(hashtextextended($1::text,0))',[lockKey]);
  locked=true;
  const expected:IntentRow={
   work_id:c.workId,member_id:c.memberId,arrival_id:c.arrivalId,
   claim_id:c.claimId,source_manifest_id:source.manifest.id,
   source_pair_sha256:source.manifest.pairSHA256,
   draft_key_id:uuid(input.draftCustody.key.keyId),
   draft_plan_hmac:section.hash,
  };
  const held=await query<IntentRow>(
   'SELECT * FROM writers_studio_r42_held_start_intents WHERE work_id=$1',
   [c.workId]);
  if(held.rows.length>1)fail('ambiguous_intent');
  if(held.rows.length===0){
   // An existing draft without a *previous* intent cannot be retroactively
   // legitimized simply because its plaintext currently resembles Source.
   const prior=await query<{work_id:string}>(
    'SELECT work_id FROM writers_studio_r35_draft_heads WHERE work_id=$1',
    [c.workId]);
   if(prior.rows.length!==0)fail('draft_preexisted_source_intent');
   await transaction(async tx=>{
    const saved=await tx.query<IntentRow>(`
     INSERT INTO writers_studio_r42_held_start_intents
     (work_id,member_id,arrival_id,claim_id,source_manifest_id,
      source_pair_sha256,draft_key_id,draft_plan_hmac)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING
     RETURNING *`,[
      c.workId,c.memberId,c.arrivalId,c.claimId,source.manifest.id,
      source.manifest.pairSHA256,uuid(input.draftCustody.key.keyId),section.hash,
     ]);
    if(saved.rows.length!==1)fail('prewrite_intent_not_owned');
   });
  }else if(!equalIntent(held.rows[0],expected))
    fail('replayed_source_draft_plan_changed');

  if(input.fixtureInterruptions?.afterIntent)
   await input.fixtureInterruptions.afterIntent();

  const head=await query<{work_id:string}>(
   'SELECT work_id FROM writers_studio_r35_draft_heads WHERE work_id=$1',
   [c.workId]);
  if(head.rows.length>1)fail('duplicate_first_draft');
  const first=head.rows.length===0;
  if(first){
    const initial={
      subject:input.sourceClaim.subject,workId:c.workId,
      custody:input.draftCustody,
      ...(section.kind==='sections'?
        {sections:section.sections}:{content:source.source.sourceText}),
    };
    const written=await beginHeldDraftR35(initial);
    if(written.action!=='start'||written.generation!==1||written.status!=='saved')
      fail('unverified_first_draft_creation');
  }
  await verifyDraft(c,input.draftCustody,source.source.sourceText,section);
  const current=await query<DraftVersion>(`SELECT * FROM
   writers_studio_r35_draft_versions
   WHERE work_id=$1 AND member_id=$2 AND generation=1`,[c.workId,c.memberId]);
  if(current.rows.length!==1||
     current.rows[0].key_id!==uuid(input.draftCustody.key.keyId)||
     current.rows[0].action!=='start'||!SHA.test(current.rows[0].cipher_sha256))
    fail('draft_ciphertext_manifest_untrusted');
  const draftSHA=current.rows[0].cipher_sha256;
  if(input.fixtureInterruptions?.afterDraftPersisted)
    await input.fixtureInterruptions.afterDraftPersisted();

  const old=await query<LinkRow>(
   'SELECT * FROM writers_studio_r42_held_start_links WHERE work_id=$1',
   [c.workId]);
  if(old.rows.length>1)fail('ambiguous_source_draft_link');
  if(old.rows.length===1){
    const link=old.rows[0];
    if(link.member_id!==c.memberId||link.arrival_id!==c.arrivalId||
       link.source_manifest_id!==source.manifest.id||
       link.source_pair_sha256!==source.manifest.pairSHA256||
       link.draft_plan_hmac!==section.hash||
       Number(link.draft_generation)!==1||
       link.draft_cipher_sha256!==draftSHA)
       fail('prior_source_draft_link_changed');
  }else{
    await transaction(async tx=>{
      const r=await tx.query<LinkRow>(`
       INSERT INTO writers_studio_r42_held_start_links
       (work_id,member_id,arrival_id,source_manifest_id,source_pair_sha256,
        draft_plan_hmac,draft_generation,draft_cipher_sha256)
       VALUES($1,$2,$3,$4,$5,$6,1,$7) RETURNING *`,
       [c.workId,c.memberId,c.arrivalId,source.manifest.id,
        source.manifest.pairSHA256,section.hash,draftSHA]);
      if(r.rows.length!==1)fail('draft_source_link_insert_refused');
    });
  }
  return {
   kind:first?'HELD_NEW_ENCRYPTED_DRAFT_LINK':
      'HELD_EXISTING_ENCRYPTED_DRAFT_RECONCILED',
   sourceManifestId:source.manifest.id,
   initialDraftCipherSHA256:draftSHA,draftGeneration:1,
   sectionCount:section.ids.length,originalRetained:true,
   pendingKeyRetirement:'NOT_PERFORMED',releaseApproved:false,
  };
 }finally{
  if(locked)await client.query(
   'SELECT pg_advisory_unlock(hashtextextended($1::text,0))',[lockKey]
  ).catch(()=>undefined);
  await client.end().catch(()=>undefined);
 }
}
