import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Studio draft page — renders a single imported draft from
 * docs/book-studio/drafts/<slug>.md.
 *
 * Uses react-markdown (already in deps) instead of marked.
 */

export default async function StudioDraftPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(
    process.cwd(),
    'docs',
    'book-studio',
    'drafts',
    `${slug}.md`,
  );

  let markdown: string;
  try {
    markdown = await fs.readFile(filePath, 'utf-8');
  } catch {
    notFound();
  }

  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          Drafts from MAIA Ideas
        </p>
      </header>
      <article className="studio-prose mx-auto max-w-3xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </div>
  );
}
