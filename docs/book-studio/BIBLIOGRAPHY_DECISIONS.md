# Bibliography decisions — hand-authored

**This file is authored, never generated.** `BIBLIOGRAPHY_RECONCILIATION.md` is the
machine report and is overwritten on every run; this file records what was actually
decided, and it survives.

> **The matcher may propose and flag. It may never attach.**
> There is no string-normalisation trick worth trusting as authority — not against two
> Berrys, historical names, translated authors, institutional sources, pseudonyms, or
> works with multiple editions. Ambiguity stays unattached.

## Method for the remaining pass

**70 surviving source objects → 70 explicit mapping decisions.** One reviewable row each:

`source object → exact person / work / edition / translator / source relationship →
KEEP · ADD · CORRECT · NO ENTRY REQUIRED`

Then reverse-check the resulting single alphabetical bibliography: every entry must point
at a live manuscript relationship.

Slower than automation and dramatically safer, which this late in the manuscript is the
right trade.

## Settled — structure

- **One alphabetical bibliography.** Chapter grouping is abandoned: it made a source look
  missing when it was listed under another chapter (Jung, Tolle), produced duplicate
  entries for one author, and encouraged chapter-local reasoning about book-level source
  relationships. Where a source is used lives in the semantic record; source identity
  lives in one list.
- A reader-facing *Sources & Further Reading* section, if ever wanted, is a **deliberate
  separate object** — never somewhere to park entries that no longer have a reason to exist.

## Settled — the governing question

> **What sources does the book actually ask the reader to trust, recognise, or understand
> as part of its intellectual lineage?**

Not *what was in the bibliography before*, and not *who might plausibly have influenced the
author*. Quotation source · conceptual dependency · explicit lineage · named source or work
are all legitimate. **Silent possible influence is not.**

## Settled — individual rulings

### KEEP — live dependency

| Source | Manuscript relationship |
|---|---|
| **Johnson, Robert A.** *Inner Gold* | Ch8 states the term is taken from him, then uses it twice more |
| **Edinger, Edward F.** *Anatomy of the Psyche* | Named as a source of the Spiralogic alchemical dimension; the 7→5 selection is declared as the author's |
| **Buber, Martin** *I and Thou* | Ch8 attributes a position to him — **repaired**, see below |
| **Smith, C. Michael** | Formation credit plus the wholeness-making lineage. **Source-specific**: identify the work(s) carrying wholeness-making and the Daimon / Dream Maker / inner axis mundi vocabulary. *Psychotherapy and the Sacred* (1995) and *Jung and Shamanism in Dialogue* (Paulist Press, 1997) are the candidates. His foreword is a separate contribution, not the bibliography source for those claims. |
| **Sadhguru** | **Merge the person identity; rebuild the entries from the actual teachings used** — the Four Yogis teaching and the five-element teaching. Both *Inner Engineering* and *Mystic's Musings* (listed under "Vasudev, Jaggi") are **dropped**: the Four Yogis story was not located in either, and the five-element teaching was attested on the Isha channel rather than in a book. One teaching-source entry replaces two book entries. |

### KEEP — explicit lineage

| Source | Note |
|---|---|
| **Schönberger, Martin** *The I Ching and the Genetic Code* | Named in Ch4 prose as first arguing the correspondence, ahead of McKenna — an explicit genealogy claim |
| **The Emerald Tablet** (was *The Hermetica*) | Relationship real; the citable object is the Emerald Tablet, not a generic *Hermetica*. **English rendering unidentified** |
| ***Book of Lambspring*** | **ADD.** Explicitly named in the manuscript; never a quotation, so no quotation-based process could have found it |

### DROP — orphan (no surviving manuscript relationship)

Hurley · Yeats · Steiner ×2 · Sagan · Munch · Balfour · Rudhyar · Herrmann · Merton ·
Gibran ×2 · LaDuke · Matlin · Rowan Williams · Confucius · Dewey.
**Count the entries, not the names** — Steiner and Gibran each occur twice.

### DROP — authorial choice, ruled

- **Young, Arthur M.** — *The Reflexive Universe* and *Nested Time*. They appear in the old
  bibliography, particularly around Aether, but **no authorial statement establishes that
  Young materially shaped Spiralogic.** Reading and reference material: yes. Demonstrated
  Spiralogic lineage: not yet. **The bibliography must never imply an intellectual debt the
  manuscript does not acknowledge.** If the debt is real, the sequence is *prose
  acknowledgement first, then the entry* — never the reverse.
- **Carroll, Peter J.** *Psybermagick* — no manuscript relationship; not retained for being
  intellectually adjacent.
- ***Rosarium Philosophorum*** — the manuscript names the *Book of Lambspring*. Do not infer
  Rosarium into the lineage from alchemical adjacency. It can return on evidence.

### CORRECT — explicit, not by inheritance

