---
level: protocol
---

# Corpus Discipline Protocol v1.0

**Status:** Canon
**Date:** 2026-02-28
**Depends on:** ORACLE_CORPUS_DESIGN_v1.0.md, CORPUS_WEIGHTING_SCHEMA_v1.0.md

---

## Purpose

The weighting schema defines how corpus material influences MAIA. This protocol defines what every document must declare before it enters the corpus — so the weighting system works in practice, not just on paper.

Without metadata discipline, weights become arbitrary. With it, the system is self-describing and maintainable by anyone who comes after you.

---

## Required Frontmatter (Every Corpus Document)

Every document in `/data/oracle-corpus` must have these fields, either as YAML frontmatter (Markdown) or a sidecar `.meta.json` file (PDFs, other formats).

```yaml
---
tier: 2
authority: primary
source_type: framework
title: "Spiralogic 12-Phase Reference"
author: "Mark"
version: "1.3"
date_added: "2026-02-28"
status: stable
safe_for_retrieval: true
---
```

---

## Field Definitions

### `tier` (integer: 1–4)

The weighting tier from the Corpus Weighting Schema.

| Value | Meaning |
|---|---|
| `1` | Voice — tone anchors, exemplary MAIA responses |
| `2` | Core frameworks — Spiralogic, AIN, elemental model |
| `3` | Teachings and practice — books, courses, rituals |
| `4` | Research — curated external material |

**Do not use tier 1 casually.** Tier 1 documents shape MAIA's voice. Assign sparingly.

---

### `authority` (string)

Who holds authority over this document's content.

| Value | Meaning |
|---|---|
| `primary` | Written by you; you are the authority |
| `derivative` | Your synthesis of external sources |
| `external` | External source you endorse |
| `reference` | Background material, lower trust |

Tier 1 and 2 documents should almost always be `primary`. If a tier 2 document is `external`, that is a flag for review.

---

### `source_type` (string)

What kind of document this is.

| Value | Examples |
|---|---|
| `framework` | Spiralogic model, AIN ontology |
| `manuscript` | Book chapter, essay |
| `teaching` | Course module, workshop notes |
| `ritual` | Ceremony guide, practice language |
| `voice-anchor` | Exemplary MAIA response, tone reference |
| `psychology` | Depth psychology framework |
| `research` | Paper, book, curated external source |
| `transcript` | Curated conversation excerpt |

---

### `status` (string)

The document's stability.

| Value | Meaning |
|---|---|
| `stable` | Will not change; safe to index and retrieve |
| `review` | Correct but under active review; retrieve with caution |
| `deprecated` | Superseded; should be moved to `/data/archive` |

**Only `stable` documents should be active in retrieval.** Documents marked `review` can be indexed but should receive a weight modifier of 0.5 until promoted to `stable`.

---

### `safe_for_retrieval` (boolean)

Explicit human sign-off that this document is safe to surface in any conversation context.

If you are uncertain, set to `false`. A document with `safe_for_retrieval: false` is indexed but never retrieved — it can be searched manually but will not appear in MAIA's context window.

**This field exists for one reason:** some documents are true but not helpful to surface mid-session. Personal processing material that was accidentally promoted. Research that is correct but destabilizing without context. Framework drafts that became outdated. This flag is the safety valve.

---

### `title`, `author`, `version`, `date_added`

Self-explanatory. `version` follows semantic versioning (`1.0`, `1.1`, etc.) for documents that evolve. Use `1.0` for documents that are complete and unlikely to change.

---

## Minimal Metadata (When Full Frontmatter Is Impractical)

For PDFs and external documents where adding frontmatter is not possible, create a sidecar file:

**Filename:** `document-name.meta.json`

```json
{
  "tier": 4,
  "authority": "external",
  "source_type": "research",
  "title": "The Body Keeps the Score",
  "author": "Bessel van der Kolk",
  "version": "1.0",
  "date_added": "2026-02-28",
  "status": "stable",
  "safe_for_retrieval": true,
  "notes": "Chapters 1–5 only. Trauma physiology section. Do not retrieve chapter 12 (EMDR protocol detail)."
}
```

The `notes` field is free text — use it to record what you were thinking when you added this document. Future you will want to know.

---

## The Promotion Checklist

Before moving any document from `_corpus-ready/` into `/data/oracle-corpus/`:

- [ ] Frontmatter or sidecar `.meta.json` is complete
- [ ] `tier` is assigned deliberately (not defaulted)
- [ ] `authority` accurately reflects your relationship to this content
- [ ] `status: stable` (not `review`)
- [ ] `safe_for_retrieval: true` confirmed
- [ ] Placed in the correct subfolder (`/core-frameworks`, `/teachings`, etc.)
- [ ] If replacing an older version: old version moved to `/data/archive`

This checklist takes two minutes. Skipping it causes corpus drift.

---

## Corpus Drift: What It Looks Like

Corpus drift is the silent degradation of retrieval quality over time. Signs:

- MAIA's responses become inconsistent across sessions
- Tone shifts — sometimes present, sometimes analytical
- Responses cite outdated framings you have since revised
- Field sessions feel "heavier" for no identifiable reason

The cause is almost always one of:
1. Documents without stable status active in retrieval
2. Tier assignments that were defaulted rather than decided
3. `safe_for_retrieval: true` on material that should have been `false`
4. Outdated documents not moved to archive when new versions were promoted

**The audit response:** run a corpus audit (list all documents, check metadata completeness, spot-check tier assignments) before tuning retrieval weights or prompt engineering.

---

## Current Corpus Location

**Answer this before anything else:**

> Where is the canonical corpus stored today?

If the answer is "mixed" (some in Obsidian, some in `/data/`, some on the Mac Studio desktop, some in email attachments) — stabilize the location before adding metadata. Metadata on documents that aren't in the right place is wasted work.

The correct answer for this architecture is:
- **Obsidian vault `_corpus-ready/`** → working promotion gate
- **`/data/oracle-corpus/` on MinisForum** → canonical, indexed

Everything else is working material or archive.

---

## Summary: What Every Document Needs

```
tier + authority + source_type + status + safe_for_retrieval
```

Five fields. Two minutes per document. The difference between a coherent epistemic field and a search index.
