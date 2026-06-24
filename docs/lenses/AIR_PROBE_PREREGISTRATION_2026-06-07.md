# Air Probe — Pre-Registration

**Date:** 2026-06-07
**Freeze rule:** Editable up until the first Fire/Water/Earth run produces output. **Once any result is observed, frozen** — no edits to question, pipeline, rubric, or pre-commitments. Post-result changes require a new dated file that supersedes this one. (A pre-registration may be refined before data exists; it may not be touched after.)

## Question
After Fire, Water, and Earth claim what they can from ordinary human situations, does a residual jurisdiction remain — and if so, is it a single coherent faculty ("Air"), or something else (Field, Condition, lens-operation, an unmapped coherent thread, or several incoherent leftovers)?

This probe does **not** hunt for Air. It measures what F/W/E leave behind and characterizes it blind — the discipline that made the presence/Aether result credible: the conclusion appeared as a consequence of the lenses meeting an edge, not as a target.

## Contamination model this design defends against
| Stage | Inflation risk | Protection |
|---|---|---|
| Generation | Smuggling Air into the inputs | Blind author (no Air/lens/element/residual framing) |
| Characterization | Inventing coherence in the leftovers | Blind characterizer (no categories; not told they are a residual) |
| Interpretation | Mapping everything onto the existing architecture | Sighted mapping *after* blind characterization, against a frozen rubric |
| Power / adequacy | Judging "does the corpus give Air a fair chance?" — a hypothesis-aware reader sees the signal everywhere; curating toward it = seeding | Blind *structural* audit (interaction headcount, not "perspective"); pre-committed adequacy floor before the run |

This is the project's own inflation law — Lens→over-claim→jurisdiction; Field→premature synthesis→merge gate; **Method→premature coherence→blind characterization** — applied reflexively to the experiment itself.

**Refinement — blind is not the universal protection.** "Protection = blind" holds only where hypothesis-awareness would let you *create or curate* the signal (Generation, Characterization, Power). The **Neutrality audit is the exception**: detecting whether the signal leaked *in* requires recognizing it, so it is **sighted and hypothesis-aware — but filter-only** (the auditor may reject inputs, never author them; replacements are blind). Detection+rejection is safe with awareness; only authoring requires blindness.

## Two independent gates (both must pass before the run)
| Audit | Question | Status |
|---|---|---|
| Neutrality | Was Air smuggled into inputs? | Automated vocab receipt: original 0/40, supplement 0/15 intersubjective-vocab → surface clean. **Substance pass is SIGHTED and hypothesis-AWARE** (a blind reader cannot recognize Air-leakage), done by the most Air-sensitized reader acting as a **filter only**: flag/cut situations that read as centrally about misunderstanding / perspective / shared-meaning; any replacement is blind-authored; re-check the ≥20 interacting floor after cuts. |
| Power | Could Air appear if real? | Blind structural audit (2026-06-07): 40 situations = 22 SOLO / 8 COPRESENT / **10 INTERACTING** (`situations-structure.json`). An intersubjective residual can only arise from interacting situations → max 10, fewer after F/W/E claim → **likely underpowered**. **RESOLVED:** blind multi-person supplement (+15, all INTERACTING; neutrality 0/15 intersubjective-vocab) → combined **55 = 22 SOLO / 8 COPRESENT / 25 INTERACTING**, clears the locked ≥20 floor. Corpus finalized: `air-probe-corpus.json` (idx 0–39 original, 40–54 supplement). |

Neutrality prevents false positives; power prevents false negatives. Independent.

## Corpus (evidence object — not analysis categories)
- `scripts/repro/fixtures/ordinary-situations.json` — 40 hypothesis-blind situations.
- The blind corpus is **evidence**. The intersubjective/structural buckets are **analysis categories**. Different epistemic objects; never merged; categories never used to author or select inputs.

