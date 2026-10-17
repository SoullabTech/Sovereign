/**
 * R53 default-off, exact canonical R41 author UI -> synthetic R46/R47
 * orchestration. All SQL, signed writes and decryption are mocked here;
 * physical PostgreSQL/real AES-GCM is qualified in a separate test.
 */
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {NextRequest} from 'next/server';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('../heldDraftRequestR38',()=>({
 reviewHeldDraftAdmissionR38:jest.fn(),
}));
jest.mock('../heldProtectedDraftR35',()=>({
 reopenHeldDraftR35:jest.fn(),
}));
jest.mock('../heldDurableSignedApplyR46',()=>({
 prepareHeldSignedApplyR46:jest.fn(),
 submitHeldSignedApplyR46:jest.fn(),
}));
jest.mock('../heldDurableUndoR47',()=>({
 prepareHeldUndoR47:jest.fn(),
 submitHeldUndoR47:jest.fn(),
}));
import {query} from '@/lib/db/postgres';
import {reviewHeldDraftAdmissionR38} from '../heldDraftRequestR38';
import {reopenHeldDraftR35} from '../heldProtectedDraftR35';
import {prepareHeldSignedApplyR46,submitHeldSignedApplyR46}
 from '../heldDurableSignedApplyR46';
import {prepareHeldUndoR47,submitHeldUndoR47}
 from '../heldDurableUndoR47';
import {exactTextareaPassageR41}
 from '@/lib/writersStudio/exactLiveSelectionR41';
import {HeldCanonicalAuthorJourneyR53,
 R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED}
 from '../heldCanonicalAuthorJourneyR53';

const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const A='66666666-6666-4666-8666-666666666666';
const B='77777777-7777-4777-8777-777777777777';
const C1='🍂 First lantern glows. Second lantern glows.\n\n';
const C2='This other fictional section must not move.';
const TOKEN='Q'.repeat(43),UNDO='J'.repeat(43);
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const before={
 workId:WORK,generation:1,checkpointCount:0,kind:'sections' as const,
 sections:[{id:S1,text:C1},{id:S2,text:C2}],
 content:C1+C2,note:null,action:'start' as const,restoredFrom:null,
};
const admission={memberId:MEMBER,activeWriter:true as const,
 sessionBindingSHA256:'c'.repeat(64),
 consentNoticeSHA256:'d'.repeat(64),consentEventSequence:17};
const issuerSecret=Buffer.alloc(32,0x41);
const custody={
 key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,7)},
 signedDeletion:null,trustedSigner:null,independent:null,
};
const proposals=[
 {id:A,origin:'maia' as const,wording:'lantern shimmers'},
 {id:B,origin:'member' as const,wording:'lantern shines'},
];
const selected=()=>{
 const loc=C1.lastIndexOf('lantern glows');
 return exactTextareaPassageR41(C1,C1,loc,loc+'lantern glows'.length);
};
const request=(input?:unknown,origin='https://soullab.life')=>new NextRequest(
 'https://soullab.life/api/r53-not-an-active-route',{
  method:input===undefined?'GET':'POST',
  headers:{host:'soullab.life',origin,
   'content-type':'application/json',
   'x-session-token':'r53-synthetic-server-session'},
  ...(input===undefined?{}:{body:JSON.stringify(input)}),
 });
