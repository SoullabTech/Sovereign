import { NextRequest, NextResponse } from 'next/server';

/**
 * IPP (Ideal Parenting Protocol) Assessment API
 * Complete 40-question assessment with Spiralogic 5-element framework
 * Based on Dan Brown and David Elliott's IPP methodology
 */

// Element categories for the 5-element system
export enum Element {
  EARTH = 'earth',
  WATER = 'water',
  FIRE = 'fire',
  AIR = 'air',
  AETHER = 'aether'
}

// Question types for different assessment areas
export enum QuestionType {
  PARENTING_BEHAVIOR = 'parenting_behavior',
  EMOTIONAL_REGULATION = 'emotional_regulation',
  ATTACHMENT_PATTERN = 'attachment_pattern',
  TRAUMA_INDICATOR = 'trauma_indicator',
  DEVELOPMENTAL_STAGE = 'developmental_stage'
}

// Assessment question structure
export interface IPPQuestion {
  questionId: number;
  questionText: string;
  element: Element;
  questionType: QuestionType;
  responseType: 'likert_5' | 'multiple_choice' | 'yes_no';
  options?: string[];
  scoringWeights: {
    [key: string]: number; // Option value -> score
  };
  traumaIndicator?: boolean;
  attachmentRelevant?: boolean;
}

