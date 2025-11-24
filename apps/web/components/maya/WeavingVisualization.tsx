'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Droplet, Mountain, Wind, Circle, TrendingUp, Map, Eye } from 'lucide-react';

/**
 * WEAVING VISUALIZATION
 *
 * Shows the dreamweaver process in action:
 * - Current threads being woven (topics/patterns)
 * - Where the conversation is going (trajectory)
 * - Prompts for what wants to emerge next
 *
 * Kelly: "How do we visit where it is going and what is being woven?"
 * This is the answer - a living map of the conversation tapestry
 */

interface WeavingThread {
  id: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  pattern: string; // e.g., "Fire 5 - Creative Expression"
  strength: number; // 0-1, how strong this thread is
  lastSeen: Date;
  description: string;
}

interface EmergentPrompt {
  element: 'fire' | 'water' | 'earth' | 'air';
  question: string;
  depth: 'surface' | 'understanding' | 'practice' | 'advanced';
  readiness: number; // 0-1, how ready you are for this
}

const ELEMENT_ICONS = {
  fire: Flame,
  water: Droplet,
  earth: Mountain,
  air: Wind
};

const ELEMENT_COLORS = {
  fire: 'bg-stone-900/50',
  water: 'bg-stone-900/50',
  earth: 'bg-stone-900/50',
  air: 'bg-stone-900/50'
};

