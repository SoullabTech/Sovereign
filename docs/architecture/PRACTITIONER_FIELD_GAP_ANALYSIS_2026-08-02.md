# Practitioner Field — Gap Analysis against the Backend Coach / Facilitator directive

**Date:** 2026-08-02
**Status:** RECORDED — a gap analysis, not a ruling and not an authorization to build.
**Trigger:** Founder correction, 2026-08-02: the Now What? support desk is a valid partial addition
and must not be framed as completion of the practitioner field directive.
**Referent:** working tree of `/Users/soullab/MAIA-SOVEREIGN` at `7c9dd5192` (trunk `clean-main-no-secrets`),
plus the two **untracked, uncommitted, un-PR'd** files that constitute the support desk.

---

## 0. What was actually built (the thing under review)

Two files, untracked, no branch, no PR:

| File | Lines | What it is |
|---|---|---|
| `app/studio/now-what/page.tsx` | 193 | Three panels: *Shared with you* · *Your doors* (copyable program links) · *Build & tend* (links out) |
| `app/api/studio/now-what/shared/route.ts` | 67 | `GET` — reads `member_field_note_threads` where `can_be_shown_to_practitioner = TRUE`, scoped to the caller's own authored field via `getAuthoredField` |

**It closes one real defect.** `can_be_shown_to_practitioner` previously had no reader: the member was
told the item was shared, and no surface existed where the practitioner could see it. That is now a
real loop, correctly consent-gated.

**One structural fact decides most of this analysis:** the shared route joins
`member_field_note_threads → members`. It never touches `practitioner_clients`. The desk therefore
cannot attribute a shared item to a client in Larry's caseload — not because of a missing feature,
but because **no join between the two universes exists anywhere in the system**. See §2/M1.

---

## 1. Correction to the visibility rule (accepted, pending ratification)

The sentence *"the desk shows only what was handed to the practitioner"* is correct for
**client-owned private material** and was over-applied to the whole practitioner workspace.

**Operative rule to be ratified:**

> Every record is visible according to its **ownership**, **relational scope**, **role authorization**,
> and **explicit visibility** — not according to one universal sharing mechanism.

Corollary: Larry is entitled to records he authored, administers, or is a party to (enrollment,
position agreed with him, sessions he scheduled, assignments he made, commitments recorded together,
cohorts he runs, resources he sent, his own notes, follow-ups he owes, guidance he published). Those
never required a client hand-over gesture — Larry is already their author or steward.
`can_be_shown_to_practitioner` continues to govern **member-authored private material only**.

This does not weaken any existing invariant. It narrows one of them to its correct scope.

---

## 2. Blocking modeling decisions (founder rulings required before implementation)

These are not build tasks. Each one determines whether a capability is even expressible.

**M1 — Client of record. THE blocker.**
`practitioner_clients` is declared in **three different migrations** (`20260114000001_practitioner_themes`,
`20260116000001_practitioner_portal`, `20260118_stellium_practitioner_layer`) with conflicting DDL. It is
keyed by practitioner + email and carries **no `member_id`**. Every practitioner record —
`practitioner_client_notes`, `practitioner_sessions`, `studio_protocol_assignments`, `client_group_members` —
hangs off `practitioner_clients.id`. Every developmental record — `field_program_positions`,
`member_field_note_threads`, atoms, Keeps — hangs off `members.id`. **Nothing joins them.**
Until this is ruled, capabilities 3–9, 14, 16, 19, 20 cannot be built truthfully at all, and step 17
of the required workflow ("updates appear coherently in the client experience") is unreachable by construction.
Sub-question: is a caseload entry a *person* who may or may not be a member, or a *relationship* between
a practitioner and a member? Consolidating the three DDLs is a prerequisite either way.

**M2 — Who authors developmental position.**
`field_program_positions` carries `stated_by` and `member_confirmed_at`. The existing model says the
**member** states their position and confirms it. "Larry updates stage and current focus" (workflow step 8)
inverts that authority and collides with the Constitutional Direction of Authority (authority moves upward
through authored experience; the system may not manufacture higher-order meaning). A practitioner-*proposed*,
member-confirmed position is expressible; a practitioner-*set* position is a constitutional change.

