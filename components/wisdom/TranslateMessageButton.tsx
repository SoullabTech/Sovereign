'use client';

/**
 * TRANSLATE MESSAGE BUTTON
 *
 * Inline translation control for MAIA messages.
 * Allows members to see insights through different wisdom system lenses.
 * Translations persist as conversation turns and display as collapsible child cards.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, ChevronRight, Loader2, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface TranslateMessageButtonProps {
  messageContent: string;
  messageId?: string;
  sessionId?: string;
  onTranslationComplete?: (translation: TranslationResult) => void;
  compact?: boolean;
}

interface TranslationResult {
  translatedText: string;
  toSystem: string;
  fromSystemUsed: string;
  lensUsed: string;
  confidence: number;
  turnId?: string;
}

type TranslationStyle = 'meaning' | 'practical' | 'mythic' | 'somatic';

const wisdomSystems = [
  { id: 'astrology', name: 'Astrology', icon: '⭐' },
  { id: 'alchemy', name: 'Alchemy', icon: '🜃' },
  { id: 'psychology', name: 'Psychology', icon: '🧠' },
  { id: 'spiral', name: 'Spiral Dynamics', icon: '🌀' },
  { id: 'somatic', name: 'Somatic', icon: '🫀' },
  { id: 'mythology', name: 'Mythology', icon: '⚡' },
  { id: 'energy', name: 'Energy Work', icon: '💫' },
  { id: 'archetypal', name: 'Archetypal', icon: '🗿' },
];

const translationStyles: { id: TranslationStyle; label: string; description: string }[] = [
  { id: 'meaning', label: 'Keep meaning', description: 'Preserve meaning, change framing' },
  { id: 'practical', label: 'Make practical', description: 'Actionable micro-practices' },
  { id: 'mythic', label: 'Make mythic', description: 'Amplify archetypal dimensions' },
  { id: 'somatic', label: 'Make somatic', description: 'Ground in body wisdom' },
];

export function TranslateMessageButton({
  messageContent,
  messageId,
  sessionId,
  onTranslationComplete,
  compact = true,
}: TranslateMessageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<TranslationStyle>(() => {
    // Remember last style preference
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('maia.translateStyle') as TranslationStyle) || 'meaning';
    }
    return 'meaning';
  });
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [expandedTranslations, setExpandedTranslations] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);

  // Save style preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maia.translateStyle', selectedStyle);
    }
  }, [selectedStyle]);

  const handleTranslate = async (toSystem: string) => {
    setIsTranslating(true);
    setError(null);
    setSelectedSystem(toSystem);

    try {
      const res = await apiFetch('/api/maia/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageContent,
          toSystem,
          style: selectedStyle,
          lens: 'my',
          parentMessageId: messageId,
          sessionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Translation failed');
      }

      const data = await res.json();

      // Add to translations list (supports multiple translations per message)
      setTranslations(prev => {
        // Replace if same system, add if new
        const exists = prev.findIndex(t => t.toSystem === data.toSystem);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = data;
          return updated;
        }
        return [...prev, data];
      });

      // Auto-expand the new translation
      setExpandedTranslations(prev => new Set([...prev, data.toSystem]));

      onTranslationComplete?.(data);
    } catch (err) {
      console.error('[TranslateMessageButton] Error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
      setIsOpen(false);
    }
  };

  const toggleTranslationExpanded = (toSystem: string) => {
    setExpandedTranslations(prev => {
      const next = new Set(prev);
      if (next.has(toSystem)) {
        next.delete(toSystem);
      } else {
        next.add(toSystem);
      }
      return next;
    });
  };

  const removeTranslation = (toSystem: string) => {
    setTranslations(prev => prev.filter(t => t.toSystem !== toSystem));
    setExpandedTranslations(prev => {
      const next = new Set(prev);
      next.delete(toSystem);
      return next;
    });
  };

  return (
    <div className="relative">
      {/* Main Button Row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md
                   text-white/50 hover:text-white/70 hover:bg-white/5
                   transition-all"
          title="Translate through different wisdom system"
        >
          <Globe className="w-3 h-3" />
          <span>Translate</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Style indicator chip */}
        {selectedStyle !== 'meaning' && (
          <span className="text-[10px] px-1.5 py-0.5 bg-[#D4B896]/20 text-[#D4B896] rounded">
            {translationStyles.find(s => s.id === selectedStyle)?.label}
          </span>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full left-0 mt-1 z-50 bg-[#1a1f2e] border border-white/10
                     rounded-lg shadow-xl overflow-hidden min-w-[220px]"
          >
            {/* Style Toggle */}
            <div className="p-2 border-b border-white/10">
              <button
                onClick={() => setShowStylePicker(!showStylePicker)}
                className="w-full flex items-center justify-between text-[10px] text-white/40
                         uppercase tracking-wider hover:text-white/60 transition-colors"
              >
                <span>Style: {translationStyles.find(s => s.id === selectedStyle)?.label}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showStylePicker ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {showStylePicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {translationStyles.map(style => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style.id);
                          setShowStylePicker(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs rounded
                                 transition-colors ${
                                   selectedStyle === style.id
                                     ? 'bg-[#D4B896]/20 text-[#D4B896]'
                                     : 'text-white/60 hover:bg-white/5'
                                 }`}
                      >
                        <span className="font-medium">{style.label}</span>
                        <span className="text-[10px] text-white/40">— {style.description}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* System List */}
            <div className="p-2 border-b border-white/10">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">
                Translate to...
              </span>
            </div>

            <div className="max-h-[240px] overflow-y-auto">
              {wisdomSystems.map(system => (
                <button
                  key={system.id}
                  onClick={() => handleTranslate(system.id)}
                  disabled={isTranslating}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm
                           text-white/70 hover:text-white hover:bg-white/5
                           disabled:opacity-50 transition-colors"
                >
                  <span>{system.icon}</span>
                  <span>{system.name}</span>
                  {isTranslating && selectedSystem === system.id && (
                    <Loader2 className="w-3 h-3 animate-spin ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && (
        <div className="mt-1 px-2 py-1 bg-red-500/20 border border-red-500/30
                      rounded text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Translations as Collapsible Child Cards */}
      {translations.length > 0 && (
        <div className="mt-3 space-y-2">
          {translations.map(translation => {
            const system = wisdomSystems.find(s => s.id === translation.toSystem);
            const isExpanded = expandedTranslations.has(translation.toSystem);

            return (
              <motion.div
                key={translation.toSystem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-2 border-[#D4B896]/40 pl-3"
              >
                {/* Collapse Header */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTranslationExpanded(translation.toSystem)}
                    className="flex items-center gap-1.5 text-xs text-[#D4B896]/80
                             hover:text-[#D4B896] transition-colors"
                  >
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <span>{system?.icon}</span>
                    <span className="font-medium">Translated to {system?.name}</span>
                    {translation.lensUsed !== 'member-default' && (
                      <span className="text-white/40">· {translation.lensUsed}</span>
                    )}
                  </button>
                  <button
                    onClick={() => removeTranslation(translation.toSystem)}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors ml-auto"
                    title="Remove translation"
                  >
                    <X className="w-3 h-3 text-white/40 hover:text-white/60" />
                  </button>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-3 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-lg">
                        <p className="text-sm text-white/80 leading-relaxed">
                          {translation.translatedText}
                        </p>
                        {translation.confidence < 0.7 && (
                          <p className="mt-2 text-[10px] text-white/40">
                            Confidence: {Math.round(translation.confidence * 100)}%
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TranslateMessageButton;
