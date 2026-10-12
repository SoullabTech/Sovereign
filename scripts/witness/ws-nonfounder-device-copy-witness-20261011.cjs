/** WS-BETA-OWNER-01 · Local nonfounder + owner-isolation browser witness.
 * AUTHORITY: synthetic data ONLY, exact dedicated _witness_ database, localhost
 * server on 3776. No provider inference, uploads, production account edits.
 * Clean up all exact synthetic rows in finally. Never run against a real DB.
 */
const { Client } = require('pg');
const { chromium } = require('playwright');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');
const { promises: fs } = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DB = 'maia_ws_beta_witness_20261007';
const dsn = 'postgresql://soullab@127.0.0.1:5432/'+DB;
const BASE = 'http://127.0.0.1:3776';
const A = { id:randomUUID(), token:'synthetic-writer-'+randomUUID(), manuscript:randomUUID(), section:randomUUID() };
const B = { id:randomUUID(), token:'synthetic-reader-'+randomUUID(), manuscript:randomUUID(), section:randomUUID() };
const prefix='TEST ONLY WS-BETA-OWNER-01 '+randomUUID().slice(0,8);
const db=new Client({connectionString:dsn,connectionTimeoutMillis:5000});
let seeded=false, browser=null;
const checks={};
const request=async(token,method,route)=>{
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),35000);
  try {
    const res=await fetch(BASE+route,{method,headers:{
      'accept':'application/json',...(token?{'x-session-token':token}:{})
    },signal:ctrl.signal});
    return {status:res.status, body:await res.json().catch(()=>null)};
  } catch (error) {
    throw new Error('Witness request failed: '+method+' '+route+' · '+(error instanceof Error ? error.name : 'unknown'));
  } finally {clearTimeout(timer);}
};
(async()=>{
  await db.connect();
  const dbName=(await db.query('SELECT current_database() AS db')).rows[0].db;
  assert.equal(dbName,DB,'REFUSE: not the exact witness DB');
  assert(dbName.includes('_witness_'));
  try {
    await db.query('BEGIN');
    for(const [n,x] of [['A',A],['B',B]]){
      await db.query(
        'INSERT INTO members(id,passkey,username,password_hash,name,admin_role) VALUES($1,$2,$3,$4,$5,$6)',
        [x.id,'ws-witness-'+x.id,'ws-witness-'+x.id,'not-a-real-login',prefix+' '+n,null]);
      await db.query(
        "INSERT INTO auth_sessions(member_id,session_token,expires_at) VALUES($1,$2,now()+interval '45 minutes')",
        [x.id,x.token]);
      await db.query('INSERT INTO member_manuscripts(id,member_id,title) VALUES($1,$2,$3)',
        [x.manuscript,x.id,prefix+' Manuscript '+n]);
      await db.query(
        'INSERT INTO manuscript_sections(id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES($1,$2,0,$3,1,$4,$5)',
        [x.section,x.manuscript,'Chapter One','markdown','A synthetic passage only.\n\nA second synthetic paragraph.']);
    }
    await db.query(
      "INSERT INTO ops_contacts(name,member_id,contact_type,pipeline_stage) VALUES($1,$2,'beta_tester','active')",
      [prefix+' Admitted',A.id]);
    await db.query('COMMIT'); seeded=true;
    const unauthorized=await request(null,'GET','/api/sovereign/writers-studio/beta-access');
    assert.equal(unauthorized.status,401); checks.unauthenticatedRefused=true;
    const admitted=await request(A.token,'GET','/api/sovereign/writers-studio/beta-access');
    assert.equal(admitted.status,200);
    assert.deepEqual(admitted.body,{eligible:true,basis:'active_beta_tester'});checks.nonfounderLinkedAdmitted=true;
    const excluded=await request(B.token,'GET','/api/sovereign/writers-studio/beta-access');
    assert.deepEqual(excluded.body,{eligible:false,basis:'not_in_pilot'});checks.otherNonfounderExcluded=true;

    // Manuscript existence is never disclosed across members, regardless of beta eligibility.
    for(const [owner,foreign] of [[A,B],[B,A]]){
      const own=await request(owner.token,'GET',
        '/api/writers-studio/rebuild/context?manuscriptId='+owner.manuscript);
      assert.equal(own.status,200);
      assert.equal(own.body.state,'no_draft');
      const refused=await request(foreign.token,'GET',
        '/api/writers-studio/rebuild/context?manuscriptId='+owner.manuscript);
      assert.equal(refused.status,404);
      assert.equal(refused.body.error,'not_found');
    }
    checks.twoWayManuscriptIsolation=true;

    // Creates section-addressable draft ONLY in the dedicated synthetic database.
    const created=await request(A.token,'POST','/api/sovereign/manuscripts/'+A.manuscript+'/draft');
    console.log('SYNTHETIC_DRAFT_STATUS',created.status,
      typeof created.body?.error==='string' ? created.body.error.slice(0,100) : created.body?.state ?? 'accepted');
    assert([200,201].includes(created.status),'Synthetic draft must be created for UI rehearsal');
    const prepared=await request(A.token,'GET',
      '/api/writers-studio/rebuild/context?manuscriptId='+A.manuscript);
    assert.equal(prepared.status,200);
    assert.equal(prepared.body.state,'section_aware');
    checks.ownerDraftRead=true;

    browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const ctx=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
    await ctx.addCookies([{name:'maia_session',value:A.token,url:BASE}]);
    const page=await ctx.newPage();
    const external=[],mutating=[],pageErrors=[];
    await page.route('**/*',route=>{
      const r=route.request(),url=r.url();
      if(!url.startsWith(BASE+'/')&&!url.startsWith('data:')&&!url.startsWith('blob:')){
        external.push(url);return route.abort();
      }
      if(!['GET','HEAD','OPTIONS'].includes(r.method())){
        mutating.push(r.method()+' '+new URL(url).pathname);return route.abort();
      }
      return route.continue();
    });
    page.on('pageerror',e=>pageErrors.push(String(e).slice(0,120)));
    await page.goto(BASE+'/writers-studio?mode=write&m='+A.manuscript,{waitUntil:'domcontentloaded',timeout:60000});
    try {
      await page.getByRole('button',{name:'Save a copy',exact:true}).waitFor({timeout:60000});
    }catch(e){
      console.log('UI_DIAG',{url:page.url(),body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,430)});
      throw e;
    }
    checks.authenticatedNonfounderOpenedWrite=true;
    await page.getByRole('button',{name:'Save a copy',exact:true}).click();
    const dl=page.waitForEvent('download',{timeout:15000});
    await page.getByRole('button',{name:/Plain text/}).click();
    const downloaded=await dl;
    const file=path.join(os.tmpdir(),'ws-nonfounder-20261011-'+A.id+'.txt');
    try {
      await downloaded.saveAs(file);
      const contents=await fs.readFile(file,'utf8');
      assert(contents.includes('A synthetic passage only.'));
      assert(contents.includes('A second synthetic paragraph.'));
      assert.equal(await downloaded.failure(),null);
    }finally { await fs.unlink(file).catch(()=>{}); }
    checks.writerOwnedCopyThroughAuthenticatedRoom=true;
    assert.deepEqual(mutating,[],'Browser must not issue a mutation to download');
    assert.deepEqual(external,[],'Browser must not contact external network in witness');
    checks.noBrowserMutationsOrExternalCalls=true;
    console.log('WS_SYNTHETIC_NONFOUNDER_WITNESS_PASS',JSON.stringify(checks));
    console.log('BROWSER_ERRORS',pageErrors.length);
    await ctx.close();
  }finally {
    if(browser) await browser.close().catch(()=>{});
    if(seeded){
      await db.query('BEGIN');
      try {
        const manuscripts=[A.manuscript,B.manuscript],members=[A.id,B.id];
        await db.query('DELETE FROM working_draft_revisions WHERE draft_id IN (SELECT id FROM manuscript_working_drafts WHERE manuscript_id = ANY($1::uuid[]))',[manuscripts]);
        await db.query('DELETE FROM manuscript_draft_sections WHERE draft_id IN (SELECT id FROM manuscript_working_drafts WHERE manuscript_id = ANY($1::uuid[]))',[manuscripts]);
        await db.query('DELETE FROM manuscript_working_drafts WHERE manuscript_id = ANY($1::uuid[])',[manuscripts]);
        await db.query('DELETE FROM manuscript_sections WHERE manuscript_id = ANY($1::uuid[])',[manuscripts]);
        await db.query('DELETE FROM member_manuscripts WHERE id = ANY($1::uuid[])',[manuscripts]);
        await db.query('DELETE FROM ops_contacts WHERE member_id = ANY($1::uuid[])',[members]);
        await db.query('DELETE FROM auth_sessions WHERE member_id = ANY($1::uuid[])',[members]);
        await db.query('DELETE FROM members WHERE id = ANY($1::uuid[])',[members]);
        await db.query('COMMIT');
        console.log('SYNTHETIC_ACCOUNT_CLEANUP_PASS');
      }catch(cleanErr){await db.query('ROLLBACK');console.log('SYNTHETIC_ACCOUNT_CLEANUP_FAILED',String(cleanErr).slice(0,260));process.exitCode=1;}
    }else await db.query('ROLLBACK').catch(()=>{});
    await db.end();
  }
})().catch(err=>{console.error('WS_SYNTHETIC_NONFOUNDER_WITNESS_FAIL',String(err).slice(0,900));process.exitCode=1;db.end().catch(()=>{});});
