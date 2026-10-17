#!/usr/bin/env python3
"""R49 ONE fictional Work: Source → encrypted private choice → durable signed
Apply → verified ciphertext → independent Undo → same-Work PG16 crash/restart.

Absolutely not a real member, public API route, independent KMS, trusted human
click or production release. Cached PG image, exclusive loopback-only container,
disposable vault/escrow, unique evidence receipt, no overwrites.
"""
import json,os,secrets,socket,subprocess,sys,tempfile,shutil,time
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-r49-one-work-evidence-chatgpt-20261016')
RECEIPT=EVIDENCE/'R49_ONE_CONTINUOUS_WORK_PG16_20261016.json'
INITIAL=EVIDENCE/'R49_ONE_WORK_PHASE1_JEST.log'
COLD=EVIDENCE/'R49_ONE_WORK_PHASE2_COLD_JEST.log'
NAME='ws-r49-whole-work-'+secrets.token_hex(6)
MEMBER='11111111-1111-4111-8111-111111111111'
FOREIGN='22222222-2222-4222-8222-222222222222'
FOUNDER='55555555-5555-4555-8555-555555555555'
WORK='33333333-3333-4333-8333-33333333333f'
FORBIDDEN=[
 'R49_FICTIONAL_SOURCE_','R49_FICTIONAL_SECOND_',
 'R49_FICTIONAL_ORIGINAL_DOCX_BYTES',
 'R49-fictional.docx','r49-synthetic-parser',
 'first enchanted','first sparkling',
 'r49-unique-fictional-review-intention',
]
SCHEMAS=[
 'docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql',
 'docs/ops/WS_R33_ENCRYPTED_PENDING_REVIEW_ONLY.sql',
 'docs/ops/WS_R35_HELD_ORPHAN_INTENTS_REVIEW_ONLY.sql',
 'docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql',
 'docs/ops/WS_R42_SOURCE_DRAFT_INTENT_REVIEW_ONLY.sql',
 'docs/ops/WS_R44_DURABLE_AUTHOR_APPROVAL_REVIEW_ONLY.sql',
 'docs/ops/WS_R47_PRIVATE_REVIEW_CUSTODY_REVIEW_ONLY.sql',
 'docs/ops/WS_R47_DURABLE_UNDO_REVIEW_ONLY.sql',
]
def call(*args,timeout=45,env=None,check=True):
 r=subprocess.run(args,cwd=ROOT,text=True,capture_output=True,timeout=timeout,env=env)
 if check and r.returncode:
  raise RuntimeError('r49_command_'+args[0]+'_exit_'+str(r.returncode))
 return r
def docker(*args,**kw):return call('docker',*args,**kw)
def sql(s):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','fict','-d','r35_draft','-c',s,timeout=24).stdout.strip()
def port_binding():
 port=docker('port',NAME,'5432/tcp',timeout=18).stdout.strip()
 import re
 m=re.fullmatch(r'127\.0\.0\.1:(\d+)',port)
 if not m:raise RuntimeError('r49_non_loopback_pg_port')
 return int(m.group(1))
def wait_postgres():
 for _ in range(110):
  alive=docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','fict','-d','r35_draft','-c','SELECT 1',check=False,timeout=5)
  comm=docker('exec',NAME,'cat','/proc/1/comm',check=False,timeout=5)
  if alive.returncode==0 and alive.stdout.strip()=='1' and \
    comm.returncode==0 and comm.stdout.strip()=='postgres':return
  time.sleep(.18)
 raise RuntimeError('r49_pg16_unstable')
