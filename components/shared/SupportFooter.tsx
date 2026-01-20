'use client';

/**
 * Support Footer
 *
 * Minimal footer for support/membership surfaces.
 * Signals transparency without cluttering product screens.
 *
 * Used on: /maia/membership, /patrons, /maia/stewardship, /maia/privacy
 */

import Link from 'next/link';

interface SupportFooterProps {
  /** Light theme for day-mode pages */
  theme?: 'light' | 'dark';
}

export default function SupportFooter({ theme = 'light' }: SupportFooterProps) {
  const links = [
    { href: '/maia/stewardship', label: 'Why support matters' },
    { href: '/maia/privacy', label: 'Privacy' },
    { href: '/dashboard/export', label: 'Export your data' },
  ];

  const textColor = theme === 'light'
    ? 'text-stone-400 hover:text-stone-600'
    : 'text-stone-500 hover:text-stone-300';

  const borderColor = theme === 'light'
    ? 'border-stone-200/60'
    : 'border-stone-700/60';

  return (
    <footer className={`mt-16 pt-8 border-t ${borderColor}`}>
      <div className="flex flex-wrap justify-center gap-6 text-[12px]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${textColor}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className={`mt-4 text-center text-[11px] ${theme === 'light' ? 'text-stone-300' : 'text-stone-600'}`}>
        Soullab · Your data stays yours
      </p>
    </footer>
  );
}
