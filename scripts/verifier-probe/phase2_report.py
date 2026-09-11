#!/usr/bin/env python3
"""
RC-GEN-01 · PHASE 2 — prospective three-way result.

⭐ THE RESEARCH QUESTION, in the founder's words:

        Can the verifier preserve possibility as possibility?

  Cleaner than "can it detect unsupported claims", because that is no longer
  quite the problem: the verifier is good at falsehood and poor at restraint.

⛔⛔ 7/17 = 41% IS A HISTORICAL REFERENCE, NOT A THRESHOLD.
That figure came from RETROSPECTIVE discovery material — 17 cases scraped out of
six corpora built to ask a different question. This run is the FIRST PROSPECTIVE
measurement of the phenomenon. The result stands on its own with its own
interval; the earlier estimate is printed beside it, labelled, and nothing is
"beaten".
"""
import argparse, collections, json, math, sys
from pathlib import Path

HISTORICAL = (7, 17)          # stage 1, retrospective, descriptive only
SEEDED_DOMAIN = 'time'        # the prompt's worked example lives here
MIN_N_DOMAIN = 5


def wilson(k, n, z=1.959964):
    """95% Wilson score interval — honest at n=30 where the normal approximation
    is not. Returns (low, high)."""
    if not n:
        return (0.0, 1.0)
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (max(0.0, c - h), min(1.0, c + h))


def band(k, n, label):
    lo, hi = wilson(k, n)
    return (f'  {label:<34}{k}/{n}'
            + (f' = {k / n:.0%}   95% CI [{lo:.0%}, {hi:.0%}]' if n else ''))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fixtures',
                    default=str(Path(__file__).with_name('fixtures-triples.json')))
    ap.add_argument('results', nargs='+', metavar='verifier-probe-*.json')
    a = ap.parse_args()

    if not Path(a.fixtures).exists():
        sys.exit(f'triples corpus not present at {a.fixtures}')
    doc = json.load(open(a.fixtures))
    truth = {c['id']: c for c in doc['cases']}

    rows = {}
    for p in a.results:
        d = json.load(open(p))
        for r in d.get('rows', d.get('results', [])):
            if r['id'] in truth and r['verifier'] == 'deberta':
                rows[r['id']] = r
    if not rows:
        sys.exit('no DeBERTa judgements over the triples corpus in these files')

    print(f'PHASE 2 — can the verifier preserve possibility as possibility?')
    print(f'  corpus      {len(truth)} cases   joined {len(rows)}')
    if len(rows) < len(truth):
        miss = sorted(set(truth) - set(rows))
        print(f'  ⚠️ {len(miss)} cases unjudged: {", ".join(miss[:10])}'
              f'{" …" if len(miss) > 10 else ""}')

    # ---- PRIMARY: the plausible-neutral class, standing on its own ---------
    pn = {i: r for i, r in rows.items()
          if truth[i]['expected_three_way'] == 'neutral_plausible'}
    calls = collections.Counter(r.get('raw_label', '?') for r in pn.values())
    n = len(pn)
    print(f'\n{"=" * 74}\n⭐ PRIMARY — plausible-but-unlicensed claims (n={n})')
    print(band(calls['neutral'], n, 'possibility PRESERVED (neutral)'))
    print(band(calls['entailment'], n, '⛔ promoted to `entailment`'))
    print(band(calls['contradiction'], n, 'other misclassification'))
    print(f'\n  historical reference (NOT a threshold, NOT compared):')
    print(f'    stage 1, retrospective discovery material'
          f'   {HISTORICAL[0]}/{HISTORICAL[1]} preserved')
    print('    ⛔ 17 cases scraped from corpora built for another question.'
          ' This run\n       is the first prospective measurement and is not'
          ' being scored against it.')

    # ---- the other two classes, for the contrast that matters -------------
    print(f'\n{"=" * 74}\nCONTRAST — how the other two classes fared')
    for kind, lab in (('contradicted', 'contradicted'), ('entailed', 'entailed')):
        sub = {i: r for i, r in rows.items()
               if truth[i]['expected_three_way'] == kind}
        c = collections.Counter(r.get('raw_label', '?') for r in sub.values())
        want = {'contradicted': 'contradiction', 'entailed': 'entailment'}[kind]
        print(band(c[want], len(sub), f'{lab} called `{want}`'))
    print('\n  ⭐ If contradictions are handled well while plausible-neutral claims'
          ' are not,\n     that is the distinction: falsehood detection is easier'
          ' than restraint\n     in the face of plausible inference.')

    # ---- per domain: directional only, and `time` quarantined -------------
    print(f'\n{"=" * 74}\nBY DOMAIN — directional only; no domain is promoted from n=3')
    per = collections.defaultdict(collections.Counter)
    for i, r in pn.items():
        per[truth[i]['domain']][r.get('raw_label', '?')] += 1
    for dom in sorted(per):
        c = per[dom]
        tot = sum(c.values())
        seed = '  ⚠️ SEEDED BY THE PROMPT EXAMPLE' if dom == SEEDED_DOMAIN else ''
        flag = '' if tot >= MIN_N_DOMAIN else '  (n<5 — directional)'
        print(f'  {dom:<22} preserved {c["neutral"]}/{tot}'
              f'  promoted {c["entailment"]}/{tot}{flag}{seed}')

    clean = {i: r for i, r in pn.items() if truth[i]['domain'] != SEEDED_DOMAIN}
    cc = collections.Counter(r.get('raw_label', '?') for r in clean.values())
    print(f'\n  ⭐ THE NINE UNSEEDED DOMAINS — the stronger generalization evidence')
    print(band(cc['neutral'], len(clean), 'possibility preserved'))
    print(band(cc['entailment'], len(clean), 'promoted to `entailment`'))

    print('\n⛔ Predeclared readings are in the protocol document and were'
          ' committed\n   before this ran. Read them there, not from this output.')


if __name__ == '__main__':
    main()
