/**
 * Manuscript → HTML renderer (Soullab Press v1)
 *
 * Pure function: takes a Chapter (or Manuscript) and the design-system
 * CSS, returns a complete standalone HTML document ready for Paged.js.
 *
 * Block dispatch follows the Block discriminated union from
 * lib/manuscript/types.ts. Two semantic promotions happen at render
 * time (NOT in the adapter):
 *
 *   1. The first `quote` block in a chapter is rendered as
 *      `<blockquote class="epigraph">`. This matches the design
 *      system's epigraph treatment without polluting the data model.
 *
 *   2. `text` blocks whose content is fully wrapped in `*…*` and
 *      contains no em-dash attribution are rendered as
 *      `<p class="ritual-line">`. This handles the prayer-block
 *      treatment for Chapter 1 of Elemental Alchemy without forcing
 *      an upstream parser change.
 *
 * Both promotions are reversible — the adapter still produces clean
 * `quote` and `text` blocks; only the rendering interprets them.
 *
 * Phase 1 scope: Chapter 1 only. The renderer accepts any chapter,
 * but the design system is not yet calibrated for elemental
 * (Fire/Water/Earth/Air) variants.
 */

import type { Block, Chapter } from '../types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RenderChapterOptions {
  /** Inline CSS — typically the contents of print.css. */
  css: string;
  /** Used in the HTML <title> tag. */
  bookTitle: string;
  /** Used as a metadata hint, not currently rendered to the page. */
  author: string;
  /**
   * Optional override for the document language attribute. Defaults to 'en'.
   */
  lang?: string;
}

/**
 * Render a single chapter as a complete HTML document.
 * Pure. Deterministic for a given (chapter, css, options) input.
 */
