'use client';

/**
 * Now What? — the environment root. Client Home.
 *
 * This route did not exist: `/now-what` had rooms but no threshold, so an
 * invited client following their link landed nowhere and had to already know
 * which room they wanted. Home is where a person arrives, and where every
 * other room returns them.
 *
 * Query params:
 *   fieldContext — optional; scopes the room to one field (e.g. now-what-demo)
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientHome from '@/components/now-what/ClientHome';

function HomeInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  return <ClientHome fieldContext={fieldContext} />;
}

export default function NowWhatHomePage() {
  return (
    <div className="min-h-screen bg-[#062a42] text-slate-200">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-500 text-sm font-light">Opening your space…</p>
          </div>
        }
      >
        <HomeInner />
      </Suspense>
    </div>
  );
}
