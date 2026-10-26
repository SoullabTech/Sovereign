import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const text=(s:string)=>readFileSync(join(process.cwd(),s),'utf8');
const pg=text('scripts/ops/wsBetaR106PhysicalOwedErasurePG16.py');
const reader=text('scripts/ops/wsBetaR106FictionalErasureProbe.ts');
const scheduler=text('scripts/ops/wsBetaR106FictionalPeriodicConsumer.cjs');
const actual=text('lib/manuscript/source/eraseManuscript.ts');
const cli=text('scripts/ops/sweep-vault-erasure-queue.ts');

describe('R106 autonomous fictional owed-erasure restart — not a production release',()=>{
 it('default-off scheduler cannot be run without exact private fictional marker',()=>{
  const r=spawnSync('node',[
   join(process.cwd(),'scripts/ops/wsBetaR106FictionalPeriodicConsumer.cjs')
  ],{env:{PATH:process.env.PATH||'/usr/bin:/bin',NODE_ENV:'test'},
     encoding:'utf8',timeout:3000});
  expect(r.status).toBe(3);
  expect(r.stderr).toContain('R106_SCHEDULER_REFUSED_DEFAULT_OFF');
 });
 it('all fake PostgreSQL and filesystem paths are strictly guarded',()=>{
  expect(pg).toContain('WS_R106_ERASURE_FIXTURE');
  expect(pg).toContain('ws_r106');
  expect(pg).toContain('ws-r106-fictional-');
  expect(pg).toContain('no_parallel_supervisor');
  expect(pg).toContain('owned_pg16_removed');
  expect(pg).toContain('all_owned_synthetic_vault_bytes_removed');
  expect(pg).toContain('WS_R106_EXPECTED_HEAD');
  expect(pg).toContain('clean_exact_candidate_worktree');
  expect(pg).toContain("FOLDER.parent==Path(\"/private/tmp\")");
  expect(reader).toContain("refuse('UNTRUSTED_SCOPE')");
  expect(scheduler).toContain("WS_R106_ERASURE_FIXTURE==='fictional-only'");
  expect(scheduler).toContain("R106_FICTIONAL_ONLY.marker");
 });
 it('test consumer cannot access member tables, add new queue rows, or elevate',()=>{
  expect(pg).toContain('CREATE ROLE ws_r106_eraser LOGIN INHERIT NOSUPERUSER');
  expect(pg).toContain('GRANT SELECT, DELETE ON vault_erasure_queue TO ws_r106_eraser');
  expect(pg).toContain('GRANT UPDATE (attempts,last_attempt_at,last_error)');
  expect(pg).toContain('worker_cannot_insert_owed_rows');
  expect(pg).toContain('worker_cannot_read_unrelated_data');
  expect(pg).toContain('worker_cannot_elevate_to_DB_owner');
  expect(pg).toContain('worker_cannot_change_schema');
  expect(pg).toContain("for k in (\"PATH\",\"LANG\",\"HOME\",\"TMPDIR\")");
 });
 it('physical failure retains queued row before an independent scheduled retry',()=>{
  const first=pg.indexOf('first=command(');
  const survive=pg.indexOf('failed=run_probe("failed",port)');
  const start=pg.indexOf('start_supervisor(port)',survive);
  const stop=pg.indexOf('end_supervisor()',start);
  const restart=pg.indexOf('start_supervisor(port)',stop);
  const repair=pg.indexOf('repaired=run_probe("repair",port)',restart);
  const admitted=pg.indexOf('R106_FICTIONAL_AUTONOMOUS_CLEAR',repair);
  const proved=pg.indexOf('recovered=run_probe("recovered",port)',admitted);
  expect(first).toBeGreaterThan(0);
  expect(survive).toBeGreaterThan(first);
  expect(start).toBeGreaterThan(survive);
  expect(stop).toBeGreaterThan(start);
  expect(restart).toBeGreaterThan(stop);
  expect(repair).toBeGreaterThan(restart);
  expect(proved).toBeGreaterThan(admitted);
  expect(reader).toContain('await link(file(),extra())');
  expect(reader).toContain('await unlink(extra())');
  expect(reader).toContain('unrelatedSentinelPreserved=true');
 });
 it('real source clears the queue only AFTER durable unlink; errors are redacted',()=>{
  const start=actual.indexOf('export async function sweepVaultErasureQueue');
  const unlink=actual.indexOf('await destroyVaultBytes(row.artifact_ref)',start);
  const remove=actual.indexOf('DELETE FROM vault_erasure_queue WHERE id',unlink);
  const refuse=actual.indexOf('UPDATE vault_erasure_queue',remove);
  expect(unlink).toBeGreaterThan(start);
  expect(remove).toBeGreaterThan(unlink);
  expect(refuse).toBeGreaterThan(remove);
  expect(actual).toContain('vaultErasureErrnoR105(err)');
  expect(cli).toContain('storedVaultErasureErrnoR105');
  expect(cli).not.toContain('SELECT artifact_ref, attempts, last_error');
  expect(scheduler).not.toContain('crontab');
  expect(scheduler).not.toContain('maia-postgres');
 });
});
