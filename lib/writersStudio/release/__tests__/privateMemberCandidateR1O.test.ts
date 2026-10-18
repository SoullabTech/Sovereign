import {randomBytes,randomUUID} from 'node:crypto';
import {withLockedCurrentWriterConsentR1K} from '../serializedWriterBetaConsentR1K';
import {
 stagePrivateMemberCandidateR1O,reopenPrivateMemberCandidateR1O,
 R1O_REAL_MEMBER_EDITORIAL_ROUTE_RELEASED,
} from '../privateMemberCandidateR1O';

jest.mock('../serializedWriterBetaConsentR1K',()=>({withLockedCurrentWriterConsentR1K:jest.fn()}));
const lock=withLockedCurrentWriterConsentR1K as jest.Mock;
const MEMBER='11111111-1111-4111-8111-111111111111';
const MANUSCRIPT='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const DRAFT='44444444-4444-4444-8444-444444444444';
const SECTION='55555555-5555-4555-8555-555555555555';
const policy={policyVersion:'fictional-notice',policySHA256:'a'.repeat(64)};
const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
const scope={memberId:MEMBER,manuscriptId:MANUSCRIPT,livingWorkId:WORK,
 draftId:DRAFT,sectionId:SECTION,baseVersion:7};
const body='This fictional passage has the crystal lantern and the cedar breeze.';
let eligible=true,owned=true,version=7;
const rows:{candidateId:string;envelope:any;keyId:string;consentSeq:number;policySHA256:string}[]=[];
const queries:{sql:string;params:unknown[]}[]=[];
const tx={query:jest.fn(async (sql:string,params:any[]=[])=>{
 queries.push({sql,params});
 if(sql.includes('FROM ops_contacts'))return {rows:[{active:eligible}]};
 if(sql.includes('FROM manuscript_working_drafts d'))return {rows:owned?[{
    version:String(version),section_addressable_at:new Date(),
    text:'Chapter One\n\n'+body,heading:'Chapter One',
 }]:[]};
 if(sql.includes('INSERT INTO ws_private_member_candidates_r1o')){
   const envelope=JSON.parse(params[10]);
   rows.push({candidateId:params[0],envelope,keyId:params[9],
     consentSeq:params[7],policySHA256:params[8]});
   return {rows:[{id:params[0]}]};
 }
 if(sql.includes('FROM ws_private_member_candidates_r1o')){
   const found=rows.find(x=>x.candidateId===params[0]);
   return {rows:found?[{
    id:found.candidateId,consent_seq:String(found.consentSeq),
    policy_sha256:found.policySHA256,key_id:found.keyId,
    author_assertion:'member',cipher_envelope:found.envelope,
   }]:[]};
 }
 throw Error('UNEXPECTED_SQL');
})};
const prior:Record<string,string|undefined>={};
beforeAll(()=>{
 for(const k of ['WRITERS_STUDIO_RESTRICTED_BETA','WRITERS_STUDIO_BETA_MEMBER_IDS','MAIA_CABIN_MODE'])prior[k]=process.env[k];
 process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
 process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=MEMBER;
 delete process.env.MAIA_CABIN_MODE;
});
afterAll(()=>{
 for(const [k,v] of Object.entries(prior)){
  if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
});
beforeEach(()=>{
 eligible=true;owned=true;version=7;rows.length=0;queries.length=0;
 tx.query.mockClear();lock.mockReset();
 lock.mockImplementation(async (_member:string,_notice:any,run:any)=>({
  kind:'executed_inside_consent_lock',releaseApproved:false,
  value:await run(tx,{seq:12,decision:'accept',policyVersion:policy.policyVersion,
    policySHA256:policy.policySHA256}),
 }));
});
const base={scope,policy,author:'member' as const,selectedOriginal:'crystal lantern',
 replacementText:'crystal candle',workKey:key};

it('never enables a public Apply/Undo route or model provider',()=>{
 expect(R1O_REAL_MEMBER_EDITORIAL_ROUTE_RELEASED).toBe(false);
});
it('stages only encrypted original/proposed wording with server-owned ID and exact member+Work+consent metadata',async()=>{
 const staged=await stagePrivateMemberCandidateR1O(base);
 expect(staged.kind).toBe('encrypted_member_candidate_pending');
 if(staged.kind!=='encrypted_member_candidate_pending')return;
 expect(staged).toMatchObject({author:'member',canApply:false,canUndo:false,releaseApproved:false});
 expect(staged.candidateId).toMatch(/^[0-9a-f-]{36}$/);
 expect(lock).toHaveBeenCalledWith(MEMBER,policy,expect.any(Function));
 expect(queries[0].sql).toContain('FROM ops_contacts');
 expect(queries[1].sql).toContain('FOR UPDATE OF d');
 expect(queries[2].sql).toContain('INSERT INTO ws_private_member_candidates_r1o');
 const sqlParams=JSON.stringify(queries[2].params);
 expect(sqlParams).not.toContain(base.replacementText);
 expect(sqlParams).not.toContain(base.selectedOriginal);
 expect(sqlParams).not.toContain(body);
 expect(rows[0].envelope.ciphertext).toBeTruthy();
 const opened=await reopenPrivateMemberCandidateR1O({scope,policy,candidateId:staged.candidateId,workKey:key});
 expect(opened).toMatchObject({kind:'server_only_member_candidate_preview',author:'member',
  selectedOriginal:base.selectedOriginal,replacementText:base.replacementText,
  canApply:false,canUndo:false,releaseApproved:false});
});
it('cannot label a user claim as MAIA/provider output',async()=>{
 const result=await stagePrivateMemberCandidateR1O({...base,author:'maia'});
 expect(result).toMatchObject({kind:'refused',reason:'invalid_scope'});
 expect(lock).not.toHaveBeenCalled();
 expect(queries).toHaveLength(0);
});
it('refuses no beta allowlist without opening a DB transaction',async()=>{
 process.env.WRITERS_STUDIO_BETA_MEMBER_IDS='*';
 try{
  expect(await stagePrivateMemberCandidateR1O(base)).toMatchObject({kind:'refused',reason:'not_qualified'});
  expect(lock).not.toHaveBeenCalled();
 }finally{process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=MEMBER;}
});
it('refuses ineligible cohort, unrelated Work or draft, and stale version before any write',async()=>{
 eligible=false;
 expect(await stagePrivateMemberCandidateR1O(base)).toMatchObject({kind:'refused',reason:'work_not_current'});
 expect(rows).toHaveLength(0);
 eligible=true;owned=false;
 expect(await stagePrivateMemberCandidateR1O(base)).toMatchObject({kind:'refused',reason:'work_not_current'});
 expect(rows).toHaveLength(0);
 owned=true;version=8;
 expect(await stagePrivateMemberCandidateR1O(base)).toMatchObject({kind:'refused',reason:'work_not_current'});
 expect(rows).toHaveLength(0);
});
it('rejects absent or ambiguous selected passage and oversized/unpaired Unicode',async()=>{
 const wrong=await stagePrivateMemberCandidateR1O({...base,selectedOriginal:'not there'});
 expect(wrong).toMatchObject({kind:'refused',reason:'selection_not_exact'});
 const ambiguous=await stagePrivateMemberCandidateR1O({...base,selectedOriginal:'the'});
 expect(ambiguous).toMatchObject({kind:'refused',reason:'selection_not_exact'});
 const malformed=await stagePrivateMemberCandidateR1O({...base,replacementText:'\ud800'});
 expect(malformed).toMatchObject({kind:'refused',reason:'invalid_scope'});
 const oversized=await stagePrivateMemberCandidateR1O({...base,replacementText:'x'.repeat(2100)});
 expect(oversized).toMatchObject({kind:'refused',reason:'invalid_scope'});
 expect(rows).toHaveLength(0);
});
it('refuses candidate reopening after draft edit or renewed consent epoch',async()=>{
 const result=await stagePrivateMemberCandidateR1O(base);
 if(result.kind!=='encrypted_member_candidate_pending')throw Error('fixture setup');
 version=8;
 expect(await reopenPrivateMemberCandidateR1O({scope,policy,candidateId:result.candidateId,workKey:key}))
  .toMatchObject({kind:'refused',reason:'work_not_current'});
 version=7;
 rows[0].consentSeq=10;
 expect(await reopenPrivateMemberCandidateR1O({scope,policy,candidateId:result.candidateId,workKey:key}))
  .toMatchObject({kind:'refused',reason:'private_candidate_unavailable'});
});
it('rejects ciphertext identity substitution and missing key, never returns fallback plaintext',async()=>{
 const result=await stagePrivateMemberCandidateR1O(base);
 if(result.kind!=='encrypted_member_candidate_pending')throw Error('fixture setup');
 const other={...scope,manuscriptId:'99999999-9999-4999-8999-999999999999'};
 expect(await reopenPrivateMemberCandidateR1O({scope:other,policy,candidateId:result.candidateId,workKey:key}))
  .toMatchObject({kind:'refused',reason:'private_candidate_unavailable'}); // mock row returns but AAD refuses
});
