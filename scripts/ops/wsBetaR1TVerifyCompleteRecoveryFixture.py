#!/usr/bin/env python3
"""Pure fictional, non-destructive tamper/incomplete bundle refusal tests.
Uses the accepted R1T genuine encrypted generation, COPIES only it to new
private fixture names, and removes each corrupted copy after refusal.
"""
from pathlib import Path
from hashlib import sha256
import json,os,re,shutil,subprocess,sys,secrets
ROOT=Path(__file__).resolve().parents[2]
ORIGINAL=Path(os.environ.get('WS_R1T_ACCEPTED_GENERATION',''))
assert os.environ.get('WS_R1T_INTEGRITY_FIXTURE')=='fictional-only','REFUSE nonfixture'
assert ORIGINAL.is_dir() and ORIGINAL.parent.name=='complete'
assert str(ORIGINAL).startswith('/Volumes/T7 Shield/ws-beta-r1t-')
assert len(list(ORIGINAL.parent.iterdir()))==1, 'Require one accepted generation before negative copies'
VERIFIER=ROOT/'scripts/ops/wsBetaR1TVerifyCompleteRecoveryPoint.py'
assert VERIFIER.is_file()
CHECKS=[]
ENV={'HOME':str(Path.home()),'PATH':os.environ.get('PATH','/usr/bin:/bin'),
     'WS_R1T_VERIFY_ONLY':'fictional-only'}

def call(path,override=None):
 env={**ENV,**(override or {})}
 return subprocess.run(['/usr/bin/python3',str(VERIFIER),str(path)],
       env=env,capture_output=True,text=True,timeout=12)

def check(name,result):
 assert result,name
 CHECKS.append(name)

def rejected(result,marker):
 check(marker,result.returncode==70 and 'R1T_VERIFY_REFUSED_' in result.stderr)

def clone():
 tag=secrets.token_hex(4)
 generation='20261017T231500Z-'+tag
 path=ORIGINAL.parent/generation
 assert not path.exists()
 shutil.copytree(ORIGINAL,path,symlinks=False)
 manifest=path/'manifest.json'
 d=json.loads(manifest.read_text());d['generation']=generation
 manifest.write_text(json.dumps(d,indent=2)+'\n');manifest.chmod(0o600)
 return path

def case(name,mutate,reason=None):
 p=clone()
 try:
  mutate(p)
  result=call(p)
  rejected(result,name+'_refused')
  if reason:check(name+'_correct_reason',reason in result.stderr)
 finally:shutil.rmtree(p)

valid=call(ORIGINAL)
check('real_encrypted_sql_vault_generation_integrity_pass',valid.returncode==0)
proof=json.loads(valid.stdout)
check('plain_manifest_not_signed_or_production_approved',
 proof['cryptographicManifestSignatureVerified'] is False and
 proof['productionCutoverApproved'] is False)
no_mode=call(ORIGINAL,{'WS_R1T_VERIFY_ONLY':''})
rejected(no_mode,'production_default_off')
check('default_off_actual_reason','DEFAULT_OFF' in no_mode.stderr)

case('missing_vault_cannot_claim_complete',lambda p:(p/'vault.tar.gpg').unlink(),'INCOMPLETE_OR_EXTRA_ARTIFACTS')
case('missing_manifest_cannot_claim_complete',lambda p:(p/'manifest.json').unlink(),'INCOMPLETE_OR_EXTRA_ARTIFACTS')
case('extra_file_prevents_clean_complete',lambda p:(p/'unencrypted.sql').write_text('fake SQL'), 'INCOMPLETE_OR_EXTRA_ARTIFACTS')

def corrupt(p):
 f=p/'postgres.pgdump.gpg';data=bytearray(f.read_bytes());data[43]^=0x1;f.write_bytes(data);f.chmod(0o600)
case('altered_ciphertext_digest_refused',corrupt,'CIPHERTEXT_SHA_MISMATCH')

def rewrite(p,change):
 f=p/'manifest.json';d=json.loads(f.read_text());change(d);f.write_text(json.dumps(d,indent=2)+'\n');f.chmod(0o600)
case('forged_beta_go_manifest_refused',lambda p:rewrite(p,lambda d:d.__setitem__('productionCutoverApproved',True)),'FALSE_RELEASE_CLAIM')
case('forged_manifest_type_refused',lambda p:rewrite(p,lambda d:d.__setitem__('status','REAL_BETA_LIVE')),'MANIFEST_NOT_MATCHING')
case('modified_hash_without_ciphertext_refused',lambda p:rewrite(p,lambda d:d['vault'].__setitem__('sha256','0'*64)),'CIPHERTEXT_SHA_MISMATCH')

def symlink(p):
 f=p/'vault.tar.gpg';f.unlink();f.symlink_to(ORIGINAL/'vault.tar.gpg')
case('symlink_archive_refused',symlink,'SYMLINK_REFUSED')
case('weakened_archive_permissions_refused',lambda p:(p/'vault.tar.gpg').chmod(0o644),'UNSAFE_PERMISSIONS')
case('truncated_ciphertext_size_refused',lambda p:(p/'postgres.pgdump.gpg').write_bytes(b'x'*150),'CIPHERTEXT_MISSING_OR_SIZE_MISMATCH')
case('missing_complete_marker_refused',lambda p:rewrite(p,lambda d:d.pop('generation')),'MANIFEST_NOT_MATCHING')
check('only_original_complete_generation_remains',len(list(ORIGINAL.parent.iterdir()))==1)
check('original_ciphertext_and_manifest_unchanged',call(ORIGINAL).returncode==0)
assert len(CHECKS)>=20
out=ORIGINAL.parent.parent/'R1T_COMPLETE_GENERATION_INTEGRITY_NEGATIVE_TESTS.json'
assert not out.exists()
payload={
 'protocol':'soullab.ws.r1t.complete-generation-integrity-negative.v1',
 'status':'R1T_FICTIONAL_INTEGRITY_REFUSALS_PASS_BETA_HOLD',
 'checks':{label:True for label in CHECKS},
 'actualRealPGArchiveTested':True,'cryptographicManifestSignatureVerified':False,
 'productionRestoreApproved':False,'sourceHead':subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,capture_output=True,text=True).stdout.strip(),
 'testCases':len(CHECKS),'realMemberFilesRead':False,
}
out.write_text(json.dumps(payload,indent=2)+'\n');out.chmod(0o600)
print('R1T_COMPLETE_GENERATION_NEGATIVE_CHECKS='+str(len(CHECKS)))
for label in CHECKS:print('PASS '+label)
print('Accepted encrypted generation original SHA:',sha256((ORIGINAL/'manifest.json').read_bytes()).hexdigest())
print('No copies left:',len(list(ORIGINAL.parent.iterdir()))==1)