## Frozen pipeline
1. Blind author → situations [done]
2. Committed `lib/consciousness/lenses/{fire,water,earth}Lens.ts` — run **exactly as committed** (no tuning, threshold, jurisdiction, or prompt edits) — claim or decline each situation via existing jurisdiction gates.
3. Residual = situations all three decline.
4. **Blind characterizer** — fresh agent; no Air/lens/element/category vocabulary, **and not told the situations are a residual or that anything declined them**. Prompt only: *"Do these situations share a common thread — one, several, or none? If one, name it in your own words."* Output recorded verbatim, primary.
5. **Sighted mapping** — the frozen rubric below, applied to the characterizer's description (never to raw residuals).
6. Verdict.

## Frozen decision rubric (step 5)
| Characterizer's description | Verdict |
|---|---|
| (residual empty — F/W/E claim ~all) | **No Air.** Existing faculties may be sufficient. |
| connection/relationship among parts | → **Field** |
| the medium/space situations occur within | → **Condition** |
| "a distinction occurred," nameable only via domain contents | → **Lens-operation** |
| one coherent thread, world-pointed, collapsing into none of Field/Condition/Lens-operation | **Candidate fourth faculty** — record the characterizer's verbatim words; whether it *is* "Air" is decided by comparison to the separately-sealed prediction, not named here |
| several unrelated threads | **Heterogeneous — no unified fourth lens** (faculties may be incomplete, but the remainder is not one thing) |

## Pre-commitments (the teeth)
- The rubric is closed for this run. **No category may be added after seeing output** to capture a surprising residual. A non-mapping residual is reported as non-mapping.
- Empty residual and heterogeneous residual are **first-class results**, equal in standing to a positive Air finding.
- F/W/E run as committed. Under-claiming manufactures a residual; over-claiming erases one. Neither is tuned.
- **Verdict scope:** any result is conditional on F/W/E's jurisdiction gates *as committed on 2026-06-07*. "No fourth faculty" means *given these jurisdiction boundaries* — not an absolute claim about the architecture. A different (also reasonable) calibration could yield a different residual. Note further that the three claiming lenses are **not equally validated**: Fire is run-confirmed; Water's observation-field script exists but its run is unverified; Earth has a jurisdiction battery only (no observation field). The residual inherits the validation level of its weakest claiming lens — firmest where Fire does the declining, thinnest where Earth does.
- **Interacting-floor — LOCKED 2026-06-07, before any supplement was generated:** the corpus is extended by blind structural authorship until **≥ 20 situations classify as INTERACTING**. Frozen now to forbid "just a few more" drift. Supplement situations involve multiple people in a shared activity, authored blind to Air (no perspective / misunderstanding / communication framing); the neutrality lint is re-run on the supplement. The supplement's multi-person *structure* is not itself Air — only viewpoints-meeting counts (sealed prediction, negative criteria).
- **Scope of falsification (what a null does and does NOT mean):** the probe tests the **strong claim** — does the symbolic/relational domain form a *distinct perceptual jurisdiction here*, separable from F/W/E/Field/Condition? It does **not** test the **weak claim** — that humans communicate, reason, symbolize, take perspectives (undisputed; no experiment needed). A null therefore means *"these capacities do not constitute a separate lens in this architecture — they are distributed across F/W/E or resident in the Field,"* **not** "Air does not exist." To keep the strong claim falsifiable, the number of model-revisions before "no distinct jurisdiction here" stands must be pre-committed *before respecifying* (suggested: two independent respecifications both null). External symmetry priors (astrology, four-brain / whole-brain) are hypothesis-generators for *where* Air's jurisdiction might be — they cannot raise the prior on *whether* one exists, because the domain→lens mapping is what this program tests, not assumes.
- **Prediction vs. measurement:** the astrological "Air = movement between perspectives" hypothesis (Gemini→translation, Libra→perspective-taking, Aquarius→coordination) is registered separately in `AIR_HYPOTHESIS_SEALED_2026-06-07.md`, **not folded into this rubric**. Air earns standing only if the blind characterizer *independently* produces something recognizable as it (convergence — the Fire standard). Tuning the rubric to recognize the prediction would destroy that independence.
- **Method-validity (the residual method is on trial too, not only Air):** step 4 is run by **≥2 independent blind characterizers**. Convergence on the residual's character = a stable signal (the method generates knowledge); materially divergent descriptions = the method generates *stories*, and **no Air verdict is trusted** regardless of how clean any single description looks. Reported alongside the verdict. Decided here, before the run — "does the method work?" judged after seeing results is the same post-hoc trap pre-registration exists to prevent. A Condition probe may inherit this apparatus **only after it passes this check.**
- **Ceiling:** a single run returns at most "Air candidate," never "Air observed." Survival warrants the full observation-field battery (jurisdiction + bias + blind-spot + flourishing), the standard Fire and Water were held to.

