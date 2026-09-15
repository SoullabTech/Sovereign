# `CONTINUITY-REMAINDER-01` · ACT 1 — SELECTION-LAW CENSUS

**Date** 2026-09-15 · **Read-only.** ⛔ No behavioural code · no weights · no oracle change ·
no deployment. Production `e57ca1baa` untouched.

**Objects** `0f58a7f93` (C1-BRIDGE transplant) · `lib/maia/continuity/sessionBridge.ts` ·
`lib/sovereign/maiaService.ts:810-870` (`recoverForTier`) ·
`tests/constitutional/lane1/l1-frozen-production-corpus.json` ·
`tests/constitutional/lane1/c1-bridge-acceptance.ts`.

---

## 0 · THE HEADLINE

> **The founder's question presupposes a contest that did not occur.**

⭐⭐ **Nothing outranked anything.** The marker-bearing bridge was **never a candidate** in
the production run. The ranking function behaved *identically* in P1 and in W1; only the
**candidate set** differed, and it differed because **HOP 1 admitted a different set of
prefix turns**.

⛔ So the remainder is **not** a ranking or weighting defect, and ⛔ a selection law written
as a *tie-break rule between competing bridges* would repair something that never broke.

---

## 1 · THE MECHANISM, STATED EXACTLY

`recoverViaBridge` is two set operations and one sort:

```text
HOP 1   hops = activePrefix.filter(p => tokenize(p.userMessage) ∩ probeTokens ≠ ∅)
                ⭐ unweighted · unranked · ONE shared token admits a hop
HOP 2   carriers = tokenize(hop.userMessage) \ probeTokens
        candidates[d] = tokenize(d.userMessage) ∩ carriers        (member words only)
SORT    by |carriedBy| desc, then index ASC, slice(0,3)
```

⭐ There is no ranking **between hops**. Every admitted hop contributes candidates into one
flat map. "Which bridge outranks which" is decided only by **carrier count** at HOP 2.

---

## 2 · ⭐ THE REPRODUCTION — executed on committed evidence

