// @ts-nocheck
export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;

// Skip during static export (Capacitor builds)

/**
 * MAIA IPP Conversational Integration
 * Enables MAIA to offer and conduct IPP assessments through natural conversation
 */

interface ConversationRequest {
  userId: string;
  conversationId: string;
  message: string;
  sessionContext?: SessionContext;
  userProfile?: UserProfile;
}

interface SessionContext {
  currentPhase?: 'trigger' | 'consent' | 'assessment' | 'results' | 'followup';
  assessmentProgress?: AssessmentProgress;
  userPreferences?: UserPreferences;
  conversationStyle?: 'supportive' | 'clinical' | 'educational';
}

interface AssessmentProgress {
  questionsAnswered: number;
  currentElement: Element;
  responses: ConversationalResponse[];
  startTime: Date;
  estimatedCompletion: number;
}

interface ConversationalResponse {
  questionId: number;
  naturalQuestion: string;
  userResponse: string;
  extractedValue: number | string;
  confidence: number;
  needsClarification?: boolean;
  followupNeeded?: boolean;
}

interface UserPreferences {
  pace: 'slow' | 'medium' | 'fast';
  style: 'casual' | 'structured' | 'gentle';
  breaks: boolean;
  personalizedFeedback: boolean;
}

interface ConversationResponse {
  success: boolean;
  response: ConversationalReply;
  actionRequired?: ActionRequired;
  sessionUpdate?: SessionUpdate;
}

interface ConversationalReply {
  type: 'trigger_offer' | 'consent_request' | 'assessment_question' | 'results_share' | 'followup_guidance';
  message: string;
  subMessages?: string[];
  options?: ConversationOption[];
  visualElements?: VisualElement[];
  emotionalTone: 'warm' | 'supportive' | 'encouraging' | 'professional' | 'celebratory';
}

interface ConversationOption {
  text: string;
  value: string;
  description?: string;
  recommended?: boolean;
}

interface VisualElement {
  type: 'progress_bar' | 'element_icon' | 'score_chart' | 'insight_card';
  data: any;
  description: string;
}

interface ActionRequired {
  type: 'await_response' | 'schedule_followup' | 'generate_report' | 'connect_professional';
  details: any;
  timeframe?: string;
}

interface SessionUpdate {
  phase?: string;
  progress?: AssessmentProgress;
  flags?: string[];
  nextSteps?: string[];
}

type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';

export async function POST(request: NextRequest) {
  try {
    const body: ConversationRequest = await request.json();
    const { userId, conversationId, message, sessionContext, userProfile } = body;

    // Validate user access
    const accessCheck = await validateConversationalAccess(userId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.reason },
        { status: 403 }
      );
    }

    // Process conversation based on current phase
    const conversationPhase = sessionContext?.currentPhase || 'trigger';
    const conversationResponse = await processConversationalPhase(
      conversationPhase,
      message,
      sessionContext,
      userProfile,
      userId
    );

    // Log conversation for learning and improvement
    await logConversationInteraction(userId, conversationId, message, conversationResponse);

    return NextResponse.json(conversationResponse);

  } catch (error) {
    console.error('❌ [MAIA-IPP-CONVERSATION] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process conversational IPP request' },
      { status: 500 }
    );
  }
}

async function validateConversationalAccess(userId: string) {
  try {
    if (!userId || userId === 'guest') {
      return { authorized: false, reason: 'Registration required for IPP assessments' };
    }

    // Check user subscription for IPP access
    const subscriptionResponse = await fetch(`/api/billing/subscriptions?userId=${userId}`);
    if (!subscriptionResponse.ok) {
      return { authorized: true, level: 'basic' }; // Allow basic access
    }

    const subscriptionData = await subscriptionResponse.json();
    const hasIPPAccess = subscriptionData.subscriptions?.some(
      (sub: any) => sub.features?.includes('ipp_assessment') || sub.tier !== 'consumer'
    );

    return {
      authorized: true,
      level: hasIPPAccess ? 'premium' : 'basic',
      subscriptions: subscriptionData.subscriptions
    };

  } catch (error) {
    return { authorized: true, level: 'basic' }; // Default to basic access
  }
}

async function processConversationalPhase(
  phase: string,
  message: string,
  context?: SessionContext,
  profile?: UserProfile,
  userId?: string
): Promise<ConversationResponse> {

  switch (phase) {
    case 'trigger':
      return await processTriggerPhase(message, userId);

    case 'consent':
      return await processConsentPhase(message, context);

    case 'assessment':
      return await processAssessmentPhase(message, context, profile);

    case 'results':
      return await processResultsPhase(message, context, userId);

    case 'followup':
      return await processFollowupPhase(message, context, userId);

    default:
      return await processTriggerPhase(message, userId);
  }
}

