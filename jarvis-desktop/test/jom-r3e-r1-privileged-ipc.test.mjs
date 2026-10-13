import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const require=createRequire(import.meta.url);
const G=require('../src/privileged-ipc-guard.js');
const SOURCE=path.resolve(import.meta.dirname, '../src');
const URL='file:///synthetic/JARVIS/app.asar/src/index.html';
function fakeWindow(url=URL){
  const listeners={};
  const frame={url};
  const wc={
    mainFrame:frame,getURL:()=>url,isDestroyed:()=>false,
    on:(name,fn)=>{listeners[name]=fn;},
    setWindowOpenHandler:(fn)=>{wc.openHandler=fn;}
  };
  const win={webContents:wc,isDestroyed:()=>false,isFocused:()=>true};
  return {win,frame,wc,listeners,event:{sender:wc,senderFrame:frame}};
}
const original={
  work_unit_id:'synthetic-unit',
  source_revision:'a'.repeat(40),
  bound_revision:'a'.repeat(40),
  lifecycle_state:'EVIDENCE_READY',
  evidence_class:'E0_TASK_TEXT',
  route_digest:'sha256:synthetic-frozen',
  provider_id:'qwen-local',
  model_id:'qwen3-coder:30b',
  grant_id:'e1-'+'b'.repeat(32),
  grant_standing:'ACTIVE',
  network_external:false,provider_spend:false,disclosure:'none',
  subject:{route:'synthetic',grant:'active'}
};
function setup(override={}){
  const frame=fakeWindow();
  let context=JSON.parse(JSON.stringify(original));
  let performed=0;
  let shown=0;
  let options;
  const gate=G.createConsentBoundary(override);
  const invocation={
    event:frame.event,window:frame.win,expectedURL:URL,
    action:'canonical-adjudicate',workUnitId:original.work_unit_id,
    readContext:async()=>({ok:true,context}),
    present:async(o)=>{shown++;options=o;return {response:0};},
    perform:async()=>{performed++;return {ok:true,status:'SYNTHETIC_PERFORMED'};}
  };
  return {frame,gate,invocation,setContext:v=>{context=v;},
    getPerformed:()=>performed,getShown:()=>shown,getOptions:()=>options};
}

test('only exact main frame of expected main JARVIS window can request Work Unit actions',()=>{
  const x=fakeWindow();
  assert.equal(G.sameMainFrame(x.event,x.win,URL),true);
  assert.equal(G.sameMainFrame({...x.event,sender:{}},x.win,URL),false);
  assert.equal(G.sameMainFrame({...x.event,senderFrame:{url:URL}},x.win,URL),false);
  assert.equal(G.sameMainFrame({...x.event,senderFrame:{url:'https://evil.invalid'}},x.win,URL),false);
  assert.equal(G.sameMainFrame(x.event,x.win,'file:///synthetic/preferences.html'),false);
  assert.equal(G.sameMainFrame(null,x.win,URL),false);
  assert.equal(G.sameMainFrame(x.event,{...x.win,isDestroyed:()=>true},URL),false);
  assert.equal(G.sameMainFrame(x.event,{...x.win,webContents:{...x.wc,getURL:()=>URL+'?changed'}},URL),false);
});

test('navigation, new windows, subframes and webviews are denied',()=>{
  const x=fakeWindow();
  G.installLocalPagePolicy(x.win,URL);
  assert.deepEqual(x.wc.openHandler({url:'https://evil.invalid'}),{action:'deny'});
  let prevented=0;
  function ev(){return {preventDefault(){prevented++;}};}
  x.listeners['will-navigate'](ev(),URL);
  assert.equal(prevented,0);
  x.listeners['will-navigate'](ev(),'https://evil.invalid');
  x.listeners['will-redirect'](ev(),'file:///other.html');
  x.listeners['will-frame-navigate'](ev(),{url:URL,isMainFrame:false});
  x.listeners['will-attach-webview'](ev());
  assert.equal(prevented,4);
  x.listeners['will-frame-navigate'](ev(),{url:URL,isMainFrame:true});
  assert.equal(prevented,4);
});

test('main native confirmation is deny-by-default and must be explicit',async()=>{
  const s=setup();
  const result=await s.gate.guard(s.invocation);
  assert.equal(result.ok,true);
  assert.equal(s.getPerformed(),1);
  assert.equal(s.getShown(),1);
  assert.deepEqual(s.getOptions().buttons,['Approve once','Cancel']);
  assert.equal(s.getOptions().defaultId,1);
  assert.equal(s.getOptions().cancelId,1);
  assert.match(s.getOptions().detail,/Source revision: a/);
  assert.match(s.getOptions().detail,/Route digest: sha256:synthetic-frozen/);
  assert.match(s.getOptions().detail,/Provider: qwen-local/);
  assert.match(s.getOptions().detail,/Grant standing: ACTIVE/);
});

