/**
 * Studio Markdown renderer — server component.
 *
 * Reads a markdown file from `docs/book-studio/` and renders it with
 * the studio's typographic register (warm charcoal, Crimson body,
 * Playfair display).
 *
 * Canonical plate injection
 * -------------------------
 * Mirrors the print pipeline's `canonical-plates.lua` filter: reads
 * `lib/manuscript/render/canonical-plates.config.json` and inserts a
 * markdown image reference (`![alt](path)`) immediately before any
 * heading whose text starts with a configured `beforeHeading` prefix.
 *
 * Single source of truth: the config file. Print and screen render
 * the same plates at the same thresholds without duplicating the
 * decision in two places, and without polluting the manuscript with
 * inline image markdown that would re-introduce the print double-
 * plate problem (PR #311 / #312).
 *
 * The .dockerignore allowance for docs/book-studio/ ensures these
 * files exist in the production container at runtime.
 */

import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface StudioMarkdownProps {
  /** Path relative to `docs/book-studio/` (e.g. `PASSAGE_BLOCKS_INDEX.md`) */
  file: string;
}

/**
 * Tag blockquotes that sit immediately after a top-level `#` heading as
 * chapter / part epigraphs per canon §2.5 — and preserve their line breaks.
 *
 * Without this, the Read Flow renders the Chapter 1 invocation (and any
 * future chapter epigraph) as a generic body blockquote: italic, indented,
 * with the analytical amber left border. That register is wrong for an
 * epigraph — the bond between heading and epigraph is ceremonial, not
 * analytical. The reader should land in dedicated breath, not a sidebar.
 *
 * Detection is structural and minimal:
 *   1. Walk the top-level children of the mdast root.
 *   2. For each `blockquote`, check the immediately preceding sibling.
 *   3. If it's a `# heading`, tag the blockquote with
 *      `data.hProperties.className = 'studio-epigraph'`. CSS then strips
 *      the analytical treatment and gives ceremonial breath.
 *   4. Within the tagged blockquote, split intra-paragraph text on `\n`
 *      and insert `break` nodes so the author's line shape survives
 *      (CommonMark normally collapses soft breaks to whitespace).
 *
 * The canvas Page Proof makes a blockquote-after-heading an epigraph by
 * page placement; the Read Flow makes it an epigraph by recognition and
 * visual register. Same canon, two surfaces.
 */
type MdastNode = {
  type: string;
  depth?: number;
  value?: string;
  url?: string;
  data?: { hProperties?: { className?: string; id?: string } };
  children?: MdastNode[];
};

function extractText(node: MdastNode): string {
  if (typeof node.value === 'string') return node.value;
  if (!node.children) return '';
  return node.children.map(extractText).join('');
}

/**
 * Slugify a heading's text for use as an anchor `id`. Strips Markdown
 * punctuation and HTML entities, lowercases, replaces whitespace with
 * dashes. Stable across the manuscript so the TOC can link to it
 * deterministically without storing a mapping anywhere else.
 *
 *   "Chapter 1: The Journey Begins"            → "chapter-1-the-journey-begins"
 *   "Conclusion — Embracing Your Elemental..."  → "conclusion-embracing-your-elemental-soul"
 *   "Preface"                                   → "preface"
 */
