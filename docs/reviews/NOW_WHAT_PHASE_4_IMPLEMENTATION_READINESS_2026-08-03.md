# Now What? — Phase 4 Implementation Readiness Assessment

**Date:** 2026-08-03 · **Status:** ⛔ **ASSESSMENT ONLY. NO CODE. NO AUTHORIZATION.**
**Instrument:** Phase 4 entry gate — *does the project have the authority and evidence to begin?*
**Referent measured:** `origin/clean-main-no-secrets` @ `136f580a0` (fetched and inspected directly)

This document classifies. It does not rule, does not resolve open questions, and does not convert
designed principles into requirements.

---

## 0. ⚠️⚠️ Gate 0 — the observer was measuring the wrong tree

Before any classification below can be trusted, this must be recorded:

| | |
|---|---|
| **Local checkout** | `7b868d8f3` |
| **Canonical trunk** | `origin/clean-main-no-secrets` @ `136f580a0` |
| **Divergence** | **193 commits behind**, 11 ahead |
| **Consequence** | `lib/coachField/` **does not exist in the local working tree.** Neither do #902's migrations. |

An implementation plan written from this checkout would have classified the entire Coach Field
foundation as *not built* — and it is built. Every substrate claim in this document was therefore read
from `origin/…@136f580a0` via `git show`, **not from the working tree.**

⭐⭐⭐ **This is the standing trap firing again** — *verify the canonical referent, not the checkout you
happen to be sitting in.* It is listed here as a finding, not an aside: the first act of Phase 4 is
to pull, because the substrate picture the design artifacts assume is only true on trunk.

---

## 1. Experience boundary

### Is the client experience clearly defined?

**Yes, at design level — and it is the most complete layer in the lane.**

| Artifact | What it fixes | State |
|---|---|---|
| `NOW_WHAT_CLIENT_ENVIRONMENT_MAP_2026-08-03` | seven rooms; per room: purpose · who sees · who authors · live substrate · deferred · constraints | design-complete |
| `NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN_2026-08-02` | five-band Home architecture; **E-2 ruled** (kept, not recent); 12 prohibitions | design-complete, E-2 ruled |
| `NOW_WHAT_HOUSE_ROOMS_2026-08-03` | the five room-level questions; the ⛔-by-construction finding | ⚠️ §3a marked *proposed, not ruled* |
| `NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03` | navigation model | ⚠️ carries **two self-declared flags** (§0.1, §0.2) |

### Is Home vs Rooms resolved?

**Yes — Home is a room, not a container.** Home = *"know where I stand with Larry"*; the other six
rooms are named doors from it. The Home never computes a next step — Band ④ *"Continue"* lists named
doors and is explicitly barred from ranking or personalizing (Prohibition 4).

### Are entry points clear?

**Partly — and the gap is the most consequential one in this assessment.**

Live on trunk: **16 `/now-what/*` surfaces** (`arrive · map · room · position · field · next ·
questions · reflections · themes · welcome`, plus 6 API routes including a purpose-built
`POST /api/now-what/signin` that accepts email *or* username, per the 2026-07-16 existing-identity
ruling). Post-signin landing is `/now-what/map`.

⛔ **But the threshold a Larry-invited client actually crosses has never been observed.**
`CLIENT_ARRIVAL_BASELINE_WALK_2026-08-03` §8: *"Defined, not executed."* Its own §2 states the walk
**is runnable today and is expected to fail at a known step** — that failure is its product.

⭐⭐⭐ **Derived finding, and it differs from the expected shape of the first slice:**
the *authenticated client threshold* is **not READY**. It is the one item where the missing input is
evidence, the evidence requires **no code**, and the instrument to produce it **already exists and has
never been run.**

---

## 2. Authority boundary

### What may the system do?

Bounded by the twelve Prohibitions (`…EXPERIENCE_DESIGN` §6). The load-bearing five:

- No inferred progress · no development scoring · no hidden synthesis · no recommendation engine
- **No plaintext workaround for a ⛔ surface — a band without substrate ships absent, not faked**
- **No recency-led presence (E-2)** — the member's gesture determines what appears; time may
  *describe* an item, never decide that it is there
- **No withdrawal notification, and no member-Field activity history visible to anyone** (E-3)

### What may MAIA do?

`AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT` §4 — four categories that ⛔ **cannot collapse**:
**Remember** (*you told me*) · **Reflect** (*you may notice*) · **Suggest** (*a possibility*) ·
**Act** (*I am doing*). Named drift: reflection→interpretation, suggestion→recommendation,
memory→authority.

