/**
 * Dual-Voice Orchestrator - Indigenous Wholeness + Therapeutic Clarity
 * Weaves sacred coherence with clinical insight without pathologizing
 */

import { logger } from '../utils/logger';
import { ConversationalContext } from './ConversationalPipeline';

export interface DualVoiceResponse {
  indigenousLens: {
    wholeness: string;      // Affirms existing coherence
    strength: string;       // Highlights elemental gifts
    ritual?: string;        // Sacred practice suggestion
  };
  therapeuticMirror: {
    friction: string;       // Names imbalance clearly
    pattern: string;        // Maps to elemental terms
    practice?: string;      // Clinical tool suggestion
  };
  integration: {
    woven: string;         // Both voices unified
    microStep: string;     // Immediate actionable
    continuity: string;    // What to carry forward
  };
}

export class DualVoiceOrchestrator {
  
  /**
   * 1. SESSION OPENING - Elemental Guide
   * Affirm wholeness before anything else
   */
  async openWithWholeness(ctx: ConversationalContext): Promise<string> {
    const elements = ['Fire', 'Water', 'Earth', 'Air', 'Aether'];
    const elementSymbols = {
      Fire: '🔥',
      Water: '💧',
      Earth: '🌍',
      Air: '💨',
      Aether: '✨'
    };
    
    // Sacred acknowledgment based on time of day
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 6) timeGreeting = 'You arrive in the sacred quiet before dawn';
    else if (hour < 12) timeGreeting = 'You enter as morning light grows';
    else if (hour < 18) timeGreeting = 'You come as the day holds its fullness';
    else timeGreeting = 'You arrive as evening deepens';
    
