/** LISTEN-08 · Read-only local Next.js + fictional PostgreSQL HTTP gate witness.
 * Bounded to http://127.0.0.1:43277/listen. Do not run against real members,
 * installed Soullab, cloud endpoints, or production credentials.
 * Usage: LISTEN08_GATE_MODE=secured|disabled node tests/listening/listen08_http_gate_witness.cjs
 * Fails if the tested candidate is unsafe; no server or database is started.
 */
'use strict';
const url='http://127.0.0.1:43277/listen';
const mode=process.env.LISTEN08_GATE_MODE;
if(!['secured','disabled'].includes(mode))throw Error('Explicit LISTEN08_GATE_MODE=secured or disabled required');
const a='fictional-listen08-cookie-A', a2='fictional-listen08-header-A2';
const b='fictional-listen08-header-B',revoked='fictional-listen08-revoked';
const expired='fictional-listen08-expired';
const ck=value=>({Cookie:'maia_session='+value});
const hh=value=>({'x-session-token':value});
const both=(cookie,header)=>({...ck(cookie),...hh(header)});
const cases=mode==='disabled'?[
 {name:'disabled-anonymous',headers:{},expected:'404'},
 {name:'disabled-cookie',headers:ck(a),expected:'404'},
 {name:'disabled-header',headers:hh(b),expected:'404'}
]:[
 {name:'anonymous',headers:{},expected:'redirect'},
 {name:'cookie-only',headers:ck(a),expected:'render'},
 {name:'header-only',headers:hh(b),expected:'render'},
 {name:'same-token-dual',headers:both(a,a),expected:'render'},
 {name:'same-member-different-token',headers:both(a,a2),expected:'render'},
 {name:'conflicting-identities',headers:both(a,b),expected:'redirect'},
 {name:'revoked-cookie-valid-header',headers:both(revoked,b),expected:'redirect'},
 {name:'valid-cookie-revoked-header',headers:both(a,revoked),expected:'redirect'},
 {name:'expired-header',headers:hh(expired),expected:'redirect'},
 {name:'expired-cookie-valid-header',headers:both(expired,b),expected:'redirect'},
 {name:'valid-cookie-expired-header',headers:both(a,expired),expected:'redirect'},
 {name:'empty-cookie-valid-header',headers:both('',b),expected:'redirect'},
 {name:'valid-cookie-empty-header',headers:both(a,''),expected:'redirect'},
];
(async()=>{
 const results=[];
 for(const item of cases){
  try{
   const response=await fetch(url,{headers:item.headers,redirect:'manual',signal:AbortSignal.timeout(18000)});
   const html=await response.text();
   const room=html.includes('The Blue Hour')&&html.includes('Bring your collections');
   const redirect=response.status===307&&(response.headers.get('location')||'').startsWith('/signin?next=');
   const outcome=room&&response.status===200?'render':redirect?'redirect':response.status===404&&!room?'404':'other';
   results.push({name:item.name,expected:item.expected,status:response.status,outcome,pass:item.expected===outcome});
  }catch(error){results.push({name:item.name,expected:item.expected,outcome:'error',error:String(error),pass:false});}
 }
 const passed=results.filter(r=>r.pass).length;
 console.log(JSON.stringify({mode,fixture:'local Next 16.3.8 + fictional PG14 only',status:passed===results.length?'PASS':'HOLD',passed,total:results.length,results},null,2));
 if(passed!==results.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=2});
