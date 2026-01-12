'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  MessageCircle,
  Bug,
  Heart,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Send,
  CheckCircle
} from 'lucide-react';

type FeedbackCategory =
  | 'problem'      // Reporting problems/bugs
  | 'challenge'    // Challenges encountered
  | 'strength'     // Things they love
  | 'feature'      // Feature requests
  | 'question';    // Questions about functions

interface FeedbackOption {
  id: FeedbackCategory;
  icon: React.ElementType;
  label: string;
  description: string;
  placeholder: string;
  color: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    id: 'problem',
    icon: Bug,
    label: 'Report a Problem',
    description: 'Something isn\'t working right',
    placeholder: 'Describe what happened and what you expected...',
    color: 'red'
  },
  {
    id: 'challenge',
    icon: AlertTriangle,
    label: 'Share a Challenge',
    description: 'Something is difficult or confusing',
    placeholder: 'What\'s been challenging for you?',
    color: 'amber'
  },
  {
    id: 'strength',
    icon: Heart,
    label: 'Something I Love',
    description: 'A feature or experience that resonates',
    placeholder: 'What\'s working well for you?',
    color: 'pink'
  },
  {
    id: 'feature',
    icon: Lightbulb,
    label: 'Feature Request',
    description: 'Something you wish we had',
    placeholder: 'What would make your experience better?',
    color: 'purple'
  },
  {
    id: 'question',
    icon: HelpCircle,
    label: 'Ask a Question',
    description: 'About how something works',
    placeholder: 'What would you like to know?',
    color: 'blue'
  }
];

type FeedbackSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userId?: string;
};

export default function FeedbackSheet({
  isOpen,
  onClose,
  userName = 'Anonymous',
  userId
}: FeedbackSheetProps) {
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedOption = feedbackOptions.find(opt => opt.id === selectedCategory);

  const handleSubmit = async () => {
    if (!selectedCategory || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          message: message.trim(),
          userName,
          userId,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          // Reset state after close animation
          setTimeout(() => {
            setSelectedCategory(null);
            setMessage('');
            setSubmitted(false);
          }, 300);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setMessage('');
  };

  const handleClose = () => {
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setSelectedCategory(null);
      setMessage('');
      setSubmitted(false);
    }, 300);
  };

  const getColorClasses = (color: string) => ({
    border: `border-${color}-500/20`,
    borderHover: `hover:border-${color}-500/40`,
    bg: `bg-${color}-500/10`,
    bgHover: `hover:bg-${color}-500/15`,
    text: `text-${color}-300`,
    textLight: `text-${color}-100/70`,
    iconBg: `bg-${color}-500/10`,
    iconBorder: `border-${color}-500/20`
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="mx-3 mb-3 rounded-3xl border border-green-500/20 bg-[#0B0B0F]/95 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                    {submitted ? (
                      <CheckCircle className="h-4 w-4 text-green-300" />
                    ) : (
                      <MessageCircle className="h-4 w-4 text-green-300" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-50">
                      {submitted ? 'Thank You!' : selectedCategory ? 'Share Your Feedback' : 'Feedback'}
                    </div>
                    <div className="text-xs text-green-100/70">
                      {submitted
                        ? 'Your feedback helps MAIA grow'
                        : selectedCategory
                          ? selectedOption?.description
                          : 'What would you like to share?'
                      }
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 text-green-200 hover:bg-green-500/15"
                  aria-label="Close feedback"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-5">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30"
                      >
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </motion.div>
                      <p className="mt-4 text-sm text-green-100/80">
                        Your feedback has been received
                      </p>
                    </motion.div>
                  ) : !selectedCategory ? (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 gap-3"
                    >
                      {feedbackOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => setSelectedCategory(option.id)}
                            className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all
                              ${option.color === 'red' ? 'border-red-500/20 bg-red-500/10 hover:bg-red-500/15' : ''}
                              ${option.color === 'amber' ? 'border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15' : ''}
                              ${option.color === 'pink' ? 'border-pink-500/20 bg-pink-500/10 hover:bg-pink-500/15' : ''}
                              ${option.color === 'purple' ? 'border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15' : ''}
                              ${option.color === 'blue' ? 'border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15' : ''}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border bg-black/30
                                ${option.color === 'red' ? 'border-red-500/20' : ''}
                                ${option.color === 'amber' ? 'border-amber-500/20' : ''}
                                ${option.color === 'pink' ? 'border-pink-500/20' : ''}
                                ${option.color === 'purple' ? 'border-purple-500/20' : ''}
                                ${option.color === 'blue' ? 'border-blue-500/20' : ''}
                              `}>
                                <Icon className={`h-4 w-4
                                  ${option.color === 'red' ? 'text-red-300' : ''}
                                  ${option.color === 'amber' ? 'text-amber-300' : ''}
                                  ${option.color === 'pink' ? 'text-pink-300' : ''}
                                  ${option.color === 'purple' ? 'text-purple-300' : ''}
                                  ${option.color === 'blue' ? 'text-blue-300' : ''}
                                `} />
                              </div>
                              <div>
                                <div className={`text-sm font-semibold
                                  ${option.color === 'red' ? 'text-red-50' : ''}
                                  ${option.color === 'amber' ? 'text-amber-50' : ''}
                                  ${option.color === 'pink' ? 'text-pink-50' : ''}
                                  ${option.color === 'purple' ? 'text-purple-50' : ''}
                                  ${option.color === 'blue' ? 'text-blue-50' : ''}
                                `}>
                                  {option.label}
                                </div>
                                <div className={`text-xs
                                  ${option.color === 'red' ? 'text-red-100/70' : ''}
                                  ${option.color === 'amber' ? 'text-amber-100/70' : ''}
                                  ${option.color === 'pink' ? 'text-pink-100/70' : ''}
                                  ${option.color === 'purple' ? 'text-purple-100/70' : ''}
                                  ${option.color === 'blue' ? 'text-blue-100/70' : ''}
                                `}>
                                  {option.description}
                                </div>
                              </div>
                            </div>
                            <div className={`text-xs transition-colors
                              ${option.color === 'red' ? 'text-red-200/70 group-hover:text-red-200' : ''}
                              ${option.color === 'amber' ? 'text-amber-200/70 group-hover:text-amber-200' : ''}
                              ${option.color === 'pink' ? 'text-pink-200/70 group-hover:text-pink-200' : ''}
                              ${option.color === 'purple' ? 'text-purple-200/70 group-hover:text-purple-200' : ''}
                              ${option.color === 'blue' ? 'text-blue-200/70 group-hover:text-blue-200' : ''}
                            `}>
                              →
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Selected category header */}
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-xs text-green-100/70 hover:text-green-100 transition-colors"
                      >
                        ← Back to categories
                      </button>

                      {/* Textarea */}
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={selectedOption?.placeholder}
                        rows={4}
                        className="w-full rounded-2xl border border-green-500/20 bg-black/30 px-4 py-3 text-sm text-green-50 placeholder:text-green-100/40 focus:border-green-500/40 focus:outline-none focus:ring-1 focus:ring-green-500/20 resize-none"
                        autoFocus
                      />

                      {/* Submit button */}
                      <button
                        onClick={handleSubmit}
                        disabled={!message.trim() || isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/20 px-4 py-3 text-sm font-medium text-green-50 transition-all hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="h-4 w-4 border-2 border-green-300/30 border-t-green-300 rounded-full"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Feedback
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-green-100/50">
                        Your feedback helps us make MAIA better for everyone
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
