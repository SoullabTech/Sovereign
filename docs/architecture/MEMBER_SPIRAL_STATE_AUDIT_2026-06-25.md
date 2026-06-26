# `member_spiral_state` — Read-Site Audit

**Date:** 2026-06-25
**Status:** Code-review artifact. The first **design → live-code** action under `PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md` §8.5. Empirical: classifies each field by **what its readers do with it**, not by what the schema says.
**Method:** traced read-sites through `lib/consciousness/spiralStatePersistence.ts`, `lib/voice/conductor.ts`, `app/api/oracle/conversation/route.ts`, `lib/relational/relationalStance.ts`, `app/api/members/spiral-state/route.ts`, `app/api/admin/command-center/members/route.ts`, and the migration. Writes distinguished from reads.

> **Frame:** not *"is this table good or bad,"* but *"what does each field become when read."*

---

## 1. Audit table

| Field | Read site | Reader behavior | Effective referent | Provenance | Risk | Recommendation |
|---|---|---|---|---|---|---|
| `dominant_element` | `conductor.ts` (seed hysteresis if buffer empty) | continuity (avoid-reset) | **Room** | model-inferred | Low | keep |
| `dominant_element` | `memoryOrchestrator` prompt block: *"Current state context: {el}/{ph}. Let this inform elemental tone lightly; **do not over-attach**."* | response-planning (tone-prime, **guard already present**) | Room (read), value is person-shaped | model-inferred | Low–Med | rename → `last_effective_register`; keep guard; wrap in typed accessor |
| `dominant_element` | `members/spiral-state` API → client as **`currentElement`** | UI-adaptation | **Mixed → Person *if* UI shows "your element is X"** | model-inferred | **Med (the real exposure point)** | **check UI copy** (open Q §4); if identity-presented, reframe as session register or drop |
| `dominant_element` | `admin/command-center` | observability (aggregate counts) | Room (system metric) | model-inferred | Low | keep (aggregate, not member-facing) |
| `dominant_element` | `relationalStance.ts:106` | read but **not used** in current logic | — | — | None | dead read — ignore / tidy |
| `motion` | oracle load + client API + admin dashboard | continuity / observability **only**; **never in any prompt; no behavioral gating** | **Dead / write-only** | "model-inferred" *in intent only* | **Low now, latent** | **RETIRE** (or re-implement deliberately as room-state, §3) |
| `relational_phase` | `relationalStance.ts:114–118` → `seasonalReturn (≥4)`, `competence (≥3)` → MAIA tone/stance | response-planning (gates tone) **+** developmental-assessment (the label itself) | **Person State** (a 4-phase developmental stage) | default=1; manual/practitioner-set — **never advanced by the oracle** | **Med–High by type, but low live-exposure** | highest-priority *redesign decision* (§3, §5) — but see findings |
| `relational_phase` | `members/spiral-state` API | returned but **not displayed** | Person | (as above) | Low (not surfaced) | confirm UI keeps it unsurfaced |
| `relational_phase` | `admin/command-center` | observability (aggregate) | Room (metric) | (as above) | Low | keep aggregate |

**Write path note:** `dominant_element` is written from `voiceHint.element` ← conductor hysteresis ← `spiralogicCell.element` (LLM `inferSpiralogicCell`) = **model-inferred**. `relational_phase` is **omitted** from the oracle's `upsertSpiralState` call (route.ts ~1579–1584) — it is not maintained by conversations.

---

## 2. Headline findings (hypotheses revised by evidence)

1. **`motion` is a dead field.** The write sets `voiceHint.motion = cell?.motion`, but `SpiralogicCell` has **no `motion` field** — so the value is **always null/undefined.** It is read only by the client API and admin dashboard; it touches no prompt and gates no behavior. *(Hypothesis was "ambiguous, reinterpret/narrow." Reality: retire.)*
2. **`dominant_element` is less risky than its name** — it is read predominantly as continuity + a tone-prime that **already carries the guard** *"do not over-attach,"* not as an identity claim. Its one real exposure is the **UI** surfacing it as `currentElement` (open question §4). *(Hypothesis "mixed, rename/constrain" — confirmed, and milder than feared.)*
3. **`relational_phase` is the genuine person-state field — but largely inert.** By referent it *is* a developmental-stage classification, and it *does* gate MAIA's tone via `relationalStance`. **But:** it is never prompt-asserted, never surfaced to the member, and **never advanced by the oracle** (it sits at the schema default `1` unless set manually). So the developmental "stage" driving tone is, for most members, **a static default — a classification that is mostly fictional.** *(Hypothesis "highest priority for redesign" — confirmed by type; softened by exposure.)*
4. **The schema names misled in *both* directions** — `dominant_element` sounds like identity but reads as tone; `relational_phase` sounds like benign structure but is a developmental person-claim. This is the whole point: **a field is what its readers make it**, not what it's named.

---

## 3. Enforcement plan

| Problem | Preferred fix |
|---|---|
| `motion` dead / write-only (always null) | **Retire** the field + remove the dead write; if "motion/trajectory" is wanted later, design it deliberately as **room-state** (trajectory *of the work*) with a reader contract — not a person-condition |
| `dominant_element` possibly UI-presented as identity (`currentElement`) | Verify UI copy (§4); if it says "your element is X," reframe as *session register / today's weather* or drop it |
| `dominant_element` model-inferred, person-shaped, read as tone | **Rename → `last_effective_register`**; preserve the existing *"do not over-attach"* guard; expose via typed accessor `registerForResponsePlanning()` so no reader can promote it to identity |
| `relational_phase` = person-state developmental stage gating tone, with no honest provenance (static default) | **Steward decision (§5).** Either (a) gate tone on **observed counts** (`autonomy_streak`, `return_count` — behavioral, room-ish) instead of a stage *label*; or (b) if developmental staging is genuinely intended, give it explicit promotion authority **and** real provenance, and keep it unsurfaced/unasserted |
| Legitimate continuity (element seed; `autonomy_streak`/`return_count` behavioral counts) | **Preserve as room obligations** |
| Ambiguous naming (`dominant_element`, `relational_phase`) | Rename to referent-honest names |

---

## 4. Open empirical question (not determined by this audit)

Does the **member-facing UI** render `currentElement` (and would it render `relational_phase`) as a **claim about the member** ("Your element is Fire") versus a soft session-register/mood? The fields are serialized to the client; whether the UI *presents them as identity* was not traced. **This is the single read-site that decides `dominant_element`'s risk** — a frontend check, before any rename.

---

## 5. Steward decisions (not the auditor's to make)

These change **live oracle behavior** and belong to Kelly:
- **Retire `motion`?** (Cleanest, lowest-risk — it's already null. Touches a migration + the dead write.)
- **`relational_phase`:** gate tone on behavioral counts vs. a developmental *stage*? Removing/reworking the `relationalStance` dependency changes how MAIA chooses tone (HOLD/CHALLENGE/RELEASE/MIRROR/SEASONAL_RETURN). A real behavior change — decide intent first.

The audit's job was to make the field *legible*, not to change it. Recommendations emerge from the read-sites; the calls are the steward's.
