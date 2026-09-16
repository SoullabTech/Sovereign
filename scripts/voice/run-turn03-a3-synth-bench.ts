#!/usr/bin/env npx tsx
/** TURN-03 A3-SYNTH-01 — synthetic speech benchmark. Shadow research only. */
import { createHash } from 'crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { spawn, spawnSync } from 'child_process';
import { createInterface } from 'readline';
import { join } from 'path';
import { StreamingPcm16Resampler } from '../../lib/voice/predictors/pcm16Resampler';
import { decideTurn, type TurnDecision } from '../../lib/voice/turnArbiter';
import { inferSemanticTurnSignals } from '../../lib/voice/semanticTurnSignals';
import { evaluateTurnBench, evaluateTurnBenchByClass, type TurnBenchSample } from '../../lib/voice/turnBench';

const MODEL = '/private/tmp/dualturn-shadow-candidate/stream_tick.onnx';
const MODEL_SHA = '6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f';
const MODEL_VERSION = 'c3860ed71210fe0144af35af340fd7a4dec3d2d3';
const PYTHON = '/private/tmp/turn03-a2-venv/bin/python';
const SIDECAR = 'scripts/voice/dualturn-shadow-sidecar.py';
const SOURCE_RATE = 16000;
const MODEL_RATE = 24000;
const FRAME_SAMPLES = 1920;
const FRAME_MS = 80;
const MEMBER_SPACE_MS = 3500;
const VOICE = 'Samantha';
const DEFAULT_OUT = '/private/tmp/turn03-a3-synth-01-evidence.json';

type CaseDef = { id: string; pauseClass: string; label: 'continue' | 'yield'; prefix: string; continuation?: string; pauseMs: number };
const CASES: CaseDef[] = [
  { id: 'ordinary-2s', pauseClass: 'ordinary_pause', label: 'continue', prefix: 'I was thinking about that earlier.', continuation: 'And there is another part I want to add.', pauseMs: 2000 },
  { id: 'word-search-4s', pauseClass: 'word_search', label: 'continue', prefix: 'The person I was trying to remember was...', continuation: 'Morgan. That was the name.', pauseMs: 4000 },
  { id: 'hesitation-4s', pauseClass: 'hesitation', label: 'continue', prefix: 'I think, um...', continuation: 'I need a little more time to put this into words.', pauseMs: 4000 },
  { id: 'emotional-6s', pauseClass: 'emotional_pause', label: 'continue', prefix: 'This is harder to say than I expected.', continuation: 'But I do want to keep going.', pauseMs: 6000 },
  { id: 'breath-2s', pauseClass: 'breath', label: 'continue', prefix: 'I have been carrying a lot lately.', continuation: 'And I can feel that as I say it.', pauseMs: 2000 },
  { id: 'unfinished-4s', pauseClass: 'unfinished_syntax', label: 'continue', prefix: 'I think what I am realizing is', continuation: 'that I have been waiting for permission.', pauseMs: 4000 },
  { id: 'unfinished-6s', pauseClass: 'unfinished_syntax', label: 'continue', prefix: 'What I keep coming back to is', continuation: 'the part I have not wanted to name.', pauseMs: 6000 },
  { id: 'reentry-4s', pauseClass: 'reentry', label: 'continue', prefix: 'That is probably all I wanted to say.', continuation: 'Actually, there is one more thing.', pauseMs: 4000 },
  { id: 'explicit-yield', pauseClass: 'explicit_yield', label: 'yield', prefix: 'I am done.', pauseMs: 5000 },
  { id: 'question-yield', pauseClass: 'question_yield', label: 'yield', prefix: 'What do you think?', pauseMs: 5000 },
];

