# Now What? — Field Activation Readiness

**Date:** 2026-08-03 · **Status:** ⛔ **REPORT ONLY. Nothing here authorizes a build, a merge, a deploy, or a participant contact.**
**Mode:** operationalization, not architecture. No new ontology is introduced below. No new concept is named that was not already ruled or already built.

**Measured against:** working checkout `44467a40b` (`fix/practice-field-corpus-authority-gate`, **231 commits behind** `origin/clean-main-no-secrets`), plus `git log --all` and `gh pr list`. Every claim below is Class A (structural, machine-verified) unless tagged otherwise. **No Class C (experiential) claim appears in this document**, per the confabulation guard in `NOW_WHAT_CLIENT_HOME_LARRY_ACCEPTANCE_WALK.md` §1.

---

## 0. Two findings that change the readiness picture before A–D

### F-1 ⭐⭐⭐ The Home is not absent, not a candidate, and not unmerged. **It is live in production.**

> 🔴 **This section replaces an earlier version of itself.** The first pass asserted the Home was
> *"on a candidate branch, not trunk, no open PR"* and flagged the untracked working-tree copies as
> a **fourth artifact state** (a concurrent writer's lane). **Both claims were wrong.** They were
> produced by checking `7746fb78d` — the practitioner-door commit on the *parked* branch — and
> generalizing from it without checking the lineage root against trunk. Corrected below, with the
> ancestry checks that settle it.

| Object | Verified state |
|---|---|
| **Client Home v0 `568cca29b`** | ✅ **ancestor of `origin/clean-main-no-secrets`** — merged to trunk 2026-08-03 11:22 EDT |
| **Deployed** | ✅ **ancestor of `95b21ce42`**, the SHA running in production (`docker exec maia-sovereign printenv GIT_COMMIT`), deployed 14:32 EDT — **3h10m after the Home landed** |
| `app/now-what/page.tsx` · `ClientHome.tsx` · `api/now-what/home/route.ts` | ✅ present at `95b21ce42`. **`/now-what` is serving.** |
| The untracked copies in this checkout | ✅ **byte-identical to trunk (3/3).** Not a fourth state, not another session's lane. This branch is 231 commits behind trunk, so trunk-tracked files legitimately read as untracked here. **The concurrent-writer flag was a false alarm and is withdrawn.** |
| Trunk tip `4f80cf873` | 15 commits **ahead of production** |
| Parked on `feature/bring-forward-v1`, **not** on trunk | `772a7a1dc` v2 · `5d8310e43` carry gesture · `2b9e6cd42` threshold · `7746fb78d` practitioner door |

**Why Gate 0 said the surface did not exist:** it measured `136f580a0`, which **predates `568cca29b`**. Both are 2026-08-03. The result was true when taken and went stale within hours. *Not an error in the instrument — an error in treating its timestamp as current.*

**Consequence — the framing changes at the root.** The question is not *"which candidate is authorized to become the first experience?"* There is no promotion step to authorize. **The Home is already the deployed member experience.** What was missing was never the surface; it was a **named referent, a re-measurement, and an instrument** — all three of which are now discharged (§D-0, §D-1).

### F-2 ⭐⭐⭐ The field a client would encounter today contains no practitioner material — by an in-force gate.

`lib/practiceField/practiceFieldService.ts:262` → `corpusIsComposable()` is a hard `return false`. **Both** composition sites (`formatFieldContextForRoom`, and the live-field read at :420) are closed. Larry's material cannot reach MAIA in any room, at any consent level.

This is correct and should not be changed here. But it precisely bounds the success criterion:

> **A first walk can test whether the *container* holds. It cannot yet test whether the *field* carries a practitioner's wisdom — because no practitioner content is composable.**

Anything framed as "let Larry and a client encounter the field" that assumes Larry's teaching is present is measuring something that does not exist (`feedback_empty_measurement_is_not_absence`).

---

## A. Existing capabilities that can safely be exposed now

Safe = member-scoped · reversible · composes only authored acts · adds no storage · encodes no unruled assumption.

| # | Capability | Why it is safe | Evidence |
|---|---|---|---|
| **A1** | **Member-scoped Home read** — `GET /api/now-what/home` | 401-first; member-scoped; **creates no storage**; groups only by tags the *member's own gesture* wrote (`spiralogic_phase`); no synthesis, no score, no third voice; explicitly refuses practitioner read | route header + body, `app/api/now-what/home/route.ts` |
| **A2** | **The Home as a threshold surface** | Refuses score/percentage/streak/ranking/completion; empty state is first-class, not an error; provenance line (`in your words` / `you kept this`) carried per item | `components/now-what/ClientHome.tsx` |
| **A3** | **Member's own view of their sharing boundary** (`shared`) | The member sees, from their side, what *they* elected to expose. Not a practitioner payload. Defaults false; set only by explicit per-thread gesture | `can_be_shown_to_practitioner` |
| **A4** | **Copy discipline already holding** | Copy audit over `app/now-what/**` + `components/now-what/**`: **0** occurrences of Complete · Progress · Goals · Remaining · Done · Streak · Achievement | Gate 0 §4b, G9 |
| **A5** | **Six existing rooms + navigation** | Already live; `lib/nowWhat/rooms.ts` defines exposure per room | `NOW_WHAT_ROOMS`, `roomForPath` |

⚠️ **A1–A3 are "safe to expose" in construction, not in release state.** They are on an unmerged lineage with no PR. Exposure requires the lane to become a durable object first.

---

## B. Capabilities requiring practitioner / client validation

These are built or designed, and their **correctness is not machine-decidable**. Class C. Only a human participant may close them.

| # | Capability | The question only a human can answer |
|---|---|---|
| **B1** | The Home as arrival | Does a person who follows their link know where they are and what is theirs? |
| **B2** | "Kept, not recent" (E-2′) ordering | Does the member's *keeping* order read as their own, or as the system's judgment? |
| **B3** | Provenance lines (`in your words`) | Does attribution read as respect, or as the system reminding them it is watching? |
| **B4** | Empty state | Does "at the beginning" read as a valid place to stand, or as failure? |
| **B5** | The sharing boundary band | Can the member *see* the boundary from their own side — and does seeing it produce trust or anxiety? |
| **B6** | MAIA as one door among equals | Does MAIA read as a resident, or as the destination? |
| **B7** | Larry's view — **the absence is the product** | Does Larry experience *not seeing* the client's inner process as a loss, or as the thing that makes the relationship possible? |

⛔ **B1–B7 may not be answered by Claude, by telemetry, or by implementation inspection.** Per the acceptance walk's 2026-08-03 amendment: adoption ⊀ usage · trust ⊀ continued use · safety ⊀ absence of withdrawal · value ⊀ retention · comprehension ⊀ completion. **Record behavior; never assign meaning to it.**

---

## C. Capabilities explicitly blocked pending authority decisions

Split by *what kind of thing* would unblock them — a ruling, a signature, a defect fix, or a substrate that does not exist.

### C-i · Blocked on a ruling (no engineering will unblock these)

| # | Item | Blocked by |
|---|---|---|
| **C1** | Home's constitutional shape — client **co-equal** or **spectator** | Q-A / Q-B not ratified |
| **C2** | Client research recruitment | **D9 — the only blocking docket item**; blocks Walk B |
| **C3** | Anything citing `AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT` §4 as build authority | ⛔ NOT RATIFIED; §12 unfilled; §0 relationship to the Member Experience Design Constitution unruled. *Unfilled means unruled — it governs nothing and authorizes nothing.* |
| **C4** | Practitioner **door placement** | ⛔⛔ UNRULED — three conflicting answers on record (bottom-of-`/now-what` server-gated · built `/studio` · `/practitioner/login`). `7746fb78d` is a **candidate that picks one**, not a ruling |
| **C5** | Relational inference reaching a member surface | authority question, not an implementation task |
| **C6** | New implementation lanes generally | **G-a** — Phase 1 failed at W8; standing gate **held, not lifted** |

### C-ii · Blocked on an instrument outside engineering

| # | Item | Blocked by |
|---|---|---|
| **C7** | Any Larry-facing activation | **Larry IP one-pager** (standing gate) + the rights instrument `Larry Materials Agreement.docx` v1.2 is **UNSIGNED**. Its own §1 governs: *"if it's not on the list, it's not in the system."* |
| **C8** | Larry's material reaching MAIA | `corpusIsComposable()` → hard `false`. Closed until a **ratification model** exists. ⛔ Do not open it to enable a walk |
| **C9** | `about_practice` five-domain content | 🔴 error is live in production and ⛔⛔ **engineering must not fix it** — the content belongs to its author |

### C-iii · Blocked on a defect

| # | Item | Blocked by |
|---|---|---|
| **C10** | Sessions room content · calendar · anything writing `sessions` | **#899** — 4 INSERT paths omit `sessions.team_id`; code complete `12e4787ee`, **release unresolved** |
| **C11** | Session notes surfaced anywhere | `sessions.notes` is **plaintext PHI** (Q-E) |

### C-iv · Blocked by absent substrate (asserted-absent tables)

`coach_work_items` · `coach_note_publications` · `coach_current_focus` · `coach_client_shared_items` · `coach_position_shares` · `coach_important_dates`.
⇒ blocks: Home band "From Larry" · commitments/offers/affirmations · share-back loop · focus in the client's own words · Messages room · Resources room.

---

## D. Minimum implementation required for the first field walk

**The first field walk does not require Larry.** It requires one human, one member-scoped surface, and an instrument. That is the smallest slice that produces evidence rather than another artifact.

### D-0 · Custody + measurement — ✅ **DISCHARGED 2026-08-03**

| | Action | Result |
|---|---|---|
| **D-0.1** | Establish the Home's integration state | ✅ **merged to trunk `568cca29b`; live in production `95b21ce42`.** No custody dispute: all five lineage commits are authored by Kelly Nezat; the untracked copies are byte-identical to trunk. **Nothing to coordinate, nothing to merge** |
| **D-0.2** | Name the referent | ✅ **`95b21ce42`** — the deployed image, not trunk (`4f80cf873` is 15 commits ahead and is *not* what a participant meets) |
| **D-0.3** | **Re-run Gate 0 against the SHA that carries the Home** | ✅ **done, statically, zero code** — see below |

**Gate 0, re-measured.** Three of four assertions convert from ⏸️ *not evaluable* to measured:

| | Result |
|---|---|
| **G9** — no productivity semantics | ✅ **PASS.** All 3 matches are the prohibition being *declared*, incl. member-facing copy at `ClientHome.tsx:463`: *"No scores, rankings, progress measures, assessments or summaries of you."* Zero in operative copy |
| **G2/G6** — route scope derivation | ✅ **PASS.** 401-first; `memberId` from session, never request body; every `WHERE` scoped `member_id = $1`; no practitioner read path |
| **G8** — no recency judgment | ⚠️ **FINDING.** `route.ts:112` anchors on the member's keeping gesture (correct) but presents **newest-first**; `route.ts:184` orders positions by `p.updated_at DESC` — a **system-maintained** timestamp the member never touched |
| **G3** — practitioner payload | ⏸️ **unchanged.** No payload exists |

⛔ **Do not fix G8 before the walk.** Whether ordering reads as the system's judgment is a Class C question the walk is positioned to answer. Fixing it first replaces the evidence with the builder's guess about what the evidence would have said.

### D-1 · The instrument — ✅ **AUTHORED 2026-08-03**

`CLIENT_ARRIVAL_BASELINE_WALK` was cited by `NOW_WHAT_PHASE_4_IMPLEMENTATION_READINESS` as gate 2, *"runnable now, no code"* — **but the file did not exist.** A claim with no referent. It now exists: [`CLIENT_ARRIVAL_BASELINE_WALK.md`](CLIENT_ARRIVAL_BASELINE_WALK.md) — referent SHA, observer roles, two sittings incl. the return, the required empty-participant case, evidence admissibility, the inference bar, the four-layer sequence, and eight explicit non-goals.

### D-2 · The one implementation on the critical path — and it is not the Home

| | Item | Why it is the seam |
|---|---|---|
| **G3** | **A practitioner read path on the coach spine** | Zero routes in `app/api/**` touch `practitioner_clients` / `coach_client_processes`. Only `lib/coachField/invitation.ts` does. `app/api/portal/**` and `practitionerPortal.routes.ts` belong to the **older lineage**, not the `#902` spine. **A payload that could omit focus does not exist — and an absence cannot be audited into existence.** |

⛔ **G3 requires a new authorization boundary. It is not authorized by this document.** It is also the *only* item whose completion converts "the absence is the product" from a design claim into a checkable one.

### D-3 · Minimum viable first walk — two options, ordered by cost

| | Walk | Requires | Produces | Blocked by |
|---|---|---|---|---|
| **Option 1** ⭐ **Member arrival walk** | D-0, D-1. **No new code.** One consented member, the Home at a named SHA | Class C evidence on B1–B6 | D-1 (instrument absent); C6 (G-a) if the Home lane counts as an implementation lane |
| **Option 2** | **Larry acceptance walk (Walk A)** | Option 1 + **G3** + C7 (signed instrument, one-pager) | Class C evidence on B7 — *the absence* | C7 · G3 · C4 |

**Option 1 is the smallest executable field slice.** It is precondition-light **by construction** — the same property that made Slice 0 Option A the evidence-producing move rather than a deferral.

### ⭐⭐⭐ The G-a question, restated against measured state

The question was posed as: *does exposing a candidate member surface to a participant constitute beginning the held implementation phase?* **F-1 dissolves the premise — there is no exposure act.** The surface is merged, deployed, and serving. The touch-inventory (`CLIENT_ARRIVAL_BASELINE_WALK` §1):

| | |
|---|---|
| merge · route activation · new member pathway · production behavior change · schema change · deploy · **any write** | ❌ **none required** |
| observe a deployed read-only surface · record a human's experience | ✅ the whole of it |

The Home route **creates no storage**. The walk writes nothing the participant's own ordinary use would not already write.

### ✅ G-a — RULED 2026-08-03 (founder)

> **Permitted for the bounded Member Arrival Walk.** *An observation act against deployed `95b21ce42`, not a continuation of the held implementation phase.*

⛔ **Does not authorize:** Larry field activation · practitioner payloads · practitioner–client relationships · **G3** · **changes made on the basis of observations.** Each is a separate authority.

⭐ **The walk may produce a finding; it may not produce a change.**

**Remaining conditions (founder):** the referent stays fixed at `95b21ce42` — ⛔ *never substituted for "latest trunk"*; **executor, observer and acceptance must be named, with acceptance separate from execution**, and any role overlap **recorded rather than pretended away**.

⛔ **D9 remains independently blocking.** G-a decides whether the walk *may* run; D9 decides whether anyone may be *asked*.

---

## Field Activation Plan

Sequential. Each step's output is the next step's precondition. No step may be skipped to reach evidence sooner.

1. **Custody** — pull trunk; make the Home lineage a durable object (D-0.1, D-0.2).
2. **Measure** — re-run Gate 0 at that SHA (D-0.3). Structural layer only.
3. **Author the instrument** — write the member arrival walk (D-1). No code.
4. **Rule** — founder answers the G-a question above, and C1 (co-equal vs spectator).
5. **Walk (member)** — Option 1, one consented participant.
6. **Then, and only then** — G3 as its own authorized lane, C7 satisfied, Walk A with Larry.

Steps 1–3 are executable without any new authorization. **Step 4 is where this plan stops on its own.**

---

## First User Walk Definition

**Unit:** one consented member · the Home at a named SHA · unaccompanied first arrival, then one return after a real interval.
**The return is not optional** — *when the member returns after time, what do they naturally resume?*

**Recorded:** verbatim language · observed action · **moments of confusion** (pause, backtrack, "what is this?") · **unexpected mental models** · what they returned to first.
**Not recorded as findings:** session length, click counts, completion, frequency. Admissible as Class A/B substrate that *locates* a question; **never as the answer to one.**

**Who may produce what:**

| Who | May produce |
|---|---|
| Claude | Class A/B structural assertions · copy audit · Class E constitutional check · this document |
| The member (human, consented) | all Class C findings for Option 1 |
| Larry (human) | Walk A findings only |
| **Nobody** | a Class C finding inferred from implementation **or from telemetry** |

---

## Observation Protocol

**`Structural → Experience → Interpretation → Acceptance`.** ⛔⛔ The four layers may not be shortened to three.

- The participant owns *"what did this mean to me?"*
- The observer records *"what did they say?"* — verbatim, before any interpretation
- The founder decides *"does this meet the acceptance threshold?"* — and **may not replace the participant's interpretation with an expert one.** Acceptance may weigh, reject as insufficient, or decide against an interpretation. It cannot author one.

**The contamination point is precise: replacement before recording.** Evidence is not destroyed when a participant misunderstands. It is destroyed when the observer substitutes the builder's model for the participant's *before the participant's model is on the record*.

⚠️⚠️ **Confusion is an observation, not a verdict.** *"I thought this moved over to Larry"* is not a participant error to correct — it is the finding that **the interface taught a transfer model**. The strongest available evidence is a mental model that diverges from the designed one. **The product must be able to receive that without defending itself.**

---

## Explicit Non-Goals

⛔ This phase does **not**:

1. Expand architecture, introduce ontology, or name a new concept.
2. Open `corpusIsComposable()` — not to enable a walk, not for one participant, not temporarily.
3. Fix, complete, or improve `about_practice` content. **Engineering may build the container; never author the content.**
4. Build the Home. It is built. The work is custody, measurement, instrument, ruling.
5. Merge, promote, or deploy the Home lineage. Re-measuring Gate 0 is **not** promotion.
6. Touch, commit, or repair the untracked working-tree copies in this checkout.
7. Ratify anything. **Claude may Draft and Record, never Ratify.**
8. Treat Gate 0's ⏸️ NOT EVALUABLE as a pass, or its re-measurement as human acceptance.
9. Recruit or contact a participant. **D9 is unruled.**
10. Produce, infer, or pre-write a Class C finding — including a "predicted" one.
11. Contact Larry, or place any material on Attachment A, while the rights instrument is unsigned.
12. Resolve C4 (practitioner door) by shipping the candidate that picks an answer.

---

## Status

```
Custody (D-0.1/0.2)        ✅ Home merged 568cca29b · LIVE in prod 95b21ce42 · no dispute
Gate 0 re-measurement      ✅ G9 PASS · G2/G6 PASS · G8 FINDING · G3 unchanged
Walk instrument (D-1)      ✅ CLIENT_ARRIVAL_BASELINE_WALK.md authored
G-a                        ✅ RULED — permitted for bounded observation (founder 08-03)
Executor / observer named  ▢ BLOCKING — acceptance must be separate; record overlaps
D9 participant authority   ⛔ FOUNDER — separate authority, still blocking
C1 (co-equal vs spectator) ⛔ unruled
G8 ordering finding        ⛔ do NOT fix before the walk
G3 practitioner seam       ⛔ requires a new authorization boundary
Larry-facing anything      ⛔ unsigned rights instrument + one-pager gate
Implementation             unchanged — nothing was built
```

**The success criterion, restated against measured state:**

> *Can a practitioner and client encounter the field and tell us what it means, without the system having already decided for them?*

Today: **a member can already encounter the container — it is deployed and serving.** The field's practitioner content is closed by an in-force gate, and the practitioner's own view does not exist. What was missing was never the surface. It was a **named referent, an honest measurement, and an instrument** — and the discipline not to let a stale "not evaluable" stand in for "not there."

**The architecture can host reality. It has not yet been given any — and now nothing technical is stopping it.**

*The system does not outrun the evidence.*
