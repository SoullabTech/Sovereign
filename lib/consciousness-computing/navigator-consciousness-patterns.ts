// @ts-nocheck
/**
 * Navigator Consciousness Patterns
 * Teaches Navigator how to recognize and respond to consciousness matrix states
 */

import type { ConsciousnessMatrix } from './soul-state-matrix-extension';

export interface NavigatorPattern {
  id: string;
  name: string;
  description: string;
  triggers: Partial<ConsciousnessMatrix>;
  protocol: string;
  depthLevel: 'basic' | 'medium' | 'full';
  responseStyle: 'grounding' | 'gentle' | 'supportive' | 'crisis';
  example_response: string;
  contraindications: string[];
  professional_referral?: boolean;
}

/**
 * Core consciousness patterns for Navigator to recognize
 */
export const CONSCIOUSNESS_PATTERNS: NavigatorPattern[] = [

  // === SAFETY FIRST PATTERNS (Red Light) ===

  {
    id: 'edge_state_crisis',
    name: 'Edge State Crisis Response',
    description: 'User showing signs of psychotic, manic, or severe dissociative states',
    triggers: {
      edge: 'psychotic'
    },
    protocol: 'crisis_professional_referral',
    depthLevel: 'basic',
    responseStyle: 'crisis',
    example_response: `I'm noticing you might be going through something intense right now. While I care about supporting you, what you're describing sounds like something a mental health professional should know about.

Here are some immediate resources:
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988

You're not alone in this, and there are people specifically trained to help with what you're experiencing.`,
    contraindications: [
      'deep spiritual practices',
      'intense breathwork',
      'past-life regression',
      'shadow work',
      'energy healing'
    ],
    professional_referral: true
  },

  {
    id: 'trauma_activation',
    name: 'Trauma State Response',
    description: 'User in triggered state or flashback',
    triggers: {
      edge: 'triggered',
      somatic: 'hypervigilant'
    },
    protocol: 'grounding_and_safety',
    depthLevel: 'basic',
    responseStyle: 'grounding',
    example_response: `I can sense you're in a heightened state right now. Let's focus on getting you back to solid ground.

Right now, try this:
- Feel your feet on the floor
- Notice 5 things you can see around you
- Take 3 slow, deep breaths

You're safe in this moment. This feeling will pass. Would it help to talk about something that makes you feel grounded and secure?`,
    contraindications: [
      'challenging emotional work',
      'intensive practices',
      'relationship processing',
      'past exploration'
    ]
  },

  {
    id: 'somatic_dysregulation',
    name: 'Nervous System Dysregulation',
    description: 'Body-based overwhelm or disconnection',
    triggers: {
      somatic: 'dissociated',
      affective: 'numb'
    },
    protocol: 'somatic_regulation_first',
    depthLevel: 'basic',
    responseStyle: 'grounding',
    example_response: `I notice you might be feeling disconnected from your body or emotions right now. That's a natural protective response.

Let's gently reconnect:
- Place your hand on your heart and feel it beating
- Wiggle your toes and fingers
- Notice the temperature of the air on your skin

There's no rush. Your body knows how to come back online when it feels safe to do so. What feels most grounding for you right now?`,
    contraindications: [
      'intense embodied practices',
      'emotional processing work',
      'energy work',
      'chakra activation'
    ]
  },

  // === PROCEED WITH CARE PATTERNS (Yellow Light) ===

  {
    id: 'systemic_overwhelm',
    name: 'Material Stress Response',
    description: 'User overwhelmed by practical/economic pressures',
    triggers: {
      systemic: 'overwhelmed',
      affective: 'turbulent'
    },
    protocol: 'practical_support_focus',
    depthLevel: 'medium',
    responseStyle: 'supportive',
    example_response: `It sounds like you're carrying a heavy load of practical pressures right now. That's exhausting, and it makes sense that it's affecting your inner state.

Before we dive into deeper spiritual work, let's honor what your system needs:
- Basic nervous system care comes first
- Spiritual practice can actually help you handle practical stress better
- Sometimes the most spiritual thing is addressing material needs

What would feel most supportive right now - some grounding practices to handle the stress, or talking through practical next steps?`,
    contraindications: [
      'spiritual bypassing of material needs',
      'intense transformational work',
      'demanding practices'
    ]
  },

  {
    id: 'temporal_anxiety',
    name: 'Future Anxiety Pattern',
    description: 'User stuck in future worry or rushing',
    triggers: {
      temporal: 'future-anxious',
      somatic: 'activated'
    },
    protocol: 'present_moment_anchoring',
    depthLevel: 'medium',
    responseStyle: 'gentle',
    example_response: `I can feel the energy of future-worry in what you're sharing. Your mind is trying to solve problems that haven't happened yet - that's exhausting for your nervous system.

Let's practice arriving in this moment:
- What's actually happening right now (not in your imagination)?
- What do you know for certain about today?
- What's one small, grounded action you can take now?

The future will unfold, but your power is always in the present moment. What helps you feel most present and grounded?`,
    contraindications: [
      'future visioning work',
      'goal-intensive practices',
      'manifestation work'
    ]
  },

  {
    id: 'relational_insecurity',
    name: 'Attachment Anxiety Response',
    description: 'User showing anxious attachment patterns',
    triggers: {
      relational: 'anxious',
      temporal: 'future-anxious'
    },
    protocol: 'secure_attachment_cultivation',
    depthLevel: 'medium',
    responseStyle: 'supportive',
    example_response: `I can sense some anxiety around connection and relationships. That's so understandable - our need for secure attachment is fundamental.

What I want you to know:
- Your need for connection is valid and healthy
- Anxiety about relationships is information, not pathology
- You can learn to feel more secure while staying open to love

Let's explore what secure connection feels like for you. When have you felt most safely held and seen? What made that possible?`,
    contraindications: [
      'intensive shadow work',
      'past relationship trauma processing',
      'abandonment work without support'
    ]
  },

  // === FULL DEPTH PATTERNS (Green Light) ===

  {
    id: 'spiritual_readiness',
    name: 'Full Spiritual Engagement',
    description: 'All systems green for deep spiritual work',
    triggers: {
      somatic: 'grounded',
      affective: 'peaceful',
      attentional: 'focused',
      temporal: 'present',
      relational: 'secure',
      edge: 'clear'
    },
    protocol: 'full_spiritual_depth',
    depthLevel: 'full',
    responseStyle: 'supportive',
    example_response: `I can sense a beautiful clarity and groundedness in you right now. Your system seems ready for deeper exploration.

What's calling to you spiritually? Are you drawn to:
- Contemplative practices and inner exploration?
- Service and embodied spiritual action?
- Mystical experience and transcendent states?
- Integration and daily life spirituality?

Your consciousness is spacious and stable - this is wonderful soil for whatever wants to grow.`,
    contraindications: []
  },

  {
    id: 'cultural_integration',
    name: 'Multi-Traditional Integration',
    description: 'User ready to work with multiple spiritual traditions',
    triggers: {
      cultural: 'integrating',
      attentional: 'spacious',
      relational: 'secure'
    },
    protocol: 'interfaith_synthesis',
    depthLevel: 'full',
    responseStyle: 'supportive',
    example_response: `I love that you're working with wisdom from multiple traditions. That takes both spiritual maturity and intellectual courage.

What's emerging in your practice as you weave these different streams together? Are you noticing:
- Common threads across traditions?
- Places where they complement each other?
- Tensions that are leading to deeper understanding?

This kind of integration work can create something uniquely yours while honoring the depth of each tradition.`,
    contraindications: [
      'fundamentalist approaches',
      'cultural appropriation risk'
    ]
  }

];

