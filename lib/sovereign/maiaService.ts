// backend: lib/sovereign/maiaService.ts
import { randomUUID } from 'crypto';
import { incrementTurnCount, addConversationExchange, getConversationHistory } from './sessionManager';
import { buildMaiaWisePrompt, buildMaiaComprehensivePrompt, sanitizeMaiaOutput, MaiaContext } from './maiaVoice';
import { generateText, type ProviderMeta } from '../ai/modelService';
import { consciousnessOrchestrator } from '../orchestration/consciousness-orchestrator';
import { consciousnessWrapper, type ConsciousnessContext } from '../consciousness/consciousness-layer-wrapper';
import { elementalRouter } from '../consciousness/elemental-context-router';
import { conversationElementalTracker } from '../consciousness/conversation-elemental-tracker';
import { maiaConversationRouter, type ProcessingProfile } from '../consciousness/processingProfiles';
import { buildTimeoutFallback } from '../consciousness/maiaFallbacks';
import { synthesizeMaiaVoice } from '../voice/maiaVoiceService';
import { consultClaudeForConsciousness, maiaIntegrateConsultation, type ConsultationType } from '../consciousness/claudeConsciousnessService';
// Dead imports removed: LearningSystemOrchestrator, ConversationTurnService
import { getMythicAtlasContext, type AtlasResult } from '../services/mythicAtlasService';
import {
  detectBloomLevel,
  type BloomDetection
} from '../consciousness/bloomCognition';
import { logCognitiveTurn } from '../consciousness/cognitiveEventsService';
import type { BloomCognitionMeta } from '../types/maia';
import { routePanconsciousField } from '../field/panconsciousFieldRouter';
import { enforceFieldSafety, type FieldSafetyDecision } from '../field/enforceFieldSafety';
import { getCognitiveProfile, type CognitiveProfile } from '../consciousness/cognitiveProfileService';
import { validateSocraticResponse, type SocraticValidationResult } from '../validation/socraticValidator';
import { lattice } from '../memory/ConsciousnessMemoryLattice';
import type { ConsciousnessEvent, SpiralFacet, LifePhase, MemoryField } from '../memory/ConsciousnessMemoryLattice';
import { containsSensitiveData } from '../memory/sensitivePatterns';
import {
  adaptResponsePromptWithPolicy,
  createConsciousnessPolicy,
  userRequestedFrameworks,
  inferAwarenessLevel,
  type AwarenessLevel,
  type ConsciousnessPolicy
} from '../consciousness/awareness-levels';
import {
  loadRelationshipMemory,
  formatRelationshipMemoryForPrompt,
  type RelationshipMemoryContext
} from '../memory/RelationshipMemoryService';
import { TurnsStore } from '../memory/stores/TurnsStore';
import { assessAINResponseShape, AIN_NO_MENU_REWRITE_PROMPT } from '../ai/quality/ainResponseShape';
import { logAINShapeTelemetry } from '../db/ainShapeTelemetry';

// Mode-aware memory gating helpers
function normalizeMode(mode: unknown): 'dialogue' | 'counsel' | 'scribe' {
  return mode === 'counsel' || mode === 'scribe' || mode === 'dialogue' ? mode : 'dialogue';
}

/**
 * Filter mode-inappropriate language from responses
 * DeepSeek-R1 often ignores system prompts, so we post-process
 *
 * IMPORTANT: Never override substantive content (>60 chars) - only filter
 * empty/short responses or obvious service language in greetings.
 */
