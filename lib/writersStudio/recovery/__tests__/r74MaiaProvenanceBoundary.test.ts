import {gradeR74ActualModelProvenance,lookupR74MaiaProvenance}
 from '../r74MaiaProvenanceBoundary';
import type {TransactionClient} from '@/lib/db/postgres';
import {resolveR72MemberVersion} from '../r72MemberProposalConsent';

const member='11111111-1111-4111-8111-111111111111';
const manuscript='22222222-2222-4222-8222-222222222222';
const version='33333333-3333-4333-8333-333333333333';
const thread='44444444-4444-4444-8444-444444444444';
const provenance={
 provider:'anthropic',model:'claude-opus-5',reportedModel:'claude-opus-5',
 modelAgreement:'agreed',runtime:'ws-editorial-runtime-01/er-r4',
 latencyMs:21,usage:{inputTokens:200,outputTokens:45},
};
const row={
 version_id:version,author:'maia',speaker:'maia',act_author:'maia',
 thread_id:thread,turn_index:5,answer_provenance:provenance,
};
const run=async(rows:unknown[])=>{
 const seen:{sql:string;args:unknown[]}[]=[];
 const tx={query:jest.fn(async(sql:string,args:unknown[])=>{
  seen.push({sql,args});return {rows,rowCount:rows.length};
 })} as unknown as TransactionClient;
 const outcome=await lookupR74MaiaProvenance(tx,{
  memberId:member,manuscriptId:manuscript,versionId:version,
 });
 return {outcome,seen};
};
describe('R74 MAIA provenance: read-only structural admission, never writer Apply permission',()=>{
 it('requires an actual provider-reported model matching the requested model',()=>{
  expect(gradeR74ActualModelProvenance(provenance)).toEqual({
   ok:true,provider:'anthropic',reportedModel:'claude-opus-5'});
  expect(gradeR74ActualModelProvenance({...provenance,
   reportedModel:'different-model'})).toEqual({
   ok:false,reason:'provider_model_unattributable'});
  expect(gradeR74ActualModelProvenance({...provenance,
   modelAgreement:'differs'}).ok).toBe(false);
  expect(gradeR74ActualModelProvenance({...provenance,
   reportedModel:null}).ok).toBe(false);
 });
 it('refuses absent, placeholder or externally invented model/provenance',()=>{
  for(const x of [null,{},[],
   {...provenance,provider:'x'},
   {...provenance,model:'unknown-model',reportedModel:'unknown-model'},
   {...provenance,modelAgreement:'unreported'},
   {...provenance,model:'x\nunauthorized',reportedModel:'x\nunauthorized'}]){
   expect(gradeR74ActualModelProvenance(x).ok).toBe(false);
  }
 });
 it('accepts only the existing ER-R4 persisted turn runtime, not a client attribution label',()=>{
  expect(gradeR74ActualModelProvenance({...provenance,
   runtime:'client-supplied'})).toEqual({
   ok:false,reason:'editorial_runtime_unproven'});
  expect(gradeR74ActualModelProvenance({...provenance,
   runtime:undefined}).ok).toBe(false);
 });
 it('reads the durable exact MAIA turn/version binding with owner/Work scoping',async()=>{
  const {outcome,seen}=await run([row]);
  expect(outcome).toEqual({
   kind:'structurally_attributed',provider:'anthropic',
   reportedModel:'claude-opus-5',threadId:thread,turnIndex:5,
   mayApply:false,releaseApproved:false,privateCustody:'unverified',
  });
  expect(seen).toHaveLength(1);
  expect(seen[0].args).toEqual([version,member,manuscript]);
  const sql=seen[0].sql;
  for(const required of ['JOIN editorial_turn_bindings','JOIN ask_threads',
   'JOIN ask_turns','b.version_id=v.id','a.member_id=c.member_id',
   'a.manuscript_id=c.work_id','t.speaker=\'maia\'',
   'c.member_id=$2','c.work_id=$3','v.author=\'maia\'']){
   expect(sql).toContain(required);
  }
  expect(sql).not.toContain(manuscript);
 });
 it('refuses missing or multiply bound editorial acts',async()=>{
  expect((await run([])).outcome).toMatchObject({
   kind:'refused',reason:'turn_binding_missing_or_not_owned',mayApply:false});
  expect((await run([row,row])).outcome).toMatchObject({
   kind:'refused',reason:'turn_binding_missing_or_not_owned',mayApply:false});
 });
 it('refuses a false speaker or false author despite a supplied provider claim',async()=>{
  for(const bad of [
   {...row,speaker:'author'},
   {...row,act_author:'member'},
   {...row,author:'member'},
   {...row,thread_id:'not-a-uuid'},
   {...row,turn_index:-1},
  ]){
   expect((await run([bad])).outcome).toMatchObject({
    kind:'refused',reason:'turn_not_maia',mayApply:false});
  }
 });
 it('refuses missing or mismatched provider agreement even on a linked MAIA turn',async()=>{
  for(const bad of [null,
   {...provenance,reportedModel:null},
   {...provenance,reportedModel:'surprise-provider-model'},
   {...provenance,modelAgreement:'differs'}]){
   expect((await run([{...row,answer_provenance:bad}])).outcome)
    .toMatchObject({kind:'refused',reason:'provider_model_unattributable'});
  }
 });
 it('rejects a turn which does not originate from the existing editorial runtime',async()=>{
  expect((await run([{...row,
   answer_provenance:{...provenance,runtime:'fake-run'}}])).outcome)
   .toMatchObject({kind:'refused',reason:'editorial_runtime_unproven'});
 });
 it('denies malformed account and Work identity before database I/O',async()=>{
  const query=jest.fn();
  const tx={query} as unknown as TransactionClient;
  const outcome=await lookupR74MaiaProvenance(tx,{
   memberId:'client-cookie-member',manuscriptId:manuscript,versionId:version,
  });
  expect(outcome).toMatchObject({kind:'refused',reason:'invalid_scope'});
  expect(query).not.toHaveBeenCalled();
 });
 it('the current R72 caller may not make structural provenance executable author permission',()=>{
  const fs=require('node:fs');
  const file=require('node:path').join(
   process.cwd(),'lib/writersStudio/recovery/r72MemberProposalConsent.ts');
  const source=fs.readFileSync(file,'utf8');
  expect(source).toContain('maia_confidential_proposal_unavailable');
  expect(source).toMatch(/trace\.kind==='structurally_attributed'/);
  expect(source).not.toMatch(/trace\.kind==='structurally_attributed'\s*\?\s*return\s+\{/);
 });
});

describe('R74 plaintext-read refusal in the real R72 resolver',()=>{
 const chain='55555555-5555-4555-8555-555555555555';
 const draft='66666666-6666-4666-8666-666666666666';
 const section='77777777-7777-4777-8777-777777777777';
 const scope={
  memberId:member,manuscriptId:manuscript,draftId:draft,
  sectionId:section,baseVersion:7,expectedText:'fictional lantern',
  versionId:version,
 };
 const metadata=(author:'member'|'maia')=>({
  id:version,chain_id:chain,author,member_id:member,
  work_id:manuscript,draft_id:draft,
  base_version:7,target_section_id:section,
  expected_text:'fictional lantern',
 });
 it('MAIA metadata without turn binding is refused before SELECT formulation',async()=>{
  const seen:string[]=[];
  const tx={query:jest.fn(async(sql:string)=>{
   seen.push(sql);return {rows:seen.length===1?[metadata('maia')]:[]};
  })} as unknown as TransactionClient;
  await expect(resolveR72MemberVersion(tx,scope)).rejects.toMatchObject({
   reason:'maia_producer_unverified',
  });
  expect(seen).toHaveLength(2);
  expect(seen.every(x=>!x.includes('SELECT formulation'))).toBe(true);
  expect(seen[0]).not.toContain('v.formulation');
 });
 it('even a structurally attributable MAIA turn cannot open plaintext wording',async()=>{
  const seen:string[]=[];
  const tx={query:jest.fn(async(sql:string)=>{
   seen.push(sql);
   return {rows:seen.length===1?[metadata('maia')]:[row]};
  })} as unknown as TransactionClient;
  await expect(resolveR72MemberVersion(tx,scope)).rejects.toMatchObject({
   reason:'maia_confidential_proposal_unavailable',
  });
  expect(seen).toHaveLength(2);
  expect(seen.every(x=>!x.includes('SELECT formulation'))).toBe(true);
  expect(seen[0]).not.toContain('v.formulation');
 });
 it('only member-owned and exact-scope proposals open their formulation afterward',async()=>{
  const seen:string[]=[];
  const tx={query:jest.fn(async(sql:string)=>{
   seen.push(sql);
   return {rows:seen.length===1?[metadata('member')]:[
    {formulation:'fictional author-crafted candle'}]};
  })} as unknown as TransactionClient;
  await expect(resolveR72MemberVersion(tx,scope)).resolves.toEqual({
   chainId:chain,formulation:'fictional author-crafted candle',
  });
  expect(seen).toHaveLength(2);
  expect(seen[0]).not.toContain('v.formulation');
  expect(seen[1]).toContain("author='member'");
 });
});
