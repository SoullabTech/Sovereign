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

---

# BATCH 9 — Chapter 9 · 2026-09-01

**`GATE PASSED`.** 10 verdicts migrated + the downstream obligation attached to the
surviving Aristotle occurrence. **Zero `pending_migration` in Chapter 9.**

## The asymmetric-repair check now runs in the gate

> **When one member of a provenance family receives a repair, inspect the family for
> surviving occurrences that share the same defect.** *Not "apply the same repair
> everywhere" — their editorial functions may differ. Surface them together for
> judgment.*

**Implemented and immediately productive. Three families are asymmetrically
repaired:**

| Family | Survives with the same defect class |
|---|---|
| **`fam-know-thyself`** | **`EA-Q-0098`** — the Aristotle occurrence, now carrying **"KNOWN PROVENANCE DEFECT REMAINS ACTIVE IN MANUSCRIPT — requires Stage 4C adjudication"** |
| **`fam-rumi-unsourced`** | **`EA-Q-0007`** (Preface) and **`EA-Q-0026`** (Ch5) — two unsourced Rumi occurrences survive; a third was removed at 4A |
| **`fam-campbell`** | **`EA-Q-0031`** and **`EA-Q-0053`** — two `PARAPHRASE/ADAPTED` Campbell contractions survive; a third was removed at 4A |

**I had found one of these by hand. The check found two more.** None is a defect in
any prior ruling — each removal was correct within its own scope — but **the book
currently carries five occurrences whose family twins were repaired elsewhere.**

## Chapter 9 findings

**A second cultural attribution dissolves.** *"Sioux Legend"* — **no documentation of
Sioux origin.** The line circulates in **contemporary Christian devotional
literature** (Patheos, Dynamic Catholic, Matthew Kelly, Lenten reflections) while
standard collections of actual Sioux material do not carry it.

**The Emerald Tablet pair.** Chapter 9 quotes it **accurately and without the
Kybalion extension**; another chapter carries the **composite modern-extended form**.
**The book holds both the accurate ancient form and the corrupted one, one chapter
apart** — the same shape as the Barks case, where one occurrence is honestly
labelled and another is not.

**Two Blake occurrences from one work**, and only one is attributed: *"the doors of
perception"* is `VERIFIED EXACT` with a correct bibliography entry, while *"If a
fool persists in his folly"* is presented as **an anonymous saying**. **Same book,
opposite defects.**

**A composite of genuine elements.** The C. Michael Smith daimonion line: *"inner
axis mundi," "Dream Maker" and "Daimon" are **all documented as his**, but **the
combined sentence was not located.*** Genuine parts, unlocated whole.

**Watts splits.** Ch2 `VERIFIED EXACT`; Ch9 `VERIFIED VARIANT` — the published text
reads *"It must be obvious, **from the start**, that…"* **Same author, different
verdicts, ruled individually.**

**Coelho is a mediated translation** — the English is **Alan R. Clarke's (1993)**,
not Coelho's Portuguese. That now sits on the same record as the Stage 4 speaker
finding (**Melchizedek**), so one record carries **author · translator · internal
speaker** as three separate facts.

**All three Gabriel songs identified** — "Growing Up," "Darkness," "Signal to Noise,"
all from *Up* (2002). **No further identification needed; all remain in permissions.**

**Chapter 9's bibliography is the best-matched in the book** — every quoted author
checked has a correct entry with the right work.

## Standing after batch 9

**115 migrated · 5 pending · 12 deferred · 130 current · 28 historical.**
**`109 = 101 + 5 + 3`** ✅ · **`137 = 109 + 28`** ✅

**22 families; 5 spanning both layers; 3 flagged asymmetric.**

**→ Final migration batch: Chapter 10 + back matter (5 pending).**

---

# BATCH 10 — Chapter 10 + back matter · FINAL MIGRATION BATCH · 2026-09-01

# ✅ HISTORICAL MIGRATION COMPLETE — `pending_migration: 0`

**`GATE PASSED`.** All 5 remaining verdicts migrated. **Every Stage 2 verdict the
census earned now lives in the register, traced to its evidence.**

## The last five

**Korzybski** — `VERIFIED VARIANT`. *Science and Sanity* (1933) p. 58 reads *"**A**
map is not the territory it represents, **but, if correct, it has a similar
structure to the territory, which accounts for its usefulness.**"* **The manuscript
carries the standard compressed form**, and the census flagged it as a
**`SOURCE RESTORATION OPPORTUNITY`** — the fuller sentence says more than the
compression does.

**The Hermetic composite.** `COMPOSITE ATTRIBUTION` — **third confirmed instance** —
plus `SOURCE-FORM MISCLASSIFICATION`. *"As within, so without. As above, so below."*
**The two halves are separated by roughly eleven centuries.**

**Duchamp — the inverse of the Sai Baba case, and the census said so explicitly.**
His alchemical preoccupations **are** scholarly-documented (Moffitt, *Alchemist of
the Avant-Garde*), which **supports the theme, not the sentence**. Sai Baba's
documented framework initially looked *contradicted* and turned out compatible; here
the documented preoccupation makes the sentence **plausible** — *"which is exactly
why it must not be treated as verified."*

> **Thematic fit is not provenance, in either direction.**

**McKenna closes at 5 of 5 `UNVERIFIED`** — and the census's own correction travels
with the final row: ***a uniform verdict is not a shared transmission mechanism***,
and it had collapsed the two.

**St. John of the Cross** — `VERIFIED VARIANT`, *Sayings of Light and Love* 57, also
in the *Catechism* §1022. `MEDIATED TRANSLATION`, translator unidentified.

## Family lineage — implemented

**The Emerald Tablet pair forced it.** A family is **not always a set of
duplicates**; it can be a **lineage**:

| | |
|---|---|
| **`EA-Q-0108`** (Ch9) | **`ancestor`** — the accurate Emerald Tablet form |
| **`EA-Q-0122`** (Ch10) | **`composite_descendant`** — fused with a half eleven centuries later |

