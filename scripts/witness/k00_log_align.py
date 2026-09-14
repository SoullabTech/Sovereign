#!/usr/bin/env python3
# KERNEL-00 hidden-state census · PASS 2 · time alignment of ONE default-level unified-log window to ONE kernel journal.
# C-D14 (2026-09-14): the first reader's anchor B was a loose regex (`activ|AVAudioSession|audio`) that matched an XPC
# "activating connection" line from a DIFFERENT harness pid (a stray terminated by the driver's precondition step) and
# printed a mis-aligned "start window" as if aligned. Anchors are now exact framework lines from the sample's own pid:
#   session_activated            ↔ com.apple.coreaudio  "AVAudioSession_iOS.mm… Activated session 0x…"
#   start_begin                  ↔ com.apple.avfaudio   "AVAudioEngine.mm… Engine@…: start, was running N"
#   engine_configuration_changed ↔ com.apple.avfaudio   "Engine@…: iounit configuration changed > posting notification"  (posted; journal = received)
#   route_changed                ↔ com.apple.coreaudio  "posting AVAudioSessionRouteChangeNotification"                  (posted; journal = received)
# The offset is taken from the two synchronous anchors (activation, start begin) and every anchor's residual is reported.
# Pure function on files. No device act, no log(1). Usage: k00_log_align.py <window-audio.jsonl|window entries> <journal.jsonl>
import json, sys, re, os
from datetime import datetime
def wall(t):
    try: return datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f%z').timestamp()
    except ValueError: return datetime.strptime(t[:26], '%Y-%m-%d %H:%M:%S.%f').timestamp()
def tzof(t):
    try: return datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f%z').tzinfo
    except ValueError: return None
