'use strict';
/** LISTEN-23 synthetic/fictional browser proof. No member data, recordings or provider links.
 * Uses real existing Next ListeningRoom + optional persistent player under test auth.
 * A downloaded passphrase backup must never be interpreted as an accepted member vault.
 */
const fs=require('node:fs');
const {chromium,webkit}=require('playwright-core');
const ROOT='http://127.0.0.1:43289';
async function run(engine,driver,opts){
 let b;const checks=[],errors=[],external=[];
 const check=(name,pass,details)=>{checks.push({name,pass:!!pass,details});if(!pass)throw Error('FAIL '+name+' '+String(details||''))};
 try{
 b=await driver.launch({headless:true,...opts,timeout:18000});
 const ctx=await b.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
 await ctx.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
 const p=await ctx.newPage();
 p.on('pageerror',e=>errors.push(String(e)));
 p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(ROOT))external.push(r.url())});
 await p.addInitScript(()=>{
   window.__listen23GainNodes=[];
   const Base=window.AudioContext;
   if(Base)window.AudioContext=class extends Base{
     createGain(){const g=super.createGain();window.__listen23GainNodes.push(g);return g}
   };
 });
 const response=await p.goto(ROOT+'/listen',{waitUntil:'load',timeout:30000});
 check('existing-authenticated-Listening-Room',response.status()===200,response.status());
 await p.locator('[data-listen23-receptive-field]').waitFor();
 check('receptive-field-in-existing-room',await p.locator('h1').textContent().then(s=>s==='The Blue Hour'));
 check('no-saved-data-without-choice',await p.locator('[data-listen23-saved-field]').count()===0);
 check('no-auto-music-on-arrival',await p.locator('[data-listen10-persistent-dock]').getAttribute('style').then(s=>s.includes('none')));
 await p.locator('[data-listen23-invitation="release"]').click();
 const label=await p.locator('#receptive-field-name').inputValue();
 check('expressive-release-is-allowed',label==='Room for catharsis',label);
 check('catharsis-self-selected-not-diagnosed',await p.locator('[data-listen23-intention="release"]').getAttribute('aria-pressed')==='true');
 check('release-preset-still-no-auto-music',await p.locator('[data-listen10-persistent-dock]').getAttribute('style').then(s=>s.includes('none')));
 await p.getByRole('button',{name:'Tailor this sound'}).click();
 await p.locator('[data-listen23-soundboard]').waitFor();
 check('three-intuitive-controls',await p.locator('[data-listen23-soundboard] input[type=range]').count()===3);
 check('pulse-space-not-zero-sum',await p.locator('[data-listen23-dial="pulse"]').textContent().then(s=>s.includes('75'))&&await p.locator('[data-listen23-dial="space"]').textContent().then(s=>s.includes('65')));
 await p.getByRole('button',{name:'Play this sound field'}).click();
 await p.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor({timeout:10000});
 const values=await p.evaluate(async()=>{
   await new Promise(r=>setTimeout(r,460));
   const nodes=window.__listen23GainNodes;
   return {count:nodes.length,bass:nodes[1]?.gain.value,mid:nodes[2]?.gain.value,air:nodes[3]?.gain.value,mod:nodes[4]?.gain.value};
 });
 check('sound-shaping-actually-changes-synthesis',values.count>=5&&values.bass>0.28&&values.air>0.096&&values.mod>0,JSON.stringify(values));
 const slider=p.locator('#receptive-pulse');
 await slider.focus();await slider.press('ArrowRight');
 await p.waitForTimeout(320);
 check('changing-slider-updates-live-synthesis',await p.evaluate(()=>window.__listen23GainNodes[1]?.gain.value)>values.bass);
 await p.locator('[data-listen23-intention="remember"]').click();
 await p.locator('#receptive-field-name').fill('Grace, memory, and release');
 await p.locator('[data-listen23-keep]').click();
 await p.locator('[data-listen23-saved-field]').waitFor();
 check('member-chooses-and-saves-own-go-to',await p.locator('[data-listen23-saved-field]').count()===1);
 check('saved-field-refers-to-original-synth-only',await p.locator('[data-listen23-shelf]').textContent().then(s=>s.includes('Grace, memory, and release')));
 await p.getByRole('navigation',{name:'Soullab'}).getByRole('link',{name:/House/}).click();
 await p.locator('[data-review-route="home"]').waitFor();
 check('synthesis-continues-with-navigation',await p.locator('[data-listen10-state]').textContent().then(s=>s.includes('playing')));
 await p.getByRole('link',{name:/Return to Listening Room/}).click();
 await p.locator('[data-listen23-receptive-field]').waitFor();
 check('private-go-to-survives-client-navigation',await p.locator('[data-listen23-saved-field]').count()===1);
 await p.getByRole('button',{name:'Tailor this sound'}).click();
 await p.locator('[data-listen23-soundboard]').waitFor();
 await p.getByRole('button',{name:'Restore original sketch'}).click();
 check('unshaped-sketch-control-restored',await p.locator('[data-listen23-dial="pulse"]').textContent().then(s=>s.includes('50')));
 await p.getByRole('button',{name:'Return to field'}).click();
 check('saved-shape-recalled',await p.locator('[data-listen23-dial="pulse"]').textContent().then(s=>s.includes('80')));
 check('recall-never-autoplays',await p.locator('[data-listen10-state]').textContent().then(s=>s.includes('paused')));
 await p.getByRole('button',{name:'Play this sound field'}).click();
 await p.locator('[data-listen10-state]').filter({hasText:'playing'}).waitFor();
 await p.getByRole('button',{name:'Pause this sound field'}).click();
 check('explicit-pause-works',await p.locator('[data-listen10-state]').textContent().then(s=>s.includes('paused')));
 await p.getByText('Keep these beyond this tab · private encrypted export').click();
 await p.locator('#receptive-private-passphrase').fill('a gentle keeper of private sound fields');
 await p.locator('#receptive-private-confirm').fill('a gentle keeper of private sound fields');
 const pending=p.waitForEvent('download',{timeout:15000});
 await p.getByRole('button',{name:'Export my encrypted go-to fields'}).click();
 const download=await pending;
 check('portable-export-name',download.suggestedFilename()==='soullab-my-receptive-fields-private.json');
 const file=await download.path();
 const ciphertext=fs.readFileSync(file,'utf8');
 check('download-does-not-contain-private-title',!ciphertext.includes('Grace, memory, and release'));
 check('download-has-separate-recipe-crypto-domain',JSON.parse(ciphertext).format==='SOULLAB_LISTEN_RECEPTIVE_PRIVATE_V1');
 await p.evaluate(()=>window.dispatchEvent(new Event('soullab:member-session-ended')));
 await p.waitForFunction(()=>document.querySelectorAll('[data-listen23-saved-field]').length===0);
 check('member-session-end-clears-go-to-memory',true);
 check('logout-does-not-auto-replay',await p.locator('[data-listen10-persistent-dock]').getAttribute('style').then(s=>s.includes('none')));
 await p.locator('#receptive-private-file').setInputFiles(file);
 await p.locator('#receptive-private-passphrase').fill('a gentle keeper of private sound fields');
 await p.getByRole('button',{name:'Restore private fields'}).click();
 await p.locator('[data-listen23-saved-field]').waitFor();
 check('manual-encrypted-restore-keeps-field',await p.locator('[data-listen23-saved-field]').count()===1);
 check('restore-never-auto-plays',await p.locator('[data-listen10-persistent-dock]').getAttribute('style').then(s=>s.includes('none')));
 await p.locator('[data-listen23-intention="grieve"]').click();
 check('grief-tag-available-without-forcing-a-therapy-claim',await p.locator('[data-listen23-intention="grieve"]').getAttribute('aria-pressed')==='true');
 // Move to a small viewport. This is responsive browser QA, not physical iPhone.
 const mobile=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 await mobile.addCookies([{name:'maia_session',value:'fictional-listen08-cookie-A',url:ROOT}]);
 const mp=await mobile.newPage();
 await mp.goto(ROOT+'/listen',{waitUntil:'load'});
 await mp.locator('[data-listen23-receptive-field]').waitFor();
 const width=await mp.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 check('mobile-responsive-no-horizontal-overflow',width.scroll<=width.client+3,JSON.stringify(width));
 check('no-third-party-requests',external.length===0,JSON.stringify(external));
 check('no-unhandled-js-errors',errors.length===0,JSON.stringify(errors));
 console.log('LISTEN23_'+engine.toUpperCase(),JSON.stringify({status:'PASS',checks:checks.length,results:checks,values,remote:external,errors},null,2));
 }catch(e){
   console.error('LISTEN23_'+engine.toUpperCase()+'_ERROR',e.stack);
   console.log('LISTEN23_'+engine.toUpperCase(),JSON.stringify({status:'FAIL',checks:checks.filter(x=>x.pass).length,results:checks,errors,external},null,2));
   process.exitCode=2;
 }finally{if(b)await b.close();}
}
(async()=>{
 await run('chromium',chromium,{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run','--disable-extensions','--disable-background-networking']});
 await run('webkit',webkit,{});
})().catch(e=>{console.error(e);process.exitCode=2});