**`family_role` now runs in the gate.** *The book contains the true form and its
corruption, one chapter apart, and the register can now say which is which.*

---

# HISTORICAL MIGRATION — FINAL RECONCILIATION

| Current semantic field | |
|---|---|
| active block epigraphs | **109** |
| inline attributed | **19** |
| unattributed boundary records | **2** |
| **current records** | **130** |

| Review state | |
|---|---|
| `migrated` | **120** |
| `not_investigated` | **9** — the newly discovered objects and boundary spans |
| `verdict_not_locatable_in_source` | **1** — Berry, with a recovery note |
| **`pending_migration`** | **0** ✅ |

| Historical lifecycle | |
|---|---|
| `removed` | **24** |
| `reclaimed_as_author_prose` | **4** |
| **block lifecycle** | **137 = 109 active + 28 inactive** ✅ |

**Attributed quotation occurrences ever identified: 156** — 137 historical block +
19 inline — **plus 2 unattributed boundary objects held separately.**

**22 families · 5 cross-layer · 3 asymmetric · 1 lineage pair.**

## What the migration cost and produced

**Ten batches. Six schema extensions, every one forced by the data:** per-axis
review states · documented deferral · `verdict_not_locatable_in_source` ·
`provenance_history` · family lineage roles · the asymmetric-repair check.

**Four authoring errors of my own, all caught by gates**, not by review: Perkins,
Gawain, Alcott, Angelou. **Three surfaced by cross-layer conflict; one by the
integrity pass.** The nine records no collision could ever reach were **8 of 9
correct** — which is why the integrity check had to exist independently of the
contradiction check.

**Three findings no chapter-bounded process could have produced:** a misattributed
Aristotle surviving where its twin was removed · two more asymmetric families the
check found after I found one by hand · the Emerald Tablet ancestor and its
composite descendant sitting one chapter apart.

> **The manuscript renders quotations. The register knows what they are.**

## What remains — not migration

1. **Verify the newly discovered objects** — 6 attributed inline items found by the
   first-principles scan, still `not_investigated`.
2. **Rule the 2 unattributed boundary cases** — a scope question, not a verdict.
3. **Freeze the semantic population.**
4. **Adjudicate the complete inline field** — 12 verified, awaiting Stage 4.
5. **4B proper**, then **4C** — which now inherits three explicit asymmetric-repair
   obligations.

---

# BOUNDARY RULINGS + MIGRATION GAP CLOSURE · 2026-09-01

## The two boundary objects — ruled from context, no source hunting

### L519 → **`AUTHORIAL_VOICED_SPEECH`** · outside the census

> *"Unlike a straight line, **which suggests that** 'if we were good, we would keep
> growing in a direct and unbroken, upward fashion,' the spiral works in cycles."*

**The quotation marks voice a proposition implied by a position** — the assumption
the linear model makes — **which the author states in order to reject it.** It is
attributed to a **view**, not to a person.

**No speaker is claimed and none is missing.** There is nothing to verify, because
nothing was cited. Outside the attributed-quotation census.

### L1686 → **`UNATTRIBUTED_EXTERNAL_QUOTATION`** · enters the workflow

> *"I think therefore I am" reflects our **collective** existence through **shared**
> thoughts.*

**The formulaic-language exemption does not apply.** The book does **not** use the
cogito proverbially — **it reinterprets it**, redirecting Descartes's individualism
outward into the collective. **That move only lands if the reader knows whose
position is being turned.** It is genuinely his sentence, quoted verbatim, with the
attribution absent.

**And it has a paired object.** The book coins its **own counter-formula** later in
the same chapter — *"I know therefore I am"* — which stays **excluded as authorial
coinage**, but is now recorded as the **authored response to this ancestor**.
`fam-cogito`, role `ancestor`.

> **A family can hold a source and the book's answer to it, not only a source and
> its corruptions.**

## ⚠️ Two migration gaps found while triaging the queue

**"Historical migration complete" was premature by two records.**

**Peter Gabriel L707** and **Leonard Cohen L1211** carried **rights and editorial
status** from the session control set, and **I treated them as fully handled.** Both
had **census provenance verdicts that were never migrated.**

**The Cohen verdict is not minor:**

> `VERIFIED VARIANT` — the actual lyric is *"There is a crack, **a crack** in
> everything / That's how the light gets in"*; **the manuscript drops the
> repetition.** And **`WRONG SOURCE/WORK`, which changes the rights profile
> entirely**: the bibliography cites *Selected Poems, 1956–1968* (Viking, 1968), but
> the line is from **"Anthem," on *The Future* (1992)** — a **song, twenty-four
> years later.** Not a poem excerpt. **`LIKELY PROTECTED · HIGH`.**

**This also corrects my own earlier claim.** During the speaker sweep I reported the
Cohen lyric as a **rights reclassification I had noticed** — *"four song lyrics, not
three."* **The census had already found it, and had found more than I did:** the
dropped repetition, the wrong work, and the source-form misclassification driving
the rights change.

> **Fourth instance of the same pattern: I presented as new something the record
> already held.** The register is what makes that visible each time.

## Standing

| Review state | |
|---|---|
| `migrated` | **121** |
| `not_investigated` | **7** — the verification queue |
| `ruled_out_of_scope` | **1** |
| `verdict_not_locatable_in_source` | **1** |
| **total** | **130** ✅ |

**`GATE PASSED`.** The *"editorially ruled with provenance still open"* note is now
**0** — both records that produced it are closed.

**The verification queue is 7, not 6:** the six newly discovered inline objects
**plus Descartes**, which the boundary ruling admitted.

**→ Verify the seven. Then freeze.**

---

# STAGE 2d — final provenance queue · 7 records · 2026-09-01

**Every finding carries an explicit novelty class**, per the standing rule that
*new to the current investigation is not necessarily new to the record.*

