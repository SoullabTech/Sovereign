# Writer's → Author's Studio — requirements derived from practice

**Source:** the *Elemental Alchemy* edit, 2026. Every requirement below is
grounded in a **real editorial event** from that book's journey, not an invented
UX scenario. Specimens are named so each can be replayed as a test case.

> **The product principle:** Writer's Studio should not be an AI that edits a
> book. It should be **an environment in which an author can think with an editor
> while remaining sovereign over the manuscript.**

---

# PRODUCT DOCTRINE — governing · ratified 2026-09-01

> # Author's Studio is not an AI ghostwriter. It is an editorial environment designed to develop the writer while developing the work.
>
> ## The manuscript is the artifact. The authorship is the outcome.

**Everything below in this document is subordinate to those two sentences.**

## The inverse of ghostwriter AI

Most "AI writing" products optimise for **output substitution**: the machine
writes faster, cleaner, more persuasively — and **the person becomes increasingly
peripheral to the work.**

This optimises for **author development.** **The manuscript gets better because
the writer gets better at seeing, choosing, and claiming what they mean.**

| A ghostwriter system asks | Author's Studio asks |
|---|---|
| **"What can I write for you?"** | **"What are you trying to say, what kind of decision are you facing, and how can I help you see it clearly enough to make it yourself?"** |

**That difference determines the entire UX:**

- MAIA **reveals** choices instead of hiding them.
- Suggestions **remain suggestions** until consciously adopted.
- The system **explains what kind of editorial decision is happening.**
- It **remembers rulings**, so authors develop continuity and judgment.
- It can **challenge** the writer **without taking sovereignty.**
- It **distinguishes collaboration from substitution.**
- **Success is not measured only by manuscript quality**, but by whether the member
  has become **more capable of authoring the next page, chapter, or book.**

## ⚠️ This does not require a timid AI

**A great editor is highly active** — proposing a sentence, finding a structural
problem, challenging an argument, identifying a false attribution, suggesting a
different architecture. **All of that is in scope, and holding back from it would
be its own failure.**

> **The distinction is not how much the system does. It is who ultimately does the
> meaning-making.**

**Timidity and substitution are both failures, in opposite directions.** A system
that will not challenge an author serves them as poorly as one that decides for
them.

## Why this is a differentiated position

**It treats authorship as a human capacity worth strengthening rather than a
bottleneck to automate away.**

Every requirement in this document exists to serve that. Where a requirement could
be read two ways, **read it the way that leaves more capacity with the member.**

---


## Two continuous modes, one memory

**Writer's Studio** — where the work is still becoming: writing, developing,
exploring, reviewing, restructuring, testing ideas, recovering voice.

**Author's Studio** — where the work becomes an authored publication object:
provenance, citations, permissions, bibliography, canonical decisions, apparatus,
production, editions, publication history.

> They share the same manuscript, memory, ruling ledger, provenance graph and
> authorship record. **There must be no destructive handoff where Writer's Studio
> forgets how the book became what it is.**

---

## Required capabilities

### 1 · Developmental reading
Structure, pacing, repetition, chapter purpose, transitions, hierarchy, argument,
narrative movement — **without assuming every detected difference needs repair.**
*Specimen: the Ch10 H2 flattening; the protected Water→Earth handoff.*

### 2 · Finding → ruling → implementation
The editor identifies; **the author decides**; only then does the manuscript
change. **Declined, protected, deferred, superseded and resolved findings must all
survive.**
*Specimen: 13 declines against 9 applied changes in the first capture record.*

### 3 · Canonical manuscript awareness
Always know which version is authoritative. **Never confuse an old PDF, imported
draft, transcript or earlier assembly with the current manuscript.**
*Specimen: 23 of 24 legacy findings had expired against a non-canonical file.*

### 4 · Ruling ledger
Once "protect this transition," "this chapter length is intentional," or "Aether
functions as Source/Weaver/Return" is decided, **the Studio remembers and does not
reopen it.**
*Specimen: Studio re-raised three settled part boundaries because it could see
ambiguity but not adjudication.*

### 5 · Provenance auditing
Distinguish exact quotation · variant · translation · adaptation · misattribution
· unverified attribution · internal-origin candidate · cultural attribution ·
source displacement · transmission drift.
*Specimen: the five-pattern taxonomy plus four cross-cutting flags, all earned
from real items.*

