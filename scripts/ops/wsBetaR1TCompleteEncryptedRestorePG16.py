#!/usr/bin/env python3
"""R1T: real PG16 and separate files -> encrypted two-archive complete unit;
fail stages before publication, destroy source, independent PG/file restore.
FICTIONAL ONLY. No production media, root/user cron, NAS, secret keys or live AWS.
"""
import hashlib
import json
import os
import pathlib
import re
import secrets
import shutil
import subprocess
import tempfile
import time
from datetime import datetime,timezone

ROOT=pathlib.Path(__file__).resolve().parents[2]
EVIDENCE=pathlib.Path(os.environ.get('R1T_EVIDENCE_DIR',''))
WRITER=ROOT/'scripts/ops/wsBetaR1TCompleteEncryptedRecoveryFixture.sh'
SOURCE_HEAD='441616dbf5a597f9ef297ad3dafead3be5f2ceb3'
TAG=secrets.token_hex(4)
SRC='ws-r1t-src-'+TAG
DST='ws-r1t-rest-'+TAG
KDIR=None
CONTAINERS=[]
checks={}
metrics={'scope':'FICTIONAL_SQL_AND_FILES_ONLY','productionBackupsAccessed':0,'realMembersAccessed':0}

def require(ok,name):
 checks[name]=bool(ok)
 if not ok:raise RuntimeError('R1T_REFUSED_'+name)

def run(args,timeout=45,env=None,input_bytes=None,check=True):
 p=subprocess.run(args,cwd=ROOT,input=input_bytes,capture_output=True,timeout=timeout,env=env)
 if check and p.returncode:
  raise RuntimeError('R1T_COMMAND_'+pathlib.Path(args[0]).name+'_EXIT_'+str(p.returncode)+'_'+p.stderr.decode(errors='replace')[:145])
 return p

def docker(*args,timeout=30,check=True):return run(['docker',*args],timeout=timeout,check=check)

def starts_container(name):
 require(not docker('ps','-aq','--filter','name=^/'+name+'$',timeout=7).stdout.strip(),
  'fixture_container_absent_'+('src' if name==SRC else 'rest'))
 cmd=['run','--pull','never','-d','--rm','--name',name,
      '--label','soullab.fixture=r1t','--network','none',
      '--memory','512m','--cpus','1','--pids-limit','128',
      '--security-opt','no-new-privileges',
      '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
      '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=ws_fixture',
      '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13']
 docker(*cmd,timeout=55)
 CONTAINERS.append(name)
 ready=False
 for i in range(50):
  r=docker('exec',name,'psql','-XAtq','-U','fict','-d','ws_fixture','-c','SELECT 1',timeout=8,check=False)
  if r.returncode==0 and r.stdout.strip()==b'1':ready=True;break
  time.sleep(.25)
 require(ready,'fixture_pg_query_ready')
 isolated=docker('inspect','-f','{{.HostConfig.NetworkMode}}|{{len .Mounts}}|{{index .Config.Labels "soullab.fixture"}}',name,timeout=10)
 require(isolated.stdout.strip()==b'none|0|r1t','docker_no_network_mounts_fixture_label')


def writer_env(backup_home,fpr,fail_stage=''):
 return dict(os.environ,
  WS_R1T_MODE='fictional-only',WS_R1T_SOURCE_CONTAINER=SRC,
  WS_R1T_EVIDENCE_DIR=str(EVIDENCE),WS_R1T_RECIPIENT_FPR=fpr,
  WS_R1T_FAIL_STAGE=fail_stage,GNUPGHOME=str(backup_home))

def fixture_files():
 source=EVIDENCE/'fictional-vault'
 source.mkdir(mode=0o700)
 (source/'original.txt').write_text('R1T_FICTIONAL_UNPUBLISHED_MANUSCRIPT_CANDLE_222\n')
 (source/'source-attachment.bin').write_bytes(b'R1T_FAKE_ATTACHMENT_SOURCE_'+secrets.token_bytes(32))
 (source/'receipt.txt').write_text('R1T_FAKE_ERASURE_AND_CONSENT_TOMBSTONE_NOT_A_REAL_MEMBER\n')
 originals={item.name:hashlib.sha256(item.read_bytes()).hexdigest() for item in sorted(source.iterdir())}
 require(len(originals)==3,'three_distinct_fake_vault_files')
 return originals

def complete_dirs():
 p=EVIDENCE/'complete'
 return sorted(x for x in p.iterdir() if x.is_dir()) if p.is_dir() else []

def pending_dirs():return sorted(EVIDENCE.glob('.r1t.pending.*'))

