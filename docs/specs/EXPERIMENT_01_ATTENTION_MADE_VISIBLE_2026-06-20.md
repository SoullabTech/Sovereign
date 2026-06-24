# Experiment 01 — Faithful Attention Made Visible

**Date**: 2026-06-20 · **Status**: **Held spec — observability-first. Building it is a crossing that awaits explicit authorization** (no code, schema, or member-facing surface exists yet). Companion to the holding brief (`ELEMENTAL_BECOMING_FIELD_2026-06-20.md` §0.4–0.5) and the research synthesis.
**Design origin**: Kelly, 2026-06-20 — "I wouldn't build Elemental Movement Curation. I would build something even smaller. One observational surface."

---

## Central hypothesis (the one thing this tests)

> **Faithful attention, made visible — with nothing added — increases a person's capacity to recognize their own life.**

Not: did MAIA identify the right element/type. But: *did being seen help the member recognize something they hadn't noticed?* This tests the bedrock (attention → recognition) directly, before any symbolic layer.

## The surface

MAIA, **occasionally** (rarely; well-timed; never on a schedule that reads as nagging), offers a single declinable gesture:

> "I've noticed something that's come up a few times over the last few weeks. Would you like me to share it?"

- **If the member declines** → nothing happens. Nothing is stored as "rejected," nothing is retried soon. The decline is itself a healthy outcome (see metrics).
- **If the member accepts** → MAIA offers, and stops:
  - **three observations**, each **traceable to the member's own words/marked material** (recurrences in what *they* wrote/said), and **broad — not pre-sorted toward one reading**;
  - **one reflective question** ("What do you notice?");
  - **(v1 only)** **one symbolic possibility**, offered as possibility ("some traditions associate this with X — does that fit, or does another image?").

Then, separately, the single test question:

> "Did this help you recognize something you hadn't noticed before?"

## Staging (observability-first)

- **v0 — attention alone.** Three traceable observations + the question. **No symbolic possibility.** Isolates the foundational variable: *does being seen, by itself, produce recognition?*
- **v1 — + one symbol.** Adds a single offered-as-possibility image, only after v0 shows attention-alone is received well. Lets us attribute any lift to the symbol vs. the attention.
- Phase-1 throughout = **observability**: log offered / accepted / declined / answered, and the member's free-text answer. **No prompt-influence beyond the surface itself; no profile written.**

## Locked-answer table

| MAIA MAY | MAIA MUST NOT |
|---|---|
| Offer the noticing as a question; accept "no" silently | Assert a type/identity ("you are / your element is") |
| Name **three observations traceable to the member's own material** | Surface anything not traceable to the member's own words |
| Offer **one** symbol as possibility (v1), declinable | Predict trajectory / "where this is heading" (non-prestatability) |
| Ask "what do you notice?" / "does that fit, or another?" | Conclude what it means; recommend an action |
| Leave meaning entirely to the member | Synthesize observations into a claim the member didn't make |
| Hold breadth (not pre-sorted toward one reading) | Persist a "profile" / "dominant element" / score |

## Guards (each traceable to a now-clarified principle)

