#!/usr/bin/env python3
"""k00-source-ledger.py — SOURCE-ID-02 evidence-only reader (founder ruling 2026-09-15; design §10.B as ruled §9/§11).

Usage: k00-source-ledger.py [--stratum LABEL] [--index N] [--subject S] FILE...
       k00-source-ledger.py --header
       k00-source-ledger.py --selftest

Reads ONE journal's `input_source_sample` records (SID subject) beside their `input_health_sample` twins and emits
witness rows under the ratified source-identification law. It is the THIRD reader: the entry classifier
(k00-ledger.py) and the output reader (k00-output-ledger.py) are byte-frozen and never consulted here. Nothing in
this file is constitutional; every threshold is a witness criterion. A journal without source evidence (every
non-SID subject, every historical population) reads UNMEASURED-SRC: no_source_evidence — never PASS, never FAIL.

Vocabulary (closed):
  SOURCE-VALIDITY  VALID | UNMEASURED-SRC (geometry · no_source_evidence · stimulus_not_visible (V1) · gate_not_seen (V2) · no_full_rendering_window)
  SOURCE-WINDOW    NEAR-END-SURVIVES | NEAR-END-SUPPRESSED | INDETERMINATE-SRC: between|floor|signature_absent|own_modulated|frameReset
                   (+ OWN-PLAYBACK-RESIDUAL-PRESENT as a descriptive flag on every window)
  SOURCE-ROW       NEAR-END SURVIVES | NEAR-END SUPPRESSED | CHARACTERIZE-SRC | UNMEASURED-SRC

Law (magnitude domain; 10× = 20 dB, 100× = 40 dB), per invocation, self-calibrated:
  baseline window = source sample whose whole span precedes the first stream_scheduled, twin inputFlow healthy, ≥ MIN_FRAMES frames
  B997/B700/B1200 = medians over baseline windows; C_base = max(B700, B1200)
  V1: ≥ 2 baseline windows with e997Mean ≥ VIS × max(e700Mean, e1200Mean)  ∧  B997 ≥ VIS × C_base
  V2: median baseline m2_997 ≥ M2
  full rendering window = source sample whose span lies inside one scheduled stream
  Lk  = A440·e440Max + A880·e880Max + A1320·e1320Max + A1760·e1760Max + TAIL·e880Max      (amplitude coefficients, pinned for 48 kHz / 1920-sample Hann)
  C_w = max(e700Mean, e1200Mean); F_w = max(C_base, C_w, Lk)
  NEAR-END-SURVIVES   iff e997Mean ≥ SURV·B997 ∧ e997Mean ≥ NOISE·F_w ∧ m2_997 ≥ M2 ∧ m2_440 < M2 ∧ frameReset == 0
  NEAR-END-SUPPRESSED iff e997Mean < SUPP·B997 ∧ callbacks ≥ CB_MIN ∧ ioRunning true
  INDETERMINATE-SRC   otherwise, with the FIRST applicable reason: frameReset · between · floor · signature_absent · own_modulated
  OWN-PLAYBACK-RESIDUAL-PRESENT iff e440Mean ≥ NOISE × max(C_base, C_w)   (descriptive; never part of a verdict)
"""
import argparse, json, statistics, sys

GEOMETRY = {'rate': 48000.0, 'frameFrames': 1920}          # the geometry the coefficients below were computed for (design §10.B)
A440, A880, A1320, A1760, TAIL = 2.16e-5, 2.77e-3, 4.00e-5, 1.12e-5, 2.82e-6
VIS, SURV, SUPP, NOISE, M2, CB_MIN, MIN_FRAMES = 10.0, 0.1, 0.01, 10.0, 0.9, 90, 20
BINS = [440, 700, 880, 997, 1200, 1320, 1760]

def _f(x):
    try: return float(x)
    except (TypeError, ValueError): return None

def load(path):
    return [json.loads(l) for l in open(path) if l.strip()]

def windows(rows):
    """Pair every input_source_sample with its input_health_sample twin (same generation + windowMs, at most 3 seqs earlier)."""
    out = []
    for i, r in enumerate(rows):
        if r.get('event') != 'input_source_sample': continue
        twin = None
        for j in range(i - 1, max(-1, i - 4), -1):
            h = rows[j]
            if h.get('event') == 'input_health_sample' and h.get('generation') == r.get('generation') and h['evidence'].get('windowMs') == r['evidence'].get('windowMs'):
                twin = h; break
        w = int(_f(r['evidence'].get('windowMs')) or 0)
        out.append({'t1': r['timeMonotonicMs'], 't0': r['timeMonotonicMs'] - w, 'src': r['evidence'], 'health': (twin or {}).get('evidence', {}), 'gen': r.get('generation')})
    return out

