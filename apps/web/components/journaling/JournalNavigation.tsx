'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, TrendingUp, Mic, Search, BarChart3 } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  unlockAt?: number;
}

const NAV_LINKS: NavLink[] = [
  {
    href: '/journal',
    label: 'Journal',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    href: '/journal/timeline',
    label: 'Timeline',
    icon: <TrendingUp className="h-4 w-4" />,
    unlockAt: 3
  },
  {
    href: '/journal/analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    unlockAt: 3
  },
  {
    href: '/journal/voice',
    label: 'Voice',
    icon: <Mic className="h-4 w-4" />
  },
  {
    href: '/journal/search',
    label: 'Search',
    icon: <Search className="h-4 w-4" />,
    unlockAt: 5
  }
];

export default function JournalNavigation() {
  const pathname = usePathname();
  const [entryCount, setEntryCount] = React.useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem('journal_entry_count') || '0');
      setEntryCount(count);
    }
  }, []);

  const isUnlocked = (link: NavLink) => {
    if (!link.unlockAt) return true;
    return entryCount >= link.unlockAt;
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav className="flex items-center gap-1">
      {NAV_LINKS.map((link) => {
        const unlocked = isUnlocked(link);
        const active = isActive(link.href);

        if (!unlocked) {
          return (
            <div
              key={link.href}
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm opacity-50 cursor-not-allowed"
              title={`Unlocks after ${link.unlockAt} entries`}
            >
              {link.icon}
              <span className="hidden sm:inline">{link.label}</span>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-700 text-[10px] text-neutral-400">
                {link.unlockAt}
              </span>
            </div>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              active
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {link.icon}
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}