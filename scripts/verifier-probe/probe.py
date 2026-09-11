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
    python3 scripts/verifier-probe/probe.py --model both --repeat 3

Install (local, self-hosted, no external API — CPU is fine at this size):

    pip install torch transformers sentencepiece

Disk footprint, worth checking first given the volume was at 98%:

    MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli   ~1.7 GB
    MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli               ~0.4 GB  (--small)
    vectara/hallucination_evaluation_model                     ~0.5 GB

⛔ LABEL ORDER IS READ FROM THE MODEL CONFIG, NEVER HARD-CODED. NLI checkpoints do not
agree on whether index 0 is entailment or contradiction, and a probe that assumed one
would silently invert its own result — reporting the exact opposite finding with no
error. The one thing this script must not do is be confidently backwards.
"""
import argparse, json, os, sys, time
from pathlib import Path

FIXTURES = Path(__file__).with_name('fixtures.json')

DEBERTA_LARGE = 'MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli'
DEBERTA_BASE = 'MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli'
HHEM = 'vectara/hallucination_evaluation_model'

# HHEM returns a consistency score in [0,1]. This is a REPORTING threshold only —
# it is printed alongside the raw score and every raw score is recorded, so a
# different cut can be applied to the same evidence without re-running anything.
HHEM_THRESHOLD = 0.5


def load_cases():
    data = json.loads(FIXTURES.read_text())
    cases = data['cases']
    ids = [c['id'] for c in cases]
    assert len(set(ids)) == len(ids), 'duplicate fixture id'
    for c in cases:
        assert c['expected'] in ('entailed', 'not_entailed'), c['id']
    return cases


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
            observed = 'entailed' if 'entail' in top else 'not_entailed'
            rows.append(dict(verifier='deberta', run=r + 1, id=c['id'], role=c['role'],
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
            rows.append(dict(verifier='hhem', run=r + 1, id=c['id'], role=c['role'],
                             premise=c['premise'], hypothesis=c['hypothesis'],
                             expected=c['expected'], observed=observed,
                             raw_label=f'score={score:.4f}',
                             scores={'consistency': round(score, 4),
                                     'threshold': HHEM_THRESHOLD}))
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
        if pos_ok == 0:
            print('  ⛔ ZERO on the positive side. Blanket refusal is not selectivity,')
            print('     and a perfect negative column here means nothing.')
        # Stability across repeats — the instability A-S exposed.
        for cid in sorted({r['id'] for r in sub}):
            obs = {r['observed'] for r in sub if r['id'] == cid}
            if len(obs) > 1:
                print(f'  ⚠️ UNSTABLE across repeats: {cid} -> {sorted(obs)}')
    print('\n' + '=' * 78)
    print('⛔ NOT SELF-JUDGED. These are readings, not a verdict.')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', choices=['deberta', 'hhem', 'both'], default='deberta')
    ap.add_argument('--repeat', type=int, default=1)
    ap.add_argument('--small', action='store_true', help='DeBERTa base instead of large')
    ap.add_argument('--dry-run', action='store_true', help='print fixtures, load no model')
    ap.add_argument('--out', default='')
    a = ap.parse_args()

    cases = load_cases()
    print(f'RC-GEN-01 VERIFIER PROBE · {len(cases)} cases · repeat={a.repeat}')
    print(f'  positive (expect entailed)      {sum(c["expected"] == "entailed" for c in cases)}')
    print(f'  negative (expect not_entailed)  {sum(c["expected"] == "not_entailed" for c in cases)}')

    if a.dry_run:
        for c in cases:
            print(f"\n[{c['id']}]  expect {c['expected']}")
            print(f"  PREMISE     {c['premise']}")
            print(f"  HYPOTHESIS  {c['hypothesis']}")
            print(f"  WHY         {c['origin']}")
        print('\n⛔ DRY RUN — no model was loaded and nothing was measured.')
        return

    rows = []
    if a.model in ('deberta', 'both'):
        rows += run_deberta(cases, a.repeat, a.small)
    if a.model in ('hhem', 'both'):
        rows += run_hhem(cases, a.repeat)

    report(rows)
    out = a.out or f'verifier-probe-{time.strftime("%Y%m%dT%H%M%S")}.json'
    Path(out).write_text(json.dumps(rows, indent=2))
    print(f'\nrecorded: {out}')


if __name__ == '__main__':
    main()
