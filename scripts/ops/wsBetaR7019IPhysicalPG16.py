#!/usr/bin/env python3
"""R70.19I fictional SAME-PG-snapshot Work census + R1W five scopes + restore.

In one disposable PostgreSQL16 fixture:
- materialize canonical member_manuscripts and R1Q wrapped-key FK tables;
- export a live REPEATABLE READ snapshot, query the Work/key identity census;
- force R1V PG_DUMP to consume EXACTLY this snapshot while five fixture file
  scopes are sealed to one encrypted generation;
- certify this R1V generation with separate OpenPGP Ed25519 R1W signer;
- Ed25519 sign the SQL-derived Work roster bound to R1W manifest/ciphertexts;
- after backup, delete one fictional Work (negative case), or retain all
  Works (surviving case); sign a NEW current external deletion checkpoint;
- destroy original PostgreSQL and all five original file scopes;
- call a separately executable physical restore whose internal preflight
  verifies R1W GPGV + Work census + newer signed deletion floor BEFORE any
  private GPG key or new PostgreSQL container;
- compare the surviving restored SQL roster and restored five files.
There is NEVER a live/production mode, member access, SSH, NAS or AWS call.

All test private keys are created in a transient separate Mac directory and
destroyed after both scenarios. Receipts include only test counts and hashes.
"""
from pathlib import Path
import argparse,hashlib,json,os,re,secrets,shutil,subprocess,sys,tempfile,time
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'scripts/ops'))
import wsBetaR1VFiveVolumeRestorePG16 as r1v

R7019I_PRODUCTION_COHERENT_BACKUP_ENABLED=False
DOCKER='/usr/local/bin/docker'
SNAPSHOT=re.compile(r'^[A-F0-9]+-[A-F0-9]+-[A-F0-9]+$')
FPR=re.compile(r'^[A-F0-9]{40}$')
FICT_MEMBER='4c0782ca-9074-43ee-9f3c-5f8500026780'
WORK_A='306902ed-21a9-4c01-aa15-984755598218'
WORK_B='4c0782ca-9074-43ee-9f3c-5f8500026780'
KEY_A='3ac9b90d-8d79-44cf-bf3f-81376d8b7efe'
KEY_B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204'
R1W_SOURCE='1e9eee64306197a0f52e7b547ee3bdd279d786fa'

def refuse(reason):raise RuntimeError('R7019I_'+reason)
def action(args,timeout=35,inputbytes=None,env=None):
 try:
  p=subprocess.run(args,capture_output=True,input=inputbytes,timeout=timeout,
   cwd=ROOT,env=env,check=False)
 except (OSError,subprocess.TimeoutExpired):refuse('FICTIONAL_OPERATION_UNAVAILABLE_OR_TIMEOUT')
 if p.returncode:
  refuse('TEST_SUBPROCESS_REFUSED_'+Path(args[0]).name+'_'+str(p.returncode))
 return p.stdout

def docker(*argv,timeout=20):
 return action([DOCKER,*argv],timeout=timeout)

def sql(container,text):
 return action([DOCKER,'exec','-i',container,'psql',
   '-XAtq','-v','ON_ERROR_STOP=1','-U','fict','-d','ws_fixture'],inputbytes=text.encode(),timeout=20)

def key(home,uid,algorithm,usage):
 home.mkdir(mode=0o700)
 action(['gpg','--batch','--homedir',str(home),'--pinentry-mode','loopback',
   '--passphrase','','--quick-generate-key',uid,algorithm,usage,'0'],timeout=75)
 o=action(['gpg','--batch','--homedir',str(home),'--with-colons','--list-keys'])
 fps=[p[9] for l in o.decode().splitlines()
      if (p:=l.split(':'))[0]=='fpr' and len(p)>9 and FPR.fullmatch(p[9])]
 if len(fps)!=1:refuse('UNQUALIFIED_FICTIONAL_SIGNING_KEYRING')
 return fps[0]

