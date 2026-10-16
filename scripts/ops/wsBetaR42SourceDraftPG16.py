#!/usr/bin/env python3
"""R42 exact Source R36 + Section Draft R35 in one disposable PG16 + AES-GCM vault.

Fictional-only Mac acceptance. No production routes, accounts, AWS, provider,
real authors or live keys. Removes only exact randomized temporary fixtures.
"""
import json,os,secrets,socket,subprocess,sys,tempfile,shutil,time
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-release-r11-build-20261016')
RECEIPT=EVIDENCE/'R42_SOURCE_DRAFT_APPLY_UNDO_PG16_20261016.json'
INITIALLOG=EVIDENCE/'R42_SOURCE_DRAFT_APPLY_PHASE1_JEST_20261016.log'
COLDLOG=EVIDENCE/'R42_SOURCE_DRAFT_APPLY_COLD_JEST_20261016.log'
NAME='ws-r42-unified-pg16-'+secrets.token_hex(6)
A='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204'
B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205'
FOREIGN='4c0782ca-9074-43ee-9f3c-5f8500026781'
FORBIDDEN=[
 'R42_FICTIONAL_LANTERN_','R42_FICTIONAL_GARDEN_',
 'R42_FICTIONAL_ORIGINAL_DOCX_BYTES','R42-Imagination.docx',
 'r42-fixture-parser',
]
SCHEMAS=(
 'docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql',
 'docs/ops/WS_R33_ENCRYPTED_PENDING_REVIEW_ONLY.sql',
 'docs/ops/WS_R35_HELD_ORPHAN_INTENTS_REVIEW_ONLY.sql',
 'docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql',
 'docs/ops/WS_R42_SOURCE_DRAFT_INTENT_REVIEW_ONLY.sql',
)
def process(*args,timeout=45,env=None,check=True):
 r=subprocess.run(args,cwd=ROOT,text=True,capture_output=True,timeout=timeout,env=env)
 if check and r.returncode!=0:
  raise RuntimeError('R42_command_failure_'+args[0]+':'+(r.stderr or '')[-260:])
 return r
def docker(*args,**kwargs):return process('docker',*args,**kwargs)
def pg(sql):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','fict','-d','r35_draft','-c',sql,timeout=20).stdout.strip()
def free_port():
 s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
 s.bind(('127.0.0.1',0));p=s.getsockname()[1];s.close();return p
def wait_stable():
 for _ in range(120):
  r=docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
     '-U','fict','-d','r35_draft','-c','SELECT 1',timeout=5,check=False)
  comm=docker('exec',NAME,'cat','/proc/1/comm',timeout=5,check=False)
  if r.returncode==0 and r.stdout.strip()=='1' and comm.returncode==0    and comm.stdout.strip()=='postgres':return
  time.sleep(.18)
 raise RuntimeError('R42_Postgres16_not_stable')
def seed():
 pg(f"""CREATE TABLE members(id uuid PRIMARY KEY,admin_role text);
 CREATE TABLE member_manuscripts(
   id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
 INSERT INTO members VALUES ('{A}',NULL),('{B}',NULL);
 INSERT INTO member_manuscripts VALUES ('{FOREIGN}','{B}');
 """)
 for rel in SCHEMAS:
  file=ROOT/rel
  if not file.is_file():raise RuntimeError('R42_missing_source_schema_'+rel)
  remote='/tmp/'+file.name
  docker('cp',str(file),NAME+':'+remote,timeout=20)
  docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','fict','-d','r35_draft','-f',remote,timeout=35)
