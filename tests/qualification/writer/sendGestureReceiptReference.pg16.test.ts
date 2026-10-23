/**
 * Runtime environment: Jest node (from repository jest.config.js).
 * Class A Writer Gate 3 — positive PostgreSQL16 SEND receipt REFERENCE,
 * not production runtime/migration/real provider, and not a source approval.
 * Only a fresh fixed GitHub localhost fictional DB may be contacted.
 * This deliberately does not import the Writer app, auth, SDK or R20.
 */
import type { Pool, PoolClient } from 'pg';
import { spawnSync } from 'node:child_process';

const FIXED_URL = 'postgresql://fictional_writer_qa:fictional_only@127.0.0.1:5432/fictional_writer_gesture_qa';
const FLAG = 'WRITER_SEND_REFERENCE_PG16_QA';
const enabled = process.env[FLAG] === 'TRUE_EXPLICIT_TEST_ONLY'
  && process.env.DATABASE_URL === FIXED_URL
  && process.env.GITHUB_ACTIONS === 'true';
if (process.env[FLAG] !== undefined && !enabled)
  throw new Error('REVIEW_DB_GUARD_REFUSED_BEFORE_IMPORT');
const suite = enabled ? describe : describe.skip;
let pool: Pool | undefined;

const MEMBER='11111111-1111-4111-8111-111111111111';
const OTHER ='22222222-2222-4222-8222-222222222222';
const WORK  ='33333333-3333-4333-8333-333333333333';
const MANU  ='44444444-4444-4444-8444-444444444444';
const A2    ='55555555-5555-4555-8555-555555555555';
const EPOCH ='66666666-6666-4666-8666-666666666666';
const THREAD='77777777-7777-4777-8777-777777777777';
const KEY1  ='88888888-8888-4888-8888-888888888888';
const KEY2  ='99999999-9999-4999-8999-999999999999';
const WORDS ='FICTIONAL_ONLY_AUTHOR_WORDS_NOT_MEMBER_TEXT';

type Scope = { latitude: number; mayRemoveParagraphs: boolean };
type Gesture = {
  memberId:string; workId:string; manuscriptId:string;
  a2Id:string; creationEpochId:string; threadId:string; gestureId:string;
  actKind:'discourse'; body:string; refersTo:string|null; scope:Scope;
};
const gesture=(v:Partial<Gesture>={}):Gesture=>({
  memberId:MEMBER,workId:WORK,manuscriptId:MANU,
  a2Id:A2,creationEpochId:EPOCH,threadId:THREAD,gestureId:KEY1,
  actKind:'discourse',body:WORDS,refersTo:null,
  scope:{latitude:1,mayRemoveParagraphs:false},...v
});
type Admission={kind:'created'|'replay',turnIndex:number,state:'ready'|'attempted_unknown'}
  |{kind:'unauthorized'|'gesture_conflict'};
const schema='writer_send_reference';

