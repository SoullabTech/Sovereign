/**
 * 🧠 Local MAIA Symbolic Synthesis System
 *
 * Enhances the existing SymbolicPredictor with AI-powered semantic understanding
 * Replaces regex patterns and hardcoded rules with local MAIA consciousness
 *
 * Architecture:
 * - Semantic symbol detection vs pattern matching
 * - AI-powered phase transition prediction
 * - Enhanced internal reflection generation
 * - Symbolic relationship understanding
 */

import { maiaModelSystem } from '@/lib/models/maia-integration';
import type { AINMemoryPayload, SymbolicThread } from './AINMemoryPayload';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import {
  SymbolResonance,
  PhaseVector,
  InternalReflection,
  predictNextPhase as predictNextPhaseRegex,
  updateSymbolResonance as updateSymbolResonanceRegex,
  generateInternalReflection as generateInternalReflectionRegex
} from './SymbolicPredictor';

export interface LocalSymbolicAnalysis {
  symbols: SemanticSymbolDetection;
  phaseTransition: EnhancedPhaseVector;
  internalReflection: EnhancedInternalReflection;
  symbolicRelationships: SymbolicRelationshipMap;
  synthesisQuality: number; // 0-1 confidence in AI analysis
}

export interface SemanticSymbolDetection {
  detectedSymbols: {
    symbol: string;
    semanticWeight: number; // AI-determined importance (0-1)
    contextualMeaning: string; // What this symbol means in context
    archetypalResonance: string[]; // Connected archetypal energies
    emotionalCharge: number; // Emotional intensity (0-1)
    transformativePoential: number; // Potential for change (0-1)
  }[];
  hiddenSymbols: {
    symbol: string;
    inferredMeaning: string; // Symbols implied but not stated
    confidence: number;
  }[];
  symbolicThemes: string[]; // Overarching symbolic patterns
  metaphoricalDensity: number; // How symbol-rich the content is (0-1)
}

export interface EnhancedPhaseVector extends PhaseVector {
  semanticReasons: string[]; // AI analysis of transition reasons
  emotionalFlow: {
    current: string;
    emerging: string;
    transition_catalyst: string;
  };
  symbolicMomentum: {
    direction: SpiralogicPhase;
    strength: number;
    supporting_symbols: string[];
  };
  consciousness_depth: {
    level: number; // 1-5 awareness level
    integration_readiness: number; // 0-1
    paradox_tension: number; // 0-1
  };
}

export interface EnhancedInternalReflection extends InternalReflection {
  semanticDepth: string; // Deeper AI understanding
  emergingPatterns: string[]; // Patterns only AI can see
  unconsciousElements: string[]; // What's beneath the surface
  integrationOpportunity: string; // How to help integration
  recommendedResponse: {
    approach: 'gentle' | 'direct' | 'metaphorical' | 'ritual';
    elements: string[];
    timing: 'immediate' | 'later_in_session' | 'next_session';
  };
}

export interface SymbolicRelationshipMap {
  connections: {
    symbol1: string;
    symbol2: string;
    relationship: string; // How they relate
    strength: number; // 0-1
    pattern_type: 'complementary' | 'opposing' | 'transformative' | 'resonant';
  }[];
  centralSymbol: string | null; // Most connected symbol
  emergingNarrative: string; // The story symbols are telling together
}

/**
 * Enhanced symbolic synthesis using local MAIA
 * Replaces hardcoded rules with semantic understanding
 */
