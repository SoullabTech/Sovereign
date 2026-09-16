#!/usr/bin/env npx tsx
/** TURN-03 A3 Smart Turn v3.2 comparator on the sealed A3 synthetic corpus. */
import { createHash } from 'crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { spawn, spawnSync } from 'child_process';
import { createInterface } from 'readline';
import { join } from 'path';
import { inferSemanticTurnSignals } from '../../lib/voice/semanticTurnSignals';
import { evaluateTurnBench, evaluateTurnBenchByClass } from '../../lib/voice/turnBench';

const MODEL='/private/tmp/smart-turn-a3-model/smart-turn-v3.2-cpu.onnx';
const MODEL_SHA='2bb026316b14a660486a75b1733cd3fbab8c2fd0314dc9af7be49f8cca967e4f';
const MODEL_VERSION='f766f81d3cfdf7737ac64aad813d91bbfd56bf93';
const REPO_VERSION='4786657e242dfe77dd138699ac564ee074a2a543';
const PYTHON='/private/tmp/turn03-a3-smartturn-venv/bin/python';
const SIDECAR='scripts/voice/smartturn-a3-comparator.py';
const CONTROL='docs/programme/VOICE-2026/evidence/TURN-03-A3-SYNTH-01-20260916/A3_SYNTH_CONTROL_EVIDENCE.json';
const CONTROL_SHA='9cc22bea45da34e9ada85504dcd2e76b986fc411155c7c731c7fa043c1588dbf';
const RATE=16000, FLOOR=3500, THRESHOLD=0.5, VOICE='Samantha';
const SNAPSHOTS=[200,1000,2000,3500];
const DEFAULT_OUT='/private/tmp/turn03-a3-smartturn-evidence.json';

type CaseDef={id:string;pauseClass:string;label:'continue'|'yield';prefix:string;continuation?:string;pauseMs:number};
const CASES:CaseDef[]=[
 {id:'ordinary-2s',pauseClass:'ordinary_pause',label:'continue',prefix:'I was thinking about that earlier.',continuation:'And there is another part I want to add.',pauseMs:2000},
 {id:'word-search-4s',pauseClass:'word_search',label:'continue',prefix:'The person I was trying to remember was...',continuation:'Morgan. That was the name.',pauseMs:4000},
 {id:'hesitation-4s',pauseClass:'hesitation',label:'continue',prefix:'I think, um...',continuation:'I need a little more time to put this into words.',pauseMs:4000},
 {id:'emotional-6s',pauseClass:'emotional_pause',label:'continue',prefix:'This is harder to say than I expected.',continuation:'But I do want to keep going.',pauseMs:6000},
 {id:'breath-2s',pauseClass:'breath',label:'continue',prefix:'I have been carrying a lot lately.',continuation:'And I can feel that as I say it.',pauseMs:2000},
 {id:'unfinished-4s',pauseClass:'unfinished_syntax',label:'continue',prefix:'I think what I am realizing is',continuation:'that I have been waiting for permission.',pauseMs:4000},
 {id:'unfinished-6s',pauseClass:'unfinished_syntax',label:'continue',prefix:'What I keep coming back to is',continuation:'the part I have not wanted to name.',pauseMs:6000},
 {id:'reentry-4s',pauseClass:'reentry',label:'continue',prefix:'That is probably all I wanted to say.',continuation:'Actually, there is one more thing.',pauseMs:4000},
 {id:'explicit-yield',pauseClass:'explicit_yield',label:'yield',prefix:'I am done.',pauseMs:5000},
 {id:'question-yield',pauseClass:'question_yield',label:'yield',prefix:'What do you think?',pauseMs:5000},
];

