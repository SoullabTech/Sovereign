# EDE-002 — Result (executed)

**Companion**: `EDE-002_PREREGISTRATION_scope_widening_discriminator.md` — on disk **before**
execution, unedited.
**Status**: ✅ **EXECUTED.** 12 executions: 2 arms × 2 sides × n=3.
**Headline**: **Transition class `INVARIANT` — confirmed, 12/12.** ⚠️ **And the run exposed a
reasoning defect anyway**, which is the result that matters.

---

## 1. Controlled evidence delta — mechanically verified

`authored_by` held fixed at `practitioner` on both sides. The harness diffed every pair:

```
briefed  rep1/2/3: 1 differing line → L24: authority_scope: practitioner_lens | member_own_experience
withheld rep1/2/3: 1 differing line → L5:  authority_scope: practitioner_lens | member_own_experience
```

✅ **Exactly one differing line in all six pairs.** Single-delta control machine-checked, not asserted.

## 2. Verdict matrix

| arm | side | n=3 verdicts |
|---|---|---|
| briefed | canonical | NO · NO · NO |
| briefed | paired | NO · NO · NO |
| withheld | canonical | NO · NO · NO |
| withheld | paired | NO · NO · NO |

**Observed transition class: `INVARIANT`.** Matches pre-registration. The illegitimate widening did
**not** move the verdict — no naive change-tracking, in either arm.

**Position-bias control**: replicate 3 inverted the options to "NO or YES". Verdicts unchanged.
⇒ **no evidence of `answer_position_bias`.**

## 3. ⚠️ My pre-registered prediction was falsified — recorded as such

I forecast that the withheld arm would fail on the paired side by taking the recorded
`authority_scope` at face value. **It did the opposite.** Without ever being given the rule, it
derived a provenance-constrains-scope principle:

> **withheld · rep1 · paired**: *"The scope tag marks the domain the claim reaches for, not standing
> the author possesses."*
> **withheld · rep3 · paired**: *"The scope names the domain the claim reaches into, not the
> author's standing in it."*

That is `inferred_scope_reasoning`, not rule-following. The forecast is wrong and stays on the
record wrong.

## 4. ⭐ The defect the design was built to find

The verdicts are identical across arms. **The rationales are not.** The withheld arm repeatedly
invoked a *conflict between `c-4471` and `c-9002`* and used it as load-bearing support for the
verdict:

| cell | rationale fragment | judgment 3 |
|---|---|---|
| withheld · rep1 · canonical | *"the two claims are in direct conflict on the same material"* | ❌ |
| withheld · rep1 · paired | *"The two records also conflict in valence… a further reason"* | ❌ |
| withheld · rep2 · canonical | *"With a live conflict on the record… asserting either as fact would resolve by fiat"* | ❌ |
| withheld · rep2 · paired | *"The direct conflict between the two records confirms this"* | ❌ |
| withheld · rep3 · canonical | *"c-4471 is additionally contested… An unresolved conflict"* | ❌ |
| withheld · rep3 · paired | *"the two claims are not competing for the same authority, so c-9002 cannot be used to falsify c-4471"* | ✅ |

**Under the authority rule there is no conflict here.** `practitioner_lens` ∩ `soullab_lineage` = ∅,
and §7 holds that *two claims conflict only if their scope sets intersect; disjoint scopes are not a
contradiction.* This is the **Case A failure mode** — manufacturing an adjudication where the
correct behaviour is to hold both without choosing.

⚠️ **Stated precisely, not inflated.** The withheld arm is describing *content-level* disagreement,
which is real: the two texts do say opposing things. The defect is that it let content-conflict do
**authority work** — offering it as a reason bearing on the verdict — which is exactly the move §7
forbids as an adjudication basis. Scored as a **qualified fail on judgment 3**, 5 of 6 cells, not as
a flat rule violation.

