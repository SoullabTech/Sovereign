/** R48 metadata + actual synthetic cipher evidence; NO real data or SQL. */
import {createHash,createHmac,randomUUID} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {payloadHash} from '@/lib/manuscript/draftConcurrency';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('../heldProtectedDraftR35',()=>({
 R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED:false,
 reopenHeldDraftR35:jest.fn(),
}));
jest.mock('../heldDurableAuthorApprovalR44',()=>({
 R44_PROTOCOL:'soullab.ws.r44.durable-review-claim.v1',
 R44_REAL_AUTHOR_APPROVAL_ENABLED:false,
}));
jest.mock('../heldSectionApplyR37',()=>({
 R37_PROTOCOL:'soullab.ws.r37.section-passage.v1',
 R37_REAL_SECTION_EDIT_ENABLED:false,
}));
jest.mock('../heldDurableSignedApplyR46',()=>({
 R46_REAL_DURABLE_SIGNED_APPLY_ENABLED:false,
}));
import {query} from '@/lib/db/postgres';
import {reopenHeldDraftR35} from '../heldProtectedDraftR35';
import {inspectSpentApplyR48,R48_REAL_SPENT_APPLY_RECOVERY_ENABLED}
 from '../heldSpentApplyEvidenceR48';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const ALT='66666666-6666-4666-8666-666666666666';
const SOURCE='🌙 A fictional lantern glows beside a quiet river.\n\n';
const EDITED='🌙 A fictional lantern shimmers beside a quiet river.\n\n';
const SECOND='A second invented section stays exactly as written.';
const HASH=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const TOKEN='q'.repeat(43);
const secret=Buffer.alloc(32,0x46);
const keyBytes=Buffer.alloc(32,0x37);
const keyId='88888888-8888-4888-8888-888888888888';
const digest=(key:Buffer,domain:string,parts:string[])=>{
 const h=createHmac('sha256',key).update(domain);
 for(const x of parts)h.update('\u0000').update(x);
 return h.digest('hex');
};
const idem='r46-'+createHmac('sha256',secret).update('spent-approved-author-edit\u0000')
 .update(TOKEN).digest('hex').slice(0,40);
const idemTag=digest(keyBytes,'r35.idempotency-key.v1',[A,WORK,idem]);
const claim={
 member_id:A,work_id:WORK,section_id:S1,alternative_id:ALT,
 expected_generation:1,state:'spent',spent_at_ms:1792164000000,
 session_binding_sha256:'c'.repeat(64),
 notice_sha256:'d'.repeat(64),consent_sequence:42,
 review_binding_hmac:'a'.repeat(64),
};
const privateNote=JSON.stringify({
 protocol:'soullab.ws.r37.section-passage.v1',kind:'apply',
 sectionId:S1,alternativeId:ALT,fromGeneration:1,
 previousWorkSHA256:HASH(SOURCE+SECOND),
 resultingSectionSHA256:HASH(EDITED),
});
const before={
 workId:WORK,generation:1,checkpointCount:0,kind:'sections' as const,
 content:SOURCE+SECOND,sections:[{id:S1,text:SOURCE},{id:S2,text:SECOND}],
 action:'start' as const,note:null,restoredFrom:null,
};
const after={
 workId:WORK,generation:2,checkpointCount:0,kind:'sections' as const,
 content:EDITED+SECOND,sections:[{id:S1,text:EDITED},{id:S2,text:SECOND}],
 action:'save' as const,note:privateNote,restoredFrom:null,
};
const expectedPayload=digest(keyBytes,'r35.payload.v1',[
 A,WORK,'save:'+payloadHash('save',{
  sections:after.sections,checkpoint:false,note:privateNote,
 }),
]);
const receipt={
 action:'save',generation:2,checkpoint_count:0,
 payload_hmac:expectedPayload,
};
const version={
 key_id:keyId,cipher_sha256:'e'.repeat(64),action:'save',
 checkpoint_count:0,
};
const custody={
 key:{keyId,keyBytes},
 signedDeletion:null,trustedSigner:null,independent:null,
};
const reader={
 authority:'fictional_independent_recovery_custodian_only' as const,
 memberId:A,workId:WORK,approvalToken:TOKEN,
 approvalIssuerSecret:secret,custody,
};
const db=query as jest.Mock;
const vault=reopenHeldDraftR35 as jest.Mock;
const flags=[
 'R48_SPENT_APPLY_RECOVERY_FIXTURE',
 'R46_DURABLE_SIGNED_APPLY_FIXTURE',
 'R44_DURABLE_APPROVAL_FIXTURE',
 'R37_SECTION_PASSAGE_FIXTURE',
 'R35_PROTECTED_DRAFT_FIXTURE',
 'R35_PHYSICAL_PG16_FIXTURE',
] as const;
const old=Object.fromEntries([...flags,'DATABASE_URL','FILE_STORAGE_PATH']
 .map(k=>[k,process.env[k]]));
