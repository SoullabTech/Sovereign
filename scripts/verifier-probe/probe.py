#!/usr/bin/env python3
"""
RC-GEN-01 · VERIFIER PROBE — the smallest possible falsification.

ONE question, and nothing else:

    Can an existing verifier reliably tell ASSOCIATED WITH a process
    from ACTUALLY PARTICIPATES IN that process?

This script imports nothing from MAIA, changes no graph, integrates nothing, and
orchestrates nothing. It reads fixtures, asks a local model, and records four fields
per case: source text, the proposed edge as a sentence, the verifier's result, and
the expected result.

IT DOES NOT RULE. It prints a tally and stops. The verdict is the founder's.

    python3 scripts/verifier-probe/probe.py --dry-run        # fixtures only, no model
    python3 scripts/verifier-probe/probe.py --model deberta
    python3 scripts/verifier-probe/probe.py --model hhem
    python3 scripts/verifier-probe/probe.py --model both

Install (local, self-hosted, no external API — CPU is fine at this size):

    pip install torch transformers sentencepiece

⚠️ HHEM-2.1-Open ships REMOTE CODE written against transformers 4.x. Under
transformers 5.x it dies in `mark_tied_weights_as_initialized` with
`'HHEMv2ForSequenceClassification' object has no attribute 'all_tied_weights_keys'`.
That is a packaging incompatibility, NOT a result about the model. Run HHEM from its
own environment:

    python3 -m venv ~/hhem-venv && source ~/hhem-venv/bin/activate
    pip install torch "transformers<5" sentencepiece
    python3 scripts/verifier-probe/probe.py --model hhem

⛔ `--repeat` CONFIRMS DETERMINISTIC EXECUTION AND NOTHING MORE. An NLI classifier in
eval mode returns the same score for the same input, so repeats are not a robustness
test — an earlier version of this file claimed they probed the instability A-S showed
in the generative analyser, and that claim was wrong. THE FIXTURE VARIATIONS
(N1-N6 / P1-P4 / X1-X3) ARE THE ROBUSTNESS TEST. Default is 1.

Disk footprint, worth checking first given the volume was at 98%:

    MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli   ~1.7 GB
    MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli               ~0.4 GB  (--small)
    vectara/hallucination_evaluation_model                     ~0.5 GB

⛔ LABEL ORDER IS READ FROM THE MODEL CONFIG, NEVER HARD-CODED. NLI checkpoints do not
agree on whether index 0 is entailment or contradiction, and a probe that assumed one
would silently invert its own result — reporting the exact opposite finding with no
error. The one thing this script must not do is be confidently backwards.
"""
import argparse, collections, hashlib, json, sys, time
from pathlib import Path

SETS = {
    'as-derived': Path(__file__).with_name('fixtures.json'),
    'blind': Path(__file__).with_name('fixtures-blind.json'),
    'scope': Path(__file__).with_name('fixtures-scope.json'),
    'modifier': Path(__file__).with_name('fixtures-modifier.json'),
}

DEBERTA_LARGE = 'MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli'
DEBERTA_BASE = 'MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli'
HHEM = 'vectara/hallucination_evaluation_model'
MINICHECK = 'flan-t5-large'   # MiniCheck-Flan-T5-Large, ~770M

# MiniCheck returns a support probability in [0,1], like HHEM. Same reporting rule:
# the cut is for display, every raw score is recorded, and moving it after seeing
# answers is tuning to the test.
MINICHECK_THRESHOLD = 0.5

# HHEM returns a consistency score in [0,1]. This is a REPORTING threshold only —
# it is printed alongside the raw score and every raw score is recorded, so a
# different cut can be applied to the same evidence without re-running anything.
HHEM_THRESHOLD = 0.5


def load_cases(which):
    path = SETS[which]
    raw = path.read_bytes()
    data = json.loads(raw)
    cases = data['cases']
    ids = [c['id'] for c in cases]
    assert len(set(ids)) == len(ids), 'duplicate fixture id'
    for c in cases:
        assert c['expected'] in ('entailed', 'not_entailed'), c['id']
    # ⭐ The fixture file's own hash goes into the output. A frozen set that cannot
    # be shown to be the set that ran is not frozen — it is merely asserted to be.
    return cases, hashlib.sha256(raw).hexdigest()


