'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  BookOpen,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  ASSESSMENT_QUESTIONS,
  ELEMENT_INFO,
  calculateResults,
  shuffleOptions,
  type ElementKey,
  type ElementalResult,
  type AssessmentOption
} from '@/lib/elemental-alchemy/assessmentQuestions';

const ELEMENT_ICONS: Record<ElementKey, React.ComponentType<{ className?: string }>> = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Sparkles
};

type ViewState = 'intro' | 'questions' | 'results';

export default function ElementAssessmentPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ElementKey>>({});
  const [results, setResults] = useState<ElementalResult | null>(null);

  // Shuffle options for each question (memoized per session)
  const shuffledQuestions = useMemo(() => {
    return ASSESSMENT_QUESTIONS.map(q => ({
      ...q,
      options: shuffleOptions(q.options)
    }));
  }, []);

  const question = shuffledQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestion === ASSESSMENT_QUESTIONS.length - 1;
  const canGoBack = currentQuestion > 0;
  const hasAnswered = answers[question?.id] !== undefined;

  const handleAnswer = (option: AssessmentOption) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: option.element
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const result = calculateResults(answers);
      setResults(result);
      setView('results');
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('elemental-assessment-result', JSON.stringify(result));
        localStorage.setItem('elemental-assessment-date', new Date().toISOString());
      }
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setView('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  };

  const handleExitToBook = () => {
    router.push('/maia/community/elemental-alchemy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleExitToBook}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
                     border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Book
          </button>

          {view === 'questions' && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">
                {currentQuestion + 1} / {ASSESSMENT_QUESTIONS.length}
              </span>
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Intro View */}
          {view === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full
                            bg-gradient-to-br from-purple-500/20 to-pink-500/20
                            border border-purple-500/30">
                <Sparkles className="w-12 h-12 text-purple-400" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text
                             bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                  Discover Your Element
                </h1>
                <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                  This assessment will help you understand your elemental nature
                  based on Kelly Nezat&apos;s Elemental Alchemy teachings.
                </p>
              </div>

              {/* Element Preview */}
              <div className="flex justify-center gap-3 py-4">
                {(['fire', 'water', 'earth', 'air', 'aether'] as ElementKey[]).map((el) => {
                  const Icon = ELEMENT_ICONS[el];
                  const info = ELEMENT_INFO[el];
                  return (
                    <div
                      key={el}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.gradient}
                                flex items-center justify-center opacity-60 hover:opacity-100
                                transition-opacity`}
                      title={info.name}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  );
                })}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left space-y-3">
                <h3 className="text-sm font-medium text-white/80">How it works:</h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">1.</span>
                    Answer 15 questions about how you naturally think, feel, and act
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">2.</span>
                    There are no right or wrong answers—choose what resonates most
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">3.</span>
                    Discover your elemental balance, strengths, and growth edges
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setView('questions')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl
                         bg-gradient-to-r from-purple-600 to-pink-600
                         text-white font-semibold hover:opacity-90 transition-all
                         shadow-lg shadow-purple-500/20"
              >
                <Play className="w-5 h-5" />
                Begin Assessment
              </button>

              <p className="text-xs text-white/40">Takes about 5 minutes</p>
            </motion.div>
          )}

          {/* Questions View */}
          {view === 'questions' && question && (
            <motion.div
              key={`question-${question.id}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-semibold text-white/90 leading-relaxed">
                  {question.question}
                </h2>
              </div>

              <div className="space-y-3">
                {question.options.map((option, idx) => {
                  const isSelected = answers[question.id] === option.element;
                  const info = ELEMENT_INFO[option.element];

                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-5 rounded-xl text-left transition-all
                               ${isSelected
                                 ? `bg-gradient-to-r ${info.gradient} border-transparent shadow-lg`
                                 : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                               }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                      ${isSelected
                                        ? 'border-white bg-white/20'
                                        : 'border-white/30'
                                      }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`flex-1 ${isSelected ? 'text-white' : 'text-white/80'}`}>
                          {option.text}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  disabled={!canGoBack}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                           ${canGoBack
                             ? 'bg-white/5 text-white/70 hover:bg-white/10'
                             : 'opacity-0 pointer-events-none'
                           }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={!hasAnswered}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                           ${hasAnswered
                             ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                             : 'bg-white/10 text-white/30 cursor-not-allowed'
                           }`}
                >
                  {isLastQuestion ? 'See Results' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Results View */}
          {view === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Dominant Element */}
              {(() => {
                const info = ELEMENT_INFO[results.dominant];
                const Icon = ELEMENT_ICONS[results.dominant];
                return (
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className={`inline-flex items-center justify-center w-28 h-28 rounded-full
                                bg-gradient-to-br ${info.gradient} shadow-2xl`}
                    >
                      <Icon className="w-14 h-14 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-white/50 uppercase tracking-wide mb-1">
                        Your Dominant Element
                      </p>
                      <h2 className={`text-4xl font-bold text-transparent bg-clip-text
                                   bg-gradient-to-r ${info.gradient}`}>
                        {info.name}
                      </h2>
                      <p className="text-white/60 mt-2">{info.description}</p>
                      <p className="text-sm text-white/40 mt-1">
                        Yogic Path: {info.yogicPath}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Elemental Balance */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white/70 mb-4 text-center">
                  Your Elemental Balance
                </h3>
                <div className="space-y-3">
                  {(['fire', 'water', 'earth', 'air', 'aether'] as ElementKey[]).map((el) => {
                    const info = ELEMENT_INFO[el];
                    const Icon = ELEMENT_ICONS[el];
                    const pct = results.balance[el];
                    return (
                      <div key={el} className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 text-${info.color}-400 flex-shrink-0`} />
                        <span className="w-16 text-sm text-white/70">{info.name}</span>
                        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className={`h-full bg-gradient-to-r ${info.gradient} rounded-full`}
                          />
                        </div>
                        <span className="w-10 text-sm text-white/60 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white/70 mb-3">Your Core Strengths</h3>
                <div className="flex flex-wrap gap-2">
                  {results.strengths.map((strength, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-sm
                               bg-gradient-to-r ${ELEMENT_INFO[results.dominant].gradient}
                               text-white/90`}
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shadow Awareness */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <h3 className="text-sm font-medium text-amber-300 mb-3">Shadow Awareness</h3>
                <p className="text-xs text-amber-200/60 mb-3">
                  Your greatest strength can become your shadow. Be mindful of:
                </p>
                <ul className="space-y-2">
                  {results.shadowAspects.map((shadow, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-amber-100/80">
                      <span className="text-amber-400 mt-1">*</span>
                      {shadow}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Practices */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white/70 mb-3">Recommended Practices</h3>
                <div className="grid grid-cols-2 gap-2">
                  {results.recommendedPractices.map((practice, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-sm text-white/70"
                    >
                      <Play className="w-4 h-4 text-purple-400" />
                      {practice}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/maia/community/elemental-alchemy?element=${results.dominant}`)}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                           bg-gradient-to-r ${ELEMENT_INFO[results.dominant].gradient}
                           text-white font-semibold hover:opacity-90 transition-all
                           shadow-lg`}
                >
                  <BookOpen className="w-5 h-5" />
                  Explore {ELEMENT_INFO[results.dominant].name} Chapters
                </button>

                <button
                  onClick={handleRestart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                           bg-white/5 border border-white/10 text-white/70
                           hover:bg-white/10 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Assessment
                </button>
              </div>

              {/* Secondary Element Note */}
              <div className="text-center text-sm text-white/40 pt-4">
                <p>
                  Secondary element: <span className="text-white/60">{ELEMENT_INFO[results.secondary].name}</span>
                </p>
                <p className="mt-1">
                  Explore how these elements dance together in your life.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
