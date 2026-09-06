# WS2-07 · BUILD-07G — LONG-WORK SCOPED DEVELOPMENTAL READING · DECIDE

> **Opened by founder act, 2026-09-06, inside the existing Stage 7 developmental-intelligence lane
> (`JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01`). Not a new Jarvis lane.**
>
> **This is a DECIDE document. It authorizes no implementation, no branch, no schema, no route, no
> prompt.** It states the problem, fixes the constraints the unit inherits, proposes the objects
> under design, and names what still requires founder adjudication before any build act.

```text
UNIT             BUILD-07G  WHOLE-WORK DEVELOPMENT  (lane registry: "Cross-division patterns,
                 manuscript-scale intelligence") — this unit's working name is
                 LONG-WORK SCOPED DEVELOPMENTAL READING
STATE            OPEN · DECIDE ONLY · no implementation authority
PRECONDITION     MET — docs/programme/WS2-DEVELOP-PREPARATION_TERMINAL_WITNESS_2026-09-06.md
                 (subject 50302f5d9 · ceiling_exceeded · 13 checks · 0 failures)
INHERITS         BUILD-07A evidence · 07B reader · 07C reading · 07D surface · 07E dialogue
                 (all CLOSED / ACCEPTED and canonical)
CROSSES IN       exactly one constraint from the PARKED topology programme (§3 below)
NOT AUTHORIZED   BUILD-07H · any unparking of WS2-DOCUMENT-TOPOLOGY-AND-INGEST-INTELLIGENCE-01
```

---

## 1 · The founding problem

> **How does MAIA developmentally read a Work whose total length exceeds the per-pass ceiling,
> without pretending one pass saw the whole Work, mixing revisions or topologies, or losing evidence
> provenance?**

The problem is now clean because the preparatory obstructions are gone. The witness that opens this
unit is not a bug report; it is the reader behaving correctly:

```text
book-print-kdp-final       381,077 code points
per-pass ceiling            60,000 code points
verdict                     ceiling_exceeded
```

⛔ **The ceiling is not raised.** `DEVELOPMENTAL_READ_CEILING_CODE_POINTS`
(`lib/manuscript/developmentalReader/contract.ts:129`) is a bound on **one pass**, not a maximum
acceptable Work size. Enforced in `validate.ts` **before** `runStructured`, so a refusal costs no
inference. Raising it would convert a structural problem into a quality problem and hide it.

⛔ **"Your book is too long for MAIA" is not an acceptable product boundary.** The obligation this
unit accepts is that a real manuscript is readable in the way manuscripts are actually read — in
authored parts, with the whole in view — not that the reader be made bigger.

---

## 2 · What is inherited and may not be renegotiated here

The five closed units are the substrate. This unit orchestrates them; it does not amend them.

```text
07A  DEVELOPMENTAL EVIDENCE   typed EvidenceRef · frozen readState · recoverEvidence (digest-verified)
                              vs locateCurrent (three-state, never fuzzy) · unforgeable BoundEvidence
07B  DEVELOPMENTAL READER     one bounded pass · validate BEFORE runStructured · typed refusals
07C  DEVELOPMENTAL READING    frozen, insert-only DevelopmentalReading · seven observation fields ·
                              INV-0 outcome discrimination · coverage · provenance
07D  DEVELOP SURFACE          member explicitly invokes; verbatim presentation; three states
07E  DEVELOPMENTAL DIALOGUE   anchored ask over frozen observations
07F  DEVELOPMENTAL DECISIONS  keep / dismiss / unresolved / investigate  (SOURCE MERGED · NOT CLOSED)
```

⛔ **BUILD-07F is NOT CLOSED.** Its acceptance walk is gated on a prospective founder act
(`WS2-07F_PRODUCTION_PROMOTION_RUNBOOK_2026-09-06.md` §2.2), and `standing_events = 0` is what keeps
that decision clean. This unit must not create standing events, must not depend on 07F's walk
having run, and must not be used to close it by side effect.

---

## 3 · The one crossing constraint

`WS2-DOCUMENT-TOPOLOGY-AND-INGEST-INTELLIGENCE-01` remains **PARKED**. Exactly one requirement
crosses into this unit, and it was recorded there before this unit opened:

```ts
scope_target =
  | { kind: 'structure_unit', unitId }
  | { kind: 'section_range', sectionIds[] }
  | { kind: 'whole_work' }
```

**The scope target must be structure-unit-capable from inception.** Retrofitting unit-addressing
onto a flat section-range design later would mean rebuilding the run object after members have
frozen runs against it.

⛔ Nothing else crosses. Work Models, `expectedKinds[]`, Import Models vs Starting Templates, ingest
hierarchy preservation beyond what WS2-08 BUILD-08A already landed — all stay outside this unit.

---

## 4 · Acceptance boundary — thirteen points

> **PROVENANCE NOTICE.** These thirteen are **reconstructed** from the founder's 2026-09-06 ruling as
> recorded in session, not transcribed from a prior canonical document — the ruling predates any
> canonical record of it. They are filed here as the unit's proposed Acceptance Instrument v1 and
> **require founder ratification before they carry authority.** This follows the BUILD-07A precedent:
> authority begins at the ruling, and no provenance is claimed for the reconstruction itself.

