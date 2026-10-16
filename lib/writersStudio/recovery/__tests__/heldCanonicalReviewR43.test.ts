/**
 * R43 · actual R41 selector -> held R37 encrypted-section *preview*.
 * No browser authorization, SQL, provider call, Apply or live route.
 */
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {exactTextareaPassageR41,R41_REAL_PROTECTED_APPLY_ENABLED}
 from '../../exactLiveSelectionR41';
import {reviewFictionalCanonicalSelectionR43,
 R43_REAL_STUDIO_REVIEW_BRIDGE_ENABLED,
 type R43FictionalCanonicalSelection} from '../heldCanonicalReviewR43';
import type {R35View} from '../heldProtectedDraftR35';
import {R37_REAL_SECTION_EDIT_ENABLED} from '../heldSectionApplyR37';

const W='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const A='66666666-6666-4666-8666-666666666666';
const B='77777777-7777-4777-8777-777777777777';
const C1='🍂 First lantern glows. Second lantern glows.\n\n';
const C2='The other chapter is kept unchanged.';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const base:R35View={workId:W,generation:1,checkpointCount:0,
 kind:'sections',sections:[{id:S1,text:C1},{id:S2,text:C2}],
 content:C1+C2,note:null,action:'start',restoredFrom:null};
const selected=()=>{
 const at=C1.lastIndexOf('lantern glows');
 return exactTextareaPassageR41(C1,C1,at,at+'lantern glows'.length);
};
const request=():R43FictionalCanonicalSelection=>({
 expectedWorkId:W,expectedGeneration:1,sectionId:S1,
 selected:selected(),chosenAlternativeId:A,alternatives:[
   {id:A,origin:'maia',wording:'lantern shimmers'},
   {id:B,origin:'member',wording:'lantern shines'},
 ],
});
const envs=['R43_CANONICAL_REVIEW_FIXTURE',
 'R37_SECTION_PASSAGE_FIXTURE','R36_PASSAGE_REVIEW_FIXTURE'] as const;
const old=envs.map(k=>process.env[k]);
beforeEach(()=>{for(const key of envs)process.env[key]='fictional-only';});
afterAll(()=>{envs.forEach((key,i)=>{
 if(old[i]===undefined)delete process.env[key];
 else process.env[key]=old[i];
});});
function routes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(f=>{
   const p=path.join(dir,f.name);
   return f.isDirectory()?routes(p):f.isFile()&&/^route\.(ts|tsx)$/.test(f.name)?[p]:[];
 });
}
describe('R43 actual selection to held encrypted-draft review',()=>{
 it('keeps actual editor Apply and the new projection unmounted',()=>{
   expect(R41_REAL_PROTECTED_APPLY_ENABLED).toBe(false);
   expect(R37_REAL_SECTION_EDIT_ENABLED).toBe(false);
   expect(R43_REAL_STUDIO_REVIEW_BRIDGE_ENABLED).toBe(false);
   delete process.env.R43_CANONICAL_REVIEW_FIXTURE;
   expect(()=>reviewFictionalCanonicalSelectionR43(base,request()))
     .toThrow(expect.objectContaining({code:'r43_real_studio_review_disabled'}));
 });
 it('uses exact SECOND repeated passage and Unicode codepoint offsets',()=>{
   const locus=selected();
   expect(locus).not.toBeNull();
   expect(locus!.start).toBe(Array.from(C1.slice(0,C1.lastIndexOf('lantern glows'))).length);
   const review=reviewFictionalCanonicalSelectionR43(base,request());
   expect(review.releaseApproved).toBe(false);
   expect(review.review.canWrite).toBe(false);
   expect(review.review.originalPassage).toBe('lantern glows');
   expect(review.review.proposedSectionText)
      .toBe('🍂 First lantern glows. Second lantern shimmers.\n\n');
   expect(review.untouchedSectionIds).toEqual([S2]);
   expect(review.sectionOrder).toEqual([S1,S2]);
   expect(sha(base.content)).toHaveLength(64);
 });
 it('refuses stale textarea body instead of relocating selected words',()=>{
   const stale=C1.replace('First lantern','Earlier lantern');
   const start=stale.lastIndexOf('lantern glows');
   const invalid=exactTextareaPassageR41(C1,stale,start,start+13);
   expect(invalid).toBeNull();
   expect(()=>reviewFictionalCanonicalSelectionR43(base,{
     ...request(),selected:invalid,
   })).toThrow(expect.objectContaining({code:'r43_stale_or_inexact_selection'}));
 });
 it('refuses a different Work, stale generation or wrong section',()=>{
   expect(()=>reviewFictionalCanonicalSelectionR43(base,{
     ...request(),expectedWorkId:'99999999-9999-4999-8999-999999999999',
   })).toThrow(expect.objectContaining({code:'r43_stale_or_foreign_work'}));
   expect(()=>reviewFictionalCanonicalSelectionR43(base,{
     ...request(),expectedGeneration:2,
   })).toThrow(expect.objectContaining({code:'r43_stale_or_foreign_work'}));
   expect(()=>reviewFictionalCanonicalSelectionR43(base,{
     ...request(),sectionId:S2,
   })).toThrow(expect.objectContaining({code:'r43_stale_or_inexact_selection'}));
 });
 it('refuses changed locus, guessed copy and unreviewed alternative',()=>{
   expect(()=>reviewFictionalCanonicalSelectionR43(base,{
     ...request(),selected:{...selected()!,text:'forged passage'},
   })).toThrow(expect.objectContaining({code:'r43_stale_or_inexact_selection'}));
   expect(()=>reviewFictionalCanonicalSelectionR43(base,{
     ...request(),chosenAlternativeId:'99999999-9999-4999-8999-999999999999',
   })).toThrow();
 });
 it('refuses duplicate section identity even with self-consistent ciphertext view',()=>{
   const duplicate:R35View={...base,sections:[base.sections[0],base.sections[0]],
      content:C1+C1};
   expect(()=>reviewFictionalCanonicalSelectionR43(duplicate,request()))
     .toThrow(expect.objectContaining({code:'r43_unknown_or_duplicate_section'}));
 });
 it('the real View and Shell remain component authorities; no Next route imports R43',()=>{
   const root=process.cwd();
   const view=readFileSync(path.join(root,
       'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
   const shell=readFileSync(path.join(root,
       'app/writers-studio/full-redesign/Shell.tsx'),'utf8');
   expect(view).toContain('selectionInPc3Editor(props.writing.bodyOf)');
   expect(view).toContain('props.onHoldPassage(section, picked.start, picked.end, picked.text)');
   expect(shell).toContain('data-r41-reset-column-widths');
   const linked=routes(path.join(root,'app','api')).filter(p=>
      /heldCanonicalReviewR43|reviewFictionalCanonicalSelectionR43/
       .test(readFileSync(p,'utf8')));
   expect(linked).toEqual([]);
 });
});
