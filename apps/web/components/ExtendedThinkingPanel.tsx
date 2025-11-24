'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, Sparkles, Scale, ChevronDown, ChevronRight, X, Pin, PinOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ThinkingStep {
  id: string;
  step: 'element_detection' | 'mirror_phase' | 'balance_selection' | 'response_shaping';
  reasoning: string;
  confidence: number;
  alternatives?: string[];
  timestamp: number;
  metadata?: {
    element?: string;
    jungianMapping?: string;
    prosodyChoice?: string;
  };
}

interface ExtendedThinkingPanelProps {
  steps: ThinkingStep[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const stepIcons = {
  element_detection: Search,
  mirror_phase: '🪞',
  balance_selection: Scale,
  response_shaping: Sparkles
};

const stepLabels = {
  element_detection: 'Element Detection',
  mirror_phase: 'Mirror Phase',
  balance_selection: 'Balance Selection',
  response_shaping: 'Response Shaping'
};

export default function ExtendedThinkingPanel({
  steps,
  isOpen,
  onClose,
  className = ''
}: ExtendedThinkingPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isPinned, setIsPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoCollapseTimer = useRef<NodeJS.Timeout>();
  const panelRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile after 10s unless pinned
  useEffect(() => {
    if (isMobile && isOpen && !isPinned) {
      autoCollapseTimer.current = setTimeout(() => {
        onClose();
      }, 10000);
    }
    return () => {
      if (autoCollapseTimer.current) {
        clearTimeout(autoCollapseTimer.current);
      }
    };
  }, [isMobile, isOpen, isPinned, onClose]);

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const renderStepIcon = (step: ThinkingStep['step']) => {
    const icon = stepIcons[step];
    if (typeof icon === 'string') {
      return <span className="text-xl">{icon}</span>;
    }
    const Icon = icon;
    return <Icon className="w-5 h-5" />;
  };

  const renderStepCard = (step: ThinkingStep) => {
    const isExpanded = expandedSteps.has(step.id);
    
    return (
      <div
        key={step.id}
        className={`
          border rounded-lg p-3 mb-2 transition-all cursor-pointer
          ${isMobile ? 'bg-gray-800 border-gray-700' : 'bg-gray-900/50 border-gray-800'}
          ${isExpanded ? 'shadow-lg' : 'hover:bg-gray-800/70'}
        `}
        onClick={() => toggleStepExpansion(step.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderStepIcon(step.step)}
            <div>
              <h4 className="text-sm font-medium text-gray-200">
                {stepLabels[step.step]}
              </h4>
              <p className="text-xs text-gray-400">
                {step.reasoning.slice(0, 50)}...
                <span className="ml-2 text-[#FFD700]">
                  ({formatConfidence(step.confidence)})
                </span>
              </p>
            </div>
          </div>
          <div className="text-gray-400">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-sm text-gray-300 mb-2">{step.reasoning}</p>
                
                {step.alternatives && step.alternatives.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-xs font-medium text-gray-400 mb-1">Alternatives considered:</h5>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {step.alternatives.map((alt, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {step.metadata && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {step.metadata.element && (
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                        {step.metadata.element}
                      </span>
                    )}
                    {step.metadata.jungianMapping && (
                      <span className="px-2 py-1 bg-amber-900/30 text-amber-400 text-xs rounded">
                        {step.metadata.jungianMapping}
                      </span>
                    )}
                    {step.metadata.prosodyChoice && (
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                        {step.metadata.prosodyChoice}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Mobile: Bottom drawer
  if (isMobile) {
    return (
      <>
        {/* Floating badge when minimized */}
        <AnimatePresence>
          {/* Extended Thinking indicator removed - access via Brain button in MayaInputBar */}
        </AnimatePresence>

        {/* Bottom drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={panelRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`
                fixed bottom-0 left-0 right-0 z-50
                bg-gray-900 border-t border-gray-700
                rounded-t-2xl shadow-2xl
                max-h-[70vh] overflow-hidden
                ${className}
              `}
            >
              {/* Drawer handle */}
              <div className="p-2 pb-0">
                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#FFD700]" />
                  <h3 className="text-base font-medium text-gray-200">Maya&apos;s Thinking</h3>
                  {process.env.NODE_ENV === 'development' && (
                    <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded">
                      Dev Only
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                    aria-label={isPinned ? 'Unpin panel' : 'Pin panel'}
                  >
                    {isPinned ? (
                      <PinOff className="w-4 h-4 text-[#FFD700]" />
                    ) : (
                      <Pin className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                    aria-label="Close panel"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)]">
                {steps.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Maya&apos;s reasoning will appear here...
                  </p>
                ) : (
                  steps.map(renderStepCard)
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: Side panel
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`
            fixed right-0 top-0 bottom-0 z-40
            w-96 bg-gray-900/95 backdrop-blur-md
            border-l border-gray-800 shadow-2xl
            flex flex-col
            ${className}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-[#FFD700]" />
              <h3 className="text-lg font-semibold text-gray-200">Extended Thinking</h3>
              {process.env.NODE_ENV === 'development' && (
                <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded">
                  Dev Only
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Brain className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-center">
                  Maya&apos;s reasoning steps will appear here
                  <br />
                  as she processes your message.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map(renderStepCard)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
            Showing Maya&apos;s internal reasoning process
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}