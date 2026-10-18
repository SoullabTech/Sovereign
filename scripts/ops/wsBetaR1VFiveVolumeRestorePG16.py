#!/usr/bin/env python3
"""R1V end-to-end: one real isolated PG16 + five fake Docker file volumes.
Tests server-shaped source capture, fails-before-publication and a SECOND
executable's cold restore after source destruction, using independent GPG key.
No SSH, production credentials, AWS, NAS or real member data.
"""
from pathlib import Path
from hashlib import sha256
import json
import os
import re
import secrets
import shutil
import subprocess
import tempfile
import time
import sys
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
WRITER=ROOT/'scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py'
RESTORE=ROOT/'scripts/ops/wsBetaR1VIndependentColdRestore.py'
EVIDENCE=Path(os.environ.get('R1V_EVIDENCE_DIR','/not-a-fixture'))
TOKEN=secrets.token_hex(4)
SRC='ws-r1v-src-'+TOKEN
DST='ws-r1v-rest-'+TOKEN
CONTAINERS=[]
TEMP_KEY_BASE=None
CHECKS={}
METRICS={}

class TestHalt(Exception):pass

def prove(name,predicate):
    CHECKS[name]=bool(predicate)
    if not predicate:raise TestHalt('R1V_TEST_FAIL_'+name)

def run(args,timeout=40,input_bytes=None,env=None,check=True):
    try:p=subprocess.run(args,cwd=ROOT,input=input_bytes,env=env,
        capture_output=True,text=True if input_bytes is None else False,timeout=timeout)
    except subprocess.TimeoutExpired:raise TestHalt('R1V_TEST_TIMEOUT_'+Path(args[0]).name)
    if check and p.returncode:
        tail=(p.stderr.decode(errors='replace') if isinstance(p.stderr,bytes) else p.stderr)[-180:]
        raise TestHalt('R1V_TEST_COMMAND_FAIL_'+Path(args[0]).name+' '+tail)
    return p

def docker(*args,timeout=40,check=True):return run(['docker',*args],timeout=timeout,check=check)

def start_pg(name):
    prove('no_preexisting_'+('source' if name==SRC else 'restore')+'_fixture',
          not docker('ps','-aq','--filter','name=^/'+name+'$',timeout=8).stdout.strip())
    docker('run','--pull=never','--rm','-d','--name',name,
        '--label','soullab.fixture=r1v','--network','none','--cpus=1','--memory=512m',
        '--pids-limit=128','--security-opt','no-new-privileges',
        '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
        '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=ws_fixture',
        '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13',timeout=65)
    CONTAINERS.append(name)
    ready=False
    for _ in range(52):
        p=docker('exec',name,'psql','-XAtq','-U','fict','-d','ws_fixture','-c','SELECT 1',check=False,timeout=8)
        if p.returncode==0 and p.stdout.strip()=='1':ready=True;break
        time.sleep(.25)
    prove('postgres_'+('source' if name==SRC else 'restore')+'_query_ready',ready)
    inspect=docker('inspect','--format','{{.HostConfig.NetworkMode}}|{{len .Mounts}}|{{index .Config.Labels "soullab.fixture"}}',name)
    prove('postgres_'+('source' if name==SRC else 'restore')+'_isolated',inspect.stdout.strip()=='none|0|r1v')

def writer_env(public_home, fpr):
    return {'HOME':str(Path.home()),
      'PATH':'/Users/soullab/.nvm/versions/node/v22.22.3/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
      'WS_R1V_FIXTURE_ONLY':'fictional-only'}

def writer_cmd(public_home,fpr,stage=''):
    return ['/usr/bin/python3',str(WRITER),'--fixture',
            '--evidence-dir',str(EVIDENCE),
            '--source-dir',str(EVIDENCE/'fictional-sources'),
            '--postgres-container',SRC,
            '--public-gpg-home',str(public_home),
            '--recipient-fingerprint',fpr,
            '--fail-stage',stage]

def fingerprint(path):return sha256(path.read_bytes()).hexdigest()

