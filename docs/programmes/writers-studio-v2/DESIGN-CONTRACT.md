# WRITERS-STUDIO-V2 — Design Contract

**Status: DERIVED — not yet frozen.** See §0. This file becomes normative the
moment the reference images land in `reference/`.

---

## §0 — The frozen references are not in the repository yet

The eight reference screens were shared as images in a Claude Code conversation.
Images pasted into a conversation do not persist to the repository, and this
programme's first rule is that its state may not live in a disposable context.

**A design contract whose source material exists only in chat is not frozen.**

### Required to close WS2-00

Drop the reference screens into:

```text
docs/programmes/writers-studio-v2/reference/
    01-work-home.png
    02-write.png
    03-materials.png
    04-structure.png
    05-developmental-review.png
    06-maia.png
    07-goals-statistics.png
    08-publish.png
```

Filenames are a proposal — name them for what they show. Then this file records
the actual filename against each screen and drops the DERIVED marker.

Until then, §1–§3 below are **my written reading of what was shown**, useful for
planning and insufficient for acceptance. No unit from WS2-02 onward may claim
visual acceptance against a description. Acceptance compares against an image.

---

## §1 — The five modes

One environment, not five applications.

```text
WRITE      the manuscript, the chapter, the sentence
DEVELOP    the work seen whole — review, findings, evidence
EXPLORE    work home — what exists, what is recent, what MAIA noticed
REVIEW     reader lenses, dispositions, response
PUBLISH    assembly, export, sharing
```

Shared across all five, always present:

- **the work** — the object every mode is about
- **MAIA** — a persistent companion region, one MAIA, context-aware per mode
- **work context** — which work, which manuscript, which position, never ambiguous

Materials, Structure, Versions, Goals, Research, Statistics are **not modes**.
They surface inside the mode where they are needed.

## §2 — Composition rules derived from the references

- Dark ground. Gold used as accent and emphasis, not as decoration.
- Generous type. Long-form reading is the primary act; the room is built around
  a column of prose, not around chrome.
- Panels are contextual and dismissible, not permanent furniture.
- Density is low. The references show restraint — whitespace is load-bearing.
- Navigation is persistent and shallow. The writer always knows where they are
  and can get back to the manuscript in one move.

## §3 — Visual acceptance

For each major screen, an implementation pass produces a screenshot at the same
viewport as the reference. The EXPERIENCE pass checks:

```text
composition · hierarchy · density · typography · alignment · states · fidelity · interaction
```

Not pixel-perfect cloning — the references carry conceptual information, not a
spec sheet. Close enough that an old Press screen cannot be shipped and called
the new Studio.

## §4 — What must never be fabricated

The references show numbers. Some are computable facts. Some are judgments
wearing the costume of measurement. The distinction is binding — see
`DECISIONS.md` §D-003.

**Computed and showable:** word count · material count · chapter count · goal
progress against a writer-declared target · reading time · version count ·
finding count · passage count.

**Not showable as a measurement:** movement health % · cohesion % · coherence:
strong · high priority · any score, grade, or ranking MAIA produced.

MAIA may notice, interpret, question, and provide evidence. The writer assigns
importance. If a reference screen shows `86% Movement Health`, the implementation
does not ship that number — it ships what MAIA actually noticed, with the passage
it noticed it in.
