# ADR-003: Should `relational_phase` exist as an internal behavioral signal?

**Status:** **Accepted** (2026-06-26) — Option A, *refined*. Implementation pending (read-only wiring trace first; no behavior change until then).
**Date:** 2026-06-25
**Authors:** Kelly + Claude
**Reviewers:** (pending — Kelly)

## Context

`relational_phase` is a `member_spiral_state` column: a 4-stage developmental classification (`1` orientation · `2` capacity · `3` autonomy · `4` seasonal-return). The read-site audit (`docs/architecture/MEMBER_SPIRAL_STATE_AUDIT_2026-06-25.md`) and the UI check established:

- **Person-state by referent** — a developmental-stage claim about *who the member is* (`PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md` §3).
- **Uncomputed.** The oracle never writes it (`upsertSpiralState` omits it); it sits at the schema default `1` for essentially all members unless set manually.
- **No longer member-visible.** Removed from `ContinuityView` + the `/api/members/spiral-state` serialization (commit `a516a76b7`). The display harm is fixed.
- **Still shapes server-side behavior** — but the surface is only *partly* confirmed:
  - **Confirmed:** `lib/relational/relationalStance.ts:106` reads `persistedState.relational_phase` → `≥3` ⇒ competence, `≥4` ⇒ seasonal-return → tone/stance (HOLD / CHALLENGE / RELEASE / MIRROR / SEASONAL_RETURN).
  - **Candidate (wiring NOT traced):** `lib/greetings/greetingScoring.ts`, `lib/consciousness/conversationDepthClassifier.ts`, `lib/library/dynamicRange.ts` each *accept* a `relationalPhase` input parameter. Whether it is fed from `member_spiral_state.relational_phase` (vs. another source, vs. unwired) was **not traced** — confirming this is part of scoping the decision, not an established fact.

The shape of the problem: **a person-state developmental label, with no honest provenance (uncomputed), gates tone (confirmed) and possibly depth/greeting/range.** For most members the gate keys off the constant `1`, so the "developmental adaptation" is largely *not happening* (everyone treated as orientation), and is *inconsistent* for the few whose value was set by hand. Per the persistence framework, **model-/no-provenance person-state shaping behavior is the governed failure mode** — here in an unusually clear form: the signal is fictional.

## Decision

**Question:** Should `relational_phase` exist as an internal behavioral signal at all?

**ACCEPTED (2026-06-26): Option A — refined.** Retire `relational_phase` *entirely* as an internal model of the member, and replace it **not with another person model** (an autonomy / maturity / dependence *score* recreates the same problem with better data) but with three legitimate input classes:
1. **Encounter signals (preferred)** — properties of *this interaction*: first session · returning after a gap · continuing yesterday's thread · an explicit in-the-moment request (brainstorm / challenge / quiet).
2. **Member declarations** — what the practitioner intentionally tells the room (*"challenge me today," "I'm overwhelmed," "help me organize"*).
3. **Earned relational continuity** — recognizable, attributable facts of the relationship (prefers voice · returns to unfinished ideas · has an active project) — *not* developmental stages.

**The deeper reason is scope, not just provenance.** `relational_phase` doesn't merely fail provenance — it **fails scope**: it answers *"what stage is this person in?"* when the room should ask *"what does this encounter require me to hold?"* Even a perfectly-computed person-score stays out of scope. Now the constitutional principle in `PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md` §9: **the room may adapt to the encounter; it must not model the person.**

Options (retained for the record):

- **A — Retire it as a behavioral signal (recommended).** Remove the readers' dependence on `relational_phase`. Where developmental adaptation is genuinely wanted, gate instead on **observed behavioral signals** (`autonomy_streak` / `return_count` — counts of what the member *did*: room-state, honest provenance) or on **member-declared** state. Aligns with the framework: no uncomputed person-state gates behavior.
- **B — Keep it, but make it honest.** If developmental staging is genuinely intended, give it **real provenance** (compute it, or have the member declare it) *and* explicit promotion authority, kept unsurfaced. Heavier; reintroduces a persisted person-state *model* (psychological-centrality cost, `PERSISTENCE_GOVERNANCE` §5).
- **C — Status quo.** Leave it uncomputed (default `1`); readers keep keying off a constant (near-inert for most). Lowest effort, but preserves a fictional person-state signal latent in the behavior path that could silently "wake up" if anyone later wires advancement.

**Recommendation: A.** The signal is currently person-state *and* fictional; retiring it is the framework-aligned and cleanest move. **B** is defensible only with real intent to do developmental staging honestly. **C** is weakest — it keeps the failure mode dormant rather than resolved.

This was a **constitutional/stewardship decision** (it shapes tone and depth), made by the steward. **Decided 2026-06-26 (Option A, refined).** Implementation is the next step and is *not yet done*: (1) a read-only **wiring trace** of the three candidate readers, then (2) re-express `relationalStance` (confirmed) + any traced readers on encounter signals / declarations / earned continuity, or remove them — a reviewable behavior change with before/after checks. No code until that plan is on the table.

## Consequences

### Positive (Option A)
- No uncomputed person-state shapes member-facing behavior.
- Behavior keys off honest, observed signals (counts) or member declarations.
- Removes the latent "wake-up" risk.

### Negative (Option A)
- Requires a **wiring trace first** (confirm whether `greetingScoring` / `conversationDepthClassifier` / `dynamicRange` actually consume this column), then re-expressing `relationalStance`'s branch (certain) + any others on observed signals or removing them → a reviewable **behavior change** with before/after checks on tone/depth selection.
- Loses the *option* of developmental staging unless re-added deliberately (Option B).

### Neutral
- The `relational_phase` **column** can remain (admin observability reads it) or be retired separately. This ADR is about the **behavioral dependence**, not the column.

## References
- `docs/architecture/MEMBER_SPIRAL_STATE_AUDIT_2026-06-25.md` §4/§5
- `docs/architecture/PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md` §3 (Room vs Person), §5 (centrality), §8.3 (provenance ≠ authority)
- Commits: `a516a76b7` (display removal), `2258bbc15` (`dominant_element` reframe)
- Readers (to trace/handle): `lib/relational/relationalStance.ts` (confirmed), `lib/greetings/greetingScoring.ts`, `lib/consciousness/conversationDepthClassifier.ts`, `lib/library/dynamicRange.ts`
