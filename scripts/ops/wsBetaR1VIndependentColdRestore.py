#!/usr/bin/env python3
"""R1V independently validate, decrypt and cold-restore one fictional point.

Independent executable from the encrypted backup writer. Test-only; no live
PostgreSQL/backup destinations or production keyrings can be opened.
The manifest is NOT signed: SHA-256 can catch damage, not a malicious rewrite.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path,PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tarfile

PROTOCOL='soullab.ws.r1v.minisforum.complete-encrypted-recovery.fixture.v1'
STATUS='FICTIONAL_COMPLETE_DB_AND_FIVE_FILE_VOLUMES_BETA_HOLD'
VOLUMES=('media','vault','voice-notes','workbench','audit-logs')
GENERATION=re.compile(r'^\d{8}T\d{6}Z-[a-f0-9]{8}$')
REQUIRED_FALSE=(
    'productionSnapshotConsistencyProven','productionWriterQuiescenceProven',
    'productionOriginalSourceCoverageProven','productionWalRecoveryProven',
    'independentOffsiteRecipientCustodyProven','manifestIndependentlySigned',
    'productionCronCutoverApproved','productionLiveBackupExecuted',
    'realMemberWriterBetaApproved',
)

class Refusal(Exception):pass

def refuse(message):raise Refusal('R1V_RESTORE_REFUSED_'+message)

def regular(path:Path):
    try:st=path.lstat()
    except OSError:refuse('MISSING_ARTIFACT')
    if not stat.S_ISREG(st.st_mode) or stat.S_IMODE(st.st_mode)!=0o600:
        refuse('WRONG_FILE_TYPE_OR_PERMISSIONS')
    return st

def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as inp:
        for chunk in iter(lambda:inp.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()

def safe_manifest(gen:Path):
    if not GENERATION.fullmatch(gen.name):refuse('INVALID_GENERATION_NAME')
    if gen.parent.name!='complete':refuse('NOT_A_COMPLETE_GENERATION')
    parts=gen.parent.parent
    if (parts.parent != Path('/Volumes/T7 Shield') or
        not parts.name.startswith('ws-beta-r1v-') or
        parts.resolve()!=parts):
        refuse('WRONG_FIXTURE_SOURCE')
    for p in (parts,gen.parent,gen):
        try:st=p.lstat()
        except OSError:refuse('MISSING_COMPLETE_DIRECTORY')
        if not stat.S_ISDIR(st.st_mode) or stat.S_ISLNK(st.st_mode):
            refuse('UNSAFE_COMPLETE_DIRECTORY')
    if stat.S_IMODE(gen.stat().st_mode)!=0o700:refuse('UNSAFE_COMPLETE_PERMISSIONS')
    if {x.name for x in gen.iterdir()} != {'postgres.pgdump.gpg','files.tar.gpg','manifest.json'}:
        refuse('INCOMPLETE_OR_EXTRA_GENERATION')
    m=gen/'manifest.json'
    size=regular(m).st_size
    if size<300 or size>20000:refuse('INVALID_MANIFEST_SIZE')
    try:data=json.loads(m.read_bytes().decode('utf8'))
    except (ValueError,UnicodeError):refuse('INVALID_MANIFEST_JSON')
    if not isinstance(data,dict) or data.get('protocol')!=PROTOCOL or data.get('status')!=STATUS:
        refuse('INVALID_MANIFEST_IDENTITY')
    if data.get('generation')!=gen.name:refuse('MISMATCHED_GENERATION')
    if tuple(data.get('fileVolumeNames',[]))!=VOLUMES:refuse('WRONG_REQUIRED_VOLUME_SET')
    if not isinstance(data.get('fileCountsByVolume'),dict) or set(data['fileCountsByVolume'])!=set(VOLUMES):
        refuse('UNQUALIFIED_FILE_COUNTS')
    if any(type(data['fileCountsByVolume'][v]) is not int or data['fileCountsByVolume'][v]<1 for v in VOLUMES):
        refuse('EMPTY_FILE_VOLUME')
    if any(data.get(k) is not False for k in REQUIRED_FALSE):
        refuse('UNAUTHORIZED_RELEASE_CLAIM')
    if not re.fullmatch(r'[A-F0-9]{40}',data.get('recipientPublicFingerprint','')):
        refuse('INVALID_PUBLIC_FINGERPRINT')
    for kind,filename in (('postgres','postgres.pgdump.gpg'),('fileVault','files.tar.gpg')):
        spec=data.get(kind)
        if not isinstance(spec,dict) or set(spec)!={'file','bytes','sha256'}:
            refuse('INCOMPLETE_ARTIFACT_DESCRIPTOR')
        if spec['file']!=filename or type(spec['bytes']) is not int or spec['bytes']<128:
            refuse('INCORRECT_ARTIFACT_SPEC')
        if not re.fullmatch('[0-9a-f]{64}',spec.get('sha256','')):
            refuse('INVALID_ARTIFACT_DIGEST')
        f=gen/filename
        if regular(f).st_size!=spec['bytes'] or sha(f)!=spec['sha256']:
            refuse('CIPHERTEXT_SIZE_OR_DIGEST_DRIFT')
        with f.open('rb') as inp:lead=inp.read(16)
        if lead.startswith((b'PGDMP',b'\x1f\x8b',b'ustar',b'R1V_')):
            refuse('NOT_CIPHERTEXT')
    return data

def verified_private_home(home:Path, fpr:str):
    try:st=home.lstat()
    except OSError:refuse('NO_RECOVERY_KEY_HOME')
    if not stat.S_ISDIR(st.st_mode) or stat.S_ISLNK(st.st_mode) or stat.S_IMODE(st.st_mode)!=0o700:
        refuse('INVALID_RECOVERY_KEY_HOME')
    if not home.is_absolute() or str(home).startswith('/Volumes/T7 Shield/ws-beta-r1v-'):
        refuse('PRIVATE_RECOVERY_KEY_NOT_INDEPENDENT')
    p=subprocess.run(['gpg','--batch','--homedir',str(home),'--with-colons','--list-secret-keys',fpr],
        capture_output=True,timeout=12)
    if p.returncode or b'sec:' not in p.stdout:refuse('RECOVERY_PRIVATE_KEY_UNAVAILABLE')
    if fpr.encode() not in p.stdout:refuse('RECOVERY_KEY_NOT_MATCHED')

def restore_postgres(gen:Path,private:Path,container:str):
    if not re.fullmatch(r'ws-r1v-rest-[0-9a-f]{8}',container):refuse('INVALID_RESTORE_CONTAINER')
    inspect=subprocess.run(['docker','inspect','--format',
       '{{.Name}}|{{.HostConfig.NetworkMode}}|{{len .Mounts}}|{{index .Config.Labels "soullab.fixture"}}|{{.State.Running}}',container],
       capture_output=True,timeout=12)
    if inspect.returncode or inspect.stdout.strip().decode()!=f'/{container}|none|0|r1v|true':
        refuse('RESTORE_DESTINATION_NOT_ISOLATED_FIXTURE')
    gpg=subprocess.Popen(['gpg','--batch','--no-tty','--homedir',str(private),
       '--decrypt',str(gen/'postgres.pgdump.gpg')],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    restore=None
    try:
        restore=subprocess.Popen(['docker','exec','-i',container,'pg_restore','--exit-on-error',
                                  '-U','fict','-d','ws_fixture'],stdin=gpg.stdout,
                                 stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
        assert gpg.stdout is not None
        gpg.stdout.close()
        _,restore_err=restore.communicate(timeout=90)
        _,gpg_err=gpg.communicate(timeout=20)
        if restore.returncode or gpg.returncode:
            refuse('SQL_DECRYPT_OR_RESTORE_FAILED')
    except subprocess.TimeoutExpired:refuse('SQL_RESTORE_TIMEOUT')
    finally:
        for p in (gpg,restore):
            if p is not None and p.poll() is None:
                p.kill();p.wait(timeout=8)

def restore_files(gen:Path,private:Path,destination:Path,expected_counts:dict):
    if destination.exists():refuse('RESTORE_DIRECTORY_ALREADY_EXISTS')
    if destination.parent != gen.parent.parent:refuse('NOT_NEW_ISOLATED_RESTORE_DIR')
    destination.mkdir(mode=0o700)
    gpg=subprocess.Popen(['gpg','--batch','--no-tty','--homedir',str(private),
                          '--decrypt',str(gen/'files.tar.gpg')],
                         stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    counts={name:0 for name in VOLUMES}
    seen=set()
    try:
        assert gpg.stdout is not None
        with tarfile.open(fileobj=gpg.stdout,mode='r|') as tf:
            for member in tf:
                pure=PurePosixPath(member.name)
                parts=[p for p in pure.parts if p not in ('.','')]
                if pure.is_absolute() or not parts or '..' in parts or parts[0] not in VOLUMES:
                    refuse('TAR_TRAVERSAL_OR_WRONG_VOLUME')
                relative='/'.join(parts)
                if relative in seen:refuse('DUPLICATE_TAR_ENTRY')
                seen.add(relative)
                if not member.isdir() and not member.isfile():
                    refuse('TAR_SYMLINK_HARDLINK_OR_DEVICE')
                target=destination.joinpath(*parts)
                if member.isdir():
                    target.mkdir(mode=0o700,parents=True,exist_ok=True)
                    target.chmod(0o700)
                else:
                    if member.size>1048576:refuse('UNEXPECTED_LARGE_TEST_FILE')
                    target.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
                    f=tf.extractfile(member)
                    if f is None:refuse('MISSING_ARCHIVED_FILE_BYTES')
                    with target.open('xb') as out:
                        shutil.copyfileobj(f,out,length=1024*1024)
                    target.chmod(0o600)
                    counts[parts[0]]+=1
        _,error=gpg.communicate(timeout=20)
        if gpg.returncode:refuse('FILE_DECRYPT_FAILED')
    except (tarfile.TarError,OSError,EOFError):refuse('INVALID_ENCRYPTED_TAR')
    except subprocess.TimeoutExpired:refuse('FILE_DECRYPT_TIMEOUT')
    finally:
        if gpg.poll() is None:gpg.kill();gpg.wait(timeout=8)
    if counts!=expected_counts:refuse('FILE_VOLUME_COUNT_MISMATCH')
    return counts

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--fixture',action='store_true')
    p.add_argument('--generation',required=True)
    p.add_argument('--private-gpg-home',required=True)
    p.add_argument('--destination-container',required=True)
    p.add_argument('--restore-dir',required=True)
    a=p.parse_args()
    if not a.fixture or os.environ.get('WS_R1V_RESTORE_FIXTURE_ONLY')!='fictional-only':
        print('R1V_RESTORE_REFUSED_DEFAULT_OFF',file=sys.stderr);return 70
    try:
        gen=Path(a.generation)
        data=safe_manifest(gen)
        home=Path(a.private_gpg_home)
        verified_private_home(home,data['recipientPublicFingerprint'])
        restore_postgres(gen,home,a.destination_container)
        counts=restore_files(gen,home,Path(a.restore_dir),data['fileCountsByVolume'])
        print(json.dumps({'status':'R1V_FICTIONAL_INDEPENDENT_DB_AND_FIVE_VOLUME_RESTORE_PASS_BETA_HOLD',
                          'fileVolumes':len(counts),'restoredFiles':sum(counts.values()),
                          'sourceAndTargetIndependent':True,'productionRestoreQualified':False},sort_keys=True))
        return 0
    except Refusal as e:
        print(str(e),file=sys.stderr);return 70
if __name__=='__main__':raise SystemExit(main())
