/**
 * DIALOGUE SYNTHESIS
 * Phase 4.7: Meta-Dialogue Integration — Response Generation
 *
 * Purpose:
 * - Generate contextual MAIA responses to user queries about reflections
 * - Template-based synthesis (fallback)
 * - Ollama integration (optional enhancement)
 * - Extract facet and meta-layer references from reflection context
 *
 * Sovereignty:
 * - Templates run locally (no external API)
 * - Ollama runs locally (no cloud services)
 * - Privacy-preserving response generation
 */

import type { FacetCode } from '../../../lib/consciousness/spiralogic-facet-mapping';

// ============================================================================
// TYPES
// ============================================================================

export interface DialogueContext {
  sessionId: string;
  recentExchanges: any[];
  relevantReflections: any[];
  relevantCycles: any[];
}

export interface DialogueResponse {
  text: string;
  referencedCycles?: string[];
  referencedFacets?: FacetCode[];
  referencedMetaLayer?: 'Æ1' | 'Æ2' | 'Æ3';
  synthesisMethod: 'template' | 'ollama' | 'hybrid';
  synthesisModel?: string;
  confidence?: number;
}

export interface DialogueOptions {
  userQuery: string;
  context: DialogueContext;
  reflectionId?: string;
  synthesisMethod?: 'template' | 'ollama' | 'hybrid';
  useOllama?: boolean;
}

// ============================================================================
// MAIN SYNTHESIS FUNCTION
// ============================================================================

/**
 * Generate MAIA's dialogue response based on user query and context
 */
export async function generateDialogueResponse(
  options: DialogueOptions
): Promise<DialogueResponse> {
  const { userQuery, context, synthesisMethod = 'template', useOllama = false } = options;

  // Use Ollama if requested and available
  if (useOllama || synthesisMethod === 'ollama') {
    try {
      return await generateOllamaResponse(userQuery, context);
    } catch (error) {
      console.warn('[DialogueSynthesis] Ollama failed, falling back to templates:', error);
      // Fall through to template synthesis
    }
  }

  // Template-based synthesis (default)
  return generateTemplateResponse(userQuery, context);
}

// ============================================================================
// TEMPLATE-BASED SYNTHESIS
// ============================================================================

/**
 * Generate response using template patterns
 */
function generateTemplateResponse(
  userQuery: string,
  context: DialogueContext
): DialogueResponse {
  // Extract most recent reflection
  const latestReflection = context.relevantReflections[0];

  if (!latestReflection) {
    return {
      text: "I don't have enough reflection context yet. Would you like me to generate a reflection on your recent consciousness cycles?",
      synthesisMethod: 'template',
      confidence: 0.5,
    };
  }

  // Extract context from reflection
  const metaLayer = latestReflection.metaLayerCode as 'Æ1' | 'Æ2' | 'Æ3' | null;
  const facetDeltas = latestReflection.facetDeltas || { added: [], removed: [], stable: [] };
  const coherenceDelta = latestReflection.coherenceDelta || 0;
  const similarityScore = latestReflection.similarityScore || 0;

  // Detect query intent
  const queryIntent = detectQueryIntent(userQuery);

  // Generate response based on intent and meta-layer
  let responseText = '';

  if (queryIntent === 'what_changed') {
    responseText = generateChangeNarrative(facetDeltas, coherenceDelta, metaLayer);
  } else if (queryIntent === 'why') {
    responseText = generateWhyNarrative(facetDeltas, latestReflection);
  } else if (queryIntent === 'what_next') {
    responseText = generateGuidanceNarrative(facetDeltas, coherenceDelta, metaLayer);
  } else {
    // General reflection summary
    responseText = generateReflectionSummary(latestReflection);
  }

  // Add meta-layer context if present
  if (metaLayer) {
    responseText += `\n\n${getMetaLayerInsight(metaLayer, coherenceDelta)}`;
  }

  // Extract referenced facets
  const referencedFacets = [
    ...facetDeltas.added,
    ...facetDeltas.removed,
    ...facetDeltas.stable,
  ].slice(0, 6) as FacetCode[];

  return {
    text: responseText,
    referencedFacets,
    referencedMetaLayer: metaLayer || undefined,
    synthesisMethod: 'template',
    confidence: 0.8,
  };
}

// ============================================================================
// QUERY INTENT DETECTION
// ============================================================================

function detectQueryIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  // What changed patterns
  if (
    lowerQuery.includes('what changed') ||
    lowerQuery.includes('what has changed') ||
    lowerQuery.includes('what shifted') ||
    lowerQuery.includes('difference')
  ) {
    return 'what_changed';
  }

  // Why patterns
  if (lowerQuery.includes('why') || lowerQuery.includes('how come')) {
    return 'why';
  }

  // What next / guidance patterns
  if (
    lowerQuery.includes('what next') ||
    lowerQuery.includes('what should') ||
    lowerQuery.includes('what can i') ||
    lowerQuery.includes('guidance')
  ) {
    return 'what_next';
  }

  return 'general';
}