def restore_pg(archive,private_home):
 decrypted=subprocess.Popen(['gpg','--batch','--no-tty','--homedir',str(private_home),
  '--decrypt',str(archive)],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
 restored=subprocess.Popen(['docker','exec','-i',DST,'pg_restore','--exit-on-error','-U','fict','-d','ws_fixture'],
  stdin=decrypted.stdout,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 assert decrypted.stdout is not None
 decrypted.stdout.close()
 try:
  _,err=restored.communicate(timeout=55)
  done=decrypted.wait(timeout=17)
  require(done==0 and restored.returncode==0,'independent_pg_decrypt_pipe_restore')
 except BaseException:
  for p in [restored,decrypted]:
   if p.poll() is None:p.kill();p.wait(timeout=8)
  raise

def restore_vault(archive,private_home,dest):
 dest.mkdir(mode=0o700)
 decrypted=subprocess.Popen(['gpg','--batch','--no-tty','--homedir',str(private_home),
  '--decrypt',str(archive)],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
 unpacked=subprocess.Popen(['tar','-C',str(dest),'-xf','-'],
  stdin=decrypted.stdout,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 assert decrypted.stdout is not None
 decrypted.stdout.close()
 try:
  _,err=unpacked.communicate(timeout=50)
  done=decrypted.wait(timeout=17)
  require(done==0 and unpacked.returncode==0,'independent_vault_decrypt_pipe_restore')
 except BaseException:
  for p in [unpacked,decrypted]:
   if p.poll() is None:p.kill();p.wait(timeout=8)
  raise

def execute():
 global KDIR
 require(os.environ.get('R1T_TEST_MODE')=='fictional-only','explicit_fictional_test_only')
 require(str(EVIDENCE).startswith('/Volumes/T7 Shield/ws-beta-r1t-'),'private_t7_fixture_scope')
 require(not EVIDENCE.exists(),'new_exclusive_test_directory')
 require(WRITER.is_file(),'source_writer_available')
 current=run(['git','rev-parse','HEAD']).stdout.decode().strip()
 require(current==SOURCE_HEAD or
    run(['git','rev-parse','HEAD^']).stdout.decode().strip()==SOURCE_HEAD,
    'pinned_original_source_or_direct_review_child')
 expected={
  'docs/ops/WS_BETA_R1T_ENCRYPTED_COMPLETE_RECOVERY_CUTOVER_REVIEW_20261017.md',
  'scripts/ops/__tests__/wsBetaR1TCompleteEncryptedRecovery.test.cjs',
  'scripts/ops/wsBetaR1TCompleteEncryptedRecoveryFixture.sh',
  'scripts/ops/wsBetaR1TCompleteEncryptedRestorePG16.py',
  'scripts/ops/wsBetaR1TVerifyCompleteRecoveryFixture.py',
  'scripts/ops/wsBetaR1TVerifyCompleteRecoveryPoint.py',
 }
 if current==SOURCE_HEAD:
  actual=set(x[3:] for x in run(['git','status','--porcelain','-uall']).stdout.decode().splitlines()
             if x.startswith('?? '))
  require(actual==expected,'only_six_precommit_review_files')
 else:
  changed=set(run(['git','show','--pretty=format:','--name-only','HEAD']).stdout.decode().splitlines())
  require(changed==expected,'only_six_committed_review_files')
  require(run(['git','status','--porcelain']).stdout.strip()==b'',
          'clean_exact_review_commit')
 require(shutil.which('gpg') is not None and shutil.which('docker') is not None,'gpg_and_docker_present')
 docker('image','inspect','postgres:16.13',timeout=14)
 pre=run(['/bin/bash',str(WRITER)],timeout=8,check=False)
 require(pre.returncode!=0 and b'DEFAULT_OFF' in pre.stderr,'writer_default_off')
 EVIDENCE.mkdir(mode=0o700)
 # Independent decrypt keyring is outside all writer/backup/output directories.
 KDIR=pathlib.Path(tempfile.mkdtemp(prefix='ws-r1t-fake-recovery-key-'))
 key_home=KDIR/'independent_recovery';writer_home=KDIR/'backup_public_only'
 key_home.mkdir(mode=0o700);writer_home.mkdir(mode=0o700)
 uid='R1T Fake Encrypted Cold Restore <r1t-fixture.invalid>'
 run(['gpg','--batch','--homedir',str(key_home),'--pinentry-mode','loopback',
  '--passphrase','','--quick-generate-key',uid,'rsa2048','encr','0'],timeout=55)
 keys=run(['gpg','--batch','--homedir',str(key_home),'--with-colons','--list-keys',uid]).stdout.decode()
 fingerprint=[a[9] for line in keys.splitlines() if (a:=line.split(':'))[0]=='fpr' and len(a)>9 and re.fullmatch(r'[A-F0-9]{40}',a[9])]
 require(len(fingerprint)==1,'one_independent_encryption_key_fingerprint')
 fpr=fingerprint[0]
 pub=run(['gpg','--batch','--homedir',str(key_home),'--export',fpr]).stdout
 require(len(pub)>200,'public_key_export')
 run(['gpg','--batch','--homedir',str(writer_home),'--import'],input_bytes=pub)
 no_secret=run(['gpg','--batch','--homedir',str(writer_home),'--with-colons','--list-secret-keys']).stdout
 require(b'sec:' not in no_secret,'backup_writer_contains_only_public_key')
 fake=fixture_files()
 starts_container(SRC)
 statement="CREATE TABLE r1t_synthetic_work(id integer PRIMARY KEY,body text NOT NULL); INSERT INTO r1t_synthetic_work VALUES (1,'R1T_FICTIONAL_WRITER_ONLY_111'),(2,'R1T_FICTIONAL_WRITER_ONLY_222');"
 seeded=docker('exec',SRC,'psql','-v','ON_ERROR_STOP=1','-U','fict','-d','ws_fixture','-c',statement,timeout=27)
 require(b'INSERT 0 2' in seeded.stdout,'fictional_postgres_rows_seeded')
 # Reject all attempts to select a real production PostgreSQL container.
 actual=writer_env(writer_home,fpr)
 wrong=dict(actual,WS_R1T_SOURCE_CONTAINER='maia-postgres')
 p=run(['/bin/bash',str(WRITER)],env=wrong,timeout=10,check=False)
 require(p.returncode==70 and b'SOURCE_SCOPE' in p.stderr,'production_database_container_refused')
 bad=dict(actual,WS_R1T_RECIPIENT_FPR='0'*40)
 p=run(['/bin/bash',str(WRITER)],env=bad,timeout=10,check=False)
 if not (p.returncode==70 and b'MISSING_PUBLIC_RECIPIENT' in p.stderr):
  print('R1T_DEBUG_NEGATIVE_RECIPIENT: rc='+str(p.returncode)+
        '; refusal code='+p.stderr.decode(errors='replace')[:180],flush=True)
 require(p.returncode==70 and b'MISSING_PUBLIC_RECIPIENT' in p.stderr,'invalid_public_recipient_refused')
 require(not complete_dirs(),'no_published_checkpoint_after_preflight_denials')
 symlink=EVIDENCE/'fictional-vault'/'outside-link'
 symlink.symlink_to('/Volumes/T7 Shield/not-a-member-vault')
 p=run(['/bin/bash',str(WRITER)],env=actual,timeout=10,check=False)
 require(p.returncode==70 and b'VAULT_SYMLINK_CONTENT' in p.stderr,'vault_symlink_escape_refused')
 symlink.unlink()
 for stage in ('after_db','after_vault','before_complete'):
  p=run(['/bin/bash',str(WRITER)],env=writer_env(writer_home,fpr,stage),timeout=80,check=False)
  expected={'after_db':b'INJECTED_AFTER_SQL','after_vault':b'INJECTED_AFTER_VAULT',
            'before_complete':b'INJECTED_BEFORE_COMPLETE'}[stage]
  require(p.returncode==70 and expected in p.stderr,
    'failure_'+stage+'_refused')
  require(not complete_dirs(),'failure_'+stage+'_no_complete_generation')
  require(not pending_dirs(),'failure_'+stage+'_pending_ciphertext_cleaned')
 out=run(['/bin/bash',str(WRITER)],env=actual,timeout=95)
 require(b'R1T_FICTIONAL_DB_AND_VAULT_GENERATION_PUBLISHED' in out.stdout,'encrypted_db_and_vault_published_together')
 complete=complete_dirs();require(len(complete)==1,'one_atomic_complete_recovery_generation')
 generation=complete[0]
 require(not pending_dirs(),'no_pending_data_after_success')
 manifest=json.loads((generation/'manifest.json').read_text())
 require(manifest['status']=='FICTIONAL_DB_AND_VAULT_CIPHERTEXT_COMPLETE_BETA_HOLD','manifest_not_a_release_claim')
 require(manifest['productionSnapshotCoherenceVerified'] is False and manifest['offHostRecoveryKeyProven'] is False,'honest_scope_flags')
 for name in ('postgres','vault'):
  item=manifest[name]
  file=generation/item['file'];content=file.read_bytes()
  require(len(content)==item['bytes'] and hashlib.sha256(content).hexdigest()==item['sha256'],name+'_ciphertext_digest_custody')
  require(not content.startswith((b'PGDMP',b'\x1f\x8b')) and not content.startswith(b'ustar'),name+'_encrypted_not_plain_archive')
  require(b'R1T_FICTIONAL_' not in content and b'FAKE_ATTACHMENT' not in content,name+'_no_plaintext_markers')
  require(file.stat().st_mode & 0o777 == 0o600,name+'_private_ciphertext_permissions')
 # Remove all source data before restoring to independent PG/container/files.
 docker('stop','--time','4',SRC,timeout=17)
 CONTAINERS.remove(SRC)
 require(not docker('ps','-aq','--filter','name=^/'+SRC+'$').stdout.strip(),'original_postgres_destroyed_before_restore')
 shutil.rmtree(EVIDENCE/'fictional-vault')
 require(not (EVIDENCE/'fictional-vault').exists(),'original_file_vault_destroyed_before_restore')
 starts_container(DST)
 restored_vault=EVIDENCE/'decrypted-restore-test-only'
 restore_pg(generation/'postgres.pgdump.gpg',key_home)
 restore_vault(generation/'vault.tar.gpg',key_home,restored_vault)
 rows=docker('exec',DST,'psql','-XAt','-U','fict','-d','ws_fixture','-c',
  "SELECT COUNT(*)=2 AND COUNT(*) FILTER(WHERE body LIKE 'R1T_FICTIONAL_WRITER_ONLY_%')=2 FROM r1t_synthetic_work;").stdout.strip()
 require(rows==b't','two_fictional_postgres_rows_exact_recovery')
 recovered={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(restored_vault.iterdir())}
 require(recovered==fake,'three_fictional_vault_files_exact_recovery')
 metrics['recoveredPgRows']=2
 metrics['recoveredVaultFiles']=len(recovered)
 metrics['cipherOnlyBackupBytes']=sum((generation/f).stat().st_size for f in ('postgres.pgdump.gpg','vault.tar.gpg'))
 require(not list(EVIDENCE.rglob('*.sql')) and not list(EVIDENCE.rglob('*.dump')),'no_plaintext_sql_dump_written')
 shutil.rmtree(restored_vault)
 require(not restored_vault.exists(),'temporary_restored_plaintext_vault_removed')
 return True

def main():
 status='R1T_FICTIONAL_COMPLETE_ENCRYPTED_DB_VAULT_HOLD'
 error=None
 try:
  execute();status='R1T_FICTIONAL_ENCRYPTED_DB_AND_VAULT_COLD_RESTORE_PASS_BETA_HOLD'
 except Exception as e:error=type(e).__name__+':'+str(e)[:240]
 finally:
  for name in list(CONTAINERS):docker('rm','-f','-v',name,timeout=20,check=False)
  if KDIR and KDIR.exists():shutil.rmtree(KDIR,ignore_errors=True)
  checks['ephemeral_private_recovery_key_destroyed']=KDIR is not None and not KDIR.exists()
  checks['no_fixture_pg_containers_left']=all(not docker('ps','-aq','--filter','name=^/'+n+'$',timeout=8,check=False).stdout.strip() for n in (SRC,DST))
  if status.endswith('PASS_BETA_HOLD') and not all(checks.values()):status='R1T_CLEANUP_FAILED_BETA_HOLD'
  report={
   'protocol':'soullab.ws.r1t.complete-encrypted-db-vault.fixture.v1',
   'status':status,'date':datetime.now(timezone.utc).isoformat(),
   'sourceHead':run(['git','rev-parse','HEAD']).stdout.decode().strip(),
   'checks':checks,'metrics':metrics,'error':error,
   'realProductionBackupsOrNASRead':False,'realMemberDataRead':False,
   'offsiteKeyCustodyQualified':False,'sourceVaultSqlCaptureBarrierQualified':False,
   'deletedWorkErasureNonresurrectionCertified':False,'historicalGzipArchivesRemediated':False,
   'productionBackupWriterInstalled':False,'productionCronChanged':False,
   'fivePersonBetaReleased':False,
  }
  if EVIDENCE.is_dir():
   receipt=EVIDENCE/'R1T_COMPLETE_ENCRYPTED_DB_VAULT_COLD_RESTORE.json'
   with receipt.open('x') as out:json.dump(report,out,indent=2);out.write('\n')
   receipt.chmod(0o600)
  print(json.dumps({'status':status,'checksPassed':sum(v is True for v in checks.values()),
   'checksTotal':len(checks),'evidence':str(EVIDENCE),'error':error}))
 return 0 if status.endswith('PASS_BETA_HOLD') else 2

if __name__=='__main__':raise SystemExit(main())
