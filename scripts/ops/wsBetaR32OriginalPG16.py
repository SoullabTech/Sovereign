#!/usr/bin/env python3
"""R32 disposable PG16 + encrypted original file-vault physical acceptance.
No network KMS, real member, user manuscript, production SQL or deployment.
Requires explicit fictional opt-in. Only own randomized container is removed.
"""
import json,os,subprocess,secrets,socket,sys,tempfile,shutil,time
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-release-r9-build-20261015')
RESULT=EVIDENCE/'R32_ENCRYPTED_ORIGINAL_PG16_COLD_20261016.json'
LOG=EVIDENCE/'R32_ENCRYPTED_ORIGINAL_JEST_REPEAT_20261016.log'
COLDLOG=EVIDENCE/'R32_ENCRYPTED_ORIGINAL_COLD_JEST_20261016.log'
NAME='ws-r32-original-pg16-'+secrets.token_hex(6)
MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204'
FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205'
WORK='4c0782ca-9074-43ee-9f3c-5f8500026780'
OTHER='4c0782ca-9074-43ee-9f3c-5f8500026781'
FORBIDDEN=[
'Hush-and-Clouds.docx','Two-Moons.pdf','Old-Notes.txt','Garden-House.md',
'R32_FICTIONAL_DOCX_TEXT_','R32_FICTIONAL_PDF_TEXT_',
'R32_FICTIONAL_TXT_TEXT_','R32_FICTIONAL_MD_TEXT_',
'R32_FICTIONAL_PASTED_TEXT_','R32_FAKE_ZIP_DOCX',
]
def run(*args,timeout=45,check=True,env=None):
 r=subprocess.run(args,cwd=ROOT,text=True,capture_output=True,timeout=timeout,env=env)
 if check and r.returncode!=0:
  raise RuntimeError('R32_subprocess_failed:'+args[0]+':'+(r.stderr or '')[-260:])
 return r
def docker(*args,**kw):return run('docker',*args,**kw)
def psql(query):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','soullab','-d','postgres','-c',query,timeout=15).stdout.strip()
def freeport():
 s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.bind(('127.0.0.1',0))
 p=s.getsockname()[1];s.close();return p
def ready():
 for _ in range(100):
  r=docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','soullab','-d','postgres','-c','SELECT 1',timeout=5,check=False)
  p=docker('exec',NAME,'cat','/proc/1/comm',timeout=5,check=False)
  if r.returncode==0 and r.stdout.strip()=='1' and p.returncode==0    and p.stdout.strip()=='postgres':return
  time.sleep(.15)
 raise RuntimeError('R32_unstable_PG16_bootstrap')
def seed():
 psql(f"""CREATE TABLE members(id uuid PRIMARY KEY);
 CREATE TABLE member_manuscripts(
  id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
 INSERT INTO members VALUES('{MEMBER}'),('{FOREIGN}');
 INSERT INTO member_manuscripts VALUES('{WORK}','{MEMBER}'),('{OTHER}','{FOREIGN}');""")
 sql=ROOT/'docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql'
 docker('cp',str(sql),NAME+':/tmp/r32_original_review.sql')
 docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','soullab','-d','postgres','-f','/tmp/r32_original_review.sql')
