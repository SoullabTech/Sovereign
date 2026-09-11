#!/usr/bin/env python3
"""
RC-GEN-01 · BOUNDARY-SURVIVAL CHECK — deterministic, no model.

⭐ THE RULE IT IMPLEMENTS, stated by the founder:

    A CLAIM CANNOT BECOME MORE GENERAL THAN ITS EVIDENCE.

If the source carries limiting language — `until` · `before` · `twice` · `during` ·
`formerly` · `no longer` · `only` · a bare past date — and the proposed claim drops
it, then an entailment verdict of ENTAILED is NOT SUFFICIENT. The claim is held,
refused, or sent to a second verifier.

⛔⛔ THIS IS AN INSTRUMENT, NOT A GATE, AND NOT AN AUTHORIZED COMPONENT. It lives in
the probe lane, imports nothing from MAIA, and decides nothing. It exists to answer
one measurable question before anyone designs around it:

    Does a deterministic boundary check actually catch the cases DeBERTa widens,
    and what does it cost in false alarms?

⭐ WHY DETERMINISTIC IS ATTRACTIVE HERE: a rule cannot suddenly decide that
`until 2019` no longer matters. ⛔ WHY IT IS NOT SUFFICIENT: it is lexical. It cannot
tell that `in 2014 ... and runs it still` carries its own boundary AND its own
release, so it will over-flag. That cost is measured below rather than assumed away.

    python3 scripts/verifier-probe/boundary_check.py            # falsify on all sets
    python3 scripts/verifier-probe/boundary_check.py --set modifier
"""
import argparse, json, re, sys, collections
from pathlib import Path

SETS = {
    'as-derived': 'fixtures.json',
    'detector-blind': 'fixtures-detector.json',
    'blind': 'fixtures-blind.json',
    'scope': 'fixtures-scope.json',
    'modifier': 'fixtures-modifier.json',
}

# ⛔ Every pattern is a LIMITER: language that narrows when, how often, how long, or
# under what condition a relation holds. ⭐ Grouped so the report can say WHICH kind
# of boundary is at risk, not merely that one is.
LIMITERS = {
    'cessation':  r"\b(until|before|no longer|formerly|ceased|stopped|gave up|"
                  r"resigned|retired|left|used to|ended|closed|cut)\b",
    'frequency':  r"\b(once|twice|three times|four times|\d+ times|occasionally|"
                  r"seldom|rarely|sometimes|several)\b",
    'duration':   r"\b(during|while|for \w+ (years|months|weeks|days)|"
                  r"through(out)?|period)\b",
    'past_date':  r"\b(in (19|20)\d\d|last (season|year|month|week)|"
                  r"on (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))\b",
    'modality':   r"\b(can|could|may|might|will|would|intends?|plans?|hopes?)\b",
    'negation':   r"\b(not|never|no one|declined|refused|took no part)\b",
    'condition':  r"\b(if|unless|provided that)\b",
}

# ⭐ RELEASE MARKERS. Language that explicitly re-opens a bound relation into the
# present. ⛔ Without these the check flags "took over in 2014 and RUNS IT STILL" as
# a dropped boundary, which is exactly backwards: the source RELEASED the limit.
RELEASES = r"\b(still|since|ever since|continues?|ongoing|each|every|always|" \
           r"has been|have been|to this day)\b"


def fisher_exact_2x2(a, b, c, d):
    """
    Two-sided Fisher exact test on [[a, b], [c, d]]. Written out rather than
    imported so the instrument keeps no dependency beyond the standard library —
    every other number it prints is countable by hand, and this one should be
    reproducible the same way.
    """
    from math import comb
    n = a + b + c + d
    r1, r2, c1 = a + b, c + d, a + c
    if not (r1 and r2 and c1 and (n - c1)):
        return 1.0
    pr = lambda x: comb(r1, x) * comb(r2, c1 - x) / comb(n, c1)
    obs = pr(a)
    return min(1.0, sum(pr(x) for x in range(max(0, c1 - r2), min(r1, c1) + 1)
                        if pr(x) <= obs + 1e-12))


