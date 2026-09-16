set -e
set -o pipefail
SHA=f67575797353bf7e97ffb319a45357997c8d564d
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
ACT_MARK=/private/tmp/sid-source-batch-03-invoked.txt
test ! -e "$ACT_MARK"
ACTSTAMP=$(date -u +%Y%m%dT%H%M%SZ)
printf 'SID-SOURCE-BATCH-03 INVOKED %s subject %s instrument %s\n' "$ACTSTAMP" "$SUBJECT_SHA" "$SHA" > "$ACT_MARK"
test -n "$K00_EXEC_AUTHORITY"
PTR=/private/tmp/sid-source-preflight-03-current.txt
test -f "$PTR"
WT=$(sed -n '1p' "$PTR")
PF=$(sed -n '2p' "$PTR")
case "$WT" in /private/tmp/sid-source-03-$SHA-*) ;; *) exit 2;; esac
case "$PF" in "$WT"/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-SOURCE-preflight-*) ;; *) exit 2;; esac
test -d "$WT"
cd "$WT"
test "$(git rev-parse HEAD)" = "$SHA"
test -z "$(git status --porcelain -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-output-ledger.py scripts/witness/k00-source-ledger.py ios/VoiceKernelDriver)"
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
BEFORE=/private/tmp/sid-source-batch-03-$ACTSTAMP.before-dirs
AFTER=/private/tmp/sid-source-batch-03-$ACTSTAMP.after-dirs
find "$BASE" -maxdepth 1 -type d -name 'VPIO-02-SID-SOURCE-2*' | LC_ALL=C sort > "$BEFORE"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
scripts/witness/k00-driver-batch.sh VPIO-02-SID-SOURCE 10 --act output --vp on --mode L --hold 15 --subject vpio-02-sid --stimulus sid-nearend-gated --cancel-at 1000 --settle 2 2>&1 | tee "/private/tmp/sid-source-batch-03-$STAMP.log"
find "$BASE" -maxdepth 1 -type d -name 'VPIO-02-SID-SOURCE-2*' | LC_ALL=C sort > "$AFTER"
NEW=$(comm -13 "$BEFORE" "$AFTER")
test "$(printf '%s\n' "$NEW" | sed '/^$/d' | wc -l | tr -d ' ')" = 1
L="$NEW"
test -d "$L"
cp "/private/tmp/sid-source-batch-03-$STAMP.log" "$L/batch-invocation.log"
cp "$ACT_MARK" "$L/batch-act-marker.txt"
find "$L/journals" -maxdepth 1 -type f -name '*.jsonl' | wc -l | tr -d ' ' | tee "$L/journal-count.txt"
grep -c '^| ' "$L/ledger.md" | tee "$L/ledger-line-count.txt"
if [ -f "$L/source-ledger.md" ]; then grep -c '^| ' "$L/source-ledger.md" | tee "$L/source-ledger-line-count.txt"; else echo 0 | tee "$L/source-ledger-line-count.txt"; fi
if [ -f "$L/output-ledger.md" ]; then grep -c '^| ' "$L/output-ledger.md" | tee "$L/output-ledger-line-count.txt"; else echo 0 | tee "$L/output-ledger-line-count.txt"; fi
( cd "$L" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "/private/tmp/sid-source-batch-03-$STAMP.SHA256SUMS.source"
mv "/private/tmp/sid-source-batch-03-$STAMP.SHA256SUMS.source" "$L/SHA256SUMS.source"
echo "SID-SOURCE-BATCH-03 $STAMP subject $SUBJECT_SHA instrument $SHA preflight $PFSTAMP ledger $L"
