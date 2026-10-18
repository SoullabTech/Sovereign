import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import Module from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const deps=process.env.AUTH_FIXTURE_DEPS;
assert.ok(deps,'AUTH_FIXTURE_DEPS must reference locally installed Node dependencies');
const require=createRequire(import.meta.url);
const ts=require(path.join(deps,'typescript'));
const {NextRequest,NextResponse}=require(path.join(deps,'next/server'));
const previous=process.env.NEXT_PUBLIC_APP_URL;
test.before(()=>{process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3822'});
test.after(()=>{
 if(previous===undefined)delete process.env.NEXT_PUBLIC_APP_URL;
 else process.env.NEXT_PUBLIC_APP_URL=previous;
});
function load(filename,imports=new Map()){
 const full=path.join(root,filename);
 const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{
  fileName:full,compilerOptions:{
   target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,
  },
 }).outputText;
 const mod=new Module.Module(full+'.isolation.cjs');
 mod.filename=full+'.isolation.cjs';mod.paths=[];
 mod.require=id=>{
  if(imports.has(id))return imports.get(id);
  throw Error('Unexpected module imported: '+id);
 };
 mod._compile(code,mod.filename);
 return mod.exports;
}
const policy=load('lib/auth/signoutRequestPolicy.ts');
const URL='http://127.0.0.1:3822/api/members/signout';
function fixture({fail=false}={}){
 const sqlCalls=[];
 const query=async (sql,params)=>{
  sqlCalls.push({sql,params});
  if(fail)throw Error('fictional SQL unavailable');
  assert.match(sql,/UPDATE auth_sessions/);
  assert.match(sql,/session_token = ANY\(\$1::varchar\[\]\)/);
  assert.ok(Array.isArray(params[0]));
  return {rowCount:params[0].length,rows:[]};
 };
 const api=load('app/api/members/signout/route.ts',new Map([
  ['next/server',{NextRequest,NextResponse}],
  ['@/lib/db/postgres',{query}],
  ['@/lib/auth/signoutRequestPolicy',policy],
 ]));
 const make=({origin='http://127.0.0.1:3822',cookie='',bearer='',query='',method='POST',preflight=false}={})=>
  new NextRequest(URL+query,{method,headers:{
    ...(origin!==null?{Origin:origin}:{}),
    ...(cookie?{Cookie:'maia_session='+cookie}:{}),
    ...(bearer?{'x-session-token':bearer}:{}),
    ...(preflight?{'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'x-session-token,content-type'}:{})
  }});
 return {api,make,sqlCalls};
}
async function body(res){return await res.json()}
function cookiesCleared(res){
 const names=res.cookies.getAll().map(x=>x.name);
 for(const name of ['maia_session','maia_member_id','maia_tier','maia_roles']){
  assert.ok(names.includes(name),'missing cookie removal: '+name);
  assert.equal(res.cookies.get(name)?.value,'');
 }
}
test('web cookie sign-out revokes only supplied bearer and clears four auth cookies',async()=>{
 const {api,make,sqlCalls}=fixture();
 const r=await api.POST(make({cookie:'fictional-cookie-value'}));
 assert.equal(r.status,200);
 assert.deepEqual(await body(r),{
  success:true,serverRevocationConfirmed:true,localCookiesCleared:true
 });
 assert.deepEqual(sqlCalls[0].params,[['fictional-cookie-value']]);
 assert.equal(sqlCalls.length,1);
 cookiesCleared(r);
 assert.equal(r.headers.get('cache-control'),'private, no-store, max-age=0');
});
test('native origin without header rejects before DB writes, even with cookie',async()=>{
 const {api,make,sqlCalls}=fixture();
 const r=await api.POST(make({origin:'capacitor://localhost',cookie:'ambient-cookie'}));
 assert.equal(r.status,403);
 assert.equal(sqlCalls.length,0);
});
test('native x-session-token bearer is revoked without a cookie',async()=>{
 const {api,make,sqlCalls}=fixture();
 const r=await api.POST(make({origin:'capacitor://localhost',bearer:'fictional-native-bearer'}));
 assert.equal(r.status,200);
 assert.equal(sqlCalls.length,1);
 assert.deepEqual(sqlCalls[0].params,[['fictional-native-bearer']]);
 assert.equal(r.headers.get('access-control-allow-origin'),'capacitor://localhost');
 cookiesCleared(r);
});
test('Safari header-only fallback works without ambient cookie or Origin',async()=>{
 const {api,make,sqlCalls}=fixture();
 const r=await api.POST(make({origin:null,bearer:'safari-session-header'}));
 assert.equal(r.status,200);
 assert.deepEqual(sqlCalls[0].params,[['safari-session-header']]);
 assert.equal(r.headers.get('access-control-allow-origin'),null);
 cookiesCleared(r);
});
test('two distinct credentials revoke atomically in one UPDATE',async()=>{
 const {api,make,sqlCalls}=fixture();
 const r=await api.POST(make({cookie:'browser-cookie',bearer:'safari-token'}));
 assert.equal(r.status,200);
 assert.equal(sqlCalls.length,1);
 assert.deepEqual(sqlCalls[0].params,[['browser-cookie','safari-token']]);
});
test('origin:null, forged domain, no Origin cookie-only, unexpected URL all refuse before DB',async()=>{
 const {api,make,sqlCalls}=fixture();
 for(const a of [
  {origin:'null',cookie:'existing-cookie'},
  {origin:'https://soullab.life.attacker.invalid',cookie:'existing-cookie'},
  {origin:null,cookie:'existing-cookie'},
  {origin:'https://attacker.invalid',bearer:'bearer'}
 ])assert.equal((await api.POST(make(a))).status,403);
 assert.equal((await api.POST(make({query:'?memberId=known'}))).status,400);
 assert.equal(sqlCalls.length,0);
});
test('no session cookie on trusted web Origin clears ambient access cookies',async()=>{
 const {api,make,sqlCalls}=fixture();
 const r=await api.POST(make({cookie:'',bearer:''}));
 assert.equal(r.status,200);
 assert.equal(sqlCalls.length,0);
 cookiesCleared(r);
});
test('database outage reports 503 and still clears only local cookies',async()=>{
 const {api,make,sqlCalls}=fixture({fail:true});
 const r=await api.POST(make({cookie:'fictional-db-down'}));
 assert.equal(r.status,503);
 assert.deepEqual(await body(r),{
  success:false,serverRevocationConfirmed:false,
  localCookiesCleared:true,code:'REVOCATION_UNCONFIRMED'
 });
 assert.equal(sqlCalls.length,1);
 cookiesCleared(r);
});
test('OPTIONS exact native preflight is allowed; unknown headers and Origin:null fail',async()=>{
 const {api,make,sqlCalls}=fixture();
 const good=await api.OPTIONS(make({origin:'capacitor://localhost',method:'OPTIONS',preflight:true}));
 assert.equal(good.status,204);
 assert.equal(good.headers.get('access-control-allow-origin'),'capacitor://localhost');
 const nullOrigin=await api.OPTIONS(make({origin:'null',method:'OPTIONS',preflight:true}));
 assert.equal(nullOrigin.status,403);
 const wrong=await api.OPTIONS(new NextRequest(URL,{
  method:'OPTIONS',
  headers:{origin:'capacitor://localhost','access-control-request-method':'DELETE'}
 }));
 assert.equal(wrong.status,403);
 assert.equal(sqlCalls.length,0);
});