def rule_digest():
    """
    ⭐⭐ THE FROZEN THING IS THE RULE, NOT THE FILE.

    ⛔ I RECORDED A FREEZE HASH THAT NEVER MATCHED THE COMMITTED FILE. `c45d9f62…`
    was computed BEFORE the `detector-blind` set entry, the self-hash and the
    conditional table were added; the committed file hashed `6c5a8958…`, which is what
    the founder's run printed. Anyone checking the freeze would have found a mismatch
    and had no way to know which was authoritative.

    ⭐ THE REPAIR IS NOT A CORRECTED FILE HASH — it is hashing the right thing. The
    detection RULE is `LIMITERS` + `RELEASES` + the two functions that use them.
    Reporting can be improved without touching it, and the freeze must survive that or
    it will simply be broken again the next time a table needs a column.

    ⛔ IF THIS DIGEST CHANGES, THE DETECTOR CHANGED AND EVERY PRIOR RESULT IS STALE.
    """
    import hashlib, inspect
    parts = [repr(sorted(LIMITERS.items())), repr(RELEASES),
             inspect.getsource(limiters_in), inspect.getsource(boundary_risk)]
    return hashlib.sha256('\n'.join(parts).encode()).hexdigest()


def detector_digest():
    """
    ⛔⛔ THE DETECTOR IS FROZEN BY HASH, AND IT PRINTS ITS OWN.

    The founder's instruction: freeze it before testing it further, *otherwise we
    could unconsciously keep improving the detector against every miss until it
    perfectly recognizes the corpus that taught us what to look for.*

    ⭐ A frozen corpus tests a moving detector and proves nothing. BOTH sides of the
    experiment must be pinned, and each must be able to say which version it was.
    """
    import hashlib
    return hashlib.sha256(Path(__file__).read_bytes()).hexdigest()


def limiters_in(text):
    t = text.lower()
    return {k for k, pat in LIMITERS.items() if re.search(pat, t)}


def boundary_risk(premise, claim):
    """
    Returns (risk: bool, detail: dict).

    ⛔ RISK IS ASYMMETRIC BY DESIGN. A limiter in the PREMISE that is absent from the
    CLAIM is a widening. A limiter in the claim that is absent from the premise is a
    NARROWING, and narrowing is safe — the whole law is that a claim may not become
    MORE general than its evidence, never that it must match it exactly.
    """
    p, c = limiters_in(premise), limiters_in(claim)
    dropped = p - c
    released = bool(re.search(RELEASES, premise.lower()))
    return (bool(dropped) and not released), {
        'premise_limiters': sorted(p),
        'claim_limiters': sorted(c),
        'dropped': sorted(dropped),
        'release_marker_in_premise': released,
    }


def load(which):
    path = Path(__file__).with_name(SETS[which])
    return json.loads(path.read_text())['cases']


def evaluate(which):
    cases = load(which)
    rows = []
    for c in cases:
        risk, detail = boundary_risk(c['premise'], c['hypothesis'])
        rows.append({**c, 'risk': risk, 'detail': detail})

    # ⭐⭐ THE TWO NUMBERS THAT DECIDE WHETHER THIS IS USEFUL, AND THEY ARE NEVER
    # SUMMED. Coverage without cost is a detector that flags everything.
    neg = [r for r in rows if r['expected'] == 'not_entailed']
    pos = [r for r in rows if r['expected'] == 'entailed']
    cov = sum(r['risk'] for r in neg)
    cost = sum(r['risk'] for r in pos)

    print(f"\n{'=' * 74}\nSET  {which}   ({len(rows)} cases)")
    for r in rows:
        mark = 'RISK' if r['risk'] else '  . '
        d = ','.join(r['detail']['dropped']) or '-'
        rel = ' +release' if r['detail']['release_marker_in_premise'] else ''
        print(f"  {mark} {r['id']:<6} expect {r['expected']:<13} dropped={d}{rel}")
    print(f"\n  COVERAGE  flags {cov}/{len(neg)} of the UNLICENSED cases")
    print(f"  COST      flags {cost}/{len(pos)} of the LICENSED cases  "
          f"⛔ every one is a false alarm")
    if pos and cost == len(pos):
        print("  ⛔ FLAGS EVERY LICENSED CASE — as a router this is worthless;")
        print("     it would send the entire corpus to a second verifier.")
    return rows, cov, len(neg), cost, len(pos)


