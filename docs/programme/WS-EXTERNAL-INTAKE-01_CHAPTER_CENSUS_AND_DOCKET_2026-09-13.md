# WS-EXTERNAL-INTAKE-01 — External Product Intake

**Specimens:** Chapter (§1-8) · expanded scan of eleven further products (§9)

**Date:** 2026-09-13
**Standing:** ⛔ **LANE NOT OPENED.** DISCOVER-stage intake only. No lane authorized, no
code written, no schema touched, no capability promised. Opening any lane below requires an
explicit founder act.
**Branch:** `claude/bold-bohr-pmtynu`
**Census base commit:** `e1c6f527`
**Authority:** founder (Kelly Nezat). Jarvis may not open a lane, ratify a law, or lift a gate.
**Companion:** `JARVIS-ORCHESTRATION-BOUNDARY-01_INTAKE_2026-09-13.md` — the orchestration
boundary, scaling laws and their docket. ⭐ **Read that first: it governs everything here.**

> **Naming (precedent: `COACHING-TEMPLATE-EXTRACTION-01_NAMING_RULING_2026-09-04`).**
> The lane is **external product intake**; Chapter is the **first specimen, not the object**.
> A competitor must never become a governing object of this programme. If a second specimen
> arrives, it is `WS-EXTERNAL-INTAKE-01_<SPECIMEN>`, not a new lane.

---

## 0 · Why this document exists

A competitor analysis arrived proposing four additions to the Writer's Studio programme
(P0 Whole Work Intelligence · P0 Research & Evidence Graph · P1 Authorial Voice Field ·
P1 Expression Pipeline). Before any of that can be sequenced, two things must happen in
this order:

1. **Classify the input.** Vendor marketing is a *claim*, not evidence.
2. **Census canonical.** Several of the four already exist here — in ratified vocabulary,
   in shipped code, or both. Proposing to *build* something the repo already *has* is the
   most expensive category of error available to this programme, because it produces a
   second source of truth for a capability that already has one.

This document does (1) and (2), then puts to the founder only what the founder must decide.

---

## 1 · Epistemic status of the intake source

Everything sourced from `go.chapter.pub`, `chapter.pub/termsofuse`, `chapter.pub/privacypolicy`
and `blog.chapter.pub` is **vendor self-description read from public pages on 2026-09-13**.

| Class | Meaning | May be used for |
|---|---|---|
| **VENDOR CLAIM** | The vendor says its product does X | Identifying a *capability question*. Never as evidence the capability works, and never as evidence about how ours compares |
| **OBSERVED BEHAVIOUR** | Someone ran the product and watched it | Nothing here qualifies — **no one on this programme has run Chapter** |
| **INFERENCE** | Our reading of their published terms/policy | Internal reasoning only. ⛔ Never an outward claim about a named company |

⛔ **Standing rule for this lane:** no statement about Chapter — capability, privacy practice,
or comparison — leaves this repository. Outward claims are governed by
`docs/canon/MARKETING_CLAIM_DISCIPLINE.md` and `docs/canon/CLAIM_STATE_AUTHORITY.md`; a
comparative claim about a named third party read off their own policy page is the
**lowest-evidence, highest-liability** claim shape available. See §6.

---

## 2 · Census — the four proposals against canonical at `e1c6f527`

Read-only. File presence and exported vocabulary, not intention.

### P0-a · "Whole Work Intelligence" (continuity · repetition · argument · voice · structure)

⭐ **This is not a new capability. Its vocabulary is already ratified in canonical.**

`lib/manuscript/developmentalReader/contract.ts` exports **seven lenses**, with meanings
ratified by founder act 2026-09-04 (WS2-07-F1):

```text
structure · development · continuity · arc · voice · coherence · reader
```

`lib/manuscript/developmentalReading/contract.ts` exports **eight phenomena**, each with
is/isNot definitions:

```text
recurrence · unresolved-thread · register-shift · prospective-reference
re-explanation-first-mention · movement · term-drift · positional-asymmetry
```

