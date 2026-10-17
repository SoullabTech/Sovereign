#!/usr/bin/env bash
# E010 emergency Caddy rule — local, network-isolated actual-Caddy review.
# This script cannot edit Caddyfile or invoke any production machine.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
E010="e010c0977320ea3cceb7424e84a5cf5c58770cc2"
PINNED_CADDY_ID="sha256:834468128c7696cec0ceea6172f7d692daf645ae51983ca76e39da54a97c570d"
IMAGE="caddy:2.11.2-alpine"
FIXTURE="$ROOT/docs/ops/fixtures/reflect-e010-emergency-deny.caddy"

# Preserve the frozen E010 Caddy authority; no candidate source mutation.
test -f "$FIXTURE"
test "$(git -C "$ROOT" rev-parse --verify "$E010^{commit}")" = "$E010"
git -C "$ROOT" show "$E010:Caddyfile" | cmp -s - "$ROOT/Caddyfile"
ACTUAL_IMAGE="$(docker image inspect "$IMAGE" --format '{{.Id}}')"
test "$ACTUAL_IMAGE" = "$PINNED_CADDY_ID"

TEMP="$(mktemp -d -t reflect-e010-edge-review)"
CID=""
cleanup() {
    if test -n "$CID"; then docker rm -f "$CID" >/dev/null 2>&1 || true; fi
    rm -rf "$TEMP"
}
trap cleanup EXIT
export ROOT TEMP FIXTURE

python3 - <<'PY'
import os
from pathlib import Path
root=Path(os.environ["ROOT"])
tmp=Path(os.environ["TEMP"])
src=(root/"Caddyfile").read_text()
rule=Path(os.environ["FIXTURE"]).read_text()
anchor="(deny_disabled_routes) {\n"
assert src.count(anchor)==1, "CANONICAL_CADDY_STRUCTURE_DRIFT"
assert rule.count("@reflect_e010_emergency")==2, "FIXTURE_MATCHER_STRUCTURE_DRIFT"
candidate=src.replace(anchor,anchor+rule)
(tmp/"canonical-candidate.caddy").write_text(candidate)
start=src.index(anchor)
end=src.index("\n}\n\n# Local development",start)+2
canonical_snippet=src[start:end].replace(anchor,anchor+rule)
# Reuse the real imported snippet, including original security denials.
# The remaining test site contains deliberately fictional upstream responses.
test_site=canonical_snippet + """
:8080 {
    import deny_disabled_routes
    @html_pages {
        not path /api/* /_next/* /icons/* /*.json /*.ico /*.png /*.svg /*.jpg /*.webp /*.woff2
    }
    handle @html_pages {
        header Cache-Control "no-cache, no-store, must-revalidate"
        respond "FICTIONAL_UPSTREAM_HTML" 200
    }
    handle {
        respond "FICTIONAL_UPSTREAM_OTHER" 200
    }
}
"""
(tmp/"test-site.caddy").write_text(test_site)
print("CANONICAL_CADDY_SOURCE_CHECK=PASS")
print("TEST_SITE_NETWORK_AND_UPSTREAM=ISOLATED_LOCAL_ONLY")
PY

# No downloads, network access, published ports, or writable host Caddy paths.
docker run --rm --pull=never --network none --cpus=1 --memory=192m \
    --read-only --tmpfs /data --tmpfs /config \
    -v "$TEMP/canonical-candidate.caddy:/etc/caddy/Caddyfile:ro" \
    "$IMAGE" caddy adapt --config /etc/caddy/Caddyfile --pretty \
    > "$TEMP/adapted.json" 2> "$TEMP/adapt.log"

python3 - <<'PY'
import json,os
from pathlib import Path
p=json.loads((Path(os.environ["TEMP"])/"adapted.json").read_text())
servers=p.get("apps",{}).get("http",{}).get("servers",{})
count=0
def walk(obj):
 global count
 if isinstance(obj,dict):
  if (obj.get("handler")=="static_response" and obj.get("status_code")==403
      and obj.get("body")=="Reflect temporarily unavailable"):
   count+=1
  for v in obj.values():walk(v)
 elif isinstance(obj,list):
  for v in obj:walk(v)
