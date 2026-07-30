# Creator / World Studio — Direction Candidate

**Status:** Cat 1 — Preserved direction. **Held, not authorized.**
**Date:** 2026-07-22
**Author lens:** Claude (thinking lane) at Kelly's direction — *Claude thinks · Kimi builds · Kelly decides.*
**Governs nothing.** This document records possible futures and a verified historical finding. It authorizes no build, no rename, no roadmap, and no outward claim.

> **STOPPING LINE (read before using this document for anything):**
> Exactly one item below is a *finding* (evidence). Everything under "Frozen Vision" is a *hypothesis* (direction). Do not silently promote the second into the first. If you are about to cite this doc to justify building, renaming, or marketing a "Creator Studio / World Studio / Creator OS" — stop. The authority for that does not exist yet (see **Next Authority**).

Related canon: [Constitutional Direction of Authority](../canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md) · Recognition Integrity / Invariant 16 ([Sovereignty Invariants](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md)) · [Marketing Claim Discipline](../canon/MARKETING_CLAIM_DISCIPLINE.md) · six-category typology ([State & Roadmap §8](./STATE_AND_ROADMAP_2026-05-24.md)).

---

## 1. The one finding worth recording now

**Elemental Alchemy functioned as a reference implementation, not an accidental discovery.**

This is recorded as a *finding* because the schema — not the narrative — supports it:

- Workbench workspaces are scoped to `arranger_id` (a member), **not** to *Elemental Alchemy* — `workbench_uploads`, `workbench_tables` (`20260522000003_workbench_v0.sql`).
- Publication artifacts key on `book_slug TEXT` (e.g. `'elemental-alchemy'`) — `audiobook_chapters` (`20260111000100_read_along_reader.sql`). The data model already tolerates **N books**; it is not welded to one title.
- Passages are `member_id`-scoped (`threshold_passages`, `20260206100001`).

So the primitives were built general, and EA was the specimen dense enough to break them against:

```
Reference implementation → stress specimen → proofing ground for primitives
```

EA occupies "the first project slot" as a literal property of the schema, not a metaphor. That is a legitimate historical finding and may be stated as such.

**What this finding does NOT license:** it does not establish that the general platform *works* for a second creator, or that its recognition layer is safe. It establishes only that the substrate was authored general. Generality of substrate ≠ proven generality of experience.

---

## 2. Built / Partial / Missing audit (grounded in code, 2026-07-22)

Corrects an inflation in the originating analysis: several items described as "already there" are **not** built surfaces.

### Built (real surface + backend)
- **Ingestion** — DOCX import (`api/book-studio/import-docx`)
- **Workbench / gathering** — uploads, tables, shelf (arranger-scoped)
- **Passages** — `threshold_passages`, member-scoped
- **Drafts (generative)** — `drafts/from-idea`, `drafts/from-group`
- **Illustrations** — `book-studio/illustrations`
- **Design System** — `book-studio/design-system`
- **Canvas** — layout surface (uses print/layout templates internally)
- **Read** — read-along reader (`audiobook_chapters/segments`, `reading_moments`)
- **Book reader** — `book-studio/book/BookReader`
- **Render → Publication** — **PDF** (Puppeteer/HTML) **+ EPUB**, both real
- ~~**MAIA notes** — present on studio + illustrations surfaces~~ **← CORRECTED by the audit (2026-07-22): this was a grep false-positive. There are NO MAIA notes in book-studio/press. The surface carries explicit in-code anti-interpretation guardrails instead.** See the current-state audit.

### Partial / single-book-shaped
- The substrate is multi-book-capable (`book_slug` + arranger scoping), but **the UI frames itself single-book**: "The Book Studio — Editorial workspace for Elemental Alchemy." Generality is a *schema property here, not a surfaced feature.*

### Missing (claimed by the source analysis, but not built)
- **Projects** — no project object/surface (arranger scoping *could* support one; none exists in UI)
- **Image Bank** — does not exist (illustrations exist; a general asset bank does not)
- **Template library** — does not exist ("template" appears only as internal print/layout templates)
- **Derivative-work objects** — deck, journal, workbook, course, imprint, series, community: none
- **Recognition / theme layer** — none. *Its absence is currently correct* (see §4).

---

## 3. Candidate creator primitives — with constitutional column

The most valuable part of this document. Every candidate primitive carries a constitutional risk rating. The risk is **not** technical difficulty — it is proximity to synthesis / interpretive displacement.

