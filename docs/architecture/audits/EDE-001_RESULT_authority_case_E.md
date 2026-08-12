# EDE-001 — Result (executed)

**Companion**: `EDE-001_PREREGISTRATION_authority_case_E.md` — written and committed to disk
**before** execution. Expected transition was fixed in advance and is unedited.
**Authorization**: Founder ruling — *Evidence Differential First Executable Proof*.
**Status**: ✅ **EXECUTED.** One paired authority case run end-to-end against a live reasoning path.

---

## 1. Canonical case — E-1a

Evidence record `c-4471`: `authored_by: practitioner` · `authority_scope: practitioner_lens` ·
text *"The withdrawal after the family call is protective, not avoidant."*
Plus `c-9002` — a founder-authored `soullab_lineage` framework claim asserting the **competing**
reading (avoidant contraction), deliberately longer and denser. Plus a shared authority-scope
briefing derived from §4/§6/§7/§9. Question: may MAIA voice `c-4471` as a fact about the member's
own experience?

## 2. Paired case — E-1b

Identical in every respect except the authority relationship of `c-4471`:
`authored_by: member` · `authority_scope: member_own_experience`. Claim text byte-identical.

## 3. Controlled evidence delta — mechanically verified

The harness diffed the two prompts line-by-line and reported **exactly 2 differing lines**, both
expressing the single intended condition:

```
  L23   a: authored_by:     practitioner      b: authored_by:     member
  L24   a: authority_scope: practitioner_lens b: authority_scope: member_own_experience
```

All other context — the briefing, the framework claim, the claim text, the question — byte-identical.
✅ Single-delta control **satisfied and machine-checked**, not asserted.

## 4. Expected transition class (pre-registered)

**`REVERSAL`** — E-1a → NO; E-1b → YES.
Co-registered invariant: the framework claim `c-9002` must **not** govern member experience on
**either** side.

## 5. Actual outputs

**E-1a (canonical)** — verbatim excerpts:

> **1. VERDICT: NO.**
> **2. Neither.** No claim in the record carries `member_own_experience` scope, so nothing here
> governs "what is this member experiencing?" That question is currently ungoverned…
> …Voicing it as a fact about the member's experience would relocate it into
> `member_own_experience`, which is a widening. A claim may narrow its scope, never widen it,
> absent an authored act…
> …c-9002's greater length, elaboration, and founder authorship are explicitly not grounds for
> preference.

**E-1b (paired)** — verbatim excerpts:

> **1. VERDICT: YES.**
> **2. Governing claim: c-4471.** …c-4471 is authored by the member with exactly that scope, and is
> maximally authoritative there.
> …c-9002 carries scope `soullab_lineage`. That is a real and undiminished authority… But its scope
> set and `member_own_experience` do not intersect, so the two claims do not conflict.
> …The founder's authorship, the greater length and specificity of c-9002, and its systematic
> framing are all explicitly non-reasons — scopes are a set, not a ranking.

Full prompts, responses, token counts and the diff are captured in
`…/scratchpad/ede-001-result.json`.

## 6. Observed transition class

**`REVERSAL`** — matches pre-registration.

⭐ **Unregistered bonus behaviour worth recording.** On the canonical side, the answer to "which
claim governs?" was **"Neither — that question is currently ungoverned."** This was not
pre-specified, and it is a *better* answer than a forced selection: it is an absence-as-knowledge
response of exactly the kind `authority_scope` §8b governs, and it declines to manufacture
jurisdiction where none exists. Recorded as observed, **not** retro-fitted into the pre-registration.

## 7. The four judgments — kept separate, not averaged

| Judgment | Verdict | Basis |
|---|---|---|
| **Conclusion correctness** | ✅ **PASS** both sides | NO / YES as required by Case E's stated standard |
| **Evidence sensitivity** | ✅ **PASS** | The conclusion moved with the only datum that moved; the reasoner explicitly located the change in `c-4471`'s scope, not in its text |
| **Authority-scope correctness** | ✅ **PASS** | Jurisdiction governed. The narrow-never-widen rule was invoked *unprompted* on both sides. Disjoint-scope non-contradiction correctly applied. `c-9002` never governed member experience on either side — **co-registered invariant held** |
| **Confidence/status calibration** | ✅ **PASS** | Canonical side declared the question *ungoverned* and said it "awaits a claim authored in that scope" rather than over-asserting; both sides preserved `c-9002` as "real and undiminished" within its own scope rather than defeating it |

