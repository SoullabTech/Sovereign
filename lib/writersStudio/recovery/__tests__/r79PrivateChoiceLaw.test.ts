import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {TransactionClient} from '@/lib/db/postgres';
import {enabledR79,ownsR79SealedChoice,
 resolveR79CurrentPrivateChoice,R79_REAL_AUTHOR_ADMISSION_ENABLED}
 from '../r79PrivateChoice';
const writableEnv=process.env as unknown as Record<string,string|undefined>;
const m='11111111-1111-4111-8111-111111111111';
const work='22222222-2222-4222-8222-222222222222';
const draft='33333333-3333-4333-8333-333333333333';
const section='44444444-4444-4444-8444-444444444444';
const pending='55555555-5555-4555-8555-555555555555';
const sha=(text:string)=>createHash('sha256').update(text).digest('hex');
const fake={
 memberId:m,manuscriptId:work,draftId:draft,sectionId:section,
 pendingId:pending,baseVersion:5,
 passage:{start:20,end:36,text:'fictional lantern'},
};
const metadata={
 pending_version_id:pending,member_id:m,manuscript_id:work,
 draft_id:draft,section_id:section,base_version:'5',
 passage_start:20,passage_end:36,
 passage_sha256:sha('fictional lantern'),
 section_body_sha256:sha('The river remembers the fictional lantern.'),
 consent_sequence:'1',
 policy_sha256:sha('fake-policy'),instruction_contract_sha256:sha('fake-editor-contract'),
};
const flags=[
 'NODE_ENV','DATABASE_URL','R79_PRIVATE_AUTHOR_FIXTURE',
 'NEXT_PUBLIC_R79_PRIVATE_AUTHOR_FIXTURE',
 'R71_AUTHOR_EDITORIAL_FIXTURE','R72_MEMBER_PROPOSALS_FIXTURE',
 'R76_PENDING_CANDIDATE_FIXTURE','R77P_LOCAL_REVIEW_FIXTURE',
 'R77P_KEYS_ORIGIN',
] as const;
let original:Record<string,string|undefined>={};
beforeEach(()=>{
 original=Object.fromEntries(flags.map(x=>[x,writableEnv[x]]));
 writableEnv.NODE_ENV='development';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:44321/ws_atomic';
 for(const x of flags.slice(2))writableEnv[x]=
  x==='R77P_KEYS_ORIGIN'?'synthetic-generated-test-only':'fictional-only';
});
afterEach(()=>{
 for(const x of flags){
  if(original[x]===undefined)delete writableEnv[x];
  else writableEnv[x]=original[x];
 }
});
const fakeTx=(rows:unknown[][])=>{
 const calls:{statement:string;params:unknown[]}[]=[];
 const tx={query:jest.fn(async(statement:string,params:unknown[])=>{
  calls.push({statement,params});
  return {rows:rows.shift()??[]};
 })} as unknown as TransactionClient;
 return {tx,calls};
};
describe('R79 exact sealed author-choice scope law',()=>{
 it('remains default-off for real production even if a feature flag is flipped',()=>{
  expect(R79_REAL_AUTHOR_ADMISSION_ENABLED).toBe(false);
  expect(enabledR79()).toBe(true);
  process.env.DATABASE_URL='postgresql://prod@some-host/prod';
  expect(enabledR79()).toBe(false);
  process.env.DATABASE_URL='postgresql://fict@127.0.0.1:44321/ws_atomic';
  delete process.env.R77P_KEYS_ORIGIN;
  expect(enabledR79()).toBe(false);
  process.env.R77P_KEYS_ORIGIN='synthetic-generated-test-only';
  writableEnv.NODE_ENV='production';
  expect(enabledR79()).toBe(false);
 });
 it('uses only immutable pending ID and session-derived owner to detect an existing choice',async()=>{
  const {tx,calls}=fakeTx([[{pending_version_id:pending}]]);
  expect(await ownsR79SealedChoice(tx,m,pending)).toBe(true);
  expect(calls).toHaveLength(1);
  expect(calls[0].params).toEqual([pending,m]);
  expect(calls[0].statement).toContain('member_id=$2');
  expect(calls[0].statement).not.toContain('cipher_envelope');
 });
 it('rejects wrong exact position BEFORE reading section or ciphertext',async()=>{
  const {tx,calls}=fakeTx([[metadata]]);
  await expect(resolveR79CurrentPrivateChoice(tx,{
   ...fake,passage:{start:19,end:35,text:'fictional lantern'},
  })).rejects.toMatchObject({reason:'selected_words_not_same'});
  expect(calls).toHaveLength(1);
  expect(calls[0].statement).not.toContain('cipher_envelope');
 });
 it('rejects different text for the same codepoint window before opening cipher',async()=>{
  const {tx,calls}=fakeTx([[metadata]]);
  await expect(resolveR79CurrentPrivateChoice(tx,{
   ...fake,passage:{...fake.passage,text:'fictional candle'},
  })).rejects.toMatchObject({reason:'selected_words_not_same'});
  expect(calls).toHaveLength(1);
 });
 it('refuses a verified exact span if the section body moved after binding',async()=>{
  const {tx,calls}=fakeTx([[metadata],[{
   id:section,text:'Something else entirely.',
   heading:null,
  }]]);
  await expect(resolveR79CurrentPrivateChoice(tx,fake))
   .rejects.toMatchObject({reason:'section_or_exact_passage_changed'});
  expect(calls).toHaveLength(2);
  expect(calls.every(x=>!x.statement.includes('cipher_envelope'))).toBe(true);
 });
 it('denies another member before any prose or cipher is queried',async()=>{
  const {tx,calls}=fakeTx([[]]);
  await expect(resolveR79CurrentPrivateChoice(tx,{
   ...fake,memberId:'66666666-6666-4666-8666-666666666666',
  })).rejects.toMatchObject({reason:'pending_locus_not_owned'});
  expect(calls).toHaveLength(1);
  expect(calls[0].statement).toContain('b.member_id=$2');
 });
 it('enforces the actual R71 one-use flow; never creates plaintext MAIA versions',()=>{
  const route=readFileSync(join(process.cwd(),
   'lib/writersStudio/recovery/r71FictionalCanonicalEditorial.ts'),'utf8');
  const privateCode=readFileSync(join(process.cwd(),
   'lib/writersStudio/provenance/heldConfidentialCandidateR76.ts'),'utf8');
  const ddl=readFileSync(join(process.cwd(),
   'scripts/ops/fixtures/wsR79PrivatePassageBinding.sql'),'utf8');
  expect(route).toContain('resolveR79CurrentPrivateChoice');
  expect(route).toContain('saveSectionInTransaction');
  expect(route).toContain('exactApproval(tx,token,memberId');
  expect(privateCode).toContain('openPendingR76InTransaction');
  expect(ddl).not.toMatch(/\b(text|formulation|proposed_text|replacement)\s+text\b/i);
  expect(ddl).toContain('BEFORE INSERT OR UPDATE OR DELETE');
  expect(ddl).toContain('R79 pending proposal is not bound');
 });
});
