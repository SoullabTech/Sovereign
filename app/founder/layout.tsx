'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Hexagon } from 'lucide-react';
import { FOUNDER_NAV } from '@/lib/founder/founderNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { isFeatureEnabled } from '@/lib/utils/feature-flags';

const SIDEBAR_W = 200;
const SIDEBAR_COLLAPSED_W = 56;

export default function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Feature flag gate
  if (typeof window !== 'undefined' && !isFeatureEnabled('founderConsole')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--sl-bg-canvas)]">
        <p className="text-[var(--sl-text-muted)]">Founder console is not enabled.</p>
      </div>
    );
  }

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_W;

  const navContent = (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {FOUNDER_NAV.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && setDrawerOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm
              ${isActive
                ? 'bg-[var(--sl-bg-elevated)] text-[var(--sl-accent-admin)]'
                : 'text-[var(--sl-text-secondary)] hover:bg-[var(--sl-bg-elevated)] hover:text-[var(--sl-text-primary)]'
              }
            `}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[var(--sl-bg-canvas)]">
      {/* Desktop sidebar */}
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={{ width: sidebarWidth }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed top-0 left-0 h-screen z-30 flex flex-col border-r border-[var(--sl-border-subtle)] bg-[var(--sl-bg-canvas-deep)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-4 border-b border-[var(--sl-border-subtle)]">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-[var(--sl-accent-admin)]" />
                <span className="text-sm font-semibold text-[var(--sl-text-primary)]">MAIA Ops</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-[var(--sl-bg-elevated)] text-[var(--sl-text-muted)]"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {navContent}
        </motion.aside>
      )}

      {/* Mobile header + drawer */}
      {isMobile && (
        <>
          <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-[var(--sl-border-subtle)] bg-[var(--sl-bg-canvas-deep)]">
            <div className="flex items-center gap-2">
              <Hexagon className="w-5 h-5 text-[var(--sl-accent-admin)]" />
              <span className="text-sm font-semibold text-[var(--sl-text-primary)]">MAIA Ops</span>
            </div>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-1 rounded hover:bg-[var(--sl-bg-elevated)] text-[var(--sl-text-muted)]"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 z-40 bg-black"
                />
                <motion.aside
                  initial={{ x: -260 }}
                  animate={{ x: 0 }}
                  exit={{ x: -260 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="fixed top-0 left-0 w-[260px] h-screen z-50 border-r border-[var(--sl-border-subtle)] bg-[var(--sl-bg-canvas-deep)]"
                >
                  <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--sl-border-subtle)]">
                    <div className="flex items-center gap-2">
                      <Hexagon className="w-5 h-5 text-[var(--sl-accent-admin)]" />
                      <span className="text-sm font-semibold text-[var(--sl-text-primary)]">MAIA Ops</span>
                    </div>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="p-1 rounded hover:bg-[var(--sl-bg-elevated)] text-[var(--sl-text-muted)]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {navContent}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Main content */}
      <main
        className="flex-1 min-h-screen"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          paddingTop: isMobile ? 56 : 0,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
