import {query} from '@/lib/db/postgres';
import {destroyVaultBytes} from '@/lib/storage/fileVault';
import {sweepVaultErasureQueue} from '../eraseManuscript';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn(),transaction:jest.fn()}));
jest.mock('@/lib/storage/fileVault',()=>({destroyVaultBytes:jest.fn()}));
const queries=query as jest.Mock;
const destroy=destroyVaultBytes as jest.Mock;
const PATH_MARKER='/synthetic/member-written-original/PRIVATE_SENTENCE.docx';
const workId='11111111-1111-4111-8111-111111111111';
describe('R105 failed vault erasure: leave owed queue, disclose errno only',()=>{
 let errorLog:jest.SpyInstance;
 beforeEach(()=>{
  queries.mockReset();
  destroy.mockReset();
  errorLog=jest.spyOn(console,'error').mockImplementation(()=>{});
 });
 afterEach(()=>errorLog.mockRestore());
 it('retries owed bytes without logging the private path or raw Error',async()=>{
  destroy.mockRejectedValue(Object.assign(
   new Error('private paragraph '+PATH_MARKER),{code:'EACCES'}));
  queries.mockImplementation(async(sql:string,_args:unknown[])=>{
   if(sql.includes('SELECT id, artifact_ref'))return {
    rows:[{id:workId,artifact_ref:PATH_MARKER}]};
   if(sql.includes('UPDATE vault_erasure_queue'))return {rowCount:1,rows:[]};
   if(sql.includes('SELECT count(*)'))return {rows:[{n:'1'}]};
   throw new Error('unexpected_test_SQL');
  });
  const out=await sweepVaultErasureQueue();
  expect(out).toEqual({destroyed:0,remaining:1});
  expect(destroy).toHaveBeenCalledWith(PATH_MARKER);
  const actual=queries.mock.calls.map(args=>String(args[0]));
  expect(actual.some(q=>q.includes('UPDATE vault_erasure_queue'))).toBe(true);
  expect(actual.some(q=>q.includes('DELETE FROM vault_erasure_queue'))).toBe(false);
  const update=queries.mock.calls.find(([q])=>q.includes('UPDATE vault_erasure_queue'));
  expect(update?.[1]).toEqual([workId,'EACCES']);
  const emitted=errorLog.mock.calls.map(a=>a.join(' ')).join('\n');
  expect(emitted).toContain('errno=EACCES');
  expect(emitted).not.toContain(PATH_MARKER);
  expect(emitted).not.toContain('private paragraph');
 });
 it('successfully destroyed bytes are removed from the queue afterward only',async()=>{
  const history:string[]=[];
  destroy.mockImplementation(async(_path:string)=>{history.push('destroy');});
  queries.mockImplementation(async(sql:string)=>{
   if(sql.includes('SELECT id, artifact_ref'))return {
    rows:[{id:workId,artifact_ref:PATH_MARKER}]};
   if(sql.includes('DELETE FROM vault_erasure_queue')){
    history.push('delete');return {rowCount:1,rows:[]};}
   if(sql.includes('SELECT count(*)'))return {rows:[{n:'0'}]};
   throw new Error('unexpected_test_SQL');
  });
  expect(await sweepVaultErasureQueue()).toEqual({destroyed:1,remaining:0});
  expect(history).toEqual(['destroy','delete']);
  expect(errorLog).not.toHaveBeenCalled();
 });
 it('malformed errno and raw exception message are not displayed',async()=>{
  destroy.mockRejectedValue({code:'PRIVATE_DATA',message:PATH_MARKER});
  queries.mockImplementation(async(sql:string)=>{
   if(sql.includes('SELECT id, artifact_ref'))return {
    rows:[{id:workId,artifact_ref:PATH_MARKER}]};
   if(sql.includes('UPDATE vault_erasure_queue'))return {rowCount:1,rows:[]};
   if(sql.includes('SELECT count(*)'))return {rows:[{n:'1'}]};
   throw new Error('unexpected_test_SQL');
  });
  const out=await sweepVaultErasureQueue();
  expect(out.remaining).toBe(1);
  const emitted=errorLog.mock.calls.map(a=>a.join(' ')).join('\n');
  expect(emitted).toContain('errno=UNKNOWN');
  expect(emitted).not.toContain('PRIVATE_DATA');
  expect(emitted).not.toContain(PATH_MARKER);
 });
});
