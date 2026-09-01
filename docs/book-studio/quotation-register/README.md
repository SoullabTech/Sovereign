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

---

# BATCH 3 — Chapter 3 · 2026-09-01

**`GATE PASSED`.** 4 records in scope; **two were already migrated in the control
set** (McGilchrist, Nabokov), one is an **unattributed boundary record** awaiting a
scope ruling, and **one verdict was migrated: Sai Baba.**

## Sai Baba — `UNVERIFIED` · `MEDIATED TRANSLATION`

`UNVERIFIED` **stands under the corpus-density principle**: the official corpus
(saispeaks.sathyasai.org, the published *Sathya Sai Speaks* volumes) is dense and
searchable, so **failure to locate the wording is itself meaningful evidence**
rather than an absence of looking. Discourses delivered in Telugu — mediation
recorded.

**The withdrawn flag migrated with it.** The census raised a `DOCTRINAL MISMATCH` —
that a four-element formulation contradicted his five-element teaching — and then
**dissolved it**: the same corpus explicitly distinguishes **four perceptible
elements from ether as ground.** The withdrawal is part of the record, not an
embarrassment to be tidied away.

## First migration onto a lifecycle record

**The Rumi occurrence removed at 4A still carries an earned Stage 2 verdict** —
`UNVERIFIED · UNKNOWN`, variant family (*"The universe"* / *"This universe"*),
`PROTECTABILITY UNCERTAIN · STANDARD`.

**A removed occurrence does not lose its provenance.** `migrate.py` now accepts
`historical_entries` targeting tombstones, with **the same conflict check as the
current layer** — a lifecycle record cannot receive a provenance verdict
contradicting the one it already holds.

**Effect: `fam-rumi-unsourced` now spans both layers** — one active occurrence, one
removed — which is exactly what a provenance family should do. **Removal does not
break a family link.** Cross-layer family counting is now in the gate.

## Two migration rules confirmed from batch 2

> **1. Known-wrong historical verdicts stay historically faithful.** Flag them for
> later correction; never silently fix them in transit. *(The Jung `MISSING`
> specimen.)*
>
> **2. Known facts are not the same as asked questions.** *(Polonius: the audit
> recorded the speaker; what was missing was the editorial question of whether
> presenting that speaker as Shakespearean wisdom distorted the passage.)*

**The second is the more important one for the Studio:**

> ### Having the data is not the same as knowing what question to ask of it.

**A system can hold a perfectly accurate field and still never surface the finding**
— which is what happened for the entire span between the census recording
"Polonius" and 4A asking what he was doing in that sentence.

## Standing after batch 3

| | |
|---|---|
| `migrated` | **39** |
| `not_investigated` | **12** |
| `verdict_not_locatable_in_source` | **1** |
| `pending_migration` | **78** |
| **current / historical** | **130 / 28** |

**`109 = 26 migrated + 78 pending + 5 documented-deferred`** ✅ · **`137 = 109 + 28`** ✅

**Families across both layers:** `fam-perfect-laugh` 3 · `fam-rumi-unsourced` **2
(cross-layer)** · `fam-laotzu-adaptation` 2 · `fam-song-lyrics` 3 · `fam-teasdale` 2
· `fam-infinite-sphere` 1

**→ Batch 4: Chapter 4.**

---

# BATCH 4 — Chapter 4 · 2026-09-01

**`GATE PASSED`.** 5 active + 3 historical records. Zero `pending_migration` in
scope.

| Record | Verdict migrated |
|---|---|
| **Tagore** L606 | `VERIFIED EXACT` — *Sadhana* (1913) p. 109, the Gayatri passage. **`PUBLIC DOMAIN`**, and **no mediation layer**: Tagore wrote and translated *Sadhana* into English himself. **This resolves the standing "check, do not assume" flag on his English** |
| **C. Michael Smith** L620 | `UNVERIFIED — source lead unresolved`. **The concept is documented as his** on his own site; the manuscript's specific sentence is not located |
| **McKenna / 64 codons** L693 | `UNVERIFIED` with a **real source trail** — Hazard interview (Oct 1998), *In the Valley of Novelty* (Jul 1998). **Migrated with the open state intact** |
| **William James** *(historical)* | `MISATTRIBUTED` · `EVOLVED APHORISM`. Earliest related text is **Harry Granison Hill, *Cincinnati Enquirer*, 1928**, attributing the idea *to* James. Also misattributed to Schweitzer. **"of ANY generation" is a further variant** of the circulating "of MY generation" |
| **John Perkins** *(historical)* | `UNVERIFIED — source lead unresolved` |
| **Eckhart Tolle** *(historical)* | **`VERIFIED EXACT`** — attested on Tolle's own official channels. **Removed at 4A on redundancy, not provenance** |

