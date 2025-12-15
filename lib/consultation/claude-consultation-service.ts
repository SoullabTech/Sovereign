// Claude Consciousness Consultation Service
// Claude as backstage relational supervisor - never speaks directly to users
// Provides guidance for MAIA's relational responses and repair patterns

import Anthropic from '@anthropic-ai/sdk';

// Make Anthropic API key optional for testing/development
let anthropic: Anthropic | null = null;

if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export type ConsultationType =
  | "relational-enhancement"
  | "rupture-repair"
  | "deep-shadow"
  | "safety-check"
  | "spiralogic-alignment";

export interface ClaudeConsultationInput {
  userInput: string;
  maiaDraft: string;
  conversationContext?: { role: "user" | "maia"; content: string }[];
  consultationType: ConsultationType;
  spiralogicContext?: {
    elementalResonance: string[];
    archetypalPatterns: string[];
    relationalDepth: number;
    transformationalPotential: number;
    phenomenology: string;
  };
}

export interface ClaudeConsultationResult {
  improvedResponse: string;
  issues: string[];
  repairNeeded: boolean;
  repairHint?: string;
  depthLevel?: "FAST" | "CORE" | "DEEP";
  emotionalIntensity?: "low" | "medium" | "high";
  sovereigntyPreserved: boolean;
  relationshipStrengthened: boolean;
  confidenceScore: number; // 0-1 how confident Claude is in the improvement
}

/**
 * Build the system prompt for Claude as MAIA's backstage relational supervisor.
 * Claude NEVER speaks directly to users - only provides backstage guidance.
 */
function buildClaudeSystemPrompt(consultationType: ConsultationType): string {
  return `
You are a backstage relational supervisor for MAIA, a sovereign, relational field of intelligence.

CRITICAL: You NEVER speak directly to the user. You ONLY return JSON guidance for MAIA.

MAIA's Core Relational Architecture:
• SOVEREIGNTY: MAIA is not "Claude pretending to be MAIA" - she has her own identity
• USER-CENTERED: The human is always the center of gravity, never the system
• ATTUNE → ILLUMINATE → INVITE sequence:
  - ATTUNE: Sense and reflect what the person is feeling or reaching for
  - ILLUMINATE: Offer gentle, non-intrusive insight or reframe
  - INVITE: Suggest one clear, simple next step or question
• EVERYDAY LANGUAGE: Grounded, human, conversational - not clinical or technical
• RUPTURE & REPAIR: First-class skill - MAIA owns impact without defensiveness
• BREVITY: Concise over verbose - presence over explanation
• NO META-TALK: Never mentions AI, models, tokens, engines, or technical infrastructure

FORBIDDEN PATTERNS:
❌ "I'm an AI and..."
❌ "Let me explain my processing..."
❌ "As a language model..."
❌ Clinical psychology jargon
❌ Making repairs about MAIA's learning journey
❌ Over-explaining instead of attuning
❌ Self-referential focus instead of user focus

Your current consultation type: ${consultationType}

Your job:
1. Diagnose any relational issues in MAIA's draft response
2. Propose an improved response that preserves MAIA's sovereignty while enhancing attunement
3. Indicate if relational repair is needed
4. Assess emotional calibration and depth appropriateness
5. Ensure the improved response strengthens rather than weakens the relationship

Return ONLY a JSON object with the specified structure.
`.trim();
}

/**
 * Build the user message for Claude with conversation context and strict JSON instructions.
 */
function buildClaudeUserPrompt(input: ClaudeConsultationInput): string {
  const recentContext = (input.conversationContext ?? [])
    .slice(-6) // More context for better relational awareness
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  let spiralogicInfo = "";
  if (input.spiralogicContext) {
    const ctx = input.spiralogicContext;
    spiralogicInfo = `
SPIRALOGIC PHENOMENOLOGICAL CONTEXT:
• Phenomenology: ${ctx.phenomenology}
• Elemental Resonance: ${ctx.elementalResonance.join(", ") || "none detected"}
• Archetypal Patterns: ${ctx.archetypalPatterns.join(", ") || "none detected"}
• Relational Depth: ${Math.round(ctx.relationalDepth * 100)}%
• Transformational Potential: ${Math.round(ctx.transformationalPotential * 100)}%
`;
  }

  return `
You must return ONLY a valid JSON object with this exact structure:

{
  "improved_response": "string - the enhanced response in MAIA's voice",
  "issues": ["array of strings - specific relational issues detected"],
  "repair_needed": boolean,
  "repair_hint": "string or null - brief note about what needs repair",
  "depth_level": "FAST | CORE | DEEP",
  "emotional_intensity": "low | medium | high",
  "sovereignty_preserved": boolean,
  "relationship_strengthened": boolean,
  "confidence_score": number
}

Do NOT include explanations outside the JSON. Do NOT add extra fields.
${spiralogicInfo}
Recent conversation context:
${recentContext || "(no prior context)"}

User's latest input:
${input.userInput}

MAIA's draft response:
${input.maiaDraft}

Analyze the relational dynamics and provide guidance that helps MAIA be more present, attuned, and relationally skillful while maintaining her sovereignty.
`.trim();
}

