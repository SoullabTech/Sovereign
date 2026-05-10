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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
