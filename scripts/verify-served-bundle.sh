#!/usr/bin/env bash
#
# SERVED-BUNDLE BYTE-IDENTITY WITNESS  (Kelly, 2026-08-31)
#
# Question, and the only one this answers:
#   Are the JavaScript bytes served for /maia over the PUBLIC path the bytes
#   produced by the deployed container?
#
#   public /maia -> asset URLs -> SHA-256 over the public path
#                                      ==
#                                 SHA-256 of the same file inside the
#                                 running maia-sovereign container
#
# WHY NOT A STRING GREP. VOICE-CANONICAL-CONVERGENCE-02 REMOVED a cognition leg
# rather than adding a marker. The "THE BETWEEN" log strings survive the repair,
# so a stale divergent bundle contains them too -- a grep for them cannot go red.
# Byte identity does not care whether a change added or removed anything.
#
# WHY NOT A SPOKEN TURN. That needs working capture to prove the referent that
# gates testing capture. Circular.
#
# REFUSALS, so this cannot pass by finding nothing. Each exits non-zero:
#   19  sign-in failed -- no session, so /maia cannot be reached as a member
#   20  container GIT_COMMIT != public /api/health version
#   21  /maia did not return HTTP 200
#   22  /maia resolved elsewhere (auth redirect)
#   23  zero /_next/static assets extracted
#   24  a served asset does not exist in the container
#   25  side counts differ
#   26  the negative control compared equal -- the witness itself is broken
#   27  byte mismatch: the public path is not serving this container
#
# AUTHENTICATION, ADDED DELIBERATELY (2026-08-31). The first run refused with
# code 22: /maia redirected to /signin?reason=no_session_cookie. The fix is a
# real session, NOT a relaxed assertion -- and the redirect check below is
# unchanged, because it is what caught the problem. Note what it caught: the
# signin page ALSO references /_next/static assets, so a witness that merely
# looked for "are there Next assets here" would have hashed the SIGNIN bundle
# and printed a green PASS. The final-URL check is the whole reason it did not.
#
# Credentials come from the environment or an interactive prompt -- never an
# argument, never a file, never this repo:
#     MAIA_USER=<username> ./verify-served-bundle.sh      # prompts for password
# The password is read with `read -s`, so it does not enter shell history.
#
# Read-only. No build, no deploy, no container writes. Run from the Mac Studio.

PUBLIC_ORIGIN="${PUBLIC_ORIGIN:-https://soullab.life}"
REMOTE="${REMOTE:-soullab@minisforum}"
CONTAINER="${CONTAINER:-maia-sovereign}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "=== 0. PROVENANCE ==="

CONTAINER_SHA="$(
  ssh "$REMOTE" \
    "docker exec '$CONTAINER' printenv GIT_COMMIT" \
    | tr -d '\r\n'
)"

HEALTH_JSON="$(
  curl -fsS \
    -H 'Accept-Encoding: identity' \
    "$PUBLIC_ORIGIN/api/health"
)"

PUBLIC_SHA="$(
  printf '%s' "$HEALTH_JSON" |
    python3 -c 'import json,sys; print(json.load(sys.stdin)["version"])'
)"

echo "container GIT_COMMIT : $CONTAINER_SHA"
echo "public health version: $PUBLIC_SHA"

if [[ "$CONTAINER_SHA" != "$PUBLIC_SHA" ]]; then
  echo "REFUSE: container SHA != public health version" >&2
  exit 20
fi

echo
echo "=== 0b. SIGN IN ==="

JAR="$TMP/cookies.txt"

if [[ -z "${MAIA_USER:-}" ]]; then
  printf 'MAIA username: ' >&2
  read -r MAIA_USER
fi
if [[ -z "${MAIA_PASS:-}" ]]; then
  printf 'MAIA password (not echoed, not stored): ' >&2
  read -rs MAIA_PASS
  echo >&2
fi

SIGNIN_CODE="$(
  MAIA_USER="$MAIA_USER" MAIA_PASS="$MAIA_PASS" python3 -c '
import json, os, sys
sys.stdout.write(json.dumps({"username": os.environ["MAIA_USER"],
                             "password": os.environ["MAIA_PASS"]}))
' | curl -sS -X POST \
      -H 'Content-Type: application/json' \
      -H 'Accept-Encoding: identity' \
      -c "$JAR" \
      -o "$TMP/signin.json" \
      -w '%{http_code}' \
      --data-binary @- \
      "$PUBLIC_ORIGIN/api/members/signin"
)"

echo "signin status: $SIGNIN_CODE"

if [[ "$SIGNIN_CODE" != "200" ]] || ! grep -q 'maia_session' "$JAR" 2>/dev/null; then
  echo "REFUSE: sign-in did not produce a session cookie" >&2
  head -c 300 "$TMP/signin.json" >&2 || true
  echo >&2
  exit 19
fi

echo "session cookies: $(awk '!/^#/ && NF {print $6}' "$JAR" | tr '\n' ' ')"

echo
echo "=== 1. FETCH PUBLIC /maia ==="

RESULT="$(
  curl -sS -L \
    -H 'Accept-Encoding: identity' \
    -b "$JAR" -c "$JAR" \
    -D "$TMP/headers" \
    -o "$TMP/maia.html" \
    -w '%{http_code} %{url_effective}' \
    "$PUBLIC_ORIGIN/maia"
)"

