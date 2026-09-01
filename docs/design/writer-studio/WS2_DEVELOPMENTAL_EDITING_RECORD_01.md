# WS2 — Developmental editing, capture record 01

**Status: EVIDENCE, NOT LEARNING.** This is the record of one live session against
the seven classes in `WS2_DEVELOPMENTAL_EDITING_CAPTURE.md`. It authorizes no
unit, proposes no feature, and does not revise the roadmap's ordering.

Per that document: *"The learning from the actual Chapter 10 edit is the
founder's to enter."* Nothing below is entered as learning. The rulings recorded
here are the founder's and are quoted as made; the observations are the record of
what happened, offered so the learning has evidence to stand on.

**Session:** 2026-08-31. Chapter 10 replacement, KDP resubmission, and the
opening of a whole-book editorial pass.
**Work:** *Elemental Alchemy*, canonical source
`docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md`.
**Commits:** `3c4795d`, `6c39a23`, `fcd298e`, `10ee4f0`, `73fed131`.

---

## 1 — THE ACT

At verb level, what was actually done:

```text
replaced      an author-supplied Chapter 10 into the canonical source
conformed     the incoming draft to house typographic convention
verified      each finding against the canonical source before acting on it
re-verified   a findings document written against a different manuscript file
corrected     a misattributed epigraph
removed       a duplicated sentence; a repeated quote; two disputed epigraphs
marked        a threshold with a section break rather than prose
mapped        all ten chapter boundaries, neutrally, before adjudicating any
declined      four findings in Chapter 1, and an entire transition pass
deferred      two questions to later cross-chapter passes
batched       every change behind a single render and a single upload
```

Two of these verbs are not in the built pipeline's vocabulary at all: **declined**
and **deferred**. A third, **re-verified**, exists only because a finding
outlived the file it was found in.

## 2 — WHERE IT LANDED

| act | landed at | granularity |
|---|---|---|
| Chapter 10 replacement | L2114–2440 | whole division |
| "Alchemy of Water" duplication | L1181 | one sentence inside a paragraph |
| Rumi repetition | L1928 | one line |
| Second-campfire threshold | L271 | between two paragraphs |
| Epigraph provenance | L313 | one line |
| Disputed epigraph, Fire | L1122 | one line |
| Disputed epigraph, Aether | L2043 | one line |
| Source additions | Bibliography, Ch1 + Ch10 | back matter list |

The acts landed at five different granularities — a division, a paragraph, a
sentence, a line, and a back-matter list — and two of them landed in back matter
as a consequence of a decision made in a chapter.

## 3 — WHAT WAS MISSING

Stated as wants. No feature is named.

- I wanted to know **which manuscript is the Work** without deriving it from a
  comment inside a render script.
- I wanted a finding to **carry the file it was found in**, so it would expire on
  its own when that file stopped being the Work.
- I wanted to see **all ten chapter boundaries beside one another** before ruling
  on any one of them. *(Asked for explicitly by the founder, mid-session.)*
- I wanted a declined finding to **stay declined**, with its reason, so it would
  not return later as a new discovery.
- I wanted to see **every occurrence of a quotation at once**, not one at a time.
- I wanted a change to **show its blast radius** before I made it.
- I wanted to know, before editing, **whether a change would move the page
  count** — because page count is bound to spine width and to a cover already
  accepted by a printer.

## 4 — WHAT YOU HELD

Held in the head across the session because nothing would hold it:

- Which of four built PDFs was current. Filename and page count were both
  unreliable — the file named `final` was the *older* one.
- The chain **page count → spine width → cover validity**, live from the moment
  the chapter grew the book by one page until two later cuts returned it.
- That a findings document's line numbers pointed at a manuscript that is not the
  Work, so every number in it had to be re-derived before use.
- That two branches carried two different Chapter 10s, and that a grep matching
  both could not tell them apart.
- That correcting one instance of a quotation had put the book into a state where
  it carried one quotation in two wordings under two attributions.

## 5 — WHAT LEAKED

**The entire session leaked. Nothing about this edit happened inside the Studio.**

