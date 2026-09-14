#!/usr/bin/env bash
# KERNEL-00 hidden-state census · PASS 2 · step A/B — DISCOVERY ONLY of the unified-log capture verb, with CAPTURE-TIME PROVENANCE.
# Captures the INSTALLED tool's own help text verbatim; issues no capture, changes no configuration, touches no device logging level.
# `xcrun devicectl` was probed two levels deep (2026-09-13): it has NO log verb (only `sysdiagnose`, separately ruled out).
# AUTH-3 (founder, 2026-09-14): authority is an input, never a discovery. This probe produces EVIDENCE only: a manifest written
# during the same execution binding (a) the execution HEAD, (b) the criterion revision the evidence is captured against,
# (c) tool identity, (d) timestamp, (e) SHA-256 of every captured file — then a seal over the manifest. It authorizes nothing.
#   usage: scripts/witness/k00-log-probe.sh [<ledger-root>]
set -uo pipefail
CRITERION_ID="PASS2-COND3-POSITIONAL-ARCHIVE"; CRITERION_REV="09c1bd251"   # the amendment that corrected condition 3 (ruling 1, 2026-09-14)
ROOT="${1:-docs/programme/VOICE-2026/driver-ledger}"; STAMP="$(date -u +%Y%m%dT%H%M%SZ)"; OUT="$ROOT/log-probe-$STAMP"; mkdir -p "$OUT"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
if git merge-base --is-ancestor "$CRITERION_REV" HEAD 2>/dev/null; then ANC=yes; else ANC=no; fi
{ sw_vers; xcodebuild -version 2>/dev/null; which log; shasum -a 256 "$(which log)" 2>/dev/null; } > "$OUT/versions.txt" 2>&1
capture(){ # $1 = file · rest = command; help pages only. C-D11: the filename is shifted off before executing.
  local f="$1"; shift
  { echo "\$ $*"; "$@"; echo "[rc=$?]"; } > "$OUT/$f" 2>&1
}
capture log-help.txt log help
capture log-collect-help.txt log help collect
capture log-show-help.txt log help show
capture log-stream-help.txt log help stream
capture log-config-help.txt log help config          # captured to show it exists and that this instrument never invokes it
capture man-log.txt sh -c 'MANPAGER=cat man log 2>/dev/null | col -b'
capture devicectl-sysdiagnose-help.txt xcrun devicectl device sysdiagnose --help   # recorded, NOT used (separate ruling)
S="$OUT/SUMMARY.txt"
{ echo "# unified-log capture discovery — $STAMP (help pages only; nothing captured, nothing configured)"
  echo "## provenance: execution HEAD $HEAD_SHA · criterion $CRITERION_ID@$CRITERION_REV · criterion is ancestor of HEAD: $ANC"
  echo "## 1. log collect documents a device-targeting option?"; grep -nE -- '--device-udid' "$OUT/log-collect-help.txt" | head -5 || echo "NONE FOUND"
  echo "## 2. log collect documents a bounded start window?"; grep -nE -- '--(start|last)' "$OUT/log-collect-help.txt" | head -5 || echo "NONE FOUND"
  echo "## 3. log show documents archive replay (positional <archive>, the corrected grammar)?"; grep -nE 'usage: log show \[options\] <archive>' "$OUT/log-show-help.txt" || echo "NONE FOUND"
  echo "## log show read-level flags (for the separately ruled escalation ladder)"; grep -nE -- '--\[no-\](info|debug)' "$OUT/log-show-help.txt" || echo "NONE FOUND"
  echo "## read-only assessment: the help text is the authority; any option that changes levels/modes lives under 'log config', never invoked here."
} > "$S"
# capture-time provenance: manifest written in this same execution, then sealed
python3 - "$OUT" "$HEAD_SHA" "$CRITERION_ID" "$CRITERION_REV" "$ANC" "$STAMP" <<'PY'
import hashlib,json,os,sys
out,head,cid,crev,anc,stamp=sys.argv[1:7]
files={f:hashlib.sha256(open(os.path.join(out,f),'rb').read()).hexdigest() for f in sorted(os.listdir(out)) if f not in ('manifest.json','SEAL.sha256')}
m={"instrument":"k00-log-probe.sh","captureTimestamp":stamp,"executionHead":head,"criterionId":cid,"criterionRevision":crev,"criterionIsAncestorOfHead":anc=="yes","tool":open(os.path.join(out,'versions.txt')).read().strip().splitlines(),"files":files}
open(os.path.join(out,'manifest.json'),'w').write(json.dumps(m,indent=1,sort_keys=True)+"\n")
seal=hashlib.sha256(open(os.path.join(out,'manifest.json'),'rb').read()).hexdigest()
open(os.path.join(out,'SEAL.sha256'),'w').write(seal+"  manifest.json\n")
print("## sealed:",seal)
PY
cat "$S"; echo "probe written: $OUT"; echo "NOTE: this probe is EVIDENCE. It authorizes nothing (AUTH-1/2/3). Calibration must name it explicitly (--probe) and receive execution authority as a separate input."
