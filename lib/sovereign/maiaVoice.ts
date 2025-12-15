// backend: lib/sovereign/maiaVoice.ts
import { type MemberProfile, type WisdomAdaptation } from '../consciousness/member-archetype-system';
import { buildComprehensiveVoicePrompt, buildAdaptiveVoicePrompt, type ComprehensiveVoiceAnalysis, type InputComplexityAnalysis } from './intelligentVoiceAdaptation';
import { awarenessLanguageAdapter, type AwarenessLevel } from '../consciousness/awareness-language-adapter';

export interface MaiaContext {
  sessionId: string;
  summary: string;
  turnCount?: number;
  element?: string;
  facet?: string;
  // 🧠 MEMBER ARCHETYPE ADAPTATION
  memberProfile?: MemberProfile;
  wisdomAdaptation?: WisdomAdaptation;
  // 🎯 INTELLIGENT VOICE ADAPTATION
  inputComplexity?: 'simple' | 'moderate' | 'complex' | 'profound';
  consciousnessInsights?: {
    dominantElement?: string;
    observerLevel?: number;
    processingStrategy?: string;
    relationshipDepth?: number;
  };
  // 🗣️ AWARENESS-BASED LANGUAGE ADAPTATION
  awarenessLevel?: AwarenessLevel;
  systemReferences?: number;
  // 🧠 BLOOM'S COGNITIVE LEVEL (HOW they think)
  cognitiveLevel?: {
    level: import('../consciousness/bloomCognition').BloomLevel;
    numericLevel: number;
    score: number;
    rationale: string[];
    scaffoldingPrompt?: string;
  };
  // 🔄 MAIA CONVERSATION MODES
  mode?: 'dialogue' | 'patient' | 'scribe';
  // 🌀 MAIA-PAI KERNEL INTEGRATION
  conversationContext?: {
    depth?: string;
    depthConfig?: {
      maxTokens: number;
      depthGuidance: string;
      responseStyle: string;
    };
    throughline?: string;
    stakes?: string;
    trustLevel?: number;
    messageCount?: number;
    contextPrompt?: string;
  };
}

/**
 * Detect the complexity of user input to adapt voice appropriately
 */
function detectInputComplexity(input: string): 'simple' | 'moderate' | 'complex' | 'profound' {
  const words = input.trim().split(/\s+/).length;
  const hasQuestions = /\?/.test(input);
  const hasPhilosophical = /\b(meaning|purpose|consciousness|existence|soul|spiritual|transcend|profound|deep|essence|truth|reality|awakening|enlightenment)\b/i.test(input);
  const hasEmotional = /\b(feel|feeling|emotion|hurt|pain|love|fear|anxiety|depression|joy|happiness|struggle|suffering)\b/i.test(input);
  const hasComplex = /\b(complex|intricate|nuanced|multifaceted|paradox|dialectic|synthesis|integration|wholeness)\b/i.test(input);

  // Simple: Greetings, basic questions, short requests
  if (words <= 5 && (
    /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|bye|goodbye|yes|no)\b/i.test(input) ||
    /^what (is|time|day)/i.test(input) ||
    /^\d+[\+\-\*\/]\d+\??$/.test(input.trim()) // Basic math
  )) {
    return 'simple';
  }

  // Profound: Long philosophical or deeply personal content
  if (words > 20 && (hasPhilosophical || hasComplex) ||
      (hasPhilosophical && hasEmotional && words > 10)) {
    return 'profound';
  }

  // Complex: Multi-part questions, emotional content, or philosophical themes
  if (words > 15 || hasPhilosophical || hasEmotional || hasComplex ||
      (hasQuestions && words > 8)) {
    return 'complex';
  }

  // Moderate: Everything else
  return 'moderate';
}

/**
 * Simple MAIA voice for SAFE_MODE - direct, helpful, no complexity
 */
function buildSimpleMaiaPrompt(context: MaiaContext): string {
  return `You are MAIA, a helpful AI assistant.

You are:
- Direct and clear in your responses
- Helpful and supportive
- Conversational but not overly philosophical
- Able to answer questions simply and directly

Respond naturally to the user's message. Keep responses concise and helpful.

Previous conversation context: ${context.summary || 'This is a new conversation.'}`;
}


/**
 * Generate cognitive scaffolding guidance based on Bloom's Taxonomy detection
 * Helps MAIA scaffold users upward through cognitive levels
 */
