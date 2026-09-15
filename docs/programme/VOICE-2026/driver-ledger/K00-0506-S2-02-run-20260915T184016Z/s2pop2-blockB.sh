cd /private/tmp/k0506-s2pop2-b198e2e37
git diff --quiet b198e2e37058f2e059d986b4b148e224215f3ee3 -- \
  ios/VoiceKernelDriver \
  scripts/witness/k00-driver-batch.sh \
  scripts/witness/k00-ledger.py \
  scripts/witness/k00-output-ledger.py \
  scripts/witness/k00-reinstall.sh \
  scripts/witness/fixtures
DIFF_RC=$?
echo "PREFLIGHT_DIFF_RC=$DIFF_RC"
if [ "$DIFF_RC" -ne 0 ]; then
  echo "STOP: witness surface differs"
  exit 91
fi

if pgrep -fl 'k00-driver-batch.sh \(K00-0506\|S2-WITNESS\)' > /private/tmp/s2w-preflight-other-batches.txt; then
  cat /private/tmp/s2w-preflight-other-batches.txt
  echo "STOP: another batch process exists"
  exit 92
else
  echo "OTHER_BATCHES=0"
fi

DEV=A0736AC8-793B-516F-AC72-C076DB6CEE38
PF="docs/programme/VOICE-2026/driver-ledger/K00-0506-S2-preflight-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$PF"

xcrun devicectl device info apps \
  --device "$DEV" \
  --bundle-id life.soullab.voicekernel.vpio02 \
  --json-output "$PF/apps.json" >/dev/null
APPS_RC=$?
echo "APPS_READ_RC=$APPS_RC"
if [ "$APPS_RC" -ne 0 ]; then
  echo "STOP: apps listing unreadable"
  exit 93
fi

CONTAINER_HITS="$(grep -c 'E3B88028-A10F-46B1-AB27-CF0A1F83FB78' "$PF/apps.json")"
echo "E3B88028_CONTAINER_HITS=$CONTAINER_HITS"
if [ "$CONTAINER_HITS" -lt 1 ]; then
  echo "STOP: ruled VPIO-02 container not found"
  exit 94
fi

xcrun devicectl device info processes \
  --device "$DEV" \
  --json-output "$PF/processes.json" >/dev/null
PROCESS_RC=$?
echo "PROCESS_READ_RC=$PROCESS_RC"
if [ "$PROCESS_RC" -ne 0 ]; then
  echo "STOP: process listing unreadable"
  exit 95
fi

HCOUNT="$(python3 - "$PF/processes.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print(len(hits))
PY
)"
echo "VoiceKernelHarness processes: $HCOUNT"
if [ "$HCOUNT" != "0" ]; then
  echo "STOP: harness process present"
  exit 96
fi

echo "PREFLIGHT_CLEAN=$PF"
