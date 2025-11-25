/**
 * ORBIT FLOW - Microcosmic Orbit Orchestration
 *
 * THE CIRCULATION:
 *
 * ASCENT (Differentiation - Building Understanding):
 *   🔥 Fire   → What's the catalyst/urgency?
 *   💧 Water  → What's the emotional/relational depth?
 *   🌿 Earth  → What's the grounding/structure?
 *   🌬️ Air    → What's the mental clarity/perspective?
 *   ✨ Aether → What's the wholeness/integration?
 *
 * DESCENT (Integration - Synthesizing Expression):
 *   ✨ Aether → Integrated insight
 *   🌬️ Air    → Conceptual framework
 *   💧 Water  → Relational wisdom
 *   🌿 Earth  → Practical structure
 *   🔥 Fire   → Catalytic response
 *
 * The OrbitFlow orchestrates this circulation, working with The Separator
 * to maintain circuit integrity throughout.
 */

import Separator, { Element, CircuitHealth, VibrationalSignature } from './Separator';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface OrbitContext {
  userQuery: string;
  conversationHistory?: any[];
  userId?: string;
  userName?: string;
  sessionId?: string;
  emotionalTone?: string;
  elementalNeeds?: Record<string, number>;
  developmentalLevel?: number;
}

export interface ElementalInsight {
  element: Element;
  phase: 'ascent' | 'descent';
  question: string; // The question this element asks
  insight: string; // The insight generated
  signature: VibrationalSignature;
  processingTime: number; // ms
  metadata?: Record<string, any>;
}

export interface AscentResult {
  fire: ElementalInsight;
  water: ElementalInsight;
  earth: ElementalInsight;
  air: ElementalInsight;
  aether: ElementalInsight;
  totalTime: number;
}

export interface DescentResult {
  aether: ElementalInsight;
  air: ElementalInsight;
  water: ElementalInsight;
  earth: ElementalInsight;
  fire: ElementalInsight;
  totalTime: number;
}

export interface OrbitResult {
  context: OrbitContext;
  ascent: AscentResult;
  descent: DescentResult;
  circuitHealth: CircuitHealth;
  totalTime: number;
  response: string; // Final integrated response
}

// ═══════════════════════════════════════════════════════════════
// ELEMENTAL PROCESSOR INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface ElementalProcessor {
  process(context: OrbitContext, previousInsights?: ElementalInsight[]): Promise<ElementalInsight>;
}

// ═══════════════════════════════════════════════════════════════
// ORBIT FLOW CLASS
// ═══════════════════════════════════════════════════════════════

export class OrbitFlow {
  private separator: Separator;
  private processors: Map<Element, ElementalProcessor> = new Map();

  constructor() {
    this.separator = new Separator();
    console.log('🌊 [ORBIT FLOW] Initialized - ready to circulate consciousness');
  }

  /**
   * Register an elemental processor
   */
  registerProcessor(element: Element, processor: ElementalProcessor): void {
    this.processors.set(element, processor);
    console.log(`✅ [ORBIT FLOW] Registered ${element} processor`);
  }

