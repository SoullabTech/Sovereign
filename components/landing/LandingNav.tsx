'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'AIN + MAIA', href: '#maia' },
  { label: 'Innovations', href: '#research' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contact', href: '#contact' },
];

const showBetaChip = process.env.NEXT_PUBLIC_SHOW_BETA_BADGE === 'true';

/**
 * Small beta indicator rendered inside the nav chrome. On the landing page
 * this replaces the global BetaBanner (which yields here — its fixed top-right
 * position would overlap the Enter MAIA control; see components/BetaBanner.tsx).
 */
function BetaChip() {
  if (!showBetaChip) return null;
  return (
    <span
      role="note"
      aria-label="This platform is in beta"
      className="hidden min-[360px]:inline-flex select-none items-center gap-1.5 rounded-full border border-amber-400/25 bg-[#1A1513]/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/80"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" aria-hidden="true" />
      Beta
    </span>
  );
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // The page scrolls the window on mobile, but a global landscape rule makes
    // <main> the scroll container on desktop — listen to both so the backdrop
    // engages regardless of which one is actually scrolling.
    const mainEl = document.querySelector('main');
    const onScroll = () =>
      setScrolled(window.scrollY > 16 || (mainEl ? mainEl.scrollTop > 16 : false));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    mainEl?.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      mainEl?.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-maia-navy-950/95 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-3 group"
          >
            <img src="/soullab-logo.png" alt="Soullab" className="w-8 h-8 rounded-full" />
            <span className="text-white/70 group-hover:text-white text-sm tracking-[0.2em] uppercase transition-colors">
              Soullab
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-white/40 hover:text-white/80 text-sm transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <BetaChip />
            <Link
              href="/enter"
              className="inline-flex items-center rounded-lg px-5 py-2 bg-maia-spice-500/10 text-maia-spice-400 hover:bg-maia-spice-500/20 text-sm font-medium transition-colors"
            >
              Enter MAIA
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-2.5">
            <BetaChip />
            <Link
              href="/enter"
              className="inline-flex items-center rounded-lg px-4 py-2 bg-maia-spice-500/10 text-maia-spice-400 text-sm font-medium"
            >
              MAIA
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white/50 hover:text-white p-1"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-maia-navy-950/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-white/60 hover:text-white text-2xl font-light tracking-wide transition-colors"
            >
              {link.label}
            </button>
          ))}
          <Link
            href="/enter"
            onClick={() => setMobileOpen(false)}
            className="mt-4 inline-flex items-center rounded-xl px-6 py-3 bg-maia-spice-500 text-black font-semibold text-base"
          >
            Enter MAIA
          </Link>
        </div>
      )}
    </>
  );
}
