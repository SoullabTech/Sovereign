#!/usr/bin/env python3
"""R59 held-only joint acceptance, reusing the exact R57 AES-GCM/private PG16
driver but additionally testing the REAL Next readiness GET handler in the
same disposable PostgreSQL DB and current synthetic consent epoch.

Never production. No network fetches, live accounts, provider, managed KMS,
branch push or public Next writer mutation. No changed accepted R57 runner.
"""
import importlib.util
import json
import os
from pathlib import Path
import secrets
import sys

ROOT=Path(__file__).resolve().parents[2]
HEAD_EXPECTED=os.environ.get('R59_TESTED_SOURCE_SHA')
REQUIRED={
    'R47_PHYSICAL_PG16':'fictional-only',
    'R55_REAL_PC3_CONVERGENCE_FIXTURE':'fictional-only',
    'R57_REAL_PRIVATE_PG16_FIXTURE':'fictional-only',
    'R59_JOINT_NEXT_PRIVATE_FIXTURE':'fictional-only',
    'R59_JOINED_PRIVATE_PG16':'fictional-only',
}
def main():
    if any(os.environ.get(k)!=v for k,v in REQUIRED.items()):
        print('R59_JOINT_NEXT_PRIVATE_FICTIONAL_FLAGS_REQUIRED')
        return 3
    import subprocess
    source=subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,text=True,
                          capture_output=True,timeout=10)
    status=subprocess.run(['git','status','--porcelain'],cwd=ROOT,text=True,
                          capture_output=True,timeout=10)
    head=source.stdout.strip()
    if source.returncode or status.returncode or status.stdout.strip():
        print('R59_REQUIRES_CLEAN_EXACT_SOURCE_FOR_PHYSICAL_TEST')
        return 3
    if HEAD_EXPECTED and HEAD_EXPECTED!=head:
        print('R59_EXACT_SOURCE_SHA_MISMATCH')
        return 3
    script=ROOT/'scripts/ops/wsBetaR57PrivateCurrentSessionPG16.py'
    spec=importlib.util.spec_from_file_location('r59_reused_r57_private',script)
    if spec is None or spec.loader is None:
        print('R59_NO_ACCEPTED_R57_PRIVATE_DRIVER')
        return 3
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    dest=Path('/Volumes/T7 Shield/ws-beta-r59-session-private-next-draft-evidence-20261016') / (
        'r59-joint-private-'+secrets.token_hex(5))
    if dest.exists():
        print('R59_EVIDENCE_ALREADY_PRESENT')
        return 4
    module.EVIDENCE=dest
    module.PHASE1=dest/'R59_REAL_NEXT_R47_PRIVATE_INITIAL_JEST.log'
    module.COLD=dest/'R59_PRIVATE_COLD_PROCESS_JEST.log'
    module.RECEIPT=dest/'R59_EXACT_NEXT_AND_PRIVATE_PG16.json'
    result=module.main()
    if result!=0:
        print('R59_JOINT_ACTUAL_NEXT_PRIVATE_CUSTODY_HELD')
        return result
    receipt=json.loads(module.RECEIPT.read_text())
    checks=receipt.get('checks') or {}
    expected=('initialPrivateReviewTests','newNodeColdRecovery',
              'metadataOnlySqlDump','fileVaultOnlyCiphertext',
              'containerRemoved','vaultRemoved','keyFixtureRemoved')
    if receipt.get('sourceHead')!=head or not all(checks.get(k) for k in expected):
        print('R59_EXACT_CUSTODY_VERIFICATION_FAILED')
        return 2
    first=module.PHASE1.read_text()
    if 'Tests:       9 passed, 9 total' not in first or (
        'R57 authentic local session + latest beta consent + R47 AES-GCM private review' not in first):
        print('R59_SINGLE_DATABASE_PRIVATE_TEST_MISSING')
        return 2
    print(json.dumps({'status':'R59_ONE_PG16_REAL_NEXT_AND_ENCRYPTED_PRIVATE_PREVIEW_PASS_RELEASE_HOLD',
                      'sourceHead':head,'checksPassed':len(checks),
                      'coldTestsPassed':5,'realMemberWrites':0,
                      'releaseApproved':False,'evidence':str(module.RECEIPT)}))
    return 0

if __name__=='__main__':
    sys.exit(main())