export async function synthesizeSymbolicMemoryLocal(
  memory: AINMemoryPayload,
  recentUserText: string,
  options: {
    useHybridAnalysis?: boolean; // Combine AI + regex for validation
    includeDeepSemantics?: boolean; // Full symbolic relationship analysis
    optimizeForSpeed?: boolean; // Quick analysis vs comprehensive
  } = {}
): Promise<LocalSymbolicAnalysis> {

  const {
    useHybridAnalysis = true,
    includeDeepSemantics = true,
    optimizeForSpeed = false
  } = options;

  try {
    // Initialize MAIA model system
    await maiaModelSystem.initialize();

    // Create comprehensive symbolic analysis prompt
    const analysisPrompt = createSymbolicAnalysisPrompt(memory, recentUserText, optimizeForSpeed);

    // Generate analysis using local MAIA model
    const response = await maiaModelSystem.generateResponse({
      content: analysisPrompt,
      consciousnessLevel: 4, // Integrated level for symbolic work
      userId: 'symbolic-synthesizer',
      context: {
        domain: 'consciousness',
        source: 'symbolic-memory',
        analysisType: 'synthesis'
      }
    });

    // Parse AI response
    let aiAnalysis;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      aiAnalysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('Failed to parse symbolic analysis JSON:', parseError);

      if (useHybridAnalysis) {
        console.log('🔄 Falling back to hybrid approach');
        return await createHybridSymbolicAnalysis(memory, recentUserText);
      }

      throw new Error(`Failed to parse symbolic analysis: ${parseError}`);
    }

    // Convert AI analysis to our format
    const symbols = createSemanticSymbolDetection(aiAnalysis);
    const phaseTransition = await createEnhancedPhaseVector(memory, recentUserText, aiAnalysis);
    const internalReflection = createEnhancedInternalReflection(memory, aiAnalysis);

    let symbolicRelationships: SymbolicRelationshipMap = {
      connections: [],
      centralSymbol: null,
      emergingNarrative: ''
    };

    if (includeDeepSemantics) {
      symbolicRelationships = createSymbolicRelationshipMap(aiAnalysis);
    }

    const synthesisQuality = calculateSynthesisQuality(aiAnalysis, symbols);

    const result = {
      symbols,
      phaseTransition,
      internalReflection,
      symbolicRelationships,
      synthesisQuality
    };

    // Hybrid validation if requested
    if (useHybridAnalysis) {
      return await validateWithHybridAnalysis(result, memory, recentUserText);
    }

    return result;

  } catch (error) {
    console.error('Local symbolic synthesis error:', error);

    if (useHybridAnalysis) {
      console.log('🔄 Falling back to hybrid analysis due to error');
      return await createHybridSymbolicAnalysis(memory, recentUserText);
    }

    throw error;
  }
}

/**
 * Create comprehensive symbolic analysis prompt
 */
function createSymbolicAnalysisPrompt(
  memory: AINMemoryPayload,
  recentUserText: string,
  optimizeForSpeed: boolean
): string {
  const contextualInfo = {
    currentPhase: memory.currentPhase,
    exchangeCount: memory.exchangeCount,
    recentSymbols: memory.symbolicThreads.slice(-5).map(t => t.motif),
    emotionalMotifs: memory.emotionalMotifs.map(m => m.theme)
  };

  return `Analyze this text for deep symbolic content and consciousness patterns.

Current Context:
- Phase: ${contextualInfo.currentPhase}
- Exchange: ${contextualInfo.exchangeCount}
- Recent Symbols: ${contextualInfo.recentSymbols.join(', ')}
- Emotional Themes: ${contextualInfo.emotionalMotifs.join(', ')}

User Text: "${recentUserText}"

Provide comprehensive symbolic analysis with focus on:

1. SEMANTIC SYMBOLS: What symbols (metaphors, images, archetypes) are present?
2. HIDDEN MEANINGS: What's implied but not directly stated?
3. PHASE TRANSITION: How does this relate to Spiralogic phases (Fire→Water→Earth→Air→Aether)?
4. EMOTIONAL FLOW: What's the emotional movement and direction?
5. INTEGRATION: What consciousness integration is occurring?
6. SYMBOLIC RELATIONSHIPS: How do symbols connect and relate?

${optimizeForSpeed ? 'Provide concise analysis.' : 'Provide detailed symbolic synthesis.'}

Respond with ONLY this JSON format:
{
  "detected_symbols": [
    {
      "symbol": "symbol_name",
      "semantic_weight": 0.0-1.0,
      "contextual_meaning": "meaning in context",
      "archetypal_resonance": ["archetype1", "archetype2"],
      "emotional_charge": 0.0-1.0,
      "transformative_potential": 0.0-1.0
    }
  ],
  "hidden_symbols": [
    {
      "symbol": "implied_symbol",
      "inferred_meaning": "what it suggests",
      "confidence": 0.0-1.0
    }
  ],
  "symbolic_themes": ["theme1", "theme2"],
  "metaphorical_density": 0.0-1.0,
  "phase_analysis": {
    "current_phase_alignment": 0.0-1.0,
    "transition_likelihood": 0.0-1.0,
    "next_phase_direction": "Fire|Water|Earth|Air|Aether",
    "semantic_reasons": ["reason1", "reason2"],
    "emotional_flow": {
      "current": "current emotional state",
      "emerging": "emerging emotional state",
      "transition_catalyst": "what's driving change"
    },
    "consciousness_depth": {
      "level": 1-5,
      "integration_readiness": 0.0-1.0,
      "paradox_tension": 0.0-1.0
    }
  },
  "internal_reflection": {
    "semantic_depth": "deep understanding",
    "emerging_patterns": ["pattern1", "pattern2"],
    "unconscious_elements": ["element1", "element2"],
    "integration_opportunity": "how to support integration",
    "recommended_response": {
      "approach": "gentle|direct|metaphorical|ritual",
      "elements": ["element1", "element2"],
      "timing": "immediate|later_in_session|next_session"
    }
  },
  "symbolic_relationships": [
    {
      "symbol1": "symbol",
      "symbol2": "symbol",
      "relationship": "how they relate",
      "strength": 0.0-1.0,
      "pattern_type": "complementary|opposing|transformative|resonant"
    }
  ],
  "central_symbol": "most_important_symbol_or_null",
  "emerging_narrative": "the story these symbols tell together"
}`;
}