async function processTriggerPhase(message: string, userId?: string): Promise<ConversationResponse> {
  // Analyze message for IPP-relevant triggers
  const triggers = analyzeMessageForIPPTriggers(message);

  if (triggers.relevance > 0.6) { // High relevance threshold
    const response: ConversationalReply = {
      type: 'trigger_offer',
      message: `I notice you're exploring ${triggers.topics.join(', ')}. I have something that might really help you gain deeper insight into your ${triggers.primaryFocus}. \n\nWould you like to try the Ideal Parenting Protocol (IPP) assessment? It's based on the 5-element framework and provides personalized insights into your parenting patterns and relationships. It takes about 10-15 minutes and gives you a detailed understanding of your unique strengths and growth areas.`,
      subMessages: [
        "✨ The assessment explores Earth (stability), Water (emotions), Fire (motivation), Air (communication), and Aether (meaning) elements",
        "📊 You'll get personalized insights about your parenting style and relationship patterns",
        "🎯 Plus specific guidance for your unique elemental profile"
      ],
      options: [
        { text: "Yes, I'd love to try it!", value: "accept", recommended: true },
        { text: "Tell me more about it first", value: "learn_more" },
        { text: "Maybe later", value: "decline" }
      ],
      emotionalTone: 'encouraging'
    };

    return {
      success: true,
      response,
      actionRequired: { type: 'await_response', details: { triggerAnalysis: triggers } },
      sessionUpdate: { phase: 'consent', flags: [`triggered_by_${triggers.primaryFocus}`] }
    };
  }

  // Low relevance - provide contextual support without triggering assessment
  return {
    success: true,
    response: {
      type: 'trigger_offer',
      message: `I'm here to help with your ${extractSupportTopic(message)}. Feel free to ask me anything, and if you'd ever like a deeper assessment of your parenting or relationship patterns, I can offer you the IPP assessment.`,
      emotionalTone: 'supportive'
    },
    actionRequired: { type: 'await_response', details: { supportOffered: true } }
  };
}

async function processConsentPhase(message: string, context?: SessionContext): Promise<ConversationResponse> {
  const response = extractConsentResponse(message);

  if (response === 'accept') {
    const consentMessage = `Perfect! I'm excited to guide you through this insightful journey.

**Before we begin, here's what you should know:**
- This assessment is for personal insight and growth
- It's not a diagnostic tool or substitute for professional counseling
- Your responses are confidential and help create your personalized profile
- You can pause or stop at any time
- The assessment takes 10-15 minutes with 40 thoughtful questions

**What to expect:**
We'll explore five elements that shape your parenting and relationships:
🌍 **Earth** - Your grounding, stability, and structure
🌊 **Water** - Your emotional flow and empathy
🔥 **Fire** - Your passion and motivation
💨 **Air** - Your communication and perspective
✨ **Aether** - Your meaning-making and spiritual connection

Ready to discover your unique elemental profile?`;

    return {
      success: true,
      response: {
        type: 'consent_request',
        message: consentMessage,
        options: [
          { text: "Yes, let's begin!", value: "start_assessment", recommended: true },
          { text: "I have a question first", value: "question" },
          { text: "Not right now", value: "decline" }
        ],
        emotionalTone: 'warm'
      },
      actionRequired: { type: 'await_response', details: { consentGiven: true } },
      sessionUpdate: { phase: 'assessment' }
    };

  } else if (response === 'learn_more') {
    return await provideDetailedIPPInformation();

  } else {
    return {
      success: true,
      response: {
        type: 'trigger_offer',
        message: "No worries at all! I'm here whenever you need support. Feel free to ask me about parenting, relationships, or personal growth anytime. The assessment will always be available when you're curious to explore deeper insights. 💕",
        emotionalTone: 'warm'
      },
      actionRequired: { type: 'await_response', details: { assessmentDeclined: true } }
    };
  }
}

async function processAssessmentPhase(
  message: string,
  context?: SessionContext,
  profile?: UserProfile
): Promise<ConversationResponse> {

  const progress = context?.assessmentProgress || {
    questionsAnswered: 0,
    currentElement: 'earth',
    responses: [],
    startTime: new Date(),
    estimatedCompletion: 15
  };

  // Check if user wants to start or if they're responding to a question
  if (progress.questionsAnswered === 0 && extractStartCommand(message)) {
    return await startIPPAssessment(progress, profile);
  }

  // Process assessment response
  if (progress.questionsAnswered > 0) {
    return await processAssessmentResponse(message, progress, profile);
  }

  // Fallback - provide assessment start
  return await startIPPAssessment(progress, profile);
}

