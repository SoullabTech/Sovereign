'use client';

/**
 * Personal Tier Threshold Invitation
 *
 * A gentle invitation shown when Free users reach a threshold moment.
 * Not a paywall — an opening.
 *
 * "I'm beginning to see a pattern here..."
 *
 * See /docs/TIER_STRUCTURE.md for context.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, ArrowRight, X } from 'lucide-react';

interface PersonalThresholdInvitationProps {
  /** What triggered this threshold */
  context: 'pattern_detected' | 'oracle_frequency' | 'journal_depth' | 'life_cycle' | 'community_engagement';
  /** Optional teaser text about what was detected */
  teaser?: string;
  /** Day mode styling */
  isDayMode?: boolean;
  /** Callback when user wants to learn more */
  onLearnMore?: () => void;
  /** Callback when user dismisses */
  onDismiss?: () => void;
  /** Whether to show as inline or modal-style */
  variant?: 'inline' | 'card' | 'subtle';
}

const CONTEXT_MESSAGES: Record<string, { title: string; body: string; cta: string }> = {
  pattern_detected: {
    title: "Something meaningful is taking shape",
    body: "You're starting to see patterns connect across time. Your device holds this locally. Sovereign cloud can extend it—syncing across devices, weaving patterns over months, uploading files for deeper analysis.",
    cta: "Explore sovereign cloud",
  },
  oracle_frequency: {
    title: "Your readings are starting to speak to each other",
    body: "When readings repeat or return to similar themes, something deeper is forming. Your device remembers this session. Sovereign cloud can track these threads across time and devices—and let you upload context for richer readings.",
    cta: "Explore sovereign cloud",
  },
  journal_depth: {
    title: "Your reflections are beginning to form patterns",
    body: "As you journal, themes start to echo and connect. Your device holds everything locally. Sovereign cloud extends this—syncing across devices, pattern weaving over time, file uploads for deeper context.",
    cta: "Explore sovereign cloud",
  },
  life_cycle: {
    title: "You're approaching a significant passage",
    body: "Your chart shows important developmental thresholds ahead. Your device holds your current work. Sovereign cloud can walk with you through these cycles across time and devices.",
    cta: "Explore sovereign cloud",
  },
  community_engagement: {
    title: "Your contributions are weaving into something",
    body: "Your presence in the community is creating connections. Sovereign cloud can extend your capabilities—file uploads, cross-device access, and deeper pattern recognition across your journey.",
    cta: "Explore sovereign cloud",
  },
};

export default function PersonalThresholdInvitation({
  context,
  teaser,
  isDayMode = false,
  onLearnMore,
  onDismiss,
  variant = 'card',
}: PersonalThresholdInvitationProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);
  const messages = CONTEXT_MESSAGES[context] || CONTEXT_MESSAGES.pattern_detected;

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    } else {
      // Default: navigate to membership page
      router.push('/maia/membership');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  // Subtle variant - minimal inline text
  if (variant === 'subtle') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-sm italic ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}
      >
        <span>{messages.title}</span>
        {onLearnMore && (
          <button
            onClick={handleLearnMore}
            className={`ml-2 underline underline-offset-2 hover:no-underline ${
              isDayMode ? 'text-violet-700' : 'text-violet-300'
            }`}
          >
            {messages.cta}
          </button>
        )}
      </motion.div>
    );
  }

  // Inline variant - compact horizontal
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-3 rounded-xl ${
          isDayMode
            ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/50'
            : 'bg-gradient-to-r from-violet-900/20 to-indigo-900/10 border border-violet-500/20'
        }`}
      >
        <Sparkles
          className={`w-5 h-5 flex-shrink-0 ${isDayMode ? 'text-violet-500' : 'text-violet-400'}`}
        />
        <p className={`flex-1 text-sm ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
          {messages.title}
        </p>
        {onLearnMore && (
          <button
            onClick={handleLearnMore}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isDayMode
                ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
            }`}
          >
            {messages.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  // Card variant - full invitation
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl ${
        isDayMode
          ? 'bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 border border-violet-200/50'
          : 'bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-purple-900/10 border border-violet-500/30'
      }`}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${
            isDayMode
              ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
              : 'text-stone-500 hover:text-stone-300 hover:bg-stone-700'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="p-6">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            isDayMode ? 'bg-violet-100' : 'bg-violet-500/20'
          }`}
        >
          <Sparkles className={`w-6 h-6 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`} />
        </div>

        {/* Title */}
        <h3
          className={`text-lg font-medium mb-2 ${isDayMode ? 'text-stone-800' : 'text-white'}`}
        >
          {messages.title}
        </h3>

        {/* Teaser (the glimpse of what was detected) */}
        {teaser && (
          <div
            className={`mb-4 p-3 rounded-lg italic ${
              isDayMode ? 'bg-white/60 text-stone-600' : 'bg-stone-800/50 text-stone-400'
            }`}
          >
            "{teaser}..."
          </div>
        )}

        {/* Body */}
        <p className={`text-sm mb-5 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
          {messages.body}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {onLearnMore && (
            <button
              onClick={handleLearnMore}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDayMode
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-violet-500 text-white hover:bg-violet-400'
              }`}
            >
              <Heart className="w-4 h-4" />
              {messages.cta}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                isDayMode
                  ? 'text-stone-600 hover:bg-stone-100'
                  : 'text-stone-400 hover:bg-stone-700'
              }`}
            >
              Not now
            </button>
          )}
        </div>

        {/* Reassurance note — local is complete */}
        <p
          className={`mt-4 text-xs italic ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}
        >
          Your local experience is complete. Sovereign cloud extends what&apos;s possible—when you&apos;re ready.
        </p>
      </div>

      {/* Decorative glow */}
      <div
        className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
          isDayMode ? 'bg-violet-200/50' : 'bg-violet-500/10'
        }`}
      />
    </motion.div>
  );
}

/**
 * Hook to check if user should see threshold invitation
 */
export function useThresholdCheck(
  tier: 'free' | 'personal' | 'pro' | undefined,
  context: {
    journalEntryCount?: number;
    oracleReadingsThisWeek?: number;
    hasPatternDetected?: boolean;
    communityPostCount?: number;
    communityCommentCount?: number;
  }
): { shouldShow: boolean; type: string | null } {
  if (!tier || tier !== 'free') {
    return { shouldShow: false, type: null };
  }

  const {
    journalEntryCount = 0,
    oracleReadingsThisWeek = 0,
    hasPatternDetected = false,
    communityPostCount = 0,
    communityCommentCount = 0,
  } = context;

  // Pattern detected with enough entries
  if (hasPatternDetected && journalEntryCount >= 3) {
    return { shouldShow: true, type: 'pattern_detected' };
  }

  // Third oracle reading this week
  if (oracleReadingsThisWeek >= 3) {
    return { shouldShow: true, type: 'oracle_frequency' };
  }

  // Many journal entries
  if (journalEntryCount >= 7) {
    return { shouldShow: true, type: 'journal_depth' };
  }

  // Community engagement threshold (3+ posts or 5+ comments)
  if (communityPostCount >= 3 || communityCommentCount >= 5) {
    return { shouldShow: true, type: 'community_engagement' };
  }

  return { shouldShow: false, type: null };
}
