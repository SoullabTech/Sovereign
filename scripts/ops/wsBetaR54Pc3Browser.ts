/**
 * R54 localhost fictional browser witness:
 * actual canonical Shell + actual R41 selector + R54 component actually
 * imported into PC3 Writer View (source literal OFF on real route).
 *
 * The synthetic server injects an existing TEST signed-session fixture only
 * after checking a localhost-only HttpOnly cookie and same-origin request.
 * Not real Soullab authentication, CSRF or operational KMS.
 */
import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';
import {randomBytes} from 'node:crypto';
import {mkdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {chromium,webkit} from 'playwright';
import {build} from 'esbuild';

export const R54_REAL_BROWSER_AUTHOR_ROUTE_ENABLED=false as const;
const ROOT=process.cwd();
const fixture=path.join(ROOT,'scripts/ops/fixtures/wsR54Pc3AuthorBrowser.tsx');
const style=path.join(ROOT,
 'app/dev/writers-studio-full-redesign-review/full-redesign-review.css');
const C1='R38 first fictional section\n\n';
const BEFORE='first fictional',AFTER='first enchanted';
type State={generation:number;sectionId:string;body:string;
 action:'start'|'save'|'checkpoint'|'restore';restoredFrom:number|null};
type Operations={
 current():Promise<State>;
 dispatch(action:'review'|'apply'|'undo-review'|'undo',body:unknown):Promise<unknown>;
};
type Visit={
 engine:'chromium'|'webkit';operations:Operations;
 evidenceDir:string;check:(passed:boolean,label:string)=>void;
};
function reject(res:ServerResponse,status:number){
 res.statusCode=status;
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.end(JSON.stringify({kind:'refused',reason:'fictional_request_held',
  releaseApproved:false}));
}
async function bounded(req:IncomingMessage):Promise<unknown>{
 let text='';
 for await(const block of req){
  text+=String(block);
  if(Buffer.byteLength(text,'utf8')>2048)throw Error('R54_BODY_TOO_LARGE');
 }
 return JSON.parse(text) as unknown;
}
async function bundle(){
 const project=await build({
  absWorkingDir:ROOT,entryPoints:[fixture],
  bundle:true,platform:'browser',format:'iife',jsx:'automatic',
  write:false,alias:{'@':ROOT},logLevel:'silent',
  plugins:[{
   name:'r54-fictional-next-shim',
   setup(build){
    build.onResolve({filter:/^next\/navigation$/},()=>({
     path:'r54-next-navigation',namespace:'r54-shim',
    }));
    build.onResolve({filter:/^@\/lib\/cabin\/doorway$/},()=>({
     path:'r54-cabin-doorway',namespace:'r54-shim',
    }));
    build.onLoad({filter:/r54-next-navigation/,namespace:'r54-shim'},()=>({
     contents:'export const usePathname=()=>"/writers-studio";'+
      'export const useSearchParams=()=>new URLSearchParams("mode=write");',
     loader:'js',
    }));
    build.onLoad({filter:/r54-cabin-doorway/,namespace:'r54-shim'},()=>({
     contents:'export const isCabinOrigin=()=>false;'+
      'export const cabinReturnPath=()=>"/cabin";',loader:'js',
    }));
   },
  }],
 });
 return project.outputFiles[0].text;
}
export async function runR54Pc3FictionalBrowser(w:Visit):Promise<{
 engine:'chromium'|'webkit';browserClosed:true;
 serverClosed:true;externalRequests:0;screenshots:string[];
 checksPassed:number;
}>{
 if(R54_REAL_BROWSER_AUTHOR_ROUTE_ENABLED!==false||
  process.env.R54_PC3_BROWSER_FIXTURE!=='fictional-only'||
  process.env.R53_CANONICAL_AUTHOR_FIXTURE!=='fictional-only'||
  process.env.R54_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
  !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
   process.env.DATABASE_URL||'')||
  !/^\/.*\/ws-r35-physical-[^/]+\/vault$/.test(
   process.env.FILE_STORAGE_PATH||''))
  throw Error('R54_BROWSER_REAL_MEMBER_WORK_DISABLED');
 mkdirSync(w.evidenceDir,{recursive:true});
 const js=await bundle(),css=readFileSync(style,'utf8');
 const token=randomBytes(18).toString('base64url');
 let origin='',serverClosed=false,externalRequests=0;
 let previewPosts=0,applyPosts=0,undoReviewPosts=0,undoPosts=0;
 const html='<!doctype html><html><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<title>R54 fictional PC3 author journey</title>'+
  '<style>html,body{margin:0;padding:0;width:100%;height:100%;}'+css+'</style>'+
  '</head><body><div id="root"></div><script src="/r54-client.js" defer></script></body></html>';
 const server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',
   "default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; "+
   "connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'");
  if(req.socket.remoteAddress!=='127.0.0.1'||
    req.headers.host!==origin.slice('http://'.length)){
   reject(res,403);return;
  }
  if(!req.headers.cookie?.split(';').map(v=>v.trim())
   .includes('r54_fictional_session='+token)){
   reject(res,401);return;
  }
  if(req.method==='GET'&&req.url==='/'){
   res.setHeader('Content-Type','text/html; charset=utf-8');
   res.end(html);return;
  }
  if(req.method==='GET'&&req.url==='/r54-client.js'){
   res.setHeader('Content-Type','application/javascript; charset=utf-8');
   res.end(js);return;
  }
  if(req.method==='GET'&&req.url==='/r54/state'){
   try{
    const out=await w.operations.current();
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.end(JSON.stringify(out));
   }catch{reject(res,409);}
   return;
  }
  if(req.method!=='POST'||![
    '/r54/review','/r54/apply','/r54/undo-review','/r54/undo',
   ].includes(req.url||'')){
   reject(res,404);return;
  }
  if(req.headers.origin!==origin||
   req.headers['x-r54-fictional-csrf']!=='fictional-single-host-browser'||
   !String(req.headers['content-type']||'').startsWith('application/json')){
   reject(res,403);return;
  }
  try{
   const payload=await bounded(req);
   const action=req.url==='/r54/review'?'review':
    req.url==='/r54/apply'?'apply':
    req.url==='/r54/undo-review'?'undo-review':'undo';
   if(action==='review')previewPosts++;
   if(action==='apply')applyPosts++;
   if(action==='undo-review')undoReviewPosts++;
   if(action==='undo')undoPosts++;
   const result=await w.operations.dispatch(action,payload);
   if(!result||typeof result!=='object'||
     (result as {kind?:string}).kind==='refused'){
    reject(res,409);return;
   }
   res.setHeader('Content-Type','application/json; charset=utf-8');
   res.end(JSON.stringify(result));
  }catch{reject(res,409);}
 });
 const screenshots:string[]=[];
 let checksPassed=0;
 const check=(passed:boolean,label:string)=>{
  w.check(passed,label);
  checksPassed++;
 };
 const browserType=w.engine==='chromium'?chromium:webkit;
 let browser:Awaited<ReturnType<typeof chromium.launch>>|null=null;
 try{
  await new Promise<void>((resolve,reject)=>{
   server.once('error',reject);
   server.listen(0,'127.0.0.1',()=>resolve());
  });
  const listening=server.address();
  if(!listening||typeof listening==='string')
   throw Error('R54_LOCAL_ONLY_SERVER_ADDRESS_UNAVAILABLE');
  origin='http://127.0.0.1:'+listening.port;
  browser=await browserType.launch(w.engine==='chromium'?{
   headless:true,
   executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  }:{headless:true});
  const context=await browser.newContext({
   viewport:{width:1440,height:900},acceptDownloads:false,
  });
  await context.addCookies([{name:'r54_fictional_session',value:token,
   url:origin,httpOnly:true,sameSite:'Strict'}]);
  await context.route('**/*',route=>{
   if(route.request().url().startsWith(origin+'/'))return route.continue();
   externalRequests++;return route.abort('blockedbyclient');
  });
  const page=await context.newPage();
  const browserErrors:string[]=[];
  page.on('pageerror',e=>browserErrors.push(String(e).slice(0,120)));
  const opened=await page.goto(origin+'/',{waitUntil:'networkidle'});
  check(opened?.status()===200,w.engine+' fictional PC3 host served localhost-only');
  await page.locator('[data-r54-fictional-work]').waitFor({timeout:13000});
  await page.getByText('Protected working version 1').waitFor();
  const editor=page.locator('#r54-body');
  check(await editor.inputValue()===C1,w.engine+' exact initial protected fictional manuscript');
  check(await page.locator('.fr-shell[data-mode="write"]').count()===1,
   w.engine+' renders the ACTUAL PC3 canonical Shell');
  check(previewPosts===0&&applyPosts===0&&undoReviewPosts===0&&undoPosts===0,
   w.engine+' did not authorize any editorial action on arrival');
  check(await page.locator('#r54-apply').count()===0,
   w.engine+' Apply is invisible before review');
  const noCookie=await context.request.get(origin+'/r54/state',{
   headers:{Cookie:'r54_fictional_session=wrong'},
  });
  check(noCookie.status()===401,w.engine+' wrong fictional cookie cannot read Work');
  const forbidden=await page.evaluate(async()=>{
   const r=await fetch('/r54/apply',{method:'POST',credentials:'same-origin',
    headers:{'content-type':'application/json','x-r54-fictional-csrf':'wrong'},
    body:JSON.stringify({kind:'apply_reviewed_change',opaqueToken:'A'.repeat(43)})});
   return r.status;
  });
  check(forbidden===403,w.engine+' forged same-origin gesture marker refused');
  await editor.evaluate((node)=>{
   const el=node as HTMLTextAreaElement;
   el.focus();
   const start=el.value.indexOf('first fictional');
   el.setSelectionRange(start,start+'first fictional'.length);
   el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
  });
  await page.waitForFunction(()=>Boolean((window as any).__r54Selected),null,
   {timeout:8000});
  check(await page.locator('#r54-selection').getAttribute('data-r54-selection')==='exact',
   w.engine+' actual R41 codepoint-selected passage is exact');
  await page.locator('[data-r54-choice]').first().click();
  check(previewPosts===0&&applyPosts===0,
   w.engine+' selecting an alternative is NOT Apply or Review');
  await page.locator('#r54-review').click();
  await page.locator('[data-r54-preview]').waitFor({timeout:8500});
  check((await page.locator('[data-r54-before]').textContent())===BEFORE&&
   (await page.locator('[data-r54-after]').textContent())===AFTER,
   w.engine+' protected preview shows correct before/after words');
  check(previewPosts===1&&applyPosts===0,
   w.engine+' Read in context never calls encrypted writer');
  check(await editor.inputValue()===C1,
   w.engine+' reviewing leaves original manuscript unchanged');
  const readShot=path.join(w.evidenceDir,
   'R54_'+w.engine.toUpperCase()+'_FICTIONAL_PC3_REVIEW.png');
  await page.screenshot({path:readShot});screenshots.push(readShot);
  await page.locator('#r54-apply').click();
  await page.getByText('Protected working version 2').waitFor({timeout:12000});
  check(applyPosts===1,w.engine+' distinct Apply click performed one signed request');
  check((await editor.inputValue()).includes(AFTER),
   w.engine+' actual encrypted saved version reopened into visible Work');
  await page.reload({waitUntil:'networkidle'});
  await page.getByText('Protected working version 2').waitFor({timeout:12000});
  check(await page.locator('#r54-review-undo').isVisible(),
   w.engine+' restart/reload retains distinct Undo invitation');
  const appliedShot=path.join(w.evidenceDir,
   'R54_'+w.engine.toUpperCase()+'_FICTIONAL_PC3_APPLIED.png');
  await page.screenshot({path:appliedShot});screenshots.push(appliedShot);
  check(undoReviewPosts===0&&undoPosts===0,
   w.engine+' browser return never automatically authorizes Undo');
  await page.locator('#r54-review-undo').click();
  await page.locator('#r54-undo').waitFor({timeout:9000});
  check(undoReviewPosts===1&&undoPosts===0,
   w.engine+' Undo review is separate from restoring manuscript');
  await page.locator('#r54-undo').click();
  await page.getByText('Protected working version 3').waitFor({timeout:12000});
  check(undoPosts===1,w.engine+' explicit separate Undo saved one new version');
  check((await editor.inputValue())===C1,
   w.engine+' restored immutable original fiction exactly');
  const screenshot=path.join(w.evidenceDir,
   'R54_'+w.engine.toUpperCase()+'_FICTIONAL_PC3_DESKTOP.png');
  await page.screenshot({path:screenshot});
  screenshots.push(screenshot);
  const left=page.locator('.fr-panel-splitter-left');
  const right=page.locator('.fr-panel-splitter-right');
  check(await left.getAttribute('aria-valuenow')==='300'&&
   await right.getAttribute('aria-valuenow')==='355',
   w.engine+' existing outline and MAIA dividers start at canonical widths');
  await left.focus();await page.keyboard.press('ArrowRight');
  await right.focus();await page.keyboard.press('ArrowLeft');
  check(await left.getAttribute('aria-valuenow')==='324'&&
   await right.getAttribute('aria-valuenow')==='379',
   w.engine+' each native canonical column adjusts independently by keyboard');
  await page.reload({waitUntil:'networkidle'});
  await page.getByText('Protected working version 3').waitFor();
  check(await page.locator('.fr-panel-splitter-left').getAttribute('aria-valuenow')==='324'&&
   await page.locator('.fr-panel-splitter-right').getAttribute('aria-valuenow')==='379',
   w.engine+' both widths persist across verified manuscript return');
  await page.locator('[data-r41-reset-column-widths]').click();
  check(await page.locator('.fr-panel-splitter-left').getAttribute('aria-valuenow')==='300'&&
   await page.locator('.fr-panel-splitter-right').getAttribute('aria-valuenow')==='355',
   w.engine+' Reset restores both native widths');
  const countMounts=await page.evaluate(()=>Number((window as any).__r54Mounts||0));
  await page.locator('#r54-canvas').click();
  check(await page.evaluate(()=>Number((window as any).__r54Mounts||0))===countMounts,
   w.engine+' full Canvas keeps same manuscript Work mounted');
  check(await page.locator('#r54-body').isVisible(),
   w.engine+' Full Canvas retains manuscript in same canonical Shell');
  await page.locator('#r54-canvas').click();
  check(await page.locator('.fr-panel-splitter-left').count()===1,
   w.engine+' returning from Full Canvas restores adjustable columns');
  check(browserErrors.length===0,w.engine+' no uncaught PC3/browser errors');
  await context.close();
  const mobile=await browser.newContext({
   viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  });
  await mobile.addCookies([{name:'r54_fictional_session',value:token,
   url:origin,httpOnly:true,sameSite:'Strict'}]);
  await mobile.route('**/*',route=>{
   if(route.request().url().startsWith(origin+'/'))return route.continue();
   externalRequests++;return route.abort('blockedbyclient');
  });
  const phone=await mobile.newPage();
  await phone.goto(origin+'/',{waitUntil:'networkidle'});
  await phone.getByText('Protected working version 3').waitFor({timeout:12000});
  check(await phone.locator('#r54-body').isVisible(),
   w.engine+' mobile manuscript visible and responsive');
  const y=await phone.evaluate(()=>{
   const work=document.querySelector('[data-region="work"]');
   const outline=document.querySelector('[data-region="manuscript"]');
   const maia=document.querySelector('[data-region="maia"]');
   return {work:work?.getBoundingClientRect().top??99999,
    outline:outline?.getBoundingClientRect().top??99999,
    maia:maia?.getBoundingClientRect().top??99999,
    height:window.innerHeight};
  });
  check(y.work>=0&&y.work<y.height/2&&
   y.work<y.outline&&y.work<y.maia,
   w.engine+' mobile puts manuscript first before support panels');
  check(await phone.locator('[data-r54-pc3-author-journey]').isVisible(),
   w.engine+' mobile author-action panel remains readable');
  const shot=path.join(w.evidenceDir,
   'R54_'+w.engine.toUpperCase()+'_FICTIONAL_PC3_MOBILE.png');
  await phone.screenshot({path:shot});
  screenshots.push(shot);
  await mobile.close();
 }finally{
  if(browser)await browser.close().catch(()=>{});
  if(server.listening)await new Promise<void>(resolve=>server.close(()=>resolve()));
  serverClosed=true;
 }
 check(externalRequests===0,w.engine+' no external provider or website request');
 check(serverClosed,w.engine+' ephemeral fictional HTTP server closed');
 return {engine:w.engine,browserClosed:true,serverClosed:true,
  externalRequests:0,screenshots,checksPassed};
}
