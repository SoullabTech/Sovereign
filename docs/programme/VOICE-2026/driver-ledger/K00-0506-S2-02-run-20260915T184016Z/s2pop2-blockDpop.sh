cd /private/tmp/k0506-s2pop2-b198e2e37
LD="$(ls -td docs/programme/VOICE-2026/driver-ledger/K00-0506-S2-2* | head -1)"
echo "LEDGER_DIR=$LD"
pgrep -x afplay > /private/tmp/s2pop2-afplay-after.txt && { cat /private/tmp/s2pop2-afplay-after.txt; echo "AFPLAY_PROCESSES_AFTER=nonzero"; } || echo "AFPLAY_PROCESSES_AFTER=0"
ls -la "$LD/stimulus-preflight"
cat "$LD/stimulus-preflight/stimulus.sha256" "$LD/stimulus-preflight/afplay.sha256" "$LD/stimulus-preflight/stimulus-wave-metadata.txt" "$LD/stimulus-preflight/volume.txt"
for f in "$LD"/stimulus-sample-*.tsv; do echo "== $f"; grep -E '^(sample|pid|startEpoch|preRunState|postRunState|waitExitStatus|stopEpoch|custody)' "$f"; done
grep -c "custody$(printf '\t')VALID" "$LD"/stimulus-sample-*.tsv
cat "$LD/sample-timing.tsv"
grep -E 'stimulus|STOP|ABORT|custody|ledgered|batch complete|INFRASTRUCTURE' "$LD/batch.log"
grep -c '^| AUTOMATED' "$LD/ledger.md"
ls "$LD/journals" | grep -c '\.jsonl$'
cp /private/tmp/k00-0506-s2-transcript.txt "$LD/transcript.txt"
( cd "$LD" && shasum -a 256 transcript.txt stimulus-sample-*.tsv stimulus-sample-*-afplay.log stimulus-preflight/* journals/*.jsonl ledger.md output-ledger.md batch.log sample-timing.tsv daemons/* > SHA256SUMS.population && wc -l SHA256SUMS.population && cat SHA256SUMS.population )
