import Link from 'next/link';

/** Authenticated Reflect orientation view: no client/practitioner/store access. */
export function ReflectArrivalView() {
  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#292d32]">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-16">
        <header className="flex items-center justify-between gap-6 border-b border-stone-300/70 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-stone-600">Soullab · Pro Studio</p>
            <p className="mt-1 text-2xl font-light tracking-tight">Reflect</p>
          </div>
          <Link href="/home" className="text-sm text-stone-700 underline underline-offset-4 hover:text-stone-950">
            Return to Soullab
          </Link>
        </header>

        <section aria-labelledby="reflect-arrival-title" className="py-16 md:py-24">
          <p className="mb-5 text-sm font-medium text-stone-600">Your developmental space</p>
          <h1 id="reflect-arrival-title" className="max-w-3xl text-4xl font-light leading-tight tracking-tight md:text-6xl">
            Your work begins with you.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-stone-700 md:text-xl">
            Before there are clients, sessions, or a practice to manage, there is
            your own unfolding understanding. Reflect begins there: with what you
            are learning, questioning, and becoming in the work you do.
          </p>
          <div className="mt-12 rounded-2xl border border-stone-300 bg-[#fffdf8] p-7 shadow-sm md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-500">Begin with a conversation</p>
            <h2 className="mt-4 text-2xl font-normal tracking-tight">What is your work asking of you now?</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-stone-700">
              You can bring this question to MAIA, or begin wherever you wish.
              You decide what matters and which meanings, if any, to carry forward.
            </p>
            <Link
              href="/maia/encounter"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#263e3a] px-7 py-3 text-base font-medium text-white transition-colors hover:bg-[#1b302d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#263e3a]"
            >
              Begin reflecting with MAIA
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-500">
              This opens the existing MAIA member conversation. A dedicated paid
              Reflect workspace and its membership permissions are not yet activated.
            </p>
          </div>
        </section>

        <footer className="border-t border-stone-300/70 pt-6 text-sm leading-relaxed text-stone-600">
          Reflect is distinct from practice management and collective collaboration.
          There is no need to add a client, open a case record, or create a team to begin.
        </footer>
      </div>
    </main>
  );
}