def streams(rows):
    s = []
    for r in rows:
        if r.get('event') == 'stream_scheduled': s.append([r['timeMonotonicMs'], None, r.get('to') or r.get('evidence', {}).get('stream')])
        elif r.get('event') in ('stream_cancelled', 'stream_complete'):
            for x in s:
                if x[1] is None: x[1] = r['timeMonotonicMs']; break
    return s

def read(path):
    rows = load(path)
    session = rows[0].get('session', '-') if rows else '-'
    ws = windows(rows); st = streams(rows)
    if not ws: return session, ('UNMEASURED-SRC', 'no_source_evidence'), [], {}
    geo = {'rate': _f(ws[0]['src'].get('analysisRateHz')), 'frameFrames': _f(ws[0]['src'].get('frameFrames'))}
    if geo['rate'] != GEOMETRY['rate'] or geo['frameFrames'] != GEOMETRY['frameFrames']:
        return session, ('UNMEASURED-SRC', f"geometry {geo['rate']}/{geo['frameFrames']} ≠ pinned {GEOMETRY['rate']}/{GEOMETRY['frameFrames']}"), [], {}
    first = st[0][0] if st else None
    base = [w for w in ws if (first is None or w['t1'] <= first) and w['health'].get('inputFlow') == 'healthy' and (_f(w['src'].get('frames')) or 0) >= MIN_FRAMES]
    def med(key): 
        v = [_f(w['src'].get(key)) for w in base]; v = [x for x in v if x is not None]
        return statistics.median(v) if v else None
    B997, B700, B1200, Bm2 = med('e997Mean'), med('e700Mean'), med('e1200Mean'), med('m2_997')
    cal = {'baselineWindows': len(base), 'B997': B997, 'C_base': max(B700 or 0, B1200 or 0) if base else None, 'Bm2': Bm2}
    vis = [w for w in base if (_f(w['src'].get('e997Mean')) or 0) >= VIS * max(_f(w['src'].get('e700Mean')) or 0, _f(w['src'].get('e1200Mean')) or 0)]
    if len(vis) < 2 or B997 is None or B997 < VIS * cal['C_base']:
        return session, ('UNMEASURED-SRC', f"stimulus_not_visible (V1: {len(vis)} visible baseline windows; B997={B997}; C_base={cal['C_base']})"), [], cal
    if Bm2 is None or Bm2 < M2:
        return session, ('UNMEASURED-SRC', f"gate_not_seen (V2: baseline median m2_997={Bm2})"), [], cal
    full = []
    for w in ws:
        for k, s in enumerate(st):
            if s[1] is not None and s[0] <= w['t0'] and w['t1'] <= s[1]:
                full.append((w, k + 1, s[2] or ''))
    if not full:
        return session, ('UNMEASURED-SRC', 'no_full_rendering_window'), [], cal
    verdicts = []
    for w, k, sid in full:
        e = w['src']; h = w['health']
        g = lambda key: _f(e.get(key)) or 0.0
        Lk = A440 * g('e440Max') + A880 * g('e880Max') + A1320 * g('e1320Max') + A1760 * g('e1760Max') + TAIL * g('e880Max')
        Cw = max(g('e700Mean'), g('e1200Mean')); Fw = max(cal['C_base'], Cw, Lk)
        e997, m2, m2own = g('e997Mean'), _f(e.get('m2_997')), _f(e.get('m2_440'))
        reset = int(g('frameReset')); cb = int(_f(h.get('callbacks')) or 0); io = h.get('ioRunning') == 'true'
        residual = g('e440Mean') >= NOISE * max(cal['C_base'], Cw)
        if e997 >= SURV * B997 and e997 >= NOISE * Fw and (m2 or 0) >= M2 and (m2own is None or m2own < M2) and reset == 0:
            v = 'NEAR-END-SURVIVES'
        elif e997 < SUPP * B997 and cb >= CB_MIN and io:
            v = 'NEAR-END-SUPPRESSED'
        elif reset > 0: v = 'INDETERMINATE-SRC: frameReset'
        elif e997 < SURV * B997: v = 'INDETERMINATE-SRC: between' if e997 >= SUPP * B997 else 'INDETERMINATE-SRC: floor'
        elif e997 < NOISE * Fw: v = 'INDETERMINATE-SRC: floor'
        elif (m2 or 0) < M2: v = 'INDETERMINATE-SRC: signature_absent'
        else: v = 'INDETERMINATE-SRC: own_modulated'
        verdicts.append({'t': w['t1'], 'stream': k, 'streamId': sid, 'verdict': v, 'e997': e997, 'B997': B997, 'Fw': Fw, 'Lk': Lk, 'Cw': Cw,
                         'm2_997': m2, 'm2_440': m2own, 'e440': g('e440Mean'), 'residual': residual, 'callbacks': cb, 'ioRunning': io, 'reset': reset})
    vs = [x['verdict'] for x in verdicts]
    if all(v == 'NEAR-END-SURVIVES' for v in vs): row = 'NEAR-END SURVIVES'
    elif all(v == 'NEAR-END-SUPPRESSED' for v in vs): row = 'NEAR-END SUPPRESSED'
    else: row = 'CHARACTERIZE-SRC'
    return session, ('VALID', row), verdicts, cal