On the Home, MAIA is **a resident, not the destination** — one door at the bottom, equal visual weight.
MAIA may help think about something already present, prepare for a conversation, explore a question.
MAIA may **not** characterize the person, summarize their state, suggest what to work on, or narrate
development. *The Home never speaks in MAIA's voice about the person.*

In **Reflect**: MAIA unprompted is **L1 only**; L2/L3 require an invitation; **L4 is forbidden at any
consent level.**

⚠️ **The constitution carrying §4 is NOT RATIFIED.** §12 is unfilled; ratification additionally
requires ruling §0 (its relationship to the Member Experience Design Constitution). *Unfilled means
unruled. Nothing there governs, and nothing there authorizes build.*

### What may Larry see?

The relationship · the program and stage **he** placed · sessions · what he offered and which of it
was affirmed · whatever the client **elected** to share.

### What remains explicitly prohibited on Larry's view?

The client's private focus · their reflections · any MAIA observation about their material · any
activity signal · **any trace of a withdrawal**.

⭐ The formal property, which is testable and is the strongest thing in the lane:

> **A practitioner's view is a function only of shared material** — provable by rendering two fixtures
> that differ *only* in private material and diffing.

---

## 3. Data boundary

### What exists on trunk (verified by direct inspection of `136f580a0`)

**Ten `coach_*` tables + the relationship spine:**

```
practitioner_clients            ← the spine; everything hangs here
coach_program_definitions       coach_program_stages        coach_program_enrollments
coach_enrollment_stage_history  coach_client_processes      coach_sessions
coach_cohorts                   coach_cohort_memberships
coach_client_selected_focus     ← person-owned, NO relationship_id
coach_position_share_consents
```

Library: `lib/coachField/identity.ts` (branded `MemberId` / `PractitionerRecordId` / `RelationshipId`;
`resolvePractitionerRecordFromMember`; `authorizePractitionerClientRelationship` — returns `null`, not
a throw, so *"not yours"* and *"does not exist"* stay indistinguishable) ·
`lib/coachField/invitation.ts` (`createPendingRelationship`, `acceptInvitation`).
Gate: `scripts/verify-coach-field-boundaries.ts`.

### What must not be added yet — and cannot be

⛔ **Gate `1d` asserts the ABSENCE of the content tables**, verified at
`scripts/verify-coach-field-boundaries.ts:169` — check name *"content-bearing tables are deferred to
the encrypted lane, not shipped here"*, failure message **`these exist unencrypted: …`**.

The asserted-absent set:

```
coach_authored_notes          coach_note_publications      coach_note_publication_events
coach_work_items              coach_work_item_history      coach_current_focus
coach_client_personal_notes   coach_client_shared_items    coach_position_shares
coach_resource_recommendations coach_important_dates       coach_follow_ups
coach_stage_history_immutable
```

> **Creating any of these in a UI lane fails a control that was placed deliberately.** This is a
> protected boundary, not a gap (Q-C — resolved by existing evidence, no new ruling required).

⛔ **Rooms unbuildable by construction:** Messages · Resources · practitioner notes · commitments.
Messages carries two *further* independent blockers: `clientMessages.ts` sits on the **old** practitioner
lineage, not the `practitioner_clients` spine (E-1); and group spaces introduce **third-party consent**,
which is a new consent surface, **unruled**.

### 🔴 The seam nobody has built

**Zero `/now-what/*` surface — page or API — references `coach_*`, `practitioner_clients`, or
`lib/coachField`.** Verified by grepping all 16 files on trunk.

The live environment and the relationship spine are two complete, disjoint systems. **The first build
object is the seam between them, and it requires no migration and no new table.**

### 🔴 Defect, verified not inferred