/** Separate content-free gesture receipt. Identity checked BEFORE receipt read. */
async function admit(input:Gesture,abortAfterAuthorInsert=false):Promise<Admission>{
  if(!pool)throw Error('REFERENCE_POOL_ABSENT');
  const tx:PoolClient=await pool.connect();
  try{
    await tx.query('BEGIN');
    await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
      [input.memberId+':'+input.gestureId]);
    // Thread row is also locked, so DIFFERENT new gestures cannot collide on index.
    const authorized=await tx.query(
      'SELECT id FROM writer_send_reference.threads WHERE id=$1 AND member_id=$2 '+
      'AND work_id=$3 AND manuscript_id=$4 AND a2_id=$5 AND epoch_id=$6 FOR UPDATE',
      [input.threadId,input.memberId,input.workId,input.manuscriptId,input.a2Id,input.creationEpochId]);
    if(authorized.rowCount!==1){await tx.query('ROLLBACK');return{kind:'unauthorized'};}
    const previous=await tx.query(
      'SELECT thread_id,turn_index,work_id,manuscript_id,a2_id,epoch_id,state '+
      'FROM writer_send_reference.gesture_receipts WHERE member_id=$1 AND gesture_id=$2 FOR UPDATE',
      [input.memberId,input.gestureId]);
    if(previous.rowCount){
      const row=previous.rows[0]!;
      const originMatches=row.thread_id===input.threadId && row.work_id===input.workId
        && row.manuscript_id===input.manuscriptId && row.a2_id===input.a2Id
        && row.epoch_id===input.creationEpochId;
      let actMatches=false;
      if(originMatches){
        // Compare private author text ONLY to the canonical stored author act
        // with parameterized SQL; the public receipt itself stores NO prose/hash.
        const canonical=await tx.query(
          'SELECT body=$3 AS text_equal, kind=$4 AS kind_equal, '+
          'refers_to IS NOT DISTINCT FROM $5 AS reference_equal, '+
          'scope=$6::jsonb AS scope_equal '+
          'FROM writer_send_reference.author_acts WHERE thread_id=$1 AND turn_index=$2',
          [input.threadId,row.turn_index,input.body,input.actKind,
           input.refersTo,JSON.stringify(input.scope)]);
        const c=canonical.rows[0];
        actMatches=canonical.rowCount===1 && c.text_equal===true
          && c.kind_equal===true && c.reference_equal===true && c.scope_equal===true;
      }
      if(!originMatches || !actMatches){
        await tx.query('ROLLBACK');return{kind:'gesture_conflict'};
      }
      await tx.query('COMMIT');
      return {kind:'replay',turnIndex:row.turn_index,state:row.state};
    }
    const next=await tx.query(
      'UPDATE writer_send_reference.threads SET next_index=next_index+1 '+
      'WHERE id=$1 RETURNING next_index-1 AS idx',[input.threadId]);
    const turnIndex=next.rows[0]!.idx as number;
    await tx.query(
      'INSERT INTO writer_send_reference.author_acts '+
      '(thread_id,turn_index,member_id,kind,body,refers_to,scope) '+
      'VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)',
      [input.threadId,turnIndex,input.memberId,input.actKind,
       input.body,input.refersTo,JSON.stringify(input.scope)]);
    if(abortAfterAuthorInsert)throw Error('FICTIONAL_ABORT_BEFORE_RECEIPT');
    await tx.query(
      'INSERT INTO writer_send_reference.gesture_receipts '+
      '(member_id,gesture_id,thread_id,turn_index,work_id,manuscript_id,a2_id,epoch_id,state) '+
      "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ready')",
      [input.memberId,input.gestureId,input.threadId,turnIndex,
       input.workId,input.manuscriptId,input.a2Id,input.creationEpochId]);
    await tx.query('COMMIT');
    return {kind:'created',turnIndex,state:'ready'};
  }catch(e){await tx.query('ROLLBACK');throw e;}
  finally{tx.release();}
}

/**
 * At-most-one DISPATCH CLAIM, not actual provider transmission.
 * Claim becomes attempted_unknown BEFORE potential external I/O.
 * Crash between claim and transport sacrifices liveness, not writer privacy.
 * Neither a replay nor a restarted process is authorized to send again.
 */
async function claimDispatchOnce(input:Gesture):Promise<boolean>{
  if(!pool)throw Error('REFERENCE_POOL_ABSENT');
  const tx=await pool.connect();
  try{
    await tx.query('BEGIN');
    const owned=await tx.query(
      'SELECT id FROM writer_send_reference.threads WHERE id=$1 AND member_id=$2 '+
      'AND work_id=$3 AND manuscript_id=$4 AND a2_id=$5 AND epoch_id=$6 FOR UPDATE',
      [input.threadId,input.memberId,input.workId,input.manuscriptId,input.a2Id,input.creationEpochId]);
    if(owned.rowCount!==1){await tx.query('ROLLBACK');return false;}
    // Even a claim to call an external service must revalidate the canonical
    // ORIGINAL authored act. An attacker or stale caller may know a gesture
    // UUID without possessing its author text/scope. No untrusted retry payload
    // can consume a receipt or trigger a provider attempt.
    const q=await tx.query(
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
      [input.memberId,input.gestureId,input.threadId,input.a2Id,
       input.creationEpochId,input.workId,input.manuscriptId,
       input.body,input.actKind,input.refersTo,JSON.stringify(input.scope)]);
    await tx.query('COMMIT');
    return q.rowCount===1;
  }catch(e){await tx.query('ROLLBACK');throw e;}
  finally{tx.release();}
}

async function counts(){
  if(!pool)throw Error('REFERENCE_POOL_ABSENT');
  const r=await pool.query(
    'SELECT (SELECT count(*)::int FROM writer_send_reference.author_acts) acts, '+
    '(SELECT count(*)::int FROM writer_send_reference.gesture_receipts) receipts, '+
    "(SELECT count(*)::int FROM writer_send_reference.gesture_receipts WHERE state='attempted_unknown') attempted");
  return r.rows[0] as {acts:number;receipts:number;attempted:number};
}

