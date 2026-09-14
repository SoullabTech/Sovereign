#!/usr/bin/env python3
"""KERNEL-00 journal ledger — mechanical classifier for DRIVER-01 (and any K00 JSONL).

Closed vocabulary (founder, 2026-09-12):
  gen-1 listen · failure then recovery · failure then degradation · other observed shape
plus two NON-audio rows that never enter the VoiceKernel distribution:
  DRIVER/INFRASTRUCTURE FAILURE  (harness never launched / never entered / no valid journal)
  SUBJECT-MISMATCH               (journal is not from the declared subject)

`other observed shape` is only assigned when the harness launched, entered the conversation,
and produced a valid subject journal whose physiology does not fit the first three classes.

VPIO-01B (founder ruling 2026-09-14): the subject table is explicit. Three subjects, four classes,
VPIO-02B (founder ruling 2026-09-14): a fourth subject, vpio-02 (bundle .vpio02, 14-step trace with the format probe visible);
same four classes, no fifth; identity = exact 14 steps or an exact ordered proper prefix + gen-1 graph_start_refused;
a VPIO-01 trace never qualifies as VPIO-02 (or the reverse) merely because both journal ioRunning; historical rules unchanged.
no fifth VPIO outcome class. The VPIO subject's running evidence is `ioRunning`; `engineRunning`
is neither required nor synthesized for it. Historical P5-B0 / Phase-A rules are byte-for-byte
the same rules as before this change (regression-identical classification is gate-pinned).

Usage: k00-ledger.py [--stratum LABEL] [--index N] [--mode I|L] [--w4] [--subject p5b0|phase-a|vpio-01|vpio-02] FILE...
       k00-ledger.py --selftest        (offline synthetic VPIO-01 journals; exit 0 = every expectation met)
Prints one Markdown table row per file (and a header with --header). Changes nothing.
"""
import argparse, hashlib, json, os, sys

P5B0_STEPS = ['engine_created', 'vp_enable_begin', 'vp_enable_return', 'output_connected', 'input_format_after_vp',
              'input_tap_installed', 'render_tap_installed', 'observer_installed', 'prepare_begin', 'prepare_return',
              'start_begin', 'start_return', 'is_running_immediate']
PHASE_A_STEPS = P5B0_STEPS[:1] + ['input_format_before_vp'] + P5B0_STEPS[1:]   # 4596b9bdb: the pre-VP read is step 2
# VPIO-01 (85e5e7154, MAC-COMPILE-02 GREEN): the eleven seams of the Voice-Processing I/O substrate, frozen by ruling.
VPIO01_STEPS = ['unit_created', 'io_enabled', 'vp_properties_set', 'input_format_read', 'formats_set', 'callbacks_armed',
                'initialize_begin', 'initialize_return', 'start_begin', 'start_return', 'is_running_immediate']
# VPIO-02 / FORMAT-RESOLUTION-01 (ac12dedf4, VPIO-02 MAC-COMPILE-01 GREEN, dylib B346F448-…): the fourteen seams — the format
# probe (initialize → read → uninitialize) is visible as three seams around input_format_read. Frozen by ruling (VPIO-02B).
VPIO02_STEPS = ['unit_created', 'io_enabled', 'vp_properties_set', 'format_probe_initialize_begin', 'format_probe_initialize_return',
                'input_format_read', 'format_probe_uninitialize_return', 'formats_set', 'callbacks_armed',
                'initialize_begin', 'initialize_return', 'start_begin', 'start_return', 'is_running_immediate']