// Complete 40-question IPP assessment
export const IPP_QUESTIONS: IPPQuestion[] = [
  // EARTH ELEMENT - Safety, Security, Grounding, Structure (Questions 1-8)
  {
    questionId: 1,
    questionText: "When my child is upset or anxious, I am able to help them feel safe and grounded.",
    element: Element.EARTH,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 2,
    questionText: "I provide consistent routines and structure in my household.",
    element: Element.EARTH,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 3,
    questionText: "I struggle with feeling overwhelmed by basic parenting responsibilities.",
    element: Element.EARTH,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 4,
    questionText: "My child seems to feel secure and protected in our home environment.",
    element: Element.EARTH,
    questionType: QuestionType.ATTACHMENT_PATTERN,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    },
    attachmentRelevant: true
  },
  {
    questionId: 5,
    questionText: "I have difficulty maintaining emotional stability during stressful parenting moments.",
    element: Element.EARTH,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 6,
    questionText: "I am able to set appropriate boundaries with my child.",
    element: Element.EARTH,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 7,
    questionText: "I worry excessively about my child's safety or well-being.",
    element: Element.EARTH,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 8,
    questionText: "My child demonstrates age-appropriate independence and confidence.",
    element: Element.EARTH,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    },
    attachmentRelevant: true
  },

  // WATER ELEMENT - Emotion, Flow, Intuition, Nurturing (Questions 9-16)
  {
    questionId: 9,
    questionText: "I am comfortable expressing and discussing emotions with my child.",
    element: Element.WATER,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 10,
    questionText: "I trust my intuitive feelings about what my child needs.",
    element: Element.WATER,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 11,
    questionText: "I have difficulty managing my own emotional responses to my child's behavior.",
    element: Element.WATER,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 12,
    questionText: "My child feels comfortable sharing their feelings with me.",
    element: Element.WATER,
    questionType: QuestionType.ATTACHMENT_PATTERN,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    },
    attachmentRelevant: true
  },
  {
    questionId: 13,
    questionText: "I often feel emotionally disconnected from my child.",
    element: Element.WATER,
    questionType: QuestionType.ATTACHMENT_PATTERN,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true,
    attachmentRelevant: true
  },
  {
    questionId: 14,
    questionText: "I am able to provide nurturing physical comfort when my child needs it.",
    element: Element.WATER,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    },
    attachmentRelevant: true
  },
  {
    questionId: 15,
    questionText: "I struggle to understand or validate my child's emotional experiences.",
    element: Element.WATER,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 16,
    questionText: "My child demonstrates healthy emotional expression and regulation.",
    element: Element.WATER,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },

  // FIRE ELEMENT - Energy, Passion, Will, Direction (Questions 17-24)
  {
    questionId: 17,
    questionText: "I am able to set clear expectations and follow through with consequences.",
    element: Element.FIRE,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 18,
    questionText: "I encourage my child's natural interests and passions.",
    element: Element.FIRE,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 19,
    questionText: "I find myself being overly controlling or demanding with my child.",
    element: Element.FIRE,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 20,
    questionText: "My child shows healthy assertiveness and self-advocacy.",
    element: Element.FIRE,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 21,
    questionText: "I struggle with anger or impatience in my parenting.",
    element: Element.FIRE,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 22,
    questionText: "I support my child in developing their own sense of direction and purpose.",
    element: Element.FIRE,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 23,
    questionText: "I feel depleted or burned out from parenting demands.",
    element: Element.FIRE,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 24,
    questionText: "My child demonstrates healthy motivation and goal-directed behavior.",
    element: Element.FIRE,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },

  // AIR ELEMENT - Communication, Thought, Social Connection (Questions 25-32)
  {
    questionId: 25,
    questionText: "I communicate clearly and age-appropriately with my child.",
    element: Element.AIR,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 26,
    questionText: "I encourage my child's curiosity and questions.",
    element: Element.AIR,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 27,
    questionText: "I have difficulty listening to or understanding my child's perspective.",
    element: Element.AIR,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 28,
    questionText: "My child demonstrates age-appropriate social skills with peers.",
    element: Element.AIR,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 29,
    questionText: "I find myself criticizing or correcting my child frequently.",
    element: Element.AIR,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 30,
    questionText: "I create opportunities for meaningful conversation with my child.",
    element: Element.AIR,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 31,
    questionText: "I struggle to maintain healthy adult relationships outside of parenting.",
    element: Element.AIR,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 32,
    questionText: "My child engages in healthy communication and conflict resolution.",
    element: Element.AIR,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },

  // AETHER ELEMENT - Spirituality, Meaning, Connection to Greater Purpose (Questions 33-40)
  {
    questionId: 33,
    questionText: "I help my child develop a sense of meaning and purpose in life.",
    element: Element.AETHER,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 34,
    questionText: "I model values and integrity in my daily interactions with my child.",
    element: Element.AETHER,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 35,
    questionText: "I feel disconnected from my own sense of purpose as a parent.",
    element: Element.AETHER,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 36,
    questionText: "My child demonstrates compassion and empathy for others.",
    element: Element.AETHER,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 37,
    questionText: "I struggle with feelings of shame or inadequacy as a parent.",
    element: Element.AETHER,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 38,
    questionText: "I encourage my child's spiritual or philosophical development (in whatever form feels appropriate).",
    element: Element.AETHER,
    questionType: QuestionType.PARENTING_BEHAVIOR,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  },
  {
    questionId: 39,
    questionText: "I feel overwhelmed by the responsibility of shaping my child's character.",
    element: Element.AETHER,
    questionType: QuestionType.EMOTIONAL_REGULATION,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 5, '2': 4, '3': 3, '4': 2, '5': 1 // Reverse scored
    },
    traumaIndicator: true
  },
  {
    questionId: 40,
    questionText: "My child demonstrates a healthy sense of self-worth and connection to something greater than themselves.",
    element: Element.AETHER,
    questionType: QuestionType.DEVELOPMENTAL_STAGE,
    responseType: 'likert_5',
    scoringWeights: {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    }
  }
];

// Assessment response and scoring structures
export interface AssessmentResponse {
  questionId: number;
  response: string; // "1", "2", "3", "4", "5" for Likert scale
  timestamp: Date;
}

export interface ElementalScore {
  element: Element;
  rawScore: number;
  percentileScore: number;
  level: 'low' | 'moderate' | 'high' | 'optimal';
  interpretation: string;
  recommendations: string[];
}

export interface AttachmentPattern {
  primaryStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  secondaryStyle?: string;
  confidence: number; // 0-1
  description: string;
  implications: string[];
}

export interface TraumaIndicators {
  overallRisk: 'low' | 'moderate' | 'high' | 'severe';
  specificIndicators: string[];
  recommendations: string[];
  professionalReferralRecommended: boolean;
}

export interface IPPAssessmentResult {
  assessmentId: string;
  clientId: string;
  practitionerId: string;
  completedAt: Date;

  // Raw data
  responses: AssessmentResponse[];

