import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
const held = () => p.evaluate(()=>{const h=[...(CSS.highlights.get('held')||[])];return h.length?h[0].toString().length:0;});
const scale = () => p.locator('#focusScale').innerText();

await p.locator('#s2').scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
await p.evaluate(()=>{const b=document.querySelector('#s2 .body'),t=b.firstChild;
  const r=document.createRange();r.setStart(t,60);r.setEnd(t,200);
  const s=getSelection();s.removeAllRanges();s.addRange(r);
  document.dispatchEvent(new Event('selectionchange'));});
await p.waitForTimeout(250);
const a = await held();

const col = await p.locator('main').boundingBox();
let hb = await p.locator('#frame .h.bot').boundingBox();
console.log(`handles clear of prose: handle-right ${Math.round(hb.x+hb.width)} <= text-left ${Math.round(col.x+24)}  -> ${hb.x+hb.width<=col.x+24?'PASS':'FAIL'}`);

// drag the BOTTOM handle down, in viewport space
await p.mouse.move(hb.x+hb.width/2, hb.y+hb.height/2);
await p.mouse.down();
for (const dy of [40,110,200,300]) await p.mouse.move(hb.x+hb.width/2, hb.y+hb.height/2+dy, {steps:5});
await p.mouse.up(); await p.waitForTimeout(250);
const c = await held();
console.log(`EXTEND bottom: ${a} -> ${c} chars  -> ${c>a?'PASS':'FAIL'}   scale="${await scale()}"`);

// drag the TOP handle up
hb = await p.locator('#frame .h.top').boundingBox();
await p.mouse.move(hb.x+hb.width/2, hb.y+hb.height/2);
await p.mouse.down();
for (const dy of [-40,-110,-190]) await p.mouse.move(hb.x+hb.width/2, hb.y+hb.height/2+dy, {steps:5});
await p.mouse.up(); await p.waitForTimeout(250);
const d = await held();
console.log(`EXTEND top:    ${c} -> ${d} chars  -> ${d>c?'PASS':'FAIL'}   scale="${await scale()}"`);

// across a section boundary
hb = await p.locator('#frame .h.bot').boundingBox();
await p.mouse.move(hb.x+hb.width/2, hb.y+hb.height/2);
await p.mouse.down();
for (const dy of [200,420,640]) await p.mouse.move(hb.x+hb.width/2, Math.min(880, hb.y+hb.height/2+dy), {steps:6});
await p.mouse.up(); await p.waitForTimeout(250);
console.log(`CROSS sections: ${d} -> ${await held()} chars   scale="${await scale()}"`);

await p.click('#q'); await p.waitForTimeout(150);
console.log(`frame survives composer -> ${(await p.locator('#frame').isVisible())?'PASS':'FAIL'}`);
await b.close();
