# MAIA-WISDOM-WITNESS-01 · Instrument Amendment 2E

**Status: CANDIDATE · ⛔ FINAL INSTRUMENT RE-ACCEPTANCE OWED · ⛔ PART A RUN #2 NOT PERFORMED.**
**Date:** 2026-09-15 · Metadata-carrier semantics. 2D aggregate semantics accepted.

---

## 1. Two residual contradictions, both verified in source

### A — the raw record still manufactured absence

2D fixed the aggregate. `:340` did not:

```js
frontmatter_fields_missing: fmPresent ? RATIFIED_FIELDS.filter(...) : RATIFIED_FIELDS,
```

⛔ For the **admitted** unread file — `textObserved = false`, `fmPresent = null` — `census.json`
still recorded **all nine required fields as missing.** ⭐ The domain and authorship fields had
been changed to `null`; the frontmatter fields had not. **The same defect one layer down.**

### B — ⭐⭐ the wrong population entirely

`CORPUS_DISCIPLINE_PROTOCOL_v1.0:19` — verified, quoted:

> *"Every document in `/data/oracle-corpus` must have these fields, either as YAML frontmatter
> (Markdown) **or a sidecar `.meta.json` file (PDFs, other formats)**."*

The instrument parses YAML for `.md`/`.markdown` only (`:316`), then counted **every** file with
`fmPresent === null` as absent (`:332`). So:

```
PDF with a perfect doc.pdf.meta.json   →  "Absent frontmatter"
.txt · .json · .csv · .html            →  "Absent frontmatter"
images · audio                         →  "Absent frontmatter"
the .meta.json sidecar itself          →  a corpus document with "Absent frontmatter"
```

⛔ **So the report's own claim — that absent frontmatter *"measures the distance between the
corpus as it exists and the discipline already ratified for it"* — was false.** It measured
distance from **one of two** ratified carriers, while asking files the canon never required to
carry YAML to account for not having it.

⭐ **This defect predates every amendment. The amendments merely cleared enough noise to expose it.**

## 2. The repair — option A, the narrowest truthful form

⛔ **No metadata resolver was built.** The founder warned against silently implementing sidecar
inspection; the instrument instead **bounds what it claims**.

| | |
|---|---|
| **Per-record** | `frontmatter_status`: `complete · partial · absent · unknown · not_applicable`. ⭐ A missing-fields array is emitted **only** for Markdown whose content was read. `unknown` and `not_applicable` both carry `null` — neither non-observation nor a different carrier is evidence of absence. |
| **Denominator** | The table now reports **share of Markdown documents**, ⛔ not of `files.length`. Exposed: `markdown_documents` · `markdown_frontmatter_complete/partial/absent/unknown`. |
| **Zero-byte Markdown** | classified `absent` directly from verified size, ⛔ not `unknown` — nothing was unobserved. |
| **Non-Markdown** | ⛔ `not_applicable`. `non_markdown_sidecar_compliance: "NOT MEASURED BY THIS INSTRUMENT"`. |
| **Sidecars** | counted as `meta_json_sidecars_seen`, plus `corpus_documents_excluding_sidecars`. ⛔ Not deleted, not altered, not inflating document totals. |

**Report wording, verbatim in `CENSUS.md`:**

> **Markdown frontmatter standing is measured here. Non-Markdown `.meta.json` sidecar compliance
> is NOT measured by this census.**

And the central-finding sentence now says *the **Markdown** corpus … and the YAML-carrier half of
the discipline* — ⛔ not the whole protocol.

## 3. Acceptance witness

| | Test | Result |
|---|---|---|
| **A** | `node --check` | ⭐ OK |
| **B** | unread Markdown | ⭐ `status: unknown · present: null · missing: null · domain: null · authorship: null` |
| **C** | read Markdown, no frontmatter | ⭐ `absent`, **9** missing |
| **D** | read Markdown, 2 of 9 fields | ⭐ `partial`, **7** missing |
| **E** | ⭐⭐ **PDF** | ⭐ `not_applicable`, `missing: null` — ⛔ **does not increment Markdown absence** |
| **F** | ⭐ **`doc.pdf.meta.json`** | ⭐ `not_applicable`; counted as **1 sidecar**; `corpus_documents_excluding_sidecars` separates it |
| **G** | every prior gate | ⭐ text `0`/`5` · hash `0`/`5` · readdir `6` · lstat `6` · containment `3` · probe `4` · clean `0` |
| **H** | real corpus untouched, no Run #2 | ⭐ fixture unchanged |

⭐ **Mixed fixture, five files:** `markdown_documents: 3 (of 5 files)` · `complete/partial/absent/unknown = 1 1 1 0` · `sidecars seen: 1`. Under `8e5601ee` the same fixture would have reported **5 documents, 4 absent** — the PDF and its own sidecar both indicted for lacking YAML.

**Preserved:** structural exactness · text/hash ≥95% gates · unknown-is-not-absence · duplication
lower bound · exclusions · traversal · read-only · containment · all exit codes.

## 4. The evidentiary grammar, complete

```
VISIBILITY     readdir · lstat            exact, 0 failures
READABILITY    text · hash                ≥ 95%, per channel
OBSERVATION    unread stays UNKNOWN       never absence, never a denominator
APPLICABILITY  wrong carrier → NOT APPLICABLE, never absence
CLAIM          the report states which half of the protocol it measured
```

> **Unknown must remain unknown — and *not applicable to this carrier* must not become
> *absent* either.**

## 5. Standing

```
1 ✅  2 ✅  2A ✅  2B ✅  2C ✅  2D ✅ (aggregate)
2E ⚠️ CANDIDATE — awaiting final instrument re-acceptance

Materialization ⏳ owed — container still 432K, errno 60
Part A Run #1   ⛔ inadmissible     Part A Run #2  ⛔ not authorized
Part B          ✅ complete
```

> *The last defect was the oldest one. Every amendment before it made the instrument more honest
> about what it had seen; this one made it honest about what it had ever been asking.*
