# WS2-ENCOUNTER-01 — DECIDE

**Status: LANE OPENED (founder permission, 2026-09-08). CENSUS COMPLETE. NOTHING BUILT.**
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Doctrine: `WRITERS_STUDIO_PRODUCT_THESIS_LIFE_OF_A_WORK_2026-09-08.md` §3 (**PT-1**, ratified).
Predecessor: PT-3 Source custody, closed — *what the Studio may not touch is now executable law.*

> **PT-1 · Encounter precedes intervention.** A returned Work is allowed to become present
> again before the system proposes anything. The first gesture is *here it is; we can spend
> some time with it before deciding what you want to do* — not diagnosis.

⛔ Not authorized by opening this lane: any implementation · Restore · intention authority ·
lineage · WS2-08B · `living_works.stage` · deployment.

---

## 1 — What the doorway already promises

Step 1 shipped this sentence at `/press/manuscript?import=1`:

> *Import something you've written before and decide what, if anything, you want to do with it.*

**That promise currently has no surface behind it.** A returning writer imports, and the
next thing the Studio offers is the Writer Canvas — a place to work. Encounter is the
missing middle, and until it exists the threshold copy is a claim the product does not keep.

---

## 2 — Census

| Capability Encounter needs | State | Evidence |
|---|---|---|
| Server-owned reading of a Work, member supplies only identity + intent | **BUILT** | `app/api/sovereign/manuscripts/[id]/readings/route.ts` — *"THE SERVER OWNS THE READ. The request body carries nothing about the Work"*; a client that could supply scope or observation could publish under MAIA's name what MAIA never said |
| A reading that is frozen and returnable | **BUILT** | `lib/manuscript/developmentalReading/{commission,freeze,store}.ts` |
| The ability to observe that **nothing needs to change** and stay quiet | **BUILT** | WS2-07D natural decline |
| Structure derived from an import | **BUILT (derivation) · HELD (confirmation)** | 08A `deriveImportedStructure()`; **08B on founder hold** |
| Continuous, markup-free reading surface (**PT-5**) | **NOT BUILT** | whole-work render exists only for export |
| A vocabulary for noticing without evaluating | ⛔ **DOES NOT EXIST** | §3 |
| Intention object | **NOT BUILT, and must not be required** | PT-2 held |

---

## 3 — The finding: the existing lenses are intervention-shaped

The seven ratified DEVELOP lenses (`LENS_MEANING`, verbatim) each **ask an evaluative
question**:

```text
structure     Does this belong here? What is missing? What repeats?
development   Which ideas are underdeveloped · overexplained · abandoned?
continuity    Prospective language where later has already happened.
arc           What journey does this chapter take the reader through?
voice         Where does this DEPART from the established voice of this Work?
coherence     Does this contradict an earlier chapter?
reader        Where might they lose orientation?
```

Every one is a diagnosis. That is correct for DEVELOP — the writer has consciously reopened
the creative process. It is **exactly wrong for Encounter**, where the writer has opened a
box from 1987 and the system's first move must not be a list of faults.

> ⛔ **Encounter is not DEVELOP with a gentler label.** Reusing the lens vocabulary and
> softening the prose would produce a diagnosis wearing a welcome, and the writer would feel
> the difference immediately.

The thesis names what Encounter may notice, and every item is descriptive rather than
evaluative: *what the Work seems to care about · its shape and major movements · recurring
images, ideas, voices, characters, questions · places that feel particularly alive · what
appears unfinished **without calling it deficient** · what the writer remembers now that
they are seeing it again.*

**That last one is not MAIA's observation at all — it is the writer's.** Encounter may have
to be a surface that mostly listens.

---

## 4 — Open questions for the founder

**E-01 · Does Encounter produce a stored artifact?** A frozen reading is a durable record
*about the member's book*, authored by the system. For DEVELOP the member commissioned it.
For a work merely being re-read, storing MAIA's impressions may be a memory the member never
asked for. *Recommendation: Encounter is ephemeral by default; anything kept is a member act.*

**E-02 · Where does Encounter live relative to PT-5?** *Section is attention; Whole Manuscript
is presence.* Encounter is a presence act, so it likely belongs beside the quiet surface — but
PT-5 forbids that surface accumulating markup. Either Encounter is a separate room, or the
quiet surface gains a mode that can be entered and left, and never a layer that stays on.

**E-03 · Is Encounter available for a work in progress, or only a returned one?** The thesis
frames it as the returning writer's phase. *Recommendation: available whenever the member
asks, never automatic — an unrequested Encounter is a diagnosis by another name.*

**E-04 · Does anything Encounter notices become an input to a later intention?** PT-2 is held,
and if Encounter quietly pre-computes what Restore or Redevelop would later use, the system
has begun the intervention it was built to postpone. *Recommendation: no carry-forward.*

**E-05 · Does the vocabulary need its own ratification act?** The lens meanings were ratified
by founder act (2026-09-04) precisely because underdefined semantics at that boundary broke
reproducibility. An Encounter vocabulary would need the same.

---

## 5 — Proposed shape of the lane (not authorized)

`E0` census (this document) → `E1` the noticing vocabulary, ratified before any code →
`E2` the Encounter act: server-owned, member-initiated, ephemeral by default →
`E3` its surface, respecting PT-5 → `E4` falsifiers, including a **negative control that an
Encounter cannot emit an evaluative observation** — the reproducible form of *encounter
precedes intervention*.

⛔ **E1 needs a founder act.** *Jarvis does not open a stage on a vocabulary nobody has ratified.*

> The writer opened a box from 1987. The system's first job is to help them see what is in
> it — and to have nothing to say about whether it is good.