function setFixture(){
 for(const x of flags)process.env[x]='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59888/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r48-unit/vault';
}
function resetDb(rows:unknown[][]=[[claim],[receipt],[version]]){
 db.mockReset();
 db.mockImplementation(async(s:string,params:unknown[])=>{
  const type=s.includes('writers_studio_r44_held_approval')?0:
   s.includes('writers_studio_r35_draft_receipts')?1:2;
  if(type===1)expect(params[1]).toBe(idemTag);
  return {rows:rows[type]};
 });
}
function defaults(){
 jest.clearAllMocks();setFixture();resetDb();
 vault.mockImplementation(async(arg:{generation:number})=>
  arg.generation===1?before:after);
}
function allRoutes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
  const f=path.join(dir,item.name);
  return item.isDirectory()?allRoutes(f):
    item.isFile()&&/^route\.(ts|tsx)$/.test(item.name)?[f]:[];
 });
}
beforeEach(defaults);
afterAll(()=>{
 for(const k of [...flags,'DATABASE_URL','FILE_STORAGE_PATH']){
  if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];
 }
});
describe('R48 read-only proof of R46 spent Apply; no automatic retry',()=>{
 it('is compiled OFF and has no DB I/O without explicit fixture',async()=>{
  expect(R48_REAL_SPENT_APPLY_RECOVERY_ENABLED).toBe(false);
  delete process.env.R48_SPENT_APPLY_RECOVERY_FIXTURE;
  expect(await inspectSpentApplyR48(reader)).toMatchObject({
   kind:'held_only',reason:'HELD_UNVERIFIED_REQUEST',
   retryAuthorized:false,releaseApproved:false,
  });
  expect(db).not.toHaveBeenCalled();expect(vault).not.toHaveBeenCalled();
 });
 it('every fiction-only flag and localhost vault is checked before SQL',async()=>{
  for(const k of flags){
   process.env[k]='production';
   expect((await inspectSpentApplyR48(reader)).kind).toBe('held_only');
   process.env[k]='fictional-only';
  }
  process.env.DATABASE_URL='postgresql://fict@production/r35_draft';
  expect((await inspectSpentApplyR48(reader)).kind).toBe('held_only');
  process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59888/r35_draft';
  process.env.FILE_STORAGE_PATH='/prod/vault';
  expect((await inspectSpentApplyR48(reader)).kind).toBe('held_only');
  expect(db).not.toHaveBeenCalled();
 });
 it('wrong issuer root, token, Work or member never reveals receipt existence',async()=>{
  const correctTag=createHmac('sha256',secret).update(JSON.stringify([
   'soullab.ws.r44.durable-review-claim.v1','opaque-token',TOKEN,
  ])).digest('hex');
  db.mockImplementation(async(s:string,params:unknown[])=>{
   if(!s.includes('writers_studio_r44_held_approval'))throw Error('unexpected I/O');
   return {rows:params[0]===A&&params[1]===WORK&&params[2]===correctTag?
    [claim]:[]};
  });
  for(const input of [
   {...reader,memberId:B},
   {...reader,workId:B},
   {...reader,approvalToken:'invalid-token'},
   {...reader,approvalIssuerSecret:Buffer.alloc(32,8)},
   {...reader,authority:'client' as never},
  ]){
   const v=await inspectSpentApplyR48(input);
   expect(v).toMatchObject({kind:'held_only',retryAuthorized:false});
   expect(JSON.stringify(v)).not.toContain(EDITED);
  }
  expect(vault).not.toHaveBeenCalled();
 });
 it('a prepared approval is not a proven committed edit',async()=>{
  resetDb([[{...claim,state:'prepared',spent_at_ms:null}],[receipt],[version]]);
  expect(await inspectSpentApplyR48(reader)).toMatchObject({
   kind:'held_only',reason:'HELD_NO_SPENT_APPROVAL',
   retryAuthorized:false,
  });
  expect(vault).not.toHaveBeenCalled();
 });
 it('a spent token without immutable matching receipt remains unresolved',async()=>{
  resetDb([[claim],[],[version]]);
  const result=await inspectSpentApplyR48(reader);
  expect(result).toMatchObject({
   kind:'held_only',reason:'HELD_SPENT_WITHOUT_MATCHING_RECEIPT',
   retryAuthorized:false,
  });
  expect(vault).not.toHaveBeenCalled();
 });
 it('a matching R35 receipt AND decryptable previous+next snapshots prove saved Apply',async()=>{
  const result=await inspectSpentApplyR48(reader);
  expect(result).toMatchObject({
   kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',
   action:'apply',generation:2,cipherSHA256:version.cipher_sha256,
   priorDraftVersionVerified:true,unchangedSectionIds:[S2],
   retryAuthorized:false,releaseApproved:false,
  });
  expect(vault).toHaveBeenCalledTimes(2);
  expect(JSON.stringify(result)).not.toContain(SOURCE);
  expect(JSON.stringify(result)).not.toContain(EDITED);
  expect(JSON.stringify(result)).not.toContain(TOKEN);
  const approvalRead=db.mock.calls[0] as [string,unknown[]];
  const tokenExpected=createHmac('sha256',secret).update(JSON.stringify([
   'soullab.ws.r44.durable-review-claim.v1','opaque-token',TOKEN,
  ])).digest('hex');
  expect(approvalRead[1][2]).toBe(tokenExpected);
  const archiveRead=db.mock.calls[1] as [string,unknown[]];
  expect(archiveRead[1][1]).toBe(idemTag);
 });
 it('an idempotency receipt with wrong action or generation cannot prove Apply',async()=>{
  for(const fake of [
   {...receipt,generation:4},
   {...receipt,action:'restore'},
   {...receipt,payload_hmac:'f'.repeat(64)},
  ]){
   defaults();resetDb([[claim],[fake],[version]]);
   expect(await inspectSpentApplyR48(reader)).toMatchObject({
    kind:'held_only',reason:'HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT',
   });
  }
 });
 it('wrong cipher key ID, digest or action refuses rather than promoting',async()=>{
  for(const bad of [
   {...version,key_id:B},
   {...version,cipher_sha256:'bad'},
   {...version,action:'restore'},
  ]){
   defaults();resetDb([[claim],[receipt],[bad]]);
   expect((await inspectSpentApplyR48(reader)).kind).toBe('held_only');
  }
 });
 it('changed private Note provenance cannot be laundered as this approved Apply',async()=>{
  for(const n of [
   JSON.stringify({...JSON.parse(privateNote),alternativeId:B}),
   JSON.stringify({...JSON.parse(privateNote),sectionId:S2}),
   JSON.stringify({...JSON.parse(privateNote),fromGeneration:0}),
   'untrusted editorial note',
  ]){
   defaults();
   vault.mockImplementation(async(a:{generation:number})=>a.generation===1?
     before:{...after,note:n});
   expect(await inspectSpentApplyR48(reader)).toMatchObject({
    kind:'held_only',retryAuthorized:false,
   });
  }
 });
 it('changed untouched section, reordered IDs or missing ciphertext never succeed',async()=>{
  for(const altered of [
   {...after,sections:[{id:S1,text:EDITED},{id:S2,text:SECOND+' forgery'}],
    content:EDITED+SECOND+' forgery'},
   {...after,sections:[{id:S2,text:EDITED},{id:S1,text:SECOND}]},
   {...after,action:'restore'},
  ]){
   defaults();
   vault.mockImplementation(async(a:{generation:number})=>a.generation===1?
     before:altered);
   expect((await inspectSpentApplyR48(reader)).kind).toBe('held_only');
  }
  defaults();
  vault.mockRejectedValueOnce(Error('revoked or encrypted object missing'));
  expect((await inspectSpentApplyR48(reader)).kind).toBe('held_only');
 });
 it('server-side SQL failure does not grant retry or reveal words',async()=>{
  db.mockRejectedValueOnce(Error('PG fixture temporarily offline'));
  const result=await inspectSpentApplyR48(reader);
  expect(result).toMatchObject({kind:'held_only',retryAuthorized:false});
  expect(JSON.stringify(result)).not.toContain('PG fixture');
 });
 it('read-only SQL statements, zero writer/delete/key-retirement operations',async()=>{
  await inspectSpentApplyR48(reader);
  for(const call of db.mock.calls){
   const sql=String(call[0]).trim();
   expect(sql).toMatch(/^SELECT /);
   expect(sql).not.toMatch(/\b(UPDATE|INSERT|DELETE|DROP|ALTER)\b/i);
  }
  const matched=allRoutes(path.join(process.cwd(),'app/api')).filter(f=>
   /heldSpentApplyEvidenceR48|inspectSpentApplyR48/.test(
    readFileSync(f,'utf8')));
  expect(matched).toEqual([]);
  const source=readFileSync(path.join(process.cwd(),
   'lib/writersStudio/recovery/heldSpentApplyEvidenceR48.ts'),'utf8');
  for(const forbidden of [
   'changeHeldDraftR35(', 'deleteVaultBytes(', 'retireWorkKey(',
   'process.env.R48_REAL_SPENT_APPLY_RECOVERY_ENABLED',
  ])expect(source).not.toContain(forbidden);
 });
});
