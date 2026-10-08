/** @jest-environment node */
import { NextRequest } from 'next/server';
import { ingestSourceWithCustodyCandidate, type CandidateCustodyPorts, type CandidateExtraction } from '../sourceCustodyIngestCandidate';
import type { SourceCustodyIntent } from '../sourceCustodyFiles';
const member = '22222222-2222-4222-8222-222222222222';
const request = new NextRequest('http://localhost/api/writers-studio/sources', {method:'POST'});
const file = () => ({name:'source.txt',type:'text/plain',size:5,arrayBuffer:async()=>new TextEncoder().encode('hello').buffer}) as File;
function deps(){
  const order: string[] = [];
  const observed: {intent:SourceCustodyIntent|null}={intent:null};
  const ports: CandidateCustodyPorts = {
    reserve: jest.fn(async(_,__,intent)=>{observed.intent=intent;order.push('reserve')}),
    begin: jest.fn(async()=>{order.push('journal')}),
    stage: jest.fn(async(_r,_i,name)=>{order.push('stage:'+name)}),
    markWriting: jest.fn(async()=>{order.push('writing')}),
    extract: jest.fn(async()=>{order.push('extract');return {kind:'typed_text',status:'reviewed',text:'hello',errorMessage:null} as CandidateExtraction}),
    publish: jest.fn(async()=>{order.push('publish')}),
    commit: jest.fn(async()=>{order.push('commit')}),
    dbOutcome: jest.fn(async()=> 'pending' as const),
    reconcileCommitted:jest.fn(async()=>{order.push('cleanupCommitted')}),
    reconcileFailedWriter:jest.fn(async()=>{order.push('cleanupAborted')}),
  };
  return {ports,order,observed};
}
test('reservation precedes all durable member bytes and commit follows published originals', async()=>{
  const d=deps();const result=await ingestSourceWithCustodyCandidate(request,member,file(),'/tmp/isolated-custody-fixture',d.ports);
  expect(result.transcriptionStatus).toBe('reviewed');
  expect(d.order).toEqual(['reserve','journal','stage:original.txt','writing','extract','stage:reviewed.txt','publish','commit','cleanupCommitted']);
  expect(d.ports.commit).toHaveBeenCalledWith(expect.objectContaining({intent:expect.objectContaining({memberId:member}),storagePath:expect.stringContaining('original.txt')}));
});
test('refused DB reservation never creates filesystem content',async()=>{
  const d=deps();(d.ports.reserve as jest.Mock).mockRejectedValue(new Error('protected'));
  await expect(ingestSourceWithCustodyCandidate(request,member,file(),'/tmp/isolated',d.ports)).rejects.toThrow('protected');
  expect(d.order).toEqual([]);
  expect(d.ports.begin).not.toHaveBeenCalled();
  expect(d.ports.dbOutcome).not.toHaveBeenCalled();
});
test('staging failure consults durable DB state then runs same-writer recovery',async()=>{
  const d=deps();(d.ports.stage as jest.Mock).mockRejectedValue(new Error('disk unavailable'));
  await expect(ingestSourceWithCustodyCandidate(request,member,file(),'/tmp/isolated',d.ports)).rejects.toThrow('disk unavailable');
  expect(d.order).toEqual(['reserve','journal','cleanupAborted']);
  expect(d.ports.dbOutcome).toHaveBeenCalledTimes(1);
});
test('pending DB state and failed cleanup never unlock privacy or claim success',async()=>{
  const d=deps();(d.ports.commit as jest.Mock).mockRejectedValue(new Error('unconfirmed commit'));
  (d.ports.reconcileFailedWriter as jest.Mock).mockRejectedValue(new Error('cleanup failed'));
  await expect(ingestSourceWithCustodyCandidate(request,member,file(),'/tmp/isolated',d.ports)).rejects.toThrow('unconfirmed commit');
  expect(d.ports.dbOutcome).toHaveBeenCalledTimes(1);
});
test('lost commit acknowledgement with DB-committed outcome retains authored custody',async()=>{
  const d=deps();(d.ports.commit as jest.Mock).mockRejectedValue(new Error('lost response'));
  (d.ports.dbOutcome as jest.Mock).mockResolvedValue('committed');
  const result=await ingestSourceWithCustodyCandidate(request,member,file(),'/tmp/isolated',d.ports);
  expect(result.transcriptionStatus).toBe('reviewed');
  expect(d.ports.reconcileFailedWriter).not.toHaveBeenCalled();
  expect(d.ports.reconcileCommitted).toHaveBeenCalledTimes(1);
});
test('extraction errors preserve the original with no member content in error metadata',async()=>{
  const d=deps();(d.ports.extract as jest.Mock).mockRejectedValue(new Error('private secret in parser exception'));
  const result=await ingestSourceWithCustodyCandidate(request,member,file(),'/tmp/isolated',d.ports);
  expect(result.transcriptionStatus).toBe('error');
  const value=(d.ports.commit as jest.Mock).mock.calls[0][0];
  expect(value.extraction.errorMessage).toContain('original is preserved');
  expect(value.extraction.errorMessage).not.toContain('private secret');
  expect(d.order).toContain('publish');
});
test('incomplete file bytes refuse before reservation',async()=>{
  const d=deps(); const bad={...file(),size:6} as File;
  await expect(ingestSourceWithCustodyCandidate(request,member,bad,'/tmp/isolated',d.ports)).rejects.toThrow('Incomplete file');
  expect(d.ports.reserve).not.toHaveBeenCalled();
});