| Was | Now |
|---|---|
| Kalama Sutta, Thanissaro / Access to Insight | **SuttaCentral, Bhikkhu Sujato, AN 3.65** (CC0) |
| *(no entry)* | **St. John of the Cross**, ICS *Collected Works*, Kavanaugh & Rodriguez |
| Cohen, *Selected Poems 1956–1968* | **"Anthem," *The Future*** (1992) |
| Carson, *Silent Spring* p.51 | **Brooks, *The House of Life*** |
| Thoreau, *Walden* | ***The Maine Woods*** (1864), "Chesuncook" |
| Zhuangzi, trans. Watson | **trans. Herbert A. Giles** |
| Berry, *Standing by Words* | correct at work level; **name the essay** ("Poetry and Marriage: The Use of Old Forms") and **treat the source as prose, not verse** |

### NO ENTRY REQUIRED — anonymous or traditional

The proverb (Ch5) · the familiar saying (Ch7) · "adapted from Luke 4:23" · the traditional
John 17 formulation · the permaculture ethic. Recorded explicitly so they do not read as debt.

## Repairs applied to the manuscript

**Buber** — the prose asserted a sentence he is not attested as saying (*"Martin Buber said
God is more between us than within us"*). The position is genuinely his; the utterance is
not attested. It was invisible to the entire quotation census because it carries no
quotation marks — the gap the non-quotation reconciliation exists to close. Now reads:

> Martin Buber located the divine in the between—the relational space between beings.

Attributes a position rather than an utterance, avoids inventing a within-versus-between
opposition stronger than the evidence supports, and keeps *I and Thou* a legitimate
bibliography relationship.

## Genuine source-recovery tasks inside the remaining pass

None of these may be invented:

1. **Tao Te Ching 33** — English rendering unidentified, and demonstrably *not* Legge
2. **Tao Te Ching 78** — English rendering unidentified
3. **Emerald Tablet** — English rendering unidentified
4. **Thich Nhat Hanh** — attribution verified, exact English and source form unresolved
5. **St. John of the Cross** — saying number read off the actual ICS edition, not from
   secondary sources, which disagree
6. **Wendell Berry** — edition check on "begun" versus "come to"; do not restore either
   until the edition is inspected
7. **C. Michael Smith** — which work carries which concept, preferably confirmed with him

`quotation-register/emit_bibliography.py` stays **not runnable** until the mapping is
complete.

---

## EMISSION HOLD — no placeholders (ruled 2026-09-01)

> **Do not emit a bibliography containing `[edition to confirm]` placeholders.**

The remaining uncertainty is small enough that placeholders would create exactly the artifact
this whole process exists to eliminate: **a formally complete-looking record whose referent is
still unresolved.** No placeholders. No guessed editions. No "probably this one."

### And the governing distinction for optional detail

> **We do not need maximal bibliographic detail. We need earned detail.**

St. John's saying number is the test case: include it **only if the actual ICS edition supports
it cleanly**. If it does not, **omit the number**. Do not leave a placeholder, and do not import
a number from a secondary source — the secondary sources disagree, which is how this became a
question at all.

### True bibliography blockers — copy and email

| Item | What closes it |
|---|---|
| **Teasdale ×2** | Exact work(s) — one shelf inspection settles both and decides whether one or two entries survive |
| **C. Michael Smith** | Concept → exact work — one email, and the relationship already exists |
| **Zhuangzi / Giles** | The edition and imprint actually used |
| **Campbell** | 1991 HarperCollins hardcover vs. 1995 HarperPerennial paperback — whichever was consulted |
| **Rilke / Barrows–Macy** | The edition actually consulted, not the first printing by default |

### Manuscript confirmation, not bibliography

| Item | What closes it |
|---|---|
| **Wendell Berry** | Confirm `begun` against the 1983 North Point copy. Do not restore `come to` until inspected. |

### Then, in order

**emit alphabetical bibliography → reverse reconcile → merge duplicates → release genuine
orphans → confirm every surviving entry has a live manuscript relationship → BIBLIOGRAPHY
CLOSED → rights and permissions.**

### Why waiting is right, in one example

The Whyte repair is the argument. **Correcting the speaker did not verify the sentence.** Stage 4
moved that line from George Bernard Shaw to William H. Whyte and treated it as settled; the
bibliography pass then found the printed English was still a paraphrase of what Whyte actually
wrote. A second provenance defect was sitting inside a record everyone considered closed.

We are close enough to the end that **precision is worth more than speed.**

### Added from final QA — unquoted attributions to verify

**Aristotle (Ch5):** *"Aristotle understood fire as the one element of the four connecting us in
kinship with the gods since it is the one element we could create."* Carries no quotation marks,
so the census never saw it — the **Buber class**. Two questions: did Aristotle hold this, and is
the *"since it is the one element we could create"* reasoning his or the book's? Resolve before
the bibliography closes; an Aristotle entry may or may not follow.
