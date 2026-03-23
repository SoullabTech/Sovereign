'use client';

/**
 * CONNECT ENTRY POINT
 * ====================
 * The ONE link practitioners share with clients.
 * Adapts behavior based on client state:
 *
 *   - Has session? → redirect to thread
 *   - Has invite code? → redirect to claim
 *   - No session? → redirect to signin
 *
 * URL: /connect/[slug]
 * Optional: /connect/[slug]?code=STAR-XXXX-XXXX-XXXX
 */

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

// Friendly slug aliases → actual portal slugs
const SLUG_ALIASES: Record<string, string> = {
  'kelly': 'stellium',
};

export default function ConnectEntryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawSlug = params.slug as string;
  const slug = SLUG_ALIASES[rawSlug.toLowerCase()] || rawSlug;
  const code = searchParams.get('code');

  useEffect(() => {
    async function resolve() {
      // If invite code present, send to claim flow
      if (code) {
        router.replace(`/portal/${slug}/claim?code=${encodeURIComponent(code)}`);
        return;
      }

      // Check for existing session by hitting thread API
      try {
        const res = await fetch(`/api/portal/${slug}/thread`, {
          credentials: 'include',
          method: 'GET',
        });

        if (res.ok) {
          // Session valid → go to thread
          router.replace(`/portal/${slug}/thread`);
        } else {
          // No session → signin
          router.replace(`/portal/${slug}/signin`);
        }
      } catch {
        router.replace(`/portal/${slug}/signin`);
      }
    }

    resolve();
  }, [slug, code, router]);

  // Brief loading state while resolving
  return (
    <div className="min-h-screen flex items-center justify-center font-quicksand"
         style={{ background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)' }}>
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#9D8EC7]/50">Connecting...</p>
      </div>
    </div>
  );
}