## ⚠️ The conflict check fired — and it was my error

**`EA-Q-T023` (Perkins): existing `identity_unresolved` vs incoming `unverified`.**

**The tombstone was wrong, not the audit.** When I authored the 28 lifecycle records
I gave Perkins **an invented status derived from the 4A editorial note** — *"identity
unresolved"* — instead of transferring the **Stage 2 verdict**, which is
`UNVERIFIED — source lead unresolved`. The identity problem is a **bibliography
defect**, and it was already correctly recorded in `bibliography_relationship`.

**Fixed at the source, not at the check.** The tombstone now carries the audit's
verdict and a note recording the correction and how it was caught.

> **This is the first time a gate has caught an error I introduced rather than a
> schema gap.** It is also the failure the whole migration boundary exists to
> prevent: **an editorial observation quietly becoming a provenance verdict.** One
> invented status value, in one record, authored by me — and the cross-layer
> conflict check surfaced it three batches later.

## The Tolle record is the cleanest axis demonstration yet

**`VERIFIED EXACT` · `REMOVED`.**

Verified on the quoted author's own official channels — a strong evidence class —
**and removed anyway**, because the book already says *"Awareness is paramount"* in
its own voice. **Provenance said keep-able; editorial judgment said unnecessary.**

A single "reviewed" flag could not express that, and a system that treated
`VERIFIED` as a reason to retain would have kept it.

## Standing after batch 4

| | |
|---|---|
| `migrated` | **42** |
| `not_investigated` | **12** |
| `verdict_not_locatable_in_source` | **1** |
| `pending_migration` | **75** |
| **current / historical** | **130 / 28** |

**`109 = 29 migrated + 75 pending + 5 documented-deferred`** ✅ · **`137 = 109 + 28`** ✅

**→ Batch 5: Chapter 5 — the largest, at 30 censused occurrences.**

---

# BATCH 5 — Chapter 5 · the largest chapter · 2026-09-01

**`GATE PASSED`.** 21 active + 3 historical verdicts migrated. **Zero
`pending_migration` in Chapter 5.**

## ⚠️ Schema pressure — stopped on, not accommodated

**Two conflicts fired: `EA-Q-T004` (Rumi) and `EA-Q-T005` (Estés) — existing
`no_ancestor` vs incoming `unverified`.**

**Neither is an error.** They are **two verdicts from two stages**:

| Stage | Verdict |
|---|---|
| **Stage 2 census** | `UNVERIFIED` + `INTERNAL-ORIGIN CANDIDATE` |
| **Stage 3 ancestor check** | `NO ANCESTOR` — after a dedicated external search |

**That is supersession, not contradiction.** And the standing rule says **withdrawn
and superseded findings remain part of the evidence history** — so rejecting the
earlier verdict would have destroyed exactly what the rule protects.

**The schema had no provenance history.** Added: **`provenance_history`** — an
ordered list of `{verdict, stage, evidence_location, note, superseded_by}`.
`provenance_status` remains the **standing** verdict; the history records how it was
reached. **Gated:** every historical verdict must name what superseded it.

> **Fourth time the schema was too weak rather than the check too strict.** The
> pattern is now unmistakable: **the register keeps discovering that the work
> contains distinctions the model did not.**

## Findings worth surfacing from Chapter 5

**`SAME-AUTHOR DISTORTION` — Einstein.** The verified 21 March 1955 Besso letter
reads *"the separation between past, present and future has only the meaning of an
illusion, albeit a tenacious one."* **The circulating version changes the subject
from *time* to *reality*** — and **it is the changed meaning the chapter relies on.**

**`MISATTRIBUTED` — Drucker.** Origin is **Dennis Gabor**, *Inventing the Future*
(1963); **Alan Kay** coined the popular form and dates it to 1971. The Drucker
ascription, with *create* for *invent*, appears by 1986.

**`MISATTRIBUTED` — Foch.** Earliest documented ascription is an **American
divisional history published 27 years after his death.** No French primary source.

**`PARAPHRASE/ADAPTED` — Plutarch.** Source right, wording a modern contraction.
**His analogy is wood that needs igniting, not a fire to be kindled.**

