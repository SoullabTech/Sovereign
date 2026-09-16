set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
SHA=36e412f8ed0136cf6ac22ee8dfb2cbd790a75a1c
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
PTR=/private/tmp/sid-entry-preflight-03-current.txt
test -f "$PTR"
WT=$(sed -n '1p' "$PTR")
PF=$(sed -n '2p' "$PTR")
case "$WT" in /private/tmp/sid-entry-03-$SHA-*) ;; *) exit 2;; esac
case "$PF" in "$WT"/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-ENTRY-preflight-*) ;; *) exit 2;; esac
test -d "$WT"
cd "$WT"
test "$(git rev-parse HEAD)" = "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-reinstall.sh ios/VoiceKernelDriver)"
test -f "$PF/SHA256SUMS.preflight"
( cd "$PF" && shasum -a 256 -c SHA256SUMS.preflight >/dev/null )
test -f "$PF/PREFLIGHT-CLEAN"
PFSTAMP=$(basename "$PF" | sed 's/.*preflight-//')
NOW=$(date -u +%s)
PFSEC=$(date -u -j -f %Y%m%dT%H%M%SZ "$PFSTAMP" +%s)
AGE=$((NOW - PFSEC))
test "$AGE" -ge 0
test "$AGE" -le 300
test "$(ls -d "$WT"/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-ENTRY-2* 2>/dev/null | wc -l | tr -d ' ')" = 0
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
scripts/witness/k00-driver-batch.sh VPIO-02-SID-ENTRY 30 --vp on --mode L --hold 15 --subject vpio-02-sid 2>&1 | tee "/private/tmp/sid-entry-batch-03-$STAMP.log"
L=$(ls -d "$WT"/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-ENTRY-2* | LC_ALL=C sort | tail -1)
test -d "$L"
cp "/private/tmp/sid-entry-batch-03-$STAMP.log" "$L/batch-invocation.log"
ls "$L"/journals/*.jsonl 2>/dev/null | wc -l | tr -d ' ' | tee "$L/journal-count.txt"
grep -c '^| ' "$L/ledger.md" | tee "$L/ledger-line-count.txt"
( cd "$L" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-entry-batch-03-$STAMP.SHA256SUMS.entry"
mv "/private/tmp/sid-entry-batch-03-$STAMP.SHA256SUMS.entry" "$L/SHA256SUMS.entry"
echo "SID-ENTRY-BATCH-03 $STAMP subject $SUBJECT_SHA instrument $SHA preflight $PFSTAMP ledger $L"