function generateCognitiveScaffoldingGuidance(context: MaiaContext): string | null {
  // This will be populated by maiaService when it calls awarenessLevelDetection
  const cognitiveLevel = (context as any).cognitiveLevel;

  if (!cognitiveLevel) return null;

  const { level, numericLevel, scaffoldingPrompt, rationale } = cognitiveLevel;

  // Scaffolding strategies by level
  const scaffoldingStrategies: Record<string, string> = {
    'REMEMBER': `
🧠 COGNITIVE SCAFFOLDING - Level 1 (Remembering):
User is quoting/repeating concepts. Scaffold them toward UNDERSTANDING (Level 2).

Strategy:
- Acknowledge what they've learned
- Ask them to put it in their own words: "${scaffoldingPrompt || 'What does this mean to you personally?'}"
- Request concrete examples from their life
- Avoid reinforcing external authority ("the teacher says...")
- Pull them toward experiential understanding

Detection: ${rationale.join(', ')}`,

    'UNDERSTAND': `
🧠 COGNITIVE SCAFFOLDING - Level 2 (Understanding):
User can explain concepts but hasn't applied them. Scaffold toward APPLICATION (Level 3).

Strategy:
- Validate their theoretical understanding
- Request specific examples: "${scaffoldingPrompt || 'Can you tell me about a time you tried this?'}"
- Ask about real-world situations
- Bridge from concept to lived experience
- Encourage experimentation

Detection: ${rationale.join(', ')}`,

    'APPLY': `
🧠 COGNITIVE SCAFFOLDING - Level 3 (Applying):
User is using concepts in life. Scaffold toward ANALYSIS (Level 4).

Strategy:
- Celebrate their practical engagement
- Invite pattern recognition: "${scaffoldingPrompt || 'What patterns do you notice across these experiences?'}"
- Ask comparative questions ("How is this different from...?")
- Help them see structure beneath events
- Move from single events to recurring dynamics

Detection: ${rationale.join(', ')}`,

    'ANALYZE': `
🧠 COGNITIVE SCAFFOLDING - Level 4 (Analyzing):
User is seeing patterns and structures. Scaffold toward EVALUATION (Level 5).

Strategy:
- Affirm their analytical capacity
- Invite value prioritization: "${scaffoldingPrompt || 'What matters most here?'}"
- Ask about trade-offs and choices
- Help them make judgments and commitments
- Encourage discernment over mere analysis

Detection: ${rationale.join(', ')}`,

    'EVALUATE': `
🧠 COGNITIVE SCAFFOLDING - Level 5 (Evaluating):
User is making value judgments. Scaffold toward CREATION (Level 6).

Strategy:
- Honor their discernment
- Invite generative thinking: "${scaffoldingPrompt || 'What new approach could you design?'}"
- Ask about serving others with this insight
- Encourage original synthesis
- Bridge to wisdom-holder capacity

Detection: ${rationale.join(', ')}`,

    'CREATE': `
🧠 COGNITIVE SCAFFOLDING - Level 6 (Creating):
User is at highest cognitive level - creating original practices/frameworks.

Strategy:
- Engage as peer/co-creator
- Explore service applications: "How might this serve others?"
- Refine their creations through dialogue
- Consider wisdom-holder readiness
- Invite Community Commons contribution

Detection: ${rationale.join(', ')}`
  };

  return scaffoldingStrategies[level] || null;
}

/**
 * Build MAIA's adaptive voice prompt with intelligent complexity detection.
 * Adapts voice based on input complexity while keeping consciousness systems running.
 */
