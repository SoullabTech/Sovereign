/**
 * ER-R3 · MAIA'S THREE DURABLE OUTCOMES — DATABASE EVIDENCE.
 *
 * ⭐⭐ THE CENTRAL FALSIFIER IS THE ER-F4 RACE: freeze the invocation against
 * V1, let the chain move to V2 while MAIA is "thinking", then persist. The
 * proposal must be REFUSED and the whole outcome rolled back — ⛔ never rebased
 * onto V2, ⛔ never retried against it.
 *
 * ⛔ DISPOSABLE DATABASES ONLY. Rebuild: scripts/witness/er-runtime-rebuild-db.sh
 */
import { query, closePool } from '@/lib/db/postgres';
import { persistMaiaEditorialOutcome } from '@/lib/manuscript/editorialRuntime/maiaOutcome';
import { assembleEditorialCognition } from '@/lib/manuscript/editorialRuntime/assembly';
import { appendAuthoredVersion } from '@/lib/manuscript/proposalChain/store';
import { admitEditorialToolEnvelope, type EditorialInvocation } from '@/lib/manuscript/editorialDiscourse/contract';

const M='11111111-0000-4000-8000-00000000003e', WK='22222222-0000-4000-8000-00000000003e';
const DR='33333333-0000-4000-8000-00000000003e', SE='44444444-0000-4000-8000-00000000003e';
const CX='cccccccc-0000-4000-8000-00000000003e', TE='aaaa0000-0000-4000-8000-00000000003e';
const CZ='cccccccc-0000-4000-8000-00000000003f', TZ='aaaa0000-0000-4000-8000-00000000003f';

let pass=0, fail=0;
const ok=(s:string)=>{pass++;console.log(`  PASS  ${s}`);};
const bad=(s:string,d:string)=>{fail++;console.log(`  FAIL  ${s}\n     -> ${d}`);};
const eq=(s:string,got:unknown,want:unknown)=>got===want?ok(s):bad(s,`want [${String(want)}] got [${String(got)}]`);
const one=async(sql:string,p:unknown[]=[])=>(await query<Record<string,any>>(sql,p as any[])).rows[0]!;

/** ⭐ The four counts, always read together. A refusal must move none of them. */
async function counts(threadId:string, chainId:string){
  const r=await one(
    `SELECT (SELECT count(*) FROM ask_turns WHERE thread_id=$1)::int t,
            (SELECT count(*) FROM proposal_chain_directions WHERE proposal_chain_id=$2)::int d,
            (SELECT count(*) FROM proposal_versions WHERE chain_id=$2)::int v,
            (SELECT count(*) FROM editorial_turn_bindings WHERE thread_id=$1)::int b`,
    [threadId, chainId]);
  return `${r.t}/${r.d}/${r.v}/${r.b}`;
}
const inv=(chainId:string,threadId:string,against:string|null):EditorialInvocation=>
  ({chainId,threadId,authoredAgainstVersionId:against});

