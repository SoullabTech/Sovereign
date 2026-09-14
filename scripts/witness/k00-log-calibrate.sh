#!/usr/bin/env bash
# KERNEL-00 hidden-state census · PASS 2 · steps C–E — ONE bounded unified-log calibration capture around ONE driver sample.
# Instrument validation, NOT physiological evidence (founder: "EXTERNAL READ ≠ PRESUMED INERT"). The LOG-CAL sample is its
# own stratum, never counted, never pooled.
# FAIL-CLOSED: refuses unless the newest k00-log-probe.sh output documents (a) a device option on `log collect`,
# (b) a start/last window on `log collect`, (c) --archive and --start on `log show`. Never calls `log config`,
# never `sysdiagnose`, never changes a level/mode, never attaches anything. Only `log collect` (read the device's
# persisted log store into an archive on the Mac) and `log show` (read that archive) are invoked.
#   usage: K00_EXEC_AUTHORITY="<founder authorization, verbatim>" [K00_LOG_SUDO=1] scripts/witness/k00-log-calibrate.sh --probe <probe-dir> [<ledger-root>]
# AUTH-1/2/3 (founder, 2026-09-14): attribution ≠ authority · no self-ratification · authority is an input, never a discovery.
#   EVIDENCE  — the probe is named explicitly (--probe); its sealed capture-time manifest is verified mechanically: seal == manifest,
#               manifest hashes == files, criterion id == expected, criterion revision is an ancestor of the probe's execution HEAD.
#               None of that authorizes anything; it establishes only that the evidence post-dates and targets the criterion.
#   AUTHORITY — K00_EXEC_AUTHORITY must be supplied at invocation by someone with jurisdiction. It is recorded verbatim and never read
#               from, compared against, or satisfied by repository state. Root (K00_LOG_SUDO=1) is a further, separate jurisdiction.
set -uo pipefail
PROBE=""; ROOT="docs/programme/VOICE-2026/driver-ledger"
while [ $# -gt 0 ]; do case "$1" in --probe) PROBE="$2"; shift 2;; *) ROOT="$1"; shift;; esac; done
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"; OUT="$ROOT/unifiedlog-cal-$STAMP"; mkdir -p "$OUT"   # C-D12: never `log-cal-<stamp>` — on a case-insensitive volume that IS the batch's `LOG-CAL-<stamp>`
CRITERION_ID="PASS2-COND3-POSITIONAL-ARCHIVE"; CRITERION_REV="09c1bd251"
UDID="${K00_UDID:-00008140-00163D9922E0801C}"      # the Xcode destination id = device UDID (never the devicectl CoreDevice id)
REC="$OUT/CALIBRATION.md"; say(){ echo "$*" | tee -a "$REC"; }
say "# unified-log calibration — $STAMP (instrument validation only; the sample is stratum LOG-CAL, never counted)"
# AUTHORITY (separate input, never discovered): refuse without it; record it verbatim; compare it to nothing in the repo.
[ -n "${K00_EXEC_AUTHORITY:-}" ] || { say "## STOP — no execution authority supplied (K00_EXEC_AUTHORITY unset). Authority is an input from someone with jurisdiction, not something this instrument or the repository can produce."; exit 4; }
say "## execution authority (verbatim, supplied at invocation): $K00_EXEC_AUTHORITY"
# EVIDENCE (explicit witness, mechanically verified — never 'newest'):
[ -n "$PROBE" ] && [ -d "$PROBE" ] || { say "## STOP — no explicit --probe <dir> supplied; a probe is named, never discovered"; exit 5; }
[ -f "$PROBE/manifest.json" ] && [ -f "$PROBE/SEAL.sha256" ] || { say "## STOP — probe $PROBE carries no sealed capture-time manifest (pre-provenance probe); it is not a valid witness"; exit 5; }
PV="$(python3 - "$PROBE" "$CRITERION_ID" "$CRITERION_REV" <<'PY'
import hashlib,json,os,subprocess,sys
p,cid,crev=sys.argv[1:4]
seal=open(os.path.join(p,'SEAL.sha256')).read().split()[0]
mbytes=open(os.path.join(p,'manifest.json'),'rb').read()
ok=[]
ok.append(("seal == manifest", hashlib.sha256(mbytes).hexdigest()==seal))
m=json.loads(mbytes)
ok.append(("manifest hashes == files", all(hashlib.sha256(open(os.path.join(p,f),'rb').read()).hexdigest()==h for f,h in m['files'].items())))
ok.append(("criterion id == expected", m.get('criterionId')==cid and m.get('criterionRevision')==crev))
anc=subprocess.run(['git','merge-base','--is-ancestor',crev,m.get('executionHead','')],capture_output=True).returncode==0
ok.append(("criterion revision is ancestor of probe execution HEAD", anc and m.get('criterionIsAncestorOfHead') is True))
for k,v in ok: print(f"{'PASS' if v else 'FAIL'} · {k}")
sys.exit(0 if all(v for _,v in ok) else 1)
PY
)"; PVRC=$?
say "## witness verification of $PROBE:"; say "$PV"
[ $PVRC -eq 0 ] || { say "## STOP — the named probe is not a valid post-amendment witness; nothing captured"; exit 5; }
if grep -qE -- '--device-udid' "$PROBE/log-collect-help.txt"; then DEVOPT="--device-udid"; elif grep -qE -- '--device-name' "$PROBE/log-collect-help.txt"; then DEVOPT="--device-name"; elif grep -qE -- '--device\b' "$PROBE/log-collect-help.txt"; then DEVOPT="--device"; else DEVOPT=""; fi
grep -qE -- '--start' "$PROBE/log-collect-help.txt" && WINOPT="--start" || { grep -qE -- '--last' "$PROBE/log-collect-help.txt" && WINOPT="--last"; } || WINOPT=""
# Condition 3 (founder ruling 2026-09-14): the collected archive must be readable back by the installed `log show`. The frozen
# spelling `--archive` was wrong — the installed tool documents the archive as a POSITIONAL argument
# (`usage: log show [options] <archive>`); the requirement is unchanged, only the CLI grammar is corrected.
grep -qE 'usage: log show \[options\] <archive>' "$PROBE/log-show-help.txt" && grep -qE -- '--start' "$PROBE/log-show-help.txt" && SHOWOK=1 || SHOWOK=0
say "## gate: probe $PROBE · collect device option: ${DEVOPT:-NONE} · collect window option: ${WINOPT:-NONE} · show <archive> positional + --start: $SHOWOK"
[ -n "$DEVOPT" ] && [ -n "$WINOPT" ] && [ "$SHOWOK" = 1 ] || { say "## STOP — the installed log(1) does not document the required options; mechanism returned for ruling, nothing captured"; exit 5; }
[ "$DEVOPT" = "--device-udid" ] || { say "## STOP — only --device-udid targets R1 unambiguously; installed help offers ${DEVOPT}; mechanism returned for ruling"; exit 5; }; DEVVAL="$UDID"
# C. read-only posture, recorded before anything runs
say "## commands this run will issue (verbatim): log collect $DEVOPT $DEVVAL $WINOPT <T0-5s> --output $OUT/device.logarchive · log show --start <T0> --end <T1> --style json $OUT/device.logarchive (ruling 2: default level only, no --info/--debug on the first read)"
say "## never issued: log config · sysdiagnose · any debugger/profile/level change"
# one bounded sample via the existing batch (its own daemon snapshots before/after apply)
T0_EPOCH=$(date +%s); T0_LOCAL="$(date -r $((T0_EPOCH-5)) "+%Y-%m-%d %H:%M:%S")"; T0_ISO="$(date -u -r $T0_EPOCH +%Y-%m-%dT%H:%M:%SZ)"
say "## T0 (Mac wall clock, before the sample): $T0_ISO (local $T0_LOCAL used for the collect window)"
scripts/witness/k00-driver-batch.sh LOG-CAL 1 --mode L --subject phase-a > "$OUT/batch-stdout.txt" 2>&1; BRC=$?
T1_EPOCH=$(date +%s); T1_LOCAL="$(date -r $((T1_EPOCH+2)) "+%Y-%m-%d %H:%M:%S")"
# C-D12: locate the ledger from the batch's own completion line, never by a case-sensitive glob on a case-insensitive volume
CALDIR="$(grep -o 'batch complete — .*/ledger.md' "$OUT/batch-stdout.txt" | sed 's/^batch complete — //; s#/ledger.md$##' | tail -1)"
ROW="$(grep -E '^\| ' "$CALDIR/ledger.md" 2>/dev/null | tail -1 || true)"
say "## sample: batch rc=$BRC · ledger ${CALDIR:-NONE} · row: $(cut -c1-260 <<<"${ROW:-(no row)}")"
if ! grep -qE '\*\*(gen-1 listen|failure then recovery|failure then degradation|other observed shape)\*\*' <<<"$ROW"; then
  say "## STOP — the LOG-CAL invocation did not yield an audio sample (infrastructure/precondition row); no archive is collected against a sample that did not occur. Not counted; nothing captured; device untouched."; exit 8