**M3 — Client-visible practitioner record.**
`practitioner_client_notes` has no visibility column; every row is encrypted and practitioner-private
by construction. Publishing a note to a client creates a new object in the member's world, which the
2026-08-02 declaration ruling governs, and the standing ruling says *Client Notes must not become another Field.*
What object is a published note, and who declares it?

**M4 — Enrollment vs entry.**
Today the door link *is* entry; "entry ≠ visibility" is held doctrine. There is no enrollment table.
Enrollment is a new relational object (member ⇄ program ⇄ practitioner) with its own consent shape.

**M5 — Originator of a commitment.**
The directive requires preserving *who originated* a commitment. `practitioner_client_notes` models
`kind`/`status`/`promoted_from` but has **no originator field**. Adding one is small; deciding whether a
client-originated commitment may be written by the practitioner is not.

**Carried, unresolved, and in scope here:** `sessions.notes` holds plaintext PHI (unruled); the covenant
gate fires rollback discipline only on `class-c`, so a `class-a` migration skips it (flagged on #890, workflow not patched).

---

## 3. Capability-by-capability gap analysis

Legend: **INTEGRATED** · **DISCONNECTED** (exists, not part of one practitioner experience) ·
**PARTIAL** · **ABSENT** · **BLOCKED** (a modeling decision, not code, is missing).

| # | Capability | State | Evidence / why |
|---|---|---|---|
| 1 | Practitioner caseload | **DISCONNECTED** | Two doors to one registry: `app/studio/caseload/page.tsx` and `app/studio/clients/page.tsx` both call `/api/studio/clients`. Shows status/tier/tags/last+next session/total. No attention model, no developmental content. |
| 2 | Practitioner-facing client profiles | **DISCONNECTED** | `app/studio/clients/[id]/page.tsx` composes `ClientNotesPanel`, `ClientContinuityPanel`, `CaseMemoryTimeline`, `PatternLedgerEvolutionPanel`, `LeadershipProfileSection`. Reads `practitioner_clients` + `practitioner_sessions` only — the member's field is not reachable from it (M1). |
| 3 | Multiple processes per client | **ABSENT** | No process/engagement entity anywhere. Sessions and notes are flat per client. |
| 4 | Program enrollment | **ABSENT / BLOCKED (M4)** | `field_programs` exists (`practitioner_member_id`, `field_slug`, lessons, revisions). No enrollment table. The desk's door link is self-entry. |
| 5 | Current program stage | **PARTIAL / BLOCKED (M2)** | `field_program_positions(member_id, focal_point, stated_by, member_confirmed_at)` exists — member-authored, not practitioner-visible, not practitioner-writable. |
| 6 | Stage history | **ABSENT** | Positions are current-state. `field_program_revisions` versions *program content*, not a member's movement. |
| 7 | Current developmental focus | **PARTIAL** | `field_programs.current_focal_point` (program-level) + per-member `focal_point`. Not surfaced to the practitioner (M1/M2). |
| 8 | Upcoming / past sessions | **DISCONNECTED** | `practitioner_sessions` drives `lastSessionAt`/`nextSessionAt` and `/studio/sessions`. Calendar sync, notifications, join tokens, writeback all exist. None connect to the member field. ⚠️ `sessions.notes` plaintext PHI unruled. |
| 9 | Important dates | **ABSENT** | Only `note_date` and session timestamps. No dates entity. |
| 10 | Homework / assignments | **ABSENT** | `studio_protocol_assignments(practitioner_id, client_id, protocol_id, status, decision_id, change_id)` is a *consulting protocol* assignment bound to Studio decisions/changes — not a developmental assignment, and has no client-facing side. |
| 11 | Practices | **PARTIAL, wrong universe** | `practice_sessions` / `practice_worlds` / `elemental_practice_completions` are member-side. No practitioner can recommend or see one. |
| 12 | Commitments | **PARTIAL** (nearest to done) | `practitioner_client_notes.kind='commitment'` with `status ∈ alive/completed/released`, carry-forward provenance via `promoted_from`, surfaced in `ClientContinuityPanel`. **Missing: originator (M5).** Practitioner-private only. |
| 13 | Private practitioner notes | **INTEGRATED** | `practitioner_client_notes`, encrypted (`content_enc`), kinds note/commitment/recognition/detail, lifecycle in flight (#888 docs → #890 impl, #889 PHI gate). Nearest thing to a finished organ. ⚠️ 0/12 acceptance criteria verified. |
| 14 | Client-visible practitioner notes | **ABSENT / BLOCKED (M3)** | No visibility column exists; every note is private by construction. |
| 15 | Recommended resources | **DISCONNECTED** | `practitioner_materials`, `practitioner_resources`, `practitioner_files` + `practitioner_file_shares` + access log exist; no per-client recommendation appears on the client profile or reaches the member. |
| 16 | Cohort membership | **DISCONNECTED** | `client_groups`, `client_group_members`, `group_sessions`, `group_session_attendance`, `/studio/groups` all exist. Not on the client profile; unrelated to `field_programs`. |
| 17 | Follow-up obligations | **PARTIAL** | `studio_tasks` + `/studio/tasks` + `/studio/triage` exist as generic task surfaces, not as "what this client is owed". |
| 18 | Next-session preparation | **DISCONNECTED** | `/api/practitioner/clients/[clientId]/prep` and `/api/facilitator/session-prep` exist and are not reachable from the Studio client profile. |
| 19 | Post-session process update | **PARTIAL** | `studio_session_writeback`, `session_summary_pipeline`, `scribe_sessions`, `session_voice_notes` write back into practitioner records only. Nothing propagates to the member's field. |
| 20 | Preview of the client's return experience | **ABSENT / BLOCKED (M1 + constitutional)** | Requires reading the member universe. Must be designed as *"what Larry published will appear here"*, never as a view of member activity. |

**Score:** 1 integrated · 7 disconnected · 5 partial · 4 absent · 3 blocked-by-ruling.
The substrate is unusually rich; the **integration** is what is missing — plus five decisions that no
amount of implementation can substitute for.

---

## 4. What this means for the report under review

- The support desk is worth preserving. Its consent scoping is correct.
- It is **one organ**, not the field. "Both halves of the directive are now real" is not supportable.
- "Build & tend" links do not constitute a practitioner field; they route Larry into disconnected tools.
- Nothing here is deployable as the practitioner field. No PR should present it as such.

The question that decides the next pass is not *can Larry receive what a client shares* but:
**can Larry open one client, understand the whole active coaching situation, update it after a session,
and know the client's environment now reflects that living process?** Today: no — and step 17 of that
loop is blocked by M1, not by effort.

---

## 5. Recommended sequence (proposed, not authorized)

1. **Rule M1–M5.** M1 first; it gates twelve capabilities.
2. **Consolidate `practitioner_clients`** to one DDL (a prerequisite regardless of how M1 rules).
3. Then, and only then, design the integrated practitioner field as one workflow — with the support
   desk as one section of it — and return with: information architecture, schema changes, service/API
   boundaries, screens, migration plan, implementation evidence, test evidence, and a production
   acceptance walk of the 17-step loop.

Sections 3–5 of the founder's requested return (IA, schema, screens, migration plan) are deliberately
**not drafted here**: three of the five modeling decisions would change their shape materially, and
drafting them now would present a guess as a design. Implementation, test, and production-walk evidence
do not exist and are not claimed.

---

## 6. Method notes

- No code was written, no branch mutated, no PR opened, nothing deployed.
- Evidence is from the working tree and `database/migrations/`; **no production database was queried**,
  so all statements are about the declared schema and code, not about live rows.
- Standing constraint honoured: `merged ≠ activated ≠ verified ≠ accepted`; nothing above is claimed as verified.
