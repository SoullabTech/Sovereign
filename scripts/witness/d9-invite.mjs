import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
const say=()=>p.locator('#say .line.her').last().innerText();  /* her LATEST turn: since the one-thread ruling #say holds the whole encounter */
const scale=()=>p.locator('#focusScale').innerText();
await p.evaluate(()=>{const a=document.querySelector('#s0 .body'),z=document.querySelector('#s2 .body');
 const r=document.createRange();r.setStart(a,0);r.setEnd(z,z.childNodes.length);
 const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));});
await p.waitForTimeout(250);
await p.click('#q');

// CLARIFY: purpose not evident -> she asks what we are listening for
await p.fill('#q','hmm'); await p.press('#q','Enter'); await p.waitForTimeout(160);
const c=await say();
console.log('CLARIFY: "'+c.replace(/\s+/g,' ').slice(0,150)+'"');
console.log(`  asks what we are attending to:     ${/What are you wanting to understand or work with here/.test(c)?'PASS':'FAIL'}`);
console.log(`  offers the way of working:         ${/stay closely with what is here, or also bring in/.test(c)?'PASS':'FAIL'}`);
console.log(`  does NOT guess a purpose:          ${!/I see one thing|arrives at 8/.test(c)?'PASS':'FAIL'}`);

// INVITE: outside material offered, never taken
let t='';
for(let i=0;i<4;i++){ await p.fill('#q','what else'); await p.press('#q','Enter'); await p.waitForTimeout(160);
  t=await say(); if(/yogi/.test(t)) break; }
const hasBtn=await p.locator('#say .invite').count();
console.log(`\nINVITE offered as a control:         ${hasBtn?'PASS':'FAIL'}`);
console.log(`  frame unchanged until writer acts:  ${/SECTIONS 0–2$/.test(await scale())?'PASS':'FAIL'} ("${await scale()}")`);
if(hasBtn){
  console.log(`  button label: "${await p.locator('#say .invite').innerText()}"`);
  await p.locator('#say .invite').click(); await p.waitForTimeout(200);
  console.log(`  WRITER extends -> frame moves:      ${/SECTIONS 0/.test(await scale())&&!/SECTIONS 0–2$/.test(await scale())?'PASS':'FAIL'} ("${await scale()}")`);
}
await b.close();
