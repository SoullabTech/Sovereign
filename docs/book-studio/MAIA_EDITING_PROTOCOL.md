# MAIA Editing Protocol — author-preserving

> Articulated by Kelly during the Soullab Press founding arc, 2026-04-26.
> Designed to **sharpen without diluting** the manuscript voice.

## Pass 0 — Developmental structure (runs first)

Before any of the six passes below, the chapter's **job**, **sequence**, and **section functions** must be
settled. That is a different act from editing prose, and it has its own doctrine:
**[`DEVELOPMENTAL_EDITOR_PROTOCOL_v1.md`](./DEVELOPMENTAL_EDITOR_PROTOCOL_v1.md)** — KEEP / MOVE / CUT /
HOLD / FLAG / BRIDGE, structure before language, and the author writes the bridges.

Never polish a sentence inside a section that may later be moved or cut. The six passes below begin only
once the architecture is standing.

Worked example: [`CHAPTER_10_STRUCTURE_PASS_v1.md`](./CHAPTER_10_STRUCTURE_PASS_v1.md).

---

## Core rule

```
MAIA suggests. You decide.
Nothing is auto-rewritten.
```

| MAIA can       | MAIA cannot          |
| -------------- | -------------------- |
| reduce         | originate meaning    |
| rearrange      | replace tone         |
| clarify structure | add voice         |

---

## Pass 1 — Structural clarity (no rewriting)

> "Diagnose this chapter. Do not rewrite. Identify where:
> - ideas stack or blur
> - transitions are missing
> - openings or endings are weak
> - sections could be separated or reordered."

**Output contract:** 5–7 bullets max. Precise, not verbose.

## Pass 2 — Density reduction

> "Where is this chapter saying the same thing more than once or carrying too many ideas in one paragraph?"

**Output contract:** exact paragraphs identified, suggested cuts or splits. Author chooses what to remove.

## Pass 3 — Elemental balance

> "Assess this chapter across:
> - Fire (vision)
> - Water (depth)
> - Earth (application)
> - Air (clarity)
>
> Where is it imbalanced?"

This is where the system becomes editorial intelligence specific to Soullab.

## Pass 4 — Image + diagram mapping

> "Where does the reader need:
> - a diagram
> - an archetypal image
> - no image (keep text)?"

**Output contract:** location-specific recommendations that feed directly into the asset bridge (`lib/manuscript/adapters/manuscriptAssetMap.ts`).

## Pass 5 — Voice integrity check

> "Does any part of this read generic, flattened, or less precise than the rest?"

Protects against drift, especially after density reduction.

## Pass 6 — Final compression pass

> "If nothing essential is removed, where could this chapter be 10–15 % shorter?"

**Output contract:** suggestions only. No rewriting.

---

## Workflow

For each chapter:

1. Run Pass 1.
2. Review suggestions.
3. Accept/reject manually.
4. Preserve original text unless consciously changed.
5. Repeat with subsequent passes.

Outcome: tighter manuscript, preserved voice, clearer structure, image-ready sections.

---

## Implementation notes (deferred — Phase 5 territory)

When this protocol is wired into MAIA proper (not a manual chapter-by-chapter exercise), it becomes a service:

```
POST /api/book-studio/diagnose
  body: { chapterId, pass: 1|2|3|4|5|6 }
  → 5–7 bullet diagnostic, no rewrites
```

Until then, the protocol runs as conversation prompts against MAIA in the Book Companion or directly through the standard /maia surface.

The existing scribe / synthesis primitives surfaced in the audit
(`lib/scribe/transcriptCleaner.ts`, `lib/wisdom-engines/WisdomSynthesisEngine.ts`,
`lib/supervision/SessionSynthesizer.ts`) provide the editorial substrate
when the service is built.
