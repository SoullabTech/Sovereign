cd /private/tmp/k0506-s2pop2-b198e2e37
K00_DEVICE=A0736AC8-793B-516F-AC72-C076DB6CEE38 K00_XCODE_DEST=00008140-00163D9922E0801C \
scripts/witness/k00-driver-batch.sh K00-0506-S2 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02 --stimulus s2-nearend 2>&1 | tee /private/tmp/k00-0506-s2-transcript.txt
echo "BATCH_PIPELINE_RC=${PIPESTATUS[0]}"
