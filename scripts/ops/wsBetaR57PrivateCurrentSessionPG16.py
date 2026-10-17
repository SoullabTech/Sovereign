#!/usr/bin/env python3
"""R47 held private editorial choice: disposable PostgreSQL16 + immutable vault.

Fictional-only. No operational member, KMS, model, email, real manuscript,
production database, live Next route or deployment. Unique evidence path;
never overwrite earlier R35–R46 acceptance. Cleanup only owned fixtures.
"""
import json,os,secrets,socket,subprocess,sys,tempfile,shutil,time,hashlib
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-r57-real-auth-pc3-evidence-20261016/R57_PRIVATE_CURRENT_SESSION_20261016')/('run-'+secrets.token_hex(5))
NAME='ws-r57-private-session-'+secrets.token_hex(6)
PHASE1=EVIDENCE/'R57_PRIVATE_SESSION_PG16_INITIAL_JEST.log'
COLD=EVIDENCE/'R57_PRIVATE_SESSION_PG16_COLD_JEST.log'
RECEIPT=EVIDENCE/'R57_PRIVATE_CURRENT_SESSION_PG16.json'
FORBIDDEN=[
 'R47_PRIVATE_LANTERN_','R47_PRIVATE_GARDEN_',
 'First lantern glows. Second lantern glows.',
 'lantern shimmers','lantern shines',
 'r47-first-read-001','r47-parallel-review-001',
 'r47-interrupted-intention-001','r47-interrupted-vault-001',
]
MEMBER='11111111-1111-4111-8111-111111111111'
FOREIGN='22222222-2222-4222-8222-222222222222'
WORKS=[
 '33333333-3333-4333-8333-333333333331',
 '33333333-3333-4333-8333-333333333332',
 '33333333-3333-4333-8333-333333333333',
 '33333333-3333-4333-8333-333333333334',
]
SCHEMAS=[
 'docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql',
 'docs/ops/WS_R47_PRIVATE_REVIEW_CUSTODY_REVIEW_ONLY.sql',
 'database/migrations/20261015000001_writer_studio_beta_consent_events.sql',
 'database/migrations/20260801000001_living_works.sql',
 'docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql',
]
def call(*argv,timeout=55,env=None,check=True):
 r=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True,
     timeout=timeout,env=env)
 if check and r.returncode:
  raise RuntimeError('R47_command_failed_'+argv[0]+'_exit'+str(r.returncode))
 return r
def docker(*args,**kw):return call('docker',*args,**kw)
def sql(query):
 return docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r35_draft','-c',query,timeout=22).stdout.strip()
def free_port():
 with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
  s.bind(('127.0.0.1',0));return s.getsockname()[1]
def wait_pg():
 for _ in range(120):
  r=docker('exec',NAME,'psql','-XAtq','-U','fict','-d','r35_draft',
    '-c','SELECT 1',timeout=6,check=False)
  comm=docker('exec',NAME,'cat','/proc/1/comm',timeout=6,check=False)
  if r.returncode==0 and r.stdout.strip()=='1' and \
     comm.returncode==0 and comm.stdout.strip()=='postgres':return
  time.sleep(.18)
 raise RuntimeError('R47_PostgreSQL16_did_not_recover')
def seed():
 sql("CREATE TABLE members(id uuid PRIMARY KEY,admin_role text);"
     "CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,"
     "member_id uuid NOT NULL REFERENCES members(id));"
     f"INSERT INTO members VALUES ('{MEMBER}',NULL),('{FOREIGN}',NULL);")
 for w in WORKS:
  sql(f"INSERT INTO member_manuscripts(id,member_id) VALUES('{w}','{MEMBER}')")
 for rel in SCHEMAS:
  source=ROOT/rel
  if not source.is_file():raise RuntimeError('R47_missing_review_only_schema')
  target='/tmp/'+source.name
  docker('cp',str(source),NAME+':'+target,timeout=25)
  docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U',
   'fict','-d','r35_draft','-f',target,timeout=30)
