/** WRITER-DEVICE-COPY-01 · Complete synthetic React control in Chrome.
 * No server, member auth, real manuscript, network, or provider used.
 */
const { chromium } = require('playwright');
const esbuild = require('esbuild');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const os=require('node:os');

(async()=>{
  const entry=path.resolve('scripts/witness/deviceCopyBrowserFixture.tsx');
  const {outputFiles}=await esbuild.build({entryPoints:[entry],bundle:true,write:false,platform:'browser',format:'iife',
    target:'es2022',logLevel:'silent',loader:{'.tsx':'tsx'},jsx:'automatic'});
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const ctx=await browser.newContext({acceptDownloads:true,viewport:{width:1400,height:900}});
    const page=await ctx.newPage();
    const network=[];
    await page.route('**/*',route=>{
      const url=route.request().url();
      if(!url.startsWith('about:')&&!url.startsWith('blob:')&&!url.startsWith('data:')) {
        network.push(url);return route.abort();
      }
      return route.continue();
    });
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div></body></html>');
    await page.addScriptTag({content:outputFiles[0].text});
    await page.getByRole('button',{name:'Save a copy'}).waitFor({timeout:15000});
    assert.equal(await page.getByRole('button',{name:'Save a copy'}).count(),1);
    await page.getByRole('button',{name:'Save a copy'}).click();
    await page.getByText('Manuscript only.').waitFor({timeout:10000});
    const downloadEvent=page.waitForEvent('download');
    await page.getByRole('button',{name:/Plain text/}).click();
    const downloaded=await downloadEvent;
    const dir=path.join(os.tmpdir(),'ws-device-copy-ui-witness-20261010');
    await fs.mkdir(dir,{recursive:true});
    const file=path.join(dir,'test-ui-writer-copy.txt');
    await downloaded.saveAs(file);
    const text=await fs.readFile(file,'utf8');
    assert.equal(downloaded.suggestedFilename(),'Synthetic Writer-writer-copy.txt');
    assert.equal(text,'Opening\n\nOriginal first passage.\n\nChapter Two\n\nUnsaved new ending.\nLast line.');
    assert.equal(await downloaded.failure(),null);
    assert.deepEqual(network,[]);
    assert.match(await page.getByRole('status').innerText(),/Studio may still be saving/);
    console.log('CHROME UI PASS: explicit Save a copy downloaded complete synthetic manuscript, newest unsaved text, no network.');
    console.log('Local destination:',file);
    await ctx.close();
  } finally { await browser.close(); }
})().catch(err=>{console.error('CHROME UI FAILED',err);process.exitCode=1});
