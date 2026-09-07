# RECONCILIATION NOTE — the successor to `RoomFacts`

**Authority** Founder ruling **FR-05**, 2026-09-07.
**Scope** Reconciles `FIELD-MAP.md` §6 and `CAPABILITY-MAP.md` with the
implementation as it stands on `claude/writers-studio-capability-clxw8d`.

> **The historical R&D is NOT rewritten.** It is correct as a record of what was
> intended and known in August 2026. This note sits beside it and says what
> succeeded it. A record that argues with itself is worse than one that is
> dated.

---

## What the record says

`FIELD-MAP §6` names one object as MAIA's whole per-turn situation —

```text
RoomFacts   workTitle · workPurpose · workForm · workStage · materials[]
            manuscriptTitle · draftChars · draftExcerpt   (6,000 chars, the opening)
```

— and calls extending it *"the single largest EXTEND in this map, and the one
that must be done with exclusion designed in, never by handing MAIA the whole
manuscript."*

## What is actually there now

`lib/studio/companionStance.ts`, the `RoomFacts` type, and
`app/api/sovereign/studio/` **no longer exist.** They were superseded by
**three bounded perception paths**:

```text
SITUATED CONVERSATION        lib/writersStudio/workSituation.ts
member's words about the Work
→ no manuscript prose by default

DEVELOPMENTAL READER         lib/manuscript/developmentalReader/
explicitly invoked manuscript reading
→ digest-verified coverage
→ bounded
→ coverage may not lie

ASK                          lib/writersStudio/askClient.ts
anchors + author-provided text
→ no general manuscript prose up the wire
→ no write authority
```

## The reconciliation

**FR-05 — ACCEPTED as the successor architecture. Do not rebuild `RoomFacts`.**

The three paths are a **better realization of the same R&D principle**: each
excludes by construction rather than by policy.

```text
STALE          the instruction to EXTEND RoomFacts
               (the object it names no longer exists)

RATIFIED       the purpose beneath it, unchanged:

               MAIA may become more situated in the Work
               only through deliberately bounded perception.
```

## What this note does not settle

`FR-06` holds the open question this architecture now poses in the developmental
reader: **how a writer authorizes meaningful perception of a large Work while
coverage stays bounded, explicit and truthful.** The `60,000` code-point ceiling
remains held; silent truncation and raising the number are both forbidden. See
`docs/programme/WRITERS-STUDIO-CAPABILITY-COMPLETION-01_FOUNDER_RULINGS_III_2026-09-07.md`.
