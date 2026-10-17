/** R57 final authority recheck around R47 encrypted private review. */
import {createHmac} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {NextRequest} from 'next/server';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('@/lib/auth/verifiedAccess',()=>({deriveVerifiedAccess:jest.fn()}));
jest.mock('@/lib/writersStudio/betaAccessServer',()=>{
 const actual=jest.requireActual('@/lib/writersStudio/betaAccessServer');
 return {...actual,writersStudioBetaAccess:jest.fn()};
});
jest.mock('@/lib/writersStudio/betaConsentNotice',()=>({
 verifiedBetaConsentNotice:jest.fn(),
}));
jest.mock('../heldPrivateEditorialReviewR47',()=>({
 reopenHeldPrivateReviewR47:jest.fn(),
 R47_REAL_PRIVATE_EDITORIAL_ENABLED:false,
}));
import {query} from '@/lib/db/postgres';
import {deriveVerifiedAccess} from '@/lib/auth/verifiedAccess';
import {writersStudioBetaAccess} from '@/lib/writersStudio/betaAccessServer';
import {verifiedBetaConsentNotice}
 from '@/lib/writersStudio/betaConsentNotice';
import {reopenHeldPrivateReviewR47} from '../heldPrivateEditorialReviewR47';
import {reopenHeldRealPrivateEditorialR57,
 R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED}
 from '../heldRealPrivateEditorialR57';
import type {R47ReadInput}
 from '../heldPrivateEditorialReviewR47';

const M='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const MANUSCRIPT='33333333-3333-4333-8333-333333333333';
const WORK='44444444-4444-4444-8444-444444444444';
const SECTION='55555555-5555-4555-8555-555555555555';
const ALT='66666666-6666-4666-8666-666666666666';
const REVIEW='77777777-7777-4777-8777-777777777777';
const ORIGINAL='The fictional lantern stood beside the river.';
const PROPOSED='The fictional lantern shimmered beside the river.';
const TOKEN='r57-fictional-authenticated-session';
const policy='a'.repeat(64);
const secret=Buffer.alloc(32,0x51);
const binding=createHmac('sha256',secret)
 .update('r38-fictional-session-binding:').update(TOKEN).digest('hex');
const mockDb=query as jest.Mock;
const identity=deriveVerifiedAccess as jest.Mock;
const beta=writersStudioBetaAccess as jest.Mock;
const notice=verifiedBetaConsentNotice as jest.Mock;
const privateRead=reopenHeldPrivateReviewR47 as jest.Mock;
const fields=[
 'R57_PRIVATE_READ_FIXTURE','R56_REAL_SESSION_WORK_FIXTURE',
 'R47_PRIVATE_EDITORIAL_FIXTURE','R35_PROTECTED_DRAFT_FIXTURE',
 'R35_PHYSICAL_PG16_FIXTURE','WRITERS_STUDIO_RESTRICTED_BETA',
 'WRITERS_STUDIO_BETA_MEMBER_IDS','DATABASE_URL','FILE_STORAGE_PATH',
] as const;
const old=Object.fromEntries(fields.map(k=>[k,process.env[k]]));
const request=(extra:Record<string,string>={})=>new NextRequest(
 'https://soullab.life/api/writers-studio/held-author-admission',{
 method:'POST',headers:{
  host:'soullab.life',origin:'https://soullab.life',
  'sec-fetch-site':'same-origin','content-type':'application/json',
  'x-ws-author-intent':'review',cookie:'maia_session='+TOKEN,
  ...extra,
 }});
