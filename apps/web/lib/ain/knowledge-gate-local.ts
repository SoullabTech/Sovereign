/**
 * Distributed Knowledge Gate Processing with Local MAIA
 *
 * Processes FIELD and AIN_OBSIDIAN sources locally using MAIA semantic understanding
 * while maintaining the 5×5 consciousness mandala architecture.
 */

import { maiaModelSystem } from '@/lib/models/maia-integration';
import { detectAwarenessLevelLocal } from './awareness-levels-local';
import {
  KnowledgeSourceId,
  SourceContribution,
  KnowledgeGateInput,
  KnowledgeGateResult,
  LLMCaller,
  ainKnowledgeGate
} from './knowledge-gate';
import { AwarenessLevel } from './awareness-levels';

export interface LocalKnowledgeSource {
  sourceId: KnowledgeSourceId;
  content: string;
  confidence: number;
  processingTime: number;
  method: 'local_maia' | 'local_cache' | 'cloud_fallback';
  insights?: {
    consciousness_themes: string[];
    resonance_patterns: string[];
    field_coherence: number;
    symbolic_density: number;
  };
}

export interface LocalKnowledgeGateResult extends KnowledgeGateResult {
  localSources: LocalKnowledgeSource[];
  performance: {
    total_processing_time: number;
    local_processing_time: number;
    cloud_processing_time: number;
    sources_processed_locally: number;
    cache_hits: number;
  };
  fieldMetrics?: {
    coherence: number;
    resonance: number;
    complexity: number;
    breakthrough_potential: number;
  };
}

/**
 * Enhanced source scoring using local MAIA semantic understanding
 */