### 6 · Authorship recovery
Detect when language may have **originated inside the manuscript and later
acquired outside authority** — then ask whether it should be **reclaimed as the
author's prose** rather than blindly deleted.
*Specimen: 9 internal-origin candidates across Ch2 and Ch5, in two different
surface forms.*

### 7 · Source mediation
**"Rumi" is not enough when the printed English is Coleman Barks. "Nietzsche" is
not enough when the English arrived through Frankl. "Black Elk" may involve
Lakota → interpreter → editor.**
*Specimens: Barks ×2 · Bahm/Lao Tzu · Frankl/Nietzsche · Craufurd/Weil ·
Clarke/Coelho · Winston/Jung · Neihardt–Brown/Black Elk.*

### 8 · Copyright / permissions triage
**Provenance and legal usability are separate axes.** A perfectly verified poem,
lyric, translation or long modern quotation may still require permission or
replacement.
*Specimen: the MLK entry is the audit's best-sourced item and its first
`LEGAL REVIEW` flag.*

### 9 · Bibliography reconstruction
Generated **downstream from verified manuscript dependencies**, never trusted as
proof. Must detect wrong works, **famous-work substitution**, **spurious
support**, misplaced sources, translation editions and genuine omissions.
*Specimen: 10 famous-work substitutions; a real Feynman title cited for a quote
he never said.*

### 10 · Cross-book intelligence
Duplicates, repeated quotations, recurring images, conflicting formulations,
author clusters, terminology and **conceptual homes** visible across the whole
manuscript.
*Specimen: the sulfur/salt/mercury conflict resolved by locating Ch3 as the
concept's home.*

### 11 · Hypothesis testing without overreach
Notice a correlation, **mark it as a hypothesis, test it prospectively, and kill
it when the evidence fails** rather than rationalizing it.
*Specimen: the dash-blocking hypothesis — pre-registered, falsified by Earth,
struck.*

### 12 · Back-matter and apparatus editing
Contents, appendices, bibliography, notes, acknowledgments, afterword, reference
structures and **promised models** all need structural validation.
*Specimen: "The Four Grades of the Elements" promised five, delivered three;
"12 Facets" delivered five entries that were correctly twelve facets.*

### 13 · Authorial doctrine / book ontology
Canonical book knowledge that guides later editing **without being silently
generalized to every other manuscript.**
*Specimen: Aether as Source/Weaver/Return — which dissolved a doctrinal-mismatch
flag once recorded.*

### 14 · Batch adjudication and controlled repair
**Finish a census first when findings interact**; then present a decision set —
`KEEP` · `RESTORE` · `REATTRIBUTE` · `ADAPT` · `RECLAIM` · `REMOVE` — and apply
approved changes together.
*Specimen: the Campbell set, which split only once all four were investigated.*

### 15 · Publication QA
Typography, quotation formatting, headings, Contents, page geometry, references,
plate checks, **font embedding**, page count, spine calculation, final artifact.
*Specimen: the variable-font rasterization bug — 0 `/BaseFont`, ~660 image
objects.*

### 16 · Editorial provenance of the edit itself
The Studio must be able to answer: **What changed? Why? Who authorized it? What
evidence supported it? What was considered and declined?**

---

## Cross-cutting design requirements the practice forced

**Claims carry status.** `impression` / `lead` / `verdict`. A system that renders
all three in one voice reproduces the failure it exists to detect.
*Specimen: a passing "sound as attributed" note that the census overturned 80
items later.*

**Verification must be able to overturn the editor's own prior**, not only the
manuscript's claim.
*Specimen: a confident Heisenberg attribution that was itself a documented
misattribution.*

**External-circulation search runs before an internal-origin flag, not after.**
*Specimens: two withdrawn flags — one on register, one on conceptual fit.*

**Grouping is evidential and recomputed on completion.**
*Specimen: four author sets formed, three dissolved.*

**Operate below the byline.** Identify where authentic source text ends and later
composition begins.
*Specimen: Dickinson's genuine opening line welded to a modern gloss.*

**Corpus density modulates negative evidence** — and absence never yields
`MISATTRIBUTED` on its own.

**Scope checks globally before declaring absence.**
*Specimen: a dozen `MISSING` verdicts corrected once the whole bibliography was
checked rather than one section.*

**Thematic fit proves nothing — and models are especially vulnerable here.**
*"That sounds like something Duchamp / Jung / Rumi would say"* is the single most
dangerous reasoning step in provenance work, because it is fluent, confident, and
frequently correct-sounding. The Studio must treat thematic compatibility as
**neither evidence for nor against** an attribution, and must never let a
plausibility judgment substitute for a source check.
*Specimens: Duchamp — documented alchemical preoccupations, sentence unlocatable.
Sai Baba — an apparent doctrinal contradiction that dissolved once the tradition's
own internal distinction was checked.*

