# Domain A + B v1 Baseline Report

**Frozen instrument.** Corpus A `d30a95a50e4364c8` · Corpus B `d4110fc014386aca` · scorer `57196417895a6664` · adapter `5a3063e93ed2a2b6` (hashes pinned before model contact). Domain B v1 status: **FROZEN**. `undefined_case_handling`: **NOT_SCORABLE**.

Same corpus, same prompt contract, same normalization, same scorer for both models. Transport differs only where it must: `think: false` (Ollama) vs `thinking: {type:"disabled"}` + `effort: medium` (Anthropic — thinking is on by default on Opus 5 and `temperature` is rejected). No model-specific repair, retry, or answer coercion. 0 transport errors on either run.

> ⛔ This unit establishes behavior on the frozen evaluation rail. It is **not** evidence of geometric reasoning, representational structure, or general reasoning architecture.

---

## Profile — reported separately, never collapsed

| metric | oracle | **local** qwen3:32b | **frontier** claude-opus-5 |
|---|---|---|---|
| **DOMAIN A** | | | |
| baseline accuracy | 18/18 | **18/18** 1.00 | **18/18** 1.00 |
| presentation invariance | 144/144 | 134/144 · 0.93 | **144/144 · 1.00** |
| structural sensitivity | 34/34 | 20/34 · 0.59 | 25/34 · 0.74 |
| reversal sensitivity | 16/16 | **16/16 · 1.00** | **16/16 · 1.00** |
| null robustness | 72/72 | 65/72 · 0.90 | **72/72 · 1.00** |
| **DOMAIN B** | | | |
| step accuracy | 384/384 | 243/384 · 0.63 | 300/384 · 0.78 |
| composition consistency | 192/192 | 63/183 · 0.34 | 124/192 · 0.65 |
| identity return | 18/18 | 9/9 · 1.00 | **18/18 · 1.00** |
| order sensitive | 6/6 | 0/6 · 0.00 | 0/6 · 0.00 |
| information loss | 12/12 | 6/12 · 0.50 | 6/12 · 0.50 |
| **steps-right / composite-wrong** | 0 | **24** / 30 teeth | **10** / 30 teeth |
| unanswered | 0 | 9 (domain B) | 0 |
| unresolvable / out-of-vocab | 0 | 0 / 0 | 0 / 0 |

---

## 1. ⚠️ `order_sensitive 0/6` is a CORPUS DEFECT, not a capability finding

**Both models scored 0/6 — and both got the discriminating token right in all six cases.**

Every one of the twelve W-operator failures (6 order-sensitive + 6 information-losing) is the identical error: the model returned a **superset**, adding `third_party_added`.

```
A01::R.W   expected  ["roles_reversed", "witness_bound_to_recipient"]
           returned  ["roles_reversed", "third_party_added", "witness_bound_to_recipient"]
                                         ^^^^^^^^^^^^^^^^^ the only difference
           reverse-order truth  ["roles_reversed", "witness_bound_to_agent"]
```

The order-sensitivity discrimination — `witness_bound_to_recipient` under `R∘W` vs `witness_bound_to_agent` under `W∘R` — **was made correctly in all six**. The score is 0 because scoring is exact-set-match.

**The corpus is at fault.** Operator `W` adds a new participant (Ada) *and* binds a witness role. `characterize()` emits only the witness token, because `third_party_added` is keyed on `act.instigator` — an implementation detail invisible in the rendered prose. A reader asked "was a third party added?" about *"Ada saw it happen; Ada is close to Devi"* would say yes. **The models' reading is defensible; the ground truth is under-specified.**

⛔ **Not fixed.** B v1 is frozen, and amending a benchmark after seeing results — in the direction that raises scores — is precisely the pathology this program exists to avoid. Recorded for **Domain B v2** alongside the undefined-probe amendment.

**Consequence for reading this table:** `order_sensitive` and `information_loss` carry **no signal about either model** in v1. Treat both rows as void.

## 2. The two models fail in different *shapes* — the finding a scalar would erase

Extra tokens on composites:

| | frontier | local |
|---|---|---|
| `third_party_added` | 53 | 48 |
| `witness_bound_to_agent` | 15 | 10 |
| `act_flipped` | — | 34 |
| `response_flipped` | — | 18 |
| `roles_reversed` | — | 8 |
| `witness_bound_to_recipient` | — | 3 |

