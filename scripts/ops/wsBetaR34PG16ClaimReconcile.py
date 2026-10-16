#!/usr/bin/env python3
"""R34 disposable PG16 interrupted-Work recovery on cryptographic pending claim.

NO real members, real manuscripts, remote AWS/KMS, production database or
current website changes. Requires explicit fictional-only opt-in.
"""
import json,os,secrets,socket,subprocess,sys,tempfile,shutil,time
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-release-r9-build-20261015')
RECEIPT=EVIDENCE/'R34_PG16_COLD_RECONCILE_20261016.json'
LOG=EVIDENCE/'R34_PG16_COLD_PHASE1_JEST_20261016.log'
COLDLOG=EVIDENCE/'R34_PG16_COLD_PHASE2_JEST_20261016.log'
NAME='ws-r34-reconciler-pg16-'+secrets.token_hex(6)
MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204'
FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205'
FOREIGN_WORK='4c0782ca-9074-43ee-9f3c-5f8500026781'
FORBIDDEN=[
 'R34_FAKE_ORIGINAL_DOCX_BYTES_NO_PERSON','R34_FICTIONAL_EXTRACTED_SOURCE',
 'R34_FICTIONAL_MISMATCH_SUBSTITUTED','Fictional-Cedar.docx','mammoth-fictional-r34',
 'R34_COLD_FICTIONAL_ORIGINAL','Imagined-Restart.docx'
]
def run(*argv,timeout=45,check=True,env=None):
 r=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True,timeout=timeout,env=env)
 if check and r.returncode:
  raise RuntimeError('R33_COMMAND_FAILED:'+str(argv[0])+':'+(r.stderr or '')[-220:])
 return r
def docker(*argv,**kw):return run('docker',*argv,**kw)
def pg(sql):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
     '-U','soullab','-d','postgres','-c',sql,timeout=15).stdout.strip()
def freeport():
 s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
 s.bind(('127.0.0.1',0));p=s.getsockname()[1];s.close();return p
def ready():
 for _ in range(110):
  r=docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','soullab','-d','postgres','-c','SELECT 1',check=False,timeout=5)
  process=docker('exec',NAME,'cat','/proc/1/comm',check=False,timeout=5)
  if r.returncode==0 and r.stdout.strip()=='1' and      process.returncode==0 and process.stdout.strip()=='postgres':return
  time.sleep(.15)
 raise RuntimeError('R33_pg16_not_fully_ready')
def seed():
 pg(f"""CREATE TABLE members (id uuid PRIMARY KEY);
 CREATE TABLE member_manuscripts (
 id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
 INSERT INTO members VALUES ('{MEMBER}'),('{FOREIGN}');
 INSERT INTO member_manuscripts VALUES ('{FOREIGN_WORK}','{FOREIGN}');""")
 for path in ('docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql',
               'docs/ops/WS_R33_ENCRYPTED_PENDING_REVIEW_ONLY.sql'):
  destination='/tmp/'+Path(path).name
  docker('cp',str(ROOT/path),NAME+':'+destination)
  docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','soullab','-d','postgres','-f',destination)
