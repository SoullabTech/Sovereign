'use client';

/**
 * TOOL REVEAL SHEET
 *
 * When wisdom routing detects a pattern and has a tool to offer,
 * this component appears as a gentle invitation - never a prescription.
 *
 * "I have something that might help with this..."
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { FocusGarden, type FocusGardenResult } from '../ganesha/FocusGarden';
import { InboxTriage, type TriageResult } from '../focus/InboxTriage';
import { NextStepBuilder, type NextStepResult } from '../focus/NextStepBuilder';
import { AvoidanceBreaker, type AvoidanceResult } from '../focus/AvoidanceBreaker';
import { HoldingBanner, type StewardshipThreshold } from '../stewardship/HoldingBanner';

// ═══════════════════════════════════════════════════════════════════════════════
// STEWARDSHIP STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface StewardshipState {
  threshold?: StewardshipThreshold;
  weeklyWeight?: number;
  projectedWeight?: number;
  tier?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface WisdomTool {
  id: string;
  name: string;
  description: string;
  agentConnection: string;
}

interface ToolRevealSheetProps {
  /** The tool being offered */
  tool: WisdomTool | null;
  /** The agent name offering the tool */
  agentName: string | null;
  /** User's original message that triggered this */
  userMessage?: string;
  /** Called when user dismisses the invitation */
  onDismiss: () => void;
  /** Called when a tool completes */
  onToolComplete?: (toolId: string, result: unknown) => void;
  /** Member ID for stewardship weight tracking */
  memberId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVITATION TEXT
// ═══════════════════════════════════════════════════════════════════════════════

const INVITATION_TEXT: Record<string, { intro: string; offer: string }> = {
  'focus-ritual': {
    intro: 'I sense scattered attention asking to be gathered.',
    offer: 'There\'s a space called the Focus Garden—a few quiet minutes with Ganesha, the obstacle-remover. Would you like to explore it?'
  },
  'inbox-triage': {
    intro: 'You have something on your mind that needs a place.',
    offer: 'Let\'s capture it quickly—task, event, or just a thought—so it\'s out of your head and somewhere safe.'
  },
  'next-step': {
    intro: 'There\'s something you want to do, but starting feels hard.',
    offer: 'Let\'s break it down to the tiniest next step—just the first thing your hands would do.'
  },
  'avoidance-breaker': {
    intro: 'There\'s a message you\'ve been putting off.',
    offer: 'I can help you draft it—and set a reminder to follow up. Want to break the avoidance together?'
  },
  'dream-journal': {
    intro: 'This dream carries meaning worth exploring.',
    offer: 'I can open a space for dream work—a gentle process to let the symbols speak. Interested?'
  },
  'shadow-mirror': {
    intro: 'Something is asking to be seen.',
    offer: 'There\'s a practice for meeting the shadow with compassion. Would you like to try it?'
  },
  'story-weaver': {
    intro: 'Your story has mythic resonance.',
    offer: 'I can guide you through the Bard\'s lens—seeing your experience as a chapter in a larger epic. Shall we?'
  }
};

const DEFAULT_INVITATION = {
  intro: 'Something here deserves attention.',
  offer: 'I have a practice that might help. Would you like to explore it?'
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ToolRevealSheet({
  tool,
  agentName,
  userMessage,
  onDismiss,
  onToolComplete,
  memberId
}: ToolRevealSheetProps) {
  const [showTool, setShowTool] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stewardship, setStewardship] = useState<StewardshipState | null>(null);

  // Get invitation text for this tool
  const invitation = tool?.id
    ? INVITATION_TEXT[tool.id] || DEFAULT_INVITATION
    : DEFAULT_INVITATION;

  // Handle accepting the invitation
  const handleAccept = useCallback(() => {
    setShowTool(true);
  }, []);

  // Handle declining
  const handleDecline = useCallback(() => {
    setDismissed(true);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  // Handle tool completion (generic handler for all tool types)
  const handleToolComplete = useCallback((result: FocusGardenResult | TriageResult | NextStepResult | AvoidanceResult) => {
    // Capture stewardship metadata if present in result
    if (result && typeof result === 'object' && 'stewardship' in result) {
      const s = (result as { stewardship?: StewardshipState }).stewardship;
      if (s?.threshold) {
        setStewardship(s);
      }
    }

    setShowTool(false);
    onToolComplete?.(tool?.id || '', result);
    onDismiss();
  }, [tool?.id, onToolComplete, onDismiss]);

  // Handle tool close without completion
  const handleToolClose = useCallback(() => {
    setShowTool(false);
  }, []);

  // Don't render if no tool or dismissed
  if (!tool || dismissed) return null;

  // Render the actual tool if accepted
  if (showTool) {
    switch (tool.id) {
      case 'focus-ritual':
        return (
          <FocusGarden
            isOpen={true}
            onClose={handleToolClose}
            onComplete={handleToolComplete}
            initialContext={userMessage}
            memberId={memberId}
          />
        );

      case 'inbox-triage':
        return (
          <InboxTriage
            isOpen={true}
            onClose={handleToolClose}
            onComplete={handleToolComplete}
            initialCapture={userMessage}
            memberId={memberId}
          />
        );

      case 'next-step':
        return (
          <NextStepBuilder
            isOpen={true}
            onClose={handleToolClose}
            onComplete={handleToolComplete}
            context={userMessage}
            memberId={memberId}
          />
        );

      case 'avoidance-breaker':
        return (
          <AvoidanceBreaker
            isOpen={true}
            onClose={handleToolClose}
            onComplete={handleToolComplete}
            context={userMessage}
            memberId={memberId}
          />
        );

      default:
        // Unknown tool - show nothing
        return null;
    }
  }

  // Render the invitation
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mt-4 mx-auto max-w-lg"
      >
        <div className="bg-gradient-to-br from-stone-900/95 to-stone-800/95
                        backdrop-blur-sm rounded-xl border border-amber-900/30
                        shadow-lg shadow-amber-900/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-amber-900/20">
            <div className="flex items-center gap-2 text-amber-400/80">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wider uppercase">
                {agentName ? `${agentName} offers` : 'Tool available'}
              </span>
            </div>
            <button
              onClick={handleDecline}
              className="text-stone-500 hover:text-stone-400 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Stewardship acknowledgment (if at threshold) */}
            <HoldingBanner threshold={stewardship?.threshold} />

            {/* Intro */}
            <p className="text-stone-300 font-light leading-relaxed">
              {invitation.intro}
            </p>

            {/* Offer */}
            <p className="text-amber-200/90 leading-relaxed">
              {invitation.offer}
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2.5 rounded-lg
                           bg-amber-700/40 hover:bg-amber-700/60
                           text-amber-100 font-medium
                           border border-amber-600/30
                           transition-all duration-200
                           hover:shadow-lg hover:shadow-amber-900/20"
              >
                Yes, let's explore
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2.5 rounded-lg
                           text-stone-400 hover:text-stone-300
                           hover:bg-stone-700/30
                           transition-colors duration-200"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ToolRevealSheet;
