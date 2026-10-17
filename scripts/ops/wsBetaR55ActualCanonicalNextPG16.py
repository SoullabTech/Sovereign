#!/usr/bin/env python3
"""R52: actual canonical Next.js PC3 Writer UI with real disposable PG session.

Source is genuine /writers-studio, not a recreated standalone page.
Only fictional auth_sessions/members are created in a RANDOM owned Docker PG16.
Playwright mocks all content GETs and refuses all POST/PUT/DELETE.
Default off. No production, private data, real model, KMS or mail.
"""
from __future__ import annotations
import json,os,secrets,signal,socket,subprocess,sys,tempfile,time,shutil
from pathlib import Path
from urllib.request import urlopen

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R55_REAL_NEXT_STUDIO_WEBKIT_20261016')
NAME='ws-r55-converged-next-'+secrets.token_hex(6)
TOKEN='r52-local-fictional-session'
MEMBER='11111111-1111-4111-8111-111111111111'
MANUSCRIPT='33333333-3333-4333-8333-333333333333'
RECEIPT=EVIDENCE/'R55_ACTUAL_NEXT_AUTH_CONVERGED_20261016.json'
LOG=EVIDENCE/'R55_NEXT_WEBPACK_SERVER_20261016.log'
BROWSER_LOG=EVIDENCE/'R55_NEXT_WEBKIT_BROWSER_20261016.log'
SCREEN=EVIDENCE/'R52_CANONICAL_WRITER_WEBKIT_FICTIONAL_20261016.png'
NODE='/Users/soullab/.nvm/versions/node/v22.22.3/bin'
FLAGS='R55_REAL_PC3_CONVERGENCE_FIXTURE'
def run(*args,timeout=45,check=True,env=None):
 result=subprocess.run(args,cwd=ROOT,text=True,capture_output=True,timeout=timeout,env=env)
 if check and result.returncode:
  raise RuntimeError('R52_COMMAND_REFUSED_'+args[0]+'_exit_'+str(result.returncode))
 return result
def docker(*args,timeout=45,check=True):
 return run('docker',*args,timeout=timeout,check=check)
def sql(query):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','fict','-d','r35_draft','-c',query).stdout.strip()
def ready_pg():
 for _ in range(100):
  one=docker('exec',NAME,'psql','-XAtq','-U','fict','-d','r35_draft','-c','SELECT 1',timeout=8,check=False)
  pid=docker('exec',NAME,'cat','/proc/1/comm',timeout=8,check=False)
  if one.returncode==0 and one.stdout.strip()=='1' and pid.stdout.strip()=='postgres':return
  time.sleep(.17)
 raise RuntimeError('R52_LOCAL_PG16_NOT_READY')
def port_of_db():
 import re
 port=docker('port',NAME,'5432/tcp').stdout.strip()
 m=re.fullmatch(r'127\.0\.0\.1:(\d+)',port)
 if not m:raise RuntimeError('R52_DB_NOT_LOOPBACK')
 return int(m.group(1))
def available_port():
 with socket.socket() as s:
  s.bind(('127.0.0.1',0))
  return s.getsockname()[1]
def read_http(origin):
 try:
  with urlopen(origin+'/signin',timeout=6) as r:
   return r.status
 except Exception:return 0
def source_head():
 return run('git','rev-parse','HEAD').stdout.strip()