def sql_roster(psql,stdout,stdin):
 stdin.write("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;\n")
 stdin.write("SELECT pg_advisory_xact_lock(hashtextextended('soullab.ws.r70.17.writer-and-source-capture.v1',0));\n")
 stdin.write("SELECT coalesce(json_agg(json_build_object("
   "'memberId',m.member_id::text,'workId',m.id::text,'keyId',k.key_id::text) ORDER BY m.id),"
   "'[]'::json)::text FROM member_manuscripts m "
   "JOIN ws_managed_work_key_wrappings_r1q k "
   "ON k.manuscript_id=m.id AND k.member_id=m.member_id;\n")
 stdin.flush()
 # pg_advisory_xact_lock() returns VOID. psql -Atq may emit a blank line
 # for it before the one-line JSON roster; never treat void as missing data.
 line=''
 for _ in range(4):
  candidate=stdout.readline().strip()
  if candidate.startswith('['):
   line=candidate
   break
  if candidate:refuse('UNEXPECTED_CAPTURE_TIME_SQL_OUTPUT')
 if not line:refuse('CAPTURE_TIME_SQL_ROSTER_NOT_READ')
 works=json.loads(line)
 if len(works)!=2 or [w['workId'] for w in works]!=[WORK_A,WORK_B] or any(
  w['memberId']!=FICT_MEMBER for w in works):
  refuse('CANONICAL_FICTIONAL_SQL_ROSTER_WRONG')
 stdin.write("SELECT pg_export_snapshot();\n");stdin.flush()
 sid=stdout.readline().strip()
 if not SNAPSHOT.fullmatch(sid):refuse('EXPORTED_SNAPSHOT_NOT_PG16_FORMAT')
 return works,sid

def file_fingerprint(root):
 sha=hashlib.sha256()
 files=[x for x in root.rglob('*') if x.is_file()]
 if len(files)!=6:refuse('FICTIONAL_FIVE_SCOPE_FILE_COUNT_CHANGED')
 for f in sorted(files):
  if f.is_symlink():refuse('FICTIONAL_SYMLINK')
  sha.update(f.relative_to(root).as_posix().encode()+b'\0')
  sha.update(hashlib.sha256(f.read_bytes()).digest())
 return sha.hexdigest()

