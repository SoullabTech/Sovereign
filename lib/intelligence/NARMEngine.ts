/**
 * NARM (NEUROAFFECTIVE RELATIONAL MODEL) ENGINE
 *
 * Based on Laurence Heller's NARM
 *
 * Detects:
 * - 5 Adaptive Survival Styles (developmental trauma patterns)
 * - Connection vs Disconnection capacity
 * - Agency vs Collapse
 * - Shame-based identifications
 * - Core capacity disruptions
 *
 * Core Insight: Developmental trauma creates patterns where people disconnect
 * from themselves/others while staying regulated OR connect but dysregulate.
 * NARM works toward: Connection + Regulation simultaneously.
 *
 * Elemental Resonance: EARTH (developmental foundations) + WATER (relational capacity)
 */

export interface NARMState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // The 5 Adaptive Survival Styles
  survivalStyles: {
    // 1. CONNECTION (birth-6 months): Right to exist
    connection: {
      detected: boolean;
      coreDisruption: 'existential-dread' | 'right-to-exist' | 'none';
      symptoms: string[];
      indicators: string[];
    };

    // 2. ATTUNEMENT (6-18 months): Right to have needs
    attunement: {
      detected: boolean;
      coreDisruption: 'needs-denied' | 'self-sufficiency' | 'none';
      symptoms: string[];
      indicators: string[];
    };

    // 3. TRUST (18-36 months): Right to trust
    trust: {
      detected: boolean;
      coreDisruption: 'mistrust' | 'hyper-vigilance' | 'none';
      symptoms: string[];
      indicators: string[];
    };

    // 4. AUTONOMY (3-4 years): Right to be autonomous
    autonomy: {
      detected: boolean;
      coreDisruption: 'shame' | 'enmeshment' | 'none';
      symptoms: string[];
      indicators: string[];
    };

    // 5. LOVE-SEXUALITY (4+ years): Right to love and be loved
    loveSexuality: {
      detected: boolean;
      coreDisruption: 'heartbreak' | 'performance' | 'none';
      symptoms: string[];
      indicators: string[];
    };
  };

  // Connection Capacity
  connectionCapacity: {
    withSelf: number; // 0-1 (can I connect to my own experience?)
    withOthers: number; // 0-1 (can I connect to others?)
    whileRegulated: boolean; // Key NARM question: Can you connect AND stay regulated?
    pattern: 'disconnected-regulated' | 'connected-dysregulated' | 'connected-regulated' | 'disconnected-dysregulated';
    description: string;
  };

  // Agency vs Collapse
  agency: {
    level: number; // 0-1 (0 = collapse, 1 = full agency)
    state: 'active-agency' | 'passive-collapse' | 'oscillating';
    indicators: string[];
  };

  // Shame-Based Identifications (core issue in NARM)
  shameIdentifications: {
    detected: boolean;
    identities: string[]; // "I am broken", "I am too much", etc.
    strength: number; // 0-1 (how fused with shame identity)
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    earth: number; // Developmental foundation work
    water: number; // Relational, connection capacity
  };
}

export class NARMEngine {
  extract(text: string): NARMState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    const survivalStyles = this.detectSurvivalStyles(lower);
    const connectionCapacity = this.detectConnectionCapacity(lower);
    const agency = this.detectAgency(lower);
    const shameIdentifications = this.detectShameIdentifications(lower);

    const elementalResonance = this.calculateElementalResonance(connectionCapacity, survivalStyles);

    Object.values(survivalStyles).forEach(style => {
      if (style.detected) indicators.push(...style.indicators);
    });
    if (shameIdentifications.detected) indicators.push(...shameIdentifications.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? 0.7 : 0;

    return {
      detected,
      confidence,
      indicators,
      survivalStyles,
      connectionCapacity,
      agency,
      shameIdentifications,
      elementalResonance
    };
  }

  private detectSurvivalStyles(text: string): NARMState['survivalStyles'] {
    return {
      connection: this.detectConnectionStyle(text),
      attunement: this.detectAttunementStyle(text),
      trust: this.detectTrustStyle(text),
      autonomy: this.detectAutonomyStyle(text),
      loveSexuality: this.detectLoveSexualityStyle(text)
    };
  }

