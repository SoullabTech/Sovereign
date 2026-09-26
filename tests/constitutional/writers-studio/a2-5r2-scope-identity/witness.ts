import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import type { VerifiedMemberId } from '@/lib/maia/canonical-turn/types';
import {
  query, queryWithExpectedRefusal, transaction, closePool,
} from '@/lib/db/postgres';
import {
  openEditorialRelationship,
  openEditorialRelationshipAtSelection,
} from '@/lib/manuscript/editorialRuntime/thread';
import {
  createEditorialRelationshipCustody,
  prepareRelationshipForAppendWithClient,
  appendEditorialEpisodeWithClient,
  appendReviewDiscussEpisodeWithClient,
  RelationshipCustodyRefused,
} from '@/lib/writers-studio/relationshipCustody';

let pass=0, fail=0;
const check=(name:string, ok:boolean, detail='')=>{
  if(ok){ pass++; console.log('PASS  '+name+(detail?' — '+detail:'')); }
  else { fail++; console.log('FAIL  '+name+(detail?' — '+detail:'')); }
};

const BODY='Alpha beta gamma.';
async function member() {
  const id=randomUUID();
  await query(
    "INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,$2,$3,'x')",
    [id,'A25R2-'+id.slice(0,8),'a25r2-'+id.slice(0,8)],
  );
  return id;
}

async function work(m:string,label:string) {
  const livingWorkId=randomUUID(), manuscriptId=randomUUID();
  const draftId=randomUUID(), sourceSectionId=randomUUID(), draftSectionId=randomUUID();
  await query("INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,$3)",
    [livingWorkId,m,label]);
  await query("INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)",
    [manuscriptId,m,label]);
  await query(
    "INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)",
    [livingWorkId,manuscriptId,m],
  );
  await query(
    "INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body) VALUES ($1,$2,0,NULL,$3)",
    [sourceSectionId,manuscriptId,BODY],
  );
  await query(
    "INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at) VALUES ($1,$2,$3,'','witness',1,41,NULL)",
    [draftId,manuscriptId,m],
  );
  await query(
    "INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,0,$3,$4)",
    [draftSectionId,draftId,BODY,sourceSectionId],
  );
  await query(
    "UPDATE manuscript_working_drafts SET content=$2,section_addressable_at=now() WHERE id=$1",
    [draftId,BODY],
  );
  return {livingWorkId,manuscriptId,draftId,draftSectionId};
}

async function addTurns(threadId:string) {
  await query(
    "INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Question','{}'::jsonb,NULL),($1,1,'maia','Answer','{}'::jsonb,'{}'::jsonb)",
    [threadId],
  );
}

async function reviewChild(m:string, manuscriptId:string) {
  const readingId=randomUUID(), threadId=randomUUID(), authorizationId=randomUUID();
  const observationKey='scope-finding';
  const identity={
    kind:'review_discuss_r2_1',readingId,observationKey,draftId:randomUUID(),
    revisionNumber:1,inputFingerprint:'fp',commissionedLens:'development',
    readerProvenance:null,
  };
  await query(
    "INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,'witness:0','author',NULL)",
    [threadId,manuscriptId,m,
      JSON.stringify({on:'observation',readingId,observationKey}),JSON.stringify(identity)],
  );
  await query(
    "INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Q','{}'::jsonb,NULL),($1,1,'maia','A','{}'::jsonb,'{}'::jsonb)",
    [threadId],
  );
  await query(
    "INSERT INTO ask_authorization_acts (id,member_id,manuscript_id,thread_id,reading_id,observation_key,expires_at) VALUES ($1,$2,$3,$4,$5,$6,now()+interval '1 hour')",
    [authorizationId,m,manuscriptId,threadId,readingId,observationKey],
  );
  await query(
    "INSERT INTO ask_authorization_consumptions (act_id,completed_at,completion_ref,claim_request_ref) VALUES ($1,now(),$2,$3)",
    [authorizationId,threadId+':1',randomUUID()],
  );
  return {readingId,threadId,authorizationId,observationKey};
}

