#!/usr/bin/env python3
"""k00-output-ledger.py — K00-05 / K00-06 evidence-only reader (founder ruling 2026-09-14, Option C).

Usage: k00-output-ledger.py [--stratum LABEL] [--index N] [--subject S] FILE...
       k00-output-ledger.py --header
       k00-output-ledger.py --selftest

Reads a COMPLETED kernel00-*.jsonl journal and emits, per journal, four markdown rows:
  K00-05-CANCEL · K00-05-COMPLETE · K00-06 · COUPLING
It never steers an invocation, never changes entry classification (k00-ledger.py is untouched and runs
separately on the same journal), never terminates anything, never writes a journal, and never
reinterprets historical rows: a journal without any stream_scheduled yields no PASS and no FAIL.

Verdict vocabulary (closed):
  K00-05 rows : PASS-05 · FAIL-05 · NOT-A-CANCEL-ROW · NO-COMPLETION-ROW · NON-EVIDENCE · INCOMPLETE-05 · NO-OUTPUT
  K00-06 row  : PASS-06 · FAIL-06 · CHARACTERIZE-06 · UNMEASURED-06
  any row     : INVALID (synthetic / faulted) · EN-ROW (entry never reached listening)
  COUPLING    : DESCRIPTIVE (never PASS/FAIL)

Ratified number used: cancel-to-last-non-silent-frame ≤ 100 ms (stream_cancel_measured.cancelToSilenceMs).
Witness criterion used (not constitutional): callback continuity ≥ 0.90 × baselineRate on FULL rendering windows.
"""
import argparse, json, statistics, sys

CANCEL_WINDOW_MS = 100          # ratified K00-05 ceiling (HealthThresholds.cancelWindowMs)
GAP_FRACTION = 0.90             # founder ruling 2026-09-14 §4 — witness criterion for callback continuity
POST_RENDER_DEAD_MS = 2000      # an input_dead verdict "during / immediately after" rendering
OUTPUT_FAMILY_TOLERANCE_MS = 250  # an output_render_sample this close to an input window counts as the same tick
COUPLING_KEYS = ('rmsMean', 'rmsMax', 'peakMax')


def load(path):
    with open(path, encoding='utf-8') as fh:   # read only
        return [json.loads(l) for l in fh if l.strip()]


def ev(r): return r.get('evidence') or {}
def t(r): return int(r['timeMonotonicMs'])
def fnum(x):
    try: return float(x)
    except (TypeError, ValueError): return None
def inum(x):
    try: return int(float(x))
    except (TypeError, ValueError): return None
def median(xs): return statistics.median(xs) if xs else None
def fmt(x): return '-' if x is None else (f'{x:.4g}' if isinstance(x, float) else str(x))