def source_roots():
    root=EVIDENCE/'fictional-sources'
    root.mkdir(mode=0o700)
    texts={
     'media':{'fictional-cover.png':b'R1V_FAKE_MEDIA_FILE_01'+secrets.token_bytes(51)},
     'vault':{'fictional-original.txt':b'R1V_FAKE_ORIGINAL_UNPUBLISHED_STORY_02',
              'fictional-source.docx':b'R1V_FAKE_DOCX_ATTACHMENT_03'},
     'voice-notes':{'fictional-voice.wav':b'R1V_FAKE_VOICE_RECORDING_04'+secrets.token_bytes(41)},
     'workbench':{'fictional-draft.md':b'R1V_FAKE_DRAFT_ONLY_05'},
     'audit-logs':{'fictional-consent.audit':b'R1V_FAKE_CONSENT_TOMBSTONE_06'},
    }
    hashes={}
    for name,items in texts.items():
        dest=root/name;dest.mkdir(mode=0o700)
        for filename,content in items.items():
            out=dest/filename
            out.write_bytes(content);out.chmod(0o600)
            hashes[name+'/'+filename]=fingerprint(out)
    prove('exactly_five_server_shaped_fake_file_volumes',len(texts)==5 and len(hashes)==6)
    return hashes

def generate_key(home):
    uid='R1V INDEPENDENT FICTIONAL COLD RESTORE <r1v-test.invalid>'
    run(['gpg','--batch','--homedir',str(home),'--pinentry-mode','loopback',
      '--passphrase','','--quick-generate-key',uid,'rsa2048','encr','0'],timeout=60)
    keys=run(['gpg','--batch','--homedir',str(home),'--with-colons','--list-keys',uid]).stdout
    fprs=[a[9] for l in keys.splitlines() if (a:=l.split(':'))[0]=='fpr' and len(a)>9 and re.fullmatch(r'[A-F0-9]{40}',a[9])]
    prove('independent_private_key_fingerprint_present',len(fprs)==1)
    return fprs[0]

def publication_count():
    d=EVIDENCE/'complete'
    return len([x for x in d.iterdir() if x.is_dir()]) if d.is_dir() else 0

def no_pending():return not any(EVIDENCE.glob('.r1v.pending.*'))