def seed_real_session_scope():
    # Invented literal member metadata only; neither a real user session nor
    # operational Work key is ever reached.
    from hashlib import sha256
    notice='fictional accepted first-writer notice'
    digest=sha256(notice.encode('utf8')).hexdigest()
    w=WORKS[0]
    sql("ALTER TABLE members ADD COLUMN tier text, ADD COLUMN roles jsonb;"+
        "UPDATE members SET tier='pro',roles='[\"member\"]'::jsonb;"+
        "CREATE TABLE auth_sessions(session_token text PRIMARY KEY,"+
        "member_id uuid NOT NULL REFERENCES members(id),"+
        "revoked boolean NOT NULL,expires_at timestamptz NOT NULL);"+
        "CREATE TABLE ops_contacts(member_id uuid NOT NULL REFERENCES members(id),"+
        "deleted_at timestamptz,contact_type text,pipeline_stage text);")
    sql("INSERT INTO auth_sessions VALUES ('r57-fictional-cookie-session','"+
        MEMBER+"',false,now()+interval '2 hours');"+
        "INSERT INTO ops_contacts(member_id,contact_type,pipeline_stage) VALUES "+
        "('"+MEMBER+"','beta_tester','active');")
    sql("INSERT INTO living_works(id,member_id,title) VALUES "+
        "('88888888-8888-4888-8888-888888888888','"+MEMBER+"','Fictional Work A'),"+
        "('99999999-9999-4999-8999-999999999999','"+MEMBER+"','Fictional Work B');"+
        "INSERT INTO living_work_expressions"+
        "(living_work_id,expression_type,expression_id,declared_by) VALUES"+
        "('88888888-8888-4888-8888-888888888888','manuscript','"+w+"','"+MEMBER+"'),"+
        "('99999999-9999-4999-8999-999999999999','manuscript','"+w+"','"+MEMBER+"');")
    sql("INSERT INTO writers_studio_beta_consent_events"+
        "(member_id,actor_member_id,decision,policy_version,policy_sha256) VALUES"+
        "('"+MEMBER+"','"+MEMBER+"','accept','old-version','"+digest+"'),"+
        "('"+MEMBER+"','"+MEMBER+"','revoke','old-version','"+digest+"'),"+
        "('"+MEMBER+"','"+MEMBER+"','accept','old-version','"+digest+"'),"+
        "('"+MEMBER+"','"+MEMBER+"','accept','r57-fictional-v1','"+digest+"');")
    rid='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
    mid='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    sql("INSERT INTO writers_studio_r32_held_originals"+
        "(id,member_id,manuscript_id,arrival_id,work_generation,key_id,"+
        "work_ref,metadata_ref,work_sha256,metadata_sha256,pair_sha256) VALUES"+
        "('"+rid+"','"+MEMBER+"','"+w+"',"+
        "'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',1,"+
        "'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',"+
        "'ws-beta-r32-held-source/"+rid+".enc',"+
        "'ws-beta-r32-held-source/"+mid+".enc',"+
        "'"+digest+"','"+digest+"','"+digest+"');")
    return notice,digest

def all_clean_sql():
 dumped=docker('exec',NAME,'pg_dump','-Fp','-U','fict','-d','r35_draft',
     timeout=50).stdout
 return all(x not in dumped for x in FORBIDDEN)
def all_clean_vault(vault):
 files=list(vault.rglob('*.enc'))
 if len(files)<7:return False,len(files)
 for file in files:
  data=file.read_bytes()
  if any(x.encode('utf8') in data for x in FORBIDDEN):
   return False,len(files)
 return True,len(files)
