#!/usr/bin/env python3
# KERNEL-00 hidden-state census · PASS 2 · SEAM EXPERIMENT ledger (protocol: docs/programme/VOICE-2026/PASS2_SEAM_EXPERIMENT_PROTOCOL_2026-09-14.md).
# Pure function on files: per-sample FROZEN fields F1–F6 from the reader's audio subset + the sample's journal, joined to the
# class the kernel ledger already assigned (take = gen-1 listen; miss = the other three audio classes; infra/precondition rows
# are not samples). Comparison statistics are the predeclared ones only. No device act, no log(1), no subprocess.
#   usage: k00-seam-ledger.py <LOGGED ledger dir> <unifiedlog dir>            → SEAM-LEDGER.md beside the unifiedlog dir
#          k00-seam-ledger.py --compare <LOGGED ledger dir> <CONTROL ledger dir> → block-drift comparison (CONTROL = no log(1) invocation) (protocol §6)
import json, sys, os, re, collections, statistics, hashlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from k00_log_align import seam_fields, SEAM_FIELDS
TAKE = 'gen-1 listen'; MISS = ('failure then recovery', 'failure then degradation', 'other observed shape')
def rows_of(ledger_dir):
    out = {}
    for l in open(os.path.join(ledger_dir, 'ledger.md')):
        c = [x.strip() for x in l.strip().strip('|').split('|')]
        if len(c) < 8 or not c[1].isdigit(): continue
        cls = c[6].strip('*'); m = re.search(r'\(`([^`]+\.jsonl)`\)', c[3])
        out[int(c[1])] = {'class': cls, 'journal': m.group(1) if m else None, 'wall_s': None}
    # C-D18 (2026-09-14): driver wall per sample comes from the batch's own sample-timing.tsv (i, t0 epoch s, t1 epoch s), the
    # authoritative per-sample window; it was previously scraped as `wall N s` from ledger evidence text, a string only the
    # infrastructure rows carry, which reported CONTROL as 6 s (one infra row) and LOGGED as None. Rows without a timing line stay None.
    tp = os.path.join(ledger_dir, 'sample-timing.tsv')
    if os.path.exists(tp):
        for l in open(tp):
            c = l.rstrip('\n').split('\t')
            if len(c) >= 3 and c[0].strip().isdigit() and int(c[0]) in out:
                try: out[int(c[0])]['wall_s'] = float(c[2]) - float(c[1])
                except ValueError: pass
    return out
def auc(a, b):   # rank separation of takes (a) vs misses (b), as in census pass 1; 0.5 = none
    if not a or not b: return None
    return round(sum((x > y) + 0.5 * (x == y) for x in a for y in b) / (len(a) * len(b)), 2)
def fisher(a1, a2, b1, b2):   # two-sided, exact, small tables (take/miss × logged/control)
    from math import comb
    n = a1 + a2 + b1 + b2; r1, c1 = a1 + a2, a1 + b1
    p = lambda k: comb(r1, k) * comb(n - r1, c1 - k) / comb(n, c1)
    p0 = p(a1); return round(sum(p(k) for k in range(max(0, c1 - (n - r1)), min(r1, c1) + 1) if p(k) <= p0 + 1e-12), 3)
if sys.argv[1] == '--compare':
    L, C = rows_of(sys.argv[2]), rows_of(sys.argv[3])
    def tally(R): 
        cls = collections.Counter(r['class'] for r in R.values()); t = cls[TAKE]; m = sum(cls[k] for k in MISS); i = len(R) - t - m
        w = [r['wall_s'] for r in R.values() if r['wall_s'] is not None]
        return t, m, i, (statistics.median(w) if w else None)
    lt, lm, li, lw = tally(L); ct, cm, ci, cw = tally(C)
    print(f"## block-drift comparison (protocol §6; CONTROL = no log(1) invocation; NOT an observer-effect control under D-L1): LOGGED takes {lt} · misses {lm} · infra {li} · median driver wall {lw} s  ‖  CONTROL takes {ct} · misses {cm} · infra {ci} · median wall {cw} s")
    print(f"## take rate LOGGED {lt}/{lt+lm} vs CONTROL {ct}/{ct+cm} · Fisher exact two-sided p = {fisher(lt, lm, ct, cm) if (lt+lm and ct+cm) else 'n/a'} (predeclared: p ≥ 0.05 → no block difference detected — not proof of no drift, not an observer-effect finding; p < 0.05 → block/time difference detected, reported without attribution)")
    sys.exit(0)
