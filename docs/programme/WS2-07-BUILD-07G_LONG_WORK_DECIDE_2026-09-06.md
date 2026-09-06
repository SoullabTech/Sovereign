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
§4 / A1–A7       RATIFIED 2026-09-06 (founder act) · Acceptance Instrument v1 · IN FORCE
NEXT             falsifier design ONLY — WS2-07-BUILD-07G_FALSIFIERS_2026-09-06.md
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
(`WS2-07F_PRODUCTION_PROMOTION_RUNBOOK_2026-09-06.md` §2.2), and `standing_events = 0` is what
preserves that unspent decision. This unit must not create standing events, must not depend on
07F's walk having run, and must not be used to close it by side effect.

**This is a TEMPORARY CROSS-UNIT GATE, not an eternal 07G invariant.** It retires when 07F
legitimately closes. What does NOT retire is the permanent rule (A5): **07G synthesis does not
become standing authority by laundering.** Standing may attach to constituent observations; a
synthesized recurrence is not a 07C observation and cannot become a standing target without a
separately authorized authority type.

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

## 4 · Acceptance boundary — thirteen points (AMENDED 2026-09-06)

> **RATIFIED — Acceptance Instrument v1 · IN FORCE from 2026-09-06.**
>
> Founder act, recorded verbatim:
>
> > *I ratify BUILD-07G Acceptance Instrument v1, consisting of the thirteen points in §4 as amended
> > through commit `116df717`, together with rulings A1–A7 as recorded there. Authority begins with
> > this ratification act; no claim is made that the reconstructed instrument is a verbatim
> > historical transcript. BUILD-07G may proceed to falsifier design only. Implementation remains
> > unauthorized until separately opened by founder act.*
>
> **PROVENANCE.** These thirteen were **reconstructed** from the founder's 2026-09-06 ruling as
> recorded in session, not transcribed from a prior canonical document — the ruling predates any
> canonical record of it. **AMENDED 2026-09-06** before ratification: points 1, 3, 5, 6, 8 and 12
> rewritten in place, the count held at thirteen; a further coherence pass followed (A2 wording, §9
> ontology, coverage-complete). Per the BUILD-07A precedent and the act's own words: **authority
> begins at the ratification act, and no claim is made that the reconstruction is a verbatim
> historical transcript.**

