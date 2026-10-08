/** @jest-environment jsdom */
import React, {act,useEffect,useState} from 'react';
import {createRoot, type Root} from 'react-dom/client';
const apiFetch=jest.fn();
const navigation={path:'/writers-studio',params:new URLSearchParams('mode=develop&developCraft=1&m=fixture')};
jest.mock('next/navigation',()=>({usePathname:()=>navigation.path,useSearchParams:()=>navigation.params}));
jest.mock('@/lib/http/apiBase',()=>({apiFetch:(...args:unknown[])=>apiFetch(...args)}));
jest.mock('@/app/writers-studio/help/help.css',()=>({}));
jest.mock('@/app/writers-studio/help/context',()=>({captureHelpContext:()=>({surface:'craft',view:'markup',focused:true,controls:['preview','keep']})}));
import StudioHelp from '@/app/writers-studio/help/StudioHelp';
import {HELP_RELEASE} from '@/lib/writersStudio/help/catalogue';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
let container:HTMLDivElement,root:Root,mounts=0;
const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body});
const session=(key='a')=>response({release:HELP_RELEASE,sessionScope:key,canAsk:true});
function Writer(){const [text,setText]=useState('Private unfinished writing');useEffect(()=>{mounts++;},[]);return React.createElement('textarea',{'aria-label':'Writer editor',value:text,onChange:(e:any)=>setText(e.target.value)});}
const button=(text:string)=>Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent?.trim()===text)!;
const helpButton=()=>container.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!;
const question=()=>container.querySelector<HTMLTextAreaElement>('#studio-help-question')!;
async function open(){await act(async()=>helpButton().click());}
async function type(q:string){await act(async()=>{const input=question();Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(input,q);input.dispatchEvent(new Event('input',{bubbles:true}));});}
beforeEach(()=>{
  jest.clearAllMocks();mounts=0;localStorage.clear();sessionStorage.clear();localStorage.setItem('maia_settings',JSON.stringify({sanctuary:false}));
  Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value:function(){this.setAttribute('open','');}});
  Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value:function(){this.removeAttribute('open');}});
  global.requestAnimationFrame=(cb:any)=>{cb();return 1;};
  apiFetch.mockImplementation((_url:string,opts:any)=>opts?.method==='POST'?Promise.resolve(response({release:HELP_RELEASE,sessionScope:'a',topicIds:['marks']})):Promise.resolve(session()));
  container=document.createElement('div');document.body.append(container);root=createRoot(container);
  act(()=>root.render(React.createElement(React.Fragment,null,React.createElement(Writer),React.createElement(StudioHelp))));
});
afterEach(()=>{act(()=>root.unmount());container.remove();});
it('opening, asking, and closing Help never remounts the writer or stores a transcript',async()=>{
  await open();await type('Why is the word crossed out?');await act(async()=>button('Ask MAIA about Studio').click());
  expect(container.textContent).toContain('no model request');expect(container.textContent).toContain('Your table is showing Markup');
  expect(apiFetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(0);
  act(()=>button('Close').click());expect(mounts).toBe(1);expect((container.querySelector('[aria-label="Writer editor"]') as HTMLTextAreaElement).value).toBe('Private unfinished writing');
  expect(localStorage.length).toBe(1);expect(sessionStorage.length).toBe(0);
  await open();expect(question().value).toBe('Why is the word crossed out?');
});
it('an unfamiliar request sends only the question and closed UI state',async()=>{
  await open();await type('What is this little typographical sign doing?');await act(async()=>button('Ask MAIA about Studio').click());
  const sent=apiFetch.mock.calls.find(c=>c[1]?.method==='POST')!;expect(sent).toBeDefined();
  const body=JSON.parse(sent[1].body);expect(Object.keys(body).sort()).toEqual(['context','question','release','sanctuary']);
  expect(sent[1].body).not.toContain('Private unfinished writing');expect(sent[1].body).not.toContain('fixture');
  expect(container.textContent).toContain('MAIA matched your question');
});
it('Sanctuary and unresolved posture keep an unfamiliar question local',async()=>{
  await open();localStorage.setItem('maia_settings',JSON.stringify({sanctuary:true}));await type('What is this little typographical sign doing?');await act(async()=>button('Ask MAIA about Studio').click());
  expect(apiFetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(0);expect(container.textContent).toContain('current privacy setting');
  localStorage.clear();await act(async()=>button('Ask MAIA about Studio').click());expect(apiFetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(0);
});
it('Help remains usable during model failure and never retries a manuscript operation',async()=>{
  await open();apiFetch.mockResolvedValue(response({refusal:'guide_match_unavailable'},503));await type('What is this little typographical sign doing?');await act(async()=>button('Ask MAIA about Studio').click());
  expect(container.textContent).toContain('could not match');act(()=>button('Topics').click());expect(container.textContent).toContain('Find a help topic');
  expect(apiFetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);
});
it('a changed account clears temporary Help without touching the writing',async()=>{
  await open();await type('A private support question');act(()=>button('Close').click());apiFetch.mockResolvedValue(session('b'));await open();expect(question().value).toBe('');expect(mounts).toBe(1);
});
it('Escape dismisses Help and returns keyboard focus',async()=>{await open();act(()=>container.querySelector('dialog')!.dispatchEvent(new Event('cancel',{cancelable:true,bubbles:true})));expect(container.querySelector('dialog')!.hasAttribute('open')).toBe(false);expect(document.activeElement).toBe(helpButton());});

it('does not claim no model request after a live match failed',async()=>{
  await open();apiFetch.mockResolvedValue(response({refusal:'guide_match_unavailable'},503));await type('save');await act(async()=>button('Ask MAIA about Studio').click());
  expect(apiFetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);
  expect(container.textContent).toContain('live matching did not complete');
  expect(container.textContent).not.toContain('From the Studio guide · no model request');
});
