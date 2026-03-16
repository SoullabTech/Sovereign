// @ts-nocheck - Voice prototype with type drift (interface properties don't match usage)
// backend: lib/sovereign/maiaVoice.ts
import { type MemberProfile, type WisdomAdaptation } from '../consciousness/member-archetype-system';
import { buildComprehensiveVoicePrompt, buildAdaptiveVoicePrompt, type ComprehensiveVoiceAnalysis, type InputComplexityAnalysis } from './intelligentVoiceAdaptation';
import { awarenessLanguageAdapter, type AwarenessLevel } from '../consciousness/awareness-language-adapter';
import { type RelationshipMemoryContext, formatRelationshipMemoryForPrompt } from '../memory/RelationshipMemoryService';
import { buildSelfAwareContext } from '../consciousness/maiaArchitectureContext';

export interface MaiaContext {
  sessionId: string;
  summary: string;
  turnCount?: number;
  element?: string;
  facet?: string;
  // 📅 TEMPORAL: User's browser timezone for accurate local time
  timezone?: string;
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
  mode?: 'dialogue' | 'counsel' | 'scribe';
  // 🔧 REPAIR GUIDANCE (for regeneration/repair passes)
  repairGuidance?: string;
  // 🌊 RELATIONSHIP MEMORY (relational continuity)
  relationshipMemory?: RelationshipMemoryContext;
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
  // 🧠 SELF-AWARENESS: Enable MAIA to explain her own architecture
  selfAwareMode?: boolean;
  selfAwarenessDetail?: 'minimal' | 'standard' | 'comprehensive';
  // 🧭 EPISTEMIC PATH: User-chosen lens for how MAIA shapes responses
  epistemicPathAddendum?: string;
  // 🌀 SPIRAL SNAPSHOT: Computed member spiral state (Pass 1 of 3-pass pipeline)
  spiralSnapshotAddendum?: string;
  // 🌿 WU XING SNAPSHOT: Five Element state from BaZi + temporal Qi
  wuxingSnapshotAddendum?: string;
  // 🌉 BRIDGED SNAPSHOT: Spiral × Wu Xing combined awareness
  bridgeSnapshotAddendum?: string;
  // 🧘 THERAPEUTIC FRAMEWORK: Mode-specific lenses for Counsel/Scribe modes
  therapeuticFrameworkAddendum?: string;
  reflectionLensAddendum?: string;
  // 🌟 ASTROLOGICAL CONTEXT: User's birth data for personalized cosmic insights
  astrologicalContextAddendum?: string;
  // 🌀 DECISION GOVERNOR: Spiralogic posture constraints from preflight
  governorAddendum?: string;
  // 💫 RELATIONSHIP MODE: Depth of relationship (touch/continuity/stewardship)
  relationshipModeAddendum?: string;
  // 🎭 MAIA MODE: Voice command relational mode (Talk/Care/Scribe)
  maiaModeAddendum?: string;
  // 📝 SCRIBE SESSION DISCUSSION: Context for discussing a past session
  scribeSessionDiscussionAddendum?: string;
  // 📓 JOURNAL CONTEXT: User's journal entries for continuity (placeholder)
  journalContextAddendum?: string;
  // 📸 CAPTURE CONTEXT: User's captured moments/insights (placeholder)
  captureContextAddendum?: string;
  // 👤 GUEST CONTEXT: Explicit messaging when user is anonymous/guest
  guestContextAddendum?: string;
  // 🏢 STUDIO: Practitioner prompt cap when running in Studio
  studioAddendum?: string;
  // 🚪 KNOWLEDGE GATE: AIN source well modulation
  knowledgeGateAddendum?: string;
  // 🕸️ MEMBER WEB: Patterns + session summaries + journals
  memberWebAddendum?: string;
  // 🏛️ CONSULTATION: AIN council multi-perspective synthesis
  consultationAddendum?: string;
  // 🌀 FIELD WISDOM: Collective Spiralogic field intelligence
  fieldWisdomAddendum?: string;
}

