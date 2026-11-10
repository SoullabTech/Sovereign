/* WS-DEVELOP-P0 — INTEGRATED EXPERIENCE WALK. One browser session, fictional writers, one continuous script.
   EVIDENCE CLASSES (every observation is tagged):  [PRES] presentation only · [SEED] seeded/URL-restored · [REAL] real product pipeline, stand-in model
   · [STUB] stand-in model reply (NOT actual MAIA).  No check here is "authenticated model behaviour": no provider key exists in this environment. */
import fs from 'node:fs';
import {start,login,BASE,MS,sql,counts,log} from './p0lib.mjs';
const MS2=fs.readFileSync('/home/user/walkstate/ms2.id','utf8').trim();
const OUT=process.env.WALK_OUT||'/home/user/probe/walk'; fs.mkdirSync(OUT,{recursive:true});
const EV=[]; const ev=(w,cls,what,pass,detail={})=>{ const r={t:new Date().toISOString().slice(11,23),w,cls,what,verdict:pass===true?'PASS':pass===false?'FAIL':pass,detail}; EV.push(r); log(r); return r; };
const dev=(x='')=>BASE+'/writers-studio?mode=develop&m='+MS+x;
const {b,ctx,p}=await start({width:1440,height:980});
const shot=n=>p.screenshot({path:`${OUT}/${n}.png`,fullPage:true}).catch(()=>{});
const guard=async(w,what,fn)=>{ try{ return await fn(); }catch(e){ ev(w,'-',what,'BLOCKED',{reason:String(e).split('\n')[0].slice(0,160)}); return null; } };

const place=()=>p.evaluate(()=>{
  const art=document.querySelector('[data-develop-chapter]'); let sc=null, el=art;
  while(el){ const cs=getComputedStyle(el); if(/(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+2){ sc=el; break; } el=el.parentElement; }
  const t=document.body.innerText; const q=new URLSearchParams(location.search);
  const vs=[...document.querySelectorAll('select')].find(s=>[...s.options].map(o=>o.text).join('|')==='Quiet|Balanced|All tools');
  const ch=document.querySelector('[data-develop-chapter-select="true"]'); const a=document.activeElement;
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden';};
  return { stage:!!document.querySelector('[data-develop-stage="true"]'), field:q.get('developField'), r:q.get('r'),
    chapterShown:/letter came in March|woke slowly|carried the nets|leaving had been/.test(t), chapterPane:!!art,
    scrollable:!!sc, scrollTop:sc?Math.round(sc.scrollTop):null, selection:(getSelection()?.toString()||'').slice(0,40),
    view:vs?vs.options[vs.selectedIndex].text:null, chapter:ch?ch.options[ch.selectedIndex]?.text:null,
    obsOpen:/With this observation/.test(t), obsText:/harbour appears here and returns|prose moves from a wide view|letter is mentioned before|Leaving is described/.test(t),
    focus:a?(a.tagName+':'+((a.textContent||a.getAttribute('aria-label')||'').trim().slice(0,28))):null,
    unsent:[...document.querySelectorAll('textarea')].filter(vis).map(x=>x.value.slice(0,40)),
    controls:[...document.querySelectorAll('button,[role=button],a[href],select,input:not([type=hidden]),summary,textarea')].filter(vis).length };
});
const setScroll=n=>p.evaluate(n=>{ const art=document.querySelector('[data-develop-chapter]'); let el=art; while(el){ const cs=getComputedStyle(el); if(/(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+2){ el.scrollTop=n; return el.scrollTop; } el=el.parentElement; } return null; },n);
const selectText=needle=>p.evaluate(needle=>{ const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())){ const i=n.nodeValue.indexOf(needle); if(i>=0){ const r=document.createRange(); r.setStart(n,i); r.setEnd(n,i+needle.length); const s=getSelection(); s.removeAllRanges(); s.addRange(r); return s.toString(); } } return null; },needle);
const idle=ms=>p.waitForTimeout(ms);

const C0=counts(); ev('SETUP','-','source / build',true,{ source:'895ffbc61c42 (= #2208 a70bd1cc66b0 + canonical b3f246b456e5, freshness merge; no Develop source differs from #2208)', build:'next dev (not a production build), NEXT_PUBLIC_WS_DEVELOP_STAGE=1', db:'throwaway PG16, fictional', model:'STAND-IN stub, reader delay 12000ms', counts:C0 });

await login(p);