| Record | Verdict | Novelty |
|---|---|---|
| **Goethe** *(the "saying")* | `PARAPHRASE/ADAPTED` — **recoverable ancestor found** | **`NEW EVIDENCE`** |
| **Descartes** | `VERIFIED EXACT` — *Discourse on the Method* (1637) | **`CONFIRMS EXISTING RECORD`** |
| **Laozi, TTC 33** | `VERIFIED VARIANT` — rendering unidentified | **`NEW EVIDENCE`** |
| **Dr. Baskaran Pillai** | `VERIFIED EXACT` — quoted-author's-channel | **`NEW EVIDENCE`** |
| **Hermes Trismegistus** | `UNVERIFIED` — *Divine Pymander* lead open | **`NEW EVIDENCE`** |
| **Lao Tzu** *(interrupted)* | `UNVERIFIED` — **not a Tao Te Ching passage** | **`NEW EVIDENCE`** |
| **Teasdale** *(Conclusion)* | `UNVERIFIED` — *The Mystic Heart* lead open | **`NEW EVIDENCE` for the object · `CONFIRMS` the family pattern** |

## The find of the pass — three defects in one anonymous line

**"The greater the light, the deeper the shadow"** is presented as **"There is a
saying:"** It has a **recoverable ancestor**:

> **Goethe, *Götz von Berlichingen*, Act I (1773)** — *"Wo viel Licht ist, ist
> starker Schatten."*

**Three findings travel together in a line the manuscript attributes to nobody:**

1. **`UNDER-ATTRIBUTED`** — a real author reduced to an anonymous saying. **Same
   class as the Blake *Proverbs of Hell* item.**
2. **The ancestor is a play** — the line is **spoken by a character**, not stated by
   Goethe. `internal_speaker` applies, as with Polonius, Satan, Hotspur, Amy March
   and Blake's devil.
3. **The English is an evolved variant**, matching no standard translation.

## Teasdale — the pattern the family made visible

**Identical verdict shape to the Chapter 8 item**: real author, thesis matches
*exactly*, sentence not located. **Which is precisely why it cannot be verified.**

> **Thematic fit proves nothing** — and the tighter the fit, the more carefully that
> rule has to hold.

**Two of three Teasdale occurrences are now unverified.** Only the Chapter 10 opener
— the `KINSHIP + DIALOGUE` epigraph — has a closed source.

## One sequencing defect, and it was not schema pressure

**The Descartes verdict was silently overwritten.** The boundary ruling that
*admitted* the object to the workflow ran **after** verification, resetting it to
`not_investigated`.

**Ordering, not modelling.** Fixed structurally: **ontology rulings now run before
verification**, so *what kind of object this is* can never overwrite *what we found
out about it.*

> ### And the answer to the question this pass was set to test: **all seven fit the existing model. No schema extension was required.**

**After six extensions in ten migration batches, ordinary provenance work now lands
in the register without deforming it.** That is the maturity evidence we were
looking for.

---

# ✅ WHOLE-BOOK QUOTATION POPULATION FROZEN

**All ten freeze criteria pass.**

| | |
|---|---|
| current semantic records | **130** |
| `migrated` | **128** |
| `ruled_out_of_scope` | **1** — the voiced proposition |
| `verdict_not_locatable_in_source` | **1** — Berry, **with a recovery note** |
| `pending_migration` · attributed `not_investigated` | **0 · 0** |
| historical lifecycle | **28** — 24 removed, 4 reclaimed as prose |
| block lifecycle | **137 = 109 active + 28 inactive** |
| documented non-quotations | **9** |
| families | **25**, across both layers |

**The word means something different from the earlier census closure.**

**Not:** *"our detector found everything."*
**But:** **every quotation-like object in the canonical manuscript has been
semantically reconciled into, or explicitly excluded from, the register — and every
identity carries an explicit state.**

**That is a defensible closure criterion, and it is the first one this project has
had.** Four separate times a detector reported a complete population and was wrong.
**The freeze does not rest on a pattern; it rests on reconciliation.**

## What the whole provenance effort produced

**156 attributed quotation occurrences ever identified** — 137 historical block + 19
inline — **plus 2 unattributed boundary objects, ruled individually.**

**Every one now has:** a stable identity that survives revision · an explicit
provenance verdict or a documented reason it lacks one · independent rights and
editorial axes · recoverable evidence lineage · family relationships including
lineage roles · and, where superseded, its own verdict history.

**→ Stage 4 adjudication of the complete inline field, with family context beside
each record. Then 4B, then 4C.**

---

# STAGE 4I — scoped from the frozen register · 2026-09-01

**Every inherited numerical label is retired.** *"The eight," "the twelve," "the six"*
— all were true when spoken and none survived the population changing under them.
**The register is now queried instead.**

## The authoritative population

**Query: `current` + `inline` + `in-scope` + no completed Stage 4 editorial ruling.**

> ### 19 records.

**Plus 1 control specimen** — the Jung chemical-substances passage, already
adjudicated and author-adopted. **It appears beside the population as the worked
example, not as an item to reopen.** **1 record is out of scope** (the voiced
proposition).

## ⚠️ The pass structure cuts across two families

**Found by checking the query rather than trusting it.** *(My first family display
mislabelled block records as "ruled" when they were merely outside the inline
filter. The label was wrong; the population was right — and correcting the label
exposed something the population alone would not have shown.)*

| Family | The split |
|---|---|
| **`fam-perfect-laugh`** | **two occurrences in 4I** · **one in 4C** — the block Buddha at L1899, **still `unadjudicated`** |
| **`fam-teasdale`** | **one in 4I** · **one ruled at 4A** (the Chapter 10 kinship epigraph) · **one in 4C**, still `unadjudicated` |

**The fake-Buddha saying cannot be adjudicated "all three together" inside 4I**,
because its third occurrence is a **block epigraph that is not a section opening** —
so it fell outside 4A's scope and sits in 4C's.

> **The pass structure is functional (openings / inline / mid-prose). Families are
> semantic. The two do not align, and they were never going to.**

**This is the same lesson as the surviving Aristotle, one level up:** a
*correctly-scoped pass* can still leave a family half-treated. There the cut was
between removed and surviving; here it is **between passes.**

### Proposed resolution — for your ruling, not applied

