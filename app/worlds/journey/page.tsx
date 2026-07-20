'use client';

/**
 * Journey World — See where you've been.
 *
 * Not an analytics dashboard. Not a settings panel.
 * Your life as a living field. The spine of the system.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DepthBoundary } from '@/components/maia/DepthBoundary';
import { emitWorldEvent } from '@/lib/telemetry/worldTelemetry';

export default function JourneyWorld() {
  const router = useRouter();
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    emitWorldEvent({ eventType: 'world_entered', world: 'journey' });
    return () => {
      emitWorldEvent({
        eventType: 'world_exited',
        world: 'journey',
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

      {/* Subtle orientation — not a header, a whisper */}
      <div className="max-w-2xl mx-auto px-6 mb-8">
        <p className="text-amber-200/30 text-sm italic">
          This has been unfolding.
        </p>
      </div>

      {/* Spiral-state rendering unsurfaced (audit F-01, 2026-07-20): inferred
          position (element/phase/motion) may not render as member-facing fact
          without disclosure + consent. Returns only through that architecture. */}

      {/* Perceptual horizon */}
      <div className="max-w-2xl mx-auto px-6">
        <DepthBoundary message="There's a longer arc here…" />
      </div>
    </motion.div>
  );
}
