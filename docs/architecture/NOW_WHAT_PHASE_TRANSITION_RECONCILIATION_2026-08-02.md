# Now What? Phase Transition brief — reconciliation against canonical record

**Date:** 2026-08-02 · **Status:** Record / assessment. No implementation, no ruling.
**Observed trunk:** `origin/clean-main-no-secrets` @ `031fd8ad9` (local checkout `7c9dd5192` was behind).

---

## 0. The finding that governs the response

**The design assessment this brief asks for already exists, and is on canonical trunk.**

PR **#898 MERGED** 2026-08-02T20:28:23Z (merge `6884e66b0`, base `clean-main-no-secrets`). It carried:

| Artifact | Covers brief deliverable |
|---|---|
| `docs/architecture/NOW_WHAT_DEVELOPMENTAL_HOME_AUDIT_2026-08-02.md` (219 ln) | 1 (current state), 7 (what not to build) |
| `docs/specs/developmental-environment/COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md` (331 ln) | 2–6 (IA, client home, practitioner workspace, object model, sequencing) |
| `database/migrations/20260802000001_coach_facilitator_field.sql` (884 ln) | the substrate |
| `lib/coachField/{access,notes,positionSharing}.ts` | authorization + sharing boundaries |

Authoring a second assessment would reproduce the **#898 / #902 duplication** the founder already
ruled against (*"do not maintain two competing foundation PRs; preserve history, designate ONE
operative lineage"*). This document therefore maps the brief onto the existing record and names
only the genuine delta.

---

## 1. Where the brief's premise is factually wrong

The brief describes Now What? as a place where the client would otherwise "feel like they are
navigating tools," implying a thin surface to be built up. The audit §1 established the opposite:

> The brief's premise (that Now What? is a single blunt conversation entry) is **partly incorrect**.

**Nine member-facing routes are live** — `arrive · map · room · position · field · next ·
questions · reflections · themes` — with shared chrome (`NowWhatShell`, `EnvironmentMapView`).
Post-signin landing is already `/now-what/map`, not the room.

Audit §1 conclusion: **~70% of the brief's "required experience" already has substrate.** The
correct work is *composition and a threshold surface*, **not a new data model**. Inventing parallel
`programs` / `enrollments` / `cohorts` / `personal_notes` tables would duplicate live concepts.

⭐ The brief's own instinct — *"Journey → Program → Sessions → Reflections → Commitments"* — is
close to the merged object model, but the spec cuts finer in two places the brief collapses:
- **§4 — position and developmental stage are four distinct axes**, not one "stage."
- **§13 — Homework · Practices · Commitments are three meanings, not one task object.**

---

## 2. The brief re-opens three things already decided

### 2.1 "My Programs — active / completed / available / future" → **D-NW-1, RESOLVED → Option B**

The prior ruling was encoded in the schema itself
(`20260712000001_field_programs_and_positions.sql`):

> *Enrollment is declared by arrival, not administered by roster… **There is no enrollment table,
> no roster**, no departed-status graveyard — departure hard-deletes.*

Spec §16.1 **deliberately reverses** this: `ProgramEnrollment` + `StageHistory` + practitioner
enroll/advance/pause/complete/re-enroll. The brief's "My Programs" is therefore *already
authorized in shape*.

⚠️ **Consequence named but not yet ruled:** *departure acquires a history* where the prior ruling
deliberately gave it none. That was an authority split, not a schema convenience. Also owed:
explicit supersession of `NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10` and
`NOW_WHAT_PROGRAM_CATALOG_SPEC_2026-07-10` §8 — **silent divergence is not supersession.**

### 2.2 "Larry sees stage of development" → **C3, the sharpest question**

`field_program_positions` carries a categorical prohibition: *"NO practitioner read of these rows,
ever (catalog spec §8)."* The brief's practitioner view asks for exactly that read.

Settled direction (recorded in session memory, 2026-08-02): **C3 → option (ii)** — client-declared
position **private by default, shareable only by explicit member act, forward-only**;
`field_program_positions` untouched, §8 **narrowed, not repealed**, reusing the live
`surface_preference` consent pattern.

⚠️ Spec §16.2 still records this as OPEN. **The artifact lags the ruling.** Per the standing lane
rule, that amendment belongs to the lane that owns the spec — not to this one.

Practitioner **seeding** (`stated_by='practitioner_seeded'`, composes as *assumed* until the member
speaks) was always permitted. Practitioner **reading** of what the member has since declared is the
constrained act.

### 2.3 "Recent reflections · emerging themes · preparation notes" → **D-NW-2, STILL OPEN and larger**

This is the brief's largest blocked region, and it is blocked at **storage**, not at design.

Founder ruling 2026-08-02 (**option b, the cleaner cut**): reduce the foundation to
**non-content-bearing structural mechanics**; move *every field capable of holding substantive human
expression* to a dedicated encrypted-content lane.

⭐⭐⭐ **"No `body` column" is not the test.** Titles, focus labels, assignment names, reasons and
free-text descriptions all carry client content. Cut on: *can this field hold human-authored client
or practitioner content?*

Under that ruling, these brief items **cannot be built now**:

| Brief item | Why blocked |
|---|---|
| "Review insights" · "Recent reflections" | client-authored expression at rest |
| "Capture commitments" (wording) | commitment *wording* is content; the envelope is not |
| "Emerging themes" | derived from content |
| "Preparation for next session" | preparation notes are content |
| "Notes from Larry" (client-visible) | publication payload; **envelope stays, payload leaves** |

What **is** buildable now: the publication envelope
(`NotePublication{id, source_record_id, practitioner_client_id, process_id, published_by,
published_at, withdrawn_at, supersedes_publication_id, content_artifact_id}`), enrollment/stage
structure, consent mechanics, identity resolution, authorization boundaries, scheduling links.

⛔ **No plaintext placeholder that must later be migrated.**

---

## 3. Blocking prerequisites — verified, not inferred

1. 🔴 **#902 is still OPEN.** `feature/coach-field-integrated-foundation` is a *competing* coach-field
   foundation with a **hard file collision** on `scripts/verify-coach-field-boundaries.ts`, plus
   migrations numbered `000002`/`000003` after #898's `000001` — unknown whether they assume #898 or
   are a parallel redo. #898 merged **while #902 remained open**. The founder ruling to designate ONE
   operative lineage is **not discharged by the merge**. This must resolve before further building.
2. 🔴 **#899 — session creation is broken.** Four INSERT paths omit `sessions.team_id`. Spec §9
   (session-to-process continuity) and §12 (scheduling) both sit on `sessions`. Prerequisite.
3. ⚠️ **Covenant Gate models classification as mutually exclusive when obligations are CUMULATIVE**
   (`covenant-gates.yml`) — 2nd confirmed instance. Candidate fix **#896** exists, MERGEABLE; verify
   it implements cumulative obligations against the 6-row matrix before relying on it.
4. ⚠️ **#890 note lifecycle merged with 0/14 acceptance criteria verified.** Merged ≠ accepted.

---

## 4. The genuine delta — what this brief adds that the record does not hold

Stripping what is already decided or already blocked, the brief contributes **two** live questions:

**Q-A — Is there a *client-side* journey object, or only a practitioner-side one?**
The merged spec is written from Larry's side: §6 caseload, §7 client profile workspace, §15's 17
acceptance criteria are all practitioner verbs. The brief asserts the two views are *"two
perspectives of the same reality."* Spec §11 (client-facing synchronization) is the only client-side
section. **Whether the client's "My Journey" is a projection of the practitioner's process object,
or a co-equal object the client also authors, is not settled anywhere.** This is the real
architectural question the brief surfaces.

**Q-B — What does the Home answer when the client has no active program?**
The brief's Home answers *"What matters now?"* Every composed element (current program, stage, next
step) is null for a client who has been invited but never enrolled, or whose program completed. The
merged spec has no empty-state semantics. Per the standing return test — *when the member returns
after time, what do they naturally resume?* — this is not a polish question; it determines whether
the Home is a **place** or a **dashboard that is sometimes blank**.

---

## 5. What should NOT be built yet

- ❌ Any client-content surface — reflections, insights, themes, preparation, commitment wording —
  until the encrypted-content contract exists.
- ❌ Any second assessment, spec, or foundation branch. The lineage question (#902) is open.
- ❌ A "dashboard full of widgets" — the brief itself forbids this and the spec's ten-questions
  framing (§1) already supplies the alternative.
- ❌ Practitioner read of member-declared position beyond the consented, forward-only path.
- ❌ Treating "Phase 5" as authorized. **No phase transition has been ruled.** This document records;
  it does not decide.

---

## 6. Recommended next act (single, bounded)

Read #902's two migrations against #898's `20260802000001`, and designate one operative lineage.
Nothing else in this brief can be safely built while two foundations claim the same spine and the
same boundary-verification script.

Related: `NOW_WHAT_DEVELOPMENTAL_HOME_AUDIT_2026-08-02.md` ·
`COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md` §4 §13 §16 · `MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md`
