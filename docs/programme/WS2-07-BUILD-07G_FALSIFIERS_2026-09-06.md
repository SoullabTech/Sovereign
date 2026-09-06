# WS2-07 · BUILD-07G — LONG-WORK SCOPED DEVELOPMENTAL READING · Falsifiers

> **Falsifier design only. Nothing here is implemented.** This document derives the falsifiers a
> BUILD-07G implementation would be witnessed against, from the ratified Acceptance Instrument v1
> (thirteen points) and rulings A1–A7. It authorizes **no schema, no migration, no table, no route,
> no orchestration code, no client, no TypeScript file, and no BUILD-07H**. Whether BUILD-07G
> implementation opens is a separate founder act, taken on this exact document.

```text
LANE               JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
UNIT               BUILD-07G  LONG-WORK SCOPED DEVELOPMENTAL READING
STATE              OPEN · ACCEPTANCE INSTRUMENT RATIFIED · FALSIFIERS FILED · IMPLEMENTATION UNAUTHORIZED
RATIFIED           founder, 2026-09-06 — Acceptance Instrument v1 (thirteen points as amended
                   through 116df717) + rulings A1–A7. Authority begins at the act; no claim of
                   verbatim historical transcript.
GOVERNED BY        WS2-07-BUILD-07G_LONG_WORK_DECIDE_2026-09-06.md §4 (P1–P13) · §5 · §6 · §7 (A1–A7)
PRECONDITION       WS2-DEVELOP-PREPARATION_TERMINAL_WITNESS_2026-09-06.md (50302f5d9 ·
                   ceiling_exceeded · 13 checks · 0 failures)
SUBSTRATE          07A evidence · 07B reader · 07C reading · 07D surface · 07E dialogue (canonical)
AUTHORIZES         nothing beyond this record
NEXT               founder ruling on whether BUILD-07G implementation opens, taken on this
                   falsifier set exactly
```

**The unit's constitutional job, in one sentence:** *MAIA may read a Work larger than one pass, in
member-chosen parts, against one frozen Work-state, and report where she looked and what recurred —
without ever implying she held the whole Work in mind at once.*

---

## 1 · Method legend

Each falsifier is stated so that an implementation either satisfies it or does not. Each records
exactly one of `PASS` · `FAIL` · `UNABLE TO EXERCISE`; **`UNABLE TO EXERCISE` is never promoted to
PASS.**

```text
G   module-graph / type-level test, static over source (with a named negative control)
U   pure unit test — no database, no network
W   witness script against a UTF-8 scratch database (the 07A/07C pattern)
X   exercised with the model seam REFUSING (sovereign mode) — no live model call required
```

⛔ **No falsifier below requires a live model to PASS.** The whole boundary is provable with the
seam returning `structured_inference_unavailable`. A live-model run is a separate, later act and may
never be used to "prove" a falsifier that fixtures show failing.

---

## 2 · Falsifiers F1–F26

