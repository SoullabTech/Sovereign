# `AIN-CONTEXT-01` · ACT 2 — LONGITUDINAL CONTINUITY ARCHITECTURE

**Date:** 2026-09-15 · **Status:** SPECIFICATION AND ARCHITECTURE ONLY
**Authority:** founder act, 2026-09-15 (ACT 2 OPEN, no repair authority)
**Evidence base:** `docs/programme/AIN-CONTEXT-01_ACT1_CENSUS_2026-09-15.md`
**Invariants:** the founder's ACT 2 §§1–15, treated as constitutional and reproduced by reference.

```text
⛔ NO production source · schema · migration · prompt · retrieval ranking
⛔ NO summary mechanism · memory writer · embedding path · UI behaviour
⛔ CHANGED UNDER THIS ACT. Nothing below is authorization to build it.
```

The architectural question:

> **How may MAIA preserve relational, developmental and process continuity across
> arbitrarily long human relationships without reducing the member to summaries,
> profiles, prior interpretations, or static classifications?**

---

## 0. ⚠️ One ACT 1 correction, made in place

ACT 1 §5.1 stated that no server-side idle sweeper was found. **That was wrong.**
`scripts/sweep-stale-sessions.ts` exists, closes sessions idle past a threshold and
enqueues them for summary. It is not a compose service, not a `package.json` script, and
its documented cron target (`docs/ops/memory-pipeline.md:73-82`) is the **Mac Studio
host**, which `CLAUDE.md` names as not the production host. Whether it runs against
minisforum is `UNVERIFIED`.

⭐ The correction is worth making because it **changes the remedy**: the gap is not a
missing sweeper but an unscheduled one. ACT 1 is corrected in place, not rewritten.

---

## 1. ⭐⭐ The decisive ACT 2 finding

**The epistemic-standing substrate this act was convened to specify already exists in
this repository, is schema-complete, has member-facing read and annotation APIs, and
has no writer on any serving path.**

`lib/types/interpretive-ledger.ts` + `lib/consciousness/hypothesisBuffer.ts` +
`lib/consciousness/interpretiveLedger.ts`, with migrations
`20260311000001_accumulating_hypotheses.sql`, `20260311000002_interpretive_ledger.sql`,
`20260311000003_ledger_annotation_types.sql`.

It carries, already:

| ACT 2 requirement | Existing construct |
| --- | --- |
| §6 corrections alter standing | `CONTRADICTION_WEIGHTS.user_correction = 0.95` — *"user corrections carry the highest weight without overriding the evidence architecture"* |
| §6 correction ≠ deletion | `LedgerEntryStatus.revoked` — *"member cleared influence (**evidence remains**)"* |
| §6 supersedes | `LedgerEntryStatus.superseded` — *"the parent entry is marked superseded, **not deleted**"* |
| §6 refines | `parent_hypothesis_id` — *"interpretive lineage (**refinement, not replacement**)"* |
| §6 remains uncertain | `HypothesisStatus.accumulating` + `ConfidenceProfile` + `GateStatus` |
| §7 change is not identity | `DecaySchedule`, `re_emergent`, `held_lightly` |
| §13 process over profile | `TargetStore` separates `interpretive_ledger` from `relational_calibration` |
| §15 freedom | `FalsifiabilityAnchor`, `ContradictionEvent`, `cleared_by_member` |
| §11 co-authorship | `MemberAnnotation` — *"system holds its perception, member holds their relationship to that perception; neither overwrites the other"* |

**Reachability, established not assumed:**

```text
migrations                      PRESENT
read path  /api/members/ledger  LIVE
annotate   /api/members/ledger/annotate   LIVE
enqueueObservation              0 callers   → DORMANT
enqueueContradiction            0 callers   → DORMANT
observationExtractor            0 callers   → DORMANT
```

⭐⭐ **So MAIA can already be told by a member that an interpretation does not resonate,
and there is no interpretation in the ledger for them to annotate.** The member-facing
half of a co-authored epistemic system shipped without the half that produces its
content.

⛔ **This is evidence, not a plan.** Wiring it is precisely the move ACT 2 may not make,
and §14's recognition test is the reason: a ledger wired in before the working-set
architecture exists would increase *retention* of interpretations while leaving their
*standing* unconsulted at assembly — which is the ACT 1 danger amplified, not resolved.

