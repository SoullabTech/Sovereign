import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Book Studio shared chrome.
 *
 * The Studio is an editorial workspace, not a marketing surface.
 * Soul Mirror does NOT belong here — it lives at /maia/soul-mirror
 * as a reader companion, separate doorway.
 */

// Founder-gated editorial workspace. Share preview stays deliberately generic
// (no manuscript titles / editorial content); the protected card image comes
// from the colocated opengraph-image.tsx.
export const metadata = {
  title: 'Soullab Press — Private Workspace',
  description: 'This protected editorial workspace is available only to authorized participants.',
  openGraph: {
    title: 'Soullab Press — Private Workspace',
    description: 'This protected editorial workspace is available only to authorized participants.',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Soullab Press — Private Workspace',
    description: 'This protected editorial workspace is available only to authorized participants.',
  },
};

const NAV = [
  { href: '/book-studio/read', label: 'Read Flow' },
  { href: '/book-studio/passages', label: 'Passage Blocks' },
  { href: '/book-studio/illustrations', label: 'Illustration List' },
  { href: '/book-studio/design-system', label: 'Design System' },
  { href: '/book-studio/render', label: 'Render Print PDF' },
  { href: '/book-studio/workbench', label: 'Workbench' },
];

export default function BookStudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0f0d0b] text-amber-50/90">
      <header className="border-b border-amber-200/10">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Link
            href="/book-studio"
            className="text-amber-100/85 text-base tracking-wide font-light hover:text-amber-100 transition-colors"
          >
            The Book Studio
            <span className="text-amber-200/35 text-[10px] tracking-[0.25em] uppercase ml-3">
              Soullab Press
            </span>
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-amber-200/55">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-amber-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
