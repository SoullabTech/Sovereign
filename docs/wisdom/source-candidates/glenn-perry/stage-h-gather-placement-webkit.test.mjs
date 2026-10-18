/**
 * Real WebKit interaction test of the exact staged Wisdom → Gather Together
 * founder component. Served ONLY inside a disposable local browser fixture.
 * This is NOT a production Next.js server, member login, live media or Circle.
 * PERRY_PREVIEW_DEPS=/absolute/installed/node_modules node --test ...
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const deps=process.env.PERRY_PREVIEW_DEPS;
assert.ok(deps,'PERRY_PREVIEW_DEPS is required');
const require=createRequire(import.meta.url);
const esbuild=require(path.join(deps,'esbuild'));
const {webkit}=require(path.join(deps,'playwright'));

let tmp,server,browser,origin;

test.before(async()=>{
  tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wisdom-gather-webkit-'));
  for(const rel of [
    'components/wisdom/WisdomGatherFounderPreview.tsx',
    'lib/wisdom/wisdomGatherPreview.ts'
  ]){
    const dest=path.join(tmp,rel);
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.copyFileSync(path.join(root,rel),dest);
  }
  fs.writeFileSync(path.join(tmp,'entry.tsx'),[
    "import React from 'react';",
    "import {createRoot} from 'react-dom/client';",
    "import WisdomGatherFounderPreview from './components/wisdom/WisdomGatherFounderPreview';",
    "createRoot(document.getElementById('app')!).render(<WisdomGatherFounderPreview/>);"
  ].join('\n'));

  await esbuild.build({
    entryPoints:[path.join(tmp,'entry.tsx')],
    outfile:path.join(tmp,'bundle.js'),
    platform:'browser',format:'iife',bundle:true,jsx:'automatic',
    target:['safari16'],nodePaths:[deps],
    logLevel:'silent',
    plugins:[{
      name:'existing-soullab-alias',
      setup(build){
        build.onResolve({filter:/^@\//},args=>{
          const prefix=path.join(tmp,args.path.slice(2));
          const file=['.tsx','.ts','.jsx','.js'].map(ext=>prefix+ext)
            .find(p=>fs.existsSync(p));
          if(!file)throw Error('No matching isolated import: '+args.path);
          return {path:file};
        });
      }
    }]
  });

  server=http.createServer((req,res)=>{
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    if(req.url==='/bundle.js'){
      res.writeHead(200,{'content-type':'text/javascript; charset=utf-8'});
      fs.createReadStream(path.join(tmp,'bundle.js')).pipe(res);return;
    }
    if(req.url!=='/'){res.writeHead(404).end();return;}
    res.writeHead(200,{
      'content-type':'text/html; charset=utf-8',
      'cache-control':'no-store',
      'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'none'; frame-src 'none';"
    });
    res.end('<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0"><div id="app"></div><script src="/bundle.js"></script></body></html>');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin='http://127.0.0.1:'+server.address().port;
  browser=await webkit.launch({headless:true});
});

test.after(async()=>{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  if(tmp)fs.rmSync(tmp,{force:true,recursive:true});
});

async function openPage(viewport={width:1060,height:880}){
  const page=await browser.newPage({viewport});
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{
    if(new URL(req.url()).origin!==origin)external.push(req.url());
  });
  await page.goto(origin,{waitUntil:'load'});
  await page.getByTestId('gather-placement').waitFor({state:'visible'});
  return {page,errors,external};
}

test('founder preview names canonical Wisdom placement but no real member action',async()=>{
  const {page,errors,external}=await openPage();
  try{
    assert.match(await page.getByTestId('gather-placement').innerText(),
      /HOME \/ WISDOM KEEPERS \/ GATHER TOGETHER/i);
    assert.match(await page.locator('h1').innerText(),/Gather Together/);
    assert.match(await page.getByTestId('not-available').innerText(),
      /does not create a Circle, register an interest, issue an invitation/);
    assert.equal(await page.getByTestId('gather-journey').locator('button').count(),4);
    assert.equal(await page.locator('form').count(),0);
    assert.equal(await page.locator('input').count(),0);
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('four member waypoints are reversible and disclose the real unavailable boundaries',async()=>{
  const {page,errors,external}=await openPage();
  try{
    const selected=page.getByTestId('gather-active-stage');
    assert.match(await selected.innerText(),/Encounter the wisdom/);
    assert.equal(await page.getByTestId('gather-stage-source').getAttribute('aria-pressed'),'true');

    for(const [id,expected] of [
      ['intention','No interest registration or enrolment'],
      ['circle','founder-restricted'],
      ['meeting','6–8-person Circle']
    ]){
      await page.getByTestId('gather-stage-'+id).click();
      assert.match(await selected.innerText(),new RegExp(expected));
      assert.equal(await page.getByTestId('gather-stage-'+id).getAttribute('aria-pressed'),'true');
      assert.match(await page.getByTestId('gather-current-boundary').innerText(),
        /What stays protected/);
    }
    await page.getByTestId('gather-stage-source').click();
    assert.match(await selected.innerText(),/Encounter the wisdom/);
    assert.equal(await page.getByTestId('gather-stage-meeting').getAttribute('aria-pressed'),'false');
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('pilot announces no date, room, recording grant, or Glenn Perry partnership',async()=>{
  const {page,errors,external}=await openPage();
  try{
    const pilot=await page.getByTestId('gather-pilot').innerText();
    assert.match(pilot,/Where Symbols Meet Life/);
    assert.match(pilot,/75 minutes/);
    assert.match(pilot,/Not scheduled/);
    assert.match(pilot,/No room or joining link/);
    assert.match(pilot,/controls unverified/);
    const keeper=await page.getByTestId('gather-keeper-source').innerText();
    assert.match(keeper,/independent public reference, not a guest or partner/);
    assert.match(keeper,/No keeper has been invited or approved/);
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('only chosen external author and Academy links; none open automatically',async()=>{
  const {page,errors,external}=await openPage();
  try{
    const links=page.locator('a');
    assert.equal(await links.count(),2);
    for(const [id,url] of [
      ['gather-link-author','https://aaperry.com/'],
      ['gather-link-academy','https://astropsychology.org/']
    ]){
      const link=page.getByTestId(id);
      assert.equal(await link.getAttribute('href'),url);
      assert.equal(await link.getAttribute('target'),'_blank');
      const rel=(await link.getAttribute('rel'))||'';
      assert.ok(rel.includes('noopener'));
      assert.ok(rel.includes('noreferrer'));
      assert.equal(await link.evaluate(el=>el.tabIndex),0);
    }
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('390px mobile WebKit supports keyboard navigation without overflow',async()=>{
  const {page,errors,external}=await openPage({width:390,height:844});
  try{
    const stage=page.getByTestId('gather-stage-circle');
    await stage.focus();
    await page.keyboard.press('Enter');
    assert.equal(await stage.getAttribute('aria-pressed'),'true');
    assert.match(await page.getByTestId('gather-active-stage').innerText(),/Enter a Circle/);
    const metrics=await page.evaluate(()=>({
      scrollWidth:document.documentElement.scrollWidth,
      viewport:window.innerWidth,
      stages:[...document.querySelectorAll('.gatherPreview .stage')]
        .map(el=>Math.round(el.getBoundingClientRect().width))
    }));
    assert.equal(metrics.stages.length,4);
    assert.ok(metrics.stages.every(w=>w>=120),JSON.stringify(metrics));
    assert.ok(metrics.scrollWidth<=metrics.viewport+2,JSON.stringify(metrics));
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});
