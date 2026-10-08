#!/usr/bin/env python3
"""Synthetic Mac review: fixed source HEAD, command/exit receipt, logs and hashes. No provider access."""
import os, sys, json, time, hashlib, datetime, subprocess, shlex, signal, concurrent.futures
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]
PINNED='3eefdeb81fc39e24e328182d845ad3e024a3ef32'
sha=lambda b:hashlib.sha256(b).hexdigest()
node=subprocess.check_output(['which','node'],text=True).strip()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()
assert head==PINNED, 'REFUSE_UNREVIEWED_HEAD:'+head
assert (REPO/'node_modules/typescript/bin/tsc').exists()
env={k:v for k,v in os.environ.items() if k in ('PATH','HOME','TMPDIR','LANG','LC_ALL','USER','SHELL')}
c=[
 ('prelive-proof-1','scripts/builder/__tests__/jev-wire-prelive-wrapper-v1-proof.mjs',90),
 ('prelive-proof-2','scripts/builder/__tests__/jev-wire-prelive-wrapper-v1-proof.mjs',90),
 ('prelive-proof-3','scripts/builder/__tests__/jev-wire-prelive-wrapper-v1-proof.mjs',90),
 ('prelive-matrix','scripts/builder/__tests__/jev-wire-prelive-wrapper-v1-matrix.mjs',90),
 ('prelive-mac-t7','scripts/builder/__tests__/jev-wire-prelive-two-volume-witness.mjs',90),
 ('adapter-proof','scripts/builder/__tests__/jev-wire-http-adapter-v1-proof.mjs',90),
 ('adapter-matrix','scripts/builder/__tests__/jev-wire-http-adapter-v1-matrix.mjs',270),
 ('checkpoint-proof','scripts/builder/__tests__/jev-wire-checkpoint-v1-proof.mjs',90),
 ('checkpoint-matrix','scripts/builder/__tests__/jev-wire-checkpoint-v1-matrix.mjs',270),
 ('wire-proof','scripts/builder/__tests__/jev-wire-v1-proof.mjs',90),
 ('wire-matrix','scripts/builder/__tests__/jev-wire-v1-matrix.mjs',270),
 ('findings-old','scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs',90),
 ('findings-new','scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs',90),
 ('J1-host','scripts/builder/__tests__/jev-judgment-host-v1-proof.mjs',90),
 ('J1-freeze','scripts/verify-jarvis-jev-j1-freeze.mjs',90),
 ('J1-matrix','node_modules/tsx/dist/cli.mjs',120),
 ('J1-typecheck','node_modules/typescript/bin/tsc',120),
]
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(entry):
 name,script,timeout=entry
 args=[node,script]
 if name=='prelive-mac-t7':args+=['/Volumes/T7 Shield']
 if name=='findings-old':args+=['old']
 if name=='findings-new':args+=['new']
 if name=='J1-matrix':args+=['tests/constitutional/jarvis-jev-j1/matrix.ts']
 if name=='J1-typecheck':args+=['-p','tsconfig.jarvis-jev-j1.json']
 fpath=HERE/(name+'.log.txt');started=now();t0=time.monotonic();code=None;error=None
 with fpath.open('w') as f:
  f.write(f"COMMAND={shlex.join(args)}\nCWD={REPO}\nSOURCE_HEAD={head}\nSTARTED_AT={started}\n\n");f.flush()
  try:
   proc=subprocess.Popen(args,cwd=REPO,env=env,stdout=f,stderr=subprocess.STDOUT,start_new_session=True)
   try:code=proc.wait(timeout=timeout)
   except subprocess.TimeoutExpired:
    error='TIMEOUT';os.killpg(proc.pid,signal.SIGTERM)
    try:code=proc.wait(timeout=4)
    except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);code=proc.wait()
  except Exception as ex:error=type(ex).__name__
  f.write(f"\nEXIT_CODE={code}\nERROR={error}\nFINISHED_AT={now()}\n")
 return {'name':name,'args':args,'exit_code':code,'error':error,'sha256':sha(fpath.read_bytes()),
  'duration_sec':round(time.monotonic()-t0,3),'started_at':started,'finished_at':now(),'log':str(fpath.relative_to(REPO))}
print('START',head,'commands',len(c),flush=True)
done={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 fs=[pool.submit(run,entry) for entry in c]
 for f in concurrent.futures.as_completed(fs):
  row=f.result();done[row['name']]=row
  print(row['name'],'EXIT',row['exit_code'],'ERROR',row['error'],'LOG_SHA256',row['sha256'],flush=True)
ordered=[done[e[0]] for e in c]
source_diff=subprocess.check_output(['git','diff','--name-only','HEAD','--','scripts/builder','package.json'],cwd=REPO,text=True).strip()
result={'head':head,'generated_at':now(),'commands':ordered,'source_changed':bool(source_diff),
 'all_pass':all(r['exit_code']==0 and r['error'] is None for r in ordered),
 'typecheck_scope':'J1 only','fake_transports_only':True,'credentials_supplied':'dummy only'}
(HERE/'receipt.json').write_text(json.dumps(result,indent=2)+'\n')
for row in ordered:
 body=(HERE/(row['name']+'.log.txt')).read_text()
 for line in body.splitlines():
  if any(k in line for k in ('passed ·','named kills','killed on their named check','findings reproduce','FREEZE INTACT','survivors','\"tests\":\"PASS\"')):print('  '+row['name']+' '+line[:200],flush=True)
print('RECEIPT_SHA256',sha((HERE/'receipt.json').read_bytes()),flush=True)
print('ALL_PASS',result['all_pass'],'SOURCE_UNCHANGED',not result['source_changed'],flush=True)
sys.exit(0 if result['all_pass'] and not result['source_changed'] else 1)