name = lambda e: (e.get('processImagePath') or '').split('/')[-1]
def align(aud, rs, out=print):
    TZ = tzof(aud[0]['timestamp']) if aud else None
    fmt = lambda x: datetime.fromtimestamp(x, TZ).strftime('%H:%M:%S.%f')[:-3]
    h = [e for e in aud if name(e) == 'VoiceKernelHarness']
    pids = {}
    for e in h: pids.setdefault(e['processID'], []).append(e)
    out("## harness pids in window: " + (" · ".join(f"{p}: {len(v)} entries {v[0]['timestamp'][11:23]}…{v[-1]['timestamp'][11:23]}" for p, v in sorted(pids.items())) or "none"))
    act = [e for e in h if 'Activated session' in (e.get('eventMessage') or '')]
    if not act: out("## no `Activated session` line from any harness pid at this level — anchor not demonstrable on this read"); return None
    pid = act[-1]['processID']; hp = [e for e in h if e['processID'] == pid]
    out(f"## sample pid = {pid} (the last harness pid that activated an audio session); other harness pids are NOT the sample")
    mono = lambda ev, **kw: next((r['timeMonotonicMs'] for r in rs if r['event'] == ev and all((r.get('evidence') or {}).get(k) == v for k, v in kw.items())), None)
    J = {'session_activated': mono('session_activated'), 'start_begin': mono('graph_start_trace', step='start_begin'), 'start_return': mono('graph_start_trace', step='start_return'),
         'engine_configuration_changed': mono('engine_configuration_changed'), 'route_changed': mono('route_changed'), 'first_input_callback': mono('first_input_callback'), 'app_lifecycle': mono('app_lifecycle')}
    cand = lambda pat, sub: [e for e in hp if e.get('subsystem') == sub and re.search(pat, e.get('eventMessage') or '')]
    first = lambda pat, sub: (cand(pat, sub) or [None])[0]
    Lg = {'session_activated': first(r'Activated session 0x', 'com.apple.coreaudio'), 'start_begin': first(r'AVAudioEngine\.mm.*start, was running', 'com.apple.avfaudio')}
    pre = [k for k in ('session_activated', 'start_begin') if Lg[k] and J[k]]
    off0 = sum(wall(Lg[k]['timestamp']) - J[k] / 1000.0 for k in pre) / len(pre) if pre else None
    nearest = lambda pat, sub, k: (min(cand(pat, sub), key=lambda e: abs(wall(e['timestamp']) - (J[k] / 1000.0 + off0))) if (cand(pat, sub) and J[k] and off0 is not None) else first(pat, sub))
    # posted anchors: a session posts several route/configuration notifications; the one the kernel journaled is the nearest in time
    Lg['engine_configuration_changed'] = nearest(r'iounit configuration changed > posting notification', 'com.apple.avfaudio', 'engine_configuration_changed')
    Lg['route_changed'] = nearest(r'posting AVAudioSessionRouteChangeNotification', 'com.apple.coreaudio', 'route_changed')
    out("## journal monotonic ms: " + json.dumps(J))
    for k, e in Lg.items(): out(f"## log anchor {k}: " + (f"{e['timestamp']} · {e.get('subsystem')} · {(e.get('eventMessage') or '').strip()[:110]}" if e else "NOT FOUND at this level"))
    sync = [k for k in ('session_activated', 'start_begin') if Lg[k] and J[k]]
    if not sync: out("## alignment NOT demonstrable: neither synchronous anchor present"); return None
    offs = {k: wall(Lg[k]['timestamp']) - J[k] / 1000.0 for k in sync}
    off = sum(offs.values()) / len(offs)
    out(f"## mono→wall offset from {sync}: {off:.3f} s · agreement between them: {abs(offs[sync[0]] - offs[sync[-1]]) * 1000:.0f} ms")
    for k, e in Lg.items():
        if e and J[k]: out(f"   residual {k}: log − journal = {(wall(e['timestamp']) - (J[k] / 1000.0 + off)) * 1000:+.0f} ms" + (" (posted before the kernel received it — expected sign)" if k in ('engine_configuration_changed', 'route_changed') else ""))
    for k in ('app_lifecycle', 'session_activated', 'start_begin', 'start_return', 'engine_configuration_changed', 'first_input_callback'):
        if J[k]: out(f"   {k}: wall ≈ {fmt(J[k] / 1000.0 + off)}")
    if J['start_begin'] and J['start_return']:
        lo = J['start_begin'] / 1000.0 + off; hi = J['start_return'] / 1000.0 + off
        win = [e for e in aud if lo <= wall(e['timestamp']) <= hi]
        out(f"## entries inside engine.start() [{fmt(lo)} … {fmt(hi)}] ({(hi - lo) * 1000:.0f} ms): {len(win)} · per process: " + json.dumps(__import__('collections').Counter(name(e) for e in win).most_common()))
        for e in win[:60]: out(f"   {e['timestamp'][11:23]} +{(wall(e['timestamp']) - lo) * 1000:4.0f} ms {name(e)} {e.get('subsystem', '')} {(e.get('eventMessage') or '').strip()[:120]}")
    if J['session_activated'] and J['first_input_callback']:
        lo = J['session_activated'] / 1000.0 + off - 0.15; hi = J['first_input_callback'] / 1000.0 + off + 0.05
        d = [e for e in aud if name(e) not in ('VoiceKernelHarness', 'SpringBoard', 'bluetoothd') and lo <= wall(e['timestamp']) <= hi]
        out(f"## audio-DAEMON entries (audiomxd/audioaccessoryd/…; not the harness) from activation−150 ms to first callback+50 ms: {len(d)}")
        out(f"## audiomxd entries in that interval: {sum(1 for e in d if name(e) == 'audiomxd')} · per process: " + json.dumps(__import__('collections').Counter(name(e) for e in d).most_common()))
        for e in d[:30]: out(f"   {e['timestamp'][11:23]} {name(e)} {e.get('subsystem', '')} {(e.get('eventMessage') or '').strip()[:120]}")
    return off