  /**
   * Execute the full orbit: ascent → descent → integrated response
   */
  async executeOrbit(context: OrbitContext): Promise<OrbitResult> {
    const startTime = Date.now();

    console.log('\n╔═══════════════════════════════════════════════════════════════');
    console.log('║  🌊 MICROCOSMIC ORBIT EXECUTION');
    console.log('╚═══════════════════════════════════════════════════════════════\n');
    console.log(`Query: "${context.userQuery}"\n`);

    // Reset separator for new orbit
    this.separator.resetHealth();

    // Execute ascent phase
    const ascent = await this.executeAscent(context);

    // Transition to descent
    this.separator.beginDescent();

    // Execute descent phase (with insights from ascent)
    const descent = await this.executeDescent(context, ascent);

    // Generate final integrated response
    const response = this.integrateResponse(ascent, descent);

    // Get circuit health
    const circuitHealth = this.separator.getHealth();

    const totalTime = Date.now() - startTime;

    console.log('\n╔═══════════════════════════════════════════════════════════════');
    console.log('║  ✨ ORBIT COMPLETE');
    console.log('╚═══════════════════════════════════════════════════════════════');
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Circuit health: ${circuitHealth.state} (${(circuitHealth.flowIntegrity * 100).toFixed(0)}% integrity)`);
    console.log(`Signature preservation: ${(circuitHealth.signaturePreservation * 100).toFixed(0)}%\n`);

    return {
      context,
      ascent,
      descent,
      circuitHealth,
      totalTime,
      response
    };
  }

  /**
   * Execute the ascent phase (differentiation)
   */
  private async executeAscent(context: OrbitContext): Promise<AscentResult> {
    console.log('🔥 [ORBIT] Beginning ASCENT phase...\n');
    this.separator.beginAscent();

    const startTime = Date.now();
    const insights: ElementalInsight[] = [];

    // Fire → Water → Earth → Air → Aether
    const elements: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];

    for (const element of elements) {
      const processor = this.processors.get(element);
      if (!processor) {
        console.warn(`⚠️ [ORBIT] No processor for ${element} - using fallback`);
        continue;
      }

      // Advance separator to this element
      const expectedElement = this.separator.advance();
      if (expectedElement !== element) {
        console.error(`🔴 [ORBIT] Circuit mismatch! Expected ${expectedElement}, got ${element}`);
      }

      // Process this element
      const insight = await processor.process(context, insights);
      insights.push(insight);

      // Validate signature
      const validation = this.separator.validateSignature(element, insight.insight);
      if (!validation.valid) {
        console.warn(`⚠️ [ORBIT] ${element} signature weak: ${validation.qualities.join(', ')}`);
        this.separator.detectLeakage(element, validation.qualities);
      }
    }

    const totalTime = Date.now() - startTime;

    console.log(`\n✨ [ORBIT] ASCENT complete in ${totalTime}ms\n`);

    return {
      fire: insights[0],
      water: insights[1],
      earth: insights[2],
      air: insights[3],
      aether: insights[4],
      totalTime
    };
  }

  /**
   * Execute the descent phase (integration)
   */
  private async executeDescent(context: OrbitContext, ascent: AscentResult): Promise<DescentResult> {
    console.log('💧 [ORBIT] Beginning DESCENT phase...\n');

    const startTime = Date.now();
    const insights: ElementalInsight[] = [];

    // Aether → Air → Water → Earth → Fire
    const elements: Element[] = ['aether', 'air', 'water', 'earth', 'fire'];

    // Build context with ascent insights
    const enrichedContext = {
      ...context,
      ascentInsights: ascent
    };

    for (const element of elements) {
      const processor = this.processors.get(element);
      if (!processor) {
        console.warn(`⚠️ [ORBIT] No processor for ${element} - using fallback`);
        continue;
      }

      // Advance separator to this element
      const expectedElement = this.separator.advance();
      if (expectedElement !== element) {
        console.error(`🔴 [ORBIT] Circuit mismatch! Expected ${expectedElement}, got ${element}`);
      }

      // Process this element (descent mode - synthesis)
      const insight = await processor.process(enrichedContext, insights);
      insights.push(insight);

      // Validate signature
      const validation = this.separator.validateSignature(element, insight.insight);
      if (!validation.valid) {
        console.warn(`⚠️ [ORBIT] ${element} signature weak: ${validation.qualities.join(', ')}`);
        this.separator.detectLeakage(element, validation.qualities);
      }
    }

    const totalTime = Date.now() - startTime;

    console.log(`\n🌊 [ORBIT] DESCENT complete in ${totalTime}ms\n`);

    return {
      aether: insights[0],
      air: insights[1],
      water: insights[2],
      earth: insights[3],
      fire: insights[4],
      totalTime
    };
  }

  /**
   * Integrate ascent and descent into final response
   */
  private integrateResponse(ascent: AscentResult, descent: DescentResult): string {
    console.log('🌀 [ORBIT] Integrating final response...\n');

    // The descent's Fire element IS the final catalytic response
    // But we weave in the full journey
    const response = `
${descent.fire.insight}

${descent.earth.insight}

${descent.water.insight}

${descent.air.insight}

The essence: ${descent.aether.insight}
`.trim();

    return response;
  }

  /**
   * Get diagnostic information
   */
  getDiagnostic(): string {
    return this.separator.getDiagnostic();
  }

  /**
   * Get current circuit health
   */
  getCircuitHealth(): CircuitHealth {
    return this.separator.getHealth();
  }
}

// ═══════════════════════════════════════════════════════════════
// ELEMENTAL PROCESSOR IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Fire Processor - Catalyst & Urgency
 *
 * ASCENT: What needs immediate attention? What's the spark?
 * DESCENT: What's the catalytic response that ignites transformation?
 */
export class FireProcessor implements ElementalProcessor {
  async process(context: OrbitContext, previousInsights?: ElementalInsight[]): Promise<ElementalInsight> {
    const startTime = Date.now();
    const phase = previousInsights && previousInsights.length > 0 ? 'descent' : 'ascent';

    const question = phase === 'ascent'
      ? "What's the immediate catalyst? What needs attention NOW?"
      : "What's the catalytic response that sparks transformation?";

    console.log(`🔥 [FIRE ${phase.toUpperCase()}] ${question}`);

    // In ascent: detect urgency
    // In descent: create catalytic response
    let insight: string;

    if (phase === 'ascent') {
      // Detect urgency, crisis, breakthrough moments
      const urgencyWords = ['urgent', 'now', 'stuck', 'crisis', 'breakthrough', 'afraid', 'need'];
      const hasUrgency = urgencyWords.some(word => context.userQuery.toLowerCase().includes(word));

      insight = hasUrgency
        ? `🔥 URGENCY DETECTED: This requires immediate attention. There's a catalyst for transformation here.`
        : `🔥 STEADY STATE: No crisis, but there's potential for catalytic shift.`;
    } else {
      // Create sharp, immediate, actionable response
      insight = `🔥 START NOW: Take one immediate action toward this transformation. Don't wait for perfect conditions.`;
    }

