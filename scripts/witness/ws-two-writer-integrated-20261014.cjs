/**
 * WS-BETA-SMALL-2 · Staging API plus local Chrome rehearsal for two
 * fictional approved writers and one excluded ordinary account. This is NOT a production test,
 * physical Safari, real Source uploads or release-capacity approval.
 *
 * Hard guardrails:
 *  - explicit local operator opt-in + exact localhost DB name and port;
 *  - localhost Next.js server on port 3776, no redirects or outside URLs;
 *  - no real accounts/manuscripts, no provider calls, no private fields;
 *  - synthetic identities/rows are deleted in finally or reported as failures;
 *  - no manuscript bodies in logs, no migration/backup/deployment commands.
 *
 * Usage (from a staging checkout with pg and Node 20+ installed, after the
 * exact synthetic DB and private staging app are independently witnessed):
 *   WS_COHORT_SYNTHETIC_ONLY=YES_I_ACCEPT_SYNTHETIC_DB_WRITES \
 *     node scripts/witness/ws-two-writer-integrated-20261014.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { performance } = require('node:perf_hooks');
const { chromium, webkit } = require('playwright');

const DB_NAME = 'maia_ws_beta_witness_20261007';
const DATABASE_URL = 'postgresql://soullab@127.0.0.1:5432/' + DB_NAME;
const BASE_URL = 'http://127.0.0.1:3776';
const TOTAL_WRITERS = 2;
const EXCLUDED_WRITERS = 1;
const BROWSER_ENGINE = process.env.WS_TWO_WRITER_BROWSER || 'chromium';
const TEST_MEMBER_IDS = Object.freeze([
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003',
]);
const MAX_REQUEST_MS = 35000;
const ALLOW = 'YES_I_ACCEPT_SYNTHETIC_DB_WRITES';

// Do not make any connection or filesystem change before this operator guard.
if (process.env.WS_COHORT_SYNTHETIC_ONLY !== ALLOW ||
    !['chromium', 'webkit'].includes(BROWSER_ENGINE)) {
  console.error('REFUSED: explicit synthetic witness opt-in is required.');
  process.exit(2);
}
const { Client } = require('pg');
const {assertWitnessDatabaseIdentity} = require('./ws-cohort-witness-db-guard-20261012.cjs');

const label = 'WS-BETA-2-FICTIONAL-' + randomUUID();
const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');
const writers = Array.from({length: TOTAL_WRITERS + EXCLUDED_WRITERS}, (_, i) => ({
  i, admitted: i < TOTAL_WRITERS,
  member: TEST_MEMBER_IDS[i], manuscript: randomUUID(),
  sections: i % 3 === 0 ? [randomUUID(), randomUUID()] : [randomUUID()],
  token: 'synthetic-ws-cohort-' + randomUUID(),
}));
const samples = [];
const checks = [];
const mark = (name, pass) => {
  assert.equal(pass, true, name);
  checks.push(name);
};
const percentile = (series, p) => {
  const sorted = [...series].sort((a,b) => a-b);
  return Math.round(sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*p)-1)] || 0);
};

async function request(token, method, route, body) {
  assert(/^(?:\/api\/)[A-Za-z0-9\/_?=&.\-%]+$/.test(route), 'REFUSE: unsafe request route');
  assert(['GET','POST','PUT'].includes(method), 'REFUSE: unknown method');
  const url = new URL(route, BASE_URL);
  assert.equal(url.origin, BASE_URL, 'REFUSE: request origin changed');
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAX_REQUEST_MS);
  try {
    const res = await fetch(url, {
      method, redirect: 'manual', signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(token ? {'x-session-token': token} : {}),
        ...(body === undefined ? {} : {'content-type':'application/json'}),
      },
      ...(body === undefined ? {} : {body: JSON.stringify(body)}),
    });
    const ms = performance.now() - started;
    samples.push(ms);
    assert(res.status < 300 || res.status >= 400, 'REFUSE: no redirects to other origins');
    // Synthetic payload only; parse JSON in memory, never dump bodies to logs.
    return {status:res.status, body:await res.json().catch(() => null), ms};
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  const db = new Client({connectionString:DATABASE_URL, connectionTimeoutMillis:5000});
  let connected = false, seedCommitted = false, txOpen = false, result = null;
  try {
    // Exit before writes unless both DB identity and API behavior match test setup.
    await db.connect(); connected=true;
    // host(inet) removes the CIDR suffix PostgreSQL's ::text displays:
    // 127.0.0.1/32 becomes 127.0.0.1. The strict pure guard still rejects
    // any nonloopback address or different database/port before fixture INSERTs.
    const witness=(await db.query(`SELECT current_database() AS name,
              host(inet_server_addr()) AS address,
              inet_server_port() AS port`)).rows[0];
    assertWitnessDatabaseIdentity(witness);
    const ids = writers.map(w => w.member);
    const collision=(await db.query('SELECT count(*)::int AS n FROM members WHERE id=ANY($1::uuid[])',[ids])).rows[0].n;
    assert.equal(collision,0,'REFUSE: fictional member-ID already exists; do not overwrite');
    mark('exact staging PostgreSQL connection, no fixture collision', true);
    mark('unauthenticated beta access denied',
      (await request(null,'GET','/api/sovereign/writers-studio/beta-access')).status === 401);
    mark('unauthenticated manuscript list denied',
      (await request(null,'GET','/api/sovereign/manuscripts')).status === 401);

    await db.query('BEGIN'); txOpen=true;
    for (const w of writers) {
      await db.query(`INSERT INTO members
          (id,passkey,username,password_hash,name,admin_role,tier,roles)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [w.member,'synthetic-'+w.member,'synthetic-'+w.member,
         'not-a-real-password',label+' #'+w.i,null,'pro',['member']]);
      await db.query(`INSERT INTO auth_sessions
          (member_id,session_token,expires_at)
          VALUES ($1,$2,now()+interval '30 minutes')`, [w.member,w.token]);
      await db.query(`INSERT INTO member_manuscripts
          (id,member_id,title) VALUES($1,$2,$3)`,
        [w.manuscript,w.member,label+' Manuscript #'+w.i]);
      for (let j=0;j<w.sections.length;j++) {
        const questionForm = (w.i%3)===0;
        const heading=questionForm ? null : 'Synthetic Chapter '+(j+1);
        const words=questionForm
          ? 'What is a question?\nWhy preserve this question as written?\n'
          : 'Only synthetic author content.\nA distinct synthetic paragraph.\n';
        await db.query(`INSERT INTO manuscript_sections
            (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [w.sections[j],w.manuscript,j,heading,
           heading === null ? null : 1,heading === null ? null : 'markdown',words]);
      }
      // All three have generic beta status; excluded writer is denied by the
      // exact Studio allowlist, not merely by absence of general beta status.
      await db.query(`INSERT INTO ops_contacts
          (name,member_id,contact_type,pipeline_stage)
          VALUES ($1,$2,'beta_tester','active')`,
        [label+' admitted #'+w.i,w.member]);
    }
    await db.query('COMMIT'); txOpen=false;seedCommitted=true;

    // Exactly three fictional accounts: two invited, one excluded.
    const eligibility=await Promise.all(writers.map(w => request(
      w.token,'GET','/api/sovereign/writers-studio/beta-access')));
    for (let i=0;i<writers.length;i++) {
      const w=writers[i],r=eligibility[i];
      assert.equal(r.status,200,'beta access response');
      assert.equal(r.body?.eligible,w.admitted,'beta eligibility must match exact member');
    }
    mark('two admitted and one excluded by exact allowlist', true);

    const own=await Promise.all(writers.map(w => request(
      w.token,'GET','/api/writers-studio/rebuild/context?manuscriptId='+w.manuscript)));
    own.forEach((r,i) => {
      // Only two *explicitly approved* writers enter this dedicated Studio API.
      // The excluded account remains an active generic Soullab beta tester.
      assert.equal(r.status,writers[i].admitted ? 200 : 403,
        'exact small-group Studio grant must be enforced');
      if(writers[i].admitted){
        assert.equal(r.body?.state,'no_draft','initial synthetic manuscript has no draft');
      }
    });
    mark('two eligible Studio reads and one excluded access refusal',true);

    const foreign=await Promise.all(writers.map((w,i) => request(w.token,'GET',
      '/api/writers-studio/rebuild/context?manuscriptId='+writers[(i+1)%writers.length].manuscript)));
    foreign.forEach((r,i)=>{
      // Invited writer: ownership -> 404. Uninvited writer: outer gate -> 403.
      assert.equal(r.status,writers[i].admitted ? 404 : 403,
        'cross-writer access must be refused at the appropriate boundary');
      if(writers[i].admitted) assert.equal(r.body?.error,'not_found','no existence leak');
    });
    mark('three cross-writer access refusals at distinct boundaries',true);

    // Two parallel creations into the synthetic test database; no public
    // source ingress, no live data, no implicit chapter inference.
    const admitted=writers.filter(w=>w.admitted);
    const created=await Promise.all(admitted.map(w => request(
      w.token,'POST','/api/sovereign/manuscripts/'+w.manuscript+'/draft')));
    created.forEach(r=>assert([200,201].includes(r.status),'synthetic draft creation'));
    mark('two synthetic draft creations',true);

    const drafted=await Promise.all(admitted.map(w => request(
      w.token,'GET','/api/sovereign/manuscripts/'+w.manuscript+'/draft')));
    const saves=await Promise.all(admitted.map((w,i) => {
      const d=drafted[i].body;
      assert.equal(drafted[i].status,200);
      assert.equal(d?.sectionAddressable,true);
      assert.equal(d?.sections?.length,w.sections.length,'source structure remains member-supplied');
      const nextSections=d.sections.map((s,j) => ({
        id:s.id, text:s.text+'\nSYNTHETIC_WRITER_'+i+'_SAVED_'+j,
      }));
      w.expectedDigest=sha256(nextSections.map(s=>s.text).join(''));
      return request(w.token,'PUT','/api/sovereign/manuscripts/'+w.manuscript+'/draft',{
        sections:nextSections,baseRevisionId:d.revisionId,idempotencyKey:randomUUID(),
      });
    }));
    saves.forEach(r=>assert.equal(r.status,200,'owner-authorized synthetic save'));
    mark('two writer-owned save operations',true);

    const reopened=await Promise.all(admitted.map(w => request(
      w.token,'GET','/api/sovereign/manuscripts/'+w.manuscript+'/draft')));
    reopened.forEach((r,i) => {
      assert.equal(r.status,200);
      assert.equal(sha256(r.body?.content || ''),admitted[i].expectedDigest,
        'persisted manuscript is byte-for-byte its own synthetic save');
      assert.equal(r.body?.sections?.length,admitted[i].sections.length);
    });
    mark('two exact synthetic save-and-return checks',true);

    // Denied writes may never reveal a foreign manuscript's presence.
    const refusedWrites=await Promise.all(writers.map((w,i) => request(w.token,'PUT',
      '/api/sovereign/manuscripts/'+writers[(i+1)%writers.length].manuscript+'/draft',
      {sections:[],baseRevisionId:1,idempotencyKey:randomUUID()})));
    refusedWrites.forEach(r=>assert.equal(r.status,404,'foreign write must be refused'));
    mark('three refused cross-writer write attempts',true);


    // Browser acceptance runs against the EXACT localhost compiled app with
    // three separate verified-cookie contexts. The outer test runner owns only
    // fictional rows and never submits any MAIA/provider/voice message.
    const browser = await (BROWSER_ENGINE === 'webkit' ? webkit : chromium).launch(
      BROWSER_ENGINE === 'webkit' ? { headless: true } : {
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      },
    );
    try {
      for(const w of admitted){
        const ctx=await browser.newContext({
          viewport:{width:w.i===1?390:1280,height:850},serviceWorkers:'block',acceptDownloads:true
        });
        try {
          await ctx.addCookies([{name:'maia_session',value:w.token,url:BASE_URL}]);
          const page=await ctx.newPage();
          const pageErrors=[];
          page.on('pageerror',e=>pageErrors.push(e.name));
          await page.route('**/*',route=>{
            const u=route.request().url();
            return u.startsWith(BASE_URL+'/')||u.startsWith('data:')||
              u.startsWith('blob:')||u.startsWith('about:') ?
              route.continue() : route.abort();
          });
          const opened=await page.goto(BASE_URL+'/writers-studio?mode=home',{
            waitUntil:'domcontentloaded',timeout:105000
          });
          assert.equal(opened.status(),200,'member enters actual Studio Home');
          await page.waitForTimeout(900);
          // The optimized standalone can hydrate after DOMContentLoaded;
          // wait for a real visible writing room rather than a fallback shell.
          await page.waitForFunction(() => document.body?.innerText?.length > 140,
            null,{timeout:18000}).catch(()=>{});
          const home=(await page.locator('body').innerText());
          if(home.length<=140){
            const path=new URL(page.url()).pathname;
            console.error('PRODUCTION_HOME_RENDER_DIAGNOSTIC',JSON.stringify({
              path,visibleChars:home.length,clientErrorTypes:pageErrors,
              hasFallback:home.includes('Opening your Writer'),
              hasSignin:home.includes('Sign in'),
            }));
          }
          assert(home.length>140,'Studio Home is not a blank canvas');
          assert(!/Internal Server Error|Application error: a client-side exception/i.test(home),
            'Studio Home error');
          mark('actual '+BROWSER_ENGINE+' fictional writer '+w.i+' Home',true);
          for(const mode of ['develop','write','review']){
            const loaded=await page.goto(BASE_URL+'/writers-studio?mode='+mode+
              '&m='+w.manuscript,{waitUntil:'domcontentloaded',timeout:105000});
            assert.equal(loaded.status(),200,'Studio '+mode+' must load as admitted writer');
            await page.waitForTimeout(500);
            await page.waitForFunction(() => document.body?.innerText?.length>140,
              null,{timeout:20000}).catch(()=>{});
            const content=await page.locator('body').innerText();
            if(content.length<=140){
              console.error('STUDIO_MODE_RENDER_HOLD',JSON.stringify({
                mode,writerIndex:w.i,path:new URL(page.url()).pathname,
                renderedCharacters:content.length,clientErrorTypes:pageErrors
              }));
            }
            assert(content.length>140,'Studio '+mode+' blank');
            assert(!/Internal Server Error|Application error: a client-side exception/i.test(content),
              'Studio '+mode+' error');
            if(mode==='write'){
              // Exercise the REAL authenticated Writing UI, rather than
              // relying only on API PUT and route-level visual acceptance.
              const copyButton=page.getByRole('button',{name:'Save a copy',exact:true});
              assert.equal(await copyButton.count(),1,'visible Save a copy action missing');
              // The canonical Writer's Studio editor is a plaintext-only
              // contenteditable textbox, NOT a textarea or an Edit button.
              const editor=page.locator('[data-write-editor][contenteditable="plaintext-only"]').first();
              await editor.waitFor({state:'visible',timeout:12000});
              const before=await editor.innerText();
              assert(before.includes('SYNTHETIC_WRITER_'+w.i+'_SAVED_'),
                'actual editor did not render the writer own saved passage');
              const uiMarker='SYNTHETIC_UI_EDIT_'+BROWSER_ENGINE+'_'+w.i;
              await editor.fill(before+'\n'+uiMarker+'\n');
              await editor.blur();
              mark('actual '+BROWSER_ENGINE+' writer '+w.i+' editor accepts input',true);

              // Browser-owned copy MUST include unsaved on-screen text and
              // MUST NOT contain the other writer synthetic marker.
              await copyButton.click();
              const downloadEvent=page.waitForEvent('download',{timeout:16000});
              await page.getByRole('button',{name:/Plain text/}).click();
              const download=await downloadEvent;
              const exported=readFileSync(await download.path(),'utf8');
              assert(exported.includes(uiMarker),'device copy missed current editor changes');
              assert(!exported.includes('SYNTHETIC_WRITER_'+(1-w.i)+'_SAVED_'),
                'foreign writer words present in owner download');
              mark('actual '+BROWSER_ENGINE+' writer '+w.i+' downloads latest own text',true);

              // A member may navigate away only after the data is really
              // persisted. Observe POST/PUT via authenticated owner API and
              // wait for its exact synthetic marker, never a guessed timer.
              let persisted=false;
              for(let n=0;n<25;n++){
                const actual=await request(w.token,'GET',
                  '/api/sovereign/manuscripts/'+w.manuscript+'/draft');
                if(actual.status===200 && actual.body?.content?.includes(uiMarker)){
                  persisted=true;
                  break;
                }
                await new Promise(resolve=>setTimeout(resolve,550));
              }
              assert(persisted,'browser edit did not durably save to the owner draft');
              mark('actual '+BROWSER_ENGINE+' writer '+w.i+' UI edit durably saved',true);
            }
            mark('actual '+BROWSER_ENGINE+' fictional writer '+w.i+' '+mode,true);
          }
          await page.reload({waitUntil:'domcontentloaded',timeout:105000});
          // domcontentloaded precedes React hydration. Do not mistake an
          // intermediate empty body for an authored-work loss.
          await page.waitForFunction(()=>
            document.body && document.body.innerText.length>140,
            null,{timeout:25000}
          );
          const afterRefresh=await page.locator('body').innerText();
          mark('writer '+w.i+' browser refresh survives',
            afterRefresh.length>140 &&
            !/Internal Server Error|Application error: a client-side exception/i.test(afterRefresh));
          assert.deepEqual(pageErrors,[],'JavaScript page errors in admitted Studio');
        } finally { await ctx.close(); }
      }
      const deniedCtx=await browser.newContext({serviceWorkers:'block'});
      try{
        await deniedCtx.addCookies([{name:'maia_session',value:writers[2].token,url:BASE_URL}]);
        const page=await deniedCtx.newPage();
        await page.goto(BASE_URL+'/writers-studio?mode=home',{
          waitUntil:'domcontentloaded',timeout:105000
        });
        assert(page.url().includes('/writers-studio/beta-limited'),
          'ordinary beta tester without exact writer grant entered Studio');
        mark('uninvited browser redirected to restricted-beta page',true);
      } finally { await deniedCtx.close(); }
    } finally { await browser.close(); }

    // Server-side revocation changes ONLY a fictional session.
    await db.query('UPDATE auth_sessions SET revoked=true WHERE member_id=$1',
      [admitted[0].member]);
    const revoked=await request(admitted[0].token,'GET',
      '/api/writers-studio/rebuild/context?manuscriptId='+admitted[0].manuscript);
    assert.equal(revoked.status,401,'revoked writer credential still opened Studio API');
    mark('revoked fictional session refused immediately',true);

    result = {
      checks,writer_count:TOTAL_WRITERS,excluded_count:EXCLUDED_WRITERS,
      requests:samples.length,p95_ms:percentile(samples,.95),
      p99_ms:percentile(samples,.99),max_ms:Math.round(Math.max(...samples)),
      browser_tested:true,browser_engine:BROWSER_ENGINE,voice_tested:false,restore_tested:false,
      production_tested:false,
    };
  } finally {
    if(connected) {
      if(txOpen) await db.query('ROLLBACK').catch(()=>{});
      if(seedCommitted) {
        const mids=writers.map(x=>x.manuscript),uids=writers.map(x=>x.member);
        try {
          await db.query('BEGIN');
          await db.query(`DELETE FROM working_draft_revisions WHERE draft_id IN
            (SELECT id FROM manuscript_working_drafts WHERE manuscript_id=ANY($1::uuid[]))`,[mids]);
          await db.query(`DELETE FROM manuscript_draft_sections WHERE draft_id IN
            (SELECT id FROM manuscript_working_drafts WHERE manuscript_id=ANY($1::uuid[]))`,[mids]);
          await db.query('DELETE FROM manuscript_working_drafts WHERE manuscript_id=ANY($1::uuid[])',[mids]);
          await db.query('DELETE FROM manuscript_sections WHERE manuscript_id=ANY($1::uuid[])',[mids]);
          await db.query('DELETE FROM member_manuscripts WHERE id=ANY($1::uuid[])',[mids]);
          await db.query('DELETE FROM ops_contacts WHERE member_id=ANY($1::uuid[])',[uids]);
          await db.query('DELETE FROM auth_sessions WHERE member_id=ANY($1::uuid[])',[uids]);
          await db.query('DELETE FROM members WHERE id=ANY($1::uuid[])',[uids]);
          await db.query('COMMIT');
          const residual=(await db.query('SELECT count(*)::int AS n FROM members WHERE id=ANY($1::uuid[])',[uids])).rows[0].n;
          assert.equal(residual,0,'failed synthetic cleanup postcheck');
          console.log('WS_TWO_WRITER_SYNTHETIC_CLEANUP_PASS');
        } catch(error) {
          await db.query('ROLLBACK').catch(()=>{});
          console.error('WS_TWO_WRITER_SYNTHETIC_CLEANUP_HOLD: inspect witness DB before reuse; never run on production.');
          process.exitCode=1;
        }
      }
      await db.end().catch(()=>{});
    }
  }
  // Do not emit an acceptance PASS until exact synthetic cleanup is verified.
  if (result && process.exitCode !== 1)
    console.log('WS_TWO_WRITERS_INTEGRATED_SYNTHETIC_PASS', JSON.stringify(result));
})().catch(err=>{
  // Do not print SQL errors, private values, real paths or data. A failure is
  // evidence for a local reviewer to investigate in the witness environment.
  console.error('WS_TWO_WRITER_INTEGRATED_HOLD',err?.name||'Error',
    String(err?.message||'').slice(0,140));
  process.exitCode=1;
});
