'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

/**
 * Studio → Comms → message detail.
 *
 * There is no message store wired to this surface yet (see ../page.tsx), so any
 * direct message URL resolves to a truthful "not found" rather than fabricated
 * content. Restored when a real inbox is connected.
 */
export default function CommsMessageDetailPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 p-3">
        <Link
          href="/studio/comms"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Comms
        </Link>
      </div>

      <div className="flex items-center justify-center h-[calc(100vh-49px)] text-slate-500 text-sm">
        Message not found.
      </div>
    </div>
  );
}
