'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DoorOpen,
  Telescope,
  FlaskConical,
  Aperture,
  PenLine,
  BookOpen,
  Activity,
  Map as MapIcon,
  Newspaper,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { FIELD_ACCENT } from '@/lib/beta-testers/constants';

// Participation-first: lead with the inquiry, not the announcements.
const NAV = [
  { href: '/beta-testers', label: 'Welcome', Icon: DoorOpen, exact: true },
  { href: '/beta-testers/questions', label: 'Living Questions', Icon: Telescope },
  { href: '/beta-testers/experiments', label: 'Experiments', Icon: FlaskConical },
  { href: '/beta-testers/perspectives', label: 'Elemental Perspectives', Icon: Aperture },
  { href: '/beta-testers/observe', label: 'Observations', Icon: PenLine },
  { href: '/beta-testers/learnings', label: 'Shared Learnings', Icon: BookOpen },
  { href: '/beta-testers/pulse', label: 'Field Pulse', Icon: Activity },
  { href: '/beta-testers/roadmap', label: 'Roadmap', Icon: MapIcon },
  { href: '/beta-testers/news', label: 'News', Icon: Newspaper },
];

type Status = 'loading' | 'unauthenticated' | 'not-cohort' | 'ok';

export default function LivingFieldLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/access', { method: 'GET' });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!data?.authenticated) setStatus('unauthenticated');
        else if (!data?.inCohort) setStatus('not-cohort');
        else setStatus('ok');
      } catch {
        if (!cancelled) setStatus('not-cohort');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-zinc-300">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <header className="pt-12 pb-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Soullab</div>
          <h1 className="mt-1 text-2xl font-light text-zinc-100">The Living Field</h1>
          <p className="mt-2 text-sm text-zinc-500">A field we cultivate together — participate, notice, return.</p>
        </header>

        {status === 'ok' && (
          <nav className="sticky top-0 z-10 -mx-5 border-b border-white/5 bg-[#0c0c0f]/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
            <ul className="flex gap-1 overflow-x-auto">
              {NAV.map(({ href, label, Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors hover:text-zinc-200"
                      style={active ? { color: '#0c0c0f', backgroundColor: FIELD_ACCENT } : { color: '#a1a1aa' }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <main className="min-h-[50vh] py-10">
          {status === 'loading' && (
            <div className="flex items-center justify-center py-24 text-sm text-zinc-600">
              <span className="animate-pulse">Opening the field…</span>
            </div>
          )}

          {status === 'unauthenticated' && (
            <Gate
              title="Cross the threshold"
              body="The Living Field is open to the cohort cultivating it. Sign in to enter."
              actionHref={`/signin?next=${encodeURIComponent('/beta-testers')}`}
              actionLabel="Sign in"
            />
          )}

          {status === 'not-cohort' && (
            <Gate
              title="Invitation only"
              body="The Living Field is a participatory space, not a public one. If you believe you should be here, reach out to the team."
            />
          )}

          {status === 'ok' && children}
        </main>

        <footer className="border-t border-white/5 pb-16 pt-8 text-xs leading-relaxed text-zinc-600">
          Observation over evaluation. Three things stay separate: your memory, your observations of the field, and what
          we learn together. What you share here is never added to MAIA’s memory.
        </footer>
      </div>
    </div>
  );
}

function Gate({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <h2 className="text-lg font-light text-zinc-100">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{body}</p>
      {actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-block rounded-full px-5 py-2 text-sm font-medium"
          style={{ backgroundColor: FIELD_ACCENT, color: '#0c0c0f' }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
