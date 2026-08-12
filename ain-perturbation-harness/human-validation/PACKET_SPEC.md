# Human Validation Protocol — Domain B v2 ontology determinability

**Frozen before any rater sees the packet. No model contact anywhere in this unit.**

This is the last outstanding Phase 2 precondition. Preconditions 1 (scorer separation) and 2 (adapter ordering) are complete. **Phase 2 model contact remains NOT AUTHORIZED.**

---

## 1. What is being validated, and why an automated check cannot do it

The v2 ontology claims that a reader can tell, **from the rendered prose alone**, which third-person category applies. `verify-b-v2.mjs` already checks this mechanically (576/576). That check is a **construction guard, not a validity check**: the same authoring process produced both the ontology and the reader, so their agreement establishes internal consistency, not independent comprehensibility. This is the §2.3 circularity hazard, and it is exactly what R2 exists to close.

**Spec basis.** `RELATIONAL_GEOMETRY_SPECIFICATION.md`:

- **R2** — *"Invariants are validated by people who did not author the transformation. Otherwise a pass means only that the model shares our conception."*
- **§C1** — *"Blind raters assign transformed passages to families. Gate: κ ≥ 0.6 across ≥ 3 raters."*

R2 does **not** mandate full-corpus human labeling; the only numeric gate in the spec is C1's. A pre-registered stratified sample is therefore permitted. The κ ≥ 0.6 / ≥3 raters threshold is adopted here **by explicit analogy to C1** — it is spec-grounded, not invented for this unit.

⛔ **Binding anti-pattern, spec §172:** *"do not rescue by loosening the vocabulary, adding raters until agreement appears, or reducing to fewer families."* Rater count, sample, and thresholds are frozen below and may not be revised after seeing responses.

---

## 2. Sample — pre-registered and frozen

| parameter | value |
|---|---|
| corpus | `domain-b-v2-corpus.json` · `8a3ee854bbdb49ed` |
| shuffle seed | `20260811` (deterministic LCG, no `Math.random`) |
| items | **36** |
| target per stratum | 8 |
| mandatory W-repair rule | 2 distinct seeds per (repaired pair, role), pairs `W.R` and `R.W` → 12 items |

**Stratum distribution (sealed):** A 8 · B 6 · C 8 · D 6 · E 8.

B and D fall short of 8 because the entire single-category pool contains only 6 of each. **Declared, not silently accepted.**

**Why the mandatory rule is capped.** A first build included *all* 36 `W.R`/`R.W` items, putting 78% of the packet in two operator pairs and badly skewing the category marginals — which distorts κ, since κ corrects against expected agreement computed from those marginals. The cap keeps every repaired case-type covered while preserving balance. Caught and fixed before freeze.

### ⚠️ Scope limit on any passing result — binding

> **Human validation applies to the sampled single-category ontology only. Multi-category determinability remains unvalidated.**

A PASS here may **not** be restated as *"Domain B v2 prose is human validated."* The validation claim cannot exceed the surface the instrument actually touched. `score-raters.mjs` prints this boundary as part of its PASS output so the result and its limit travel together.

### ⚠️ Declared coverage gap

**12 items whose ground truth carries more than one third-person category are excluded** from human validation. The instrument is single-select; multi-select would complicate κ and the rater task. Consequence: **combination cases are not human-validated in this round.** Recorded here, not dropped silently.

---

## 3. Blinding — mechanically enforced

`verify-rater-packet.mjs` fails the packet if any of these appear: ontology token names · operator names or pair ids (`W.R`) · internal vocabulary (`composition`, `applicability`, `DEFINED`, `ground truth`) · corpus or scorer filenames · item keys · pre-filled answers. It also fails if any category has zero items, if no W-repair item is present, or if items appear grouped by answer.

Current status: **PASS** — 36 items, categories ABCDE covered, 20 W-repair items present, 30/36 answer-order runs.

Categories are presented to raters as neutral letters **A–E with plain-language definitions**. The letter→token mapping exists only in the sealed key.

