/**
 * PHENOMENOLOGICAL MAPPER COMPONENT
 *
 * Comprehensive consciousness state capture for research-grade qualia measurement
 * Integrates with QualiaMeasurementEngine for full phenomenological mapping
 *
 * Features:
 * - 6-dimensional consciousness mapping (via DimensionalSliders)
 * - Rich phenomenological description
 * - Session context capture (practice, intention, setting)
 * - Texture mapping (sensory, emotional, cognitive, somatic)
 * - Symmetry visualization (QRI Symmetry Theory of Valence)
 * - Integration with holographic field state
 */

'use client';

import React, { useState, useEffect } from 'react';
import DimensionalSliders from './DimensionalSliders';
import type {
  ConsciousnessDimensions,
  QualiaInput,
  PhenomenologicalTexture,
  SessionContext
} from '@/lib/consciousness/QualiaMeasurementEngine';

interface PhenomenologicalMapperProps {
  userId: string;
  onCapture: (qualiaInput: QualiaInput) => Promise<void>;
  initialContext?: Partial<SessionContext>;
  mode?: 'full' | 'quick' | 'research';
  showSymmetryViz?: boolean;
}

type MapperStep = 'dimensions' | 'description' | 'texture' | 'context' | 'review';

const PRACTICE_TYPES = [
  { value: 'meditation', label: 'Meditation', icon: '🧘' },
  { value: 'breathwork', label: 'Breathwork', icon: '🌬️' },
  { value: 'psychedelic', label: 'Psychedelic Journey', icon: '🍄' },
  { value: 'contemplation', label: 'Contemplation', icon: '💭' },
  { value: 'movement', label: 'Movement Practice', icon: '💃' },
  { value: 'ritual', label: 'Ritual/Ceremony', icon: '🕯️' },
  { value: 'daily-life', label: 'Daily Life', icon: '☀️' },
  { value: 'dream', label: 'Dream', icon: '🌙' },
  { value: 'other', label: 'Other', icon: '✨' }
];

const SETTING_TYPES = [
  { value: 'solo', label: 'Solo Practice' },
  { value: 'group', label: 'Group/Community' },
  { value: 'guided', label: 'Guided Session' },
  { value: 'retreat', label: 'Retreat' },
  { value: 'therapeutic', label: 'Therapeutic Setting' },
  { value: 'spontaneous', label: 'Spontaneous' }
];