def fmt(x):
    return '-' if x is None else (f"{x:.3e}" if isinstance(x, float) and (abs(x) < 1e-2 or abs(x) >= 1e4) else (f"{x:.3f}" if isinstance(x, float) else str(x)))

def emit(stratum, index, subject, path):
    session, (validity, row), verdicts, cal = read(path)
    lines = []
    calev = f"baselineWindows={cal.get('baselineWindows', 0)} · B997={fmt(cal.get('B997'))} · C_base={fmt(cal.get('C_base'))} · baseline m2_997={fmt(cal.get('Bm2'))}"
    if validity != 'VALID':
        lines.append(f"| {stratum} | {index} | SOURCE-VALIDITY `{session}` | **UNMEASURED-SRC** | {row} · {calev} |")
        lines.append(f"| {stratum} | {index} | SOURCE-ROW `{session}` | **UNMEASURED-SRC** | subject={subject} · no window read |")
        return '\n'.join(lines)
    lines.append(f"| {stratum} | {index} | SOURCE-VALIDITY `{session}` | **VALID** | {calev} |")
    for v in verdicts:
        lines.append(f"| {stratum} | {index} | SOURCE-WINDOW `{session}` s{v['stream']} @{v['t']} | **{v['verdict']}** | "
                     f"e997Mean={fmt(v['e997'])} (B997 {fmt(v['B997'])}) · F_w={fmt(v['Fw'])} (C_w {fmt(v['Cw'])} · Lk {fmt(v['Lk'])}) · m2_997={fmt(v['m2_997'])} · m2_440={fmt(v['m2_440'])} · "
                     f"e440Mean={fmt(v['e440'])} · own-playback residual {'PRESENT' if v['residual'] else 'absent'} · callbacks={v['callbacks']} · ioRunning={str(v['ioRunning']).lower()} · frameReset={v['reset']} |")
    tally = {}
    for v in verdicts: tally[v['verdict'].split(':')[0]] = tally.get(v['verdict'].split(':')[0], 0) + 1
    lines.append(f"| {stratum} | {index} | SOURCE-ROW `{session}` | **{row}** | subject={subject} · fullWindows={len(verdicts)} · " + ' · '.join(f"{k}={n}" for k, n in tally.items()) + " |")
    return '\n'.join(lines)

HEADER = "| Stratum | # | Row | Verdict | Evidence |\n|---|---|---|---|---|"