def run_deberta(cases, repeat, small):
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
    name = DEBERTA_BASE if small else DEBERTA_LARGE
    print(f'  loading {name} ...', flush=True)
    tok = AutoTokenizer.from_pretrained(name)
    model = AutoModelForSequenceClassification.from_pretrained(name)
    model.eval()

    # ⛔ Read the label map off the config. Do not assume an order.
    id2label = {int(k): v.lower() for k, v in model.config.id2label.items()}
    print(f'  id2label (read from config): {id2label}', flush=True)
    if not any('entail' in v for v in id2label.values()):
        sys.exit('REFUSING TO REPORT: no entailment label in this model config.')

    rows = []
    for c in cases:
        for r in range(repeat):
            with torch.no_grad():
                enc = tok(c['premise'], c['hypothesis'], truncation=True, return_tensors='pt')
                probs = torch.softmax(model(**enc).logits[0], dim=-1).tolist()
            scored = {id2label[i]: round(p, 4) for i, p in enumerate(probs)}
            top = max(scored, key=scored.get)
            # ⛔⛔ THE VERDICT IS BINARY: ENTAILED vs NOT ENTAILED.
            # `neutral` and `contradiction` are RECORDED DIAGNOSTICS ONLY and are
            # kept in `scores` and `raw_label`. ⛔ NEITHER MAY EVER BE READ AS "the
            # source says the opposite" — on the blind set DeBERTa returned
            # `contradiction` for 7 of its 10 correct negatives, including B12,
            # where `neutral` is the truer label: the premise does not deny the
            # claim, it simply does not assert it. A later reader who collapses
            # `contradiction` into denial would build on a distinction the model
            # is not making. Founder ruling, 2026-09-11.
            observed = 'entailed' if 'entail' in top else 'not_entailed'
            rows.append(dict(verifier='deberta', run=r + 1, id=c['id'],
                             role=c.get('role', ''), family=c.get('family', ''),
                             group=c.get('group', ''),
                             premise=c['premise'], hypothesis=c['hypothesis'],
                             expected=c['expected'], observed=observed,
                             raw_label=top, scores=scored))
    return rows


def run_hhem(cases, repeat):
    from transformers import AutoModelForSequenceClassification
    print(f'  loading {HHEM} ...', flush=True)
    model = AutoModelForSequenceClassification.from_pretrained(HHEM, trust_remote_code=True)
    rows = []
    for c in cases:
        for r in range(repeat):
            score = float(model.predict([(c['premise'], c['hypothesis'])])[0])
            observed = 'entailed' if score >= HHEM_THRESHOLD else 'not_entailed'
            rows.append(dict(verifier='hhem', run=r + 1, id=c['id'],
                             role=c.get('role', ''), family=c.get('family', ''),
                             group=c.get('group', ''),
                             premise=c['premise'], hypothesis=c['hypothesis'],
                             expected=c['expected'], observed=observed,
                             raw_label=f'score={score:.4f}',
                             scores={'consistency': round(score, 4),
                                     'threshold': HHEM_THRESHOLD}))
    return rows


