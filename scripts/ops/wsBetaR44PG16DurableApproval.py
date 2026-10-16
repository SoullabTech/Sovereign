#!/usr/bin/env python3
"""HELD R44 PostgreSQL 16 physical one-use approvals, strictly fictional only.

No live Work, Session, KMS, production database, provider, or author data.
All Docker containers, anonymous volumes and same-Mac fictional key escrow are
removed, even on failed tests. SQL dumps are analyzed in memory, not saved.
"""
import json,os,secrets,shutil,socket,subprocess,sys,tempfile,time
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-r44-approval-evidence-chatgpt-20261016')
RECEIPT=EVIDENCE/'R44_PG16_TWO_PROCESS_APPROVAL_20261016.json'
PHASE1=EVIDENCE/'R44_PG16_TWO_PROCESS_PHASE1_JEST_20261016.log'
PHASE2=EVIDENCE/'R44_PG16_TWO_PROCESS_COLD_JEST_20261016.log'
NAME='ws-r44-fict-pg16-'+secrets.token_hex(6)
MEMBER='11111111-1111-4111-8111-111111111111'
FOREIGN='22222222-2222-4222-8222-222222222222'
WORK='33333333-3333-4333-8333-333333333333'
FOREIGN_WORK='44444444-4444-4444-8444-444444444444'
FORBIDDEN=[
 'This fictional lantern','R44 fictional other section','lantern shimmers',
 'lantern gleams','🍂 This fictional','second lantern glows',
]
def call(*args,timeout=50,env=None,check=True):
 r=subprocess.run(args,cwd=ROOT,text=True,capture_output=True,
    timeout=timeout,env=env)
 if check and r.returncode:
  raise RuntimeError('r44_command_failed:'+str(args[0])+':'+
    (r.stderr or r.stdout)[-320:])
 return r
def docker(*args,**kw):return call('docker',*args,**kw)
def sql(statement):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r44_choice','-c',statement,timeout=18).stdout.strip()
def fresh_port():
 with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
  s.bind(('127.0.0.1',0));return s.getsockname()[1]
def wait_ready():
 for _ in range(100):
  r=docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','fict','-d','r44_choice','-c','SELECT 1',
    check=False,timeout=6)
  if r.returncode==0 and r.stdout.strip()=='1':return
  time.sleep(.12)
 raise RuntimeError('r44_pg_not_ready')
def inspect_dump(secret_data):
 dump=docker('exec',NAME,'pg_dump','-Fp','--no-owner',
  '--no-privileges','-U','fict','-d','r44_choice',timeout=35).stdout
 forb=FORBIDDEN+[secret_data.get(x,'') for x in
   ('rootHex','spentToken','unspentToken','parallelToken')]
 return all(token not in dump for token in forb if token)
