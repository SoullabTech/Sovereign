import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
const mocks=vi.hoisted(()=>({http:vi.fn(),host:null as HTMLElement|null}));
vi.mock('@/lib/http/apiBase',()=>({apiFetch:mocks.http}));
vi.mock('@/app/dev/writers-studio-p4r1/useStudioTopbarAccessoriesHost',()=>({useStudioTopbarAccessoriesHost:()=>mocks.host}));
import ManuscriptHistory from '@/app/dev/writers-studio-pc3-live/ManuscriptHistory';
let root:Root, container:HTMLDivElement, writer:SectionWriting, revision:number;
const restored=vi.fn();
const rows=[{revisionNumber:2,createdAt:'2026-10-14T00:00:00Z',contentChars:45,note:null,restorable:true},
 {revisionNumber:1,createdAt:'2026-10-13T00:00:00Z',contentChars:20,note:'Old source',restorable:false}];
const btn=(label:string)=>[...document.querySelectorAll('button')].find(b=>b.textContent===label||b.getAttribute('aria-label')===label)!;
async function click(label:string){await act(async()=>{btn(label).click();});}
async function mount(blocked:string|null=null){await act(async()=>{root.render(createElement(ManuscriptHistory,{manuscriptId:'owned',writing:writer,restoreBlockedReason:blocked,actionBlocked:false,onRestored:restored}));});}
beforeEach(()=>{
 (globalThis as Record<string,unknown>).IS_REACT_ACT_ENVIRONMENT=true;
 Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value:function(){this.setAttribute('open','');}});
 Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value:function(){this.removeAttribute('open');}});
 document.body.innerHTML='';container=document.createElement('div');document.body.append(container);mocks.host=document.createElement('div');document.body.append(mocks.host);root=createRoot(container);revision=10;restored.mockReset();
 writer={sections:[{id:'s',position:0,body:'text',heading:null,editable:true}],statusOf:()=> 'clean',flushPending:vi.fn(),hasUnsavedWork:()=>false,currentRevisionId:()=>revision,acknowledgeCheckpoint:(base,next)=>{if(base!==revision)return false;revision=next;return true;}} as unknown as SectionWriting;
 mocks.http.mockReset();mocks.http.mockImplementation(async(_url:string,init?:RequestInit)=>({ok:true,status:200,json:async()=>init?.method==='POST'?{revisionId:revision+1,revisionCount:3}:{revisions:rows}}));
});
afterEach(async()=>{await act(async()=>root.unmount());document.body.innerHTML='';});
describe('visible general history uses guarded whole-manuscript storage',()=>{
 it('opening History only reads; it never checkpoints or sends MAIA anything',async()=>{await mount();expect(mocks.http).not.toHaveBeenCalled();await click('History');expect(mocks.http).toHaveBeenCalledTimes(1);expect(mocks.http.mock.calls[0]).toEqual(['/api/sovereign/manuscripts/owned/draft/revisions',{method:'GET'}]);expect(document.querySelector('[aria-label="Kept manuscript versions"]')).not.toBeNull();});
 it('marks old unrecorded structure as non-restorable',async()=>{await mount();await click('History');expect(btn('Restore version 1').disabled).toBe(true);expect(btn('Restore version 2').disabled).toBe(false);});
 it('a failed read is not presented as an empty history',async()=>{mocks.http.mockResolvedValue({ok:false,status:500,json:async()=>({})});await mount();await click('History');expect(document.body.textContent).toContain('not an empty history');expect(document.body.textContent).not.toContain('No versions have been kept yet');});
 it('selecting and cancelling Restore does not mutate anything',async()=>{await mount();await click('History');await click('Restore version 2');expect(document.body.textContent).toContain('Restore version 2?');await click('Cancel restore');expect(mocks.http).toHaveBeenCalledTimes(1);expect(restored).not.toHaveBeenCalled();});
 it('open editorial work blocks restore, but not keeping a manuscript version',async()=>{await mount('Save the editorial draft first.');await click('History');expect(btn('Restore version 2').disabled).toBe(true);expect(btn('Keep a version').disabled).toBe(false);});
 it('keeping preserves an open local editorial draft without reload',async()=>{const draft=document.createElement('textarea');draft.value='unsubmitted author words';document.body.append(draft);await mount('Editorial work is open.');await click('History');await click('Keep a version');expect(writer.flushPending).toHaveBeenCalled();expect(draft.value).toBe('unsubmitted author words');expect(draft.isConnected).toBe(true);expect(revision).toBe(11);expect(restored).not.toHaveBeenCalled();expect(document.body.textContent).toContain('Version kept');});
 it('Restore requires a distinct explicit confirmation and keeps current writing first',async()=>{await mount();await click('History');await click('Restore version 2');expect(mocks.http).toHaveBeenCalledTimes(1);await click('Keep current and restore version 2');const writes=mocks.http.mock.calls.filter(x=>x[1]?.method==='POST');expect(writes.map(x=>x[0])).toEqual(['/api/sovereign/manuscripts/owned/draft/checkpoint','/api/sovereign/manuscripts/owned/draft/revisions']);expect(JSON.parse(writes[1][1].body)).toMatchObject({revisionNumber:2,baseRevisionId:11});expect(restored).toHaveBeenCalledTimes(1);});
});