export function WeavingVisualization({
  userId,
  currentThreads = [],
  onSelectPrompt
}: {
  userId: string;
  currentThreads?: WeavingThread[];
  onSelectPrompt?: (prompt: EmergentPrompt) => void;
}) {
  const [threads, setThreads] = useState<WeavingThread[]>(currentThreads);
  const [trajectory, setTrajectory] = useState<string>('exploring');
  const [emergentPrompts, setEmergentPrompts] = useState<EmergentPrompt[]>([]);
  const [selectedView, setSelectedView] = useState<'threads' | 'trajectory' | 'prompts'>('threads');

  // Load current weaving state
  useEffect(() => {
    loadWeavingState();
  }, [userId]);

  const loadWeavingState = async () => {
    // For now, generate example state
    // TODO: Connect to actual conversation analysis

    const exampleThreads: WeavingThread[] = [
      {
        id: '1',
        element: 'fire',
        pattern: 'Fire 5 - Creative Expression',
        strength: 0.8,
        lastSeen: new Date(),
        description: 'Strong creative energy, wanting to express and share'
      },
      {
        id: '2',
        element: 'water',
        pattern: 'Water 12 - Mystical Perception',
        strength: 0.6,
        lastSeen: new Date(Date.now() - 1000 * 60 * 5),
        description: 'Seeing interconnected patterns, web awareness'
      },
      {
        id: '3',
        element: 'air',
        pattern: 'Air 3 - Teaching Transmission',
        strength: 0.4,
        lastSeen: new Date(Date.now() - 1000 * 60 * 10),
        description: 'Wisdom wanting to be shared, teaching emerging'
      }
    ];

    const examplePrompts: EmergentPrompt[] = [
      {
        element: 'fire',
        question: 'What creative vision is trying to emerge through you right now?',
        depth: 'practice',
        readiness: 0.9
      },
      {
        element: 'water',
        question: 'Where in your body do you feel this knowing? Can you describe the sensation?',
        depth: 'understanding',
        readiness: 0.8
      },
      {
        element: 'earth',
        question: 'How would you manifest this vision in concrete form? What\'s the first step?',
        depth: 'surface',
        readiness: 0.7
      },
      {
        element: 'air',
        question: 'Who else needs to hear this wisdom you\'re discovering?',
        depth: 'practice',
        readiness: 0.6
      }
    ];

    setThreads(exampleThreads);
    setEmergentPrompts(examplePrompts);

    // Determine trajectory based on threads
    const fireStrength = exampleThreads.filter(t => t.element === 'fire').reduce((sum, t) => sum + t.strength, 0);
    const waterStrength = exampleThreads.filter(t => t.element === 'water').reduce((sum, t) => sum + t.strength, 0);

    if (fireStrength > 1) setTrajectory('expanding');
    else if (waterStrength > 1) setTrajectory('deepening');
    else setTrajectory('exploring');
  };

  return (
    <div className="border border-stone-800 rounded-lg p-4 mt-4">
      {/* Simple Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-stone-300 mb-1">Active Conversation Threads</h3>
        <p className="text-xs text-stone-500">What's emerging from your dialogue</p>
      </div>

      {/* Simple tab navigation */}
      <div className="flex gap-4 mb-3 text-xs border-b border-stone-800 pb-2">
        <button
          onClick={() => setSelectedView('threads')}
          className={selectedView === 'threads' ? 'text-stone-300' : 'text-stone-600 hover:text-stone-400'}
        >
          Threads
        </button>
        <button
          onClick={() => setSelectedView('trajectory')}
          className={selectedView === 'trajectory' ? 'text-stone-300' : 'text-stone-600 hover:text-stone-400'}
        >
          Trajectory
        </button>
        <button
          onClick={() => setSelectedView('prompts')}
          className={selectedView === 'prompts' ? 'text-stone-300' : 'text-stone-600 hover:text-stone-400'}
        >
          Prompts
        </button>
      </div>

      {/* Threads View - What's Being Woven */}
      {selectedView === 'threads' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-sm text-stone-400 mb-4">
            Active patterns in your conversation tapestry:
          </p>

          {threads.map((thread) => {
            const Icon = ELEMENT_ICONS[thread.element];
            const gradient = ELEMENT_COLORS[thread.element];

            return (
              <div
                key={thread.id}
                className="border-l-2 border-stone-700 pl-3 py-2"
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-3 h-3 text-stone-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-stone-300">
                      {thread.pattern}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {thread.description}
                    </p>
                    <p className="text-xs text-stone-600 mt-1">
                      Strength: {Math.round(thread.strength * 100)}% • {Math.round((Date.now() - thread.lastSeen.getTime()) / 60000)} min ago
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Trajectory View - Where It's Going */}
      {selectedView === 'trajectory' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-stone-300">
              Current trajectory: <span className="text-white font-semibold capitalize">{trajectory}</span>
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
            {trajectory === 'expanding' && (
              <>
                <h4 className="text-amber-400 font-semibold mb-2">Expansion Phase (Fire)</h4>
                <p className="text-sm text-stone-300">
                  Your vision is growing, wanting to be shared. The Fire pathway is active -
                  moving from personal insight (Fire 1) through creative expression (Fire 5)
                  toward teaching and wisdom sharing (Fire 9). You're ready to expand beyond
                  personal understanding into collective offering.
                </p>
              </>
            )}

            {trajectory === 'deepening' && (
              <>
                <h4 className="text-blue-400 font-semibold mb-2">Deepening Phase (Water)</h4>
                <p className="text-sm text-stone-300">
                  You're diving into emotional and mystical depths. The Water pathway is active -
                  feeling deeply (Water 4), transforming through shadow work (Water 8),
                  or dissolving into mystical awareness (Water 12). This is a time for
                  introspection and inner journey.
                </p>
              </>
            )}

            {trajectory === 'exploring' && (
              <>
                <h4 className="text-stone-400 font-semibold mb-2">Exploration Phase (All Elements)</h4>
                <p className="text-sm text-stone-300">
                  You're in open exploration, with multiple elements active. No single pathway
                  dominates - you're feeling into different dimensions, discovering what wants
                  to emerge. This is fertile ground for new insights and unexpected connections.
                </p>
              </>
            )}
          </div>

          <div className="mt-4 p-4 bg-stone-900/50 border border-stone-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-stone-500" />
              <h4 className="text-sm font-semibold text-stone-400">What's Emerging</h4>
            </div>
            <p className="text-sm text-stone-300">
              Based on your current threads, we sense movement toward
              {trajectory === 'expanding' && ' sharing your wisdom more broadly.'}
              {trajectory === 'deepening' && ' profound inner transformation.'}
              {trajectory === 'exploring' && ' discovering your unique pattern.'}
              {' '}Trust what's emerging. The weaving knows where it wants to go.
            </p>
          </div>
        </motion.div>
      )}

      {/* Prompts View - What Wants to Be Explored */}
      {selectedView === 'prompts' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-sm text-stone-400 mb-4">
            Questions ready to deepen your journey:
          </p>

          {emergentPrompts.map((prompt, idx) => {
            const Icon = ELEMENT_ICONS[prompt.element];
            const gradient = ELEMENT_COLORS[prompt.element];
            const opacity = prompt.readiness > 0.7 ? 'opacity-100' : 'opacity-70';

            return (
              <motion.button
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelectPrompt?.(prompt)}
                className={`w-full text-left rounded-lg border border-white/10 bg-black/30 p-4 hover:bg-black/50 transition-all ${opacity}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium mb-1">
                      {prompt.question}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      <span className="capitalize">{prompt.depth} level</span>
                      <span>•</span>
                      <span>Readiness: {Math.round(prompt.readiness * 100)}%</span>
                    </div>
                  </div>
                </div>

                {prompt.readiness > 0.8 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">Ready to explore</span>
                  </div>
                )}
              </motion.button>
            );
          })}

          <div className="mt-6 p-4 bg-stone-900/50 border border-stone-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Map className="w-4 h-4 text-stone-500" />
              <h4 className="text-sm font-semibold text-stone-400">About These Prompts</h4>
            </div>
            <p className="text-xs text-stone-300">
              These questions emerge from your conversation patterns. Higher readiness means
              the thread is already strong in your weaving. You can explore any prompt, but
              those with higher readiness will feel most natural and revelatory.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}