export function renderChapterDocument(
  chapter: Chapter,
  options: RenderChapterOptions,
): string {
  const lang = options.lang ?? 'en';
  const docTitle = `${options.bookTitle} — ${stripChapterPrefix(chapter.title, chapter.number)}`;
  const body = renderChapterBody(chapter);

  return [
    '<!DOCTYPE html>',
    `<html lang="${escapeAttr(lang)}">`,
    '<head>',
    '  <meta charset="utf-8">',
    `  <meta name="author" content="${escapeAttr(options.author)}">`,
    `  <title>${escapeHtml(docTitle)}</title>`,
    `  <style>${options.css}</style>`,
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

/**
 * Render just the chapter body (without the surrounding HTML envelope).
 * Useful when composing a multi-chapter document later.
 */
export function renderChapterBody(chapter: Chapter): string {
  const blocks = chapter.blocks ?? [];
  const elementAttr = chapter.element ?? 'foundation';
  const titleClean = stripChapterPrefix(chapter.title, chapter.number);

  // Pre-classify the LAST ritual-text block in each consecutive run as
  // a 'seal' — that line gets right-aligned, non-italic treatment.
  const ritualClassification = classifyRitualBlocks(blocks);

  let firstQuotePromoted = false;
  const out: string[] = [];

  out.push(`<article class="chapter chapter-opener" data-element="${escapeAttr(elementAttr)}">`);
  out.push('  <header class="chapter-header">');
  out.push(`    <p class="chapter-number">Chapter ${chapter.number}</p>`);
  out.push(`    <h1 class="chapter-title">${escapeHtml(titleClean)}</h1>`);
  out.push('  </header>');

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'quote' && !firstQuotePromoted) {
      firstQuotePromoted = true;
      out.push(renderEpigraph(b));
      continue;
    }
    const hint = ritualClassification.get(i);
    const rendered = renderBlock(b, hint);
    if (rendered.length > 0) {
      out.push(rendered);
    }
  }

  out.push('</article>');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Ritual-block classification
// ---------------------------------------------------------------------------

/** A text block that matches the italic-no-em-dash pattern (the prayer block). */
function isRitualText(content: string): boolean {
  const t = content.trim();
  return (
    t.startsWith('*') &&
    t.endsWith('*') &&
    t.length >= 4 &&
    !/[\u2013\u2014]/.test(t)
  );
}

/**
 * Returns a map from block index → 'seal' for the final ritual-text
 * block in each consecutive run. The closing line of a prayer is the
 * one whose next sibling is NOT another ritual-text — including the
 * case where it is the last block in the chapter.
 */
function classifyRitualBlocks(blocks: readonly Block[]): Map<number, 'seal'> {
  const result = new Map<number, 'seal'>();
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type !== 'text') continue;
    if (!isRitualText(b.content)) continue;
    const next = blocks[i + 1];
    const nextIsRitual =
      next !== undefined && next.type === 'text' && isRitualText(next.content);
    if (!nextIsRitual) {
      result.set(i, 'seal');
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------

function renderBlock(b: Block, hint?: 'seal'): string {
  switch (b.type) {
    case 'text':
      return renderTextBlock(b.content, hint);
    case 'heading':
      return `<h${b.level}>${escapeHtml(b.content)}</h${b.level}>`;
    case 'image':
      return renderImage(b.assetId, b.caption);
    case 'image-placeholder':
      return renderImagePlaceholder(b.ref, b.caption);
    case 'diagram':
      return [
        '<figure class="diagram">',
        `  <img src="${escapeAttr(b.assetId)}" alt="" />`,
        b.caption !== undefined ? `  <figcaption>${escapeHtml(b.caption)}</figcaption>` : '',
        '</figure>',
      ]
        .filter(Boolean)
        .join('\n');
    case 'practice':
      return `<aside class="practice">${escapeHtml(b.content)}</aside>`;
    case 'quote':
      return [
        '<blockquote>',
        `  <p>${escapeHtml(b.content)}</p>`,
        b.attribution !== undefined ? `  <cite>${escapeHtml(b.attribution)}</cite>` : '',
        '</blockquote>',
      ]
        .filter(Boolean)
        .join('\n');
    case 'pullquote':
      return `<aside class="pullquote">${escapeHtml(b.content)}</aside>`;
    case 'callout':
      return `<aside class="callout callout-${escapeAttr(b.kind)}">${escapeHtml(b.content)}</aside>`;
  }
}

function renderTextBlock(raw: string, hint?: 'seal'): string {
  const t = raw.trim();
  if (t.length === 0) return '';

  // Markdown heading marker (e.g. "#### Title") → section title
  const headingMatch = t.match(/^#{2,4}\s*(.*)$/);
  if (headingMatch !== null) {
    const inner = headingMatch[1].trim();
    if (inner.length === 0) return '';
    return `<h2 class="section-title">${escapeHtml(inner)}</h2>`;
  }

  // Italic-wrapped paragraph without em-dash → ritual line.
  // The pre-classifier marks the last line of a consecutive run as
  // the 'seal' so it can be styled as a closing gesture (right-aligned,
  // non-italic) without adding a new Block variant upstream.
  if (isRitualText(t)) {
    const inner = t.slice(1, -1).trim();
    if (inner.length === 0) return '';
    const classes = hint === 'seal' ? 'ritual-line ritual-seal' : 'ritual-line';
    return `<p class="${classes}">${escapeHtml(inner)}</p>`;
  }

  return `<p>${escapeHtml(t)}</p>`;
}

function renderEpigraph(b: Extract<Block, { type: 'quote' }>): string {
  return [
    '<blockquote class="epigraph">',
    `  <p>${escapeHtml(b.content)}</p>`,
    b.attribution !== undefined ? `  <cite>${escapeHtml(b.attribution)}</cite>` : '',
    '</blockquote>',
  ]
    .filter(Boolean)
    .join('\n');
}

function renderImage(assetId: string, caption: string | undefined): string {
  return [
    '<figure class="image chapter-image">',
    `  <img src="${escapeAttr(assetId)}" alt="" />`,
    caption !== undefined ? `  <figcaption>${escapeHtml(caption)}</figcaption>` : '',
    '</figure>',
  ]
    .filter(Boolean)
    .join('\n');
}

function renderImagePlaceholder(ref: string, caption: string | undefined): string {
  return [
    '<figure class="image chapter-image">',
    `  <div class="image-placeholder" data-ref="${escapeAttr(ref)}">[image: ${escapeHtml(ref)}]</div>`,
    caption !== undefined ? `  <figcaption>${escapeHtml(caption)}</figcaption>` : '',
    '</figure>',
  ]
    .filter(Boolean)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripChapterPrefix(title: string, n: number): string {
  return title.replace(new RegExp(`^Chapter\\s+${n}\\s*[:\\-]\\s*`, 'i'), '').trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
