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

const RATE=16000, FLOOR=3500, THRESHOLD=0.5, VOICE='Samantha';
const SNAPSHOTS=[200,1000,2000,3500];
const DEFAULT_OUT='/private/tmp/turn03-a3-adversarial-evidence.json';

type CaseDef={id:string;pauseClass:string;label:'continue'|'yield';prefix:string;continuation?:string;pauseMs:number};
const CASES:CaseDef[]=[
 {id:'reflective-complete-5s',pauseClass:'emotional_pause',label:'continue',prefix:'I need to think about what this means,',continuation:'There is something else underneath it.',pauseMs:5000},
 {id:'emotional-complete-6s',pauseClass:'emotional_pause',label:'continue',prefix:'I miss her more than I know how to say.',continuation:'And there is another part I need to tell you.',pauseMs:6000},
 {id:'rhetorical-question-4s',pauseClass:'ordinary_pause',label:'continue',prefix:'Why does this still feel so hard?',continuation:'Maybe because I keep expecting myself to be over it.',pauseMs:4000},
 {id:'self-correction-4s',pauseClass:'hesitation',label:'continue',prefix:'No, that is not quite right,',continuation:'What I mean is that I was afraid.',pauseMs:4000},
 {id:'list-continuation-5s',pauseClass:'ordinary_pause',label:'continue',prefix:'The first thing is that I am exhausted,',continuation:'The second is that I do not know what I need.',pauseMs:5000},
 {id:'search-after-complete-4s',pauseClass:'word_search',label:'continue',prefix:'I know there was another part,',continuation:'Yes. It was about what happened afterward.',pauseMs:4000},
 {id:'reentry-complete-4s',pauseClass:'reentry',label:'continue',prefix:'I think that is everything for now.',continuation:'Actually, there is one more thing.',pauseMs:4000},
 {id:'implicit-share-yield',pauseClass:'ordinary_pause',label:'yield',prefix:'That is what I wanted to share.',pauseMs:5000},
 {id:'reflective-conclusion-yield',pauseClass:'ordinary_pause',label:'yield',prefix:'I think I understand it a little better now.',pauseMs:5000},
 {id:'narrative-end-yield',pauseClass:'ordinary_pause',label:'yield',prefix:'And that was the moment I decided to leave.',pauseMs:5000},
 {id:'gratitude-yield',pauseClass:'ordinary_pause',label:'yield',prefix:'Thank you for listening.',pauseMs:5000},
 {id:'where-i-am-yield',pauseClass:'ordinary_pause',label:'yield',prefix:'That is where I am with it.',pauseMs:5000},
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
 const outPath=process.argv[2]||DEFAULT_OUT;if(fileSha(MODEL)!==MODEL_SHA)throw new Error('Smart Turn model SHA custody failed');
 const tmp=mkdtempSync('/private/tmp/turn03-a3-adv-');
 const env={...process.env,HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1',HF_DATASETS_OFFLINE:'1'};
 const child=spawn(PYTHON,[SIDECAR,'--model-path',MODEL,'--expected-sha256',MODEL_SHA,'--model-version',MODEL_VERSION],{cwd:process.cwd(),stdio:['pipe','pipe','pipe'],env});let stderr='';child.stderr.setEncoding('utf8');child.stderr.on('data',d=>stderr+=d);const rl=createInterface({input:child.stdout});const iter=rl[Symbol.asyncIterator]();const h=await iter.next();if(h.done)throw new Error(stderr||'no hello');const hello=JSON.parse(h.value);if(hello.type!=='hello'||hello.protocol!=='maia.turn-smart-comparator.v1'||hello.threshold!==THRESHOLD)throw new Error('hello mismatch');const netStart=network(child.pid!);
 const cases:any[]=[];const smartSamples:any[]=[];const smartSemanticSamples:any[]=[];const latencies:number[]=[];
 try{
  let seq=0;
  for(const c of CASES){console.error(`[SMART] ${c.id} start`);const prefix=synth(c.prefix,join(tmp,c.id+'-p')),cont=c.continuation?synth(c.continuation,join(tmp,c.id+'-c')):new Int16Array(0);const fullFixture=concat([prefix,zeros(c.pauseMs),cont]);const fixtureHash=sha(pcmBytes(fullFixture));const semantic=inferSemanticTurnSignals(c.prefix);const probs:any[]=[];
   for(const ms of SNAPSHOTS.filter(ms=>ms<=c.pauseMs)){const turn=concat([prefix,zeros(ms)]);const t0=performance.now();child.stdin.write(JSON.stringify({type:'audio',seq,atMs:ms,pcm16leBase64:pcmBytes(turn).toString('base64')})+'\n');const n=await iter.next();const t1=performance.now();if(n.done)throw new Error(`sidecar ended ${c.id}: ${stderr}`);const p=JSON.parse(n.value);if(p.type!=='prediction'||p.seq!==seq)throw new Error(`prediction mismatch ${c.id}/${ms}`);latencies.push(t1-t0);probs.push({silenceMs:ms,completeProbability:p.completeProbability,complete:p.complete,roundTripMs:t1-t0});seq++;}
   let smartDecision='wait',smartLatency: number|undefined;let smartSemanticDecision='wait',smartSemanticLatency:number|undefined;
   if(c.pauseMs>=FLOOR){const floor=probs.find(x=>x.silenceMs===FLOOR);if(!floor)throw new Error(`missing floor score ${c.id}`);if(floor.completeProbability>THRESHOLD){smartDecision='yield_candidate';smartLatency=FLOOR;}const semInc=semantic.semanticIncomplete??0,semY=semantic.semanticYield??0;if(semInc>=0.62){smartSemanticDecision='wait';}else if(semY>=0.72){smartSemanticDecision='yield_candidate';smartSemanticLatency=FLOOR;}else if(floor.completeProbability>THRESHOLD){smartSemanticDecision='yield_candidate';smartSemanticLatency=FLOOR;}else smartSemanticDecision='wait';}
   smartSamples.push(summary(c.label,smartDecision,smartLatency));smartSemanticSamples.push(summary(c.label,smartSemanticDecision,smartSemanticLatency));cases.push({id:c.id,pauseClass:c.pauseClass,label:c.label,pauseMs:c.pauseMs,fixturePcm16Sha256:fixtureHash,semantic:{incomplete:semantic.semanticIncomplete,yield:semantic.semanticYield,reasons:semantic.reasons},snapshots:probs,smartTurn:{decision:smartDecision,...(smartLatency==null?{}:{latencyMs:smartLatency})},smartTurnSemantic:{decision:smartSemanticDecision,...(smartSemanticLatency==null?{}:{latencyMs:smartSemanticLatency})}});console.error(`[SMART] ${c.id} done smart=${smartDecision} smart+semantic=${smartSemanticDecision}`);}
 }finally{child.stdin.end();rmSync(tmp,{recursive:true,force:true});}
 const exit=await new Promise<number>(res=>child.once('exit',c=>res(c??-1)));if(exit!==0)throw new Error(`sidecar exit ${exit}: ${stderr}`);const netEnd=network(child.pid!);const metrics=(samples:any[])=>({overall:evaluateTurnBench(samples),byClass:evaluateTurnBenchByClass(samples.map((s:any,i:number)=>({...s,pauseClass:CASES[i].pauseClass})))});
 const sorted=[...latencies].sort((a,b)=>a-b),pct=(q:number)=>sorted[Math.min(sorted.length-1,Math.ceil(q*sorted.length)-1)];const evidence={schemaVersion:1,lane:'TURN-03',act:'A3_ADVERSARIAL_02',shadowOnly:true,generatedAt:new Date().toISOString(),fixture:{generator:'macOS say + afconvert',voice:VOICE,sourceRateHz:RATE,cases:CASES.length,rawAudioPersistedInRepo:false,memberData:false},model:{provider:'smart-turn',repositoryRevision:REPO_VERSION,modelVersion:MODEL_VERSION,path:MODEL,sha256:MODEL_SHA,license:'BSD-2-Clause',threshold:THRESHOLD,maxTurnSeconds:8},runtime:{python:spawnSync(PYTHON,['-c','import sys;print(sys.version.split()[0])'],{encoding:'utf8'}).stdout.trim(),packages:freeze(),sidecarSha256:fileSha(SIDECAR),offlineEnvironment:true},network:{openSocketsAfterHello:netStart,openSocketsAfterRun:netEnd,noOpenSocketsObserved:netStart.length===0&&netEnd.length===0},latencyMs:{samples:latencies.length,median:pct(.5),p95:pct(.95),max:Math.max(...latencies),min:Math.min(...latencies)},metrics:{baseline:metrics(CASES.map(c=>summary(c.label,c.pauseMs>=FLOOR?'yield_candidate':'wait',c.pauseMs>=FLOOR?FLOOR:undefined))),semanticOnly:metrics(CASES.map((c,i)=>{const sem=cases[i].semantic;let decision='wait',latencyMs: number|undefined;if(c.pauseMs>=FLOOR){if((sem.incomplete??0)>=0.62)decision='wait';else if((sem.yield??0)>=0.72){decision='yield_candidate';latencyMs=FLOOR;}else decision='insufficient_evidence';}return summary(c.label,decision,latencyMs)})),smartTurn:metrics(smartSamples),smartTurnSemantic:metrics(smartSemanticSamples)},cases,authority:{canCommitTranscript:false,canDispatchCognition:false,canStartTts:false,canAlterEndpointing:false}};writeFileSync(outPath,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({outPath,metrics:evidence.metrics,latencyMs:evidence.latencyMs,network:evidence.network,cases:cases.map(r=>({id:r.id,label:r.label,pauseMs:r.pauseMs,snapshots:r.snapshots,smartTurn:r.smartTurn,smartTurnSemantic:r.smartTurnSemantic,semantic:r.semantic}))},null,2));
}
main().catch(e=>{console.error(e?.stack||e);process.exit(1)});