STEPS = {'p5b0': P5B0_STEPS, 'phase-a': PHASE_A_STEPS, 'vpio-01': VPIO01_STEPS, 'vpio-02': VPIO02_STEPS}
# The explicit subject table (VPIO-01B). `running` names the evidence key the substrate journals for its running read;
# `refusal_terminal` names the only step a lawful gen-1 §3 refusal may end on for the engine subjects (C-D6/C-D7);
# None = any exact ordered proper prefix qualifies when the gen-1 graph_start_refused record is present (VPIO-01B §4).
SUBJECT_TABLE = {
    'p5b0':    {'bundle': 'life.soullab.voicekernel.k00',    'label': 'VoiceKernel K00',     'running': 'engineRunning', 'refusal_terminal': 'input_format_after_vp'},
    'phase-a': {'bundle': 'life.soullab.voicekernel.k00',    'label': 'VoiceKernel K00',     'running': 'engineRunning', 'refusal_terminal': 'input_format_after_vp'},
    'vpio-01': {'bundle': 'life.soullab.voicekernel.vpio01', 'label': 'VoiceKernel VPIO-01', 'running': 'ioRunning',     'refusal_terminal': None},
    'vpio-02': {'bundle': 'life.soullab.voicekernel.vpio02', 'label': 'VoiceKernel VPIO-02', 'running': 'ioRunning',     'refusal_terminal': None},
}
SUBJECTS = {k: len(v) for k, v in STEPS.items()}   # gen-1 trace step count per known subject: p5b0 13 · phase-a 14 · vpio-01 11 · vpio-02 14
# C-D7 (Stage C preparation, 2026-09-13): the C-D6 prefix acceptance was written for the P5-B0 list only; on the Phase-A
# subject a lawful gen-1 refusal would have read SUBJECT-MISMATCH. The prefix is now taken from the subject's own ordered
# list. P5-B0 rows are unaffected (same list, same rule).
# C-D6 (Stage B attempt 2 sample 5, K00-faf8fa3e): a §3 refusal AT GENERATION 1 lawfully ends the gen-1 trace at
# input_format_after_vp (5 steps) with a gen-1 graph_start_refused. That is the subject behaving, not another subject;
# the subject check accepts a proper prefix of the ordered step list only when that refusal record is present.

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

def subject_matches(steps1, refused1, subject):
    """The subject check. Engine subjects: the historical rule, unchanged. VPIO-01: exact 11 steps, or an exact ordered
    proper prefix of them accompanied by the gen-1 graph_start_refused record (VPIO-01B §4). VPIO-02: the same rule over
    its own 14-step list (VPIO-02B). The lists diverge at step 4 (input_format_read vs format_probe_initialize_begin), so
    a full or refused trace of one VPIO subject never qualifies as the other beyond the shared three-step head; that head
    (a refusal after unit_created · io_enabled · vp_properties_set) is trace-indistinguishable between the two VPIO
    subjects and is resolved by container custody (the batch pulls from the declared subject's own container), never
    synthesized here — recorded in the self-test, not adjudicated by the classifier."""
    expected = SUBJECTS[subject]
    terminal = SUBJECT_TABLE[subject]['refusal_terminal']
    if terminal is not None:
        prefix_ok = refused1 and 0 < len(steps1) < expected and steps1 == STEPS[subject][:len(steps1)] and steps1[-1] == terminal
        mismatch = (len(steps1) != expected and not prefix_ok) or (subject == 'p5b0' and 'input_format_before_vp' in steps1) or (subject == 'phase-a' and 'input_format_before_vp' not in steps1)
        return (not mismatch), prefix_ok
    prefix_ok = refused1 and 0 < len(steps1) < expected and steps1 == STEPS[subject][:len(steps1)]
    full_ok = steps1 == STEPS[subject]
    return (full_ok or prefix_ok), prefix_ok

def classify(rows, w4=False, subject='p5b0'):
    expected = SUBJECTS[subject]
    running_key = SUBJECT_TABLE[subject]['running']
    ev = {}
    session = rows[0].get('session', '?') if rows else '?'
    enter = [r for r in rows if r['event'] == 'command' and r['cause'] == 'enterConversation']
    if not rows or not enter:
        return 'DRIVER/INFRASTRUCTURE FAILURE', 'no enterConversation in journal (harness never entered)', ev, session
    t0 = enter[0]['timeMonotonicMs']
    steps1 = [r['evidence']['step'] for r in rows if r['event'] == 'graph_start_trace' and r['evidence'].get('generation') == '1']
    refused1 = any(r['event'] == 'graph_start_refused' and r['evidence'].get('generation') == '1' for r in rows)
    ok, prefix_ok = subject_matches(steps1, refused1, subject)
    if not ok:
        return 'SUBJECT-MISMATCH', f'gen-1 trace has {len(steps1)} steps; pre-VP read present={"input_format_before_vp" in steps1}', ev, session
    if prefix_ok: ev['gen1Refused'] = True
    resets = sum(1 for r in rows if r['event'] == 'media_services_reset')
    if resets: ev['mediaServicesResets'] = resets
    cold = rows[0]['event'] == 'app_lifecycle' and rows[0]['cause'] == 'didBecomeActive' and rows[0]['generation'] == 0
    ev['cold'] = cold
    ir = [r['evidence'][running_key] for r in rows if r['event'] == 'graph_start_trace' and r['evidence']['step'] == 'is_running_immediate' and r['evidence'].get('generation') == '1']
    gs = [r['evidence'][running_key] for r in rows if r['event'] == 'graph_started' and r['generation'] == 1]
    ev['isRunningImmediate'] = ir[0] if ir else '-'
    ev['graphStartedRunning'] = gs[0] if gs else '-'
    fc = [r['evidence']['msSinceStartReturn'] for r in rows if r['event'] == 'first_input_callback' and r['generation'] == 1]
    ev['firstCallbackMs'] = fc[0] if fc else '-'
    listens = [r for r in rows if r['event'] == 'floor_transition' and r['to'] == 'listening']
    # C-D9 (founder ruling 2026-09-13, O9): two EVIDENCE fields, pinned definitions, classes untouched.
    #   listeningHeldAtExport: listening was reached AND the authoritative floor immediately at export (the last
    #                          floor_transition in the journal) is still listening.
    #   listeningLostLater:    listening was reached AND a later floor_transition leaves listening before export.
    # Not mutually exclusive (lose then regain → both true). Continuity is never inferred from heldAtExport alone.
    if listens:
        floors_all = [r['to'] for r in rows if r['event'] == 'floor_transition']
        first_i = floors_all.index('listening')
        ev['listeningHeldAtExport'] = floors_all[-1] == 'listening'
        ev['listeningLostLater'] = any(f != 'listening' for f in floors_all[first_i + 1:])
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
    floors = [r.get('to') for r in rows if r['event'] == 'floor_transition']
    return 'other observed shape', f'no listening and no degraded by end of journal (hold {ev["holdS"]} s; last floor {floors[-1] if floors else "unknown"})', ev, session

