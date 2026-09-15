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

## 2. ⭐⭐ The reframe — stated precisely

> **The production semantic corpus exists and is fully embedded in `library_*`.**
> ⛔ **That is not the same as the second brain existing as an integrated intelligence system.**

⚠️ **This supersedes an earlier heading in this record that read *"the Library IS the second
brain."*** ⛔ **That was an overstatement, and of a specific governed kind.** A fully embedded
vector corpus is a **semantic substrate**. `MAIA_SOUL_CORPUS.md` defines the second brain as
something carrying standing, provenance and a relation to the member — none of which this
data has. Under `MARKETING_CLAIM_DISCIPLINE.md`, *"we have a second brain and it is full"*
would collapse **Live** and **Designed** into one sentence. ⭐ **The looser phrasing would
have licensed exactly the claim that discipline exists to prevent**, so it is corrected here
rather than softened.

**What is true: everything named `ain_*` is empty; everything named `library_*` is full.**

| Substrate | Rows | Embedded | Reading |
|---|---|---|---|
| `ain_knowledge_chunks` | **0** | 0 | ⛔ **The AIN teaching corpus has never been ingested to production.** The 739 files in `data/ain/source` exist only in the repository. |
| `corpus_chunks` | **0** | 0 | ⛔ Confirms ACT 1B: one writer, zero readers — **and zero rows.** The most structurally complete registry in the system is entirely unused. |
| `library_chunks` | **55,760** | ⭐ **55,760 (100%)** | ⭐⭐ **Fully embedded. This is the real second brain.** |
| `library_sources` | **2,228** | 1,752 completed (79%) | ⚠️ 476 sources pending/failed/skipped — a named gap, not a defect claim. |

> ⭐⭐ **A populated, fully embedded vector library is not yet governed wisdom.**
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

**The corrected statement — founder wording, PREDECLARED before the result was known:**

> **The deterministic elemental classifier exists as an implementation precedent, but
> production evidence does not establish that it has participated in the stored corpus.**

⭐⭐ **That revision was written as a conditional *before* the query ran**, alongside the
opposite branch (*"if the production rows contain meaningful elemental combinations, the
stronger statement survives"*). ⭐ **This is a genuine falsification test, not post-hoc
narration** — the result selected between two predeclared readings rather than being
explained after the fact.

⚠️ **And the founder's wording is strictly better than the draft it replaces.** An earlier
version of this section said the tagger *"has never been applied"* — ⛔ that asserts a
negative the data cannot carry. Zero tagged rows is equally consistent with *never ran*,
*ran and was later cleared*, or *ran against a different table*. **The founder's formulation
states the limit of the evidence instead of a claim beyond it**, which is the discipline this
lane has run on throughout. Adopted verbatim; the weaker draft is superseded, not hidden.

⛔ ACT 2A may not treat elemental participation as existing data: any surface reading
`meta->>'element'` today returns nothing for every one of the 55,760 chunks.

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

---

## 7. ⭐⭐ The finding of the day (founder)

> **MAIA's knowledge problem is no longer *"where is the corpus?"* It is *"how does a fully
> embedded Library acquire provenance, elemental participation, contradiction, relationship,
> and a governed path into the member relationship?"***

⭐ **That is a narrower and far more buildable problem than the one the programme opened
with** — and one precision makes it narrower still. `library_sources` is **not** provenance-
free: it already carries `author`, `type` (CHECK-constrained), SHA-256 `checksum`,
`ingestion_status`, a consent gate, and `meta` documented for `{folder, tags[], tradition,
lineage}`.

⛔ **What it lacks is not provenance of form but two kinds of standing:**

| Present | ⛔ Absent |
|---|---|
| author · type · checksum identity | **rights standing** (R4) — no field, anywhere |
| tradition · lineage in `meta` | **epistemic standing** — inherited vs founder vs member vs emergent (R8) |
| consent gate on the source | elemental participation **in data** (0 / 55,760) |
| ingestion status | concepts · relationships · **counterexample** (R13) |

⭐ **ACT 2A therefore extends a real object rather than inventing one**, which is what R2
anticipated on architecture alone and Part B has now confirmed on data.

> *We were counting the wrong shelves. The library was full the whole time — unlabelled,
> ungoverned, and unreachable.*
