/**
 * MAIA Universal Multi-Faith Spiritual Assessment Tool
 * Determines user's faith context, elemental affinities, and spiritual growth phase
 * Integrates with Spiralogic framework and AIN memory system
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SpiritualAssessmentData {
  // Faith and Tradition
  primaryTradition: string;
  secondaryTraditions: string[];
  denomination?: string;
  interfaithOpenness: number;

  // Spiritual Development
  spiritualMaturity: 'seeker' | 'initiate' | 'practitioner' | 'adept' | 'sage';
  currentPhase: 'initiation' | 'grounding' | 'collaboration' | 'transformation' | 'completion';

  // Elemental Affinities
  elementalBalance: {
    fire: number;    // Spirit, vision, transformation
    water: number;   // Emotion, compassion, flow
    earth: number;   // Embodiment, service, grounding
    air: number;     // Wisdom, communication, clarity
    aether: number;  // Union, transcendence, mystery
  };

  // Practice and Context
  practicePreferences: string[];
  timeAvailability: 'minimal' | 'moderate' | 'substantial' | 'intensive';
  communityPreference: 'solitary' | 'small_group' | 'community' | 'mixed';
  currentChallenges: string[];
  spiritualGoals: string[];
}

interface AssessmentQuestion {
  id: string;
  type: 'single' | 'multiple' | 'scale' | 'elemental';
  category: 'tradition' | 'maturity' | 'phase' | 'practice' | 'challenges' | 'goals';
  question: string;
  description?: string;
  options?: Array<{ value: string; label: string; description?: string }>;
  scaleRange?: [number, number];
  scaleLabels?: { low: string; high: string };
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Faith Tradition Questions
  {
    id: 'primary-tradition',
    type: 'single',
    category: 'tradition',
    question: 'Which spiritual tradition feels most like home to you?',
    description: 'This will be your primary spiritual lens through which MAIA provides guidance.',
    options: [
      { value: 'christianity', label: 'Christianity', description: 'Jesus-centered faith emphasizing love, grace, and redemption' },
      { value: 'islam', label: 'Islam', description: 'Submission to Allah with emphasis on mercy, justice, and community' },
      { value: 'judaism', label: 'Judaism', description: 'Covenant relationship with emphasis on wisdom, justice, and sacred living' },
      { value: 'hinduism', label: 'Hinduism', description: 'Dharmic path emphasizing devotion, duty, and liberation' },
      { value: 'buddhism', label: 'Buddhism', description: 'Path to awakening through compassion, wisdom, and mindfulness' },
      { value: 'sikhism', label: 'Sikhism', description: 'Unity of God through meditation, honest work, and sharing' },
      { value: 'indigenous', label: 'Indigenous Spirituality', description: 'Earth-based wisdom honoring ancestors and natural harmony' },
      { value: 'interfaith', label: 'Interfaith/Universal', description: 'Drawing wisdom from multiple traditions' },
      { value: 'seeking', label: 'Still Seeking', description: 'Exploring different paths to find what resonates' }
    ]
  },

  {
    id: 'interfaith-openness',
    type: 'scale',
    category: 'tradition',
    question: 'How open are you to wisdom from other faith traditions?',
    description: 'This helps MAIA know whether to include interfaith perspectives in guidance.',
    scaleRange: [0, 100],
    scaleLabels: {
      low: 'Prefer to focus solely on my tradition',
      high: 'Very open to learning from all wisdom traditions'
    }
  },

  // Spiritual Maturity Assessment
  {
    id: 'spiritual-maturity',
    type: 'single',
    category: 'maturity',
    question: 'How would you describe your current spiritual development?',
    options: [
      {
        value: 'seeker',
        label: 'Seeker',
        description: 'Just beginning to explore spiritual questions and practices'
      },
      {
        value: 'initiate',
        label: 'Initiate',
        description: 'Have made initial commitments and learning basic practices'
      },
      {
        value: 'practitioner',
        label: 'Practitioner',
        description: 'Established in regular practice with growing understanding'
      },
      {
        value: 'adept',
        label: 'Adept',
        description: 'Deep practice and understanding, often guide others'
      },
      {
        value: 'sage',
        label: 'Sage',
        description: 'Mature wisdom and embodiment, teacher and exemplar'
      }
    ]
  },

  // Spiralogic Phase Assessment
  {
    id: 'current-phase',
    type: 'single',
    category: 'phase',
    question: 'Which phase best describes your current spiritual focus?',
    description: 'Based on the Spiralogic framework of spiritual development.',
    options: [
      {
        value: 'initiation',
        label: 'Initiation (Fire)',
        description: 'Receiving vision, calling, or initial spiritual awakening'
      },
      {
        value: 'grounding',
        label: 'Grounding (Earth)',
        description: 'Learning foundations, disciplines, and embodied practice'
      },
      {
        value: 'collaboration',
        label: 'Collaboration (Water)',
        description: 'Serving others, building community, expressing compassion'
      },
      {
        value: 'transformation',
        label: 'Transformation (Air)',
        description: 'Deepening wisdom, inner work, and conscious evolution'
      },
      {
        value: 'completion',
        label: 'Completion (Aether)',
        description: 'Integration, transcendence, and mystical union'
      }
    ]
  },

  // Practice Preferences
  {
    id: 'practice-preferences',
    type: 'multiple',
    category: 'practice',
    question: 'Which spiritual practices most appeal to you?',
    description: 'Select all that resonate. This helps MAIA suggest appropriate guidance.',
    options: [
      { value: 'prayer', label: 'Prayer and Petition' },
      { value: 'meditation', label: 'Meditation and Contemplation' },
      { value: 'study', label: 'Sacred Text Study' },
      { value: 'service', label: 'Community Service' },
      { value: 'ritual', label: 'Ceremonial Ritual' },
      { value: 'nature', label: 'Nature-based Practice' },
      { value: 'music', label: 'Sacred Music and Chanting' },
      { value: 'pilgrimage', label: 'Pilgrimage and Sacred Journey' },
      { value: 'fasting', label: 'Fasting and Discipline' },
      { value: 'celebration', label: 'Festival and Celebration' }
    ]
  },

  // Current Challenges
  {
    id: 'current-challenges',
    type: 'multiple',
    category: 'challenges',
    question: 'What spiritual challenges are you currently facing?',
    description: 'Honest assessment helps MAIA provide relevant support.',
    options: [
      { value: 'doubt', label: 'Doubt and Questioning' },
      { value: 'dryness', label: 'Spiritual Dryness' },
      { value: 'anger', label: 'Anger at God/Universe' },
      { value: 'grief', label: 'Grief and Loss' },
      { value: 'guilt', label: 'Guilt and Shame' },
      { value: 'fear', label: 'Fear and Anxiety' },
      { value: 'loneliness', label: 'Spiritual Loneliness' },
      { value: 'direction', label: 'Lack of Direction' },
      { value: 'practice', label: 'Inconsistent Practice' },
      { value: 'community', label: 'Finding Spiritual Community' }
    ]
  },

  // Spiritual Goals
  {
    id: 'spiritual-goals',
    type: 'multiple',
    category: 'goals',
    question: 'What are your primary spiritual aspirations?',
    options: [
      { value: 'peace', label: 'Inner Peace and Calm' },
      { value: 'purpose', label: 'Life Purpose and Calling' },
      { value: 'love', label: 'Greater Capacity for Love' },
      { value: 'wisdom', label: 'Spiritual Wisdom and Understanding' },
      { value: 'service', label: 'Meaningful Service to Others' },
      { value: 'healing', label: 'Personal and Relational Healing' },
      { value: 'union', label: 'Union with the Divine' },
      { value: 'freedom', label: 'Spiritual Freedom and Liberation' },
      { value: 'growth', label: 'Continuous Spiritual Growth' },
      { value: 'community', label: 'Deep Spiritual Friendship' }
    ]
  }
];

// Elemental Affinity Questions - Special Type
const ELEMENTAL_QUESTIONS = [
  {
    element: 'fire',
    question: 'How much do you resonate with FIRE qualities?',
    description: 'Passion, transformation, vision, spiritual intensity, divine calling',
    color: 'from-red-500 to-orange-500'
  },
  {
    element: 'water',
    question: 'How much do you resonate with WATER qualities?',
    description: 'Emotion, compassion, flow, healing, forgiveness, intuition',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    element: 'earth',
    question: 'How much do you resonate with EARTH qualities?',
    description: 'Grounding, service, embodiment, discipline, practical action',
    color: 'from-green-600 to-emerald-600'
  },
  {
    element: 'air',
    question: 'How much do you resonate with AIR qualities?',
    description: 'Wisdom, communication, study, mental clarity, teaching',
    color: 'from-gray-400 to-gray-600'
  },
  {
    element: 'aether',
    question: 'How much do you resonate with AETHER qualities?',
    description: 'Transcendence, mystery, union, contemplation, mystical experience',
    color: 'from-purple-500 to-violet-600'
  }
];

export default function SpiritualAssessmentTool() {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<Partial<SpiritualAssessmentData>>({
    elementalBalance: { fire: 50, water: 50, earth: 50, air: 50, aether: 50 },
    secondaryTraditions: [],
    practicePreferences: [],
    currentChallenges: [],
    spiritualGoals: []
  });
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = ASSESSMENT_QUESTIONS.length + ELEMENTAL_QUESTIONS.length + 1; // +1 for review
  const progress = (currentStep / totalSteps) * 100;

  const handleAnswerChange = useCallback((questionId: string, value: any, type: string) => {
    setAssessmentData(prev => {
      const updated = { ...prev };

      switch (type) {
        case 'single':
          updated[questionId as keyof SpiritualAssessmentData] = value;
          break;
        case 'multiple':
          const currentValues = (updated[questionId as keyof SpiritualAssessmentData] as string[]) || [];
          if (currentValues.includes(value)) {
            updated[questionId as keyof SpiritualAssessmentData] = currentValues.filter(v => v !== value) as any;
          } else {
            updated[questionId as keyof SpiritualAssessmentData] = [...currentValues, value] as any;
          }
          break;
        case 'scale':
          if (questionId === 'interfaith-openness') {
            updated.interfaithOpenness = value / 100;
          } else {
            updated[questionId as keyof SpiritualAssessmentData] = value as any;
          }
          break;
        case 'elemental':
          updated.elementalBalance = {
            ...updated.elementalBalance!,
            [questionId]: value / 100
          };
          break;
      }

      return updated;
    });
  }, []);

  const renderQuestion = (question: AssessmentQuestion) => {
    const currentValue = assessmentData[question.id as keyof SpiritualAssessmentData];

    switch (question.type) {
      case 'single':
        return (
          <RadioGroup
            value={currentValue as string || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value, 'single')}
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 space-y-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple':
        const selectedValues = (currentValue as string[]) || [];
        return (
          <div className="grid gap-3">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedValues.includes(option.value)
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-background border-border hover:bg-muted/50'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleAnswerChange(question.id, option.value, 'multiple')}
                  className="sr-only"
                />
                <div className="text-sm font-medium">{option.label}</div>
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-6">
            <Slider
              value={[question.id === 'interfaith-openness' ? (assessmentData.interfaithOpenness! * 100) : (currentValue as number || 50)]}
              onValueChange={([value]) => handleAnswerChange(question.id, value, 'scale')}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.scaleLabels?.low}</span>
              <span>{question.scaleLabels?.high}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderElementalQuestion = (elementQuestion: any) => {
    const currentValue = assessmentData.elementalBalance?.[elementQuestion.element as keyof typeof assessmentData.elementalBalance] || 0.5;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className={`p-6 rounded-xl bg-gradient-to-br ${elementQuestion.color} text-white`}>
          <h3 className="text-xl font-semibold mb-2">
            {elementQuestion.element.toUpperCase()} Element
          </h3>
          <p className="text-white/90">{elementQuestion.description}</p>
        </div>

        <div className="space-y-4">
          <Slider
            value={[currentValue * 100]}
            onValueChange={([value]) => handleAnswerChange(elementQuestion.element, value, 'elemental')}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Not very resonant</span>
            <span>Deeply resonant</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderReview = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-soul-text mb-2">
            Your Spiritual Profile
          </h3>
          <p className="text-soul-textSecondary">
            Review your responses and complete your assessment
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Faith Tradition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{assessmentData.primaryTradition}</p>
              <p className="text-sm text-muted-foreground">
                Interfaith openness: {Math.round((assessmentData.interfaithOpenness || 0) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spiritual Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{assessmentData.spiritualMaturity}</p>
              <p className="text-sm text-muted-foreground">
                Current phase: {assessmentData.currentPhase}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Elemental Balance Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Elemental Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(assessmentData.elementalBalance || {}).map(([element, value]) => (
                <div key={element} className="flex items-center space-x-3">
                  <span className="w-16 text-sm capitalize">{element}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
      // Here you would save the assessment data to your backend
      console.log('Assessment completed:', assessmentData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6 text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-gold-divine rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✨</span>
          </div>
          <h2 className="text-2xl font-semibold text-soul-text mb-2">
            Assessment Complete
          </h2>
          <p className="text-soul-textSecondary">
            Your spiritual profile has been created. MAIA will now provide personalized guidance
            based on your faith tradition, spiritual maturity, and elemental affinities.
          </p>
        </div>

        <Button
          onClick={() => {
            // Navigate to main MAIA interface
            window.location.href = '/maia';
          }}
          className="bg-gradient-to-r from-amber-500 to-gold-divine text-white"
        >
          Begin Your Spiritual Journey with MAIA
        </Button>
      </motion.div>
    );
  }

  let currentQuestion;
  let isElementalQuestion = false;

  if (currentStep < ASSESSMENT_QUESTIONS.length) {
    currentQuestion = ASSESSMENT_QUESTIONS[currentStep];
  } else if (currentStep < ASSESSMENT_QUESTIONS.length + ELEMENTAL_QUESTIONS.length) {
    currentQuestion = ELEMENTAL_QUESTIONS[currentStep - ASSESSMENT_QUESTIONS.length];
    isElementalQuestion = true;
  } else {
    // Review step
    currentQuestion = null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Spiritual Assessment</span>
          <span>{currentStep + 1} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-soul-text">
            {currentQuestion ?
              (isElementalQuestion ? currentQuestion.question : currentQuestion.question) :
              'Review Your Responses'
            }
          </CardTitle>
          {currentQuestion && !isElementalQuestion && currentQuestion.description && (
            <p className="text-soul-textSecondary">{currentQuestion.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestion ?
                (isElementalQuestion ?
                  renderElementalQuestion(currentQuestion) :
                  renderQuestion(currentQuestion)
                ) :
                renderReview()
              }
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-amber-500 to-gold-divine text-white"
        >
          {currentStep === totalSteps - 1 ? 'Complete Assessment' : 'Next'}
        </Button>
      </div>
    </div>
  );
}