---

## 2. Substrate map against the invariants

`LIVE` = demonstrated write → read → selection → prompt.
`UNREACHABLE` = a live reader's predicate excludes a live writer's rows.

| Invariant | Held by | Class | Verdict |
| --- | --- | --- | --- |
| §3 source sovereignty | `conversation_turns` append-only | LIVE | ⭐ **HELD** at storage |
| §4 temporal sovereignty | `maia_sessions.turn_count` computed | LIVE but **unused in prompt** | ⛔ **VIOLATED** (ACT 1 §11) |
| §5 selection not truncation | nine hard-coded constants | LIVE | ⛔ **VIOLATED** — recency is the sole law |
| §6 correction standing | interpretive ledger | **DORMANT** | ⛔ **VIOLATED** — `'correction'` valid in `memory_type`, written by nothing |
| §7 developmental continuity | `pattern_ledger` (`recurrence_count`, `first_seen_at`, `last_seen_at`) | LIVE | ⚠️ **PARTIAL** — see §6.3 |
| §8 spiral continuity | `member_spiral_state` (one row: element, phase, motion) | LIVE | ⛔ **ABSENT** — single current position, no spiral identity, no multiplicity |
| §9 elemental continuity | conductor hysteresis + Wu Xing snapshot | LIVE | ⚠️ **PARTIAL** — momentary, not situated in a process |
| §10 significance | `breakthrough_moments`, marked episodes, `significance` | LIVE | ⚠️ **PARTIAL** — protection does not survive the top-12 cut |
| §11 relational continuity | `relationship_essences` | **DORMANT as prompt input** | ⛔ **VIOLATED** |
| §12 summary subordination | remembrance is single-pass from turns | LIVE | ⭐ **HELD** (ACT 1 §6) |
| §13 process over profile | `TargetStore`, `pattern_ledger.scope` | mixed | ⚠️ **AT RISK** — `distilledSignal` is profile-shaped |
| §15 freedom | `FalsifiabilityAnchor`, contradiction events | **DORMANT** | ⛔ **NOT ENFORCED** anywhere live |

⭐ Two invariants are held, and both are held **by storage discipline rather than by any
mechanism**: the turns table does not delete, and the summarizer does not recurse. ⛔ Every
invariant that requires *selection* or *standing* is violated or unenforced.

---

## 3. The ten required classes of continuity

Derived from the founder's §2 enumeration. Each names a distinct question, a distinct
authority, and a distinct failure mode. ⛔ No class may be merged into another for
implementation convenience; collapsing any two is how the current system reached its
present state.

| # | Class | Question | Authority | Collapse hazard |
| --- | --- | --- | --- | --- |
| **C1** | **Evidentiary** | What was actually said? | member + MAIA verbatim | replaced by a derived signal |
| **C2** | **Interpretive** | What did MAIA infer? | MAIA, provisionally | presented as C1 |
| **C3** | **Corrective** | What was later corrected, and by whom? | member act | stored as another C2 |
| **C4** | **Significance** | What must not be lost? | member act, then MAIA | competed away by score |
| **C5** | **Commitment** | What is unresolved or promised? | joint | folded into C4 |
| **C6** | **Process / spiral** | What is alive and changing? | MAIA, provisionally | becomes identity (§7) |
| **C7** | **Elemental** | What quality is moving here? | MAIA, provisionally | becomes personality (§9) |
| **C8** | **Relational** | What has happened *between* us? | joint | reduced to a profile of the member (§11) |
| **C9** | **Temporal** | Where do we actually stand? | system fact | derived from selection size (§4) |
| **C10** | **Epistemic negative** | What does MAIA *not* know? | system fact | silently absent |

⭐⭐ **C10 is the class with no substrate whatsoever today, and it is the one that
converts every other failure from dangerous to honest.** A MAIA that cannot represent
*"there are 190 turns in this conversation that I am not holding"* will confabulate
rather than ask, because nothing in her context distinguishes absence from
non-existence. The `MAX_API_HISTORY` comment in ACT 1 §3 shows this was already
understood at the level of prompt instruction — *"when the gap is hit, she asks rather
than fabricates"* — while nothing computes the gap.

