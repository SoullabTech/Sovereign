/**
 * R70.19D — read-only exact-source mutation custody, NOT a production
 * release authorization. Different source SHA or missing file is a refusal.
 * Matching source SHA and fictional browser tests are still insufficient:
 * multiple separate storage writers and deletion authorities are unqualified.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
export const R7019D_LEDGER=Object.freeze(
 JSON.parse(readFileSync(path.join(here,'wsBetaR7019DMutationCoverage.json'),'utf8')));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function assessR7019DWholeWriterGate(root,opts={}){
 const override=opts.sourceOverrides??{};
 const drift=[],verified=[];
 const classes={physical_fixture:0,fictional_only:0,unqualified:0};
 const seen=new Set();
 for(const e of R7019D_LEDGER.entries){
  if(!e.id||seen.has(e.id)||typeof e.path!=='string'||
     path.isAbsolute(e.path)||e.path.split('/').includes('..')||
     !Object.hasOwn(classes,e.evidenceClass)){
   drift.push({id:e.id??'invalid',reason:'unsafe_duplicate_or_unclassified'});
   continue;
  }
  seen.add(e.id);
  let data;
  try{
   data=Object.hasOwn(override,e.path)
     ?Buffer.from(override[e.path]):readFileSync(path.join(root,e.path));
  }catch{drift.push({id:e.id,reason:'missing_source'});continue;}
  if(sha(data)!==e.sha256||!e.anchors.every(a=>data.toString('utf8').includes(a))){
   drift.push({id:e.id,reason:'unreviewed_source_change'});
   continue;
  }
  verified.push(e.id);
  classes[e.evidenceClass]++;
 }
 const status=drift.length
  ?'R7019D_EXACT_WRITER_CUSTODY_DRIFT_HELD'
  :'R7019D_INCOMPLETE_SOURCE_ERASURE_RECOVERY_HELD';
 return Object.freeze({
  protocol:'soullab.ws.r7019d.full-writer-held.v1',status,
  sourceParent:R7019D_LEDGER.parentHead,
  expectedEntries:R7019D_LEDGER.entries.length,
  verifiedEntries:verified.length,classes,
  unqualifiedIds:R7019D_LEDGER.entries
   .filter(e=>e.evidenceClass==='unqualified').map(e=>e.id),
  unresolvedAuthorities:[...R7019D_LEDGER.unresolvedAuthorities],
  drift,
  fixtureApprovedForIsolatedTests:drift.length===0,
  fullWriterBackupCertified:false,
  independentOffsiteRecoveryCertified:false,
  currentNonRollbackableDeletionAuthorityCertified:false,
  realMemberWritingAdmissionApproved:false,
  releaseApproved:false,
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=process.argv[2];
 if(!root||!path.isAbsolute(root)){
  process.stderr.write('R7019D_ABSOLUTE_CHECKOUT_REQUIRED\n');
  process.exitCode=64;
 }else{
  process.stdout.write(JSON.stringify(assessR7019DWholeWriterGate(root),null,2)+'\n');
  process.exitCode=78;
 }
}
