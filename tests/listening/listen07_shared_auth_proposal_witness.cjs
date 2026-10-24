/** LISTEN-07: Pure in-memory proposed shared auth correction. NO SOURCE WRITES.
 * This is not an approved shared auth patch, nor PostgreSQL/Next/WebKit acceptance.
 * node tests/listening/listen07_shared_auth_proposal_witness.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {stripTypeScriptTypes}=require('node:module');
const sourcePath=path.resolve(__dirname,'../../lib/auth/session.ts');
const original=fs.readFileSync(sourcePath,'utf8');
const checksum=crypto.createHash('sha256').update(original).digest('hex');
const expectedPin='6e37552f56410dd1e045d570d93b0421aa29a62bf79024b947fc4ac7ee7a20d4';
if(checksum!==expectedPin)throw new Error('Shared auth source has changed; refuse to apply an in-memory candidate to an unknown version: '+checksum);
const beginning='export async function requireMemberId(): Promise<string> {';
const ending='\n/**\n * Validate a session token';
const from=original.indexOf(beginning),to=original.indexOf(ending,from);
if(from<0||to<0||to<=from)throw new Error('Unrecognized shared auth function boundary. No candidate generated.');
const replacement=[
 'export async function requireMemberId(): Promise<string> {',
 '  const cookieStore = await cookies();',
 '  const headerStore = await headers();',
 "  const cookieEntry = cookieStore.get('maia_session');",
 "  const headerValue = headerStore.get('x-session-token');",
 '  const cookiePresent = cookieEntry !== null && cookieEntry !== undefined;',
 '  const headerPresent = headerValue !== null && headerValue !== undefined;',
 '  if (cookiePresent && headerPresent) {',
 '    const cookieToken = cookieEntry?.value;',
 "    if (!cookieToken || !headerValue) throw new Error('AUTH_REQUIRED');",
 '    const cookieMember = await validateSessionToken(cookieToken);',
 "    if (!cookieMember) throw new Error('AUTH_REQUIRED');",
 '    const headerMember = headerValue === cookieToken ? cookieMember : await validateSessionToken(headerValue);',
 '    if (headerMember && headerMember === cookieMember) return cookieMember;',
 "    throw new Error('AUTH_REQUIRED');",
 '  }',
 '  if (cookiePresent) {',
 '    const cookieToken = cookieEntry?.value;',
 "    if (!cookieToken) throw new Error('AUTH_REQUIRED');",
 '    const member = await validateSessionToken(cookieToken);',
 '    if (member) return member;',
 '  } else if (headerPresent) {',
 "    if (!headerValue) throw new Error('AUTH_REQUIRED');",
 '    const member = await validateSessionToken(headerValue);',
 '    if (member) return member;',
 '  }',
 "  throw new Error('AUTH_REQUIRED');",
 '}',
 ''
].join('\n');
const candidate=original.slice(0,from)+replacement+original.slice(to);
const scenarios=[
 {name:'valid-cookie-only',cookie:'A',header:null,want:'member-A'},
 {name:'valid-header-only',cookie:null,header:'B',want:'member-B'},
 {name:'identical-dual-tokens',cookie:'A',header:'A',want:'member-A'},
 {name:'distinct-valid-tokens-same-member',cookie:'A',header:'A2',want:'member-A'},
 {name:'conflicting-valid-members',cookie:'A',header:'B',want:'AUTH_REQUIRED'},
 {name:'invalid-cookie-valid-header',cookie:'INVALID',header:'B',want:'AUTH_REQUIRED'},
 {name:'valid-cookie-invalid-header',cookie:'A',header:'INVALID',want:'AUTH_REQUIRED'},
 {name:'both-invalid',cookie:'INVALID',header:'REVOKED',want:'AUTH_REQUIRED'},
 {name:'neither-present',cookie:null,header:null,want:'AUTH_REQUIRED'},
 {name:'empty-cookie-with-valid-header',cookie:'',header:'B',want:'AUTH_REQUIRED'},
 {name:'valid-cookie-empty-header',cookie:'A',header:'',want:'AUTH_REQUIRED'},
 {name:'session-db-error-denies',cookie:'A',header:'B',dbDown:true,want:'DENIED'},
];
function harness(source,scenario){
 const js=stripTypeScriptTypes(source).split('\n').filter(l=>!/^import\s/.test(l)).join('\n').replace(/^export\s/gm,'');
 const c={
  cookies:async()=>({get:()=>scenario.cookie==null?undefined:{value:scenario.cookie}}),
  headers:async()=>({get:()=>scenario.header}),
  query:async(_sql,[token])=>{
    if(scenario.dbDown)throw new Error('DATABASE_UNAVAILABLE');
    const member=token==='A'||token==='A2'?'member-A':token==='B'?'member-B':null;
    return {rows:member?[{member_id:member}]:[]};
  }
 };
 vm.createContext(c);
 vm.runInContext(js+';this.testRequireMemberId=requireMemberId;',c,{timeout:1000});
 return c.testRequireMemberId().then(member=>member).catch(e=>String(e?.message||e));
}
(async()=>{
 let candidatesPassed=0;
 for(const s of scenarios){
  const actual=await harness(candidate,s);
  const admitted=actual.startsWith('member-');
  const expectedDeny=s.want==='DENIED';
  const pass=expectedDeny?!admitted:actual===s.want;
  if(pass)candidatesPassed++;
  console.log((pass?'PASS':'FAIL')+' '+s.name+' -> '+actual+' (expected '+s.want+')');
 }
 const originalFailures=[];
 for(const s of scenarios){
  const actual=await harness(original,s);
  if(s.want==='DENIED'?actual.startsWith('member-'):actual!==s.want)originalFailures.push(s.name);
 }
 console.log('RESULT '+JSON.stringify({
  pin:checksum,candidatePassed:candidatesPassed,total:scenarios.length,originalDefects:originalFailures,
  application:'IN_MEMORY_ONLY',authorizedSharedSourceChanges:0
 }));
 if(candidatesPassed!==scenarios.length||originalFailures.length<3)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=2});
