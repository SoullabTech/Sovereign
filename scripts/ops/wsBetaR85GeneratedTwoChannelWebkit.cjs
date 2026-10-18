'use strict';
/**
 * R85 exact-browser format and 2-channel mono-route verification.
 * REAL WebKit AudioContext, MediaRecorder and real app helper modules.
 * Input 1/2 each has a different synthesized tone. No getUserMedia,
 * user data, audio interface, production service, provider calls or keys.
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const http=require('node:http');
const cp=require('node:child_process');
const {webkit}=require('playwright');
const esbuild=require('esbuild');

if(process.env.R85_SYNTHETIC_WEBKIT_AUDIO!=='fictional-no-mic')
  throw Error('R85_EXPLICIT_SYNTHETIC_NO_MIC_MARKER_REQUIRED');
const ROOT=path.resolve(__dirname,'../..');
const DEST=process.env.R85_OUTPUT_DIR;
if(!DEST||!DEST.startsWith('/Volumes/T7 Shield/ws-beta-r85-'))
  throw Error('R85_REFUSE_UNBOUNDED_AUDIO_DESTINATION');
if(fs.existsSync(DEST))throw Error('R85_EVIDENCE_MUST_BE_EXCLUSIVE_NEW_DIRECTORY');
fs.mkdirSync(DEST,{mode:0o700,recursive:false});
const HEAD=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const compile=async(entry,name)=>{
 const out=await esbuild.build({entryPoints:[path.join(ROOT,entry)],
   write:false,bundle:true,platform:'browser',format:'iife',globalName:name,
   logLevel:'silent',target:'es2022'});
 if(out.outputFiles.length!==1)throw Error('R85_BUNDLE_NOT_SINGLE');
 return out.outputFiles[0].text;
};
function analyzeAudio(file){
 const p=cp.spawnSync('/opt/homebrew/bin/ffprobe',
  ['-v','error','-show_entries','stream=codec_name,sample_rate,channels',
   '-show_entries','format=duration','-of','json',file],
  {encoding:'utf8',timeout:15000});
 if(p.status!==0)throw Error('R85_FFPROBE_'+p.stderr.slice(0,130));
 const metadata=JSON.parse(p.stdout);
 const decode=cp.spawnSync('/opt/homebrew/bin/ffmpeg',
  ['-v','error','-i',file,'-ac','1','-ar','48000',
   '-f','f32le','-acodec','pcm_f32le','pipe:1'],
  {encoding:null,maxBuffer:20*1024*1024,timeout:18000});
 if(decode.status!==0||decode.stderr.length)
  throw Error('R85_NONCLEAN_AUDIO_DECODE_'+decode.stderr.toString('utf8').slice(0,140));
 const buf=decode.stdout;
 const start=48000*0.12;
 const end=Math.min(Math.floor(buf.length/4),start+48000);
 if(end-start<25000)throw Error('R85_NO_CONTINUOUS_SIGNAL');
 let crossings=0;let square=0;
 let last=buf.readFloatLE(start*4);
 for(let i=start+1;i<end;i++){
   const sample=buf.readFloatLE(i*4);
   // Count genuine sign transitions near zero. A high amplitude threshold
   // would exclude exactly the samples at a sinusoid's crossing.
   if((sample>=0)!==(last>=0))crossings++;
   square+=sample*sample;last=sample;
 }
 return {format:metadata.format,stream:metadata.streams?.[0],
   decodedSeconds:buf.length/4/48000,
   rms:Math.sqrt(square/(end-start)),
   // Alternating zero crossings, twice per sine cycle.
   approximateHz:crossings*48000/(2*(end-start))};
}
(async()=>{
 let server=null,browser=null;
 const report={protocol:'soullab.ws.beta.r85.real-webkit-real-app-mono-codec.v1',
   sourceCommit:HEAD,appHelpersBundled:true,
   syntheticOnly:true,micRequests:0,
   outboundRequests:0,status:'HELD',checks:[],results:[],error:null};
 const pass=(ok,label)=>{if(!ok)throw Error('R85_FAIL_'+label);report.checks.push(label)};
 try{
  const captureJS=await compile(
    'lib/writersStudio/listen/browserCaptureInfo.ts','R85CaptureInfo');
  const monoJS=await compile(
    'lib/writersStudio/listen/monoCaptureRoute.ts','R85MonoRoute');
  server=http.createServer((_req,res)=>{
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
   res.end('<!DOCTYPE html><html><head><title>R85 fictional audio</title></head>'+
    '<body><button id="start">Record generated channels</button></body></html>');
  });
  await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
  const ORIGIN='http://127.0.0.1:'+server.address().port;
  browser=await webkit.launch({headless:true});
  const context=await browser.newContext({acceptDownloads:true});
  await context.route('**/*',async route=>{
    if(new URL(route.request().url()).origin!==ORIGIN){
      report.outboundRequests++;return route.abort();
    }
    return route.continue();
  });
  const page=await context.newPage();
  page.on('pageerror',error=>{report.error='WEBKIT_EXCEPTION_'+String(error).slice(0,180)});
  await page.goto(ORIGIN,{waitUntil:'domcontentloaded',timeout:10000});
  await page.addScriptTag({content:captureJS});
  await page.addScriptTag({content:monoJS});
  const ready=await page.evaluate(()=>({
   secure:window.isSecureContext,
   capture:typeof R85CaptureInfo.preferredRecorderMime,
   mono:typeof R85MonoRoute.createMonoCaptureRoute,
   ua:navigator.userAgent,
   recorder:typeof MediaRecorder,
  }));
  pass(ready.secure&&ready.capture==='function'&&ready.mono==='function'&&
    ready.recorder==='function','real_secure_webkit_with_both_actual_source_helpers');
  pass(ready.ua.includes('AppleWebKit')&&ready.ua.includes('Safari/'),
    'original_safari_engine_user_agent');
  const actual=await page.evaluate(()=>R85CaptureInfo.preferredRecorderMime());
  pass(actual==='audio/mp4','original_app_source_prefers_m4a_on_webkit');
  await page.evaluate(()=>{
   // Never route any browser audio to speakers. Only create synthetic
   // oscillator tracks attached to a MediaStreamAudioDestinationNode.
   document.getElementById('start').addEventListener('click',async()=>{
    const capture={status:'running',rows:[],micCalls:0};
    window.__R85=capture;
    const hardwareGuard=async()=>{capture.micCalls++;
      throw Error('R85_NO_REAL_MICROPHONE_AUTHORIZED')};
    try{
     Object.defineProperty(navigator.mediaDevices,'getUserMedia',{
      configurable:true,writable:false,value:hardwareGuard});
    }catch(e){capture.status='blocked';capture.error='R85_MIC_GUARD_NOT_INSTALLED';return;}
    const ctx=new AudioContext({sampleRate:48000});
    const merge=ctx.createChannelMerger(2);
    const inputStream=ctx.createMediaStreamDestination();
    inputStream.channelCountMode='explicit';
    inputStream.channelCount=2;
    const oscillators=[];
    for(const [i,hz] of [440,660].entries()){
     const osc=ctx.createOscillator();osc.type='sine';
     osc.frequency.value=hz;
     const gain=ctx.createGain();gain.gain.value=0.28;
     osc.connect(gain);
     gain.connect(merge,0,i);
     oscillators.push(osc);
    }
    merge.connect(inputStream);
    try{
     await ctx.resume();
     oscillators.forEach(o=>o.start());
     for(const channel of [1,2]){
      const routed=await R85MonoRoute.createMonoCaptureRoute(inputStream.stream,channel);
      try{
       const mime=R85CaptureInfo.preferredRecorderMime();
       const rec=new MediaRecorder(routed.stream,{mimeType:mime});
       const chunks=[];
       const finished=new Promise((resolve,reject)=>{
        rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
        rec.onstop=resolve;
        rec.onerror=e=>reject(e.error||Error('R85_RECORDER_EVENT_ERROR'));
       });
       rec.start(250);
       await new Promise(r=>setTimeout(r,1550));
       rec.stop();
       await finished;
       const blob=new Blob(chunks,{type:rec.mimeType});
       const data=await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result.split(',')[1]);
        reader.onerror=()=>reject(reader.error);
        reader.readAsDataURL(blob);
       });
       capture.rows.push({
        inputChannel:channel,rawInputChannels:inputStream.channelCount,
        outputChannels:routed.outputChannels,outputRateHz:routed.outputRateHz,
        monoVerification:routed.verification,
        mime:rec.mimeType,blobBytes:blob.size,chunkCount:chunks.length,
        expectedHz:channel===1?440:660,base64:data,
       });
      }finally{await routed.close();}
     }
     capture.micCalls=capture.micCalls;
     capture.status='done';
    }catch(e){capture.status='error';capture.error=String(e).slice(0,300)}
    finally{
     oscillators.forEach(o=>{try{o.stop()}catch{}});
     inputStream.stream.getTracks().forEach(track=>track.stop());
     await ctx.close();
    }
   });
  });
  await page.click('#start');
  await page.waitForFunction(()=>window.__R85&&
   ['done','error','blocked'].includes(window.__R85.status),
   null,{timeout:20000});
  const ui=await page.evaluate(()=>window.__R85);
  if(ui.status!=='done')throw Error('R85_BROWSER_SYNTHETIC_CAPTURE_'+ui.error);
  pass(ui.micCalls===0,'no_real_microphone_hardware_requested');
  pass(ui.rows.length===2,'both_physical_input_simulations_recorded');
  for(const row of ui.rows){
   const out=path.join(DEST,'fictional-input-'+row.inputChannel+'.m4a');
   fs.writeFileSync(out,Buffer.from(row.base64,'base64'),{mode:0o600});
   const inspected=analyzeAudio(out);
   const info={inputChannel:row.inputChannel,
      mime:row.mime,bytes:row.blobBytes,chunkCount:row.chunkCount,
      outputChannels:row.outputChannels,outputRateHz:row.outputRateHz,
      verification:row.monoVerification,expectedHz:row.expectedHz,
      actualHz:inspected.approximateHz,rms:inspected.rms,
      ffprobe:inspected.stream,sha256:hash(fs.readFileSync(out))};
   report.results.push(info);
   pass(row.mime.startsWith('audio/mp4')&&row.blobBytes>1500,
     'selected_input_'+row.inputChannel+'_real_m4a_bytes');
   pass(row.outputChannels===1&&row.outputRateHz===48000&&
     ['track-settings','explicit-audio-graph'].includes(row.monoVerification),
     'selected_input_'+row.inputChannel+'_app_mono_routing_verified');
   pass(inspected.stream.codec_name==='aac'&&
     inspected.stream.channels===1&&
     Number(inspected.stream.sample_rate)===48000&&
     inspected.rms>0.02,'input_'+row.inputChannel+'_decoded_clean_48k_mono');
   pass(Math.abs(inspected.approximateHz-row.expectedHz)<=15,
     'input_'+row.inputChannel+'_correct_independent_tone_frequency');
  }
  pass(report.outboundRequests===0,'no_off_host_requests');
  pass(!report.error,'no_uncaught_webkit_browser_errors');
  report.status='R85_REAL_WEBKIT_GENERATED_M4A_TWO_CHANNEL_PASS_BETA_HOLD';
 }catch(err){report.error=String(err).slice(0,450)}
 finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  report.localServerStopped=true;
  const receipt=path.join(DEST,'R85_GENERATED_AUDIO_ACCEPTANCE.json');
  fs.writeFileSync(receipt,JSON.stringify(report,null,2)+'\n',{mode:0o600,flag:'wx'});
  console.log(JSON.stringify({status:report.status,sourceCommit:report.sourceCommit,
    checks:report.checks.length,
    results:report.results,error:report.error,micRequests:report.micRequests,
    evidence:receipt}));
  process.exitCode=report.status.endsWith('PASS_BETA_HOLD')?0:2;
 }
})();