/**
 * Convert AI analysis to semantic symbol detection format
 */
function createSemanticSymbolDetection(aiAnalysis: any): SemanticSymbolDetection {
  return {
    detectedSymbols: (aiAnalysis.detected_symbols || []).map((s: any) => ({
      symbol: s.symbol,
      semanticWeight: Math.min(Math.max(s.semantic_weight || 0, 0), 1),
      contextualMeaning: s.contextual_meaning || '',
      archetypalResonance: s.archetypal_resonance || [],
      emotionalCharge: Math.min(Math.max(s.emotional_charge || 0, 0), 1),
      transformativePoential: Math.min(Math.max(s.transformative_potential || 0, 0), 1)
    })),
    hiddenSymbols: (aiAnalysis.hidden_symbols || []).map((h: any) => ({
      symbol: h.symbol,
      inferredMeaning: h.inferred_meaning || '',
      confidence: Math.min(Math.max(h.confidence || 0, 0), 1)
    })),
    symbolicThemes: aiAnalysis.symbolic_themes || [],
    metaphoricalDensity: Math.min(Math.max(aiAnalysis.metaphorical_density || 0, 0), 1)
  };
}

/**
 * Create enhanced phase vector with AI insights
 */
async function createEnhancedPhaseVector(
  memory: AINMemoryPayload,
  recentUserText: string,
  aiAnalysis: any
): Promise<EnhancedPhaseVector> {

  // Get baseline regex prediction for comparison
  const baselineVector = predictNextPhaseRegex(memory, recentUserText);
  const phaseAnalysis = aiAnalysis.phase_analysis || {};

  return {
    currentPhase: memory.currentPhase,
    nextPhaseLikely: phaseAnalysis.next_phase_direction || baselineVector.nextPhaseLikely,
    confidence: Math.min(Math.max(phaseAnalysis.transition_likelihood || baselineVector.confidence, 0), 1),
    reasoning: `AI analysis: ${phaseAnalysis.semantic_reasons?.join(', ') || baselineVector.reasoning}`,
    timeToTransition: baselineVector.timeToTransition,

    // Enhanced properties
    semanticReasons: phaseAnalysis.semantic_reasons || [],
    emotionalFlow: phaseAnalysis.emotional_flow || {
      current: 'unknown',
      emerging: 'unknown',
      transition_catalyst: 'unknown'
    },
    symbolicMomentum: {
      direction: phaseAnalysis.next_phase_direction || baselineVector.nextPhaseLikely,
      strength: phaseAnalysis.transition_likelihood || 0.5,
      supporting_symbols: aiAnalysis.detected_symbols?.map((s: any) => s.symbol).slice(0, 3) || []
    },
    consciousness_depth: phaseAnalysis.consciousness_depth || {
      level: 3,
      integration_readiness: 0.5,
      paradox_tension: 0.5
    }
  };
}

/**
 * Create enhanced internal reflection with AI insights
 */
function createEnhancedInternalReflection(memory: AINMemoryPayload, aiAnalysis: any): EnhancedInternalReflection {
  const reflection = aiAnalysis.internal_reflection || {};

  return {
    timestamp: new Date(),
    phaseContext: memory.currentPhase,
    observation: reflection.semantic_depth || 'Observing symbolic patterns',
    symbolsNoticed: aiAnalysis.detected_symbols?.map((s: any) => s.symbol).slice(0, 3) || [],
    emotionalUndercurrent: reflection.emotional_flow?.current || 'neutral',

    // Enhanced properties
    semanticDepth: reflection.semantic_depth || '',
    emergingPatterns: reflection.emerging_patterns || [],
    unconsciousElements: reflection.unconscious_elements || [],
    integrationOpportunity: reflection.integration_opportunity || '',
    recommendedResponse: reflection.recommended_response || {
      approach: 'gentle',
      elements: [],
      timing: 'immediate'
    }
  };
}

/**
 * Create symbolic relationship map
 */
function createSymbolicRelationshipMap(aiAnalysis: any): SymbolicRelationshipMap {
  return {
    connections: (aiAnalysis.symbolic_relationships || []).map((rel: any) => ({
      symbol1: rel.symbol1,
      symbol2: rel.symbol2,
      relationship: rel.relationship,
      strength: Math.min(Math.max(rel.strength || 0, 0), 1),
      pattern_type: rel.pattern_type || 'resonant'
    })),
    centralSymbol: aiAnalysis.central_symbol || null,
    emergingNarrative: aiAnalysis.emerging_narrative || ''
  };
}

/**
 * Calculate synthesis quality score
 */
