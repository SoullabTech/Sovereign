# Artifact Field Inventory — 2026-08-03

**Status:** ⛔ **INVENTORY. Assigns no authority. Preserves; does not classify.**
**Observed at:** `0e9e47f6c` on `clean-main-no-secrets`, 2026-08-03.

> ⭐ **An inventory is not a declaration of the field. It is a timestamped observation of the field.**
> **Snapshot accuracy ≠ field truth** — a snapshot can be perfectly accurate at t₁ and incomplete at
> t₂ (see §1a, where this one went stale in minutes). Any re-run must: name the exact commit,
> timestamp the observation, distinguish **tracked state** from **working-field state**, and record
> parallel changes as **field events** rather than as corrections.

A repository state pass, not a design pass. **Preservation precedes classification** — every artifact
below is committed in the same change as this document so that nothing can be lost while its status
is being decided. **Committing conferred nothing.** Location, title, and preservation are all
independent of authority.

> The failure this addresses is not poor design quality. It is **referent invisibility** — a
> discovery method that searches known references rather than the artifact field.

---

## 1. Overlap groups — the question to ask first

⚠️ **Do not assume these compete because they share words.** The question, per the Home-vs-Rooms
resolution:

> **Are these different views of one architecture, or competing definitions of the architecture?**

| Group | Artifacts | Likely relation |
|---|---|---|
| **A · Constitution** | `specs/AIN_OS_EXPERIENCE_CONSTITUTION_DRAFT` + Articles 8, 9 · `canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT` | ⚖️ **unresolved** — possibly parent + cross-layer translation, possibly competing. ⚠️ the second's **location implies authority not granted** |
| **B · BD / Mark** | `pitch/BUSINESS_DEVELOPMENT_BRIEF` · `pitch/_archive/MARK_EFFINGER_BD_BRIEF` | ✅ **RESOLVED — see §1a** |
| **C · Navigation / arrival** | `product/NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE` (parallel) · `product/AIN_OS_ENTRY_ARCHITECTURE` · `product/NOW_WHAT_HOUSE_ROOMS` · `product/NOW_WHAT_CLIENT_ENVIRONMENT_MAP` | 🔍 **likely different views** — threshold layer vs entry-type layer vs room layer. **Read before merging anything** |
| **D · Surface grammar** | `product/NOW_WHAT_ACTIVE_SURFACE_PRINCIPLES` (parallel, *"working synthesis, not durable"*) · `product/NOW_WHAT_DESIGN_PRINCIPLES` | 🔍 likely adjacent layers — *what may be on a surface* vs *what governs a screen* |
| **E · Evidence instruments** | `product/NOW_WHAT_LARRY_PILOT_TEST_PLAN` · `product/walks/CLIENT_ARRIVAL_BASELINE_WALK` · `product/walks/HOME_ROOM_STATE_WALK` · `product/walks/NOW_WHAT_PRACTICE_WORKSPACE_LARRY_WALK_01` · `reviews/NOW_WHAT_CLIENT_HOME_LARRY_ACCEPTANCE_WALK` | ⚠️ **five instruments, one lane** — see §2 |

### 1a. ⚠️ This inventory was stale within minutes of being written — corrected

Two facts changed between authoring §1 and committing it. Recorded rather than silently fixed,
because the staleness is itself the finding:

| Claimed above | Actual |
|---|---|
| *`docs/pitch/_archive/` does not exist* | ✅ **it does** — the parallel session performed the move, adding `_archive/MARK_EFFINGER_BD_BRIEF_2026-08-03.md` and `_archive/README_MARK_BD_BRIEF_COLLISION_2026-08-03.md`. **Group B is resolved**; the declared state and the filesystem now agree |
| The empty-state finding lives only inside `HOME_ROOM_STATE_WALK` | ⚠️ **it now has its own artifact** — `docs/observations/EMPTY_STATE_OBSERVATION_2026-08-03.md`, in a **`docs/observations/` layer this inventory did not know existed** |

⭐ **The lesson is not that the inventory was wrong. It is that a shared checkout with live parallel
sessions has no stable state to inventory.** Any snapshot of the artifact field is accurate as of a
timestamp and not after. This is the same structural cause as the six collisions — and it means the
referent-resolution session should **re-list the field at the moment it begins**, never work from
this document's §4 as if it were current.

### Field events — how to read a discrepancy without assigning blame

A stale inventory is not automatically a failure. **Classify the discrepancy before reacting to it:**

| Event | Meaning |
|---|---|
| Inventory says a file is absent, later it appears | **the field changed** — expected in a live checkout |
| Inventory names one referent, later another appears | **ambiguity surfaced** — a real finding |
| Inventory misses an artifact that existed | **the observation boundary was incomplete** — fix the method |
| Inventory **overwrites** an artifact | 🔴 **preservation failure** — the only one of the four that is a defect |

⭐ Only the last is a fault. Naming the other three as *events* rather than *errors* is what keeps
concurrent work from becoming blame-oriented — and blame is what makes parallel sessions hide work,
which is the condition that produced the collisions in the first place.

⭐ **New layer to carry forward: `docs/observations/`** — a home for observations that are neither
design nor walk records. Its existence is itself a status signal: someone needed a place for a
finding that was not yet evidence and not a design. That distinction is worth keeping.

### ⭐ §2 — the instrument question is already open, and predates today

🔴 **CORRECTION (2026-08-03, same day).** I previously reported that
`product/WALK_INSTRUMENT_OPEN_DECISION_2026-08-02.md` governs the instruments in group E. **It does
not.** Read in full, it is scoped to the **Writer's Studio** lane — Phase 1 acceptance container vs
a Phase 3 field experiment, with three named conflicts (container identity · sequence dependency ·
authorship boundary) and three founder options. **It says nothing about Now What?**