**Admit the two split-family block records into 4I as family context**, so the
Buddha trio and the Teasdale trio are each ruled in one sitting. **They keep their
own occurrence-level rulings** — *family membership requires shared inspection, not
shared outcome* — and they simply do not come round again at 4C.

**The alternative** — rule the 4I members now and the block siblings later — **is the
exact failure mode the register was built to prevent.** I would rather widen the
pass by two records than adjudicate half a family twice.

## The population, with what each turns on

**Cross-manuscript obligations first:**

| | |
|---|---|
| **L47 · L190** *(+ L1899 if admitted)* | the fake-Buddha saying, **two wordings, three occurrences** |
| **L2262** *(+ L1656 if admitted)* | Teasdale — **thematic fit cannot substitute for provenance** |

**Then the high-information specimens:**

**L978 Blake** — under-attribution **+** unreliable speaker · **L926 Goethe** —
under-attribution **+** dramatic speaker **+** evolved translation · **L1752
Milton/Satan** — speaker context may **strengthen** the passage · **L1746 Jung** —
host-aligned alteration, where correcting the quote **exposes a claim the book must
decide whether to make** · **L1951 John 17** — **false precision, true idea** ·
**L1867 Lao Tzu/Waley** — editorial value against substantial rights exposure ·
**L1686 Descartes** — **authored response**, genuine dialogue rather than
certification · **L2382 Clayton** — personal communication, consent not permissions.

**And the remainder:** Hermes · Miles Davis · the interrupted Lao Tzu · Tart ·
Kierkegaard · Pillai · TTC 33 · Frank Lloyd Wright.

## The Stage 4 question, unchanged

> ### What is this outside voice doing here, and does the book need it to do that work?

**Actions:** `KEEP` · `CORRECT` · `CONNECT` · `REFRAME` · `RECLAIM` · `REMOVE` ·
`DEFER`
**Function, recorded separately:** `KINSHIP` · `DIALOGUE` · `ILLUMINATION` ·
`HISTORICIZATION` · `CHALLENGE` · `CERTIFICATION`

> **No provenance verdict decides the editorial ruling automatically.** A genuine
> quote can still be removed. A misattributed thought can be retained after
> correction. A corrupted quote may reveal the real claim belongs in the author's
> voice. A literary speaker may become *more* useful once their dramatic context is
> restored.

## For the record — the 4C population is 96

**Block records still unadjudicated: 96.** 13 block records carry 4A rulings. **4C
is by far the largest remaining editorial pass**, and it now has an exact size for
the first time.

---

# STAGE 4I — WIDENED TO 21 · family-aware view built · 2026-09-01

## The governing rule

> **When an active semantic family crosses a pass boundary, family integrity may
> override the typographic boundary for unadjudicated members. Previously
> adjudicated members are shown as context, not reopened.**
>
> **And unchanged: family membership requires shared inspection, not shared
> outcome.**

**4I: 19 → 21. 4C: 96 → 94.** Both moved records carry an explicit
`pass_override` recording why. **Neither returns at 4C.**

> **4A / 4I / 4C are editorial workflows. They are not truths about the manuscript.**
> Where following them literally would split one semantic question into two
> disconnected decisions, **the workflow bends and the register does not.**

## The two families that forced it

### `fam-perfect-laugh` — three occurrences, one shared failure

| | Location | Function |
|---|---|---|
| **L47** | **Disclaimer** — front matter | closes a statement of the author's aspiration |
| **L190** | **Call to Adventure** | stands alone |
| **L1899** | **Mind-Body Coherence: The Aetheric Way of the Heart** — Ch9 | block epigraph, **different wording** |

**Shared evidence, stated once:** no canonical source · earliest trace a 2001 Usenet
post where it was posted as *"Buddhist,"* not as the Buddha · **the manuscript
carries two different corrupt versions of one spurious saying** · possible ancestor
in **Longchenpa**.

**Three separate rulings owed**, because the locations do different work — a
front-matter aspiration, a bare epigraph, and a chapter-section opening. **The
question at each is the same and the answer need not be:** *does this location need
the underlying thought at all, and if so — restored to a genuine ancestor, reclaimed
in the author's voice, reframed, or removed?*

### `fam-teasdale` — and why this is not an author-set judgment

| | | |
|---|---|---|
| **A · L1984** | **SETTLED, read-only** | `KEEP · PHILOSOPHICAL KINSHIP + DIALOGUE · RIGHTS HOLD` — with the author-adopted frame beneath it |
| **B · L1656** | 4I, awaiting ruling | `UNVERIFIED` — *Refining the Air of Mindful Communication* |
| **C · L2262** | 4I, awaiting ruling | `UNVERIFIED` — the **Conclusion** |

**The settled item is doing the important work here.** It proves the question is not
*"do we like Teasdale?"* — one occurrence already earned its place on kinship
grounds. **So the question at B and C becomes unavoidable and specific:**

> ### Why does Teasdale belong *here*?

**And the two unruled occurrences are both `UNVERIFIED`** while the settled one is
`VERIFIED EXACT`. **Same author, three occurrences, three different evidentiary
positions.**

## The remaining population

**Three more families with a single 4I member** — `fam-cogito` (Descartes,
`authored_response` pairing) · `fam-laotzu-genuine` (TTC 33) · `fam-under-attributed`
(Goethe).

**Thirteen single occurrences**, each turning on a named question: Hermes ·
**Blake** *(under-attribution + unreliable speaker)* · Miles Davis · the interrupted
Lao Tzu · Tart · Kierkegaard · **Jung belief→experience** *(host-aligned
alteration)* · **Milton/Satan** *(speaker context may strengthen)* ·
**Lao Tzu/Waley** *(editorial value against high rights exposure)* · **John 17**
*(false precision, true idea)* · Pillai · Frank Lloyd Wright · **Clayton**
*(consent, not permissions)*.

**Plus the control specimen** — the Jung chemical-substances passage, already
author-adopted. **Shown, not reopened.**

## The member-facing form of this move

**No one needs to know two records moved from `4C` to `4I`:**

