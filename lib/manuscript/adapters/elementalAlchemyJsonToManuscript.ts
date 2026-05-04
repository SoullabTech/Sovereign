/**
 * Adapter — ElementalAlchemyJsonShape → Manuscript
 *
 * Phase 1, Step 1. Pure, idempotent, no I/O. Lifts the on-disk
 * founder-knowledge JSON shape into the canonical Manuscript model.
 *
 * Source-of-truth file (not loaded here — the caller passes parsed JSON):
 *   app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json
 *
 * Constraints honored:
 *   - lib/manuscript/types.ts is the only types source
 *   - no migrations, no renderer, no Paged.js
 *   - no modification of existing runtime pages
 *
 * Conservative inference rules (per Step 1 brief):
 *   - Default block: `text`
 *   - `quote`: ONLY when a paragraph is fully wrapped in *...* AND
 *     ends with em-dash attribution (Paulo Coelho-style epigraph)
 *   - `image-placeholder`: ONLY for keyTeachings entries matching
 *     the markdown reference pattern  ![][imageN]
 *   - `practice`: NOT inferred in Phase 1 — current JSON has no
 *     reliably structured practice marker. Deferred until a richer
 *     source (full markdown + section parsing) lands.
 *
 * Known shape note (current elemental-alchemy-book.json):
 *   - Each chapter has exactly: number, title, element, keyTeachings,
 *     content_excerpt. There is no fullContent or sections field on
 *     this JSON variant.
 *   - content.preface is an OBJECT (with chapters, coreTeachings,
 *     dedication, elementalWisdom, practicalApplications), NOT a
 *     string. We type-guard the lift so only string-shaped front
 *     matter is promoted to Manuscript.preface / .introduction /
 *     .appendix. Object-shaped preface is preserved on metadata.
 *
 * TODO(phase-1, step-1c): inspect the three sibling files
 *   - elemental-alchemy-full.json
 *   - elemental-alchemy-processed.json
 *   - elemental-alchemy-summary.json
 * before the renderer ships, so we know whether they need
 * dedicated adapters or can flow through this one.
 */

import type {
  Block,
  Chapter,
  ElementalAlchemyJsonShape,
  Manuscript,
} from '../types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function elementalAlchemyJsonToManuscript(
  input: ElementalAlchemyJsonShape,
): Manuscript {
  const chapters: Chapter[] = (input.content?.chapters ?? []).map(jsonChapterToCanonical);

  const ms: Manuscript = {
    type: 'book',
    title: input.title,
    author: input.author,
    chapters,
    source: input.source,
    processed_at: input.processed_at,
    integration_notes: input.integration_notes,
    metadata: liftMetadata(input),
  };

  // Front/back matter: only lift when string-shaped.
  // Object-shaped front matter (current EA preface) is left on
  // metadata.front_matter so it's not lost.
  if (typeof input.content?.preface === 'string') {
    ms.preface = input.content.preface;
  }
  if (typeof input.content?.introduction === 'string') {
    ms.introduction = input.content.introduction;
  }
  if (typeof input.content?.appendix === 'string') {
    ms.appendix = input.content.appendix;
  }

  return ms;
}

// ---------------------------------------------------------------------------
// Per-chapter mapping
// ---------------------------------------------------------------------------

function jsonChapterToCanonical(raw: Chapter): Chapter {
  return {
    ...raw,
    blocks: chapterContentToBlocks(raw),
  };
}

function chapterContentToBlocks(raw: Chapter): Block[] {
  const blocks: Block[] = [];

  // 1. Image placeholders extracted from keyTeachings
  const keyTeachings = Array.isArray(raw.keyTeachings) ? raw.keyTeachings : [];
  for (const t of keyTeachings) {
    const ref = parseImageMarker(t);
    if (ref !== null) {
      blocks.push({ type: 'image-placeholder', ref });
    }
  }

  // 2. Content blocks from the first available content field.
  //    Current JSON only has content_excerpt; fullContent / content are
  //    handled for forward compatibility with parser-produced shapes.
  const sourceText =
    raw.fullContent ??
    raw.content ??
    raw.content_excerpt ??
    '';

  if (sourceText.trim().length > 0) {
    for (const para of splitParagraphs(sourceText)) {
      const quote = tryParseQuote(para);
      if (quote !== null) {
        blocks.push({
          type: 'quote',
          content: quote.content,
          attribution: quote.attribution,
        });
        continue;
      }
      blocks.push({ type: 'text', content: para });
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Helpers (pure, exported for the smoke test)
// ---------------------------------------------------------------------------

const IMAGE_MARKER_RE = /^!\[\s*\]\[(image\d+)\]$/;

export function parseImageMarker(s: string): string | null {
  const m = s.trim().match(IMAGE_MARKER_RE);
  return m !== null ? m[1] : null;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function tryParseQuote(
  p: string,
): { content: string; attribution: string } | null {
  // Must be wrapped in * ... *  (single-line or multi-line italic block)
  const italic = p.match(/^\*([\s\S]+?)\*$/);
  if (italic === null) return null;
  const inner = italic[1].trim();

  // Must end with em-dash / en-dash / hyphen attribution.
  // Use a lazy first group + non-empty attribution to avoid
  // matching ordinary italic prose that happens to contain a dash.
  const attrMatch = inner.match(/^([\s\S]+?)\s+[\u2013\u2014\-]\s+(.+?)\s*$/);
  if (attrMatch === null) return null;

  const content = stripWrappingQuotes(attrMatch[1]).trim();
  const attribution = attrMatch[2].trim();
  if (content.length === 0 || attribution.length === 0) return null;

  return { content, attribution };
}

function stripWrappingQuotes(s: string): string {
  // Strip a single layer of straight or curly quotes from each end.
  return s
    .trim()
    .replace(/^["\u201C\u201D\u2018\u2019]+/, '')
    .replace(/["\u201C\u201D\u2018\u2019]+$/, '');
}

// ---------------------------------------------------------------------------
// Metadata lift
// ---------------------------------------------------------------------------

function liftMetadata(input: ElementalAlchemyJsonShape): Record<string, unknown> {
  const meta: Record<string, unknown> = { ...(input.metadata ?? {}) };

  // Preserve object-shaped front matter on metadata.front_matter so
  // it survives the lift (the canonical Manuscript only carries
  // string-shaped preface/introduction/appendix at the top level).
  const frontMatter: Record<string, unknown> = {};
  if (input.content?.preface !== undefined && typeof input.content.preface !== 'string') {
    frontMatter.preface = input.content.preface;
  }
  if (input.content?.introduction !== undefined && typeof input.content.introduction !== 'string') {
    frontMatter.introduction = input.content.introduction;
  }
  if (input.content?.appendix !== undefined && typeof input.content.appendix !== 'string') {
    frontMatter.appendix = input.content.appendix;
  }
  if (Object.keys(frontMatter).length > 0) {
    meta.front_matter = frontMatter;
  }

  return meta;
}
