'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy } from '@/lib/copy/MaiaCopy';
import { Sparkles, BookOpen, TrendingUp, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

type Milestone = 'firstEntry' | 'threeEntries' | 'voiceEntry' | 'tenEntries';

interface ProgressiveDiscoveryProps {
  userId: string;
}

interface UserProgress {
  totalEntries: number;
  hasUsedVoice: boolean;
  milestonesReached: Milestone[];
  featuresUnlocked: string[];
  lastCelebration?: string;
}

/**
 * Progressive Discovery System
 * Implements "Reveal, Don't Overwhelm" - celebrates milestones and unlocks features gradually
 */
export default function ProgressiveDiscovery({ userId }: ProgressiveDiscoveryProps) {
  const [progress, setProgress] = useState<UserProgress>({
    totalEntries: 0,
    hasUsedVoice: false,
    milestonesReached: [],
    featuresUnlocked: [],
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    loadProgress();

    // Listen for journal entry events
    const handleEntryCreated = () => checkMilestones(progress.totalEntries + 1, progress.hasUsedVoice);
    const handleVoiceUsed = () => checkMilestones(progress.totalEntries, true);

    window.addEventListener('journal:created', handleEntryCreated);
    window.addEventListener('voice:used', handleVoiceUsed);

    return () => {
      window.removeEventListener('journal:created', handleEntryCreated);
      window.removeEventListener('voice:used', handleVoiceUsed);
    };
  }, []);

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(`maia_progress_${userId}`);
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = (newProgress: UserProgress) => {
    try {
      localStorage.setItem(`maia_progress_${userId}`, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const checkMilestones = (entryCount: number, voiceUsed: boolean) => {
    const newProgress = { ...progress, totalEntries: entryCount, hasUsedVoice: voiceUsed };
    let milestoneReached: Milestone | null = null;

    // Check each milestone
    if (entryCount === 1 && !progress.milestonesReached.includes('firstEntry')) {
      milestoneReached = 'firstEntry';
    } else if (entryCount === 3 && !progress.milestonesReached.includes('threeEntries')) {
      milestoneReached = 'threeEntries';
      newProgress.featuresUnlocked.push('timeline');
    } else if (voiceUsed && !progress.milestonesReached.includes('voiceEntry')) {
      milestoneReached = 'voiceEntry';
      newProgress.featuresUnlocked.push('voice');
    } else if (entryCount === 10 && !progress.milestonesReached.includes('tenEntries')) {
      milestoneReached = 'tenEntries';
      newProgress.featuresUnlocked.push('search');
    }

    if (milestoneReached) {
      newProgress.milestonesReached.push(milestoneReached);
      newProgress.lastCelebration = new Date().toISOString();
      saveProgress(newProgress);
      celebrate(milestoneReached);
    }
  };

  const celebrate = (milestone: Milestone) => {
    setCurrentMilestone(milestone);
    setShowCelebration(true);

    // Confetti animation
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Auto-dismiss after 5s
    setTimeout(() => {
      setShowCelebration(false);
      setCurrentMilestone(null);
    }, 5000);
  };

  const getMilestoneIcon = (milestone: Milestone) => {
    switch (milestone) {
      case 'firstEntry':
        return <Sparkles className="w-12 h-12" />;
      case 'threeEntries':
        return <TrendingUp className="w-12 h-12" />;
      case 'voiceEntry':
        return <span className="text-6xl">🎙️</span>;
      case 'tenEntries':
        return <Search className="w-12 h-12" />;
    }
  };

  const getMilestoneMessage = (milestone: Milestone) => {
    return Copy.milestones[milestone];
  };

  const getMilestoneFeature = (milestone: Milestone) => {
    switch (milestone) {
      case 'threeEntries':
        return {
          title: 'Timeline Unlocked',
          description: 'See how your symbols and themes evolve over time',
          icon: <TrendingUp className="w-6 h-6" />,
        };
      case 'voiceEntry':
        return {
          title: 'Voice Journaling Active',
          description: 'Your spoken words become part of your journey',
          icon: <span className="text-2xl">🎙️</span>,
        };
      case 'tenEntries':
        return {
          title: 'Pattern Search Enabled',
          description: 'Explore connections across all your entries',
          icon: <Search className="w-6 h-6" />,
        };
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {showCelebration && currentMilestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          onClick={() => {
            setShowCelebration(false);
            setCurrentMilestone(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="flex justify-center mb-6 text-indigo-500"
            >
              {getMilestoneIcon(currentMilestone)}
            </motion.div>

            {/* Message */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-3"
            >
              {getMilestoneMessage(currentMilestone)}
            </motion.h2>

            {/* Feature Unlock */}
            {getMilestoneFeature(currentMilestone) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-indigo-600 dark:text-indigo-400">
                    {getMilestoneFeature(currentMilestone)!.icon}
                  </div>
                  <h3 className="font-semibold text-left">
                    {getMilestoneFeature(currentMilestone)!.title}
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-left">
                  {getMilestoneFeature(currentMilestone)!.description}
                </p>
              </motion.div>
            )}

            {/* Dismiss */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => {
                setShowCelebration(false);
                setCurrentMilestone(null);
              }}
              className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Helper functions to trigger milestone checks
 */
export const trackJournalEntry = () => {
  window.dispatchEvent(new Event('journal:created'));
};

export const trackVoiceUsed = () => {
  window.dispatchEvent(new Event('voice:used'));
};

/**
 * Hook to check if features are unlocked
 */
export const useFeatureUnlock = (userId: string, feature: string): boolean => {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`maia_progress_${userId}`);
      if (saved) {
        const progress: UserProgress = JSON.parse(saved);
        setUnlocked(progress.featuresUnlocked.includes(feature));
      }
    } catch (error) {
      console.error('Failed to check feature unlock:', error);
    }
  }, [userId, feature]);

  return unlocked;
};