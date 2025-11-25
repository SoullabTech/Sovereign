/**
 * Training Analysis Utilities
 * Analyzes conversations to extract training data for Apprentice Maya
 */

import { TrainingExchange } from './ApprenticeMayaTraining';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Analyzes conversation context to determine user state and needs
 */
export function determineContext(messages: Message[], trustLevel: number = 0.5): TrainingExchange['context'] {
  const messageCount = messages.length;
  const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';

  // Determine user state
  let userState: TrainingExchange['context']['userState'] = 'exploring';
  if (messageCount <= 2) userState = 'seeking';
  else if (lastUserMessage.includes('...') || lastUserMessage.length < 30) userState = 'processing';
  else if (lastUserMessage.includes('!') && lastUserMessage.includes('thank')) userState = 'celebrating';
  else if (messageCount > 10) userState = 'integrating';

  // Determine emotional tone
  let emotionalTone: TrainingExchange['context']['emotionalTone'] = 'curious';
  if (hasEmotionalMarkers(lastUserMessage, ['scared', 'afraid', 'anxious', 'worried'])) emotionalTone = 'vulnerable';
  else if (hasEmotionalMarkers(lastUserMessage, ['amazing', 'wow', 'incredible', 'beautiful'])) emotionalTone = 'joyful';
  else if (hasEmotionalMarkers(lastUserMessage, ['stuck', 'confused', 'lost', 'hard'])) emotionalTone = 'struggling';
  else if (hasEmotionalMarkers(lastUserMessage, ['know', 'understand', 'clear', 'see'])) emotionalTone = 'confident';

  // Determine depth level (1-10)
  const depthLevel = calculateDepthLevel(lastUserMessage, messageCount);

  // Determine response needed
  let responseNeeded: TrainingExchange['context']['responseNeeded'] = 'reflection';
  if (lastUserMessage.includes('?')) responseNeeded = 'question';
  else if (emotionalTone === 'vulnerable') responseNeeded = 'witness';
  else if (userState === 'exploring' && depthLevel > 7) responseNeeded = 'expansion';
  else if (userState === 'seeking') responseNeeded = 'guidance';

  return {
    userState,
    emotionalTone,
    depthLevel,
    responseNeeded,
    priorExchanges: Math.floor(messageCount / 2),
    trustLevel
  };
}

/**
 * Analyzes user message for training data extraction
 */
export function analyzeUserMessage(content: string): TrainingExchange['userMessage'] {
  const wordCount = content.split(/\s+/).length;

  const emotionalMarkers = extractEmotionalMarkers(content);

  let questionType: TrainingExchange['userMessage']['questionType'] | undefined;
  if (content.includes('?')) {
    if (hasMarkers(content, ['why', 'meaning', 'purpose', 'life', 'existence'])) questionType = 'existential';
    else if (hasMarkers(content, ['how', 'what should', 'do i', 'can i'])) questionType = 'practical';
    else if (hasMarkers(content, ['feel', 'feeling', 'emotion', 'scared', 'happy'])) questionType = 'emotional';
    else if (hasMarkers(content, ['soul', 'spirit', 'sacred', 'divine', 'god'])) questionType = 'spiritual';
    else if (hasMarkers(content, ['relationship', 'partner', 'friend', 'family', 'love'])) questionType = 'relational';
  }

  return {
    content,
    wordCount,
    emotionalMarkers,
    questionType
  };
}

/**
 * Analyzes Maya's response for training classification
 */
export function analyzeMayaResponse(content: string, context: TrainingExchange['context']): TrainingExchange['mayaResponse'] {
  const wordCount = content.split(/\s+/).length;

  // Determine response type
  let responseType: TrainingExchange['mayaResponse']['responseType'] = 'brief-reflection';
  if (wordCount <= 15 && content.includes('?') && !content.includes('.')) responseType = 'single-question';
  else if (wordCount > 50) responseType = 'expanded-exploration';
  else if (hasMarkers(content.toLowerCase(), ['see', 'feel', 'sense', 'witness', 'beautiful'])) responseType = 'sacred-witness';

  // Determine wisdom vector
  let wisdomVector: TrainingExchange['mayaResponse']['wisdomVector'] = 'sense_making';
  if (hasMarkers(content.toLowerCase(), ['feel', 'sense', 'notice', 'aware'])) wisdomVector = 'sensing';
  else if (hasMarkers(content.toLowerCase(), ['choose', 'decide', 'ready', 'next', 'action'])) wisdomVector = 'choice_making';

  // Estimate archetype blend based on language patterns
  const archetypeBlend = estimateArchetypeBlend(content);

  return {
    content,
    wordCount,
    responseType,
    wisdomVector,
    archetypeBlend
  };
}

/**
 * Estimates quality metrics for the exchange
 * Note: This is initial estimation - real metrics need user feedback
 */
