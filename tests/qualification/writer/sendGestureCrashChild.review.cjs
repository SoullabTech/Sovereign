'use strict';
/**
 * Test-only child PG client. ALWAYS refuses outside the EXACT fictional
 * GitHub-hosted isolated PG16 database; never imports pg before the guard.
 * Exit codes 72/73 are dispatch-claim crash windows; 75/76 are
 * author-act plus receipt crash windows. All are intentional hard exits.
 * This is a fixture, not an application worker or permission/service.
 */
const url='postgresql://fictional_writer_qa:fictional_only@127.0.0.1:5432/fictional_writer_gesture_qa';
if (process.env.GITHUB_ACTIONS!=='true' ||
    process.env.WRITER_SEND_REFERENCE_PG16_QA!=='TRUE_EXPLICIT_TEST_ONLY' ||
    process.env.DATABASE_URL!==url) {
  process.stderr.write('FICTIONAL_ONLY_GUARD_REFUSED\n');
  process.exit(91);
}
const mode=process.argv[2];
if (!['before_commit','after_commit','author_before_commit','author_after_commit'].includes(mode)) process.exit(91);
const {Client}=require('pg');
const ids={
  member:'11111111-1111-4111-8111-111111111111',
  work:'33333333-3333-4333-8333-333333333333',
  manuscript:'44444444-4444-4444-8444-444444444444',
  a2:'55555555-5555-4555-8555-555555555555',
  epoch:'66666666-6666-4666-8666-666666666666',
  thread:'77777777-7777-4777-8777-777777777777',
  gesture:'88888888-8888-4888-8888-888888888888'
};
async function main() {
  const client=new Client({connectionString:url,ssl:false,connectionTimeoutMillis:3500});
  await client.connect();
  try {
    await client.query('BEGIN');
    const authorized=await client.query(
      'SELECT id FROM writer_send_reference.threads WHERE id=$1 AND member_id=$2 '+
      'AND work_id=$3 AND manuscript_id=$4 AND a2_id=$5 AND epoch_id=$6 FOR UPDATE',
      [ids.thread,ids.member,ids.work,ids.manuscript,ids.a2,ids.epoch]
    );
    if(authorized.rowCount!==1) throw Error('FICTIONAL_ORIGIN_MISMATCH');
    if(mode==='author_before_commit' || mode==='author_after_commit') {
      // EXACT fictional reference semantics: in one PG transaction, first
      // claim the next turn index, insert the durable author act and then
      // the content-free gesture receipt. No product/Source tables involved.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [ids.member+':'+ids.gesture]);
      const next=await client.query(
        'UPDATE writer_send_reference.threads SET next_index=next_index+1 '+
        'WHERE id=$1 RETURNING next_index-1 AS idx',[ids.thread]);
      if(next.rowCount!==1 || next.rows[0].idx!==0) throw Error('FICTIONAL_TURN_INDEX_MISMATCH');
      const scope=JSON.stringify({latitude:1,mayRemoveParagraphs:false});
      await client.query(
        'INSERT INTO writer_send_reference.author_acts '+
        '(thread_id,turn_index,member_id,kind,body,refers_to,scope) '+
        'VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)',
        [ids.thread,0,ids.member,'discourse',
         'FICTIONAL_ONLY_AUTHOR_WORDS_NOT_MEMBER_TEXT',null,scope]);
      await client.query(
        'INSERT INTO writer_send_reference.gesture_receipts '+
        '(member_id,gesture_id,thread_id,turn_index,work_id,manuscript_id,a2_id,epoch_id,state) '+
        "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ready')",
        [ids.member,ids.gesture,ids.thread,0,
         ids.work,ids.manuscript,ids.a2,ids.epoch]);
      if(mode==='author_before_commit') process.exit(75);
      await client.query('COMMIT');
      process.exit(76);
    }
    const claim=await client.query(
      "UPDATE writer_send_reference.gesture_receipts AS r "+
      "SET state='attempted_unknown', claimed_at=now() "+
      "FROM writer_send_reference.author_acts AS a "+
      "WHERE r.member_id=$1 AND r.gesture_id=$2 AND r.thread_id=$3 "+
      "AND r.a2_id=$4 AND r.epoch_id=$5 AND r.work_id=$6 "+
      "AND r.manuscript_id=$7 AND r.state='ready' "+
      "AND a.thread_id=r.thread_id AND a.turn_index=r.turn_index "+
      "AND a.body=$8 AND a.kind=$9 "+
      "AND a.refers_to IS NOT DISTINCT FROM $10 "+
      "AND a.scope=$11::jsonb "+
      "RETURNING r.gesture_id",
      [
        ids.member,ids.gesture,ids.thread,ids.a2,ids.epoch,ids.work,
        ids.manuscript,'FICTIONAL_ONLY_AUTHOR_WORDS_NOT_MEMBER_TEXT',
        'discourse',null,JSON.stringify({latitude:1,mayRemoveParagraphs:false})
      ]
    );
    if(claim.rowCount!==1) throw Error('FICTIONAL_CLAIM_MISMATCH');
    if(mode==='before_commit') {
      // Intentional hard process exit with an uncommitted PG transaction.
      process.exit(72);
    }
    await client.query('COMMIT');
    // Intentional hard exit: no graceful PG .end(), no provider call.
    process.exit(73);
  } catch(_) {
    try { await client.query('ROLLBACK'); } catch(__) {}
    process.stderr.write('FICTIONAL_QA_CHILD_FAILED\n');
    process.exit(74);
  }
}
main().catch(()=>{
  process.stderr.write('FICTIONAL_QA_CHILD_FAILED\n');
  process.exit(74);
});
