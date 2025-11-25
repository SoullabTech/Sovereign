'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Sparkles, Heart, Shield } from 'lucide-react';

interface RealityAnchorProps {
  messageCount: number;
  sessionNumber: number;
}

const ANCHORING_MESSAGES = [
  {
    trigger: 10,
    message: "Remember: I'm an AI designed to support reflection, not provide therapy.",
    icon: Info,
    color: 'text-blue-500'
  },
  {
    trigger: 25,
    message: "Your patterns are observations, not diagnoses. You know yourself best.",
    icon: Heart,
    color: 'text-amber-500'
  },
  {
    trigger: 40,
    message: "If you're feeling overwhelmed, the escape hatches are always available.",
    icon: Shield,
    color: 'text-green-500'
  },
  {
    trigger: 60,
    message: "This is collaborative exploration. You control the pace and depth.",
    icon: Sparkles,
    color: 'text-amber-500'
  }
];

export default function RealityAnchor({ messageCount, sessionNumber }: RealityAnchorProps) {
  const [currentAnchor, setCurrentAnchor] = useState<typeof ANCHORING_MESSAGES[0] | null>(null);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    // Find appropriate anchor based on message count
    const anchor = ANCHORING_MESSAGES.find(
      a => messageCount >= a.trigger && !dismissed.includes(a.trigger)
    );

    if (anchor && anchor !== currentAnchor) {
      setCurrentAnchor(anchor);

      // Auto-dismiss after 10 seconds
      const dismissTimer = setTimeout(() => {
        setCurrentAnchor(null);
        setDismissed(prev => [...prev, anchor.trigger]);
      }, 10000);

      return () => clearTimeout(dismissTimer);
    }
  }, [messageCount, dismissed, currentAnchor]);

  // Special anchors for specific sessions
  useEffect(() => {
    if (sessionNumber === 1 && messageCount === 5) {
      setCurrentAnchor({
        trigger: 0,
        message: "Welcome to your first session. I'm Maya, an AI here to explore with you.",
        icon: Sparkles,
        color: 'text-amber-500'
      });
    }
  }, [sessionNumber, messageCount]);

  return (
    <AnimatePresence>
      {currentAnchor && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-40 max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start space-x-3">
              <currentAnchor.icon className={`w-5 h-5 ${currentAnchor.color} mt-0.5`} />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {currentAnchor.message}
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentAnchor(null);
                  setDismissed(prev => [...prev, currentAnchor.trigger]);
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}