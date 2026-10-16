#!/usr/bin/env python3
"""R30 isolated PostgreSQL-16 Work lock race fixture.
No external KMS, real keys or member data; production NEVER accessed.
Exactly one Docker container is created and removed by its random name.
"""
import json, os, secrets, socket, subprocess, sys, time
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-release-r9-build-20261015')
RESULT=EVIDENCE/'R30_PG16_WORK_FENCE_RACE_20261016.json'
LOG=EVIDENCE/'R30_PG16_WORK_FENCE_JEST_20261016.log'
NAME='ws-r30-fence-pg16-'+secrets.token_hex(6)
MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204'
WORK='4c0782ca-9074-43ee-9f3c-5f8500026780'
MEMBER_B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205'
WORK_B='4c0782ca-9074-43ee-9f3c-5f8500026781'
SHA_A='a'*64
SHA_B='b'*64

def run(*cmd,timeout=40,check=True,env=None):
 r=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True,timeout=timeout,env=env)
 if check and r.returncode:
  raise RuntimeError('R30_COMMAND_REFUSED:'+str(cmd[0])+':'+(r.stderr or '').strip()[-240:])
 return r

def docker(*cmd,**kw):return run('docker',*cmd,**kw)

def pg(sql):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','soullab','-d','postgres','-c',sql,timeout=15).stdout.strip()

def loopback_port():
 s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
 s.bind(('127.0.0.1',0)); p=s.getsockname()[1]; s.close()
 return p

def ready():
 for _ in range(90):
  r=docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','soullab','-d','postgres','-c','SELECT 1',timeout=5,check=False)
  pid1=docker('exec',NAME,'cat','/proc/1/comm',timeout=5,check=False)
  if r.returncode==0 and r.stdout.strip()=='1' and     pid1.returncode==0 and pid1.stdout.strip()=='postgres':
   return
  time.sleep(.18)
 raise RuntimeError('R30_final_PostgreSQL_16_start_unconfirmed')

def seed():
 pg(f"""
 CREATE TABLE r30_fixture_works(
  work_id uuid PRIMARY KEY,
  member_id uuid NOT NULL,
  session_sha256 char(64) NOT NULL,
  notice_sha256 char(64) NOT NULL,
  consent_seq integer NOT NULL CHECK(consent_seq>=1),
  active boolean NOT NULL,
  deletion_epoch integer NOT NULL CHECK(deletion_epoch>=1)
 );
 CREATE TABLE r30_fixture_commits(
  work_id uuid NOT NULL REFERENCES r30_fixture_works(work_id),
  generation integer NOT NULL,
  cipher_sha256 char(64) NOT NULL CHECK(cipher_sha256 ~ '^[a-f0-9]{{64}}$'),
  PRIMARY KEY(work_id,generation)
 );
 INSERT INTO r30_fixture_works VALUES
 ('{WORK}','{MEMBER}','{SHA_A}','{SHA_B}',7,true,10),
 ('{WORK_B}','{MEMBER_B}','{SHA_A}','{SHA_B}',7,true,10);
 """)

def main():
 if os.environ.get('R30_ACTUAL_PG_FENCE')!='fictional-only':
  print('R30 refused without exact fictional-only opt-in')
  return 3
 checks={
  'postgres16':False,'loopbackOnly':False,
  'actualDbRaceTests':False,'fixtureRemoved':False,'noProductionTouched':True
 }
 status='R30_FICTIONAL_PG16_FENCE_HOLD'
 err=None; started=False;port=loopback_port()
 try:
  docker('image','inspect','postgres:16.13','--format','{{.Id}}',timeout=15)
  docker('run','--pull','never','-d','--name',NAME,
   '--network','bridge','-e','POSTGRES_HOST_AUTH_METHOD=trust',
   '-e','POSTGRES_USER=soullab',
   '-p',f'127.0.0.1:{port}:5432','postgres:16.13',timeout=60)
  started=True
  ready()
  version=docker('exec',NAME,'postgres','--version').stdout.strip()
  checks['postgres16']=version.startswith('postgres (PostgreSQL) 16.')
  ports=json.loads(docker('inspect',NAME,'--format',
    '{{json .NetworkSettings.Ports}}').stdout)
  bindings=ports.get('5432/tcp') or []
  checks['loopbackOnly']=len(bindings)>0 and all(
   p.get('HostIp')=='127.0.0.1' for p in bindings)
  if not checks['postgres16'] or not checks['loopbackOnly']:
   raise RuntimeError('postgres16_or_loopback_preflight_failed')
  seed()
  env=os.environ.copy()
  env['DATABASE_URL']=f'postgresql://soullab@127.0.0.1:{port}/postgres'
  env['R29_SESSION_FENCE_FIXTURE']='fictional-only'
  env['R30_ACTUAL_PG_FENCE']='fictional-only'
  test='scripts/ops/__tests__/r30Pg16WorkFenceRace.test.ts'
  result=run(str(ROOT/'node_modules/.bin/jest'),
   '--runInBand','--no-coverage','--runTestsByPath',test,
   env=env,timeout=90,check=False)
  LOG.write_text(result.stdout+'\n'+result.stderr)
  checks['actualDbRaceTests']=result.returncode==0
  if not checks['actualDbRaceTests']:
   raise RuntimeError('R30_JEST_CASES_FAILED_READ_PRIVATE_TEST_LOG')
  # This is a metadata-only *fictional* fixture: never a production SQL dump.
  rows=pg('SELECT count(*) FROM r30_fixture_works')
  if rows!='2':raise RuntimeError('fixture_work_row_count_drift')
  status='R30_PG16_LOCAL_TRANSACTION_FENCE_FICTIONAL_PASS_REAL_RELEASE_HELD'
 except Exception as e:
  err=str(e)[:400]
 finally:
  if started:
   removed=docker('rm','-fv',NAME,timeout=45,check=False)
   checks['fixtureRemoved']=removed.returncode==0
  else:checks['fixtureRemoved']=True
  remaining=docker('ps','-a','--format','{{.Names}}',check=False).stdout
  checks['fixtureRemoved']=checks['fixtureRemoved'] and NAME not in remaining.splitlines()
  report={
   'status':status,
   'tests':checks,
   'sourceParent':'574f299c6152870996e7efb2845f0ad1572a7fed',
   'joinedFenceSource':'47e1ca57757d2333f2e8dc8065f5393006e84584',
   'realMembers':0,'providerCalls':0,'realKms':False,'prodChanged':False,
   'realIndependentCoordinatorInstalled':False,
   'noOffsiteOldBackupRestoration':True,
   'release':'HOLD','error':err,
   'at':datetime.now(timezone.utc).isoformat()
  }
  RESULT.write_text(json.dumps(report,indent=2)+'\n')
  os.chmod(RESULT,0o600)
  print(json.dumps(report,indent=2))
 return 0 if all(checks.values()) and not err else 2

if __name__=='__main__':sys.exit(main())
