/**
 * W2 Writer full blank arrival + actual WriteRoom + useSectionWriting save queue.
 * Fictional HTTP service persists through browser reload; does NOT use the
 * real manuscript route, member credentials, or database. No external network.
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const deps=path.join(root,'node_modules');
const esbuild=require(path.join(deps,'esbuild'));
const {chromium,webkit}=require(path.join(deps,'playwright'));
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const sha=(p)=>crypto.createHash('sha256').update(read(p)).digest('hex');
const sources=[
  'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx',
  'app/dev/writers-studio-pc3-live/P4R1BlankWritingArrival.tsx',
  'app/writers-studio/full-redesign/WriteRoom.tsx',
  'lib/writersStudio/useSectionWriting.ts',
  'lib/writersStudio/sectionSaveQueue.ts',
];
const hashes=Object.fromEntries(sources.map(s=>[s,sha(s)]));
const css=['app/dev/writers-studio-full-redesign-review/full-redesign-review.css',
'app/dev/writers-studio-p4r1/p4r1-live.css',
'app/dev/writers-studio-pc3-live/craft-editorial-r1.css']
.map(read).join('\n').replace(/@import\s+url\([^;]*;/gi,'');
const source=String.raw`
import React from 'react';
import {createRoot} from 'react-dom/client';
import {useSectionWriting} from './lib/writersStudio/useSectionWriting';
import {P4R1Pc3WriteEditView} from './app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView';

const id='fiction-sec';
const work={id:'fiction-work',title:'Fictional Work',purpose:null,form:'Book',stage:'writing',
 manuscriptState:'partial-manuscript',createdAt:'2026-10-21T12:00:00Z',updatedAt:'2026-10-21T12:00:00Z',
 expressions:[{expressionType:'manuscript',expressionId:'fiction-manuscript',declaredAt:'2026-10-21T12:00:00Z'}],
 materials:[]};
const initial=window.__fictionServerSnapshot;
const section={id,position:0,heading:'Opening',body:initial.body,editable:true};
const contextSection={draftSectionId:id,sourceSectionId:null,position:0,heading:'Opening',
 headingDepth:1,headingSignal:'member',body:initial.body,editable:true};
window.__wsW2={edits:[],version:initial.version,serverSaves:0};
function Fixture(){
 const writing=useSectionWriting([section],initial.version,async(sectionId,body,baseVersion)=>{
   const response=await fetch('/fiction-api/save',{method:'PUT',
    headers:{'content-type':'application/json'},body:JSON.stringify({sectionId,body,baseVersion})});
   const data=await response.json();
   if(data.ok)window.__wsW2.serverSaves++;
   return data;
 },'fiction-manuscript','fiction-sec');
 const props={context:{manuscriptId:'fiction-manuscript',title:'Fictional Work',version:initial.version,
  sections:[contextSection]},writing,work,appearance:'day',pathname:'/writers-studio',
  initialSearch:'?m=fiction-manuscript',initial:id,focusId:id,held:null,
  onFocusSection:()=>{},onHoldPassage:()=>{},onMode:()=>{},workspaceOpen:false,
  carriedInsight:null,carriedInsightReturnMode:null,attentionReturnItemId:null,
  lineageReturnChapterId:null,lineageReturnCandidateId:null,workspaceInsight:null,
  editorialThread:null,relationshipChoices:[],maiaRelationship:null,
  maiaRelationshipChoices:[],maiaRelationshipPhase:'ready',
  maiaRelationshipBusy:false,maiaRelationshipMessage:null,
  carrySourceAvailable:false,carryChooser:{kind:'closed'},selectedCarrySource:null,
  suggestedVersion:null,appliedVersionId:null,editorialDraft:'',editorialDepth:'guided',
  editLatitude:1,mayRemoveParagraphs:false,mayProposeImmediately:false,
  voiceNotice:null,sessionPosture:{resolved:true,sanctuary:false},editorialBusy:false,
  adoptionBusy:false,memberVersionBusy:false,editorialFailure:null,
  adoptionOutcome:null,undoMessage:null,lastMaiaEditorialTurn:null,
  onChooseSessionPosture:()=>{},onOpenWorkspace:()=>{},onDismissCarriedInsight:()=>{},
  onCloseWorkspace:()=>{},onReturnToStartingPassage:()=>{},
  canReturnToStartingPassage:false,onDepth:()=>{},onInstruction:()=>{},
  onSendEditorial:()=>{},onSelectVersion:()=>{},onApply:()=>{},onUndo:()=>{},
  onSaveMember:async()=>false,onKeep:()=>{},onLatitude:()=>{},onMayRemoveParagraphs:()=>{},
  onMayProposeImmediately:()=>{},onReviseInsight:()=>{},onChoosePassage:()=>{},
  onChooseRelationship:()=>{},onBeginMaiaRelationship:()=>{},
  onChooseMaiaRelationship:()=>{},onLeaveMaiaRelationship:()=>{},
  onOpenCarryChooser:()=>{},onCloseCarryChooser:()=>{},
  onSelectCarrySource:()=>{},onRemoveCarrySource:()=>{}};
 return <P4R1Pc3WriteEditView {...props}/>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;
async function bundle(options={}) {
 const witnessSource=source
   .replaceAll('fiction-sec',options.sectionId??'fiction-sec')
   .replaceAll('fiction-manuscript',options.manuscriptId??'fiction-manuscript');
 const stubs=/^(?:\.\/(?:ObservationManuscriptLayer|RevisionManuscriptLayer|EditorialDancePanel|IsolatedEditorialRoom|P4R1FocusMaterials)|@\/app\/writers-studio\/(?:canvas\/WorkConversation|insight\/RevisionDesk|insight\/InsightReadings))$/;
 const built=await esbuild.build({stdin:{contents:witnessSource,resolveDir:root,
 sourcefile:'fiction-w2.tsx',loader:'tsx'},absWorkingDir:root,
 bundle:true,platform:'browser',format:'iife',write:false,
 jsx:'automatic',jsxImportSource:'react',nodePaths:[deps],alias:{'@':root},
 define:{'process.env.NODE_ENV':'"production"'},
 plugins:[{name:'mock-next-and-heavy-context-only',setup(b){
  b.onResolve({filter:/^next\/navigation$/},()=>({path:'navigation',namespace:'w2'}));
  b.onResolve({filter:/^next\/link$/},()=>({path:'link',namespace:'w2'}));
  b.onResolve({filter:stubs},a=>({path:a.path,namespace:'w2'}));
  b.onLoad({filter:/.*/,namespace:'w2'},a=>({resolveDir:root,...(a.path==='navigation'
    ? {loader:'js',contents:"export function useSearchParams(){return new URLSearchParams('m=fiction-manuscript')} export function usePathname(){return '/writers-studio'}"}
    : a.path==='link'
    ? {loader:'jsx',contents:"import React from 'react';export default function Link(p){return <a href={p.href}>{p.children}</a>}"}
    : {loader:'jsx',contents:"import React from 'react';export default function Inert(p){return p.children??null;}"})}));
 }}]});
 return built.outputFiles[0].text;
}
function html(js,snapshot){
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
  +'<style>html,body,#root{margin:0;width:100%;height:100%;background:#faf8f3;} :root{--fr-serif-stack:Georgia,serif;--fr-sans-stack:Arial,sans-serif}</style>'
  +'<style>'+css+'</style></head><body><div id="root" class="fr-root p4r1-root"></div>'
  +'<script>window.__fictionServerSnapshot='+JSON.stringify(snapshot)+';</script>'
  +'<script>window.process={env:{NODE_ENV:"production"}};</script><script>'+js+'</script></body></html>';
}
async function runOne(name,engine,js,driver=null){
 const store={body:'',version:1,saveCalls:[],loadCount:0};
 const browser=await engine.launch(name==='Chromium'?
  {headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{headless:true});
 try{
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(8000);
  const errors=[],external=[],pages=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,250))});
  await page.route('**/*',async route=>{
   const url=route.request().url();
   if(url==='http://soullab-w2-fiction.test/'){
    if(driver){
      const snapshot=await driver.snapshot();
      store.body=snapshot.body;store.version=snapshot.version;
    }
    store.loadCount++;
    return route.fulfill({status:200,contentType:'text/html',body:html(js,{body:store.body,version:store.version})});
   }
   if(url==='http://soullab-w2-fiction.test/fiction-api/save'){
    const {sectionId,body,baseVersion}=route.request().postDataJSON();
    if(driver){
      const outcome=await driver.save({sectionId,body,baseVersion});
      if(outcome.status===200 && outcome.body?.ok){
        store.body=body;store.version=outcome.body.version;
        store.saveCalls.push({sectionId,body,baseVersion});
      }
      return route.fulfill({status:outcome.status,contentType:'application/json',body:JSON.stringify(outcome.body)});
    }
    if(sectionId!=='fiction-sec' || baseVersion!==store.version)
      return route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({ok:false,refusal:'stale_base'})});
    store.body=body;store.version++;store.saveCalls.push({sectionId,body,baseVersion});
    return route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({ok:true,version:store.version})});
   }
   external.push(url);
   return route.abort('blockedbyclient');
  });
  await page.goto('http://soullab-w2-fiction.test/',{waitUntil:'domcontentloaded'});
  try { await page.locator('[data-blank-writing-arrival]').waitFor({timeout:3000}); }
  catch(e) {
   const diagnostic=await page.evaluate(()=>({root:document.getElementById('root')?.innerHTML?.slice(0,1300),body:document.body.innerText?.slice(0,600)}));
   throw Error('BLANK_MOUNT_UNAVAILABLE '+JSON.stringify({diagnostic,errors,external,cause:String(e)}));
  }
  const before=await page.evaluate(()=>({overlay:document.querySelectorAll('[data-blank-writing-arrival]').length,
   editor:document.querySelectorAll('[data-write-editor]').length,
   saved:document.querySelector('[data-save-state]')?.textContent?.trim()}));
  await page.getByRole('button',{name:/Just start writing/}).click();
  await page.locator('[data-blank-writing-arrival]').waitFor({state:'detached'});
  await page.waitForTimeout(300);
  const focused=await page.evaluate(()=>{
   const ed=document.querySelector('[data-write-editor]'),r=ed?.getBoundingClientRect();
   return {actual:document.activeElement===ed,contenteditable:ed?.getAttribute('contenteditable'),
    role:ed?.getAttribute('role'),bounds:r&&{x:r.x,y:r.y,width:r.width,height:r.height},
    scroller:document.querySelector('.fr-write-scroll')?.getBoundingClientRect().toJSON(),
    visible:r&&r.width>0&&r.height>0&&r.top>=0&&r.top<window.innerHeight};
  });
  // The initial blank editor needs visible height and an insertion point.
  await page.keyboard.type('A fictional river curves through the silent orchard.');
  try {
   await page.waitForFunction(()=>document.querySelector('[data-save-state]')?.textContent?.trim()==='Saved'
    &&window.__wsW2?.serverSaves>=1,null,{timeout:6000});
  } catch(e){
   const diag=await page.evaluate(()=>({focused:document.activeElement===document.querySelector('[data-write-editor]'),
    body:document.querySelector('[data-write-editor]')?.innerText,saveState:document.querySelector('[data-save-state]')?.textContent,
    local:window.__wsW2,html:document.querySelector('[data-write-editor]')?.outerHTML.slice(0,400)}));
   throw Error('SAVE_TIMEOUT '+JSON.stringify({diag,store,errors,external,cause:String(e)}));
  }
  const typedDisplay=await page.locator('[data-write-editor]').innerText();
  const typed=(await page.locator('[data-write-editor]').getAttribute('data-j7-canonical'))??typedDisplay;
  pages.push({stage:'typed',typed,displayBody:typedDisplay,
    saveState:await page.locator('[data-save-state]').innerText()});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-write-editor]').waitFor();
  const restoredDisplay=await page.locator('[data-write-editor]').innerText();
  const restored=(await page.locator('[data-write-editor]').getAttribute('data-j7-canonical'))??restoredDisplay;
  pages.push({stage:'reopened',body:restored,displayBody:restoredDisplay});
  const ok=focused.actual&&focused.visible&&focused.contenteditable==='plaintext-only'
    &&typed.includes('A fictional river curves through the silent orchard.')
    &&store.body===typed&&restored===store.body
    &&store.saveCalls.length>=1&&errors.length===0&&external.length===0;
  await ctx.close();
  return {browser:name,pass:ok,before,focused,store:{version:store.version,
   saveCount:store.saveCalls.length,loadCount:store.loadCount,body:store.body},pages,errors,external};
 }finally{await browser.close();}
}
if(require.main===module){
(async()=>{const js=await bundle();const results=[];
 for(const [name,engine] of [['Chromium',chromium],['WebKit',webkit]]){
  try{const result=await runOne(name,engine,js);results.push(result);
   process.stdout.write(name+' '+(result.pass?'PASS':'FAIL')+' '+JSON.stringify(result)+'\n');}
  catch(e){results.push({browser:name,pass:false,error:String(e.stack||e)});process.stdout.write(name+' ERROR '+String(e.stack||e)+'\n');}
 }
 const summary={protocol:'soullab.ws.w2.browser.fictional-http.v1',date:new Date().toISOString(),
  sourceHashes:hashes,pass:results.every(r=>r.pass),results,
  limitations:'Fictional intercepted HTTP save service, not actual authenticated backend, not production or physical Safari'};
 const output=path.join('/Users/soullab/JARVIS-handoffs/WRITERS-STUDIO-OWNER-20261021','W2_BROWSER_FICTIONAL_HTTP_RECEIPT_20261021.json');
 fs.writeFileSync(output,JSON.stringify(summary,null,2)+'\n');
 console.log('RECEIPT',output,'PASS',summary.pass);
 if(!summary.pass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
}
module.exports={bundle,runOne,chromium,webkit};
