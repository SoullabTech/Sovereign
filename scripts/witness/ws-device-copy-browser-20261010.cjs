/** WRITER-DEVICE-COPY-01 · synthetic, offline browser download witness.
 * Uses synthetic authored text; never opens a real member Work or calls an API.
 */
const { chromium, webkit } = require('playwright');
const esbuild = require('esbuild');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const assert = require('node:assert/strict');

(async () => {
  const entry = path.resolve('lib/writersStudio/deviceManuscriptCopy.ts');
  const bundle = await esbuild.build({
    entryPoints:[entry], bundle:true, write:false, platform:'browser',
    format:'iife', globalName:'WriterDeviceCopy', target:'es2022',
    logLevel:'silent',
  });
  const output = path.join(os.tmpdir(), 'ws-device-copy-browser-20261010');
  await fs.mkdir(output,{recursive:true});
  let passed=0;
  for (const [name,browserType,launchArgs] of [
    ['chromium',chromium,{headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}],
    ['webkit',webkit,{headless:true}],
  ]) {
    let browser;
    try {
      browser=await browserType.launch(launchArgs);
      const ctx=await browser.newContext({acceptDownloads:true});
      const page=await ctx.newPage();
      const outside=[];
      await page.route('**/*',async route=>{
        const url=route.request().url();
        if (!url.startsWith('data:')&&!url.startsWith('blob:')&&!url.startsWith('about:')) {
          outside.push(url);return route.abort();
        }
        return route.continue();
      });
      await page.setContent('<html><head></head><body><main>Device copy witness</main></body></html>');
      await page.addScriptTag({content:bundle.outputFiles[0].text});
      const downloadEvent=page.waitForEvent('download');
      const pageAct=page.evaluate(()=>{
        const manuscript={
          manuscriptId:'test-device-manuscript',
          title:'Synthetic / Poems',
          version:3,
          sections:[
            {draftSectionId:'second',sourceSectionId:null,position:2,heading:'Return',headingDepth:1,headingSignal:'markdown',headingPrefix:'Return\n\n',body:'Old text',editable:true},
            {draftSectionId:'first',sourceSectionId:null,position:1,heading:'Arrival',headingDepth:1,headingSignal:'markdown',headingPrefix:'Arrival\n\n',body:'A new line.\n\n',editable:true},
          ],
          latestBody:(id)=>id==='second'?'Edited in the browser\n\twith a tab':'A new line.\n\n',
          unsavedInStudio:true,
          exportedAt:'2026-10-10T22:00:00Z',
        };
        const doc=WriterDeviceCopy.prepareDeviceManuscriptCopy(manuscript,'txt');
        const url=URL.createObjectURL(new Blob([doc.contents],{type:doc.mime}));
        const a=document.createElement('a');a.href=url;a.download=doc.filename;document.body.appendChild(a);
        a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
      });
      const [download]=await Promise.all([downloadEvent,pageAct]);
      const outputFile=path.join(output,name+'-writer-copy.txt');
      await download.saveAs(outputFile);
      const data=await fs.readFile(outputFile,'utf8');
      assert.equal(download.suggestedFilename(),'Synthetic Poems-writer-copy.txt');
      assert.equal(data,'Arrival\n\nA new line.\n\nReturn\n\nEdited in the browser\n\twith a tab');
      assert.deepEqual(outside,[]);
      const failure=await download.failure();
      assert.equal(failure,null);
      console.log(name,'PASS','downloaded',Buffer.byteLength(data),'bytes, latest text and Unicode preserved, no network');
      passed+=1;
      await ctx.close();
    } catch(error) {
      console.log(name,'UNVERIFIED',String(error).slice(0,500));
      process.exitCode=1;
    } finally {if(browser)await browser.close();}
  }
  console.log('Browser engine passes:',passed,'/2');
})().catch(error=>{console.error(error);process.exitCode=1});
