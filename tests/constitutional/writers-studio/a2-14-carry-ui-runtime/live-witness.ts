import { randomUUID } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import {
  createEditorialRelationshipCustody,
  prepareRelationshipForAppendWithClient,
  appendEditorialEpisodeWithClient,
} from '@/lib/writers-studio/relationshipCustody';
import { listEligiblePriorMaiaEditorialCarrySources } from '@/lib/writers-studio/relationshipCarriage';

let pass=0, fail=0;
const check=(name:string,ok:boolean,detail='')=>{if(ok){pass++;console.log('PASS  '+name+(detail?' — '+detail:''));}else{fail++;console.log('FAIL  '+name+(detail?' — '+detail:''));}};

async function seedEditorial(memberId:string, manuscriptId:string, scope:'passage'|'section', body:string) {
  const chain=randomUUID(), thread=randomUUID();
  await query("INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text,locus_scope_kind) VALUES ($1,$2,$3,$4,0,$5,'Witness text',$6)",
    [chain,memberId,manuscriptId,randomUUID(),randomUUID(),scope]);
  await query("INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,proposal_chain_id) VALUES ($1,$2,$3,NULL,NULL,'a2-14:0','author',$4)",
    [thread,manuscriptId,memberId,chain]);
  await query("INSERT INTO ask_turns (thread_id,turn_index,speaker,body,staleness,answer_provenance) VALUES ($1,0,'author','Member act','{}'::jsonb,NULL),($1,1,'maia',$2,'{}'::jsonb,'{}'::jsonb)",
    [thread,body]);
  return {chain,thread,scope};
}

async function attach(relationshipId:string, memberId:string, child:Awaited<ReturnType<typeof seedEditorial>>) {
  return transaction(async tx=>{
    const prepared=await prepareRelationshipForAppendWithClient(tx,{memberId,relationshipId});
    return appendEditorialEpisodeWithClient(tx,prepared,{threadId:child.thread,proposalChainId:child.chain,memberTurnIndex:0,maiaTurnIndex:1,manuscriptLocusScope:child.scope});
  });
}

async function main(){
  const db=(await query<{d:string}>('SELECT current_database() d')).rows[0]!.d;
  if(!db.includes('ws_a214_witness')) throw new Error('refused non-witness DB '+db);

  const memberId=randomUUID();
  await query("INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','A2-14 witness')",
    [memberId,'A214-'+memberId.slice(0,8),'a214-'+memberId.slice(0,8)]);
  const work=(await query<{id:string}>("INSERT INTO living_works (member_id,title) VALUES ($1,'A2-14 Work') RETURNING id",[memberId])).rows[0]!.id;
  const manuscript=(await query<{id:string}>("INSERT INTO member_manuscripts (member_id,title) VALUES ($1,'A2-14 Manuscript') RETURNING id",[memberId])).rows[0]!.id;
  await query("INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)",[work,manuscript,memberId]);

  const rel=await createEditorialRelationshipCustody({memberId,livingWorkId:work,manuscriptId:manuscript});
  if(!rel.ok) throw new Error('relationship refused '+rel.reason);
  const relationshipId=rel.relationship.id;

  const longBody='🌿'.repeat(321);
  const sectionSource=await seedEditorial(memberId,manuscript,'section',longBody);
  const passageSource=await seedEditorial(memberId,manuscript,'passage','Passage source exact.');
  const deletedSource=await seedEditorial(memberId,manuscript,'section','This source will disappear.');
  const receiverPassage=await seedEditorial(memberId,manuscript,'passage','Receiver prior turn.');
  const receiverSection=await seedEditorial(memberId,manuscript,'section','Section receiver prior turn.');

  const epSection=await attach(relationshipId,memberId,sectionSource);
  const epPassage=await attach(relationshipId,memberId,passageSource);
  const epDeleted=await attach(relationshipId,memberId,deletedSource);
  const epReceiverPassage=await attach(relationshipId,memberId,receiverPassage);
  await attach(relationshipId,memberId,receiverSection);
  await query("DELETE FROM ask_turns WHERE thread_id=$1 AND turn_index=1",[deletedSource.thread]);

  const passageList=await listEligiblePriorMaiaEditorialCarrySources({memberId,relationshipId,receiverThreadId:receiverPassage.thread});
  if(!passageList.ok) throw new Error('passage list refused '+passageList.reason);
  const passageSeq=passageList.sources.map(s=>s.sourceEpisodeSequence);
  check('passage receiver sees eligible section + passage sources', passageSeq.includes(epSection.sequence)&&passageSeq.includes(epPassage.sequence));
  check('same-thread source is omitted', !passageSeq.includes(epReceiverPassage.sequence));
  check('deleted source is omitted', !passageSeq.includes(epDeleted.sequence));
  const long=passageList.sources.find(s=>s.sourceEpisodeSequence===epSection.sequence)!;
  check('excerpt is exact 320-code-point prefix with truncation flag', Array.from(long.excerpt).length===320&&long.excerpt==='🌿'.repeat(320)&&long.excerptTruncated&&!long.excerpt.endsWith('…'));
  const ordered=[...passageList.sources].map(s=>s.sourceEpisodeSequence);
  check('eligible list is chronological by admitted episode order', ordered.every((n,i)=>i===0||ordered[i-1]!<n), ordered.join(','));

  const sectionList=await listEligiblePriorMaiaEditorialCarrySources({memberId,relationshipId,receiverThreadId:receiverSection.thread});
  if(!sectionList.ok) throw new Error('section list refused '+sectionList.reason);
  check('section receiver omits passage-scoped source', !sectionList.sources.some(s=>s.sourceEpisodeSequence===epPassage.sequence));

  console.log(`\nA2-14 REAL ELIGIBILITY WITNESS ${pass}/${pass+fail}`);
  process.exitCode=fail?1:0;
}
main().catch(e=>{console.error(e);process.exitCode=2;});
