# WRITER'S STUDIO — CAPABILITY COVENANT

**Status**: authored 2026-08-28, founder-directed. Sits **alongside** `DESIGN-CONTRACT.md`.
**Standing**: binding on every WS2 unit from WS2-02 onward.

> **The distinction that makes this a separate document.**
> `DESIGN-CONTRACT.md` (FROZEN) governs **how Writer's Studio feels**.
> This covenant governs **what Writer's Studio must remain capable of becoming**.
>
> It exists now, before WS2-02/03, because *the design system and the shell can
> accidentally narrow the product before the deeper rooms exist.* A unit may
> introduce these capabilities incrementally. **No unit may architect them away.**

Writer's Studio is not a manuscript editor with AI assistance. It is an environment for
sustained creative work in which writing, memory, gathered material, reflection, structure,
interpretation, and eventual expression can coexist **without collapsing into one another**.

---

## The twelve capabilities

**1 · Work-centered home.** The primary object is the **Work** — the book, essay, lecture,
course, or research project actually being developed. The Studio orients around ongoing Works,
never around chats, files, prompts, or AI interactions.

**2 · Living manuscripts.** A manuscript is a living creative object: written, revised,
reorganized, expanded, reduced, returned to, continued. Long-form continuity survives sessions,
devices, MAIA conversations, structural changes, and added material. Serious writing is never
reduced to isolated AI generations or disconnected document edits.

**3 · Transcript and material intake.** Transcripts, conversations, recordings, notes, research,
quotations, fragments, source documents, observations, prior writing — all may be brought in.
Imported material **remains material** unless the writer deliberately incorporates it.
*Import is not authorship. Storage is not adoption. Extraction is not publication.*

**4 · MAIA as creative companion.** MAIA may reflect, question, connect, notice patterns, surface
tensions, recall material, help organize, suggest possibilities, and help the writer see the Work
from another distance. MAIA must not silently become **the author, editor-in-chief, arbiter of
meaning, or owner** of the Work.

**5 · Memory with provenance.** Durable creative memory is supported, and must preserve
provenance. The system must remain able to distinguish, at minimum: what the writer **wrote** ·
what the writer **said** · what **source material** said · what MAIA **proposed** · what MAIA
**inferred** · what the writer **recognized** · what the writer **adopted or decided**.
*Recall must not convert suggestion into authorship, or inference into fact.*

**6 · Structural perspective.** The writer can move beyond the paragraph being edited — to
chapters, sections, themes, motifs, arguments, narrative movement, recurring patterns, gaps,
contradictions, sequencing, relationships among parts, possible structures, and the Work whole.
Structural intelligence stays **connected to the actual manuscript**, never a detached planner.

**7 · Writer-controlled meaning.** MAIA may propose interpretations — *"I notice…", "This may
connect with…", "One possible reading is…"*. The **writer** determines what is meaningful, what
belongs, what is true for the Work, what is adopted, what is discarded, what enters the
manuscript. **Recognition is a writer act.** MAIA's interpretation is never the writer's meaning.

**8 · Draft and revision continuity.** Returning returns the writer to the *meaningful state* of
the Work — manuscript location, active section, recent changes, unresolved questions, relevant
material, recent dialogue, structural context, recognized decisions. The writer **resumes** the
creative process rather than reconstructing it.

**9 · Materials remain distinguishable from the Work.** A hard boundary:

| THE WORK | MATERIAL |
|---|---|
| the authored creative object | transcripts, research, notes, quotations, fragments, references, recordings, conversations, possibilities |

Material may **influence** the Work without **becoming** it. No import, retrieval,
summarization, AI operation, or structural analysis may silently cross that boundary.

**10 · Multiple creative distances.** The Studio supports movement among relationships to the
Work — **Close** (the sentence) · **Material** (notes, transcripts, research) · **Structural**
(chapters, themes, gaps, form) · **Relational** (thinking with MAIA) · **Expressive** (how it
might meet an audience). These are **not workflow stages**. The architecture must not turn the
Studio into a rigid pipeline.

**11 · Expression and publishing support.** A Work may move outward as a book, essay, article,
lecture, course, workshop, audio, podcast, video, presentation, or forms not yet imagined. The
Studio helps prepare those transformations while preserving **developing ≠ publishing**.
*A polished artifact is not a finished Work. A generated export is not authorization to publish.
Publication remains a deliberate human threshold.*

**12 · Human authorship remains explicit.** These stay writer acts: recognition · judgment ·
creative choice · interpretation · adoption · rejection · belonging · revision · completion ·
publication. MAIA may participate deeply **without silently acquiring those authorities**.

---

## The design test

> **Does this design make it easier for a person to remain in sustained relationship with their
> Work, their materials, their own developing understanding, and MAIA — without confusing who
> authored, recognized, decided, or adopted what?**

If a design makes the interface cleaner by **eliminating one of those distinctions**, the
distinction must be preserved in the underlying architecture. If a capability is not yet built,
the architecture must at minimum **avoid foreclosing it**.

## Minimum capability guarantee

The architecture must remain capable of supporting: (1) multiple Works · (2) persistent living
manuscripts · (3) material/source collections associated with a Work · (4) provenance-aware MAIA
memory · (5) writer/MAIA/source attribution · (6) writer-recognized decisions · (7) manuscript-
and Work-level structural views · (8) movement between writing, materials, structure, MAIA and
expression · (9) version/revision continuity · (10) deliberate adoption of material into a
manuscript · (11) multiple outward expressions of a Work · (12) explicit human publication
authority.

---

## What this changes at WS2-02/03 — three, now

These bind the design system and shell **before their UI exists**:

1. **Work, Manuscript and Material must be different domain objects.** Do not build a shell in
   which everything becomes "documents."
2. **MAIA interaction must have somewhere to belong relative to a Work without becoming
   manuscript content.** Otherwise creative companionship degenerates into chat pasted beside an
   editor.
3. **Provenance and adoption must exist in the underlying model.** The UI may become elegant
   later; the architecture must already be able to know: *MAIA suggested this · the writer wrote
   this · this came from a transcript · the writer later adopted this.*

## The organizing principle

**Multiple creative distances** — not a pipeline of import → outline → write → publish, but the
freedom to move between *inside the writing, beside the material, above the structure, in
dialogue with MAIA, and toward expression.* That is closer to how serious creative work actually
moves, and it is the shape WS2-02/03 must leave open.

## Essence

> A place to write, gather, remember, shape, and develop serious work with MAIA beside you —
> while keeping the writer unmistakably in authorship.
