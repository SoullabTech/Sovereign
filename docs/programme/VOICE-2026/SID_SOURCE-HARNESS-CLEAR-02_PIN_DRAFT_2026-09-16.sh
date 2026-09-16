set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
DEV="${K00_DEVICE:-A0736AC8-793B-516F-AC72-C076DB6CEE38}"
K00_BID=life.soullab.voicekernel.k00
V1_BID=life.soullab.voicekernel.vpio01
V2_BID=life.soullab.voicekernel.vpio02
SID_BID=life.soullab.voicekernel.vpio02sid
K00_CONTAINER=0B07D423-97E7-4196-BC1C-C69C96F994BE
V1_CONTAINER=6A2E406B-D1B8-43A4-92F3-29D50333AF19
V2_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78
SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=/private/tmp/sid-source-harness-clear-02-out-$STAMP
test ! -e "$OUT"
mkdir -p "$OUT"
printf '%s\n' "$K00_EXEC_AUTHORITY" | shasum -a 256 | awk '{print $1}' > "$OUT/authority.sha256"
printf '%s\n' "$(printf '%s\n' "$K00_EXEC_AUTHORITY" | wc -l | tr -d ' ')" > "$OUT/authority.lines"
app_check(){
  local label="$1" bid="$2" container="$3" phase="$4" js="$OUT/apps-$phase-$label.json"
  xcrun devicectl device info apps --device "$DEV" --bundle-id "$bid" --json-output "$js"
  test "$(grep -c "\"bundleIdentifier\" : \"$bid\"" "$js")" = 1
  test "$(grep -c "$container" "$js")" -ge 1
}
readset(){
  local phase="$1"; shift
  local js="$OUT/processes-$phase.json" tsv="$OUT/harness-$phase.tsv"
  xcrun devicectl device info processes --device "$DEV" --json-output "$js"
  python3 - "$js" "$tsv" "$@" <<'PY'
import json,sys
js,out,*expected=sys.argv[1:]
d=json.load(open(js))
rows=[]
for r in d.get('result',{}).get('runningProcesses',[]):
    e=str(r.get('executable',''))
    if 'VoiceKernelHarness.app/VoiceKernelHarness' in e:
        c=e.split('/Bundle/Application/',1)[1].split('/',1)[0] if '/Bundle/Application/' in e else ''
        rows.append((c,int(r.get('processIdentifier',-1)),e))
rows.sort()
with open(out,'w') as f:
    for c,p,e in rows: f.write(f'{c}\t{p}\t{e}\n')
exp=sorted(expected)
got=sorted(c for c,_,_ in rows)
if got != exp or len(rows) != len(exp) or len(set(got)) != len(got):
    print('HARNESS-SET-MISMATCH expected='+','.join(exp)+' got='+','.join(got), file=sys.stderr)
    raise SystemExit(12)
PY
  cat "$tsv"
}
pid_for(){ awk -F '\t' -v c="$1" '$1==c {print $2}' "$2"; }
for spec in "k00:$K00_BID:$K00_CONTAINER" "vpio01:$V1_BID:$V1_CONTAINER" "vpio02:$V2_BID:$V2_CONTAINER" "sid:$SID_BID:$SID_CONTAINER"; do
  IFS=: read -r label bid container <<EOF2
$spec
EOF2
  app_check "$label" "$bid" "$container" before
done
readset pre "$K00_CONTAINER" "$V1_CONTAINER" "$V2_CONTAINER"
readset just-before-k00 "$K00_CONTAINER" "$V1_CONTAINER" "$V2_CONTAINER"
PID=$(pid_for "$K00_CONTAINER" "$OUT/harness-just-before-k00.tsv"); echo "$PID" | grep -Eq '^[0-9]+$'
xcrun devicectl device process terminate --device "$DEV" --pid "$PID" --json-output "$OUT/terminate-k00.json" | tee "$OUT/terminate-k00.txt"
readset mid-k00 "$V1_CONTAINER" "$V2_CONTAINER"
readset just-before-vpio01 "$V1_CONTAINER" "$V2_CONTAINER"
PID=$(pid_for "$V1_CONTAINER" "$OUT/harness-just-before-vpio01.tsv"); echo "$PID" | grep -Eq '^[0-9]+$'
xcrun devicectl device process terminate --device "$DEV" --pid "$PID" --json-output "$OUT/terminate-vpio01.json" | tee "$OUT/terminate-vpio01.txt"
readset mid-vpio01 "$V2_CONTAINER"
readset just-before-vpio02 "$V2_CONTAINER"
PID=$(pid_for "$V2_CONTAINER" "$OUT/harness-just-before-vpio02.tsv"); echo "$PID" | grep -Eq '^[0-9]+$'
xcrun devicectl device process terminate --device "$DEV" --pid "$PID" --json-output "$OUT/terminate-vpio02.json" | tee "$OUT/terminate-vpio02.txt"
readset post
for spec in "k00:$K00_BID:$K00_CONTAINER" "vpio01:$V1_BID:$V1_CONTAINER" "vpio02:$V2_BID:$V2_CONTAINER" "sid:$SID_BID:$SID_CONTAINER"; do
  IFS=: read -r label bid container <<EOF2
$spec
EOF2
  app_check "$label" "$bid" "$container" after
done
SEAL=/private/tmp/sid-source-harness-clear-02-$STAMP.SHA256SUMS.clearance
( cd "$OUT" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"
mv "$SEAL" "$OUT/SHA256SUMS.clearance"
echo "SID-SOURCE-HARNESS-CLEAR-02 $STAMP PASS k00 $K00_CONTAINER vpio01 $V1_CONTAINER vpio02 $V2_CONTAINER sid-preserved $SID_CONTAINER harness-after 0 out $OUT"
