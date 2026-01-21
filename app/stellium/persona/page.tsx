"use client";

/**
 * STELLIUM PERSONA PAGE
 *
 * Train and manage your MAIA persona
 * "The apprentice who never forgets, never burns out,
 *  and knows when to stay quiet."
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  BookOpen,
  MessageSquare,
  Shield,
  Check,
  FileText,
  Loader2,
} from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import PersonaTraining from '@/components/stellium/PersonaTraining';
import { PractitionerPersona } from '@/lib/stellium/types';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

export default function PersonaPage() {
  const { practitionerId, isLoading: authLoading } = usePractitionerContext();

  const [persona, setPersona] = useState<PractitionerPersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTraining, setShowTraining] = useState(false);
  const [trainingType, setTrainingType] = useState<'voice' | 'framework' | 'boundaries' | 'conversation' | null>(null);
  const [trainingContent, setTrainingContent] = useState('');
  const [training, setTraining] = useState(false);

  useEffect(() => {
    if (practitionerId) {
      fetchPersona();
    }
  }, [practitionerId]);

  const fetchPersona = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/stellium/personas?practitionerId=${practitionerId}`
      );
      if (response.ok) {
        const data = await response.json();
        setPersona(data.persona);
      }
    } catch (err) {
      console.error('Failed to fetch persona:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!persona || !trainingType || !trainingContent.trim()) return;

    setTraining(true);
    try {
      const response = await fetch('/api/stellium/maia/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          personaId: persona.id,
          trainingType,
          content: trainingContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPersona(data.persona);
        setTrainingContent('');
        setTrainingType(null);
      }
    } catch (err) {
      console.error('Training failed:', err);
    } finally {
      setTraining(false);
    }
  };

  if (authLoading || loading || !practitionerId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
      </div>
    );
  }

  // Show initial setup if no persona exists
  if (!persona) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Holoflower size="xl" animate={true} glowIntensity="medium" />
          </div>
          <h1 className="text-2xl font-light text-gray-100 mb-2">
            Create Your MAIA Persona
          </h1>
          <p className="text-gray-500">
            Train an AI apprentice that speaks in your voice and holds your framework
          </p>
        </div>
        <PersonaTraining
          practitionerId={practitionerId!}
          onComplete={() => {
            fetchPersona();
            setShowTraining(false);
          }}
        />
      </div>
    );
  }

  const trainingOptions = [
    {
      type: 'voice' as const,
      icon: <MessageSquare className="w-5 h-5" />,
      label: 'Voice Training',
      description: 'Teach MAIA your communication style',
      placeholder: 'Paste examples of how you write to clients...',
    },
    {
      type: 'framework' as const,
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Framework Training',
      description: 'Share your theoretical approach',
      placeholder: 'Describe your methodologies, influences, and approach...',
    },
    {
      type: 'boundaries' as const,
      icon: <Shield className="w-5 h-5" />,
      label: 'Boundary Training',
      description: 'Define what MAIA should never do',
      placeholder: 'Add specific boundaries for your practice...',
    },
    {
      type: 'conversation' as const,
      icon: <FileText className="w-5 h-5" />,
      label: 'Conversation Training',
      description: 'Learn from a full session transcript',
      placeholder: 'Paste a conversation transcript for MAIA to learn from...',
    },
  ];

  const voicePatterns = persona.voice_patterns as Record<string, unknown> || {};
  const framework = persona.framework as Record<string, unknown> || {};
  const boundaries = persona.boundaries as Record<string, unknown> || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-100">MAIA Persona</h1>
          <p className="text-gray-500">Train your AI apprentice</p>
        </div>
      </div>

      {/* Persona Overview */}
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Holoflower size="lg" animate={false} glowIntensity="low" />
            <div className="flex-1">
              <h2 className="text-xl text-gray-200">{persona.persona_name}</h2>
              <p className="text-gray-500 capitalize">{persona.modality} persona</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-light text-sacred-gold">
                    {persona.training_transcripts || 0}
                  </div>
                  <div className="text-xs text-gray-500">Training Sessions</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-light text-sacred-gold">
                    {persona.materials_indexed?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Materials Indexed</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-light text-sacred-gold">
                    {persona.books_referenced?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Books Referenced</div>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-2xl font-light text-sacred-gold">
                    {(boundaries.custom_rules as string[])?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Custom Boundaries</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainingOptions.map(option => (
          <motion.div
            key={option.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`bg-gray-900/50 backdrop-blur-xl cursor-pointer transition-colors ${
                trainingType === option.type
                  ? 'border-sacred-gold/50'
                  : 'border-gray-700/20 hover:border-gray-600/50'
              }`}
              onClick={() => setTrainingType(trainingType === option.type ? null : option.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    trainingType === option.type
                      ? 'bg-sacred-gold/20 text-sacred-gold'
                      : 'bg-gray-800/50 text-gray-400'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-200 font-medium">{option.label}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Training Input */}
      {trainingType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-900/50 backdrop-blur-xl border-sacred-gold/20">
            <CardHeader>
              <CardTitle className="text-sacred-gold flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                {trainingOptions.find(o => o.type === trainingType)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={trainingContent}
                onChange={e => setTrainingContent(e.target.value)}
                placeholder={trainingOptions.find(o => o.type === trainingType)?.placeholder}
                rows={8}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none resize-none"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setTrainingType(null);
                    setTrainingContent('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrain}
                  disabled={!trainingContent.trim() || training}
                  className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg disabled:opacity-50"
                >
                  {training ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Train MAIA</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Current Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Patterns */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardHeader>
            <CardTitle className="text-gray-300 flex items-center text-base">
              <MessageSquare className="w-4 h-4 mr-2" />
              Voice Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {voicePatterns.tone && (
              <div>
                <div className="text-xs text-gray-500">Tone</div>
                <div className="text-sm text-gray-300">{String(voicePatterns.tone)}</div>
              </div>
            )}
            {voicePatterns.style && (
              <div>
                <div className="text-xs text-gray-500">Style</div>
                <div className="text-sm text-gray-300">{String(voicePatterns.style)}</div>
              </div>
            )}
            {(voicePatterns.phrases as string[])?.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Key Phrases</div>
                <div className="flex flex-wrap gap-1">
                  {(voicePatterns.phrases as string[]).slice(0, 5).map((phrase, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-800/50 text-gray-400 rounded"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Framework */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardHeader>
            <CardTitle className="text-gray-300 flex items-center text-base">
              <BookOpen className="w-4 h-4 mr-2" />
              Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {framework.primary && (
              <div>
                <div className="text-xs text-gray-500">Primary Approach</div>
                <div className="text-sm text-gray-300 capitalize">{String(framework.primary)}</div>
              </div>
            )}
            {(framework.traditions as string[])?.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Traditions</div>
                <div className="flex flex-wrap gap-1">
                  {(framework.traditions as string[]).map((t, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-800/50 text-gray-400 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(framework.authors as string[])?.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Influences</div>
                <div className="flex flex-wrap gap-1">
                  {(framework.authors as string[]).map((a, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-800/50 text-gray-400 rounded"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boundaries */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardHeader>
            <CardTitle className="text-gray-300 flex items-center text-base">
              <Shield className="w-4 h-4 mr-2" />
              Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              {boundaries.no_predictions && (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>No predictions</span>
                </div>
              )}
              {boundaries.no_diagnosis && (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>No diagnosis</span>
                </div>
              )}
              {boundaries.no_medical_advice && (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>No medical advice</span>
                </div>
              )}
              {boundaries.escalate_crisis && (
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Crisis escalation</span>
                </div>
              )}
            </div>
            {(boundaries.custom_rules as string[])?.length > 0 && (
              <div className="pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-500 mb-1">Custom Rules</div>
                <ul className="space-y-1">
                  {(boundaries.custom_rules as string[]).slice(0, 3).map((rule, i) => (
                    <li key={i} className="text-xs text-gray-400">
                      • {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
