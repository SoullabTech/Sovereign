'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Holoflower } from '@/components/ui/Holoflower';

export function HeaderWrapper() {
  const pathname = usePathname();

  // Hide header completely on intro and maia pages for immersive experience
  if (pathname === '/intro' || pathname === '/maia') {
    return null;
  }

  return (
    <header className="relative">
      {/* Sacred atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-r from-soul-background via-soul-surface/50 to-soul-background" />
      <div className="absolute inset-0 bg-gradient-radial from-soul-accent/[0.03] via-transparent to-transparent" />

      <div className="relative flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-soul-accent/20 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Sacred holoflower logo */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Holoflower size="md" glowIntensity="medium" animate={true} />
            <div className="absolute inset-0 bg-soul-accent/10 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500" />
          </div>

          <h1 className="text-xl sm:text-2xl font-light tracking-etched text-soul-textPrimary group-hover:text-soul-accent transition-colors duration-300">
            Soullab
          </h1>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="relative group px-3 py-1 rounded-full hover:bg-soul-surface/20 transition-all duration-300"
          >
            <span className="text-sm sm:text-base text-soul-textSecondary group-hover:text-soul-textPrimary tracking-archive transition-colors duration-300">
              Sacred Mirror
            </span>
            <div className="absolute inset-0 border border-soul-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <Link
            href="/dashboard"
            className="relative group px-3 py-1 rounded-full hover:bg-soul-surface/20 transition-all duration-300 hidden sm:flex"
          >
            <span className="text-sm sm:text-base text-soul-textSecondary group-hover:text-soul-textPrimary tracking-archive transition-colors duration-300">
              Analytics
            </span>
            <div className="absolute inset-0 border border-soul-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* Sacred divider */}
          <div className="w-px h-6 bg-soul-accent/30" />

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}