def stage_schema(container):
 sql(container,"CREATE TABLE members(id UUID PRIMARY KEY);"
  "INSERT INTO members VALUES('"+FICT_MEMBER+"');"
  "CREATE TABLE fictional_works(id int PRIMARY KEY,body text NOT NULL);"
  "INSERT INTO fictional_works VALUES(1,'R7019I_FAKE_FIRST'),(2,'R7019I_FAKE_SECOND');")
 for relative in (
  '20260721000003_press_manuscript_room.sql',
  '20261017210000_ws_managed_work_key_wrappings_r1q.sql',
 ):
  f=ROOT/'database/migrations'/relative
  if not f.is_file():refuse('CANONICAL_FICTIONAL_SQL_MIGRATION_MISSING')
  action([DOCKER,'exec','-i',container,'psql','-XAtq','-v','ON_ERROR_STOP=1',
      '-U','fict','-d','ws_fixture'],inputbytes=f.read_bytes(),timeout=22)
 sql(container,(
  "INSERT INTO member_manuscripts(id,member_id,title) VALUES"
  "('"+WORK_A+"','"+FICT_MEMBER+"','Fictional Work A'),"
  "('"+WORK_B+"','"+FICT_MEMBER+"','Fictional Work B');"
  "INSERT INTO ws_managed_work_key_wrappings_r1q"
  "(member_id,manuscript_id,key_epoch,key_id,provider,provider_key_ref,opaque_work_digest,wrapped_key) VALUES"
  "('"+FICT_MEMBER+"','"+WORK_A+"',1,'"+KEY_A+"','external_managed_kms','fictional-provider-a',repeat('a',64),decode(repeat('ab',48),'hex')),"
  "('"+FICT_MEMBER+"','"+WORK_B+"',1,'"+KEY_B+"','external_managed_kms','fictional-provider-b',repeat('b',64),decode(repeat('cd',48),'hex'));"
 ))

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--fictional-only',action='store_true')
 ap.add_argument('--scenario',choices=['survivor','deleted'],required=True)
 ap.add_argument('--evidence-root',required=True)
 ap.add_argument('--signed-root',required=True)
 args=ap.parse_args()
 if (R7019I_PRODUCTION_COHERENT_BACKUP_ENABLED or not args.fictional_only or
     os.environ.get('R7019I_DRIVER')!='fictional-only' or
     any(os.environ.get(k) for k in ('DATABASE_URL','PGHOST','PGUSER',
        'FILE_STORAGE_PATH','R87_REAL_PILOT_AUTH','R1V_LIVE'))):
  refuse('DEFAULT_OFF_OR_PRODUCTION_ENV_REFUSED')
 src=Path(args.evidence_root)
 signed=Path(args.signed_root)
 t7=Path('/Volumes/T7 Shield')
 if not (
  src.is_absolute() and signed.is_absolute() and
  src.parent==t7 and signed.parent==t7 and
  re.fullmatch(r'ws-beta-r1v-r7019i-fixture-[0-9a-f]{8}',src.name) and
  re.fullmatch(r'ws-beta-r1w-r7019i-fixture-[0-9a-f]{8}',signed.name) and
  src.name[-8:]==signed.name[-8:] and
  not src.exists() and not signed.exists()
 ):refuse('UNQUALIFIED_TEST_ONLY_ROOTS')
 if not all(shutil.which(x) for x in ('docker','gpg','tar','node')):
  refuse('LOCAL_FICTIONAL_TEST_DEPENDENCY_UNAVAILABLE')
 if not (ROOT/'scripts/ops/wsBetaR7019IIndependentSignedRestore.py').is_file():
  refuse('MISSING_PREDICATE_RESTORER')
 head=action(['git','rev-parse','HEAD']).decode().strip()
 if not re.fullmatch(r'[a-f0-9]{40}',head):refuse('SOURCE_COMMIT_NOT_PINNABLE')
 os.umask(0o077)
 src.mkdir(mode=0o700);signed.mkdir(mode=0o700)
 external=Path(tempfile.mkdtemp(prefix='r7019i-',dir='/private/tmp'))
 r1v.EVIDENCE=src
 r1v.SRC='ws-r1v-src-'+src.name[-8:]
 r1v.DST='ws-r1v-rest-'+src.name[-8:]
 source_started=False;source_removed=False;five_removed=False
 tx=None
 checks={}
 def prove(k,v):
  checks[k]=bool(v)
  if not v:refuse('TEST_ASSERTION_'+k)
 failure=None;restoration=None;restore_diagnostic=None
 try:
  roots=r1v.source_roots()
  srcdir=src/'fictional-sources'
  original_digest=file_fingerprint(srcdir)
  (external/'r7019i-original-files-digest.sha256').write_text(original_digest)
  (external/'r7019i-original-files-digest.sha256').chmod(0o600)
  r1v.start_pg(r1v.SRC);source_started=True
  stage_schema(r1v.SRC)
  enc=external/'independent_decryption_private'
  pub=external/'public_only_backup_writer'
  signer=external/'private_manifest_signer'
  encfpr=key(enc,'R7019I Fictional Encryption <fixture.invalid>','rsa2048','encr')
  signfpr=key(signer,'R7019I Fictional Manifest Signer <fixture.invalid>','ed25519','sign')
  pub.mkdir(mode=0o700)
  material=action(['gpg','--batch','--homedir',str(enc),'--export',encfpr])
  action(['gpg','--batch','--homedir',str(pub),'--import'],inputbytes=material)
  private_check=action(['gpg','--batch','--homedir',str(pub),'--with-colons','--list-secret-keys'])
  prove('backup_writer_public_recipient_has_no_private_key',b'sec:' not in private_check)
  signer_export=action(['gpg','--batch','--homedir',str(signer),'--export',signfpr])
  trusted=external/'trusted-signers.gpg'
  trusted.write_bytes(signer_export);trusted.chmod(0o600)
  tx=subprocess.Popen([DOCKER,'exec','-i',r1v.SRC,'psql','-XAtq',
   '-v','ON_ERROR_STOP=1','-U','fict','-d','ws_fixture'],
    stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,
    text=True,bufsize=1)
  assert tx.stdin is not None and tx.stdout is not None
  works,sid=sql_roster(tx,tx.stdout,tx.stdin)
  prove('actual_sql_works_from_same_pg_session_as_exported_snapshot',len(works)==2 and SNAPSHOT.fullmatch(sid))
  # Critically pg_dump uses --snapshot=EXACT_SNAPSHOT_ID while this
  # transaction stays active and owns its advisory xact lock.
  cmd=[
   '/usr/bin/python3',str(ROOT/'scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py'),
   '--fixture','--evidence-dir',str(src),
   '--source-dir',str(srcdir),'--postgres-container',r1v.SRC,
   '--public-gpg-home',str(pub),'--recipient-fingerprint',encfpr,
   '--fixture-snapshot',sid,'--fixture-source-head',head]
  env={'HOME':str(Path.home()),'PATH':os.environ.get('PATH',''),
       'WS_R1V_FIXTURE_ONLY':'fictional-only','R7019I_CAPTURE_FIXTURE':'fictional-only'}
  captured=json.loads(action(cmd,env=env,timeout=100))
  prove('one_pg_export_and_five_scopes_published_together',captured['encryptedArchives']==2 and captured['requiredFileVolumes']==5)
  unsigned=src/'complete'/captured['generation']
  prove('same_source_commit_pinned_in_unsigned_manifest',
   json.loads((unsigned/'manifest.json').read_text()).get('R7019ISourceHead')==head)
  # Keep the PG exported snapshot alive until the encrypted point is published.
  tx.stdin.write('ROLLBACK;\n');tx.stdin.flush()
  tx.stdin.close();tx.terminate();tx.wait(timeout=8)
  tx=None
  root_manifest=ROOT/'scripts/ops/wsBetaR1WSignedGeneration.py'
  certified=json.loads(action([
   '/usr/bin/python3',str(root_manifest),'--certify-fixture',
   '--source-generation',str(unsigned),'--certified-root',str(signed),
   '--signer-private-home',str(signer),
   '--trusted-public-keyring',str(trusted),
   '--expected-signer-fingerprint',signfpr,
  ],env={'HOME':str(Path.home()),'PATH':os.environ.get('PATH',''),
      'WS_R1W_SIGNED_FIXTURE_ONLY':'fictional-only'},timeout=30))
  prove('separate_pinned_manifest_signer_was_verified',
   certified['actualManifestSignatureVerified'] is True)
  point=signed/'certified'/captured['generation']
  # The current deletion checkpoint MUST be signed AFTER the fictional
  # canonical PostgreSQL Work DELETE, never before the erasure event it
  # claims to witness. SQL census was already captured before the backup.
  if args.scenario=='deleted':
   sql(r1v.SRC,"DELETE FROM member_manuscripts WHERE id='"+WORK_A+"';")
   count=sql(r1v.SRC,'SELECT count(*) FROM member_manuscripts;').decode().strip()
   prove('post_backup_actual_pg_work_deleted_with_key_fk_cascade',count=='1')
  census_input={
   'fixtureMode':'fictional-only','sourceOnly':True,
   'r1wSignerFpr':signfpr,'sourceRosterSha256':hashlib.sha256(
    json.dumps(works,separators=(',',':')).encode()).hexdigest(),
   'snapshotGeneration':20,'works':works,'sourceHead':head,
   'r1wSourceCommit':R1W_SOURCE,
  }
  signature=json.loads(action([
   'node',str(ROOT/'scripts/ops/wsBetaR7019IFictionalCensusAuthority.mjs'),
   'sign',str(point),str(external),signfpr,args.scenario],
   inputbytes=json.dumps(census_input).encode(),
   env={'HOME':str(Path.home()),'PATH':os.environ.get('PATH',''),
    'R7019I_FICTIONAL_AUTHORITY':'fictional-only'},timeout=18))
  prove('sql_derived_work_census_signed_to_verified_R1W_five_scope_bundle',
   signature['signedWorks']==2)
  # DO NOT restore until original PG and all five original file scopes
  # have been destroyed, exactly as in R1W physical cold restore.
  docker('stop','--time','4',r1v.SRC,timeout=22)
  r1v.CONTAINERS.remove(r1v.SRC)
  source_removed=True
  shutil.rmtree(srcdir)
  five_removed=not srcdir.exists()
  prove('original_pg_and_five_file_scopes_destroyed_first',source_removed and five_removed)
  restore_script=ROOT/'scripts/ops/wsBetaR7019IIndependentSignedRestore.py'
  restoreargs=[
   '/usr/bin/python3',str(restore_script),'--fixture',
   '--certified-generation',str(point),'--generation',captured['generation'],
   '--trusted-public-keyring',str(trusted),
   '--expected-signer-fingerprint',signfpr,'--external-trust-root',str(external),
   '--private-decryption-home',str(enc),
   '--destination-container',r1v.DST,
   '--restore-directory',str(signed/'signed-restored-files'),
   '--expected-member-id',FICT_MEMBER,
  ]
  run=subprocess.run(restoreargs,capture_output=True,timeout=190,
   env={'HOME':str(Path.home()),'PATH':os.environ.get('PATH',''),
       'R7019I_RESTORE_FIXTURE':'fictional-only'})
  if not run.stdout:refuse('RESTORE_ENTRYPOINT_NO_FICTIONAL_RECEIPT')
  outcome=json.loads(run.stdout)
  # Only the fixture's bounded, noncontent status and refusal category may
  # leave the restorer; no SQL rows, keys, or file paths are surfaced.
  checks['restorer_reported_expected_nonproduction_status']=bool(
    outcome.get('productionRestoreApproved') is False and
    outcome.get('productionDatabaseOrNASAccessed') is False)
  restore_diagnostic={'exitCode':run.returncode,
    'status':outcome.get('status'),'reason':outcome.get('reason'),
    'reportedRestoredSqlCount':outcome.get('restoredSQLWorkCount'),
    'reportedFiveScopes':outcome.get('restoredFiveFileScopes')}
  if args.scenario=='deleted':
   prove('deleted_work_refused_inside_independent_restore_entrypoint_before_key',
     run.returncode==70 and outcome.get('status')=='R7019I_PREDECRYPT_REFUSED_BETA_HOLD' and
     outcome.get('privateKeyConsulted') is False and outcome.get('restoreContainerCreated') is False)
   restoration='OLD_SIGNED_POINT_REFUSED_BEFORE_PRIVATE_KEY_AND_POSTGRES'
  else:
   prove('surviving_work_physical_postgres_and_five_volumes_restore_pass',
     run.returncode==0 and outcome.get('status')=='R7019I_SIGNED_CURRENT_SURVIVOR_PHYSICAL_RESTORE_PASS_BETA_HOLD' and
     outcome.get('restoredSQLWorkCount')==2 and outcome.get('restoredFiveFileScopes')==5 and
     outcome.get('temporaryPlaintextDestroyed') is True)
   restoration='SAME_SNAPSHOT_SIGNED_WORK_ROSTER_AND_FIVE_VOLUMES_RESTORED'
 except Exception as e:failure=type(e).__name__+':'+str(e)[:180]
 finally:
  if tx is not None:
   tx.terminate()
   try:tx.wait(timeout=5)
   except subprocess.TimeoutExpired:tx.kill();tx.wait(timeout=5)
  for container in list(r1v.CONTAINERS):
   subprocess.run([DOCKER,'rm','-f','-v',container],capture_output=True,timeout=16)
  if (src/'fictional-sources').exists():shutil.rmtree(src/'fictional-sources',ignore_errors=True)
  if (signed/'signed-restored-files').exists():shutil.rmtree(signed/'signed-restored-files',ignore_errors=True)
  if external.exists():shutil.rmtree(external,ignore_errors=True)
  names=[r1v.SRC,r1v.DST]
  remaining=[]
  for container in names:
   r=subprocess.run([DOCKER,'ps','-aq','--filter','name=^/'+container+'$'],
    capture_output=True,timeout=9)
   if r.returncode or r.stdout.strip():remaining.append(container)
  checks['all_test_pg_containers_removed']=not remaining
  checks['test_private_recovery_and_signer_keys_erased']=not external.exists()
  checks['original_fictional_source_files_removed']=not (src/'fictional-sources').exists()
  checks['no_fictional_restored_plaintext_left']=not (signed/'signed-restored-files').exists()
  status=(
   'R7019I_EXACT_SQL_CENSUS_SIGNED_FIVE_SCOPE_'+args.scenario.upper()+'_PASS_BETA_HOLD'
   if failure is None and all(checks.values()) else
   'HOLD_R7019I_FICTIONAL_SAME_SNAPSHOT_GENERATION_OR_CLEANUP')
  receipt={
   'protocol':'soullab.ws.r7019i.same-pg-snapshot-signed-five-scopes.fiction.v1',
   'utc':datetime.now(timezone.utc).isoformat(),
   'status':status,'scenario':args.scenario,
   'sourceHead':head,'checks':checks,
   'checksPassed':sum(checks.values()),'checksTotal':len(checks),
   'sourceSQLWorkRosterCount':2,
   'fiveOriginalFileScopesCertifiedInFictionalTest':True,
   'originalSourcePgAndFiveFixtureVolumesDestroyedBeforeRestore':source_removed and five_removed,
   'physicalOutcome':restoration,'restorerNonContentDiagnostic':restore_diagnostic,'errorClass':failure,
   'realKmsKeysUsed':False,'allPlatformWriterCoverageCertified':False,
   'operationalOffsiteErasureAuthorityCertified':False,
   'currentRealDeletionAndConsentHighwaterCertified':False,
   'productionSnapshotOrCronAccessed':False,
   'realBetaApproved':False,
  }
  if signed.is_dir():
   dest=signed/'R7019I_FICTIONAL_PHYSICAL_RECOVERY.json'
   if not dest.exists():
    dest.write_text(json.dumps(receipt,indent=2)+'\n');dest.chmod(0o600)
  print(json.dumps({
   'status':status,'scenario':args.scenario,
   'passed':sum(checks.values()),'total':len(checks),
   'physicalOutcome':restoration,'restorerNonContentDiagnostic':restore_diagnostic,'failureClass':failure,
   'ephemeralPrivateKeysDestroyed':not external.exists(),
   'productionTouched':False,'betaReleaseApproved':False
  },sort_keys=True))
  return 0 if status.endswith('PASS_BETA_HOLD') else 2

if __name__=='__main__':
 try:raise SystemExit(main())
 except Exception as e:
  print(json.dumps({'status':'HOLD_R7019I_FIXTURE_PRESTART',
   'reason':type(e).__name__,'realProductionAccessed':False,
   'betaReleaseApproved':False},sort_keys=True))
  raise SystemExit(70)