# ---------------------------------------------------------------- self-test (synthetic journals, every path)
def _synth(baseline, render, rate=48000.0, frameFrames=1920, healthy=True, cancelled_first=True, streams=True):
    """baseline/render: lists of dicts overriding per-window source evidence; a window = 1000 ms; stream 2 (3 s) holds windows 2..4 of `render`."""
    rows = []; seq = [0]; t = [1000]
    def rec(event, ev=None, gen=1, **kw):
        seq[0] += 1; r = {'seq': seq[0], 'session': 'K00-selftest', 'generation': gen, 'component': 'x', 'event': event, 'timeMonotonicMs': t[0], 'evidence': ev or {}}; r.update(kw); rows.append(r); return r
    def win(over):
        t[0] += 1000
        rec('input_health_sample', {'windowMs': '1000', 'callbacks': str(over.get('callbacks', 100)), 'inputFlow': 'healthy' if healthy else 'unknown', 'ioRunning': over.get('ioRunning', 'true')})
        ev = {'windowMs': '1000', 'frames': '25', 'frameReset': '0', 'frameFrames': str(frameFrames), 'analysisRateHz': str(rate), 'frameMs': '40', 'binsHz': ','.join(map(str, BINS))}
        base = {'e440': 1e-6, 'e700': 3e-5, 'e880': 1e-6, 'e997': 7e-4, 'e1200': 3e-5, 'e1320': 1e-6, 'e1760': 1e-6, 'm2_997': 1.25, 'm2_440': 0.1}
        base.update({k: v for k, v in over.items() if k in base})
        for b in BINS: ev[f'e{b}Mean'] = str(base[f'e{b}']); ev[f'e{b}Max'] = str(base[f'e{b}'] * 1.2); ev[f'e{b}Min'] = str(base[f'e{b}'] * 0.8)
        ev['m2_997'] = str(base['m2_997']); ev['m2_440'] = str(base['m2_440']); ev['frameReset'] = str(over.get('frameReset', 0))
        rec('input_source_sample', ev)
    rec('app_lifecycle', gen=0, cause='didBecomeActive'); rec('graph_started', {'ioRunning': 'true'})
    for o in baseline: win(o)
    if streams:
        rec('stream_scheduled', {'framesScheduled': '144000'}, to='s1'); t[0] += 1000
        if cancelled_first: rec('stream_cancelled', {}); 
        else: t[0] += 2000; rec('stream_complete', {})
        rec('stream_scheduled', {'framesScheduled': '144000'}, to='s2')   # 3 s → up to two full windows inside
        for o in render: win(o)
        rec('stream_complete', {})
    return rows