def run_demo():
    global TEMP_KEY_BASE
    prove('explicit_test_only',os.environ.get('R1V_TEST_MODE')=='fictional-only')
    prove('destination_in_private_t7',str(EVIDENCE).startswith('/Volumes/T7 Shield/ws-beta-r1v-') and not EVIDENCE.exists())
    parent='abd9ddfc93c431a4ae2f8f5574aa6b163bf19529'
    expected={
      'scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py',
      'scripts/ops/wsBetaR1VIndependentColdRestore.py',
      'scripts/ops/wsBetaR1VFiveVolumeRestorePG16.py',
      'scripts/ops/wsBetaR1VMinisforumCutoverPreflight.py',
      'scripts/ops/__tests__/wsBetaR1VMinisforumBackupSafety.test.cjs',
      'docs/ops/WS_BETA_R1V_MINISFORUM_ENCRYPTED_BACKUP_CUTOVER_REVIEW_20261018.md',
    }
    head=run(['git','rev-parse','HEAD']).stdout.strip()
    if head==parent:
        files=set(run(['git','ls-files','--others','--exclude-standard']).stdout.splitlines())
        prove('pinned_R1T_parent_and_six_reviewed_untracked_sources',files==expected)
        prove('no_unrelated_modified_tracked_sources',not run(['git','diff','--name-only']).stdout.strip())
    else:
        exact_parent=run(['git','rev-parse','HEAD^']).stdout.strip()
        changed=set(run(['git','show','--pretty=format:','--name-only','HEAD']).stdout.splitlines())
        prove('pinned_R1T_direct_review_child_only',exact_parent==parent and changed==expected)
        prove('clean_exact_committed_source_no_other_changes',not run(['git','status','--porcelain']).stdout.strip())
    prove('tools_exist',all(shutil.which(x) for x in ('docker','gpg','tar')))
    docker('image','inspect','postgres:16.13')
    # Attempted --live must refuse BEFORE opening a container or reading a file.
    live=run(['/usr/bin/python3',str(WRITER),'--live'],timeout=8,check=False)
    prove('production_runtime_compile_time_hard_disabled',live.returncode==70 and 'PRODUCTION_HARD_DISABLED' in live.stderr)
    default=run(['/usr/bin/python3',str(WRITER),'--fixture'],timeout=8,check=False)
    prove('fixture_requires_explicit_mode_and_exact_sources',default.returncode==70)
    EVIDENCE.mkdir(mode=0o700)
    originals=source_roots()
    TEMP_KEY_BASE=Path(tempfile.mkdtemp(prefix='r1v-independent-recovery-'))
    private=TEMP_KEY_BASE/'off_writer_independent_private';private.mkdir(mode=0o700)
    public=TEMP_KEY_BASE/'backup_writer_public_only';public.mkdir(mode=0o700)
    fpr=generate_key(private)
    exported=subprocess.run(['gpg','--batch','--homedir',str(private),'--export',fpr],
                             capture_output=True,timeout=12)
    prove('fake_public_key_exported',exported.returncode==0 and len(exported.stdout)>200)
    pub=exported.stdout
    imported=run(['gpg','--batch','--homedir',str(public),'--import'],input_bytes=pub)
    secret=run(['gpg','--batch','--homedir',str(public),'--with-colons','--list-secret-keys'])
    prove('writer_gpg_home_contains_no_private_recovery_key','sec:' not in secret.stdout)
    start_pg(SRC)
    seeded=docker('exec',SRC,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','fict','-d','ws_fixture',
      '-c',"CREATE TABLE fictional_works(id integer PRIMARY KEY, body text NOT NULL); INSERT INTO fictional_works VALUES (1,'R1V_FAKE_WRITER_ALPHA'),(2,'R1V_FAKE_WRITER_BETA');")
    checked=docker('exec',SRC,'psql','-XAtq','-U','fict','-d','ws_fixture',
        '-c','SELECT COUNT(*) FROM fictional_works;')
    prove('two_synthetic_postgres_rows_created',checked.stdout.strip()=='2')
    env=writer_env(public,fpr)
    wrong=writer_cmd(public,fpr)
    wrong[wrong.index(SRC)]= 'maia-postgres'
    r=run(wrong,env=env,timeout=9,check=False)
    prove('actual_prod_postgres_container_never_permitted',r.returncode==70 and 'NOT_A_DISPOSABLE' in r.stderr)
    r=run(writer_cmd(public,'0'*40),env=env,timeout=9,check=False)
    prove('uninstalled_public_recipient_refused',r.returncode==70 and 'PUBLIC_RECIPIENT_NOT_FOUND' in r.stderr)
    symlink=EVIDENCE/'fictional-sources/vault/test-symlink'
    symlink.symlink_to('/home/soullab/MAIA-SOVEREIGN')
    r=run(writer_cmd(public,fpr),env=env,timeout=9,check=False)
    prove('source_symlink_refused',r.returncode==70 and 'SOURCE_SYMLINK' in r.stderr)
    symlink.unlink()
    fixture_root=EVIDENCE/'fictional-sources'
    removed=fixture_root/'voice-notes'
    replaced=fixture_root/'voice-notes.held'
    removed.rename(replaced)
    r=run(writer_cmd(public,fpr),env=env,timeout=9,check=False)
    prove('missing_required_volume_refused',r.returncode==70 and 'REQUIRED_VOLUME' in r.stderr)
    replaced.rename(removed)
    prove('negative_preflight_creates_no_complete_point',publication_count()==0)
    for stage,expected in [('after_sql','INJECTED_AFTER_SQL'),('after_files','INJECTED_AFTER_FILES'),('before_publish','INJECTED_BEFORE_PUBLISH')]:
        r=run(writer_cmd(public,fpr,stage),env=env,timeout=85,check=False)
        prove(stage+'_refuses_after_ciphertext',r.returncode==70 and expected in r.stderr)
        prove(stage+'_never_publishes_incomplete',publication_count()==0)
        prove(stage+'_pending_ciphertext_removed',no_pending())
    r=run(writer_cmd(public,fpr,'mutate_after_sql'),env=env,timeout=80,check=False)
    prove('concurrent_source_change_detected',r.returncode==70 and 'SOURCES_CHANGED' in r.stderr)
    prove('concurrent_change_does_not_publish_incomplete',publication_count()==0 and no_pending())
    original=fixture_root/'vault/fictional-original.txt'
    original.write_bytes(b'R1V_FAKE_ORIGINAL_UNPUBLISHED_STORY_02');original.chmod(0o600)
    prove('synthetic_source_restored_after_intentional_race',fingerprint(original)==originals['vault/fictional-original.txt'])
    result=run(writer_cmd(public,fpr),env=env,timeout=85)
    data=json.loads(result.stdout)
    prove('one_complete_ciphertext_generation_published',publication_count()==1 and data['encryptedArchives']==2)
    gen=(EVIDENCE/'complete'/data['generation'])
    manifest=json.loads((gen/'manifest.json').read_text())
    prove('both_archive_names_in_one_manifest',manifest['postgres']['file']=='postgres.pgdump.gpg' and manifest['fileVault']['file']=='files.tar.gpg')
    prove('five_server_volume_names_in_manifest',set(manifest['fileVolumeNames'])=={'media','vault','voice-notes','workbench','audit-logs'})
    prove('no_unsigned_manifest_claims_prod_approval',not any(manifest[k] for k in ('productionCronCutoverApproved','productionSnapshotConsistencyProven','manifestIndependentlySigned')))
    for key in ('postgres','fileVault'):
        file=gen/manifest[key]['file']
        prove(key+'_ciphertext_file_integrity',file.stat().st_size==manifest[key]['bytes'] and fingerprint(file)==manifest[key]['sha256'])
        prove(key+'_no_known_plaintext_marker',b'R1V_FAKE_' not in file.read_bytes() and not file.read_bytes().startswith(b'PGDMP'))
    # Negative restoration uses an actual wrong private key, so no fallback to
    # an environment or shared/clinical key is possible.
    wrong_home=TEMP_KEY_BASE/'wrong_recovery';wrong_home.mkdir(mode=0o700)
    other_fpr=generate_key(wrong_home)
    verify_env={'HOME':str(Path.home()),'PATH':env['PATH'],
                'WS_R1V_RESTORE_FIXTURE_ONLY':'fictional-only'}
    dummy_dest=EVIDENCE/'restored-independent'
    bad=run(['/usr/bin/python3',str(RESTORE),'--fixture','--generation',str(gen),
            '--private-gpg-home',str(wrong_home),'--destination-container',DST,
            '--restore-dir',str(dummy_dest)],env=verify_env,check=False)
    prove('wrong_recovery_key_fails_without_any_restore',bad.returncode==70 and ('RECOVERY_KEY_NOT_MATCHED' in bad.stderr or 'RECOVERY_PRIVATE_KEY_UNAVAILABLE' in bad.stderr) and not dummy_dest.exists())
    # Missing and tampered archive fail manifest preflight BEFORE opening GPG.
    archive=gen/'files.tar.gpg'
    archive_tmp=gen/'files.tar.gpg.quarantine'
    archive.rename(archive_tmp)
    missing=run(['/usr/bin/python3',str(RESTORE),'--fixture','--generation',str(gen),
            '--private-gpg-home',str(private),'--destination-container',DST,
            '--restore-dir',str(dummy_dest)],env=verify_env,check=False)
    prove('missing_archive_recovery_refused',missing.returncode==70 and 'INCOMPLETE_OR_EXTRA' in missing.stderr)
    archive_tmp.rename(archive)
    original_cipher=archive.read_bytes()
    altered=bytearray(original_cipher);altered[len(altered)//2]^=1
    archive.write_bytes(altered);archive.chmod(0o600)
    tampered=run(['/usr/bin/python3',str(RESTORE),'--fixture','--generation',str(gen),
            '--private-gpg-home',str(private),'--destination-container',DST,
            '--restore-dir',str(dummy_dest)],env=verify_env,check=False)
    prove('tampered_ciphertext_recovery_refused',tampered.returncode==70 and 'CIPHERTEXT_SIZE_OR_DIGEST_DRIFT' in tampered.stderr)
    archive.write_bytes(original_cipher);archive.chmod(0o600)
    prove('original_ciphertext_reverified',fingerprint(archive)==manifest['fileVault']['sha256'])
    # SOURCE DESTRUCTION: both original DB and all five live-shaped fake volumes
    # are removed before the independent process may restore anything.
    docker('stop','--time','4',SRC,timeout=20)
    CONTAINERS.remove(SRC)
    prove('original_pg_container_destroyed',not docker('ps','-aq','--filter','name=^/'+SRC+'$').stdout.strip())
    shutil.rmtree(fixture_root)
    prove('all_five_original_fake_file_volumes_destroyed',not fixture_root.exists())
    start_pg(DST)
    restored=run(['/usr/bin/python3',str(RESTORE),'--fixture','--generation',str(gen),
            '--private-gpg-home',str(private),'--destination-container',DST,
            '--restore-dir',str(dummy_dest)],env=verify_env,timeout=125)
    result=json.loads(restored.stdout)
    prove('separate_independent_restore_executable_passes',result['status'].startswith('R1V_FICTIONAL_INDEPENDENT_DB_AND_FIVE_VOLUME_RESTORE_PASS'))
    sql=docker('exec',DST,'psql','-XAtq','-U','fict','-d','ws_fixture',
            '-c',"SELECT COUNT(*) = 2 AND COUNT(*) FILTER (WHERE body LIKE 'R1V_FAKE_WRITER_%') = 2 FROM fictional_works;")
    prove('exactly_two_database_records_restored_from_ciphertext',sql.stdout.strip()=='t')
    recovered={str(p.relative_to(dummy_dest)):fingerprint(p) for p in dummy_dest.rglob('*') if p.is_file()}
    prove('all_six_original_files_exactly_recovered',recovered==originals)
    prove('exactly_five_volumes_restored',len({p.split('/')[0] for p in recovered})==5)
    METRICS.update({'sourcePgRows':2,'restoredPgRows':2,'fileVolumes':5,
                    'restoredSyntheticFiles':6,'encryptedBytes':sum((gen/n).stat().st_size for n in ['postgres.pgdump.gpg','files.tar.gpg'])})
    shutil.rmtree(dummy_dest)
    prove('decrypted_restore_files_removed',not dummy_dest.exists())
    prove('no_plaintext_database_dump_saved',not list(EVIDENCE.rglob('*.sql')) and not list(EVIDENCE.rglob('*.dump')))
    return True

def main():
    status='R1V_FICTIONAL_MINISFORUM_FULL_BACKUP_FIXTURE_HOLD'
    err=None
    try:
        run_demo()
        status='R1V_FICTIONAL_MINISFORUM_FIVE_VOLUME_ENCRYPTED_COLD_RESTORE_PASS_BETA_HOLD'
    except Exception as e:
        err=type(e).__name__+':'+str(e)[:180]
    finally:
        for name in list(CONTAINERS):
            docker('rm','-f','-v',name,timeout=22,check=False)
        if TEMP_KEY_BASE is not None and TEMP_KEY_BASE.exists():
            shutil.rmtree(TEMP_KEY_BASE,ignore_errors=True)
        CHECKS['no_fixture_pg_containers_left']=all(not docker('ps','-aq','--filter','name=^/'+n+'$',timeout=9,check=False).stdout.strip() for n in (SRC,DST))
        CHECKS['independent_private_keyrings_destroyed']=TEMP_KEY_BASE is not None and not TEMP_KEY_BASE.exists()
        if not all(CHECKS.values()):status='R1V_FIXTURE_OR_CLEANUP_FAILED_BETA_HOLD'
        receipt={'protocol':'soullab.ws.r1v.five-volume-server-shaped.fixture.v1',
            'status':status,'sourceHead':run(['git','rev-parse','HEAD']).stdout.strip(),
            'utc':datetime.now(timezone.utc).isoformat(),'checks':CHECKS,
            'metrics':METRICS,'error':err,
            'productionHostTouched':False,'actualMediaOrMemberFilesOpened':False,
            'productionCronModified':False,'productionSnapshotCoherenceCertified':False,
            'realMemberWriterBackupApproved':False}
        if EVIDENCE.is_dir():
            p=EVIDENCE/'R1V_SERVER_SHAPED_ENCRYPTED_COLD_RESTORE.json'
            with p.open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
            p.chmod(0o600)
        print(json.dumps({'status':status,'passedChecks':sum(CHECKS.values()),
                          'totalChecks':len(CHECKS),'error':err,'receipt':str(EVIDENCE)}))
    return 0 if status.endswith('PASS_BETA_HOLD') else 2
if __name__=='__main__':raise SystemExit(main())
