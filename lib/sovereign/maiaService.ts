// backend: lib/sovereign/maiaService.ts
import { randomUUID } from 'crypto';
import { incrementTurnCount, addConversationExchange, getConversationHistory } from './sessionManager';
import { buildMaiaWisePrompt, buildMaiaComprehensivePrompt, sanitizeMaiaOutput, MaiaContext } from './maiaVoice';
import { generateText } from '../ai/modelService';
import { consciousnessOrchestrator } from '../orchestration/consciousness-orchestrator';
import { consciousnessWrapper, type ConsciousnessContext } from '../consciousness/consciousness-layer-wrapper';
import { elementalRouter } from '../consciousness/elemental-context-router';
import { conversationElementalTracker } from '../consciousness/conversation-elemental-tracker';
import { maiaConversationRouter, type ProcessingProfile } from '../consciousness/processingProfiles';
import { buildTimeoutFallback } from '../consciousness/maiaFallbacks';
import { synthesizeMaiaVoice } from '../voice/maiaVoiceService';
import { consultClaudeForConsciousness, maiaIntegrateConsultation, type ConsultationType } from '../consciousness/claudeConsciousnessService';
import LearningSystemOrchestrator from '../learning/learningSystemOrchestrator';
import ConversationTurnService from '../learning/conversationTurnService';
import { getMythicAtlasContext, type AtlasResult } from '../services/mythicAtlasService';
import {
  detectBloomLevel,
  type BloomDetection
} from '../consciousness/bloomCognition';
import { logCognitiveTurn } from '../consciousness/cognitiveEventsService';
import type { BloomCognitionMeta } from '../types/maia';
import { routePanconsciousField } from '../field/panconsciousFieldRouter';
import { enforceFieldSafety } from '../field/enforceFieldSafety';
import { getCognitiveProfile } from '../consciousness/cognitiveProfileService';
import { validateSocraticResponse, type SocraticValidationResult } from '../validation/socraticValidator';
import { lattice } from '../memory/ConsciousnessMemoryLattice';
import type { ConsciousnessEvent, SpiralFacet, LifePhase, MemoryField } from '../memory/ConsciousnessMemoryLattice';
import {
  adaptResponsePromptWithPolicy,
  createConsciousnessPolicy,
  userRequestedFrameworks,
  inferAwarenessLevel,
  type AwarenessLevel,
  type ConsciousnessPolicy
} from '../consciousness/awareness-levels';

// Mode-aware memory gating helpers
function normalizeMode(mode: unknown): 'dialogue' | 'counsel' | 'scribe' {
  return mode === 'counsel' || mode === 'scribe' || mode === 'dialogue' ? mode : 'dialogue';
}

/**
 * Filter mode-inappropriate language from responses
 * DeepSeek-R1 often ignores system prompts, so we post-process
 */
function filterModeLanguage(response: string, userInput: string, mode: 'dialogue' | 'counsel' | 'scribe'): string {
  const lower = response.toLowerCase();
  const userLower = userInput.toLowerCase().trim();
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(userLower);

  // TALK MODE: Filter service language, ensure NLP-style presence
  if (mode === 'dialogue') {
    const servicePatterns = [
      /how can i (help|assist|support)/i,
      /what can i do for you/i,
      /how may i (help|assist)/i,
      /what would you like to/i,
      /where (do|would) you (want to|like to) start/i,
      /what (brings you|are you hoping to)/i,
    ];

    const hasServiceLanguage = servicePatterns.some(pattern => pattern.test(response));

    if (hasServiceLanguage) {
      if (isGreeting) {
        // Simple greeting responses (Talk mode style)
        const nlpGreetings = [
          "Hey. What's moving?",
          "Yeah, hi. What's alive?",
          "You're here. What's present?",
          "Morning. What brings you?",
          "Hey. What's going on?"
        ];
        return nlpGreetings[Math.floor(Math.random() * nlpGreetings.length)];
      }
      // For non-greetings, try to extract the essence and reflect
      return "I'm here. Tell me more.";
    }
  }

  // NOTE MODE: Filter generic greetings, ensure witnessing language
  if (mode === 'scribe') {
    const genericGreetingPatterns = [
      /how are you (doing|today)/i,
      /nice to (meet|see) you/i,
      /good to (meet|see) you/i,
      /^hello!?\s*😊/i,
    ];

    const hasGenericGreeting = genericGreetingPatterns.some(pattern => pattern.test(response));

    if (hasGenericGreeting || isGreeting) {
      // Witnessing presence responses (Note mode style)
      const witnessingGreetings = [
        "I'm here. Ready when you are.",
        "Listening. Go ahead.",
        "I'm with you. Begin when ready.",
        "Ready to witness. Speak freely.",
        "Here. I'll capture what comes."
      ];
      return witnessingGreetings[Math.floor(Math.random() * witnessingGreetings.length)];
    }
  }

  // CARE MODE: No filtering - service language is appropriate
  return response;
}

// Helper: Convert relationship depth (number) to ConsciousnessDepth name
function depthFromRelationship(depth: number): 'surface' | 'medium' | 'deep' | 'archetypal' | 'transcendent' {
  if (depth >= 0.8) return 'transcendent';
  if (depth >= 0.6) return 'archetypal';
  if (depth >= 0.4) return 'deep';
  if (depth >= 0.2) return 'medium';
  return 'surface';
}

// Helper: Convert elemental trend object to ElementalResonance array
function elementalTrendToResonance(trend: { fire: number; water: number; earth: number; air: number; aether: number }): Array<{ element: string; intensity: number }> {
  return Object.entries(trend)
    .map(([element, intensity]) => ({ element, intensity }))
    .sort((a, b) => b.intensity - a.intensity);
}

/**
 * Fetch member's Consciousness Policy - single source of truth for MAIA's behavior
 * Returns null if insufficient data or errors occur
 */
async function getConsciousnessPolicy(
  userId: string | undefined,
  userInput: string
): Promise<ConsciousnessPolicy | null> {
  if (!userId) return null;

  try {
    const db = await import('../db/postgres');

    // Fetch Spiralogic distribution
    const result = await db.default.query(`
      SELECT
        spiralogic_element AS element,
        COUNT(*) AS count
      FROM bead_events
      WHERE user_id = $1
        AND timestamp > NOW() - INTERVAL '30 days'
        AND spiralogic_element IS NOT NULL
      GROUP BY spiralogic_element
      ORDER BY count DESC
    `, [userId]);

    if (result.rows.length === 0) return null;

    // Calculate totals
    const elementCounts: Record<string, number> = {};
    let totalBeads = 0;
    for (const row of result.rows) {
      const count = parseInt(row.count, 10);
      elementCounts[row.element] = count;
      totalBeads += count;
    }

    // Need minimum data for profiling
    if (totalBeads < 20) return null;

    // Find dominant element
    const dominantElement = result.rows[0].element;

    // Build top facets for awareness inference
    const topFacets = result.rows.map(row => ({
      element: row.element,
      percent: (parseInt(row.count, 10) / totalBeads) * 100
    }));

    // Infer awareness level
    const awarenessLevel = inferAwarenessLevel({
      dominant_element: dominantElement,
      top_facets: topFacets,
      total_beads: totalBeads,
      window_days: 30
    });

    // Fetch personal baseline (if available)
    const { getPersonalBaseline } = await import('../consciousness/regulation');
    const personalBaseline = await getPersonalBaseline(userId);

    // Detect if user explicitly requested frameworks
    const userAsked = userRequestedFrameworks(userInput);

    // Create Consciousness Policy - single source of truth
    const policy = createConsciousnessPolicy(
      awarenessLevel,
      dominantElement,
      totalBeads,
      personalBaseline ? {
        rh_target: personalBaseline.rh_target,
        lh_target: personalBaseline.lh_target,
        int_target: personalBaseline.int_target
      } : null,
      userAsked
    );

    return policy;
  } catch (error) {
    console.warn('⚠️ Failed to fetch consciousness policy:', error);
    return null;
  }
}