SEAM_FIELDS = ('F1_aurio_start_ms', 'F2_iounit_post_ms', 'F3_iounit_post_vs_start_return_ms', 'F4_first_callback_vs_start_return_ms', 'F5_iounit_posts_in_seam', 'F6_order_signature')
def seam_fields(aud, rs):
    """FROZEN derived fields (protocol §4, predeclared before any outcome is read). All times are ms relative to the journal's
    start_begin, via the two synchronous anchors; None = the line/event is absent at this level for this sample."""
    h = [e for e in aud if name(e) == 'VoiceKernelHarness']
    act = [e for e in h if 'Activated session' in (e.get('eventMessage') or '')]
    if not act: return {'seam': 'UNREADABLE: no Activated session line'}
    pid = act[-1]['processID']; hp = [e for e in h if e['processID'] == pid]
    mono = lambda ev, **kw: next((r['timeMonotonicMs'] for r in rs if r['event'] == ev and all((r.get('evidence') or {}).get(k) == v for k, v in kw.items())), None)
    sb, sr, fc = mono('graph_start_trace', step='start_begin'), mono('graph_start_trace', step='start_return'), mono('first_input_callback')
    sa = mono('session_activated')
    la = next((e for e in hp if e.get('subsystem') == 'com.apple.coreaudio' and 'Activated session 0x' in (e.get('eventMessage') or '')), None)
    lb = next((e for e in hp if e.get('subsystem') == 'com.apple.avfaudio' and re.search(r'AVAudioEngine\.mm.*start, was running', e.get('eventMessage') or '')), None)
    if not (sa and sb and la and lb): return {'seam': 'UNREADABLE: synchronous anchors incomplete'}
    off = ((wall(la['timestamp']) - sa / 1000.0) + (wall(lb['timestamp']) - sb / 1000.0)) / 2
    rel = lambda e: (wall(e['timestamp']) - (sb / 1000.0 + off)) * 1000.0
    lo, hi = sb / 1000.0 + off - 0.05, (max(sr or sb, fc or sb)) / 1000.0 + off + 0.5
    seam = [e for e in hp if lo <= wall(e['timestamp']) <= hi and (e.get('subsystem') in ('com.apple.coreaudio', 'com.apple.avfaudio', 'com.apple.audio.caulk') or 'AURemoteIO' in (e.get('eventMessage') or ''))]
    aurio = next((e for e in seam if 'Starting AURemoteIO' in (e.get('eventMessage') or '') and rel(e) >= -1), None)
    posts = [e for e in seam if 'iounit configuration changed > posting notification' in (e.get('eventMessage') or '') and rel(e) >= -1]
    f = {'F1_aurio_start_ms': round(rel(aurio)) if aurio else None,
         'F2_iounit_post_ms': round(rel(posts[0])) if posts else None,
         'F3_iounit_post_vs_start_return_ms': (round(rel(posts[0]) - (sr - sb)) if (posts and sr) else None),
         'F4_first_callback_vs_start_return_ms': ((fc - sr) if (fc and sr) else None),
         'F5_iounit_posts_in_seam': len(posts)}
    ev = [('start_begin', 0.0)] + ([('aurio', rel(aurio))] if aurio else []) + ([('iounit_post', rel(posts[0]))] if posts else []) + ([('start_return', float(sr - sb))] if sr else []) + ([('callback', float(fc - sb))] if fc else [])
    f['F6_order_signature'] = '<'.join(k for k, _ in sorted(ev, key=lambda kv: kv[1]))
    f['seam'] = 'READ'; f['seam_transcript'] = [f"{e['timestamp'][11:23]} {rel(e):+7.1f} ms {e.get('subsystem','')} {(e.get('eventMessage') or '').strip()[:160]}" for e in seam]
    f['anchor_agreement_ms'] = round(abs((wall(la['timestamp']) - sa / 1000.0) - (wall(lb['timestamp']) - sb / 1000.0)) * 1000)
    return f
if __name__ == '__main__':
    A, Jf = sys.argv[1:3]
    aud = [json.loads(l) for l in open(A) if l.strip()]
    rs = [json.loads(l) for l in open(Jf) if l.strip()]
    import hashlib
    print(f"## inputs: {A} sha256 {hashlib.sha256(open(A,'rb').read()).hexdigest()} · {Jf} sha256 {hashlib.sha256(open(Jf,'rb').read()).hexdigest()}")
    align(aud, rs)
