import Link from 'next/link';
import type { LearnAndTryGroup } from '@/lib/proStudio/learnAndTry';

/**
 * Pro Studio introduction (HOUSE-ENTRANCE-01, Stage 1).
 *
 * A threshold, not a funnel: it explains, and offers the one thing that is real
 * today — a conversation with MAIA. No form, no enrollment, no price, no tier,
 * no claim about anything not yet built.
 */
export function LearnAndTryView({ signedIn, groups }: { signedIn: boolean; groups: LearnAndTryGroup[] }) {
  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#292d32]">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-16">
        <header className="flex items-center justify-between gap-6 border-b border-stone-300/70 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-stone-600">Soullab · Pro Studio</p>
            <p className="mt-1 text-2xl font-light tracking-tight">An introduction</p>
          </div>
          <Link href="/home" className="text-sm text-stone-700 underline underline-offset-4 hover:text-stone-950">
            Return to Soullab
          </Link>
        </header>

        <section aria-labelledby="pro-studio-intro-title" className="py-14 md:py-20">
          <h1 id="pro-studio-intro-title" className="max-w-3xl text-4xl font-light leading-tight tracking-tight md:text-5xl">
            A workspace for the work you do with others.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-stone-700">
            Pro Studio is where a practitioner holds their people, their sessions, and the
            continuity of their work. This page is an introduction. You can look around and
            talk with MAIA about your practice. Nothing here signs you up for anything.
          </p>
          <p className="mt-5 max-w-2xl leading-relaxed text-stone-700">
            Your own space with MAIA is separate and is yours whether or not you ever use Pro
            Studio. Neither needs the other.
          </p>
        </section>

        <section aria-labelledby="pro-studio-holds-title" className="border-t border-stone-300/70 py-12">
          <h2 id="pro-studio-holds-title" className="text-2xl font-light tracking-tight">What the full studio holds</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            These belong to the full studio. They are not open from this page.
          </p>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-500">{group.title}</h3>
                <ul className="mt-3 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <span className="font-medium">{item.label}</span>
                      <span className="text-stone-600"> — {item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="pro-studio-today-title" className="border-t border-stone-300/70 py-12">
          <h2 id="pro-studio-today-title" className="text-2xl font-light tracking-tight">What you can do today</h2>
          <div className="mt-6 rounded-2xl border border-stone-300 bg-[#fffdf8] p-7 shadow-sm md:p-10">
            <h3 className="text-xl font-normal tracking-tight">Talk with MAIA about your practice</h3>
            <p className="mt-4 max-w-xl leading-relaxed text-stone-700">
              Bring what you are working with, or what you are wondering about. You decide
              what matters and what, if anything, to carry forward.
            </p>
            {signedIn ? (
              <Link
                href="/maia/encounter"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#263e3a] px-7 py-3 text-base font-medium text-white transition-colors hover:bg-[#1b302d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#263e3a]"
              >
                Talk with MAIA about your practice
              </Link>
            ) : (
              <Link
                href="/signin?next=%2Fpro-studio"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#263e3a] px-7 py-3 text-base font-medium text-white transition-colors hover:bg-[#1b302d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#263e3a]"
              >
                Sign in to talk with MAIA
              </Link>
            )}
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-500">
              This opens the existing MAIA conversation. It does not create a practitioner
              profile or send anything to a professional workspace.
            </p>
          </div>
        </section>

        <footer className="border-t border-stone-300/70 pt-6 text-sm leading-relaxed text-stone-600">
          <p>How access to the full studio works, and what it includes, has not been set yet.</p>
          {signedIn && (
            <p className="mt-3">
              Already have a Pro Studio?{' '}
              <Link href="/studio" className="underline underline-offset-4 hover:text-stone-950">Open it</Link>.
            </p>
          )}
        </footer>
      </div>
    </main>
  );
}
