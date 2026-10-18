/**
 * Stage C founder-only preview: execute REAL founder-allowlist module and
 * Next page server gate with fictional sessions. No DB, browser, member
 * records, copyright source, full Next server, or network activity.
 *
 * Runs in Node 22+ with TypeScript + React from an installed local fixture
 * via PERRY_PREVIEW_DEPS=<node_modules folder>.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const deps=process.env.PERRY_PREVIEW_DEPS;
assert.ok(deps,'PERRY_PREVIEW_DEPS is required');
const require=createRequire(import.meta.url);
const ts=require(path.join(deps,'typescript'));
const React=require(path.join(deps,'react'));
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');

function compile(relative,imports=new Map()) {
  const file=path.join(root,relative);
  const text=ts.transpileModule(source(relative),{
    compilerOptions:{
      target:ts.ScriptTarget.ES2022,
      module:ts.ModuleKind.CommonJS,
      jsx:ts.JsxEmit.ReactJSX,
      esModuleInterop:true,
      isolatedModules:true
    },
    fileName:file,
  }).outputText;
  const module=new Module.Module(file+'.cjs');
  module.filename=file+'.cjs';
  module.paths=[];
  module.require=(name)=>{
    if(imports.has(name))return imports.get(name);
    if(name==='react/jsx-runtime')return require(path.join(deps,'react/jsx-runtime'));
    throw Error('Unapproved import '+name+' into '+relative);
  };
  module._compile(text,module.filename);
  return module.exports;
}

function authHarness(founderList) {
  const existing=process.env.FOUNDER_MEMBER_IDS;
  process.env.FOUNDER_MEMBER_IDS=founderList;
  let currentSession=null;
  try{
    const auth=compile('lib/founder/founderAuth.ts',
      new Map([['@/lib/auth/serverSessions',{
        getCurrentSession:async()=>currentSession
      }]]));
    return {auth,setSession:(s)=>{currentSession=s;}};
  }finally{
    if(existing===undefined)delete process.env.FOUNDER_MEMBER_IDS;
    else process.env.FOUNDER_MEMBER_IDS=existing;
  }
}

function pageHarness(auth,accessCounter) {
  return compile('app/maia/perry-lens-preview/page.tsx',
    new Map([
      ['next/navigation',{
        notFound:()=>{throw Object.assign(new Error('NEXT_NOT_FOUND'),{code:'NOT_FOUND'});}
      }],
      ['@/lib/founder/founderAuth',{
        requireFounder:async()=>{
          accessCounter.count++;
          return auth.requireFounder();
        }
      }],
      ['@/components/maia/knowledge/PerryLensFounderPreview',{
        default: function FictionalPreviewComponent(){return null;}
      }]
    ]));
}

async function invokePage({founders='fictional-founder',session=null,flag='1',native='false'}={}){
  const a=authHarness(founders);
  a.setSession(session);
  const counter={count:0};
  const page=pageHarness(a.auth,counter);
  const previousFlag=process.env.MAIA_PERRY_FOUNDER_PREVIEW_ENABLED;
  const previousNative=process.env.CAPACITOR_BUILD;
  try{
    if(flag===null)delete process.env.MAIA_PERRY_FOUNDER_PREVIEW_ENABLED;
    else process.env.MAIA_PERRY_FOUNDER_PREVIEW_ENABLED=flag;
    process.env.CAPACITOR_BUILD=native;
    try{
      const value=await page.default();
      return {allowed:true, element:value, authCalls:counter.count,
        dynamic:page.dynamic,revalidate:page.revalidate};
    }catch(err){
      if(err?.code!=='NOT_FOUND')throw err;
      return {allowed:false, authCalls:counter.count};
    }
  }finally{
    if(previousFlag===undefined)delete process.env.MAIA_PERRY_FOUNDER_PREVIEW_ENABLED;
    else process.env.MAIA_PERRY_FOUNDER_PREVIEW_ENABLED=previousFlag;
    if(previousNative===undefined)delete process.env.CAPACITOR_BUILD;
    else process.env.CAPACITOR_BUILD=previousNative;
  }
}

test('review route is default-off even for a verified founder',async()=>{
  const r=await invokePage({flag:null,session:{memberId:'fictional-founder'}});
  assert.equal(r.allowed,false);
  assert.equal(r.authCalls,0,'no database/session call when preview is disabled');
});

test('any server flag other than exact 1 denies without session lookup',async()=>{
  for(const flag of ['0','true','yes','01','1 ', '']){
    const r=await invokePage({flag,session:{memberId:'fictional-founder'}});
    assert.equal(r.allowed,false,flag);
    assert.equal(r.authCalls,0);
  }
});

test('native static-export posture refuses for the actual 1 and true encodings',async()=>{
  for (const native of ['1','true']) {
    const r=await invokePage({native,session:{memberId:'fictional-founder'}});
    assert.equal(r.allowed,false,native);
    assert.equal(r.authCalls,0);
  }
});

test('unauthenticated requests cannot access despite enabled preview flag',async()=>{
  const r=await invokePage({session:null});
  assert.equal(r.allowed,false);
  assert.equal(r.authCalls,1);
});

test('nonfounder does not inherit client administrator or practitioner role',async()=>{
  const r=await invokePage({
    session:{memberId:'fictional-other-member',isAdmin:true,isPractitioner:true}
  });
  assert.equal(r.allowed,false);
  assert.equal(r.authCalls,1);
});

test('founder allowlist missing means no founder access, even with session',async()=>{
  const r=await invokePage({founders:'',session:{memberId:'fictional-founder'}});
  assert.equal(r.allowed,false);
  assert.equal(r.authCalls,1);
});

test('one exact verified allowlisted founder can reach the preview component',async()=>{
  const r=await invokePage({session:{memberId:'fictional-founder'}});
  assert.equal(r.allowed,true);
  assert.equal(r.authCalls,1);
  assert.equal(r.dynamic,'force-dynamic');
  assert.equal(r.revalidate,0);
  assert.ok(React.isValidElement(r.element));
});

test('unrelated founder never joins allowlist simply by query or metadata',async()=>{
  const r=await invokePage({
    founders:'fictional-founder,fictional-other-founder',
    session:{memberId:'fictional-visitor',
      query:{founder:true},body:{memberId:'fictional-founder'},
      roles:['founder','admin']}
  });
  assert.equal(r.allowed,false);
});

test('preview source contains no model, source, or live member data access',()=>{
  const page=source('app/maia/perry-lens-preview/page.tsx');
  const ui=source('components/maia/knowledge/PerryLensFounderPreview.tsx');
  assert.match(page,/await requireFounder\(\)/);
  assert.match(page,/MAIA_PERRY_FOUNDER_PREVIEW_ENABLED !== '1'/);
  assert.match(page,/CAPACITOR_BUILD === 'true'/);
  assert.match(page,/CAPACITOR_BUILD === '1'/);
  assert.doesNotMatch(page,/process\.env\.NEXT_PUBLIC_[A-Z_]+/);
  assert.ok(!page.includes('isPractitioner'));
  assert.ok(!page.includes('isAdmin'));
  assert.ok(!ui.includes('apiFetch('));
  assert.ok(!ui.includes('fetch('));
  assert.ok(!ui.includes('getMaiaResponse('));
  assert.ok(!ui.includes('localStorage.'));
  assert.ok(ui.includes('preparePerryClientSelection('));
  assert.ok(ui.includes('FICTIONAL'));
  assert.ok(!ui.includes('setItem('));
});

test('native patcher excludes dynamic server founder preview from iPhone export',()=>{
  const patcher=source('scripts/capacitor-patch-routes.sh');
  const page=source('app/maia/perry-lens-preview/page.tsx');
  assert.ok(page.includes("export const dynamic = 'force-dynamic'"));
  assert.ok(patcher.includes('hide_incompatible_pages()'));
  assert.match(patcher,/grep -qE.*export const dynamic.*force-dynamic/);
  assert.ok(patcher.includes('MOBILE_MAIA_KEEP=()'));
});

test('the regular MAIA page is not linked to the review route',()=>{
  const main=source('app/maia/page.tsx');
  assert.ok(!main.includes('perry-lens-preview'));
  const oracle=source('components/OracleConversation.tsx');
  assert.ok(!oracle.includes('PerryLensFounderPreview'));
  assert.ok(!oracle.includes('preparePerryClientSelection('));
});
