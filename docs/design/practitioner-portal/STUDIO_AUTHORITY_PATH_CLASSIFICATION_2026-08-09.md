# Studio Authority-Path Classification

**Status: EVIDENCE — 2026-08-09.** ⛔ Repairs nothing, proposes nothing, authorizes nothing.
Classifies each use of `practitionerId` under the ratified
[Identity-to-Authority Bridge](FOUNDER_RULING_IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md).

⭐ **The two classes, as directed:**

| Class | Meaning |
|---|---|
| ✅ **Practitioner-owned scope** | the object belongs to the practitioner's own practice — ⭐ therefore **conforming**; `practitionerId` (or the practitioner's *own* `memberId`) is the correct key |
| ⛔ **Relational authority over another member** | the route reaches a **second person's** identity or material — ⛔ therefore requires **member-to-member commitment evaluation** |

---

## 0. ⚠️ Method and limits

| | |
|---|---|
| **Population** | **76 route files** using `getCurrentPractitioner()` / `requirePractitioner()` (`app/api/**`) |
| **Method** | static source read: how `member_id` enters the route (session vs. request input), and what the query is keyed on |
| ⛔ **Not done** | ⛔ no runtime trace · ⛔ no production query of these routes · ⛔ `lib/**` and `components/**` unread · ⛔ no execution |
| ⚠️ **Confidence** | classes below are **source-shaped**. ⭐ Routes are classified by the **key their authority check uses**, ⛔ not by their name |

> ⭐⭐⭐ **Structural fact, unchanged from the Ruling 1 audit: of the 76 routes, ⛔ ZERO reference
> `relationship_spaces`.**

⚠️ **Silent-cap disclosure:** the detailed classification below covers the routes where `member_id`
appears at all. ⭐ The remaining routes are classified **as a class** in §3, ⛔ not individually read.

---

## 1. ✅ Practitioner-owned scope — conforming

⭐ In each of these, the `member_id` in play is **the authenticated practitioner's own**, taken from
`identity.memberId`. ⛔ No second person's identity is reached.

| Route | Evidence |
|---|---|
| [`studio/field`](../../../app/api/studio/field/route.ts) | `const { memberId } = identity` → `WHERE member_id = $1` — the practitioner's **own** process items |
| [`studio/field/[id]`](../../../app/api/studio/field/%5Bid%5D/route.ts) | `SELECT * FROM process_items WHERE id = $1 AND member_id = $2` with `$2 = identity.memberId` |
| [`studio/whoami`](../../../app/api/studio/whoami/route.ts) | self-description only |
| [`studio/portal`](../../../app/api/studio/portal/route.ts) | `WHERE p.id = $1 OR p.member_id = $1` — resolves **the practitioner themself** |
| [`studio/people`](../../../app/api/studio/people/route.ts) | roster read, team-scoped via `resolveTeam(identity.memberId)`; ⭐ in-code: *"Account status: DERIVED from member_id — never stored as a role"* |
| [`team/channels/[channelId]/decisions`](../../../app/api/team/channels/%5BchannelId%5D/decisions/route.ts) | ⭐ **already member-keyed** — `getMemberIdFromRequest` → `requireChannelAccess(channelId, memberId)`; `practitionerId` is recorded on the row but ⛔ is **not** the authorization key |

📌 **`team/.../decisions` is worth noting as a positive pattern:** it authenticates member-first *and*
authorizes member-first, using `practitionerId` only as descriptive provenance. ⭐ That is the shape
the ruling describes, ⛔ already present.

---

## 2. ⛔ Relational authority over another member

⚠️ Each reaches a **second person**. ⛔ None is repaired; ⛔ none is reclassified beyond what the
founder has authorized.

### 2.1 ⛔ Open conformance finding — carried, not resolved

**[`studio/clients/[id]/patterns`](../../../app/api/studio/clients/%5Bid%5D/patterns/route.ts)**

The gate is `practitioner_clients WHERE member_id = $1 AND practitioner_id = $2`; the route's own
comment reads *"Verify the client (by member_id) belongs to the practitioner."*

⭐ Under the bridge ruling, the correct path would evaluate `identity.memberId` against a constituted
relationship. ⛔ **This document does not make that change** — it records that the route's authority
key is the contact record.

### 2.2 ⛔ HELD — authority object unsettled

