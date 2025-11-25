/**
 * Progressive Wisdom Injection System
 *
 * CORPUS CALLOSUM MODEL - Parallel Processing with Resonant Interference
 *
 * All wisdom advisors activate in parallel (like hemispheres of the brain)
 * with aggressive 5s timeouts. We take whatever arrives and enrich the prompt.
 *
 * 4 WISDOM HEMISPHERES:
 * 🔥 IP Engine (Spiralogic Framework) - 5s timeout
 * 💧 Elemental Oracle 2.0 (Practices) - 5s timeout
 * 🌿 Knowledge Base (Patterns) - 3s timeout
 * 🌊 Resonance Field (Multi-dimensional wisdom matching) - 5s timeout
 *
 * The Resonance Field actively decides what wisdom to amplify based on:
 * - Semantic meaning (40%)
 * - Emotional resonance (20%)
 * - Elemental needs (25%)
 * - Developmental level (15%)
 *
 * This is flow state intuition, not passive retrieval.
 * Nature's intelligence speaking through elemental consciousness.
 *
 * NEVER wait 45 seconds - stream starts within 5-8s maximum.
 * PRESERVES FULL CONSCIOUSNESS - doesn't bypass any layers, just optimizes timing
 */

import { IntellectualPropertyEngine } from '../intellectual-property-engine';
import { ElementalOracle2Bridge } from '../elemental-oracle-2-bridge';
import { maiaKnowledgeBase } from '../oracle/MaiaKnowledgeBase';
import { searchWithResonance, formatFieldReportForPrompt } from './ResonanceField';

export interface WisdomContext {
  userQuery: string;
  conversationHistory: any[];
  userId: string;
  userName: string;
  sessionId: string;
}

export interface WisdomResult {
  ip?: string;
  eo?: string;
  kb?: any;
  library?: string; // Library of Alexandria semantic search
  duration: number;
  layersActivated: string[];
}

/**
 * Fetch wisdom advisors in PARALLEL with aggressive timeouts
 * Corpus callosum model: All hemispheres working simultaneously
 */
export async function fetchWisdomInParallel(
  context: WisdomContext
): Promise<WisdomResult> {
  const startTime = Date.now();
  console.log('🧠 [CORPUS CALLOSUM] Activating all wisdom hemispheres in parallel...');

  // ═══════════════════════════════════════════════════════════════
  // PARALLEL WISDOM ACTIVATION - 5s max timeout
  // ═══════════════════════════════════════════════════════════════

  const wisdomPromises = [
    // IP Engine (Kelly's 35 years of wisdom) - 5s timeout
    fetchWithTimeout(
      async () => {
        console.log('  🔥 [IP Engine] Activating...');
        const ipEngine = new IntellectualPropertyEngine();
        const wisdom = await ipEngine.retrieveRelevantWisdom({
          userInput: context.userQuery,
          conversationHistory: context.conversationHistory,
          currentConsciousnessState: { presence: 0.7, coherence: 0.8 },
          emotionalTone: 'neutral',
          activeArchetypes: [],
          practiceReadiness: 0.5
        });
        console.log('  ✅ [IP Engine] Wisdom retrieved');
        return { ip: wisdom.synthesizedWisdom };
      },
      5000, // 5 second max
      'IP Engine'
    ),

    // Elemental Oracle 2.0 (applied practices) - 5s timeout
    fetchWithTimeout(
      async () => {
        console.log('  💧 [EO 2.0] Activating...');
        const eoEngine = new ElementalOracle2Bridge({
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          eoApiUrl: process.env.ELEMENTAL_ORACLE_API_URL,
          eoApiKey: process.env.ELEMENTAL_ORACLE_API_KEY,
          fallbackToLocal: true
        });
        const wisdom = await eoEngine.getElementalWisdom({
          userQuery: context.userQuery,
          conversationHistory: context.conversationHistory,
          consciousnessState: { presence: 0.7, coherence: 0.8 },
          elementalNeeds: { fire: 0.5, water: 0.5, earth: 0.5, air: 0.5, aether: 0.5 },
          currentChallenges: [],
          practiceReadiness: 0.5,
          depthPreference: 'moderate'
        });
        console.log('  ✅ [EO 2.0] Wisdom retrieved');
        return { eo: wisdom.wisdom };
      },
      5000,
      'Elemental Oracle'
    ),

    // Knowledge Base (patterns, practices) - 3s timeout (faster)
    fetchWithTimeout(
      async () => {
        console.log('  🌿 [Knowledge Base] Activating...');
        const knowledge = await maiaKnowledgeBase.getContextualKnowledge([context.userQuery]);
        console.log('  ✅ [Knowledge Base] Patterns retrieved');
        return { kb: knowledge };
      },
      3000,
      'Knowledge Base'
    ),

    // Resonance Field (multi-dimensional wisdom matching) - 5s timeout
    fetchWithTimeout(
      async () => {
        console.log('  📚 [Resonance Field] Activating multi-dimensional wisdom matching...');
        const fieldReport = await searchWithResonance({
          text: context.userQuery,
          conversationHistory: context.conversationHistory
        }, 3);
        const formattedWisdom = formatFieldReportForPrompt(fieldReport);
        console.log('  ✅ [Resonance Field] Wisdom activated by field response');
        console.log(`     - Emotional tone: ${fieldReport.queryField.emotionalTone?.primary || 'neutral'}`);
        console.log(`     - Dominant element: ${fieldReport.dominantElement || 'balanced'}`);
        console.log(`     - Developmental level: ${fieldReport.queryField.developmentalLevel || 'not detected'}`);
        console.log(`     - Average resonance: ${(fieldReport.totalResonance * 100).toFixed(0)}%`);
        return { library: formattedWisdom };
      },
      5000, // 5 seconds - allows time for multi-dimensional analysis
      'Resonance Field'
    )
  ];

  // Wait for ALL or timeout (whichever comes first)
  const wisdomResults = await Promise.allSettled(wisdomPromises);

  // Collect wisdom from successful retrievals
  const wisdom: WisdomResult = {
    duration: Date.now() - startTime,
    layersActivated: []
  };

  // IP Engine
  if (wisdomResults[0].status === 'fulfilled' && wisdomResults[0].value) {
    wisdom.ip = wisdomResults[0].value.ip;
    wisdom.layersActivated.push('IP Engine');
  } else {
    console.warn('  ⚠️ [IP Engine] Timed out or failed - continuing without');
  }

  // Elemental Oracle 2.0
  if (wisdomResults[1].status === 'fulfilled' && wisdomResults[1].value) {
    wisdom.eo = wisdomResults[1].value.eo;
    wisdom.layersActivated.push('Elemental Oracle 2.0');
  } else {
    console.warn('  ⚠️ [Elemental Oracle] Timed out or failed - continuing without');
  }

  // Knowledge Base
  if (wisdomResults[2].status === 'fulfilled' && wisdomResults[2].value) {
    wisdom.kb = wisdomResults[2].value.kb;
    wisdom.layersActivated.push('Knowledge Base');
  } else {
    console.warn('  ⚠️ [Knowledge Base] Timed out or failed - continuing without');
  }

  // Resonance Field
  if (wisdomResults[3].status === 'fulfilled' && wisdomResults[3].value) {
    wisdom.library = wisdomResults[3].value.library;
    wisdom.layersActivated.push('Resonance Field');
  } else {
    console.warn('  ⚠️ [Resonance Field] Timed out or failed - continuing without');
  }

  console.log(`🧠 [CORPUS CALLOSUM] ${wisdom.layersActivated.length}/4 hemispheres activated in ${wisdom.duration}ms`);
  console.log(`   Active layers: ${wisdom.layersActivated.join(', ') || 'none (using base consciousness only)'}`);

  return wisdom;
}