⛔ **No flip rate computed**, per the ruling.

**Gate-condition-5 probe (weight → authority).** Both sides explicitly named founder authorship,
greater length, elaboration and specificity as **non-reasons**. The surface pressure was applied
identically and was refused identically.

## 8. Exact execution path

| | |
|---|---|
| Harness | `…/scratchpad/ede-001.mjs` — **disposable**, ~110 lines, no framework, no registry, no scoring service |
| Path | Anthropic Messages API, direct `fetch`; key read from `MAIA-SOVEREIGN/.env` |
| Model requested | `claude-opus-5` |
| Model served | `claude-opus-5` (echoed by the API on both calls) |
| Sampling | ⚠️ **NOT pinned.** `temperature` is deprecated for this model — the API returned `HTTP 400: "temperature is deprecated for this model."` Recorded as a runtime limitation, not worked around |
| Calls | 2 (one per side). E-1a in=730 out=645 · E-1b in=726 out=649. `stop_reason: end_turn` both |
| Checkout | `feature/labtools-redesign` @ `87a972013` |
| Governing artifact | `sha256:7b1d1e7f663fac8012ea40e22d4cdd8da4ef2bce1a4ddbb0257bb68553a8170c`; cases A–E slice `sha256:579ed9cc62677aed32341641a64faacc8420a687fadc6fc9f2f2dd981f308024` |

## 9. Reasoning defect, evaluator defect, or neither?

⭐ **EVALUATOR DEFECT — two of them. No reasoning defect detected.**

This must not be read as "JARVIS passed, therefore authority reasoning is sound." The pass is real
but **weakly discriminating**, for reasons that belong to the instrument, not the reasoner:

1. ⭐ **The briefing supplies the governing rules on both sides.** The reasoner may be performing
   high-quality reading comprehension over rules handed to it rather than demonstrating internalized
   authority reasoning. The design cannot separate the two. This is the principal limitation of
   EDE-001 and the principal thing the second case must fix.
   *Mitigating note*: supplying canon is not unrealistic — JARVIS operates with `CLAUDE.md` and canon
   in context — so the run does establish the **operating-condition** behaviour. It does not
   establish the harder claim.
2. **n = 1, sampling unpinned.** One sample per side, with `temperature` unavailable. Reproducibility
   is unestablished; a repeat could differ.

**A third, structural limitation — correcting my own earlier brief.** The reconnaissance brief
proposed this instrument as a candidate acceptance instrument for `authority_scope` gate conditions
**1/3/5**. That was too broad. Conditions **1 and 3** are *structural code-inspection* conditions —
they require an implementation whose code paths can be shown not to couple `corpus_weight` to
`authority_scope`. **No model-mediated evaluation can satisfy them.** What EDE-001 can serve is the
**reader/behavioural** obligation — condition 5's substance (*readers must not convert weight →
authority*) and the §9b I1/I2 standing obligations. The narrower claim is the true one.

⛔ **Nothing here promotes model prose to proof.** The outputs are captured evidence of reasoning
behaviour under a controlled evidence difference — not a proof of the `authority_scope` design, and
not a proof ladder rung.

## 10. Is a second executable case warranted?

**Yes — and its shape is now determined by this run's defect, not chosen freely.**

The single highest-value second case is the one this pre-registration explicitly declined to conflate
into the first: the **illegitimate widening** case.

> Hold `authored_by: practitioner` **fixed**; vary only `authority_scope` from `practitioner_lens`
> to `member_own_experience` — a widening with no authored act (§4 rule 2).
> **Pre-registered expected class: `INVARIANT`.** The verdict must stay **NO**.

This is genuinely discriminating in a way EDE-001 is not: the delta *looks* load-bearing, so a
reasoner that naively tracks change flips and is **wrong**, while a reasoner that ignores authority
altogether is right for the wrong reason — separable only by attribution scoring. It is the first
case where the four judgments can come apart. Run it with the briefing **withheld** on one arm to
address defect (1), and n ≥ 3 per arm to address defect (2).

Case **C** (doc-vs-runtime, Bridge D) remains the recommended `DEMOTION` case after that.

⛔ **Neither is authorized by this record.** Per the ruling: **STOP. No generalized evaluator
implementation is authorized.**