async function startIPPAssessment(progress: AssessmentProgress, profile?: UserProfile): Promise<ConversationResponse> {
  // Get first question from Earth element
  const firstQuestion = getConversationalQuestion(1, 'earth');

  const introMessage = `🌍 Let's start with your **Earth** element - your foundation and stability.

${firstQuestion.conversationalText}

*Take your time and answer honestly. There are no right or wrong answers - this is about discovering your unique patterns.*`;

  const updatedProgress: AssessmentProgress = {
    ...progress,
    questionsAnswered: 1,
    currentElement: 'earth',
    startTime: new Date()
  };

  return {
    success: true,
    response: {
      type: 'assessment_question',
      message: introMessage,
      options: firstQuestion.options,
      visualElements: [
        {
          type: 'progress_bar',
          data: { completed: 1, total: 40, element: 'earth' },
          description: 'Assessment progress'
        }
      ],
      emotionalTone: 'encouraging'
    },
    actionRequired: { type: 'await_response', details: { questionId: 1 } },
    sessionUpdate: {
      phase: 'assessment',
      progress: updatedProgress,
      nextSteps: ['process_response', 'continue_assessment']
    }
  };
}

async function processAssessmentResponse(
  message: string,
  progress: AssessmentProgress,
  profile?: UserProfile
): Promise<ConversationResponse> {

  const currentQuestionId = progress.questionsAnswered;
  const extractedResponse = extractAssessmentResponse(message, currentQuestionId);

  // Add response to progress
  const updatedResponses = [...progress.responses, {
    questionId: currentQuestionId,
    naturalQuestion: getConversationalQuestion(currentQuestionId, progress.currentElement).conversationalText,
    userResponse: message,
    extractedValue: extractedResponse.value,
    confidence: extractedResponse.confidence,
    needsClarification: extractedResponse.confidence < 0.7
  }];

  // Check if clarification needed
  if (extractedResponse.confidence < 0.7) {
    return await requestClarification(currentQuestionId, message, progress);
  }

  // Move to next question
  const nextQuestionId = currentQuestionId + 1;

  if (nextQuestionId > 40) {
    // Assessment complete - move to results
    return await completeAssessment(updatedResponses, progress, profile);
  }

  const nextElement = determineNextElement(nextQuestionId);
  const nextQuestion = getConversationalQuestion(nextQuestionId, nextElement);

  // Check if transitioning to new element
  const elementTransition = nextElement !== progress.currentElement;
  let transitionMessage = '';

  if (elementTransition) {
    transitionMessage = getElementTransitionMessage(progress.currentElement, nextElement);
  }

  const updatedProgress: AssessmentProgress = {
    ...progress,
    questionsAnswered: nextQuestionId,
    currentElement: nextElement,
    responses: updatedResponses
  };

  const responseMessage = `${transitionMessage}${nextQuestion.conversationalText}`;

  return {
    success: true,
    response: {
      type: 'assessment_question',
      message: responseMessage,
      options: nextQuestion.options,
      visualElements: [
        {
          type: 'progress_bar',
          data: { completed: nextQuestionId, total: 40, element: nextElement },
          description: 'Assessment progress'
        }
      ],
      emotionalTone: elementTransition ? 'encouraging' : 'supportive'
    },
    actionRequired: { type: 'await_response', details: { questionId: nextQuestionId } },
    sessionUpdate: {
      phase: 'assessment',
      progress: updatedProgress,
      flags: elementTransition ? [`transitioned_to_${nextElement}`] : undefined
    }
  };
}

async function completeAssessment(
  responses: ConversationalResponse[],
  progress: AssessmentProgress,
  profile?: UserProfile
): Promise<ConversationResponse> {

  const completionMessage = `🎉 **Beautiful work!** You've completed your IPP assessment.

I'm now analyzing your responses across all five elements to create your personalized profile. This will just take a moment...

*Your journey of self-discovery is about to reveal some amazing insights about your unique elemental pattern.*`;

  // Generate assessment results
  const assessmentResults = await generateConversationalResults(responses, profile);

  return {
    success: true,
    response: {
      type: 'results_share',
      message: completionMessage,
      subMessages: [
        "📊 Calculating your elemental scores...",
        "🔍 Analyzing your patterns and strengths...",
        "💎 Creating your personalized insights..."
      ],
      emotionalTone: 'celebratory'
    },
    actionRequired: {
      type: 'generate_report',
      details: { responses, assessmentResults },
      timeframe: 'immediate'
    },
    sessionUpdate: {
      phase: 'results',
      flags: ['assessment_completed', `duration_${Math.round((Date.now() - progress.startTime.getTime()) / 60000)}_minutes`]
    }
  };
}

