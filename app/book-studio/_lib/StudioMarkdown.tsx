/**
 * Studio Markdown renderer — server component.
 *
 * Reads a markdown file from `docs/book-studio/` and renders it with
 * the studio's typographic register (warm charcoal, Crimson body,
 * Playfair display).
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

  return (
    <article className="studio-prose mx-auto max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
