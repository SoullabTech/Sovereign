import { describe, it, expect, vi } from 'vitest';
import { keepHistoryVersion, restoreHistoryVersion, settleHistoryWriting, type HistoryWriting } from '../historyActions';
import { SectionSaveQueue } from '../sectionSaveQueue';
import type { Http, RevisionSummary } from '@/app/press/manuscript/workingDraftClient';

const row: RevisionSummary = {revisionNumber: 1,note:null,contentChars:20,createdAt:'2026-10-14T00:00:00Z',restorable:true};
function fixture() {
  const q = new SectionSaveQueue(10, async()=>({ok:true,version:11}));
  const w: HistoryWriting = {sections:[{id:'s',body:'current',position:0,heading:null,editable:true}],statusOf:()=> 'clean',
    flushPending:vi.fn(),hasUnsavedWork:()=>false,currentRevisionId:()=>q.state().version,
    acknowledgeCheckpoint:(a,b)=>q.acknowledgeCheckpoint(a,b)};
  const http=vi.fn(async (_url:string,init?:RequestInit)=>({ok:true,status:200,json:async()=>
    init?.headers && 'x-draft-base-revision' in init.headers
      ? {revisionId:Number((init.headers as Record<string,string>)['x-draft-base-revision'])+1,revisionCount:2}
      : {revisionId:12,restoredFrom:1}})) as unknown as Http & ReturnType<typeof vi.fn>;
  return {q,w,http};
}
describe('history actions use the existing guarded storage',()=>{
 it('checkpoint carries no manuscript body and advances only this exact settled queue',async()=>{
  const {q,w,http}=fixture();const out=await keepHistoryVersion(http,'owned',w);
  expect(w.flushPending).toHaveBeenCalled();expect(out.acknowledged).toBe(true);expect(q.state().version).toBe(11);
  expect(http.mock.calls[0][0]).toBe('/api/sovereign/manuscripts/owned/draft/checkpoint');
  expect(http.mock.calls[0][1].body).toBeUndefined();expect(http.mock.calls[0][1].headers['x-draft-base-revision']).toBe('10');
 });
 it('keeps the displaced current version before the exact selected restore',async()=>{
  const {w,http}=fixture();await restoreHistoryVersion(http,'owned',w,row,()=>null);
  expect(http.mock.calls.map(x=>x[0])).toEqual(['/api/sovereign/manuscripts/owned/draft/checkpoint','/api/sovereign/manuscripts/owned/draft/revisions']);
  expect(JSON.parse(http.mock.calls[1][1].body)).toMatchObject({revisionNumber:1,baseRevisionId:11});
 });
 it('an open editorial draft blocks restore before any checkpoint or write',async()=>{
  const {w,http}=fixture();await expect(restoreHistoryVersion(http,'owned',w,row,()=> 'Save your editorial draft')).rejects.toThrow('editorial draft');expect(http).not.toHaveBeenCalled();
 });
 it('unrecorded structure stays non-restorable',async()=>{
  const {w,http}=fixture();await expect(restoreHistoryVersion(http,'owned',w,{...row,restorable:false},()=>null)).rejects.toThrow('no restorable');expect(http).not.toHaveBeenCalled();
 });
 it('conflicted writing refuses without any history write',async()=>{
  const {w,http}=fixture();w.statusOf=()=> 'conflict';await expect(keepHistoryVersion(http,'owned',w)).rejects.toThrow('needs attention');expect(http).not.toHaveBeenCalled();
 });
 it('unsettled words time out rather than claiming a complete version',async()=>{
  const {w}=fixture();w.hasUnsavedWork=()=>true;await expect(settleHistoryWriting(w,0)).rejects.toThrow('still saving');
 });
 it('a stale pre-restore checkpoint prevents the restore request',async()=>{
  const {w,http}=fixture();http.mockResolvedValueOnce({ok:false,status:409,json:async()=>({reason:'stale_base',currentRevisionId:50})});
  await expect(restoreHistoryVersion(http,'owned',w,row,()=>null)).rejects.toThrow('changed');expect(http).toHaveBeenCalledTimes(1);
 });
 it('new local work after preserving the old version prevents replacement',async()=>{
  const {w,http}=fixture();let calls=0;await expect(restoreHistoryVersion(http,'owned',w,row,()=>++calls>2?'New draft':null)).rejects.toThrow('new local');expect(http).toHaveBeenCalledTimes(1);
 });
 it('a race between checkpoint and restore is refused, not retried',async()=>{
  const {w,http}=fixture();http.mockResolvedValueOnce({ok:true,status:200,json:async()=>({revisionId:11})});
  http.mockResolvedValueOnce({ok:false,status:409,json:async()=>({reason:'stale_base',currentRevisionId:12})});
  await expect(restoreHistoryVersion(http,'owned',w,row,()=>null)).rejects.toThrow('not overwritten');expect(http).toHaveBeenCalledTimes(2);
 });
 it('a lost restore response is not claimed as no write or silently retried',async()=>{
  const {w,http}=fixture();http.mockResolvedValueOnce({ok:true,status:200,json:async()=>({revisionId:11})});http.mockRejectedValueOnce(Error('offline'));
  await expect(restoreHistoryVersion(http,'owned',w,row,()=>null)).rejects.toThrow('could not be confirmed');expect(http).toHaveBeenCalledTimes(2);
 });
});
describe('checkpoint acknowledgement cannot adopt arbitrary versions',()=>{
 it('rejects stale bases, gaps, and pending saves',async()=>{
  let release:()=>void=()=>{};const q=new SectionSaveQueue(4,()=>new Promise(resolve=>{release=()=>resolve({ok:true,version:5});}));
  expect(q.acknowledgeCheckpoint(3,4)).toBe(false);expect(q.acknowledgeCheckpoint(4,6)).toBe(false);
  q.enqueue('s','unsaved');expect(q.acknowledgeCheckpoint(4,5)).toBe(false);release();await q.settled();
  expect(q.acknowledgeCheckpoint(5,6)).toBe(true);expect(q.state().version).toBe(6);
 });
});
