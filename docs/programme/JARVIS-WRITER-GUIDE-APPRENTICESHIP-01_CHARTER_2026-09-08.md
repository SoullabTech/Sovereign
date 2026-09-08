# JARVIS-WRITER-GUIDE-APPRENTICESHIP-01

## `WRITER'S STUDIO — CREATIVE APPRENTICESHIP & MAIA WRITER GUIDE`

**Opened**: 2026-09-08, founder act. **Branch**: `claude/jarvis-flow-architecture-w2gont`
**Standing**: RECOVER + RECONCILE **COMPLETE** · DISCOVER not opened · nothing built.

**Mission** *(founder)*: develop Writer's Studio into an environment where people can
discover and develop their capacity for writing and other language-centered creative forms
— serving experienced writers **and people who do not yet believe they are writers** —
along `explore → discover → learn → practice → develop → create → offer`, while preserving
human authorship, voice, creative agency, uncertainty, and the possibility that a Work's
form has not yet been discovered.

> **MAIA serves as Writer Guide. MAIA must not become the hidden author of the member's
> Work.**

### Lane boundaries

| | |
|---|---|
| **This lane** | how the Studio helps a person discover, learn, practice and develop a form of creative expression, with MAIA as Writer Guide |
| **`JARVIS-IDEA-WORK-BRIDGE-01`** | how creative material relates to a Work. **This lane consumes that relationship and does not redefine it.** |
| **Writer's Studio R&D** | what a Work is · what an expression is · the Studio's ontology |
| **WS2-07 / WS2-08** | the developmental reader and manuscript structure lanes — **cited, not reopened** |

⛔ **Do not create a parallel Writer's Studio.** Develop inside the existing architecture.
⛔ Return findings before changing production behavior. **Nothing is built in this act.**

---

## 1. RECOVER — the eight reported findings

Read-only census, 2026-09-08.

### 1.1 What already exists that serves Creative Apprenticeship — *far more than expected*

