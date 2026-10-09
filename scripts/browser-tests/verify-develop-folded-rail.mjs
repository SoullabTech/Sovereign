#!/usr/bin/env node
/** STUDIO-FOLD-GAP-01. Real CSS-cascade regression on a LOCAL test Work only.
 *  node scripts/browser-tests/verify-develop-folded-rail.mjs <test-manuscript-uuid>
 *  No manuscript writes, no inference, no production calls.
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const id=process.argv[2];
if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id??'')) {
  console.error('Pass one local test manuscript UUID'); process.exit(2);
}
let browser;
try {
  browser=await chromium.launch({
    headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page=await browser.newPage({viewport:{width:1390,height:1150}});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message.slice(0,90)));
  await page.goto('http://localhost:3100/api/auth/dev-login?member=corbin-test&redirect=%2Fwriters-studio',
    {waitUntil:'domcontentloaded',timeout:30000});
  for(const width of [1390,1024]) {
    await page.setViewportSize({width,height:1150});
    await page.goto('http://localhost:3100/writers-studio?mode=develop&m='+id,
      {waitUntil:'domcontentloaded',timeout:35000});
    const rail=page.locator('.p4r1-structural-rail[data-outline-collapsible=true]');
    await rail.waitFor({timeout:30000});
    await rail.evaluate(el=>el.scrollTop=el.scrollHeight);
    await page.getByRole('button',{name:'Fold all'}).click();
    await page.waitForTimeout(120);
    const folded=await rail.evaluate(el=>({
      scrollTop:el.scrollTop,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,
      parts:[...el.querySelectorAll(':scope > li[data-outline-role=part]')].map(li=>({
        open:li.getAttribute('data-open'),
        height:Math.round(li.getBoundingClientRect().height),
        toggleWidth:Math.round(li.querySelector('.p4r1-outline-toggle').getBoundingClientRect().width),
        labelWidth:Math.round(li.querySelector('.p4r1-outline-label').getBoundingClientRect().width),
      }))
    }));
    assert.equal(folded.parts.length,3);
    assert.ok(folded.parts.every(x=>x.open==='false' && x.height<85 && x.toggleWidth===29 && x.labelWidth>90),
      'Folded Part became stretched or full-width buttons returned');
    assert.ok(folded.scrollHeight<=folded.clientHeight+3,
      'Folded list exceeds desktop viewport');
    assert.ok(folded.scrollTop<=3,'Fold all should restore top of the rail');
    const part=page.locator('.p4r1-structural-rail > li[data-outline-role=part]').first();
    await part.locator('.p4r1-outline-toggle').click();
    assert.equal(await part.getAttribute('data-open'),'true');
    const chapter=part.locator('li[data-outline-role=chapter]').first();
    await chapter.locator('.p4r1-outline-toggle').click();
    const children=await chapter.locator('.p4r1-outline-children > li').count();
    assert.ok(children>0,'Chapter headings did not expand');
    console.log('PASS width='+width+' folded_parts=3 max_height='+
      Math.max(...folded.parts.map(x=>x.height))+' expanded_subsections='+children);
  }
  assert.deepEqual(pageErrors,[]);
  console.log('PASS STUDIO-FOLD-GAP-01. Test account only; no manuscript mutation.');
}catch(e){console.error('FAIL STUDIO-FOLD-GAP-01',e.message);process.exitCode=1}
finally{await browser?.close().catch(()=>{})}