**The honest-labelling specimen.** *"Adapted from Rumi, after Coleman Barks"* —
**the manuscript's own label is already correct.** This is the item every other
Barks case was measured against.

## Two of my Stage 4 "findings" were already in the census

**I should record this plainly.**

- **Salzberg / Mary Oliver.** My speaker sweep logged this as a *new lead*. The
  census had already closed it: ***"attributed to Sharon Salzberg — MISATTRIBUTED
  to Mary Oliver."***
- **Hotspur.** My sweep presented the speaker as a discovery. The census entry
  reads ***"VERIFIED EXACT — Hotspur, Henry IV Part 1, Act II sc. iii"*** — **and
  additionally caught that the bibliography cites *Part 2*, the wrong play.**

**Neither was new.** What the sweep genuinely added was **the editorial question** —
whether presenting Hotspur as Shakespearean wisdom distorts the passage. **The
provenance facts were on record the whole time.**

> **This is the third specimen of: having the data is not the same as knowing what
> question to ask of it.** And it is a caution about my own reporting: **I called
> both "new" without checking whether the census already held them.**

## Standing after batch 5

| | |
|---|---|
| `migrated` | **63** |
| `pending_migration` | **55** |
| `not_investigated` + `not_locatable` | **12** |
| **current / historical** | **130 / 28** |

**`109 = 50 migrated + 55 pending + 4 documented-deferred`** ✅ · **`137 = 109 + 28`** ✅

**Families now:** `fam-rumi-unsourced` **3** · `fam-perfect-laugh` 3 ·
`fam-song-lyrics` 3 · `fam-campbell` **2 (cross-layer)** · `fam-teasdale` 2 ·
`fam-laotzu-adaptation` 2 · `fam-rumi-barks` 1 · `fam-mckenna-unresolved` 1 ·
`fam-infinite-sphere` 1

**→ Batch 6: Chapter 6.**

---

# BATCH 6 — Chapter 6 · 2026-09-01

**`GATE PASSED`.** 11 active + 5 historical verdicts migrated. **Zero
`pending_migration` in Chapter 6.**

## Findings of note

**`MISATTRIBUTED` — Angelou.** *"Forgive yourself for not knowing what you didn't
know before you learned it."* **Snopes fact-checked it specifically.** The originator
is **Doe Zantamata**, who has described writing it. *(This was a `KEEP` recommendation
in 4A on editorial grounds — the migration shows its provenance is `MISATTRIBUTED`.
**Both facts stand; they answer different questions.**)*

**The Salzberg inversion pair.** *"You yourself, as much as anybody in the entire
universe, deserve your love and affection"* traces to **Sharon Salzberg**, *Woman of
Power* (1989) — **not the Buddha** — and **it reverses the sense of the Udāna
passage**, where the point is that others hold themselves dear too, so we should
extend regard *outward*. The popular version turns it inward. The audit pairs it
with the Oliver/Salzberg item — **one false credit, one missing credit** — with **the
two repairs determined independently, not forced to match.**

**The purest floating case in the audit.** *"Prasad Mahes"* — no book, no
publication, no dated utterance. **The name is left exactly as printed and
deliberately not normalised, per ruling.**

**Two positive controls.** *"Healer, heal thyself — adapted from Luke 4:23"* is
`PARAPHRASE/ADAPTED` **and correctly self-labelled; no repair required.** And
Chödrön preserves a **textual witness**: the manuscript includes *"It's just like
that."*, which the circulated online form drops.

**A narrowed uncertainty, recorded as such.** Thich Nhat Hanh:
**`ATTRIBUTION VERIFIED`; exact English / source-form unresolved** — two authentic
source trails, not one quotation with one obvious home.

## ⚠️ STOP — a pattern in my own tombstone authoring

**Two more conflicts fired, and neither was supersession.** Both were **wrong values
I authored**:

| Record | I wrote | Census says |
|---|---|---|
| **Gawain** | `unverified` | **`VERIFIED` wording · `WRONG SOURCE/WORK`** — from *Living in the Light* p. 217, **not** *Creative Visualization* as cited. Famous-work substitution again |
| **Alcott** | `verified_exact` | **`VERIFIED VARIANT`** — the manuscript carries the polished popular form. Also **spoken by Amy March**, a character-voice case **the census already recorded** |

