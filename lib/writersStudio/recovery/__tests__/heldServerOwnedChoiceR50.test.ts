/**
 * R50 fake session fixture: actual R17/R38/R47/R46 integration contract is
 * tested physically elsewhere. Here mocks prove early refusal/order/shape.
 */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
import {NextRequest} from 'next/server';
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromSessionToken:jest.fn(),
}));
jest.mock('../heldWriterSessionReviewR17',()=>({
 R17_REAL_WRITER_SERVICE_ENABLED:false,
 reviewHeldWriterRequestR17:jest.fn(),
}));
jest.mock('../heldDraftRequestR38',()=>({
 reviewHeldDraftAdmissionR38:jest.fn(),
}));
jest.mock('../heldPrivateEditorialReviewR47',()=>({
 R47_REAL_PRIVATE_EDITORIAL_ENABLED:false,
 reopenHeldPrivateReviewR47:jest.fn(),
}));
jest.mock('../heldDurableSignedApplyR46',()=>({
 R46_REAL_DURABLE_SIGNED_APPLY_ENABLED:false,
 prepareHeldSignedApplyR46:jest.fn(),
 submitHeldSignedApplyR46:jest.fn(),
}));
jest.mock('../heldDurableAuthorApprovalR44',()=>({
 R44_REAL_AUTHOR_APPROVAL_ENABLED:false,
}));
jest.mock('../heldSignedSectionRequestR39',()=>({
 R39_REAL_SIGNED_SECTION_REQUEST_ENABLED:false,
}));
import {getMemberIdFromSessionToken} from '@/lib/auth/getMemberFromRequest';
import {reviewHeldWriterRequestR17} from '../heldWriterSessionReviewR17';
import {reviewHeldDraftAdmissionR38} from '../heldDraftRequestR38';
import {reopenHeldPrivateReviewR47} from '../heldPrivateEditorialReviewR47';
import {
 prepareHeldSignedApplyR46,submitHeldSignedApplyR46,
} from '../heldDurableSignedApplyR46';
import {
 prepareHeldServerChoiceR50,submitHeldServerChoiceR50,
 R50_REAL_SERVER_BOUND_AUTHOR_ENABLED,
} from '../heldServerOwnedChoiceR50';

const MEMBER='11111111-1111-4111-8111-111111111111';
const OTHER='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const REVIEW='44444444-4444-4444-8444-444444444444';
const TOKEN='Z'.repeat(43);
const SESSION='fake-session-1';
const RAW={
 'R50_SERVER_OWNED_CHOICE_FIXTURE':undefined,
 'DATABASE_URL':undefined,
 'FILE_STORAGE_PATH':undefined,
 'R47_PRIVATE_EDITORIAL_FIXTURE':undefined,
 'R46_DURABLE_SIGNED_APPLY_FIXTURE':undefined,
 'R38_SIGNED_DRAFT_REQUEST_FIXTURE':undefined,
 'R35_PROTECTED_DRAFT_FIXTURE':undefined,
 'R35_PHYSICAL_PG16_FIXTURE':undefined,
} as Record<string,string|undefined>;
for(const key of Object.keys(RAW))RAW[key]=process.env[key];
const admission={
 memberId:MEMBER,activeWriter:true,
 sessionBindingSHA256:'c'.repeat(64),
 consentNoticeSHA256:'a'.repeat(64),consentEventSequence:5,
};
const selected={
 expectedWorkSHA256:'d'.repeat(64),
 section:{expectedGeneration:1,chosenAlternativeId:'55555555-5555-4555-8555-555555555555',
  sectionId:'66666666-6666-4666-8666-666666666666'},
};
function request(body?:unknown,props?:{
 cookieToken?:string;headerToken?:string;origin?:string;
 host?:string;claim?:string;memberCookieClaim?:string;
 raw?:string;
}){
 const headers:Record<string,string>={
  host:props?.host??'soullab.life',origin:props?.origin??'https://soullab.life',
 };
 if(props?.headerToken)headers['x-session-token']=props.headerToken;
 if(props?.claim)headers['x-member-id']=props.claim;
 const cookies=[];
 if(props?.cookieToken)cookies.push('maia_session='+props.cookieToken);
 if(props?.memberCookieClaim)cookies.push('maia_member_id='+props.memberCookieClaim);
 if(cookies.length)headers.cookie=cookies.join('; ');
 if(body!==undefined)headers['content-type']='application/json';
 return new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
  method:body===undefined?'GET':'POST',headers,
  ...(body===undefined?{}:{body:props?.raw??JSON.stringify(body)}),
 });
}
function trusted(req:NextRequest){
 return {
  context:{request:req,workId:WORK,
   sessionBindingSecret:Buffer.alloc(32,0x22),
   issuer:{authority:'fabricated_r38_signers_no_external_kms' as const,
    issue:jest.fn()},
   workFence:{authority:'fictional_work_revocation_lock_only' as const,
    runHeld:jest.fn()},
   nowMs:()=>1792164000000},
  workId:WORK,reviewId:REVIEW,generation:1,
  draftCustody:{key:{keyId:'77777777-7777-4777-8777-777777777777',
   keyBytes:Buffer.alloc(32,0x77)},
   signedDeletion:null,trustedSigner:null,independent:null},
  privateCustody:{key:{keyId:'88888888-8888-4888-8888-888888888888',
   keyBytes:Buffer.alloc(32,0x88)},
   signedDeletion:null,trustedSigner:null,independent:null},
  approvalIssuerSecret:Buffer.alloc(32,0x46),
 };
}
const session=getMemberIdFromSessionToken as jest.Mock;
const review=reviewHeldWriterRequestR17 as jest.Mock;
const current=reviewHeldDraftAdmissionR38 as jest.Mock;
const privateRead=reopenHeldPrivateReviewR47 as jest.Mock;
const prepare=prepareHeldSignedApplyR46 as jest.Mock;
const apply=submitHeldSignedApplyR46 as jest.Mock;