def run_minicheck(cases, repeat):
    """
    ⭐ THE CHALLENGER. MiniCheck is trained for GROUNDED FACT CHECKING — "is this claim
    supported by this document?" — rather than generic NLI. Different task, different
    training data, different architecture family.

    ⛔⛔ THE POINT IS NOT A BETTER SCORE. It is ERROR INDEPENDENCE. Two models that
    fail on the same examples are one epistemic witness wearing two shirts, and the
    whole reason for bringing in a verifier at all was that the generative analyser
    could not witness itself. ⭐ So the interesting output is not MiniCheck's total —
    it is WHICH cases it misses, compared against DeBERTa's five.

    ⛔ It runs the EXACT frozen corpora, unchanged, by their recorded hashes. A
    challenger evaluated on different material answers a different question.

    ⚠️ API NOT VERIFIED FROM THIS ENVIRONMENT — written against the published
    interface and never executed here. If the call shape is wrong, this verifier is
    reported as NOT RUN and every other verifier still reports, by the isolation
    repair. ⛔ A first-run failure here is a packaging fact, NOT a result about
    MiniCheck, and must not be recorded as one.
    """
    from minicheck.minicheck import MiniCheck
    print(f'  loading MiniCheck {MINICHECK} ...', flush=True)
    scorer = MiniCheck(model_name=MINICHECK)
    rows = []
    for c in cases:
        for r in range(repeat):
            _, probs, _, _ = scorer.score(docs=[c['premise']], claims=[c['hypothesis']])
            score = float(probs[0])
            observed = 'entailed' if score >= MINICHECK_THRESHOLD else 'not_entailed'
            rows.append(dict(verifier='minicheck', run=r + 1, id=c['id'],
                             role=c.get('role', ''), family=c.get('family', ''),
                             group=c.get('group', ''),
                             premise=c['premise'], hypothesis=c['hypothesis'],
                             expected=c['expected'], observed=observed,
                             raw_label=f'score={score:.4f}',
                             scores={'support': round(score, 4),
                                     'threshold': MINICHECK_THRESHOLD}))
    return rows


def report(rows):
    print('\n' + '=' * 78)
    hdr = f"{'CASE':<20} {'RUN':<4} {'EXPECTED':<14} {'OBSERVED':<14} {'MATCH':<6} RAW"
    for verifier in sorted({r['verifier'] for r in rows}):
        sub = [r for r in rows if r['verifier'] == verifier]
        print(f'\nVERIFIER  {verifier}\n' + '-' * 78)
        print(hdr)
        for r in sub:
            ok = r['expected'] == r['observed']
            print(f"{r['id']:<20} {r['run']:<4} {r['expected']:<14} {r['observed']:<14} "
                  f"{'ok' if ok else 'MISS':<6} {r['raw_label']}")

        # Selectivity, not accuracy. A verifier that says not_entailed to everything
        # gets every negative right and is useless — so the two directions are
        # reported separately and NEVER summed into one number.
        pos = [r for r in sub if r['expected'] == 'entailed']
        neg = [r for r in sub if r['expected'] == 'not_entailed']
        pos_ok = sum(r['observed'] == 'entailed' for r in pos)
        neg_ok = sum(r['observed'] == 'not_entailed' for r in neg)
        print(f"\n  asserted when licensed     {pos_ok}/{len(pos)}")
        print(f"  abstained when unlicensed  {neg_ok}/{len(neg)}")

        # ⭐ PER FAMILY, because a global tally hides a family-shaped blind spot.
        # HHEM's three misses on the first probe were one pattern, not three
        # accidents, and a column of totals said nothing about that.
        fams = sorted({r.get('family') for r in sub if r.get('family')})
        if fams:
            print('\n  BY FAMILY  (a family is only carried when BOTH directions are right)')
            for f in fams:
                fr = [r for r in sub if r.get('family') == f]
                fp = [r for r in fr if r['expected'] == 'entailed']
                fn = [r for r in fr if r['expected'] == 'not_entailed']
                fp_ok = sum(r['observed'] == 'entailed' for r in fp)
                fn_ok = sum(r['observed'] == 'not_entailed' for r in fn)
                carried = fp_ok == len(fp) and fn_ok == len(fn)
                mark = 'ok  ' if carried else 'MISS'
                print(f"    {mark} {f:<45} licensed {fp_ok}/{len(fp)}  "
                      f"unlicensed {fn_ok}/{len(fn)}")
        if pos_ok == 0:
            print('  ⛔ ZERO on the positive side. Blanket refusal is not selectivity,')
            print('     and a perfect negative column here means nothing.')
        # Execution determinism across repeats. ⛔ NOT a semantic robustness claim.
        for cid in sorted({r['id'] for r in sub}):
            obs = {r['observed'] for r in sub if r['id'] == cid}
            if len(obs) > 1:
                print(f'  ⚠️ UNSTABLE across repeats: {cid} -> {sorted(obs)}')
        # ⭐⭐ THE MODIFIER-BOUNDARY DISCRIMINATOR. Only meaningful when the set
        # carries M/V/P groups. M and V state the SAME limitation two ways, so the
        # gap between them IS the hypothesis. ⛔ Printed as two columns and never
        # summed: a combined number would answer a question nobody asked.
        if any(r.get('group') for r in sub):
            print('\n  ⭐ MODIFIER-BOUNDARY DISCRIMINATOR')
            g = {}
            for name, label in (('M', 'satellite modifier'), ('V', 'main verb'),
                                ('P', 'licensed control')):
                rs = [r for r in sub if r.get('group') == name]
                ok = sum(r['observed'] == r['expected'] for r in rs)
                g[name] = (ok, len(rs))
                print(f"    {name}  {label:<22} {ok}/{len(rs)} correct")
            if g['P'][0] < g['P'][1]:
                print('    ⛔ P IS NOT PERFECT — the verifier went conservative and')
                print('       NO negative column here means anything. Read nothing else.')
            else:
                mo, mt = g['M']; vo, vt = g['V']
                print(f"    -> M {mo}/{mt} vs V {vo}/{vt} · the gap IS the hypothesis")
                print('    ⛔ NOT A VERDICT. The founder rules on whether the gap is material.')

    verifiers = sorted({r['verifier'] for r in rows})
    if len(verifiers) > 1:
        # ⭐⭐ ERROR CORRELATION, NOT A SCOREBOARD. "Separation is not independence"
        # was established about two stages of ONE model; the same test has to be
        # applied to two different models before either can be called a second
        # witness. ⛔ Shared misses are the number that matters, and a challenger
        # with a better total but identical failures has added nothing.
        print('\n  ⭐ ERROR CORRELATION  (shared misses are what disqualify a witness)')
        miss = {v: {r['id'] for r in rows
                    if r['verifier'] == v and r['observed'] != r['expected']}
                for v in verifiers}
        for v in verifiers:
            print(f"    {v:<12} misses {sorted(miss[v]) or 'none'}")
        for i, a_ in enumerate(verifiers):
            for b_ in verifiers[i + 1:]:
                both = sorted(miss[a_] & miss[b_])
                only_a = sorted(miss[a_] - miss[b_])
                only_b = sorted(miss[b_] - miss[a_])
                print(f"    {a_} vs {b_}:  shared {both or 'none'} · "
                      f"only {a_} {only_a or 'none'} · only {b_} {only_b or 'none'}")

    print('\n' + '=' * 78)
    print('⛔ NOT SELF-JUDGED. These are readings, not a verdict.')