| # | Falsifier | Derived from | Method |
|---|---|---|---|
| **F1** | *One frozen Work-state per run.* A run freezes exactly one `DevelopmentalReadState` at commission. Every scope's `read_state` is derived from it — same `revisionNumber`, same `revisionDigest`, same `sectionTopology`, same `structureFingerprint` when present. A run holding two distinct frozen states, by any path, fails. | P1 | U + W |
| **F2** | *No pass re-freezes.* The run-execution module graph cannot reach `freezeReadState` (or any freeze-current entry point) at all; only run **commission** may. Negative control: adding that import to the executor turns the gate red. | P1 · P8 | G |
| **F3** | *A pass derives, never re-reads current.* A scope executed after the Work has moved produces a reading whose `read_state` still carries the run's pinned digest — byte-identical to the run's frozen state, not the Work's current one. | P1 · P8 · A2 | W |
| **F4** | *Complete partition before inference.* For any resolved target, the union of planned scopes is exactly the target's ordered leaf-section set: no overlap, no gap, no reordering. A partition failing any of the three is refused at plan formation. | P3 | U |
| **F5** | *One over-ceiling section refuses plan formation.* A target containing a single section whose own code-point count exceeds `DEVELOPMENTAL_READ_CEILING_CODE_POINTS` refuses **before any seam call**, carrying the offending section identity and its measured code-point count. Asserted with a zero-invocation count on the seam. No partial plan is substituted. | P3 · §6 | U + X |
| **F6** | *Contiguous whole-section scopes.* No scope boundary falls inside a section. Measured in code points, as the ceiling is. A partition that cuts mid-section is unconstructible by type and refused at runtime. | P2 | U + G |
| **F7** | *No silent truncation.* There exists no path producing fewer sections read than planned without a `failed` scope recording it. Negative control: a forced mid-run abort leaves a named failure, never a quietly shortened plan. | P4 | U + W |
| **F8** | *`stale` is not a `scope_status`.* Type-level: the literal `'stale'` is not assignable to `scope_status`; the persisted enum/CHECK admits exactly `planned · reading · complete · failed`. | P5 | G (type) + W (schema) |
| **F9** | *Freshness is derived, never stored.* No persisted field on the run or its scopes names staleness, freshness, `is_stale`, or an equivalent. Asserted over the migration and over the row type. A run's freshness is computed against the Work at read time. | P5 · P6 · A2 | G + W |
| **F10** | *Staleness never rebases and never rewrites.* Moving the Work mid-run changes zero bytes of the run, its scopes, and its already-frozen readings; execution continues against the pin; no new commission is created automatically. Asserted by row-level before/after comparison. | P6 · A2 | W |
| **F11** | *A stale run is never presented as current.* Every presentation of a run carries its resolved freshness; a run whose pin no longer matches the Work cannot be rendered without it. A stale run remains readable as historical evidence. | P6 | U |
| **F12** | *Coverage is reported, never inferred.* Coverage is a computed value over the run's scopes, present on every presentation including incomplete runs. There is no path that presents a run without it. | P7 | U |
| **F13** | *Each pass produces an ordinary 07C reading.* `developmental_readings` gains no 07G column, and the existing insert-only trigger and observation validator remain byte-unchanged. A reading produced by a run is indistinguishable in shape from one produced by a single-lens 07D commission. | P8 · A1 | G + W |
| **F14** | *Orchestration metadata only — no new envelope.* No type, column, or JSON key named `structural_strength`, `developmental_tension`, or any other observation-bearing field is introduced anywhere in the unit. Asserted over the migration and the type surface. | P9 | G + W |
| **F15** | *Synthesis is observational.* The aggregation type carries none of: `confidence`, `rank`, `priority`, `severity`, `score`, `weight`, `importance`, `weakness`, `strength`, `recommendation`. A value carrying any of them is refused `foreign_field`. | P10 · §5 | G + U |
| **F16** | *Provenance survives aggregation.* Every synthesized statement resolves to the specific constituent observation ids that produced it and, through them, to 07A evidence refs. An aggregate carrying no constituents is unconstructible by type. | P11 | U + G (type) |
| **F17** | *The scope resolver is topology-blind.* The resolver's module graph reaches no vocabulary of kinds — no `chapter`, `part`, `act`, `movement` constant, list, map, or comparison anywhere in its transitive imports. It consumes identity, parent membership and order only. Negative control: introducing one kind comparison turns the gate red. | P12 | G |
| **F18** | *Authored or ratified — and only those.* A `structure_unit` whose `origin` is `proposed` and which has not been member-ratified is refused as a `scope_target`. `member` and ratified `imported` units are both admissible, and the record does not represent a ratified import as member-typed. | P12 · A4 | U + W |
| **F19** | *Member-commissioned only.* No scheduler, cron, queue, background worker, or post-save hook can create a run. Run creation is reachable only through a route that independently requires `getMemberIdFromRequest`. Negative control: a run created without a member identity is refused, not defaulted. | P13 | G + W |
| **F20** | *Separate orchestration substrate.* Run and scope rows live in their own tables; `developmental_readings` receives no lifecycle column, no status, no run id written into it as mutable state. Each completed scope references its reading, not the reverse. | A1 | G + W |
| **F21** | *The plan is unpersisted.* Plan formation — resolve, partition, cost — performs **zero writes**. Asserted by row-count equality across every table before and after a plan preview, including a preview that ends in the F5 refusal. Nothing named `plan` is persisted anywhere. | A1 · §6 | W |
| **F22** | *Coverage-complete is operational, not "run finished".* Whole-Work synthesis is available **iff** every planned scope is `complete` **and** each references an ordinary 07C reading **and** computed target coverage = 100%. A run in which every scope has reached a terminal state but one is `failed` is refused whole-Work synthesis while still presenting its completed subset. | A3 · §5 | U |
| **F23** | *Mechanical cuts are never authored structure.* No path writes a `manuscript_structure_units` row from a partition, and no presentation labels a mechanical pass boundary as a chapter, part, division, or proposal. A partition boundary and a structure unit are distinct types that do not convert. | A4 | G + U |
| **F24** | *Zero standing events.* The unit's module graph reaches no 07F standing store, and a full run leaves `standing_events` count unchanged. Beyond the temporary gate, the permanent form: a synthesized recurrence carries no observation identity and therefore cannot be a standing target. | A5 | G + W |
| **F25** | *Document order only.* Planning, execution and presentation proceed in pinned document order. No parallel, concurrent, or reordered execution path exists; scope ordinals are strictly increasing and match the resolved leaf order. | A6 | G + U |
| **F26** | *No doctrinal pass ceiling; the Work is never mutated.* No constant caps the number of passes per run, and no refusal string says a Work is too long. Any resource refusal that exists is named and typed. Separately: the unit writes to no manuscript table — not `manuscript_sections`, not `manuscript_draft_sections`, not `manuscript_working_drafts`, not `working_draft_revisions`. | A7 · P13 · 07A gate pattern | G + W |

