'use client';

/**
 * Ideas World — Early-stage emergence.
 *
 * Not a note-taking app. Not a product tracker.
 * A space for nascent ideas before they harden into form.
 * v1: minimal — an invitation to notice what wants to emerge,
 * plus a single capture affordance that seeds a MAIA conversation.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DepthBoundary } from '@/components/maia/DepthBoundary';
import { emitWorldEvent } from '@/lib/telemetry/worldTelemetry';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';

const EMERGENCE_WHISPERS = [
  {
    whisper: 'What wants to emerge that you haven\u2019t quite said yet?',
    context: 'The half-formed is often where the new thing lives.',
  },
  {
    whisper: 'What idea keeps returning to you \u2014 the one you almost dismiss?',
    context: 'Recurrence is a signal. Not all signals are loud.',
  },
  {
    whisper: 'If you gave this idea one more day to be vague, what would it become?',
    context: 'Premature clarity is how ideas die.',
  },
  {
    whisper: 'What are you building without knowing you\u2019re building it?',
    context: 'Some work is happening before the plan.',
  },
  {
    whisper: 'What\u2019s the smallest version of this that would teach you something?',
    context: 'A sketch can do what a specification cannot.',
  },
];

export default function IdeasWorld() {
  const router = useRouter();
  const [offering, setOffering] = useState(EMERGENCE_WHISPERS[0]);
  const [draft, setDraft] = useState('');
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    const idx = Math.floor(Math.random() * EMERGENCE_WHISPERS.length);
    setOffering(EMERGENCE_WHISPERS[idx]);
    emitWorldEvent({ eventType: 'world_entered', world: 'ideas' });
    return () => {
      emitWorldEvent({
        eventType: 'world_exited',
        world: 'ideas',
        timeInWorld: Math.round((Date.now() - enteredAt.current) / 1000),
      });
    };
  }, []);

  const takeToMaia = () => {
    const prompt = draft.trim()
      ? `I\u2019m sitting with an early idea: ${draft.trim()}`
      : `I came to the Ideas space with this question: \u201C${offering.whisper}\u201D`;
    seedMaiaPrompt({
      prompt,
      source: 'ideas:world',
      sourceLabel: 'Ideas',
      returnTo: '/maia/ideas',
      tone: 'exploratory',
    });
    router.push('/maia');
  };

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
          aria-label="Return to MAIA"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Subtle orientation */}
      <div className="max-w-2xl mx-auto px-6 mb-8">
        <p className="text-amber-200/30 text-sm italic">
          Something is trying to form.
        </p>
      </div>

      {/* Sacred space — centered, quiet, spacious */}
      <div className="max-w-lg mx-auto px-6 py-12 text-center">
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

        {/* Capture — quiet, optional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-16"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say it badly. That's the point."
            rows={3}
            className="w-full bg-transparent border-b border-white/10 focus:border-amber-200/30 outline-none text-white/60 placeholder-white/20 text-sm leading-relaxed resize-none transition-colors duration-300 text-left"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          />

          <button
            onClick={takeToMaia}
            className="mt-6 inline-flex items-center gap-2 text-amber-200/40 hover:text-amber-200/70 text-sm italic transition-colors duration-300"
          >
            <Sparkles size={14} />
            {draft.trim() ? 'Take this to MAIA' : 'Sit with this in MAIA'}
          </button>
        </motion.div>
      </div>

      {/* Perceptual horizon */}
      <div className="max-w-2xl mx-auto px-6">
        <DepthBoundary message="Early ideas don’t need to be finished to matter…" />
      </div>
    </motion.div>
  );
}