```text
 1  ONE PINNED REVISION PER RUN
    Every pass in a run reads the same (draft_id, revision_number). A run does not follow the Work
    forward while it executes.

 2  CONTIGUOUS WHOLE-SECTION SCOPES
    No pass begins or ends mid-section. Section boundaries are the only cut points.

 3  COMPLETE PARTITION OF THE TARGET
    Every leaf section in the resolved scope_target belongs to exactly one pass. No overlap, no gap.

 4  NO SILENT TRUNCATION
    A scope that cannot be read is a NAMED FAILURE, never a shortened read. There is no path by
    which less was read than the plan says without the plan saying so.

 5  EXPLICIT scope_status
    scope_status ∈ planned | reading | complete | failed | stale — per scope, never inferred from
    the presence or absence of a reading.

 6  stale IS STRUCTURAL
    A run whose pinned revision is no longer the Work's current revision is stale, and a stale run
    may never be presented as a current reading of the Work.

 7  COVERAGE IS REPORTED, NEVER INFERRED
    Completeness is a computed fact over the plan and its scopes, surfaced to the member, not an
    impression left by a full-looking result.

 8  EACH PASS PRODUCES AN ORDINARY 07C READING
    Unchanged shape. A long-work pass is not a special kind of reading; it is a reading with a
    scope that a plan chose rather than a member typing section ids.

 9  ORCHESTRATION METADATA ONLY
    Synthesis adds run/plan/scope metadata over existing observations. It introduces NO new
    observation envelope.

10  SYNTHESIS IS OBSERVATIONAL
    See §5. Recurrence, distribution, co-occurrence, continuity/discontinuity, section location,
    coverage completeness, provenance. Nothing evaluative.

11  EVIDENCE PROVENANCE SURVIVES AGGREGATION
    Every synthesized statement resolves to the specific observations that produced it and, through
    them, to 07A evidence refs. An aggregate that cannot be walked back to its constituents is not
    admissible.

12  THE SCOPE RESOLVER IS TOPOLOGY-BLIND
    Its entire contract is: "resolve this selected structure unit into its ordered leaf sections."
    It does not know what a chapter is, what a part is, or what any `kind` means. Meaning lives in
    manuscript_structure_units, authored by the member; the reader consumes order and identity only.

13  MEMBER-COMMISSIONED
    No automatic, background, or scheduled long-work reading. A run begins on a member gesture, as
    every reading in this lane does.
```

---

## 5 · Synthesis authority — the exact line

Whole-Work synthesis is the point at which this unit could quietly become a new evaluative MAIA
layer. It may not.

**ALLOWED — statements about the corpus of frozen observations:**

```text
recurrence           this phenomenon appears in observations at sections 4, 27, 61, 140
distribution         observations of this lens cluster in the first third and are absent after §90
co-occurrence        these two phenomena appear together in six scopes
continuity           this thread is observed in consecutive scopes 3 → 7
discontinuity        this thread is observed in scopes 3 and 9 and in none between
location             where, by section identity, each constituent observation sits
coverage             which scopes are complete, which failed, which were never planned
provenance           which reader, which classifier, which revision, which pass
```

**NOT ALLOWED — interpretation or evaluation absent from 07B:**

```text
✗  "this is the book's main weakness"
✗  "the strongest section is …"
✗  any confidence value
✗  any rank or ordering by importance
✗  any severity
✗  any score
✗  any judgement about the Work as a whole that no constituent observation makes
```

⛔ **Do not invent a new envelope.** `structural_strength`, `developmental_tension` and their
relatives are forbidden by name and by kind. The 07C observation is the atomic record; a run adds
only the metadata needed to say which observations came from where, in what order, under what
pinning.

The distinction in one line: **synthesis may say where MAIA looked and what recurred; it may not say
what it means that something recurred.** The latter is the author's, and 07E is where they can ask
MAIA about it under the anchored-ask discipline that already exists.

---

## 6 · Objects under design — PROPOSED, not decided

Sketched to make the adjudications in §7 concrete. **None of this is authorized to be built.**

```text
ReadingPlan          the run. Pins (manuscriptId, draftId, revisionNumber) once. Holds the
                     resolved scope_target and the ordered scopes it was partitioned into.
                     Insert-only, like a reading.

PlannedScope         one intended pass. Ordered leaf section ids (contiguous, whole), a
                     scope_status, and — once it has run — the identity of the 07C reading it
                     produced, or the named failure that stopped it.

ScopeResolver        pure. scope_target → ordered leaf section ids, against the pinned revision's
                     frozen structure context. Topology-blind (point 12).

Partitioner          pure. ordered leaf sections + per-section code-point counts → ordered scopes
                     each under the ceiling, cutting only at section boundaries. Refuses rather
                     than truncates when a single section alone exceeds the ceiling.

RunView              read-only aggregation over the frozen readings a plan produced. Orchestration
                     metadata only (§5).
```