**[`studio/protocols`](../../../app/api/studio/protocols/route.ts)** ·
**[`studio/protocols/[id]`](../../../app/api/studio/protocols/%5Bid%5D/route.ts)** ·
**[`studio/protocols/[id]/observations`](../../../app/api/studio/protocols/%5Bid%5D/observations/route.ts)**

⛔⛔ **Per founder direction, these may NOT be classified as violating** while *the authority object of
practitioner-authored material* remains unruled.

⭐ Recorded as evidence only: `studio_pattern_protocols` rows carry `member_id`, gated by
`practitioner_clients … AND member_id = $3`; the observations route inherits that member via
`protocol.member_id`. ⚠️ Whether authoring *about* a person is an act **within** a commitment or a
practitioner-owned fact **referencing** a person is precisely the unruled question — ⛔ and the
observations route inherits whichever answer the protocol receives.

### 2.3 ⚠️ Newly surfaced — participant identity on encounters

**[`studio/encounters`](../../../app/api/studio/encounters/route.ts)**

```sql
INSERT INTO encounter_participants (id, encounter_id, person_id, display_name, role, member_id)
```

⚠️ A practitioner-authored encounter record **binds another person's `member_id`** with `role`
defaulting to `'client'`. ⭐ Team-scoping via `resolveTeam(identity.memberId)` is present; ⛔ a
constituted-relationship check is **not**.

⚠️ **Classified as *relational — requires evaluation*, ⛔ NOT as violating.** It plausibly falls under
the same unruled question as §2.2 (practitioner-authored material that names a person). ⛔ It was not
before the founder when the §2.2 hold was issued, so it is surfaced here rather than assumed into
either class.

### 2.4 ⭐ Already contained

**[`studio/clients/[id]/pattern-ledger`](../../../app/api/studio/clients/%5Bid%5D/pattern-ledger/route.ts)**
— ⭐ **stays fail-closed.** ⛔ Ruling 1 and the bridge ruling do **not** reopen it; reopening is a
separate conformance act that has ⛔ not occurred.

---

## 3. ⚪ Classified as a class, ⛔ not individually read

⭐ Roughly **50** of the 76 routes reference **no `member_id` at all** — availability · profile ·
modules · field-signals · field notes/people/attention/pulse · client-inquiry · voice-notes ·
scheduled-sends · protocol-assignments · encounters sub-routes · decisions · changes.

✅ **Provisionally practitioner-owned scope**, ⛔ on the basis that a route reaching no member identity
cannot be evaluating relational authority.

> ⚠️ **This is an inference from absence, ⛔ not a per-route verification.** A route could reach
> member-scoped material through a `client_id` join without naming `member_id` in its own source.
> ⛔ Do not cite §3 as "audited."

⛔⛔ **SUPERSEDED, 2026-08-09 — and the inference was WRONG for most of the set.** The 47 routes have
now been read individually with an indirect-path trace:
[`STUDIO_AUTHORITY_PATH_CLASSIFICATION_COMPLETION_2026-08-09.md`](STUDIO_AUTHORITY_PATH_CLASSIFICATION_COMPLETION_2026-08-09.md).
⭐ **At least 29 of the 47 reach a person or a governed member**, ⛔ none of it visible from route
source alone — `studio_changes` alone carries **`member_id`**, which moves the whole `changes/*`
family out of this bucket. ⛔ This section is retained as the record of the inference that failed.

---

## 4. Summary

| Class | Count | Basis |
|---|---|---|
| ✅ **Practitioner-owned — conforming** | **6** | individually read (§1) |
| ⛔ **Relational — open finding** | **1** | `clients/[id]/patterns` (§2.1) |
| ⛔ **Relational — HELD, authority object unruled** | **3** | protocols · protocols/[id] · observations (§2.2) |
| ⚠️ **Relational — newly surfaced, unclassified** | **1** | encounters participant binding (§2.3) |
| ⭐ **Already contained** | **1** | pattern-ledger (§2.4) |
| ⚪ **Provisional by absence** | **~50** | ⛔ not individually read (§3) |
| ⛔ **Consulting `relationship_spaces`** | **0** | — |

⛔ **No repair has been made or proposed.** ⭐ Ruling 2 remains held.

⚠️ **The classification is complete in the sense directed** — every use of `practitionerId` that
reaches a second person is named — ⛔ **but §3's ~50 routes are classified by inference, not by
reading.** ⭐ If Ruling 2 is to proceed on the strength of this classification, that gap is the one to
close first.
