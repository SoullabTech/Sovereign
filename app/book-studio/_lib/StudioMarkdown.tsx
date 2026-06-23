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
  data?: { hProperties?: { className?: string } };
  children?: MdastNode[];
};

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
        remarkPlugins={[remarkGfm, remarkChapterEpigraph]}
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