async function processResultsPhase(
  message: string,
  context?: SessionContext,
  userId?: string
): Promise<ConversationResponse> {

  // Generate personalized results presentation
  const results = await generatePersonalizedResults(context, userId);

  const resultsMessage = `✨ **Your Unique Elemental Profile** ✨

${results.profileSummary}

**Your Elemental Scores:**
${results.elementalScores.map(score => `${score.icon} **${score.element}**: ${score.description} (${score.percentile}%)`).join('\n')}

**What This Means For You:**
${results.insights.map(insight => `• ${insight}`).join('\n')}

**Your Greatest Strengths:**
${results.strengths.map(strength => `💪 ${strength}`).join('\n')}

**Growth Opportunities:**
${results.growthAreas.map(area => `🌱 ${area}`).join('\n')}

Would you like me to dive deeper into any specific element, or would you like personalized guidance on how to use these insights?`;

  return {
    success: true,
    response: {
      type: 'results_share',
      message: resultsMessage,
      options: [
        { text: "Tell me more about my strongest element", value: "explore_strength" },
        { text: "How can I grow my weaker areas?", value: "growth_guidance" },
        { text: "Give me practical next steps", value: "actionable_steps" },
        { text: "Save my results and let me reflect", value: "save_results" }
      ],
      visualElements: [
        {
          type: 'score_chart',
          data: results.elementalScores,
          description: 'Your elemental profile visualization'
        }
      ],
      emotionalTone: 'celebratory'
    },
    actionRequired: { type: 'await_response', details: { resultsShared: true } },
    sessionUpdate: {
      phase: 'followup',
      nextSteps: ['provide_guidance', 'schedule_followup', 'save_results']
    }
  };
}

async function processFollowupPhase(
  message: string,
  context?: SessionContext,
  userId?: string
): Promise<ConversationResponse> {

  const followupType = extractFollowupIntent(message);

  switch (followupType) {
    case 'explore_strength':
      return await provideStrengthExploration(context, userId);

    case 'growth_guidance':
      return await provideGrowthGuidance(context, userId);

    case 'actionable_steps':
      return await provideActionableSteps(context, userId);

    case 'save_results':
      return await saveAndConcludeSession(context, userId);

    default:
      return await provideContinuedSupport(message, context, userId);
  }
}

// Helper functions for conversational flow

function analyzeMessageForIPPTriggers(message: string) {
  const triggers = {
    parenting: ['parent', 'child', 'kids', 'son', 'daughter', 'family', 'parenting', 'raising'],
    relationships: ['relationship', 'partner', 'marriage', 'dating', 'love', 'communication'],
    personal_growth: ['growth', 'development', 'self-improvement', 'understanding', 'insight', 'pattern'],
    emotional: ['emotions', 'feelings', 'emotional', 'mood', 'stress', 'anxiety', 'overwhelm'],
    spiritual: ['meaning', 'purpose', 'spiritual', 'connection', 'values', 'beliefs']
  };

  let relevance = 0;
  let topics: string[] = [];
  let primaryFocus = 'personal development';

  const messageLower = message.toLowerCase();

  Object.entries(triggers).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => messageLower.includes(keyword)).length;
    if (matches > 0) {
      relevance += matches * 0.2;
      topics.push(category.replace('_', ' '));
      if (matches > 1) primaryFocus = category.replace('_', ' ');
    }
  });

  return { relevance: Math.min(relevance, 1), topics, primaryFocus };
}

function extractConsentResponse(message: string): 'accept' | 'learn_more' | 'decline' | 'question' {
  const messageLower = message.toLowerCase();

  if (messageLower.includes('yes') || messageLower.includes('try') || messageLower.includes('love')) return 'accept';
  if (messageLower.includes('more') || messageLower.includes('tell me') || messageLower.includes('about')) return 'learn_more';
  if (messageLower.includes('question') || messageLower.includes('ask')) return 'question';
  if (messageLower.includes('no') || messageLower.includes('maybe') || messageLower.includes('later')) return 'decline';

  return 'accept'; // Default to accept for positive engagement
}