# ⛔ DeBERTa's observed misses, transcribed from the founder's runs. Used ONLY to ask
# whether this check would have covered them. Transcribed by hand, so it is named as
# such rather than presented as machine-read evidence.
DEBERTA_MISSES = {
    'blind': ['B05', 'B21'],
    'scope': ['S01', 'S03', 'S04'],
    'modifier': ['M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'V2'],
}


def against(paths):
    """
    ⭐⭐ THE QUESTION THE CALIBRATION RUN LEFT OPEN:

        Can a simple deterministic detector reliably recognize the situations in
        which DeBERTa is CONFIDENTLY UNSAFE?

    ⛔ IF YES, DeBERTa DOES NOT HAVE TO KNOW THAT IT SHOULD BE UNCERTAIN. THE
    ARCHITECTURE CAN KNOW. That is the whole point: the modifier regime is where the
    model is wrong at 0.99, so nothing it reports about itself can rescue it — but a
    lexical rule cannot be talked out of noticing `until 2019`.

    ⛔ The cross-tab is by CONFIDENCE × CORRECTNESS × FLAG, never a single number. A
    detector that flags everything scores perfectly on the cell that matters and is
    useless.
    """
    fixtures = {}
    for name, fn in SETS.items():
        for c in json.loads(Path(__file__).with_name(fn).read_text())['cases']:
            fixtures[c['id']] = c

    CONF = 0.90   # ⛔ frozen here, not chosen from the answers below
    rows = []
    for path in paths:
        d = json.loads(Path(path).read_text())
        for r in d.get('rows', []):
            c = fixtures.get(r['id'])
            if not c:
                continue
            sc = r.get('scores') or {}
            if 'threshold' in sc:
                key = next((k for k in sc if k != 'threshold'), None)
                conf = abs(sc[key] - sc['threshold']) * 2 if key else None
            else:
                vals = [v for v in sc.values() if isinstance(v, (int, float))]
                conf = max(vals) if vals else None
            if conf is None:
                continue
            risk, _ = boundary_risk(c['premise'], c['hypothesis'])
            rows.append({'verifier': r['verifier'], 'id': r['id'],
                         'set': d.get('set', '?'), 'conf': conf, 'risk': risk,
                         # ⛔ ground truth from the CURRENT fixture, not the saved row
                         'correct': r['observed'] == c['expected']})

    if not rows:
        sys.exit('no usable rows — pass probe result JSON files')

    print(f'DETECTOR RULE sha256 {rule_digest()}')
    print(f'  (file sha256 {detector_digest()} — changes with reporting; the RULE is')
    print(f'   what is frozen, and a change to it invalidates every prior result)')

    # ⛔⛔ PER SET, NOT JUST AGGREGATED. The detector was WRITTEN AFTER seeing the
    # failures in the earlier sets, so mixing them with `detector-blind` mixes
    # known-corpus discrimination with generalization and reports one number for two
    # different questions. The aggregate hid the only figure that answers the
    # founder's question.
    sets = sorted({r['set'] for r in rows})
    if len(sets) > 1:
        print('\n⭐ BY SET — `detector-blind` is the ONLY one the detector had not seen')
        for st in sets:
            for v in sorted({r['verifier'] for r in rows if r['set'] == st}):
                g = {(r['set'], r['id']): r for r in rows
                     if r['set'] == st and r['verifier'] == v}.values()
                wrong = [r for r in g if not r['correct']]
                right = [r for r in g if r['correct']]
                seen = 'UNSEEN ⭐' if st == 'detector-blind' else 'seen'
                print(f"   {st:<16} {v:<10} {seen:<9} "
                      f"errors flagged {sum(r['risk'] for r in wrong)}/{len(wrong)}   "
                      f"correct flagged {sum(r['risk'] for r in right)}/{len(right)}")

    for v in sorted({r['verifier'] for r in rows}):
        sub = [r for r in rows if r['verifier'] == v]
        seen = {}
        for r in sub:                      # one entry per (set,id): repeats collapse
            seen[(r['set'], r['id'])] = r
        sub = list(seen.values())
        cells = {}
        for conf_hi in (True, False):
            for correct in (False, True):
                g = [r for r in sub if (r['conf'] >= CONF) == conf_hi
                     and r['correct'] == correct]
                cells[(conf_hi, correct)] = (sum(r['risk'] for r in g), len(g))
        print(f'\n{"=" * 74}\nBOUNDARY DETECTOR vs {v}   '
              f'(confidence cut frozen at {CONF})')
        print('                              flagged / total')
        print(f"  ⛔ CONFIDENT AND WRONG        "
              f"{cells[(True, False)][0]}/{cells[(True, False)][1]}"
              f"     <- the cell that decides it")
        print(f"     confident and right       {cells[(True, True)][0]}/{cells[(True, True)][1]}"
              f"     <- cost: these get held too")
        print(f"     hesitant and wrong        {cells[(False, False)][0]}/{cells[(False, False)][1]}")
        print(f"     hesitant and right        {cells[(False, True)][0]}/{cells[(False, True)][1]}")
        cw, cwn = cells[(True, False)]
        cr, crn = cells[(True, True)]
        if cwn:
            print(f"\n  -> {cw} of {cwn} confidently-wrong answers would be HELD by a rule")
            print(f"     that consults no probability at all")
            # ⛔ FOURTH OCCURRENCE OF THE SAME DEFECT, in a cell I had not guarded.
            # On MiniCheck's first run this cell was 1/1 and printed as though it
            # were a finding. A ratio out of one case is a particular observation
            # wearing a verdict's clothes.
            if cwn < 5:
                print(f"  ⚠️ n={cwn} — TOO FEW confidently-wrong cases to read this as a rate.")
        # ⛔ The 'no discrimination' verdict needs a cell big enough to carry it.
        # On HHEM's first real run this fired on 1/1 — a warning about a single case,
        # stated as a property of the detector.
        if crn >= 5 and cr == crn:
            print('  ⛔ AND IT FLAGS EVERY CONFIDENT CORRECT ANSWER TOO — no discrimination.')
        elif crn and cr == crn:
            print(f'  ⚠️ flags every confident-correct case, but n={crn} — too few to conclude.')
        if cwn == 0:
            print('  ⚠️ NO CONFIDENTLY-WRONG CASES AT ALL at this cut. The decisive cell is')
            print('     EMPTY, so this table says nothing about the detector for this')
            print('     verifier — it says the verifier is never confident when wrong.')
    # ⭐⭐ THE CONDITIONAL TABLE — the founder's precise question, and the only one
    # that decides whether routing is worth its cost.
    #
    # ⛔ NOT "is MiniCheck accurate?" The 37 routed cases are going SOMEWHERE. The
    # question is whether they are being sent to a witness with COMPLEMENTARY errors
    # or thrown into another equally unreliable machine.
    #
    #   desirable   DeBERTa wrong inside the risk regime -> the other is disproportionately RIGHT
    #   desirable   detector routes a correct DeBERTa answer -> the other PRESERVES it
    #   ⛔ bad      both wrong on the same cases -> not independent; the deterministic
    #               layer becomes much more important and routing buys nothing
    verifiers = sorted({r['verifier'] for r in rows})
    if len(verifiers) >= 2:
        by = {}
        for r in rows:
            by.setdefault((r['set'], r['id']), {})[r['verifier']] = r
        for i, a in enumerate(verifiers):
            for b in verifiers[i + 1:]:
                shared = [(k, v) for k, v in by.items() if a in v and b in v]
                routed = [(k, v) for k, v in shared if v[a]['risk']]
                if not routed:
                    print(f'\n⚠️ {a} vs {b}: no shared ROUTED cases — nothing to condition on.')
                    continue
                cell = lambda ac, bc: sum(1 for _, v in routed
                                          if v[a]['correct'] == ac and v[b]['correct'] == bc)
                print(f'\n{"=" * 74}')
                print(f'CONDITIONAL TABLE — {len(routed)} DETECTOR-ROUTED cases only')
                print(f'  (shared coverage: {len(shared)} cases seen by both {a} and {b})')
                print(f'\n                        {b} right   {b} wrong')
                print(f'  {a} wrong           {cell(False, True):^11}{cell(False, False):^11}'
                      f'  <- ⭐ RESCUED / ⛔ SHARED BLIND SPOT')
                print(f'  {a} right           {cell(True, True):^11}{cell(True, False):^11}'
                      f'  <- preserved / ⛔ DISRUPTED')
                rescued, shared_blind = cell(False, True), cell(False, False)
                preserved, disrupted = cell(True, True), cell(True, False)
                if rescued + shared_blind:
                    print(f'\n  -> of {rescued + shared_blind} routed cases {a} got WRONG, '
                          f'{b} got {rescued} RIGHT')
                if preserved + disrupted:
                    print(f'  -> of {preserved + disrupted} routed cases {a} got RIGHT, '
                          f'{b} PRESERVED {preserved} and DISRUPTED {disrupted}')
                # ⛔⛔ THIRD OCCURRENCE OF THE SAME DEFECT IN MY OWN INSTRUMENTS.
                # This printed "NOT INDEPENDENT" on n=2. Two cases cannot establish
                # that two models share a blind spot — it is the particular
                # observation turned into a general claim, which is the exact
                # epistemic sin this lane studies.
                MIN_N = 5
                if shared_blind and not rescued and shared_blind + rescued >= MIN_N:
                    print('  ⛔ NOT INDEPENDENT on this evidence — the second witness fails')
                    print('     exactly where the first does. Routing buys nothing here.')
                elif shared_blind and not rescued:
                    print(f'  ⚠️ no rescues, but only {shared_blind + rescued} routed errors'
                          f' were shared — TOO FEW to conclude anything about independence.')

                # ⭐⭐ THE COMPLEMENT — the gap in my own instrument.
                # The routed table alone cannot distinguish "the detector SELECTS
                # cases the second witness can rescue" from "the second witness is
                # simply better, everywhere". Those recommend different
                # architectures: the first justifies routing, the second says ask
                # both always and drop the router. The only way to tell is to run
                # the same table on the cases the detector did NOT route.
                unrouted = [(k, v) for k, v in shared if not v[a]['risk']]
                if unrouted:
                    uc = lambda ac, bc: sum(1 for _, v in unrouted
                                            if v[a]['correct'] == ac and v[b]['correct'] == bc)
                    u_res, u_blind = uc(False, True), uc(False, False)
                    u_pres, u_disr = uc(True, True), uc(True, False)
                    print(f'\n  COMPLEMENT — the {len(unrouted)} cases the detector did NOT route')
                    print(f'                        {b} right   {b} wrong')
                    print(f'    {a} wrong         {u_res:^11}{u_blind:^11}')
                    print(f'    {a} right         {u_pres:^11}{u_disr:^11}')
                    # ⭐ HOW MANY OF THIS VERIFIER'S ERRORS DOES THE REGIME CONTAIN?
                    # If nearly all of them, the inside/outside comparison below is
                    # underpowered BY THE DETECTOR'S OWN SUCCESS — there is barely an
                    # outside left to compare against. That is a fact about coverage,
                    # ⛔ not a defect in the test and not a licence to skip it.
                    err_in, err_out = rescued + shared_blind, u_res + u_blind
                    if err_in + err_out:
                        print(f'    -> the risk regime contains {err_in} of {a}\'s '
                              f'{err_in + err_out} errors '
                              f'({err_in / (err_in + err_out):.0%}), at a cost of '
                              f'{preserved + disrupted} of its '
                              f'{preserved + disrupted + u_pres + u_disr} correct answers')
                    # ⭐⭐ WHAT IS AGREEMENT WORTH? Two verifiers agreeing is the thing
                    # a majority vote would trust. Inside the risk regime they can be
                    # jointly wrong — and a wrong answer that two witnesses agree on is
                    # WORSE than one witness's wrong answer, because it arrives with
                    # manufactured corroboration.
                    for label, rr, ww in (('INSIDE  the risk regime', preserved, shared_blind),
                                          ('OUTSIDE the risk regime', u_pres, u_blind)):
                        if rr + ww >= MIN_N:
                            print(f'    agreement precision {label}  {rr}/{rr + ww} '
                                  f'= {rr / (rr + ww):.0%}')
                        elif rr + ww:
                            print(f'    agreement precision {label}  n={rr + ww} — too few')
                    # ⭐ THE DISRUPTION AXIS. Rescue is conditional on the first
                    # verifier being WRONG, which is rare outside the regime and so
                    # usually unanswerable. Disruption is conditional on it being
                    # RIGHT — a far larger population on both sides, so this half of
                    # the comparison is normally the half that CAN be answered.
                    for label, ok, bad in (('INSIDE ', preserved, disrupted),
                                           ('OUTSIDE', u_pres, u_disr)):
                        if ok + bad >= MIN_N:
                            print(f'    disruption rate {label} {bad}/{ok + bad} '
                                  f'= {bad / (ok + bad):.0%}')
                        elif ok + bad:
                            print(f'    disruption rate {label} n={ok + bad} — too few')

                # ⭐⭐ UNCONDITIONAL — the founder's scope caveat, made measurable.
                # The routed table is computed on a sample the detector SELECTED for
                # particular linguistic regimes, so it characterizes dependence INSIDE
                # that selection and nothing wider. This table uses every shared case,
                # selected by nothing, and is what speaks to dependence in general.
                # ⛔ Still only across THIS corpus, which was itself built to press on
                # hard distinctions — it is not a claim about text at large.
                gc = lambda ac, bc: sum(1 for _, v in shared
                                        if v[a]['correct'] == ac and v[b]['correct'] == bc)
                g_res, g_blind, g_pres, g_disr = (gc(False, True), gc(False, False),
                                                  gc(True, True), gc(True, False))
                if min(g_res + g_blind, g_pres + g_disr) >= MIN_N:
                    gp = fisher_exact_2x2(g_res, g_blind, g_pres, g_disr)
                    print(f'\n  UNCONDITIONAL — all {len(shared)} shared cases, no selection')
                    print(f'                        {b} right   {b} wrong')
                    print(f'    {a} wrong         {g_res:^11}{g_blind:^11}')
                    print(f'    {a} right         {g_pres:^11}{g_disr:^11}')
                    print(f'    {b} accuracy where {a} is WRONG  '
                          f'{g_res / (g_res + g_blind):.0%}')
                    print(f'    {b} accuracy where {a} is RIGHT  '
                          f'{g_pres / (g_pres + g_disr):.0%}')
                    print(f'    Fisher exact, two-sided  p = {gp:.2e}' if gp < 1e-3
                          else f'    Fisher exact, two-sided  p = {gp:.4f}')
                    if u_res + u_blind and rescued + shared_blind:
                        inside = rescued / (rescued + shared_blind)
                        outside = u_res / (u_res + u_blind)
                        print(f'    rescue rate INSIDE the risk regime  {rescued}/'
                              f'{rescued + shared_blind} = {inside:.0%}')
                        print(f'    rescue rate OUTSIDE it              {u_res}/'
                              f'{u_res + u_blind} = {outside:.0%}')
                        if rescued + shared_blind >= MIN_N and u_res + u_blind >= MIN_N:
                            if inside > outside:
                                print('    -> routing SELECTS rescuable errors: the second witness')
                                print('       does better exactly where the first is untrustworthy.')
                            else:
                                print('    ⛔ routing does NOT select rescuable errors. The second')
                                print('       witness is no better inside the regime than outside,')
                                print('       so this buys nothing the router was supposed to buy.')
                        else:
                            print('    ⚠️ one side has fewer than 5 errors — no comparison drawn.')

                # ⭐ ARE THE ERRORS INDEPENDENT? If they were, the second witness's
                # accuracy would not depend on whether the first was right. Fisher's
                # exact on the routed 2x2 answers exactly that, and a small p means
                # the blind spots OVERLAP — partial dependence, not two free
                # witnesses. ⛔ This tests correlation only. It says nothing about
                # which verifier is better, and nothing about production.
                if min(rescued + shared_blind, preserved + disrupted) >= MIN_N:
                    pv = fisher_exact_2x2(rescued, shared_blind, preserved, disrupted)
                    acc_w = rescued / (rescued + shared_blind)
                    acc_r = preserved / (preserved + disrupted)
                    print(f'\n  ERROR INDEPENDENCE (Fisher exact, two-sided)  p = {pv:.4f}')
                    print(f'    {b} accuracy where {a} is WRONG  {acc_w:.0%}')
                    print(f'    {b} accuracy where {a} is RIGHT  {acc_r:.0%}')
                    if pv < 0.05 and acc_w < acc_r:
                        print(f'    ⛔ PARTIALLY DEPENDENT — {b} is significantly worse on exactly')
                        print(f'       the cases {a} fails. Real rescues, shared blind spots too.')
                    elif pv >= 0.05:
                        print('    -> no detectable correlation at this n. NOT proof of')
                        print('       independence — absence of evidence at this sample size.')

    print('\n⛔ NOT A GATE. NOT AUTHORIZED. A measurement, not a component.')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--set', dest='which', choices=sorted(SETS), default=None)
    ap.add_argument('--against', nargs='+', metavar='RESULT.json',
                    help='cross-tab the detector against a verifier\'s confidence')
    a = ap.parse_args()

    if a.against:
        against(a.against)
        return

    which = [a.which] if a.which else ['as-derived', 'blind', 'scope', 'modifier']
    tot_cov = tot_neg = tot_cost = tot_pos = 0
    caught = collections.defaultdict(list)
    for w in which:
        rows, cov, n_neg, cost, n_pos = evaluate(w)
        tot_cov += cov; tot_neg += n_neg; tot_cost += cost; tot_pos += n_pos
        by_id = {r['id']: r for r in rows}
        for mid in DEBERTA_MISSES.get(w, []):
            if mid in by_id:
                caught[w].append((mid, by_id[mid]['risk']))

    print(f"\n{'=' * 74}\nACROSS ALL SETS RUN")
    print(f"  COVERAGE  {tot_cov}/{tot_neg} unlicensed cases flagged")
    print(f"  COST      {tot_cost}/{tot_pos} licensed cases flagged (false alarms)")

    if caught:
        print("\n  ⭐ WOULD IT HAVE COVERED DeBERTa'S ACTUAL MISSES?")
        print("     (miss ids transcribed by hand from the founder's runs)")
        hit = miss = 0
        for w, items in caught.items():
            for mid, risk in items:
                print(f"     {w:<10} {mid:<5} {'FLAGGED' if risk else '⛔ NOT FLAGGED'}")
                hit += risk; miss += (not risk)
        print(f"     -> {hit} of {hit + miss} known misses would have been held")

    print("\n⛔ NOT A GATE. NOT AUTHORIZED. A measurement, not a component.")


if __name__ == '__main__':
    main()
