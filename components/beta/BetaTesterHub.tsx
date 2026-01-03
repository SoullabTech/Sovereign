'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Bug,
  Lightbulb,
  Heart,
  X,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { membershipUtils } from '@/hooks/useSubscription';

interface BetaTesterHubProps {
  userName: string;
  userId: string;
}

type FeedbackType = 'bug' | 'idea' | 'love' | 'general';

const FEEDBACK_TYPES: { type: FeedbackType; icon: typeof Bug; label: string; color: string; emoji: string }[] = [
  { type: 'bug', icon: Bug, label: 'Report a Bug', color: 'text-red-400 bg-red-500/10 border-red-500/30', emoji: '🐛' },
  { type: 'idea', icon: Lightbulb, label: 'Share an Idea', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', emoji: '💡' },
  { type: 'love', icon: Heart, label: 'Share Love', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30', emoji: '💜' },
  { type: 'general', icon: MessageCircle, label: 'General Feedback', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', emoji: '💬' },
];

export function BetaTesterHub({ userName, userId }: BetaTesterHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');

  // Only show for beta testers
  if (!membershipUtils.isBetaTester()) {
    return null;
  }

  const handleSendFeedback = () => {
    if (!selectedType || !message.trim()) return;

    const feedbackConfig = FEEDBACK_TYPES.find(f => f.type === selectedType);
    const deviceInfo = typeof navigator !== 'undefined'
      ? navigator.userAgent.includes('iPhone') ? 'iPhone'
      : navigator.userAgent.includes('iPad') ? 'iPad'
      : 'Desktop'
      : 'Unknown';

    const subject = encodeURIComponent(
      `${feedbackConfig?.emoji} [${feedbackConfig?.label}] MAIA Beta Feedback from ${userName}`
    );

    const body = encodeURIComponent(
      `${message}\n\n` +
      `---\n` +
      `User: ${userName}\n` +
      `User ID: ${userId}\n` +
      `Device: ${deviceInfo}\n` +
      `Feedback Type: ${feedbackConfig?.label}\n` +
      `Timestamp: ${new Date().toISOString()}`
    );

    window.location.href = `mailto:beta@soullab.life?subject=${subject}&body=${body}`;

    // Reset form
    setMessage('');
    setSelectedType(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Beta Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[100] flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white rounded-full shadow-lg shadow-purple-500/25 border border-purple-400/30 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Beta</span>
      </motion.button>

      {/* Feedback Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a1a2e] to-black border-t border-purple-500/30 rounded-t-2xl z-[9999] p-4 pb-8 max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-purple-500/40 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Beta Tester Hub</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Welcome Message */}
              <div className="mb-4 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-300">
                  Thank you for being a founding pioneer, <span className="font-medium">{userName}</span>!
                  Your feedback shapes MAIA&apos;s evolution.
                </p>
              </div>

              {/* Feedback Type Selection */}
              {!selectedType ? (
                <div className="space-y-2">
                  <p className="text-sm text-stone-400 mb-3">What would you like to share?</p>
                  {FEEDBACK_TYPES.map(({ type, icon: Icon, label, color }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:scale-[1.02] ${color}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-base font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Type Header */}
                  <button
                    onClick={() => setSelectedType(null)}
                    className="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors"
                  >
                    <span>&larr;</span>
                    <span>Back to options</span>
                  </button>

                  {/* Selected Type Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${FEEDBACK_TYPES.find(f => f.type === selectedType)?.color}`}>
                    {(() => {
                      const config = FEEDBACK_TYPES.find(f => f.type === selectedType);
                      const Icon = config?.icon || MessageCircle;
                      return (
                        <>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{config?.label}</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-sm text-stone-400 mb-2">Your message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        selectedType === 'bug' ? 'Describe what happened and what you expected...' :
                        selectedType === 'idea' ? 'Share your idea for improving MAIA...' :
                        selectedType === 'love' ? 'Tell us what you love about MAIA...' :
                        'Share your thoughts...'
                      }
                      className="w-full h-32 px-4 py-3 bg-stone-900/50 border border-stone-700/50 rounded-xl text-white placeholder-stone-500 resize-none focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  {/* Tip for Bug Reports */}
                  {selectedType === 'bug' && (
                    <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-300">
                        Tip: Include what you were doing, what happened, and if possible, take a screenshot!
                      </p>
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={handleSendFeedback}
                    disabled={!message.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Feedback</span>
                  </button>
                </div>
              )}

              {/* TestFlight Reminder */}
              <div className="mt-6 px-3 py-2 bg-stone-800/50 border border-stone-700/50 rounded-lg">
                <p className="text-xs text-stone-400">
                  <span className="font-medium text-stone-300">Pro tip:</span> You can also shake your iPhone in TestFlight to send feedback with screenshots!
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
