import {_electron as electron} from 'playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const dir=mkdtempSync(join(tmpdir(),'cabin-readiness-fictional-'));
let app;
try{
 app=await electron.launch({executablePath:(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron',args:[],
 env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_PORT:'43223',CABIN_TEST_DATA:dir}});
 const page=await app.firstWindow();
 await page.waitForFunction(()=>!document.querySelector('#check').disabled && document.querySelector('#status').textContent.includes('Check completed'));
 assert.match(await page.locator('#status').innerText(),/Workspace ready/);
 await page.evaluate(()=>{
 window.messages=[];
 new MutationObserver(()=>window.messages.push(document.querySelector('#status').textContent))
 .observe(document.querySelector('#status'),{childList:true,subtree:true,characterData:true});
 });
 await page.locator('#check').click();
 await page.waitForFunction(()=>!document.querySelector('#check').disabled && document.querySelector('#status').textContent.includes('Check completed'));
 const messages=await page.evaluate(()=>window.messages);
 assert.ok(messages.some(m=>m.includes('Checking your local workspace')));
 assert.ok(messages.some(m=>m.includes('Check completed at')));
 assert.equal(await page.locator('#open').isDisabled(),false);
 const old=Number(execFileSync('lsof',['-t','-iTCP:43223','-sTCP:LISTEN'],{encoding:'utf8'}).trim());
 process.kill(old,'SIGTERM');
 await page.waitForTimeout(300);
 await page.locator('#check').click();
 await page.waitForFunction(()=>!document.querySelector('#check').disabled && document.querySelector('#status').textContent.includes('Workspace ready'));
 const fresh=Number(execFileSync('lsof',['-t','-iTCP:43223','-sTCP:LISTEN'],{encoding:'utf8'}).trim());
 assert.notEqual(old,fresh);
 assert.equal(await page.locator('#open').isDisabled(),false);
 console.log(JSON.stringify({actualPackagedWindow:'PASS',visibleChecking:'PASS',completionTime:'PASS',deadRuntimeRestart:'PASS',isolatedStorage:true}));
}finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
