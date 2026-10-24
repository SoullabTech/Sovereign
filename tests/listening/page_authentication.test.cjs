const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const pagePath=path.resolve(__dirname,'../../app/listen/page.tsx');
const compiled=ts.transpileModule(fs.readFileSync(pagePath,'utf8'),{fileName:pagePath,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
function nativePage(flag, authenticated) {
  const calls={auth:0,notFound:0};
  const exports={};const module={exports};
  const mockRequire=(name)=>{
    if(name==='next/navigation')return {notFound:()=>{calls.notFound++;throw new Error('NEXT_HTTP_404')}};
    if(name==='@/lib/auth/session')return {requireMemberId:async()=>{calls.auth++;if(!authenticated)throw new Error('AUTH_REQUIRED');return 'fictional-member'}};
    if(name==='./ListenRoom')return {__esModule:true,default:()=>null};
    if(name==='react/jsx-runtime')return {jsx:(component)=>({renderedComponent:component.name || 'default'})};
    throw new Error('Unrecognized module: '+name);
  };
  vm.runInNewContext(compiled,{require:mockRequire,exports,module,process:{env:flag?{SOULLAB_LISTEN_REVIEW_ENABLED:'1'}:{}},Object}, {timeout:2000});
  return {page:module.exports.default,calls};
}
test('disabled by default: route returns 404 without querying authentication',async()=>{
 const r=nativePage(false,false); await assert.rejects(r.page(),/NEXT_HTTP_404/); assert.deepEqual(r.calls,{auth:0,notFound:1});
});
test('enabled with invalid member: refuses to render',async()=>{
 const r=nativePage(true,false); await assert.rejects(r.page(),/AUTH_REQUIRED/);assert.deepEqual(r.calls,{auth:1,notFound:0});
});
test('enabled with fictional authenticated member: renders only after auth',async()=>{
 const r=nativePage(true,true);const view=await r.page();assert.equal(view.renderedComponent,'default');assert.deepEqual(r.calls,{auth:1,notFound:0});
});