def main():
 if os.getenv('R34_PG16_RECONCILE')!='fictional-only':
  print('R34 refused: exact fictional-only opt-in required')
  return 3
 vault=Path(tempfile.mkdtemp(prefix='ws-r33-fictional-pending-vault-'))
 (vault/'R33_FICTIONAL_ONLY.marker').write_text('R33 fabricated only\n')
 escrow=Path(tempfile.mkdtemp(prefix='ws-r34-fictional-escrow-'))
 (escrow/'R34_FICTIONAL_ONLY.marker').write_text('Synthetic fixture only\n')
 port=freeport();started=False;err=None
 checks={
  'Postgres16':False,'loopbackOnly':False,'pendingClaimWorkEndToEnd':False,
  'dumpNoSourceOrProvenance':False,'vaultCiphertextOnly':False,
  'pendingAndWorkCipherObjectsPresent':False,
  'disposableVaultRemoved':False,'testDockerRemoved':False,
  'fictionalEscrowRemoved':False,'postgresRestarted':False,
  'coldProcessRecovered':False,'noProductionTouched':True,
 }
 status='R34_INTERRUPTED_CLAIM_FICTIONAL_HOLD'
 try:
  docker('image','inspect','postgres:16.13','--format','{{.Id}}',timeout=15)
  docker('run','--pull','never','-d','--name',NAME,
    '-e','POSTGRES_USER=soullab','-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '-p',f'127.0.0.1:{port}:5432','postgres:16.13',timeout=60)
  started=True;ready()
  checks['Postgres16']=docker('exec',NAME,'postgres','--version').stdout.startswith(
    'postgres (PostgreSQL) 16.')
  bindings=json.loads(docker('inspect',NAME,'--format',
     '{{json .NetworkSettings.Ports}}').stdout).get('5432/tcp') or []
  checks['loopbackOnly']=len(bindings)>0 and all(b.get('HostIp')=='127.0.0.1'
                                               for b in bindings)
  if not checks['Postgres16'] or not checks['loopbackOnly']:
   raise RuntimeError('r33_unsupported_network_or_pg')
  seed()
  env=os.environ.copy()
  env.update({
   'DATABASE_URL':f'postgresql://soullab@127.0.0.1:{port}/postgres',
   'FILE_STORAGE_PATH':str(vault),
   'R34_FICTIONAL_ESCROW_PATH':str(escrow/'fictional-only.json'),
   'R34_PG16_RECONCILE':'fictional-only',
   'R33_PENDING_CLAIM_FIXTURE':'fictional-only',
   'R34_CLAIM_RECONCILE_FIXTURE':'fictional-only',
   'R32_HELD_SOURCE_FIXTURE':'fictional-only',
  })
  script='scripts/ops/__tests__/r34PG16ClaimReconcile.test.ts'
  case=run(str(ROOT/'node_modules/.bin/jest'),'--runInBand',
       '--no-coverage','--runTestsByPath',script,env=env,timeout=100,check=False)
  LOG.write_text(case.stdout+'\n'+case.stderr)
  checks['pendingClaimWorkEndToEnd']=case.returncode==0
  dump=docker('exec',NAME,'pg_dump','-Fp','--no-owner',
              '--no-privileges','-U','soullab','-d','postgres',timeout=35).stdout
  checks['dumpNoSourceOrProvenance']=all(s not in dump for s in FORBIDDEN)
  blobs=list(vault.rglob('*.enc'))
  checks['pendingAndWorkCipherObjectsPresent']=len(blobs)==13
  checks['vaultCiphertextOnly']=len(blobs)>0 and all(
    all(s.encode() not in p.read_bytes() for s in FORBIDDEN) for p in blobs)
  if not all(checks[k] for k in ['pendingClaimWorkEndToEnd',
    'dumpNoSourceOrProvenance','vaultCiphertextOnly',
    'pendingAndWorkCipherObjectsPresent']):
   raise RuntimeError('R33_TEST_OR_CIPHER_REVIEW_FAIL:see_private_test_log')
  saved=escrow/'fictional-only.json'
  if not saved.is_file() or saved.stat().st_mode & 0o077:
   raise RuntimeError('r34_missing_fictional_recovery_receipt')
  docker('restart',NAME,timeout=40)
  ready()
  checks['postgresRestarted']=True
  fresh=env.copy()
  fresh['R34_COLD_RECONCILE']='fictional-only'
  recovered=run(str(ROOT/'node_modules/.bin/jest'),'--runInBand',
    '--no-coverage','--runTestsByPath',
    'scripts/ops/__tests__/r34ColdReconcilePG16.test.ts',
    env=fresh,timeout=90,check=False)
  COLDLOG.write_text(recovered.stdout+'\n'+recovered.stderr)
  checks['coldProcessRecovered']=recovered.returncode==0
  if not checks['coldProcessRecovered']:
   raise RuntimeError('r34_post_restart_recovery_refused')
  status='R34_PG16_RESTART_AND_FRESH_PROCESS_RECONCILE_FICTIONAL_PASS_RELEASE_HELD'
 except Exception as e:err=str(e)[:460]
 finally:
  if vault.exists() and (vault/'R33_FICTIONAL_ONLY.marker').is_file():
   shutil.rmtree(vault)
  checks['disposableVaultRemoved']=not vault.exists()
  if escrow.exists() and (escrow/'R34_FICTIONAL_ONLY.marker').is_file():
   shutil.rmtree(escrow)
  checks['fictionalEscrowRemoved']=not escrow.exists()
  if started:
   removed=docker('rm','-fv',NAME,timeout=55,check=False)
   checks['testDockerRemoved']=removed.returncode==0
  else:checks['testDockerRemoved']=True
  remaining=docker('ps','-a','--format','{{.Names}}',check=False).stdout.splitlines()
  checks['testDockerRemoved']=(checks['testDockerRemoved'] and NAME not in remaining)
  if not all((checks['disposableVaultRemoved'],checks['testDockerRemoved'],checks['fictionalEscrowRemoved'])):
   status='R34_DISPOSABLE_FIXTURE_CLEANUP_HOLD'
  receipt={
   'status':status,'checks':checks,'error':err,'deployment':False,
   'realMemberTouches':0,'actualKmsInstalled':False,
   'realImportRouteMigrated':False,'pendingKeyRetired':False,
   'actualSignerIndependent':False,'productionChanged':False,
   'realBetaDecision':'HOLD','sourceParent':'1422ef2ccd2a8b7604b5c80d0d5164ebd309b89d',
   'timestamp':datetime.now(timezone.utc).isoformat(),
  }
  fd=os.open(RECEIPT,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
  with os.fdopen(fd,'w') as f:f.write(json.dumps(receipt,indent=2)+'\n')
  print(json.dumps(receipt,indent=2))
 return 0 if err is None and all(checks.values()) else 2
if __name__=='__main__':sys.exit(main())
