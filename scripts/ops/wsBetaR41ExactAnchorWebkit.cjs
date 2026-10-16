'use strict';
/**
 * R41: real WebKit checks EXACT imported selection helper used by canonical
 * P4R1Pc3WriteEditView. The DOM matches actual [data-write-editor] and
 * [data-whole-manuscript-section] scaffolds but is fictional, not a live app.
 *
 * Browser operates about:blank, no HTTP server/network, keys, DB, real author.
 */
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const {webkit}=require('playwright');
const esbuild=require('esbuild');

if(process.env.R41_EXACT_SELECTION_WEBKIT!=='fictional-only')
 throw Error('R41_WEBKIT_FIXTURE_OPT_IN_REQUIRED');
const work=process.cwd();
const receiptPath='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R41_REAL_EDITOR_SELECTION_WEBKIT_20261016.json';
const checks=[];
const result={
 protocol:'soullab.ws.r41.real-editor-anchor-fictitious-browser-test',
 status:'HOLD',
 checks,desktopWebkit:false,mobileWebkit:false,
 noExternalCalls:true,realMembersTouched:0,
 sourceHead:null,browserClosed:false,error:null,
};
const check=(yes,label)=>{
 if(!yes)throw Error('R41_SELECTION_ASSERTION_FAILED:'+label);
 checks.push(label);
};
const fixture=String.raw`<!doctype html><html><head><meta charset="utf-8"></head>
<body>
<main>
<section data-whole-manuscript-section="11111111-1111-4111-8111-111111111111">
 <textarea id="real-whole-manuscript-textarea" aria-label="Fictional editor"></textarea>
</section>
<div id="writer-editable" data-write-editor data-section-id="11111111-1111-4111-8111-111111111111" contenteditable="plaintext-only"><p id="author-paragraph">🍂 A lantern glows by the river. A lantern glows again.</p></div>
<div id="foreign-editable" data-write-editor data-section-id="22222222-2222-4222-8222-222222222222" contenteditable="plaintext-only"><p id="foreign-paragraph">🍂 A lantern glows by the river. A lantern glows again.</p></div>
</main></body></html>`;
const SAMPLE='🍂 A lantern glows by the river. A lantern glows again.';
async function main(){
 const built=await esbuild.build({
  entryPoints:[path.join(work,'lib/writersStudio/exactLiveSelectionR41.ts')],
  bundle:true,format:'iife',platform:'browser',
  globalName:'R41LiveSelection',write:false,logLevel:'silent',
 });
 const script=built.outputFiles[0].text;
 check(!script.includes('fetch('),'bundled real UI selection helper has no fetch calls');
 browser=await webkit.launch({headless:true});
 async function context(options){
  const ctx=await browser.newContext(options);
  await ctx.route('**/*',route=>{
   result.noExternalCalls=false;
   return route.abort();
  });
  return ctx;
 }
 const desktop=await context({viewport:{width:1440,height:900}});
 const page=await desktop.newPage();
 await page.setContent(fixture);
 await page.addScriptTag({content:script});
 check(await page.evaluate(()=>R41LiveSelection.R41_REAL_PROTECTED_APPLY_ENABLED)===false,
  'actual helper cannot approve protected real-member Apply');
 const textarea=page.locator('#real-whole-manuscript-textarea');
 await textarea.fill(SAMPLE);
 const second=await page.evaluate((source)=>{
  const field=document.getElementById('real-whole-manuscript-textarea');
  const start=source.lastIndexOf('lantern glows');
  field.setSelectionRange(start,start+'lantern glows'.length);
  return R41LiveSelection.exactTextareaPassageR41(
   source,field.value,field.selectionStart,field.selectionEnd);
 },SAMPLE);
 check(second?.text==='lantern glows'&&second?.start===
  Array.from(SAMPLE.slice(0,SAMPLE.lastIndexOf('lantern glows'))).length,
  'actual WebKit textarea returns exact SECOND duplicate phrase');
 const first=await page.evaluate((source)=>{
  const field=document.getElementById('real-whole-manuscript-textarea');
  const start=source.indexOf('lantern glows');
  field.setSelectionRange(start,start+'lantern glows'.length);
  return R41LiveSelection.exactTextareaPassageR41(
    source,field.value,field.selectionStart,field.selectionEnd);
 },SAMPLE);
 check(first?.start!==second?.start&&first?.text===second?.text,
  'same authored phrase selected FIRST gives a different exact locus');
 check(await page.evaluate((source)=>{
  const field=document.getElementById('real-whole-manuscript-textarea');
  return R41LiveSelection.exactTextareaPassageR41(
    source.replace('glows','shimmers'),field.value,
    field.selectionStart,field.selectionEnd)===null;
 },SAMPLE),'stale textarea text is refused, not searched elsewhere');
 const dom=await page.evaluate((source)=>{
  const editor=document.getElementById('writer-editable');
  const text=editor.querySelector('p').firstChild;
  const last=text.data.lastIndexOf('lantern glows');
  const range=document.createRange();
  range.setStart(text,last);range.setEnd(text,last+'lantern glows'.length);
  const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
  const exact=R41LiveSelection.exactDomPassageR41(source,editor,range);
  return {exact,selection:sel.toString(),body:source};
 },SAMPLE);
 check(dom.selection==='lantern glows'&&dom.exact?.text==='lantern glows'&&
  dom.exact?.start===second.start,
  'actual WebKit contenteditable anchors SECOND duplicate phrase by DOM Range');
 check(await page.evaluate((source)=>{
  const editor=document.getElementById('writer-editable');
  const other=document.getElementById('foreign-paragraph').firstChild;
  const range=document.createRange();
  range.setStart(other,2);range.setEnd(other,12);
  return R41LiveSelection.exactDomPassageR41(source,editor,range)===null;
 },SAMPLE),'selection belonging to another section is rejected');
 check(await page.evaluate((source)=>{
  const editor=document.getElementById('writer-editable');
  const text=document.getElementById('author-paragraph').firstChild;
  const range=document.createRange();
  const first=text.data.indexOf('lantern glows');
  range.setStart(text,first);range.setEnd(text,first+13);
  return R41LiveSelection.exactDomPassageR41(
   source+' something extra',editor,range)===null;
 },SAMPLE),'stale DOM does not silently relocate the selected writer passage');
 const unicode='🌿🦉🍂 moonlight listens, then moonlight listens';
 check(await page.evaluate(source=>{
  const field=document.getElementById('real-whole-manuscript-textarea');
  field.value=source;
  const ix=source.lastIndexOf('moonlight listens');
  field.setSelectionRange(ix,ix+'moonlight listens'.length);
  const selected=R41LiveSelection.exactTextareaPassageR41(
    source,field.value,field.selectionStart,field.selectionEnd);
  return selected?.start===Array.from(source.slice(0,ix)).length;
 },unicode),'emoji and supplementary-plane characters preserve codepoint offsets');
 result.desktopWebkit=true;
 await desktop.close();

 const mobile=await context({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();
 await phone.setContent(fixture);
 await phone.addScriptTag({content:script});
 const mobileSpan=await phone.evaluate(source=>{
  const editor=document.getElementById('real-whole-manuscript-textarea');
  editor.value=source;
  const ix=source.lastIndexOf('lantern glows');
  editor.setSelectionRange(ix,ix+'lantern glows'.length);
  return R41LiveSelection.exactTextareaPassageR41(
    source,editor.value,editor.selectionStart,editor.selectionEnd);
 },SAMPLE);
 check(mobileSpan?.start===second.start && mobileSpan?.end===second.end,
  'mobile WebKit text selection preserves the same exact duplicate anchor');
 result.mobileWebkit=true;
 await mobile.close();
 check(result.noExternalCalls,'actual WebKit did not initiate any network request');
 result.status='R41_ACTUAL_EDITOR_SELECTION_WEBKIT_FICTITIOUS_PASS';
}
let browser=null;
(async()=>{
 try{await main();}
 catch(e){
  result.error=String(e&&e.message||e).slice(0,250);
  process.exitCode=2;
 }finally{
  if(browser){try{await browser.close();result.browserClosed=true;}catch{}}
  const git=spawnSync('git',['rev-parse','HEAD'],{cwd:work,encoding:'utf8'});
  result.sourceHead=git.status===0?git.stdout.trim():null;
  fs.writeFileSync(receiptPath,JSON.stringify(result,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:result.status,checks:checks.length,
   desktop:result.desktopWebkit,mobile:result.mobileWebkit,
   noNetwork:result.noExternalCalls,browserClosed:result.browserClosed,
   sourceHead:result.sourceHead,error:result.error,realMemberRelease:'HOLD'}));
  if(result.status!=='R41_ACTUAL_EDITOR_SELECTION_WEBKIT_FICTITIOUS_PASS'||
     !result.browserClosed)process.exitCode=2;
 }
})();