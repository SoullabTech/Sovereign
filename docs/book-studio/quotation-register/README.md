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

---

# LIFECYCLE RECORDS — 28 historical occurrences · 2026-09-01

> **The register represents the quotation lifecycle, not merely the current
> manuscript surface.**

**28 former block-quotation occurrences preserved**, hand-authored from
already-established Stage 3 and Stage 4A rulings. **Not re-adjudicated.** They carry
last-known location, the text as it stood at removal, provenance, rights,
bibliography relationship, editorial ruling, evidence location and family links —
**and no active manuscript span.**

## `record_state` — because 28 removals were not 28 of the same thing

| State | Count | Meaning |
|---|---|---|
| **`removed`** | **24** | the occurrence is gone from the manuscript |
| **`reclaimed_as_author_prose`** | **4** | **the quotation frame was removed and the words stayed, as the author's own prose** |
| `superseded` | 0 | reserved; no specimen yet |

**The distinction is load-bearing.** *"Deleted because it was false"* and *"the
author reclaimed the underlying thought in their own voice"* are **completely
different facts about the book**, and flattening both to `removed` would erase the
entire Stage 3 finding.

The four reclaimed: **Haramein** (torus) · **Jung** (subjective perception) ·
**Wilber → soulplay** · **the spiral definition**. Each remains in the book. **None
is a quotation any more.**

## Questions the register can now answer

- **"Did this book ever attribute this sentence to Aristotle?"** → yes, twice; both
  removed at 4A; one was ruled a provenance failure at Stage 2.
- **"Why is this bibliography entry still here when no current quotation points to
  it?"** → because its quotation was removed, and the record says which stage,
  which ruling, and why.
- **"Was this deleted because it was false, or because the author reclaimed the
  thought?"** → `record_state` answers directly.

**These are publication questions, not archival trivia.** Stage 7 will need every
one of them.

## Arithmetic kept separate — tombstones never inflate the census

**Current semantic field**

| | |
|---|---|
| active block | **109** |
| inline attributed | **19** |
| unattributed boundary records | **2** |
| **current records** | **130** |

**Historical lifecycle**

| | |
|---|---|
| inactive former block occurrences | **28** |
| **block lifecycle** | **137 = 109 active + 28 inactive** ✅ *(gated)* |

> **Attributed quotation occurrences ever identified: 137 historical block + 19
> inline = 156**, with the **two unattributed boundary objects represented
> separately** rather than forced into that number.

**Three gate checks now enforce the separation:** historical records carry no active
span · historical ids are disjoint from current ids · the block lifecycle
reconciles to 137. **Current and historical cannot be conflated by accident.**

## Doctrine confirmed by this batch

> ### A failed gate is evidence until demonstrated otherwise.

**Twice now the implementation wanted to say "the check is too strict," and both
times reality said the schema was too weak.** Per-axis review states came from one
such failure; the "documented as deliberately uninvestigated" term came from
another.

> **Deliberately unresolved is itself a state that must be counted. Otherwise
> responsible restraint looks like missing data.**

**→ Chapter 1 historical provenance migration next.** Chapter → gate → chapter →
gate. No bulk parser, no loosened gate.

---

# BATCH 1 — front matter · Preface · Chapter 1 · 2026-09-01

**Hand-authored from `QUOTATION_PROVENANCE_AUDIT.md`. No re-verification, no new
adjudication, no manuscript mutation.** **`GATE PASSED`.**

**Scope: 10 block records.** 9 provenance verdicts migrated; **1 documented
deferral.**

| Record | Verdict migrated |
|---|---|
| **Rilke** L161 | `VERIFIED EXACT` · **the translator claim is CORRECT** — Barrows & Macy, Riverhead 1996. **The audit's first translator-naming entry to pass the printed-English test.** Rights object is the **English translation**, not the German. `LIKELY PROTECTED · HIGH` |
| **Buddha / Kalama Sutta** L186 | `VERIFIED VARIANT` · **`WRONG TRANSLATOR CITED` — second confirmed instance.** The bibliography credits Thanissaro Bhikkhu, whose actual rendering begins *"Now, Kalamas, don't go by reports, by legends…"* — materially different from the printed text |
| **Dickinson** L245 | `MISATTRIBUTED` · `COMPOSITE ATTRIBUTION` — the poem's opening is hers; the continuation is not |
| **Sadhguru** L173 | source/concept `VERIFIED`, wording `VARIANT — EDITION CHECK REQUIRED`. Attested on the **quoted author's own institutional channel**, which meets the official-source standard |
| **Rumi** L182 | `UNVERIFIED · UNKNOWN` — no Persian source. Family `fam-rumi-unsourced` |
| **Singer** L139 · **Miller** L321 | `UNVERIFIED — source lead unresolved` |
| **Zhuangzi** L129 · **Campbell** L313 | migrated earlier in the control set |

## ⚠️ The one deferral, and a state that did not exist

**Wendell Berry L167.** His **rights** classification is in the audit's rights table
— *poetry, living author* — but **his provenance verdict is not locatable in the
audit narrative.**