suite('test-only PG16 durable Send gesture receipt reference (NO app/source integration)',()=>{
  beforeAll(async()=>{
    // Dynamic module loading occurs only after explicit fixed QA environment.
    if(!enabled)throw Error('REVIEW_DB_GUARD_REFUSED');
    const {Pool:PgPool}=require('pg') as typeof import('pg');
    pool=new PgPool({connectionString:FIXED_URL,ssl:false,max:6,connectionTimeoutMillis:3500});
    const identity=await pool.query(
      'SELECT current_database() db, current_user db_user, inet_server_addr()::text address');
    expect(identity.rows[0].db).toBe('fictional_writer_gesture_qa');
    expect(identity.rows[0].db_user).toBe('fictional_writer_qa');
    expect(identity.rows[0].address).toEqual(expect.any(String));
    await pool.query('CREATE SCHEMA writer_send_reference');
    await pool.query('CREATE TABLE writer_send_reference.threads ('+
      'id uuid PRIMARY KEY,member_id uuid NOT NULL,work_id uuid NOT NULL,'+
      'manuscript_id uuid NOT NULL,a2_id uuid NOT NULL,epoch_id uuid NOT NULL,'+
      'next_index integer NOT NULL DEFAULT 0)');
    await pool.query('CREATE TABLE writer_send_reference.author_acts ('+
      'thread_id uuid NOT NULL REFERENCES writer_send_reference.threads(id),'+
      'turn_index integer NOT NULL,member_id uuid NOT NULL,'+
      "kind text NOT NULL CHECK(kind='discourse'),body text NOT NULL,"+
      'refers_to text,scope jsonb NOT NULL,PRIMARY KEY(thread_id,turn_index))');
    await pool.query('CREATE TABLE writer_send_reference.gesture_receipts ('+
      'member_id uuid NOT NULL,gesture_id uuid NOT NULL,'+
      'thread_id uuid NOT NULL,turn_index integer NOT NULL,'+
      'work_id uuid NOT NULL,manuscript_id uuid NOT NULL,'+
      'a2_id uuid NOT NULL,epoch_id uuid NOT NULL,'+
      "state text NOT NULL CHECK(state IN ('ready','attempted_unknown')),"+
      'claimed_at timestamptz,PRIMARY KEY(member_id,gesture_id),'+
      'UNIQUE(thread_id,turn_index),FOREIGN KEY(thread_id,turn_index) '+
      'REFERENCES writer_send_reference.author_acts(thread_id,turn_index))');
  });

  beforeEach(async()=>{
    if(!pool)throw Error('REFERENCE_POOL_ABSENT');
    await pool.query('TRUNCATE writer_send_reference.gesture_receipts,'+
      'writer_send_reference.author_acts,writer_send_reference.threads CASCADE');
    await pool.query('INSERT INTO writer_send_reference.threads '+
      '(id,member_id,work_id,manuscript_id,a2_id,epoch_id) VALUES ($1,$2,$3,$4,$5,$6)',
      [THREAD,MEMBER,WORK,MANU,A2,EPOCH]);
  });
  afterAll(async()=>{
    if(pool){
      await pool.query('DROP SCHEMA writer_send_reference CASCADE');
      await pool.end();
      pool=undefined;
    }
  });

  test('sequential transport replay: one author act, one receipt, one outbound CLAIM',async()=>{
    const input=gesture();
    expect(await admit(input)).toMatchObject({kind:'created',turnIndex:0});
    expect(await claimDispatchOnce(input)).toBe(true);
    expect(await admit(input)).toMatchObject({
      kind:'replay',turnIndex:0,state:'attempted_unknown'});
    expect(await claimDispatchOnce(input)).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
  });

  test('concurrent identical gesture: one created, one replay, only one claim',async()=>{
    const input=gesture();
    const a=await Promise.all([admit(input),admit(input)]);
    expect(a.map(x=>x.kind).sort()).toEqual(['created','replay']);
    const claims=await Promise.all([claimDispatchOnce(input),claimDispatchOnce(input)]);
    expect(claims.sort()).toEqual([false,true]);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
  });

  test('TWO deliberate gestures with same wording remain TWO author acts',async()=>{
    expect((await admit(gesture({gestureId:KEY1}))).kind).toBe('created');
    expect((await admit(gesture({gestureId:KEY2}))).kind).toBe('created');
    const rows=await pool!.query(
      'SELECT turn_index,body FROM writer_send_reference.author_acts ORDER BY turn_index');
    expect(rows.rows).toEqual([{turn_index:0,body:WORDS},{turn_index:1,body:WORDS}]);
    expect(await counts()).toEqual({acts:2,receipts:2,attempted:0});
  });

  test('concurrent DIFFERENT gestures on one thread get two unique turn indexes',async()=>{
    const results=await Promise.all([
      admit(gesture({gestureId:KEY1})),admit(gesture({gestureId:KEY2}))]);
    expect(results.map(x=>x.kind)).toEqual(['created','created']);
    expect(results.map(x=>'turnIndex' in x?x.turnIndex:-1).sort()).toEqual([0,1]);
    expect(await counts()).toEqual({acts:2,receipts:2,attempted:0});
  });

  test('reused key with changed author prose is fixed conflict and creates no new act',async()=>{
    expect((await admit(gesture())).kind).toBe('created');
    expect(await admit(gesture({body:'FICTIONAL_ALTERNATE_AUTHOR_WORDS'})))
      .toEqual({kind:'gesture_conflict'});
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
  });

  test('reused key with changed scope is fixed conflict',async()=>{
    expect((await admit(gesture())).kind).toBe('created');
    expect(await admit(gesture({scope:{latitude:3,mayRemoveParagraphs:false}})))
      .toEqual({kind:'gesture_conflict'});
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
  });

  test.each([
    {memberId:OTHER},{workId:OTHER},{manuscriptId:OTHER},
    {a2Id:OTHER},{creationEpochId:OTHER},{threadId:OTHER}
  ])('wrong member, Work, manuscript, A2, epoch or thread cannot inspect or persist',async scope=>{
    expect(await admit(gesture(scope))).toEqual({kind:'unauthorized'});
    expect(await counts()).toEqual({acts:0,receipts:0,attempted:0});
  });

  test('outbound claim cannot be consumed by a changed author text or scope',async()=>{
    const input=gesture();
    expect((await admit(input)).kind).toBe('created');
    expect(await claimDispatchOnce(gesture({body:'FICTIONAL_DIFFERENT_TEXT'}))).toBe(false);
    expect(await claimDispatchOnce(gesture({
      scope:{latitude:3,mayRemoveParagraphs:true}
    }))).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
    expect(await claimDispatchOnce(input)).toBe(true);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
  });

  test('knowing a gesture UUID does not permit a mismatched Work/A2/epoch claim',async()=>{
    const input=gesture();
    expect((await admit(input)).kind).toBe('created');
    expect(await claimDispatchOnce(gesture({workId:OTHER}))).toBe(false);
    expect(await claimDispatchOnce(gesture({a2Id:OTHER}))).toBe(false);
    expect(await claimDispatchOnce(gesture({creationEpochId:OTHER}))).toBe(false);
    expect(await claimDispatchOnce(gesture({memberId:OTHER}))).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
  });

  test('declared Work epoch change invalidates old receipt access and claim',async()=>{
    const input=gesture();
    expect((await admit(input)).kind).toBe('created');
    await pool!.query('UPDATE writer_send_reference.threads SET epoch_id=$2 WHERE id=$1',
      [THREAD,OTHER]);
    expect(await admit(input)).toEqual({kind:'unauthorized'});
    expect(await claimDispatchOnce(input)).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
  });

  test('an exception after act insert but before receipt rolls back both',async()=>{
    await expect(admit(gesture(),true)).rejects.toThrow('FICTIONAL_ABORT_BEFORE_RECEIPT');
    expect(await counts()).toEqual({acts:0,receipts:0,attempted:0});
    expect((await admit(gesture())).kind).toBe('created');
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
  });

  test('claimed yet transport-unknown request NEVER automatically reclaims on replay',async()=>{
    const input=gesture();
    expect((await admit(input)).kind).toBe('created');
    expect(await claimDispatchOnce(input)).toBe(true);
    const onRestart=await admit(input);
    expect(onRestart).toMatchObject({kind:'replay',state:'attempted_unknown'});
    expect(await claimDispatchOnce(input)).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
  });

  test('receipt has content-free facts only; protected act holds source prose',async()=>{
    expect((await admit(gesture())).kind).toBe('created');
    const columns=await pool!.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema='writer_send_reference' "+
      "AND table_name='gesture_receipts' ORDER BY ordinal_position");
    const names=columns.rows.map(x=>x.column_name);
    expect(names).not.toContain('body');
    expect(names).not.toContain('body_hash');
    const receipt=await pool!.query('SELECT * FROM writer_send_reference.gesture_receipts');
    expect(JSON.stringify(receipt.rows)).not.toContain(WORDS);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
  });

  /**
   * Genuine process termination, rather than a same-process receipt readback.
   * The child runs an equivalent fictional PG outbound claim under the exact
   * guarded QA database, then exits without closing its pg.Client.
   * These prove PostgreSQL transaction durability/rollback, not the real
   * application's crash lifecycle or actual network delivery.
   */
  test('separate process crashes AFTER COMMIT: claimed state survives reopening and cannot resend',async()=>{
    const input=gesture();
    expect((await admit(input)).kind).toBe('created');
    const child=spawnSync(
      process.execPath,
      [require.resolve('./sendGestureCrashChild.review.cjs'),'after_commit'],
      {cwd:process.cwd(),env:process.env,encoding:'utf8',timeout:12000}
    );
    expect(child.error).toBeUndefined();
    expect(child.status).toBe(73);
    expect(child.stdout).not.toContain(WORDS);
    expect(child.stderr).not.toContain(WORDS);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
    expect(await admit(input)).toMatchObject({
      kind:'replay',turnIndex:0,state:'attempted_unknown'
    });
    expect(await claimDispatchOnce(input)).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
  });

  test('separate process crashes BEFORE COMMIT: PG rolls back claim and permits ONE later claim',async()=>{
    const input=gesture();
    expect((await admit(input)).kind).toBe('created');
    const child=spawnSync(
      process.execPath,
      [require.resolve('./sendGestureCrashChild.review.cjs'),'before_commit'],
      {cwd:process.cwd(),env:process.env,encoding:'utf8',timeout:12000}
    );
    expect(child.error).toBeUndefined();
    expect(child.status).toBe(72);
    expect(child.stdout).not.toContain(WORDS);
    expect(child.stderr).not.toContain(WORDS);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
    expect(await claimDispatchOnce(input)).toBe(true);
    expect(await claimDispatchOnce(input)).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
  });

  test('separate process dies BEFORE author+receipt COMMIT: no partial act or increment survives',async()=>{
    const input=gesture();
    const child=spawnSync(
      process.execPath,
      [require.resolve('./sendGestureCrashChild.review.cjs'),'author_before_commit'],
      {cwd:process.cwd(),env:process.env,encoding:'utf8',timeout:12000}
    );
    expect(child.error).toBeUndefined();
    expect(child.status).toBe(75);
    expect(child.stdout).not.toContain(WORDS);
    expect(child.stderr).not.toContain(WORDS);
    expect(await counts()).toEqual({acts:0,receipts:0,attempted:0});
    const index=await pool!.query('SELECT next_index FROM writer_send_reference.threads WHERE id=$1',[THREAD]);
    expect(index.rows[0].next_index).toBe(0);
    expect(await admit(input)).toMatchObject({kind:'created',turnIndex:0,state:'ready'});
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
  });

  test('separate process dies AFTER author+receipt COMMIT: matching replay cannot create second act',async()=>{
    const input=gesture();
    const child=spawnSync(
      process.execPath,
      [require.resolve('./sendGestureCrashChild.review.cjs'),'author_after_commit'],
      {cwd:process.cwd(),env:process.env,encoding:'utf8',timeout:12000}
    );
    expect(child.error).toBeUndefined();
    expect(child.status).toBe(76);
    expect(child.stdout).not.toContain(WORDS);
    expect(child.stderr).not.toContain(WORDS);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:0});
    expect(await admit(input)).toMatchObject({kind:'replay',turnIndex:0,state:'ready'});
    const index=await pool!.query('SELECT next_index FROM writer_send_reference.threads WHERE id=$1',[THREAD]);
    expect(index.rows[0].next_index).toBe(1);
    expect(await claimDispatchOnce(input)).toBe(true);
    expect(await claimDispatchOnce(input)).toBe(false);
    expect(await counts()).toEqual({acts:1,receipts:1,attempted:1});
  });
});
