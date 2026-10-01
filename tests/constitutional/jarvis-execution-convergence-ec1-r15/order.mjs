export const REFERENCE=Object.freeze({
  mode(packet){return packet.verification_plan?'STRUCTURED_V1':'LEGACY'},
  legacyShellAllowed(mode){return mode==='LEGACY'},
  sequence(){return ['MODEL','NPA1_APPLY','CANDIDATE_COMMIT','CUSTODY_VERIFY','STRUCTURED_INSPECT','VERIFIED']},
  repairAllowed(mode){return mode==='LEGACY'},
  custodyBeforeVerifier(){return true},
  verifierPassRequired(){return true},
  onVerifierFail(){return {rollback:true,standing:'REJECTED',rerunModel:false,retainAttemptEvidence:true}},
  onCrashAfterCommit(){return {rerunModel:false,reapplyPatch:false,next:'VERIFY_EXISTING_CANDIDATE'}},
  onPass(){return {standing:'VERIFIED',mayProjectW4:true}},
  legacyBehavior(){return 'UNCHANGED'},
});
const out=(id,f)=>({id,pass:f.length===0,failures:f});
export const FALSIFIERS=Object.freeze({
  O1:d=>{const f=[];if(d.legacyShellAllowed('STRUCTURED_V1'))f.push('structured path still executes legacy shell');return out('O1',f)},
  O2:d=>{const f=[];const s=d.sequence();if(s.indexOf('NPA1_APPLY')<0||s.indexOf('CANDIDATE_COMMIT')<s.indexOf('NPA1_APPLY'))f.push('candidate commit precedes NPA1 admission');return out('O2',f)},
  O3:d=>{const f=[];const s=d.sequence();if(s.indexOf('STRUCTURED_INSPECT')<s.indexOf('CANDIDATE_COMMIT'))f.push('structured verifier runs before candidate commit');return out('O3',f)},
  O4:d=>out('O4',d.custodyBeforeVerifier()?[]:['structured verifier runs before custody proof']),
  O5:d=>out('O5',d.repairAllowed('STRUCTURED_V1')===false?[]:['structured v1 retained model repair turn']),
  O6:d=>out('O6',d.verifierPassRequired()?[]:['candidate can verify without verifier PASS']),
  O7:d=>{const r=d.onVerifierFail();const f=[];if(!r.rollback)f.push('failed candidate not rolled back');if(r.rerunModel)f.push('verification failure reruns model automatically');if(!r.retainAttemptEvidence)f.push('failed attempt history erased');return out('O7',f)},
  O8:d=>{const r=d.onCrashAfterCommit();const f=[];if(r.rerunModel||r.reapplyPatch)f.push('crash after commit repeats candidate effect');if(r.next!=='VERIFY_EXISTING_CANDIDATE')f.push('crash does not resume from existing candidate');return out('O8',f)},
  O9:d=>{const r=d.onPass();const f=[];if(r.standing!=='VERIFIED'||!r.mayProjectW4)f.push('passing structured candidate cannot progress');return out('O9',f)},
  O10:d=>out('O10',d.legacyBehavior()==='UNCHANGED'?[]:['structured cut silently changed legacy behavior']),
});
const make=(id,named,overrides,collateral={})=>({id,named,decisions:Object.freeze({...REFERENCE,...overrides}),collateral:Object.freeze(collateral)});
export const CANDIDATES=Object.freeze([
  make('DC-O1','O1',{legacyShellAllowed:()=>true}),
  make('DC-O2','O2',{sequence:()=>['MODEL','CANDIDATE_COMMIT','NPA1_APPLY','CUSTODY_VERIFY','STRUCTURED_INSPECT','VERIFIED']}),
  make('DC-O3','O3',{sequence:()=>['MODEL','NPA1_APPLY','STRUCTURED_INSPECT','CANDIDATE_COMMIT','CUSTODY_VERIFY','VERIFIED']}),
  make('DC-O4','O4',{custodyBeforeVerifier:()=>false}),
  make('DC-O5','O5',{repairAllowed:()=>true}),
  make('DC-O6','O6',{verifierPassRequired:()=>false}),
  make('DC-O7','O7',{onVerifierFail:()=>({rollback:false,standing:'REJECTED',rerunModel:true,retainAttemptEvidence:false})}),
  make('DC-O8','O8',{onCrashAfterCommit:()=>({rerunModel:true,reapplyPatch:true,next:'RESTART'})}),
  make('DC-O9','O9',{onPass:()=>({standing:'HELD',mayProjectW4:false})}),
  make('DC-O10','O10',{legacyBehavior:()=> 'MIGRATED_IMPLICITLY'}),
]);