  // Elemental scoring
  elementalScores: ElementalScore[];
  dominantElement: Element;
  leastDevelopedElement: Element;

  // Clinical indicators
  attachmentPattern: AttachmentPattern;
  traumaIndicators: TraumaIndicators;

  // Overall assessment
  overallParentingCapacity: number; // 0-100
  strengthAreas: string[];
  growthAreas: string[];

  // Treatment planning
  recommendedInterventions: string[];
  treatmentPriorities: string[];
  estimatedTreatmentDuration: string;

  // Professional notes
  clinicalImpression: string;
  nextSteps: string[];
}

// In-memory storage for assessments (will be replaced with database)
const assessmentResults: Map<string, IPPAssessmentResult> = new Map();
const activeAssessments: Map<string, { responses: AssessmentResponse[], startedAt: Date }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, clientId, data } = body;

    // Check authorization for IPP framework access
    const accessCheck = await checkIPPAccess(userId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.reason },
        { status: 403 }
      );
    }

    switch (action) {
      case 'start_assessment':
        return await startAssessment(userId, clientId);

      case 'submit_responses':
        return await submitResponses(userId, clientId, data.responses);

      case 'complete_assessment':
        return await completeAssessment(userId, clientId);

      case 'get_results':
        return await getAssessmentResults(userId, clientId);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [IPP-ASSESSMENT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Assessment processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const accessCheck = await checkIPPAccess(userId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.reason },
        { status: 403 }
      );
    }

    switch (action) {
      case 'get_questions':
        return NextResponse.json({
          success: true,
          questions: IPP_QUESTIONS,
          totalQuestions: IPP_QUESTIONS.length,
          estimatedTime: "45-60 minutes"
        });

      case 'get_progress':
        const clientId = searchParams.get('clientId');
        if (!clientId) {
          return NextResponse.json(
            { success: false, error: 'Client ID required' },
            { status: 400 }
          );
        }
        return await getAssessmentProgress(userId, clientId);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [IPP-ASSESSMENT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function checkIPPAccess(userId: string) {
  try {
    // Check if user has IPP framework access
    const response = await fetch(`/api/clinical/frameworks?userId=${userId}&frameworkId=ipp-spiralogic-v2.1`);
    if (!response.ok) {
      return { authorized: false, reason: 'Unable to verify IPP access' };
    }

    const data = await response.json();
    if (!data.access?.authorized) {
      return { authorized: false, reason: 'IPP framework access required' };
    }

    return { authorized: true };
  } catch (error) {
    return { authorized: false, reason: 'Access verification failed' };
  }
}

async function startAssessment(userId: string, clientId: string) {
  const sessionId = `${userId}_${clientId}_${Date.now()}`;

  activeAssessments.set(sessionId, {
    responses: [],
    startedAt: new Date()
  });

  return NextResponse.json({
    success: true,
    message: 'IPP Assessment started',
    sessionId,
    questions: IPP_QUESTIONS,
    instructions: {
      timeEstimate: "45-60 minutes",
      instructions: [
        "Answer all questions as honestly as possible",
        "Consider your typical patterns over the past 3-6 months",
        "There are no right or wrong answers",
        "Take breaks as needed - your progress will be saved"
      ]
    }
  });
}

async function submitResponses(userId: string, clientId: string, responses: AssessmentResponse[]) {
  const sessionId = `${userId}_${clientId}`;
  const session = activeAssessments.get(sessionId);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Assessment session not found' },
      { status: 404 }
    );
  }

  // Update responses
  responses.forEach(response => {
    const existingIndex = session.responses.findIndex(r => r.questionId === response.questionId);
    if (existingIndex >= 0) {
      session.responses[existingIndex] = response;
    } else {
      session.responses.push(response);
    }
  });

  const completionRate = (session.responses.length / IPP_QUESTIONS.length) * 100;

  return NextResponse.json({
    success: true,
    message: 'Responses saved',
    completionRate,
    questionsRemaining: IPP_QUESTIONS.length - session.responses.length
  });
}