def read(rows):
    """Return dict(k05_cancel, k05_complete, k06, coupling) each = (verdict, evidence-string)."""
    faulted = any(any(v == 'true' for v in ev(r).values()) for r in rows if r['event'] == 'faults_set')
    synthetic = any(ev(r).get('synthetic') == 'true' for r in rows if r['event'] in ('input_health_sample', 'output_render_sample'))
    if faulted or synthetic:
        why = 'faults_set true' if faulted else 'synthetic sample present'
        inv = ('INVALID', f'{why} — no K00-05/06 evidence may be taken from a faulted or synthetic row')
        return {'k05_cancel': inv, 'k05_complete': inv, 'k06': inv, 'coupling': inv}
    listening = any(r['event'] == 'floor_transition' and r.get('to') == 'listening' for r in rows)
    sched = [r for r in rows if r['event'] == 'stream_scheduled']
    if not sched and not listening:
        en = ('EN-ROW', 'entry never reached listening; no stream could be scheduled — not K00-05/06 evidence')
        return {'k05_cancel': en, 'k05_complete': en, 'k06': ('EN-ROW', en[1]), 'coupling': en}
    if not sched:
        no = ('NO-OUTPUT', 'listening reached but no stream_scheduled (no Play accepted) — no K00-05 evidence')
        return {'k05_cancel': no, 'k05_complete': no,
                'k06': ('UNMEASURED-06', 'no rendering interval in this journal'),
                'coupling': ('UNMEASURED-06', 'no rendering interval in this journal')}
    streams = []
    for s in sched:
        sid = s.get('to')
        end = next((r for r in rows if r['seq'] > s['seq'] and r['event'] in ('stream_cancelled', 'stream_complete', 'stream_failed') and r.get('from') == sid), None)
        streams.append({'id': sid, 'sched': s, 'end': end, 'framesScheduled': inum(ev(s).get('framesScheduled'))})
    faults = [r for r in rows if r['event'] == 'recovery_requested' and r.get('cause') in ('input_dead', 'entry_timeout')]
    def foreign_fault(t0, t1): return [r for r in faults if t0 <= t(r) <= t1]

    # ---- K00-05 cancel row -------------------------------------------------------------------------
    cancels = [r for r in rows if r['event'] == 'stream_cancelled']
    if not cancels:
        cmd = [r for r in rows if r['event'] == 'command' and r.get('cause') == 'cancel']
        k05c = ('NOT-A-CANCEL-ROW', 'command cancel present but no stream_cancelled (cancel landed after completion or was not active)' if cmd
                else 'no cancel command in the journal (Cancel active never tapped / never enabled)')
    else:
        c = cancels[0]; ce = ev(c); sid = c.get('from')
        # the cancelled handle must be a scheduled handle; a cancel naming anything else is a broken identity, never "no cancel"
        st = next((x for x in streams if x['id'] == sid), None)
        if st is None: st = {'id': sid, 'sched': min(sched, key=lambda r: r['seq']), 'end': c, 'framesScheduled': None}
        reasons, notes = [], []
        cmd = next((r for r in rows if r['event'] == 'command' and r.get('cause') == 'cancel' and r['seq'] == c.get('causeSeq')), None)
        handle_ok = cmd is not None and ev(cmd).get('stream') == sid and any(x['id'] == sid for x in streams)
        if not handle_ok: reasons.append(f'handle mismatch (scheduled {[x["id"] for x in streams]} · command {ev(cmd).get("stream") if cmd else "-"} · cancelled {sid})')
        fr, fs = inum(ce.get('framesRendered')), inum(ce.get('framesScheduled'))
        if fr is None or fs is None or not (0 < fr < fs): reasons.append(f'cancel not mid-stream (framesRendered {fr} / framesScheduled {fs})')
        m = next((r for r in rows if r['event'] == 'stream_cancel_measured' and r.get('from') == sid and r.get('causeSeq') == c['seq']), None)
        to_sil = inum(ev(m).get('cancelToSilenceMs')) if m else None
        if m is None: reasons.append('stream_cancel_measured absent for this cancel act')
        else:
            if to_sil is None or to_sil > CANCEL_WINDOW_MS: reasons.append(f'cancelToSilenceMs {to_sil} > {CANCEL_WINDOW_MS}')
            if ev(m).get('withinRatifiedWindow') != 'true': reasons.append('withinRatifiedWindow not true in the record')
        if any(r['event'] == 'stream_complete' and r.get('from') == sid and r['seq'] > c['seq'] for r in rows): reasons.append('a stream_complete followed the cancel for the same handle')
        post = [r for r in rows if r['event'] == 'output_render_sample' and r['seq'] > c['seq'] and ev(r).get('stream') == sid]
        if any((inum(ev(r).get('framesRendered')) or 0) > (fr or 0) for r in post): reasons.append('framesRendered advanced after the cancel')
        if any(ev(r).get('outputFlow') == 'rendering' for r in post): reasons.append('outputFlow still rendering after the cancel')
        if any(r['event'] == 'stream_failed' and r.get('from') == sid for r in rows): reasons.append('stream_failed on the cancelled handle')
        if any(r['event'] == 'recovery_requested' and 'output' in str(r.get('cause')) and t(st['sched']) <= t(r) <= t(c) for r in rows): reasons.append('outputStalled verdict on the stream')
        if not any(r['event'] == 'floor_transition' and r.get('to') == 'listening' and str(r.get('cause', '')).startswith('stream_cancelled:') and r['seq'] >= c['seq'] for r in rows):
            reasons.append('floor did not return to listening on stream_cancelled')
        pre = [r for r in rows if r['event'] == 'output_render_sample' and st['sched']['seq'] < r['seq'] < c['seq'] and ev(r).get('stream') == sid]
        notes.append(f'preCancelRenderSamples={len(pre)} (corroborating only)')
        notes.append(f'cancelAtMsAfterSchedule={t(c) - t(st["sched"])}')
        ff = foreign_fault(t(st['sched']), t(c) + 300)
        evs = f'handle={sid} · framesRenderedAtCancel={fr}/{fs} · cancelToSilenceMs={to_sil} · ' + ' · '.join(notes)
        if reasons: k05c = ('FAIL-05', evs + ' · ' + '; '.join(reasons))
        elif ff: k05c = ('NON-EVIDENCE', evs + f' · foreign fault during the stream ({ff[0].get("cause")}) — output evidence sound but the row is not evidence')
        else: k05c = ('PASS-05', evs)

    # ---- K00-05 completion row ---------------------------------------------------------------------
    completed = [st for st in streams if st['end'] and st['end']['event'] == 'stream_complete']
    if not completed:
        k05x = ('NO-COMPLETION-ROW', 'no stream_complete in the journal (second Play not scheduled or not completed before export)')
    else:
        st = completed[0]; sid = st['id']; c = st['end']
        reasons = []
        fr, fs = inum(ev(c).get('framesRendered')), st['framesScheduled']
        if fr is None or fs is None or fr != fs: reasons.append(f'completion frames {fr} != scheduled {fs}')
        prog = [inum(ev(r).get('framesRendered')) for r in rows if r['event'] == 'output_render_sample' and st['sched']['seq'] < r['seq'] < c['seq'] and ev(r).get('stream') == sid]
        prog = [x for x in prog if x is not None]
        progress_ok = any(0 < x for x in prog) and all(b >= a for a, b in zip(prog, prog[1:]))
        if prog and not all(b >= a for a, b in zip(prog, prog[1:])): reasons.append('render progress not monotonic')
        if any(r['event'] == 'stream_failed' and r.get('from') == sid for r in rows): reasons.append('stream_failed on the completed handle')
        if not any(r['event'] == 'floor_transition' and r.get('to') == 'listening' and str(r.get('cause', '')).startswith('stream_complete:') and r['seq'] >= c['seq'] for r in rows):
            reasons.append('floor did not return to listening on stream_complete')
        lat = t(c) - t(st['sched'])
        evs = f'handle={sid} · framesRendered={fr}/{fs} · renderSamples={len(prog)} · completionLatencyMs={lat} (descriptive, no ceiling)'
        ff = foreign_fault(t(st['sched']), t(c))
        if reasons: k05x = ('FAIL-05', evs + ' · ' + '; '.join(reasons))
        elif not progress_ok: k05x = ('INCOMPLETE-05', evs + ' · no render-progress sample observed inside the stream (not FAIL, not PASS)')
        elif ff: k05x = ('NON-EVIDENCE', evs + f' · foreign fault during the stream ({ff[0].get("cause")})')
        else: k05x = ('PASS-05', evs)

    # ---- K00-06 row ------------------------------------------------------------------------------------
    intervals = []
    last_t = t(rows[-1])
    for st in streams:
        t0 = t(st['sched']); t1 = t(st['end']) if st['end'] else last_t
        intervals.append((t0, t1, st['end'] is not None))
    first_sched = min(i[0] for i in intervals)
    samples = [r for r in rows if r['event'] == 'input_health_sample']
    outs = [r for r in rows if r['event'] == 'output_render_sample']
    def window(r):
        w = inum(ev(r).get('windowMs')) or 0
        return (t(r) - w, t(r), w)
    baseline = [r for r in samples if t(r) <= first_sched and (inum(ev(r).get('callbacks')) or 0) > 0 and inum(ev(r).get('digitalZero')) == 0 and ev(r).get('inputFlow') == 'healthy']
    full = [r for r in samples if any(i0 <= window(r)[0] and window(r)[1] <= i1 for i0, i1, _ in intervals)]
    def rate(r):
        a, b, w = window(r); cb = inum(ev(r).get('callbacks')) or 0
        return cb * 1000.0 / w if w else 0.0
    if len(baseline) < 2 or len(full) < 2:
        k06 = ('UNMEASURED-06', f'baselineWindows={len(baseline)} (need ≥2 healthy pre-output) · fullRenderingWindows={len(full)} (need ≥2)')
        coupling = ('UNMEASURED-06', k06[1])
    else:
        base_rate = median([rate(r) for r in baseline])
        fails, chars = [], []
        for r in full:
            e = ev(r); cb = inum(e.get('callbacks')) or 0; dz = inum(e.get('digitalZero')) or 0; rr = rate(r)
            if rr < GAP_FRACTION * base_rate: fails.append(f'callback gap: {rr:.1f}/s < {GAP_FRACTION:.2f}×{base_rate:.1f}/s at t={t(r)}')
            if cb > 0 and dz == cb: fails.append(f'digital-zero collapse: {dz}/{cb} at t={t(r)}')
            elif 0 < dz < cb: chars.append(f'partial digital zero {dz}/{cb} at t={t(r)}')
            if e.get('ioRunning') != 'true': fails.append(f'ioRunning={e.get("ioRunning")} at t={t(r)}')
            if not any(abs(t(o) - t(r)) <= OUTPUT_FAMILY_TOLERANCE_MS for o in outs): fails.append(f'output-health family absent beside the input window at t={t(r)}')
        for i0, i1, _ in intervals:
            for r in faults:
                if r.get('cause') == 'input_dead' and i0 <= t(r) <= i1 + POST_RENDER_DEAD_MS: fails.append(f'input_dead verdict at t={t(r)} during/after rendering [{i0},{i1}]'); break
        missing = [r for r in baseline + full if any(fnum(ev(r).get(k)) is None for k in COUPLING_KEYS)]
        if missing: fails.append(f'coupling record missing ({len(missing)} window(s) without {"/".join(COUPLING_KEYS)})')
        rates = [rate(r) for r in full]
        evs = (f'baselineRate={base_rate:.1f}/s over {len(baseline)} windows · fullRenderingWindows={len(full)} · minRate={min(rates):.1f}/s · '
               f'digitalZeroTotal={sum(inum(ev(r).get("digitalZero")) or 0 for r in full)} · openInterval={any(not c for _, _, c in intervals)}')
        if fails: k06 = ('FAIL-06', evs + ' · ' + '; '.join(fails))
        elif chars: k06 = ('CHARACTERIZE-06', evs + ' · ' + '; '.join(chars))
        else: k06 = ('PASS-06', evs)
        if missing:
            coupling = ('DESCRIPTIVE', 'not computable: coupling fields missing')
        else:
            def med(rs, k): return median([fnum(ev(r).get(k)) for r in rs])
            def mix(rs): return f'noiseFloor={sum(inum(ev(r).get("noiseFloor")) or 0 for r in rs)} signal={sum(inum(ev(r).get("signal")) or 0 for r in rs)}'
            parts = []
            for k in COUPLING_KEYS:
                b, d = med(baseline, k), med(full, k)
                parts.append(f'{k}: baseline {fmt(b)} → rendering {fmt(d)} (×{fmt(d / b) if b else "∞"})')
            route = next((ev(r).get('route') for r in full if ev(r).get('route')), '-')
            vp = next((ev(r).get('voiceProcessing') for r in rows if r['event'] == 'graph_started'), '-')
            coupling = ('DESCRIPTIVE', f'route={route} · voiceProcessing={vp} (input observed post-AEC) · ' + ' · '.join(parts) + f' · classMix baseline[{mix(baseline)}] rendering[{mix(full)}] — measurement only, no threshold')
    return {'k05_cancel': k05c, 'k05_complete': k05x, 'k06': k06, 'coupling': coupling}


