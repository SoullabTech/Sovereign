#!/usr/bin/env python3
"""
RC-GEN-01 · PHASE 2 STAGE 1 — retrospective three-way map.

⛔⛔ DESCRIPTIVE ONLY. The five corpora were built to ask a BINARY question
("is this claim supported?"). None was designed around the distinction this
script measures. What comes out is a map for designing the phase-2 corpus and
is NEVER evidence for a phase-2 conclusion. A number here cannot promote
anything.

It joins two things that already exist and re-runs no model:
  · three-way ground truth   from an adjudicator blind to every model output
  · DeBERTa's own 3-way call  already written as `raw_label` into every result
                              file this lane has ever produced

⭐ THE QUESTION IT EXISTS TO ASK:
    Among claims that are PLAUSIBLE BUT UNLICENSED — compatible with the
    premise, tempting to believe, simply not established — how often does the
    verifier answer `entailment` rather than `neutral`?
    That is the shape of mistaking what is possible for what is known.

⚠️ MiniCheck and HHEM emit one support score and CANNOT express
contradicted-vs-neutral. They are still scored here on the plausible-neutral
items alone, where the binary answer is meaningful: saying "supported" of a
merely plausible claim is the same error wearing binary clothes.
"""
import argparse, collections, json, sys
from pathlib import Path

DANGEROUS = 'neutral·plausible'


def bucket(a):
    if a['three_way'] == 'contradicted':
        return 'contradicted'
    return DANGEROUS if a.get('plausible') else 'neutral·arbitrary'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--adjudication',
                    default=str(Path(__file__).with_name('three-way-adjudication.json')))
    ap.add_argument('results', nargs='+', metavar='verifier-probe-*.json')
    a = ap.parse_args()

    if not Path(a.adjudication).exists():
        sys.exit(f'three-way ground truth not present at {a.adjudication}\n'
                 '  The blind adjudication has not been produced and committed yet.\n'
                 '  ⛔ Nothing is wrong with the results you have — this instrument\n'
                 '     simply has one of its two inputs missing, and it will not\n'
                 '     substitute a guess for it.')
    adj_doc = json.load(open(a.adjudication))
    adj = {(c['set'], c['id']): c for c in adj_doc['cases']}
    print(f"three-way ground truth   {len(adj)} cases")
    print(f"  adjudicator            {adj_doc.get('adjudicator', '?')}")
    dis = [k for k, v in adj.items() if v.get('disagrees_with_expected')]
    print(f"  ⚠️ flagged as possibly mislabelled: {len(dis)}"
          + (f"  {', '.join(f'{s}/{i}' for s, i in dis)}" if dis else ''))

    rows = []
    for p in a.results:
        d = json.load(open(p))
        st = d.get('set', '?')
        for r in d.get('rows', d.get('results', [])):
            k = (st, r['id'])
            if k in adj:
                rows.append((k, r))
    if not rows:
        sys.exit('no result rows joined to the adjudication — pass probe result JSON')

    seen = {}
    for k, r in rows:                       # collapse repeat runs of the same case
        seen[(k, r['verifier'])] = r
    print(f"joined                   {len(seen)} verifier-judgements\n")

    # ---- DeBERTa, three-way against three-way -----------------------------
    deb = {k: r for (k, v), r in seen.items() if v == 'deberta'}
    if deb:
        print('=' * 74)
        print('DeBERTa — its own 3-way call against blind 3-way ground truth')
        tab = collections.defaultdict(collections.Counter)
        for k, r in deb.items():
            tab[bucket(adj[k])][r.get('raw_label', '?')] += 1
        print(f"  {'ground truth':<20}{'-> entailment':>14}{'neutral':>10}"
              f"{'contradiction':>15}")
        for b in ('contradicted', DANGEROUS, 'neutral·arbitrary'):
            c = tab.get(b)
            if not c:
                continue
            n = sum(c.values())
            print(f"  {b:<20}{c['entailment']:>14}{c['neutral']:>10}"
                  f"{c['contradiction']:>15}    (n={n})")
        dang = tab.get(DANGEROUS)
        if dang:
            n = sum(dang.values())
            print(f"\n  ⭐ THE NUMBER THIS EXISTS FOR")
            print(f"     plausible-but-unlicensed called `entailment`: "
                  f"{dang['entailment']}/{n}"
                  f" = {dang['entailment'] / n:.0%}")
            print(f"     correctly called `neutral`:                   "
                  f"{dang['neutral']}/{n} = {dang['neutral'] / n:.0%}")
            if n < 5:
                print(f"     ⚠️ n={n} — too few to read as a rate.")
            if dang['contradiction']:
                print(f"     ⚠️ and {dang['contradiction']} called `contradiction`, which"
                      f" is right for the wrong reason")
        else:
            print('\n  ⚠️ NO plausible-neutral cases in this material at all. The'
                  ' corpora\n     were built for a different question and do not'
                  ' contain the one\n     phase 2 is about. That is itself the'
                  ' finding.')

        # per set — the composition lesson, applied before anyone asks
        print('\n  PER SET (a pooled figure is an average)')
        per = collections.defaultdict(collections.Counter)
        for k, r in deb.items():
            if bucket(adj[k]) == DANGEROUS:
                per[k[0]][r.get('raw_label', '?')] += 1
        for st, c in sorted(per.items()):
            n = sum(c.values())
            print(f"    {st:<16} entailment {c['entailment']}/{n}"
                  + ('   ⚠️ n<5' if n < 5 else ''))
        if not per:
            print('    (none)')

    # ---- binary verifiers, scored only where binary is meaningful ---------
    for v in sorted({vv for (_, vv) in seen} - {'deberta'}):
        sub = {k: r for (k, vv), r in seen.items() if vv == v
               and bucket(adj[k]) == DANGEROUS}
        if not sub:
            continue
        wrong = sum(1 for r in sub.values() if r['observed'] == 'entailed')
        print(f"\n{'=' * 74}\n{v} — plausible-but-unlicensed only")
        print(f"  ⛔ cannot express contradicted-vs-neutral; scored here because"
              f" calling a\n     merely plausible claim `supported` is the same"
              f" error in binary form")
        print(f"  called supported: {wrong}/{len(sub)}"
              + (f' = {wrong / len(sub):.0%}' if len(sub) >= 5
                 else f'  ⚠️ n={len(sub)} — too few to read as a rate'))

    print('\n⛔ DESCRIPTIVE. NOT A GATE. NOT AUTHORIZED. This maps the territory'
          ' for a\n   prospective corpus; it cannot promote or retire anything by'
          ' itself.')


if __name__ == '__main__':
    main()
