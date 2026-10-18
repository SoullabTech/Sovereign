#!/usr/bin/env python3
"""R1W genuine PG16 + five-volume SIGNED cold-restore rehearsal.

R1V encrypts two invented SQL rows plus six fake files using a PUBLIC ONLY
OpenPGP encryption key. A separate signer signs/certifies both ciphertext
checksums. Source DB and vault are destroyed. Independent new PG16 and all 5
file scopes restore ONLY after pinned signer GPGV verification.
No real data, SSH, NAS, AWS, production keys, cron, or commercial API.
"""
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime,timezone

import wsBetaR1VFiveVolumeRestorePG16 as r1v

ROOT=Path(__file__).resolve().parents[2]
SOURCE_ROOT=Path(os.environ.get('R1W_PHYSICAL_UNSIGNED_SOURCE','/not-a-fixture'))
CERTIFIED_ROOT=Path(os.environ.get('R1W_PHYSICAL_SIGNED_DESTINATION','/not-a-fixture'))
KROOT=None
CHECKS={}
METRICS={}
PARENT_R1V='764d6fbd5b283efcda22896525d71e7c051bbddb'
SIGN=ROOT/'scripts/ops/wsBetaR1WSignedGeneration.py'
RESTORE=ROOT/'scripts/ops/wsBetaR1WSignedIndependentColdRestore.py'

def prove(label,value):
 CHECKS[label]=bool(value)
 if not value:raise RuntimeError('R1W_TEST_FAILURE_'+label)

def direct_t7(path:Path,prefix:str):
 return path.parent==Path('/Volumes/T7 Shield') and path.name.startswith(prefix) and not path.exists()

def env(values):
 return {'HOME':str(Path.home()),
         'PATH':'/Users/soullab/.nvm/versions/node/v22.22.3/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
         **values}

def command(args,envvars=None,timeout=40,check=True,input_bytes=None):
 p=subprocess.run(args,cwd=ROOT,env=envvars,input=input_bytes,
   capture_output=True,text=input_bytes is None,timeout=timeout)
 if check and p.returncode:
  msg=(p.stderr.decode(errors='replace') if isinstance(p.stderr,bytes) else p.stderr)
  raise RuntimeError('R1W_TEST_SUBPROCESS_FAILURE_'+Path(args[0]).name+'_'+msg[-160:])
 return p

def unique_gpg(home:Path,uid:str,purpose:str):
 cmd=['gpg','--batch','--homedir',str(home),'--pinentry-mode','loopback',
      '--passphrase','','--quick-generate-key',uid,
      'ed25519' if purpose=='sign' else 'rsa2048',purpose,'0']
 command(cmd,timeout=60)
 out=command(['gpg','--batch','--homedir',str(home),'--with-colons','--list-keys',uid]).stdout
 fps=[p[9] for line in out.splitlines() if (p:=line.split(':'))[0]=='fpr' and len(p)>9 and re.fullmatch(r'[A-F0-9]{40}',p[9])]
 prove('separate_'+purpose+'_private_signing_fingerprint_created',len(fps)==1)
 return fps[0]