beforeEach(()=>{
 jest.resetAllMocks();
 process.env.R50_SERVER_OWNED_CHOICE_FIXTURE='fictional-only';
 process.env.R47_PRIVATE_EDITORIAL_FIXTURE='fictional-only';
 process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE='fictional-only';
 process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE='fictional-only';
 process.env.R35_PROTECTED_DRAFT_FIXTURE='fictional-only';
 process.env.R35_PHYSICAL_PG16_FIXTURE='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:54321/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r50-unit/vault';
 session.mockResolvedValue(MEMBER);
 review.mockResolvedValue({kind:'held_only',
  subject:{memberId:MEMBER,assertedBy:'server_verified_member_session'},
  origin:'https://soullab.life'});
 current.mockResolvedValue(admission);
 privateRead.mockResolvedValue({kind:'HELD_PRIVATE_REVIEW_READ_ONLY',
  reviewId:REVIEW,workId:WORK,generation:1,
  releaseApproved:false,canApply:false,selection:selected});
 prepare.mockResolvedValue({
  kind:'fictional_durable_approval_prepared',opaqueToken:TOKEN,
  sectionId:selected.section.sectionId,
  alternativeId:selected.section.chosenAlternativeId,generation:1,
  releaseApproved:false});
 apply.mockResolvedValue({
  kind:'fictional_durably_claimed_encrypted_apply',
  action:'apply',generation:2,durableClaimSpent:true,releaseApproved:false});
});
afterAll(()=>{for(const [k,v] of Object.entries(RAW))
 if(v===undefined)delete process.env[k];else process.env[k]=v;});
