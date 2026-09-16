#!/usr/bin/env npx tsx
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { decideTurnOwnershipCandidate03 } from '../../lib/voice/turnOwnershipCandidate03';
import { evaluateTurnBench, evaluateTurnBenchByClass } from '../../lib/voice/turnBench';

const SOURCES=[
  {name:'A3_SYNTH_CONTROL',path:'docs/programme/VOICE-2026/evidence/TURN-03-A3-SYNTH-01-20260916/A3_SYNTH_CONTROL_EVIDENCE.json',sha256:'9cc22bea45da34e9ada85504dcd2e76b986fc411155c7c731c7fa043c1588dbf'},
  {name:'A3_ADVERSARIAL_02',path:'docs/programme/VOICE-2026/evidence/TURN-03-A3-ADVERSARIAL-02-20260916/A3_ADVERSARIAL_EVIDENCE.json',sha256:'8a13e17ee0d427e194fe5c6f2ade696630fd6cac735c3b550b5def25bc492a65'},
] as const;
const OUT=process.argv[2]||'/private/tmp/turn03-a3-ownership-candidate-evidence.json';
const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');

type Row={id:string;pauseClass:string;label:'continue'|'yield';pauseMs:number;semantic:{incomplete:number|null;yield:number|null;reasons:string[]}};
const rows:Row[]=[];
for(const s of SOURCES){const bytes=readFileSync(s.path);if(sha(bytes)!==s.sha256)throw new Error(`source SHA drift: ${s.name}`);const d=JSON.parse(bytes.toString('utf8'));for(const r of d.cases)rows.push({id:`${s.name}:${r.id}`,pauseClass:r.pauseClass,label:r.label,pauseMs:r.pauseMs,semantic:r.semantic});}

const scored=rows.map((r)=>{
  const semanticIncomplete=r.semantic.incomplete??null, semanticYield=r.semantic.yield??null;
  const probe=decideTurnOwnershipCandidate03({explicitFloorHeld:false,speechActive:false,silenceMs:3500,selectedSilenceMs:3500,conversationalSpace:'natural',semanticIncomplete,semanticYield});
  const genericYieldMs=semanticYield!=null&&semanticYield>=.72?probe.earliestYieldMs:semanticIncomplete!=null&&semanticIncomplete>=.62?null:probe.ambiguityCeilingMs;
  // Speech onset has priority over a simultaneous timer. Therefore a generic
  // ceiling exactly equal to the observed continuation pause is not a seizure.
  const falseSeizure=r.label==='continue' && genericYieldMs!=null && genericYieldMs<r.pauseMs;
  const decision=r.label==='continue'
    ? (falseSeizure?'yield_candidate':'wait')
    : (genericYieldMs==null?'wait':'yield_candidate');
  const latencyMs=r.label==='yield'&&decision==='yield_candidate'?genericYieldMs??undefined:undefined;
  return {...r,decision,latencyMs,earliestYieldMs:probe.earliestYieldMs,ambiguityCeilingMs:probe.ambiguityCeilingMs,genericYieldMs};
});
const samples=scored.map(r=>({label:r.label,decision:r.decision as any,latencyMs:r.latencyMs,pauseClass:r.pauseClass}));
const evidence={schemaVersion:1,lane:'TURN-03',act:'A3_ASYMMETRIC_OWNERSHIP_CANDIDATE_03',shadowOnly:true,generatedAt:new Date().toISOString(),sources:SOURCES,policy:{conversationalSpace:'natural',earliestConsiderationMs:3500,ambiguityCeilingMs:6000,modelCompletionCanShortenWindow:false,explicitSemanticYieldCanHandoffAtFloor:true,strongSemanticContinuationCanHoldPastCeiling:true,simultaneousSpeechOnsetOutranksTimer:true},metrics:{overall:evaluateTurnBench(samples),byClass:evaluateTurnBenchByClass(samples)},cases:scored,authority:{canCommitTranscript:false,canDispatchCognition:false,canStartTts:false,canAlterEndpointing:false}};
writeFileSync(OUT,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({outPath:OUT,metrics:evidence.metrics.overall,cases:scored.map(r=>({id:r.id,label:r.label,pauseMs:r.pauseMs,decision:r.decision,latencyMs:r.latencyMs,genericYieldMs:r.genericYieldMs,semantic:r.semantic.reasons}))},null,2));
