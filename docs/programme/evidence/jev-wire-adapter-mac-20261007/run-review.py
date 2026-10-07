import os,sys,json,subprocess,hashlib,datetime,signal,shlex,concurrent.futures
from pathlib import Path
repo=Path('/Users/soullab/jev-wire-adapter-review-20261007')
out=Path('/Users/soullab/jev-wire-adapter-review-evidence-20261007')
node=subprocess.check_output(['which','node'],text=True).strip()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
assert head=='76fe39b2300a1e7d18bc953893c80f42c195c15c'
assert not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip()
env={k:v for k,v in os.environ.items() if k in ['PATH','HOME','TMPDIR','LANG','LC_ALL','SYSTEMROOT','SHELL']}
checks=[]
for category in ['http-adapter','checkpoint']:
 for n in [1,2,3]:checks.append((category+'-proof-'+str(n),[node,'scripts/builder/__tests__/jev-wire-'+category+'-v1-proof.mjs'],120))
 checks.append((category+'-matrix',[node,'scripts/builder/__tests__/jev-wire-'+category+'-v1-matrix.mjs'],420))
checks += [
 ('wire-proof',[node,'scripts/builder/__tests__/jev-wire-v1-proof.mjs'],120),
 ('wire-matrix',[node,'scripts/builder/__tests__/jev-wire-v1-matrix.mjs'],420),
 ('findings-old',[node,'scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs','old'],120),
 ('findings-new',[node,'scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs','new'],120),
 ('J1-freeze',[node,'scripts/verify-jarvis-jev-j1-freeze.mjs'],60),
 ('J1-host',[node,'scripts/builder/__tests__/jev-judgment-host-v1-proof.mjs'],60),
 ('J1-matrix',[node,'node_modules/tsx/dist/cli.mjs','tests/constitutional/jarvis-jev-j1/matrix.ts'],120),
 ('J1-typecheck',[node,'node_modules/typescript/bin/tsc','-p','tsconfig.jarvis-jev-j1.json'],120)]
receipt={'head':head,'code_test_commit':'0dadf2f8a3567a653a8d644a2a1a26afad57289b','cwd':str(repo),'tests':'loopback mock and fake transports only','credential':'dummy only; test environment allowlisted','new_packages_installed':False,'checks':[]}
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(item):
 name,cmd,limit=item;path=out/(name+'.log');start=now();error=None
 with open(path,'x') as log:
  os.chmod(path,0o600)
  log.write('COMMAND='+shlex.join(cmd)+'\nHEAD='+head+'\nCWD='+str(repo)+'\nSTARTED_AT='+start+'\n');log.flush()
  p=subprocess.Popen(cmd,cwd=repo,stdout=log,stderr=subprocess.STDOUT,start_new_session=True,env=env)
  try:code=p.wait(timeout=limit)
  except subprocess.TimeoutExpired:
   error='TIMEOUT';os.killpg(p.pid,signal.SIGTERM)
   try:p.wait(timeout=3)
   except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
   code=p.returncode
  end=now();log.write('\nEXIT_CODE='+str(code)+'\nEXECUTION_ERROR='+str(error)+'\nFINISHED_AT='+end+'\n')
 return {'name':name,'command':cmd,'started_at':start,'finished_at':end,'exit_code':code,'error':error,'log':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for f in concurrent.futures.as_completed([pool.submit(run,c) for c in checks]):
  row=f.result();receipt['checks'].append(row)
  (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');os.chmod(out/'receipt.json',0o600)
  print(row['name']+' EXIT_CODE='+str(row['exit_code'])+' SHA256='+row['sha256'],flush=True)
  lines=Path(row['log']).read_text().splitlines()
  for line in lines:
   if any(x in line for x in ['passed ·','candidates killed on','findings reproduce','named kills','survivors ','FREEZE INTACT']) or line.startswith(('failures:','passes:')):print(line,flush=True)
  if row['error'] or row['exit_code']!=0:print('\n'.join(lines[-20:]),flush=True)
receipt['checks'].sort(key=lambda r:next(i for i,x in enumerate(checks) if x[0]==r['name']))
receipt['all_pass']=all(r['exit_code']==0 and r['error'] is None for r in receipt['checks'])
receipt['source_clean']=not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip()
(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('RECEIPT_SHA256='+hashlib.sha256((out/'receipt.json').read_bytes()).hexdigest(),flush=True)
print('ALL_PASS='+str(receipt['all_pass'])+' SOURCE_CLEAN='+str(receipt['source_clean']),flush=True)
sys.exit(0 if receipt['all_pass'] and receipt['source_clean'] else 1)
