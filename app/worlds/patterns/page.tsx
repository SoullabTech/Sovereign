'use client';

/**
 * Patterns World — Step into what keeps returning.
 *
 * Not a dashboard. Not a settings panel.
 * A space where patterns become visible.
 */

import { Suspense, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DepthBoundary } from '@/components/maia/DepthBoundary';
import { emitWorldEvent } from '@/lib/telemetry/worldTelemetry';

const PatternLedger = dynamic(
  () => import('@/components/consciousness/PatternLedger'),
  { ssr: false },
);

export default function PatternsWorld() {
  const router = useRouter();
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    emitWorldEvent({ eventType: 'world_entered', world: 'patterns' });
    return () => {
      emitWorldEvent({
        eventType: 'world_exited',
        world: 'patterns',
        timeInWorld: Math.round((Date.now() - enteredAt.current) / 1000),
      });
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#0b0f1c] text-white"
    >
      {/* Return threshold */}
      <div className="p-6">
        <button
          onClick={() => router.push('/maia')}
          className="text-white/30 hover:text-white/50 transition-colors duration-300"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* World content */}
      <div className="max-w-2xl mx-auto px-6">
        <Suspense
          fallback={
            <div className="text-white/20 text-sm italic text-center py-20">
              Patterns emerging&hellip;
            </div>
          }
        >
          <PatternLedger />
        </Suspense>
      </div>

      {/* Perceptual horizon */}
      <div className="max-w-2xl mx-auto px-6">
        <DepthBoundary message="This pattern continues beyond what's visible\u2026" />
      </div>
    </motion.div>
  );
}
