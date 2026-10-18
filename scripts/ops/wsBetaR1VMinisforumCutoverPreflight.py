#!/usr/bin/env python3
"""R1V offline-only source-specific controlled backup-cutover readiness model.
Reads one synthetic or sanitized inventory JSON file, never SSH/Docker/prod.
No release decision overrides R1V_PRODUCTION_CUTOVER_RELEASED=False.
"""
import argparse
import json
from pathlib import Path
import re
import sys

R1V_LIVE_RELEASED=False
REQUIRED_MOUNTS={
    '/app/data/media':'maia-sovereign_media_data',
    '/app/data/vault':'maia-sovereign_vault_data',
    '/app/storage/voice-notes':'maia-sovereign_voice_notes_data',
    '/app/data/workbench':'maia-sovereign_workbench_data',
    '/app/data/audit-logs':'maia-sovereign_audit_data',
}
DB_CONTAINER='maia-postgres'
DB_NAME='maia_consciousness'
DB_ROLE='soullab'
ROOT_BACKUP_SHA='5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f'
USER_BACKUP_SHA='f7288be2e117d63de82ade4b16628502303b4827c2732cdd5fc5c828526c78f9'
ROOT_CRON_SHA='9d13aecae92f0b4619f3ac65d38dadd8b5a9c8407eecab234b4e141e9f4086ac'
WRITER_CONTAINERS=('maia-sovereign','maia-api','maia-media-worker','maia-comms-worker',
                   'maia-summary-worker','maia-staging','maia-rlm')


def inspect_receipt(r:dict):
    blocks=[]
    def stop(reason,ok):
        if not ok:blocks.append(reason)
    stop('live_release_not_authorized',R1V_LIVE_RELEASED)
    stop('wrong_host',r.get('hostname')=='soullab')
    stop('wrong_postgres_identity',r.get('postgresContainer')==DB_CONTAINER and
         r.get('postgresDatabase')==DB_NAME and r.get('postgresRole')==DB_ROLE)
    stop('source_postgres_not_running',r.get('postgresRunning') is True)
    mounts=r.get('mounts',{})
    stop('docker_mounts_not_a_dict',isinstance(mounts,dict))
    if isinstance(mounts,dict):
        for dest,volume in REQUIRED_MOUNTS.items():
            stop('missing_or_wrong_volume_'+volume,mounts.get(dest)==f'/var/lib/docker/volumes/{volume}/_data')
    stop('missing_db_volume_binding',r.get('postgresVolume')=='/var/lib/docker/volumes/maia-sovereign_postgres_data/_data')
    stop('root_backup_source_changed',r.get('rootScriptSha256')==ROOT_BACKUP_SHA)
    stop('user_backup_source_changed',r.get('userScriptSha256')==USER_BACKUP_SHA)
    stop('root_cron_source_changed',r.get('rootCronSha256')==ROOT_CRON_SHA)
    # The two current jobs MUST be stopped as a separately authorized step;
    # neither this validator nor the encrypted writer may modify cron.
    stop('root_legacy_backup_still_enabled',r.get('rootLegacyCronEnabled') is False)
    stop('user_legacy_backup_still_enabled',r.get('userLegacyCronEnabled') is False)
    runners=r.get('applicationWritersRunning',{})
    stop('application_writer_states_not_available',isinstance(runners,dict))
    if isinstance(runners,dict):
        for name in WRITER_CONTAINERS:
            stop('member_mutation_writer_not_quiesced_'+name,runners.get(name) is False)
    stop('server_root_disk_headroom_unverified',type(r.get('serverDiskGiBFree')) in (int,float) and r['serverDiskGiBFree']>=50)
    stop('nas_capacity_unverified',type(r.get('nasGiBFree')) in (int,float) and r['nasGiBFree']>=50)
    stop('nas_ciphertext_destination_unqualified',r.get('nasMountedSource')=='//192.168.4.42/soullab-backups' and r.get('nasFileSystem')=='cifs')
    stop('verified_external_gpg_public_recipient_missing',bool(re.fullmatch(r'[A-F0-9]{40}',r.get('approvedPublicRecipientFingerprint',''))))
    stop('off_host_private_recovery_key_not_custodied',r.get('offHostRecoveryPrivateKeyVerified') is True)
    stop('signed_complete_manifest_not_qualified',r.get('tamperEvidentGenerationSignatureVerified') is True)
    stop('sql_file_wal_quiescence_barrier_unqualified',r.get('sqlAndVaultQuiescenceProof') is True)
    stop('source_attachments_and_external_binds_unqualified',r.get('originalSourceExternalBindScopeComplete') is True)
    stop('erasure_nonresurrection_unqualified',r.get('memberDeletionNonresurrectionVerified') is True)
    stop('independent_full_offsite_cold_restore_not_proven',r.get('independentOffsiteRestoreApproved') is True)
    stop('operator_change_window_unapproved',r.get('founderExactBackupCutoverApproved') is True)
    return {'protocol':'soullab.ws.r1v.minisforum.production-preflight.review-only.v1',
       'decision':'HOLD','productionLiveBackupReleased':False,
       'matchedVolumeBindings':sum(mounts.get(d)==f'/var/lib/docker/volumes/{v}/_data' for d,v in REQUIRED_MOUNTS.items()) if isinstance(mounts,dict) else 0,
       'expectedVolumes':len(REQUIRED_MOUNTS),'blockers':blocks,
       'wouldBeEligibleAbsentCompileTimeHold':len(blocks)==1 and blocks[0]=='live_release_not_authorized',
       'neverChangesCronOrExecutesBackup':True}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--fixture-inventory',required=True)
    a=p.parse_args()
    path=Path(a.fixture_inventory)
    if (path.parent!=Path('/Volumes/T7 Shield') or
        not path.name.startswith('ws-beta-r1v-') or path.is_symlink()):
        print('R1V_PREFLIGHT_REFUSED_NOT_A_SANITIZED_FIXTURE',file=sys.stderr)
        return 70
    try:
        data=json.loads(path.read_text())
        if not isinstance(data,dict):raise ValueError('not object')
    except (OSError,ValueError):
        print('R1V_PREFLIGHT_REFUSED_INVALID_INVENTORY',file=sys.stderr)
        return 70
    print(json.dumps(inspect_receipt(data),indent=2))
    return 0
if __name__=='__main__':raise SystemExit(main())