| what | where it went |
|---|---|
| the ten-seam comparative map | a published artifact |
| every ruling | chat, then a git commit message |
| every decline, with reasons | a git commit message, "recorded so they are not re-raised" |
| the audit of a stale findings doc | a table inside a commit message |
| items left open | commit prose |
| which file is safe to upload | a shell loop, run twice, in a terminal |
| verification evidence | terminal scrollback |
| the open question on cosmogonic recurrence | this document |

Git commit messages are currently carrying the developmental record. They were
chosen because they are the only durable, author-adjacent place a judgment and
its reasoning could sit next to the change it produced. That is the leak, and it
is total — a version-control system is doing the work of the editorial memory.

One leak is worth naming separately because it is the same shape as Finding 1 in
the capture document. A commit message contains this heading:

> `DECLINED, recorded so they are not re-raised:`

Written by hand, into version control, because there was nowhere else to put it.

## 6 — WHAT MOVED YOU

Three founder reversals, each caused by evidence rather than argument:

1. **The transition pass.** Opened as *"looks like something to look at
   first(?)"*. After the seam map: *"the full map changes the editorial
   conclusion quite a bit… No new transition prose. No global bridge pass."* The
   map did not answer the question that was asked; it dissolved it.

2. **Fire.** Presented as the one elemental chapter that breaks its siblings'
   handoff convention. Ruled protected: *"making Fire say 'Water is next' merely
   because its siblings do would impose a template on an element whose
   phenomenology is different… Fire can consume itself and leave the reader at
   the embers."* Asymmetry was re-read as characterization rather than defect.

3. **Jung/Campbell.** The obvious repair — correct all three instances — was
   declined once the repetition question surfaced beside the provenance one:
   *"That would solve the factual problem by creating a literary one."*

And three corrections to the editorial agent's own claims, each caught by an
instrument rather than by reasoning:

- A webfont `@import` in the print CSS was missed on a first pass because the
  search was for `@font-face` and font files. Another lane found it.
- A `strings` test reported "old Ch10" for a file that contains the new one —
  the instrument was structurally incapable of reading compressed PDF text.
  Both files returned the same wrong answer, which is what exposed it.
- A grep intended to distinguish two drafts matched both, because the old
  chapter and both rewrites open on the same sentence. It produced a confident,
  wrong claim about a file's provenance.

## 7 — WHAT YOU DECLINED

| declined | reason given |
|---|---|
| Rewriting Chapter 10 | another lane did; the branch that preserved the author's draft was taken instead |
| Trimming a page to recover the original spine | cutting approved prose to save 0.0025″ and some back-matter parity |
| "An Infinite Embrace" register shift | Ch1 has a job later chapters don't — experience → possibility → what the book offers |
| Reducing the epigraph count in that section | no independent stylistic cut |
| The 261/265 restatement | protected as didactic recursion, per the standard in `CHAPTER_7_PASS_v1.md` |
| A heading over the second campfire | a heading would name the movement and explain the resonance |
| Correcting Ch5/Ch9 to Campbell | would solve a factual problem by creating a literary one |
| Ch2 and Ch3 transitions | *"A chapter does not have to tell us what comes next every time."* |
| Ch5 → Ch6 | the benediction is protected |
| The Ch10 → Conclusion stop | deliberate; protected |
| A global bridge pass | *"would likely make the book more mechanical"* |
| Inventing a heading for Chapter 6 | *"Absence of a heading can be compositional; wrong hierarchy is markup."* |
| Manufacturing edits to justify the pass | *"We shouldn't manufacture edits simply because we're doing an editorial pass."* |

Thirteen declines against nine applied changes. The transition pass closed with
**zero** interventions — recorded by the founder as *"a useful editorial finding,
not a failure to find things to edit."*

---

## Evidence toward the five open questions

The capture document lists five questions only the live edit can answer. This
session bears on four of them. The answers remain the founder's.

**Q1 — one pass over the whole, or many passes over parts?**
Evidence for whole-book passes with a single concern. The ten-seam pass produced
a conclusion that ten local chapter passes could not have produced: six of ten
boundaries already hand off, so the book has no systemic transition problem. The
founder's phrasing for the alternative: *"thirteen local edits pretending to be
one book."* The pass had exactly one concern and covered the whole Work.

