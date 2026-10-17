/** R62V: the real Vision Studio route preserves member-directed context. */
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {
 readVisionStudioQueryR62V,nextVisionStudioTabR62V,
} from '../visionStudioRouteR62V';

let mockSearch:URLSearchParams|null=null;
const push=jest.fn(),replace=jest.fn();
jest.mock('next/navigation',()=>({
 useSearchParams:()=>mockSearch,
 useRouter:()=>({push,replace}),
}));
jest.mock('@/components/maia/vision-studio/VisionStudioRoom',()=>({
 VisionStudioRoom:({phase,fieldContext}:{
  phase:string;fieldContext?:string,
 })=>require('react').createElement('section',{
  'data-fixture-room':'vision',
  'data-phase':phase,
  'data-field-context':fieldContext??'none',
 },'Fictional Vision Studio content'),
}));
jest.mock('@/components/maia/practice-field/PracticeFieldEditor',()=>({
 PracticeFieldEditor:()=>require('react').createElement('section',{
  'data-fixture-room':'practice',
 },'Fictional Practice Field content'),
}));
import VisionStudioPage from '@/app/maia/vision-studio/page';

const html=()=>renderToStaticMarkup(React.createElement(VisionStudioPage));
beforeEach(()=>{mockSearch=null;push.mockClear();replace.mockClear();});

describe('R62V exact source-derived Vision Studio query scope',()=>{
 it('Next null params must hold all field and practice rendering',()=>{
  expect(readVisionStudioQueryR62V(null)).toEqual({kind:'unresolved'});
  const out=html();
  expect(out).toContain('Opening the field');
  expect(out).not.toContain('data-fixture-room');
  expect(out).not.toContain('Practice Field');
  expect(push).not.toHaveBeenCalled();
  expect(replace).not.toHaveBeenCalled();
 });
 it('cannot invent tab navigation until the whole query resolves',()=>{
  for(const to of ['vision','practice','living-field'] as const)
   expect(nextVisionStudioTabR62V(null,to)).toBeNull();
 });
 it('defaults the *resolved* empty route to the existing Vision arc start',()=>{
  mockSearch=new URLSearchParams();
  expect(readVisionStudioQueryR62V(mockSearch)).toEqual({
   kind:'ready',tab:'vision',phase:'fire_1',fieldContext:undefined,
  });
  const out=html();
  expect(out).toContain('data-fixture-room="vision"');
  expect(out).toContain('data-phase="fire_1"');
  expect(out).not.toContain('data-fixture-room="practice"');
 });
 it('preserves exact phase and opaque field context on a resolved Vision route',()=>{
  const opaque='edge:alpha%/β-subject';
  mockSearch=new URLSearchParams({tab:'vision',phase:'water_2',
   fieldContext:opaque,source:'return'});
  const result=readVisionStudioQueryR62V(mockSearch);
  expect(result).toEqual({
   kind:'ready',tab:'vision',phase:'water_2',fieldContext:opaque,
  });
  const out=html();
  expect(out).toContain('data-fixture-room="vision"');
  expect(out).toContain('data-phase="water_2"');
  expect(out).toContain('data-field-context="edge:alpha%/β-subject"');
  expect(out).not.toContain('data-fixture-room="practice"');
 });
 it('practice tab renders its own room, not a synthetic member Vision context',()=>{
  mockSearch=new URLSearchParams({
   tab:'practice',phase:'earth_1',fieldContext:'an-existing-opaque-id',
  });
  const out=html();
  expect(out).toContain('data-fixture-room="practice"');
  expect(out).not.toContain('data-fixture-room="vision"');
 });
 it('a resolved unrecognized query tab is NOT silently reinterpreted',()=>{
  mockSearch=new URLSearchParams('tab=unknown');
  const out=html();
  expect(out).not.toContain('data-fixture-room="practice"');
  expect(out).not.toContain('data-fixture-room="vision"');
  expect(out).toContain('Vision Studio');
 });
 it('switching between tabs carries every existing query and does not invent context',()=>{
  const input=new URLSearchParams({
   tab:'vision',phase:'fire_3',fieldContext:'opaque:α/β',returnTo:'house',
   source:'arrived',
  });
  const next=nextVisionStudioTabR62V(input,'practice');
  expect(next).not.toBeNull();
  const parsed=new URL(next!,'https://soullab.life');
  expect(parsed.origin).toBe('https://soullab.life');
  expect(parsed.pathname).toBe('/maia/vision-studio');
  expect(parsed.searchParams.get('tab')).toBe('practice');
  expect(parsed.searchParams.get('phase')).toBe('fire_3');
  expect(parsed.searchParams.get('fieldContext')).toBe('opaque:α/β');
  expect(parsed.searchParams.get('returnTo')).toBe('house');
  expect(parsed.searchParams.get('source')).toBe('arrived');
  expect(input.get('tab')).toBe('vision');
 });
 it('returning to Vision retains the current fieldContext precisely',()=>{
  const params=new URLSearchParams('tab=practice&fieldContext=a%2Fb%3Fc&phase=earth_4');
  expect(nextVisionStudioTabR62V(params,'vision'))
   .toBe('/maia/vision-studio?tab=vision&fieldContext=a%2Fb%3Fc&phase=earth_4');
 });
 it('Living Field is an explicitly selected distinct room, not a tab rewrite',()=>{
  const params=new URLSearchParams({tab:'practice',phase:'water_3'});
  expect(nextVisionStudioTabR62V(params,'living-field')).toBe('/maia/living-field');
  expect(params.toString()).toBe('tab=practice&phase=water_3');
 });
});
