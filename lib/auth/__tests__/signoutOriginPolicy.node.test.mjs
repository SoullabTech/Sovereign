import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import Module from 'node:module';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const deps=process.env.AUTH_FIXTURE_DEPS;
assert.ok(deps,'AUTH_FIXTURE_DEPS must reference installed local toolchain');
const require=createRequire(import.meta.url);
const ts=require(path.join(deps,'typescript'));
const src=fs.readFileSync(path.join(root,'lib/auth/signoutRequestPolicy.ts'),'utf8');
const m=new Module.Module(path.join(root,'lib/auth/signoutRequestPolicy.ts.test.cjs'));
m.filename=path.join(root,'lib/auth/signoutRequestPolicy.ts.test.cjs');
m.require=id=>{throw Error('Policy unexpectedly imported '+id)};
m._compile(ts.transpileModule(src,{
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}
}).outputText,m.filename);
const policy=m.exports;
const previous=process.env.NEXT_PUBLIC_APP_URL;
test.before(()=>{process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3822'});
test.after(()=>{
 if(previous===undefined)delete process.env.NEXT_PUBLIC_APP_URL;
 else process.env.NEXT_PUBLIC_APP_URL=previous;
});
const header=(origin,token=null)=>new Headers({
 ...(origin===null?{}:{Origin:origin}),
 ...(token?{'x-session-token':token}:{})
});
test('trusted exact production origin supports ambient-cookie web logout',()=>{
 for(const origin of ['https://soullab.life','https://www.soullab.life']){
  assert.deepEqual(policy.checkSignoutTransport(header(origin)),
   {allowed:true,transport:'web',corsOrigin:null});
 }
});
test('a server-configured exact local test origin is permitted, not any localhost',()=>{
 assert.equal(policy.checkSignoutTransport(header('http://127.0.0.1:3822')).allowed,true);
 assert.equal(policy.checkSignoutTransport(header('http://127.0.0.1:3823')).allowed,false);
 assert.equal(policy.checkSignoutTransport(header('http://localhost:3822')).allowed,false);
});
test('spoofed, prefixed and null origins are all refused before DB',()=>{
 for(const origin of ['null','https://soullab.life.attacker.invalid',
  'https://soullab.life@attacker.invalid','https://evil.invalid',
  'http://soullab.life','file://','https://beta.soullab.life']){
  assert.equal(policy.checkSignoutTransport(header(origin,'token')).allowed,false,origin);
 }
});
test('missing Origin cannot use an ambient cookie but explicit bearer qualifies',()=>{
 assert.equal(policy.checkSignoutTransport(header(null)).allowed,false);
 assert.deepEqual(policy.checkSignoutTransport(header(null,'nonblank-test-header')),
  {allowed:true,transport:'header-only',corsOrigin:null});
});
test('specific native origins require a session header, not an identity claim',()=>{
 for(const origin of ['capacitor://localhost','ionic://localhost']){
  assert.equal(policy.checkSignoutTransport(header(origin)).allowed,false);
  assert.deepEqual(policy.checkSignoutTransport(header(origin,'header-token')),
   {allowed:true,transport:'native',corsOrigin:origin});
 }
});
test('preflight permits POST and only named headers for exact native origin',()=>{
 const req=new Headers({
  origin:'capacitor://localhost',
  'access-control-request-method':'POST',
  'access-control-request-headers':'content-type, x-session-token, x-member-id, x-maia-anon-id, x-app-shell'
 });
 assert.deepEqual(policy.signoutPreflight(req),{allowed:true,corsOrigin:'capacitor://localhost'});
 const cors=policy.signoutCorsHeaders('capacitor://localhost');
 assert.equal(cors['Access-Control-Allow-Origin'],'capacitor://localhost');
 assert.equal(cors['Access-Control-Allow-Credentials'],'true');
 assert.ok(!Object.values(cors).some(value=>value==='*'));
});
test('CORS preflight rejects untrusted origins, wrong methods and unknown headers',()=>{
 const cases=[
  {origin:'null','access-control-request-method':'POST'},
  {origin:'https://attacker.invalid','access-control-request-method':'POST'},
  {origin:'capacitor://localhost','access-control-request-method':'DELETE'},
  {origin:'capacitor://localhost','access-control-request-method':'POST','access-control-request-headers':'authorization, x-session-token'}
 ];
 for(const headers of cases)assert.equal(policy.signoutPreflight(new Headers(headers)).allowed,false,JSON.stringify(headers));
});
test('caller cannot expand server origins with a malformed configured URL',()=>{
 process.env.NEXT_PUBLIC_APP_URL='http://attacker.invalid';
 assert.equal(policy.checkSignoutTransport(header('http://attacker.invalid')).allowed,false);
 process.env.NEXT_PUBLIC_APP_URL='https://user:pass@evil.invalid';
 assert.equal(policy.checkSignoutTransport(header('https://evil.invalid')).allowed,false);
 process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3822';
});
