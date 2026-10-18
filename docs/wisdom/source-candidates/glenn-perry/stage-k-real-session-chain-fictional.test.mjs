/**
 * Stage K: real Soullab source auth modules, FICTIONAL session storage.
 * Not a production account, database, or real member login.
 * This fixture intercepts the actual session module's database and Next
 * cookie reads and uses the real founder allowlist logic unmodified.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const deps=process.env.PERRY_PREVIEW_DEPS;
assert.ok(deps,'PERRY_PREVIEW_DEPS local typescript folder required');
const require=createRequire(import.meta.url);
const ts=require(path.join(deps,'typescript'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const founderId='11111111-1111-4111-8111-111111111111';
const otherId='22222222-2222-4222-8222-222222222222';
const validToken='fictional-token-not-valid-in-any-actual-soullab-account';

function compile(relative,imports){
 const filename=path.join(root,relative);
 const js=ts.transpileModule(read(relative),{
  fileName:filename,
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}
 }).outputText;
 const mod=new Module.Module(filename+'.test.cjs');
 mod.filename=filename+'.test.cjs';mod.paths=[];
 mod.require=id=>{
  if(imports.has(id))return imports.get(id);
  throw Error('Unexpected source dependency '+id);
 };
 mod._compile(js,mod.filename);
 return mod.exports;
}

function fixture({cookie=validToken,member=founderId,revoked=false,expired=false,dbFailure=false,allowlist=founderId}={}){
 let reads=0,writes=0;
 const expiry=new Date(Date.now()+(expired?-100000:100000));
 const row={
   id:'fictional-session-1',member_id:member,session_token:validToken,
   device_id:null,ip_address:null,user_agent:'fixture',
   expires_at:expiry.toISOString(),last_active_at:new Date().toISOString(),
   revoked
 };
 const query=async (sql,params)=>{
   if(dbFailure)throw Error('fixture database offline');
   if(/SELECT.*FROM auth_sessions/s.test(sql)){
     reads++;
     assert.deepEqual(params,[validToken]);
     return {rows:cookie===validToken&&!revoked&&!expired?[row]:[]};
   }
   if(/UPDATE auth_sessions SET last_active_at/s.test(sql)){
     writes++;assert.deepEqual(params,['fictional-session-1']);
     return {rowCount:1};
   }
   throw Error('Denied unexpected database query: '+sql.slice(0,85));
 };
 const prev=process.env.FOUNDER_MEMBER_IDS;
 process.env.FOUNDER_MEMBER_IDS=allowlist;
 try{
   const sessions=compile('lib/auth/serverSessions.ts',new Map([
     ['@/lib/db/postgres',{query}],
     ['./passwordUtils',{generateSecureToken:()=>{throw Error('not used')}}],
     ['next/headers',{cookies:async()=>({get:name=>{
       assert.equal(name,'maia_session');
       return cookie===null?undefined:{value:cookie};
     }})}]
   ]));
   const founder=compile('lib/founder/founderAuth.ts',new Map([
     ['@/lib/auth/serverSessions',sessions]
   ]));
   return {sessions,founder,stats:()=>({reads,writes})};
 }finally{
   if(prev===undefined)delete process.env.FOUNDER_MEMBER_IDS;
   else process.env.FOUNDER_MEMBER_IDS=prev;
 }
}

test('real canonical session source uses server cookie and revocation/expiry predicates',()=>{
 const src=read('lib/auth/serverSessions.ts');
 assert.match(src,/const SESSION_COOKIE_NAME = 'maia_session'/);
 assert.match(src,/AND revoked = FALSE/);
 assert.match(src,/AND expires_at > NOW\(\)/);
 assert.match(src,/return validateSession\(token\)/);
 const auth=read('lib/founder/founderAuth.ts');
 assert.match(auth,/await getCurrentSession\(\)/);
 assert.match(auth,/FOUNDER_MEMBER_IDS.has\(session.memberId\)/);
});

test('verified fictional database session with exact founder member matches',async()=>{
 const f=fixture();
 const result=await f.founder.requireFounder();
 assert.deepEqual(result,{ok:true,memberId:founderId});
 assert.deepEqual(f.stats(),{reads:1,writes:1});
});

test('cookie omission denies before touching fictional database',async()=>{
 const f=fixture({cookie:null});
 assert.deepEqual(await f.founder.requireFounder(),{ok:false,status:401,error:'Authentication required'});
 assert.deepEqual(f.stats(),{reads:0,writes:0});
});

test('invalid, revoked, expired or unavailable fictional records all deny',async()=>{
 for(const options of [
   {cookie:'invalid-token'},{revoked:true},{expired:true},{dbFailure:true}
 ]){
   const f=fixture(options);
   const r=await f.founder.requireFounder();
   assert.equal(r.ok,false,JSON.stringify(options));
   assert.equal(r.status,401);
   assert.equal(f.stats().writes,0);
 }
});

test('nonfounder valid member session cannot become founder through role claims',async()=>{
 const f=fixture({member:otherId});
 assert.deepEqual(await f.founder.requireFounder(),{ok:false,status:403,error:'Founder access required'});
});

test('unconfigured founder allowlist denies a verified session',async()=>{
 const f=fixture({allowlist:''});
 assert.deepEqual(await f.founder.requireFounder(),{ok:false,status:403,error:'Founder access required'});
});

test('gathering page preserves its independent server flag, founder gate and native refusal',()=>{
 const page=read('app/wisdom-keepers/wisdom/gather-preview/page.tsx');
 assert.match(page,/MAIA_WISDOM_GATHER_PREVIEW_ENABLED !== '1'/);
 assert.match(page,/await requireFounder\(\)/);
 assert.match(page,/CAPACITOR_BUILD === '1'/);
 assert.match(page,/notFound\(\)/);
});
