# ADR-003: Should `relational_phase` exist as an internal behavioral signal?

**Status:** **Accepted** (2026-06-26) — Option A, *refined*. Wiring trace **complete** (see *Implementation sizing*); behavioral retirement is a **one-file** change in `relationalStance`, not yet made. No runtime code changed by this ADR.
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
  - **Now traced (2026-06-26) — NOT live consumers:** `greetingScoring` (param typed, read nowhere; router off the oracle path), `conversationDepthClassifier` (body reads it, but its sole caller passes no `relationalPhase` → always `undefined`), `dynamicRange` (`calculateDynamicRange` has zero callers). See *Implementation sizing*.

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

This was a **constitutional/stewardship decision** (it shapes tone and depth), made by the steward. **Decided 2026-06-26 (Option A, refined).** The read-only wiring trace is now **complete** (below); implementation — a one-file `relationalStance` change — is the next step and is **not yet made** (a separate commit, kept apart from this evidence record).

## Implementation sizing (verified wiring trace — 2026-06-26)

The read-only trace (load-bearing claims verified by direct read of the call sites) collapses ADR-003's "up to four readers" concern to **one**:

| Reader | Live consumer? | Evidence |
|---|---|---|
| `relationalStance` | **YES — the only one** | oracle route passes `persistedState: spiralState` (incl. `relational_phase`); used at `relationalStance.ts:115` (`≥4` → seasonal-return) and `:118` (`≥3` → competence), guarded `?? null`. |
| `greetingScoring` | No | `relationalPhase` appears only at the type decl; read nowhere in the body; its router is not on the oracle path. |
| `conversationDepthClassifier` | No | its body reads `relationalPhase`, but its sole caller (`voice/stream-conversation`) passes `{activation, conversationLength, posture, mode}` — no `relationalPhase` → always `undefined`. |
| `dynamicRange` | No | `calculateDynamicRange` has **zero callers**. |

- **Column is not app-written.** The only `upsertSpiralState` caller (the oracle route) omits `relational_phase` → it stays at the schema default `1` for normal members.
- **`memoryPlan` copy is dead weight.** `relational_phase` is read into `memoryPlan.spiralState` (oracle route) but `memoryOrchestrator` reads it **0 times** → it never reaches a prompt.
- **Behavioral effect today is near-zero.** Because the column is static `1`, `relationalStance`'s `≥3` / `≥4` branches essentially never fire; the only members affected by retirement are the rare hand-set ones, who fall back to the existing `returnCount` / `autonomyStreak` paths. The `?? null` guards already make this graceful.

**Therefore:**
- **Behavioral retirement = one file** (`relationalStance`): drop / stop feeding the `relational_phase` branch; the fallback is already present; near-zero behavior change. The three non-consumers need nothing.
- **Full column retirement** (load / upsert-setter / `getSpiralStateSummary` / admin-aggregate / the dead `memoryPlan` copy + a migration) is a **separate, optional** schema cleanup — **out of scope for this ADR's decision.**

## Consequences

### Positive (Option A)
- No uncomputed person-state shapes member-facing behavior.
- Behavior keys off honest, observed signals (counts) or member declarations.
- Removes the latent "wake-up" risk.

### Negative (Option A)
- A reviewable **behavior change** in **one file** (`relationalStance`) — re-express or drop its `relational_phase` branch. The `?? null` fallback to `returnCount` / `autonomyStreak` is already present, so the effective change is near-zero (the trace confirmed the other three are not live consumers).
- Loses the *option* of developmental staging unless re-added deliberately (Option B).

### Neutral
- The `relational_phase` **column** can remain (admin observability reads it) or be retired separately. This ADR is about the **behavioral dependence**, not the column.

## References
- `docs/architecture/MEMBER_SPIRAL_STATE_AUDIT_2026-06-25.md` §4/§5
- `docs/architecture/PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md` §3 (Room vs Person), §5 (centrality), §8.3 (provenance ≠ authority)
- Commits: `a516a76b7` (display removal), `2258bbc15` (`dominant_element` reframe)
- Readers (traced 2026-06-26): `lib/relational/relationalStance.ts` (**live — the only consumer**); `lib/greetings/greetingScoring.ts`, `lib/consciousness/conversationDepthClassifier.ts`, `lib/library/dynamicRange.ts` (**not live consumers**)