Mapping the intake's proposed lens list onto what exists:

| Proposed lens | Already exists as | Status |
|---|---|---|
| Continuity (idea changed meaning, terminology drift, ch.11 contradicts ch.3) | lens `continuity` + lens `coherence`; phenomena `term-drift`, `movement` | **RATIFIED** |
| Repetition (deliberate vs accidental recurrence) | phenomenon `recurrence`; lens `structure` ("what repeats?") | **RATIFIED** |
| Argument (claims never developed, abandoned threads, arriving too early) | lens `development` (verbatim: *underdeveloped · sufficiently developed · overexplained · introduced too late · abandoned · repeated without advancing*); phenomena `unresolved-thread`, `re-explanation-first-mention` | **RATIFIED** |
| Voice (passages unlike the author's voice, generic-AI register) | lens `voice`; phenomenon `register-shift` | **RATIFIED** |
| Structure (rhythm, disproportion, misplaced material) | lens `structure`; phenomenon `positional-asymmetry` | **RATIFIED** |
| **Source integrity** (claim → source, quotation → exact wording, citation → real source) | — | 🔴 **NO LENS, NO PHENOMENON, NO SUBSTRATE** |

⭐⭐ **The real gap is SCOPE, not capability.** Today a developmental reading is
**commissioned, frozen and scoped** (`developmentalReading/{commission,freeze,scope}.ts`)
— one lens, one frozen reading, bounded. The intake's ask is that the same intelligence run
**across the whole Work at once**. That is a scope, economics and freeze-semantics question
against an existing engine, not a new engine.

⛔ **Do not build a parallel "Whole Work" analyzer.** Two vocabularies for the same
phenomena is exactly the divergence `WRITERS_STUDIO_PROGRAMME_BOARD.md` refuses ("two
cockpits diverge, and the divergence is invisible until it costs a decision").

⚠️ **Name collision:** `WS-WHOLE-MANUSCRIPT-01` (BUILD AUTHORIZED, 2026-09-08) already owns
the words *whole manuscript*, and it means something else — **a continuous editable view of
the same sections**, explicitly *not* a second manuscript. `app/writers-studio/canvas/WholeManuscriptSurface.tsx`
is that surface. A whole-**Work** integrity pass would need a different name or an explicit
founder ruling folding it into that lane.

### P0-b · "Research & Evidence Graph"

🔴 **ZERO substrate. This is the one genuinely unbuilt proposal, and the census confirms it.**

- `grep` for citation/bibliography across `lib/manuscript` returns **one CSS file and one
  unrelated test**. There is no claim object, no source object, no quotation object, no
  verification state, no external-source provenance.
- ⛔ **`lib/manuscript/development/evidenceRef.ts` is NOT this and must not be extended into
  it.** Its `EvidenceRef` (BUILD-07A) points **inward**: section · passage · section-run ·
  structure-unit · structure-topology, frozen against the append-only revision store with a
  digest. It answers *"where in the Work is this?"* — never *"is this true, and who says so?"*
  Reusing the word `evidence` for external sources would collapse two different objects with
  two different failure modes into one name.
- `lib/manuscript/source/` is **custody and arrival of member-supplied material**
  (`arrivals.ts`, `custody.ts`, `omission.ts`, `eraseManuscript.ts`) — the *bring anything*
  half of the intake's §4, and it already exists. It is not a research graph either.

⭐ **Consequence:** the intake's §4 ("bring everything → together we discover what belongs to
the Work") is **already architecturally true** via source custody; its §3 (claim→evidence
structure) is **genuinely absent**.

### P1-a · "Authorial Voice Field"

⚠️⚠️ **The corrective the intake proposes is already ratified law, verbatim, in canonical.**

`lib/manuscript/developmentalReader/contract.ts`, `LENS_MEANING.voice`:

> *"Where does this depart from the established voice OF THIS WORK — the manuscript itself
> is the reference, never an external standard."*

That single clause already forbids Chapter's "Voice DNA" model. It is not a gap; it is a
decided question. What is *unbuilt* is any persisted cross-Work voice representation — and
the sharp question is whether such a representation is even permissible under that rider
(**D-04**).

⚠️ **Hard name collision:** in this repository **"voice" means speech** — `lib/voice/*`,
TTS/STT, the Deep-Intelligence Gate, `MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`.
`lib/manuscript/developmentalReader` is the only place `voice` means *prose register*.
Introducing "Authorial Voice Field" as a product noun collides with the single most
safety-critical subsystem name in the codebase.

### P1-b · "Expression Pipeline"

⭐ **Substantially LIVE already — this was the intake's largest misclassification.**

- `app/api/sovereign/manuscripts/[id]/render/route.ts` — `POST { format: 'pdf' | 'epub' }`,
  streams the file, writes a render ledger row (`format`, `source_section_count`,
  `source_hash`, `page_count`).
- `lib/manuscript/render/renderMemberBook.ts` — pandoc → HTML → Paged.js/Puppeteer for PDF;
  pandoc epub3 for EPUB; `epub-book.css`, `print-book.css`, `canonical-plates.lua`,
  `center-images.lua`. Title/author carried as pandoc metadata, **not injected into the text**.

Actual remaining gap is narrow and mechanical: **DOCX**, front/back matter, publication QA.
⛔ Do not open a lane for "an expression pipeline"; there is one.

---

## 3 · Findings

**F1 — Three of four proposals are re-descriptions of ratified work.** Whole Work
Intelligence = a scope change to developmental reading. Voice Field = an already-ratified
lens rider. Expression Pipeline = a shipped route needing DOCX. Only the Research & Evidence
Graph is new.

**F2 — "No silent repair" needs no new canon; it is already the backbone constraint.**
`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` (Invariant 16): *authority may only move
upward through authored experience — never skipping a layer, never manufacturing higher-order
meaning.* Chapter's "you only ever see the fixed version" is precisely a system manufacturing
Recognition without Encounter or Reflection. The member-facing shape the intake sketches
(OBSERVATION → SOURCE LOCATIONS → possible explanations → `[Explore] [Leave it] [Make a ruling]`)
is **already the built shape**: observations carry evidence refs (`development/bind.ts`),
standing is append-only `keep | dismiss | unresolved` (`lib/manuscript/standing/`), and refusal
is first-class (`developmentalReading/refusalRecord.ts`,
`WS-DEVELOP-REFUSAL-TRUTH-OBS-01_CONSTITUTION_2026-09-08.md`). ⛔ Request: **bind, do not
author** — no new doctrine document for a constraint that already has one.

**F3 — Source integrity is the only lens with no vocabulary, and it is the highest-risk one.**
It is the single place where MAIA would assert something about the *world* rather than about
*the Work*. Every other lens is internally referential and therefore internally falsifiable.
This one is not. It is a different epistemic class and must be constituted as such before it
is built.

**F4 — Two name collisions would cost real decisions later:** *whole manuscript* (view vs
integrity pass) and *voice* (speech vs prose register). Both are cheap to fix now, expensive
to fix after code exists.

**F5 — The intake's product-legibility observation is the most valuable non-feature finding.**
Chapter's `INPUT → RESEARCH → STRUCTURE → WRITE → CHECK → BOOK` is legible; Writer's Studio's
sophistication risks becoming the member's complexity. The proposed
`BRING · ENTER · WRITE · SEE · DEVELOP · VERIFY · EXPRESS` reads as **distances from the Work,
not mandatory stages** — consistent with the existing ruling that phase orients rather than
imprisons. ⛔ But this is member-facing representation and therefore governed by claim
discipline: naming a stage `VERIFY` while source integrity has zero substrate would be a
**DESIGNED** capability rendered as **LIVE**.

**F6 — The privacy differentiation is the most legally exposed item in the intake and the
least evidenced.** See §6.

---

## 4 · Founder docket

Only decisions the founder must make. Jarvis proposes nothing as settled.

| # | Question | Why it cannot be inferred |
|---|---|---|
| **D-01** | Is **Whole Work integrity** (a) a scope extension of developmental reading, (b) a fold into `WS-WHOLE-MANUSCRIPT-01`, or (c) its own lane? | Determines whether a second vocabulary is ever created. Jarvis recommends (a), but the ruling is the founder's |
| **D-02** | If (a): what is the **freeze unit** for a Work-scoped reading? Today a reading is commissioned + frozen at a bounded scope; a Work changes under the reading | Freeze semantics are constitutional, not an implementation detail |
| **D-03** | Is **source integrity** admitted as an eighth lens, or constituted as a **separate epistemic object** outside the lens set? | It is the only lens that makes claims about the world. Admitting it into the lens set silently equalizes two epistemic classes |
| **D-04** | Does a **persisted voice representation of a Work** violate the ratified `voice` rider (*the manuscript itself is the reference, never an external standard*)? | A derived profile applied back to the Work may or may not be "external". Ratified language does not settle it |
| **D-05** | Rename or not: **voice** (prose) vs **voice** (speech); **whole manuscript** (view) vs **whole Work** (integrity) | Naming is cheap now, structural later |
| **D-06** | Are the three anti-goals ratified as **named refusals** — (i) no market/bestseller structural normalization, (ii) no invisible automatic editing, (iii) no AI-generated prose attributed to the member as authorship? | The intake is right that these are already implied. Implied is not falsifiable. A named refusal can be tested; an implication cannot |
| **D-07** | Is **DOCX + front/back matter + publication QA** authorized as a small closure unit on the existing render route? | Smallest real gap; also the only one with no constitutional weight |
| **D-08** | Does the `BRING · ENTER · WRITE · SEE · DEVELOP · VERIFY · EXPRESS` journey become the member-facing orientation, and if so under what claim-state labelling per stage? | F5 — a stage name is an outward claim |

---

## 5 · Anti-goals proposed for ratification (D-06)

Stated as falsifiable refusals, not as values:

- **AG-1 · No structural normalization toward market convention.** Writer's Studio may
  *show* structural patterns and comparisons. It may never silently move the Work toward a
  category template. *The Work may need to become something that has never existed before.*
- **AG-2 · No invisible repair.** Every change to the member's text is
  `original → observation → proposal → author decision → resulting version`. There is no path
  in which the member sees only a corrected version. (Already load-bearing: standing events,
  revision store, Invariant 16.)
- **AG-3 · No counterfeit authorship.** MAIA does not generate prose and attribute it to the
  member as their own voice. Voice perception may detect departure; it may not impersonate.

---

## 6 · Claim-discipline routing (mandatory before anything outward)

The intake proposes the differentiator: *"Your Work is not training material. Your Work belongs
to you. MAIA can know it without appropriating it."*

- ⭐ **The first two sentences are ours to make** — they are claims about **our** architecture,
  and the self-hosted stack, `check:no-supabase`, and source custody are the evidence base.
  They still require a claim-state ruling per `CLAIM_STATE_AUTHORITY.md`: predeclared criteria
  + attributable evidence license the state; the founder decides what is claimed.
- ⛔ **Any comparative form is refused at this stage.** Characterizing a named company's data
  practice from a reading of its privacy policy is INFERENCE (§1), and publishing it converts
  a private inference into an outward assertion about a third party. Route: state our own
  architecture, let the comparison be the reader's.
- ⛔ **`VERIFY` must not appear in member-facing copy while source integrity has zero
  substrate** (F3/F5). That is the exact failure `MARKETING_CLAIM_DISCIPLINE.md` names:
  *we do not tell tomorrow's story as if it were today's.*

---

## 7 · Proposed sequencing **if** the founder opens anything

Order is argued, not authorized:

```text
1. D-05 naming ruling                       (cheapest, unblocks every other item)
2. D-06 anti-goal ratification              (no code; makes refusals falsifiable)
3. D-07 DOCX closure on the existing route  (smallest real gap, no constitutional weight)
4. D-01/D-02 Whole Work scope + freeze      (largest value, reuses the ratified engine)
5. D-03 source integrity constitution       (highest epistemic risk — constituted before built)
6. D-04 voice representation ruling         (may resolve to "nothing to build")
7. D-08 journey/claim-state labelling       (outward; last, after 1–6 establish what is true)
```

⛔ **Not authorized by this document:** title generation · covers · launch assets · audiobook ·
deep research execution · any Chapter-derived feature · any migration · any deploy · any
member-facing copy.

---

## 8 · Standing

```text
LANE                 WS-EXTERNAL-INTAKE-01 — NOT OPENED
SPECIMEN             Chapter (vendor claims read 2026-09-13; product never run)
CENSUS               COMPLETE, READ-ONLY, at e1c6f527
CODE WRITTEN         NONE
SCHEMA               UNTOUCHED
CANON AUTHORED       NONE
CLAIMS MADE          NONE (outward claims routed to §6)
AWAITING             founder rulings D-01 … D-08
```

> **The differentiation the intake reaches for is real, but it is not four features.**
> Chapter automates the production of a book. Writer's Studio already holds the harder
> position — the author remains the author — and the census shows that position is mostly
> *built*, not *aspired to*. The work is to finish one genuinely missing object (evidence),
> widen one existing engine (scope), and stop describing the rest as if it were absent.

---

## 9 · Expanded specimen scan (founder, same day) — triage

Eleven further specimens were scanned: **Novelcrafter · Lattics · ProWritingAid · Gemini
Notebook · Elicit · Scite · Consensus · Lex · Sudowrite · Scrivener · Marlowe · Atticus**,
plus Plottr/Dabble/Campfire as secondary. All remain **VENDOR CLAIM** class under §1: none has
been run by this programme. ⛔ The §1 outward-claim rule applies to every name here.

### 9.1 · Triage of the twenty-one proposed capabilities

Each proposal placed against canonical at `e1c6f527`. **EXISTS** = built and importable ·
**PARTIAL** = primitives exist, mechanism does not · **ABSENT** = zero substrate.

| Proposed capability | Census | Evidence |
|---|---|---|
| Whole Work perception | **PARTIAL** | Seven ratified lenses + eight phenomena exist; scope is reading-bounded (§2 P0-a) |
| Evidence-linked observations | **EXISTS** | `development/{evidenceRef,bind,readState}.ts` — typed, frozen, digest-verified |
| Observation → consider → keep/dismiss/unresolved | **EXISTS** | `lib/manuscript/standing/` — append-only events, current derived |
| Persistent author rulings | **EXISTS** | same standing stream; the recorded act is permanent |
| Version lineage / reversible development | **EXISTS** | append-only revision store; `draftConcurrency.ts`; section digests |
| Manuscript vs supporting-material distinction | **EXISTS** | `lib/manuscript/source/{custody,arrivals,omission}.ts` |
| Context provenance — "what MAIA used" | **PARTIAL** | ⭐ three traces, three shapes, no contract — Jarvis doc §2.3 |
| Publication compile pipeline | **EXISTS** | PDF + EPUB route, pandoc/Paged.js, render ledger (§2 P1-b) |
| Authorial voice field | **PARTIAL** | `voice` lens ratified with the correct rider; no persisted representation (D-04) |
| Claim ↔ evidence graph | **ABSENT** | 🔴 the one true zero (§2 P0-b) |
| Epistemic state of a claim | **ABSENT** | 🔴 depends on the above |
| Primary-source jump-back | **ABSENT** | 🔴 no external source object |
| Research Room / persistent source repository | **ABSENT** | 🔴 source *custody* exists; a research *place* does not |
| Work knowledge / entity graph | **ABSENT** | 🔴 no entity, relation, or motif object anywhere |
| Automatically maintained (not administered) graph | **ABSENT** | 🔴 and constitutionally gated — Jarvis doc J-F3 |
| Model-agnostic routing | **ABSENT** | 🔴 `readerProvenance` records the model after the fact only |
| Sovereign/local-model route | **PARTIAL** | Ollama fallback exists at the MAIA layer; no per-task routing rule (D-J7) |
| Nonlinear relational visualization | **ABSENT** | depends on the entity graph |
| Whole-project timeline | **ABSENT** | `continuity` lens asks for chronology; no timeline object |
| Parallel thread visualization | **ABSENT** | depends on the entity graph |
| Collaboration / editor access | **ABSENT** | out of this lane's scope |

⭐⭐ **Result: of twenty-one "P0/P1" capabilities, six already exist, four are partial, and
the absent eleven collapse into three objects** — an **external evidence graph**, a **Work
entity graph**, and a **routing/orchestration layer**. Everything else in the absent column is
a *view* of one of those three.

### 9.2 · Findings from the expanded scan

**F7 — ⭐ ProWritingAid's "Text Location + feedback disposition" is the one specimen mechanism
we already implement more strongly than the specimen.** Their loop is observation → exact
passage → agree/disagree/considering. Ours is observation → typed `EvidenceRef` frozen against
a revision digest → append-only standing (`keep | dismiss | unresolved`) that **becomes part
of the Work's history**. ⛔ Do not open a lane to build this; it is built. The honest task is
to *say so* — the inverse-drift risk named in CLAUDE.md.

**F8 — The Novelcrafter contrast is a sovereignty question wearing UX clothes.** "The writer
should not have to become an ontology administrator" is correct as an experience goal and is a
**transfer of authorship of structure from member to system**. Admissible only under the four
conditions in the Jarvis doc (J-F3). ⛔ The UX argument does not settle the authority question.

**F9 — Lex is the most useful specimen and proposes nothing to build.** Its lesson is
subtractive: sophisticated architecture must not surface as `Ontology / Graph / Vectors /
Prompt Manager`. That is the same constraint as the Jarvis boundary (`JARVIS-ORCHESTRATION-BOUNDARY-01` §1)
and as `docs/canon/INTERFACE_HUMILITY.md`. ⭐ **Recorded as a design constraint, not a lane.**

**F10 — Scrivener's compile distinction should be ratified as a law, and it is nearly free.**
> **How the writer works on the Work and how the Work is eventually expressed are different
> things.**
This is *already true in the code* — the render route composes sections into a book at export
time and carries title/author as pandoc metadata rather than injecting them into the text.
Ratifying it costs nothing and prevents a whole class of future error (**D-09**).

**F11 — Elicit's "living review" is the sharpest unclaimed idea in the scan, and the most
dangerous.** *"The evidentiary field around something you wrote has changed"* is exactly right
in posture (it informs; it does not rewrite). ⛔ But it makes MAIA a **continuous monitor of
the outside world on the member's behalf**, which is a new relational power, not a feature:
it introduces unrequested arrival, recurrence, and a reason to return. That must pass the
Sovereignty Invariants and the growth-obligation check *before* it is designed, not after
(**D-10**).

**F12 — Gemini Notebook's real proposal is "research is a place, not an action."** That is a
**scope decision about where sources live** and interacts directly with the member-layer
question (Jarvis doc §6.3): a research repository that outlives any one Work belongs *above*
the Work, not inside it. ⛔ Blocked behind D-J10 (naming) — do not build a Research Room into
a Work.

### 9.3 · Additional docket

| # | Question |
|---|---|
| **D-09** | Ratify the compile law (F10): *working form and expressed form are different things* |
| **D-10** | Is **evidentiary monitoring over time** (F11) admissible at all, and if so under what consent, arrival, and recurrence constraints? |
| **D-11** | Do the three absent objects (external evidence graph · Work entity graph · orchestration/routing) become **three lanes, one lane, or none yet**? |
| **D-12** | Given §9.1, is the programme's next act a **build** at all — or a **representation** act: saying accurately what Writer's Studio already does (F7)? |

⛔ **Nothing in §9 authorizes anything.** Twelve of twenty-one proposals resolve to work that
already exists or to three objects that must be constituted before they are built.
