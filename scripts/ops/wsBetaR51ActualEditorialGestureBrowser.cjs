'use strict';
/**
 * R51: ACTUAL PC3 EditorialDancePanel + canonical Shell and R41 selection,
 * browser actions against BOUNDED fictional loopback HTTP state machine.
 *
 * NOT P4R1WriteEditController, Next API route, R50 PostgreSQL custody,
 * MAIA inference, real session/consent, real KMS or beta writer authority.
 * The separately accepted R50 PG16 security tests cover those *server*
 * interfaces, not the browser's mock backend. Never conflate the results.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const esbuild=require('esbuild');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const FIXTURE=path.join(ROOT,'scripts/ops/fixtures/wsR51ActualEditorialGestureBrowser.tsx');
const run=process.env.R51_REAL_EDITORIAL_BROWSER_RUN||'v1';
const EVIDENCE=path.join('/Volumes/T7 Shield',
 'ws-beta-r51-real-editorial-browser-evidence-chatgpt-20261016-'+run);
const SHA=spawnSync('git',['rev-parse','HEAD'],{
 cwd:ROOT,encoding:'utf8'});
const SOURCE='🍂 First lantern glows. Second lantern glows.\n\n';
const SAVED='lantern shimmers';
const MEMBER_VERSION='99999999-9999-4999-8999-999999999991';
const SECTION='66666666-6666-4666-8666-666666666661';
const THREAD='77777777-7777-4777-8777-777777777777';
const MAIA='88888888-8888-4888-8888-888888888881';
const SESSION='r51_session=fictional_alpha';
const CSRF='r51-fixture-only-not-authority';
const MAX=2048;
const TYPE={'content-type':'application/json; charset=utf-8',
 'cache-control':'no-store','x-content-type-options':'nosniff'};
const record={
 protocol:'soullab.ws.r51.actual-PC3-editorial-browser.v1',
 sourceHead:null,decision:'HOLD',scope:'actual EditorialDancePanel + canonical Shell, NOT full PC3 controller',
 actualP4R1EditorialDancePanel:true,actualCanonicalShell:true,
 stagingHttpBackend:'fictional-only-in-memory-NOT_R50_or_PostgreSQL',
 realMemberAccess:false,liveNextRoute:false,
 externalModelCalls:0,productionChanged:false,
 checks:[],externalRequests:0,fictionalScreenshots:[],
 serverClosed:false,browsersClosed:false,error:null,
};
const check=(ok,what)=>{
 assert.ok(ok,'R51_BROWSER_ASSERTION_FAILED:'+what);
 record.checks.push(what);
};
if(process.env.R51_ACTUAL_EDITORIAL_BROWSER_FIXTURE!=='fictional-only'||
 !/^v[1-9][0-9]?$/.test(run)||SHA.status!==0||
 !fs.existsSync(FIXTURE)||fs.existsSync(EVIDENCE))
 throw Error('R51_default_off_or_existing_evidence');
record.sourceHead=SHA.stdout.trim();
fs.mkdirSync(EVIDENCE,{mode:0o700,recursive:false});
const clean=(r)=>r.setHeader('cache-control','no-store');
const send=(res,status,data)=>{
 res.writeHead(status,TYPE);
 res.end(JSON.stringify(data));
};
function readJson(req){
 return new Promise((resolve,reject)=>{
  let size=0,text='';
  req.on('data',buf=>{
   size+=buf.length;
   if(size>MAX){reject(Error('oversized_fixture_post'));req.destroy();return;}
   text+=buf.toString('utf8');
  });
  req.on('end',()=>{
   try{resolve(JSON.parse(text));}catch(e){reject(e);}
  });
  req.on('error',reject);
 });
}
function freshState(){
 return {saved:false,prepared:false,applied:false,undone:false,
  applyTokenSHA:null,undoTokenSHA:null,lastApplyToken:null,
  prepareRequests:0,applyWrites:0,undoWrites:0,saveWrites:0,
  denied:0,invalidBody:0,applyBodies:[],undoBodies:[],origins:[],
  exactVersion:MEMBER_VERSION,savedWording:null};
}
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function boundedServer(js,css){
 let state=freshState(),origin=null;
 const html='<!doctype html><html><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width, initial-scale=1">'+
  '<title>R51 Fictional Actual PC3 Editorial UI</title>'+
  '<style>html,body{height:100%;width:100%;margin:0;padding:0;}'+
   'button:disabled{cursor:not-allowed;opacity:.50}'+css+'</style>'+
  '</head><body><div id="root"></div><script src="/fixture.js" defer></script></body></html>';
 const server=http.createServer(async(req,res)=>{
  const addr=origin?.slice('http://'.length);
  if(!addr||req.headers.host!==addr){
   state.denied++;send(res,404,{kind:'refused',reason:'untrusted_fixture_host'});return;
  }
  if(req.method==='GET'&&req.url==='/'){
   res.writeHead(200,{
    'content-type':'text/html;charset=utf-8','cache-control':'no-store',
    'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:;",
   });
   res.end(html);return;
  }
  if(req.method==='GET'&&req.url==='/fixture.js'){
   res.writeHead(200,{'content-type':'text/javascript;charset=utf-8','cache-control':'no-store'});
   res.end(js);return;
  }
  const authenticated=req.headers.cookie===SESSION;
  if(!authenticated){
   state.denied++;send(res,403,{kind:'refused',reason:'fictional_session_required'});return;
  }
  if(req.method==='GET'&&req.url==='/fictional-prepare'){
   if(!state.saved||state.applied||state.undone){
    state.denied++;send(res,409,{kind:'refused',reason:'no_fictional_saved_review'});return;
   }
   const token=crypto.randomBytes(32).toString('base64url');
   state.applyTokenSHA=hash(token);
   state.lastApplyToken=token;
   state.prepared=true;state.prepareRequests++;
   send(res,200,{kind:'fictional_durable_approval_prepared',opaqueToken:token,
    releaseApproved:false});return;
  }
  if(req.method==='GET'&&req.url==='/fictional-prepare-undo'){
   if(!state.applied||state.undone){
    state.denied++;send(res,409,{kind:'refused',reason:'no_proven_apply_to_undo'});return;
   }
   const token=crypto.randomBytes(32).toString('base64url');
   state.undoTokenSHA=hash(token);
   send(res,200,{kind:'fictional_durable_undo_prepared',opaqueToken:token,
    releaseApproved:false});return;
  }
  if(req.method!=='POST'||!['/fictional-save-member','/fictional-apply','/fictional-undo'].includes(req.url)){
   state.denied++;send(res,404,{kind:'refused',reason:'not_an_enabled_fixture_route'});return;
  }
  if(req.headers.origin!==origin||req.headers['x-r51-editorial-fixture-csrf']!==CSRF||
   !/^application\/json(?:;\s*charset=utf-8)?$/i.test(req.headers['content-type']||'')){
   state.denied++;send(res,403,{kind:'refused',reason:'invalid_same_origin_fixture'});return;
  }
  let input;
  try{input=await readJson(req);}catch{
   state.denied++;send(res,400,{kind:'refused',reason:'malformed_or_oversized_fixture_body'});return;
  }
  if(!input||typeof input!=='object'||Array.isArray(input)){
   state.denied++;send(res,400,{kind:'refused',reason:'invalid_fixture_body'});return;
  }
  const keys=Object.keys(input).sort().join('|');
  if(req.url==='/fictional-save-member'){
   if(keys!=='purpose|sectionId|supersedes|text|threadId'||
    state.saved||input.threadId!==THREAD||input.sectionId!==SECTION||
    input.supersedes!==MAIA||input.text!==SAVED||typeof input.purpose!=='string'){
    state.denied++;send(res,409,{kind:'refused',reason:'unreviewed_fictional_member_version'});return;
   }
   state.saved=true;state.savedWording=input.text;state.saveWrites++;
   send(res,200,{kind:'fictional_member_version_saved',versionId:MEMBER_VERSION,
    releaseApproved:false});return;
  }
  if(req.url==='/fictional-apply'){
   if(keys!=='kind|opaqueToken'||input.kind!=='apply_reviewed_change'||
     typeof input.opaqueToken!=='string'||!state.applyTokenSHA||
     hash(input.opaqueToken)!==state.applyTokenSHA||!state.saved||
     !state.prepared||state.applied||state.undone){
    state.denied++;state.invalidBody++;
    send(res,409,{kind:'refused',reason:'absent_changed_or_spent_fictional_approval'});return;
   }
   state.applyBodies.push(keys);
   state.applied=true;state.applyWrites=1;
   state.applyTokenSHA=null;state.prepared=false;
   send(res,200,{kind:'fictional_durably_claimed_encrypted_apply',
    action:'apply',generation:2,durableClaimSpent:true,releaseApproved:false});return;
  }
  if(keys!=='kind|opaqueToken'||input.kind!=='undo_reviewed_change'||
    typeof input.opaqueToken!=='string'||!state.undoTokenSHA||
    hash(input.opaqueToken)!==state.undoTokenSHA||!state.applied||state.undone){
   state.denied++;state.invalidBody++;
   send(res,409,{kind:'refused',reason:'absent_or_spent_fictional_undo'});return;
  }
  state.undoBodies.push(keys);state.undoWrites=1;state.undone=true;
  state.undoTokenSHA=null;
  send(res,200,{kind:'fictional_durable_undo_confirmed',
   generation:3,durableClaimSpent:true,releaseApproved:false});
 });
 return {server,setOrigin:s=>{origin=s;},reset:()=>{state=freshState();},
   getState:()=>state,origin:()=>origin};
}
async function compileClient(){
 const plugins=[{name:'r51-no-real-next-router',setup(build){
  build.onResolve({filter:/^next\/navigation$/},()=>
   ({path:'r51-next-navigation',namespace:'r51shim'}));
  build.onResolve({filter:/^@\/lib\/cabin\/doorway$/},()=>
   ({path:'r51-cabin-door',namespace:'r51shim'}));
  build.onLoad({filter:/r51-next-navigation/,namespace:'r51shim'},()=>({
   contents:'export const usePathname=()=>"/writers-studio";export const useSearchParams=()=>new URLSearchParams("mode=write");',
   loader:'js',
  }));
  build.onLoad({filter:/r51-cabin-door/,namespace:'r51shim'},()=>({
   contents:'export const isCabinOrigin=()=>false; export const cabinReturnPath=()=>"/cabin";',
   loader:'js',
  }));
 }}];
 const bundle=await esbuild.build({
  absWorkingDir:ROOT,entryPoints:[FIXTURE],
  bundle:true,platform:'browser',format:'iife',jsx:'automatic',
  alias:{'@':ROOT},plugins,write:false,logLevel:'silent',
 });
 return bundle.outputFiles[0].text;
}
const cssPaths=[
 'app/dev/writers-studio-full-redesign-review/full-redesign-review.css',
 'app/dev/writers-studio-p4r1/p4r1-live.css',
 'app/writers-studio/insight/insight.css',
];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function launchPlaywright(){
 let chrome=null,webkitBrowser=null,backend=null;
 try{
  const css=cssPaths.map(p=>fs.readFileSync(path.join(ROOT,p),'utf8')).join('\n');
  const bundle=await compileClient();
  backend=boundedServer(bundle,css);
  await new Promise((resolve,reject)=>{
   backend.server.once('error',reject);
   backend.server.listen(0,'127.0.0.1',resolve);
  });
  const port=backend.server.address().port;
  const origin='http://127.0.0.1:'+port;
  backend.setOrigin(origin);
  chrome=await chromium.launch({headless:true,channel:'chrome'});
  webkitBrowser=await webkit.launch({headless:true});
  const runs=[['CHROMIUM',chrome],['WEBKIT',webkitBrowser]];
  for(const [name,browser] of runs){
   backend.reset();
   const ctx=await browser.newContext({viewport:{width:1440,height:900}});
   let page=null;
   const errors=[];
   try{
    await ctx.addCookies([{name:'r51_session',value:'fictional_alpha',
      url:origin,httpOnly:true,sameSite:'Strict'}]);
    await ctx.route('**/*',route=>{
     if(route.request().url().startsWith(origin+'/'))return route.continue();
     record.externalRequests++;return route.abort();
    });
    page=await ctx.newPage();
    page.on('pageerror',e=>errors.push(String(e)));
    const resp=await page.goto(origin+'/',{waitUntil:'load'});
    check(resp?.status()===200,name+' actual editorial UI HTTP loopback page 200');
    await page.locator('[data-r51-work]').waitFor({timeout:10000});
    check(await page.locator('.fr-shell[data-mode="write"]').count()===1,
      name+' actual canonical Shell rendered');
    const original=await page.locator('#r51-manuscript').inputValue();
    check(original===SOURCE,name+' invented manuscript original correct');
    check(await page.locator('[data-editorial-dance]').count()===0,
      name+' editorial panel not opened before exact author selection');
    const field=page.locator('#r51-manuscript');
    await field.evaluate(el=>{
     el.focus();const i=el.value.lastIndexOf('lantern glows');
     el.setSelectionRange(i,i+'lantern glows'.length);
     el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
    });
    await page.waitForFunction(()=>window.__r51Selection?.text==='lantern glows');
    const selected=await page.evaluate(()=>window.__r51Selection);
    check(selected.start===Array.from(SOURCE.slice(0,SOURCE.lastIndexOf('lantern glows'))).length,
      name+' actual R41 selection targets second repeated Unicode passage');
    await page.locator('[data-editorial-dance]').waitFor();
    const apply=page.getByRole('button',{name:'Apply my version'});
    check(await apply.isDisabled(),
      name+' actual PC3 Apply disabled before personal version saved/reviewed');
    const before=await fetch(origin+'/fictional-prepare',{headers:{cookie:SESSION}});
    check(before.status===409,name+' server prepares no token before personal save');
    // MAIA recommendation alone is explicitly insufficient.
    await page.getByRole('button',{name:'Read my version in context'}).click();
    check(await apply.isDisabled(),name+' reading MAIA-only proposal cannot Apply');
    // Selecting a direction anew is an intentional new review gesture and
    // invalidates the earlier preview. If the writer has reviewed identical
    // bytes before saving, the real editor intentionally preserves that review.
    // Here we explicitly select again to exercise the save→read→Apply order.
    await page.locator('.p4r1-dance-options > button').first().click();
    check(await apply.isDisabled(),name+' changing selected version resets prior preview');
    const save=page.getByRole('button',{name:'Save my version',exact:true});
    check(await save.isEnabled(),name+' save personal revision available while Ordinary');
    await save.click();
    await page.waitForFunction(()=>window.__r51SavedVersion==='99999999-9999-4999-8999-999999999991');
    check(backend.getState().saveWrites===1&&backend.getState().applyWrites===0,
      name+' real Save my version did not mutate manuscript');
    check(await apply.isDisabled(),name+' saved personal version requires separate contextual reread');
    await page.getByRole('button',{name:'Read my version in context'}).click();
    check(await apply.isEnabled(),name+' real Read in context unlocks explicit author Apply');
    // An unsaved alteration, even if later typed back to the same exact
    // characters, must require a FRESH contextual reading. Old view state
    // is not proof that the newly edited draft was reviewed.
    const working=page.getByRole('textbox',{name:'Edit your working version'});
    await working.fill('lantern brightens');
    check(await apply.isDisabled(),
      name+' changed unsaved member wording disables Apply');
    await working.fill(SAVED);
    check(await apply.isDisabled(),
      name+' typing the same words back does not resurrect old preview');
    await page.getByRole('button',{name:'Read my version in context'}).click();
    check(await apply.isEnabled(),
      name+' only a new contextual reading makes restored words Apply-ready');
    check(backend.getState().applyWrites===0&&backend.getState().saveWrites===1,
      name+' edit and reread never write the manuscript');
    // Entering Sanctuary must prevent a persistent editorial Apply.
    await page.locator('#r51-sanctuary').click();
    check(await page.evaluate(()=>window.__r51SessionPosture?.sanctuary===true),
      name+' member changed to Sanctuary before Apply');
    check(await apply.isDisabled(),
      name+' Sanctuary posture disables persistent Apply in actual PC3 editor');
    check(await page.getByRole('button',{name:/^(Saved as my version|Save my version)$/}).isDisabled(),
      name+' Sanctuary posture disables persistent Save in actual PC3 editor');
    check(backend.getState().applyWrites===0,
      name+' Sanctuary author gesture never wrote to fake server');
    await page.locator('#r51-sanctuary').click();
    check(await apply.isEnabled(),
      name+' Ordinary session restores the explicitly reviewed Apply action');
    // Button invokes fixture PREPARE + token-only APPLY, never client prose.
    await apply.click();
    await page.waitForFunction(()=>window.__r51Applied==='99999999-9999-4999-8999-999999999991');
    check(backend.getState().applyWrites===1&&backend.getState().prepareRequests===1,
      name+' exactly one author-click Apply, one approval, one fake commit');
    check(backend.getState().applyBodies.join(',')==='kind|opaqueToken',
      name+' real Apply sends only opaque token and action, never Work or prose');
    check((await field.inputValue())===
      SOURCE.slice(0,SOURCE.lastIndexOf('lantern glows'))+
      SAVED+SOURCE.slice(SOURCE.lastIndexOf('lantern glows')+'lantern glows'.length),
      name+' only exact second selected occurrence changed in browser');
    const replay=await fetch(origin+'/fictional-apply',{
     method:'POST',headers:{
      cookie:SESSION,origin,'content-type':'application/json',
      'x-r51-editorial-fixture-csrf':CSRF,
     },
     body:JSON.stringify({kind:'apply_reviewed_change',
      opaqueToken:backend.getState().lastApplyToken}),
    });
    check(replay.status===409&&backend.getState().applyWrites===1,
      name+' repeating same spent Apply token is denied, never a second change');
    const undoButton=page.getByRole('button',{name:'Undo this change'});
    await undoButton.waitFor({timeout:6500});
    check(await undoButton.isEnabled(),name+' separate Undo displayed after confirmed Apply');
    await page.locator('#r51-sanctuary').click();
    check(await undoButton.isDisabled(),
      name+' Sanctuary posture disables persistent Undo in actual PC3 editor');
    await page.locator('#r51-sanctuary').click();
    check(await undoButton.isEnabled(),
      name+' separately confirmed Ordinary session permits explicit Undo');
    await undoButton.click();
    await page.waitForFunction(source=>window.__r51Applied===null&&
      window.__r51Manuscript===source,SOURCE);
    check(backend.getState().undoWrites===1&&backend.getState().applyWrites===1,
      name+' explicit separate Undo returns exact prior browser words');
    check(backend.getState().undoBodies.join(',')==='kind|opaqueToken',
      name+' Undo POST sends opaque token and action only');
    check(errors.length===0,name+' no browser JS errors');
    const shot=path.join(EVIDENCE,'R51_'+name+'_REAL_PC3_EDITORIAL_FICTIONAL_DESKTOP.png');
    check(!fs.existsSync(shot),name+' refuses screenshot overwrite');
    await page.screenshot({path:shot,fullPage:false});
    record.fictionalScreenshots.push(path.basename(shot));
   }finally{
    await ctx.close();
   }
   const mobile=await browser.newContext({
    viewport:{width:390,height:844},isMobile:true,hasTouch:true,
   });
   try{
    backend.reset();
    await mobile.addCookies([{name:'r51_session',value:'fictional_alpha',
     url:origin,httpOnly:true,sameSite:'Strict'}]);
    await mobile.route('**/*',route=>{
     if(route.request().url().startsWith(origin+'/'))return route.continue();
     record.externalRequests++;return route.abort();
    });
    const phone=await mobile.newPage();
    phone.on('pageerror',e=>errors.push(String(e)));
    await phone.goto(origin+'/',{waitUntil:'load'});
    const locus=phone.locator('#r51-manuscript');
    await locus.waitFor();
    check(await phone.locator('.fr-shell[data-mode="write"]').count()===1,
      name+' actual canonical Shell mobile');
    const panels=await phone.evaluate(()=>{
     const field=document.querySelector('#r51-manuscript');
     const maia=document.querySelector('.fr-maia');
     return {field:field?.getBoundingClientRect()?.top,
      maia:maia?.getBoundingClientRect()?.top};
    });
    check(typeof panels.field==='number'&&panels.field<400,
      name+' narrow mobile Work begins visibly above lower panels');
    await locus.evaluate(el=>{
     el.focus();const i=el.value.lastIndexOf('lantern glows');
     el.setSelectionRange(i,i+'lantern glows'.length);
     el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
    });
    await phone.locator('[data-editorial-dance]').waitFor();
    check(await phone.getByRole('button',{name:'Apply my version'}).isDisabled(),
      name+' mobile actual PC3 Apply disabled before author review');
    const shot=path.join(EVIDENCE,'R51_'+name+'_REAL_PC3_EDITORIAL_FICTIONAL_MOBILE.png');
    check(!fs.existsSync(shot),name+' mobile screenshot unique');
    await phone.screenshot({path:shot,fullPage:false});
    record.fictionalScreenshots.push(path.basename(shot));
    check(errors.length===0,name+' desktop and mobile no browser JS exceptions');
   }finally{await mobile.close();}
  }
  // Independent malicious requests cannot counterfeit legitimate clicks.
  const wrong=await fetch(origin+'/fictional-apply',{
   method:'POST',headers:{'content-type':'application/json',
    origin,cookie:SESSION,'x-r51-editorial-fixture-csrf':CSRF},
   body:JSON.stringify({kind:'apply_reviewed_change',opaqueToken:'X'.repeat(43),
    workId:'forged-work',wording:'malicious'}),
  });
  check(wrong.status===409,'forged client Work/wording refused by closed server');
  const nonAuth=await fetch(origin+'/fictional-prepare',{
   headers:{cookie:'r51_session=attacker'},
  });
  check(nonAuth.status===403,'absent or mismatched fictional cookie refused');
  check(record.externalRequests===0,'browser never called off-device network or model');
  record.decision='R51_ACTUAL_PC3_EDITORIAL_GESTURE_BROWSER_PASS_RELEASE_HOLD';
 }finally{
  if(chrome)await chrome.close();
  if(webkitBrowser)await webkitBrowser.close();
  record.browsersClosed=true;
  if(backend?.server?.listening){
   await new Promise((resolve,reject)=>backend.server.close(e=>e?reject(e):resolve()));
  }
  record.serverClosed=true;
 }
}
(async()=>{
 try{
  await launchPlaywright();
 }catch(e){
  record.error=String(e?.message||e).slice(0,350);
  record.decision='R51_EDITORIAL_BROWSER_HOLD';
 }finally{
  const destination=path.join(EVIDENCE,'R51_ACTUAL_EDITORIAL_BROWSER_EVIDENCE.json');
  const fd=fs.openSync(destination,'wx',0o600);
  fs.writeFileSync(fd,JSON.stringify(record,null,2));fs.closeSync(fd);
  console.log(JSON.stringify({
   sourceHead:record.sourceHead,decision:record.decision,
   checks:record.checks.length,externalRequests:record.externalRequests,
   browsersClosed:record.browsersClosed,serverClosed:record.serverClosed,
   error:record.error,releaseApproved:false,
  }));
  if(record.error||record.decision!=='R51_ACTUAL_PC3_EDITORIAL_GESTURE_BROWSER_PASS_RELEASE_HOLD'||
     !record.serverClosed||!record.browsersClosed)process.exitCode=2;
 }
})();
