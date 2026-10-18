#!/usr/bin/env python3
"""R1V: Minisforum-specific complete encrypted Writer recovery-point writer.

PRODUCTION IS COMPILE-TIME HELD. There is NO deploy/cron/install/real-backup mode.
The one executable capture uses a disposable labeled PostgreSQL container,
synthetic five-volume source tree, public-only recipient and private T7 path.
Never accepts a production DB source, NAS writer destination or credentials.

After a separately authorized code/security release, LIVE_TOPOLOGY describes the
server-specific bindings to verify; it is NOT silently activated by an env var.
Cross-store writer quiescence, WAL coherence, vault coverage and signing are
explicitly still unqualified. No real manuscript may rely on this source yet.
"""
from __future__ import annotations
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import uuid

R1V_PRODUCTION_CUTOVER_RELEASED = False
PROTOCOL = 'soullab.ws.r1v.minisforum.complete-encrypted-recovery.fixture.v1'
SOURCE_HEAD = 'abd9ddfc93c431a4ae2f8f5574aa6b163bf19529'
FILE_VOLUMES = {
    'media': ('maia-sovereign_media_data', '/app/data/media'),
    'vault': ('maia-sovereign_vault_data', '/app/data/vault'),
    'voice-notes': ('maia-sovereign_voice_notes_data', '/app/storage/voice-notes'),
    'workbench': ('maia-sovereign_workbench_data', '/app/data/workbench'),
    'audit-logs': ('maia-sovereign_audit_data', '/app/data/audit-logs'),
}
LIVE_TOPOLOGY = {
    'server': 'minisforum', 'postgresContainer': 'maia-postgres',
    'postgresDatabase': 'maia_consciousness', 'postgresRole': 'soullab',
    'postgresDataVolume': 'maia-sovereign_postgres_data',
    'nas': '/mnt/ds225/maia-backups',
    'plannedDestination': '/mnt/ds225/maia-backups/encrypted-complete',
    'requiredFileVolumes': FILE_VOLUMES,
    'requiredStoppedWriterContainers': [
        'maia-sovereign', 'maia-api', 'maia-media-worker',
        'maia-comms-worker', 'maia-summary-worker', 'maia-staging', 'maia-rlm',
    ],
    'externalBindScopeUnqualified': ['/app/data/ain-vault', '/app/public/audiobook', '/app/Community-Commons'],
    'twoLegacyCronWritersMustBeIndependentlyRetired': True,
    'sqlFileWalCoherenceQualified': False,
}
FIXTURE_NAME = re.compile(r'^ws-r1v-src-[0-9a-f]{8}$')
FINGERPRINT = re.compile(r'^[A-F0-9]{40}$')
STAGE_NAMES = {'', 'after_sql', 'after_files', 'before_publish', 'mutate_after_sql'}

class Refusal(Exception):
    pass

def refuse(message: str):
    raise Refusal('R1V_REFUSED_' + message)

def run(args, timeout=40, check=True, input_bytes=None):
    try:
        p = subprocess.run(args, input=input_bytes, stdout=subprocess.PIPE,
                           stderr=subprocess.PIPE, timeout=timeout, check=False)
    except subprocess.TimeoutExpired:
        refuse('SUBPROCESS_TIMEOUT')
    if check and p.returncode:
        refuse('SUBPROCESS_FAILURE_' + Path(args[0]).name.upper().replace('-', '_'))
    return p

def mode(path:Path, must_dir=True, expected=0o700):
    try:st=path.lstat()
    except OSError:refuse('MISSING_OR_INACCESSIBLE_FILE')
    if stat.S_ISLNK(st.st_mode):refuse('SYMLINK_PATH')
    if must_dir and not stat.S_ISDIR(st.st_mode):refuse('DIRECTORY_REQUIRED')
    if expected is not None and stat.S_IMODE(st.st_mode) != expected:refuse('UNSAFE_FILE_MODE')
    return st

