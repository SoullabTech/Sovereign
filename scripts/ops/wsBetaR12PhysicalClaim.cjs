/**
 * R12 isolated PostgreSQL authority premise, NOT application integration.
 * Actual PG16 synthetic SQL proves FK alone allows foreign attach, verifies
 * reviewed same-owner transaction and serializes claim-vs-discard.
 * Zero production data, routes, secrets or external connections.
 */
'use strict';
const cp=require('node:child_process'),crypto=require('node:crypto'),fs=require('node:fs');
const name='ws-r12-claim-fict-pg-20261016',image='pgvector/pgvector:pg16';
const reportPath='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R12_PHYSICAL_CLAIM_20261016.json';
const a='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204',b='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const ma='4c0782ca-9074-43ee-9f3c-5f8500026780',mb='4c0782ca-9074-43ee-9f3c-5f8500026781';
const x='306902ed-21a9-4c01-aa15-984755598218';
const y='306902ed-21a9-4c01-aa15-984755598219';
const report={scope:'ISOLATED_NETWORKLESS_POSTGRESQL16_FICTIONAL_SQL_PREMISE_ONLY',
 publicBetaTouched:false,productionTouched:false,providerCalls:0,memberRowsRead:0,
 status:'HOLD',checks:[],cleanup:false};
