'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

/**
 * Element Discovery Flow
 *
 * A conversational quiz to help users discover their dominant elemental nature.
 * Uses archetypal questions mapped to elemental energies.
 */

type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface Question {
  id: string;
  question: string;
  context?: string;
  options: {
    text: string;
    element: Element;
    weight: number; // 1-3
  }[];
}

const questions: Question[] = [
  {
    id: 'stress',
    question: 'When you\'re under pressure, what\'s your first instinct?',
    options: [
      { text: 'Take action — do something, anything, to change the situation', element: 'fire', weight: 3 },
      { text: 'Feel into it — let the emotions move through me', element: 'water', weight: 3 },
      { text: 'Ground myself — slow down, get practical, make a plan', element: 'earth', weight: 3 },
      { text: 'Think it through — analyze, understand, find perspective', element: 'air', weight: 3 },
      { text: 'Seek meaning — ask what this is teaching me', element: 'aether', weight: 3 },
    ]
  },
  {
    id: 'recharge',
    question: 'How do you best recharge your energy?',
    options: [
      { text: 'Movement, exercise, or creative projects', element: 'fire', weight: 3 },
      { text: 'Being near water, music, or deep conversation', element: 'water', weight: 3 },
      { text: 'Nature walks, cooking, or working with my hands', element: 'earth', weight: 3 },
      { text: 'Reading, learning something new, or stimulating discussion', element: 'air', weight: 3 },
      { text: 'Meditation, solitude, or contemplative practice', element: 'aether', weight: 3 },
    ]
  },
  {
    id: 'decisions',
    question: 'When making important decisions, you tend to trust...',
    options: [
      { text: 'My gut — what feels like the bold, right move', element: 'fire', weight: 3 },
      { text: 'My heart — what resonates emotionally', element: 'water', weight: 3 },
      { text: 'My experience — what\'s worked before, what\'s practical', element: 'earth', weight: 3 },
      { text: 'My mind — what makes logical sense', element: 'air', weight: 3 },
      { text: 'My intuition — what feels aligned with something larger', element: 'aether', weight: 3 },
    ]
  },
  {
    id: 'conflict',
    question: 'In conflict, your natural tendency is to...',
    options: [
      { text: 'Confront it directly — name the issue, push for resolution', element: 'fire', weight: 2 },
      { text: 'Empathize — try to understand both sides deeply', element: 'water', weight: 2 },
      { text: 'Stay steady — hold ground, don\'t overreact', element: 'earth', weight: 2 },
      { text: 'Detach — gain perspective, see the bigger picture', element: 'air', weight: 2 },
      { text: 'Transcend — look for the deeper lesson or pattern', element: 'aether', weight: 2 },
    ]
  },
  {
    id: 'shadow',
    question: 'What do you struggle with most?',
    options: [
      { text: 'Patience — I want things to happen now', element: 'fire', weight: 2 },
      { text: 'Boundaries — I absorb others\' emotions too easily', element: 'water', weight: 2 },
      { text: 'Change — I resist upheaval even when it\'s needed', element: 'earth', weight: 2 },
      { text: 'Feeling — I can get stuck in my head', element: 'air', weight: 2 },
      { text: 'Grounding — I can float above daily reality', element: 'aether', weight: 2 },
    ]
  },
  {
    id: 'gift',
    question: 'Others often come to you for...',
    options: [
      { text: 'Motivation — I light a fire under people', element: 'fire', weight: 2 },
      { text: 'Understanding — I hold space for their feelings', element: 'water', weight: 2 },
      { text: 'Practical help — I\'m reliable and get things done', element: 'earth', weight: 2 },
      { text: 'Advice — I help them think things through', element: 'air', weight: 2 },
      { text: 'Perspective — I help them see meaning in difficulty', element: 'aether', weight: 2 },
    ]
  },
];

const elementConfig = {
  fire: {
    icon: Flame,
    name: 'Fire',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    description: 'You are driven by passion, purpose, and the will to transform. Fire gives you courage to act, create, and lead change.',
    gifts: ['Courage', 'Passion', 'Leadership', 'Creativity', 'Transformation'],
    shadows: ['Impatience', 'Burnout', 'Anger', 'Impulsivity'],
    practices: ['Movement practices', 'Creative expression', 'Taking bold action', 'Channeling anger consciously'],
  },
  water: {
    icon: Droplets,
    name: 'Water',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    description: 'You move through life with emotional depth and intuitive knowing. Water gives you empathy, adaptability, and access to the unconscious.',
    gifts: ['Empathy', 'Intuition', 'Adaptability', 'Depth', 'Healing'],
    shadows: ['Overwhelm', 'Boundary issues', 'Moodiness', 'Escapism'],
    practices: ['Journaling', 'Time near water', 'Dream work', 'Emotional release'],
  },
  earth: {
    icon: Mountain,
    name: 'Earth',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    description: 'You are grounded, reliable, and connected to the body\'s wisdom. Earth gives you stability, patience, and the power to manifest.',
    gifts: ['Stability', 'Reliability', 'Presence', 'Manifestation', 'Sensuality'],
    shadows: ['Rigidity', 'Resistance to change', 'Materialism', 'Stubbornness'],
    practices: ['Nature immersion', 'Body practices', 'Building things', 'Slow, mindful eating'],
  },
  air: {
    icon: Wind,
    name: 'Air',
    color: 'from-yellow-400 to-amber-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    description: 'You think clearly, communicate effectively, and see from multiple perspectives. Air gives you intellectual curiosity and the power to articulate truth.',
    gifts: ['Clarity', 'Communication', 'Objectivity', 'Curiosity', 'Wit'],
    shadows: ['Overthinking', 'Detachment', 'Anxiety', 'Scattered energy'],
    practices: ['Breathwork', 'Writing', 'Learning', 'Dialogue and debate'],
  },
  aether: {
    icon: Sparkles,
    name: 'Aether',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/20',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    description: 'You are connected to something greater than yourself. Aether gives you spiritual depth, the capacity for transcendence, and access to universal wisdom.',
    gifts: ['Spiritual insight', 'Unity consciousness', 'Meaning-making', 'Presence', 'Wisdom'],
    shadows: ['Groundlessness', 'Spiritual bypassing', 'Disconnection from body', 'Otherworldliness'],
    practices: ['Meditation', 'Contemplation', 'Service', 'Ritual and ceremony'],
  },
};

