'use client';

/**
 * Quick Capture surface (USC-04)
 *
 * Mobile-first. A client of the Capture contract — no note architecture of
 * its own. Binding (session vs personal inbox) is resolved server-side.
 */

import { QuickCapture } from '@/components/capture/QuickCapture';

export default function QuickCapturePage() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-start justify-center pt-6">
      <QuickCapture source="iphone" />
    </main>
  );
}