**Identity disambiguation precedes source verification.** Where a name is
ambiguous, resolve *which person* before verifying *what they said* — otherwise
the system produces its worst false positive: real person, real source, wrong
individual.
*Specimens: two John Perkinses; two Thomas Fullers.*

**Self-citation circularity must be detected and excluded.** An author's own prior
publications — blog posts, site pages, earlier books, studio content — routinely
surface as top search results for their own manuscript's attributions. **They
corroborate nothing; they are the same claim in another location.** The Studio
must know which domains the author controls or contributes to and exclude them
from the evidence base. **Self-publication may establish internal circulation and
chronology; it cannot independently verify external attribution.** Sole
self-attestation yields `NO INDEPENDENT EXTERNAL ATTESTATION + INTERNAL
CIRCULATION ESTABLISHED` — **not** internal origin, since a quotation may have
been imported from a now-lost source and then propagated only internally.
*Specimens: the "Soulplay" definition findable only on the author's Book Studio
page; a Teasdale attribution whose top result was the author's own Medium
publication (independent listings rescued that one).*

**Whose domain matters — the inverse of the circularity rule.** The exclusion
applies to **the quoting author's** domains only. **The quoted author's own
official channel is among the strongest evidence available**, and a system that
distrusted author-controlled sources generically would discard its best
verifications.
*Specimens accepted: Plum Village (Thich Nhat Hanh) · cmichaelsmith.com · Tolle's
official accounts · Joseph Campbell Foundation · the Santayana Edition · the King
Institute. Specimens excluded: the quoting author's own Book Studio and Medium
pages.*

**The author can make an authoritative provenance ruling about their own
manuscript — and the system must accept it.** Stylistic inference, absence of
external circulation, and register analysis are *circumstantial*. The author has
**direct knowledge of how the book was written**. A Studio that kept treating its
own inference as more authoritative than the author's testimony would invert the
sovereignty the product exists to protect.
*Specimen: nine passages carried as `INTERNAL-ORIGIN CANDIDATE` through an entire
census — correctly, since the evidence was circumstantial — and closed by a single
authorial ruling. The census's job was to surface them and refuse to guess; the
author's job was to answer.*

**The corollary:** once authorship is settled, the remaining work changes shape
entirely. "Whose words are these?" becomes "were my words wrongly framed as
someone else's?" — and the verdict set changes with it. The Studio must be able to
**re-scope a workstream on an authorial ruling**, not merely record the ruling and
carry on with the old questions.

---

## Governing principle for the whole system — ratified 2026-09-01

> **Make the intellectual lineage more truthful so the original thesis can stand
> more fully in its own authority.**
>
> **Let the sources be sources. Let the synthesis be the author's.**

**The Studio must not optimize toward more citations, more authorities, more
polish, or more apparent erudition.** A system that rewards visible scholarship
will push every author toward borrowed authority, which is the exact failure this
manuscript's census found. The Studio's job is the opposite: help the author
distinguish **lineage from authority, influence from ownership, and information
from lived knowing.**

**Operative test it must encode:** *a quotation stays because it deepens,
challenges, historicizes or illuminates — not because it certifies.* "An
authority agrees with me" is not a reason to keep a quotation.

### Capability — three provenance categories the system must hold apart

Established by authorial ruling during the Stage 3b pass:

> **source dependency ≠ lived-experience synthesis ≠ fictional composite.**

- **Source dependency** — the work takes something identifiable from outside
  itself. *Auditable.*
- **Lived-experience synthesis** — the author's own participation, memory,
  practice or clinical observation. **Has no external source to cite.** A
  ceremony attended is not a text retold.
- **Fictional composite** — an overtly constructed character or example. **Has no
  provenance question at all.**

**Grounding event:** entering Stage 3b, the ceremonial thread (five passages) and
the composite figure Maya were the largest candidate sets. **Both dissolved** —
not for lack of evidence, but because they were never the audited category. A
system that flags every non-literal passage as potentially borrowed would have
generated a large volume of false findings and taught the author to distrust
their own lived material.

### Capability — a five-part editorial test the system can apply per passage

**Protect** lived observation and original synthesis · **Credit** lineage
precisely · **Remove** decorative authority the prose already carries ·
**Prefer** the author's formulation over a quotation that says it less well ·
**Keep** only external voices that deepen rather than certify.

