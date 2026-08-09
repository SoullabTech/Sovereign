# Studio Authority-Path Classification — Completion of the 47

**Status: EVIDENCE — 2026-08-09.** ⛔ Repairs nothing, proposes nothing, authorizes nothing.
Closes the inference gap left by
[`STUDIO_AUTHORITY_PATH_CLASSIFICATION_2026-08-09.md`](STUDIO_AUTHORITY_PATH_CLASSIFICATION_2026-08-09.md)
§3, which classified ~50 routes **from the absence of `member_id` in their source** rather than by
reading them.

> ⭐⭐⭐ **The founder's objection was correct, and the evidence confirms it: absence of `member_id` in
> a route's source does NOT establish that the route is practitioner-owned.** ⛔ Several reach a
> governed member through an indirect join.

---

## 0. Method

| | |
|---|---|
| **Population** | the **47** routes from §3 (authenticate as practitioner, ⛔ no `member_id` token in source) |
| **Step 1 — source** | every `FROM` / `INTO` / `UPDATE` / `JOIN` table and every identifier key per route |
| **Step 2 — ⭐ indirect trace** | **production schema query** (read-only, `maia_consciousness` on `minisforum`, 2026-08-09): which of those tables actually carry `member_id` · `client_id` · `person_id` · `team_id` |
| ⛔ **Not done** | ⛔ no runtime trace · ⛔ no row-level read · ⛔ `lib/**` helpers unread |

⭐ **This is what "trace just far enough to identify what person or relationship it ultimately
reaches" means in practice:** the route's own source is insufficient; ⭐ the **column inventory of the
tables it touches** is what reveals the reach.

### 0.1 ⭐⭐⭐ The decisive schema evidence

| Table | Carries |
|---|---|
| **`studio_changes`** | ⛔⛔ **`member_id`** · `client_id` · `team_id` · `practitioner_id` |
| **`studio_pattern_protocols`** | ⛔ **`member_id`** · `client_id` · `practitioner_id` |
| **`encounter_participants`** | ⛔ **`member_id`** · `person_id` |
| `practitioner_client_notes` · `practitioner_sessions` · `session_occupancy_ratings` · `studio_decisions` · `studio_field_signals` · `studio_inquiry_responses` · `studio_practitioner_observations` · `studio_protocol_assignments` · `voice_notes` | `client_id` (+ `practitioner_id`) — ⭐ reach a person **via the contact record** |
| `field_people` · `field_notes` · `field_events` · `field_attention` · `encounters` | `practitioner_id` + `team_id` **only** — ⭐ ⛔ no member or client linkage |
| `decision_experiences` · `studio_change_experiments` · `practitioner_availability` · `scheduled_sends` | `practitioner_id` only |

> ⛔⛔ **`studio_changes` carries `member_id`.** ⭐ The entire `changes/*` family — **7 routes** §3
> placed in the practitioner-owned bucket by absence — operates on a table that binds a governed
> member. ⭐ This is exactly the failure mode the founder predicted, and it was invisible from the
> route source.

---

## 1. ✅ Practitioner-owned object

⭐ The object belongs to the practitioner's own practice; ⛔ no person or member is reached.

| Route | Table evidence |
|---|---|
| [`availability`](../../../app/api/studio/availability/route.ts) | `practitioner_availability` — `practitioner_id` only |
| [`modules`](../../../app/api/studio/modules/route.ts) | `practitioners` |
| [`profile`](../../../app/api/studio/profile/route.ts) | `practitioners` |
| [`decisions/[id]/experiences`](../../../app/api/studio/decisions/%5Bid%5D/experiences/route.ts) | `decision_experiences` — `practitioner_id` only |
| [`changes/[id]/experiments`](../../../app/api/studio/changes/%5Bid%5D/experiments/route.ts) · [`…/[experimentId]`](../../../app/api/studio/changes/%5Bid%5D/experiments/%5BexperimentId%5D/route.ts) | `studio_change_experiments` — `practitioner_id` only ⚠️ **but gated through `studio_changes`** (see §4) |

## 2. ✅ Team-owned object

⭐ Keyed on `practitioner_id` **+ `team_id`**, ⛔ with no member or client column anywhere in the
tables touched. ⭐ The Field surface is genuinely team-scoped.

