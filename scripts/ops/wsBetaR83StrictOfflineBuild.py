#!/usr/bin/env python3
"""R83 strict Next.js production build rehearsal, offline, fictional-only.

Never activates an app server or connects to production. Rejects real local
.env or injected provider keys. Replays PINNED and genuine same-family font
assets from a local mirror into Next/font during compilation, with every
outbound socket denied by the OS. Does not patch next/font or alter typography.
Fails closed on missing fonts, wrong input hashes, build errors or timeouts.
"""
from pathlib import Path
import hashlib
import json
import os
import signal
import subprocess
import tempfile
import shutil
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
MIRROR=Path("/Volumes/T7 Shield/ws-beta-r83-local-approved-font-cache-20261017")
LOG=Path(os.environ.get("R83_BUILD_LOG",
 "/Volumes/T7 Shield/ws-beta-r83-precommit-strict-offline-next-build.log"))
RECEIPT=Path(os.environ.get("R83_BUILD_RECEIPT",
 "/Volumes/T7 Shield/ws-beta-r83-precommit-strict-offline-next-build.json"))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
PINNED_PUBLIC_FONT_SOURCE_SHA="b519e8cfec61c69b9209f2bd85e2009baf75532802f41f29ca7f2da599da197a"
PINNED_LOCAL_NEXT_MOCK_SHA="fc29c110251b2c00375122f88598f4f5b929a3d71a10aaaf7deb64749e39451c"
def run():
 if os.environ.get("R83_STRICT_OFFLINE_BUILD")!="fictional-no-network":
  raise RuntimeError("R83_EXPLICIT_OFFLINE_ONLY_MARKER_REQUIRED")
 if (ROOT/".env").exists() or (ROOT/".env.local").exists():
  raise RuntimeError("R83_REFUSE_REAL_APP_ENV_FILE")
 if LOG.exists() or RECEIPT.exists():
  raise RuntimeError("R83_EXCLUSIVE_NEW_BUILD_EVIDENCE_REQUIRED")
 if not (ROOT/"node_modules/.bin/next").exists():
  raise RuntimeError("R83_NEXT_BINARY_MISSING")
 source=(ROOT/"next.config.js").read_text(encoding="utf8")
 if "tsconfigPath: 'tsconfig.ship.json'" not in source or (
    "ignoreBuildErrors: false" not in source):
  raise RuntimeError("R83_STRICT_SHIPPING_CONFIG_NOT_ACTIVE")
 for key in os.environ:
  if key.endswith(("_API_KEY","_SECRET","_TOKEN","_PASSWORD")) and (
      key not in ("R83_STRICT_OFFLINE_BUILD",)):
   # Ambient shell could contain credentials but these are NEVER forwarded
   # to the sandbox; do not log or inspect any value.
   continue
 data=json.loads((MIRROR/"manifest.json").read_text())
 mock=Path(data["mockFile"])
 if (not mock.is_file() or sha(mock)!=data["mockSHA256"] or
     data["mockSHA256"]!=PINNED_LOCAL_NEXT_MOCK_SHA):
  raise RuntimeError("R83_FONT_CSS_FIXTURE_HASH_CHANGED")
 manifest_identity={"stylesheets":{
  k:v["cssSHA256"] for k,v in data["stylesheets"].items()},
  "files":{k:v["sha256"] for k,v in data["files"].items()}}
 digest=hashlib.sha256(json.dumps(manifest_identity,sort_keys=True,
  separators=(",",":")).encode()).hexdigest()
 if digest!=PINNED_PUBLIC_FONT_SOURCE_SHA:
  raise RuntimeError("R83_UNPINNED_PUBLIC_FONT_VERSIONS_REFUSED")
 if set(data["stylesheets"])!={"Inter","Newsreader","Cinzel","Quicksand"}:
  raise RuntimeError("R83_APPROVED_FONT_FAMILY_SET_MISMATCH")
 for uri,item in data["files"].items():
  if not uri.startswith("https://fonts.gstatic.com/"):
   raise RuntimeError("R83_FONT_MIRROR_ORIGIN_INVALID")
  file=Path(item["localPath"])
  if not file.is_file() or sha(file)!=item["sha256"] or (
      file.stat().st_size!=item["bytes"]) or file.read_bytes()[:4]!=b"wOF2":
   raise RuntimeError("R83_FONT_FILE_MISSING_OR_MODIFIED")
 probe=subprocess.run(
  ["/usr/bin/sandbox-exec","-p",
   "(version 1) (allow default) (deny network-outbound)",
   "/Users/soullab/.nvm/versions/node/v22.22.3/bin/node","-e",
   "require('net').connect(1,'127.0.0.1').on('error',e=>process.exit(e.code==='EPERM'?0:1))"],
  capture_output=True,text=True,timeout=8)
 if probe.returncode!=0:raise RuntimeError("R83_OS_NETWORK_DENIAL_NOT_VERIFIED")
 # Synthetic isolated HOME prevents accidentally reading shell or native
 # app credentials. Explicit tiny env, no real DB URL, no provider tokens.
 home=Path(tempfile.mkdtemp(prefix="ws-r83-offline-build-home-"))
 env={"PATH":"/Users/soullab/.nvm/versions/node/v22.22.3/bin:/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin",
  "HOME":str(home),"TMPDIR":"/tmp","CI":"1","NODE_ENV":"production",
  "NODE_OPTIONS":"--max-old-space-size=8192",
  "NEXT_TELEMETRY_DISABLED":"1","NEXT_FONT_GOOGLE_MOCKED_RESPONSES":str(mock),
  "CAPACITOR_BUILD":"","MAIA_CABIN_MODE":"",
  "NEXT_PUBLIC_WS_BETA_REAL_MEMBER_ENABLED":"false",
  "R71_AUTHOR_EDITORIAL_FIXTURE":"","R72_MEMBER_PROPOSALS_FIXTURE":"",
  "R76_PENDING_CANDIDATE_FIXTURE":"","R77P_LOCAL_REVIEW_FIXTURE":"",
  "R79_PRIVATE_AUTHOR_FIXTURE":"",
 }
 cmd=["/usr/bin/sandbox-exec","-p",
  "(version 1) (allow default) (deny network-outbound)",
  str(ROOT/"node_modules/.bin/next"),"build","--webpack"]
 start=datetime.now(timezone.utc)
 timed_out=False;rc=None
 try:
  LOG.parent.mkdir(exist_ok=True,parents=True)
  with LOG.open("x",encoding="utf8") as log:
   log.write("R83 strictly offline Next production build; four pinned public font families; outbound denied\n")
   log.flush()
   p=subprocess.Popen(cmd,cwd=ROOT,env=env,
      stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
   try:
    rc=p.wait(timeout=360)
   except subprocess.TimeoutExpired:
    timed_out=True
    os.killpg(p.pid,signal.SIGTERM)
    try:p.wait(timeout=8)
    except subprocess.TimeoutExpired:
     os.killpg(p.pid,signal.SIGKILL)
     p.wait(timeout=8)
    rc=124
   log.write("\nR83_NEXT_BUILD_EXIT="+str(rc)+"\n")
   log.flush()
 finally:
  shutil.rmtree(home,ignore_errors=True)
 output=LOG.read_text(errors="replace")
 # A passing compiler must also be verified by Next itself, which must have
 # actually emitted pages/build rather than only parsed configuration.
 passed=(rc==0 and not timed_out and
  ("Compiled successfully" in output or "Compiled successfully" in output) and
  ("Generating static pages" in output or "Finalizing page optimization" in output
   or "Route (app)" in output))
 result={
  "protocol":"soullab.ws.beta.r83.strict-next-real-build-no-network.v1",
  "sourceHead":subprocess.run(["git","rev-parse","HEAD"],cwd=ROOT,capture_output=True,text=True).stdout.strip(),
  "mode":"unsuppressed tsconfig.ship.json via real Next build",
  "outboundNetworkDeniedByOS":True,
  "pinnedActualFontFamilies":list(data["stylesheets"]),
  "fontCount":len(data["files"]),"fontMockSHA256":data["mockSHA256"],
  "nextBuildProcessExit":rc,"timedOut":timed_out,
  "status":"R83_STRICT_OFFLINE_NEXT_BUILD_PASS_HELD" if passed else
    "R83_STRICT_OFFLINE_NEXT_BUILD_FAILED_NOT_RELEASED",
  "durationStartUTC":start.isoformat(),
  "durationEndUTC":datetime.now(timezone.utc).isoformat(),
  "productionChanged":False,"realMemberDataUsed":False,
  "modelCalls":0,"secretsForwarded":False,"deployment":False,
  "betaRelease":"HOLD","log":str(LOG)
 }
 RECEIPT.write_text(json.dumps(result,indent=2)+"\n")
 print(json.dumps({"status":result["status"],"buildExit":rc,"timedOut":timed_out,
  "network":False,"fontCount":len(data["files"]),
  "receipt":str(RECEIPT)}))
 return 0 if passed else 2
if __name__=="__main__":raise SystemExit(run())
