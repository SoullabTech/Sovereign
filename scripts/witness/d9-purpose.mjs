import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const p=await b.newPage({viewport:{width:1440,height:900}});
const frame=async()=>{await p.evaluate(()=>{const a=document.querySelector('#s0 .body'),z=document.querySelector('#s2 .body');
 const r=document.createRange();r.setStart(a,0);r.setEnd(z,z.childNodes.length);
 const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));});
 await p.waitForTimeout(200);};
const say=()=>p.locator('#say').innerText();
const ask=async t=>{await p.fill('#q',t);await p.press('#q','Enter');await p.waitForTimeout(180);return say();};

await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
await frame(); await p.click('#q');
const a=await ask("I think I'm repeating myself here — what do you see?");
console.log('CASE 1 · purposeful → JOIN immediately');
console.log('  "'+a.replace(/\s+/g,' ').slice(0,130)+'"');
console.log(`  joins without clarifying: ${!/What are you wanting to understand/.test(a)?'PASS':'FAIL'}`);
console.log(`  answers about recurrence: ${/arrives at 8|already named it/.test(a)?'PASS':'FAIL'}`);

await p.reload(); await p.waitForTimeout(300); await frame(); await p.click('#q');
const b1=await ask('hmm');
const b2=await ask('something about this');
console.log('\nCASE 2 · ambiguous → CLARIFY, then open');
console.log(`  "hmm" clarifies:                 ${/What are you wanting to understand/.test(b1)?'PASS':'FAIL'}`);
console.log(`  "something about this" no longer guesses "off": ${!/may be contributing/.test(b2)?'PASS':'FAIL'}`);
const b3=await ask('the transition — it lands too fast for me');
console.log(`  after we establish it, no re-contracting: ${!/What are you wanting to understand/.test(b3)?'PASS':'FAIL'}`);
console.log(`  "${b3.replace(/\s+/g,' ').slice(0,110)}"`);

await p.reload(); await p.waitForTimeout(300); await frame(); await p.click('#q');
let t=''; for(let i=0;i<5;i++){ t=await ask('what else'); if(/yogi/.test(t))break; }
console.log('\nCASE 3 · outside material → RETURN then INVITE');
console.log(`  opens from the frame:  ${/^Starting from/.test(t)?'PASS':'FAIL'}`);
console.log(`  marks it as outside:   ${/outside your frame/.test(t)?'PASS':'FAIL'}`);
console.log(`  invites, not moves:    ${await p.locator('#say .invite').count()?'PASS':'FAIL'}`);
console.log(`  frame still the writer's: "${await p.locator('#focusScale').innerText()}"`);
await b.close();
