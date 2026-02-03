/**
 * Upgrade Prompt Modal
 *
 * Displays upgrade prompts to users in a non-intrusive way.
 * Philosophy: Invitations, not pressure. Adults choose.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface UpgradePromptData {
  id: string;
  type: 'supporter' | 'earn_to_studio' | 'threshold' | 'annual_checkin' | 'helper_fund';
  trigger: string;
  softLimit?: boolean;
  messages: {
    headline: string;
    body: string;
    cta_primary: string;
    cta_secondary: string;
    cta_tertiary?: string;
  };
}

interface UpgradePromptModalProps {
  prompt: UpgradePromptData | null;
  isOpen: boolean;
  onClose: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onTertiaryAction?: () => void;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
}) => {
  if (!prompt) return null;

  const getIcon = () => {
    switch (prompt.type) {
      case 'supporter':
        return <Heart className="w-6 h-6" />;
      case 'earn_to_studio':
      case 'threshold':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getAccentColor = () => {
    switch (prompt.type) {
      case 'supporter':
        return 'from-rose-500/20 to-pink-500/20';
      case 'earn_to_studio':
        return 'from-amber-500/20 to-orange-500/20';
      case 'threshold':
        return 'from-blue-500/20 to-indigo-500/20';
      default:
        return 'from-maia-spice-400/20 to-maia-spice-600/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-md mx-auto"
          >
            <div className="bg-gradient-to-b from-maia-navy-900 to-maia-navy-950 rounded-2xl shadow-2xl border border-maia-spice-400/20 overflow-hidden">
              {/* Accent gradient */}
              <div className={`h-1 bg-gradient-to-r ${getAccentColor()}`} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-maia-ink-60" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-maia-spice-400/10 flex items-center justify-center text-maia-spice-400 mb-6">
                  {getIcon()}
                </div>

                {/* Headline */}
                <h2 className="text-xl font-medium text-maia-ink-100 mb-3">
                  {prompt.messages.headline}
                </h2>

                {/* Body */}
                <p className="text-maia-ink-60 leading-relaxed mb-8">
                  {prompt.messages.body}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Primary CTA */}
                  <Button
                    onClick={onPrimaryAction}
                    className="w-full bg-maia-spice-500 hover:bg-maia-spice-600 text-white py-3 rounded-xl font-medium transition-all group"
                  >
                    {prompt.messages.cta_primary}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Secondary CTA */}
                  <Button
                    onClick={onSecondaryAction}
                    variant="ghost"
                    className="w-full text-maia-ink-60 hover:text-maia-ink-80 hover:bg-white/5 py-3 rounded-xl transition-all"
                  >
                    {prompt.messages.cta_secondary}
                  </Button>

                  {/* Tertiary CTA (optional) */}
                  {prompt.messages.cta_tertiary && onTertiaryAction && (
                    <button
                      onClick={onTertiaryAction}
                      className="w-full text-sm text-maia-spice-400/80 hover:text-maia-spice-400 py-2 transition-all"
                    >
                      {prompt.messages.cta_tertiary}
                    </button>
                  )}
                </div>

                {/* Soft limit indicator */}
                {prompt.softLimit && (
                  <p className="mt-6 text-xs text-maia-ink-40 text-center">
                    You can continue using this feature. This is just an invitation.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradePromptModal;