```text
 1  ONE FROZEN WORK-STATE PER RUN                                            [AMENDED]
    At commission, freeze ONE DevelopmentalReadState, once. Every pass derives its scoped
    evidence from that same frozen state.

    The pin therefore includes:
      draftId
      revisionNumber
      revisionDigest
      sectionTopology
      structureContext / structureFingerprint  (when structure exists)

    No pass re-freezes whatever happens to be current later. A later pass calling
    "freeze current" is the defect this point exists to make unconstructible.

 2  CONTIGUOUS WHOLE-SECTION SCOPES
    No pass begins or ends mid-section. Section boundaries are the only cut points.

 3  COMPLETE PARTITION OF THE TARGET                                         [AMENDED]
    The resolved target is completely partitionable BEFORE inference begins. Every leaf
    section belongs to exactly one planned pass. No overlap, no gap.

    If even one section alone exceeds the per-pass ceiling, PLAN FORMATION REFUSES before
    any model call. No partial plan is silently substituted for the refused one.

 4  NO SILENT TRUNCATION
    A scope that cannot be read is a NAMED FAILURE, never a shortened read. There is no path
    by which less was read than the plan says without the plan saying so.

 5  PROGRESS AND FRESHNESS ARE ORTHOGONAL                                    [AMENDED]
    scope_status ∈ planned | reading | complete | failed

    `stale` is NOT a scope_status.

    Run freshness is current | stale (or an equivalent derived relation) against the frozen
    Work-state. A complete scope can belong to a stale run. Progress and freshness are two
    independent axes and may never be collapsed into one enum.

 6  stale IS STRUCTURAL, NOT INVALIDATION                                    [AMENDED]
    The run is stale when the current Work no longer has the pinned revision identity and/or
    the frozen authoritative structure fingerprint.

    Staleness never rebases the run and never rewrites its readings. A stale run remains
    VALID EVIDENCE about its pinned historical Work-state; it may never be presented as
    current.

 7  COVERAGE IS REPORTED, NEVER INFERRED
    Completeness is a computed fact over the run and its scopes, surfaced to the member, not
    an impression left by a full-looking result.

 8  EACH PASS PRODUCES AN ORDINARY 07C READING                               [AMENDED]
    Its shape is unchanged, and its read_state is DERIVED FROM THE RUN'S ONE FROZEN
    DevelopmentalReadState. A pass does not independently freeze current state.

 9  ORCHESTRATION METADATA ONLY
    Synthesis adds run/scope metadata over existing observations. It introduces NO new
    observation envelope.

10  SYNTHESIS IS OBSERVATIONAL
    See §5. Recurrence, distribution, co-occurrence, continuity/discontinuity, section
    location, coverage completeness, provenance. Nothing evaluative.

11  EVIDENCE PROVENANCE SURVIVES AGGREGATION
    Every synthesized statement resolves to the specific observations that produced it and,
    through them, to 07A evidence refs. An aggregate that cannot be walked back to its
    constituents is not admissible.

12  THE SCOPE RESOLVER IS TOPOLOGY-BLIND                                     [AMENDED]
    Meaning belongs to structure AUTHORED OR RATIFIED by the member. The resolver consumes
    only frozen identity, membership and order. It does not know what chapter, part, act,
    movement, or any other kind means.

13  MEMBER-COMMISSIONED
    No automatic, background, or scheduled long-work reading. A run begins on a member
    gesture, as every reading in this lane does.
```

⛔ **Why point 12 says "authored or ratified".** Imported structure that a member confirms must
eventually carry the same authority as structure they typed, without the record pretending they
originally typed it. `manuscript_structure_units.origin` already distinguishes `member` from
`imported` from `proposed`; ratification changes authority, not provenance.

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
provenance           which reader, which classifier, which pinned Work-state, which pass
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
only the metadata needed to say which observations came from where, in what order, under what pin.

⛔ **Coverage gates aggregation (A3).** Constituent readings and exact coverage may be presented
while a run is incomplete. Aggregation may speak **only about the completed subset**. Whole-Work
synthesis is unavailable until coverage is complete. *"Four of twelve scopes"* can be useful; it may
never become *"the Work shows …"*.

**Coverage complete is defined operationally, not by the run having stopped:**

```text
WHOLE-WORK SYNTHESIS ELIGIBLE
  iff  every planned RunScope is scope_status = complete
  AND  every such scope references an ordinary 07C reading
  AND  computed target coverage = 100%

Any failed scope means Whole-Work coverage is INCOMPLETE,
even if the run itself has finished executing.
```

⛔ **`run finished` and `Work fully read` are different facts.** A run in which every scope has
reached a terminal state has finished; a run in which one scope is `failed` has not read the Work.
"All scopes terminal" must never be read as coverage complete.

The distinction in one line: **synthesis may say where MAIA looked and what recurred; it may not say
what it means that something recurred.** The latter is the author's, and 07E is where they can ask
MAIA about it under the anchored-ask discipline that already exists.

---

## 6 · Objects under design — PROPOSED, not decided

Shaped by the A1–A7 rulings in §7. **None of this is authorized to be built.**

