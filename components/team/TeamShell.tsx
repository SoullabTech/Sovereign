'use client';

/**
 * TeamShell — responsive wrapper for the Co-lab (/team) workspace.
 *
 * Desktop (md+): unchanged two-pane layout — sidebar in flow + content beside it.
 * Mobile (<md): the sidebar becomes a slide-in drawer (hidden by default), content
 * goes full-width, and a top bar exposes a hamburger to open the drawer. The drawer
 * closes automatically on navigation (route change) and on backdrop tap.
 *
 * Fixes the iPhone bug where the fixed-width sidebar + content were both forced
 * on-screen, collapsing the message pane to a one-character-per-line sliver.
 * No changes to TeamSidebar — this only wraps it.
 */

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TeamSidebar } from './TeamSidebar';

export function TeamShell({
  currentMemberId,
  children,
}: {
  currentMemberId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on any navigation (channel / DM / Decisions tap).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[#1a1a2e] overflow-hidden">
      {/* Sidebar: static column on desktop; slide-in drawer on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 h-full flex-shrink-0 transition-transform duration-200 ease-out
          md:static md:z-auto md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <TeamSidebar currentMemberId={currentMemberId} />
      </div>

      {/* Backdrop (mobile only, when drawer open) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Content column */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar with hamburger (hidden on desktop) */}
        <div className="md:hidden flex items-center gap-3 px-3 py-2 border-b border-white/8 bg-[#16162a] flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="text-white/70 hover:text-white p-1 -ml-1 rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-white/80 tracking-wide">Co‑lab</span>
        </div>

        {children}
      </main>
    </div>
  );
}
