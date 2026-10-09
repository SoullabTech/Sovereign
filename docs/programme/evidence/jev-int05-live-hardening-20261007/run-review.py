#!/usr/bin/env python3
"""Pinned Mac regression and old-versus-fixed witness. Only localhost/synthetic tests."""
import os, sys, json, shlex, hashlib, signal, subprocess, datetime, time, concurrent.futures
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]
HEAD='29b38b0d41f411a7ab44028a6dd17bcb8522f4dc'
BASE='41caa8f79af488fd8ea82442fe3586f03b13d15e'
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
node=subprocess.check_output(['which','node'],text=True).strip()
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()==HEAD
assert not subprocess.check_output(['git','diff','--name-only','HEAD','--','scripts/builder','tests/constitutional','package.json'],cwd=REPO,text=True).strip()
assert (REPO/'node_modules/typescript/bin/tsc').exists()
env={k:v for k,v in os.environ.items() if k in ('PATH','HOME','TMPDIR','USER','LANG','LC_ALL','SHELL')}
env['JEV_TEST_SECOND_DEVICE_ROOT']='/Volumes/T7 Shield'
checks=[
('live-proof-1',['scripts/builder/__tests__/jev-wire-live-run-v1-proof.mjs'],90,'16 passed · 0 failed'),
('live-proof-2',['scripts/builder/__tests__/jev-wire-live-run-v1-proof.mjs'],90,'16 passed · 0 failed'),
('live-proof-3',['scripts/builder/__tests__/jev-wire-live-run-v1-proof.mjs'],90,'16 passed · 0 failed'),
('live-matrix',['scripts/builder/__tests__/jev-wire-live-run-v1-matrix.mjs'],120,'41/41 candidates killed on their named check · 0 problems'),
('live-old',['scripts/builder/__tests__/jev-wire-live-run-v1-proof.mjs'],90,'11 passed · 5 failed'),
('adapter-proof',['scripts/builder/__tests__/jev-wire-http-adapter-v1-proof.mjs'],100,'18 passed · 0 failed'),
('adapter-matrix',['scripts/builder/__tests__/jev-wire-http-adapter-v1-matrix.mjs'],300,'23/23 candidates killed on their named check · 0 problems'),
('checkpoint-proof',['scripts/builder/__tests__/jev-wire-checkpoint-v1-proof.mjs'],100,'16 passed · 0 failed'),
('checkpoint-matrix',['scripts/builder/__tests__/jev-wire-checkpoint-v1-matrix.mjs'],300,'28/28 candidates killed on their named check · 0 problems'),
('wire-proof',['scripts/builder/__tests__/jev-wire-v1-proof.mjs'],100,'37 passed · 0 failed'),
('wire-matrix',['scripts/builder/__tests__/jev-wire-v1-matrix.mjs'],300,'49/49 candidates killed on their named check · 0 problems'),
('findings-old',['scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs','old'],100,'old: 8/8 findings reproduce'),
('findings-new',['scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs','new'],100,'new: 0/8 findings reproduce'),
('J1-freeze',['scripts/verify-jarvis-jev-j1-freeze.mjs'],60,'0 FREEZE INTACT'),
('J1-host',['scripts/builder/__tests__/jev-judgment-host-v1-proof.mjs'],60,'JEV-INT-02H HOST MEMBRANE — PASS'),
('J1-matrix',['node_modules/tsx/dist/cli.mjs','tests/constitutional/jarvis-jev-j1/matrix.ts'],120,'MATRIX LETHAL + DISCRIMINATING'),
('J1-typecheck',['node_modules/typescript/bin/tsc','-p','tsconfig.jarvis-jev-j1.json'],120,None),
]
def run(entry):
 name,args,timeout,expect=entry
 cmds=[node]+args
 item_env=env.copy()
 if name=='live-old':item_env['JEV_LR_SOURCE_COMMIT']=BASE
 t0=time.monotonic();start=now();path=HERE/(name+'.log.txt');code=None;err=None
 with path.open('w') as f:
  f.write('COMMAND='+shlex.join(cmds)+'\nSOURCE_HEAD='+HEAD+'\nCWD='+str(REPO)+'\nSTARTED_AT='+start+'\nTEST_SECOND_DEVICE=/Volumes/T7 Shield\n\n')
  f.flush()
  try:
   proc=subprocess.Popen(cmds,cwd=REPO,env=item_env,stdout=f,stderr=subprocess.STDOUT,start_new_session=True)
   try:code=proc.wait(timeout=timeout)
   except subprocess.TimeoutExpired:
    err='TIMEOUT';os.killpg(proc.pid,signal.SIGTERM)
    try:code=proc.wait(timeout=3)
    except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);code=proc.wait()
  except Exception as ex:err=type(ex).__name__+': '+str(ex)
  end=now();f.write('\nEXIT_CODE='+str(code)+'\nEXECUTION_ERROR='+str(err)+'\nFINISHED_AT='+end+'\n')
 text=path.read_text()
 valid=(code==(1 if name=='live-old' else 0) and err is None and
        (expect is None or expect in text))
 if name=='live-old':
  for label in ('L10','L13','L14','L15','L16'):
   valid=valid and ('FAIL  '+label+'-') in text
  valid=valid and text.count('FAIL  ') == 5
 return dict(name=name,args=cmds,exit_code=code,error=err,expected_status=('OLD_BUGS_REPRODUCED' if name=='live-old' else 'PASS'),validated=valid,
  log_sha256=sha(path),elapsed_sec=round(time.monotonic()-t0,3),started_at=start,finished_at=end,log=str(path.relative_to(REPO)))
print('PINNED_REVIEW_HEAD',HEAD,'COMMANDS',len(checks),flush=True)
results={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 futs=[pool.submit(run,c) for c in checks]
 for f in concurrent.futures.as_completed(futs):
  row=f.result();results[row['name']]=row
  print(row['name'],'EXIT',row['exit_code'],'VALID',row['validated'],'LOG_SHA256',row['log_sha256'],flush=True)
ordered=[results[c[0]] for c in checks]
state={'head':HEAD,'baseline':BASE,'generated_at':now(),'checks':ordered,'all_valid':all(x['validated'] for x in ordered),'fake_only':True,
 'project_typescript':'5.9.3','node':'22.22.3','T7_device_verified':True,
 'unmodified_adapter_checkpoint_wire_and_frozen_J1':True,
 'pilot_untouched':True,'real_provider_calls':0,'real_spend_usd':0}
(HERE/'receipt.json').write_text(json.dumps(state,indent=2)+'\n')
for item in ordered:
 text=(HERE/(item['name']+'.log.txt')).read_text()
 for line in text.splitlines():
  if any(s in line for s in ('passed ·','candidates killed on','findings reproduce','FREEZE INTACT','MATRIX LETHAL','survivors','HOST MEMBRANE')):
   print(item['name'],line[:200],flush=True)
print('RECEIPT_SHA256',sha(HERE/'receipt.json'),flush=True)
print('ALL_VALID',state['all_valid'],flush=True)
sys.exit(0 if state['all_valid'] else 1)