def safe_sources(src:Path):
    mode(src)
    expected = set(FILE_VOLUMES)
    actual = set(p.name for p in src.iterdir())
    if actual != expected:refuse('REQUIRED_VOLUME_MISSING_OR_EXTRA')
    fingerprint = hashlib.sha256()
    counts = {}
    for category in FILE_VOLUMES:
        root=src/category
        mode(root)
        count=0
        for base, dirs, files in os.walk(root,topdown=True,followlinks=False):
            for d in sorted(dirs):
                entry=Path(base)/d
                st=entry.lstat()
                if not stat.S_ISDIR(st.st_mode) or stat.S_ISLNK(st.st_mode):
                    refuse('SOURCE_DIRECTORY_SYMLINK_OR_SPECIAL')
            for filename in sorted(files):
                p=Path(base)/filename
                st=p.lstat()
                if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1:
                    refuse('SOURCE_SYMLINK_HARDLINK_OR_SPECIAL')
                if st.st_size > 1048576:refuse('FIXTURE_FILE_TOO_LARGE')
                count+=1
                rel=str(p.relative_to(src))
                fingerprint.update(rel.encode('utf8')+b'\x00')
                fingerprint.update(str(st.st_size).encode('ascii')+b'\x00')
                fingerprint.update(hashlib.sha256(p.read_bytes()).digest())
        if count == 0:refuse('EMPTY_REQUIRED_VOLUME_'+category.replace('-', '_').upper())
        counts[category]=count
    return fingerprint.hexdigest(),counts

def exact_fixture_container(name:str):
    if not FIXTURE_NAME.fullmatch(name):refuse('NOT_A_DISPOSABLE_POSTGRES_CONTAINER')
    p=run(['docker','inspect','--format',
        '{{.Name}}|{{.HostConfig.NetworkMode}}|{{len .Mounts}}|{{index .Config.Labels "soullab.fixture"}}|{{.State.Running}}',
        name],timeout=12)
    if p.stdout.strip().decode() != '/'+name+'|none|0|r1v|true':
        refuse('POSTGRES_NOT_A_NETWORKLESS_UNMOUNTED_FIXTURE')
    p=run(['docker','exec',name,'psql','-XAtq','-U','fict','-d','ws_fixture','-c','SELECT 1'],timeout=12)
    if p.stdout.strip()!=b'1':refuse('POSTGRES_TEST_DATABASE_UNREADY')

def verify_public_recipient(homedir:Path,fpr:str):
    mode(homedir)
    if not FINGERPRINT.fullmatch(fpr):refuse('INVALID_PUBLIC_RECIPIENT_FINGERPRINT')
    pub=run(['gpg','--batch','--no-tty','--homedir',str(homedir),
        '--with-colons','--list-keys',fpr],timeout=12,check=False)
    fingerprints=[line.split(':')[9].upper() for line in pub.stdout.decode(errors='replace').splitlines()
                  if line.startswith('fpr:') and len(line.split(':'))>9]
    if pub.returncode or fpr not in fingerprints:refuse('PUBLIC_RECIPIENT_NOT_FOUND')
    secret=run(['gpg','--batch','--no-tty','--homedir',str(homedir),
        '--with-colons','--list-secret-keys'],timeout=12,check=False)
    if b'sec:' in secret.stdout:refuse('BACKUP_WRITER_HAS_DECRYPT_KEY')

