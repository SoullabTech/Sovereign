/** @jest-environment jsdom */
/**
 * R41 actual canonical Studio Shell (not a demo): reset the adjustable
 * columns without unmounting Work or losing writer layout state.
 */
import {act,createElement,useEffect} from 'react';
import {createRoot,type Root} from 'react-dom/client';
jest.mock('next/navigation',()=>({
 useSearchParams:()=>new URLSearchParams('mode=write'),
 usePathname:()=>'/writers-studio',
}));
jest.mock('@/lib/cabin/doorway',()=>({
 isCabinOrigin:()=>false,
 cabinReturnPath:()=>'/cabin',
}));
import {Shell} from '../Shell';
import {WRITE_GEOMETRY} from '../tokens';

const geometry={...WRITE_GEOMETRY,manuscriptWidth:300,manuscriptFloor:176,
 maiaWidth:355,maiaFloor:250,gapLeft:12,gapRight:12,padLeft:12,padRight:12};
let container:HTMLDivElement,root:Root;
let workMounts=0,workUnmounts=0;
function PersistentWork(){
 useEffect(()=>{workMounts++;return()=>{workUnmounts++;};},[]);
 return createElement('section',{'data-r41-work-preserved':true},
  'Fictional Work remains mounted');
}
function renderShell(extra:Record<string,unknown>={}){
 act(()=>root.render(createElement(Shell,{
  mode:'write',appearance:'day',geometry,memberInitial:'F',
  manuscript:createElement('p',null,'Manuscript Outline'),
  maia:createElement('p',null,'MAIA offering'),
  work:createElement(PersistentWork),...extra,
 })));
 // JSDOM has no layout; give the genuine Shell its normal desktop frame.
 const shell=container.querySelector<HTMLElement>('.fr-shell');
 if(shell) shell.getBoundingClientRect=()=>({width:1440,height:900} as DOMRect);
}
const reset=()=>container.querySelector<HTMLButtonElement>('[data-r41-reset-column-widths]');
const widths=()=>({
 left:container.querySelector<HTMLElement>('.fr-panel-splitter-left')?.getAttribute('aria-valuenow'),
 right:container.querySelector<HTMLElement>('.fr-panel-splitter-right')?.getAttribute('aria-valuenow'),
});
const key=(selector:string,name:string)=>{
 const node=container.querySelector<HTMLElement>(selector);
 expect(node).not.toBeNull();
 act(()=>node!.dispatchEvent(new KeyboardEvent('keydown',{
  key:name,bubbles:true,cancelable:true,
 })));
};
beforeEach(()=>{
 (globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 document.body.replaceChildren();localStorage.clear();workMounts=0;workUnmounts=0;
 container=document.createElement('div');document.body.appendChild(container);
 root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();});
describe('R41 real Studio Shell Reset widths',()=>{
 it('renders accessible explicit Reset only in a three-column Studio',()=>{
  renderShell();
  expect(reset()?.textContent?.trim()).toBe('Reset widths');
  expect(reset()?.getAttribute('aria-label'))
   .toBe('Reset manuscript and MAIA column widths');
  expect(widths()).toEqual({left:'300',right:'355'});
 });
 it('keyboard resizes BOTH genuine panels, and Reset restores both original widths',()=>{
  renderShell();
  key('.fr-panel-splitter-left','ArrowRight');
  key('.fr-panel-splitter-right','ArrowLeft');
  expect(widths()).toEqual({left:'324',right:'379'});
  act(()=>reset()!.click());
  expect(widths()).toEqual({left:'300',right:'355'});
 });
 it('persists Reset into existing writer-owned layout storage key',()=>{
  renderShell();
  key('.fr-panel-splitter-left','ArrowRight');
  const saved=JSON.parse(localStorage.getItem('soullab.studio.panel-layout.v1.write')||'null');
  expect(saved).toMatchObject({leftWidth:324,rightWidth:355});
  act(()=>reset()!.click());
  const after=JSON.parse(localStorage.getItem('soullab.studio.panel-layout.v1.write')||'null');
  expect(after).toMatchObject({leftWidth:300,rightWidth:355});
 });
 it('Reset does not remount manuscript Work or invalidate its DOM identity',()=>{
  renderShell();
  expect(workMounts).toBe(1);expect(workUnmounts).toBe(0);
  const section=container.querySelector('[data-r41-work-preserved]');
  key('.fr-panel-splitter-left','ArrowRight');
  act(()=>reset()!.click());
  expect(container.querySelector('[data-r41-work-preserved]')).toBe(section);
  expect(workMounts).toBe(1);expect(workUnmounts).toBe(0);
 });
 it('Full Canvas and one-room Home do not expose irrelevant layout reset',()=>{
  renderShell({canvas:true});
  expect(reset()).toBeNull();
  renderShell({canvas:false,manuscript:undefined,maia:undefined});
  expect(reset()).toBeNull();
 });
});