| Capability | Where | State |
|---|---|---|
| **Developmental Reader** | `lib/manuscript/developmentalReader/*` (BUILD-07B), `developmentalReading/*` (07C), `development/*` (07A) | **substantially built and deeply ratified** — 7 lenses, 8 phenomena, frozen evidence, server-minted reading identity, coverage declared |
| **Anchored Ask** (conversation) | `app/api/sovereign/manuscripts/[id]/ask`, `lib/manuscript/ask/*`, contract `WS2-05B-8B-02c-1` | live — a conversation about a Work that **structurally cannot write the Work** |
| **Structure proposals → member adoption** | `.../structure/proposals`, `/adopt` | live — MAIA proposes, **only the member adopts** |
| **Keeps** (marking one's own lines) | `/api/sovereign/keeps` | live — the member's noticing, verbatim, never originated by the system |
| **Source ⇄ working draft custody** | `lib/manuscript/source/*`, `20260824000001_manuscript_source_custody` | live |
| **Living Work ontology** (`form`, `stage`, materials, expressions) | `lib/livingWork/*` | ratified |
| **Creative genealogy** | `JARVIS-IDEA-WORK-BRIDGE-01` | law ratified, DESIGN authorized, **not built** |

**⭐ The seven lenses are a stance architecture already** — `structure · development ·
continuity · arc · voice · coherence · reader`, each a ratified *editorial question* with
its meaning rendered verbatim to the reader (`LENS_MEANING`, WS2-07-F1). This is the
extension point.

### 1.2 Where MAIA currently crosses from guidance into authorship — **nowhere found**

The census looked for *write-for-me*, rewrite, continuation, drafting and generative paths
in the Studio. **It found none**, and found the opposite: an architecture that refuses
authorship *structurally* rather than by policy.

- **Ask route**: *"does not import `proposalStore`, `structureService`, or any adoption
  path … gate 7 as a property of the module graph rather than a promise in a comment,"*
  asserted by `askRuntimeCannotWrite.test.ts`. **ZERO BODY READS** — no section prose is
  loaded, sent, or storable.
- **Developmental Reader**: *observation-only v1* — **absent by construction**:
  interpretation · questions · possibilities · uncertainty · severity · priority ·
  confidence · score · rank · **any prose of the Work**.
- **Proposals**: no client POST can create a reading; and the surface must not summarize
  MAIA's account, because *"a rewrite here would be the surface speaking in her voice."*
- **Keeps**: a keep *"cannot originate text"* — the passage is re-verified verbatim.

> **The authorship law this lane was going to have to establish is, to a large degree,
> already the built behaviour of the Studio.** That is the single most consequential finding
> of the census: this lane's risk is not repairing an authorship breach, it is **introducing
> the first one**.

### 1.3 Stance/mode architecture — extend the lens, do not invent a stance

There is no `WriterGuide` stance object. But **the lens is the commissioning unit**: exactly
one lens per reading (A2/A3), closed vocabulary, meanings ratified. A stance is a *reason to
read*; a lens is *the question read under*. **Extend lenses and the commissioning grammar;
do not build a parallel mode system beside them.**

### 1.4 Form assumptions already present — **the manuscript is the only expression**

```ts
const DECLARABLE_TYPES = ['manuscript'] as const;   // living-works/[id]/expressions
```

The ontology is open by ratified design (`expression_type` is open TEXT, *"a workbook, a
course, a retreat and a framework are expressions whether or not the Studio can yet hold
them"*). **The implementation admits exactly one.**

And the built lenses — structure, continuity, arc — are **book-shaped**. Poetry's craft
(line, silence, compression, sound) has no lens, and a poem has no expression type.

### 1.5 Is form being imposed too early? — **not in the ontology; yes in the implementation**

R-01 and BL-18 permit a Work to exist with no form, permanently. But **to be worked on at
all, a Work must become a manuscript** — sections, headings, structure, working draft.

> **A member may hold a formless Work and may not develop one.** The uncertainty the Product
> Thesis protects is representable in the schema and unreachable in the product.

**This is the central finding for apprenticeship.** *"Something is trying to emerge and I
don't know what it is yet"* is exactly the state §5 of the founder's brief requires the
Studio to sustain — and the only door into development currently converts it into a
book-shaped artifact.

### 1.6 Smallest first implementation

**Not** a craft curriculum. See §3 — the series begins by opening the **low door** and by
making **generation's absence explicit** before any generative capability is contemplated.

### 1.7 Which questions belong where

| Question | Owner |
|---|---|
| May a Work declare a non-manuscript expression? Which? | **Writer's Studio R&D** (blocking A3) |
| May the developmental reader interpret / offer possibilities (v2)? | **WS2-07 founder act** — v1 is observation-only *by ruling* |
| May a new lens be added, and by what authority? | **WS2-07** (closed vocabulary, ratified meanings) |
| What are Writer Guide's stances and their limits? | **this lane** |
| When may MAIA generate language at all? | **this lane** — founder ratification |
| How is craft taught without ranking the apprentice? | **this lane** |
| Which sources may Writer Guide surface? | **bridge lane** — consumed, not redefined |

### 1.8 Surfaces to extend, never duplicate

`lib/manuscript/ask/*` (companion conversation) · `developmentalReader` lenses (teacher and
reader stances) · `structure/proposals → adopt` (the propose/adopt grammar, reusable for any
MAIA suggestion) · `living_works.form` (member's own word) · the bridge lane's genealogy.
⛔ **Do not** build a second conversation, a second reading object, a second proposal
mechanism, or a second Work.

---

## 2. Findings that constrain the lane

### 🔴 W-01 — The dependency test cannot be measured on the person.

> *"After six months with Writer Guide, is this person a better writer — or has MAIA merely
> become better at writing for them?"*

The founder proposes this as a defining constitutional principle. **Taken literally it
requires assessing a member's craft over time** — a stored model of what a person is and is
not good at. That is the skill ladder refused three times in this codebase (no scoring in
`member_reflections`; the Circles status-economy finding; `stage` as orientation never
progress) and named as trap **T-1**.

**Proposed resolution — falsify the design, not the member.** The test is constitutional and
answered against *system behaviour*, never a member assessment:

- Is generation ever the **default path**, or only an explicitly requested one?
- Can a member reach a finished Work along a path where **MAIA supplied none of the
  language**? If not, the design fails.
- Do MAIA's moves **return choices** (experiment, observation, question) or **supply
  outputs**?
- Does the Work's own record show the member's revisions increasing in number and
  independence — **a property of the Work, not a score on the person**?

**The principle survives intact; only its instrument changes.** → **WG-LAW-1**, requiring
founder ratification.

### 🔴 W-02 — Apprenticeship's first requirement is form plurality, and it is blocked.

Poetry cannot be apprenticed in a manuscript-only Studio (§1.4, §1.5). Teaching *line* and
*silence* inside a sections-and-headings artifact teaches the wrong thing. **A3 depends on a
Writer's Studio R&D ruling this lane may not make.**

### ⚠️ W-03 — The Writer Guide brief exceeds ratified reader law.

The founder's DEVELOPMENTAL READER stance includes *"what wants development, structural
possibilities, tensions and contradictions."* WS2-07 v1 has interpretation, possibilities
and questions **absent by construction**, by founder ruling of 2026-09-04.

**Not a contradiction — a sequencing fact.** Those capabilities are a **WS2-07 v2 founder
act**, not something this lane may introduce through a stance. ⛔ Building "possibilities"
into a Writer Guide stance would relitigate a ratified restraint from outside the lane that
owns it.

### ⚠️ W-04 — Craft feedback is the closest MAIA comes to authority (trap T-3).

Extractable rule from the founder's own examples: **name the effect, offer the experiment,
return the choice — never issue the verdict, never supply the line.**

### ⚠️ W-05 — The Editor stance needs the four-fold distinction, structurally.

*observation · suggestion · example · direct alteration* must be **distinct in storage and
in display**, not tones of one response. Direct alteration is the only one that touches the
member's words, and it needs its own act, its own record, and its own reversal.

---

## 3. THE SERIES — build opportunities in flow

Each stage opens only by founder act. Ordered by dependency, then leverage.

```
A0  RECOVER / RECONCILE ────────────────────────────── COMPLETE (this document)
         │
A1  CONSTITUTE — Writer Guide authorship law
         │        WG-LAW-1..n · stance definitions · generation boundary
         │
    ┌────┴─────────────────────────────┐
    │                                  │
A2  THE LOW DOOR                   A3  FORM PLURALITY
    "I'm not really a writer"          non-manuscript expressions
    (needs A1)                         (BLOCKED — Writer's Studio R&D)
    │                                  │
A4  COMPANION ──────────────────────────┘
    stay near what is alive; extends Anchored Ask
         │
A5  CRAFT TEACHER — learning through the Work
         │  taught at the moment the Work creates the need
         │
A6  DEVELOPMENTAL READER as a stance  ····· gated by WS2-07 v2 (W-03)
         │
A7  EDITOR — four-fold distinction (W-05)
         │
A8  RESEARCHER — outside knowledge, with provenance (Q-1)
         │
A9  FORM DISCOVERY — invitation, never classification
         │
A10 OFFER — completion ≠ publication
```

| Stage | Delivers | Depends on | Owner |
|---|---|---|---|
| **A1** | Writer Guide constitution: stances, their limits, **when MAIA may generate language at all**, WG-LAW-1 (W-01) | A0 | this lane · founder ratification |
| **A2** | The smallest door for *"there is something I want to say"* — no genre, no structure, no terminology, no manuscript demanded | A1 | this lane |
| **A3** | A Work may express as something other than a manuscript | — | **Writer's Studio R&D** ⛔ blocking |
| **A4** | Companion stance on the existing Ask seam; surfaces genealogy sources (bridge lane, consumed) | A1, bridge DESIGN | this lane |
| **A5** | Craft taught from the member's actual Work — **no detached curriculum** | A4 | this lane |
| **A6** | Reader stance made legible to the writer | **WS2-07 v2** | WS2-07 ⛔ |
| **A7** | Editor with observation/suggestion/example/alteration distinct | A1, A5 | this lane |
| **A8** | Researcher with source provenance and tradition plurality | A1, Q-1 | this lane |
| **A9** | Form discovery as invitation | A3, A5 | this lane |
| **A10** | Offering: private → shared, at member's choosing | A9 | this lane |

### Sequencing judgement

**A1 before everything.** The Studio's current restraint (§1.2) is *emergent* — each unit
refused authorship for its own reasons. Writer Guide is the first capability with a
plausible reason to generate language, so the constitution must exist **before** the first
stance, not after.

**A2 is the highest-leverage first build**, and it is small. It needs no generation, no craft
model, and no new ontology — only a door that does not demand a manuscript. It directly
answers §11 of the brief and the whole-Studio design test.

**A3 is the true blocker for apprenticeship breadth**, and it is not ours. Open it with
Writer's Studio R&D **in parallel with A1** so it is not discovered late at A9.

⛔ **A5 is where the lane could become MasterClass-with-AI.** The founder's own guard is the
build rule: *teach the craft at the moment the Work creates the need for it.* A lesson
reachable without a Work is out of scope.

---

## 4. Standing

```
LANE           OPENED — Creative Apprenticeship & MAIA Writer Guide
A0             COMPLETE — eight findings reported (§1)
A1..A10        NOT OPENED — each needs a founder act
BLOCKING       A3 (Writer's Studio R&D) · A6 (WS2-07 v2)
PROPOSED       WG-LAW-1 (W-01) — falsify the design, not the member — needs ratification

no code · no schema · no route · no UI · no deploy · no production behavior changed
WS2-07 and WS2-08 cited, NOT reopened · bridge lane consumed, NOT redefined
```

**Next founder act**: ratify WG-LAW-1 and open A1, and/or send A3 to Writer's Studio R&D.
