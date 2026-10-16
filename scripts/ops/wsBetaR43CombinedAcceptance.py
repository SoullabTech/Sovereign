#!/usr/bin/env python3
"""R43 combined Source/editorial/native-selection acceptance, HELD fictional only.

Re-run accepted R42 PG16 and R41 WebKit witnesses against the exact candidate,
plus R43 R39 signed one-use Apply/Undo PG16. Preserve original R41/R42
acceptance files: temporary launch copies rebind only the evidence destination.
No production route, user, KMS, provider, deployment, or networked DB.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import uuid
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-r43-author-choice-evidence-20261016')
EVIDENCE.mkdir(parents=True,exist_ok=True)
COMBINED=EVIDENCE/'R43_COMBINED_ACCEPTANCE_20261016.json'

def run(command,environment,timeout=240):
    r=subprocess.run(command,cwd=ROOT,env=environment,timeout=timeout,
      capture_output=True,text=True)
    return r.returncode,(r.stdout+'\n'+r.stderr)[-3500:]

def rebind_and_run(source,old,new,command,environment,timeout=240):
    original=(ROOT/source).read_text()
    if original.count(old)!=1:
        raise RuntimeError('R43_ORIGINAL_WITNESS_REBIND_MISMATCH')
    temporary=ROOT/'scripts/ops'/('_r43_ephemeral_'+uuid.uuid4().hex[:12]+source.suffix)
    try:
        temporary.write_text(original.replace(old,new))
        return run([*command,str(temporary)],environment,timeout)
    finally:
        temporary.unlink(missing_ok=True)

def all_true(checks):
    return isinstance(checks,dict) and all(v is True for v in checks.values())

def main():
    if os.environ.get('R43_COMBINED_ACCEPTANCE')!='fictional-only':
        raise RuntimeError('R43_COMBINED_EXPLICIT_FIXTURE_FLAG_REQUIRED')
    revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    branch=subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip()
    if branch!='fix/ws-beta-r43-accepted-source-native-studio-20261016':
        raise RuntimeError('R43_WRONG_BRANCH_REFUSED')
    if subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True).strip():
        raise RuntimeError('R43_UNCOMMITTED_SOURCE_CANNOT_CLAIM_EXACT_HEAD')
    outcome={'sourceCommit':revision,'branch':branch,'status':'HOLD',
      'releaseApproved':False,'originalProductionChanged':False,
      'stages':{},'checkedAt':datetime.now(timezone.utc).isoformat()}
    env=os.environ.copy()
    env['R42_PHYSICAL_PG16']='fictional-only'
    src=ROOT/'scripts/ops/wsBetaR42SourceDraftPG16.py'
    old="EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-release-r11-build-20261016')"
    new="EVIDENCE=Path('/Volumes/T7 Shield/ws-beta-r43-author-choice-evidence-20261016')"
    code,output=rebind_and_run(src.relative_to(ROOT),old,new,
      [sys.executable],env)
    report=json.loads((EVIDENCE/'R42_SOURCE_DRAFT_APPLY_UNDO_PG16_20261016.json').read_text())
    passed=code==0 and report.get('status')=='R42_SOURCE_AND_ENCRYPTED_INITIAL_DRAFT_ACTUAL_PG16_PASS_RELEASE_HELD' and all_true(report.get('checks'))
    outcome['stages']['acceptedOrderedSourceDraft']={
      'pass':passed,'exitCode':code,'checksPassed':sum(bool(x) for x in report.get('checks',{}).values()),
      'error':report.get('error')}
    if not passed:raise RuntimeError('R43_RECHECK_R42_HOLD_'+output[-250:])

    env2=os.environ.copy()
    env2['R41_EXACT_SELECTION_WEBKIT']='fictional-only'
    src=ROOT/'scripts/ops/wsBetaR41ExactAnchorWebkit.cjs'
    old="const receiptPath='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R41_REAL_EDITOR_SELECTION_WEBKIT_20261016.json';"
    new="const receiptPath='/Volumes/T7 Shield/ws-beta-r43-author-choice-evidence-20261016/R43_REAL_EDITOR_SELECTION_WEBKIT_20261016.json';"
    code,output=rebind_and_run(src.relative_to(ROOT),old,new,['node'],env2,110)
    report=json.loads((EVIDENCE/'R43_REAL_EDITOR_SELECTION_WEBKIT_20261016.json').read_text())
    passed=code==0 and report.get('status')=='R41_ACTUAL_EDITOR_SELECTION_WEBKIT_FICTITIOUS_PASS' and report.get('sourceHead')==revision and report.get('browserClosed') and report.get('noExternalCalls') and len(report.get('checks',[]))==11
    outcome['stages']['nativeEditorWebKit']={
      'pass':bool(passed),'exitCode':code,'checksPassed':len(report.get('checks',[])),
      'desktopWebkit':report.get('desktopWebkit'),'mobileWebkit':report.get('mobileWebkit'),
      'error':report.get('error')}
    if not passed:raise RuntimeError('R43_RECHECK_R41_HOLD_'+output[-250:])

    env3=os.environ.copy()
    env3['R39_PHYSICAL_PG16_FIXTURE']='fictional-only'
    env3['R43_AUTHOR_CHOICE_FIXTURE']='fictional-only'
    code,output=run([str(ROOT/'node_modules/.bin/tsx'),
      'scripts/ops/wsBetaR43AuthorChoicePG16.ts'],env3,150)
    report=json.loads((EVIDENCE/'R43_ONE_USE_CHOICE_ACTUAL_PG16_20261016.json').read_text())
    jest_log=(EVIDENCE/'R43_PG16_JEST_20261016.log').read_text()
    application_tests_ok='Tests:       23 passed, 23 total' in jest_log
    passed=code==0 and report.get('status')=='R43_AUTHOR_CHOICE_ACTUAL_PG16_FICTIONAL_PASS_RELEASE_HOLD' and report.get('testedGitHead')==revision and len(report.get('checks',[]))==10 and application_tests_ok and report.get('containerRemoved') and report.get('temporaryVaultRemoved')
    outcome['stages']['signedOneUseEditor']={
      'pass':bool(passed),'exitCode':code,'checksPassed':len(report.get('checks',[])),
      'applicationTestsPassed':23 if application_tests_ok else None,
      'error':report.get('errors')}
    if not passed:raise RuntimeError('R43_RECHECK_AUTHOR_CHOICE_HOLD_'+output[-250:])
    outcome['status']='R43_FICTIONAL_CONVERGED_REQUALIFICATION_PASS_RELEASE_HOLD'
    return outcome

if __name__=='__main__':
    result={'status':'R43_COMBINED_ACCEPTANCE_HOLD','releaseApproved':False,
      'error':None}
    try:
        result=main()
    except Exception as exc:
        result['error']=str(exc)[:330]
    COMBINED.write_text(json.dumps(result,indent=2)+'\n')
    os.chmod(COMBINED,0o600)
    print(json.dumps({'status':result['status'],
      'sourceCommit':result.get('sourceCommit'),
      'stages':result.get('stages',{}),
      'error':result.get('error'),'releaseApproved':False}))
    if result['status']!='R43_FICTIONAL_CONVERGED_REQUALIFICATION_PASS_RELEASE_HOLD':
        sys.exit(2)