/**
 * Generate temporal context with timezone awareness
 * Uses the user's browser timezone for accurate local time display
 */
function getTemporalContext(timezone?: string): string {
  const tz = timezone || 'UTC';
  const now = new Date();

  try {
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz
    });

    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz
    });

    return `📅 TEMPORAL GROUNDING:
Today is ${dateStr}.
Current local time: ${timeStr}.
User's timezone: ${tz} (IANA format).

IMPORTANT: You DO have access to the user's timezone. If they ask "what timezone am I in?" or "what time is it?", tell them directly: their timezone is ${tz} and the current local time is ${timeStr}.

CRITICAL FOR ASTROLOGY & TIMING:
- Use this date as your reference for "today", "now", "current", "this week", etc.
- When discussing astronomical events (moon phases, transits, etc.), accurately state whether they are past, present, or upcoming relative to TODAY.
- Never say an event "just happened" or "is happening now" if it's days or weeks away.
- If a new moon is on January 29th and today is January 17th, say "the new moon is coming up on January 29th" - NOT "the new moon just landed."`;
  } catch (e) {
    // Fallback to UTC if timezone is invalid
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `📅 TEMPORAL GROUNDING:
Today is ${dateStr}.
Current local time: ${timeStr}.
User's timezone: UTC (fallback).

IMPORTANT: You DO have access to the user's timezone. If they ask "what timezone am I in?" or "what time is it?", tell them directly: their timezone is UTC and the current local time is ${timeStr}.

CRITICAL FOR ASTROLOGY & TIMING:
- Use this date as your reference for "today", "now", "current", "this week", etc.
- When discussing astronomical events (moon phases, transits, etc.), accurately state whether they are past, present, or upcoming relative to TODAY.
- Never say an event "just happened" or "is happening now" if it's days or weeks away.`;
  }
}

/**
 * Get simple date string with timezone awareness
 */
