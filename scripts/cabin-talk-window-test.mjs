import {_electron as electron} from 'playwright';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const dir=mkdtempSync(join(tmpdir(),'cabin-voice-fictional-'));const fixture=join(dir,'fictional.wav');let app;
try{
 const speech=await fetch('http://127.0.0.1:18880/v1/audio/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'Fictional test. The forest is quiet today.',voice:'af_kore',model:'kokoro',response_format:'wav',speed:1}),signal:AbortSignal.timeout(90000)});
 assert.equal(speech.ok,true);writeFileSync(fixture,Buffer.from(await speech.arrayBuffer()));
 app=await electron.launch({executablePath:(process.env.CABIN_TEST_APP||'/Users/soullab/Applications/Cabin.app')+'/Contents/MacOS/Electron',
 args:['--autoplay-policy=no-user-gesture-required','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'],
 env:{...process.env,CABIN_CANARY:'1',CABIN_TEST_PORT:'43231',CABIN_TEST_DATA:dir}});
 const home=await app.firstWindow();await home.waitForFunction(()=>!document.querySelector('#open').disabled);
 const opening=app.waitForEvent('window');await home.locator('#open').click();const page=await opening;
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().forEach(w=>w.webContents.setAudioMuted(true)));
 await page.locator('#enter-maia').click();
 if(process.env.CABIN_TEST_SANCTUARY==='1'){await page.locator('#sanctuary').click();await page.waitForFunction(()=>document.querySelector('#privacy-status').textContent.includes('Sanctuary ·'));}
 await page.waitForFunction(()=>!document.querySelector('#record').disabled);
 await page.evaluate(async encoded=>{
  const context=new AudioContext();const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const buffer=await context.decodeAudioData(bytes.buffer);
  navigator.mediaDevices.getUserMedia=async()=>{
   await context.resume();const source=context.createBufferSource();source.buffer=buffer;source.loop=true;
   const destination=context.createMediaStreamDestination();source.connect(destination);source.start();window.testVoiceStream=destination.stream;return destination.stream;
  };
 },readFileSync(fixture).toString('base64'));

 async function record(){await page.locator('#record').click();await page.waitForFunction(()=>!document.querySelector('#stop-record').hidden);}
 assert.equal(await page.locator('#talk-mode').isChecked(),false);
 await page.locator('#talk-mode').check();
 await record();await page.locator('#cancel-record').click();
 await page.waitForFunction(()=>document.querySelector('#voice-status').textContent.includes('Recording cancelled'));
 assert.equal(await page.locator('.turn').count(),0);
 assert.equal(await page.evaluate(()=>window.testVoiceStream.getTracks().every(t=>t.readyState==='ended')),true);
 console.log('Cancelled capture released microphone');
 await record();await page.waitForTimeout(6000);await page.locator('#talk-mode').uncheck();await page.locator('#stop-record').click();
 await page.waitForFunction(()=>document.querySelector('#voice-status').textContent.includes('Review your transcript'),null,{timeout:120000});
 assert.match(await page.locator('#message').inputValue(),/forest|quiet/i);assert.equal(await page.locator('.turn').count(),0);
 await page.locator('#message').fill('');await page.locator('#talk-mode').check();
 await record();await page.waitForTimeout(6000);await page.locator('#stop-record').click();
 await page.waitForFunction(()=>document.querySelector('#voice-status').textContent.includes('playing locally'),null,{timeout:150000});
 assert.equal(await page.locator('.turn').count(),2);assert.match(await page.locator('.turn.user').innerText(),/forest|quiet/i);
 assert.equal(await page.locator('#message').inputValue(),'');
 assert.equal(await page.evaluate(()=>window.testVoiceStream.getTracks().every(t=>t.readyState==='ended')),true);
 await page.locator('#talk-mode').uncheck();assert.equal(await page.locator('#stop-audio').isVisible(),false);
 console.log(JSON.stringify({talkOptIn:'PASS',cancelRecording:'PASS',turnOffReturnsToReview:'PASS',automaticSend:'PASS',automaticLocalReplyPlayback:'PASS',microphoneReleased:'PASS',noAutomaticMicRestart:'PASS',physicalAudio:'SYNTHETIC_AND_MUTED',normalAutoplay:'NOT_QUALIFIED'}));
}finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true});}
