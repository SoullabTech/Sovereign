import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star, ChevronRight } from 'lucide-react';

interface ConsciousnessComputingPromptProps {
  messageCount: number;
}

export function ConsciousnessComputingPrompt({ messageCount }: ConsciousnessComputingPromptProps) {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPioneer, setIsPioneer] = useState(false);

  useEffect(() => {
    const pioneerStatus = sessionStorage.getItem('consciousness_computing_pioneer');
    setIsPioneer(!!pioneerStatus);

    // Show feedback prompt after 3+ exchanges for pioneers
    if (pioneerStatus && messageCount >= 6) { // 6 messages = 3 exchanges
      setShowPrompt(true);
    }
  }, [messageCount]);

  const handleFeedbackRedirect = () => {
    router.push('/maia/consciousness-computing/feedback');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again this session
    sessionStorage.setItem('feedback_prompt_dismissed', 'true');
  };

  if (!isPioneer || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <div className="bg-gradient-to-br from-[#A0C4C7] to-[#6EE7B7] text-black rounded-2xl p-5 shadow-2xl border border-white/30">

          {/* Pioneer Badge */}
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-black/70" fill="currentColor" />
            <span className="text-xs font-medium uppercase tracking-wide text-black/70">
              Consciousness Computing Pioneer
            </span>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="font-medium text-black">
              How did MAIA's consciousness detection feel?
            </h3>

            <p className="text-sm text-black/80 leading-relaxed">
              You've experienced live consciousness computing. Your feedback helps us refine this technology for humanity.
            </p>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <motion.button
                onClick={handleFeedbackRedirect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-black/10 hover:bg-black/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span>Share Feedback</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              <button
                onClick={handleDismiss}
                className="text-sm text-black/60 hover:text-black/80 px-3 py-2 transition-colors"
              >
                Later
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}