def seed_tables():
 sql(f"""CREATE TABLE members (id uuid PRIMARY KEY,admin_role text);
 CREATE TABLE ops_contacts (member_id uuid REFERENCES members(id),
   deleted_at timestamptz,contact_type text,pipeline_stage text);
 CREATE TABLE auth_sessions (
   session_token text PRIMARY KEY,member_id uuid REFERENCES members(id),
   revoked boolean NOT NULL,expires_at timestamptz NOT NULL);
 CREATE TABLE writers_studio_beta_consent_events (
   seq bigserial PRIMARY KEY,member_id uuid REFERENCES members(id),
   decision text NOT NULL,policy_version text NOT NULL,policy_sha256 text NOT NULL);
 CREATE TABLE member_manuscripts (
   id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
 CREATE UNIQUE INDEX r49_member_work_owner_pair
   ON member_manuscripts(id,member_id);
 CREATE TABLE r38_fixture_work_fence (
   work_id uuid PRIMARY KEY REFERENCES member_manuscripts(id),
   member_id uuid REFERENCES members(id),active boolean NOT NULL DEFAULT true);
 INSERT INTO members VALUES
 ('{MEMBER}',NULL),('{FOREIGN}',NULL),('{FOUNDER}','founder');
 INSERT INTO ops_contacts VALUES
 ('{MEMBER}',NULL,'beta_tester','active'),
 ('{FOREIGN}',NULL,'beta_tester','active');
 INSERT INTO auth_sessions VALUES
 ('r49-fictitious-session-A','{MEMBER}',false,now()+interval '1 day'),
 ('r49-fictitious-session-B','{FOREIGN}',false,now()+interval '1 day');
 INSERT INTO writers_studio_beta_consent_events
 (member_id,decision,policy_version,policy_sha256) VALUES
 ('{MEMBER}','accept','r49-fictional-notice','{'b'*64}'),
 ('{FOREIGN}','accept','r49-fictional-notice','{'b'*64}');
 """)
 for rel in SCHEMAS:
  source=ROOT/rel
  if not source.is_file():raise RuntimeError('r49_missing_fixture_schema_'+rel)
  dest='/tmp/r49_'+source.name
  docker('cp',str(source),NAME+':'+dest,timeout=25)
  docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U',
    'fict','-d','r35_draft','-f',dest,timeout=40)
