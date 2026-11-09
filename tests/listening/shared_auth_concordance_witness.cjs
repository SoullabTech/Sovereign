/** LISTEN-06: read-only fictional session concordance gate.
 * Run explicitly with Node 22+: node tests/listening/shared_auth_concordance_witness.cjs
 * Nonzero status means member admission remains HOLD. No database/network access.
 */
'use strict';
const fs=require('node:fs'), path=require('node:path'),vm=require('node:vm');
const {stripTypeScriptTypes}=require('node:module');
const {createHash}=require('node:crypto');
const file=path.resolve(__dirname,'../../lib/auth/session.ts');
const original=fs.readFileSync(file,'utf8');
const sha256=createHash('sha256').update(original).digest('hex');
const js=stripTypeScriptTypes(original).split('\n')
  .filter(line=>!/^import\s/.test(line)).join('\n').replace(/^export\s/gm,'');
const scenarios=[
 {name:'cookie-only',cookie:'token-A',header:null,want:'member-A'},
 {name:'header-only',cookie:null,header:'token-B',want:'member-B'},
 {name:'matching-credentials',cookie:'token-A',header:'token-A',want:'member-A'},
 {name:'conflicting-credentials',cookie:'token-A',header:'token-B',want:'AUTH_REQUIRED'},
 {name:'invalid-cookie-valid-header',cookie:'token-revoked',header:'token-B',want:'AUTH_REQUIRED'},
 {name:'valid-cookie-invalid-header',cookie:'token-A',header:'token-revoked',want:'AUTH_REQUIRED'},
 {name:'both-invalid',cookie:'token-revoked',header:'token-expired',want:'AUTH_REQUIRED'},
 {name:'no-credentials',cookie:null,header:null,want:'AUTH_REQUIRED'},
];
async function run(s){
 const ctx={
  cookies:async()=>({get:key=>key==='maia_session'&&s.cookie?{value:s.cookie}:undefined}),
  headers:async()=>({get:key=>key==='x-session-token'?s.header:null}),
  query:async(_sql,params)=>({rows:params[0]==='token-A'?[{member_id:'member-A'}]:params[0]==='token-B'?[{member_id:'member-B'}]:[]}),
 };
 vm.createContext(ctx);vm.runInContext(js+';this.__requireMemberId=requireMemberId;',ctx,{filename:file,timeout:2000});
 try{return await ctx.__requireMemberId()}catch(e){return String(e?.message||e)}
}
(async()=>{
 console.log('LISTEN-06 shared-session SHA256',sha256);
 let passed=0;
 for(const s of scenarios){const got=await run(s),ok=got===s.want;if(ok)passed++;
  console.log((ok?'PASS':'BLOCK')+' '+s.name+' expected='+s.want+' actual='+got);
 }
 console.log('SUMMARY',passed+'/'+scenarios.length);
 if(passed!==scenarios.length){console.error('HOLD: shared auth does not enforce same-member cookie/header agreement.');process.exitCode=2;}
})().catch(e=>{console.error('WITNESS_ERROR',e);process.exitCode=2});
