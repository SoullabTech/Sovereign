"""Synthetic compose acceptance for MAIA-only optional Reflect invitation config. No containers, no real credentials."""
import os, json, pathlib, re, subprocess, tempfile
SOURCE=pathlib.Path(__file__).resolve().parents[2]/'docker-compose.production.yml'
src=SOURCE.read_text()
assert src.count('path: .env.pro-studio-reflect-beta')==1, 'private, optional scope missing'
assert src.count('required: false')>=1, 'optional file would block old/non-beta deployments'
assert 'PRO_STUDIO_REFLECT_BETA_MEMBER_IDS' not in src.split('services:')[0], 'member scope must not be a build argument'
updated=src
repo=SOURCE.parent
assert subprocess.run(['git','-C',str(repo),'check-ignore','-q','.env.pro-studio-reflect-beta'],
  capture_output=True).returncode==0, 'private operator env file is not Git-ignored'
with tempfile.TemporaryDirectory(prefix='reflect-service-scoped-',dir='/tmp') as d:
 root=pathlib.Path(d)
 (root/'docker-compose.production.yml').write_text(updated)
 # Values are fictional and are not sourced from production or user credentials.
 (root/'.env.production').write_text('DOMAIN=example.invalid\nDATABASE_URL=postgresql://fiction:fiction-only@example.invalid/fiction\nTURN_STATIC_AUTH_SECRET=fiction-only\nTURN_EXTERNAL_IP=192.0.2.1\n')
 private=root/'.env.pro-studio-reflect-beta'
 env=os.environ.copy()
 env.pop('PRO_STUDIO_REFLECT_BETA_ENABLED',None)
 env.pop('PRO_STUDIO_REFLECT_BETA_MEMBER_IDS',None)
 def check(label, enabled=None):
  if enabled is not None:
   private.write_text('PRO_STUDIO_REFLECT_BETA_ENABLED='+enabled+'\nPRO_STUDIO_REFLECT_BETA_MEMBER_IDS=11111111-1111-4111-8111-111111111111\n')
   private.chmod(0o600)
  else:
   private.unlink(missing_ok=True)
  q=subprocess.run(['docker','compose','--env-file',str(root/'.env.production'),'-p','reflect-synthetic-preflight','--project-directory',str(root),
      '-f',str(root/'docker-compose.production.yml'),'config','--format','json'],
      capture_output=True,text=True,env=env,timeout=50)
  assert q.returncode==0,(label,q.stderr[-2000:])
  services=json.loads(q.stdout)['services']
  keys=['PRO_STUDIO_REFLECT_BETA_ENABLED','PRO_STUDIO_REFLECT_BETA_MEMBER_IDS']
  maia=services['maia']['environment']
  otherServices=[(service,[k for k in keys if k in spec.get('environment',{})])
     for service,spec in services.items() if service!='maia']
  leaks=[name for name,k in otherServices if k]
  assert not leaks,(label,leaks)
  if enabled is None:
    assert all(k not in maia for k in keys),(label,'missing optional file must not create gate')
  else:
    assert maia['PRO_STUDIO_REFLECT_BETA_ENABLED']==enabled
    assert maia['PRO_STUDIO_REFLECT_BETA_MEMBER_IDS']=='11111111-1111-4111-8111-111111111111'
  result={'label':label,'servicesCount':len(services),'maiaKeysPresent':[k for k in keys if k in maia],
    'otherServicesWithMemberIds':leaks,'containersStarted':0,'holdsWhenAbsent':enabled is None}
  print('COMPOSE_SYNTHETIC_PASS',json.dumps(result),flush=True)
  return result
 absent=check('optional-file-absent')
 enabled=check('fictional-single-member-opt-in','true')
 disabled=check('fictional-single-member-flag-disabled','false')
 print('COMPOSE_SERVICE_SCOPED_OPTIONAL_FLAG_PASS',flush=True)
