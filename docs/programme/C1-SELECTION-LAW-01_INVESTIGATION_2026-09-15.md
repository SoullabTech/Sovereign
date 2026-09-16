# C1-SELECTION-LAW-01 · INVESTIGATION

**Authority:** founder handoff, 2026-09-15 — take over the memory lane.
**Base:** `e41e4137e` — prior lane closed; production restored to `e57ca1baa`.
**Scope:** investigation and falsifier only. ⛔ No repair · no deploy · no W2/W3/S · no rollback-script work.

## 1. Opening question

W1 failed after the deployed bridge selected a member-grounded path that terminated on
assistant-carried material. The prior record left three explanations open: probe sensitivity
in HOP 1, live-selection defect, or corpus/oracle fidelity gap.

This act asks the cheapest separating question first:

> On the exact frozen production corpus, does replacing only P1's probe with the exact W1
> wording reproduce the selection failure?

## 2. Result · YES

Current implementation, same corpus and same active prefix:

```text
P1 frozen probe
"can you remember the phrase I shared with you eralier"
→ [22,24,5]
→ marker 22 recovered
→ via prefix 39 and 38

W1 served probe
"what was that phrase I mentioned earlier?"
→ [5,15,27]
→ marker 22 NOT recovered
→ via prefix 38 only
```

⭐⭐ The production failure reproduces without production, corpus drift, prompt assembly, or
model consumption. **Probe-sensitive HOP-1 selection is sufficient to explain W1.**

## 3. Mechanism

`recoverViaBridge()` chooses HOP 1 by literal token intersection between the current probe and
the member text in the active prefix.

The frozen probe contains `remember`, linking it to prefix 39, the prior member ask that carries
the marker terms needed for HOP 2. The served W1 wording does not contain `remember`; it shares
`phrase` with prefix 38 instead. Prefix 39 is therefore excluded before HOP 2 begins.

The bridge then faithfully follows the wrong topology it was handed.

This is not a threshold failure and not a prompt-carrier failure. It is a **selection-law
instability at HOP 1**.

## 4. Paraphrase census

Eight ordinary opaque formulations over the same frozen state produced:

```text
marker recovered      2 / 8
wrong material        2 / 8
abstention             4 / 8
```

Representative split:

```text
"do you remember what I said earlier?"          → marker recovered
"can you recall the phrase I mentioned before?" → wrong material
"what did I share with you before?"              → abstained
"remind me what I said earlier"                  → abstained
```

Nothing about the remembered object changed. Only the vocabulary naming the retrieval act did.
So this is a general instability, not an isolated wording accident.

## 5. RED falsifier

`tests/constitutional/lane1/c1-selection-law-falsifier.ts`

The instrument first requires the frozen P1 control to recover marker 22; if that control fails,
it exits as instrument failure. It then substitutes the exact W1 wording and requires the same
authoritative member-grounded marker to remain reachable.

Expected standing at opening: **RED**.

## 6. Standing

```text
W1 production verdict          ⛔ FAIL · unchanged
bridge mechanism               ✅ not disproven
probe-sensitivity hypothesis   ✅ CONFIRMED · sufficient reproduction
corpus/oracle fidelity gap     not required to explain W1
prompt/model consumption       not implicated
selection-law falsifier        RED expected
repair                         ⛔ NOT OPENED BY THIS ACT
production                     ✅ e57ca1baa · untouched
W2 / W3 / S                    ⛔ unspent
```

## 7. Next question, not a repair

The next architectural question is the selection law itself:

> What member-grounded relation should make semantically equivalent opaque retrospective asks
> traverse the same lawful prior-ask path without admitting assistant-originated evidence or
> turning absence of a bridge into fallback retrieval?

A proposed implementation is not authority. The RED counterexample must remain fixed while that
law is adjudicated.
