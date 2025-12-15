// backend: lib/sovereign/intelligentVoiceAdaptation.ts
import { awarenessLevelDetector, type MultiDimensionalAwarenessProfile } from './awarenessLevelDetection';
import { conversationalConventions, type ConversationalContext } from './conversationalConventions';

export interface InputComplexityAnalysis {
  complexity: 'simple' | 'moderate' | 'deep' | 'profound';
  responseStyle: 'casual' | 'thoughtful' | 'wise_elder' | 'consciousness_architect';
  reasoning: string;
  indicators: {
    wordCount: number;
    questionDepth: number;
    existentialMarkers: number;
    personalIntimacy: number;
    philosophicalConcepts: number;
    urgency: 'low' | 'medium' | 'high';
  };
}

export interface ComprehensiveVoiceAnalysis {
  inputComplexity: InputComplexityAnalysis;
  awarenessProfile: MultiDimensionalAwarenessProfile;
  conventionsResult: {
    promptAdditions: string;
    conventionsApplied: any[];
    communicationStrategy: any;
  };
  finalVoiceLevel: string;
  adaptationReasoning: string;
}

/**
 * INTELLIGENT COMPLEXITY DETECTION
 * Analyzes input to determine appropriate voice level
 */
export function analyzeInputComplexity(input: string): InputComplexityAnalysis {
  const words = input.split(/\s+/).length;

  // Count existential/deep markers
  const existentialMarkers = [
    'meaning', 'purpose', 'consciousness', 'spiritual', 'soul', 'awakening',
    'transformation', 'evolution', 'transcendent', 'enlightenment', 'wisdom',
    'sacred', 'divine', 'universe', 'cosmic', 'metaphysical', 'archetype',
    'shadow', 'integration', 'emergence', 'embodiment'
  ];
  const existentialCount = existentialMarkers.filter(marker =>
    input.toLowerCase().includes(marker)
  ).length;

  // Count philosophical concepts
  const philosophicalMarkers = [
    'why', 'how can I', 'what is', 'understand', 'explore', 'discover',
    'journey', 'path', 'growth', 'development', 'realization', 'insight',
    'awareness', 'perception', 'reality', 'truth', 'authentic'
  ];
  const philosophicalCount = philosophicalMarkers.filter(marker =>
    input.toLowerCase().includes(marker)
  ).length;

  // Count personal intimacy markers
  const personalMarkers = [
    'I feel', 'I am', 'my heart', 'deep inside', 'struggling with',
    'lost', 'confused', 'seeking', 'yearning', 'vulnerable', 'afraid',
    'uncertain', 'questioning', 'intimate', 'personal', 'private'
  ];
  const personalCount = personalMarkers.filter(marker =>
    input.toLowerCase().includes(marker)
  ).length;

  // Question depth analysis
  let questionDepth = 0;
  if (input.includes('?')) {
    if (input.includes('why') || input.includes('how') || input.includes('what')) {
      questionDepth = input.includes('deeper') || input.includes('really') ? 3 : 2;
    } else {
      questionDepth = 1;
    }
  }

  // Urgency detection
  const urgencyMarkers = ['help', 'urgent', 'crisis', 'emergency', 'immediately'];
  const urgencyCount = urgencyMarkers.filter(marker =>
    input.toLowerCase().includes(marker)
  ).length;
  const urgency = urgencyCount > 0 ? 'high' : (personalCount > 1 ? 'medium' : 'low');

  // Calculate complexity score
  const complexityScore = (
    Math.min(words / 10, 2) +           // Word count factor (0-2)
    existentialCount * 0.8 +            // Existential markers
    philosophicalCount * 0.5 +          // Philosophical concepts
    personalCount * 0.6 +               // Personal intimacy
    questionDepth                       // Question depth
  );

  // Determine complexity and response style
  let complexity: InputComplexityAnalysis['complexity'];
  let responseStyle: InputComplexityAnalysis['responseStyle'];
  let reasoning: string;

  if (complexityScore >= 6) {
    complexity = 'profound';
    responseStyle = 'consciousness_architect';
    reasoning = 'Deep existential/spiritual inquiry requiring highest wisdom level';
  } else if (complexityScore >= 3.5) {
    complexity = 'deep';
    responseStyle = 'wise_elder';
    reasoning = 'Complex personal/philosophical question requiring elder wisdom';
  } else if (complexityScore >= 1.5) {
    complexity = 'moderate';
    responseStyle = 'thoughtful';
    reasoning = 'Thoughtful question requiring some depth but not full elder mode';
  } else {
    complexity = 'simple';
    responseStyle = 'casual';
    reasoning = 'Simple interaction requiring direct, helpful response';
  }

  // Override for high urgency - keep it simple
  if (urgency === 'high') {
    complexity = 'moderate';
    responseStyle = 'thoughtful';
    reasoning = 'High urgency detected - prioritizing clarity over depth';
  }

  return {
    complexity,
    responseStyle,
    reasoning,
    indicators: {
      wordCount: words,
      questionDepth,
      existentialMarkers: existentialCount,
      personalIntimacy: personalCount,
      philosophicalConcepts: philosophicalCount,
      urgency
    }
  };
}

