/** LISTEN-07: browser tab-hidden continuity check; isolated React fixture only.
 * Assumes a listening journey was started by a user interaction; never bypasses autoplay permission.
 * Does not certify Safari, iOS lock-screen playback, route navigation or real device DAC quality.
 */
'use strict';
const pp=require('puppeteer-core');
(async()=>{
 const root=process.env.LISTEN_UI_FIXTURE_DIR, r={};
 const browser=await pp.launch({headless:true,executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',userDataDir:root+'/background-chrome-profile',args:['--no-first-run','--disable-background-networking','--disable-extensions','--autoplay-policy=no-user-gesture-required']});
 try{
  const p1=await browser.newPage();
  await p1.evaluateOnNewDocument(()=>{window.__listeningContexts=[];const Base=window.AudioContext;window.AudioContext=class extends Base{constructor(...x){super(...x);window.__listeningContexts.push(this);}}});
  await p1.goto('file://'+root+'/index.html');
  await p1.waitForSelector('button[aria-label="Play original sound sketch"]');
  await p1.click('button[aria-label="Play original sound sketch"]');
  await p1.waitForSelector('button[aria-label="Pause original sound sketch"]');
  r.started=await p1.evaluate(()=>({playing:!!document.querySelector('button[aria-label="Pause original sound sketch"]'),state:window.__listeningContexts?.[0]?.state,hidden:document.hidden}));
  const p2=await browser.newPage();await p2.goto('data:text/html,<h1>Coding work foreground</h1>');await p2.bringToFront();
  await new Promise(resolve=>setTimeout(resolve,450));
  r.background=await p1.evaluate(()=>({playing:!!document.querySelector('button[aria-label="Pause original sound sketch"]'),state:window.__listeningContexts?.[0]?.state,hidden:document.hidden}));
  await p1.bringToFront();
  await p1.click('button[aria-label="Pause original sound sketch"]');
  r.stopped=await p1.evaluate(()=>({playing:!!document.querySelector('button[aria-label="Pause original sound sketch"]'),hidden:document.hidden}));
  r.pass=!!r.started.playing&&!!r.background.playing&&r.background.hidden&&(!r.stopped.playing);
  console.log(JSON.stringify({status:r.pass?'PASS':'FAIL',detail:r},null,2));
  if(!r.pass)process.exitCode=1;
 }catch(e){console.error('LISTEN_BACKGROUND_FAIL',e.stack);process.exitCode=1;}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