def main():
 if os.environ.get('R32_PHYSICAL_PG16')!='fictional-only':
  print('R32 refuses without exact fictional-only physical opt-in')
  return 3
 vault=Path(tempfile.mkdtemp(prefix='ws-r32-fict-sealed-source-'))
 (vault/'R32_FICTIONAL_ONLY.marker').write_text('Only fabricated source documents\n')
 custody=Path(tempfile.mkdtemp(prefix='ws-r32-fict-cold-key-'))
 (custody/'R32_FICTIONAL_ONLY.marker').write_text('Test key never a real KMS\n')
 port=freeport();started=False;error=None
 checks={'pg16':False,'onlyLoopback':False,'realDbAndVaultSuite':False,
  'noProseInPgDump':False,'noProseInVault':False,'vaultObjectsPresent':False,
  'tempVaultGone':False,'testContainerGone':False,'escrowGone':False,'pgCrashedRestarted':False,
  'freshProcessSourceRestored':False,'noProductionTouched':True}
 status='R32_FICTIONAL_ENCRYPTED_SOURCE_HOLD'
 try:
  docker('image','inspect','postgres:16.13','--format','{{.Id}}',timeout=15)
  docker('run','--pull','never','-d','--name',NAME,
   '-e','POSTGRES_USER=soullab','-e','POSTGRES_HOST_AUTH_METHOD=trust',
   '-p',f'127.0.0.1:{port}:5432','postgres:16.13',timeout=70)
  started=True;ready()
  checks['pg16']=docker('exec',NAME,'postgres','--version').stdout.startswith(
    'postgres (PostgreSQL) 16.')
  bindings=json.loads(docker('inspect',NAME,'--format',
    '{{json .NetworkSettings.Ports}}').stdout).get('5432/tcp',[])
  checks['onlyLoopback']=bool(bindings) and all(
    x.get('HostIp')=='127.0.0.1' for x in bindings)
  if not (checks['pg16'] and checks['onlyLoopback']):
   raise RuntimeError('R32_unacceptable_database_or_exposure')
  seed()
  env=os.environ.copy()
  env.update({
   'DATABASE_URL':f'postgresql://soullab@127.0.0.1:{port}/postgres',
   'FILE_STORAGE_PATH':str(vault),
   'R32_FICTIONAL_ESCROW_PATH':str(custody/'test-key-only.json'),
   'R32_HELD_SOURCE_FIXTURE':'fictional-only',
   'R32_PHYSICAL_PG16':'fictional-only',
  })
  test='scripts/ops/__tests__/r32OriginalPG16.test.ts'
  j=run(str(ROOT/'node_modules/.bin/jest'),'--runInBand','--no-coverage',
    '--runTestsByPath',test,timeout=90,check=False,env=env)
  LOG.write_text(j.stdout+'\n'+j.stderr)
  checks['realDbAndVaultSuite']=j.returncode==0
  # Full *fictional* isolated SQL dump examined in process. Not persisted.
  dump=docker('exec',NAME,'pg_dump','-Fp','--no-owner',
    '--no-privileges','-U','soullab','-d','postgres',timeout=40).stdout
  checks['noProseInPgDump']=all(x not in dump for x in FORBIDDEN)
  sealed=list(vault.rglob('*.enc'))
  checks['vaultObjectsPresent']=len(sealed)==10
  checks['noProseInVault']=bool(sealed) and all(
    all(term.encode('utf8') not in f.read_bytes() for term in FORBIDDEN)
    for f in sealed)
  if not all(checks[x] for x in ['realDbAndVaultSuite','noProseInPgDump',
       'noProseInVault','vaultObjectsPresent']):
   raise RuntimeError('R32_file_SQL_cipher_checks_refused')
  escrow=custody/'test-key-only.json'
  if not escrow.is_file() or escrow.stat().st_mode & 0o077:
   raise RuntimeError('R32_missing_or_permissive_fixture_escrow')
  docker('kill','--signal=SIGKILL',NAME,timeout=40)
  docker('start',NAME,timeout=40)
  ready()
  checks['pgCrashedRestarted']=True
  cold_env=env.copy();cold_env['R32_COLD_RESTORE']='fictional-only'
  cold=run(str(ROOT/'node_modules/.bin/jest'),'--runInBand','--no-coverage',
   '--runTestsByPath','scripts/ops/__tests__/r32ColdOriginalPG16.test.ts',
   timeout=90,check=False,env=cold_env)
  COLDLOG.write_text(cold.stdout+'\n'+cold.stderr)
  checks['freshProcessSourceRestored']=cold.returncode==0
  if not checks['freshProcessSourceRestored']:
   raise RuntimeError('R32_cold_original_recovery_suite_failed')
  status='R32_ACTUAL_PG16_ENCRYPTED_ORIGINALS_COLD_REOPEN_FICTIONAL_PASS_RELEASE_HELD'
 except Exception as e:
  error=str(e)[:400]
 finally:
  if vault.exists() and (vault/'R32_FICTIONAL_ONLY.marker').is_file():
   shutil.rmtree(vault)
  checks['tempVaultGone']=not vault.exists()
  if custody.exists() and (custody/'R32_FICTIONAL_ONLY.marker').is_file():
   shutil.rmtree(custody)
  checks['escrowGone']=not custody.exists()
  if started:
   removed=docker('rm','-fv',NAME,timeout=50,check=False)
   checks['testContainerGone']=removed.returncode==0
  else:checks['testContainerGone']=True
  remaining=docker('ps','-a','--format','{{.Names}}',check=False).stdout.splitlines()
  checks['testContainerGone']=checks['testContainerGone'] and NAME not in remaining
  if not checks['testContainerGone'] or not checks['tempVaultGone'] or not checks['escrowGone']:
   status='R32_FICTIONAL_FIXTURE_CLEANUP_HOLD'
  evidence={
   'status':status,'tests':checks,
   'sourceParent':'2233750d605ad4710eb4331abef27b3ec5d48bc1',
   'deployed':False,'actualIndependentKms':False,
   'currentProductionWriterMigrated':False,
   'fullProductionBackupErasureVerified':False,
   'realMemberTouches':0,'providerCalls':0,'mailCalls':0,
   'realReleaseDecision':'HOLD','error':error,
   'timestamp':datetime.now(timezone.utc).isoformat()
  }
  fd=os.open(RESULT,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
  with os.fdopen(fd,'w') as out:
   out.write(json.dumps(evidence,indent=2)+'\n')
  print(json.dumps(evidence,indent=2))
 return 0 if error is None and all(checks.values()) else 2
if __name__=='__main__':sys.exit(main())
