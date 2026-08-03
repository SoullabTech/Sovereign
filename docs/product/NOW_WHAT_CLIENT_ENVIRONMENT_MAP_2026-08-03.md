# Now What? — Client Environment Map

**Date:** 2026-08-03 · **Status:** ⛔ **MAP. No ruling, no build authority.**
The bridge between the constitution and a build plan — and the answer to *"what am I actually
getting?"*

**Home is the threshold. Rooms are destinations.** Not competing models: the Home bands answer *what
must a person encounter on arrival*; the rooms answer *where do they go as the work develops.* The
Home is the lobby, not the building.

Companions, all canonical and none superseded here:
[Experience Design](NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN_2026-08-02.md) (Home bands, states,
Slice 0) · [Larry Walk](walks/NOW_WHAT_PRACTICE_WORKSPACE_LARRY_WALK_01.md) (practitioner view) ·
[Rooms](NOW_WHAT_HOUSE_ROOMS_2026-08-03.md) (the delta that produced this map).

---

```
                              NOW WHAT?
                                HOME
                       "Your work with Larry"
                                  |
        ----------------------------------------------------
        |          |          |          |          |       |
     Program   Calendar   Sessions    Reflect    Connect  Resources
   "the journey  "where we  "our con-  "yours"    "stay    "what
     we're on"    meet"     versations"    |      connected" supports
                                         MAIA                your work"
```

**Legend.** ✅ live substrate · ◐ partial · ⛔ deferred by design (encrypted lane) · 🔴 known defect.

---

## Home — *"Your work with Larry"*

| | |
|---|---|
| **Purpose** | Orientation. Where am I · what am I working on · what is next · one obvious way in. |
| **Who can see** | Client. Larry has his own view of the same relationship, not this page. |
| **Who authors** | Relationship (shared) · placement and stage by Larry · kept material by the client. |
| **Live** | ✅ `practitioner_clients` · `coach_client_processes` · `coach_program_enrollments.current_stage_id` · member-owned kept material |
| **Deferred** | ⛔ *"From Larry"* band needs `coach_note_publications` / `coach_work_items` |
| **Constraints** | Band ① shows **kept, not last** (E-2). No computed next step — named doors only. Empty state is the design centre, not a fallback. |

## Program — *"The journey we are on"*

| | |
|---|---|
| **Purpose** | Larry's method made visible. The shared map. |
| **Who can see** | Both. |
| **Who authors** | **Larry.** The client never moves their own stage. |
| **Live** | ✅ `coach_program_definitions` · `coach_program_stages` · `coach_program_enrollments` · `coach_enrollment_stage_history` |
| **Deferred** | ⛔ stage *content* (what a stage is about, its practices) — that is `coach_work_items` territory |
| **Constraints** | ⛔ No percentage, score, or ranking. A ✓ records **Larry moved us past this**, never *you completed this*. Multiple concurrent processes are schema-permitted but **unruled** — out of scope until decided. |

## Calendar — *"Where we meet"*