**Q2 — does a judgment stay open across sessions?**
Directly evidenced. The cosmogonic-opening recurrence was neither applied nor
dismissed but deferred with a condition attached: *"adjudicate them when Ch3,
Ch5, and Ch9 have each received their own canonical pass."* That is a question
with a life of its own, a stated ripening condition, and no owner in any built
surface. It currently survives only in this file.

**Q3 — at the moment of decision, what did you need to see?**
The founder's to answer. Observable from outside: before ruling on any single
seam, the founder declined to rule at all until all ten could be seen together,
and specified the fields required — closing text, opening text, existing markers,
what changes across the boundary, a neutral verdict, and a confidence level.

**Q4 — does the plan live at the chapter, or across the book?**
Evidenced as: **across**. The epigraph correction was found in Chapter 1 and
could not be resolved there — it was one of three instances across Chapters 1, 5
and 9, and fixing the local one put the book into an inconsistent state until the
other two were ruled on. A chapter-scoped note would have recorded the finding
and lost the problem.

**Q5 — how much is text, how much architecture?**
The acts landed mostly at sentence and line level (see class 2). But the
*decisive* acts were architectural: establishing which file is the Work, mapping
the seams before adjudicating, and batching changes behind one render. The
session's largest single finding — that 8 of 10 catalogued defects no longer
existed — was architectural, not textual.

---

## Persistence classes for a developmental decision

Founder's formulation, recorded as given:

> A developmental decision is meaningful only in relation to the manuscript state
> against which it was made. "Locked," "declined," "deferred," and even
> "approved" cannot safely function as timeless properties of a passage if the
> underlying passage, chapter structure, or book architecture later changes.

| class | behaviour over time |
|---|---|
| **Finding** | *Expires.* The manuscript changed; the old diagnosis no longer applies. |
| **Decline** | *Persists* — but as a decision made against a particular manuscript state. |
| **Deferral** | *Persists conditionally*, alive until its stated ripening condition occurs. |
| **Lock** | *Can be superseded.* Later development may make a settled state historical rather than operative. |
| **Applied edit** | *Persists only insofar as the passage survives.* Changing the surrounding architecture may legitimately reopen its function. |

No example of a superseded canonical lock is recorded here. One was proposed
during the session and withdrawn by the founder on inspection: the artifact
declaring `Chapter 2 = LOCKED` was a session transcript, not a repository
artifact, and the repository evidence says the opposite — `CHAPTER_2_PASS_v1.md`
describes Chapter 2 as establishing torus, circle and spiral. **The class is held
open with no specimen.** Recording a transcript as canonical provenance would
have been the same error this record exists to document.

---

## The finding this session adds

Recorded as evidence. Whether it is a finding of the programme is the founder's
to decide.

**A developmental finding outlives the file it was found in, and nothing marks
it stale.**

`EDITORIAL_FINDINGS_v1.md` catalogues ten defects with line numbers, against
`ELEMENTAL_ALCHEMY_MANUSCRIPT.md` (5,184 lines). The Work is
`ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md` (2,973 lines). Re-verified against the
Work:

```text
 1  Ch8 Air five-fold repeat ......... already resolved
 2  Ch7 Augusten trip told twice ..... already resolved
 3  Ch6 "Alchemy of Water" twice ..... REAL      -> fixed
 4  Ch6 immersive-phase repeat ....... already resolved
 5  Ch3/Ch4 cosmic-silence opening ... already resolved
 6  "Four Grades" template ........... appears once
 7  Rumi quote in two chapters ....... REAL      -> fixed
 8  Earth Phase 1 repeat ............. already resolved
 9  Duplicate prefaces/abstracts ..... already resolved
10  Move "A Message…" to back ........ already done
```

Eight of ten had been repaired by a later assembly. Acting on the document as
written would have meant editing a file that is not the book, to fix problems
that no longer exist, using line numbers that address different text.

Three legacy artifacts were rechecked in full against the canonical manuscript:

```text
EDITORIAL_FINDINGS_v1.md    10 item entries     8 expired,  2 real
CHAPTER_1_PASS_v1.md         9 item entries      8 expired, 1 still live
CHAPTER_2_PASS_v1.md         5 item entries      5 expired, 0 real
                            ──────────────────────────────────────────
                            24 item entries     23 expired, 1 operative
```

Counted as **item entries, not unique defects** — the artifacts may overlap.

**The single survivor is the most informative row.** Chapter 1's flag F4 — *"The
Campfire Initiation movement is currently unmarked"* — was still true against the
canonical manuscript, and was independently rediscovered by this session's fresh
read before the legacy artifact was consulted. It is the item the founder ruled
on with a section break.

The 23 that expired were empty heading artifacts, italicization parity, stray
horizontal rules, mislabeled part numbering, an orphaned workbook ending: all
**markup** properties of one file's assembly. The one that survived was an
observation about **how the chapter moves**.

Offered as evidence, not doctrine: *findings about markup expire with the file;
findings about composition can outlive it.* If that holds across further
chapters, the two may not be the same kind of record and may not want the same
lifetime.

This is the same class of error the capture document already names — *"the Work
itself may be the thing that is wrong"* — inverted. Here the Work was right and
the finding was stale, and nothing in either document could say so.

---

## What this record does not do

It does not propose a unit, a lane, or a surface. It does not name a feature for
any want in class 3. It does not claim that git commit messages are a design for
the editorial record — only that they are what the process reached for when the
product had nowhere to put a judgment.

It does not close any open item in the book edit. As of this record:

```text
Chapter 10 ................. replaced, rendered, live
Ch6 / Ch8 duplications ..... resolved
Chapter 1 .................. two applied, four declined
Jung / Campbell ............ resolved globally
Chapter 2 .................. two applied, two declined, one deferred,
                             one held for the author's sentence
Transitions ................ CLOSED, zero prose interventions
Cosmogonic recurrence ...... OPEN, cross-chapter diction review
Crystal / Indra / cymatics . OPEN, ripens on the Chapter 3 pass
Epigraph provenance audit .. OPEN, book-level, before publication
Heading hierarchy .......... OPEN, mechanical normalization only
Chapters 3-9 ............... not yet passed
Render / upload ............ deferred until the batch completes
```

Two entries above are new classes of open item that no built surface holds. The
crystal/Indra/cymatics question is a **conditional deferral** with a named
ripening event. The epigraph provenance audit is a **book-level job discovered
from a declined chapter-level finding** — it exists because a stylistic finding
was rejected and the real work underneath it became visible. Neither is a note,
and neither attaches to a division.

---

## New failure class — external attribution concealing internal composition

Discovered 2026-09-01, during the whole-book quotation provenance audit that
followed the close of all ten chapters.

**The class.** An epigraph attributed to a famous external authority may in fact
be manuscript language that later acquired that attribution. The false name does
not merely misstate a source — it *conceals the fact that the passage is the
author's own composition*, and it borrows authority the passage never earned.

**Why it is new.** Every earlier finding in this record treats provenance as
fact-checking: is this quotation accurately worded and correctly sourced? This
class inverts the instrument. Here provenance review becomes an
**authorship-recovery instrument**: it recovers writing that the manuscript had
externalized, and returns the question of whether that writing deserves to
stand.

**Why a failed lookup is not the evidence.** "I cannot find Ken Wilber saying
this" does not establish that the author wrote it. The audit therefore carries
two axes — attribution status and, separately, origin status — so that absence
of external evidence defaults to `UNKNOWN`, never to a claim of internal
authorship. `INTERNAL-ORIGIN CANDIDATE` requires positive textual evidence.

**The signature, as first observed.** Chapter 5 opens with two epigraphs
attributed to Rumi and to Clarissa Pinkola Estés that bracket a passage of the
manuscript's own prose. All three share an ornamental compound-adjective
register, the same cosmological diction, and the same cadence. Neither epigraph
is locatable in any source, and authentic Estés material on the same theme reads
nothing like it. Separately, a "Ken Wilber" epigraph *defines* a term —
"soulplay" — that the manuscript's own prose coins two sentences earlier.