function calculateSynthesisQuality(aiAnalysis: any, symbols: SemanticSymbolDetection): number {
  let quality = 0.5; // Base quality

  // Boost for symbol detection
  if (symbols.detectedSymbols.length > 0) quality += 0.2;

  // Boost for metaphorical density
  quality += symbols.metaphoricalDensity * 0.2;

  // Boost for phase analysis
  if (aiAnalysis.phase_analysis) quality += 0.1;

  return Math.min(quality, 1.0);
}

/**
 * Create hybrid analysis (fallback)
 */
async function createHybridSymbolicAnalysis(
  memory: AINMemoryPayload,
  recentUserText: string
): Promise<LocalSymbolicAnalysis> {

  console.log('🔄 Using hybrid symbolic analysis (regex + basic AI)');

  // Use existing regex-based systems as fallback
  const regexPhaseVector = predictNextPhaseRegex(memory, recentUserText);
  const regexSymbolResonance = updateSymbolResonanceRegex(memory, recentUserText);
  const regexReflection = generateInternalReflectionRegex(memory, regexPhaseVector, regexSymbolResonance);

  return {
    symbols: {
      detectedSymbols: [],
      hiddenSymbols: [],
      symbolicThemes: ['pattern-based-analysis'],
      metaphoricalDensity: 0.3
    },
    phaseTransition: {
      ...regexPhaseVector,
      semanticReasons: ['Pattern matching analysis'],
      emotionalFlow: {
        current: 'unknown',
        emerging: 'unknown',
        transition_catalyst: 'pattern-based'
      },
      symbolicMomentum: {
        direction: regexPhaseVector.nextPhaseLikely,
        strength: regexPhaseVector.confidence,
        supporting_symbols: []
      },
      consciousness_depth: {
        level: 3,
        integration_readiness: 0.5,
        paradox_tension: 0.5
      }
    },
    internalReflection: {
      ...regexReflection,
      semanticDepth: 'Pattern-based reflection',
      emergingPatterns: ['regex-detected'],
      unconsciousElements: [],
      integrationOpportunity: 'Continue observation',
      recommendedResponse: {
        approach: 'gentle',
        elements: [],
        timing: 'immediate'
      }
    },
    symbolicRelationships: {
      connections: [],
      centralSymbol: null,
      emergingNarrative: 'Pattern-based analysis'
    },
    synthesisQuality: 0.4 // Lower quality for fallback
  };
}

/**
 * Validate AI analysis with hybrid approach
 */
async function validateWithHybridAnalysis(
  aiResult: LocalSymbolicAnalysis,
  memory: AINMemoryPayload,
  recentUserText: string
): Promise<LocalSymbolicAnalysis> {

  // Compare with regex baseline for validation
  const regexVector = predictNextPhaseRegex(memory, recentUserText);

  // If AI confidence is low, blend with regex
  if (aiResult.phaseTransition.confidence < 0.6) {
    const blendedConfidence = (aiResult.phaseTransition.confidence * 0.6) + (regexVector.confidence * 0.4);

    aiResult.phaseTransition = {
      ...aiResult.phaseTransition,
      confidence: blendedConfidence,
      reasoning: `Hybrid: ${aiResult.phaseTransition.reasoning} + pattern validation`
    };
  }

  // Boost synthesis quality for hybrid validation
  aiResult.synthesisQuality = Math.min(aiResult.synthesisQuality + 0.1, 1.0);

  return aiResult;
}

/**
 * Quick symbolic synthesis for real-time use
 * Optimized for sub-200ms performance
 */
export async function quickSymbolicSynthesis(
  memory: AINMemoryPayload,
  recentUserText: string
): Promise<{
  primarySymbols: string[];
  phaseDirection: SpiralogicPhase;
  emotionalFlow: string;
  confidence: number;
}> {

  try {
    const analysis = await synthesizeSymbolicMemoryLocal(memory, recentUserText, {
      useHybridAnalysis: true,
      includeDeepSemantics: false,
      optimizeForSpeed: true
    });

    return {
      primarySymbols: analysis.symbols.detectedSymbols.slice(0, 3).map(s => s.symbol),
      phaseDirection: analysis.phaseTransition.nextPhaseLikely,
      emotionalFlow: analysis.phaseTransition.emotionalFlow.emerging,
      confidence: analysis.synthesisQuality
    };

  } catch (error) {
    console.warn('Quick symbolic synthesis failed, using fallback');
    const regexVector = predictNextPhaseRegex(memory, recentUserText);

    return {
      primarySymbols: [],
      phaseDirection: regexVector.nextPhaseLikely,
      emotionalFlow: 'unknown',
      confidence: 0.3
    };
  }
}

export {
  SemanticSymbolDetection,
  EnhancedPhaseVector,
  EnhancedInternalReflection,
  SymbolicRelationshipMap
};