function filterModeLanguage(response: string, userInput: string, mode: 'dialogue' | 'counsel' | 'scribe'): string {
  // Guard: never override substantive content
  if (!userInput?.trim()) return "Hey — what's on your mind?";
  if (response?.trim().length > 60) return response;

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

    if (hasServiceLanguage && isGreeting) {
      // Natural conversational greetings (Talk mode style - elegant but no service language)
      const nlpGreetings = [
        "Hey there. Good to see you.",
        "Hi. How's it going?",
        "Hey. Nice to connect.",
        "Hi there. What's on your mind?",
        "Hey. How are things?",
        "Good to see you. What's happening?",
        "Hi. How have you been?"
      ];
      return nlpGreetings[Math.floor(Math.random() * nlpGreetings.length)];
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

    if (hasGenericGreeting && isGreeting) {
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

// 🌀 SELFLET PHASE 2F: Unified delivery guard (all paths)
const SELFLET_MARKER = '\u2063\u2063\u2063'; // invisible marker (prevents double-prepend)

interface SelfletDeliveryContext {
  requiredAcknowledgment?: string;
  surfacedMessagePrompt?: string;
}

/**
 * Apply selflet delivery guard - ensures past-self message acknowledgment appears exactly once.
 * Used at FAST, CORE, and DEEP path exit points.
 *
 * Edge cases handled:
 * 1. Marker already present → no change (idempotent)
 * 2. Ack text present but no marker → inject marker after ack
 * 3. Neither present → prepend both
 */
function applySelfletDeliveryGuard(
  response: string,
  selfletContext?: SelfletDeliveryContext
): string {
  const requiredAck = selfletContext?.requiredAcknowledgment;
  if (!requiredAck) return response;

  // If marker exists, we're done (idempotent).
  if (response.includes(SELFLET_MARKER)) return response;

  // If ack exists but marker doesn't, inject marker right after the ack.
  // This handles models that incorporate the ack but skip the marker.
  if (response.includes(requiredAck)) {
    return response.replace(requiredAck, requiredAck + SELFLET_MARKER);
  }

  // Otherwise prepend both.
  console.log('[SELFLET] Prepending past-self acknowledgment');
  return requiredAck + SELFLET_MARKER + response;
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
  provider?: ProviderMeta;  // 🔮 Sovereignty auditing: which model served this response
};

type MaiaRequest = {
  sessionId: string;
  input: string;
  meta?: Record<string, unknown> & {
    reqId?: string | null;  // Correlation with [Audit:*] logs
  };
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
): Promise<{ response: string; provider: ProviderMeta }> {
  console.log(`⚡ FAST PATH: Simple response with core MAIA voice`);

  // 🧬 CONSCIOUSNESS POLICY (lightweight for FAST path)
  const userId = (meta as any).userId;
  // 🔑 EFFECTIVE USER ID for cross-session recall
  const effectiveUserId =
    userId ??
    (meta as any)?.explorerId ??
    (meta as any)?.memberId ??
    (meta as any)?.user?.id ??
    null;
  const policy = effectiveUserId ? await getConsciousnessPolicy(effectiveUserId, input) : null;

  if (policy) {
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Policy] Level ${policy.awarenessLevel} (${policy.awarenessName}), Element: ${policy.dominantElement}, Explicitness: ${policy.explicitness}, Beads: ${policy.totalBeads}`);
    }
    (meta as any).consciousnessPolicy = policy;
  }

  // 🌊 RELATIONSHIP MEMORY (load relational context)
  let relationshipMemory: RelationshipMemoryContext | null = null;
  if (userId) {
    try {
      relationshipMemory = await loadRelationshipMemory(userId, {
        includeThemes: true,
        includeBreakthroughs: true,
        includePatterns: false, // FAST path: skip patterns for speed
        maxThemes: 3,
        maxBreakthroughs: 1
      });
      console.log(`🌊 [Relationship Memory FAST] Loaded: ${relationshipMemory.totalEncounters} encounters, ${relationshipMemory.relationshipPhase} phase`);
    } catch (error) {
      console.warn('⚠️ Could not load relationship memory for FAST path:', error);
    }
  }

  // 🌀 SELFLET TEMPORAL MESSAGE (Phase 2E: surface past-self messages in prompt)
  const selfletContext = (meta as any)?.selfletContext;
  const selfletPromptBlock = selfletContext?.surfacedMessagePrompt ?? '';

  // Build minimal context for fast processing
  // 🔄 CROSS-SESSION RECALL: If current session is empty, load from cross-session turns
  let recentContext = '';
  if (conversationHistory.length > 0) {
    // Use current session history
    recentContext = conversationHistory.slice(-3).map(ex =>
      `User: ${ex.userMessage}\nMAIA: ${ex.maiaResponse.substring(0, 80)}...`
    ).join('\n');
  } else if (effectiveUserId) {
    // New session - load cross-session turns for continuity
    try {
      const crossSessionTurns = await TurnsStore.getRecentTurns(effectiveUserId, 6);
      if (crossSessionTurns.length > 0) {
        recentContext = crossSessionTurns.slice(-3).map(t =>
          `${t.role === 'user' ? 'User' : 'MAIA'}: ${t.content.substring(0, 100)}${t.content.length > 100 ? '...' : ''}`
        ).join('\n');
        console.log(`🔄 [Cross-Session Recall] Loaded ${crossSessionTurns.length} turns from previous sessions`);
      }
    } catch (err) {
      console.warn('⚠️ Could not load cross-session turns:', err);
    }
  }

  // 🧠 MEMORY RECALL DETECTION: Detect when user is asking about previous conversation
  const isMemoryRecallQuestion = /what (was|did|is) (my|i|the)|remember (when|what)|recall|told you|said (earlier|before)|mentioned|secret code|code phrase/i.test(input);

  let memoryRecallInstruction = '';
  if (isMemoryRecallQuestion && recentContext.length > 0) {
    memoryRecallInstruction = `\n\n🧠 MEMORY RECALL: The user is asking about something from the conversation. Check the "Recent conversation" above and give them the specific information they're asking about. Be direct and helpful - quote or reference what they said.`;
    console.log(`🧠 [Memory Recall] Detected recall question, adding instruction`);
  }

  // 🧠 MEMORY BUNDLE: Use compressed context from multi-bucket retrieval if available
  const memoryContext = (meta as any).memoryContext as string | undefined;
  const hasMemoryBundle = !!(meta as any).memoryBundle;

  // 🔒 SECURITY: If user shares sensitive data, instruct MAIA not to claim it was stored
  const sensitiveInstruction = containsSensitiveData(input)
    ? `\n\n🔒 SECURITY: The user is sharing sensitive data (passwords, codes, etc). Do NOT claim you stored or will remember it. Say you can't store secrets in memory and suggest they keep it in a secure password manager or personal vault.`
    : '';

  if (memoryContext && hasMemoryBundle) {
    console.log(`📦 [MemoryBundle] Using compressed context (${memoryContext.length} chars)`);
  }

  // Build context prompt with memory bundle OR recent context
  let contextPrompt: string;
  if (memoryContext && memoryContext.length > 0) {
    // Use memory bundle (preferred - includes relationship snapshot + ranked memories)
    contextPrompt = `${memoryContext}${memoryRecallInstruction}${sensitiveInstruction}\n\nUser: ${input}`;
  } else if (recentContext.length > 0) {
    // Fallback to simple recent context
    contextPrompt = `Recent conversation:\n${recentContext}${memoryRecallInstruction}${sensitiveInstruction}\n\nUser: ${input}`;
  } else {
    contextPrompt = `${sensitiveInstruction ? sensitiveInstruction + '\n\n' : ''}User: ${input}`;
  }

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
INSTEAD say: "Good morning, Kelly! Glad to see you back." / "Hey there. How's it going?" / "Hi. What's on your mind?" / "How have things been?"

Examples of good Talk mode greetings:
- Returning with name: "Good morning, Kelly! Glad to see you back."
- With context: "Hey Kelly, still working with that project we discussed?"
- First contact: "Hi there. Good to see you. How are you?"
- Time-aware: "Good evening, Kelly. How's it been today?"${fieldAwareness}`;
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

  // 🌊 FORMAT RELATIONSHIP MEMORY for prompt
  const relationshipContext = relationshipMemory
    ? formatRelationshipMemoryForPrompt(relationshipMemory)
    : '';

  // 🧬 AWARENESS-ADAPTIVE PROMPTING: Adapt based on developmental readiness
  let baseSystemPrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

${MAIA_RUNTIME_PROMPT}${modeAdaptation}${cognitiveScaffolding}${relationshipContext}${selfletPromptBlock ? '\n\n' + selfletPromptBlock : ''}

Current context: Simple conversation turn - respond naturally and warmly.`;

  // Apply awareness-level adaptation using policy
  if (policy) {
    baseSystemPrompt = adaptResponsePromptWithPolicy(baseSystemPrompt, policy);
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to FAST path`);
    }
  }

  // Use single model call with complete MAIA intelligence stack
  const { text: response, provider } = await generateText({
    systemPrompt: baseSystemPrompt,
    userInput: contextPrompt,
    meta: {
      ...meta,
      currentUserMessage: input, // Raw user input for routing (not full context)
      fastProcessing: true,
      engine: 'deepseek-r1', // Single reliable engine
      responseTarget: 'conversational'
    }
  });

  // 🔮 Log provider for sovereignty auditing
  if (process.env.DEBUG_CONSCIOUSNESS === '1') {
    console.log(`🔮 [FAST] Provider: ${provider.provider}/${provider.model} (${provider.mode})`);
  }

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
  validatedResponse = filterModeLanguage(validatedResponse, input, normalizeMode(mode));

  // 🌀 SELFLET PHASE 2F: Apply delivery guard
  validatedResponse = applySelfletDeliveryGuard(validatedResponse, selfletContext);

  return { response: validatedResponse, provider };
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
): Promise<{ response: string; provider: ProviderMeta }> {
  console.log(`🎯 CORE PATH: Normal MAIA conversation with light awareness`);

  // 🧬 CONSCIOUSNESS POLICY (CORE path with full context)
  const userId = (meta as any).userId;
  // 🔑 EFFECTIVE USER ID for cross-session recall
  const effectiveUserId =
    userId ??
    (meta as any)?.explorerId ??
    (meta as any)?.memberId ??
    (meta as any)?.user?.id ??
    null;
  const policy = effectiveUserId ? await getConsciousnessPolicy(effectiveUserId, input) : null;

  if (policy) {
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Policy] Level ${policy.awarenessLevel} (${policy.awarenessName}), Element: ${policy.dominantElement}, Explicitness: ${policy.explicitness}, Beads: ${policy.totalBeads}`);
    }
    (meta as any).consciousnessPolicy = policy;
  }

  // 🌊 RELATIONSHIP MEMORY (load relational context for CORE path)
  let relationshipMemory: RelationshipMemoryContext | null = null;
  if (userId) {
    try {
      relationshipMemory = await loadRelationshipMemory(userId, {
        includeThemes: true,
        includeBreakthroughs: true,
        includePatterns: true, // CORE path: include patterns
        maxThemes: 5,
        maxBreakthroughs: 2
      });
      console.log(`🌊 [Relationship Memory CORE] Loaded: ${relationshipMemory.totalEncounters} encounters, ${relationshipMemory.relationshipPhase} phase, ${relationshipMemory.themes.length} themes`);
      (meta as any).relationshipMemory = relationshipMemory;
    } catch (error) {
      console.warn('⚠️ Could not load relationship memory for CORE path:', error);
    }
  }

  // 🌀 SELFLET TEMPORAL MESSAGE (Phase 2E: surface past-self messages in prompt)
  const selfletContext = (meta as any)?.selfletContext;
  const selfletPromptBlock = selfletContext?.surfacedMessagePrompt ?? '';

  // 🔄 CROSS-SESSION RECALL: Merge cross-session turns if current session is empty
  let effectiveHistory = conversationHistory;
  if (conversationHistory.length === 0 && effectiveUserId) {
    try {
      const crossSessionTurns = await TurnsStore.getRecentTurns(effectiveUserId, 8);
      if (crossSessionTurns.length > 0) {
        // Convert turns to conversation exchange format
        const pairs: any[] = [];
        for (let i = 0; i < crossSessionTurns.length - 1; i += 2) {
          const userTurn = crossSessionTurns[i];
          const assistantTurn = crossSessionTurns[i + 1];
          if (userTurn?.role === 'user' && assistantTurn?.role === 'assistant') {
            pairs.push({
              userMessage: userTurn.content,
              maiaResponse: assistantTurn.content,
              timestamp: userTurn.createdAt
            });
          }
        }
        if (pairs.length > 0) {
          effectiveHistory = pairs.slice(-4); // Last 4 exchanges
          console.log(`🔄 [Cross-Session Recall CORE] Loaded ${pairs.length} exchanges from previous sessions`);
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not load cross-session turns for CORE path:', err);
    }
  }

  // Light conversation analysis
  const conversationContext = conversationElementalTracker.processMessage(sessionId, input, effectiveHistory);

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
    // 🌊 RELATIONSHIP MEMORY
    relationshipMemory: relationshipMemory || undefined,
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
  let adaptivePrompt = buildMaiaWisePrompt(context, input, effectiveHistory);
  console.log(`🎭 Core voice adaptation applied`);

  // 🌀 SELFLET TEMPORAL MESSAGE: Inject past-self message into prompt (Phase 2E)
  if (selfletPromptBlock) {
    adaptivePrompt = adaptivePrompt + '\n\n' + selfletPromptBlock;
  }

  // 🧬 AWARENESS-ADAPTIVE PROMPTING: Apply policy-based adaptation
  if (policy) {
    adaptivePrompt = adaptResponsePromptWithPolicy(adaptivePrompt, policy);
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to CORE path`);
    }
  }

  const { text: response, provider: coreProvider } = await generateText({
    systemPrompt: adaptivePrompt,
    userInput: input,
    meta: {
      ...meta,
      currentUserMessage: input, // Raw user input for routing (consistent with FAST path)
      coreProcessing: true,
      conversationProfile: conversationContext.profile,
      inputComplexity: 'moderate'
    }
  });

  // 🔮 Log provider for sovereignty auditing (returned request-locally, not module-level)
  if (process.env.DEBUG_CONSCIOUSNESS === '1') {
    console.log(`🔮 [CORE] Provider: ${coreProvider.provider}/${coreProvider.model} (${coreProvider.mode})`);
  }

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
      let repairedPrompt = buildMaiaWisePrompt(repairedContext, input, effectiveHistory);

      // 🧬 AWARENESS-ADAPTIVE PROMPTING: Apply policy to regeneration as well
      if (policy) {
        repairedPrompt = adaptResponsePromptWithPolicy(repairedPrompt, policy);
        if (process.env.DEBUG_CONSCIOUSNESS === '1') {
          console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to CORE regeneration`);
        }
      }

      repairedPrompt = repairedPrompt + '\n\n' + repairPrompt;

      const { text } = await generateText({
        systemPrompt: repairedPrompt,
        userInput: input,
        meta: {
          ...meta,
          currentUserMessage: input,
          coreProcessing: true,
          regeneration: true,
          conversationProfile: conversationContext.profile
        }
      });
      return text;
    }
  );

  // 🎭 MODE-AWARE POST-PROCESSING: Filter mode-inappropriate language
  const mode = normalizeMode(meta.mode);
  validatedResponse = filterModeLanguage(validatedResponse, input, mode);

  // 🌀 SELFLET PHASE 2F: Apply delivery guard
  validatedResponse = applySelfletDeliveryGuard(validatedResponse, selfletContext);

  return { response: validatedResponse, provider: coreProvider };
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
): Promise<{ response: string; consciousnessData?: any; socraticValidation?: any; provider?: ProviderMeta }> {
  console.log(`🧠 DEEP PATH: Full consciousness orchestration + Claude consultation activated`);

  // 🧬 CONSCIOUSNESS POLICY (full depth for DEEP path)
  const userId = (meta as any).userId;
  // 🔑 EFFECTIVE USER ID for cross-session recall
  const effectiveUserId =
    userId ??
    (meta as any)?.explorerId ??
    (meta as any)?.memberId ??
    (meta as any)?.user?.id ??
    null;
  const policy = effectiveUserId ? await getConsciousnessPolicy(effectiveUserId, input) : null;

  if (policy) {
    if (process.env.DEBUG_CONSCIOUSNESS === '1') {
      console.log(`🧬 [Policy] Level ${policy.awarenessLevel} (${policy.awarenessName}), Element: ${policy.dominantElement}, Explicitness: ${policy.explicitness}, Beads: ${policy.totalBeads}`);
    }
    (meta as any).consciousnessPolicy = policy;
  }

  // 🌊 RELATIONSHIP MEMORY (load full relational context for DEEP path)
  let relationshipMemory: RelationshipMemoryContext | null = null;
  if (userId) {
    try {
      relationshipMemory = await loadRelationshipMemory(userId, {
        includeThemes: true,
        includeBreakthroughs: true,
        includePatterns: true, // DEEP path: full context
        maxThemes: 10, // More themes for deep work
        maxBreakthroughs: 5 // More breakthroughs for deep work
      });
      console.log(`🌊 [Relationship Memory DEEP] Loaded: ${relationshipMemory.totalEncounters} encounters, ${relationshipMemory.relationshipPhase} phase, ${relationshipMemory.themes.length} themes, ${relationshipMemory.breakthroughs.length} breakthroughs`);
      (meta as any).relationshipMemory = relationshipMemory;
    } catch (error) {
      console.warn('⚠️ Could not load relationship memory for DEEP path:', error);
    }
  }

  // 🌀 SELFLET TEMPORAL MESSAGE (Phase 2E: surface past-self messages in prompt)
  // Note: For DEEP path, selflet context is stored but prompt injection happens via meta passed to consciousness wrapper
  const selfletContext = (meta as any)?.selfletContext;
  (meta as any).selfletPromptBlock = selfletContext?.surfacedMessagePrompt ?? '';

  // 🔄 CROSS-SESSION RECALL: Merge cross-session turns if current session is empty
  let effectiveHistory = conversationHistory;
  if (conversationHistory.length === 0 && effectiveUserId) {
    try {
      const crossSessionTurns = await TurnsStore.getRecentTurns(effectiveUserId, 10);
      if (crossSessionTurns.length > 0) {
        // Convert turns to conversation exchange format
        const pairs: any[] = [];
        for (let i = 0; i < crossSessionTurns.length - 1; i += 2) {
          const userTurn = crossSessionTurns[i];
          const assistantTurn = crossSessionTurns[i + 1];
          if (userTurn?.role === 'user' && assistantTurn?.role === 'assistant') {
            pairs.push({
              userMessage: userTurn.content,
              maiaResponse: assistantTurn.content,
              timestamp: userTurn.createdAt
            });
          }
        }
        if (pairs.length > 0) {
          effectiveHistory = pairs.slice(-5); // Last 5 exchanges for DEEP path
          console.log(`🔄 [Cross-Session Recall DEEP] Loaded ${pairs.length} exchanges from previous sessions`);
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not load cross-session turns for DEEP path:', err);
    }
  }

  // Full conversation analysis
  const conversationContext = conversationElementalTracker.processMessage(sessionId, input, effectiveHistory);

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
    userId: userId ?? sessionId,  // prefer real userId, fallback to sessionId only if absent
    conversationHistory: effectiveHistory,
    currentDepth: depthFromRelationship(conversationContext.profile.relationshipDepth),
    elementalResonance: elementalTrendToResonance(conversationContext.profile.elementalTrend),
    observerLevel: Math.max(1, Math.min(effectiveHistory.length + 1, 7)),
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

  // 🎯 MAIA SOVEREIGNTY: Claude consultation is DISABLED by default
  // MAIA now has relationship memory (themes, breakthroughs, patterns) - she doesn't need Claude
  // To re-enable: Set MAIA_USE_CLAUDE_CONSULTATION=true in .env
  const hasClaudeAccess = process.env.ANTHROPIC_API_KEY || meta.claudeAvailable;
  const enableClaudeConsultation = process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true';

  if (enableClaudeConsultation && hasClaudeAccess) {
    try {
      console.log(`🧠 Consulting Claude for ${consultationType} enhancement...`);

      const consultation = await consultClaudeForConsciousness({
        userInput: input,
        maiaInitialResponse: maiaInitialResponse + cognitiveScaffoldingNote, // 🧠 Inject scaffolding into MAIA's initial response for Claude to integrate
        conversationContext: effectiveHistory.slice(-5).map(ex => ({
          userMessage: ex.userMessage || '',
          maiaResponse: ex.maiaResponse || ''
        })),
        consultationType,
        sessionMetadata: {
          turnCount: effectiveHistory.length + 1,
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
    if (!enableClaudeConsultation) {
      console.log(`✨ MAIA SOVEREIGN: Using original response (Claude consultation disabled)`);
    } else {
      console.log(`⚠️ Claude consultation unavailable (no API key) - using MAIA original response`);
    }
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

      const comprehensiveResult = buildMaiaComprehensivePrompt(input, repairedContext, effectiveHistory);
      let repairedPrompt = comprehensiveResult.prompt;

      // 🧬 AWARENESS-ADAPTIVE PROMPTING: Apply policy to regeneration as well
      if (policy) {
        repairedPrompt = adaptResponsePromptWithPolicy(repairedPrompt, policy);
        if (process.env.DEBUG_CONSCIOUSNESS === '1') {
          console.log(`🧬 [Awareness Adaptation] Level ${policy.awarenessLevel} (${policy.awarenessName}) guidance applied to DEEP regeneration`);
        }
      }

      const { text } = await generateText({
        systemPrompt: repairedPrompt + '\n\n' + repairPrompt,
        userInput: input,
        meta: {
          ...meta,
          currentUserMessage: input,
          deepProcessing: true,
          regeneration: true,
          conversationProfile: conversationContext.profile,
          consciousnessDepth: 'full'
        }
      });
      return text;
    }
  );

  // 🌀 SELFLET PHASE 2F: Apply delivery guard
  const guardedResponse = applySelfletDeliveryGuard(validatedResponse, selfletContext);

  return {
    response: guardedResponse,
    socraticValidation: validation,
    consciousnessData: {
      layersActivated: consciousnessResponse?.layersActivated,
      depth: consciousnessResponse?.depth,
      observerInsights: consciousnessResponse?.observerInsights,
      evolutionTriggers: consciousnessResponse?.evolutionTriggers,
      claudeConsultation: consultationData
    },
    // DEEP path uses consciousnessWrapper which doesn't yet track provider
    // Explicit placeholder for audit completeness (not undefined)
    provider: {
      provider: 'unknown',
      model: 'consciousness-wrapper',
      mode: 'full',
      reason: 'provider_not_threaded_in_deep_path',
    } as ProviderMeta
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

    // 🔑 EFFECTIVE USER ID: stable identifier for cross-session memory
    // Falls back through multiple sources to find a persistent identifier
    const effectiveUserId =
      userId ??
      (meta as any)?.explorerId ??
      (meta as any)?.memberId ??
      (meta as any)?.user?.id ??
      null;

    let cognitiveProfile: CognitiveProfile | null = null;
    let fieldSafety: FieldSafetyDecision | null = null;

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
      // Extract reqId from meta for audit correlation
      const reqId = meta?.reqId ?? null;

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
          reqId,
        }).catch((err: unknown) => {
          // Log but don't throw - fire-and-forget pattern (sanitized to avoid SQL/param leaks)
          const e = err as { name?: string; code?: string; message?: string };
          console.error('[Dialectical Scaffold] Failed to log cognitive turn (non-blocking):', {
            name: e?.name,
            code: e?.code,
          });
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
          reqId,
        }).catch((err: unknown) => {
          const e = err as { name?: string; code?: string; message?: string };
          console.error('[Dialectical Scaffold] Failed to log cognitive turn (non-blocking):', {
            name: e?.name,
            code: e?.code,
          });
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
            ? {
                element: atlasResult.element.toUpperCase() as SpiralFacet['element'],
                phase: (atlasResult.phase as 1 | 2 | 3) || 1,
                code: atlasResult.facet
              }
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
      // NOTE: atlasContext removed - not yet in router interface (future: elemental routing)
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
    // 🔮 Request-local provider tracking (not module-level - safe for serverless concurrency)
    let provider: ProviderMeta | undefined;

    // Route to appropriate processing path
    switch (processingProfile) {
      case 'FAST': {
        const fastResult = await fastPathResponse(sessionId, input, conversationHistory, meta);
        rawResponse = fastResult.response;
        provider = fastResult.provider;
        break;
      }

      case 'CORE': {
        const coreResult = await corePathResponse(sessionId, input, conversationHistory, meta);
        rawResponse = coreResult.response;
        provider = coreResult.provider;
        break;
      }

      case 'DEEP': {
        const deepResult = await deepPathResponse(sessionId, input, conversationHistory, meta);
        rawResponse = deepResult.response;
        consciousnessData = deepResult.consciousnessData;
        provider = deepResult.provider; // May be undefined for DEEP path
        break;
      }

      default: {
        // Fallback to FAST
        const fallbackResult = await fastPathResponse(sessionId, input, conversationHistory, meta);
        rawResponse = fallbackResult.response;
        provider = fallbackResult.provider;
        break;
      }
    }

    // Apply MAIA's voice sanitization (let for AIN rewrite reflex)
    // eslint-disable-next-line prefer-const
    let text = sanitizeMaiaOutput(rawResponse);
    let audioResponse: Buffer | undefined;

    // 🎤 VOICE SYNTHESIS: MAIA's mind (Claude/local) vs MAIA's voice (OpenAI TTS)
    if (includeAudio) {
      try {
        console.log(`🎤 Synthesizing MAIA's voice...`);

        // Use specified voice profile or default to 'warm'
        const finalVoiceProfile = voiceProfile || 'warm';

        // Synthesize voice using OpenAI TTS (thinking already done by Claude/local)
        audioResponse = await synthesizeMaiaVoice(text);

        console.log(`✅ Voice synthesis complete | ${finalVoiceProfile} profile`);
      } catch (voiceError) {
        console.error('❌ Voice synthesis failed (continuing with text-only):', voiceError);
        // Voice failure doesn't break the conversation - continue with text only
      }
    }

    const processingTimeMs = Date.now() - startTime;

    // Store conversation exchange (session-scoped)
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

    // 🔄 CROSS-SESSION TURNS: Store to user-keyed table for cross-session recall
    console.log('🧠 [TurnsStore] attempting persist', {
      effectiveUserId,
      userId,
      explorerId: (meta as any)?.explorerId,
      sessionId,
      db: process.env.DATABASE_URL ?? '(no DATABASE_URL env)',
    });

    if (effectiveUserId) {
      // 🔒 SECURITY: Never persist sensitive data to conversation_turns
      if (containsSensitiveData(input)) {
        console.log('🔒 [TurnsStore] Skipping persist - sensitive data detected');
      } else {
        try {
          await TurnsStore.addExchange(effectiveUserId, sessionId, input, text);
          console.log(`✅ [TurnsStore] Persisted exchange for ${effectiveUserId}`);
        } catch (turnsErr) {
          console.error('❌ [TurnsStore] persist failed', turnsErr);
          // Non-blocking - don't fail the response
        }
      }
    } else {
      console.warn('⚠️ [TurnsStore] No effectiveUserId - skipping cross-session storage');
    }

    // ✨ MEMORY INTEGRATION: Form memory from this conversation (mode-aware)
    try {
      const activeMode = normalizeMode((meta as any)?.mode);
      const memoryKey = userId ?? sessionId;

      // Check if this message should be elevated to lattice (prevents Scribe pollution)
      const shouldElevate = shouldElevateToLattice(input, activeMode);

      // HARD GATE: lattice writes require server-approved longterm memoryMode
      const memoryMode = (meta as any)?.memoryMode as 'ephemeral' | 'continuity' | 'longterm' | undefined;
      const allowLatticeWrite = memoryMode === 'longterm';

      if (memoryKey && shouldElevate && allowLatticeWrite) {
        // Store traceId for logging (MentalEvent interface doesn't include it)
        const traceId = (meta as any).traceId ?? randomUUID();

        const conversationEvent: ConsciousnessEvent = {
          type: 'mental',
          insight: `${input} → ${text.substring(0, 500)}`,
          cognitiveLevel: (bloomDetection?.numericLevel || 3) as 1 | 2 | 3 | 4 | 5 | 6,
          bypassing: false,
        };

        console.log(`🔬 [MEMORY] TraceId: ${traceId} (mode: ${activeMode}, elevated: ${shouldElevate})`);

        const memoryResult = await lattice.integrateEvent(
          memoryKey,
          conversationEvent,
          atlasResult?.facet ? {
            element: atlasResult.element.toUpperCase() as SpiralFacet['element'],
            phase: (atlasResult.phase as 1 | 2 | 3) || 1,
            code: atlasResult.facet
          } : { element: 'EARTH' as const, phase: 1 as const, code: 'EARTH-1' },
          { name: 'current', age: (meta as any).userAge || 30 },
          { memoryMode: memoryMode || 'continuity' }
        );

        console.log(`✨ [MEMORY] Memory ${memoryResult.memoryFormed ? 'FORMED' : 'logged'}, Patterns: ${memoryResult.patternsDetected.length}`);
        if (memoryResult.insights.length > 0) {
          console.log(`💡 [MEMORY] Insights: ${memoryResult.insights.join(', ')}`);
        }
      } else if (memoryKey && shouldElevate && !allowLatticeWrite) {
        console.log(`🛡️ [MemoryGate] Lattice write skipped (not longterm)`, { userId: memoryKey, memoryMode: memoryMode ?? 'undefined', mode: activeMode });
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
              emotion: null, // AtlasResult doesn't include emotion classification
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
          // NOTE: cognition/bloomMeta not in logMaiaTurn interface - stored separately
        }
      );

      // Store turnId in response metadata for feedback widget
      meta.turnId = turnId;

      console.log(`🧠 Learning integration complete | Turn: ${turnId} | Profile: ${processingProfile}`);
    } catch (learningError) {
      console.warn('⚠️ Learning system error (conversation continues):', learningError);
      // Learning failures don't break the conversation - MAIA continues normally
    }

    console.log(`✅ MAIA ${processingProfile} response complete: ${processingTimeMs}ms | ${text.length} chars${audioResponse ? ' + audio' : ''}`);

    // 🧪 AIN SHAPE CHECK: Dev-time warning + optional telemetry + rewrite reflex
    const telemetryEnabled =
      process.env.AIN_SHAPE_TELEMETRY === '1' ||
      process.env.NODE_ENV !== 'production';

    // Guard: prevent recursive rewrites
    const isRewritePass =
      meta?.rewritePass === true || meta?.ainRewritePass === true;

    if (telemetryEnabled && !isRewritePass) {
      let shape = assessAINResponseShape(input, text);

      if (!shape.pass) {
        console.warn('[AIN SHAPE WARNING]', {
          score: shape.score,
          flags: shape.flags,
          notes: shape.notes
        });

        // 🔄 AIN SHAPE REWRITE: If menu mode detected, rewrite the response
        const rewriteEnabled =
          process.env.AIN_SHAPE_REWRITE === '1' ||
          process.env.NODE_ENV !== 'production';

        // Hard prose-menu triggers (catch "sneaky" menus hidden in smooth prose)
        const hardProseMenu =
          !!shape.signals?.colonRunMenu ||
          !!shape.signals?.semicolonRunMenu ||
          !!shape.signals?.eitherOrMenu ||
          !!shape.signals?.optionABMenu;

        if (rewriteEnabled && (shape.flags.menuMode || hardProseMenu)) {
          try {
            const rewriteSystem = AIN_NO_MENU_REWRITE_PROMPT;

            const { text: rewritten } = await generateText({
              systemPrompt: rewriteSystem,
              userInput: `USER INPUT:\n${input}\n\nASSISTANT RESPONSE TO REWRITE:\n${text}`,
              meta: { ...meta, currentUserMessage: input, ainRewritePass: true }
            });

            if (rewritten && rewritten.trim().length > 50) {
              console.log('[AIN SHAPE REWRITE] Menu mode response rewritten');
              text = rewritten.trim();
              // Recompute shape for accurate telemetry
              shape = assessAINResponseShape(input, text);
            }
          } catch (rewriteErr) {
            console.warn('[AIN SHAPE REWRITE ERROR]', rewriteErr);
          }
        }
      }

      // Persist structure-only telemetry (no text) - reflects final delivered shape
      try {
        await logAINShapeTelemetry({
          pass: shape.pass,
          score: shape.score,
          flags: shape.flags,
          menuSignals: shape.signals ?? null,
          route: 'maiaService',
          processingProfile,
          explorerId: effectiveUserId ?? undefined,
          sessionId
        });
      } catch (err) {
        // Never break the response if telemetry fails
        console.warn('[AIN SHAPE TELEMETRY ERROR]', err);
      }
    }

    // 🌀 SELFLET PHASE 2G: Strip internal marker before response leaves server
    // The marker is only for idempotency within the pipeline - never expose to clients
    text = text.replaceAll(SELFLET_MARKER, '');

    return {
      text,
      processingProfile,
      processingTimeMs,
      audio: audioResponse,
      provider  // 🔮 Sovereignty auditing: request-local, concurrency-safe
    };

  } catch (error) {
    console.error('❌ MAIA processing failed:', error);
    const processingTimeMs = Date.now() - startTime;

    const text = "That last response didn't come out the way I intended. You're right to expect the focus to stay on you. Let's reset: what would feel most useful to talk about right now—support, clarity, or just a place to vent?";

    return {
      text,
      processingProfile: 'FAST',
      processingTimeMs,
      // 🔮 Sovereignty: error path has no provider info (don't inherit from previous request)
      provider: undefined
    };
  }
}