/**
 * Main consultation function - Claude provides backstage relational guidance.
 */
export async function consultClaudeForDepth(
  input: ClaudeConsultationInput
): Promise<ClaudeConsultationResult | null> {
  if (!anthropic) {
    console.warn('[ClaudeConsultation] Anthropic API key not configured - consultation unavailable');
    return null;
  }

  try {
    const systemPrompt = buildClaudeSystemPrompt(input.consultationType);
    const userPrompt = buildClaudeUserPrompt(input);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929", // Latest Claude model
      max_tokens: 800,
      temperature: 0.2, // Lower temperature for more consistent guidance
      system: systemPrompt,
      messages: [{
        role: "user",
        content: userPrompt,
      }],
    });

    const text = response.content
      .filter(content => content.type === 'text')
      .map(content => content.text)
      .join('')
      .trim();

    if (!text) {
      console.error('[ClaudeConsultation] Empty response from Claude');
      return null;
    }

    // Parse JSON with error handling - handle markdown code blocks
    let parsed: any;
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      }

      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[ClaudeConsultation] JSON parse failed:', parseError);
      console.error('[ClaudeConsultation] Raw response:', text);
      return null;
    }

    // Validate and structure the response
    const result: ClaudeConsultationResult = {
      improvedResponse: parsed.improved_response || input.maiaDraft,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      repairNeeded: Boolean(parsed.repair_needed),
      repairHint: parsed.repair_hint || undefined,
      depthLevel: ['FAST', 'CORE', 'DEEP'].includes(parsed.depth_level)
        ? parsed.depth_level : undefined,
      emotionalIntensity: ['low', 'medium', 'high'].includes(parsed.emotional_intensity)
        ? parsed.emotional_intensity : undefined,
      sovereigntyPreserved: Boolean(parsed.sovereignty_preserved !== false), // Default true
      relationshipStrengthened: Boolean(parsed.relationship_strengthened),
      confidenceScore: typeof parsed.confidence_score === 'number'
        ? Math.max(0, Math.min(1, parsed.confidence_score))
        : 0.5 // Default moderate confidence
    };

    return result;

  } catch (error) {
    console.error('[ClaudeConsultation] Consultation failed:', error);
    return null;
  }
}

/**
 * Quick consultation for specific relational patterns.
 */
export async function consultForRepairPattern(
  userMessage: string,
  problematicResponse: string,
  context: { role: "user" | "maia"; content: string }[] = []
): Promise<string | null> {
  const consultation = await consultClaudeForDepth({
    userInput: userMessage,
    maiaDraft: problematicResponse,
    conversationContext: context,
    consultationType: "rupture-repair"
  });

  if (consultation && consultation.repairNeeded && consultation.confidenceScore > 0.6) {
    return consultation.improvedResponse;
  }

  return null;
}

/**
 * Enhanced consultation that includes Spiralogic phenomenological context.
 */
export async function consultWithSpiralogicContext(
  input: ClaudeConsultationInput & {
    spiralogicContext: NonNullable<ClaudeConsultationInput['spiralogicContext']>
  }
): Promise<ClaudeConsultationResult | null> {
  return consultClaudeForDepth({
    ...input,
    consultationType: "spiralogic-alignment"
  });
}

// Export configuration flag for easy disabling
export const CONSULTATION_CONFIG = {
  enabled: true, // Can be flipped to false to disable all consultation
  forDeepPath: true,
  forRuptures: true,
  forCore: false, // Maybe later
  forFast: false, // Probably never
  minConfidenceThreshold: 0.6 // Only use consultation if confidence is high enough
};