| Candidate primitive | Constitutional risk | Why |
|---|---|---|
| Fragment | Low | Raw material the writer supplies. |
| Passage | Low | Writer's own words, provenance-clear. |
| Collection / Shelf | Low | Writer-made grouping. |
| Asset (image, audio) | Low | Owned material. |
| Publication (PDF/EPUB) | Low | Output of the writer's decisions. |
| Project / World (container) | Low–Med | Structural grouping *if* member-named; drifts to Med if the system infers the "world." |
| Relationship (between artifacts) | Medium | Association is fine; **attribution/causal reading is not.** (cf. `relationship_field_artifact_association` — association ≠ attribution.) |
| Theme | **Medium–High** | Surfacing themes the *writer* marked = OK. System *naming* the theme = interpretive displacement. |
| Thread / Arc | High | Narrating "where this is going" manufactures higher-order meaning. |
| Developmental insight | **High** | This is a synthesis product by definition. |
| "The book is really about X" / "trying to become Y" | **Constitutional tripwire** | Direct violation — tells the writer what their work *means*. Never. |

Design rule that falls out of the table: **primitives are safe in proportion to how little the system interprets.** The recognition layer must surface the *writer's own* patterns — member-marked, provenance-grounded — and stop there.

---

## 4. The constitutional sentence to preserve

This is the load-bearing line of the entire document. Everything in a future developmental-editing environment should derive from it:

> **The system may help a writer notice their own patterns. It may never tell them what their work means or what it is trying to become.**

Two distinctions this rests on:

```
recognition ≠ interpretation
juxtaposition ≠ synthesis
```

Why this matters *more* for a publishing environment than almost anywhere else: "developmental editor" is a role people **want** to hand authority to. The pull toward —

```
"This manuscript is really about grief."
"This is your true theme."
"This book wants to become X."
```

— will be enormous, and it is precisely the move the constitution has been refusing (Recognition Integrity; Direction of Authority: *the system never manufactures higher-order meaning*; the standing no-synthesis freeze). The temptation is a feature request that will feel helpful. It is not admissible.

---

## 5. Frozen Vision (hypothesis, not evidence)

The following remain **hypotheses**, not findings:

- Creator Studio
- World Studio
- Creator ecosystems
- Derivative-work platform (decks / journals / courses / companion books)
- Multi-artifact "worlds"

They may prove real. However:

```
No founder walk exists.
No external walk exists.
No phenomenological evidence exists.
```

Therefore they remain:

```
Category direction.
Not build authorization.
```

Per Marketing Claim Discipline: the surface stays named **"The Book Studio"** — not "Creator OS" / "World Studio" — until creators build *worlds* in it, not books. We do not tell tomorrow's story as if it were today's.

---

## 6. Next Authority

This document authorizes none of the futures it records. The next authority is, in order:

1. **Founder walk** — Kelly walks the live Book Studio surface.
2. **External witness walk** — Kimberly (first external creator; not yet invited — passkey + first walk pending).
3. **Phenomenological findings** — does the recognition layer actually work, felt, for a real creator on real material?

Only after that should the Creator / World Studio ideas be revisited.

```
NOW        → this Cat 1 preservation document
NEXT       → founder walk
THEN       → Kimberly walk (first external witness)
ONLY THEN  → revisit Creator / World Studio vision
```

Preserve the thinking. Do not silently convert it into a roadmap.

---

## Addendum — 2026-07-22: convergent intake signal (recorded as intake, NOT fit)

Observed the same day: four independent people arriving with meaningful work that "doesn't yet know its final form."

| Probe | Material | The one question their walk would answer |
|---|---|---|
| Kelly | founder / EA | Does recognition occur at all? |
| Kimberly | novel → deck → possible imprint/world | Can hidden structure emerge? |
| Andrea + daughter | collaborative / intergenerational legacy book | What does co-authorship require? |
| Jason Ruder | living cookbook — recipes + stories + Spiralogic practice + wisdom | Can mixed-form works be accompanied *without the system naming their form*? |

**Epistemic status — read carefully.** Independent convergence is genuine evidence, but only for one claim. It strengthens the **category hypothesis** — that there is real pull toward accompanying meaningful, mixed-form work *before it becomes a book*. It is **not** evidence for the **fit hypothesis** — that the platform serves that pull well. Four arrivals + zero walks = a stronger *category* signal and the same (zero) *fit* signal. Do not let four anticipations feel like four confirmations; epistemically they are one category — pre-walk intake, n=4.

**Candidate framing (inquiry, not positioning):**
> *"The platform may help people discover the shape of meaningful works before those works become books."*