const reviewBody=()=>({
 kind:'review_exact_passage',expectedGeneration:1,
 sectionId:S1,selected:selected(),chosenAlternativeId:A,
});
function ctx(body?:unknown,memberWork=WORK,origin='https://soullab.life'){
 return {
  context:{
   request:request(body,origin),
   workId:memberWork,
   sessionBindingSecret:Buffer.alloc(32,9),
   issuer:{authority:'fabricated_r38_signers_no_external_kms' as const,
    issue:async()=>{throw Error('mock issuer only');}},
   workFence:{authority:'fictional_work_revocation_lock_only' as const,
    runHeld:async<T>(_scope:unknown,fn:()=>Promise<T>):Promise<T>=>fn()},
   nowMs:()=>1792164000000,
  },
  custody,approvalIssuerSecret:issuerSecret,alternatives:proposals,
 };
}
const sql=query as jest.Mock;
const adm=reviewHeldDraftAdmissionR38 as jest.Mock;
const open=reopenHeldDraftR35 as jest.Mock;
const prepare=prepareHeldSignedApplyR46 as jest.Mock;
const apply=submitHeldSignedApplyR46 as jest.Mock;
const undoPrepare=prepareHeldUndoR47 as jest.Mock;
const undo=submitHeldUndoR47 as jest.Mock;
const vars=[
 'R53_CANONICAL_AUTHOR_FIXTURE','R43_CANONICAL_REVIEW_FIXTURE',
 'R37_SECTION_PASSAGE_FIXTURE','R36_PASSAGE_REVIEW_FIXTURE',
 'R46_DURABLE_SIGNED_APPLY_FIXTURE','R47_DURABLE_UNDO_FIXTURE',
 'R35_PROTECTED_DRAFT_FIXTURE','R35_PHYSICAL_PG16_FIXTURE',
 'DATABASE_URL','FILE_STORAGE_PATH',
] as const;
const original=Object.fromEntries(vars.map(k=>[k,process.env[k]]));
beforeEach(()=>{
 jest.resetAllMocks();
 vars.slice(0,8).forEach(k=>process.env[k]='fictional-only');
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59540/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r53-test/vault';
 adm.mockResolvedValue(admission);
 sql.mockResolvedValue({rows:[{generation:1}]});
 open.mockResolvedValue(before);
 prepare.mockResolvedValue({
  kind:'fictional_durable_approval_prepared',opaqueToken:TOKEN,
  expiresAtMs:1792164120000,releaseApproved:false,
  sectionId:S1,alternativeId:A,generation:1,
  originalPassage:'lantern glows',proposedPassage:'lantern shimmers',
 });
 apply.mockResolvedValue({
  kind:'fictional_durably_claimed_encrypted_apply',
  generation:2,action:'apply',checkpointCount:0,
  replayed:false,durableClaimSpent:true,releaseApproved:false,
 });
 undoPrepare.mockResolvedValue({
  kind:'fictional_durable_undo_prepared',
  appliedGeneration:2,restoresGeneration:1,approvalToken:UNDO,
  releaseApproved:false,
 });
 undo.mockResolvedValue({
  kind:'fictional_durable_undo_confirmed',generation:3,
  checkpointCount:1,durableClaimSpent:true,releaseApproved:false,
 });
});
afterAll(()=>{
 for(const k of vars){
  if(original[k]===undefined)delete process.env[k];
  else process.env[k]=original[k];
 }
});
describe('R53 exact canonical author-action handoff, fixture-only',()=>{
 it('cannot activate in production, including env var alone',async()=>{
  expect(R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED).toBe(false);
  delete process.env.R53_CANONICAL_AUTHOR_FIXTURE;
  const r=await new HeldCanonicalAuthorJourneyR53().review(ctx(reviewBody()));
  expect(r).toMatchObject({kind:'refused',reason:'disabled'});
  expect(adm).not.toHaveBeenCalled();
  expect(open).not.toHaveBeenCalled();
 });
 it('refuses unmarked PostgreSQL or vault before any auth/prose read',async()=>{
  process.env.DATABASE_URL='postgresql://fict@remote/r35_draft';
  const r=await new HeldCanonicalAuthorJourneyR53().review(ctx(reviewBody()));
  expect(r).toMatchObject({kind:'refused',reason:'disabled'});
  expect(adm).not.toHaveBeenCalled();
 });
 it('R41 exact SECOND occurrence becomes R43 verified preview and R46 SQL intent',async()=>{
  const held=selected();
  expect(held).not.toBeNull();
  expect(held!.start).toBe(
   Array.from(C1.slice(0,C1.lastIndexOf('lantern glows'))).length);
  const r=await new HeldCanonicalAuthorJourneyR53().review(ctx(reviewBody()));
  expect(r).toMatchObject({
   kind:'fictional_author_review',
   reviewToken:TOKEN,originalPassage:'lantern glows',
   proposedPassage:'lantern shimmers',generation:1,
   canAutoApply:false,releaseApproved:false,
  });
  expect(open).toHaveBeenCalledWith({
   subject:{memberId:MEMBER,assertedBy:'server_verified_member_session'},
   workId:WORK,custody,generation:1,
  });
  expect(prepare).toHaveBeenCalledWith(expect.objectContaining({
   selection:{expectedWorkSHA256:sha(C1+C2),
    section:expect.objectContaining({
     sectionId:S1,expectedGeneration:1,chosenAlternativeId:A,
     expectedDraftSHA256:sha(C1),
     anchor:expect.objectContaining({start:held!.start,
      end:held!.end,selectedText:'lantern glows'}),
    })},
  }));
  expect(apply).not.toHaveBeenCalled();
 });
 it('browser may not submit member ID, private proposal or replacement prose',async()=>{
  const prototype=new HeldCanonicalAuthorJourneyR53();
  for(const value of [
   {...reviewBody(),memberId:FOREIGN},
   {...reviewBody(),replacement:'malicious forged editing'},
   {...reviewBody(),workId:WORK},
   {...reviewBody(),selected:{...selected(),text:'forged excerpt'}},
   {...reviewBody(),chosenAlternativeId:FOREIGN},
  ]){
   const r=await prototype.review(ctx(value));
   expect(r.kind).toBe('refused');
  }
  expect(prepare).not.toHaveBeenCalled();
 });
 it('not-current Work generation refuses before approval intent',async()=>{
  sql.mockResolvedValue({rows:[{generation:2}]});
  const r=await new HeldCanonicalAuthorJourneyR53().review(ctx(reviewBody()));
  expect(r).toMatchObject({kind:'refused',reason:'protected_work_moved'});
  expect(open).not.toHaveBeenCalled();expect(prepare).not.toHaveBeenCalled();
 });
 it('no current session/consent refuses before decrypting protected Work',async()=>{
  adm.mockResolvedValue(null);
  const r=await new HeldCanonicalAuthorJourneyR53().review(ctx(reviewBody()));
  expect(r).toMatchObject({kind:'refused',
   reason:'missing_session_or_consent'});
  expect(open).not.toHaveBeenCalled();
 });
 it('stale or foreign section/Work and shifted body refuse',async()=>{
  const bridge=new HeldCanonicalAuthorJourneyR53();
  expect((await bridge.review(ctx(reviewBody(),FOREIGN))).kind).toBe('refused');
  open.mockResolvedValueOnce({...before,sections:[{
   id:S1,text:C1.replace('First','Earlier')},{id:S2,text:C2}],
   content:C1.replace('First','Earlier')+C2});
  expect((await bridge.review(ctx(reviewBody()))).kind).toBe('refused');
 });

 it('Apply consumes exactly one token, calls R46 once, returns no manuscript text',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  const review=await h.review(ctx(reviewBody()));
  expect(review.kind).toBe('fictional_author_review');
  const action={kind:'apply_reviewed_change',opaqueToken:TOKEN};
  const done=await h.apply(ctx(action));
  expect(done).toMatchObject({kind:'fictional_author_apply_saved',
   generation:2,durableClaimSpent:true,canAutoRetry:false,
   releaseApproved:false});
  expect(apply).toHaveBeenCalledTimes(1);
  const secretSelection=apply.mock.calls[0][0].selection.section;
  expect(secretSelection.currentText).toBe(C1);
  expect(secretSelection.alternatives[0].wording).toBe('lantern shimmers');
  expect(await h.apply(ctx(action))).toMatchObject({
   kind:'refused',reason:'absent_or_spent_approval'});
  expect(apply).toHaveBeenCalledTimes(1);
  const response=JSON.stringify(done);
  expect(response).not.toContain(C1);
  expect(response).not.toContain(TOKEN);
  expect(response).not.toContain(MEMBER);
 });
 it('a revised server proposal cannot silently replace an already-reviewed choice',async()=>{
  const privateOptions=proposals.map(v=>({...v}));
  const h=new HeldCanonicalAuthorJourneyR53();
  const source=ctx(reviewBody());
  const reviewed=await h.review({...source,alternatives:privateOptions});
  expect(reviewed.kind).toBe('fictional_author_review');
  privateOptions[0].wording='a changed unapproved replacement';
  const acted=await h.apply({
   ...ctx({kind:'apply_reviewed_change',opaqueToken:TOKEN}),
   alternatives:privateOptions,
  });
  expect(acted.kind).toBe('fictional_author_apply_saved');
  expect(apply.mock.calls[0][0].selection.section.alternatives[0].wording)
   .toBe('lantern shimmers');
 });
 it('a fresh application process without private review fails closed',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  await h.review(ctx(reviewBody()));
  const afterRestart=new HeldCanonicalAuthorJourneyR53();
  expect(await afterRestart.apply(ctx({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  }))).toMatchObject({kind:'refused',reason:'absent_or_spent_approval'});
  expect(apply).not.toHaveBeenCalled();
 });
 it('foreign author cannot consume another reviewer token',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  await h.review(ctx(reviewBody()));
  adm.mockResolvedValueOnce({...admission,memberId:FOREIGN});
  expect(await h.apply(ctx({kind:'apply_reviewed_change',
   opaqueToken:TOKEN}))).toMatchObject({
    kind:'refused',reason:'scope_or_expiry_changed'});
  expect(apply).not.toHaveBeenCalled();
 });
 it('Apply refuses injected key, section, alternate or fake confirmation',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  await h.review(ctx(reviewBody()));
  for(const field of [
   {sectionId:S1},{replacement:'author did not choose this'},
   {memberId:MEMBER},{authorConfirmed:true},{undo:true},
  ]){
   const r=await h.apply(ctx({
    kind:'apply_reviewed_change',opaqueToken:TOKEN,...field,
   }));
   expect(r).toMatchObject({kind:'refused',reason:'untrusted_request'});
  }
  expect(apply).not.toHaveBeenCalled();
 });
 it('signed refusal is not confused with saved editing and cannot be retried',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  await h.review(ctx(reviewBody()));
  apply.mockResolvedValueOnce({kind:'refused',status:403,
   reason:'consent_revoked',releaseApproved:false});
  const b={kind:'apply_reviewed_change',opaqueToken:TOKEN};
  expect(await h.apply(ctx(b))).toMatchObject({
   kind:'refused',reason:'spent_write_unresolved'});
  expect(await h.apply(ctx(b))).toMatchObject({
   kind:'refused',reason:'absent_or_spent_approval'});
  expect(apply).toHaveBeenCalledTimes(1);
 });
 it('review for Undo is separate and author explicitly initiates it',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  await h.review(ctx(reviewBody()));
  expect(undoPrepare).not.toHaveBeenCalled();
  expect(await h.reviewUndo(ctx({
   kind:'review_last_apply_for_undo',
  }))).toMatchObject({kind:'fictional_author_undo_review',
   undoToken:UNDO,appliedGeneration:2,restoresGeneration:1,
   canAutoUndo:false,releaseApproved:false});
  expect(undoPrepare).toHaveBeenCalledTimes(1);
  expect(undo).not.toHaveBeenCalled();
 });
 it('Undo needs a distinct token and never accepts the prior Apply token',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  expect(await h.undo(ctx({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  }))).toMatchObject({kind:'refused',reason:'untrusted_request'});
  const r=await h.undo(ctx({kind:'undo_reviewed_change',
   opaqueToken:UNDO}));
  expect(r).toMatchObject({kind:'fictional_author_undo_saved',
   generation:3,durableClaimSpent:true,canAutoRetry:false,
   releaseApproved:false});
  expect(undo).toHaveBeenCalledTimes(1);
 });
 it('consent withdrawal during Undo cannot show a successful restoration',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  undo.mockResolvedValueOnce({kind:'refused',status:403,
   reason:'revoked',releaseApproved:false});
  expect(await h.undo(ctx({kind:'undo_reviewed_change',
   opaqueToken:UNDO}))).toMatchObject({kind:'refused',
   reason:'undo_unavailable'});
 });
 it('untrusted origin, bad method or missing exact action fields are refused',async()=>{
  const h=new HeldCanonicalAuthorJourneyR53();
  const candidates=[
   ctx(reviewBody(),WORK,'https://attacker.invalid'),
   ctx({...reviewBody(),selected:null}),
   ctx({kind:'review_exact_passage',sectionId:S1}),
   ctx({kind:'review_exact_passage',sectionId:S1,
     chosenAlternativeId:A,expectedGeneration:1,selected:{
      start:2,end:3,text:'wrong'}}),
  ];
  for(const item of candidates){
   const r=await h.review(item);
   expect(r.kind).toBe('refused');
  }
  expect(prepare).not.toHaveBeenCalled();
 });
 it('no production Next route or PC3 controller imports R53',()=>{
  const root=process.cwd();
  const crawl=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true})
   .flatMap(f=>{
    const p=path.join(dir,f.name);
    return f.isDirectory()?crawl(p):
      f.isFile()&&/^route\\.(ts|tsx)$/.test(f.name)?[p]:[];
   });
  const live=crawl(path.join(root,'app/api')).filter(f=>
    /heldCanonicalAuthorJourneyR53|HeldCanonicalAuthorJourneyR53/
      .test(readFileSync(f,'utf8')));
  expect(live).toEqual([]);
  const controller=readFileSync(path.join(root,
    'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),'utf8');
  expect(controller).not.toContain('heldCanonicalAuthorJourneyR53');
  const source=readFileSync(path.join(root,
    'lib/writersStudio/recovery/heldCanonicalAuthorJourneyR53.ts'),'utf8');
  expect(source).toContain('R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED=false');
  expect(source).not.toContain('retireWorkKey(');
  expect(source).not.toContain('DELETE FROM');
 });

});
