#!/usr/bin/env python3
"""
RC-GEN-01 · PHASE 3 — terse natural premises.

⭐⭐ PHASE 3 TESTS ECOLOGICAL ROBUSTNESS, NOT A CAUSAL MECHANISM.
Brevity, sibling removal and single-hypothesis presentation moved together, so a
change here supports only "performance changes under the natural terse
single-hypothesis condition". ⛔ It CANNOT establish that implicitness caused
anything. The matched terse/expanded experiment would earn that.

⛔ NO OVERALL ACCURACY HEADLINE. The 40/10/10 prevalence was designed, so an
overall figure would describe the design rather than the world. Entailed and
contradicted cases are CONTROLS, not constituents of a real-world accuracy
estimate.

⛔ Ground truth is the INDEPENDENT ADJUDICATOR's label. The author's `intended`
is never operative; it appears only in the calibration matrix.
"""
import argparse, collections, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from phase2_report import wilson                                  # noqa: E402

AUTHOR_FLAGGED = ('U25', 'U50', 'U01', 'U40', 'U39')   # author's own hesitations
PERSON_SHIFT = ('U30', 'U32', 'U41')                   # adjudicator: "a decision,
                                                       # not a reading"


def band(k, n, label, pad=34):
    lo, hi = wilson(k, n)
    return (f'  {label:<{pad}}{k}/{n}'
            + (f' = {k / n:.0%}   95% CI [{lo:.0%}, {hi:.0%}]' if n else ''))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fixtures',
                    default=str(Path(__file__).with_name('fixtures-terse.json')))
    ap.add_argument('--truth',
                    default=str(Path(__file__).with_name('terse-adjudication.json')))
    ap.add_argument('results', nargs='+', metavar='verifier-probe-*.json')
    a = ap.parse_args()

    for f in (a.fixtures, a.truth):
        if not Path(f).exists():
            sys.exit(f'missing input: {f}')
    src = {c['id']: c for c in json.load(open(a.fixtures))['cases']}
    adj = {c['id']: c for c in json.load(open(a.truth))['cases']}

    rows = {}
    for p in a.results:
        d = json.load(open(p))
        for r in d.get('rows', d.get('results', [])):
            if r['id'] in adj and r['verifier'] == 'deberta':
                rows[r['id']] = r
    if not rows:
        sys.exit('no DeBERTa judgements over the terse corpus in these files')

    print('PHASE 3 — can the verifier preserve possibility in ordinary speech?')
    print(f'  corpus   {len(adj)} cases   joined {len(rows)}')
    if len(rows) < len(adj):
        print(f'  ⚠️ {len(adj) - len(rows)} unjudged: '
              f'{", ".join(sorted(set(adj) - set(rows)))}')
    print('  ⛔ ecological robustness, NOT a causal test of explicitness')

    # ---- PRIMARY ----------------------------------------------------------
    pn = {i: r for i, r in rows.items()
          if adj[i]['three_way'] == 'neutral_plausible'}
    c = collections.Counter(r.get('raw_label', '?') for r in pn.values())
    n = len(pn)
    print(f'\n{"=" * 74}\n⭐ PRIMARY — adjudicator-confirmed neutral·plausible (n={n})')
    print(band(c['neutral'], n, 'possibility PRESERVED'))
    print(band(c['entailment'], n, '⛔ promoted to `entailment`'))
    print(band(c['contradiction'], n, 'called `contradiction`'))

    # ---- SENSITIVITY: hard cases shown, never removed ----------------------
    hard = [i for i in pn if adj[i]['hard_to_call']]
    easy = {i: r for i, r in pn.items() if not adj[i]['hard_to_call']}
    ec = collections.Counter(r.get('raw_label', '?') for r in easy.values())
    print(f'\n  SENSITIVITY — excluding items the adjudicator found hard to label')
    print(band(ec['neutral'], len(easy), 'possibility preserved', pad=32))
    if n and len(easy):
        gap = ec['neutral'] / len(easy) * 100 - c['neutral'] / n * 100
        print(f'    primary {c["neutral"]}/{n} = {c["neutral"] / n:.0%}   ·'
              f'   sensitivity {ec["neutral"]}/{len(easy)}'
              f' = {ec["neutral"] / len(easy):.0%}   ·   difference {gap:+.1f} pp')
    print(f'    hard-to-label in the primary: {len(hard)}'
          + (f' — {", ".join(sorted(hard))}' if hard else ''))
    print('    ⛔ Shown, never removed. Difficulty is evidence, not a licence to'
          ' clean\n       the corpus. No threshold is declared for "material".')

    # ---- AUTHOR CALIBRATION ------------------------------------------------
    print(f'\n{"=" * 74}\nAUTHOR CALIBRATION — intent vs independent label (counts only)')
    order = ('entailed', 'contradicted', 'neutral_plausible', 'neutral_arbitrary')
    print(f'  {"intended":<16}' + ''.join(f'{k.replace("neutral_", "n·"):>20}'
                                          for k in order))
    for want in ('open', 'entailed', 'contradicted'):
        r = collections.Counter(adj[i]['three_way'] for i in src
                                if src[i]['intended'] == want)
        print(f'  {want:<16}' + ''.join(f'{r[k]:>20}' for k in order))
    print('\n  ⭐ When a writer tries to leave something open in terse natural'
          ' language,\n     how often do they actually succeed? Counts only — no'
          ' score.')

    # ---- CONTROLS, labelled as controls ------------------------------------
    print(f'\n{"=" * 74}\nCONTROLS — not weighted into any overall figure')
    for kind, want in (('entailed', 'entailment'), ('contradicted', 'contradiction')):
        sub = {i: r for i, r in rows.items() if adj[i]['three_way'] == kind}
        k = sum(1 for r in sub.values() if r.get('raw_label') == want)
        print(band(k, len(sub), f'{kind} called `{want}`'))
    print('\n  ⚠️ THREE CONTRADICTED CONTROLS ARE CONTESTED BY THEIR OWN'
          ' ADJUDICATOR:')
    for i in PERSON_SHIFT:
        if i in rows:
            print(f'    {i}  adjudicator label contradicted · DeBERTa'
                  f' `{rows[i].get("raw_label")}`')
    print('     First-person premise against a third-person hypothesis. The'
          ' adjudicator\n     took the coreferential reading and called it "a'
          ' decision, not a reading".\n     ⛔ A verifier that declines that'
          ' reading is not obviously wrong. Read the\n     contradiction control'
          ' with these three in view.')

    # ---- casewise watches --------------------------------------------------
    print(f'\n{"=" * 74}\nAUTHOR-FLAGGED CASES — casewise, never a rate')
    for i in AUTHOR_FLAGGED:
        if i not in adj:
            continue
        h = '⭐ adjudicator ALSO hesitated' if adj[i]['hard_to_call'] \
            else 'adjudicator did not hesitate'
        d = rows[i].get('raw_label', '—') if i in rows else '—'
        print(f'  {i}  adjudicated {adj[i]["three_way"]:<18} {h:<30} DeBERTa `{d}`')

    # ---- world-knowledge completion: casewise, never a class yet -----------
    promoted = sorted(i for i, r in pn.items() if r.get('raw_label') == 'entailment')
    print(f'\n{"=" * 74}\nPROMOTED CASES — every one, for inspection')
    if not promoted:
        print('  none')
    for i in promoted:
        print(f'  {i}  [{src[i]["domain"]}]  {src[i]["premise"]}')
        print(f'        -> {src[i]["hypothesis"]}')
    print('\n  ⛔ WORLD-KNOWLEDGE COMPLETION (T078 was the first) remains a'
          ' CASEWISE\n     OBSERVATION. It becomes a class when enough examples'
          ' support one, and\n     not before. Read these individually.')

    # ---- domains, descriptive ---------------------------------------------
    print(f'\n{"=" * 74}\nBY DOMAIN — descriptive only')
    per = collections.defaultdict(collections.Counter)
    for i, r in pn.items():
        per[src[i]['domain']][r.get('raw_label', '?')] += 1
    for dom in sorted(per):
        t = sum(per[dom].values())
        print(f'  {dom:<22} preserved {per[dom]["neutral"]}/{t}'
              f'  promoted {per[dom]["entailment"]}/{t}'
              + ('  (n<5)' if t < 5 else ''))

    print('\n⛔ Predeclared interpretations are in the protocol document, committed'
          ' before\n   this ran. ⛔ NO OVERALL ACCURACY FIGURE IS PRINTED — the'
          ' prevalence was designed.')


if __name__ == '__main__':
    main()