HTTP_CODE="${RESULT%% *}"
FINAL_URL="${RESULT#* }"

echo "status:    $HTTP_CODE"
echo "final URL: $FINAL_URL"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "REFUSE: /maia did not return HTTP 200" >&2
  head -c 400 "$TMP/maia.html" >&2 || true
  echo >&2
  exit 21
fi

case "$FINAL_URL" in
  "$PUBLIC_ORIGIN/maia"|"$PUBLIC_ORIGIN/maia/"*)
    ;;
  *)
    echo "REFUSE: /maia resolved somewhere else — likely auth redirect" >&2
    echo "final URL: $FINAL_URL" >&2
    echo "--- first 400 bytes ---" >&2
    head -c 400 "$TMP/maia.html" >&2 || true
    echo >&2
    exit 22
    ;;
esac

echo
echo "=== 2. EXTRACT NEXT STATIC ASSETS ==="

python3 - "$TMP/maia.html" > "$TMP/assets.txt" <<'PY'
import re, sys
from html import unescape

text = unescape(open(sys.argv[1], encoding="utf-8", errors="replace").read())

assets = set(
    re.findall(r'/_next/static/[^"\'<>\s]+', text)
)

for asset in sorted(assets):
    # Strip query/hash; filesystem counterpart has neither.
    asset = asset.split("?", 1)[0].split("#", 1)[0]
    print(asset)
PY

ASSET_COUNT="$(grep -c . "$TMP/assets.txt" || true)"

echo "assets found: $ASSET_COUNT"

if [[ "$ASSET_COUNT" -eq 0 ]]; then
  echo "REFUSE: /maia exposed zero /_next/static assets" >&2
  echo "--- first 400 bytes ---" >&2
  head -c 400 "$TMP/maia.html" >&2 || true
  echo >&2
  exit 23
fi

cat "$TMP/assets.txt"

echo
echo "=== 3. HASH PUBLIC ASSETS ==="

: > "$TMP/public.sha256"

while IFS= read -r asset; do
  hash="$(
    curl -fsS \
      -H 'Accept-Encoding: identity' \
      "$PUBLIC_ORIGIN$asset" |
      shasum -a 256 |
      awk '{print $1}'
  )"

  printf '%s  %s\n' "$hash" "$asset" >> "$TMP/public.sha256"
done < "$TMP/assets.txt"

sort -o "$TMP/public.sha256" "$TMP/public.sha256"

echo
echo "=== 4. HASH SAME FILES INSIDE RUNNING CONTAINER ==="

: > "$TMP/container.sha256"
MISSING=0

while IFS= read -r asset; do
  rel="${asset#/_next/static/}"
  container_path="/app/.next/static/$rel"

  if ! hash="$(
    ssh "$REMOTE" \
      "docker exec '$CONTAINER' sha256sum '$container_path'" \
      2>/dev/null |
      awk '{print $1}'
  )"; then
    echo "MISSING IN CONTAINER: $asset" >&2
    MISSING=1
    continue
  fi

  if [[ -z "$hash" ]]; then
    echo "MISSING IN CONTAINER: $asset" >&2
    MISSING=1
    continue
  fi

  printf '%s  %s\n' "$hash" "$asset" >> "$TMP/container.sha256"
done < "$TMP/assets.txt"

if [[ "$MISSING" -ne 0 ]]; then
  echo "REFUSE: one or more served assets do not exist in the running container" >&2
  exit 24
fi

sort -o "$TMP/container.sha256" "$TMP/container.sha256"

PUBLIC_COUNT="$(grep -c . "$TMP/public.sha256" || true)"
CONTAINER_COUNT="$(grep -c . "$TMP/container.sha256" || true)"

echo "public assets hashed:    $PUBLIC_COUNT"
echo "container assets hashed: $CONTAINER_COUNT"

if [[ "$PUBLIC_COUNT" -ne "$CONTAINER_COUNT" ]]; then
  echo "REFUSE: side counts differ" >&2
  exit 25
fi

echo
echo "=== 5. NEGATIVE CONTROL ==="

cp "$TMP/container.sha256" "$TMP/control.sha256"

python3 - "$TMP/control.sha256" <<'PY'
import sys

p = sys.argv[1]
lines = open(p, encoding="utf-8").readlines()

if not lines:
    raise SystemExit("negative control has no rows")

parts = lines[0].split(None, 1)
parts[0] = "0" * 64
lines[0] = parts[0] + "  " + parts[1]

open(p, "w", encoding="utf-8").writelines(lines)
PY

if diff -q "$TMP/public.sha256" "$TMP/control.sha256" >/dev/null; then
  echo "REFUSE: negative control compared equal — witness is broken" >&2
  exit 26
fi

echo "negative control: RED as required"

echo
echo "=== 6. BYTE IDENTITY ==="

if ! diff -u "$TMP/container.sha256" "$TMP/public.sha256"; then
  echo >&2
  echo "FAIL: public /maia assets differ from running-container assets" >&2
  exit 27
fi

echo
echo "============================================================"
echo "PASS: PUBLIC /maia ASSET BYTES == RUNNING CONTAINER BYTES"
echo "GIT_COMMIT=$CONTAINER_SHA"
echo "============================================================"
