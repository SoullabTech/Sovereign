# WRITERS-STUDIO-V2 — Design Contract

**Status: FROZEN.** The reference screens are under repository custody as of
commit `1493c28c0`. §1–§3 below are now normative: a unit's visual acceptance
compares against an image, not against a description.

---

## §0 — The frozen references

`docs/design/writer-studio/references/`, committed 2026-08-27 in `1493c28c0`.

| File | Screen | Unit |
|---|---|---|
| `01-work-home.png` | Work Home | WS-HOME |
| `02-structure-versions.png` | Structure & Versions | WS-STRUCTURE |
| `03-developmental-review.png` | Developmental Review | WS-DEVELOP |
| `04-writing-field-wide.png` | Writing Field — **CANONICAL for WS-WRITE** | WS-WRITE |
| `05-materials-studio.png` | Materials Studio | WS-GATHER |
| `08-writing-field-compact.png` | Writing Field, second architecture | WS-WRITE |

**`06-` and `07-` are byte-identical duplicates of `03-`** (md5
`fb60a0e02a3fac7e54c8d90508127097`, all three). There are **six distinct
references, not eight**. They are kept as committed rather than deleted — the
pack is the founder's artifact — but no unit may treat them as variants
carrying additional information. Verified by checksum, not by filename.

### §0.1 — What 04 and 08 actually differ on

Recorded because the difference is architectural, and because an earlier
description of it in this programme was wrong.

`04-writing-field-wide.png` (canonical) carries the **five-mode top
navigation** — WRITE · DEVELOP · EXPLORE · REVIEW · PUBLISH — a left rail
split WORK SPACE / MAIA / TOOLS, MAIA adjacent to the manuscript, **Materials
as a right rail**, and a bottom band holding Versions, Outline/Threads/
Timeline/Word Web, Goals and Statistics.

`08-writing-field-compact.png` has **no five-mode nav**. Its left rail is a
flat field list (Writing · Materials · Structure · Versions · Developmental
Review · Reader Lenses · Notes · Goals · Export), the editor carries a
formatting toolbar with find-in-chapter and Focus, **Materials runs as a
horizontal strip along the bottom**, and — importantly — MAIA's insights carry
the **disposition controls** (Discuss / Keep / Unresolved / Dismiss) inline.

04 is canonical because the five-mode navigation is the shell the whole
programme is built around; only 04 shows it. What 08 contributes and 04 does
not is the disposition row inside MAIA, which is the same member-adjudicates
rule WS-DEVELOP is built on, appearing in the writing field. Both facts carry
forward.

## §0.2 — The capture contract

Confirmed, and binding on every visual acceptance:

```text
script     scripts/capture-studio-field.mjs
viewport   1680 × 1050 @2x, fixed INSIDE the script, never passed per run
wait       for the draft to load — a capture taken early photographs a
           loading state and calls it the field
output     docs/design/writer-studio/implementations/<field>-<sha>.png
```

Two captures are comparable only because the viewport cannot vary between
them. A remote Claude Code session cannot capture — no database, no env files,
nothing for a browser to point at — but it can read both PNGs from the
repository and do the comparison.

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