> *"You use this source in three places. One has already been resolved. The other two
> do different jobs, but reviewing them together may help you decide what
> relationship you want this voice to have with your book."*
>
> **[ Review together ]**

**That is the translation layer applied to the family-crossing-pass logic** — and it
is the honest form, because *reviewing together* is exactly what the system is
proposing, not *ruling together*.

---

# 4I · FAMILY CARD 1 — `fam-perfect-laugh` · the Buddha trio

## ⚠️ HOLD — the context changes the question at two of the three

**Reading the passages in full, as the family card required, surfaced a structural
fact the register could not see: L47 and L190 are not two uses of one saying. They
sit inside a near-duplicated passage.**

| Front matter · **Disclaimer** | Call to Adventure |
|---|---|
| *"This book is a collection of interconnected insights, conversations, and experiences I wish had been shared with me when I started my journey of awakening…"* | **same opening, 0.61 similarity** |
| *"While my goal is to honor your path and offer support, nothing replaces your own experiences… especially the poets and mystics."* | **same paragraph, expanded to "the shaman, poets…"** |
| *"I aspire to offer guidance and support… **As the Buddha says,** …"* | **same, 0.54 — and the same quotation** |
| *"Take what resonates, leave what doesn't, and may your path be illuminated with joy, laughter, and profound insights."* | ***identical — similarity 1.00*** |

**The quotation appears twice because the disclaimer appears twice.** The saying is
not doing two jobs in two places; **it is riding along inside a passage the book
prints twice, once as front matter and once inside Chapter 1.**

> **This is not a quotation problem. It is a manuscript-structure problem that
> happens to duplicate a quotation** — and it is **outside 4I's remit.**

**I am not ruling L47 and L190 as separate editorial questions**, because framing
them that way would silently accept a duplication no one has decided to keep.

**Recorded for structural review, not repaired.** The prior question is: *should the
disclaimer appear twice at all?* Once that is settled, the quotation ruling at the
surviving location follows in one decision, not two.

**Also noted:** the Call to Adventure section carries **both** Buddha items — this
saying **and** the Kalama Sutta quotation, which has its own `WRONG TRANSLATOR
CITED` defect. **Three Buddha attributions in one short section, two of them
defective.**

---

## Shared evidence — settled, not to be reconsidered

- **The Buddha attribution does not survive.** No canonical source; nothing
  resembling it in the suttas.
- **Earliest trace: a Usenet post, 27 November 2001**, where it was posted as
  *"Buddhist"* — **not attributed to the Buddha.**
- **Three occurrences, two wordings** — the manuscript carries two different corrupt
  versions of one spurious saying.
- **A possible ancestor exists in Longchenpa** — *"Since everything is but an
  illusion, perfect in being what it is… one might as well burst out laughing!"*
  **A found ancestor is not automatically a replacement.**

**Therefore: none can remain as "Buddha."** That much is shared. **Everything else
is occurrence-specific.**

---

## L1899 · Mind-Body Coherence — the one genuine 4I ruling

**Immediate context**, ending the section:

> *"The heart's complex nervous system… communicates with the brain in a two-way
> communication system… **At the heart of it all is the aether element holding the
> calm middle ground.**"*
> **→ *"When you realize how perfect everything is, you will tilt your head back and
> laugh at the sky." — Buddha***

**What it is doing:** it closes a **physiological argument** — heart-brain
coherence, the aether as calm middle ground — **with a gesture of cosmic
laughter.** The section is making a claim about the body; the quotation answers with
a mood.

**My reading, offered as reading and not as ruling:** the saying is functioning
**ceremonially here too, not conceptually.** It does not advance the coherence
argument — it releases it. That is a real editorial function, but it is one the
author's own voice can perform, and **the section's last line before the quotation
is already the better closing sentence.**

**On the Longchenpa question you raised:** I would **not** convert
*fake Buddha → real Longchenpa* here. Longchenpa's thought is that **everything is
illusion, therefore perfect, therefore laughable** — a Dzogchen claim about the
emptiness of appearances. **The section's claim is that the body's systems cohere
under aether.** Those are not the same thought, and importing Longchenpa would
attach a genuine source to an argument it does not actually support. **The mutation
has drifted toward what the book wants to say. The ancestor has not.**

> **A recovered ancestor is only a repair when the ancestor's actual thought belongs
> at that location.**

---

## Standing on this family

| Occurrence | Status |
|---|---|
| **L47** | **HELD** — duplication question precedes the quotation question |
| **L190** | **HELD** — same |
| **L1899** | **Ready for ruling.** My reading favours removal or reclamation; **I have not ruled it** |

**One provenance failure, and the family did exactly what it was built to do:** it
put the three side by side, and **two of them turned out not to be three occurrences
at all.**

---

# 4I · BUDDHA TRIO — APPLIED · 2026-09-01

**Misattribution protocol applied. All three removed.** `GATE PASSED`.

| | Location | Action |
|---|---|---|
| **L47** | Disclaimer | quotation removed; the author's aspiration sentence now closes the paragraph **in his own voice** |
| **L190** | Call to Adventure | quotation removed |
| **L1899** | Mind-Body Coherence | block epigraph removed; **the section's own prior line is the better close** |

**No prose was composed on the author's behalf at any of the three.** Each site
closes on a sentence already in the manuscript.

**Longchenpa conversion declined**, recorded on the lifecycle record: his thought is
that *everything is illusion, therefore perfect, therefore laughable* — a Dzogchen
claim about the emptiness of appearances. The section claims **the body's systems
cohere under aether**. Importing him would attach a genuine source to an argument it
does not support.

**Still open and untouched by this ruling:** the **duplication of the disclaimer
passage** — a structural question, not a quotation one — and the **Kalama Sutta**
item in Call to Adventure, which carries its own `WRONG TRANSLATOR CITED` defect.

## ⚠️ Two defects the removals exposed

**1 · I had hardcoded line numbers in the boundary detector.** `BOUNDARY = {519,
1686}` — so the moment the manuscript shifted, **two records silently stopped being
detected.** The register lost them and the gate caught it as a count mismatch.