# ─── offline synthetic self-test (VPIO-01B §3 acceptance step 3) ─────────────────────────────────────────────────────────
def _synthetic(steps, running_key, running_value, refuse_gen1=False, listen_gen=1, degrade=False, session='K00-synthetic'):
    """Build a minimal journal: cold launch → Enter → gen-1 trace (`steps`) [→ gen-1 refusal] → outcome. Shapes only;
    every value is synthetic and labelled so. Never written to a ledger."""
    rows, seq, t = [], 0, 1000
    def rec(event, cause, generation, evidence=None, to=None, extra=None):
        nonlocal seq, t
        seq += 1; t += 10
        r = {'seq': seq, 'session': session, 'timeMonotonicMs': t, 'event': event, 'cause': cause, 'generation': generation,
             'evidence': evidence or {}}
        if to is not None: r['to'] = to
        if extra: r.update(extra)
        rows.append(r); return seq
    rec('app_lifecycle', 'didBecomeActive', 0)
    rec('command', 'enterConversation', 0)
    for st in steps:
        ev = {'step': st, 'generation': '1'}
        if st == 'is_running_immediate': ev[running_key] = running_value
        rec('graph_start_trace', 'enterConversation', 1, ev)
    if refuse_gen1:
        rec('graph_start_refused', 'enterConversation', 1, {'generation': '1', 'inputSampleRate': '0.0', 'inputChannels': '1'})
        rec('recovery_requested', 'graph_rebuild_failed', 1)
        rec('floor_transition', 'recovery', 1, to='recovering')
    else:
        rec('graph_started', 'enterConversation', 1, {running_key: running_value})
    if degrade:
        rec('floor_transition', 'budget_exhausted', max(listen_gen, 1), to='degraded')
    elif listen_gen:
        if listen_gen > 1:
            for g in range(2, listen_gen + 1):
                for st in steps: rec('graph_start_trace', 'recovery', g, {'step': st, 'generation': str(g)})
                rec('graph_started', 'recovery', g, {running_key: 'true'})
        rec('first_input_callback', 'observation', listen_gen, {'msSinceStartReturn': '90'})
        rec('floor_transition', 'input_healthy', listen_gen, to='listening')
    rec('command', 'leaveConversation', listen_gen or 1)
    rec('session_released', 'leaveConversation', listen_gen or 1)
    rec('floor_transition', 'leaveConversation', listen_gen or 1, to='idle', extra={'causeSeq': seq - 1})
    return rows

