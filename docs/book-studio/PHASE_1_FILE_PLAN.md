# Soullab Book Studio — Phase 1 File Plan

> Produced 2026-04-26 from a focused repo audit.
> The book is already structured. The job is to **unify what exists**, not invent.

---

## Architectural shape (confirmed by audit)

```
Book Companion (existing UI)
    +
Manuscript Model (NEW — single source of truth)
    +
Media Studio (existing — assets backbone)
    +
Scribe / Synthesis engines (existing — editorial passes)
    +
Paged.js renderer (NEW — minimal)
    →
Print PDF / EPUB / Web export
```

Book Studio is **not a new app**. It is a bridge layer.

---

## What the audit revealed about Elemental Alchemy

- The book is **already structured as JSON**:
  - `app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json` (canonical)
  - `elemental-alchemy-full.json`, `elemental-alchemy-processed.json`, `elemental-alchemy-summary.json` (variants)
- A parser already exists: `scripts/parse-elemental-alchemy-book.ts`
- Book loaders are wired: `lib/knowledge/ElementalAlchemyBookLoader.ts`, `lib/knowledge/ElementalAlchemyKnowledge.ts`, `lib/ain/elemental-alchemy-integration.ts`
- A style bible exists: `data/illustrations/elemental-alchemy-style-bible.md`
- Audiobook + voice formatting guides exist under `android/`
- **Eight duplicated `Chapter` interfaces** are scattered across the repo — fragmentation has already started:
  1. `lib/book-knowledge-vectorizer.ts` (`BookChapter`)
  2. `app/book/ask/page.tsx`
  3. `app/book/companion/page.tsx`
  4. `app/api/_backend/scripts/ingestElementalAlchemyBook.ts`
  5. `app/api/_backend/scripts/ingestElementalAlchemyBookSimple.ts`
  6. `app/maia/community/elemental-alchemy/page.tsx`
  7. `app/labtools/story-creator/page.tsx`
  8. `app/labtools/elemental-alchemy/page.tsx`
- A **block-based content model is already in production via Ideas**: `member_idea_blocks` table with a `block_type` discriminator (`note | decision | change | maia_reflection`). This is the closest existing precedent for the Manuscript Block model.
- `components/elemental-alchemy/BookChat.tsx` is **content-decoupled** — takes `bookTitle`, `author`, `currentChapter` as props. Already shaped to attach to any manuscript.

What this means: the missing piece is even smaller than expected.

---

## Step 0 — Ground the model in what exists (READ ONLY, no writes)

Before writing the canonical model, read these files in order to define a **superset** that doesn't break any existing usage:

1. `app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json` — actual book structure
2. `app/api/_backend/scripts/ingestElementalAlchemyBook.ts` — full Chapter shape used during ingestion
3. `app/api/_backend/scripts/ingestElementalAlchemyBookSimple.ts` — simple Chapter shape
4. `lib/book-knowledge-vectorizer.ts` — `BookChapter` for vectorization
5. `app/book/companion/page.tsx`, `app/book/ask/page.tsx` — companion-side Chapter shapes
6. `app/maia/community/elemental-alchemy/page.tsx` — Chapter + Section community shape
7. `database/migrations/20260409000001_member_ideas.sql` — `member_idea_blocks` discriminator pattern
8. `database/migrations/20260422000001_idea_block_maia_reflection.sql` — CHECK constraint pattern

Output of Step 0: a written field-by-field comparison (kept in this directory or in a session note) showing which fields the canonical model must cover.

---

## Step 1 — Canonical Manuscript model (NEW)

### 1a. `lib/manuscript/types.ts`

Single source of truth. Discriminated `Block` union modeled on the Ideas precedent.

Shape (subject to refinement after Step 0):

```ts
type Manuscript = {
  id: string
  title: string
  author: string
  parts: Part[]
  styleBibleId?: string
}

type Part = {
  id: string
  title: string
  chapters: Chapter[]
}

type Chapter = {
  id: string
  number: number
  title: string
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether'
  blocks: Block[]
}

type Block =
  | { type: 'text';      content: string }
  | { type: 'heading';   level: 1 | 2 | 3; content: string }
  | { type: 'image';     assetId: string; role: ImageRole; caption?: string }
  | { type: 'diagram';   assetId: string; caption?: string }
  | { type: 'practice';  content: string }
  | { type: 'quote';     content: string; attribution?: string }
  | { type: 'pullquote'; content: string }
  | { type: 'callout';   kind: string; content: string }

type ImageRole = 'diagram' | 'archetype' | 'instructional' | 'atmospheric'
```

Critical: `assetId` connects to **Media Studio**, not file paths or URLs.