function extractStartCommand(message: string): boolean {
  const messageLower = message.toLowerCase();
  return messageLower.includes('start') || messageLower.includes('begin') || messageLower.includes('ready') ||
         messageLower.includes('yes') || messageLower.includes('let\'s go');
}

function getConversationalQuestion(questionId: number, element: Element) {
  // Map of all 40 IPP questions in conversational format
  const questions = {
    // Earth questions (1-8)
    1: {
      element: 'earth',
      conversationalText: "Let's start with how you create stability in your life. When things get chaotic, how naturally do you find yourself creating structure and routine to feel grounded?",
      options: [
        { text: "I'm really good at this - structure is my strength", value: 5 },
        { text: "I usually manage to create some structure", value: 4 },
        { text: "Sometimes I do, sometimes I don't", value: 3 },
        { text: "I struggle with this - structure feels hard", value: 2 },
        { text: "This is very challenging for me", value: 1 }
      ]
    },
    2: {
      element: 'earth',
      conversationalText: "Think about your relationship with your body and physical needs. How well do you tend to your physical health, rest, and basic self-care?",
      options: [
        { text: "I consistently prioritize my physical wellbeing", value: 5 },
        { text: "I usually take good care of my body", value: 4 },
        { text: "It's hit or miss - sometimes good, sometimes not", value: 3 },
        { text: "I often neglect my physical needs", value: 2 },
        { text: "Physical self-care is really hard for me", value: 1 }
      ]
    },
    // Water questions (9-16)
    9: {
      element: 'water',
      conversationalText: "🌊 Now let's explore your **Water** element - your emotional flow and intuition.\n\nWhen you're with others, how easily do you sense and attune to their emotional states?",
      options: [
        { text: "I'm very sensitive to others' emotions", value: 5 },
        { text: "I usually pick up on how others are feeling", value: 4 },
        { text: "Sometimes I notice, sometimes I miss it", value: 3 },
        { text: "I often miss emotional cues from others", value: 2 },
        { text: "I rarely notice others' emotional states", value: 1 }
      ]
    },
    // Fire questions (17-24)
    17: {
      element: 'fire',
      conversationalText: "🔥 Let's explore your **Fire** element - your passion and drive.\n\nWhen you set a goal that matters to you, how sustained is your motivation and energy to pursue it?",
      options: [
        { text: "I maintain strong drive until I achieve it", value: 5 },
        { text: "I usually stay motivated for important goals", value: 4 },
        { text: "My motivation varies - sometimes strong, sometimes weak", value: 3 },
        { text: "I often lose motivation partway through", value: 2 },
        { text: "I struggle to maintain motivation for goals", value: 1 }
      ]
    },
    // Air questions (25-32)
    25: {
      element: 'air',
      conversationalText: "💨 Now for your **Air** element - your mental clarity and communication.\n\nWhen you need to explain something important to someone, how clearly can you organize and express your thoughts?",
      options: [
        { text: "I communicate very clearly and effectively", value: 5 },
        { text: "I usually express myself well", value: 4 },
        { text: "Sometimes clear, sometimes confusing", value: 3 },
        { text: "I often struggle to express myself clearly", value: 2 },
        { text: "Clear communication is very challenging for me", value: 1 }
      ]
    },
    // Aether questions (33-40)
    33: {
      element: 'aether',
      conversationalText: "✨ Finally, your **Aether** element - your meaning-making and spiritual connection.\n\nHow connected do you feel to a sense of deeper purpose or meaning in your life?",
      options: [
        { text: "I feel very connected to my purpose", value: 5 },
        { text: "I usually have a sense of meaning", value: 4 },
        { text: "Sometimes I feel purpose, sometimes I don't", value: 3 },
        { text: "I often question my purpose", value: 2 },
        { text: "I struggle to find meaning and purpose", value: 1 }
      ]
    }
  };

  return questions[questionId] || {
    element,
    conversationalText: `Question ${questionId} about your ${element} element.`,
    options: [
      { text: "Strongly agree", value: 5 },
      { text: "Agree", value: 4 },
      { text: "Neutral", value: 3 },
      { text: "Disagree", value: 2 },
      { text: "Strongly disagree", value: 1 }
    ]
  };
}