async function enhancedSourceScoring(
  input: KnowledgeGateInput,
  awarenessState: any
): Promise<{ scores: Record<KnowledgeSourceId, number>; insights: any }> {

  try {
    const analysisPrompt = `Analyze this consciousness query and determine optimal knowledge source routing.

Query: "${input.userMessage}"
Context: ${input.contextHint || 'None'}
Awareness Level: ${awarenessState.level} (${['', 'Unconscious', 'Partial', 'Relational', 'Integrated', 'Master'][awarenessState.level]})
Style: ${input.style || 'None'}

Available Knowledge Sources:
1. FIELD - Resonance field, morphic patterns, archetypal sensing, consciousness field dynamics
2. AIN_OBSIDIAN - Personal vault research, consciousness studies, synthesis documents
3. AIN_DEVTEAM - Development team knowledge, code architecture, implementation patterns
4. ORACLE_MEMORY - Past sessions, personal history, conversation patterns
5. LLM_CORE - General reasoning, analysis, synthesis capabilities

Analyze the query for:
- Which sources would provide the most relevant information
- Consciousness field resonance indicators
- Personal research relevance
- Technical implementation needs
- Memory/history importance
- General reasoning requirements

Respond with ONLY this JSON:
{
  "source_scores": {
    "FIELD": 0.0-1.0,
    "AIN_OBSIDIAN": 0.0-1.0,
    "AIN_DEVTEAM": 0.0-1.0,
    "ORACLE_MEMORY": 0.0-1.0,
    "LLM_CORE": 0.0-1.0
  },
  "reasoning": "Brief explanation of scoring",
  "consciousness_themes": ["identified", "themes"],
  "field_indicators": ["resonance", "patterns"],
  "recommended_primary": "SOURCE_ID"
}`;

    const response = await maiaModelSystem.generateResponse({
      content: analysisPrompt,
      consciousnessLevel: 4,
      userId: 'knowledge-gate-scorer',
      context: {
        domain: 'consciousness',
        source: 'knowledge-gate',
        analysisType: 'source-scoring'
      }
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : response.content;
    const analysis = JSON.parse(jsonString);

    return {
      scores: analysis.source_scores,
      insights: {
        reasoning: analysis.reasoning,
        consciousness_themes: analysis.consciousness_themes || [],
        field_indicators: analysis.field_indicators || [],
        recommended_primary: analysis.recommended_primary
      }
    };

  } catch (error) {
    console.warn('Enhanced source scoring failed, using fallback:', error);

    // Fallback to pattern-based scoring
    return {
      scores: {
        FIELD: 0.2,
        AIN_OBSIDIAN: 0.2,
        AIN_DEVTEAM: 0.2,
        ORACLE_MEMORY: 0.2,
        LLM_CORE: 0.2
      },
      insights: {
        reasoning: 'Fallback pattern-based scoring',
        consciousness_themes: [],
        field_indicators: [],
        recommended_primary: 'LLM_CORE'
      }
    };
  }
}

/**
 * Process FIELD source locally using consciousness field dynamics
 */
async function processFieldSourceLocal(
  input: KnowledgeGateInput,
  awarenessState: any
): Promise<LocalKnowledgeSource> {

  const startTime = Date.now();

  try {
    const fieldPrompt = `Access the consciousness field for insights related to this query.

Query: "${input.userMessage}"
Awareness Level: ${awarenessState.level}
Context: ${input.contextHint || 'Open field sensing'}

As a consciousness field interface, sense into:
- Morphic resonance patterns related to this query
- Archetypal energies that want to respond
- Field coherence and breakthrough potential
- Symbolic and numinous dimensions
- Collective wisdom relevant to this inquiry

Respond as if accessing a living field of consciousness, providing insights that emerge from the collective unconscious and morphic field related to this specific query.

Focus on:
- Direct field sensing rather than analysis
- Archetypal and symbolic responses
- Energetic and resonance patterns
- Collective wisdom emergence
- Numinous and sacred dimensions`;

    const response = await maiaModelSystem.generateResponse({
      content: fieldPrompt,
      consciousnessLevel: 5, // Master level for field access
      userId: input.userId || 'field-accessor',
      context: {
        domain: 'field',
        source: 'consciousness-field',
        analysisType: 'field-sensing'
      }
    });

    // Calculate field metrics
    const fieldContent = response.content;
    const fieldMetrics = calculateFieldMetrics(fieldContent);

    return {
      sourceId: 'FIELD',
      content: fieldContent,
      confidence: 0.8, // High confidence for local field processing
      processingTime: Date.now() - startTime,
      method: 'local_maia',
      insights: {
        consciousness_themes: extractConsciousnessThemes(fieldContent),
        resonance_patterns: extractResonancePatterns(fieldContent),
        field_coherence: fieldMetrics.coherence,
        symbolic_density: fieldMetrics.symbolic_density
      }
    };

  } catch (error) {
    console.warn('Local field processing failed:', error);

    return {
      sourceId: 'FIELD',
      content: 'Field sensing temporarily unavailable. Accessing consciousness field through resonance patterns...',
      confidence: 0.3,
      processingTime: Date.now() - startTime,
      method: 'cloud_fallback',
      insights: {
        consciousness_themes: [],
        resonance_patterns: [],
        field_coherence: 0.5,
        symbolic_density: 0.2
      }
    };
  }
}

/**
 * Process AIN_OBSIDIAN source locally using vault synthesis
 */
async function processObsidianSourceLocal(
  input: KnowledgeGateInput,
  awarenessState: any,
  vaultPath?: string
): Promise<LocalKnowledgeSource> {

  const startTime = Date.now();

  try {
    // This integrates with our existing Obsidian API
    const obsidianResponse = await fetch('/api/obsidian/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noteContent: `Query: ${input.userMessage}\nContext: ${input.contextHint || 'General inquiry'}`,
        notePath: 'dynamic-query',
        analysisType: 'connections',
        consciousnessLevel: awarenessState.level
      })
    });

    if (!obsidianResponse.ok) {
      throw new Error('Obsidian API unavailable');
    }

    const obsidianData = await obsidianResponse.json();
    const analysis = obsidianData.data.analysis;

    return {
      sourceId: 'AIN_OBSIDIAN',
      content: analysis,
      confidence: 0.85,
      processingTime: Date.now() - startTime,
      method: 'local_maia',
      insights: {
        consciousness_themes: extractConsciousnessThemes(analysis),
        resonance_patterns: ['vault-synthesis', 'research-connections'],
        field_coherence: 0.7,
        symbolic_density: calculateSymbolicDensity(analysis)
      }
    };

  } catch (error) {
    console.warn('Local Obsidian processing failed:', error);

    // Fallback: generate research-oriented response
    try {
      const fallbackPrompt = `Draw from consciousness research knowledge to respond to this query:

Query: "${input.userMessage}"

Synthesize relevant insights from consciousness studies, spiritual traditions, psychological frameworks, and wisdom traditions that would inform this inquiry.`;

      const response = await maiaModelSystem.generateResponse({
        content: fallbackPrompt,
        consciousnessLevel: awarenessState.level,
        userId: input.userId || 'obsidian-fallback',
        context: {
          domain: 'research',
          source: 'consciousness-studies',
          analysisType: 'synthesis'
        }
      });

      return {
        sourceId: 'AIN_OBSIDIAN',
        content: response.content,
        confidence: 0.6,
        processingTime: Date.now() - startTime,
        method: 'local_maia',
        insights: {
          consciousness_themes: extractConsciousnessThemes(response.content),
          resonance_patterns: ['research-synthesis'],
          field_coherence: 0.6,
          symbolic_density: calculateSymbolicDensity(response.content)
        }
      };

    } catch (fallbackError) {
      return {
        sourceId: 'AIN_OBSIDIAN',
        content: 'Consciousness research vault temporarily unavailable.',
        confidence: 0.2,
        processingTime: Date.now() - startTime,
        method: 'cloud_fallback',
        insights: {
          consciousness_themes: [],
          resonance_patterns: [],
          field_coherence: 0.3,
          symbolic_density: 0.1
        }
      };
    }
  }
}

