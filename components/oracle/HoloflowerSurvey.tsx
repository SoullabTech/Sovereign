'use client';

/**
 * Holoflower Survey - Left-Brain Approach to Oracle Configuration
 *
 * Based on original Spiralogic survey from 2018
 * 36 questions (3 per petal) + shadow questions
 * 0-3 scale: Not at all true → Very true for me
 * Questions randomized except Q1 (Fire1a) and Q48 (Air3c)
 *
 * This provides the analytical path alongside:
 * 1. Manual petal adjustment (somatic/intuitive)
 * 2. Ask the Field (divinatory/I Ching)
 * 3. Survey (cognitive/reflective) ← THIS
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  petalId: string; // Maps to petal ID (fire1, fire2, etc.)
  text: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: 1 | 2 | 3;
  isShadow?: boolean;
}

// Original survey questions mapped to 12 petals
const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // FIRE - Intuition/Self
  { id: 'fire1a', petalId: 'fire1', text: 'I have a strong sense of who I am', element: 'fire', stage: 1 },
  { id: 'fire1b', petalId: 'fire1', text: 'I know my purpose', element: 'fire', stage: 1 },
  { id: 'fire1c', petalId: 'fire1', text: 'I am guided by a higher wisdom', element: 'fire', stage: 1 },

  { id: 'fire2a', petalId: 'fire2', text: 'I am supported by my world', element: 'fire', stage: 2 },
  { id: 'fire2b', petalId: 'fire2', text: 'I am inspired by others', element: 'fire', stage: 2 },
  { id: 'fire2c', petalId: 'fire2', text: 'I live a very playful and creative life', element: 'fire', stage: 2 },

  { id: 'fire3a', petalId: 'fire3', text: 'I have faith in my path', element: 'fire', stage: 3 },
  { id: 'fire3b', petalId: 'fire3', text: 'I am developing spiritually', element: 'fire', stage: 3 },
  { id: 'fire3c', petalId: 'fire3', text: 'I have rituals that I practice daily', element: 'fire', stage: 3 },

  // WATER - Emotions/Feeling
  { id: 'water1a', petalId: 'water1', text: 'I live a soulful, fulfilling life', element: 'water', stage: 1 },
  { id: 'water1b', petalId: 'water1', text: 'I feel at home wherever I am', element: 'water', stage: 1 },
  { id: 'water1c', petalId: 'water1', text: 'I am nourished by my life', element: 'water', stage: 1 },

  { id: 'water2a', petalId: 'water2', text: 'I live my inner strengths/resources', element: 'water', stage: 2 },
  { id: 'water2b', petalId: 'water2', text: 'I am able to let go of the past', element: 'water', stage: 2 },
  { id: 'water2c', petalId: 'water2', text: 'I am guided by inner values', element: 'water', stage: 2 },

  { id: 'water3a', petalId: 'water3', text: 'My life is an adventure', element: 'water', stage: 3 },
  { id: 'water3b', petalId: 'water3', text: 'I am in a state of flow', element: 'water', stage: 3 },
  { id: 'water3c', petalId: 'water3', text: 'I embrace the mysteries of existence', element: 'water', stage: 3 },

  // EARTH - Sensory/Grounding
  { id: 'earth1a', petalId: 'earth1', text: 'I am well organized', element: 'earth', stage: 1 },
  { id: 'earth1b', petalId: 'earth1', text: 'I have a plan for my life', element: 'earth', stage: 1 },
  { id: 'earth1c', petalId: 'earth1', text: 'I feel secure', element: 'earth', stage: 1 },

  { id: 'earth2a', petalId: 'earth2', text: 'I receive support', element: 'earth', stage: 2 },
  { id: 'earth2b', petalId: 'earth2', text: 'I live a life of service to others', element: 'earth', stage: 2 },
  { id: 'earth2c', petalId: 'earth2', text: 'I lose myself in the demands of others', element: 'earth', stage: 2 },

  { id: 'earth3a', petalId: 'earth3', text: 'I am successful in my endeavors', element: 'earth', stage: 3 },
  { id: 'earth3b', petalId: 'earth3', text: 'I achieve my visions', element: 'earth', stage: 3 },
  { id: 'earth3c', petalId: 'earth3', text: 'I am prepared to live my dream life', element: 'earth', stage: 3 },

  // AIR - Mental/Relations
  { id: 'air1a', petalId: 'air1', text: 'I follow a clear path', element: 'air', stage: 1 },
  { id: 'air1b', petalId: 'air1', text: 'I live by clear principles', element: 'air', stage: 1 },
  { id: 'air1c', petalId: 'air1', text: 'I am thoughtful in my relations', element: 'air', stage: 1 },

  { id: 'air2a', petalId: 'air2', text: 'All my relationships are in balance', element: 'air', stage: 2 },
  { id: 'air2b', petalId: 'air2', text: 'I relate well with others', element: 'air', stage: 2 },
  { id: 'air2c', petalId: 'air2', text: 'I enjoy intimate relationships', element: 'air', stage: 2 },

  { id: 'air3a', petalId: 'air3', text: 'I enjoy being a part of groups', element: 'air', stage: 3 },
  { id: 'air3b', petalId: 'air3', text: 'I am supported by my communities', element: 'air', stage: 3 },
  { id: 'air3c', petalId: 'air3', text: 'I have much to offer my community', element: 'air', stage: 3 },

  // Shadow questions (collected separately, not included in petal calculations)
  // Fire Shadows
  { id: 'fire_shadow1', petalId: 'fire1', text: "I'm not comfortable with who I am now", element: 'fire', stage: 1, isShadow: true },
  { id: 'fire_shadow2', petalId: 'fire2', text: "I'm not aligned with what I'm creating in the world", element: 'fire', stage: 2, isShadow: true },
  { id: 'fire_shadow3', petalId: 'fire3', text: 'I lack meaningful rituals in my life', element: 'fire', stage: 3, isShadow: true },

  // Water Shadows
  { id: 'water_shadow1', petalId: 'water1', text: 'I am overwhelmed and stressed by negative emotions', element: 'water', stage: 1, isShadow: true },
  { id: 'water_shadow2', petalId: 'water2', text: 'I am often challenged by my own weaknesses', element: 'water', stage: 2, isShadow: true },
  { id: 'water_shadow3', petalId: 'water3', text: 'I feel out of touch with my deeper truth', element: 'water', stage: 3, isShadow: true },

  // Earth Shadows
  { id: 'earth_shadow1', petalId: 'earth1', text: 'I have difficulty grounding my visions and dreams', element: 'earth', stage: 1, isShadow: true },
  { id: 'earth_shadow2', petalId: 'earth2', text: "It's challenging to gather support for my mission", element: 'earth', stage: 2, isShadow: true },
  { id: 'earth_shadow3', petalId: 'earth3', text: 'I have a hard time completing an idea or project', element: 'earth', stage: 3, isShadow: true },

  // Air Shadows
  { id: 'air_shadow1', petalId: 'air1', text: 'I have difficulties effectively relating to others', element: 'air', stage: 1, isShadow: true },
  { id: 'air_shadow2', petalId: 'air2', text: "I don't function efficiently in groups", element: 'air', stage: 2, isShadow: true },
  { id: 'air_shadow3', petalId: 'air3', text: 'I have a hard time communicating productively', element: 'air', stage: 3, isShadow: true },
];

interface HoloflowerSurveyProps {
  onComplete: (petalIntensities: Record<string, number>) => void;
  onCancel: () => void;
}

export function HoloflowerSurvey({ onComplete, onCancel }: HoloflowerSurveyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  // Randomize questions except first (fire1a) and last (air3c)
  const [questionOrder] = useState(() => {
    const nonShadow = SURVEY_QUESTIONS.filter(q => !q.isShadow);
    const first = nonShadow.find(q => q.id === 'fire1a')!;
    const last = nonShadow.find(q => q.id === 'air3c')!;
    const middle = nonShadow.filter(q => q.id !== 'fire1a' && q.id !== 'air3c');

    // Shuffle middle questions
    for (let i = middle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middle[i], middle[j]] = [middle[j], middle[i]];
    }

    return [first, ...middle, last];
  });

  const currentQuestion = questionOrder[currentIndex];
  const progress = ((currentIndex + 1) / questionOrder.length) * 100;

  const handleResponse = (value: number) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    if (currentIndex < questionOrder.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Calculate petal intensities from responses
      calculateAndSubmit();
    }
  };

  const calculateAndSubmit = () => {
    // Group responses by petal
    const petalScores: Record<string, number[]> = {};

    questionOrder.forEach(q => {
      const score = responses[q.id] || 0;
      if (!petalScores[q.petalId]) {
        petalScores[q.petalId] = [];
      }
      petalScores[q.petalId].push(score);
    });

    // Calculate average for each petal and convert 0-3 scale to 1-10 scale
    const petalIntensities: Record<string, number> = {};
    Object.entries(petalScores).forEach(([petalId, scores]) => {
      const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      // Convert 0-3 → 1-10: (average / 3) * 9 + 1
      petalIntensities[petalId] = Math.round((average / 3) * 9 + 1);
    });

    onComplete(petalIntensities);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const scaleOptions = [
    { value: 0, label: 'Not at all true', color: '#7C2D12' },
    { value: 1, label: 'Partly true', color: '#92400E' },
    { value: 2, label: 'Mostly true', color: '#B45309' },
    { value: 3, label: 'Very true', color: '#D97706' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-amber-300/70 text-sm">
              Question {currentIndex + 1} of {questionOrder.length}
            </span>
            <span className="text-amber-300/70 text-sm">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full h-2 bg-amber-950/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-amber-900/30 backdrop-blur-xl border border-amber-700/40 rounded-2xl p-8 shadow-2xl"
          >
            {/* Element Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider
                ${currentQuestion.element === 'fire' ? 'bg-red-900/40 text-red-200' : ''}
                ${currentQuestion.element === 'water' ? 'bg-blue-900/40 text-blue-200' : ''}
                ${currentQuestion.element === 'earth' ? 'bg-green-900/40 text-green-200' : ''}
                ${currentQuestion.element === 'air' ? 'bg-purple-900/40 text-purple-200' : ''}
              `}>
                {currentQuestion.element} {currentQuestion.stage}
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-3xl font-bold text-amber-100 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Response Options */}
            <div className="space-y-3">
              {scaleOptions.map(option => (
                <motion.button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 rounded-xl border-2 transition-all duration-300 text-left group"
                  style={{
                    backgroundColor: `${option.color}20`,
                    borderColor: responses[currentQuestion.id] === option.value
                      ? `${option.color}`
                      : `${option.color}40`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-amber-100 font-semibold text-lg">
                      {option.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300/60 text-sm">{option.value}</span>
                      <ArrowRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-300 transition-colors" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-900/30 border border-amber-700/40 text-amber-200 hover:bg-amber-900/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            Cancel Survey
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-amber-300/50 text-xs flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            Original Spiralogic Survey • Cognitive Path to Oracle Configuration
          </p>
        </div>
      </motion.div>
    </div>
  );
}
