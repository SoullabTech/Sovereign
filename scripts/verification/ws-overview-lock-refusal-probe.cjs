/**
 * Writers Studio Overview migration: PostgreSQL 16 synthetic lock-out / recovery proof.
 *
 * DISPOSABLE ONLY: requires 127.0.0.1:15432/postgres plus explicit fixture marker.
 * No production database, no real rows and no application source bytes touched.
 */
'use strict';
const fs = require('node:fs');
const { Client } = require('pg');
const url = process.env.DATABASE_URL;
const uri = new URL(url || '');
if (uri.hostname !== '127.0.0.1' || uri.port !== '15432' ||
    uri.pathname !== '/postgres' ||
    process.env.MAIA_OVERVIEW_DISPOSABLE_DB !== 'synthetic-pg16-only') {
  throw Error('REFUSED: synthetic lock fixture may reach only disposable local PostgreSQL 16');
}
const source = fs.readFileSync(process.argv[2], 'utf8');
if (!/^\s*--/.test(source) || !/BEGIN;\s*SET LOCAL lock_timeout = '5s';/.test(source)) {
  throw Error('REFUSED: exact migration header/lock-timeout contract changed');
}
const body = source.replace(/^(?:\s*--[^\n]*\n)+/, '').trim()
  .replace(/^BEGIN;\s*/,'').replace(/\s*COMMIT;$/,'');
if (/\b(COMMIT|ROLLBACK|BEGIN|SAVEPOINT)\s*;/i.test(body)) {
  throw Error('REFUSED: nested transaction command in migration');
}
const oldFn = fs.readFileSync(process.argv[3], 'utf8');
if (!/CREATE OR REPLACE FUNCTION (?:public\.)?developmental_readings_observations_check\(\)/i.test(oldFn)) {
  throw Error('REFUSED: exact old function not supplied');
}
const schema = 'ws_overview_lock_' + process.pid;
const q = '"' + schema + '"';
const admin = new Client({connectionString:url,connectionTimeoutMillis:4000});
const reader = new Client({connectionString:url,connectionTimeoutMillis:4000});
const migrator = new Client({connectionString:url,connectionTimeoutMillis:4000});
const oldLens = "CHECK (commissioned_lens IN ('structure','development','continuity','arc','themes','voice','coherence','reader'))";
async function metadata(){
 const r=await admin.query(`SELECT pg_get_constraintdef(c.oid) AS definition
 FROM pg_constraint c WHERE c.conrelid=$1::regclass
 AND c.conname='developmental_readings_commissioned_lens_check'`,[schema+'.developmental_readings']);
 return r.rows[0]?.definition||'';
}
(async()=>{let created=false;try{
 await Promise.all([admin.connect(),reader.connect(),migrator.connect()]);
 const v=await admin.query('SHOW server_version');
 if (!/^16\./.test(v.rows[0].server_version))throw Error('Refused non-PG16 disposable server');
 await admin.query('CREATE SCHEMA '+q);created=true;
 await admin.query('CREATE TABLE '+q+'.developmental_readings (commissioned_lens text NOT NULL, observations jsonb NOT NULL, CONSTRAINT developmental_readings_commissioned_lens_check '+oldLens+')');
 const fn = oldFn.replace(/CREATE OR REPLACE FUNCTION (?:public\.)?developmental_readings_observations_check\(\)/i, 'CREATE OR REPLACE FUNCTION '+q+'.developmental_readings_observations_check()');
 await admin.query(fn);
 await admin.query('CREATE TRIGGER developmental_readings_observations BEFORE INSERT ON '+q+'.developmental_readings FOR EACH ROW EXECUTE FUNCTION '+q+'.developmental_readings_observations_check()');
 const unchanged=await metadata();
 if (!unchanged.includes('structure')||unchanged.includes('overview'))throw Error('Original constraint invalid');
 await reader.query('BEGIN');
 await reader.query('SELECT count(*) FROM '+q+'.developmental_readings');
 await migrator.query('BEGIN');
 await migrator.query('SET LOCAL search_path TO '+q+', public');
 const t0=Date.now();
 let error=null;
 try{await migrator.query(body);}catch(e){error=e;}
 const elapsed=Date.now()-t0;
 if (!error || error.code!=='55P03' || elapsed<3500 || elapsed>9000) {
   throw Error('Expected SQLSTATE 55P03 lock timeout around 5 seconds; observed '+(error?.code||'success')+' elapsed='+elapsed+'ms');
 }
 await migrator.query('ROLLBACK');
 if ((await metadata())!==unchanged)throw Error('Migration changed constraint despite lock-timeout rollback');
 // Old-reader-valid input still behaves as it did under the held lock.
 await reader.query('COMMIT');
 await admin.query('INSERT INTO '+q+'.developmental_readings(commissioned_lens,observations) VALUES ($1,$2::jsonb)',
    ['coherence',JSON.stringify([{key:'o1',lens:'coherence',observation:'Synthetic proof',evidenceRefs:['synthetic'],doesNotEstablish:['Not proof of reality'],structureDependency:{kind:'independent'}}])]);
 console.log('PG16 lock timeout PASS: SQLSTATE 55P03 after '+elapsed+'ms; old constraint and reading writer preserved');
 // Recovery is explicit only once the blocker has completed.
 await migrator.query('BEGIN');
 await migrator.query('SET LOCAL search_path TO '+q+', public');
 await migrator.query(body);
 await migrator.query('COMMIT');
 const after=await metadata();
 if (!after.includes('overview'))throw Error('Overview not present after released lock');
 await admin.query('INSERT INTO '+q+'.developmental_readings(commissioned_lens,observations) VALUES ($1,$2::jsonb)',
    ['overview',JSON.stringify([{key:'o1',lens:'overview',observation:'Synthetic outline',evidenceRefs:['synthetic'],doesNotEstablish:['No interpretive authority'],structureDependency:{kind:'independent'}}])]);
 console.log('PG16 recovery PASS: migration applied with released lock; old reading and new Overview accepted');
 await admin.query('DROP SCHEMA '+q+' CASCADE');created=false;
 const remains=await admin.query('SELECT count(*) as n FROM pg_namespace WHERE nspname=$1',[schema]);
 if (+remains.rows[0].n!==0)throw Error('Scratch schema not removed');
 console.log('NO RESIDUAL FIXTURE: synthetic schema removed; disposable container can be destroyed');
}catch(e){console.error('LOCK FIXTURE FAILED:',String(e.message));process.exitCode=1;
}finally{
 if(created) await admin.query('DROP SCHEMA IF EXISTS '+q+' CASCADE').catch(()=>{});
 for(const c of [reader,migrator,admin])await c.end().catch(()=>{});
}})();