### Capability — judge a quotation together with its frame, never alone

> **A quotation's function is not fixed by the quotation. It is fixed by what the
> prose around it does.**

**Grounding event (Stage 4A, 2026-09-01):** the same sixty words of Wayne Teasdale
opening Chapter 10 were ruled `REMOVE` as certification, reversed to `KEEP` as
philosophical kinship, and then **made** kinship on the page by a paragraph the
author wrote beneath them. **The quotation never changed.**

**Requirements this generates:**
- The unit of provenance judgment is **the quotation plus its frame.** A system
  that adjudicates quotations in isolation cannot see the difference between
  borrowed warrant and named kinship, and will remove the second as if it were the
  first.
- **Certification and kinship must be distinguishable** in the model: *"X agrees,
  therefore I am legitimate"* versus *"X articulates an orientation I share and I
  want their voice in the conversation."*
- **A third repair form must exist** beside remove and reattribute: **write the
  frame that makes the real relationship visible.** The strongest signal that a
  quotation is not a warrant is that **the author answers it** — Teasdale speaks of
  traditions as common heritage; the paragraph accepts the company and declines the
  collapse.

### Capability — a six-function model, and a restrained third repair form

**Six functions a quotation may serve** (more than one at a time):
`CERTIFICATION` (supplies standing — **the only disqualifying one**) ·
`KINSHIP` · `DIALOGUE` · `ILLUMINATION` · `HISTORICIZATION` · `CHALLENGE`.

**The `FRAME / ANSWER` repair must carry a restraint**, or the system will learn to
rescue any weak quotation by generating prose around it. Available only when: the
voice already earns a place · the author has a real relationship to what it says ·
making that relationship explicit adds something the manuscript needs · **and the
new prose would still be worth saying if the quotation disappeared.**

**The fourth test is the one a system can actually apply. The second cannot be
assessed from the manuscript at all** — only the author knows whether the
relationship is real. **A system must therefore mark `FRAME/ANSWER` proposals as
conditional on an authorial answer, never assert them.**

**Grounding event:** applied to six reopened Stage 4A items, the restraint moved
only two. Without it, all six could have been rescued with plausible-sounding
prose.

---

# THE HEURISTIC LIBRARY — the central product conclusion

**Ratified 2026-09-01, at the close of Stage 4A.**

> **For a first-time author, the hard part is usually not generating more prose. It
> is knowing what kind of decision they are looking at.**

**Heuristics turn an overwhelming manuscript into a sequence of understandable
judgments.** That — not drafting, not polishing — is the Studio's central function.

Every heuristic below was **earned through an actual editorial event on a real
manuscript**, not designed in the abstract. The grounding event is named so none
of them can drift into slogan.

## The library

| # | Heuristic | Earned at |
|---|---|---|
| 1 | **A quote must earn the interruption of another voice.** | Stage 4's governing question |
| 2 | **If the relationship is real but unclear, unite the quote to the manuscript with the smallest truthful frame.** | Teasdale · Campbell |
| 3 | **If the quote is gratuitous or misplaced, remove it — then ask whether the manuscript needs more meaning in its own voice.** | the 19 4A removals |
| 4 | **Let sources be sources; let synthesis belong to the author.** | Stage 3b north star |
| 5 | **A quotation plus its frame is the unit of judgment, not the quotation alone.** | the same sixty Teasdale words read as certification, then as kinship, untouched |
| 6 | **Do not confuse agreement with lineage.** | the Teasdale reversal |
| 7 | **Do not use authority merely to certify something the manuscript has already earned.** | the `CERTIFICATION` function |
| 8 | **A source can deepen, challenge, historicize, illuminate, locate the work in lineage, or enter into dialogue.** | the six-function model |
| 9 | **A detected problem is not automatically permission to rewrite it.** | findings-only discipline across Stages 2, 3b, 4 |
| 10 | **A missing heading, bridge, epigraph, or symmetrical structure is not automatically a defect.** | Chapters 1/3/5/8 opening without epigraphs; the Chapter 10 H2 flattening |
| 11 | **If a source relationship is borrowed but the interpretation is yours, make the boundary visible.** | Haramein · Four Yogis · Edinger's seven operations to five |
| 12 | **Lived experience is not a source dependency. A fictional composite is not a disguised citation problem.** | the ceremonial thread · Maya |
| 13 | **Provenance, editorial value, and rights are three different questions.** | Bear Heart — `EDITORIAL KEEP · RIGHTS HOLD` |
| 14 | **Plausibility is not evidence. "That sounds like Jung" is not provenance.** | the whole internal-origin lane |
| 15 | **When evidence disproves an attractive theory, kill the theory.** | the pre-registered dash hypothesis, falsified by Earth and struck |