function run(args,timeout=40000){
 const p=cp.spawnSync('docker',args,{encoding:'utf8',timeout,maxBuffer:2*1024*1024});
 if(p.error||p.status!==0) throw Error('FICTIONAL_DOCKER_FAILED '+args[0]+' '+String(p.stderr||'').slice(-180));
 return p.stdout.trim();
}
function assertYes(condition,label){if(!condition)throw Error('ASSERTION_FAILED '+label);report.checks.push(label);}
function sql(s){return run(['exec',name,'psql','-XAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres','-c',s]);}
function exists(){return cp.spawnSync('docker',['container','inspect',name],{stdio:'ignore',timeout:12000}).status===0;}
const base=`
CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,member_id uuid NOT NULL,source_custody text NOT NULL DEFAULT 'legacy_interpreted_import');
CREATE TABLE manuscript_source_arrivals(
 id uuid PRIMARY KEY,member_id uuid NOT NULL,manuscript_id uuid REFERENCES member_manuscripts(id),
 source_kind text NOT NULL,source_text text NOT NULL,source_text_hash text NOT NULL,
 artifact_ref text,artifact_hash text);
INSERT INTO member_manuscripts (id,member_id) VALUES ('${ma}','${a}'),('${mb}','${b}');
INSERT INTO manuscript_source_arrivals
 (id,member_id,source_kind,source_text,source_text_hash) VALUES
 ('${x}','${a}','member_supplied_text','fictional Source alpha','${crypto.createHash('sha256').update('fictional Source alpha').digest('hex')}'),
 ('${y}','${a}','member_supplied_text','fictional Source beta','${crypto.createHash('sha256').update('fictional Source beta').digest('hex')}');
`;
async function compete(){
 // First claimant locks Y, holds it, then claims it. Competing discard must not
 // remove the now claimed row once row lock is released.
 const first=`BEGIN;
 SELECT id FROM manuscript_source_arrivals WHERE id='${y}' AND member_id='${a}' AND manuscript_id IS NULL FOR UPDATE;
 SELECT pg_sleep(1.3);
 UPDATE manuscript_source_arrivals SET manuscript_id='${ma}' WHERE id='${y}' AND member_id='${a}' AND manuscript_id IS NULL;
 UPDATE member_manuscripts SET source_custody='source_custodied' WHERE id='${ma}' AND member_id='${a}';
 COMMIT;`;
 // A CTE deletes conditionally after PostgreSQL row-lock recheck.
 const discard=`BEGIN;
 WITH gone AS (DELETE FROM manuscript_source_arrivals WHERE id='${y}' AND member_id='${a}' AND manuscript_id IS NULL RETURNING id)
 SELECT 'competing_discard_count='||count(*) FROM gone;
 ROLLBACK;`;
 const firstProcess=cp.spawn('docker',['exec',name,'psql','-XAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres','-c',first],{stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';
 firstProcess.stdout.on('data',x=>stdout+=x.toString());firstProcess.stderr.on('data',x=>stderr+=x.toString());
 await new Promise(r=>setTimeout(r,275));
 const secondOutput=sql(discard);
 const code=await new Promise(resolve=>firstProcess.on('exit',resolve));
 assertYes(code===0,'first fictional claimant committed without SQL failure');
 assertYes(secondOutput.includes('competing_discard_count=0'),'competing discard blocked by row-lock and refused after claim');
 assertYes(sql(`SELECT manuscript_id::text FROM manuscript_source_arrivals WHERE id='${y}'`)===ma,
  'race winner preserved same-member Source ownership');
}
(async()=>{
 let created=false;
 try{
  assertYes(!exists(),'refuse to use pre-existing fixture container');
  run(['run','-d','--name',name,'--network','none','--memory','700m','--cpus','1',
   '--pids-limit','128','--security-opt','no-new-privileges',
   '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
   '--tmpfs','/tmp:rw,nosuid,size=64m','-e','POSTGRES_HOST_AUTH_METHOD=trust',
   '--label','life.soullab.scope=ws-r12-fictional',image],60000);created=true;
  for(let i=0;i<60;i++){
   if(cp.spawnSync('docker',['exec',name,'pg_isready','-U','postgres','-d','postgres'],{stdio:'ignore'}).status===0)break;
   await new Promise(r=>setTimeout(r,200));
  }
  const inspect=JSON.parse(run(['inspect',name]))[0];
  assertYes(inspect.HostConfig.NetworkMode==='none','PG fixture has no network');
  assertYes(Object.keys(inspect.HostConfig.PortBindings||{}).length===0,'PG fixture has no published ports');
  assertYes(inspect.Mounts.length===0,'PG fixture has no production or host bind mounts');
  sql(base);
  // Reproduce old vulnerability as transaction ROLLBACK, never persist foreign link.
  const bad=sql(`BEGIN; UPDATE manuscript_source_arrivals
   SET manuscript_id='${mb}' WHERE id='${x}' AND member_id='${a}' AND manuscript_id IS NULL;
   SELECT 'old_cross_member_fk_allowed='||(SELECT manuscript_id='${mb}' FROM manuscript_source_arrivals WHERE id='${x}');
   ROLLBACK;`);
  assertYes(bad.includes('old_cross_member_fk_allowed=true'),
   'negative control: original foreign key permits a cross-member manuscript link');
  assertYes(sql(`SELECT manuscript_id IS NULL FROM manuscript_source_arrivals WHERE id='${x}'`)==='t',
   'negative-control cross-member attachment rolled back');
  const refused=sql(`BEGIN; SELECT id FROM manuscript_source_arrivals
   WHERE id='${x}' AND member_id='${a}' AND manuscript_id IS NULL FOR UPDATE;
   SELECT 'foreign_destination_count='||count(*) FROM member_manuscripts WHERE id='${mb}' AND member_id='${a}';
   ROLLBACK;`);
  assertYes(refused.includes('foreign_destination_count=0'),'R12 same-member destination cannot be selected for foreign manuscript');
  const allowed=sql(`BEGIN;
   SELECT id FROM manuscript_source_arrivals WHERE id='${x}' AND member_id='${a}' AND manuscript_id IS NULL FOR UPDATE;
   SELECT id FROM member_manuscripts WHERE id='${ma}' AND member_id='${a}' FOR UPDATE;
   UPDATE manuscript_source_arrivals SET manuscript_id='${ma}' WHERE id='${x}' AND member_id='${a}' AND manuscript_id IS NULL;
   UPDATE member_manuscripts SET source_custody='source_custodied' WHERE id='${ma}' AND member_id='${a}';
   COMMIT;`);
  assertYes(sql(`SELECT manuscript_id::text FROM manuscript_source_arrivals WHERE id='${x}'`)===ma,
   'owned Source committed to owned manuscript');
  assertYes(sql(`SELECT source_custody FROM member_manuscripts WHERE id='${ma}'`)==='source_custodied',
   'same transaction marked destination custodied');
  // Hypothetical failure AFTER an arrival update must roll back the whole
  // transaction, not leave a Source attached without its destination.
  const failedStatus=sql(`BEGIN;
   UPDATE manuscript_source_arrivals SET manuscript_id='${ma}'
      WHERE id='${y}' AND member_id='${a}' AND manuscript_id IS NULL;
   UPDATE member_manuscripts SET source_custody='source_custodied'
      WHERE id='${ma}' AND member_id='${b}';
   ROLLBACK;`);
  assertYes(failedStatus.includes('UPDATE 0'),
   'negative control: the foreign-member status update affects zero rows');
  assertYes(sql(`SELECT manuscript_id IS NULL FROM manuscript_source_arrivals WHERE id='${y}'`)==='t',
   'real PostgreSQL rollback preserves pending Source after partial operation');
  await compete();
  report.status='PASS_FICTIONAL_SQL_ATOMICITY_NOT_LIVE_KEY_TRANSFER';
 }catch(e){report.status='HOLD_FIXTURE_FAILED';report.error=String(e.message||e).slice(0,400);process.exitCode=2;}
 finally{
  if(created){try{run(['rm','-f',name],30000);}catch(e){report.cleanupError=String(e).slice(0,100);}}
  report.cleanup=!exists();
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,
    cleanup:report.cleanup,report:reportPath,error:report.error||null},null,2));
 }
})().catch(e=>{console.error(String(e));process.exitCode=2});
