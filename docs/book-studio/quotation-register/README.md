# Quotation Register — canonical record layer

**Built 2026-09-01.** `build_register.py` → `register.json`.

> **Normalise the representation, not the presentation.** Block epigraph, inline
> quotation, dialogue with a source and quoted personal communication **legitimately
> look different, because their typography carries rhetorical meaning.** That is
> preserved as the `display_form` field. **Nothing in the manuscript was changed.**

## Constraints honoured

**No quotation wording changed · no attribution adjudicated or repaired · no
epigraph forced into inline form or vice versa · nothing applied to the
manuscript.** This pass creates records and reconciles. Nothing else.

## Record shape

`id` · `occurrence` · `text` · `line_at_build` · `chapter` · `section` ·
**`display_form`** · `attributed_as` · **`attribution_state`** · `actual_author` ·
**`internal_speaker`** · `work` · `translator_or_mediator` · `provenance_status` ·
`rights_status` · `bibliography_relationship` · `family` · `editorial_status` ·
`notes`

**`attribution_state` is data, never inferred from punctuation:**
`attributed` · `attribution_anonymous` · `unattributed`

**Stable identity:** `EA-Q-<hash8>` over normalised quotation text plus occurrence
ordinal. **Line numbers shift; ids do not.** Variants and duplicates are linked
explicitly through `family` rather than rediscovered.

### Why this shape — the Blake case

The register holds **simultaneously**, without contradiction:

| Field | Value |
|---|---|
| `display_form` | `inline_anonymous_attribution` |
| `attributed_as` | *(none — "As it is said")* |
| `actual_author` | **William Blake** |
| `work` | *The Marriage of Heaven and Hell*, "Proverbs of Hell" |
| `internal_speaker` | **the devil's voice in Blake's satirical frame** |
| `provenance_status` | `verified_variant` |
| `editorial_status` | **under-attribution + lost speaker context** |

**No regex can represent that.** A record can.

## Population — 130 occurrences

| Display form | Count |
|---|---|
| `block_epigraph` | **109** |
| `inline_emphasised` | 10 |
| `inline_plain_lead` | 3 |
| `inline_plain_trailing` | 3 |
| `inline_anonymous_attribution` | 2 |
| `inline_interrupted` | **1 — asserted manually** |
| `inline_unattributed` | **2 — boundary cases** |
| **TOTAL** | **130** |

**128 attributed + 2 unattributed boundary spans.**

### ⚠️ The manual record is the architectural proof

