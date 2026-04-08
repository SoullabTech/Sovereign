'use client';

/**
 * Relationships World — Relational awareness.
 *
 * Not a contacts list. Not a relationship score.
 * A space to notice the living field between you and another.
 * v1: minimal — a reflective prompt about a specific relationship,
 * plus a single capture affordance that seeds a MAIA conversation.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DepthBoundary } from '@/components/maia/DepthBoundary';
import { emitWorldEvent } from '@/lib/telemetry/worldTelemetry';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';

const RELATIONAL_WHISPERS = [
  {
    whisper: 'Which relationship are you carrying right now without naming it?',
    context: 'The unnamed thing sets the tone of the room.',
  },
  {
    whisper: 'Where are you performing closeness instead of being close?',
    context: 'Performance and presence use different muscles.',
  },
  {
    whisper: 'What does this person bring out in you that no one else does?',
    context: 'Some of who you are only exists in certain company.',
  },
  {
    whisper: 'What would change if you stopped trying to fix them?',
    context: 'Fixing is often the nicest word for managing.',
  },
  {
    whisper: 'Where is the edge between care and fusion in this one?',
    context: 'Care keeps you. Fusion takes you.',
  },
  {
    whisper: 'What pattern keeps returning between the two of you?',
    context: 'The loop is trying to tell you something it can\u2019t say directly.',
  },
];

export default function RelationshipsWorld() {
  const router = useRouter();
  const [offering, setOffering] = useState(RELATIONAL_WHISPERS[0]);
  const [draft, setDraft] = useState('');
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    const idx = Math.floor(Math.random() * RELATIONAL_WHISPERS.length);
    setOffering(RELATIONAL_WHISPERS[idx]);
    emitWorldEvent({ eventType: 'world_entered', world: 'relationships' });
    return () => {
      emitWorldEvent({
        eventType: 'world_exited',
        world: 'relationships',
        timeInWorld: Math.round((Date.now() - enteredAt.current) / 1000),
      });
    };
  }, []);

  const takeToMaia = () => {
    const prompt = draft.trim()
      ? `I\u2019m noticing something in a relationship: ${draft.trim()}`
      : `I came to the Relationships space with this question: \u201C${offering.whisper}\u201D`;
    seedMaiaPrompt({
      prompt,
      source: 'relationships:world',
      sourceLabel: 'Relationships',
      returnTo: '/maia/relationships',
      tone: 'supportive',
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
          The field between you and another is alive.
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
            placeholder="Name what you’re noticing. No one sees this but you."
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
        <DepthBoundary message="What’s alive in the field is often more honest than what’s said…" />
      </div>
    </motion.div>
  );
}
