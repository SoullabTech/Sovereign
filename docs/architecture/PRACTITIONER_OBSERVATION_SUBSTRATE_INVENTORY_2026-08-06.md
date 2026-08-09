# Observation Substrate Inventory — Five Axes

**Date:** 2026-08-06 · **Measured at:** `f5c5b7ab9`
**Status:** ⛔ **INVENTORY. Rules nothing. Chooses neither substrate.**
**Answers:** founder directive — *"Before choosing either one, inventory: who writes each; whether
writes are human- or MAIA-authored; whether they are private, shared, or developmental; what consent
applies; whether either is already used in runtime composition. Then decide whether they represent
genuinely different objects or accidental duplication."*
**Lane:** Practitioner Perspective and Authority — Live Substrate Reconciliation (step 4)

---

## 0. The finding that changes step 4

> **They are not duplicates. They are the two ends of a crossing — and the bridge between them
> does not exist.**

`studio_practitioner_observations` holds the practitioner's observation **before** it crosses.
`member_memory_atoms` with `source_type='practitioner_observation'` holds one **after** it has
crossed into the member's field. Same concept, two authority states. But **nothing promotes the
first into the second** — the crossing writer is an unrelated With Me path (§3).

So the reconciliation question is not *"which one do we keep?"* It is:
**"is the missing crossing a gap, or is it the boundary working correctly?"**

That question belongs in the perspective ruling, not in a cleanup pass.

⚠️ A third substrate — `studio_field_signals` — sits alongside them and is the one that actually
carries the hazard (§2). It was not in the founder's framing of step 4.

---

## 1. `studio_practitioner_observations` — the practitioner's private observation

**[O]** `database/migrations/20260312000001_studio_practitioner_loop.sql:68`

| Axis | Finding |
|---|---|
| **Who writes** | The practitioner, via `POST /api/studio/practitioner-observations`. Identity from `getCurrentPractitioner(request)`; `practitioner_id` is server-derived, never client-supplied. |
| **Human or MAIA authored** | **Human only.** No `source` column, no generator, no confidence score. `content TEXT NOT NULL` + `observation_type ∈ {in_session, relational_field, somatic_shift, pattern_notice, interruption, repair, other}`. |
| **Private / shared / developmental** | **Private to the practitioner.** Every read is scoped `practitioner_id = $1`. Attached to `decision_id` / `change_id` — the practitioner's *own* reflective objects, not the member's. `client_id` is a pointer, not a grant. |
| **Consent** | ⚠️ **None — and structurally none is needed.** **[O]** the migration has **zero** occurrences of `consent`, `shared`, `visible`, `crossing`, or `member`. The member is never shown this and it never enters their field. |
| **Runtime composition** | ✅ **Yes** — read by `app/api/studio/changes/[id]/consult/` and `.../decisions/[id]/consult/` into a `DecisionInputBundle` → `consultChangeCouncil(...)` → `buildChangeQuestion(..., inputBundle, ...)`. |

> **Disposition: this is the healthy one.** Practitioner-authored, practitioner-private, no
> system authorship. It is a legitimate substrate for a *Professional Development* room.

---

## 2. ⚠️ `studio_field_signals` — the one carrying the hazard

**[O]** same migration, line 44. Not named in the founder's step 4, but it is the sibling that
matters most.

| Axis | Finding |
|---|---|
| **Who writes** | `POST /api/studio/field-signals`, practitioner-authenticated. |
| **Human or MAIA authored** | 🔴 **Both.** `source TEXT NOT NULL CHECK (source IN ('client', 'practitioner', 'maia'))` — plus `intensity NUMERIC(3,2) CHECK (0..1)`. **MAIA is a first-class author of scored claims here, by schema.** |
| **Private / shared / developmental** | Practitioner-scoped on read, but the `client` source means member-originated material sits in a practitioner-owned store. |
| **Consent** | 🔴 **None.** No member-side control over a `source='client'` or `source='maia'` signal about them. |
| **Runtime composition** | ✅ **Yes** — same `/consult` bundle as §1, including `intensity` scores. |