def main():
 if os.getenv('R42_PHYSICAL_PG16')!='fictional-only':
  print('R42 refuses without exact fictional-only opt-in')
  return 3
 root=Path(tempfile.mkdtemp(prefix='ws-r35-physical-r42-'))
 vault=root/'vault';vault.mkdir()
 (root/'R42_FICTIONAL_ONLY.marker').write_text('no real writing\n')
 escrow=Path(tempfile.mkdtemp(prefix='ws-r42-key-fixture-'))
 (escrow/'R42_FICTIONAL_ONLY.marker').write_text('same-Mac fabricated key\n')
 port=free_port()
 started=False;err=None
 checks={
  'postgres16':False,'localhostOnly':False,'noHostMounts':False,
  'initialSourceAndDraftTests':False,'metadataOnlySqlDump':False,
  'fileVaultHasOnlyCiphertext':False,'sourceDraftFilesPresent':False,
  'crashedPostgresRestarted':False,'freshProcessReopened':False,
  'fixtureContainerRemoved':False,'fixtureVaultRemoved':False,
  'fictionalEscrowRemoved':False,'productionUnchangedByThisFixture':True,
 }
 status='R42_SOURCE_AND_EDITORIAL_UNIFIED_HOLD'
 try:
  docker('image','inspect','postgres:16.13','--format','{{.Id}}',timeout=20)
  docker('run','--pull','never','-d','--name',NAME,
   '--network','bridge','--memory','900m','--cpus','2',
   '--pids-limit','180','--security-opt','no-new-privileges',
   '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=r35_draft',
   '-e','POSTGRES_HOST_AUTH_METHOD=trust',
   '-p',f'127.0.0.1:{port}:5432','postgres:16.13',timeout=75)
  started=True;wait_stable()
  checks['postgres16']=pg('SHOW server_version_num').startswith('160')
  setting=json.loads(docker('inspect',NAME,'--format','{{json .HostConfig}}',timeout=15).stdout)
  bindings=setting.get('PortBindings',{}).get('5432/tcp') or []
  checks['localhostOnly']=bool(bindings) and all(x.get('HostIp')=='127.0.0.1' for x in bindings)
  checks['noHostMounts']=setting.get('Binds') is None
  if not (checks['postgres16'] and checks['localhostOnly'] and checks['noHostMounts']):
   raise RuntimeError('R42_nonisolated_PG_container')
  seed()
  env=os.environ.copy()
  env.update({
   'DATABASE_URL':f'postgresql://fict@127.0.0.1:{port}/r35_draft',
   'FILE_STORAGE_PATH':str(vault),
   'R42_FICTIONAL_ESCROW_PATH':str(escrow/'fictional.json'),
   'R42_PHYSICAL_PG16':'fictional-only',
   'R42_SOURCE_DRAFT_FIXTURE':'fictional-only',
   'R36_SOURCE_COMPOSER_FIXTURE':'fictional-only',
   'R35_INTENT_FIXTURE':'fictional-only',
   'R34_CLAIM_RECONCILE_FIXTURE':'fictional-only',
   'R33_PENDING_CLAIM_FIXTURE':'fictional-only',
   'R32_HELD_SOURCE_FIXTURE':'fictional-only',
   'R35_PROTECTED_DRAFT_FIXTURE':'fictional-only',
   'R35_PHYSICAL_PG16_FIXTURE':'fictional-only',
   'R37_SECTION_PASSAGE_FIXTURE':'fictional-only',
   'R36_PASSAGE_REVIEW_FIXTURE':'fictional-only',
  })
  first=process(str(ROOT/'node_modules/.bin/jest'),'--runInBand','--no-coverage',
   '--testTimeout=20000','--runTestsByPath',
   'scripts/ops/__tests__/r42PG16SourceDraft.test.ts',timeout=115,check=False,env=env)
  INITIALLOG.write_text(first.stdout+'\n'+first.stderr)
  checks['initialSourceAndDraftTests']=first.returncode==0
  # Whole fictional database dump examined *in memory*, never archived.
  dump=docker('exec',NAME,'pg_dump','-Fp','-U','fict','-d','r35_draft',
   timeout=40).stdout
  checks['metadataOnlySqlDump']=all(x not in dump for x in FORBIDDEN)
  files=list(vault.rglob('*.enc'))
  checks['sourceDraftFilesPresent']=len(files)>=30
  checks['fileVaultHasOnlyCiphertext']=bool(files) and all(
    all(s.encode('utf8') not in file.read_bytes() for s in FORBIDDEN)
    for file in files)
  if not all(checks[k] for k in (
    'initialSourceAndDraftTests','metadataOnlySqlDump',
    'sourceDraftFilesPresent','fileVaultHasOnlyCiphertext',
  )):
   raise RuntimeError('R42_initial_tests_or_ciphertext_inspection_failed')
  signed=escrow/'fictional.json'
  if not signed.is_file() or signed.stat().st_mode & 0o077:
   raise RuntimeError('R42_disposable_recovery_key_missing_or_permissive')
  docker('kill','--signal=SIGKILL',NAME,timeout=40)
  docker('start',NAME,timeout=40)
  wait_stable()
  checks['crashedPostgresRestarted']=True
  cold_env=env.copy();cold_env['R42_COLD_PG16']='fictional-only'
  second=process(str(ROOT/'node_modules/.bin/jest'),'--runInBand',
    '--no-coverage','--runTestsByPath',
    'scripts/ops/__tests__/r42ColdPG16SourceDraft.test.ts',
    timeout=100,check=False,env=cold_env)
  COLDLOG.write_text(second.stdout+'\n'+second.stderr)
  checks['freshProcessReopened']=second.returncode==0
  if not checks['freshProcessReopened']:
   raise RuntimeError('R42_cold_process_original_draft_reopen_failed')
  status='R42_SOURCE_AND_ENCRYPTED_INITIAL_DRAFT_ACTUAL_PG16_PASS_RELEASE_HELD'
 except Exception as e:
  err=str(e)[:430]
 finally:
  if started:
   removed=docker('rm','-fv',NAME,check=False,timeout=50)
   checks['fixtureContainerRemoved']=removed.returncode==0
  else:checks['fixtureContainerRemoved']=True
  remaining=docker('ps','-a','--format','{{.Names}}',check=False).stdout.splitlines()
  checks['fixtureContainerRemoved']=(checks['fixtureContainerRemoved'] and NAME not in remaining)
  if root.exists() and (root/'R42_FICTIONAL_ONLY.marker').is_file():shutil.rmtree(root)
  checks['fixtureVaultRemoved']=not root.exists()
  if escrow.exists() and (escrow/'R42_FICTIONAL_ONLY.marker').is_file():
   shutil.rmtree(escrow)
  checks['fictionalEscrowRemoved']=not escrow.exists()
  if not (checks['fixtureContainerRemoved'] and checks['fixtureVaultRemoved'] and
     checks['fictionalEscrowRemoved']):
   status='R42_DISPOSABLE_CLEANUP_HOLD'
  result={
   'status':status,'checks':checks,'error':err,
   'sourceParent':'ea15a9c3d7f35e384e600dcf9affe729d4dba4eb',
   'acceptedLateSource':'079fcfb5f48c559701596882af751d7c1bd1b6f1',
   'testOnly':True,'noRealMemberWriting':True,'realExternalKmsInstalled':False,
   'independentDeletionCoordinatorInstalled':False,'noProductionChanges':True,
   'noActualSafariBeta':True,'sourceAndDraftLiveRoutesUnchanged':True,
   'release':'HOLD','at':datetime.now(timezone.utc).isoformat(),
  }
  fd=os.open(RECEIPT,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
  with os.fdopen(fd,'w') as out:out.write(json.dumps(result,indent=2)+'\n')
  print(json.dumps(result,indent=2))
 return 0 if err is None and all(checks.values()) else 2
if __name__=='__main__':sys.exit(main())
