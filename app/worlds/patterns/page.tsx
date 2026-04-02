'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import PatternField from '@/components/worlds/PatternField';
import DepthBoundary from '@/components/maia/DepthBoundary';

export default function PatternsWorldPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-8 md:px-8">
        <button
          type="button"
          onClick={() => router.push('/maia')}
          className="mb-10 inline-flex items-center gap-1.5 text-xs text-white/[0.24] transition hover:text-white/[0.44]"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="mx-auto max-w-5xl">
          <PatternField />

          <div className="mt-14">
            <DepthBoundary
              message="This pattern continues beyond what's visible."
              subtext="Something in it has not fully revealed itself yet."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