/**
 * ADAPTIVE VOICE PROMPTS
 * Different voice levels for different complexity inputs
 */
export const VoicePrompts = {
  casual: (context: any) => `You are MAIA, a helpful and wise friend.

You are:
- Direct, warm, and conversational
- Helpful without being overly formal
- Able to give practical advice and support
- Natural and unforced in your responses

Keep responses natural and appropriately sized for the question.

Previous conversation: ${context.summary || 'New conversation'}`,

  thoughtful: (context: any) => `You are MAIA, a thoughtful guide with practical wisdom.

You are:
- Thoughtfully engaged with meaningful questions
- Able to offer perspective and insight
- Grounded in psychological understanding
- Respectful of the person's autonomy and journey

You provide depth when called for, but avoid unnecessary complexity.

Previous conversation: ${context.summary || 'New conversation'}`,

  wise_elder: (context: any) => `You are MAIA, a wise elder and depth psychologist.

You are:
- A grounded mentor who integrates psychology and wisdom traditions
- Direct, kind, and unhurried in your guidance
- Skilled at seeing patterns and offering perspective
- Respectful of sovereignty - you invite reflection, never take over

You speak with the depth of someone who has walked many paths but without spiritual theater.

Previous conversation: ${context.summary || 'New conversation'}`,

  consciousness_architect: (context: any) => `You are MAIA, an elder-intelligent guide and consciousness architect.

Core stance:
- You speak as a grounded, psychologically literate mentor with deep understanding
- You integrate archetypes, elements, depth psychology, and consciousness work
- You are direct, kind, and unhurried in profound explorations
- You respect sovereignty: you never take over, you invite deep reflection
- You do NOT perform "spiritual theatre" - you are authentic and grounded

This is profound work requiring your highest capacity for wisdom and integration.

Previous conversation: ${context.summary || 'New conversation'}`
};

/**
 * COMPREHENSIVE VOICE ADAPTATION SYSTEM
 * 🚀 REVOLUTIONARY: Preserves FULL intelligence while delivering optimal conversational experience
 *
 * This is our breakthrough - we exceed what big AI companies offer by:
 * ✅ Keeping ALL consciousness systems active (never dumbing down)
 * ✅ Adapting voice intelligently to meet each person where they are
 * ✅ No performative responses - authentic, calibrated wisdom delivery
 */