### 1b. `lib/manuscript/adapters.ts`

`fromElementalAlchemyJson(book): Manuscript` — one-shot adapter from existing JSON. Pure. Idempotent.

### 1c. `lib/manuscript/index.ts`

Barrel export.

---

## Step 2 — Editorial passes (REUSE existing engines)

No new engines. Wire to existing:

- `lib/scribe/transcriptCleaner.ts` → manuscript clarity pass
- `lib/scribe/transcriptRepair.ts` → block repair
- `lib/wisdom-engines/WisdomSynthesisEngine.ts` → chapter synthesis
- `lib/supervision/SessionSynthesizer.ts` → cross-chapter coherence

NEW thin shim only:

### 2a. `lib/manuscript/passes.ts`

`runEditorialPass(block, passKind)` — dispatches to existing engines with manuscript-shaped inputs. Read-only by default; transformations require an explicit confirmed flag.

---

## Step 3 — Render layer (NEW, minimal)

### 3a. `lib/manuscript/render/html.ts`

`manuscriptToHtml(m: Manuscript, theme): string`. Pure. Deterministic. No side effects.

### 3b. `lib/manuscript/render/print.css`

Print CSS for Paged.js — typography, page rules, margins, widows/orphans, chapter break-before, running headers, page numbers.

### 3c. `lib/manuscript/render/pagedPdf.ts`

Uses **existing puppeteer** (already installed). `renderPdf(html, css): Buffer`. Loads Paged.js inside the browser context.

### 3d. Dependency addition

Paged.js — vendored JS file (preferred for sovereignty) or pinned npm install. Single dep concern.

---

## Step 4 — Image asset role-tagging (EXTEND Media Studio)

Don't create a parallel asset system.

### 4a. Migration: `database/migrations/<timestamp>_media_assets_book_roles.sql`

Extend the existing media_assets table:

- `book_role` TEXT NULL CHECK (`'diagram' | 'archetype' | 'instructional' | 'atmospheric'`)
- `manuscript_id` UUID NULL
- `chapter_id` TEXT NULL
- `element` TEXT NULL CHECK (`'fire' | 'water' | 'earth' | 'air' | 'aether'`)

### 4b. `lib/manuscript/assets.ts`

`getAssetForBlock(block): Promise<Asset | null>` — resolves `assetId` against Media Studio.

---

## Step 5 — One-route render endpoint

### 5a. `app/api/manuscript/[id]/render/route.ts`

`GET ?format=pdf|html` (start with html + pdf only). Authenticated. No new UI yet. EPUB after PDF works.

---

## Step 6 — Smoke test (1 chapter, end-to-end)

Pick **Chapter 1 of Elemental Alchemy**. Pipeline:

```
elemental-alchemy-book.json
    ↓ adapter
Manuscript (typed)
    ↓ html renderer
HTML
    ↓ Paged.js + puppeteer
PDF
```

Ignore styling perfection. Goal: prove the chain end-to-end.

### 6a. Test: `lib/manuscript/__tests__/smoke.test.ts`

---

## What we are NOT building in Phase 1

- No WYSIWYG editor
- No member-facing UI (deferred to Phase 3)
- No EPUB export (deferred until PDF is clean)
- No image generation pipeline (Phase 2)
- No new asset storage system
- No consolidation of the 8 duplicated Chapter interfaces (do that AFTER the canonical model is proven on one chapter — premature now)

---

## Open decisions before code starts

1. **Paged.js delivery** — vendored JS file (sovereign-clean, version-fragile) vs pinned npm package. Lean toward vendored.
2. **Manuscript persistence** — filesystem JSON (matches current ground truth) vs database table. Recommendation: defer DB until Phase 3 (member books). JSON files are sufficient and observable for Phase 1.
3. **Image generation pipeline** (Phase 2) — local SDXL/Flux vs API. Don't decide yet. Phase 1 brief format will be model-agnostic.

---

## Touch count

- New files: ~10 (types, adapters, passes, html render, print css, pdf render, route, smoke test, migration, index)
- Modified files: 0
- New deps: 1 (Paged.js)

---

## After Phase 1

- **Phase 2** — image briefs + asset workflow + Element-coded style system
- **Phase 3** — member-facing Book Studio (extends, does not rebuild)

---

## Re-entry guard (sovereignty check before code starts)

Before scaffolding, confirm:

- Does this increase user agency? (Yes — members get a sovereign book pipeline.)
- Does this push life outward into the world? (Yes — books are transmissible artifacts.)
- Does this reduce the system's psychological centrality over time? (Neutral — books exist independent of MAIA once produced.)

If any answer becomes "no" during build, stop and re-read this section.