## 4. Rater instructions (as issued in the packet)

- Answer from the text alone.
- Exactly one letter per item.
- Work **in order**; do not revise earlier answers after seeing later ones.
- Do **not** discuss items with anyone until submitted.
- If an item feels ambiguous, still answer, and note the number. *"Ambiguity is useful information about the material — it is not a mistake on your part."*

## 5. Administration

1. ≥3 raters who **did not author** the transformations, ontology, or corpus.
2. Each receives only `rater-packet.md`. Never the answer key, scorer code, operator names, or any model result.
3. Each classifies **independently**, before any discussion.
4. Raw responses are preserved verbatim as `human-validation/responses/<rater-id>.md`.
5. **`ANSWER_KEY.json` is not opened until all responses are collected and stored.**
6. Agreement is computed only after collection, by `score-raters.mjs`.

---

## 6. Acceptance thresholds — frozen before collection

| gate | threshold | basis |
|---|---|---|
| **Inter-rater agreement** | Fleiss' κ **≥ 0.60** across ≥3 raters | Spec §C1, by explicit analogy |
| **Agreement with ground truth** | majority answer matches ground truth on **≥ 0.85** of items | ⚠️ **A pre-registered validation threshold introduced for Domain B v2. It is not inherited canon and is not retrospectively adjustable.** Declared before any observation capable of influencing it, and held fixed. If 0.84 comes back, nobody gets to discover afterward that 0.80 would have been reasonable. |

Both gates must pass. They test different things:

- **κ alone is not enough.** Raters can agree with each other and still agree on a category the ontology did not intend — that would mean the prose reliably communicates *something else*.
- **Ground-truth agreement alone is not enough.** High average accuracy with low κ means the categories are being guessed inconsistently.

### If a gate fails

**The finding is that the prose is under-determined. That is corpus evidence, not rater failure.** It would mean the v2 ontology does not achieve what §2 of the amendment ledger claims, and would require a v3 amendment and a fresh freeze.

⛔ It may **not** be rescued by adding raters until agreement appears, loosening the category definitions, dropping the disagreed items, or re-running with a different seed. Per-item disagreement is retained and reported as evidence about which distinctions the prose fails to carry — most likely candidates being **B vs C** (which side the onlooker is on) and **D** (re-binding, which requires noticing that an unchanged clause means something different because its surroundings moved).

**A failure here is a first-class result**, exactly as a Domain C C1 failure would be.

---

## 7. Status

| | |
|---|---|
| packet built and blinding-verified | ✅ |
| protocol, sample, seed, thresholds frozen | ✅ |
| **founder ruling** | **PREPARATION: PASS** — packet frozen before exposure · sampling permitted by governing spec · stratification pre-registered · blinding mechanically verified · κ threshold inherited by explicit analogy and frozen · truth threshold newly introduced, declared, and frozen · multi-category limitation declared · anti-rescue rule binding |
| human observations | **0 / 3** |
| raters recruited | ⛔ **outstanding — requires people, not instruments** |
| responses collected | ⛔ |
| agreement computed | ⛔ |
| **Phase 2 model contact** | ⛔ **NOT AUTHORIZED** |

`adapter-v2.mjs` refuses to contact a model without `--i-have-authorization` and names this requirement as the blocker. The stop is executable, not a note.

---

## 8. Execution order — once, in this sequence

```
3 raters collected
        ↓
freeze responses          (store verbatim; no edits after this point)
        ↓
unseal ANSWER_KEY.json
        ↓
score ONCE
        ↓
κ ≥ .60 AND truth ≥ .85 ?
       /            \
     YES             NO
      │               │
 Phase 2         corpus evidence
 eligible        → v3 amendment
                   no rescue
```

⛔ No fourth rater because three were inconvenient. No dropped item because everyone disliked it. No reseed. No reinterpretation of a threshold. No post-hoc clarification of an item a rater found ambiguous — **their confusion is measurement, not friction to be helped away.**

If a rater asks what an item means: they record it under Notes and move on. Do not explain.
