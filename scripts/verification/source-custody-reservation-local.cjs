/** Local, disposable PostgreSQL + filesystem custody witness. NEVER production. */
const { Pool } = require('pg');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const DATABASE = 'sanctuary_protocol_verify_1008';
const DB_URL = `postgresql://soullab@localhost:5432/${DATABASE}`;
const UUID = () => crypto.randomUUID();
const uid = UUID(), sid = UUID(), fixtureToken = UUID();
const pool = new Pool({ connectionString: DB_URL, max: 4, statement_timeout: 5000 });
let folder;
let passed = 0;
function check(name, condition) {
  if (!condition) throw new Error(`verification failed: ${name}`);
  passed += 1;
  console.log(`PASS ${name}`);
}
async function expectError(action, code) {
  try { await action(); return false; }
  catch (e) { return e.code === code; }
}
async function reserve(state = 'reserved') {
  const op = UUID(), upload = UUID();
  await pool.query(`INSERT INTO workbench_source_custody_ops
    (operation_id, session_id, arranger_id, upload_id, state)
    VALUES ($1,$2,$3,$4,$5)`, [op,sid,uid,upload,state]);
  return { version: 1, operationId: op, memberId: uid, uploadId: upload };
}
(async () => {
  const actual = await pool.query('select current_database() as db');
  if (actual.rows[0].db !== DATABASE) throw new Error('not isolated database');
  // Positive DB finalization in a disposable minimal workbench table, NEVER
  // the shared member test DB or production schema.
  await pool.query(`CREATE TABLE IF NOT EXISTS workbench_uploads (
    id uuid PRIMARY KEY, arranger_id uuid REFERENCES members(id),
    original_name text NOT NULL, mime_type text NOT NULL, size_bytes bigint NOT NULL,
    storage_path text NOT NULL, source_kind text NOT NULL,
    transcription_status text NOT NULL, transcription_draft text,
    transcription_reviewed text, error_message text
  )`);
  folder = await fs.mkdtemp(path.join(os.tmpdir(), 'source-custody-postgres-'));
  await pool.query('INSERT INTO members(id) VALUES ($1)', [uid]);
  await pool.query(`INSERT INTO auth_sessions
    (id,member_id,session_token,expires_at,source_persistence_posture)
    VALUES ($1,$2,$3,now()+interval '1 day','ordinary')`, [sid,uid,fixtureToken]);
  const a = await pool.connect();
  const b = await pool.connect();
  try {
    let intent = await reserve();
    check('pending reservation blocks Sanctuary acknowledgment',
      await expectError(() => pool.query(`UPDATE auth_sessions
        SET source_persistence_posture='sanctuary' WHERE id=$1`,[sid]),'P0001'));
    await pool.query("UPDATE workbench_source_custody_ops SET state='writing' WHERE operation_id=$1",[intent.operationId]);
    check('writing reservation also blocks transition',
      await expectError(() => pool.query(`UPDATE auth_sessions
        SET source_persistence_posture='sanctuary' WHERE id=$1`,[sid]),'P0001'));
    await pool.query("UPDATE workbench_source_custody_ops SET state='recovering' WHERE operation_id=$1",[intent.operationId]);
    check('recovering reservation blocks transition',
      await expectError(() => pool.query(`UPDATE auth_sessions
        SET source_persistence_posture='sanctuary' WHERE id=$1`,[sid]),'P0001'));
    check('cannot lie about a recovering operation being committed',
      await expectError(() => pool.query("UPDATE workbench_source_custody_ops SET state='committed' WHERE operation_id=$1",[intent.operationId]),'23514'));
    await pool.query("UPDATE workbench_source_custody_ops SET state='aborted' WHERE operation_id=$1",[intent.operationId]);
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]);
    check('aborted reservation permits Sanctuary',true);
    check('Sanctuary refuses even a direct new reservation',
      await expectError(() => reserve(),'23514'));
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='ordinary' WHERE id=$1",[sid]);
    await pool.query("UPDATE auth_sessions SET revoked=TRUE WHERE id=$1",[sid]);
    check('revoked session refuses a new custody reservation',
      await expectError(() => reserve(),'23514'));
    await pool.query("UPDATE auth_sessions SET revoked=FALSE, expires_at=now()-interval '1 minute' WHERE id=$1",[sid]);
    check('expired session refuses a new custody reservation',
      await expectError(() => reserve(),'23514'));
    await pool.query("UPDATE auth_sessions SET expires_at=now()+interval '1 day' WHERE id=$1",[sid]);
    check('mismatched member identity refuses a custody reservation',
      await expectError(()=> pool.query(`INSERT INTO workbench_source_custody_ops
      (operation_id,session_id,arranger_id,upload_id) VALUES($1,$2,$3,$4)`,
      [UUID(),sid,UUID(),UUID()]),'23514'));
    // Race 1: pending reservation inserted but uncommitted. The transition
    // waits on the locked session row, then sees the committed reservation.
    await a.query('BEGIN');
    const racing = { operationId:UUID(), uploadId:UUID() };
    await a.query(`INSERT INTO workbench_source_custody_ops
      (operation_id,session_id,arranger_id,upload_id) VALUES ($1,$2,$3,$4)`,
      [racing.operationId,sid,uid,racing.uploadId]);
    let transitionFinished = false;
    const pendingTransition = b.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid])
      .then(() => { transitionFinished=true; return 'unexpected'; },e=>{ transitionFinished=true; return e.code; });
    await new Promise(r=>setTimeout(r,75));
    check('transition cannot acknowledge while reservation commit is in flight',!transitionFinished);
    await a.query('COMMIT');
    check('transition refuses after reservation becomes durable',(await pendingTransition)==='P0001');
    await pool.query("UPDATE workbench_source_custody_ops SET state='aborted' WHERE operation_id=$1",[racing.operationId]);
    // Race 2: Sanctuary acknowledged first means late reservation is denied.
    await a.query('BEGIN');
    await a.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]);
    let reservationDone=false;
    const late = b.query(`INSERT INTO workbench_source_custody_ops
      (operation_id,session_id,arranger_id,upload_id) VALUES ($1,$2,$3,$4)`,
      [UUID(),sid,uid,UUID()]).then(()=>{reservationDone=true;return 'unexpected';},e=>{reservationDone=true;return e.code;});
    await new Promise(r=>setTimeout(r,75));
    check('late reservation waits for privacy transition',!reservationDone);
    await a.query('COMMIT');
    check('late reservation denied after Sanctuary acknowledges',(await late)==='23514');
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='ordinary' WHERE id=$1",[sid]);

    // Combine durable DB reservation and filesystem journal. Simulate process
    // death by discarding the writer's in-memory references, then reconciling
    // solely with the DB reservation + on-disk journal.
    const source = await reserve();
    const { beginSourceCustody, stageSourceCustodyFile, publishStagedSource,
      listSourceCustodyIntents, reconcileSourceCustody } = await import('../../lib/workbench/sourceCustodyFiles.ts');
    await beginSourceCustody(folder, source);
    await stageSourceCustodyFile(folder, source, 'original.txt', Buffer.from('DISPOSABLE TEST CONTENT'));
    await pool.query("UPDATE workbench_source_custody_ops SET state='writing' WHERE operation_id=$1",[source.operationId]);
    await publishStagedSource(folder, source);
    check('published but unconfirmed original blocks Sanctuary',
      await expectError(()=>pool.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]),'P0001'));
    const recovered=(await listSourceCustodyIntents(folder)).find(x=>x.operationId===source.operationId);
    check('filesystem journal survives simulated crash',!!recovered);
    await pool.query("UPDATE workbench_source_custody_ops SET state='recovering' WHERE operation_id=$1",[source.operationId]);
    check('cannot acknowledge Sanctuary while recovering orphan bytes',
      await expectError(()=>pool.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]),'P0001'));
    await reconcileSourceCustody(folder, recovered, 'aborted');
    const stillExists = await fs.stat(path.join(folder,uid,source.uploadId)).then(()=>true,()=>false);
    check('aborted operation physically deletes staged and published bytes',!stillExists);
    await pool.query("UPDATE workbench_source_custody_ops SET state='aborted' WHERE operation_id=$1",[source.operationId]);
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]);
    check('Sanctuary may acknowledge only after cleanup and DB finalization',true);
    if (process.env.DATABASE_URL !== DB_URL) throw new Error('candidate runtime database not pinned to isolated fixture');
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='ordinary' WHERE id=$1",[sid]);
    const proof = await reserve();
    await beginSourceCustody(folder, proof);
    await stageSourceCustodyFile(folder, proof, 'original.txt', Buffer.from('COMMITTED TEST SOURCE'));
    await stageSourceCustodyFile(folder, proof, 'reviewed.txt', Buffer.from('COMMITTED TEST SOURCE'));
    await pool.query("UPDATE workbench_source_custody_ops SET state='writing' WHERE operation_id=$1",[proof.operationId]);
    await publishStagedSource(folder, proof);
    const {finalizeCommittedSource, recoverSourceCustodyFromSettledWriter}=await import('../../lib/workbench/sourceCustodyRuntimeCandidate.ts');
    await finalizeCommittedSource({
      intent:proof, originalName:'fixture.txt', mimeType:'text/plain', sizeBytes:21,
      storagePath:path.join(uid,proof.uploadId,'original.txt'),
      extraction:{kind:'typed_text',status:'reviewed',text:'COMMITTED TEST SOURCE',errorMessage:null},
    });
    const committedRow=await pool.query('SELECT storage_path,transcription_reviewed FROM workbench_uploads WHERE id=$1',[proof.uploadId]);
    check('candidate commits source row and custody terminal state together',
      committedRow.rowCount===1&&committedRow.rows[0].transcription_reviewed==='COMMITTED TEST SOURCE'&&
      (await pool.query('SELECT state FROM workbench_source_custody_ops WHERE operation_id=$1',[proof.operationId])).rows[0].state==='committed');
    await reconcileSourceCustody(folder,proof,'committed');
    check('committed original persists after content-free journal removal',
      (await fs.readFile(path.join(folder,uid,proof.uploadId,'original.txt'),'utf8'))==='COMMITTED TEST SOURCE');
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]);
    check('Sanctuary transition allowed after candidate DB finalization',true);
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='ordinary' WHERE id=$1",[sid]);
    const failed=await reserve();
    await beginSourceCustody(folder,failed);
    await stageSourceCustodyFile(folder,failed,'original.txt',Buffer.from('ROLL BACK CONTENT'));
    await pool.query("UPDATE workbench_source_custody_ops SET state='writing' WHERE operation_id=$1",[failed.operationId]);
    await publishStagedSource(folder,failed);
    let rejected=false;
    try { await finalizeCommittedSource({
      intent:failed, originalName:null,mimeType:'text/plain',sizeBytes:17,
      storagePath:path.join(uid,failed.uploadId,'original.txt'),
      extraction:{kind:'typed_text',status:'reviewed',text:'ROLL BACK CONTENT',errorMessage:null},
    }); } catch(e) { rejected=e.code==='23502'; }
    check('invalid final source metadata rolls back DB transaction',rejected);
    check('failed DB finalization leaves no admitted source row',
      (await pool.query('SELECT id FROM workbench_uploads WHERE id=$1',[failed.uploadId])).rowCount===0);
    check('DB rollback leaves pending source reservation',
      (await pool.query('SELECT state FROM workbench_source_custody_ops WHERE operation_id=$1',[failed.operationId])).rows[0].state==='writing');
    await recoverSourceCustodyFromSettledWriter(folder,failed);
    check('recovery deletes uncommitted original after failed DB transaction',
      !(await fs.stat(path.join(folder,uid,failed.uploadId)).then(()=>true,()=>false)));
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]);
    check('recovery releases Sanctuary only after durable filesystem cleanup',true);
    // Actual candidate pipeline, with a verified synthetic session and the
    // same PostgreSQL and filesystem adapters the candidate would use.
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='ordinary' WHERE id=$1",[sid]);
    const {NextRequest}=await import('next/server');
    const {ingestSourceWithCustodyCandidate}=await import('../../lib/workbench/sourceCustodyIngestCandidate.ts');
    const {sourceCustodyCandidatePorts}=await import('../../lib/workbench/sourceCustodyRuntimeCandidate.ts');
    const candidateRequest=new NextRequest('http://localhost/api/writers-studio/sources',{
      method:'POST',headers:{'x-session-token':fixtureToken},
    });
    const body='END TO END CUSTODY TEST';
    const sample=new File([Buffer.from(body)],'full-walk.md',{type:'text/markdown'});
    const full=await ingestSourceWithCustodyCandidate(candidateRequest,uid,sample,folder,sourceCustodyCandidatePorts);
    const completed=(await pool.query('SELECT transcription_status,transcription_reviewed FROM workbench_uploads WHERE id=$1',[full.id])).rows[0];
    check('full candidate intake finalizes reviewed row and preserves member text',
      full.transcriptionStatus==='reviewed'&&completed?.transcription_reviewed===body);
    check('full candidate intake publishes correct canonical original',
      (await fs.readFile(path.join(folder,uid,full.id,'original.md'),'utf8'))===body);
    check('full candidate intake terminates DB reservation',
      (await pool.query('SELECT state FROM workbench_source_custody_ops WHERE upload_id=$1',[full.id])).rows[0].state==='committed');
    await pool.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary' WHERE id=$1",[sid]);
    check('Sanctuary can acknowledge after complete positive intake',true);
    let sanctuaryRefused=false;
    try { await ingestSourceWithCustodyCandidate(candidateRequest,uid,
      new File([Buffer.from('DENIED')],'denied.md',{type:'text/markdown'}),folder,sourceCustodyCandidatePorts); }
    catch(e) { sanctuaryRefused=e.code==='23514'; }
    check('full candidate intake refuses new content during confirmed Sanctuary',sanctuaryRefused);
    console.log(`RESULT ${passed} checks passed`);
  } finally { a.release(); b.release(); }
})().catch(e => { console.error('CUSTODY_VERIFICATION_FAILED', e.code || e.message); process.exitCode=1; })
.finally(async()=>{
  try { await pool.query('DELETE FROM workbench_source_custody_ops WHERE session_id=$1',[sid]);
        await pool.query('DELETE FROM workbench_uploads WHERE arranger_id=$1',[uid]);
        await pool.query('DELETE FROM auth_sessions WHERE id=$1',[sid]);
        await pool.query('DELETE FROM members WHERE id=$1',[uid]); }
  catch(e) { console.error('CUSTODY_FIXTURE_CLEANUP_FAILED',e.code||e.message);process.exitCode=1; }
  await pool.end();
  if(folder) await fs.rm(folder,{recursive:true,force:true});
});