## How they must be delivered — coaching, not rules

**These must not appear as a rulebook dumped on the member.** They should surface
as **contextual coaching at the moment of the decision**, phrased as questions the
member answers — never as verdicts the system issues.

| The member does this… | …the Studio quietly asks |
|---|---|
| inserts an epigraph | **What is this voice doing here — illuminating something you cannot say alone, locating you in a lineage, or simply agreeing with you?** |
| cites a thinker | **Which part comes from them, and which part is your own synthesis?** |
| a section feels thin after a quotation is removed | **Did the quote leave a genuine hole, or did it reveal that the section already stands on its own?** |
| feels anxious that one chapter doesn't match the others | **Is this a structural defect, or is this chapter allowed to have its own form?** |

**Each question maps to a heuristic, but the member never has to learn the
heuristic to benefit from it.** They learn it by making the judgment.

## The binding constraint — no literary ideology

> **The heuristics must help the member see the choices an experienced editor
> sees, while keeping the decision with them.**

This is a **hard constraint, not a preference.** A system that encodes a house
style, a prose ideal, or a citation posture will produce manuscripts that converge.
The heuristics above are **diagnostic, not prescriptive**: every one of them names a
*distinction* the author then rules on. **None of them contains a preferred answer.**

**Test for any future heuristic:** *does it tell the member what to choose, or does
it show them what kind of choice they are making?* **Only the second may ship.**

## Why this is the real promise

> **For a first book especially, this is the difference between**
> **"AI helped me produce a manuscript"**
> **and**
> **"I learned how to become the author of my book."**

**That is the Studio's actual product.** The manuscript is the artifact; **the
authorship is the outcome.** A system optimizing for the first will reliably
undermine the second — it will make the decisions rather than reveal them, and the
member will finish with a better book and no more capacity than they started with.

**This makes the Studio a teacher of authorship rather than an editor**, and it is
the standard every other requirement in this document should be read against.

---

### Capability — never collapse suggestion, edit, and adoption into "generated content"

*⚠️ Read this section under THE COLLABORATION DOCTRINE at the end of this document, which governs it. The four states below are **developmental history, not a disclosure regime** — and the boundary that matters is authorial sovereignty versus unexamined substitution, not author words versus editor words.*

> **Suggested language does not become part of the book merely because an editor or
> a model generated it. It becomes part of the authored manuscript when the author
> consciously accepts it.**

**Four states must remain distinguishable for every span of text.** Collapsing them
into "AI-generated" is both false and corrosive — it tells an author that anything
a system touched is not theirs, which is the opposite of what this document is for.

| State | Meaning |
|---|---|
| **`EDITOR/MODEL SUGGESTION`** | proposed, **not adopted**. Has no standing in the manuscript |
| **`AUTHOR-EDITED SUGGESTION`** | proposed by the system, **reworked** by the author before acceptance |
| **`AUTHOR-ADOPTED`** | proposed by the system, **accepted unchanged** after conscious review |
| **`AUTHOR-ORIGINATED`** | **the author's own wording**, including wording offered provisionally inside a discussion and later confirmed |

**Grounding event (Stage 4A, 2026-09-01):** the Campbell frame was nearly recorded
as `AUTHOR-ADOPTED` — model-proposed, author-accepted. **It was neither.** The two
sentences were written by the author inside a ruling, marked *"not necessarily
those exact words,"* and placed verbatim precisely because composing a relationship
to Campbell on the author's behalf was forbidden. **A system tracking only three
states would have mislabelled the author's own sentences as its output, inside a
provenance audit.**

**Requirements:**
- **Record the originator, not only the adopter.** The adoption pipeline —
  *proposal → review → adoption → canonical* — looks identical from the outside
  regardless of who wrote the first draft of the span.
- **Wording an author offers provisionally inside a conversation is still theirs.**
  Hedging it ("something along the lines of") does not transfer authorship to the
  system that places it.
- **`AUTHOR-ORIGINATED` must be the default assumption for any span traceable to
  the author's own message**, and the system must not claim credit by default.

---

# THE COLLABORATION DOCTRINE — governing, ratified 2026-09-01

