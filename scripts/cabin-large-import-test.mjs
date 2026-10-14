import {_electron as electron} from 'playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
const dir=mkdtempSync(join(tmpdir(),'cabin-large-fictional-'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const buffer=Buffer.alloc(20*1024*1024,97);
buffer.write('Fictional manuscript\r\n\r\nForest — 水 🌲\r\n');
const tail=Buffer.from('\r\nEND — 水 🌲');
tail.copy(buffer,buffer.length-tail.length);
const text=buffer.toString('utf8');
let app,page,id;
async function launch(){
 app=await electron.launch({executablePath:(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron',
 args:[],env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_PORT:'43221',CABIN_TEST_DATA:dir}});
 const home=await app.firstWindow();await home.waitForFunction(()=>!document.querySelector('#open').disabled);
 const opened=app.waitForEvent('window');await home.locator('#open').click();page=await opened;
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent==='Your local workspace is ready.');
}
async function ready(message){await page.waitForFunction(m=>document.querySelector('#status').textContent.includes(m)&&!document.querySelector('#import').disabled,message,{timeout:90000});}
async function digestEditor(){return page.evaluate(async()=>{
 const bytes=new TextEncoder().encode(document.querySelector('#manuscript').value);
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
});}
try{
 await launch();
 await page.locator('#file').setInputFiles({name:'Large-fictional.txt',mimeType:'text/plain',buffer});
 await ready('Imported and saved locally');
 id=await page.locator('#works').inputValue();
 assert.equal(await digestEditor(),hash(text.replace(/\r\n?/g,'\n')));
 assert.match(await page.locator('#saved').innerText(),/Saved locally/);
 const state=await page.evaluate(async()=>{const r=await fetch('/api/state');return r.json();});
 assert.equal(state.manuscripts.length,1);assert.equal('body' in state.manuscripts[0],false);
 await page.locator('#export').click();await ready('Copy saved');
 assert.equal(hash(readFileSync(join(dir,'fictional-copy.txt'))),hash(buffer));
 await page.locator('#save').click();await ready('Saved locally');
 await page.locator('#undo').click();await ready('Previous saved text restored');
 await page.locator('#history').click();await ready('Saved versions opened');
 const versions=await page.evaluate(async(id)=>{const r=await fetch('/api/versions?id='+id);return r.json();},id);
 assert.ok(versions.length>=3);assert.equal(versions.some(v=>'body' in v),false);
 await page.locator('#close-history').click();
 await page.locator('#file').setInputFiles({name:'Second-fictional.md',mimeType:'text/markdown',buffer:Buffer.from('Second fictional writing.')});
 await ready('Imported and saved locally');
 await page.locator('#works').selectOption(id);
 await page.waitForFunction(()=>document.querySelector('#saved').textContent.includes('Saved locally')&&!document.querySelector('#import').disabled);
 assert.equal(await digestEditor(),hash(text.replace(/\r\n?/g,'\n')));
 await page.locator('#file').setInputFiles({name:'Too-large.txt',mimeType:'text/plain',buffer:Buffer.alloc(20*1024*1024+1,97)});
 await ready('up to 20 MB');
 const denied=await page.evaluate(async()=>{
 const r=await fetch('/api/import?name=invalid.txt',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:new Uint8Array([255,254,0])});return r.status;});
 assert.equal(denied,400);
 assert.equal((await page.evaluate(async()=>{const r=await fetch('/api/state');return r.json();})).manuscripts.length,2);
 await app.close();app=null;await new Promise(r=>setTimeout(r,500));
 await launch();assert.equal(await page.locator('#works').inputValue(),id);
 assert.equal(await digestEditor(),hash(text.replace(/\r\n?/g,'\n')));
 console.log(JSON.stringify({actualPackagedWindow:'PASS',exact20MiBImport:'PASS',unicodeAndCRLF:'PRESERVED',exportHash:'MATCH',
 saveUndo:'PASS',summaryOnlyInventoryAndVersions:'PASS',multipleWritingSelection:'PASS',overLimit:'REJECTED',
 invalidEncoding:'REJECTED_WITHOUT_PARTIAL_RECORD',reopen:'PASS',fictionalDataOnly:true}));
}finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