fi
say "## T1 (after export): $(date -u -r $T1_EPOCH +%Y-%m-%dT%H:%M:%SZ)"
# D. the capture — exactly one collect, then one show over the window
# 20260914T121709Z established: `log collect` from an attached device requires root on this Mac (rc 77, "Must be root").
# Root on the host is a founder act, taken at invocation by K00_LOG_SUDO=1; it prefixes ONLY the collect. Nothing else escalates.
SUDO=(); if [ "${K00_LOG_SUDO:-0}" = "1" ]; then SUDO=(sudo); say "## root: K00_LOG_SUDO=1 set by the founder — the collect runs under sudo (host privilege only; no device configuration)"; else say "## root: not granted (K00_LOG_SUDO unset) — if the tool requires root the collect will be refused and returned"; fi
CMD=("${SUDO[@]}" log collect "$DEVOPT" "$DEVVAL" "$WINOPT" "$T0_LOCAL" --output "$OUT/device.logarchive")
[ "$WINOPT" = "--last" ] && CMD=("${SUDO[@]}" log collect "$DEVOPT" "$DEVVAL" --last "$(( (T1_EPOCH-T0_EPOCH)/60 + 2 ))m" --output "$OUT/device.logarchive")
say "## collect: ${CMD[*]}"; CT0=$(date +%s); "${CMD[@]}" > "$OUT/collect-stdout.txt" 2>&1; CRC=$?; CT1=$(date +%s)
say "## collect rc=$CRC · $((CT1-CT0)) s · archive size: $(du -sh "$OUT/device.logarchive" 2>/dev/null | cut -f1 || echo none) · owner: $(stat -f '%Su' "$OUT/device.logarchive" 2>/dev/null || echo n/a)"; tail -5 "$OUT/collect-stdout.txt" | tee -a "$REC"
[ $CRC -eq 0 ] && [ -d "$OUT/device.logarchive" ] || { say "## STOP — collect did not produce an archive; mechanism returned for ruling"; exit 6; }
# Ruling 1 precision: follow the help grammar literally — `log show [options] <archive>`, options first, archive last.
# Ruling 2: first read at DEFAULT level only (no --info, no --debug); escalation, if any, is a separately recorded re-read.
log show --start "$T0_LOCAL" --end "$T1_LOCAL" --style json "$OUT/device.logarchive" > "$OUT/window.json" 2> "$OUT/show-stderr.txt"; SRC=$?
say "## show rc=$SRC · window.json $(du -sh "$OUT/window.json" | cut -f1) · window $((T1_EPOCH-T0_EPOCH+7)) s"
# E. what was observed + time alignment to the journal (post-hoc filtering by known process names; no predicate was given to the tool)
J="$(ls "$CALDIR"/journals/kernel00-*.jsonl 2>/dev/null | head -1)"
python3 - "$OUT/window.json" "$J" "$OUT" <<'PY' | tee -a "$REC"
import json,sys,collections,os,re
W,J,OUT=sys.argv[1:4]
try: ents=json.load(open(W))
except Exception as e: print("## window.json unreadable:",e); sys.exit(0)
print(f"## entries in window: {len(ents)}")
procs=collections.Counter(e.get('processImagePath','?').split('/')[-1] for e in ents); subs=collections.Counter(e.get('subsystem','') for e in ents)
print("## top processes:", procs.most_common(15)); print("## top subsystems:", subs.most_common(15))
AUD={'VoiceKernelHarness','mediaserverd','coreaudiod','audiomxd','runningboardd','SpringBoard','bluetoothd','audioclocksyncd'}
aud=[e for e in ents if e.get('processImagePath','').split('/')[-1] in AUD]
with open(os.path.join(OUT,'window-audio.jsonl'),'w') as f:
    for e in aud: f.write(json.dumps({k:e.get(k) for k in ('timestamp','machTimestamp','processImagePath','processID','subsystem','category','eventMessage')})+'\n')
