'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

interface BetaTestWrapperProps {
  children: React.ReactNode;
  messageCount: number;
  userId?: string;
}

type FeedbackPhase = 'initial' | 'expanded' | 'submitted';

export default function BetaTestWrapper({ 
  children, 
  messageCount,
  userId = 'anonymous'
}: BetaTestWrapperProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackPhase, setFeedbackPhase] = useState<FeedbackPhase>('initial');
  const [quickReflection, setQuickReflection] = useState('');
  const [expandedFeedback, setExpandedFeedback] = useState({
    feeling: '',
    clarity: 5,
    wouldReturn: '',
    suggestion: ''
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Show feedback after 5 messages
  useEffect(() => {
    if (messageCount >= 5 && !showFeedback && !hasSubmitted) {
      const timer = setTimeout(() => setShowFeedback(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [messageCount, showFeedback, hasSubmitted]);

  // Submit feedback to Supabase or analytics
  const submitFeedback = useCallback(async () => {
    const feedback = {
      userId,
      timestamp: new Date().toISOString(),
      messageCount,
      quickReflection,
      ...(feedbackPhase === 'expanded' ? expandedFeedback : {})
    };

    try {
      // Send to your backend
      await fetch('/api/beta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      setFeedbackPhase('submitted');
      setHasSubmitted(true);
      
      // Hide after success message
      setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }, [userId, messageCount, quickReflection, expandedFeedback, feedbackPhase]);

  // Minimize feedback
  const minimizeFeedback = () => {
    setShowFeedback(false);
    // Show again after 10 more messages
    setTimeout(() => {
      if (messageCount >= 15 && !hasSubmitted) {
        setShowFeedback(true);
      }
    }, 600000); // 10 minutes
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Main content (Mirror) */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Feedback panel */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.23, 1, 0.32, 1] // Smooth easing
            }}
            className="absolute bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-gradient-to-b from-white/95 to-white dark:from-neutral-900/95 dark:to-neutral-900 
                          backdrop-blur-xl border-t border-amber-200/30 dark:border-amber-800/30 
                          rounded-t-3xl shadow-2xl">
              
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
              </div>

              <div className="px-6 pb-6 pt-2">
                {/* Header with minimize */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
                      {feedbackPhase === 'submitted' 
                        ? '🙏 Thank you' 
                        : '✨ Quick Reflection'}
                    </h3>
                    {feedbackPhase !== 'submitted' && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Your insights shape Maia&apos;s evolution
                      </p>
                    )}
                  </div>
                  <button
                    onClick={minimizeFeedback}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    aria-label="Minimize"
                  >
                    <X className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>

                {/* Content based on phase */}
                {feedbackPhase === 'initial' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      What word or feeling comes up after speaking with Maia?
                    </p>
                    <textarea
                      value={quickReflection}
                      onChange={(e) => setQuickReflection(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700
                               bg-white/70 dark:bg-neutral-800/70 text-sm resize-none
                               focus:outline-none focus:ring-2 focus:ring-amber-400/50
                               placeholder-neutral-400 dark:placeholder-neutral-500"
                      rows={2}
                      placeholder="A word, phrase, or brief feeling..."
                    />
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setFeedbackPhase('expanded')}
                        className="text-sm text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        Share more detail
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      <button
                        onClick={submitFeedback}
                        disabled={!quickReflection.trim()}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 
                                 text-white text-sm font-medium hover:scale-105 transition
                                 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        Submit
                      </button>
                    </div>
                  </motion.div>
                )}

                {feedbackPhase === 'expanded' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    {/* Feeling scale */}
                    <div>
                      <label className="text-sm text-neutral-600 dark:text-neutral-400 block mb-2">
                        How clear did Maia&apos;s responses feel?
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => setExpandedFeedback(prev => ({ ...prev, clarity: val }))}
                            className={`flex-1 py-2 rounded-lg text-sm transition
                              ${expandedFeedback.clarity === val
                                ? 'bg-amber-500 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                              }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500 mt-1">
                        <span>Unclear</span>
                        <span>Crystal clear</span>
                      </div>
                    </div>

                    {/* Would return */}
                    <div>
                      <label className="text-sm text-neutral-600 dark:text-neutral-400 block mb-2">
                        Would you return to speak with Maia?
                      </label>
                      <div className="flex gap-2">
                        {['Yes', 'Maybe', 'No'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setExpandedFeedback(prev => ({ ...prev, wouldReturn: option }))}
                            className={`flex-1 py-2 rounded-lg text-sm transition
                              ${expandedFeedback.wouldReturn === option
                                ? 'bg-amber-500 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                              }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Suggestion */}
                    <div>
                      <label className="text-sm text-neutral-600 dark:text-neutral-400 block mb-2">
                        Any suggestions? (optional)
                      </label>
                      <textarea
                        value={expandedFeedback.suggestion}
                        onChange={(e) => setExpandedFeedback(prev => ({ ...prev, suggestion: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700
                                 bg-white/70 dark:bg-neutral-800/70 text-sm resize-none
                                 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                        rows={2}
                        placeholder="What would make this experience better?"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setFeedbackPhase('initial')}
                        className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 
                                 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={submitFeedback}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 
                                 text-white text-sm font-medium hover:scale-105 transition"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </motion.div>
                )}

                {feedbackPhase === 'submitted' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Your reflection has been received
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle beta indicator (always visible) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute top-4 right-4 z-40"
      >
        <div className="px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-900/30 
                      backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/50">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Beta
          </span>
        </div>
      </motion.div>
    </div>
  );
}