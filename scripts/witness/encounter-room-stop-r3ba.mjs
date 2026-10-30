#!/usr/bin/env node
/**
 * R3B-A fictional persistence witness. This starts only its own disposable,
 * Unix-socket-only PostgreSQL 16 cluster and runs the real scoped application
 * modules and migration bytes. Every participant and transport is simulated.
 * No .env, application database URL, live adapter, media or provider is loaded.
 *
 * Usage: node scripts/witness/encounter-room-stop-r3ba.mjs --source-root /repo
 * Optional --candidate-root /review/postimages selects an unapplied exact patch.
 * Optional --pg-bin /path/to/postgresql16/bin selects the native fixture tools.
 */
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { promises as fs, readFileSync, existsSync, realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const args = process.argv.slice(2);
const options = {};
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
const ts = requireFromSource('typescript');
const { Pool } = requireFromSource('pg');
const moduleNames = new Set(['roomStopContract', 'roomStopAuthority', 'roomStopStore', 'threshold', 'consentDecision']);
const candidateModules = new Set(['roomStopContract', 'roomStopAuthority', 'roomStopStore']);
const hashes = {};
const cache = new Map();
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
function sourceFile(relative, candidate = false) {
  const selected = candidate && candidateRoot ? candidateRoot : sourceRoot;
  const filename = path.join(selected, relative);
  const bytes = readFileSync(filename);
  hashes[relative] = sha(bytes);
  return bytes.toString('utf8');
}
function loadModule(name) {
  if (!moduleNames.has(name)) throw new Error(`Unapproved module: ${name}`);
  if (cache.has(name)) return cache.get(name).exports;
  const relative = `lib/encounters/${name}.ts`;
  const filename = path.join(candidateModules.has(name) && candidateRoot ? candidateRoot : sourceRoot, relative);
  const compiled = ts.transpileModule(sourceFile(relative, candidateModules.has(name)), {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    reportDiagnostics: true,
  });
  const errors = (compiled.diagnostics ?? []).filter((x) => x.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, `Transpilation errors in ${relative}`);
  const entry = { exports: {} }; cache.set(name, entry);
  const scopedRequire = (id) => {
    if (id === 'crypto' || id === 'node:crypto') return requireFromSource(id);
    if (id.startsWith('./') && moduleNames.has(id.slice(2))) return loadModule(id.slice(2));
    throw new Error(`Witness refused unexpected runtime import ${id} in ${relative}`);
  };
  vm.runInThisContext(`(function(require,module,exports,__filename,__dirname){${compiled.outputText}\n})`, {
    filename,
  })(scopedRequire, entry, entry.exports, filename, path.dirname(filename));
  return entry.exports;
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const scopedInput = (f) => ({ thresholdToken: f.token, encounterId: f.scope.encounterId, runtimeId: f.scope.runtimeId });
const lookup = (database, store) => ({ lookupRuntimeBinding: (input) => store.loadRoomRuntimeBinding(input, database) });

async function restartRead() {
  let input = ''; for await (const chunk of process.stdin) input += chunk;
  const fixture = JSON.parse(input);
  const c = fixture.connection;
  assert.deepEqual(Object.keys(c).sort(),['database','host','port','user']);
  assert.equal(c.database, 'r3ba_fixture'); assert.equal(c.user, 'r3ba_runtime');
  assert.equal(c.port, 5432); assert.equal(path.basename(c.host), 'socket');
  assert.ok(path.isAbsolute(c.host) && path.basename(path.dirname(c.host)).startsWith('r3ba-pg-'));
  for(const directory of [path.dirname(c.host),c.host]){
    const stat=await fs.lstat(directory);
    assert.equal(stat.isDirectory(),true);assert.equal(stat.isSymbolicLink(),false);
    assert.equal(stat.uid,process.getuid());assert.equal(stat.mode & 0o077,0);
  }
  assert.match(fixture.fictionalSecret, /^fictional-r3ba-witness-/);
  process.env.JWT_SECRET = fixture.fictionalSecret;
  const authority = loadModule('roomStopAuthority'); const store = loadModule('roomStopStore');
  const pool = new Pool({ host:c.host,port:5432,user:'r3ba_runtime',database:'r3ba_fixture',
    max:2,application_name:'r3ba-fictional-restart',connectionTimeoutMillis:5000,statement_timeout:10000 });
  try {
    const verified = await authority.authorizeParticipantStop(scopedInput(fixture), lookup(pool, store));
    assert.equal(verified.ok, true);
    const operation = await store.readRoomStop(verified.authority, fixture.operationId, pool);
    assert.equal(operation.operationId, fixture.operationId);
    assert.equal(operation.stopGeneration, fixture.stopGeneration);
    const gate = await store.decideStoredLateRoomWork(verified.authority, pool);
    assert.equal(gate.allowed, false); assert.equal(gate.reason, 'stop_recorded');
    console.log(JSON.stringify({ status: 'PASS', pid: process.pid, operationId: operation.operationId,
      stopGeneration: operation.stopGeneration, lateWork: gate.reason, physicalMediaVerified: false }));
  } finally { await pool.end(); }
}

async function main() {
  const receipt = { schema: 'soullab.session-room.r3ba-witness.v1', status: 'FAIL',
    persistence: 'actual_disposable_postgresql', transports: 'simulated', participants: 'fictional',
    productionTouched: false, physicalMediaVerified: false, sourceRoot, candidateRoot,
    startedAt: new Date().toISOString(), cases: [], sourceSha256: hashes, cleanup: {} };
  let fixtureRoot; let server; let pool; let logHandle;
  const fixtureSecret = `fictional-r3ba-witness-${randomUUID()}`;
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
    // Initiate pool closure before stopping our server. A signal can arrive with
    // a checked-out client, so do not wait indefinitely before stopping it.
    const closing=pool?pool.end().then(()=>{receipt.cleanup.poolClosed=true;},error=>{
      receipt.cleanup.poolError=String(error);
    }):Promise.resolve();
    if(server){
      try{
        if(server.exitCode===null&&!server.signalCode){
          runTool('pg_ctl',['-D',path.join(fixtureRoot,'data'),'-m','fast','-w','-t','20','stop']);
        }
        for(let i=0;i<100&&server.exitCode===null&&!server.signalCode;i+=1)await delay(20);
        receipt.cleanup.ownedPostgresqlStopped=server.exitCode!==null||Boolean(server.signalCode);
        assert.equal(receipt.cleanup.ownedPostgresqlStopped,true,'Owned server did not exit');
      }catch(error){receipt.cleanup.stopError=String(error);}
    }
    let timer;
    await Promise.race([closing,new Promise(resolve=>{timer=setTimeout(()=>{
      receipt.cleanup.poolError??='Pool closure exceeded five seconds';resolve();
    },5000);})]);clearTimeout(timer);
    if(logHandle){await logHandle.close();logHandle=null;}
    if(fixtureRoot&&(!server||receipt.cleanup.ownedPostgresqlStopped)){
      await fs.rm(fixtureRoot,{recursive:true,force:false});receipt.cleanup.fixtureRemoved=!existsSync(fixtureRoot);
    }
  })();
  const emitReceipt=()=>{
    if(emitted)return;emitted=true;
    receipt.passed=receipt.cases.filter(x=>x.status==='PASS').length;
    receipt.failed=receipt.cases.filter(x=>x.status==='FAIL').length;
    receipt.unreached=12-receipt.cases.length;
    receipt.cleanupComplete=Boolean(receipt.cleanup.poolClosed&&receipt.cleanup.ownedPostgresqlStopped&&receipt.cleanup.fixtureRemoved);
    receipt.status=receipt.passed===12&&receipt.failed===0&&receipt.unreached===0&&receipt.cleanupComplete&&!receipt.fatalError?'PASS':'FAIL';
    receipt.finishedAt=new Date().toISOString();console.log(JSON.stringify(receipt));
    if(receipt.status!=='PASS')process.exitCode=1;
  };
  const signalHandlers=new Map(['SIGINT','SIGTERM','SIGHUP'].map((signal)=>{
    const handler=()=>{
      receipt.fatalError=`Witness interrupted by ${signal}`;
      cleanup().catch(error=>{receipt.cleanup.error=String(error);}).finally(()=>{
        emitReceipt();process.exit(signal==='SIGINT'?130:signal==='SIGHUP'?129:143);
      });
    };
    process.once(signal,handler);return [signal,handler];
  }));
  const deadline=setTimeout(()=>{
    receipt.fatalError='Witness exceeded its 120-second total runtime bound';
    cleanup().catch(error=>{receipt.cleanup.error=String(error);}).finally(()=>{emitReceipt();process.exit(1);});
  },120000);
  async function runCase(number, title, test) {
    const started = Date.now();
    try {
      const detail = await test();
      const row = { number, title, status: 'PASS', milliseconds: Date.now() - started, ...detail };
      receipt.cases.push(row); console.log(JSON.stringify({ case: row }));
    } catch (error) {
      const row = { number, title, status: 'FAIL', milliseconds: Date.now() - started,
        error: String(error?.stack ?? error).slice(0,5000) };
      receipt.cases.push(row); console.log(JSON.stringify({ case: row }));
    }
  }
  try {
    receipt.postgresqlVersion = runTool('postgres', ['--version']);
    assert.match(receipt.postgresqlVersion, /PostgreSQL\) 16\./);
    receipt.nodeVersion = process.version; receipt.typescriptVersion = ts.version;
    receipt.pgClientVersion = requireFromSource('pg/package.json').version;
    fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'r3ba-pg-'));
    await fs.chmod(fixtureRoot, 0o700);
    const data = path.join(fixtureRoot, 'data'); const socket = path.join(fixtureRoot, 'socket');
    await fs.mkdir(socket, { mode: 0o700 });
    runTool('initdb', ['-D', data, '--no-locale', '--encoding=UTF8', '--auth=trust', '--username=r3ba_fixture']);
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
      const r = spawnSync(path.join(pgBin, 'pg_isready'), ['-h', socket, '-p', '5432', '-U', 'r3ba_fixture'],
        { env: safeEnv, timeout: 2000, encoding: 'utf8' });
      if (r.status === 0) { ready = true; break; }
      await delay(100);
    }
    assert.equal(ready, true, 'Owned PostgreSQL startup timeout');
    const bootstrap = new Pool({ host: socket, port: 5432, user: 'r3ba_fixture', database: 'postgres', max: 1 });
    try { await bootstrap.query('CREATE DATABASE r3ba_fixture'); } finally { await bootstrap.end(); }
    const connection = { host: socket, port: 5432, user: 'r3ba_fixture', database: 'r3ba_fixture' };
    pool = new Pool({ ...connection, max: 16, application_name: 'r3ba-fictional-witness',
      connectionTimeoutMillis: 5000, statement_timeout: 15000 });
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
    for (const migration of migrations) await pool.query(sourceFile(migration, migration === migrations[3]));
    receipt.appliedMigrations = migrations;
    await pool.query('CREATE ROLE r3ba_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE; GRANT USAGE ON SCHEMA public TO r3ba_runtime; GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO r3ba_runtime; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO r3ba_runtime');
    await pool.end(); connection.user='r3ba_runtime';
    pool = new Pool({ ...connection, max:16, application_name:'r3ba-fictional-witness',
      connectionTimeoutMillis:5000, statement_timeout:15000 });
    const runtimeRole=(await pool.query('SELECT rolsuper,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user')).rows[0];
    assert.deepEqual(runtimeRole,{rolsuper:false,rolcreatedb:false,rolcreaterole:false});
    receipt.runtimeRole='nonsuperuser_dml_fixture';
    const contract = loadModule('roomStopContract'); const authority = loadModule('roomStopAuthority');
    const store = loadModule('roomStopStore'); const threshold = loadModule('threshold');
    const consent = loadModule('consentDecision');
    const practitioner = randomUUID(); await pool.query('INSERT INTO practitioners(id) VALUES($1)', [practitioner]);
    const verifiedAuthority = async (f, database = pool) => {
      const r = await authority.authorizeParticipantStop(scopedInput(f), lookup(database, store));
      assert.equal(r.ok, true, r.reason); return r.authority;
    };
    const appendConsent = async (f, action, purpose = 'join', database = pool) => {
      const s = f.scope;
      const result = await database.query(`INSERT INTO encounter_consent_events
        (encounter_id,participant_id,actor_participant_id,kind,purpose,action,agreement_version,generation,decided_at,legacy_provenance,text_snapshot)
        VALUES($1,$2,$2,NULL,$3,$4,$5,$6,clock_timestamp(),FALSE,'Fictional R3B-A witness decision') RETURNING id`,
      [s.encounterId,s.participantId,purpose,action,s.agreementVersion,s.consentGeneration]);
      return result.rows[0].id;
    };
    const insertBinding = async (f, database = pool) => database.query(`INSERT INTO encounter_room_stop_bindings
      (encounter_id,participant_id,agreement_version,consent_generation,runtime_id,admission_event_id,target_bindings)
      VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [f.scope.encounterId,f.scope.participantId,f.scope.agreementVersion,f.scope.consentGeneration,
      f.scope.runtimeId,f.admissionEventId,JSON.stringify(f.targetBindings)]);
    const fixture = async (label, evidence = {}) => {
      const encounterId = randomUUID(); const participantId = randomUUID();
      await pool.query("INSERT INTO encounters(id,practitioner_id,title,status) VALUES($1,$2,$3,'active')", [encounterId,practitioner,`Fictional ${label}`]);
      await pool.query("INSERT INTO encounter_participants(id,encounter_id,display_name,role) VALUES($1,$2,'Fictional Cedar','client')", [participantId,encounterId]);
      const f = { scope: { encounterId,participantId,agreementVersion:'exp21-r3a-v1',consentGeneration:1,runtimeId:randomUUID() } };
      f.targetBindings = Object.fromEntries(contract.ROOM_STOP_TARGETS.map((target) => [target, {
        principalId:`fictional-${target}-${participantId}`,adapterRuntimeId:randomUUID(),evidenceKind:evidence[target] ?? 'simulated',
      }]));
      f.admissionEventId = await appendConsent(f, 'grant'); await insertBinding(f);
      f.token = threshold.mintThresholdToken(encounterId,participantId,f.scope.agreementVersion,1);
      f.authority = await verifiedAuthority(f); return f;
    };
    const count = async (table, column, value) => Number((await pool.query(`SELECT count(*) AS n FROM ${table} WHERE ${column}=$1`, [value])).rows[0].n);
    const stopCount = (f) => count('encounter_room_stop_operations','participant_id',f.scope.participantId);
    const ackCount = (op) => count('encounter_room_stop_acknowledgements','operation_id',op.operationId);
    const currentConsent = async (f, purpose = 'join') => {
      const s = f.scope;
      const rows = (await pool.query(`SELECT id,action,actor_participant_id,EXTRACT(EPOCH FROM decided_at)*1000 AS at
        FROM encounter_consent_events WHERE encounter_id=$1 AND participant_id=$2 AND purpose=$3
        AND agreement_version=$4 AND generation=$5 AND legacy_provenance=FALSE`,
      [s.encounterId,s.participantId,purpose,s.agreementVersion,s.consentGeneration])).rows;
      const scope = { encounterId:s.encounterId,participantId:s.participantId,purpose,agreementVersion:s.agreementVersion,generation:s.consentGeneration };
      return consent.decideEncounterConsent(rows.map((r) => ({ ...scope,eventId:r.id,action:r.action,actorParticipantId:r.actor_participant_id,createdAt:Number(r.at) })), scope);
    };
    const principal = (op, target) => ({ scope:op.scope,operationId:op.operationId,stopGeneration:op.stopGeneration,target,...op.targetBindings[target] });
    const credentials = new Map();
    const issueFixtureCredential = (value) => { const key = Object.freeze({ fixture: randomUUID() }); credentials.set(key,value); return key; };
    const subsystemDeps = { authenticateSubsystem: async (credential) => credentials.get(credential) ?? null };
    const ackAuthority = async (op, target) => {
      const r = await authority.authorizeSubsystemAcknowledgement({ operation:op,target,credential:issueFixtureCredential(principal(op,target)) },subsystemDeps);
      assert.equal(r.ok,true,r.reason); return r.authority;
    };
    const wrapDatabase = (intercept) => ({ connect: async () => {
      const client = await pool.connect();
      return { query: (sql,params) => intercept(client,sql,params), release: () => client.release() };
    } });
    const waitForAdvisory = async () => {
      for(let i=0;i<100;i+=1) {
        const r=await pool.query("SELECT count(*) AS n FROM pg_stat_activity WHERE application_name='r3ba-fictional-witness' AND wait_event_type='Lock' AND wait_event='advisory'");
        if(Number(r.rows[0].n)>0)return;
        await delay(20);
      }
      throw new Error('Expected real PostgreSQL advisory-lock wait was not observed');
    };

    await runCase(1,'Verified actor, permitted target and teardown after revoke',async()=>{
      const f=await fixture('case 1'); await appendConsent(f,'revoke');
      assert.equal((await currentConsent(f)).reason,'revoked');
      const a=await verifiedAuthority(f); const op=await store.requestRoomStop(a,'case-1-stop',pool);
      assert.deepEqual(op.scope,f.scope); assert.equal(op.requestedByParticipantId,f.scope.participantId);
      assert.equal(op.reason,'participant_withdrawal'); assert.equal(await stopCount(f),1);
      return { consent:'revoked',teardown:'durable',requiredTargets:contract.ROOM_STOP_TARGETS.length };
    });
    await runCase(2,'Forged actor, peer, role and subsystem refused without writes',async()=>{
      const f=await fixture('case 2');
      for(const extra of [{participantId:randomUUID()},{peerId:randomUUID()},{role:'steward'}]) {
        assert.equal((await authority.authorizeParticipantStop({...scopedInput(f),...extra},lookup(pool,store))).ok,false);
      }
      for(const reason of ['room_ended','steward_emergency','system_failure']) {
        assert.equal((await authority.authorizeParticipantStop({...scopedInput(f),reason},lookup(pool,store))).ok,false);
      }
      const forged=f.token.slice(0,-1)+(f.token.endsWith('a')?'b':'a');
      assert.equal((await authority.authorizeParticipantStop({...scopedInput(f),thresholdToken:forged},lookup(pool,store))).ok,false);
      const expired=threshold.mintThresholdToken(f.scope.encounterId,f.scope.participantId,f.scope.agreementVersion,1,0);
      assert.equal((await authority.authorizeParticipantStop({...scopedInput(f),thresholdToken:expired},lookup(pool,store))).ok,false);
      await assert.rejects(()=>store.requestRoomStop({...f.authority},'forged-authority',pool));
      assert.equal(await stopCount(f),0);
      const op=await store.requestRoomStop(f.authority,'case-2-stop',pool);
      const r=await authority.authorizeSubsystemAcknowledgement({operation:op,target:'signaling',credential:principal(op,'signaling')},subsystemDeps);
      assert.equal(r.ok,false); await assert.rejects(()=>store.acknowledgeStoredRoomStop(principal(op,'signaling'),'stopped',pool));
      assert.equal(await ackCount(op),0); return { forgedAuthoritiesAccepted:0,unauthorizedAcknowledgements:0 };
    });
    await runCase(3,'Composite Encounter, participant, runtime and operation isolation',async()=>{
      const a=await fixture('case 3 A'); const b=await fixture('case 3 B');
      for(const input of [{...scopedInput(a),encounterId:b.scope.encounterId},{...scopedInput(a),runtimeId:b.scope.runtimeId},
        {...scopedInput(a),thresholdToken:b.token}]) {
        assert.equal((await authority.authorizeParticipantStop(input,lookup(pool,store))).ok,false);
      }
      await assert.rejects(()=>insertBinding({...a,scope:{...a.scope,encounterId:b.scope.encounterId,runtimeId:randomUUID()}}));
      const op=await store.requestRoomStop(a.authority,'case-3-stop',pool);
      const other=await store.readRoomStop(b.authority,op.operationId,pool); assert.equal(other,null);
      assert.equal(await stopCount(a),1); assert.equal(await stopCount(b),0); return {crossScopeReads:'refused',crossScopeInsert:'refused'};
    });
    await runCase(4,'Concurrent equivalent Stop requests are durable and idempotent',async()=>{
      const f=await fixture('case 4');
      const all=await Promise.all(Array.from({length:8},()=>store.requestRoomStop(f.authority,'same-request',pool)));
      assert.equal(new Set(all.map(x=>x.operationId)).size,1); assert.equal(new Set(all.map(x=>x.stopGeneration)).size,1);
      assert.equal(await stopCount(f),1);
      await assert.rejects(()=>store.requestRoomStop(f.authority,'conflicting-request',pool),error=>error.code==='STOP_REQUEST_CONFLICT');
      assert.equal((await store.decideStoredLateRoomWork(f.authority,pool)).reason,'stop_recorded');
      return {concurrentRequests:8,durableOperations:1,stopGeneration:all[0].stopGeneration};
    });
    await runCase(5,'Persistence failure and lost COMMIT response remain explicit',async()=>{
      const f=await fixture('case 5');
      const unavailable={connect:async()=>{throw new Error('fictional unavailable database');}};
      await assert.rejects(()=>store.requestRoomStop(f.authority,'connect-failure',unavailable));
      assert.equal((await authority.authorizeParticipantStop(scopedInput(f),lookup(unavailable,store))).ok,false);
      const beforeInsert=wrapDatabase(async(client,sql,params)=>{
        if(/INSERT INTO encounter_room_stop_operations/.test(sql))throw new Error('fictional precommit failure');
        return client.query(sql,params);
      });
      await assert.rejects(()=>store.requestRoomStop(f.authority,'before-insert',beforeInsert)); assert.equal(await stopCount(f),0);
      let lost=false;
      const lostResponse=wrapDatabase(async(client,sql,params)=>{
        const result=await client.query(sql,params);
        if(sql.trim().toUpperCase()==='COMMIT'&&!lost){lost=true;throw new Error('fictional committed response lost');}
        return result;
      });
      await assert.rejects(()=>store.requestRoomStop(f.authority,'lost-response',lostResponse),error=>error.code==='COMMIT_OUTCOME_UNKNOWN');
      assert.equal(await stopCount(f),1);
      const op=await store.requestRoomStop(f.authority,'lost-response',pool); assert.equal(await stopCount(f),1);
      const a=await ackAuthority(op,'signaling');
      const ackFailure=wrapDatabase(async(client,sql,params)=>{
        if(/INSERT INTO encounter_room_stop_acknowledgements/.test(sql))throw new Error('fictional ack persistence failure');
        return client.query(sql,params);
      });
      await assert.rejects(()=>store.acknowledgeStoredRoomStop(a,'stopped',ackFailure)); assert.equal(await ackCount(op),0);
      return {precommitFailure:'rolled_back',commitResponse:'unknown_then_reconciled',durableOperations:1,failedAckAccepted:false};
    });
    await runCase(6,'A separate application process reads the durable Stop',async()=>{
      const f=await fixture('case 6'); const op=await store.requestRoomStop(f.authority,'case-6-stop',pool);
      const argv=[scriptPath,'--source-root',sourceRoot,'--restart-read'];
      if(candidateRoot)argv.push('--candidate-root',candidateRoot);
      const r=spawnSync(process.execPath,argv,{input:JSON.stringify({connection,fictionalSecret:fixtureSecret,
        token:f.token,scope:f.scope,operationId:op.operationId,stopGeneration:op.stopGeneration}),
        encoding:'utf8',env:safeEnv,timeout:15000});
      assert.equal(r.status,0,r.stderr); const child=JSON.parse(r.stdout.trim());
      assert.equal(child.status,'PASS'); assert.notEqual(child.pid,process.pid); assert.equal(child.operationId,op.operationId);
      return {freshApplicationProcess:true,childPid:child.pid,postgresqlRestarted:false,staleBackupRecoveryQualified:false};
    });
    await runCase(7,'Stop/work ordering and late completion refusal',async()=>{
      const f=await fixture('case 7'); const before=await store.decideStoredLateRoomWork(f.authority,pool);
      assert.equal(before.allowed,false); assert.equal(before.reason,'consent_recheck_required');
      assert.equal((await currentConsent(f)).allowed,true);
      let reached;const atInsert=new Promise(resolve=>{reached=resolve;});
      let release;const continueCommit=new Promise(resolve=>{release=resolve;});
      const paused=wrapDatabase(async(client,sql,params)=>{
        const result=await client.query(sql,params);
        if(/INSERT INTO encounter_room_stop_operations/.test(sql)){reached();await continueCommit;}
        return result;
      });
      const stopping=store.requestRoomStop(f.authority,'case-7-stop',paused);
      let gating;let waitObserved=false;let orderingError;
      try {
        await Promise.race([atInsert,stopping.then(()=>{throw new Error('Stop completed before pause');})]);
        gating=store.decideStoredLateRoomWork(f.authority,pool);
        await waitForAdvisory();waitObserved=true;
      }catch(error){orderingError=error;}finally{release();}
      const settled=await Promise.allSettled([stopping,gating]);
      if(orderingError)throw orderingError;
      for(const result of settled)if(result.status==='rejected')throw result.reason;
      const op=settled[0].value;const after=settled[1].value;
      assert.equal(waitObserved,true);assert.equal(after.allowed,false);assert.equal(after.reason,'stop_recorded');
      assert.equal(contract.decideLateRoomWork(op,f.scope,op.stopGeneration).allowed,false);
      let simulatedPersistenceCalls=0;if(after.allowed)simulatedPersistenceCalls+=1;
      assert.equal(simulatedPersistenceCalls,0);
      return {actualAdvisoryWait:true,ordering:'participant transaction lock; committed Stop precedes later gate',
        simulatedLatePersistenceCalls:0,previouslyAdmittedWork:'requires separate cancellation acknowledgement'};
    });
    await runCase(8,'Only the exact bound subsystem can acknowledge its target',async()=>{
      const f=await fixture('case 8');const op=await store.requestRoomStop(f.authority,'case-8-stop',pool);
      const credential=issueFixtureCredential(principal(op,'signaling'));
      assert.equal((await authority.authorizeSubsystemAcknowledgement({operation:op,target:'recorder',credential},subsystemDeps)).ok,false);
      const a=await ackAuthority(op,'signaling');const next=await store.acknowledgeStoredRoomStop(a,'stopped',pool);
      assert.equal(next.targets.signaling,'stopped');assert.equal(next.targets.recorder,'pending');assert.equal(await ackCount(op),1);
      return {acceptedTarget:'signaling',otherTargetsPending:7};
    });
    await runCase(9,'Stale, future, forged, replayed and conflicting acknowledgements',async()=>{
      const f=await fixture('case 9');const op=await store.requestRoomStop(f.authority,'case-9-stop',pool);
      const base=principal(op,'local_media');
      const changes=[{operationId:randomUUID()},{stopGeneration:op.stopGeneration+1},{stopGeneration:0},
        {principalId:'fictional-wrong-principal'},{adapterRuntimeId:randomUUID()},{evidenceKind:'client_report'},
        {scope:{...op.scope,runtimeId:randomUUID()}},{scope:{...op.scope,participantId:randomUUID()}}];
      for(const delta of changes){
        const r=await authority.authorizeSubsystemAcknowledgement({operation:op,target:'local_media',credential:issueFixtureCredential({...base,...delta})},subsystemDeps);
        assert.equal(r.ok,false);
      }
      await assert.rejects(()=>pool.query(`INSERT INTO encounter_room_stop_acknowledgements
        (operation_id,encounter_id,participant_id,agreement_version,consent_generation,runtime_id,
         stop_generation,target,principal_id,adapter_runtime_id,evidence_kind,state)
        VALUES($1,$2,$3,$4,$5,$6,$7,'local_media','fictional-forged-principal',$8,$9,'stopped')`,
      [op.operationId,op.scope.encounterId,op.scope.participantId,op.scope.agreementVersion,
        op.scope.consentGeneration,op.scope.runtimeId,op.stopGeneration,
        base.adapterRuntimeId,base.evidenceKind]));
      assert.equal(await ackCount(op),0);
      const a=await ackAuthority(op,'local_media');await assert.rejects(()=>store.acknowledgeStoredRoomStop({...a},'stopped',pool));
      const first=await store.acknowledgeStoredRoomStop(a,'stopped',pool);
      const second=await store.acknowledgeStoredRoomStop(a,'stopped',pool);
      assert.equal(second.acknowledgedAt.local_media,first.acknowledgedAt.local_media);assert.equal(await ackCount(op),1);
      await assert.rejects(()=>store.acknowledgeStoredRoomStop(a,'not_started',pool),error=>error.code==='ACKNOWLEDGEMENT_CONFLICT');
      assert.equal((await store.readRoomStop(f.authority,op.operationId,pool)).targets.local_media,'stopped');
      return {invalidIdentitiesRefused:changes.length,duplicateRows:0,conflictingTerminalChange:'refused'};
    });
    await runCase(10,'Partial, failed, missing and trusted never-started outcomes',async()=>{
      const f=await fixture('case 10');let op=await store.requestRoomStop(f.authority,'case-10-stop',pool);
      assert.equal(contract.summarizeRoomStop(op).pending.length,8);
      op=await store.acknowledgeStoredRoomStop(await ackAuthority(op,'signaling'),'stopped',pool);
      op=await store.acknowledgeStoredRoomStop(await ackAuthority(op,'recorder'),'failed',pool);
      op=await store.acknowledgeStoredRoomStop(await ackAuthority(op,'captions'),'not_started',pool);
      const summary=contract.summarizeRoomStop(op);assert.equal(summary.status,'failed');assert.equal(summary.pending.length,5);
      assert.deepEqual(summary.failed,['recorder']);assert.deepEqual(summary.notStarted,['captions']);
      const reread=await store.readRoomStop(f.authority,op.operationId,pool);
      assert.deepEqual(reread.targets,op.targets);assert.equal(contract.summarizeRoomStop(reread).physicalMediaVerified,false);
      return {pending:5,failed:1,stopped:1,trustedNotStarted:1,silencePromotedToSuccess:false};
    });
    await runCase(11,'Client/server reports never become physical-media proof',async()=>{
      const f=await fixture('case 11',{local_media:'client_report',remote_media:'client_report',signaling:'server_component'});
      let op=await store.requestRoomStop(f.authority,'case-11-stop',pool);
      for(const target of contract.ROOM_STOP_TARGETS)op=await store.acknowledgeStoredRoomStop(await ackAuthority(op,target),'stopped',pool);
      const summary=contract.summarizeRoomStop(op);assert.equal(summary.status,'acknowledged');assert.equal(summary.physicalMediaVerified,false);
      assert.equal(op.targetBindings.local_media.evidenceKind,'client_report');assert.equal(op.targetBindings.signaling.evidenceKind,'server_component');
      return {summary:'acknowledged',physicalMediaVerified:false,evidenceMetadataExercised:['client_report','server_component','simulated'],
        allAdaptersInThisWitness:'simulated'};
    });
    await runCase(12,'R3A history, terminal revoke, event ceiling and no resurrection',async()=>{
      const f=await fixture('case 12');const second={...f,scope:{...f.scope,runtimeId:randomUUID()}};
      await insertBinding(second);second.authority=await verifiedAuthority(second);
      const op=await store.requestRoomStop(f.authority,'case-12-stop',pool);
      const reconnected=await store.decideStoredLateRoomWork(second.authority,pool);
      assert.equal(reconnected.reason,'stop_recorded');assert.equal(reconnected.operationId,op.operationId);
      await assert.rejects(()=>store.requestRoomStop(second.authority,'reconnect-stop',pool));
      await assert.rejects(()=>insertBinding({...f,scope:{...f.scope,runtimeId:randomUUID()}}));
      await appendConsent(f,'revoke');await assert.rejects(()=>appendConsent(f,'grant'));
      assert.equal((await currentConsent(f)).reason,'revoked');
      for(const sql of [
        "UPDATE encounter_consent_events SET text_snapshot='fictional rewrite' WHERE id=$1",
        'DELETE FROM encounter_consent_events WHERE id=$1',
      ])await assert.rejects(()=>pool.query(sql,[f.admissionEventId]));
      await assert.rejects(()=>pool.query('TRUNCATE encounter_consent_events CASCADE'));
      const other=await fixture('case 12 other');
      await assert.rejects(()=>appendConsent({...f,scope:{...f.scope,encounterId:other.scope.encounterId}},'grant','record_audio'));
      for(let i=0;i<63;i+=1)await appendConsent(other,'refuse','temporary_captions');
      const ceiling=await Promise.allSettled([appendConsent(other,'grant','temporary_captions'),appendConsent(other,'refuse','temporary_captions')]);
      assert.equal(ceiling.filter(x=>x.status==='fulfilled').length,1);assert.equal(ceiling.filter(x=>x.status==='rejected').length,1);
      await assert.rejects(()=>appendConsent(other,'grant','temporary_captions'));
      const terminalClient=await pool.connect();let concurrentGrant;
      try{
        await terminalClient.query('BEGIN');await appendConsent(other,'revoke','retain_summary',terminalClient);
        concurrentGrant=appendConsent(other,'grant','retain_summary').then(()=>({accepted:true}),()=>({accepted:false}));
        await waitForAdvisory();await terminalClient.query('COMMIT');assert.equal((await concurrentGrant).accepted,false);
      }finally{await terminalClient.query('ROLLBACK');terminalClient.release();}
      for(const table of ['encounter_room_stop_bindings','encounter_room_stop_operations','encounter_room_stop_acknowledgements']){
        await assert.rejects(()=>pool.query(`TRUNCATE ${table} CASCADE`));
      }
      await assert.rejects(()=>pool.query("UPDATE encounter_room_stop_operations SET request_key='fictional rewrite' WHERE id=$1",[op.operationId]));
      await assert.rejects(()=>pool.query('DELETE FROM encounter_room_stop_operations WHERE id=$1',[op.operationId]));
      assert.equal(await stopCount(f),1);assert.equal(await count('encounter_consent_events','id',f.admissionEventId),1);
      const bounded=await fixture('case 12 bounded roster');
      for(let i=1;i<32;i+=1)await insertBinding({...bounded,scope:{...bounded.scope,runtimeId:randomUUID()}});
      await assert.rejects(()=>insertBinding({...bounded,scope:{...bounded.scope,runtimeId:randomUUID()}}));
      assert.equal(await count('encounter_room_stop_bindings','participant_id',bounded.scope.participantId),32);
      const erasable=await fixture('case 12 permitted parent lifecycle');
      let erasedOp=await store.requestRoomStop(erasable.authority,'parent-lifecycle',pool);
      erasedOp=await store.acknowledgeStoredRoomStop(await ackAuthority(erasedOp,'signaling'),'stopped',pool);
      await pool.query('DELETE FROM encounter_participants WHERE id=$1',[erasable.scope.participantId]);
      assert.equal(await stopCount(erasable),0);assert.equal(await ackCount(erasedOp),0);
      assert.equal(await count('encounter_room_stop_bindings','participant_id',erasable.scope.participantId),0);
      assert.equal(await count('encounter_consent_events','participant_id',erasable.scope.participantId),0);
      return {terminalRevoke:'preserved',compositeScope:'preserved',appendOnlyAndTruncate:'preserved',
        eventCeiling:64,eventCeilingRace:'one accepted; one refused',revokeGrantRace:'grant refused after revoke commit',
        runtimeBindingCeiling:32,parentLifecycleCascade:'preserved',reconnectReopened:false,staleBackupRecoveryQualified:false};
    });
  } catch(error) {
    receipt.fatalError=String(error?.stack??error).slice(0,6000);
  } finally {
    clearTimeout(deadline);
    try{await cleanup();}catch(error){receipt.cleanup.error=String(error);}
    for(const [signal,handler] of signalHandlers)process.removeListener(signal,handler);
    emitReceipt();
  }
}

if(options.restartRead)await restartRead();else await main();
