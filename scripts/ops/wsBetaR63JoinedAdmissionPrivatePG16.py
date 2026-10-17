#!/usr/bin/env python3
"""R63: ONE disposable PostgreSQL16 + AES-GCM vault joining R61/R62 held
admission, actual R56 SQL auth/consent/Work, R57/R47 private preview and
actual Next.js protected-readiness GET. No route mount, writer writes or KMS.
"""
import importlib.util
import json
import os
import secrets
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
REQUIRED={
    'R47_PHYSICAL_PG16':'fictional-only',
    'R55_REAL_PC3_CONVERGENCE_FIXTURE':'fictional-only',
    'R57_REAL_PRIVATE_PG16_FIXTURE':'fictional-only',
    'R59_JOINT_NEXT_PRIVATE_FIXTURE':'fictional-only',
    'R61_HELD_AUTHOR_POST_FIXTURE':'fictional-only',
    'R63_JOINT_HELD_PRIVATE_FIXTURE':'fictional-only',
    'R63_REAL_SQL_PRIVATE_PG16':'fictional-only',
    'NODE_ENV':'test',
}
def capture(*argv):
    return subprocess.run(argv,cwd=ROOT,text=True,capture_output=True,timeout=18)
def main():
    if any(os.environ.get(k)!=v for k,v in REQUIRED.items()):
        print('R63_EXACT_FICTIONAL_FLAGS_REQUIRED')
        return 3
    sha=capture('git','rev-parse','HEAD')
    status=capture('git','status','--porcelain')
    if sha.returncode or status.returncode:
        print('R63_SOURCE_CUSTODY_UNAVAILABLE');return 3
    head=sha.stdout.strip()
    expected=os.environ.get('R63_TESTED_SOURCE_SHA')
    if expected and head!=expected:
        print('R63_EXACT_SOURCE_SHA_MISMATCH');return 3
    dirty=bool(status.stdout.strip())
    if dirty and os.environ.get('R63_PRECOMMIT_REHEARSAL')!='fictional-only':
        print('R63_EXACT_SOURCE_REQUIRES_CLEAN_WORKTREE');return 3
    source=ROOT/'scripts/ops/wsBetaR57PrivateCurrentSessionPG16.py'
    spec=importlib.util.spec_from_file_location('r63_accepted_private_fixture',source)
    if spec is None or spec.loader is None:
        print('R63_ACCEPTED_R57_DRIVER_MISSING');return 3
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    evidence=Path(
      '/Volumes/T7 Shield/ws-beta-r63-held-private-evidence-20261017')/(
       'run-'+secrets.token_hex(7))
    if evidence.exists():
        print('R63_EVIDENCE_COLLISION');return 3
    module.EVIDENCE=evidence
    module.PHASE1=evidence/'R63_ONE_DATABASE_INITIAL_JEST.log'
    module.COLD=evidence/'R63_FRESH_PROCESS_PRIVATE_RECOVERY_JEST.log'
    module.RECEIPT=evidence/'R63_PRIVATE_PG16_CUSTODY.json'
    code=module.main()
    if code:
        print('R63_PRIVATE_SQL_RECONCILIATION_HELD')
        return code
    receipt=json.loads(module.RECEIPT.read_text())
    checks=receipt.get('checks') or {}
    required_checks=(
        'postgres16','loopbackOnly','noHostMounts',
        'initialPrivateReviewTests','intentionBeforeCipher',
        'metadataOnlySqlDump','fileVaultOnlyCiphertext',
        'reservedMissingCipherHeld','verifiedImmutable',
        'postgresSIGKILLRestored','newNodeColdRecovery',
        'containerRemoved','vaultRemoved','keyFixtureRemoved',
    )
    if (receipt.get('sourceHead')!=head or
        not all(checks.get(k) is True for k in required_checks) or
        not receipt.get('noDurableApplyOrUndoFromThisService')):
        print('R63_EXACT_CUSTODY_EVIDENCE_REFUSED');return 2
    initial=module.PHASE1.read_text()
    cold=module.COLD.read_text()
    if ('9 passed, 9 total' not in initial or
        'R63_JOINED_SQL_POST_PRIVATE_PREVIEW_WITHDRAWAL_PASS' not in initial or
        '5 passed, 5 total' not in cold):
        print('R63_JOINT_TEST_OR_COLD_RECOVERY_MISSING');return 2
    result={
       'protocol':'soullab.ws.r63.one-sql-held-author-private-preview.v1',
       'sourceCommit':head,'dirtyPrecommit':dirty,
       'disposition':'R63_LOCAL_FICTIONAL_PASS_BETA_HOLD',
       'joinedR61R56R57R47SQLPreview':True,
       'realNextReadinessStill423':True,
       'fictionalInitialTestsPassed':9,
       'freshProcessColdTestsPassed':5,
       'privateCustodyAndCleanupChecks':len(required_checks),
       'realMemberWrites':0,'operationalKmsUsed':False,
       'liveAuthorRouteMounted':False,
       'applyOrUndoAuthorized':False,'releaseApproved':False,
       'privateReceipt':str(module.RECEIPT),
    }
    evidence.joinpath('R63_EXACT_JOINED_ACCEPTANCE.json').write_text(
     json.dumps(result,indent=2)+'\n')
    print(json.dumps(result))
    return 0
if __name__=='__main__':sys.exit(main())
