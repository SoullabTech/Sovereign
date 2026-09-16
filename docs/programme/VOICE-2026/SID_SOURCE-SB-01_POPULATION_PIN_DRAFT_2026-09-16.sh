set -e
set -o pipefail
test -n "$K00_EXEC_AUTHORITY"
INSTRUMENT=9ed72a38cce6fb55e909e747898f4d452dcfdf3d
SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8
ACT_MARK=/private/tmp/sid-source-sb-01-invoked.txt
test ! -e "$ACT_MARK"
ACTSTAMP=$(date -u +%Y%m%dT%H%M%SZ)
printf 'SID-SOURCE-SB-01 INVOKED %s subject %s instrument %s\n' "$ACTSTAMP" "$SUBJECT_SHA" "$INSTRUMENT" > "$ACT_MARK"
PTR=/private/tmp/sid-source-sb-01-preflight-current.txt
test -f "$PTR"
WT=$(sed -n '1p' "$PTR"); PF=$(sed -n '2p' "$PTR")
case "$WT" in /private/tmp/sid-source-sb-01-$INSTRUMENT-*) ;; *) exit 2;; esac
case "$PF" in "$WT"/docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-SOURCE-SB-preflight-*) ;; *) exit 2;; esac
cd "$WT"; test "$(git rev-parse HEAD)" = "$INSTRUMENT"
test -f "$PF/SHA256SUMS.preflight"; ( cd "$PF" && shasum -a 256 -c SHA256SUMS.preflight >/dev/null )
test -f "$PF/PREFLIGHT-CLEAN"
PFSTAMP=$(basename "$PF" | sed 's/.*preflight-//'); NOW=$(date -u +%s); PFSEC=$(date -u -j -f %Y%m%dT%H%M%SZ "$PFSTAMP" +%s); AGE=$((NOW-PFSEC)); test "$AGE" -ge 0; test "$AGE" -le 300
BASE="$WT/docs/programme/VOICE-2026/driver-ledger"; OUT=/private/tmp/sid-source-sb-01-$ACTSTAMP; mkdir -p "$OUT"
BEFORE="$OUT/before-dirs.txt"; AFTER="$OUT/after-dirs.txt"
find "$BASE" -maxdepth 1 -type d -name 'VPIO-02-SID-SOURCE-SB-2*' | LC_ALL=C sort > "$BEFORE"
scripts/witness/k00-driver-batch.sh VPIO-02-SID-SOURCE-SB 10 --act output --vp on --mode L --hold 15 --cancel-at 1000 --settle 2 --subject vpio-02-sid --stimulus sid-nearend-gated 2>&1 | tee "$OUT/batch-invocation.log"
find "$BASE" -maxdepth 1 -type d -name 'VPIO-02-SID-SOURCE-SB-2*' | LC_ALL=C sort > "$AFTER"
NEW="$(comm -13 "$BEFORE" "$AFTER")"; test "$(printf '%s\n' "$NEW" | sed '/^$/d' | wc -l | tr -d ' ')" = 1
L="$NEW"; test -d "$L"
test "$(find "$L/journals" -type f -name '*.jsonl' ! -path '*/not-a-sample/*' | wc -l | tr -d ' ')" = 10
test -s "$L/source-ledger.md"; test -s "$L/output-ledger.md"
cp "$ACT_MARK" "$L/source-sb-act-marker.txt"; cp "$OUT/batch-invocation.log" "$L/source-sb-invocation.log"; cp "$PF/PREFLIGHT-CLEAN" "$L/source-sb-preflight-clean.txt"
printf 'authority lines %s\nbytes %s\nsha256 %s\ncontents NOT CARRIED\n' "$(printf '%s\n' "$K00_EXEC_AUTHORITY" | wc -l | tr -d ' ')" "$(printf '%s\n' "$K00_EXEC_AUTHORITY" | wc -c | tr -d ' ')" "$(printf '%s\n' "$K00_EXEC_AUTHORITY" | shasum -a 256 | cut -d' ' -f1)" > "$L/authority-metadata.txt"
SEAL=/private/tmp/sid-source-sb-01-$ACTSTAMP.SHA256SUMS.population
( cd "$L" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$SEAL"; mv "$SEAL" "$L/SHA256SUMS.population"
echo "SID-SOURCE-SB-01 $ACTSTAMP COMPLETE subject $SUBJECT_SHA instrument $INSTRUMENT N=10 preflight $PFSTAMP ledger $L"