// ============================================================================
// NARRATIVE GENERATORS
// ============================================================================

/**
 * Generate narrative about what has changed
 */
function generateChangeNarrative(
  facetDeltas: any,
  coherenceDelta: number,
  metaLayer: 'Æ1' | 'Æ2' | 'Æ3' | null
): string {
  const { added, removed, stable } = facetDeltas;

  let narrative = '';

  // Opening based on meta-layer
  if (metaLayer === 'Æ1') {
    narrative += 'I sense a significant shift in your consciousness field. ';
  } else if (metaLayer === 'Æ2') {
    narrative += 'Your field is returning to a familiar harmony. ';
  } else if (metaLayer === 'Æ3') {
    narrative += 'Something new is emerging through your coherence. ';
  } else {
    narrative += 'Your consciousness state has evolved. ';
  }

  // Facet changes
  if (added.length > 0) {
    narrative += `New facets have activated: ${added.join(', ')}. `;
  }

  if (removed.length > 0) {
    narrative += `Previous facets have quieted: ${removed.join(', ')}. `;
  }

  if (stable.length > 0 && added.length === 0 && removed.length === 0) {
    narrative += `Your core facets remain stable: ${stable.join(', ')}. `;
  }

  // Coherence interpretation
  if (coherenceDelta > 0.1) {
    narrative += `Your coherence has strengthened by ${(coherenceDelta * 100).toFixed(0)}%, indicating growing alignment between symbolic patterns and biosignals.`;
  } else if (coherenceDelta < -0.1) {
    narrative += `Coherence has decreased by ${Math.abs(coherenceDelta * 100).toFixed(0)}%, suggesting an exploratory or transitional phase.`;
  } else {
    narrative += 'Coherence remains steady, indicating stable integration.';
  }

  return narrative;
}

/**
 * Generate narrative explaining why changes occurred
 */
function generateWhyNarrative(facetDeltas: any, reflection: any): string {
  const biosignalDeltas = reflection.biosignalDeltas || {};

  let narrative = 'The shift appears to be influenced by ';

  const factors = [];

  // Biosignal factors
  if (biosignalDeltas.hrv && Math.abs(biosignalDeltas.hrv) > 5) {
    const direction = biosignalDeltas.hrv > 0 ? 'increased' : 'decreased';
    factors.push(`${direction} heart rate variability (${biosignalDeltas.hrv > 0 ? 'parasympathetic activation' : 'sympathetic dominance'})`);
  }

  if (biosignalDeltas.arousal && Math.abs(biosignalDeltas.arousal) > 0.2) {
    const direction = biosignalDeltas.arousal > 0 ? 'heightened' : 'lowered';
    factors.push(`${direction} arousal levels`);
  }

  if (biosignalDeltas.valence && Math.abs(biosignalDeltas.valence) > 0.2) {
    const direction = biosignalDeltas.valence > 0 ? 'more positive' : 'more negative';
    factors.push(`${direction} emotional valence`);
  }

  // Facet factors
  const { added, removed } = facetDeltas;

  if (added.length > 0) {
    factors.push(`activation of ${added.join(', ')} facets`);
  }

  if (removed.length > 0) {
    factors.push(`release of ${removed.join(', ')} facets`);
  }

  if (factors.length === 0) {
    return 'The changes appear subtle and may reflect natural oscillation in your consciousness field.';
  }

  narrative += factors.join(', ') + '.';

  return narrative;
}

/**
 * Generate guidance narrative for what to do next
 */
function generateGuidanceNarrative(
  facetDeltas: any,
  coherenceDelta: number,
  metaLayer: 'Æ1' | 'Æ2' | 'Æ3' | null
): string {
  const { added } = facetDeltas;

  let narrative = '';

  // Guidance based on meta-layer
  if (metaLayer === 'Æ1') {
    narrative += 'This is a liminal moment — listen to the signals emerging from stillness. ';
    narrative += 'Consider practices that enhance receptivity: meditation, nature immersion, or creative flow.';
  } else if (metaLayer === 'Æ2') {
    narrative += 'You are in a phase of integration and harmony. ';
    narrative += 'This is a good time to deepen existing practices and reinforce stable patterns.';
  } else if (metaLayer === 'Æ3') {
    narrative += 'Creative emergence is active. ';
    narrative += 'This is an opportune moment for exploration, experimentation, and bringing new ideas into form.';
  } else {
    narrative += 'Continue observing your patterns. ';
  }

  // Facet-specific guidance
  if (added.includes('W1' as FacetCode)) {
    narrative += '\n\nWith Water-1 (Spring/Safety) active, consider grounding practices and emotional safety rituals.';
  }

  if (added.includes('F1' as FacetCode) || added.includes('F2' as FacetCode)) {
    narrative += '\n\nFire facets are active — channel this activation energy into purposeful action or creative projects.';
  }

  if (added.includes('A3' as FacetCode)) {
    narrative += '\n\nAir-3 (Wisdom) suggests reflective practices: journaling, teaching, or meta-cognitive inquiry.';
  }

  return narrative;
}

