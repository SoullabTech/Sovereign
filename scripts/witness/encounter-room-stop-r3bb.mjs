#!/usr/bin/env node
/**
 * R3B-B isolated acceptance: real scoped modules/HTTP handlers/PostgreSQL;
 * fictional participants and injected fake transports. No .env, live media,
 * production database, real TURN credential, provider or retained member data.
 *
 * node scripts/witness/encounter-room-stop-r3bb.mjs --source-root /repo
 * Optional --candidate-root /review/postimages; --pg-bin /postgresql16/bin.
 */
import assert from 'node:assert/strict';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { promises as fs, readFileSync, existsSync, realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const args = process.argv.slice(2); const options = {};
for (let i = 0; i < args.length; i += 1) {
  const key = args[i];
  if (key === '--restart-read') { options.restartRead = true; continue; }
  if (!['--source-root', '--candidate-root', '--pg-bin'].includes(key) || !args[i + 1]) {
    throw new Error(`Unsupported or incomplete witness option: ${key}`);
  }
  if (Object.hasOwn(options, key)) throw new Error(`Duplicate witness option: ${key}`);
  options[key] = args[++i];
}
const sourceRoot = realpathSync(options['--source-root'] ?? process.cwd());
const candidateRoot = options['--candidate-root'] ? realpathSync(options['--candidate-root']) : null;
const pgBin = options['--pg-bin'] ?? '/opt/homebrew/opt/postgresql@16/bin';
const requireFromSource = createRequire(path.join(sourceRoot, 'package.json'));
const ts = requireFromSource('typescript'); const { Pool } = requireFromSource('pg');
const { NextRequest } = requireFromSource('next/server');
const candidatePaths = new Set([
  'lib/encounters/roomRuntime.ts', 'lib/encounters/roomWorkFence.ts',
  'lib/webrtc/roomClientLifecycle.ts', 'lib/webrtc/signalRelay.ts',
  ...['runtime', 'stop', 'signal', 'turn-credentials'].map(name =>
    `app/api/open/session-room/[roomId]/${name}/route.ts`),
]);
const allowedPaths = new Set([...candidatePaths,
  ...['roomStopContract','roomStopAuthority','roomStopStore','threshold','consentDecision'].map(name=>`lib/encounters/${name}.ts`),
  'lib/http/rateLimit.ts',
]);
const hashes = {}; const cache = new Map();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function sourceFile(relative) {
  const root = candidateRoot && candidatePaths.has(relative) ? candidateRoot : sourceRoot;
  const bytes = readFileSync(path.join(root, relative)); hashes[relative] = sha(bytes);
  return bytes.toString('utf8');
}
function load(relative) {
  if (!allowedPaths.has(relative)) throw new Error(`Witness refused unapproved module ${relative}`);
  if (cache.has(relative)) return cache.get(relative).exports;
  const filename = path.join(candidateRoot && candidatePaths.has(relative) ? candidateRoot : sourceRoot, relative);
  const compiled = ts.transpileModule(sourceFile(relative), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true},
  });
  assert.equal((compiled.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,relative);
  const entry = {exports:{}}; cache.set(relative,entry);
  const scopedRequire = id => {
    if (['crypto','node:crypto','next/server'].includes(id)) return requireFromSource(id);
    if (id.startsWith('@/')) return load(id.slice(2)+'.ts');
    if (id.startsWith('./') || id.startsWith('../')) return load(path.posix.normalize(path.posix.join(path.posix.dirname(relative), id))+'.ts');
    throw new Error(`Witness refused unexpected import ${id} in ${relative}`);
  };
  vm.runInThisContext(`(function(require,module,exports,__filename,__dirname){${compiled.outputText}\n})`,{filename})(
    scopedRequire,entry,entry.exports,filename,path.dirname(filename));
  return entry.exports;
}
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
const deferred = () => { let resolve,reject; const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject}; };
const context = encounterId => ({params:Promise.resolve({roomId:encounterId})});
const request = (encounterId, endpoint, method='GET', body, query={}) => {
  const url=new URL(`http://127.0.0.1/api/open/session-room/${encounterId}/${endpoint}`);
  for(const [key,value] of Object.entries(query))url.searchParams.set(key,String(value));
  return new NextRequest(url,{method,...(body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
};
function wrapDatabase(pool,intercept) {
  return {connect:async()=>{const client=await pool.connect();return {
    query:(sql,params)=>intercept(client,sql,params),release:()=>client.release(),
  };}};
}
function fakeBrowser({admit,persistStop,loadIce=async()=>[],capture,report,status}={}) {
  const events=[]; const callbacks={}; const localTrack={readyState:'live',stop(){this.readyState='ended';events.push('local_stop');}};
  const remoteTrack={readyState:'live',stop(){this.readyState='ended';events.push('remote_stop');}};
  const stream={getTracks:()=>[localTrack],getAudioTracks:()=>[localTrack]};
  const audio={srcObject:null,paused:true,play:async()=>{audio.paused=false;events.push('play');},pause:()=>{audio.paused=true;events.push('pause');}};
  let peer;
  const deps={admit,loadIce:async(...args)=>{events.push('ice');return loadIce(...args);},requestKey:`fictional-stop-${randomUUID()}`,capture:capture??(async()=>{events.push('capture');return stream;}),
    createPeer:()=>{events.push('peer');peer={connectionState:'new',iceConnectionState:'new',signalingState:'stable',
      addTrack:()=>{},getSenders:()=>[{track:localTrack}],getReceivers:()=>[{track:remoteTrack}],
      createOffer:async()=>({type:'offer',sdp:'fictional'}),createAnswer:async()=>({type:'answer',sdp:'fictional'}),
      setLocalDescription:async()=>{},setRemoteDescription:async()=>{},addIceCandidate:async()=>{},
      getStats:async()=>new Map(),close(){this.connectionState='closed';events.push('peer_close');},
      onicecandidate:null,ontrack:null,onconnectionstatechange:null};return peer;},audio:()=>audio,
    connectSignals:(_session,onMessage,onError)=>{callbacks.message=onMessage;callbacks.error=onError;events.push('signals');return {close:()=>events.push('signal_close')};},
    publish:async()=>{events.push('publish');},persistStop,report,status,
  };
  return {deps,events,callbacks,localTrack,remoteTrack,stream,audio,get peer(){return peer;}};
}

async function main() {
  const receipt = { schema: 'soullab.session-room.r3bb-witness.v1', status: 'FAIL',
    persistence: 'actual_disposable_postgresql', transports: 'simulated', participants: 'fictional',
    productionTouched: false, physicalMediaVerified: false, sourceRoot, candidateRoot,
    startedAt: new Date().toISOString(), cases: [], sourceSha256: hashes, cleanup: {} };
  let fixtureRoot; let server; let pool; let logHandle; const ownedClosers=[];
  const ownedPools=[];
  let stopping=false,ownedServerStopping=false,activeCase=null,shutdownPromise;
  const cancelled=Object.assign(new Error('Witness work cancelled for shutdown'),{code:'WITNESS_CANCELLED'});
  const assertRunning=()=>{if(stopping)throw cancelled;};
  const describeError=error=>({code:typeof error?.code==='string'?error.code:null,message:String(error?.message??error).slice(0,2000)});
  const endPool=record=>record.ending??=(async()=>{await record.raw.end();record.closed=true;})();
  function createOwnedPool(config,label){
    assertRunning();
    const raw=new Pool(config),record={raw,label,closed:false,ending:null};ownedPools.push(record);
    // pg emits idle-client errors on the pool rather than rejecting a query.
    // Only our own explicit server shutdown may classify 57P01 as expected.
    raw.on('error',error=>{
      const detail={pool:label,...describeError(error)};
      if(ownedServerStopping&&error?.code==='57P01'){
        (receipt.cleanup.expectedPoolShutdownEvents??=[]).push(detail);
      }else{
        (receipt.poolErrors??=[]).push(detail);
        if(stopping)receipt.cleanup.poolError=JSON.stringify(detail);
        requestShutdown(`Unexpected PostgreSQL pool error: ${JSON.stringify(detail)}`,1);
      }
    });
    // The facade keeps cancellation local to this owned fixture. It prevents
    // a resumed test or pending pool checkout from starting another query.
    return {
      async query(...args){assertRunning();return raw.query(...args);},
      async connect(){
        assertRunning();const client=await raw.connect();
        if(stopping){client.release();throw cancelled;}
        return {
          query(sql,...args){
            if(stopping&&!/^\s*ROLLBACK\s*;?\s*$/i.test(sql))return Promise.reject(cancelled);
            return client.query(sql,...args);
          },
          release:(...args)=>client.release(...args),
        };
      },
      end:()=>endPool(record),
    };
  }
  async function settledWithin(promise,ms){
    let timer;
    try{return await Promise.race([promise.then(()=>true,()=>true),new Promise(resolve=>{timer=setTimeout(()=>resolve(false),ms);})]);}
    finally{clearTimeout(timer);}
  }
  const fixtureSecret = `fictional-r3bb-witness-${randomUUID()}`;
  process.env.JWT_SECRET = fixtureSecret;
  process.env.NODE_ENV = 'test';
  const safeEnv = { PATH: '/usr/bin:/bin:/opt/homebrew/bin', LANG: 'C', LC_ALL: 'C' };
  const runTool = (tool, argv) => {
    const r = spawnSync(path.join(pgBin, tool), argv, { encoding: 'utf8', env: safeEnv, timeout: 30000 });
    if (r.error || r.status !== 0) throw new Error(`${tool} failed: ${(r.stderr ?? r.error?.message ?? '').slice(0,2000)}`);
    return r.stdout.trim();
  };
  let cleanupPromise;let emitted=false;
  const cleanup=()=>cleanupPromise??=(async()=>{
    stopping=true;
    // Stop scheduling first, and let the current case unwind through its own
    // rollback/release finally blocks before disposing shared resources.
    if(activeCase&&!await settledWithin(activeCase,2000))receipt.cleanup.workError='Active case did not settle within two seconds of cancellation';
    for(const close of ownedClosers.splice(0)){
      try{await close();}catch(error){receipt.cleanup.resourceError=String(error);}
    }
    // Track bootstrap and retired pools as well as the runtime pool. Give
    // released clients a short drain period, then stop only our owned server.
    const closing=Promise.all(ownedPools.map(async record=>{
      try{await endPool(record);}catch(error){receipt.cleanup.poolError=`${record.label}: ${String(error)}`;}
    })).then(()=>{receipt.cleanup.poolClosed=ownedPools.every(record=>record.closed);});
    await settledWithin(closing,1000);
    if(server){
      try{
        if(server.exitCode===null&&!server.signalCode){
          ownedServerStopping=true;
          runTool('pg_ctl',['-D',path.join(fixtureRoot,'data'),'-m','fast','-w','-t','20','stop']);
        }
        for(let i=0;i<100&&server.exitCode===null&&!server.signalCode;i+=1)await delay(20);
        receipt.cleanup.ownedPostgresqlStopped=server.exitCode!==null||Boolean(server.signalCode);
        assert.equal(receipt.cleanup.ownedPostgresqlStopped,true,'Owned server did not exit');
      }catch(error){receipt.cleanup.stopError=String(error);}
    }
    if(!await settledWithin(closing,5000))receipt.cleanup.poolError??='Pool closure exceeded five seconds after owned server shutdown';
    if(logHandle){try{await logHandle.close();}catch(error){receipt.cleanup.logError=String(error);}logHandle=null;}
    if(fixtureRoot&&(!server||receipt.cleanup.ownedPostgresqlStopped)){
      await fs.rm(fixtureRoot,{recursive:true,force:false});receipt.cleanup.fixtureRemoved=!existsSync(fixtureRoot);
    }
  })();
  const emitReceipt=()=>{
    if(emitted)return;emitted=true;
    receipt.passed=receipt.cases.filter(x=>x.status==='PASS').length;
    receipt.failed=receipt.cases.filter(x=>x.status==='FAIL').length;
    receipt.interrupted=receipt.cases.filter(x=>x.status==='INTERRUPTED').length;
    receipt.unreached=16-receipt.cases.length;
    receipt.cleanupComplete=Boolean(receipt.cleanup.poolClosed&&receipt.cleanup.ownedPostgresqlStopped&&receipt.cleanup.fixtureRemoved
      &&!Object.keys(receipt.cleanup).some(key=>/error$/i.test(key)));
    receipt.status=receipt.passed===16&&receipt.failed===0&&receipt.unreached===0&&receipt.cleanupComplete&&!receipt.fatalError?'PASS':'FAIL';
    receipt.finishedAt=new Date().toISOString();console.log(JSON.stringify(receipt));
    if(receipt.status!=='PASS')process.exitCode=1;
  };
  function requestShutdown(reason,exitCode){
    receipt.fatalError??=reason;
    if(shutdownPromise)return;
    stopping=true;clearTimeout(deadline);
    shutdownPromise=cleanup().catch(error=>{receipt.cleanup.error=String(error);}).finally(()=>{
      emitReceipt();process.exit(exitCode);
    });
  }
  const signalHandlers=new Map(['SIGINT','SIGTERM','SIGHUP'].map((signal)=>{
    const handler=()=>{
      requestShutdown(`Witness interrupted by ${signal}`,signal==='SIGINT'?130:signal==='SIGHUP'?129:143);
    };
    process.on(signal,handler);return [signal,handler];
  }));
  const deadline=setTimeout(()=>{
    requestShutdown('Witness exceeded its 120-second total runtime bound',1);
  },120000);
  async function runCase(number, title, test) {
    assertRunning();
    const started = Date.now();
    try {
      activeCase=Promise.resolve().then(()=>{assertRunning();return test();});
      const detail = await activeCase;assertRunning();
      const row = { number, title, status: 'PASS', milliseconds: Date.now() - started, ...detail };
      receipt.cases.push(row); console.log(JSON.stringify({ case: row }));
    } catch (error) {
      const wasCancelled=stopping&&(error===cancelled||error?.code==='WITNESS_CANCELLED');
      const row = { number, title, status: wasCancelled?'INTERRUPTED':'FAIL', milliseconds: Date.now() - started,
        ...(stopping?{shutdownInProgress:true}:{}),
        error: String(error?.stack ?? error).slice(0,5000) };
      receipt.cases.push(row); console.log(JSON.stringify({ case: row }));
      if(stopping)throw cancelled;
    }finally{activeCase=null;}
  }
  try {
    receipt.postgresqlVersion = runTool('postgres', ['--version']);
    assert.match(receipt.postgresqlVersion, /PostgreSQL\) 16\.15(?:\s|$)/);
    receipt.nodeVersion = process.version; receipt.typescriptVersion = ts.version;
    receipt.pgClientVersion = requireFromSource('pg/package.json').version;
    fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'r3bb-pg-'));
    await fs.chmod(fixtureRoot, 0o700);
    const data = path.join(fixtureRoot, 'data'); const socket = path.join(fixtureRoot, 'socket');
    await fs.mkdir(socket, { mode: 0o700 });
    runTool('initdb', ['-D', data, '--no-locale', '--encoding=UTF8', '--auth=trust', '--username=r3bb_fixture']);
    logHandle = await fs.open(path.join(fixtureRoot, 'postgres.log'), 'wx', 0o600);
    server = spawn(path.join(pgBin, 'postgres'), ['-D', data, '-k', socket, '-h', '', '-p', '5432',
      '-c', 'unix_socket_permissions=0700', '-c', 'fsync=on', '-c', 'max_connections=30'],
    { env: safeEnv, stdio: ['ignore', logHandle.fd, logHandle.fd] });
    console.log(JSON.stringify({fixtureStarted:{witnessPid:process.pid,postgresqlPid:server.pid,
      dataDirectory:data,socketDirectory:socket,startedAt:new Date().toISOString()}}));
    let launchError; server.on('error', (error) => { launchError = error; });
    let ready = false;
    for (let i = 0; i < 100; i += 1) {
      if (launchError || server.exitCode !== null) throw new Error(`Owned PostgreSQL failed to start: ${launchError?.message ?? server.exitCode}`);
      const r = spawnSync(path.join(pgBin, 'pg_isready'), ['-h', socket, '-p', '5432', '-U', 'r3bb_fixture'],
        { env: safeEnv, timeout: 2000, encoding: 'utf8' });
      if (r.status === 0) { ready = true; break; }
      await delay(100);
    }
    assert.equal(ready, true, 'Owned PostgreSQL startup timeout');
    const bootstrap = createOwnedPool({ host: socket, port: 5432, user: 'r3bb_fixture', database: 'postgres', max: 1 },'bootstrap');
    try { await bootstrap.query('CREATE DATABASE r3bb_fixture'); } finally { await bootstrap.end(); }
    const connection = { host: socket, port: 5432, user: 'r3bb_fixture', database: 'r3bb_fixture' };
    pool = createOwnedPool({ ...connection, max: 16, application_name: 'r3bb-fictional-witness',
      connectionTimeoutMillis: 5000, statement_timeout: 15000 },'migration');
    assert.equal((await pool.query('SHOW listen_addresses')).rows[0].listen_addresses, '');
    assert.equal((await pool.query('SELECT inet_server_addr() AS address')).rows[0].address, null);
    assert.equal((await pool.query('SHOW fsync')).rows[0].fsync, 'on');
    receipt.socketOnly = true; receipt.fsync = true;
    await pool.query('CREATE TABLE practitioners(id UUID PRIMARY KEY); CREATE TABLE studio_meetings(id UUID PRIMARY KEY); CREATE TABLE studio_people(id UUID PRIMARY KEY); CREATE TABLE members(id UUID PRIMARY KEY)');
    const migrations = [
      'database/migrations/20260629000001_encounters.sql',
      'database/migrations/20260705000001_encounter_streams_and_consent.sql',
      'database/migrations/20261027000002_exp21_encounter_consent_ledger.sql',
      'database/migrations/20261029000001_exp21_encounter_room_stop.sql',
    ];
    for (const migration of migrations) await pool.query(sourceFile(migration));
    await pool.query('CREATE TABLE r3bb_fixture_results(id UUID PRIMARY KEY, encounter_id UUID NOT NULL, participant_id UUID NOT NULL, marker TEXT NOT NULL)');
    receipt.appliedMigrations = migrations;
    await pool.query('CREATE ROLE r3bb_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE; GRANT USAGE ON SCHEMA public TO r3bb_runtime; GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO r3bb_runtime; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO r3bb_runtime');
    await pool.end(); connection.user='r3bb_runtime';
    pool = createOwnedPool({ ...connection, max:16, application_name:'r3bb-fictional-witness',
      connectionTimeoutMillis:5000, statement_timeout:15000 },'runtime');
    const runtimeRole=(await pool.query('SELECT rolsuper,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user')).rows[0];
    assert.deepEqual(runtimeRole,{rolsuper:false,rolcreatedb:false,rolcreaterole:false});
    receipt.runtimeRole='nonsuperuser_dml_fixture';
    const contract = load('lib/encounters/roomStopContract.ts');
    const authority = load('lib/encounters/roomStopAuthority.ts');
    const store = load('lib/encounters/roomStopStore.ts');
    const threshold = load('lib/encounters/threshold.ts');
    const consent = load('lib/encounters/consentDecision.ts');
    const runtime = load('lib/encounters/roomRuntime.ts');
    const fence = load('lib/encounters/roomWorkFence.ts');
    const lifecycle = load('lib/webrtc/roomClientLifecycle.ts');
    const relayModule = load('lib/webrtc/signalRelay.ts');
    const runtimeRoute = load('app/api/open/session-room/[roomId]/runtime/route.ts');
    const stopRoute = load('app/api/open/session-room/[roomId]/stop/route.ts');
    const signalRoute = load('app/api/open/session-room/[roomId]/signal/route.ts');
    const turnRoute = load('app/api/open/session-room/[roomId]/turn-credentials/route.ts');
    const practitioner = randomUUID(); await pool.query('INSERT INTO practitioners(id) VALUES($1)', [practitioner]);


    const credentialKey=Buffer.from(`fictional-r3bb-control-key:${randomUUID()}`);
    const serviceFor=(database=pool)=>runtime.createRoomRuntimeService({database,credentialKey,profile:'isolated-simulated'});
    const service=serviceFor(); const controllers=[]; const streams=[];
    const access=f=>({encounterId:f.scope.encounterId,runtimeCredential:f.session.runtimeCredential});
    const clientReceipt=view=>({stopRecorded:view.scopeStopped,operation:view.operation,coverage:view.coverage,
      physicalMediaVerified:false,receiptCredentials:view.reportCredentials});
    const appendConsent=async(f,action,purpose='join',database=pool)=>{
      const s=f.scope;
      const result=await database.query(`INSERT INTO encounter_consent_events
        (encounter_id,participant_id,actor_participant_id,kind,purpose,action,agreement_version,generation,decided_at,legacy_provenance,text_snapshot)
        VALUES($1,$2,$2,NULL,$3,$4,$5,$6,clock_timestamp(),FALSE,'Fictional R3B-B acceptance decision') RETURNING id`,
      [s.encounterId,s.participantId,purpose,action,s.agreementVersion,s.consentGeneration]);
      return result.rows[0].id;
    };
    const fixture=async(label,{join=true,encounterId,role='client'}={})=>{
      encounterId??=randomUUID();const participantId=randomUUID();
      if(!(await pool.query('SELECT id FROM encounters WHERE id=$1',[encounterId])).rows.length)
        await pool.query("INSERT INTO encounters(id,practitioner_id,title,status) VALUES($1,$2,$3,'active')",[encounterId,practitioner,`Fictional ${label}`]);
      await pool.query('INSERT INTO encounter_participants(id,encounter_id,display_name,role) VALUES($1,$2,$3,$4)',
        [participantId,encounterId,`Fictional ${label}`,role]);
      const f={scope:{encounterId,participantId,agreementVersion:'exp21-r3a-v1',consentGeneration:1}};
      f.token=threshold.mintThresholdToken(encounterId,participantId,f.scope.agreementVersion,1);
      if(join)f.admissionEventId=await appendConsent(f,'grant');
      return f;
    };
    const admitted=async(label,options)=>{
      const f=await fixture(label,options); f.session=await service.admit({encounterId:f.scope.encounterId,thresholdToken:f.token});return f;
    };
    const count=async(table,column,value)=>Number((await pool.query(`SELECT count(*) AS n FROM ${table} WHERE ${column}=$1`,[value])).rows[0].n);
    const stops=f=>count('encounter_room_stop_operations','participant_id',f.scope.participantId);
    const reports=op=>count('encounter_room_stop_acknowledgements','operation_id',op.operationId);
    const waitUntil=async(check,message)=>{
      for(let i=0;i<100;i++){assertRunning();if(await check())return;await delay(10);}throw new Error(message);
    };
    const waitForAdvisory=()=>waitUntil(async()=>Number((await pool.query(
      "SELECT count(*) AS n FROM pg_stat_activity WHERE application_name='r3bb-fictional-witness' AND wait_event_type='Lock' AND wait_event='advisory'"
    )).rows[0].n)>0,'Expected actual PostgreSQL advisory lock wait was not observed');
    const controllerFor=(f,overrides={})=>{
      assertRunning();
      const browser=fakeBrowser({admit:async()=>f.session,
        persistStop:async(_session,key)=>clientReceipt(await service.stop({...access(f),requestKey:key})),
        status:async()=>clientReceipt(await service.status(access(f))),...overrides});
      const controller=lifecycle.createRoomClientLifecycle(browser.deps);controllers.push(controller);ownedClosers.push(()=>controller.dispose());return {browser,controller};
    };


    const makeTimers=()=>{const pending=new Set();return {
      setInterval:(callback,ms)=>{assert.equal(ms,15000,'SSE heartbeat bound changed');pending.add(callback);return callback;},clearInterval:callback=>pending.delete(callback),
      async tick(){for(const callback of [...pending])await callback();await delay(0);},get size(){return pending.size;},
    };};
    const signFixture=(token,delta)=>{
      const decoded=JSON.parse(Buffer.from(token.split('.')[0],'base64url').toString('utf8'));
      const payload=Buffer.from(JSON.stringify({...decoded,...delta})).toString('base64url');
      return payload+'.'+createHmac('sha256',credentialKey).update(payload).digest('base64url');
    };
    const makeHandlers=(selected=service)=>{
      assertRunning();
      const relay=relayModule.createSignalRelay(),timers=makeTimers();
      const signal=runtime.createSignalHandlers({service:selected,relay,heartbeatMs:15000,timers});
      let mintCalls=0;
      const turn=runtime.createTurnHandlers({service:selected,mint:async session=>{mintCalls++;return {iceServers:[],ttl:300};}});
      return {runtime:runtime.createRuntimeHandlers(selected),stop:runtime.createStopHandlers(selected),signal,turn,relay,timers,get mintCalls(){return mintCalls;}};
    };
    const openStream=async(f,handlers)=>{
      assertRunning();
      const response=await handlers.signal.GET(request(f.scope.encounterId,'signal','GET',undefined,{runtimeCredential:f.session.runtimeCredential}),context(f.scope.encounterId));
      assert.equal(response.status,200);assert.ok(response.body);const reader=response.body.getReader();const chunks=[];
      const pumping=(async()=>{for(;;){const read=await reader.read();if(read.done)return;chunks.push(new TextDecoder().decode(read.value));}})();
      const close=async()=>{await reader.cancel();await pumping;};streams.push({cancel:close});ownedClosers.push(close);
      await waitUntil(()=>chunks.length>0,'initial SSE event missing');
      return {chunks,pumping,get text(){return chunks.join('');}};
    };


    await runCase(1,'Fresh admission before capture',async()=>{
      const missing=await fixture('no join',{join:false});const revoked=await fixture('revoked');await appendConsent(revoked,'revoke');
      const stopped=await admitted('already stopped');await service.stop({...access(stopped),requestKey:'already-stopped'});
      const expired=await fixture('expired');expired.token=threshold.mintThresholdToken(expired.scope.encounterId,expired.scope.participantId,expired.scope.agreementVersion,1,0);
      const stale=await fixture('stale');await pool.query('UPDATE encounters SET consent_generation=2 WHERE id=$1',[stale.scope.encounterId]);
      for(const f of [missing,revoked,stopped,expired,stale]){
        assertRunning();
        const browser=fakeBrowser({admit:()=>service.admit({encounterId:f.scope.encounterId,thresholdToken:f.token}),persistStop:async()=>{throw new Error('unexpected stop');}});
        const controller=lifecycle.createRoomClientLifecycle(browser.deps);controllers.push(controller);ownedClosers.push(()=>controller.dispose());await controller.start();
        assert.equal(controller.snapshot().phase,'refused');assert.deepEqual(browser.events.filter(e=>['ice','capture','peer','signals'].includes(e)),[]);
      }
      const valid=await fixture('valid but unavailable');
      const unavailable=serviceFor({connect:async()=>{throw new Error('fictional unavailable');}});
      const unavailableBrowser=fakeBrowser({admit:()=>unavailable.admit({encounterId:valid.scope.encounterId,thresholdToken:valid.token}),persistStop:async()=>{throw new Error('unexpected stop');}});
      const unavailableController=lifecycle.createRoomClientLifecycle(unavailableBrowser.deps);controllers.push(unavailableController);ownedClosers.push(()=>unavailableController.dispose());
      await unavailableController.start();assert.equal(unavailableController.snapshot().phase,'refused');
      assert.deepEqual(unavailableBrowser.events.filter(e=>['ice','capture','peer','signals'].includes(e)),[]);
      const admission=await makeHandlers().runtime.POST(request(valid.scope.encounterId,'runtime','POST',{thresholdToken:valid.token}),context(valid.scope.encounterId));
      assert.equal(admission.status,200);const accepted=await admission.json();
      assert.equal(accepted.scope.participantId,valid.scope.participantId);assert.ok(accepted.runtimeId&&accepted.peerId&&accepted.runtimeCredential);
      return {refusedProfiles:6,captureBeforeAdmission:0,identity:'server_issued'};
    });
    await runCase(2,'Authenticated signaling sender and server-event refusal',async()=>{

      const a=await admitted('sender A',{role:'practitioner'});const b=await admitted('receiver B',{encounterId:a.scope.encounterId});
      const handlers=makeHandlers();const seen=[];
      handlers.relay.subscribe(a.session,()=>{},async()=>{await service.current(access(a));return true;});
      handlers.relay.subscribe(b.session,message=>seen.push(message),async()=>{await service.current(access(b));return true;});
      ownedClosers.push(()=>{handlers.relay.closeScope(a.session.scope);handlers.relay.closeScope(b.session.scope);});
      await waitUntil(()=>seen.some(message=>message.type==='peer-present'),'initial membership missing');seen.length=0;
      for(const body of [
        {runtimeCredential:a.session.runtimeCredential,type:'answer',from:b.session.peerId,payload:{}},
        {runtimeCredential:a.session.runtimeCredential,type:'answer',peerId:b.session.peerId,payload:{}},
        {runtimeCredential:a.session.runtimeCredential,type:'ping',payload:{}},
        {runtimeCredential:a.session.runtimeCredential,type:'offer',to:'p_fictional_unknown',payload:{}},
      ]){
        const response=await handlers.signal.POST(request(a.scope.encounterId,'signal','POST',body),context(a.scope.encounterId));
        assert.ok(response.status>=400,`forged signal accepted with ${response.status}`);
      }
      assert.equal(seen.length,0);
      const response=await handlers.signal.POST(request(a.scope.encounterId,'signal','POST',{
        runtimeCredential:a.session.runtimeCredential,type:'answer',to:b.session.peerId,payload:{type:'answer',sdp:'fictional-answer'},
      }),context(a.scope.encounterId));assert.equal(response.status,200);
      await waitUntil(()=>seen.some(m=>m.type==='answer'),'authorized relay did not deliver');
      const delivered=seen.find(m=>m.type==='answer');assert.equal(delivered.from,a.session.peerId);
      assert.equal('runtimeCredential' in delivered,false);assert.equal('thresholdToken' in delivered,false);
      const turn=await handlers.turn.GET(request(a.scope.encounterId,'turn-credentials','GET',undefined,{runtimeCredential:a.session.runtimeCredential}),context(a.scope.encounterId));
      assert.equal(turn.status,200);assert.equal(handlers.mintCalls,1);
      await service.stop({...access(a),requestKey:'sender-stop'});
      const refused=await handlers.turn.GET(request(a.scope.encounterId,'turn-credentials','GET',undefined,{runtimeCredential:a.session.runtimeCredential}),context(a.scope.encounterId));
      assert.ok(refused.status>=400);assert.equal(handlers.mintCalls,1);
      return {forgedClientEvents:'refused',sender:'server_derived',credentialsRelayed:false,fixtureTurnMints:1,postStopMints:0};

    });
    await runCase(3,'Join leaves all other purposes and adapters closed',async()=>{
      const f=await admitted('purpose separation');
      const binding=(await pool.query('SELECT target_bindings FROM encounter_room_stop_bindings WHERE runtime_id=$1',[f.session.runtimeId])).rows[0].target_bindings;
      assert.deepEqual(Object.keys(binding).sort(),[...contract.ROOM_STOP_TARGETS].sort());
      assert.ok(Object.values(binding).every(b=>b.evidenceKind==='simulated'));
      const a=await service.participantAuthority(access(f));
      await assert.rejects(()=>fence.executeRoomWork({authority:a,purposes:['retain_summary'],statement:{
        text:'INSERT INTO r3bb_fixture_results(id,encounter_id,participant_id,marker) VALUES($1,$2,$3,$4)',
        values:[randomUUID(),f.scope.encounterId,f.scope.participantId,'unconsented'],
      }},pool),error=>error.code==='CONSENT_REFUSED');
      assert.equal(await count('r3bb_fixture_results','participant_id',f.scope.participantId),0);
      const view=await service.stop({...access(f),requestKey:'purpose-stop'});
      const noted=await service.reportNeverStarted(access(f));
      for(const target of ['recorder','captions','maia_inference','maia_playback'])assert.equal(noted.operation.targets[target],'not_started');
      for(const target of ['local_media','remote_media','signaling','late_work'])assert.equal(noted.operation.targets[target],'pending');
      assert.equal(await reports(view.operation),4);
      return {requiredTargets:8,otherPurposesGranted:0,trustedNeverStarted:4,activeTargetsStillPending:4};
    });
    await runCase(4,'Historically bound Stop remains available after join revoke',async()=>{
      const f=await admitted('stop after revoke');await appendConsent(f,'revoke');
      await assert.rejects(()=>service.current(access(f)),error=>error.code==='CONSENT_REFUSED');
      const response=await makeHandlers().stop.POST(request(f.scope.encounterId,'stop','POST',{runtimeCredential:f.session.runtimeCredential,requestKey:'after-revoke'}),context(f.scope.encounterId));
      assert.equal(response.status,200);const view=await response.json();
      assert.equal(view.scopeStopped,true);assert.equal(view.coverage,'origin_runtime');assert.equal(await stops(f),1);
      assert.equal(view.operation.scope.runtimeId,f.session.runtimeId);
      const other=await admitted('other actor');
      await assert.rejects(()=>service.stop({...access(f),runtimeCredential:other.session.runtimeCredential,requestKey:'other'}));
      assert.equal(await stops(other),0);return {joinRevoked:true,teardownCommitted:true,crossParticipant:'refused'};
    });
    await runCase(5,'Local teardown precedes uncertain HTTP confirmation',async()=>{
      const f=await admitted('local cleanup');const pending=deferred();
      const {browser,controller}=controllerFor(f,{persistStop:()=>pending.promise});
      await controller.start();browser.peer.ontrack({track:browser.remoteTrack,streams:[{getTracks:()=>[browser.remoteTrack]}]});await delay(0);
      const stopping=controller.stop();
      assert.equal(browser.localTrack.readyState,'ended');assert.equal(browser.remoteTrack.readyState,'ended');
      assert.equal(browser.peer.connectionState,'closed');assert.equal(browser.audio.srcObject,null);assert.equal(browser.audio.paused,true);
      assert.equal(controller.snapshot().durableStop,'pending');
      pending.reject(Object.assign(new Error('fictional lost response'),{code:'COMMIT_OUTCOME_UNKNOWN'}));await stopping;
      assert.equal(controller.snapshot().durableStop,'unknown');assert.equal(controller.snapshot().physicalMediaVerified,false);
      return {localCleanupBeforeResponse:true,durableConfirmation:'unknown',physicalMediaVerified:false};
    });
    await runCase(6,'Real COMMIT response loss reconciles idempotently',async()=>{
      const f=await admitted('commit uncertainty');let lost=false;
      const database={connect:async()=>{const c=await pool.connect();let wroteStop=false;return {
        query:async(sql,values)=>{const result=await c.query(sql,values);if(/INSERT INTO encounter_room_stop_operations/.test(sql))wroteStop=true;
          if(/^COMMIT$/i.test(sql.trim())&&wroteStop&&!lost){lost=true;throw new Error('fictional committed response lost');}return result;},release:()=>c.release(),
      };}};
      const uncertain=serviceFor(database);
      await assert.rejects(()=>uncertain.stop({...access(f),requestKey:'lost-response'}),error=>error.code==='COMMIT_OUTCOME_UNKNOWN');
      assert.equal(lost,true);assert.equal(await stops(f),1);
      const original=(await pool.query('SELECT id FROM encounter_room_stop_operations WHERE participant_id=$1',[f.scope.participantId])).rows[0].id;
      const retry=await service.stop({...access(f),requestKey:'lost-response'});assert.equal(retry.operationId,original);assert.equal(await stops(f),1);
      await assert.rejects(()=>service.stop({...access(f),requestKey:'different-request'}));
      return {realCommit:true,response:'injected_lost',reconciledOperation:original,durableOperations:1};
    });
    await runCase(7,'Open streams recheck Stop, revoke, expiry, room end and unavailable authority',async()=>{

      const outcomes=[];
      for(const reason of ['stop','revoke','expiry','room_end','database_unavailable']){
        const f=await admitted(`stream ${reason}`);let unavailable=false;
        const db=wrapDatabase(pool,(c,sql,params)=>{if(unavailable)throw new Error('fictional DB outage');return c.query(sql,params);});
        const selected=serviceFor(db);const handlers=makeHandlers(selected);
        const fForStream=reason==='expiry'?{...f,session:{...f.session,runtimeCredential:signFixture(f.session.runtimeCredential,{expiresAt:Date.now()+1000})}}:f;
        const open=await openStream(fForStream,handlers);assert.equal(handlers.relay.size(f.scope.encounterId),1);
        if(reason==='stop')await service.stop({...access(f),requestKey:'stream-stop'});
        else if(reason==='revoke')await appendConsent(f,'revoke');
        else if(reason==='expiry')await delay(1050);
        else if(reason==='room_end')await pool.query("UPDATE encounters SET status='complete' WHERE id=$1",[f.scope.encounterId]);
        else unavailable=true;
        const previousPings=(open.text.match(/"type":"ping"/g)||[]).length;
        await handlers.timers.tick();await waitUntil(()=>handlers.relay.size(f.scope.encounterId)===0,`stream did not close on ${reason}`);
        await open.pumping;assert.equal(handlers.timers.size,0);
        assert.equal((open.text.match(/"type":"ping"/g)||[]).length,previousPings);
        outcomes.push(reason);unavailable=false;
      }
      return {closedOn:outcomes,heartbeatBoundMs:15000,unauthorizedRenewalPings:0,actualMediaInferred:false};

    });
    await runCase(8,'A separate application process observes durable Stop',async()=>{
      const f=await admitted('separate process');const view=await service.stop({...access(f),requestKey:'child-stop'});
      const argv=[scriptPath,'--source-root',sourceRoot,'--restart-read'];if(candidateRoot)argv.push('--candidate-root',candidateRoot);
      assertRunning();
      const child=spawnSync(process.execPath,argv,{input:JSON.stringify({connection,fictionalSecret:fixtureSecret,
        credentialKey:credentialKey.toString('utf8'),access:access(f),operationId:view.operationId,stopGeneration:view.stopGeneration}),
        encoding:'utf8',env:safeEnv,timeout:15000});
      assert.equal(child.status,0,child.stderr);const observation=JSON.parse(child.stdout.trim());
      assert.equal(observation.status,'PASS');assert.notEqual(observation.pid,process.pid);assert.equal(observation.operationId,view.operationId);
      return {freshApplicationProcess:true,childPid:observation.pid,postgresqlRestarted:false,multiInstanceTransportQualified:false};
    });
    await runCase(9,'Control-channel loss tears down and cannot auto-rejoin',async()=>{
      const f=await admitted('control loss');const {browser,controller}=controllerFor(f);await controller.start();
      browser.callbacks.error();await controller.stop('control_lost');
      assert.equal(controller.snapshot().phase,'stopped');assert.equal(browser.localTrack.readyState,'ended');assert.equal(browser.peer.connectionState,'closed');
      assert.equal(browser.events.filter(x=>x==='signals').length,1);
      await assert.rejects(()=>controller.start());await assert.rejects(()=>service.admit({encounterId:f.scope.encounterId,thresholdToken:f.token}));
      return {mediaDisposed:true,connectionAttempts:1,rejoinAfterStop:'refused'};
    });
    await runCase(10,'Late asynchronous capture, TURN, SDP and playback cannot resurrect',async()=>{
      const captureFixture=await admitted('late capture');const captureReady=deferred(),capturePending=deferred();
      const first=controllerFor(captureFixture,{capture:()=>{captureReady.resolve();return capturePending.promise;}});
      const starting=first.controller.start();await captureReady.promise;await first.controller.stop();
      assert.equal(first.controller.snapshot().localTeardown,'pending');capturePending.resolve(first.browser.stream);await starting;
      assert.equal(first.browser.localTrack.readyState,'ended');assert.equal(first.browser.events.includes('peer'),false);
      assert.equal(first.controller.snapshot().localTeardown,'stopped');
      const turnFixture=await admitted('late TURN');const turnReady=deferred(),turnPending=deferred();
      const second=controllerFor(turnFixture,{loadIce:()=>{turnReady.resolve();return turnPending.promise;}});
      const turnStart=second.controller.start();await turnReady.promise;await second.controller.stop();turnPending.resolve([]);await turnStart;
      assert.equal(second.browser.events.includes('capture'),false);
      const sdpFixture=await admitted('late SDP');const third=controllerFor(sdpFixture);await third.controller.start();
      const sdpReady=deferred(),sdpPending=deferred();third.browser.peer.setRemoteDescription=()=>{sdpReady.resolve();return sdpPending.promise;};
      const receiving=third.controller.receive({type:'offer',from:'fictional-peer',payload:{type:'offer',sdp:'fictional'}});
      await sdpReady.promise;await third.controller.stop();sdpPending.resolve();await receiving;
      assert.equal(third.browser.events.includes('publish'),false);
      const playFixture=await admitted('late playback');const fourth=controllerFor(playFixture);await fourth.controller.start();
      const playReady=deferred(),playPending=deferred();
      fourth.browser.audio.play=()=>{playReady.resolve();return playPending.promise.then(()=>{fourth.browser.audio.paused=false;});};
      fourth.browser.peer.ontrack({track:fourth.browser.remoteTrack,streams:[{getTracks:()=>[fourth.browser.remoteTrack]}]});
      await playReady.promise;await fourth.controller.stop();playPending.resolve();await waitUntil(()=>fourth.controller.snapshot().remoteTeardown!=='pending','late playback did not settle');
      assert.equal(fourth.browser.audio.paused,true);assert.equal(fourth.browser.audio.srcObject,null);
      const receiverFixture=await admitted('late receiver');const fifth=controllerFor(receiverFixture);await fifth.controller.start();
      const lateReceiver=fifth.browser.peer.ontrack;await fifth.controller.stop();
      const lateTrack={readyState:'live',stop(){this.readyState='ended';}};
      lateReceiver({track:lateTrack,streams:[{getTracks:()=>[lateTrack]}]});
      assert.equal(lateTrack.readyState,'ended');assert.equal(fifth.browser.audio.srcObject,null);
      await fifth.controller.receive({type:'connected'});assert.equal(fifth.controller.snapshot().phase,'stopped');
      for(const {controller} of [first,second,third,fourth])assert.equal(controller.snapshot().phase,'stopped');
      return {lateCapture:'disposed',lateTurn:'no_capture',lateSdp:'no_publish',latePlayback:'detached',lateReceiver:'disposed',lateConnection:'ignored',resurrection:false};
    });
    await runCase(11,'Actual SQL final-write races against Stop and purpose revoke',async()=>{
      const statement=(f,marker)=>({text:'INSERT INTO r3bb_fixture_results(id,encounter_id,participant_id,marker) VALUES($1,$2,$3,$4) RETURNING id',
        values:[randomUUID(),f.scope.encounterId,f.scope.participantId,marker]});
      const permitted=await admitted('permitted SQL');await appendConsent(permitted,'grant','retain_summary');
      const permittedAuthority=await service.participantAuthority(access(permitted));
      const first=await fence.executeRoomWork({authority:permittedAuthority,purposes:['retain_summary'],statement:statement(permitted,'permitted')},pool);
      assert.equal(first.rows.length,1);
      for(const kind of ['stop','revoke']){
        const f=await admitted(`SQL race ${kind}`);await appendConsent(f,'grant','retain_summary');const a=await service.participantAuthority(access(f));
        const barrier=await pool.connect();let writing;let stopWork;let reached;let release;
        try{
          if(kind==='revoke'){
            await barrier.query('BEGIN');await appendConsent(f,'revoke','retain_summary',barrier);
          }else{
            reached=deferred();release=deferred();
            const paused=serviceFor(wrapDatabase(pool,async(c,sql,params)=>{const result=await c.query(sql,params);
              if(/INSERT INTO encounter_room_stop_operations/.test(sql)){reached.resolve();await release.promise;}return result;}));
            stopWork=paused.stop({...access(f),requestKey:'fence-race'});await Promise.race([reached.promise,stopWork.then(()=>{throw new Error('Stop passed the intended barrier');})]);
          }
          writing=fence.executeRoomWork({authority:a,purposes:['retain_summary'],statement:statement(f,'must-not-persist')},pool)
            .then(value=>({accepted:true,value}),error=>({accepted:false,code:error.code}));
          await waitForAdvisory();
          if(kind==='revoke')await barrier.query('COMMIT');else {release.resolve();await stopWork;}
          const result=await writing;assert.equal(result.accepted,false);assert.equal(result.code,kind==='stop'?'ROOM_STOPPED':'CONSENT_REFUSED');
          assert.equal(await count('r3bb_fixture_results','participant_id',f.scope.participantId),0);
        }finally{release?.resolve();await barrier.query('ROLLBACK');barrier.release();if(stopWork)await Promise.allSettled([stopWork]);if(writing)await writing;}
      }
      return {permittedWrites:1,observedAdvisoryWaits:2,postStopWrites:0,postRevokeWrites:0,scope:'same_transaction_SQL_only'};
    });
    await runCase(12,'Exact target credentials reject substitution and preserve retry evidence',async()=>{
      const f=await admitted('attributed reports');const view=await service.stop({...access(f),requestKey:'report-stop'});
      const credential=view.reportCredentials.local_media;
      for(const change of [{target:'remote_media'},{operationId:randomUUID()},{credential:'fictional-forged'},
        {runtimeCredential:(await admitted('foreign report')).session.runtimeCredential},
        {credential:signFixture(credential,{stopGeneration:view.stopGeneration+1})},
        {credential:signFixture(credential,{principalId:'fictional-wrong-principal'})},
        {credential:signFixture(credential,{adapterRuntimeId:'fictional-wrong-incarnation'})},
        {credential:signFixture(credential,{evidenceKind:'server_component'})}]){
        await assert.rejects(()=>service.report({...access(f),operationId:view.operationId,target:'local_media',credential,state:'stopped',...change}));
      }
      assert.equal(await reports(view.operation),0);
      const response=await makeHandlers().stop.PATCH(request(f.scope.encounterId,'stop','PATCH',{runtimeCredential:f.session.runtimeCredential,operationId:view.operationId,target:'local_media',credential,state:'stopped'}),context(f.scope.encounterId));
      assert.equal(response.status,200);const first=await response.json();
      const second=await service.report({...access(f),operationId:view.operationId,target:'local_media',credential,state:'stopped'});
      assert.equal(second.operation.acknowledgedAt.local_media,first.operation.acknowledgedAt.local_media);assert.equal(await reports(view.operation),1);
      await assert.rejects(()=>service.report({...access(f),operationId:view.operationId,target:'local_media',credential,state:'failed'}));
      return {crossTargetAndOperation:'refused',forgedAndForeign:'refused',duplicateRows:0,originalTimestampRetained:true};
    });
    await runCase(13,'Missing, failed and trusted never-started reports remain distinct',async()=>{
      const f=await admitted('incomplete reports');let view=await service.stop({...access(f),requestKey:'incomplete-stop'});
      view=await service.report({...access(f),operationId:view.operationId,target:'local_media',credential:view.reportCredentials.local_media,state:'failed'});
      view=await service.reportNeverStarted(access(f));
      const summary=contract.summarizeRoomStop(view.operation);
      assert.equal(summary.status,'failed');assert.ok(summary.failed.includes('local_media'));assert.ok(summary.pending.includes('remote_media'));
      assert.equal(summary.notStarted.length,4);assert.equal(summary.physicalMediaVerified,false);
      return {failed:['local_media'],pending:summary.pending,trustedNeverStarted:summary.notStarted,silencePromotedToSuccess:false};
    });
    await runCase(14,'Two runtimes close one scope without borrowing report identity',async()=>{
      const f=await admitted('two runtimes');const session2=await service.admit({encounterId:f.scope.encounterId,thresholdToken:f.token});
      const secondFixture={...f,session:session2};const first=controllerFor(f),second=controllerFor(secondFixture);
      await first.controller.start();await second.controller.start();await first.controller.stop();
      const view=await service.status(access(secondFixture));assert.equal(view.scopeStopped,true);assert.equal(view.coverage,'other_runtime');
      assert.equal(view.operation,null);assert.deepEqual(view.reportCredentials,{});
      await second.controller.receive({type:'room-stopped'});assert.equal(second.controller.snapshot().phase,'stopped');
      assert.equal(first.browser.localTrack.readyState,'ended');assert.equal(second.browser.localTrack.readyState,'ended');
      await assert.rejects(()=>service.current(access(f)));await assert.rejects(()=>service.current(access(secondFixture)));
      const origin=await service.status(access(f));
      await assert.rejects(()=>service.report({...access(secondFixture),operationId:origin.operationId,target:'local_media',credential:origin.reportCredentials.local_media,state:'stopped'}));
      assert.equal(await stops(f),1);assert.equal(origin.operation.scope.runtimeId,f.session.runtimeId);
      return {boundRuntimes:2,bothMockPathsClosed:true,durableOperation:1,detailedCoverage:'origin_runtime_only',allDevicesVerified:false};
    });
    await runCase(15,'Complete simulated reports never become physical-media proof',async()=>{
      const f=await admitted('complete reports');const {browser,controller}=controllerFor(f);
      await controller.start();browser.peer.ontrack({track:browser.remoteTrack,streams:[{getTracks:()=>[browser.remoteTrack]}]});await delay(0);
      const handlers=makeHandlers(),stream=await openStream(f,handlers);
      const writeAuthority=await service.participantAuthority(access(f));
      await controller.stop();let view=await service.status(access(f));
      assert.equal(controller.snapshot().durableStop,'confirmed');
      assert.equal(browser.localTrack.readyState,'ended');assert.equal(browser.remoteTrack.readyState,'ended');
      assert.equal(browser.peer.connectionState,'closed');assert.equal(browser.audio.srcObject,null);assert.equal(browser.audio.paused,true);
      assert.ok(browser.events.includes('signal_close'));
      await handlers.timers.tick();await waitUntil(()=>handlers.relay.size(f.scope.encounterId)===0,'reported signaling was still subscribed');
      await stream.pumping;assert.equal(handlers.timers.size,0);
      await assert.rejects(()=>handlers.relay.publish(f.session,{type:'peer-leave'}));
      // Drain an actual synthetic write attempt for this exact runtime before
      // its job owner reports completion; the earlier authority is not a permit.
      await assert.rejects(()=>fence.executeRoomWork({authority:writeAuthority,purposes:['retain_summary'],statement:{
        text:'INSERT INTO r3bb_fixture_results(id,encounter_id,participant_id,marker) VALUES($1,$2,$3,$4)',
        values:[randomUUID(),f.scope.encounterId,f.scope.participantId,'must-not-persist-after-stop'],
      }},pool),error=>error.code==='ROOM_STOPPED');
      assert.equal(await count('r3bb_fixture_results','participant_id',f.scope.participantId),0);
      for(const target of ['local_media','remote_media'])view=await service.report({...access(f),operationId:view.operationId,target,credential:view.reportCredentials[target],state:'stopped'});
      view=await service.reportOwned({...access(f),target:'signaling',state:'stopped'});
      view=await service.reportOwned({...access(f),target:'late_work',state:'stopped'});view=await service.reportNeverStarted(access(f));
      const summary=contract.summarizeRoomStop(view.operation);assert.equal(summary.status,'acknowledged');assert.equal(summary.physicalMediaVerified,false);
      assert.equal(view.physicalMediaVerified,false);assert.ok(Object.values(view.operation.targetBindings).every(x=>x.evidenceKind==='simulated'));
      return {summary:'acknowledged',evidence:'simulated',physicalMediaVerified:false,coverage:'origin_runtime',
        localAndRemoteMockCleanupObserved:true,signalingSubscriptionAndTimerClosed:true,sameRuntimeFinalWriteRefused:true};
    });
    await runCase(16,'Default closed boundary, retained history and owned cleanup prerequisites',async()=>{

      const heldRoom=randomUUID();
      for(const [response,label] of [
        [await runtimeRoute.POST(request(heldRoom,'runtime','POST',{thresholdToken:'fictional',profile:'isolated-simulated'}),context(heldRoom)),'request-selected profile'],
        [await runtimeRoute.POST(request(heldRoom,'runtime','POST',{thresholdToken:'fictional'}),context(heldRoom)),'runtime'],
        [await signalRoute.GET(request(heldRoom,'signal','GET',undefined,{runtimeCredential:'fictional'}),context(heldRoom)),'signal'],
        [await turnRoute.GET(request(heldRoom,'turn-credentials','GET',undefined,{runtimeCredential:'fictional'}),context(heldRoom)),'TURN'],
        [await stopRoute.POST(request(heldRoom,'stop','POST',{runtimeCredential:'fictional',requestKey:'held'}),context(heldRoom)),'Stop'],
      ])assert.ok(response.status>=400,`default ${label} unexpectedly enabled`);

      const closed=runtime.createRoomRuntimeService();await assert.rejects(()=>closed.admit({encounterId:randomUUID(),thresholdToken:'fictional'}));
      const f=await admitted('retained history');const original=f.admissionEventId;
      await appendConsent(f,'revoke');await assert.rejects(()=>appendConsent(f,'grant'));
      assert.equal(await count('encounter_consent_events','id',original),1);
      await assert.rejects(()=>pool.query('UPDATE encounter_consent_events SET text_snapshot=$1 WHERE id=$2',['fictional rewrite',original]));
      await assert.rejects(()=>pool.query('TRUNCATE encounter_consent_events CASCADE'));
      const view=await service.stop({...access(f),requestKey:'retained-stop'});
      await assert.rejects(()=>pool.query('DELETE FROM encounter_room_stop_operations WHERE id=$1',[view.operationId]));
      for(const controller of controllers)controller.dispose();for(const stream of streams)await stream.cancel();
      return {defaultRuntime:'closed',acceptedConsentHistory:'preserved',stopHistory:'append_only',realDevices:0,realTurnConnections:0,providerCalls:0,
        fullApplicationBuild:false,fullBrowserJourney:false,cleanup:'must_pass_after_all_cases'};
    });

  } catch(error) { receipt.fatalError??=String(error?.stack??error).slice(0,6000); }
  finally {
    clearTimeout(deadline);
    try{await cleanup();}catch(error){receipt.cleanup.error=String(error);}
    for(const [signal,handler] of signalHandlers)process.removeListener(signal,handler);
    emitReceipt();
  }
}


