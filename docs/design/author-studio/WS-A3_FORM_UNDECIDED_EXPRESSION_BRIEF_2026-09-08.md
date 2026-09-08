# A3 — NON-MANUSCRIPT AND FORM-UNDECIDED EXPRESSION

**Owner: WRITER'S STUDIO R&D.** Opened by founder act 2026-09-08, in parallel with
Creative Apprenticeship A1.

**Not a Creative Apprenticeship implementation issue.** It is a Writer's Studio
ontology / product-access problem, and it belongs to the domain that owns what a Work and an
expression are. `JARVIS-WRITER-GUIDE-APPRENTICESHIP-01` **depends on this capability and does
not own its ontology.**

---

## 1. The finding this opens on

The Living Work ontology (ratified 2026-08-01) permits a Work **before form**:

> *"a member-authored body of material, inquiry, decisions, and expressions that may exist
> before any single form and may give rise to many forms over time"*

and deliberately left `expression_type` as open TEXT, with its migration stating why:

> *"a workbook, a course, a retreat and a framework are expressions whether or not the Studio
> can yet hold them … constraining it to today's implemented expressions would reintroduce an
> artifact-first ontology through the back door."*

**The implementation admits exactly one:**

```ts
const DECLARABLE_TYPES = ['manuscript'] as const;   // living-works/[id]/expressions
```

> **`DECLARABLE_TYPES = ['manuscript']` is an implementation narrowing of the Studio's larger
> ontology.** The back door the migration refused to open in schema is open in the product.

**Consequence, measured**: a member may *hold* a formless Work and may not *develop* one. The
only door into development converts it into a sections-and-headings artifact. The built lenses
(`structure`, `continuity`, `arc`) are book-shaped; poetry's craft — line, silence,
compression, sound — has neither a lens nor an expression type.

---

## 2. Mission *(founder, recorded as given)*

> Determine how Writer's Studio permits a Living Work to develop when:
> - its form is not yet known
> - its form is not a manuscript
> - it may eventually have several forms
>
> At minimum, investigate the requirements exposed by: **poetry · prose · fiction · fantasy ·
> memoir · essay · documentary · script · teaching · experimental/emergent work.**
> **These are witnesses, not a proposed closed taxonomy.**
>
> ⛔ **Do not solve this by merely expanding `['manuscript']` into a larger hardcoded
> enumeration** unless the ontology establishes that enumeration as correct.
>
> The design must preserve **WORK ≠ FORM**, and: **one Work may give rise to multiple Forms.**

### Form-undecided must become livable

> A schema that allows a form-undecided Work while the product cannot meaningfully develop one
> **is not sufficient.**
>
> Determine what a member actually encounters when they say: *"I know there is something here,
> but I don't know yet whether it is a poem, essay, book, film, teaching, or something else."*
>
> **The answer must not be: "Choose a manuscript type before you may proceed."**

---

## 3. Constraints carried in from ratified law

| Constraint | Source |
|---|---|
| `expression_type` stays open TEXT; narrowing it re-narrows the ontology | `20260801000001_living_works.sql` |
| `living_works.form` is the member's own word, **never a system taxonomy**; NULL is a legitimate permanent state | `20260805000001_living_work_form_stage.sql` |
| `stage` is *orientation, never progress*; the system never advances it | same |
| Nothing enters a Living Work without member declaration; `declared_by` NOT NULL | living_works guard 1 |
| `NEVER_AUTHORED_BY_THE_SYSTEM`: title · purpose · type · theme · summary · status · phase · relationships | `lib/livingWork/domain.ts` |
| The system must not presume the form too early | Product Thesis, CREATE |
| An openness of the ontology is not an openness of a gate — an unverifiable type is refused, not trusted | materials route precedent |

**The last one is the design tension to hold**: the ontology is open *by ruling*, and the
gate is closed *by discipline*. A3's job is not to open the gate but to establish **what a
verifiable expression kind is**, so kinds can be admitted without either narrowing the
ontology or trusting an unverified type.

---

## 4. Questions this brief poses

| # | Question |
|---|---|
| **A3-Q1** | What is the minimum an expression kind must provide to be developable — identity, addressability, a writing surface, a revision story, custody? Manuscript answers all of these; what does a poem need, and what does it not? |
| **A3-Q2** | Is there a **form-undecided development surface** — somewhere a member works before any expression exists — or does development necessarily instantiate an expression? |
| **A3-Q3** | If a Work's material later resolves into a poem *and* an essay, is that two expressions of one Work, or one expression re-formed? `living_work_expressions` permits many; nothing exercises it. |
| **A3-Q4** | Do the seven lenses generalize across forms, are they manuscript-scoped, or does form-sensitivity belong in commissioning rather than in the lens set? *(Coordinate with Creative Apprenticeship **WG-B5**: extend the lens; a new abstraction must first prove the lens cannot carry the distinction.)* |
| **A3-Q5** | What does the member encounter at the form-undecided threshold, concretely — the sentence, the surface, the first act? |

**A3-Q2 is the one that decides the shape.** If development requires an expression, then
"form-undecided" can only ever be a waiting room. If it does not, the Studio gains a place
where something can be worked before it is anything — which is what the Product Thesis
promises and what apprenticeship needs.

---

## 5. Boundaries

- ⛔ **Do not** expand `DECLARABLE_TYPES` into a larger enumeration as the answer.
- ⛔ **Do not** reopen the WS2-08 manuscript-structure lane (open; 08B held).
- ⛔ **Do not** enlarge WS2-07; the Developmental Reader stays as ratified. Latitude is a
  **WS2-07 v2 founder act**.
- ⛔ **Do not** couple to the Reflections ↔ Living Work bridge lane. Both enrich a Work; neither
  absorbs the other.
- A3 **may inform** later Creative Apprenticeship work and **must not block** A1 or the
  non-generative portions of A2.

## 5a. Raised by founder ruling, 2026-09-08

`docs/programme/WRITER_GUIDE_FOUNDER_RULING_PROVENANCE_RESTRAINT_ROOM_2026-09-08.md` §6 **governs**.

**A3 is LOAD-BEARING.** The form-undecided condition must be a **positive capability, not a
nullable database field**. Provisional design term: **the Open Creative Room** — ⛔ design
purposes only, **not ratified as product naming**; A3 determines what it actually is inside
existing Studio architecture.

The member must be able to do all of the following **without first declaring the Work a
manuscript**: remain with a Work before genre or form is known · gather material · explore ·
write fragments · encounter Reflections · converse with Writer Guide · notice emerging
patterns · experiment · learn craft where relevant · allow possible forms to appear.

⭐ **And A3 now carries a second load.** Clause 3 rules that MAIA's restraint is structural and
*"should ordinarily be experienced as room."* Restraint may not be narrated and must therefore
be encountered somewhere — and today there is nowhere but a manuscript. **The Open Creative
Room is where restraint becomes room**; without it, structural restraint has no medium.
A3 is therefore load-bearing for the authorship law itself, not only for apprenticeship
breadth. It no longer merely *does not block* A1 — the two are coupled in substance and run
in parallel by ruling §7.

## 6. Standing

```
A3        OPEN — Writer's Studio R&D — LOAD-BEARING (founder ruling 2026-09-08 §6)
DEPENDS   nothing
BLOCKS    A2's non-forcing door · apprenticeship breadth · A6, A9
COUPLED   A1 — restraint must be experienced as room, and the room is A3's (ruling §8 C-1)
          runs in parallel with A1 by ruling §7, not in series
OUTPUT    findings first — no schema or UI change proposed before the ontology answers A3-Q2

no code · no schema · no route · no UI · no deploy
```
