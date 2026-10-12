/**
 * WS-BETA-COHORT-10 · Staging API acceptance for ten simultaneous synthetic
 * writers and two excluded ordinary accounts. This is NOT a production test,
 * browser test, source-upload authorization, or capacity certificate by itself.
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
 *     node scripts/witness/ws-rolling-cohort-ten-writer-20261012.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');

const DB_NAME = 'maia_ws_beta_witness_20261007';
const DATABASE_URL = 'postgresql://soullab@127.0.0.1:5432/' + DB_NAME;
const BASE_URL = 'http://127.0.0.1:3776';
const TOTAL_WRITERS = 10;
const EXCLUDED_WRITERS = 2;
const MAX_REQUEST_MS = 35000;
const ALLOW = 'YES_I_ACCEPT_SYNTHETIC_DB_WRITES';

// Do not make any connection or filesystem change before this operator guard.
if (process.env.WS_COHORT_SYNTHETIC_ONLY !== ALLOW) {
  console.error('REFUSED: explicit synthetic witness opt-in is required.');
  process.exit(2);
}
const { Client } = require('pg');

const label = 'WS-BETA-COHORT-10-' + randomUUID();
const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');
const writers = Array.from({length: TOTAL_WRITERS + EXCLUDED_WRITERS}, (_, i) => ({
  i, admitted: i < TOTAL_WRITERS,
  member: randomUUID(), manuscript: randomUUID(),
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
    const witness=(await db.query(\`SELECT current_database() AS name,
              inet_server_addr()::text AS address,
              inet_server_port() AS port\`)).rows[0];
    assert.equal(witness.name, DB_NAME, 'REFUSE: not dedicated witness DB');
    assert(['127.0.0.1','::1'].includes(witness.address), 'REFUSE: DB is not loopback');
    assert.equal(witness.port, 5432, 'REFUSE: unexpected DB port');
    mark('exact staging PostgreSQL connection', true);
    mark('unauthenticated beta access denied',
      (await request(null,'GET','/api/sovereign/writers-studio/beta-access')).status === 401);
    mark('unauthenticated manuscript list denied',
      (await request(null,'GET','/api/sovereign/manuscripts')).status === 401);

    await db.query('BEGIN'); txOpen=true;
    for (const w of writers) {
      await db.query(\`INSERT INTO members
          (id,passkey,username,password_hash,name,admin_role)
          VALUES ($1,$2,$3,$4,$5,$6)\`,
        [w.member,'synthetic-'+w.member,'synthetic-'+w.member,
         'not-a-real-password',label+' #'+w.i,null]);
      await db.query(\`INSERT INTO auth_sessions
          (member_id,session_token,expires_at)
          VALUES ($1,$2,now()+interval '30 minutes')\`, [w.member,w.token]);
      await db.query(\`INSERT INTO member_manuscripts
          (id,member_id,title) VALUES($1,$2,$3)\`,
        [w.manuscript,w.member,label+' Manuscript #'+w.i]);
      for (let j=0;j<w.sections.length;j++) {
        const questionForm = (w.i%3)===0;
        const heading=questionForm ? null : 'Synthetic Chapter '+(j+1);
        const words=questionForm
          ? 'What is a question?\nWhy preserve this question as written?\n'
          : 'Only synthetic author content.\nA distinct synthetic paragraph.\n';
        await db.query(\`INSERT INTO manuscript_sections
            (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
            VALUES ($1,$2,$3,$4,$5,$6,$7)\`,
          [w.sections[j],w.manuscript,j,heading,
           heading === null ? null : 1,heading === null ? null : 'markdown',words]);
      }
      if(w.admitted) await db.query(\`INSERT INTO ops_contacts
          (name,member_id,contact_type,pipeline_stage)
          VALUES ($1,$2,'beta_tester','active')\`,
        [label+' admitted #'+w.i,w.member]);
    }
    await db.query('COMMIT'); txOpen=false;seedCommitted=true;

    // One 12-account cohort: ten eligible, two unrelated excluded.
    const eligibility=await Promise.all(writers.map(w => request(
      w.token,'GET','/api/sovereign/writers-studio/beta-access')));
    for (let i=0;i<writers.length;i++) {
      const w=writers[i],r=eligibility[i];
      assert.equal(r.status,200,'beta access response');
      assert.equal(r.body?.eligible,w.admitted,'beta eligibility must match exact member');
    }
    mark('ten admitted and two excluded memberships', true);

    const own=await Promise.all(writers.map(w => request(
      w.token,'GET','/api/writers-studio/rebuild/context?manuscriptId='+w.manuscript)));
    own.forEach((r,i) => {
      assert.equal(r.status,200,'each writer can open only own manuscript context');
      assert.equal(r.body?.state,'no_draft','initial synthetic manuscript has no draft');
    });
    mark('twelve simultaneous owner-scoped manuscript reads',true);

    const foreign=await Promise.all(writers.map((w,i) => request(w.token,'GET',
      '/api/writers-studio/rebuild/context?manuscriptId='+writers[(i+1)%writers.length].manuscript)));
    foreign.forEach(r=>{assert.equal(r.status,404,'foreign manuscript must be invisible');
      assert.equal(r.body?.error,'not_found','no existence leak');});
    mark('twelve cross-writer refused manuscript reads',true);

    // Ten simultaneous creations into the disposable test database; no public
    // source ingress, no live data, no implicit chapter inference.
    const admitted=writers.filter(w=>w.admitted);
    const created=await Promise.all(admitted.map(w => request(
      w.token,'POST','/api/sovereign/manuscripts/'+w.manuscript+'/draft')));
    created.forEach(r=>assert([200,201].includes(r.status),'synthetic draft creation'));
    mark('ten simultaneous synthetic draft creations',true);

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
    mark('ten concurrent writer-owned save operations',true);

    const reopened=await Promise.all(admitted.map(w => request(
      w.token,'GET','/api/sovereign/manuscripts/'+w.manuscript+'/draft')));
    reopened.forEach((r,i) => {
      assert.equal(r.status,200);
      assert.equal(sha256(r.body?.content || ''),admitted[i].expectedDigest,
        'persisted manuscript is byte-for-byte its own synthetic save');
      assert.equal(r.body?.sections?.length,admitted[i].sections.length);
    });
    mark('ten exact synthetic save-and-return checks',true);

    // Denied writes may never reveal a foreign manuscript's presence.
    const refusedWrites=await Promise.all(writers.map((w,i) => request(w.token,'PUT',
      '/api/sovereign/manuscripts/'+writers[(i+1)%writers.length].manuscript+'/draft',
      {sections:[],baseRevisionId:1,idempotencyKey:randomUUID()})));
    refusedWrites.forEach(r=>assert.equal(r.status,404,'foreign write must be refused'));
    mark('twelve refused cross-writer write attempts',true);

    result = {
      checks,writer_count:TOTAL_WRITERS,excluded_count:EXCLUDED_WRITERS,
      requests:samples.length,p95_ms:percentile(samples,.95),
      p99_ms:percentile(samples,.99),max_ms:Math.round(Math.max(...samples)),
      browser_tested:false,voice_tested:false,restore_tested:false,
      production_tested:false,
    };
  } finally {
    if(connected) {
      if(txOpen) await db.query('ROLLBACK').catch(()=>{});
      if(seedCommitted) {
        const mids=writers.map(x=>x.manuscript),uids=writers.map(x=>x.member);
        try {
          await db.query('BEGIN');
          await db.query(\`DELETE FROM working_draft_revisions WHERE draft_id IN
            (SELECT id FROM manuscript_working_drafts WHERE manuscript_id=ANY($1::uuid[]))\`,[mids]);
          await db.query(\`DELETE FROM manuscript_draft_sections WHERE draft_id IN
            (SELECT id FROM manuscript_working_drafts WHERE manuscript_id=ANY($1::uuid[]))\`,[mids]);
          await db.query('DELETE FROM manuscript_working_drafts WHERE manuscript_id=ANY($1::uuid[])',[mids]);
          await db.query('DELETE FROM manuscript_sections WHERE manuscript_id=ANY($1::uuid[])',[mids]);
          await db.query('DELETE FROM member_manuscripts WHERE id=ANY($1::uuid[])',[mids]);
          await db.query('DELETE FROM ops_contacts WHERE member_id=ANY($1::uuid[])',[uids]);
          await db.query('DELETE FROM auth_sessions WHERE member_id=ANY($1::uuid[])',[uids]);
          await db.query('DELETE FROM members WHERE id=ANY($1::uuid[])',[uids]);
          await db.query('COMMIT');
          const residual=(await db.query('SELECT count(*)::int AS n FROM members WHERE id=ANY($1::uuid[])',[uids])).rows[0].n;
          assert.equal(residual,0,'failed synthetic cleanup postcheck');
          console.log('WS_COHORT_SYNTHETIC_CLEANUP_PASS');
        } catch(error) {
          await db.query('ROLLBACK').catch(()=>{});
          console.error('WS_COHORT_SYNTHETIC_CLEANUP_HOLD: inspect witness DB before reuse; never run on production.');
          process.exitCode=1;
        }
      }
      await db.end().catch(()=>{});
    }
  }
  // Do not emit an acceptance PASS until exact synthetic cleanup is verified.
  if (result && process.exitCode !== 1)
    console.log('WS_COHORT_SYNTHETIC_10_WRITERS_PASS', JSON.stringify(result));
})().catch(err=>{
  // Do not print SQL errors, private values, real paths or data. A failure is
  // evidence for a local reviewer to investigate in the witness environment.
  console.error('WS_COHORT_SYNTHETIC_FAIL',err?.name||'Error',
    String(err?.message||'').slice(0,140));
  process.exitCode=1;
});