⛔ C10 must not be built as a confidence score. It is a **cardinality and coverage fact**
(how much exists, how much is present, over what span), which is knowable exactly.

---

## 4. Epistemic standing — the minimum required representation

### 4.1 The load-bearing decision

Standing is **a relation between assertions, not an attribute of an assertion.**

```text
⛔ FORBIDDEN     assertion { id, text, status: 'superseded' }
⭐ REQUIRED      relation  { subject, predicate, object, basis, author, at }
```

Reason, and it is not aesthetic: an attribute must be **mutated** when a correction
arrives, which means the earlier interpretation's own record is rewritten. §6 forbids
exactly that — *"a correction is a historical act, not deletion or rewriting of the
earlier turn."* A relation is **appended**; nothing prior is touched.

### 4.2 The six predicates

| Predicate | Meaning | Effect on the object's standing at assembly |
| --- | --- | --- |
| `supports` | new evidence consistent with it | may raise confidence |
| `contests` | evidence against; not decisive | must travel **with** it |
| `corrects` | the member states it is wrong | object may not return as accepted |
| `supersedes` | a later assertion replaces it | object is historical only |
| `refines` | narrows scope/conditions | object survives **in narrowed form** |
| `uncertain` | explicitly unresolved | object may surface **only as a question** |

⭐ `refines` is the invariant-critical one. Without it, every change is forced into
`supersedes`, and §7's requirement — *withdrawal appeared repeatedly, and recently that
pattern appears to be changing* — becomes unrepresentable, because "changing" would have
to be encoded as "the old pattern is dead."

### 4.3 Three laws

**L1 — Direction.** The relation is carried by the **successor**, pointing back. There is
no `superseded_by` column and there must never be one.

⭐ **This law is already ratified in this repository, in another lane, for the same
reason**: `database/migrations/20260914000001_proposal_succession.sql:131-141` —
*"There is no `superseded_by` column and there must never be one … `supersedes` owns
order"* — and `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`, which records
succession carried by the successor with `superseded_by` **derived, never stored**.

⛔ Per the S3 lane's Ruling 7: **reuse the law, not the object.** Do not clone
`proposal_versions`; do not widen its CHECK. The law travels; the table does not.

**L2 — Standing is computed at assembly, never stored as a verdict.** Storing a resolved
verdict creates a second fact that can fall out of step with the relations that produced
it. Resolution belongs to the working-set assembler (§5), which can then **explain** it.

**L3 — A correction never suppresses its target silently.** Where `corrects` or
`supersedes` applies and the object would otherwise be selected, the assembler must emit
**the pair with its relation** or **neither** — ⛔ never the object alone. This is the
direct structural answer to ACT 1 §10, whose finding was answer `A`.

⭐⭐ **L3 is the single most important sentence in this document.** It converts the
charter's `C` (both, with correct standing) from an aspiration into an assembly-time
obligation with a falsifier attached (§8, F3).

### 4.4 What this is not

⛔ Not a truth-maintenance system. ⛔ Not a way to decide what is true. MAIA's
interpretations remain provisional whatever their standing, and a member correction is
authoritative **about the member**, not about the world. §15 governs: the accumulated
understanding never outranks the living member.

---

## 5. Working-set assembly — conceptual architecture

Replaces `last N turns → cognition` with six ordered stages. ⛔ Conceptual only; no
module, signature, table or budget is specified or authorized.

```text
 ┌─ S1 · DEPTH RESOLUTION ────────────────────────────────────┐
 │ authoritative conversation depth + span, from the record   │
 │ ⛔ never derived from how much was selected                 │
 └────────────────────────────────────────────────────────────┘
                     │
 ┌─ S2 · CANDIDATE GATHERING ─────────────────────────────────┐
 │ every carrier contributes, each declaring its class C1–C10 │
 │ ⭐ the CURRENT session is a first-class source              │
 │ ⛔ no carrier may return unlabelled material                │
 └────────────────────────────────────────────────────────────┘
                     │
 ┌─ S3 · STANDING RESOLUTION ─────────────────────────────────┐
 │ apply the §4 relation graph over the candidate set         │
 │ ⭐ L3: pair-or-neither for corrects / supersedes            │
 └────────────────────────────────────────────────────────────┘
                     │
 ┌─ S4 · COMPOSITION UNDER A DECLARED BUDGET ─────────────────┐
 │ an explicit budget, not nine scattered constants           │
 │ protected classes reserved BEFORE competitive ranking      │
 └────────────────────────────────────────────────────────────┘
                     │
 ┌─ S5 · ABSENCE ACCOUNTING  (class C10) ─────────────────────┐
 │ what exists, what is present, what was dropped and why     │
 │ ⭐ this is what lets MAIA ask instead of confabulate        │
 └────────────────────────────────────────────────────────────┘
                     │
 ┌─ S6 · MANIFEST ────────────────────────────────────────────┐
 │ content-free record of the above, per turn                 │
 └────────────────────────────────────────────────────────────┘
```