---

## 3 · Outcomes — the seven a BUILD-07G witness must adjudicate

```text
O1  Pin integrity           One frozen Work-state per run; every pass derives from it; no
                            re-freeze reachable; a moved Work does not change what was read.
                                                                          F1 F2 F3 F10
O2  Plan discipline         Complete partition before inference; whole-section contiguity;
                            the over-ceiling section refuses plan formation with the seam
                            never called; the plan writes nothing.         F4 F5 F6 F21
O3  Honesty of coverage     No silent truncation; coverage reported on every presentation;
                            whole-Work synthesis gated on real completeness, not on the run
                            having stopped.                                F7 F12 F22
O4  Freshness discipline    Progress and freshness are separate axes; freshness is derived,
                            never stored; a stale run is valid history and never current.
                                                                          F8 F9 F11
O5  Observation integrity   Each pass yields an ordinary 07C reading; no new envelope; no
                            evaluative field; every aggregate walks back to its constituents.
                                                                          F13 F14 F15 F16
O6  Authorship boundary     The resolver knows no kinds; only authored or ratified structure is
                            targetable; mechanical cuts never become authored structure; runs
                            begin only on a member gesture.                F17 F18 F19 F23 F25
O7  Containment             Separate orchestration substrate; zero standing events; no manuscript
                            write; no doctrinal Work-size ceiling.         F20 F24 F26
```

---

## 4 · What a falsifier set cannot establish

⛔ **These falsifiers prove the boundary, not the reading.** Every one of F1–F26 can pass while MAIA
reads the book badly. Whether a long-work reading is *useful* is a Gate B question answered by a
founder-run live commission on a real Work, and it is not in scope here.

⛔ **Filing this set does not open implementation.** Step 4 of the DECIDE sequence is a separate
dated founder act, taken on this document. Until it exists there is no branch, no schema, no route.

⛔ **The 07F standing-event gate (F24) is presently doing double duty.** Until BUILD-07F closes it is
a temporary cross-unit gate protecting an unspent founder decision; after 07F closes, only its
permanent half survives — synthesis never becomes standing authority by laundering. A witness run
before 07F closes must report `standing_events` unchanged as a hard condition, not as an observation.
