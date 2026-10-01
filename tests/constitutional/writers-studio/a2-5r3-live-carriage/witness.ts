import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { spawn, type ChildProcess } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? '3427');
let pass=0, fail=0;
const check=(name:string,ok:boolean,detail='')=>{
  if(ok){pass++;console.log('PASS  '+name+(detail?' — '+detail:''));}
  else{fail++;console.log('FAIL  '+name+(detail?' — '+detail:''));}
};
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const cp=(s:string)=>[...s].length;

let pg:Client;
let next:ChildProcess|null=null;
let stub:Server|null=null;
let beforeRespond:(()=>Promise<void>)|null=null;
const q=async<T extends Record<string,unknown>=Record<string,unknown>>(sql:string,p:unknown[]=[])=>
  (await pg.query<T>(sql,p)).rows;
const one=async<T extends Record<string,unknown>=Record<string,unknown>>(sql:string,p:unknown[]=[]) =>
  (await q<T>(sql,p))[0];
function killNext(){
  try{if(next?.pid)process.kill(-next.pid,'SIGKILL');}catch{}
  try{next?.kill('SIGKILL');}catch{}
  next=null;
}

const toolReply=(model:string)=>({
  id:'msg_stub',type:'message',role:'assistant',model,
  content:[{type:'tool_use',id:'tu_1',name:'editorial_outcome',
    input:{kind:'reply_only',reply:'I would leave this exactly as it stands.'}}],
  stop_reason:'tool_use',usage:{input_tokens:11,output_tokens:7},
});
const textReply=(model:string)=>({
  id:'msg_stub',type:'message',role:'assistant',model,
  content:[{type:'text',text:'The earlier observation was about the recurrence in the verified historical material. I am staying with what was read then, not claiming anything about the manuscript now.'}],
  stop_reason:'end_turn',usage:{input_tokens:9,output_tokens:20},
});

interface WorkFixture{
  livingWorkId:string; manuscriptId:string; expressionId:string;
  sourceSectionId:string; draftId:string; draftSectionId:string;
  readingId?:string;
}

async function makeMember(label:string){
  const id=randomUUID();
  const token='a25r3-'+randomUUID();
  await q("INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x',$4)",
    [id,'A25R3-'+id.slice(0,8),'a25r3-'+id.slice(0,8),label]);
  await q("INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,now()+interval '2 hours')",
    [id,token]);
  return {id,token};
}
async function makeWork(memberId:string,label:string,withReading=false):Promise<WorkFixture>{
  const livingWorkId=randomUUID(), manuscriptId=randomUUID(), expressionId=randomUUID();
  const sourceSectionId=randomUUID(), draftId=randomUUID(), draftSectionId=randomUUID();
  const heading='Witness Chapter';
  const body='Nothing moved on the far bank. She waited for the sound to come back.';
  const text=heading+'\n\n'+body;

  await q("INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,$3)",
    [livingWorkId,memberId,label]);
  await q("INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)",
    [manuscriptId,memberId,label]);
  await q("INSERT INTO living_work_expressions (id,living_work_id,expression_type,expression_id,declared_by) VALUES ($1,$2,'manuscript',$3,$4)",
    [expressionId,livingWorkId,manuscriptId,memberId]);
  await q("INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,0,$3,1,'chapter',$4)",
    [sourceSectionId,manuscriptId,heading,body]);
  await q("INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at) VALUES ($1,$2,$3,$4,$5,1,41,NULL)",
    [draftId,manuscriptId,memberId,text,sha(text)]);
  await q("INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,0,$3,$4)",
    [draftSectionId,draftId,text,sourceSectionId]);
  await q("UPDATE manuscript_working_drafts SET section_addressable_at=now() WHERE id=$1",[draftId]);

  if(!withReading) return {livingWorkId,manuscriptId,expressionId,sourceSectionId,draftId,draftSectionId};
  const readingId=randomUUID();
  await q("INSERT INTO working_draft_revisions (draft_id,revision_number,content,saved_by,note,section_partition) VALUES ($1,1,$2,$3,'A2-5R3 witness',$4::jsonb)",
    [draftId,text,memberId,JSON.stringify([{sectionId:draftSectionId,start:0,end:cp(text)}])]);
  const readState={
    draftId,revisionNumber:1,revisionDigest:sha(text),sectionTopology:[draftSectionId],
    sections:{[draftSectionId]:{revisionNumber:1,range:{start:0,end:cp(text)},digest:sha(text)}},
    inputFingerprint:sha('a25r3:'+readingId),
  };
  const observation={
    key:'o1',observationId:'dobs_'+readingId,admissionIndex:0,
    basisFingerprint:sha('basis:'+readingId),position:{sectionPosition:0,codePointStart:0},
    lens:'continuity',phenomenon:'recurrence',
    evidenceRefs:[{kind:'section',sectionId:draftSectionId}],
    observation:'The far bank is where this passage keeps returning.',
    doesNotEstablish:['author-intent','editorial-consequence'],
    structureDependency:{kind:'independent'},
  };
  const scope={commissionedLens:'continuity',bodyScope:[draftSectionId],withStructure:false};
  const coverage={sections:{[draftSectionId]:'body'}};
  const reader={provider:'witness',model:'seeded',promptHash:'a25r3',readerVersion:'DEVELOPMENTAL-READER-01'};
  const classifier={provider:'witness',model:'seeded',promptHash:'a25r3',classifierVersion:'CLASSIFIER-01'};
  await q("INSERT INTO developmental_readings (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at) VALUES ($1,$2,$3,$4,1,'continuity',$5::jsonb,$6::jsonb,$7::jsonb,$8,'reading',$9::jsonb,$10::jsonb,$11::jsonb,now())",
    [readingId,manuscriptId,memberId,draftId,JSON.stringify(scope),JSON.stringify(readState),
      JSON.stringify(coverage),readState.inputFingerprint,JSON.stringify([observation]),
      JSON.stringify(reader),JSON.stringify(classifier)]);
  return {livingWorkId,manuscriptId,expressionId,sourceSectionId,draftId,draftSectionId,readingId};
}

