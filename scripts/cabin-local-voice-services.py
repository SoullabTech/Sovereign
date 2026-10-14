"""Start only Cabin-owned speech engines from already-cached images; never pull."""
import subprocess,json,sys
from pathlib import Path
network='cabin-voice-local-20261014'
whisper='fedirz/faster-whisper-server@sha256:760e5e43d427dc6cfbbc4731934b908b7de9c7e6d5309c6a1f0c8c923a5b6030'
kokoro='sha256:76549cce3c5cc5ed4089619a9cffc3d39a041476ff99c5138cd18b6da832c4d7'
def run(args):return subprocess.check_output(['docker']+args,text=True,timeout=45).strip()
def inspect(name):
 try:return json.loads(run(['inspect',name]))[0]
 except subprocess.CalledProcessError:return None
if inspect(network) is None:run(['network','create','--internal',network])
if not json.loads(run(['network','inspect',network]))[0]['Internal']:raise SystemExit('Cabin speech network must be internal')
names=['cabin-whisper-local-20261014','cabin-kokoro-local-20261014']
for name,image,port in [(names[0],whisper,8000),(names[1],kokoro,8880)]:
 existing=inspect(name)
 if existing is None:
  args=['run','-d','--pull','never','--name',name,'--network',network,'--restart','unless-stopped','-e','HF_HUB_OFFLINE=1','-e','TRANSFORMERS_OFFLINE=1']
  if port==8000:args+=['-v','whisper-hf-cache:/root/.cache/huggingface:ro',image,'/root/faster-whisper-server/.venv/bin/python','-m','uvicorn','--factory','faster_whisper_server.main:create_app','--host','0.0.0.0','--port','8000']
  else:args += [image,'/app/.venv/bin/python','-m','uvicorn','api.src.main:app','--host','0.0.0.0','--port','8880','--log-level','warning']
  run(args)
 else:
  if set(existing['NetworkSettings']['Networks'])!={network}:raise SystemExit('Existing Cabin speech container has unexpected network')
  run(['update','--restart=unless-stopped',name]);run(['start',name])
ips=[inspect(name)['NetworkSettings']['Networks'][network]['IPAddress'] for name in names]
doorway='cabin-voice-doorway-20261014'
existing=inspect(doorway)
if existing is None:
 source=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).parents[1]/'apps/cabin-desktop/voice-doorway.py').resolve()
 run(['run','-d','--pull','never','--name',doorway,'--network','bridge','--restart','unless-stopped','-p','127.0.0.1:18080:8080','-p','127.0.0.1:18880:8880','-e','WHISPER_TARGET=http://'+ips[0]+':8000','-e','KOKORO_TARGET=http://'+ips[1]+':8880','--mount','type=bind,src='+str(source)+',dst=/proxy.py,readonly',whisper,'/root/faster-whisper-server/.venv/bin/python','/proxy.py'])
 run(['network','connect',network,doorway])
else:
 if network not in existing['NetworkSettings']['Networks']:raise SystemExit('Unexpected doorway network')
 run(['update','--restart=unless-stopped',doorway]);run(['start',doorway])
print('Cabin-owned local voice services started. No image pull or production restart.')
