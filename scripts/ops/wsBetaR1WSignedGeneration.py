#!/usr/bin/env python3
"""R1W fixture-only independently signed encrypted recovery generations.

Signer is a separate command/custody identity from the encrypted backup writer.
Signatures use a PINNED signer fingerprint and externally supplied public
GPGV keyring. A recovery point is CERTIFIED only once both ciphertext digests,
its honest R1V scope manifest, and a detached signature all verify.
This fixture is NOT an operational trust anchor or production/cutover approval.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile

PRODUCTION_SIGNED_GENERATION_RELEASED=False
MANIFEST='manifest.json'
ARCHIVES=('postgres.pgdump.gpg','files.tar.gpg')
FILES=set((*ARCHIVES,MANIFEST,'manifest.sig'))
FPR=re.compile(r'^[A-F0-9]{40}$')
GEN=re.compile(r'^\d{8}T\d{6}Z-[a-f0-9]{8}$')
SIGNED_STATUS='soullab.ws.r1w.signed-encrypted-point.fixture-only.held.v1'

class Refusal(Exception):pass

def refuse(reason):raise Refusal('R1W_SIGNED_POINT_REFUSED_'+reason)

def strict(p:Path,folder:bool=False,permission:int|None=None):
 try:s=p.lstat()
 except OSError:refuse('MISSING_PATH')
 if stat.S_ISLNK(s.st_mode):refuse('SYMLINK_REFUSED')
 if folder and not stat.S_ISDIR(s.st_mode):refuse('DIR_REQUIRED')
 if not folder and not stat.S_ISREG(s.st_mode):refuse('FILE_REQUIRED')
 if permission is not None and stat.S_IMODE(s.st_mode)!=permission:refuse('MODE_UNSAFE')
 return s

def digest(p:Path)->str:
 h=hashlib.sha256()
 with p.open('rb') as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()

def run(argv:list[str],timeout:int=15):
 try:p=subprocess.run(argv,capture_output=True,timeout=timeout)
 except subprocess.TimeoutExpired:refuse('COMMAND_TIMEOUT')
 if p.returncode:refuse('SIGNATURE_OPERATION_UNAVAILABLE')
 return p.stdout

def root_in_t7(path:Path, prefix:str):
 mount=Path('/Volumes/T7 Shield')
 if path.parent!=mount or not path.name.startswith(prefix) or path.resolve()!=path:
  refuse('NOT_EXCLUSIVE_TEST_ROOT')
 strict(path,folder=True,permission=0o700)

def accepted_r1v_source(path:Path):
 if path.parent.name!='complete' or not GEN.fullmatch(path.name):
  refuse('NOT_R1V_COMPLETED_POINT')
 root_in_t7(path.parent.parent,'ws-beta-r1v-')
 strict(path.parent,folder=True,permission=0o700)
 strict(path,folder=True,permission=0o700)
 if set(p.name for p in path.iterdir())!=set((*ARCHIVES,MANIFEST)):
  refuse('UNQUALIFIED_R1V_SOURCE')
 # No imports from the member database; this verifier reuses the R1V source-law
 # for exact file/volume hashes and all nine release-claim flags false.
 import_path=Path(__file__).with_name('wsBetaR1VIndependentColdRestore.py')
 spec=importlib.util.spec_from_file_location('r1v_signed_source_check',import_path)
 assert spec and spec.loader
 module=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(module)
 try:data=module.safe_manifest(path)
 except module.Refusal:refuse('R1V_SOURCE_PRECHECK_FAILED')
 for n in ARCHIVES:
  if strict(path/n,permission=0o600).st_size>10*1024*1024:
   refuse('FIXTURE_CIPHERTEXT_TOO_LARGE')
 return data

def validated_public_keyring(keyring:Path,root:Path):
 if (not keyring.is_absolute() or keyring.resolve()!=keyring or
     keyring.parent==root or str(keyring).startswith(str(root)+'/')):
  refuse('VERIFIER_PUBLIC_TRUST_NOT_INDEPENDENT')
 if strict(keyring,permission=0o600).st_size>32768:
  refuse('PUBLIC_KEYRING_TOO_LARGE')

def verify_signed(path:Path,keyring:Path,expected_fpr:str,staging:bool=False):
 if not FPR.fullmatch(expected_fpr):refuse('UNPINNED_SIGNER_IDENTITY')
 root=path.parent.parent if not staging else path.parent
 root_in_t7(root,'ws-beta-r1w-')
 validated_public_keyring(keyring,root)
 if not staging and (path.parent.name!='certified' or not GEN.fullmatch(path.name)):
  refuse('NOT_A_CERTIFIED_GENERATION')
 if not staging:strict(path.parent,folder=True,permission=0o700)
 strict(path,folder=True,permission=0o700)
 if {x.name for x in path.iterdir()}!=FILES:
  refuse('INCOMPLETE_SIGNED_RECOVERY_POINT')
 manifest=path/MANIFEST
 if not 350<=strict(manifest,permission=0o600).st_size<=20000:
  refuse('INVALID_MANIFEST_SIZE')
 try:d=json.loads(manifest.read_text())
 except (ValueError,UnicodeError):refuse('MANIFEST_NOT_VALID_JSON')
 if d.get('protocol')!='soullab.ws.r1v.minisforum.complete-encrypted-recovery.fixture.v1' or d.get('status')!='FICTIONAL_COMPLETE_DB_AND_FIVE_FILE_VOLUMES_BETA_HOLD':
  refuse('INVALID_MANIFEST_OR_RELEASE_SCOPE')
 generation=d.get('generation','')
 if not isinstance(generation,str) or not GEN.fullmatch(generation):
  refuse('BAD_SIGNED_GENERATION_ID')
 if not staging and generation!=path.name:
  refuse('SIGNED_GENERATION_REPLAY_REFUSED')
 if d.get('manifestIndependentlySigned') is not False or d.get('productionCronCutoverApproved') is not False or d.get('realMemberWriterBetaApproved') is not False:
  refuse('FORGED_MANIFEST_GO_FLAG')
 if d.get('fileVolumeNames')!=['media','vault','voice-notes','workbench','audit-logs']:
  refuse('UNEXPECTED_FILE_SCOPE')
 for member,filename in [('postgres','postgres.pgdump.gpg'),('fileVault','files.tar.gpg')]:
  desc=d.get(member)
  if not isinstance(desc,dict) or set(desc)!={'file','bytes','sha256'} or desc.get('file')!=filename:
   refuse('UNQUALIFIED_ARTIFACT_DESCRIPTOR')
  content=path/filename
  s=strict(content,permission=0o600)
  if s.st_size<128 or s.st_size>10*1024*1024 or type(desc.get('bytes')) is not int or s.st_size!=desc['bytes']:
   refuse('WRONG_CIPHERTEXT_SIZE')
  if digest(content)!=desc.get('sha256'):
   refuse('CHANGED_CIPHERTEXT')
  with content.open('rb') as inp:
   if inp.read(8).startswith((b'PGDMP',b'R1V_',b'\x1f\x8b')):refuse('NOT_ENCRYPTED_CIPHERTEXT')
 sig=path/'manifest.sig'
 if not 50 <= strict(sig,permission=0o600).st_size<=8192:
  refuse('BAD_DETACHED_SIGNATURE')
 command=['gpgv','--status-fd','1','--keyring',str(keyring),str(sig),str(manifest)]
 try:p=subprocess.run(command,capture_output=True,timeout=14)
 except subprocess.TimeoutExpired:refuse('SIGNATURE_VERIFICATION_TIMEOUT')
 if p.returncode:refuse('DETACHED_SIGNATURE_INVALID')
 verified=[]
 for line in p.stdout.decode(errors='replace').splitlines():
  parts=line.split()
  if len(parts)>2 and parts[:2]==['[GNUPG:]','VALIDSIG']:
   verified.append(parts[2].upper())
 if verified!=[expected_fpr]:refuse('SIGNER_FINGERPRINT_MISMATCH')
 return {'protocol':SIGNED_STATUS,'status':'R1W_SIGNED_DB_AND_FIVE_FILE_POINT_VERIFIED_BETA_HOLD',
         'generation':generation,'signerFingerprint':expected_fpr,
         'actualManifestSignatureVerified':True,'productionKeyCustodyQualified':False,
         'productionSnapshotCoherenceQualified':False,'productionReleaseApproved':False,
         'independentOffhostEvidenceRetained':False,'ciphertextArchives':2}

def certify(source:Path,root:Path,signing_home:Path,keyring:Path,fpr:str,fail_stage:str):
 if not FPR.fullmatch(fpr):refuse('INVALID_EXPECTED_SIGNING_IDENTITY')
 root_in_t7(root,'ws-beta-r1w-')
 qualified=accepted_r1v_source(source)
 if (not signing_home.is_absolute() or signing_home.resolve()!=signing_home or
     signing_home.parent in (root,source.parent.parent) or
     str(signing_home).startswith('/Volumes/T7 Shield/')):
  refuse('SIGNER_PRIVATE_HOME_NOT_SEPARATE')
 strict(signing_home,folder=True,permission=0o700)
 private=run(['gpg','--batch','--homedir',str(signing_home),'--with-colons','--list-secret-keys',fpr])
 if not any(x.startswith('fpr:') and x.split(':')[9].upper()==fpr for x in private.decode().splitlines() if len(x.split(':'))>9):
  refuse('UNAUTHORIZED_SIGNER_PRIVATE_KEY')
 # Both encryption and signer-private homes are outside the source and target;
 # never derive signer trust from the backup's embedded manifest or signature.
 validated_public_keyring(keyring,root)
 dest=root/'certified'
 if not dest.exists():dest.mkdir(mode=0o700)
 strict(dest,folder=True,permission=0o700)
 final=dest/source.name
 if final.exists():refuse('NO_OVERWRITE_SIGNED_GENERATION')
 pending=Path(tempfile.mkdtemp(prefix='.r1w.pending.',dir=root))
 try:
  strict(pending,folder=True,permission=0o700)
  for name in (*ARCHIVES,MANIFEST):
   shutil.copyfile(source/name,pending/name)
   (pending/name).chmod(0o600)
   if digest(source/name)!=digest(pending/name):refuse('CHANGED_DURING_SIGNING_COPY')
  if fail_stage=='after_copy':refuse('INJECTED_BEFORE_ATTESTATION')
  signature=pending/'manifest.sig'
  run(['gpg','--batch','--yes','--no-tty','--pinentry-mode','loopback','--homedir',str(signing_home),
       '--local-user',fpr,'--detach-sign','--output',str(signature),str(pending/MANIFEST)],timeout=25)
  signature.chmod(0o600)
  if fail_stage=='after_sign':refuse('INJECTED_AFTER_SIGN_BEFORE_PUBLISH')
  result=verify_signed(pending,keyring,fpr,staging=True)
  # Source bytes must still match immediately before publish to resist a
  # partly replaced unsigned generation during external-signature work.
  for name in (*ARCHIVES,MANIFEST):
   if digest(source/name)!=digest(pending/name):refuse('UNSIGNED_SOURCE_CHANGED_DURING_ATTESTATION')
  if fail_stage=='before_publish':refuse('INJECTED_BEFORE_CERTIFICATION')
  os.rename(pending,final)
  pending=None
  return result
 finally:
  if pending is not None and pending.exists():shutil.rmtree(pending)

def main():
 p=argparse.ArgumentParser()
 p.add_argument('--certify-fixture',action='store_true')
 p.add_argument('--verify-fixture',action='store_true')
 p.add_argument('--source-generation',default='')
 p.add_argument('--certified-root',default='')
 p.add_argument('--certified-generation',default='')
 p.add_argument('--signer-private-home',default='')
 p.add_argument('--trusted-public-keyring',default='')
 p.add_argument('--expected-signer-fingerprint',default='')
 p.add_argument('--fail-stage',default='')
 a=p.parse_args()
 if os.environ.get('WS_R1W_SIGNED_FIXTURE_ONLY')!='fictional-only' or (a.certify_fixture==a.verify_fixture):
  print('R1W_SIGNED_POINT_REFUSED_DEFAULT_OFF',file=sys.stderr);return 70
 try:
  fpr=a.expected_signer_fingerprint.upper()
  pub=Path(a.trusted_public_keyring)
  if a.verify_fixture:result=verify_signed(Path(a.certified_generation),pub,fpr)
  else:
   if a.fail_stage not in ('','after_copy','after_sign','before_publish'):refuse('INVALID_INJECTED_STAGE')
   result=certify(Path(a.source_generation),Path(a.certified_root),Path(a.signer_private_home),pub,fpr,a.fail_stage)
  print(json.dumps(result,sort_keys=True));return 0
 except Refusal as e:
  print(str(e),file=sys.stderr);return 70
if __name__=='__main__':raise SystemExit(main())