test('no approval from synthetic renderer bit, malformed event, or unknown work unit',async()=>{
  const s=setup();
  const bad={...s.invocation, event:{sender:{},senderFrame:{}},userApproved:true};
  let r=await s.gate.guard(bad);
  assert.equal(r.ok,false);
  assert.equal(s.getShown(),0);
  r=await s.gate.guard({...s.invocation,workUnitId:'../evil'});
  assert.equal(r.ok,false);
  assert.equal(s.getPerformed(),0);
});

test('declined, absent or thrown consent never acts',async()=>{
  const s=setup();
  for(const response of [1,null,undefined]){
    const r=await s.gate.guard({...s.invocation,present:async()=>response===null?null:response===undefined?undefined:{response}});
    assert.equal(r.ok,false);assert.equal(s.getPerformed(),0);
  }
  const failed=await s.gate.guard({...s.invocation,present:async()=>{throw new Error('simulated dialog failure');}});
  assert.equal(failed.ok,false);
  assert.equal(s.getPerformed(),0);
});

test('changed binding between prompt and approval is rejected',async()=>{
  const s=setup();
  const result=await s.gate.guard({...s.invocation,present:async()=>{
    s.setContext({...original,subject:{route:'changed',grant:'active'}});
    return {response:0};
  }});
  assert.equal(result.ok,false);
  assert.equal(result.reason,'APPROVAL_BOUND_STATE_CHANGED');
  assert.equal(s.getPerformed(),0);
});

test('expired native consent is refused and no backend side effect occurs',async()=>{
  let time=1000;
  const s=setup({now:()=>time,ttlMs:100});
  const r=await s.gate.guard({...s.invocation,present:async()=>{time=1101;return {response:0};}});
  assert.equal(r.ok,false);assert.equal(r.reason,'HUMAN_APPROVAL_EXPIRED_OR_REPLAYED');
  assert.equal(s.getPerformed(),0);
});

test('a changed sender frame after native confirmation fails closed',async()=>{
  const s=setup();
  const r=await s.gate.guard({...s.invocation,present:async()=>{
    s.frame.frame.url='file:///unexpected.html';return {response:0};
  }});
  assert.equal(r.ok,false);
  assert.equal(r.reason,'APPROVAL_SENDER_CHANGED');
  assert.equal(s.getPerformed(),0);
});

test('one approval prompt per work unit; concurrent duplicate cannot execute',async()=>{
  const s=setup();
  let openPrompt;
  const wait=new Promise(resolve=>{openPrompt=resolve;});
  const first=s.gate.guard({...s.invocation,present:()=>wait});
  const second=await s.gate.guard(s.invocation);
  assert.equal(second.ok,false);
  assert.equal(second.reason,'WORK_UNIT_APPROVAL_ALREADY_PENDING');
  assert.equal(s.getPerformed(),0);
  openPrompt({response:0});
  assert.equal((await first).ok,true);
  assert.equal(s.getPerformed(),1);
});

test('host-owned approval never grants final authority for unknown actions',async()=>{
  const s=setup();
  const r=await s.gate.guard({...s.invocation,action:'deploy',context:{model_authored:false}});
  assert.equal(r.ok,false);
  assert.equal(s.getPerformed(),0);
  assert.ok(G.CONSENT_ACTIONS.includes('canonical-confirm-execute'));
  assert.ok(!G.CONSENT_ACTIONS.includes('status'));
});

test('synthetic main IPC dispatcher rejects fake sender before any backend receives action',async()=>{
  const source=fs.readFileSync(path.join(SOURCE,'main.js'),'utf8');
  const begin=source.indexOf("ipcMain.handle('jarvis:work-unit-action', async (event, req) => {");
  assert.ok(begin>=0);
  const end=source.indexOf('\n});',begin);
  assert.ok(end>begin);
  const snippet=source.slice(begin,end+4);
  let dispatches=0;let dialogs=0;
  const frame=fakeWindow();
  const context={
    ipcMain:{handle(name,fn){assert.equal(name,'jarvis:work-unit-action');context.handle=fn;}},
    IPCGUARD:G,
    mainWindow:frame.win,
    __dirname:'/synthetic/JARVIS/app.asar/src',
    path:{join:(...v)=>v.join('/')},
    pathToFileURL:(x)=>({href:URL}),
    currentRoot:()=>'/synthetic/checkout',
    dispatchTrustedWorkUnitAction:async()=>{dispatches++;return {ok:true};},
    mainOwnedConsentContext:async()=>({ok:true,context:{...original,work_unit_id:'synthetic-unit'}}),
    dialog:{showMessageBox:async()=>{dialogs++;return {response:0};}},
    r3eConsent:G.createConsentBoundary()
  };
  vm.runInNewContext(snippet,context,{timeout:1000});
  const bad=await context.handle({senderFrame:{url:'https://evil.invalid'},sender:{}},
    {action:'canonical-adjudicate',work_unit_id:'synthetic-unit'});
  assert.equal(bad.ok,false);
  assert.equal(dispatches,0);assert.equal(dialogs,0);
  const good=await context.handle(frame.event,
    {action:'canonical-adjudicate',work_unit_id:'synthetic-unit'});
  assert.equal(good.ok,true);assert.equal(dispatches,1);assert.equal(dialogs,1);
});

