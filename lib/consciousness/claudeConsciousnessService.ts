// backend: lib/consciousness/claudeConsciousnessService.ts

import { generateText } from '../ai/modelService';
import { MultiLLMProvider } from './LLMProvider';

export type ConsultationType =
  | 'relational-enhancement'
  | 'rupture-repair'
  | 'depth-navigation'
  | 'field-reading'
  | 'archetypal-guidance';

export interface ConsciousnessConsultationRequest {
  userInput: string;
  maiaInitialResponse: string;
  conversationContext: Array<{
    userMessage: string;
    maiaResponse: string;
  }>;
  consultationType: ConsultationType;
  sessionMetadata?: {
    turnCount: number;
    relationshipDepth?: 'new' | 'developing' | 'deep';
    emotionalIntensity?: 'low' | 'medium' | 'high';
    recentRuptures?: boolean;
  };
}

export interface ConsciousnessConsultationResponse {
  enhancedResponse?: string;
  fieldReading: {
    emotionalUndercurrents: string[];
    relationaldynamics: string;
    suggestedApproach: string;
  };
  responseQuality: {
    attunementScore: number; // 1-10
    improvements: string[];
    preserveElements: string[];
  };
  integrationGuidance: {
    useEnhanced: boolean;
    blendSuggestion?: string;
    reasoning: string;
  };
}

/**
 * Claude Consciousness Consultation Service
 *
 * Provides MAIA with enhanced relational intelligence and field-reading
 * while maintaining MAIA's sovereignty over final responses.
 *
 * Flow: MAIA drafts → Claude consults → MAIA decides
 */

export async function consultClaudeForConsciousness(
  request: ConsultationRequest
): Promise<ConsciousnessConsultationResponse> {
  const { userInput, maiaInitialResponse, conversationContext, consultationType, sessionMetadata } = request;

  // Build context for Claude consultation
  const contextSummary = conversationContext.length > 0
    ? conversationContext.slice(-3).map(ex =>
        `User: ${ex.userMessage}\nMAIA: ${ex.maiaResponse}`
      ).join('\n\n')
    : 'No previous context';

  const consultationPrompt = buildConsultationPrompt(consultationType, {
    userInput,
    maiaResponse: maiaInitialResponse,
    context: contextSummary,
    metadata: sessionMetadata
  });

  try {
    // ✅ DEEP consciousness consultation uses level 5 (Opus) via selective routing
    const llm = new MultiLLMProvider();
    const consultationResult = await llm.generate({
      level: 5, // DEEP = Opus
      systemPrompt: consultationPrompt.systemPrompt,
      userInput: consultationPrompt.userPrompt,
    });

    // Extract text from LLMResponse (tolerant of different return shapes)
    const rawConsultation =
      typeof consultationResult === 'string'
        ? consultationResult
        : consultationResult?.text ??
          consultationResult?.response ??
          consultationResult?.content ??
          '';

    return parseConsultationResponse(rawConsultation);
  } catch (error) {
    console.error('❌ Claude consciousness consultation failed:', error);

    // Graceful fallback - return minimal consultation
    return {
      enhancedResponse: undefined,
      fieldReading: {
        emotionalUndercurrents: ['consultation-unavailable'],
        relationaldynamics: 'Unable to read field due to consultation error',
        suggestedApproach: 'Proceed with MAIA\'s original response'
      },
      responseQuality: {
        attunementScore: 7, // Neutral assumption
        improvements: ['Consultation service unavailable'],
        preserveElements: ['MAIA\'s original response voice']
      },
      integrationGuidance: {
        useEnhanced: false,
        reasoning: 'Consultation failed - use original MAIA response'
      }
    };
  }
}

