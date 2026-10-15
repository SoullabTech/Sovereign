import {_electron as electron} from 'playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readdirSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'cabin-sanctuary-fictional-'));
const marker='FICTIONAL_SANCTUARY_'+Date.now();let app;
async function launch(){
 app=await electron.launch({executablePath:(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron',args:[],
 env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_PORT:'43228',CABIN_TEST_DATA:dir}});
 const home=await app.firstWindow();await home.waitForFunction(()=>!document.querySelector('#open').disabled);
 const opening=app.waitForEvent('window');await home.locator('#open').click();const page=await opening;
 await page.locator('#enter-maia').click();await page.waitForFunction(()=>document.querySelector('#privacy-status').textContent.includes('Ordinary'));
 return page;
}
function assertNoPrivateFiles(path){
 for(const entry of readdirSync(path,{withFileTypes:true})){
  const child=join(path,entry.name);
  if(entry.isDirectory())assertNoPrivateFiles(child);
  else if(entry.isFile())assert.equal(readFileSync(child).includes(Buffer.from(marker)),false,'Private text reached '+entry.name);
 }
}
try{
 let page=await launch();
 await page.locator('#message').fill('Fictional ordinary test. Please say hello briefly.');
 await page.locator('#send').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('MAIA replied'),null,{timeout:150000});
 const ordinary=await page.evaluate(()=>fetch('/api/state').then(r=>r.json()));
 assert.equal(ordinary.turns.length,2);assert.equal(ordinary.sessions.length,1);
 await page.locator('#message').fill('Unsent fictional draft');
 await page.locator('#sanctuary').click();
 assert.match(await page.locator('#status').innerText(),/send or clear/i);
 assert.equal(await page.locator('#message').inputValue(),'Unsent fictional draft');
 await page.locator('#message').fill('');
 await page.locator('#sanctuary').click();
 await page.waitForFunction(()=>document.querySelector('#privacy-status').textContent.includes('Sanctuary ·'));
 assert.equal(await page.locator('.turn').count(),0);assert.equal(await page.locator('#import').isDisabled(),true);
 const denied=await page.evaluate(async()=>{const r=await fetch('/api/new',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Must not save',body:'private'})});return r.status;});
 assert.equal(denied,409);
 await page.locator('#message').fill(marker+' This is fictional test material. Answer with one short sentence.');
 await page.locator('#send').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('MAIA replied in Sanctuary'),null,{timeout:150000});
 const privateState=await page.evaluate(()=>fetch('/api/state').then(r=>r.json()));
 assert.equal(privateState.sanctuary,true);assert.equal(privateState.turns.length,2);
 assert.equal(privateState.sessions.length,1);assert.equal(privateState.turns.some(t=>t.content.includes('ordinary test')),false);
 const speech=await page.evaluate(async s=>{const r=await fetch('/api/voice/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:s.session,turn:s.turns[1].id})});return {status:r.status,bytes:(await r.arrayBuffer()).byteLength};},privateState);
 assert.equal(speech.status,200);assert.ok(speech.bytes>44);
 assertNoPrivateFiles(dir);
 await page.locator('#sanctuary').click();
 await page.waitForFunction(()=>document.querySelector('#privacy-status').textContent.includes('Ordinary'));
 assert.equal(await page.locator('.turn').count(),0);
 const expired=await page.evaluate(async s=>(await fetch('/api/voice/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:s.session,turn:s.turns[1].id})})).status,privateState);
 assert.equal(expired,409);
 await page.locator('#conversations').selectOption(ordinary.session);await page.locator('#resume-chat').click();
 await page.waitForFunction(()=>document.querySelectorAll('.turn').length===2);
 assert.match(await page.locator('#turns').innerText(),/ordinary test/);
 await page.locator('#sanctuary').click();
 await page.waitForFunction(()=>document.querySelector('#privacy-status').textContent.includes('Sanctuary ·'));
 await page.locator('#message').fill(marker+' Fictional second private test. Reply briefly.');
 await page.locator('#send').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('MAIA replied in Sanctuary'),null,{timeout:150000});
 assertNoPrivateFiles(dir);
 await app.close();app=null;
 assertNoPrivateFiles(dir);
 page=await launch();
 const reopened=await page.evaluate(()=>fetch('/api/state').then(r=>r.json()));
 assert.equal(reopened.sanctuary,false);assert.equal(reopened.turns.length,2);
 assert.equal(reopened.sessions.some(s=>s.id===privateState.session),false);
 assertNoPrivateFiles(dir);
 console.log(JSON.stringify({packagedSanctuary:'PASS',ordinaryDurability:'PASS',privateConversation:'PASS',privateSpeech:'PASS',writeGuard:'PASS',privateTextAbsentFromFiles:'PASS',exitClears:'PASS',oldVoiceDenied:'PASS',reopen:'PASS',physicalAudio:'NOT_TESTED'}));
}finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
