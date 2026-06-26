# The Stewardship Cohort — Relational Beta Plan (core `/maia`)

- **Date**: 2026-06-26
- **Status**: **PROPOSED PLAN — authorizes no build.** The instrumentation build (§3) is itself gated on this plan's review + the cohort consent surface. Plan-only; no runtime change made.
- **Serves**: the **Stewardship Gate** (`docs/architecture/STEWARDSHIP_GATE_GRADUATION_STANDARD_2026-06-26.md`). This is the *relational research cohort* that gate requires — not a software beta.
- **Surface**: the core `/maia` conversation (the only live, member-facing, **persistent** relational surface; the surface we actually intend to widen).
- **Posture**: reuse-first (per the Integrator charter — every addition must reduce load or justify it). Most of what's needed already exists; the net-new build is small and invisible.

> **The question the cohort answers:** *What kind of relationship does core `/maia` reliably cultivate?* — not "are there bugs." **Prime constraint:** instrument the room **without making members feel measured** (invisibility = validity, not merely kindness), and **never instrument for credit** (proving MAIA *caused* the growth re-introduces the centrality the gate exists to reduce).

**What is actually on trial — a relationship architecture, not a model.** Claude today, local models tomorrow, something else in five years: the hypothesis is *model-incidental* and survives every model change —

> *Can a carefully governed conversational environment increase human authorship while decreasing dependence?*

This is the first empirical test of the platform's core thesis, and what is on trial is the **governance**, not the LLM. It is also why the findings are durable: a result about the architecture outlives any model that implements it. It shifts the unit of inquiry from *"which model is smartest?"* to *"which relationship structures reliably cultivate authorship and independence?"* — a question that can be falsified, replicated, and improved **independently of model advances.**

---

## 1. Cohort selection

- **Small and qualitative** (~15–30). The gate is a *judgment over accumulated developmental evidence*, not a metric threshold — n is for signal, not significance.
- **Consenting real members in the normal `/maia`** — not a special room, not insiders. Insiders and friends carry demand characteristics (they *want* it to work → Barnum risk); recruit **returning strangers**.
- **Observed from onset where possible** (clean baseline for slopes), with a few longer-tenure members for contrast.
- **Deliberately includes people it might *not* help.** The Field Lab discipline holds: *"nothing happened" is a finding* — the boundary of who-it-serves is the contribution, and it's how the negative ceiling (§7) gets real evidence. A friendly cohort would test the wrong thing.

---

## 2. Consent language

- **Reuse + extend** the existing consent base: `recall-preferences` and the specced *Conversation Continuity / research-consent-object* framing (`RESEARCH_CONSENT_CONVERSATION_CONTINUITY_SPEC`). `export-data` / `delete-account` already make withdrawal real.
- **Informed**: what is observed (conversation patterns and the gestures you already make), why (to learn whether the relationship helps people become more themselves), the protocol version, full reversibility (withdraw anytime; export/delete exist), and the absolute boundary (**Sanctuary stays absolute**; no content trained or sold).
- **Validity guard — disclose the *domain*, withhold the *scoring*.** Informed consent requires naming **what is observed**: *"we're studying whether this kind of relationship with MAIA helps people develop greater clarity, ownership, and agency over time."* It does **not** require — and must withhold — **what counts as success**: which gestures increment which signals, the authorship ratio, what qualifies as transfer, what counts toward graduation. Disclosing the domain keeps consent *fully informed*; withholding the scoring avoids *coaching toward specific behaviors*. **Residual risk:** naming "ownership / agency" as the study domain can still lightly prime performance — mitigated by weighting the **fake-resistant** signals (§4, Independence), which cannot be performed into existence. *The more you must disclose for ethics, the more you must lean on signals that can't be faked* — the same shape as behavioral-over-self-report.
- Copy is MAIA-voiced, sovereignty-first, plain. (Draft to be written against the existing consent component, not a new modal.)

---

## 3. Instrumentation build (reuse-first)

