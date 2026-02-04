'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  PenLine,
  Copy,
  Check,
  MessageCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ELEMENT_INFO, type ElementKey } from '@/lib/elemental-alchemy/assessmentQuestions';

// Fallback for 'intro' or other non-standard elements
const DEFAULT_ELEMENT_INFO = {
  name: 'Foundation',
  gradient: 'from-violet-500 to-purple-600',
  color: 'violet'
};

// MAIA's voice for speaking insights
const MAIA_VOICE = 'alloy';

// Track current audio for stopping
let currentAudio: HTMLAudioElement | null = null;

const speakMaiaResponse = async (text: string): Promise<void> => {
  // Clean text for speech
  const cleanText = text
    .replace(/\*[^*]+\*/g, '')
    .replace(/\.{3,}/g, '...')
    .replace(/["]/g, '')
    .trim();

  if (!cleanText) return;

  try {
    const response = await apiFetch('/api/voice/openai-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        voice: MAIA_VOICE,
        format: 'mp3',
        speed: 1.0
      })
    });

    if (!response.ok) throw new Error('TTS API error');

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve();
      };
      audio.play().catch(() => resolve());
    });
  } catch (error) {
    console.log('MAIA TTS unavailable:', error);
  }
};

const stopMaiaSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

interface AskMaiaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  teaching: string;
  element: string;
  chapterNum: number;
  chapterTitle?: string;
  chapterContent?: string; // The actual book content to read
  userId: string;
  onSaveToJournal?: (insight: string, teaching: string) => void;
}

export function AskMaiaSheet({
  isOpen,
  onClose,
  teaching,
  element,
  chapterNum,
  chapterTitle,
  chapterContent,
  userId,
  onSaveToJournal
}: AskMaiaSheetProps) {
  const [question, setQuestion] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAskForm, setShowAskForm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const info = ELEMENT_INFO[element as ElementKey] || DEFAULT_ELEMENT_INFO;

  // Clean up content - remove markdown image refs and clean formatting
  const cleanContent = (content: string): string => {
    return content
      .replace(/!\[\]\[image\d+\]/g, '') // Remove image references
      .replace(/\*\*\*/g, '') // Remove bold/italic markers
      .replace(/###\s*/g, '') // Remove markdown headers
      .replace(/####\s*/g, '')
      .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
      .trim();
  };

  const askMaia = async () => {
    setLoading(true);
    setError(null);
    setInsight(null);

    try {
      const res = await fetch('/api/community/elemental-alchemy/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teaching,
          question: question.trim() || undefined,
          element,
          chapterNum,
          chapterTitle,
          chapterContent: chapterContent?.slice(0, 1500), // Include content for context
          userId
        })
      });

      const data = await res.json();

      if (data.ok) {
        setInsight(data.insight);
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (insight) {
      await navigator.clipboard.writeText(insight);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToJournal = () => {
    if (insight && onSaveToJournal) {
      onSaveToJournal(insight, teaching);
      onClose();
    }
  };

  const handleListenToInsight = async () => {
    if (!insight) return;

    if (isSpeaking) {
      stopMaiaSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await speakMaiaResponse(insight);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleClose = () => {
    stopMaiaSpeaking();
    setIsSpeaking(false);
    setQuestion('');
    setInsight(null);
    setError(null);
    setShowAskForm(false);
    onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-900 to-slate-950
                     rounded-t-3xl border-t border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.gradient}
                              flex items-center justify-center`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Chapter {chapterNum}
                  </h2>
                  <p className="text-xs text-white/50">
                    {chapterTitle || info.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Section Title */}
              <div className={`p-4 rounded-xl bg-gradient-to-r ${info.gradient}/10 border border-white/10`}>
                <h3 className={`text-lg font-medium text-white mb-1`}>
                  {teaching}
                </h3>
              </div>

              {/* Book Content */}
              {chapterContent && !insight && (
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-white/80 leading-relaxed whitespace-pre-line text-[15px]">
                    {cleanContent(chapterContent)}
                  </p>
                </div>
              )}

              {/* No content fallback */}
              {!chapterContent && !insight && (
                <div className="text-center py-8 text-white/50">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Full chapter content coming soon.</p>
                  <p className="text-xs mt-1">Ask MAIA for insights on this teaching.</p>
                </div>
              )}

              {/* MAIA's Insight */}
              {insight && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white/70">MAIA&apos;s Insight</span>
                  </div>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                      {insight}
                    </p>
                  </div>

                  {/* Listen Button */}
                  <button
                    onClick={handleListenToInsight}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                             transition-all ${isSpeaking
                               ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                               : 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                             }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        Stop MAIA
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Listen to MAIA
                      </>
                    )}
                  </button>

                  {/* Insight Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                               bg-white/5 border border-white/10 text-white/70
                               hover:bg-white/10 transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    {onSaveToJournal && (
                      <button
                        onClick={handleSaveToJournal}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                 bg-gradient-to-r from-green-600 to-emerald-600 text-white
                                 hover:opacity-90 transition-all"
                      >
                        <PenLine className="w-4 h-4" />
                        Save to Journal
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setInsight(null);
                      setQuestion('');
                      setShowAskForm(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                             bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                  >
                    Ask another question
                  </button>
                </div>
              )}

              {/* Ask Form */}
              {(showAskForm || (!insight && !chapterContent)) && !loading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/70">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Ask MAIA about this</span>
                  </div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="How does this apply to my life? What should I understand more deeply?"
                    rows={3}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-white/30 resize-none focus:outline-none
                             focus:border-amber-500/50"
                  />
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                  <span className="text-white/60">MAIA is reflecting...</span>
                </div>
              )}
            </div>

            {/* Bottom Action */}
            {!insight && !loading && (
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={askMaia}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                           font-medium transition-all
                           bg-gradient-to-r ${info.gradient} text-white hover:opacity-90`}
                >
                  <Sparkles className="w-5 h-5" />
                  {chapterContent ? 'Ask MAIA for Insight' : 'Ask MAIA'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
