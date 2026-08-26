'use client';

/**
 * INBOX TRIAGE
 *
 * The simplest possible capture → classify flow.
 *
 * "Is this a task, an event, or just a thought you don't want to lose?"
 *
 * Rules:
 * - Works in under 60 seconds
 * - Requires <3 choices
 * - Ends in a real-world action
 * - Doesn't create a new inbox (uses calendar/notes you already have)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, CheckCircle, Calendar, ListTodo, Brain, Sparkles } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type CaptureType = 'task' | 'event' | 'thought';

interface InboxTriageProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: TriageResult) => void;
  initialCapture?: string; // Pre-filled from voice/chat
  memberId?: string; // For stewardship weight tracking
}

export interface TriageResult {
  captureText: string;
  type: CaptureType;
  nextAction?: string; // For tasks: what's the next physical action?
  scheduledFor?: Date; // For events: when?
  followUp?: boolean; // Want a reminder?
  stewardship?: {
    threshold: 'none' | 'acknowledgment' | 'invitation' | 'pause';
    weeklyWeight: number;
    projectedWeight: number;
    tier: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function InboxTriage({ isOpen, onClose, onComplete, initialCapture = '', memberId }: InboxTriageProps) {
  const [phase, setPhase] = useState<'capture' | 'classify' | 'refine' | 'done'>('capture');
  const [captureText, setCaptureText] = useState(initialCapture);
  const [selectedType, setSelectedType] = useState<CaptureType | null>(null);
  const [nextAction, setNextAction] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input
  useEffect(() => {
    if (isOpen && phase === 'capture' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, phase]);

  // Skip to classify if we have initial capture
  useEffect(() => {
    if (initialCapture && initialCapture.trim()) {
      setCaptureText(initialCapture);
      setPhase('classify');
    }
  }, [initialCapture]);

  const handleCapture = useCallback(() => {
    if (captureText.trim()) {
      setPhase('classify');
    }
  }, [captureText]);

  const handleClassify = useCallback((type: CaptureType) => {
    setSelectedType(type);
    if (type === 'task') {
      setPhase('refine');
    } else {
      // Events and thoughts complete immediately
      handleComplete(type);
    }
  }, []);

  const handleComplete = useCallback(async (type?: CaptureType) => {
    const finalType = type || selectedType;
    if (!finalType) return;

    setIsProcessing(true);

    const result: TriageResult = {
      captureText,
      type: finalType,
      nextAction: finalType === 'task' ? nextAction : undefined,
    };

    // Call the backend to actually place this somewhere
    // Optional field: absent is `undefined`, not null.
    let stewardship = undefined;
    try {
      const response = await fetch('/api/focus/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          memberId, // For stewardship weight tracking
        })
      });

      if (response.ok) {
        const data = await response.json();
        stewardship = data.stewardship;
      } else {
        console.error('Triage API failed:', await response.text());
      }
    } catch (err) {
      console.error('Triage error:', err);
    }

    setIsProcessing(false);
    setPhase('done');

    setTimeout(() => {
      onComplete?.({ ...result, stewardship });
      onClose();
    }, 1500);
  }, [captureText, selectedType, nextAction, onComplete, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (phase === 'capture') handleCapture();
      else if (phase === 'refine') handleComplete();
    }
  }, [phase, handleCapture, handleComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-gradient-to-b from-stone-900 to-stone-950
                     rounded-2xl border border-stone-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/50">
            <div className="flex items-center gap-2 text-amber-400/90">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Quick Capture</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300
                         hover:bg-stone-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {/* PHASE: CAPTURE */}
              {phase === 'capture' && (
                <motion.div
                  key="capture"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-stone-300 text-sm">
                    What's on your mind? Get it out of your head.
                  </p>

                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={captureText}
                      onChange={(e) => setCaptureText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type or speak..."
                      rows={3}
                      className="w-full bg-stone-800/50 border border-stone-700/50 rounded-xl
                                 px-4 py-3 text-stone-100 placeholder:text-stone-500
                                 focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30
                                 resize-none"
                    />
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors
                                  ${isRecording
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-stone-700/50 text-stone-400 hover:text-stone-200'}`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={handleCapture}
                    disabled={!captureText.trim()}
                    className="w-full py-3 rounded-xl font-medium transition-all
                               bg-amber-600/80 hover:bg-amber-600 text-white
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* PHASE: CLASSIFY */}
              {phase === 'classify' && (
                <motion.div
                  key="classify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-3 bg-stone-800/30 rounded-lg border border-stone-700/30">
                    <p className="text-stone-300 text-sm line-clamp-2">{captureText}</p>
                  </div>

                  <p className="text-amber-300/90 text-center font-medium">
                    What is this?
                  </p>

                  <div className="grid gap-3">
                    <ClassifyButton
                      icon={<ListTodo className="w-5 h-5" />}
                      label="A Task"
                      description="Something I need to do"
                      onClick={() => handleClassify('task')}
                    />
                    <ClassifyButton
                      icon={<Calendar className="w-5 h-5" />}
                      label="An Event"
                      description="Something happening at a time"
                      onClick={() => handleClassify('event')}
                    />
                    <ClassifyButton
                      icon={<Brain className="w-5 h-5" />}
                      label="Just a Thought"
                      description="Something I don't want to forget"
                      onClick={() => handleClassify('thought')}
                    />
                  </div>
                </motion.div>
              )}

              {/* PHASE: REFINE (tasks only) */}
              {phase === 'refine' && (
                <motion.div
                  key="refine"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-amber-300/90 text-center font-medium">
                    What's the very next physical action?
                  </p>

                  <p className="text-stone-400 text-sm text-center">
                    Not the whole project. Just the first tiny step.
                  </p>

                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Open laptop and find the file..."
                    className="w-full bg-stone-800/50 border border-stone-700/50 rounded-xl
                               px-4 py-3 text-stone-100 placeholder:text-stone-500
                               focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30"
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleComplete()}
                      className="flex-1 py-3 rounded-xl font-medium transition-all
                                 bg-stone-700/50 hover:bg-stone-700 text-stone-300"
                    >
                      Skip for now
                    </button>
                    <button
                      onClick={() => handleComplete()}
                      disabled={!nextAction.trim()}
                      className="flex-1 py-3 rounded-xl font-medium transition-all
                                 bg-amber-600/80 hover:bg-amber-600 text-white
                                 disabled:opacity-40"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PHASE: DONE */}
              {phase === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  </motion.div>
                  <p className="text-stone-300">Captured. Out of your head.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ClassifyButton({
  icon,
  label,
  description,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-4 rounded-xl
                 bg-stone-800/30 border border-stone-700/30
                 hover:bg-stone-800/60 hover:border-amber-600/30
                 transition-all group text-left"
    >
      <div className="p-2 rounded-lg bg-stone-700/50 text-amber-400/80
                      group-hover:bg-amber-600/20 transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium text-stone-200">{label}</p>
        <p className="text-sm text-stone-500">{description}</p>
      </div>
    </button>
  );
}

export default InboxTriage;