walk(servers)
assert count==19,"CANONICAL_IMPORT_SITE_COUNT_DRIFT"
print("CANONICAL_CADDY_ADAPT=PASS DENIAL_HANDLERS="+str(count))
PY

docker run --rm --pull=never --network none --cpus=1 --memory=192m \
    --read-only --tmpfs /data --tmpfs /config \
    -v "$TEMP/test-site.caddy:/etc/caddy/Caddyfile:ro" \
    "$IMAGE" caddy validate --config /etc/caddy/Caddyfile \
    > "$TEMP/validate.log" 2>&1

CID="$(docker run -d --rm --pull=never --network none --cpus=1 --memory=192m \
    --read-only --tmpfs /data --tmpfs /config \
    -v "$TEMP/test-site.caddy:/etc/caddy/Caddyfile:ro" \
    "$IMAGE" caddy run --config /etc/caddy/Caddyfile)"
sleep 1

python3 - "$CID" <<'PY'
import re,subprocess,sys
cid=sys.argv[1]
cases=[
 ("GET", "/pro-studio/reflect", 403, []),
 ("GET", "/pro-studio/reflect/", 403, []),
 ("GET", "/pro-studio/reflect/nested", 403, []),
 ("GET", "/pro-studio/reflect?_rsc=test", 403, []),
 ("GET", "/pro-studio/reflect?other=1", 403, ["RSC: 1"]),
 ("GET", "/pro-studio/reflect?other=2", 403, ["Next-Router-Prefetch: 1"]),
 ("HEAD", "/pro-studio/reflect", 403, []),
 ("POST", "/pro-studio/reflect", 403, []),
 ("GET", "/pro-studio/reflection", 200, []),
 ("GET", "/health", 200, []),
 ("GET", "/_next/static/unrelated.js", 200, []),
]
for method,path,expected,headers in cases:
 # The Caddy Alpine image includes curl; unlike BusyBox wget, curl exposes
 # complete headers for non-2xx responses such as our intentional 403.
 cmd=["docker","exec",cid,"curl","--silent","--show-error",
      "--include","--max-time","4","--path-as-is"]
 if method=="HEAD":cmd+=["--head"]
 if method=="POST":cmd+=["--request","POST","--data","fictional"]
 for h in headers:cmd+=["--header",h]
 cmd+=["http://127.0.0.1:8080"+path]
 try:
  r=subprocess.run(cmd,capture_output=True,text=True,timeout=8)
 except Exception:
  raise AssertionError("LOCAL_TEST_TRANSPORT_FAILED")
 statuses=re.findall(r"HTTP/\d(?:\.\d)?\s+(\d{3})",r.stdout)
 actual=int(statuses[-1]) if statuses else None
 if r.returncode!=0 or actual!=expected:
  raise AssertionError("ROUTE_OR_STATUS_DRIFT "+method+" "+path+
                       " got="+str(actual)+" transport="+str(r.returncode))
 if expected==403:
  response_headers=r.stdout.split("\r\n\r\n",1)[0].lower()
  if "cache-control: no-store" not in response_headers:
   raise AssertionError("DENIAL_CACHE_HEADER_MISSING "+method+" "+path)
  if "FICTIONAL_UPSTREAM" in r.stdout:
   raise AssertionError("BLOCKED_UPSTREAM_CONTENT_LEAK "+method+" "+path)
 print("CADDY_ROUTE="+method+" "+path+" STATUS="+str(actual)+" PASS")
print("ISOLATED_CADDY_REQUEST_MATRIX="+str(len(cases))+"/"+str(len(cases))+" PASS")
print("PRODUCTION_WRITES=ZERO")
PY
