'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with speech recognition
const BetaMinimalMirror = dynamic(
  () => import('@/components/chat/BetaMinimalMirror'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-indigo-500 animate-pulse" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading Maia...</p>
        </div>
      </div>
    )
  }
);

export default function BetaMirrorPage() {
  return <BetaMinimalMirror />;
}