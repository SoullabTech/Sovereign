'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Activity, Compass, Fingerprint, Users, NotebookPen } from 'lucide-react';

type PatternModule = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const MODULES: PatternModule[] = [
  {
    title: 'Field Snapshot',
    description: "See what's active right now — signals, themes, and timing layers.",
    href: '/astrology',
    icon: Activity,
    badge: 'Now',
  },
  {
    title: 'Theme Focus',
    description: 'Zoom in on a single motif and work it through reflection + practice.',
    href: '/journey',
    icon: Compass,
  },
  {
    title: 'Personal Pattern Profile (optional)',
    description: "Add birth data to refine pattern resolution. Not fate — just structure.",
    href: '/astrology',
    icon: Fingerprint,
    badge: 'Optional',
  },
  {
    title: 'Relational Dynamics',
    description: 'Explore resonance, friction, and growth edges in relationship space.',
    href: '/astrology/synastry',
    icon: Users,
  },
  {
    title: 'Integration Protocols',
    description: "Translate insight into action — journaling, rituals, experiments, next steps.",
    href: '/labtools/journal',
    icon: NotebookPen,
  },
];

export default function PatternsPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Patterns</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            A lab for meaning-making across time, psyche, body, and relationship.
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            We use multiple lenses—symbolic, psychological, somatic, and relational—to support pattern recognition,
            reflection, and integration. These tools are offered as frameworks for orientation, not belief or prediction.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                className="group relative rounded-2xl border border-slate-200 bg-white/60 p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                      <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{m.title}</h2>
                        {m.badge ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                            {m.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.description}</p>
                    </div>
                  </div>

                  <ArrowRight className="mt-2 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
                </div>

                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-slate-900/5 transition group-hover:ring-1 dark:ring-white/5 dark:group-hover:ring-white/10" />
              </Link>
            );
          })}
        </section>

        <footer className="mt-10 text-xs text-slate-500 dark:text-slate-400">
          Tip: If you&apos;re not sure where to start, open <span className="font-medium text-slate-700 dark:text-slate-200">Field Snapshot</span>, then
          move into <span className="font-medium text-slate-700 dark:text-slate-200">Integration Protocols</span>.
        </footer>
      </div>
    </main>
  );
}