⛔ **The single-section-over-ceiling case is a real refusal, not an edge case to paper over.** A
section longer than 60,000 code points cannot be read by a contiguous whole-section partition. That
must be a named, member-visible refusal — not a mid-section cut, and not a silent skip.

---

## 7 · Open adjudications — founder rulings required before BUILD

```text
A1  Does a ReadingPlan get its own table, or is it expressible as orchestration columns over
    developmental_readings? The 07C table is insert-only with a strict observation validator; a plan
    is a different object with a different lifecycle (scope_status moves). Recommendation: its own
    insert-only table plus a status-bearing scope child, because scope_status must be able to move
    from planned → reading → complete/failed and 07C rows may never be updated.

A2  When a run goes stale mid-execution (the member keeps a version while scopes remain planned),
    does the run STOP, or does it complete against its pinned revision and present as stale?
    Point 1 and point 6 admit both. Recommendation: complete against the pin, present as stale —
    stopping discards passes that were lawful when they ran.

A3  Is a partially complete run presentable at all, or only a complete one? Point 7 requires
    coverage be reported either way. Recommendation: presentable, clearly incomplete — a reading of
    four of twelve chapters is genuinely useful and its incompleteness is a fact, not a defect.

A4  Does the member choose the scope_target, or does the system propose a partition the member
    accepts? Constitutional weight: proposing a partition is the system deciding where a Work
    divides. Recommendation: member selects a structure_unit; the system partitions WITHIN it for
    ceiling reasons only, and says so.

A5  Where does 07F standing attach — to a constituent observation, or to a synthesized recurrence?
    07F is not closed; this may be deferred rather than answered.

A6  What is the ordering discipline of passes? Document order is the obvious answer and the only one
    that makes continuity/discontinuity statements meaningful. Confirm it is the only one.

A7  Does a run cost gate exist — a maximum number of passes per commission — and is it a refusal or
    a member confirmation? 381,077 / 60,000 ≈ 7 passes minimum for this Work.
```

---

## 8 · Explicitly NOT authorized by this document

```text
✗  any branch, schema, migration, route, prompt, or client change
✗  raising DEVELOPMENTAL_READ_CEILING_CODE_POINTS
✗  mid-section cutting under any circumstance
✗  a new observation envelope of any name
✗  evaluative synthesis, scores, ranks, severities, confidences
✗  automatic or background long-work reading
✗  BUILD-07H (an observation becoming prose) — a separate sovereignty threshold, still undesigned
✗  unparking any part of WS2-DOCUMENT-TOPOLOGY-AND-INGEST-INTELLIGENCE-01 beyond §3
✗  anything that creates standing events while BUILD-07F's walk is pending
```

---

## 9 · Growth-obligation answers

Per `CLAUDE.md` and `docs/canon/RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`. Answered, not
passed.

**What uncertainty does this introduce, and how is that uncertainty preserved?**
Reading a Work in parts introduces an uncertainty that single-pass reading does not have: *MAIA did
not hold the whole Work in mind at once, and a pattern spanning the seam between two passes may be
invisible to both.* This is preserved structurally rather than hedged in prose — the plan records
its scopes and their order, coverage is reported as a computed fact, and no synthesized statement may
claim more reach than the passes that produced it. A run says where it looked. It never implies it
looked everywhere.

**What provenance and ownership boundaries does this require?**
One pinned revision per run, so every observation in a run is about the same Work-state. Every
synthesized statement walks back to constituent observations and through them to 07A evidence refs.
The plan is MAIA's record of how she read; the divisions are the member's, authored in
`manuscript_structure_units`; the Work is untouched throughout, as the terminal witness demonstrates
for the preparation act.

**What new responsibility does this capability create?**
The responsibility not to let scale read as authority. A reading assembled from seven passes over a
whole book will *feel* more comprehensive than a reading of one chapter, and a member may credit it
accordingly. The defenses are the ones above: no evaluation, no ranking, explicit coverage, honest
staleness, and the refusal to say anything about the Work as a whole that no constituent observation
supports. A long-work reading that is trusted more than it has earned is more dangerous than one
that is ignored.

---

## 10 · Sovereignty invariant check

| Question | Answer |
|---|---|
| Does this increase user agency? | Yes — the author can commission a reading of a real manuscript at the scale they actually work at, and reject it in full. |
| Does this push life outward into the world? | Yes — toward a finished Work that leaves the system. |
| Does this reduce the system's psychological centrality over time? | Conditionally — only while synthesis stays observational. §5 is where this could invert, which is why the line is drawn by enumeration and not by judgement. |
| Cultural sovereignty (Invariant 14) | The Work is its own reference. Divisions are the member's authored structure units, never inferred genre conventions. No chapter is judged against what a chapter ought to be. |

---

## 11 · Sequence from here

```text
1  founder ratifies (or amends) the thirteen points in §4        ← next act
2  founder rules A1–A7 in §7
3  falsifiers filed against the ratified boundary
4  BUILD opened by a dated founder act in the lane
5  Gate A structural · Gate B founder-run live
6  production acceptance bound to an exact GIT_COMMIT, as this chain has established
```

⛔ Steps 3 onward do not begin because step 1 and 2 look settled. Each opens by its own act.
