# SPI-CENSUS-01 — CENSUS INSTRUMENT

**Date:** 2026-09-13 · **Lane:** `SPI-CENSUS-01` (charter: `SPI-CENSUS-01_CHARTER_2026-09-13.md`).
**Status:** ⛔ **INSTRUMENT DEFINED. CENSUS NOT YET RUN.**

---

## 1 · Read this before recording anything

Three rules, in order of how easily they are broken:

1. **`LIVE` requires production runtime evidence** (Cat 6). Code, a migration, a service or a passing
   test establish that something **exists**, never that it is live. Charter §4.
2. **`ABSENT` means "not found in the declared scope."** Every row names the refs searched.
   Charter §6.
3. **Finding a gap is not authority to fill it.** The census records; it does not repair, design, or
   constitute. Charter §2.

## 2 · The thirteen dimensions

| # | Dimension | The question it asks |
| --- | --- | --- |
| 1 | **Personal corpus ingestion** | What of the member's own material can enter the system, and how? |
| 2 | **Persistent memory** | What survives across sessions, and under what consent? |
| 3 | **Provenance** | Can the system say *where a given piece of knowledge came from*? |
| 4 | **Inferred human model** | What does the system derive about a person that they did not state? |
| 5 | **Confirmation / correction / supersession** | Can the member correct it, and does correction propagate without rewriting history? |
| 6 | **Relational intelligence** | Can it reflect, notice, ask and be wrong *as an other*? |
| 7 | **Practitioner knowledge** | Can a practitioner's body of work be retrieved **without impersonating them**? |
| 8 | **Creative generation** | What can be drafted from the member's own corpus, and who authors the result? |
| 9 | **Representation / impersonation boundary** | What stops the system speaking *as* the person? |
| 10 | **Governed external action** | What can be effected in the world, under whose authority, with what receipt? |
| 11 | **Export / member ownership** | Can a member leave with their material in usable form? |
| 12 | **Deletion / forgetting** | Can a member cause material to be genuinely gone? |
| 13 | ⭐ **Model visibility** | What can the member **see, inspect, challenge and understand** about the model being formed of them? |

⭐ **13 is distinct from 5.** *A hidden model can be technically editable while remaining practically
unauditable.* Correction presupposes visibility; the census measures them separately.

## 3 · Finding record — required fields

Every row carries all seven. A row missing any field is not a finding.

```text
CAPABILITY        which dimension, and the specific claim being tested
EXISTING OBJECT   the module / table / route / doc that bears on it
LOCATION          path  +  the REF it was found on
STATE             LIVE | PARTIAL | DESIGNED | ABSENT | REFUSED | UNDECIDED
EVIDENCE BASIS    what establishes that state — and at what strength
SCOPE             the refs actually searched for this row
GAP               what remains, stated as a question, never as a requirement
```

**`REFUSED` additionally requires the ruling named.** No named ruling ⇒ the state is `UNDECIDED`
(charter §5).

## 4 · Search areas for the run

Memory / Anamnesis · member models and preferences · semantic and developmental memory · relationship
memory · provenance and source attribution · consent and disclosure boundaries · document and corpus
ingestion · Writer's Studio · Practitioner Studio · practitioner teachings and materials · correction
and supersession · member-owned data and export · voice and transcript ingestion · MAIA's inference
boundaries · impersonation and representation rules · JARVIS action authority · external tools and
integrations · receipts and audit trails.

## 5 · Candidate findings carried in — ⛔ at inspection strength only

Produced 2026-09-13 by a first look, **scope: `claude/uare-ai-analysis-bm8azo` working tree only**
(equivalent to `e1c6f527b` for these paths). ⛔ **Candidates, not conclusions.** Each must be re-run
under §3 before it becomes a row.

| # | Candidate | Why it matters |
| --- | --- | --- |
| **C1** | 🔴 **Representation / non-impersonation has weak canonical custody.** No canon file is named for it; `impersonat*` appears in one canon doc incidentally. The stance lives in the Anchor's vows and the Invariants — **asserted, not constituted.** | Dimension 9 is the intended distinction, and it is the one with least written custody. |
| **C2** | **`supersedes` appears designed, not implemented in memory.** Found in navigation, a voice test, a soul portrait and `pfiMindEntrypoint` — **not in a memory module.** | Dimension 5 may be closer to `DESIGNED` than `PARTIAL`. |
| **C3** | **Deletion has visible substrate; member-wide export was not found in scope.** `eraseManuscript.ts` and the `vault_erasure_queue` migration exist. | Dimensions 11 and 12 **split** — forgetting is ahead of ownership. |
| **C4** | **Ingestion and consent have substantial substrate.** `lib/manuscript/` carries a full pipeline; sanctuary/consent touches ~169 files. | Supports the composition hypothesis on dimensions 1 and 2. |
| **C5** | ⛔ **A single-branch census is methodologically insufficient.** `JOP-04` returns zero matches on the UARE branch; `lib/boundedCognition/` exists only as fetched objects from another ref. | Charter §6 exists because of this. Run naively, dimension 10 would read `ABSENT` and be wrong. |

⛔ **Do NOT repair C1 by writing a representation canon in this lane.** The census can discover that
constitutional custody is missing; **constituting it is a different act, by a different authority.**
That prohibition is the whole shape of this lane and C1 is where it will be most tempting to break.

## 6 · Not authorized

```text
architecture · implementation · migrations · repairs · new canon
product requirements · UARE-derived doctrine · gap-filling of any size
```

> *One map, not another architecture.*