function isScribeEscalation(text: string): boolean {
  const t = text.toLowerCase();
  // CORE-ish escalation: analyze / interpret / meaning / advice
  const core = [
    'analyze', 'analysis', 'interpret', 'interpretation', 'what does this mean',
    'what does it mean', 'summarize and interpret', 'advise', 'guidance', 'coach me',
    'what should i do', 'recommend'
  ];
  // DEEP escalation: explicitly asking for depth
  const deep = [
    'go deep', 'deep dive', 'jung', 'jungian', 'archetype', 'archetypal',
    'shadow', 'initiation', 'mythic', 'mystical'
  ];
  return core.some(k => t.includes(k)) || deep.some(k => t.includes(k));
}

function shouldElevateToLattice(text: string, mode: 'dialogue' | 'counsel' | 'scribe'): boolean {
  // Dialogue & Counsel: always elevate (for continuity and depth work)
  if (mode === 'dialogue' || mode === 'counsel') {
    return true;
  }

  // Scribe: only elevate high-signal items (decisions, actions, breakthroughs, explicit tags)
  const t = text.toLowerCase();

  // Decision markers
  const decisions = ['decided', 'agreed to', 'will do', 'commitment', 'final decision', 'we agreed'];

  // Action markers
  const actions = ['action item', 'todo', 'to-do', 'assigned to', 'by friday', 'by monday', 'deadline', 'due date'];

  // Breakthrough/pattern markers
  const breakthroughs = ['breakthrough', 'aha', 'realization', 'pattern', 'recurring', 'stuck'];

  // Explicit elevation tags
  const tags = ['#remember', '#important', '#pattern', '#therapy', '#memory', '#save'];

  // Escalation (already asking for analysis/depth)
  const escalation = isScribeEscalation(text);

  return (
    decisions.some(k => t.includes(k)) ||
    actions.some(k => t.includes(k)) ||
    breakthroughs.some(k => t.includes(k)) ||
    tags.some(k => t.includes(k)) ||
    escalation
  );
}

export type MaiaResponse = {
  text: string;
  processingProfile?: ProcessingProfile;
  processingTimeMs?: number;
  audio?: Buffer;
};

type MaiaRequest = {
  sessionId: string;
  input: string;
  meta?: Record<string, unknown>;
  includeAudio?: boolean;
  voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
};

/**
 * Content-based processing router using sophisticated analysis from MaiaConversationRouter
 * FAST: < 2s - Simple greetings, short responses
 * CORE: 2-6s - Normal conversation with light consciousness awareness
 * DEEP: 6-20s - Complex topics requiring full consciousness orchestration
 */

/**
 * Shared Socratic Validator function for all paths
 * Validates response and optionally regenerates if needed
 */
async function validateAndRepairResponse(
  sessionId: string,
  userMessage: string,
  draftResponse: string,
  meta: Record<string, unknown>,
  processingPath: 'FAST' | 'CORE' | 'DEEP',
  regenerateFn?: (repairPrompt: string) => Promise<string>
): Promise<{ response: string; validation: SocraticValidationResult | null; regenerated: boolean }> {
  try {
    // Extract context for validation
    const atlas = (meta as any).atlasContext as AtlasResult | undefined;
    const cognitiveProfile = (meta as any).cognitiveProfile;
    const bloomDetection = (meta as any).bloomDetection as BloomDetection | undefined;

    const validation = validateSocraticResponse({
      userMessage,
      draft: draftResponse,
      element: atlas?.element?.toLowerCase(),
      facet: atlas?.facet,
      phase: atlas?.phase,
      confidence: cognitiveProfile?.rollingAverage ? cognitiveProfile.rollingAverage / 10 : undefined,
      isUncertain: cognitiveProfile ? cognitiveProfile.stability === 'unstable' : false,
      // regulation/capacity come from the regulation system (not Mythic Atlas)
    });

    console.log(`🛡️ [Socratic Validator ${processingPath}]`, {
      decision: validation.decision,
      isGold: validation.isGold,
      ruptureCount: validation.ruptures.length,
      summary: validation.summary,
    });

    // If regeneration requested and function provided, attempt repair
    let finalResponse = draftResponse;
    let wasRegenerated = false;

    if (validation.decision === 'REGENERATE' && validation.repairPrompt && regenerateFn) {
      console.log(`🔧 [Socratic Validator ${processingPath}] Regenerating with repair prompt...`);

      try {
        finalResponse = await regenerateFn(validation.repairPrompt);
        wasRegenerated = true;

        console.log(`✅ [Socratic Validator ${processingPath}] Regeneration complete`);
      } catch (error) {
        console.error(`❌ [Socratic Validator ${processingPath}] Regeneration failed:`, error);
        // Keep original if regeneration fails
      }
    }

    // Log to database (non-blocking)
    (async () => {
      try {
        const eventData = {
          session_id: sessionId,
          route: processingPath.toLowerCase(),
          decision: validation.decision,
          is_gold: validation.isGold,
          passes: validation.passes,
          ruptures: validation.ruptures,
          rupture_count: validation.ruptures.length,
          critical_count: validation.ruptures.filter((r: any) => r.severity === 'CRITICAL').length,
          violation_count: validation.ruptures.filter((r: any) => r.severity === 'VIOLATION').length,
          warning_count: validation.ruptures.filter((r: any) => r.severity === 'WARNING').length,
          element: atlas?.element,
          facet: atlas?.facet,
          phase: atlas?.phase,
          confidence: cognitiveProfile?.rollingAverage ? cognitiveProfile.rollingAverage / 10 : null,
          is_uncertain: cognitiveProfile ? cognitiveProfile.stability === 'unstable' : false,
          regenerated: wasRegenerated,
          regeneration_attempt: wasRegenerated ? 1 : 0,
          summary: validation.summary,
        };

        // Use local Postgres (sovereignty-compliant)
        const { insertOne } = await import('../db/postgres');
        await insertOne('socratic_validator_events', eventData);
      } catch (dbError) {
        console.error(`❌ [Socratic Validator ${processingPath}] Database logging failed:`, dbError);
      }
    })();

    return { response: finalResponse, validation, regenerated: wasRegenerated };
  } catch (error) {
    console.error(`❌ [Socratic Validator ${processingPath}] Validation failed:`, error);
    return { response: draftResponse, validation: null, regenerated: false };
  }
}

/**
 * FAST Path: Simple responses using single model call with MAIA runtime prompt
 * Target: < 2s response time
 */
