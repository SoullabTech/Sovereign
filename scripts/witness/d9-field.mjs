import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
const say=()=>p.locator('#say').innerText(); const ph=()=>p.locator('#q').getAttribute('placeholder');
console.log(`no frame → open placeholder: "${await ph()}"`);
await p.evaluate(()=>{const a=document.querySelector('#s0 .body'),z=document.querySelector('#s2 .body');
 const r=document.createRange();r.setStart(a,0);r.setEnd(z,z.childNodes.length);
 const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));});
await p.waitForTimeout(200);
console.log(`frame set → "${await ph()}"  ${(await ph())==='What are you attending to here?'?'PASS':'FAIL'}`);
await p.click('#q'); await p.fill('#q','hmm'); await p.press('#q','Enter'); await p.waitForTimeout(180);
const c=await say();
console.log(`\n⭐ THE WORK IS NOT INSTRUCTION — "hmm" reaches CLARIFY, not a fixture branch:`);
console.log(`   "${c.replace(/\s+/g,' ').slice(0,120)}"`);
console.log(`   ${/What are you wanting to understand or work with here/.test(c)?'PASS':'FAIL'}`);
await p.fill('#q','the repetition — I think I have said this elsewhere'); await p.press('#q','Enter'); await p.waitForTimeout(180);
console.log(`\nafter the writer answers → "${await ph()}"  ${(await ph())==='Continue…'?'PASS':'FAIL'}`);
let t='';
for(let i=0;i<4;i++){ await p.fill('#q','what else'); await p.press('#q','Enter'); await p.waitForTimeout(150); t=await say(); if(/yogi/.test(t))break; }
console.log(`\nINVITE appears once, as a control:  ${await p.locator('#say .invite').count()?'PASS':'FAIL'}`);
const before=await p.locator('#focusScale').innerText();
if(await p.locator('#say .invite').count()){
  await p.locator('#say .invite').click(); await p.waitForTimeout(200);
  const after=await p.locator('#focusScale').innerText();
  console.log(`  writer performs it → frame moves:  ${before!==after?'PASS':'FAIL'}  ("${before}" → "${after}")`);
}
await b.close();