### 5.1 Notes that carry constitutional weight

**S1 answers §4 directly.** `conversation age ≠ prompt selection size` becomes
structural: depth is an input to assembly, never an output of it.

**S2's hardest requirement is the current session.** ACT 1 §4 found every cross-session
carrier excludes it by SQL predicate. ⭐ The correct frame is that **"cross-session" was
never the right axis**: the axis is *inside the window / outside the window*, and the
current session has an outside-the-window region that no carrier addresses. ⛔ Fixing
this by deleting `session_id <> $2` would silently double-count the window; the
architecture needs the distinction, not the removal.

**S4 reserves before it ranks.** ACT 1 §10.6 showed a claim and its correction competing
on a 100-character hash. Protected classes (C3, C4, C5) must be seated before any
competitive stage runs, or §10's protection is nominal.

**S5 is not optional and is not a metric.** It is the only mechanism by which C10 reaches
cognition.

**S6 must be content-free** — identities, counts, classes and reasons, ⛔ never authored
text. The repository precedent is CMT-01's `[MAIA/manifest]`, which emits digests only.

### 5.2 ⭐ What assembly may never do

```text
⛔ present a derived representation where a source is available      (§3)
⛔ report depth from selection size                                  (§4)
⛔ rank on recency alone                                             (§5)
⛔ emit a corrected interpretation without its correction            (§6, L3)
⛔ convert a process observation into a claim about the person       (§7, §13)
⛔ let a summary be the sole authority for what happened             (§12)
⛔ present absence as non-existence                                  (C10)
```

---

## 6. Collisions, absences, and dangerous near-matches

### 6.1 Dangerous near-matches — ⭐ the category ACT 1 exists to have taught us

A near-match is worse than an absence: it invites a change that appears to satisfy an
invariant while leaving the defect intact.

| Near-match | Why it looks right | Why it is not |
| --- | --- | --- |
| `memory_type = 'correction'` | valid in the CHECK; one-line change | ⛔ typing the row changes nothing while retrieval is query-independent (ACT 1 §7) and nothing links it to its target. **A typed correction that cannot be retrieved beside what it corrects changes the label, not the danger.** |
| `developmental_memories.valid_to` | bitemporal shape already present | ⛔ no writer sets it (`CLAUDE.md` F1: no row has ever carried a past `valid_to`). Worse, time-based invalidation would **delete standing from view** rather than represent a correction — the §6 violation in another form. |
| `pattern_ledger.status = 'resolved'` | a pattern that changed could be marked resolved | ⛔ `resolved` asserts the process **ended**. §7 requires representing a pattern that *is changing*. Marking it resolved is precisely the ontological finality §7 forbids. |
| `relationship_essences` | already accumulates relational history | ⛔ it is a **profile of the member** (`soulSignature`, `presenceQuality`, `morphicResonance`) — §11 requires history of what happened *between*, and §13 privileges process over profile. |
| Wiring the interpretive ledger now | the substrate matches the invariants | ⛔ fails §14: without S3/S4 it increases retention of interpretations whose standing nothing consults. |
| Raising the 10-exchange window | obviously the reported defect | ⛔ ACT 1 §3 proved a widening already shipped with no path to effect; and §5 forbids `last N turns` as the law at **any** N. |

### 6.2 Collisions

1. ⭐ **`superseded` exists in two vocabularies with different laws.** The interpretive
   ledger stores `LedgerEntryStatus.superseded` **as a status on the parent** — which
   violates L1 (§4.3) — while `proposal_succession` ratifies the opposite. ⛔ Two live
   vocabularies, one word, incompatible directions. This must be reconciled *before*
   either is extended, or the reconciliation becomes a migration of live rows later.