**The whole reason identity is hashed rather than positional is that line numbers
move.** I built that principle into identity and then violated it three files later
in the detector. **Fixed: boundary records are matched by text.**

**2 · The gate's current-field total was a constant.** `len(R) == 130` was true only
while nothing had been removed — **the first real editorial action would have failed
it.** Replaced with a reconciliation: `active + historical == frozen population`,
which holds across removals because a removal moves a record between layers rather
than destroying it.

> **A frozen population is not a frozen count.** The freeze fixes *which objects
> exist*; editorial work moves them between layers. **A gate that checks the count
> mistakes the two.**

**And a third, smaller:** a migration entry whose quotation has since been removed is
**not "unmatched"** — it is **superseded by a lifecycle record.** Now reported as
such, so a genuine mapping failure stays visible instead of being buried in expected
noise.

## Standing

**127 active** (108 block + 19 inline) · **31 historical** · **158 total** —
reconciling to the frozen 130 + 28.
**Block lifecycle: 137 = 108 active + 29 inactive** ✅
**Inline lifecycle: 19 active + 2 inactive**

**4I remaining: 18 records** — Teasdale next.

---

# 4I · FAMILY CARD 2 — `fam-teasdale` · three occurrences

## A · Chapter 10 opening — **CONTROL, settled, read-only**

> *"To be spiritual means essentially to take responsibility for our inner journey
> while using all the resources from all the traditions available to us…"*
> **`KEEP · KINSHIP + DIALOGUE · VERIFIED EXACT · RIGHTS HOLD`**

**The relationship is already named on the page**, in the author-adopted paragraph
beneath it: *"Teasdale's vision resonates deeply with my own. Elemental Alchemy is
not an attempt to collapse our differences… Our differences need not divide us; held
in relationship, they can become the very means through which a greater wholeness is
revealed."*

**This is the only occurrence with a closed source. It is also the only one where
the book answers him.** Both facts matter for what follows.

---

## B · L1654 — *Refining the Air of Mindful Communication*

> *"Spiritual maturity is not about pursuing salvation alone; it is about
> contributing to the salvation or enlightenment of others."* — **`UNVERIFIED`**

**Immediate context:** a paragraph on the *"interrelated, interdependent, mycelial,
interwoven mind"* and its tendency to **collapse into a shared field of mutual
agreement** — and the quotation is followed immediately by the heading **"Groupthink
vs. Collaborative Intelligence."**

**My reading:** **this is a different relationship from A, and a genuinely relevant
one.** A is about **drawing across traditions**; B is about **maturity being
outward-turned rather than solitary** — which is precisely the hinge the section
needs between *interwoven mind* and *groupthink versus collaboration*. **It is not
repeating A's relationship.**

**But it sits at a section boundary doing transitional work**, and **the source is
unverified.** So the honest position is: *the voice may belong; the sourcing does not
currently support it.*

**Under your ordering — belonging first, provenance second — B is the occurrence
where that ordering actually bites.** If his voice belongs here, the sourcing has to
be made to support it, and *A Monk in the World* and *The Mystic Heart* were both
checked without finding it.

---

## C · L2258 — the **Conclusion**

> *"The real religion of humankind can be said to be spirituality itself,"*
> proclaimed Wayne Teasdale — **`UNVERIFIED`**

**Immediate context:** the Conclusion's culminating paragraph — *"we are not
isolated beings but kaleidoscopic refractions of the infinite source… temporary
crystallizations of the primordial quintessence."*

**My reading: this one repeats A's relationship rather than adding to it.** *"The
real religion of humankind is spirituality itself"* is **the same claim as A's
"resources from all the traditions… our common heritage"** — universality across
traditions — **stated more flatly, in the book's final pages, without the dialogue A
carries.**

**And the position works against it.** A **opens** Chapter 10 and the book answers
it. C **arrives inside the Conclusion's own crescendo**, interrupting the author's
most fully-voiced passage with an outside voice **making a point he has already
earned across ten chapters.**

> **That is certification, and at the one location where the book least needs it.**

**Under the test you set — *does Teasdale create a new relationship here?* — my
answer for C is no.**

---

## The distinction the family makes visible

**Three Teasdale occurrences. Only A both has a source and does something the book
answers.** B may earn its place on function but **cannot currently earn it on
evidence**. C is the same relationship as A **at the moment the book is strongest in
its own voice.**

> **Repeated source presence must add a new relationship, not repeat an established
> one** — and **the closer to the book's own crescendo, the higher the bar.**

**Neither B nor C is ruled.** Both are yours. **A stands untouched.**

---

# ⚠️ CORRECTION — author testimony is provenance evidence · 2026-09-01

## The error

**I let register uncertainty become editorial suspicion.**

`UNVERIFIED` means **our matching process has not connected the printed wording to a
specific edition.** It does **not** mean the quotation lacks a source. I reported the
Teasdale occurrences as though absence of a search hit were evidence of absence, and
then **compounded it** by folding that into the editorial reading — *"B may earn its
place on function but cannot earn it on evidence."*

**That coupling was wrong twice over:** it treated a limitation of our tooling as a
property of the quotation, and it let a provenance state contaminate a question the
axes exist to keep separate.

## The corrected state

> **`AUTHOR_REPORTS_DIRECT_SOURCE`** · review state **`edition_check_required`**

**The author reports taking both quotations directly from Teasdale's book.** That is
**first-person evidence about how the material entered the manuscript**, and it
changes the investigation: the next action is **an edition check against the
author's own copy**, not further web search.

**The prior search-based verdict is preserved in `provenance_history` as
superseded** — not deleted. It records a real thing: *our search did not find it.*
That remains true and remains useful. It is simply no longer the standing verdict.

## What survives of my editorial reading, and what does not

**WITHDRAWN — B.** My reading of B was positive (a genuinely different relationship
from A: maturity as outward-turned, hinging into *Groupthink vs. Collaborative
Intelligence*). **The "cannot earn it on evidence" clause is withdrawn entirely.**

