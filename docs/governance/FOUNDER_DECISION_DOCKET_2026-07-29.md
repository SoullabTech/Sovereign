# Founder Decision Docket — opened 2026-07-29

**This docket is an instrument, not a decision.**

Its only job is to make pending decisions explicit, separable, and individually
actionable. It does not advance any candidate artifact, recommend any option, or
carry a default. Where an option is stated here, it is stated at full strength or
not at all.

Two queues, deliberately not mixed:

| Queue | Authority | What it needs |
|---|---|---|
| **Constitutional** (§1) | Founder | Judgment. No substitute exists. |
| **Stabilization** (§2) | Operator | Execution, once judgment already exists. |

**Ordering carries no priority** except where priority has already been ruled.
Two orderings are ruled and are marked as such; every other item is listed in
arbitrary order and may be ruled in any sequence, or left unruled.

**Rulings do not live in this file.** A ruling is recorded in the governing
artifact named under *References*, and this docket's *Current status* field is
updated to point at it. If those two ever disagree, the governing artifact wins.

---

## §1 — Constitutional queue

### D1 — Review instrument selection

| Field | Value |
|---|---|
| **Decision ID** | D1 |
| **Question** | Which instrument governs the ecosystem experiential review program? |
| **Context** | Two candidate review instruments were authored on the same day by concurrent lanes: a review charter and an environmental field-study method. Neither is ratified. Their four structural differences (confabulation guard · study ethics · build pinning · evidence class E) change what an instrument may *conclude*, not merely how it reads. They cover different failure modes and do not compete on the same axis. The charter sequences House first; the method reserves Now What? as its calibration field — a direct conflict on the next action. |
| **Option A** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q1 Option A. Not restated here — see *Single authoritative location* below. |
| **Option B** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q1 Option B. |
| **What this unblocks** | House review Pass 2 (fresh walk). The first field-study calibration sitting. Every subsequent review in the ten-review program. |
| **Current status** | ✅ **RULED 2026-07-29 → Option A.** Recorded in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q1 (see *RULED* subsection there — that is the authoritative text, including three binding exclusions). Consequence: House Pass 2 does **not** open; calibrate on Now What? against the pinned instrument first. ⚠️ Selection ≠ ratification (see D8). |
| **References** | `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q1 ⚠️ **untracked** · `docs/reviews/ECOSYSTEM_EXPERIENTIAL_REVIEW_CHARTER_2026-07-29.md` ⚠️ **untracked** · `docs/specs/developmental-environment/FIELD_STUDY_METHOD_CANDIDATE_2026-07-29.md` (tracked, merged `ea39fe3b0`) |

⚠️ **Precondition on record:** before D1 is opened, two artifacts known to exist
but not yet read in this queue's context must be read first — the #810
calibration ruling and the ratified *representation bound to referent* principle.
Relevance is an observation until the queue deliberately adopts it.

⚠️ **A merge is not a selection.** PR #810 merged 2026-07-29 12:53Z as
*candidate-method tooling*, classified `class-c`. That establishes durability and
trunk authority for the artifact. It does not select the instrument, and must not
be read as having done so.

### D2 — Preservation as durable repository artifact

| Field | Value |
|---|---|
| **Decision ID** | D2 |
| **Question** | Which of the currently untracked governance artifacts are committed, and under what classification? |
| **Question (2)** | *(distinct sub-question, do not collapse)* Does "preserve as evidence" authorize a commit? |
| **Context** | Kelly's process ruling step 1 is "preserve both candidate instruments unchanged." That is satisfied *as evidence*. It is not satisfied *as durability* — "preserve" does not implicitly authorize a commit. Verified 2026-07-29: of eight artifacts governing the open decisions, **seven are untracked and absent from trunk**, including `docs/canon/THE_HOUSE.md` (the House's own canon, 0 commits on any ref) and `HOUSE_00_FOUNDER_QUEUE.md` (the file holding D1, D3 and D4). Only the field-study method is durable. |
| **Option A** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q2. |
| **Option B** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q2. |
| **What this unblocks** | Step 1 of the process ruling. Removes the recursion in which the queue recording the decisions is itself at risk of loss. Any citation of these artifacts from a tracked document. |
| **Current status** | Awaiting ruling. Currently blocks step 1 of the process ruling. |
| **References** | `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q2 ⚠️ **untracked** (including its own "preservation is not durability" refinement) |

