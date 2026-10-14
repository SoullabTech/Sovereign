import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const dir=mkdtempSync(join(tmpdir(),'cabin-writing-controls-'));
let app;
try {
 app=await electron.launch({executablePath:'/Users/soullab/Applications/Cabin.app/Contents/MacOS/Electron',args:[],
 env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_DATA:dir}});
 const home=await app.firstWindow();await home.waitForFunction(()=>!document.querySelector('#open').disabled);
 const opening=app.waitForEvent('window');await home.locator('#open').click();const page=await opening;
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent==='Your local workspace is ready.');
 const text='A fictional chapter.\n\nThe forest was quiet.';
 await page.locator('#file').setInputFiles({name:'Fictional.txt',mimeType:'text/plain',buffer:Buffer.from(text)});
 await page.waitForFunction(()=>document.querySelector('#status').textContent==='Imported and saved locally.');
 assert.equal(await page.locator('#manuscript').inputValue(),text);
 const id=await page.locator('#works').inputValue();
 const act=async(button,expected)=>{await page.locator('#'+button).click();await page.waitForFunction(t=>document.querySelector('#status').textContent.includes(t) && !document.querySelector('#save').disabled,expected);};
 for(const body of ['First revision.','Second revision.']) {await page.locator('#manuscript').fill(body);await act('save','Saved locally');}
 await act('undo','Previous saved text restored');assert.equal(await page.locator('#manuscript').inputValue(),'First revision.');
 await act('undo','Previous saved text restored');assert.equal(await page.locator('#manuscript').inputValue(),text);
 assert.equal(await page.locator('#undo').isDisabled(),true);
 await act('history','Saved versions opened');await page.locator('#version').selectOption('3');
 await act('restore','Selected version restored');assert.equal(await page.locator('#manuscript').inputValue(),'Second revision.');
 // Another writing can be selected without replacing the saved one.
 await page.locator('#new').click();await page.locator('#new-title').fill('Another fictional piece');
 await page.locator('#new-form button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#title').textContent==='Another fictional piece');
 await page.locator('#works').selectOption(id);await page.waitForFunction(()=>document.querySelector('#manuscript').value==='Second revision.');
 const active=await page.evaluate(async()=>{const r=await fetch('/api/state');return (await r.json()).selected;});
 assert.equal(active,id);
 console.log(JSON.stringify({installedPackage:'PASS',textImport:'PASS',successiveUndo:'PASS',restoreVersion:'PASS',selectedWritingPersistence:'PASS'}));
} finally {if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