2. **`significance` means at least three things**: the writeback score
   (`MemoryWriteback:451`), `pattern_ledger`'s three significance columns, and member
   marking. §10 requires distinguishing protected significance from computed salience;
   today one word spans both.

3. **Two summary destinations, one producer.** The worker writes to `maia_sessions`
   (LIVE, read via `MemberLiveContext`) and to `episodic_memories` (UNREACHABLE, ACT 1
   §5.3). Any working-set design must pick which is canonical.

### 6.3 Absences — nothing exists to carry these

| Absent | Invariant | Note |
| --- | --- | --- |
| **Spiral identity** | §8 | `member_spiral_state` holds *one current position*. A spiral is a durable process with its own identity, span and history. **Nothing can express "we have been here before, but not quite like this."** No multiplicity, no return, no threshold. ⭐ This is the largest single absence in the system. |
| **Relevance-driven retrieval into the current session** | §5 | ACT 1 §4 |
| **C10 absence accounting** | §2 | §3 above |
| **Relation substrate between assertions** | §6 | §4 above |
| **MAIA↔member event history** | §11 | rupture, repair, promises, shared names, agreed boundaries — no carrier |
| **Elemental expression situated in a process** | §9 | elements are momentary; nothing binds an element to a spiral **over time** |
| **Declared context budget** | §5 | ACT 1 §9 |

⭐ **The §8 spiral absence reframes the whole lane.** ACT 1 described a *selection*
failure. §8 shows that even perfect selection would not produce recognition, because the
object that would be recognized — the living process, with its returns and its
transformations — has no representation at all. **Retrieval improvements alone can never
produce "we have been here before, but not quite like this"; they can only produce "here
is a similar thing you said."** That distinction is the difference between recognition
and retention, which is §14.

---

## 7. Which existing substrates may legitimately carry which responsibility

| Class | Legitimate carrier | Standing |
| --- | --- | --- |
| C1 evidentiary | `conversation_turns` | ⭐ **Sound as-is.** Do not derive over it destructively |
| C2 interpretive | `interpretive_ledger` + `accumulating_hypotheses` | DORMANT — matches invariants |
| C3 corrective | ⛔ **none adequate** — needs the §4 relation; ledger contradiction events are the closest lawful base | contradiction weights LIVE in type space only |
| C4 significance | marked episodes (member) + `breakthrough_moments` (computed) | LIVE; must be **separated**, §6.2 |
| C5 commitment | `SessionRemembrance.openLoops`, `nextStep` | LIVE but summary-gated (ACT 1 §5.1) |
| C6 process/spiral | ⛔ **none** — `pattern_ledger` carries recurrence, not spiral | §6.3 |
| C7 elemental | conductor + Wu Xing | LIVE, momentary only |
| C8 relational | ⛔ **none** — `relationship_essences` is a profile, §6.1 | DORMANT anyway |
| C9 temporal | `maia_sessions.turn_count` | ⭐ **LIVE and correct — merely unread by the prompt.** The cheapest true repair in the system, and still not authorized here |
| C10 absence | ⛔ **none** | computable from C1 |

⭐ **Three classes have adequate substrate (C1, C4, C9), three have substrate that is
dormant or profile-shaped (C2, C5, C8), and four have none (C3, C6, C7-over-time, C10).**
⛔ No wiring of any of them is authorized.

---

## 8. Proposed subsequent bounded acts, with falsifiers

⛔ **Proposed, not opened.** Each requires its own founder act. Ordered so that no act
depends on a later one, and so that **nothing that increases retrieval power precedes the
standing architecture** — the ordering constraint the founder named when opening ACT 2.

