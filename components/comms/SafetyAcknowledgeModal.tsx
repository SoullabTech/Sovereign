"use client";

/**
 * COMMS SPINE: Safety Acknowledgment Ritual
 *
 * Not a checkbox. A moment of presence.
 *
 * Core act: "I have seen this, and I am here."
 *
 * Design principles:
 * - No compliance pressure
 * - Optional note is for integration, not reporting
 * - Timestamp is sacred - no auto-fill after this
 * - MAIA watches but does nothing with it yet
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Shield, AlertTriangle } from 'lucide-react';
import type { CommsSafetySeverity } from '@/lib/comms/types';

interface SafetyFlagContext {
  id: string;
  severity: CommsSafetySeverity;
  cues: string[];
  message_preview: string;
  client_name: string;
  recommended_action?: string;
  created_at: string;
}

interface SafetyAcknowledgeModalProps {
  flag: SafetyFlagContext;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (flagId: string, reviewNote?: string) => Promise<void>;
}

const severityConfig = {
  crisis: {
    bg: 'bg-red-950',
    border: 'border-red-500',
    accent: 'text-red-400',
    buttonBg: 'bg-red-600 hover:bg-red-500',
    label: 'Crisis',
    icon: AlertTriangle,
  },
  red: {
    bg: 'bg-red-950/80',
    border: 'border-red-400',
    accent: 'text-red-300',
    buttonBg: 'bg-red-500 hover:bg-red-400',
    label: 'Urgent',
    icon: AlertTriangle,
  },
  yellow: {
    bg: 'bg-amber-950/80',
    border: 'border-amber-400',
    accent: 'text-amber-300',
    buttonBg: 'bg-amber-500 hover:bg-amber-400',
    label: 'Monitor',
    icon: Shield,
  },
};

export function SafetyAcknowledgeModal({
  flag,
  isOpen,
  onClose,
  onAcknowledge,
}: SafetyAcknowledgeModalProps) {
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = severityConfig[flag.severity];
  const Icon = config.icon;

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to allow animation
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setReviewNote('');
    }
  }, [isOpen]);

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await onAcknowledge(flag.id, reviewNote.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape to close
    if (e.key === 'Escape') {
      onClose();
    }
    // Cmd/Ctrl + Enter to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAcknowledge();
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
          >
            <div
              className={`w-full max-w-lg ${config.bg} ${config.border} border rounded-xl shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-gray-800/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
                    <Icon className={`w-5 h-5 ${config.accent}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-100">
                      Safety Review
                    </h2>
                    <p className={`text-sm ${config.accent}`}>
                      {config.label} concern for {flag.client_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">
                {/* Message preview */}
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800/50">
                  <p className="text-sm text-gray-400 mb-2">Message content:</p>
                  <p className="text-gray-200 leading-relaxed">
                    "{flag.message_preview}"
                  </p>
                </div>

                {/* Detected cues */}
                {flag.cues.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Detected cues:</p>
                    <div className="flex flex-wrap gap-2">
                      {flag.cues.map((cue, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 text-xs rounded ${config.bg} ${config.border} border ${config.accent}`}
                        >
                          {cue.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended action */}
                {flag.recommended_action && (
                  <div className={`p-3 rounded-lg border ${config.border} bg-black/20`}>
                    <p className={`text-sm ${config.accent}`}>
                      {flag.recommended_action}
                    </p>
                  </div>
                )}

                {/* Divider with ritual framing */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-sm text-gray-500 bg-gray-900/50">
                      Your presence
                    </span>
                  </div>
                </div>

                {/* Review note - the integration space */}
                <div>
                  <label
                    htmlFor="review-note"
                    className="block text-sm text-gray-400 mb-2"
                  >
                    Note to self
                    <span className="text-gray-600 ml-2">(not shared with client)</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="review-note"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Optional — for your own integration..."
                    rows={3}
                    maxLength={2000}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {reviewNote.length}/2000
                  </p>
                </div>
              </div>

              {/* Footer - The Ritual Act */}
              <div className="p-5 border-t border-gray-800/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    This records your presence, not just your action
                  </p>
                  <button
                    onClick={handleAcknowledge}
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 rounded-lg font-medium text-white ${config.buttonBg} transition-colors disabled:opacity-50 flex items-center space-x-2`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>I have reviewed this</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-600 mt-3 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd> to confirm
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SafetyAcknowledgeModal;