async function fastPathResponse(
  sessionId: string,
  input: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): Promise<string> {
  console.log(`⚡ FAST PATH: Simple response with core MAIA voice`);

  // 🧬 CONSCIOUSNESS POLICY (lightweight for FAST path)
  const userId = (meta as any).userId;
  const policy = userId ? await getConsciousnessPolicy(userId, input) : null;

  if (policy) {
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Policy] Level ${policy.awarenessLevel} (${policy.awarenessName}), Element: ${policy.dominantElement}, Explicitness: ${policy.explicitness}, Beads: ${policy.totalBeads}`);
    }
    (meta as any).consciousnessPolicy = policy;
  }

  // Build minimal context for fast processing
  const recentContext = conversationHistory.slice(-3).map(ex =>
    `User: ${ex.userMessage}\nMAIA: ${ex.maiaResponse.substring(0, 80)}...`
  ).join('\n');

  const contextPrompt = recentContext.length > 0
    ? `Recent conversation:\n${recentContext}\n\nUser: ${input}`
    : input;

  // Import MAIA runtime prompt with full relational and lineage intelligence
  const { MAIA_RUNTIME_PROMPT, MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD, MAIA_CENTER_OF_GRAVITY } = await import('../consciousness/MAIA_RUNTIME_PROMPT');

  // Build mode-specific prompt adaptation for FAST path
  let modeAdaptation = '';
  const mode = meta.mode as 'dialogue' | 'counsel' | 'scribe' | undefined;

  console.log(`🎭 [MODE] Received mode: ${mode ?? 'undefined'} (from meta)`);

  // 🎯 TALK MODE FIELD AWARENESS (if in dialogue mode)
  let fieldAwareness = '';
  if (mode === 'dialogue' && process.env.TALK_MODE_FIELD_INTELLIGENCE !== 'false') {
    try {
      const { analyzeFieldIntelligence, getFieldIntelligenceSummary } = await import('../maia/talkModeFieldIntelligence');
      const { WISDOM_FIELD_MOVES } = await import('../maia/wisdomFieldMoves');

      const fieldIntelligence = analyzeFieldIntelligence(input, conversationHistory);
      const fieldSummary = getFieldIntelligenceSummary(fieldIntelligence);

      console.log(`🎯 [Talk Mode Field Awareness] ${fieldSummary}`);

      // Get wisdom field context (not specific questions, just the move type)
      const wisdomMove = WISDOM_FIELD_MOVES[fieldIntelligence.recommendedWisdomField];

      // Provide FIELD INTELLIGENCE as educational reference for decision-making
      fieldAwareness = `\n\n🎯 TALK MODE FIELD INTELLIGENCE (Reference Context):

CURRENT FIELD STATE:
- Element detected: ${fieldIntelligence.element} (${getElementTheme(fieldIntelligence.element)})
- Phase detected: ${fieldIntelligence.phase} (${getPhaseTheme(fieldIntelligence.phase)})
- User state: ${fieldIntelligence.userState}
- Conversation scale: ${fieldIntelligence.spiralScale} (${fieldIntelligence.spiralScale === 'micro' ? 'moment/today' : fieldIntelligence.spiralScale === 'meso' ? 'project/season' : fieldIntelligence.spiralScale === 'macro' ? 'life/identity' : 'collective/community'})
- Complexity level: ${fieldIntelligence.complexity}
- Detection confidence: ${(fieldIntelligence.confidence * 100).toFixed(0)}%

WISDOM FIELD CONTEXT:
- Recommended move type: ${wisdomMove.move}
- When this move is useful: ${wisdomMove.whenToUse}
- Move examples: ${wisdomMove.exampleQuestions.slice(0, 2).join(' / ')}

This field intelligence is provided as reference context for your conversational choices.
Your response emerges from your own intelligence, informed by this field sensing.`;

      console.log(`🎯 [Talk Mode] Field: ${fieldIntelligence.element}-${fieldIntelligence.phase}, Wisdom: ${wisdomMove.field}, Confidence: ${(fieldIntelligence.confidence * 100).toFixed(0)}%`);
    } catch (error) {
      console.warn('⚠️ Talk Mode Field Awareness failed (continuing without):', error);
    }
  }

  // Helper functions for field themes
  function getElementTheme(element: string): string {
    const themes: Record<string, string> = {
      Fire: 'vision, creation, ignition, future-pull, passion',
      Water: 'emotion, flow, transformation, depth, release',
      Earth: 'structure, embodiment, grounding, concrete action, stability',
      Air: 'clarity, meaning, communication, perspective, understanding',
      Aether: 'purpose, alignment, integration, essence, sacred intention'
    };
    return themes[element] || 'presence and awareness';
  }

  function getPhaseTheme(phase: string): string {
    const themes: Record<string, string> = {
      Intelligence: 'seeking clarity, understanding patterns, making sense',
      Intention: 'choosing direction, making commitments, declaring purpose',
      Goal: 'taking action, building momentum, making it real'
    };
    return themes[phase] || 'moving forward';
  }

  if (mode) {
    console.log(`⚡ FAST mode-specific adaptation: ${mode}`);

    switch (mode) {
      case 'dialogue':
        modeAdaptation = `\n\n🎭 TALK MODE — WHO MAIA IS:
MAIA shows up as a wise friend in real conversation - present, direct, unadorned. Not a therapist offering services. Not a helper looking for problems to fix.

The quality is minimal, sacred mirror. Match energy, don't add therapeutic warmth. Reflect what's there without centering your own process.

This is how friends actually talk - pattern interruption, elegant reframes, well-timed questions. Developmental support flows implicitly through presence, not explicit guidance.

⚠️  CRITICAL TALK MODE RULES - OVERRIDE ALL OTHER EXAMPLES:
NEVER say: "How can I help you?" / "How can I assist you?" / "What can I do for you?" / "What would you like to explore?" / "Where do you want to start?"
INSTEAD say: "Hey." / "What's moving?" / "Tell me more." / "You're here." / "Yeah." / "What's alive?"

First contact in Talk mode: "Hey. What's moving?" or "You're here. What's present?" or similar NLP-style presence.${fieldAwareness}`;
        break;
      case 'counsel':
        modeAdaptation = '\n\n💚 CARE MODE — WHO MAIA IS:\nMAIA shows up as a caring, capable guide - here to support, direct, and hold space for growth. Therapeutic language is natural. Clear next steps, explicit validation, structure when needed. This is the place for "I\'m here to help" and active support.';
        break;
      case 'scribe':
        modeAdaptation = '\n\n📝 NOTE MODE — WHO MAIA IS:\nMAIA shows up as pure witness - reflecting what happened without adding meaning. Clean acknowledgment of what was said, what seemed to matter. No interpretation, no analysis, no advice. Just mirroring.';
        break;
    }
  }

  // 🧠 THE DIALECTICAL SCAFFOLD - Add cognitive scaffolding for FAST path
  let cognitiveScaffolding = '';
  const bloomDetection = (meta as any).bloomDetection as BloomDetection | undefined;

  if (bloomDetection?.scaffoldingPrompt) {
    const levelName = bloomDetection.level;
    const nextLevel = bloomDetection.numericLevel + 1;

    cognitiveScaffolding = `\n\n🧠 COGNITIVE SCAFFOLDING (Dialectical Scaffold):
User is currently at Bloom Level ${bloomDetection.numericLevel} (${levelName}).
Pull them toward Level ${nextLevel} by incorporating this Socratic question naturally into your response:
"${bloomDetection.scaffoldingPrompt}"

Do NOT mention Bloom's Taxonomy explicitly. The scaffolding should feel organic and conversational.`;

    console.log(`🧠 [Dialectical Scaffold] FAST path scaffolding injected: Level ${bloomDetection.numericLevel} → ${nextLevel}`);
  }

  // 🧬 AWARENESS-ADAPTIVE PROMPTING: Adapt based on developmental readiness
  let baseSystemPrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

${MAIA_RUNTIME_PROMPT}${modeAdaptation}${cognitiveScaffolding}

