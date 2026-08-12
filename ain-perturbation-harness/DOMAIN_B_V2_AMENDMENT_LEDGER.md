# Domain B v2 — Amendment Ledger

**Phase 1 artifact. No model has seen Domain B v2.** Frozen on completion of this ledger; model contact requires separate authorization.

---

## 0. Baseline ruling carried forward (v1, immutable)

```
BASELINE ACCEPTED.
Instrument found both model behavior and benchmark defects.
Domain B v1 remains frozen.
Two dimensions are VOID, not failed.
Composition degradation is established on the surviving rail.
Failure topology differs materially between substrates.
A-S3 is a genuine behavioral finding requiring explanation, not yet an explanation.
The R∘R prediction is refuted.
No claim of geometric reasoning is established.
```

| Domain B v1 | status |
|---|---|
| corpus | **FROZEN** — `d4110fc014386aca` |
| composition score | **VALID AS DEFINED** |
| `order_sensitive` | **VOID / NOT INTERPRETABLE** |
| `information_loss` | **VOID / NOT INTERPRETABLE** |
| undefined cases | **RECORDED / NOT PROBED** |
| W failures | **CORPUS-AMBIGUOUS, NOT MODEL FAILURES** |

⛔ **VOID is not zero.** Zero would claim the models were tested on those dimensions and failed. They were not meaningfully discriminated. Both models supplied the correct discriminating W token *and* the defensible `third_party_added` token — evidence that the evaluation question was malformed, not the cognition.

### Methodological invariants established by v1

1. **A sensitivity score is interpretable as reasoning sensitivity only above an independently measured invariance floor.** Otherwise response instability under meaning-preserving variation masquerades as structural discrimination. (qwen3:32b: presentation invariance 0.93, null robustness 0.90 — so its structural sensitivity 0.59 is not purely structural. claude-opus-5: 1.00 / 1.00 — its 0.74 is clean.)
2. **Evaluation parity is not architectural equivalence.** Disabling thinking on both substrates equalizes the *evaluation condition*; the two inference systems need not implement that control in comparable ways. Recorded as parity, never as equivalence.
3. **Failure topology outranks the scalar.** Concentrated error suggests task/ontology ambiguity or a narrow defect; diffuse over-reporting suggests weak discrimination of invariant vs changed structure. These imply different hypotheses and are invisible in an aggregate rate.

### Named findings preserved

- **`A-S3` — relation deletion.** Frontier handles permutation cleanly (`A-S1` 16/16, `A-S2` 6/6) but scores 3/12 when the relation is *removed* (`betrays → protects`), naming a participant where the answer is `neither`. The discriminating operation appears to be reasoning about the consequences of **relation deletion** — removing load-bearing evidence should produce demotion or absence, not substitution. ⛔ **Behavioral pattern established; mechanism NOT established.** Do not explain it yet.
- **`R∘R` — refuted prediction, kept as-is.** The pre-registered identity killer predicted failure and produced 100% in both substrates. It is **not** redesigned into something harder, and the original intuition is **not** described as supported. A harness that can falsify its author's hypotheses is the property being preserved.

---

## 1. What v2 changes — exactly two amendment classes

### Amendment A — undefined-operator applicability

v1 recorded 24 blocked operator pairs as metadata and never probed them, so a model confidently inventing a composite for a non-performable operation was unobservable.

v2 converts them into **explicit applicability probes asked before any transformation judgment**, with a three-way answer whose two blocking modes are opposite and both populated:

| value | meaning | instances |
|---|---|---|
| `DEFINED` | the operation can be carried out and would change the description | 192 |
| `UNDEFINED` | blocked by **ABSENCE** — what the operation needs is not there (`D∘D`, `D∘V`) | 12 |
| `INAPPLICABLE` | blocked by **PRESENCE** — what it would introduce is already there (`T∘T`, `W∘W`) | 12 |

`verify-b-v2` fails the build if either blocking mode has zero instances — a three-way split with one empty branch is decorative. It also fails if any blocked pair is *also* emitted as a transformation triple, which would leave the coercion path open.

### Amendment B — W semantic disambiguation

The v1 defect: ground truth was derivable only from `act.instigator`, a field the prose never exposed. A correct reading of the text scored wrong.

v2 defines the ontology **in corpus language, independent of the scorer**, and makes the prose sufficient to determine which category applies:

| token | definition (corpus language) | prose |
|---|---|---|
| `third_party_added` | A third person **takes part in the act**, carrying it out together with the agent. The act itself is different because of them. | *"Marcus and Ada together betrayed Devi — … and Ada took part in it."* |
| `witness_bound_to_agent` / `…_recipient` | A third person **takes no part** in the act; they observe it and are affiliated with one named participant, as it stands at the end. | *"Bo took no part in it, but saw it happen; Bo is close to Devi."* |
| `witness_rebound` | An observer already present becomes affiliated with the other side because the roles reversed. | (observer clause unchanged; the act clause around it swaps) |

