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
exp = None
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
with open(os.path.join(OUT, 'window-trailer.txt'), 'w') as f: f.write(residue)
print(f"## decoded one JSON value ending at char {end} · residue {len(residue)} chars recorded verbatim (window-trailer.txt): {residue[:200]!r}")
banner = re.fullmatch(r'\s*=+\n[^\n]*\.logarchive\n=+\n?\s*', residue)
if residue.strip() and not banner:
    print("## residue is NOT the documented trailer banner (`==========` / archive path / `==========`) — STOP; nothing read"); sys.exit(5)
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
with open(os.path.join(OUT, 'window-audio.jsonl'), 'w') as f:
    for e in aud: f.write(json.dumps({k: e.get(k) for k in ('timestamp', 'machTimestamp', 'processImagePath', 'processID', 'subsystem', 'category', 'eventMessage')}) + '\n')
print(f"## audio-related entries kept (window-audio.jsonl): {len(aud)} · per process: {collections.Counter(name(e) for e in aud).most_common()}")
for p in ('mediaserverd', 'coreaudiod'):
    print(f"## {p}: " + ("PRESENT — witnessed by log entries" if any(name(e) == p for e in ents) else "NOT PRESENT IN THE DEFAULT-LEVEL WINDOW"))
h = [e for e in aud if name(e) == 'VoiceKernelHarness']
print(f"## harness-process entries: {len(h)}" + (f" · first: {h[0]['timestamp']} · last: {h[-1]['timestamp']}" if h else " — NO harness entries at default level: alignment falls back to the export epoch (±1 s)"))
if not J or J == '-' or not os.path.exists(J): print("## no journal supplied; alignment not demonstrable"); sys.exit(0)
rs = [json.loads(l) for l in open(J) if l.strip()]
mono = lambda ev, **kw: next((r['timeMonotonicMs'] for r in rs if r['event'] == ev and all((r.get('evidence') or {}).get(k) == v for k, v in kw.items())), None)
anchors = {'app_lifecycle': mono('app_lifecycle'), 'session_activated': mono('session_activated'), 'start_begin': mono('graph_start_trace', step='start_begin'), 'start_return': mono('graph_start_trace', step='start_return'), 'graph_started': mono('graph_started'), 'engine_configuration_changed': mono('engine_configuration_changed'), 'first_input_callback': mono('first_input_callback')}
print("## journal monotonic ms:", anchors)
def wall(t):
    try: return datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f%z').timestamp()
    except ValueError: return datetime.strptime(t[:26], '%Y-%m-%d %H:%M:%S.%f').timestamp()
def tzof(t):
    try: return datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f%z').tzinfo
    except ValueError: return None
TZ = tzof(ts[0]) if ts else None   # render wall clocks in the log's own offset, not the reading machine's zone
fmt = lambda x: datetime.fromtimestamp(x, TZ).strftime('%H:%M:%S.%f')[:-3]
cands = [e for e in h if re.search(r'activ|AVAudioSession|audio', e.get('eventMessage') or '', re.I)]
print(f"## harness entries mentioning audio/activation: {len(cands)}")
for e in cands[:12]: print("   ", e['timestamp'], e.get('subsystem'), (e.get('eventMessage') or '')[:140])
if h and anchors['session_activated'] and anchors['app_lifecycle']:
    off_launch = wall(h[0]['timestamp']) - anchors['app_lifecycle'] / 1000.0
    print(f"## alignment anchor A (first harness log entry ↔ app_lifecycle): mono→wall offset {off_launch:.3f} s (first entry precedes didBecomeActive by an unknown launch interval; upper bound only)")
    if cands:
        off_act = wall(cands[0]['timestamp']) - anchors['session_activated'] / 1000.0
        print(f"## alignment anchor B (first activation-like harness entry ↔ session_activated): offset {off_act:.3f} s · A−B = {(off_launch - off_act) * 1000:.0f} ms")
        for k in ('start_begin', 'start_return', 'graph_started', 'engine_configuration_changed', 'first_input_callback'):
            if anchors[k]: print(f"   {k}: wall ≈ {fmt(anchors[k] / 1000.0 + off_act)}")
        lo = anchors['start_begin'] / 1000.0 + off_act - 0.05; hi = (anchors['first_input_callback'] or anchors['engine_configuration_changed'] or anchors['start_return']) / 1000.0 + off_act + 0.25
        win = [e for e in aud if lo <= wall(e['timestamp']) <= hi]
        print(f"## audio-daemon/harness entries inside the aligned start window [{fmt(lo)} … {fmt(hi)}]: {len(win)}")
        for e in win[:40]: print("   ", e['timestamp'][11:23], name(e), e.get('subsystem', ''), (e.get('eventMessage') or '')[:120])
    else:
        print("## no activation-like harness entry at default level — anchor B not demonstrable on this read (an --info re-read is a separate ruling)")
else:
    print("## anchor A not demonstrable: " + ("no harness entries" if not h else "journal lacks app_lifecycle/session_activated"))