const syntheticPrivate=():R47ReadInput=>({
 subject:{memberId:M,assertedBy:'server_verified_member_session'},
 workId:MANUSCRIPT,reviewId:REVIEW,generation:7,
 admission:{
  memberId:M,sessionBindingSHA256:binding,activeWriter:true,
  consentNoticeSHA256:policy,consentEventSequence:19,
 },
 draftCustody:{} as R47ReadInput['draftCustody'],
 privateCustody:{} as R47ReadInput['privateCustody'],
});
const output=()=>({
 kind:'HELD_PRIVATE_REVIEW_READ_ONLY',
 reviewId:REVIEW,workId:MANUSCRIPT,generation:7,
 preview:{
  sectionId:SECTION,alternativeId:ALT,
  originalPassage:ORIGINAL,proposedPassage:PROPOSED,
  sectionOrder:[SECTION],untouchedSectionIds:[],
 },
 selection:{section:{sectionId:SECTION,chosenAlternativeId:ALT}},
 releaseApproved:false,canApply:false,
});
const invoke=(overrides:Partial<R47ReadInput>={},req=request())=>
 reopenHeldRealPrivateEditorialR57({
  request:req,manuscriptId:MANUSCRIPT,livingWorkId:WORK,
  privateRead:{...syntheticPrivate(),...overrides},
  sessionBindingSecret:secret,
 });
function baseline(){
 for(const k of fields.slice(0,5))process.env[k]='fictional-only';
 process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
 process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=M+','+FOREIGN;
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59982/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r57-unit/vault';
 identity.mockResolvedValue({
  authenticated:true,memberId:M,roles:['member'],tier:'pro',
 });
 beta.mockResolvedValue({eligible:true,basis:'active_beta_tester'});
 notice.mockReturnValue({version:'fictional-v1',sha256:policy,
  text:'This fictional beta notice is long enough for the review gate.'});
 mockDb.mockImplementation(async(sql:string)=>{
  if(sql.includes('writers_studio_beta_consent_events'))
   return {rows:[{seq:19,decision:'accept',
    policy_version:'fictional-v1',policy_sha256:policy}]};
  if(sql.includes('living_work_expressions'))
   return {rows:[{manuscript_id:MANUSCRIPT,living_work_id:WORK,
    draft_generation:7}]};
  throw Error('unexpected query');
 });
 privateRead.mockResolvedValue(output());
}
beforeEach(()=>{jest.resetAllMocks();baseline();});
afterAll(()=>fields.forEach(k=>old[k]===undefined?
 delete process.env[k]:process.env[k]=old[k]));
const crawl=(dir:string):string[]=>
 readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const f=path.join(dir,entry.name);
  return entry.isDirectory()?crawl(f):
   /^route\.(ts|tsx)$/.test(entry.name)?[f]:[];
 });