def compare(paths):
    """
    ⭐⭐ ERROR CORRELATION ACROSS SEPARATE RUNS.

    ⛔ THE IN-PROCESS CORRELATION BLOCK CANNOT REACH THE CASE THAT MATTERS MOST.
    MiniCheck and HHEM need transformers 4.x; the DeBERTa environment runs 5.x. So
    the challenger CANNOT run in the same process as the incumbent, and `--model all`
    is unavailable for exactly the comparison the challenger exists to make. Without
    this, two runs produce two totals and no correlation — which is the one number
    that decides whether a second verifier is a second WITNESS.

    ⛔ IT REFUSES TO CORRELATE ACROSS DIFFERENT MATERIAL. Both runs must carry the
    same `fixtures_sha256`. Comparing misses across different sets would produce a
    confident, meaningless answer.
    """
    loaded = []
    for path in paths:
        d = json.loads(Path(path).read_text())
        if 'rows' not in d:
            sys.exit(f'{path}: not a probe output file')
        loaded.append((path, d))

    digests = {d.get('fixtures_sha256') for _, d in loaded}
    if len(digests) != 1 or None in digests:
        print('⛔ REFUSING TO CORRELATE — the runs are not on the same frozen set:')
        for path, d in loaded:
            print(f"   {d.get('set', '?'):<12} {d.get('fixtures_sha256', '(none)')}  {path}")
        sys.exit(1)

    sets = {d.get('set') for _, d in loaded}
    print(f"ERROR CORRELATION · set={sets.pop()} · sha256 {digests.pop()}")
    for path, d in loaded:
        print(f"   {path}")

    miss, seen, total = {}, {}, {}
    for _, d in loaded:
        for r in d['rows']:
            v = r['verifier']
            total[v] = total.get(v, 0) + 1
            seen.setdefault(v, set()).add(r['id'])
            if r['observed'] != r['expected']:
                miss.setdefault(v, set()).add(r['id'])
            else:
                miss.setdefault(v, set())

    vs = sorted(miss)
    print()
    for v in vs:
        print(f"   {v:<12} {total[v] - len(miss[v])}/{total[v]} correct · "
              f"misses {sorted(miss[v]) or 'none'}")

    print('\n   ⭐ SHARED MISSES ARE WHAT DISQUALIFY A SECOND WITNESS')
    for i, a in enumerate(vs):
        for b in vs[i + 1:]:
            if seen[a] != seen[b]:
                print(f'   ⛔ {a} vs {b}: different case coverage — not comparable')
                continue
            both, only_a, only_b = sorted(miss[a] & miss[b]), sorted(miss[a] - miss[b]), sorted(miss[b] - miss[a])
            agree = len(seen[a]) - len(miss[a] ^ miss[b])
            print(f"   {a} vs {b}")
            print(f"      shared misses   {both or 'none'}")
            print(f"      only {a:<10} {only_a or 'none'}")
            print(f"      only {b:<10} {only_b or 'none'}")
            print(f"      verdicts agree on {agree}/{len(seen[a])} cases")
            if both and not (only_a or only_b):
                print('      ⛔ IDENTICAL FAILURES — one witness in two shirts.')
            elif not both:
                print('      ⭐ NO SHARED MISS on this set — errors are disjoint here.')
    print('\n⛔ NOT SELF-JUDGED. Correlation is a reading, not a verdict.')


