# MAIA-WISDOM-WITNESS-01 · Part B — Production Population Witness

**Status: ⭐ PART B COMPLETE · ⛔ PART A (external AIN tree) STILL UNRUN.**
**Date:** 2026-09-15 · Read-only, run by founder against production `maia-postgres`.
`SET default_transaction_read_only = on` · no writes · no schema change.

---

## 1. The witness

```
          t           | rows  | embedded
----------------------+-------+----------
 ain_knowledge_chunks |     0 |        0
 corpus_chunks        |     0 |        0
 library_chunks       | 55760 |    55760

 sources | completed
---------+-----------
    2228 |      1752

     el     |  el2   | count
------------+--------+-------
 (untagged) | (none) | 55760
```

---

## 2. ⭐⭐ The reframe: the Library **is** the second brain. Everything AIN-named is empty.

| Substrate | Rows | Embedded | Reading |
|---|---|---|---|
| `ain_knowledge_chunks` | **0** | 0 | ⛔ **The AIN teaching corpus has never been ingested to production.** The 739 files in `data/ain/source` exist only in the repository. |
| `corpus_chunks` | **0** | 0 | ⛔ Confirms ACT 1B: one writer, zero readers — **and zero rows.** The most structurally complete registry in the system is entirely unused. |
| `library_chunks` | **55,760** | ⭐ **55,760 (100%)** | ⭐⭐ **Fully embedded. This is the real second brain.** |
| `library_sources` | **2,228** | 1,752 completed (79%) | ⚠️ 476 sources pending/failed/skipped — a named gap, not a defect claim. |

> ⭐⭐ **Every object named `ain_*` is empty. Every object named `library_*` is full.**
> The programme spent its census looking hardest at the corpus that turned out not to exist
> in production, and the substrate carrying 55,760 embedded chunks was the one ACT 1B
> already identified as the best-designed seam (R2) — on architecture alone, before any
> population was known.

⭐ **R2 is now doubly vindicated:** `library_sources` is not merely the best seam to compose
with, it is **the only populated one.** ACT 2A has exactly one real substrate to build from.

## 3. ⛔ CORRECTION — carry-forward finding #2 was true of code and FALSE of data

ACT 1B §10.2 recorded: *"Multi-element participation is already implemented"* — `meta.element`
+ `meta.element_secondary`, dual-tagging, a deterministic classifier. ⭐ **All of that is true
of the code, and it is preserved.**

⛔ **But in production: `(untagged) | (none) | 55760`. Zero of 55,760 chunks carry any
elemental metadata. `spiralogicTagger` has never run against production `library_chunks`.**

**The corrected statement:** the elemental derivation precedent exists as **trustworthy,
inspectable, model-free code that has never been applied.** ⚠️ It is a *capability*, not a
*dataset*. ⛔ ACT 2A may not treat elemental participation as existing data, and any surface
that reads `meta->>'element'` today returns nothing for every chunk.

⭐ **This is exactly the falsifier ACT 1B named for that finding, and it fired.** The finding
was stated as a claim about implementation and would have been read as a claim about the
field. ⛔ Corrected in place rather than quietly narrowed.

## 4. ⭐ And it bounds the R4 rights exposure I raised

The reachability witness flagged `GET /api/ain/knowledge` — publicly reachable,
unauthenticated, retrieving from `ain_knowledge_chunks`, which holds third-party clinical and
copyrighted material with no rights standing. It stated the exposure was **conditional on
population, which was unknown.**

⭐ **`ain_knowledge_chunks` holds 0 rows. The endpoint had nothing to return.**

**The exposure was structural, not actual.** The access-control defect was entirely real and
the containment was correct — ⛔ but **no copyrighted material was ever publicly retrievable
through it**, because none had ever been ingested. Recorded plainly: the alarm was correctly
raised under uncertainty, and the population truth bounds it. ⛔ Neither fact cancels the other.

## 5. What this establishes for the programme

```
DOES THE SECOND BRAIN EXIST?        ⭐ YES — 55,760 fully-embedded chunks, 2,228 sources
DOES IT HAVE ELEMENTAL STRUCTURE?   ⛔ NO  — 0 of 55,760 tagged in production
DOES IT REACH THE MEMBER?           ⛔ NO  — unchanged (ACT 1)
IS THE AIN CORPUS LIVE?             ⛔ NO  — 0 rows; repository-only
```

⭐ **The integration failure is now precisely located.** It is not that knowledge is missing —
it is that 55,760 embedded chunks sit in a substrate with no elemental topology and no path
to a member turn, while the corpus everything is *named* after was never ingested at all.

## 6. Standing

**⭐ PART B COMPLETE · `library_chunks` 55,760/55,760 EMBEDDED · `library_sources` 2,228 (1,752
completed) · `ain_knowledge_chunks` 0 · `corpus_chunks` 0 · ⛔ ELEMENTAL TAGGING 0/55,760 ·
⛔ CARRY-FORWARD FINDING #2 CORRECTED · ⭐ R4 EXPOSURE BOUNDED AS STRUCTURAL · ⛔ PART A
(EXTERNAL AIN TREE) UNRUN · ⛔ NO WRITES · ⛔ NOTHING TAGGED · ⛔ NOTHING INGESTED ·
⛔ ACT 2A NOT OPENED.**

> *We were counting the wrong shelves. The library was full the whole time, unlabelled, and
> nobody could get to it.*
