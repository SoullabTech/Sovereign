'use strict';
// SOUND-STUDIO-UIUX-02 witness: the real ListenRoom inside the real PersistentListeningProvider,
// real Chrome media decoding. Presentation claims only; audio authority is witnessed by LISTEN-63…67.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const esbuild=require('esbuild'); const {chromium}=require('playwright-core');
const repo=path.resolve(__dirname,'../..'); const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'listen68-'));
const evidence=process.env.LISTEN68_EVIDENCE_DIR||fixture; fs.mkdirSync(evidence,{recursive:true});
const git=a=>{try{return cp.execFileSync('git',a,{cwd:repo,encoding:'utf8'}).trim()}catch{return 'unknown'}};
const identity={head:git(['rev-parse','HEAD']),branch:git(['rev-parse','--abbrev-ref','HEAD']),dirty:git(['status','--porcelain']).length>0,at:new Date().toISOString()};
const entry=`import React from'react';import{createRoot}from'react-dom/client';import{PersistentListeningProvider}from ${JSON.stringify(path.join(repo,'components/listening/PersistentListeningProvider.tsx'))};import ListenRoom from ${JSON.stringify(path.join(repo,'app/listen/ListenRoom.tsx'))};createRoot(document.getElementById('app')).render(<PersistentListeningProvider reviewMemberKey="11111111-2222-4333-8444-555555555555"><ListenRoom/></PersistentListeningProvider>);`;
fs.writeFileSync(path.join(fixture,'entry.jsx'),entry);fs.writeFileSync(path.join(fixture,'next-link-shim.jsx'),`import React from'react';export default function Link({href,children,onClick,...rest}){return <a href={href} onClick={e=>{if(String(href).startsWith('/'))e.preventDefault();onClick?.(e)}} {...rest}>{children}</a>}`);
function stream(req,res,file,type){const size=fs.statSync(file).size,r=req.headers.range;if(r){const m=/^bytes=(\d+)-(\d*)$/.exec(r);if(!m){res.writeHead(416);return res.end()}const start=+m[1],end=m[2]?Math.min(+m[2],size-1):size-1;res.writeHead(206,{'content-type':type,'content-length':end-start+1,'content-range':`bytes ${start}-${end}/${size}`,'accept-ranges':'bytes'});return fs.createReadStream(file,{start,end}).pipe(res)}res.writeHead(200,{'content-type':type,'content-length':size,'accept-ranges':'bytes'});fs.createReadStream(file).pipe(res)}
const PROFILES=[{name:'phone-320',w:320,h:640,m:true,t:true},{name:'phone-360',w:360,h:780,m:true,t:true},{name:'phone-375',w:375,h:812,m:true,t:true},{name:'phone-390',w:390,h:844,m:true,t:true},{name:'ipad-portrait',w:768,h:1024,t:true},{name:'ipad-landscape',w:1024,h:768,t:true},{name:'desktop',w:1440,h:1000}];
(async()=>{let server,browser;const results=[],errors=[],external=[];const check=(p,n,v,d='')=>{results.push({profile:p,name:n,pass:!!v,detail:String(d).slice(0,300)});if(!v)throw new Error(`${p}:${n}:${d}`)};try{
 await esbuild.build({entryPoints:[path.join(fixture,'entry.jsx')],outdir:fixture,entryNames:'bundle',bundle:true,format:'iife',platform:'browser',jsx:'automatic',target:'es2022',alias:{'@':repo,'react':require.resolve('react'),'react-dom/client':require.resolve('react-dom/client'),'react/jsx-runtime':require.resolve('react/jsx-runtime')},loader:{'.css':'local-css'},plugins:[{name:'next-link',setup(b){b.onResolve({filter:/^next\/link$/},()=>({path:path.join(fixture,'next-link-shim.jsx')}));}}],logLevel:'silent'});
 const css=fs.readdirSync(fixture).find(f=>f.endsWith('.css'));fs.writeFileSync(path.join(fixture,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">${css?`<link rel="stylesheet" href="/${css}">`:''}<style>html,body,#app{min-height:100%;margin:0;background:#071015;color:#eee}body{overflow-x:hidden}</style></head><body><div id="app"></div><script src="/bundle.js"></script></body></html>`);
 server=http.createServer((req,res)=>{const u=decodeURIComponent((req.url||'/').split('?')[0]);if(u.startsWith('/media/sound-studio/')){const f=path.join(repo,'public',u.replace(/^\//,''));if(fs.existsSync(f))return stream(req,res,f,'audio/mp4')}const f=path.join(fixture,u==='/'?'index.html':u.replace(/^\//,''));if(!f.startsWith(fixture)||!fs.existsSync(f)){res.writeHead(404);return res.end()}const e=path.extname(f);stream(req,res,f,e==='.js'?'text/javascript':e==='.css'?'text/css':'text/html')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking','--autoplay-policy=no-user-gesture-required']});
 const small=async page=>page.evaluate(()=>[...document.querySelectorAll('button,summary,a,select,input')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.opacity!=='0'&&e.type!=='range'&&!(e.type==='file')&&r.height<43.5}).map(e=>(e.getAttribute('aria-label')||e.textContent||e.tagName).trim().slice(0,28)+':'+Math.round(e.getBoundingClientRect().height)));
 for(const p of PROFILES){const c=await browser.newContext({viewport:{width:p.w,height:p.h},isMobile:!!p.m,hasTouch:!!p.t,reducedMotion:'reduce'});const page=await c.newPage();page.on('pageerror',e=>errors.push(`${p.name}:${e.message}`));page.on('request',q=>{if(/^https?:/.test(q.url())&&!q.url().startsWith(base))external.push(`${p.name}:${q.url()}`)});
  await page.clock.install({time:Date.now()});await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('[data-sound-studio-now="true"]').waitFor();
  check(p.name,'now-is-the-entrance-and-silent',await page.locator('[data-listen10-audio="true"]').evaluate(a=>!a||(a.getAttribute('src')===null&&a.paused)).catch(()=>true));
  check(p.name,'four-supports-visible',await page.locator('[data-sound-studio-support]').count()===4);
  check(p.name,'now-no-horizontal-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const nowSmall=await small(page);check(p.name,'now-controls-at-least-44px',nowSmall.length===0,nowSmall.join(' | '));
  if(p.w<=700){check(p.name,'phone-tab-bar-present',await page.locator('[data-studio-tab]').count()===5)}
  await page.screenshot({path:path.join(evidence,`UIUX02_${p.name}_now.png`)});
  // two deliberate actions: a support, then Begin
  await page.locator('[data-sound-studio-support="rest"]').click();
  await page.getByRole('button',{name:'Play Night Ground 01 — Extended Night'}).click();
  await page.waitForFunction(()=>{const a=document.querySelector('[data-listen10-audio="true"]');return a&&!a.paused&&a.currentTime>0});
  check(p.name,'first-sound-in-two-actions',true);
  const dockBox=await page.locator('[data-listen10-persistent-dock="true"]').boundingBox();check(p.name,'compact-dock-visible',!!dockBox);
  check(p.name,'compact-hides-volume-until-expanded',!(await page.getByLabel('Persistent music volume').isVisible()));
  await page.screenshot({path:path.join(evidence,`UIUX02_${p.name}_night_playing.png`)});
  // receded night mode: Stop stays visible, reachable, >=44px
  await page.clock.fastForward(16000);
  await page.waitForFunction(()=>document.querySelector('[data-sound-studio-immersive]')?.getAttribute('data-quiet')==='true',{},{timeout:8000});
  const quietStop=page.getByRole('button',{name:'Stop and clear persistent music'});const qb=await quietStop.boundingBox();
  check(p.name,'receded-night-keeps-stop-visible-44px',!!qb&&qb.height>=43.5&&await quietStop.isVisible()&&true,JSON.stringify(qb));
  await page.screenshot({path:path.join(evidence,`UIUX02_${p.name}_night_receded.png`)});
  check(p.name,'one-control-set-no-duplicate-transport',await page.getByRole('button',{name:/^(Pause|Stop|Resume) Night Ground/}).count()===0);
  // a touch wakes the field
  await page.locator('[data-sound-studio-immersive]').dispatchEvent('pointerdown');
  check(p.name,'touch-wakes-the-field',await page.locator('[data-sound-studio-immersive]').getAttribute('data-quiet')==='false');
  // same player persists across sections
  const title0=await page.locator('[data-listen10-title="true"]').textContent();
  for(const v of ['shelf','studio','lab','now']){await page.locator(`[data-studio-${p.w<=700?'tab':'section'}="${v}"]`).click();}
  check(p.name,'one-player-persists-across-sections',(await page.locator('[data-listen10-title="true"]').textContent())===title0&&await page.locator('[data-listen10-persistent-dock="true"]').count()===1);
  check(p.name,'navigation-never-changes-playback',await page.locator('[data-listen10-audio="true"]').evaluate(a=>!a.paused));
  // expanded sheet + sleep timer
  await page.locator('[data-listen-companion-toggle="true"]').click();
  await page.screenshot({path:path.join(evidence,`UIUX02_${p.name}_player_expanded.png`)});
  check(p.name,'expanded-sheet-shows-sleep-timer',await page.locator('[data-listen-sleep-timer="true"]').isVisible());
  check(p.name,'default-is-until-i-stop',(await page.locator('[data-listen-sleep-timer="true"]').textContent()).includes('Until I Stop'));
  await page.getByRole('radio',{name:'Stop immediately'}).click();
  await page.locator('[data-listen-sleep-minutes="15"]').click();
  check(p.name,'timer-requires-member-action-and-shows-time',(await page.locator('[data-listen-sleep-timer="true"]').textContent()).includes('Stops in'));
  await page.clock.fastForward('15:05');
  await page.waitForFunction(()=>document.querySelector('[data-listen10-persistent-dock="true"]')?.style.display==='none',{},{timeout:8000});
  check(p.name,'timer-ends-in-terminal-stop',await page.locator('[data-listen10-audio="true"]').evaluate(a=>a.getAttribute('src')===null&&a.paused));
  await page.waitForTimeout(500);
  check(p.name,'timer-never-restarts-sound',await page.locator('[data-listen10-audio="true"]').evaluate(a=>a.paused&&a.getAttribute('src')===null));
  // Focus quick start
  await page.locator('[data-studio-'+(p.w<=700?'tab':'section')+'="now"]').click();await page.locator('[data-sound-studio-support="focus"]').click();
  await page.getByRole('button',{name:'Start focus session'}).waitFor();
  check(p.name,'focus-quick-start-hides-tuning',!(await page.getByRole('button',{name:/Guide me/}).isVisible()));
  await page.getByText('Tune session').click();
  check(p.name,'tune-session-reveals-guide-and-browse',await page.getByRole('button',{name:/Guide me/}).isVisible()&&await page.getByRole('button',{name:/Browse/}).isVisible());
  // Focus sound choice: choosing and starting never play; Play is a separate member act; one transport set
  check(p.name,'focus-sound-choice-offered',await page.locator('[data-focus-sound]').count()===5);
  await page.locator('[data-focus-sound="open-ground"]').click();
  await page.getByRole('button',{name:'Start focus session'}).click();
  await page.getByRole('button',{name:'Pause Focus Field session'}).waitFor();
  check(p.name,'choosing-sound-and-starting-focus-plays-nothing',await page.locator('[data-listen10-audio="true"]').evaluate(a=>a.getAttribute('src')===null&&a.paused));
  check(p.name,'focus-has-one-transport-set',await page.getByRole('button',{name:'Pause session'}).count()===0&&await page.getByRole('button',{name:'Stop session'}).count()===0&&await page.getByRole('button',{name:'Pause Focus Field session'}).count()===1);
  await page.locator('[data-focus-play-sound="true"]').click();
  await page.waitForFunction(()=>{const a=document.querySelector('[data-listen10-audio="true"]');return a&&!a.paused&&a.currentTime>0},{},{timeout:12000}).catch(()=>{});
  check(p.name,'play-is-a-separate-member-act-and-sound-starts',await page.locator('[data-listen10-audio="true"]').evaluate(a=>!a.paused));
  await page.getByRole('button',{name:'Stop and clear persistent music'}).click();
  check(p.name,'focus-player-bar-offers-play-when-nothing-plays',await page.locator('[data-focus-dock-play-sound="true"]').isVisible());
  await page.locator('[data-focus-dock-play-sound="true"]').click();
  await page.waitForFunction(()=>{const a=document.querySelector('[data-listen10-audio="true"]');return a&&!a.paused&&a.currentTime>0},{},{timeout:12000}).catch(()=>{});
  check(p.name,'focus-player-bar-play-starts-the-chosen-sound',await page.locator('[data-listen10-audio="true"]').evaluate(a=>!a.paused));
  await page.getByRole('button',{name:'Stop and clear persistent music'}).click();
  await page.getByRole('button',{name:'Stop Focus Field session'}).click();
  // ADHD support section: member-opened, starts a quiet timer only, five-more is a member act
  check(p.name,'adhd-section-present-and-closed',await page.locator('[data-adhd-section] details').evaluate(d=>!d.open));
  await page.locator('[data-adhd-section] summary').click();
  await page.locator('[data-adhd-start="true"]').click();
  check(p.name,'adhd-suggestion-starts-a-timer-and-plays-nothing',await page.locator('[data-listen10-audio="true"]').evaluate(a=>a.getAttribute('src')===null&&a.paused)&&await page.getByRole('button',{name:'Pause Focus Field session'}).count()===1);
  await page.locator('[data-adhd-time="gentle"]').click();
  check(p.name,'adhd-gentle-position-shows-a-word-not-a-number',await page.locator('[data-adhd-position="true"]').textContent()==='Early');
  await page.locator('[data-adhd-time="none"]').click();
  check(p.name,'adhd-time-none-hides-time',(await page.locator('[data-focus-field-dock="true"]').textContent()).replace(/[^0-9:]/g,'').length===0||!/\d+:\d\d/.test(await page.locator('[data-focus-field-dock="true"]').textContent()));
  await page.locator('[data-adhd-quiet="true"]').click();
  check(p.name,'adhd-quiet-screen-keeps-stop-reachable',await page.evaluate(()=>document.body.hasAttribute('data-quiet-ui'))&&await page.getByRole('button',{name:'Stop Focus Field session'}).isVisible());
  await page.locator('[data-adhd-quiet="true"]').click();
  await page.clock.fastForward('10:05');
  await page.locator('[data-adhd-five-more="true"]').waitFor({timeout:8000});
  check(p.name,'adhd-session-ends-and-does-not-extend-itself',await page.locator('[data-adhd-five-more="true"]').isVisible()&&await page.getByRole('button',{name:'Pause Focus Field session'}).count()===0);
  await page.locator('[data-adhd-five-more="true"]').click();
  check(p.name,'adhd-five-more-is-a-member-act',await page.getByRole('button',{name:'Pause Focus Field session'}).count()===1);
  await page.getByRole('button',{name:'Stop Focus Field session'}).click();
  // Night family
  await page.locator('[data-studio-'+(p.w<=700?'tab':'section')+'="fields"]').click();
  check(p.name,'one-night-ground-catalogue-card',await page.locator('[data-sound-studio-work="night-ground-family"]').count()===1&&await page.locator('[data-sound-studio-work^="night-ground-01"]').count()===0);
  check(p.name,'fields-no-horizontal-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await c.close();}
 check('all','zero-page-errors',errors.length===0,JSON.stringify(errors));check('all','zero-external-network',external.length===0,JSON.stringify(external));
 const out={format:'SOULLAB_UIUX02_SOUND_STUDIO_BROWSER_V1',status:'PASS',identity,passed:results.length,results,errors,external};fs.writeFileSync(path.join(evidence,'UIUX02_BROWSER_RESULT.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,passed:out.passed,identity,evidence}));
 }catch(e){const out={format:'SOULLAB_UIUX02_SOUND_STUDIO_BROWSER_V1',status:'FAIL',identity,error:String(e.stack||e),results,errors,external};fs.writeFileSync(path.join(evidence,'UIUX02_BROWSER_RESULT.json'),JSON.stringify(out,null,2)+'\n');console.error(String(e.message));console.error('evidence',evidence);process.exitCode=1}finally{await browser?.close();await new Promise(r=>server?.close(r));}})();
