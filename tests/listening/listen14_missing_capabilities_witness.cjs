/** LISTEN-14: FICTIONAL BROWSER REHEARSAL ONLY. Requires Next/PG localhost fixture.
 * Not actual Soullab member audio, production release or iPhone acceptance.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const ROOT='http://127.0.0.1:43281';
const engines=[['chromium',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-background-networking','--disable-extensions']}],['webkit',webkit,{}]];
(async()=>{
for(const [name,driver,options] of engines){
 let b;
 const results=[];
 const check=(label,pass,detail)=>{
   results.push({label,pass:!!pass,detail});
   if(!pass)throw Error('UNSAFE '+label+' '+String(detail||''));
 };
 try{
 b=await driver.launch({headless:true,...options});
 for(const [condition,script] of [
 ['no-web-locks',()=>{Object.defineProperty(navigator,'locks',{configurable:true,value:undefined})}],
 ['no-broadcast-channel',()=>{Object.defineProperty(window,'BroadcastChannel',{configurable:true,value:undefined})}],
 ['denied-broadcast-construction',()=>{window.BroadcastChannel=class{constructor(){throw Error('Fictional blocked channel')}}}]
 ]){
  const ctx=await b.newContext();
  await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(script);
  await page.goto(ROOT+'/listen',{waitUntil:'load'});
  await page.getByRole('button',{name:/Listen to sound sketch/}).click();
  await page.waitForTimeout(300);
  const text=await page.getByRole('status').allTextContents();
  const playing=(await page.locator('[data-listen10-state]').textContent()||'').includes('playing');
  check(condition+'-rejects-sound',!playing,JSON.stringify(text.slice(-2)));
  check(condition+'-no-ui-crash',errors.length===0,JSON.stringify(errors));
  await ctx.close();
 }
 const ctx=await b.newContext();
 await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
 const p=await ctx.newPage();
 await p.addInitScript(()=>{
  Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});
  window.__voices=[];
  const Base=window.Audio;
  function Spy(...args){const a=new Base(...args);window.__voices.push(a);return a}
  Spy.prototype=Base.prototype;window.Audio=Spy;
 });
 await p.goto(ROOT+'/maia',{waitUntil:'load'});
 await p.getByRole('button',{name:'Start fictional MAIA speech'}).click();
 await p.waitForTimeout(400);
 const voice=await p.evaluate(()=>window.__voices.map(a=>({paused:a.paused,currentTime:a.currentTime,readyState:a.readyState})));
 check('no-web-locks-rejects-voice-playback',voice.length>=1&&voice.every(a=>a.paused||a.currentTime===0),JSON.stringify(voice));
 await ctx.close();
 console.log('LISTEN14_MISSING_CAPABILITIES_'+name.toUpperCase(),JSON.stringify({status:'PASS',checks:results.length,results},null,2));
 }catch(e){console.error('LISTEN14_MISSING_CAPABILITIES_'+name.toUpperCase()+'_ERROR',e.stack);console.log(JSON.stringify({status:'FAIL',passed:results.filter(x=>x.pass).length,results}));process.exitCode=2}
 finally{if(b)await b.close()}
}
})().catch(e=>{console.error(e);process.exitCode=2});