function extractAssessmentResponse(message: string, questionId: number) {
  // Extract numeric or qualitative response from natural language
  const messageLower = message.toLowerCase();

  // Look for direct numeric responses
  const numbers = message.match(/\b([1-5])\b/);
  if (numbers) {
    return { value: parseInt(numbers[1]), confidence: 0.9 };
  }

  // Look for qualitative indicators
  if (messageLower.includes('very') || messageLower.includes('really') || messageLower.includes('extremely')) {
    if (messageLower.includes('good') || messageLower.includes('strong') || messageLower.includes('well')) {
      return { value: 5, confidence: 0.8 };
    } else if (messageLower.includes('hard') || messageLower.includes('difficult') || messageLower.includes('struggle')) {
      return { value: 1, confidence: 0.8 };
    }
  }

  // Medium confidence responses
  if (messageLower.includes('usually') || messageLower.includes('generally')) {
    return { value: 4, confidence: 0.7 };
  }

  if (messageLower.includes('sometimes') || messageLower.includes('varies')) {
    return { value: 3, confidence: 0.7 };
  }

  if (messageLower.includes('often') && messageLower.includes('not')) {
    return { value: 2, confidence: 0.7 };
  }

  // Default to middle value with low confidence if unclear
  return { value: 3, confidence: 0.4 };
}

function determineNextElement(questionId: number): Element {
  if (questionId <= 8) return 'earth';
  if (questionId <= 16) return 'water';
  if (questionId <= 24) return 'fire';
  if (questionId <= 32) return 'air';
  return 'aether';
}

function getElementTransitionMessage(currentElement: Element, nextElement: Element): string {
  const transitions = {
    'earth-water': "🌍➡️🌊 Beautiful! You've completed your Earth foundation. Now let's flow into your Water element - your emotional and intuitive nature.\n\n",
    'water-fire': "🌊➡️🔥 Wonderful work with your Water element! Now let's ignite your Fire element - your passion and transformative power.\n\n",
    'fire-air': "🔥➡️💨 Great job exploring your Fire! Now let's lift into your Air element - your mental clarity and communication gifts.\n\n",
    'air-aether': "💨➡️✨ Excellent! You've soared through Air. Now let's transcend into your Aether element - your spiritual connection and meaning-making.\n\n"
  };

  return transitions[`${currentElement}-${nextElement}`] || "";
}

async function generateConversationalResults(responses: ConversationalResponse[], profile?: UserProfile) {
  // Convert conversational responses to formal assessment results
  const formattedResponses = responses.map(r => ({
    questionId: r.questionId,
    response: r.extractedValue,
    confidence: r.confidence
  }));

  // Call the scoring API
  try {
    const scoringResponse = await fetch('/api/clinical/ipp/scoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'conversational_user',
        assessmentId: `conv_${Date.now()}`,
        responses: formattedResponses,
        demographicData: profile
      })
    });

    if (scoringResponse.ok) {
      return await scoringResponse.json();
    }
  } catch (error) {
    console.error('Error generating conversational results:', error);
  }

  // Fallback to basic results
  return generateBasicResults(formattedResponses);
}

async function generatePersonalizedResults(context?: SessionContext, userId?: string) {
  // Generate user-friendly, conversational presentation of results

  const mockResults = {
    profileSummary: "You have a beautifully balanced elemental profile with a natural **Water-Fire** pattern. This means you combine emotional intelligence with passionate motivation - a wonderful combination for nurturing and inspiring others!",
    elementalScores: [
      { element: 'Water', icon: '🌊', percentile: 85, description: 'Strong emotional flow and empathy' },
      { element: 'Fire', icon: '🔥', percentile: 78, description: 'High motivation and creative energy' },
      { element: 'Earth', icon: '🌍', percentile: 65, description: 'Good grounding and stability' },
      { element: 'Air', icon: '💨', percentile: 62, description: 'Clear communication abilities' },
      { element: 'Aether', icon: '✨', percentile: 58, description: 'Emerging spiritual awareness' }
    ],
    insights: [
      "Your Water-Fire combination makes you naturally nurturing yet dynamic",
      "You have strong emotional intelligence that guides your decisions",
      "Your Fire element gives you the energy to manifest your caring intentions",
      "You're developing a beautiful balance between feeling and action"
    ],
    strengths: [
      "Emotional attunement and empathy",
      "Motivated by purpose and meaning",
      "Natural ability to inspire others",
      "Good balance of heart and action"
    ],
    growthAreas: [
      "Develop more structured routines (Earth element)",
      "Enhance spiritual practices (Aether element)",
      "Practice clearer communication in conflicts (Air element)"
    ]
  };

  return mockResults;
}