def calibration(paths):
    """
    ⭐⭐ CALIBRATION — is the verifier CONFIDENT when it is WRONG?

    ⛔ EVERY READING SO FAR HAS BEEN argmax ONLY. A label was right or wrong and the
    probability behind it was recorded and never looked at. But the founder's
    criterion is explicit: *90% plus good calibration is much more valuable than 90%
    with total certainty*, and calibration is the difference between a verifier that
    can say "I may be reading this too strongly" and one that cannot.

    ⭐ THIS NEEDS NO NEW RUN. Every probe output already carries the full probability
    distribution. The question can be answered retrospectively, on the frozen runs
    that have already happened.

    ⛔ WHAT WOULD BE BAD NEWS: misses at the SAME confidence as hits. Then the model
    has no signal to offer about its own reliability, and no threshold, abstention
    band or routing rule can be built on it.
    ⭐ WHAT WOULD BE GOOD NEWS: misses clustered nearer the decision boundary. Then an
    UNRESOLVED band is available — the middle state that lets uncertainty survive
    instead of being forced into truth or falsehood.
    """
    rows = []
    for path in paths:
        d = json.loads(Path(path).read_text())
        for r in d.get('rows', []):
            rows.append({**r, '_set': d.get('set', '?')})
    if not rows:
        sys.exit('no rows found')

    def decision_var(r):
        """
        ⭐⭐ THE VARIABLE AN UNRESOLVED BAND WOULD ACTUALLY BE DRAWN ON.

        ⛔ NOT THE SAME AS CONFIDENCE, AND CONFLATING THEM WOULD ANSWER THE WRONG
        QUESTION. `max(probs)` says how sure the model is OF ITS LABEL. A band is
        drawn on how far the evidence leans TOWARD ENTAILMENT — p(entailment) for an
        NLI head, the support score for a score-based verifier. A model can be 0.97
        sure of `contradiction`, which is maximal confidence and minimal p(entail).
        """
        sc = r.get('scores') or {}
        if 'threshold' in sc:
            key = next((k for k in sc if k != 'threshold'), None)
            return sc[key] if key else None
        for k in sc:
            if 'entail' in k.lower():
                return sc[k]
        return None

    def confidence(r):
        """How sure the model is of the label it chose."""
        sc = r.get('scores') or {}
        if 'threshold' in sc:
            key = next((k for k in sc if k != 'threshold'), None)
            return abs(sc[key] - sc['threshold']) * 2 if key else None
        probs = [v for v in sc.values() if isinstance(v, (int, float))]
        return max(probs) if probs else None

    mean = lambda xs: sum(xs) / len(xs) if xs else float('nan')

    print('CALIBRATION — does certainty bear any relationship to correctness?')
    print('⛔ Read from already-frozen runs. No model was loaded.\n')

    for v in sorted({r['verifier'] for r in rows}):
        sub = [r for r in rows if r['verifier'] == v and confidence(r) is not None]
        if not sub:
            print(f'  {v}: no probabilities recorded'); continue
        hits = [r for r in sub if r['observed'] == r['expected']]
        miss = [r for r in sub if r['observed'] != r['expected']]
        print(f'  {v}   sets {sorted({r["_set"] for r in sub})}')
        print(f'    hits    n={len(hits):<3} mean confidence {mean([confidence(r) for r in hits]):.3f}')
        print(f'    misses  n={len(miss):<3} mean confidence {mean([confidence(r) for r in miss]):.3f}')
        for r in sorted(miss, key=confidence, reverse=True):
            dv = decision_var(r)
            print(f'      {r["id"]:<6} {r["_set"]:<10} wrong · confidence {confidence(r):.3f}'
                  + (f' · p(entail) {dv:.3f}' if dv is not None else ''))

        if hits and miss:
            gap = mean([confidence(r) for r in hits]) - mean([confidence(r) for r in miss])
            print(f'    -> misses are {abs(gap):.3f} '
                  f'{"LESS" if gap > 0 else "MORE"} confident than hits on average')
            if gap <= 0.05:
                print('    ⛔ NO GLOBAL SIGNAL — as sure when wrong as when right.')
                print('       ⭐ But read the REGIME breakdown before concluding: absolute')
                print('       confidence can be useless while confidence-per-regime is not.')
            else:
                print('    ⭐ A global band may be available.')

        # ⭐⭐ BY REGIME. The founder's hypothesis: the useful signal may not be
        # "score = uncertainty" but "score interpreted in light of WHAT KIND of
        # proposition is being judged". ⛔ A global mean cannot see that, and a
        # verifier that is well calibrated on ordinary inference and CONFIDENTLY
        # WRONG on satellite-modifier cases would look mediocre and be usable.
        for axis in ('group', 'family'):
            keys = sorted({r.get(axis) for r in sub if r.get(axis)})
            if not keys or len(keys) > 12:
                continue
            print(f'\n    ⭐ BY {axis.upper()}')
            for k in keys:
                ks = [r for r in sub if r.get(axis) == k]
                kh = [confidence(r) for r in ks if r['observed'] == r['expected']]
                km = [confidence(r) for r in ks if r['observed'] != r['expected']]
                flag = ''
                if km and mean(km) >= 0.90:
                    flag = '  ⛔ CONFIDENTLY WRONG'
                elif km and kh and mean(kh) - mean(km) > 0.15:
                    flag = '  ⭐ misses are hesitant'
                fmt = lambda xs: f'{mean(xs):.3f}' if xs else '  -  '
                print(f'      {k:<26} hits {len(kh):>2} @ {fmt(kh)}'
                      f'   misses {len(km):>2} @ {fmt(km)}{flag}')

        # ⭐ BAND SWEEP — the cost of an UNRESOLVED band, at several widths.
        # ⛔ THIS PROPOSES NOTHING. It reports what each width would capture and what
        # it would sacrifice. Choosing a width is a separate, predeclared act on
        # separate material, and a width chosen from THESE numbers is fitted to them.
        dvs = [(decision_var(r), r) for r in sub if decision_var(r) is not None]
        if dvs:
            print('\n    ⭐ UNRESOLVED BAND SWEEP  (reading only — proposes nothing)')
            print('      width   misses held   correct verdicts sacrificed')
            for hi in (0.60, 0.70, 0.80, 0.90, 0.95):
                lo = 1 - hi
                inband = [(d, r) for d, r in dvs if lo < d < hi]
                held = sum(1 for _, r in inband if r['observed'] != r['expected'])
                sacrificed = sum(1 for _, r in inband if r['observed'] == r['expected'])
                tot_miss = sum(1 for _, r in dvs if r['observed'] != r['expected'])
                print(f'      {lo:.2f}-{hi:.2f}   {held}/{tot_miss:<10}  {sacrificed}/{len(dvs) - tot_miss}')
            print('      ⛔ A band that holds every miss by sacrificing every verdict')
            print('         has not created an UNRESOLVED state — it has abolished the')
            print('         other two.')
        print()

    print('\n⛔ NOT SELF-JUDGED. A reading, not a verdict.')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', choices=['deberta', 'hhem', 'minicheck', 'both', 'all'],
                    default='deberta')
    ap.add_argument('--repeat', type=int, default=1,
                    help='confirms deterministic execution only; not a robustness test')
    ap.add_argument('--small', action='store_true', help='DeBERTa base instead of large')
    ap.add_argument('--dry-run', action='store_true', help='print fixtures, load no model')
    ap.add_argument('--set', dest='which', choices=sorted(SETS), default='as-derived')
    ap.add_argument('--out', default='')
    ap.add_argument('--compare', nargs='+', metavar='RESULT.json',
                    help='correlate errors across saved runs of the SAME frozen set')
    ap.add_argument('--calibration', nargs='+', metavar='RESULT.json',
                    help='confidence on hits vs misses, from already-frozen runs')
    a = ap.parse_args()

    if a.compare:
        compare(a.compare)
        return
    if a.calibration:
        calibration(a.calibration)
        return

    cases, digest = load_cases(a.which)
    print(f'RC-GEN-01 VERIFIER PROBE · set={a.which} · {len(cases)} cases · repeat={a.repeat}')
    print(f'  fixtures sha256  {digest}')
    print(f'  positive (expect entailed)      {sum(c["expected"] == "entailed" for c in cases)}')
    print(f'  negative (expect not_entailed)  {sum(c["expected"] == "not_entailed" for c in cases)}')

    if a.dry_run:
        for c in cases:
            fam = f"  [{c['family']}]" if c.get('family') else ''
            print(f"\n[{c['id']}]  expect {c['expected']}{fam}")
            print(f"  PREMISE     {c['premise']}")
            print(f"  HYPOTHESIS  {c['hypothesis']}")
            print(f"  WHY         {c['origin']}")
        print('\n⛔ DRY RUN — no model was loaded and nothing was measured.')
        return

    # ⛔ A FAILURE IN ONE VERIFIER MUST NOT DESTROY THE OTHER'S COMPLETED RESULTS.
    # The first real run computed every DeBERTa row, then HHEM raised on load and the
    # traceback took the whole process down before anything was reported or written.
    # Measured evidence was discarded by an unrelated packaging error.
    rows, failures = [], []
    plan = ([('deberta', lambda: run_deberta(cases, a.repeat, a.small))]
            if a.model in ('deberta', 'both', 'all') else [])
    plan += ([('hhem', lambda: run_hhem(cases, a.repeat))]
             if a.model in ('hhem', 'both', 'all') else [])
    plan += ([('minicheck', lambda: run_minicheck(cases, a.repeat))]
             if a.model in ('minicheck', 'all') else [])

    for name, fn in plan:
        try:
            rows += fn()
        except Exception as exc:  # noqa: BLE001 — recorded, never swallowed
            failures.append((name, f'{type(exc).__name__}: {exc}'))
            print(f'\n⛔ {name}: NOT RUN — {type(exc).__name__}: {exc}', file=sys.stderr)

    report(rows)
    if failures:
        print('\n⛔ VERIFIERS THAT DID NOT RUN — these are ABSENT, not negative:')
        for name, why in failures:
            print(f'   {name}: {why}')
    out = a.out or f'verifier-probe-{time.strftime("%Y%m%dT%H%M%S")}.json'
    Path(out).write_text(json.dumps(
        {'set': a.which,
         'fixtures_sha256': digest,
         'hhem_threshold_frozen_at': HHEM_THRESHOLD,
         'minicheck_threshold_frozen_at': MINICHECK_THRESHOLD,
         'threshold_note': 'A REPORTING cut only. Raw scores are recorded. Changing it '
                           'after seeing these answers is tuning to the test; it must be '
                           'a separate calibration act on separate material.',
         'not_run': [{'verifier': n, 'error': e} for n, e in failures],
         'rows': rows}, indent=2))
    print(f'\nrecorded: {out}')


if __name__ == '__main__':
    main()
