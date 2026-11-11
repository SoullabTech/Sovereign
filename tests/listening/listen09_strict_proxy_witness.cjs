/** LISTEN-09: exact-route strict proxy acceptance gate against DISPOSABLE localhost.
 * Requires separately started Next 16.3.8 with original proxy.ts and source-owned
 * access matrix + ONE TEST-ONLY /listen exact authenticated rule, fictional PG14.
 *
 * LISTEN09_MODE=enabled|disabled node tests/listening/listen09_strict_proxy_witness.cjs
 * Never run against public/live Soullab: this hard-codes loopback only.
 */
'use strict';
const url='http://127.0.0.1:43277',route='/listen';
const A='fictional-listen08-cookie-A',A2='fictional-listen08-header-A2';
const B='fictional-listen08-header-B',rev='fictional-listen08-revoked',exp='fictional-listen08-expired';
const cookie=t=>({Cookie:'maia_session='+t}),header=t=>({'x-session-token':t}),dual=(c,h)=>({...cookie(c),...header(h)});
const mode=process.env.LISTEN09_MODE;
if(!['enabled','disabled'].includes(mode))throw Error('Explicit LISTEN09_MODE required');
const available=[
 ['anonymous',{},route,'redirect'],
 ['cookie-A',cookie(A),route,'render'],
 ['header-B',header(B),route,'render'],
 ['matching-same-token',dual(A,A),route,'render'],
 ['matching-distinct-token-same-member',dual(A,A2),route,'render'],
 ['conflicting-member-IDs',dual(A,B),route,'redirect'],
 ['revoked-cookie-valid-header',dual(rev,B),route,'redirect'],
 ['valid-cookie-revoked-header',dual(A,rev),route,'redirect'],
 ['expired-header',header(exp),route,'redirect'],
 ['expired-cookie-valid-header',dual(exp,B),route,'redirect'],
 ['valid-cookie-expired-header',dual(A,exp),route,'redirect'],
 ['empty-cookie-valid-header',dual('',B),route,'redirect'],
 ['valid-cookie-empty-header',dual(A,''),route,'redirect'],
 ['forged-member-claim',{...cookie(A),'x-member-id':'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'},route,'redirect'],
 ['forged-role-and-tier-headers',{...cookie(A),'x-access-roles':'admin','x-access-tier':'pro'},route,'render'],
 ['tier-cookie-is-not-session',{Cookie:'maia_tier=pro;maia_roles=admin'},route,'redirect'],
 ['capacitator-claim-is-not-session',{'x-capacitor-app':'true'},route,'redirect'],
 ['query-token-is-not-page-session',{},route+'?_t='+encodeURIComponent(A),'redirect'],
 ['untrusted-origin-is-not-session',{Origin:'capacitor://localhost'},route,'redirect'],
 ['adjacent-route-must-not-be-admitted',cookie(A),'/listen-extra','strict-404'],
 ['nested-route-must-not-be-admitted',cookie(A),'/listen/private','strict-404']
];
const disabled=[
 ['disabled-anonymous-pre-route-auth',{},route,'redirect'],
 ['disabled-authenticated-cookie',cookie(A),route,'404'],
 ['disabled-authenticated-header',header(B),route,'404'],
];
async function run([name,headers,path,expected]){
 const r=await fetch(url+path,{headers,redirect:'manual',signal:AbortSignal.timeout(20000)});
 const html=await r.text();
 const room=r.status===200&&html.includes('The Blue Hour')&&html.includes('Bring your collections');
 const signin=r.status===307&&(r.headers.get('location')||'').startsWith('/signin?next=');
 const strict404=r.status===404&&html.includes('not configured in the access matrix')&&!room;
 const hidden404=r.status===404&&!room;
 const actual=room?'render':signin?'redirect':strict404?'strict-404':hidden404?'404':'other';
 return {name,expected,status:r.status,actual,roomVisible:room,pass:actual===expected};
}
(async()=>{
 const cases=mode==='enabled'?available:disabled, results=[];
 for(const c of cases){try{results.push(await run(c))}catch(e){results.push({name:c[0],expected:c[3],actual:'error',error:String(e),pass:false})}}
 const passed=results.filter(r=>r.pass).length;
 console.log(JSON.stringify({mode,scope:'disposable-local-Next-with-real-proxy',status:passed===cases.length?'PASS':'HOLD',passed,total:cases.length,results},null,2));
 if(passed!==cases.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=2});
