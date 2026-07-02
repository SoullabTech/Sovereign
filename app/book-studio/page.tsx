import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

/**
 * Book Studio index — editorial workspace.
 *
 * Surfaces the existing Studio artifacts (manuscript, passages,
 * illustration list, design system, render output) and any drafts
 * imported from MAIA Ideas.
 *
 * NOT a marketing page. NOT a Soul Mirror doorway.
 */

interface RoomLink {
  href: string;
  label: string;
  description: string;
}

const ROOMS: RoomLink[] = [
  {
    href: '/book-studio/ready-to-write',
    label: 'Ready to Write',
    description: 'Your own kept, marked, and named material — what your Living Field offers to writing.',
  },
  {
    href: '/book-studio/read',
    label: 'Read Flow',
    description: 'Elemental Alchemy — continuous prose, sealed source.',
  },
  {
    href: '/book-studio/passages',
    label: 'Passage Blocks',
    description: '34 self-contained doorways with felt-state tags.',
  },
  {
    href: '/book-studio/illustrations',
    label: 'Illustration List',
    description: 'Structural longlist with anchors, role, tone-notes.',
  },
  {
    href: '/book-studio/design-system',
    label: 'Design System',
    description: 'Typography, page rhythm, principles — Soullab Press v1.',
  },
  {
    href: '/book-studio/render',
    label: 'Render Print PDF',
    description: 'Trigger the print pipeline; review output.',
  },
  {
    href: '/book-studio/canvas',
    label: 'Canvas (Layout)',
    description: 'Visual page-by-page layout — Atticus-alternative rebuild, Phase A0.',
  },
  {
    href: '/book-studio/workbench',
    label: 'Workbench',
    description: 'Arrangement surface between captures and form — Slice 1.',
  },
];

async function listDrafts(): Promise<{ slug: string; title: string }[]> {
  const draftsDir = path.join(process.cwd(), 'docs', 'book-studio', 'drafts');
  try {
    const files = await fs.readdir(draftsDir);
    const drafts = await Promise.all(
      files
        .filter((f) => f.endsWith('.md'))
        .map(async (f) => {
          const slug = f.replace(/\.md$/, '');
          const content = await fs.readFile(path.join(draftsDir, f), 'utf-8');
          const titleMatch = content.match(/^#\s+Draft\s+—\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1].trim() : slug;
          return { slug, title };
        }),
    );
    return drafts;
  } catch {
    return [];
  }
}

export default async function BookStudioIndex() {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/book-studio');
    }
    return <FounderGateScreen />;
  }

  const drafts = await listDrafts();

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-amber-100/90 text-3xl md:text-4xl font-light tracking-wide leading-tight mb-2">
          The Book Studio
        </h1>
        <p className="text-amber-200/55 text-base font-light italic">
          Editorial workspace for Elemental Alchemy.
        </p>
      </header>

      {/* Rooms */}
      <section className="mb-16">
        <h2 className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-5">
          Workspace
        </h2>
        <ul className="space-y-1">
          {ROOMS.map((room) => (
            <li key={room.href}>
              <Link
                href={room.href}
                className="block py-3 px-4 -mx-4 rounded-md transition-colors hover:bg-amber-300/5 group"
              >
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-6">
                  <span className="text-amber-100/85 group-hover:text-amber-100 text-base md:text-[1.05rem] font-light min-w-[12rem]">
                    {room.label}
                  </span>
                  <span className="text-amber-200/45 text-sm font-light italic">
                    {room.description}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Drafts from MAIA Ideas */}
      <section>
        <h2 className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-5">
          Drafts from MAIA Ideas
        </h2>
        {drafts.length === 0 ? (
          <p className="text-amber-200/35 text-sm font-light italic">
            No drafts yet. Move an idea here when it wants form.
          </p>
        ) : (
          <ul className="space-y-1">
            {drafts.map((draft) => (
              <li key={draft.slug}>
                <Link
                  href={`/book-studio/drafts/${draft.slug}`}
                  className="block py-2 px-4 -mx-4 rounded-md transition-colors hover:bg-amber-300/5 text-amber-100/80 hover:text-amber-100 text-base font-light"
                >
                  {draft.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
