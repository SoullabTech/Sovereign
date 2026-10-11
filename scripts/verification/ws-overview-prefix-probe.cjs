/* Transaction-only local probe. The SQL migration's outer BEGIN/COMMIT are
   deliberately stripped and tested as exact guards: never commit this fixture. */
'use strict';
const fs = require('fs');
const { Client } = require('pg');
const testURL = process.env.DATABASE_URL;
if (!testURL) throw Error('REFUSED: database URL absent');
const u = new URL(testURL);
const localExisting = ['localhost','127.0.0.1','::1'].includes(u.hostname)
  && ['maia_consciousness_test','sanctuary_protocol_verify_1008'].includes(decodeURIComponent(u.pathname.slice(1)));
const isolatedPG16 = u.hostname === '127.0.0.1' && u.port === '15432'
  && decodeURIComponent(u.pathname) === '/postgres'
  && process.env.MAIA_OVERVIEW_DISPOSABLE_DB === 'synthetic-pg16-only';
if (!localExisting && !isolatedPG16) {
  throw Error('REFUSED: fixture SQL cannot target production or any unapproved DB');
}
const scratch = 'ws_overview_' + process.pid.toString();
const liveDef = fs.readFileSync(process.argv[2], 'utf8');
const proposed = fs.readFileSync(process.argv[3], 'utf8').replace(/^(?:\s*--[^\n]*\n)+/, '').trim();
if (!/^BEGIN;\s/i.test(proposed) || !/\bCOMMIT;$/i.test(proposed)
    || (proposed.match(/\bCOMMIT\s*;/gi)||[]).length !== 1) throw Error('REFUSED: SQL transaction wrapper changed');
