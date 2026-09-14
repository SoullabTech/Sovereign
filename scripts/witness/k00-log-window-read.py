#!/usr/bin/env python3
# KERNEL-00 hidden-state census · PASS 2 · step E reader — reads ONE `log show --style json` window file that already exists on the Mac.
# C-D13 (2026-09-14): `log show --style json <archive>` writes ONE JSON array to stdout and then a trailer banner
# (`==========\n<archive path>\n==========\n`). The first calibration parsed the file with json.load and refused it as
# "Extra data". This reader decodes exactly one JSON value (raw_decode), records whatever follows VERBATIM as
# window-trailer.txt, and STOPS if the residue is anything other than the documented banner shape — nothing is dropped silently.
# Pure function on files: no device act, no root, no `log` invocation. Authority for the file to exist came from elsewhere.
#   usage: k00-log-window-read.py <window.json> <journal.jsonl|-> <outdir> [--expect-sha <sha256>]
import json, sys, collections, os, re, hashlib
from datetime import datetime, timezone
args = sys.argv[1:]
exp = None; exparch = None; suffix = ''
if '--suffix' in args:
    i = args.index('--suffix'); suffix = '-' + args[i + 1]; del args[i:i + 2]   # e.g. -info: outputs never overwrite the default-level read
if '--expect-archive' in args:
    i = args.index('--expect-archive'); exparch = args[i + 1]; del args[i:i + 2]
if '--expect-sha' in args:
    i = args.index('--expect-sha'); exp = args[i + 1]; del args[i:i + 2]
W, J, OUT = args[:3]
raw = open(W, 'rb').read()
sha = hashlib.sha256(raw).hexdigest()
print(f"## window.json sha256 {sha} · bytes {len(raw)}" + (f" · expected {exp} · " + ("MATCH" if sha == exp else "MISMATCH — STOP") if exp else ""))
if exp and sha != exp: sys.exit(3)
s = raw.decode('utf-8', errors='replace')
try:
    ents, end = json.JSONDecoder().raw_decode(s)
except Exception as e:
    print("## window.json: no JSON value decodable at offset 0 —", e, "— STOP"); sys.exit(5)
residue = s[end:]
with open(os.path.join(OUT, f'window{suffix}-trailer.txt'), 'w') as f: f.write(residue)
print(f"## decoded one JSON value ending at char {end} · residue {len(residue)} chars recorded verbatim (window{suffix}-trailer.txt): {residue[:200]!r}")
banner = re.fullmatch(r'\s*=+\n[^\n]*\.logarchive\n=+\n?\s*', residue)
if residue.strip() and not banner:
    print("## residue is NOT the documented trailer banner (`==========` / archive path / `==========`) — STOP; nothing read"); sys.exit(5)
if banner and exparch:   # ruling step 4: the banner must name THE archive this calibration read, not just any .logarchive
    named = residue.strip().split('\n')[1].strip(); want = '/' + os.path.basename(os.path.dirname(os.path.abspath(exparch))) + '/' + os.path.basename(exparch)
    print(f"## trailer names {named} · expected …{want} · " + ("MATCH" if named.endswith(want) else "MISMATCH — STOP"))
    if not named.endswith(want): sys.exit(5)
if not isinstance(ents, list):
    print("## decoded value is not a JSON array — STOP"); sys.exit(5)
print(f"## entries in window: {len(ents)}")
name = lambda e: (e.get('processImagePath') or '').split('/')[-1]
procs = collections.Counter(name(e) or '(no process — ' + e.get('eventType', '?') + ')' for e in ents)
subs = collections.Counter(e.get('subsystem', '') for e in ents)
types = collections.Counter(e.get('eventType', '') for e in ents)
print("## event types:", types.most_common())
print("## top processes:", procs.most_common(15)); print("## top subsystems:", subs.most_common(15))
ts = [e['timestamp'] for e in ents if e.get('timestamp')]
print(f"## first timestamp: {ts[0] if ts else '—'} · last: {ts[-1] if ts else '—'}")
AUD = {'VoiceKernelHarness', 'mediaserverd', 'coreaudiod', 'audiomxd', 'runningboardd', 'SpringBoard', 'bluetoothd', 'audioclocksyncd', 'audioaccessoryd'}
aud = [e for e in ents if name(e) in AUD]
with open(os.path.join(OUT, f'window{suffix}-audio.jsonl'), 'w') as f:
    for e in aud: f.write(json.dumps({k: e.get(k) for k in ('timestamp', 'machTimestamp', 'processImagePath', 'processID', 'subsystem', 'category', 'eventMessage')}) + '\n')
print(f"## audio-related entries kept (window{suffix}-audio.jsonl): {len(aud)} · per process: {collections.Counter(name(e) for e in aud).most_common()}")
LEVEL = (suffix[1:].upper() + '-LEVEL') if suffix else 'DEFAULT-LEVEL'   # A2: absence is scoped to the level actually read (C-D15)
for p in ('mediaserverd', 'coreaudiod'):
    print(f"## {p}: " + ("PRESENT — witnessed by log entries" if any(name(e) == p for e in ents) else f"NOT PRESENT IN THE {LEVEL} WINDOW"))
h = [e for e in aud if name(e) == 'VoiceKernelHarness']
print(f"## harness-process entries: {len(h)}" + (f" · first: {h[0]['timestamp']} · last: {h[-1]['timestamp']}" if h else " — NO harness entries at default level: alignment falls back to the export epoch (±1 s)"))
if not J or J == '-' or not os.path.exists(J): print("## no journal supplied; alignment not demonstrable"); sys.exit(0)
rs = [json.loads(l) for l in open(J) if l.strip()]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from k00_log_align import align   # C-D14: exact framework-line anchors from the sample's own pid; never a loose regex
align(aud, rs)
