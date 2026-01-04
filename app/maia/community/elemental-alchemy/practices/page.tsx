'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Play,
  Check,
  Clock,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  Brain,
  PenLine,
  Activity,
  Palette,
  Trees,
  Eye,
  Users,
  Timer,
  Pause,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import {
  PRACTICES,
  getPracticesByElement,
  CATEGORY_LABELS,
  type Practice,
  type PracticeCategory
} from '@/lib/elemental-alchemy/practices';
import { ELEMENT_INFO, type ElementKey } from '@/lib/elemental-alchemy/assessmentQuestions';

const ELEMENT_ICONS: Record<ElementKey | 'all', React.ComponentType<{ className?: string }>> = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Sparkles,
  all: Sparkles
};

const CATEGORY_ICON_COMPONENTS: Record<PracticeCategory, React.ComponentType<{ className?: string }>> = {
  meditation: Brain,
  journaling: PenLine,
  movement: Activity,
  creative: Palette,
  nature: Trees,
  'shadow-work': Eye,
  relational: Users,
  ritual: Sparkles
};

type ViewState = 'library' | 'session';

function PracticesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialElement = (searchParams.get('element') as ElementKey | 'all') || null;

  const [view, setView] = useState<ViewState>('library');
  const [selectedElement, setSelectedElement] = useState<ElementKey | 'all' | null>(initialElement);
  const [selectedCategory, setSelectedCategory] = useState<PracticeCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null);
  const [completedPractices, setCompletedPractices] = useState<Record<string, boolean>>({});

  // Timer state for active session
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  // Load completed practices from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('elemental-practices-completed');
      if (saved) {
        setCompletedPractices(JSON.parse(saved));
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Filter practices
  const filteredPractices = useMemo(() => {
    let filtered = [...PRACTICES];

    if (selectedElement) {
      if (selectedElement === 'all') {
        filtered = filtered.filter(p => p.element === 'all');
      } else {
        filtered = filtered.filter(p => p.element === selectedElement || p.element === 'all');
      }
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    return filtered;
  }, [selectedElement, selectedCategory]);

  // Group practices by element
  const practicesByElement = useMemo(() => {
    const grouped: Record<string, Practice[]> = {};
    filteredPractices.forEach(p => {
      const key = p.element === 'all' ? 'all' : p.element;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });
    return grouped;
  }, [filteredPractices]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startPractice = (practice: Practice) => {
    setActivePractice(practice);
    setView('session');
    setTimerSeconds(0);
    setTimerRunning(true);
    setCurrentStep(0);
    setShowReflection(false);
    setReflectionText('');
  };

  const completePractice = () => {
    if (activePractice) {
      const newCompleted = { ...completedPractices, [activePractice.id]: true };
      setCompletedPractices(newCompleted);
      if (typeof window !== 'undefined') {
        localStorage.setItem('elemental-practices-completed', JSON.stringify(newCompleted));
      }
    }
    setShowReflection(true);
    setTimerRunning(false);
  };

  const exitSession = () => {
    setView('library');
    setActivePractice(null);
    setTimerRunning(false);
  };

  const saveToJournal = () => {
    if (activePractice && reflectionText.trim()) {
      // Navigate to journal with pre-filled data
      const params = new URLSearchParams({
        element: activePractice.element === 'all' ? 'aether' : activePractice.element,
        practice: activePractice.id,
        prompt: activePractice.reflectionPrompt || '',
        reflection: reflectionText
      });
      router.push(`/maia/community/elemental-alchemy/journal?${params.toString()}`);
    } else {
      exitSession();
    }
  };

  const completedCount = Object.values(completedPractices).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <AnimatePresence mode="wait">
        {/* Library View */}
        {view === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 py-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push('/maia/community/elemental-alchemy')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
                         border border-white/10 text-white/70 hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Book
              </button>

              <div className="flex items-center gap-3 text-sm text-white/50">
                <span>{completedCount} / {PRACTICES.length} completed</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text
                           bg-gradient-to-r from-amber-400 to-orange-400 mb-2">
                Elemental Practices
              </h1>
              <p className="text-white/60">
                Interactive exercises from Elemental Alchemy
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
                         border border-white/10 text-white/70 hover:bg-white/10 transition-all"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedElement || selectedCategory) && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full">
                    Active
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                  >
                    {/* Element Filter */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/70 mb-2">Element</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedElement(null)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all
                                   ${!selectedElement
                                     ? 'bg-white/20 text-white'
                                     : 'bg-white/5 text-white/60 hover:bg-white/10'
                                   }`}
                        >
                          All
                        </button>
                        {(['fire', 'water', 'earth', 'air', 'aether'] as ElementKey[]).map(el => {
                          const Icon = ELEMENT_ICONS[el];
                          const info = ELEMENT_INFO[el];
                          return (
                            <button
                              key={el}
                              onClick={() => setSelectedElement(el)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all
                                       ${selectedElement === el
                                         ? `bg-gradient-to-r ${info.gradient} text-white`
                                         : 'bg-white/5 text-white/60 hover:bg-white/10'
                                       }`}
                            >
                              <Icon className="w-4 h-4" />
                              {info.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-2">Category</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all
                                   ${!selectedCategory
                                     ? 'bg-white/20 text-white'
                                     : 'bg-white/5 text-white/60 hover:bg-white/10'
                                   }`}
                        >
                          All
                        </button>
                        {(Object.entries(CATEGORY_LABELS) as [PracticeCategory, string][]).map(([cat, label]) => {
                          const Icon = CATEGORY_ICON_COMPONENTS[cat];
                          return (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all
                                       ${selectedCategory === cat
                                         ? 'bg-amber-500/20 text-amber-300'
                                         : 'bg-white/5 text-white/60 hover:bg-white/10'
                                       }`}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {(selectedElement || selectedCategory) && (
                      <button
                        onClick={() => {
                          setSelectedElement(null);
                          setSelectedCategory(null);
                        }}
                        className="mt-4 flex items-center gap-2 text-sm text-white/50 hover:text-white/70"
                      >
                        <X className="w-4 h-4" />
                        Clear filters
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Practice Cards */}
            <div className="space-y-8">
              {Object.entries(practicesByElement).map(([element, practices]) => {
                const elementKey = element as ElementKey | 'all';
                const info = elementKey === 'all'
                  ? { name: 'Cross-Elemental', gradient: 'from-purple-500 to-pink-500' }
                  : ELEMENT_INFO[elementKey];
                const Icon = ELEMENT_ICONS[elementKey];

                return (
                  <div key={element}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${info.gradient}
                                    flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-lg font-semibold text-white/90">{info.name}</h2>
                      <span className="text-sm text-white/40">{practices.length} practices</span>
                    </div>

                    <div className="space-y-3">
                      {practices.map(practice => {
                        const isExpanded = expandedPractice === practice.id;
                        const isCompleted = completedPractices[practice.id];
                        const CatIcon = CATEGORY_ICON_COMPONENTS[practice.category];

                        return (
                          <motion.div
                            key={practice.id}
                            className={`bg-white/5 border rounded-xl overflow-hidden transition-all
                                     ${isCompleted ? 'border-green-500/30' : 'border-white/10'}`}
                          >
                            <button
                              onClick={() => setExpandedPractice(isExpanded ? null : practice.id)}
                              className="w-full p-4 text-left flex items-center gap-4"
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                            ${isCompleted ? 'bg-green-500/20' : 'bg-white/5'}`}>
                                {isCompleted ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <CatIcon className="w-5 h-5 text-white/50" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white/90">{practice.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                                  <span>{CATEGORY_LABELS[practice.category]}</span>
                                  {practice.duration && (
                                    <>
                                      <span>*</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {practice.duration}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-white/30 transition-transform
                                         ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: 'auto' }}
                                  exit={{ height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 space-y-4">
                                    {/* Instructions Preview */}
                                    <div className="bg-white/5 rounded-lg p-4">
                                      <h4 className="text-sm font-medium text-white/70 mb-2">Instructions</h4>
                                      <ol className="space-y-2 text-sm text-white/60">
                                        {practice.instructions.slice(0, 3).map((step, idx) => (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="text-amber-400">{idx + 1}.</span>
                                            {step}
                                          </li>
                                        ))}
                                        {practice.instructions.length > 3 && (
                                          <li className="text-white/40 italic">
                                            + {practice.instructions.length - 3} more steps...
                                          </li>
                                        )}
                                      </ol>
                                    </div>

                                    {/* Shadow Awareness */}
                                    {practice.shadowAwareness && (
                                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                        <p className="text-xs text-amber-300">
                                          <strong>Shadow awareness:</strong> {practice.shadowAwareness}
                                        </p>
                                      </div>
                                    )}

                                    {/* Start Button */}
                                    <button
                                      onClick={() => startPractice(practice)}
                                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                                               font-medium transition-all
                                               ${practice.element === 'all'
                                                 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                 : `bg-gradient-to-r ${ELEMENT_INFO[practice.element as ElementKey].gradient} text-white`
                                               }`}
                                    >
                                      <Play className="w-4 h-4" />
                                      Start Practice
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Session View */}
        {view === 'session' && activePractice && (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Session Header */}
            <div className="p-4 border-b border-white/10 bg-black/20">
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <button
                  onClick={exitSession}
                  className="flex items-center gap-2 text-white/60 hover:text-white/80"
                >
                  <X className="w-5 h-5" />
                  Exit
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xl font-mono text-white">
                    <Timer className="w-5 h-5 text-amber-400" />
                    {formatTime(timerSeconds)}
                  </div>
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    {timerRunning ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
              {!showReflection ? (
                <>
                  {/* Practice Title */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">{activePractice.title}</h1>
                    <p className="text-white/50">{CATEGORY_LABELS[activePractice.category]}</p>
                  </div>

                  {/* Step Progress */}
                  <div className="flex gap-1 mb-8">
                    {activePractice.instructions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all
                                 ${idx <= currentStep ? 'bg-amber-500' : 'bg-white/10'}`}
                      />
                    ))}
                  </div>

                  {/* Current Step */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center
                                    text-amber-400 font-bold flex-shrink-0">
                        {currentStep + 1}
                      </div>
                      <p className="text-lg text-white/90 leading-relaxed">
                        {activePractice.instructions[currentStep]}
                      </p>
                    </div>
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className={`px-4 py-2 rounded-lg transition-all
                               ${currentStep === 0
                                 ? 'opacity-0'
                                 : 'bg-white/5 text-white/70 hover:bg-white/10'
                               }`}
                    >
                      Previous
                    </button>

                    {currentStep < activePractice.instructions.length - 1 ? (
                      <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl
                                 bg-gradient-to-r from-amber-600 to-orange-600
                                 text-white font-medium hover:opacity-90 transition-all"
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={completePractice}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl
                                 bg-gradient-to-r from-green-600 to-emerald-600
                                 text-white font-medium hover:opacity-90 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Complete Practice
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Reflection View */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20
                                  flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Practice Complete</h2>
                    <p className="text-white/50">Time: {formatTime(timerSeconds)}</p>
                  </div>

                  {activePractice.reflectionPrompt && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-sm font-medium text-white/70 mb-3">Reflection</h3>
                      <p className="text-white/80 mb-4 italic">"{activePractice.reflectionPrompt}"</p>
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="Write your reflection..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4
                                 text-white/90 placeholder-white/30 resize-none focus:outline-none
                                 focus:border-amber-500/50"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={saveToJournal}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                               bg-gradient-to-r from-amber-600 to-orange-600
                               text-white font-medium hover:opacity-90 transition-all"
                    >
                      <BookOpen className="w-5 h-5" />
                      {reflectionText.trim() ? 'Save to Journal' : 'Done'}
                    </button>

                    <button
                      onClick={() => {
                        setShowReflection(false);
                        setCurrentStep(0);
                        setTimerSeconds(0);
                        setTimerRunning(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                               bg-white/5 border border-white/10 text-white/70
                               hover:bg-white/10 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Practice Again
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PracticesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PracticesContent />
    </Suspense>
  );
}
