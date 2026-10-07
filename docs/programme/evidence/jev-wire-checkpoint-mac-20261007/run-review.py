import os, sys, json, subprocess, hashlib, datetime, signal, shlex
from pathlib import Path
repo=Path('/Users/soullab/jev-wire-checkpoint-review-20261007')
out=Path('/Users/soullab/jev-wire-checkpoint-review-evidence-20261007')
node=subprocess.check_output(['which','node'],text=True).strip()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
assert head=='380b29a4aebdc6ec8d9d9bd1d6dcbeef47d30d5b'
assert not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip()
checks=[
 ('checkpoint-proof-1',[node,'scripts/builder/__tests__/jev-wire-checkpoint-v1-proof.mjs'],120),
 ('checkpoint-proof-2',[node,'scripts/builder/__tests__/jev-wire-checkpoint-v1-proof.mjs'],120),
 ('checkpoint-proof-3',[node,'scripts/builder/__tests__/jev-wire-checkpoint-v1-proof.mjs'],120),
 ('checkpoint-matrix',[node,'scripts/builder/__tests__/jev-wire-checkpoint-v1-matrix.mjs'],240),
 ('findings-old',[node,'scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs','old'],120),
 ('findings-new',[node,'scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs','new'],120),
 ('wire-proof',[node,'scripts/builder/__tests__/jev-wire-v1-proof.mjs'],120),
 ('wire-matrix',[node,'scripts/builder/__tests__/jev-wire-v1-matrix.mjs'],300),
 ('J1-freeze',[node,'scripts/verify-jarvis-jev-j1-freeze.mjs'],60),
 ('J1-host',[node,'scripts/builder/__tests__/jev-judgment-host-v1-proof.mjs'],60),
 ('J1-matrix',[node,'node_modules/tsx/dist/cli.mjs','tests/constitutional/jarvis-jev-j1/matrix.ts'],120),
 ('J1-typecheck',[node,'node_modules/typescript/bin/tsc','-p','tsconfig.jarvis-jev-j1.json'],120),
]
receipt={'head':head,'code_test_commit':'a8680700b324d3d1fe9029d0dd23d08908c27e82','cwd':str(repo),'all_transports_fake':True,'credentials_accessed':False,'provider_calls':0,'checks':[]}
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
for name,cmd,limit in checks:
 path=out/(name+'.log')
 start=now(); code=None; error=None
 with open(path,'x') as log:
  os.chmod(path,0o600)
  log.write('COMMAND='+shlex.join(cmd)+'\nHEAD='+head+'\nCWD='+str(repo)+'\nSTARTED_AT='+start+'\n');log.flush()
  p=subprocess.Popen(cmd,cwd=repo,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  try: code=p.wait(timeout=limit)
  except subprocess.TimeoutExpired:
   error='TIMEOUT';os.killpg(p.pid,signal.SIGTERM)
   try:p.wait(timeout=3)
   except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
   code=p.returncode
  end=now();log.write('\nEXIT_CODE='+str(code)+'\nEXECUTION_ERROR='+str(error)+'\nFINISHED_AT='+end+'\n')
 row={'name':name,'command':cmd,'started_at':start,'finished_at':end,'exit_code':code,'error':error,'log':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
 receipt['checks'].append(row)
 receipt['source_clean']=not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip()
 (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');os.chmod(out/'receipt.json',0o600)
 print(name+' EXIT_CODE='+str(code)+' SHA256='+row['sha256'],flush=True)
 lines=path.read_text().splitlines()
 for line in lines:
  if ('passed ·' in line or 'candidates killed on' in line or 'findings reproduce' in line or 'named kills' in line or 'survivors ' in line or 'FREEZE INTACT' in line or line.startswith('failures:') or line.startswith('passes:')):print(line,flush=True)
 if error or code!=0:
  print('\n'.join(lines[-14:]),flush=True)
receipt['all_pass']=all(x['exit_code']==0 and x['error'] is None for x in receipt['checks'])
receipt['source_clean']=not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip()
(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('RECEIPT_SHA256='+hashlib.sha256((out/'receipt.json').read_bytes()).hexdigest(),flush=True)
print('ALL_PASS='+str(receipt['all_pass'])+' SOURCE_CLEAN='+str(receipt['source_clean']),flush=True)
sys.exit(0 if receipt['all_pass'] and receipt['source_clean'] else 1)