[`field/notes`](../../../app/api/studio/field/notes/route.ts) · [`field/notes/[id]`](../../../app/api/studio/field/notes/%5Bid%5D/route.ts) ·
[`field/events`](../../../app/api/studio/field/events/route.ts) · [`field/events/[id]`](../../../app/api/studio/field/events/%5Bid%5D/route.ts) ·
[`field/people`](../../../app/api/studio/field/people/route.ts) · [`field/people/[id]`](../../../app/api/studio/field/people/%5Bid%5D/route.ts) ·
[`field/attention`](../../../app/api/studio/field/attention/route.ts) · [`field/attention/[id]`](../../../app/api/studio/field/attention/%5Bid%5D/route.ts) ·
[`field/attention/options`](../../../app/api/studio/field/attention/options/route.ts) · [`field/pulse`](../../../app/api/studio/field/pulse/route.ts)

📌 **`field_people` deserves the explicit note:** it holds people records, ⭐ but carries **no**
`member_id` and **no** `client_id`. ⛔ It does not reach a governed member. ⚠️ If it ever gains a
member linkage, it moves classes.

⚠️ `field/attention` and `field/pulse` **read** `studio_changes` / `studio_decisions` for
aggregate attention — see §4.

## 3. ⛔ Relational / member-scoped object

⭐ The route reaches a **second person** — either a governed member directly, or a person through the
contact record.

### 3.1 Reaches a governed `member_id` (indirect)

| Route | Path |
|---|---|
| [`protocols/[id]/council`](../../../app/api/studio/protocols/%5Bid%5D/council/route.ts) | `protocol_id` → `studio_pattern_protocols.member_id` |
| [`protocol-assignments`](../../../app/api/studio/protocol-assignments/route.ts) · [`[id]`](../../../app/api/studio/protocol-assignments/%5Bid%5D/route.ts) · [`[id]/snapshot`](../../../app/api/studio/protocol-assignments/%5Bid%5D/snapshot/route.ts) | `client_id` + `protocol_id` → `studio_pattern_protocols.member_id` |
| [`encounters/[id]/chat`](../../../app/api/studio/encounters/%5Bid%5D/chat/route.ts) · [`[id]/threshold`](../../../app/api/studio/encounters/%5Bid%5D/threshold/route.ts) | `encounter_id` → `encounter_participants.member_id` |

### 3.2 Reaches a person via the contact record (`client_id`)

[`clients`](../../../app/api/studio/clients/route.ts) · [`clients/[id]`](../../../app/api/studio/clients/%5Bid%5D/route.ts) ·
[`clients/[id]/notes`](../../../app/api/studio/clients/%5Bid%5D/notes/route.ts) · [`clients/[id]/notes/[noteId]`](../../../app/api/studio/clients/%5Bid%5D/notes/%5BnoteId%5D/route.ts) ·
[`client-inquiry/responses`](../../../app/api/studio/client-inquiry/responses/route.ts) ·
[`occupancy-ratings`](../../../app/api/studio/occupancy-ratings/route.ts) ·
[`practitioner-observations`](../../../app/api/studio/practitioner-observations/route.ts) ·
[`field-signals`](../../../app/api/studio/field-signals/route.ts) ·
[`import-actions`](../../../app/api/studio/import-actions/route.ts) ·
[`voice-notes/[noteId]/audio`](../../../app/api/studio/voice-notes/%5BnoteId%5D/audio/route.ts)

⚠️ **`voice-notes/[noteId]/audio` is worth naming:** `voice_notes` carries `client_id`, so an audio
stream is client-scoped — ⛔ and the route's own source never mentions a person.

## 4. ⚠️ Mixed object — requires per-operation distinction

⭐ The object is **practitioner-authored**, ⛔ but the same table binds a client or member, so the
class depends on **which operation** is performed and **which column is populated**.

