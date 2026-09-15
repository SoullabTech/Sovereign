#!/usr/bin/env bash
# S2-VOLUME-DRIFT-01 — read-only Mac census (founder ruling 2026-09-15).
#   question: what can the Mac tell us, without changing anything, about the transition from the prepared output-volume
#             state (69, s2-output-source-20260915T022305Z after-read) to the witnessed state (31, S2-WITNESS-01 12:28:50Z)?
#   reads only: volume settings · audio devices · Bluetooth · boot/sleep/wake history · audio-related preference domains
#               (discovered by name, then `defaults read` only) · process list · unified log (documented flags only; raw kept OFF-repo).
#   never: set volume · select a device · play · signal · reinstall · touch the phone · write any preference.
#   usage: scripts/witness/k00-volume-drift-census.sh            (K00_DRIFT_LOG_LAST=14h by default — the `log show --last` window)
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$ROOT/docs/programme/VOICE-2026/driver-ledger/volume-drift-$STAMP"
RAW="/private/tmp/k00-volume-drift-$STAMP"
LAST="${K00_DRIFT_LOG_LAST:-14h}"
mkdir -p "$OUT" "$RAW"
capture(){ local f="$1"; shift; { echo "\$ $*"; "$@" </dev/null 2>&1; echo "[rc=$?]"; } > "$OUT/$f"; }

capture head.txt git -C "$ROOT" rev-parse HEAD
capture date-utc.txt date -u +%Y-%m-%dT%H:%M:%SZ
capture date-local.txt date
capture sw_vers.txt sw_vers
capture volume-now.txt osascript -e 'get volume settings'
system_profiler SPAudioDataType -json > "$OUT/audio-devices.json" 2>"$OUT/audio-devices.stderr" </dev/null; echo "[rc=$?]" > "$OUT/audio-devices.rc"
system_profiler SPBluetoothDataType -json > "$OUT/bluetooth.json" 2>"$OUT/bluetooth.stderr" </dev/null; echo "[rc=$?]" > "$OUT/bluetooth.rc"
capture uptime.txt uptime
capture who-b.txt who -b
capture last-reboot.txt last reboot
capture last-shutdown.txt last shutdown
capture pmset-log-sleepwake.txt sh -c 'pmset -g log | grep -E "Sleep|Wake|DarkWake|Display is turned|Notification" | tail -400'
capture pmset-assertions.txt pmset -g assertions
capture ps.txt ps -axo pid,ppid,lstart,etime,user,comm
capture defaults-domains-audio.txt sh -c 'defaults domains | tr "," "\n" | sed "s/^ *//" | grep -i -E "audio|sound|volume|coreaudio|bluetooth|systemsound"'
grep -v -E '^\$ |^\[rc' "$OUT/defaults-domains-audio.txt" | while read -r dom; do
  [ -n "$dom" ] && capture "defaults-read-$dom.txt" defaults read "$dom"
done
capture prefs-listing.txt sh -c 'ls -la "$HOME/Library/Preferences" | grep -i -E "audio|sound|coreaudio|bluetooth|volume"'
capture prefs-byhost-listing.txt sh -c 'ls -la "$HOME/Library/Preferences/ByHost" | grep -i -E "audio|sound|coreaudio|bluetooth|volume"'
capture log-show-help.txt log show --help
capture man-log.txt sh -c 'man log | col -b'
log show --last "$LAST" --style syslog --predicate 'subsystem == "com.apple.coreaudio" OR process == "coreaudiod" OR eventMessage CONTAINS[c] "volume"' > "$RAW/log-window.txt" 2>"$OUT/log-show.stderr" </dev/null
echo "[rc=$?] last=$LAST" > "$OUT/log-show.rc"
wc -l < "$RAW/log-window.txt" > "$OUT/log-window.lines"
shasum -a 256 "$RAW/log-window.txt" > "$OUT/log-window.sha256"
grep -i "volume" "$RAW/log-window.txt" | head -20000 > "$OUT/log-volume-lines.txt"
grep -i -E "B06Ultra|Mac Studio Speakers|default output|DefaultOutput|kAudioHardwarePropertyDefaultOutputDevice" "$RAW/log-window.txt" | head -20000 > "$OUT/log-device-lines.txt"

python3 - "$OUT" "$RAW/log-window.txt" "$LAST" <<'PY'
import hashlib, json, os, sys
out, rawlog, last = sys.argv[1], sys.argv[2], sys.argv[3]
files = sorted(f for f in os.listdir(out) if f not in ('manifest.json', 'SEAL.sha256'))
h = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
man = {'instrument': 'k00-volume-drift-census.sh', 'act': 'S2-VOLUME-DRIFT-01', 'captureTimestamp': os.path.basename(out).replace('volume-drift-', ''),
       'executionHead': open(os.path.join(out, 'head.txt')).read().split('\n')[1].strip(),
       'volumeSet': False, 'deviceSelected': False, 'soundPlayed': False, 'phoneTouched': False, 'preferencesWritten': False,
       'rawLogOffRepo': {'path': rawlog, 'sha256': h(rawlog) if os.path.exists(rawlog) else None, 'window': last},
       'files': {f: h(os.path.join(out, f)) for f in files}}
json.dump(man, open(os.path.join(out, 'manifest.json'), 'w'), indent=2, sort_keys=True)
open(os.path.join(out, 'SEAL.sha256'), 'w').write(h(os.path.join(out, 'manifest.json')) + '  manifest.json\n')
print('files:', len(files)); print('sealed:', open(os.path.join(out, 'SEAL.sha256')).read().strip())
PY
echo "census written: $OUT"
echo "raw unified-log window (off-repo): $RAW/log-window.txt"
