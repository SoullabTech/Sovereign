import {_electron as electron} from 'playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'cabin-cancel-fictional-'));let app;
try{
 app=await electron.launch({executablePath:(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron',args:[],
 env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_PORT:'43230',CABIN_TEST_DATA:dir}});
 const home=await app.firstWindow();await home.waitForFunction(()=>!document.querySelector('#open').disabled);
 const opening=app.waitForEvent('window');await home.locator('#open').click();const page=await opening;
 await page.locator('#enter-maia').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('ready'));
 for(const privateMode of [false,true]){
  if(privateMode){await page.locator('#sanctuary').click();await page.waitForFunction(()=>document.querySelector('#privacy-status').textContent.includes('Sanctuary ·'));}
  const text='Fictional cancellation test. Write a detailed 500 word story about a forest, then explain every character and all its themes.';
  await page.locator('#message').fill(text);await page.locator('#send').click();
  await page.waitForFunction(()=>!document.querySelector('#stop-response').hidden);
  await page.waitForTimeout(250);
  const unrelated=await page.evaluate(async()=>{const s=await fetch('/api/state').then(r=>r.json());return fetch('/api/cancel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:s.session,request:'wrong-request'})}).then(r=>r.json());});
  assert.equal(unrelated.cancelled,false);
  await page.locator('#message').fill(text+' New unsent thought.');
  await page.locator('#stop-response').click();
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Response stopped'),null,{timeout:15000});
  assert.equal(await page.locator('.turn').count(),0);
  assert.equal(await page.locator('#message').inputValue(),text+' New unsent thought.');
  assert.equal(await page.locator('#send').isDisabled(),false);
  const state=await page.evaluate(()=>fetch('/api/state').then(r=>r.json()));
  assert.equal(state.sessions.length,0);assert.equal(state.turns.length,0);
  await page.locator('#message').fill('');
 }
 await page.locator('#sanctuary').click();await page.waitForFunction(()=>document.querySelector('#privacy-status').textContent.includes('Ordinary'));
 await page.locator('#message').fill('Fictional recovery test. Please greet me in one sentence.');
 await page.locator('#send').click();
 await page.waitForFunction(()=>!document.querySelector('#stop-response').hidden);
 await page.locator('#message').fill('My next unsent thought.');
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('MAIA replied'),null,{timeout:150000});
 assert.equal(await page.locator('.turn').count(),2);
 assert.equal(await page.locator('#message').inputValue(),'My next unsent thought.');
 console.log(JSON.stringify({realLocalCancellation:'PASS',ordinaryNoPartialExchange:'PASS',sanctuaryNoPartialExchange:'PASS',wrongRequestDenied:'PASS',draftPreservedOnStop:'PASS',draftPreservedOnSuccess:'PASS',subsequentReply:'PASS'}));
}finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
