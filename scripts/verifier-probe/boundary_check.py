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
        if crn and cr == crn:
            print('  ⛔ AND IT FLAGS EVERY CONFIDENT CORRECT ANSWER TOO — no discrimination.')
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