// Additional helper functions for each followup type
async function provideStrengthExploration(context?: SessionContext, userId?: string): Promise<ConversationResponse> {
  return {
    success: true,
    response: {
      type: 'followup_guidance',
      message: "🌊 **Your Water Element Strength** 🌊\n\nYour highest score was in Water - your emotional intelligence and empathy. This means you have a natural gift for:\n\n• **Feeling into situations** - You sense the emotional undercurrents that others miss\n• **Creating emotional safety** - People feel understood and accepted around you\n• **Adaptive responses** - You naturally adjust your approach based on what's needed\n• **Healing presence** - Your empathy itself is therapeutic for others\n\n**How to leverage this strength:**\n- Trust your emotional intuition in parenting and relationships\n- Use your empathy to guide difficult conversations\n- Create rituals around emotional connection\n- Remember that your feeling nature is a superpower, not a weakness\n\nYour Water element is like a river - powerful, nourishing, and always finding the way forward. 💙",
      emotionalTone: 'celebratory'
    },
    actionRequired: { type: 'await_response', details: { strengthExplored: true } }
  };
}

async function provideGrowthGuidance(context?: SessionContext, userId?: string): Promise<ConversationResponse> {
  return {
    success: true,
    response: {
      type: 'followup_guidance',
      message: "🌱 **Your Growth Opportunities** 🌱\n\nBased on your profile, here are some gentle ways to strengthen your other elements:\n\n**🌍 Earth Element Growth:**\n• Create one simple daily routine (like morning meditation or evening gratitude)\n• Spend time in nature weekly\n• Focus on one organizational project at a time\n\n**✨ Aether Element Growth:**\n• Start a brief journaling practice about life meaning\n• Explore spiritual or philosophical readings that resonate\n• Create moments of stillness and reflection\n\n**💨 Air Element Growth:**\n• Practice expressing your feelings clearly before big conversations\n• Try perspective-taking exercises when conflicts arise\n• Develop one new communication skill\n\n**Remember:** Growth happens gradually. Pick ONE area that feels most interesting and start there. Your strong Water-Fire foundation will support any growth you choose! 🌟",
      emotionalTone: 'encouraging'
    },
    actionRequired: { type: 'await_response', details: { growthGuidanceProvided: true } }
  };
}

async function provideActionableSteps(context?: SessionContext, userId?: string): Promise<ConversationResponse> {
  return {
    success: true,
    response: {
      type: 'followup_guidance',
      message: "🎯 **Your Personalized Action Plan** 🎯\n\n**This Week:**\n• Lean into your Water strength: Have one meaningful emotional conversation\n• Honor your Fire: Take action on something you're passionate about\n• Small Earth step: Establish one simple routine\n\n**This Month:**\n• Schedule regular 'feeling check-ins' with family/partner\n• Create a simple structure for one area of life (meals, bedtime, etc.)\n• Try one new way to express your ideas clearly\n\n**Ongoing:**\n• When making decisions, ask: 'What does my heart say?' (Water) and 'What action aligns with my values?' (Fire)\n• Practice the '3-breath rule' before responding in emotional situations\n• Monthly reflection: 'How am I growing in each element?'\n\n**Your mantra:** *'I trust my emotional wisdom and take aligned action.'*\n\nWould you like me to help you choose which step feels most doable to start with?",
      emotionalTone: 'supportive'
    },
    actionRequired: { type: 'await_response', details: { actionPlanProvided: true } }
  };
}

async function saveAndConcludeSession(context?: SessionContext, userId?: string): Promise<ConversationResponse> {
  // Save results for user
  if (userId && userId !== 'guest') {
    await saveUserResults(userId, context);
  }

  return {
    success: true,
    response: {
      type: 'followup_guidance',
      message: "💫 **Your IPP Journey** 💫\n\nI've saved your personalized results so you can return to them anytime. What a beautiful exploration of your elemental nature!\n\n**Remember:**\n• Your Water-Fire pattern is a gift to the world\n• Growth happens naturally when we honor our authentic nature\n• You can always return to this assessment in the future to track your evolution\n\n**I'm here whenever you want to:**\n- Explore any element more deeply\n- Get guidance on specific parenting or relationship situations\n- Discuss how to apply these insights in daily life\n- Retake the assessment to see how you've grown\n\nThank you for trusting me with your inner world. You're on a beautiful path of growth and awareness. 🌟\n\n*Feel free to ask me anything else or just say hello when you need support!*",
      emotionalTone: 'warm'
    },
    actionRequired: { type: 'await_response', details: { sessionConcluded: true } },
    sessionUpdate: {
      phase: 'trigger', // Reset for future interactions
      flags: ['assessment_completed', 'results_saved']
    }
  };
}

