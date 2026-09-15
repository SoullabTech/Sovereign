#!/usr/bin/env bash
# KERNEL-00 · K00-06 · S2 design — MAC PLAYBACK-CAPABILITY CENSUS (founder ruling 2026-09-15): DISCOVERY ONLY.
# Captures the INSTALLED tools' own help / man text and the audio-device listing VERBATIM. It plays NO sound, creates NO stimulus
# file, changes NO volume, selects NO output device, configures nothing. `afplay` and every other name below is a CANDIDATE until
# this probe shows it exists and what it documents. `say` is documented from its man page but NEVER executed (it speaks its argument).
# Every tool invocation runs with stdin closed (</dev/null) and only a help flag or no argument — never a file path.
#   usage: scripts/witness/k00-playback-probe.sh [<ledger-root>]
set -uo pipefail
ROOT="${1:-docs/programme/VOICE-2026/driver-ledger}"; STAMP="$(date -u +%Y%m%dT%H%M%SZ)"; OUT="$ROOT/playback-probe-$STAMP"; mkdir -p "$OUT"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
{ sw_vers; uname -a; } > "$OUT/versions.txt" 2>&1
capture(){ # $1 = file · rest = command; help pages / listings only. C-D11: the filename is shifted off before executing. stdin closed.
  local f="$1"; shift
  { echo "\$ $*"; "$@" </dev/null; echo "[rc=$?]"; } > "$OUT/$f" 2>&1
}
CANDIDATES="afplay say ffplay ffmpeg sox play mpv SwitchAudioSource osascript system_profiler"
for c in $CANDIDATES; do
  capture "which-$c.txt" sh -c "command -v $c"
  if command -v "$c" >/dev/null 2>&1; then
    capture "man-$c.txt" sh -c "MANPAGER=cat man $c 2>/dev/null | col -b"
    capture "shasum-$c.txt" sh -c "shasum -a 256 \"\$(command -v $c)\""
  fi
done
# help flags, one conventional form per tool, executed only if the tool exists; `say` deliberately absent from this list.
helpflag(){ command -v "$1" >/dev/null 2>&1 && capture "help-$1.txt" "$1" "$2"; }
helpflag afplay -h
helpflag ffplay -h
helpflag ffmpeg -h
helpflag sox -h
helpflag play -h
helpflag mpv --help
helpflag SwitchAudioSource -h
command -v afplay >/dev/null 2>&1 && capture "help-afplay-noargs.txt" afplay
# audio devices and the current default output — read-only listings; nothing is selected or changed.
capture audio-devices.txt system_profiler SPAudioDataType
capture audio-devices.json system_profiler SPAudioDataType -json
capture output-volume-read.txt osascript -e 'get volume settings'
S="$OUT/SUMMARY.txt"
{ echo "# Mac playback-capability census — $STAMP (help/man/listing captures only; no sound, no file, no volume or device change)"
  echo "## execution HEAD $HEAD_SHA"
  echo "## 1. candidate executables present"; for c in $CANDIDATES; do printf '%s: ' "$c"; if grep -qE '^/' "$OUT/which-$c.txt"; then grep -E '^/' "$OUT/which-$c.txt" | head -1; else echo ABSENT; fi; done
  echo "## 2. documented file argument / gain or volume option / duration or time option (grep of man + help text; the text is the authority)"
  for c in afplay ffplay ffmpeg sox play mpv; do
    for f in "$OUT/man-$c.txt" "$OUT/help-$c.txt"; do [ -s "$f" ] || continue
      echo "### $(basename "$f")"
      grep -nEi 'audio_file|file|input' "$f" | head -4 || true
      grep -nEi -- 'volume|gain|-v ' "$f" | head -4 || echo "no volume/gain line found"
      grep -nEi -- 'time|duration|-t ' "$f" | head -4 || echo "no time/duration line found"
    done
  done
  echo "## 3. say: documented only (man captured); NEVER executed by this probe"
  echo "## 4. audio devices (system_profiler; default output marked by the listing itself)"; grep -nE '^\s{4}[A-Za-z].*:$|Default Output Device|Output Source|Manufacturer' "$OUT/audio-devices.txt" | head -40 || echo "listing empty"
  echo "## 5. output volume (read only)"; cat "$OUT/output-volume-read.txt"
  echo "## 6. device selection without UI: SwitchAudioSource present? $(grep -qE '^/' "$OUT/which-SwitchAudioSource.txt" && echo YES || echo NO) (third-party; documented only if present; NOT invoked with -s)"
  echo "## read-only assessment: the captured text is the authority for the S2 design; nothing here authorizes playback."
} > "$S"
python3 - "$OUT" "$HEAD_SHA" "$STAMP" <<'PY'
import hashlib,json,os,sys
out,head,stamp=sys.argv[1:4]
files={f:hashlib.sha256(open(os.path.join(out,f),'rb').read()).hexdigest() for f in sorted(os.listdir(out)) if f not in ('manifest.json','SEAL.sha256')}
m={"instrument":"k00-playback-probe.sh","captureTimestamp":stamp,"executionHead":head,"soundPlayed":False,"filesCreatedOutsideProbe":False,"volumeChanged":False,"deviceSelected":False,"files":files}
open(os.path.join(out,'manifest.json'),'w').write(json.dumps(m,indent=1,sort_keys=True)+"\n")
seal=hashlib.sha256(open(os.path.join(out,'manifest.json'),'rb').read()).hexdigest()
open(os.path.join(out,'SEAL.sha256'),'w').write(seal+"  manifest.json\n")
print("## sealed:",seal)
PY
cat "$S"; echo "probe written: $OUT"; echo "NOTE: this probe is EVIDENCE for the S2 design. It authorizes nothing (AUTH-1/2/3)."