| | |
|---|---|
| **Purpose** | Time connected to relationship. Sessions, workshops, group events, milestones. |
| **Who can see** | Both, for shared events. *Before* and *After* notes are the client's. |
| **Who authors** | Larry schedules; either may prepare. |
| **Live** | ◐ `coach_sessions` exists |
| **Deferred** | ⛔ `coach_important_dates` · workshops and milestones have no substrate |
| **Constraints** | Reminders must never carry pressure (*"Larry is waiting"* ⛔). Preparation belongs to the person until shared. |
| **Defect** | 🔴 **`sessions.team_id` omitted by four INSERT paths (#899) — session creation is broken.** Calendar and Sessions both sit on top of this. **Prerequisite, not a nicety.** |

## Sessions — *"Our conversations"*

| | |
|---|---|
| **Purpose** | Continuity points, not an archive. What we explored · what I'm carrying · what I want to revisit. |
| **Who can see** | The record: both. Larry's private notes: **never the client.** The client's carry-forward: **theirs** unless shared. |
| **Who authors** | Either — and every item must say which. |
| **Live** | ◐ `coach_sessions` |
| **Deferred** | ⛔ `coach_authored_notes` · `coach_note_publications` — the published/private split is the whole point and it is not built |
| **Constraints** | Authorship visible on every item. A note becomes visible by an **act of publication**, never by a visibility flag. |
| **Defect** | 🔴 `sessions.notes` holds plaintext PHI — a security item, not a design one. Plus #899 above. |

## Reflect — *"Yours"*

| | |
|---|---|
| **Purpose** | The person's own thinking. MAIA lives here. |
| **Who can see** | **The client. Only.** |
| **Who authors** | The client. MAIA may point, never conclude. |
| **Live** | ✅ `member_reflections` · `member_field_note_threads` · atoms · anchors · marks — all person-owned, all already unreachable from practitioner queries |
| **Deferred** | ⛔ `coach_client_personal_notes` · `coach_current_focus` (focus in the client's own words) |
| **Constraints** | ⭐ **The strongest boundary in the house.** Withdrawal produces no signal (E-3). Larry's view must not vary with anything here — provable by rendering two fixtures differing only in this room's content and diffing. MAIA unprompted is **L1 only**; L2/L3 need an invitation; **L4 is forbidden at any consent level.** |

## Connect — *"Stay connected"*

| | |
|---|---|
| **Purpose** | Practitioner ↔ client, and group/cohort spaces. |
| **Who can see** | Depends entirely on the space — and that is the problem, not a detail. |
| **Who authors** | Whoever posts. |
| **Live** | ✅ `coach_cohorts` · `coach_cohort_memberships` (membership only — no content) |
| **Deferred** | ⛔ all message content |
| **Constraints** | ⚠️ **Three separate blockers, not one.** (1) Content tables are the protected boundary — gate `1d` asserts their absence; building here fails by construction. (2) **E-1: the existing `clientMessages.ts` sits on the OLD practitioner lineage, not the `practitioner_clients` spine** — it is not a starting point. (3) **Group spaces introduce third-party consent** — what one member says is seen by people who are not their practitioner. **Unruled.** |

## Resources — *"What supports your work"*

| | |
|---|---|
| **Purpose** | Materials Larry shared, connected to a stage. Curated, not a dump. |
| **Who can see** | Both — recommendation only. |
| **Who authors** | Larry. |
| **Live** | — none |
| **Deferred** | ⛔ `coach_resource_recommendations` entirely |
| **Constraints** | Relevance comes from the **relationship** (Larry connected this to this stage), never from a model. No "recommended for you." |

---

## What this map says about sequencing

**Openable on existing substrate:** Home · Program · Reflect.
**Blocked on a defect first:** Calendar · Sessions — #899 is a prerequisite.
**Blocked on the encrypted lane:** Connect · Resources · the *From Larry* band · practitioner notes ·
commitments.

> **The house opens in three phases, and the boundary — not the backlog — decides the order.**

## The constitutional question, restated

The Home-vs-house framing is **not** a ratification item. The constitution does not care whether a
person clicks a tab, enters a room, or moves through cards. It cares about agency, clarity,
authorship, boundaries, and the absence of false meaning. So:

> **Implementation choice:** the navigation pattern.
> **Constitutional test:** *does the environment help a person orient without requiring them to
> understand the architecture underneath?*

That downgrades an item flagged earlier as ratification-adjacent. What remains genuinely for
ratification: **human simplicity as a principle**, **third-party consent for group spaces**, and the
**stage-checkmark semantics**.

## What Larry is actually getting

Not an AI coaching assistant. **A complete relationship environment for the work he already does** —
opening in three phases, with the parts that are not yet open named honestly, and the reason they are
closed being a boundary rather than a backlog.