```text
plan (unpersisted)   a PURE PREVIEW. Resolve + partition + cost, computed before commission and
                     shown to the member. It is not stored and has no identity. A computed
                     proposal must never be able to masquerade as an authored commission.

ReadingRun           the commissioned object, created by the member gesture. Freezes ONE
                     DevelopmentalReadState at commission (point 1). Insert-only identity;
                     freshness (current | stale) is derived against the Work, not stored as
                     progress.

RunScope             one intended pass, child of a run. Ordered leaf section ids (contiguous,
                     whole), a scope_status ∈ planned | reading | complete | failed, and — once
                     run — a reference to the ordinary immutable 07C reading it produced, or the
                     named failure that stopped it.

ScopeResolver        pure. scope_target → ordered leaf section ids, against the run's frozen
                     structure context. Topology-blind (point 12).

Partitioner          pure. ordered leaf sections + per-section code-point counts → ordered scopes
                     each under the ceiling, cutting only at section boundaries. REFUSES at plan
                     formation when a single section alone exceeds the ceiling.

RunView              read-only aggregation over the frozen readings a run produced. Orchestration
                     metadata only (§5), gated on coverage for whole-Work statements.
```

⛔ **The name changed for a reason.** Before commission there is a plan and it is a preview; after
the member acts there is a run and it is authored. Persisting something called a "plan" would let a
system-computed proposal acquire the standing of a member commission by outliving the screen it was
drawn on.

⛔ **The single-section-over-ceiling case is a planner refusal, not an edge case to paper over.** It
fires **before inference**, carries the offending section identity and its measured code-point
count, and offers no mid-section cut and no skip.

---

## 7 · Adjudications A1–A7 — founder rulings, 2026-09-06

> These were ruled in the same act that amended §4. **They take effect with the ratification act,
> not before** — the record states them; it does not yet claim they are in force.

```text
A1  SEPARATE ORCHESTRATION SUBSTRATE — YES
    Do NOT add orchestration lifecycle columns to the immutable developmental_readings table.
    Persist a commissioned ReadingRun and its child RunScopes; each completed scope references
    its ordinary immutable 07C reading.
    The persisted object is a RUN, not a "plan": before commission a plan is a pure preview;
    after the member acts it is a run. The rename is the safeguard, not cosmetics.

A2  CONTINUE AGAINST THE PIN — YES
    If the Work changes mid-run, the run's FRESHNESS RELATION RESOLVES TO STALE IMMEDIATELY, and
    execution continues only against the original frozen state.

      Work changes
      → freshness relation becomes stale   (derived; nothing is written)
      → NO ReadingRun rewrite
      → execution continues against the frozen Work-state

    Never rebase, never mix states, never automatically commission the new state. Readings already
    produced were lawful when produced and remain lawful historical readings of the pinned
    Work-state.
    ⛔ A persisted run carries NO mutable stale flag. Freshness is resolved against the Work, per
       point 5; writing it would collapse the two axes that point 5 separates.

A3  PARTIAL RUNS ARE PRESENTABLE — WITH A BOUNDARY
    Constituent readings and exact coverage may be shown while incomplete. Aggregation may speak
    only about the completed subset. Whole-Work synthesis is unavailable until coverage is
    complete. (Recorded in §5.)

A4  THE MEMBER CHOOSES THE SEMANTIC TARGET
    The member commissions whole_work, a structure_unit, or an explicit valid section range.
    The system may then create MECHANICAL pass boundaries solely to obey the 60,000-code-point
    ceiling. Those cuts are ORCHESTRATION — not authored structure, not proposed chapters, and
    never presented as either.
    ⛔ A system-PROPOSED SEMANTIC DIVISION is a different sovereignty threshold and is NOT
       authorized here.

A5  NO STANDING ON SYNTHESIS IN 07G
    While BUILD-07F remains unclosed, 07G creates ZERO standing events.
    Beyond that gate, the permanent rule: a synthesized recurrence is NOT a 07C observation and
    therefore cannot quietly become a standing target. Standing may attach to CONSTITUENT
    observations. Making aggregate synthesis itself standable would require a separately
    authorized authority type.

A6  DOCUMENT ORDER ONLY FOR v1
    Planning, execution and presentation proceed in pinned document order.
    ⛔ Do NOT introduce parallel or reordered execution as an optimization in the first build.
       Doing so would require first proving that no order-sensitive reader or synthesis behaviour
       changes.

A7  COST DISCLOSURE, NOT AN ARBITRARY WORK-SIZE CEILING
    Resolve and partition FIRST, before inference. Show the member the number of passes and
    whatever cost/time information is actually knowable; the subsequent Start/Read gesture IS the
    commission.
    ⛔ Do NOT invent a doctrinal maximum-pass count now. If infrastructure later requires a hard
       resource cap, it must be a NAMED, TYPED OPERATIONAL REFUSAL — never "your Work is too long".
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
✗  anything that creates standing events while BUILD-07F's walk is pending (temporary gate)
✗  standing attached to a synthesized recurrence, at any time (permanent — A5)
✗  a system-proposed SEMANTIC division of a Work (A4 — a separate sovereignty threshold)
✗  parallel or reordered pass execution in v1 (A6)
✗  a doctrinal maximum-pass count (A7 — a resource cap must be a named typed refusal)
✗  persisting anything named "plan" as though it were a commission (A1)
✗  a pass that freezes current state rather than deriving from the run's one pin (point 1)
```