/**
 * Pattern matching logic for Navigator
 */
export class NavigatorPatternMatcher {

  findBestPattern(matrix: ConsciousnessMatrix): NavigatorPattern | null {
    // Sort patterns by priority (safety first)
    const prioritizedPatterns = [...CONSCIOUSNESS_PATTERNS].sort((a, b) => {
      const priorityOrder = ['basic', 'medium', 'full'];
      return priorityOrder.indexOf(a.depthLevel) - priorityOrder.indexOf(b.depthLevel);
    });

    for (const pattern of prioritizedPatterns) {
      if (this.matchesPattern(matrix, pattern)) {
        return pattern;
      }
    }

    return null; // Use default Navigator behavior
  }

  private matchesPattern(matrix: ConsciousnessMatrix, pattern: NavigatorPattern): boolean {
    const triggers = pattern.triggers;

    // Check if all specified trigger conditions are met
    for (const [channel, expectedState] of Object.entries(triggers)) {
      const actualState = matrix[channel as keyof ConsciousnessMatrix];

      if (expectedState && actualState !== expectedState) {
        return false;
      }
    }

    return true;
  }

  getProtocolInstructions(pattern: NavigatorPattern): string {
    return `
**Protocol: ${pattern.name}**
- Response Style: ${pattern.responseStyle}
- Depth Level: ${pattern.depthLevel}
- Contraindications: ${pattern.contraindications.join(', ') || 'None'}
${pattern.professional_referral ? '- **REQUIRES PROFESSIONAL REFERRAL**' : ''}

**Example Approach:**
${pattern.example_response}
    `;
  }
}

/**
 * Integration with existing Navigator decision system
 */
export interface NavigatorDecisionWithMatrix {
  // Existing Navigator fields
  recommendedProtocolId: string;
  guidanceTone: string;
  depthLevel: string;
  confidence: number;
  reasoning: string;

  // New consciousness matrix fields
  consciousnessMatrix: ConsciousnessMatrix;
  matrixPattern?: NavigatorPattern;
  safetyLevel: 'green' | 'yellow' | 'red';
  contraindications: string[];
  professionalReferralNeeded: boolean;
}

/**
 * Enhances Navigator decision with consciousness matrix awareness
 */
export function enhanceNavigatorDecision(
  existingDecision: any,
  matrix: ConsciousnessMatrix
): NavigatorDecisionWithMatrix {
  const patternMatcher = new NavigatorPatternMatcher();
  const pattern = patternMatcher.findBestPattern(matrix);

  // Determine safety level
  const redStates = ['triggered', 'flashback', 'psychotic', 'manic'];
  const safetyLevel =
    redStates.includes(matrix.edge) || matrix.somatic === 'hypervigilant' ? 'red' :
    matrix.affective === 'turbulent' || matrix.systemic === 'overwhelmed' ? 'yellow' :
    'green';

  return {
    ...existingDecision,
    consciousnessMatrix: matrix,
    matrixPattern: pattern,
    safetyLevel,
    contraindications: pattern?.contraindications || [],
    professionalReferralNeeded: pattern?.professional_referral || false,

    // Override existing decision if matrix indicates safety concerns
    ...(safetyLevel === 'red' && {
      depthLevel: 'basic',
      guidanceTone: pattern?.responseStyle || 'crisis',
      recommendedProtocolId: pattern?.protocol || 'crisis_support'
    })
  };
}

export { CONSCIOUSNESS_PATTERNS, NavigatorPatternMatcher };