**Frontier's over-reporting is entirely the one ambiguous vocabulary item.** Local's is diffuse across every token — over-reporting changes that did not occur. Same headline rate, different phenomena: one is an artifact of our schema, the other is noise. This distinction is invisible in `composition_consistency` alone and is the concrete argument for the profile-not-scalar rule.

## 3. The primary target failure: local competence without global consistency

**`steps-right / composite-wrong` is the metric Domain B was built for**, and it separates the models more sharply than any accuracy figure:

- **local: 24 of 30 teeth** — right on both steps, wrong on the composite.
- **frontier: 10 of 30.**

Both degrade from steps to composite (local 0.63 → 0.34; frontier 0.78 → 0.65), and local degrades far harder. This is the shape the program predicted and the reason composition was named the decisive test.

## 4. A genuine model finding: act substitution (`A-S3`), frontier 3/12

Every frontier structural-sensitivity miss is `A-S3` — `betrays → protects`. Asked *"whose trust was violated?"* after the harm is removed, it names a participant instead of answering `neither`.

The spec predicted this failure mode verbatim before any model ran: *"a system that answers 'whose trust was violated' after `betrays → protects` is pattern-completing, not reasoning."* `A-S1` (role reversal) is 16/16 and `A-S2` 6/6 — so this is not a general structural deficit; it is specific to **removing** a relation rather than **permuting** one.

## 5. The predicted killer did not kill

`R∘R` — two correct `roles_reversed` steps whose composite is *nothing changed* — was the sharpest case in the design. **Both models scored 100% on `identity_return`** (frontier 18/18, local 9/9 scorable). The recorded prediction was wrong, and is recorded as wrong.

## 6. Local-model caveats

`presentation_invariance 0.93` and `null_robustness 0.90` mean qwen3:32b's judgments move under **semantically vacuous edits** — a punctuation change or a rename. Its noise floor is not zero, so its `structural_sensitivity 0.59` is partly noise rather than discrimination. Frontier's floor is exactly zero (144/144, 72/72), so its sensitivity figure is clean.

9 Domain B items returned unparseable output and are counted `unanswered`, never as errors. No repair was attempted.

---

## Required return block

```
SCORER SHA:              57196417895a6664 (sha256, first 16)
CORPUS VERSION / HASH:   A v1 d30a95a50e4364c8 · B v1 d4110fc014386aca
ADAPTER STATUS:          model-agnostic, normalization-only, 0 transport errors both runs
LOCAL MODEL:             ollama qwen3:32b (think:false, temp 0) — 678 tasks, 1011s
LOCAL BASELINE:          A: base 1.00 · pres 0.93 · struct 0.59 · rev 1.00 · null 0.90
                         B: steps 0.63 · comp 0.34 · ident 1.00 · order VOID · infoloss VOID
FRONTIER MODEL:          anthropic claude-opus-5 (thinking disabled, effort medium) — 678 tasks, 237s
FRONTIER BASELINE:       A: base 1.00 · pres 1.00 · struct 0.74 · rev 1.00 · null 1.00
                         B: steps 0.78 · comp 0.65 · ident 1.00 · order VOID · infoloss VOID
STEP/COMPOSITION GAP:    local 0.63 -> 0.34 (-0.29) · frontier 0.78 -> 0.65 (-0.13)
IDENTITY-RETURN FAILURES: 0 (both models) — the predicted R∘R killer did not fire
UNANSWERED:              local 9 (domain B) · frontier 0
UNRESOLVABLE:            0 both models (domain A unresolved 0, domain B out-of-vocab 0)
UNDEFINED CASE STATUS:   NOT_SCORABLE (24 pairs recorded, 0 probed)
DOMAIN B V1 STATUS:      FROZEN
DOMAIN B V2 AMENDMENT:   REQUIRED / NOT IMPLEMENTED
NEXT RECOMMENDED UNIT:   Domain B v2 — (a) undefined-operator applicability probes,
                         (b) disambiguate W's third_party_added / witness tokens.
                         Both must be separately reportable dimensions preserving
                         v1 comparability; neither may silently change the meaning
                         of the existing composition score.
```

**Do not read a better frontier score as evidence of geometric reasoning.** Two of five Domain B dimensions are void in v1, and what the surviving dimensions measure is behavior on this rail.
