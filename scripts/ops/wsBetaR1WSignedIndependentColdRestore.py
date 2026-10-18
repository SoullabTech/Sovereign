#!/usr/bin/env python3
"""R1W independent signature-verified PostgreSQL + 5-file-volume cold restore.

MUST verify BOTH ciphertext hashes AND externally pinned GPGV signature before
calling PostgreSQL restore or creating any restore file. Fixture-only and held.
Actual signer key and real offhost recovery procedures are NOT implemented.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import os
from pathlib import Path
import sys

from wsBetaR1WSignedGeneration import verify_signed,Refusal

R1W_REAL_SIGNED_PRODUCTION_RESTORE_ENABLED=False

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--fixture',action='store_true')
    p.add_argument('--certified-generation',required=True)
    p.add_argument('--trusted-public-keyring',required=True)
    p.add_argument('--expected-signer-fingerprint',required=True)
    p.add_argument('--private-decryption-home',required=True)
    p.add_argument('--destination-container',required=True)
    p.add_argument('--restore-directory',required=True)
    a=p.parse_args()
    if not a.fixture or os.environ.get('WS_R1W_RESTORE_FIXTURE_ONLY')!='fictional-only':
        print('R1W_SIGNED_RESTORE_REFUSED_DEFAULT_OFF',file=sys.stderr);return 70
    if R1W_REAL_SIGNED_PRODUCTION_RESTORE_ENABLED:
        print('R1W_SIGNED_RESTORE_REFUSED_PRODUCTION_RELEASE_INVALID',file=sys.stderr);return 70
    try:
        gen=Path(a.certified_generation)
        trust=Path(a.trusted_public_keyring)
        result=verify_signed(gen,trust,a.expected_signer_fingerprint.upper())
        # The verifier MUST run before even consulting the recovery secret home
        # or the destination container's status. Never downgrade to unsigned.
        if not result.get('actualManifestSignatureVerified'):
            raise Refusal('R1W_VERIFIED_SIGNER_REQUIRED')
        spec=importlib.util.spec_from_file_location(
            'r1v_trusted_independent_cold_restore',
            Path(__file__).with_name('wsBetaR1VIndependentColdRestore.py'))
        assert spec and spec.loader
        r1v=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(r1v)
        manifest=json.loads((gen/'manifest.json').read_text())
        recovery=Path(a.private_decryption_home)
        r1v.verified_private_home(recovery,manifest['recipientPublicFingerprint'])
        destination=Path(a.restore_directory)
        # Before any DB data write, ensure the full restoration root is a new
        # private destination under exactly this fixture root (not NAS/member).
        if destination.parent!=gen.parent.parent or destination.exists() or destination.name!='signed-restored-files':
            raise Refusal('R1W_UNQUALIFIED_RESTORE_DESTINATION')
        # Real R1V restorer enforces isolated labeled PG16 container and safe
        # tar extraction with exact file-count matching of all 5 required vols.
        r1v.restore_postgres(gen,recovery,a.destination_container)
        counts=r1v.restore_files(gen,recovery,destination,manifest['fileCountsByVolume'])
        print(json.dumps({
            'status':'R1W_SIGNED_FICTIONAL_INDEPENDENT_COLD_RESTORE_PASS_BETA_HOLD',
            'verifiedSignerFingerprint':result['signerFingerprint'],
            'signatureVerifiedBeforeDecrypt':True,'postgresRestored':True,
            'fiveVolumeFilesRestored':sum(counts.values()),
            'productionBackupQualified':False,'realMemberWriterBetaApproved':False,
        },sort_keys=True))
        return 0
    except (Refusal,Exception) as e:
        # R1V errors also refuse uniformly; do not reveal SQL or key details.
        if isinstance(e,KeyboardInterrupt):raise
        print('R1W_SIGNED_RESTORE_REFUSED_'+type(e).__name__,file=sys.stderr)
        return 70
if __name__=='__main__':raise SystemExit(main())
