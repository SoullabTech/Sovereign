/**
 * R68 fictional standard-security backup/restore qualification.
 *
 * Proves a disposable PostgreSQL16 SQL dump and separately encrypted Source
 * vault can be sealed into one AES-256-GCM backup, then restored by a FRESH
 * Node process to a separate disposable PostgreSQL container. SQL and
 * manuscript plaintext are never written as backup files.
 *
 * THIS IS NOT a production/NAS/offsite/KMS witness, nor proof that old
 * plaintext backups are deleted. No real data, account, provider or network.
 *
 * CLI: R68_ENCRYPTED_RESTORE_FIXTURE=fictional-only
 *      node scripts/ops/wsBetaR68FictionalEncryptedRestorePG16.mjs
 */
import {spawnSync} from 'node:child_process';
import {
 createCipheriv,createDecipheriv,createHash,randomBytes,randomUUID,
} from 'node:crypto';
import {
 readFileSync,writeFileSync,mkdirSync,rmSync,existsSync,lstatSync,
} from 'node:fs';
import {resolve,dirname,join,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const SELF=fileURLToPath(import.meta.url);
const ROOT=resolve(dirname(SELF),'../..');
const MODE='R68_ENCRYPTED_RESTORE_FIXTURE';
const HELD='R68_FICTIONAL_ENCRYPTED_DB_AND_VAULT_RESTORE_PASS_BETA_HOLD';
const ANCHOR='soullab.r68.fictional.backup.v1';
const BACKUP_AAD=Buffer.from(ANCHOR,'utf8');
const SOURCE_AAD=Buffer.from(ANCHOR+':source:v1','utf8');
const MANUSCRIPT='R68_FICTIONAL_MANUSCRIPT_NEVER_A_REAL_USER';
const SOURCE='FICTIONAL R68 original source: lantern beneath a river. Not a member.';
const WORK_UUID='11111111-1111-4111-8111-111111111111';
const sha=v=>createHash('sha256').update(v).digest('hex');
const requireFixture=()=>{
 if(process.env[MODE]!=='fictional-only')
  throw Error('R68_FICTIONAL_RESTORE_EXPLICIT_OPTIN_REQUIRED');
 if(process.env.DATABASE_URL?.length||
    process.env.FILE_STORAGE_PATH?.length)
  throw Error('R68_AMBIENT_DB_OR_VAULT_ENV_MUST_BE_UNSET');
};
const docker=(args,extra={})=>{
 const result=spawnSync('docker',args,{
  cwd:ROOT,encoding:null,timeout:55000,maxBuffer:12*1024*1024,
  env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin',
   HOME:process.env.HOME||'/tmp'},
  ...extra,
 });
 if(result.status!==0){
  throw Error('R68_DISPOSABLE_DOCKER_'+String(args[0]).replace(/[^a-z-]/g,'')+
   '_FAILED_'+String(result.status));
 }
 return result.stdout;
};
const tolerantDocker=(args)=>spawnSync('docker',args,{
 cwd:ROOT,encoding:'utf8',timeout:15000,maxBuffer:1024*1024,
 env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin',
  HOME:process.env.HOME||'/tmp'},
});
const pg=(name,statement)=>docker([
 'exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
 '-U','fict','-d','r68_archive','-c',statement,
]).toString('utf8').trim();
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const startPg=async(name,nonce)=>{
 docker(['run','--pull','never','-d','--name',name,
  '--label','soullab.r68.fixture='+nonce,
  '--network','none','--memory','512m','--cpus','1',
  '--pids-limit','128','--security-opt','no-new-privileges',
  '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
  '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=r68_archive',
  '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13']);
 for(let i=0;i<85;i++){
  const r=tolerantDocker(['exec',name,'psql','-XAtq',
   '-U','fict','-d','r68_archive','-c','SELECT 1']);
  if(r.status===0&&r.stdout.trim()==='1')return;
  await sleep(170);
 }
 throw Error('R68_DISPOSABLE_POSTGRES16_START_TIMEOUT');
};
const cleanupPg=(name,nonce)=>{
 const r=tolerantDocker(['inspect','--format',
  '{{index .Config.Labels "soullab.r68.fixture"}}',name]);
 if(r.status!==0)return true; // already stopped / removed
 if(r.stdout.trim()!==nonce)return false; // not our container!
 return tolerantDocker(['rm','-f','-v',name]).status===0;
};
function encrypt(key,plain,aad){
 const iv=randomBytes(12);
 const c=createCipheriv('aes-256-gcm',key,iv);
 c.setAAD(aad);
 const ciphertext=Buffer.concat([c.update(plain),c.final()]);
 return Buffer.concat([Buffer.from('R68G1'),iv,c.getAuthTag(),ciphertext]);
}
function decrypt(key,buffer,aad){
 if(!buffer.subarray(0,5).equals(Buffer.from('R68G1'))||
  buffer.length<5+12+16+1)
  throw Error('R68_ENCRYPTED_ENVELOPE_INVALID');
 const iv=buffer.subarray(5,17);
 const mac=buffer.subarray(17,33);
 const encrypted=buffer.subarray(33);
 const d=createDecipheriv('aes-256-gcm',key,iv);
 d.setAAD(aad);d.setAuthTag(mac);
 return Buffer.concat([d.update(encrypted),d.final()]);
}
const fixtureName=n=>'ws-r68-fixture-'+n;
const verifyOwnedEscrow=file=>{
 const stat=lstatSync(file);
 if(!stat.isFile()||(stat.mode&0o777)!==0o600)
  throw Error('R68_SYNTHETIC_ESCROW_NOT_MODE0600');
};
const testPath=(root,file)=>{
 const dir=resolve(root);
 const abs=resolve(file);
 if(!abs.startsWith(dir+'/'))throw Error('R68_NON_FIXTURE_FILE_REFUSED');
 if(!/\/ws-r68-fixture-[a-f0-9]{10}\//.test(abs))
  throw Error('R68_FIXTURE_DIR_IDENTITY_INVALID');
 return abs;
};
function validatePayload(pack,minEpoch,expectedSourceSHA){
 if(pack.protocol!==ANCHOR||
  !Number.isSafeInteger(pack.epoch)||pack.epoch<minEpoch||
  typeof pack.sqlB64!=='string'||pack.sqlB64.length<20||
  !pack.sourceVault||typeof pack.sourceVault!=='string'||
  typeof pack.sourceSHA256!=='string'||pack.sourceSHA256!==expectedSourceSHA||
  !pack.sourceCipherSHA256||!pack.sqlSHA256)
  throw Error('R68_ARCHIVE_SOURCE_OR_DELETION_FENCE_INCOMPLETE');
 const sql=Buffer.from(pack.sqlB64,'base64');
 const src=Buffer.from(pack.sourceVault,'base64');
 if(!sql.length||sha(sql)!==pack.sqlSHA256||
  sha(src)!==pack.sourceCipherSHA256)
  throw Error('R68_ARCHIVE_COMPONENT_HASH_MISMATCH');
 return {sql,source:src};
}
function coldRestore(controlFile){
 requireFixture();
 const controlPath=resolve(controlFile);
 const scratch=dirname(controlPath);
 if(!/\/ws-r68-fixture-[a-f0-9]{10}$/.test(scratch))
  throw Error('R68_FRESH_PROCESS_MANIFEST_SCOPE_INVALID');
 const control=JSON.parse(readFileSync(controlPath,'utf8'));
 const escrow=testPath(scratch,control.escrow);
 const archive=testPath(scratch,control.archive);
 const target=control.targetContainer;
 if(!/^ws-r68-fixture-[a-f0-9]{10}-restored$/.test(target))
  throw Error('R68_RESTORE_TARGET_NOT_AN_OWNED_FIXTURE');
 verifyOwnedEscrow(escrow);
 const keys=JSON.parse(readFileSync(escrow,'utf8'));
 const sourceKey=Buffer.from(keys.source,'base64');
 const backupKey=Buffer.from(keys.backup,'base64');
 if(sourceKey.length!==32||backupKey.length!==32)
  throw Error('R68_SYNTHETIC_KEY_LENGTH_INVALID');
 const ciphertext=readFileSync(archive);
 if(sha(ciphertext)!==control.archiveSHA256&&
   control.variant==='normal')
  throw Error('R68_ARCHIVE_FINGERPRINT_CHANGED');
 if(control.variant==='tampered')
  ciphertext[ciphertext.length-1]^=1;
 if(control.variant==='wrong-key')backupKey[0]^=1;
 let pack;
 try{pack=JSON.parse(decrypt(backupKey,ciphertext,BACKUP_AAD).toString('utf8'));}
 catch{throw Error('R68_ENCRYPTED_BACKUP_AUTHENTICATION_REFUSED');}
 const {sql,source}=validatePayload(pack,control.requiredEpoch,
  control.expectedSourceSHA256);
 let original;
 try{original=decrypt(sourceKey,source,SOURCE_AAD);}
 catch{throw Error('R68_ENCRYPTED_SOURCE_VAULT_AUTHENTICATION_REFUSED');}
 if(sha(original)!==control.expectedSourceSHA256)
  throw Error('R68_SOURCE_ORIGINAL_DIGEST_DIFFERED');
 // There are NO data-mutating SQL calls until all Source, key, epoch and
 // ciphertext integrity checks pass. Restore into an already-started empty,
 // exclusive, disposable PostgreSQL container. Never a live database.
 const sqlRestore=spawnSync('docker',['exec','-i',target,'psql',
  '-X','-v','ON_ERROR_STOP=1','-U','fict','-d','r68_archive'],
  {cwd:ROOT,input:sql,encoding:null,timeout:45000,maxBuffer:4*1024*1024,
   env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin',
    HOME:process.env.HOME||'/tmp'}});
 if(sqlRestore.status!==0)
  throw Error('R68_DISPOSABLE_SQL_RESTORE_FAILED');
 const sections=pg(target,'SELECT id::text || chr(31) || content FROM r68_sections ORDER BY id');
 if(sha(sections)!==pack.orderedSectionSHA256)
  throw Error('R68_RESTORED_IMMUTABLE_DRAFT_DIFFERED');
 const flags=pg(target,
  "SELECT count(*)::text FROM r68_sections WHERE work_id='"+WORK_UUID+"'");
 if(flags!=='3')throw Error('R68_RESTORED_SECTION_COUNT_DIFFERED');
 console.log(JSON.stringify({
  protocol:ANCHOR,restore:'FICTIONAL_SUCCESS',coldProcessPid:process.pid,
  sectionCount:3,sourceSHA256:sha(original),sectionsSHA256:sha(sections),
  archiveEpoch:pack.epoch,releaseApproved:false,realMemberDataRead:false,
  keysIndependentlyManaged:false,
 }));
 return 0;
}
if(process.argv[2]==='--cold-restore'){
 try{coldRestore(process.argv[3]);}
 catch(e){
  console.log(JSON.stringify({restore:'HELD',
   reason:e instanceof Error?e.message:'R68_UNVERIFIED_RESTORE',
   releaseApproved:false}));
  process.exitCode=4;
 }
}else if(process.argv.length>2){
 process.stderr.write('R68: no supported action outside fictional --cold-restore\n');
 process.exitCode=3;
}else{
 requireFixture();
 const nonce=randomBytes(5).toString('hex');
 const prefix=fixtureName(nonce);
 const originalDb=prefix+'-original';
 const restoredDb=prefix+'-restored';
 const scratch=join('/tmp',prefix);
 mkdirSync(scratch,{mode:0o700});
 const evidenceBase='/Volumes/T7 Shield/ws-beta-r68-storage-readiness-evidence-20261017';
 const evidence=join(evidenceBase,'run-'+nonce);
 mkdirSync(evidence,{mode:0o700,recursive:false});
 const checks=[];
 const prove=(ok,name)=>{
  if(!ok)throw Error('R68_FICTIONAL_CHECK_FAILED_'+name);
  checks.push(name);
 };
 let error=null;
 let cleanOriginal=false,cleanRestored=false;
 const testManifest=(archive,escrow,variant,epochFloor,archiveSha)=>{
  const file=join(scratch,'control-'+randomUUID()+'.json');
  writeFileSync(file,JSON.stringify({
   escrow,archive,variant,targetContainer:restoredDb,
   requiredEpoch:epochFloor,
   expectedSourceSHA256:sha(Buffer.from(SOURCE,'utf8')),
   archiveSHA256:archiveSha,
  }),{flag:'wx',mode:0o600});
  return file;
 };
 const cold=(control)=>{
  const child=spawnSync(process.execPath,[SELF,'--cold-restore',control],{
   cwd:ROOT,encoding:'utf8',timeout:60000,maxBuffer:1024*1024,
   env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin',
    HOME:process.env.HOME||'/tmp',R68_ENCRYPTED_RESTORE_FIXTURE:'fictional-only'},
  });
  let data=null;
  try{data=JSON.parse(child.stdout.trim().split('\n').pop());}catch{}
  return {code:child.status,pid:child.pid,report:data};
 };
 try{
  prove(tolerantDocker(['image','inspect','postgres:16.13']).status===0,
   'cached PostgreSQL16 image, no image pull');
  await startPg(originalDb,nonce);
  await startPg(restoredDb,nonce);
  prove(pg(originalDb,'SHOW server_version_num').startsWith('160'),
   'real isolated PostgreSQL16 original available');
  prove(pg(restoredDb,'SHOW server_version_num').startsWith('160'),
   'separate empty restore PostgreSQL16 available');
  for(const name of [originalDb,restoredDb]){
   const config=JSON.parse(docker(['inspect',name]).toString('utf8'))[0];
   prove(config.HostConfig.NetworkMode==='none'&&
    !config.HostConfig.Binds&&
    !Object.keys(config.NetworkSettings?.Ports||{}).some(key=>
     config.NetworkSettings.Ports[key]?.length),
    'Docker '+(name.endsWith('original')?'original':'restored')+
    ' has no network, host mounts or published ports');
  }
  pg(originalDb,'CREATE TABLE r68_sections('+
   'id integer PRIMARY KEY,work_id uuid NOT NULL,content text NOT NULL);');
  pg(originalDb,"INSERT INTO r68_sections VALUES"+
   "(1,'"+WORK_UUID+"','"+MANUSCRIPT+": first fictional original'),"+
   "(2,'"+WORK_UUID+"','"+MANUSCRIPT+": invented revision'),"+
   "(3,'"+WORK_UUID+"','"+MANUSCRIPT+": private proposal ciphertext marker');");
  const initial=pg(originalDb,
   'SELECT id::text || chr(31) || content FROM r68_sections ORDER BY id');
  prove(initial.includes(MANUSCRIPT)&&initial.split('\n').length===3,
   'three invented sections present in original PostgreSQL');
  const dump=docker(['exec',originalDb,'pg_dump','-U','fict','-d',
   'r68_archive','--no-owner','--no-privileges','--format=plain']);
  prove(dump.includes(Buffer.from(MANUSCRIPT)),
   'raw SQL would expose fictional writing without encryption');
  const sourceKey=randomBytes(32);
  const backupKey=randomBytes(32);
  const sourceCipher=encrypt(sourceKey,Buffer.from(SOURCE),SOURCE_AAD);
  const pack={
   protocol:ANCHOR,epoch:1,sqlB64:dump.toString('base64'),
   sqlSHA256:sha(dump),orderedSectionSHA256:sha(initial),
   sourceVault:sourceCipher.toString('base64'),
   sourceCipherSHA256:sha(sourceCipher),
   sourceSHA256:sha(Buffer.from(SOURCE)),
  };
  const archived=encrypt(backupKey,Buffer.from(JSON.stringify(pack)),BACKUP_AAD);
  const encryptedFile=join(scratch,'fictional-backup.enc');
  const keyFile=join(scratch,'fixture-keys.json');
  writeFileSync(encryptedFile,archived,{flag:'wx',mode:0o600});
  writeFileSync(keyFile,JSON.stringify({source:sourceKey.toString('base64'),
   backup:backupKey.toString('base64')}),{flag:'wx',mode:0o600});
  verifyOwnedEscrow(keyFile);
  prove(!archived.includes(Buffer.from(MANUSCRIPT))&&
   !archived.includes(Buffer.from(SOURCE)),
   'backup archive is ciphertext, not gzip/plaintext SQL or Source');
  prove(archived.subarray(0,5).equals(Buffer.from('R68G1'))&&
   archived.length>256,'AES-GCM backup envelope has a distinct tag and IV');
  const checksum=sha(archived);
  const negatives=[
   ['wrong-key',encryptedFile,1],
   ['tampered',encryptedFile,1],
   ['stale-deletion',encryptedFile,2],
  ];
  const missing={...pack,sourceVault:null};
  const sqlOnlyFile=join(scratch,'missing-source.enc');
  writeFileSync(sqlOnlyFile,
   encrypt(backupKey,Buffer.from(JSON.stringify(missing)),BACKUP_AAD),
   {flag:'wx',mode:0o600});
  negatives.push(['missing-vault',sqlOnlyFile,1]);
  for(const [variant,archive,epoch] of negatives){
   const r=cold(testManifest(archive,keyFile,variant,epoch,checksum));
   prove(r.code===4&&r.report?.restore==='HELD'&&
    r.report.releaseApproved===false,
    'fresh process refuses '+variant+' without writing');
   prove(pg(restoredDb,
    "SELECT coalesce(to_regclass('public.r68_sections')::text,'absent')")==='absent',
    'rejected '+variant+' cannot create even a partial SQL restore');
  }
  const good=cold(testManifest(encryptedFile,keyFile,'normal',1,checksum));
  prove(good.code===0&&good.report?.restore==='FICTIONAL_SUCCESS'&&
   good.report.sourceSHA256===sha(Buffer.from(SOURCE))&&
   good.report.sectionsSHA256===sha(initial),
   'fresh independent Node process reopens original, encrypted vault and SQL');
  prove(good.report.coldProcessPid!==process.pid,
   'restore completed in a new application process');
  prove(pg(restoredDb,
   "SELECT count(*)::text FROM r68_sections WHERE work_id='"+WORK_UUID+"'")==='3',
   'separate PostgreSQL16 instance has all three restored revisions');
  prove(pg(originalDb,"SELECT count(*)::text FROM r68_sections")==='3',
   'original synthetic database was not mutated by backup or restore');
 }catch(e){error=e instanceof Error?e.message:String(e);}
 finally{
  cleanOriginal=cleanupPg(originalDb,nonce);
  cleanRestored=cleanupPg(restoredDb,nonce);
  try{rmSync(scratch,{recursive:true,force:true});}catch{}
  const scratchRemoved=!existsSync(scratch);
  const report={
   protocol:ANCHOR,sourceHead:null,fictionalOnly:true,
   status:!error&&cleanOriginal&&cleanRestored&&scratchRemoved?
    HELD:'R68_FICTIONAL_RESTORE_FAILED_RELEASE_HOLD',
   checkCount:checks.length,checks,
   originalContainerRemoved:cleanOriginal,
   restoredContainerRemoved:cleanRestored,
   syntheticArchiveAndKeysDestroyed:scratchRemoved,
   databaseHostNetworkMode:'none',livePostgreSQLConnections:0,
   externalProviderCalls:0,realMemberRecordsRead:0,
   productionStorageVerified:false,offsiteRestoreVerified:false,
   actualBackupOperatorKeyWitness:false,
   fullSourceDraftHistoryProductionRestoreVerified:false,
   releaseApproved:false,
   error:error?error.slice(0,180):null,
  };
  const state=spawnSync('git',['rev-parse','HEAD'],{
   cwd:ROOT,encoding:'utf8',timeout:10000,
  });
  if(state.status===0)report.sourceHead=state.stdout.trim();
  const file=join(evidence,'R68_FICTIONAL_POSTGRES_SOURCE_ENCRYPTED_RESTORE_20261017.json');
  writeFileSync(file,JSON.stringify(report,null,2)+'\n',
   {flag:'wx',mode:0o600});
  console.log(JSON.stringify({status:report.status,checks:checks.length,
   containersAndKeysClean:cleanOriginal&&cleanRestored&&scratchRemoved,
   error:report.error,releaseApproved:false,receipt:file}));
  if(report.status!==HELD)process.exitCode=2;
 }
}
