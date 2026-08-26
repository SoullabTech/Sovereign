'use client';

/**
 * NEXT STEP BUILDER
 *
 * Takes any task → smallest next physical action + optional timeblock.
 *
 * "What's the very next thing your hands would do?"
 *
 * Rules:
 * - Works in under 60 seconds
 * - Requires <3 choices
 * - Ends in a real-world action (calendar block or immediate start)
 * - No new inbox created
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Calendar, Play, Clock, CheckCircle, Zap } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface NextStepBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: NextStepResult) => void;
  task?: string; // The task to break down
  context?: string; // Additional context from conversation
  memberId?: string; // For stewardship weight tracking
}

export interface NextStepResult {
  originalTask: string;
  nextStep: string;
  action: 'start-now' | 'schedule' | 'remind-later';
  scheduledTime?: Date;
  duration?: number; // minutes
  stewardship?: {
    threshold: 'none' | 'acknowledgment' | 'invitation' | 'pause';
    weeklyWeight: number;
    projectedWeight: number;
    tier: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const NEXT_STEP_PROMPTS = [
  "What would your hands do first?",
  "If you had only 5 minutes, what would you start with?",
  "What's the tiniest action that counts as 'started'?",
];

const TIME_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
];

const SCHEDULE_OPTIONS = [
  { label: 'In 10 minutes', getTime: () => new Date(Date.now() + 10 * 60 * 1000) },
  { label: 'In 1 hour', getTime: () => new Date(Date.now() + 60 * 60 * 1000) },
  { label: 'Tomorrow morning', getTime: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }},
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function NextStepBuilder({
  isOpen,
  onClose,
  onComplete,
  task = '',
  context = '',
  memberId
}: NextStepBuilderProps) {
  const [phase, setPhase] = useState<'task' | 'step' | 'action' | 'schedule' | 'done'>('task');
  const [taskText, setTaskText] = useState(task);
  const [nextStep, setNextStep] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [promptIndex] = useState(() => Math.floor(Math.random() * NEXT_STEP_PROMPTS.length));
  const [isProcessing, setIsProcessing] = useState(false);

  // Skip to step phase if task provided
  useEffect(() => {
    if (task && task.trim()) {
      setTaskText(task);
      setPhase('step');
    }
  }, [task]);

  const handleTaskSubmit = useCallback(() => {
    if (taskText.trim()) {
      setPhase('step');
    }
  }, [taskText]);

  const handleStepSubmit = useCallback(() => {
    if (nextStep.trim()) {
      setPhase('action');
    }
  }, [nextStep]);

  const handleAction = useCallback(async (action: 'start-now' | 'schedule' | 'remind-later') => {
    if (action === 'schedule') {
      setPhase('schedule');
      return;
    }

    await completeFlow(action);
  }, []);

  const handleSchedule = useCallback(async (getTime: () => Date) => {
    await completeFlow('schedule', getTime());
  }, []);

  const completeFlow = async (
    action: 'start-now' | 'schedule' | 'remind-later',
    scheduledTime?: Date
  ) => {
    setIsProcessing(true);

    const result: NextStepResult = {
      originalTask: taskText,
      nextStep,
      action,
      scheduledTime,
      duration: selectedDuration
    };

    // Call backend to schedule/remind
    // Optional field: absent is `undefined`, not null.
    let stewardship = undefined;
    try {
      const response = await fetch('/api/focus/next-step', {
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
        console.error('Next step API failed:', await response.text());
      }
    } catch (err) {
      console.error('Next step error:', err);
    }

    setIsProcessing(false);
    setPhase('done');

    setTimeout(() => {
      onComplete?.({ ...result, stewardship });
      onClose();
    }, 1500);
  };

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
            <div className="flex items-center gap-2 text-emerald-400/90">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Next Step</span>
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
              {/* PHASE: TASK */}
              {phase === 'task' && (
                <motion.div
                  key="task"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-stone-300 text-sm">
                    What's the thing you've been putting off?
                  </p>

                  <input
                    type="text"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTaskSubmit()}
                    placeholder="e.g., Clean up my inbox..."
                    className="w-full bg-stone-800/50 border border-stone-700/50 rounded-xl
                               px-4 py-3 text-stone-100 placeholder:text-stone-500
                               focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/30"
                    autoFocus
                  />

                  <button
                    onClick={handleTaskSubmit}
                    disabled={!taskText.trim()}
                    className="w-full py-3 rounded-xl font-medium transition-all
                               bg-emerald-600/80 hover:bg-emerald-600 text-white
                               disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    Break it down <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* PHASE: STEP */}
              {phase === 'step' && (
                <motion.div
                  key="step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-3 bg-stone-800/30 rounded-lg border border-stone-700/30">
                    <p className="text-stone-400 text-xs mb-1">Task:</p>
                    <p className="text-stone-300 text-sm">{taskText}</p>
                  </div>

                  <p className="text-emerald-300/90 text-center font-medium">
                    {NEXT_STEP_PROMPTS[promptIndex]}
                  </p>

                  <input
                    type="text"
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStepSubmit()}
                    placeholder="e.g., Open the app and archive 5 emails..."
                    className="w-full bg-stone-800/50 border border-stone-700/50 rounded-xl
                               px-4 py-3 text-stone-100 placeholder:text-stone-500
                               focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/30"
                    autoFocus
                  />

                  <button
                    onClick={handleStepSubmit}
                    disabled={!nextStep.trim()}
                    className="w-full py-3 rounded-xl font-medium transition-all
                               bg-emerald-600/80 hover:bg-emerald-600 text-white
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Got it
                  </button>
                </motion.div>
              )}

              {/* PHASE: ACTION */}
              {phase === 'action' && (
                <motion.div
                  key="action"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-700/30">
                    <p className="text-emerald-400/80 text-xs mb-1">Next step:</p>
                    <p className="text-emerald-200 font-medium">{nextStep}</p>
                  </div>

                  <p className="text-stone-300 text-center text-sm">
                    What works right now?
                  </p>

                  {/* Duration selector */}
                  <div className="flex gap-2 justify-center">
                    {TIME_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedDuration(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors
                                    ${selectedDuration === opt.value
                                      ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50'
                                      : 'bg-stone-800/50 text-stone-400 border border-stone-700/50 hover:border-stone-600'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <ActionButton
                      icon={<Play className="w-5 h-5" />}
                      label="Start now"
                      description={`Set a ${selectedDuration} minute timer`}
                      variant="primary"
                      onClick={() => handleAction('start-now')}
                    />
                    <ActionButton
                      icon={<Calendar className="w-5 h-5" />}
                      label="Schedule it"
                      description="Block time on your calendar"
                      onClick={() => handleAction('schedule')}
                    />
                    <ActionButton
                      icon={<Clock className="w-5 h-5" />}
                      label="Remind me later"
                      description="I'll come back to this"
                      onClick={() => handleAction('remind-later')}
                    />
                  </div>
                </motion.div>
              )}

              {/* PHASE: SCHEDULE */}
              {phase === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-stone-300 text-center text-sm">
                    When should I block this?
                  </p>

                  <div className="grid gap-3">
                    {SCHEDULE_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleSchedule(opt.getTime)}
                        disabled={isProcessing}
                        className="w-full p-4 rounded-xl text-left
                                   bg-stone-800/30 border border-stone-700/30
                                   hover:bg-stone-800/60 hover:border-emerald-600/30
                                   transition-all disabled:opacity-50"
                      >
                        <p className="font-medium text-stone-200">{opt.label}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPhase('action')}
                    className="w-full py-2 text-stone-500 hover:text-stone-300 text-sm"
                  >
                    Back
                  </button>
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
                  <p className="text-stone-300">You have a next step. That's everything.</p>
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

function ActionButton({
  icon,
  label,
  description,
  variant = 'default',
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  variant?: 'default' | 'primary';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 rounded-xl text-left transition-all
                  ${variant === 'primary'
                    ? 'bg-emerald-600/30 border border-emerald-500/40 hover:bg-emerald-600/50'
                    : 'bg-stone-800/30 border border-stone-700/30 hover:bg-stone-800/60 hover:border-stone-600/50'}`}
    >
      <div className={`p-2 rounded-lg transition-colors
                       ${variant === 'primary'
                         ? 'bg-emerald-500/30 text-emerald-300'
                         : 'bg-stone-700/50 text-stone-400'}`}>
        {icon}
      </div>
      <div>
        <p className={`font-medium ${variant === 'primary' ? 'text-emerald-200' : 'text-stone-200'}`}>
          {label}
        </p>
        <p className="text-sm text-stone-500">{description}</p>
      </div>
    </button>
  );
}

export default NextStepBuilder;
