"use client";

/**
 * STELLIUM PERSONA TRAINING
 *
 * Train MAIA to become your apprentice
 * Voice patterns, framework, sacred boundaries
 *
 * "The apprentice who never forgets, never burns out,
 *  and knows when to stay quiet."
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  Sparkles,
  BookOpen,
  MessageSquare,
  Shield,
  Upload,
  Check,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { PractitionerPersona, Modality } from '@/lib/stellium/types';

interface PersonaTrainingProps {
  practitionerId: string;
  personaId?: string;
  onComplete?: () => void;
}

type TrainingStep = 'modality' | 'voice' | 'framework' | 'boundaries' | 'complete';

const MODALITY_OPTIONS: Array<{
  value: Modality;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'astrology',
    label: 'Astrology',
    description: 'Birth charts, transits, cosmic timing',
    icon: '✨',
  },
  {
    value: 'therapy',
    label: 'Therapy',
    description: 'Psychotherapy, counseling, mental health',
    icon: '🌿',
  },
  {
    value: 'bodywork',
    label: 'Bodywork',
    description: 'Massage, energy work, somatic practices',
    icon: '🌊',
  },
  {
    value: 'coaching',
    label: 'Coaching',
    description: 'Life coaching, business coaching, transformation',
    icon: '🔥',
  },
  {
    value: 'shamanic',
    label: 'Shamanic',
    description: 'Journey work, ceremony, earth-based practices',
    icon: '🌙',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Custom modality or mixed practice',
    icon: '💫',
  },
];

export default function PersonaTraining({
  practitionerId,
  personaId,
  onComplete,
}: PersonaTrainingProps) {
  const [persona, setPersona] = useState<PractitionerPersona | null>(null);
  const [step, setStep] = useState<TrainingStep>('modality');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [modality, setModality] = useState<Modality | null>(null);
  const [personaName, setPersonaName] = useState('');
  const [voiceSample, setVoiceSample] = useState('');
  const [frameworkContent, setFrameworkContent] = useState('');
  const [boundaryNotes, setBoundaryNotes] = useState('');
  const [trainingProgress, setTrainingProgress] = useState<{
    voice: boolean;
    framework: boolean;
    boundaries: boolean;
  }>({ voice: false, framework: false, boundaries: false });

  useEffect(() => {
    if (personaId) {
      fetchPersona();
    }
  }, [personaId]);

  const fetchPersona = async () => {
    try {
      const response = await fetch(
        `/api/stellium/personas?practitionerId=${practitionerId}&personaId=${personaId}`
      );
      if (response.ok) {
        const { persona: existing } = await response.json();
        if (existing) {
          setPersona(existing);
          setModality(existing.modality);
          setPersonaName(existing.persona_name);
          setTrainingProgress({
            voice: (existing.training_transcripts || 0) >= 1,
            framework: Object.keys(existing.framework || {}).length > 2,
            boundaries: (existing.boundaries?.custom_rules?.length || 0) > 0,
          });
          setStep('voice'); // Skip modality if persona exists
        }
      }
    } catch (err) {
      console.error('Failed to fetch persona:', err);
    }
  };

  const createPersona = async () => {
    if (!modality || !personaName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stellium/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          fromTemplate: modality,
          persona_name: personaName,
          modality,
        }),
      });

      if (!response.ok) throw new Error('Failed to create persona');

      const { persona: newPersona } = await response.json();
      setPersona(newPersona);
      setStep('voice');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create persona');
    } finally {
      setLoading(false);
    }
  };

  const trainVoice = async () => {
    if (!persona || !voiceSample.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stellium/maia/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          personaId: persona.id,
          trainingType: 'voice',
          content: voiceSample,
        }),
      });

      if (!response.ok) throw new Error('Voice training failed');

      const result = await response.json();
      setPersona(result.persona);
      setTrainingProgress(prev => ({ ...prev, voice: true }));
      setVoiceSample('');
      setStep('framework');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setLoading(false);
    }
  };

  const trainFramework = async () => {
    if (!persona || !frameworkContent.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stellium/maia/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          personaId: persona.id,
          trainingType: 'framework',
          content: frameworkContent,
        }),
      });

      if (!response.ok) throw new Error('Framework training failed');

      const result = await response.json();
      setPersona(result.persona);
      setTrainingProgress(prev => ({ ...prev, framework: true }));
      setFrameworkContent('');
      setStep('boundaries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setLoading(false);
    }
  };

  const trainBoundaries = async () => {
    if (!persona || !boundaryNotes.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stellium/maia/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          personaId: persona.id,
          trainingType: 'boundaries',
          content: boundaryNotes,
        }),
      });

      if (!response.ok) throw new Error('Boundary training failed');

      const result = await response.json();
      setPersona(result.persona);
      setTrainingProgress(prev => ({ ...prev, boundaries: true }));
      setBoundaryNotes('');
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'modality', label: 'Modality', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'framework', label: 'Framework', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'boundaries', label: 'Boundaries', icon: <Shield className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const isComplete = i < currentStepIndex || step === 'complete';
          const isCurrent = s.id === step;

          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isComplete
                      ? 'bg-sacred-gold/20 border-sacred-gold text-sacred-gold'
                      : isCurrent
                      ? 'bg-gray-800 border-sacred-gold/50 text-sacred-gold/70'
                      : 'bg-gray-800/50 border-gray-700 text-gray-500'
                  }`}
                >
                  {isComplete ? <Check className="w-5 h-5" /> : s.icon}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    isCurrent ? 'text-sacred-gold' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i < currentStepIndex ? 'bg-sacred-gold/50' : 'bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 'modality' && (
          <StepCard
            key="modality"
            title="Choose Your Modality"
            description="What type of practice do you have? This helps MAIA understand your framework."
          >
            <div className="grid grid-cols-2 gap-3">
              {MODALITY_OPTIONS.map(option => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModality(option.value)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    modality === option.value
                      ? 'bg-sacred-gold/10 border-sacred-gold/50'
                      : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <p className="font-medium text-gray-200 mt-2">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </motion.button>
              ))}
            </div>

            {modality && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 mt-6"
              >
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Name your MAIA persona
                  </label>
                  <input
                    type="text"
                    value={personaName}
                    onChange={e => setPersonaName(e.target.value)}
                    placeholder="e.g., Stellium, Sage, Aurora..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={createPersona}
                  disabled={!personaName.trim() || loading}
                  className="w-full py-3 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </StepCard>
        )}

        {step === 'voice' && (
          <StepCard
            key="voice"
            title="Teach Your Voice"
            description="Share samples of how you write or speak to clients. MAIA will learn your tone and style."
          >
            <div className="space-y-4">
              <textarea
                value={voiceSample}
                onChange={e => setVoiceSample(e.target.value)}
                placeholder="Paste emails, session notes, or write how you typically communicate with clients...

For example:
- How do you greet clients?
- How do you offer guidance?
- What phrases do you naturally use?"
                rows={8}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-500">
                The more samples you provide, the better MAIA will learn your voice.
                You can always add more later.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('framework')}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={trainVoice}
                  disabled={!voiceSample.trim() || loading}
                  className="flex-1 py-3 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Train Voice
                      <Brain className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </StepCard>
        )}

        {step === 'framework' && (
          <StepCard
            key="framework"
            title="Share Your Framework"
            description="What approaches, traditions, or methodologies do you work with?"
          >
            <div className="space-y-4">
              <textarea
                value={frameworkContent}
                onChange={e => setFrameworkContent(e.target.value)}
                placeholder="Describe your theoretical framework and approach...

For example:
- What schools of thought influence your work?
- What authors or teachers have shaped your practice?
- What are your core beliefs about healing/transformation?"
                rows={8}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none resize-none"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('boundaries')}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={trainFramework}
                  disabled={!frameworkContent.trim() || loading}
                  className="flex-1 py-3 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Train Framework
                      <Brain className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </StepCard>
        )}

        {step === 'boundaries' && (
          <StepCard
            key="boundaries"
            title="Set Sacred Boundaries"
            description="What should MAIA never do? What topics need special care?"
          >
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <p className="text-sm text-gray-400 mb-2">MAIA already knows to:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Never make specific predictions</li>
                  <li>• Never diagnose conditions</li>
                  <li>• Never give medical advice</li>
                  <li>• Flag any crisis signals immediately</li>
                  <li>• Refer to professionals when needed</li>
                </ul>
              </div>
              <textarea
                value={boundaryNotes}
                onChange={e => setBoundaryNotes(e.target.value)}
                placeholder="Add any additional boundaries specific to your practice...

For example:
- Topics that need extra sensitivity
- Things you specifically won't discuss
- How you handle certain situations"
                rows={6}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none resize-none"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('complete')}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={trainBoundaries}
                  disabled={!boundaryNotes.trim() || loading}
                  className="flex-1 py-3 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Set Boundaries
                      <Shield className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </StepCard>
        )}

        {step === 'complete' && (
          <StepCard
            key="complete"
            title="Your MAIA is Ready"
            description={`${persona?.persona_name || 'Your persona'} is now trained and ready to assist you.`}
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/30"
              >
                <Sparkles className="w-12 h-12 text-sacred-gold" />
              </motion.div>
              <div>
                <h3 className="text-xl text-gray-200">{persona?.persona_name}</h3>
                <p className="text-gray-500">{persona?.modality} persona</p>
              </div>
              <div className="flex justify-center space-x-6 text-sm">
                <div className="text-center">
                  <div className={`text-lg ${trainingProgress.voice ? 'text-sacred-gold' : 'text-gray-500'}`}>
                    {trainingProgress.voice ? '✓' : '○'}
                  </div>
                  <div className="text-gray-500">Voice</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg ${trainingProgress.framework ? 'text-sacred-gold' : 'text-gray-500'}`}>
                    {trainingProgress.framework ? '✓' : '○'}
                  </div>
                  <div className="text-gray-500">Framework</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg ${trainingProgress.boundaries ? 'text-sacred-gold' : 'text-gray-500'}`}>
                    {trainingProgress.boundaries ? '✓' : '○'}
                  </div>
                  <div className="text-gray-500">Boundaries</div>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Continue training over time to deepen MAIA's understanding of your practice.
              </p>
              <button
                onClick={onComplete}
                className="w-full py-3 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </StepCard>
        )}
      </AnimatePresence>
    </div>
  );
}

// Step Card wrapper
function StepCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-sacred-gold">{title}</CardTitle>
          <p className="text-gray-400 text-sm">{description}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