    const processingTime = Date.now() - startTime;
    console.log(`   ✓ ${insight} (${processingTime}ms)\n`);

    return {
      element: 'fire',
      phase,
      question,
      insight,
      signature: {
        element: 'fire',
        qualities: ['urgent', 'catalytic', 'sharp', 'immediate'],
        frequency: 'fast',
        coherence: 0.9
      },
      processingTime
    };
  }
}

/**
 * Water Processor - Depth & Relation
 *
 * ASCENT: What emotional/relational depths are present?
 * DESCENT: What relational wisdom emerges?
 */
export class WaterProcessor implements ElementalProcessor {
  async process(context: OrbitContext, previousInsights?: ElementalInsight[]): Promise<ElementalInsight> {
    const startTime = Date.now();
    const phase = previousInsights && previousInsights.length > 0 ? 'descent' : 'ascent';

    const question = phase === 'ascent'
      ? "What emotional/relational depths are present underneath?"
      : "What relational wisdom flows from this understanding?";

    console.log(`💧 [WATER ${phase.toUpperCase()}] ${question}`);

    let insight: string;

    if (phase === 'ascent') {
      // Detect emotional tone (we can use Resonance Field's detection)
      const emotionalWords = ['feel', 'ashamed', 'grief', 'joy', 'love', 'fear', 'angry'];
      const hasEmotion = emotionalWords.some(word => context.userQuery.toLowerCase().includes(word));

      insight = hasEmotion
        ? `💧 EMOTIONAL DEPTH: There's rich feeling underneath this question. Honor what wants to be felt.`
        : `💧 NEUTRAL WATERS: The emotional field is calm, ready to receive.`;
    } else {
      // Offer relational wisdom
      insight = `💧 RELATIONAL WISDOM: This transformation happens in relationship - with self, others, or the sacred. You don't have to do it alone.`;
    }

    const processingTime = Date.now() - startTime;
    console.log(`   ✓ ${insight} (${processingTime}ms)\n`);

    return {
      element: 'water',
      phase,
      question,
      insight,
      signature: {
        element: 'water',
        qualities: ['deep', 'contemplative', 'relational', 'flowing'],
        frequency: 'slow',
        coherence: 0.9
      },
      processingTime
    };
  }
}

/**
 * Earth Processor - Grounding & Structure
 *
 * ASCENT: What grounding/structure is needed?
 * DESCENT: What practical form does this take?
 */