**With Perkins in batch 4, that is three tombstone provenance values I authored
wrongly — and three of three that have been checked.**

### The integrity check, run now rather than deferred

**28 lifecycle records. The split matters:**

| | |
|---|---|
| **Stage 3 tombstones — 9** | verdicts genuinely **earned at Stage 3**; `no_ancestor` / `partial_ancestor` are correct and cite the Stage 3 record. **Legitimate.** |
| **Stage 4A tombstones — 19** | carry **Stage 2 verdicts** and must trace to the census |
| → traced | **10** |
| → **NOT yet traced** | **9 — the risk set** |

**The nine untraced:** Socrates · MLK · Gandhi · Ramana Maharshi · William James ·
**Shakespeare (`verified_exact`)** · Nehru · **Angelou (`verified_exact`)** · Tagore.

> **These are exactly the class already shown to be wrong three times out of three.
> I authored them from 4A editorial notes, not from the census.**

**And the conflict check cannot find them**, because nothing will collide with them:
their occurrences are removed, so no active-layer migration will ever contradict
them. **They would sit in the register looking earned, forever.**

**Recommendation: pull the tombstone integrity pass forward, before Chapter 7.** It
is nine records, hand-traced to the census — small, and the register is currently
carrying nine provenance verdicts I cannot vouch for.

## Standing after batch 6

**74 migrated · 44 pending · 12 deferred · 130 current · 28 historical.**
**`137 = 109 + 28`** ✅

**Families:** `fam-song-lyrics` **4** · `fam-campbell` **3** · `fam-rumi-unsourced` 3
· `fam-perfect-laugh` 3 · `fam-teasdale` 2 · `fam-laotzu-adaptation` 2 · plus 5
singletons.

**→ HOLDING for authorisation: tombstone integrity pass (9 records), then Chapter 7.**

---

# TOMBSTONE INTEGRITY PASS — 19 Stage 4A records · 2026-09-01

**Narrowly bounded as authorised: trace → compare → correct authoring errors only →
preserve the census verdict even where it now looks questionable → record evidence
location → gate the full 19.** **No new investigation. No Stage 4 reconsideration.
No manuscript changes.**

## Result — better than the failure rate predicted

| | |
|---|---|
| **Confirmed correct** | **8 of 9** |
| **Corrected** | **1** — Angelou, `verified_exact` → **`verified_variant`** |

**The 3-of-3 failure rate was not representative, and I should say so plainly.**
Perkins, Gawain and Alcott were wrong; the nine untraced records were **almost all
right.** The correct conclusion is **not** *"the tombstone method was broadly
unreliable"* — it is *"the method produced occasional unearned values, and there was
no way to tell which without tracing."*

**Which is the actual point.** The problem was never the error rate. **It was that
the register could not distinguish an earned verdict from a plausible one.**

**The Angelou correction is instructive:** `VERIFIED VARIANT`, not `VERIFIED EXACT`
— *"a **spoken** saying with several recorded phrasings, so variant rather than
exact."* **My value was not wrong about whether Angelou said it. It was wrong about
what kind of verification had been achieved** — the distinction between a fixed
printed text and a transmitted spoken line.

## What the nine turned out to hold

- **Socrates** — `COMPOSITE ATTRIBUTION`. The second sentence is **Robert C.
  Solomon**, *Introducing Philosophy* (1989) — **his gloss on Socrates.** The
  epigraph fuses a paraphrase with a modern commentator's description and credits
  both to Socrates.
- **MLK** — `UNVERIFIED`. Earliest published evidence is 1986, eighteen years after
  his death. **Marian Wright Edelman states she heard the metaphor from him** —
  credible oral testimony, but not a located source. *The census kept both facts.*
- **Gandhi** — the census **records its own correction**: initially listed among
  quotations "sound as attributed," later found unverified.
- **Nehru · Tagore · Ramana Maharshi** — all `UNVERIFIED`, and **all three carry a
  probable `WRONG SOURCE/WORK`** flag on the bibliography axis. Tagore's is the
  sharpest: the bibliography cites *The Home and the World* (1919), **a novel**, for
  a philosophical aphorism.
- **Shakespeare** — `VERIFIED EXACT`, *Hamlet* I.iii, **Polonius**, bibliography
  correct. **The speaker was in the census from the start.**

## The gate, strengthened — and one vacuous pass caught