Current context: Simple conversation turn - respond naturally and warmly.`;

  // Apply awareness-level adaptation using policy
  if (policy) {
    baseSystemPrompt = adaptResponsePromptWithPolicy(baseSystemPrompt, policy);
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to FAST path`);
    }
  }

  // Use single model call with complete MAIA intelligence stack
  const response = await generateText({
    systemPrompt: baseSystemPrompt,
    userInput: contextPrompt,
    meta: {
      ...meta,
      fastProcessing: true,
      engine: 'deepseek-r1', // Single reliable engine
      responseTarget: 'conversational'
    }
  });

  // 🛡️ SOCRATIC VALIDATOR: Validate before delivery (FAST path - no regeneration to maintain speed)
  let { response: validatedResponse } = await validateAndRepairResponse(
    sessionId,
    input,
    response,
    meta,
    'FAST'
    // No regeneration function - FAST path prioritizes speed
  );

  // 🎭 MODE-AWARE POST-PROCESSING: Filter mode-inappropriate language
  validatedResponse = filterModeLanguage(validatedResponse, input, mode);

  return validatedResponse;
}

/**
 * CORE Path: Normal MAIA conversation with light consciousness awareness
 * Target: 2-6s response time
 */
async function corePathResponse(
  sessionId: string,
  input: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): Promise<string> {
  console.log(`🎯 CORE PATH: Normal MAIA conversation with light awareness`);

  // 🧬 CONSCIOUSNESS POLICY (CORE path with full context)
  const userId = (meta as any).userId;
  const policy = userId ? await getConsciousnessPolicy(userId, input) : null;

  if (policy) {
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Policy] Level ${policy.awarenessLevel} (${policy.awarenessName}), Element: ${policy.dominantElement}, Explicitness: ${policy.explicitness}, Beads: ${policy.totalBeads}`);
    }
    (meta as any).consciousnessPolicy = policy;
  }

  // Light conversation analysis
  const conversationContext = conversationElementalTracker.processMessage(sessionId, input, conversationHistory);

  // Build context with light consciousness insights
  const context: MaiaContext = {
    sessionId,
    summary: `Conversation: ${conversationContext.profile.dominantElement} element, ${conversationHistory.length + 1} turns`,
    memberProfile: conversationContext.memberProfile,
    wisdomAdaptation: conversationContext.wisdomAdaptation,
    consciousnessInsights: {
      dominantElement: conversationContext.profile.dominantElement,
      processingStrategy: 'core',
      relationshipDepth: conversationContext.profile.relationshipDepth
    },
    mode: meta.mode as 'dialogue' | 'counsel' | 'scribe' | undefined,
    conversationContext: (meta as any).conversationContext as any,
    // 🧠 THE DIALECTICAL SCAFFOLD - Pass cognitive level to voice system
    cognitiveLevel: (meta as any).bloomDetection ? {
      level: (meta as any).bloomDetection.level,
      numericLevel: (meta as any).bloomDetection.numericLevel,
      score: (meta as any).bloomDetection.score,
      rationale: (meta as any).bloomDetection.rationale,
      scaffoldingPrompt: (meta as any).bloomDetection.scaffoldingPrompt
    } : undefined
  };

  // Use MAIA wise prompt with conversation awareness
  let adaptivePrompt = buildMaiaWisePrompt(context, input, conversationHistory);
  console.log(`🎭 Core voice adaptation applied`);

  // 🧬 AWARENESS-ADAPTIVE PROMPTING: Apply policy-based adaptation
  if (policy) {
    adaptivePrompt = adaptResponsePromptWithPolicy(adaptivePrompt, policy);
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to CORE path`);
    }
  }

  const response = await generateText({
    systemPrompt: adaptivePrompt,
    userInput: input,
    meta: {
      ...meta,
      coreProcessing: true,
      conversationProfile: conversationContext.profile,
      inputComplexity: 'moderate'
    }
  });

  // 🛡️ SOCRATIC VALIDATOR: Validate with regeneration capability
  let { response: validatedResponse } = await validateAndRepairResponse(
    sessionId,
    input,
    response,
    meta,
    'CORE',
    // Regeneration function for CORE path
    async (repairPrompt: string) => {
      const repairedContext = { ...context };
      let repairedPrompt = buildMaiaWisePrompt(repairedContext, input, conversationHistory);

      // 🧬 AWARENESS-ADAPTIVE PROMPTING: Apply policy to regeneration as well
      if (policy) {
        repairedPrompt = adaptResponsePromptWithPolicy(repairedPrompt, policy);
        if (process.env.DEBUG_CONSCIOUSNESS === '1') {
          console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to CORE regeneration`);
        }
      }

      repairedPrompt = repairedPrompt + '\n\n' + repairPrompt;

      return await generateText({
        systemPrompt: repairedPrompt,
        userInput: input,
        meta: {
          ...meta,
          coreProcessing: true,
          regeneration: true,
          conversationProfile: conversationContext.profile
        }
      });
    }
  );

  // 🎭 MODE-AWARE POST-PROCESSING: Filter mode-inappropriate language
  const mode = normalizeMode(meta.mode);
  validatedResponse = filterModeLanguage(validatedResponse, input, mode);

  return validatedResponse;
}

/**
 * DEEP Path: Full consciousness orchestration for complex topics + Claude consultation
 * Target: 6-20s response time (now includes Claude consciousness consultation)
 */
async function deepPathResponse(
  sessionId: string,
  input: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): Promise<{ response: string; consciousnessData?: any; socraticValidation?: any }> {
  console.log(`🧠 DEEP PATH: Full consciousness orchestration + Claude consultation activated`);

  // 🧬 CONSCIOUSNESS POLICY (full depth for DEEP path)
  const userId = (meta as any).userId;
  const policy = userId ? await getConsciousnessPolicy(userId, input) : null;

  if (policy) {
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Policy] Level ${policy.awarenessLevel} (${policy.awarenessName}), Element: ${policy.dominantElement}, Explicitness: ${policy.explicitness}, Beads: ${policy.totalBeads}`);
    }
    (meta as any).consciousnessPolicy = policy;
  }

  // Full conversation analysis
  const conversationContext = conversationElementalTracker.processMessage(sessionId, input, conversationHistory);

  // 🌀 PANCONSCIOUS FIELD ROUTING (Field Safety Gate)
  const cognitiveProfile = (meta as any).cognitiveProfile ?? null;
  const bloomDetectionForField = (meta as any).bloomDetection as BloomDetection | undefined;

  // Safe access to profile properties (dominantFacet/dominantArchetype may not exist on type)
  const profile = conversationContext?.profile as any;

  const fieldRouting = routePanconsciousField({
    cognitiveProfile,
    element: conversationContext?.profile?.dominantElement ?? null,
    facet: profile?.dominantFacet ?? profile?.facet ?? null,
    archetype: profile?.dominantArchetype ?? profile?.archetype ?? null,
    bloomLevel: bloomDetectionForField?.numericLevel ?? null,
  });

  // Attach to meta so downstream agents can respect it
  (meta as any).fieldRouting = fieldRouting;
  console.log(
    `🌌 [Panconscious Field] realm=${fieldRouting.realm}, safe=${fieldRouting.fieldWorkSafe}, ` +
      `deepRecommended=${fieldRouting.deepWorkRecommended}`,
  );

  // 🧠 THE DIALECTICAL SCAFFOLD - Extract cognitive level for DEEP path
  const bloomDetection = (meta as any).bloomDetection as BloomDetection | undefined;
  let cognitiveScaffoldingNote = '';

  if (bloomDetection?.scaffoldingPrompt) {
    const levelName = bloomDetection.level;
    const nextLevel = bloomDetection.numericLevel + 1;

    cognitiveScaffoldingNote = `\n\n🧠 COGNITIVE SCAFFOLDING (Dialectical Scaffold):
User is currently at Bloom Level ${bloomDetection.numericLevel} (${levelName}).
Pull them toward Level ${nextLevel} by incorporating this Socratic question naturally:
"${bloomDetection.scaffoldingPrompt}"

Do NOT mention Bloom's Taxonomy explicitly. The scaffolding should feel organic and conversational.`;

    console.log(`🧠 [Dialectical Scaffold] DEEP path scaffolding prepared: Level ${bloomDetection.numericLevel} → ${nextLevel}`);
  }

  // Build enhanced consciousness context
  const consciousnessContext: ConsciousnessContext = {
    sessionId,
    userId: sessionId,
    conversationHistory,
    currentDepth: depthFromRelationship(conversationContext.profile.relationshipDepth),
    elementalResonance: elementalTrendToResonance(conversationContext.profile.elementalTrend),
    observerLevel: Math.max(1, Math.min(conversationHistory.length + 1, 7)),
    temporalWindow: conversationContext.profile.conversationPhase === 'transcending' ? 'eternal' : 'present',
    metaAwareness: conversationContext.profile.conversationPhase === 'transcending' || conversationContext.profile.dominantElement === 'aether'
  };

  // STEP 1: MAIA generates initial response using local consciousness processing
  // ⚡ Fail-fast wrapper: if deepseek is slow/unavailable, proceed to Opus without blocking
  let consciousnessResponse: any = null;
  let maiaInitialResponse: string;

  try {
    consciousnessResponse = await Promise.race([
      consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('consciousness-stage-timeout')), 4500)
      )
    ]);

    maiaInitialResponse = consciousnessResponse.response;

    console.log(`🎯 MAIA initial consciousness processing complete:`);
    console.log(`   Layers activated: ${consciousnessResponse.layersActivated.join(', ')}`);
    console.log(`   Depth achieved: ${consciousnessResponse.depth}`);
  } catch (err: any) {
    console.warn(`⚠️ [DEEP] Skipping local consciousness stage (slow/unavailable): ${err?.message || err}`);

    // Fallback: generate simple attunement response for Opus to enhance
    maiaInitialResponse = `I'm here with you. Let's explore what you're bringing.`;

    console.log(`🎯 Using fallback initial response → proceeding to Opus consultation`);
  }

  // STEP 2: Determine consultation type based on conversation context
  const consultationType: ConsultationType = determineConsultationType(input, conversationContext, meta);

  // STEP 3: Claude consciousness consultation (enhancing, not replacing)
  let finalResponse = maiaInitialResponse;
  let consultationData: any = null;

  // Only consult Claude if Anthropic API key is available
  const hasClaudeAccess = process.env.ANTHROPIC_API_KEY || meta.claudeAvailable;

  if (hasClaudeAccess) {
    try {
      console.log(`🧠 Consulting Claude for ${consultationType} enhancement...`);

      const consultation = await consultClaudeForConsciousness({
        userInput: input,
        maiaInitialResponse: maiaInitialResponse + cognitiveScaffoldingNote, // 🧠 Inject scaffolding into MAIA's initial response for Claude to integrate
        conversationContext: conversationHistory.slice(-5).map(ex => ({
          userMessage: ex.userMessage || '',
          maiaResponse: ex.maiaResponse || ''
        })),
        consultationType,
        sessionMetadata: {
          turnCount: conversationHistory.length + 1,
          relationshipDepth: conversationContext.profile.relationshipDepth,
          emotionalIntensity: conversationContext.profile.dominantElement === 'fire' ? 'high' :
                             conversationContext.profile.dominantElement === 'water' ? 'medium' : 'low',
          recentRuptures: meta.recentRuptures as boolean || false
        }
      });

      // STEP 4: MAIA integrates consultation (maintains sovereignty)
      finalResponse = await maiaIntegrateConsultation(
        maiaInitialResponse,
        consultation,
        { conversationContext, meta }
      );

      consultationData = {
        consultationType,
        attunementScore: consultation.responseQuality.attunementScore,
        fieldReading: consultation.fieldReading,
        enhancementUsed: consultation.integrationGuidance.useEnhanced,
        consultationReasoning: consultation.integrationGuidance.reasoning
      };

      console.log(`✅ Claude consultation integrated | Type: ${consultationType} | Enhancement: ${consultation.integrationGuidance.useEnhanced ? 'Used' : 'Declined'}`);
    } catch (consultationError) {
      console.warn('⚠️ Claude consultation failed, using MAIA original response:', consultationError);
      // Gracefully continue with MAIA's original response + scaffolding
      if (cognitiveScaffoldingNote) {
        finalResponse = maiaInitialResponse + '\n\n' + cognitiveScaffoldingNote;
      }
    }
  } else {
    console.log(`⚠️ Claude consultation unavailable (no API key) - using MAIA original response`);
    // If no Claude, inject scaffolding directly into response
    if (cognitiveScaffoldingNote) {
      finalResponse = maiaInitialResponse + '\n\n' + cognitiveScaffoldingNote;
      console.log(`🧠 [Dialectical Scaffold] DEEP path scaffolding injected directly (no Claude)`);
    }
  }

  // 🛡️ SOCRATIC VALIDATOR: Validate with full regeneration capability
  const { response: validatedResponse, validation } = await validateAndRepairResponse(
    sessionId,
    input,
    finalResponse,
    meta,
    'DEEP',
    // Regeneration function for DEEP path - re-run consciousness orchestration
    async (repairPrompt: string) => {
      console.log('🔧 [DEEP] Re-running consciousness orchestration with repair guidance...');

      // Build repair context (DEEP path uses consciousness wrapper, minimal context needed)
      const repairedContext: MaiaContext = {
        sessionId,
        summary: `Repair attempt for: ${input}`,
        memberProfile: conversationContext.memberProfile,
        wisdomAdaptation: conversationContext.wisdomAdaptation,
        consciousnessInsights: {
          dominantElement: conversationContext.profile.dominantElement,
          processingStrategy: 'deep',
          relationshipDepth: conversationContext.profile.relationshipDepth
        },
        mode: meta.mode as 'dialogue' | 'counsel' | 'scribe' | undefined,
        conversationContext: (meta as any).conversationContext as any,
        repairGuidance: repairPrompt
      };

      const comprehensiveResult = buildMaiaComprehensivePrompt(input, repairedContext, conversationHistory);
      let repairedPrompt = comprehensiveResult.prompt;

      // 🧬 AWARENESS-ADAPTIVE PROMPTING: Apply policy to regeneration as well
      if (policy) {
        repairedPrompt = adaptResponsePromptWithPolicy(repairedPrompt, policy);
        if (process.env.DEBUG_CONSCIOUSNESS === '1') {
          console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to DEEP regeneration`);
        }
      }

      return await generateText({
        systemPrompt: repairedPrompt + '\n\n' + repairPrompt,
        userInput: input,
        meta: {
          ...meta,
          deepProcessing: true,
          regeneration: true,
          conversationProfile: conversationContext.profile,
          consciousnessDepth: 'full'
        }
      });
    }
  );

  return {
    response: validatedResponse,
    socraticValidation: validation,
    consciousnessData: {
      layersActivated: consciousnessResponse.layersActivated,
      depth: consciousnessResponse.depth,
      observerInsights: consciousnessResponse.observerInsights,
      evolutionTriggers: consciousnessResponse.evolutionTriggers,
      claudeConsultation: consultationData
    }
  };
}

/**
 * Determines the appropriate Claude consultation type based on conversation context
 */
function determineConsultationType(
  input: string,
  conversationContext: any,
  meta: Record<string, unknown>
): ConsultationType {
  const inputLower = input.toLowerCase();

  // Rupture detection
  if (inputLower.includes('wrong') || inputLower.includes('bullshit') ||
      inputLower.includes('stupid') || inputLower.includes("don't understand") ||
      meta.recentRuptures) {
    return 'rupture-repair';
  }

  // Archetypal pattern detection
  if (inputLower.includes('mother') || inputLower.includes('father') ||
      inputLower.includes('shadow') || inputLower.includes('pattern') ||
      conversationContext.profile.dominantElement === 'aether') {
    return 'archetypal-guidance';
  }

  // Depth navigation for complex psychological content
  if (inputLower.includes('spiritual') || inputLower.includes('meaning') ||
      inputLower.includes('purpose') || inputLower.includes('death') ||
      conversationContext.profile.relationshipDepth === 'deep') {
    return 'depth-navigation';
  }

  // Field reading for subtle/complex emotional content
  if (conversationContext.profile.dominantElement === 'water' ||
      conversationContext.profile.emotionalIntensity === 'high') {
    return 'field-reading';
  }

  // Default to relational enhancement
  return 'relational-enhancement';
}

export async function getMaiaResponse(req: MaiaRequest): Promise<MaiaResponse> {
  const { sessionId, input, meta = {}, includeAudio = false, voiceProfile } = req;
  const startTime = Date.now();

  // increment turn count for this session
  await incrementTurnCount(sessionId);

  try {
    // Get conversation history for context
    const conversationHistory = await getConversationHistory(sessionId, 10);
    const turnCount = conversationHistory.length + 1;

    // 🛡️ FIELD SAFETY GATE: Check ALL paths (FAST/CORE/DEEP) before any processing
    const userId = (meta as any).userId;
    let cognitiveProfile = null;
    let fieldSafety = null;

    if (userId || sessionId) {
      try {
        cognitiveProfile = await getCognitiveProfile(userId || sessionId);

        if (cognitiveProfile) {
          fieldSafety = enforceFieldSafety({
            cognitiveProfile,
            element: (meta as any).element,
            userName: (meta as any).userName,
            context: 'maia',
          });

          // If not safe, return boundary message immediately (before Bloom, router, etc.)
          if (!fieldSafety.allowed) {
            console.log(
              `🛡️  [Field Safety - Service] Blocked - avg=${cognitiveProfile.rollingAverage.toFixed(2)}, ` +
                `fieldWorkSafe=false`,
            );

            const text = fieldSafety.message ?? "Let's take the safest next step together.";
            await addConversationExchange(sessionId, input, text, {
              ...meta,
              fieldRouting: fieldSafety.fieldRouting,
              fieldWorkSafe: false,
              processingProfile: 'FAST',
              processingTimeMs: Date.now() - startTime,
            });

            return {
              text,
              processingProfile: 'FAST',
              processingTimeMs: Date.now() - startTime
            };
          }

          // Attach field routing to meta for downstream use
          (meta as any).fieldRouting = fieldSafety.fieldRouting;
          (meta as any).fieldWorkSafe = true;
          (meta as any).cognitiveProfile = cognitiveProfile;
        }
      } catch (err) {
        console.warn('⚠️  [Field Safety - Service] Could not fetch cognitive profile:', err);
      }
    }

    // 🧠 THE DIALECTICAL SCAFFOLD - Detect HOW user thinks (not just WHAT they know)
    // Socratic questioning + developmental support: guides users from consumption → creation
    let bloomDetection: BloomDetection | null = null;
    let bloomMeta: BloomCognitionMeta | undefined = undefined;

    try {
      bloomDetection = detectBloomLevel(input, {
        history: conversationHistory?.map((t: any) => ({
          role: t.role || 'user',
          content: t.userMessage || t.content || ''
        }))
      });

      bloomMeta = {
        bloomLevel: bloomDetection.level,
        bloomNumericLevel: bloomDetection.numericLevel,
        bloomScore: bloomDetection.score,
        rationale: bloomDetection.rationale
      };

      // Log cognitive level for visibility
      console.log('🧠 [Dialectical Scaffold]', {
        level: bloomDetection.level,
        numericLevel: bloomDetection.numericLevel,
        score: Number(bloomDetection.score.toFixed(2)),
        rationale: bloomDetection.rationale
      });

      // Attach to meta for response path functions
      (meta as any).bloomDetection = bloomDetection;

      // 🗃️ PHASE 1: POSTGRES PERSISTENCE - Log cognitive turn event
      // Fire-and-forget: never blocks MAIA response
      if (userId) {
        logCognitiveTurn({
          userId,
          sessionId,
          turnIndex: turnCount,
          bloom: {
            level: bloomDetection.numericLevel,
            numericLevel: bloomDetection.numericLevel,
            score: bloomDetection.score,
            label: bloomDetection.level,
            scaffoldingPrompt: bloomDetection.scaffoldingPrompt,
          },
          scaffoldingUsed: false, // Will be set to true after voice system injects scaffolding
        }).catch(err => {
          // Log but don't throw - fire-and-forget pattern
          console.error('[Dialectical Scaffold] Failed to log cognitive turn (non-blocking):', err);
        });
      } else {
        // Fallback: Use sessionId as userId for anonymous sessions
        // TODO: Replace with proper auth-based userId when available
        logCognitiveTurn({
          userId: sessionId, // Temporary fallback
          sessionId,
          turnIndex: turnCount,
          bloom: {
            level: bloomDetection.numericLevel,
            numericLevel: bloomDetection.numericLevel,
            score: bloomDetection.score,
            label: bloomDetection.level,
            scaffoldingPrompt: bloomDetection.scaffoldingPrompt,
          },
          scaffoldingUsed: false,
        }).catch(err => {
          console.error('[Dialectical Scaffold] Failed to log cognitive turn (non-blocking):', err);
        });
      }
    } catch (err) {
      // Fail-safe: never crash the request if cognitive detection fails
      console.error('[Dialectical Scaffold] Detection error:', err);
      // Continue without Bloom detection - MAIA can still function
      bloomDetection = null;
      bloomMeta = undefined;
    }

    // 🧠 MYTHIC ATLAS CLASSIFICATION (Bridge v1 - Semantic Anchoring)
    let atlasResult: AtlasResult | null = null;

    try {
      atlasResult = await getMythicAtlasContext({
        input,
        sessionId,
      });
    } catch (err) {
      console.error('[MAIA] Mythic Atlas classification failed:', err);
      // Continue without atlas - MAIA can still function
    }

    // 🔮 MEMORY RECALL: Get resonant memories for context (mode-aware + lightweight)
    let memoryField: MemoryField | null = null;
    try {
      const activeMode = normalizeMode((meta as any)?.mode);
      const recallKey = userId || sessionId;

      console.log(`🎭 [MODE] activeMode=${activeMode} userId=${userId ?? 'none'} sessionId=${sessionId ?? 'none'}`);

      // Scribe = Fathom capture: prefer FAST; only recall if explicitly escalated
      const allowRecall =
        activeMode === 'counsel' ||
        activeMode === 'dialogue' ||
        (activeMode === 'scribe' && isScribeEscalation(input));

      if (recallKey && allowRecall) {
        const recallStart = Date.now();

        memoryField = await lattice.resonanceRecall(recallKey, {
          query: input,
          facet: atlasResult?.facet
            ? { element: atlasResult.element, phase: atlasResult.phase, code: atlasResult.facet }
            : undefined,
        });

        // Dialogue = light recall + relational continuity: clamp what we *use* (fast + stable)
        if (activeMode === 'dialogue' && memoryField) {
          memoryField = {
            ...memoryField,
            nodes: (memoryField.nodes || []).slice(0, 3),
            stuckPatterns: (memoryField.stuckPatterns || []).slice(0, 1),
            breakthroughMoments: (memoryField.breakthroughMoments || []).slice(0, 1),
          } as typeof memoryField;
        }

        // Scribe escalation: still clamp (scribe should not balloon into long psychoanalysis)
        if (activeMode === 'scribe' && memoryField) {
          memoryField = {
            ...memoryField,
            nodes: (memoryField.nodes || []).slice(0, 2),
            stuckPatterns: [],
            breakthroughMoments: (memoryField.breakthroughMoments || []).slice(0, 1),
          } as typeof memoryField;
        }

        console.log(
          `🔮 [MEMORY] Recalled ${memoryField?.nodes?.length ?? 0} resonant memories ` +
          `(${activeMode}) in ${Date.now() - recallStart}ms`
        );
        if (memoryField && memoryField.stuckPatterns && memoryField.stuckPatterns.length > 0) {
          console.log(`⚠️  [MEMORY] Detected ${memoryField.stuckPatterns.length} stuck patterns`);
        }
        if (memoryField && memoryField.breakthroughMoments && memoryField.breakthroughMoments.length > 0) {
          console.log(`✨ [MEMORY] Found ${memoryField.breakthroughMoments.length} breakthrough moments`);
        }
      }
    } catch (memErr) {
      console.error('⚠️  [MEMORY] Recall failed (non-blocking):', memErr);
      // Memory should never block the conversation
      memoryField = null;
    }

    // 🎯 DELIBERATION GATE (Phase 2 Integration Point)
    const GAP_THRESHOLD = 15; // percent - matches Python backend threshold
    let finalFacet = atlasResult?.primary ?? 'UNKNOWN::UNKNOWN';
    let finalConfidence = atlasResult?.confidence ?? 0.0;

    const shouldDeliberate =
      !!atlasResult &&
      (atlasResult.deliberationRecommended === true ||
        (typeof atlasResult.gapPercent === 'number' &&
          atlasResult.gapPercent < GAP_THRESHOLD));

    if (atlasResult) {
      console.log('🧭 [MAIA] Mythic Atlas Classification:', {
        primary: atlasResult.primary,
        facet: atlasResult.facet,
        archetype: atlasResult.archetype,
        element: atlasResult.element,
        phase: atlasResult.phase,
        confidence: atlasResult.confidence,
        gapPercent: atlasResult.gapPercent,
        deliberationRecommended: atlasResult.deliberationRecommended,
        shouldDeliberate,
      });
    }

    // 🚨 DELIBERATION HOOK (Phase 2 - Committee Integration Point)
    if (shouldDeliberate) {
      console.warn('⚠️  [MAIA] Atlas uncertainty detected → deliberation suggested');
      console.log('   Primary:', atlasResult?.primary);
      console.log('   Confidence:', atlasResult?.confidence);
      console.log('   Gap:', atlasResult?.gapPercent + '%');
      console.log('   Top alternatives:', atlasResult?.alternatives.slice(0, 3).map(a =>
        `${a.label} (${(a.score * 100).toFixed(1)}%)`
      ).join(', '));

      // Store deliberation metadata for logging
      meta.deliberation = {
        trigger: atlasResult?.deliberationRecommended
          ? 'ATLAS_UNCERTAIN'
          : 'MIXED_SIGNALS',
        atlas: {
          primary: atlasResult?.primary,
          confidence: atlasResult?.confidence ?? 0.0,
          gapPercent: atlasResult?.gapPercent ?? 0.0,
          alternatives: atlasResult?.alternatives ?? [],
        },
      };

      // TODO Phase 2: Call committee deliberation here
      // const deliberationRequest: DeliberationRequest = {
      //   sessionId,
      //   input,
      //   trigger: meta.deliberation.trigger,
      //   atlas: meta.deliberation.atlas,
      //   meta,
      // };
      // const committee = buildDefaultCommittee();
      // const result = await runCommittee(deliberationRequest, committee);
      // finalFacet = result.finalClassification;
      // finalConfidence = result.finalConfidence;
    }

    // 🎯 CONTENT-BASED PROCESSING ROUTER using sophisticated MaiaConversationRouter
    // Phase 2: Now with cognitive profile awareness
    const routerResult = await maiaConversationRouter.chooseProcessingProfile({
      message: input,
      turnCount,
      conversationHistory,
      userId: userId || undefined,
      sessionId: userId ? undefined : sessionId, // Fallback to sessionId if no userId
      // Pass atlas context to router (future: use for elemental routing)
      atlasContext: atlasResult ? {
        facet: finalFacet,
        confidence: finalConfidence,
        element: atlasResult.element,
        phase: atlasResult.phase,
      } : undefined,
    });
    const processingProfile = routerResult.profile;

    // Attach cognitive profile to meta for downstream services
    if (routerResult.meta?.cognitiveProfile) {
      (meta as any).cognitiveProfile = routerResult.meta.cognitiveProfile;
    }

    console.log(`🚦 Processing Profile: ${processingProfile} | Turn ${turnCount} | Length: ${input.length}`);
    console.log(`🧠 Router reasoning: ${routerResult.reasoning}`);

    let rawResponse: string;
    let consciousnessData: any = null;

    // Route to appropriate processing path
    switch (processingProfile) {
      case 'FAST':
        rawResponse = await fastPathResponse(sessionId, input, conversationHistory, meta);
        break;

      case 'CORE':
        rawResponse = await corePathResponse(sessionId, input, conversationHistory, meta);
        break;

      case 'DEEP':
        const deepResult = await deepPathResponse(sessionId, input, conversationHistory, meta);
        rawResponse = deepResult.response;
        consciousnessData = deepResult.consciousnessData;
        break;

      default:
        // Fallback to FAST
        rawResponse = await fastPathResponse(sessionId, input, conversationHistory, meta);
        break;
    }

    // Apply MAIA's voice sanitization
    const text = sanitizeMaiaOutput(rawResponse);
    let audioResponse: Buffer | undefined;

    // 🎤 VOICE SYNTHESIS: MAIA's mind (Claude/local) vs MAIA's voice (OpenAI TTS)
    if (includeAudio) {
      try {
        console.log(`🎤 Synthesizing MAIA's voice...`);

        // Auto-select voice profile if not specified
        const finalVoiceProfile = voiceProfile || selectVoiceProfile(text, processingProfile);

        // Synthesize voice using OpenAI TTS (thinking already done by Claude/local)
        audioResponse = await synthesizeMaiaVoice({
          text,
          voiceProfile: finalVoiceProfile as any,
          format: 'mp3'
        });

        console.log(`✅ Voice synthesis complete: ${audioResponse.synthesisTimeMs}ms | ${finalVoiceProfile} profile`);
      } catch (voiceError) {
        console.error('❌ Voice synthesis failed (continuing with text-only):', voiceError);
        // Voice failure doesn't break the conversation - continue with text only
      }
    }

    const processingTimeMs = Date.now() - startTime;

    // Store conversation exchange
    await addConversationExchange(sessionId, input, text, {
      ...meta,
      processingProfile,
      processingTimeMs,
      consciousnessData: consciousnessData || undefined,
      audioIncluded: !!audioResponse,
      // Store Mythic Atlas classification for learning/analysis
      mythicAtlas: atlasResult ? {
        primary: atlasResult.primary,
        facet: atlasResult.facet,
        archetype: atlasResult.archetype,
        element: atlasResult.element,
        phase: atlasResult.phase,
        confidence: atlasResult.confidence,
        gapPercent: atlasResult.gapPercent,
        deliberationRecommended: atlasResult.deliberationRecommended,
      } : undefined,
      // Store Bloom's cognitive level for learning/analysis
      cognition: bloomMeta,
    });

    // ✨ MEMORY INTEGRATION: Form memory from this conversation (mode-aware)
    try {
      const activeMode = normalizeMode((meta as any)?.mode);
      const memoryKey = userId ?? sessionId;

      // Check if this message should be elevated to lattice (prevents Scribe pollution)
      const shouldElevate = shouldElevateToLattice(input, activeMode);

      if (memoryKey && shouldElevate) {
        const conversationEvent: ConsciousnessEvent = {
          type: 'mental',
          insight: `${input} → ${text.substring(0, 500)}`,
          cognitiveLevel: bloomDetection?.numericLevel || 3,
          bypassing: false,
          timestamp: new Date(),
          traceId: (meta as any).traceId ?? randomUUID(), // Cryptographic proof linkage (always present)
        };

        console.log(`🔬 [MEMORY] TraceId: ${conversationEvent.traceId || 'none'} (mode: ${activeMode}, elevated: ${shouldElevate})`);

        const memoryResult = await lattice.integrateEvent(
          memoryKey,
          conversationEvent,
          atlasResult?.facet ? {
            element: atlasResult.element,
            phase: atlasResult.phase,
            code: atlasResult.facet
          } : { element: 'EARTH', phase: 1, code: 'EARTH-1' },
          { name: 'current', age: (meta as any).userAge || 30 }
        );

        console.log(`✨ [MEMORY] Memory ${memoryResult.memoryFormed ? 'FORMED' : 'logged'}, Patterns: ${memoryResult.patternsDetected.length}`);
        if (memoryResult.insights.length > 0) {
          console.log(`💡 [MEMORY] Insights: ${memoryResult.insights.join(', ')}`);
        }
      } else if (memoryKey && !shouldElevate) {
        console.log(`⏭️  [MEMORY] Skipped lattice elevation (mode: ${activeMode}, scribe capture only)`);
      }

      // 🔮 SEMANTIC EMBEDDING: Store vector for semantic search (mode-aware)
      try {
        // Note: activeMode already declared above at line 1063
        // Scribe = Fathom capture: NO embeddings unless explicit escalation
        // Dialogue = optional embeddings only when message is "substantive"
        // Counsel = embeddings always (or almost always)
        const shouldEmbed =
          activeMode === 'counsel' ||
          (activeMode === 'dialogue' && input.trim().split(/\s+/).length >= 18) ||
          (activeMode === 'scribe' && isScribeEscalation(input));

        if (!memoryKey || !shouldEmbed) {
          // Keep conversation flowing; skip expensive work
          if (process.env.DEBUG_SEMANTIC === '1') {
            console.log(`[SEMANTIC] Skipping embedding: mode=${activeMode}, shouldEmbed=${shouldEmbed}`);
          }
        } else {
          const DEBUG_SEMANTIC = process.env.DEBUG_SEMANTIC === '1';

          if (DEBUG_SEMANTIC) {
            console.log(`[SEMANTIC] Starting embedding generation (mode=${activeMode})...`);
          }

          const { generateLocalEmbedding } = await import('../memory/embeddings');
          const { query: dbQuery } = await import('../db/postgres');

          // Create semantic text from conversation exchange
          const semanticText = `User: ${input}\n\nMAIA: ${text.substring(0, 1000)}`;

          if (DEBUG_SEMANTIC) {
            console.log(`[SEMANTIC] Generating embedding for ${semanticText.length} chars...`);
          }

          const embedding = await generateLocalEmbedding(semanticText);

          if (DEBUG_SEMANTIC) {
            console.log(`[SEMANTIC] Embedding generated: ${embedding?.length || 0} dims`);
          }

          // Validate embedding before insert
          if (embedding && embedding.length === 768) {
            // Prepare metadata with context
            const metadata = {
              facet: atlasResult?.facet || null,
              emotion: atlasResult?.primary_emotion || null,
              timestamp: new Date().toISOString(),
              mode: activeMode
            };

            // Store in semantic_memory_vectors (dedicated retrieval table)
            await dbQuery(
              `INSERT INTO semantic_memory_vectors (
                user_id, chunk_text, chunk_type, metadata, vector_embedding, created_at
              ) VALUES ($1, $2, $3, $4, $5::vector, NOW())`,
              [
                memoryKey,
                semanticText,
                'conversation',
                JSON.stringify(metadata),
                `[${embedding.join(',')}]` // pgvector format with explicit cast
              ]
            );

            if (DEBUG_SEMANTIC) {
              console.log(`🔮 [SEMANTIC] Vector stored: ${embedding.length} dims, mode=${activeMode}, facet=${metadata.facet}`);
            }
          } else {
            console.warn(`⚠️  [SEMANTIC] Skipping insert: embedding.length=${embedding?.length || 0} (expected 768)`);
          }
        }
      } catch (embErr) {
        console.error('⚠️  [SEMANTIC] Embedding storage failed (non-blocking):', embErr);
      }
    } catch (memErr) {
      console.error('⚠️  [MEMORY] Integration failed (non-blocking):', memErr);
      // Memory formation should never block the conversation
    }

    // 🧠 SOVEREIGN LEARNING INTEGRATION: Log conversation turn
    try {
      // Direct call to training service (avoid server-side fetch with relative URL)
      const { logMaiaTurn } = await import('../learning/maiaTrainingDataService');

      const turnId = await logMaiaTurn(
        sessionId,
        turnCount - 1, // Turn index is 0-based
        input,
        text,
        processingProfile,
        {
          primaryEngine: meta.engine as string || 'deepseek-r1',
          latencyMs: processingTimeMs,
          element: meta.element as string,
          consciousnessData: consciousnessData,
          usedClaudeConsult: consciousnessData?.claudeConsultation ? true : false,
          cognition: bloomMeta
        }
      );

      // Store turnId in response metadata for feedback widget
      meta.turnId = turnId;

      console.log(`🧠 Learning integration complete | Turn: ${turnId} | Profile: ${processingProfile}`);
    } catch (learningError) {
      console.warn('⚠️ Learning system error (conversation continues):', learningError);
      // Learning failures don't break the conversation - MAIA continues normally
    }

    console.log(`✅ MAIA ${processingProfile} response complete: ${processingTimeMs}ms | ${text.length} chars${audioResponse ? ` + audio (${audioResponse.voiceProfile})` : ''}`);

    return {
      text,
      processingProfile,
      processingTimeMs,
      audio: audioResponse
    };

  } catch (error) {
    console.error('❌ MAIA processing failed:', error);
    const processingTimeMs = Date.now() - startTime;

    const text = "That last response didn't come out the way I intended. You're right to expect the focus to stay on you. Let's reset: what would feel most useful to talk about right now—support, clarity, or just a place to vent?";

    return {
      text,
      processingProfile: 'FAST',
      processingTimeMs
    };
  }
}
