import {_electron as electron} from 'playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
const dir=mkdtempSync(join(tmpdir(),'cabin-house-fictional-'));
let app,page;
async function launch(){
 app=await electron.launch({executablePath:(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron',args:[],
 env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_PORT:'43224',CABIN_TEST_DATA:dir}});
 const home=await app.firstWindow();await home.waitForFunction(()=>!document.querySelector('#open').disabled);
 const opening=app.waitForEvent('window');await home.locator('#open').click();page=await opening;
 await houseReady();
}
async function houseReady(){await page.waitForFunction(()=>document.querySelector('#status')?.textContent==='Your House is ready.');}
async function ready(text){await page.waitForFunction(t=>document.querySelector('#status').textContent.includes(t),text);}
try{
 await launch();assert.equal(new URL(page.url()).pathname,'/house');
 assert.equal(await page.locator('#future-rooms a').count(),0);
 assert.deepEqual(await page.locator('#future-rooms li').evaluateAll(items=>items.map(li=>li.firstChild.textContent)),['Community','Astrology','Journal','Dream']);
 const denied=await page.evaluate(async()=>{const r=await fetch('/api/house',{credentials:'omit'});return r.status;});assert.equal(denied,401);
 await page.locator('summary').click();await page.locator('#name').fill('Mina');await page.locator('#save-name').click();await ready('local name is saved');
 assert.equal(await page.locator('#welcome').innerText(),'Welcome home, Mina.');
 await page.locator('#quiet-arrival').check();await ready('arrival preference is saved');
 assert.equal(await page.locator('#arrival').isHidden(),true);
 const invalid=await page.evaluate(async()=>{
 const r=await fetch('/api/house/preferences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:1,preferences:{center:['invented-room'],shortcuts:[],passingThrough:'quiet'}})});return r.status;});assert.equal(invalid,400);
 const conflict=await page.evaluate(async()=>{
 const r=await fetch('/api/house/preferences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:0,preferences:{center:['writing'],shortcuts:[],passingThrough:'quiet'}})});return r.status;});assert.equal(conflict,409);
 // House cannot invoke manuscript export's main-process capability.
 const bridge=await page.evaluate(async()=>{try{await window.cabinWriting.saveCopy('fictional');return false;}catch{return true;}});assert.equal(bridge,true);
 await page.locator('#enter-writing').click();await ready('local workspace is ready');
 await page.locator('#new').click();await page.locator('#new-title').fill('Fictional House chapter');await page.locator('#new-form button[type=submit]').click();await ready('Saved locally');
 await page.locator('#manuscript').fill('The quiet forest held the morning.');
 await page.locator('#return-house').click();await ready('Save your writing before returning');
 assert.equal(new URL(page.url()).pathname,'/cabin');
 await page.locator('#save').click();await ready('Saved locally');
 await page.locator('#return-house').click();await houseReady();
 assert.match(await page.locator('#writing-count').innerText(),/1 saved piece/);
 await page.locator('#enter-maia').click();await ready('local workspace is ready');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'message');
 assert.equal(await page.locator('#manuscript').inputValue(),'The quiet forest held the morning.');
 await page.locator('#return-house').click();await houseReady();
 await page.screenshot({path:join(dir,'house-fictional.png'),fullPage:true});
 await app.close();app=null;await new Promise(r=>setTimeout(r,500));
 const db=new DatabaseSync(join(dir,'workspace.sqlite'));const ownerBefore=db.prepare('SELECT member_id FROM cabin_identity').get().member_id;db.close();
 await launch();assert.equal(await page.locator('#welcome').innerText(),'Welcome home, Mina.');
 assert.equal(await page.locator('#arrival').isHidden(),true);
 await page.locator('#enter-writing').click();await ready('local workspace is ready');
 assert.equal(await page.locator('#manuscript').inputValue(),'The quiet forest held the morning.');
 const db2=new DatabaseSync(join(dir,'workspace.sqlite'));assert.equal(db2.prepare('SELECT member_id FROM cabin_identity').get().member_id,ownerBefore);assert.equal(db2.prepare('SELECT COUNT(*) AS n FROM members').get().n,1);db2.close();
 console.log(JSON.stringify({actualHouseWindow:'PASS',localNameAndPreferences:'PASS',canonicalRoomLabels:'PASS',
 unfinishedRoomsNotClickable:'PASS',houseWritingMaiaReturn:'PASS',unsavedWritingGuard:'PASS',
 reopenIdentityAndWriting:'PASS',unauthenticatedRead:'DENIED',invalidPreference:'DENIED',
 stalePreference:'DENIED',houseExportBridge:'DENIED',fictionalStorage:true}));
}finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