function sourceRoutes(directory:string):string[]{
 return readdirSync(directory,{withFileTypes:true}).flatMap(e=>{
  const file=path.join(directory,e.name);
  return e.isDirectory()?sourceRoutes(file):
   e.isFile()&&/^route\.(ts|tsx)$/.test(e.name)?[file]:[];
 });
}
describe('R50 staging choice bound to real authorization calls, no live route',()=>{
 it('compiled real service is OFF and missing fixture returns before session or SQL',async()=>{
  expect(R50_REAL_SERVER_BOUND_AUTHOR_ENABLED).toBe(false);
  delete process.env.R50_SERVER_OWNED_CHOICE_FIXTURE;
  expect(await prepareHeldServerChoiceR50(
   trusted(request(undefined,{headerToken:SESSION}))))
    .toMatchObject({kind:'refused',status:404,releaseApproved:false});
  expect(session).not.toHaveBeenCalled();
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('verified Safari header transport derives principal, never uses submitted member',async()=>{
  const out=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{headerToken:SESSION})));
  expect(out).toMatchObject({kind:'fictional_durable_approval_prepared',
    releaseApproved:false});
  expect(session).toHaveBeenCalledWith(SESSION);
  expect(review).toHaveBeenCalledTimes(1);
  expect(current).toHaveBeenCalledTimes(1);
  expect(privateRead).toHaveBeenCalledWith(expect.objectContaining({
   subject:{memberId:MEMBER,assertedBy:'server_verified_member_session'},
   reviewId:REVIEW,workId:WORK,generation:1,
  }));
  expect(prepare).toHaveBeenCalledWith(expect.objectContaining({
   selection:selected,
  }));
 });
 it('cookie-only browser transport is explicitly reverified and normalized',async()=>{
  const out=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{cookieToken:SESSION})));
  expect(out.kind).toBe('fictional_durable_approval_prepared');
  const normalized=(review.mock.calls[0][0] as NextRequest);
  expect(normalized.headers.get('x-session-token')).toBe(SESSION);
  expect(session).toHaveBeenCalledWith(SESSION);
 });
 it('both credential types with different tokens fail BEFORE anything is read',async()=>{
  const result=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{cookieToken:SESSION,headerToken:'another-session'})));
  expect(result).toMatchObject({kind:'refused',status:403,
   reason:'conflicting_session_credentials'});
  expect(session).not.toHaveBeenCalled();
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('identity claims, unknown or conflicted resolved subject refuse',async()=>{
  const claimed=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{headerToken:SESSION,claim:OTHER})));
  expect(claimed).toMatchObject({kind:'refused',status:403});
  expect(session).not.toHaveBeenCalled();
  const cookieClaim=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{cookieToken:SESSION,memberCookieClaim:MEMBER})));
  expect(cookieClaim).toMatchObject({kind:'refused',status:403});
  session.mockResolvedValue(OTHER);
  const mismatched=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{headerToken:SESSION})));
  expect(mismatched).toMatchObject({kind:'refused',status:403,
   reason:'mismatched_verified_session_sources'});
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('missing current consent blocks private decryption and token creation',async()=>{
  current.mockResolvedValue(null);
  const result=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{headerToken:SESSION})));
  expect(result).toMatchObject({kind:'refused',status:403,
   reason:'current_author_consent_refused'});
  expect(privateRead).not.toHaveBeenCalled();
  expect(prepare).not.toHaveBeenCalled();
 });
 it('server-selected private choice cannot be overridden by browser prose/Work fields',async()=>{
  const result=await submitHeldServerChoiceR50(trusted(request({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
   workId:OTHER,chosenAlternativeId:'attacker-words',
  },{headerToken:SESSION})));
  expect(result).toMatchObject({kind:'refused',status:400,
   reason:'browser_supplied_work_or_selection_refused'});
  expect(privateRead).not.toHaveBeenCalled();
  expect(apply).not.toHaveBeenCalled();
 });
 it('POST cookie-only author token forwards exact encrypted R47 selection',async()=>{
  const out=await submitHeldServerChoiceR50(trusted(request({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  },{cookieToken:SESSION})));
  expect(out).toMatchObject({
   kind:'fictional_durably_claimed_encrypted_apply',
   releaseApproved:false,durableClaimSpent:true});
  expect(privateRead).toHaveBeenCalledTimes(1);
  expect(apply).toHaveBeenCalledWith(expect.objectContaining({
    selection:selected,
  }));
  const forwarded=apply.mock.calls[0][0].context.request as NextRequest;
  expect(forwarded.headers.get('x-session-token')).toBe(SESSION);
  expect(JSON.parse(await forwarded.text())).toEqual({
   kind:'apply_reviewed_change',opaqueToken:TOKEN});
 });
 it('foreign Origin, changed cookie, hidden Work and stale encrypted preview refuse',async()=>{
  const foreign=await submitHeldServerChoiceR50(trusted(request({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  },{headerToken:SESSION,origin:'https://attacker.invalid'})));
  expect(foreign).toMatchObject({kind:'refused',status:403});
  expect(privateRead).not.toHaveBeenCalled();
  const missing=await prepareHeldServerChoiceR50({
   ...trusted(request(undefined,{headerToken:SESSION})),workId:OTHER});
  expect(missing).toMatchObject({kind:'refused',status:503});
  privateRead.mockRejectedValue(new Error('r47_changed_consent'));
  const stale=await prepareHeldServerChoiceR50(trusted(request(
   undefined,{headerToken:SESSION})));
  expect(stale).toMatchObject({kind:'refused',status:409});
  expect(prepare).not.toHaveBeenCalled();
 });
 it('foreign preview Origin and unverified section/author headers are refused before private read',async()=>{
  const foreign=await prepareHeldServerChoiceR50(trusted(
   request(undefined,{headerToken:SESSION,origin:'https://attacker.invalid'})));
  expect(foreign).toMatchObject({kind:'refused',status:403,
   reason:'cross_origin_private_preview_refused'});
  const withFakeScope=request(undefined,{headerToken:SESSION});
  withFakeScope.headers.set('x-work-id',OTHER);
  withFakeScope.headers.set('x-author-confirmed','true');
  const outcome=await prepareHeldServerChoiceR50(trusted(withFakeScope));
  expect(outcome).toMatchObject({kind:'refused',status:403,
   reason:'client_identity_claim_not_permitted'});
  expect(privateRead).not.toHaveBeenCalled();
 });
 it('oversize or unparseable POST bodies cannot reach immutable private review',async()=>{
  const huge=request({kind:'apply_reviewed_change',opaqueToken:TOKEN},
   {headerToken:SESSION,raw:'x'.repeat(2000)});
  const denied=await submitHeldServerChoiceR50(trusted(huge));
  expect(denied).toMatchObject({kind:'refused',status:413,
   reason:'oversized_author_choice'});
  const invalid=request({kind:'apply_reviewed_change',opaqueToken:TOKEN},
   {headerToken:SESSION,raw:'{'});
  const wrong=await submitHeldServerChoiceR50(trusted(invalid));
  expect(wrong).toMatchObject({kind:'refused',status:400,
   reason:'invalid_author_choice_json'});
  expect(privateRead).not.toHaveBeenCalled();
  expect(apply).not.toHaveBeenCalled();
 });
 it('cannot be invoked through an active Writer Next API route',()=>{
  const routeFiles=sourceRoutes(path.join(process.cwd(),'app/api'));
  expect(routeFiles.filter(f=>/heldServerOwnedChoiceR50|submitHeldServerChoiceR50|prepareHeldServerChoiceR50/.test(readFileSync(f,'utf8')))).toEqual([]);
 });
});
