'use client';

/**
 * Shadow Work Guide
 *
 * Multi-step guided journey for shadow integration.
 * Not therapy - consciousness exploration with archetypal awareness.
 *
 * Based on Jungian shadow work principles:
 * - Recognition (seeing the pattern)
 * - Embodiment (feeling it in the body)
 * - Dialogue (listening to the shadow)
 * - Gold extraction (finding the gift)
 * - Integration (welcoming home)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  Heart,
  Eye,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  Check,
  Clock,
  Wind,
  Droplets,
  Flame,
  Mountain,
} from 'lucide-react';
import { ShadowFlow, ShadowFlowStep } from '@/lib/consciousness/shadowWorkFlows';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface ShadowWorkGuideProps {
  /** Pre-selected flow to start with */
  flowId?: string;
  /** User ID for session tracking */
  userId: string;
  /** Callback when session completes */
  onComplete?: (responses: Record<string, string>) => void;
  /** Callback to close the guide */
  onClose?: () => void;
  /** Day mode styling */
  isDayMode?: boolean;
}

interface FlowSummary {
  id: string;
  type: string;
  title: string;
  description: string;
  duration: number;
  stepCount?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Element Icons
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_ICONS: Record<string, typeof Wind> = {
  air: Wind,
  water: Droplets,
  fire: Flame,
  earth: Mountain,
};

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  air: {
    bg: 'bg-sky-500/20',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  water: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  fire: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  earth: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function ShadowWorkGuide({
  flowId: initialFlowId,
  userId,
  onComplete,
  onClose,
  isDayMode = false,
}: ShadowWorkGuideProps) {
  // State
  const [availableFlows, setAvailableFlows] = useState<FlowSummary[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<ShadowFlow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [view, setView] = useState<'selection' | 'journey' | 'complete'>('selection');

  // Fetch available flows
  useEffect(() => {
    async function fetchFlows() {
      try {
        const res = await fetch('/api/consciousness/shadow-work');
        const data = await res.json();
        if (data.success) {
          setAvailableFlows(data.data.flows || []);
        }
      } catch (error) {
        console.error('Failed to fetch shadow flows:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFlows();
  }, []);

  // Auto-select flow if provided
  useEffect(() => {
    if (initialFlowId && !selectedFlow) {
      selectFlow(initialFlowId);
    }
  }, [initialFlowId]);

  // Select and start a flow
  const selectFlow = async (flowId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/consciousness/shadow-work?flowId=${flowId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedFlow(data.data);
        setView('journey');
        setCurrentStepIndex(0);
        setResponses({});
        setCurrentResponse('');
      }
    } catch (error) {
      console.error('Failed to fetch flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle response submission
  const submitResponse = () => {
    if (!selectedFlow || !currentResponse.trim()) return;

    const step = selectedFlow.steps[currentStepIndex];
    const newResponses = { ...responses, [step.id]: currentResponse };
    setResponses(newResponses);
    setCurrentResponse('');

    // Move to next step or complete
    if (currentStepIndex < selectedFlow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setShowCompletion(true);
      setView('complete');
      onComplete?.(newResponses);
    }
  };

  // Go back a step
  const goBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = selectedFlow!.steps[currentStepIndex - 1];
      setCurrentResponse(responses[prevStep.id] || '');
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Reset to flow selection
  const resetToSelection = () => {
    setSelectedFlow(null);
    setCurrentStepIndex(0);
    setResponses({});
    setCurrentResponse('');
    setShowCompletion(false);
    setView('selection');
  };

  const currentStep = selectedFlow?.steps[currentStepIndex];
  const progress = selectedFlow
    ? ((currentStepIndex + 1) / selectedFlow.steps.length) * 100
    : 0;

  // Loading state
  if (isLoading && !selectedFlow) {
    return (
      <div
        className={`min-h-[400px] flex items-center justify-center ${
          isDayMode ? 'bg-stone-50' : 'bg-stone-900'
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Moon className={`w-8 h-8 ${isDayMode ? 'text-violet-500' : 'text-violet-400'}`} />
        </motion.div>
      </div>
    );
  }

  // Flow selection view
  if (view === 'selection') {
    return (
      <div className={`p-6 ${isDayMode ? 'bg-stone-50' : 'bg-stone-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDayMode ? 'bg-violet-100' : 'bg-violet-500/20'
              }`}
            >
              <Moon className={`w-5 h-5 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`} />
            </div>
            <div>
              <h2
                className={`text-lg font-medium ${
                  isDayMode ? 'text-stone-800' : 'text-white'
                }`}
              >
                Shadow Work
              </h2>
              <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                Choose a guided journey
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDayMode ? 'hover:bg-stone-200' : 'hover:bg-stone-800'
              }`}
            >
              <X className={`w-5 h-5 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`} />
            </button>
          )}
        </div>

        {/* Safety note */}
        <div
          className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${
            isDayMode ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              isDayMode ? 'text-amber-600' : 'text-amber-400'
            }`}
          />
          <p className={`text-sm ${isDayMode ? 'text-amber-800' : 'text-amber-200'}`}>
            This is exploration, not therapy. If strong emotions arise, you can pause at any
            time. Honor your pace.
          </p>
        </div>

        {/* Flow cards */}
        <div className="space-y-3">
          {availableFlows.map((flow) => (
            <button
              key={flow.id}
              onClick={() => selectFlow(flow.id)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                isDayMode
                  ? 'bg-white border border-stone-200 hover:border-violet-300 hover:shadow-md'
                  : 'bg-stone-800/50 border border-stone-700 hover:border-violet-500/50 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3
                    className={`font-medium mb-1 ${
                      isDayMode ? 'text-stone-800' : 'text-white'
                    }`}
                  >
                    {flow.title}
                  </h3>
                  <p
                    className={`text-sm mb-2 ${
                      isDayMode ? 'text-stone-600' : 'text-stone-400'
                    }`}
                  >
                    {flow.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`flex items-center gap-1 ${
                        isDayMode ? 'text-stone-500' : 'text-stone-500'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {flow.duration} min
                    </span>
                    {flow.stepCount && (
                      <span
                        className={`${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}
                      >
                        {flow.stepCount} steps
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 ${isDayMode ? 'text-stone-400' : 'text-stone-500'}`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Journey view
  if (view === 'journey' && selectedFlow && currentStep) {
    const ElementIcon = currentStep.element
      ? ELEMENT_ICONS[currentStep.element]
      : Eye;
    const elementColors = currentStep.element
      ? ELEMENT_COLORS[currentStep.element]
      : { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' };

    return (
      <div className={`flex flex-col h-full ${isDayMode ? 'bg-stone-50' : 'bg-stone-900'}`}>
        {/* Progress header */}
        <div className={`p-4 border-b ${isDayMode ? 'border-stone-200' : 'border-stone-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
              Step {currentStepIndex + 1} of {selectedFlow.steps.length}
            </span>
            <button
              onClick={resetToSelection}
              className={`text-sm ${
                isDayMode ? 'text-stone-500 hover:text-stone-700' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Exit
            </button>
          </div>
          <div
            className={`h-1.5 rounded-full overflow-hidden ${
              isDayMode ? 'bg-stone-200' : 'bg-stone-800'
            }`}
          >
            <motion.div
              className={`h-full ${isDayMode ? 'bg-violet-500' : 'bg-violet-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${elementColors.bg}`}
                >
                  <ElementIcon className={`w-5 h-5 ${elementColors.text}`} />
                </div>
                <h3
                  className={`text-lg font-medium ${
                    isDayMode ? 'text-stone-800' : 'text-white'
                  }`}
                >
                  {currentStep.title}
                </h3>
              </div>

              {/* Instruction */}
              <p
                className={`mb-6 leading-relaxed ${
                  isDayMode ? 'text-stone-700' : 'text-stone-300'
                }`}
              >
                {currentStep.instruction}
              </p>

              {/* Body prompt if present */}
              {currentStep.bodyPrompt && (
                <div
                  className={`p-4 rounded-xl mb-6 ${
                    isDayMode ? 'bg-rose-50 border border-rose-200' : 'bg-rose-500/10 border border-rose-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Heart
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isDayMode ? 'text-rose-500' : 'text-rose-400'
                      }`}
                    />
                    <p
                      className={`text-sm ${isDayMode ? 'text-rose-800' : 'text-rose-200'}`}
                    >
                      {currentStep.bodyPrompt}
                    </p>
                  </div>
                </div>
              )}

              {/* Prompt */}
              <div
                className={`p-4 rounded-xl mb-4 ${
                  isDayMode ? 'bg-violet-50 border border-violet-200' : 'bg-violet-500/10 border border-violet-500/20'
                }`}
              >
                <p
                  className={`font-medium ${
                    isDayMode ? 'text-violet-800' : 'text-violet-200'
                  }`}
                >
                  {currentStep.prompt}
                </p>
              </div>

              {/* Response textarea */}
              <textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Take your time. Write what comes..."
                rows={6}
                className={`w-full p-4 rounded-xl resize-none focus:outline-none focus:ring-2 ${
                  isDayMode
                    ? 'bg-white border border-stone-200 text-stone-800 placeholder-stone-400 focus:ring-violet-500/50'
                    : 'bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:ring-violet-500/50'
                }`}
              />

              {/* Suggested time */}
              {currentStep.suggestedTime && (
                <p
                  className={`text-xs mt-2 flex items-center gap-1 ${
                    isDayMode ? 'text-stone-500' : 'text-stone-500'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Suggested: {Math.floor(currentStep.suggestedTime / 60)} min
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation footer */}
        <div
          className={`p-4 border-t ${
            isDayMode ? 'border-stone-200' : 'border-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentStepIndex === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : isDayMode
                  ? 'hover:bg-stone-200'
                  : 'hover:bg-stone-800'
              } ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={submitResponse}
              disabled={!currentResponse.trim()}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                !currentResponse.trim()
                  ? 'opacity-50 cursor-not-allowed bg-stone-600 text-stone-400'
                  : isDayMode
                  ? 'bg-violet-500 text-white hover:bg-violet-600'
                  : 'bg-violet-500 text-white hover:bg-violet-400'
              }`}
            >
              {currentStepIndex === selectedFlow.steps.length - 1 ? 'Complete' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion view
  if (view === 'complete' && selectedFlow) {
    return (
      <div
        className={`p-6 text-center ${isDayMode ? 'bg-stone-50' : 'bg-stone-900'}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
            isDayMode ? 'bg-violet-100' : 'bg-violet-500/20'
          }`}
        >
          <Sparkles
            className={`w-8 h-8 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}
          />
        </motion.div>

        <h2
          className={`text-xl font-medium mb-3 ${
            isDayMode ? 'text-stone-800' : 'text-white'
          }`}
        >
          Journey Complete
        </h2>

        <p
          className={`mb-6 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}
        >
          You&apos;ve completed &quot;{selectedFlow.title}&quot;
        </p>

        {/* Integration practice */}
        <div
          className={`p-4 rounded-xl mb-6 text-left ${
            isDayMode ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          <h4
            className={`font-medium mb-2 flex items-center gap-2 ${
              isDayMode ? 'text-amber-800' : 'text-amber-300'
            }`}
          >
            <Sun className="w-4 h-4" />
            Integration Practice
          </h4>
          <p
            className={`text-sm ${isDayMode ? 'text-amber-700' : 'text-amber-200'}`}
          >
            {selectedFlow.integrationPractice}
          </p>
        </div>

        {/* Safety note */}
        <p
          className={`text-sm mb-6 ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}
        >
          {selectedFlow.safetyNote}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={resetToSelection}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              isDayMode
                ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            Another Journey
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                isDayMode
                  ? 'bg-violet-500 text-white hover:bg-violet-600'
                  : 'bg-violet-500 text-white hover:bg-violet-400'
              }`}
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