> 🔴 **Disposition: this is the third instance of the hazard class**, after `practitioner_growth`
> and `pattern_ledger`. Same shape every time: **system-authored claim + numeric score + no
> authorship gesture.** ⛔ Do not reconcile §1 and §3 without ruling on §2 — a "Wisdom" room built
> over the `/consult` bundle would inherit MAIA-authored scored signals about members.

---

## 3. `member_memory_atoms` + provenance — the observation **after** it crosses

**[O]** `database/migrations/20260624000001_practitioner_observation_provenance.sql`

| Axis | Finding |
|---|---|
| **Who writes** | **[O]** `app/api/studio/with-me/sessions/[sessionId]/route.ts:139-145` — the only writer. Inserts into `member_memory_atoms` with `source_type='practitioner_observation'`, `facilitator_id`, `epistemological_status`, `status`, `return_preference`. |
| **Human or MAIA authored** | Human (facilitator) — **but** `epistemological_status` admits `'inferred' -- derived from patterns (system-generated)`. ⚠️ The column *permits* system authorship even though today's only writer is human. |
| **Private / shared / developmental** | **In the member's field.** This is the crossed state. The migration's stated intent: enters memory as *"witnessed"* — *"facilitator saw this, not: this is unquestioned truth about the member."* |
| **Consent** | ✅ **Real and layered** — `return_preference` (the atoms consent model), `status`, and reversibility: *"atoms can be set_aside or archived without affecting member-authored atoms."* |
| **Runtime composition** | ✅ Yes — as member memory, through the atoms loader. Which is the point: it crossed. |

> **Disposition: this is the correct crossing model.** It is the only one of the three with a
> consent gate, a provenance register, and reversibility. ⭐ It is also the closest existing
> implementation of the founder's *"nothing crosses automatically, everything crosses
> intentionally."*

---

## 4. Side-by-side

| | §1 `studio_practitioner_observations` | §2 `studio_field_signals` | §3 crossed atom |
|---|---|---|---|
| Author | practitioner only | practitioner · client · **maia** | facilitator (col. permits `inferred`) |
| Numeric score | — | 🔴 `intensity 0..1` | — |
| Whose field | practitioner's | practitioner's (mixed origin) | **member's** |
| Consent gate | n/a (never crosses) | 🔴 none | ✅ `return_preference` + reversible |
| Provenance register | — | `source` only | ✅ `epistemological_status` + `facilitator_id` |
| In `/consult` bundle | ✅ | ✅ | — |
| Verdict | healthy | 🔴 hazard | ✅ correct model |

**Genuinely different objects — not accidental duplication.** §1 is pre-crossing, §3 is
post-crossing, §2 is a mixed-origin store that should probably not exist in its current shape.

---

## 5. What the ruling now has to decide about these three

1. **Is the missing §1→§3 bridge a gap or a boundary?** If a practitioner's private observation
   should ever become member-visible, it needs the §3 crossing gesture — not a copy.
2. **Does `studio_field_signals.source='maia'` survive at all?** If MAIA may not author
   developmental claims about a practitioner (`practitioner_growth`) or about a member
   (`pattern_ledger`), it is hard to see why it may author scored signals about either here.
3. **Does `epistemological_status='inferred'` survive on member atoms?** It is currently unused by
   the only writer. Removing it is cheap now and expensive later.
4. **What is the `/consult` bundle's perspective?** It is scoped to one change/decision — one
   relationship — which is arguably legitimate under the founder's question 2. But it currently
   mixes practitioner-authored, client-authored, and MAIA-authored material into one prompt with no
   authorship marking in the bundle shape.

⛔ **This document rules none of the four.**

---

## 6. Containment already in place

`__tests__/practitioner-authority-boundaries.test.ts` — **17 pins, all green at `f5c5b7ab9`.**

- **PIN 1** `/api/caseload` is not a MAIA context source (4 assertions, all clean).
- **PIN 2** `practitioner_growth` quarantined — confined to 2 files, no generator, no UI.
- **PIN 3** member private material does not reach practitioner-development surfaces.
- **PIN 4** `pattern_ledger` → practitioner: **one live violation baselined, may shrink, may never grow.**

The suite is green *because one violation is baselined*, not because the tree is clean. ⛔ Do not
edit the allowlist to resolve a failure — a failure means something crossed a boundary still under
founder review.
