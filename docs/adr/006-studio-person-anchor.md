# ADR-006: Studio Person anchor — `studio_people` (identity) + `encounter_participants` (participation)

**Status:** Accepted (2026-06-27, Kelly) — resolves the **Person anchor** open decision named in ADR-005. Docs-only; authorizes **no** implementation.
**Authors:** Kelly Nezat (decision), Claude (drafting)
**Reviewers:** Kelly Nezat

> Resolves the first of ADR-005's two *Open implementation decisions*. The **Session anchor** remains open.

## Context

Three parallel, uncommitted drafts converged on the same need — a canonical Studio Person — by different structures: `relationship_roles[]` on `practitioner_clients` (branch `feat/relationship-roles-additive`, now reference-only); `practitioner_contacts` (#537 spec + draft migration, no roles model, no API/UI); and `studio_people` + `studio_person_roles` (a normalized directory with derived account status, a full API, and a `PeoplePicker` UI — the most realized).

Separately, an already-built participation model — `encounter_participants` (reference branch) — records who took part in a concrete encounter, **including unsaved / anonymous / name-only participants**, with deferred promotion.

The comparison established that `studio_people` is the stronger **identity** anchor, but its participation path (`studio_meetings`) **forces identity creation** (every one-off invitee is upserted into `studio_people`; email required) — which **regresses** the anonymous participation, deferred promotion, and identity-free encounter history that `encounter_participants` already provides. **Identity and participation are different concerns with different authorities.**

## Decision

The canonical Studio Person architecture is **two complementary layers**:

| Layer | Canonical role |
|---|---|
| **`studio_people`** | saved identity directory — members, contacts, guests, colleagues, referral partners, prospects (one record per human a practitioner knows) |
| **`studio_person_roles`** | durable relationship roles on **saved** people (normalized; many per person; account status **derived** from `member_id`, never a role) |
| **`encounter_participants`** | actual participation in a concrete encounter (session / group / event / …), **including unsaved or anonymous participants** |

**Load-bearing rule: participation must not force identity creation.**

Ratified rules:
- `studio_people` stores **saved people only**.
- `studio_person_roles` stores **durable relationship roles** on saved people.
- `encounter_participants` records **who participated in a concrete encounter**.
- `encounter_participants.person_id` is **nullable** — set only when the participant is a saved `studio_people` person; otherwise the row carries a **snapshot** (name, email, phone, role, consent, notes).
- **Unsaved / anonymous / name-only** participants must be representable **without** creating `studio_people` rows.
- A participant may later be **promoted** into `studio_people` by **explicit** practitioner action.

## Explicitly rejected

- `practitioner_contacts` as a parallel canonical table.
- `relationship_roles[]` on `practitioner_clients` as the final anchor (transitional / reference only).
- `studio_meeting_participants` **as-is** if it requires identity creation — it must adopt the nullable-`person_id` participation pattern, or be replaced by `encounter_participants`.

## Consequences

- Preserves the real-world need: all of a practitioner's people live in a trusted relationship directory, while one-time guests participate **without** being absorbed into the permanent directory.
- Implementation will re-point `encounter_participants.person_id` at `studio_people` (the reference branch points it at `practitioner_clients`) — a port detail for the later spec.
- The three streams reused migration numbers `20260627000001/2`; renumbering is reconciled in the implementation spec, not here.

## What this ADR does NOT do

Docs-only. **No code, migration, API, or UI is authorized.** The **Session anchor** (ADR-005's second open decision) remains open. Implementation — re-pointing `encounter_participants.person_id`, retiring the force-identity path in `studio_meeting_participants`, and renumbering migrations — is a separate, later authorization.

## References

- [ADR-005](005-studio-orchestration-domain.md) — Studio as Orchestration Domain (parent; this resolves its Person-anchor open decision).
- Drafts compared: `studio_people` / `studio_person_roles` / `studio_meetings` (faq working tree); `practitioner_contacts` (#537); `encounter_participants` (branch `feat/relationship-roles-additive`).
- Heuristic: separate-by-authority-source.
