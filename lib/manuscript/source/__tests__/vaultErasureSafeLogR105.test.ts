import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {
 R105_REAL_ERASURE_WORKER_REHOME_ENABLED,
 storedVaultErasureErrnoR105,vaultErasureErrnoR105,
 safeVaultAttemptCountR105,
} from '../vaultErasureSafeLogR105';
const src=(name:string)=>readFileSync(join(process.cwd(),name),'utf8');
describe('R105 source-custody deletion logs: errno/counts, not filenames or prose',()=>{
 it('a conventional filesystem errno is useful without a raw Error object',()=>{
  for(const value of ['EACCES','EPERM','EROFS','ENOSPC','EIO','ESTILLPRESENT'])
   expect(vaultErasureErrnoR105({code:value,message:'/fake/private/writer/file.docx'}))
    .toBe(value);
 });
 it('arbitrary path, note, stack or forged error code cannot reach a log',()=>{
  const privateMarker='/fake/personal/source-document.docx FULL_PRIVATE_PROSE';
  for(const failure of [
   {code:privateMarker,message:privateMarker},
   {code:'PASSWORD',message:privateMarker},
   new Error(privateMarker),{message:privateMarker},
   privateMarker,null,undefined,
  ]){
   const result=vaultErasureErrnoR105(failure);
   expect(result).toBe('UNKNOWN');
   expect(result).not.toContain(privateMarker);
  }
 });
 it('known stuck-source errno is categorized without returning the message',()=>{
  const e={message:'full path private text still present'};
  expect(vaultErasureErrnoR105(e)).toBe('ESTILLPRESENT');
 });
 it('previously persisted malicious last_error values and counters are masked',()=>{
  expect(storedVaultErasureErrnoR105('EACCES')).toBe('EACCES');
  expect(storedVaultErasureErrnoR105('/private/secrets/manuscript.md'))
   .toBe('UNKNOWN');
  expect(storedVaultErasureErrnoR105('USER_NAME')).toBe('UNKNOWN');
  expect(safeVaultAttemptCountR105(2)).toBe(2);
  for(const value of [-1,1.2,1e99,'2',undefined])
   expect(safeVaultAttemptCountR105(value)).toBe(0);
 });
 it('real deletion-consumer relocation remains HOLD, since current media worker runs it',()=>{
  expect(R105_REAL_ERASURE_WORKER_REHOME_ENABLED).toBe(false);
  const worker=src('scripts/run-media-worker.ts');
  expect(worker).toContain('import { sweepVaultErasureQueue }');
  expect(worker).toContain('VAULT_ERASURE_EVERY_N_LOOPS');
  expect(worker).toContain('finally {');
  expect(worker).toContain('await runVaultErasureStep()');
  const review=src('docs/ops/WS_R104_LIVE_R20_COMPOSE_CONFINEMENT_REVIEW_20261023.md');
  expect(review).toContain('media-worker functional smoke test');
 });
 it('the durable erasure queue remains owed until the vault deletion succeeds',()=>{
  const code=src('lib/manuscript/source/eraseManuscript.ts');
  const start=code.indexOf('export async function sweepVaultErasureQueue');
  const destroy=code.indexOf('await destroyVaultBytes(row.artifact_ref)',start);
  const remove=code.indexOf('DELETE FROM vault_erasure_queue WHERE id',start);
  const keep=code.indexOf('UPDATE vault_erasure_queue',start);
  expect(destroy).toBeGreaterThan(start);
  expect(remove).toBeGreaterThan(destroy);
  expect(keep).toBeGreaterThan(remove);
  expect(code).toContain('vaultErasureErrnoR105(err)');
  expect(code).not.toContain("console.error('[MAIA/press] vault erasure still owed', row.artifact_ref, err)");
 });
 it('media worker and standalone sweeper never print paths or raw errors',()=>{
  const worker=src('scripts/run-media-worker.ts');
  const independent=src('scripts/ops/sweep-vault-erasure-queue.ts');
  expect(worker).not.toContain('will retry):\', error');
  expect(worker).toContain('vaultErasureErrnoR105(error)');
  expect(independent).toContain('SELECT attempts, last_error FROM vault_erasure_queue');
  expect(independent).not.toContain('SELECT artifact_ref, attempts, last_error');
  expect(independent).not.toContain('${row.artifact_ref}');
  expect(independent).not.toContain("console.error('vault erasure sweep failed:', err)");
  expect(independent).toContain('safeVaultAttemptCountR105');
  expect(independent).toContain('storedVaultErasureErrnoR105');
 });
});
