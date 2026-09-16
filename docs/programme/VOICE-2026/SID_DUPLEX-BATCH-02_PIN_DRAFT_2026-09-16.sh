set -e
set -o pipefail
SHA=1708d52119e173853e0ad8b7ca7f71ad95c63d8d
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
ACT_MARK=/private/tmp/sid-duplex-batch-02-invoked.txt
test ! -e "$ACT_MARK"
ACTSTAMP=$(date -u +%Y%m%dT%H%M%SZ)
printf 'SID-DUPLEX-BATCH-02 INVOKED %s subject %s instrument %s
' "$ACTSTAMP" "$SUBJECT_SHA" "$SHA" > "$ACT_MARK"
test -n "$K00_EXEC_AUTHORITY"
PTR=/private/tmp/sid-duplex-preflight-02-current.txt
test -f "$PTR"
WT=$(sed -n '1p' "$PTR")
PF=$(sed -n '2p' "$PTR")
case "$WT" in /private/tmp/sid-duplex-02-$SHA-*) ;; *) exit 2;; esac
case "$PF" in "$WT"/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-DUPLEX-preflight-*) ;; *) exit 2;; esac
test -d "$WT"
cd "$WT"
test "$(git rev-parse HEAD)" = "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-output-ledger.py scripts/witness/k00-source-ledger.py ios/VoiceKernelDriver __tests__/voice-kernel-00-source-gates.test.ts)"
test -f "$PF/SHA256SUMS.preflight"
( cd "$PF" && shasum -a 256 -c SHA256SUMS.preflight >/dev/null )
test -f "$PF/PREFLIGHT-CLEAN"
PFSTAMP=$(basename "$PF" | sed 's/.*preflight-//')
NOW=$(date -u +%s)
PFSEC=$(date -u -j -f %Y%m%dT%H%M%SZ "$PFSTAMP" +%s)
AGE=$((NOW - PFSEC))
test "$AGE" -ge 0
test "$AGE" -le 300
BASE="$WT/docs/programme/VOICE-2026/driver-ledger"
BEFORE=/private/tmp/sid-duplex-batch-02-$ACTSTAMP.before-dirs
AFTER=/private/tmp/sid-duplex-batch-02-$ACTSTAMP.after-dirs
find "$BASE" -maxdepth 1 -type d -name 'VPIO-02-SID-DUPLEX-2*' | LC_ALL=C sort > "$BEFORE"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
scripts/witness/k00-driver-batch.sh VPIO-02-SID-DUPLEX 10 --act duplex --vp on --mode L --hold 15 --subject vpio-02-sid --cancel-at 1000 --settle 2 2>&1 | tee "/private/tmp/sid-duplex-batch-02-$STAMP.log"
find "$BASE" -maxdepth 1 -type d -name 'VPIO-02-SID-DUPLEX-2*' | LC_ALL=C sort > "$AFTER"
NEW=$(comm -13 "$BEFORE" "$AFTER")
test "$(printf '%s
' "$NEW" | sed '/^$/d' | wc -l | tr -d ' ')" = 1
L="$NEW"
test -d "$L"
cp "/private/tmp/sid-duplex-batch-02-$STAMP.log" "$L/batch-invocation.log"
cp "$ACT_MARK" "$L/batch-act-marker.txt"
JCOUNT=$(find "$L/journals" -maxdepth 1 -type f -name '*.jsonl' | wc -l | tr -d ' ')
printf '%s
' "$JCOUNT" | tee "$L/journal-count.txt"
test "$JCOUNT" = 10
test -f "$L/output-ledger.md"
grep -c '^| ' "$L/ledger.md" | tee "$L/ledger-line-count.txt"
grep -c '^| ' "$L/output-ledger.md" | tee "$L/output-ledger-line-count.txt"
test ! -e "$L/source-ledger.md"
for n in $(seq 1 10); do
  test -f "$L/sample-$n-duplex-preact-harness-state.txt"
  test -f "$L/sample-$n-duplex-jit-harness-state.txt"
  grep -q "SID DUPLEX sample $n preact harnesses=0" "$L/sample-$n-duplex-preact-harness-state.txt"
  grep -q "SID DUPLEX sample $n jit harnesses=0" "$L/sample-$n-duplex-jit-harness-state.txt"
done
( cd "$L" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-duplex-batch-02-$STAMP.SHA256SUMS.duplex"
mv "/private/tmp/sid-duplex-batch-02-$STAMP.SHA256SUMS.duplex" "$L/SHA256SUMS.duplex"
echo "SID-DUPLEX-BATCH-02 $STAMP subject $SUBJECT_SHA instrument $SHA preflight $PFSTAMP ledger $L"