/* ───────── W1 · MANUSCRIPT ARRIVAL AND CHAPTER STABILITY ───────── */
await p.goto(dev(),{waitUntil:'domcontentloaded'}); await idle(9000);
let a=await place(); await shot('W1-a-arrival');
ev('W1','PRES','Develop opens on the calm stage, chapter central, View Quiet', a.stage&&a.chapterShown&&a.view==='Quiet', a);
await guard('W1','choose chapter The Letter',async()=>{ await p.locator('[data-develop-chapter-select="true"]').selectOption({label:'The Letter'}); await idle(3500); });
a=await place(); ev('W1','PRES','chosen chapter is the one shown', a.chapter==='The Letter'&&/letter came in March/.test(await p.evaluate(()=>document.body.innerText)), a);
const sTop=await setScroll(900); const sel=await selectText('Paragraph 14. The letter sat on the sill');
const before=await place(); await shot('W1-b-scrolled-selected');
ev('W1','PRES','long fictional chapter is scrollable and selectable (precondition)', before.scrollable&&(sTop||0)>300&&!!sel, {sTop, sel, before});
await idle(6000); a=await place();
ev('W1','PRES','scroll, selection, chapter and View hold after 6 s idle', a.scrollTop===before.scrollTop&&a.selection===before.selection&&a.chapter===before.chapter&&a.view==='Quiet', {before:{s:before.scrollTop,sel:before.selection},after:{s:a.scrollTop,sel:a.selection}});

/* ───────── W2 · WRITER-INITIATED CONVERSATION WITH MAIA (stage) ───────── */
const T1=sql('SELECT count(*) FROM writer_decision_events');
await guard('W2','send a message to MAIA',async()=>{
  const ta=p.locator('textarea').first(); await ta.click(); await p.keyboard.type('What is the letter doing in this chapter?'); await p.keyboard.press('Enter'); await idle(9000); });
a=await place(); await shot('W2-after-message');
const body=await p.evaluate(()=>document.body.innerText);
ev('W2','STUB','message sent and a reply is shown', /What is the letter doing/.test(body)&&/\[stand-in\]/.test(body), {note:'reply is the stand-in model, NOT actual MAIA'});
ev('W2','PRES','sending preserved chapter, View and scroll position', a.chapter==='The Letter'&&a.view==='Quiet'&&a.scrollTop===before.scrollTop, {scroll:[before.scrollTop,a.scrollTop]});
ev('W2','-','text selection survives sending a message','NOT TESTED',{note:'moving focus into the message box collapses a browser text selection natively (instrument artifact, not product behaviour); selection is exercised only where focus does not move'});
ev('W2','REAL','a conversation turn created no decision event or reading scope by itself', sql('SELECT count(*) FROM writer_decision_events')===T1, {decisions:[T1,sql('SELECT count(*) FROM writer_decision_events')]});

/* ───────── W3 · OBSERVATION ARRIVAL (real completion, lens page) ───────── */
let lensByUi=false;
await guard('W3','reach a lens page through the UI',async()=>{
  await p.locator('[data-develop-more="true"]').first().click(); await idle(1500);
  await p.getByText('More ways to explore').first().click(); await idle(4500);
  const card=p.getByText('Just exploring').first(); if(await card.count()){ await card.click(); await idle(5000); }
  lensByUi=!!new URL(p.url()).searchParams.get('developField'); });
if(!lensByUi){ await p.goto(dev('&developField=development'),{waitUntil:'domcontentloaded'}); await idle(9000); }
a=await place(); await shot('W3-a-lens-before-reading');
const viewAfterMore=a.view;
ev('W3','PRES','"More ways to explore" left the writer\'s saved View unchanged (it was Quiet)', viewAfterMore==='Quiet', {viewAfterMore, note:'FINDING F1 reproduced inside the walk'});
if(viewAfterMore!=='Quiet'){ await guard('W3','writer sets the View back to Quiet',async()=>{ await p.locator('select[aria-label="How much of Develop to show"]').selectOption({label:'Quiet'}); await idle(2500); }); a=await place(); }
ev('W3','PRES','reached a lens page', !!a.field, {field:a.field, reachedBy: lensByUi?'UI (More ways to explore, What does MAIA think?)':'URL (UI route did not land on a lens page)', viewNow:a.view});
ev('W3','PRES','the lens page keeps the chapter on screen (P0 ruling 2026-11-10)', a.chapterShown||a.chapterPane, a);
await guard('W3','commission a real reading',async()=>{
  const rb=p.locator('button:has-text("Read for Development")').first();
  if(!(await rb.isVisible())){ await p.locator('summary:has-text("Read somewhere else")').first().click(); await idle(700); }
  await rb.click();
  await p.locator('button:has-text("Whole Work")').first().focus().catch(()=>{});
});
const focusBefore=(await place()).focus;
for(let i=0;i<40;i++){ await idle(1500); if(sql('SELECT count(*) FROM developmental_readings')!=='0') break; }
await idle(5000); a=await place(); await shot('W3-b-after-real-completion');
ev('W3','REAL','a real reading completed through reader → grounding → classifier → freeze → store', sql('SELECT count(*) FROM developmental_readings')==='1', {readings:sql('SELECT count(*) FROM developmental_readings'), outcome:sql("SELECT outcome||':'||jsonb_array_length(observations) FROM developmental_readings LIMIT 1"), model:'STAND-IN'});
ev('W3','REAL','completion did NOT select an observation', !a.obsOpen&&!a.obsText, {obsOpen:a.obsOpen, obsText:a.obsText, r:a.r});
ev('W3','REAL','completion did NOT replace the manuscript surface', a.chapterShown||a.chapterPane, {chapterShown:a.chapterShown});
ev('W3','REAL','completion did NOT move focus', a.focus===focusBefore, {before:focusBefore, after:a.focus});
const urlA=new URL(p.url()).searchParams.get('r'); const RA=urlA||sql('SELECT id FROM developmental_readings ORDER BY frozen_at LIMIT 1');