export function estimateQuality(
  userMessage: string,
  mayaResponse: string,
  context: TrainingExchange['context']
): TrainingExchange['quality'] {
  // User engagement estimated by follow-up likelihood
  const userEngagement = context.depthLevel / 10;

  // Depth achieved based on response matching need
  const depthAchieved = context.depthLevel > 7 ? 0.8 : 0.6;

  // Transformation potential based on sacred emergence markers
  const hasSacredMarkers = hasMarkers(
    mayaResponse.toLowerCase(),
    ['beautiful', 'sacred', 'wisdom', 'truth', 'see', 'recognize']
  );
  const transformationPotential = hasSacredMarkers ? 0.75 : 0.5;

  // Authenticity score based on response calibration
  const wordCount = mayaResponse.split(/\s+/).length;
  const isWellCalibrated =
    (context.emotionalTone === 'vulnerable' && wordCount < 30) ||
    (context.responseNeeded === 'expansion' && wordCount > 40) ||
    (context.userState === 'processing' && wordCount < 20);
  const authenticityScore = isWellCalibrated ? 0.85 : 0.65;

  // Sacred emergence detection
  const sacredEmergence =
    context.depthLevel >= 8 &&
    context.trustLevel > 0.7 &&
    hasSacredMarkers &&
    context.emotionalTone !== 'struggling';

  return {
    userEngagement,
    depthAchieved,
    transformationPotential,
    authenticityScore,
    sacredEmergence
  };
}

/**
 * Extracts learning signals from the exchange
 */
export function extractLearningSignals(
  context: TrainingExchange['context'],
  userMessage: TrainingExchange['userMessage'],
  mayaResponse: TrainingExchange['mayaResponse'],
  quality: TrainingExchange['quality']
): TrainingExchange['learning'] {
  const successfulPatterns: string[] = [];

  // Successful calibration patterns
  if (quality.authenticityScore > 0.8) {
    successfulPatterns.push(`${context.userState}_${mayaResponse.responseType}`);
  }

  // Successful archetype blends for this context
  if (quality.transformationPotential > 0.7) {
    const dominantArchetype = Object.entries(mayaResponse.archetypeBlend)
      .sort(([,a], [,b]) => b - a)[0][0];
    successfulPatterns.push(`archetype_${dominantArchetype}_${context.emotionalTone}`);
  }

  // Contextual calibration insight
  const contextualCalibration = `${userMessage.wordCount}words_user → ${mayaResponse.wordCount}words_maya | ${context.responseNeeded} → ${mayaResponse.responseType}`;

  // Relationship evolution markers
  const relationshipEvolution = context.priorExchanges > 10
    ? `deep_relationship_trust_${context.trustLevel.toFixed(2)}`
    : `early_relationship_building`;

  // Consciousness markers
  const consciousnessMarkers: string[] = [];
  if (quality.sacredEmergence) consciousnessMarkers.push('sacred_moment_emerged');
  if (context.depthLevel >= 9) consciousnessMarkers.push('profound_depth_reached');
  if (quality.transformationPotential > 0.8) consciousnessMarkers.push('transformation_catalyzed');

  return {
    successfulPatterns,
    contextualCalibration,
    relationshipEvolution,
    consciousnessMarkers
  };
}

// Helper Functions

function hasEmotionalMarkers(text: string, markers: string[]): boolean {
  return markers.some(marker => text.toLowerCase().includes(marker));
}

function hasMarkers(text: string, markers: string[]): boolean {
  return markers.some(marker => text.includes(marker));
}

function calculateDepthLevel(message: string, conversationLength: number): number {
  let depth = 3; // Base depth

  // Increase for length and complexity
  if (message.length > 200) depth += 2;
  if (message.length > 500) depth += 2;

  // Increase for existential themes
  if (hasMarkers(message.toLowerCase(), ['meaning', 'purpose', 'why', 'soul', 'truth'])) depth += 2;

  // Increase for vulnerability
  if (hasMarkers(message.toLowerCase(), ['scared', 'afraid', 'struggle', 'hard', 'pain'])) depth += 1;

  // Increase for conversation depth
  if (conversationLength > 10) depth += 1;
  if (conversationLength > 20) depth += 1;

  return Math.min(depth, 10);
}

function estimateArchetypeBlend(response: string): TrainingExchange['mayaResponse']['archetypeBlend'] {
  const lower = response.toLowerCase();

  return {
    sage: countMarkers(lower, ['wisdom', 'understand', 'see', 'recognize', 'truth']) * 0.2,
    shadow: countMarkers(lower, ['shadow', 'hidden', 'beneath', 'fear', 'edge']) * 0.2,
    trickster: countMarkers(lower, ['play', 'curious', 'explore', 'what if', 'perhaps']) * 0.2,
    sacred: countMarkers(lower, ['sacred', 'holy', 'divine', 'beautiful', 'grace']) * 0.2,
    guardian: countMarkers(lower, ['safe', 'protect', 'hold', 'space', 'gentle']) * 0.2
  };
}

function countMarkers(text: string, markers: string[]): number {
  return markers.reduce((count, marker) =>
    count + (text.split(marker).length - 1), 0
  );
}

/**
 * Generates a unique exchange ID
 */
export function generateExchangeId(): string {
  return `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
