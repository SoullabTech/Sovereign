#!/usr/bin/env python3
"""R70.19I: fixture-only R1W five-volume signed+current-deletion cold restore.

IMPORTANT: R1W GPGV signature, bound SQL-derived Work/key census AND the
external current deletion ledger are verified in THIS executable, BEFORE
any decryption private key operation, Docker new container, or restored file.

Source/destinations are strictly pinned synthetic Mac Studio test paths.
No production/restoration mode. No Mac real R87 recovery key permitted.
"""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time

R7019I_PRODUCTION_RESTORE_ENABLED=False
SCRIPT=Path(__file__).resolve().parent
ROOT=SCRIPT.parent.parent
UUID=re.compile(r'^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
CONTAINER=re.compile(r'^ws-r1v-rest-[a-f0-9]{8}$')
FPR=re.compile(r'^[A-F0-9]{40}$')

def report(state,reason='',**fields):
 print(json.dumps({'status':state,'reason':reason,
  'productionRestoreApproved':False,'privateMemberDataPrinted':False,
  'productionDatabaseOrNASAccessed':False,**fields},sort_keys=True),flush=True)
 return 0 if state=='R7019I_SIGNED_CURRENT_SURVIVOR_PHYSICAL_RESTORE_PASS_BETA_HOLD' else 70

def module(script,name):
 spec=importlib.util.spec_from_file_location(name,str(SCRIPT/script))
 if spec is None or spec.loader is None:raise RuntimeError('MISSING_PINNED_FIXTURE_SCRIPT')
 mod=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(mod)
 return mod

def run(args,timeout=24,env=None,stdin=None):
 try:return subprocess.run(args,capture_output=True,timeout=timeout,env=env,input=stdin,check=False)
 except (OSError,subprocess.TimeoutExpired):return None

def qualify(a):
 if R7019I_PRODUCTION_RESTORE_ENABLED or os.environ.get('R7019I_RESTORE_FIXTURE')!='fictional-only' or not a.fixture:
  raise RuntimeError('DEFAULT_OFF_NO_LIVE_RESTORE')
 if not FPR.fullmatch(a.expected_signer_fingerprint):raise RuntimeError('UNQUALIFIED_GPGV_SIGNER')
 if not CONTAINER.fullmatch(a.destination_container):raise RuntimeError('UNQUALIFIED_RESTORE_CONTAINER')
 signed=Path(a.certified_generation)
 if (not signed.is_absolute() or signed.name!=a.generation or
   not signed.parent.name=='certified' or
   not signed.parent.parent.name.startswith('ws-beta-r1w-r7019i-') or
   signed.parent.parent.parent!=Path('/Volumes/T7 Shield') or
   signed.is_symlink()):raise RuntimeError('WRONG_SIGNED_POINT')
 external=Path(a.external_trust_root)
 if (not external.is_absolute() or
   external.parent!=Path('/private/tmp') or
   not external.name.startswith('r7019i-') or external.is_symlink() or
   external.stat().st_mode&0o777!=0o700):
  raise RuntimeError('EXTERNAL_TRUST_NOT_INDEPENDENT_FIXTURE_DIR')
 restore=Path(a.restore_directory)
 if restore.parent!=signed.parent.parent or restore.name!='signed-restored-files' or restore.exists():
  raise RuntimeError('UNQUALIFIED_RESTORE_DIRECTORY')
 if not UUID.fullmatch(a.expected_member_id):raise RuntimeError('MISSING_EXPECTED_FICTIONAL_MEMBER')
 return signed,external,restore

def sql_roster(docker,name):
 sql=(
 "SELECT coalesce(json_agg(json_build_object("
 "'memberId',m.member_id::text,'workId',m.id::text,'keyId',k.key_id::text)"
 " ORDER BY m.id),'[]'::json)::text FROM member_manuscripts m "
 "JOIN ws_managed_work_key_wrappings_r1q k "
 "ON k.manuscript_id=m.id AND k.member_id=m.member_id;")
 r=run([docker,'exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','ws_fixture','-c',sql],timeout=15)
 if not r or r.returncode or len(r.stdout)>100000:
  raise RuntimeError('RECOVERED_SQL_ROSTER_QUERY_REFUSED')
 return json.loads(r.stdout.decode('utf8').strip())

def main():
 p=argparse.ArgumentParser()
 p.add_argument('--fixture',action='store_true')
 p.add_argument('--certified-generation',required=True)
 p.add_argument('--generation',required=True)
 p.add_argument('--trusted-public-keyring',required=True)
 p.add_argument('--expected-signer-fingerprint',required=True)
 p.add_argument('--external-trust-root',required=True)
 p.add_argument('--private-decryption-home',required=True)
 p.add_argument('--destination-container',required=True)
 p.add_argument('--restore-directory',required=True)
 p.add_argument('--expected-member-id',required=True)
 a=p.parse_args()
 try:signed,external,restore_dir=qualify(a)
 except Exception:return report('R7019I_PREDECRYPT_REFUSED_BETA_HOLD','WRONG_FIXTURE_SCOPE')
 # Signed R1W manifest verification is ALWAYS before Work-census verification.
 # No private key is consulted to do public-key signature verification.
 try:
  r1w=module('wsBetaR1WSignedGeneration.py','r7019i_r1w_public_only')
  verified=r1w.verify_signed(
   signed,Path(a.trusted_public_keyring),a.expected_signer_fingerprint)
  if verified.get('actualManifestSignatureVerified') is not True:
   raise RuntimeError('GPGV_PUBLIC_SIGNER_NOT_ACCEPTED')
 except Exception:
  return report('R7019I_PREDECRYPT_REFUSED_BETA_HOLD','R1W_GPGV_SIGNED_GENERATION_NOT_VALID',
   privateKeyConsulted=False,restoreContainerCreated=False)
 # This tool never imports any archive-supplied trusted public keys or floor.
 try:
  verify=run(['node',str(SCRIPT/'wsBetaR7019IFictionalCensusAuthority.mjs'),
   'verify',str(signed),str(external),a.expected_signer_fingerprint],timeout=20,
   env={'HOME':str(Path.home()),'PATH':os.environ.get('PATH','/usr/bin:/bin'),
       'R7019I_FICTIONAL_AUTHORITY':'fictional-only'})
  if not verify or verify.returncode:
   return report('R7019I_PREDECRYPT_REFUSED_BETA_HOLD',
    'CURRENT_WORK_DELETION_CENSUS_OR_SNAPSHOT_NOT_AUTHORIZED',
    privateKeyConsulted=False,restoreContainerCreated=False)
  accepted=json.loads(verify.stdout)
  if accepted.get('status')!='PREDECRYPT_AUTHORIZED_FICTIONAL_ONLY' or accepted.get('productionApproved') is not False:
   raise RuntimeError('UNEXPECTED_WORK_CENSUS_AUTHORIZATION')
  # Only read this fictional signed roster AFTER successful Ed25519 verification.
  records=json.loads((external/'r7019i-signed-census.json').read_text())['body']['works']
  if not records or len(records)>64 or any(x['memberId']!=a.expected_member_id for x in records):
   raise RuntimeError('WRONG_SIGNED_FICTIONAL_MEMBER_ROSTER')
 except Exception:
  return report('R7019I_PREDECRYPT_REFUSED_BETA_HOLD','SIGNED_WORK_CENSUS_READINESS_REFUSED',
   privateKeyConsulted=False,restoreContainerCreated=False)
 # THIS IS THE FIRST POINT AT WHICH THE PRIVATE KEY MAY BE ACCESSED.
 docker='/usr/local/bin/docker'
 created=False
 clean=False
 passed=False
 failure=None
 stage='private_key_preflight'
 try:
  r1v=module('wsBetaR1VIndependentColdRestore.py','r7019i_verified_restore')
  private=Path(a.private_decryption_home)
  if (not private.is_absolute() or
      private.parent!=external or private.name!='independent_decryption_private'):
   raise RuntimeError('UNQUALIFIED_RESTORE_PRIVATE_KEY_HOME')
  manifest=json.loads((signed/'manifest.json').read_text())
  r1v.verified_private_home(private,manifest['recipientPublicFingerprint'])
  stage='verify_no_prior_pg_container'
  absent=run([docker,'ps','-aq','--filter','name=^/'+a.destination_container+'$'])
  if not absent or absent.returncode or absent.stdout.strip():
   raise RuntimeError('CONFLICTING_RESTORE_CONTAINER')
  stage='start_isolated_pg16'
  spawn=run([docker,'run','--pull','never','--rm','-d','--name',a.destination_container,
   '--label','soullab.fixture=r1v','--network','none','--memory','512m',
   '--cpus','1','--pids-limit','128','--security-opt','no-new-privileges',
   '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
   '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=ws_fixture',
   '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13'],timeout=40)
  if not spawn or spawn.returncode:raise RuntimeError('ISOLATED_PG16_START_FAILED')
  created=True
  for _ in range(48):
   ready=run([docker,'exec',a.destination_container,'pg_isready',
    '-U','fict','-d','ws_fixture'],timeout=5)
   if ready and ready.returncode==0:break
   time.sleep(.25)
  else:raise RuntimeError('PG16_RECOVERY_NOT_READY')
  isolate=run([docker,'inspect','-f',
   '{{.HostConfig.NetworkMode}}|{{len .Mounts}}',
   a.destination_container],timeout=8)
  if not isolate or isolate.returncode or isolate.stdout.strip()!=b'none|0':
   raise RuntimeError('PG16_RESTORE_DESTINATION_NOT_ISOLATED')
  # Only R1V's independently audited GPG and tar restore routines are used.
  stage='actual_pg16_restore'
  r1v.restore_postgres(signed,private,a.destination_container)
  stage='query_restored_sql_roster'
  actual=sql_roster(docker,a.destination_container)
  if actual!=records:raise RuntimeError('SIGNED_AND_RESTORED_WORK_ROSTER_MISMATCH')
  stage='restore_five_file_volumes'
  counts=r1v.restore_files(signed,private,restore_dir,manifest['fileCountsByVolume'])
  if list(sorted(counts))!=list(sorted(manifest['fileCountsByVolume'])) or (
    sum(counts.values())!=sum(manifest['fileCountsByVolume'].values())
  ):raise RuntimeError('FIVE_VOLUME_RESTORE_INCOMPLETE')
  stage='verify_restored_files_against_original_digest'
  expected_hash=(external/'r7019i-original-files-digest.sha256').read_text().strip()
  h=__import__('hashlib').sha256()
  import os as _os
  for file in sorted(restore_dir.rglob('*')):
   if not file.is_file() or file.is_symlink():continue
   relative=file.relative_to(restore_dir).as_posix()
   h.update(relative.encode()+b'\0')
   h.update(__import__('hashlib').sha256(file.read_bytes()).digest())
  if h.hexdigest()!=expected_hash:raise RuntimeError('RESTORED_FILE_DIGESTS_DIFFER_FROM_SOURCE')
  passed=True
 except Exception as e:
  known='R1V_RESTORE_REFUSED_'
  explicit=str(e)
  # Diagnostic is ONLY a fixed internal fixture refusal code, never arbitrary
  # PostgreSQL/stderr bytes, private names, or member file paths.
  if explicit.startswith(known) and len(explicit)<=105 and explicit.replace('_','').isalnum():
   failure=stage+'_'+explicit
  else:failure=stage+'_'+type(e).__name__
 finally:
  if restore_dir.exists():shutil.rmtree(restore_dir,ignore_errors=True)
  if created:run([docker,'rm','-f','-v',a.destination_container],timeout=20)
  verifygone=run([docker,'ps','-aq','--filter','name=^/'+a.destination_container+'$'],timeout=10)
  clean=bool(verifygone and verifygone.returncode==0 and not verifygone.stdout.strip() and not restore_dir.exists())
 if passed and clean:
  return report('R7019I_SIGNED_CURRENT_SURVIVOR_PHYSICAL_RESTORE_PASS_BETA_HOLD','',
   decryptedAfterCurrentDeletionPreflight=True,restoredSQLWorkCount=len(records),
   restoredFiveFileScopes=5,temporaryPlaintextDestroyed=True,
   independentOffHostAuthorityCertified=False)
 return report('R7019I_FICTIONAL_PHYSICAL_RECOVERY_HOLD',failure or 'UNCLEAN_RECOVERY_FIXTURE',
  restored=False,temporaryPlaintextDestroyed=clean)

if __name__=='__main__':raise SystemExit(main())