const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const fileSha=(p:string)=>sha(readFileSync(p));
function pcmBytes(p:Int16Array){const b=Buffer.allocUnsafe(p.length*2);for(let i=0;i<p.length;i++)b.writeInt16LE(p[i],i*2);return b;}
function concat(parts:Int16Array[]){const n=parts.reduce((s,p)=>s+p.length,0);const o=new Int16Array(n);let at=0;for(const p of parts){o.set(p,at);at+=p.length;}return o;}
function readWav(path:string){const b=readFileSync(path);let at=12,data:Buffer|null=null,rate=0,ch=0,bits=0,fmt=0;while(at+8<=b.length){const id=b.toString('ascii',at,at+4),len=b.readUInt32LE(at+4),s=at+8;if(id==='fmt '){fmt=b.readUInt16LE(s);ch=b.readUInt16LE(s+2);rate=b.readUInt32LE(s+4);bits=b.readUInt16LE(s+14);}if(id==='data')data=b.subarray(s,s+len);at=s+len+(len%2);}if(fmt!==1||ch!==1||rate!==RATE||bits!==16||!data)throw new Error('WAV contract mismatch');const o=new Int16Array(data.length/2);for(let i=0;i<o.length;i++)o[i]=data.readInt16LE(i*2);return o;}
function synth(text:string,base:string){const a=base+'.aiff',w=base+'.wav';let r=spawnSync('say',['-v',VOICE,'-o',a,text],{encoding:'utf8'});if(r.status!==0)throw new Error(`say failed ${r.stderr}`);r=spawnSync('afconvert',['-f','WAVE','-d',`LEI16@${RATE}`,a,w],{encoding:'utf8'});if(r.status!==0)throw new Error(`afconvert failed ${r.stderr}`);return readWav(w);}
function zeros(ms:number){return new Int16Array(Math.round(ms*RATE/1000));}
function network(pid:number){const r=spawnSync('lsof',['-nP','-a','-p',String(pid),'-i'],{encoding:'utf8'});return r.stdout.trim()?r.stdout.trim().split(/\r?\n/).slice(1):[];}
function freeze(){const r=spawnSync(PYTHON,['-m','pip','freeze'],{encoding:'utf8'});if(r.status!==0)throw new Error('pip freeze failed');return r.stdout.trim().split(/\r?\n/).filter(Boolean).sort();}
function summary(label:'continue'|'yield',decision:string,latencyMs?:number){return {label,decision,latencyMs};}