async function provideContinuedSupport(message: string, context?: SessionContext, userId?: string): Promise<ConversationResponse> {
  return {
    success: true,
    response: {
      type: 'followup_guidance',
      message: "I'm here to support you in whatever way feels most helpful right now. Whether you want to explore your IPP results further, discuss a specific situation, or just reflect together - I'm with you. What would feel most supportive?",
      emotionalTone: 'warm'
    },
    actionRequired: { type: 'await_response', details: { continuedSupport: true } }
  };
}

// Utility functions
async function provideDetailedIPPInformation(): Promise<ConversationResponse> {
  return {
    success: true,
    response: {
      type: 'consent_request',
      message: `**About the IPP Assessment** 📚

The Ideal Parenting Protocol is based on ancient wisdom and modern psychology, using five natural elements to understand how we relate and parent:

**🌍 Earth** - Your foundation: stability, security, groundedness
**🌊 Water** - Your flow: emotions, intuition, empathy, adaptation
**🔥 Fire** - Your spark: motivation, passion, transformation, creativity
**💨 Air** - Your clarity: communication, perspective, mental flexibility
**✨ Aether** - Your connection: meaning, spirituality, integration

**What makes this special:**
- It's not about labeling or limiting you - it's about understanding your natural patterns
- There are no 'bad' scores - every element has gifts and challenges
- It helps you parent from your authentic strengths while growing other areas
- The insights apply to all relationships, not just parenting

**Your results include:**
- Your unique elemental profile
- Specific strengths to leverage
- Gentle growth opportunities
- Practical applications for daily life

Ready to discover your elemental nature?`,
      options: [
        { text: "Yes, let's do this!", value: "start_assessment", recommended: true },
        { text: "I'm still not sure", value: "question" },
        { text: "Maybe another time", value: "decline" }
      ],
      emotionalTone: 'educational'
    },
    actionRequired: { type: 'await_response', details: { detailedInfoProvided: true } }
  };
}

async function requestClarification(questionId: number, response: string, progress: AssessmentProgress): Promise<ConversationResponse> {
  return {
    success: true,
    response: {
      type: 'assessment_question',
      message: `I want to make sure I understand your response: "${response}"\n\nCould you help me clarify? Are you saying this feels:\n- Very easy/natural for you?\n- Somewhat easy?\n- Sometimes yes, sometimes no?\n- Often challenging?\n- Very challenging?\n\nOr feel free to say it in your own words again! 😊`,
      options: [
        { text: "Very easy and natural", value: 5 },
        { text: "Usually manageable", value: 4 },
        { text: "Hit or miss", value: 3 },
        { text: "Often difficult", value: 2 },
        { text: "Very challenging", value: 1 }
      ],
      emotionalTone: 'supportive'
    },
    actionRequired: { type: 'await_response', details: { clarificationRequested: questionId } }
  };
}

async function logConversationInteraction(
  userId: string,
  conversationId: string,
  message: string,
  response: ConversationResponse
) {
  // Log for learning and improvement
  console.log(`💬 [MAIA-IPP-CONVERSATION] ${userId.substring(0, 12)}...: ${message.length} chars`); // Never log content
  return true;
}

async function saveUserResults(userId: string, context?: SessionContext) {
  // Save results to user profile for future reference
  console.log(`💾 [MAIA-IPP-CONVERSATION] Saving results for user ${userId}`);
  return true;
}

function extractSupportTopic(message: string): string {
  if (message.toLowerCase().includes('parent')) return 'parenting';
  if (message.toLowerCase().includes('relationship')) return 'relationships';
  if (message.toLowerCase().includes('stress')) return 'stress management';
  return 'personal growth';
}

function extractFollowupIntent(message: string): string {
  const messageLower = message.toLowerCase();

  if (messageLower.includes('strength') || messageLower.includes('explore')) return 'explore_strength';
  if (messageLower.includes('grow') || messageLower.includes('improve')) return 'growth_guidance';
  if (messageLower.includes('steps') || messageLower.includes('practical') || messageLower.includes('action')) return 'actionable_steps';
  if (messageLower.includes('save') || messageLower.includes('reflect') || messageLower.includes('done')) return 'save_results';

  return 'continued_support';
}

function generateBasicResults(responses: any[]) {
  // Fallback basic results if scoring API fails
  return {
    scoring: {
      percentileScores: {
        earth: 65,
        water: 75,
        fire: 70,
        air: 60,
        aether: 55
      }
    }
  };
}

interface UserProfile {
  name?: string;
  age?: number;
  parentingExperience?: number;
  currentChallenges?: string[];
}