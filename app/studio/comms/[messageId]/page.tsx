'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { mockMessages } from '@/lib/studio/mockMessages';
import { CommsMessageDetail } from '@/components/studio/CommsMessageDetail';

export default function CommsMessageDetailPage() {
  const params = useParams<{ messageId: string }>();
  const messageId = params?.messageId;

  const message = useMemo(
    () => mockMessages.find((m) => m.id === messageId),
    [messageId],
  );

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
        {message ? (
          <CommsMessageDetail message={message} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Message not found.
          </div>
        )}
      </div>
    </div>
  );
}
