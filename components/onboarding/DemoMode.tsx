'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Zap } from 'lucide-react';
import { JournalingMode } from '@/lib/journaling/JournalingPrompts';

interface DemoFlow {
  id: string;
  name: string;
  icon: string;
  mode: JournalingMode;
  entry: string;
  expectedReflection: {
    symbols: string[];
    archetypes: string[];
    emotionalTone: string;
    reflection: string;
    prompt: string;
    closing: string;
  };
}

const DEMO_FLOWS: DemoFlow[] = [
  {
    id: 'shadow-work',
    name: 'Shadow Work Example',
    icon: '🌓',
    mode: 'shadow',
    entry: `I've been feeling like there's a part of me I keep avoiding. I hear it when I'm alone — like an echo, like the voice of someone I used to be.

I think I've been avoiding grief. The part of me that lost something I never even named.`,
    expectedReflection: {
      symbols: ['cave', 'echo', 'river'],
      archetypes: ['Shadow', 'Mystic'],
      emotionalTone: 'grief',
      reflection: "You're entering sacred ground. The symbol I see is the cave — a space of retreat, but also revelation. This shadow carries the Echo archetype — the self unheard.",
      prompt: 'What might she be asking you to listen to now?',
      closing: 'Let this be enough for now. You entered the cave and named the unspoken.'
    }
  },
  {
    id: 'dream-integration',
    name: 'Dream Integration',
    icon: '🔮',
    mode: 'dream',
    entry: `Last night I dreamt I was walking through a dark forest. Everywhere I stepped, glowing mushrooms lit the path. I wasn't afraid—I was mesmerized. At the center was a still pool reflecting the moon.`,
    expectedReflection: {
      symbols: ['forest', 'mushrooms', 'pool', 'moon'],
      archetypes: ['Mystic', 'Seeker'],
      emotionalTone: 'awe',
      reflection: 'The glowing mushrooms may represent your inner light navigating the unknown. Forests often symbolize the unconscious—what is hidden but waiting to be discovered.',
      prompt: 'What part of you trusts the dark places in your life?',
      closing: 'Your subconscious is speaking to you with beauty and clarity. Trust what emerges.'
    }
  },
  {
    id: 'emotional-processing',
    name: 'Emotional Processing',
    icon: '💓',
    mode: 'emotional',
    entry: `I'm overwhelmed. It feels like a tidal wave—emotions larger than what I can hold right now. I need an anchor but I don't know where to find one.`,
    expectedReflection: {
      symbols: ['tidal wave', 'anchor'],
      archetypes: ['Healer'],
      emotionalTone: 'overwhelm',
      reflection: 'This feels like a tidal wave—emotions larger than what you can hold right now. It makes sense that you\'re seeking an anchor.',
      prompt: 'What would help you feel even 1% safer in this moment?',
      closing: 'Your emotions are valid and worthy of compassion. You don\'t have to carry this alone.'
    }
  },
  {
    id: 'free-expression',
    name: 'Free Expression',
    icon: '🌀',
    mode: 'free',
    entry: `Something's shifting. I can feel it in my body, in how I move through my days. There's less resistance. More flow. Like I'm finally letting the river carry me instead of fighting against it.`,
    expectedReflection: {
      symbols: ['river', 'flow'],
      archetypes: ['Seeker', 'Explorer'],
      emotionalTone: 'anticipation',
      reflection: "There's a softness emerging in your words—like something is releasing in you. The river you mention echoes a need to flow, to release control.",
      prompt: 'What would it mean to trust where the current is taking you?',
      closing: 'Your courage in exploring this moment is beautiful. I\'m here with you.'
    }
  },
  {
    id: 'life-direction',
    name: 'Life Direction',
    icon: '🧭',
    mode: 'direction',
    entry: `I'm standing at a crossroads. Two paths, both valid, both calling. One feels safe and known. The other feels like stepping into the unknown—but also more alive. How do I choose?`,
    expectedReflection: {
      symbols: ['crossroads', 'path'],
      archetypes: ['Seeker', 'Sage'],
      emotionalTone: 'uncertainty',
      reflection: "You're standing at a crossroads, and the uncertainty feels heavy. But the compass you mentioned suggests there's something guiding you, even if you can't see the full path yet.",
      prompt: 'If you trusted your deepest knowing right now, what direction would you take?',
      closing: 'The path reveals itself one step at a time. Your intuition is wiser than you think.'
    }
  }
];

export default function DemoMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState<DemoFlow | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playDemo = async (demo: DemoFlow) => {
    setActiveDemo(demo);
    setIsPlaying(true);

    window.dispatchEvent(new CustomEvent('demo:load', {
      detail: {
        mode: demo.mode,
        entry: demo.entry,
        reflection: demo.expectedReflection
      }
    }));

    setTimeout(() => {
      setIsPlaying(false);
      setIsOpen(false);
    }, 2000);
  };

  const isDemoMode = typeof window !== 'undefined' &&
    (window.location.search.includes('demo=true') ||
     localStorage.getItem('demo_mode') === 'true');

  if (!isDemoMode) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-40 flex items-center gap-2 rounded-lg border border-[#FFD700]/30 bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] px-4 py-2 text-sm font-medium text-[#FFD700] shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-[#FFD700]/25"
      >
        <Zap className="h-4 w-4" />
        Demo Mode
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-6 top-20 z-50 w-full max-w-md"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#FFD700]/30 bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent" />

                <div className="relative">
                  <div className="flex items-center justify-between border-b border-[#FFD700]/20 p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#FFD700]" />
                      <h3 className="font-semibold text-white">Demo Flows</h3>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-[70vh] space-y-2 overflow-y-auto p-4">
                    {DEMO_FLOWS.map((demo) => (
                      <button
                        key={demo.id}
                        onClick={() => playDemo(demo)}
                        disabled={isPlaying}
                        className="group relative w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 text-left transition-all hover:border-[#FFD700]/30 hover:bg-neutral-800/50 disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{demo.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-white">{demo.name}</div>
                            <div className="text-xs text-neutral-400 capitalize">{demo.mode} mode</div>
                          </div>
                          <Play className="h-4 w-4 text-[#FFD700] opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>

                        <div className="mt-3 text-xs text-neutral-400 line-clamp-2">
                          {demo.entry}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#FFD700]/20 p-4">
                    <p className="text-xs text-neutral-400">
                      Click any flow to load it into the journal with a pre-generated reflection.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function enableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo_mode', 'true');
    window.location.search = '?demo=true';
  }
}

export function disableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo_mode');
    window.location.search = '';
  }
}