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
| `dominant_element` | `members/spiral-state` API → **`ContinuityView`** (journey page + Account Settings) | **UI display** — element card "Fire" under *"your current position"* (✓ §4) | **Person-ish, state-framed** | model-inferred | **Med** | reframe copy as conversational **register**, not element identity |
| `dominant_element` | `admin/command-center` | observability (aggregate counts) | Room (system metric) | model-inferred | Low | keep (aggregate, not member-facing) |
| `dominant_element` | `relationalStance.ts:106` | read but **not used** in current logic | — | — | None | dead read — ignore / tidy |
| `motion` | oracle load + client API + admin dashboard | continuity / observability **only**; **never in any prompt; no behavioral gating** | **Dead / write-only** | "model-inferred" *in intent only* | **Low now, latent** | **RETIRE** (or re-implement deliberately as room-state, §3) |
| `relational_phase` | `relationalStance.ts:114–118` → `seasonalReturn (≥4)`, `competence (≥3)` → MAIA tone/stance | response-planning (gates tone) **+** developmental-assessment | **Person State** (4-phase developmental stage) | default=1 — **never advanced by the oracle** | **HIGH — live, member-visible, fictional** | **remove from member display + decide gate-tone/exist-at-all (§5)** |
| `relational_phase` | `members/spiral-state` API → **`ContinuityView` (member-visible)** | **UI display** — *"Relational phase: Orientation/Capacity/Autonomy/Seasonal Return"* (✓ §4) | Person | (as above) | **HIGH (surfaced + fictional)** | **remove from member display — highest priority** |
| `relational_phase` | `admin/command-center` | observability (aggregate) | Room (metric) | (as above) | Low | keep aggregate |

**Write path note:** `dominant_element` is written from `voiceHint.element` ← conductor hysteresis ← `spiralogicCell.element` (LLM `inferSpiralogicCell`) = **model-inferred**. `relational_phase` is **omitted** from the oracle's `upsertSpiralState` call (route.ts ~1579–1584) — it is not maintained by conversations.

---

## 2. Headline findings (hypotheses revised by evidence)

1. **`motion` is a dead field.** The write sets `voiceHint.motion = cell?.motion`, but `SpiralogicCell` has **no `motion` field** — so the value is **always null/undefined.** It is read only by the client API and admin dashboard; it touches no prompt and gates no behavior. *(Hypothesis was "ambiguous, reinterpret/narrow." Reality: retire.)*
2. **`dominant_element` is less risky than its name** — read predominantly as continuity + a tone-prime that **already carries the guard** *"do not over-attach,"* not as an identity claim. **UI check (§4): it *is* member-visible** in `ContinuityView` as *"your current position: Fire"* — but framed as current state, not fixed identity → reframe copy as conversational **register**. *(Confirmed; milder than feared.)*
3. **`relational_phase` is the genuine person-state field — live, visible, and fictional.** By referent it *is* a developmental-stage classification; it gates MAIA's tone via `relationalStance`; and **the UI check (§4) overturns the earlier "never surfaced" reading — it IS displayed to members** as *"Relational phase: Autonomy / …"* Meanwhile it is **never advanced by the oracle** (static default `1`). So members are shown a developmental stage about themselves that **was never computed.** *(Hypothesis "highest priority" — confirmed, and made **urgent** by the UI exposure, not softened.)*
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

## 4. UI read-site check — RESOLVED (2026-06-25, read-only)

The frontend reader is **`ContinuityView`** (`components/consciousness/ContinuityView.tsx`), mounted in **two member-facing places**: `app/worlds/journey/page.tsx:71` and `components/account/AccountSettings.tsx:2842`. It fetches `/api/members/spiral-state` and renders the values under the heading *"your current position."*

- **`dominant_element`** → an element card (glyph + colored label **"Fire" / "Water" / …**), framed as *"your current position."* **User-visible** — not a crude *"you are a Fire type,"* but it surfaces the element as a named facet of the member: **person-state-ish, state-framed.** (Milder case → reframe copy as conversational **register**, not identity.)
- **`relational_phase`** → **displayed** as *"Relational phase: Orientation / Capacity / Autonomy / Seasonal Return"* (ContinuityView line 246). **This overturns §2.3's "never surfaced."**
- `motion` → wired to display but always null → renders nothing (confirms dead).
- `autonomy_streak` → "N sessions" — a behavioral count; acceptable.

> **The risk is not hypothetical.** `relational_phase` is **live, visible, person-state, and fictional** — a developmental-stage label shown to members that is **never computed** (static default `1` = "Orientation" for most). **Highest-priority fix: remove it from the member-facing display.**

---

## 5. Steward decisions (not the auditor's to make)

These change **live oracle behavior / member-facing UI** and belong to Kelly:
- **`relational_phase` — HIGHEST PRIORITY.** (a) **Remove from the member-facing display** (`ContinuityView`) — it shows a developmental-stage claim that is person-state *and* never computed (fictional). Immediate fix. (b) Separately, decide whether it should **gate tone at all**, or whether tone should key off **behavioral counts** (`autonomy_streak`/`return_count`) rather than a stage *label* (a real behavior change). (a) is a clean UI fix; (b) is the deeper call.
- **`dominant_element`/`currentElement`** — keep **only if reframed as current conversational register**, not element identity.
- **Retire `motion`** unless a real writer + reader contract are created (dead end-to-end — null write, no behavioral reader).

The audit's job was to make the field *legible*, not to change it. Recommendations emerge from the read-sites; the calls are the steward's.
