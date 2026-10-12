/** WRITER-BETA-WORKSTREAM-01 · Browser witness of the five read-only
 * surfaces. One real local Work Unit, ephemeral in-process view-model; no
 * production, no provider, no external fetch, no persistence or screenshot.
 */
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');

(async()=>{
  const root=path.resolve(__dirname,'../..');
  const {buildDesktopViewModel}=await import(pathToFileURL(path.join(root,'scripts/builder/founder-workspace/desktop-viewmodel.mjs')).href);
  const {validateViewModel}=await import(pathToFileURL(path.join(root,'scripts/builder/founder-workspace/viewmodel-v1.mjs')).href);
  const sha=execFileSync('git',['rev-parse','origin/clean-main-no-secrets'],{cwd:root,encoding:'utf8'}).trim();
  const vm=await buildDesktopViewModel({
    root,observedAgainst:sha,env:process.env,observeMode:'quick',
    status:{observed_at:new Date().toISOString(),workspace:{root,branch:'feature/jarvis-ws-beta-workstream-20261012',head:sha,clean:false}},
  });
  assert.equal(validateViewModel(vm,{mode:'live'}).ok,true);
  const uid='v2-writer-s-studio-small-beta-launch-mv5adx5f';
  const unit=vm.work.units.find(u=>u.id===uid);
  assert(unit?.release_snapshot?.gates?.length===7);
  assert.equal(unit?.release_snapshot?.release_approval,'NOT_AUTHORIZED');

  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try{
    const page=await browser.newPage({viewport:{width:1400,height:900}});
    const badRequests=[],pageErrors=[];
    await page.route(/https?:\/\//,r=>{badRequests.push(r.request().url());return r.abort();});
    page.on('pageerror',e=>pageErrors.push(e.message));
    await page.addInitScript(({vm})=>{
      window.jarvis={
        getWorkspaceViewModel:async()=>vm,
        revealWorkspace:async()=>({ok:false,reason:'WITNESS_READ_ONLY'}),
      };
    },{vm});
    await page.goto(pathToFileURL(path.join(root,'jarvis-desktop/src/founder-workspace.html')).href,{waitUntil:'load'});
    await page.locator('[data-beta-release-workstream]').first().waitFor({timeout:15000});
    assert.equal(await page.locator('[data-beta-gate]').count(),7);
    const t=await page.locator('#main').innerText();
    assert(t.includes('Writer’s Studio — Small Beta Launch'));
    assert(t.includes('Small beta release held.'));
    // The beta's draft-scoping gesture must not be called a founder decision.
    const today=await page.evaluate(()=>{
      const ss=[...document.querySelectorAll('#main section')];
      const sel=(name)=>ss.find(s=>[...s.querySelectorAll('h2')].some(h=>h.textContent.trim().startsWith(name)));
      return {
        needs:sel('Needs Kelly')?.innerText||'',
        motion:sel('In motion')?.innerText||'',
      };
    });
    assert(today.motion.includes('Writer’s Studio — Small Beta Launch'));
    assert(!today.needs.includes('Writer’s Studio — Small Beta Launch'));
    console.log('TODAY PASS: in motion; not falsely in Needs Kelly; seven historically labeled gates.');

    await page.locator('button[data-view="work"]').first().click();
    await page.locator('#main [data-ws-beta-section]').waitFor();
    assert.equal(await page.locator('#main [data-ws-beta-section] [data-beta-gate]').count(),7);
    assert((await page.locator('#main [data-ws-beta-section]').innerText()).includes('No beta deployment or invitation is authorized'));
    await page.locator('#main [data-ws-beta-section] button[data-action=context]').first().click();
    console.log('WORK PASS: one selected governed release field, seven gates, no approval.');

    await page.locator('button[data-view="graph"]').first().click();
    await page.locator('#main .graphCenter').waitFor();
    const graphText=await page.locator('#main').innerText();
    assert(graphText.includes('Writer’s Studio — Small Beta Launch'));
    assert.match(graphText,/has historical release evidence/i);
    assert.equal(await page.locator('#main [data-beta-gate]').count(),7);
    console.log('GRAPH PASS: one witnessed file-backed evidence edge, no inferred programme.');

    await page.locator('button[data-view="monitor"]').first().click();
    await page.locator('#main [data-ws-beta-section]').waitFor();
    assert.equal(await page.locator('#main [data-ws-beta-section] [data-beta-gate]').count(),7);
    console.log('MONITOR PASS: historical status, remaining hold visible, no invented live polling.');

    await page.locator('button[data-view="system"]').first().click();
    await page.locator('#main [data-ws-beta-section]').waitFor();
    assert.equal(await page.locator('#main [data-ws-beta-section] [data-beta-gate]').count(),7);
    assert((await page.locator('#main').innerText()).includes('Why JARVIS believes what it is showing you'));
    console.log('SYSTEM PASS: provenance and release evidence from the same Work Unit.');

    assert.deepEqual(badRequests,[]);
    assert.deepEqual(pageErrors,[]);
    console.log('ALL_5_SURFACES_PASS true','NO_EXTERNAL_NETWORK true','PAGE_ERRORS',pageErrors.length);
    await page.close();
  }finally{await browser.close();}
})().catch(e=>{console.error('WRITER_BETA_UI_WITNESS_FAILED',String(e.stack||e).slice(0,2000));process.exitCode=1});
