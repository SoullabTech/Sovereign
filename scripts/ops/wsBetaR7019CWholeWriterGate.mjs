/**
 * R70.19C exact-source mutation inventory gate.
 * READ ONLY. No execution modes can authorize production backups or beta.
 * Matching code hashes prove source custody, not that the entire application
 * participates in a coherent snapshot or that an offsite restore works.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
export const R7019C_LEDGER=Object.freeze(
  JSON.parse(readFileSync(path.join(dir,'wsBetaR7019CWholeWriterCoverageLedger.json'),'utf8')));
const sha=b=>createHash('sha256').update(b).digest('hex');

export function assessR7019CWholeWriterGate(root,options={}){
 const patches=options.sourceOverrides??{};
 const drift=[];
 const verified=[];
 const classes={physical_fixture:0,code_only_held:0,unfenced:0,
   fixture_only_not_live:0};
 const ids=new Set();
 for(const e of R7019C_LEDGER.entries){
  if(!e.id||ids.has(e.id)||typeof e.path!=='string'||
     path.isAbsolute(e.path)||e.path.split('/').includes('..')||
     !Object.prototype.hasOwnProperty.call(classes,e.status)){
   drift.push({id:e.id??'invalid',reason:'unsafe_or_duplicate_ledger_entry'});
   continue;
  }
  ids.add(e.id);
  let body;
  try{
   body=Object.prototype.hasOwnProperty.call(patches,e.path)
     ?Buffer.from(patches[e.path]):readFileSync(path.join(root,e.path));
  }catch{drift.push({id:e.id,reason:'source_missing'});continue;}
  if(sha(body)!==e.sha256||
     !e.anchors.every(anchor=>body.toString('utf8').includes(anchor))){
   drift.push({id:e.id,reason:'changed_source_or_mutator_anchor'});
   continue;
  }
  verified.push(e.id);
  classes[e.status]++;
 }
 const unresolved=R7019C_LEDGER.entries
  .filter(e=>e.status!=='physical_fixture').map(e=>e.id);
 const status=drift.length
  ?'R7019C_SOURCE_MUTATOR_CUSTODY_DRIFT_HELD'
  :'R7019C_FULL_WRITER_COVERAGE_UNQUALIFIED_HELD';
 return Object.freeze({
  protocol:'soullab.ws.r7019c.full-writer-gate.v1',
  sourceParent:R7019C_LEDGER.sourceParent,status,
  verifiedSourceEntries:verified.length,
  expectedSourceEntries:R7019C_LEDGER.entries.length,
  claimedFixtureEntryClasses:classes,
  holdMutatorIds:unresolved,
  unresolvedAuthorities:[...R7019C_LEDGER.unresolvedNonFileAuthority],
  drift,
  markerOnlyEvidence:true,
  completeEncryptedSQLVaultWALCoverageCertified:false,
  independentlyHeldProductionRecoveryKeyCertified:false,
  currentExternalDeletionHighwaterCertified:false,
  realMemberAdmissionApproved:false,
  releaseApproved:false,
 });
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=process.argv[2];
 if(!root||!path.isAbsolute(root)){
  process.stderr.write('R7019C_SOURCE_ROOT_MUST_BE_ABSOLUTE\n');
  process.exitCode=64;
 }else{
  process.stdout.write(JSON.stringify(assessR7019CWholeWriterGate(root),null,2)+'\n');
  process.exitCode=78; // a HOLD must not satisfy a shipping gate
 }
}
