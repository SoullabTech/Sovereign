'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRESS, SERIF } from './pressTheme';
import { visibleDestinations, type StudioDestination } from './studioMap';

/**
 * Author Studio — the Layer 2 shell.
 *
 * This is the environment the member is IN. It persists across every Studio
 * surface so the question "where am I, and what else is here?" is answered
 * without asking. Before this existed, the House opened straight onto a
 * working surface and the Studio was invisible.
 *
 * Desktop: a quiet left rail. Mobile: the rail collapses to a room switcher —
 * the current location stays visible in the bar, and the manuscript is never
 * squeezed by a permanently open rail.
 *
 * It states what is here and what is not. A destination that is not built
 * renders as plainly unavailable — never a dead link, never a hopeful one.
 */

interface StudioShellProps {
  children: React.ReactNode;
  /** Drives whether book-scoped destinations appear at all. */
  hasManuscript: boolean;
  /** Shown under the Studio name so the member always knows which book. */
  manuscriptTitle?: string | null;
  /**
   * D-05 — the shell persists across rooms, growing QUIETER inward, never absent.
   *
   * A working surface is deeper in the house than Studio Home, so the rail
   * narrows and recedes there. It does not disappear: a room the shell has left
   * stops being a room and becomes a separate application, and once rooms are
   * applications the House does not exist.
   *
   * `quiet` changes weight only — same destinations, same spine, same way out.
   */
  quiet?: boolean;
}

function isCurrent(dest: StudioDestination, pathname: string, tab: string | null): boolean {
  if (!dest.href) return false;
  const [path, queryString] = dest.href.split('?');
  if (path !== pathname) return false;
  const wanted = queryString ? new URLSearchParams(queryString).get('tab') : null;
  // /press/manuscript with no tab is the import threshold; ?tab=draft is Write.
  return (wanted ?? null) === (tab ?? null);
}

export default function StudioShell({
  children,
  hasManuscript,
  manuscriptTitle,
  quiet = false,
}: StudioShellProps) {
  const pathname = usePathname() ?? '';
  const [menuOpen, setMenuOpen] = useState(false);

  // Read the query after mount rather than through useSearchParams: that hook
  // forces a Suspense boundary around the whole Studio, and the only thing it
  // would buy is highlighting which room is current. Re-read on path change.
  const [tab, setTab] = useState<string | null>(null);
  useEffect(() => {
    setTab(new URLSearchParams(window.location.search).get('tab'));
  }, [pathname]);

  const groups = visibleDestinations(hasManuscript);

  const currentLabel =
    groups
      .flatMap((g) => g.destinations)
      .find((d) => isCurrent(d, pathname, tab))?.label ?? 'Author Studio';

  const nav = (
    <nav className="space-y-7">
      {groups.map((group) => (
        <div key={group.id}>
          {group.label && (
            <p className="text-[11px] tracking-[0.2em] uppercase opacity-35 mb-2.5">
              {group.label}
            </p>
          )}
          <ul className="space-y-1.5">
            {group.destinations.map((d) => {
              const current = isCurrent(d, pathname, tab);

              // Not built. Rendered as a fact, not a door. No href, no handler,
              // aria-disabled so it is not announced as actionable.
              if (d.availability === 'later') {
                return (
                  <li key={d.id}>
                    <span
                      aria-disabled="true"
                      className="flex items-baseline gap-2 py-1 text-[15px] opacity-30 cursor-default"
                    >
                      {d.label}
                      <span className="text-[11px] tracking-wide">— not yet available</span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={d.id}>
                  <Link
                    href={d.href!}
                    onClick={() => setMenuOpen(false)}
                    aria-current={current ? 'page' : undefined}
                    className={`block py-1 text-[15px] transition-opacity ${
                      current ? 'opacity-100' : 'opacity-60 hover:opacity-90'
                    }`}
                    style={current ? { color: PRESS.accent } : undefined}
                  >
                    {d.label}
                    {d.note && (
                      <span className="block text-[12px] opacity-45 leading-snug">{d.note}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const identity = (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <img
          src="/holoflower-studio-transparent.png"
          alt=""
          aria-hidden="true"
          className="w-6 h-6 opacity-90"
        />
        <p className="text-[12px] tracking-[0.25em] uppercase opacity-50">Author Studio</p>
      </div>
      {manuscriptTitle && (
        <p className="text-[15px] opacity-75 leading-snug" style={{ fontFamily: SERIF }}>
          {manuscriptTitle}
        </p>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      {/* ── Mobile: room switcher. Current location stays visible in the bar. ── */}
      <div
        className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-5 py-3 border-b backdrop-blur"
        style={{ borderColor: PRESS.rule, background: 'rgba(26,21,19,0.92)' }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.25em] uppercase opacity-45">Author Studio</p>
          <p className="text-[14px] truncate">{currentLabel}</p>
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="studio-mobile-nav"
          className="shrink-0 px-3 py-1.5 border text-[12px] tracking-[0.15em] uppercase"
          style={{ borderColor: PRESS.rule }}
        >
          {menuOpen ? 'Close' : 'Studio'}
        </button>
      </div>

      {menuOpen && (
        <div
          id="studio-mobile-nav"
          className="md:hidden px-5 py-6 border-b"
          style={{ borderColor: PRESS.rule }}
        >
          <div className="mb-6">{identity}</div>
          {nav}
        </div>
      )}

      <div className="md:flex">
        {/* ── Desktop: the quiet rail. ── */}
        <aside
          /* D-05 quiet treatment. `opacity-45` was measured on 2026-08-01 and
             rejected: rail opacity MULTIPLIES with the per-element opacities
             already inside the rail (links 0.6, group labels 0.35, notes 0.45),
             so 0.45 drove every element under WCAG AA — primary destinations to
             2.25:1 and secondary text to 1.37:1. That is not quiet, it is
             illegible, and it would have made the founder's quiet-vs-dimmed
             judgment a judgment about an inaccessible surface.

             Quiet is now carried by FOOTPRINT (a narrower rail, less padding)
             and one modest opacity step that keeps destinations above 4.5:1.
             Hover/focus still returns the rail to full weight. */
          className={`hidden md:block shrink-0 border-r sticky top-0 h-screen overflow-y-auto transition-opacity ${
            quiet
              ? 'w-52 px-5 py-10 opacity-85 hover:opacity-100 focus-within:opacity-100'
              : 'w-60 px-6 py-10'
          }`}
          style={{ borderColor: PRESS.rule }}
        >
          <div className="mb-10">{identity}</div>
          {nav}
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
