'use client';

/**
 * Quick Capture — Floating action button for instant notebook entry.
 *
 * Available everywhere: Studio, MAIA chat, Comms.
 * Gated by `livingNotebook` feature flag.
 *
 * Each mount point passes optional context props so entries
 * auto-link to the current conversation/client/session.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Send, BookOpen, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeatureFlags } from '@/lib/utils/feature-flags';
import { apiFetch } from '@/lib/http/apiBase';
import { classifyEntry } from '@/lib/notebook/classifyEntry';
import type { EntrySource, EntryType, PrimaryContext } from '@/lib/notebook/types';

// ═══════════════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════════════

export interface QuickCaptureProps {
  /** Where this capture widget is mounted */
  source?: EntrySource;
  /** Auto-link to current conversation */
  conversationId?: string;
  /** Auto-link to current client */
  clientId?: string;
  /** Auto-link to current session */
  sessionId?: string;
  /** Default context for entries created here */
  primaryContext?: PrimaryContext;
}

// ═══════════════════════════════════════════════════════════════
// Type badge colors
// ═══════════════════════════════════════════════════════════════

const TYPE_COLORS: Record<EntryType, string> = {
  note: 'text-white/50',
  task: 'text-blue-400',
  insight: 'text-amber-400',
  pattern: 'text-purple-400',
  decision: 'text-green-400',
  reminder: 'text-red-400',
};

const TYPE_LABELS: Record<EntryType, string> = {
  note: 'Note',
  task: 'Task',
  insight: 'Insight',
  pattern: 'Pattern',
  decision: 'Decision',
  reminder: 'Reminder',
};

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function QuickCapture({
  source = 'manual',
  conversationId,
  clientId,
  sessionId,
  primaryContext = 'personal',
}: QuickCaptureProps) {
  const { flags } = useFeatureFlags();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [detectedType, setDetectedType] = useState<EntryType>('note');
  const [confidence, setConfidence] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live type detection as user types
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    if (value.trim().length > 5) {
      const classification = classifyEntry(value);
      setDetectedType(classification.detected_type);
      setConfidence(classification.confidence);
    } else {
      setDetectedType('note');
      setConfidence(0);
    }
  }, []);

  // Save entry
  const handleSave = useCallback(async () => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await apiFetch('/api/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          source,
          conversation_id: conversationId,
          client_id: clientId,
          session_id: sessionId,
          primary_context: clientId ? 'client' : primaryContext,
        }),
      });

      setSaved(true);
      setTimeout(() => {
        setContent('');
        setDetectedType('note');
        setConfidence(0);
        setSaved(false);
        setIsOpen(false);
      }, 600);
    } catch (error) {
      console.error('[QuickCapture] Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, isSaving, source, conversationId, clientId, sessionId, primaryContext]);

  // Keyboard shortcut: Cmd+Enter to save
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [handleSave],
  );

  // Auto-focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Don't render if feature flag is off (after all hooks)
  if (!flags.livingNotebook) return null;

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full
                       bg-gradient-to-br from-[#D4B896] to-[#C4A876]
                       shadow-lg shadow-[#D4B896]/20
                       flex items-center justify-center
                       hover:scale-110 active:scale-95 transition-transform"
            aria-label="Quick Capture"
          >
            <Plus className="w-5 h-5 text-[#0f1419]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Capture Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50
                         bg-[#1a1f2e] border-t border-[#D4B896]/20
                         rounded-t-2xl p-4 pb-8
                         max-h-[60vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D4B896]" />
                  <span className="text-sm font-medium text-[#D4B896]">
                    Quick Capture
                  </span>

                  {/* Live type detection badge */}
                  {content.trim().length > 5 && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-xs px-2 py-0.5 rounded-full bg-white/5 ${TYPE_COLORS[detectedType]}`}
                    >
                      {TYPE_LABELS[detectedType]}
                      {confidence > 0.5 && (
                        <span className="ml-1 opacity-50">
                          {Math.round(confidence * 100)}%
                        </span>
                      )}
                    </motion.span>
                  )}
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Drop a thought, task, insight..."
                className="flex-1 min-h-[100px] max-h-[300px] w-full
                           bg-white/5 border border-[#D4B896]/10 rounded-xl
                           p-3 text-white/90 text-sm leading-relaxed
                           placeholder:text-white/30
                           focus:outline-none focus:border-[#D4B896]/30
                           resize-none"
              />

              {/* Footer */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-white/30">
                  {content.trim().length > 0
                    ? `${String.fromCodePoint(8984)}+Enter to save`
                    : 'Start typing...'}
                </span>

                <button
                  onClick={handleSave}
                  disabled={!content.trim() || isSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all ${
                      saved
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : content.trim()
                          ? 'bg-[#D4B896]/20 text-[#D4B896] border border-[#D4B896]/30 hover:bg-[#D4B896]/30'
                          : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                    }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    'Saved'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