**This supersedes any purity framing elsewhere in this document, including the
defensive posture in the four-state capability above.**

## The boundary is not where it looks

> **The important boundary is not `author words vs. editor words`.**
> **It is `authorial sovereignty vs. unexamined substitution`.**

A real author–editor relationship has **never** meant every sentence originates in
isolation from one mind. Editors suggest language, challenge structure, sharpen
distinctions, propose transitions, ask better questions, and sometimes offer a
sentence the author reads and says *"yes — that is exactly what I mean."*

**Once knowingly adopted, shaped, or authorized, it is part of the authored work.**

## What the system may and may not do

| MAIA **may** | MAIA **may not** |
|---|---|
| propose | let anything **silently** become canonical |
| help formulate | substitute for a judgment the author did not make |
| challenge, develop, clarify | mark adopted language with a scarlet letter |

**The author may accept language exactly, revise it, combine it with their own, or
reject it.** All four are authorship. **Only the unexamined path is not.**

## Provenance serves the author

**Internal provenance is preserved — because it helps everyone understand how a
passage developed.** But **that record exists to support the author, never to
undermine authorship.**

> **Once deliberately accepted, adopted language becomes part of the manuscript
> without needing a label announcing that a system was involved in its formulation.**

The four states above are therefore **developmental history, not a disclosure
regime.** They answer *how did this passage come to be?* — a question that helps
revision. They do not answer *who is allowed to claim this?* — a question already
settled by the act of conscious adoption.

## The traditional-editor analogy that governs

| Stage | Meaning |
|---|---|
| **Suggested** | the editor offered it |
| **Reworked** | author and editor shaped it together |
| **Adopted** | the author says *this expresses what I mean; it belongs* |
| **Canonical** | it is part of the book |

**That is collaboration**, and it is what a publishing house has always done. **The
Studio is not inventing a new category of authorship. It is instrumenting an old
one.**

## ⚠️ The Studio's voice requirement — revised

**Not:**

> ~~"Preserve the author's original voice."~~

**But:**

> **Help the author develop a voice they recognize as their own — even when that
> voice emerges through dialogue, challenge, and collaboration.**

**The first formulation is an artificial purity test**, and it is the wrong target.
It would freeze an author at whatever voice they arrived with and treat every
editorial exchange as contamination — the opposite of what an editorial
relationship is for.

**The revised formulation describes what actually happened to *Elemental Alchemy*.**
The book's voice at the close of Stage 4A is not the voice it had at the start; it
is more clearly the author's *because* of the dialogue, not despite it. Sources
became sources. Synthesis became claimed. Certification fell away. **None of that
happened by preservation.**

## The test that matters

> **By the end, the author stands behind every sentence and recognizes the book as
> theirs.**

**That is the standard** — not the provenance of any individual phrase.

---

### Capability — editing versus ghostwriting, and the enumeration trap

> **Editing reveals and develops the author's choices. Ghostwriting substitutes for
> them.**

The dividing line is **not whether the editor ever offers words** — editors do that
constantly. **It is who owns the judgment.** A real editor helps the author see
choices: *this argument is unclear · this source is doing too much work · this
paragraph repeats itself · this image is stronger than the explanation around it ·
this quote adds lineage, this one only adds prestige · this section needs a bridge ·
this sentence could be sharper.* **Then the author decides.** A ghostwriter supplies
the underlying prose as the service; the client may approve it, but the expression
is being created on their behalf.

**The system test:**

> **After this intervention, does the member understand their manuscript and their
> own decision better — or did the system simply make the decision for them?**

**If the second, the Studio has crossed from editorial collaboration toward
ghostwriting.** This does not mean MAIA may never suggest a sentence. It means the
suggestion must sit inside a process where the member can understand **why it was
suggested, what problem it solves, what alternatives exist, and whether it actually
expresses what they mean.**

### Capability — test every enumeration by what depends on it

> **An enumeration is only as good as its pattern. A system that counts quotations
> by typographic form will silently miss the ones that matter most — the decorative
> ones sit alone on a line; the load-bearing ones are woven into the sentence that
> depends on them.**

**Grounding event:** the Stage 2 census reported **137 of 137 complete** — true, and
complete-looking. It had enumerated block-level quotations only. **Nine inline
quotations, every one carrying an explicit lean-in verb, were never counted.** The
gap was invisible from inside the census and became visible only when Stage 4B
asked a question the census could not answer — **the second scope gap of exactly
this shape**, after narrative dependencies produced Stage 3b.

**Requirement:** a census must declare its **matching pattern** alongside its count,
and the system must **re-test that pattern whenever a later stage depends on it.**
"N of N complete" without a stated scope is a claim the enumeration cannot support.

### Capability — prove an inventory by running a thin downstream probe

> **An inventory is only proven complete when a downstream operation can
> successfully rely on it.**

**Design principle:** *before declaring a census complete, ask the next stage's
question against it. If the next stage finds objects the census cannot represent,
the ontology is incomplete.*

**Grounding events — twice, the same shape:**
- **Stage 3b** exposed unquoted narrative dependencies, because bibliography
  reconstruction needed them.
- **Stage 4B** exposed inline quotations, because argument analysis needed them.

**Neither was found by auditing the census.** Both were found by trying to use it.
A census inspected on its own terms reports *"137 of 137 complete"* — true, and
complete-looking, and wrong about its own scope.

**Requirements:**
- **State the matching pattern beside every count.** *"N of N"* without a declared
  scope is a claim the enumeration cannot support.
- **Run a thin downstream probe before closing an inventory** — a handful of
  next-stage questions, not the full stage. The nine inline quotations were found
  by a single signal scan that returned zero and should not have.
- **A zero result on a well-formed probe is a finding about the inventory, not
  about the corpus.** This is the tell, and it must be surfaced rather than
  reported as a clean pass.

### Capability — "quotation" is not one object type

> **Typography predicts function imperfectly but meaningfully.**

**Grounding event (Stage 2c):** block epigraphs tended toward **threshold and
atmospheric authority** — across 45 of them, **none** was structurally load-bearing.
Inline quotations were **far more likely to be woven into an argument, to carry an
unnamed translator, and to be depended upon**: 1 of 9 explicitly load-bearing, 2
more leaning, 3 of 9 with unnamed translators, and **the book's longest quotation
and highest rights exposure among them.**

**The Studio must model at least five quotation types**, because each carries
different editorial questions:

| Type | The question it raises |
|---|---|
| **`EPIGRAPH`** | does this voice earn the threshold, or only decorate it? |
| **`INLINE EVIDENCE`** | does the argument *depend* on this? what happens to the claim if it collapses? |
| **`INLINE ILLUSTRATION`** | does this voice do something the prose cannot? |
| **`DIALOGUE / RESPONSE`** | is the author answering this source, and is the boundary visible? |
| **`PERSONAL COMMUNICATION`** | is there consent? *(no published source, no bibliography obligation, no permissions clearance — the only instrument is the speaker's agreement)* |

**A system treating all five as "quotation" will ask epigraph questions of
load-bearing evidence** — which is precisely how the most structurally dependent
quotation in this manuscript passed a complete census unexamined.

### Capability — verify the speaker, not only the author

> **The work and the author can both be correct while the manuscript assigns the
> words to the wrong speaker inside the work.**

**Grounding events:** *"To thine own self be true"* — **Polonius**, a windbag who
does not follow it. *"The mind is its own place…"* — **Satan**, newly fallen,
insisting he can manufacture his own heaven. Both were cited as authorial wisdom;
**both were verified correct at every level ordinary attribution checking
inspects.**

**Requirement:** for any quotation from drama, epic, dialogue or fiction, the model
must carry a **speaker** field distinct from **author**, and flag when a
character-spoken line is introduced as the author's own position.

### Heuristic — for literary quotations, author + work + wording is insufficient

> **Verify the speaker and the dramatic context.**

**Polonius and Satan demonstrate why: a quotation can be textually perfect and
interpretively backwards.** A third specimen — **Hotspur**, in *Henry IV Part 1*,
justifying the rebellion that kills him — confirms it is a pattern, not two
accidents.

**Five outcomes the model must support:** `AUTHORIAL/NARRATORIAL VOICE` ·
`CHARACTER VOICE, CONTEXT PRESERVED` · `CHARACTER VOICE, CONTEXT LOST` ·
`SPEAKER MISATTRIBUTION` · `IRONIC/UNRELIABLE SPEAKER`.

**Extends to scripture.** *"Be in the world but not of it — John 17:16"* carries the
same defect in a different costume: the citation names book, chapter and verse but
not the speaker — **and the check that asks who is speaking is what revealed that
the phrase does not appear at that verse at all.**

**The general lesson, which is the useful part:** *a well-formed question asked of
the right population returns findings outside its own axis.* The speaker sweep
produced two speaker defects — and also a false verse citation, a three-layer nested
attribution, a duplicate-linkage discovery, and a rights reclassification. **Narrow,
well-aimed passes are worth more than broad re-verification.**

---

# THE INTERACTION MODEL — ratified 2026-09-01

> **The heuristics are the interaction model of the Studio, not a reference page
> buried in settings.**

**The failure to avoid: a checklist that nags the writer.** The member should
experience the heuristics as **timely editorial questions arising from the
manuscript itself**, at the moment the manuscript raises them.

## The loop

1. **In the manuscript** — MAIA notices something: a quotation, a repeated image, a
   weak transition, a source dependency, a structural asymmetry.
2. **In the margin / review rail** — **not** *"Remove this quote."* Instead:
   **"What is this voice doing here — adding insight, locating you in a lineage, or
   confirming something you already say?"**
3. **When the member answers** — the Studio offers the relevant choices —
   **Keep · Connect · Reframe · Remove** — **without privileging one.**
4. **If they choose Connect** — MAIA can help articulate the relationship, but the
   proposed prose is **visibly suggested, never silently canonical.**
5. **Once accepted** — it becomes part of the manuscript, and **the ruling ledger
   records the decision so the same question is not repeatedly reopened.**
6. **Behind the scenes** — provenance, rights, bibliography and editorial history
   stay available **without cluttering the writing surface.**

## Three depths

| Depth | Contains | Character |
|---|---|---|
| **Writing surface** | the book | **quiet.** The book remains primary |
| **Editorial layer** | contextual questions, findings, options, comparisons, local decisions | active only where the manuscript raises something |
| **Author's record** | ruling ledger · provenance graph · source relationships · declined and deferred findings · permissions · bibliography · publication state · how passages developed | complete, and never in the way |

**This is what lets a first-time author work simply while an experienced author
opens the deeper machinery.** The depth is available, not imposed.

## Heuristics that deserve dedicated UX patterns

| Object | Pattern |
|---|---|
| a quotation | **"What relationship does this voice have to yours?"** |
| a source-dependent passage | **visually separate `Source` / `Your synthesis`** |
| a structural finding | **"Potential asymmetry detected"** — *never* "Missing heading" |
| a speculative pattern | marked **`Hypothesis`**, with a way to **test it and later kill it** |
| a proposed sentence | **`Suggested → Revised → Adopted`**, *never implying that collaboration diminishes authorship* |

## ⚠️ The governing UX constraint

> ### The coaching question cannot contain the verdict.

**This governs the entire interface.** Every one of the patterns above is
constructed so the system **reveals what kind of choice the member is making, then
lets them make it.** *"Potential asymmetry detected"* and *"Missing heading"*
describe the same observation; **only the first leaves the judgment with the
author.**

## The product progression

| Stage | The member is… |
|---|---|
| **Write** | making something |
| **Develop** | discovering what it is becoming |
| **Explore** | testing possibilities and relationships |
| **Review** | seeing the manuscript clearly and making decisions |
| **Publish / Author** | establishing provenance, rights, apparatus, editions, canonical authorship |

**The same heuristics appear differently at each stage.** Early on they are **gentle
prompts**. Later they become **rigorous publication gates.** *A quotation's
relationship is a curiosity in Develop and a clearance requirement in Publish —
the same question, different force.*

**This is how the Studio serves a first book without being dumbed down for a
tenth.**

## The closing standard

> **The UI should not teach fifteen rules. It should create fifteen kinds of moments
> in which the member gradually learns to think like an author.**

**Test for any proposed feature:** *does it create a moment, or does it deliver a
rule?* A feature that delivers rules produces compliance. A feature that creates
moments produces judgment — **and judgment is the thing the member keeps after the
book is finished.**

### Heuristic — a fixed pattern is not a right pattern

> **Fixing a detection pattern once does not make it correct. Test the pattern
> against the corpus, not against the case that exposed it.**

**Grounding event:** the quotation census was extended twice and was wrong both
times. Block-only missed inline quotations — **a real ontological gap.** The
corrected inline pattern then missed two further punctuation forms — **not an
ontological gap at all, just a bad regex.** Three typographic forms of quotation
existed; the count moved 137 → 146 → 150.

**Requirement:** when a scope gap is found, **re-derive the pattern from the corpus
and re-run it whole.** Patching for the discovered instance leaves the same class of
gap in place, and the next probe will find it.

**Corollary for the manuscript itself:** where a corpus permits several
typographic conventions for the same object, **normalising the convention is a
structural fix worth more than any single recount.**