---

## 9 · Growth-obligation answers

Per `CLAUDE.md` and `docs/canon/RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`. Answered, not
passed.

**What uncertainty does this introduce, and how is that uncertainty preserved?**
Reading a Work in parts introduces an uncertainty that single-pass reading does not have: *MAIA did
not hold the whole Work in mind at once, and a pattern spanning the seam between two passes may be
invisible to both.* This is preserved structurally rather than hedged in prose — the ReadingRun
records its scopes and their order, coverage is reported as a computed fact, and no synthesized
statement may claim more reach than the passes that produced it. A run says where it looked. It never
implies it looked everywhere.

**What provenance and ownership boundaries does this require?**
One frozen Work-state (`DevelopmentalReadState`) per run, so every observation in a run is about the
same Work-state. Every synthesized statement walks back to constituent observations and through them
to 07A evidence refs. The **ReadingRun** is MAIA's record of how she read — the pre-commission plan is
an unpersisted preview and holds no record authority; the semantic divisions are the member's,
**authored or ratified** in `manuscript_structure_units`; the Work is untouched throughout, as the
terminal witness demonstrates for the preparation act.

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
| Cultural sovereignty (Invariant 14) | The Work is its own reference. Semantic divisions are the member's structure units, **authored or ratified** by them, never inferred genre conventions. No chapter is judged against what a chapter ought to be. |

---

## 11 · Sequence from here

```text
0  founder AMENDED §4 (points 1/3/5/6/8/12) and RULED A1–A7      DONE 2026-09-06
1  consistency pass — A2 freshness wording · §9 ontology ·        DONE 2026-09-06
   coverage-complete defined operationally
2  founder RATIFICATION ACT — §4 = Acceptance Instrument v1,      DONE 2026-09-06
   A1–A7 in force; falsifier design authorized, nothing more
3  falsifiers filed against the ratified boundary                 ← current work
   docs/programme/WS2-07-BUILD-07G_FALSIFIERS_2026-09-06.md
4  BUILD opened by a dated founder act in the lane
5  Gate A structural · Gate B founder-run live
6  production acceptance bound to an exact GIT_COMMIT, as this chain has established
```

⛔ Steps 4 onward do not begin because step 3 is filed. Each opens by its own act.

⛔ **AUTHORITY STATE.** §4 Acceptance Instrument v1 and A1–A7 are **RATIFIED and IN FORCE** from
2026-09-06. The act authorizes **falsifier design only**. Implementation — schema, migration, route,
orchestration code, UI — remains unauthorized until separately opened by a founder act, and step 4
below is that act. BUILD-07H remains unauthorized; the topology programme remains PARKED except the
§3 crossing constraint; the 07F standing-event gate remains ACTIVE.

---

## 12 · Founder reframing, 2026-09-06 — INTERNALLY RESUMABLE, EXTERNALLY WHOLE

> **MAIA must be able to manage and developmentally read an ENTIRE manuscript.** The 60,000
> code-point rule is a **per-pass safety boundary, not a product ceiling.**