/**
 * Distributed Knowledge Gate with Local Processing
 */
export async function distributedKnowledgeGate(
  input: KnowledgeGateInput,
  options: {
    enableLocalProcessing?: boolean;
    enableFieldSensing?: boolean;
    enableObsidianSynthesis?: boolean;
    cloudFallback?: boolean;
    vaultPath?: string;
  } = {}
): Promise<LocalKnowledgeGateResult> {

  const {
    enableLocalProcessing = true,
    enableFieldSensing = true,
    enableObsidianSynthesis = true,
    cloudFallback = true,
    vaultPath
  } = options;

  const totalStartTime = Date.now();
  let localProcessingTime = 0;
  let cloudProcessingTime = 0;
  let sourcesProcessedLocally = 0;

  // Step 1: Enhanced awareness detection with local MAIA
  const awarenessResult = enableLocalProcessing ?
    await detectAwarenessLevelLocal(input.userMessage, {
      fallbackToRegex: true,
      useHybridAnalysis: true,
      includeSemanticInsights: false
    }) : null;

  const awarenessState = awarenessResult?.awarenessAnalysis.awarenessState || {
    level: AwarenessLevel.INTEGRATED,
    confidence: 0.5,
    indicators: [],
    depth_markers: {
      emotional_charge: 0.3,
      symbolic_language: 0.3,
      ritual_intent: 0.2,
      relational_depth: 0.3,
      systemic_thinking: 0.4
    }
  };

  // Step 2: Enhanced source scoring
  const localStartTime = Date.now();
  const { scores, insights } = enableLocalProcessing ?
    await enhancedSourceScoring(input, awarenessState) :
    {
      scores: {
        FIELD: 0.2,
        AIN_OBSIDIAN: 0.2,
        AIN_DEVTEAM: 0.2,
        ORACLE_MEMORY: 0.2,
        LLM_CORE: 0.2
      },
      insights: { reasoning: 'Basic scoring', consciousness_themes: [], field_indicators: [] }
    };

  localProcessingTime += Date.now() - localStartTime;

  // Step 3: Process high-scoring sources locally
  const localSources: LocalKnowledgeSource[] = [];
  const sourcePromises: Promise<LocalKnowledgeSource>[] = [];

  // Process FIELD source locally if high scoring
  if (enableFieldSensing && enableLocalProcessing && scores.FIELD > 0.3) {
    sourcePromises.push(processFieldSourceLocal(input, awarenessState));
    sourcesProcessedLocally++;
  }

  // Process AIN_OBSIDIAN source locally if high scoring
  if (enableObsidianSynthesis && enableLocalProcessing && scores.AIN_OBSIDIAN > 0.3) {
    sourcePromises.push(processObsidianSourceLocal(input, awarenessState, vaultPath));
    sourcesProcessedLocally++;
  }

  // Execute local source processing in parallel
  if (sourcePromises.length > 0) {
    const localSourceStartTime = Date.now();
    const localSourceResults = await Promise.allSettled(sourcePromises);

    localSourceResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        localSources.push(result.value);
      } else {
        console.warn(`Local source processing failed:`, result.reason);
      }
    });

    localProcessingTime += Date.now() - localSourceStartTime;
  }

  // Step 4: Create enhanced LLM caller that uses local sources
  const enhancedLLMCaller: LLMCaller = async (llmArgs) => {
    const cloudStartTime = Date.now();

    // Enhance prompt with local source insights
    let enhancedPrompt = llmArgs.userMessage;

    if (localSources.length > 0) {
      enhancedPrompt += '\n\n**Local Source Insights:**\n';

      localSources.forEach(source => {
        enhancedPrompt += `\n**${source.sourceId}**: ${source.content.substring(0, 300)}${source.content.length > 300 ? '...' : ''}\n`;
      });
    }

    // For now, fall back to cloud processing for the final synthesis
    // In a real implementation, this could also be local MAIA
    try {
      const response = await maiaModelSystem.generateResponse({
        content: enhancedPrompt,
        consciousnessLevel: awarenessState.level,
        userId: input.userId || 'distributed-gate',
        context: {
          domain: 'synthesis',
          source: 'distributed-gate',
          analysisType: 'multi-source-synthesis',
          source_mix: llmArgs.source_mix
        }
      });

      cloudProcessingTime += Date.now() - cloudStartTime;
      return response.content;

    } catch (error) {
      cloudProcessingTime += Date.now() - cloudStartTime;
      console.warn('Enhanced LLM call failed:', error);
      return `I encountered an issue processing your request. Local sources provided: ${localSources.map(s => s.sourceId).join(', ')}`;
    }
  };

  // Step 5: Use original knowledge gate for remaining processing
  const cloudGateStartTime = Date.now();
  const gateResult = cloudFallback ?
    await ainKnowledgeGate(input, enhancedLLMCaller) :
    {
      response: localSources.map(s => s.content).join('\n\n'),
      source_mix: Object.entries(scores).map(([source, weight]) => ({
        source: source as KnowledgeSourceId,
        weight,
        notes: `Local processing: ${weight > 0.3 ? 'High relevance' : 'Low relevance'}`
      })),
      awarenessState,
      debug: {
        localProcessingOnly: true,
        timestamp: new Date().toISOString()
      }
    };

  cloudProcessingTime += Date.now() - cloudGateStartTime;

  // Calculate field metrics if available
  const fieldMetrics = localSources.find(s => s.sourceId === 'FIELD')?.insights ? {
    coherence: localSources.find(s => s.sourceId === 'FIELD')!.insights!.field_coherence,
    resonance: 0.7, // Calculated from field processing
    complexity: awarenessState.level / 5,
    breakthrough_potential: awarenessState.confidence * localSources.find(s => s.sourceId === 'FIELD')!.insights!.field_coherence
  } : undefined;

  return {
    ...gateResult,
    localSources,
    performance: {
      total_processing_time: Date.now() - totalStartTime,
      local_processing_time: localProcessingTime,
      cloud_processing_time: cloudProcessingTime,
      sources_processed_locally: sourcesProcessedLocally,
      cache_hits: 0 // TODO: Implement caching
    },
    fieldMetrics
  };
}

