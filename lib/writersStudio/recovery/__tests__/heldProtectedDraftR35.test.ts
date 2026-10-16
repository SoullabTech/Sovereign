/**
 * R35 protected-draft release stops: the new SQL/vault path cannot be used by
 * real writers, cannot fall back to legacy SQL, and cannot treat an insecure
 * client-submitted subject as production authentication.
 *
 * Full ciphertext and version correctness is separately verified on PG16.
 */
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {randomBytes,randomUUID} from 'node:crypto';
import {
  R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED,R35_VAULT_NAMESPACE,
  beginHeldDraftR35,changeHeldDraftR35,reopenHeldDraftR35,
} from '../heldProtectedDraftR35';
import {R34_REAL_DRAFT_ROUTE_ENABLED} from '../draftRouteParityR34';
import {R33_REAL_EDITORIAL_WRITES_ENABLED} from '../heldAuthorEditsR33';
import {WorkRecoveryRefusal} from '../workEnvelopeV1';

const uuid='11111111-1111-4111-8111-111111111111';
const work='33333333-3333-4333-8333-333333333333';
const testMember={memberId:uuid,assertedBy:'server_verified_member_session' as const};
const state={key:{keyId:randomUUID(),keyBytes:randomBytes(32)},
 signedDeletion:null,trustedSigner:null,independent:null};
const variables=['R35_PROTECTED_DRAFT_FIXTURE','R35_PHYSICAL_PG16_FIXTURE',
 'DATABASE_URL','FILE_STORAGE_PATH'] as const;
const stored=Object.fromEntries(variables.map(k=>[k,process.env[k]]));
function syntheticFixture(){
 process.env.R35_PROTECTED_DRAFT_FIXTURE='fictional-only';
 process.env.R35_PHYSICAL_PG16_FIXTURE='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:57359/r35_draft';
 process.env.FILE_STORAGE_PATH='/tmp/ws-r35-physical-unit-fixture/vault';
}
afterAll(()=>{
 for(const k of variables){
  if(stored[k]===undefined)delete process.env[k];
  else process.env[k]=stored[k];
 }
});
function routes(dir:string):string[]{
 const found:string[]=[];
 for(const file of readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,file.name);
  if(file.isDirectory())found.push(...routes(full));
  if(file.isFile()&&/^route\.tsx?$/.test(file.name))found.push(full);
 }
 return found;
}
describe('R35 encrypted draft release remains held',()=>{
 it('all real writer service flags stay false',()=>{
  expect(R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED).toBe(false);
  expect(R34_REAL_DRAFT_ROUTE_ENABLED).toBe(false);
  expect(R33_REAL_EDITORIAL_WRITES_ENABLED).toBe(false);
 });
 it('can only enter fictional review using exact opt-in',async()=>{
  delete process.env.R35_PROTECTED_DRAFT_FIXTURE;
  await expect(beginHeldDraftR35({subject:testMember,workId:work,
    custody:state,content:'fictional writer text'}))
    .rejects.toMatchObject({code:'r35_real_protected_draft_disabled'});
  await expect(changeHeldDraftR35({subject:testMember,workId:work,custody:state,
    operation:{kind:'save',body:{
      content:'invented text',baseRevisionId:1,idempotencyKey:'id',
    }}})).rejects.toMatchObject({code:'r35_real_protected_draft_disabled'});
  await expect(reopenHeldDraftR35({subject:testMember,workId:work,
    custody:state,generation:1})).rejects
      .toMatchObject({code:'r35_real_protected_draft_disabled'});
 });
 it('refuses fake fixture enablement against a non-fictional database',async()=>{
  syntheticFixture();
  process.env.DATABASE_URL='postgresql://soullab@production-host:5432/maia';
  await expect(beginHeldDraftR35({subject:testMember,workId:work,
    custody:state,content:'not allowed'})).rejects
    .toMatchObject({code:'r35_untrusted_physical_fixture_environment'});
  syntheticFixture();
 });
 it('structural, untrusted client subject is refused without SQL or vault access',async()=>{
  syntheticFixture();
  await expect(beginHeldDraftR35({
    subject:{memberId:uuid,assertedBy:'browser_claim' as never},
    workId:work,custody:state,content:'not trusted',
  })).rejects.toMatchObject({code:'r35_unverified_member_subject'});
  await expect(changeHeldDraftR35({
    subject:{memberId:'founder',assertedBy:'server_verified_member_session'},
    workId:work,custody:state,
    operation:{kind:'save',body:{content:'untrusted',baseRevisionId:1,
      idempotencyKey:'client'}}})).rejects
      .toMatchObject({code:'r35_invalid_work_or_member_id'});
 });
 it('refuses to encrypt or write with missing independent deletion authority',async()=>{
  syntheticFixture();
  await expect(beginHeldDraftR35({subject:testMember,workId:work,custody:state,
    content:'fictional-prose'})).rejects
      .toMatchObject({code:'r35_independent_custody_required'});
 });
 it('the review-only schema is not an installed production migration',()=>{
  const ddl=readFileSync(path.join(process.cwd(),
    'docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql'),'utf8');
  expect(ddl).toContain('NOT A DEPLOYMENT MIGRATION');
  expect(ddl).toContain('REVOKE ALL ON writers_studio_r35_draft_receipts FROM PUBLIC');
  const migration=path.join(process.cwd(),'database/migrations');
  const installed=readdirSync(migration).filter(name=>/r35/i.test(name));
  expect(installed).toEqual([]);
 });
 it('no real Next.js API endpoint imports or exposes R35 held-draft writes',()=>{
  const imported=routes(path.join(process.cwd(),'app/api')).filter(file=>
    /heldProtectedDraftR35|beginHeldDraftR35|changeHeldDraftR35|reopenHeldDraftR35/
      .test(readFileSync(file,'utf8')));
  expect(imported).toEqual([]);
 });
 it('the held schema contains no plaintext author content or idempotency token columns',()=>{
  const ddl=readFileSync(path.join(process.cwd(),
    'docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql'),'utf8');
  expect(ddl).toContain(R35_VAULT_NAMESPACE);
  for(const unsafe of ['source_text text','draft_content text','original_filename text',
    'proposed_text text','idempotency_key text','note text','section_text text']){
    expect(ddl).not.toContain(unsafe);
  }
  expect(ddl).toContain('idem_hmac char(64)');
  expect(ddl).toContain('payload_hmac char(64)');
 });
});