**Five new checks**, all passing across the full 19: every Stage 4A tombstone
verdict cites a **Stage 2** evidence location · **no verdict originates solely from
a Stage 4 editorial note** · corrections appear in `provenance_history` rather than
being silently reconciled · editorial removal status untouched · bibliography and
rights remain on their own axes.

**⚠️ The corrections check passed vacuously on its first run** — *"0 corrected
record(s)"* — because the tombstone loader **was silently dropping
`provenance_history`**, and `all()` over an empty list is `True`.

**Two bugs, one symptom:** a data-loss bug in the loader, and **a gate that reported
success for finding nothing.** Both fixed — the loader now carries the history, and
the check fails if it finds zero corrections when at least one is known.

> **A check that cannot fail is not a check.** Worth more than the bug it caught:
> **vacuous truth is the quietest way a gate degrades into decoration.**

## The rule this establishes

> ### A value is not trustworthy because it is plausible, internally consistent, or conflict-free. It is trustworthy because its evidence lineage is recoverable.

**A contradiction detector asks *"does anything disagree with this?"*
An integrity check asks *"what earned this?"***

**These are different questions and a system needs both.** The nine were
conflict-free by construction — nothing downstream could ever contradict them —
**and one was wrong.**

**And it generalises past quotations:** claims, citations, developmental findings,
remembered author preferences, and **MAIA's own prior conclusions.** *A system must
not be able to turn "I inferred this earlier" into "the record establishes this."*

## Standing

**All 19 Stage 4A tombstones are now vouched, not merely the nine.**

**74 migrated · 44 pending · 12 deferred · 130 current · 28 historical.**
**`137 = 109 + 28`** ✅ · **`GATE PASSED`**

**→ Chapter 7.**

---

# BATCH 7 — Chapter 7 · 2026-09-01

**`GATE PASSED`.** 13 active verdicts migrated. **Zero `pending_migration` in
Chapter 7.** The three Chapter 7 historical records (Gandhi, Ramana Maharshi,
Nehru) were **vouched in the integrity pass** and were not re-migrated.

## The chapter with the most floating attributions

**Chapter 7 carries the book's densest concentration of unlocatable sources.**

**Two `FLOATING APHORISM` cases where the attributed name itself has no locatable
existence** — *"Robert C. Peale"* (the pharmacy line) joins *"Prasad Mahes"* from
Chapter 6 as the **second instance of that severity characteristic.** No biography,
no work, no publication; circulation confined to wellness quote lists.

**`God is in the details`** — three competing attributions across three languages,
**none established.** Mies comes from his *New York Times* obituary and is generally
accepted as a **user, not the originator**; Aby Warburg's German form is a competing
candidate. Bibliography `MISSING`.

**`UNSUPPORTED CULTURAL ATTRIBUTION` — the "Chinese Proverb".** Not Chinese in any
documented sense. Earliest strong match is **Cleveland city councilman George W.
White**, *Cleveland Plain Dealer*, 1967 — **who disclaimed credit.** The "Chinese
proverb" label first appears in a **Nebraska newspaper in 1985.**

## Three findings that sharpen existing patterns