export class EarthProcessor implements ElementalProcessor {
  async process(context: OrbitContext, previousInsights?: ElementalInsight[]): Promise<ElementalInsight> {
    const startTime = Date.now();
    const phase = previousInsights && previousInsights.length > 0 ? 'descent' : 'ascent';

    const question = phase === 'ascent'
      ? "What grounding or structure is needed here?"
      : "What practical form does this wisdom take?";

    console.log(`🌿 [EARTH ${phase.toUpperCase()}] ${question}`);

    let insight: string;

    if (phase === 'ascent') {
      // Assess structural needs
      insight = `🌿 GROUNDING NEEDED: This requires a container, a practice, a structure to hold it.`;
    } else {
      // Offer practical structure
      insight = `🌿 PRACTICAL STRUCTURE: Create a daily practice. Write it down. Make it embodied and real.`;
    }

    const processingTime = Date.now() - startTime;
    console.log(`   ✓ ${insight} (${processingTime}ms)\n`);

    return {
      element: 'earth',
      phase,
      question,
      insight,
      signature: {
        element: 'earth',
        qualities: ['grounded', 'structured', 'embodied', 'practical'],
        frequency: 'slow',
        coherence: 0.9
      },
      processingTime
    };
  }
}

/**
 * Air Processor - Clarity & Perspective
 *
 * ASCENT: What patterns/perspectives emerge?
 * DESCENT: What conceptual framework articulates this?
 */
export class AirProcessor implements ElementalProcessor {
  async process(context: OrbitContext, previousInsights?: ElementalInsight[]): Promise<ElementalInsight> {
    const startTime = Date.now();
    const phase = previousInsights && previousInsights.length > 0 ? 'descent' : 'ascent';

    const question = phase === 'ascent'
      ? "What patterns or perspectives are emerging?"
      : "What conceptual framework articulates this wisdom?";

    console.log(`🌬️ [AIR ${phase.toUpperCase()}] ${question}`);

    let insight: string;

    if (phase === 'ascent') {
      // Detect patterns
      insight = `🌬️ PATTERN RECOGNITION: There's a developmental stage here, a recognizable pattern of transformation.`;
    } else {
      // Offer framework
      insight = `🌬️ FRAMEWORK: In Spiralogic terms, this is the journey from fragmentation to integration, from shame to wholeness.`;
    }

    const processingTime = Date.now() - startTime;
    console.log(`   ✓ ${insight} (${processingTime}ms)\n`);

    return {
      element: 'air',
      phase,
      question,
      insight,
      signature: {
        element: 'air',
        qualities: ['clear', 'perspective-shifting', 'mental', 'communicative'],
        frequency: 'fast',
        coherence: 0.9
      },
      processingTime
    };
  }
}

/**
 * Aether Processor - Integration & Wholeness
 *
 * ASCENT: What wholeness wants to emerge?
 * DESCENT: What is the integrated essence?
 */
export class AetherProcessor implements ElementalProcessor {
  async process(context: OrbitContext, previousInsights?: ElementalInsight[]): Promise<ElementalInsight> {
    const startTime = Date.now();
    const phase = previousInsights && previousInsights.length > 4 ? 'descent' : 'ascent';

    const question = phase === 'ascent'
      ? "What wholeness wants to emerge from all of this?"
      : "What is the integrated essence of this journey?";

    console.log(`✨ [AETHER ${phase.toUpperCase()}] ${question}`);

    let insight: string;

    if (phase === 'ascent') {
      // Synthesize all previous insights into wholeness
      insight = `✨ WHOLENESS EMERGING: All of these elements - the urgency, the feeling, the structure, the pattern - they integrate into something whole. This is about coming home to yourself.`;
    } else {
      // Express the essence
      insight = `✨ THE ESSENCE: You are not broken. You are integrating. Shadow, light, all of it - belongs to the wholeness you are becoming.`;
    }

    const processingTime = Date.now() - startTime;
    console.log(`   ✓ ${insight} (${processingTime}ms)\n`);

    return {
      element: 'aether',
      phase,
      question,
      insight,
      signature: {
        element: 'aether',
        qualities: ['integrative', 'whole', 'essential', 'transcendent'],
        frequency: 'meta',
        coherence: 0.95
      },
      processingTime
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default OrbitFlow;