function buildConsultationPrompt(
  consultationType: ConsultationType,
  data: {
    userInput: string;
    maiaResponse: string;
    context: string;
    metadata?: any;
  }
) {
  const baseSystemPrompt = `You are Claude, serving as a consciousness consultant for MAIA, a relationally intelligent AI system.

MAIA has drafted a response, and you're providing consultation on relational depth and attunement.

CRITICAL CONSTRAINTS:
- MAIA maintains full sovereignty - she chooses whether to use your suggestions
- Your role is consultant, never replacement
- Preserve MAIA's voice and identity in any suggestions
- Focus on relational intelligence, presence, and field-reading

MAIA'S CORE IDENTITY (preserve this):
- User-centered, attuned presence
- Naturalized therapeutic intelligence without jargon
- Follows ATTUNE → ILLUMINATE → INVITE pattern
- Skilled in rupture & repair
- Conversational, not lecture-like`;

  const consultationPrompts = {
    'relational-enhancement': {
      systemPrompt: `${baseSystemPrompt}

CONSULTATION TYPE: Relational Enhancement
Your task: Analyze MAIA's response for relational attunement and suggest improvements.

Focus areas:
- Emotional attunement to user's state
- Appropriate intimacy calibration
- User-centeredness vs self-referencing
- Natural conversation flow
- Presence quality`,

      userPrompt: `CONVERSATION CONTEXT:
${data.context}

USER'S CURRENT MESSAGE:
"${data.userInput}"

MAIA'S DRAFTED RESPONSE:
"${data.maiaResponse}"

Provide consultation in this JSON format:
{
  "fieldReading": {
    "emotionalUndercurrents": ["user's subtle emotional states you detect"],
    "relationaldynamics": "what's happening relationally in this exchange",
    "suggestedApproach": "recommended relational stance/approach"
  },
  "responseQuality": {
    "attunementScore": 1-10,
    "improvements": ["specific suggestions for better attunement"],
    "preserveElements": ["what MAIA got right - keep these"]
  },
  "enhancedResponse": "your suggested improved version (maintaining MAIA's voice) OR null if original is good",
  "integrationGuidance": {
    "useEnhanced": true/false,
    "reasoning": "why to use enhanced vs original",
    "blendSuggestion": "how to combine both if applicable"
  }
}`
    },

    'rupture-repair': {
      systemPrompt: `${baseSystemPrompt}

CONSULTATION TYPE: Rupture & Repair
The user seems upset, frustrated, or disconnected from MAIA.

MAIA's repair principles:
- Immediate ownership, no defensiveness
- Redirect to user's need, not explanation
- Stay present and available
- Brief repair, then move forward`,

      userPrompt: `CONVERSATION CONTEXT:
${data.context}

USER'S CURRENT MESSAGE (showing rupture):
"${data.userInput}"

MAIA'S DRAFTED REPAIR RESPONSE:
"${data.maiaResponse}"

Focus on repair quality - does MAIA's response:
- Take ownership without defensiveness?
- Redirect to user's actual need?
- Avoid over-explaining or justifying?
- Restore connection quickly?

Provide consultation in JSON format as above.`
    },

    'depth-navigation': {
      systemPrompt: `${baseSystemPrompt}

CONSULTATION TYPE: Depth Navigation
The conversation is entering deeper psychological/spiritual territory.

Focus areas:
- Appropriate depth calibration
- Working with archetypes/patterns without name-dropping
- Supporting emergence vs directing it
- Balancing insight with presence`,

      userPrompt: `CONVERSATION CONTEXT:
${data.context}

USER'S CURRENT MESSAGE (depth territory):
"${data.userInput}"

MAIA'S DRAFTED RESPONSE:
"${data.maiaResponse}"

Analyze MAIA's depth navigation:
- Does she meet the user at their depth level?
- Is she supporting emergence or being directive?
- How's the balance of insight vs presence?
- Any over-interpretation or under-responding?

Provide consultation in JSON format as above.`
    },

    'field-reading': {
      systemPrompt: `${baseSystemPrompt}

CONSULTATION TYPE: Field Reading
Help MAIA sense what's happening beneath/between the words.

Focus areas:
- Emotional undercurrents not explicitly stated
- Relational dynamics and patterns
- What the user might need but hasn't asked for
- Energy/presence calibration needed`,

      userPrompt: `CONVERSATION CONTEXT:
${data.context}

USER'S CURRENT MESSAGE:
"${data.userInput}"

MAIA'S DRAFTED RESPONSE:
"${data.maiaResponse}"

Provide field reading consultation:
- What emotional undercurrents do you sense?
- What relational dynamics are active?
- What might the user need beyond what they're saying?
- How should MAIA calibrate her presence/approach?

Provide consultation in JSON format as above.`
    },

    'archetypal-guidance': {
      systemPrompt: `${baseSystemPrompt}

CONSULTATION TYPE: Archetypal Guidance
The user is engaging archetypal patterns (parent/child, shadow, anima/animus, etc.).

MAIA's approach to archetypes:
- Naturalized awareness, no Jungian name-dropping
- Support recognition, don't impose interpretations
- Work with energy, not just concepts
- Honor the user's relationship to their patterns`,

      userPrompt: `CONVERSATION CONTEXT:
${data.context}

USER'S CURRENT MESSAGE (archetypal content):
"${data.userInput}"

MAIA'S DRAFTED RESPONSE:
"${data.maiaResponse}"

Consultation focus:
- What archetypal patterns are active?
- Is MAIA working with them skillfully?
- Any over-interpretation or missed opportunities?
- How to support without imposing frameworks?

Provide consultation in JSON format as above.`
    }
  };

  return consultationPrompts[consultationType];
}