async function episodeCount(relationshipId?:string){
  const r=relationshipId
    ? await one<{n:string}>("SELECT count(*)::text n FROM writer_editorial_relationship_episodes WHERE relationship_id=$1",[relationshipId])
    : await one<{n:string}>("SELECT count(*)::text n FROM writer_editorial_relationship_episodes");
  return Number(r?.n??0);
}
async function maiaTurns(threadId:string){
  const r=await one<{n:string}>("SELECT count(*)::text n FROM ask_turns WHERE thread_id=$1 AND speaker='maia'",[threadId]);
  return Number(r?.n??0);
}
async function allTurns(threadId:string){
  const r=await one<{n:string}>("SELECT count(*)::text n FROM ask_turns WHERE thread_id=$1",[threadId]);
  return Number(r?.n??0);
}

async function main(){
  pg=new Client({connectionString:DSN}); await pg.connect();
  const db=(await one<{d:string}>("SELECT current_database() d"))?.d??'';
  if(!db.includes('ws_a25r3_witness')) throw new Error('refused non-witness DB '+db);
  const A=await makeMember('A2-5R3 member A');
  const B=await makeMember('A2-5R3 member B');
  const workA=await makeWork(A.id,'Primary work',true);
  const workB=await makeWork(A.id,'Wrong manuscript work',false);
  const workForeign=await makeWork(B.id,'Foreign work',false);
  const editorialFail=await makeWork(A.id,'Editorial rollback work',false);
  const reviewFail=await makeWork(A.id,'Review rollback work',true);

  stub=createServer((req,res)=>{
    let raw=''; req.on('data',c=>{raw+=c;});
    req.on('end',async()=>{
      const body=JSON.parse(raw||'{}');
      if(beforeRespond){await beforeRespond();beforeRespond=null;}
      const model=String(body.model??'claude-opus-5');
      const isEditorial=Array.isArray(body.tools)
        && body.tools.some((t:any)=>t?.name==='editorial_outcome');
      res.writeHead(200,{'content-type':'application/json'});
      res.end(JSON.stringify(isEditorial?toolReply(model):textReply(model)));
    });
  });
  await new Promise<void>(resolve=>stub!.listen(0,'127.0.0.1',()=>resolve()));
  const stubPort=(stub.address() as AddressInfo).port;

  next=spawn('node_modules/.bin/next',['dev','-p',String(PORT)],{
    cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:true,
    env:{...process.env,DATABASE_URL:DSN,
      WRITERS_STUDIO_EDITORIAL_ENABLED:'1',WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED:'1',
      MAIA_INFERENCE_MODE:'primary',ANTHROPIC_BASE_URL:'http://127.0.0.1:'+stubPort,
      ANTHROPIC_API_KEY:'sk-witness-not-real',MAIA_EDITORIAL_MODEL:'claude-opus-5',
      MAIA_ASK_MODEL:'claude-opus-5'},
  });
  const deadline=Date.now()+240000;
  for(;;){
    try{const r=await fetch('http://127.0.0.1:'+PORT+'/api/health');if(r.status<500)break;}catch{}
    if(Date.now()>deadline)throw new Error('Next did not become ready');
    await new Promise(r=>setTimeout(r,1200));
  }
  const api=async(token:string,path:string,init?:RequestInit)=>{
    const r=await fetch('http://127.0.0.1:'+PORT+path,{
      ...init,headers:{'content-type':'application/json','x-session-token':token,...(init?.headers??{})},
    });
    const text=await r.text(); let json:any=null;
    try{json=JSON.parse(text);}catch{}
    return {status:r.status,json,text};
  };
  const post=async(token:string,path:string,body:unknown)=>
    api(token,path,{method:'POST',body:JSON.stringify(body)});

  const createRel=async(token:string,w:WorkFixture)=>{
    const r=await post(token,'/api/writers-studio/relationships',
      {livingWorkId:w.livingWorkId,manuscriptId:w.manuscriptId});
    if(r.status!==201)throw new Error('relationship create failed '+r.status+' '+r.text);
    return r.json.relationship as {id:string};
  };

  const rel1=await createRel(A.token,workA);
  const rel2=await createRel(A.token,workA);
  check('relationship POST creates plural distinct ids',rel1.id!==rel2.id);

  const owned=await api(A.token,'/api/writers-studio/relationships/'+rel1.id);
  check('relationship GET reads exact owned relationship',owned.status===200&&owned.json.relationship.id===rel1.id);

  const foreignRel=await createRel(B.token,workForeign);
  const hidden=await api(A.token,'/api/writers-studio/relationships/'+foreignRel.id);
  check('relationship GET hides foreign-owned relationship',hidden.status===404);
  const openEditorial=async(token:string,w:WorkFixture)=>{
    const r=await post(token,'/api/writers-studio/editorial/thread',
      {sectionId:w.draftSectionId,sanctuary:false});
    if(r.status!==200)throw new Error('editorial open failed '+r.status+' '+r.text);
    return r.json as {threadId:string;chainId:string};
  };
  const turn=async(token:string,threadId:string,relationshipId?:string)=>{
    const body:any={
      threadId,act:{act:'discourse',text:'What do you notice here?',refersTo:null},
      sanctuary:false,
    };
    if(relationshipId)body.relationshipId=relationshipId;
    return post(token,'/api/writers-studio/editorial/turn',body);
  };

  const noRelThread=await openEditorial(A.token,workA);
  const noRelTurn=await turn(A.token,noRelThread.threadId);
  check('Editorial without relationshipId remains successful',noRelTurn.status===200,noRelTurn.text.slice(0,120));
  check('Editorial without relationshipId writes no A2 episode',(await episodeCount())===0);

  const withRelThread=await openEditorial(A.token,workA);
  const withRelTurn=await turn(A.token,withRelThread.threadId,rel1.id);
  check('Editorial with relationshipId succeeds',withRelTurn.status===200,withRelTurn.text.slice(0,120));
  const editorialEpisode=await one<any>(
    "SELECT * FROM writer_editorial_relationship_episodes WHERE relationship_id=$1 AND child_kind='EDITORIAL_TURN'",
    [rel1.id]);
  check('Editorial writes one exact A2 episode',
    !!editorialEpisode&&editorialEpisode.editorial_thread_id===withRelThread.threadId
      && editorialEpisode.manuscript_scope_requested==='section'
      && editorialEpisode.manuscript_scope_executed==='section');
  const wrongRel=await createRel(A.token,workB);
  const wrongThread=await openEditorial(A.token,workA);
  const wrong=await turn(A.token,wrongThread.threadId,wrongRel.id);
  check('wrong-manuscript relationship refuses before child write',
    wrong.status===409&&wrong.json?.persisted===false&&await allTurns(wrongThread.threadId)===0);

  const failRel=await createRel(A.token,editorialFail);
  const failThread=await openEditorial(A.token,editorialFail);
  beforeRespond=async()=>{await q("DELETE FROM living_work_expressions WHERE id=$1",[editorialFail.expressionId]);};
  const beforeMaia=await maiaTurns(failThread.threadId);
  const failTurn=await turn(A.token,failThread.threadId,failRel.id);
  check('Editorial A2 failure returns relationship refusal',failTurn.status===409,
    String(failTurn.json?.error??''));
  check('Editorial A2 failure rolls back MAIA outcome',
    await maiaTurns(failThread.threadId)===beforeMaia&&await allTurns(failThread.threadId)===1);
  check('Editorial A2 failure writes no episode',(await episodeCount(failRel.id))===0);

  const review=async(token:string,w:WorkFixture,relationshipId?:string)=>{
    const body:any={
      readingId:w.readingId,observationKey:'o1',
      question:'What were you seeing in this earlier observation?',sanctuary:false,
    };
    if(relationshipId)body.relationshipId=relationshipId;
    return post(token,'/api/sovereign/manuscripts/'+w.manuscriptId+'/review-discuss',body);
  };

  const beforeReviewEpisodes=await episodeCount(rel1.id);
  const reviewNoRel=await review(A.token,workA);
  check('Review without relationshipId remains successful',reviewNoRel.status===200,reviewNoRel.text.slice(0,120));
  check('Review without relationshipId writes no A2 episode',
    await episodeCount(rel1.id)===beforeReviewEpisodes);
  const reviewWithRel=await review(A.token,workA,rel1.id);
  check('Review with relationshipId succeeds',reviewWithRel.status===200,reviewWithRel.text.slice(0,120));
  const reviewEpisode=await one<any>(
    "SELECT * FROM writer_editorial_relationship_episodes WHERE relationship_id=$1 AND child_kind='REVIEW_DISCUSS'",
    [rel1.id]);
  check('Review writes finding-scoped A2 episode with NULL manuscript scope',
    !!reviewEpisode&&reviewEpisode.manuscript_scope_requested===null
      &&reviewEpisode.manuscript_scope_executed===null);

  const failReviewRel=await createRel(A.token,reviewFail);
  beforeRespond=async()=>{await q("DELETE FROM living_work_expressions WHERE id=$1",[reviewFail.expressionId]);};
  const reviewFailResult=await review(A.token,reviewFail,failReviewRel.id);
  check('Review A2 failure returns relationship_unavailable',
    reviewFailResult.status===409&&reviewFailResult.json?.refusal==='relationship_unavailable',
    reviewFailResult.text.slice(0,160));
  const failedThreadId=String(reviewFailResult.json?.threadId??'');
  check('Review A2 failure rolls back MAIA turn',
    failedThreadId.length>0&&await maiaTurns(failedThreadId)===0);
  const failedCompletion=await one<{completed_at:Date|null}>(
    "SELECT c.completed_at FROM ask_authorization_consumptions c JOIN ask_authorization_acts a ON a.id=c.act_id WHERE a.thread_id=$1",
    [failedThreadId]);
  check('Review A2 failure rolls back authorization completion',
    !!failedCompletion&&failedCompletion.completed_at===null);
  const crossed=await one<{n:string}>(
    "SELECT count(*)::text n FROM context_disclosure_receipts WHERE member_id=$1 AND source_ref=$2 AND state='crossed'",
    [A.id,reviewFail.manuscriptId]);
  check('Review A2 failure rolls back disclosure confirmation',Number(crossed?.n??0)===0);
  check('Review A2 failure writes no A2 episode',(await episodeCount(failReviewRel.id))===0);
  const { transaction }=await import('@/lib/db/postgres');
  const {
    prepareRelationshipForAppendWithClient,appendEditorialEpisodeWithClient,
    RelationshipCustodyRefused,
  }=await import('@/lib/writers-studio/relationshipCustody');
  let duplicateElsewhere=false;
  try{
    await transaction(async tx=>{
      const prepared=await prepareRelationshipForAppendWithClient(tx,{
        memberId:A.id,relationshipId:rel2.id,
      });
      await appendEditorialEpisodeWithClient(tx,prepared,{
        threadId:withRelThread.threadId,proposalChainId:withRelThread.chainId,
        memberTurnIndex:Number(withRelTurn.json.memberTurnIndex),
        maiaTurnIndex:Number(withRelTurn.json.maiaTurnIndex),
        manuscriptLocusScope:'section',
      });
    });
  }catch(e){
    duplicateElsewhere=e instanceof RelationshipCustodyRefused
      &&e.reason==='child_already_attached_elsewhere';
  }
  check('same completed child cannot attach to another relationship',duplicateElsewhere);

  console.log('');
  console.log('A2-5R3 LIVE CARRIAGE WITNESS '+pass+'/'+(pass+fail));
  process.exitCode=fail?1:0;
}

async function cleanup(){
  killNext();
  try{await new Promise<void>(resolve=>stub?.close(()=>resolve())??resolve());}catch{}
  try{await pg?.end();}catch{}
  try{const {closePool}=await import('@/lib/db/postgres');await closePool();}catch{}
}
main().catch(e=>{console.error(e);process.exitCode=2;})
  .finally(cleanup);