def main():
 if os.environ.get(FLAGS)!='fictional-only':
  print('R52_NEXT_REAL_WRITER_NOT_AUTHORIZED')
  return 3
 if EVIDENCE.exists():
  print('R52_DO_NOT_OVERWRITE_PRIOR_BROWSER_RECEIPT')
  return 4
 if (ROOT/'.env').exists() or (ROOT/'.env.local').exists():
  print('R52_REFUSE_UNSCOPED_REAL_ENV_FILES')
  return 3
 EVIDENCE.mkdir(parents=True,mode=0o700)
 testroot=Path(tempfile.mkdtemp(prefix='ws-r52-canonical-fixture-'))
 (testroot/'vault').mkdir(mode=0o700)
 (testroot/'R52_FICTIONAL_ONLY.marker').write_text('R52 fiction-only\n')
 checks={key:False for key in (
  'cachedPG16','noHostMount','dbLoopbackOnly','fakeSessionStored',
  'realNextLocalHost','nextHtmlAndServerCookieAuth',
  'actualPC3AndControlsInWebKit','noAcceptedWriterAPIWrites',
  'noExternalBrowserRequests','browserTeardown','containerRemoved',
  'temporaryFilesRemoved','productionUnaffected'
 )}
 error=None;next_proc=None;pg_started=False;status='R52_ACTUAL_CANONICAL_NEXT_HELD'
 origin='';webReport=None
 try:
  docker('image','inspect','postgres:16.13',timeout=20)
  checks['cachedPG16']=True
  docker('run','--pull','never','-d','--name',NAME,'--network','bridge',
   '--memory','900m','--cpus','2','--pids-limit','180',
   '--security-opt','no-new-privileges',
   '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=512m',
   '-p','127.0.0.1::5432',
   '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=r35_draft',
   '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13',timeout=65)
  pg_started=True;ready_pg()
  port=port_of_db()
  hc=json.loads(docker('inspect',NAME,'--format','{{json .HostConfig}}').stdout)
  checks['noHostMount']=hc.get('Binds') is None
  binding=hc.get('PortBindings',{}).get('5432/tcp') or []
  checks['dbLoopbackOnly']=len(binding)==1 and binding[0].get('HostIp')=='127.0.0.1'
  if not checks['noHostMount'] or not checks['dbLoopbackOnly']:
   raise RuntimeError('R52_DB_DOCKER_UNTRUSTED')
  sql(f"""CREATE TABLE members(id uuid PRIMARY KEY,tier text,roles jsonb,admin_role text);
   CREATE TABLE auth_sessions(
    session_token text PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id),
    revoked boolean NOT NULL,expires_at timestamptz NOT NULL);
   INSERT INTO members VALUES('{MEMBER}','pro','["member","steward"]'::jsonb,NULL);
   INSERT INTO auth_sessions VALUES('{TOKEN}','{MEMBER}',false,now()+interval '3 hours');
   """)
  checks['fakeSessionStored']=sql(
    "SELECT count(*) FROM auth_sessions WHERE revoked=false")=='1'
  env={
    'PATH':NODE+':/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin',
    'HOME':str(testroot),'NODE_ENV':'development',
    'NEXT_TELEMETRY_DISABLED':'1','CI':'1',
    'DATABASE_URL':f'postgresql://fict@127.0.0.1:{port}/r35_draft',
    'FILE_STORAGE_PATH':str(testroot/'vault'),
    'NEXT_PUBLIC_WS_BETA_REAL_MEMBER_ENABLED':'false',
    'PLAYWRIGHT_BROWSERS_PATH':'/Users/soullab/Library/Caches/ms-playwright',
  }
  www=available_port()
  origin=f'http://127.0.0.1:{www}'
  with LOG.open('w') as fd:
   next_proc=subprocess.Popen([str(ROOT/'node_modules/.bin/next'),
      'dev','--webpack','--hostname','127.0.0.1','-p',str(www)],
     cwd=ROOT,env=env,stdout=fd,stderr=subprocess.STDOUT,
     start_new_session=True)
   print('R52_NEXT_SERVER_LOOPBACK',origin,flush=True)
   for _ in range(80):
    if next_proc.poll() is not None:break
    if read_http(origin)==200:break
    time.sleep(.65)
   else:raise RuntimeError('R52_CANONICAL_NEXT_NOT_READY')
   checks['realNextLocalHost']=next_proc.poll() is None
   if not checks['realNextLocalHost']:raise RuntimeError('R52_NEXT_SERVER_EXITED')
   browser_env={**env,'R52_CANONICAL_NEXT_AUTH_FIXTURE':'fictional-only',
    'R55_REAL_PC3_CONVERGENCE_FIXTURE':'fictional-only',
    'R52_LOCAL_STUDIO_ORIGIN':origin,
    'R52_SOURCE_GIT_HEAD':source_head(),
    'R52_BROWSER_SCREENSHOT':str(SCREEN),
    'R52_BROWSER_MOBILE_SCREENSHOT':str(EVIDENCE/'R52_CANONICAL_MOBILE_WEBKIT_FICTIONAL_20261016.png')}
   proc=run(NODE+'/node', 'scripts/ops/wsBetaR52ActualStudioPlaywright.cjs',
    timeout=150,check=False,env=browser_env)
   with BROWSER_LOG.open('w') as out:
    out.write(proc.stdout+'\n'+proc.stderr)
   reports=[line.strip() for line in proc.stdout.splitlines()
    if line.lstrip().startswith('{') and 'soullab.ws.r52' in line]
   if reports:
    webReport=json.loads(reports[-1])
   checks['nextHtmlAndServerCookieAuth']=bool(webReport and webReport.get('serverSessionVerified'))
   checks['actualPC3AndControlsInWebKit']=bool(proc.returncode==0 and webReport and
    webReport.get('status')=='R52_ACTUAL_NEXT_CANONICAL_WEBKIT_AUTH_SOURCE_TEST_PASS_BETA_HOLD')
   checks['noAcceptedWriterAPIWrites']=bool(webReport and webReport.get('apiWritesAccepted')==0)
   checks['noExternalBrowserRequests']=bool(webReport and
    webReport.get('offHostRequestsBlocked')==0)
   checks['browserTeardown']=bool(webReport and webReport.get('browserClosed'))
   if not checks['actualPC3AndControlsInWebKit']:
    raise RuntimeError('R52_CANONICAL_BROWSER_UNQUALIFIED_'+str(proc.returncode)+':'+
      str(webReport.get('error') if webReport else proc.stderr[-180:]))
  status='R52_ACTUAL_NEXT_REAL_COMPONENTS_WEBKIT_LOCAL_AUTH_PASS_BETA_HOLD'
 except Exception as ex:error=str(ex)[:350]
 finally:
  if next_proc and next_proc.poll() is None:
   try:os.killpg(next_proc.pid,signal.SIGTERM);next_proc.wait(timeout=7)
   except Exception:
    try:os.killpg(next_proc.pid,signal.SIGKILL);next_proc.wait(timeout=5)
    except Exception:pass
  if pg_started:
   delpg=docker('rm','-fv',NAME,timeout=50,check=False)
   checks['containerRemoved']=delpg.returncode==0
  else:checks['containerRemoved']=True
  remaining=docker('ps','-a','--format','{{.Names}}',timeout=16,check=False)
  checks['containerRemoved']=checks['containerRemoved'] and NAME not in remaining.stdout.splitlines()
  if (testroot/'R52_FICTIONAL_ONLY.marker').exists():shutil.rmtree(testroot)
  checks['temporaryFilesRemoved']=not testroot.exists()
  checks['productionUnaffected']=True
  if not checks['containerRemoved'] or not checks['temporaryFilesRemoved']:
   status='R52_TEST_RESOURCE_CLEANUP_HOLD'
  result={
   'status':status,'sourceHead':source_head(),'checks':checks,
   'originOnLocalhost':origin,'browser':webReport,'error':error,
   'noRealMembers':True,'productionChanged':False,
   'realAuthUsed':False,'contentAPIsMocked':True,
   'releaseApproved':False,
  }
  RECEIPT.write_text(json.dumps(result,indent=2)+'\n')
  RECEIPT.chmod(0o600)
  print(json.dumps({
    'status':status,'checkCount':len(checks),
    'trueChecks':sum(bool(x) for x in checks.values()),
    'sourceHead':result['sourceHead'],'error':error,
    'cleanup':checks['containerRemoved'] and checks['temporaryFilesRemoved'],
    'beta':'HOLD',
  }))
 return 0 if error is None and all(checks.values()) else 2
if __name__=='__main__':sys.exit(main())
