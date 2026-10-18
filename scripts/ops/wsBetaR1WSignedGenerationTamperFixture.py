#!/usr/bin/env python3
"""R1W GPGV trusted public key signer pin + encrypted-point tamper tests.
No private recovery key, SQL, production/SSH/NAS or real data is accessed.
Changes only copied fictional encrypted recovery points, and cleans them.
"""
from pathlib import Path
from hashlib import sha256
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import tempfile

BASE=Path(os.environ.get('R1W_NEGATIVE_FIXTURE_ROOT','/invalid'))
SIGNED=BASE/'certified'
TOOL=Path(__file__).with_name('wsBetaR1WSignedGeneration.py')
TRUST=Path(os.environ.get('R1W_TRUSTED_PUBLIC_KEYRING','/invalid'))
FPR=os.environ.get('R1W_EXPECTED_SIGNER_FPR','')
SRC=Path(os.environ.get('R1W_R1V_UNSIGNED_SOURCE','/invalid'))
SIGNER_HOME=Path(os.environ.get('R1W_SIGNER_PRIVATE_HOME','/invalid'))
assert os.environ.get('R1W_SIGNED_NEGATIVE_FIXTURE')=='fictional-only'
assert BASE.parent==Path('/Volumes/T7 Shield') and BASE.name.startswith('ws-beta-r1w-')
assert SIGNED.is_dir() and TOOL.is_file()
assert re.fullmatch(r'[A-F0-9]{40}',FPR)
existing=[p for p in SIGNED.iterdir() if p.is_dir()]
assert len(existing)==1,'one genuinely signed source point required'
ORIGINAL=existing[0]
SOURCE_SHA={p.name:sha256(p.read_bytes()).hexdigest() for p in ORIGINAL.iterdir() if p.is_file()}
CHECKS=[]

def checked(name,ok):
 assert ok,name
 CHECKS.append(name)

def verify(path, fpr=FPR, trust=TRUST, valid=True, expected=''):
 env={'HOME':str(Path.home()),'PATH':os.environ.get('PATH','/usr/bin:/bin'),
      'WS_R1W_SIGNED_FIXTURE_ONLY':'fictional-only'}
 args=['/usr/bin/python3',str(TOOL),'--verify-fixture','--certified-generation',str(path),
       '--trusted-public-keyring',str(trust),'--expected-signer-fingerprint',fpr]
 p=subprocess.run(args,env=env,capture_output=True,text=True,timeout=18)
 if valid:
  checked('verified_'+path.parent.parent.name,p.returncode==0 and 'SIGNATURE_VERIFIED' not in p.stderr and json.loads(p.stdout)['actualManifestSignatureVerified'])
 else:
  checked(expected or 'forged_point_denied',p.returncode==70 and 'REFUSED_' in p.stderr)
 return p

verify(ORIGINAL)
for stage in ('after_copy','after_sign','before_publish'):
 root=Path('/Volumes/T7 Shield/ws-beta-r1w-negative-'+secrets.token_hex(5))
 root.mkdir(mode=0o700)
 try:
  cmd=['/usr/bin/python3',str(TOOL),'--certify-fixture','--source-generation',str(SRC),
       '--certified-root',str(root),'--signer-private-home',str(SIGNER_HOME),
       '--trusted-public-keyring',str(TRUST),'--expected-signer-fingerprint',FPR,
       '--fail-stage',stage]
  e={'HOME':str(Path.home()),'PATH':os.environ.get('PATH','/usr/bin:/bin'),
     'WS_R1W_SIGNED_FIXTURE_ONLY':'fictional-only'}
  p=subprocess.run(cmd,env=e,capture_output=True,text=True,timeout=32)
  checked('injected_'+stage+'_cannot_publish',p.returncode==70 and 'INJECTED_' in p.stderr)
  checked('injected_'+stage+'_no_certified_generation',not list((root/'certified').glob('*')) if (root/'certified').exists() else True)
  checked('injected_'+stage+'_no_pending_ciphertext',not list(root.glob('.r1w.pending.*')))
 finally:shutil.rmtree(root)