HEADER = '| Stratum | # | Row | Verdict | Evidence |\n|---|---|---|---|---|'
ROWS = (('K00-05-CANCEL', 'k05_cancel'), ('K00-05-COMPLETE', 'k05_complete'), ('K00-06', 'k06'), ('COUPLING', 'coupling'))


def emit(stratum, index, subject, path):
    rows = load(path)
    session = rows[0].get('session', '-') if rows else '-'
    out = read(rows)
    lines = []
    for name, key in ROWS:
        v, e = out[key]
        lines.append(f'| {stratum} | {index} | {name} `{session}` | **{v}** | {e} |')
    return '\n'.join(lines)


# ---------------------------------------------------------------------------------------------------------
# selftest: synthetic journals pin the founder's twelve offline cases plus the nominal and three lawful non-evidence shapes
def build(*, pre_cancel_sample=True, cancel_ms=5, handle_mismatch=False, complete_frames_mismatch=False, late_completion=False,
          zero_windows=None, rate_drop=False, no_coupling=False, faulted=False, synthetic=False, entry=True, play=True,
          cancel=True, foreign_fault=False, second_play=True):
    rows = []; seq = [0]
    def rec(event, tm, gen=1, cause=None, evidence=None, **kw):
        seq[0] += 1; r = {'seq': seq[0], 'event': event, 'timeMonotonicMs': tm, 'generation': gen, 'session': 'K00-selftest', 'component': 'x', 'evidence': evidence or {}}
        if cause is not None: r['cause'] = cause
        r.update(kw); return r
    def sample(tm, cb=100, dz=0, w=1000, rms=('1.2e-05', '4e-05', '9e-05'), flow='healthy', with_out=None, ior='true'):
        e = {'windowMs': str(w), 'callbacks': str(cb), 'digitalZero': str(dz), 'noiseFloor': str(cb - dz), 'signal': '0', 'inputFlow': flow, 'ioRunning': ior, 'route': 'builtInSpeaker/builtInMic', 'synthetic': 'true' if synthetic else 'false'}
        if not no_coupling: e.update({'rmsMean': rms[0], 'rmsMax': rms[1], 'peakMax': rms[2]})
        rows.append(rec('input_health_sample', tm, cause='sample', evidence=e))
        if with_out is not None:
            sid, fr, flowo = with_out
            rows.append(rec('output_render_sample', tm, cause='sample', evidence={'stream': sid, 'framesRendered': str(fr), 'framesScheduled': '144000', 'outputFlow': flowo, 'synthetic': 'false'}))
    rows.append(rec('command', 0, gen=0, cause='enterConversation'))
    if faulted: rows.append(rec('faults_set', 1, gen=0, cause='command:setFaults', evidence={'digitalZeroInput': 'true', 'stallOutput': 'false'}))
    if not entry:
        rows.append(rec('floor_transition', 2, gen=0, cause='enterConversation', to='entering'))
        rows.append(rec('floor_transition', 2400, cause='budget_exhausted', to='degraded'))
        return rows
    rows.append(rec('graph_started', 458, cause='enterConversation', evidence={'ioRunning': 'true', 'voiceProcessing': 'true', 'inputSampleRate': '48000.0'}))
    rows.append(rec('floor_transition', 340, cause='flow_healthy', to='listening'))
    sample(1458); sample(2458)
    if not play: sample(3458); return rows
    s1 = 'S1-aaaa'; s1c = 'S1-zzzz' if handle_mismatch else s1
    rows.append(rec('command', 2500, cause='playTone', evidence={'seconds': '3.0'}))
    rows.append(rec('stream_scheduled', 2500, cause='command:playTone', evidence={'framesScheduled': '144000', 'seconds': '3.0'}, to=s1))
    rows.append(rec('floor_transition', 2500, cause=f'stream_rendering:{s1}', to='maiaSpeaking'))
    if pre_cancel_sample: sample(3458, with_out=(s1, 45984, 'rendering'))
    else: sample(3458)
    if foreign_fault: rows.append(rec('recovery_requested', 3000, cause='input_dead', evidence={'sinceMs': '2001'}))
    if cancel:
        cmd = rec('command', 3500, cause='cancel', evidence={'stream': s1c}); rows.append(cmd)
        c = rec('stream_cancelled', 3500, cause='command:cancel', causeSeq=cmd['seq'], evidence={'framesRendered': '48000', 'framesScheduled': '144000', 'cancelIssuedAtMs': '3500'}, **{'from': s1c}); rows.append(c)
        rows.append(rec('floor_transition', 3500, cause=f'stream_cancelled:{s1c}', causeSeq=c['seq'], to='listening'))
        rows.append(rec('stream_cancel_measured', 3800, cause='render_tap', causeSeq=c['seq'], evidence={'cancelIssuedAtMs': '3500', 'lastNonSilentRenderedAtMs': str(3500 + cancel_ms), 'cancelToSilenceMs': str(cancel_ms), 'withinRatifiedWindow': str(cancel_ms <= 100).lower()}, **{'from': s1c}))
    else:
        rows.append(rec('stream_complete', 5500, cause='frames_rendered', evidence={'framesRendered': '144000'}, **{'from': s1}))
        rows.append(rec('floor_transition', 5500, cause=f'stream_complete:{s1}', to='listening'))
        cmd = rec('command', 5600, cause='cancel', evidence={'stream': s1}); rows.append(cmd)   # cancel after completion: nothing follows
    sample(4458, with_out=(s1, 48000, 'idle'))
    if not second_play: sample(5458); sample(6458); return rows
    s2 = 'S2-bbbb'
    t2 = 4500
    rows.append(rec('command', t2, cause='playTone', evidence={'seconds': '3.0'}))
    rows.append(rec('stream_scheduled', t2, cause='command:playTone', evidence={'framesScheduled': '144000', 'seconds': '3.0'}, to=s2))
    rows.append(rec('floor_transition', t2, cause=f'stream_rendering:{s2}', to='maiaSpeaking'))
    zw = zero_windows or {}
    rd = 85 if rate_drop else 100
    sample(5458, with_out=(s2, 45984, 'rendering'))
    sample(6458, cb=100, dz=zw.get(6458, 0), with_out=(s2, 93984, 'rendering'))
    sample(7458, cb=rd, dz=zw.get(7458, 0), with_out=(s2, 141984, 'rendering'))
    tc = 7900 if late_completion else 7500
    rows.append(rec('stream_complete', tc, cause='frames_rendered', evidence={'framesRendered': '143000' if complete_frames_mismatch else '144000'}, **{'from': s2}))
    rows.append(rec('floor_transition', tc, cause=f'stream_complete:{s2}', to='listening'))
    sample(8458); sample(9458)
    return rows


