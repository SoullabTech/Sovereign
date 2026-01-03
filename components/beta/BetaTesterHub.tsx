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
  AlertCircle
} from 'lucide-react';

interface BetaTesterHubProps {
  userName: string;
  userId: string;
}

type FeedbackType = 'bug' | 'idea' | 'love' | 'general';

const FEEDBACK_TYPES: { type: FeedbackType; icon: typeof Bug; label: string; color: string; emoji: string }[] = [
  { type: 'bug', icon: Bug, label: 'Report a Bug', color: 'text-red-400 bg-red-500/10 border-red-500/30', emoji: '[BUG]' },
  { type: 'idea', icon: Lightbulb, label: 'Share an Idea', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', emoji: '[IDEA]' },
  { type: 'love', icon: Heart, label: 'Share Appreciation', color: 'text-[#D4B896] bg-[#D4B896]/10 border-[#D4B896]/30', emoji: '[APPRECIATION]' },
  { type: 'general', icon: MessageCircle, label: 'General Feedback', color: 'text-stone-300 bg-stone-500/10 border-stone-500/30', emoji: '[FEEDBACK]' },
];

export function BetaTesterHub({ userName, userId }: BetaTesterHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');

  // Show for all users - everyone can provide feedback

  const handleSendFeedback = () => {
    if (!selectedType || !message.trim()) return;

    const feedbackConfig = FEEDBACK_TYPES.find(f => f.type === selectedType);
    const deviceInfo = typeof navigator !== 'undefined'
      ? navigator.userAgent.includes('iPhone') ? 'iPhone'
      : navigator.userAgent.includes('iPad') ? 'iPad'
      : 'Desktop'
      : 'Unknown';

    const subject = encodeURIComponent(
      `${feedbackConfig?.emoji} MAIA Feedback from ${userName}`
    );

    const body = encodeURIComponent(
      `${message}\n\n` +
      `---\n` +
      `User: ${userName}\n` +
      `User ID: ${userId}\n` +
      `Device: ${deviceInfo}\n` +
      `Type: ${feedbackConfig?.label}\n` +
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
      {/* Floating Feedback Button - Dune aesthetic */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[100] flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-900/80 to-stone-900/80 text-[#D4B896] rounded-lg shadow-lg shadow-black/40 border border-amber-700/40 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-light tracking-wide">Feedback</span>
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900 to-stone-950 border-t border-amber-700/30 rounded-t-2xl z-[9999] p-4 pb-8 max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-amber-700/40 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-light tracking-wide text-[#D4B896]">Send Feedback</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* Welcome Message */}
              <div className="mb-4 px-3 py-2 bg-amber-900/10 border border-amber-700/20 rounded-lg">
                <p className="text-sm text-stone-400">
                  Your feedback shapes MAIA, <span className="text-[#D4B896]">{userName}</span>.
                </p>
              </div>

              {/* Feedback Type Selection */}
              {!selectedType ? (
                <div className="space-y-2">
                  <p className="text-sm text-stone-500 mb-3">What would you like to share?</p>
                  {FEEDBACK_TYPES.map(({ type, icon: Icon, label, color }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:scale-[1.01] ${color}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-base font-light">{label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Type Header */}
                  <button
                    onClick={() => setSelectedType(null)}
                    className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    <span>&larr;</span>
                    <span>Back</span>
                  </button>

                  {/* Selected Type Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${FEEDBACK_TYPES.find(f => f.type === selectedType)?.color}`}>
                    {(() => {
                      const config = FEEDBACK_TYPES.find(f => f.type === selectedType);
                      const Icon = config?.icon || MessageCircle;
                      return (
                        <>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-light">{config?.label}</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-sm text-stone-500 mb-2">Your message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        selectedType === 'bug' ? 'Describe what happened and what you expected...' :
                        selectedType === 'idea' ? 'Share your idea for improving MAIA...' :
                        selectedType === 'love' ? 'What resonates with you?' :
                        'Share your thoughts...'
                      }
                      className="w-full h-32 px-4 py-3 bg-stone-900/50 border border-stone-700/50 rounded-lg text-stone-200 placeholder-stone-600 resize-none focus:outline-none focus:border-amber-700/50"
                    />
                  </div>

                  {/* Tip for Bug Reports */}
                  {selectedType === 'bug' && (
                    <div className="flex items-start gap-2 px-3 py-2 bg-amber-900/10 border border-amber-700/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-stone-400">
                        Include what you were doing, what happened, and if possible, take a screenshot.
                      </p>
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={handleSendFeedback}
                    disabled={!message.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-800/60 to-amber-900/60 hover:from-amber-700/60 hover:to-amber-800/60 disabled:opacity-40 disabled:cursor-not-allowed text-[#D4B896] rounded-lg font-light tracking-wide border border-amber-700/30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              )}

              {/* TestFlight Reminder */}
              <div className="mt-6 px-3 py-2 bg-stone-800/30 border border-stone-700/30 rounded-lg">
                <p className="text-xs text-stone-500">
                  <span className="text-stone-400">Tip:</span> Shake your iPhone in TestFlight to send feedback with screenshots.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
