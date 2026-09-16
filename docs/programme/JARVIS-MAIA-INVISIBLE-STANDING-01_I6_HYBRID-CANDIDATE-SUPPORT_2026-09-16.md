# JARVIS-MAIA-INVISIBLE-STANDING-01 — I6 Hybrid Candidate Support

## Question

Can a deterministic signal complement the observation-only sidecar when the present member utterance is an obvious lexical source for a load-bearing response sentence?

## Lexical-superiority rule

For the benchmark anchor sentence, tokenize significant words and compare overlap against every supplied evidence row. The present utterance becomes an additional **candidate** only when:

1. overlap is non-zero; and
2. its overlap score is strictly greater than every non-present evidence row.

There is no tuned numeric threshold and no lexical candidate becomes proof.

## Results

### Seed 42

```text
sidecar anchor current     8 / 10
lexical rescues            2
hybrid anchor current     10 / 10
```

The two rescues were the `MAIA-was-wrong` cases: the present correction carried the strongest exact lexical evidence for `repetition`, `deliberate`, and `rhythm`.

### Seed 137

```text
sidecar anchor current     7 / 10
lexical rescues            3
hybrid anchor current     10 / 10
```

The additional rescue was one correction case. The closed-id sidecar changed across seeds; the deterministic candidate signal stabilized the bounded benchmark.

## Ruling

Hybrid candidate discovery is suitable for **shadow instrumentation**, not response authority. It may help point reviewers or future validators toward load-bearing evidence. It may not decide whether a synthesis is true or permissible.
