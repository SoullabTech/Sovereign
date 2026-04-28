/**
 * Soullab Book Studio — canonical Manuscript types (Phase 1, Step 0)
 *
 * Conservative superset of the existing manuscript-shaped interfaces
 * scattered across the repo (audited 2026-04-26). This file is purely
 * additive: nothing imports from it yet, no existing code is modified,
 * no migrations or runtime behavior change.
 *
 * Sources surveyed (8 Chapter-shaped declarations + 1 JSON file):
 *
 *   IN-DOMAIN (these collapse into Manuscript.Chapter — Phase 2):
 *   1. lib/book-knowledge-vectorizer.ts                     `BookChapter`
 *   2. app/api/_backend/scripts/ingestElementalAlchemyBook.ts        `Chapter`
 *   3. app/api/_backend/scripts/ingestElementalAlchemyBookSimple.ts  `Chapter`
 *   4. app/maia/community/elemental-alchemy/page.tsx        `Chapter` + `Section`
 *   5. app/book/companion/page.tsx                          `Chapter`
 *   6. app/book/ask/page.tsx                                `Chapter`
 *
 *   OUT-OF-DOMAIN (intentionally not consolidated — different artifacts):
 *   7. app/labtools/story-creator/page.tsx                  `Chapter`
 *      → "Soul Story" chapters (drafts/revisions of a generated narrative,
 *         not a published manuscript). Keep separate.
 *   8. app/labtools/elemental-alchemy/page.tsx              `Chapter`
 *      → Audiobook playback manifest (folder/audioFile/duration).
 *         Belongs in Media Studio as an audiobook asset, not the
 *         manuscript model. Keep separate.
 *
 *   Block discriminator pattern borrowed from:
 *      database/migrations/20260409000001_member_ideas.sql
 *      (member_idea_blocks: block_type CHECK + content TEXT + metadata JSONB)
 *
 *   Source-of-truth JSON shape:
 *      app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json
 *      (top-level keys: type, title, author, source, processed_at,
 *       content {chapters[], preface?, introduction?, appendix?},
 *       integration_notes?, metadata?)
 *
 * Step 0 deliverable only — adapters, render layer, and migrations
 * arrive in Step 1+ per docs/book-studio/PHASE_1_FILE_PLAN.md.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * Five-element vocabulary used across the manuscript and adjacent systems.
 * Source: scripts/parse-elemental-alchemy-book.ts ELEMENT_MAP, plus
 * Bridge-D persistence and the conductor hysteresis layer.
 */
export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

/**
 * Twelve-archetype set referenced by the vectorizer's
 * archetypeActivations field.
 *
 * Source: lib/book-knowledge-vectorizer.ts (the file is @ts-nocheck,
 * so this is currently the only typed reference to the closed set).
 */
export type Archetype =
  | 'sage'
  | 'lover'
  | 'warrior'
  | 'innocent'
  | 'explorer'
  | 'creator'
  | 'ruler'
  | 'caregiver'
  | 'everyman'
  | 'jester'
  | 'rebel'
  | 'magician';

/**
 * Image roles for asset-tagging in Media Studio.
 *
 * Source: doctrine in docs/book-studio/PHASE_1_FILE_PLAN.md (Step 4).
 * Not yet enforced by a CHECK constraint — that arrives in the
 * Step 4 migration.
 */
export type ImageRole = 'diagram' | 'archetype' | 'instructional' | 'atmospheric';

// ---------------------------------------------------------------------------
// Block — fine-grained editorial unit (Phase 2 target)
// ---------------------------------------------------------------------------

/**
 * Discriminated union for typed manuscript blocks.
 *
 * In Phase 1, `Chapter.blocks` is OPTIONAL. The render layer will prefer
 * `blocks` when present and fall back to `fullContent` when absent.
 * This lets the renderer ship before any chapter is converted into
 * blocks, and lets blocks land chapter-by-chapter without a flag day.
 *
 * Discriminator pattern follows member_idea_blocks.block_type
 * (note | decision | change | maia_reflection). The set below is
 * intentionally larger because manuscripts express more structural
 * shapes than an iterative idea thread.
 */
