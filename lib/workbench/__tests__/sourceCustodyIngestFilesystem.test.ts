/** @jest-environment node */
import { NextRequest } from 'next/server';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ingestSourceWithCustodyCandidate, type CandidateCustodyPorts } from '../sourceCustodyIngestCandidate';
import {
  beginSourceCustody, stageSourceCustodyFile, stagedSourceFilePath,
  publishStagedSource, reconcileSourceCustody, listSourceCustodyIntents,
  type SourceCustodyIntent,
} from '../sourceCustodyFiles';
const MEMBER='22222222-2222-4222-8222-222222222222';
const REQUEST=new NextRequest('http://localhost/api/writers-studio/sources',{method:'POST'});
let root: string;
let operations: Map<string,'reserved'|'writing'|'committed'|'aborted'>;
let recorded: SourceCustodyIntent[];
let committed: boolean;
let failAtCommit: 'before'|'after'|null;
beforeEach(async()=>{
  root=await fs.mkdtemp(path.join(os.tmpdir(),'custody-intake-fs-'));
  operations=new Map();recorded=[];committed=false;failAtCommit=null;
});
afterEach(async()=>{await fs.rm(root,{recursive:true,force:true});});
const fixture=()=>({name:'sample.md',type:'text/markdown',size:14,arrayBuffer:async()=>new TextEncoder().encode('test material!').buffer}) as File;
function ports(): CandidateCustodyPorts {
  return {
    reserve: async(_r,member,intent)=>{
      expect(member).toBe(MEMBER);
      recorded.push(intent);operations.set(intent.operationId,'reserved');
    },
    begin: beginSourceCustody,
    stage: stageSourceCustodyFile,
    markWriting:async intent=>{expect(operations.get(intent.operationId)).toBe('reserved');operations.set(intent.operationId,'writing')},
    extract:async filepath=>({kind:'typed_text',status:'reviewed',text:await fs.readFile(filepath,'utf8'),errorMessage:null}),
    publish:publishStagedSource,
    commit:async value=>{
      if(failAtCommit==='before')throw new Error('synthetic DB refusal');
      expect(operations.get(value.intent.operationId)).toBe('writing');
      expect(value.extraction.text).toBe('test material!');
      operations.set(value.intent.operationId,'committed');committed=true;
      if(failAtCommit==='after')throw new Error('ack lost');
    },
    dbOutcome:async intent=>operations.get(intent.operationId)==='committed'?'committed':'pending',
    reconcileCommitted:async(r,intent)=>{await reconcileSourceCustody(r,intent,'committed')},
    reconcileFailedWriter:async(r,intent)=>{
      expect(operations.get(intent.operationId)).toBe('writing');
      await reconcileSourceCustody(r,intent,'aborted');
      operations.set(intent.operationId,'aborted');
    },
  };
}
test('real staged and canonical bytes are preserved only after authoritative commit',async()=>{
  const result=await ingestSourceWithCustodyCandidate(REQUEST,MEMBER,fixture(),root,ports());
  expect(result.transcriptionStatus).toBe('reviewed');
  expect(committed).toBe(true);
  expect(await fs.readFile(path.join(root,MEMBER,result.id,'original.md'),'utf8')).toBe('test material!');
  expect(await fs.readFile(path.join(root,MEMBER,result.id,'reviewed.txt'),'utf8')).toBe('test material!');
  expect(await listSourceCustodyIntents(root)).toEqual([]);
});
test('DB failure after publish is not allowed to leave canonical or staged bytes',async()=>{
  failAtCommit='before';
  await expect(ingestSourceWithCustodyCandidate(REQUEST,MEMBER,fixture(),root,ports())).rejects.toThrow('synthetic DB refusal');
  const intent=recorded[0];
  expect(operations.get(intent.operationId)).toBe('aborted');
  await expect(fs.stat(path.join(root,MEMBER,intent.uploadId))).rejects.toMatchObject({code:'ENOENT'});
  expect(await listSourceCustodyIntents(root)).toEqual([]);
});
test('a confirmed DB commit survives a lost acknowledgement',async()=>{
  failAtCommit='after';
  const result=await ingestSourceWithCustodyCandidate(REQUEST,MEMBER,fixture(),root,ports());
  expect(operations.get(recorded[0].operationId)).toBe('committed');
  expect(result.id).toBe(recorded[0].uploadId);
  expect(await fs.readFile(path.join(root,MEMBER,result.id,'original.md'),'utf8')).toBe('test material!');
  expect(await listSourceCustodyIntents(root)).toEqual([]);
});
test('a corrupt custody journal prevents blind cleanup after a DB failure',async()=>{
  failAtCommit='before';const p=ports();
  const original=p.publish;
  p.publish=async(r,intent)=>{
    await original(r,intent);
    await fs.writeFile(path.join(r,'.source-custody','intents',intent.operationId+'.json'),'corrupted');
  };
  await expect(ingestSourceWithCustodyCandidate(REQUEST,MEMBER,fixture(),root,p)).rejects.toThrow('synthetic DB refusal');
  const intent=recorded[0];
  expect(operations.get(intent.operationId)).toBe('writing');
  expect(await fs.readFile(path.join(root,MEMBER,intent.uploadId,'original.md'),'utf8')).toBe('test material!');
  await expect(listSourceCustodyIntents(root)).rejects.toThrow();
});