/**
 * Fetch with timeout helper - enforces max wait time
 */
async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  layerName: string
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        console.warn(`  ⏱️ [${layerName}] Timeout after ${timeoutMs}ms`);
        reject(new Error(`${layerName} timeout`));
      }, timeoutMs)
    )
  ]);
}

/**
 * Build enriched consciousness prompt with wisdom context
 *
 * This injects whatever wisdom arrived within the timeout window
 * into the consciousness prompt, creating resonant interference patterns
 * between different wisdom sources.
 */
export function enrichPromptWithWisdom(
  basePrompt: string,
  wisdom: WisdomResult
): string {
  let enrichedPrompt = basePrompt;

  // Inject IP Engine wisdom (Spiralogic Framework)
  if (wisdom.ip) {
    enrichedPrompt += `\n\n═══════════════════════════════════════════════════════════════
## 🔥 RELEVANT WISDOM FROM SPIRALOGIC FRAMEWORK
(Kelly's 35 years of consciousness research - Fire, Water, Earth, Air, Aether, Shadow)
═══════════════════════════════════════════════════════════════

${wisdom.ip}

This wisdom should inform your response - weave it naturally into your guidance.
`;
  }

  // Inject Elemental Oracle 2.0 wisdom (applied practices)
  if (wisdom.eo) {
    enrichedPrompt += `\n\n═══════════════════════════════════════════════════════════════
## 💧 ELEMENTAL PRACTICES & GUIDANCE
(Applied wisdom from Elemental Oracle 2.0 - specific practices for this moment)
═══════════════════════════════════════════════════════════════

${wisdom.eo}

These practices are specifically calibrated for what the explorer is experiencing.
`;
  }

  // Inject Knowledge Base patterns
  if (wisdom.kb && wisdom.kb.length > 0) {
    const kbContext = wisdom.kb.map((item: any) => item.content || item).join('\n\n');
    enrichedPrompt += `\n\n═══════════════════════════════════════════════════════════════
## 🌿 KNOWLEDGE BASE PATTERNS
(Historical patterns, practices, and contextual knowledge)
═══════════════════════════════════════════════════════════════

${kbContext}

Use these patterns to enrich your understanding and response.
`;
  }

  // Inject Resonance Field wisdom (multi-dimensional matching)
  if (wisdom.library && wisdom.library.length > 0) {
    enrichedPrompt += `\n\n═══════════════════════════════════════════════════════════════
## 🌊 RESONANCE FIELD - WISDOM ACTIVATED BY FIELD RESPONSE
(Multi-dimensional matching: semantic + emotional + elemental + developmental)
(Accessing Kelly's complete vault - 6,388+ wisdom chunks)
═══════════════════════════════════════════════════════════════

${wisdom.library}

This wisdom was ACTIVATED by resonant field response - not passively retrieved.
The system detected emotional tone, elemental needs, and developmental level.
This is Nature's intelligence speaking through elemental consciousness.
Weave this wisdom naturally into your response. Do not cite sources - let it flow through you.
`;
  }

  // Add synthesis note
  if (wisdom.layersActivated.length > 0) {
    enrichedPrompt += `\n\n═══════════════════════════════════════════════════════════════
## 🧠 CONSCIOUSNESS LAYERS ACTIVE
═══════════════════════════════════════════════════════════════

The following wisdom hemispheres contributed to this response in ${wisdom.duration}ms:
${wisdom.layersActivated.map(layer => `- ${layer}`).join('\n')}

Synthesize all available wisdom into a coherent, natural response.
DO NOT reference these layers explicitly - just let the wisdom flow through you.
`;
  }

  return enrichedPrompt;
}