def selftest():
    cases = [
        ('nominal: cancel 5 ms · completion · clean duplex', build(), {'k05_cancel': 'PASS-05', 'k05_complete': 'PASS-05', 'k06': 'PASS-06', 'coupling': 'DESCRIPTIVE'}),
        ('cancel with framesRendered > 0 but no pre-cancel sample → admissible', build(pre_cancel_sample=False), {'k05_cancel': 'PASS-05'}),
        ('cancel > 100 ms → FAIL-05', build(cancel_ms=140), {'k05_cancel': 'FAIL-05', 'k06': 'PASS-06'}),
        ('handle mismatch → FAIL-05', build(handle_mismatch=True), {'k05_cancel': 'FAIL-05'}),
        ('completion frame mismatch → FAIL-05', build(complete_frames_mismatch=True), {'k05_complete': 'FAIL-05', 'k05_cancel': 'PASS-05'}),
        ('completion latency > 3.15 s alone → descriptive, NOT FAIL', build(late_completion=True), {'k05_complete': 'PASS-05'}),
        ('one transient digital-zero callback → NOT collapse', build(zero_windows={6458: 1}), {'k06': 'CHARACTERIZE-06'}),
        ('partial-zero full window → CHARACTERIZE', build(zero_windows={7458: 40}), {'k06': 'CHARACTERIZE-06'}),
        ('all-zero full window → FAIL-06', build(zero_windows={7458: 100}), {'k06': 'FAIL-06', 'k05_cancel': 'PASS-05'}),
        ('callback rate < 90 % baseline → FAIL-06', build(rate_drop=True), {'k06': 'FAIL-06'}),
        ('missing coupling record → FAIL-06', build(no_coupling=True), {'k06': 'FAIL-06'}),
        ('synthetic/faulted row → INVALID', build(faulted=True), {'k05_cancel': 'INVALID', 'k05_complete': 'INVALID', 'k06': 'INVALID', 'coupling': 'INVALID'}),
        ('synthetic sample → INVALID', build(synthetic=True), {'k06': 'INVALID'}),
        ('entry not reached → EN-ROW', build(entry=False), {'k05_cancel': 'EN-ROW', 'k05_complete': 'EN-ROW', 'k06': 'EN-ROW'}),
        ('F-W1 shape (listening, no Play) → NO-OUTPUT / UNMEASURED-06, never PASS or FAIL', build(play=False), {'k05_cancel': 'NO-OUTPUT', 'k05_complete': 'NO-OUTPUT', 'k06': 'UNMEASURED-06'}),
        ('cancel after completion → NOT-A-CANCEL-ROW (K00-06 still measurable)', build(cancel=False), {'k05_cancel': 'NOT-A-CANCEL-ROW', 'k06': 'PASS-06'}),
        ('foreign input_dead during the cancelled stream → NON-EVIDENCE for K00-05, never automatic FAIL', build(foreign_fault=True), {'k05_cancel': 'NON-EVIDENCE'}),
        ('second Play absent → NO-COMPLETION-ROW · K00-06 UNMEASURED (< 2 full windows)', build(second_play=False), {'k05_complete': 'NO-COMPLETION-ROW', 'k06': 'UNMEASURED-06'}),
    ]
    met = total = 0; fails = []
    for name, rows, want in cases:
        got = read(rows)
        for k, v in want.items():
            total += 1
            if got[k][0] == v: met += 1
            else: fails.append(f'FAIL {name} · {k}: want {v} got {got[k][0]} — {got[k][1]}')
        print(f'{name}: ' + ' · '.join(f'{k}={got[k][0]}' for k in want))
        if 'late_completion' in name or 'latency' in name: print(f'  descriptive: {got["k05_complete"][1]}')
    for f in fails: print(f)
    print(f'selftest: {met}/{total} expectations met')
    return 0 if not fails else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stratum', default='-'); ap.add_argument('--index', default='-'); ap.add_argument('--subject', default='-')
    ap.add_argument('--header', action='store_true'); ap.add_argument('--selftest', action='store_true')
    ap.add_argument('files', nargs='*')
    a = ap.parse_args()
    if a.selftest: sys.exit(selftest())
    if a.header: print(HEADER); return
    for f in a.files: print(emit(a.stratum, a.index, a.subject, f))


if __name__ == '__main__':
    main()
