import { EventEmitter } from 'events';

interface SomaticState {
  tensionLevel: number;
  tensionLocations: Map<string, number>;
  breathDepth: number;
  breathRate: number;
  groundedness: number;
  embodiedPresence: number;
  openness: number;
}

interface PresenceInvitation {
  primary: string;
  somatic: string;
  breath: string;
  grounding: string;
  integration: string;
}

export class ShouldersDropResolution extends EventEmitter {
  private readonly TENSION_THRESHOLD = 0.7;
  private readonly PRESENCE_THRESHOLD = 0.6;
  private patternLibrary: Map<string, RegExp[]>;
  private invitationTemplates: Map<string, PresenceInvitation>;

  constructor() {
    super();
    this.patternLibrary = this.initializePatternLibrary();
    this.invitationTemplates = this.initializeInvitationTemplates();
  }

  private initializePatternLibrary(): Map<string, RegExp[]> {
    const patterns = new Map<string, RegExp[]>();

    patterns.set('tension', [
      /stress|anxious|worried|nervous|tense/i,
      /overwhelm|too much|can't handle|drowning/i,
      /racing|spinning|spiraling|frantic/i,
      /tight|clenched|holding|gripping/i,
      /pressure|weight|heavy|burden/i
    ]);

    patterns.set('rushing', [
      /hurry|rush|quick|fast|asap/i,
      /urgent|immediately|now|right away/i,
      /no time|deadline|behind|late/i,
      /need to|have to|must|should/i
    ]);

    patterns.set('disconnection', [
      /confused|lost|unclear|don't understand/i,
      /scattered|fragmented|all over/i,
      /numb|empty|nothing|void/i,
      /distant|far away|disconnected|floating/i
    ]);

    patterns.set('activation', [
      /angry|frustrated|irritated|annoyed/i,
      /triggered|reactive|defensive/i,
      /fight|argue|conflict|battle/i,
      /hot|burning|fire|explosive/i
    ]);

    patterns.set('collapse', [
      /exhausted|tired|drained|depleted/i,
      /give up|can't|hopeless|pointless/i,
      /heavy|sinking|drowning|suffocating/i,
      /stuck|frozen|paralyzed|immobilized/i
    ]);

    return patterns;
  }

  private initializeInvitationTemplates(): Map<string, PresenceInvitation> {
    const templates = new Map<string, PresenceInvitation>();

    templates.set('high_tension', {
      primary: "I notice some intensity here. Let's take a moment.",
      somatic: "Feel your shoulders. Are they near your ears? Let them drop, just a little.",
      breath: "Take one breath that's slightly deeper than the last.",
      grounding: "Feel where your body touches the chair or ground.",
      integration: "From this slightly softer place, let's continue."
    });

    templates.set('rushing', {
      primary: "There's no rush here. We have time.",
      somatic: "Notice the pace in your body. Can you slow down by 10%?",
      breath: "Let your exhale be just a bit longer than your inhale.",
      grounding: "Feel your feet. Wiggle your toes if it helps.",
      integration: "At this pace, what feels most important?"
    });

    templates.set('disconnection', {
      primary: "Let's come back to something simple and concrete.",
      somatic: "Place one hand on your chest, one on your belly.",
      breath: "Feel the breath moving under your hands.",
      grounding: "Name three things you can physically touch right now.",
      integration: "Starting from what you can feel, we'll build from there."
    });

    templates.set('activation', {
      primary: "I feel the charge here. Let's create some space.",
      somatic: "Shake out your hands for a moment. Let them be loose.",
      breath: "Three breaths, making the exhale like a sigh.",
      grounding: "Press your feet into the floor. Feel that solid support.",
      integration: "With this discharge, what wants to be expressed?"
    });

    templates.set('collapse', {
      primary: "This heaviness is valid. Let's honor it.",
      somatic: "Don't try to sit up straight. Let your body be supported.",
      breath: "Just notice your breath, without changing it.",
      grounding: "Feel the chair or floor holding you completely.",
      integration: "From this place of being held, what's one small thing?"
    });

    templates.set('gentle', {
      primary: "Let's take a moment to arrive more fully.",
      somatic: "A gentle check - how are your shoulders?",
      breath: "One conscious breath, at your own pace.",
      grounding: "Feel the stability beneath you.",
      integration: "Ready when you are."
    });

    return templates;
  }