print(f"## audio-related entries kept (window-audio.jsonl): {len(aud)} · per process: {collections.Counter(e.get('processImagePath','').split('/')[-1] for e in aud).most_common()}")
h=[e for e in aud if e.get('processImagePath','').endswith('VoiceKernelHarness')]
print(f"## harness-process entries: {len(h)}" + (f" · first: {h[0]['timestamp']} · last: {h[-1]['timestamp']}" if h else " — NO harness entries: alignment falls back to the export epoch (±1 s)"))
if not J or not os.path.exists(J): print("## no journal pulled for the LOG-CAL sample; alignment not demonstrable"); sys.exit(0)
rs=[json.loads(l) for l in open(J)]; mono=lambda ev,**kw: next((r['timeMonotonicMs'] for r in rs if r['event']==ev and all(r['evidence'].get(k)==v for k,v in kw.items())),None)
anchors={'app_lifecycle':mono('app_lifecycle'),'session_activated':mono('session_activated'),'start_begin':mono('graph_start_trace',step='start_begin'),'start_return':mono('graph_start_trace',step='start_return'),'graph_started':mono('graph_started'),'engine_configuration_changed':mono('engine_configuration_changed'),'first_input_callback':mono('first_input_callback')}
print("## journal monotonic ms:", anchors)
from datetime import datetime
def wall(ts): return datetime.strptime(ts[:26], '%Y-%m-%d %H:%M:%S.%f').timestamp()
cands=[e for e in h if re.search(r'activ|AVAudioSession|audio', e.get('eventMessage',''), re.I)]
print(f"## harness entries mentioning audio/activation: {len(cands)}"); 
for e in cands[:12]: print("   ", e['timestamp'], e.get('subsystem'), e.get('eventMessage','')[:140])
if h and anchors['session_activated'] and anchors['app_lifecycle']:
    off_launch = wall(h[0]['timestamp']) - anchors['app_lifecycle']/1000.0
    print(f"## alignment anchor A (first harness log entry ↔ app_lifecycle): mono→wall offset {off_launch:.3f} s (first entry precedes didBecomeActive by an unknown launch interval; upper bound only)")
    if cands:
        off_act = wall(cands[0]['timestamp']) - anchors['session_activated']/1000.0
        print(f"## alignment anchor B (first activation-like harness entry ↔ session_activated): offset {off_act:.3f} s · A−B = {(off_launch-off_act)*1000:.0f} ms")
        for k in ('start_begin','start_return','graph_started','engine_configuration_changed','first_input_callback'):
            if anchors[k]: print(f"   {k}: wall ≈ {datetime.fromtimestamp(anchors[k]/1000.0+off_act).strftime('%H:%M:%S.%f')[:-3]}")
        lo=anchors['start_begin']/1000.0+off_act-0.05; hi=(anchors['first_input_callback'] or anchors['engine_configuration_changed'] or anchors['start_return'])/1000.0+off_act+0.25
        win=[e for e in aud if lo<=wall(e['timestamp'])<=hi]
        print(f"## audio-daemon/harness entries inside the aligned start window [{datetime.fromtimestamp(lo).strftime('%H:%M:%S.%f')[:-3]} … {datetime.fromtimestamp(hi).strftime('%H:%M:%S.%f')[:-3]}]: {len(win)}")
        for e in win[:40]: print("   ", e['timestamp'][11:23], e.get('processImagePath','').split('/')[-1], e.get('subsystem',''), (e.get('eventMessage') or '')[:120])
PY
say "## configuration changed by this run: NONE issued (no log config, no profile, no debugger); daemon identity before/after is in $CALDIR/daemons/"
say "## custody: window.json sha256 $(shasum -a 256 "$OUT/window.json" | cut -d' ' -f1) · archive left on the Mac at $OUT/device.logarchive (not committed)"
echo "calibration record: $REC"
