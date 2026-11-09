/** LISTEN-08: isolated Next page source contract (not integrated HTTP / database acceptance).
 * The real joined fictional PostgreSQL witness is documented separately. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const pagePath = path.resolve(__dirname, '../../app/listen/page.tsx');
const compiled = ts.transpileModule(fs.readFileSync(pagePath, 'utf8'), {
  fileName:pagePath,
  compilerOptions:{module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}
}).outputText;

function nativePage({enabled=false,member='invalid'}={}) {
 const calls={auth:0,notFound:0,redirects:[]};
 const exports={};const module={exports};
 const mockRequire=name=>{
  if(name==='next/navigation') return {
   notFound:()=>{calls.notFound++;throw new Error('NEXT_HTTP_404')},
   redirect:(url)=>{calls.redirects.push(url);throw new Error('NEXT_REDIRECT')}
  };
  if(name==='@/lib/auth/session') return {requireMemberId:async()=>{
   calls.auth++;
   if(member==='db_error') throw new Error('DATABASE_UNAVAILABLE');
   if(member!=='valid') throw new Error('AUTH_REQUIRED');
   return 'fictional-member-only';
  }};
  if(name==='./ListenRoom')return {__esModule:true,default:()=>null};
  if(name==='react/jsx-runtime')return {jsx:component=>({renderedComponent:component.name||'default'})};
  throw new Error('Unexpected module '+name);
 };
 // Inject the same Error constructor to keep expected instanceof logic accurate
 // across Node VM contexts. This mock has NO real member credentials.
 vm.runInNewContext(compiled,{require:mockRequire,exports,module,Error,
    process:{env:enabled?{SOULLAB_LISTEN_REVIEW_ENABLED:'1'}:{}},Object},
    {timeout:2000});
 return {page:module.exports.default,calls};
}
test('feature disabled: 404 before any auth work',async()=>{
 const r=nativePage();
 await assert.rejects(r.page(),/NEXT_HTTP_404/);
 assert.equal(r.calls.notFound,1);assert.equal(r.calls.auth,0);
 assert.deepEqual(r.calls.redirects,[]);
});
test('enabled, missing credential: temporary sign-in redirect, not HTTP 500',async()=>{
 const r=nativePage({enabled:true,member:'invalid'});
 await assert.rejects(r.page(),/NEXT_REDIRECT/);
 assert.equal(r.calls.notFound,0);assert.equal(r.calls.auth,1);
 assert.deepEqual(r.calls.redirects,['/signin?next=%2Flisten']);
});
test('enabled, valid fictional member: render only after verified session',async()=>{
 const r=nativePage({enabled:true,member:'valid'});
 const view=await r.page();
 assert.equal(view.renderedComponent,'default');
 assert.equal(r.calls.auth,1);assert.deepEqual(r.calls.redirects,[]);
});
test('enabled, session database failed: no render and no false sign-in success',async()=>{
 const r=nativePage({enabled:true,member:'db_error'});
 await assert.rejects(r.page(),/DATABASE_UNAVAILABLE/);
 assert.equal(r.calls.auth,1);assert.deepEqual(r.calls.redirects,[]);
});