- **Traceability** — observations drawn only from the member's own marked material (defeats Barnum; research §4).
- **Breadth** — not pre-sorted toward one element/reading (curation-isn't-neutral; §0.3).
- **Offer-as-possibility** — the Lens Principle; symbols never asserted.
- **Continual permission** — the opening question *is* present-tense, revocable consent made into one gesture; Sanctuary sessions are excluded entirely.
- **Present-tense, no forecast** — "what's recurred," never "what you're becoming."
- **Choice, not action** — the closing question asks about *recognition*, never prompts a behavior.

## Measurement (without measuring identity)

- **Primary:** the member's free-text answer to "did this help you recognize something you hadn't noticed?" (own words, not a rating).
- **Decline rate (healthy signal):** a surface that is *never* declined is coercive or Barnum. Some "no" is a sign of genuine, declinable consent.
- **Over time (the real metric):** does recognition get *easier*; does the member author *more* of the meaning; do they become **less dependent on MAIA to recognize themselves**. **Confound to control:** declining usage alone cannot distinguish *graduation* from *churn* — pair usage with the member's own report of capacity.
- **Explicitly NOT measured:** symbol "accuracy," type stability, engagement/retention.

## Scope & rollout

- **Tester-gated first** (per the Field Lab tester-gate precedent), not general rollout.
- **Consent-gated at the service chokepoint**, fail-closed; opt-out honored; Sanctuary excluded.
- Smallest possible surface; fully reversible.

## What this does NOT do

- Does not type, profile, diagnose, predict, recommend, or persist an identity.
- Does not build "Elemental Movement Curation" (this is smaller — it tests attention itself; elements appear only as one optional v1 dialect).
- Does not authorize itself: **implementation is the crossing.** Building requires Kelly's explicit go. Recommended first act of embodiment *before* this surface: the essence-residue subtraction (`task_cdbe3aa3`) — make the code stop contradicting the constitution first.

## Sequencing (Kelly directive, 2026-06-20): EXPERIMENT BEFORE CLEANUP

Reverse the earlier "subtraction first" order. The experiment runs *first* — because cleanup creates only doctrinal consistency, while the experiment creates *knowledge* (whether faithful attention itself produces recognition). The residue cleanup (`task_cdbe3aa3`) is not abandoned; it is no longer the prerequisite. Instead, **scope v1's testers to a path that does not also traverse the essence-residue modules** (`maia-therapeutic-wisdom`, `conversation-elemental-tracker`, etc.), so the experiment's signal is not confounded by parallel typing.

## v1 design lock — APPROVED by Kelly 2026-06-20 (with four changes)

Kept: deterministic pipeline · pre-LLM architecture · opt-in · tester-gating · the single reflective question. Changed: terms→referents · no visible counts · conversational language · added usefulness measure. Public framing: **"Something I noticed"** — no brand, no feature-name, no ontology; the experiment must disappear *as* an experiment.

- **No symbol** in v1 (symbol is "Version 2"). v1 isolates attention alone.
- **Offer** (rare — once every week or two, well-timed): *"I've noticed something across our conversations. Would you like me to share it?"*
- **No → nothing happens; the decline is recorded as data** (a surface never declined is coercive/Barnum).
- **Yes →** exactly **three observations**, in ordinary conversational language, then one question: *"Does anything here feel important to you?"* No interpretation, no theme, no advice, no symbol, **no visible counts** (the count is stored, never foregrounded — recurrence is the point, not memory-precision).
  - Observation form: *"Your sister has come up in several conversations over the last few weeks."* / *"One thing that's appeared often in our conversations is [referent]."*
- **Then, occasionally (not every time): a usefulness measure** — *"Was this helpful?"* with exactly three responses: **Yes / No / Not sure.** (Recognition ≠ usefulness; a strong reflection paired with "not helpful" is valuable falsifying data.) Stored separately from the free-text answer.

### The selection unit — REFERENTS, not terms (mechanical, non-interpretive)

Terms are too lexical (they miss "Kristen"="my sister"="she" and overcount favourite vocabulary). The unit is the **referent.** But the *full* notion of referent forks on inference, so v1 is split:

- **v1 = deterministic concrete referents** — named people, places, projects, books, events, organizations (proper nouns / concrete named entities), selected by **recurrence across distinct conversations**. Entity-level, not lexical; **zero inference, no LLM, no model, no significance-judging.** Do NOT reuse the interpretive `lib/maia/recurrenceDetector.ts` (it classifies model-judged themes).
- **v1.5 (deferred — a deliberate crossing, its own review): coreference + theme-clustering** — merging "Kristen / my sister / she" into one person, or "exhausted / drained / nothing left" into one state. Both require MAIA to *infer*, which (a) breaks v1's deterministic property and (b) reintroduces the confound — *did recognition come from attention, or from MAIA's cleverness at inferring?* This is the **first place MAIA makes an inference about the member's material**; it crosses only with explicit review.

## Post-review doctrine + fixes (applied 2026-06-20)

Constitutional review of the *built* v1 caught two **relationship** bugs in technically-correct, type-clean code; Kelly elevated both into doctrine:

1. **The first articulation of recognition is constitutionally protected space.** When the member answers *"Does anything here feel important to you?"*, MAIA records the answer and returns a minimal acknowledgment of the *act of sharing* — **"Thank you for sharing that."** — then stops. **No LLM; no interpretation, affirmation, synthesis, encouragement, or coaching.** The first recognition is still forming; anything MAIA said would change the conditions under which it develops (cf. a qualitative researcher refusing to contaminate a participant's first account). *Fixed:* the answer branch returns and never falls through to the LLM (`route.ts`, mode `noticing-acknowledged`).

2. **The gesture must never compete with the conversation.** The offer is withheld whenever the member's current message could be an immediate human concern; it surfaces only on a clear, low-concern opener. An attention experiment may not interrupt the attention it tests. *Fixed:* `checkNoticingGate` takes the current message and gates on `isLowConcernOpener` (deterministic greeting check, fail-safe to withhold); the `sessionTurns` guard is removed.

3. **Occasional, not scheduled.** Predictable cadence turns "recognition" into "responses to a feature." Sparseness now emerges from the *conjunction* of conditions (returning member + greeting opener + 14-day floor + ≥3 named referents) — unpredictable to the member, no randomness needed.

**The three conversational modes (constitutional distinction — the deeper lesson):** the first implementation collapsed three distinct relationships into one. They stay separate:
- **Attention** — MAIA observes; no interpretation. *(the offer + the three observations)*
- **Recognition** — the member speaks; MAIA protects the space. *(the answer → minimal acknowledgment, no LLM)*
- **Inquiry** — continuing the thread; *only* after the member explicitly asks. *(NOT in v1)*

**What this validated:** the code compiled and was type-clean; the constitution still said *no*. The review checked whether the *relationship* remained faithful — a higher standard than correctness — and caught two issues the implementation had no way to recognize.

## If authorized — what implementation entails (named, so authorization is eyes-open)

1. A detection of *member-traceable recurrences* (mechanical/transparent, from the member's own material — no new inference engine, no significance-judging).
2. The declinable surface + the two questions, surfaced occasionally in the live flow (member-facing language **reviewed and signed off by Kelly against the locked table before any tester sees it**).
3. A consent gate at the chokepoint (opt-out flag, fail-closed) + Sanctuary exclusion + observability logging (offered / accepted / declined / answer).
4. Tester-gate, on a path clear of the essence-residue modules; no general-member exposure until v1 results are read.
5. Residue cleanup (`task_cdbe3aa3`) follows, not precedes.
