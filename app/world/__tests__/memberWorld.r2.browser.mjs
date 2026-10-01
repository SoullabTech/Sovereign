import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = process.cwd();
const out = path.join(root,'docs/design/contracts/screenshots');

async function capture(name,width,height) {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width,height}});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const input=path.join(out,`member-world-r2-${name}.html`);
  await page.goto(pathToFileURL(input).href);
  await page.getByText('THE FRONTIER',{exact:true}).waitFor();
  await page.getByText('BUILD WITH KELLY',{exact:true}).waitFor();
  await page.getByText('FROM THE EDGES',{exact:true}).waitFor();
  const size=await page.evaluate(()=>({inner:window.innerWidth,body:document.body.scrollWidth,doc:document.documentElement.scrollWidth}));
  assert.equal(errors.length,0,errors.join('\n'));
  assert.equal(size.body,size.inner,JSON.stringify(size));
  assert.equal(size.doc,size.inner,JSON.stringify(size));
  const png=path.join(out,`member-world-r2-${name}.png`);
  await page.screenshot({path:png,fullPage:true});
  await browser.close();
  return {name,width,height,size,png};
}

const desktop=await capture('desktop',1440,1100);
const mobile=await capture('mobile',390,844);
console.log(JSON.stringify({desktop,mobile},null,2));