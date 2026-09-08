# Voice baseline — candidate survey · 2026-09-08

**Status**: **SURVEY ONLY. NO BASELINE CAPTURED. NO DIGEST COMPUTED.**
**Lane**: first act of the immutable voice baseline, opened after Step 1 closed.
**Opening conditions**: `WS2-DEVELOPMENTAL_INTELLIGENCE_AUDIT_2026-09-08.md` §4 — not restated here.

---

## 0 · Result

**The published *Elemental Alchemy* corpus is not present in this repository, and the baseline cannot be captured from what is.** Four artifacts carry the title; all four are **ingestion derivatives**, not the published Work, and they disagree with each other.

Capturing a digest of any of them would stamp an ingestion product as the author's pre-MAIA voice of record. **That error is uniquely bad here**: unlike most mistakes in this lane it becomes *more* authoritative with time, because every later drift measurement is computed against it. A wrong baseline does not fail loudly — it silently redefines what "sounds like Kelly" means.

---

## 1 · What is actually in the repository

`app/api/_backend/data/founder-knowledge/`

| Artifact | Size | Shape | Assessment |
|---|---:|---|---|
| `elemental-alchemy-full.json` | 3.75 MB | `type: elemental_alchemy_book_full`; **10** chapters with `fullContent`; plus `appendix` of **2,800,018 chars** | Closest to a full-text carrier. ⚠️ **Structural anomaly**: the `appendix` field holds 75% of the file and opens `"Appendix:\n\nThe 12 Facets of the Spiralogic Profile"`. 2.8 MB is not an appendix. Contents of that field are **undetermined** and must not be assumed to be book prose. |
| `elemental-alchemy-book.json` | 91 KB | `processed_at: 2025-10-20`; **19** chapters with `content_excerpt`; `coreTeachings[349]` | **Derivative — excerpts, not full text.** ⛔ Demonstrably lossy: `coreTeachings[0]` is the book's **dedication** ("To Marie Louise Weezie DeLaVergne…") misclassified as a core teaching. |
| `elemental-alchemy-processed.json` | 57 KB | same shape; `coreTeachings[100]` | Derivative, further reduced. |
| `elemental-alchemy-summary.json` | 2.3 KB | summary | Not a corpus. |

Produced by `app/api/_backend/scripts/ingestElementalAlchemyBook.ts` and `…Simple.ts`.

## 2 · Three disqualifying facts

1. **They disagree about the book's structure.** `full.json` reports **10** chapters; `book.json` and `processed.json` report **19**. At least one is wrong about the published Work. A baseline cannot be drawn from a set that cannot agree on the book.

2. **At least one derivative is provably lossy and mis-labelled.** The dedication appearing as a "core teaching" is direct evidence the extraction misclassifies content. Voice metrics computed over extracted structures would measure **the extractor**, not the author.

3. **None is the published artifact.** All carry ingestion metadata (`processed_at`, `integrationDate`, both 2025-10-20). The §4 rule requires *the published corpus at a named immutable revision* — precisely to exclude carriers that a pipeline has already transformed. An ingestion product is a Studio-side artifact in the relevant sense: it is downstream of a transformation this project controls.

## 3 · What the baseline needs, and who can supply it

```text
NEEDED
  the published Elemental Alchemy artifact itself
  (print-final manuscript, publisher PDF/EPUB, or the exact
   source of record the author designates)

THEN
  named immutable revision
  exact content digest
  captured_at

NOT ACCEPTABLE AS THE SOURCE
  any of the four founder-knowledge JSONs, unless the founder
  determines one to be a faithful, complete, untransformed
  carrier of the published prose -- and records the basis for
  that determination
```

**Founder determination required.** Two questions only the author can answer: which artifact is the source of record, and — if `full.json` is proposed — what the 2.8 MB `appendix` field actually contains and whether it is verbatim published prose.

## 4 · Standing

```text
VOICE BASELINE          NOT CAPTURED — source of record unavailable/undetermined
DIGEST                  NOT COMPUTED
SEL-0                   HOLD (gated on baseline)
F-7 · PHASE 2           HOLD
STEP 1                  CLOSED — unaffected by this survey
```

Nothing here is a defect in Step 1 or in the ingestion artifacts, which were built for a different purpose and serve it. It is a statement that **the baseline's source of record is not yet identified**, and that a baseline is the one artifact in this programme that must not be approximated.