```text
AUTHOR ASKS      "Read my manuscript developmentally."
MAIA             pins one exact revision → plans as many bounded passes as required →
                 covers the whole manuscript → tracks what each pass read → composes →
                 returns ONE whole-manuscript developmental reading
AUTHOR SEES      one coherent reading of the Work
OPTIONALLY       drills into chapters / sections / evidence / individual passes
```

⛔ **The author must not be made to choose between "one reading" and "a sequence they walk."** That
is an implementation detail; pushing it onto the author is the architecture declining to do its job.

### 12.1 08B is NOT a prerequisite — correction to an earlier reading

```text
no chapters yet   → 07G packs CONTIGUOUS SECTION RANGES → the whole manuscript is still readable
chapters exist    → 07G PREFERS those authored boundaries → better organization and drill-down

08B improves the MAP.
07G provides manuscript-scale COGNITION.
Neither masquerades as the other.
```

Boundary preference, in order: **authored structure units where available → otherwise contiguous
section ranges → never require chapters merely to read the Work.**

### 12.2 Consistency with the ratified instrument — NO AMENDMENT REQUIRED, WITH ONE EXCEPTION

Most of this reframing was already ratified and needs no change:

```text
A4   member commissions whole_work | structure_unit | section_range; the system creates
     MECHANICAL pass boundaries solely to obey the ceiling      → §12.1 is A4, restated
A7   resolve + partition + disclose cost, then the Start gesture IS the commission
                                                                → "the author asks once"
A3   whole-Work synthesis gated on complete coverage            → "every section accounted for"
P4   no silent truncation                                        → invariant 3
P11  provenance survives aggregation                             → invariant 5
P1   one frozen Work-state per run                               → invariant 1
A2   continue against the pin; freshness derived                 → supports resume
```

⚠️ **ONE GENUINELY NEW REQUIREMENT: RESUME.** *"Interrupted work can resume without rereading a
different revision"* (invariant 6) and idempotence are **not among the thirteen ratified points.**
A2 makes resume *possible* (execution continues against the pin) but never *required*. If resume is
to BIND, it is an amendment to Acceptance Instrument v1 and needs its own founder act. Recorded here
as a founder requirement, NOT silently absorbed into the ratified thirteen.

### 12.3 ⛔ Composition does not reopen §5

*"Composes the passes → returns ONE whole-manuscript developmental reading"* is orchestration plus
**observational** aggregation. The ratified §5 line is unchanged and still governs:

```text
ALLOWED      recurrence · distribution · co-occurrence · continuity · discontinuity ·
             location · coverage · provenance
NOT ALLOWED  "the book's main weakness" · confidence · rank · severity · score ·
             any judgement no constituent observation makes
```

"One coherent reading" means **one assembled, attributable record of what MAIA noticed across the
whole Work** — not a new interpretive layer that reads the assembly. A composition that says more
than its constituents is the failure §5 exists to prevent, and scale makes it more tempting, not
less.

### 12.4 The decisive acceptance witness — the founder's own Work

```text
Elemental Alchemy
  ~62,933 words · 386,470 code points · 262 sections · > 6× the one-pass ceiling

commission whole_work
→ planner produces multiple bounded passes
→ every one of the 262 sections covered
→ every pass ≤ 60,000 code points
→ all passes bound to ONE draft revision
→ no truncation
→ composition completes
→ ONE whole-manuscript reading appears
→ its evidence traces back into the book
```

⛔ Not a six-section fixture. The witness is the real book or it proves nothing about manuscripts.

### 12.5 Standing

```text
07G instrument            RATIFIED (§4 + A1–A7) — unchanged by this reframing
resume requirement        RECORDED, NOT RATIFIED — needs its own founder act to bind
08B                       NOT a prerequisite
implementation            STILL NOT AUTHORIZED
operational sequence      DEVELOP is outside tomorrow's cohort surface (#1244), so 07G can wait
                          operationally — but it is core to Writer's Studio being a manuscript
                          environment rather than a section editor
```
