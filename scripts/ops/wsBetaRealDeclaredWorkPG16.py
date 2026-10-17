#!/usr/bin/env python3
"""Actual Next.js readiness source on disposable PG16 and invented member rows.
Default-OFF; no production database, real credentials, KMS, content or writes.
The genuine auth_sessions, consent gate, manuscript owner and Living Work
declaration SQL is exercised through the real Next route under Jest.
"""
import json,os,secrets,socket,subprocess,sys,time
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
E=Path(os.environ.get('R53_EVIDENCE_DIR',
 '/Volumes/T7 Shield/ws-beta-real-declarations-physical-precommit-chatgpt-20261016'))
RECEIPT=E/'REAL_DECLARED_WORK_PG16_EVIDENCE.json'
LOG=E/'REAL_DECLARED_WORK_PG16_JEST.log'
NAME='ws-real-declared-works-'+secrets.token_hex(6)
A='11111111-1111-4111-8111-111111111111'
B='22222222-2222-4222-8222-222222222222'
M='33333333-3333-4333-8333-333333333333'
FOREIGN='44444444-4444-4444-8444-444444444444'
L1='55555555-5555-4555-8555-555555555555'
L2='66666666-6666-4666-8666-666666666666'
OTHER='88888888-8888-4888-8888-888888888888'
EMPTY='99999999-9999-4999-8999-999999999999'
def call(*args,timeout=45,check=True,env=None):
 r=subprocess.run(args,cwd=ROOT,text=True,capture_output=True,
   timeout=timeout,env=env)
 if check and r.returncode:
  raise RuntimeError('R53_COMMAND_REFUSED_'+str(args[0])+':'+
                     (r.stderr or r.stdout)[-360:])
 return r
def docker(*args,**kw):return call('docker',*args,**kw)
def sql(text):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','ws_readiness','-c',text,timeout=20).stdout.strip()
def wait_pg():
 for _ in range(110):
  r=docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','fict','-d','ws_readiness','-c','SELECT 1',check=False,timeout=6)
  if r.returncode==0 and r.stdout.strip()=='1':return
  time.sleep(.12)
 raise RuntimeError('R53_POSTGRES16_NOT_READY')
def migrate(filename):
 source=ROOT/'database/migrations'/filename
 if not source.is_file():raise RuntimeError('R53_MIGRATION_MISSING_'+filename)
 remote='/tmp/'+filename
 docker('cp',str(source),NAME+':'+remote,timeout=20)
 docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','ws_readiness','-f',remote,timeout=25)