def selftest():
    V = VPIO01_STEPS
    V2 = VPIO02_STEPS
    cases = [
        # (name, rows, subject, expected class, expected evidence subset)
        ('vpio gen-1 listen, full 11-step trace, ioRunning',            _synthetic(V, 'ioRunning', 'true'),                                   'vpio-01', 'gen-1 listen',           {'isRunningImmediate': 'true', 'graphStartedRunning': 'true'}),
        ('vpio gen-1 §3 refusal after input_format_read → recovery',     _synthetic(V[:4], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-01', 'failure then recovery', {'gen1Refused': True}),
        ('vpio gen-1 refusal after callbacks_armed (any exact prefix)',  _synthetic(V[:6], 'ioRunning', 'true', refuse_gen1=True, listen_gen=3), 'vpio-01', 'failure then recovery', {'gen1Refused': True}),
        ('vpio failure then degradation',                                _synthetic(V, 'ioRunning', 'false', listen_gen=0, degrade=True),      'vpio-01', 'failure then degradation', {}),
        ('vpio no listen, no degraded → other observed shape',           _synthetic(V, 'ioRunning', 'false', listen_gen=0),                    'vpio-01', 'other observed shape',   {}),
        ('vpio short trace WITHOUT refusal is not the subject',          _synthetic(V[:6], 'ioRunning', 'true'),                               'vpio-01', 'SUBJECT-MISMATCH',       {}),
        ('vpio prefix out of order is not the subject',                  _synthetic([V[0], V[2], V[1]], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-01', 'SUBJECT-MISMATCH', {}),
        ('engine 13-step journal under --subject vpio-01 is a mismatch', _synthetic(P5B0_STEPS, 'engineRunning', 'true'),                     'vpio-01', 'SUBJECT-MISMATCH',       {}),
        ('vpio journal under --subject p5b0 is a mismatch',              _synthetic(V, 'ioRunning', 'true'),                                   'p5b0',    'SUBJECT-MISMATCH',       {}),
        ('vpio journal under --subject phase-a is a mismatch',           _synthetic(V, 'ioRunning', 'true'),                                   'phase-a', 'SUBJECT-MISMATCH',       {}),
        ('engine p5b0 gen-1 listen still classifies (historical rule)',  _synthetic(P5B0_STEPS, 'engineRunning', 'true'),                     'p5b0',    'gen-1 listen',           {'isRunningImmediate': 'true'}),
        ('engine p5b0 refusal must end at input_format_after_vp',        _synthetic(P5B0_STEPS[:6], 'engineRunning', 'true', refuse_gen1=True, listen_gen=2), 'p5b0', 'SUBJECT-MISMATCH', {}),
        ('engine p5b0 refusal at input_format_after_vp → recovery',      _synthetic(P5B0_STEPS[:5], 'engineRunning', 'true', refuse_gen1=True, listen_gen=2), 'p5b0', 'failure then recovery', {'gen1Refused': True}),
        # ── VPIO-02B: the fourth subject; same four classes, no fifth ──
        ('vpio-02 gen-1 listen, full 14-step trace, ioRunning',                 _synthetic(V2, 'ioRunning', 'true'),                                        'vpio-02', 'gen-1 listen',            {'isRunningImmediate': 'true', 'graphStartedRunning': 'true'}),
        ('vpio-02 gen-1 §3 refusal after format_probe_uninitialize_return → recovery', _synthetic(V2[:7], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-02', 'failure then recovery',  {'gen1Refused': True}),
        ('vpio-02 refusal after format_probe_initialize_return (probe init failed)', _synthetic(V2[:5], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-02', 'failure then recovery',  {'gen1Refused': True}),
        ('vpio-02 refusal after formats_set (any exact prefix)',                 _synthetic(V2[:8], 'ioRunning', 'true', refuse_gen1=True, listen_gen=3),    'vpio-02', 'failure then recovery',  {'gen1Refused': True}),
        ('vpio-02 gen-1 §3 refusal then degraded (the O6 shape)',               _synthetic(V2[:7], 'ioRunning', 'true', refuse_gen1=True, listen_gen=0, degrade=True), 'vpio-02', 'failure then degradation', {'gen1Refused': True}),
        ('vpio-02 failure then degradation',                                    _synthetic(V2, 'ioRunning', 'false', listen_gen=0, degrade=True),           'vpio-02', 'failure then degradation', {}),
        ('vpio-02 no listen, no degraded → other observed shape',               _synthetic(V2, 'ioRunning', 'false', listen_gen=0),                         'vpio-02', 'other observed shape',    {}),
        ('vpio-02 short trace WITHOUT refusal is not the subject',              _synthetic(V2[:7], 'ioRunning', 'true'),                                    'vpio-02', 'SUBJECT-MISMATCH',        {}),
        ('vpio-02 refusal prefix out of order is not the subject',              _synthetic([V2[0], V2[2], V2[1]], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-02', 'SUBJECT-MISMATCH', {}),
        ('vpio-02 read BEFORE the probe initialize is not the subject',         _synthetic(V2[:3] + [V2[5], V2[3]], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-02', 'SUBJECT-MISMATCH', {}),
        ('vpio-02 with a missing probe seam is not the subject (never synthesized)', _synthetic(V2[:5] + V2[6:], 'ioRunning', 'true'),                     'vpio-02', 'SUBJECT-MISMATCH',        {}),
        ('engine 13-step journal under --subject vpio-02 is a mismatch',        _synthetic(P5B0_STEPS, 'engineRunning', 'true'),                            'vpio-02', 'SUBJECT-MISMATCH',        {}),
        ('engine 14-step Phase-A journal under --subject vpio-02 is a mismatch (same count, different seams)', _synthetic(PHASE_A_STEPS, 'engineRunning', 'true'), 'vpio-02', 'SUBJECT-MISMATCH', {}),
        ('VPIO-01 full 11-step journal under --subject vpio-02 is a mismatch',  _synthetic(V, 'ioRunning', 'true'),                                         'vpio-02', 'SUBJECT-MISMATCH',        {}),
        ('VPIO-01 step-4 refusal (the 0/30 shape) under --subject vpio-02 is a mismatch', _synthetic(V[:4], 'ioRunning', 'true', refuse_gen1=True, listen_gen=0, degrade=True), 'vpio-02', 'SUBJECT-MISMATCH', {}),
        ('VPIO-02 full 14-step journal under --subject vpio-01 is a mismatch',  _synthetic(V2, 'ioRunning', 'true'),                                        'vpio-01', 'SUBJECT-MISMATCH',        {}),
        ('VPIO-02 step-7 refusal under --subject vpio-01 is a mismatch',        _synthetic(V2[:7], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2),    'vpio-01', 'SUBJECT-MISMATCH',        {}),
        ('VPIO-02 journal under --subject p5b0 is a mismatch',                  _synthetic(V2, 'ioRunning', 'true'),                                        'p5b0',    'SUBJECT-MISMATCH',        {}),
        ('VPIO-02 journal under --subject phase-a is a mismatch',               _synthetic(V2, 'ioRunning', 'true'),                                        'phase-a', 'SUBJECT-MISMATCH',        {}),
        # The shared three-step head is the one shape the trace cannot attribute: a refusal after vp_properties_set is an
        # exact proper prefix of BOTH VPIO lists. Custody (which subject's container the journal was pulled from) decides;
        # the classifier records the shape and does not choose. Pinned here so the limitation is visible, never silent.
        ('shared-head refusal (3 steps) qualifies under vpio-01 — trace-indistinguishable, custody decides', _synthetic(V2[:3], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-01', 'failure then recovery', {'gen1Refused': True}),
        ('shared-head refusal (3 steps) qualifies under vpio-02 — trace-indistinguishable, custody decides', _synthetic(V2[:3], 'ioRunning', 'true', refuse_gen1=True, listen_gen=2), 'vpio-02', 'failure then recovery', {'gen1Refused': True}),
    ]
    fails = 0
    for name, rows, subject, want, want_ev in cases:
        cls, why, ev, _ = classify(rows, False, subject)
        bad = cls != want or any(ev.get(k) != v for k, v in want_ev.items())
        # VPIO rows must never carry an engineRunning read; engine rows must never carry ioRunning.
        if subject in ('vpio-01', 'vpio-02') and cls not in ('SUBJECT-MISMATCH',) and any('engineRunning' in json.dumps(r) for r in rows):
            bad = True
        fails += bad
        print(f'{"FAIL" if bad else "ok  "}  {name}: {cls}{(" — " + why) if why else ""}  {json.dumps({k: ev.get(k) for k in want_ev})}')
    print(f'selftest: {len(cases) - fails}/{len(cases)} expectations met; classes = {sorted(set(c[3] for c in cases))}')
    return 0 if fails == 0 else 1

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='*')
    ap.add_argument('--stratum', default='UNLABELLED')
    ap.add_argument('--index', default='')
    ap.add_argument('--mode', default='')
    ap.add_argument('--w4', action='store_true')
    ap.add_argument('--header', action='store_true')
    ap.add_argument('--subject', default='p5b0', choices=sorted(SUBJECTS))
    ap.add_argument('--selftest', action='store_true')
    a = ap.parse_args()
    if a.selftest:
        sys.exit(selftest())
    if not a.files and not a.header:
        ap.error('FILE... required')
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
