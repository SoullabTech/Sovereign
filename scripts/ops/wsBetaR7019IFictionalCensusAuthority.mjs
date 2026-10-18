/**
 * R70.19I fictional-only: bind a SQL-derived Work/key roster to the exact
 * GPGV-signed five-volume R1W manifest and current deletion authority.
 *
 * The physical Python driver runs R1W GPGV verification BEFORE invoking
 * this predecrypt-only verifier. This script NEVER invokes GPG decryption,
 * Docker, SSH, AWS, any production DB or a live deletion endpoint.
 *
 * The two ephemeral Ed25519 signers are separate logical fixture actors on
 * the SAME Mac. This is NOT a durable, external nonrollbackable authority.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash,generateKeyPairSync,sign,verify,createPublicKey} from 'node:crypto';

const ENABLED = false;
const PROTOCOL = 'soullab.ws.r7019i.signed-same-pg-census-and-five-scope.v1';
const EPOCH = 'soullab.ws.r7019i.external-current-deletion.fixture.v1';
const FPR = /^[A-F0-9]{40}$/;
const SHA = /^[a-f0-9]{64}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const scopes = Object.freeze(['media','vault','voice-notes','workbench','audit-logs']);
const digest = data=>createHash('sha256').update(data).digest('hex');
const refuse = why=>{throw new Error('R7019I_REFUSED_'+why);};
const safeInt = x=>Number.isSafeInteger(x)&&x>=1;

function roster(rows){
 if(!Array.isArray(rows)||rows.length<1||rows.length>64)refuse('ROSTER_INCOMPLETE');
 let prev='';
 const keys=new Set();
 for(const r of rows){
  if(!r||!UUID.test(r.memberId)||!UUID.test(r.workId)||!UUID.test(r.keyId)||
      r.workId<=prev||keys.has(r.keyId))refuse('ROSTER_INVALID_OR_UNSORTED');
  prev=r.workId;keys.add(r.keyId);
 }
 return rows;
}
const canonical = (data)=>Buffer.from(JSON.stringify(data),'utf8');
function strict(dir,prefix){
 if(!dir.startsWith('/private/tmp/r7019i-') ||
    !path.isAbsolute(dir)||path.normalize(dir)!==dir ||
    !path.basename(dir).startsWith('r7019i-'))refuse(prefix+'_WRONG_PRIVATE_TRUST_ROOT');
 const info=fs.lstatSync(dir);
 if(!info.isDirectory()||info.isSymbolicLink()||(info.mode&0o777)!==0o700)
  refuse(prefix+'_PRIVATE_ROOT_PERMISSIONS');
}
function rootFile(dir,name,maximum=30000){
 const p=path.join(dir,name);
 const info=fs.lstatSync(p);
 if(info.isSymbolicLink()||!info.isFile()||info.size<1||info.size>maximum||
    (info.mode&0o777)!==0o600)refuse('UNTRUSTED_EXTERNAL_FILE');
 return fs.readFileSync(p);
}
function safeBundle(dir){
 if(!dir.startsWith('/Volumes/T7 Shield/ws-beta-r1w-r7019i-') ||
    !dir.includes('/certified/')||dir.includes('..'))refuse('WRONG_CERTIFIED_FIXTURE_ROOT');
 const man=path.join(dir,'manifest.json');
 const manifest=JSON.parse(fs.readFileSync(man,'utf8'));
 if(manifest.protocol!=='soullab.ws.r1v.minisforum.complete-encrypted-recovery.fixture.v1' ||
    manifest.status!=='FICTIONAL_COMPLETE_DB_AND_FIVE_FILE_VOLUMES_BETA_HOLD' ||
    manifest.productionSnapshotConsistencyProven!==false ||
    manifest.realMemberWriterBetaApproved!==false ||
    JSON.stringify(manifest.fileVolumeNames)!==JSON.stringify(scopes) ||
    manifest.generation!==path.basename(dir))refuse('BAD_R1W_FIVE_SCOPE_MANIFEST');
 if(!manifest.postgres||!manifest.fileVault)refuse('MISSING_ENCRYPTED_ARCHIVES');
 const pg=path.join(dir,'postgres.pgdump.gpg');
 const files=path.join(dir,'files.tar.gpg');
 for(const [p,ref] of [[pg,manifest.postgres],[files,manifest.fileVault]]){
  const info=fs.lstatSync(p);
  if(!info.isFile()||info.isSymbolicLink()||
     info.size!==ref.bytes||(info.mode&0o777)!==0o600||
     digest(fs.readFileSync(p))!==ref.sha256)refuse('ENCRYPTED_ARCHIVE_HASH_DRIFT');
 }
 return {
  generation:manifest.generation,manifestSha256:digest(fs.readFileSync(man)),
  postgresSha256:manifest.postgres.sha256,fileSha256:manifest.fileVault.sha256,
  sourceHead:manifest.R7019ISourceHead||null,
 };
}
function openPEM(publicBlob){
 const pub=createPublicKey(publicBlob);
 if(pub.asymmetricKeyType!=='ed25519')refuse('WRONG_EXTERNAL_SIGNER_TYPE');
 return pub;
}
function readInput(){
 const data=fs.readFileSync(0);
 if(data.length<30||data.length>40000)refuse('INVALID_CAPTURER_INPUT');
 return JSON.parse(data.toString('utf8'));
}
function signatures(bundle,trust,input,scenario){
 if(!input||input.fixtureMode!=='fictional-only'||
    input.sourceOnly!==true||!FPR.test(input.r1wSignerFpr)||
    !SHA.test(input.sourceRosterSha256)||!safeInt(input.snapshotGeneration)||
    input.snapshotGeneration!==20||
    !Array.isArray(input.works))refuse('INVALID_SIGN_REQUEST');
 const works=roster(input.works);
 if(input.sourceRosterSha256!==digest(canonical(works)))
  refuse('SQL_ROSTER_HASH_MISMATCH');
 if(!bundle.sourceHead||bundle.sourceHead!==input.sourceHead ||
    input.r1wSourceCommit!=='1e9eee64306197a0f52e7b547ee3bdd279d786fa')
  refuse('WRONG_R1V_SAME_GENERATION_SOURCE');
 const privateCensus=generateKeyPairSync('ed25519');
 const privateDeletion=generateKeyPairSync('ed25519');
 const body={
  protocol:PROTOCOL,sourceHead:input.sourceHead,
  r1wSourceCommit:input.r1wSourceCommit,
  generation:bundle.generation,snapshotGeneration:input.snapshotGeneration,
  signerFingerprint:input.r1wSignerFpr,
  r1wSignedManifestSha256:bundle.manifestSha256,
  postgresCipherSha256:bundle.postgresSha256,
  fiveVolumeCipherSha256:bundle.fileSha256,scopes:[...scopes],works,
 };
 const signature=sign(null,canonical(body),privateCensus.privateKey).toString('base64');
 const revoke=scenario==='deleted'?[works[0].workId]:[];
 const current={
  protocol:EPOCH,minimumSnapshotGeneration:20,minimumDeletionGeneration:22,
  deletionGeneration:22,revokedWorkIds:revoke,revokedKeyIds:[],
  independentlyExpectedOwnedWorks:works,
 };
 const currentSig=sign(null,canonical(current),privateDeletion.privateKey).toString('base64');
 const write=(name,data)=>{
  fs.writeFileSync(path.join(trust,name),data,{flag:'wx',mode:0o600});
 };
 write('r7019i-signed-census.json',JSON.stringify({body,signature})+'\n');
 write('r7019i-current-authority.json',JSON.stringify({body:current,signature:currentSig})+'\n');
 write('r7019i-census-public.pem',privateCensus.publicKey.export({type:'spki',format:'pem'}));
 write('r7019i-current-public.pem',privateDeletion.publicKey.export({type:'spki',format:'pem'}));
 return {signedWorks:works.length,revokedWorks:revoke.length,
  sourceRosterSha256:input.sourceRosterSha256,ephemeralPrivateKeysNeverPersisted:true};
}
function preflight(bundle,trust,fpr){
 const census=JSON.parse(rootFile(trust,'r7019i-signed-census.json').toString('utf8'));
 const authority=JSON.parse(rootFile(trust,'r7019i-current-authority.json').toString('utf8'));
 const censusPub=openPEM(rootFile(trust,'r7019i-census-public.pem'));
 const deletionPub=openPEM(rootFile(trust,'r7019i-current-public.pem'));
 if(censusPub.export({type:'spki',format:'der'}).equals(
   deletionPub.export({type:'spki',format:'der'})))refuse('SIGNER_SEPARATION_REQUIRED');
 const b=census.body;
 if(!b||b.protocol!==PROTOCOL||b.generation!==bundle.generation||
    b.r1wSignedManifestSha256!==bundle.manifestSha256||
    b.postgresCipherSha256!==bundle.postgresSha256||
    b.fiveVolumeCipherSha256!==bundle.fileSha256||
    b.signerFingerprint!==fpr||
    b.sourceHead!==bundle.sourceHead||
    b.r1wSourceCommit!=='1e9eee64306197a0f52e7b547ee3bdd279d786fa'||
    JSON.stringify(b.scopes)!==JSON.stringify(scopes)||
    !safeInt(b.snapshotGeneration))refuse('SIGNED_CENSUS_NOT_BOUND_TO_CERTIFIED_FIVE_SCOPE');
 roster(b.works);
 if(!verify(null,canonical(b),censusPub,Buffer.from(census.signature||'','base64')))
  refuse('CENSUS_SIGNER_INVALID');
 const a=authority.body;
 if(!a||a.protocol!==EPOCH||
    a.deletionGeneration!==a.minimumDeletionGeneration||
    !safeInt(a.minimumSnapshotGeneration)||!safeInt(a.minimumDeletionGeneration)||
    !Array.isArray(a.revokedWorkIds)||!Array.isArray(a.revokedKeyIds))
  refuse('CURRENT_DELETION_UNVERIFIED');
 roster(a.independentlyExpectedOwnedWorks);
 if(!verify(null,canonical(a),deletionPub,Buffer.from(authority.signature||'','base64')))
  refuse('CURRENT_DELETION_SIGNATURE_INVALID');
 if(b.snapshotGeneration<a.minimumSnapshotGeneration)
  refuse('STALE_SIGNED_SNAPSHOT_EPOCH');
 if(b.snapshotGeneration>a.minimumDeletionGeneration)
  refuse('SNAPSHOT_AHEAD_OF_CURRENT_DELETION_EPOCH');
 if(JSON.stringify(b.works)!==JSON.stringify(a.independentlyExpectedOwnedWorks))
  refuse('EXTERNAL_WORK_CENSUS_MISMATCH');
 const revoked=new Set(a.revokedWorkIds);
 const removedKeys=new Set(a.revokedKeyIds);
 for(const w of b.works){
  if(revoked.has(w.workId)||removedKeys.has(w.keyId))
   refuse('OLD_VALID_ARCHIVE_CONTAINS_NOW_DELETED_WORK_OR_KEY');
 }
 return {generation:bundle.generation,verifiedWorks:b.works.length,
  roster:b.works,admission:'PREDECRYPT_AUTHORIZED_FICTIONAL_ONLY'};
}

function main(){
 if(ENABLED||process.env.R7019I_FICTIONAL_AUTHORITY!=='fictional-only')
  refuse('PRODUCTION_DISABLED');
 const [mode,certified,external,signer,scenario] = process.argv.slice(2);
 if(!['sign','verify'].includes(mode)||!FPR.test(signer||''))
  refuse('INVALID_FIXTURE_INVOCATION');
 strict(external,'EXTERNAL');
 const archive=safeBundle(certified);
 if(mode==='sign'){
  if(!['deleted','survivor'].includes(scenario))refuse('UNEXPECTED_FAKE_SCENARIO');
  const input=readInput();
  if(input.r1wSignerFpr!==signer)refuse('UNTRUSTED_PINNED_SIGNER');
  const result=signatures(archive,external,input,scenario);
  process.stdout.write(JSON.stringify({status:'R7019I_SIGNED_SQL_CENSUS_AND_CURRENT_FAKE_LEDGER',
   ...result,productionApproved:false})+'\n');
  return;
 }
 const outcome=preflight(archive,external,signer);
 // Output contains NO member ids or manuscript data, only a go/no-go witness.
 process.stdout.write(JSON.stringify({status:outcome.admission,
  verifiedWorks:outcome.verifiedWorks,hashesMatched:true,
  productionApproved:false})+'\n');
}

try{main();}
catch(err){
 process.stderr.write((err instanceof Error && err.message.startsWith('R7019I_REFUSED_')
  ?err.message:'R7019I_REFUSED_UNEXPECTED_FICTIONAL_ERROR')+'\n');
 process.exitCode=70;
}
