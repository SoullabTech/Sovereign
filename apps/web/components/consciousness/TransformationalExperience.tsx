'use client';

/**
 * Transformational Experience Design for MAIA
 *
 * Well-placed, easily activated transformational elements
 * Inspired by Tolan's contextual wisdom approach
 * Integrates seamlessly with existing MAIA interface
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Eye, Compass, Sparkles, CircleDot } from 'lucide-react';

interface TransformationalState {
  presence: 'shallow' | 'centered' | 'deep';
  inquiry: 'surface' | 'exploring' | 'profound';
  integration: 'scattered' | 'connecting' | 'unified';
  evolution: 'static' | 'shifting' | 'transforming';
}

interface TransformationalExperienceProps {
  currentMode: 'normal' | 'patient' | 'session';
  onWisdomPrompt?: (prompt: string) => void;
  className?: string;
}

export function TransformationalExperience({
  currentMode,
  onWisdomPrompt,
  className = ''
}: TransformationalExperienceProps) {
  const [currentState, setCurrentState] = useState<TransformationalState>({
    presence: 'centered',
    inquiry: 'exploring',
    integration: 'connecting',
    evolution: 'shifting'
  });

  const [activeWisdom, setActiveWisdom] = useState<string | null>(null);
  const [showPresenceCue, setShowPresenceCue] = useState(false);

  // Contextual wisdom prompts based on current mode and state
  const getContextualPrompts = () => {
    const basePrompts = {
      normal: [
        "What wants to emerge through this conversation?",
        "Where do you feel most alive in this moment?",
        "What wisdom is your experience offering you?",
        "How is this conversation changing you?"
      ],
      patient: [
        "What does your body want you to know right now?",
        "Where do you feel safety in this moment?",
        "What would self-compassion sound like here?",
        "How can you honor what you're experiencing?"
      ],
      session: [
        "What patterns are revealing themselves?",
        "Where is the medicine in this story?",
        "What wants to be witnessed here?",
        "How is this moment teaching you?"
      ]
    };

    return basePrompts[currentMode];
  };

  // Presence pulse - subtle environmental feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPresenceCue(true);
      setTimeout(() => setShowPresenceCue(false), 2000);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const transformationalElements = [
    {
      id: 'presence',
      icon: Heart,
      label: 'Presence',
      color: 'rose',
      state: currentState.presence,
      description: 'Deepen your awareness of this moment'
    },
    {
      id: 'inquiry',
      icon: Brain,
      label: 'Inquiry',
      color: 'blue',
      state: currentState.inquiry,
      description: 'Explore what wants to be discovered'
    },
    {
      id: 'integration',
      icon: Eye,
      label: 'Integration',
      color: 'amber',
      state: currentState.integration,
      description: 'Connect insights into wisdom'
    },
    {
      id: 'evolution',
      icon: Compass,
      label: 'Evolution',
      color: 'emerald',
      state: currentState.evolution,
      description: 'Track your transformational journey'
    }
  ];

  const handleWisdomActivation = (elementId: string) => {
    const prompts = getContextualPrompts();
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    setActiveWisdom(elementId);
    onWisdomPrompt?.(randomPrompt);

    setTimeout(() => setActiveWisdom(null), 3000);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Transformational State Bar - Integrated with existing design */}
      <div className="flex items-center justify-center gap-1 px-3 py-2
                      bg-black/10 rounded-lg border border-amber-900/20
                      backdrop-blur-sm">

        {transformationalElements.map((element, index) => {
          const Icon = element.icon;
          const isActive = activeWisdom === element.id;

          return (
            <motion.button
              key={element.id}
              onClick={() => handleWisdomActivation(element.id)}
              className={`relative flex items-center gap-1.5 px-2 py-1 rounded-md
                         text-xs font-light transition-all duration-300
                         ${isActive
                           ? `bg-${element.color}-500/20 text-${element.color}-300 border border-${element.color}-500/30`
                           : 'text-amber-400/60 hover:text-amber-300/80 hover:bg-amber-500/10'
                         }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={element.description}
            >
              <Icon className="w-3 h-3" />
              <span>{element.label}</span>

              {/* State indicator */}
              <div className={`w-1.5 h-1.5 rounded-full ${
                element.state === 'deep' || element.state === 'profound' || element.state === 'unified' || element.state === 'transforming'
                  ? 'bg-green-400'
                  : element.state === 'centered' || element.state === 'exploring' || element.state === 'connecting' || element.state === 'shifting'
                  ? 'bg-yellow-400'
                  : 'bg-gray-500'
              }`} />

              {/* Activation pulse */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 rounded-md border-2 border-${element.color}-400`}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Presence Cue - Subtle breathing reminder */}
      <AnimatePresence>
        {showPresenceCue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2
                       w-4 h-4 rounded-full border-2 border-rose-400/40"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full rounded-full bg-rose-400/20"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journey Anchor - Connection to wisdom dashboard */}
      <motion.div
        className="absolute -right-8 top-1/2 -translate-y-1/2"
        whileHover={{ scale: 1.1 }}
      >
        <button
          className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20
                     border border-amber-500/30 flex items-center justify-center
                     text-amber-400 hover:text-amber-300 transition-colors"
          title="View your transformational patterns"
        >
          <CircleDot className="w-3 h-3" />
        </button>
      </motion.div>
    </div>
  );
}

// Transformational Context Provider - for deeper integration
export function useTransformationalContext() {
  const [currentDepth, setCurrentDepth] = useState<'surface' | 'exploring' | 'deep'>('exploring');
  const [journeyMoments, setJourneyMoments] = useState<string[]>([]);

  const addJourneyMoment = (moment: string) => {
    setJourneyMoments(prev => [...prev, moment]);
  };

  const assessCurrentDepth = (conversationContext: string) => {
    // Simple heuristic - could be enhanced with AI analysis
    const depthIndicators = ['feel', 'sense', 'aware', 'notice', 'discover', 'transform', 'evolve'];
    const matches = depthIndicators.filter(indicator =>
      conversationContext.toLowerCase().includes(indicator)
    ).length;

    if (matches >= 3) setCurrentDepth('deep');
    else if (matches >= 1) setCurrentDepth('exploring');
    else setCurrentDepth('surface');
  };

  return {
    currentDepth,
    journeyMoments,
    addJourneyMoment,
    assessCurrentDepth
  };
}