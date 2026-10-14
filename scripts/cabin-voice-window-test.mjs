import {_electron as electron} from 'playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const dir=mkdtempSync(join(tmpdir(),'cabin-voice-fictional-'));let app;
try{
 app=await electron.launch({executablePath:(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron',
 args:['--autoplay-policy=no-user-gesture-required','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-file-for-fake-audio-capture=/tmp/cabin-fictional-capture.wav'],
 env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_PORT:'43226',CABIN_TEST_DATA:dir}});
 const home=await app.firstWindow();await home.waitForFunction(()=>!document.querySelector('#open').disabled);
 const opening=app.waitForEvent('window');await home.locator('#open').click();const page=await opening;
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.setAudioMuted(true)));
 await page.locator('#enter-maia').click();
 await page.waitForFunction(()=>!document.querySelector('#record').disabled);
 await page.evaluate(async encoded=>{
  const context=new AudioContext();const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const buffer=await context.decodeAudioData(bytes.buffer);
  navigator.mediaDevices.getUserMedia=async()=>{
   await context.resume();const source=context.createBufferSource();source.buffer=buffer;source.loop=true;
   const destination=context.createMediaStreamDestination();source.connect(destination);source.start();return destination.stream;
  };
 },readFileSync('/tmp/cabin-fictional-voice.wav').toString('base64'));
 console.log('Recording synthetic speech');
 await page.locator('#record').click();
 await page.waitForFunction(()=>!document.querySelector('#stop-record').hidden);
 await page.waitForTimeout(6000);
 await page.locator('#stop-record').click();
 await page.waitForFunction(()=>document.querySelector('#voice-status').textContent.includes('Review your transcript'),null,{timeout:120000});
 console.log('Transcript returned');
 const transcript=await page.locator('#message').inputValue();assert.match(transcript,/forest|quiet/i);
 assert.equal(await page.locator('.turn').count(),0); // Transcription is not an automatic sent or saved turn.
 await page.locator('#send').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('MAIA replied'),null,{timeout:120000});
 assert.equal(await page.locator('.turn.assistant').count(),1);
 console.log('Preparing and playing speech');
 await page.locator('#listen').click();
 await page.waitForFunction(()=>!document.querySelector('#stop-audio').hidden,null,{timeout:120000});
 assert.match(await page.locator('#voice-status').innerText(),/playing locally/);
 await page.locator('#stop-audio').click();assert.match(await page.locator('#voice-status').innerText(),/Listening stopped/);
 const old=await page.evaluate(async()=>{const r=await fetch('/api/state');const s=await r.json();return {session:s.session,turn:s.turns.find(t=>t.role==='assistant').id};});
 await page.locator('#new-chat').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('new conversation'));
 const refused=await page.evaluate(async(old)=>{const r=await fetch('/api/voice/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(old)});return r.status;},old);
 assert.equal(refused,409);
 const auth=await page.evaluate(async()=>{const r=await fetch('/api/voice/status',{credentials:'omit'});return r.status;});assert.equal(auth,401);
 console.log(JSON.stringify({packagedVoiceWindow:'PASS',syntheticAudioStream:'PASS',realOfflineWhisper:'PASS',
 reviewBeforeSend:'PASS',localMaiaReply:'PASS',realOfflineKokoroPlayback:'PASS',stopPlayback:'PASS',
 oldConversationAudio:'DENIED',unauthenticated:'DENIED',physicalMicrophone:'NOT_TESTED',speakerAudio:'MUTED_FOR_TEST'}));
}finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