# Verified negative checks on fresh copied signed points. The original stays
# intact and signed, and the copied roots are deleted after each attempt.
def case(name,change):
 root=Path('/Volumes/T7 Shield/ws-beta-r1w-negative-'+secrets.token_hex(5))
 root.mkdir(mode=0o700)
 target=root/'certified'/ORIGINAL.name
 target.parent.mkdir(mode=0o700)
 shutil.copytree(ORIGINAL,target)
 target.chmod(0o700)
 for p in target.iterdir():p.chmod(0o600)
 try:
  change(target)
  verify(target,valid=False,expected=name+'_refused')
 finally:shutil.rmtree(root)

case('missing_manifest',lambda p:(p/'manifest.json').unlink())
case('missing_signed_receipt',lambda p:(p/'manifest.sig').unlink())
case('extra_unsigned_bundle_data',lambda p:(p/'content.txt').write_text('FICTIONAL_CANARY'))
case('altered_manifest_false_claim',lambda p:(p/'manifest.json').write_text((p/'manifest.json').read_text().replace('"productionCronCutoverApproved": false','"productionCronCutoverApproved": true')))

def flip(path):
 b=bytearray(path.read_bytes());b[len(b)//2]^=1;path.write_bytes(b)
case('modified_db_ciphertext',lambda p:flip(p/'postgres.pgdump.gpg'))
case('modified_vault_ciphertext',lambda p:flip(p/'files.tar.gpg'))
case('altered_manifest_without_signing',lambda p:flip(p/'manifest.json'))
def corrupt_sig(path):
 f=path/'manifest.sig';b=bytearray(f.read_bytes())
 # Change the last cryptographic signature byte, not an optional unsigned
 # OpenPGP metadata subpacket. Either a gpgv signature failure or malformed
 # packet MUST fail before private key access / any database restore.
 b[-1]^=1;f.write_bytes(b);f.chmod(0o600)
case('cryptographic_signature_corrupted',corrupt_sig)
case('permissions_too_open',lambda p:(p/'files.tar.gpg').chmod(0o644))
def symlink(path):
 f=path/'files.tar.gpg';f.unlink();f.symlink_to(ORIGINAL/'files.tar.gpg')
case('ciphertext_symlink',symlink)
# Existing genuine signature is valid, but wrong pinned authority must fail.
verify(ORIGINAL,fpr='0'*40,valid=False,expected='wrong_independent_signer_pin_refused')

# A malicious actor signs the SAME truthful manifest with their own valid
# Ed25519 key. Even a public keyring containing both identities MUST refuse
# this signature under the independently PINNED approved signer fingerprint.
attacker_root=Path(tempfile.mkdtemp(prefix='r1w-fake-other-signer-'))
attacker_root.chmod(0o700)
replay_root=Path('/Volumes/T7 Shield/ws-beta-r1w-negative-'+secrets.token_hex(5))
replay_root.mkdir(mode=0o700)
try:
 fake_home=attacker_root/'wrong-signer';fake_home.mkdir(mode=0o700)
 subprocess.run(['gpg','--batch','--homedir',str(fake_home),'--pinentry-mode','loopback',
   '--passphrase','','--quick-generate-key',
   'R1W Fictional Unapproved Signer <unapproved.invalid>',
   'ed25519','sign','0'],check=True,capture_output=True,timeout=35)
 listing=subprocess.run(['gpg','--batch','--homedir',str(fake_home),
  '--with-colons','--list-keys'],check=True,capture_output=True,text=True,timeout=10).stdout
 fprs=[row[9] for line in listing.splitlines() if (row:=line.split(':'))[0]=='fpr' and len(row)>9]
 checked('unapproved_signer_is_distinct',len(fprs)==1 and fprs[0]!=FPR)
 unapproved=fprs[0]
 pub=subprocess.run(['gpg','--batch','--homedir',str(fake_home),'--export',unapproved],
   check=True,capture_output=True,timeout=12).stdout
 multi=attacker_root/'both-trusted-public-only.gpg'
 multi.write_bytes(TRUST.read_bytes()+pub);multi.chmod(0o600)
 dest=replay_root/'certified'/ORIGINAL.name
 dest.parent.mkdir(mode=0o700)
 shutil.copytree(ORIGINAL,dest);dest.chmod(0o700)
 for p in dest.iterdir():p.chmod(0o600)
 subprocess.run(['gpg','--batch','--yes','--no-tty','--pinentry-mode','loopback',
  '--homedir',str(fake_home),'--local-user',unapproved,'--detach-sign',
  '--output',str(dest/'manifest.sig'),str(dest/'manifest.json')],
  check=True,capture_output=True,timeout=25)
 (dest/'manifest.sig').chmod(0o600)
 verify(dest,trust=multi,valid=False,expected='cryptographically_valid_unapproved_signer_refused')
finally:
 shutil.rmtree(replay_root)
 shutil.rmtree(attacker_root)

# A legitimate signed manifest includes the generation identifier. Merely
# moving a signed bundle to a different generation name must be refused.
replay_root=Path('/Volumes/T7 Shield/ws-beta-r1w-negative-'+secrets.token_hex(5))
replay_root.mkdir(mode=0o700)
try:
 replay_dir=replay_root/'certified';replay_dir.mkdir(mode=0o700)
 wrong_gen=replay_dir/('20261018T090000Z-'+secrets.token_hex(4))
 shutil.copytree(ORIGINAL,wrong_gen);wrong_gen.chmod(0o700)
 for item in wrong_gen.iterdir():item.chmod(0o600)
 verify(wrong_gen,valid=False,expected='wrong_signed_generation_name_refused')
finally:shutil.rmtree(replay_root)

# Restore-application must reject an absent signature BEFORE even checking DB.
restore=Path(__file__).with_name('wsBetaR1WSignedIndependentColdRestore.py')
assert restore.is_file()
p=subprocess.run(['/usr/bin/python3',str(restore),'--fixture',
  '--certified-generation',str(ORIGINAL),
  '--trusted-public-keyring',str(TRUST),'--expected-signer-fingerprint','0'*40,
  '--private-decryption-home','/nonexistent/r1w',
  '--destination-container','maia-postgres',
  '--restore-directory',str(BASE/'signed-restored-files')],
  env={'HOME':str(Path.home()),'PATH':os.environ.get('PATH','/usr/bin:/bin'),
       'WS_R1W_RESTORE_FIXTURE_ONLY':'fictional-only'},capture_output=True,text=True,timeout=18)
checked('wrong_signer_restore_denied_before_real_prod_db_check',p.returncode==70 and not (BASE/'signed-restored-files').exists())

checked('original_signed_bundle_unchanged',SOURCE_SHA=={
 p.name:sha256(p.read_bytes()).hexdigest() for p in ORIGINAL.iterdir() if p.is_file()})
checked('no_malicious_copies_remain',len(list(SIGNED.iterdir()))==1)
receipt={
 'protocol':'soullab.ws.r1w.signed-generation-negative.v1',
 'status':'R1W_FICTIONAL_SIGNED_GENERATION_REFUSALS_PASS_BETA_HOLD',
 'sourceHead':subprocess.run(['git','rev-parse','HEAD'],cwd=Path(__file__).resolve().parents[2],capture_output=True,text=True).stdout.strip(),
 'checks':{k:True for k in CHECKS},'checksPassed':len(CHECKS),
 'independentSigningTrustOperationallyQualified':False,
 'realProductionRestore':False,'realMemberDataAccessed':False,
}
p=BASE/'R1W_SIGNED_GENERATION_NEGATIVE_TESTS.json'
assert not p.exists();p.write_text(json.dumps(receipt,indent=2)+'\n');p.chmod(0o600)
print('R1W_SIGNED_GENERATION_NEGATIVE_PASS='+str(len(CHECKS)))
for check in CHECKS:print('PASS',check)
