'use client';

import { usePathname } from 'next/navigation';
import { MenuBar } from './MenuBar';

/**
 * Conditionally renders MenuBar based on current route
 * Shows on home page only
 */
export function ConditionalMenuBar() {
  const pathname = usePathname();

  // Show MenuBar on home page only (removed from /maia per user request)
  const shouldShowMenuBar = pathname === '/';

  // Hide on all other pages
  if (!shouldShowMenuBar) {
    return null;
  }

  return <MenuBar />;
}