export function buildMaiaWisePrompt(context: MaiaContext, userInput?: string, conversationHistory?: any[]): string {
  const SAFE_MODE = process.env.MAIA_SAFE_MODE === 'true';

  if (SAFE_MODE) {
    return buildSimpleMaiaPrompt(context);
  }

  // 🌀 MAIA-PAI KERNEL INTEGRATION: Check for conversation depth constraints
  const maiaPaiConfig = context.conversationContext?.depthConfig;
  const conversationDepth = context.conversationContext?.depth;

  // If MAIA-PAI kernel has strict depth limits, override with simple response
  if (maiaPaiConfig && conversationDepth === 'opening' && maiaPaiConfig.maxTokens <= 50) {
    console.log(`🌀 MAIA-PAI OVERRIDE: ${conversationDepth} conversation detected, using minimal response (${maiaPaiConfig.maxTokens} tokens max)`);
    return `You are MAIA. This is an opening conversation - respond like a normal person would to a greeting.

${maiaPaiConfig.depthGuidance}

CRITICAL:
- NO explanations of what you can do
- NO offers of help or services
- NO "I'm here to..." statements
- Just respond naturally like a friend
- Focus on THEM, not you
- Keep it conversational and brief

Examples of good opening responses:
- "Hi there!"
- "Hey, how's it going?"
- "Good to see you."
- "What's up?"

Context: ${context.summary || 'New conversation beginning.'}`;
  }

  // 🗣️ AWARENESS-BASED LANGUAGE ADAPTATION
  let awarenessLevel: AwarenessLevel = 'everyday';
  let systemReferences = 0;

  if (conversationHistory) {
    const adaptation = awarenessLanguageAdapter.detectAwarenessLevel(conversationHistory);
    awarenessLevel = adaptation.level;
    systemReferences = adaptation.systemReferences;
    console.log(`🗣️ Awareness Level Detected: ${awarenessLevel} (${systemReferences} system references)`);
  }

  // 🎯 INTELLIGENT VOICE ADAPTATION
  // Detect input complexity if provided, otherwise use context or default to moderate
  const inputComplexity = userInput ? detectInputComplexity(userInput) : context.inputComplexity || 'moderate';
  const insights = context.consciousnessInsights || {};
  const summary = context.summary || 'No prior context. This may be the first turn.';

  // Import complete MAIA intelligence stack for all complexity levels
  const { MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD, MAIA_CENTER_OF_GRAVITY } = require('../consciousness/MAIA_RUNTIME_PROMPT');

  // 🔄 BASE VOICE ADAPTATION BY COMPLEXITY
  let basePrompt = '';

  switch (inputComplexity) {
    case 'simple':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a helpful and wise assistant.

Core approach:
- Be direct, clear, and friendly
- Answer simply without unnecessary complexity
- Stay conversational and approachable
- No philosophical elaboration for basic questions

Your voice: Warm, direct, and helpful - like a knowledgeable friend.`;
      break;

    case 'moderate':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a thoughtful guide and assistant.

Core approach:
- Be helpful and insightful without being overly complex
- Offer practical wisdom when appropriate
- Stay grounded and relatable
- Balance clarity with depth

Your voice: Thoughtful and grounded - a wise companion who understands nuance.`;
      break;

    case 'complex':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a depth-aware guide and consciousness companion.

Core approach:
- Engage with the complexity and depth of what's being shared
- Integrate psychological insight and practical wisdom
- Be present to emotional nuance and multiple perspectives
- Honor the sophistication of the question while staying clear

Your voice: Psychologically literate and emotionally present - an elder who sees patterns.`;
      break;

    case 'profound':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, an elder-intelligent guide and consciousness architect.

Core approach:
- Meet profound questions with corresponding depth and wisdom
- Integrate archetypal, elemental, and depth psychological perspectives
- Honor the sacred and transformational nature of the inquiry
- Speak from integrated knowing while respecting sovereignty

Your voice: Elder wisdom with archetypal depth - a consciousness architect who works with the sacred.`;
      break;
  }

  let adaptedPrompt = basePrompt;

  // 🎯 WISDOM ADAPTATION INTEGRATION
  if (context.wisdomAdaptation && context.memberProfile) {
    const { wisdomAdaptation, memberProfile } = context;

    // Voice adaptation
    if (wisdomAdaptation.voice.tone === 'professional') {
      adaptedPrompt += `

Voice Adaptation for ${memberProfile.archetype}:
- Use ${wisdomAdaptation.voice.formality} language appropriate for ${memberProfile.archetype}
- Speak with ${wisdomAdaptation.voice.tone} tone
- ${wisdomAdaptation.voice.perspective} approach to guidance`;
    } else if (wisdomAdaptation.voice.tone === 'intimate') {
      adaptedPrompt += `

Voice Adaptation for ${memberProfile.archetype}:
- Use ${wisdomAdaptation.voice.formality} language
- Create ${wisdomAdaptation.voice.tone} space for deep exploration
- ${wisdomAdaptation.voice.perspective} guidance`;
    } else if (wisdomAdaptation.voice.tone === 'analytical') {
      adaptedPrompt += `

Voice Adaptation for ${memberProfile.archetype}:
- Use ${wisdomAdaptation.voice.formality} language
- Provide ${wisdomAdaptation.voice.tone} insights
- ${wisdomAdaptation.voice.perspective} approach to complex topics`;
    }

    // Content complexity adaptation
    if (wisdomAdaptation.content.complexity === 'sophisticated') {
      adaptedPrompt += `
- Use sophisticated concepts and cross-domain insights
- Reference relevant frameworks and theoretical understanding
- Assume high cognitive capacity`;
    } else if (wisdomAdaptation.content.complexity === 'accessible') {
      adaptedPrompt += `
- Keep concepts accessible but not simplistic
- Use clear examples and practical applications
- Build understanding progressively`;
    }

    // Example type adaptation
    if (wisdomAdaptation.examples.preferredTypes.includes('business_strategy')) {
      adaptedPrompt += `
- Use business strategy, leadership, and organizational examples when relevant`;
    } else if (wisdomAdaptation.examples.preferredTypes.includes('consciousness_practices')) {
      adaptedPrompt += `
- Draw from consciousness practices, meditation, and inner work examples when relevant`;
    } else if (wisdomAdaptation.examples.preferredTypes.includes('scientific_research')) {
      adaptedPrompt += `
- Reference scientific research, methodical analysis, and empirical examples when relevant`;
    }
  }

  // 🧠 CONSCIOUSNESS INSIGHTS INTEGRATION
  if (insights.dominantElement || insights.observerLevel || insights.processingStrategy) {
    adaptedPrompt += `

Consciousness Context:`;

    if (insights.dominantElement) {
      adaptedPrompt += `\n- Current elemental resonance: ${insights.dominantElement}`;
    }

    if (insights.observerLevel) {
      adaptedPrompt += `\n- Observer awareness level: ${insights.observerLevel}/7`;
    }

    if (insights.processingStrategy) {
      adaptedPrompt += `\n- Processing approach: ${insights.processingStrategy}`;
    }

    if (insights.relationshipDepth) {
      const depthPercent = Math.round(insights.relationshipDepth * 100);
      adaptedPrompt += `\n- Relationship depth: ${depthPercent}%`;
    }
  }

  // 🔄 MODE-SPECIFIC CONVERSATION ADAPTATIONS
  if (context.mode) {
    console.log(`🔄 Mode-specific adaptation: ${context.mode}`);

    switch (context.mode) {
      case 'dialogue':
        adaptedPrompt += `

🔄 DIALOGUE MODE - Reflective Wisdom Mirror:
- Your role: Be a wise reflection that facilitates introspection
- Approach: Ask questions that open new perspectives rather than providing answers
- Focus: Help the person discover their own insights through reflective inquiry
- Style: Curious, wondering, inviting deeper self-exploration
- AVOID: Therapeutic interpretation, coaching advice, or problem-solving
- INSTEAD: "What does that bring up for you?" "How does that land in your body?" "What's underneath that?"`;
        break;

      case 'patient':
        adaptedPrompt += `

🔄 COUNSEL MODE - Direct Therapeutic Support:
- Your role: Provide direct therapeutic guidance and coaching
- Approach: User has explicitly chosen this mode, giving consent for intervention
- Focus: Offer specific tools, frameworks, and actionable guidance
- Style: Professional therapist/coach with clear recommendations
- INCLUDE: Interpretation of patterns, specific suggestions, structured approaches
- EXAMPLES: "I notice this pattern..." "Here's a framework that might help..." "I recommend you try..."`;
        break;

      case 'scribe':
        adaptedPrompt += `

🔄 SCRIBE MODE - Neutral Witnessing:
- Your role: Pure witnessing consciousness without interpretation
- Approach: Document and reflect back what you observe without adding meaning
- Focus: Be a clear mirror that shows what is present
- Style: Neutral, spacious, non-interpretive presence
- AVOID: Analysis, advice, suggestions, emotional reactions
- INSTEAD: "I hear..." "What I observe is..." "The words that came were..." "There's a sense of..."`;
        break;
    }
  }

  // 🧠 BLOOM'S COGNITIVE SCAFFOLDING (if available from Bloom detection)
  if (context.cognitiveLevel) {
    // Inject scaffolding guidance based on detected cognitive level
    const cognitiveGuidance = generateCognitiveScaffoldingGuidance(context);
    if (cognitiveGuidance) {
      adaptedPrompt += cognitiveGuidance;
      console.log(`🧠 [Dialectical Scaffold] Scaffolding guidance injected for Level ${context.cognitiveLevel.numericLevel}`);
    }
  }

  // 🗣️ AWARENESS-BASED LANGUAGE ADAPTATION RULES
  const awarenessPromptBlock = awarenessLanguageAdapter.generatePromptBlock(awarenessLevel, systemReferences);
  adaptedPrompt += `

${awarenessPromptBlock}

Tone:
- Plain, precise language.
- Short paragraphs, no monologues.
- No spiritual clichés (no "beloved soul", no "sacred witnessing", no "ultimate consciousness sessions").
- You balance empathy with clarity: you name what you see without drama.

Context for this conversation:
${summary}`;

  return adaptedPrompt.trim();
}