**STANDS, but on its own merits — C.** My argument that C repeats A's relationship,
and arrives inside the Conclusion's own crescendo where the book is strongest in its
own voice, **is an editorial argument and does not rest on provenance at all.** The
*"and it's unverified"* reinforcement I attached to it **is withdrawn.**

**The question at both is now the one the author framed:**

> **What specific Teasdale idea were you bringing into conversation here, and is
> this still the best place for it?**
>
> **Not: "why is Teasdale here at all?"**

## The Studio requirement this earns

> ### When the member says "I took this directly from this book," MAIA must treat that as material provenance evidence and investigate the named source — not override the member because a web search failed to locate the line.

**The member may still misremember a page or a wording.** That is an ordinary
verification task. **But their first-person account of how the material entered the
manuscript changes the investigation, and it must never be treated as though it was
not said.**

**A system that can only see what it can find will systematically discount the one
category of evidence the author holds and it does not: how the work was actually
made.**

**And the gate caught the arithmetic:** `edition_check_required` is a **documented,
deliberate state**, not missing data — the third time the *"deliberately unresolved
must be counted"* lesson has surfaced. Added to the reconciliation.

---

# 4I · `fam-teasdale` CLOSED — same author, opposite outcomes · 2026-09-01

| | Ruling | Why |
|---|---|---|
| **A · Ch10 opening** | **`KEEP`** | Kinship + dialogue; **the book answers him** |
| **B · Mindful Communication** | **`KEEP` · `DIALOGUE / ETHICAL HINGE` · `SOURCE RECOVERY REQUIRED`** | **A new relationship**: spirituality turned outward, hinging into collaborative intelligence |
| **C · Conclusion** | **`REMOVE` · `CERTIFICATION / REDUNDANT`** | Repeats an established relationship at the book's own culmination |

**B stays and is not rewritten.** Teasdale turns spirituality **outward** — from
individual attainment toward participation in the awakening of others — which A does
not. That is exactly the hinge the surrounding prose needs: **interdependence → the
danger of mere agreement → collaborative intelligence.** It introduces an ethical
proposition the next section tests. **Not certification.**

**The provenance task remains open and does not touch the editorial ruling:** the
task changed from *"does Teasdale actually say this?"* to **"recover the exact place
it was read and reconcile the wording."**

## C — removed, and the seam did need repair

**Removal left a genuine defect.** The quotation sat mid-sentence, and the clause
after it — *"for in the aether we merge with the mystical headwaters from which all
faith traditions spring"* — **lost its main clause.**

**Repaired by repunctuation only.** The full stop before the quotation became a
comma:

> *"…temporary crystallizations of the primordial quintessence that animates all
> existence**,** for in the aether we merge with the mystical headwaters from which
> all faith traditions spring."*

**Every word is the author's and already on the page. Nothing was composed.**

**And the provenance uncertainty made removal easier but was not the reason for it** —
recorded on the lifecycle record so that distinction survives.

## The heuristic this family produced

> ### Every return of a voice must deepen the relationship.
>
> **Repeated source presence must add a new relationship, not merely repeat an
> established one — and the closer we are to the book's own culmination, the higher
> the bar for interrupting it with another voice.**

**It does not say *quote people less*.** A appears, B appears, and both stay. **It
says a voice must earn each return.**

## Standing

**126 active · 32 historical · 158 total** — reconciling to the frozen population.
**`GATE PASSED`.**

**4I: 21 → 16 remaining.** Three families with a single member (Descartes, TTC 33,
Goethe) and thirteen singles.

---

# 4I · BATCH 1 of 4 — four cards · 2026-09-01

---

## 1 · Descartes — `EA-Q-0094` · Ch8 *Mapping Reality*

> *The air element of cognition allows us to create meaningful symbols and symbolic
> language, enabling us to navigate complex issues and come together to envision
> better worlds.* **"I think therefore I am"** *reflects our collective existence
> through shared thoughts.*

**What it's doing:** the book **turns Descartes**. His cogito grounds certainty in
the *solitary* thinker; the sentence redirects it to **collective existence through
shared thoughts.** Later in the chapter the book coins its own answer —
**"I know therefore I am."**

**What materially matters:** `VERIFIED EXACT` · public domain · **currently
unattributed** — the sentence names no one. `fam-cogito`, role **ancestor**, with the
book's counter-formula as its authored response.

> **The one question: if the reader doesn't know this is Descartes, does the turn
> still land?**

**My recommendation — and it is mine, not a verdict: `CORRECT`.** Name him. The move
here is dialogue, and **dialogue needs an interlocutor the reader can identify.**
Four words would do it. I'd resist anything longer, because the paragraph's economy
is part of why the turn works.

---

## 2 · Goethe — `EA-Q-0040` · Ch5 *The Dark Side of Fire*

> *…fire inspires us with visions of what's possible, but it also casts shadows on
> cave walls that we imagine are reality.* **There is a saying: "The greater the
> light, the deeper the shadow."**

**What it's doing:** it names the chapter section's whole thesis in one line, sitting
directly after a Platonic cave allusion.

**What materially matters:** it is **Goethe** — *Götz von Berlichingen*, Act I
(1773), *"Wo viel Licht ist, ist starker Schatten"* — **presented as anonymous.**
Public domain. **Two further facts:** the source is a **play**, so the line is
**spoken by a character**; and the English is an **evolved variant** matching no
standard translation.

> **The one question: does this line gain or lose by being anchored to Goethe?**

**My recommendation: `CORRECT`.** My reading is that it **gains** — an anonymous
"there is a saying" asks the reader to accept folk authority, while Goethe's name
places it in the Romantic lineage the chapter is already working in. **But I hold
this loosely**: proverbial framing is a legitimate choice, and if you meant it as a
saying rather than a citation, that's a real position and the line can stay
anonymous.

