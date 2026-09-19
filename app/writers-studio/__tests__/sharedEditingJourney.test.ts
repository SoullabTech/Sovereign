/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import RebuildStudioClient from '../rebuild/RebuildStudioClient';
import { apiFetch } from '@/lib/http/apiBase';
import { loadCanvasInsight } from '@/lib/writersStudio/insightCanvas';
import * as editorial from '@/lib/writersStudio/rebuild/editorialCollaboration';

jest.mock('../insight/insight.css', () => ({}));
jest.mock('../rebuild/rebuild.css', () => ({}));
jest.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }));
jest.mock('../atmosphere/AppearanceMenu', () => ({ AppearanceMenu: () => null }));
jest.mock('../atmosphere/StudioAtmosphere', () => ({ useCanvasSurfaceVariables: () => ({}) }));
jest.mock('../studio/StudioModeBar', () => ({ StudioModeBar: () => null }));
jest.mock('../useLivingWorks', () => ({ useLivingWorks: () => ({ phase:'ready',works:[{
  id:'w1',title:'My Work',purpose:'Fire · Inspiration\nTo make inner life tangible.',form:'Book',stage:'developing',
  createdAt:'',updatedAt:'',materials:[],expressions:[{expressionType:'manuscript',expressionId:'m1',declaredAt:''}],
}],reload:jest.fn() }) }));
jest.mock('../useStudioSources', () => ({ useStudioSources: () => ({ sources:[] }) }));
jest.mock('../insight/GoldLine', () => () => null);
jest.mock('../insight/InsightReadings', () => () => null);
jest.mock('../insight/WorkInspiration', () => () => null);
jest.mock('../insight/EditorialApproaches', () => () => null);
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
jest.mock('@/lib/writersStudio/structureClient', () => ({ fetchStructure: async () => ({ok:false}),refusalCopy:()=>'' }));
jest.mock('@/lib/writersStudio/insightCanvas', () => ({ ...jest.requireActual('@/lib/writersStudio/insightCanvas'),loadCanvasInsight:jest.fn() }));
jest.mock('@/lib/writersStudio/rebuild/editorialCollaboration', () => ({
  ...jest.requireActual('@/lib/writersStudio/rebuild/editorialCollaboration'),
  discoverEditorialRelationships:jest.fn(), openBoundEditorialPassage:jest.fn(),
  openBoundEditorialThread:jest.fn(),readBoundEditorialThread:jest.fn(),
  sendBoundEditorialTurn:jest.fn(),adoptBoundEditorialVersion:jest.fn(),
}));
jest.mock('../rebuild/RebuildWritingBoundary', () => ({ __esModule:true, default: ({sections,version,children}:any) => children({
  sections:sections.map((s:any)=>({...s,id:s.draftSectionId})),bodyOf:(id:string)=>sections.find((s:any)=>s.draftSectionId===id)?.body??'',
  statusOf:()=> 'clean',currentRevisionId:()=>version,flushPending:()=>{},hasUnsavedWork:()=>false,
  editSection:jest.fn(),captureForUnmount:jest.fn(),
}) }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Provider and persistence responses are controlled here. This is a component
// journey test, not evidence of live model quality or durable database writes.
test('Develop stays on its page through finding, proposal, preview, apply, and undo', async () => {
  window.history.replaceState({},'', '/writers-studio/develop?m=m1&s=s1');
  HTMLElement.prototype.scrollIntoView = jest.fn();
  Object.defineProperty(window.crypto, 'randomUUID', {configurable:true,value:()=> '00000000-0000-4000-8000-000000000001'});
  const original='The lantern glowed.';
  const wording='The lantern rested in warm light.';
  const before='Evening came.\n\n',after='\n\nThe notebook stayed closed.';
  let body=before+original+after, revision=1;
  let thread:any={threadId:'t1',chainId:'chain',targetSectionId:'s1',sectionLabel:'A quiet room',locusText:original,legacyLocus:false,turns:[],versions:[],headVersionId:null};
  const section=()=>({draftSectionId:'s1',sourceSectionId:null,position:0,heading:'A quiet room',headingDepth:2,headingSignal:null,body,editable:true});
  const context=()=>({state:'section_aware',manuscriptId:'m1',title:'My manuscript',version:revision,updatedAt:'2026-09-19',sections:[section()]});
  (apiFetch as jest.Mock).mockImplementation(async (url:string)=>{
    if(url.includes('/rebuild/context')) return {ok:true,json:async()=>context()};
    if(url.endsWith('/editorial/undo')) {
      body=before+original+after;revision++;
      thread={...thread,application:{...thread.application,undone:true,canUndo:false}};
      return {ok:true,json:async()=>({kind:'undone'})};
    }
    return {ok:true,json:async()=>({run:null})};
  });
  const range={start:Array.from(before).length,end:Array.from(before+original).length};
  (loadCanvasInsight as jest.Mock).mockResolvedValue({manuscriptId:'m1',readingId:'r1',observation:{key:'o1',phenomenonLabel:'Flow and voice',observation:'The light could feel more embodied.',state:'current'},coverage:'One section',passages:[{key:'p1',sectionId:'s1',heading:'A quiet room',body,range,verified:true,editable:true}]});
  (editorial.discoverEditorialRelationships as jest.Mock).mockResolvedValue({ok:true,relationships:[]});
  (editorial.openBoundEditorialPassage as jest.Mock).mockImplementation(async()=>({ok:true,thread}));
  (editorial.readBoundEditorialThread as jest.Mock).mockImplementation(async()=>({ok:true,thread}));
  (editorial.sendBoundEditorialTurn as jest.Mock).mockImplementation(async()=>{
    const version={id:'v1',author:'maia',wording,rationale:'Editorial purpose: More embodied',supersedes:null};
    thread={...thread,versions:[version],headVersionId:'v1',turns:[{speaker:'maia',turnIndex:1,body:'This introduces a tactile quality; keeping the original is also reasonable.',at:''}]};
    return {ok:true,thread,producedVersionId:'v1'};
  });
  (editorial.adoptBoundEditorialVersion as jest.Mock).mockImplementation(async()=>{
    body=before+wording+after;revision++;
    thread={...thread,application:{authorizationId:'a1',versionId:'v1',resultingVersion:revision,undone:false,canUndo:true}};
    return {ok:true,outcome:{kind:'applied'}};
  });
  const container=document.createElement('div');document.body.append(container);let root=createRoot(container);
  const note={readingId:'r1',key:'o1',sectionId:'s1',label:'Flow and voice',sourceBody:body,range};
  let observation:any=null;
  const draw=()=>root.render(React.createElement(RebuildStudioClient,{development:{sectionId:'s1',observation,notes:[note],onSelect:n=>{observation=n;draw();},onReadingTools:jest.fn(),onPlaceChange:jest.fn()}}));
  const button=(text:string)=>Array.from(container.querySelectorAll('button')).find(b=>b.textContent?.includes(text))!;
  try {
    await act(async()=>{draw();});
    expect(container.querySelector('[data-embedded-canvas="true"]')).not.toBeNull();
    expect(container.querySelector('.wsr-maia')).toBeNull();
    expect(container.querySelector('mark')?.textContent).toBe(original);
    await act(async()=>{button('Flow and voice').click();});
    expect(container.querySelector('[data-inline-editorial-anchor] [data-revision-desk]')).not.toBeNull();
    expect(container.textContent).toContain('The light could feel more embodied.');
    expect(container.textContent).toContain('No edit proposed yet');
    await act(async()=>{button('Try a revision').click();});
    expect(editorial.openBoundEditorialPassage).toHaveBeenCalledWith('s1',range,1);
    expect((editorial.sendBoundEditorialTurn as jest.Mock).mock.calls[0][2]).toContain('The light could feel more embodied.');
    expect((editorial.sendBoundEditorialTurn as jest.Mock).mock.calls[0][2]).toContain('To make inner life tangible.');
    expect((editorial.sendBoundEditorialTurn as jest.Mock).mock.calls[0][2]).toContain('orientation, never as authority');
    expect(container.querySelector('[data-editorial-locus] ins')).not.toBeNull();
    expect(container.querySelector('[data-editorial-locus] del')).not.toBeNull();
    expect(container.textContent).toContain(after.trim());
    expect(button('Use this revision').disabled).toBe(true);
    await act(async()=>{button('Read in context').click();});
    expect(button('Use this revision').disabled).toBe(false);
    await act(async()=>{button('Use this revision').click();});
    expect(editorial.adoptBoundEditorialVersion).toHaveBeenCalledWith('t1','s1','v1');
    expect(body).toBe(before+wording+after);
    // Reopen from the saved relationship, then recover the application receipt.
    act(()=>root.unmount()); root=createRoot(container);
    await act(async()=>{draw();});
    expect(container.textContent).toContain('Applied:');
    expect(container.querySelector('[data-editorial-locus]')?.textContent).toBe(wording);
    expect(container.querySelector('[data-editorial-locus] ins')).toBeNull();
    await act(async()=>{button('Undo this change').click();});
    expect(body).toBe(before+original+after);
    expect(container.textContent).toContain('original passage is restored');
    expect(window.location.pathname).toBe('/writers-studio/develop');
  } finally {act(()=>root.unmount());container.remove();}
});
