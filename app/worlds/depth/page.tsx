'use client';

/**
 * Depth World — Go deeper.
 *
 * Not a tool. Not a feature. A sacred/symbolic space.
 * v1: minimal — a place of stillness and depth prompts.
 * Will grow into wisdom texts, guided encounters, symbolic work.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DepthBoundary } from '@/components/maia/DepthBoundary';
import { emitWorldEvent } from '@/lib/telemetry/worldTelemetry';

const DEPTH_OFFERINGS = [
  {
    whisper: 'What is asking to be seen right now?',
    context: 'Not what you think about\u2014what thinks through you.',
  },
  {
    whisper: 'What would you say if no one were listening?',
    context: 'The truest things are often the quietest.',
  },
  {
    whisper: 'What are you avoiding\u2014and what does the avoidance protect?',
    context: 'Sometimes the guardian is more interesting than the gate.',
  },
  {
    whisper: 'If this moment were a symbol, what would it be?',
    context: 'Images carry what words cannot hold.',
  },
  {
    whisper: 'What has changed in you that you haven\u2019t named yet?',
    context: 'Change often arrives before recognition.',
  },
];

export default function DepthWorld() {
  const router = useRouter();
  const [offering, setOffering] = useState(DEPTH_OFFERINGS[0]);
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    const idx = Math.floor(Math.random() * DEPTH_OFFERINGS.length);
    setOffering(DEPTH_OFFERINGS[idx]);
    emitWorldEvent({ eventType: 'world_entered', world: 'depth' });
    return () => {
      emitWorldEvent({
        eventType: 'world_exited',
        world: 'depth',
        timeInWorld: Math.round((Date.now() - enteredAt.current) / 1000),
      });
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
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

      {/* Subtle orientation */}
      <div className="max-w-2xl mx-auto px-6 mb-8">
        <p className="text-amber-200/30 text-sm italic">
          There&rsquo;s more beneath this.
        </p>
      </div>

      {/* Sacred space — centered, quiet, spacious */}
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-white/70 text-xl leading-relaxed italic"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          {offering.whisper}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-white/25 text-sm mt-8 leading-relaxed"
        >
          {offering.context}
        </motion.p>
      </div>

      {/* Perceptual horizon */}
      <div className="max-w-2xl mx-auto px-6">
        <DepthBoundary message="There's more here if you stay with it\u2026" />
      </div>
    </motion.div>
  );
}