async function completeAssessment(userId: string, clientId: string) {
  const sessionId = `${userId}_${clientId}`;
  const session = activeAssessments.get(sessionId);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Assessment session not found' },
      { status: 404 }
    );
  }

  if (session.responses.length < IPP_QUESTIONS.length) {
    return NextResponse.json(
      { success: false, error: 'Assessment incomplete' },
      { status: 400 }
    );
  }

  // Score the assessment
  const result = await scoreIPPAssessment(userId, clientId, session.responses);

  // Store results
  assessmentResults.set(`${userId}_${clientId}`, result);

  // Clear active session
  activeAssessments.delete(sessionId);

  return NextResponse.json({
    success: true,
    message: 'Assessment completed successfully',
    assessmentId: result.assessmentId,
    summary: {
      dominantElement: result.dominantElement,
      leastDevelopedElement: result.leastDevelopedElement,
      overallCapacity: result.overallParentingCapacity,
      attachmentPattern: result.attachmentPattern.primaryStyle,
      traumaRisk: result.traumaIndicators.overallRisk
    }
  });
}

async function scoreIPPAssessment(
  userId: string,
  clientId: string,
  responses: AssessmentResponse[]
): Promise<IPPAssessmentResult> {

  // Calculate elemental scores
  const elementalScores = calculateElementalScores(responses);

  // Analyze attachment patterns
  const attachmentPattern = analyzeAttachmentPattern(responses);

  // Assess trauma indicators
  const traumaIndicators = assessTraumaIndicators(responses);

  // Calculate overall capacity
  const overallCapacity = calculateOverallCapacity(elementalScores);

  // Generate recommendations
  const recommendations = generateRecommendations(elementalScores, attachmentPattern, traumaIndicators);

  return {
    assessmentId: `ipp_${userId}_${clientId}_${Date.now()}`,
    clientId,
    practitionerId: userId,
    completedAt: new Date(),
    responses,
    elementalScores,
    dominantElement: findDominantElement(elementalScores),
    leastDevelopedElement: findLeastDevelopedElement(elementalScores),
    attachmentPattern,
    traumaIndicators,
    overallParentingCapacity: overallCapacity,
    strengthAreas: recommendations.strengths,
    growthAreas: recommendations.growth,
    recommendedInterventions: recommendations.interventions,
    treatmentPriorities: recommendations.priorities,
    estimatedTreatmentDuration: recommendations.duration,
    clinicalImpression: recommendations.impression,
    nextSteps: recommendations.nextSteps
  };
}

function calculateElementalScores(responses: AssessmentResponse[]): ElementalScore[] {
  const elementTotals: { [key in Element]: { total: number; count: number } } = {
    [Element.EARTH]: { total: 0, count: 0 },
    [Element.WATER]: { total: 0, count: 0 },
    [Element.FIRE]: { total: 0, count: 0 },
    [Element.AIR]: { total: 0, count: 0 },
    [Element.AETHER]: { total: 0, count: 0 }
  };

  // Calculate raw scores for each element
  responses.forEach(response => {
    const question = IPP_QUESTIONS.find(q => q.questionId === response.questionId);
    if (question) {
      const score = question.scoringWeights[response.response] || 0;
      elementTotals[question.element].total += score;
      elementTotals[question.element].count += 1;
    }
  });

  // Convert to percentile scores and interpretations
  return Object.entries(elementTotals).map(([element, data]) => {
    const rawScore = data.count > 0 ? data.total / data.count : 0;
    const percentileScore = (rawScore / 5) * 100; // Convert to 0-100 scale

    let level: 'low' | 'moderate' | 'high' | 'optimal';
    let interpretation: string;
    let recommendations: string[];

    if (percentileScore >= 80) {
      level = 'optimal';
      interpretation = `Strong ${element} element functioning`;
      recommendations = [`Maintain current ${element} practices`, `Share ${element} strengths with child`];
    } else if (percentileScore >= 60) {
      level = 'high';
      interpretation = `Good ${element} element functioning with minor growth areas`;
      recommendations = [`Continue developing ${element} skills`, `Focus on consistency`];
    } else if (percentileScore >= 40) {
      level = 'moderate';
      interpretation = `Moderate ${element} element functioning - significant room for growth`;
      recommendations = [`Target ${element} skill development`, `Seek ${element}-focused interventions`];
    } else {
      level = 'low';
      interpretation = `Low ${element} element functioning - priority intervention area`;
      recommendations = [`Immediate ${element} support needed`, `Consider ${element} trauma work`];
    }

    return {
      element: element as Element,
      rawScore,
      percentileScore,
      level,
      interpretation,
      recommendations
    };
  });
}