export default function PhenomenologicalMapper({
  userId,
  onCapture,
  initialContext = {},
  mode = 'full',
  showSymmetryViz = true
}: PhenomenologicalMapperProps) {
  const [currentStep, setCurrentStep] = useState<MapperStep>('dimensions');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for qualia input
  const [dimensions, setDimensions] = useState<ConsciousnessDimensions>({
    clarity: 0.5,
    energy: 0.5,
    connection: 0.5,
    expansion: 0.5,
    presence: 0.5,
    flow: 0.5
  });

  const [description, setDescription] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  const [currentInsight, setCurrentInsight] = useState('');

  const [texture, setTexture] = useState<Partial<PhenomenologicalTexture>>({
    sensory: [],
    emotional: [],
    cognitive: [],
    somatic: []
  });

  const [context, setContext] = useState<Partial<SessionContext>>({
    practice: initialContext.practice || 'meditation',
    duration: initialContext.duration || 0,
    intention: initialContext.intention || '',
    setting: initialContext.setting || 'solo',
    substances: initialContext.substances || [],
    facilitator: initialContext.facilitator || undefined
  });

  const [symbols, setSymbols] = useState<string[]>([]);
  const [currentSymbol, setCurrentSymbol] = useState('');

  // Duration tracking
  const [sessionStartTime] = useState(Date.now());

  // Calculate progress
  const progress = {
    dimensions: currentStep !== 'dimensions',
    description: description.length > 0,
    texture: Object.values(texture).some(arr => arr && arr.length > 0),
    context: !!context.practice && !!context.setting,
    review: currentStep === 'review'
  };

  const progressPercentage =
    (Object.values(progress).filter(Boolean).length / Object.keys(progress).length) * 100;

  const handleDimensionsCapture = (dims: ConsciousnessDimensions) => {
    setDimensions(dims);
    if (mode === 'quick') {
      handleFinalSubmit({ dimensions: dims });
    } else {
      setCurrentStep('description');
    }
  };

  const handleTextureToggle = (category: keyof PhenomenologicalTexture, value: string) => {
    setTexture(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleAddInsight = () => {
    if (currentInsight.trim()) {
      setInsights(prev => [...prev, currentInsight.trim()]);
      setCurrentInsight('');
    }
  };

  const handleAddSymbol = () => {
    if (currentSymbol.trim()) {
      setSymbols(prev => [...prev, currentSymbol.trim()]);
      setCurrentSymbol('');
    }
  };

  const handleFinalSubmit = async (overrides?: Partial<QualiaInput>) => {
    setIsSubmitting(true);
    try {
      const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);

      const qualiaInput: QualiaInput = {
        dimensions: overrides?.dimensions || dimensions,
        description,
        insights,
        symbols,
        texture: texture as PhenomenologicalTexture,
        context: {
          ...context,
          duration: context.duration || durationSeconds
        } as SessionContext,
        timestamp: new Date()
      };

      await onCapture(qualiaInput);
    } catch (error) {
      console.error('Failed to capture qualia state:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick mode: only dimensions
  if (mode === 'quick') {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <DimensionalSliders
          onCapture={handleDimensionsCapture}
          initialValues={dimensions}
          showLabels={true}
          compact={false}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Phenomenological Mapping
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['dimensions', 'description', 'texture', 'context', 'review'] as MapperStep[]).map((step, idx) => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              currentStep === step
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                : progress[step as keyof typeof progress]
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {idx + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* STEP 1: Dimensions */}
        {currentStep === 'dimensions' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Dimensional Mapping
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Begin by capturing your current state across 6 consciousness dimensions
            </p>
            <DimensionalSliders
              onCapture={handleDimensionsCapture}
              initialValues={dimensions}
              showLabels={true}
              compact={false}
            />
          </div>
        )}

        {/* STEP 2: Description */}
        {currentStep === 'description' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Phenomenological Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Describe your subjective experience in your own words
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was the quality of your experience? What stood out? What was the phenomenological texture?"
                className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Insights & Realizations
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInsight}
                  onChange={(e) => setCurrentInsight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInsight()}
                  placeholder="Add an insight..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddInsight}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
              {insights.length > 0 && (
                <div className="mt-3 space-y-2">
                  {insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                    >
                      <span className="text-purple-600 dark:text-purple-400">💡</span>
                      <span className="flex-1 text-sm text-gray-900 dark:text-white">{insight}</span>
                      <button
                        onClick={() => setInsights(prev => prev.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Symbolic Content (archetypal images, metaphors, visions)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSymbol}
                  onChange={(e) => setCurrentSymbol(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                  placeholder="e.g., 'spiral', 'ocean', 'light'"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddSymbol}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Add
                </button>
              </div>
              {symbols.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {symbols.map((symbol, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      {symbol}
                      <button
                        onClick={() => setSymbols(prev => prev.filter((_, i) => i !== idx))}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep('dimensions')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep('texture')}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Texture */}
        {currentStep === 'texture' && (
          <TextureMapper
            texture={texture}
            onToggle={handleTextureToggle}
            onBack={() => setCurrentStep('description')}
            onContinue={() => setCurrentStep('context')}
          />
        )}

        {/* STEP 4: Context */}
        {currentStep === 'context' && (
          <ContextCapture
            context={context}
            onChange={setContext}
            onBack={() => setCurrentStep('texture')}
            onContinue={() => setCurrentStep('review')}
          />
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 'review' && (
          <ReviewSubmit
            dimensions={dimensions}
            description={description}
            insights={insights}
            symbols={symbols}
            texture={texture}
            context={context}
            onBack={() => setCurrentStep('context')}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}

/**
 * TEXTURE MAPPER STEP
 */
interface TextureMapperProps {
  texture: Partial<PhenomenologicalTexture>;
  onToggle: (category: keyof PhenomenologicalTexture, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function TextureMapper({ texture, onToggle, onBack, onContinue }: TextureMapperProps) {
  const textureCategories = {
    sensory: {
      label: 'Sensory',
      icon: '👁️',
      options: ['visual', 'auditory', 'tactile', 'olfactory', 'gustatory', 'kinesthetic', 'proprioceptive']
    },
    emotional: {
      label: 'Emotional',
      icon: '❤️',
      options: ['joy', 'sadness', 'fear', 'anger', 'surprise', 'disgust', 'peace', 'love', 'awe', 'gratitude']
    },
    cognitive: {
      label: 'Cognitive',
      icon: '🧠',
      options: ['clarity', 'confusion', 'insight', 'memory', 'imagination', 'reasoning', 'intuition', 'metacognition']
    },
    somatic: {
      label: 'Somatic',
      icon: '🫀',
      options: ['tingling', 'warmth', 'coolness', 'pressure', 'lightness', 'heaviness', 'energy', 'relaxation', 'tension']
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Phenomenological Texture
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Select the qualities present in your experience (optional but valuable for research)
        </p>
      </div>

      {(Object.entries(textureCategories) as [keyof PhenomenologicalTexture, any][]).map(([category, config]) => (
        <div key={category}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <span className="text-lg">{config.icon}</span>
            {config.label}
          </label>
          <div className="flex flex-wrap gap-2">
            {config.options.map((option: string) => {
              const isSelected = texture[category]?.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => onToggle(category, option)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

/**
 * CONTEXT CAPTURE STEP
 */
interface ContextCaptureProps {
  context: Partial<SessionContext>;
  onChange: (context: Partial<SessionContext>) => void;
  onBack: () => void;
  onContinue: () => void;
}

function ContextCapture({ context, onChange, onBack, onContinue }: ContextCaptureProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Session Context
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Help us understand the context of your experience
        </p>
      </div>

      {/* Practice Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Practice Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PRACTICE_TYPES.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => onChange({ ...context, practice: value })}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                context.practice === value
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Duration (minutes)
        </label>
        <input
          type="number"
          value={Math.floor((context.duration || 0) / 60)}
          onChange={(e) => onChange({ ...context, duration: parseInt(e.target.value) * 60 })}
          min="0"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Intention */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Intention
        </label>
        <input
          type="text"
          value={context.intention || ''}
          onChange={(e) => onChange({ ...context, intention: e.target.value })}
          placeholder="What was your intention for this session?"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Setting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Setting
        </label>
        <div className="grid grid-cols-2 gap-3">
          {SETTING_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ ...context, setting: value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                context.setting === value
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600"
        >
          Review →
        </button>
      </div>
    </div>
  );
}

/**
 * REVIEW & SUBMIT STEP
 */
interface ReviewSubmitProps {
  dimensions: ConsciousnessDimensions;
  description: string;
  insights: string[];
  symbols: string[];
  texture: Partial<PhenomenologicalTexture>;
  context: Partial<SessionContext>;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

function ReviewSubmit({
  dimensions,
  description,
  insights,
  symbols,
  texture,
  context,
  onBack,
  onSubmit,
  isSubmitting
}: ReviewSubmitProps) {
  const dimensionLabels: Record<keyof ConsciousnessDimensions, string> = {
    clarity: 'Clarity',
    energy: 'Energy',
    connection: 'Connection',
    expansion: 'Expansion',
    presence: 'Presence',
    flow: 'Flow'
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Review & Submit
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Review your phenomenological mapping before submitting
        </p>
      </div>

      {/* Dimensions Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Dimensional State
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(dimensions) as [keyof ConsciousnessDimensions, number][]).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {dimensionLabels[key]}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {Math.round(value * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </h4>
          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Insights ({insights.length})
          </h4>
          <ul className="space-y-1">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-gray-900 dark:text-white flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Symbols */}
      {symbols.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Symbolic Content
          </h4>
          <div className="flex flex-wrap gap-2">
            {symbols.map((symbol, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                {symbol}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Context */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Session Context
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Practice:</span>
            <span className="text-gray-900 dark:text-white">{context.practice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
            <span className="text-gray-900 dark:text-white">
              {Math.floor((context.duration || 0) / 60)} minutes
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Setting:</span>
            <span className="text-gray-900 dark:text-white">{context.setting}</span>
          </div>
          {context.intention && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Intention:</span>
              <span className="text-gray-900 dark:text-white">{context.intention}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Qualia State'}
        </button>
      </div>
    </div>
  );
}