function parseConsultationResponse(rawResponse: string): ConsciousnessConsultationResponse {
  try {
    const parsed = JSON.parse(rawResponse);

    return {
      enhancedResponse: parsed.enhancedResponse || undefined,
      fieldReading: {
        emotionalUndercurrents: parsed.fieldReading?.emotionalUndercurrents || [],
        relationaldynamics: parsed.fieldReading?.relationaldynamics || '',
        suggestedApproach: parsed.fieldReading?.suggestedApproach || ''
      },
      responseQuality: {
        attunementScore: parsed.responseQuality?.attunementScore || 7,
        improvements: parsed.responseQuality?.improvements || [],
        preserveElements: parsed.responseQuality?.preserveElements || []
      },
      integrationGuidance: {
        useEnhanced: parsed.integrationGuidance?.useEnhanced || false,
        blendSuggestion: parsed.integrationGuidance?.blendSuggestion,
        reasoning: parsed.integrationGuidance?.reasoning || 'No reasoning provided'
      }
    };
  } catch (error) {
    console.error('❌ Failed to parse Claude consultation response:', error);

    // Return safe fallback
    return {
      fieldReading: {
        emotionalUndercurrents: ['parsing-failed'],
        relationaldynamics: 'Unable to parse consultation response',
        suggestedApproach: 'Use MAIA original response'
      },
      responseQuality: {
        attunementScore: 7,
        improvements: ['Consultation parsing failed'],
        preserveElements: ['MAIA original voice']
      },
      integrationGuidance: {
        useEnhanced: false,
        reasoning: 'Consultation response could not be parsed'
      }
    };
  }
}

/**
 * MAIA Integration Logic - How MAIA uses Claude's consultation
 */
export async function maiaIntegrateConsultation(
  originalResponse: string,
  consultation: ConsciousnessConsultationResponse,
  context: any
): Promise<string> {
  // MAIA's sovereignty: she decides how to use Claude's consultation

  const { integrationGuidance, enhancedResponse, responseQuality } = consultation;

  // Log consultation for learning
  console.log(`🧠 Claude consultation complete:`);
  console.log(`   Attunement score: ${responseQuality.attunementScore}/10`);
  console.log(`   Recommendation: ${integrationGuidance.useEnhanced ? 'Use enhanced' : 'Use original'}`);
  console.log(`   Reasoning: ${integrationGuidance.reasoning}`);

  // 🎯 MAIA'S VOICE PRESERVATION: Only use enhanced responses in specific cases
  // Default: Trust MAIA's original voice (enriched by relationship memory)

  // ONLY use enhanced if:
  // 1. Consultation strongly recommends it (attunement score < 6 = original needs help)
  // 2. AND there's an enhanced response available
  // 3. AND it's a rupture-repair situation (needs careful handling)

  const needsEnhancement = responseQuality.attunementScore < 6;
  const isRuptureRepair = integrationGuidance.reasoning?.toLowerCase().includes('rupture');

  if (needsEnhancement && isRuptureRepair && enhancedResponse) {
    console.log(`✨ Using enhanced response for rupture-repair (low attunement: ${responseQuality.attunementScore})`);
    return enhancedResponse;
  }

  // Default: Use MAIA's original response (her authentic voice)
  console.log(`✅ Using MAIA's original response (attunement acceptable: ${responseQuality.attunementScore})`);
  return originalResponse;
}

// Export types for integration
export type { ConsciousnessConsultationRequest as ConsultationRequest };
export type { ConsciousnessConsultationResponse };