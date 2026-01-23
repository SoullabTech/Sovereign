'use client';

/**
 * Legacy redirect: /maia/membership → /membership
 *
 * This route now redirects to the canonical /membership page.
 * Preserves query params (like `next=` for post-upgrade navigation).
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function MembershipRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve query params through redirect
    const params = searchParams?.toString();
    const destination = params ? `/membership?${params}` : '/membership';
    router.replace(destination);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7f5' }}>
      <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
    </div>
  );
}

export default function MembershipRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7f5' }}>
        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
      </div>
    }>
      <MembershipRedirectInner />
    </Suspense>
  );
}
