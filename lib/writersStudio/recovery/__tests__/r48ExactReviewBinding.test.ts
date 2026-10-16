/**
 * R48 full-review HMAC agreement uses actual R44 prepare/verify code, not a
 * mocked digest. No physical database, member, vault, model or real grant.
 */
import {createHash} from 'node:crypto';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(async()=>({rows:[{token_hmac:'f'.repeat(64)}]})),
 transaction:jest.fn(()=>{throw Error('r48_unit_db_write_disabled');}),
}));
import {query} from '@/lib/db/postgres';
import {
 prepareHeldAuthorApprovalR44,verifyHeldReviewBindingR44,
 R44_REAL_AUTHOR_APPROVAL_ENABLED,
} from '../heldDurableAuthorApprovalR44';
const fakeQuery=query as jest.Mock;
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const CHOICE='66666666-6666-4666-8666-666666666666';
const OTHER='77777777-7777-4777-8777-777777777777';
const ONE='🍂 A fictional lantern glows twice; another lantern glows.\n\n';
const TWO='Another invented section survives.';
const TEXT='lantern glows';
const sha=(x:string)=>createHash('sha256').update(x,'utf8').digest('hex');
const start=Array.from(ONE.slice(0,ONE.lastIndexOf(TEXT))).length;
const admission={
 memberId:MEMBER,sessionBindingSHA256:'a'.repeat(64),
 consentNoticeSHA256:'b'.repeat(64),consentEventSequence:11,
 activeWriter:true as const,
};
const snapshot={
 workId:WORK,generation:1,checkpointCount:0,kind:'sections' as const,
 sections:[{id:S1,text:ONE},{id:S2,text:TWO}],content:ONE+TWO,
 action:'start' as const,note:null,restoredFrom:null,
};
const reviewed={
 expectedWorkSHA256:sha(snapshot.content),section:{
  sectionId:S1,currentText:ONE,expectedGeneration:1,
  expectedDraftSHA256:sha(ONE),
  anchor:{sectionId:S1,start,end:start+Array.from(TEXT).length,
   selectedText:TEXT,sectionSHA256:sha(ONE)},
  alternatives:[
   {id:CHOICE,origin:'maia' as const,wording:'lantern shimmers'},
   {id:OTHER,origin:'member' as const,wording:'lantern glistens'},
  ],chosenAlternativeId:CHOICE,
 },
};
const flags=[
 'R44_DURABLE_APPROVAL_FIXTURE','R45_DURABLE_SIGNED_AUTHOR_FIXTURE',
 'R46_DURABLE_SIGNED_APPLY_FIXTURE','R37_SECTION_PASSAGE_FIXTURE',
 'R36_PASSAGE_REVIEW_FIXTURE','DATABASE_URL','FILE_STORAGE_PATH',
] as const;
const orig=Object.fromEntries(flags.map(k=>[k,process.env[k]]));
const input=()=>({
 admission,workId:WORK,currentView:snapshot,selection:reviewed,
 nowMs:1792164000000,issuerSecret:Buffer.alloc(32,0x46),
});
beforeEach(()=>{
 fakeQuery.mockClear();
 for(const k of flags.slice(0,5))process.env[k]='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59111/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r48unit/vault';
});
afterAll(()=>{
 for(const k of flags){
  if(orig[k]===undefined)delete process.env[k];else process.env[k]=orig[k];
 }
});
describe('R48 recompute EXACT R44 complete choice/consent binding, read-only',()=>{
 it('stays held, and its full-review HMAC is the SAME digest stored by R44',async()=>{
  expect(R44_REAL_AUTHOR_APPROVAL_ENABLED).toBe(false);
  const result=await prepareHeldAuthorApprovalR44(input());
  expect(result).toMatchObject({kind:'HELD_DURABLE_REVIEW_PREPARED',
   releaseApproved:false});
  expect(fakeQuery).toHaveBeenCalledTimes(1);
  const statement=String(fakeQuery.mock.calls[0][0]);
  expect(statement).toContain('INSERT INTO writers_studio_r44_held_approval');
  const values=fakeQuery.mock.calls[0][1] as string[];
  const exact=values[9];
  expect(exact).toMatch(/^[a-f0-9]{64}$/);
  expect(verifyHeldReviewBindingR44(input(),exact)).toBe(true);
  expect(JSON.stringify(values)).not.toContain(ONE);
  expect(JSON.stringify(values)).not.toContain('lantern shimmers');
 });
 it('unchosen option wording and rationale changes invalidate old approval',async()=>{
  await prepareHeldAuthorApprovalR44(input());
  const oldHash=(fakeQuery.mock.calls[0][1] as string[])[9];
  const changed={...reviewed,section:{...reviewed.section,alternatives:[
    reviewed.section.alternatives[0],
    {...reviewed.section.alternatives[1],wording:'a substituted other choice'},
  ]}};
  expect(verifyHeldReviewBindingR44({
   ...input(),selection:changed,
  },oldHash)).toBe(false);
  const rationale={...reviewed,section:{...reviewed.section,alternatives:[
    {...reviewed.section.alternatives[0],rationale:'A fictional reason'},
    reviewed.section.alternatives[1],
  ]}};
  expect(verifyHeldReviewBindingR44({
   ...input(),selection:rationale,
  },oldHash)).toBe(false);
 });
 it('session, consent, Work and approval-root substitution cannot match',async()=>{
  await prepareHeldAuthorApprovalR44(input());
  const expected=(fakeQuery.mock.calls[0][1] as string[])[9];
  for(const changed of [
    {...input(),admission:{...admission,sessionBindingSHA256:'c'.repeat(64)}},
    {...input(),admission:{...admission,consentEventSequence:12}},
    {...input(),issuerSecret:Buffer.alloc(32,0x47)},
  ]){
   expect(verifyHeldReviewBindingR44(changed,expected)).toBe(false);
  }
  expect(verifyHeldReviewBindingR44(input(),'f'.repeat(64))).toBe(false);
 });
});
