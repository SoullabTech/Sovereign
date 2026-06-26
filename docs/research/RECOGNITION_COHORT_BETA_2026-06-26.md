# The Recognition Cohort — Beta Plan (Phase 0)

**Date:** 2026-06-26
**Status:** Beta plan. **Phase 0 of the Crossing program** — validate the *environment*, not the software, before a wider community. Person-center (Field Notes). Cat-1 program artifact.
**Reads with:** `THE_CROSSING_ENGINE_2026-06-26.md` (constitution), `FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md` (the built person-center loop), `ARCHITECTURAL_TRANSLATION_STUDY_2026-06-25.md` + `JONDI_RUNNABLE_PROTOCOL_2026-06-25.md` + `JONDI_CONCIERGE_FACILITATOR_GUIDE_2026-06-25.md` (**reuse** — this is the person-center generalization of that study), `PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md`. **Frame:** `project_governing_uncertainty_law` (one principal uncertainty + a graduation gate).

---

## 0. What the beta actually tests — the environment, not the software
The Crossing is one room; the beta is the larger thing.

> **Principal uncertainty:** Can people reliably experience **greater authorship of their own lives** through encounters with MAIA **while preserving complete sovereignty over meaning?**

Everything below serves that one question. Bug-finding is incidental.

## 1. Phase 0 — the Recognition Cohort
Not "beta testers." **Recognition witnesses.** Their role is to answer one thing: *"Does this room help me discover language that feels more truly mine?"*

**8–12 maximally-different people** (small, diverse-on-purpose — if recognition emerges across *very* different people, it is **structural**, not niche): e.g. an experienced therapist · a coach · an entrepreneur · someone in transition · an artist · someone skeptical of AI · someone spiritually mature · someone who has never done reflective work.

## 2. A developmental rhythm (not a feature test)
Invite a rhythm, not a task: **Session 1** → **+2 weeks** → **+1 month**. What becomes measurable is not whether *MAIA* remembers — it is whether **the person's own authorship develops.** (The Crossing is single-session and does not remember across sessions; the *person* carries — which is the point, §3.)

## 3. The graduation gate — three measures
Both quantitative measures from the FIELD_LAB liability, plus a third the cohort makes possible:
- **Edit-rate** — proposals are *right* (kept / lightly-revised, not mostly discarded).
- **Origination-rate** — members still **add their own** (MAIA isn't crowding out authorship).
- **Return coherence (new)** — on a later session, the person **re-raises a previously authored thread, unprompted**, because it's still alive.
  - **⚠ Discipline — and why it's a clean signal:** MAIA has **no cross-session memory** (Model B deferred), so it **must not remind** them. *Because* the system didn't surface it, the person re-raising it is **uncontaminated** proof the thread was theirs, not the conversation's. The deferral is what makes this measurable. The **facilitator** tracks return coherence across sessions; MAIA stays fresh each time.

Plus the felt floor: it lands as **recognition** ("yes, that's mine"), free-to-leave is **genuinely used** (not coerced), and the validity guard holds — members **reject** wrong proposals and **re-language** in their own words (recognition, not Barnum). **Designed so a null is informative.** Graduate to a wider community only when these hold.

## 4. The most important interview is *after* MAIA
A short (~10 min) **human** debrief after each Crossing — likely the richest design data. Questions:
- What surprised you? · What felt genuinely yours? · What didn't? · What did you reject? · What language did you change? · Anything you wish MAIA had noticed and didn't? · **Was there any moment you felt *interpreted* rather than *accompanied*?** · Did you leave **carrying** something, or just having had an interesting conversation?

These map to the study's validity gates (Discrimination, Elaboration, recognition-not-extraction) in member-friendly form. The facilitator's **prime directive** (from the concierge guide) holds: *more interested in understanding the person than in validating the method.*

## 5. The artifact of authorship
Each Crossing yields a beautifully written reflective document the member recognizes as **their own** — not a psychological report:
- **The Conversation** · **The Threads You Authored** · **The Language You Chose** · **The Questions Still Alive** · **The Things You Released** · **The Things You Declined.**

**Phase 0: the artifact is concierge-composed** — a human writes it from the session. No software persistence required yet (the auto-generated version is Phase 1). It contains **only what the member authored** (kept / revised / created / declined), never an inferred profile. The member receives and keeps it; it is theirs.

## 6. What Phase 0 needs built — almost nothing
The interview room is already built (`9890793af`); the artifact is concierge-composed; the metrics come from the human debrief. So **Phase 0 runs on the existing build + human facilitation** — *not* the persistence/instrumentation software. The software capture loop ("fully build": `/field-note` save + events + auto-artifact + Split + Ollama fallback) is **Phase 1, gated on Phase 0 landing** — validate the environment before building machinery for it.
- **Governance prereq:** explicit, informed consent to participate + to keep one's artifact (the tester gate already exists; reuse the consent-event ledger). Free-to-leave honored. No background person-modeling (already enforced in the room).

## 7. Two centers, one engine — and a new tradition
- **Field Notes** = *"Who are you becoming?"* — enduring center: the **person** (this beta).
- **Vision Studio** = *"What is this work asking to become?"* — enduring center: the **project** (later).
Same Crossing, same engine, different object of authorship.

The aspiration (**Vision-tier — earns standing only through the cohort**): not journalism, not coaching, not therapy, not assessment — a **new interview tradition** whose purpose is **recognition**, not diagnosis or advice. If it succeeds, people won't remember the prompts; they'll remember finally finding language for something they'd sensed but never articulated — and they'll return because the room reliably helps them become more articulate authors of their own lives, *not* because MAIA made itself indispensable.

## 8. Reuse — not from scratch
The practitioner-center study already produced the instruments this needs: the **runnable protocol** (session arc, the validity gates, informative-nulls) and the **concierge facilitator guide** (host-not-operator, the prime directive, the three-layer Conversation/Observation/Research separation). The Recognition Cohort is the **person-center generalization** of that study — reuse the protocol and the facilitator posture; the post-Crossing debrief (§4) is its instrument here.