def perform():
 global KROOT
 prove('fixture_only_requested',os.environ.get('R1W_SIGNED_PHYSICAL_FIXTURE')=='fictional-only')
 prove('fresh_R1V_synthetic_data_root',direct_t7(SOURCE_ROOT,'ws-beta-r1v-r1w-'))
 prove('fresh_R1W_signed_certification_root',direct_t7(CERTIFIED_ROOT,'ws-beta-r1w-'))
 head=command(['git','rev-parse','HEAD']).stdout.strip()
 expected={
  'scripts/ops/wsBetaR1WSignedGeneration.py',
  'scripts/ops/wsBetaR1WSignedIndependentColdRestore.py',
  'scripts/ops/wsBetaR1WSignedGenerationTamperFixture.py',
  'scripts/ops/wsBetaR1WSignedColdRestorePG16.py',
  'scripts/ops/__tests__/wsBetaR1WSignedRecoverySafety.test.cjs',
  'docs/ops/WS_BETA_R1W_INDEPENDENT_SIGNED_RECOVERY_POINT_20261018.md',
 }
 if head==PARENT_R1V:
  untracked=set(command(['git','ls-files','--others','--exclude-standard']).stdout.splitlines())
  prove('exact_six_reviewed_untracked_source_paths',untracked==expected)
  prove('no_unreviewed_tracked_changes',not command(['git','diff','--name-only']).stdout.strip())
 else:
  parent=command(['git','rev-parse','HEAD^']).stdout.strip()
  changed=set(command(['git','show','--pretty=format:','--name-only','HEAD']).stdout.splitlines())
  prove('pinned_immediate_R1V_parent_commit_and_exact_six_paths',parent==PARENT_R1V and changed==expected)
  prove('source_commit_clean',not command(['git','status','--porcelain']).stdout.strip())
 prove('review_signer_and_restore_source_available',SIGN.is_file() and RESTORE.is_file())
 # Strictly synthetic PG fixture. Never contacts remote service, even when
 # local GPG private key exists in test root outside both backup directories.
 SOURCE_ROOT.mkdir(mode=0o700)
 CERTIFIED_ROOT.mkdir(mode=0o700)
 KROOT=Path(tempfile.mkdtemp(prefix='r1w-physical-',dir='/private/tmp')).resolve()
 recovery=KROOT/'independent_decryption_private';recovery.mkdir(mode=0o700)
 writer=KROOT/'backup_writer_encryption_public_only';writer.mkdir(mode=0o700)
 signer=KROOT/'independent_signature_private';signer.mkdir(mode=0o700)
 verifier=KROOT/'signature_public_pin_only';verifier.mkdir(mode=0o700)
 recovery_fpr=unique_gpg(recovery,'R1W Fictional Encryption Recipient <r1w-fixture.invalid>','encr')
 signer_fpr=unique_gpg(signer,'R1W Fictional Independent Signer <sign-fixture.invalid>','sign')
 prove('recovery_and_signer_fingerprints_distinct',recovery_fpr!=signer_fpr)
 for priv,public,identity in [(recovery,writer,recovery_fpr),(signer,verifier,signer_fpr)]:
  p=subprocess.run(['gpg','--batch','--homedir',str(priv),'--export',identity],capture_output=True,timeout=15)
  prove('exported_trusted_public_'+('recovery' if priv==recovery else 'signer'),p.returncode==0 and len(p.stdout)>100)
  if priv==recovery:
   command(['gpg','--batch','--homedir',str(public),'--import'],input_bytes=p.stdout,timeout=15)
  else:
   (public/'trusted-signers.gpg').write_bytes(p.stdout)
   (public/'trusted-signers.gpg').chmod(0o600)
 pubcheck=command(['gpg','--batch','--homedir',str(writer),'--with-colons','--list-secret-keys']).stdout
 prove('backup_writer_has_no_decryption_private_key','sec:' not in pubcheck)
 signed_pub=verifier/'trusted-signers.gpg'
 # Reuse unchanged pinned R1V physical fixture setup to avoid creating any
 # new producer capable of reaching a real PostgreSQL or user file volume.
 r1v.EVIDENCE=SOURCE_ROOT
 original=r1v.source_roots()
 r1v.start_pg(r1v.SRC)
 r1v.docker('exec',r1v.SRC,'psql','-v','ON_ERROR_STOP=1','-U','fict','-d','ws_fixture',
    '-c',"CREATE TABLE fictional_works(id integer PRIMARY KEY,body text NOT NULL); INSERT INTO fictional_works VALUES(1,'R1W_FICTIONAL_ALCHEMY_CANDLE'),(2,'R1W_FICTIONAL_ALCHEMY_LANTERN');")
 proof=r1v.docker('exec',r1v.SRC,'psql','-XAtq','-U','fict','-d','ws_fixture','-c','SELECT COUNT(*) FROM fictional_works')
 prove('two_real_fictional_pg16_source_rows',proof.stdout.strip()=='2')
 writer_env=r1v.writer_env(writer,recovery_fpr)
 candidate=command(r1v.writer_cmd(writer,recovery_fpr),envvars=writer_env,timeout=90)
 data=json.loads(candidate.stdout)
 unsigned=SOURCE_ROOT/'complete'/data['generation']
 prove('R1V_produced_two_encrypted_unsigned_components',data['encryptedArchives']==2 and unsigned.is_dir())
 certify_env=env({'WS_R1W_SIGNED_FIXTURE_ONLY':'fictional-only'})
 certify_cmd=['/usr/bin/python3',str(SIGN),'--certify-fixture',
   '--source-generation',str(unsigned),'--certified-root',str(CERTIFIED_ROOT),
   '--signer-private-home',str(signer),
   '--trusted-public-keyring',str(signed_pub),
   '--expected-signer-fingerprint',signer_fpr]
 certified=command(certify_cmd,envvars=certify_env,timeout=35)
 cert=json.loads(certified.stdout)
 prove('independent_signer_accepted_exact_encrypted_db_and_files',cert['actualManifestSignatureVerified'])
 signedpoint=CERTIFIED_ROOT/'certified'/data['generation']
 prove('signed_generation_published_only_after_pinned_verification',signedpoint.is_dir() and len(list(signedpoint.iterdir()))==4)
 verify_cmd=['/usr/bin/python3',str(SIGN),'--verify-fixture','--certified-generation',str(signedpoint),
  '--trusted-public-keyring',str(signed_pub),'--expected-signer-fingerprint',signer_fpr]
 reverified=command(verify_cmd,envvars=certify_env)
 prove('separate_signature_verification_before_decrypt',json.loads(reverified.stdout)['actualManifestSignatureVerified'])
 # Cannot open any recovery DB under wrong signing witness or missing trust.
 restore_cmd=['/usr/bin/python3',str(RESTORE),'--fixture','--certified-generation',str(signedpoint),
  '--trusted-public-keyring',str(signed_pub),'--expected-signer-fingerprint',signer_fpr,
  '--private-decryption-home',str(recovery),'--destination-container',r1v.DST,
  '--restore-directory',str(CERTIFIED_ROOT/'signed-restored-files')]
 restore_env=env({'WS_R1W_RESTORE_FIXTURE_ONLY':'fictional-only'})
 wrong_pin=list(restore_cmd)
 wrong_pin[wrong_pin.index(signer_fpr)]='0'*40
 bad=command(wrong_pin,envvars=restore_env,check=False)
 prove('unsigned_or_wrong_signer_cannot_access_restore',bad.returncode==70 and not (CERTIFIED_ROOT/'signed-restored-files').exists())
 wrong_key=list(restore_cmd)
 wrong_key[wrong_key.index(str(recovery))]=str(KROOT/'not-issued')
 bad=command(wrong_key,envvars=restore_env,check=False)
 prove('no_decryption_private_key_cannot_restore',bad.returncode==70 and not (CERTIFIED_ROOT/'signed-restored-files').exists())
 # Fake point of no return: destroy both real fictional source DB and all
 # five fake source file volumes before starting a fresh independent target.
 r1v.docker('stop','--time','4',r1v.SRC,timeout=20)
 r1v.CONTAINERS.remove(r1v.SRC)
 gone=r1v.docker('ps','-aq','--filter','name=^/'+r1v.SRC+'$')
 for _ in range(30):
  if not gone.stdout.strip():break
  import time
  time.sleep(.1)
  gone=r1v.docker('ps','-aq','--filter','name=^/'+r1v.SRC+'$')
 prove('source_postgres_destroyed_before_signed_restore',not gone.stdout.strip())
 shutil.rmtree(SOURCE_ROOT/'fictional-sources')
 prove('all_original_five_file_volumes_destroyed_before_signed_restore',not (SOURCE_ROOT/'fictional-sources').exists())
 r1v.start_pg(r1v.DST)
 final=command(restore_cmd,envvars=restore_env,timeout=130)
 accepted=json.loads(final.stdout)
 prove('signed_restore_separate_executable_passed',accepted['signatureVerifiedBeforeDecrypt'] and accepted['postgresRestored'])
 rows=r1v.docker('exec',r1v.DST,'psql','-XAtq','-U','fict','-d','ws_fixture',
   '-c',"SELECT COUNT(*)=2 AND COUNT(*) FILTER (WHERE body LIKE 'R1W_FICTIONAL_ALCHEMY_%')=2 FROM fictional_works")
 prove('two_fictional_rows_exactly_restored',rows.stdout.strip()=='t')
 restored_root=CERTIFIED_ROOT/'signed-restored-files'
 restored={str(p.relative_to(restored_root)):r1v.fingerprint(p) for p in restored_root.rglob('*') if p.is_file()}
 prove('all_six_source_files_exactly_restored',restored==original)
 prove('all_five_volumes_recovered',len({p.split('/')[0] for p in restored})==5)
 shutil.rmtree(restored_root)
 prove('restored_plaintext_removed_after_validation',not restored_root.exists())
 METRICS.update({'fictionalDatabaseRows':2,'syntheticVolumeCount':5,'syntheticFileCount':6,
                 'signatureKind':'Ed25519 detached OpenPGP','signerKeySeparateFromEncryptionKey':True,
                 'signedGeneration':data['generation']})

