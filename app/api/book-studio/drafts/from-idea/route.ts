/**
 * POST /api/book-studio/drafts/from-idea
 *
 * Bridge from MAIA Ideas to Book Studio drafts.
 *
 *   MAIA Ideas = quick capture + live thinking
 *   Book Studio = intentional writing + editorial form
 *
 * Move only when "this wants form."
 *
 * Writes a markdown draft into docs/book-studio/drafts/<slug>.md and
 * returns the studio URL. Drafts surface on /book-studio under the
 * "Drafts from MAIA Ideas" section.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    const { ideaId, title, content } = await req.json();

    if (!ideaId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing ideaId, title, or content' },
        { status: 400 },
      );
    }

    const draftsDir = path.join(process.cwd(), 'docs', 'book-studio', 'drafts');
    await fs.mkdir(draftsDir, { recursive: true });

    const date = new Date().toISOString();
    const slug = `${slugify(title)}-${ideaId}`;

    const markdown = `# Draft — ${title}

Source: MAIA Ideas
Idea ID: ${ideaId}
Created: ${date}

---

${content}
`;

    const filePath = path.join(draftsDir, `${slug}.md`);
    await fs.writeFile(filePath, markdown, 'utf8');

    return NextResponse.json({
      ok: true,
      draftSlug: slug,
      studioUrl: `/book-studio/drafts/${slug}`,
    });
  } catch (error) {
    console.error('[BookStudioDraftFromIdea]', error);
    return NextResponse.json(
      { error: 'Failed to create Studio draft' },
      { status: 500 },
    );
  }
}
