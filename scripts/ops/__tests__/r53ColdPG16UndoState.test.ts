/** R47 fresh Node process, forced PostgreSQL restart, SQL-only custody.
 * Does NOT assert private-key restore, a real signed author click, or KMS.
 */
import {query,closePool} from '@/lib/db/postgres';
const enabled=process.env.R47_COLD_PG16==='fictional-only'&&
 process.env.R47_DURABLE_UNDO_FIXTURE==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
  process.env.DATABASE_URL||'');
const run=enabled?describe:describe.skip;
const W12='33333333-3333-4333-8333-33333333333b';
const W14='33333333-3333-4333-8333-33333333333d';
const W15='33333333-3333-4333-8333-33333333333e';
const W16='33333333-3333-4333-8333-33333333333f';
run('R47 consumed Undo tokens and encrypted revision manifests after forced PG restart',()=>{
 afterAll(async()=>{await closePool();});
 it('still runs on disposable PostgreSQL 16',async()=>{
  const r=await query<{server_version_num:string}>('SHOW server_version_num');
  expect(Number(r.rows[0].server_version_num)).toBeGreaterThanOrEqual(160000);
  expect(Number(r.rows[0].server_version_num)).toBeLessThan(170000);
 });
 it('exactly four Undo attempts remain SPENT, no pending tokens revived',async()=>{
  const r=await query<{state:string;n:string}>(`
   SELECT state,count(*)::text AS n
   FROM writers_studio_r47_held_undo GROUP BY state`);
  expect(r.rows).toEqual([{state:'spent',n:'4'}]);
 });
 it('retains the original and all encrypted Apply/Undo manifest generations',async()=>{
  const expected=[
   {workId:W12,actions:['start','save','restore'],head:3},
   {workId:W14,actions:['start','save'],head:2},
   {workId:W15,actions:['start','save'],head:2},
   {workId:W16,actions:['start','save','restore'],head:3},
  ];
  for(const e of expected){
   const v=await query<{action:string}>(`
    SELECT action FROM writers_studio_r35_draft_versions
    WHERE work_id=$1 ORDER BY generation`,[e.workId]);
   expect(v.rows.map(r=>r.action)).toEqual(e.actions);
   const head=await query<{generation:string|number}>(`
    SELECT generation FROM writers_studio_r35_draft_heads
    WHERE work_id=$1`,[e.workId]);
   expect(Number(head.rows[0].generation)).toBe(e.head);
  }
 });
 it('a SPENT Undo cannot be claimed a second time after restart',async()=>{
  const row=await query<{token_hmac:string}>(`
   SELECT token_hmac FROM writers_studio_r47_held_undo WHERE work_id=$1
   AND state='spent'`,[W12]);
  expect(row.rows).toHaveLength(1);
  const after=await query(`
   UPDATE writers_studio_r47_held_undo SET state='spent',
   spent_at_ms=spent_at_ms
   WHERE token_hmac=$1 AND state='prepared' RETURNING token_hmac`,
   [row.rows[0].token_hmac]);
  expect(after.rows).toHaveLength(0);
 });
 it('DB triggers forbid any rollback or deletion of Undo authorization',async()=>{
  await expect(query(`
   UPDATE writers_studio_r47_held_undo SET state='prepared'
   WHERE work_id=$1`,[W12])).rejects.toBeTruthy();
  await expect(query(`
   DELETE FROM writers_studio_r47_held_undo WHERE work_id=$1`,
   [W12])).rejects.toBeTruthy();
 });
 it('approval SQL records remain metadata-only',async()=>{
  const rows=await query('SELECT * FROM writers_studio_r47_held_undo');
  const plain=JSON.stringify(rows.rows);
  for(const marker of [
   'R38 first fictional section','first enchanted','first sparkling',
   'r47_undo_attempt_token_raw','fictional-r39-apply-repeat-001',
  ])expect(plain).not.toContain(marker);
 });
});