⭐ **Founder observation added 2026-07-29 — context only, NOT a third option.** Kelly, at
the close of the Candidate C sitting: *"Selection is reversible. Loss is not."* D1's risk
is **candidate → operative by momentum**; D2's risk is **preserved → accidentally lost**.
They are independent failure modes and **neither resolves the other**, so the durability
problem is real even while D1 remains open.

> *"Not every preservation method requires constitutional commitment. A durable archive, an
> immutable snapshot, or another preservation mechanism can exist without declaring the
> contents canonical."*

⛔ **This does not answer D2, by explicit founder instruction** (*"and I wouldn't let it"*).
It is recorded because it names a separation the docket had not stated: **durability and
governance status are independent properties.** Whether to act on that separation — and
whether any non-commit preservation mechanism is admissible here — remains the ruling.
Options A and B in `HOUSE_00_FOUNDER_QUEUE.md` §Q2 are unamended.

### D3 — Disposition of #801 / #803 / #804 after the premise correction

| Field | Value |
|---|---|
| **Decision ID** | D3 |
| **Question** | What happens to the navigation-audit PRs whose premise was falsified? |
| **Context** | The "no branch protection" finding was a wrong-repo 404 — the repository is `SoullabTech/Sovereign`, and trunk **is** protected (`["build","check-diagrams"]`, strict, `enforce_admins:false`). Issue #807 rests on the falsified premise; part of #803 inherits it. #801 preserves the audit with a supersession note; #804 classifies route surfaces. A falsified premise is not the same as a worthless audit, and the three PRs are affected unequally. |
| **Option A** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q3. |
| **Option B** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q3. |
| **What this unblocks** | Three open PRs, all currently `MERGEABLE` (verified 2026-07-29). The precedent for how a falsified-premise audit is retired without discarding its valid parts. |
| **Current status** | Awaiting ruling. |
| **References** | `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q3 ⚠️ **untracked** · PRs #801, #803, #804 · Issue #807 |

### D4 — The sitting vs. the lane (charter §9)

| Field | Value |
|---|---|
| **Decision ID** | D4 |
| **Question** | Is the unit of review work a sitting or a lane, and how does that relate to the ten-review program? |
| **Context** | R-C3 rules that a review is *a sitting, not a lane*. That leaves an unresolved tension with the charter's ten-review cross-product synthesis, which is lane-shaped. One formulation has been proposed but not ruled: *the sitting is the unit of work; the program is the ledger.* Proposed is not ruled. |
| **Option A** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q4. |
| **Option B** | Stated at full strength in `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q4. |
| **What this unblocks** | How review findings accumulate across ten reviews. Whether the AIN Design Grammar synthesis has a defined substrate. |
| **Current status** | Awaiting ruling. |
| **References** | `docs/reviews/HOUSE_00_FOUNDER_QUEUE.md` §Q4 ⚠️ **untracked** |

### D5 — Theme scope

