#!/usr/bin/env python3
"""R30 isolated PostgreSQL 16 physical auth+encrypted history reprise against reconciled source.
No real member, external DB, production app or email access.
Exact fictional-only opt-in required; always remove only per-run Docker fixture.
"""
import json, os, re, secrets, socket, subprocess, sys, time, tempfile, shutil
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = Path('/Volumes/T7 Shield/ws-beta-release-r11-build-20261016')
RECEIPT = EVIDENCE/'R31_SESSION_VAULT_PG16_PHYSICAL_20261016.json'
LOG = EVIDENCE/'R31_SESSION_VAULT_PG16_JEST_20261016.log'
NAME = 'ws-r31-session-pg16-'+secrets.token_hex(6)
A='11111111-1111-4111-8111-111111111111'
B='22222222-2222-4222-8222-222222222222'
FOUNDER='33333333-3333-4333-8333-333333333333'
WA='44444444-4444-4444-8444-444444444444'
WB='55555555-5555-4555-8555-555555555555'
A_TOKEN='r24-synthetic-session-alpha'
B_TOKEN='r24-synthetic-session-beta'
F_TOKEN='r24-synthetic-session-founder'
REVOKED='r24-synthetic-session-revoked'
EXPIRED='r24-synthetic-session-expired'
POLICY='r24-fixture-policy'
HASH='a'*64
SENTINELS=['R24_FICTIONAL_W1_','R24_FICTIONAL_W2_']

def run(*args, timeout=45, check=True, capture=True, env=None):
    r=subprocess.run(args,cwd=ROOT,text=True,capture_output=capture,
       env=env,timeout=timeout)
    if check and r.returncode: raise RuntimeError(
       'R24 subprocess failed: '+str(args[0])+' '+str(r.returncode)+' '+(r.stderr or '')[-300:])
    return r

def docker(*args, **kw):return run('docker',*args,**kw)

def pg(sql):
    return docker('exec','-i',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
       '-U','soullab','-d','postgres','-c',sql).stdout.strip()

def free_loopback_port():
    s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    s.bind(('127.0.0.1',0)); port=s.getsockname()[1];s.close();return port

def wait_ready():
    for _ in range(100):
        r=docker('exec',NAME,'pg_isready','-U','soullab','-d','postgres',check=False,timeout=5)
        p=docker('exec',NAME,'cat','/proc/1/comm',check=False,timeout=5)
        if r.returncode==0 and p.returncode==0 and p.stdout.strip()=='postgres':return
        time.sleep(.15)
    raise RuntimeError('R24 PG16 fixture was not ready')

def seed():
    # No real people, no names/emails, no member contents. Synthetic UUIDs only.
    pg(f"""
CREATE TABLE members (id uuid PRIMARY KEY, admin_role text);
CREATE TABLE ops_contacts (member_id uuid REFERENCES members(id),
 deleted_at timestamptz, contact_type text, pipeline_stage text);
CREATE TABLE auth_sessions (session_token text PRIMARY KEY,
 member_id uuid REFERENCES members(id), revoked boolean NOT NULL,
 expires_at timestamptz NOT NULL);
CREATE TABLE writers_studio_beta_consent_events (
 seq bigserial PRIMARY KEY, member_id uuid REFERENCES members(id),
 decision text NOT NULL, policy_version text NOT NULL,
 policy_sha256 text NOT NULL);
CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES members(id));
INSERT INTO members VALUES ('{A}',NULL),('{B}',NULL),('{FOUNDER}','founder');
INSERT INTO ops_contacts VALUES
('{A}',NULL,'beta_tester','active'),('{B}',NULL,'beta_tester','active');
INSERT INTO auth_sessions VALUES
('{A_TOKEN}','{A}',false,now()+interval '1 day'),
('{B_TOKEN}','{B}',false,now()+interval '1 day'),
('{F_TOKEN}','{FOUNDER}',false,now()+interval '1 day'),
('{REVOKED}','{A}',true,now()+interval '1 day'),
('{EXPIRED}','{A}',false,now()-interval '1 day');
INSERT INTO writers_studio_beta_consent_events
 (member_id,decision,policy_version,policy_sha256)
 VALUES ('{A}','accept','{POLICY}','{HASH}'),
 ('{B}','accept','{POLICY}','{HASH}');
INSERT INTO member_manuscripts VALUES ('{WA}','{A}'),('{WB}','{B}');
""")
    review=ROOT/'docs/ops/WS_R23_VAULT_HISTORY_REVIEW_ONLY.sql'
    docker('cp',str(review),NAME+':/tmp/r24_held_history_review.sql')
    docker('exec',NAME,'psql','-XAtq','-v','ON_ERROR_STOP=1',
       '-U','soullab','-d','postgres','-f','/tmp/r24_held_history_review.sql')

