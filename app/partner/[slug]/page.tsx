'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Partner slug redirect page
 *
 * Redirects to partner-welcome with the slug as institution parameter.
 * Partner slugs map to institutional contexts (e.g., /partner/yale → Yale portal).
 */
export default function PartnerSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      // Redirect to partner-welcome with institutional context
      router.replace(`/partner-welcome?institution=${encodeURIComponent(slug)}&context=default`);
    } else {
      // No slug, redirect to main page
      router.replace('/');
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
      <div className="text-teal-800 animate-pulse">Loading partner portal...</div>
    </div>
  );
}