*(The character-speaker fact is worth knowing but I don't think it bites here — the
line isn't ironised by its speaker the way Polonius or Satan are.)*

---

## 3 · Tao Te Ching 33 — `EA-Q-0126` · Conclusion

> *The waters of our emotional depths teach us to honor the vast ocean of our
> feelings…* **"He who knows others is wise; he who knows himself is enlightened,"
> wrote Lao Tzu.** *By developing our emotional intelligence, we learn to truly know
> ourselves…*

**What it's doing:** it supplies the **hinge from knowing others to knowing
oneself** in the Conclusion's water passage — the sentence after it depends on the
distinction the quotation draws.

**What materially matters:** **genuinely *Tao Te Ching* 33** — one of only three real
Laozi attributions in the book. **The English rendering is unidentified**, and
**demonstrably not Legge**, whose text reads *"discerning… intelligent."* Original is
public domain; the translation's status is open.

> **The one question: this one is load-bearing and the source is real — is there any
> editorial reason not to keep it?**

**My recommendation: `KEEP`**, with the translator recovery left as a provenance
task. **I don't see an editorial argument against it.** *(Worth noting beside the
Teasdale C removal: both sit in the Conclusion, and this one earns its place because
the following sentence needs it. Position alone was never the objection.)*

---

## 4 · Jung, belief → experience — `EA-Q-0099` · Ch8 *Beyond Belief*

> *It's easy to argue theories and beliefs, but challenging to dispute someone's
> experience.* **Information leads to knowledge; experience leads to wisdom.
> As Carl Jung said, "I don't have beliefs, I have experiences."**

**What it's doing:** it **closes the paragraph's argument** — that experience
outranks belief — by putting the claim in Jung's mouth.

**What materially matters:** **Jung's actual distinction is belief versus
*knowledge*** — *"I don't need to believe. I know"* (BBC *Face to Face*, 1959). **The
manuscript substitutes *experience* for *knowledge*** — and the surrounding paragraph
is an argument for **experience** over belief.

> **The diagnostic: restoring the authentic wording would not serve the paragraph.
> The quotation was moved toward the claim it is being used to support.**

> **The one question: the paragraph's argument is yours — does Jung need to be the
> one to say it?**

**My recommendation: `RECLAIM`.** My reading is that the paragraph already makes the
case in your own voice — *"Information leads to knowledge; experience leads to
wisdom"* is the sharper sentence, and it's yours. **`CORRECT` is available**, but
restoring *"I don't need to believe. I know"* would leave Jung arguing something
adjacent to, and slightly against, the paragraph.

**Held loosely.** If Jung's presence matters to you here as lineage rather than
support, **`CORRECT` + a short frame** is a legitimate third path — the Chapter 10
Teasdale shows that shape working.

---

**Four cards. None ruled.** Rulings available: `KEEP` · `CORRECT` · `CONNECT` ·
`REFRAME` · `RECLAIM` · `REMOVE` · `DEFER`.

---

# 4I · BATCH 1 — RULED · 2026-09-01

| Record | Ruling | Applied |
|---|---|---|
| **Descartes** | `CORRECT + REFRAME` · **DIALOGUE / CHALLENGE** | ⏸ **wording proposed, awaiting adoption** |
| **Goethe** | `REFRAME` · **ILLUMINATION / LINEAGE** | ✅ |
| **Tao Te Ching 33** | `KEEP` · **LINEAGE + ILLUMINATION** | ✅ *(no change needed)* |
| **Jung, belief→experience** | `RECLAIM` · **AUTHORIAL CLAIM** | ✅ |

## The distinction the batch produced

> ### Correct attribution is not enough if correction would imply more textual certainty than the evidence supports.

**Two under-attributions, two different repairs.** I had recommended `CORRECT` for
both, and **that was the error the ruling caught**: naming Goethe would have fixed
under-attribution **by manufacturing false precision**, because the English is an
evolved formulation and not an established translation.

**Descartes needs the relationship clarified. Goethe needs the lineage clarified.**

---

## ✅ Jung — `RECLAIM`, applied

**Quotation removed. The paragraph now closes on the author's own sentence:**

> *"It's easy to argue theories and beliefs, but challenging to dispute someone's
> experience. Information leads to knowledge; experience leads to wisdom."*

**Seam clean — no repair needed, and none attempted.** The idea was always the
book's; Jung was being made to certify it with words he did not use.

## ✅ Goethe — `REFRAME`, applied

> *There is a saying, **evolved from Goethe**: "The greater the light, the deeper
> the shadow."*

**Four words.** It preserves the aphoristic register the author chose **and** names
the lineage **without claiming the English is Goethe's.** *If the phrasing isn't
right, the ruling stands and only the four words change.*

## ✅ Tao Te Ching 33 — `KEEP`

**No manuscript change.** Translator recovery remains owed **as a provenance task,
independent of the editorial ruling.**

**And it settles something about the Teasdale removal:** *"a quote can belong in the
culmination if it still advances the book."* **The Conclusion was never the
objection** — Teasdale C repeated an established relationship; Laozi opens a
distinction the next sentence immediately uses.

---

## ⏸ Descartes — `CORRECT + REFRAME` · wording proposed, **not adopted**

**The ruling is clear and I agree with it.** The current sentence claims the cogito
*"reflects our collective existence through shared thoughts."* **It doesn't** —
Descartes begins from the solitary thinking subject. **The book is turning him
outward, and that turn should be visible as the book's own.**

**Proposed replacement — `EDITOR/MODEL SUGGESTION`, requires your yes, revision, or
rejection:**

> The air element of cognition allows us to create meaningful symbols and symbolic
> language, enabling us to navigate complex issues and come together to envision
> better worlds. Descartes grounded existence in the solitary thinker — *"I think
> therefore I am."* I would turn it outward: what we are, we are together, through
> thoughts we hold in common.

**What it does:** names him · **states his position accurately** (solitary) · marks
the turn as **yours** (*"I would turn it outward"*) · and leaves the later
*"I know therefore I am"* reading as **an authored response rather than an
unexplained echo.**

**Where I'd expect you to push back:** *"what we are, we are together"* is a
cadence, and it may be more mine than yours. **The structure is the ruling; the
sentence is a draft.**
