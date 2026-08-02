# Now What? — Client Home / Larry Pilot

**Lane opened:** 2026-08-02 · **Base:** `c0c8b0ba6` (trunk, #902 merged)
**Phase:** Audit. ⛔ No UI code. Sequence is **Audit → Design → Vertical Slice → Walk.**

⭐⭐⭐ **AMENDED 2026-08-02 — the lane runs TWO CO-EQUAL TRACKS.** UI/UX is a **primary product
layer**, not a presentation layer. Track A (this document) answers *what exists · who owns it · who
sees it · who can act*. **Track B — `NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN.md`** answers *what
arrival feels like · what is understood immediately · what deserves attention · what stays quiet ·
how the environment invites continuation*. ⛔ **Neither is subordinate**, and the experience
architecture is resolved **alongside** the ownership architecture, not after it.
⚠️ **The biggest risk in this phase is not the missing tables — it is building a technically correct
coaching CRM dashboard.** The required design artifact ships **before** implementation.

---

## 1. The governing question

> **Does the client experience Now What? as an ongoing relationship with their work, rather than a
> collection of tools?**

The purpose is not to build a homepage. It is to answer: **can a real practitioner support a real
client through this environment between sessions?**

⭐ This is the phase that moves from *"is the architecture sound?"* to *"does the relationship
actually live?"*

---

## 2. ⛔ Audit finding — most of the proposed slice has no tables

The accepted foundation (#902) **deliberately excluded every content-bearing table**, deferring them
to an encrypted-content lane that **does not yet exist**. Verified against trunk `c0c8b0ba6`.

### 2.1 Buildable today — structure exists

| Table | Carries |
|---|---|
| `practitioner_clients` | the canonical relationship |
| `coach_program_definitions` · `coach_program_stages` | program + stage catalogue |
| `coach_program_enrollments` · `coach_enrollment_stage_history` | enrollment, bounded stage history |
| `coach_client_processes` | the process (⭐ **deliberately has no `title`**) |
| `coach_cohorts` · `coach_cohort_memberships` | cohort structure |
| `coach_sessions` | scheduling (external calendar ids only) |
| `coach_position_share_consents` | the consent switch |
| `coach_client_selected_focus` | ⭐ **person-owned** — keyed on `members.id`, **no `relationship_id`** |
| `field_notes` · `member_field_note_threads` · `field_attention` | **the client's own Field — already live** |

### 2.2 🔴 Blocked — named in the deferred list, no table on trunk

| Proposed Home element | Required table | State |
|---|---|---|
| "Notes intended for client" / **From Larry** | `coach_authored_notes`, `coach_note_publications`, `coach_note_publication_events` | deferred |
| "What Larry shared" | `coach_client_shared_items` | deferred |
| **Commitments · Assignments · Practices** | `coach_work_items`, `coach_work_item_history` | deferred |
| **Resources** | `coach_resource_recommendations` | deferred |
| **Important / upcoming dates** | `coach_important_dates` | deferred |
| Session preparation / follow-up | `coach_follow_ups` | deferred |
| "Current focus" (as text) | `coach_current_focus` | deferred |
| Shared position payload | `coach_position_shares` | deferred (⚠️ the **consent** row exists; the **share** does not) |

### 2.3 What this does to Phase 3 as written

Phase 3 asks Larry to create six things:

| | Status |
|---|---|
| Client relationship | ✅ buildable |
| Program | ✅ buildable |
| Commitment | 🔴 blocked |
| Practice | 🔴 blocked |
| Resource | 🔴 blocked |
| Date | 🔴 blocked |

**Four of six have no storage.** The **entire "From Larry" surface** is blocked. This is not a gap to
route around — it is the founder ruling of 2026-08-02 working exactly as intended: *every field
capable of holding substantive human expression waits for the encrypted-content contract.*

⛔ **Do not create new tables to unblock this.** That would rebuild the plaintext surface #898 was
reverted for, under different names. The instruction *"do not create new ontology"* and this
constraint are the same constraint.

---

## 3. The reshaped vertical slice — what CAN be proven now

⭐ **The asymmetry is the design insight, not a defect.** The client's own Field is fully live; the
practitioner's expression toward the client is entirely deferred. So the first slice can prove
**structure, orientation, and client-owned continuity** — but not practitioner authorship.

### Slice A — "Your journey with Larry" (buildable end-to-end)

```
Larry creates:  relationship → program → stages → enrollment → session date
      ↓
Client Home shows:  who I work with · what process I'm in · what stage · next session
      ↓
Client acts:  reflects · keeps something · asks MAIA · returns later
      ↓
Larry sees:  only structural state + what the client explicitly shared (consent row)
```

**Panels this supports:**

- **Arrival** — *"Welcome back."* Pure orientation copy. ✅ No dependency.
- **My Journey** — practitioner-defined placement · stage · enrollment. ✅
- **My Field** — keeps, reflections, questions, on live `field_*` substrate. ✅
- **Continue** — last/next session from `coach_sessions`. ⚠️ **partial** — commitments and unfinished
  threads are blocked.
- **From Larry** — 🔴 **structurally absent.** Not stubbed, not faked, not "coming soon" with a fake
  row behind it. Absent.

### 3.1 The boundary that must hold in the UI

> The system **does not decide** the client's developmental position.

It may show: practitioner-defined program placement · client-declared focus · explicitly shared
position · active commitments *(when they exist)*.
⛔ It may **not** silently interpret progress.

⭐ `coach_client_selected_focus` enforces this structurally — keyed on `members.id` with **no
`relationship_id`**, so Larry's relationship *cannot address the record*. The UI must not undo in
presentation what the schema made unreachable.

**My Field is not** *"here is what we know about you."* It is *"here is what you have chosen to
carry."*

---

## 4. Dependencies and what the walk cannot yet test

| Dependency | Effect on this lane |
|---|---|
| **#916** corrective amendment | foundation has two unlanded amendments; slice should not assume final reconciliation shape |
| **Encrypted-content lane** — *does not exist, no referent* | blocks "From Larry" entirely. 🔴 **This is the critical path for the pilot**, and it has no issue, no owner, and no scope |
| **#917** checksum transition | can gate whether environments reach any new migration |

⚠️ **The acceptance walk as proposed cannot be run in full.** Under "Can Larry add meaningful support?
Can Larry prepare the client between sessions?" — **both are currently unbuildable.** A walk that
scores them PASS on structure alone would be false evidence.

**Two honest options** — this is the lane's first decision, and it is not mine to make:

- **(A)** Run a **narrowed** walk now: orientation · journey structure · client Field · return
  continuity. Explicitly scope out practitioner authorship. Proves the environment holds a
  relationship *shape* before it holds practitioner *expression*.
- **(B)** Open the encrypted-content lane first, then run the full walk. Slower; the pilot tests what
  was actually designed.

---

## 5. Acceptance walk (draft — to be frozen before execution)

**Larry:** 1) invite a client · 2) see the relationship · 3) *add meaningful support* 🔴 · 4)
*prepare the client between sessions* 🔴
**Client:** 1) understand where they are · 2) *understand what Larry offered* 🔴 · 3) continue their
own work · 4) return and find continuity

**Constitutional test:**

> Did the client forget they were using software and feel they were continuing their work?

**The return test:** *when the client returns after two weeks, does something feel like it was
waiting for them?* ⚠️ With "From Larry" absent, the only thing that can be waiting is **what the
client themselves left**. That is a real and testable result — it is simply a narrower claim than the
pilot's full intent, and must be reported as such.

---

## 6. Standing constraints

- ⛔ **No new ontology.** Reuse the accepted practitioner–client foundation and the existing Now What?
  client Field.
- ⛔ **No new content-bearing tables**, including titles, labels, reasons, descriptions, or generic
  JSON that can carry expression indirectly.
- **Surface only what ownership and visibility rules permit** — everything Larry sends is an explicit
  act with explicit visibility; **Larry's private notes are never on this surface.**
- The Home is optimized for **orientation**, not conversation. The current session-room opener
  (*"Where's your attention right now?"*) was optimized for a conversation and is not the Home.

Related: `COACH_FIELD_FOUNDATION_CANONICALITY_2026-08-02.md` ·
`COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md` (donor — historical evidence, not active spec) ·
`NOW_WHAT_PHASE_TRANSITION_RECONCILIATION_2026-08-02.md`