def run_jest(target,env,log,timeout=115):
 r=call(str(ROOT/'node_modules/.bin/jest'),'--runInBand','--no-coverage',
 '--runTestsByPath',target,timeout=timeout,env=env,check=False)
 fd=os.open(log,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:f.write(r.stdout+'\n'+r.stderr)
 return r.returncode,r.stdout+'\n'+r.stderr

def main():
 if (os.environ.get('R47_PHYSICAL_PG16')!='fictional-only' or
     os.environ.get('R55_REAL_PC3_CONVERGENCE_FIXTURE')!='fictional-only' or
     os.environ.get('R57_REAL_PRIVATE_PG16_FIXTURE')!='fictional-only'):
  print('R47 physical acceptance refuses without fictional-only opt-in')
  return 3
 if EVIDENCE.exists():
  print('R47 exact receipt destination already exists; refusing overwrite')
  return 4
 EVIDENCE.mkdir(mode=0o700,parents=True)
 root=Path(tempfile.mkdtemp(prefix='ws-r35-physical-r57-'))
 vault=root/'vault';vault.mkdir()
 (root/'R47_FICTIONAL_ONLY.marker').write_text('fictional manuscript only\n')
 keydir=Path(tempfile.mkdtemp(prefix='ws-r47-fake-private-key-'))
 (keydir/'R47_FICTIONAL_ONLY.marker').write_text('not external KMS\n')
 escrow=keydir/'fake-recovery.json'
 started=False;err=None;port=free_port()
 checks={k:False for k in (
   'postgres16','loopbackOnly','noHostMounts',
   'initialPrivateReviewTests','intentionBeforeCipher',
   'metadataOnlySqlDump','fileVaultOnlyCiphertext',
   'reservedMissingCipherHeld','verifiedImmutable',
   'postgresSIGKILLRestored','newNodeColdRecovery',
   'containerRemoved','vaultRemoved','keyFixtureRemoved',
 )}
 checks['noLiveMemberOrProductionChanges']=True
 status='R47_PRIVATE_EDITORIAL_HOLD'
 try:
  docker('image','inspect','postgres:16.13',timeout=20)
  docker('run','--pull','never','-d','--name',NAME,
    '--network','bridge','--memory','850m','--cpus','2',
    '--pids-limit','180','--security-opt','no-new-privileges',
    '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=r35_draft',
    '-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '-p',f'127.0.0.1:{port}:5432',
    'postgres:16.13',timeout=70)
  started=True;wait_pg()
  checks['postgres16']=sql('SHOW server_version_num').startswith('160')
  config=json.loads(docker('inspect',NAME,'--format',
      '{{json .HostConfig}}',timeout=15).stdout)
  bindings=config.get('PortBindings',{}).get('5432/tcp') or []
  checks['loopbackOnly']=len(bindings)==1 and bindings[0].get('HostIp')=='127.0.0.1'
  checks['noHostMounts']=config.get('Binds') is None
  if not all(checks[k] for k in ['postgres16','loopbackOnly','noHostMounts']):
   raise RuntimeError('R47_nonisolated_pg16')
  seed()
  notice,consent_hash=seed_real_session_scope()
  env=os.environ.copy()
  env.update({
   'R47_PRIVATE_EDITORIAL_FIXTURE':'fictional-only',
   'R57_PRIVATE_READ_FIXTURE':'fictional-only',
   'R56_REAL_SESSION_WORK_FIXTURE':'fictional-only',
   'WRITERS_STUDIO_RESTRICTED_BETA':'true',
   'WRITERS_STUDIO_BETA_MEMBER_IDS':MEMBER,
   'WRITERS_STUDIO_BETA_CONSENT_VERSION':'r57-fictional-v1',
   'WRITERS_STUDIO_BETA_CONSENT_SHA256':consent_hash,
   'WRITERS_STUDIO_BETA_CONSENT_NOTICE':notice,
   'R37_SECTION_PASSAGE_FIXTURE':'fictional-only',
   'R36_PASSAGE_REVIEW_FIXTURE':'fictional-only',
   'R35_PROTECTED_DRAFT_FIXTURE':'fictional-only',
   'R35_PHYSICAL_PG16_FIXTURE':'fictional-only',
   'R47_FICTIONAL_ESCROW_PATH':str(escrow),
   'DATABASE_URL':f'postgresql://fict@127.0.0.1:{port}/r35_draft',
   'FILE_STORAGE_PATH':str(vault),
  })
  code,output=run_jest('scripts/ops/__tests__/r47PrivateEditorialPG16.test.ts',
   env,PHASE1)
  checks['initialPrivateReviewTests']=code==0 and '9 passed, 9 total' in output
  vals=sql("SELECT state||':'||count(*) FROM writers_studio_r47_private_review "
           "GROUP BY state ORDER BY state").splitlines()
  checks['intentionBeforeCipher']=len(vals)==2 and vals==['reserved:1','verified:3']
  checks['reservedMissingCipherHeld']=checks['intentionBeforeCipher'] and \
    sql("SELECT count(*) FROM writers_studio_r47_private_review "
        "WHERE state='reserved' AND cipher_sha256 IS NULL")=='1'
  checks['verifiedImmutable']=sql("SELECT count(*) FROM writers_studio_r47_private_review "
    "WHERE state='verified' AND cipher_sha256 IS NOT NULL")=='3'
  checks['metadataOnlySqlDump']=all_clean_sql()
  ok,files=all_clean_vault(vault)
  checks['fileVaultOnlyCiphertext']=ok
  if not all(checks[k] for k in ['initialPrivateReviewTests',
       'intentionBeforeCipher','reservedMissingCipherHeld','verifiedImmutable',
       'metadataOnlySqlDump','fileVaultOnlyCiphertext']):
   raise RuntimeError('R47_initial_private_review_failed')
  if not escrow.is_file() or escrow.stat().st_mode & 0o077:
   raise RuntimeError('R47_fictional_private_escrow_unavailable')
  docker('kill','--signal=SIGKILL',NAME,timeout=40)
  docker('start',NAME,timeout=40);wait_pg()
  checks['postgresSIGKILLRestored']=True
  cold=env.copy();cold['R47_COLD_PG16']='fictional-only'
  code,output=run_jest('scripts/ops/__tests__/r47PrivateEditorialColdPG16.test.ts',
    cold,COLD,timeout=100)
  checks['newNodeColdRecovery']=code==0
  if not code==0:raise RuntimeError('R47_new_process_cold_review_failed')
  status='R47_ENCRYPTED_PRIVATE_REVIEW_CUSTODY_PG16_PASS_RELEASE_HELD'
 except Exception as e:
  err=str(e)[:300]
 finally:
  if started:
   response=docker('rm','-fv',NAME,timeout=45,check=False)
   checks['containerRemoved']=response.returncode==0
  else:checks['containerRemoved']=True
  remaining=docker('ps','-a','--format','{{.Names}}',timeout=15,check=False)
  checks['containerRemoved']=checks['containerRemoved'] and \
     NAME not in remaining.stdout.splitlines()
  if (root/'R47_FICTIONAL_ONLY.marker').is_file():shutil.rmtree(root)
  checks['vaultRemoved']=not root.exists()
  if (keydir/'R47_FICTIONAL_ONLY.marker').is_file():shutil.rmtree(keydir)
  checks['keyFixtureRemoved']=not keydir.exists()
  if not all(checks[k] for k in ['containerRemoved','vaultRemoved','keyFixtureRemoved']):
   status='R47_DISPOSABLE_FIXTURE_CLEANUP_HOLD'
  revision=call('git','rev-parse','HEAD',check=False).stdout.strip()
  result={'status':status,'checks':checks,'error':err,'sourceHead':revision,
   'realMembersTouched':0,'realKmsInstalled':False,
   'releaseApproved':False,'productionChanged':False,
   'realBrowserAuthorized':False,
   'noDurableApplyOrUndoFromThisService':True,
   'privateReviewVaultFileCount':locals().get('files',None),
   'at':datetime.now(timezone.utc).isoformat()}
  fd=os.open(RECEIPT,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
  with os.fdopen(fd,'w') as f:json.dump(result,f,indent=2)
  print(json.dumps(result,indent=2))
 return 0 if err is None and all(checks.values()) else 2
if __name__=='__main__':sys.exit(main())
