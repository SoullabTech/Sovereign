#!/usr/bin/env python3
"""KERNEL-00 journal ledger — mechanical classifier for DRIVER-01 (and any K00 JSONL).

Closed vocabulary (founder, 2026-09-12):
  gen-1 listen · failure then recovery · failure then degradation · other observed shape
plus two NON-audio rows that never enter the VoiceKernel distribution:
  DRIVER/INFRASTRUCTURE FAILURE  (harness never launched / never entered / no valid journal)
  SUBJECT-MISMATCH               (journal is not from the P5-B0 13-step subject)

`other observed shape` is only assigned when the harness launched, entered the conversation,
and produced a valid subject journal whose physiology does not fit the first three classes.

Usage: k00-ledger.py [--stratum LABEL] [--index N] [--mode I|L] [--w4] [--subject p5b0|phase-a] FILE...
Prints one Markdown table row per file (and a header with --header). Changes nothing.
"""
import argparse, hashlib, json, os, sys

SUBJECTS = {'p5b0': 13, 'phase-a': 14}   # gen-1 trace step count per known subject; P5-B0 has no input_format_before_vp

def load(path):
    rows = []
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''):
            h.update(chunk)
    return h.hexdigest()

def classify(rows, w4=False, subject='p5b0'):
    expected = SUBJECTS[subject]
    ev = {}
    session = rows[0].get('session', '?') if rows else '?'
    enter = [r for r in rows if r['event'] == 'command' and r['cause'] == 'enterConversation']
    if not rows or not enter:
        return 'DRIVER/INFRASTRUCTURE FAILURE', 'no enterConversation in journal (harness never entered)', ev, session
    t0 = enter[0]['timeMonotonicMs']
    steps1 = [r['evidence']['step'] for r in rows if r['event'] == 'graph_start_trace' and r['evidence'].get('generation') == '1']
    if len(steps1) != expected or (subject == 'p5b0' and 'input_format_before_vp' in steps1) or (subject == 'phase-a' and 'input_format_before_vp' not in steps1):
        return 'SUBJECT-MISMATCH', f'gen-1 trace has {len(steps1)} steps; pre-VP read present={"input_format_before_vp" in steps1}', ev, session
    cold = rows[0]['event'] == 'app_lifecycle' and rows[0]['cause'] == 'didBecomeActive' and rows[0]['generation'] == 0
    ev['cold'] = cold
    ir = [r['evidence']['engineRunning'] for r in rows if r['event'] == 'graph_start_trace' and r['evidence']['step'] == 'is_running_immediate' and r['evidence'].get('generation') == '1']
    gs = [r['evidence']['engineRunning'] for r in rows if r['event'] == 'graph_started' and r['generation'] == 1]
    ev['isRunningImmediate'] = ir[0] if ir else '-'
    ev['graphStartedRunning'] = gs[0] if gs else '-'
    fc = [r['evidence']['msSinceStartReturn'] for r in rows if r['event'] == 'first_input_callback' and r['generation'] == 1]
    ev['firstCallbackMs'] = fc[0] if fc else '-'
    listens = [r for r in rows if r['event'] == 'floor_transition' and r['to'] == 'listening']
    recov = [r for r in rows if r['event'] == 'recovery_requested']
    degraded = any(r.get('to') == 'degraded' for r in rows if r['event'] == 'floor_transition')
    gens = sorted({r['generation'] for r in rows})
    ev['generations'] = gens[-1] if gens else 0
    ev['holdS'] = round((rows[-1]['timeMonotonicMs'] - t0) / 1000.0, 1)
    interrupted = any(r['event'] == 'interruption_began' for r in rows)
    leave = [r for r in rows if r['event'] == 'command' and r['cause'] == 'leaveConversation']
    if leave:
        ev['enterToLeaveMs'] = leave[0]['timeMonotonicMs'] - t0
        rel = [r for r in rows if r['event'] == 'session_released']
        if rel:
            after = [r['event'] for r in rows if r['seq'] > rel[0]['seq'] and not (r['event'] == 'floor_transition' and r.get('causeSeq') == leave[0]['seq'])]
            ev['afterRelease'] = after
    if listens:
        first = listens[0]
        first_rec_seq = recov[0]['seq'] if recov else None
        if first['generation'] == 1 and (first_rec_seq is None or first_rec_seq > first['seq']):
            ev['listeningMs'] = first['timeMonotonicMs'] - t0
            cls, why = 'gen-1 listen', ''
            if interrupted: why = 'unplanned interruption later in session (recorded; gen-1 class unaffected)'
            return cls, why, ev, session
        ev['listeningMs'] = first['timeMonotonicMs'] - t0
        return 'failure then recovery', f'listening first reached in generation {first["generation"]}', ev, session
    if degraded:
        return 'failure then degradation', 'floor reached degraded; no listening', ev, session
    return 'other observed shape', f'no listening and no degraded by end of journal (hold {ev["holdS"]} s; last floor unknown)', ev, session

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='+')
    ap.add_argument('--stratum', default='UNLABELLED')
    ap.add_argument('--index', default='')
    ap.add_argument('--mode', default='')
    ap.add_argument('--w4', action='store_true')
    ap.add_argument('--header', action='store_true')
    ap.add_argument('--subject', default='p5b0', choices=sorted(SUBJECTS))
    a = ap.parse_args()
    if a.header:
        print('| Stratum | # | Mode | Session | Records | SHA-256 | Class | Evidence |')
        print('|---|---|---|---|---|---|---|---|')
    for path in a.files:
        try:
            rows = load(path)
        except Exception as e:
            print(f'| {a.stratum} | {a.index} | {a.mode} | ? | 0 | {sha256(path) if os.path.exists(path) else "-"} | DRIVER/INFRASTRUCTURE FAILURE | unreadable journal: {e} |')
            continue
        cls, why, ev, session = classify(rows, a.w4, a.subject)
        if a.w4 and 'enterToLeaveMs' in ev:
            ev['w4Qualified'] = ev['enterToLeaveMs'] <= 2000
        evs = ' · '.join(f'{k}={v}' for k, v in ev.items())
        if why: evs = (why + ' · ' + evs) if evs else why
        print(f'| {a.stratum} | {a.index} | {a.mode} | `{session}` (`{os.path.basename(path)}`) | {len(rows)} | `{sha256(path)}` | **{cls}** | {evs} |')

if __name__ == '__main__':
    main()