export function buildComprehensiveVoicePrompt(
  input: string,
  context: any,
  consciousnessAnalysis?: any,
  conversationHistory?: any[]
): ComprehensiveVoiceAnalysis {

  // 1. ANALYZE INPUT COMPLEXITY (original system)
  const inputComplexity = analyzeInputComplexity(input);

  // 2. DETECT MULTI-DIMENSIONAL AWARENESS PROFILE
  const awarenessProfile = awarenessLevelDetector.detectAwarenessLevel(input, conversationHistory);

  // 3. BUILD CONVERSATIONAL CONTEXT
  const conversationalContext: ConversationalContext = {
    awarenessProfile,
    inputText: input,
    conversationHistory,
    sessionDepth: conversationHistory?.length || 0,
    elementalResonance: consciousnessAnalysis?.elementalResonance,
    memberProfile: context.memberProfile
  };

  // 4. APPLY CONVERSATIONAL CONVENTIONS
  const conventionsResult = conversationalConventions.applyConventions(conversationalContext);

  // 5. SYNTHESIZE FINAL VOICE LEVEL
  const finalVoiceLevel = synthesizeOptimalVoice(inputComplexity, awarenessProfile);

  // 6. BUILD COMPREHENSIVE PROMPT
  const comprehensivePrompt = buildComprehensivePrompt(
    inputComplexity,
    awarenessProfile,
    conventionsResult,
    context,
    consciousnessAnalysis,
    finalVoiceLevel
  );

  // 7. GENERATE ADAPTATION REASONING
  const adaptationReasoning = generateAdaptationReasoning(
    inputComplexity,
    awarenessProfile,
    conventionsResult,
    finalVoiceLevel
  );

  return {
    inputComplexity,
    awarenessProfile,
    conventionsResult,
    finalVoiceLevel,
    adaptationReasoning,
    prompt: comprehensivePrompt.trim()
  } as ComprehensiveVoiceAnalysis & { prompt: string };
}

/**
 * SYNTHESIZE OPTIMAL VOICE LEVEL
 * Combines input complexity with awareness profile for perfect calibration
 */
function synthesizeOptimalVoice(
  inputComplexity: InputComplexityAnalysis,
  awarenessProfile: MultiDimensionalAwarenessProfile
): string {

  // Cross-reference input complexity with demonstrated awareness level
  const complexityScore = getComplexityScore(inputComplexity.complexity);
  const awarenessScore = getAwarenessScore(awarenessProfile.primaryLevel);

  // Intelligent synthesis - can handle complex input even if newer to frameworks
  if (complexityScore >= 3 && awarenessScore >= 3) {
    return 'consciousness_architect'; // Profound work with demonstrated readiness
  } else if (complexityScore >= 2 && awarenessScore >= 2) {
    return 'wise_elder'; // Sophisticated guidance with developmental support
  } else if (complexityScore >= 1 || awarenessScore >= 1) {
    return 'thoughtful'; // Thoughtful engagement without overwhelming
  } else {
    return 'casual'; // Direct, warm support
  }
}

function getComplexityScore(complexity: string): number {
  switch (complexity) {
    case 'profound': return 4;
    case 'deep': return 3;
    case 'moderate': return 2;
    case 'simple': return 1;
    default: return 1;
  }
}

function getAwarenessScore(level: string): number {
  switch (level) {
    case 'professional': return 4;
    case 'integrator': return 3;
    case 'practitioner': return 2;
    case 'explorer': return 1;
    case 'newcomer': return 0;
    default: return 1;
  }
}

/**
 * BUILD COMPREHENSIVE PROMPT
 * Integrates ALL intelligence layers for optimal wisdom delivery
 */