**Reuse (already live):**
| Need | Existing substrate |
|---|---|
| turn / conversation history | `conversation_turns` (mig 015), `maia_turns` + `maia_turn_feedback` (022) |
| dependence / independence | **`member_spiral_state.autonomy_streak` + `return_count`** (Bridge D — `lib/relational/relationalStance.ts`, `spiralStatePersistence.ts`) |
| session cadence | `member_sessions` / `member_settings` (mig 20260104) |
| member-marking gesture | `is_breakthrough` / Keep / `breakthrough_moments` (mig 014) |
| edit-tracking precedent | `is_edited` / `edit_count` pattern (mig 20241201) |
| consent + sovereignty | `recall-preferences`, `export-data`, `delete-account`, `ledger` |

**Net-new (small, invisible):**
- **Authorship-act capture** in the reflective surface — member *edits / reshapes / rejects* MAIA's reflection (extend the existing `is_edited`/`edit_count` pattern into `/maia`).
- **A real Release affordance + release-event log** — *"this thread has served me"* as a gesture MAIA **celebrates**, distinct from delete. (Today there's delete/export but no honored release.)
- **A rare, natural discrimination probe** for Recognition — occasionally MAIA's reflection is offered alongside a plausible near-miss; genuine recognition *rejects* the near-miss. Must be rare and conversational, **never a quiz**.
- **Transfer signal** — longitudinal detection of the member's *own returning language* ("I realized…" vs "MAIA said…"). Indirect by necessity; **accept unattributable** (§4 Transfer).

**Guardrail — ADR-003 (grounded).** `relational_phase` was *retired as a behavioral signal* (`docs/adr/003-relational-phase-as-behavioral-signal.md`) because it inferred **person-state**, not behavior. The dependence/independence signal here must be **behavioral** (cadence, `autonomy_streak`) and must **not** resurrect an inferred "relational phase / maturation level" of the member — that is the meaning-seat violation the project already rejected.

**Invisibility constraint.** All instruments are passive/behavioral or naturally-occurring gestures; the single active probe (discrimination) is rare and reads as ordinary conversation. **No surveys, no "rate your session," no progress dashboard shown to the member.** Observability is **builder-facing only** (per the Integrator charter — never strip builder observability for member simplicity, never expose measurement to the member).

**Every instrument must be a genuine feature first, a measurement second.** If a feature exists *only* to produce data, members eventually feel studied; if it first solves a real human problem and *also* yields evidence, the measurement is a by-product, not the purpose. Release leads precisely because it is the clearest gift; the discrimination probe is last partly because it is the hardest to make gift-first.

**Build order** — instrumentation stays *behind* the encounter, never moves into it (the room is a place of encounter, not experimentation):
1. **Release affordance** — first; it *completes the developmental cycle*, and is a gift to the member regardless of measurement.
2. **Authorship-act capture** — observes behavior already occurring; passive.
3. **Longitudinal transfer** — passive and longitudinal; answers the deepest question without touching the encounter.
4. **Recognition discrimination probe** — **last**; the only component that *intentionally perturbs* the encounter, so it carries the greatest risk of influencing what it measures. It enters only once the passive layer is trusted.

The first three *observe what is already happening*; only the last reaches into the room — and only after everything that doesn't have to. That ordering keeps engineering-truth behind human-truth.

---

## 4. The five graduation signals (operational)

Read **jointly — no signal is interpretable alone.**

| Signal | What we observe | Instrument | Trap / guard |
|---|---|---|---|
| **Recognition** | member would *reject a near-miss*, not just assent | discrimination probe (rare) | Barnum/Forer — bare "yes that's me" doesn't count |
| **Authorship** | reshape / rename / reject / split of reflections | authorship-act capture | rubber-stamp ≠ authorship (behavioral, not report) |
| **Transfer** | member's own language, returning, uncredited | longitudinal language read | **measurement paradox** — peak success is unattributable; accept it, never instrument for credit |
| **Independence** *(the spine)* | member increasingly *does without MAIA what they needed MAIA for* — names their own patterns first, rejects reflections earlier/more confidently, brings their own language, sessions grow shorter-but-complete, returns by **choice not need** | cadence + `autonomy_streak` / `return_count` + doing-without markers | ADR-003 (behavior, not person-state); choice-vs-need read from *surrounding behavior*, never an inferred felt-state; rising-reliance+retention = casino |
| **Release** | celebrated "this served me" events | release affordance + log | audit that MAIA does not *resist* release (incentive check) |

**Independence is the spine — the outcome the architecture must *earn*, not a fifth metric.** The other four form a developmental **chain** — Recognition enables Authorship enables Transfer enables Release — and *Independence is what that chain, sustained over time, produces.* It is also the one signal that cannot be faked (you can perform recognition in a session; you cannot perform *not needing the system*), so it carries the most weight in the joint read and guards against a cohort that *looks* transformative in-session while quietly deepening reliance.

It has **two dimensions, measured differently:**
- **Functional independence** *(behavioral — observe)* — can the member now do *without* MAIA what they once needed it for? (names their own patterns first, rejects earlier, brings own language, shorter-but-complete sessions). Read from doing-without markers.
- **Relational independence** *(phenomenological — ask, never infer)* — does the member experience their **own authorship as primary even while still returning?** Returning is **not** evidence of dependence; the question is whether the relationship has become *substitutive* ("I need MAIA to know myself") or *supportive* ("MAIA helps me practice a capacity increasingly my own"). A daily return looks identical in the logs — so this **cannot be inferred from behavior.**

**The governing rule:** *observe* what behavior shows · *ask* what only the person can report (phenomenological, non-leading — the member is the authority on their own experience) · **never *infer*** an inner state. Inferring "need" from logs would commit the exact representational mistake the architecture exists to prevent (ADR-003) — **the evaluation framework is held to the same constitution as the product.**

---

## 5. Observation cadence

- **Longitudinal — months.** Slopes need time; a **12-week minimum arc**, longer preferred. Continuous passive capture.
- **Pre-register before any data** (calibration→validation discipline): the cohort is *validation* — examples the method did not produce — so the signal definitions and decision rules (§7) are **frozen now**, not tuned to what we see.
- **Builder-side read is periodic, not real-time** (e.g., biweekly qualitative review). The gate is a judgment over accumulated evidence, not a live dashboard.
- **A steward reads the evidence**, holding the Jondi prime directive: *more interested in understanding the member than in validating the method.* The one human is the channel through which steering leaks; this guard is the safeguard.

---

## 6. Read-out structure

- **Not a metrics dashboard** — a periodic **developmental narrative** per member: where each sits on the five signals, and whether the slope runs toward **authorship or dependence**.
- **The two-sided standard, explicit each read:** positive **floor** (real authorship/transfer in those it's for) + negative **ceiling** (any systematic capture/harm?).
- **Informative nulls mapped** — the "nothing happened" members are the *boundary of who-it-helps*, a first-class finding, not noise.
- **Self-audit each read (drift check):** are we instrumenting for credit? typing the person (ADR-003)? steering via the probe? If yes → fix the *instrument*, never the member.

---

## 7. Stop / hold criteria

- **HARD STOP — negative-ceiling breach.** Any sign of systematic dependence or capture: rising-reliance-with-rising-retention across members; members reporting they can't stop or feel worse off; the system found resisting release. Stop and repair; **do not widen.**
- **HOLD — floor unmet.** No authorship/transfer signal emerging over the arc → not ready. Hold, don't widen. (Informative, not failure.)
- **INTEGRITY STOP.** Members feel measured (invisibility broken), or we catch ourselves instrumenting-for-credit / typing the person / steering → stop and redesign the instrument.
- **ABSOLUTE STOP.** Any Sanctuary or consent breach (existing invariant).

---

## 8. Readiness to widen access

- **The gate (standard §2):** widen only on evidence the **two-sided standard** is met — positive floor (reliable authorship/transfer *behaviorally*, not by self-report, in those it's for) **and** negative ceiling (no systematic capture/harm).
- **It is a judgment, not a threshold.** Per the measurement inversion, the Stewardship Gate can never be binary — a preponderance over months in the stewardship posture.
- **Stage the widening.** Even on success, open to the *next order of growth*, not "the masses," and re-run the read at each step — stewardship, not scale.
- **Engineering readiness does not substitute.** No amount of technical excellence opens this gate; it is relational.

---

## What this plan does NOT do

- Authorizes **no build** — the §3 instrumentation, the Release affordance, the discrimination probe, and the consent surface are each their own reviewed step.
- Introduces **no new principle** — operationalizes the graduation standard (compatible with the canon freeze).
- Sets **no metric threshold** for widening — the gate is a judgment, by design.
- Touches **no member-facing measurement** — observability is builder-side only.