`sessions.team_id` is omitted by **all four** `INSERT INTO sessions` paths on trunk —
`lib/portal/bookingTools.ts` · `app/api/studio/sessions/route.ts` ·
`app/api/portal/[slug]/book/route.ts` · `app/api/book/[slug]/confirm/route.ts`. **Session creation is
broken (#899).** Calendar and Sessions both sit on this.

🔴 **Q-E standing:** `sessions.notes` holds plaintext PHI. Anything surfacing session content inherits it.

---

## 4. Human evidence

### What has been observed

| Observation | Class | What it can carry |
|---|---|---|
| **Existing empty-state grammar** across `/maia/moments`, `/maia/anchor/history`, `/maia/portal`, `/now-what/position`, `/maia/orientation` | ⚠️ **candidate input only — read from source, not from members** | That a mature relational idiom already exists: *name what is absent + name the human act that creates what comes next.* Changes the design task from *invent a humane empty state* to **preserve and extend an existing grammar** |
| ⚠️ Outlier: `/maia/ideas` — *"No ideas yet."* | same | The good idiom is **a convention, not an enforced one.** Conventions drift |

### What is only designed

Every room. Every Home band. The navigation model. The arrival threshold. All of §1–§3 above.

### What remains unknown — no artifact can close these

- **Whether a member experiences any empty state as welcoming, clear, or meaningful.**
  The empty-state investigation is explicitly **closed**; no further reading of source can answer it.
- **What a Larry-invited client actually meets today**, and at which step they are lost.
- Whether the Home reads as a *place* or a *sometimes-blank dashboard* (Q-B).

### 🔴 Both walks are instruments that have never been run

| Walk | Status | Why |
|---|---|---|
| `CLIENT_ARRIVAL_BASELINE_WALK` | ⛔ **DEFINED, NOT EXECUTED** | Runnable **today**. Expected to fail at a known step — *that is its function*. §8: no result may be recorded until a human operator runs it |
| `HOME_ROOM_STATE_WALK` | ⏸️ **DEFINED, NOT EXECUTABLE** | Home is not built. Design-time specification walk |

⭐⭐⭐ **The lane holds zero human evidence about the client environment.** Not thin evidence — none.
Per the standing rule, *a harness never run is a proposal.*

---

## 5. Classification

### READY — authority exists · evidence exists · scope clear

| # | Item |
|---|---|
| R1 | **Pull trunk.** Bring the working checkout to `136f580a0` before anything else (Gate 0) |
| R2 | **Execute `CLIENT_ARRIVAL_BASELINE_WALK`.** Runnable now · no code · no migration · outcomes pre-committed in §4b · observer discipline and three contamination paths already specified. **This is the only item that both is authorized and produces the evidence everything else waits on** |
| R3 | **Fix #899** — `sessions.team_id` on all four INSERT paths. A defect repair on trunk, not a Now What? feature; must be fixed regardless of any phase ruling |

### WAITING FOR EVIDENCE — needs human observation

| # | Item | Instrument |
|---|---|---|
| E1 | Whether AIN OS needs multiple thresholds; whether *neutral before auth, personalized after* holds | R2 |
| E2 | Whether the existing empty-state grammar reads as hospitable to a member | ⛔ **no instrument exists** — a member sitting must be designed |
| E3 | The five Home arrival states (S1–S5) | `HOME_ROOM_STATE_WALK` — unblocks only once Home exists |
| E4 | Journey 3 (Reflect boundary) framing | Needs framing more than building; demonstrable earliest |

### WAITING FOR RULING — needs founder/product authority

| # | Question | Where it sits |
|---|---|---|
| G1 | **Q-A** — is the client's journey a projection or a **co-equal object**? | 📋 Recommended *co-equal*, awaiting ratification. If projection, the client is a spectator to their own development — which the member-experience constitution refuses |
| G2 | **Q-B** — what does Home show with **no active program**? | 📋 Recommended *no-program is a valid inhabited state*, awaiting ratification. Per the return test, **this is not polish** |
| G3 | **Q-B′** — are concurrent processes supported? | 🔴 Newly surfaced, unruled. Out of Slice 0 scope; decide before Slice 2 |
| G4 | **AIN OS constitution ratification** + §0 relationship to the Member Experience Design Constitution | ⬜ §12 unfilled. **Nothing in it governs or authorizes build** |
| G5 | **"Phase 3" names three different things** (Writer's Studio Phase 3 · Phase 3 inquiry · Experience Architecture) | ⏳ Founder direction issued that the term must not survive; rename **not selected**. ⛔ *Do not resolve it by building* |
| G6 | Group/cohort **third-party consent** surface | Unruled |
| G7 | `NOW_WHAT_HOUSE_ROOMS` §3a room-level question set | Marked *proposed, not ruled* |

### BLOCKED BY SUBSTRATE — needs technical foundation first

| # | Item | Blocker |
|---|---|---|
| B1 | **Messages room** | ⛔ by construction (gate 1d) + E-1 old lineage + G6 |
| B2 | **Resources room** | ⛔ by construction (gate 1d) |
| B3 | **Home Band "From Larry"** | needs `coach_note_publications` / `coach_work_items` — both asserted-absent |
| B4 | **Commitments · offers · affirmations** | `coach_work_items` — asserted-absent |
| B5 | **Sessions room (content)** | #899 + Q-E plaintext PHI |
| B6 | **Calendar (beyond next session date)** | #899 + `coach_important_dates` absent |
| B7 | **Share-back loop** (client elects → Larry sees) | `coach_client_shared_items` / `coach_position_shares` absent; consents ✅ exist |
| B8 | **Focus in the client's own words** | `coach_current_focus` — asserted-absent |

### NOT YET A BUILD OBJECT — concept exists, definition insufficient

| # | Item |
|---|---|
| N1 | **Arrival Evidence Packet** — ⛔ *not started and not startable.* Becomes real the moment R2 has a result. Built early, it is an empty container that will attract speculation into the shape of a finding |
| N2 | **Transition walk** between Home states (§5a) — named gap, no authorization |
| N3 | **E-2′** — ordering among *kept* items. `20260627000001_member_field_note_center.sql` may already hold the mechanism; **check before designing a new one** |
| N4 | **Stage content** — what a stage *is about* — is `coach_work_items` territory |
| N5 | Third-voice ruling — any MAIA claim **about** the member's material |

---

## PHASE 4 CANDIDATE FIRST RELEASE

> ### Slice 0 — the thinnest true loop
>
> Larry creates a relationship (`createPendingRelationship`) → client accepts (`acceptInvitation`) →
> Larry places the client in a program with a stage (`coach_program_definitions` →
> `coach_client_processes` → `coach_program_enrollments`) → **the client opens `/now-what` and sees
> "You and Larry · working through ‹program› · ‹stage›"** and can set their own focus
> (`coach_client_selected_focus`) → **Larry sees the relationship and the process, and cannot see the
> focus.**

**Why this and not something larger.** Every object exists on trunk today. It needs **no migration and
no new ruling**. It builds the one thing that is missing and unblocked — *the seam between the live
`/now-what` environment and the `practitioner_clients` spine* (§3). It proves, in a single walk, the
identity chain · the relationship spine · the authorization boundary · and person-owned enforcement.

⭐⭐⭐ **The negative assertion is the most valuable evidence in the phase** — *Larry cannot read the
focus* — because it is the invariant most likely to be violated later. It is testable in the strong
form already specified: render two fixtures differing **only** in private material, and diff.

Slice 0 also answers **Q-B for free**: the client with no program **is** the state between acceptance
and placement.

**What Slice 0 must not do:** infer progress · score development · surface an unpublished note ·
recommend a next action · read `coach_client_selected_focus` from any practitioner-scoped query ·
create any of the thirteen asserted-absent tables · ship a faked band where substrate is absent.

**Explicitly deferred from the first release:** the *"From Larry"* band · Messages · Resources ·
Sessions content · Calendar beyond a next date · commitments · the share-back loop · any second
threshold surface · any new privacy-sensitive practitioner content surface.

⚠️ **Departure from the anticipated shape, stated plainly:** *authenticated client threshold* was
expected to be part of the first release. It is not READY — because the threshold question has **zero
human evidence**, and the instrument to produce that evidence exists, requires no code, and has never
been run. **R2 precedes any threshold work.**

---

## OPEN GATES BEFORE BUILD

Only items that genuinely block implementation.

| | Gate | Kind | Blocks |
|---|---|---|---|
| **1** | **Working checkout is 193 commits behind trunk** (§0) | mechanical — closable immediately | *everything*; the substrate picture is wrong until pulled |
| **2** | **`CLIENT_ARRIVAL_BASELINE_WALK` not executed** | evidence — runnable **now**, no code | any threshold/arrival decision; N1 |
| **3** | **#899 — session creation broken** (4 INSERT paths, verified on trunk) | defect — must fix regardless | Sessions · Calendar · anything on `sessions` |
| **4** | **Q-A / Q-B not ratified** (recommendations recorded, ruling not issued) | ruling | Home's constitutional shape — whether the client is co-equal or a spectator |
| **5** | **Phase 1 is failed at W8; not a finished release object** | standing gate | ⛔ *no new implementation lane opens* until Phase 1 closes |
| **6** | **Larry IP one-pager** | standing gate | activation |
| **7** | **Correction 3 ratification unissued** | standing gate | its acceptance path is not yet governed |

⚠️ **Gates 5–7 are the decisive ones and they are not Now What? gates.** They are standing lane gates
recorded in `NOW_WHAT_LARRY_PILOT_TEST_PLAN` §0.2. Under them, **Slice 0 is a *candidate*, not an
authorized build** — R1, R2 and R3 are the only items executable without lifting a standing gate.

Nothing in this document authorizes a deployment, a migration, or an implementation lane.

*The system does not outrun the evidence.*

---

## Status

**Assessment recorded. Nothing ruled. Nothing implemented. No gate lifted.**