def main():
 global KROOT
 state='R1W_FICTIONAL_SIGNED_COLD_RESTORE_HOLD'
 err=None
 try:
  perform();state='R1W_FICTIONAL_SIGNED_FULL_DB_FIVE_VOLUME_COLD_RESTORE_PASS_BETA_HOLD'
 except Exception as e:
  err=type(e).__name__+':'+str(e)[:220]
 finally:
  for name in list(r1v.CONTAINERS):
   r1v.docker('rm','-f','-v',name,timeout=18,check=False)
  if KROOT is not None and KROOT.exists():shutil.rmtree(KROOT,ignore_errors=True)
  CHECKS['independent_test_signer_and_recovery_private_keyrings_destroyed']=KROOT is not None and not KROOT.exists()
  CHECKS['all_disposable_pg_containers_removed']=all(not r1v.docker('ps','-aq','--filter','name=^/'+n+'$',timeout=10,check=False).stdout.strip() for n in [r1v.SRC,r1v.DST])
  if not all(CHECKS.values()):state='R1W_FICTIONAL_SIGNED_RESTORE_CLEANUP_FAILURE_HOLD'
  report={'protocol':'soullab.ws.r1w.fictional.signed-cold-restore.v1','status':state,
    'sourceHead':subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,text=True,capture_output=True).stdout.strip(),
    'checks':CHECKS,'metrics':METRICS,'error':err,
    'certifiedSourcePath':str(CERTIFIED_ROOT),
    'realOffHostSignerAndKeyCustodyProven':False,
    'productionDatabaseOrMemberFilesAccessed':False,
    'sqlAndVaultSnapshotCoherenceProven':False,
    'productionBackupCutoverAllowed':False,'fiveMemberBetaReleased':False,
    'utc':datetime.now(timezone.utc).isoformat()}
  if CERTIFIED_ROOT.is_dir():
   p=CERTIFIED_ROOT/'R1W_FICTIONAL_SIGNED_FULL_COLD_RESTORE.json'
   with p.open('x') as f:json.dump(report,f,indent=2);f.write('\n')
   p.chmod(0o600)
  print(json.dumps({'status':state,'checksPassed':sum(CHECKS.values()),
    'checksTotal':len(CHECKS),'error':err,'signingEvidence':str(CERTIFIED_ROOT)}))
 return 0 if state.endswith('PASS_BETA_HOLD') else 2
if __name__=='__main__':raise SystemExit(main())