describe('R57 pre/private/post verified current author review',()=>{
 it('is permanently OFF for real member data, even with runtime flag',async()=>{
  expect(R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED).toBe(false);
  delete process.env.R57_PRIVATE_READ_FIXTURE;
  expect(await invoke()).toMatchObject({
   kind:'held_only_refused',reason:'disabled',releaseApproved:false,
  });
  expect(mockDb).not.toHaveBeenCalled();
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('returns separately authenticated private prose only after two checks',async()=>{
  expect(await invoke()).toMatchObject({
   kind:'held_private_current_author_preview',
   sectionId:SECTION,alternativeId:ALT,
   originalPassage:ORIGINAL,proposedPassage:PROPOSED,
   draftGeneration:7,canApply:false,canRestore:false,
   releaseApproved:false,
  });
  expect(privateRead).toHaveBeenCalledTimes(1);
  expect(mockDb).toHaveBeenCalledTimes(4);
 });
 it('does not expose member, manuscript or Living Work authority in output',async()=>{
  const result=JSON.stringify(await invoke());
  for(const secretValue of [M,MANUSCRIPT,WORK,REVIEW,TOKEN,policy,'sessionBindingSHA256'])
   expect(result).not.toContain(secretValue);
  expect(result).toContain('canApply');
 });
 it('foreign private Work ID refuses without decrypting',async()=>{
  expect(await invoke({workId:FOREIGN})).toMatchObject({
   kind:'held_only_refused',reason:'wrong_private_scope',
  });
  expect(privateRead).not.toHaveBeenCalled();
  expect(mockDb).not.toHaveBeenCalled();
 });
 it('foreign author in private custody is refused after real identity lookup',async()=>{
  expect(await invoke({subject:{
   memberId:FOREIGN,assertedBy:'server_verified_member_session',
  }})).toMatchObject({
   kind:'held_only_refused',reason:'stale_or_foreign_private_review',
  });
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('session token must independently match R38 protected token binding',async()=>{
  expect(await invoke({admission:{
   ...syntheticPrivate().admission,sessionBindingSHA256:'a'.repeat(64),
  }})).toMatchObject({
   kind:'held_only_refused',reason:'session_or_consent_refused',
  });
  expect(mockDb).not.toHaveBeenCalled();
 });
 it('stale draft generation or consent epoch is refused before decrypting',async()=>{
  for(const x of [
   {generation:6},
   {admission:{...syntheticPrivate().admission,consentEventSequence:18}},
  ]){
   jest.clearAllMocks();baseline();
   expect((await invoke(x)).kind).toBe('held_only_refused');
   expect(privateRead).not.toHaveBeenCalled();
  }
 });
 it('a private sealed ciphertext/refusal cannot become a preview',async()=>{
  privateRead.mockRejectedValueOnce(Error('fictional damaged ciphertext'));
  const result=await invoke();
  expect(result).toMatchObject({kind:'held_only_refused',
   reason:'private_ciphertext_unavailable'});
  expect(JSON.stringify(result)).not.toContain(ORIGINAL);
 });
 it('modified section/alternative identity is held after decryption',async()=>{
  privateRead.mockResolvedValueOnce({...output(),
   preview:{...output().preview,alternativeId:FOREIGN}});
  const r=await invoke();
  expect(r.kind).toBe('held_only_refused');
  expect(JSON.stringify(r)).not.toContain(PROPOSED);
 });
 it('a consent withdrawal DURING decryption suppresses all private text',async()=>{
  let revoked=false;
  mockDb.mockImplementation(async(sql:string)=>{
   if(sql.includes('writers_studio_beta_consent_events'))
    return {rows:[{seq:revoked?20:19,decision:revoked?'revoke':'accept',
     policy_version:'fictional-v1',policy_sha256:policy}]};
   return {rows:[{manuscript_id:MANUSCRIPT,living_work_id:WORK,
    draft_generation:7}]};
  });
  privateRead.mockImplementationOnce(async()=>{
   revoked=true;return output();
  });
  const r=await invoke();
  expect(r).toMatchObject({kind:'held_only_refused',
   reason:'current_authority_changed'});
  expect(JSON.stringify(r)).not.toContain(ORIGINAL);
 });
 it('a changed Work head DURING private decryption is refused',async()=>{
  let moved=false;
  mockDb.mockImplementation(async(sql:string)=>{
   if(sql.includes('writers_studio_beta_consent_events'))
    return {rows:[{seq:19,decision:'accept',
     policy_version:'fictional-v1',policy_sha256:policy}]};
   return {rows:[{manuscript_id:MANUSCRIPT,living_work_id:WORK,
    draft_generation:moved?8:7}]};
  });
  privateRead.mockImplementationOnce(async()=>{
   moved=true;return output();
  });
  expect(await invoke()).toMatchObject({kind:'held_only_refused',
   reason:'current_authority_changed'});
 });
 it('a revoked cookie after initial review refuses before any private read',async()=>{
  identity.mockResolvedValueOnce({authenticated:false,
   memberId:null,roles:[],tier:'free'});
  expect(await invoke()).toMatchObject({kind:'held_only_refused',
   reason:'session_or_consent_refused'});
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('a forged role or cross-site POST refuses before private decrypt',async()=>{
  expect((await invoke({},request({'x-access-roles':'admin'}))).kind)
   .toBe('held_only_refused');
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('no mounted Next route or automatically issued Apply/Undo',()=>{
  const root=process.cwd();
  expect(crawl(path.join(root,'app/api')).filter(f=>
   /reopenHeldRealPrivateEditorialR57|heldRealPrivateEditorialR57/.test(
    readFileSync(f,'utf8')))).toEqual([]);
  const code=readFileSync(path.join(root,
   'lib/writersStudio/recovery/heldRealPrivateEditorialR57.ts'),'utf8');
  expect(code).toContain('R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED=false');
  for(const x of ['submitHeldSignedApplyR46(','submitHeldUndoR47(',
   'recordHeldPrivateReviewR47(','INSERT INTO','DELETE FROM'])
   expect(code).not.toContain(x);
 });
});
