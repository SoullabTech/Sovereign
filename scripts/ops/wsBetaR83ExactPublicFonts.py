#!/usr/bin/env python3
"""R83 local BUILD-ONLY Google Fonts source mirror, actual approved families.

Fetches only public stylesheets at fonts.googleapis.com and their WOFF2 files
at fonts.gstatic.com. Never uses request headers from a member, cookies,
credentials, connected apps, GitHub, production network, nor an AI provider.
Creates a frozen, hash-pinned Next.js TEST mock fixture outside the repository.
The actual build runs with outbound network denied. This does NOT approve
different fonts or enable production deployment.
"""
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit
from datetime import datetime, timezone

ROOT=Path("/Volumes/T7 Shield/ws-beta-r83-local-approved-font-cache-20261017")
SOURCES={
 "Inter":"https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
 "Newsreader":"https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,200..800;1,200..800&display=swap",
 "Cinzel":"https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&display=swap",
 "Quicksand":"https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap",
}
USER_AGENT=("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
 "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
FONT_RE=re.compile(r"src:\s*url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)\s*format\(['\"]woff2['\"]\)")
sha=lambda b:hashlib.sha256(b).hexdigest()
# SHA-256 of canonical {Google request CSS SHA, exact gstatic URL -> WOFF2 SHA}.
# These 18 real original-family binaries were physically qualified on the
# founder's Mac Studio; future public upstream asset changes fail closed.
PINNED_PUBLIC_FONT_SOURCE_SHA="b519e8cfec61c69b9209f2bd85e2009baf75532802f41f29ca7f2da599da197a"
PINNED_LOCAL_NEXT_MOCK_SHA="fc29c110251b2c00375122f88598f4f5b929a3d71a10aaaf7deb64749e39451c"
def request(url):
 u=urlsplit(url)
 if(u.scheme!="https" or u.netloc not in
    {"fonts.googleapis.com","fonts.gstatic.com"}):
  raise RuntimeError("R83_REFUSE_NON_PUBLIC_FONT_HOST")
 base={k:os.environ[k] for k in ("PATH","HOME","TMPDIR","LANG") if k in os.environ}
 if "PATH" not in base:base["PATH"]="/usr/bin:/bin"
 args=["/usr/bin/curl","--fail","--silent","--show-error",
   "--compressed","--connect-timeout","8","--max-time","24",
   "--max-redirs","0","--proto","=https",
   "--user-agent",USER_AGENT,
   "--header","Accept: text/css,*/*;q=0.9",url]
 result=subprocess.run(args,env=base,capture_output=True,timeout=28)
 if result.returncode:
  raise RuntimeError("R83_PUBLIC_FONT_SOURCE_UNAVAILABLE_"+u.netloc)
 return result.stdout
def go():
 if os.environ.get("R83_EXACT_PUBLIC_FONT_MIRROR")!="public-font-only":
  raise RuntimeError("R83_EXPLICIT_PUBLIC_FONT_MIRROR_OPTIN_REQUIRED")
 if ROOT.exists():raise RuntimeError("R83_FONT_MIRROR_REQUIRES_NEW_EXCLUSIVE_DIRECTORY")
 ROOT.mkdir(mode=0o700)
 fonts=ROOT/"files";fonts.mkdir(mode=0o700)
 src=ROOT/"stylesheets";src.mkdir(mode=0o700)
 js={};assets={};source_meta={}
 for family,url in SOURCES.items():
  css=request(url).decode("utf8")
  if not re.search(r"font-family:\s*['\"]?"+family+r"['\"]?\s*;",css):
   raise RuntimeError("R83_FAMILY_CSS_MISMATCH_"+family)
  urls=list(dict.fromkeys(FONT_RE.findall(css)))
  if not urls:
   raise RuntimeError("R83_NO_REAL_WOFF2_"+family)
  if family=="Newsreader" and (
    "font-style: italic;" not in css or "font-style: normal;" not in css):
   raise RuntimeError("R83_NEWSREADER_NORMAL_AND_ITALIC_REQUIRED")
  filename=family.lower()+".css"
  (src/filename).write_text(css,encoding="utf8")
  source_meta[family]={"request":url,"cssSHA256":sha(css.encode()),
   "cssBytes":len(css.encode()),"realFontFiles":len(urls)}
  for webfont in urls:
   data=request(webfont)
   if not data.startswith(b"wOF2") or len(data)<3000:
    raise RuntimeError("R83_REFUSE_NOT_REAL_WOFF2_"+family)
   digest=sha(data)
   local=fonts/(digest+".woff2")
   if not local.exists():
    fd=os.open(str(local),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,"wb") as f:f.write(data)
   else:
    assert local.read_bytes()==data
   assets[webfont]={"sha256":digest,"bytes":len(data),
    "localPath":str(local),"fontFamily":family}
   css=css.replace(webfont,str(local))
  assert not FONT_RE.findall(css)
  js[url]=css
 source_manifest={"stylesheets":{
  k:v["cssSHA256"] for k,v in source_meta.items()},
  "files":{k:v["sha256"] for k,v in assets.items()}}
 source_sha=sha(json.dumps(source_manifest,sort_keys=True,
  separators=(",",":")).encode())
 if source_sha!=PINNED_PUBLIC_FONT_SOURCE_SHA:
  raise RuntimeError("R83_UPSTREAM_FONT_ASSETS_DRIFTED_REFUSE_PROMOTION")
 # Node CommonJS fixture recognized by the installed Next/font loader.
 body="module.exports = "+json.dumps(js,ensure_ascii=False,sort_keys=True,indent=2)+";\n"
 mock=ROOT/"next-google-font-public-pinned-mock.cjs"
 if sha(body.encode())!=PINNED_LOCAL_NEXT_MOCK_SHA:
  raise RuntimeError("R83_LOCAL_FONT_MOCK_SOURCE_CHANGED")
 mock.write_text(body,encoding="utf8")
 manifest={
  "protocol":"soullab.ws.beta.r83.original-families-public-font-mirror.v1",
  "time":datetime.now(timezone.utc).isoformat(),
  "publicDomains":["fonts.googleapis.com","fonts.gstatic.com"],
  "noCredentialsOrMemberData":True,"noProviderOrModelCalls":True,
  "notUserVisibleFontChanges":True,"notProductionRelease":True,
  "stylesheets":source_meta,"files":assets,
  "mockFile":str(mock),"mockSHA256":sha(body.encode()),
  "canonicalSourceSHA256":source_sha,
 }
 (ROOT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
 print(json.dumps({"status":"R83_FROZEN_PUBLIC_FONT_FAMILIES_MIRRORED",
  "families":list(SOURCES),"fontBinaries":len(assets),
  "mockSHA256":manifest["mockSHA256"],"path":str(mock)}))
if __name__=="__main__":go()