export type Block =
  | { type: 'text'; content: string }
  | { type: 'heading'; level: 1 | 2 | 3; content: string }
  | { type: 'image'; assetId: string; role: ImageRole; caption?: string }
  // image-placeholder: an unresolved markdown reference (e.g. ![][image8])
  // that has not yet been bound to a Media Studio asset. The Step 4
  // migration + asset-tagging step promotes these to `image` blocks
  // by mapping `ref` → `assetId`.
  | { type: 'image-placeholder'; ref: string; caption?: string }
  | { type: 'diagram'; assetId: string; caption?: string }
  | { type: 'practice'; content: string }
  | { type: 'quote'; content: string; attribution?: string }
  | { type: 'pullquote'; content: string }
  | { type: 'callout'; kind: string; content: string };

// ---------------------------------------------------------------------------
// Section — legacy parser-friendly sub-heading
// ---------------------------------------------------------------------------

/**
 * Sub-heading inside a chapter, as produced by
 * scripts/parse-elemental-alchemy-book.ts and consumed by
 * app/maia/community/elemental-alchemy/page.tsx.
 *
 * Kept as-is for compatibility. In Phase 2, sections may be lowered
 * into a sequence of `heading` + `text` blocks; until then the two
 * forms coexist on Chapter.
 */
export interface Section {
  title: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Chapter — conservative superset of the 6 in-domain Chapter shapes
// ---------------------------------------------------------------------------

/**
 * Canonical chapter shape.
 *
 * Field-by-field provenance:
 *
 *   number                — sources 1, 2, 3, 4 (vectorizer uses chapterNumber)
 *   chapterNumber         — source 1 only; kept as alias to ease v1 collapse
 *                           TODO(phase-2): pick one of {number, chapterNumber}
 *                           and migrate the other away
 *   title                 — all 6 sources
 *   id                    — source 1; optional everywhere else (derive from
 *                           number if unset)
 *   element               — sources 2, 3, 4, 5, 6
 *   fullContent           — source 4 (canonical full markdown blob)
 *   content               — sources 1, 2, 3, 5 (legacy alias of fullContent)
 *                           TODO(phase-2): collapse content → fullContent
 *   sections              — source 4 (parsed sub-headings)
 *   excerpt               — source 5 (companion lookup result)
 *   content_excerpt       — source 4 + JSON file (legacy summary)
 *                           TODO(phase-2): collapse {excerpt, content_excerpt}
 *                           into a single `excerpt`
 *   relevance             — source 6 ONLY — this is a search-result
 *                           property, NOT a chapter property. Excluded
 *                           here on purpose. Source 6 should consume a
 *                           wrapper type:
 *                              type ChapterSearchResult = {
 *                                chapter: Chapter; relevance: number;
 *                              }
 *                           TODO(phase-2): introduce that wrapper and
 *                           refactor app/book/ask/page.tsx
 *   keyTeachings          — sources 1, 2, 3, 4
 *   practicalApplications — source 1 (vectorizer)
 *   consciousnessLevel    — source 1 (vectorizer)
 *   elementalResonance    — source 1 (vectorizer)
 *   archetypeActivations  — source 1 (vectorizer)
 *   blocks                — NEW (Phase 2 fine-grained editing target)
 *   metadata              — NEW extension hatch, mirrors
 *                           member_idea_blocks.metadata jsonb pattern
 */
export interface Chapter {
  // --- Identity / position ---
  number: number;
  /** @deprecated Alias of `number` — collapse in Phase 2. */
  chapterNumber?: number;
  id?: string;

  // --- Title and element coding ---
  title: string;
  element?: Element;

  // --- Content forms (a chapter typically populates ONE of these) ---
  /** Canonical full markdown blob. Preferred read path. */
  fullContent?: string;
  /** Legacy alias for fullContent. Used by ingestion + companion lookups. */
  content?: string;
  /** Parsed sub-headings (from scripts/parse-elemental-alchemy-book.ts). */
  sections?: Section[];
  /** Short summary used in companion lookup results. */
  excerpt?: string;
  /** Legacy summary key from the founder-knowledge JSON. */
  content_excerpt?: string;

  // --- Editorial annotations ---
  keyTeachings?: string[];
  practicalApplications?: string[];

  // --- Resonance scoring (vectorizer; optional everywhere else) ---
  consciousnessLevel?: number;
  elementalResonance?: Partial<Record<Element, number>>;
  archetypeActivations?: Partial<Record<Archetype, number>>;

  // --- Fine-grained editing (Phase 2 target; undefined in Phase 1) ---
  blocks?: Block[];

