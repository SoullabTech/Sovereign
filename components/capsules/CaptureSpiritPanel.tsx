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
  Check,
  Library,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { CapsuleDTO } from '@/lib/capsules/types';

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

  // ── Field declaration ────────────────────────────────────────────────────
  // Whether this capsule has been declared a Field Object. `null` = not yet
  // known (the status read is in flight); the act stays available either way,
  // since the endpoint is idempotent.
  const [keptInField, setKeptInField] = useState<boolean | null>(null);
  const [isKeeping, setIsKeeping] = useState(false);
  const [keepError, setKeepError] = useState<string | null>(null);

  // Sync local state with capsule
  useEffect(() => {
    if (capsule) {
      setTitle(capsule.title || '');
      setSummary(capsule.summary || '');
      setElement(capsule.signals?.element || '');
    }
  }, [capsule]);

  // Read the declaration's standing when a capsule is shown. This only reports
  // what the member already did — opening the panel never declares anything.
  useEffect(() => {
    const capsuleId = capsule?.id;
    if (!isOpen || !capsuleId) return;

    let cancelled = false;
    setKeptInField(null);
    setKeepError(null);

    (async () => {
      try {
        const r = await apiFetch(`/api/capsules/${capsuleId}/keep-in-field`);
        if (!r.ok) return; // leave unknown; the act is still offered
        const data = await r.json();
        if (!cancelled) setKeptInField(Boolean(data.kept));
      } catch {
        // Unknown standing is not an error the member needs to see.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, capsule?.id]);

  // The declaration act. Saves the member's edits first so what enters the
  // Field is the text they are looking at, then declares.
  const handleKeepInField = async () => {
    if (!capsule || isKeeping) return;
    setIsKeeping(true);
    setKeepError(null);
    try {
      await handleSaveQuickEdits();
      const r = await apiFetch(`/api/capsules/${capsule.id}/keep-in-field`, {
        method: 'POST',
      });
      if (!r.ok) throw new Error(`keep-in-field failed: ${r.status}`);
      setKeptInField(true);
    } catch (err) {
      console.error('[CaptureSpiritPanel] keep in field failed', err);
      setKeepError("Could not keep this in your Field just now. It's still saved here.");
    } finally {
      setIsKeeping(false);
    }
  };

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

                    {/* The declaration: this capsule becomes an enduring Field
                        Object. Distinct from saving — the capsule stays exactly
                        where it is; this is the member choosing that it should
                        last. Governed by FIELD_OBJECT_PROMOTION_RULING_2026-08-02. */}
                    {keptInField ? (
                      <div className="w-full px-4 py-3 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-xl">
                        <div className="flex items-center gap-2 text-[#D4B896] text-[14px]">
                          <Check className="w-4 h-4 flex-shrink-0" />
                          <span>In your Field</span>
                        </div>
                        <a
                          href="/maia/workbench"
                          className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Find it on your Workbench
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={handleKeepInField}
                        disabled={isKeeping || isSaving || isBringing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10
                                 border border-[#D4B896]/30 text-[#D4B896] rounded-xl text-[14px] tracking-wide transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isKeeping ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Keeping...
                          </>
                        ) : (
                          <>
                            <Library className="w-4 h-4" />
                            Keep in my Field
                          </>
                        )}
                      </button>
                    )}

                    {keepError && (
                      <p className="text-red-400/80 text-[12px] leading-relaxed">{keepError}</p>
                    )}

                    {/* Secondary: Keep as draft */}
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
                          Keep as Draft
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