const hash = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
function pcmBytes(pcm: Int16Array): Buffer { const b=Buffer.allocUnsafe(pcm.length*2); for(let i=0;i<pcm.length;i++) b.writeInt16LE(pcm[i],i*2); return b; }
function concat(parts: Int16Array[]): Int16Array { const n=parts.reduce((s,p)=>s+p.length,0); const o=new Int16Array(n); let at=0; for(const p of parts){o.set(p,at);at+=p.length;} return o; }
function readWavPcm16(path: string): Int16Array {
  const b=readFileSync(path); if (b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE') throw new Error('not WAVE');
  let at=12, data: Buffer|null=null, rate=0, channels=0, bits=0, format=0;
  while(at+8<=b.length){ const id=b.toString('ascii',at,at+4); const len=b.readUInt32LE(at+4); const s=at+8; if(id==='fmt '){format=b.readUInt16LE(s);channels=b.readUInt16LE(s+2);rate=b.readUInt32LE(s+4);bits=b.readUInt16LE(s+14);} if(id==='data') data=b.subarray(s,s+len); at=s+len+(len%2); }
  if(format!==1||channels!==1||rate!==SOURCE_RATE||bits!==16||!data) throw new Error(`wav contract ${format}/${channels}/${rate}/${bits}`);
  const out=new Int16Array(data.length/2); for(let i=0;i<out.length;i++) out[i]=data.readInt16LE(i*2); return out;
}
function synth(text: string, base: string): Int16Array {
  const aiff=base+'.aiff', wav=base+'.wav';
  let r=spawnSync('say',['-v',VOICE,'-o',aiff,text],{encoding:'utf8'}); if(r.status!==0) throw new Error(`say failed: ${r.stderr}`);
  r=spawnSync('afconvert',['-f','WAVE','-d',`LEI16@${SOURCE_RATE}`,aiff,wav],{encoding:'utf8'}); if(r.status!==0) throw new Error(`afconvert failed: ${r.stderr}`);
  return readWavPcm16(wav);
}
function float32(pcm: Int16Array): Float32Array { const x=new Float32Array(pcm.length); for(let i=0;i<pcm.length;i++) x[i]=pcm[i]/32768; return x; }
function resample16to24(pcm: Int16Array): Int16Array { return new StreamingPcm16Resampler(SOURCE_RATE,MODEL_RATE).push(float32(pcm)); }
function baselineDecision(pauseMs:number): {decision:TurnDecision; latencyMs?:number} { return pauseMs>=MEMBER_SPACE_MS ? {decision:'yield_candidate',latencyMs:MEMBER_SPACE_MS}:{decision:'wait'}; }

async function main(){
  const outPath=process.argv[2]||DEFAULT_OUT; const tmp=mkdtempSync('/private/tmp/turn03-a3-synth-');
  try {
    if(hash(readFileSync(MODEL))!==MODEL_SHA) throw new Error('model SHA custody failed');
    const child=spawn(PYTHON,[SIDECAR,'--model-path',MODEL,'--expected-sha256',MODEL_SHA,'--model-version',MODEL_VERSION,'--threads','4'],{cwd:process.cwd(),stdio:['pipe','pipe','pipe']});
    let stderr=''; child.stderr.setEncoding('utf8'); child.stderr.on('data',d=>stderr+=d); const rl=createInterface({input:child.stdout}); const iter=rl[Symbol.asyncIterator]();
    const hello=await iter.next(); if(hello.done) throw new Error(stderr||'no hello'); const helloObj=JSON.parse(hello.value); if(helloObj.type!=='hello') throw new Error('bad hello');
    const rows:any[]=[]; const baselineSamples:any[]=[]; const conservativeSamples:any[]=[]; const acousticSamples:any[]=[]; const semanticSamples:any[]=[]; const fusedSamples:any[]=[];
    for (const c of CASES){
      console.error(`[A3] case ${c.id} start`);
      child.stdin.write(JSON.stringify({type:'reset',seq:0})+'\n'); const ack=await iter.next(); if(ack.done||JSON.parse(ack.value).type!=='reset_ack') throw new Error('reset failed');
      const prefix=synth(c.prefix,join(tmp,c.id+'-prefix')); const continuation=c.continuation?synth(c.continuation,join(tmp,c.id+'-cont')):new Int16Array(0); const silence=new Int16Array(Math.round(c.pauseMs*SOURCE_RATE/1000));
      const source=concat([prefix,silence,continuation]); const fixtureSha=hash(pcmBytes(source)); const streamed=resample16to24(source); const frames=Math.floor(streamed.length/FRAME_SAMPLES); const preds:any[]=[];
      for(let i=0;i<frames;i++){ const frame=streamed.subarray(i*FRAME_SAMPLES,(i+1)*FRAME_SAMPLES); child.stdin.write(JSON.stringify({type:'audio',seq:i,atMs:i*FRAME_MS,pcm16leBase64:pcmBytes(frame).toString('base64')})+'\n'); const next=await iter.next(); if(next.done) throw new Error(`sidecar ended ${c.id}: ${stderr}`); const p=JSON.parse(next.value); if(p.type!=='prediction'||p.seq!==i) throw new Error(`prediction mismatch ${c.id}/${i}`); preds.push(p); }
      const prefixMs=prefix.length/SOURCE_RATE*1000; const pauseEndMs=prefixMs+c.pauseMs; const semantic=inferSemanticTurnSignals(c.prefix);
      const scan=preds.filter(p=>{const frameEnd=p.atMs+FRAME_MS; return frameEnd>=prefixMs && frameEnd<=pauseEndMs;});
      const summarize=(mode:'conservative'|'acoustic'|'semantic'|'fused')=>{ let last:TurnDecision='wait'; let latency:number|undefined; let seizureAt:number|undefined; for(const p of scan){ const silenceMs=Math.max(0,p.atMs+FRAME_MS-prefixMs); const r=decideTurn({explicitFloorHeld:false,speechActive:false,silenceMs,selectedSilenceMs:MEMBER_SPACE_MS,...(mode==='acoustic'||mode==='fused'?{acousticContinue:p.acousticContinue,acousticYield:p.acousticYield}:{}),...(mode==='semantic'||mode==='fused'?{semanticIncomplete:semantic.semanticIncomplete,semanticYield:semantic.semanticYield}:{})}); last=r.decision; if(r.decision==='yield_candidate'&&latency==null){latency=silenceMs; seizureAt=silenceMs; break;} } return {decision:latency!=null?'yield_candidate':last,latencyMs:latency,seizureAtMs:seizureAt}; };
      const base=baselineDecision(c.pauseMs), conservative=summarize('conservative'), acoustic=summarize('acoustic'), semanticOnly=summarize('semantic'), fused=summarize('fused');
      const floorPred=scan.find(p=>p.atMs+FRAME_MS-prefixMs>=Math.min(MEMBER_SPACE_MS,c.pauseMs)) ?? scan.at(-1);
      const peak=(key:'acousticContinue'|'acousticYield')=>{let best:any=null; for(const p of scan){const silenceMs=Math.max(0,p.atMs+FRAME_MS-prefixMs); if(!best||p[key]>best.value) best={value:p[key],silenceMs};} return best;};
      const row={id:c.id,pauseClass:c.pauseClass,label:c.label,pauseMs:c.pauseMs,selectedSilenceMs:MEMBER_SPACE_MS,fixturePcm16Sha256:fixtureSha,prefixSamples16k:prefix.length,continuationSamples16k:continuation.length,semantic:{incomplete:semantic.semanticIncomplete,yield:semantic.semanticYield,reasons:semantic.reasons},acousticTrajectory:{peakContinue:peak('acousticContinue'),peakYield:peak('acousticYield')},atMemberFloor:floorPred?{acousticContinue:floorPred.acousticContinue,acousticYield:floorPred.acousticYield,vad:floorPred.vad}:null,baseline:base,conservative,acoustic,semanticOnly,fused}; rows.push(row);
      console.error(`[A3] case ${c.id} done base=${base.decision} conservative=${conservative.decision} acoustic=${acoustic.decision} semantic=${semanticOnly.decision} fused=${fused.decision}`);
      for(const [arr,summary] of [[baselineSamples,base],[conservativeSamples,conservative],[acousticSamples,acoustic],[semanticSamples,semanticOnly],[fusedSamples,fused]] as const){ arr.push({id:c.id,pauseClass:c.pauseClass,label:c.label,decision:summary.decision,latencyMs:summary.latencyMs}); }
    }
    child.stdin.end(); const exit=await new Promise<number>(res=>child.once('exit',c=>res(c??-1))); if(exit!==0) throw new Error(`sidecar exit ${exit}: ${stderr}`);
    const metrics=(samples:any[])=>({overall:evaluateTurnBench(samples as TurnBenchSample[]),byClass:evaluateTurnBenchByClass(samples as any)});
    const evidence={schemaVersion:1,lane:'TURN-03',act:'A3_SYNTH_01',shadowOnly:true,generatedAt:new Date().toISOString(),fixture:{generator:'macOS say + afconvert',voice:VOICE,sourceRateHz:SOURCE_RATE,memberSpaceMs:MEMBER_SPACE_MS,cases:CASES.length,rawAudioPersistedInRepo:false,memberData:false},model:{provider:'dualturn',modelId:'anyreach-ai/dualturn-endpointing',version:MODEL_VERSION,sha256:MODEL_SHA,modelRateHz:MODEL_RATE,frameMs:FRAME_MS},policies:{baseline:'TURN-01 silence threshold',conservative:'TURN-02 arbiter with no predictor evidence',acoustic:'TURN-02 arbiter + DualTurn only',semantic:'TURN-02 arbiter + high-precision semantic cues only',fused:'TURN-02 arbiter + DualTurn + high-precision semantic cues'},metrics:{baseline:metrics(baselineSamples),conservative:metrics(conservativeSamples),acoustic:metrics(acousticSamples),semantic:metrics(semanticSamples),fused:metrics(fusedSamples)},cases:rows,authority:{canCommitTranscript:false,canDispatchCognition:false,canStartTts:false,canAlterEndpointing:false}};
    writeFileSync(outPath,JSON.stringify(evidence,null,2)+'\n'); console.log(JSON.stringify({outPath,metrics:evidence.metrics,cases:rows.map(r=>({id:r.id,label:r.label,pauseMs:r.pauseMs,semantic:r.semantic,baseline:r.baseline,conservative:r.conservative,acoustic:r.acoustic,semanticOnly:r.semanticOnly,fused:r.fused,acousticTrajectory:r.acousticTrajectory,atMemberFloor:r.atMemberFloor}))},null,2));
  } finally { rmSync(tmp,{recursive:true,force:true}); }
}
main().catch(e=>{console.error(e?.stack||e);process.exit(1)});
