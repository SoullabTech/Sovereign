/**
 * MAIA Admin Hub — intentionally minimal index.
 *
 * Lists operational surfaces under /admin/maia. Each surface has its own
 * scope; this page is a directory, not a dashboard. No fetches, no badges,
 * no aggregation — those belong on the surfaces themselves.
 *
 * Add new surfaces by appending to SURFACES.
 */

import Link from 'next/link';

const SURFACES: Array<{ title: string; href: string; description: string }> = [
  {
    title: 'Substrate Monitor',
    href: '/admin/maia/substrate',
    description:
      'Nervous-system monitor. Capability claims correlated against in-process runtime evidence. Read-only.',
  },
  {
    title: 'Engine Comparison Review',
    href: '/admin/maia/engine-comparisons',
    description:
      'Evaluation workstation. Shadow vs primary responses joined on turn_id. Reviewer labels feed Loop C learning analytics.',
  },
  {
    title: 'Feedback Inbox',
    href: '/admin/maia/feedback',
    description:
      'Triage workflow for human-submitted reports — a board moving each report New → Triaged → Planned → Active → Fixed → Verified → Closed, with screenshot, reporter, owner, and linked PR. A workflow board, not a capability monitor: it triages what people report; it does not adjudicate substrate.',
  },
];

export default function MaiaAdminHubPage() {
  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-light tracking-wide text-maia-ink-100">
            MAIA Admin
          </h1>
          <p className="text-maia-ink-60 text-sm mt-1 max-w-xl">
            Operational surfaces for MAIA&apos;s substrate, evaluation, and
            learning loops. Each surface has its own scope.
          </p>
        </header>

        <ul className="space-y-3">
          {SURFACES.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block rounded border border-maia-ink-40/20 bg-maia-navy-900 p-4 hover:border-maia-ink-40/60 transition-colors"
              >
                <div className="text-base font-medium text-maia-ink-100">
                  {s.title}
                </div>
                <div className="text-xs text-maia-ink-40 mt-1 font-mono">
                  {s.href}
                </div>
                <div className="text-sm text-maia-ink-60 mt-2">
                  {s.description}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