| Field | Value |
|---|---|
| **Decision ID** | D5 |
| **Question** | ⚠️ **SUPERSEDED 2026-07-29 — see "Ruling on the instrument" below.** Previously stated as three sub-questions constituting one ruling. That cut was returned for correction. |
| **Context** | Three separate audits (landing archaeology Q4, interior R1 warm-plum, interior R2 `community/*` purple) converged on the same underlying constitutional question from different observational domains. They are one ruling with three evidence sources, not three rulings. ⚠️ **They must not collapse into "is purple allowed?"** — that phrasing loses all three distinctions. Warm-plum is specifically *not* reported as a violation: commit `0dbc48e46` ("arrival re-tone — warm-plum glass") is recent and deliberate, so intent is not in question; scope is. |
| **Sub-question 1** | ⚠️ **SUPERSEDED — false binary.** *"Does the sanctuary palette govern the public landing, or only the authenticated interior?"* Omits a third jurisdictional category the governing material itself distinguishes: **arrival / threshold surfaces** (R1). Ruling this binary would force a three-part architecture into a two-part frame. |
| **Sub-question 2** | Carried forward into corrected part 2. *"Wherever the theme applies, is decorative accent prohibited — or only accent that carries meaning?"* |
| **Sub-question 3** | Split. Definition carried into corrected part 3; classification of the specific aura **deferred** — see below. |
| **What this unblocks** | Auth-surface theme migration (#667 · #668 · #669). The interior/landing jurisdiction boundary. Track D of the visual language program (which may never precede Track B). Whether future auditors must reconstruct intent from commit history. |
| **Current status** | ⛔ **NOT RULED — returned for correction of the decision instrument (2026-07-29).** Still the designated starting point for founder review; that ordering remains ruled. Founder judgment on the substance must not be exercised until the recut below replaces the superseded cut. |
| **References** | `docs/architecture/AIN_VISUAL_LANGUAGE_CANDIDATE_2026-07-29.md` ⚠️ **untracked** · `docs/field-studies/soullab-landing/2026-07-29/DISPOSITION_2026-07-29.md` ⚠️ **untracked, and the sitting is ruled PROVISIONAL / not calibration-admissible** · PRs #667, #668, #669 |

⚠️ The ruling, when made, must be explicit enough that a later auditor need not
reconstruct intent from commit history. That requirement was stated when the
ruling was requested and is part of the decision, not a preference about it.

#### ⛔ Pre-ruling gate — validate the cut before judging within it

**D5 is the only item in this docket whose decision unit was composed rather than
referenced.** D1–D4 point at options authored elsewhere. D5's three sub-questions
were synthesized by Claude from three separate audits that had never been stated
as one decision. That composition is an act with an author, and it is the one
point where this instrument could shape the decision space rather than expose it.

Founder-stated gate (Kelly, 2026-07-29). **This is procedure, not an option, and
it does not amend the sub-questions.** Order:

1. Identify the evidence from the three audits.
2. Test whether the three-part cut is exhaustive and non-collapsing.
3. Repair the description if an Unnamed dimension appears.
4. **Only then** exercise founder judgment.

The gate question is *not* which position to take on jurisdiction, decorative
accent, or aura function. It is: **do these three sub-questions fully and
correctly partition the constitutional issue?** Three outcomes:

| Outcome | Meaning | Response |
|---|---|---|
| **Cut holds** | The three are independent and sufficient | Founder judgment may proceed |
| **Cut over-separates** | Two are actually one dependency | **Unnamed** — recompose, then rule |
| **Cut under-specifies** | An independent dimension is missing | **Unnamed** — add it, then rule |

⚠️ The latter two are **not rulings.** They are Unnamed findings requiring
correction of the instrument before judgment.

⭐ **Concentration risk, named:** because nearly all of this docket points
elsewhere, the sole compositional exception can appear innocuous. The risk is not
that the proposed cut is necessarily wrong — it is that **its authorship could
disappear behind the apparent neutrality of the instrument.** Ruling inside an
unvalidated cut would bind the founder to Claude's framing.

#### ⛔ Gate outcome — CUT UNDER-SPECIFIES (Kelly, 2026-07-29)

The gate ran. **Outcome 3: cut under-specifies.** An independent dimension is missing.
Per the table above this is **not a ruling** — it is an **Unnamed** finding requiring
correction of the instrument before judgment. **D5 is returned, not decided.**

**The Unnamed gap.** Sub-question 1 presents a false binary — *public landing or
authenticated interior*. R1 already reveals a third jurisdictional category: **arrival /
threshold surfaces**. Those cannot safely be treated as either. The governing material
itself distinguishes them. Ruling the binary would force a three-part architecture into a
two-part frame.

**Corrected decomposition — D5 is recut as four parts.** Parts 1–3 establish the
constitutional rule; part 4 applies it to concrete surfaces.

| Part | Content |
|---|---|
| **1. Jurisdiction** | What governs the **public landing**? What governs **arrival / threshold surfaces**? What governs the **authenticated interior**? |
| **2. Accent semantics** | Wherever a palette governs, is *decorative* accent prohibited — or is prohibition limited to accent carrying **semantic meaning**? |
| **3. Motion semantics** | What distinguishes **meaning-bearing** from **atmospheric** motion? Does either category fall outside the admissible visual language? |
| **4. Application to observed surfaces** | Warm plum on arrival/threshold · wholesale `purple-500` on `community/*` · the specific animated aura. |

**Disposition of R1–R4** — the primitives decomposition also does not map cleanly onto D5:

| | Disposition |
|---|---|
| **R1**, **R2** | **Applications** of the theme-scope ruling → corrected part 4 |
| **R3** (Track A sequencing) | ⛔ **Not theme scope.** Removed from D5 — program sequence |
| **R4** (ratify §2 set + §1 gate) | ⛔ **Not theme scope.** Removed from D5 — ratification |

Keeping R3/R4 inside D5 would combine constitutional content, program sequence, and
ratification into one ruling. They need their own docket placement.

**Part 3 — split ruling, recorded now.** The constitutional distinction **may be ruled
definitionally**, and is:

> **Meaning-bearing motion** communicates state, status, invitation, relationship,
> transition, or another interpretation a viewer is expected to make.
> **Atmospheric motion** establishes mood or felt environment without carrying such an
> inference.

The specific question — *what is this aura doing?* — **cannot** be answered from the record.
Its available observation comes from a sitting ruled **PROVISIONAL / not
calibration-admissible**. Therefore:

- the definition remains in the corrected decision;
- classification of the specific aura is **deferred** until admissible observation exists;
- ⚠️ **no conclusion about that aura may be inferred from this deferral.**

**Required next act:** amend this docket entry so the recut above *is* the decision unit,
then exercise founder judgment inside it. The failure was not that the proposed questions
were wrong — it is that the jurisdictional cut omitted threshold/arrival surfaces while the
alternate R1–R4 cut included matters outside theme scope.

### D6 — Sanctuary awareness of the recording surfaces

| Field | Value |
|---|---|
| **Decision ID** | D6 |
| **Question** | What does Sanctuary awareness *mean* for each recording surface — before any surface is made Sanctuary-aware? |
| **Context** | Four of five recording surfaces (`MaiaCapture`, `QuickJournalSheet`, `NowWhatRoom`, `VisionStudioRoom`) are Sanctuary-blind; only `OracleConversation` is Sanctuary-aware. A member in Sanctuary can record via the other four. Where that audio and its transcripts travel is **UNVERIFIED**. This is a constitutional-risk finding, **not a demonstrated breach** — the distinction is load-bearing and must survive into the ruling. Sanctuary Invariant 6 is an absolute boundary, so the semantics must be settled per surface before implementation; a generic "make it Sanctuary-aware" repair would encode an unruled meaning. |
| **Option A** | Not stated — no option has been authored at full strength yet. Authoring them is itself work that requires a scope this docket does not grant. |
| **Option B** | — |
| **What this unblocks** | Whether a repair lane may open at all. The relationship between Sanctuary and every non-Oracle capture surface. |
| **Current status** | **Reported, not fixed.** Awaiting a ruling on scope before options can be authored. ⛔ Do **not** make surfaces Sanctuary-aware ahead of this. |
| **References** | PR #811 (disclosure lane — file-adjacent, deliberately does *not* address this) · `CLAUDE.md` → Sanctuary Mode invariants · visual-language lane record |

### D7 — Where relational presence becomes simulated embodiment

| Field | Value |
|---|---|
| **Decision ID** | D7 |
| **Question** | Where is the boundary between relational presence and simulated embodiment? |
| **Context** | The question was sharpened, not answered, by the landing archaeology. It is no longer "may MAIA be person-like?" — canon itself writes "positioning *herself*" (`MAIA_CANON_v1.1` §10), so the pronoun is not drift. The remaining question is a constitutional boundary, not a style preference. A candidate rule exists from the interior lane: presence · light · field · voice · relationship available; embodied depiction held. Candidate is not ruled. |
| **Option A** | Candidate rule as stated above, adopted as the boundary. |
| **Option B** | Not stated at full strength — no competing formulation has been authored. |
| **What this unblocks** | Track B visual semantics. Whether illustration of members, books and journeys may proceed independently of the MAIA-depiction question. |
| **Current status** | Awaiting ruling. Candidate exists; alternatives unauthored. |
| **References** | `docs/architecture/AIN_SEMANTIC_PRIMITIVES_v0.1.md` ⚠️ **untracked** · `MAIA_CANON_v1.1` §10 (tracked) |

### D8 — Ratification path for the field-study method

| Field | Value |
|---|---|
| **Decision ID** | D8 |
| **Question** | What evidence would constitute ratification of the field-study method — and who declares it? |
| **Context** | The method's own text says ratification is earned by repeated use across fields, not by the document. The calibration sequence is ruled: commit tooling → one complete study on Now What? → notice where the method breaks down → revise → second field → "only after two or three applications consider ratification." *Consider* is not a criterion. Without a stated criterion, the method could become canonical by accumulated use rather than by an explicit act — the same accidental-canonization risk the D1 process ruling exists to prevent. |
| **Option A** | Not stated at full strength. This decision is the *criterion* for a later decision, and may reasonably be deferred until calibration supplies evidence about what the criterion should be. |
| **Option B** | — |
| **What this unblocks** | Nothing immediately. It forecloses a drift: ratification-by-use. |
| **Current status** | Awaiting ruling — **deferrable without blocking anything.** Recorded so it is not lost. |
| **References** | `docs/specs/developmental-environment/FIELD_STUDY_METHOD_CANDIDATE_2026-07-29.md` (tracked, `ea39fe3b0`) |

---

## §2 — Stabilization queue

Execution, once judgment exists. **133 open pull requests** verified
2026-07-29 via `gh pr list --state open`.

State below is **command-verified** for the listed rows only. Every other open PR
is **untriaged — state not established.** That is a gap in this docket, not a
statement that the remainder are fine.

| PR | Current state | Blocking condition | Requires founder ruling? |
|---|---|---|---|
| #811 | Open · `MERGEABLE` · no review decision | Acceptance held pending Kelly's device walk. Implemented and structurally verified; live capture + assistive-technology behavior unverified. The 10-item walk lives on the PR as a comment and that is its single authoritative location. | **No** — needs a walk, not a ruling |
| #801 | Open · `MERGEABLE` | D3 | **Yes** |
| #803 | Open · `MERGEABLE` | D3 (part of it inherits the falsified premise) | **Yes** |
| #804 | Open · `MERGEABLE` | D3 | **Yes** |
| #667 | Open · **`CONFLICTING`** | D5, plus conflict resolution | **Yes** |
| #668 | Open · `MERGEABLE` | D5 | **Yes** |
| #669 | Open · **`CONFLICTING`** | D5, plus conflict resolution | **Yes** |
| #798 | Open · `MERGEABLE` | Merge ratifies the capability access *design*, not a build. Needs that boundary affirmed. | **Yes** |
| #791 | Open · `MERGEABLE` | Operator-surface guard; security lane | Unverified |
| #753 | Open · `MERGEABLE` | Explicitly marked do-not-merge; Phase 0 voice seam | **Yes** |

⚠️ **Two rows corrected against records that were stale.** #794 is *Commitments
schema/link contract* and is **MERGED**; the capability access model proposal is
**#798**. #764, #760, #777, #779 and #769 are all **MERGED** and were recorded as
open. Verify PR state before citing it.

⚠️ **The remaining ~123 open PRs need a triage sitting, which is not this docket
and not a founder decision.** Triage establishes state; it does not make
judgments. It should not be folded into §1.

---

## §3 — Deliberately not in this docket

These are **parked pending evidence**, not pending judgment. Adding them here
would misrepresent what they are waiting for, and would put pressure on Kelly to
rule on questions that no ruling can currently answer.

- **Journal Journey Point** — parked Category 1. The open question (*who may
  author meaning*) cannot be ruled before member-marked evidence exists; with
  zero marks the surface renders empty.
- **Whether the "independent governance artifacts emerged before a governance
  relationship between them" recurrence is structural** — explicitly tagged
  Hypothesis. A Constitutional Candidate tagged *Hypothesis* may not enter the
  canon process.
- **Immutable observational substrate for environment studies** — the
  calibration's own research question. Candidate substrates stay open until
  calibration supplies evidence. Do not nominate screenshots by analogy.
- **Everything under freeze** in `CLAUDE.md` (Coherence/Field wire-up, Morphic /
  Somatic / Achievements, Pattern Attunement, cross-layer synthesis). Lifting a
  freeze is a founder directive, but no freeze is currently *awaiting* one.

---

## Method notes on this docket

**Single authoritative location.** Where a decision is already stated at full
strength elsewhere (D1–D4, in `HOUSE_00_FOUNDER_QUEUE.md`), this docket points at
it rather than restating it. Restating would create a second location for the
same decision and reintroduce exactly the drift these queues exist to prevent.
Where no authoritative statement exists (D5), the sub-questions are stated here.
Where no options have been authored at full strength (D6, D7, D8), that is said
plainly rather than filled in with a plausible pair.

**Consequence to accept:** D1–D4 cannot be read without an untracked file. That
is not a defect of this docket — it is D2, visible.

**No hidden defaults.** Six items have no recommendation because none was
authored. Two orderings are marked ruled (D1 gating, D5 designated starting
point); the surrounding sequence is arbitrary and carries no priority claim.

**Status vocabulary.** *Awaiting ruling* · *Ruled* · *Deferred* · *Parked
pending evidence*. Distinct — a deferred decision has been considered and set
down; a parked one cannot yet be considered.
