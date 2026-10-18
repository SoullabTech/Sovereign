/**
 * Stage H: execute the actual Wisdom Gather founder-only PAGE FUNCTION
 * and the real requireFounder allowlist algorithm with fictional identities.
 *
 * This is not a full Next.js app build. No real member, database, Circle,
 * meeting, model, Studio group or email is accessed.
 * PERRY_PREVIEW_DEPS=/absolute/installed/node_modules node --test ...
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Module from 'node:module';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const deps=process.env.PERRY_PREVIEW_DEPS;
assert.ok(deps,'PERRY_PREVIEW_DEPS must point to a local installed test toolchain');
const require=createRequire(import.meta.url);
const ts=require(path.join(deps,'typescript'));
const React=require(path.join(deps,'react'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function cjs(relativePath,dependencies=new Map()){
  const filename=path.join(root,relativePath);
  const code=ts.transpileModule(read(relativePath),{
    compilerOptions:{
      target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
      jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,isolatedModules:true,
    },fileName:filename,
  }).outputText;
  const m=new Module.Module(filename+'.isolated.cjs');
  m.filename=filename+'.isolated.cjs';
  m.paths=[];
  m.require=(id)=>{
    if(dependencies.has(id))return dependencies.get(id);
    if(id==='react/jsx-runtime')return require(path.join(deps,'react/jsx-runtime'));
    throw Error('Import not explicitly authorized in isolated preview: '+id);
  };
  m._compile(code,m.filename);
  return m.exports;
}

function founderFixture(allowedMembers){
  const old=process.env.FOUNDER_MEMBER_IDS;
  process.env.FOUNDER_MEMBER_IDS=allowedMembers;
  let session=null;
  try{
    const actual=cjs('lib/founder/founderAuth.ts',new Map([
      ['@/lib/auth/serverSessions',{getCurrentSession:async()=>session}],
    ]));
    return {actual,setSession(x){session=x}};
  }finally{
    if(old===undefined)delete process.env.FOUNDER_MEMBER_IDS;
    else process.env.FOUNDER_MEMBER_IDS=old;
  }
}

async function run({allowlist='fictional-founder',session=null,flag='1',native='false'}={}){
  const sessionFixture=founderFixture(allowlist);
  sessionFixture.setSession(session);
  let authCalls=0;
  const route=cjs('app/wisdom-keepers/wisdom/gather-preview/page.tsx',new Map([
    ['next/navigation',{notFound:()=>{
      throw Object.assign(new Error('NEXT_NOT_FOUND'),{code:'NOT_FOUND'});
    }}],
    ['@/lib/founder/founderAuth',{requireFounder:async()=>{
      authCalls++;
      return sessionFixture.actual.requireFounder();
    }}],
    ['@/components/wisdom/WisdomGatherFounderPreview',{
      default: function StaticFictionalFounderComponent(){return null;}
    }],
  ]));
  const previousFlag=process.env.MAIA_WISDOM_GATHER_PREVIEW_ENABLED;
  const previousNative=process.env.CAPACITOR_BUILD;
  try{
    if(flag===null)delete process.env.MAIA_WISDOM_GATHER_PREVIEW_ENABLED;
    else process.env.MAIA_WISDOM_GATHER_PREVIEW_ENABLED=flag;
    process.env.CAPACITOR_BUILD=native;
    try{
      const rendered=await route.default();
      return {allowed:true,rendered,authCalls,dynamic:route.dynamic,
        revalidate:route.revalidate,runtime:route.runtime};
    }catch(e){
      if(e?.code!=='NOT_FOUND')throw e;
      return {allowed:false,authCalls};
    }
  }finally{
    if(previousFlag===undefined)delete process.env.MAIA_WISDOM_GATHER_PREVIEW_ENABLED;
    else process.env.MAIA_WISDOM_GATHER_PREVIEW_ENABLED=previousFlag;
    if(previousNative===undefined)delete process.env.CAPACITOR_BUILD;
    else process.env.CAPACITOR_BUILD=previousNative;
  }
}

test('brand new Wisdom gathering preview defaults to 404 before reading founder session',async()=>{
  const result=await run({session:{memberId:'fictional-founder'},flag:null});
  assert.equal(result.allowed,false);
  assert.equal(result.authCalls,0);
});

test('only exact server-side preview flag value 1 opens auth check',async()=>{
  for(const flag of ['0','true','yes','01','1 ','',null]){
    const result=await run({session:{memberId:'fictional-founder'},flag});
    assert.equal(result.allowed,false,String(flag));
    assert.equal(result.authCalls,0);
  }
});

test('both real native build encodings refuse even an authenticated founder',async()=>{
  for(const native of ['1','true']){
    const r=await run({session:{memberId:'fictional-founder'},native});
    assert.equal(r.allowed,false,native);
    assert.equal(r.authCalls,0);
  }
});

test('no authenticated session cannot expose Wisdom gathering preview',async()=>{
  const r=await run();
  assert.equal(r.allowed,false);
  assert.equal(r.authCalls,1);
});

test('authenticated nonfounder and client-side role claims do not confer access',async()=>{
  const r=await run({session:{memberId:'fictional-visitor',
    isAdmin:true,isPractitioner:true,roles:['admin','founder'],
    urlSearchParams:{preview:'founder'}
  }});
  assert.equal(r.allowed,false);
  assert.equal(r.authCalls,1);
});

test('a missing founder allowlist refuses verified credentials rather than opening all',async()=>{
  const r=await run({allowlist:'',session:{memberId:'fictional-founder'}});
  assert.equal(r.allowed,false);
  assert.equal(r.authCalls,1);
});

test('allowlisted fictional founder sees the route only with the server switch enabled',async()=>{
  const r=await run({session:{memberId:'fictional-founder'}});
  assert.equal(r.allowed,true);
  assert.equal(r.authCalls,1);
  assert.equal(r.dynamic,'force-dynamic');
  assert.equal(r.runtime,'nodejs');
  assert.equal(r.revalidate,0);
  assert.ok(React.isValidElement(r.rendered));
});

test('existing canonical Wisdom page stays unmodified and does not link to preview',()=>{
  const original=read('app/wisdom-keepers/wisdom/page.tsx');
  assert.match(original,/Canonical destination: \/wisdom-keepers\/wisdom/);
  assert.match(original,/Pathways & Sources/);
  assert.ok(!original.includes('gather-preview'));
  assert.ok(!original.includes('WisdomGatherFounderPreview'));
  assert.ok(!original.includes('MAIA_WISDOM_GATHER_PREVIEW_ENABLED'));
});

test('existing Circle cohort remains founder only in both page and API',()=>{
  const layout=read('app/commons/circles/layout.tsx');
  const api=read('lib/circles/circleAccess.ts');
  assert.ok(layout.includes('await requireFounder()'));
  assert.ok(api.includes('isFounderMemberId(memberId)'));
  assert.ok(api.includes('Circles is not open for v1'));
  const page=read('app/wisdom-keepers/wisdom/gather-preview/page.tsx');
  assert.ok(!page.includes('/api/circles'));
  assert.ok(!page.includes('/api/studio/groups'));
  assert.ok(!page.includes('NEXT_PUBLIC_MAIA_WISDOM_GATHER_PREVIEW_ENABLED'));
});

test('nothing in founder preview creates calls, events, circles or licensed texts',()=>{
  const component=read('components/wisdom/WisdomGatherFounderPreview.tsx');
  const copy=read('lib/wisdom/wisdomGatherPreview.ts');
  for(const word of ['fetch(','apiFetch(','localStorage','createCircle(',
    'joinRoom(','sendInvitation(','getMaiaResponse(']){
    assert.ok(!component.includes(word),'unexpected network or service: '+word);
    assert.ok(!copy.includes(word),'unexpected data source: '+word);
  }
  assert.match(copy,/Not scheduled/);
  assert.match(copy,/No room or joining link/);
  assert.match(copy,/not a guest or partner/);
  assert.match(component,/Not a live gathering/);
  assert.match(component,/actual Wisdom room/);
});

test('existing iPhone native patcher excludes a dynamic server-only founder page',()=>{
  const script=read('scripts/capacitor-patch-routes.sh');
  const route=read('app/wisdom-keepers/wisdom/gather-preview/page.tsx');
  assert.match(route,/export const dynamic = 'force-dynamic'/);
  assert.match(route,/CAPACITOR_BUILD === '1'/);
  assert.match(route,/CAPACITOR_BUILD === 'true'/);
  assert.ok(script.includes('hide_incompatible_pages()'));
  assert.match(script,/grep -qE.*export const dynamic.*force-dynamic/);
});