interface ElementDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: {
    dominant: Element;
    secondary: Element;
    scores: Record<Element, number>;
  }) => void;
}

export function ElementDiscovery({ isOpen, onClose, onComplete }: ElementDiscoveryProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { element: Element; weight: number }>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, element: Element, weight: number) => {
    const newAnswers = { ...answers, [questionId]: { element, weight } };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const calculateResult = () => {
    const scores: Record<Element, number> = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };

    Object.values(answers).forEach(({ element, weight }) => {
      scores[element] += weight;
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return {
      dominant: sorted[0][0] as Element,
      secondary: sorted[1][0] as Element,
      scores
    };
  };

  const handleComplete = () => {
    const result = calculateResult();
    onComplete(result);
    // Reset for next time
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const result = showResult ? calculateResult() : null;
  const DominantIcon = result ? elementConfig[result.dominant].icon : Sparkles;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[101] overflow-hidden"
          >
            <div className="h-full bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 rounded-2xl border border-amber-900/30 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-amber-900/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-medium text-amber-100">
                    {showResult ? 'Your Elemental Nature' : 'Discover Your Element'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {!showResult ? (
                    /* Questions */
                    <motion.div
                      key={`question-${currentQuestion}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-stone-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-500">
                          {currentQuestion + 1}/{questions.length}
                        </span>
                      </div>

                      {/* Question */}
                      <div>
                        <p className="text-lg text-stone-200 leading-relaxed">
                          {questions[currentQuestion].question}
                        </p>
                        {questions[currentQuestion].context && (
                          <p className="text-sm text-stone-500 mt-2">
                            {questions[currentQuestion].context}
                          </p>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        {questions[currentQuestion].options.map((option, i) => (
                          <motion.button
                            key={i}
                            onClick={() => handleAnswer(questions[currentQuestion].id, option.element, option.weight)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              w-full p-4 rounded-xl text-left transition-all
                              bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/50
                              hover:border-amber-500/30
                            `}
                          >
                            <span className="text-stone-200">{option.text}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    /* Result */
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      {/* Dominant Element */}
                      <div className={`p-6 rounded-xl bg-gradient-to-br ${elementConfig[result!.dominant].color} bg-opacity-20 border ${elementConfig[result!.dominant].border}`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 rounded-xl ${elementConfig[result!.dominant].bg}`}>
                            <DominantIcon className={`w-10 h-10 ${elementConfig[result!.dominant].text}`} />
                          </div>
                          <div>
                            <div className="text-xs text-stone-400 uppercase tracking-wider">Your Dominant Element</div>
                            <div className="text-2xl font-medium text-white">{elementConfig[result!.dominant].name}</div>
                          </div>
                        </div>
                        <p className="text-stone-200 leading-relaxed">
                          {elementConfig[result!.dominant].description}
                        </p>
                      </div>

                      {/* Secondary Element */}
                      <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const SecondaryIcon = elementConfig[result!.secondary].icon;
                            return <SecondaryIcon className={`w-5 h-5 ${elementConfig[result!.secondary].text}`} />;
                          })()}
                          <div>
                            <div className="text-xs text-stone-500">Secondary Element</div>
                            <div className="text-stone-200">{elementConfig[result!.secondary].name}</div>
                          </div>
                        </div>
                      </div>

                      {/* Gifts & Shadows */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
                          <div className="text-xs text-amber-400/80 uppercase tracking-wider mb-2">Gifts</div>
                          <ul className="space-y-1">
                            {elementConfig[result!.dominant].gifts.slice(0, 3).map((gift, i) => (
                              <li key={i} className="text-sm text-stone-300">• {gift}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
                          <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Growth Edges</div>
                          <ul className="space-y-1">
                            {elementConfig[result!.dominant].shadows.slice(0, 3).map((shadow, i) => (
                              <li key={i} className="text-sm text-stone-400">• {shadow}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Practices */}
                      <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Practices for Balance</div>
                        <div className="flex flex-wrap gap-2">
                          {elementConfig[result!.dominant].practices.map((practice, i) => (
                            <span key={i} className="px-2 py-1 rounded-full text-xs bg-stone-700/50 text-stone-300">
                              {practice}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleReset}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/50 text-stone-300 text-sm transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retake
                        </button>
                        <button
                          onClick={handleComplete}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium hover:from-amber-500 hover:to-amber-400 transition-all"
                        >
                          Begin with MAIA
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ElementDiscovery;