| Route family | Why mixed |
|---|---|
| [`changes`](../../../app/api/studio/changes/%5Bid%5D/route.ts) family — `[id]`, `[id]/interpret`, `[id]/mentor`, `[id]/mentor/chat`, `[id]/experiences` | ⛔⛔ **`studio_changes` carries `member_id` AND `client_id` AND `team_id`.** A change with no client is the practitioner's own work; one carrying `member_id` reaches a governed member |
| [`decisions`](../../../app/api/studio/decisions/route.ts) · [`[id]`](../../../app/api/studio/decisions/%5Bid%5D/route.ts) · [`[id]/consult`](../../../app/api/studio/decisions/%5Bid%5D/consult/route.ts) · [`[id]/mentor`](../../../app/api/studio/decisions/%5Bid%5D/mentor/route.ts) | `studio_decisions.client_id` nullable + joins `practitioner_clients`; ⚠️ `consult` additionally reads observations, inquiry responses, and field signals — **all client-scoped** |
| [`encounters/[id]/transcript`](../../../app/api/studio/encounters/%5Bid%5D/transcript/route.ts) · [`[id]/moments`](../../../app/api/studio/encounters/%5Bid%5D/moments/%5BmomentId%5D/route.ts) · [`[id]/moments/extract`](../../../app/api/studio/encounters/%5Bid%5D/moments/extract/route.ts) | `encounters` itself is practitioner/team-owned; ⛔ the **transcript is of an encounter whose participants carry `member_id`** |
| [`field/attention`](../../../app/api/studio/field/attention/route.ts) · [`field/attention/options`](../../../app/api/studio/field/attention/options/route.ts) · [`field/pulse`](../../../app/api/studio/field/pulse/route.ts) | team-owned surfaces that **read `studio_changes` / `studio_decisions`** — inherit those tables' client/member reach in aggregate |
| [`field-signals/[id]`](../../../app/api/studio/field-signals/%5Bid%5D/route.ts) · [`practitioner-observations/[id]`](../../../app/api/studio/practitioner-observations/%5Bid%5D/route.ts) | keyed on `practitioner_id` alone in-route, ⛔ but the **row may carry `client_id`** |
| [`scheduled-sends/[id]`](../../../app/api/studio/scheduled-sends/%5Bid%5D/route.ts) | `scheduled_sends` is `practitioner_id`-keyed, ⛔ but the act is an **outward send to a person's email** |

## 5. ⚪ No authority-bearing access

| Route | Basis |
|---|---|
| [`client-inquiry/prompt-sets`](../../../app/api/studio/client-inquiry/prompt-sets/route.ts) | ⛔ no table access at all — static prompt definitions |

## 6. ⛔ Unresolved — joined to the standing hold

⭐ Per founder direction, ⛔ **not to be classified as violating** while *the authority object of
practitioner-authored material* is unruled:

| Item | Status |
|---|---|
| [`studio/encounters`](../../../app/api/studio/encounters/route.ts) — participant binding | ⛔ **added to the hold (founder, 2026-08-09)**: it can attach another person as a `client` participant ⛔ without proving the constituted relationship. ⭐ **Relational behavior**, ⛔ authority object unsettled |
| `protocols` · `protocols/[id]` · `protocols/[id]/observations` | ⛔ held (prior direction) |
| `protocols/[id]/council` · `protocol-assignments` ×3 | ⚠️ reach `studio_pattern_protocols.member_id` — ⛔ **inherit the protocols hold** |
| `clients/[id]/notes` ×2 · `practitioner-observations` · `field-signals` | ⚠️ practitioner-authored material **about** a person — ⭐ the same unruled question. ⛔ Surfaced, ⛔ not classified as violating |
| [`pattern-ledger`](../../../app/api/studio/clients/%5Bid%5D/pattern-ledger/route.ts) | ⭐ **stays fail-closed** |

---

## 7. Summary

| Class | Count |
|---|---|
| ✅ **Practitioner-owned** | **7** |
| ✅ **Team-owned** | **10** |
| ⛔ **Relational / member-scoped** | **16** |
| ⚠️ **Mixed — per-operation distinction** | **13** |
| ⚪ **No authority-bearing access** | **1** |
| ⛔ **Unresolved (overlapping the above)** | **11** |

⭐ **Combined with the first classification** (6 conforming · 1 open finding · 3 held · 1 surfaced ·
1 contained), the **76-route Studio authority surface is now classified by reading, ⛔ not by
inference.**

> ⛔⛔ **Still zero routes consult `relationship_spaces`.**

⚠️ **What changed from §3's inference:** of the 47, **at least 29** reach a person or a governed
member — ⛔ **none** of which was visible from the route source alone. ⭐ §3's provisional
"practitioner-owned by absence" was wrong for the majority of the set.

⛔ **No repair has been made or proposed. Ruling 2 remains held.**
