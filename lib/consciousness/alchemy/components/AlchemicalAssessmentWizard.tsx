/**
 * Alchemical Assessment Wizard
 * Interactive guide for discovering current alchemical stage and receiving personalized guidance
 *
 * Features:
 * - Multi-modal assessment (quick snapshot vs. deep exploration)
 * - Adaptive questioning based on response patterns
 * - Integration with progression tracking
 * - Personalized recommendations and next steps
 * - Dissolves after successful assessment (disposable pixel philosophy)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlchemicalMetal,
  AlchemicalOperation,
  AlchemicalProfile,
  MercuryAspect
} from '../types';
import { AlchemicalStateDetector } from '../AlchemicalStateDetector';
import { AlchemicalProgressionTracker } from '../AlchemicalProgressionTracker';
import { useAlchemicalInterface, useAlchemicalTiming } from './AdaptiveInterface';
import { WisdomTooltip, MomentOfTruthButton } from './DisposablePixelComponents';

// Assessment question types
interface AssessmentQuestion {
  id: string;
  category: 'emotional' | 'cognitive' | 'behavioral' | 'relational' | 'spiritual' | 'practical';
  question: string;
  subtext?: string;
  options: {
    value: string;
    label: string;
    metalIndicators: Partial<Record<AlchemicalMetal, number>>; // Weight for each metal (0-1)
    operationIndicators: Partial<Record<AlchemicalOperation, number>>;
  }[];
  adaptiveOptions?: {
    condition: (responses: AssessmentResponse[]) => boolean;
    additionalOptions: typeof this.options;
  }[];
}

interface AssessmentResponse {
  questionId: string;
  value: string;
  timestamp: number;
  confidence: number; // 0-1, how confident user was in this answer
}

interface AssessmentResult {
  metal: AlchemicalMetal;
  operation: AlchemicalOperation;
  mercuryAspect: MercuryAspect;
  confidence: number;
  profile: Partial<AlchemicalProfile>;
  recommendations: string[];
  nextSteps: string[];
  supportResources: string[];
}

// Assessment mode types
type AssessmentMode = 'quick' | 'guided' | 'deep' | 'crisis';

export interface AlchemicalAssessmentWizardProps {
  mode?: AssessmentMode;
  onAssessmentComplete: (result: AssessmentResult) => void;
  onDissolution?: () => void;
  existingResponses?: AssessmentResponse[];
  className?: string;
}

export const AlchemicalAssessmentWizard: React.FC<AlchemicalAssessmentWizardProps> = ({
  mode = 'guided',
  onAssessmentComplete,
  onDissolution,
  existingResponses = [],
  className = ''
}) => {
  const [currentMode, setCurrentMode] = useState<AssessmentMode>(mode);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>(existingResponses);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questionSet, setQuestionSet] = useState<AssessmentQuestion[]>([]);

  const { state } = useAlchemicalInterface();
  const { createSacredTimeout } = useAlchemicalTiming();

  // Assessment questions database
  const assessmentQuestions: Record<AssessmentMode, AssessmentQuestion[]> = {
    quick: [
      {
        id: 'current-feeling',
        category: 'emotional',
        question: 'How would you describe your current state?',
        subtext: 'Choose what feels most true right now',
        options: [
          {
            value: 'heavy-stuck',
            label: 'Heavy, stuck, or in crisis',
            metalIndicators: { lead: 0.9 },
            operationIndicators: { nigredo: 0.8 }
          },
          {
            value: 'curious-exploring',
            label: 'Curious and exploring new possibilities',
            metalIndicators: { tin: 0.8, mercury: 0.3 },
            operationIndicators: { albedo: 0.6 }
          },
          {
            value: 'focused-relationships',
            label: 'Focused on relationships and collaboration',
            metalIndicators: { bronze: 0.9 },
            operationIndicators: { albedo: 0.7 }
          },
          {
            value: 'driven-action',
            label: 'Driven to take action and make things happen',
            metalIndicators: { iron: 0.8 },
            operationIndicators: { rubedo: 0.6 }
          },
          {
            value: 'fluid-adaptive',
            label: 'Fluid, adaptive, and focused on teaching/guiding',
            metalIndicators: { mercury: 0.9 },
            operationIndicators: { albedo: 0.5, rubedo: 0.5 }
          },
          {
            value: 'reflective-wise',
            label: 'Reflective, seeking deeper wisdom',
            metalIndicators: { silver: 0.8 },
            operationIndicators: { albedo: 0.8 }
          },
          {
            value: 'integrated-serving',
            label: 'Integrated and focused on serving others',
            metalIndicators: { gold: 0.9 },
            operationIndicators: { rubedo: 0.9 }
          }
        ]
      },
      {
        id: 'main-challenge',
        category: 'practical',
        question: 'What\'s your main challenge right now?',
        options: [
          {
            value: 'crisis-management',
            label: 'Managing a crisis or major life change',
            metalIndicators: { lead: 0.9 },
            operationIndicators: { nigredo: 0.9 }
          },
          {
            value: 'finding-direction',
            label: 'Finding direction and making sense of options',
            metalIndicators: { tin: 0.8 },
            operationIndicators: { albedo: 0.7 }
          },
          {
            value: 'building-relationships',
            label: 'Building better relationships and connections',
            metalIndicators: { bronze: 0.8 },
            operationIndicators: { albedo: 0.6 }
          },
          {
            value: 'taking-action',
            label: 'Taking consistent, effective action',
            metalIndicators: { iron: 0.9 },
            operationIndicators: { rubedo: 0.7 }
          },
          {
            value: 'being-helpful',
            label: 'Being more helpful and adaptive to others',
            metalIndicators: { mercury: 0.8 },
            operationIndicators: { albedo: 0.4, rubedo: 0.6 }
          },
          {
            value: 'finding-wisdom',
            label: 'Finding deeper wisdom and meaning',
            metalIndicators: { silver: 0.9 },
            operationIndicators: { albedo: 0.8 }
          },
          {
            value: 'serving-purpose',
            label: 'Living my highest purpose and serving others',
            metalIndicators: { gold: 0.8 },
            operationIndicators: { rubedo: 0.9 }
          }
        ]
      },
      {
        id: 'support-preference',
        category: 'relational',
        question: 'What kind of support would be most helpful?',
        options: [
          {
            value: 'immediate-stability',
            label: 'Immediate stability and crisis support',
            metalIndicators: { lead: 0.8 },
            operationIndicators: { nigredo: 0.7 }
          },
          {
            value: 'learning-exploration',
            label: 'Learning opportunities and exploration',
            metalIndicators: { tin: 0.9 },
            operationIndicators: { albedo: 0.8 }
          },
          {
            value: 'collaboration-connection',
            label: 'Collaboration and deeper connections',
            metalIndicators: { bronze: 0.9 },
            operationIndicators: { albedo: 0.6 }
          },
          {
            value: 'structure-accountability',
            label: 'Structure, goals, and accountability',
            metalIndicators: { iron: 0.8 },
            operationIndicators: { rubedo: 0.8 }
          },
          {
            value: 'flexible-mentoring',
            label: 'Flexible mentoring and adaptive guidance',
            metalIndicators: { mercury: 0.9 },
            operationIndicators: { albedo: 0.5, rubedo: 0.5 }
          },
          {
            value: 'wisdom-contemplation',
            label: 'Wisdom traditions and contemplative practices',
            metalIndicators: { silver: 0.8 },
            operationIndicators: { albedo: 0.9 }
          },
          {
            value: 'service-opportunities',
            label: 'Service opportunities and legacy building',
            metalIndicators: { gold: 0.9 },
            operationIndicators: { rubedo: 1.0 }
          }
        ]
      }
    ],

    guided: [
      // Include all quick questions plus additional guided questions
      {
        id: 'energy-pattern',
        category: 'emotional',
        question: 'Which energy pattern feels most familiar?',
        subtext: 'Think about your natural rhythms over the past few weeks',
        options: [
          {
            value: 'heavy-dense',
            label: 'Heavy, dense energy that feels difficult to move',
            metalIndicators: { lead: 0.9 },
            operationIndicators: { nigredo: 0.8 }
          },
          {
            value: 'light-expansive',
            label: 'Light, expansive energy full of possibilities',
            metalIndicators: { tin: 0.8, mercury: 0.3 },
            operationIndicators: { albedo: 0.7 }
          },
          {
            value: 'warm-connecting',
            label: 'Warm, connecting energy that draws others in',
            metalIndicators: { bronze: 0.9 },
            operationIndicators: { albedo: 0.6 }
          },
          {
            value: 'focused-driving',
            label: 'Focused, driving energy that gets things done',
            metalIndicators: { iron: 0.9 },
            operationIndicators: { rubedo: 0.7 }
          },
          {
            value: 'fluid-quicksilver',
            label: 'Fluid, quicksilver energy that adapts to situations',
            metalIndicators: { mercury: 1.0 },
            operationIndicators: { albedo: 0.5, rubedo: 0.5 }
          },
          {
            value: 'cool-reflective',
            label: 'Cool, reflective energy like moonlight',
            metalIndicators: { silver: 0.9 },
            operationIndicators: { albedo: 0.8 }
          },
          {
            value: 'radiant-generous',
            label: 'Radiant, generous energy like sunlight',
            metalIndicators: { gold: 0.9 },
            operationIndicators: { rubedo: 0.9 }
          }
        ]
      },
      {
        id: 'learning-style',
        category: 'cognitive',
        question: 'How do you prefer to learn and grow?',
        options: [
          {
            value: 'through-crisis',
            label: 'Through crisis, breakdown, and breaking through',
            metalIndicators: { lead: 0.8 },
            operationIndicators: { nigredo: 0.9 }
          },
          {
            value: 'through-exploration',
            label: 'Through broad exploration and trying many things',
            metalIndicators: { tin: 0.9 },
            operationIndicators: { albedo: 0.8 }
          },
          {
            value: 'through-relationship',
            label: 'Through relationship, dialogue, and collaboration',
            metalIndicators: { bronze: 0.8 },
            operationIndicators: { albedo: 0.7 }
          },
          {
            value: 'through-practice',
            label: 'Through disciplined practice and achievement',
            metalIndicators: { iron: 0.9 },
            operationIndicators: { rubedo: 0.8 }
          },
          {
            value: 'through-teaching',
            label: 'Through teaching others and adapting to their needs',
            metalIndicators: { mercury: 0.9 },
            operationIndicators: { albedo: 0.4, rubedo: 0.6 }
          },
          {
            value: 'through-contemplation',
            label: 'Through contemplation, meditation, and inner work',
            metalIndicators: { silver: 0.9 },
            operationIndicators: { albedo: 0.9 }
          },
          {
            value: 'through-service',
            label: 'Through service, mentoring, and giving back',
            metalIndicators: { gold: 0.8 },
            operationIndicators: { rubedo: 1.0 }
          }
        ]
      }
    ],

    deep: [
      // Comprehensive assessment with more nuanced questions
    ],

    crisis: [
      // Specialized questions for crisis assessment
      {
        id: 'crisis-nature',
        category: 'emotional',
        question: 'What best describes your current crisis?',
        subtext: 'Remember, crisis can be a sacred passage to transformation',
        options: [
          {
            value: 'life-transition',
            label: 'Major life transition (job, relationship, location)',
            metalIndicators: { lead: 0.8, mercury: 0.2 },
            operationIndicators: { nigredo: 0.7 }
          },
          {
            value: 'identity-crisis',
            label: 'Identity crisis - not sure who I am anymore',
            metalIndicators: { lead: 0.9 },
            operationIndicators: { nigredo: 0.9 }
          },
          {
            value: 'meaning-crisis',
            label: 'Crisis of meaning and purpose',
            metalIndicators: { lead: 0.7, silver: 0.3 },
            operationIndicators: { nigredo: 0.6, albedo: 0.4 }
          },
          {
            value: 'overwhelm-burnout',
            label: 'Overwhelm and burnout',
            metalIndicators: { lead: 0.8, iron: 0.2 },
            operationIndicators: { nigredo: 0.8 }
          }
        ]
      }
    ]
  };

  // Initialize question set based on mode
  useEffect(() => {
    const questions = assessmentQuestions[currentMode];
    setQuestionSet(questions);
  }, [currentMode]);

  // Calculate assessment result from responses
  const calculateResult = useCallback(async (): Promise<AssessmentResult> => {
    const metalScores: Record<AlchemicalMetal, number> = {
      lead: 0, tin: 0, bronze: 0, iron: 0, mercury: 0, silver: 0, gold: 0
    };
    const operationScores: Record<AlchemicalOperation, number> = {
      nigredo: 0, albedo: 0, rubedo: 0
    };

    // Calculate scores from responses
    responses.forEach(response => {
      const question = questionSet.find(q => q.id === response.questionId);
      const option = question?.options.find(o => o.value === response.value);

      if (option) {
        // Weight by confidence
        const weight = response.confidence;

        Object.entries(option.metalIndicators).forEach(([metal, score]) => {
          metalScores[metal as AlchemicalMetal] += score * weight;
        });

        Object.entries(option.operationIndicators).forEach(([operation, score]) => {
          operationScores[operation as AlchemicalOperation] += score * weight;
        });
      }
    });

    // Normalize scores
    const totalMetalScore = Object.values(metalScores).reduce((sum, score) => sum + score, 0);
    const totalOperationScore = Object.values(operationScores).reduce((sum, score) => sum + score, 0);

    if (totalMetalScore > 0) {
      Object.keys(metalScores).forEach(metal => {
        metalScores[metal as AlchemicalMetal] /= totalMetalScore;
      });
    }

    if (totalOperationScore > 0) {
      Object.keys(operationScores).forEach(operation => {
        operationScores[operation as AlchemicalOperation] /= totalOperationScore;
      });
    }

    // Determine primary metal and operation
    const primaryMetal = Object.entries(metalScores)
      .sort(([, a], [, b]) => b - a)[0][0] as AlchemicalMetal;

    const primaryOperation = Object.entries(operationScores)
      .sort(([, a], [, b]) => b - a)[0][0] as AlchemicalOperation;

    // Calculate confidence based on score distribution
    const topMetalScore = metalScores[primaryMetal];
    const secondMetalScore = Object.values(metalScores).sort((a, b) => b - a)[1];
    const confidence = topMetalScore - secondMetalScore;

    // Determine Mercury aspect based on metal and responses
    const mercuryAspect = determineMercuryAspect(primaryMetal, responses);

    // Generate recommendations
    const recommendations = generateRecommendations(primaryMetal, primaryOperation, responses);
    const nextSteps = generateNextSteps(primaryMetal, responses);
    const supportResources = generateSupportResources(primaryMetal, responses);

    return {
      metal: primaryMetal,
      operation: primaryOperation,
      mercuryAspect,
      confidence,
      profile: {
        metal: primaryMetal,
        operation: primaryOperation,
        mercuryAspect,
        integrationLevel: confidence,
        adaptability: mercuryAspect === 'hermes-trickster' ? 0.8 : 0.5,
        supportLevel: primaryMetal === 'lead' ? 0.9 : 0.5
      },
      recommendations,
      nextSteps,
      supportResources
    };
  }, [responses, questionSet]);

  // Determine Mercury aspect based on assessment
  const determineMercuryAspect = (metal: AlchemicalMetal, responses: AssessmentResponse[]): MercuryAspect => {
    const aspectMapping: Record<AlchemicalMetal, MercuryAspect> = {
      lead: 'hermes-healer',
      tin: 'hermes-teacher',
      bronze: 'hermes-messenger',
      iron: 'hermes-guide',
      mercury: 'hermes-trickster',
      silver: 'hermes-psychopomp',
      gold: 'hermes-alchemist'
    };

    return aspectMapping[metal];
  };

  // Generate personalized recommendations
  const generateRecommendations = (
    metal: AlchemicalMetal,
    operation: AlchemicalOperation,
    responses: AssessmentResponse[]
  ): string[] => {
    const baseRecommendations: Record<AlchemicalMetal, string[]> = {
      lead: [
        'Focus on creating safe, stable environments for healing',
        'Practice basic self-care and grounding techniques',
        'Seek support from trusted friends or professionals',
        'Remember: this crisis contains the seeds of transformation'
      ],
      tin: [
        'Embrace your natural curiosity and explore new possibilities',
        'Try different approaches without pressure to commit immediately',
        'Connect with learning communities and optimistic people',
        'Allow yourself to be a beginner in new areas'
      ],
      bronze: [
        'Invest time in building and deepening relationships',
        'Practice collaborative approaches to challenges',
        'Focus on creating harmony and mutual benefit',
        'Develop your emotional intelligence and empathy'
      ],
      iron: [
        'Set clear, achievable goals with specific deadlines',
        'Develop disciplined daily practices',
        'Take on leadership opportunities that challenge you',
        'Balance action with reflection to avoid burnout'
      ],
      mercury: [
        'Embrace your role as teacher, guide, and bridge-builder',
        'Practice adapting your communication to different audiences',
        'Seek opportunities to mentor and support others',
        'Stay flexible and avoid getting too attached to outcomes'
      ],
      silver: [
        'Create regular time for contemplation and inner work',
        'Study wisdom traditions that resonate with you',
        'Practice discernment and deep listening',
        'Share your insights with others when invited'
      ],
      gold: [
        'Focus on service and creating lasting positive impact',
        'Mentor others while maintaining humility',
        'Integrate all your life experiences into wisdom',
        'Remember that mastery includes continued learning'
      ]
    };

    return baseRecommendations[metal] || [];
  };

  // Generate next steps
  const generateNextSteps = (metal: AlchemicalMetal, responses: AssessmentResponse[]): string[] => {
    const stepMapping: Record<AlchemicalMetal, string[]> = {
      lead: ['Establish daily grounding routine', 'Identify one trusted support person', 'Practice basic mindfulness'],
      tin: ['Choose one new area to explore this week', 'Join a learning group or class', 'Keep a possibility journal'],
      bronze: ['Reach out to one person for deeper connection', 'Practice active listening', 'Offer to collaborate on something'],
      iron: ['Set one clear goal for this month', 'Create a daily practice routine', 'Take on one leadership opportunity'],
      mercury: ['Offer to teach someone something you know', 'Practice adapting your communication style', 'Seek feedback on your guidance'],
      silver: ['Begin or deepen a contemplative practice', 'Study one wisdom tradition', 'Practice silent reflection daily'],
      gold: ['Identify one way to serve your community', 'Share your story with someone who could benefit', 'Create something of lasting value']
    };

    return stepMapping[metal] || [];
  };

  // Generate support resources
  const generateSupportResources = (metal: AlchemicalMetal, responses: AssessmentResponse[]): string[] => {
    const resourceMapping: Record<AlchemicalMetal, string[]> = {
      lead: ['Crisis support hotlines', 'Trauma-informed therapy', 'Support groups', 'Grounding techniques'],
      tin: ['Online courses and workshops', 'Learning communities', 'Books and podcasts', 'Mentorship programs'],
      bronze: ['Relationship workshops', 'Communication training', 'Collaborative projects', 'Community groups'],
      iron: ['Goal-setting frameworks', 'Accountability partners', 'Leadership training', 'Productivity tools'],
      mercury: ['Teaching opportunities', 'Mentoring programs', 'Communication workshops', 'Facilitation training'],
      silver: ['Meditation groups', 'Wisdom traditions', 'Contemplative practices', 'Spiritual direction'],
      gold: ['Service organizations', 'Mentoring programs', 'Legacy projects', 'Philanthropic opportunities']
    };

    return resourceMapping[metal] || [];
  };

  // Handle response to current question
  const handleResponse = (value: string, confidence: number = 0.8) => {
    const newResponse: AssessmentResponse = {
      questionId: questionSet[currentQuestionIndex].id,
      value,
      timestamp: Date.now(),
      confidence
    };

    setResponses(prev => [...prev, newResponse]);

    // Move to next question or complete assessment
    if (currentQuestionIndex < questionSet.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  // Complete assessment and calculate results
  const completeAssessment = async () => {
    setIsProcessing(true);

    try {
      const result = await calculateResult();
      setAssessmentResult(result);
      setIsComplete(true);
      onAssessmentComplete(result);

      // Begin dissolution process
      createSacredTimeout(() => {
        onDissolution?.();
      }, 10000); // Give time to review results

    } catch (error) {
      console.error('Assessment calculation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentQuestion = questionSet[currentQuestionIndex];

  if (isComplete && assessmentResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(1px)' }}
        transition={{ duration: 1.5 }}
        className={`max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl ${className}`}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Your Alchemical Profile</h2>
          <p className="text-gray-600">Assessment complete - guidance integrating...</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Primary Results */}
          <div className="bg-white/80 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Primary Stage</h3>
            <div className="text-center">
              <div className="text-3xl font-bold capitalize mb-1">
                {assessmentResult.metal}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Operation: {assessmentResult.operation}
              </div>
              <div className="text-xs text-gray-500">
                Confidence: {Math.round(assessmentResult.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/80 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Key Recommendations</h3>
            <ul className="text-sm space-y-1">
              {assessmentResult.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-gray-700">• {rec}</li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-white/80 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Immediate Next Steps</h3>
            <ul className="text-sm space-y-1">
              {assessmentResult.nextSteps.map((step, index) => (
                <li key={index} className="text-gray-700">• {step}</li>
              ))}
            </ul>
          </div>

          {/* Support Resources */}
          <div className="bg-white/80 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Support Resources</h3>
            <ul className="text-sm space-y-1">
              {assessmentResult.supportResources.slice(0, 3).map((resource, index) => (
                <li key={index} className="text-gray-700">• {resource}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dissolution indicator */}
        <motion.div
          className="mt-6 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
        >
          This assessment dissolves in a moment to make space for your next transformation...
        </motion.div>
      </motion.div>
    );
  }

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`max-w-lg mx-auto p-8 text-center ${className}`}
      >
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Calculating Your Alchemical Profile</h3>
        <p className="text-gray-600">Integrating your responses with sacred principles...</p>
      </motion.div>
    );
  }

  if (!currentQuestion) {
    return <div>Loading assessment...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`max-w-2xl mx-auto ${className}`}
    >
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questionSet.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questionSet.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-purple-600 h-2 rounded-full"
            animate={{ width: `${((currentQuestionIndex + 1) / questionSet.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-2xl p-8 shadow-lg"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{currentQuestion.question}</h2>
          {currentQuestion.subtext && (
            <p className="text-gray-600 text-sm">{currentQuestion.subtext}</p>
          )}
        </div>

        {/* Response options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleResponse(option.value)}
              className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
            >
              <div className="font-medium group-hover:text-purple-700">
                {option.label}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mode switcher for quick assessment */}
      {currentMode === 'quick' && currentQuestionIndex === 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentMode('guided')}
            className="text-sm text-purple-600 hover:text-purple-800 underline"
          >
            Switch to guided assessment for deeper insights
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AlchemicalAssessmentWizard;