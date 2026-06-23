import type { ReactNode } from 'react';

/**
 * The reading environment — a dedicated room for the book, deliberately *outside*
 * the Book Studio's editorial chrome. No nav, no masthead, no "Read Flow" label,
 * no workshop language. In the reading room, the software does not speak before
 * the book.
 *
 * Hospitality Lab — first construction. This route changes exactly two things
 * versus `/book-studio/read`: the editorial chrome is gone, and the publisher
 * front matter is lifted out of the reading stream (see the page's
 * `startAtHeading`). Everything else — renderer, typography, measure, cover — is
 * held constant, so that a reader's report is attributable to those two changes
 * and not to a dozen confounds. The room is built to be a clean first case.
 */
export const metadata = {
  title: 'Elemental Alchemy',
};

export default function ReadLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0f0d0b] text-amber-50/90">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">{children}</main>
    </div>
  );
}
