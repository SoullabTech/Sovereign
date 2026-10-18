/**
 * Stage C — actual Perry founder preview component in real WebKit.
 *
 * Uses the exact committed TSX and the real per-turn client posture helper,
 * bundled locally with installed React / esbuild. No MAIA server, account
 * settings, real chart, copyright source, network, model, or persisted state.
 * The route's founder check is tested separately at the server boundary.
 *
 * Run: PERRY_PREVIEW_DEPS=/path/to/node_modules node --test this_file.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const sourceRoot=path.resolve(here,'../../../..');
const deps=process.env.PERRY_PREVIEW_DEPS;
assert.ok(deps,'PERRY_PREVIEW_DEPS is required');
const require=createRequire(import.meta.url);
const esbuild=require(path.join(deps,'esbuild'));
const {webkit}=require(path.join(deps,'playwright'));

let tmp;
let browser;
let server;
let url;

function copySource(relativePath){
  const dest=path.join(tmp,relativePath);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.copyFileSync(path.join(sourceRoot,relativePath),dest);
}

async function newPage(viewport={width:1100,height:860}){
  const page=await browser.newPage({viewport});
  const errors=[];
  const external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{
    const requestUrl=new URL(req.url());
    if(requestUrl.origin !== url)external.push(req.url());
  });
  await page.goto(url, {waitUntil:'load'});
  await page.getByTestId('usual-choice').waitFor({state:'visible'});
  return {page,errors,external};
}

test.before(async()=>{
  tmp=fs.mkdtempSync(path.join(os.tmpdir(),'perry-founder-webkit-'));
  for(const rel of [
    'components/maia/knowledge/PerryLensFounderPreview.tsx',
    'lib/maia/knowledge/perryClientPostureGate.ts',
    'lib/maia/knowledge/perryWisdomKeeperLinks.ts',
    'lib/sanctuary/currentClientPosture.ts',
  ]) copySource(rel);

  fs.writeFileSync(path.join(tmp,'entry.tsx'), [
    "import React from 'react';",
    "import {createRoot} from 'react-dom/client';",
    "import PerryLensFounderPreview from './components/maia/knowledge/PerryLensFounderPreview';",
    "createRoot(document.getElementById('app')!).render(<PerryLensFounderPreview/>);",
  ].join('\n'));

  await esbuild.build({
    entryPoints:[path.join(tmp,'entry.tsx')],
    outfile:path.join(tmp,'bundle.js'),
    platform:'browser',format:'iife',
    bundle:true,jsx:'automatic',
    target:['safari16'],
    nodePaths:[deps],
    plugins:[{
      name:'alias-maia-src',
      setup(build){
        build.onResolve({filter:/^@\//},args=>{
          const prefix=path.join(tmp,args.path.slice(2));
          const candidate=['.tsx','.ts','.js','.jsx'].map(e=>prefix+e)
            .find(p=>fs.existsSync(p));
          if(!candidate)throw Error('No such isolated source '+args.path);
          return {path:candidate};
        });
      },
    }],
    logLevel:'silent',
  });

  server=http.createServer((req,res)=>{
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    if(req.url==='/bundle.js'){
      res.writeHead(200,{'content-type':'text/javascript; charset=utf-8'});
      fs.createReadStream(path.join(tmp,'bundle.js')).pipe(res);return;
    }
    if(req.url!=='/'){res.writeHead(404).end();return;}
    res.writeHead(200,{'content-type':'text/html; charset=utf-8',
      'cache-control':'no-store',
      'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'none'; frame-src 'none';"});
    res.end('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body style="margin:0"><div id="app"></div><script src="/bundle.js"></script></body></html>');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  url='http://127.0.0.1:'+server.address().port;
  browser=await webkit.launch({headless:true});
});

test.after(async()=>{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  if(tmp)fs.rmSync(tmp,{recursive:true,force:true});
});

test('WebKit shows founder-only fictional status and defaults to no extra lens',async()=>{
  const {page,errors,external}=await newPage();
  try{
    assert.match(await page.locator('h1').innerText(),/Explore a symbolic perspective/);
    assert.match(await page.getByTestId('preview-notice').innerText(),/Preview only/);
    assert.equal(await page.getByTestId('usual-choice').getAttribute('aria-pressed'),'true');
    assert.equal(await page.getByTestId('perry-choice').getAttribute('aria-pressed'),'false');
    assert.ok(!(await page.getByTestId('preview-result').innerText()).trim());
    assert.deepEqual(errors,[]);
    assert.deepEqual(external,[]);
  }finally{await page.close();}
});

test('WebKit usual response is fixed sample and cannot invoke MAIA',async()=>{
  const {page,errors,external}=await newPage();
  try{
    await page.getByTestId('preview-turn').click();
    const body=await page.getByTestId('preview-result').innerText();
    assert.match(body,/Illustrative MAIA wording, not generated by a model/);
    assert.match(body,/Wanting closeness/);
    assert.doesNotMatch(body,/Glenn Perry/);
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('WebKit explicit Perry choice is reversible, attributed, and not generated',async()=>{
  const {page,errors,external}=await newPage();
  try{
    await page.getByTestId('perry-choice').click();
    assert.equal(await page.getByTestId('perry-choice').getAttribute('aria-pressed'),'true');
    await page.getByTestId('preview-turn').click();
    const message=await page.getByTestId('preview-result').innerText();
    assert.match(message,/Glenn Perry/);
    assert.match(message,/symbolic perspective/);
    assert.match(message,/not generated by a model/);
    assert.match(message,/set it aside/);
    await page.getByTestId('usual-choice').click();
    assert.equal(await page.getByTestId('perry-choice').getAttribute('aria-pressed'),'false');
    assert.equal((await page.getByTestId('preview-result').innerText()).trim(),'');
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('WebKit simulated Sanctuary and unavailable posture refuse the optional lens',async()=>{
  const {page,errors,external}=await newPage();
  try{
    await page.getByTestId('perry-choice').click();
    await page.getByTestId('fixture-posture').selectOption('sanctuary');
    await page.getByTestId('preview-turn').click();
    assert.match(await page.getByTestId('preview-result').innerText(),/withheld while Sanctuary is active/);
    await page.getByTestId('fixture-posture').selectOption('unresolved');
    assert.equal((await page.getByTestId('preview-result').innerText()).trim(),'');
    await page.getByTestId('preview-turn').click();
    assert.match(await page.getByTestId('preview-result').innerText(),/setting is unresolved/);
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('mobile WebKit keeps controls accessible without horizontal overflow',async()=>{
  const {page,errors,external}=await newPage({width:390,height:844});
  try{
    await page.getByTestId('perry-choice').click();
    await page.getByTestId('preview-turn').click();
    assert.match(await page.getByTestId('preview-result').innerText(),/Glenn Perry/);
    const metrics=await page.evaluate(()=>({
      width:document.documentElement.scrollWidth,
      inner:window.innerWidth,
      choice:document.querySelector('[data-testid="perry-choice"]')?.getBoundingClientRect().width,
      color:getComputedStyle(document.querySelector('main')).backgroundColor,
    }));
    assert.ok(metrics.width<=metrics.inner+2,
      'horizontal overflow '+JSON.stringify(metrics));
    assert.ok(metrics.choice>=280,JSON.stringify(metrics));
    assert.equal(metrics.color,'rgb(246, 245, 239)');
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('WebKit selection supports keyboard focus and activation',async()=>{
  const {page,errors,external}=await newPage();
  try{
    await page.getByTestId('perry-choice').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.getByTestId('perry-choice').getAttribute('aria-pressed'),'true');
    await page.getByTestId('preview-turn').focus();
    await page.keyboard.press('Enter');
    assert.match(await page.getByTestId('preview-result').innerText(),/Glenn Perry/);
    assert.deepEqual(external,[]);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('WebKit presents six official source links with safe outbound navigation',async()=>{
  const {page,errors,external}=await newPage();
  try{
    const links=page.getByTestId('wisdom-keeper-links').locator('a');
    assert.equal(await links.count(),6);
    const expected=[
      ['author-website','https://aaperry.com/'],
      ['academy','https://astropsychology.org/'],
      ['introduction-book','https://aaperry.com/product/an-introduction-to-astropsychology/'],
      ['depth-analysis-book','https://aaperry.com/product/depth-analysis-of-the-natal-chart-advanced-therapeutic-astrology/'],
      ['books-collection','https://aaperry.com/astrology-books/'],
      ['essays-collection','https://aaperry.com/concepts-and-theory/'],
    ];
    for(const [id,url] of expected){
      const link=page.getByTestId('keeper-link-'+id);
      assert.equal(await link.getAttribute('href'),url,id);
      assert.equal(await link.getAttribute('target'),'_blank',id);
      const rel=(await link.getAttribute('rel'))||'';
      assert.ok(rel.split(/\s+/).includes('noopener'),id);
      assert.ok(rel.split(/\s+/).includes('noreferrer'),id);
      assert.ok((await link.innerText()).length>10,id);
    }
    const first=page.getByTestId('keeper-link-author-website');
    await first.focus();
    assert.equal(await first.evaluate(el=>document.activeElement===el),true);
    await page.keyboard.press('Tab');
    const second=page.getByTestId('keeper-link-academy');
    assert.equal(await second.evaluate(el=>document.activeElement===el),true);
    assert.deepEqual(external,[], 'no automatic outbound requests');
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
});