  // --- Section categorization (vectorizer's `section?: string`) ---
  /**
   * Free-form section/cluster label from the vectorizer.
   * NOT to be confused with `Section[]` (sub-headings). Kept for
   * compatibility; consider renaming or removing in Phase 2.
   */
  section?: string;

  // --- Extension hatch ---
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Part — structural grouping above chapter (future)
// ---------------------------------------------------------------------------

/**
 * Optional grouping of chapters into a higher-level Part.
 *
 * No surveyed source uses Parts. Elemental Alchemy flows directly
 * from Chapter 1 through Chapter 9 with no Part-level division.
 *
 * TODO(phase-2): Verify on a second member book whether Part is
 * actually needed, or whether `Manuscript.chapters` flat is enough
 * for v1. If unused after a real second-book test, delete this.
 */
export interface Part {
  id?: string;
  title: string;
  chapters: Chapter[];
}

// ---------------------------------------------------------------------------
// Manuscript — book-level container
// ---------------------------------------------------------------------------

/**
 * Canonical book/manuscript shape.
 *
 * Field-by-field provenance:
 *
 *   id              — NEW (Phase 1; derive from filename if unset)
 *   type            — JSON file: "book" string literal
 *   title           — JSON, sources 4, 1
 *   author          — JSON, source 4
 *   chapters        — JSON.content.chapters; source 4 BookData.content.chapters
 *   parts           — NEW (future structural grouping; undefined for
 *                     Elemental Alchemy)
 *   preface         — JSON.content.preface; source 4
 *   introduction    — JSON.content.introduction; source 4
 *   appendix        — JSON.content.appendix; source 4
 *   source          — JSON.source ("elemental_alchemy_book")
 *   processed_at    — JSON.processed_at (ISO timestamp)
 *   integration_notes — JSON.integration_notes
 *   metadata        — JSON.metadata (extension hatch)
 *   styleBibleId    — NEW Phase 2 binding to data/illustrations/
 *                     elemental-alchemy-style-bible.md (or successor).
 *                     Undefined in Phase 1.
 *
 * NOTE on shape: the founder-knowledge JSON wraps chapters under
 * `content.chapters`. The canonical Manuscript surfaces them at the
 * top level (`Manuscript.chapters`). The Step 1b adapter
 * (lib/manuscript/adapters.ts — NOT in this file) lifts content.*
 * up. See `ElementalAlchemyJsonShape` below for the exact JSON shape.
 */
export interface Manuscript {
  id?: string;
  type?: 'book';

  title: string;
  author: string;

  // --- Structural body — choose one form ---
  chapters?: Chapter[];
  parts?: Part[];

  // --- Front/back matter ---
  preface?: string;
  introduction?: string;
  appendix?: string;

  // --- Provenance ---
  source?: string;
  processed_at?: string;
  integration_notes?: string;
  metadata?: Record<string, unknown>;

  // --- Style binding (Phase 2 target) ---
  styleBibleId?: string;
}

// ---------------------------------------------------------------------------
// ElementalAlchemyJsonShape — the on-disk JSON contract
// ---------------------------------------------------------------------------

/**
 * Exact shape of:
 *   app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json
 *
 * This is the input to the Step 1b adapter
 * (lib/manuscript/adapters.ts) which produces a `Manuscript`. Defined
 * here so the adapter has a typed source rather than `unknown`.
 *
 * TODO(phase-1, step-1b): the three sibling files
 *   - elemental-alchemy-full.json
 *   - elemental-alchemy-processed.json
 *   - elemental-alchemy-summary.json
 * are likely shape-compatible variants but were not inspected at
 * Step 0. Confirm before writing the adapter.
 */
export interface ElementalAlchemyJsonShape {
  type: string;
  title: string;
  author: string;
  source: string;
  processed_at: string;
  content: {
    chapters: Chapter[];
    preface?: string;
    introduction?: string;
    appendix?: string;
  };
  integration_notes?: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Search-result wrapper — for app/book/ask/page.tsx in Phase 2
// ---------------------------------------------------------------------------

/**
 * Wrapper used by search/lookup surfaces (e.g. app/book/ask/page.tsx)
 * to attach search-time metadata to a Chapter without polluting the
 * Chapter shape itself.
 *
 * Not consumed yet. Provided here so the Phase 2 collapse of
 * source 6 has a clean target.
 */
export interface ChapterSearchResult {
  chapter: Chapter;
  relevance: number;
  matchedThemes?: string[];
}