  private detectConnectionStyle(text: string): NARMState['survivalStyles']['connection'] {
    let detected = false;
    let coreDisruption: 'existential-dread' | 'right-to-exist' | 'none' = 'none';
    const symptoms: string[] = [];
    const indicators: string[] = [];

    if (/\b(shouldn't exist|wish i (wasn't|weren't) born|don't belong here)\b/i.test(text)) {
      detected = true;
      coreDisruption = 'right-to-exist';
      symptoms.push('existential shame');
      indicators.push('connection-style');
    }

    if (/\b(empty|void|numb|dissociated|not here)\b/i.test(text)) {
      detected = true;
      symptoms.push('dissociation/emptiness');
    }

    return { detected, coreDisruption, symptoms, indicators };
  }

  private detectAttunementStyle(text: string): NARMState['survivalStyles']['attunement'] {
    let detected = false;
    let coreDisruption: 'needs-denied' | 'self-sufficiency' | 'none' = 'none';
    const symptoms: string[] = [];
    const indicators: string[] = [];

    if (/\b(don't have needs|needs don't matter|can't (have|express) needs)\b/i.test(text)) {
      detected = true;
      coreDisruption = 'needs-denied';
      symptoms.push('need-denial');
      indicators.push('attunement-style');
    }

    if (/\b(do it myself|don't need (anyone|help)|self-sufficient)\b/i.test(text)) {
      detected = true;
      coreDisruption = 'self-sufficiency';
      symptoms.push('counter-dependent');
    }

    return { detected, coreDisruption, symptoms, indicators };
  }

  private detectTrustStyle(text: string): NARMState['survivalStyles']['trust'] {
    let detected = false;
    let coreDisruption: 'mistrust' | 'hyper-vigilance' | 'none' = 'none';
    const symptoms: string[] = [];
    const indicators: string[] = [];

    if (/\b(can't trust|don't trust|trust (issues|no one))\b/i.test(text)) {
      detected = true;
      coreDisruption = 'mistrust';
      symptoms.push('mistrust');
      indicators.push('trust-style');
    }

    if (/\b(hypervigilant|on guard|watching|suspicious)\b/i.test(text)) {
      detected = true;
      coreDisruption = 'hyper-vigilance';
      symptoms.push('hypervigilance');
    }

    return { detected, coreDisruption, symptoms, indicators };
  }

  private detectAutonomyStyle(text: string): NARMState['survivalStyles']['autonomy'] {
    let detected = false;
    let coreDisruption: 'shame' | 'enmeshment' | 'none' = 'none';
    const symptoms: string[] = [];
    const indicators: string[] = [];

    if (/\b(ashamed|shame|humiliated|wrong|bad)\b/i.test(text)) {
      detected = true;
      coreDisruption = 'shame';
      symptoms.push('shame-based identity');
      indicators.push('autonomy-style');
    }

    if (/\b(enmeshed|can't separate|guilt.*independent|merged)\b/i.test(text)) {
      detected = true;
      coreDisruption = 'enmeshment';
      symptoms.push('enmeshment');
    }

    return { detected, coreDisruption, symptoms, indicators };
  }

  private detectLoveSexualityStyle(text: string): NARMState['survivalStyles']['loveSexuality'] {
    let detected = false;
    let coreDisruption: 'heartbreak' | 'performance' | 'none' = 'none';
    const symptoms: string[] = [];
    const indicators: string[] = [];

    if (/\b(heartbreak|heartbroken|heart (closed|shut)|can't (love|open))\b/i.test(text)) {
      detected = true;
      coreDisruption = 'heartbreak';
      symptoms.push('heart-closed');
      indicators.push('love-sexuality-style');
    }

    if (/\b(perform|performing|seduce|charm|prove)\b/i.test(text)) {
      detected = true;
      coreDisruption = 'performance';
      symptoms.push('performance-based relating');
    }

    return { detected, coreDisruption, symptoms, indicators };
  }

  private detectConnectionCapacity(text: string): NARMState['connectionCapacity'] {
    let withSelf = 0.5;
    let withOthers = 0.5;
    let whileRegulated = false;
    let pattern: NARMState['connectionCapacity']['pattern'] = 'disconnected-regulated';
    let description = '';

    // Connection to self
    if (/\b(connect (to|with) myself|feel myself|in touch with)\b/i.test(text)) {
      withSelf = 0.8;
    }
    if (/\b(disconnected from myself|numb|don't feel)\b/i.test(text)) {
      withSelf = 0.2;
    }

    // Connection to others
    if (/\b(connect (to|with) (others|people|them)|feel (close|connected))\b/i.test(text)) {
      withOthers = 0.8;
    }
    if (/\b(can't connect|isolated|alone|distant)\b/i.test(text)) {
      withOthers = 0.2;
    }

    // Regulation
    const regulated = /\b(calm|regulated|stable|grounded)\b/i.test(text);
    const dysregulated = /\b(dysregulated|overwhelm|flooded|frantic)\b/i.test(text);

    // Determine pattern
    if (withSelf > 0.6 && withOthers > 0.6 && regulated) {
      pattern = 'connected-regulated';
      whileRegulated = true;
      description = 'Connected to self AND others while staying regulated (NARM goal)';
    } else if (withSelf > 0.6 && withOthers > 0.6 && dysregulated) {
      pattern = 'connected-dysregulated';
      description = 'Connected but dysregulated (contact overwhelms)';
    } else if ((withSelf < 0.4 || withOthers < 0.4) && regulated) {
      pattern = 'disconnected-regulated';
      description = 'Regulated through disconnection (NARM core pattern)';
    } else {
      pattern = 'disconnected-dysregulated';
      description = 'Disconnected and dysregulated (crisis state)';
    }

    return { withSelf, withOthers, whileRegulated, pattern, description };
  }

  private detectAgency(text: string): NARMState['agency'] {
    let level = 0.5;
    let state: 'active-agency' | 'passive-collapse' | 'oscillating' = 'oscillating';
    const indicators: string[] = [];

    // Active agency
    if (/\b(i (can|will|choose|decide)|taking action|agency)\b/i.test(text)) {
      level = 0.8;
      state = 'active-agency';
      indicators.push('active-agency');
    }

    // Passive collapse
    if (/\b(helpless|powerless|can't do anything|collapse|give up)\b/i.test(text)) {
      level = 0.2;
      state = 'passive-collapse';
      indicators.push('passive-collapse');
    }

    return { level, state, indicators };
  }

  private detectShameIdentifications(text: string): NARMState['shameIdentifications'] {
    let detected = false;
    const identities: string[] = [];
    let strength = 0.5;
    const indicators: string[] = [];

    const shameIdentities = [
      { pattern: /\b(i am|i'm) broken\b/i, identity: "I am broken" },
      { pattern: /\b(i am|i'm) too much\b/i, identity: "I am too much" },
      { pattern: /\b(i am|i'm) not enough\b/i, identity: "I am not enough" },
      { pattern: /\b(i am|i'm) (bad|wrong|defective)\b/i, identity: "I am defective/bad" },
      { pattern: /\b(i am|i'm) unlovable\b/i, identity: "I am unlovable" }
    ];

    for (const { pattern, identity } of shameIdentities) {
      if (pattern.test(text)) {
        detected = true;
        identities.push(identity);
        strength = 0.8;
        indicators.push('shame-based-identity');
      }
    }

    return { detected, identities, strength, indicators };
  }

  private calculateElementalResonance(
    connection: NARMState['connectionCapacity'],
    styles: NARMState['survivalStyles']
  ): NARMState['elementalResonance'] {
    const earth = 0.7; // Developmental foundation work
    const water = (connection.withSelf + connection.withOthers) / 2; // Relational capacity
    return { earth, water };
  }
}

export const narmEngine = new NARMEngine();
