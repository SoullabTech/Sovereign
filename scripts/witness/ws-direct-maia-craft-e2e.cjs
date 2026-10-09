/**
 * WS-DIRECT-MAIA-CRAFT · Browser + database safety witness.
 * Requires a database named ws_craft_witness_20261009 on loopback port 55619.
 * Default: isolated Studio on :3757 with controlled loopback inference.
 * Optional WITNESS_LIVE_MODEL=1: isolated Studio on :3758 with a live provider.
 * The default responses are fixed stand-ins, NOT live MAIA cognition.
 * Live mode must only be explicitly authorized and backed by synthetic data.
 * Never use a member account or production manuscript for this test.
 */
'use strict';
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {mkdirSync,writeFileSync,readFileSync} = require('node:fs');
const {Client}=require('pg');
const {chromium}=require('playwright');
const LIVE=process.env.WITNESS_LIVE_MODEL==='1';
const BASE=LIVE?'http://127.0.0.1:3758':'http://127.0.0.1:3757';
const OUT=LIVE?'/tmp/ws-maia-direct-craft-live-20261009':'/tmp/ws-maia-direct-craft-e2e-20261009';
const DSN=process.env.DATABASE_URL||'';
const ORIGINAL='The lantern glowed softly.';
const REVISED='The lantern glowed quietly.';
const FOLLOWING=' Another sentence waited nearby.';
const H2='The Quiet Door';
let db,browser,page;
const results={};
const trace=[];
const q=async (sql,args=[]) => (await db.query(sql,args)).rows;
const note=(label,value)=>{results[label]=value;console.log(label+': '+JSON.stringify(value));};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
  const u=new URL(DSN);
  assert.equal(u.hostname,'127.0.0.1');
  assert.equal(u.port,'55619');
  assert.equal(u.pathname,'/ws_craft_witness_20261009');
  mkdirSync(OUT,{recursive:true});
  db=new Client({connectionString:DSN});await db.connect();
  assert.equal((await q('SELECT current_database() n'))[0].n,'ws_craft_witness_20261009');
  const M=randomUUID(),LW=randomUUID(),WK=randomUUID(),DR=randomUUID(),S1=randomUUID(),S2=randomUUID(),D1=randomUUID(),D2=randomUUID();
  const token='witness-only-'+randomUUID();
  await q("INSERT INTO members (id,passkey,username,password_hash,name) VALUES($1,$2,$3,'not-a-login','TEST ONLY Direct Craft')",
    [M,'WS-DIRECT-'+M.slice(0,8),'ws-craft-'+M.slice(0,8)]);
  await q("INSERT INTO auth_sessions(member_id,session_token,expires_at) VALUES($1,$2,NOW()+INTERVAL '2 hours')",[M,token]);
  await q("INSERT INTO living_works(id,member_id,title) VALUES($1,$2,'TEST ONLY — The Quiet Door')",[LW,M]);
  await q("INSERT INTO member_manuscripts(id,member_id,title) VALUES($1,$2,'TEST ONLY — The Quiet Door')",[WK,M]);
  await q("INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES($1,'manuscript',$2,$3)",[LW,WK,M]);
  await q("INSERT INTO manuscript_sections(id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES($1,$2,1,'Chapter 1',1,'chapter','Threshold.'),($3,$2,2,$4,2,'markdown',$5)",[S1,WK,S2,H2,ORIGINAL+FOLLOWING]);
  await q("INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES($1,$2,$3,'','sha-witness',2)",[DR,WK,M]);
  await q("INSERT INTO manuscript_draft_sections(id,draft_id,position,text,source_section_id) VALUES($1,$2,1,$3,$4),($5,$2,2,$6,$7)",
    [D1,DR,'Chapter 1\n\nThreshold.',S1,D2,H2+'\n\n'+ORIGINAL+FOLLOWING,S2]);
  await q("UPDATE manuscript_working_drafts SET content=(SELECT COALESCE(string_agg(text,'' ORDER BY position),'') FROM manuscript_draft_sections WHERE draft_id=$1) WHERE id=$1",[DR]);
  await q("UPDATE manuscript_working_drafts SET section_addressable_at=NOW() WHERE id=$1",[DR]);
  const stored=()=>q('SELECT text FROM manuscript_draft_sections WHERE id=$1',[D2]).then(r=>r[0]?.text);
  const baseline=await stored();
  note('syntheticManuscriptCreated',true);

  browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const ctx=await browser.newContext({viewport:{width:1512,height:1040}});
  await ctx.addCookies([{name:'maia_session',value:token,url:BASE}]);
  await ctx.addInitScript(()=>{localStorage.setItem('maia_settings',JSON.stringify({sanctuary:false}));});
  const external=[];
  await ctx.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin===BASE||url.protocol==='data:'||url.protocol==='blob:')return route.continue();
    external.push(url.origin);return route.abort();
  });
  page=await ctx.newPage();
  page.on('pageerror',e=>trace.push({type:'pageerror',message:e.message}));
  page.on('response',res=>{
    const u=new URL(res.url());
    if(u.origin===BASE && u.pathname.startsWith('/api/') && res.status()>=400)
      trace.push({type:'apierror',path:u.pathname,status:res.status()});
  });
  await page.goto(BASE+'/writers-studio?mode=write&m='+WK+'&s='+D2,{waitUntil:'domcontentloaded',timeout:90000});
  note('opened',page.url());
  await page.getByRole('button',{name:'Edit',exact:true}).first().click({timeout:45000}).catch(()=>{});
  const editor=page.locator('textarea[data-write-editor][data-section-id="'+D2+'"]');
  await editor.waitFor({timeout:75000});
  note('writeEditorVisible',await editor.isVisible());
  const sel=await editor.evaluate((e,text)=>{
    const from=e.value.indexOf(text);
    if(from<0) return {found:false,preview:e.value.slice(0,150)};
    e.focus();
    e.setSelectionRange(from,from+text.length);
    document.dispatchEvent(new Event('selectionchange'));
    return {found:true,start:from,end:from+text.length};
  },ORIGINAL);
  assert.equal(sel.found,true,JSON.stringify(sel));
  const trigger=page.getByRole('button',{name:/Work with passage/}).first();
  await trigger.waitFor({timeout:15000});
  await trigger.click();
  const enter=page.getByRole('menuitem',{name:/Make changes with MAIA/});
  await enter.waitFor({timeout:10000});
  await enter.click();
  await page.locator('[data-craftsmans-table-r1]').waitFor({timeout:70000});
  await page.locator('[data-maia-craft-companion-r1]').waitFor({timeout:70000});
  await page.locator('[data-craft-focus-bracket]').waitFor({timeout:15000});
  await page.getByText('Working on: '+ORIGINAL,{exact:false}).waitFor({timeout:15000});
  note('writeToCraftTransition',new URL(page.url()).searchParams.get('developCraft')==='1');
  note('selectedLocusKept',await page.locator('[data-craft-r1-locus], .p4r1-craft-r1-locus').first().innerText());
  assert.equal(await stored(),baseline,'crossing must not mutate canonical manuscript');
  note('canonicalUnchangedAfterEntry',true);
  await page.screenshot({path:OUT+'/01-entered-craft.png'});

  const ordinary=page.getByRole('button',{name:'Ordinary',exact:true});
  if(await ordinary.isVisible().catch(()=>false)) await ordinary.click();
  const composer=page.getByRole('textbox',{name:'Talk with MAIA about the writing'});
  await composer.waitFor({timeout:20000});
  await composer.fill('What does this lantern sentence already do? Please discuss only, without changing words.');
  await composer.press('Enter');
  if(LIVE){
    const maia=page.locator('.p4r1-maia-craft-r1-turn[data-speaker="maia"]');
    await maia.first().waitFor({timeout:100000});
    const response=(await maia.first().innerText()).trim();
    assert.ok(response.length>30,'Live MAIA returned no substantive response');
    note('liveMaiaResponseSnippet',response.slice(0,150));
    note('canonicalUnchangedAfterLiveConversation',await stored()===baseline);
    assert.equal(await stored(),baseline);
    note('pageErrors',trace.filter(t=>t.type==='pageerror'));
    note('apiErrors',trace.filter(t=>t.type==='apierror'));
    assert.deepEqual(trace.filter(t=>t.type==='pageerror'),[]);
    await page.screenshot({path:OUT+'/live-discussion.png'});
    note('liveMaiaDiscussionPassed',true);
  } else {
    await page.getByText('The lantern gives the paragraph a gentle point of attention.',{exact:false}).first().waitFor({timeout:50000});
    note('realConversationTransportWithControlledInference',true);
  }
  assert.equal(await stored(),baseline,'discussion must never apply');
  await page.screenshot({path:OUT+'/02-reply-only.png'});

  const suggest=page.getByRole('group',{name:'Work with the focused passage'}).getByRole('button',{name:'Suggest an edit'});
  await suggest.click();
  if(LIVE){
    await page.waitForFunction(()=>document.querySelectorAll('.p4r1-maia-craft-r1-turn[data-speaker="maia"]').length>=2,{},{timeout:100000});
  } else {
    await page.getByText('I would keep the image and make the cadence a little quieter.',{exact:false}).first().waitFor({timeout:50000});
  }
  const edits=page.locator('.p4r1-craft-r1-locus ins, .p4r1-craft-r1-locus del');
  await edits.first().waitFor({timeout:LIVE?90000:25000});
  note('maiaProposalVisible',await edits.count()>0);
  assert.equal(await stored(),baseline,'proposal alone must not apply');
  await page.screenshot({path:OUT+'/03-marked-proposal.png'});

  const write=page.getByRole('group',{name:'Work with the focused passage'}).getByRole('button',{name:'Write here'});
  await write.click();
  const workEditor=page.getByRole('textbox',{name:'Edit your working passage'});
  await workEditor.fill(REVISED);
  await page.getByRole('button',{name:'Use this as my working copy'}).click();
  note('writerAuthoredWorkingVersion',true);
  const save=page.getByRole('button',{name:'Save my version'});
  await save.waitFor({timeout:20000});
  await save.click();
  await page.getByRole('button',{name:'Apply my version'}).waitFor({timeout:40000});
  note('memberVersionSavedWithoutApplying',await stored()===baseline);
  assert.equal(await stored(),baseline,'Save should not modify manuscript');
  await page.screenshot({path:OUT+'/04-version-saved.png'});

  await page.getByRole('button',{name:'Apply my version'}).click();
  const deadline=Date.now()+30000;
  let after=await stored();
  while(after===baseline&&Date.now()<deadline){await sleep(400);after=await stored();}
  assert.notEqual(after,baseline,'Apply did not change manuscript');
  assert.ok(after.includes(REVISED),JSON.stringify(after));
  note('applyVerifiedInDatabase',true);
  await page.screenshot({path:OUT+'/05-applied.png'});

  const undo=page.getByRole('button',{name:'Undo',exact:true}).first();
  await undo.waitFor({timeout:20000});
  await undo.click();
  let restored=await stored();
  const limit=Date.now()+30000;
  while(restored!==baseline&&Date.now()<limit){await sleep(400);restored=await stored();}
  assert.equal(restored,baseline,'Undo must restore byte-identical original');
  note('undoRestoredExactOriginal',true);
  await page.screenshot({path:OUT+'/06-undone.png'});

  note('externalOriginsBlocked',Array.from(new Set(external)));
  note('pageErrors',trace.filter(x=>x.type==='pageerror'));
  note('apiErrors',trace.filter(x=>x.type==='apierror'));
  assert.deepEqual(trace.filter(x=>x.type==='pageerror'),[]);
  writeFileSync(OUT+'/results.json',JSON.stringify({results,trace},null,2));
  console.log('WITNESS_END_TO_END_PASS');
}
main().catch(async e=>{
  console.error('WITNESS_FAIL',String(e.stack||e).slice(0,6000));
  if(page){
    try{writeFileSync(OUT+'/failure-body.txt',(await page.locator('body').innerText()).slice(0,17000));}catch{}
    try{await page.screenshot({path:OUT+'/failure.png'});}catch{}
  }
  try{writeFileSync(OUT+'/failure-results.json',JSON.stringify({results,trace},null,2));}catch{}
  process.exitCode=1;
}).finally(async()=>{await browser?.close().catch(()=>{});await db?.end().catch(()=>{});});
