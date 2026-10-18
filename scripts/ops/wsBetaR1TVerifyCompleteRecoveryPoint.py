#!/usr/bin/env python3
"""R1T: fixture-only read-only encrypted-generation integrity preflight.
Never decrypts, scans production or certifies SQL/vault snapshot consistency.
One complete directory -> strict fixed manifest + complete ciphertext digest.
"""
import hashlib
import json
import os
import pathlib
import re
import stat
import sys

PROTOCOL='soullab.ws.r1t.complete-encrypted-recovery.fixture.v1'
STATUS='FICTIONAL_DB_AND_VAULT_CIPHERTEXT_COMPLETE_BETA_HOLD'
GENERATION=re.compile(r'\A\d{8}T\d{6}Z-[A-Za-z0-9]{8}\Z')
HEX=re.compile(r'\A[0-9a-f]{64}\Z')

class RecoveryPointRefused(Exception):pass

def reject(reason):raise RecoveryPointRefused(reason)

def private(path,mode=None):
 try:s=path.lstat()
 except FileNotFoundError:reject('MISSING_EXPECTED_SOURCE')
 if stat.S_ISLNK(s.st_mode):reject('SYMLINK_REFUSED')
 if mode is not None and stat.S_IMODE(s.st_mode)!=mode:reject('UNSAFE_PERMISSIONS')
 return s

def digest(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  while True:
   block=f.read(1024*1024)
   if not block:break
   h.update(block)
 return h.hexdigest()

def verify_complete_generation(root:pathlib.Path):
 # Reading from a fixture under T7 is mandatory: this cannot certify a real
 # NAS/local backup and cannot be called as production checkout automation.
 if os.environ.get('WS_R1T_VERIFY_ONLY')!='fictional-only':reject('DEFAULT_OFF')
 if not root.is_absolute() or not str(root).startswith('/Volumes/T7 Shield/ws-beta-r1t-'):
  reject('NOT_FICTIONAL_T7_SOURCE')
 if root.parent.name!='complete' or not GENERATION.fullmatch(root.name):
  reject('BAD_COMPLETE_GENERATION_SCOPE')
 evidence=root.parent.parent
 for item in (pathlib.Path('/Volumes/T7 Shield'),evidence,root.parent,root):
  st=private(item)
  if not stat.S_ISDIR(st.st_mode):reject('EXPECTED_DIRECTORY')
 if stat.S_IMODE(root.stat().st_mode)!=0o700:reject('GENERATION_NOT_PRIVATE')
 if str(root.resolve())!=str(root):reject('SYMLINK_COMPONENT_REFUSED')
 expected={'postgres.pgdump.gpg','vault.tar.gpg','manifest.json'}
 if {p.name for p in root.iterdir()}!=expected:reject('INCOMPLETE_OR_EXTRA_ARTIFACTS')
 manifest_path=root/'manifest.json'
 st=private(manifest_path,0o600)
 if not stat.S_ISREG(st.st_mode) or st.st_size>16384 or st.st_size<300:
  reject('MANIFEST_INVALID_SIZE')
 try:data=json.loads(manifest_path.read_bytes().decode('utf-8'))
 except (ValueError,UnicodeError):reject('MANIFEST_INVALID_JSON')
 if not isinstance(data,dict):reject('MANIFEST_INVALID_OBJECT')
 if data.get('protocol')!=PROTOCOL or data.get('status')!=STATUS or data.get('generation')!=root.name:
  reject('MANIFEST_NOT_MATCHING_REVIEW_SCOPE')
 if data.get('source')!='ONE_DISPOSABLE_POSTGRES_AND_TWO_OR_MORE_SYNTHETIC_FILES':
  reject('NOT_FICTIONAL_SOURCE')
 held=['productionSnapshotCoherenceVerified','productionSqlWalCovered','actualVaultAttachmentScopeVerified',
       'offHostRecoveryKeyProven','deletedWorkNonresurrectionCertified',
       'productionCutoverApproved','realMemberBetaApproved']
 if any(data.get(k) is not False for k in held):reject('FALSE_RELEASE_CLAIM_IN_MANIFEST')
 for name,filename in (('postgres','postgres.pgdump.gpg'),('vault','vault.tar.gpg')):
  obj=data.get(name)
  if not isinstance(obj,dict) or set(obj)!={'file','sha256','bytes'}:
   reject('CIPHERTEXT_MANIFEST_FIELDS')
  if obj.get('file')!=filename or not isinstance(obj.get('sha256'),str) or not HEX.fullmatch(obj['sha256']):
   reject('BAD_CIPHERTEXT_NAME_OR_SHA')
  archive=root/filename
  info=private(archive,0o600)
  if not stat.S_ISREG(info.st_mode) or info.st_size<=100 or isinstance(obj.get('bytes'),bool) or obj.get('bytes')!=info.st_size:
   reject('CIPHERTEXT_MISSING_OR_SIZE_MISMATCH')
  with archive.open('rb') as f:prefix=f.read(24)
  if prefix.startswith((b'PGDMP',b'\x1f\x8b',b'R1T_FICTIONAL_')):
   reject('CIPHERTEXT_IS_PLAINTEXT')
  if digest(archive)!=obj['sha256']:reject('CIPHERTEXT_SHA_MISMATCH')
 return {'status':'R1T_FICTIONAL_COMPLETE_ENCRYPTED_POINT_INTEGRITY_PASS_BETA_HOLD',
   'verifiedGeneration':root.name,'artifacts':3,'ciphertextIntegrityChecks':2,
   'cryptographicManifestSignatureVerified':False,'independentKmsRestoreVerified':False,
   'snapshotCoherenceVerified':False,'productionCutoverApproved':False}

def main():
 if len(sys.argv)!=2:
  print('R1T_VERIFY_REFUSED_REQUIRED_EXACT_GENERATION_PATH',file=sys.stderr)
  return 70
 try:r=verify_complete_generation(pathlib.Path(sys.argv[1]))
 except RecoveryPointRefused as e:
  print('R1T_VERIFY_REFUSED_'+str(e),file=sys.stderr)
  return 70
 except (OSError,PermissionError):
  print('R1T_VERIFY_REFUSED_UNAVAILABLE_SOURCE',file=sys.stderr)
  return 70
 print(json.dumps(r,sort_keys=True))
 return 0
if __name__=='__main__':raise SystemExit(main())