| Act | Scope | Why here in the order |
| --- | --- | --- |
| **A3 · REPRODUCTION HARNESS** | The planted-object long-conversation harness from charter §5. Measurement only. | Establishes the baseline. ⛔ Must precede every repair, or no repair is falsifiable |
| **A4 · SUCCESSION LAW RECONCILIATION** | Paper act: reconcile the two `superseded` vocabularies (§6.2-1) under L1. ⛔ No migration | Both are live; extending either first makes this a data migration |
| **A5 · STANDING RELATION SPECIFICATION** | Schema-level design for the §4 relation. ⛔ No migration, no writer | Everything downstream consumes it |
| **A6 · TEMPORAL SOVEREIGNTY** | The narrowest real repair: authoritative depth + C10 absence accounting reach cognition | Smallest act that removes a live confabulation driver. ⭐ Deliberately **not** first — A3 must be able to measure it |
| **A7 · SPIRAL REPRESENTATION** | Design the C6 object: identity, span, states, returns, transformations, multiplicity | The largest absence; needs A5's standing to avoid becoming identity |
| **A8 · WORKING-SET ASSEMBLER** | The §5 architecture | Depends on A5 + A6 + A7 |

⛔ **Wiring the interpretive ledger is not on this list and must not be smuggled into
A5.** Its write path is a separate act, after A8, because §14 fails otherwise.

### 8.1 Falsifiers — each must be able to go RED against the system as it stands

Per the S3-lane discipline already ratified in this repository: a falsifier that passes
only because the mechanism does not exist proves nothing. Each therefore carries a
**defeat candidate** — a competent, plausible, wrong implementation that passes the rest
of the set and fails this one.

| # | Proposition | Defeat candidate it must kill |
| --- | --- | --- |
| **F1** | Depth reported to cognition equals authoritative depth at every N | Report `min(depth, window)` — "safer" and reintroduces §4 |
| **F2** | A planted fact at turn 12 is recoverable at turn 130 **in the same session** | Widen the window to 50 — passes at N=130, fails at N=400; the law, not the constant, is what F2 tests |
| **F3** | ⭐ A rejected interpretation never reaches cognition without its rejection | Rank corrections higher — makes both *likely*, never *joint*. **Only pair-or-neither (L3) survives** |
| **F4** | A refinement leaves the refined assertion alive in narrowed form | Model refinement as supersession — passes F3, destroys §7 |
| **F5** | Absence is reported as absence, never as non-existence | Emit a confidence score — a number is not a cardinality |
| **F6** | A member-protected item survives a turn in which 500 candidates compete | Raise its weight — probabilistic, so it fails at some N. Only reservation-before-ranking survives |
| **F7** | A returning pattern is representable as *changed*, not as repetition or regression | Increment `recurrence_count` — the current behaviour, and exactly §7's prohibition |
| **F8** | No derived representation is emitted where its source was available and selectable | Prefer summaries under budget pressure — the §12 failure, and the reason budgets must be declared |

⭐ **F3 and F7 are the two that cannot be satisfied by any amount of retrieval
improvement**, which is why they are the acceptance core of this lane. F3 is a
*co-selection* law; F7 is a *representation* law. Neither is a ranking problem.

---

## 9. The recognition test, applied to this act

> *Does this increase MAIA's capacity to recognize the member and their unfolding
> processes, or does it merely increase retention?*

ACT 2 proposes no mechanism, so it is tested on what it **forbids**. Of the seven obvious
next moves, this act rules out six as retention-only: raising the window, adding a
summarizer, wiring the ledger early, typing corrections, setting `valid_to`, and marking
changed patterns `resolved`. ⭐ The one it names as the smallest honest repair (A6,
temporal sovereignty + absence accounting) **adds no memory at all** — it tells MAIA
where she is and what she is missing.

⭐⭐ That asymmetry is the finding: **the most valuable next act in this architecture
increases recognition by increasing what MAIA knows she does not have.**

---

## 10. Standing

```text
ACT 2                          SPECIFICATION AND ARCHITECTURE ONLY · COMPLETE
ACT 1                          CORRECTED IN PLACE (§0) · otherwise intact
Evidence class                 STATIC / repository truth
Production or shadow DB read   NONE
Source · schema · migration    UNCHANGED
Prompt · ranking · summarizer  UNCHANGED
Memory writer · embedding path UNCHANGED
Interpretive ledger            DORMANT · ⛔ WIRING NOT AUTHORIZED
A3–A8                          PROPOSED · ⛔ NONE OPENED
F1–F8                          SPECIFIED · ⛔ NONE AUTHORED · ⛔ NONE RUN
Production                     UNTOUCHED
```