def run_jest(file,environment,destination,timeout=140):
 r=call(str(ROOT/'node_modules/.bin/jest'),'--runInBand',
  '--no-coverage','--runTestsByPath',file,timeout=timeout,
  env=environment,check=False)
 fd=os.open(destination,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as out:out.write(r.stdout+'\n'+r.stderr)
 return r.returncode,r.stdout+'\n'+r.stderr
def has_no_plaintext(vault):
 dumped=docker('exec',NAME,'pg_dump','-Fp','-U','fict','-d','r35_draft',timeout=48).stdout
 sqlclean=all(x not in dumped for x in FORBIDDEN)
 files=list(vault.rglob('*.enc'))
 vaultclean=len(files)>=6 and all(
  all(x.encode('utf8') not in file.read_bytes() for x in FORBIDDEN)
  for file in files
 )
 return sqlclean,vaultclean,len(files)
def current_version():
 return call('git','rev-parse','HEAD').stdout.strip()
def main():
 if os.environ.get('R49_SINGLE_WORK_PHYSICAL_PG16')!='fictional-only':
  print('R49 rejects non-fictional launch')
  return 3
 if EVIDENCE.exists():
  print('R49 evidence destination exists; refusing overwrite')
  return 4
 umask=os.umask(0o077);os.umask(umask)
 EVIDENCE.mkdir(parents=True,mode=0o700)
 root=Path(tempfile.mkdtemp(prefix='ws-r35-physical-r49-'))
 vault=root/'vault';vault.mkdir()
 (root/'R49_FICTIONAL_ONLY.marker').write_text('fictional only\n')
 secrets_dir=Path(tempfile.mkdtemp(prefix='ws-r49-fake-private-recovery-'))
 (secrets_dir/'R49_FICTIONAL_ONLY.marker').write_text('fake only\n')
 escrow=secrets_dir/'r49-continuous-recovery.json'
 checks={k:False for k in (
  'postgres16','loopbackOnly','noHostBinds','sourceSchemaAndCustodySeeded',
  'oneWorkFullJourneyTests','pendingSourceAndDraftImmutable',
  'privateReviewAndDurableApprovalDistinct','singleAuthorApplyAndUndo',
  'metadataOnlySQL','vaultCiphertextOnly',
  'fakeEscrowOwnerOnly','postgresCrashRestarted',
  'freshNodeWholeWorkRecovery','postRestartImmutableAndSpent',
  'noExtraRecoveryWrites','containerRemoved','vaultRemoved','fakeKeysRemoved',
 )}
 checks['noRealMembersOrProductionWrites']=True
 started=False;err=None;status='R49_SINGLE_WORK_FICTIONAL_HOLD';port=0;files=None
 try:
  docker('image','inspect','postgres:16.13',timeout=20)
  docker('run','--pull','never','-d','--name',NAME,
    '--network','bridge','--memory','900m','--cpus','2',
    '--pids-limit','180','--security-opt','no-new-privileges',
    '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=r35_draft',
    '-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '-p','127.0.0.1::5432','postgres:16.13',timeout=65)
  started=True;wait_postgres();port=port_binding()
  checks['postgres16']=sql('SHOW server_version_num').startswith('160')
  hc=json.loads(docker('inspect',NAME,'--format',
    '{{json .HostConfig}}',timeout=14).stdout)
  ports=hc.get('PortBindings',{}).get('5432/tcp') or []
  checks['loopbackOnly']=len(ports)==1 and ports[0].get('HostIp')=='127.0.0.1'
  checks['noHostBinds']=hc.get('Binds') is None
  if not all(checks[k] for k in ['postgres16','loopbackOnly','noHostBinds']):
    raise RuntimeError('r49_untrusted_fixture_container')
  seed_tables()
  checks['sourceSchemaAndCustodySeeded']=sql(
   "SELECT count(*) FROM writers_studio_r47_private_review")=='0'
  env={**os.environ,
    'R49_SINGLE_WORK_PHYSICAL_PG16':'fictional-only',
    'R50_SERVER_OWNED_CHOICE_FIXTURE':'fictional-only',
    'R49_WHOLE_WORK_FIXTURE':'fictional-only',
    'R42_SOURCE_DRAFT_FIXTURE':'fictional-only',
    'R36_SOURCE_COMPOSER_FIXTURE':'fictional-only',
    'R35_INTENT_FIXTURE':'fictional-only',
    'R34_CLAIM_RECONCILE_FIXTURE':'fictional-only',
    'R33_PENDING_CLAIM_FIXTURE':'fictional-only',
    'R32_HELD_SOURCE_FIXTURE':'fictional-only',
    'R35_PROTECTED_DRAFT_FIXTURE':'fictional-only',
    'R35_PHYSICAL_PG16_FIXTURE':'fictional-only',
    'R47_PRIVATE_EDITORIAL_FIXTURE':'fictional-only',
    'R37_SECTION_PASSAGE_FIXTURE':'fictional-only',
    'R36_PASSAGE_REVIEW_FIXTURE':'fictional-only',
    'R48_SPENT_APPLY_RECOVERY_FIXTURE':'fictional-only',
    'R47_DURABLE_UNDO_FIXTURE':'fictional-only',
    'R46_DURABLE_SIGNED_APPLY_FIXTURE':'fictional-only',
    'R45_DURABLE_SIGNED_AUTHOR_FIXTURE':'fictional-only',
    'R44_DURABLE_APPROVAL_FIXTURE':'fictional-only',
    'R39_SIGNED_SECTION_REQUEST_FIXTURE':'fictional-only',
    'R38_SIGNED_DRAFT_REQUEST_FIXTURE':'fictional-only',
    'R29_SESSION_FENCE_FIXTURE':'fictional-only',
    'R49_COLD_ESCROW_PATH':str(escrow),
    'DATABASE_URL':f'postgresql://fict@127.0.0.1:{port}/r35_draft',
    'FILE_STORAGE_PATH':str(vault),
    'WRITERS_STUDIO_RESTRICTED_BETA':'true',
    'WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW':'true',
    'WRITERS_STUDIO_BETA_MEMBER_IDS':MEMBER+','+FOREIGN,
    'WRITERS_STUDIO_BETA_CONSENT_VERSION':'r49-fictional-notice',
    'WRITERS_STUDIO_BETA_CONSENT_SHA256':'b'*64,
  }
  code,output=run_jest('scripts/ops/__tests__/r49SingleWorkWholeJourneyPG16.test.ts',
    env,INITIAL)
  checks['oneWorkFullJourneyTests']=code==0 and \
     '7 passed, 7 total' in output
  checks['pendingSourceAndDraftImmutable']=all([
   sql('SELECT count(*) FROM writers_studio_r32_held_originals')=='1',
   sql('SELECT count(*) FROM writers_studio_r42_held_start_links')=='1',
   sql('SELECT count(*) FROM writers_studio_r35_draft_versions')=='3',
  ])
  checks['privateReviewAndDurableApprovalDistinct']=all([
   sql('SELECT count(*) FROM writers_studio_r47_private_review')=='1',
   sql("SELECT count(*) FROM writers_studio_r47_private_review WHERE state='verified'")=='1',
   sql("SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='spent'")=='1',
  ])
  checks['singleAuthorApplyAndUndo']=all([
   sql("SELECT count(*) FROM writers_studio_r47_held_undo WHERE state='spent'")=='1',
   sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE action='restore'")=='1',
  ])
  clean_sql,clean_vault,files=has_no_plaintext(vault)
  checks['metadataOnlySQL']=clean_sql
  checks['vaultCiphertextOnly']=clean_vault
  checks['fakeEscrowOwnerOnly']=escrow.is_file() and escrow.stat().st_mode&0o077==0
  if not all(checks[k] for k in [
    'oneWorkFullJourneyTests','pendingSourceAndDraftImmutable',
    'privateReviewAndDurableApprovalDistinct','singleAuthorApplyAndUndo',
    'metadataOnlySQL','vaultCiphertextOnly','fakeEscrowOwnerOnly',
  ]):
   raise RuntimeError('r49_first_continuous_journey_failed')
  docker('kill','--signal=SIGKILL',NAME,timeout=35)
  docker('start',NAME,timeout=38)
  wait_postgres()
  checks['postgresCrashRestarted']=True
  port=port_binding()
  cold_env={**env,'R49_COLD_PHYSICAL_PG16':'fictional-only',
    'DATABASE_URL':f'postgresql://fict@127.0.0.1:{port}/r35_draft'}
  first_count=sql('SELECT count(*) FROM writers_studio_r35_draft_versions')
  code,output=run_jest('scripts/ops/__tests__/r49WholeWorkColdPG16.test.ts',
    cold_env,COLD,timeout=110)
  checks['freshNodeWholeWorkRecovery']=code==0 and '6 passed, 6 total' in output
  checks['postRestartImmutableAndSpent']=(
   sql('SELECT count(*) FROM writers_studio_r32_held_originals')=='1' and
   sql('SELECT count(*) FROM writers_studio_r47_private_review')=='1' and
   sql("SELECT count(*) FROM writers_studio_r47_held_undo WHERE state='spent'")=='1' and
   sql("SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='spent'")=='1')
  checks['noExtraRecoveryWrites']=first_count=='3' and \
    sql('SELECT count(*) FROM writers_studio_r35_draft_versions')=='3'
  if not all(checks[k] for k in [
     'freshNodeWholeWorkRecovery','postRestartImmutableAndSpent',
     'noExtraRecoveryWrites',
  ]):raise RuntimeError('r49_cold_continuous_recovery_failed')
  status='R49_ONE_WORK_SOURCE_REVIEW_APPLY_UNDO_COLD_PG16_PASS_RELEASE_HELD'
 except Exception as ex:
  err=str(ex)[:250]
 finally:
  if started:
   removed=docker('rm','-fv',NAME,check=False,timeout=45)
   checks['containerRemoved']=removed.returncode==0
  else:checks['containerRemoved']=True
  remaining=docker('ps','-a','--format','{{.Names}}',check=False,timeout=15)
  checks['containerRemoved']=checks['containerRemoved'] and \
     NAME not in remaining.stdout.splitlines()
  if (root/'R49_FICTIONAL_ONLY.marker').is_file():shutil.rmtree(root)
  checks['vaultRemoved']=not root.exists()
  if (secrets_dir/'R49_FICTIONAL_ONLY.marker').is_file():shutil.rmtree(secrets_dir)
  checks['fakeKeysRemoved']=not secrets_dir.exists()
  if not all(checks[k] for k in ('containerRemoved','vaultRemoved','fakeKeysRemoved')):
   status='R49_INCOMPLETE_DISPOSABLE_CLEANUP_HOLD'
  result={'status':status,'sourceHead':current_version(),
   'checks':checks,'error':err,'encryptedVaultFilesSeen':files,
   'releaseApproved':False,'memberWrites':0,'productionChanged':False,
   'realKmsInstalled':False,'actualLoggedInBrowser':False,
   'notAnIndependentRevocationFence':True,
   'at':datetime.now(timezone.utc).isoformat()}
  fd=os.open(RECEIPT,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
  with os.fdopen(fd,'w') as out:json.dump(result,out,indent=2)
  print(json.dumps(result,indent=2))
 return 0 if err is None and all(checks.values()) else 2

if __name__=='__main__':sys.exit(main())
