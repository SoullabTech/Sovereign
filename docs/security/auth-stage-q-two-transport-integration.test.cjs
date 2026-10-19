/**
 * Stage Q fictional in-process browser/server integration witness.
 * Executes the actual signout Route.POST and webSignOut helper together with
 * synthetic HTTP-cookie and SQL-session dependencies. Never uses real members,
 * sockets, PostgreSQL, browser engines, external requests, or production data.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require(process.env.AUTH_TEST_DEPS
  ? path.join(process.env.AUTH_TEST_DEPS, 'typescript') : 'typescript');
const root = path.resolve(__dirname, '../..');

function loadTs(relative, imports) {
  const file = path.join(root, relative);
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{
    fileName:file, compilerOptions:{
      target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS,
      esModuleInterop:true, isolatedModules:true,
    },
  }).outputText;
  const mod = new Module.Module(file + '.stageq-simulation.cjs');
  mod.filename = file + '.stageq-simulation.cjs';
  mod.paths = [];
  mod.require = id => {
    if(imports.has(id)) return imports.get(id);
    throw Error('Unapproved test import: ' + id);
  };
  mod._compile(code, mod.filename);
  return mod.exports;
}

function setup({cookieToken=null,headerToken=null,sameOrigin=true,
                originConfigured=true,sqlOutage=false}={}) {
  const origin='https://stage-q-fiction.invalid', host='stage-q-fiction.invalid';
  const cookies=new Map();
  if(cookieToken)cookies.set('maia_session',cookieToken);
  const sessions=new Map();
  for(const token of [cookieToken,headerToken])if(token)sessions.set(token,{revoked:false});
  const observed={requests:[],updates:[],cookieWrites:[]};
  let outage=sqlOutage;
  const fakeNextResponse={json:(body,options={})=>{
    const status=options.status||200;
    return {status,ok:status>=200&&status<300,body,json:async()=>body};
  }};
  const jar={
    get:name=>cookies.has(name)?{value:cookies.get(name)}:undefined,
    set:(name,value,options={})=>{
      observed.cookieWrites.push(name);
      if(options.expires instanceof Date&&options.expires.getTime()<=0)cookies.delete(name);
      else cookies.set(name,value);
    },
  };
  const query=async(sql,params)=>{
    assert.match(sql,/UPDATE auth_sessions/);
    assert.equal(params.length,1);
    observed.updates.push(params[0]);
    if(outage)throw Error('Fictional database outage');
    const row=sessions.get(params[0]);
    if(!row||row.revoked)return {rowCount:0};
    row.revoked=true;
    return {rowCount:1};
  };
  const server=loadTs('app/api/members/signout/route.ts',new Map([
    ['next/server',{NextResponse:fakeNextResponse}],
    ['next/headers',{cookies:async()=>jar}],
    ['@/lib/db/postgres',{query}],
  ]));
  const client=loadTs('lib/auth/webSignOut.ts',new Map([
    ['@/lib/http/apiBase',{clearAuthState:()=>{},isNativeCapacitor:()=>false}],
    ['@capacitor/core',{Capacitor:{isNativePlatform:()=>false}}],
  ]));
  async function transport(pathname,options){
    assert.equal(pathname,'/api/members/signout');
    assert.equal(options.method,'POST');
    assert.equal(options.credentials,'same-origin');
    assert.equal(options.mode,'same-origin');
    assert.equal(options.redirect,'error');
    const headers=new Headers({Host:host});
    headers.set('Origin',sameOrigin?origin:'null');
    headers.set('Sec-Fetch-Site',sameOrigin?'same-origin':'cross-site');
    for(const [key,value] of new Headers(options.headers).entries())headers.set(key,value);
    observed.requests.push({
      cookie:cookies.get('maia_session')||null,
      header:headers.get('x-session-token')||null,
    });
    const old=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
    if(originConfigured)process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=origin;
    else delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
    try{return await server.POST({headers})}
    finally{
      if(old===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
      else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=old;
    }
  }
  async function conflict(cookie,header){
    cookies.set('maia_session',cookie);
    const headers=new Headers({Host:host,Origin:origin,'Sec-Fetch-Site':'same-origin','x-session-token':header});
    const old=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
    process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=origin;
    try{return await server.POST({headers})}
    finally{
      if(old===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
      else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=old;
    }
  }
  return {client,transport,conflict,cookies,sessions,observed,
    active:token=>sessions.get(token)?.revoked===false,
    setOutage:next=>{outage=next},
  };
}

test('distinct cookie and bearer sessions independently revoked; replay denied',async()=>{
  const s=setup({cookieToken:'fictional-cookie-A',headerToken:'fictional-header-B'});
  const result=await s.client.signOutWebCredentials(s.transport,'fictional-header-B');
  assert.equal(result.kind,'complete');
  assert.equal(result.confirmedRevocations,2);
  assert.equal(s.active('fictional-cookie-A'),false);
  assert.equal(s.active('fictional-header-B'),false);
  assert.equal(s.cookies.has('maia_session'),false);
  assert.deepEqual(s.observed.requests,[
    {cookie:'fictional-cookie-A',header:null},
    {cookie:null,header:'fictional-header-B'},
  ]);
});
test('identical cookie and header session does not invent second revocation',async()=>{
  const s=setup({cookieToken:'fictional-same',headerToken:'fictional-same'});
  const result=await s.client.signOutWebCredentials(s.transport,'fictional-same');
  assert.equal(result.kind,'complete');
  assert.equal(result.confirmedRevocations,1);
  assert.equal(s.active('fictional-same'),false);
});
test('header-only Safari session is revoked after cookie no-op',async()=>{
  const s=setup({headerToken:'fictional-header-only'});
  const result=await s.client.signOutWebCredentials(s.transport,'fictional-header-only');
  assert.equal(result.kind,'complete');
  assert.equal(result.confirmedRevocations,1);
  assert.deepEqual(s.observed.updates,['fictional-header-only']);
  assert.equal(s.active('fictional-header-only'),false);
});
test('SQL outage in cookie phase returns incomplete; no second request',async()=>{
  const s=setup({cookieToken:'fictional-cookie',headerToken:'fictional-header',sqlOutage:true});
  const orig=console.error;console.error=()=>{};
  let result;try{result=await s.client.signOutWebCredentials(s.transport,'fictional-header')}
  finally{console.error=orig}
  assert.equal(result.kind,'incomplete');
  assert.equal(result.cookieClearingConfirmed,true);
  assert.equal(result.confirmedRevocations,0);
  assert.equal(s.observed.requests.length,1);
  assert.equal(s.active('fictional-cookie'),true);
  assert.equal(s.active('fictional-header'),true);
});
test('SQL outage during bearer phase preserves partial success',async()=>{
  const s=setup({cookieToken:'fictional-cookie',headerToken:'fictional-header'});
  let index=0;
  const handler=async(...args)=>{index++;if(index===2)s.setOutage(true);return s.transport(...args)};
  const orig=console.error;console.error=()=>{};
  let result;try{result=await s.client.signOutWebCredentials(handler,'fictional-header')}
  finally{console.error=orig}
  assert.equal(result.kind,'incomplete');
  assert.equal(result.confirmedRevocations,1);
  assert.equal(result.cookieClearingConfirmed,true);
  assert.equal(s.active('fictional-cookie'),false);
  assert.equal(s.active('fictional-header'),true);
});
test('null/foreign Origin refuses before database or cookie changes',async()=>{
  const s=setup({cookieToken:'fictional-cookie',headerToken:'fictional-header',sameOrigin:false});
  const result=await s.client.signOutWebCredentials(s.transport,'fictional-header');
  assert.equal(result.kind,'incomplete');
  assert.equal(result.cookieClearingConfirmed,false);
  assert.equal(s.observed.updates.length,0);
  assert.equal(s.observed.cookieWrites.length,0);
  assert.equal(s.active('fictional-cookie'),true);
});
test('missing allowlist defaults to denying even same-origin requests',async()=>{
  const s=setup({cookieToken:'fictional-cookie',originConfigured:false});
  const result=await s.client.signOutWebCredentials(s.transport,null);
  assert.equal(result.kind,'incomplete');
  assert.equal(s.observed.updates.length,0);
  assert.equal(s.cookies.has('maia_session'),true);
});
test('direct conflicting credentials never revoke either token',async()=>{
  const s=setup({cookieToken:'fictional-cookie',headerToken:'fictional-header'});
  const response=await s.conflict('fictional-cookie','fictional-header');
  assert.equal(response.status,409);
  assert.equal(response.body.success,false);
  assert.equal(s.observed.updates.length,0);
  assert.equal(s.active('fictional-cookie'),true);
  assert.equal(s.active('fictional-header'),true);
});
test('repeated signout of a revoked session does not claim another revocation',async()=>{
  const s=setup({cookieToken:'fictional-cookie'});
  const first=await s.client.signOutWebCredentials(s.transport,null);
  const second=await s.client.signOutWebCredentials(s.transport,null);
  assert.equal(first.confirmedRevocations,1);
  assert.equal(second.kind,'complete');
  assert.equal(second.confirmedRevocations,0);
  assert.equal(s.active('fictional-cookie'),false);
});