/* ───────── W4 · EXPLICIT OBSERVATION OPENING, CHAPTER AND VIEW PRESERVED ───────── */
const viewBeforeOpen=(await place()).view; a=await place();
const hasIndex=await p.evaluate(()=>!!document.querySelector('[data-develop-observation-index]')||/Explore observations/i.test(document.body.innerText));
ev('W4','REAL','an observation index / "Explore observations" is offered and nothing is pre-opened', hasIndex&&!a.obsOpen, {hasIndex, preOpened:a.obsOpen});
await guard('W4','open another observation by choice',async()=>{ await p.locator('[data-develop-see-another]').first().click(); await idle(2500); });
a=await place(); await shot('W4-observation-open');
ev('W4','REAL','while an observation is open the chapter is still readable', a.chapterShown||a.chapterPane, {chapterShown:a.chapterShown});
ev('W4','REAL','opening an observation left the writer\'s View as it was', a.view===viewBeforeOpen, {before:viewBeforeOpen, after:a.view});

/* ───────── W5 · FOLLOW-UP WITHOUT RESETTING THE ACTIVE THREAD (late completion) ───────── */
await guard('W5','start a second reading (reader delayed 25 s)',async()=>{
  const rb=p.locator('button:has-text("Read for Development")').first();
  if(!(await rb.isVisible())){ await p.locator('summary:has-text("Read somewhere else")').first().click(); await idle(600); }
  await rb.click(); await idle(800); });
let threadOpened=false;
await guard('W5','open the observation conversation',async()=>{ await p.locator('button:has-text("Talk with MAIA about this")').first().click(); await idle(2500); threadOpened=await p.locator('textarea:visible').count()>0; });
let followUp=null;
await guard('W5','ask a follow-up',async()=>{ const ta=p.locator('textarea:visible').last(); await ta.fill('What made you notice this?'); await p.locator('[data-dialogue-send]').first().click(); await idle(5000);
  followUp=await p.evaluate(()=>document.body.innerText); });
const threadBefore=await p.evaluate(()=>document.body.innerText.includes('What made you notice this?'));
const dialogueNote=await p.evaluate(()=>{const d=document.querySelector('[data-dialogue-send]')?.closest('section,div'); return (d?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,260);});
await guard('W5','type a follow-up and leave it unsent',async()=>{ const ta=p.locator('textarea:visible').last(); await ta.fill('an unsent thought about the harbour'); });
const pre=await place(); await shot('W5-a-mid-conversation-before-arrival');
for(let i=0;i<40;i++){ await idle(1500); if(sql('SELECT count(*) FROM developmental_readings')==='2') break; }
await idle(5000); const post=await place(); await shot('W5-b-after-late-arrival');
const threadAfter=await p.evaluate(()=>document.body.innerText.includes('What made you notice this?'));
const dialogueOpenAfter=await p.locator('[data-dialogue-send]').count()>0; const dialogueOpenBefore=pre.unsent.length>0;
ev('W5','REAL','a second reading completed while the writer was mid-conversation', sql('SELECT count(*) FROM developmental_readings')==='2', {readings:sql('SELECT count(*) FROM developmental_readings')});
ev('W5','STUB','the follow-up produced a visible reply','BLOCKED',{note:'actual MAIA responses are unavailable (no provider key); stand-in only', dialogueOpened:threadOpened, followUpShownInThread:threadBefore, dialogueStatus:dialogueNote});
ev('W5','REAL','the conversation is still open after the late arrival', dialogueOpenBefore&&dialogueOpenAfter, {openBefore:dialogueOpenBefore, openAfter:dialogueOpenAfter, followUpStillShown:threadAfter, urlReading:post.r});
ev('W5','REAL','the writer\'s unsent text survived the late arrival', post.unsent.some(t=>t.includes('unsent thought')), {before:pre.unsent, after:post.unsent});
ev('W5','REAL','the late arrival did not change the writer\'s View', post.view===pre.view, {before:pre.view, after:post.view});