**`inline_interrupted` (L1078 — *"And yet," Lao Tzu reminds us, "at the heart of it
all, you know."*) is asserted by hand because no detector can pair it.** The
quotation is split across two spans with the attribution between them.

**This is the point, not a workaround.** **The register is the authority; detection
is only a bootstrap.** Any architecture that treats the pattern match as the source
of truth cannot hold this occurrence at all — which is precisely how four
successive inventories each looked complete and each was wrong.

## Reconciliation — whole manuscript

**Every quotation-like span was re-derived from the manuscript and checked against
the records.** Two categories were excluded, both deliberately and by name:

**Quote-pairing artefacts (7 lines)** — spans produced by quote marks pairing
*across* scare quotes and coinages (`"one thing"`, `"lamp of life"`, `"carrot
vision,"`, `"thoughtland"`). **Not quotations.** Listed in `NOT_QUOTATIONS` so they
are never rediscovered as findings.

**Nine spans that are quoted but are not attributed quotations:**

| L | Span | Why not a record |
|---|---|---|
| 263 · 1060 · 1062 · 2110 | *"Who am I to dare…"*, *"This is what I have experienced…"* | **the author's own voiced or imagined speech** |
| 1296 · 1509 | *"emotionally inadequate"*, *"wasted years at a job they hate"* | **anonymised client speech** |
| 1810 | *"I know therefore I am."* | **the book's own coinage**, set against Descartes |
| 1889 | *"being logical and consistent."* | dictionary definition |
| 513 | *"From the Father and the Son comes the Holy Spirit"* | **creedal formula**, already handled in prose at Stage 3b |

**Reconciliation is clean: no quotation-like span in the manuscript is unaccounted
for.**

## Two boundary cases — records created, ruling owed

Per instruction, **records exist for both**; their status is a scope question, not a
verdict:

- **`EA-Q-6d797a17`** · L519 — *"if we were good, we would keep growing in a direct
  and unbroken, upward fashion"* — **quoted, no attribution of any kind.** Is
  unattributed quoted material a census object?
- **`EA-Q-0ca34438`** · L1686 — *"I think therefore I am"* — **Descartes,
  unattributed.** Does a phrase this canonical require attribution?

## What is NOT yet in the register

**Every record currently carries `provenance_status: not_yet_recorded`.** The
verdicts from Stage 2, 2c, 2c-ii, the speaker sweep and 4A **exist in the
markdown records and have not yet been migrated into the register.**

**That migration is mechanical and is the next step** — followed by verification of
the six newly found attributed items, the two boundary rulings, and only then the
freeze.

> **The register is not the truth yet. It is the place where the truth can finally
> be held.**

## Sequence from here

**structural normalisation ✅ → whole-manuscript reconciliation ✅ → migrate existing
verdicts → verify the six newly found → rule the 2 boundary cases → freeze the
population → adjudicate the complete inline field → 4B**

---

# SAFEGUARDS IMPLEMENTED — before migration · 2026-09-01

## 1 · Identity now survives editing — and the first attempt did not

> **IDENTITY INVARIANT: a quotation's id is assigned once and persists through
> manuscript revision. Wording, location, attribution and typography are mutable
> properties of that identity, never inputs to it.**

**The original scheme was a content hash and would have failed.** ⚠️ **Tested, not
assumed:** correcting the Blake quotation to its authentic wording — *"If a fool
persists in his folly he becomes wise"* → *"If the fool would persist in his folly
he would become wise"* — **produced a brand-new id and orphaned the record.** That
is precisely the repair the register exists to hold, and the identifier could not
survive it.

**Replaced with similarity matching** (Jaccard over significant words, threshold
0.45) against a persistent `identity.json` ledger. **Re-tested: the same
restoration now returns `EA-Q-0043` at score 0.50, identity preserved.**

**Below the threshold the builder returns `record_state: new_candidate`, never a
confirmed object.** A changed quotation and a new quotation are **indistinguishable
to a detector** and must be separated by a person.

> **Detection proposes objects. Reconciliation establishes them. The register owns
> them thereafter.**

## 2 · Three independent axes, no longer conflated

**`not_yet_recorded` described the register's state while sitting in a field named
for the quotation's state.** Split:

| Axis | Field | Values |
|---|---|---|
| **What is true of the quotation** | `provenance_status` | `verified_exact` · `verified_variant` · `paraphrase_adapted` · `misattributed` · `unverified` · `personal_communication` |
| **What the register knows** | `provenance_review_state` | `migrated` · `pending_migration` · `not_investigated` |
| **What was editorially decided** | `editorial_status` | independent — **a `VERIFIED` quotation that Stage 4 removed is `VERIFIED` + `REMOVED`** |

> **`unverified` (investigated, no source found) must never collapse into
> `not_investigated` (nobody has looked) — or into `pending_migration` (the verdict
> exists, it just has not been copied here).** All three would otherwise read as
> "we don't know," and only one of them means that.

Plus `evidence_location`, so every migrated verdict points back at the record that
earned it.

## 3 · Negative knowledge persists

`NOT_QUOTATIONS` and the nine documented non-records **are not debris around the
census — they are findings.** *"We examined this span and determined what it is."*

**This is what stops `"thoughtland"` becoming a fresh provenance alert every time a
detector changes.** The same persistence is owed to **declined findings · protected
asymmetries · intentional repetition · known false positives** — otherwise the
system repeatedly rediscovers questions the author has already answered, **which is
a failure of respect for the member's attention.**

## ⚠️ Process incident — the manuscript was briefly truncated

**During the first identity test I wrote `open(MS,'w').write(open(MS).read()...)`.
The `'w'` truncates before the inner read executes.** The manuscript was emptied.

**Recovered immediately and completely** — a backup had been copied one line
earlier, and `git diff` against HEAD confirms the restored file is **byte-identical**
to the committed version. 2,766 lines, 109 block epigraphs. **No content lost.**

**Recorded because the near-miss is instructive, not because it caused harm.** The
test was run **against the live manuscript instead of a copy**, for no reason other
than convenience. **A verification procedure must never be able to damage the
artifact it verifies.** The corrected test reads the original into memory first and
restores from that.

**Studio requirement:** *any operation that modifies a manuscript to test something
must operate on a copy.* A system that can generate and run its own verification
code needs this as a hard boundary, not a habit.

---

# MIGRATION — STEP 1 · the session control set · 2026-09-01

> **Migration is not extraction. It is the transfer of earned knowledge into a new
> authority.**

**33 hand-authored entries in `session_verdicts.json`. No prose parsed. Nothing
re-adjudicated.** Each entry cites the record that earned its verdict. `migrate.py`
**never opens the manuscript** — verification and migration have no write path to
the canonical artifact.

**Result: 33 matched · 0 unmatched · 0 ambiguous · 0 conflicts. `GATE PASSED`.**

## ⚠️ The gate failed first, and both failures were real

**It was not relaxed to pass.** Two genuine schema defects, both found by the gate
rather than by inspection:

### 1 · Review state must be per axis, not global

Three records were marked `migrated` while carrying **no provenance verdict** — the
**song lyrics**. Their **rights class and editorial ruling are established; their
provenance was never investigated.** That is not an error in the data; it was an
error in the schema, which had one review state trying to describe three axes.

**Split into `provenance_review_state` · `rights_review_state` ·
`editorial_review_state`.** **Migrating a rights class must never assert that
provenance was investigated.** The gate now reports these explicitly:

> `NOTE  2 record(s) editorially ruled with provenance still open: EA-Q-0024, EA-Q-0111`

**That is a true and useful statement about the book** — two quotations are
editorially settled and provenance-open — and the old schema could not express it.

### 2 · Block reconciliation was off by one

`109 = 17 migrated + 91 pending` — **108.** The missing record was **Salzberg**, a
block epigraph deliberately left `not_investigated` pending the Mary Oliver nesting
check. **The arithmetic had no term for "documented as deliberately uninvestigated."**
Corrected: **`109 = 14 migrated + 91 pending + 4 not_investigated`.**

## Standing after step 1

| Review state | Records |
|---|---|
| `migrated` | **27** |
| `not_investigated` | **12** — 6 newly found attributed items · 2 boundary spans · Salzberg · second Teasdale · TTC 33 · interrupted Lao Tzu |
| `pending_migration` | **91** — block epigraphs awaiting chapter-batch migration |
| **TOTAL** | **130** |

**Families established:** `fam-perfect-laugh` **(3)** — the fake-Buddha saying in two
wordings across block and inline · `fam-song-lyrics` **(3, plus Cohen)** ·
`fam-teasdale` **(2)**.

**`pending_migration` will not reach zero until the final chapter batch closes.**

## Next

**Chapter-by-chapter migration of the historical census, in manuscript order,
with the closure gate run after each chapter.** No bulk prose parser.
