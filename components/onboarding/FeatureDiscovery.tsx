'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Mic, TrendingUp, Search, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeatureUnlock {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
  unlockCondition: () => boolean;
}

const FEATURE_UNLOCKS: FeatureUnlock[] = [
  {
    id: 'first-entry',
    title: 'Your Journey Begins',
    description: 'Your first reflection is saved. MAIA is learning your symbolic language.',
    icon: <Sparkles className="w-6 h-6" />,
    unlockCondition: () => true // Always shown after first entry
  },
  {
    id: 'timeline-unlock',
    title: 'Timeline View Available',
    description: "You've journaled 3 times. Patterns are emerging. See your journey visually.",
    icon: <TrendingUp className="w-6 h-6" />,
    action: {
      label: 'View Timeline',
      href: '/journal/timeline'
    },
    unlockCondition: () => {
      if (typeof window !== 'undefined') {
        const entryCount = parseInt(localStorage.getItem('journal_entry_count') || '0');
        return entryCount >= 3;
      }
      return false;
    }
  },
  {
    id: 'voice-unlock',
    title: 'Voice Journaling Unlocked',
    description: 'You can now speak your reflections. MAIA will transcribe and understand.',
    icon: <Mic className="w-6 h-6" />,
    action: {
      label: 'Try Voice Mode',
      href: '/journal/voice'
    },
    unlockCondition: () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('voice_used') === 'true';
      }
      return false;
    }
  },
  {
    id: 'search-unlock',
    title: 'Semantic Search Available',
    description: 'Ask MAIA about your journey. "Have I written about transformation?"',
    icon: <Search className="w-6 h-6" />,
    action: {
      label: 'Try Search',
      href: '/journal/search'
    },
    unlockCondition: () => {
      if (typeof window !== 'undefined') {
        const entryCount = parseInt(localStorage.getItem('journal_entry_count') || '0');
        return entryCount >= 5;
      }
      return false;
    }
  },
  {
    id: 'shadow-work',
    title: 'Shadow Work Journey',
    description: 'A courageous step into depth. MAIA holds space for what emerges.',
    icon: <BookOpen className="w-6 h-6" />,
    unlockCondition: () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('shadow_work_unlocked') === 'true';
      }
      return false;
    }
  }
];

export default function FeatureDiscovery() {
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([]);
  const [activeNotification, setActiveNotification] = useState<FeatureUnlock | null>(null);
  const [dismissedFeatures, setDismissedFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = JSON.parse(localStorage.getItem('dismissed_features') || '[]');
    setDismissedFeatures(dismissed);

    const unlocked = JSON.parse(localStorage.getItem('unlocked_features') || '[]');
    setUnlockedFeatures(unlocked);

    const checkUnlocks = () => {
      FEATURE_UNLOCKS.forEach(feature => {
        if (
          !unlocked.includes(feature.id) &&
          !dismissed.includes(feature.id) &&
          feature.unlockCondition()
        ) {
          const newUnlocked = [...unlocked, feature.id];
          localStorage.setItem('unlocked_features', JSON.stringify(newUnlocked));
          setUnlockedFeatures(newUnlocked);
          setActiveNotification(feature);
          celebrate();
        }
      });
    };

    checkUnlocks();

    const interval = setInterval(checkUnlocks, 3000);
    return () => clearInterval(interval);
  }, []);

  const celebrate = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FFB800'];

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

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  };

  const handleDismiss = () => {
    if (activeNotification) {
      const newDismissed = [...dismissedFeatures, activeNotification.id];
      localStorage.setItem('dismissed_features', JSON.stringify(newDismissed));
      setDismissedFeatures(newDismissed);
      setActiveNotification(null);
    }
  };

  const handleAction = () => {
    handleDismiss();
    if (activeNotification?.action) {
      window.location.href = activeNotification.action.href;
    }
  };

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#FFD700]/30 bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] p-6 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent" />

            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FFD700]/10 blur-3xl"
            />

            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600 text-[#0A0E27]">
                  {activeNotification.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {activeNotification.title}
                  </h3>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-neutral-300">
                {activeNotification.description}
              </p>

              <div className="flex gap-3">
                {activeNotification.action && (
                  <button
                    onClick={handleAction}
                    className="flex-1 rounded-lg bg-gradient-to-r from-[#FFD700] to-amber-600 px-4 py-2 text-sm font-medium text-[#0A0E27] transition-all hover:shadow-lg hover:shadow-[#FFD700]/25"
                  >
                    {activeNotification.action.label}
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
                >
                  {activeNotification.action ? 'Later' : 'Dismiss'}
                </button>
              </div>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FFD700] to-amber-600"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10, ease: 'linear' }}
              onAnimationComplete={handleDismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function trackJournalEntry() {
  if (typeof window === 'undefined') return;

  const count = parseInt(localStorage.getItem('journal_entry_count') || '0');
  localStorage.setItem('journal_entry_count', (count + 1).toString());
}

export function trackVoiceUsage() {
  if (typeof window === 'undefined') return;

  localStorage.setItem('voice_used', 'true');
}

export function trackShadowWork() {
  if (typeof window === 'undefined') return;

  localStorage.setItem('shadow_work_unlocked', 'true');
}