    return `🜂 ${timeGreeting}. You are already whole, already medicine. 
    
    Which element feels most alive in you right now?
    ${elements.map(e => `${elementSymbols[e]} ${e}`).join(' • ')}`;
  }
  
  /**
   * 2. MIRROR WHOLENESS - Indigenous Lens
   * Reflect coherence and elemental strengths
   */
  mirrorWholeness(userText: string, element: string): string {
    const elementalStrengths = {
      fire: 'your sacred rage that transforms, your passion that creates',
      water: 'your depth of feeling, your gift of emotional alchemy',
      earth: 'your grounded wisdom, your capacity to hold and nourish',
      air: 'your clarity of vision, your gift of perspective',
      aether: 'your connection to mystery, your bridge between worlds'
    };
    
    const strength = elementalStrengths[element.toLowerCase()] || 
                    'your unique medicine that no one else carries';
    
    return `🜃 I witness ${strength}. This is not a problem to solve but a power awakening. Your ${element} nature shows you're already in conversation with what matters.`;
  }
  
  /**
   * 3. NAME FRICTION - Therapeutic Mirror
   * Translate struggles into clear, non-pathological language
   */
  nameFriction(userText: string, detectedPatterns: any): string {
    // Detect imbalance without pathologizing
    const patterns = this.detectElementalImbalance(userText);
    
    let frictionNaming = '🜁 ';
    
    if (patterns.includes('overthinking')) {
      frictionNaming += 'I notice Air (mind) is spinning without Earth (ground) to settle it. ';
    }
    if (patterns.includes('emotional_overwhelm')) {
      frictionNaming += 'Water (feeling) is flooding without Fire (boundaries) to contain it. ';
    }
    if (patterns.includes('burnout')) {
      frictionNaming += 'Fire (energy) has consumed without Water (rest) to replenish. ';
    }
    if (patterns.includes('disconnection')) {
      frictionNaming += 'Aether (spirit) feels distant without Earth (embodiment) to anchor. ';
    }
    
    frictionNaming += 'This is information, not judgment. Your system is asking for rebalancing.';
    
    return frictionNaming;
  }
  
  /**
   * 4. INTEGRATED PRACTICE - Dual Voice
   * Offer both therapeutic and indigenous practices
   */
  offerIntegratedPractice(imbalance: string): DualVoiceResponse['integration'] {
    const practices = {
      'air_excess': {
        therapeutic: 'Try box breathing: 4 counts in, 4 hold, 4 out, 4 hold. This regulates your autonomic nervous system.',
        indigenous: 'Write your spinning thoughts on paper, then burn them safely. Let Fire transform Air back to Aether.',
        microStep: 'Before bed tonight, write one worry and place it outside your bedroom.'
      },
      'water_flood': {
        therapeutic: 'Use emotional surfing: name the feeling, locate it in your body, breathe into that space.',
        indigenous: 'Cry into running water (shower, stream, rain). Let Water know Water. Your tears are medicine returning home.',
        microStep: 'Next shower, let yourself make sound as the water runs.'
      },
      'fire_depletion': {
        therapeutic: 'Practice paced breathing with longer exhales to activate parasympathetic recovery.',
        indigenous: 'Light a candle for your Fire. Feed it with gentle breath. Promise to tend your inner flame daily.',
        microStep: 'Light one candle tomorrow morning, even for 30 seconds.'
      },
      'earth_absence': {
        therapeutic: 'Try bilateral stimulation: alternate tapping left and right sides of your body.',
        indigenous: 'Place bare feet on actual earth. Let the ground remember you. You belong here.',
        microStep: 'Touch one plant or tree with intention today.'
      }
    };
    
    const practice = practices[imbalance] || practices['air_excess'];
    
    return {
      woven: `Both paths lead home: ${practice.therapeutic} OR ${practice.indigenous}`,
      microStep: practice.microStep,
      continuity: `Remember: you're not broken, you're recalibrating.`
    };
  }
  
  /**
   * 5. SACRED WITNESS CLOSING
   * Return to wholeness narrative
   */
  closeWithWitness(element: string, practice: string): string {
    const closings = {
      fire: '🜔 Your Fire knows how to burn without consuming. Trust its wisdom.',
      water: '🜔 Your Water knows every tide returns. Flow with trust.',
      earth: '🜔 Your Earth remembers how to hold without grasping. Rest here.',
      air: '🜔 Your Air knows how to move without rushing. Breathe freely.',
      aether: '🜔 Your Aether bridges all worlds. You are never alone.'
    };
    
    const closing = closings[element.toLowerCase()] || closings.aether;
    
    return `${closing}
    
    ${practice}
    
    You are already whole. You walk tomorrow with this knowing.`;
  }
  
  /**
   * 6. CONTINUITY TRACKING
   * Log both friction and wholeness for spiral coherence
   */
  async logDualVoice(
    userId: string,
    sessionId: string,
    dualVoice: DualVoiceResponse
  ): Promise<void> {
    const continuityLog = {
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      wholeness: {
        strengths: dualVoice.indigenousLens.strength,
        ritual: dualVoice.indigenousLens.ritual
      },
      friction: {
        pattern: dualVoice.therapeuticMirror.pattern,
        practice: dualVoice.therapeuticMirror.practice
      },
      integration: dualVoice.integration,
      spiralPhase: this.calculateSpiralPhase(dualVoice)
    };
    
    logger.info('[DUAL-VOICE] Session continuity logged:', continuityLog);
    
    // Store for next session reference
    // This would integrate with your MemoryOrchestrator
  }
  
  /**
   * Helper: Detect elemental imbalance patterns
   */
  private detectElementalImbalance(text: string): string[] {
    const patterns = [];
    const lower = text.toLowerCase();
    
    if (lower.match(/can't stop thinking|racing thoughts|overthinking/)) {
      patterns.push('overthinking');
    }
    if (lower.match(/overwhelmed|drowning|too much feeling/)) {
      patterns.push('emotional_overwhelm');
    }
    if (lower.match(/exhausted|burnt out|no energy/)) {
      patterns.push('burnout');
    }
    if (lower.match(/disconnected|numb|empty/)) {
      patterns.push('disconnection');
    }
    
    return patterns;
  }
  
  /**
   * Helper: Calculate spiral phase from dual voice
   */
  private calculateSpiralPhase(dualVoice: DualVoiceResponse): string {
    // Maps therapeutic + indigenous insights to spiral position
    // This would integrate with your existing Spiralogic engine
    return 'integration_phase_2'; // Placeholder
  }
  
  /**
   * Main orchestration method
   */
  async orchestrateDualVoice(ctx: ConversationalContext): Promise<DualVoiceResponse> {
    // 1. Detect what's present
    const patterns = this.detectElementalImbalance(ctx.userText);
    const primaryImbalance = patterns[0] || 'air_excess';
    
    // 2. Generate dual-voice response
    const response: DualVoiceResponse = {
      indigenousLens: {
        wholeness: this.mirrorWholeness(ctx.userText, ctx.element),
        strength: `Your ${ctx.element} medicine is strong`,
        ritual: 'Light a candle for your knowing'
      },
      therapeuticMirror: {
        friction: this.nameFriction(ctx.userText, patterns),
        pattern: `${ctx.element} seeking balance`,
        practice: 'Try 4-7-8 breathing before sleep'
      },
      integration: this.offerIntegratedPractice(primaryImbalance)
    };
    
    // 3. Log for continuity
    await this.logDualVoice(ctx.userId, ctx.sessionId, response);
    
    return response;
  }
}

export const dualVoiceOrchestrator = new DualVoiceOrchestrator();