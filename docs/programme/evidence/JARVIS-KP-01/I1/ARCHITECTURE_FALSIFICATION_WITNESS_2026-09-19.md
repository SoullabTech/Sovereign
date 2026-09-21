# JARVIS-KP-01 · I1 — ARCHITECTURE FALSIFICATION WITNESS

**Date:** 2026-09-19  
**Canonical base:** `17851fbdaeddd649e6a05c180c94ff3fdd335332`  
**Evidence class:** static architecture falsification  
**Runtime execution:** NONE  
**Production data:** NONE

## Disposition

> **IMPLEMENTATION ARCHITECTURE SUFFICIENT TO OPEN I2**

This witness tests whether I1 creates a plausible implementation path without violating ACT 10–12A or existing canonical storage/projection boundaries.

It does not establish that code, persistence, or runtime behavior is correct.

## Falsification cases

| ID | Attack | Expected lawful architecture | Result |
|---|---|---|---|
| I1-F01 | Store semantic joins in Relational Practice Ledger | Refuse ontology overload; keep practice stewardship separate | PASS |
| I1-F02 | Treat Wisdom Graph co-occurrence/topology as warrant | Graph may supply refs/signals only; relation still requires warrant | PASS |
| I1-F03 | Lift `member_memory_atoms.crossing_allowed` to enable joins | Remains FALSE; join ledger cannot bypass memory crossing canon | PASS |
| I1-F04 | Give Living Constellation connect/write authority | Remains read-only; later projection requires separate authorization | PASS |
| I1-F05 | Add mutable `current_standing` field that callers can write | Current standing must derive from append-only acts | PASS |
| I1-F06 | Use endpoint provenance as join provenance | Join creation and warrant provenance remain first-class | PASS |
| I1-F07 | Many sources automatically create composite warrant | Support set remains distinct from composite inference | PASS |
| I1-F08 | Whole-sentence member agreement promotes every component | Adoption acts identify exact semantic components | PASS |
| I1-F09 | Same human occupies member + practitioner roles, so jurisdiction collapses | Authority role is explicit per act/component | PASS |
| I1-F10 | Treat every cited source as relied upon | Reference and reliance remain separate typed relationships | PASS |
| I1-F11 | Refuse to retain an unwarranted but useful hypothesis | Candidate/unestablished standing remains representable | PASS |
| I1-F12 | Warranted join used downstream silently creates another edge | Every new relation requires its own join envelope/warrant | PASS |
| I1-F13 | Nested composite silently upgrades provisional support | Upstream standing/boundaries travel into downstream composite | PASS |
| I1-F14 | Missing metadata is reconstructed from model inference | Standing elevation fails closed; required authority fields are not guessed | PASS |
| I1-F15 | A discharged join deletes its endpoints or history | Relation history remains; endpoints retain independent standing | PASS |
| I1-F16 | A green evaluator automatically edits MAIA context/projection | Admission and representation remain separate authorized acts | PASS |

**16 / 16 PASS**

## ACT 11 invariant coverage

- INV-01 Endpoint independence — PASS
- INV-02 Join separability — PASS
- INV-03 Join authorship integrity — PASS
- INV-04 Join provenance integrity — PASS
- INV-05 No endpoint-to-edge authority transfer — PASS
- INV-06 Stage integrity — PASS
- INV-07 Standing ceiling — PASS
- INV-08 Jurisdiction integrity — PASS
- INV-09 Boundary integrity — PASS
- INV-10 Reference / reliance integrity — PASS
- INV-11 Human authority integrity — PASS
- INV-12 Corrigibility — PASS
- INV-13 Hypothesis viability — PASS
- INV-14 No hidden promotion — PASS

## ACT 11A invariant coverage

- A11A-INV-01 Composite separability — PASS
- A11A-INV-02 Composite authorship — PASS
- A11A-INV-03 Composite provenance — PASS
- A11A-INV-04 Composite standing ceiling — PASS
- A11A-INV-05 No prestige/count laundering — PASS
- A11A-INV-06 Triangulation viability — PASS
- A11A-INV-07 Adoption scope — PASS
- A11A-INV-08 Mixed-standing preservation — PASS
- A11A-INV-09 External-fact independence — PASS
- A11A-INV-10 Adoption provenance — PASS

## Existing-system boundary witness

I1 does not require modification of:

- Relational Practice Ledger;
- Wisdom Graph schema;
- Member Memory Atoms;
- Living Constellation projection;
- JARVIS CI epistemic ledger;
- current MAIA prompts or model routing.

The proposed package boundary can therefore be introduced incrementally in I2 without granting persistence or production authority.

## Remaining unknowns

The following remain deliberately unproven until later acts:

1. whether the pure TypeScript evaluator can encode all standing/warrant rules without contradictory states;
2. whether persistence can remain append-only and reconstructible under concurrency;
3. whether runtime proposal sources can produce sufficiently explicit semantic components without unsafe guessing;
4. whether shadow evaluation produces acceptable refusal/admission behavior on real production-shaped traffic;
5. whether production observability can remain structurally useful without leaking private content.

These are I2–I5 evidence questions, not reasons to expand I1.

## Standing

`SOURCE-SEAM CONFLICTS ..................... NONE REQUIRED`

`ARCHITECTURE FALSIFIERS ................... 16 / 16 PASS`

`ACT 11 INVARIANTS ......................... 14 / 14 PRESERVED`

`ACT 11A INVARIANTS ........................ 10 / 10 PRESERVED`

`MEMORY CROSSING ........................... CLOSED`

`LIVING CONSTELLATION WRITE AUTHORITY ...... NONE`

`RUNTIME / SCHEMA / PROMPT CHANGE .......... NONE`

`I1 DISPOSITION ............................ IMPLEMENTATION ARCHITECTURE SUFFICIENT TO OPEN I2`