**What the class costs if undetected.** The passage keeps borrowed authority; a
real writer is credited with words they did not write; and a compositional
problem stays hidden, because three consecutive passages in one voice look like
a conversation between sources rather than what they may be — one voice,
repeated.

**Instrument change this produces.** Provenance review belongs *after*
developmental adjudication, not before: only once the prose is settled can
stylistic continuity between an epigraph and its neighbours be read reliably.
And it must be run as a census, not quote-by-quote — the pattern is only visible
across instances.

**Status.** Not yet a book-wide conclusion. Under test against Chapters 8 and 6,
which together carry 42 of the remaining attributed quotations.

---

## Product finding — the developmental editor needs the ruling ledger

Writer's Studio produced a structural read of this manuscript on 2026-09-01,
after the ten-chapter developmental pass closed. Six questions; the pattern in
which ones were useful is the finding.

**Three were already adjudicated.** Where Part Two begins, whether Water's
forward-looking conclusion has drifted, whether "Integrated Reflection" closes
Aether — each was decided during the pass, with reasons, and protected. Studio
re-raised all three because it can see structural ambiguity but **cannot see
that the author has already ruled on it**.

That is not a detection failure. Studio's readings were defensible; the seams
genuinely are ambiguous from headings alone. The failure is that a settled
question was returned as an open one, which costs the author the same decision
twice and — worse — invites re-litigation of protected material.

**What a mature Studio should emit instead:**

> *Potential ambiguity detected — previously adjudicated and protected. Not
> re-raised.*

This requires the developmental editor to read a **ruling ledger**: the record
of what has been decided, on what evidence, and with what persistence class.
This record already models the persistence classes (finding expires · decline
persists · deferral persists conditionally · lock can be superseded · applied
edit persists only insofar as the passage survives). The ledger is the missing
input that would let a tool consume them.

**Two were genuinely next-order work**, and would have been lost without the
tool: the appendix promises "The Four Grades of the Elements" while carrying
only Water, Earth and Air, and the back-matter architecture had never received
a canonical read. Studio found real work in exactly the region the human pass
had not reached.

**One was factually wrong, and the error is diagnostic.** Studio reported that
the Four Grades tables "begin abruptly with no appendix heading of their own."
The canonical manuscript carries an explicit `# Appendix` H1 immediately above
them. Studio is either not reading the canonical file or is dropping H1
divisions from its section map — and several of its other seam questions sit at
H1 boundaries, so the same fault may be generating them.

**The composite lesson.** A structural reader without the ruling ledger produces
three kinds of output at once — settled questions re-asked, real gaps found, and
artifacts of its own parsing — and presents them identically. The author cannot
tell them apart without re-deriving the whole architecture. Ledger access would
suppress the first class; provenance about which file was parsed would expose
the third; and what remained would be the second, which is the only class worth
the author's attention.

---

## Provenance as a brake on both false completion and false simplification

The back-matter pass produced the cleanest demonstration so far that provenance
discipline cuts in *two* directions, not one.

**It prevented false completion.** The appendix carries the Four Grades of Water,
Earth and Air. Symmetry argues loudly for writing Fire *and* Aether. An earlier
assembly record describing the section as **"Four Grades (Fire–Air)"** converted
a symmetry argument into a provenance argument: Fire is a genuinely lost member;
Aether was never in the schema. Writing both would have fabricated doctrine and
called it restoration.

**It prevented false simplification.** The adjacent section is titled "The 12
Facets of the Spiralogic Profile" and appeared to contain five. The obvious fix —
retitle to match the count — would have destroyed a real model. Reading the
entries showed Fire, Water, Earth and Air each carry three tagged facets
(*vector / intelligence*, *circle / intention*, *spiral / goal*): 4 x 3 = 12,
exactly as titled. Aether is structurally different and had merely been formatted
as item 5 of the same list. The repair was to the numbering, not the doctrine.

**The generalizable point.** Two adjacent sections, two apparent completeness
defects, two opposite correct remedies — and in both cases the naive fix was
wrong in the direction the surface evidence pointed. What distinguished them was
not editorial judgement but *recoverable history*: an assembly note in one case,
the entries' own tagging in the other. A completeness checker sees only counts,
and would have been wrong twice.

