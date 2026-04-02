'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import DepthWell from '@/components/worlds/DepthWell';
import DepthBoundary from '@/components/maia/DepthBoundary';

export default function DepthWorldPage() {
  const router = useRouter();

  useEffect(() => {
    const enteredAt = Date.now();
    console.log('[World] entered', { world: 'depth' });

    return () => {
      const timeInWorld = Math.round((Date.now() - enteredAt) / 1000);
      console.log('[World] exited', {
        world: 'depth',
        timeInWorld,
      });
    };
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 8, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.56, ease: 'easeOut' }}
      className="min-h-screen bg-[#03050a] text-white"
    >
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-8 md:px-8">
        <button
          type="button"
          onClick={() => router.push('/maia')}
          className="mb-10 inline-flex items-center gap-2 text-sm text-white/[0.30] transition hover:text-white/[0.52]"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="mx-auto max-w-5xl">
          <DepthWell />

          <div className="mt-14">
            <DepthBoundary
              message="You're near something that can't be reached by thinking about it."
              subtext="What's here does not need to be solved."
            />
          </div>
        </div>
      </div>
    </motion.main>
  );
}