def encrypted_stream(producer:list[str],output:Path,homedir:Path,fpr:str,timeout:int=90):
    encrypt=['gpg','--batch','--no-tty','--yes','--homedir',str(homedir),
             '--trust-model','always','--cipher-algo','AES256',
             '--encrypt','--recipient',fpr,'--output',str(output)]
    producer_proc=None; encrypt_proc=None
    try:
        producer_proc=subprocess.Popen(producer,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        encrypt_proc=subprocess.Popen(encrypt,stdin=producer_proc.stdout,
                                      stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
        assert producer_proc.stdout is not None
        producer_proc.stdout.close()
        _,err=encrypt_proc.communicate(timeout=timeout)
        _,source_err=producer_proc.communicate(timeout=timeout)
        if encrypt_proc.returncode or producer_proc.returncode:
            refuse('ENCRYPTED_SOURCE_PIPELINE_FAILURE')
    except subprocess.TimeoutExpired:
        refuse('ENCRYPTED_SOURCE_PIPELINE_TIMEOUT')
    finally:
        for proc in (producer_proc,encrypt_proc):
            if proc is not None and proc.poll() is None:
                proc.kill();proc.wait(timeout=8)
    st=mode(output,must_dir=False,expected=0o600)
    if not stat.S_ISREG(st.st_mode) or st.st_size<128:refuse('ENCRYPTED_ARTIFACT_INVALID')
    return {'file':output.name,'bytes':st.st_size,'sha256':sha256_file(output)}

def sha256_file(p:Path):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

def fsync_dir(p:Path):
    fd=os.open(str(p),os.O_RDONLY)
    try:os.fsync(fd)
    except OSError:refuse('PUBLISH_DIRECTORY_FSYNC_FAILED')
    finally:os.close(fd)

def perform_fixture(a):
    if os.environ.get('WS_R1V_FIXTURE_ONLY')!='fictional-only':refuse('DEFAULT_OFF')
    evidence=Path(a.evidence_dir)
    if (evidence.parent != Path('/Volumes/T7 Shield') or
        not evidence.name.startswith('ws-beta-r1v-') or
        evidence.resolve()!=evidence):
        refuse('FORBIDDEN_EVIDENCE_LOCATION')
    mode(evidence)
    src=evidence/'fictional-sources'
    if Path(a.source_dir)!=src:refuse('SOURCE_NOT_FICTIONAL_ROOT')
    home=Path(a.public_gpg_home)
    if not home.is_absolute() or str(home).startswith(str(evidence)):
        refuse('BACKUP_KEYRING_MUST_BE_EXTERNAL')
    fpr=a.recipient_fingerprint.upper()
    verify_public_recipient(home,fpr)
    exact_fixture_container(a.postgres_container)
    if a.fail_stage not in STAGE_NAMES:refuse('UNKNOWN_FAILURE_STAGE')
    # R70.19I synthetic-only: pg_dump is forced to the very same exported
    # read-only REPEATABLE READ snapshot as the capture-time Work/key census.
    # This opt-in cannot enter the permanently hard-disabled LIVE path.
    exported_snapshot=a.fixture_snapshot
    if exported_snapshot:
        if (os.environ.get('R7019I_CAPTURE_FIXTURE')!='fictional-only' or
            not re.fullmatch(r'[0-9A-F]+-[0-9A-F]+-[0-9A-F]+',exported_snapshot) or
            not re.fullmatch(r'[a-f0-9]{40}',a.fixture_source_head)):
            refuse('UNQUALIFIED_EXPORTED_SNAPSHOT')
    stable_before,volume_counts=safe_sources(src)
    # Exclusive flock is necessary even for a fixture. Future live backup
    # requires a separate lock for the two existing scheduled writer jobs.
    lockfile=evidence/'.r1v-backup.lock'
    lockfd=os.open(lockfile,os.O_RDWR|os.O_CREAT|os.O_NOFOLLOW,0o600)
    pending=None
    try:
        fcntl.flock(lockfd,fcntl.LOCK_EX|fcntl.LOCK_NB)
        completed=evidence/'complete'
        if completed.exists():mode(completed)
        else:completed.mkdir(mode=0o700)
        pending=Path(tempfile.mkdtemp(prefix='.r1v.pending.',dir=str(evidence)))
        mode(pending)
        ident=time.strftime('%Y%m%dT%H%M%SZ',time.gmtime())+'-'+uuid.uuid4().hex[:8]
        target=completed/ident
        if target.exists():refuse('GENERATION_ALREADY_EXISTS')
        pgdump=[
          'docker','exec',a.postgres_container,
          'pg_dump','-U','fict','-Fc','ws_fixture']
        if exported_snapshot:pgdump.append('--snapshot='+exported_snapshot)
        db=encrypted_stream(pgdump,pending/'postgres.pgdump.gpg',home,fpr)
        if a.fail_stage=='after_sql':refuse('INJECTED_AFTER_SQL')
        if a.fail_stage=='mutate_after_sql':
            # Test-only alteration of a source file after DB snapshot.
            p=src/'vault'/'fictional-original.txt'
            if not p.is_file():refuse('TEST_MUTATION_TARGET_MISSING')
            with p.open('ab') as f:f.write(b'R1V_FICTIONAL_RACE_INJECTION')
        if safe_sources(src)[0]!=stable_before:refuse('SOURCES_CHANGED_DURING_BACKUP')
        tar=['tar','-C',str(src),'--format','ustar','-cf','-',*FILE_VOLUMES.keys()]
        files=encrypted_stream(tar,pending/'files.tar.gpg',home,fpr)
        if a.fail_stage=='after_files':refuse('INJECTED_AFTER_FILES')
        if safe_sources(src)[0]!=stable_before:refuse('SOURCES_CHANGED_DURING_BACKUP')
        manifest={
          'protocol':PROTOCOL,'generation':ident,
          'status':'FICTIONAL_COMPLETE_DB_AND_FIVE_FILE_VOLUMES_BETA_HOLD',
          'postgres':db,'fileVault':files,'fileVolumeNames':list(FILE_VOLUMES),
          'fileCountsByVolume':volume_counts,
          'recipientPublicFingerprint':fpr,
          'cryptoAlgorithm':'OpenPGP_GPG_AES256_PUBLIC_RECIPIENT',
          'productionSnapshotConsistencyProven':False,
          'productionWriterQuiescenceProven':False,
          'productionOriginalSourceCoverageProven':False,
          'productionWalRecoveryProven':False,
          'independentOffsiteRecipientCustodyProven':False,
          'manifestIndependentlySigned':False,
          'productionCronCutoverApproved':False,
          'productionLiveBackupExecuted':False,
          'realMemberWriterBetaApproved':False,
        }
        if exported_snapshot:
            # Fixture-only evidence binding. This is NOT proof of production
            # writer quiescence, current erasure or an off-host signer.
            manifest['R7019ISourceHead']=a.fixture_source_head
            manifest['R7019ISnapshotIdFormatVerified']=True
        m=pending/'manifest.json'
        with m.open('x') as f:json.dump(manifest,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
        m.chmod(0o600)
        for artifact in (pending/db['file'],pending/files['file'],m):
            mode(artifact,must_dir=False,expected=0o600)
        if a.fail_stage=='before_publish':refuse('INJECTED_BEFORE_PUBLISH')
        fsync_dir(pending)
        os.rename(pending,target)
        pending=None
        fsync_dir(completed)
        return {'status':'R1V_FICTIONAL_COMPLETE_ENCRYPTED_POINT_PUBLISHED_BETA_HOLD',
                'generation':ident,'encryptedArchives':2,
                'requiredFileVolumes':len(FILE_VOLUMES),'productionChanged':False}
    finally:
        if pending and pending.exists():shutil.rmtree(pending)
        os.close(lockfd)

def main():
    # No GPG output or manifest file may inherit a permissive shell umask.
    os.umask(0o077)
    parser=argparse.ArgumentParser()
    mode_group=parser.add_mutually_exclusive_group(required=True)
    mode_group.add_argument('--describe-server-plan',action='store_true')
    mode_group.add_argument('--live',action='store_true')
    mode_group.add_argument('--fixture',action='store_true')
    parser.add_argument('--evidence-dir',default='')
    parser.add_argument('--source-dir',default='')
    parser.add_argument('--postgres-container',default='')
    parser.add_argument('--public-gpg-home',default='')
    parser.add_argument('--recipient-fingerprint',default='')
    parser.add_argument('--fail-stage',default='')
    parser.add_argument('--fixture-snapshot',default='')
    parser.add_argument('--fixture-source-head',default='')
    args=parser.parse_args()
    if args.describe_server_plan:
        print(json.dumps({'productionCutoverReleased':False,'plan':LIVE_TOPOLOGY},indent=2))
        return 0
    if args.live:
        # This path is intentionally not implemented; it cannot be enabled via
        # environment variables, flags, SSO or a developer-machine config.
        print('R1V_REFUSED_PRODUCTION_HARD_DISABLED_REQUIRE_NEW_REVIEWED_SOURCE',file=sys.stderr)
        return 70
    try:
        proof=perform_fixture(args)
    except Refusal as e:
        print(str(e),file=sys.stderr);return 70
    print(json.dumps(proof,sort_keys=True))
    return 0
if __name__=='__main__':raise SystemExit(main())