test('CSP keeps external scripts and connections disallowed while allowing local scripts/styles',()=>{
  const html=fs.readFileSync(path.join(SOURCE,'index.html'),'utf8');
  assert.match(html,/Content-Security-Policy/);
  assert.match(html,/default-src 'none'/);
  assert.match(html,/script-src 'self'/);
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/style-src 'unsafe-inline'/);
  assert.doesNotMatch(html,/<script\b(?![^>]*\bsrc=)/i);
});

test('main derives canonical approval context from the Work Unit, route and exact grant rather than renderer claims',async()=>{
  const source=fs.readFileSync(path.join(SOURCE,'main.js'),'utf8');
  const start=source.indexOf('async function mainOwnedConsentContext(root, req, action) {');
  const end=source.indexOf('\nconst r3eConsent =',start);
  assert.ok(start>=0&&end>start);
  const impl=source.slice(start,end);
  const grantId='e1-'+'b'.repeat(32);
  const snap={
    ok:true,work_unit:{
      scope:{base_ref:'b'.repeat(40)},
      state:{lifecycle_state:'ROUTED'},
      custody:{evidence_class:'E1_REPOSITORY_LOCAL'},
      authority:{network_external:false,provider_spend:false,external_disclosure:'none'}
    },
    routing:{route_digest:'sha256:route-bound',participants:[{participant_id:'primary',transport_bindings:[{
      provider_id:'qwen-local',model_id:'qwen3-coder:30b',readiness:{status:'READY'}
    }]}]},
    execution_bridge:{grants:[{
      standing:'ACTIVE',grant:{grant_id:grantId,transport_binding:{provider_id:'qwen-local',model_id:'qwen3-coder:30b'}}
    }]},
    provenance:{attempts:[]}
  };
  const ctx={
    CWUV2:{existsCanonicalV2:()=>true},
    WUC:{canonicalExecutionStatus:async()=>snap},
    currentCanonicalSha:()=>original.source_revision,
    desktopHumanActorId:()=> 'human:synthetic',
    process:{env:{}}
  };
  vm.runInNewContext(impl,ctx,{timeout:1000});
  const req={action:'canonical-confirm-execute',work_unit_id:'synthetic-unit',
    grant_id:grantId,model_authored:true,
    provider_id:'evil-override',authority:{network_external:true,provider_spend:true}};
  const r=await ctx.mainOwnedConsentContext('/synthetic/repo',req,'canonical-confirm-execute');
  assert.equal(r.ok,true);
  assert.equal(r.context.source_revision,original.source_revision);
  assert.equal(r.context.bound_revision,'b'.repeat(40));
  assert.equal(r.context.route_digest,'sha256:route-bound');
  assert.equal(r.context.provider_id,'qwen-local');
  assert.equal(r.context.model_id,'qwen3-coder:30b');
  assert.equal(r.context.network_external,false);
  assert.equal(r.context.provider_spend,false);
  assert.equal(r.context.grant_standing,'ACTIVE');
  assert.equal(r.context.grant_id,grantId);
});

test('legacy status maps actual permission envelope and source binding for approval',async()=>{
  const source=fs.readFileSync(path.join(SOURCE,'main.js'),'utf8');
  const start=source.indexOf('async function mainOwnedConsentContext(root, req, action) {');
  const end=source.indexOf('\nconst r3eConsent =',start);
  const impl=source.slice(start,end);
  const ctx={
    CWUV2:{existsCanonicalV2:()=>false},
    WUC:{status:async()=>({ok:true,work_unit:{
      workspace:{canonical_sha:'c'.repeat(40)},lifecycle_state:'routed',
      permission_envelope:{external_network:true,provider_spend:true},
      authority:{authorized_acts:['network.external','provider.spend']}
    },routing_intelligence:{route_digest:'sha256:legacy-route',evidence_class:'E0_TASK_TEXT'},
    execution_grants:[]})},
    currentCanonicalSha:()=>original.source_revision,
    desktopHumanActorId:()=> 'human:synthetic',
    process:{env:{}}
  };
  vm.runInNewContext(impl,ctx,{timeout:1000});
  const r=await ctx.mainOwnedConsentContext('/synthetic/repo',
    {action:'canonical-close',work_unit_id:'synthetic-unit'},'canonical-close');
  assert.equal(r.ok,true);
  assert.equal(r.context.bound_revision,'c'.repeat(40));
  assert.equal(r.context.route_digest,'sha256:legacy-route');
  assert.equal(r.context.evidence_class,'E0_TASK_TEXT');
  assert.equal(r.context.network_external,true);
  assert.equal(r.context.provider_spend,true);
});

test('background JARVIS window cannot summon an approval dialog',async()=>{
  const s=setup();
  const hidden={...s.invocation,window:{...s.frame.win,isFocused:()=>false}};
  const r=await s.gate.guard(hidden);
  assert.equal(r.ok,false);
  assert.equal(r.reason,'HUMAN_APPROVAL_WINDOW_NOT_FOCUSED');
  assert.equal(s.getShown(),0);
  assert.equal(s.getPerformed(),0);
});