Frozen corpus: `sessionDepth 41` · probe at `idx 40` · `displacedRange [0,37]` ·
prefix `{38,39}` (the acceptance oracle's own `split()`).

```text
prefix {38,39}   →  22(n=2,via 39)  24(n=2,via 39)   5(n=1,via 38)     ⭐ P1 GREEN
prefix {38}      →   5(n=1,via 38)  15(n=1,via 38)  27(n=1,via 38)     ⭐⭐ = W1 EXACTLY
prefix {39}      →  22(n=2,via 39)  24(n=2,via 39)  13(n=1,via 39)
```

⭐⭐ **`prefix {38}` reproduces the production W1 output `[5,15,27] via 38` exactly** — the
same three indices, the same via, in the same order. The divergence is fully accounted for
by **the absence of idx 39 from HOP 1**, and by nothing else.

⚠️ **One reconciliation.** `C1-BRIDGE-01 §4` predicted `38 → [5,15,27,36]`. Execution gives
`[5,15,27]`; `36` drops because it is reached only through the token `remember`, which the
**implementation** excludes as a carrier (probe-token exclusion) while §4's hand analysis —
written *before* the implementation existed — did not. ⭐ The implemented behaviour, not the
doc's prediction, is what production matched.

---

## 3 · ⭐⭐ THE LOAD-BEARING FACT: ONE TOKEN

Linkage of each prefix turn to the probe `[remember, phrase, shared, eralier]`:

| prefix idx | links via | carriers reaching displaced |
| --- | --- | --- |
| 37 | ⛔ **none** | — (not a hop) |
| 38 | `remember`, `phrase` | → 5 · 15 · 27 (three carriers reach nothing) |
| **39** | ⭐ **`remember` — and only `remember`** | → **22 · 24** (×2 carriers) · 35 · eleven others |
| 40 | all four | ⛔ 0 carriers (it *is* the probe) — contributes nothing |

⭐⭐ **idx 39 — the turn the whole P1 result depends on — is admitted to HOP 1 by a single
token, and that token is `remember`.** Remove `remember` from the probe and idx 39 ceases to
be a hop entirely; idx 38 survives on `phrase`; the result collapses to `[5,15,27] via 38`.

⛔⛔ **And `remember` is retrieval vocabulary.** `RETRIEVAL_VOCABULARY` in the same file lists
`remember` and `phrase` precisely because the founder ruled that *the words naming the ACT of
remembering must not be treated as evidence identifying the remembered object.* That ruling
is enforced in `isOpaqueRetrospectiveRequest` (which strips them before classifying) and
**violated in `recoverViaBridge`, which admits hops on them un-stripped.**

> ⭐ The lane's own law is honoured by the classifier and broken by the traversal, in the same
> module. Production index 36 winning one-hop ranking on `remember` was named as the original
> defect; **the bridge reproduces that defect one layer up, at HOP 1.**

---

## 4 · ⚠️ THERE IS NO STRENGTH NOTION BELOW n=2

```text
P1 winner   22   n=2   ⭐ two distinct member carriers, both reaching {22,24} and nothing else
W1 output   5·15·27    n=1 each — one incidental shared token apiece
```

⛔ `[5,15,27]` is **not a judgement**. It is the three lowest indices of an undifferentiated
n=1 set, ordered by `a.index - b.index` — i.e. **oldest-first, arbitrary**. The mechanism
emits it through the same surface, with the same confidence, as a genuine n=2 marker hit.

⚠️ Note also that in P1 **22 and 24 tie at n=2** and are carried by the *same two* carriers;
22 wins on the ascending-index tie-break alone. ⭐ P1's green is therefore partly a tie-break
accident — true of the correct answer, but not evidence that the ordering is principled.

---

## 5 · ⛔ THE ORACLE IS BLIND ON THE AXIS PRODUCTION VARIED

Re-run of the frozen suite (scratchpad copy, blobs from `0f58a7f93`):

```text
ABSTAIN          ✅ killed (fails P1)
BEST-AVAILABLE   ✅ killed (fails a negative)
BRIDGE+FALLBACK  ✅ killed — N2 discriminates
IMPLEMENTATION   ✅ PASSES P1 · N1 · N2
```

⭐ The suite **is** lethal — on the axis it varies. `split()` holds the probe **fixed** at
`corpus[40].userMessage` and mutates only the **corpus** (N1 moves origin; N2 replaces the
prior asks). ⛔ **No oracle varies the member's wording.** The single variable that accounts
for W1 is the one the frozen set never moves.

> ⭐⭐ A mechanism that is green on its own acceptance set and red in production has not been
> under-tested; it has been tested on the wrong axis. That is the finding, not the failure.

---

## 6 · ⛔ WHAT THIS CENSUS CANNOT ESTABLISH

**Why idx 39 was not a hop at W1 is NOT established here.** Three candidates remain open, and
all three are consistent with `[5,15,27] via 38`:

```text
(a) PARAPHRASE   idx 39 existed; the W1 probe omitted `remember`, its sole link.   ⭐ leading
(b) FIRST ASK    no prior-naming turn existed at all — the ordinary case C1-BRIDGE-01 §4
                 already declared UNESTABLISHED and this corpus cannot establish.
(c) APERTURE     the prefix boundary moved. ⚠️ Weak: CORE aperture is 4 (would ADD 37, keep
                 39); a grown session would displace 38 and forbid `via 38`. Not ruled out
                 for FAST, whose apertureCount is `representedCurrentSessionExchanges` —
                 derived from A6 accounting, therefore variable.
```

⛔ **I will not choose between them from the frozen corpus.** Distinguishing them requires two
artifacts from the W1 run and nothing more:

1. **the W1 probe string, verbatim** (settles (a) outright); and
2. **the `🌉 [L1/bridge]` log line** emitted at `maiaService.ts:~848` — it already carries
   `{ count, indices, via }` — together with the served `apertureCount` (settles (c)).

⭐ Both are already produced by the deployed code. ⛔ No new instrumentation is owed.

---

## 7 · WHAT ACT 2 INHERITS

```text
the defect is ADMISSION, not RANKING                      ✅ ESTABLISHED (§2, §3)
HOP 1 admits on retrieval vocabulary, against the ruling   ✅ ESTABLISHED (§3)
no strength discrimination below n=2; ties are arbitrary   ✅ ESTABLISHED (§4)
the frozen oracle never varies the probe                   ✅ ESTABLISHED (§5)
why idx 39 was absent at W1                                ⛔ OPEN — needs §6.1 + §6.2
```

⚠️ **A caution for ACT 2's law.** The obvious repair — *strip retrieval vocabulary at HOP 1
too* — would have made **P1 itself abstain**, because `remember` is the only thing admitting
idx 39. ⭐ That is not an argument against the repair; it is the discovery that **P1's green
was purchased with the very token the ruling forbids.** ⛔ Which bridge is admissible cannot
be settled without re-adjudicating P1.

---

## 8 · STANDING

```text
ACT 1 census              ✅ COMPLETE · read-only · reproduced on committed evidence
selection law             ⛔ NOT DRAFTED (ACT 2)
falsifiers                ⛔ NOT AUTHORED (ACT 3)
implementation            ⛔ NOT AUTHORIZED
W1 artifacts              ⛔ OWED — probe string + 🌉 log line
first-ask opaque memory   ⛔ UNOPENED · PRESERVED · separate lane
rollback primitive        ⛔ OUT OF SCOPE — DEPLOY-ROLLBACK-INTEGRITY-01
deployment                ⛔ NOT AUTHORIZED
production                e57ca1baa · UNTOUCHED
```
