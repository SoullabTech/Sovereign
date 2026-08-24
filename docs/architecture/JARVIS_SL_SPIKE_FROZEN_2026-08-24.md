# JARVIS-SL self-learning spike — FROZEN

**Class: ARCHITECTURAL EVIDENCE. ⛔ NOT canonical implementation. ⛔ NOT wired. ⛔ Do not extend.**
**Branch:** `claude/avo-jarvis-learning-arch-lmmvcy` (this branch) — **frozen 2026-08-24.**
**Ruling:** founder, 2026-08-24.

> *"JARVIS self-learning spike accepted as architectural evidence, not canonical
> implementation. Freeze the branch. Do not delete it, merge it, wire it into runtime, or
> continue expanding JARVIS-core functionality in Sovereign."*

---

## Disposition

| Work | Ruling |
|---|---|
| Reuse existing epistemic ladder | **ADOPT** |
| Trace has no epistemic status itself | **ADOPT** |
| Candidate claim passes through real guard | **ADOPT** |
| Failure → HEURISTIC candidate | **ADOPT** |
| Success → HYPOTHESIS candidate | **ADOPT** |
| Vocabulary drift guard | **ADOPT** |
| Relational / AIN bridge | **HOLD** |
| This Sovereign implementation | **PRESERVE AS EXPERIMENT** |
| Wire into runtime | ⛔ **NO** |
| Merge as canonical JARVIS | ⛔ **NO — not yet** |
| Continue expanding in Sovereign | ⛔ **NO** |

## ⭐ Why it was frozen — sequencing, not design

The spike built a learning loop **before** the boundary governing what it is allowed to learn
from. The correct order is:

```
ADMISSION
     ↓
eligible operational evidence
     ↓
TRACE
     ↓
DERIVATION
     ↓
candidate learning
     ↓
EPISTEMIC GUARD
     ↓
durable standing
```

⛔ The sequence *"build learning, then figure out what it was allowed to learn"* must not be
normalized, even when the learning substrate is unwired. Founder Ruling 1 (2026-08-16) existed as
doctrine with **no executable gate** preventing protected/member material from entering durable
JARVIS storage — that gate is the prerequisite, and it was built next in canonical
`SoullabTech/JARVIS` (`contracts/JURISDICTION_ADMISSION_GATE_v1.md`, branch
`jarvis/jurisdiction-admission-gate-v1`).

## Custody

`SoullabTech/JARVIS` is the canonical home of **both** JARVIS architecture and JARVIS-native
executable implementation. The substantial JARVIS mechanisms presently in Sovereign
(`scripts/builder/*`) are **historical/incubated implementation to be migrated, not rebuilt
there**. ⛔ No new JARVIS-core architecture is to be added to `SoullabTech/Sovereign`.

## Naming

The capability track is **JARVIS-SL**, not `JSL`. The canonical reconciliation retired competing
`JSL`/`JEM`-style top-level namespaces in favour of JARVIS capability tracks.

⚠️ **The executable files on this branch retain their original `jarvis-learning-*` names and their
in-code `JSL-00`/`JSL-01` unit labels.** Per the ruling — *"do not perform risky cosmetic renames
of CI-bound executable files merely for naming consistency"* — they were **not** renamed. The
files are wired into `npm run jarvis:proof`. Normalization to JARVIS-SL applies **prospectively**,
at canonicalization in the JARVIS repository.

## ⭐ Findings recorded for later canonicalization

1. JARVIS self-learning does **not** own a promotion/status ladder.
2. `epistemic-guard.mjs` remains the authority for claim standing and promotion.
3. Learning traces themselves carry **no epistemic status**.
4. Repeated **verified** failures may propose `HEURISTIC`.
5. Repeated **verified** successes may propose only `HYPOTHESIS`.
6. Worker self-report is non-probative/weak evidence and may **not** generate strong standing.
7. Vocabulary compatibility with the canonical epistemic guard must be **mechanically tested**.
8. The held relational-intelligence / AIN direction remains **HOLD** and is **not opened** by this
   work.

## ⚠️ What this spike does NOT establish

Self-learning memory is not the destination. JARVIS accumulating traces and hypotheses does not
give it **operational standing**. The founder's 2026-08-14 distinction stands:

| | asks |
|---|---|
| **memory** | *what happened before?* |
| **operational standing** | *what is true now, what remains unresolved, what has changed, and what actions are currently permitted?* |

The deeper goal is that JARVIS can answer:

> *What have I actually learned from prior work that is **admissible**, **presently supported**,
> **relevant here**, and **authorized to influence** what I do next?*

⛔ Each of those four qualifiers is a separate mechanism. This spike built none of them — it built
the trace and the retrieval that a standing layer would later read. *"Admissible"* is the
admission gate, and it is now the only one that exists.

## Sequence after admission is mechanically real

```
1  Admission gate                                    ✅ built (JARVIS, branch)
2  Migrate epistemic guard + core machinery into JARVIS custody
3  Canonicalize the useful JARVIS-SL spike
4  Add retrieval / recall over existing runs and episodes
5  Derive candidate HEURISTIC/HYPOTHESIS records
6  Let epistemic-guard decide standing
7  Later: operational standing and strategic learning
8  Much later, if ruled: relational / AIN bridge
```

⛔ Steps 2–8 are **not authorized** by this document.

## Files preserved on this branch

```
scripts/builder/jarvis-learning-trace.mjs            JSL-00 trace (frozen)
scripts/builder/jarvis-experience-memory.mjs         JSL-01 retrieval (frozen)
scripts/builder/__tests__/jarvis-learning-proof.mjs  39 assertions
docs/architecture/JARVIS_SELF_LEARNING_JSL_00_01.md  original spike doc
```

⛔ Nothing calls them. `npm run jarvis:proof` executes the proof only.
