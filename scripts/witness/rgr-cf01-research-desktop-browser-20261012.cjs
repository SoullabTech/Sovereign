/** RGR-CF01 read-only five-room browser witness.
 * Existing W0.v2 DRAFT is read through the canonical JARVIS view-model.
 * No production, provider, external fetch, member data or app installation.
 */
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');

(async()=>{
 const root=path.resolve(__dirname,'../..');
 const {buildDesktopViewModel,readEvidencePreview}=await import(pathToFileURL(path.join(root,'scripts/builder/founder-workspace/desktop-viewmodel.mjs')).href);
 const {validateViewModel}=await import(pathToFileURL(path.join(root,'scripts/builder/founder-workspace/viewmodel-v1.mjs')).href);
 const id='v2-rgr-cf01-research-intake-20261012';
 const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 const vm=await buildDesktopViewModel({root,observedAgainst:sha,env:process.env,observeMode:'quick',
  status:{observed_at:new Date().toISOString(),workspace:{root,branch:'feature/rgr-cf01-intake-kelly-world-20261012',head:sha,clean:false}}});
 assert.equal(validateViewModel(vm,{mode:'live'}).ok,true);
 const work=vm.work.units.find(u=>u.id===id);
 assert(work,'The real governed local RGR-CF01 Work Unit must be readable');
 assert.equal(work.state,'DRAFT');
 assert.equal(work.research_snapshot.evidence_state,'OBSERVED');
 assert.equal(work.research_snapshot.experiment_authority,'NOT_AUTHORIZED');
 assert.equal(work.research_snapshot.maia_authority,'NOT_AUTHORIZED');
 assert.equal(work.research_snapshot.stages.length,6);
 const edges=vm.graph.edges.filter(e=>e.from==='work:'+id);
 assert(edges.some(e=>e.rel==='has candidate research intake' && e.evidence.ref.endsWith('RGR-CF01_COUNTERFACTUAL_RELATIONAL_GEOMETRY_INTAKE_2026-10-12.md')));
 const sourceRef=work.research_snapshot.source_ref;
 const preview=readEvidencePreview(vm,sourceRef,{root,canonicalRef:sha});
 assert.equal(preview.ok,true,'The real admitted source should open through JARVIS evidence reader');
 assert.match(preview.text,/Counterfactual Relational Geometry/);
 assert.equal(readEvidencePreview(vm,path.join(root,'docs/programme/OTHER.txt'),{root}).ok,false,'Unlisted evidence must be refused');

 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
  const page=await browser.newPage({viewport:{width:1400,height:900}});
  const external=[],pageErrors=[];
  await page.route(/^https?:/,route=>{external.push(route.request().url());return route.abort()});
  page.on('pageerror',e=>pageErrors.push(e.message));
  await page.addInitScript(({vm,preview,sourceRef})=>{
   window.jarvis={getWorkspaceViewModel:async(req={})=>req.evidence_ref?{...vm,evidence_preview:req.evidence_ref===sourceRef?preview:{ok:false,reason:'not an admitted evidence reference'}}:vm,revealWorkspace:async()=>({ok:false,reason:'WITNESS_READ_ONLY'})};
  },{vm,preview,sourceRef});
  await page.goto(pathToFileURL(path.join(root,'jarvis-desktop/src/founder-workspace.html')).href,{waitUntil:'load'});
  await page.locator('#main [data-rgr-cf-workstream]').first().waitFor({timeout:15000});
  const first=await page.locator('#main').innerText();
  assert(first.includes('Relational Geometry — Counterfactual Research Intake'));
  assert(first.includes('Watching'));
  const attention=await page.evaluate(()=>{
   const ss=[...document.querySelectorAll('#main section')];
   const section=name=>ss.find(s=>[...s.querySelectorAll('h2')].some(h=>h.textContent.trim().startsWith(name)));
   return {needs:section('Needs Kelly')?.innerText||'',watching:section('Watching')?.innerText||'',motion:section('In motion')?.innerText||''};
  });
  assert(attention.watching.includes('Relational Geometry — Counterfactual Research Intake'));
  assert(!attention.needs.includes('Relational Geometry — Counterfactual Research Intake'));
  assert(!attention.motion.includes('Relational Geometry — Counterfactual Research Intake'));
  console.log('TODAY PASS: RGR-CF01 is Watching, not Needs Kelly or falsely In motion.');

  await page.locator('button[data-view="work"]').first().click();
  await page.locator('#main [data-rgr-cf-section]').waitFor();
  assert.equal(await page.locator('#main [data-rgr-cf-section] [data-rgr-cf-stage]').count(),6);
  await page.locator('#main [data-rgr-cf-section] button[data-action="context"]').first().click();
  console.log('WORK PASS: six documentary gates from one governed Work Unit, selected context.');

  await page.locator('button[data-view="graph"]').first().click();
  await page.locator('#main .graphCenter').waitFor();
  const gt=await page.locator('#main').innerText();
  assert(gt.includes('Relational Geometry — Counterfactual Research Intake'));
  assert.match(gt,/has candidate research intake/i);
  assert.equal(await page.locator('#main [data-rgr-cf-stage]').count(),6);
  await page.locator('#main [data-rgr-cf-workstream] button[data-action="evidence"]').first().click();
  await page.locator('#evidenceRoot .evidencePane').waitFor();
  const opened=await page.locator('#evidenceRoot').innerText();
  assert(opened.includes('Counterfactual Relational Geometry'));
  assert(opened.includes('RGR-CF01'));
  await page.locator('#evidenceRoot button[data-action="close-evidence"]').click();
  console.log('GRAPH PASS: direct verified source opens in evidence panel; unlisted files refused.');

  await page.locator('button[data-view="monitor"]').first().click();
  await page.locator('#main [data-rgr-cf-section]').waitFor();
  assert.equal(await page.locator('#main [data-rgr-cf-section] [data-rgr-cf-stage]').count(),6);
  assert((await page.locator('#main [data-rgr-cf-section]').innerText()).includes('Independent review and experiments have not been authorized'));
  console.log('MONITOR PASS: documentary standing, no invented live model health.');

  await page.locator('button[data-view="system"]').first().click();
  await page.locator('#main [data-rgr-cf-section]').waitFor();
  assert.equal(await page.locator('#main [data-rgr-cf-section] [data-rgr-cf-stage]').count(),6);
  assert((await page.locator('#main').innerText()).includes('Why JARVIS believes what it is showing you'));
  console.log('SYSTEM PASS: source and authority boundaries displayed.');

  assert.deepEqual(external,[]);
  assert.deepEqual(pageErrors,[]);
  console.log('ALL_5_RGR_CF01_SURFACES_PASS true','NO_EXTERNAL_REQUESTS true','PAGE_ERRORS',pageErrors.length);
  await page.close();
 } finally {await browser.close();}
})().catch(e=>{console.error('RGR_CF01_UI_WITNESS_FAILED',String(e.stack||e).slice(0,2800));process.exitCode=1;});
