import { randomUUID } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import {
  createEditorialRelationshipCustody,
  prepareRelationshipForAppendWithClient,
  appendEditorialEpisodeWithClient,
} from '@/lib/writers-studio/relationshipCustody';
import { resolvePriorMaiaEditorialCarry } from '@/lib/writers-studio/relationshipCarriage';

let pass=0, fail=0;
const check=(name:string,ok:boolean,detail='')=>{
  if(ok){pass++;console.log('PASS  '+name+(detail?' — '+detail:''));}
  else{fail++;console.log('FAIL  '+name+(detail?' — '+detail:''));}
};

async function seedEditorial(memberId:string, manuscriptId:string, scope:'passage'|'section', body:string) {
  const chain=randomUUID(), thread=randomUUID();
  await query(
    "INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text,locus_scope_kind) VALUES ($1,$2,$3,$4,0,$5,'Witness text',$6)",
    [chain,memberId,manuscriptId,randomUUID(),randomUUID(),scope],
  );
  await query(
    "INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id) VALUES ($1,$2,$3,NULL,NULL,'a2-11:0','author',$4)",
    [thread,manuscriptId,memberId,chain],
  );
  await query(
    "INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Earlier member act','{}'::jsonb,NULL),($1,1,'maia',$2,'{}'::jsonb,'{}'::jsonb)",
    [thread,body],
  );
  return {chain,thread,memberTurnIndex:0,maiaTurnIndex:1,scope};
}

async function seedReceiver(memberId:string, manuscriptId:string, scope:'passage'|'section') {
  const chain=randomUUID(), thread=randomUUID();
  await query(
    "INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text,locus_scope_kind) VALUES ($1,$2,$3,$4,0,$5,'Receiver text',$6)",
    [chain,memberId,manuscriptId,randomUUID(),randomUUID(),scope],
  );
  await query(
    "INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id) VALUES ($1,$2,$3,NULL,NULL,'a2-11:0','author',$4)",
    [thread,manuscriptId,memberId,chain],
  );
  return {chain,thread,scope};
}

async function main(){
  const db=(await query<{d:string}>('SELECT current_database() d')).rows[0]!.d;
  if(!db.includes('ws_a211_witness')) throw new Error('refused non-witness DB '+db);

  const memberId=randomUUID();
  await query("INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','A2-11 witness')",
    [memberId,'A211-'+memberId.slice(0,8),'a211-'+memberId.slice(0,8)]);
  const work=(await query<{id:string}>("INSERT INTO living_works (member_id,title) VALUES ($1,'A2-11 Work') RETURNING id",[memberId])).rows[0]!.id;
  const manuscript=(await query<{id:string}>("INSERT INTO member_manuscripts (member_id,title) VALUES ($1,'A2-11 Manuscript') RETURNING id",[memberId])).rows[0]!.id;
  await query("INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)",[work,manuscript,memberId]);

  const source=await seedEditorial(memberId,manuscript,'section','Earlier MAIA response from exact custody.');
  const receiver=await seedReceiver(memberId,manuscript,'passage');
  const created=await createEditorialRelationshipCustody({memberId,livingWorkId:work,manuscriptId:manuscript});
  if(!created.ok) throw new Error('relationship create refused '+created.reason);
  const relationshipId=created.relationship.id;
  const episode=await transaction(async tx=>{
    const prepared=await prepareRelationshipForAppendWithClient(tx,{memberId,relationshipId});
    return appendEditorialEpisodeWithClient(tx,prepared,{
      threadId:source.thread,proposalChainId:source.chain,memberTurnIndex:0,maiaTurnIndex:1,manuscriptLocusScope:'section',
    });
  });

  const resolved=await resolvePriorMaiaEditorialCarry({memberId,relationshipId,receiverThreadId:receiver.thread,sourceEpisodeSequence:episode.sequence});
  check('exact A2 custody resolves exact prior MAIA turn',
    resolved.ok
    && resolved.carry.sourceThreadId===source.thread
    && resolved.carry.sourceMaiaTurnIndex===1
    && resolved.carry.sourceBody==='Earlier MAIA response from exact custody.'
    && resolved.carry.sourceScope==='section'
    && resolved.carry.receiverScope==='passage');

  const same=await resolvePriorMaiaEditorialCarry({memberId,relationshipId,receiverThreadId:source.thread,sourceEpisodeSequence:episode.sequence});
  check('same-thread source refuses instead of duplicating child-local history',!same.ok&&same.reason==='same_thread_source');

  const other=await createEditorialRelationshipCustody({memberId,livingWorkId:work,manuscriptId:manuscript});
  if(!other.ok) throw new Error('second relationship create refused '+other.reason);
  const wrongParent=await resolvePriorMaiaEditorialCarry({memberId,relationshipId:other.relationship.id,receiverThreadId:receiver.thread,sourceEpisodeSequence:episode.sequence});
  check('episode sequence cannot cross relationship identity',!wrongParent.ok&&wrongParent.reason==='source_episode_not_found');

  await query("DELETE FROM ask_turns WHERE thread_id=$1 AND turn_index=1",[source.thread]);
  const missing=await resolvePriorMaiaEditorialCarry({memberId,relationshipId,receiverThreadId:receiver.thread,sourceEpisodeSequence:episode.sequence});
  check('deleted source turn refuses; custody metadata does not reconstruct prose',!missing.ok&&missing.reason==='source_turn_not_found');

  console.log(`\nA2-11 REAL SOURCE-READ WITNESS ${pass}/${pass+fail}`);
  process.exitCode=fail?1:0;
}
main().catch(e=>{console.error(e);process.exitCode=2;});