def main():
 if os.getenv('R44_PHYSICAL_PG16')!='fictional-only':
  print('R44 held-only exact fictional opt-in required')
  return 3
 EVIDENCE.mkdir(mode=0o700,parents=True,exist_ok=True)
 escrow=Path(tempfile.mkdtemp(prefix='ws-r44-fict-choice-'))
 (escrow/'R44_FICTION_ONLY.marker').write_text('fabricated only\n')
 escrow_file=escrow/'fictional-approval.json'
 name=NAME;port=fresh_port();started=False
 checks={k:False for k in [
  'postgres16','loopbackOnly','noHostBinds','oneWorkOwnerScope',
  'initialApprovalTests','initialDatabaseNoProse','sqlMonotonic',
  'postgresRestarted','newProcessSpentAndUnspent',
  'postRestartDatabaseNoProse','crossProcessSingleClaim',
  'crossProcessMonotonic','containerRemoved','escrowRemoved',
 ]}
 checks['noRealDataOrProduction']=True
 err=None
 try:
  docker('image','inspect','postgres:16.13',timeout=20)
  docker('run','--pull','never','-d','--name',NAME,
   '--memory','700m','--cpus','2','--pids-limit','180',
   '--security-opt','no-new-privileges',
   '-p',f'127.0.0.1:{port}:5432',
   '-e','POSTGRES_DB=r44_choice','-e','POSTGRES_USER=fict',
   '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13',timeout=65)
  started=True;wait_ready()
  checks['postgres16']=sql('SHOW server_version_num').startswith('160')
  host=json.loads(docker('inspect',NAME,
    '--format','{{json .HostConfig}}',timeout=12).stdout)
  bindings=host.get('PortBindings',{}).get('5432/tcp') or []
  checks['loopbackOnly']=len(bindings)>0 and all(
    x.get('HostIp')=='127.0.0.1' for x in bindings)
  checks['noHostBinds']=host.get('Binds') is None
  if not all(checks[k] for k in ('postgres16','loopbackOnly','noHostBinds')):
   raise RuntimeError('r44_nonisolated_pg_fixture')
  sql(f"""CREATE TABLE members(id uuid PRIMARY KEY);
  CREATE TABLE member_manuscripts(
   id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id),
   UNIQUE(id,member_id));
  INSERT INTO members(id) VALUES ('{MEMBER}'),('{FOREIGN}');
  INSERT INTO member_manuscripts(id,member_id)
   VALUES ('{WORK}','{MEMBER}'),('{FOREIGN_WORK}','{FOREIGN}');""")
  schema=ROOT/'docs/ops/WS_R44_DURABLE_AUTHOR_APPROVAL_REVIEW_ONLY.sql'
  docker('cp',str(schema),NAME+':/tmp/r44-review.sql',timeout=20)
  docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','fict','-d','r44_choice','-f','/tmp/r44-review.sql',timeout=30)
  checks['oneWorkOwnerScope']=sql("SELECT count(*) FROM member_manuscripts")=='2'
  env=os.environ.copy()
  env.update({
   'DATABASE_URL':f'postgresql://fict@127.0.0.1:{port}/r44_choice',
   'R44_DURABLE_APPROVAL_FIXTURE':'fictional-only',
   'R37_SECTION_PASSAGE_FIXTURE':'fictional-only',
   'R36_PASSAGE_REVIEW_FIXTURE':'fictional-only',
   'R44_FICTIONAL_ESCROW':str(escrow_file),
  })
  first=call(str(ROOT/'node_modules/.bin/jest'),'--runInBand',
   '--no-coverage','--testTimeout=20000','--runTestsByPath',
   'scripts/ops/__tests__/r44PhysicalAuthorApproval.test.ts',
   timeout=110,check=False,env=env)
  PHASE1.write_text(first.stdout+'\n'+first.stderr)
  checks['initialApprovalTests']=first.returncode==0
  if not checks['initialApprovalTests']:
   raise RuntimeError('r44_initial_jest_failed')
  if not escrow_file.is_file() or escrow_file.stat().st_mode & 0o077:
   raise RuntimeError('r44_fictional_key_escrow_missing_or_weak')
  material=json.loads(escrow_file.read_text())
  checks['initialDatabaseNoProse']=inspect_dump(material)
  checks['sqlMonotonic']=sql(
    "SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='spent'"
   )=='3'
  if not (checks['initialDatabaseNoProse'] and checks['sqlMonotonic']):
   raise RuntimeError('r44_sql_plaintext_or_monotonic_refusal')
  docker('kill','--signal=SIGKILL',NAME,timeout=45)
  docker('start',NAME,timeout=45)
  wait_ready();checks['postgresRestarted']=True
  env['R44_COLD_PG16']='fictional-only'
  fresh=call(str(ROOT/'node_modules/.bin/jest'),'--runInBand',
   '--no-coverage','--testTimeout=20000','--runTestsByPath',
   'scripts/ops/__tests__/r44ColdApprovalRecovery.test.ts',
   timeout=100,check=False,env=env)
  PHASE2.write_text(fresh.stdout+'\n'+fresh.stderr)
  checks['newProcessSpentAndUnspent']=fresh.returncode==0
  if not checks['newProcessSpentAndUnspent']:
   raise RuntimeError('r44_cold_process_refused')
  # Two distinct Node.js OS processes compete over the SAME PostgreSQL row.
  race_env=env.copy()
  race_env['R44_RACE_PROCESS_FIXTURE']='fictional-only'
  racers=[]
  for _ in range(2):
   racers.append(subprocess.Popen([
    str(ROOT/'node_modules/.bin/tsx'),
    'scripts/ops/wsBetaR44ProcessClaim.ts'
   ],cwd=ROOT,env=race_env,text=True,
     stdout=subprocess.PIPE,stderr=subprocess.PIPE))
  results=[]
  for contender in racers:
   stdout,stderr=contender.communicate(timeout=50)
   results.append((contender.returncode,stdout,stderr))
  checks['crossProcessSingleClaim']=(
   sorted(x[0] for x in results)==[0,4] and
   sum('R44_PROCESS_CLAIMED_HELD' in x[1] for x in results)==1 and
   sum('R44_PROCESS_REFUSED_HELD' in x[1] for x in results)==1)
  checks['crossProcessMonotonic']=sql(
   "SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='spent'"
  )=='5'
  checks['postRestartDatabaseNoProse']=inspect_dump(material)
  if not (checks['crossProcessSingleClaim'] and checks['crossProcessMonotonic']
    and checks['postRestartDatabaseNoProse']):
   raise RuntimeError('r44_multi_process_race_or_plaintext_refused')
 except Exception as e:
  err=str(e)[:440]
 finally:
  if started:
   r=docker('rm','-fv',NAME,timeout=55,check=False)
   checks['containerRemoved']=r.returncode==0
  else:checks['containerRemoved']=True
  checks['containerRemoved']=checks['containerRemoved'] and NAME not in (
   docker('ps','-a','--format','{{.Names}}',check=False).stdout.splitlines())
  if escrow.exists() and (escrow/'R44_FICTION_ONLY.marker').is_file():
   shutil.rmtree(escrow)
  checks['escrowRemoved']=not escrow.exists()
  result={
   'status':'R44_FICTIONAL_DURABLE_ONE_USE_PG16_PASS_REAL_BETA_HOLD'
      if err is None and all(checks.values()) else 'R44_HELD_UNQUALIFIED',
   'checks':checks,'error':err,
   'branchHead':call('git','rev-parse','HEAD').stdout.strip(),
   'actualMemberTouches':0,'productionChanged':False,
   'noRealKmsOrConsent':True,'noActualBrowserAuthorGesture':True,
   'releaseApproved':False,'realBetaDecision':'HOLD',
   'time':datetime.now(timezone.utc).isoformat(),
  }
  with RECEIPT.open('x') as f:f.write(json.dumps(result,indent=2)+'\n')
  RECEIPT.chmod(0o600)
  print(json.dumps(result,indent=2))
 return 0 if err is None and all(checks.values()) else 2
if __name__=='__main__':sys.exit(main())
