# WS2-ENCOUNTER-01 — Completion reliability · DESIGN ONLY

**Opened by**: founder ruling 2026-09-08, after G8 attempt #3 stopped at Window 4.
⛔ **DESIGN ONLY.** No change to the Encounter retry rule, parser, binder, lexicon, traversal or
structured seam is authorized by this document. Nothing here is implemented.

## The question

> Determine the smallest way for a long-Work Encounter to remain constitutionally single-pass
> and whole-Work truthful while tolerating infrastructure failure without re-rolling cognition
> that already produced a response.

## The hard boundary (ruled, not designed here)

```
No StructuredResult existed        → transport-recovery design MAY be considered
StructuredResult existed but
  violated the contract            → NO RETRY
```

---

## D-1 · ⭐ `provider_unavailable` is NOT proof that no cognition occurred

The boundary above is stated in terms of whether a completion **existed**. The code can only
observe whether a `StructuredResult` **reached the caller**. Those are different facts.

`lib/ai/structured/router.ts:116-131` wraps `provider.execute(req)` in one `try/catch` and
returns `provider_unavailable` for anything thrown. The adapter
(`anthropicStructuredAdapter.ts:98-99`) awaits either `client.messages.create(...)` or
`client.messages.stream(...).finalMessage()`. So a single refusal value covers at least three
materially different events:

| what actually happened | did cognition occur? | safe to re-attempt? |
|---|---|---|
| request never reached the provider (DNS, connect, 429/503 before generation) | no | yes |
| provider errored before generating | no | yes |
| **completion generated, then lost — mid-stream reset, timeout after first token, client abort** | **YES** | **NO** |

> **A recovery keyed on `provider_unavailable` as it stands today would silently re-roll
> cognition in the third row.** That is the C5 breach the ruling forbids, arriving through a
> refusal value rather than through a retry loop.

**First design obligation, therefore, is not a retry — it is a distinction.** Any transport
recovery must first be able to say *no completion was generated*, and that claim must rest on
observable evidence (an error raised before any response body began), not on the absence of a
result. Where the evidence cannot establish it, the failure falls on the **no-retry** side by
default. *Uncertainty about whether MAIA spoke resolves as: she spoke.*

⛔ This is a finding, not a repair. It means the "openable" half of the boundary is narrower
than the current refusal taxonomy suggests, and that widening the taxonomy is a prerequisite to
any recovery — not an afterthought.

---

## D-2 · N is a free parameter, and whole-Work success is exponential in it

Window size is **transport mechanics, not law**. `traversal.ts` says so explicitly: windows are
not sections, chapters, units or inferred hierarchy. The default is `windowSize: 12000` code
points with `overlap: 400`, which is why this Work needs **33** consecutive perfect completions.

If each call fails independently with probability *p*, whole-Work success is *(1−p)^N*:

| p | N=33 (12k windows) | N=10 (~40k) | N=4 (~100k) |
|---|---|---|---|
| 0.143 (point estimate) | **0.7 %** | 22 % | 55 % |
| 0.05 | 18 % | 60 % | 81 % |
| 0.01 | 72 % | 90 % | 96 % |

⛔ **The point estimate is nearly uninformative.** It is 1 malformed response in 7 completed
calls across both witnesses; at n=7 the interval spans roughly 0.4 %–58 %. It supports exactly
one claim: *p is not vanishingly small.* It supports no target and no threshold.

Two things follow. **Reducing N is the highest-leverage lever available, and it changes no
constitutional rule.** And **reducing N alone is not sufficient** — at the point estimate even
N=4 is a coin flip.

### The cost of a wider window, stated honestly

Scope honesty is preserved either way: the scope is recorded truthfully whatever its size. But
the **grain of the claim changes**. A notice scoped `0..100000` asserts over eight times the
text of one scoped `0..12000`. That is not a violation — it is a different observation, and it
may be a *better* one: a bounded non-return across 100,000 code points tells the writer more
than the same sentence across 12,000. It also cannot be assumed: whether cognition perceives as
well over a wider field is **unmeasured**, and is itself a G8 question.

⛔ Not authorized. Resizing windows is a small edit and a real change to what the act perceives;
it should be witnessed, not merely configured.

---

## D-3 · Reducing p — investigation, not a fix

The observed failure was a **double-encoded `notices` array with corrupt inner JSON**, on the
window that had so far produced the most notices (11 in W3, and W4's string held 7). Candidate
contributors, none established:

- **output length under a permissive schema** — the malformation appeared on long tool inputs;
- **`minItems` / free-form string fields** inviting long generations;
- **provider-side strict structured-output enforcement**, if available on this path, which is a
  seam question and would need its own governance;
- **a cap on notices per window**, which is *not* a neutral lever — capping what MAIA may notice
  to make transport more reliable is intervention pressure entering through the back door, and
  should be refused unless it can be shown the cap never suppresses a lawful observation.

Owed before any of this is actionable: **a real estimate of p**, from completed calls, recorded
per window with its failure mode. Seven calls is an anecdote.

---

## D-4 · Honest failure is separable, and available without touching any rule

Today a failed window produces `refusal: 'cognition_unavailable'` for the whole act — true, and
almost content-free. The writer cannot distinguish *"MAIA could not reach cognition at all"*
from *"MAIA read 31 of 33 stretches of your book and one answer came back malformed."*

Reporting **which** and **how many** windows completed changes no constitutional rule: it does
not return partial notices, does not soften the refusal, and does not let a partial Encounter
masquerade as whole-Work attention. It only stops the refusal from being less honest than the
system's own knowledge.

⛔ Whether the writer should see window mechanics at all is a presentation question and belongs
with the E3 constraint, not here.

---

## D-5 · Not candidates

- ⛔ **Salvaging or leniently re-parsing a malformed envelope** — gives constitutional status to
  output that never entered the contract.
- ⛔ **Returning the windows that succeeded** — §1A: partial observation may not be presented as
  whole-Work attention.
- ⛔ **A second model to repair or re-serialize the first one's answer** — a new cognition with
  no constitution, adjudicating a contract failure it did not witness.
- ⛔ **Retrying a malformed contract** — ruled, closed.
- ⛔ **Relaxing the schema to make malformation less likely** — the closed key sets and
  `additionalProperties: false` are what make a volunteered coordinate a refusal rather than a
  silently honoured field. Reliability may not be bought with that.

---

## Recommended sequence (⛔ none authorized)

1. **Measure p.** Record per-window outcome and failure mode across several whole-Work attempts,
   at the current window size. Nothing else here is decidable without it.
2. **Widen the refusal taxonomy (D-1)** so *no completion was generated* is a claim with
   evidence behind it, defaulting to no-retry when the evidence is absent. This is the
   prerequisite to any recovery, and is worth doing even if no recovery is ever built.
3. **Then, and only then**, decide between: a bounded pre-result re-attempt on the narrowed
   class; a larger window with its own G8 witness; or accepting that long Works sometimes cannot
   be encountered and saying so honestly (D-4).

> The act is right to fail closed. The question is not how to make failure survivable — it is
> how few chances to fail a truthful whole-Work Encounter needs to take.
