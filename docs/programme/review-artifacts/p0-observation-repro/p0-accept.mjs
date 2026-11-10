import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const MS=process.env.P0_MS, MS2=process.env.P0_MS2, RA=process.env.P0_RA, RB=process.env.P0_RB;
const OUT=process.env.P0_OUT||'./p0-out'; fs.mkdirSync(OUT,{recursive:true});
const BASE='http://localhost:3111/writers-studio?mode=develop&m=';
const log=o=>console.log(JSON.stringify(o));
const sql=q=>execSync('psql -X -q -At -h 127.0.0.1 -p 54329 -U fictional -d walk_fictional -c "'+q.replace(/"/g,'\\"')+'"').toString().trim();
const dbState=()=>({
  scopeEvents: sql('SELECT count(*) FROM work_reading_scope_events'),
  decisions: sql('SELECT count(*) FROM writer_decision_events'),
  plans: sql('SELECT count(*) FROM development_plans'),
  readings: sql('SELECT count(*) FROM developmental_readings'),
  manuscriptDigest: sql("SELECT md5(string_agg(body, '|' ORDER BY position)) FROM manuscript_sections WHERE manuscript_id='"+MS+"'"),
  draftDigest: sql("SELECT md5(content) FROM manuscript_working_drafts WHERE manuscript_id='"+MS+"'"),
});
const MARK={ 'The Harbour':'woke slowly','Salt':'carried the nets','The Letter':'letter came in March','Return':'leaving had been the long part' };
const snap=async(p,label,shot=false)=>{ const s=await p.evaluate((MARK)=>{
  const vis=el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.opacity!=='0';};
  const q=new URLSearchParams(location.search), t=document.body.innerText;
  const sel=[...document.querySelectorAll('select')].find(s=>[...s.options].map(o=>o.text).join('|')==='Quiet|Balanced|All tools');
  const ch=document.querySelector('[data-develop-chapter-select="true"]');
  const cm=Object.keys(MARK).filter(k=>t.includes(MARK[k]));
  const tx=document.querySelector('textarea');
  return { stage:!!document.querySelector('[data-develop-stage="true"]'), r:q.get('r'), field:q.get('developField'), mode:q.get('mode'),
    view:sel?sel.options[sel.selectedIndex].text:null, chapter:ch?ch.options[ch.selectedIndex]?.text:null,
    manuscriptChaptersShown:cm, withThisObservation:/With this observation/.test(t),
    observationTextShown:/harbour appears in each|moves from a wide view|Salt is the first concrete/.test(t),
    letRest:/Let rest/i.test(t), undo:/\bUndo\b/.test(t), whatMaiaRead:/What MAIA read|MAIA read for that/i.test(t),
    maiaEntryVisible: !!(tx&&vis(tx)) || [...document.querySelectorAll('button')].some(b=>vis(b)&&/Talk with me about it|Talk with MAIA/.test(b.textContent)),
    overflowX: document.documentElement.scrollWidth>window.innerWidth+1,
    controls:[...document.querySelectorAll('button,[role=button],a[href],select,input:not([type=hidden]),summary,textarea')].filter(vis).length }; }, MARK);
  if(shot) await p.screenshot({path:OUT+'/'+label+'.png',fullPage:true}); log({step:label,...s}); return s; };
const b=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM,args:['--no-sandbox']}:{});
const ctx=await b.newContext({viewport:{width:1440,height:980}}); const p=await ctx.newPage();
let pageErrors=0; p.on('pageerror',()=>pageErrors++);
const login=async(u)=>{ await p.goto('http://localhost:3111/signin',{waitUntil:'domcontentloaded'});
  await p.fill('input[placeholder="Email or username"]',u); await p.fill('input[type="password"]','walkpass');
  await p.getByRole('button',{name:'Sign in',exact:true}).click(); await p.waitForTimeout(7000); };