What *does* generalize is the rule it states, in general terms:

> **Do not create a walk before the question being walked is settled.**
> And: one artifact, one responsibility — ⛔ **a container is not to be repurposed.**

⇒ **The Now What? lane has the same class of problem and no such record.** Group E's five
instruments accumulated without an identity decision. That decision is **separate, unopened, and
now recorded** at
[`NOW_WHAT_WALK_INSTRUMENT_IDENTITY_OPEN_DECISION_2026-08-03.md`](../product/NOW_WHAT_WALK_INSTRUMENT_IDENTITY_OPEN_DECISION_2026-08-03.md).

⛔ **Do not add or reconcile another Now What? walk until it is decided.**

## 3. The empty-state finding — status corrected

| | |
|---|---|
| Finding | *Do not invent a new empty-state philosophy; extend the relational grammar already present* |
| Source | `product/walks/HOME_ROOM_STATE_WALK_2026-08-03.md` — *"one room, five arrival states"* |
| Authority | **unresolved** — parallel-session artifact, untracked until this commit |
| Design implication | **candidate input** |
| Phase 4 evidence | ⛔ **not promoted** |

⭐ The finding is valuable precisely because it produced a *constraint* rather than a design answer.
That is also why it must not become authoritative merely by being true-sounding — the discipline that
protects it applies to it.

## 4. The field, by layer

**Constitution / governance** — `specs/AIN_OS_EXPERIENCE_CONSTITUTION_DRAFT` · `specs/…ARTICLE_CONFLICT_YIELD_EVIDENCE` ·
`specs/…ARTICLE_9_PROVENANCE_AND_REFLECTION` · `canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT` ·
`specs/REFERENT_RESOLUTION_PENDING` · `architecture/CC_STANDING_MISSION` ·
`architecture/PLATFORM_SCOPE_CORRECTION` (*the Author's Studio is a resident, not the platform* —
⭐ bears directly on the charter tree)

**Now What? design** — `product/NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN` ·
`NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE` · `NOW_WHAT_ACTIVE_SURFACE_PRINCIPLES` ·
`AIN_OS_ENTRY_ARCHITECTURE` · `NOW_WHAT_HOUSE_ROOMS` · `NOW_WHAT_CLIENT_ENVIRONMENT_MAP` ·
`NOW_WHAT_CLIENT_ENVIRONMENT_USER_JOURNEYS` · `specs/NOW_WHAT_LARRY_PRACTICE_WORKSPACE_UIUX_SPECIFICATION` ·
`architecture/NOW_WHAT_CLIENT_HOME_LARRY_PILOT_PHASE0` · `architecture/NOW_WHAT_CLIENT_HOME_PHASE_0_5_BOUNDARY` ·
`specs/developmental-environment/NOW_WHAT_ROADMAP_2026-07-16`

**Evidence instruments** — group E above, plus `product/WALK_INSTRUMENT_OPEN_DECISION`

**Writer's Studio** — `architecture/WRITERS_STUDIO_OPEN_ARCHITECTURAL_QUESTIONS` ·
`architecture/WRITERS_STUDIO_PHASE_3_PROJECTS` · `product/WRITERS_STUDIO_PHASE_1_WALK_SPECIFICATION` ·
`product/WRITERS_STUDIO_PHASE_3_INQUIRY_CONTAINER` · `releases/PHASE1_RELEASE_OBJECT_AUDIT` ·
`releases/PHASE1_WALK_DEFINITION_AUDIT` · `releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK` ·
`specs/CORRECTION_3_AND_PHASE_1_RULING_DRAFT` · `specs/CORRECTION_3_LANE_RECONNAISSANCE`

**Coach Field / platform** — `architecture/COACH_FIELD_FOUNDATION_CANONICALITY` ·
`architecture/FIELD_OBJECT_PROMOTION_RULING` · `architecture/INTEGRATE_PRACTICE_CANDIDATE` ·
`architecture/INTEGRATE_SLICE_PROPOSAL` · `architecture/PHASE2_SUBSTRATE_INVENTORY` ·
`architecture/PROJECT_RUNTIME_IMPACT_MAP` · `architecture/SUPERSEDED_IMPLEMENTATION_SURFACES`

**Pitch** — group B, plus the four Larry-facing artifacts already committed earlier today

⛔ **Known stale, do not reason from:** `architecture/NOW_WHAT_PHASE_TRANSITION_RECONCILIATION_2026-08-02`
— its premise (#898 merged) is false; #910 reverted it.

## 5. Status vocabulary to be assigned

Not assigned here. Each artifact gets exactly one, by founder ruling:
**candidate · draft · governing · superseded · unresolved.**

Two axes stay separate when assigning:

| Axis | Question | Values |
|---|---|---|
| **Capability** | what exists? | Live · Designed · Vision |
| **Claim** | what do we know about behavior? | Observed · Designed · Inferred · Imagined |

*A designed capability can carry an imagined user outcome. An observed behavior can reveal a missing
capability.*

## 6. Sequence

1. ✅ Inventory the field — this document
2. ✅ Preserve all — this commit
3. ⏳ Resolve overlapping referents (A, B; then C, D, E)
4. ⏳ Assign status to each artifact
5. ⏳ Only then decide what flows into the next phase

**Phase 3 is not "complete."** It is *complete enough to stop authoring.* **Referent reconciliation
is required before any of it is inherited as evidence.**
