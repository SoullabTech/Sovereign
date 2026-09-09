/* WORK WITH THIS - acceptance walk (founder's ten steps)
   FOCUS  = what in the Work we are attending to.
   THREAD = what in our conversation we are pursuing about it.
   A thread must never become a second Focus, a second conversation, or a change to the Work. */
import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
let pass=0,fail=0; const ok=(n,c,x='')=>{c?pass++:fail++;console.log(`  ${c?'PASS':'FAIL'}  ${n}${x?'   '+x:''}`)};

const workHash=()=>p.evaluate(()=>{
  const bs=[...document.querySelectorAll('.sec .body')];
  return bs.map(b=>b.textContent).join(' ').length+':'+bs.map(b=>b.textContent.slice(0,40)).join('|');});
const focusState=()=>p.evaluate(()=>({
  on:document.getElementById('focus').classList.contains('on'),
  scale:document.getElementById('focusScale').textContent,
  text:document.getElementById('focusText').textContent,
  frameTop:Math.round(document.getElementById('frame').getBoundingClientRect().top),
  frameH:Math.round(document.getElementById('frame').getBoundingClientRect().height)}));
const selectHer=()=>p.evaluate(()=>{
  const line=[...document.querySelectorAll('#say .line.her')].pop();
  const w=document.createTreeWalker(line,NodeFilter.SHOW_TEXT); const n=w.nextNode();
  const r=document.createRange(); r.setStart(n,0); r.setEnd(n,Math.min(46,n.nodeValue.length));
  const s=getSelection(); s.removeAllRanges(); s.addRange(r);
  document.dispatchEvent(new Event('selectionchange'));
  return r.toString();
});

/* 1-3 the writer frames something in the Work and MAIA answers into it */
await p.evaluate(()=>{const a=document.querySelector('#s3 .body');
  const r=document.createRange();r.setStart(a,0);r.setEnd(a,a.childNodes.length);
  const s=getSelection();s.removeAllRanges();s.addRange(r);
  document.dispatchEvent(new Event('selectionchange'));});
await p.waitForTimeout(220);
await p.click('#ask'); await p.waitForTimeout(200);
await p.fill('#q','is anything repeating here'); await p.press('#q','Enter'); await p.waitForTimeout(250);
const before=await focusState(), workBefore=await workHash();
ok('a Work Focus is held before any thread', before.on, before.scale+' '+before.text.slice(0,40));
ok('MAIA has answered in her orbit', (await p.locator('#say .line.her').count())>0);

/* 4-5 select a meaningful portion of her response */
console.log('\n=== 4-5 select what she said ===');
ok('no affordance before a selection', await p.locator('#workwith').isHidden());
const sel=await selectHer(); await p.waitForTimeout(150);
ok('"Work with this" appears on a meaningful selection', await p.locator('#workwith').isVisible(), '"'+sel.slice(0,42)+'"');
ok('the affordance is quiet - one control, no menu', await p.locator('#workwith button').count()===1);
const wwText=(await p.locator('#workwith').innerText()).trim();
ok('no editing verbs offered', !/(accept|apply|fix|rewrite|replace)/i.test(wwText), '"'+wwText+'"');

/* 6-9 invoking opens a thread; the Focus stays primary */
console.log('\n=== 6-9 the thread opens; the Focus stays primary ===');
await p.click('#wwBtn'); await p.waitForTimeout(200);
ok('a thread is now active', await p.locator('#thread').isVisible());
ok('the thread carries the words the writer chose',
   (await p.locator('#threadText').innerText()).includes(sel.slice(0,30)));
const after=await focusState();
ok('the Work Focus is NOT replaced', after.on&&after.scale===before.scale&&after.text===before.text,
   after.scale+' '+after.text.slice(0,40));
ok('the focus frame did not move', after.frameTop===before.frameTop&&after.frameH===before.frameH);
const lead=(await p.locator('#threadLead').innerText()).trim();
ok('the Focus is named first; the thread reads as held inside it', /^Focus/i.test(lead), '"'+lead+'"');
ok('the Focus rule is heavier than the thread rule', await p.evaluate(()=>{
  const f=parseFloat(getComputedStyle(document.getElementById('focus')).borderLeftWidth);
  const t=parseFloat(getComputedStyle(document.getElementById('thread')).borderLeftWidth);
  return f>t;}));
ok('nothing was applied to the Work', (await workHash())===workBefore);
ok('her observation was NOT turned into a second frame in the Work',
   await p.evaluate(()=>document.querySelectorAll('#frame').length===1));
ok('taking it up is visible in the one conversation',
   /Working with/.test(await p.locator('#say').innerText()));
ok('still exactly one conversation surface', await p.evaluate(()=>
   document.querySelectorAll('#say').length===1 && document.querySelectorAll('#composer').length===1));

/* 7-8 pursuing it is the same encounter, held */
console.log('\n=== 7-8 pursuit ===');
await p.fill('#q','show me where'); await p.press('#q','Enter'); await p.waitForTimeout(220);
let t=await p.locator('#say .line.her').last().innerText();
ok('she answers about the observation being pursued', t.includes(sel.slice(0,25)), '"'+t.slice(0,70)+'"');
await p.fill('#q','say more'); await p.press('#q','Enter'); await p.waitForTimeout(220);
t=await p.locator('#say .line.her').last().innerText();
ok('pursuing does not wander to the next observation', /Staying with/.test(t), '"'+t.slice(0,60)+'"');
ok('she marks her reading as a reading', /reading, not a finding/.test(t));
ok('the Focus is still untouched after two pursuing turns',
   JSON.stringify(await focusState())===JSON.stringify(before));

/* 10 stop pursuing without clearing the Focus */
console.log('\n=== 10 return to the broader encounter ===');
await p.click('#threadStop'); await p.waitForTimeout(200);
ok('the thread is released', await p.locator('#thread').isHidden());
ok('the Work Focus survives releasing the thread',
   JSON.stringify(await focusState())===JSON.stringify(before));
ok('the encounter is intact - nothing was erased',
   /Working with/.test(await p.locator('#say').innerText()));
await p.fill('#q','what else'); await p.press('#q','Enter'); await p.waitForTimeout(250);
const resumed=(await p.locator('#say .line.her').last().innerText()).trim();
ok('the broader encounter resumes', !/Staying with/.test(resumed), '"'+resumed.slice(0,60)+'"');
ok('and the Work is still untouched', (await workHash())===workBefore);

await b.close();
console.log(`\nworkwith  ${pass} passed - ${fail} failed`);
process.exit(fail?1:0);
