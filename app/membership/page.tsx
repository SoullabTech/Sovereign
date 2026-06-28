'use client';

/**
 * /membership → /maia/membership
 *
 * Alias for the canonical membership page. Several surfaces link to
 * `/membership` (stewardship, community, settings, threshold prompts),
 * while the Stripe checkout return URL and astrology prompts use
 * `/maia/membership`. This keeps every existing link resolving to one
 * real page. Client-side replace keeps it static-export safe for the
 * Capacitor build.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MembershipAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maia/membership');
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="w-8 h-8 border-2 border-[#5a7a6f]/20 border-t-[#5a7a6f] rounded-full animate-spin" />
    </div>
  );
}