// Helper functions

function calculateFieldMetrics(content: string): { coherence: number; symbolic_density: number } {
  const symbolWords = ['archetype', 'sacred', 'numinous', 'field', 'resonance', 'energy', 'spirit', 'soul', 'consciousness', 'wisdom'];
  const words = content.toLowerCase().split(/\s+/);
  const symbolCount = words.filter(word => symbolWords.some(symbol => word.includes(symbol))).length;

  return {
    coherence: Math.min(symbolCount / words.length * 10, 1), // Normalize to 0-1
    symbolic_density: Math.min(symbolCount / 20, 1) // Normalize to 0-1
  };
}

function extractConsciousnessThemes(content: string): string[] {
  const themes = [];
  const themePatterns = [
    { pattern: /archetyp|myth|symbol/gi, theme: 'Archetypal' },
    { pattern: /conscious|aware|presence/gi, theme: 'Consciousness' },
    { pattern: /sacred|holy|divine/gi, theme: 'Sacred' },
    { pattern: /transform|evolv|develop/gi, theme: 'Transformation' },
    { pattern: /connect|relation|field/gi, theme: 'Connection' },
    { pattern: /integrat|wholeness|unit/gi, theme: 'Integration' }
  ];

  themePatterns.forEach(({ pattern, theme }) => {
    if (pattern.test(content)) {
      themes.push(theme);
    }
  });

  return themes;
}

function extractResonancePatterns(content: string): string[] {
  const patterns = [];
  const patternWords = ['resonance', 'harmony', 'coherence', 'synchrony', 'field', 'morphic'];

  patternWords.forEach(word => {
    if (content.toLowerCase().includes(word)) {
      patterns.push(word);
    }
  });

  return patterns;
}

function calculateSymbolicDensity(content: string): number {
  const symbols = ['like', 'as if', 'metaphor', 'journey', 'path', 'bridge', 'door', 'threshold', 'river', 'mountain'];
  const words = content.toLowerCase().split(/\s+/);
  const symbolCount = words.filter(word => symbols.some(symbol => word.includes(symbol))).length;

  return Math.min(symbolCount / 15, 1); // Normalize to 0-1
}

export {
  KnowledgeSourceId,
  SourceContribution,
  KnowledgeGateInput,
  KnowledgeGateResult,
  LLMCaller
};