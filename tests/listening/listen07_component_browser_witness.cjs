/** LISTEN-07: Execute real Chrome interactions against a temporary React bundle of reviewed source.
 * File-origin; no Next / member auth / production data. Depends on Puppeteer-core and Chrome.
 * Generate fixture with listen07_fixture_builder.cjs; never silently claim Safari/native coverage.
 */
'use strict';
const pp=require('puppeteer-core');
const fs=require('node:fs');
const root=process.env.LISTEN_UI_FIXTURE_DIR;
if(!root) throw new Error('Set LISTEN_UI_FIXTURE_DIR to the isolated fixture path');
const checks=[];
const assert=(name,ok,detail='')=>{checks.push({name,pass:!!ok,detail});if(!ok)throw new Error('FAILED '+name+' '+detail)};
(async()=>{
 let browser;
 try{
 browser=await pp.launch({headless:true,executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',userDataDir:root+'/browser-profile',args:['--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--autoplay-policy=no-user-gesture-required']});
 const page=await browser.newPage();
 const nonlocal=[],pageErrors=[];
 page.on('request',r=>{if(!/^(file|data|blob):/.test(r.url()))nonlocal.push(r.url())});
 page.on('pageerror',e=>pageErrors.push(String(e)));
 page.on('dialog',d=>d.accept());
 await page.goto('file://'+root+'/index.html',{waitUntil:'load'});
 await page.waitForSelector('h1',{timeout:10000});
 assert('react-room-mounted',await page.$eval('h1',e=>e.textContent)==='The Blue Hour');
 assert('secure-browser-WebCrypto',await page.evaluate(()=>isSecureContext&&!!crypto.subtle));
 await page.click('button[aria-pressed="false"]'); // first inactive mood: focus
 assert('mood-change-reactive',await page.$eval('h1',e=>e.textContent)==='Between the Tides');
 await page.click('button[aria-expanded="false"]');
 await page.type('#listen-note','I remember the river in moonlight.');
 assert('private-reflection-editable',(await page.$eval('#listen-note',e=>e.value)).includes('river in moonlight'));
 await page.type('#list-name','Existential Bliss');
 await page.type('#list-url','https://open.spotify.com/playlist/123?si=tracking');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()==='Add link')?.click());
 assert('playlist-added',await page.$eval('section:has(#library-title)',e=>e.textContent.includes('Existential Bliss')));
 const href=await page.$eval('section:has(#library-title) a[href*="spotify"]',e=>e.href);
 assert('provider-query-parameters-stripped',href==='https://open.spotify.com/playlist/123',href);
 await page.type('#list-url','javascript:alert(1)');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()==='Add link')?.click());
 assert('unsafe-playlist-link-refused',await page.$eval('.status',e=>e.textContent.includes('Use an HTTPS playlist')));
 await page.$eval('#list-url',e=>e.value='');
 const csv=await page.$('#import-playlist');
 await csv.uploadFile(root+'/fictional-playlist.csv');
 await page.waitForFunction(()=>document.querySelector('section:has(#library-title)')?.textContent.includes('Luminous Drift'),{timeout:5000});
 assert('csv-import-added-reference',await page.$eval('section:has(#library-title)',e=>e.textContent.includes('Luminous Drift')));
 assert('csv-script-inert',await page.evaluate(()=>!window.__malicious&&!document.querySelector('script[src="javascript:alert(1)"]')));
 await page.evaluate(()=>{window.__capturedBlobs=[];const original=URL.createObjectURL.bind(URL);URL.createObjectURL=(blob)=>{window.__capturedBlobs.push(blob);return original(blob)}});
 await page.type('#listen-private-passphrase','One long memorable river of listening twenty six');
 await page.type('#listen-private-confirm','two different secret phrases');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()==='Save encrypted backup')?.click());
 await page.waitForFunction(()=>document.querySelector('section:has(#listen-private-title) [role=status]')?.textContent.includes('do not match'));
 assert('backup-mismatch-rejected',await page.$eval('section:has(#listen-private-title) [role=status]',e=>e.textContent.includes('do not match')));
 await page.$eval('#listen-private-confirm',e=>{e.value='';e.dispatchEvent(new Event('input',{bubbles:true}))}); 
 await page.click('#listen-private-confirm',{clickCount:3});
 await page.keyboard.press('Backspace');
 await page.type('#listen-private-confirm','One long memorable river of listening twenty six');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()==='Save encrypted backup')?.click());
 await page.waitForFunction(()=>document.querySelector('section:has(#listen-private-title) [role=status]')?.textContent.includes('backup saved'),{timeout:11000});
 const ciphertext=await page.evaluate(()=>window.__capturedBlobs.at(-1).text());
 const envelope=JSON.parse(ciphertext);
 fs.writeFileSync(root+'/fictional-backup.json',ciphertext,'utf8');
 assert('encrypted-export-valid-envelope',envelope.format==='SOULLAB_LISTEN_PRIVATE_BACKUP_V1');
 assert('sensitive-content-not-in-ciphertext',!ciphertext.includes('I remember the river')&&!ciphertext.includes('Existential Bliss'));
 assert('passphrase-fields-cleared',await page.$eval('#listen-private-passphrase',e=>e.value)===''&&await page.$eval('#listen-private-confirm',e=>e.value)==='');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()==='Clear tab data')?.click());
 await page.waitForFunction(()=>document.querySelector('section:has(#library-title)')?.textContent.includes('Your collections will appear here'));
 assert('clear-shelf-removed-collections',!(await page.$eval('section:has(#library-title)',e=>e.textContent)).includes('Existential Bliss'));
 assert('clear-shelf-removed-journal',await page.$eval('#listen-note',e=>e.value)==='');
 const uploader=await page.$('#listen-private-file');
 await uploader.uploadFile(root+'/fictional-backup.json');
 await page.type('#listen-private-passphrase','Incorrect passphrase with twelve chars');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()==='Restore with passphrase')?.click());
 await page.waitForFunction(()=>document.querySelector('section:has(#listen-private-title) [role=status]')?.textContent.includes('Unable to unlock'),{timeout:11000});
 assert('wrong-password-ui-refused',!(await page.$eval('section:has(#library-title)',e=>e.textContent)).includes('Existential Bliss'));
 await page.$eval('#listen-private-passphrase',e=>{const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(e,'One long memorable river of listening twenty six');e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(e=>e.textContent.trim()==='Restore with passphrase')?.click());
 try{await page.waitForFunction(()=>document.querySelector('section:has(#listen-private-title) [role=status]')?.textContent.includes('Restored'),{timeout:11000})}catch(e){console.log('RESTORE_DEBUG',await page.$eval('section:has(#listen-private-title) [role=status]',el=>el.textContent));throw e;}
 assert('encrypted-restore-recovered-collection',await page.$eval('section:has(#library-title)',e=>e.textContent.includes('Existential Bliss')));
 assert('encrypted-restore-recovered-journal',await page.$eval('#listen-note',e=>e.value)==='I remember the river in moonlight.');
 assert('restored-passphrase-cleared',await page.$eval('#listen-private-passphrase',e=>e.value)==='');
 const playerInput=await page.$('#member-audio-file');
 await playerInput.uploadFile(root+'/fictional-24bit-48k.flac');
 await page.waitForSelector('audio[controls]',{timeout:5000});
 const audioInfo=await page.evaluate(async()=>{const a=document.querySelector('audio[controls]');await a.play();await new Promise(r=>setTimeout(r,650));return {paused:a.paused,currentTime:a.currentTime,readyState:a.readyState}});
 assert('local-flac-decoded-and-advanced',!audioInfo.paused&&audioInfo.currentTime>0.1,JSON.stringify(audioInfo));
 await page.click('button[aria-label="Play original sound sketch"]');
 await page.waitForFunction(()=>!!document.querySelector('button[aria-label="Pause original sound sketch"]'),{timeout:7000});
 const audioPaused=await page.evaluate(()=>document.querySelector('audio[controls]')?.paused);
 assert('sound-sketch-pauses-member-audio',audioPaused);
 await page.click('button[aria-label="Pause original sound sketch"]');
 assert('explicit-sketch-stop',await page.$('button[aria-label="Play original sound sketch"]')!==null);
 assert('zero-external-network-requests',nonlocal.length===0,JSON.stringify(nonlocal));
 assert('zero-javascript-page-errors',pageErrors.length===0,JSON.stringify(pageErrors));
 console.log(JSON.stringify({status:'PASS',checks:checks.length,passed:checks.filter(x=>x.pass).length,audioInfo,nonlocal,pageErrors,source:'isolated React components from GitHub pin f8c32c7c7641abc41c0496046ae97a2a05db2372',details:checks},null,2));
 }catch(e){console.error('LISTEN07_UI_FAIL',e.stack);console.log(JSON.stringify({status:'FAIL',checks:checks.length,passed:checks.filter(x=>x.pass).length,details:checks},null,2));process.exitCode=1;}
 finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
