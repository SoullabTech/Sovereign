/**
 * R42 physical PG16: signed encrypted Source -> provenance-linked, distinct-key
 * initial encrypted Draft, including exact retries/interrupted transitions.
 * ALL identities, original bytes, editorial text and signer keys are fictional.
 */
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign}
 from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {query,closePool} from '@/lib/db/postgres';
import {
 canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
 canonicalClaimedArrivalPayload,type SignedClaimedArrivalV1,
 type ClaimedArrivalReceiptV1,
} from '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import {
 persistHeldPendingR33,commitHeldPendingClaimR33,type R33Manifest,
} from '@/lib/writersStudio/recovery/heldPendingClaimR33';
import {
 readHeldOriginalR32,type R32Source,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {
 reopenHeldDraftR35,beginHeldDraftR35,
 R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED,
} from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
import {composeHeldOriginalR36}
 from '@/lib/writersStudio/recovery/heldSourceComposerR36';
import {applySelectedSectionR37,undoSelectedSectionR37,
 type R37SectionSelection,type R37FixtureGesture,type R37UndoGesture}
 from '@/lib/writersStudio/recovery/heldSectionApplyR37';
import {
 beginHeldDraftFromOriginalR42,R42_REAL_SOURCE_DRAFT_ENABLED,
 type R42Input,
} from '@/lib/writersStudio/recovery/heldSourceDraftBridgeR42';

const enabled=[
 'R42_PHYSICAL_PG16','R42_SOURCE_DRAFT_FIXTURE','R36_SOURCE_COMPOSER_FIXTURE',
 'R35_INTENT_FIXTURE','R34_CLAIM_RECONCILE_FIXTURE',
 'R33_PENDING_CLAIM_FIXTURE','R32_HELD_SOURCE_FIXTURE',
 'R35_PROTECTED_DRAFT_FIXTURE','R35_PHYSICAL_PG16_FIXTURE',
].every(x=>process.env[x]==='fictional-only') &&
 (process.env.DATABASE_URL||'').startsWith('postgresql://fict@127.0.0.1:');
const run=enabled?describe:describe.skip;
const A='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const W=Array.from({length:7},(_,i)=>
 '4c0782ca-9074-43ee-9f3c-5f85000267'+(90+i));
const pendingKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const sourceKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const draftKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const witness=generateKeyPairSync('ed25519');
const claimSigner=generateKeyPairSync('ed25519');
const subject={memberId:A,assertedBy:'server_verified_member_session' as const};
const P1='R42_FICTIONAL_LANTERN_ The imaginary lantern glows.\n\n';
const P2='R42_FICTIONAL_GARDEN_ A second fictional section remains.';
const TXT=P1+P2;
const SOURCE:R32Source={kind:'artifact',
 originalBytes:Buffer.from('R42_FICTIONAL_ORIGINAL_DOCX_BYTES'),
 sourceText:TXT,originalFilename:'R42-Imagination.docx',
 mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 extractorId:'r42-fixture-parser',
};
const S1='66666666-6666-4666-8666-666666666661';
const S2='66666666-6666-4666-8666-666666666662';
const PLAN=[{id:S1,text:P1},{id:S2,text:P2}];
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
function auth(key:{keyId:string;keyBytes:Buffer},revokedWork?:string){
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:60,
  revokedWorks:revokedWork?[revokedWork]:[],revokedKeyIds:[],
 };
 return {key,signedDeletion:{checkpoint:cp,signature:sign(null,
  canonicalDeletionPayload(cp),witness.privateKey).toString('base64')},
  trustedSigner:witness.publicKey,independent:{minimumGeneration:60}};
}
function signed(m:R33Manifest,s:R32Source):SignedClaimedArrivalV1{
 const c:ClaimedArrivalReceiptV1={
  protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
  claimId:m.claimId!,memberId:A,arrivalId:m.arrivalId,
  manuscriptId:m.claimedWorkId!,pendingGeneration:m.pendingGeneration,
  manuscriptGeneration:m.workGeneration!,claimEpoch:m.claimEpoch!,
  sourceKind:s.kind==='artifact'?'artifact_extraction':'member_supplied_text',
  sourceTextDigest:sha(Buffer.from(s.sourceText,'utf8')),
  originalDigest:s.kind==='artifact'?sha(s.originalBytes):null,
 };
 return {claim:c,signature:sign(null,canonicalClaimedArrivalPayload(c),
   claimSigner.privateKey).toString('base64')};
}
type Fixture=R42Input & {workId:string;arrivalId:string};
const known:Fixture[]=[];
async function makeClaim(i:number):Promise<Fixture>{
 const arrivalId=randomUUID(),workId=W[i];
 await persistHeldPendingR33({subject,arrivalId,generation:1,
  source:SOURCE,authority:auth(pendingKey)});
 await query('INSERT INTO member_manuscripts(id,member_id) VALUES($1,$2)',
  [workId,A]);
 const m=await commitHeldPendingClaimR33({
  subject,arrivalId,pendingGeneration:1,
  workId,workGeneration:1,claimEpoch:60,authority:auth(pendingKey),
 });
 const c:Fixture={workId,arrivalId,
  sourceClaim:{
   subject,arrivalId,pendingGeneration:1,
   pendingAuthority:auth(pendingKey),workAuthority:auth(sourceKey),
   signedClaim:signed(m,SOURCE),trustedClaimSigner:claimSigner.publicKey,
   minimumClaimEpoch:60,
  },
  draftCustody:auth(draftKey),sections:PLAN,
 };
 known.push(c);return c;
}
async function count(table:string,workId:string){
 const field=table==='writers_studio_r32_held_originals'?
  'manuscript_id':'work_id';
 const r=await query<{n:number}>(`SELECT count(*)::int AS n FROM ${table}
  WHERE ${field}=$1`,[workId]);return r.rows[0].n;
}
async function original(c:Fixture){
 return readHeldOriginalR32({subject,workId:c.workId,
  arrivalId:c.arrivalId,generation:1,authority:auth(sourceKey)});
}
async function draft(c:Fixture){
 return reopenHeldDraftR35({subject,workId:c.workId,
  generation:1,custody:auth(draftKey)});
}
run('R42 actual PostgreSQL16 Source→encrypted section draft integration',()=>{
 afterAll(async()=>{
  const escrow=process.env.R42_FICTIONAL_ESCROW_PATH;
  if(enabled&&escrow&&known[0]){
   // Temporary, test-only same-Mac escrow NOT a real external KMS.
   writeFileSync(escrow,JSON.stringify({
    memberId:A,workId:known[0].workId,arrivalId:known[0].arrivalId,
    sourceKeyId:sourceKey.keyId,sourceKeyHex:sourceKey.keyBytes.toString('hex'),
    draftKeyId:draftKey.keyId,draftKeyHex:draftKey.keyBytes.toString('hex'),
    signerPKCS8:witness.privateKey.export({type:'pkcs8',format:'pem'}),
   }),{flag:'wx',mode:0o600});
  }
  await closePool();
 });
 it('all actual Source/Draft/member routes remain statically disabled',()=>{
  expect(R42_REAL_SOURCE_DRAFT_ENABLED).toBe(false);
  expect(R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED).toBe(false);
 });
 it('Source observed, exact encrypted first Draft linked; original untouched',async()=>{
  const c=await makeClaim(0);
  const r=await beginHeldDraftFromOriginalR42(c);
  expect(r).toMatchObject({kind:'HELD_NEW_ENCRYPTED_DRAFT_LINK',
   sectionCount:2,draftGeneration:1,originalRetained:true,
   pendingKeyRetirement:'NOT_PERFORMED',releaseApproved:false});
  expect((await original(c)).source).toEqual(SOURCE);
  const d=await draft(c);
  expect(d.sections).toEqual(PLAN);
  expect(d.content).toBe(TXT);
  expect(await count('writers_studio_r32_held_originals',c.workId)).toBe(1);
  expect(await count('writers_studio_r42_held_start_intents',c.workId)).toBe(1);
  expect(await count('writers_studio_r42_held_start_links',c.workId)).toBe(1);
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(1);
  expect(JSON.stringify(r)).not.toContain(TXT);
  expect(JSON.stringify(r)).not.toContain('R42-Imagination.docx');
 });
 it('Source-derived sections support author-reviewed encrypted Apply, Undo and exact replay',async()=>{
  const c=known[0];
  const baseline=await draft(c);
  const selected='lantern glows';
  const first=baseline.sections[0];
  const start=Array.from(first.text.split(selected)[0]).length;
  const choice='88888888-8888-4888-8888-888888888881';
  const alternative='88888888-8888-4888-8888-888888888882';
  const h=(s:string)=>sha(Buffer.from(s,'utf8'));
  const selection:R37SectionSelection={
   expectedWorkSHA256:h(baseline.content),
   section:{
    sectionId:S1,currentText:first.text,expectedGeneration:1,
    expectedDraftSHA256:h(first.text),
    anchor:{sectionId:S1,start,
      end:start+Array.from(selected).length,
      selectedText:selected,sectionSHA256:h(first.text)},
    alternatives:[
     {id:choice,origin:'maia',wording:'lantern shimmers'},
     {id:alternative,origin:'member',wording:'lantern shines'},
    ],
    chosenAlternativeId:choice,
   },
  };
  const gesture:R37FixtureGesture={
   kind:'synthetic_author_clicked_apply_section',
   workId:c.workId,sectionId:S1,alternativeId:choice,
   expectedGeneration:1,sectionSHA256:h(first.text),
   selectedPassageSHA256:h(selected),
   idempotencyKey:'r42-fictional-section-apply-001',
  };
  const firstApply=await applySelectedSectionR37({
   subject,custody:c.draftCustody,workId:c.workId,
   selection,gesture,
  });
  expect(firstApply.receipt).toMatchObject({
   status:'saved',generation:2,action:'save',
  });
  const applied=await reopenHeldDraftR35({
   subject,workId:c.workId,custody:c.draftCustody,generation:2,
  });
  expect(applied.sections[0].text).toBe(P1.replace('lantern glows','lantern shimmers'));
  expect(applied.sections[1]).toEqual({id:S2,text:P2});
  const replay=await applySelectedSectionR37({
   subject,custody:c.draftCustody,workId:c.workId,
   selection,gesture,
  });
  expect(replay.receipt).toMatchObject({status:'replayed',generation:2});
  const undo:R37UndoGesture={
   kind:'synthetic_author_clicked_undo_section',
   workId:c.workId,expectedGeneration:2,appliedVersion:2,
   idempotencyKey:'r42-fictional-section-undo-001',
  };
  const undone=await undoSelectedSectionR37({
   subject,custody:c.draftCustody,workId:c.workId,gesture:undo,
  });
  expect(undone.receipt).toMatchObject({
   status:'saved',generation:3,action:'restore',
  });
  const restore=await reopenHeldDraftR35({
   subject,custody:c.draftCustody,workId:c.workId,generation:3,
  });
  expect(restore.content).toBe(TXT);
  expect(restore.sections).toEqual(PLAN);
  expect(restore.checkpointCount).toBe(1);
  const secondUndo=await undoSelectedSectionR37({
   subject,custody:c.draftCustody,workId:c.workId,gesture:undo,
  });
  expect(secondUndo.receipt).toMatchObject({status:'replayed',generation:3});
  expect((await original(c)).source).toEqual(SOURCE);
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(3);
 });
 it('repeat exact claimed Source reuses first Draft encrypted bytes',async()=>{
  const c=await makeClaim(1);
  const r=await beginHeldDraftFromOriginalR42(c);
  const second=await beginHeldDraftFromOriginalR42(c);
  expect(r.kind).toBe('HELD_NEW_ENCRYPTED_DRAFT_LINK');
  expect(second.kind).toBe('HELD_EXISTING_ENCRYPTED_DRAFT_RECONCILED');
  expect(second.initialDraftCipherSHA256).toBe(r.initialDraftCipherSHA256);
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(1);
 });
 it('interruption after Source→Draft intent persists NO plaintext or Draft',async()=>{
  const c=await makeClaim(2);
  await expect(beginHeldDraftFromOriginalR42({...c,
   fixtureInterruptions:{afterIntent:()=>{throw Error('R42_STOP_AFTER_INTENT');}},
  })).rejects.toThrow('R42_STOP_AFTER_INTENT');
  expect(await count('writers_studio_r42_held_start_intents',c.workId)).toBe(1);
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(0);
  const r=await beginHeldDraftFromOriginalR42(c);
  expect(r.kind).toBe('HELD_NEW_ENCRYPTED_DRAFT_LINK');
  expect(await count('writers_studio_r42_held_start_links',c.workId)).toBe(1);
 });
 it('interruption after encrypted Draft reuses immutable ciphertext/intent',async()=>{
  const c=await makeClaim(3);
  await expect(beginHeldDraftFromOriginalR42({...c,
   fixtureInterruptions:{afterDraftPersisted:()=>{throw Error('R42_STOP_AFTER_DRAFT');}},
  })).rejects.toThrow('R42_STOP_AFTER_DRAFT');
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(1);
  expect(await count('writers_studio_r42_held_start_links',c.workId)).toBe(0);
  const r=await beginHeldDraftFromOriginalR42(c);
  expect(r.kind).toBe('HELD_EXISTING_ENCRYPTED_DRAFT_RECONCILED');
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(1);
  expect(await count('writers_studio_r42_held_start_links',c.workId)).toBe(1);
 });
 it('changed section IDs and substituted text cannot be laundered on retry',async()=>{
  const c=await makeClaim(4);
  await beginHeldDraftFromOriginalR42(c);
  await expect(beginHeldDraftFromOriginalR42({...c,sections:[
   {id:randomUUID(),text:P1},{id:S2,text:P2},
  ]})).rejects.toHaveProperty('code','r42_replayed_source_draft_plan_changed');
  await expect(beginHeldDraftFromOriginalR42({...c,sections:[
   {id:S1,text:P1.replace('glows','shimmers')},{id:S2,text:P2},
  ]})).rejects.toHaveProperty('code','r42_source_section_text_substitution');
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(1);
 });
 it('concurrent identical Source→Draft requests serialize and do not double-write',async()=>{
  const c=await makeClaim(5);
  const result=await Promise.all([
   beginHeldDraftFromOriginalR42(c),
   beginHeldDraftFromOriginalR42(c),
  ]);
  expect(result.map(x=>x.kind).sort()).toEqual([
   'HELD_EXISTING_ENCRYPTED_DRAFT_RECONCILED','HELD_NEW_ENCRYPTED_DRAFT_LINK',
  ]);
  expect(await count('writers_studio_r42_held_start_intents',c.workId)).toBe(1);
  expect(await count('writers_studio_r35_draft_versions',c.workId)).toBe(1);
 });
 it('existing initial Draft without earlier Source intent cannot be legitimated',async()=>{
  const c=await makeClaim(6);
  await composeHeldOriginalR36(c.sourceClaim);
  await beginHeldDraftR35({subject,workId:c.workId,
   custody:c.draftCustody,sections:PLAN});
  await expect(beginHeldDraftFromOriginalR42(c))
   .rejects.toHaveProperty('code','r42_draft_preexisted_source_intent');
  expect(await count('writers_studio_r42_held_start_intents',c.workId)).toBe(0);
 });
 it('foreign member, revoked Work and reused key domain refuse',async()=>{
  const c=known[0];
  const foreign={...c,sourceClaim:{...c.sourceClaim,
   subject:{memberId:B,assertedBy:'server_verified_member_session' as const}}};
  await expect(beginHeldDraftFromOriginalR42(foreign)).rejects.toBeTruthy();
  await expect(beginHeldDraftFromOriginalR42({...c,
   sourceClaim:{...c.sourceClaim,workAuthority:auth(sourceKey,c.workId)},
  })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(beginHeldDraftFromOriginalR42({...c,
   draftCustody:auth(sourceKey),
  })).rejects.toHaveProperty('code','r42_distinct_original_and_draft_keys_required');
 });
 it('Link SQL is immutable and no plaintext Source or sections appear in its rows',async()=>{
  const c=known[0];
  await expect(query(`DELETE FROM writers_studio_r42_held_start_links
   WHERE work_id=$1`,[c.workId])).rejects.toBeTruthy();
  const a=await query('SELECT * FROM writers_studio_r42_held_start_intents');
  const b=await query('SELECT * FROM writers_studio_r42_held_start_links');
  const safe=JSON.stringify([a.rows,b.rows]);
  for(const forbidden of [TXT,'R42-Imagination.docx','R42_FICTIONAL_ORIGINAL_DOCX_BYTES'])
   expect(safe).not.toContain(forbidden);
 });
});
