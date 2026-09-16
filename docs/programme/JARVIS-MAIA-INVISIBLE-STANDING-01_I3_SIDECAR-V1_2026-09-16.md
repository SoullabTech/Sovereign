# JARVIS-MAIA-INVISIBLE-STANDING-01 — I3 Observation Sidecar v1

## Question

Can a hidden, zero-authority sidecar look at MAIA's already-written natural response and nominate candidate evidence relationships without changing the response?

## Result

Local model: `llama3.1:8b`, temperature `0.2`, seed `42`.

```text
cases                       10
response bytes unchanged    10 / 10
candidate evidence ids valid 10 / 10
present input noticed        9 / 10
exact response spans         0 / 10
```

The improvement over the Standing Envelope experiment is notable: when bookkeeping was separated from speaking, the sidecar nominated the present member utterance in 9/10 cases rather than 0/10.

But the span interface failed completely. The model paraphrased or resegmented response language rather than returning exact substrings. Therefore **v1 has zero enforcement value**.

## Ruling

Do not repair this with stronger wording. Remove the generative freedom from span location.

The successor interface gives each deterministic response sentence a closed id (`R1`, `R2`, ...). The model may select ids; it may not reproduce or rewrite the sentence text.