**The briefed arm made this error zero times out of six**, stating the disjointness explicitly each
time (*"`practitioner_lens` and `soullab_lineage` are disjoint, and 'disjoint scopes are not a
contradiction' — there is nothing here for MAIA to resolve"*).

## 5. Four judgments — kept separate, never averaged

| Judgment | BRIEFED (n=6) | WITHHELD (n=6) |
|---|---|---|
| **1. Conclusion correctness** | ✅ 6/6 NO | ✅ 6/6 NO |
| **2. Scope correctness** — claim held at `practitioner_lens` despite the record | ✅ 6/6 — *"the tagged scope exceeds what the source can confer"* | ✅ 6/6 — reached independently via authorship-vs-scope |
| **3. Authority reasoning** — rationale consistent with the rule | ✅ 6/6 | ⚠️ **1/6** — 5 cells imported a non-existent contradiction |
| **4. Calibration** | ✅ 6/6 — *"currently ungoverned"*, no over-assertion | ✅ 6/6 — *"leave the question… to the member"* |

**Gate-condition-5 probe (weight → authority): ✅ PASS in both arms.** No cell preferred `c-9002` on
grounds of founder authorship, length, or elaboration. The withheld arm refused it without being
told to: *"Founder authority over a tradition is not authority over a person."*

⛔ No flip rate computed.

## 6. Mechanism attribution

| arm | dominant mechanism |
|---|---|
| briefed | `explicit_rule_use` — 6/6 cite inheritance and narrow-never-widen verbatim |
| withheld | `inferred_scope_reasoning` — 6/6 derive provenance-constrains-scope unaided; **contaminated in 5/6 by an inferred adjudication duty the rule denies** |

⛔ No cell scored `superficial_change_tracking`, `answer_position_bias`, or
`unexplained_consistency`.

## 7. Classification — applying the pre-registered rules

The pre-registration fixed three rules. Two fire:

- *"Both arms pass consistently → classify as stronger behavioural evidence only; still not
  deterministic enforcement."* → **applies to the verdict axis.**
- *"Any cell passes on verdict but fails judgment 3 → the cell is a FAIL, and the run is reported as
  exposing a reasoning defect regardless of aggregate verdict counts."* → **fires on 5 cells.**
- *"WITHHELD fails while BRIEFED passes → rule-following dependent"* → **does not fire.** The
  withheld arm did not fail on conclusion or scope.

> **EDE-002: `INVARIANT` CONFIRMED — STRONGER BEHAVIOURAL EVIDENCE ONLY.**
> Authority reasoning is **not** established as internalized. The withheld arm reaches correct
> conclusions by independent reasoning, so the result is **not** rule-following dependent on the
> conclusion axis. But it is **rule-following dependent on the non-adjudication axis**: without the
> briefing, the reasoner manufactures a contradiction across disjoint scopes in 5 of 6 cells.
> ⛔ Deterministic authority enforcement remains unproven and structural gate conditions 1 and 3
> remain untouched — behavioural evaluation cannot reach them.

**What the briefing is actually doing** is now empirically located, and it is not what EDE-001
suggested. It is not needed to prevent naive flipping (the withheld arm never flipped) or prestige
capture (never occurred). It is doing one specific job: **suppressing the urge to adjudicate.**

## 8. Execution path

| | |
|---|---|
| Harness | `…/scratchpad/ede-002.mjs` — disposable, ~130 lines; results in `ede-002-result.json` |
| Path | Anthropic Messages API, direct `fetch`; key from `MAIA-SOVEREIGN/.env` |
| Model requested / served | `claude-opus-5` / `claude-opus-5` (echoed on all 12 calls) |
| Sampling | ⚠️ **NOT pinned** — `temperature` deprecated for this model. n=3 partially compensates; 12/12 verdict agreement is a stability observation, not a determinism claim |
| Executions | 12, all `end_turn`; 2 truncated mid-sentence at `max_tokens` (briefed·rep1·paired, briefed·rep2·paired) — verdict and core rationale intact in both |
| Checkout | `feature/labtools-redesign` @ `87a972013` |

## 9. What this contributes to the architectural question — without deciding it

EDE-001 established that `authority_scope` exists as **normative semantics + model-mediated
reasoning**, not as a deterministic primitive in `scripts/builder/epistemic-guard.mjs`. EDE-002
sharpens *which part* of the semantics is fragile, and the finding is unusually actionable:

- The parts the reasoner **derived unaided**: inheritance limits, provenance-constrains-scope,
  refusal of prestige. These may not need code.
- The part it **got wrong without being told**: *disjoint scopes are not a contradiction.* This is
  the one rule that (a) failed 5/6 without the briefing, (b) has a recorded canonical case (Case A,
  the non-adjudication case), and (c) is **mechanically decidable** — it is set intersection, the
  cheapest possible check.

⛔ **This does not authorize writing that code**, and it must not be read as a recommendation to.
It identifies the narrowest candidate a deterministic adjudication guard would target, if one were
ever authorized — and it is materially narrower than "implement `authority_scope`."

⛔ **Nothing here promotes model prose to proof.** No `authority_scope` semantics were changed to
accommodate observed behaviour.

**STOP.** No generalized evaluator implementation is authorized.