/* ───────── W6 · QUIET / BALANCED / ALL TOOLS ───────── */
await p.goto(dev(),{waitUntil:'domcontentloaded'}); await idle(9000);
const modes={}; const vsel='[data-develop-view="true"] select';
for(const m of ['Quiet','Balanced','All tools','Quiet']){ await guard('W6','switch to '+m,async()=>{ await p.locator(vsel).selectOption({label:m}); await idle(3000); const q=await place(); modes[m+(modes[m]?'2':'')]=q; await shot('W6-'+m.replace(' ','-')+(modes[m+'2']?'-2':'')); }); }
ev('W6','PRES','each view selected and the manuscript stayed central in all three', ['Quiet','Balanced','All tools'].every(k=>modes[k]&&modes[k].stage&&modes[k].chapterShown), {controls:Object.fromEntries(Object.entries(modes).map(([k,v])=>[k,v.controls]))});
ev('W6','PRES','returning to Quiet restored the Quiet presentation', modes.Quiet2?.view==='Quiet'&&modes.Quiet2?.controls===modes.Quiet?.controls, {first:modes.Quiet?.controls, again:modes.Quiet2?.controls});
ev('W6','PRES','Balanced differs from Quiet in how capabilities are presented', modes.Balanced&&modes.Quiet&&modes.Balanced.controls!==modes.Quiet.controls, {quiet:modes.Quiet?.controls, balanced:modes.Balanced?.controls, allTools:modes['All tools']?.controls, note:'identical = NOT differentiated (recorded honestly, not credited)'});
const dec=sql('SELECT count(*) FROM writer_decision_events')+'/'+sql('SELECT count(*) FROM work_reading_scope_events');
ev('W6','REAL','switching views created no decision event and no reading scope', dec==='0/0', {decisions_scope:dec});

/* ───────── W7 · LEAVE, RETURN, AND ACCOUNT ISOLATION ───────── */
await p.locator(vsel).selectOption({label:'All tools'}); await idle(2500);
await p.locator('[data-develop-chapter-select="true"]').selectOption({label:'The Letter'}); await idle(2500);
const preLeave=await place();
await guard('W7','leave Develop for Write and return',async()=>{ await p.getByRole('button',{name:'Write',exact:true}).first().click(); await idle(6000); await p.getByRole('button',{name:'Develop',exact:true}).first().click(); await idle(9000); });
a=await place(); await shot('W7-a-returned-from-write');
ev('W7','PRES','View and chapter restored after leaving for Write', a.view===preLeave.view&&a.chapter===preLeave.chapter, {before:[preLeave.view,preLeave.chapter], after:[a.view,a.chapter]});
await p.reload({waitUntil:'domcontentloaded'}); await idle(9000); a=await place();
ev('W7','PRES','View and chapter restored after a full reload', a.view===preLeave.view&&a.chapter===preLeave.chapter, {before:[preLeave.view,preLeave.chapter], after:[a.view,a.chapter]});
await p.goto(dev('&developField=development&r='+RA),{waitUntil:'domcontentloaded'}); await idle(9000); a=await place(); await shot('W7-b-reopen-with-reading');
ev('W7','SEED','temporary observation focus is cleared on a new visit (design decision D6)', !a.obsOpen, {obsOpen:a.obsOpen, note:'reading restored by URL'});
const prefKey=await p.evaluate(()=>Object.keys(localStorage).filter(k=>/presentation/.test(k)).map(k=>k.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g,'<uuid>')));
await ctx.clearCookies(); await login(p,'cwriter'); await p.goto(BASE+'/writers-studio?mode=develop&m='+MS2,{waitUntil:'domcontentloaded'}); await idle(9000);
const other=await place(); await shot('W7-c-second-writer');
const otherText=await p.evaluate(()=>document.body.innerText);
ev('W7','PRES','a second writer on the same browser sees her own default and her own Work, nothing of the first', other.view==='Quiet'&&/Orchard/.test(otherText)&&!/letter came in March|harbour/i.test(otherText), {view:other.view, ownWork:/Orchard/.test(otherText), leaked:/letter came in March|harbour/i.test(otherText), keys:prefKey});
await ctx.clearCookies(); await login(p,'bwriter'); await p.goto(dev(),{waitUntil:'domcontentloaded'}); await idle(9000); a=await place();
ev('W7','PRES','the first writer\'s own View is intact on return', a.view==='All tools', {view:a.view});

const C1=counts();
ev('END','REAL','manuscript unchanged across the whole walk', C0.ms===C1.ms, {before:C0.ms, after:C1.ms, readings:[C0.readings,C1.readings]});
fs.writeFileSync(OUT+'/events.jsonl',EV.map(e=>JSON.stringify(e)).join('\n'));
await b.close();
