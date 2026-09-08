# Voice baseline — **CAPTURED** · 2026-09-08

**Status**: **SOURCE IDENTIFIED · DIGEST CAPTURED (founder-supplied).**
**Supersedes**: `WS2-VOICE_BASELINE_CANDIDATE_SURVEY_2026-09-08.md`, which found no usable source in-repo. That survey stands as the before-state and is not deleted — its conclusion was correct, and the resolution came from outside the repository.

---

## 1 · The baseline

```text
source
  book-print-kdp-final(1).pdf
  Elemental Alchemy — The Art of Living a Phenomenal Life
  Soullab Press · First Soullab Press Edition · copyright 2026
  216 pages
  paperback ISBN 979-8-9967127-0-0

revision
  published KDP print / First Soullab Press Edition · 2026

digest
  SHA-256
  21fa96dafd1fb071b2b330d979e4e7e57816316433910de3f9b9b7a9693dcd83

captured_at
  2026-09-08T16:18:36-04:00  (America/New_York)
```

**Provenance of this record**: the artifact was located, materialized and hashed by the founder on the Mac Studio. **The PDF is not present in this session and the digest has NOT been independently recomputed here.** Recorded as founder-supplied, per the standing rule that a report of a read is not itself a read.

**Nature of the act**: read and hash of an existing published PDF. No manuscript was altered.

---

## 2 · Recorded ambiguities — preserved, not fixed

**ISBN.** The PDF prints hardcover ISBN `979-8-9967127-2-4`; the paperback ISBN of record is `979-8-9967127-0-0`. **No effect on the baseline**, which binds to the exact PDF digest and not to an inferred ISBN record. Kept visible rather than reconciled.

**Title divergence — independent corroboration that the in-repo JSONs are stale.** The published edition reads *"Elemental Alchemy — The Art of Living a Phenomenal Life"*. The founder-knowledge ingestion artifacts carry *"Elemental Alchemy: **The Ancient Art** of Living a Phenomenal Life"*. Different titles, consistent with those JSONs deriving from the older 315-page `BOOK_v2.pdf` rather than this edition — which independently supports the survey's conclusion by a route the survey did not use.

---

## 3 · ⚠️ The baseline is half-pinned — the measurement surface is not

**The digest secures the artifact. It does not secure what will be measured.**

Phase 9 measures **prose**, not bytes. Getting from this PDF to prose requires text extraction, and extraction is a transformation:

```text
PDF bytes  ->  [extraction]  ->  text  ->  [scoping]  ->  measured corpus
   ^                                                          ^
   pinned by SHA-256                                    NOT PINNED
```

Two consequences, both of the kind this lane has been catching all along:

**(a) Extraction is unpinned.** Two different tools — or two versions of one tool — produce materially different text from identical bytes: hyphenation at line breaks, running heads and folios, ligatures, quote characters, column and footnote order. Both extractions would truthfully cite this digest while yielding different baselines. **The extraction method, its version, and a digest of its text output must be recorded and bound to the PDF digest**, or the baseline is reproducible in name only.

**(b) Corpus scope is undeclared.** A 216-page book is not 216 pages of authorial prose. Front matter, copyright page, dedication, acknowledgements, table of contents, running heads, the Spiralogic appendix material, and any index are not voice signal — including them dilutes exactly what the baseline exists to measure. **What counts as the author's prose must be predeclared**, on the same discipline as the SEL-0 threshold: fixed before any measurement, never chosen after seeing drift numbers.

⛔ **Neither is authorized or decided here.** Both are opening conditions for Phase 9, recorded now so they are not discovered later — when a drift number already exists and the temptation to scope around it does too.

---

## 4 · Standing

```text
STEP 1                     CLOSED
VOICE BASELINE — ARTIFACT  SOURCE IDENTIFIED · DIGEST CAPTURED (founder-supplied)
VOICE BASELINE — SURFACE   NOT PINNED (extraction + scope undeclared)
SEL-0                      NEXT — threshold still UNSET; blinding order at
                           AUDIT §4 governs
F-7 · PHASE 2              HOLD
PR / MERGE / DEPLOY        NOT AUTHORIZED
```