function analyzeAttachmentPattern(responses: AssessmentResponse[]): AttachmentPattern {
  // Get responses to attachment-relevant questions
  const attachmentResponses = responses.filter(response => {
    const question = IPP_QUESTIONS.find(q => q.questionId === response.questionId);
    return question?.attachmentRelevant;
  });

  // Simple attachment classification based on response patterns
  // In production, this would use validated attachment measures
  let secureScore = 0;
  let anxiousScore = 0;
  let avoidantScore = 0;

  attachmentResponses.forEach(response => {
    const score = parseInt(response.response);
    const question = IPP_QUESTIONS.find(q => q.questionId === response.questionId);

    if (question) {
      // Questions about emotional connection and comfort
      if ([4, 12, 14].includes(question.questionId)) {
        secureScore += score;
      }
      // Questions about emotional disconnection
      if ([13].includes(question.questionId)) {
        avoidantScore += (6 - score); // Reverse scored
      }
    }
  });

  let primaryStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  let description: string;
  let implications: string[];

  if (secureScore > anxiousScore && secureScore > avoidantScore) {
    primaryStyle = 'secure';
    description = 'Predominantly secure attachment pattern with capacity for emotional attunement';
    implications = ['Strong foundation for healthy child development', 'Good emotional regulation modeling'];
  } else if (avoidantScore > secureScore) {
    primaryStyle = 'avoidant';
    description = 'Some avoidant tendencies in attachment and emotional connection';
    implications = ['May need support with emotional attunement', 'Focus on nurturing physical and emotional closeness'];
  } else {
    primaryStyle = 'anxious';
    description = 'Some anxious attachment patterns present';
    implications = ['May benefit from self-regulation support', 'Focus on consistent, calm presence'];
  }

  return {
    primaryStyle,
    confidence: 0.7, // Moderate confidence with simplified assessment
    description,
    implications
  };
}

function assessTraumaIndicators(responses: AssessmentResponse[]): TraumaIndicators {
  // Get responses to trauma indicator questions
  const traumaResponses = responses.filter(response => {
    const question = IPP_QUESTIONS.find(q => q.questionId === response.questionId);
    return question?.traumaIndicator;
  });

  let traumaScore = 0;
  const specificIndicators: string[] = [];

  traumaResponses.forEach(response => {
    const question = IPP_QUESTIONS.find(q => q.questionId === response.questionId);
    if (question) {
      const score = parseInt(response.response);

      // For reverse-scored trauma questions, higher scores indicate more problems
      if (score >= 4) {
        traumaScore += 1;

        if (question.questionId === 3) specificIndicators.push('Overwhelm with parenting responsibilities');
        if (question.questionId === 5) specificIndicators.push('Emotional instability during stress');
        if (question.questionId === 7) specificIndicators.push('Excessive worry and anxiety');
        if (question.questionId === 11) specificIndicators.push('Difficulty managing emotional responses');
        if (question.questionId === 13) specificIndicators.push('Emotional disconnection from child');
        if (question.questionId === 15) specificIndicators.push('Difficulty with emotional validation');
        if (question.questionId === 19) specificIndicators.push('Controlling or demanding behavior');
        if (question.questionId === 21) specificIndicators.push('Anger and impatience issues');
        if (question.questionId === 23) specificIndicators.push('Parental burnout');
        if (question.questionId === 27) specificIndicators.push('Difficulty with perspective-taking');
        if (question.questionId === 29) specificIndicators.push('Excessive criticism');
        if (question.questionId === 31) specificIndicators.push('Social isolation');
        if (question.questionId === 35) specificIndicators.push('Loss of parental purpose');
        if (question.questionId === 37) specificIndicators.push('Parental shame and inadequacy');
        if (question.questionId === 39) specificIndicators.push('Overwhelm with character development responsibility');
      }
    }
  });

  let overallRisk: 'low' | 'moderate' | 'high' | 'severe';
  let recommendations: string[];
  let professionalReferralRecommended: boolean;

  if (traumaScore <= 2) {
    overallRisk = 'low';
    recommendations = ['Continue current self-care practices', 'Maintain support systems'];
    professionalReferralRecommended = false;
  } else if (traumaScore <= 5) {
    overallRisk = 'moderate';
    recommendations = ['Increase self-care and stress management', 'Consider parenting support groups'];
    professionalReferralRecommended = false;
  } else if (traumaScore <= 8) {
    overallRisk = 'high';
    recommendations = ['Professional therapeutic support recommended', 'Trauma-informed parenting interventions'];
    professionalReferralRecommended = true;
  } else {
    overallRisk = 'severe';
    recommendations = ['Immediate professional support required', 'Trauma therapy and parenting skills training'];
    professionalReferralRecommended = true;
  }

  return {
    overallRisk,
    specificIndicators,
    recommendations,
    professionalReferralRecommended
  };
}

