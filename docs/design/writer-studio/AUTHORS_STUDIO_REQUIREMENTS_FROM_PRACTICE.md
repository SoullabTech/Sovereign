# Writer's → Author's Studio — requirements derived from practice

**Source:** the *Elemental Alchemy* edit, 2026. Every requirement below is
grounded in a **real editorial event** from that book's journey, not an invented
UX scenario. Specimens are named so each can be replayed as a test case.

> **The product principle:** Writer's Studio should not be an AI that edits a
> book. It should be **an environment in which an author can think with an editor
> while remaining sovereign over the manuscript.**

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
