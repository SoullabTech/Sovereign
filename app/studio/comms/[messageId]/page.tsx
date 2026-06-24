'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { CommsThreadDetail } from '@/components/studio/CommsThreadDetail';

/**
 * Mobile thread detail. The dynamic segment carries the thread id
 * (the inbox links to `/studio/comms/{thread_id}`). Read-only.
 */
export default function CommsThreadDetailPage() {
  const params = useParams<{ messageId: string }>();
  const threadId = params?.messageId ?? null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Back nav */}
      <div className="border-b border-slate-800 p-3">
        <Link
          href="/studio/comms"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Comms
        </Link>
      </div>

      {/* Detail */}
      <div className="h-[calc(100vh-49px)]">
        <CommsThreadDetail threadId={threadId} />
      </div>
    </div>
  );
}
