/** WS-JONDI-CONTINUOUS-RETURN-01 · Synthetic Chrome recovery surface witness.
 * No real member content, no server, no network, no writes.
 */
const { chromium } = require('playwright');
const esbuild = require('esbuild');
const assert = require('node:assert/strict');

(async () => {
  const source = [
    "import React from 'react';",
    "import { createRoot } from 'react-dom/client';",
    "import { ContinuousDraftRecovery } from './app/dev/writers-studio-pc3-live/ContinuousDraftRecovery';",
    "const root=document.getElementById('root');",
    "createRoot(root).render(React.createElement(ContinuousDraftRecovery,",
    "  { manuscriptId:'synthetic-edited-continuous', onBack:()=>{window.__backClicks=(window.__backClicks||0)+1} }));",
  ].join('\n');
  const bundle = await esbuild.build({
    stdin: {contents:source,resolveDir:process.cwd(),sourcefile:'continuous-draft-fixture.tsx',loader:'tsx'},
    write:false,bundle:true,platform:'browser',format:'iife',target:'es2022',jsx:'automatic',logLevel:'silent',
  });
  const browser=await chromium.launch({
    headless:true,
    executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  try {
    const page=await browser.newPage({viewport:{width:1250,height:850}});
    const blocked=[],errors=[];
    await page.route('**/*',route=>{blocked.push(route.request().url());return route.abort();});
    page.on('pageerror',e=>errors.push(e.message));
    await page.setContent('<!doctype html><html><body style="margin:0"><div id="root"></div></body></html>');
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    await page.waitForTimeout(500);
    console.log('DIAGNOSTIC_RENDER',JSON.stringify({body:(await page.locator('body').innerText()).slice(0,250),errors,blocked}));
    const link=page.getByRole('link',{name:'Open my existing draft'});
    await link.waitFor();
    assert.equal(await link.getAttribute('href'),
      '/writers-studio/canvas?m=synthetic-edited-continuous');
    assert.equal(await page.locator('[data-continuous-draft-recovery]').count(),1);
    assert.equal(await page.getByRole('heading',{level:1}).count(),1);
    assert.match(await page.locator('main').innerText(),/Nothing has been converted or replaced/);
    const colors=await page.locator('main').evaluate(el=>({
      fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor,
    }));
    assert.equal(colors.fg,'rgb(241, 233, 220)');
    assert.equal(colors.bg,'rgb(30, 26, 22)');
    await page.getByRole('button',{name:'Back to my Works'}).click();
    assert.equal(await page.evaluate(()=>window.__backClicks),1);
    await page.setViewportSize({width:390,height:844});
    assert(await link.isVisible());
    assert.equal(errors.length,0);
    assert.equal(blocked.length,0);
    console.log('CHROME_RECOVERY_PASS: desktop+mobile-width, member-chosen exact Canvas address, no fetch or browser errors');
    console.log('RECOVERY_URL',await link.getAttribute('href'));
    console.log('COLORS',colors.fg,colors.bg);
    await page.close();
  } finally {await browser.close();}
})().catch(e=>{console.error('CHROME_RECOVERY_FAIL',String(e).slice(0,1500));process.exitCode=1});