def selftest():
    import tempfile, os
    cases = []
    def case(name, rows, want_validity, want_row, want_windows=None):
        with tempfile.NamedTemporaryFile('w', suffix='.jsonl', delete=False) as f:
            for r in rows: f.write(json.dumps(r) + '\n')
        session, (validity, row), verdicts, cal = read(f.name); os.unlink(f.name)
        ok = validity == want_validity and (row == want_row or (want_validity != 'VALID' and row.startswith(want_row)))
        if want_windows is not None: ok = ok and [v['verdict'] for v in verdicts] == want_windows
        cases.append((name, ok, validity, row, [v['verdict'] for v in verdicts]))
    B = [{} for _ in range(5)]
    # stream 2 windows: the render windows whose span lies inside stream 2 are windows with t in (start, start+3000]; with win() at +1000 each, windows 1..2 of `render` are full (3 s stream, first window starts at the schedule instant)
    case('01 no source evidence (any non-SID journal)', [r for r in _synth(B, [{}, {}]) if r['event'] != 'input_source_sample'], 'UNMEASURED-SRC', 'no_source_evidence')
    case('02 geometry ≠ pinned', _synth(B, [{}, {}], rate=44100.0), 'UNMEASURED-SRC', 'geometry')
    case('03 V1 stimulus not visible', _synth([{'e997': 5e-5} for _ in range(5)], [{}, {}]), 'UNMEASURED-SRC', 'stimulus_not_visible')
    case('04 V1 needs ≥2 visible baseline windows', _synth([{'e997': 5e-5}] * 4 + [{}], [{}, {}]), 'UNMEASURED-SRC', 'stimulus_not_visible')
    case('05 V2 gate not seen at baseline', _synth([{'m2_997': 0.3} for _ in range(5)], [{}, {}]), 'UNMEASURED-SRC', 'gate_not_seen')
    case('06 baseline must be healthy', _synth(B, [{}, {}], healthy=False), 'UNMEASURED-SRC', 'stimulus_not_visible')
    case('07 no full rendering window', _synth(B, [], streams=False), 'UNMEASURED-SRC', 'no_full_rendering_window')
    case('08 NEAR-END SURVIVES (both windows)', _synth(B, [{}, {}]), 'VALID', 'NEAR-END SURVIVES', ['NEAR-END-SURVIVES', 'NEAR-END-SURVIVES'])
    case('09 NEAR-END SUPPRESSED (both windows, capture intact)', _synth(B, [{'e997': 1e-6, 'm2_997': 0.0}, {'e997': 2e-6, 'm2_997': 0.0}]), 'VALID', 'NEAR-END SUPPRESSED', ['NEAR-END-SUPPRESSED', 'NEAR-END-SUPPRESSED'])
    case('10 suppressed amplitude but capture NOT intact → not SUPPRESSED (floor)', _synth(B, [{'e997': 1e-6, 'callbacks': 40}, {'e997': 1e-6, 'ioRunning': 'false'}]), 'VALID', 'CHARACTERIZE-SRC', ['INDETERMINATE-SRC: floor', 'INDETERMINATE-SRC: floor'])
    case('11 mixed → CHARACTERIZE-SRC', _synth(B, [{}, {'e997': 1e-6, 'm2_997': 0.0}]), 'VALID', 'CHARACTERIZE-SRC', ['NEAR-END-SURVIVES', 'NEAR-END-SUPPRESSED'])
    case('12 between (0.01–0.1 × B997)', _synth(B, [{'e997': 3e-5}, {'e997': 3e-5}]), 'VALID', 'CHARACTERIZE-SRC', ['INDETERMINATE-SRC: between', 'INDETERMINATE-SRC: between'])
    case('13 floor: above 0.1×B997 but under 10× the window noise', _synth(B, [{'e997': 1e-4, 'e700': 5e-5, 'e1200': 5e-5}, {'e997': 1e-4, 'e700': 5e-5, 'e1200': 5e-5}]), 'VALID', 'CHARACTERIZE-SRC', ['INDETERMINATE-SRC: floor', 'INDETERMINATE-SRC: floor'])
    case('14 floor by LEAKAGE: an 880 Hz harmonic large enough that Lk dominates F_w', _synth(B, [{'e880': 0.05}, {'e880': 0.05}]), 'VALID', 'CHARACTERIZE-SRC', ['INDETERMINATE-SRC: floor', 'INDETERMINATE-SRC: floor'])
    case('15 signature_absent: 997 Hz energy present, not gated', _synth(B, [{'m2_997': 0.4}, {'m2_997': 0.4}]), 'VALID', 'CHARACTERIZE-SRC', ['INDETERMINATE-SRC: signature_absent', 'INDETERMINATE-SRC: signature_absent'])
    case('16 own_modulated veto: gated 997 but the own-tone bin carries the same 2 Hz', _synth(B, [{'m2_440': 1.1, 'e440': 1e-3}, {'m2_440': 0.95, 'e440': 1e-3}]), 'VALID', 'CHARACTERIZE-SRC', ['INDETERMINATE-SRC: own_modulated', 'INDETERMINATE-SRC: own_modulated'])
    case('17 frameReset in a window is never SURVIVES', _synth(B, [{'frameReset': 1}, {}]), 'VALID', 'CHARACTERIZE-SRC', ['INDETERMINATE-SRC: frameReset', 'NEAR-END-SURVIVES'])
    case('18 own-playback residual is descriptive: SURVIVES stands with a strong 440 Hz residual', _synth(B, [{'e440': 2e-3}, {'e440': 2e-3}]), 'VALID', 'NEAR-END SURVIVES')
    rows18 = _synth(B, [{'e440': 2e-3}, {'e440': 2e-3}])
    with tempfile.NamedTemporaryFile('w', suffix='.jsonl', delete=False) as f:
        for r in rows18: f.write(json.dumps(r) + '\n')
    out = emit('X', '1', 'vpio-02-sid', f.name); os.unlink(f.name)
    cases.append(('19 residual flag rendered PRESENT on the window rows', out.count('own-playback residual PRESENT') == 2, '-', '-', []))
    cases.append(('20 rows never name PASS/FAIL', 'PASS' not in out and 'FAIL' not in out, '-', '-', []))
    ok = sum(1 for c in cases if c[1])
    for c in cases: print(f"{'ok ' if c[1] else 'FAIL'} {c[0]} → {c[2]} / {c[3]} {c[4] if c[4] else ''}")
    print(f"selftest: {ok}/{len(cases)}")
    return ok == len(cases)

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--stratum', default='-'); ap.add_argument('--index', default='-'); ap.add_argument('--subject', default='-')
    ap.add_argument('--header', action='store_true'); ap.add_argument('--selftest', action='store_true')
    ap.add_argument('files', nargs='*')
    a = ap.parse_args()
    if a.selftest: sys.exit(0 if selftest() else 1)
    if a.header: print(HEADER); sys.exit(0)
    for f in a.files: print(emit(a.stratum, a.index, a.subject, f))