async function restartRead() {
  let input='';for await(const chunk of process.stdin)input+=chunk;const fixture=JSON.parse(input);const c=fixture.connection;
  assert.deepEqual(Object.keys(c).sort(),['database','host','port','user']);
  assert.equal(c.database,'r3bb_fixture');assert.equal(c.user,'r3bb_runtime');assert.equal(c.port,5432);
  assert.equal(path.basename(c.host),'socket');assert.ok(path.isAbsolute(c.host)&&path.basename(path.dirname(c.host)).startsWith('r3bb-pg-'));
  for(const directory of [path.dirname(c.host),c.host]){const stat=await fs.lstat(directory);assert.equal(stat.isDirectory(),true);
    assert.equal(stat.isSymbolicLink(),false);assert.equal(stat.uid,process.getuid());assert.equal(stat.mode&0o077,0);}
  assert.match(fixture.fictionalSecret,/^fictional-r3bb-witness-/);assert.match(fixture.credentialKey,/^fictional-r3bb-control-key:/);
  process.env.JWT_SECRET=fixture.fictionalSecret;process.env.NODE_ENV='test';
  const pool=new Pool({host:c.host,port:5432,user:'r3bb_runtime',database:'r3bb_fixture',max:2,
    application_name:'r3bb-fictional-restart',connectionTimeoutMillis:5000,statement_timeout:10000});
  try{
    const runtime=load('lib/encounters/roomRuntime.ts');load('lib/webrtc/signalRelay.ts');
    const service=runtime.createRoomRuntimeService({database:pool,credentialKey:Buffer.from(fixture.credentialKey),profile:'isolated-simulated'});
    const view=await service.status(fixture.access);assert.equal(view.scopeStopped,true);assert.equal(view.operationId,fixture.operationId);
    assert.equal(view.stopGeneration,fixture.stopGeneration);await assert.rejects(()=>service.current(fixture.access));
    console.log(JSON.stringify({status:'PASS',pid:process.pid,operationId:view.operationId,stopGeneration:view.stopGeneration,
      physicalMediaVerified:false,freshRelayProcess:true}));
  }finally{await pool.end();}
}

if(options.restartRead)await restartRead();else await main();
