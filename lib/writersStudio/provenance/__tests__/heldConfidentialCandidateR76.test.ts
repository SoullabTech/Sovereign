/**
 * R76 real PostgreSQL16 only when an exclusive fictional loopback fixture
 * supplies the exact opt-ins. No real member, provider, account or API.
 */
import {createHash,generateKeyPairSync,randomBytes,randomUUID} from 'node:crypto';
import {query,closePool} from '@/lib/db/postgres';
import {servingIdentityFor} from '@/lib/consciousness/servingIdentity';
import {sealPendingR76,openPendingR76} from
 '../heldConfidentialCandidateR76';

const allowed=process.env.R76_PENDING_CANDIDATE_FIXTURE==='fictional-only'&&
 process.env.R72_MEMBER_PROPOSALS_FIXTURE==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL??'');
const group=allowed?describe:describe.skip;
const MEMBER='11111111-1111-4111-8111-111111111111';
const OUTSIDER='22222222-2222-4222-8222-222222222222';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
group('R76 sealed pending MAIA candidate never becomes published proposal or Apply',()=>{
 const ids={manuscript:randomUUID(),source:randomUUID(),
  draft:randomUUID(),section:randomUUID(),prospective:randomUUID()};
 const pair=generateKeyPairSync('ed25519');
 const workKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
 const contentSecret=randomBytes(32);
 const proposed='The fictional river holds a softly glowing candle.';
 const source='Chapter One\n\nThe fictional river holds a lantern.';
 const scope={
  memberId:MEMBER,manuscriptId:ids.manuscript,draftId:ids.draft,
  sectionId:ids.section,proposalVersionId:ids.prospective,
  baseVersion:1,consentSequence:1,
  policySHA256:process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256??'',
  instructionContractSHA256:hash('R76 synthetic pinned editorial contract'),
 };
 const response={
  text:proposed,provider:'ollama' as const,model:'qwen2.5:7b',
  serving:servingIdentityFor({
   intendedProvider:'anthropic',intendedModel:'claude-sonnet-4-6',
   servedProvider:'ollama',servedModel:'qwen2.5:7b',
   reason:'invented offline model fallback for acceptance'}),
  metadata:{generationTime:1,stopReason:'end_turn'},
 };
 const issuer={contentSecret,signingKey:pair.privateKey,nowMs:Date.now()};
 const open=()=>openPendingR76({
  scope,workKey,publicKey:pair.publicKey,contentSecret,
  nowMs:issuer.nowMs+2000,
 });
 beforeAll(async()=>{
  await query(
   `INSERT INTO member_manuscripts(id,member_id,title)
       VALUES ($1,$2,'R76 FICTIONAL original source only')`,
   [ids.manuscript,MEMBER]);
  await query(`INSERT INTO manuscript_sections(id,manuscript_id,
      position,heading,body)
      VALUES ($1,$2,0,'Chapter One',
       'The fictional river holds a lantern.')`,
    [ids.source,ids.manuscript]);
  await query(
   `INSERT INTO manuscript_working_drafts
       (id,manuscript_id,member_id,content,base_source_hash,
        version,revision_count)
      VALUES($1,$2,$3,$4,$5,1,1)`,
   [ids.draft,ids.manuscript,MEMBER,source,hash(source)]);
  await query(
   `INSERT INTO manuscript_draft_sections
       (id,draft_id,position,text,source_section_id)
      VALUES ($1,$2,0,$3,$4)`,
   [ids.section,ids.draft,source,ids.source]);
  await query(
   'UPDATE manuscript_working_drafts SET section_addressable_at=now() WHERE id=$1',
   [ids.draft]);
 });
 afterAll(async()=>{await closePool();});
 it('rejects absent opt-in before any publication',async()=>{
  const old=process.env.R76_PENDING_CANDIDATE_FIXTURE;
  delete process.env.R76_PENDING_CANDIDATE_FIXTURE;
  try{
   await expect(sealPendingR76({
    scope,response,workKey,issuer,publicKey:pair.publicKey,
   })).rejects.toMatchObject({reason:'disabled_outside_disposable_local_fixture'});
  }finally{process.env.R76_PENDING_CANDIDATE_FIXTURE=old;}
 });
 it('refuses an unreported, mismatched or truncated synthetic provider answer',async()=>{
  const wrong={...response,model:'unrelated-model'};
  await expect(sealPendingR76({scope,workKey,issuer,
   response:wrong,publicKey:pair.publicKey}))
   .rejects.toMatchObject({reason:'producing_model_or_response_unattributable'});
  const truncated={...response,metadata:{generationTime:1,stopReason:'max_tokens'}};
  await expect(sealPendingR76({scope,workKey,issuer,
   response:truncated,publicKey:pair.publicKey}))
   .rejects.toMatchObject({reason:'producing_model_or_response_unattributable'});
 });
 it('fails closed for a foreign author even with valid signing authority',async()=>{
  await expect(sealPendingR76({scope:{...scope,memberId:OUTSIDER},
   response,workKey,issuer,publicKey:pair.publicKey}))
   .rejects.toMatchObject({reason:'writer_work_or_draft_head_moved'});
 });
 it('seals one prepublication candidate using actual consent and actual PG writer scope',async()=>{
  const receipt=await sealPendingR76({
   scope,response,workKey,issuer,publicKey:pair.publicKey,
  });
  expect(receipt).toMatchObject({
   kind:'R76_SEALED_PENDING_NOT_PUBLISHED',
   canApply:false,canUndo:false,releaseApproved:false,
  });
  const actual=await query<{cipher_envelope:unknown;server_witness:unknown}>(
   'SELECT cipher_envelope,server_witness FROM ws_r76_fixture_pending_private WHERE reserved_version_id=$1',
   [ids.prospective]);
  expect(actual.rows).toHaveLength(1);
  const db=JSON.stringify(actual.rows[0]);
  expect(db).not.toContain(proposed);
  expect(db).not.toContain(source);
  expect(db).not.toContain('softly glowing candle');
  const noVersion=await query<{count:string}>(
   'SELECT count(*) FROM proposal_versions WHERE id=$1',[ids.prospective]);
  expect(Number(noVersion.rows[0].count)).toBe(0);
 });
 it('allows the trusted server to read after owner, consent, ciphertext and signature proof',async()=>{
  const result=await open();
  expect(result).toEqual({
   kind:'R76_PRIVATE_PENDING_REVIEW_ONLY',
   pendingVersionId:ids.prospective,proposedPassage:proposed,
   servedProvider:'ollama',servedModel:'qwen2.5:7b',
   canApply:false,canUndo:false,releaseApproved:false,
   publishedVersion:false,
  });
 });
 it('refuses a competing publication of the same reserved identity',async()=>{
  await expect(sealPendingR76({
   scope,response,workKey,issuer,publicKey:pair.publicKey,
  })).rejects.toThrow();
  const count=await query<{n:string}>(
   'SELECT count(*) AS n FROM ws_r76_fixture_pending_private');
  expect(Number(count.rows[0].n)).toBe(1);
 });
 it('refuses wrong encryption keys, false ownership and wrong signed identity',async()=>{
  await expect(openPendingR76({
   scope,workKey:{...workKey,keyBytes:randomBytes(32)},
   publicKey:pair.publicKey,contentSecret,
   nowMs:issuer.nowMs+2000,
  })).rejects.toMatchObject({reason:'private_cipher_authentication_refused'});
  await expect(openPendingR76({
   scope,workKey:{keyId:randomUUID(),keyBytes:workKey.keyBytes},
   publicKey:pair.publicKey,contentSecret,
   nowMs:issuer.nowMs+2000,
  })).rejects.toMatchObject({reason:'cipher_manifest_or_key_mismatch'});
  await expect(openPendingR76({
   scope:{...scope,memberId:OUTSIDER},workKey,
   publicKey:pair.publicKey,contentSecret,
   nowMs:issuer.nowMs+2000,
  })).rejects.toMatchObject({reason:'writer_work_or_draft_head_moved'});
  await expect(openPendingR76({
   scope,workKey,publicKey:generateKeyPairSync('ed25519').publicKey,
   contentSecret,nowMs:issuer.nowMs+2000,
  })).rejects.toMatchObject({reason:'producer_witness_mismatch'});
  await expect(openPendingR76({
   scope,workKey,publicKey:pair.publicKey,
   contentSecret:randomBytes(32),nowMs:issuer.nowMs+2000,
  })).rejects.toMatchObject({reason:'producer_witness_mismatch'});
 });
 it('enforces current exact consent epoch instead of accepting a stale copy',async()=>{
  await expect(openPendingR76({
   scope:{...scope,consentSequence:scope.consentSequence+1},
   workKey,publicKey:pair.publicKey,contentSecret,
   nowMs:issuer.nowMs+2000,
  })).rejects.toMatchObject({reason:'consent_or_notice_epoch_changed'});
 });
 it('makes the encrypted SQL candidate immutable, without plaintext repair routes',async()=>{
  await expect(query(
   `UPDATE ws_r76_fixture_pending_private
      SET cipher_sha256=$2 WHERE reserved_version_id=$1`,
   [ids.prospective,hash('invented modification')])).rejects.toThrow();
  await expect(query(
   'DELETE FROM ws_r76_fixture_pending_private WHERE reserved_version_id=$1',
   [ids.prospective])).rejects.toThrow();
  const row=await query<{cipher_sha256:string}>(
   'SELECT cipher_sha256 FROM ws_r76_fixture_pending_private WHERE reserved_version_id=$1',
   [ids.prospective]);
  expect(row.rows).toHaveLength(1);
  expect(row.rows[0].cipher_sha256).toMatch(/^[0-9a-f]{64}$/);
 });
 it('detects tampering even if an isolated fixture administrator bypasses its SQL mutation trigger',async()=>{
  const saved=await query<{cipher_envelope:{
   protocol:string;keyId:string;iv:string;tag:string;ciphertext:string;
  }}>(
   'SELECT cipher_envelope FROM ws_r76_fixture_pending_private WHERE reserved_version_id=$1',
   [ids.prospective]);
  const original=saved.rows[0].cipher_envelope;
  const corrupted={...original,ciphertext:original.ciphertext.slice(0,-4)+'AAAA'};
  // Test-only elevated DB role. This is NOT a production migration or API.
  await query('ALTER TABLE ws_r76_fixture_pending_private DISABLE TRIGGER ws_r76_private_pending_immutable');
  try{
   await query(
    'UPDATE ws_r76_fixture_pending_private SET cipher_envelope=$2::jsonb WHERE reserved_version_id=$1',
    [ids.prospective,JSON.stringify(corrupted)]);
   await expect(open()).rejects.toMatchObject({
    reason:'cipher_manifest_or_key_mismatch'});
  }finally{
   await query(
    'UPDATE ws_r76_fixture_pending_private SET cipher_envelope=$2::jsonb WHERE reserved_version_id=$1',
    [ids.prospective,JSON.stringify(original)]);
   await query('ALTER TABLE ws_r76_fixture_pending_private ENABLE TRIGGER ws_r76_private_pending_immutable');
  }
  expect((await open()).proposedPassage).toBe(proposed);
 });
 it('does not mutate immutable Source, working draft or proposal_versions',async()=>{
  const first=await query<{body:string}>(
   'SELECT body FROM manuscript_sections WHERE id=$1',[ids.source]);
  expect(first.rows[0].body).toBe('The fictional river holds a lantern.');
  const draft=await query<{content:string;version:string}>(
   'SELECT content,version FROM manuscript_working_drafts WHERE id=$1',
   [ids.draft]);
  expect(draft.rows[0].content).toBe(source);
  expect(Number(draft.rows[0].version)).toBe(1);
  const p=await query<{n:string}>(
   'SELECT count(*) AS n FROM proposal_versions WHERE id=$1',
   [ids.prospective]);
  expect(Number(p.rows[0].n)).toBe(0);
 });
 it('fails closed if the writer changes the draft after the candidate was sealed',async()=>{
  await query(
   'UPDATE manuscript_working_drafts SET version=version+1 WHERE id=$1',
   [ids.draft]);
  await expect(open()).rejects.toMatchObject({
   reason:'writer_work_or_draft_head_moved'});
 });
 it('stays private after the member revokes consent, even with correct ciphertext key',async()=>{
  await query(
   `INSERT INTO writers_studio_beta_consent_events
     (member_id,actor_member_id,decision,policy_version,policy_sha256)
     VALUES($1,$1,'revoke',$2,$3)`,
   [MEMBER,process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION,
    scope.policySHA256]);
  await expect(open()).rejects.toThrow();
  const latest=await query<{decision:string}>(
   'SELECT decision FROM writers_studio_beta_consent_events WHERE member_id=$1 ORDER BY seq DESC LIMIT 1',
   [MEMBER]);
  expect(latest.rows[0].decision).toBe('revoke');
 });
});
