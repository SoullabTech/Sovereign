#!/usr/bin/env bash
# JARVIS-K3-00 — TokenRouter / Kimi K3 reality probe.  PROOF ONLY.
# Run from a machine with egress. Sends NO repo/member/MAIA data.
# Never prints the API key. Output is safe to paste back.
set -uo pipefail
API="https://api.tokenrouter.com/v1"

if [ -z "${TOKENROUTER_API_KEY:-}" ]; then
  echo "BLOCKED — TOKENROUTER_API_KEY not set."
  echo "  export TOKENROUTER_API_KEY=...   (this shell only; do not commit)"
  exit 1
fi
echo "credential: PRESENT (len=${#TOKENROUTER_API_KEY}, not shown)"

# Preflight: refuse a value that is not API-key shaped, BEFORE transmitting it.
if ! python3 -c "
import os,sys
k=os.environ['TOKENROUTER_API_KEY']
bad=[]
if len(k)<32: bad.append('shorter than 32 chars')
if any(c in k for c in '!@#\$%^&*()+={}[]|;:,<>?/~\`\'\"'): bad.append('contains punctuation unusual for an API key')
if k!=k.strip(): bad.append('leading/trailing whitespace')
if bad:
    print('REFUSED — value does not look like an API key: '+'; '.join(bad), file=sys.stderr)
    print('Nothing was transmitted. Copy the key from the TokenRouter dashboard.', file=sys.stderr)
    print('If you pasted an account password, rotate it now.', file=sys.stderr)
    sys.exit(1)
"; then exit 3; fi
echo "preflight : shape looks like an API key"
AUTH="Authorization: Bearer ${TOKENROUTER_API_KEY}"

echo; echo "=== 3. AUTHENTICATED CATALOG ==="
CAT=$(mktemp); CODE=$(curl -sS -o "$CAT" -w "%{http_code}" -H "$AUTH" "$API/models")
echo "GET /v1/models -> HTTP $CODE"
if [ "$CODE" != "200" ]; then echo "CATALOG UNAVAILABLE"; head -c 400 "$CAT"; rm -f "$CAT"; exit 2; fi
echo "--- every model id matching kimi/moonshot ---"
python3 -c "
import json,sys
d=json.load(open('$CAT'))
ids=[m.get('id','') for m in d.get('data',[])]
hits=[i for i in ids if 'kimi' in i.lower() or 'moonshot' in i.lower()]
print('\n'.join(hits) if hits else '(none)')
print('---'); print('total models in catalog:', len(ids))
print('paid  moonshotai/kimi-k3      present:', 'moonshotai/kimi-k3' in ids)
print('FREE  moonshotai/kimi-k3-free present:', 'moonshotai/kimi-k3-free' in ids)
"
FREE=$(python3 -c "
import json;d=json.load(open('$CAT'))
print('yes' if 'moonshotai/kimi-k3-free' in [m.get('id','') for m in d.get('data',[])] else 'no')")
echo; echo "verdict: $([ "$FREE" = yes ] && echo 'FREE MODEL PRESENT' || echo 'FREE MODEL ABSENT')"
rm -f "$CAT"

echo; echo "=== 4. DIRECT PROBE ==="
if [ "$FREE" != "yes" ]; then
  echo "SKIPPED — free alias absent. Do NOT infer a free tier from the paid model."
  exit 0
fi
B=$(mktemp); H=$(mktemp)
T=$(curl -sS -o "$B" -D "$H" -w "%{http_code} %{time_total}" -H "$AUTH" \
  -H "Content-Type: application/json" "$API/chat/completions" -d '{
  "model":"moonshotai/kimi-k3-free","max_tokens":16,
  "messages":[{"role":"user","content":"Return exactly: JARVIS_K3_OK"}]}')
echo "HTTP $(echo $T|cut -d' ' -f1)   latency $(echo $T|cut -d' ' -f2)s"
python3 -c "
import json
try:
  d=json.load(open('$B'))
  print('resolved model:', d.get('model'))
  print('answer        :', repr(d.get('choices',[{}])[0].get('message',{}).get('content')))
  print('usage         :', json.dumps(d.get('usage',{})))
  for k in ('cost','credits','price','total_cost'):
    if k in d: print(f'{k}:', d[k])
except Exception as e: print('unparsed:', open('$B').read()[:400])
"
echo "--- quota / rate-limit headers ---"
grep -i -E "ratelimit|quota|credit|x-tokenrouter|cost" "$H" || echo "(none returned)"
rm -f "$B" "$H"

echo; echo "=== 5. ALLOCATION ==="
for p in /credits /usage /account /me /billing/credits; do
  C=$(curl -sS -o /dev/null -w "%{http_code}" -H "$AUTH" "$API$p")
  echo "GET /v1$p -> $C"
done
echo "If none return 200: 50M ALLOCATION — UNVERIFIED FROM API (check dashboard visually)."