**Santayana — closed by an authoritative source, not by absence.** The **Santayana
Edition** (Indiana University's critical edition) published *"Citation and the
Challenges of Misattribution"* **specifically on this line**, and found no sign of it
in his works. **That is a different evidentiary class from "not located"** — a
dedicated scholarly denial rather than a failed search.

**Van der Kolk — an object-type question, not an attribution failure.** *"The body
keeps the score"* — **the attribution is sound; what is unresolved is what kind of
object is being quoted.** It is the **book's title**; a genuine sentence of that
wording in the text is **not established**. The census separated three possible
provenance objects and declined to collapse them.

**MLK — same author, opposite outcomes.** *"The function of education…"* is
**`VERIFIED EXACT`**, confirmed against the **King Institute at Stanford**. The
removed *"Faith is taking the first step"* was `UNVERIFIED`. **Ruled individually,
as the retired author-set doctrine requires.**

## Two spoken-saying specimens now agree

**Helen Keller's *"Alone we can do so little"*** is `VERIFIED VARIANT` for **exactly
the reason Angelou's was corrected to variant**: a **spoken** line with documentary
evidence — Joseph P. Lash, *Helen and Teacher* (1980), placing it in the early-1920s
vaudeville performances — but no fixed printed original.

**That is now a consistent rule across the register**, and it was arrived at from
two directions: the Keller verdict was already right in the census; the Angelou
verdict I had authored wrongly and the integrity pass corrected. **Spoken
transmission yields `VERIFIED VARIANT`, not `VERIFIED EXACT`.**

## Standing after batch 7

**87 migrated · 31 pending · 12 deferred · 130 current · 28 historical.**
**`137 = 109 + 28`** ✅

**Families:** `fam-floating-aphorisms` **2 (new)** · `fam-mckenna-unresolved` **2** ·
`fam-song-lyrics` 4 · `fam-campbell` 3 · `fam-rumi-unsourced` 3 · `fam-perfect-laugh`
3 · `fam-laotzu-evolved` **1 (new)** · plus 6 others.

**→ Batch 8: Chapter 8.**

---

# BATCH 8 — Chapter 8 · 2026-09-01

**`GATE PASSED`.** 18 active + 1 historical family link. **Zero `pending_migration`
in Chapter 8.**

## ⚠️ A misattributed quotation survives in the manuscript

**`fam-know-thyself` now spans both layers, and the finding is uncomfortable:**

> ***"Knowing yourself is the beginning of all wisdom" — Aristotle.*** **The Chapter
> 6 occurrence was removed at 4A. The Chapter 8 occurrence is still in the book.**

**Same saying, verbatim, same attribution, same `MISATTRIBUTED` verdict.** It
survives because **4A's scope was section-opening epigraphs**, and the two
occurrences differ in function — one opened a section, the other does not.

**This is not a 4A error.** The scope was correct and the ruling was correct for
what it covered. **But the manuscript currently contains a quotation the register
knows to be misattributed, at a location no completed pass has examined.** The
family link is now in place so the surviving occurrence cannot be lost sight of at
4C.

**It is also the strongest argument yet for the register.** Nothing in the
chapter-by-chapter workflow would have surfaced this — **it took cross-layer
family linking to see that one half of a pair had been repaired and the other had
not.**

## The narrowed spoken-transmission rule — corrected

**My previous formulation was too broad.** *"Spoken transmission yields
`VERIFIED VARIANT`"* would wrongly downgrade a recorded speech, interview, or
contemporaneous transcript. The accurate rule:

> **When provenance rests on reported or recollected spoken transmission *without a
> fixed primary recording or transcript*, classify the wording as `VERIFIED
> VARIANT`, not `VERIFIED EXACT`.**

**That preserves the evidentiary reason** — the absence of a fixed primary — **rather
than turning two specimens into a rule about speech itself.** Keller and Angelou
both qualify on the *evidence*, not on the *medium*.

## Findings of note

**Feynman → Haldane.** `MISATTRIBUTED` · `SOURCE DISPLACEMENT`. Origin is **J. B. S.
Haldane, *Possible Worlds* (1927)**. Ascriptions to Heisenberg, Eddington and
Priestley are all post-1927 and spurious. **Recorded in the census as the specimen
where verification had to overturn the auditor's own prior** — I had believed the
line was Heisenberg's.

**A second bare-byline Barks.** *"Out beyond ideas of wrongdoing and rightdoing"* is
**Barks with John Moyne, © 1995**, and **a loose rendering, not a translation** —
Barks renders *kufr* and *islām* as "wrongdoing" and "rightdoing." **`LIKELY
PROTECTED · HIGH`**, under a bare byline. Contrast Ch5's correctly labelled
*"Adapted from Rumi, after Coleman Barks."*

**Shaw splits again.** *"Beware of false knowledge"* is `VERIFIED VARIANT` — genuine
*Man and Superman* (1903) — while the Ch8 communication line was reattributed to
**Whyte**. **Two Shaw occurrences, opposite outcomes.**

**Hawking → Megginson.** No evidence Hawking said it; the *Washington Post*
investigated the attribution specifically (2018). The nearest ancestor is a **Leon
C. Megginson paraphrase of Darwin (1963)** that later hardened into a pseudo-Darwin
quotation.

**Two auditor self-corrections migrated intact:** the Jenkins internal-origin flag
**withdrawn** once an external source trail appeared (*The Hard Way*, 2003), and the
Bennett **suspicion-by-genre withdrawn** — he had been doubted because his book is
an aphorism collection.

## Standing after batch 8

**105 migrated · 13 pending · 12 deferred · 130 current · 28 historical.**
**`109 = 92 + 13 + 4`** ✅ · **`137 = 109 + 28`** ✅

**→ Batch 9: Chapter 9, then Chapter 10 and back matter.**