async function main(){
  const db=(await one('SELECT current_database() d')).d as string;
  if(!db.includes('witness')){console.log(`REFUSED · '${db}' is not a witness database.`);process.exit(2);}
  if(Number((await one('SELECT (SELECT count(*) FROM proposal_chains)+(SELECT count(*) FROM ask_threads) n')).n)!==0){
    console.log('  ⛔ REFUSED — dirty. Rebuild: bash scripts/witness/er-runtime-rebuild-db.sh');
    await closePool();process.exit(2);}
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ER-R3 · MAIA DURABLE OUTCOMES + EXACT PREDECESSOR CUSTODY');
  console.log('══════════════════════════════════════════════════════════════════\n');

  await query(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'ER-R3','er_r3','x')`,[M]);
  await query(`INSERT INTO member_manuscripts (id,member_id) VALUES ($1,$2)`,[WK,M]);
  await query(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash)
               VALUES ($1,$2,$3,'Before the water.','s3')`,[DR,WK,M]);
  await query(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text)
               VALUES ($1,$2,1,'Before the water.')`,[SE,DR]);
  for(const [c,t] of [[CX,TE],[CZ,TZ]] as const){
    await query(`INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text)
                 VALUES ($1,$2,$3,$4,1,$5,'Before the water.')`,[c,M,WK,DR,SE]);
    await query(`INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,canonical_at_open,initiated_by,proposal_chain_id)
                 VALUES ($1,$2,$3,NULL,'c1','author',$4)`,[t,WK,M,c]);
  }

  /* ══ ADMISSION BEFORE PERSISTENCE ══════════════════════════════════════ */
  console.log('── admission before persistence ──────────────────────────────────');
  const before=await counts(TE,CX);
  const textOnly=admitEditorialToolEnvelope([{type:'text',text:'I might tighten this: "the water, held".'} as any]);
  eq('A1 ⛔ a text-only answer is refused', textOnly.ok===false&&textOnly.reason,'not_through_tool');
  const twoCalls=admitEditorialToolEnvelope([
    {type:'tool_use',name:'editorial_outcome',input:{kind:'reply_only',reply:'a'}} as any,
    {type:'tool_use',name:'editorial_outcome',input:{kind:'reply_only',reply:'b'}} as any]);
  eq('A2 ⛔ two tool calls are refused', twoCalls.ok, false);
  const bothAdjuncts=admitEditorialToolEnvelope([{type:'tool_use',name:'editorial_outcome',input:{
    kind:'reply_with_proposal',reply:'r',proposal:{replacementText:'x'},direction:{instruction:'y',refersTo:null}}} as any]);
  eq('A3 ⛔ two adjuncts are refused', bothAdjuncts.ok, false);
  eq('A4 ⭐⭐ and NONE of them reached a transaction — nothing was written',
     await counts(TE,CX), before);

  /* ══ THE THREE OUTCOMES ════════════════════════════════════════════════ */
  console.log('\n── the three durable outcomes ────────────────────────────────────');
  const r1=await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CX,TE,null),
    outcome:{kind:'reply_only',reply:'I would leave it as it stands.'}});
  eq('B1 reply_only succeeds', r1.ok, true);
  eq('B1 ⭐ turn 1 · Direction 0 · Version 0 · binding 0', await counts(TE,CX),'1/0/0/0');

  const INSTR='soften the second clause, not the first';
  const r2=await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CX,TE,null),
    outcome:{kind:'reply_with_direction',reply:'Here is what I would steer toward.',
             direction:{instruction:INSTR,refersTo:null}}});
  eq('B2 reply_with_direction succeeds', r2.ok, true);
  eq('B2 ⭐ 2/1/0/1', await counts(TE,CX),'2/1/0/1');
  eq('B2 ⭐ the instruction is preserved verbatim',
     (await one('SELECT instruction i FROM proposal_chain_directions WHERE proposal_chain_id=$1',[CX])).i, INSTR);

  /* ⭐ ZERO-VERSION CHAIN → the first proposal is the ROOT. */
  const r3=await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CX,TE,null),
    outcome:{kind:'reply_with_proposal',reply:'Try this.',proposal:{replacementText:'Before the water, held.'}}});
  eq('B3 reply_with_proposal succeeds', r3.ok, true);
  eq('B3 ⭐ 3/1/1/2', await counts(TE,CX),'3/1/1/2');
  eq('B3 ⭐⭐ zero-version chain → the root: supersedes is NULL',
     (await one('SELECT supersedes s FROM proposal_versions WHERE chain_id=$1',[CX])).s, null);
  const V1=(await one('SELECT id FROM proposal_versions WHERE chain_id=$1',[CX])).id as string;
  eq('B3b the binding carries the version and no direction',
     (await one(`SELECT (version_id=$2) v, (direction_id IS NULL) d FROM editorial_turn_bindings
                  WHERE thread_id=$1 AND version_id IS NOT NULL`,[TE,V1])).v, true);

  /* ⭐ POSITIVE CUSTODY · head unchanged → the frozen id is what is stored. */
  const r4=await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CX,TE,V1),
    outcome:{kind:'reply_with_proposal',reply:'Or this.',proposal:{replacementText:'Before the water, held twice.'}}});
  eq('B4 a second proposal against the unchanged head succeeds', r4.ok, true);
  eq('B4 ⭐⭐ durable supersedes === the FROZEN invocation id',
     (await one('SELECT supersedes s FROM proposal_versions WHERE supersedes IS NOT NULL AND chain_id=$1',[CX])).s, V1);

  /* ══ ⭐⭐ THE ER-F4 RACE ════════════════════════════════════════════════ */
  console.log('\n── ⭐⭐ ER-F4 · the chain moves while MAIA is thinking ────────────');
  const a=await assembleEditorialCognition({memberId:M,threadId:TZ,currentTurnIndex:0,
    declaredAct:'discourse',currentDirectionId:null});
  if(!a.ok){bad('C0 assembly',a.reason);await closePool();process.exit(1);}
  await appendAuthoredVersion(M,CZ,{supersedes:null,author:'member',replacementText:'ROOT'});
  const root=(await one('SELECT id FROM proposal_versions WHERE chain_id=$1',[CZ])).id as string;
  const frozen=inv(CZ,TZ,root);                      /* ⭐ frozen against ROOT */
  const moved=await appendAuthoredVersion(M,CZ,{supersedes:root,author:'member',replacementText:'V2-INDEPENDENT'});
  eq('C1 an independent V2 lands while MAIA is thinking', moved.outcome,'appended');
  const beforeRace=await counts(TZ,CZ);

  const raced=await persistMaiaEditorialOutcome({memberId:M,invocation:frozen,
    outcome:{kind:'reply_with_proposal',reply:'Here is my wording.',proposal:{replacementText:'MAIA-STALE'}}});
  eq('C2 ⭐⭐ the stale predecessor is REFUSED', raced.ok===false&&raced.reason,'not_successor_of_head');
  eq('C3 ⭐⭐ the ENTIRE outcome rolled back — turn, version and binding',
     await counts(TZ,CZ), beforeRace);
  eq('C4 ⛔ no rebase: MAIA-STALE exists nowhere',
     Number((await one(`SELECT count(*)::int n FROM proposal_versions WHERE formulation='MAIA-STALE'`)).n),0);
  eq('C5 ⭐ V2 is untouched and still the head',
     (await one(`SELECT formulation f FROM proposal_versions WHERE chain_id=$1 AND supersedes=$2`,[CZ,root])).f,'V2-INDEPENDENT');
  eq('C6 ⛔ and the frozen invocation was NOT mutated by the attempt',
     frozen.authoredAgainstVersionId, root);

  /* ══ REFUSAL POSITIONS ═════════════════════════════════════════════════ */
  console.log('\n── refusals after the turn is already written ────────────────────');
  const base=await counts(TE,CX);
  const badRef=await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CX,TE,null),
    outcome:{kind:'reply_with_direction',reply:'r',direction:{instruction:'x',refersTo:root}}});
  eq('D1 a Direction referencing another chain’s version is refused',
     badRef.ok===false&&badRef.reason,'direction_refused');
  eq('D1 ⭐⭐ ROLLBACK — MAIA’s turn is gone too', await counts(TE,CX), base);

  eq('D2 an invocation naming the WRONG chain is refused',
     (await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CZ,TE,null),
       outcome:{kind:'reply_only',reply:'r'}}) as any).reason,'invocation_mismatch');
  eq('D2 ⭐ and nothing was written', await counts(TE,CX), base);

  await query(`CREATE FUNCTION er_r3_refuse_binding() RETURNS trigger AS $$
               BEGIN RAISE EXCEPTION 'er_r3 disposable fault'; END; $$ LANGUAGE plpgsql`);
  await query(`CREATE TRIGGER er_r3_fault BEFORE INSERT ON editorial_turn_bindings
               FOR EACH ROW EXECUTE FUNCTION er_r3_refuse_binding()`);
  try{
    let threw=false;
    try{ await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CX,TE,null),
      outcome:{kind:'reply_with_direction',reply:'r',direction:{instruction:'will not bind',refersTo:null}}}); }
    catch{ threw=true; }
    eq('D3 the binding refusal propagates', threw, true);
    eq('D3 ⭐⭐ ROLLBACK — turn AND Direction both gone', await counts(TE,CX), base);
  } finally {
    await query('DROP TRIGGER IF EXISTS er_r3_fault ON editorial_turn_bindings');
    await query('DROP FUNCTION IF EXISTS er_r3_refuse_binding()');
  }
  eq('D3b ⭐ the fault removed, the outcome lands again',
     (await persistMaiaEditorialOutcome({memberId:M,invocation:inv(CX,TE,null),
       outcome:{kind:'reply_only',reply:'again'}})).ok, true);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  await closePool(); process.exit(fail===0?0:1);
}
main().catch(async(e)=>{console.error(e);await closePool();process.exit(2);});
