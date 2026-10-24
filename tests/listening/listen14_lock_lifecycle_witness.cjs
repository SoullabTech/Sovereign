/** LISTEN-14: FICTIONAL BROWSER REHEARSAL ONLY. Requires Next/PG localhost fixture.
 * Not actual Soullab member audio, production release or iPhone acceptance.
 */
'use strict';
const {chromium,webkit}=require('playwright-core');
const ROOT='http://127.0.0.1:43281';
const LOCK='soullab:exclusive-audio-output:v1';
(async()=>{
 for(const [name,driver,opts] of [['chromium',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking']}],['webkit',webkit,{}]]){
 let b;const checks=[];
 const assert=(desc,pass,info)=>{checks.push({desc,pass:!!pass,info});if(!pass)throw Error(desc+' '+String(info))};
 try{
 b=await driver.launch({headless:true,...opts});
 const ctx=await b.newContext();await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
 const voice=await ctx.newPage();await voice.goto(ROOT+'/maia',{waitUntil:'load'});
 const music=await ctx.newPage();await music.goto(ROOT+'/listen',{waitUntil:'load'});
 const held=async()=>music.evaluate(async name=>{
  const state=await navigator.locks.query();
  return state.held.filter(x=>x.name===name).length;
 },LOCK);
 assert('no-lock-before-play',await held()===0);
 await voice.getByRole('button',{name:'Start fictional MAIA speech'}).click();
 await voice.getByText('Fictional MAIA streaming voice playing').waitFor({timeout:11000});
 await voice.waitForTimeout(140);
 assert('voice-holds-one-exclusive-lock',await held()===1);
 await music.getByRole('button',{name:/Listen to sound sketch/}).click();
 await music.waitForTimeout(150);
 assert('denied-music-does-not-add-lock',await held()===1);
 await voice.getByRole('button',{name:'Stop fictional MAIA speech'}).click();
 await voice.waitForTimeout(80);
 assert('voice-stop-releases-lock',await held()===0);
 await music.getByRole('button',{name:/Listen to sound sketch/}).click();
 await music.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:7000});
 assert('music-holds-one-exclusive-lock',await held()===1);
 await music.getByRole('button',{name:'Pause persistent music'}).click();
 await music.waitForTimeout(85);
 assert('music-pause-releases-lock',await held()===0);
 await music.getByRole('button',{name:'Resume persistent music'}).click();
 await music.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:7000});
 assert('music-reacquires-lock',await held()===1);
 await music.close();
 const hAfter=await voice.evaluate(async name=>(await navigator.locks.query()).held.filter(x=>x.name===name).length,LOCK);
 assert('tab-close-releases-browser-lock',hAfter===0);
 console.log('LISTEN14_LOCK_LIFECYCLE_'+name.toUpperCase(),JSON.stringify({status:'PASS',checks:checks.length,results:checks},null,2));
 }catch(e){console.error('LISTEN14_LOCK_LIFECYCLE_'+name.toUpperCase()+'_ERROR',e.stack);process.exitCode=2}
 finally{if(b)await b.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=2});