---

## RESULT — Run 1 (2026-06-07)
F/W/E over 55 (as committed): **Fire 0 / Water 14 / Earth 30 claimed; residual (all-three-decline) = 21/55.** The residual boundary is set mostly by Earth (the binding lens) — the least-validated; the verdict-scope caveat applies directly.

**Method-validity: PASSED, with a discovered caveat.** Three independent blind characterizers converged strongly — all `coheres:"one"`, the same thread, and all independently considered and *rejected* the solo/group split as a competing thread. Stable signal across readers → the method generates knowledge, not stories. **Caveat (register-confound):** the convergent thread is the corpus's uniform authoring register (flat, third-person, present-tense, observational, no interiority) — a property shared by all 55, so it can MASK a content-level thread.

**Air (strong claim, this run): NOT SUPPORTED.** No perspective / meaning-between-minds thread emerged in any blind description (even while they probed sub-structure). The sealed prediction (H1/H2) is **falsified for this run** — zero convergence on it. The residual coheres around an authoring artifact, not a world-pointed jurisdiction → not a candidate faculty. Phenomenon ≠ Layer holds: Air-the-capacity is untouched; only "Air as a distinct lens here" is unsupported.

**Confidence: moderate** (register-confound + Earth-dependence). **Stopping rule:** this is null #1 → a register-VARIED run #2 is warranted before "no distinct Air jurisdiction here" stands; two independent nulls close it (no infinite respecification).

**Surprise:** the residual cohered around *neither* predicted outcome (perspective / heterogeneous / empty) but around a **corpus artifact** — the method-on-trial revealed its own blind spot, not an Air lens. `airLens.ts` correctly NOT built (Outcome C was not reached).

### Negative control (2026-06-07)
Three more independent blind characterizers were run on a **non-residual** 21-situation subset (situations at least one lens claimed). **They converged on the SAME thread** ("quiet ordinary moments of everyday life, observational register"). → The residual-convergence is **non-discriminating** (a corpus-wide register, not residual-specific): convergence demonstrated method *stability*, NOT residual specificity — refuting any "stable phenomenon" inference drawn from convergence alone.

BUT the control also showed **partial content-sensitivity**: all three control readers noted a *tending / maintenance / repair* motif (= Earth's jurisdiction) that was ABSENT from the residual readers' descriptions. So the method is not purely register-confounded — blind readers can pick up content; they picked up Earth's, and found **no** perspective/meaning content anywhere (0/6 readers across residual + control). Moreover, the perspective-*opportunity* (interacting) situations that landed in the residual were read as "people doing things together" (coordination-as-physical), explicitly NOT as a meaning thread — exactly where Air, if real, should have cohered.

**Upgraded verdict:** Air (strong claim) NOT SUPPORTED — confidence MODERATE → **GOOD**. Remaining caveats: Earth-dependence (residual bound by the least-validated lens); single mundane corpus. Per the stopping rule a register-varied run #2 would formally close it, but the control has addressed the main confound → #2 is now lower-priority. Phenomenon ≠ Layer holds.
