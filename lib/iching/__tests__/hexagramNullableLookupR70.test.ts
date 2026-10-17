/**
 * R70: the API nullable lookup annotations must preserve actual I Ching
 * semantics. This test requires no member context, provider or network.
 */
import {getHexagram} from '../lookup';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const routes=[
 'app/api/changes/[id]/cast/route.ts',
 'app/api/changes/[id]/interpret/route.ts',
 'app/api/studio/changes/[id]/cast/route.ts',
 'app/api/studio/changes/[id]/interpret/route.ts',
 'app/api/studio/changes/[id]/mentor/route.ts',
 'app/api/studio/changes/[id]/mentor/chat/route.ts',
] as const;

describe('R70 I Ching lookup types preserve absent and present hexagrams',()=>{
 it('looks up actual King Wen hexagrams without transforming their meanings',()=>{
  for(const n of [1,2,11,64]){
   const hex=getHexagram(n);
   expect(hex).not.toBeNull();
   expect(hex?.number).toBe(n);
   expect(hex?.name.length).toBeGreaterThan(0);
   expect(hex?.judgment.length).toBeGreaterThan(0);
  }
 });
 it('returns null for unknown hexagrams, not fabricated defaults',()=>{
  expect(getHexagram(0)).toBeNull();
  expect(getHexagram(65)).toBeNull();
 });
 it('keeps all six interpretation/casting routes nullable, without unsafe casts',()=>{
  for(const path of routes){
   const source=readFileSync(join(process.cwd(),path),'utf8');
   expect(source).toContain('ReturnType<typeof getHexagram> = null');
   expect(source).not.toContain('getHexagram(row.relating_hexagram_number)!');
  }
 });
});
