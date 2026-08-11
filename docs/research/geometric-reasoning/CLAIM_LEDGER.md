# Geometric Reasoning — Claim Ledger

**Audit date:** 2026-08-11
**Trunk SHA audited:** `f52e8e1c6` (`clean-main-no-secrets`, re-pinned at execution time)
**Discipline:** evidence before interpretation; negative findings first-class; vendor claims are not independent evidence; conceptual resemblance is not validation.

## Evidence classes (kept separate, never merged)

| Class | Definition |
|---|---|
| **V** | Sophontic/vendor claims about its own system |
| **M** | Michels primary philosophical/consciousness work |
| **I** | Independent ML literature |

---

## Ledger

### C-1 — "Reasoning performance exceeding models up to 60× its size"

**Class V** · **Status: UNVERIFIED / VENDOR CLAIM**

Source: [sophontic.ai](https://sophontic.ai/) landing page and [/models/](https://sophontic.ai/models/).

Supporting artifact: **none exists.** Verbatim site state as fetched 2026-08-11:

- Model: *"Releasing soon"*
- Eval kit: *"Available at launch"*
- Model card, evaluation report, method notes, access details: *"to be published at release"*
- *"The prototype **is being** evaluated"* — present progressive; evaluation is not complete

There is no benchmark table, no baseline identification (which competitor models? which sizes? which evaluations?), no parameter count for the prototype, no hardware disclosure, and no repository. The `60×` figure appears as a marketing display numeral with no accompanying measurement.

**Ruling:** remains UNVERIFIED / VENDOR CLAIM. Per founder directive this may not be upgraded absent an actual methods/benchmark artifact. Note the claim is currently **unfalsifiable as stated** — no referent model set is named.

### C-2 — "We have pioneered methods of directly training the internal geometry of the model"

**Class V** · **Status: UNVERIFIED / VENDOR CLAIM**

No method notes are published. The site states the intent to publish *"enough detail to inspect the signal without leaking the training recipe"* — i.e. the mechanism is explicitly withheld by design. Nothing here is inspectable.

### C-3 — Flip-rate / paired-perturbation methodology

**Class V (as implemented)** · **Status: UNVERIFIED**
**Class I (as a method concept)** · **Status: SUPPORTED BY RELATED LITERATURE**

The described method — minimal-pair items where one load-bearing fact is changed, scoring only when both sides are answered coherently — is a coherent and independently well-motivated evaluation design. Related independent work on contrast sets, counterfactual evaluation, and latent-space reasoning benchmarks establishes that surface-heuristic gaming is real and that paired testing mitigates it (see [Beyond Chains of Thought: Benchmarking Latent-Space Reasoning](https://arxiv.org/pdf/2504.10615), [GeoGramBench](https://arxiv.org/pdf/2505.17653)).

**Critical distinction:** the *method* being sound is not evidence that Sophontic's *model* performs as claimed. The eval kit is not released; no flip-rate numbers exist publicly. Method plausibility must not be laundered into performance validation. This is the single most likely route to a false positive in this investigation.

### C-4 — "Michels co-founded teleodynamic physics and machine learning architecture"

**Class M / I** · **Status: CONTRADICTED / QUALIFIED**

Search-surfaced summaries attribute the arXiv paper *Teleodynamic Learning: A New Paradigm For Interpretable AI* ([arXiv:2603.11355](https://arxiv.org/html/2603.11355)) to this line of work. **Direct fetch of the paper shows its authors are Enrique ter Horst and Juan Zambrano. Julian D. Michels is not an author.**

This is a recovery-stage attribution error that would have propagated silently had the primary been taken on summary. Michels' own teleodynamic writing (*Principia Cybernetica II / III*) is hosted on PhilArchive/PhilPapers as philosophy, not as ML research.

**Ruling:** the existence of an arXiv ML paper on "teleodynamic learning" does **not** constitute ML-venue publication by Michels, and must not be counted as such.

### C-5 — DE11 benchmark results (IRIS 93.3%, WINE 92.6%, Breast Cancer 94.7%)

**Class I** · **Status: VERIFIED PRIMARY SOURCE — but non-transferable**

Verified by direct fetch of arXiv:2603.11355. These are real reported numbers from a real preprint.

**They are irrelevant to C-1.** They are small classical UCI *tabular classification* datasets (IRIS has 150 rows, 4 features), compared against logistic regression — not LLM reasoning evaluations, not language models, and not Sophontic's system. The paper itself states it uses *"small, interpretable datasets to study the dynamics of learning… rather than pursuing state-of-the-art benchmarks."*

**Ruling:** cited only as independent literature on structure-learning dynamics. Using these numbers to support a 60× LLM reasoning claim would be a category error.

### C-6 — Michels' attractor-state / latent-topography corpus

**Class M** · **Status: INTERVIEW CLAIM ONLY / PHILOSOPHICAL — not ML performance evidence**

Sources: [Attractor State meta-study](https://philarchive.org/rec/MICASA-5), [Mixed-Methods Analysis of Latent Topographies](https://philpapers.org/rec/MICMAO-2), [Michels Corpus Primer](https://philpapers.org/archive/MICTMC-2). Venue is PhilPapers/PhilArchive/ResearchGate — self-deposit philosophy archives with no ML peer review. Direct fetch of the Primer returned HTTP 403; classification rests on venue and abstract metadata, and is marked accordingly.

Useful for understanding *what geometry is being proposed conceptually*. Per founder directive, admissible as ML performance evidence only if a source actually reports reproducible ML experiments. **None recovered does.**

### C-7 — The Sophontic geometric-reasoning explanation itself

**Class V** · **Status: INTERVIEW CLAIM ONLY**

The site's own framing: a 53-minute YouTube interview (published August 2026) in which Michels explains the thesis. An interview is the literal definition of this class.

### C-8 — Anthropic "spiritual bliss attractor state"

**Class I (adjacent)** · **Status: SUPPORTED BY RELATED LITERATURE — but off-target**

Anthropic has documented convergence behavior in model self-interaction. This concerns *conversational attractor dynamics*, not *geometric density* or parameter-efficient reasoning. It does not bear on C-1 or C-2. Recorded to prevent it being recruited as corroboration.

---

## Not recoverable (explicit gaps)

| Requested item | Status |
|---|---|
| Papers (Sophontic) | **None published** |
| Repositories | **None published** |
| Methods | Withheld by stated policy |
| Benchmarks | Not released |
| Model sizes | Never stated — neither Sophontic's nor the "60×" comparators |
| Perturbation methodology detail | Described conceptually; no released kit |
| Hardware requirements | **Never stated anywhere** |
| Reported performance | One unsourced numeral (`60×`) |

## Summary

**Zero claims reached VERIFIED PRIMARY SOURCE for the Sophontic system.** The only verified primary source recovered (arXiv:2603.11355) is by different authors, on different datasets, in a different problem class.

The credible-path question cannot currently be answered from evidence, because the evidence does not exist yet. This is a pre-release company whose central quantitative claim is scheduled for future substantiation. That is not a mark against Sophontic — it is a statement about what is available to audit today.