const open=async(ms,extra='')=>{ await p.goto(BASE+ms+extra,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(9500); };
const R={}; const db0=dbState(); log({db0});

await login('bwriter');

/* ── SCENARIO 13 · the whole journey ── */
await open(MS); R.j1=await snap(p,'J1-open-quiet',true);
await p.locator('[data-develop-chapter-select="true"]').selectOption({label:'The Letter'}); await p.waitForTimeout(3000);
R.j2=await snap(p,'J2-chapter-The-Letter');
await p.evaluate((r)=>{const u=new URL(location.href);u.searchParams.set('r',r);history.pushState({},'',u);window.dispatchEvent(new PopStateEvent('popstate'));},RA);
await p.waitForTimeout(7000); R.j3=await snap(p,'J3-reading-arrives',true);
const talk=p.getByRole('button',{name:'Talk with me about it'}).first();
R.talkAvailable=await talk.count();
if(R.talkAvailable){ await talk.click().catch(()=>{}); await p.waitForTimeout(15000); R.j4=await snap(p,'J4-talking-with-maia',true); }
const vs=p.locator('select[aria-label="How much of Develop to show"]');
R.pathBViewControl=await vs.count();
if(R.pathBViewControl){ await vs.selectOption({label:'All tools'}); await p.waitForTimeout(3500); R.j5=await snap(p,'J5-all-tools',true);
  await vs.selectOption({label:'Quiet'}); await p.waitForTimeout(3500); R.j6=await snap(p,'J6-back-to-quiet'); }
await p.getByRole('button',{name:'The Letter',exact:true}).first().click().catch(()=>{}); await p.waitForTimeout(5000); R.j7=await snap(p,'J7-writer-returns-via-rail',true);
await p.getByRole('button',{name:'Write',exact:true}).first().click().catch(()=>{}); await p.waitForTimeout(6000); R.j8=await snap(p,'J8-left-for-Write');
await p.getByRole('button',{name:'Develop',exact:true}).first().click().catch(()=>{}); await p.waitForTimeout(8000); R.j9=await snap(p,'J9-resumed-Develop',true);
const db1=dbState(); log({db1});

/* ── SCENARIO 9 · observation open/close, View stays ── */
await open(MS); R.s9a=await snap(p,'S9-a-quiet');
await open(MS,'&developField=overview&r='+RA); R.s9b=await snap(p,'S9-b-observation-state',true);

/* ── the 'More ways to explore' side effect on the saved preference ── */
await open(MS); R.m0=await snap(p,'M0-before');
await p.getByRole('button',{name:'More',exact:true}).first().click(); await p.waitForTimeout(1500);
await p.getByText('More ways to explore').first().click(); await p.waitForTimeout(4000); R.m1=await snap(p,'M1-after-More-ways');
await open(MS); R.m2=await snap(p,'M2-reopened-later');
const vs2=p.locator('[data-develop-view="true"] select'); if(await vs2.count()){ await vs2.selectOption({label:'Quiet'}); await p.waitForTimeout(2500); }

/* ── RESPONSIVE ── */
for (const [w,h] of [[1440,900],[1024,768],[768,1024],[390,844]]) {
  await p.setViewportSize({width:w,height:h});
  await open(MS); R['rs_stage_'+w]=await snap(p,'RS-stage-'+w,w===390||w===1024);
  await open(MS,'&developField=overview&r='+RA); R['rs_obs_'+w]=await snap(p,'RS-observation-'+w,w===390||w===1024);
}
await p.setViewportSize({width:1440,height:980});

/* ── MAIA KEYBOARD ACCESS ── */
const tabsTo=async(test,max=90)=>{ await p.evaluate(()=>{document.activeElement&&document.activeElement.blur(); window.scrollTo(0,0);});
  for(let i=1;i<=max;i++){ await p.keyboard.press('Tab');
    const hit=await p.evaluate(test); if(hit) return {tabs:i,hit}; } return {tabs:null}; };
await open(MS);
R.kbStage=await tabsTo(()=>{const a=document.activeElement;return a&&a.tagName==='TEXTAREA'?{tag:a.tagName,name:a.getAttribute('aria-label')||a.placeholder||''}:null;});
R.sendNamed=await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Send$/.test(x.textContent.trim()));return !!b&&!!(b.textContent.trim()||b.getAttribute('aria-label'));});
await open(MS,'&developField=overview&r='+RA);
R.kbObservation=await tabsTo(()=>{const a=document.activeElement;return a&&/Talk with me about it/.test(a.textContent||'')?{tag:a.tagName,name:(a.textContent||'').trim().slice(0,30)}:null;});
log({kbStage:R.kbStage,kbObservation:R.kbObservation,sendNamed:R.sendNamed});

/* ── PREFERENCE ISOLATION (same browser, two writers) ── */
await open(MS); const vsA=p.locator('[data-develop-view="true"] select'); await vsA.selectOption({label:'All tools'}); await p.waitForTimeout(3000);
R.iso1=await snap(p,'ISO-1-bwriter-All-tools');
R.keys=await p.evaluate(()=>Object.keys(localStorage).filter(k=>/present|depth|view|writers-studio/i.test(k)).map(k=>k.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g,'<uuid>')));
await ctx.clearCookies(); await login('cwriter'); await open(MS2); R.iso2=await snap(p,'ISO-2-cwriter-same-browser',true);
await ctx.clearCookies(); await login('bwriter'); await open(MS); R.iso3=await snap(p,'ISO-3-bwriter-returns');
const db2=dbState(); log({db2, pageErrors});
log({RESULT:R});
await b.close();
