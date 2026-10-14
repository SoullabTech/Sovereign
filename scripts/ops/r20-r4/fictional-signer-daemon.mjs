#!/usr/bin/env node
/**
 * R20-R4 synthetic local signer daemon. Does NOT listen on TCP or run on
 * production. Private fixture keys stay inside this child process. Running
 * this on another actual host is NOT authorized by its existence.
 */
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildFixtureSignerEngine } from '../../../lib/recovery/r20-r4/fixtureSignerEngine.mjs';

const fail=reason=>{throw Error('R20-R4 daemon refused: '+reason);};
const root=process.argv[2], mode=process.argv[3];
if (process.argv.length!==4 || mode!=='--fictional-only' ||
    typeof root!=='string' || !path.isAbsolute(root)) fail('no real host mode');
const tmp=await fs.realpath(os.tmpdir());
const real=await fs.realpath(root);
if(!real.startsWith(path.join(tmp,'r20-r3j-fixture-r4-'))){
  fail('signer outside isolated fictional directory');
}
const dirStat=await fs.lstat(root);
if(!dirStat.isDirectory() || dirStat.isSymbolicLink() ||
    (dirStat.mode & 0o077)!==0)fail('unsafe fixture directory or permissions');
const filename=path.join(root,'fictional-private-role-keyring.json');
const fileStat=await fs.lstat(filename);
if(!fileStat.isFile() || fileStat.isSymbolicLink() ||
    (fileStat.mode & 0o077)!==0)fail('unsafe fixture key custody');
const fixtureKeys=JSON.parse(await fs.readFile(filename,'utf8'));
if(fixtureKeys.schema!=='R20_R4_EPHEMERAL_TEST_KEYS_V1' ||
   Object.keys(fixtureKeys).length!==4){
  fail('fixture key envelope invalid');
}
const moduleDir=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.resolve(moduleDir,'../../..');
const captureRegistry=JSON.parse(readFileSync(path.join(repoRoot,
 'lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json'),'utf8'));
const locations={
  ledger:'https://r20-event-fixture.example.invalid/v1',
  head:'https://r20-head-fixture.example.invalid/v1',
  pin:'https://r20-pin-fixture.example.invalid/v1',
};
const engine=await buildFixtureSignerEngine({
  root,captureRegistry,locations,
  privatePem:fixtureKeys.privateRoles,
  issuerPublicPem:fixtureKeys.issuerPublicKey,
  recoveryPublicPem:fixtureKeys.recoveryPublicKey,
});
// Refuse startup on signed-ledger or high-water loss, including orphaned
// fixture publication prefixes. Never delete or repair custody on startup.
await engine.verifyStartup();

const socketPath=path.join(root,'signer.sock');
try{
  await fs.lstat(socketPath);
  fail('socket already exists; custodian must prove prior daemon stopped');
}catch(error){if(error.code!=='ENOENT')throw error;}
const server=net.createServer();
let sequence=Promise.resolve();
server.on('connection',socket=>{
  socket.setTimeout(2500,()=>socket.destroy());
  let payload='',done=false;
  function reply(obj){
    if(done)return;
    done=true;
    socket.end(JSON.stringify(obj)+'\n');
  }
  socket.on('data',data=>{
    if(done)return;
    payload+=data.toString('utf8');
    if(Buffer.byteLength(payload,'utf8')>16_384){
      reply({ok:false,refusal:'request_too_large'});return;
    }
    const pos=payload.indexOf('\n');
    if(pos===-1)return;
    if(payload.slice(pos+1).trim().length>0){
      reply({ok:false,refusal:'one_request_only'});return;
    }
    let request;
    try{request=JSON.parse(payload.slice(0,pos));}
    catch {reply({ok:false,refusal:'malformed_json'});return;}
    // Serializing the whole read+sign+fsync transaction prevents two
    // concurrent sequence N+1 proposals from both reaching storage.
    const current=sequence.catch(()=>{}).then(()=>engine.handle(request));
    sequence=current.catch(()=>{});
    current.then(data=>reply({ok:true,result:data}),error=>reply({
      ok:false,
      refusal:typeof error?.message==='string' &&
        error.message.startsWith('R20') ?
        error.message.slice(0,180) : 'signing_or_storage_refused',
    }));
  });
});
await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(socketPath,resolve);
});
await fs.chmod(socketPath,0o600);
process.stdout.write('R20_R4_FICTIONAL_SIGNER_READY\n');

let closing=false;
async function stop(){
  if(closing)return;
  closing=true;
  server.close(async()=>{
    try{
      const stat=await fs.lstat(socketPath);
      if(stat.isSocket())await fs.unlink(socketPath);
    }catch{}
    process.exit(0);
  });
}
// Fixture-only parent-death protection: a crashed test runner must not
// leave a detached daemon holding ephemeral signing keys in process memory.
const startingParentPid=process.ppid;
const orphanWatch=setInterval(()=>{
  if(process.ppid!==startingParentPid || process.ppid===1)void stop();
},1000);
orphanWatch.unref();
process.on('SIGTERM',stop);
process.on('SIGINT',stop);