Correct altitude, because it is a question about what is *served*, not a product name. Hold as inquiry; do not crystallize into a category name until walked. Books remain central — books may simply not be the *first* object.

**Constitutional stakes RISE with form-uncertainty.** Mixed-form is exactly where the tripwire is most tempting: the creator genuinely doesn't know the form, so any system that "helpfully" names it ("this is really a memoir / wants to become a teaching text") steps into the *largest possible* authority vacuum. Rule holds, sharpened: **the more uncertain the creator is about the form, the more dangerous it is for the system to resolve that uncertainty for them.** Admissible: surfacing the creator's *own* clustering ("these recipes keep gathering around grief"; "these reflections keep clustering around Fire"). Inadmissible: naming what it means or what it wants to become.

**Outreach caution.** The "interested, not certain" register for talking to these witnesses is correct (Marketing Claim Discipline). But note §2: **no recognition/theme layer is built.** Outreach must center on Live capability — gather / keep / collect / passages / draft / render, and "see what you notice" — not promise the platform will *help you discover the shape* (that is Designed/Vision). Do not describe the recognition layer as an active exploration before it exists.

Still gated by the same **Next Authority**. Four intake signals move nothing across the line. The line is still a walk.

---

## Addendum 2 — 2026-07-22: closing observations (watch-items, not categories)

*The doc's last theory addition. From here, the only admissible additions are field notes from actual walks.*

**Two anti-inflation epigrams** (candidates for `feedback_epigram_index`), to sit beside `looks-resolved ≠ resolved`:
- **architecture generality ≠ experiential proof**
- **schema-general ≠ category-proven**

**The four witnesses read as four distinct relational dynamics** — recorded as a repeated observation, *not* proof they are foundational:

| Witness | Dynamic | Relationship to |
|---|---|---|
| Kelly | Self-recognition | own body of work |
| Kimberly | Emergence | work becoming larger than expected |
| Andrea + daughter | Relationship | shared / intergenerational legacy |
| Jason Ruder | Transmission | practice → story → wisdom → legacy |

> *The first external witnesses each appear to embody a distinct relational dynamic that may be aligned with the platform's future direction.*

Caution embedded in the observation: the coherence of the set ("almost archetypal," "you couldn't have designed a better cohort") is itself a seduction — a beautiful pattern *feels* like confirmation while the evidence has not moved. Reality rarely arranges itself this neatly; when the theory is this pretty, some of the prettiness is usually ours.

**Body-of-Work-as-primitive** (the sharpest idea in the thread — and still Cat 1):
- Hypothesis: the top-level object may not be *Book* but *Body of Work* (member-scoped container), with Book / Deck / Workbook / Audiobook / Retreat Packet as **Artifacts** shaped from it.
- Why it is finding-adjacent, not pure speculation: the substrate is *already* member-scoped (`arranger_id`), not book-scoped — so the schema sits closer to "body of work" than to "book" today. This is the *same* finding as "schema is multi-book-capable," one altitude up. Still Cat 1; naming the primitive "Body of Work" is a rename earned by walks, not by elegance. Adoption stays additive → **waiting is still free.**
- Member-base hypothesis (population claim, anecdote-backed — NOT a Live observation): Soullab members (coaches, healers, directors, retreat leaders) *may* be unusually likely to hold decades of teachings/stories/handouts/frameworks wanting many forms from one body of work. Watch whether real members behave this way; do not assert it as fact.

**Constitutional lock — artifact-layer extension of the no-synthesis rule** (preserve verbatim; epigram candidate):
> **The system can support the making, but must never author the desire.**

Once a member says "I want to make a deck," the platform may help make it. It may never say "this should be a deck / wants to be a retreat / is really a workbook." Artifact suggestion is the exact seam where a Body-of-Work platform would be most tempted to violate sovereignty ("your material would make a great oracle deck!"). That temptation is inadmissible.

**Pen status: down.** Next mark = a walk.

---

## Theory record CLOSED — 2026-07-22

This document is closed to theory. Two successor instruments carry the work forward:
- **Evidence (facts):** [Soullab Press Current-State Audit](./SOULLAB_PRESS_CURRENT_STATE_AUDIT_2026-07-22.md) — document #1, code-grounded.
- **Observation (walks):** [Soullab Press Witness Protocol](../ops/SOULLAB_PRESS_WITNESS_PROTOCOL_2026-07-22.md) — pre-registered falsification frames.

The only admissible future addition here is a dated field note, not an interpretation.