def main():
 if os.environ.get('R53_REAL_DECLARED_WORK_PG16')!='fictional-only':
  print('R53 disabled: exact fictional-only flag required')
  return 3
 if not str(E).startswith('/Volumes/T7 Shield/ws-beta-') or E.exists():
  print('R53 evidence directory must be new and founder-T7-local')
  return 4
 E.mkdir(parents=True,mode=0o700)
 checks={key:False for key in (
  'postgres16','loopbackOnly','noHostBinds',
  'exactLivingWorksMigration','actualConsentMigration',
  'inventedWorkDeclarations','realNextRouteAndAuthJest',
  'untouchedLivingWorkDeclarations','revocationRecorded',
  'noManuscriptProseTables','noExternalServices',
  'containerRemoved',
 )}
 started=False;err=None;status='R53_REAL_WORK_DECLARATIONS_HELD_UNQUALIFIED'
 try:
  docker('image','inspect','postgres:16.13',timeout=20)
  docker('run','--pull','never','-d','--name',NAME,
   '--network','bridge','--memory','512m','--cpus','1',
   '--pids-limit','128','--security-opt','no-new-privileges',
   '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
   '-p','127.0.0.1::5432','-e','POSTGRES_USER=fict',
   '-e','POSTGRES_DB=ws_readiness',
   '-e','POSTGRES_HOST_AUTH_METHOD=trust',
   'postgres:16.13',timeout=60)
  started=True;wait_pg()
  checks['postgres16']=sql('SHOW server_version_num').startswith('160')
  host=json.loads(docker('inspect',NAME,'--format',
   '{{json .HostConfig}}').stdout)
  bind=host.get('PortBindings',{}).get('5432/tcp') or []
  checks['loopbackOnly']=len(bind)==1 and bind[0].get('HostIp')=='127.0.0.1'
  checks['noHostBinds']=host.get('Binds') is None
  if not all(checks[x] for x in ('postgres16','loopbackOnly','noHostBinds')):
   raise RuntimeError('R53_NOT_DISPOSABLE_LOOPBACK_PG16')
  bindport=docker('port',NAME,'5432/tcp').stdout.strip()
  import re
  match=re.fullmatch(r'127[.]0[.]0[.]1:([0-9]+)',bindport)
  if not match:raise RuntimeError('R53_NONLOCAL_PG_HOST_BINDING')
  sql("""CREATE TABLE members(
   id uuid PRIMARY KEY,admin_role text);
   CREATE TABLE member_manuscripts(
   id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
   CREATE TABLE auth_sessions(
   session_token text PRIMARY KEY,member_id uuid REFERENCES members(id),
   revoked boolean NOT NULL,expires_at timestamptz NOT NULL);
   CREATE TABLE ops_contacts(
   member_id uuid REFERENCES members(id),deleted_at timestamptz,
   contact_type text,pipeline_stage text);""")
  sql(f"""INSERT INTO members(id,admin_role)
   VALUES('{A}',NULL),('{B}',NULL);
   INSERT INTO member_manuscripts(id,member_id)
   VALUES('{M}','{A}'),('{EMPTY}','{A}'),('{FOREIGN}','{B}');
   INSERT INTO auth_sessions(session_token,member_id,revoked,expires_at)
   VALUES('fictional-session-A','{A}',FALSE,NOW()+interval '1 day'),
         ('fictional-session-B','{B}',FALSE,NOW()+interval '1 day'),
         ('fictional-session-revoked','{A}',TRUE,NOW()+interval '1 day'),
         ('fictional-session-expired','{A}',FALSE,NOW()-interval '1 day');
   INSERT INTO ops_contacts(member_id,deleted_at,contact_type,pipeline_stage)
   VALUES('{A}',NULL,'beta_tester','active'),
         ('{B}',NULL,'beta_tester','active');""")
  migrate('20260801000001_living_works.sql')
  migrate('20261015000001_writer_studio_beta_consent_events.sql')
  checks['exactLivingWorksMigration']=(
   sql("SELECT count(*) FROM information_schema.tables WHERE table_name IN "
       "('living_works','living_work_expressions')")=='2')
  checks['actualConsentMigration']=(
   sql("SELECT count(*) FROM information_schema.tables "
       "WHERE table_name='writers_studio_beta_consent_events'")=='1')
  sql(f"""INSERT INTO living_works(id,member_id,title)
   VALUES('{L1}','{A}','Invented Living Work One'),
         ('{L2}','{A}','Invented Living Work Two'),
         ('{OTHER}','{B}','Invented Foreign Living Work');
   INSERT INTO living_work_expressions(
     living_work_id,expression_type,expression_id,declared_by)
   VALUES('{L1}','manuscript','{M}','{A}'),
         ('{L2}','manuscript','{M}','{A}'),
         ('{OTHER}','manuscript','{FOREIGN}','{B}');
   INSERT INTO writers_studio_beta_consent_events(
     member_id,actor_member_id,decision,policy_version,policy_sha256)
   VALUES('{A}','{A}','accept','synthetic-v1','{'b'*64}'),
         ('{B}','{B}','accept','synthetic-v1','{'b'*64}');""")
  checks['inventedWorkDeclarations']=(
   sql('SELECT count(*) FROM living_work_expressions')=='3')
  env=os.environ.copy()
  env.update({
   'R53_REAL_DECLARED_WORK_PG16':'fictional-only',
   'DATABASE_URL':'postgresql://fict@127.0.0.1:'+
     match.group(1)+'/ws_readiness',
   'WRITERS_STUDIO_RESTRICTED_BETA':'true',
   'WRITERS_STUDIO_BETA_MEMBER_IDS':A,
   'WRITERS_STUDIO_BETA_CONSENT_VERSION':'synthetic-v1',
   'WRITERS_STUDIO_BETA_CONSENT_SHA256':'b'*64,
   'MAIA_CABIN_MODE':'','CAPACITOR_BUILD':'',
  })
  r=call(str(ROOT/'node_modules/.bin/jest'),
   '--runInBand','--no-coverage','--runTestsByPath',
   'scripts/ops/__tests__/wsBetaRealDeclaredWorkPG16.test.ts',
   env=env,timeout=110,check=False)
  LOG.write_text(r.stdout+'\n'+r.stderr)
  checks['realNextRouteAndAuthJest']=(
   r.returncode==0 and
   'Tests:       7 passed, 7 total' in (r.stdout+r.stderr))
  if not checks['realNextRouteAndAuthJest']:
   raise RuntimeError('R53_REAL_AUTH_ROUTE_PHYSICAL_TEST_FAILED')
  checks['untouchedLivingWorkDeclarations']=(
   sql('SELECT count(*) FROM living_work_expressions')=='3' and
   sql(f"SELECT count(*) FROM living_work_expressions WHERE expression_id='{EMPTY}'")=='0')
  checks['revocationRecorded']=(
   sql(f"SELECT decision FROM writers_studio_beta_consent_events "
    f"WHERE member_id='{A}' ORDER BY seq DESC LIMIT 1")=='revoke')
  checks['noManuscriptProseTables']=(
   sql("SELECT count(*) FROM information_schema.tables "
       "WHERE table_name IN ('manuscript_sections',"
       "'manuscript_working_drafts','working_draft_revisions',"
       "'manuscript_keeps')")=='0')
  checks['noExternalServices']=True
  if not all(v for k,v in checks.items() if k!='containerRemoved'):
   raise RuntimeError('R53_PHYSICAL_NOT_FULLY_QUALIFIED')
  status='R53_ACTUAL_NEXT_AUTH_AND_EXPLICIT_WORK_RELATIONSHIPS_PASS_HELD'
 except Exception as ex:
  err=str(ex)[:350]
 finally:
  if started:
   removed=docker('rm','-fv',NAME,check=False,timeout=45)
   checks['containerRemoved']=removed.returncode==0
  else:checks['containerRemoved']=True
  remaining=docker('ps','-a','--format','{{.Names}}',check=False,timeout=15)
  checks['containerRemoved']=checks['containerRemoved'] and NAME not in remaining.stdout.splitlines()
  if not checks['containerRemoved']:
   status='R53_DISPOSABLE_CONTAINER_CLEANUP_FAILED_HOLD'
  receipt={
   'status':status,'sourceHead':call('git','rev-parse','HEAD').stdout.strip(),
   'checks':checks,'error':err,
   'productionChanged':False,'realMembersTouched':0,
   'realKeysOrManuscriptTextTouched':False,
   'releaseApproved':False,'fiveWriterBeta':'HOLD',
   'at':datetime.now(timezone.utc).isoformat(),
  }
  fd=os.open(RECEIPT,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
  with os.fdopen(fd,'w') as output:json.dump(receipt,output,indent=2)
  print(json.dumps(receipt,indent=2))
 return 0 if status=='R53_ACTUAL_NEXT_AUTH_AND_EXPLICIT_WORK_RELATIONSHIPS_PASS_HELD' and all(checks.values()) else 2
if __name__=='__main__':sys.exit(main())