def execute():
    if os.environ.get('R24_PG16_PHYSICAL')!='fictional-only':
        print('R24 refused: exact fictional-only opt-in required')
        return 3
    status='R30_SESSION_VAULT_PG16_HOLD'
    checks={'postgres16':False,'isolated':False,'jest':False,'sqlDumpNoProse':False, 'cipherVaultFiles':False,'cipherVaultNoProse':False,'privateVaultRemoved':False,'custodyFixtureRemoved':False,'postgresRestarted':False,'coldReopenPassed':False,
            'cleanup':False,'noProduction':True}
    err=None; started=False;port=free_loopback_port()
    vault_dir=Path(tempfile.mkdtemp(prefix='ws-r24-private-fixture-vault-'))
    (vault_dir/'R24_FICTIONAL_ONLY.marker').write_text('synthetic storage only\n')
    custody_dir=Path(tempfile.mkdtemp(prefix='ws-r24-external-to-db-vault-test-escrow-'))
    (custody_dir/'R24_FICTIONAL_ONLY.marker').write_text('TEST-ONLY fictional keys and signer, same machine\n')
    try:
        v=docker('image','inspect','postgres:16.13','--format','{{.Architecture}}').stdout.strip()
        docker('run','--pull','never','-d','--name',NAME,
           '-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_USER=soullab',
           '-p',f'127.0.0.1:{port}:5432','postgres:16.13',timeout=60)
        started=True;wait_ready()
        version=docker('exec',NAME,'postgres','--version').stdout.strip()
        checks['postgres16']=version.startswith('postgres (PostgreSQL) 16.')
        ports=json.loads(docker('inspect',NAME,'--format','{{json .NetworkSettings.Ports}}').stdout)
        bind=ports.get('5432/tcp') or []
        checks['isolated']=bool(bind) and all(x.get('HostIp')=='127.0.0.1' for x in bind)
        if not (checks['postgres16'] and checks['isolated']):
            raise RuntimeError('PG major or loopback binding mismatch')
        seed()
        env=os.environ.copy()
        env.update({
          'DATABASE_URL':f'postgresql://soullab@127.0.0.1:{port}/postgres',
          'FILE_STORAGE_PATH':str(vault_dir),
          'R24_FICTIONAL_ESCROW_PATH':str(custody_dir/'keys.fixture-only.json'),
          'WRITERS_STUDIO_RESTRICTED_BETA':'true',
          'WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW':'true',
          'WRITERS_STUDIO_BETA_MEMBER_IDS':A+','+B,
          'WRITERS_STUDIO_BETA_CONSENT_VERSION':POLICY,
          'WRITERS_STUDIO_BETA_CONSENT_SHA256':HASH,
          'R23_VAULT_HISTORY_FIXTURE':'fictional-only',
          'R23_VAULT_SERVICE_FIXTURE':'fictional-only',
          'R24_PG16_PHYSICAL':'fictional-only',
        })
        test='scripts/ops/__tests__/r24ActualSessionVaultPG16.test.ts'
        jest=run(str(ROOT/'node_modules/.bin/jest'),'--runInBand','--no-coverage',
         '--runTestsByPath',test,timeout=90,check=False,env=env)
        LOG.write_text(jest.stdout+'\n'+jest.stderr)
        checks['jest']=jest.returncode==0
        # Check sealed vault files, not just SQL; no author text can escape.
        sealed_files=list(vault_dir.rglob('*.enc'))
        checks['cipherVaultFiles']=len(sealed_files)>=3
        checks['cipherVaultNoProse']=all(
            all(s.encode() not in p.read_bytes() for s in SENTINELS)
            for p in sealed_files
        )
        # Test SQL dump after all updates; never save any dump bytes to disk.
        dump=docker('exec',NAME,'pg_dump','-Fp','--no-owner',
           '--no-privileges','-U','soullab','-d','postgres',timeout=35).stdout
        checks['sqlDumpNoProse']=all(s not in dump for s in SENTINELS)
        if not checks['jest'] or not checks['sqlDumpNoProse'] or not checks['cipherVaultNoProse'] or not checks['cipherVaultFiles']:
            raise RuntimeError('R24 Jest suite or SQL dump ciphertext check refused; consult private Jest log')
        # Simulate database power loss AFTER a separate ephemeral fixture key
        # was saved outside the DB, vault and source tree. This is NOT a KMS.
        escrow_path=custody_dir/'keys.fixture-only.json'
        if not escrow_path.is_file() or (escrow_path.stat().st_mode & 0o077):
            raise RuntimeError('R24 test key fixture escrow missing or incorrectly permissioned')
        docker('kill','--signal=SIGKILL',NAME,timeout=35)
        docker('start',NAME,timeout=35)
        wait_ready()
        checks['postgresRestarted']=True
        cold_env=env.copy()
        cold_env['R24_COLD_RESTORE_PHASE']='fictional-only'
        cold_test='scripts/ops/__tests__/r24ColdRestoreAfterRestart.test.ts'
        cold=run(str(ROOT/'node_modules/.bin/jest'),'--runInBand','--no-coverage',
            '--runTestsByPath',cold_test,timeout=90,check=False,env=cold_env)
        (EVIDENCE/'R31_SESSION_VAULT_PG16_COLD_JEST_20261016.log').write_text(
            cold.stdout+'\n'+cold.stderr)
        checks['coldReopenPassed'] = cold.returncode==0
        if not checks['coldReopenPassed']:
            raise RuntimeError('R24 post-restart cold recovery test refused')
        status='R30_REAL_SESSION_AND_VAULT_COLD_REOPEN_PG16_FICTIONAL_PASS_RELEASE_HELD'
    except Exception as e:
        err=str(e)[:420]
    finally:
        if vault_dir.exists() and (vault_dir/'R24_FICTIONAL_ONLY.marker').exists():
            shutil.rmtree(vault_dir)
        checks['privateVaultRemoved'] = not vault_dir.exists()
        if custody_dir.exists() and (custody_dir/'R24_FICTIONAL_ONLY.marker').exists():
            shutil.rmtree(custody_dir)
        checks['custodyFixtureRemoved'] = not custody_dir.exists()
        if started:
            rm=docker('rm','-fv',NAME,timeout=50,check=False)
            checks['cleanup']=rm.returncode==0
        else:
            checks['cleanup']=True
        remaining=docker('ps','-a','--format','{{.Names}}',check=False).stdout
        checks['cleanup'] = checks['cleanup'] and NAME not in remaining.splitlines()
        if not checks['cleanup']:
            status='R30_TEMPORARY_CONTAINER_CLEANUP_HOLD'
        receipt={
           'status':status,'scope':'FICTIONAL_MAC_ONLY_ACTUAL_AUTH_AND_PG16',
           'sourceRevisionParent':'574f299c6152870996e7efb2845f0ad1572a7fed',
           'testedGitHead':run('git','rev-parse','HEAD',timeout=10).stdout.strip(),
           'postgresVersion':16,'checks':checks,'modelCalls':0,
           'mailCalls':0,'realMemberTouches':0,'prodChanged':False,
           'independentKeyCustodianInstalled':False,'liveNextCookieTransportTested':False,
           'appRouteDeployed':False,'testContainerRemoved':checks['cleanup'],
           'releaseDisposition':'HOLD','error':err,
           'timestamp':datetime.now(timezone.utc).isoformat()
        }
        RECEIPT.write_text(json.dumps(receipt,indent=2)+'\n')
        os.chmod(RECEIPT,0o600)
        print(json.dumps(receipt,indent=2))
    return 0 if all(checks.values()) and err is None else 2

if __name__=='__main__':sys.exit(execute())
