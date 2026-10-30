'use strict';
// LISTEN-73 · recorded nature layers follow the member's Focus choices. Real Chrome, offline render, spectral measurement.
// Uses the private development loops when present; with none, it reports SKIPPED rather than passing.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const esbuild=require('esbuild');const {chromium}=require('playwright-core');
const repo=path.resolve(__dirname,'../..');const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'listen73-'));
const dir=path.join(repo,'public/media/dev-private/nature');
if(!fs.existsSync(path.join(dir,'forest.wav'))){console.log(JSON.stringify({status:'SKIPPED',reason:'no private development loops'}));process.exit(0)}
const entry=`import{focusSoundscapeSpec}from ${JSON.stringify(path.join(repo,'lib/listening/focusSoundscape.ts'))};import{buildSoundscape}from ${JSON.stringify(path.join(repo,'lib/listening/soundscapeEngine.ts'))};
const cache={};const load=ctx=>async id=>{if(!cache[id]){const r=await fetch('/media/dev-private/nature/'+id+'.wav');cache[id]=await r.arrayBuffer()}return ctx.decodeAudioData(cache[id].slice(0))};
window.__render=async(input,withFiles)=>{const rate=44100,secs=14;const ctx=new OfflineAudioContext(2,rate*secs,rate);const spec={...focusSoundscapeSpec(input),fadeInSec:1};const h=buildSoundscape(ctx,ctx.destination,spec,0.6,withFiles?load(ctx):undefined);
if(withFiles)await new Promise(r=>setTimeout(r,1500));
const buf=await ctx.startRendering();const L=buf.getChannelData(0);const from=rate*8,n=rate*5;let e=0,lo=0,hi=0,pk=0;for(let i=1;i<n;i++){const x=L[from+i];e+=x*x;const d=x-L[from+i-1];hi+=d*d;lo+=(x+L[from+i-1])*(x+L[from+i-1])/4;pk=Math.max(pk,Math.abs(x))}
return{rms:10*Math.log10(e/n+1e-12),bright:10*Math.log10(hi/(lo+1e-12)+1e-12),peak:pk}};`;
fs.writeFileSync(path.join(fixture,'entry.js'),entry);
(async()=>{let server,browser;const results=[];const check=(n,v,d='')=>{results.push({name:n,pass:!!v,detail:d});if(!v)throw new Error(n+': '+d)};
try{await esbuild.build({entryPoints:[path.join(fixture,'entry.js')],outfile:path.join(fixture,'bundle.js'),bundle:true,format:'iife',alias:{'@':repo},logLevel:'silent'});
fs.writeFileSync(path.join(fixture,'index.html'),'<!doctype html><script src="/bundle.js"></script>');
server=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=u.startsWith('/media/')?path.join(repo,'public',u):path.join(fixture,u==='/'?'index.html':u);if(!fs.existsSync(f)){s.writeHead(404);return s.end()}s.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.wav')?'audio/wav':'text/html'});fs.createReadStream(f).pipe(s)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);
const NEEDS=['arrive','steady','deep','activate','create','reset'];
const r=await page.evaluate(async NEEDS=>{const out={};for(const n of NEEDS){out[n+'|file']=await window.__render({need:n,stimulation:'medium',world:'nature',task:'coding'},true);out[n+'|synth']=await window.__render({need:n,stimulation:'medium',world:'nature',task:'coding'},false)}
for(const s of ['low','high'])out['steady|'+s]=await window.__render({need:'steady',stimulation:s,world:'nature',task:'coding'},true);
out.ambient=await window.__render({need:'steady',stimulation:'medium',world:'ambient',task:'coding'},true);out.ambientSynth=await window.__render({need:'steady',stimulation:'medium',world:'ambient',task:'coding'},false);return out},NEEDS);
for(const n of NEEDS)check(n+': recordings are audibly present (louder than synth alone by >=6 dB)',r[n+'|file'].rms-r[n+'|synth'].rms>=6,`${r[n+'|file'].rms.toFixed(1)} vs ${r[n+'|synth'].rms.toFixed(1)} dB`);
let min=1e9,pair='';for(let i=0;i<NEEDS.length;i++)for(let j=i+1;j<NEEDS.length;j++){const a=r[NEEDS[i]+'|file'],b=r[NEEDS[j]+'|file'];const d=Math.abs(a.rms-b.rms)+Math.abs(a.bright-b.bright);if(d<min){min=d;pair=NEEDS[i]+'/'+NEEDS[j]}}
check('every need sounds measurably different with recordings (level+brightness)',min>0.6,`closest ${pair} ${min.toFixed(2)}`);
check('high stimulation is louder than low',r['steady|high'].rms>r['steady|low'].rms,`${r['steady|low'].rms.toFixed(1)} -> ${r['steady|high'].rms.toFixed(1)}`);
check('non-nature worlds unchanged by the loader',Math.abs(r.ambient.rms-r.ambientSynth.rms)<0.05,`${r.ambient.rms} vs ${r.ambientSynth.rms}`);
check('no clipping in any mix',NEEDS.every(n=>r[n+'|file'].peak<0.98),JSON.stringify(NEEDS.map(n=>+r[n+'|file'].peak.toFixed(3))));
check('zero page errors',errs.length===0,JSON.stringify(errs));
console.log(JSON.stringify({status:'PASS',passed:results.length,measures:r}));}catch(e){console.error('FAIL',String(e.message).slice(0,500),JSON.stringify(results.filter(x=>!x.pass)));process.exitCode=1}finally{await browser?.close();await new Promise(r=>server?.close(r))}})();