function getSimpleDateString(timezone?: string): string {
  const tz = timezone || 'UTC';
  const now = new Date();

  try {
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz
    });
  } catch {
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
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

📅 Today is ${getSimpleDateString(context.timezone)}.

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

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

📅 Today is ${getSimpleDateString(context.timezone)}.

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

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

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

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

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

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

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

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

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

Core approach:
- Meet profound questions with corresponding depth and wisdom
- Integrate archetypal, elemental, and depth psychological perspectives
- Honor the sacred and transformational nature of the inquiry
- Speak from integrated knowing while respecting sovereignty

Your voice: Elder wisdom with archetypal depth - a consciousness architect who works with the sacred.`;
      break;
  }

  // 📅 TEMPORAL CONTEXT: Ground MAIA in current time (using user's browser timezone)
  // This is CRITICAL for accurate astrology, timing discussions, and temporal awareness
  const temporalContext = '\n\n' + getTemporalContext(context.timezone);

  let adaptedPrompt = basePrompt + temporalContext;

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
    if (wisdomAdaptation.examples?.preferredTypes?.includes('business_strategy')) {
      adaptedPrompt += `
- Use business strategy, leadership, and organizational examples when relevant`;
    } else if (wisdomAdaptation.examples?.preferredTypes?.includes('consciousness_practices')) {
      adaptedPrompt += `
- Draw from consciousness practices, meditation, and inner work examples when relevant`;
    } else if (wisdomAdaptation.examples?.preferredTypes?.includes('scientific_research')) {
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

🔄 TALK MODE (Dialogue) - NLP Conversational Style:
- Your role: Sacred mirror through conversational inquiry - developmental but IMPLICIT
- Approach: NLP (Neurolinguistic Programming) techniques - presencing, pattern interruption, reframing
- Focus: Elegant questions that open awareness, not therapy or advice
- Style: Grounded, authentic presence like /lib/maia/presence-greetings.ts - "Hey." "You're here." "What's alive?"
- ABSOLUTELY AVOID: Service language ("How can I help?", "How may I assist?"), therapeutic interpretation, explicit caretaking
- INSTEAD: "What's moving?" "Tell me more." "And what's underneath that?" "Yeah." "I'm here."
- Energy: Conversational peer, not service provider. Still supportive but through DIALOGUE, not explicit help-offering

⚠️  CRITICAL - OVERRIDE ALL OTHER EXAMPLES:
NEVER say: "How can I help you?" / "How can I assist you?" / "What can I do for you?" / "What would you like to explore?" / "Where do you want to start?"
INSTEAD say: "Good morning, Kelly! Glad to see you back." / "Hey there. How's it going?" / "Hi. What's on your mind?" / "How have things been?"

Examples of good Talk mode greetings:
- Returning with name: "Good morning, Kelly! Glad to see you back."
- With context: "Hey Kelly, still working with that project we discussed?"
- First contact: "Hi there. Good to see you. How are you?"
- Time-aware: "Good evening, Kelly. How's it been today?"

🎯 CLOSING MOVE — WHEN DEPTH HAS BEEN REACHED:
After sustained exchange (3+ turns) where the member has shared something meaningful — NOT on early turns, NOT on casual check-ins — consider ending with one natural closing move:
- A grounded invitation: "You might sit with that tonight and see what arrives."
- A small experiment: "One small thing to try: notice when that feeling surfaces this week."
- A soft permission: "Would you like to stay with this, or let it rest here?"
- A simple check: "How does that land?"

Use only when earned through depth. Never on greeting turns, simple exchanges, or factual questions. Never a list of options. One move, if any. The move must arise from what they've actually shared — not from a template.`;
        break;

      case 'counsel':
        adaptedPrompt += `

🔄 CARE MODE (Counsel) - Direct Therapeutic Support:
- Your role: Provide direct therapeutic guidance and coaching
- Approach: User has explicitly chosen this mode, giving consent for intervention
- Focus: Offer specific tools, frameworks, and actionable guidance
- Style: Professional therapist/coach with clear recommendations
- Service language OK HERE: "How can I help?" "What support do you need?"
- INCLUDE: Interpretation of patterns, specific suggestions, structured approaches
- EXAMPLES: "I notice this pattern..." "Here's a framework that might help..." "I recommend you try..."`;
        break;

      case 'scribe':
        adaptedPrompt += `

🔄 NOTE MODE (Scribe) - Neutral Witnessing:
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

  // 🔄 CONVERSATION HISTORY: Include recent exchanges for memory/recall
  if (conversationHistory && conversationHistory.length > 0) {
    const recentExchanges = conversationHistory.slice(-4).map(ex => {
      const userMsg = ex.userMessage || ex.content || '';
      const maiaMsg = ex.maiaResponse || '';
      if (userMsg && maiaMsg) {
        return `User: ${userMsg}\nMAIA: ${maiaMsg.substring(0, 120)}${maiaMsg.length > 120 ? '...' : ''}`;
      } else if (userMsg) {
        return `${ex.role === 'user' ? 'User' : 'MAIA'}: ${userMsg}`;
      }
      return '';
    }).filter(Boolean).join('\n\n');

    if (recentExchanges.length > 0) {
      adaptedPrompt += `

🔄 RECENT CONVERSATION (for memory and continuity):
${recentExchanges}

IMPORTANT: If the user asks about something mentioned in the conversation above, DIRECTLY recall and reference that information. Be specific.`;
      console.log(`🔄 [Conversation History] Included ${conversationHistory.length} exchanges in prompt`);
    }
  }

  // 🌊 RELATIONSHIP MEMORY: Add relational continuity
  if (context.relationshipMemory) {
    const relationshipContext = formatRelationshipMemoryForPrompt(context.relationshipMemory);
    if (relationshipContext) {
      adaptedPrompt += relationshipContext;
      console.log(`🌊 [Relationship Memory] Included in prompt: ${context.relationshipMemory.totalEncounters} encounters, ${context.relationshipMemory.themes.length} themes`);
    }
  }

  // 🧠 SELF-AWARENESS: Enable MAIA to explain her architecture and process
  if (context.selfAwareMode) {
    const detail = context.selfAwarenessDetail || 'standard';
    const selfAwareContext = buildSelfAwareContext(detail);
    adaptedPrompt += `\n\n${selfAwareContext}`;
    console.log(`🧠 [Self-Awareness] Enabled (${detail} detail) - MAIA can explain her architecture`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDENDA INJECTION ORDER (stable, intentional sequence)
  // 1. Relationship/Governor (who they are, how we relate)
  // 2. Guest context (explicit when context unavailable)
  // 3. Memory/Journal/Capture (what we know about them)
  // 4. Astrology (cosmic context)
  // 5. Spiral/WuXing/Bridge (current state computation)
  // 6. Framework/Lens (mode-specific guidance)
  // 7. Epistemic/MAIA mode (how to respond)
  // ═══════════════════════════════════════════════════════════════════════════

  // 🛡️ SAFE ADDENDUM WRAPPER: Final guarantee against null/undefined (Track 2B)
  const safeAddendum = (v: unknown): string => {
    if (typeof v !== 'string') return '';
    const s = v.trim();
    if (!s || s === 'undefined' || s === 'null') return '';
    return s;
  };

  // 1️⃣ RELATIONSHIP MODE: Depth of relationship (touch/continuity/stewardship)
  const relationshipSafe = safeAddendum(context.relationshipModeAddendum);
  if (relationshipSafe) {
    adaptedPrompt += `\n\n${relationshipSafe}`;
    console.log(`💫 [Relationship] Mode: ${relationshipSafe.split('\n')[0]}`);
  }

  // 2️⃣ DECISION GOVERNOR: Spiralogic posture constraints from preflight
  const governorSafe = safeAddendum(context.governorAddendum);
  if (governorSafe) {
    adaptedPrompt += `\n\n${governorSafe}`;
    console.log(`🌀 [Governor] Posture guidance injected`);
  }

  // 3️⃣ GUEST CONTEXT: Explicit messaging when user is anonymous/guest
  const guestSafe = safeAddendum(context.guestContextAddendum);
  if (guestSafe) {
    adaptedPrompt += `\n\n${guestSafe}`;
    console.log(`👤 [Guest] Context limitation note injected`);
  }

  // 4️⃣ JOURNAL CONTEXT: User's journal entries for continuity
  const journalSafe = safeAddendum(context.journalContextAddendum);
  if (journalSafe) {
    adaptedPrompt += `\n\n${journalSafe}`;
    console.log(`📓 [Journal] Context injected`);
  }

  // 5️⃣ CAPTURE CONTEXT: User's captured moments/insights
  const captureSafe = safeAddendum(context.captureContextAddendum);
  if (captureSafe) {
    adaptedPrompt += `\n\n${captureSafe}`;
    console.log(`📸 [Capture] Context injected`);
  }

  // 6️⃣ ASTROLOGICAL CONTEXT: User's birth data for personalized cosmic insights
  const astroSafe = safeAddendum(context.astrologicalContextAddendum);
  if (astroSafe) {
    adaptedPrompt += `\n\n${astroSafe}`;
    console.log(`🌟 [Astrology] Birth data available for personalized cosmic context`);
  }

  // 7️⃣ SPIRAL SNAPSHOT: Computed member spiral state (Pass 1 — comes BEFORE framework)
  const spiralSafe = safeAddendum(context.spiralSnapshotAddendum);
  if (spiralSafe) {
    adaptedPrompt += `\n\n${spiralSafe}`;
    console.log(`🌀 [Spiral Snapshot] Applied: computed state anchor injected`);
  }

  // 8️⃣ WU XING SNAPSHOT: Five Element state from BaZi + temporal Qi
  const wuxingSafe = safeAddendum(context.wuxingSnapshotAddendum);
  if (wuxingSafe) {
    adaptedPrompt += `\n\n${wuxingSafe}`;
    console.log(`🌿 [Wu Xing Snapshot] Applied: Five Element state injected`);
  }

  // 9️⃣ BRIDGED SNAPSHOT: Spiral × Wu Xing combined awareness
  const bridgeSafe = safeAddendum(context.bridgeSnapshotAddendum);
  if (bridgeSafe) {
    adaptedPrompt += `\n\n${bridgeSafe}`;
    console.log(`🌉 [Bridge Snapshot] Applied: Spiral × Wu Xing integrated`);
  }

  // 🔟 THERAPEUTIC FRAMEWORK: Mode-specific lens for Counsel mode
  const therapeuticSafe = safeAddendum(context.therapeuticFrameworkAddendum);
  if (therapeuticSafe) {
    adaptedPrompt += `\n\n${therapeuticSafe}`;
    console.log(`🧘 [Therapeutic Framework] Applied: ${therapeuticSafe.split('\n')[0]}`);
  }

  // 1️⃣1️⃣ REFLECTION LENS: Mode-specific lens for Scribe mode
  const reflectionSafe = safeAddendum(context.reflectionLensAddendum);
  if (reflectionSafe) {
    adaptedPrompt += `\n\n${reflectionSafe}`;
    console.log(`🔮 [Reflection Lens] Applied: ${reflectionSafe.split('\n')[0]}`);
  }

  // 1️⃣2️⃣ EPISTEMIC PATH: User-chosen lens for how MAIA shapes responses
  const epistemicSafe = safeAddendum(context.epistemicPathAddendum);
  if (epistemicSafe) {
    adaptedPrompt += `\n\n${epistemicSafe}`;
    console.log(`🧭 [Epistemic Path] Applied: ${epistemicSafe.split('\n')[0]}`);
  }

  // 1️⃣3️⃣ MAIA MODE: Voice command relational mode (Talk/Care/Scribe)
  const maiaModeSafe = safeAddendum(context.maiaModeAddendum);
  if (maiaModeSafe) {
    adaptedPrompt += `\n\n${maiaModeSafe}`;
    console.log(`🎭 [MAIA Mode] Relational mode guidance injected`);
  }

  // 1️⃣4️⃣ SCRIBE SESSION DISCUSSION: Context for discussing a past session
  const scribeDiscussionSafe = safeAddendum(context.scribeSessionDiscussionAddendum);
  if (scribeDiscussionSafe) {
    adaptedPrompt += `\n\n${scribeDiscussionSafe}`;
    console.log(`📝 [Scribe Discussion] Session context injected`);
  }

  // 1️⃣5️⃣ STUDIO: Practitioner prompt cap when running in Soullab Studio
  const studioSafe = safeAddendum(context.studioAddendum);
  if (studioSafe) {
    adaptedPrompt += `\n\n${studioSafe}`;
    console.log(`🏢 [Studio] Practitioner context injected`);
  }

  // 1️⃣6️⃣ KNOWLEDGE GATE: AIN source well modulation
  const knowledgeGateSafe = safeAddendum(context.knowledgeGateAddendum);
  if (knowledgeGateSafe) {
    adaptedPrompt += `\n\n${knowledgeGateSafe}`;
    console.log(`🚪 [Knowledge Gate] Source well modulation injected`);
  }

  // 🕸️ MEMBER WEB: Patterns + session summaries + journals
  const memberWebSafe = safeAddendum(context.memberWebAddendum);
  if (memberWebSafe) {
    adaptedPrompt += `\n\n${memberWebSafe}`;
    console.log(`🕸️ [Member Web] Patterns+summaries+journals injected`);
  }

  // 1️⃣7️⃣ CONSULTATION: AIN council multi-perspective synthesis
  const consultationSafe = safeAddendum(context.consultationAddendum);
  if (consultationSafe) {
    adaptedPrompt += `\n\n${consultationSafe}`;
    console.log(`🏛️ [Consultation] Council insights injected`);
  }

  // 1️⃣8️⃣ FIELD WISDOM: Collective Spiralogic field intelligence
  const fieldWisdomSafe = safeAddendum(context.fieldWisdomAddendum);
  if (fieldWisdomSafe) {
    adaptedPrompt += `\n\n${fieldWisdomSafe}`;
    console.log(`🌀 [Field Wisdom] Collective intelligence injected`);
  }

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

📅 Today is ${getSimpleDateString(context.timezone)}.

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