function slugify(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .toLowerCase()
    .replace(/[ ]/g, ' ')
    .replace(/[—–]/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalize(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .toLowerCase()
    .replace(/[:—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolve a TOC entry's text to a heading slug. Tries exact-normalize match
 * first; if that fails AND the entry starts with `Chapter N`, matches by
 * chapter-number prefix (TOC says "Chapter 1 The Journey Begins" but the
 * heading is "Chapter 1: The Journey Begins" — same target, different
 * punctuation). Last resort: prefix match in either direction so
 * "Conclusion — Embracing Your Elemental Soul" in TOC resolves to the
 * `# Conclusion — Embracing Your Elemental Soul` heading.
 */
function findHeadingSlug(text: string, headingMap: Map<string, string>): string | null {
  const norm = normalize(text);
  if (!norm) return null;

  if (headingMap.has(norm)) return headingMap.get(norm)!;

  const chapterMatch = norm.match(/^chapter\s+(\d+|[ivxlcdm]+)\b/);
  if (chapterMatch) {
    const prefix = `chapter ${chapterMatch[1]}`;
    for (const [key, slug] of headingMap) {
      if (key === prefix || key.startsWith(prefix + ' ')) return slug;
    }
  }

  for (const [key, slug] of headingMap) {
    if (key.length < 4) continue;
    if (key.startsWith(norm) || norm.startsWith(key)) return slug;
  }

  return null;
}

/**
 * Build anchor IDs on every heading and wrap each Contents-section entry
 * in a markdown link to its corresponding heading anchor. Two passes:
 *
 *   Pass 1: walk top-level children, slugify each heading's text, set
 *           `data.hProperties.id` so the rendered HTML carries `id="…"`.
 *           Build `headingMap` of normalized-text → slug for lookup.
 *
 *   Pass 2: find the `# Contents` heading. For every paragraph and
 *           sub-heading between it and the next depth-1 heading, attempt
 *           to resolve the entry's text to a slug via `findHeadingSlug`.
 *           If found, wrap the node's existing children inside a single
 *           `link` node with `url: '#' + slug`. Existing inline
 *           emphasis/strong/text structure is preserved underneath.
 *
 * The manuscript itself is not modified. Detection is structural so
 * future chapters added to the TOC are linked automatically as long as
 * they match an existing top-level heading.
 */
function remarkTocLinks() {
  return (tree: MdastNode) => {
    const kids = tree.children ?? [];
    const headingMap = new Map<string, string>();

    // Locate the TOC region so its own internal sub-headings
    // (`### Part One — The Ground`, etc.) don't pollute the headingMap or
    // claim the slug that belongs to the real `# Part One — The Ground`
    // later in the manuscript.
    let tocStart = -1;
    let tocEnd = kids.length;
    for (let i = 0; i < kids.length; i++) {
      const node = kids[i];
      if (node.type !== 'heading' || node.depth !== 1) continue;
      const text = extractText(node);
      const norm = normalize(text);
      if (tocStart === -1 && norm === 'contents') {
        tocStart = i;
      } else if (tocStart !== -1 && i > tocStart) {
        tocEnd = i;
        break;
      }
    }

    // Pass 1: set anchor IDs on depth-1 and depth-2 headings OUTSIDE the
    // TOC region, and populate the slug map for resolution. Deeper
    // sub-headings (h3+) intentionally don't get IDs — TOC entries
    // address chapters and major sections, not internal subsections,
    // and skipping them avoids duplicate slug collisions (the manuscript
    // has e.g. multiple `### Introduction` headings inside chapters).
    for (let i = 0; i < kids.length; i++) {
      if (i >= tocStart && i < tocEnd) continue;
      const node = kids[i];
      if (node.type !== 'heading') continue;
      if (node.depth !== 1 && node.depth !== 2) continue;
      const text = extractText(node);
      const slug = slugify(text);
      if (!slug) continue;
      node.data = node.data ?? {};
      node.data.hProperties = node.data.hProperties ?? {};
      if (!node.data.hProperties.id) {
        node.data.hProperties.id = slug;
      }
      const norm = normalize(text);
      if (!norm) continue;
      const existing = headingMap.get(norm);
      // depth-1 always wins over depth-2 with the same normalized text,
      // so chapters/parts/conclusion take precedence over any later h2
      // that happens to share their name.
      if (!existing || node.depth === 1) {
        headingMap.set(norm, slug);
      }
    }

    // Pass 2: walk TOC entries and wrap each one in a link to its
    // resolved heading. Entries whose text doesn't match any depth-1 or
    // depth-2 heading (e.g. "Introduction" — no top-level Introduction
    // exists) stay as plain text.
    if (tocStart === -1) return;
    for (let i = tocStart + 1; i < tocEnd; i++) {
      const node = kids[i];
      if (node.type !== 'paragraph' && node.type !== 'heading') continue;
      if (!node.children || node.children.length === 0) continue;

      const text = extractText(node);
      const trimmed = text.replace(/&nbsp;/g, ' ').trim();
      if (!trimmed) continue;

      const slug = findHeadingSlug(trimmed, headingMap);
      if (!slug) continue;

      const link: MdastNode = {
        type: 'link',
        url: '#' + slug,
        data: { hProperties: { className: 'toc-link' } },
        children: node.children,
      };
      node.children = [link];
    }
  };
}

/**
 * Recursively rewrite a node's `children` so any inline text whose value
 * contains `\n` is split into separate text nodes with `break` nodes
 * between. Walks through inline wrappers (emphasis, strong, link, etc.)
 * so a multi-line `*…*` italic block still gets its line shape rendered.
 */
function preserveLineBreaks(node: MdastNode): void {
  if (!node.children) return;
  const out: MdastNode[] = [];
  for (const child of node.children) {
    if (child.type === 'text' && typeof child.value === 'string' && child.value.includes('\n')) {
      const parts = child.value.split('\n');
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) out.push({ type: 'text', value: parts[i] });
        if (i < parts.length - 1) out.push({ type: 'break' });
      }
    } else {
      preserveLineBreaks(child);
      out.push(child);
    }
  }
  node.children = out;
}

function remarkChapterEpigraph() {
  return (tree: MdastNode) => {
    const kids = tree.children ?? [];
    for (let i = 0; i < kids.length; i++) {
      const node = kids[i];
      if (node.type !== 'blockquote') continue;
      const prev = kids[i - 1];
      if (!prev || prev.type !== 'heading' || prev.depth !== 1) continue;
      node.data = node.data ?? {};
      node.data.hProperties = node.data.hProperties ?? {};
      const existing = node.data.hProperties.className;
      node.data.hProperties.className = existing
        ? `${existing} studio-epigraph`
        : 'studio-epigraph';
      preserveLineBreaks(node);
    }
  };
}

interface PlateThreshold {
  plate: string;
  beforeHeading: string;
  alt: string;
  role: string;
}

interface PlateConfig {
  thresholds: PlateThreshold[];
}

async function loadPlateConfig(): Promise<PlateConfig | null> {
  try {
    const configPath = path.join(
      process.cwd(),
      'lib',
      'manuscript',
      'render',
      'canonical-plates.config.json',
    );
    const raw = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(raw) as PlateConfig;
  } catch {
    return null;
  }
}

function injectCanonicalPlates(markdown: string, config: PlateConfig): string {
  if (!config.thresholds || config.thresholds.length === 0) return markdown;

  const lines = markdown.split('\n');
  const out: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (headingMatch) {
      const headingText = headingMatch[1].trim();
      const matched = config.thresholds.find((t) =>
        headingText.startsWith(t.beforeHeading),
      );
      if (matched) {
        out.push(`![${matched.alt}](/book-studio/figures/${matched.plate}.png)`);
        out.push('');
      }
    }
    out.push(line);
  }

  return out.join('\n');
}

export default async function StudioMarkdown({ file }: StudioMarkdownProps) {
  const filePath = path.join(process.cwd(), 'docs', 'book-studio', file);

  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    return (
      <div className="text-amber-200/50 italic text-sm">
        Source file not found in container. Expected at:{' '}
        <code className="text-amber-300/70">docs/book-studio/{file}</code>
      </div>
    );
  }

  const plateConfig = await loadPlateConfig();
  if (plateConfig) {
    content = injectCanonicalPlates(content, plateConfig);
  }

  return (
    <article className="studio-prose mx-auto max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkChapterEpigraph, remarkTocLinks]}
        // The manuscript is shared source: the Pandoc print pipeline consumes
        // raw HTML (e.g. `<div class="toc-prose">` for print-only TOC page
        // breaks — see lib/manuscript/render/print-book.css), but the Read Flow
        // has no rehypeRaw, so react-markdown would otherwise render those tags
        // as literal escaped text. `skipHtml` drops raw HTML nodes on screen —
        // print keeps its markup, the Read Flow stays clean, and any future
        // stray tag disappears gracefully instead of leaking as visible code.
        skipHtml
        components={{
          // True epigraphs are paragraphs whose entire content is a single
          // `*"…" — Author*`. CSS `:only-child` ignores text nodes, so a
          // body paragraph ending in inline italic falsely matched the old
          // `:has(> em:only-child)` selector. Tag at the syntax-tree layer
          // where text vs. emphasis is unambiguous. react-markdown v9 passes
          // HAST nodes — children with whitespace-only text are skipped so
          // a trailing newline doesn't disqualify a true epigraph.
          p: ({ node, children, ...props }) => {
            type HastChild = { type?: string; tagName?: string; value?: string };
            const kids = ((node as { children?: HastChild[] } | undefined)?.children ?? []).filter(
              (k) => !(k.type === 'text' && (k.value ?? '').trim() === ''),
            );
            const isEpigraph =
              kids.length === 1 && kids[0]?.type === 'element' && kids[0]?.tagName === 'em';
            return (
              <p {...props} className={isEpigraph ? 'epigraph' : undefined}>
                {children}
              </p>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