function calculateOverallCapacity(elementalScores: ElementalScore[]): number {
  const totalPercentile = elementalScores.reduce((sum, score) => sum + score.percentileScore, 0);
  return Math.round(totalPercentile / elementalScores.length);
}

function findDominantElement(elementalScores: ElementalScore[]): Element {
  return elementalScores.reduce((dominant, current) =>
    current.percentileScore > dominant.percentileScore ? current : dominant
  ).element;
}

function findLeastDevelopedElement(elementalScores: ElementalScore[]): Element {
  return elementalScores.reduce((least, current) =>
    current.percentileScore < least.percentileScore ? current : least
  ).element;
}

function generateRecommendations(
  elementalScores: ElementalScore[],
  attachmentPattern: AttachmentPattern,
  traumaIndicators: TraumaIndicators
) {
  const strengths = elementalScores
    .filter(score => score.level === 'optimal' || score.level === 'high')
    .map(score => `${score.element} element functioning`);

  const growth = elementalScores
    .filter(score => score.level === 'low' || score.level === 'moderate')
    .map(score => `${score.element} element development`);

  const interventions = [
    ...elementalScores.flatMap(score => score.recommendations),
    ...attachmentPattern.implications,
    ...traumaIndicators.recommendations
  ];

  const priorities = elementalScores
    .filter(score => score.level === 'low')
    .map(score => `${score.element} element intervention`)
    .slice(0, 3);

  const duration = traumaIndicators.overallRisk === 'severe' ? '12-18 months' :
                   traumaIndicators.overallRisk === 'high' ? '8-12 months' :
                   traumaIndicators.overallRisk === 'moderate' ? '4-8 months' : '2-4 months';

  const impression = `IPP assessment reveals ${findDominantElement(elementalScores)} as primary strength, ` +
    `${findLeastDevelopedElement(elementalScores)} needing development. ` +
    `${attachmentPattern.primaryStyle} attachment pattern with ${traumaIndicators.overallRisk} trauma risk.`;

  const nextSteps = [
    'Review detailed results with supervisor',
    'Develop treatment plan based on priorities',
    'Schedule follow-up assessment in 3 months',
    ...(traumaIndicators.professionalReferralRecommended ? ['Coordinate with trauma specialist'] : [])
  ];

  return {
    strengths,
    growth,
    interventions,
    priorities,
    duration,
    impression,
    nextSteps
  };
}

async function getAssessmentProgress(userId: string, clientId: string) {
  const sessionId = `${userId}_${clientId}`;
  const session = activeAssessments.get(sessionId);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'No active assessment found' },
      { status: 404 }
    );
  }

  const completionRate = (session.responses.length / IPP_QUESTIONS.length) * 100;

  return NextResponse.json({
    success: true,
    progress: {
      totalQuestions: IPP_QUESTIONS.length,
      answeredQuestions: session.responses.length,
      completionRate,
      startedAt: session.startedAt,
      estimatedTimeRemaining: Math.max(0, 60 - ((Date.now() - session.startedAt.getTime()) / 60000))
    }
  });
}

async function getAssessmentResults(userId: string, clientId: string) {
  const resultKey = `${userId}_${clientId}`;
  const result = assessmentResults.get(resultKey);

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Assessment results not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    result
  });
}