import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
const askVis=()=>p.locator('#frameAsk').isVisible();
console.log(`no frame → no Ask MAIA:                       ${!(await askVis())?'PASS':'FAIL'}`);

// route A: click a section heading (NOT a mouse text-selection)
await p.locator('#s7 h2').scrollIntoViewIfNeeded();
await p.locator('#s7 h2').click(); await p.waitForTimeout(250);
console.log(`frame via HEADING CLICK → Ask MAIA present:   ${await askVis()?'PASS':'FAIL'}`);
console.log(`  strip label: "${await p.locator('#focusScale').innerText()}"`);
console.log(`  strip reads as focus, not metadata:         ${/^FOCUS · SECTION/i.test(await p.locator('#focusScale').innerText())?'PASS':'FAIL'}`);
const fs=await p.locator('#focusText').evaluate(e=>getComputedStyle(e).fontSize);
console.log(`  snippet size ${fs} (was 0.95rem ≈15.2px):    ${parseFloat(fs)>=17?'PASS':'FAIL'}`);
const fam=await p.locator('#focusText').evaluate(e=>getComputedStyle(e).fontFamily);
console.log(`  snippet in manuscript serif:               ${/Cormorant/.test(fam)?'PASS':'FAIL'}`);

// route B: widen — invitation persists, no re-selection needed
await p.click('#wider'); await p.waitForTimeout(200);
console.log(`\nafter WIDER → still available:                ${await askVis()?'PASS':'FAIL'}  ("${await p.locator('#focusScale').innerText()}")`);

// invoking it joins with a provisional reading, then it goes away
await p.locator('#ask').click(); await p.waitForTimeout(250);
const lines=await p.evaluate(()=>[...document.querySelectorAll('#say .line')].map(e=>e.className.split(' ')[1]+': '+e.innerText.slice(0,72)));
lines.forEach(l=>console.log('   '+l));
console.log(`  invoking → MAIA joins substantively:       ${/first read of|Starting from/.test(lines.join(' '))?'PASS':'FAIL'}`);
console.log(`  invitation disappears once joined:         ${!(await askVis())?'PASS':'FAIL'}`);

// a NEW focus makes it available again
await p.locator('#s2 h2').scrollIntoViewIfNeeded(); await p.locator('#s2 h2').click(); await p.waitForTimeout(250);
console.log(`  NEW focus → available again:               ${await askVis()?'PASS':'FAIL'}`);
// beginning the conversation directly also begins the encounter
await p.click('#q'); await p.fill('#q','does this hold together?'); await p.press('#q','Enter'); await p.waitForTimeout(200);
console.log(`  writer begins directly → invitation gone:  ${!(await askVis())?'PASS':'FAIL'}`);
await b.close();
