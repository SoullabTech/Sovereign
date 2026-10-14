/**
 * Physical iPhone Safari acceptance, fictional-only. Apple safaridriver must
 * already be running on the Mac loopback port 3787, with Remote Automation
 * enabled on the paired device. Browser traffic uses a short-lived TLS, one-use-entry, peer-pinned gateway.
 * Certificate exception is limited to this WebDriver test; no trust store change. Never use production
 * data, real identities, member files or model providers in this witness.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {randomUUID, createHash} = require('node:crypto');
const {Client} = require('pg');

const ALLOW = 'YES_FICTIONAL_PHONE_WRITING_ONLY';
if (process.env.WS_IPHONE_FICTIONAL_ONLY !== ALLOW) {
  console.error('REFUSE_FICTIONAL_ONLY_OPT_IN_REQUIRED'); process.exit(2);
}
const DB_NAME = 'maia_ws_beta_witness_20261007';
const DB_DSN = 'postgresql://soullab@127.0.0.1:5432/' + DB_NAME;
const LOCAL = 'http://127.0.0.1:3779';
const DRIVER = 'http://127.0.0.1:3787';
const MEMBER_IDS = [
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003',
];
const members = MEMBER_IDS.map((id,i)=>({
  id, i, work: randomUUID(), section: randomUUID(),
  token: 'FAKE_IPHONE_SESSION_' + randomUUID(),
  tag: 'FICTIONAL_IPHONE_WRITER_' + i,
  admitted: i<2,
}));
const checks=[];
function check(label, passed) {
  assert.equal(Boolean(passed),true,'CHECK_FAILED: '+label);
  checks.push(label);
  console.log('PASS',label);
}
const {createGate}=require('./ws-iphone-https-gateway-r6.cjs');
const certDir=fs.readFileSync('/tmp/ws-iphone-tls-r6-path','utf8').trim();
const gate=createGate({host:'192.168.4.21',port:3893,upstreamPort:3779,members,certDir});
const guard={entry_path:gate.entry};
const SITE=gate.origin;
let cleanupStarted=false;

let db,seeded=false,transaction=false,sid=null;
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
function sleep(ms) {return new Promise(resolve=>setTimeout(resolve,ms));}
async function driver(path,body,method,timeout=25000) {
  const response=await fetch(DRIVER+path,{
    method:method || (body===undefined?'GET':'POST'),
    headers:{'Content-Type':'application/json'},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
    signal:AbortSignal.timeout(timeout),
  });
  const parsed=await response.json().catch(()=>({value:{error:'unparseable-response'}}));
  const v=parsed.value;
  if(!response.ok || (v && v.error)) {
    throw Error('SafariDriver '+(v?.error || response.status)+' '+String(v?.message||'').slice(0,155));
  }
  return v;
}
async function nav(path) {
  await driver('/session/'+sid+'/url',{url:SITE+path},undefined,38000);
}
async function js(script,args=[]) {
  return driver('/session/'+sid+'/execute/sync',{script,args},undefined,22000);
}
async function wait(script,label,attempts=38) {
  let last;
  for(let i=0;i<attempts;i++){
    try {
      last=await js(script);
      if(last)return last;
    }catch{}
    await sleep(350);
  }
  throw Error('PHYSICAL_SAFARI_ELEMENT_TIMEOUT: '+label);
}
async function findCSS(selector) {
  const v=await driver('/session/'+sid+'/element',{using:'css selector',value:selector},undefined,14000);
  const element=v['element-6066-11e4-a52e-4f735466cecf'];
  assert(element,'No WebDriver element');
  return element;
}
async function clickCSS(selector) {
  const mode=process.env.WS_IPHONE_TAP_MODE || 'native';
  assert(['native','scripted-dom-click'].includes(mode),'Unknown tap mode');
  if(mode==='scripted-dom-click'){
    const activated=await js("const b=document.querySelector(arguments[0]);if(!b)return false;b.click();return true;",[selector]);
    assert.equal(activated,true,'scripted control not found');
    return;
  }
  const element=await findCSS(selector);
  await driver('/session/'+sid+'/element/'+element+'/click',{},undefined,18000);
}
async function addMemberCookie(token){
  await driver('/session/'+sid+'/cookie',{cookie:{
    name:'maia_session',value:token,path:'/',sameSite:'Lax',secure:true
  }},undefined,14000);
}
async function localAPI(token,method,path,payload) {
  const response=await fetch(LOCAL+path,{
    method,redirect:'manual',headers:{
      'x-session-token':token,
      accept:'application/json',
      ...(payload===undefined?{}:{'content-type':'application/json'}),
    },
    ...(payload===undefined?{}:{body:JSON.stringify(payload)}),
    signal:AbortSignal.timeout(28000),
  });
  return {status:response.status,body:await response.json().catch(()=>null)};
}
async function seed() {
  await db.query('BEGIN'); transaction=true;
  for(const w of members){
    await db.query(
      'INSERT INTO members (id,passkey,username,password_hash,name,admin_role,tier,roles) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [w.id,'FAKE-'+w.id,'fake-'+w.id,'not-a-real-password',w.tag,null,'pro',['member']]
    );
    await db.query(
      "INSERT INTO auth_sessions (member_id,session_token,expires_at,revoked) VALUES ($1,$2,now()+interval '30 minutes',false)",
      [w.id,w.token]
    );
    await db.query(
      'INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)',
      [w.work,w.id,'R8 Fictional Writer '+w.i]
    );
    await db.query(
      "INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,0,'Opening',1,'markdown',$3)",
      [w.section,w.work,'A FICTIONAL original paragraph. Second invented line.']
    );
    await db.query(
      "INSERT INTO ops_contacts (name,member_id,contact_type,pipeline_stage) VALUES ($1,$2,'beta_tester','active')",
      [w.tag,w.id]
    );
  }
  await db.query('COMMIT');transaction=false;seeded=true;
  for(const w of members.slice(0,2)){
    const created=await localAPI(w.token,'POST','/api/sovereign/manuscripts/'+w.work+'/draft');
    check('fictional writer '+w.i+' draft created',[200,201].includes(created.status));
    const previous=await localAPI(w.token,'GET','/api/sovereign/manuscripts/'+w.work+'/draft');
    check('fictional writer '+w.i+' draft structured',previous.status===200 && previous.body?.sections?.length===1);
    w.draftSections=[w.section,...previous.body.sections.map(s=>s.id)];
    const edited=previous.body.sections.map(s=>({id:s.id,text:s.text+'\nSYNTHETIC_WRITER_'+w.i+'_SAVED_INITIAL\n'}));
    const saved=await localAPI(w.token,'PUT','/api/sovereign/manuscripts/'+w.work+'/draft',{
      sections:edited,baseRevisionId:previous.body.revisionId,idempotencyKey:randomUUID()
    });
    check('fictional writer '+w.i+' draft seeded',saved.status===200);
  }
}
async function physicalSafari() {
  const made=await driver('/session',{
    capabilities:{alwaysMatch:{
      browserName:'safari',platformName:'iOS',
      'safari:useSimulator':false,'safari:deviceType':'iPhone',acceptInsecureCerts:true
    }}
  },undefined,38000);
  sid=made.sessionId;
  assert(sid,'No physical iPhone Safari session');
  check('actual physical iPhone Safari, not simulator',
    made.capabilities?.platformName==='iOS' &&
    made.capabilities?.['safari:useSimulator']===false);
  await nav(guard.entry_path);
  check('HTTPS secure browser context',await js("return window.isSecureContext && typeof crypto.randomUUID==='function';"));
  check('encrypted private LAN fictional bridge entered',
    await wait("return document.body?.innerText?.includes('SOULLAB_PRIVATE_FICTIONAL_BRIDGE_READY')||false",'bridge')===true);

  const first=members[0];
  await addMemberCookie(first.token);
  const cookieNames=(await driver('/session/'+sid+'/cookie')).map(c=>c.name);
  console.log('PHYSICAL_SAFARI_COOKIES',JSON.stringify({
    gate:cookieNames.includes('__Host-WS_FICTIONAL_BRIDGE'),
    author:cookieNames.includes('maia_session'),
  }));
  await nav('/writers-studio?mode=write&m='+first.work);
  const compiledApiOrigin=await wait("return typeof window.__apiBase==='string' && window.__apiBase.length ? window.__apiBase : ''",'exact compiled test API origin',35);
  check('physical Safari compiled API points only to the private bridge',compiledApiOrigin===SITE);
  const firstView=await js("return {path:location.pathname,ready:document.readyState,bodyChars:document.body?.innerText?.length||0,visibleMessage:document.body?.innerText?.slice(0,75)||'',scriptCount:document.querySelectorAll('script[src]').length,scriptOrigins:Array.from(document.querySelectorAll('script[src]')).slice(0,6).map(s=>new URL(s.src).origin),resourceCount:performance.getEntriesByType('resource').length,hasEditor:!!document.querySelector('[data-write-editor]'),hasRestricted:document.body?.innerText?.includes('limited')||false,hasSignin:document.body?.innerText?.includes('Sign in')||false,hasAppError:document.body?.innerText?.includes('Application error')||false};");
  console.log('PHYSICAL_SAFARI_FIRST_VIEW',JSON.stringify(firstView));
  const networkProbe=await driver('/session/'+sid+'/execute/async',{
    script:"var done=arguments[arguments.length-1];var scripts=Array.from(document.querySelectorAll('script[src]'));if(!scripts.length){done({status:-1});return;}fetch(scripts[0].src,{credentials:'include'}).then(r=>done({status:r.status,contentType:r.headers.get('content-type'),bodyChars:document.body?.innerText?.length||0})).catch(e=>done({status:0,error:e.name}));",
    args:[]
  },undefined,16000).catch(e=>({status:0,error:e.name}));
  console.log('PHYSICAL_SAFARI_ASSET_NETWORK',JSON.stringify(networkProbe));
  const betaProbe=await driver('/session/'+sid+'/execute/async',{
    script:"var done=arguments[arguments.length-1];fetch('/api/sovereign/writers-studio/beta-access',{credentials:'include'}).then(async r=>{var j=await r.json().catch(()=>({}));done({status:r.status,eligible:j.eligible===true});}).catch(e=>done({error:e.name}));",
    args:[]
  },undefined,16000).catch(e=>({error:e.name}));
  console.log('PHYSICAL_SAFARI_BETA_ACCESS',JSON.stringify(betaProbe));
  try {
    await wait("return document.querySelector('[data-write-editor][contenteditable=\"plaintext-only\"]')?.innerText?.includes('SYNTHETIC_WRITER_0_SAVED_INITIAL')||false",'first writer');
  } catch(error) {
    const finalView=await js("return {path:location.pathname,text:document.body?.innerText?.slice(0,280)||'',scriptCount:document.querySelectorAll('script[src]').length,editorCount:document.querySelectorAll('[data-write-editor]').length,bodyChars:document.body?.innerText?.length||0};").catch(()=>({diagnosticUnavailable:true}));
    console.log('PHYSICAL_SAFARI_FINAL_VIEW',JSON.stringify(finalView));
    throw error;
  }
  check('iPhone actual Write editor loads first author',true);
  const editorSelector='[data-write-editor][contenteditable="plaintext-only"]';
  const editor=await findCSS(editorSelector);
  await driver('/session/'+sid+'/element/'+editor+'/click',{},undefined,18000);
  const marker='R8_APPROVED_FICTIONAL_AUTHOR_EDIT';
  assert.equal(process.env.WS_IPHONE_INPUT_MODE,'scripted-input-event','Explicit browser editing mode required; not physical keystroke acceptance');
  const edited=await js("const e=document.querySelector('[data-write-editor]');e.focus();const sel=window.getSelection();sel.selectAllChildren(e);sel.collapseToEnd();const ok=document.execCommand('insertText',false,arguments[0]);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:arguments[0]}));e.blur();return ok;",[' '+marker]);
  check('Safari scripted editor input accepted (not native keyboard)',edited===true);
  await sleep(1200);
  const inputDiagnostic=await js("return {editorText:document.querySelector('[data-write-editor]')?.innerText?.slice(-240)||'',activeTag:document.activeElement?.tagName,activeRole:document.activeElement?.getAttribute('role'),editable:document.querySelector('[data-write-editor]')?.contentEditable,selection:window.getSelection()?.anchorOffset};");
  console.log('FICTIONAL_NATIVE_INPUT_DIAGNOSTIC',JSON.stringify(inputDiagnostic));
  await wait("return document.querySelector('[data-write-editor]')?.innerText?.includes('R8_APPROVED_FICTIONAL_AUTHOR_EDIT')||false",'typed passage',16);
  check('physical iPhone browser editing updated manuscript',true);
  let saved=false;
  for(let i=0;i<30;i++){
    const draft=await localAPI(first.token,'GET','/api/sovereign/manuscripts/'+first.work+'/draft');
    if(draft.status===200 && draft.body?.content?.includes(marker)){saved=true;break;}
    await sleep(550);
  }
  if(!saved)console.log('SCRIPTED_SAVE_DIAGNOSTIC',JSON.stringify(await js("return {text:document.body.innerText.slice(-280),inputTarget:document.activeElement?.tagName};")));
  check('physical iPhone edit persisted durably in own draft',saved);
  const tapDiagnostic=await js("const b=document.querySelector('[data-device-copy] button.p4r1-device-copy-trigger');const r=b.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {button:{x:r.x,y:r.y,w:r.width,h:r.height},viewport:{w:innerWidth,h:innerHeight,visualH:visualViewport?.height,offsetTop:visualViewport?.offsetTop},hit:{tag:h?.tagName,cls:h?.className,text:h?.innerText?.slice(0,80)},buttonVisible:getComputedStyle(b).visibility,buttonDisplay:getComputedStyle(b).display};");
  console.log('PHYSICAL_SAVE_COPY_HIT_TEST',JSON.stringify(tapDiagnostic));
  check('Save a copy native hit target is not covered by Theme',
    await js("const b=document.querySelector('[data-device-copy] button.p4r1-device-copy-trigger');const r=b.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!h && (h===b || b.contains(h));"));
  // Observe the real generated Blob without replacing the actual native tap
  // or preventing the browser's download. This is NOT on-disk file verification.
  await js("window.__r8CopyBlobs=[];window.__r8CopyName=null;const make=URL.createObjectURL.bind(URL);URL.createObjectURL=function(b){const u=make(b);if(b instanceof Blob && b.type.startsWith('text/plain'))window.__r8CopyBlobs.push(b.text().then(text=>({text,bytes:b.size,mime:b.type})));return u;};document.addEventListener('click',function(e){const a=e.target?.closest?.('a[download]');if(a)window.__r8CopyName=a.download;},true);return true;");
  await clickCSS('[data-device-copy] button.p4r1-device-copy-trigger');
  await wait("return Boolean(document.querySelector('#p4r1-device-copy-menu button'))",'device copy menu',15);
  check('iPhone Safari opens Save a copy menu ('+(process.env.WS_IPHONE_TAP_MODE||'native')+')',true);
  await clickCSS('#p4r1-device-copy-menu button');
  await wait("return document.querySelector('[data-device-copy] [role=status]')?.innerText?.includes('Download requested')||false",'save copy request',14);
  check('iPhone Safari requested TXT device copy ('+(process.env.WS_IPHONE_TAP_MODE||'native')+')',true);
  const produced=await driver('/session/'+sid+'/execute/async',{
    script:"const done=arguments[arguments.length-1];Promise.all(window.__r8CopyBlobs||[]).then(blobs=>done({blobs,name:window.__r8CopyName})).catch(e=>done({error:e.name}));",args:[]
  },undefined,18000);
  check('iPhone TXT generation produced one real Blob',produced?.blobs?.length===1);
  const generated=produced.blobs[0];
  check('generated TXT contains latest fictional author edit',generated.text.includes(marker));
  check('generated TXT excludes the other fictional writer',!generated.text.includes('SYNTHETIC_WRITER_1'));
  check('generated TXT filename is the intended fictional work',produced.name==='R8 Fictional Writer 0-writer-copy.txt');
  const context=await localAPI(first.token,'GET','/api/writers-studio/rebuild/context?manuscriptId='+first.work);
  assert.equal(context.status,200,'owner copy context not available');
  assert(Array.isArray(context.body?.sections),'owner section contract not present');
  let expected='';
  for(const section of [...context.body.sections].sort((a,b)=>a.position-b.position)){
    const prefix=typeof section.headingPrefix==='string'?section.headingPrefix:section.heading?section.heading+'\n\n':'';
    const segment=prefix+section.body;
    if(!segment)continue;
    if(expected)expected+=expected.endsWith('\n\n')?'':expected.endsWith('\n')?'\n':'\n\n';
    expected+=segment;
  }
  check('generated TXT exactly matches complete saved fictional manuscript',sha(generated.text)===sha(expected));
  console.log('GENERATED_TXT_WITNESS',JSON.stringify({filename:produced.name,bytes:generated.bytes,sha256:sha(generated.text),onDeviceFileRead:false}));

  // Browser download storage remains user-controlled; not claim file present in Files.
  await nav('/writers-studio?mode=review&m='+first.work);
  await wait("return document.body && document.body.innerText.length>140",'Review');
  check('physical Safari Review room visible',true);
  await nav('/writers-studio?mode=write&m='+first.work);
  await driver('/session/'+sid+'/refresh',{},undefined,25000);
  await wait("return document.querySelector('[data-write-editor]')?.innerText?.includes('R8_APPROVED_FICTIONAL_AUTHOR_EDIT')||false",'persisted edit after return and refresh');
  check('physical Safari reopens and reloads saved edited writing',true);


  // Browser account-switch negative: replace only the fictional session cookie,
  // preserving the test tab and caches to catch stale cross-member manuscript UI.
  await driver('/session/'+sid+'/cookie/maia_session',undefined,'DELETE',12000);
  await addMemberCookie(members[1].token);
  await nav('/writers-studio?mode=write&m='+members[0].work);
  await wait("return document.body?.innerText?.includes('could not read this manuscript')||false",'foreign author refusal is rendered');
  const leaked=await js("return document.body?.innerText?.includes('R8_APPROVED_FICTIONAL_AUTHOR_EDIT')||false");
  check('second writer cannot see first writer edits',!leaked);
  const refused=await localAPI(members[1].token,'GET','/api/sovereign/manuscripts/'+first.work+'/draft');
  check('second writer denied owner draft API',refused.status===404);
  await nav('/writers-studio?mode=write&m='+members[1].work);
  await wait("return document.querySelector('[data-write-editor]')?.innerText?.includes('SYNTHETIC_WRITER_1_SAVED_INITIAL')||false",'second writer');
  check('physical Safari second fiction-only writer opens own draft',true);
  check('second author own view excludes first author text',await js("return !document.body.innerText.includes('R8_APPROVED_FICTIONAL_AUTHOR_EDIT');"));
  await db.query('UPDATE auth_sessions SET revoked=true WHERE member_id=$1',[members[1].id]);
  const revoked=await localAPI(members[1].token,'GET','/api/writers-studio/rebuild/context?manuscriptId='+members[1].work);
  check('revoked fictional writer session is refused',revoked.status===401);


  await driver('/session/'+sid+'/cookie/maia_session',undefined,'DELETE',12000);
  await addMemberCookie(members[2].token);
  await nav('/writers-studio?mode=home');
  const final=await driver('/session/'+sid+'/url');
  check('uninvited third account redirected away',String(final).includes('/writers-studio/beta-limited'));
  return {checks:checks.length,physicalIphone:true,fictionalOnly:true,generatedTxtContentVerified:true,actualCopyTapVerified:process.env.WS_IPHONE_TAP_MODE!=='scripted-dom-click',tapMethod:process.env.WS_IPHONE_TAP_MODE||'native',studioHostedOnPrivateLan:true,inputMethod:"scripted-input-event",nativeKeystrokesVerified:false,deviceFilePresenceVerified:false,realMember:false,productionDeployed:false};
}
async function cleanup(){
  if(cleanupStarted)return;cleanupStarted=true;
  if(sid){
    try{await driver('/session/'+sid,undefined,'DELETE',12000);console.log('PHYSICAL_SAFARI_TEST_SESSION_CLOSED');}
    catch(e){console.error('PHYSICAL_SAFARI_CLOSE_UNVERIFIED',e.name);}
  }
  await gate.close();
  console.log('ENCRYPTED_FIXTURE_GATE_CLOSED');
  if(!db)return;
  try{
    if(transaction){await db.query('ROLLBACK').catch(()=>{});transaction=false;}
    if(seeded){
      const ids=members.map(w=>w.id), works=members.map(w=>w.work);
      await db.query('BEGIN');transaction=true;
      await db.query('DELETE FROM working_draft_revisions WHERE draft_id IN (SELECT id FROM manuscript_working_drafts WHERE manuscript_id = ANY($1::uuid[]))',[works]);
      await db.query('DELETE FROM manuscript_draft_sections WHERE draft_id IN (SELECT id FROM manuscript_working_drafts WHERE manuscript_id = ANY($1::uuid[]))',[works]);
      await db.query('DELETE FROM manuscript_working_drafts WHERE manuscript_id = ANY($1::uuid[])',[works]);
      await db.query('DELETE FROM manuscript_sections WHERE manuscript_id = ANY($1::uuid[])',[works]);
      await db.query('DELETE FROM member_manuscripts WHERE id = ANY($1::uuid[])',[works]);
      await db.query('DELETE FROM ops_contacts WHERE member_id = ANY($1::uuid[])',[ids]);
      await db.query('DELETE FROM auth_sessions WHERE member_id = ANY($1::uuid[])',[ids]);
      await db.query('DELETE FROM members WHERE id = ANY($1::uuid[])',[ids]);
      await db.query('COMMIT');transaction=false;
      const left=(await db.query('SELECT count(*)::int AS n FROM members WHERE id = ANY($1::uuid[])',[ids])).rows[0].n;
      check('fictional database cleanup complete',left===0);
    }
  }catch(e){
    if(transaction)await db.query('ROLLBACK').catch(()=>{});
    console.error('FICTIONAL_CLEANUP_HOLD',e.name,String(e.message).slice(0,120));
    process.exitCode=1;
  }
  await db.end().catch(()=>{});
}
process.once('SIGTERM',()=>{process.exitCode=1;cleanup().finally(()=>process.exit(1));});
setTimeout(()=>{console.error('BOUNDED_PHONE_TEST_TIMEOUT');process.exitCode=1;cleanup().finally(()=>process.exit(1));},360000).unref();
(async()=>{
  let result=null;
  try{
    db=new Client({connectionString:DB_DSN,connectionTimeoutMillis:4000});
    await db.connect();
    const actual=(await db.query('SELECT current_database() AS name,host(inet_server_addr()) AS address,inet_server_port() AS port')).rows[0];
    assert.deepEqual(actual,{name:DB_NAME,address:'127.0.0.1',port:5432},'REFUSE wrong DB');
    check('strict fictional localhost PostgreSQL target',true);
    const existing=(await db.query('SELECT count(*)::int AS n FROM members WHERE id = ANY($1::uuid[])',[MEMBER_IDS])).rows[0].n;
    assert.equal(existing,0,'REFUSE fixture collision');
    await gate.start();
    console.log('ENCRYPTED_FIXTURE_GATE_READY');
    await seed();
    result=await physicalSafari();
  }catch(e){
    console.error('PHYSICAL_IPHONE_WRITER_HOLD',e.name,String(e.message).slice(0,300));
    process.exitCode=1;
  }finally{await cleanup();}
  if(result && !process.exitCode)console.log('PHYSICAL_IPHONE_WRITER_ACCEPTANCE',JSON.stringify({...result,encryptedLan:true,temporaryTestCertificateException:true,checks:checks.length,cleanupVerified:true}));
})();