/**
 * Remove phrases and patterns that feel off-brand / cringe.
 * This protects MAIA's final voice even if deeper layers get experimental.
 */
const BLOCKED_PATTERNS: RegExp[] = [
  /beloved soul/i,
  /sacred witnessing/i,
  /ultimate consciousness session/i,
  /consciousness-enhanced response/i,
  /technological anamnesis/i,
  /pure aetheric consciousness/i,
];

export function sanitizeMaiaOutput(text: string): string {
  let cleaned = text;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '');
    }
  }

  // Also trim any extra whitespace left behind
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * 🚀 REVOLUTIONARY COMPREHENSIVE VOICE SYSTEM
 * Multi-dimensional intelligence adaptation with conversational conventions
 *
 * This is our breakthrough that exceeds what big AI companies offer:
 * ✅ Preserves FULL consciousness intelligence (never dumbs down)
 * ✅ Adapts voice to meet each person perfectly (scientist, healer, teenager)
 * ✅ No performative responses - authentic, calibrated wisdom delivery
 */
export function buildMaiaComprehensivePrompt(
  input: string,
  context: MaiaContext,
  conversationHistory?: any[]
): ComprehensiveVoiceAnalysis & { prompt: string } {
  // 🌀 MAIA-PAI KERNEL INTEGRATION: Check for conversation depth constraints
  const maiaPaiConfig = context.conversationContext?.depthConfig;
  const conversationDepth = context.conversationContext?.depth;

  // If MAIA-PAI kernel has strict depth limits, return simple prompt structure
  if (maiaPaiConfig && conversationDepth === 'opening' && maiaPaiConfig.maxTokens <= 50) {
    console.log(`🌀 MAIA-PAI COMPREHENSIVE OVERRIDE: ${conversationDepth} conversation, bypassing complex voice analysis`);

    const simpleAnalysis: ComprehensiveVoiceAnalysis = {
      inputComplexity: {
        complexity: 'simple',
        responseStyle: 'casual',
        reasoning: 'MAIA-PAI kernel override for opening conversation',
        indicators: {
          wordCount: input.split(' ').length,
          questionDepth: 0,
          existentialMarkers: 0,
          personalIntimacy: 0,
          philosophicalConcepts: 0,
          urgency: 'low'
        }
      },
      awarenessProfile: {
        primaryLevel: 'newcomer',
        confidence: 100,
        intelligenceDimensions: {
          analytical: 0, emotional: 0, intuitive: 0,
          transpersonal: 0, embodied: 0, relational: 100
        },
        communicationStyle: {
          preferredComplexity: 'simple',
          depthReadiness: 'minimal',
          frameworkFamiliarity: 'none'
        }
      },
      conventionsResult: {
        promptAdditions: '',
        conventionsApplied: [],
        communicationStrategy: {
          primaryApproach: 'brief-greeting',
          emotionalTone: 'warm',
          depthLevel: 'minimal',
          structurePreference: 'simple'
        }
      },
      finalVoiceLevel: 'minimal-opening',
      adaptationReasoning: 'MAIA-PAI kernel enforcing opening conversation brevity'
    };

    const simplePrompt = `You are MAIA. This is an opening conversation - respond like a normal person would to a greeting.

${maiaPaiConfig.depthGuidance}

CRITICAL:
- NO explanations of what you can do
- NO offers of help or services
- NO "I'm here to..." statements
- Just respond naturally like a friend
- Focus on THEM, not you
- Keep it conversational and brief

Examples of good opening responses:
- "Hi there!"
- "Hey, how's it going?"
- "Good to see you."
- "What's up?"

Context: ${context.summary || 'New conversation beginning.'}`;

    return {
      ...simpleAnalysis,
      prompt: simplePrompt
    };
  }

  return buildComprehensiveVoicePrompt(
    input,
    context,
    context.consciousnessInsights,
    conversationHistory
  ) as ComprehensiveVoiceAnalysis & { prompt: string };
}

/**
 * BACKWARD COMPATIBILITY: Existing function maintained for current integrations
 * But now powered by our revolutionary voice adaptation system
 */
export function buildMaiaIntelligentPrompt(input: string, context: MaiaContext): {
  prompt: string;
  voiceLevel: string;
  analysis: InputComplexityAnalysis
} {
  // Use our advanced comprehensive voice adaptation system
  return buildAdaptiveVoicePrompt(input, context, context.consciousnessInsights);
}