LD, UD = sys.argv[1:3]; R = rows_of(LD); out = []
say = lambda *a: (print(*a), out.append(' '.join(str(x) for x in a)))
say(f"# SEAM LEDGER — logged block {os.path.basename(LD)} · unified-log dir {os.path.basename(UD)} · fields FROZEN per protocol §4 · classes from the kernel ledger, never from the log")
per = {}
for i in sorted(R):
    r = R[i]; A = os.path.join(UD, f'window-s{i}-audio.jsonl'); J = os.path.join(LD, 'journals', r['journal'] or '_')
    if r['class'] not in (TAKE,) + MISS: say(f"| {i} | {r['class']} | not a sample | — |"); continue
    if not (os.path.exists(A) and os.path.exists(J)): say(f"| {i} | {r['class']} | seam UNOBSERVABLE (window or journal missing) | — |"); per[i] = {'seam': 'UNOBSERVABLE'}; continue
    aud = [json.loads(l) for l in open(A) if l.strip()]; rs = [json.loads(l) for l in open(J) if l.strip()]
    f = seam_fields(aud, rs); per[i] = f
    if f.get('seam') != 'READ': say(f"| {i} | {r['class']} | seam {f['seam']} | — |"); continue
    os.makedirs(os.path.join(UD, 'seam'), exist_ok=True)
    with open(os.path.join(UD, 'seam', f'sample-{i}.txt'), 'w') as fh: fh.write('\n'.join(f['seam_transcript']) + '\n')   # raw evidence, verbatim, never a feature
    say(f"| {i} | {r['class']} | " + ' · '.join(f"{k}={f[k]}" for k in SEAM_FIELDS) + f" | anchors {f['anchor_agreement_ms']} ms |")
say("\n## predeclared comparison — takes vs misses, per field (median · min…max · n) and rank separation AUC(take > miss); 0.5 = no separation")
T = {i: f for i, f in per.items() if f.get('seam') == 'READ' and R[i]['class'] == TAKE}; M = {i: f for i, f in per.items() if f.get('seam') == 'READ' and R[i]['class'] in MISS}
say(f"readable seams: takes {len(T)} · misses {len(M)} · unreadable/unobservable {sum(1 for f in per.values() if f.get('seam') != 'READ')}")
for k in SEAM_FIELDS[:5]:
    a = [f[k] for f in T.values() if f[k] is not None]; b = [f[k] for f in M.values() if f[k] is not None]
    fmt = lambda v: f"{statistics.median(v):.0f} · {min(v)}…{max(v)} · n={len(v)}" if v else "absent"
    say(f"- {k}: takes {fmt(a)} ‖ misses {fmt(b)} ‖ AUC {auc(a, b)} · absent-in {len(T)-len(a)} takes / {len(M)-len(b)} misses (missingness is frozen evidence, §6)")
say(f"- F6_order_signature: takes {dict(collections.Counter(f['F6_order_signature'] for f in T.values()))} ‖ misses {dict(collections.Counter(f['F6_order_signature'] for f in M.values()))}")
say("\n## reading rules (protocol §7): a separation here is a CLIENT-SIDE CORRELATING SIGNATURE, never daemon causation and not mechanism; no separation = the currently observable seam is exhausted without touching the organism. F4 and the callback element of F6 are DOWNSTREAM CONTEXT: the localization claim (a signature INSIDE engine.start()) must rest on pre-start_return evidence — F1/F2/F3 and the pre-return ordering in F6; F5 only insofar as the differing posts occur before start_return. AUC is descriptive: near 0 or 1 = separation, 0.5 = none; no post-hoc test, no composite score.")
open(os.path.join(UD, 'SEAM-LEDGER.md'), 'w').write('\n'.join(out) + '\n'); print(f"seam ledger: {os.path.join(UD, 'SEAM-LEDGER.md')}")
