'use client';

/**
 * CaptureSpiritPanel - Side panel for reviewing draft Reflection Capsules
 *
 * Appears after "Capture the Spirit" is clicked, showing the distilled
 * capsule with quick edit fields before saving.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Save,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import type { CapsuleDTO } from '@/lib/capsules/types';
import { apiFetch } from '@/lib/http/apiBase';

// Element config
const ELEMENTS = [
  { value: 'fire', label: 'Fire', emoji: '🔥', color: 'bg-red-400/20 text-red-400' },
  { value: 'water', label: 'Water', emoji: '💧', color: 'bg-blue-400/20 text-blue-400' },
  { value: 'earth', label: 'Earth', emoji: '🌍', color: 'bg-green-500/20 text-green-400' },
  { value: 'air', label: 'Air', emoji: '💨', color: 'bg-cyan-400/20 text-cyan-400' },
  { value: 'aether', label: 'Aether', emoji: '✨', color: 'bg-purple-400/20 text-purple-400' },
] as const;

interface CaptureSpiritPanelProps {
  isOpen: boolean;
  onClose: () => void;
  capsule: CapsuleDTO | null;
  isLoading: boolean;
  error: string | null;
  onSave: (updates: Partial<CapsuleDTO>) => Promise<void>;
  onBringIntoLab: () => Promise<void>;
  onViewInLab: () => void;
}

export default function CaptureSpiritPanel({
  isOpen,
  onClose,
  capsule,
  isLoading,
  error,
  onSave,
  onBringIntoLab,
  onViewInLab,
}: CaptureSpiritPanelProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [element, setElement] = useState('');
  const [showSource, setShowSource] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBringing, setIsBringing] = useState(false);

  /* Declaring is its own act, so it has its own state. `declared` is what the
     member sees after the act — pressing again must read as "already yours",
     never as a second creation. The route reports which happened (201 vs 200);
     either way the member ends in the same settled state. */
  const [isDeclaring, setIsDeclaring] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [declareError, setDeclareError] = useState<string | null>(null);

  /* Eligibility, read from the capsule — never assumed, and never granted by
     asking. A draft capsule is not eligible; the honest response is to say so,
     NOT to flip `draft` because the member reached for the button. Amendment 5:
     lifecycle state decides when the gesture is offered, and declares nothing. */
  const isEligible = capsule ? !capsule.draft && !capsule.archived : false;

  const handleKeepInMyField = async () => {
    if (!capsule) return;
    setIsDeclaring(true);
    setDeclareError(null);
    try {
      const res = await apiFetch('/api/psyche/field/declare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capsuleId: capsule.id }),
      });
      if (res.ok) {
        // 201 created and 200 already-declared are the same outcome for the
        // member: this belongs to their Field. Only the wording of a retry
        // differs, and it differs by saying nothing new.
        setDeclared(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setDeclareError(data?.error ?? 'Could not keep this just now. Nothing was lost.');
    } catch {
      setDeclareError('Could not reach your Field just now. Please try again.');
    } finally {
      setIsDeclaring(false);
    }
  };

  // Sync local state with capsule
  useEffect(() => {
    if (capsule) {
      setTitle(capsule.title || '');
      setSummary(capsule.summary || '');
      setElement(capsule.signals?.element || '');
    }
  }, [capsule]);

  const handleSaveQuickEdits = async () => {
    if (!capsule) return;
    setIsSaving(true);
    try {
      await onSave({
        title,
        summary,
        signals: element ? { ...capsule.signals, element: element as any } : capsule.signals,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBringIntoLab = async () => {
    setIsBringing(true);
    try {
      await handleSaveQuickEdits();
      await onBringIntoLab();
    } finally {
      setIsBringing(false);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border-l border-[#D4B896]/20 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-[#1a1f2e] to-transparent p-4 pb-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#D4B896]/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#D4B896]" />
                  </div>
                  <h2 className="text-lg font-medium text-[#D4B896]">Keep this moment</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/50 text-sm mt-2">
                Review and refine what mattered from this conversation.
              </p>
            </div>

            {/* Content */}
            <div className="p-4 pt-0 pb-40 space-y-6">
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 bg-[#D4B896]/10 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-6 h-6 text-[#D4B896] animate-spin" />
                  </div>
                  <p className="text-white/60 text-sm">Distilling the essence...</p>
                  <p className="text-white/40 text-xs mt-1">This may take a moment</p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-3 text-xs text-white/60 hover:text-white/80 underline"
                  >
                    Try again later
                  </button>
                </div>
              )}

              {/* Capsule Content */}
              {capsule && !isLoading && !error && (
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#D4B896]/60 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[15px]
                               placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30 focus:border-[#D4B896]/50"
                      placeholder="What this reflection is about..."
                    />
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#D4B896]/60 mb-2">
                      The Spirit
                    </label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[14px] leading-relaxed
                               placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30 focus:border-[#D4B896]/50 resize-none"
                      placeholder="The essence of what mattered..."
                    />
                  </div>

                  {/* Element Selection */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#D4B896]/60 mb-2">
                      Element
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ELEMENTS.map((el) => (
                        <button
                          key={el.value}
                          onClick={() => setElement(element === el.value ? '' : el.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all ${
                            element === el.value
                              ? el.color + ' ring-1 ring-current'
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          <span>{el.emoji}</span>
                          <span>{el.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gold Lines Preview */}
                  {capsule.goldLines && capsule.goldLines.length > 0 && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#D4B896]/60 mb-2">
                        Gold Lines
                      </label>
                      <div className="space-y-2">
                        {capsule.goldLines.slice(0, 3).map((gl, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 bg-[#D4B896]/5 border border-[#D4B896]/10 rounded-lg p-3"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#D4B896] mt-0.5 flex-shrink-0" />
                            <p className="text-white/70 text-[13px] italic leading-relaxed">
                              "{gl.text}"
                            </p>
                          </div>
                        ))}
                        {capsule.goldLines.length > 3 && (
                          <p className="text-white/40 text-xs">
                            +{capsule.goldLines.length - 3} more in full view
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Source Excerpt (collapsible) */}
                  {capsule.sourceExcerpt && (
                    <div className="border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowSource(!showSource)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-[12px] text-white/50 tracking-wide">Source Excerpt</span>
                        {showSource ? (
                          <ChevronUp className="w-4 h-4 text-white/40" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        )}
                      </button>
                      {showSource && (
                        <div className="px-4 py-3 bg-black/20 max-h-48 overflow-y-auto">
                          <pre className="text-[11px] text-white/50 whitespace-pre-wrap font-mono leading-relaxed">
                            {capsule.sourceExcerpt}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    {/* Primary: Bring into Lab */}
                    <button
                      onClick={handleBringIntoLab}
                      disabled={isBringing || isSaving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4B896] hover:bg-[#C4A886]
                               text-[#1a1f2e] rounded-xl text-[14px] font-medium tracking-wide transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBringing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Bring into the Lab
                        </>
                      )}
                    </button>

                    {/* The declaration. A DIFFERENT act from the two around it,
                        and the member must be able to see that without being
                        told: "Bring into the Lab" moves the capsule along,
                        "Save for later" preserves unfinished work, and this one
                        creates something enduring in their Field.

                        Offered only when the capsule is eligible. When it is
                        not, the disabled state says why rather than vanishing —
                        an action that silently disappears teaches nothing, and
                        pressing it must never be what makes it eligible. */}
                    {declared ? (
                      <div
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4B896]/10
                                 border border-[#D4B896]/30 text-[#D4B896] rounded-xl text-[14px] tracking-wide"
                        role="status"
                      >
                        <Sparkles className="w-4 h-4" />
                        Kept in your Field
                      </div>
                    ) : (
                      <button
                        onClick={handleKeepInMyField}
                        disabled={!isEligible || isDeclaring || isSaving}
                        title={
                          isEligible
                            ? undefined
                            : 'Bring this into the Lab first — a draft is not yet kept.'
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10
                                 border border-[#D4B896]/30 text-[#D4B896] rounded-xl text-[14px] tracking-wide transition-all
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isDeclaring ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Keeping...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Keep in my Field
                          </>
                        )}
                      </button>
                    )}

                    {!isEligible && !declared && (
                      <p className="text-[12px] text-white/40 text-center leading-relaxed">
                        Bring this into the Lab first. A draft can be saved, but only
                        finished work is kept in your Field.
                      </p>
                    )}

                    {declareError && (
                      <p className="text-[12px] text-red-400/80 text-center leading-relaxed">
                        {declareError}
                      </p>
                    )}

                    {/* Save for later — renamed from "Keep as Draft". Two acts
                        both called some kind of "Keep" forced the member to
                        infer which kind of keeping had occurred. This one
                        preserves unfinished work; it does not keep anything in
                        the Field. */}
                    <button
                      onClick={async () => {
                        await handleSaveQuickEdits();
                        onClose();
                      }}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10
                               border border-white/10 text-white/70 rounded-xl text-[14px] tracking-wide transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save for later
                        </>
                      )}
                    </button>

                    {/* View in Lab link */}
                    <button
                      onClick={onViewInLab}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[#D4B896]/60
                               hover:text-[#D4B896] text-[13px] tracking-wide transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View in Reflections
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
