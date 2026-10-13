/* Offline read-only Chrome witness for the inert Foundry HTML prototype.
 * Uses already-installed Google Chrome; NO network, installs, model calls,
 * user/manuscript data, work unit changes, app wiring or execution grants.
 */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({
  headless:true,
  executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
 });
 const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const page=await ctx.newPage();
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{
  if(/^https?:/i.test(r.url())){external.push(r.url());r.abort();}
 });
 try {
  const file='/Users/soullab/JARVIS-handoffs/AIN_FOUNDRY_RESEARCH_ONLY_PREVIEW_R2_2026-10-12.html';
  await page.goto('file://'+file,{waitUntil:'load'});
  assert.equal(await page.locator('[data-candidate-id]').count(),26);
  assert.match(await page.locator('#founder-standing').innerText(),/Founder accepted/);
  assert.equal(await page.locator('#stats .stat').count(),4);
  assert.equal(await page.locator('.explainer article').count(),4);
  assert.ok(await page.locator('#priority').evaluate(el=>el.getBoundingClientRect().width>=150),'Priority control must not clip its label');
  assert.equal(await page.locator('#lane-grid .lane-item').count(),6);
  console.log('DISCOVER_PASS 26 candidates founder acceptance verified');
  await page.locator('#search').fill('Inspect AI');
  assert.equal(await page.locator('[data-candidate-id]:visible').count(),1);
  assert.match(await page.locator('#results-count').innerText(),/1 of 26/);
  console.log('SEARCH_PASS 1 of 26');
  await page.locator('#search').fill('');
  await page.locator('[data-view=graph]').click();
  assert.equal(await page.locator('#room-graph').isVisible(),true);
  assert.match(await page.locator('#graph-summary').innerText(),/59.*123/);
  await page.locator('[data-lane=writers]').click();
  assert.equal(await page.locator('#room-discover').isVisible(),true);
  assert.ok((await page.locator('[data-candidate-id]:visible').count())>0);
  console.log('GRAPH_PASS lane filtering 59 nodes / 123 proposed edges');
  await page.locator('[data-view=monitor]').click();
  assert.equal(await page.locator('#monitor-rows tr').count(),6);
  assert.match(await page.locator('#monitor-rows').innerText(),/PENDING/);
  console.log('MONITOR_PASS no license/security admission invented');
  await page.locator('[data-view=system]').click();
  assert.equal(await page.locator('#system-rows tr').count(),9);
  assert.match(await page.locator('#system-rows').innerText(),/NOT AUTHORIZED/);
  console.log('SYSTEM_PASS 9 authorities denied');
  for(const room of ['today','work','graph','monitor','system']){
   await page.locator('[data-view='+room+']').click();
   assert.equal(await page.locator('#room-'+room).isVisible(),true);
  }
  console.log('FIVE_ROOMS_PASS');
  await page.locator('[data-view=discover]').click();
  await page.screenshot({path:'/Users/soullab/JARVIS-handoffs/AIN_FOUNDRY_RESEARCH_ONLY_PREVIEW_R2_BROWSER_2026-10-12.png',fullPage:false});
  assert.equal(errors.length,0,errors.join(';'));
  assert.equal(external.length,0,external.join(';'));
  console.log('BROWSER_WITNESS_PASS ERRORS',errors.length,'AUTOMATIC_EXTERNAL_REQUESTS',external.length);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