async function main(){
  const m=await member();
  const w=await work(m,'A2-5R2');
  const identity={status:'verified' as const,memberId:m as VerifiedMemberId,memberRef:'a2-5r2-witness'};

  const section=await openEditorialRelationship({identity,sectionId:w.draftSectionId});
  if(!section.ok) throw new Error('section open failed: '+section.reason);
  const sectionScope=await query<{locus_scope_kind:string|null}>(
    "SELECT locus_scope_kind FROM proposal_chains WHERE id=$1",[section.chainId]);
  check('new section open mints section',
    sectionScope.rows[0]?.locus_scope_kind==='section');

  const passage=await openEditorialRelationshipAtSelection({
    identity,sectionId:w.draftSectionId,revisionNumber:41,range:{start:0,end:5},
  });
  if(!passage.ok) throw new Error('passage open failed: '+passage.reason);
  const passageScope=await query<{locus_scope_kind:string|null}>(
    "SELECT locus_scope_kind FROM proposal_chains WHERE id=$1",[passage.chainId]);
  check('new passage open mints passage',
    passageScope.rows[0]?.locus_scope_kind==='passage');

  const full=await openEditorialRelationshipAtSelection({
    identity,sectionId:w.draftSectionId,revisionNumber:41,range:{start:0,end:[...BODY].length},
  });
  if(!full.ok) throw new Error('full-body passage open failed: '+full.reason);
  const fullScope=await query<{locus_scope_kind:string|null}>(
    "SELECT locus_scope_kind FROM proposal_chains WHERE id=$1",[full.chainId]);
  check('full-body selection remains passage',
    fullScope.rows[0]?.locus_scope_kind==='passage');

  const historical=randomUUID();
  await query(
    "INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text) VALUES ($1,$2,$3,$4,1,$5,'Historical')",
    [historical,m,w.manuscriptId,w.draftId,randomUUID()],
  );
  const historicalScope=await query<{locus_scope_kind:string|null}>(
    "SELECT locus_scope_kind FROM proposal_chains WHERE id=$1",[historical]);
  check('historical chain remains NULL/unmeasured',
    historicalScope.rows[0]?.locus_scope_kind===null);

  const imm=await queryWithExpectedRefusal(
    "UPDATE proposal_chains SET locus_scope_kind='section' WHERE id=$1",
    [historical],
    {fragment:'proposal_chains is append-only',why:'scope discriminator is immutable'},
  );
  check('scope discriminator UPDATE refused',imm.refused);
  const routeA=readFileSync('app/api/writers-studio/editorial/thread/route.ts','utf8');
  const routeB=readFileSync('app/api/writers-studio/rebuild/editorial/thread/route.ts','utf8');
  check('client request contracts carry no locusScopeKind authority',
    !routeA.includes('locusScopeKind') && !routeB.includes('locusScopeKind'));

  const rel=await createEditorialRelationshipCustody({
    memberId:m,livingWorkId:w.livingWorkId,manuscriptId:w.manuscriptId,
  });
  if(!rel.ok) throw new Error('A2 relationship create failed');

  await addTurns(passage.threadId);
  const admitted=await transaction(async tx=>{
    const prepared=await prepareRelationshipForAppendWithClient(
      tx,{memberId:m,relationshipId:rel.relationship.id});
    return appendEditorialEpisodeWithClient(tx,prepared,{
      threadId:passage.threadId,proposalChainId:passage.chainId,
      memberTurnIndex:0,maiaTurnIndex:1,manuscriptLocusScope:'passage',
    });
  });
  check('Editorial A2 admission accepts matching durable scope',
    admitted.sequence===1);

  await addTurns(section.threadId);
  let mismatch=false;
  try{
    await transaction(async tx=>{
      const prepared=await prepareRelationshipForAppendWithClient(
        tx,{memberId:m,relationshipId:rel.relationship.id});
      await appendEditorialEpisodeWithClient(tx,prepared,{
        threadId:section.threadId,proposalChainId:section.chainId,
        memberTurnIndex:0,maiaTurnIndex:1,manuscriptLocusScope:'passage',
      });
    });
  }catch(e){
    mismatch=e instanceof RelationshipCustodyRefused && e.reason==='editorial_child_invalid';
  }
  check('Editorial A2 admission refuses scope mismatch',mismatch);
  const historicalThread=randomUUID();
  await query(
    "INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id) VALUES ($1,$2,$3,NULL,NULL,'witness:0','author',$4)",
    [historicalThread,w.manuscriptId,m,historical],
  );
  await addTurns(historicalThread);
  let unmeasured=false;
  try{
    await transaction(async tx=>{
      const prepared=await prepareRelationshipForAppendWithClient(
        tx,{memberId:m,relationshipId:rel.relationship.id});
      await appendEditorialEpisodeWithClient(tx,prepared,{
        threadId:historicalThread,proposalChainId:historical,
        memberTurnIndex:0,maiaTurnIndex:1,manuscriptLocusScope:'passage',
      });
    });
  }catch(e){
    unmeasured=e instanceof RelationshipCustodyRefused && e.reason==='editorial_child_invalid';
  }
  check('historical NULL Editorial chain is not A2 scope-admittable',unmeasured);

  const review=await reviewChild(m,w.manuscriptId);
  const reviewEpisode=await transaction(async tx=>{
    const prepared=await prepareRelationshipForAppendWithClient(
      tx,{memberId:m,relationshipId:rel.relationship.id});
    return appendReviewDiscussEpisodeWithClient(tx,prepared,{
      threadId:review.threadId,maiaTurnIndex:1,authorizationId:review.authorizationId,
      readingId:review.readingId,observationKey:review.observationKey,
    });
  });
  const reviewScope=await query<{
    manuscript_scope_requested:string|null; manuscript_scope_executed:string|null;
  }>(
    "SELECT manuscript_scope_requested,manuscript_scope_executed FROM writer_editorial_relationship_episodes WHERE id=$1",
    [reviewEpisode.id],
  );
  check('Review episode persists NULL manuscript locus scope',
    reviewScope.rows[0]?.manuscript_scope_requested===null
      && reviewScope.rows[0]?.manuscript_scope_executed===null);

  const badReview=await queryWithExpectedRefusal(
    "INSERT INTO writer_editorial_relationship_episodes (relationship_id,sequence,child_kind,manuscript_scope_requested,manuscript_scope_executed,temporal_posture,history_policy,continuation_authorized,authority_class,carry_policy,review_thread_id,review_maia_turn_index,review_authorization_id,review_reading_id,review_observation_key) VALUES ($1,99,'REVIEW_DISCUSS','section','section','AS_READ','NONE',FALSE,'R2_DISCLOSURE','PRESENTATION_ONLY',$2,1,$3,$4,'bad')",
    [rel.relationship.id,randomUUID(),randomUUID(),randomUUID()],
    {fragment:'were_child_shape_scope_and_semantics',why:'Review scope must stay null'},
  );
  check('Review row with non-null manuscript scope is refused',badReview.refused);

  console.log('');
  console.log('A2-5R2 SCOPE WITNESS '+pass+'/'+(pass+fail));
  if(fail) process.exitCode=1;
}

main()
  .catch(e=>{ console.error(e); process.exitCode=1; })
  .finally(async()=>{ await closePool(); });