**It was not inferred.** Under the standing rule — *migrate faithfully, flag
separately, never improve a finding while moving it* — the record carries **rights
migrated, provenance deferred.**

**But `not_investigated` was the wrong label**, and marking it so would have been a
quiet falsehood: *someone did investigate Berry; the verdict simply is not where I
could find it.* **That is a third thing, and the schema had no word for it.**

Added: **`verdict_not_locatable_in_source`.**

> **This is the third time the schema has been too weak rather than the check too
> strict** — after per-axis review states and the "documented deferral" term. **The
> pattern is consistent: every place the data had to be bent to fit was a place the
> model was missing a distinction the work actually contains.**

**And it matters practically.** `not_investigated` would send someone to do work
that has already been done. `verdict_not_locatable_in_source` sends them to **find
a record**, which is a different and much smaller task.

## Standing after batch 1

| | |
|---|---|
| `migrated` | **34** |
| `not_investigated` | **12** |
| `verdict_not_locatable_in_source` | **1** |
| `pending_migration` | **83** |
| **current records** | **130** |
| **historical records** | **28** |

**Block reconciliation: `109 = 21 migrated + 83 pending + 5 documented-deferred`** ✅
**Lifecycle: `137 = 109 active + 28 inactive`** ✅

**Batch-scope closure: zero `pending_migration` remaining in front matter, Preface
or Chapter 1.**

**→ Batch 2: Chapter 2.**

---

# BATCH 2 — Chapter 2 · 2026-09-01

**Faithful transfer. No re-investigation, no adjudication, no manuscript edits.**
**`GATE PASSED`. 4 records, zero `pending_migration` remaining in scope.**

| Record | Verdict migrated |
|---|---|
| **Alan Watts** L337 | `VERIFIED EXACT` — *The Wisdom of Insecurity* (1951) ch. 3. Bibliography **correct** |
| **Nicholas of Cusa** L399 | `PARAPHRASE/ADAPTED` · `EVOLVED APHORISM / RECOVERABLE ANCESTOR`. **Cusa used the figure but did not originate it** — the ancestor is the pseudo-Hermetic *Liber XXIV Philosophorum* (12th c.). Bibliography `MISSING` |
| **Carl Jung** L415 | `VERIFIED VARIANT` · `MEDIATED TRANSLATION` (fifth instance) — *Memories, Dreams, Reflections*, Winston translation |
| **Johannes Kepler** L419 | `UNVERIFIED — source lead unresolved` · `MEDIATED TRANSLATION`. **Bibliography names the Aiton translation, which the audit called good practice** — the sentence still needs finding in it |

## The Cusa finding is worth restating

**Two alterations, and one of them changes the image.** The manuscript reverses the
clause order — cosmetic — and changes ***sphaera* → circle**, which is not:
**the sphere is the point of the figure, infinity in every direction.** A circle
flattens it to a plane.

**And the ancestor is genuinely recoverable**, which makes this a `SOURCE
RESTORATION OPPORTUNITY` rather than a deletion: Cusa, Alain de Lille, Bonaventure,
Pascal and Voltaire all *used* it. **Attributing it to Cusa is not false so much as
insufficiently deep.**

## ⚠️ One migrated verdict that I believe is wrong — moved anyway

**The Jung entry records the bibliography relationship as `MISSING`** — *"the
correct work, Memories, Dreams, Reflections, appears nowhere in the book."*

**That verdict was written during the systematic bibliography-scope error**, when
each chapter's bibliography was checked in isolation. **MDR is in fact present in
the front matter.**

**It was migrated exactly as written.** Under the standing rule — *migrate
faithfully, flag separately, never improve a finding in transit* — the correction
belongs to Stage 7's bibliography reconstruction, **not to a migration pass.**
Silently fixing it here would have made migration into a second provenance audit,
and the register would then contain a verdict no record ever earned.

**The concern is in the record's `notes`, where a Stage 7 reader will find it.**

## Recovery metadata added — Berry

> **Unknown because nobody investigated ≠ unknown because the investigation record
> cannot currently be recovered.**

The `verdict_not_locatable_in_source` state now carries a **`recovery_note`**: what
was searched, what was expected, and where to look instead. **So the next pass does
not repeat the same failed search.**

## The safety property, kept hard

**Failure to attach is safer than plausible attachment to the wrong semantic
object.** The Berry mismatch in batch 1 proved the property holds: **a wrong
guess fails loudly as `unmatched` rather than silently binding a verdict to the
wrong quotation.**

## Standing after batch 2

| | |
|---|---|
| `migrated` | **38** |
| `not_investigated` | **12** |
| `verdict_not_locatable_in_source` | **1** |
| `pending_migration` | **79** |
| **current / historical** | **130 / 28** |

**`109 = 25 migrated + 79 pending + 5 documented-deferred`** ✅ · **`137 = 109 + 28`** ✅

**→ Batch 3: Chapter 3.**