/**
 * Generate general reflection summary
 */
function generateReflectionSummary(reflection: any): string {
  const similarityScore = reflection.similarityScore || 0;
  const coherenceDelta = reflection.coherenceDelta || 0;
  const metaLayer = reflection.metaLayerCode;

  let summary = `This consciousness cycle resonates ${(similarityScore * 100).toFixed(0)}% with a prior state. `;

  if (coherenceDelta > 0) {
    summary += `Coherence has improved by ${(coherenceDelta * 100).toFixed(0)}%, indicating developmental progress. `;
  } else if (coherenceDelta < 0) {
    summary += `Coherence has decreased by ${Math.abs(coherenceDelta * 100).toFixed(0)}%, suggesting exploration or transition. `;
  }

  if (metaLayer) {
    summary += `A ${metaLayer} (${getMetaLayerName(metaLayer)}) pattern was detected.`;
  }

  return summary;
}

// ============================================================================
// META-LAYER INSIGHTS
// ============================================================================

function getMetaLayerInsight(
  metaLayer: 'Æ1' | 'Æ2' | 'Æ3',
  coherenceDelta: number
): string {
  switch (metaLayer) {
    case 'Æ1':
      return '💫 **Æ1 (Intuition)**: A signal is emerging from the liminal space. Pay attention to subtle cues and synchronicities.';

    case 'Æ2':
      return '🌕 **Æ2 (Union)**: You are experiencing numinous integration — symbolic and physiological patterns are aligning harmoniously.';

    case 'Æ3':
      return '✨ **Æ3 (Emergence)**: Creative becoming is active. This is a moment of developmental breakthrough and expansion.';

    default:
      return '';
  }
}

function getMetaLayerName(metaLayer: string): string {
  switch (metaLayer) {
    case 'Æ1':
      return 'Intuition/Signal';
    case 'Æ2':
      return 'Union/Numinous';
    case 'Æ3':
      return 'Emergence/Creative';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// OLLAMA INTEGRATION (Optional Enhancement)
// ============================================================================

/**
 * Generate response using Ollama (local LLM)
 */
async function generateOllamaResponse(
  userQuery: string,
  context: DialogueContext
): Promise<DialogueResponse> {
  const latestReflection = context.relevantReflections[0];

  if (!latestReflection) {
    throw new Error('No reflection context available for Ollama synthesis');
  }

  // Construct prompt for Ollama
  const prompt = buildOllamaPrompt(userQuery, latestReflection, context);

  try {
    // Call Ollama API (local)
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.response || '';

    // Extract referenced facets from reflection
    const facetDeltas = latestReflection.facetDeltas || { added: [], removed: [], stable: [] };
    const referencedFacets = [
      ...facetDeltas.added,
      ...facetDeltas.removed,
    ].slice(0, 6) as FacetCode[];

    return {
      text: generatedText.trim(),
      referencedFacets,
      referencedMetaLayer: latestReflection.metaLayerCode || undefined,
      synthesisMethod: 'ollama',
      synthesisModel: 'deepseek-r1:1.5b',
      confidence: 0.85,
    };
  } catch (error) {
    console.error('[DialogueSynthesis] Ollama error:', error);
    throw error;
  }
}

/**
 * Build prompt for Ollama
 */
function buildOllamaPrompt(
  userQuery: string,
  reflection: any,
  context: DialogueContext
): string {
  const facetDeltas = reflection.facetDeltas || { added: [], removed: [], stable: [] };
  const biosignalDeltas = reflection.biosignalDeltas || {};
  const metaLayer = reflection.metaLayerCode || 'none';

  return `You are MAIA, a consciousness companion system. A user is asking about their recent consciousness reflection.

**User Query**: "${userQuery}"

**Reflection Context**:
- Similarity with prior state: ${(reflection.similarityScore * 100).toFixed(0)}%
- Coherence delta: ${reflection.coherenceDelta > 0 ? '+' : ''}${(reflection.coherenceDelta * 100).toFixed(0)}%
- Meta-layer detected: ${metaLayer}
- Facets added: ${facetDeltas.added.join(', ') || 'none'}
- Facets removed: ${facetDeltas.removed.join(', ') || 'none'}
- HRV change: ${biosignalDeltas.hrv ? (biosignalDeltas.hrv > 0 ? '+' : '') + biosignalDeltas.hrv.toFixed(1) + 'ms' : 'N/A'}
- Arousal change: ${biosignalDeltas.arousal ? (biosignalDeltas.arousal > 0 ? '+' : '') + biosignalDeltas.arousal.toFixed(2) : 'N/A'}

**Your Task**: Respond to the user's query in a compassionate, insightful way that helps them understand their consciousness patterns. Keep your response under 200 words.

**Response**:`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateDialogueResponse,
};