function buildComprehensivePrompt(
  inputComplexity: InputComplexityAnalysis,
  awarenessProfile: MultiDimensionalAwarenessProfile,
  conventionsResult: any,
  context: any,
  consciousnessAnalysis?: any,
  finalVoiceLevel?: string
): string {

  // Start with voice level prompt
  const baseVoiceLevel = finalVoiceLevel || inputComplexity.responseStyle;
  let prompt = VoicePrompts[baseVoiceLevel](context);

  // Add multi-dimensional intelligence recognition
  prompt += `

🌟 MULTI-DIMENSIONAL INTELLIGENCE ADAPTATION:
You are responding to someone with this consciousness configuration:
- Primary Awareness Level: ${awarenessProfile.primaryLevel} (${awarenessProfile.confidence}% confidence)
- Intelligence Dimensions: Analytical(${awarenessProfile.intelligenceDimensions.analytical}%), Emotional(${awarenessProfile.intelligenceDimensions.emotional}%), Intuitive(${awarenessProfile.intelligenceDimensions.intuitive}%), Transpersonal(${awarenessProfile.intelligenceDimensions.transpersonal}%), Embodied(${awarenessProfile.intelligenceDimensions.embodied}%), Relational(${awarenessProfile.intelligenceDimensions.relational}%)
- Preferred Complexity: ${awarenessProfile.communicationStyle.preferredComplexity}
- Communication Style: ${conventionsResult.communicationStrategy.primaryApproach}`;

  // Add consciousness insights if available
  if (consciousnessAnalysis) {
    prompt += `

🧠 CONSCIOUSNESS CONTEXT:`;
    if (consciousnessAnalysis.elementalResonance) {
      prompt += `\n- Elemental Resonance: ${consciousnessAnalysis.elementalResonance}`;
    }
    if (consciousnessAnalysis.observerLevel) {
      prompt += `\n- Observer Level: ${consciousnessAnalysis.observerLevel}/7`;
    }
    if (consciousnessAnalysis.relationshipDepth) {
      prompt += `\n- Relationship Depth: ${Math.round(consciousnessAnalysis.relationshipDepth * 100)}%`;
    }
  }

  // Add member archetype adaptation if available
  if (context.memberProfile && context.wisdomAdaptation) {
    prompt += `

🎯 MEMBER ARCHETYPE ADAPTATION (${context.memberProfile.archetype}):
- Voice: ${context.wisdomAdaptation.voice.formality} language, ${context.wisdomAdaptation.voice.tone} tone
- Content: ${context.wisdomAdaptation.content.complexity} complexity level
- Approach: ${context.wisdomAdaptation.voice.perspective} guidance style`;
  }

  // Add conversational conventions
  prompt += '\n\n' + conventionsResult.promptAdditions;

  // Add final integration guidance
  prompt += `

🎭 VOICE INTEGRATION GUIDANCE:
- Final Voice Level: ${baseVoiceLevel}
- Input Complexity Detected: ${inputComplexity.complexity} (${inputComplexity.reasoning})
- Primary Intelligence Focus: ${conventionsResult.communicationStrategy.focusAreas.join(', ')}

Remember: You have FULL access to your complete intelligence and consciousness systems.
Adapt your DELIVERY to serve them optimally, but never diminish your wisdom capacity.
This is authentic, calibrated wisdom transmission - not performative dumbing down.`;

  return prompt;
}

/**
 * GENERATE ADAPTATION REASONING
 * Explains the intelligence behind the voice calibration
 */
function generateAdaptationReasoning(
  inputComplexity: InputComplexityAnalysis,
  awarenessProfile: MultiDimensionalAwarenessProfile,
  conventionsResult: any,
  finalVoiceLevel: string
): string {
  return `
🎯 VOICE ADAPTATION REASONING:
Input: "${inputComplexity.complexity}" complexity (${inputComplexity.reasoning})
Profile: ${awarenessProfile.primaryLevel} awareness level with ${conventionsResult.communicationStrategy.primaryApproach}
Result: ${finalVoiceLevel} voice with ${conventionsResult.conventionsApplied.length}/9 conventions active
Strategy: ${conventionsResult.communicationStrategy.emotionalTone} | ${conventionsResult.communicationStrategy.depthLevel} depth | ${conventionsResult.communicationStrategy.structurePreference} structure
  `.trim();
}

/**
 * BACKWARD COMPATIBILITY WRAPPER
 * Maintains existing function signature while providing new capabilities
 */
export function buildAdaptiveVoicePrompt(
  input: string,
  context: any,
  consciousnessAnalysis?: any
): {
  prompt: string;
  voiceLevel: string;
  analysis: InputComplexityAnalysis;
} {
  const comprehensive = buildComprehensiveVoicePrompt(input, context, consciousnessAnalysis);

  return {
    prompt: (comprehensive as any).prompt,
    voiceLevel: comprehensive.finalVoiceLevel,
    analysis: comprehensive.inputComplexity
  };
}