  /**
   * Assess somatic state from input
   */
  async assess(input: string): Promise<SomaticState> {
    const state: SomaticState = {
      tensionLevel: this.detectTensionLevel(input),
      tensionLocations: this.locateTension(input),
      breathDepth: this.assessBreathDepth(input),
      breathRate: this.assessBreathRate(input),
      groundedness: this.assessGroundedness(input),
      embodiedPresence: 0,
      openness: this.assessOpenness(input)
    };

    // Calculate embodied presence from other factors
    state.embodiedPresence = this.calculateEmbodiedPresence(state);

    // Emit state change if significant
    if (state.tensionLevel > this.TENSION_THRESHOLD) {
      this.emit('high_tension_detected', state);
    }

    if (state.embodiedPresence < this.PRESENCE_THRESHOLD) {
      this.emit('presence_needed', state);
    }

    return state;
  }

  private detectTensionLevel(input: string): number {
    let tension = 0.3; // Baseline

    // Check for tension patterns
    for (const [category, patterns] of this.patternLibrary.entries()) {
      const weight = this.getCategoryWeight(category);
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          tension += weight;
          break; // Only count once per category
        }
      }
    }

    // Check for intensity markers
    if (input.includes('!!!') || input.includes('HELP') || /\b[A-Z]{4,}\b/.test(input)) {
      tension += 0.2;
    }

    // Check for rapid speech patterns (many short sentences)
    const sentences = input.split(/[.!?]/);
    if (sentences.length > 5 && sentences.some(s => s.length < 20)) {
      tension += 0.1;
    }

    return Math.min(tension, 1);
  }

  private getCategoryWeight(category: string): number {
    const weights: Record<string, number> = {
      tension: 0.15,
      rushing: 0.12,
      disconnection: 0.18,
      activation: 0.2,
      collapse: 0.15
    };
    return weights[category] || 0.1;
  }

  private locateTension(input: string): Map<string, number> {
    const locations = new Map<string, number>();

    // Default body scan
    locations.set('shoulders', 0.3);
    locations.set('jaw', 0.2);
    locations.set('chest', 0.25);
    locations.set('belly', 0.2);
    locations.set('back', 0.15);

    // Adjust based on patterns
    if (/head|think|mind|thoughts/i.test(input)) {
      locations.set('head', (locations.get('head') || 0.2) + 0.3);
      locations.set('jaw', locations.get('jaw')! + 0.1);
    }

    if (/heart|chest|breath|suffocating/i.test(input)) {
      locations.set('chest', locations.get('chest')! + 0.3);
    }

    if (/stomach|gut|belly|nausea/i.test(input)) {
      locations.set('belly', locations.get('belly')! + 0.3);
    }

    if (/shoulder|neck|tight|tense/i.test(input)) {
      locations.set('shoulders', locations.get('shoulders')! + 0.4);
      locations.set('neck', 0.5);
    }

    return locations;
  }

  private assessBreathDepth(input: string): number {
    let depth = 0.6; // Normal breathing

    if (/shallow|can't breathe|suffocating|tight/i.test(input)) {
      depth -= 0.3;
    }

    if (/deep breath|breathing deeply|calm/i.test(input)) {
      depth += 0.2;
    }

    if (/holding.*breath|forgot.*breathe/i.test(input)) {
      depth -= 0.4;
    }

    return Math.max(0.1, Math.min(1, depth));
  }

  private assessBreathRate(input: string): number {
    let rate = 0.5; // Normal rate

    if (/racing|fast|quick|hurry/i.test(input)) {
      rate += 0.3;
    }

    if (/slow|calm|peaceful|relaxed/i.test(input)) {
      rate -= 0.2;
    }

    if (/panic|hyperventilat|gasping/i.test(input)) {
      rate += 0.4;
    }

    return Math.max(0, Math.min(1, rate));
  }

  private assessGroundedness(input: string): number {
    let grounded = 0.5;

    if (/floating|disconnected|unreal|spacey|dizzy/i.test(input)) {
      grounded -= 0.3;
    }

    if (/grounded|solid|stable|centered|rooted/i.test(input)) {
      grounded += 0.3;
    }

    if (/spinning|scattered|all over|fragmented/i.test(input)) {
      grounded -= 0.2;
    }

    if (/present|here|now|aware|embodied/i.test(input)) {
      grounded += 0.2;
    }

    return Math.max(0, Math.min(1, grounded));
  }

  private assessOpenness(input: string): number {
    let openness = 0.5;

    if (/closed|shut down|protective|defensive|guarded/i.test(input)) {
      openness -= 0.3;
    }

    if (/open|receptive|curious|willing|available/i.test(input)) {
      openness += 0.3;
    }

    if (/rigid|fixed|stuck|tight/i.test(input)) {
      openness -= 0.2;
    }

    if (/flow|flexible|soft|allowing/i.test(input)) {
      openness += 0.2;
    }

    return Math.max(0, Math.min(1, openness));
  }

  private calculateEmbodiedPresence(state: SomaticState): number {
    // Weighted calculation of embodied presence
    const presence =
      (1 - state.tensionLevel) * 0.25 +
      state.breathDepth * 0.2 +
      (1 - Math.abs(state.breathRate - 0.5)) * 0.15 +
      state.groundedness * 0.25 +
      state.openness * 0.15;

    return Math.max(0, Math.min(1, presence));
  }

  /**
   * Generate appropriate invitation based on state
   */
  generateInvitation(state: SomaticState): string {
    let templateKey = 'gentle';

    if (state.tensionLevel > 0.8) {
      templateKey = 'high_tension';
    } else if (state.breathRate > 0.7) {
      templateKey = 'rushing';
    } else if (state.groundedness < 0.3) {
      templateKey = 'disconnection';
    } else if (state.tensionLevel > 0.6 && state.openness < 0.3) {
      templateKey = 'activation';
    } else if (state.embodiedPresence < 0.3) {
      templateKey = 'collapse';
    }

    const template = this.invitationTemplates.get(templateKey)!;
    return this.personalizeInvitation(template, state);
  }

  private personalizeInvitation(template: PresenceInvitation, state: SomaticState): string {
    const parts = [];

    // Always include primary
    parts.push(template.primary);

    // Add most relevant somatic guidance
    const maxTension = Math.max(...Array.from(state.tensionLocations.values()));
    const maxLocation = Array.from(state.tensionLocations.entries())
      .find(([_, value]) => value === maxTension)?.[0];

    if (maxLocation && maxTension > 0.5) {
      parts.push(template.somatic.replace('shoulders', maxLocation));
    } else {
      parts.push(template.somatic);
    }

    // Add breath guidance if needed
    if (state.breathDepth < 0.4 || Math.abs(state.breathRate - 0.5) > 0.3) {
      parts.push(template.breath);
    }

    // Add grounding if needed
    if (state.groundedness < 0.4) {
      parts.push(template.grounding);
    }

    // Always end with integration
    parts.push(template.integration);

    return parts.join(' ');
  }

  /**
   * Track presence shift after invitation
   */
  async trackPresenceShift(beforeState: SomaticState, afterInput: string): Promise<any> {
    const afterState = await this.assess(afterInput);

    const shift = {
      delta: afterState.embodiedPresence - beforeState.embodiedPresence,
      tensionReduction: beforeState.tensionLevel - afterState.tensionLevel,
      groundingIncrease: afterState.groundedness - beforeState.groundedness,
      openingIncrease: afterState.openness - beforeState.openness
    };

    this.emit('presence_shift', shift);

    return {
      successful: shift.delta > 0.1,
      shift,
      newState: afterState
    };
  }

  /**
   * Get baseline somatic state for new session
   */
  getBaselineState(): SomaticState {
    return {
      tensionLevel: 0.4,
      tensionLocations: new Map([
        ['shoulders', 0.3],
        ['jaw', 0.2],
        ['chest', 0.25],
        ['belly', 0.2],
        ['back', 0.15]
      ]),
      breathDepth: 0.6,
      breathRate: 0.5,
      groundedness: 0.6,
      embodiedPresence: 0.55,
      openness: 0.5
    };
  }
}