**`witness_rebound` was not planned — it was found by the reader test.** See §3.

### ⛔ What was NOT changed

No other v1 case was altered. Seeds are the same file, byte-identical. v1 results motivated *which problem* v2 addresses; they did **not** determine how any individual v2 answer is scored. No amendment was made in the direction of raising an observed score.

---

## 2. The reader-determinability test

`verify-b-v2` runs a deliberately naive reader that knows **only the ontology's wording** and has never seen `characterize()`. It parses the act clause and observer clause by surface pattern and derives the third-party labels from the prose alone. If it disagrees with ground truth anywhere, the corpus does not ship.

**576 change items checked against prose alone. 0 disagreements.**

⚠️ **This is a PROXY for the independent-human-rater requirement (spec §R2), not a substitute.** It proves the text is *mechanically sufficient* to determine the category. It does not prove people find it clear. **The human check remains outstanding and is still the binding requirement.**

---

## 3. Defect found by the reader test, before model contact

The first v2 build **failed** with 6 errors, all on `W∘R` step2:

```
A01::W.R/step2: PROSE UNDER-DETERMINED — reader derives ["witness_bound_to_agent"]
                from the text, ground truth says []
```

When an observer already exists and the roles then reverse, the observer's affiliation flips from recipient-side to agent-side. **That change is visible in the prose and had no vocabulary term** — so a model reporting it would have been right and scored wrong.

**This is the v1 defect class recurring one level down.** It was caught by construction-time verification rather than by a model run, which is the boundary this two-phase protocol exists to create. The fix was to add the missing term (`witness_rebound`), not to silence the reader. Second build: PASS, 0 errors.

---

## 4. Frozen artifact hashes

Recorded **before** any model contact. sha256, first 16 hex.

| artifact | hash | status |
|---|---|---|
| `corpus/domain-a-corpus.json` | `d30a95a50e4364c8` | **v1 FROZEN — unchanged** |
| `corpus/domain-b-corpus.json` | `d4110fc014386aca` | **v1 FROZEN — unchanged** |
| `corpus/domain-b-v2-corpus.json` | `8a3ee854bbdb49ed` | **v2 FROZEN** |
| `src/operators-v2.mjs` | `5d12b8f8f4121e0e` | v2 |
| `src/render-v2.mjs` | `5a3746bf70c119b0` | v2 |
| `src/verify-b-v2.mjs` | `50cf05c8364ec1b7` | v2 |
| `src/score.mjs` | `57196417895a6664` | v1 scorer — **not yet extended for v2** |
| `src/adapter.mjs` | `8ac4af50da943968` | transport |

v1 hashes are byte-identical to their pre-baseline values. v2 modules are **self-contained duplicates** rather than shared imports, so no v2 edit can move v1's bytes even by accident.

### v2 corpus contents

192 triples · 576 change-probe items · 216 applicability-probe items.
Classes: identity 18 · defined 156 · order-sensitive 6 · information-losing 12. Teeth: 30.

---

## 5. Predictions, recorded before model contact

Stated now so they can be wrong. **These are not acceptance criteria.**

1. **`order_sensitive` becomes interpretable and both substrates score above zero.** The v1 zero was an artifact; the discrimination was already being made. If a substrate *still* scores 0/6 with the ambiguity removed, that is a genuine capability finding.
2. **`third_party_added` over-reporting collapses on the frontier substrate.** Its v1 extra-token profile was 53/68 concentrated on that one token. If it persists at similar volume, the ambiguity was not the cause and this ledger's diagnosis is wrong.
3. **Local's diffuse over-reporting does NOT collapse.** `act_flipped` (34), `response_flipped` (18), `roles_reversed` (8) were not ambiguity artifacts. If they vanish too, the diagnosis in §1 mis-attributed local's failure mode.
4. **`INAPPLICABLE` is harder than `UNDEFINED` for both substrates.** Absence ("there is no response to remove") is more visible in text than presence-blocking ("a witness is already here"). Predicted gap direction: `UNDEFINED` > `INAPPLICABLE`.
5. **The step→composite degradation persists.** It was measured on the surviving rail and should not be an artifact of the W ambiguity. If it disappears, v1's headline finding was contaminated.
6. **`witness_rebound` will be under-reported** — it requires noticing that an unchanged clause means something different because its surroundings moved.

---

## 6. Phase boundary — STOP

Phase 1 is complete: amended, mechanically validated, reader-checked, hashed, predictions recorded.

**No model has seen Domain B v2, and none may until the rerun is separately authorized.**

Outstanding before a v2 rerun:

- [ ] `score.mjs` extended for applicability scoring (`DEFINED`/`UNDEFINED`/`INAPPLICABLE`) as a **separately reportable dimension**. It must not alter or absorb the existing composition score — v1↔v2 composition comparability depends on that.
- [ ] Adapter extended to send applicability probes **before** change probes per pair.
- [ ] **Independent human raters** for the §2 determinability check. Still unmet, still binding, still cannot be satisfied by any automated proxy.