async function main(){
 const outPath=process.argv[2]||DEFAULT_OUT;if(fileSha(MODEL)!==MODEL_SHA)throw new Error('Smart Turn model SHA custody failed');if(fileSha(CONTROL)!==CONTROL_SHA)throw new Error('control evidence SHA custody failed');
 const control=JSON.parse(readFileSync(CONTROL,'utf8'));const expected=new Map(control.cases.map((r:any)=>[r.id,r.fixturePcm16Sha256]));const tmp=mkdtempSync('/private/tmp/turn03-a3-smart-');
 const env={...process.env,HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1',HF_DATASETS_OFFLINE:'1'};
 const child=spawn(PYTHON,[SIDECAR,'--model-path',MODEL,'--expected-sha256',MODEL_SHA,'--model-version',MODEL_VERSION],{cwd:process.cwd(),stdio:['pipe','pipe','pipe'],env});let stderr='';child.stderr.setEncoding('utf8');child.stderr.on('data',d=>stderr+=d);const rl=createInterface({input:child.stdout});const iter=rl[Symbol.asyncIterator]();const h=await iter.next();if(h.done)throw new Error(stderr||'no hello');const hello=JSON.parse(h.value);if(hello.type!=='hello'||hello.protocol!=='maia.turn-smart-comparator.v1'||hello.threshold!==THRESHOLD)throw new Error('hello mismatch');const netStart=network(child.pid!);
 const cases:any[]=[];const smartSamples:any[]=[];const smartSemanticSamples:any[]=[];const latencies:number[]=[];
 try{
  let seq=0;
  for(const c of CASES){console.error(`[SMART] ${c.id} start`);const prefix=synth(c.prefix,join(tmp,c.id+'-p')),cont=c.continuation?synth(c.continuation,join(tmp,c.id+'-c')):new Int16Array(0);const fullFixture=concat([prefix,zeros(c.pauseMs),cont]);const fixtureHash=sha(pcmBytes(fullFixture));if(fixtureHash!==expected.get(c.id))throw new Error(`fixture hash drift ${c.id}: ${fixtureHash} != ${expected.get(c.id)}`);const semantic=inferSemanticTurnSignals(c.prefix);const probs:any[]=[];
   for(const ms of SNAPSHOTS.filter(ms=>ms<=c.pauseMs)){const turn=concat([prefix,zeros(ms)]);const t0=performance.now();child.stdin.write(JSON.stringify({type:'audio',seq,atMs:ms,pcm16leBase64:pcmBytes(turn).toString('base64')})+'\n');const n=await iter.next();const t1=performance.now();if(n.done)throw new Error(`sidecar ended ${c.id}: ${stderr}`);const p=JSON.parse(n.value);if(p.type!=='prediction'||p.seq!==seq)throw new Error(`prediction mismatch ${c.id}/${ms}`);latencies.push(t1-t0);probs.push({silenceMs:ms,completeProbability:p.completeProbability,complete:p.complete,roundTripMs:t1-t0});seq++;}
   let smartDecision='wait',smartLatency: number|undefined;let smartSemanticDecision='wait',smartSemanticLatency:number|undefined;
   if(c.pauseMs>=FLOOR){const floor=probs.find(x=>x.silenceMs===FLOOR);if(!floor)throw new Error(`missing floor score ${c.id}`);if(floor.completeProbability>THRESHOLD){smartDecision='yield_candidate';smartLatency=FLOOR;}const semInc=semantic.semanticIncomplete??0,semY=semantic.semanticYield??0;if(semInc>=0.62){smartSemanticDecision='wait';}else if(semY>=0.72){smartSemanticDecision='yield_candidate';smartSemanticLatency=FLOOR;}else if(floor.completeProbability>THRESHOLD){smartSemanticDecision='yield_candidate';smartSemanticLatency=FLOOR;}else smartSemanticDecision='wait';}
   smartSamples.push(summary(c.label,smartDecision,smartLatency));smartSemanticSamples.push(summary(c.label,smartSemanticDecision,smartSemanticLatency));cases.push({id:c.id,pauseClass:c.pauseClass,label:c.label,pauseMs:c.pauseMs,fixturePcm16Sha256:fixtureHash,semantic:{incomplete:semantic.semanticIncomplete,yield:semantic.semanticYield,reasons:semantic.reasons},snapshots:probs,smartTurn:{decision:smartDecision,...(smartLatency==null?{}:{latencyMs:smartLatency})},smartTurnSemantic:{decision:smartSemanticDecision,...(smartSemanticLatency==null?{}:{latencyMs:smartSemanticLatency})}});console.error(`[SMART] ${c.id} done smart=${smartDecision} smart+semantic=${smartSemanticDecision}`);}
 }finally{child.stdin.end();rmSync(tmp,{recursive:true,force:true});}
 const exit=await new Promise<number>(res=>child.once('exit',c=>res(c??-1)));if(exit!==0)throw new Error(`sidecar exit ${exit}: ${stderr}`);const netEnd=network(child.pid!);const metrics=(samples:any[])=>({overall:evaluateTurnBench(samples),byClass:evaluateTurnBenchByClass(samples.map((s:any,i:number)=>({...s,pauseClass:CASES[i].pauseClass})))});
 const sorted=[...latencies].sort((a,b)=>a-b),pct=(q:number)=>sorted[Math.min(sorted.length-1,Math.ceil(q*sorted.length)-1)];const evidence={schemaVersion:1,lane:'TURN-03',act:'A3_SMART_TURN_COMPARATOR_01',shadowOnly:true,generatedAt:new Date().toISOString(),controlEvidence:{path:CONTROL,sha256:CONTROL_SHA},fixture:{generator:'macOS say + afconvert',voice:VOICE,sourceRateHz:RATE,cases:CASES.length,rawAudioPersistedInRepo:false,memberData:false},model:{provider:'smart-turn',repositoryRevision:REPO_VERSION,modelVersion:MODEL_VERSION,path:MODEL,sha256:MODEL_SHA,license:'BSD-2-Clause',threshold:THRESHOLD,maxTurnSeconds:8},runtime:{python:spawnSync(PYTHON,['-c','import sys;print(sys.version.split()[0])'],{encoding:'utf8'}).stdout.trim(),packages:freeze(),sidecarSha256:fileSha(SIDECAR),offlineEnvironment:true},network:{openSocketsAfterHello:netStart,openSocketsAfterRun:netEnd,noOpenSocketsObserved:netStart.length===0&&netEnd.length===0},latencyMs:{samples:latencies.length,median:pct(.5),p95:pct(.95),max:Math.max(...latencies),min:Math.min(...latencies)},metrics:{smartTurn:metrics(smartSamples),smartTurnSemantic:metrics(smartSemanticSamples),sealedControls:{baseline:control.metrics.baseline.overall,conservative:control.metrics.conservative.overall,acoustic:control.metrics.acoustic.overall,semantic:control.metrics.semantic.overall,fused:control.metrics.fused.overall}},cases,authority:{canCommitTranscript:false,canDispatchCognition:false,canStartTts:false,canAlterEndpointing:false}};writeFileSync(outPath,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({outPath,metrics:evidence.metrics,latencyMs:evidence.latencyMs,network:evidence.network,cases:cases.map(r=>({id:r.id,label:r.label,pauseMs:r.pauseMs,snapshots:r.snapshots,smartTurn:r.smartTurn,smartTurnSemantic:r.smartTurnSemantic,semantic:r.semantic}))},null,2));
}
main().catch(e=>{console.error(e?.stack||e);process.exit(1)});
