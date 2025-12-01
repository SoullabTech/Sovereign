'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, User } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { name: string; skipIntro?: boolean }) => void;
}

/**
 * Welcome Modal - Minimal, Single-Step Onboarding
 *
 * Philosophy: "Just introduce yourself to MAIA"
 * - Single input field for name
 * - Optional checkbox to skip intro
 * - Beautiful but non-intrusive
 * - Easy to dismiss
 */
export function WelcomeModal({ isOpen, onClose, onComplete }: WelcomeModalProps) {
  const [name, setName] = useState('');
  const [skipIntro, setSkipIntro] = useState(false);

  // Pre-fill name from localStorage if available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for existing user data
    const betaUser = localStorage.getItem('beta_user');
    const explorerName = localStorage.getItem('explorerName');

    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        const userName = userData.username || userData.name || userData.displayName;
        if (userName) setName(userName);
      } catch (e) {
        console.error('Error parsing beta_user:', e);
      }
    } else if (explorerName) {
      setName(explorerName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'guest';

    onComplete({
      name: finalName,
      skipIntro
    });

    onClose();
  };

  const handleSkip = () => {
    onComplete({
      name: 'guest',
      skipIntro: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-stone-900/95 via-stone-800/95 to-stone-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-12 h-12 text-amber-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to MAIA
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              I'm here to help you discover the wisdom within your story.
              <br />
              <span className="text-stone-400">What shall I call you?</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-stone-300 text-sm">
                <User className="w-4 h-4 text-amber-400" />
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How would you like to be addressed?"
                autoFocus
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Optional: Skip intro checkbox */}
            <label className="flex items-center gap-2 text-stone-400 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={skipIntro}
                onChange={(e) => setSkipIntro(e.target.checked)}
                className="rounded border-stone-600 bg-transparent text-amber-500 focus:ring-amber-500/20 focus:ring-2"
              />
              I'm familiar with MAIA (skip introduction)
            </label>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-black/30 border border-white/10 text-stone-300 hover:bg-black/50 transition-all"
              >
                Skip
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 transition-all"
              >
                {name.trim() ? 'Continue' : 'Enter'}
              </button>
            </div>
          </form>

          {/* Subtle footer */}
          <p className="text-center text-stone-500 text-xs mt-6">
            Your conversation with MAIA is private and secure
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}