import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir=mkdtempSync(join(tmpdir(),'cabin-functional-fictional-'));
const executable=(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron';
const env={...process.env,CABIN_CANARY:'1',CABIN_TEST_DATA:dir};
let app, page, chapterId, applied, proposalId;
const original='The quiet room held the morning light. Mara paused beside the window and listened to the trees.';
async function launch(){
 app=await electron.launch({executablePath:executable,args:[],env,timeout:30000});
 const home=await app.firstWindow();
 await home.waitForFunction(()=>!document.querySelector('#open').disabled,{timeout:30000});
 const opening=app.waitForEvent('window');
 await home.locator('#open').click();
 page=await opening;
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent==='Your local workspace is ready.');
 assert.equal(await page.evaluate(()=>typeof window.require),'undefined');
 return home;
}
async function click(id){console.log('click',id);await page.locator('#'+id).click();}
async function ready(text,timeout=150000){console.log('waiting',text);await page.waitForFunction(t=>document.querySelector('#status').textContent.includes(t),text,{timeout});}
try{
 await launch();
 // The canary window uses the real packaged runtime and local model.
 await click('new');await page.locator('#new-title').fill('Fictional forest chapter');
 await page.locator('#new-form button[type=submit]').click();await ready('Saved locally');
 chapterId=await page.locator('#works').inputValue();
 await page.locator('#manuscript').fill(original);await click('save');await ready('Saved locally');
 await page.locator('#message').fill('This is a fictional test. My name is Mara. Please greet me in one sentence.');
 await click('send');await ready('MAIA replied');
 assert.equal(await page.locator('.turn.assistant').count(),1);
 assert.match(await page.locator('.turn.assistant').innerText(),/Mara/i);
 await page.locator('#message').fill('Correction: my name is Mira. Please use Mira from now on.');
 await click('send');await ready('MAIA replied');
 assert.match(await page.locator('.turn.assistant').last().innerText(),/Mira/i);
 await page.locator('#intention').fill('Replace the word quiet with still; preserve every other word.');
 await click('suggest');await ready('A suggestion is ready');
 assert.equal(await page.locator('#manuscript').inputValue(),original);
 applied=await page.locator('#replacement').innerText();
 assert.notEqual(applied,original);
 await click('apply');await ready('Applied and saved');
 assert.equal(await page.locator('#manuscript').inputValue(),applied);
 await click('undo');await ready('Previous saved text restored');
 assert.equal(await page.locator('#manuscript').inputValue(),original);
 await click('history');await ready('Saved versions opened');
 assert.ok(await page.locator('#version option').count()>=4);
 await click('close-history');
 await click('export');await ready('Copy saved');
 assert.equal(readFileSync(join(dir,'fictional-copy.txt'),'utf8'),original);
 const stale=await page.evaluate(async({id})=>{const r=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,revision:1,body:'stale'})});return r.status;},{id:chapterId});
 assert.equal(stale,409);
 // Auth and cross-site writes are refused without changing any writing.
 const auth=await page.evaluate(async()=>{const r=await fetch('/api/state',{credentials:'omit'});return r.status;});
 assert.equal(auth,401);
 const invalid=await page.evaluate(async()=>{
 const r=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'});return r.status;});
 assert.equal(invalid,403);
 await page.screenshot({path:join(dir,'functional-window.png'),fullPage:true});
 await app.close();app=null;
 await new Promise(resolve=>setTimeout(resolve,1200));
 await launch();
 assert.equal(await page.locator('#works').inputValue(),chapterId);
 assert.equal(await page.locator('#manuscript').inputValue(),original);
 assert.equal(await page.locator('.turn.assistant').count(),2);
 const previousSession=await page.locator('#conversations').inputValue();
 await click('new-chat');await ready('A new conversation');
 assert.equal(await page.locator('.turn').count(),0);
 await page.locator('#conversations').selectOption(previousSession);await click('resume-chat');await ready('Saved conversation resumed');
 assert.equal(await page.locator('.turn.assistant').count(),2);
 await page.locator('#message').fill('Please consider this fictional question slowly: how might a forest change over a hundred years?');
 await click('send');await ready('MAIA is responding locally');
 await app.close();app=null;await new Promise(resolve=>setTimeout(resolve,500));
 await launch();assert.equal(await page.locator('#manuscript').inputValue(),original);
 // An interrupted reply is never persisted as an incomplete user/assistant pair.
 assert.equal(await page.locator('.turn.assistant').count(),2);
 // Explicitly qualify kernel-level outbound denial without disabling the Mac's network.
 const probe=spawnSync('/usr/bin/sandbox-exec',['-p',
 '(version 1)(allow default)(deny network-outbound)(allow network-outbound (remote ip "localhost:*"))',
 executable.replace('/Contents/MacOS/Electron','/Contents/Resources/app/runtime/node'),'-e',
 "require('node:net').connect({host:'1.1.1.1',port:443}).on('error',e=>{console.log(e.code);process.exit(e.code==='EPERM'?0:1)});setTimeout(()=>process.exit(2),2000)"],{encoding:'utf8',timeout:5000});
 assert.equal(probe.status,0,probe.stdout+probe.stderr);
 console.log(JSON.stringify({packagedWindow:'PASS',automaticRuntime:'PASS',localConversation:'PASS',
 correction:'PASS',suggestion:'PASS',apply:'PASS',undo:'PASS',versions:'PASS',download:'PASS',
 reopenRecovery:'PASS',interruptedReplyRecovery:'PASS',newConversationBoundary:'PASS',unauthenticatedAccess:'DENIED',crossSiteWrite:'DENIED',
 runtimeExternalNetwork:'DENIED',fictionalDataOnly:true}));
} finally {if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
