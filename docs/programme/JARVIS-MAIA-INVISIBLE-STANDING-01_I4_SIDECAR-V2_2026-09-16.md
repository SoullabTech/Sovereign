# JARVIS-MAIA-INVISIBLE-STANDING-01 — I4 Closed Sentence-ID Sidecar v2

## Structural repair

V1 failed because the model was asked to reproduce exact response spans. V2 removes that authority. The response is deterministically split into sentence ids (`R1`, `R2`, ...); the model may select only from the closed id set.

## Result

```text
cases                         10
response bytes unchanged      10 / 10
closed sentence ids           10 / 10
known evidence ids            10 / 10
present member input noticed   8 / 10
```

The locator problem is structurally closed: the model can no longer misquote the response span because it never emits response text.

However, two cases missed the present utterance. One case (`SS-04`) abstained entirely. In another (`SS-07`) the sidecar mislabeled declarative sentences as questions and nominated older context while missing the present partial-adoption statement.

## Ruling

The sentence-id shape is retained. The semantic `kind` field is removed in v3 because the control plane does not need the model to classify witness/synthesis/question in order to study candidate support lineage.

Even if v3 improves coverage, model-nominated evidence remains observation only. It cannot become substrate-owned proof.