const migration = proposed.replace(/^BEGIN;\s*/i,'').replace(/\s*COMMIT;$/i,'');
if (/\b(COMMIT|ROLLBACK|BEGIN|SAVEPOINT)\s*;/i.test(migration)) throw Error('REFUSED: nested transaction control');
const expectedFn=/CREATE OR REPLACE FUNCTION (?:public\.)?developmental_readings_observations_check\(\)/i;
if (!expectedFn.test(liveDef)) throw Error('REFUSED: live function not bound');
const installedFn=liveDef.replace(expectedFn,'CREATE OR REPLACE FUNCTION "'+scratch+'".developmental_readings_observations_check()');
const client = new Client({ connectionString: testURL, connectionTimeoutMillis: 5000 });
let checks=0, bad=0;
async function run(name, sql, params, allowed) {
  const sp='p'+(checks+1);
  await client.query('SAVEPOINT '+sp);
  let ok=false;
  try { await client.query(sql,params); ok=true; }
  catch (e) { if (!allowed.includes(e.code)) console.log('  SQLSTATE',e.code,'for',name); }
  await client.query('ROLLBACK TO SAVEPOINT '+sp);
  await client.query('RELEASE SAVEPOINT '+sp);
  const expected=allowed.length===0;
  if (ok===expected)checks++;else{bad++;console.log('  FAILED:',name,'expected',expected?'accepted':'refused');}
}
async function valid(lens,variant={}) {
  return JSON.stringify([{key:'o1',lens,observation:'Synthetic evidence-bound observation', evidenceRefs:[{sectionId:'synthetic-section',start:0,end:3}],doesNotEstablish:['Does not establish independent reality'], structureDependency:{kind:'independent'},...(lens==='themes'?{themeLabel:'Synthetic motif'}:{}),...variant}]);
}
(async()=>{let begun=false;try{
 await client.connect();
 await client.query('BEGIN');begun=true;
 const identity=await client.query('select current_database() db,current_user role,inet_server_port() port');
 console.log('Isolated transactional fixture:',identity.rows[0].db,'role='+identity.rows[0].role,'port='+identity.rows[0].port,'scratch='+scratch);
 await client.query('CREATE SCHEMA "'+scratch+'"');
 await client.query('SET LOCAL search_path TO "'+scratch+'", public');
 await client.query(`CREATE TABLE developmental_readings (
    commissioned_lens text NOT NULL,
    observations jsonb NOT NULL,
    CONSTRAINT developmental_readings_commissioned_lens_check
      CHECK (commissioned_lens IN ('structure','development','continuity','arc','themes','voice','coherence','reader'))
  )`);
 await client.query(installedFn);
 await client.query('CREATE TRIGGER developmental_readings_observations BEFORE INSERT ON developmental_readings FOR EACH ROW EXECUTE FUNCTION developmental_readings_observations_check()');
 const sql='INSERT INTO developmental_readings (commissioned_lens,observations) VALUES ($1,$2::jsonb)';
 const old=['structure','development','continuity','arc','themes','voice','coherence','reader'];
 for (const lens of old) await run('before: old '+lens,sql,[lens,await valid(lens)],[]);
 await run('before: overview refused',sql,['overview',await valid('overview')],['23514','P0001']);
 const before=await client.query('select count(*) as n from developmental_readings');
 if (+before.rows[0].n !== 0)throw Error('Fixture insert was not rolled back between tests');
 const fnPublicBefore=await client.query("select md5(pg_get_functiondef(p.oid)) hash from pg_proc p where p.pronamespace='public'::regnamespace and proname='developmental_readings_observations_check'");
 await client.query(migration);
 const fnPublicAfter=await client.query("select md5(pg_get_functiondef(p.oid)) hash from pg_proc p where p.pronamespace='public'::regnamespace and proname='developmental_readings_observations_check'");
 if (fnPublicBefore.rows[0]?.hash!==fnPublicAfter.rows[0]?.hash)throw Error('Public function changed: fixture boundary breach');
 for (const lens of old)await run('after: old '+lens,sql,[lens,await valid(lens)],[]);
 await run('after: overview',sql,['overview',await valid('overview')],[]);
 await run('after: themes missing label',sql,['themes',await valid('themes',{themeLabel:undefined})],['P0001']);
 await run('after: invalid foreign themeLabel',sql,['overview',await valid('overview',{themeLabel:'should refuse'})],['P0001']);
 await run('after: missing evidence',sql,['coherence',await valid('coherence',{evidenceRefs:[]})],['P0001']);
 await run('after: partial identity',sql,['overview',await valid('overview',{observationId:'dobs_test'})],['P0001']);
 await run('after: invalid position',sql,['coherence',await valid('coherence',{observationId:'dobs_test',admissionIndex:0,basisFingerprint:'f'.repeat(64),position:{sectionPosition:-1,codePointStart:0}})],['P0001']);
 const check=await client.query("select pg_get_constraintdef(c.oid) definition from pg_constraint c where c.conrelid='developmental_readings'::regclass and c.conname='developmental_readings_commissioned_lens_check'");
 if (!check.rows[0]?.definition.includes('overview'))throw Error('Overview constraint missing after SQL');
 console.log('SYNTHETIC RESULTS:',checks,'expected behaviors PASS;',bad,'FAIL');
 console.log('Production public function digest unchanged in transaction:',fnPublicAfter.rows[0]?.hash===fnPublicBefore.rows[0]?.hash);
 await client.query('ROLLBACK');begun=false;
 const res=await client.query('select count(*) AS count from pg_namespace where nspname=$1',[scratch]);
 if (+res.rows[0].count !== 0) throw Error('Scratch fixture still exists after ROLLBACK');
 console.log('NO PERSISTENCE: scratch schema and all fixture writes rolled back');
 if (bad)process.exitCode=1;
}catch(e){console.log('SAFE PROBE REFUSED/FAILED:',String(e.message).slice(0,350));process.exitCode=1;
}finally{if(begun)await client.query('ROLLBACK').catch(()=>{});await client.end().catch(()=>{});}})();
